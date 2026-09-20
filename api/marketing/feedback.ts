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
function rateLimit(req: VercelRequest, res: VercelResponse, key: string, maxRequests: number, windowMs: number): boolean {
  const forwarded = String(req.headers["cf-connecting-ip"] || req.headers["x-real-ip"] || String(req.headers["x-forwarded-for"] || "").split(",")[0] || "").trim();
  const ip = forwarded || req.socket?.remoteAddress || "unknown";
  const bucketKey = `${key}:${ip}`;
  const now = Date.now();
  const bucket = __buckets.get(bucketKey) ?? { hits: [] };
  const cutoff = now - windowMs;
  bucket.hits = bucket.hits.filter((hit) => hit >= cutoff);
  if (bucket.hits.length >= maxRequests) {
    res.setHeader("Retry-After", "300");
    res.setHeader("Cache-Control", "no-store");
    res.status(429).json({ ok: false, error: "Çok fazla istek gönderildi, birazdan tekrar dene" });
    __buckets.set(bucketKey, bucket);
    return false;
  }
  bucket.hits.push(now);
  __buckets.set(bucketKey, bucket);
  return true;
}

declare const process: { env: Record<string, string | undefined> };

// ════════════════════════════════════════════════════════
// FEEDBACK — kullanıcı öneri/kalifikasyon kutusu
// Misafir + üye herkes yazabilir. Supabase nur_feedback tablosuna kaydeder.
// Güvenlik: rate limit (saatte 5/IP), girdi sanitizasyonu, uzunluk sınırları.
// Oturum varsa kullanıcı bilgisi otomatik eklenir (istemciden ALINMAZ).
// ════════════════════════════════════════════════════════

// _shared/auth'tan session doğrulaması — gömük (Vercel paketleme sorunu)
const COOKIE_NAME = "nur_session";
interface SessionInfo { id: string; email: string; name: string; isAdmin: boolean }

function parseCookies(req: VercelRequest): Record<string, string> {
  const header = req.headers.cookie || "";
  return header.split(";").reduce<Record<string, string>>((acc, part) => {
    const [key, ...rest] = part.trim().split("=");
    if (!key) return acc;
    try { acc[key] = decodeURIComponent(rest.join("=")); } catch { acc[key] = rest.join("="); }
    return acc;
  }, {});
}

function base64UrlDecode(input: string): Buffer {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4 ? "=".repeat(4 - (normalized.length % 4)) : "";
  return Buffer.from(normalized + pad, "base64");
}

function getSession(req: VercelRequest): SessionInfo | null {
  const token = parseCookies(req)[COOKIE_NAME];
  if (!token || !token.includes(".")) return null;
  const secret = process.env.NUR_SESSION_SECRET || process.env.GOOGLE_CLIENT_SECRET || "";
  if (secret.length < 20) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const crypto = require("crypto") as typeof import("crypto");
  const expected = require("crypto").createHmac("sha256", secret).update(payload).digest().toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;
  try {
    const user = JSON.parse(base64UrlDecode(payload).toString("utf8")) as { id: string; email: string; name: string; isAdmin?: boolean; exp?: number };
    if (!user.exp || user.exp < Math.floor(Date.now() / 1000)) return null;
    return { id: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin === true };
  } catch { return null; }
}

function sanitize(input: unknown, max: number): string {
  if (!input || typeof input !== "string") return "";
  return input.trim().slice(0, max).replace(/[<>"';]/g, "");
}

function supabaseConfig() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) return null;
  return { url, key };
}

const GECERLI_TURLER = new Set(["oneri", "sikayet", "ozellik", "diger"]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  // Saatte 5 mesaj / IP — kutu spam'ine karşı
  if (!rateLimit(req, res, "feedback", 5, 60 * 60_000)) return;

  try {
    const cfg = supabaseConfig();
    if (!cfg) return res.status(500).json({ ok: false, error: "Sunucu yapılandırması eksik" });

    const body = (req.body || {}) as Record<string, unknown>;
    const mesaj = sanitize(body.mesaj, 1000);
    if (mesaj.length < 5) return res.status(400).json({ ok: false, error: "Mesaj en az 5 karakter olmalı" });

    const tur = GECERLI_TURLER.has(String(body.tur || "")) ? String(body.tur) : "oneri";
    const puanRaw = Number(body.puan);
    const puan = Number.isInteger(puanRaw) && puanRaw >= 1 && puanRaw <= 5 ? puanRaw : null;

    // Kullanıcı bilgisi YALNIZCA sunucudaki oturumdan gelir — istemciden asla
    const session = getSession(req);

    const insertRes = await fetch(`${cfg.url}/rest/v1/nur_feedback`, {
      method: "POST",
      headers: {
        "apikey": cfg.key,
        "Authorization": `Bearer ${cfg.key}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({
        user_id: session?.id ?? null,
        user_email: session?.email ?? null,
        user_name: session?.name ?? null,
        tur,
        puan,
        mesaj,
        user_agent: sanitize(req.headers["user-agent"], 300),
      }),
    });

    if (!insertRes.ok) {
      const text = await insertRes.text().catch(() => "");
      console.error("[feedback] insert başarısız:", insertRes.status, text.slice(0, 200));
      return res.status(500).json({ ok: false, error: "Kayıt alınamadı" });
    }

    return res.status(200).json({ ok: true, message: "Görüşün için teşekkürler! 🌙" });
  } catch (e) {
    await logServerError(req, e, "api/marketing/feedback");
    console.error("[feedback] beklenmeyen:", e);
    return res.status(500).json({ ok: false, error: "Beklenmeyen hata" });
  }
}
