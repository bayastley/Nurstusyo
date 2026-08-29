import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

declare const process: { env: Record<string, string | undefined> };

// ════════════════════════════════════════════════════════
// RENDER AUTHORIZE — SELF-CONTAINED
// (Vercel'de _shared importları çalışmıyor; bu yüzden
//  auth / rateLimit / security / supabase buraya inline edildi.)
//
// ★ İYZİCO UYUMU: Bakiye düşümü YOKTUR. Üretim izni iki kaynaktan gelir:
//   1) Üyelik seviyesinin günlük kotası  2) Satın alınmış paket hakkı
// ════════════════════════════════════════════════════════

type Tier = "free" | "pro" | "elit";
type VideoKind = "kisa" | "uzun" | "tam";

const MODE_TO_KIND: Record<string, VideoKind> = { short: "kisa", long: "uzun", full: "tam" };

const DAILY_QUOTA: Record<Tier, Record<VideoKind, number>> = {
  free: { kisa: 3, uzun: 0, tam: 0 },
  pro: { kisa: 8, uzun: 3, tam: 0 },
  elit: { kisa: 15, uzun: 5, tam: 1 },
};

const ALLOWED_FORMATS = new Set(["9:16", "1:1", "16:9", "4:5"]);

// ─── Inline session doğrulama ────────────────────────────
interface SessionUser { id: string; email: string; verified: boolean; isAdmin: boolean; tier?: Tier; exp: number }

function fromBase64Url(input: string): Buffer {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4 ? "=".repeat(4 - (normalized.length % 4)) : "";
  return Buffer.from(normalized + pad, "base64");
}
function base64Url(input: Buffer): string {
  return input.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function getSessionUser(req: VercelRequest): SessionUser | null {
  const cookie = String(req.headers.cookie || "").split(";").map((part) => part.trim()).find((part) => part.startsWith("nur_session="));
  if (!cookie) return null;
  const [payload, signature] = decodeURIComponent(cookie.slice("nur_session=".length)).split(".");
  const secret = process.env.NUR_SESSION_SECRET || process.env.GOOGLE_CLIENT_SECRET || "";
  if (!payload || !signature || secret.length < 20) return null;
  const expected = base64Url(crypto.createHmac("sha256", secret).update(payload).digest());
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) return null;
  try {
    const user = JSON.parse(fromBase64Url(payload).toString("utf8")) as SessionUser;
    if (!user.id || !user.email || !user.verified || user.exp < Math.floor(Date.now() / 1000)) return null;
    return user;
  } catch { return null; }
}

// ─── Inline rate limit ───────────────────────────────────
const buckets = new Map<string, number[]>();
function clientIp(req: VercelRequest): string {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0]?.trim();
  return forwarded || req.socket.remoteAddress || "unknown";
}
function rateLimit(req: VercelRequest, res: VercelResponse, key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const bucketKey = `${key}:${clientIp(req)}`;
  const bucket = buckets.get(bucketKey) ?? [];
  const active = bucket.filter((h) => h >= now - windowMs);
  if (active.length >= max) {
    res.setHeader("Retry-After", "60");
    res.status(429).json({ ok: false, error: "İstek işlenemedi" });
    buckets.set(bucketKey, active);
    return false;
  }
  active.push(now);
  buckets.set(bucketKey, active);
  return true;
}

// ─── Inline origin kontrolü ──────────────────────────────
function requireAllowedOrigin(req: VercelRequest, res: VercelResponse): boolean {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";
  const referer = typeof req.headers.referer === "string" ? req.headers.referer : "";
  const allowed = new Set(["https://nurstudyo.com", "https://www.nurstudyo.com", "http://localhost:5173", "http://localhost:5174"]);
  if (!origin && !referer) return true;
  if (origin && allowed.has(origin)) return true;
  if (referer) {
    try { if (allowed.has(new URL(referer).origin)) return true; } catch { /* ignore */ }
  }
  res.status(403).json({ ok: false, error: "İzin verilmeyen istek kaynağı" });
  return false;
}

// ─── Inline Supabase (URL normalizasyonlu) ───────────────
function supabaseConfig() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim().replace(/^["']+|["']+$/g, "").replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) return null;
  return { url, key };
}

async function consumeVideo(userId: string, videoKind: string, dailyQuota: number) {
  const sb = supabaseConfig();
  if (!sb) return { ok: true, source: "demo", quota_left: dailyQuota, pack_left: 0, error: null };
  try {
    const res = await fetch(`${sb.url}/rest/v1/rpc/nur_consume_video`, {
      method: "POST",
      headers: {
        apikey: sb.key,
        Authorization: `Bearer ${sb.key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_user_id: userId, p_video_kind: videoKind, p_daily_quota: dailyQuota }),
    });
    if (!res.ok) return { ok: true, source: "demo", quota_left: dailyQuota, pack_left: 0, error: null };
    const rows = await res.json() as Array<{ ok: boolean; source: string; quota_left: number; pack_left: number; error: string | null }>;
    return rows[0] ?? { ok: false, source: "none", quota_left: 0, pack_left: 0, error: "QUOTA_ERROR" };
  } catch {
    return { ok: true, source: "demo", quota_left: dailyQuota, pack_left: 0, error: null };
  }
}

// ─── Ana handler ─────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  if (!requireAllowedOrigin(req, res)) return;
  if (!rateLimit(req, res, "render:authorize", 10, 60_000)) return;

  const user = getSessionUser(req);
  if (!user) return res.status(401).json({ ok: false, error: "Oturum gerekli" });

  const { mode, formats } = req.body || {};

  if (typeof mode !== "string" || !MODE_TO_KIND[mode]) {
    return res.status(400).json({ ok: false, error: "Geçersiz süre modu" });
  }

  if (!Array.isArray(formats) || formats.length < 1 || formats.length > 4) {
    return res.status(400).json({ ok: false, error: "Geçersiz format listesi" });
  }

  const uniqueFormats = Array.from(new Set(formats));
  if (uniqueFormats.some((format) => typeof format !== "string" || !ALLOWED_FORMATS.has(format))) {
    return res.status(400).json({ ok: false, error: "Bilinmeyen video formatı" });
  }

  const kind = MODE_TO_KIND[mode];
  const tier: Tier = (user as { tier?: Tier }).tier ?? "free";
  const quota = DAILY_QUOTA[tier][kind];

  const backendEnabled = process.env.NUR_QUOTA_BACKEND_ENABLED === "true";
  const livePayments = process.env.VITE_PAYMENTS_LIVE === "true";

  if (livePayments && !backendEnabled) {
    return res.status(503).json({
      ok: false,
      error: "Canlı üretim için sunucu tarafı kota servisi henüz etkin değil",
    });
  }

  if (backendEnabled) {
    const results = [];
    for (let i = 0; i < uniqueFormats.length; i += 1) {
      const spent = await consumeVideo(user.id, kind, quota);
      if (!spent.ok) {
        return res.status(402).json({
          ok: false,
          error: spent.error === "NO_RIGHTS_LEFT"
            ? "Bugünkü üretim hakkınız doldu. Paket alarak devam edebilirsiniz."
            : "Üretim izni alınamadı",
          kind,
        });
      }
      results.push(spent);
    }

    const last = results[results.length - 1];
    return res.status(200).json({
      ok: true,
      userId: user.id,
      kind,
      mode,
      formats: uniqueFormats,
      source: last.source,
      quotaLeft: last.quota_left,
      packLeft: last.pack_left,
    });
  }

  // Demo mod: istemci tarafındaki kota takibi geçerli
  return res.status(200).json({
    ok: true,
    demo: true,
    userId: user.id,
    kind,
    mode,
    formats: uniqueFormats,
    dailyQuota: quota,
  });
}
