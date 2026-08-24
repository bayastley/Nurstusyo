import { useEffect } from "react";
import { secureGet } from "../secureStore";
import type { User } from "../types";

interface UsePaymentFlowOptions {
  setUser: (u: User | null) => void;
}

export function usePaymentFlow({ setUser }: UsePaymentFlowOptions) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const odeme = params.get("odeme");
    if (odeme === "basarili") {
      window.history.replaceState({}, "", window.location.pathname);
      try {
        const u = secureGet<{ id?: string } | null>("nur_user_v1", null);
        const verifyOrderId = params.get("orderId");
        const verifyProductCode = params.get("productCode");
        if (u?.id && verifyOrderId && verifyProductCode) {
          fetch("/api/payments/verify", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: verifyOrderId, productCode: verifyProductCode }),
          }).then(r => r.json()).then(d => {
            if (d.ok) {
              // Tier ve cüzdanı tazele
              fetch("/api/auth/me", { credentials: "include" })
                .then(r => r.json())
                .then(me => { if (me?.user) setUser(me.user); })
                .catch(() => {});
            }
          }).catch(() => {});
        }
      } catch {}
    } else if (odeme === "hata") {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [setUser]);
}
