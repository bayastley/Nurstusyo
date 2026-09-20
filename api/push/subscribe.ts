import type { VercelRequest, VercelResponse } from "@vercel/node";

declare const process: { env: Record<string, string | undefined> };

// ════════════════════════════════════════════════════════
// PUSH SUBSCRIBE — Öğüt Vakti abonelik yönetimi
// POST { endpoint, keys: { p256dh, auth } } → kaydet
// DELETE { endpoint } → sil
// GET → VAPID public key (istemci aboneliği bununla kurulur)
// ════════════════════════════════════════════════════════

// Self-contained rate limit — _shared importları Vercel'de paketlenmiyor
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

  // GET → VAPID public key dağıt
  if (req.method === "GET") {
    const publicKey = process.env.VAPID_PUBLIC_KEY || "";
    if (!publicKey) return res.status(503).json({ ok: false, error: "Push sunucuda yapılandırılmamış" });
    return res.status(200).json({ ok: true, publicKey });
  }

  if (!rateLimit(req, res, "push:subscribe", 20, 60_000)) return;

  const cfg = supabaseConfig();
  if (!cfg) return res.status(503).json({ ok: false, error: "Veritabanı yapılandırılmamış" });

  const body = (req.body || {}) as Record<string, any>;
  const endpoint = sanitize(body.endpoint, 500);

  // DELETE → abonelik sil
  if (req.method === "DELETE") {
    if (!endpoint) return res.status(400).json({ ok: false, error: "endpoint gerekli" });
    await fetch(`${cfg.url}/rest/v1/nur_push_subscriptions?endpoint=eq.${encodeURIComponent(endpoint)}`, {
      method: "DELETE",
      headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}` },
    }).catch(() => null);
    return res.status(200).json({ ok: true });
  }

  // POST → abonelik kaydet
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method Not Allowed" });

  if (!endpoint || !endpoint.startsWith("https://")) return res.status(400).json({ ok: false, error: "Geçersiz endpoint" });
  const p256dh = sanitize(body?.keys?.p256dh, 200);
  const auth = sanitize(body?.keys?.auth, 200);
  if (!p256dh || !auth) return res.status(400).json({ ok: false, error: "Abonelik anahtarları eksik" });

  const saatDilimi = sanitize(body.tz, 40) || "Europe/Istanbul";

  // Upsert: aynı endpoint tekrar gelirse güncelle
  const upsert = await fetch(`${cfg.url}/rest/v1/nur_push_subscriptions?on_conflict=endpoint`, {
    method: "POST",
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({ endpoint, p256dh, auth, tz: saatDilimi, created_at: new Date().toISOString() }),
  }).catch(() => null);

  if (!upsert || !upsert.ok) {
    const text = upsert ? await upsert.text().catch(() => "") : "bağlantı yok";
    console.error("[push-subscribe] upsert hatası:", upsert?.status, text.slice(0, 200));
    return res.status(500).json({ ok: false, error: "Abonelik kaydedilemedi" });
  }

  return res.status(200).json({ ok: true });
}
