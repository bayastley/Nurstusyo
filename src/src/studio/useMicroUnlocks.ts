import { useCallback, useState } from "react";
import {
  JETON,
  getJeton,
  grantMicroUnlock,
  hasMicroUnlock,
  setJeton as persistJetonSecure,
  tierAtLeast,
  type MicroUnlockKey,
  type Tier,
} from "../tier";

interface UseMicroUnlocksParams {
  tier: Tier;
  jetonCount: number;
  isMasterSürüm: boolean;
  setJetonCount: (value: number) => void;
  notify: (message: string) => void;
  openPremium: (tab?: "uyelik" | "jeton") => void;
}

export function useMicroUnlocks({
  tier,
  jetonCount,
  isMasterSürüm,
  setJetonCount,
  notify,
  openPremium,
}: UseMicroUnlocksParams) {
  const [, setMicroUnlockTick] = useState(0);

  const tryUnlockElitFeature = useCallback((key: "batch" | "ai_search", featureLabel: string): boolean => {
    if (isMasterSürüm) return true;
    if (tierAtLeast(tier, "elit")) return true;
    if (hasMicroUnlock(key)) return true;
    if (jetonCount >= JETON.MIKRO_KILIT_ACMA_UCRETI) {
      const remaining = Math.max(0, getJeton() - JETON.MIKRO_KILIT_ACMA_UCRETI);
      persistJetonSecure(remaining);
      setJetonCount(remaining);
      grantMicroUnlock(key);
      setMicroUnlockTick((n) => n + 1);
      notify(`🔓 ${featureLabel} 24 saatliğine açıldı`);
      return true;
    }
    notify(`${featureLabel} için geçici açma hakkı gerekiyor · mevcut: ${jetonCount}`);
    openPremium("jeton");
    return false;
  }, [isMasterSürüm, jetonCount, notify, openPremium, setJetonCount, tier]);

  const tryUnlockFullMode = useCallback((): boolean => {
    const key: MicroUnlockKey = "full_mode";
    if (isMasterSürüm) return true;
    if (tierAtLeast(tier, "pro")) return true;
    if (hasMicroUnlock(key)) return true;
    if (jetonCount >= JETON.MIKRO_KILIT_ACMA_UCRETI) {
      const remaining = Math.max(0, getJeton() - JETON.MIKRO_KILIT_ACMA_UCRETI);
      persistJetonSecure(remaining);
      setJetonCount(remaining);
      grantMicroUnlock(key);
      setMicroUnlockTick((n) => n + 1);
      notify("✅ Tam Sürüm modu 24 saatliğine açıldı");
      return true;
    }
    notify(`⚠️ Tam Sürüm modunu 24 saatliğine açmak için geçici açma hakkı gerekiyor · mevcut: ${jetonCount}`);
    openPremium("jeton");
    return false;
  }, [isMasterSürüm, jetonCount, notify, openPremium, setJetonCount, tier]);

  return { tryUnlockElitFeature, tryUnlockFullMode };
}