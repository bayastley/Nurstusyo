import { useState, useEffect } from "react";

const COOKIE_KEY = "nur_cookie_consent";

interface CookieSettings {
  necessary: boolean; // Zorunlu — kapatılamaz
  analytics: boolean; // Google Analytics
  marketing: boolean; // Reklam / yeniden hedefleme
}

const DEFAULTS: CookieSettings = {
  necessary: true,
  analytics: false,
  marketing: false,
};

export function getCookieConsent(): CookieSettings | null {
  try {
    const raw = localStorage.getItem(COOKIE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CookieSettings;
  } catch {
    return null;
  }
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [settings, setSettings] = useState<CookieSettings>(DEFAULTS);

  useEffect(() => {
    const existing = getCookieConsent();
    if (!existing) {
      // Kısa gecikme — sayfa yüklensin
      const t = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  function save(prefs: CookieSettings) {
    localStorage.setItem(COOKIE_KEY, JSON.stringify(prefs));
    setVisible(false);
    // Tracking'leri aç/kapat
    if (prefs.analytics) {
      // Google Analytics consent granted
      window.dispatchEvent(new CustomEvent("cookie-consent", { detail: prefs }));
    }
    if (prefs.marketing) {
      window.dispatchEvent(new CustomEvent("cookie-consent", { detail: prefs }));
    }
  }

  function handleAcceptAll() {
    save({ necessary: true, analytics: true, marketing: true });
  }

  function handleRejectAll() {
    save({ necessary: true, analytics: false, marketing: false });
  }

  function handleSaveSettings() {
    save({ necessary: true, ...settings });
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center p-4 sm:items-center">
      {/* Arka plan overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleRejectAll} />

      {/* Banner */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-white/10 bg-[#0d1117] p-5 shadow-2xl sm:p-6">
        {/* Başlık */}
        <div className="mb-3 flex items-center gap-2">
          <span className="text-2xl">🍪</span>
          <h3 className="text-lg font-bold text-white">Çerez Tercihleri</h3>
        </div>

        {/* Açıklama */}
        <p className="mb-4 text-sm leading-relaxed text-white/70">
          Bu web sitesi, deneyiminizi geliştirmek ve hizmetlerimizi sunmak için çerezler kullanır.
          <strong className="text-white/90"> 6698 sayılı KVKK</strong> ve
          <strong className="text-white/90"> GDPR</strong> kapsamında çerez tercihlerinizi
          yönetebilirsiniz.
        </p>

        {/* Detaylı ayarlar */}
        {showDetails && (
          <div className="mb-4 space-y-3 rounded-xl border border-white/5 bg-white/5 p-4">
            {/* Zorunlu Çerezler */}
            <label className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-white">Zorunlu Çerezler</span>
                <p className="text-xs text-white/50">Site çalışması için gerekli</p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked
                  disabled
                  className="peer sr-only"
                />
                <div className="h-6 w-11 rounded-full bg-emerald-500 opacity-60" />
                <div className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition" />
              </div>
            </label>

            {/* Analitik Çerezler */}
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-sm font-semibold text-white">Analitik Çerezler</span>
                <p className="text-xs text-white/50">Google Analytics — site kullanımı</p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={settings.analytics}
                  onChange={(e) => setSettings({ ...settings, analytics: e.target.checked })}
                  className="peer sr-only"
                />
                <div className={`h-6 w-11 rounded-full transition-colors ${settings.analytics ? "bg-emerald-500" : "bg-white/20"}`} />
                <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${settings.analytics ? "right-0.5" : "right-5.5"}`} />
              </div>
            </label>

            {/* Pazarlama Çerezleri */}
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-sm font-semibold text-white">Pazarlama Çerezleri</span>
                <p className="text-xs text-white/50">Kişiselleştirilmiş reklamlar</p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={settings.marketing}
                  onChange={(e) => setSettings({ ...settings, marketing: e.target.checked })}
                  className="peer sr-only"
                />
                <div className={`h-6 w-11 rounded-full transition-colors ${settings.marketing ? "bg-emerald-500" : "bg-white/20"}`} />
                <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${settings.marketing ? "right-0.5" : "right-5.5"}`} />
              </div>
            </label>

            <p className="text-xs text-white/40 pt-2 border-t border-white/5">
              Tercihleriniz 365 gün boyunca saklanır. Dilediğiniz zaman{" "}
              <button onClick={() => { localStorage.removeItem(COOKIE_KEY); setVisible(true); }} className="underline text-[var(--accent)] hover:text-white">
                tekrar düzenleyebilirsiniz
              </button>.
            </p>
          </div>
        )}

        {/* Butonlar */}
        <div className="flex flex-wrap gap-2">
          {!showDetails ? (
            <>
              <button
                onClick={handleAcceptAll}
                className="flex-1 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-white hover:opacity-90 transition"
              >
                Tümünü Kabul Et
              </button>
              <button
                onClick={handleRejectAll}
                className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/5 transition"
              >
                Reddet
              </button>
              <button
                onClick={() => setShowDetails(true)}
                className="w-full rounded-xl border border-white/10 px-4 py-2 text-xs text-white/50 hover:text-white/70 hover:bg-white/5 transition"
              >
                ⚙️ Detaylı Ayarlar
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSaveSettings}
                className="flex-1 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-white hover:opacity-90 transition"
              >
                Tercihleri Kaydet
              </button>
              <button
                onClick={handleAcceptAll}
                className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/5 transition"
              >
                Tümünü Kabul Et
              </button>
            </>
          )}
        </div>

        {/* Yasal bilgi */}
        <p className="mt-3 text-center text-[10px] text-white/30">
          detaylı bilgi için{" "}
          <a href="/kvkk" className="underline hover:text-white/50">KVKK Aydınlatma Metni</a>
          {" "}ve{" "}
          <a href="/gizlilik" className="underline hover:text-white/50">Gizlilik Politikası</a>
        </p>
      </div>
    </div>
  );
}
