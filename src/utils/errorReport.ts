// ═══════════════════════════════════════════════════════════
// errorReport — global hata yakalama + raporlama.
// Sentry'siz hata izleme: patlayan her hata /api/analytics/error
// ucuna yazılır, admin panelde görülebilir. Siteyi ASLA bozmaz.
// Kurulum: initErrorReport() — main.tsx'te bir kez çağrılır.
// ═══════════════════════════════════════════════════════════

let gonderildi = new Set<string>(); // aynı hata oturumda 1 kez

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
