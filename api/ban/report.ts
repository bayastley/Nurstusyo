import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

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
  if (!rateLimit(req, res, "ban:report", 30, 60_000)) return;

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
    console.error("[ban/report] Supabase hatası:", error);
  }

  return res.status(200).json({ ok: true });
}
