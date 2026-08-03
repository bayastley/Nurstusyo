import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "../../server/auth";
import { rateLimit } from "../../server/rateLimit";
import { requireAllowedOrigin } from "../../server/security";
import { banUserInSupabase } from "../../server/supabase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
