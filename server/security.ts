import type { VercelRequest, VercelResponse } from "@vercel/node";

const ALLOWED_ORIGINS = new Set([
  "http://localhost:5173",
  "http://localhost:5174",
  "https://nurstudyo.com",
  "https://www.nurstudyo.com",
]);

export function requireAllowedOrigin(req: VercelRequest, res: VercelResponse): boolean {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";

  if (!origin || !ALLOWED_ORIGINS.has(origin)) {
    res.status(403).json({ ok: false, error: "İzin verilmeyen istek kaynağı" });
    return false;
  }

  res.setHeader("Vary", "Origin");
  return true;
}
