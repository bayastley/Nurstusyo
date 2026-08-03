import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import { rateLimit } from "./_shared/rateLimit";

function safeString(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.slice(0, max);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  if (!rateLimit(req, res, "track", 30, 60_000)) return;

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !serviceKey) {
    // Analitik opsiyoneldir; yapılandırılmamışsa sessizce kabul et
    return res.status(200).json({ ok: true, skipped: true });
  }

  try {
    const { path, referrer, screen, lang } = req.body || {};
    const userAgent = safeString(req.headers["user-agent"], 300);
    const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0]?.trim() || "";
    const ipSalt = "nur-analytics-daily-salt";
    const visitorHash = crypto
      .createHash("sha256")
      .update(`${forwarded}|${userAgent}|${ipSalt}`)
      .digest("hex")
      .slice(0, 16);

    const response = await fetch(`${url.replace(/\/$/, "")}/rest/v1/nur_page_views`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        path: safeString(path, 300) || "/",
        referrer: safeString(referrer, 500),
        user_agent: userAgent,
        screen: safeString(screen, 40),
        lang: safeString(lang, 12),
        visitor_hash: visitorHash,
      }),
    });

    if (!response.ok) {
      return res.status(200).json({ ok: true, skipped: true });
    }
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(200).json({ ok: true, skipped: true });
  }
}
