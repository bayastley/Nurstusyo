import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "../../server/auth";
import { rateLimit } from "../../server/rateLimit";
import { requireAllowedOrigin } from "../../server/security";
import {
  banUserInDb,
  getUserByEmail,
  isSupabaseConfigured,
  listUsers,
  logAdminAction,
  setWalletTotal,
  setUserTier,
  unbanUserInDb,
} from "../../server/supabase";

type Tier = "free" | "pro" | "elit";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  if (!requireAllowedOrigin(req, res)) return;
  if (!rateLimit(req, res, "admin:manage", 30, 60_000)) return;

  const admin = requireAdmin(req, res);
  if (!admin) return;

  if (!isSupabaseConfigured()) {
    return res.status(503).json({ ok: false, error: "Supabase yapılandırılmamış" });
  }

  const { action } = req.body || {};

  try {
    switch (action) {
      case "list_users": {
        const users = await listUsers();
        await logAdminAction({ adminId: admin.id, adminEmail: admin.email, action: "list_users" }).catch(() => undefined);
        return res.status(200).json({ ok: true, users });
      }

      case "ban_user": {
        const { email, reason } = req.body || {};
        if (typeof email !== "string" || !email.includes("@")) {
          return res.status(400).json({ ok: false, error: "Geçersiz e-posta" });
        }
        const target = await getUserByEmail(email);
        const safeEmail = email.trim().toLowerCase();
        if (admin.email.toLowerCase() === safeEmail) {
          return res.status(400).json({ ok: false, error: "Admin hesabı banlanamaz" });
        }
        await banUserInDb({
          userId: target?.id ?? null,
          email: safeEmail,
          reason: typeof reason === "string" && reason.trim() ? reason.trim() : "Yasal ihlal / Sistem güvenlik uyarısı",
          bannedBy: admin.email,
        });
        await logAdminAction({ adminId: admin.id, adminEmail: admin.email, action: "ban_user", target: safeEmail }).catch(() => undefined);
        return res.status(200).json({ ok: true });
      }

      case "unban_user": {
        const { email } = req.body || {};
        if (typeof email !== "string" || !email.includes("@")) {
          return res.status(400).json({ ok: false, error: "Geçersiz e-posta" });
        }
        const safeEmail = email.trim().toLowerCase();
        await unbanUserInDb(safeEmail);
        await logAdminAction({ adminId: admin.id, adminEmail: admin.email, action: "unban_user", target: safeEmail }).catch(() => undefined);
        return res.status(200).json({ ok: true });
      }

      case "change_tier": {
        const { email, tier } = req.body || {};
        if (typeof email !== "string" || !email.includes("@")) {
          return res.status(400).json({ ok: false, error: "Geçersiz e-posta" });
        }
        if (tier !== "free" && tier !== "pro" && tier !== "elit") {
          return res.status(400).json({ ok: false, error: "Geçersiz paket" });
        }
        const target = await getUserByEmail(email);
        if (!target) return res.status(404).json({ ok: false, error: "Kullanıcı bulunamadı" });
        await setUserTier(target.id, tier as Tier);
        await logAdminAction({ adminId: admin.id, adminEmail: admin.email, action: "change_tier", target: `${email}:${tier}` }).catch(() => undefined);
        return res.status(200).json({ ok: true });
      }

      case "change_jeton": {
        const { email, total } = req.body || {};
        if (typeof email !== "string" || !email.includes("@")) {
          return res.status(400).json({ ok: false, error: "Geçersiz e-posta" });
        }
        if (typeof total !== "number" || !Number.isFinite(total) || total < 0) {
          return res.status(400).json({ ok: false, error: "Geçersiz jeton değeri" });
        }
        const target = await getUserByEmail(email);
        if (!target) return res.status(404).json({ ok: false, error: "Kullanıcı bulunamadı" });
        const wallet = await setWalletTotal(target.id, total);
        await logAdminAction({ adminId: admin.id, adminEmail: admin.email, action: "change_jeton", target: `${email}:${total}` }).catch(() => undefined);
        return res.status(200).json({
          ok: true,
          wallet: wallet ? { subJeton: wallet.sub_jeton, purchasedJeton: wallet.purchased_jeton, total: wallet.sub_jeton + wallet.purchased_jeton } : null,
        });
      }

      default:
        return res.status(400).json({ ok: false, error: "Bilinmeyen işlem" });
    }
  } catch (error) {
    console.error("[Admin Manage Error]", error);
    return res.status(500).json({ ok: false, error: "Yönetim işlemi tamamlanamadı" });
  }
}
