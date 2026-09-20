import type { VercelRequest, VercelResponse } from "@vercel/node";

// ═══════════════════════════════════════════════════════════
// MERKEZİ RATE LIMIT — tüm API endpoint'lerinin tek sahibi.
// In-memory sliding window: Vercel serverless instance'ı başına.
// DDoS'un ana hattı Vercel platform firewall'ıdır; bu katman
// instance içi kaba kuvvet + tarama korumasıdır (ikinci savunma hattı).
// ═══════════════════════════════════════════════════════════

interface BucketEntry {
  hits: number[];
}

const buckets = new Map<string, BucketEntry>();

function clientIp(req: VercelRequest): string {
  const forwarded = String(req.headers["cf-connecting-ip"] || req.headers["x-real-ip"] || String(req.headers["x-forwarded-for"] || "").split(",")[0] || "").trim();
  return forwarded || req.socket.remoteAddress || "unknown";
}

function clearOldBuckets(now: number, windowMs: number): void {
  if (buckets.size <= 5000) return;
  for (const [key, entry] of buckets) {
    if (!entry.hits.length || entry.hits[entry.hits.length - 1] < now - windowMs) buckets.delete(key);
    if (buckets.size <= 2500) break;
  }
}

/**
 * Dönen değer: true = istek izinli (limit aşılmadı), false = 429 yazıldı.
 * Arayan sadece `if (!rateLimit(req, res, "alan:ad", N, MS)) return;` yazar.
 */
export function rateLimit(
  req: VercelRequest,
  res: VercelResponse,
  key: string,
  maxRequests: number,
  windowMs: number
): boolean {
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
  clearOldBuckets(now, windowMs);
  return true;
}

/**
 * Yanıt yazmayan sessiz versiyon — istek sahiplikli RL (userId ile) veya
 * özel hata formatı gereken uçlar için. true = izinli.
 */
export function rateLimitSilent(
  req: VercelRequest,
  key: string,
  maxRequests: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const bucketKey = `${key}:${clientIp(req)}`;
  const bucket = buckets.get(bucketKey) ?? { hits: [] };
  const cutoff = now - windowMs;
  bucket.hits = bucket.hits.filter((hit) => hit >= cutoff);
  if (bucket.hits.length >= maxRequests) {
    buckets.set(bucketKey, bucket);
    return false;
  }
  bucket.hits.push(now);
  buckets.set(bucketKey, bucket);
  clearOldBuckets(now, windowMs);
  return true;
}

/** Sessiz versiyonun kimlik-bazlı hali (IP yerine userId/IP birleşimi). */
export function rateLimitById(
  identity: string,
  key: string,
  maxRequests: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const bucketKey = `${key}:${identity}`;
  const bucket = buckets.get(bucketKey) ?? { hits: [] };
  const cutoff = now - windowMs;
  bucket.hits = bucket.hits.filter((hit) => hit >= cutoff);
  if (bucket.hits.length >= maxRequests) {
    buckets.set(bucketKey, bucket);
    return false;
  }
  bucket.hits.push(now);
  buckets.set(bucketKey, bucket);
  clearOldBuckets(now, windowMs);
  return true;
}
