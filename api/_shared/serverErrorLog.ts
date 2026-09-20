import type { VercelRequest } from "@vercel/node";
import crypto from "crypto";

declare const process: { env: Record<string, string | undefined> };

// ═══════════════════════════════════════════════════════════
// serverErrorLog — sunucu (Vercel API) hatalarını nur_error_logs'a
// yazar. Böylece admin paneldeki Hata Logları sekmesi hem tarayıcı
// hem sunucu hatalarını TEK YERDE gösterir.
//
// KURAL: Bu fonksiyon ASLA hata fırlatmaz / siteyi etkilemez.
//        Log yazımı başarısız olsa bile sessizce yutulur.
//
// KULLANIM (herhangi bir api/*.ts içinde):
//   import { logServerError } from "../_shared/serverErrorLog";
//   } catch (error) {
//     await logServerError(req, error, "payments/callback");
//     return res.status(500).json({ ok: false, error: "..." });
//   }
// ═══════════════════════════════════════════════════════════

/** Hata mesajı + stack'ten tür tahmini (client tarafıyla aynı kurallar) */
function detectKind(message: string, stack: string, path: string): string {
  const hay = `${message} ${stack} ${path}`.toLowerCase();
  if (hay.includes("iyzico") || hay.includes("payment") || hay.includes("checkout") || hay.includes("ödeme") || hay.includes("odeme")) return "payment";
  if (hay.includes("render") || hay.includes("video") || hay.includes("ffmpeg") || hay.includes("r2:") || hay.includes("upload") || hay.includes("s3") || hay.includes("bucket")) return "video";
  if (hay.includes("auth") || hay.includes("google") || hay.includes("session") || hay.includes("token")) return "auth";
  if (hay.includes("audio") || hay.includes("tts") || hay.includes("elevenlabs")) return "audio";
  if (hay.includes("supabase") || hay.includes("fetch failed") || hay.includes("network") || hay.includes("econnrefused") || hay.includes("timeout")) return "network";
  return "genel";
}

/**
 * Sunucu hatasını nur_error_logs'a yazar.
 * - message: hata mesajı (500 char)
 * - stack:    yığın izi (4000 char)
 * - source:  "server:<endpoint-adı>" — panelde 🖥️ rozetiyle ayrışır
 * - path:    istek yolu (örn. /api/admin/action)
 * Aynı hata 5 dk içinde tekrar gelirse yazmaz (spam koruması).
 */
export async function logServerError(
  req: VercelRequest,
  error: unknown,
  endpoint: string,
): Promise<void> {
  try {
    const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim().replace(/\/$/, "");
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    if (!url || !key) return; // DB yoksa sessizce çık — log yazımı siteyi bozmaz

    const message = error instanceof Error ? error.message : String(error || "Bilinmeyen sunucu hatası");
    if (!message) return;
    const stack = error instanceof Error ? (error.stack || "") : "";

    const path = String(req.url || endpoint).slice(0, 200);
    const kind = detectKind(message, stack, path);
    const userAgent = String(req.headers["user-agent"] || "server").slice(0, 300);

    // Aynı hata 5 dk içinde tekrar gelirse yut (memory-based dedupe)
    const fingerprint = crypto.createHash("sha256").update(`${message}|${path}`).digest("hex").slice(0, 16);
    const g = globalThis as unknown as { __nurSrvErrFp?: Map<string, number[]> };
    if (!g.__nurSrvErrFp) g.__nurSrvErrFp = new Map();
    const fpMap = g.__nurSrvErrFp;
    const cutoff = Date.now() - 5 * 60_000;
    const hits = (fpMap.get(fingerprint) || []).filter((h) => h >= cutoff);
    if (hits.length >= 5) { fpMap.set(fingerprint, hits); return; }
    hits.push(Date.now());
    fpMap.set(fingerprint, hits);

    await fetch(`${url}/rest/v1/nur_error_logs`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        message: message.slice(0, 500),
        stack: stack.slice(0, 4000),
        path,
        source: `server:${endpoint}`.slice(0, 40),
        user_agent: userAgent,
        fingerprint,
        kind,
        user_email: "", // sunucu hatasında kullanıcı kimliği bilinmiyor
      }),
    });
  } catch {
    // Log yazımı başarısız — ASLA üst katmana hata fırlatma
  }
}
