import { useState, useEffect, useCallback } from "react";
import { isAdminEmail, ADMIN_SECRET_PATH, setCurrentTier, denemeyiSunucuyaSenkronla, type Tier } from "../tier";
import { secureGet, secureSet, secureRemove } from "../secureStore";
import { syncUserInDb } from "../components/adminHelpers";
import type { User, LoginTab } from "../types";

/** ★ Son doğrulanmış admin e-postasını okur (listeye göre filtreli — liste dışına düşen admin akışı görmez). */
export function adminSonEmailOku(): string | null {
  try {
    const kayit = localStorage.getItem("nur_admin_son_email");
    if (!kayit) return null;
    return isAdminEmail(kayit) ? kayit : null;
  } catch { return null; }
}

interface UseAuthOptions {
  isMasterSürüm: boolean;
  isDevMaster: boolean;
  notify: (msg: string) => void;
}

/** ★ TIER ÇİPİ DÜZELTMESİ (08.10, kullanıcı bildirimi: "PRO aldim ücretsiz görünüyor"):
 *  useAuth setCurrentTier ile secureStore'a yazıyordu ama React state'ini güncellemiyordu —
 *  üst bar çipi eski "Ücretsiz"te takılı kalıyordu. Hook sırası gereği useAuth, useTier'dan
 *  ÖNCE kurulduğu için setter parametreyle geçilemez; event köprüsü kullanılır:
 *  StudioApp bu event'i dinler, setTier'ı çağırır. */
export function tierStateGuncelle(t: Tier): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("nur_tier_state", { detail: t }));
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
  /** ★ "ADMIN OLARAK GERİ DÖN" (30.09): son doğrulanmış admin e-postası
   *  (localStorage kalıcı). Yalnız NUR_ADMIN_EMAILS listesindekini döner,
   *  yoksa null — normal kullanıcılar bu akışı ASLA görmez. */
  adminSonEmail: string | null;
  /** ★ Hatırlama bilgisini elle tazelemek için (handleLogout çağırıyor) */
  setAdminSonEmail: (email: string | null) => void;
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

  // ★ ADMIN OLARAK GERİ DÖN (30.09): doğrulanmış admin e-postasını kalıcı sakla.
  //   secureStore şifreli/kiralamalı olduğu için düz localStorage kullanıyoruz —
  //   değer zaten PUBLIC bilgi değil ama gizli de değil (Google profili); kritik
  //   olan bunun YETKİ değil YALNIZCA HATIRLAMA bilgisi olması: bu e-posta ile
  //   geri dönmek yine tam sunucu zincirinden (HMAC → env whitelist → DB is_admin)
  //   geçmek zorunda. Okuma anında listeye göre filtrelenir — listeden çıkarılan
  //   admin akışı bir daha görmez.
  const [adminSonEmail, setAdminSonEmail] = useState<string | null>(adminSonEmailOku);

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
          trialStarted?: boolean;
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
          // ★ Admin doğrulandı → son admin e-postasını kaydet ("admin olarak geri dön" akışı için)
          try { localStorage.setItem("nur_admin_son_email", email); } catch { /* ignore */ }
          setAdminSonEmail(email);
          const adminTier = (data.user.tier === "pro" || data.user.tier === "elit") ? data.user.tier : "elit";
          setCurrentTier(adminTier);
          tierStateGuncelle(adminTier); // ★ React state köprüsü — üst bar çipi doğru üyeliği göstersin
          notify(`🛡️ Google doğrulandı · Kurucu Admin · ${adminTier.toUpperCase()} modu`);
          return;
        }

        const dbTier = data.user.tier === "pro" || data.user.tier === "elit" ? data.user.tier : "free";
        setCurrentTier(dbTier);
        tierStateGuncelle(dbTier); // ★ Çip senkronu
        // ★ DENEME SENKRONU (07.10): her Google girişinde sunucudaki gerçek deneme
        //   durumu yerel önbelleğe yazılır — Google kayıtlı kullanıcıda 7 gün PRO
        //   denemesi artık sunucuda otomatik başlatıldığı için arayüz onu okur.
        //   Idempotenttir: sunucu otoritesinden eski başlangıç ezilir, uzatma imkânsız.
        //   (Bu dosya AKTİF Google akışıdır; studio/useAuthSession.ts ölü kopyadır.)
        if (data.trialStarted) {
          try {
            localStorage.setItem("nur_trial_start", String(Date.now()));
          } catch { /* storage kapalıysa sunucu otoritesi yeterli */ }
        }
        void denemeyiSunucuyaSenkronla();
        notify("Google ile giriş başarılı · hoş geldiniz");
      } catch {
        if (!cancelled) notify("Google girişi sırasında bağlantı hatası oluştu");
      }
    })();

    return () => { cancelled = true; };
  }, [notify]);

  // ★ Server-side oturum kontrolü — HER yüklemede çalışır.
  // localStorage boş olsa bile /api/auth/me çağrılır: HttpOnly cookie 7 gün
  // geçerli olduğu için tarayıcı verisi temizlense bile oturum geri yüklenir.
  // (Eskiden localStorage yoksa istek hiç atılmıyordu → kullanıcı her
  // yenilemede tekrar giriş yapmak zorunda kalıyordu.)
  useEffect(() => {
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

        // ★ Admin yeniden doğrulandı → hatırlama bilgisini tazele
        if (data.user.isAdmin && isAdminEmail(data.user.email)) {
          try { localStorage.setItem("nur_admin_son_email", data.user.email.toLowerCase()); } catch { /* ignore */ }
          setAdminSonEmail(data.user.email.toLowerCase());
        }

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
        tierStateGuncelle(dbTier); // ★ Çip senkronu — oturum geri yüklemesinde de üst bar doğru görünsün
        if (data.user.isAdmin) {
          setAdminGodMode(true);
        } else {
          setAdminGodMode(false);
          localStorage.removeItem("nur_admin_session");
        }

        // ★ DENEME SENKRONU (07.10): oturum geri yüklendiğinde de sunucudaki gerçek
        //   deneme durumu yerel önbelleğe yazılır — uzun süre girmeyen üye siteyi
        //   açınca arayüzü otomatik PRO denemesine döner (kullanıcı emri: misafirde çalışmaz,
        //   oturum kontrolü 401 dönerse bu bloğa hiç gelinmez).
        //   NOT: bu tick tarayıcıda bir kez çalışır (girişsiz kullanıcıda sunucu zaten döndü).
        try { void denemeyiSunucuyaSenkronla(); } catch { /* arka plan görevi */ }
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
    adminSonEmail,
    setAdminSonEmail,
  };
}
