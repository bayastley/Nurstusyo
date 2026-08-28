import { useEffect } from "react";
import type { User } from "../types";
import { getCurrentTier, setCurrentTier, type Tier } from "../tier";

interface UsePaymentFlowOptions {
  setUser: (u: User | null) => void;
  setTier: (t: Tier) => void;
  syncWallet: () => Promise<void>;
}

export function usePaymentFlow({ setUser, setTier, syncWallet }: UsePaymentFlowOptions) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const odeme = params.get("odeme");
    if (odeme === "basarili") {
      const verifyOrderId = params.get("orderId");
      const verifyProductCode = params.get("productCode");
      window.history.replaceState({}, "", window.location.pathname);

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
            console.log("[payment] verify sonucu:", d);
          } catch (e) { console.error("[payment] verify hatasi:", e); }
        }

        // 2. Tier ve kullanici bilgisini yenile
        try {
          const meRes = await fetch("/api/auth/me", { credentials: "include" });
          const me = await meRes.json().catch(() => null);
          if (me?.user) {
            setUser(me.user);
            // Tier'i auth/me'den gelen deger ile guncelle
            const dbTier = me.user.tier;
            if (dbTier && (dbTier === "pro" || dbTier === "elit" || dbTier === "free")) {
              const currentTier = getCurrentTier();
              if (dbTier !== currentTier) {
                setTier(dbTier);
                setCurrentTier(dbTier);
                console.log("[payment] Tier guncellendi:", dbTier);
              }
            }
          }
        } catch {}

        // 3. Cuzdani yenile
        await syncWallet();
        setTimeout(() => syncWallet(), 2000);
        setTimeout(() => syncWallet(), 5000);
        setTimeout(() => syncWallet(), 10000);
        console.log("[payment] Cuzdan senkronize edildi");
      };
      doVerifyAndSync();
    } else if (odeme === "hata") {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [setUser, setTier, syncWallet]);
}
