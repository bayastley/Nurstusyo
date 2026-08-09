import React from "react";
import {
  X, Hourglass, Shield, Search, FolderUp, Shuffle, Lock, Plus, Mail, AlertTriangle, Send, Check, MapPin,
  Image as ImageIcon, Film, Play,
} from "lucide-react";
import { LegalModal } from "./LegalModal";
import { Modal, Segmented } from "./UIElements";
import { LockBadge } from "./LockBadge";
import { PremiumModal } from "./PremiumModal";
import { ZipExplorer } from "./ZipExplorer";
import { AtmosphereCard } from "./AtmosphereCard";
import { AdminDashboardModal } from "./AdminDashboardModal";
import { CATEGORIES, CATEGORY_LOCK_LEVEL, HARD_LOCKED_CATEGORIES, KATEGORI_TIER, FREE_VIDEOS_PER_CATEGORY, type CatId, type Clip } from "../clips";
import { EMOTIONS, TYPE_TABS, TYPE_BADGE, type LibraryItem, type LibraryType, type Emotion } from "../dualar";
import { KISSAS } from "../data";
import { T } from "../i18n";
import { JETON } from "../tier";
import { getFeatureLock } from "../services/adminSyncService";
import type { ModalName, LoginTab, Tier } from "../types";

const PRAYERS: Array<[string, string]> = [
  ["İmsak", "Fajr"], ["Güneş", "Sunrise"], ["Öğle", "Dhuhr"],
  ["İkindi", "Asr"], ["Akşam", "Maghrib"], ["Yatsı", "Isha"]
];

/** Resmi Google "G" logosu */
const GoogleIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

function base64Url(bytes: ArrayBuffer): string {
  const binary = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function randomPkceVerifier(): string {
  const bytes = new Uint8Array(64);
  crypto.getRandomValues(bytes);
  return base64Url(bytes.buffer);
}

async function pkceChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64Url(digest);
}

interface ModalsContainerProps {
  modal: ModalName;
  setModal: (m: ModalName) => void;
  loginTab: LoginTab;
  setLoginTab: (t: LoginTab) => void;
  phone: string;
  setPhone: (p: string) => void;
  verifyCode: string;
  setVerifyCode: (c: string) => void;
  sentCode: string;
  handleLoginSubmit: () => void;
  handleRegisterSubmit: () => void;
  handleForgotPassword: () => void;
  handleVerifyCode: () => void;
  /** ★ Misafir modu — üye olmadan deneme */
  handleGuestContinue: () => void;
  fullUnlockConfirmOpen: boolean;
  setFullUnlockConfirmOpen: (v: boolean) => void;
  jetonCount: number;
  tryUnlockFullMode: () => boolean;
  setMode: (m: any) => void;
  premiumOpen: boolean;
  setPremiumOpen: (v: boolean) => void;
  premiumTab: "uyelik" | "jeton";
  serverAdminVerified: boolean;
  tier: Tier;
  setTier: (t: Tier) => void;
  setCurrentTier: (t: Tier) => void;
  setJetonCount: (j: number) => void;
  notify: (msg: string) => void;
  adminAuthOpen: boolean;
  setAdminAuthOpen: (v: boolean) => void;
  adminEmailInput: string;
  setAdminEmailInput: (v: string) => void;
  adminCodeInput: string;
  setAdminCodeInput: (v: string) => void;
  adminError: string | null;
  setAdminError: (e: string | null) => void;
  setAdminGodMode: (v: boolean) => void;
  pickingFor: string | null;
  setPickingFor: (id: string | null) => void;
  clipKind: "img" | "vid";
  setClipKind: (k: "img" | "vid") => void;
  atmosQuery: string;
  setAtmosQuery: (q: string) => void;
  isMasterSürüm: boolean;
  randomizeBackgrounds: (cat?: any) => void;
  atmosCategory: CatId | "all";
  setAtmosCategory: (c: CatId | "all") => void;
  combinedAllClips: Clip[];
  CATEGORY_ICONS: Record<CatId, React.ElementType>;
  lockTip: string | null;
  setLockTip: React.Dispatch<React.SetStateAction<string | null>>;
  accessTier: Tier;
  tierAtLeast: (have: Tier, need: Tier) => boolean;
  filteredClips: Clip[];
  hoveredClip: string | null;
  setHoveredClip: (id: string | null) => void;
  openPremium: (tab?: "uyelik" | "jeton") => void;
  pickClip: (clip: Clip) => void;
  libSearch: string;
  setLibSearch: (s: string) => void;
  libType: LibraryType | "tumu";
  setLibType: (t: LibraryType | "tumu") => void;
  libEmotion: Emotion | "tum";
  setLibEmotion: (e: Emotion | "tum") => void;
  libraryFiltered: LibraryItem[];
  useFromLibrary: (item: LibraryItem) => void;
  addAyah: (s: number, a: number) => void;
  ALL_THEMES: any[];
  themeTier: (id: string) => Tier;
  themeEmoji: (id: string) => string;
  themeId: string;
  setThemeId: (id: string) => void;
  prayerSearch: string;
  setPrayerSearch: (s: string) => void;
  prayerCity: string;
  setPrayerCity: (c: string) => void;
  filteredCities: string[];
  prayerTimings: Record<string, string> | null;
  nextPrayer: { name: string; key: string; diff: number } | null;
  formatRemaining: (ms: number) => string;
  contactType: "oneri" | "sikayet";
  setContactType: (t: "oneri" | "sikayet") => void;
  contactMessage: string;
  setContactMessage: (m: string) => void;
  tosOpen: boolean;
  setTosOpen: (v: boolean) => void;
  tosAccepted: boolean;
  setTosAccepted: (v: boolean) => void;
  legalTab: "tos" | "kvkk" | "gizlilik" | "iade";
  setLegalTab: (t: "tos" | "kvkk" | "gizlilik" | "iade") => void;
  t: (key: keyof (typeof T)["tr"]) => string;
}

export const ModalsContainer: React.FC<ModalsContainerProps> = ({
  modal,
  setModal,
  loginTab,
  setLoginTab,
  phone,
  setPhone,
  verifyCode,
  setVerifyCode,
  sentCode,
  handleLoginSubmit,
  handleRegisterSubmit,
  handleForgotPassword,
  handleVerifyCode,
  handleGuestContinue,
  fullUnlockConfirmOpen,
  setFullUnlockConfirmOpen,
  jetonCount,
  tryUnlockFullMode,
  setMode,
  premiumOpen,
  setPremiumOpen,
  premiumTab,
  serverAdminVerified,
  tier,
  setTier,
  setCurrentTier,
  setJetonCount,
  notify,
  adminAuthOpen,
  setAdminAuthOpen,
  adminEmailInput,
  setAdminEmailInput,
  adminCodeInput,
  setAdminCodeInput,
  adminError,
  setAdminError,
  setAdminGodMode,
  pickingFor,
  setPickingFor,
  clipKind,
  setClipKind,
  atmosQuery,
  setAtmosQuery,
  isMasterSürüm,
  randomizeBackgrounds,
  atmosCategory,
  setAtmosCategory,
  combinedAllClips,
  CATEGORY_ICONS,
  lockTip,
  setLockTip,
  accessTier,
  tierAtLeast,
  filteredClips,
  hoveredClip,
  setHoveredClip,
  openPremium,
  pickClip,
  libSearch,
  setLibSearch,
  libType,
  setLibType,
  libEmotion,
  setLibEmotion,
  libraryFiltered,
  useFromLibrary,
  addAyah,
  ALL_THEMES,
  themeTier,
  themeEmoji,
  themeId,
  setThemeId,
  prayerSearch,
  setPrayerSearch,
  prayerCity,
  setPrayerCity,
  filteredCities,
  prayerTimings,
  nextPrayer,
  formatRemaining,
  contactType,
  setContactType,
  contactMessage,
  setContactMessage,
  tosOpen,
  setTosOpen,
  tosAccepted,
  setTosAccepted,
  legalTab,
  setLegalTab,
  t,
}) => {
  // Sahte e-posta/şifre akışı kaldırıldı; prop'lar eski modal sözleşmesi bozulmasın diye korunuyor.
  void phone; void setPhone; void verifyCode; void setVerifyCode; void sentCode;
  void handleLoginSubmit; void handleRegisterSubmit; void handleForgotPassword; void handleVerifyCode;
  void tosAccepted;
  void adminEmailInput; void setAdminEmailInput; void adminCodeInput; void setAdminCodeInput;
  void setAdminError; void setAdminGodMode;

  // ★ GOOGLE İLE GİRİŞ/KAYIT — Gmail hesabına bağlanarak kayıt olur.
  //   Google Cloud Console'dan alınan Client ID .env'e eklenir:
  //   VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
  const handleGoogleAuth = React.useCallback(async () => {
    const clientId = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GOOGLE_CLIENT_ID?.trim();

    if (!clientId) {
      notify("⚙️ Google girişi için Client ID tanımlanmalı (.env → VITE_GOOGLE_CLIENT_ID)");
      return;
    }

    if (!crypto?.subtle) {
      notify("⚠️ Tarayıcınız güvenli Google girişi için gerekli PKCE desteğini sağlamıyor");
      return;
    }

    // OAuth 2.0 Authorization Code + PKCE — token frontend'de doğrulanmaz, backend'e gider
    const redirectUri = `${window.location.origin}/`;
    const scope = encodeURIComponent("openid email profile");
    const state = Math.random().toString(36).slice(2, 18);
    const verifier = randomPkceVerifier();
    const challenge = await pkceChallenge(verifier);
    try {
      sessionStorage.setItem("nur_google_state", state);
      sessionStorage.setItem("nur_google_pkce_verifier", verifier);
    } catch { /* ignore */ }

    const authUrl =
      "https://accounts.google.com/o/oauth2/v2/auth" +
      `?client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${scope}` +
      `&state=${state}` +
      `&code_challenge=${encodeURIComponent(challenge)}` +
      `&code_challenge_method=S256` +
      `&prompt=select_account`;

    window.location.href = authUrl;
  }, [notify]);

  return (
    <>
      {/* LOGIN & REGISTER MODAL */}
      {modal === "login" && (
        <Modal
          title="Nûr Stüdyo'ya Hoş Geldiniz"
          sub="Telifsiz sinematik Kur'an videoları üretin ve paylaşın"
          onClose={() => { setModal(null); setLoginTab("login"); }}
          wide={false}
        >
          <div className="space-y-3 py-1">
            {/* ★ TEK BUTON — Google ile giriş/kayıt (sistem kendisi ayırt eder) */}
            <button
              onClick={handleGoogleAuth}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white py-4 text-[13px] font-bold text-[#3c4043] shadow-lg transition hover:brightness-95 active:scale-[.98]"
            >
              <GoogleIcon size={20} />
              Google ile Devam Et
            </button>
            <p className="text-center text-[9px] leading-relaxed text-white/40">
              Yeni hesap → otomatik oluşturulur · Mevcut hesap → doğrudan girilir<br />
              Şifre gerekmez · Anında <b className="text-white/60">+20 jeton</b> hediye
            </p>

            {/* ★ MİSAFİR MODU */}
            <button
              onClick={handleGuestContinue}
              className="glass-soft flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[11px] font-bold text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              👋 Üye Olmadan Dene <span className="text-[9px] font-semibold text-white/40">(2 deneme videosu)</span>
            </button>
          </div>
          {loginTab === "verify" && (
            <div className="space-y-3">
              <p className="text-[11px] text-white/50">{t("codeSent")}: {sentCode}</p>
              <input value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)} placeholder="6 haneli kod" maxLength={6} className="glass-soft w-full rounded-xl px-4 py-3 text-center text-[14px] tracking-widest text-white outline-none" />
              <button onClick={handleVerifyCode} className="w-full rounded-xl py-3 text-[11px] font-bold text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>{t("verifyBtn")}</button>
              <button onClick={() => setLoginTab("login")} className="w-full text-center text-[10px] text-white/50 hover:text-white">{t("backToLogin")}</button>
            </div>
          )}
          {loginTab === "forgot" && (
            <div className="space-y-3">
              <p className="text-[11px] text-white/50">{t("resetPassword")}</p>
              <input type="password" value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)} placeholder={t("password")} className="glass-soft w-full rounded-xl px-4 py-3 text-[12px] text-white outline-none" />
              <button onClick={() => { notify("Şifreniz sıfırlandı!"); setLoginTab("login"); }} className="w-full rounded-xl py-3 text-[11px] font-bold text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>{t("resetPassword")}</button>
            </div>
          )}
        </Modal>
      )}

      {/* FULL UNLOCK CONFIRM MODAL */}
      {fullUnlockConfirmOpen && (
        <div
          className="fixed inset-0 z-[96] flex select-none items-center justify-center bg-black/80 p-4 backdrop-blur-md modal-in"
          onMouseDown={() => setFullUnlockConfirmOpen(false)}
          onClick={() => setFullUnlockConfirmOpen(false)}
        >
          <div
            className="glass modal-in relative w-full max-w-sm rounded-2xl p-5 shadow-2xl"
            style={{ border: "1px solid rgba(215,170,82,.35)" }}
            onMouseDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
          >
            <button type="button" onClick={() => setFullUnlockConfirmOpen(false)} className="absolute right-3 top-3 rounded-full bg-white/5 p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white" aria-label="Kapat"><X size={15} /></button>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}><Hourglass size={16} /></span>
              <div><h3 className="font-display text-sm font-black" style={{ color: "var(--accent-2)" }}>Tam Sürümü Aç</h3><p className="text-[9px] text-white/40">40 dakikaya kadar video modu</p></div>
            </div>
            <p className="text-[10px] leading-relaxed text-white/65">Tam Sürüm modu <b className="text-white">{JETON.MIKRO_KILIT_ACMA_UCRETI} jeton</b> karşılığında <b className="text-white">24 saat</b> boyunca açılacak. Bu işlem onaydan sonra bakiyenden düşer.</p>
            <div className="mt-3 rounded-xl bg-white/[.04] px-3 py-2 text-[10px] text-white/55">Mevcut bakiye: <b style={{ color: "var(--accent-2)" }}>{jetonCount} jeton</b></div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setFullUnlockConfirmOpen(false)} className="glass-soft rounded-xl py-2.5 text-[10px] font-bold text-white/65">Vazgeç</button>
              <button type="button" onClick={() => { if (tryUnlockFullMode()) { setMode("full"); setFullUnlockConfirmOpen(false); } }} className="rounded-xl py-2.5 text-[10px] font-black text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>{JETON.MIKRO_KILIT_ACMA_UCRETI} Jeton Öde ve Aç</button>
            </div>
          </div>
        </div>
      )}

      {/* PREMIUM MODAL */}
      {premiumOpen && (
        <PremiumModal
          initialTab={premiumTab}
          currentTier={tier}
          onClose={() => setPremiumOpen(false)}
          onPurchase={(newTier) => {
            setTier(newTier);
            setCurrentTier(newTier);
            const bonus = newTier === "pro" ? 250 : 500;
            const cur = Number(localStorage.getItem("nur_jeton") || 0);
            const next = cur + bonus;
            localStorage.setItem("nur_jeton", String(next));
            setJetonCount(next);
            notify(`Hoş geldin! NÛR ${newTier.toUpperCase()} aktif 🌙 +${bonus} jeton`);
          }}
          onTokenPurchase={(amount) => {
            const next = Number(localStorage.getItem("nur_jeton") || 0);
            setJetonCount(next);
            notify(`${amount} jeton hesabına eklendi`);
          }}
        />
      )}

      {/* ADMIN DASHBOARD GOD MODE MODAL */}
      {modal === "adminDashboard" && serverAdminVerified && (
        <AdminDashboardModal
          onClose={() => setModal(null)}
          currentUserEmail={phone.includes("@") ? phone : "kayaom1233@gmail.com"}
          onUpdateUser={(email, newTier, newJeton) => {
            // Eğer güncellenen hesap şu anki oturum sahibi ise, canlı state'leri güncelle
            if (phone.toLowerCase() === email.toLowerCase() || email.toLowerCase() === "kayaom1233@gmail.com") {
              setTier(newTier);
              setCurrentTier(newTier);
              setJetonCount(newJeton);
              localStorage.setItem("nur_jeton", String(newJeton));
            }
          }}
          notify={notify}
        />
      )}

      {/* ADMIN AUTH MODAL */}
      {adminAuthOpen && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md modal-in" onMouseDown={() => setAdminAuthOpen(false)}>
          <div className="glass modal-in relative w-full max-w-sm rounded-2xl p-6" onMouseDown={(e) => e.stopPropagation()} style={{ border: "1px solid rgba(215,170,82,.3)" }}>
            <button className="absolute right-3 top-3 text-white/50 hover:text-white" onClick={() => setAdminAuthOpen(false)}><X size={18} /></button>
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}><Shield size={16} /></span>
              <div>
                <h3 className="font-display text-sm font-black tracking-wider" style={{ color: "var(--accent-2)" }}>KURUCU GİRİŞİ</h3>
                <p className="text-[9px] text-white/40">Admin paneli için Google ile doğrulanmış admin oturumu gerekir</p>
              </div>
            </div>
            <div className="mb-3 rounded-xl border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-[10px] leading-relaxed text-amber-100/80">
              Önce Google ile admin e-postanızla giriş yapın. Giriş doğrulanınca admin paneli açılır.
            </div>
            {adminError && <p className="mb-3 text-[10px] text-red-400">{adminError}</p>}
            <button
              onClick={() => {
                setModal("login");
                setLoginTab("login");
                setAdminAuthOpen(false);
                notify("Google ile admin hesabınızdan giriş yapın");
              }}
              className="w-full rounded-xl py-3 text-[11px] font-black uppercase tracking-wider text-black"
              style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
            >
              Google ile Admin Girişi Yap
            </button>
            <p className="mt-3 text-center text-[8px] text-white/25">Yetkisiz denemeler kaydedilir.</p>
          </div>
        </div>
      )}

      {/* ATMOSPHERE PICKER MODAL */}
      {modal === "atmos" && (
        <Modal title={t("atmoLibrary")} sub={pickingFor ? `${t("pickForAyah")}: ${pickingFor}` : t("hoverPreview")} onClose={() => { setModal(null); setPickingFor(null); }} wide>
          <div className="mb-3 flex flex-wrap gap-2">
            <div className="w-44">
              <Segmented value={clipKind} onChange={(kind) => { if (kind === "img" && !isMasterSürüm) return; setClipKind(kind); }} items={[{ id: "img", label: "Şablon V2", icon: ImageIcon }, { id: "vid", label: t("motion"), icon: Film }]} />
            </div>
            <div className="relative min-w-48 flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input value={atmosQuery} onChange={(event) => setAtmosQuery(event.target.value)} placeholder="Atmosfer ara..." className="glass-soft h-full w-full rounded-xl pl-8 pr-3 text-[11px] outline-none placeholder:text-white/25" />
            </div>
            {isMasterSürüm ? (
              <button type="button" onClick={() => setModal("zip")} className="glass-soft flex items-center gap-1.5 rounded-xl px-3 py-2 text-[10px] font-bold text-white/70"><FolderUp size={12} /> ZIP / Image</button>
            ) : (
              <span className="relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-[10px] font-bold glass-soft text-white/30 cursor-not-allowed"><FolderUp size={12} /> ZIP / Image<LockBadge kind="v3" position="top-right" tooltipText="V3 Güncellemesi Yakında" /></span>
            )}
            <button onClick={() => randomizeBackgrounds(atmosCategory !== "all" ? atmosCategory : undefined)} className="relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-[10px] font-bold text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
              <Shuffle size={11} />{atmosCategory !== "all" ? `${CATEGORIES.find(c => c.id === atmosCategory)?.label ?? ""} Rastgele` : t("randomAll")}
            </button>
          </div>

          {/* Categories bar */}
          <div className="mb-3 grid grid-cols-3 gap-1.5 sm:grid-cols-5">
            {CATEGORIES.map((category) => {
              const CatIcon = CATEGORY_ICONS[category.id];
              const active = atmosCategory === category.id;
              const count = combinedAllClips.filter((clip) => clip.cat === category.id && clip.kind === clipKind).length;
              const lockLevel = CATEGORY_LOCK_LEVEL[category.id] ?? "V2";
              const hardLocked = !isMasterSürüm && HARD_LOCKED_CATEGORIES.includes(category.id);
              return (
                <div key={category.id} className="relative">
                  <button
                    type="button"
                    onMouseEnter={() => { if (hardLocked) setLockTip(`cat-${category.id}`); }}
                    onMouseLeave={() => { if (hardLocked) setLockTip((cur) => (cur === `cat-${category.id}` ? null : cur)); }}
                    onClick={() => { if (hardLocked && !isMasterSürüm) return; setAtmosCategory(category.id); }}
                    className={`relative flex h-16 w-full flex-col items-center justify-center gap-1 rounded-xl border transition ${hardLocked ? "opacity-40 saturate-50 glass-soft text-white/40" : active ? "text-black" : "glass-soft text-white/70 hover:text-white"}`}
                    style={!hardLocked && active ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))", borderColor: "var(--accent)" } : undefined}
                  >
                    {hardLocked && <span className="absolute right-1 top-1 rounded px-1 py-0.5 text-[6.5px] font-black text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>{lockLevel}</span>}
                    {CatIcon ? <CatIcon size={15} style={active && !hardLocked ? undefined : { color: hardLocked ? undefined : "var(--accent)" }} /> : null}
                    <span className="px-1 text-center text-[8px] font-bold leading-tight">{category.label}</span>
                    <span className={`text-[7px] ${active && !hardLocked ? "text-black/60" : "text-white/25"}`}>{count} içerik</span>
                  </button>
                  {hardLocked && lockTip === `cat-${category.id}` && (
                    <span className="pointer-events-none absolute -top-6 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-1 text-[9px] font-black text-black shadow-lg" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
                      <Lock size={9} className="mr-1 inline" />{lockLevel} Güncellemesi Yakında
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className={`grid gap-3 ${clipKind === "img" ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"}`}>
            {filteredClips.map((clip) => {
              const dynamicLock = getFeatureLock(clip.cat as string, "free");
              const catTier = dynamicLock === "pro" || dynamicLock === "elit" ? dynamicLock : (KATEGORI_TIER[clip.cat as CatId] ?? "free");
              const sameCat = combinedAllClips.filter(c => c.cat === clip.cat && c.kind === clipKind);
              const idx = sameCat.findIndex(c => c.id === clip.id);
              const maintenanceLocked = dynamicLock === "maintenance" || dynamicLock === "off";
              const catLocked = maintenanceLocked || !tierAtLeast(accessTier, catTier);
              const nextTier: Tier = catTier === "free" ? "pro" : catTier === "pro" ? "elit" : "elit";
              const videoLocked = !catLocked && idx >= FREE_VIDEOS_PER_CATEGORY && !tierAtLeast(accessTier, nextTier);
              const locked = catLocked || videoLocked;
              const lockKind = maintenanceLocked ? "maintenance" : catLocked ? (catTier === "pro" ? "pro" : "elit") : (nextTier === "elit" ? "elit" : "pro");
              return (
                <div key={clip.id} className="relative">
                  <AtmosphereCard clip={clip} active={hoveredClip === clip.id} onHover={setHoveredClip} onPick={() => locked ? openPremium("uyelik") : pickClip(clip)} />
                  {locked && <LockBadge kind={lockKind} onUpgrade={() => openPremium("uyelik")} />}
                </div>
              );
            })}
          </div>
        </Modal>
      )}

      {/* LIBRARY MODAL */}
      {modal === "library" && (
        <Modal title="Ayet & Dua Kütüphanesi" sub="Ayet-i Kerime, Hadis-i Şerif, Kadim Dua ve Zikirler — Stüdyo'da Kullan ile videona ekle" onClose={() => setModal(null)} wide>
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input value={libSearch} onChange={(e) => setLibSearch(e.target.value)} placeholder="Ayet, sure adı veya Türkçe meal ara..." className="glass-soft w-full rounded-xl py-2.5 pl-9 pr-3 text-[11px] outline-none placeholder:text-white/30" />
          </div>
          <div className="mb-2.5 flex flex-wrap gap-1.5">
            {TYPE_TABS.map((tab) => (
              <button key={tab.id} onClick={() => setLibType(tab.id)} className={`rounded-full px-3 py-1.5 text-[10px] font-bold transition-all ${libType === tab.id ? "text-black shadow-md" : "glass-soft text-white/55 hover:text-white"}`} style={libType === tab.id ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}>{tab.label}</button>
            ))}
          </div>
          <div className="mb-3 flex flex-wrap gap-1.5 border-b border-white/5 pb-3">
            {EMOTIONS.map((em) => (
              <button key={em.id} onClick={() => setLibEmotion(em.id)} className={`rounded-full px-2.5 py-1 text-[9px] font-semibold transition ${libEmotion === em.id ? "text-black" : "glass-soft text-white/45 hover:text-white/75"}`} style={libEmotion === em.id ? { background: "linear-gradient(135deg,#6ee7b7,#10b981)" } : undefined}>{em.label}</button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {libraryFiltered.map((item) => {
              const badge = TYPE_BADGE[item.type];
              return (
                <div key={item.id} className="group relative flex flex-col rounded-2xl border border-white/10 bg-white/[.03] p-4 transition-all hover:border-[color:var(--accent)]/40 hover:bg-white/[.05]">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full px-2 py-0.5 text-[8px] font-black tracking-wider" style={{ background: `${badge.color}22`, color: badge.color, border: `1px solid ${badge.color}44` }}>{badge.label}</span>
                    <h4 className="text-[11px] font-bold text-white/90">{item.title}</h4>
                  </div>
                  <p className="mb-2 text-right font-arabic text-[20px] leading-relaxed" style={{ color: "var(--accent-2)" }}>{item.ar}</p>
                  <p className="mb-3 text-[10px] leading-relaxed text-white/60">"{item.tr}"</p>
                  <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-2.5">
                    <span className="text-[9px] font-semibold" style={{ color: "var(--accent)" }}>{item.source}</span>
                    <button onClick={() => useFromLibrary(item)} className="glass-soft flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[9px] font-bold text-white/80 transition hover:text-white hover:brightness-150">
                      <Plus size={10} /> Stüdyo'da Kullan
                    </button>
                  </div>
                </div>
              );
            })}
            {libraryFiltered.length === 0 && <p className="col-span-2 py-8 text-center text-[11px] text-white/40">Bu filtreye uygun içerik bulunamadı.</p>}
          </div>
        </Modal>
      )}

      {/* ZIP EXPLORER MODAL */}
      {modal === "zip" && isMasterSürüm && (
        <Modal title="ZIP Dosya Gezgini" sub="God Mode · V3 geliştirme aracı aktif" onClose={() => setModal(null)} wide>
          <div className="h-[65vh] min-h-[420px]"><ZipExplorer onClose={() => setModal(null)} /></div>
        </Modal>
      )}

      {/* STORIES MODAL */}
      {modal === "stories" && isMasterSürüm && (
        <Modal title="Kur'an Kıssaları" sub="God Mode · V2 içerikleri aktif" onClose={() => setModal(null)} wide>
          <div className="grid gap-3 sm:grid-cols-2">
            {KISSAS.map((story) => (
              <div key={`${story.s}:${story.a}`} className="rounded-2xl border border-white/10 bg-white/[.03] p-4">
                <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: "var(--accent)" }}>{story.ref}</p>
                <h4 className="mt-1 font-display text-sm font-bold text-white/90">{story.title}</h4>
                <p className="mt-2 text-[10px] leading-relaxed text-white/55">{story.text}</p>
                <button type="button" onClick={() => { addAyah(story.s, story.a); setModal(null); }} className="mt-3 flex items-center gap-1.5 rounded-lg px-3 py-2 text-[9px] font-black text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}><Plus size={10} /> Ayeti Stüdyoya Ekle</button>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* THEMES MODAL */}
      {modal === "themes" && (
        <Modal title={t("themesTitle")} sub={`${t("themesSub")} · ${ALL_THEMES.length} tema · ${ALL_THEMES.filter(x => themeTier(x.id) === "free").length} ücretsiz`} onClose={() => setModal(null)} wide>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
            {ALL_THEMES.map((item) => {
              const tTier = themeTier(item.id);
              const locked = tTier !== "free" && !tierAtLeast(accessTier, tTier);
              const emoji = themeEmoji(item.id);
              return (
                <div key={item.id} className="relative">
                  <button onClick={() => { if (locked) { openPremium("uyelik"); return; } setThemeId(item.id); }} className={`group relative block h-24 w-full overflow-hidden rounded-xl border text-left transition ${themeId === item.id ? "ring-2" : ""} ${locked ? "opacity-75 saturate-50" : "hover:-translate-y-0.5 hover:shadow-xl"}`} style={{ background: `linear-gradient(135deg,${item.bg},${item.bg2})`, borderColor: `${item.acc}55`, boxShadow: themeId === item.id ? `0 0 0 1px ${item.acc}` : undefined }}>
                    <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl opacity-70 drop-shadow-lg transition group-hover:scale-110">{emoji}</span>
                    <span className="absolute left-3 top-3 h-9 w-9 rounded-full opacity-40 blur-md" style={{ background: item.acc }} />
                    <span className="absolute right-3 bottom-3 h-3 w-3 rounded-full border border-white/20" style={{ background: item.acc2 }} />
                    <span className="absolute bottom-2 left-3 text-[10px] font-bold" style={{ color: item.acc2 }}>{item.name}</span>
                    {themeId === item.id ? <Check size={13} className="absolute left-2 top-2" style={{ color: item.acc }} /> : null}
                    {locked && <span className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />}
                  </button>
                  {locked && <LockBadge kind={tTier === "pro" ? "pro" : "elit"} onUpgrade={() => openPremium("uyelik")} position="top-right" size="md" />}
                </div>
              );
            })}
          </div>
        </Modal>
      )}

      {/* PRAYER MODAL */}
      {modal === "prayer" && (
        <Modal title={t("prayerTitle")} sub={`${prayerCity} • Diyanet metodu`} onClose={() => setModal(null)}>
          <div className="relative mb-3"><MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" /><input value={prayerSearch} onChange={(event) => setPrayerSearch(event.target.value)} placeholder={t("prayerSearch")} className="glass-soft w-full rounded-xl py-2.5 pl-8 pr-3 text-[11px] outline-none placeholder:text-white/25" /></div>
          {prayerSearch ? (
            <div className="mb-3 grid max-h-36 grid-cols-2 gap-1 overflow-y-auto scrollbar-thin">
              {filteredCities.map((city) => (
                <button key={city} onClick={() => { setPrayerCity(city); setPrayerSearch(""); }} className="glass-soft rounded-lg px-2 py-1.5 text-left text-[10px] text-white/55 hover:text-white">{city}</button>
              ))}
            </div>
          ) : null}
          <div className="space-y-1">
            {PRAYERS.map(([name, key]) => {
              const active = nextPrayer?.key === key;
              return (
                <div key={key} className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-[11px] ${active ? "bg-emerald-500/10 text-emerald-200" : "text-white/55"}`}>
                  <span className="flex items-center gap-2 font-semibold">
                    <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-400" : "bg-white/20"}`} />{name}
                  </span>
                  <span className="tabular-nums">{prayerTimings?.[key]?.slice(0, 5) ?? "--:--"}{active && nextPrayer ? ` • ${formatRemaining(nextPrayer.diff)}` : ""}</span>
                </div>
              );
            })}
          </div>
        </Modal>
      )}

      {/* GUIDE / TUTORIAL VIDEO MODAL */}
      {modal === "guide" && (
        <Modal title="Nûr Stüdyo Nasıl Kullanılır? (Video Rehber)" sub="1 dakikada profesyonel video üretimi eğitim rehberi" onClose={() => setModal(null)} wide>
          <div className="space-y-4">
            {/* Video Player Frame */}
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-[color:var(--accent)]/30 bg-black shadow-2xl">
              <video
                src="/videos/rehber.mp4"
                controls
                autoPlay
                playsInline
                className="h-full w-full object-cover"
                poster="https://images.pexels.com/videos/35110882/free-video-35110882.jpg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200"
                onError={(e) => {
                  const v = e.currentTarget;
                  if (!v.dataset.fallback) {
                    v.dataset.fallback = "1";
                    v.src = "https://videos.pexels.com/video-files/35110882/35110882-hd_1920_1080_60fps.mp4";
                  }
                }}
              />
            </div>

            {/* Steps List */}
            <ol className="grid gap-2 sm:grid-cols-2">
              {[[t("step1T"), t("step1D")], [t("step2T"), t("step2D")], [t("step3T"), t("step3D")], [t("step4T"), t("step4D")]].map(([title, description], index) => (
                <li key={title} className="glass-soft flex gap-2.5 rounded-xl p-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>{index + 1}</span>
                  <span>
                    <b className="block text-[10.5px] text-white/90">{title}</b>
                    <span className="text-[9.5px] leading-relaxed text-white/50">{description}</span>
                  </span>
                </li>
              ))}
            </ol>

            {/* YouTube Button */}
            <div className="pt-2 border-t border-white/10 text-center">
              <button
                onClick={() => window.open("https://youtube.com/@nurstudyo", "_blank")}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-[11px] font-bold text-white transition hover:scale-105 active:scale-95 shadow-lg bg-red-600 hover:bg-red-700 cursor-pointer"
              >
                <Play size={14} fill="white" /> ▶ YouTube Üzerinden Detaylı İzle (Video Rehber)
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* CONTACT & SUPPORT MODAL */}
      {modal === "contact" && (
        <Modal title="Destek & Bildirim Merkezi" sub="Öneri, soru veya sorunlarınızı destek ekibimize doğrudan iletin." onClose={() => setModal(null)}>
          <div className="mb-3">
            <Segmented
              value={contactType}
              onChange={setContactType}
              items={[
                { id: "oneri", label: "Geliştirme & Öneri", icon: Mail },
                { id: "sikayet", label: "Sorun & Destek", icon: AlertTriangle },
              ]}
            />
          </div>
          <textarea
            value={contactMessage}
            onChange={(event) => setContactMessage(event.target.value)}
            rows={5}
            placeholder="Mesajınızı, önerinizi veya karşılaştığınız sorunu detaylıca buraya yazınız..."
            className="glass-soft mb-3 w-full resize-none rounded-xl px-3.5 py-3 text-[11px] leading-relaxed text-white outline-none placeholder:text-white/30 focus:border-[color:var(--accent)]"
          />
          <button
            onClick={() => {
              if (!contactMessage.trim()) {
                notify("Lütfen göndermek istediğiniz mesajı yazınız.");
                return;
              }
              const subject = encodeURIComponent(contactType === "oneri" ? "Nûr Stüdyo — Öneri / Talep Bildirimi" : "Nûr Stüdyo — Destek & Sorun Bildirimi");
              const body = encodeURIComponent(`Nûr Stüdyo Destek Birimine:\n\n${contactMessage.trim()}\n\n---\nTarih: ${new Date().toLocaleString("tr-TR")}`);
              window.open(`mailto:destek@nurstudyo.com?subject=${subject}&body=${body}`, "_blank");
              notify("✉️ Destek mesajınız oluşturuldu, yönlendiriliyorsunuz...");
              setContactMessage("");
              setModal(null);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[11px] font-bold text-black shadow-lg transition hover:brightness-110 active:scale-95 cursor-pointer"
            style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
          >
            <Send size={13} /> Destek Ekibine İlet
          </button>
        </Modal>
      )}

      {/* LEGAL / TOS MODAL — LegalModal.tsx bileşenine taşındı */}
      <LegalModal
        tosOpen={tosOpen}
        setTosOpen={setTosOpen}
        legalTab={legalTab}
        setLegalTab={setLegalTab}
      />
      {/* Yasal modal LegalModal.tsx bileşenine taşındı */}
    </>
  );
};
