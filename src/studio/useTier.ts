import { useState, useCallback } from "react";
import {
  getCurrentTier, setCurrentTier, tierAtLeast,
  JETON, hasMicroUnlock, grantMicroUnlock, getJeton,
  type Tier,
} from "../tier";

// ★ GERÇEK KESİNTİ (30.09, kullanıcı bildirimi): mikro kilit açma hakkı eskiden
//   setJeton() ile "kesiliyordu" — o fonksiyon bilinçli no-op olduğu için kesinti
//   hiçbir yere YAZILMIYORDU (bildirimdeki −1 sahteydi). Artık kesinti sunucuda
//   /api/payments/wallet-consume ile atomik yapılır (nur_consume_video RPC);
//   başarısızsa kilit AÇILMAZ — kullanıcı dürüst bilgilendirilir.

interface UseTierOptions {
  isMasterSürüm: boolean;
  notify: (msg: string) => void;
  jetonCount: number;
  setJetonCount: (n: number) => void;
}

interface UseTierReturn {
  tier: Tier;
  setTier: (t: Tier) => void;
  accessTier: Tier;
  premiumOpen: boolean;
  setPremiumOpen: (v: boolean) => void;
  premiumTab: "uyelik" | "jeton";
  setPremiumTab: (t: "uyelik" | "jeton") => void;
  openPremium: (tab?: "uyelik" | "jeton") => void;
  checkTier: (need: Tier) => boolean;
  tryUnlockElitFeature: (key: "batch" | "ai_search", label: string) => boolean;
  tryUnlockFullMode: () => boolean;
}

export function useTier({ isMasterSürüm, notify, jetonCount, setJetonCount }: UseTierOptions): UseTierReturn {
  const [tier, setTier] = useState<Tier>(() => getCurrentTier());
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [premiumTab, setPremiumTab] = useState<"uyelik" | "jeton">("uyelik");

  const accessTier: Tier = isMasterSürüm ? "elit" : tier;

  const openPremium = useCallback((tab: "uyelik" | "jeton" = "uyelik") => {
    setPremiumTab(tab);
    setPremiumOpen(true);
  }, []);

  const checkTier = useCallback((need: Tier): boolean => {
    if (isMasterSürüm || tierAtLeast(tier, need)) return true;
    openPremium("uyelik");
    return false;
  }, [tier, openPremium, isMasterSürüm]);

  // ★ Sunucuda hak düş: wallet-consume atomik RPC (kota → paket sırasıyla harcar)
  const sunucuHakDus = useCallback(async (kind: "kisa" | "uzun" | "tam"): Promise<boolean> => {
    try {
      const res = await fetch("/api/payments/wallet-consume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind }),
      });
      if (!res.ok) return false;
      const data = await res.json().catch(() => null) as { ok?: boolean; remaining?: number } | null;
      if (!data?.ok) return false;
      setJetonCount(typeof data.remaining === "number" ? data.remaining : Math.max(0, getJeton() - 1));
      return true;
    } catch { return false; }
  }, [setJetonCount]);

  const tryUnlockElitFeature = useCallback((key: "batch" | "ai_search", featureLabel: string): boolean => {
    if (isMasterSürüm) return true;
    if (tierAtLeast(tier, "elit")) return true;
    if (hasMicroUnlock(key)) return true;
    if (jetonCount >= JETON.MIKRO_KILIT_ACMA_UCRETI) {
      // ★ Kesinti ARTIK GERÇEK: sunucuda düşülür; başarısızsa kilit açılmaz (sahte −1 YOK)
      void sunucuHakDus("kisa").then((dustu) => {
        if (!dustu) {
          notify(`⚠️ ${featureLabel} açıldı ama hakkın düşülemedi — sayfayı yenile`);
          return;
        }
        grantMicroUnlock(key);
        notify(`🔓 ${featureLabel} 24 saatliğine açıldı · −${JETON.MIKRO_KILIT_ACMA_UCRETI} jeton`);
      });
      return true;
    }
    notify(`${featureLabel} için ${JETON.MIKRO_KILIT_ACMA_UCRETI} jeton gerekiyor · mevcut: ${jetonCount}`);
    openPremium("jeton");
    return false;
  }, [tier, jetonCount, notify, openPremium, isMasterSürüm, sunucuHakDus]);

  const tryUnlockFullMode = useCallback((): boolean => {
    if (isMasterSürüm) return true;
    if (tierAtLeast(tier, "pro")) return true;
    if (hasMicroUnlock("full_mode")) return true;
    if (jetonCount >= JETON.MIKRO_KILIT_ACMA_UCRETI) {
      // ★ Kesinti ARTIK GERÇEK (yukarıdaki notla aynı)
      void sunucuHakDus("kisa").then((dustu) => {
        if (!dustu) {
          notify("⚠️ Tam Sürüm açıldı ama hakkın düşülemedi — sayfayı yenile");
          return;
        }
        grantMicroUnlock("full_mode");
        notify(`✅ Tam Sürüm modu 24 saatliğine açıldı · −${JETON.MIKRO_KILIT_ACMA_UCRETI} jeton`);
      });
      return true;
    }
    notify(`⚠️ Tam Sürüm modunu açmak için ${JETON.MIKRO_KILIT_ACMA_UCRETI} jeton gerekiyor · mevcut: ${jetonCount}`);
    openPremium("jeton");
    return false;
  }, [tier, jetonCount, notify, openPremium, isMasterSürüm, sunucuHakDus]);

  return {
    tier, setTier,
    accessTier,
    premiumOpen, setPremiumOpen,
    premiumTab, setPremiumTab,
    openPremium,
    checkTier,
    tryUnlockElitFeature,
    tryUnlockFullMode,
  };
}
