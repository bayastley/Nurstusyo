// ═══════════════════════════════════════════════════════════
// errorReport — global hata yakalama + raporlama.
// Sentry'siz hata izleme: patlayan her hata /api/analytics/error
// ucuna yazılır, admin panelde görülebilir. Siteyi ASLA bozmaz.
// Kurulum: initErrorReport() — main.tsx'te bir kez çağrılır.
// ★ v2: her kayda "kim yaşadı" (e-posta) eklenir → admin panelde
//   "🎬 Video üretim hatası — ahmet@gmail.com" gibi okunur satırlar.
// ═══════════════════════════════════════════════════════════

import { secureGet } from "../secureStore";

let gonderildi = new Set<string>(); // aynı hata oturumda 1 kez

// ★ Oturumdaki kullanıcının e-postası — hata anında okunur (giriş yoksa boş)
function currentUserEmail(): string {
  try {
    const user = secureGet<{ email?: string } | null>("nur_user_v1", null);
    return typeof user?.email === "string" ? user.email.slice(0, 120) : "";
  } catch { return ""; }
}

// ★ Hata türü — sunucuyla aynı kurallar (detectKind), mesajdan Türkçe etiket
export function hataTuruEtiketi(kind: string): string {
  switch (kind) {
    case "video": return "🎬 Video üretim hatası";
    case "payment": return "💳 Ödeme hatası (iyzico)";
    case "auth": return "🔐 Giriş/oturum hatası";
    case "upload": return "☁️ Yükleme hatası (R2)";
    case "audio": return "🎧 Ses hatası";
    case "network": return "🌐 Bağlantı hatası";
    default: return "⚠️ Genel hata";
  }
}

function raporla(source: string, message: string, stack?: string) {
  try {
    const key = `${source}:${message.slice(0, 120)}`;
    if (gonderildi.has(key)) return; // tekrar spam etme
    gonderildi.add(key);
    if (gonderildi.size > 50) gonderildi = new Set([...gonderildi].slice(-25));

    const payload = JSON.stringify({
      source,
      message: String(message).slice(0, 500),
      stack: String(stack || "").slice(0, 4000),
      path: location.pathname,
      userEmail: currentUserEmail(),
    });
    if (typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon("/api/analytics/error", new Blob([payload], { type: "application/json" }));
    } else {
      fetch("/api/analytics/error", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true }).catch(() => undefined);
    }
  } catch { /* raporlama asla uygulama etkilemesin */ }
}

export function initErrorReport() {
  if (typeof window === "undefined") return;
  window.addEventListener("error", (event) => {
    raporla("window", event.message, event.error?.stack);
  });
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    raporla("unhandledrejection", reason?.message || String(reason), reason?.stack);
  });
}
