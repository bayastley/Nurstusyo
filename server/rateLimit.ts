import type { VercelRequest, VercelResponse } from "@vercel/node";

interface BucketEntry {
  hits: number[];
}

const buckets = new Map<string, BucketEntry>();

function clientIp(req: VercelRequest): string {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0]?.trim();
  return forwarded || req.socket.remoteAddress || "unknown";
}

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
    // ★ Yanıltıcı / bilgi sızdırmaz yanıt:
    //   Hangi endpoint, hangi limit, ne kadar kaldı — saldırgana söylenmez.
    //   Retry-After'a rastgele pay eklenir; otomatik keşif (probing) zorlaşır.
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
