import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

declare const process: { env: Record<string, string | undefined> };

// ════════════════════════════════════════════════════════
// ANALYTICS TRACK — SELF-CONTAINED (Vercel'de _shared importu
// çalışmıyor: "ERR_MODULE_NOT_FOUND /var/task/api/_shared/rateLimit".
// Bu yüzden rateLimit buraya inline edildi.)
// ════════════════════════════════════════════════════════

// ─── Inline rate limit (sliding window) ──────────────────
const buckets = new Map<string, number[]>();

function clientIp(req: VercelRequest): string {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0]?.trim();
  return forwarded || req.socket.remoteAddress || "unknown";
}

function rateLimit(req: VercelRequest, res: VercelResponse, key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const bucketKey = `${key}:${clientIp(req)}`;
  const bucket = buckets.get(bucketKey) ?? [];
  const cutoff = now - windowMs;
  const active = bucket.filter((hit) => hit >= cutoff);

  if (active.length >= maxRequests) {
    const base = Math.max(1, Math.ceil((windowMs - (now - active[0])) / 1000));
    const jitter = Math.floor(Math.random() * 5);
    res.setHeader("Retry-After", String(base + jitter));
    res.setHeader("Cache-Control", "no-store");
    res.status(429).json({ ok: false, error: "İstek işlenemedi" });
    buckets.set(bucketKey, active);
    return false;
  }

  active.push(now);
  buckets.set(bucketKey, active);
  return true;
}

// ─── Supabase config (URL normalizasyonlu) ───────────────
function supabaseConfig() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim().replace(/^["']+|["']+$/g, "").replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
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
  // ★ Dakikada 60 istek — kötüye kullanım/log spam'i önler, gerçek kullanıcıyı etkilemez.
  if (!rateLimit(req, res, "analytics:track", 60, 60_000)) return;

  try {
    const cfg = supabaseConfig();
    // Supabase ayarlanmamışsa (ör. yerel geliştirme) sessizce başarı dön — asla siteyi bozmasın.
    if (!cfg) return res.status(200).json({ ok: true, skipped: true });

    const body = req.body || {};
    const path = sanitize(body.path, 200) || "/";
    const referrer = sanitize(body.referrer, 300);
    const userAgent = sanitize(req.headers["user-agent"], 300);
    const screen = sanitize(body.screen, 32);
    const lang = sanitize(body.lang, 10);

    // ★ KVKK dostu: IP adresi doğrudan saklanmaz, geri döndürülemez bir
    //   hash olarak tutulur (günlük bazda dönen tuz ile) — kişi
    //   tanımlanamaz, sadece "aynı gün aynı cihaz mı" ayrımı yapılabilir.
    const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
    const daySalt = new Date().toISOString().slice(0, 10);
    const visitorHash = crypto.createHash("sha256").update(`${ip}:${userAgent}:${daySalt}`).digest("hex").slice(0, 24);

    const response = await fetch(`${cfg.url}/rest/v1/nur_page_views`, {
      method: "POST",
      headers: {
        apikey: cfg.key,
        Authorization: `Bearer ${cfg.key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ path, referrer, user_agent: userAgent, screen, lang, visitor_hash: visitorHash }),
    });

    if (!response.ok) {
      // Analitik asla kullanıcı deneyimini bozmasın — hata olsa bile 200 dön.
      return res.status(200).json({ ok: true, logged: false });
    }
    return res.status(200).json({ ok: true, logged: true });
  } catch {
    return res.status(200).json({ ok: true, logged: false });
  }
}
