// ════════════════════════════════════════════════════════════════
// DEBUGGUIDE.TS — Otomatik Akıllı Hata Kılavuzu & Crash Yakalayıcı
// ════════════════════════════════════════════════════════════════

export interface DebugGuideMessage {
  title: string;
  subtitle: string;
  steps: string[];
  rawError?: string;
}

export const DEBUG_GUIDE_TEXT: DebugGuideMessage = {
  title: "⏱️ Tarayıcınızda geçici bir takılma oldu",
  subtitle: "Lütfen şu 3 adımı sırayla deneyiniz:",
  steps: [
    "1. Sayfayı yenileyin (F5).",
    "2. Tarayıcı önbelleğinizi temizleyin veya Gizli Sekmeden giriş yapın.",
    "3. Sorun devam ederse lütfen aygıt sürücülerinizin güncel olduğundan emin olun.",
  ],
};

let errorListener: ((err: DebugGuideMessage) => void) | null = null;

export function onErrorCaptured(listener: (err: DebugGuideMessage) => void) {
  errorListener = listener;
}

export function reportRenderError(error?: unknown) {
  console.error("[Nûr Stüdyo Render Crash]", error);
  const errMsg = error instanceof Error ? error.message : String(error || "");
  if (errorListener) {
    errorListener({
      ...DEBUG_GUIDE_TEXT,
      rawError: errMsg,
    });
  }
}

// Global unhandled error & rejection listeners
if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    // Only capture video/canvas/media-recorder/render errors
    if (
      event.message?.includes("MediaRecorder") ||
      event.message?.includes("canvas") ||
      event.message?.includes("AudioContext") ||
      event.message?.includes("memory") ||
      event.message?.includes("out of memory")
    ) {
      reportRenderError(event.error || event.message);
    }
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = String(event.reason || "");
    if (
      reason.includes("MediaRecorder") ||
      reason.includes("canvas") ||
      reason.includes("AudioContext") ||
      reason.includes("decodeAudioData")
    ) {
      reportRenderError(event.reason);
    }
  });
}
