import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "../../server/auth";
import { rateLimit } from "../../server/rateLimit";
import { getActiveBan } from "../../server/supabase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
