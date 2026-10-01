// ════════════════════════════════════════════════════════
// MODALSCONTAINERBOLUMLER.TSX — ModalsContainer alt bileşenleri
// ModalsContainer.tsx'den ayrıldı (SRP adım 8, 30.09)
// LibraryModal · StoriesModal · ThemesModal · PrayerModal ·
// ContactModal · AdminAuthModal · FullUnlockConfirm · LoginModal
// ════════════════════════════════════════════════════════

import React, { useState } from "react";
import {
  X, Hourglass, Shield, Search, Plus, Mail, AlertTriangle, Send, Check, MapPin,
} from "lucide-react";
import { Modal, Segmented } from "./UIElements";
import { LockBadge } from "./LockBadge";
import { EMOTIONS, TYPE_TABS, TYPE_BADGE, type LibraryItem, type LibraryType, type Emotion } from "../dualar";
import { KISSAS } from "../data";
import { T, type Lang } from "../i18n";
import { GoogleIcon } from "./modalHelpers";
import type { LoginTab, Tier } from "../types";

const PRAYERS: Array<[string, string]> = [
  ["İmsak", "Fajr"], ["Güneş", "Sunrise"], ["Öğle", "Dhuhr"],
  ["İkindi", "Asr"], ["Akşam", "Maghrib"], ["Yatsı", "Isha"]
];

// ── LOGIN & REGISTER MODAL ──────────────────────────────
export function LoginModalBolum({
  setModal,
  setLoginTab,
  handleGoogleAuth,
  adminSonEmail,
  handleGuestContinue,
  guestTrialLeft,
  marketingConsent,
  setMarketingConsent,
  loginTab,
  sentCode,
  verifyCode,
  setVerifyCode,
  handleVerifyCode,
  notify,
  t,
}: {
  setModal: (m: never) => void;
  setLoginTab: (v: LoginTab) => void;
  handleGoogleAuth: (loginHint?: string) => void;
  adminSonEmail: string | null;
  handleGuestContinue: () => void;
  guestTrialLeft?: number;
  marketingConsent: boolean;
  setMarketingConsent: (v: boolean) => void;
  loginTab: LoginTab;
  sentCode: string;
  verifyCode: string;
  setVerifyCode: (v: string) => void;
  handleVerifyCode: () => void;
  notify: (msg: string) => void;
  t: (k: string) => string;
}) {
  return (
    <Modal
      title="Nûr Stüdyo'ya Hoş Geldiniz"
      sub="Telifsiz sinematik Kur'an videoları üretin ve paylaşın"
      onClose={() => { setModal(null as never); setLoginTab("login"); }}
      wide={false}
    >
      <div className="space-y-3 py-1">
        {/* ★ TEK BUTON — Google ile giriş/kayıt (sistem kendisi ayırt eder) */}
        <button
          onClick={() => handleGoogleAuth()}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white py-4 text-[13px] font-bold text-[#3c4043] shadow-lg transition hover:brightness-95 active:scale-[.98]"
        >
          <GoogleIcon size={20} />
          Google ile Devam Et
        </button>
        {adminSonEmail && (
          <button
            onClick={() => handleGoogleAuth(adminSonEmail)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-400/40 bg-amber-400/10 py-3 text-[11px] font-black text-amber-300 transition hover:bg-amber-400/20 active:scale-[.98]"
            title="Google hesap seçici son admin hesabınla açılır — güvenlik zinciri yine sunucuda doğrulanır"
          >
            <Shield size={14} />
            ADMIN OLARAK GERİ DÖN
            <span className="rounded bg-black/30 px-1.5 py-0.5 text-[9px] font-bold text-amber-200/90">{adminSonEmail}</span>
          </button>
        )}
        <p className="text-center text-[9px] leading-relaxed text-white/40">
          Yeni hesap → otomatik oluşturulur · Mevcut hesap → doğrudan girilir<br />
          Şifre gerekmez · Anında <b className="text-white/60">+5 ⚡ Üretim hakkı</b> hediye
        </p>

        {/* ★ KVKK: Hesap oluşturma sözleşme gereği yapılır, onay kutusu GEREKMEZ.
            Ama pazarlama e-postası BAĞIMSIZ bir işlem olduğu için AYRI, geri
            alınabilir bir açık rıza kutusu burada sunulur (kanunen zorunlu ayrım). */}
        <label className="flex items-start gap-2 px-1 text-[9px] leading-relaxed text-white/40">
          <input
            type="checkbox"
            checked={marketingConsent}
            onChange={(e) => setMarketingConsent(e.target.checked)}
            className="mt-0.5 accent-[#d7aa52]"
          />
          <span>
            Yeni özellikler, indirim ve hatırlatmalardan haberdar olmak için e-posta almak istiyorum. (İsteğe bağlı, istediğiniz zaman iptal edebilirsiniz.)
          </span>
        </label>

        {/* ★ MİSAFİR MODU */}
        <button
          onClick={handleGuestContinue}
          className="glass-soft flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[11px] font-bold text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          👋 Üye Olmadan Dene <span className="text-[9px] font-semibold text-white/40">({Math.max(0, (guestTrialLeft ?? 2))} deneme videosu kaldı)</span>
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
  );
}

// ── FULL UNLOCK CONFIRM MODAL ───────────────────────────
export function FullUnlockConfirmBolum({
  setFullUnlockConfirmOpen,
  jetonCount,
  tryUnlockFullMode,
  setMode,
  MIKRO_UCRET,
}: {
  setFullUnlockConfirmOpen: (v: boolean) => void;
  jetonCount: number;
  tryUnlockFullMode: () => boolean;
  setMode: (m: "full") => void;
  MIKRO_UCRET: number;
}) {
  return (
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
        <p className="text-[10px] leading-relaxed text-white/65">Tam Sürüm modu <b className="text-white">{MIKRO_UCRET} ⚡ Üretim hakkı</b> karşılığında <b className="text-white">24 saat</b> boyunca açılacak. Bu işlem onaydan sonra bakiyenden düşer.</p>
        <div className="mt-3 rounded-xl bg-white/[.04] px-3 py-2 text-[10px] text-white/55">Mevcut bakiye: <b style={{ color: "var(--accent-2)" }}>{jetonCount} ⚡ Üretim hakkı</b></div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setFullUnlockConfirmOpen(false)} className="glass-soft rounded-xl py-2.5 text-[10px] font-bold text-white/65">Vazgeç</button>
          <button type="button" onClick={() => { if (tryUnlockFullMode()) { setMode("full"); setFullUnlockConfirmOpen(false); } }} className="rounded-xl py-2.5 text-[10px] font-black text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>{MIKRO_UCRET} ⚡ Üretim hakkı Öde ve Aç</button>
        </div>
      </div>
    </div>
  );
}

// ── ADMIN AUTH MODAL ────────────────────────────────────
export function AdminAuthBolum({
  setAdminAuthOpen,
  setModal,
  setLoginTab,
  adminError,
  notify,
}: {
  setAdminAuthOpen: (v: boolean) => void;
  setModal: (m: never) => void;
  setLoginTab: (v: LoginTab) => void;
  adminError: string;
  notify: (msg: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md modal-in" onMouseDown={() => setAdminAuthOpen(false)}>
      <div className="glass modal-in relative w-full max-w-sm rounded-2xl p-6" onMouseDown={(e) => e.stopPropagation()} style={{ border: "1px solid rgba(215,170,82,.3)" }}>
        <button aria-label="Kapat" className="absolute right-3 top-3 text-white/50 hover:text-white" onClick={() => setAdminAuthOpen(false)}><X size={18} /></button>
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
            setModal("login" as never);
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
  );
}

// ── LIBRARY MODAL ───────────────────────────────────────
export function LibraryBolum({
  setModal,
  libSearch,
  setLibSearch,
  libType,
  setLibType,
  libEmotion,
  setLibEmotion,
  libraryFiltered,
  useFromLibrary,
}: {
  setModal: (m: never) => void;
  libSearch: string;
  setLibSearch: (v: string) => void;
  libType: LibraryType;
  setLibType: (v: LibraryType) => void;
  libEmotion: Emotion;
  setLibEmotion: (v: Emotion) => void;
  libraryFiltered: LibraryItem[];
  useFromLibrary: (item: LibraryItem) => void;
}) {
  return (
    <Modal title="Ayet & Dua Kütüphanesi" sub="Ayet-i Kerime, Hadis-i Şerif, Kadim Dua ve Zikirler — Stüdyo'da Kullan ile videona ekle" onClose={() => setModal(null as never)} wide>
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
  );
}

// ── STORIES (KISSALAR) MODAL — yalnız admin ─────────────
export function StoriesBolum({
  setModal,
  addAyah,
}: {
  setModal: (m: never) => void;
  addAyah: (s: number, a: number) => void;
}) {
  return (
    <Modal title="Kur'an Kıssaları" sub="Admin · V2 içerikleri aktif" onClose={() => setModal(null as never)} wide>
      <div className="grid gap-3 sm:grid-cols-2">
        {KISSAS.map((story) => (
          <div key={`${story.s}:${story.a}`} className="rounded-2xl border border-white/10 bg-white/[.03] p-4">
            <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: "var(--accent)" }}>{story.ref}</p>
            <h4 className="mt-1 font-display text-sm font-bold text-white/90">{story.title}</h4>
            <p className="mt-2 text-[10px] leading-relaxed text-white/55">{story.text}</p>
            <button type="button" onClick={() => { addAyah(story.s, story.a); setModal(null as never); }} className="mt-3 flex items-center gap-1.5 rounded-lg px-3 py-2 text-[9px] font-black text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}><Plus size={10} /> Ayeti Stüdyoya Ekle</button>
          </div>
        ))}
      </div>
    </Modal>
  );
}

// ── THEMES MODAL ────────────────────────────────────────
export function ThemesBolum({
  setModal,
  t,
  ALL_THEMES,
  themeTier,
  themeEmoji,
  themeId,
  setThemeId,
  accessTier,
  tierAtLeast,
  openPremium,
}: {
  setModal: (m: never) => void;
  t: (k: string) => string;
  ALL_THEMES: any[];
  themeTier: (id: string) => Tier;
  themeEmoji: (id: string) => string;
  themeId: string;
  setThemeId: (id: string) => void;
  accessTier: Tier;
  tierAtLeast: (a: Tier, b: Tier) => boolean;
  openPremium: (tab?: string) => void;
}) {
  return (
    <Modal title={t("themesTitle")} sub={`${t("themesSub")} · ${ALL_THEMES.length} tema · ${ALL_THEMES.filter((x: any) => themeTier(x.id) === "free").length} ücretsiz`} onClose={() => setModal(null as never)} wide>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
        {ALL_THEMES.map((item: any) => {
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
  );
}

// ── PRAYER (NAMAZ VAKTİ) MODAL ──────────────────────────
export function PrayerBolum({
  setModal,
  t,
  prayerCity,
  prayerSearch,
  setPrayerSearch,
  filteredCities,
  setPrayerCity,
  prayerTimings,
  nextPrayer,
  formatRemaining,
}: {
  setModal: (m: never) => void;
  t: (k: string) => string;
  prayerCity: string;
  prayerSearch: string;
  setPrayerSearch: (v: string) => void;
  filteredCities: string[];
  setPrayerCity: (v: string) => void;
  prayerTimings: Record<string, string> | null;
  nextPrayer: { name: string; key: string; diff: number } | null;
  formatRemaining: (ms: number) => string;
}) {
  return (
    <Modal title={t("prayerTitle")} sub={`${prayerCity} • Diyanet metodu`} onClose={() => setModal(null as never)}>
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
  );
}

// ── CONTACT & SUPPORT MODAL ─────────────────────────────
export function ContactBolum({
  setModal,
  contactType,
  setContactType,
  contactMessage,
  setContactMessage,
  notify,
}: {
  setModal: (m: never) => void;
  contactType: "oneri" | "sikayet";
  setContactType: (v: "oneri" | "sikayet") => void;
  contactMessage: string;
  setContactMessage: (v: string) => void;
  notify: (msg: string) => void;
}) {
  const [contactPuan, setContactPuan] = useState<number | null>(null);
  return (
    <Modal title="Destek & Bildirim Merkezi" sub="Öneri, soru veya sorunlarınızı destek ekibimize doğrudan iletin." onClose={() => setModal(null as never)}>
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
      {/* ★ YILDIZ PUANI — opsiyonel, admin paneldeki puan dağılımına düşer */}
      <div className="mb-3 flex items-center justify-center gap-1.5 rounded-xl bg-white/5 py-2">
        <span className="text-[10px] text-white/50">Sitemizi puanla:</span>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setContactPuan(contactPuan === n ? null : n)}
            className={`text-lg transition ${contactPuan && n <= contactPuan ? "grayscale-0" : "opacity-30 grayscale hover:opacity-60"}`}
            aria-label={`${n} yıldız`}
          >⭐</button>
        ))}
      </div>
      <textarea
        value={contactMessage}
        onChange={(event) => setContactMessage(event.target.value)}
        rows={5}
        placeholder="Mesajınızı, önerinizi veya karşılaştığınız sorunu detaylıca buraya yazınız..."
        className="glass-soft mb-3 w-full resize-none rounded-xl px-3.5 py-3 text-[11px] leading-relaxed text-white outline-none placeholder:text-white/30 focus:border-[color:var(--accent)]"
      />
      <button
        onClick={async () => {
          if (!contactMessage.trim()) {
            notify("Lütfen göndermek istediğiniz mesajı yazınız.");
            return;
          }
          // ★ VERİTABANI KAYDI — mesaj admin panelin Geri Bildirim sekmesine düşer.
          //   Kimlik bilgisi sunucu oturumundan gelir (istemciden gönderilmez).
          try {
            await fetch("/api/marketing/feedback", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ tur: contactType, puan: contactPuan, mesaj: contactMessage.trim() }),
            });
          } catch { /* DB yazımı başarısız olsa da mail akışı bozulmasın */ }
          // E-posta akışı aynen korunur — destekte kalıcı kayıt mailde de durur
          const subject = encodeURIComponent(contactType === "oneri" ? "Nûr Stüdyo — Öneri / Talep Bildirimi" : "Nûr Stüdyo — Destek & Sorun Bildirimi");
          const body = encodeURIComponent(`Nûr Stüdyo Destek Birimine:\n\n${contactMessage.trim()}\n\n---\nPuan: ${contactPuan ? contactPuan + " ⭐" : "verilmedi"}\nTarih: ${new Date().toLocaleString("tr-TR")}`);
          window.open(`mailto:destek@nurstudyo.com?subject=${subject}&body=${body}`, "_blank");
          notify("✉️ Mesajınız iletildi — görüşünüz için teşekkürler 🌙");
          setContactMessage("");
          setContactPuan(null);
          setModal(null as never);
        }}
        className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[11px] font-bold text-black shadow-lg transition hover:brightness-110 active:scale-95 cursor-pointer"
        style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
      >
        <Send size={13} /> Destek Ekibine İlet
      </button>
    </Modal>
  );
}
