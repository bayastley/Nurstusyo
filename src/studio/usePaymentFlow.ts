import { useEffect } from "react";
import { secureGet } from "../secureStore";
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
      const doVerifyAndSync = async () => {
        try {
          const u = secureGet<{ id?: string } | null>("nur_user_v1", null);
          if (u?.id && verifyOrderId && verifyProductCode) {
            const res = await fetch("/api/payments/verify", {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: verifyOrderId, productCode: verifyProductCode }),
            });
            const d = await res.json().catch(() => null);
            console.log('[payment] verify sonucu:', d);
          }
        } catch (e) { console.error('[payment] verify hatası:', e); }

        // ★ Tier ve kullanıcı bilgisini yenile
        try {
          const meRes = await fetch("/api/auth/me", { credentials: "include" });
          const me = await meRes.json().catch(() => null);
          if (me?.user) setUser(me.user);
        } catch {}

        // ★ Cüzdanı yenile — 1sn, 3sn, 6sn sonra (Supabase yazmasını bekler)
        await syncWallet();
        setTimeout(() => syncWallet(), 1500);
        setTimeout(() => syncWallet(), 3500);
        setTimeout(() => syncWallet(), 7000);
        console.log('[payment] Cüzdan senkronize edildi');
      };
      doVerifyAndSync();
    } else if (odeme === "hata") {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [setUser, syncWallet]);
}
