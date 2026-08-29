import type { VercelRequest, VercelResponse } from "@vercel/node";

const ALLOWED_ORIGINS = new Set([
  "http://localhost:5173",
  "http://localhost:5174",
  "https://nurstudyo.com",
  "https://www.nurstudyo.com",
]);
const HITS = new Map<string, number[]>();

function allowRequest(req: VercelRequest, res: VercelResponse): boolean {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    res.status(403).json({ ok: false, error: "İzin verilmeyen istek kaynağı" });
    return false;
  }

  const ip = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown").split(",")[0].trim();
  const now = Date.now();
  const hits = (HITS.get(ip) || []).filter((hit) => hit >= now - 60_000);
  if (hits.length >= 20) {
    res.setHeader("Retry-After", "60");
    res.status(429).json({ ok: false, error: "İstek işlenemedi" });
    return false;
  }
  hits.push(now);
  HITS.set(ip, hits);
  return true;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  if (!allowRequest(req, res)) return;
  const proto = String(req.headers["x-forwarded-proto"] || "").split(",")[0]?.trim();
  const secure = proto === "https" || String(req.headers.origin || "").startsWith("https://");
  res.setHeader("Set-Cookie", `nur_session=; Path=/; HttpOnly; ${secure ? "Secure; " : ""}SameSite=Lax; Max-Age=0`);
  return res.status(200).json({ ok: true });
}
