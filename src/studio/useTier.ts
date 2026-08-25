import { useState, useCallback } from "react";
import {
  getCurrentTier, setCurrentTier, tierAtLeast,
  JETON, hasMicroUnlock, grantMicroUnlock, getJeton,
  setJeton as persistJetonSecure,
  type Tier,
} from "../tier";

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

  const tryUnlockElitFeature = useCallback((key: "batch" | "ai_search", featureLabel: string): boolean => {
    if (isMasterSürüm) return true;
    if (tierAtLeast(tier, "elit")) return true;
    if (hasMicroUnlock(key)) return true;
    if (jetonCount >= JETON.MIKRO_KILIT_ACMA_UCRETI) {
      const remaining = Math.max(0, getJeton() - JETON.MIKRO_KILIT_ACMA_UCRETI);
      persistJetonSecure(remaining);
      setJetonCount(remaining);
      grantMicroUnlock(key);
      notify(`🔓 ${featureLabel} 24 saatliğine açıldı · −${JETON.MIKRO_KILIT_ACMA_UCRETI} jeton`);
      return true;
    }
    notify(`${featureLabel} için ${JETON.MIKRO_KILIT_ACMA_UCRETI} jeton gerekiyor · mevcut: ${jetonCount}`);
    openPremium("jeton");
    return false;
  }, [tier, jetonCount, notify, openPremium, isMasterSürüm, setJetonCount]);

  const tryUnlockFullMode = useCallback((): boolean => {
    if (isMasterSürüm) return true;
    if (tierAtLeast(tier, "pro")) return true;
    if (hasMicroUnlock("full_mode")) return true;
    if (jetonCount >= JETON.MIKRO_KILIT_ACMA_UCRETI) {
      const remaining = Math.max(0, getJeton() - JETON.MIKRO_KILIT_ACMA_UCRETI);
      persistJetonSecure(remaining);
      setJetonCount(remaining);
      grantMicroUnlock("full_mode");
      notify(`✅ Tam Sürüm modu 24 saatliğine açıldı · −${JETON.MIKRO_KILIT_ACMA_UCRETI} jeton`);
      return true;
    }
    notify(`⚠️ Tam Sürüm modunu açmak için ${JETON.MIKRO_KILIT_ACMA_UCRETI} jeton gerekiyor · mevcut: ${jetonCount}`);
    openPremium("jeton");
    return false;
  }, [tier, jetonCount, notify, openPremium, isMasterSürüm, setJetonCount]);

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
