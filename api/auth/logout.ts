import crypto from "crypto"; // ★ 27.09 FIX: require() ESM'de patlıyor — statik import
import type { VercelRequest, VercelResponse } from "@vercel/node";


// ─── Server error logger (gömülü — _shared Vercel'de paketlenmiyor) ───
async function logServerError(req: { url?: string; headers: Record<string, string | string[] | undefined> }, error: unknown, endpoint: string): Promise<void> {
  try {
    const __url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim().replace(/\/$/, "");
    const __key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    if (!__url || !__key) return;
    const __msg = error instanceof Error ? error.message : String(error || "Bilinmeyen sunucu hatası");
    if (!__msg) return;
    const __stack = error instanceof Error ? (error.stack || "") : "";
    const __path = String(req.url || endpoint).slice(0, 200);
    const __fingerprint = crypto.createHash("sha256").update(__msg + "|" + __path).digest("hex").slice(0, 16);
    await fetch(__url + "/rest/v1/nur_error_logs", {
      method: "POST",
      headers: { apikey: __key, Authorization: "Bearer " + __key, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        message: __msg.slice(0, 500),
        stack: __stack.slice(0, 4000),
        path: __path,
        source: ("server:" + endpoint).slice(0, 40),
        user_agent: String(req.headers["user-agent"] || "server").slice(0, 300),
        fingerprint: __fingerprint,
        kind: "genel",
        user_email: "",
      }),
    });
  } catch (error) {
    await logServerError(req, error, "auth/logout"); /* log yazımı siteyi ASLA bozmaz */ }
}

const ALLOWED_ORIGINS = new Set([
  "http://localhost:5173",
  "http://localhost:5174",
  "https://nurstudyo.com",
  "https://www.nurstudyo.com",
]);
// ★ PAYLAŞIMLI RATE LIMIT (Açık 2) — Upstash Redis varsa instance'lar arası
//   ortak sayaç (UPSTASH_REDIS_REST_URL/TOKEN env), yoksa in-memory fallback.
const __RL_MAP = new Map<string, number[]>();
const __RL_URL = (process.env.UPSTASH_REDIS_REST_URL || "").replace(/\/+$/, "");
const __RL_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || "";
const __RL_SHARED = __RL_URL.length > 0 && __RL_TOKEN.length > 0;
function __rlIp(req: { headers: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string | null } }): string {
  const forwarded = String(req.headers["cf-connecting-ip"] || req.headers["x-real-ip"] || String(req.headers["x-forwarded-for"] || "").split(",")[0] || "").trim();
  return forwarded || req.socket?.remoteAddress || "unknown";
}
function __rlMem(bucketKey: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const active = (__RL_MAP.get(bucketKey) || []).filter((h) => h >= now - windowMs);
  if (active.length >= max) { __RL_MAP.set(bucketKey, active); return false; }
  active.push(now);
  __RL_MAP.set(bucketKey, active);
  if (__RL_MAP.size > 5000) { for (const k of __RL_MAP.keys()) { __RL_MAP.delete(k); if (__RL_MAP.size <= 2500) break; } }
  return true;
}
async function __rlShared(bucketKey: string, windowMs: number): Promise<number | null> {
  if (!__RL_SHARED) return null;
  try {
    const res = await fetch(`${__RL_URL}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${__RL_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify([["INCR", `rl:${bucketKey}`], ["EXPIRE", `rl:${bucketKey}`, String(Math.ceil(windowMs / 1000)), "NX"]]),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as Array<{ result: unknown }>;
    return Number(json[0]?.result ?? 1);
  } catch { return null; }
}
async function rateLimit(req: { headers: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string | null } }, res: { setHeader: (k: string, v: string) => void; status: (n: number) => { json: (o: unknown) => void } }, key: string, maxRequests: number, windowMs: number): Promise<boolean> {
  const bucketKey = `${key}:${__rlIp(req)}`;
  const hits = await __rlShared(bucketKey, windowMs);
  if (hits !== null) {
    if (hits > maxRequests) { res.setHeader("Retry-After", "60"); res.setHeader("Cache-Control", "no-store"); res.status(429).json({ ok: false, error: "İstek işlenemedi" }); return false; }
    return true;
  }
  const ok = __rlMem(bucketKey, maxRequests, windowMs);
  if (!ok) { res.setHeader("Retry-After", "60"); res.setHeader("Cache-Control", "no-store"); res.status(429).json({ ok: false, error: "İstek işlenemedi" }); }
  return ok;
}

async function allowRequest(req: VercelRequest, res: VercelResponse): Promise<boolean> {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";
  // ★ GÜVENLİK: origin zorunlu — tarayıcı POST'ları her zaman origin gönderir.
  //   Boş origin = script isteği → CSRF-to-logout (kullanıcıyı oturumdan atma) engellenir.
  if (!origin || !ALLOWED_ORIGINS.has(origin)) {
    res.status(403).json({ ok: false, error: "İzin verilmeyen istek kaynağı" });
    return false;
  }

  return rateLimit(req, res, "auth:logout", 20, 60_000);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  if (!(await allowRequest(req, res))) return;
  const proto = String(req.headers["x-forwarded-proto"] || "").split(",")[0]?.trim();
  const secure = proto === "https" || String(req.headers.origin || "").startsWith("https://");
  res.setHeader("Set-Cookie", `nur_session=; Path=/; HttpOnly; ${secure ? "Secure; " : ""}SameSite=Lax; Max-Age=0`);
  return res.status(200).json({ ok: true });
}
