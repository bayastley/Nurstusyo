import type { VercelRequest, VercelResponse } from "@vercel/node";

declare const process: { env: Record<string, string | undefined> };

const DEFAULT_ALLOWED_ORIGINS = [
  "https://nurstudyo.com",
  "https://www.nurstudyo.com",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5199",
];

function allowedOrigins(): Set<string> {
  const envOrigins = (process.env.NUR_ALLOWED_ORIGINS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return new Set([...DEFAULT_ALLOWED_ORIGINS, ...envOrigins]);
}

export function originAllowed(req: VercelRequest, opts?: { allowMissing?: boolean }): boolean {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";
  const referer = typeof req.headers.referer === "string" ? req.headers.referer : "";
  const allowed = allowedOrigins();

  // Varsayılan FAIL-CLOSED. allowMissing:true sadece beacon/analytics/push gibi Origin göndermeyebilen uçlar için.
  if (!origin && !referer) return opts?.allowMissing === true;

  if (origin && allowed.has(origin)) return true;
  if (referer) {
    try {
      if (allowed.has(new URL(referer).origin)) return true;
    } catch {
      /* beklenen: bozuk referer */
    }
  }
  return false;
}

export function assertOrigin(req: VercelRequest, res: VercelResponse, opts?: { allowMissing?: boolean }): boolean {
  if (originAllowed(req, opts)) return true;
  res.status(403).json({ ok: false, error: "İzin verilmeyen istek kaynağı" });
  return false;
}
