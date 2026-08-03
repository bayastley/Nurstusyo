import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "../_shared/auth";
import { rateLimit } from "../_shared/rateLimit";
import { requireAllowedOrigin } from "../_shared/security";
import { logAdminAction, banUserInSupabase, unbanUserInSupabase } from "../_shared/supabase";

const ALLOWED_ACTIONS = new Set([
  "ban_user",
  "unban_user",
  "change_tier",
  "change_jeton",
  "toggle_module",
  "create_module",
  "push_config",
]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  if (!requireAllowedOrigin(req, res)) return;
  if (!rateLimit(req, res, "admin:action", 30, 60_000)) return;

  const admin = requireAdmin(req, res);
  if (!admin) return;

  const { action, target, reason } = req.body || {};

  if (typeof action !== "string" || !ALLOWED_ACTIONS.has(action)) {
    return res.status(400).json({ ok: false, error: "Geçersiz admin işlemi" });
  }
  if (target !== undefined && (typeof target !== "string" || target.length > 160)) {
    return res.status(400).json({ ok: false, error: "Geçersiz hedef" });
  }

  if (action === "ban_user" && typeof target === "string") {
    await banUserInSupabase({
      email: target,
      reason: typeof reason === "string" && reason.trim() ? reason.trim() : "Yasal ihlal / Sistem güvenlik uyarısı",
      bannedBy: admin.email,
    }).catch(() => undefined);
  }
  if (action === "unban_user" && typeof target === "string") {
    await unbanUserInSupabase(target).catch(() => undefined);
  }

  await logAdminAction({ adminId: admin.id, adminEmail: admin.email, action, target }).catch(() => undefined);

  return res.status(200).json({
    ok: true,
    admin: admin.email,
    action,
    target: target || "",
    at: new Date().toISOString(),
  });
}
