import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "../../server/auth";
import { rateLimit } from "../../server/rateLimit";
import { requireAllowedOrigin } from "../../server/security";
import { getActiveBan, banUserInSupabase } from "../../server/supabase";

/**
 * ★ BİRLEŞİK BAN ROUTER — /api/ban/status | /api/ban/report
 *   Vercel Hobby planı function limiti nedeniyle tek dosyada toplandı.
 */

async function statusHandler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  if (!rateLimit(req, res, "ban:status", 60, 60_000)) return;

  const user = requireAuth(req, res);
  if (!user) return;

  const livePayments = process.env.VITE_PAYMENTS_LIVE === "true";
  const banBackendEnabled = process.env.NUR_BAN_BACKEND_ENABLED === "true";

  if (livePayments && !banBackendEnabled) {
    return res.status(503).json({ ok: false, error: "Canlı mod için server-side ban/DB henüz etkin değil" });
  }

  if (banBackendEnabled) {
    const status = await getActiveBan(user.id, user.email).catch(() => ({ isBanned: true, reason: "Ban DB doğrulaması yapılamadı" }));
    return res.status(200).json({ ok: true, userId: user.id, isBanned: status.isBanned, reason: status.reason });
  }

  return res.status(200).json({ ok: true, userId: user.id, isBanned: false, reason: "" });
}

async function reportHandler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  if (!requireAllowedOrigin(req, res)) return;
  if (!rateLimit(req, res, "ban:report", 5, 60_000)) return;

  const user = requireAuth(req, res);
  if (!user) return;

  const rawReason = typeof req.body?.reason === "string" ? req.body.reason : "";
  const reason = (rawReason.trim() || "Sistem Verilerini Kurcalama / Jeton Hilesi Girişimi").slice(0, 200);

  await banUserInSupabase({ email: user.email, userId: user.id, reason, bannedBy: "Sistem Otomatik Guard" }).catch(() => undefined);

  return res.status(200).json({ ok: true });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const route = String(req.query.slug ?? "");
  if (route === "status") return statusHandler(req, res);
  if (route === "report") return reportHandler(req, res);
  return res.status(404).json({ ok: false, error: "Not Found" });
}
