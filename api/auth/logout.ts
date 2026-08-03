import type { VercelRequest, VercelResponse } from "@vercel/node";
import { clearSessionCookie, isSecureRequest } from "../../server/auth";
import { rateLimit } from "../../server/rateLimit";
import { requireAllowedOrigin } from "../../server/security";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  if (!requireAllowedOrigin(req, res)) return;
  if (!rateLimit(req, res, "auth:logout", 20, 60_000)) return;
  clearSessionCookie(res, isSecureRequest(req));
  return res.status(200).json({ ok: true });
}
