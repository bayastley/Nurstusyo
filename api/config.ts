import type { VercelRequest, VercelResponse } from "@vercel/node";

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

function supabaseConfig() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) throw new Error("Supabase sunucu ayarları eksik");
  return { url, key };
}

async function query<T>(path: string): Promise<T> {
  const { url, key } = supabaseConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" });
  if (!response.ok) throw new Error(await response.text());
  return await response.json() as T;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  // ★ Merkezi rate limit — config okuma ucudur ama tarayıcıda sürekli çağrıldığı için
  //   tarama/flood koruması şart (dakikada 120 — normal kullanıcıyı asla boğmaz)
  if (!rateLimit(req, res, "config", 120, 60_000)) return;
  try {
    const now = encodeURIComponent(new Date().toISOString());
    const [announcements, featureLocks, siteSettings] = await Promise.all([
      query<any[]>(`nur_announcements?active=eq.true&starts_at=lte.${now}&ends_at=gte.${now}&order=updated_at.desc&limit=1&select=*`),
      query<any[]>("nur_feature_locks?active=eq.true&select=feature_id,lock_level,updated_at"),
      query<any[]>("nur_site_settings?key=eq.maintenance&select=value,updated_at").catch(() => [] as any[]),
    ]);
    const maintenanceRow = Array.isArray(siteSettings) ? siteSettings[0] : null;
    const maintenanceValue = maintenanceRow?.value && typeof maintenanceRow.value === "object" ? { ...maintenanceRow.value, updated_at: maintenanceRow.updated_at } : null;
    return res.status(200).json({
      ok: true,
      announcement: announcements[0] ?? null,
      featureLocks,
      maintenance: maintenanceValue,
    });
  } catch (error) {
    console.error("[Public Config Error]", error);
    return res.status(200).json({ ok: true, announcement: null, featureLocks: [], maintenance: null });
  }
}
