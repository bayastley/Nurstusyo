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
    const __fingerprint = require("crypto").createHash("sha256").update(__msg + "|" + __path).digest("hex").slice(0, 16);
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
const __buckets = new Map<string, { hits: number[] }>();
function rateLimit(req: { headers: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string } }, res: { setHeader: (k: string, v: string) => void; status: (n: number) => { json: (o: unknown) => void } }, key: string, maxRequests: number, windowMs: number): boolean {
  const forwarded = String(req.headers["cf-connecting-ip"] || req.headers["x-real-ip"] || String(req.headers["x-forwarded-for"] || "").split(",")[0] || "").trim();
  const ip = forwarded || req.socket?.remoteAddress || "unknown";
  const bucketKey = `${key}:${ip}`;
  const now = Date.now();
  const bucket = __buckets.get(bucketKey) ?? { hits: [] };
  const cutoff = now - windowMs;
  bucket.hits = bucket.hits.filter((hit) => hit >= cutoff);
  if (bucket.hits.length >= maxRequests) {
    res.setHeader("Retry-After", "60");
    res.setHeader("Cache-Control", "no-store");
    res.status(429).json({ ok: false, error: "İstek işlenemedi" });
    __buckets.set(bucketKey, bucket);
    return false;
  }
  bucket.hits.push(now);
  __buckets.set(bucketKey, bucket);
  return true;
}
function rateLimitSilent(req: { headers: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string } }, key: string, maxRequests: number, windowMs: number): boolean {
  const forwarded = String(req.headers["cf-connecting-ip"] || req.headers["x-real-ip"] || String(req.headers["x-forwarded-for"] || "").split(",")[0] || "").trim();
  const ip = forwarded || req.socket?.remoteAddress || "unknown";
  const bucketKey = `${key}:${ip}`;
  const now = Date.now();
  const bucket = __buckets.get(bucketKey) ?? { hits: [] };
  const cutoff = now - windowMs;
  bucket.hits = bucket.hits.filter((hit) => hit >= cutoff);
  if (bucket.hits.length >= maxRequests) { __buckets.set(bucketKey, bucket); return false; }
  bucket.hits.push(now);
  __buckets.set(bucketKey, bucket);
  return true;
}

// ════════════════════════════════════════════════════════
// EMAIL PAZARLAMA RIZASI — KVKK'ya uygun AYRI açık rıza uctu.
// Self-contained — _shared importları Vercel'de çalışmıyor
// ════════════════════════════════════════════════════════

const COOKIE_NAME = "nur_session";

function parseCookies(req: VercelRequest): Record<string, string> {
  const header = req.headers.cookie || "";
  return header.split(";").reduce<Record<string, string>>((acc, part) => {
    const [key, ...rest] = part.trim().split("=");
    if (!key) return acc;
    // Bozuk kodlanmış çerezler isteği 500'e düşürmesin.
    try {
      acc[key] = decodeURIComponent(rest.join("="));
    } catch {
      acc[key] = rest.join("=");
    }
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
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) throw new Error("Supabase sunucu ayarları eksik");
  return { url, key };
}

async function db<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { url, key } = supabaseConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...(init.headers || {}) },
  });
  const text = await response.text();
  if (!response.ok) throw new Error(text || `Supabase ${response.status}`);
  return (text ? JSON.parse(text) : null) as T;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  // ★ Origin kontrolü — TAM eşleşme. (includes() kullanmak "evil-nurstudyo.com.attacker.io"
  //   gibi alan adlarını da kabul ederdi — bypass açığıydı.)
  const ALLOWED_ORIGINS = new Set([
    "https://nurstudyo.com",
    "https://www.nurstudyo.com",
    "http://localhost:5173",
    "http://localhost:5174",
  ]);
  const originHeader = typeof req.headers.origin === "string" ? req.headers.origin : "";
  const refererHeader = typeof req.headers.referer === "string" ? req.headers.referer : "";
  let refererOrigin = "";
  if (refererHeader) {
    try { refererOrigin = new URL(refererHeader).origin; } catch { /* ignore */ }
  }
  const hasOrigin = Boolean(originHeader || refererOrigin);
  // ★ GÜVENLİK: cookie ile POST kabul eden uçta origin ZORUNLU.
  //   Boş origin = tarayıcı dışı script → rıza DB'sine sahte kayıt enjekte edilebilirdi.
  if (!hasOrigin || (!ALLOWED_ORIGINS.has(originHeader) && !ALLOWED_ORIGINS.has(refererOrigin))) {
    return res.status(403).json({ ok: false, error: "Origin not allowed" });
  }
  // ★ Merkezi rate limit — rıza tablosu flood yazımına karşı (dakikada 30)
  if (!rateLimit(req, res, "consent", 30, 60_000)) return;

  const user = getSessionUser(req);
  if (!user) {
    return res.status(200).json({ ok: true, consented: false });
  }

  try {
    if (req.method === "GET") {
      const rows = await db<any[]>(`nur_marketing_consent?user_id=eq.${encodeURIComponent(user.id)}&select=consented`);
      return res.status(200).json({ ok: true, consented: Boolean(rows[0]?.consented) });
    }

    if (req.method === "POST") {
      const consented = Boolean((req.body || {}).consented);
      const now = new Date().toISOString();
      await db("nur_marketing_consent?on_conflict=user_id", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({
          user_id: user.id,
          email: user.email,
          consented,
          consented_at: consented ? now : null,
          revoked_at: consented ? null : now,
          source: "app",
          updated_at: now,
        }),
      });
      return res.status(200).json({ ok: true, consented });
    }

    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  } catch (error) {
    await logServerError(req, error, "api/marketing/consent");
    console.error("[Marketing Consent Error]", error);
    return res.status(500).json({ ok: false, error: "İşlem tamamlanamadı" });
  }
}
