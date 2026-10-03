// ════════════════════════════════════════════════════════════════
// ÇEREZ ONAY BANNER'I — 6698 sayılı KVKK m.10 + KVKK Kurulu Çerez
// Rehberi (08.03.2025 gün ve 11896 sayılı) uyumlu.
//
// ★ i18n (03.10): tüm metinler t() sözlüğüne bağlandı — cookie* anahtarları
//   5 dilde (tr/en/ar/id/ur) mevcuttu, bileşen hardcode Türkçe'ydi. Dil
//   localStorage "nur_lang"ten okunur (AnnouncementBar/FeedbackBox deseni).
//
// UYUM NOTLARI (araştırma bulguları, 27 Eylül 2026):
//  • Rıza OPT-IN'dir: varsayılan KAPALI, önceden işaretli kutu yoktur.
//  • "Hepsini Kabul Et" / "Hepsini Reddet" / "Tercihleri Yönet" butonları
//    EŞİT BELİRGİNLİKTE yan yana durur; reddetmenin kabul kadar kolay
//    olması gerekir (rıza reddi de mümkün olmalı — m.5/1).
//  • ZORUNLU çerezler (iletişimin teknik olarak sağlanması) için rıza
//    GEREKMEZ; ancak aydınlatma (envanter) yükümlülüğü devam eder.
//  • Bu sitede 3. taraf analitik/reklam çerezi KULLANILMAZ (GA/GTM/Meta
//    yoktur); envanterde yalnızca 1. taraf zorunlu ve işlevsel anahtarlar
//    listelenir. Tedarikçi çerezleri ileride eklenecek olursa rıza
//    alınmadan devreye ALINMAZ — bu banner onları kapsayacak şekilde
//    hazırdır (analitik/pazarlama anahtarları varsayılan kapalıdır).
//  • Geri alma kolay olmalı: sayfa altındaki 🍪 düğmesi her an banner'ı
//    yeniden açar; tercihler anında uygulanır ve saklanır.
//  • Aydınlatma yükümlülüğü banner'dan AYRI olarak Yasal modal →
//    "KVKK Aydınlatma" sekmesinde yerine getirilir (openLegalTab).
// ════════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { openLegalTab } from "../legalTabs";
import { translate } from "../i18n";

const COOKIE_KEY = "nur_cookie_consent";
// ★ SÜRÜM NOTU: kullanıcı tercihi — onay BİR KEZ verilirse, çerezler cihazdan silinmedikçe
//   banner bir daha AÇILMAZ. Metin küçük değişse de onay geçerli kalır; kullanıcı zaten 🍪
//   düğmesinden her an tercihlerini görüp değiştirebilir (geri alma hakkı korunur).
//   Kaydedilen v alanı yalnızca denetim (audit) amaçlı saklanır.
const CONSENT_VERSION = "2026-09-27";

export interface CookieSettings {
  /** Zorunlu — rıza gerektirmez, her zaman açık */
  necessary: true;
  /** Analitik / performans — sitede 3. taraf analitik kullanılmaz; ileride eklenirse bu anahtar açık rıza ile devreye alınır */
  analytics: boolean;
  /** Pazarlama / tedarikçi çerezleri — kullanılmıyor; rıza opt-in kalır */
  marketing: boolean;
}

const DEFAULTS: CookieSettings = { necessary: true, analytics: false, marketing: false };

/** Kayıt varsa her zaman döner — sürüm farkı onayı geçersizleştirmez (kullanıcı kararı: banner bir daha çıkmasın). */
export function getCookieConsent(): CookieSettings | null {
  try {
    const raw = localStorage.getItem(COOKIE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieSettings & { v?: string };
    // Eski sürüm kaydında gerekli alanlar yoksa güvenli varsayılara düş (rıza opt-in kalır)
    if (typeof parsed.analytics !== "boolean" || typeof parsed.marketing !== "boolean") {
      return { necessary: true, analytics: false, marketing: false };
    }
    return { necessary: true, analytics: parsed.analytics, marketing: parsed.marketing };
  } catch {
    return null;
  }
}

/** Analitik/ölçüm anahtarını consent'li şekilde çalıştırmak için: getCookieConsent()?.analytics */
export function analyticsIzinli(): boolean {
  return getCookieConsent()?.analytics === true;
}

interface EnvanterSatiri {
  ad: string;
  tarafKey: string;
  amaçKey: string;
  süreKey: string;
}

// ★ ÇEREZ ENVANTERİ — Çerez Rehberi şartı: her çerez için ad, amaç, taraf, saklama süresi.
//   Metinler t() anahtarlarıdır (05: prompt-0) — 5 dilde çevirili.
//   LocalStorage/oturum anahtarları da Rehber'de "çerez" başlığında bilgilendirme kapsamındadır.
const ENVANTER: EnvanterSatiri[] = [
  { ad: "nur_session", tarafKey: "cookieFirstParty", amaçKey: "cookieEnvSession", süreKey: "cookieSureSession" },
  { ad: "nur_theme, nur_lang", tarafKey: "cookieFirstParty", amaçKey: "cookieEnvTema", süreKey: "cookieSureDays365" },
  { ad: "nur_cookie_consent", tarafKey: "cookieFirstParty", amaçKey: "cookieEnvConsent", süreKey: "cookieSureDays365" },
  { ad: "nur_wallet, üretim hakkı sayacı", tarafKey: "cookieFirstParty", amaçKey: "cookieEnvHak", süreKey: "cookieSureDays365" },
  { ad: "nur_push_token", tarafKey: "cookieFirstParty", amaçKey: "cookieEnvPush", süreKey: "cookieSureWhilePermitted" },
];

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showEnvanter, setShowEnvanter] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  // ★ i18n: dil localStorage'dan (nur_lang), fallback translate() içinde TR→EN
  const t = (key: string) => translate(localStorage.getItem("nur_lang"), key);

  useEffect(() => {
    const existing = getCookieConsent();
    if (!existing) {
      // Kısa gecikme — sayfa yüklensin, kanka banner patlamasın
      const t0 = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(t0);
    }
    setAnalytics(existing.analytics);
    setMarketing(existing.marketing);
  }, []);

  // 🍪 ayar düğmesi "Detaylı Ayarlar" dediğinde banner yeniden açılır (geri alma hakkı)
  useEffect(() => {
    const tekrar = () => { setVisible(true); setShowDetails(true); };
    window.addEventListener("cookie-consent-tekrar", tekrar);
    return () => window.removeEventListener("cookie-consent-tekrar", tekrar);
  }, []);

  function save(prefs: { analytics: boolean; marketing: boolean }) {
    const payload = { necessary: true as const, analytics: prefs.analytics, marketing: prefs.marketing, v: CONSENT_VERSION };
    try {
      localStorage.setItem(COOKIE_KEY, JSON.stringify(payload));
    } catch { /* depolama kapalıysa da site çalışır */ }
    setVisible(false);
    window.dispatchEvent(new CustomEvent("cookie-consent", { detail: payload }));
  }

  function handleAcceptAll() {
    setAnalytics(true);
    setMarketing(true);
    save({ analytics: true, marketing: true });
  }

  function handleRejectAll() {
    setAnalytics(false);
    setMarketing(false);
    save({ analytics: false, marketing: false });
  }

  function handleSaveSettings() {
    save({ analytics, marketing });
  }

  const btnEsit =
    "flex-1 rounded-xl px-3 py-2.5 text-[12px] font-bold transition border";

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center p-4 sm:items-center" role="dialog" aria-modal="true" aria-label={t("cookieTitle")}>
      {/* Arka plan — tıklamak red sayılmaz (dark pattern yok); bilinçli buton gerekli */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-white/10 bg-[#0d1117] p-5 shadow-2xl sm:p-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-2xl">🍪</span>
          <h3 className="text-lg font-bold text-white">{t("cookieTitle")}</h3>
        </div>

        <p className="mb-3 text-sm leading-relaxed text-white/70">
          {t("cookieDesc")} {t("cookieEditAnytime")}
        </p>

        {/* DETAYLI AYARLAR */}
        {showDetails && (
          <div className="mb-4 space-y-3 rounded-xl border border-white/5 bg-white/5 p-4">
            {/* Zorunlu — her zaman açık, kapatılamaz */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-white">{t("cookieNecessaryTitle")}</span>
                <p className="text-xs text-white/50">{t("cookieNecessaryDesc")}</p>
              </div>
              <div className="h-6 w-11 rounded-full bg-emerald-500 opacity-60 relative">
                <div className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow" />
              </div>
            </div>

            {/* Analitik — opt-in */}
            <label className="flex cursor-pointer items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-white">{t("cookieAnalyticsTitle")}</span>
                <p className="text-xs text-white/50">{t("cookieAnalyticsDesc")}</p>
              </div>
              <div className="relative">
                <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} className="peer sr-only" />
                <div className={`h-6 w-11 rounded-full transition-colors ${analytics ? "bg-emerald-500" : "bg-white/20"}`} />
                <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${analytics ? "right-0.5" : "right-5.5"}`} />
              </div>
            </label>

            {/* Pazarlama — opt-in */}
            <label className="flex cursor-pointer items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-white">{t("cookieMarketingTitle")}</span>
                <p className="text-xs text-white/50">{t("cookieMarketingDesc")}</p>
              </div>
              <div className="relative">
                <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="peer sr-only" />
                <div className={`h-6 w-11 rounded-full transition-colors ${marketing ? "bg-emerald-500" : "bg-white/20"}`} />
                <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${marketing ? "right-0.5" : "right-5.5"}`} />
              </div>
            </label>

            {/* ENVANTER — Rehber şartı: ad + amaç + taraf + süre */}
            <div className="border-t border-white/5 pt-2">
              <button type="button" onClick={() => setShowEnvanter((v) => !v)} className="text-[11px] font-bold text-[var(--accent)] hover:text-white">
                {showEnvanter ? t("cookieInventoryHide") : t("cookieInventoryShow")}
              </button>
              {showEnvanter && (
                <div className="mt-2 space-y-1.5">
                  {ENVANTER.map((s) => (
                    <div key={s.ad} className="rounded-lg bg-black/30 px-3 py-2 text-[10.5px] leading-snug text-white/70">
                      <span className="font-mono font-bold text-white/90">{s.ad}</span>
                      <span className="ml-1.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] text-white/60">{t(s.tarafKey)}</span>
                      <p className="mt-0.5">{t("cookiePurposeLabel")} {t(s.amaçKey)}</p>
                      <p>{t("cookieDurationLabel")} {t(s.süreKey)}</p>
                    </div>
                  ))}
                  <p className="text-[9.5px] text-white/40">
                    {t("cookieNoThirdParty")}
                  </p>
                </div>
              )}
            </div>

            <p className="text-xs text-white/40">
              {t("cookieRetentionNote")} {t("cookieEditAnytime")}{" "}
              <button type="button" onClick={() => { try { localStorage.removeItem(COOKIE_KEY); } catch { /* yoksay */ } setVisible(true); setShowDetails(true); }} className="underline text-[var(--accent)] hover:text-white">
                {t("cookieResetAll")}
              </button>.
            </p>
          </div>
        )}

        {/* BUTONLAR — EŞİT BELİRGİNLİK: Kabul / Reddet / Tercihler aynı görsel ağırlıkta */}
        <div className="flex flex-wrap gap-2">
          {!showDetails ? (
            <>
              <button type="button" onClick={handleAcceptAll} className={btnEsit + " bg-[var(--accent)] text-white hover:opacity-90"} style={{ borderColor: "var(--accent)" }}>
                {t("cookieAcceptAll")}
              </button>
              <button type="button" onClick={handleRejectAll} className={btnEsit + " bg-white/5 text-white hover:bg-white/15"} style={{ borderColor: "rgba(255,255,255,.25)" }}>
                {t("cookieRejectAll")}
              </button>
              <button type="button" onClick={() => setShowDetails(true)} className={btnEsit + " bg-transparent text-white/80 hover:bg-white/10"} style={{ borderColor: "rgba(255,255,255,.25)" }}>
                {t("cookieDetailedSettings")}
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={handleSaveSettings} className={btnEsit + " bg-[var(--accent)] text-white hover:opacity-90"} style={{ borderColor: "var(--accent)" }}>
                {t("cookieSaveSettings")}
              </button>
              <button type="button" onClick={handleRejectAll} className={btnEsit + " bg-white/5 text-white hover:bg-white/15"} style={{ borderColor: "rgba(255,255,255,.25)" }}>
                {t("cookieRejectAll")}
              </button>
              <button type="button" onClick={handleAcceptAll} className={btnEsit + " bg-transparent text-white/80 hover:bg-white/10"} style={{ borderColor: "rgba(255,255,255,.25)" }}>
                {t("cookieAcceptAll")}
              </button>
            </>
          )}
        </div>

        {/* YASAL BAĞLANTILAR — yerel yasal modalı açar (404 sayfası YOK) */}
        <p className="mt-3 text-center text-[10px] text-white/30">
          {t("cookieMoreInfoPrefix")}:{" "}
          <button type="button" onClick={() => { setVisible(false); openLegalTab("kvkk"); }} className="underline hover:text-white/60">{t("cookieKvkkLink")}</button>
          {" · "}
          <button type="button" onClick={() => { setVisible(false); openLegalTab("gizlilik"); }} className="underline hover:text-white/60">{t("cookiePrivacyLink")}</button>
        </p>
      </div>
    </div>
  );
}

/** Sayfa köşesindeki 🍪 düğmesi — geri alma hakkının "her sayfadan erişimi" (Rehber şartı) */
export function CookieAyarDugmesi() {
  const [open, setOpen] = useState(false);
  const t = (key: string) => translate(localStorage.getItem("nur_lang"), key);

  useEffect(() => {
    const ac = (e: Event) => { setOpen(false); void (e as CustomEvent).detail; };
    window.addEventListener("cookie-consent", ac);
    return () => window.removeEventListener("cookie-consent", ac);
  }, []);

  function banneriAc() {
    // Tercihi sil → CookieConsent useEffect'i yeniden göstermez (mount aşaması geçti);
    // bu yüzden düğme ayrı bir küçük panel açar: onay sıfırla + yeniden seçtir.
    try { localStorage.removeItem(COOKIE_KEY); } catch { /* yoksay */ }
    setOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={banneriAc}
        title={t("cookieTitle")}
        aria-label={t("cookieTitle")}
        className="glass-soft fixed bottom-3 left-3 z-[60] rounded-full p-2 text-white/40 transition hover:text-white"
      >
        🍪
      </button>

      {open && (
        <div className="fixed bottom-14 left-3 z-[9999] w-[calc(100vw-24px)] max-w-sm rounded-2xl border border-white/10 bg-[#0d1117] p-4 shadow-2xl">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-bold text-white">🍪 {t("cookieTitle")}</span>
            <button type="button" onClick={() => setOpen(false)} className="text-white/40 hover:text-white" aria-label={t("close")}>✕</button>
          </div>
          <p className="mb-3 text-[11px] leading-relaxed text-white/60">
            {t("cookieConsentResetMsg")}
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={() => { setOpen(false); window.dispatchEvent(new CustomEvent("cookie-consent-tekrar", { detail: true })); }} className="flex-1 rounded-xl bg-[var(--accent)] px-3 py-2 text-[11px] font-bold text-white hover:opacity-90">
              {t("cookieDetailedSettings")}
            </button>
            <button type="button" onClick={() => { try { localStorage.setItem(COOKIE_KEY, JSON.stringify({ necessary: true as const, analytics: false, marketing: false, v: CONSENT_VERSION })); } catch { /* yoksay */ } setOpen(false); }} className="flex-1 rounded-xl border border-white/25 bg-white/5 px-3 py-2 text-[11px] font-semibold text-white hover:bg-white/15">
              {t("cookieOnlyNecessary")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
