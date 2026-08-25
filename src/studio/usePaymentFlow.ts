import { useEffect } from "react";
import type { User } from "../types";

interface UsePaymentFlowOptions {
  setUser: (u: User | null) => void;
  syncWallet: () => Promise<void>;
}

export function usePaymentFlow({ setUser, syncWallet }: UsePaymentFlowOptions) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const odeme = params.get("odeme");
    if (odeme === "basarili") {
      // ★ URL parametrelerini AL, sonra temizle
      const verifyOrderId = params.get("orderId");
      const verifyProductCode = params.get("productCode");
      window.history.replaceState({}, "", window.location.pathname);

      // ★ Önce verify, sonra cüzdanı yenile
      //   NOT: Local storage'dan kullanıcı kontrolü YAPMIYORUZ — redirect sonrası secureStore
      //   henüz dolmamış olabilir. Verify/auth/me/wallet endpoint'leri kendi session'ını kontrol eder.
      const doVerifyAndSync = async () => {
        // 1. Verify
        if (verifyOrderId && verifyProductCode) {
          try {
            const res = await fetch("/api/payments/verify", {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: verifyOrderId, productCode: verifyProductCode }),
            });
            const d = await res.json().catch(() => null);
            console.log('[payment] verify sonucu:', d);
          } catch (e) { console.error('[payment] verify hatası:', e); }
        }

        // 2. Tier ve kullanıcı bilgisini yenile
        try {
          const meRes = await fetch("/api/auth/me", { credentials: "include" });
          const me = await meRes.json().catch(() => null);
          if (me?.user) setUser(me.user);
        } catch {}

        // 3. Cüzdanı yenile — Supabase yazmasını bekle
        await syncWallet();
        setTimeout(() => syncWallet(), 2000);
        setTimeout(() => syncWallet(), 5000);
        setTimeout(() => syncWallet(), 10000);
        console.log('[payment] Cüzdan senkronize edildi');
      };
      doVerifyAndSync();
    } else if (odeme === "hata") {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [setUser, syncWallet]);
}
