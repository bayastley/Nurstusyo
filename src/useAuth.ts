import { useState, useEffect, useCallback } from "react";
import { isAdminEmail, ADMIN_SECRET_PATH, setCurrentTier, type Tier } from "../tier";
import { secureGet, secureSet, secureRemove } from "../secureStore";
import { syncUserInDb } from "../components/adminHelpers";
import type { User, LoginTab } from "../types";

interface UseAuthOptions {
  isMasterSürüm: boolean;
  isDevMaster: boolean;
  notify: (msg: string) => void;
}

interface UseAuthReturn {
  user: User | null;
  setUser: (u: User | null) => void;
  loginTab: LoginTab;
  setLoginTab: (tab: LoginTab) => void;
  phone: string;
  setPhone: (p: string) => void;
  verifyCode: string;
  setVerifyCode: (c: string) => void;
  sentCode: string;
  setSentCode: (c: string) => void;
  adminGodMode: boolean;
  setAdminGodMode: (v: boolean) => void;
  serverAdminVerified: boolean;
  setServerAdminVerified: (v: boolean) => void;
  adminEmailInput: string;
  setAdminEmailInput: (v: string) => void;
  adminCodeInput: string;
  setAdminCodeInput: (v: string) => void;
  adminError: string | null;
  setAdminError: (v: string | null) => void;
  adminAuthOpen: boolean;
  setAdminAuthOpen: (v: boolean) => void;
  openAdminDashboard: () => Promise<void>;
}

export function useAuth({ isMasterSürüm, isDevMaster, notify }: UseAuthOptions): UseAuthReturn {
  const [user, setUser] = useState<User | null>(() => {
    try { return secureGet<User | null>("nur_user_v1", null); } catch { return null; }
  });

  const [loginTab, setLoginTab] = useState<LoginTab>("login");
  const [phone, setPhone] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [sentCode, setSentCode] = useState("");
  const [adminGodMode, setAdminGodMode] = useState(false);
  const [serverAdminVerified, setServerAdminVerified] = useState(false);
  const [adminEmailInput, setAdminEmailInput] = useState("");
  const [adminCodeInput, setAdminCodeInput] = useState("");
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminAuthOpen, setAdminAuthOpen] = useState(false);

  // ★ Google OAuth PKCE dönüşü — code backend'de doğrulanır
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
          wallet?: { subJeton: number; purchasedJeton: number; kisa?: number; uzun?: number; tam?: number; total: number } | null;
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
          tier: (data.user.tier === "pro" || data.user.tier === "elit") ? data.user.tier : "free",
          isAdmin: isKurucuAdmin,
        };

        setUser(newUser);
        secureSet("nur_user_v1", newUser);

        // Cüzdan bilgisini secureStore'a yaz
        if (data.wallet) {
          secureSet("nur_pack_rights_v1", {
            kisa: data.wallet.kisa ?? 0,
            uzun: data.wallet.uzun ?? 0,
            tam: data.wallet.tam ?? 0,
          });
        }

        if (isKurucuAdmin) {
          const adminTier = (data.user.tier === "pro" || data.user.tier === "elit") ? data.user.tier : "elit";
          setCurrentTier(adminTier);
          notify(`🛡️ Google doğrulandı · Kurucu Admin · ${adminTier.toUpperCase()} modu`);
          return;
        }

        const dbTier = data.user.tier === "pro" || data.user.tier === "elit" ? data.user.tier : "free";
        setCurrentTier(dbTier);
        notify("Google ile giriş başarılı · hoş geldiniz");
      } catch {
        if (!cancelled) notify("Google girişi sırasında bağlantı hatası oluştu");
      }
    })();

    return () => { cancelled = true; };
  }, [notify]);

  // ★ Server-side oturum kontrolü
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
          wallet?: { subJeton: number; purchasedJeton: number; kisa?: number; uzun?: number; tam?: number; total: number } | null;
          banned?: boolean;
          banReason?: string;
        } | null;
        if (!data?.ok || !data.user?.email) return;

        if (data.banned) {
          setUser(null);
          secureRemove("nur_user_v1");
          setAdminGodMode(false);
          return;
        }

        const verifiedUser: User = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          phone: "",
          verified: data.user.verified,
          tier: (data.user.tier === "pro" || data.user.tier === "elit") ? data.user.tier : "free",
        };
        setUser(verifiedUser);
        secureSet("nur_user_v1", verifiedUser);

        // Cüzdan bilgisini secureStore'a yaz
        if (data.wallet) {
          secureSet("nur_pack_rights_v1", {
            kisa: data.wallet.kisa ?? 0,
            uzun: data.wallet.uzun ?? 0,
            tam: data.wallet.tam ?? 0,
          });
        }

        const dbTier = data.user.tier === "pro" || data.user.tier === "elit" ? data.user.tier : "free";
        setCurrentTier(dbTier);

        if (data.user.isAdmin) setAdminGodMode(true);
      } catch { /* offline/dev durumda sessiz geç */ }
    })();
    return () => { cancelled = true; };
  }, []);

  // ★ Admin session kontrolü
  const openAdminDashboard = useCallback(async () => {
    if (isDevMaster) {
      return;
    }

    try {
      const response = await fetch("/api/admin/session", { cache: "no-store" });
      if (response.ok) {
        setServerAdminVerified(true);
        setAdminGodMode(true);
        return;
      }
    } catch { /* ignore */ }

    setAdminAuthOpen(true);
    notify("Admin paneli için doğrulanmış Google admin oturumu gerekli");
  }, [isDevMaster, notify]);

  return {
    user, setUser,
    loginTab, setLoginTab,
    phone, setPhone,
    verifyCode, setVerifyCode,
    sentCode, setSentCode,
    adminGodMode, setAdminGodMode,
    serverAdminVerified, setServerAdminVerified,
    adminEmailInput, setAdminEmailInput,
    adminCodeInput, setAdminCodeInput,
    adminError, setAdminError,
    adminAuthOpen, setAdminAuthOpen,
    openAdminDashboard,
  };
}
