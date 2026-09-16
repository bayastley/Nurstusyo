import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

// Self-contained rate limit — _shared importları Vercel'de paketlenmediği için gömüldü
const __buckets = new Map<string, { hits: number[] }>();
function rateLimit(req: VercelRequest, res: VercelResponse, key: string, maxRequests: number, windowMs: number): boolean {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0]?.trim();
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

declare const process: { env: Record<string, string | undefined> };

// ════════════════════════════════════════════════════════
// ERROR TRACK — frontend hatalarını Supabase'e yazar.
// Lansman sonrası "kim nerede patladı" sorusuna cevap verir;
// Sentry gibi harici servise gerek kalmaz, maliyet sıfır.
// Tablo: nur_error_logs (message, stack, path, user_agent, created_at)
// ════════════════════════════════════════════════════════

function supabaseConfig() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) return null;
  return { url, key };
}

function sanitize(input: unknown, max: number): string {
  if (!input || typeof input !== "string") return "";
  return input.trim().slice(0, max).replace(/[<>"';]/g, "");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  // Dakikada 30 — hata fırtınalarında bile log spam'i olmasın
  if (!rateLimit(req, res, "error:track", 30, 60_000)) return;

  try {
    const cfg = supabaseConfig();
    // Supabase ayarlı değilse sessizce başarı dön — hata raporlama asla siteyi bozmasın
    if (!cfg) return res.status(200).json({ ok: true, skipped: true });

    const body = (req.body || {}) as Record<string, unknown>;
    const message = sanitize(body.message, 500);
    if (!message) return res.status(200).json({ ok: true, skipped: true });
    const stack = sanitize(body.stack, 4000);
    const path = sanitize(body.path, 200) || "/";
    const source = sanitize(body.source, 40) || "window";
    const userAgent = sanitize(req.headers["user-agent"], 300);

    // Aynı hata 5 dakika içinde tekrar geliyorsa yut (retry döngüsü koruması)
    const fingerprint = crypto.createHash("sha256").update(`${message}|${path}`).digest("hex").slice(0, 16);
    const fpBucket = __buckets.get(`errfp:${fingerprint}`) ?? { hits: [] };
    const cutoff = Date.now() - 5 * 60_000;
    fpBucket.hits = fpBucket.hits.filter((h) => h >= cutoff);
    if (fpBucket.hits.length >= 5) {
      __buckets.set(`errfp:${fingerprint}`, fpBucket);
      return res.status(200).json({ ok: true, deduped: true });
    }
    fpBucket.hits.push(Date.now());
    __buckets.set(`errfp:${fingerprint}`, fpBucket);

    const insertRes = await fetch(`${cfg.url}/rest/v1/nur_error_logs`, {
      method: "POST",
      headers: {
        "apikey": cfg.key,
        "Authorization": `Bearer ${cfg.key}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({ message, stack, path, source, user_agent: userAgent, fingerprint }),
    });

    if (!insertRes.ok) {
      const text = await insertRes.text().catch(() => "");
      console.error("[error-track] insert başarısız:", insertRes.status, text.slice(0, 200));
      // Log yazılamadıysa da istemciye 200 dön — kullanıcı etkilenmesin
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("[error-track] beklenmeyen:", e);
    return res.status(200).json({ ok: true });
  }
}
