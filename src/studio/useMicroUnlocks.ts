import { translate } from "../i18n";
// ★ 26.10 I18N KÖPRÜSÜ: oturumun dilini her çağrıda okur
const ttX2610 = (k: string): string => translate(typeof localStorage !== "undefined" ? (localStorage.getItem("nur_lang") || "tr") : "tr", k);
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
      notify(ttX2610("uxAcildi").replace("{x}", String(featureLabel)));
      return true;
    }
    notify(ttX2610("uxHakki").replace("{x}", String(featureLabel)).replace("{n}", String(jetonCount)));
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
      notify(ttX2610("uxTamAcildi"));
      return true;
    }
    notify(ttX2610("uxTamGerekli").replace("{n}", String(jetonCount)));
    openPremium("jeton");
    return false;
  }, [isMasterSürüm, jetonCount, notify, openPremium, setJetonCount, tier]);

  return { tryUnlockElitFeature, tryUnlockFullMode };
}