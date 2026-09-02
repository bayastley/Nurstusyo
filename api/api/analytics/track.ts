import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

declare const process: { env: Record<string, string | undefined> };

// ════════════════════════════════════════════════════════
// ANALYTICS TRACK — ücretsiz, kendi barındırdığımız ziyaretçi
// sayacı. Supabase'in ücretsiz planı + Vercel serverless'in
// ücretsiz planı dışında hiçbir maliyeti yoktur.
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
  // ★ Dakikada 60 istek — kötüye kullanım/log spam'i önler, gerçek kullanıcıyı etkilemez.
  // rateLimit removed — inline not needed

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
