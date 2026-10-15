import { useEffect } from "react";
import { getCookieConsent } from "../components/CookieConsent";

// ════════════════════════════════════════════════════════
// ANALYTICS HOOK — ücretsiz, kendi verimiz.
// Site tanıtıma çıktığında "kaç kişi geldi, nereden geldi,
// hangi cihazdan" sorularının cevabını Supabase'e (mevcut
// nur_page_views tablosuna) yazar. Hiçbir üçüncü taraf
// pazarlama SDK'sı kullanılmaz.
//
// ★ KVKK ÇEREZ-ONAY KAPISI (16.10): CookieConsent banner'ında
//   "Analitik" kategorisi açık rıza gerektiriyor; hook daha önce
//   rızaya bakmaksızın direkt POST atıyordu — banner'ın "analitik
//   yok" açıklamasıyla çelişiyordu. Artık kullanıcı çerez
//   tercihlerinde Analitik'i açık seçmemişse istek HİÇ gönderilmez.
// ════════════════════════════════════════════════════════

const SESSION_FLAG_KEY = "nur_analytics_session_sent";

export function useAnalytics() {
  useEffect(() => {
    // Aynı oturumda (sekme kapanana kadar) tekrar tekrar göndermeyelim.
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(SESSION_FLAG_KEY)) return;
      sessionStorage.setItem(SESSION_FLAG_KEY, "1");
    } catch {
      // sessionStorage kapalıysa yine de bir kereliğine gönder
    }

    // ★ ÇEREZ RIZASI: analitik kategorisi açık değilse sayaç gönderilmez (KVKK opt-in).
    if (getCookieConsent()?.analytics !== true) return;

    const payload = {
      path: window.location.pathname || "/",
      referrer: document.referrer || "",
      screen: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
      lang: navigator.language || "",
    };

    // Sayfa yüklenmesini asla geciktirmesin diye sonraya bırakılır.
    const timer = window.setTimeout(() => {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => undefined);
    }, 1500);

    return () => window.clearTimeout(timer);
  }, []);
}
