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
  } catch (error) {
    await logServerError(req, error, "push/subscribe"); /* log yazımı siteyi ASLA bozmaz */ }
}

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
  // ★ Bakım bildirimi onayı: kullanıcı "Bakım bitince haber ver" dediğinde true gelir
  const notifyMaintenance = body.notify_maintenance === true;

  // Upsert: aynı endpoint tekrar gelirse güncelle
  const upsert = await fetch(`${cfg.url}/rest/v1/nur_push_subscriptions?on_conflict=endpoint`, {
    method: "POST",
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({ endpoint, p256dh, auth, tz: saatDilimi, notify_maintenance: notifyMaintenance, created_at: new Date().toISOString() }),
  }).catch(() => null);

  if (!upsert || !upsert.ok) {
    const text = upsert ? await upsert.text().catch(() => "") : "bağlantı yok";
    console.error("[push-subscribe] upsert hatası:", upsert?.status, text.slice(0, 200));
    return res.status(500).json({ ok: false, error: "Abonelik kaydedilemedi" });
  }

  return res.status(200).json({ ok: true });
}
