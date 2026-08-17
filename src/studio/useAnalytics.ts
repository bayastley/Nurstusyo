import { useEffect } from "react";

// ════════════════════════════════════════════════════════
// ANALYTICS HOOK — ücretsiz, kendi verimiz.
// Site tanıtıma çıktığında "kaç kişi geldi, nereden geldi,
// hangi cihazdan" sorularının cevabını Supabase'e (mevcut
// nur_page_views tablosuna) yazar. Hiçbir üçüncü taraf
// pazarlama SDK'sı kullanılmaz — KVKK açısından da temizdir
// (kişi tanımlanamaz, sadece anonim sayaç).
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
