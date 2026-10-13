import type { VercelRequest, VercelResponse } from "@vercel/node";

declare const process: { env: Record<string, string | undefined> };

const DEFAULT_ALLOWED_ORIGINS = [
  "https://nurstudyo.com",
  "https://www.nurstudyo.com",
  "http://localhost:5173",
  "http://localhost:5174",
];

function allowedOrigins(): Set<string> {
  const envOrigins = (process.env.NUR_ALLOWED_ORIGINS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return new Set([...DEFAULT_ALLOWED_ORIGINS, ...envOrigins]);
}

export function requireAllowedOrigin(req: VercelRequest, res: VercelResponse): boolean {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";
  const referer = typeof req.headers.referer === "string" ? req.headers.referer : "";
  const allowed = allowedOrigins();

  // Same-origin server-to-server/webhook tarzı isteklerde Origin olmayabilir.
  // ★ Sertleştirme (13.10): boş Origin+Referer artık SADECE NUR_ALLOW_NO_ORIGIN=1
  //   iken geçer (webhook'suz uçlar için kapatın). Varsayılan: RED.
  if (!origin && !referer) {
    if (process.env.NUR_ALLOW_NO_ORIGIN === "1") return true;
    res.status(403).json({ ok: false, error: "İzin verilmeyen istek kaynağı" });
    return false;
  }

  if (origin && allowed.has(origin)) return true;

  if (referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      if (allowed.has(refererOrigin)) return true;
    } catch {
      // ignore malformed referer
    }
  }

  res.status(403).json({ ok: false, error: "İzin verilmeyen istek kaynağı" });
  return false;
}
