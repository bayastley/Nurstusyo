import { useState, useEffect, useCallback } from "react";
import {
  getCurrentTier, getJeton, setJeton as persistJetonSecure,
  addPurchasedJeton, addDailySubJeton,
  jetonTavani, JETON,
} from "../tier";
import { secureGet, secureSet } from "../secureStore";
import { serverDateISO, serverIsFriday, isDeviceClockTampered, syncServerTime } from "../serverTime";

export type VideoKind = "kisa" | "uzun" | "tam";

interface UseWalletReturn {
  jetonCount: number;
  setJetonCount: (n: number) => void;
  syncWallet: () => Promise<void>;
  consumeRight: (kind: VideoKind) => void;
}

export function useWallet(notify: (msg: string) => void): UseWalletReturn {
  const [jetonCount, setJetonCount] = useState<number>(() => {
    try {
      // ★ Kullanıcı giriş yapmadıysa jetonCount 0 olmalı
      const user = secureGet<{ id?: string } | null>("nur_user_v1", null);
      if (!user?.id) return 0;
      return Number(secureGet<number>("nur_jeton", 0));
    } catch { return 0; }
  });

  // ★ Supabase'den cüzdan bilgisini çek → secureStore'a yaz + jetonCount'u güncelle
  //   NOT: Local storage'dan kullanıcı kontrolü YAPMIYORUZ — redirect sonrası secureStore
  //   henüz dolmamış olabilir. Sunucu kendi session cookie'sinden kontrol eder (401 döner).
  const syncWallet = useCallback(async () => {
    try {
      const res = await fetch("/api/payments/wallet", { credentials: "include" });
      if (!res.ok) return; // 401 = giriş yapılmamış, sunucu zaten döndü
      const data = await res.json();
      if (data?.ok && data.wallet) {
        const rights = {
          kisa: data.wallet.kisa || 0,
          uzun: data.wallet.uzun || 0,
          tam: data.wallet.tam || 0,
        };
        secureSet("nur_pack_rights_v1", rights);
        // ★ Toplam hakkı hesapla ve jetonCount'u HER ZAMAN güncelle
        //    Eski localStorage verisi varsa bile sunucudaki gerçek veriyle değiştir
        const totalRights = rights.kisa + rights.uzun + rights.tam;
        persistJetonSecure(totalRights);
        setJetonCount(totalRights);
        console.log("[sync] Cüzdan senkronize:", rights, "toplam:", totalRights);
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

  // ★ Hak düşürme — video üretildiğinde ilgili türden hak azalt
  const consumeRight = useCallback((kind: VideoKind) => {
    // 1. Local state'i güncelle
    const current = secureGet<Record<string, number> | null>("nur_pack_rights_v1", null) ?? { kisa: 0, uzun: 0, tam: 0 };
    const newVal = Math.max(0, (current[kind] || 0) - 1);
    const updated = { ...current, [kind]: newVal };
    secureSet("nur_pack_rights_v1", updated);
    // 2. Toplam jetonCount'u güncelle
    const total = (updated.kisa || 0) + (updated.uzun || 0) + (updated.tam || 0);
    persistJetonSecure(total);
    setJetonCount(total);
    // 3. Supabase'e yaz (fire-and-forget)
    fetch("/api/payments/wallet-consume", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind }),
    }).catch(() => undefined);
    console.log("[wallet] Hak düşürüldü:", kind, "kalan:", newVal, "toplam:", total);
  }, []);

  return {
    jetonCount,
    setJetonCount,
    syncWallet,
    consumeRight,
  };
}
