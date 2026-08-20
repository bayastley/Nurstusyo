import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "../_shared/auth";
import { rateLimit } from "../_shared/rateLimit";
import { getActiveBan } from "../_shared/supabase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  if (!rateLimit(req, res, "ban:status", 60, 60_000)) return;

  const user = requireAuth(req, res);
  if (!user) return;

  const banBackendEnabled = process.env.NUR_BAN_BACKEND_ENABLED === "true";

  if (!banBackendEnabled) {
    return res.status(200).json({
      ok: true,
      userId: user.id,
      isBanned: false,
      reason: "",
      degraded: true,
    });
  }
