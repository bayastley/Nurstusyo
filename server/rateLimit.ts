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
