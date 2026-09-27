import type { VercelRequest, VercelResponse } from "@vercel/node";

// ═══════════════════════════════════════════════════════════
// MERKEZİ RATE LIMIT — tek kaynak (Açık 2 düzeltmesi).
//
// UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN tanımlıysa
// sayaçlar paylaşımlı Redis'te tutulur; Vercel instance sayısı
// ne olursa olsun limit instance'lar arası geçerlidir.
// Anahtarlar yoksa (local dev) in-memory Map'e düşer — kod kırılmaz.
//
// TÜM fonksiyonlar async'tir — çağrı tarafı await ETMELİ:
//   if (!(await rateLimit(req, res, "alan:ad", N, MS))) return;
// ═══════════════════════════════════════════════════════════

interface BucketEntry {
  hits: number[];
}

const buckets = new Map<string, BucketEntry>();

const UPSTASH_URL = (process.env.UPSTASH_REDIS_REST_URL || "").replace(/\/+$/, "");
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || "";
const SHARED_ENABLED = UPSTASH_URL.length > 0 && UPSTASH_TOKEN.length > 0;

function clientIp(req: VercelRequest): string {
  const forwarded = String(
    req.headers["cf-connecting-ip"] ||
      req.headers["x-real-ip"] ||
      String(req.headers["x-forwarded-for"] || "").split(",")[0] ||
      ""
  ).trim();
  return forwarded || req.socket?.remoteAddress || "unknown";
}

function clearOldBuckets(now: number, windowMs: number): void {
  if (buckets.size <= 5000) return;
  for (const [key, entry] of buckets) {
    if (!entry.hits.length || entry.hits[entry.hits.length - 1] < now - windowMs) buckets.delete(key);
    if (buckets.size <= 2500) break;
  }
}

function memoryCheck(bucketKey: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(bucketKey) ?? { hits: [] };
  const cutoff = now - windowMs;
  bucket.hits = bucket.hits.filter((hit) => hit >= cutoff);
  if (bucket.hits.length >= max) {
    buckets.set(bucketKey, bucket);
    return false;
  }
  bucket.hits.push(now);
  buckets.set(bucketKey, bucket);
  clearOldBuckets(now, windowMs);
  return true;
}

/** Upstash pipeline: atomik INCR + EXPIRE. Hata/eksik yapıda null döner. */
async function sharedIncr(bucketKey: string, windowMs: number): Promise<number | null> {
  if (!SHARED_ENABLED) return null;
  try {
    const windowSec = Math.max(1, Math.ceil(windowMs / 1000));
    const redisKey = `rl:${bucketKey}`;
    const res = await fetch(`${UPSTASH_URL}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify([
        ["INCR", redisKey],
        ["EXPIRE", redisKey, windowSec, "NX"],
      ]),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as Array<{ result: unknown }>;
    return Number(json[0]?.result ?? 1);
  } catch {
    return null; // Redis erişilemez → in-memory fallback
  }
}

function respond429(res: VercelResponse, retrySec: number): void {
  const base = Math.max(1, retrySec);
  const jitter = Math.floor(Math.random() * 5);
  res.setHeader("Retry-After", String(base + jitter));
  res.setHeader("Cache-Control", "no-store");
  res.status(429).json({ ok: false, error: "İstek işlenemedi" });
}

/**
 * Yanıt YAZAN versiyon — limit aşılırsa 429 döner.
 * true = izinli, false = yanıt yazıldı (arayan return etmeli).
 */
export async function rateLimit(
  req: VercelRequest,
  res: VercelResponse,
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<boolean> {
  const bucketKey = `${key}:${clientIp(req)}`;
  const hits = await sharedIncr(bucketKey, windowMs);
  if (hits !== null) {
    if (hits > maxRequests) {
      respond429(res, Math.ceil(windowMs / 1000));
      return false;
    }
    return true;
  }
  const ok = memoryCheck(bucketKey, maxRequests, windowMs);
  if (!ok) respond429(res, Math.ceil(windowMs / 1000));
  return ok;
}

/**
 * Yanıt yazmayan sessiz versiyon — özel hata formatı gereken uçlar için.
 * true = izinli.
 */
export async function rateLimitSilent(
  req: VercelRequest,
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<boolean> {
  const bucketKey = `${key}:${clientIp(req)}`;
  const hits = await sharedIncr(bucketKey, windowMs);
  if (hits !== null) return hits <= maxRequests;
  return memoryCheck(bucketKey, maxRequests, windowMs);
}

/** Kimlik bazlı (userId/email) sessiz versiyon. true = izinli. */
export async function rateLimitById(
  identity: string,
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<boolean> {
  const bucketKey = `${key}:${identity}`;
  const hits = await sharedIncr(bucketKey, windowMs);
  if (hits !== null) return hits <= maxRequests;
  return memoryCheck(bucketKey, maxRequests, windowMs);
}

export const RATE_LIMIT_SHARED_ENABLED = SHARED_ENABLED;
