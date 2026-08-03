import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "../../server/auth";
import { rateLimit } from "../../server/rateLimit";

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  if (!rateLimit(req, res, "admin:session", 60, 60_000)) return;

  const admin = requireAdmin(req, res);
  if (!admin) return;

  return res.status(200).json({
    ok: true,
    admin: { id: admin.id, email: admin.email, name: admin.name, verified: admin.verified },
  });
}
