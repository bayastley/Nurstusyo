import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";


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
  } catch { /* log yazımı siteyi ASLA bozmaz */ }
}

// Self-contained rate limit — _shared importları Vercel'de paketlenmediği için gömüldü
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
async function rateLimitSilent(req: { headers: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string | null } }, key: string, maxRequests: number, windowMs: number): Promise<boolean> {
  const bucketKey = `${key}:${__rlIp(req)}`;
  const hits = await __rlShared(bucketKey, windowMs);
  if (hits !== null) return hits <= maxRequests;
  return __rlMem(bucketKey, maxRequests, windowMs);
}
async function rateLimitBucket(bucketKey: string, maxRequests: number, windowMs: number): Promise<boolean> {
  const hits = await __rlShared(bucketKey, windowMs);
  if (hits !== null) return hits <= maxRequests;
  return __rlMem(bucketKey, maxRequests, windowMs);
}


// ═══════════════════════════════════════════════════════════
// Self-contained — _shared importları Vercel'de çalışmıyor
// ═══════════════════════════════════════════════════════════

const COOKIE_NAME = "nur_session";

function parseCookies(req: VercelRequest): Record<string, string> {
  const header = req.headers.cookie || "";
  return header.split(";").reduce<Record<string, string>>((acc, part) => {
    const [key, ...rest] = part.trim().split("=");
    if (!key) return acc;
    acc[key] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
}

function sessionSecret(): string {
  return process.env.NUR_SESSION_SECRET || process.env.GOOGLE_CLIENT_SECRET || "";
}

function base64Url(input: Buffer | string): string {
  const raw = Buffer.isBuffer(input) ? input : Buffer.from(input, "utf8");
  return raw.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(input: string): Buffer {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4 ? "=".repeat(4 - (normalized.length % 4)) : "";
  return Buffer.from(normalized + pad, "base64");
}

function signPayload(payload: string): string {
  return base64Url(crypto.createHmac("sha256", sessionSecret()).update(payload).digest());
}

function getSessionUser(req: VercelRequest): { id: string; email: string; name: string } | null {
  const token = parseCookies(req)[COOKIE_NAME];
  if (!token || !token.includes(".")) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = signPayload(payload);
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;
  try {
    const user = JSON.parse(fromBase64Url(payload).toString("utf8"));
    if (!user.exp || user.exp < Math.floor(Date.now() / 1000)) return null;
    if (!user.email || !user.id) return null;
    return user;
  } catch {
    return null;
  }
}

function supabaseConfig() {
  // ★ URL NORMALİZASYONU (fetch failed çözümü)
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim().replace(/^["']+|["']+$/g, "").replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return { url, key };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }
  // ★ Merkezi rate limit — ban rapor flood'u DB'yi şişirmeden engellenir
  if (!(await rateLimit(req, res, "ban:report", 30, 60_000))) return;

  // Auto-ban devre dışı — sadece log tutuyoruz
  const autoBanEnabled = process.env.NUR_AUTO_BAN_ENABLED === "true";
  if (!autoBanEnabled) {
    console.log("[ban/report] Otomatik ban devre dışı — log tutuldu");
    return res.status(200).json({ ok: true, skipped: true });
  }

  const user = getSessionUser(req);
  if (!user) {
    return res.status(200).json({ ok: true, skipped: true, reason: "no-session" });
  }

  const rawReason = typeof req.body?.reason === "string" ? req.body.reason : "";
  const reason = (rawReason.trim() || "Sistem Verilerini Kurcalama").slice(0, 200);

  // Supabase'e ban kaydı ekle
  try {
    const { url, key } = supabaseConfig();
    if (url && key) {
      await fetch(`${url}/rest/v1/nur_ban_logs`, {
        method: "POST",
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          user_id: user.id,
          user_email: user.email.toLowerCase(),
          reason,
          banned_by: "Sistem Otomatik Guard",
          is_auto: true,
        }),
      });
    }
  } catch (error) {
    await logServerError(req, error, "api/ban/report");
    console.error("[ban/report] Supabase hatası:", error);
  }

  return res.status(200).json({ ok: true });
}
