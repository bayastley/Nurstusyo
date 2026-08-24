import { useState, useEffect, useCallback } from "react";
import {
  getCurrentTier, getJeton, setJeton as persistJetonSecure,
  addPurchasedJeton, addDailySubJeton,
  jetonTavani, JETON,
} from "../tier";
import { secureGet, secureSet } from "../secureStore";
import { serverDateISO, serverIsFriday, isDeviceClockTampered, syncServerTime } from "../serverTime";

interface UseWalletReturn {
  jetonCount: number;
  setJetonCount: (n: number) => void;
  syncWallet: () => Promise<void>;
}

export function useWallet(notify: (msg: string) => void): UseWalletReturn {
  const [jetonCount, setJetonCount] = useState<number>(() => {
    try { return Number(secureGet<number>("nur_jeton", 0)); } catch { return 0; }
  });

  // ★ Supabase'den cüzdan bilgisini çek → secureStore'a yaz
  const syncWallet = useCallback(async () => {
    try {
      const u = secureGet<{ id?: string } | null>("nur_user_v1", null);
      if (!u?.id) return;
      const res = await fetch("/api/payments/wallet", { credentials: "include" });
      const data = await res.json();
      if (data?.ok && data.wallet) {
        const rights = {
          kisa: data.wallet.kisa || 0,
          uzun: data.wallet.uzun || 0,
          tam: data.wallet.tam || 0,
        };
        secureSet("nur_pack_rights_v1", rights);
        console.log("[sync] Cüzdan senkronize:", rights);
      }
    } catch {}
  }, []);

  useEffect(() => {
    syncWallet();
    const iv = setInterval(syncWallet, 30000);
    return () => clearInterval(iv);
  }, [syncWallet]);

  // ★ Günlük bonus + Cuma bonusları
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await syncServerTime().catch(() => undefined);
      if (cancelled) return;

      const today = serverDateISO();
      if (localStorage.getItem("nur_daily_bonus_date") === today) return;

      if (isDeviceClockTampered()) {
        notify("⚠️ Sistem saatiniz gerçek zamanla uyuşmuyor. Günlük bonus askıya alındı.");
        return;
      }

      // Tier'ı localStorage'dan oku (useTier henüz çağrılmamış olabilir)
      const tier = getCurrentTier();
      const ramadan = localStorage.getItem("nur_ramadan_mode") === "1";
      const kadirGecesi = localStorage.getItem("nur_kadir_gecesi_mode") === "1";
      const base = tier === "free" ? (ramadan ? JETON.DAILY_FREE_RAMADAN : JETON.DAILY_FREE) : tier === "pro" ? (ramadan ? JETON.DAILY_PRO_RAMADAN : JETON.DAILY_PRO) : (ramadan ? JETON.DAILY_ELIT_RAMADAN : JETON.DAILY_ELIT);
      const cap = jetonTavani(tier, ramadan);

      addDailySubJeton(base, cap);

      const friday = serverIsFriday() ? JETON.CUMA_BONUS : 0;
      const kadirBonus = kadirGecesi ? JETON.KADIR_GECESI : 0;
      if (friday > 0 || kadirBonus > 0) {
        addPurchasedJeton(friday + kadirBonus);
        if (friday) notify(`🕌 Cuma bonusu: +${friday} jeton (tavan dışı)`);
        if (kadirBonus) notify(`✨ Kadir Gecesi bonusu: +${kadirBonus} jeton (tavan dışı)`);
      }

      setJetonCount(getJeton());
      localStorage.setItem("nur_daily_bonus_date", today);
    })();
    return () => { cancelled = true; };
  }, [notify]);

  return {
    jetonCount,
    setJetonCount,
    syncWallet,
  };
}
