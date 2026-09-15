import type { VercelRequest, VercelResponse } from "@vercel/node";

// ═══════════════════════════════════════════════════════════
// Self-contained — _shared importları Vercel'de paketlenmediği için
// ERR_MODULE_NOT_FOUND veriyordu; rate limit buraya gömüldü.
// ═══════════════════════════════════════════════════════════
interface BucketEntry { hits: number[] }
const buckets = new Map<string, BucketEntry>();
function clientIp(req: VercelRequest): string {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0]?.trim();
  return forwarded || req.socket.remoteAddress || "unknown";
}
function rateLimit(req: VercelRequest, res: VercelResponse, key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const bucketKey = `${key}:${clientIp(req)}`;
  const bucket = buckets.get(bucketKey) ?? { hits: [] };
  const cutoff = now - windowMs;
  bucket.hits = bucket.hits.filter((hit) => hit >= cutoff);
  if (bucket.hits.length >= maxRequests) {
    const base = Math.max(1, Math.ceil((windowMs - (now - bucket.hits[0])) / 1000));
    const jitter = Math.floor(Math.random() * 5);
    res.setHeader("Retry-After", String(base + jitter));
    res.setHeader("Cache-Control", "no-store");
    res.status(429).json({ ok: false, error: "İstek işlenemedi" });
    buckets.set(bucketKey, bucket);
    return false;
  }
  bucket.hits.push(now);
  buckets.set(bucketKey, bucket);
  return true;
}

// Supabase ban sorgusu — fail-safe
function supabaseConfig() {
  // ★ URL NORMALİZASYONU (fetch failed çözümü)
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim().replace(/^["']+|["']+$/g, "").replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) return null;
  return { url, key };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  // ★ Dakikada 30 sorgu — e-posta tahmin/spam taramasını yavaşlatır
  if (!rateLimit(req, res, "ban:status", 30, 60_000)) return;

  try {
    const email = String(req.body?.email || req.query?.email || "").trim().toLowerCase();
    if (!email || !email.includes("@")) {
      return res.status(200).json({ ok: true, isBanned: false, banned: false, email });
    }

    const sb = supabaseConfig();
    if (!sb) {
      return res.status(200).json({ ok: true, isBanned: false, banned: false, email });
    }

    // Supabase'de aktif ban kaydı var mı kontrol et (sadece manuel banlar)
    const response = await fetch(
      `${sb.url}/rest/v1/nur_ban_logs?user_email=eq.${encodeURIComponent(email)}&unbanned=eq.false&is_auto=eq.false&select=id,reason&limit=1`,
      {
        headers: {
          apikey: sb.key,
          Authorization: `Bearer ${sb.key}`,
        },
      }
    );

    if (!response.ok) {
      return res.status(200).json({ ok: true, isBanned: false, banned: false, email });
    }

    const rows = await response.json() as Array<{ id: string; reason: string }>;
    const isBanned = rows.length > 0;

    return res.status(200).json({
      ok: true,
      isBanned,
      banned: isBanned,
      email,
      reason: isBanned ? rows[0].reason : "",
    });
  } catch (error) {
    // Fail-safe: hata olursa ban yok sayılır
    return res.status(200).json({ ok: true, isBanned: false, banned: false, error: "fail-safe" });
  }
}
