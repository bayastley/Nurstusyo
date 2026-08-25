import { useEffect } from "react";
import { JETON, getJeton, setCurrentTier, setJeton as persistJetonSecure, type Tier } from "../tier";
import { secureGet, secureSet, secureRemove } from "../secureStore";
import { isAdminEmail } from "../tier";
import { syncUserInDb } from "../components/adminHelpers";
import { fetchRemoteConfig } from "../services/adminSyncService";
import type { User } from "../types";

interface UseAuthSessionParams {
  notify: (message: string) => void;
  setUser: (value: User | null) => void;
  setAdminGodMode: (value: boolean) => void;
  setTier: (value: Tier) => void;
  setJetonCount: (value: number) => void;
  setLocalBanned: (value: boolean) => void;
  setLocalBanReason: (value: string) => void;
}

export function useAuthSession({
  notify,
  setUser,
  setAdminGodMode,
  setTier,
  setJetonCount,
  setLocalBanned,
  setLocalBanReason,
}: UseAuthSessionParams) {
  // Google OAuth PKCE dönüşü — code backend'de doğrulanır, sahte mail kabul edilmez.
  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    if (!code || !state) return;

    const storedState = sessionStorage.getItem("nur_google_state") || "";
    const verifier = sessionStorage.getItem("nur_google_pkce_verifier") || "";
    sessionStorage.removeItem("nur_google_state");
    sessionStorage.removeItem("nur_google_pkce_verifier");
    window.history.replaceState({}, "", window.location.pathname || "/");

    if (!storedState || storedState !== state || !verifier) {
      notify("⚠️ Google giriş oturumu doğrulanamadı. Lütfen tekrar deneyin.");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            codeVerifier: verifier,
            redirectUri: `${window.location.origin}/`,
          }),
        });
        const data = await response.json().catch(() => null) as {
          ok?: boolean;
          error?: string;
          user?: { id: string; email: string; name: string; verified: boolean; tier?: Tier; isAdmin?: boolean };
          wallet?: { subJeton: number; purchasedJeton: number; total: number } | null;
        } | null;
        if (cancelled) return;
        if (!response.ok || !data?.ok || !data.user?.email) {
          notify(data?.error || "Google girişi doğrulanamadı");
          return;
        }

        const email = data.user.email.trim().toLowerCase();
        const isKurucuAdmin = Boolean(data.user.isAdmin) || isAdminEmail(email);
        const newUser: User = {
          id: data.user.id,
          name: isKurucuAdmin ? "Ömer Kaya (Kurucu Admin)" : data.user.name || email.split("@")[0],
          email,
          phone: "",
          verified: true,
        };

        setUser(newUser);
        secureSet("nur_user_v1", newUser);

        if (isKurucuAdmin) {
          const adminJeton = Math.max(1000, data.wallet?.total ?? getJeton());
          setAdminGodMode(true);
          // ★ Admin olsa bile satın alınan tier'ı koru — sadece free ise elit yap
          const adminTier = (data.user.tier === "pro" || data.user.tier === "elit") ? data.user.tier : "elit";
          setTier(adminTier);
          setCurrentTier(adminTier);
          setJetonCount(adminJeton);
          persistJetonSecure(adminJeton);
          syncUserInDb(email, newUser.name, adminTier, adminJeton);
          notify(`🛡️ Google doğrulandı · Kurucu Admin · ${adminTier.toUpperCase()} modu`);
          return;
        }

        const dbTier = data.user.tier === "pro" || data.user.tier === "elit" ? data.user.tier : "free";
        setTier(dbTier);
        setCurrentTier(dbTier);
        let nextJeton = data.wallet?.total ?? getJeton();
        const bonusKey = `nur_google_register_bonus_${data.user.id}`;
        if (!localStorage.getItem(bonusKey)) {
          nextJeton += JETON.KAYIT_BONUSU_FREE;
          persistJetonSecure(nextJeton);
          setJetonCount(nextJeton);
          localStorage.setItem(bonusKey, "1");
          notify(`🎉 Google ile giriş başarılı · +${JETON.KAYIT_BONUSU_FREE} hak tanımlandı`);
        } else {
          notify("Google ile giriş başarılı · hoş geldiniz");
        }
        syncUserInDb(email, newUser.name, dbTier, nextJeton);
      } catch {
        if (!cancelled) notify("Google girişi sırasında bağlantı hatası oluştu");
      }
    })();

    return () => { cancelled = true; };
  }, [notify, setAdminGodMode, setJetonCount, setTier, setUser]);

  // Server-side oturum kontrolü: localStorage tek başına yetki sayılmaz.
  useEffect(() => {
    const stored = secureGet<string | null>("nur_user_v1", null);
    if (!stored) return;
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        if (cancelled) return;
        if (!response.ok) {
          setUser(null);
          secureRemove("nur_user_v1");
          setAdminGodMode(false);
          return;
        }
        const data = await response.json().catch(() => null) as {
          ok?: boolean;
          user?: { id: string; email: string; name: string; verified: boolean; isAdmin?: boolean; tier?: Tier };
          wallet?: { subJeton: number; purchasedJeton: number; total: number } | null;
          banned?: boolean;
          banReason?: string;
        } | null;
        if (!data?.ok || !data.user?.email) return;

        if (data.banned) {
          const serverReason = data.banReason || "Sistem Verilerini Kurcalama / Hak Manipülasyonu Girişimi";
          setUser(null);
          secureRemove("nur_user_v1");
          setAdminGodMode(false);
          setLocalBanned(true);
          setLocalBanReason(serverReason);
          secureSet("nur_local_user_banned", true);
          secureSet("nur_local_user_ban_reason", serverReason);
          return;
        }

        const verifiedUser: User = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          phone: "",
          verified: data.user.verified,
        };
        setUser(verifiedUser);
        secureSet("nur_user_v1", verifiedUser);
        const dbTier = data.user.tier === "pro" || data.user.tier === "elit" ? data.user.tier : "free";
        setTier(dbTier);
        setCurrentTier(dbTier);
        if (data.wallet) {
          setJetonCount(data.wallet.total);
          persistJetonSecure(data.wallet.total);
        }
        if (data.user.isAdmin) setAdminGodMode(true);
      } catch {
        // offline/dev durumda sessiz geç
      }
    })();
    return () => { cancelled = true; };
  }, [setAdminGodMode, setJetonCount, setLocalBanned, setLocalBanReason, setTier, setUser]);

  // Ücretsiz bulut senkronizasyonu (Gist / Raw Sync)
  useEffect(() => {
    fetchRemoteConfig().then((remoteCfg) => {
      if (!remoteCfg) return;
      const savedUser = secureGet<string | null>("nur_user_v1", null);
      if (!savedUser) return;
      try {
        const user = JSON.parse(savedUser) as User;
        const remoteUser = remoteCfg.users.find((x) => x.email.toLowerCase() === user.email.toLowerCase());
        if (!remoteUser) return;
        setTier(remoteUser.tier);
        setCurrentTier(remoteUser.tier);
        setJetonCount(remoteUser.jeton);
        persistJetonSecure(remoteUser.jeton);
      } catch {
        // ignore remote sync errors
      }
    });
  }, [setJetonCount, setTier]);
}