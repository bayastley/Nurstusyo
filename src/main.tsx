import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { initErrorReport } from "./utils/errorReport";
import { dilSaukle } from "./i18n";
import { chunkKurtarmayiKur } from "./chunkKurtarma"; // ★ 18.10 deploy-chunk kurtarması

// Global hata izleme — Sentry'siz, kendi altyapımızda
initErrorReport();
// ★ 18.10: lazy chunk yüklenemezse (deploy sonrası eski HTML) tek reload ile kurtar
chunkKurtarmayiKur();

// ★ 21.10 PWA TEK TIK KURULUM YAKALAYICISI (kullanıcı: "şimdi kura tıklayınca kursun"):
//   KÖK NEDEN — beforeinstallprompt, dil yükleme (dilSaukle promise) + lazy StudioApp
//   yüzünden PwaKurulumBanneri mount'tan ÖNCE açılışta ateşleniyordu; React tarafı
//   kaçan olayı ASLA alamıyordu (Chrome olayı sayfa başına bir kez basar) → "ŞİMDİ KUR"
//   hep manuel talimat paneline düşüyordu. Çözüm: en erken noktada global yakala;
//   banner mount'ta window.__nur_bip'ten devralır, hiçbir zaman kaçmaz.
(function pwaBipCapture() {
  const tut = (e: Event) => {
    e.preventDefault();
    (window as any).__nur_bip = e;
    window.dispatchEvent(new Event("nur_bip_ok")); // banner açık anında devralabilsin diye haber
  };
  window.addEventListener("beforeinstallprompt", tut, { once: true });
  window.addEventListener("appinstalled", () => {
    (window as any).__nur_bip = undefined; // tüketildi
    try { localStorage.setItem("nur_pwa_kuruldu", "1"); } catch { /* yut */ }
  });
})();

// ★ 16.10 MOBİL HIZ: 5 dilli i18n sözlükleri (~380KB) ana chunk'tan çıkartıldı.
//   Yalnız TR eager'dır; kullanıcı dil localStorage'da tr değilse mount'tan ÖNCE
//   tek JSON chunk'ı paralel yüklenir (TR'de 0 gecikme; diğer dillerde bir istek).
const ilkDil = (() => { try { return localStorage.getItem("nur_lang") || "tr"; } catch { return "tr"; } })();

dilSaukle(ilkDil).finally(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
