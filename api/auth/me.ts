import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSessionUser } from "../../server/auth";
import { rateLimit } from "../../server/rateLimit";
import { getUser, getWallet, getActiveBan } from "../../server/supabase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  if (!rateLimit(req, res, "auth:me", 120, 60_000)) return;

  try {
  const user = getSessionUser(req);
  if (!user) return res.status(401).json({ ok: false, error: "Oturum bulunamadı" });
  const dbUser = await getUser(user.id).catch(() => null);
  const wallet = await getWallet(user.id).catch(() => null);
  const ban = await getActiveBan(user.id, user.email).catch(() => null);

  return res.status(200).json({
    ok: true,
    user: {
      id: user.id,
      sub: user.sub,
      email: user.email,
      name: user.name,
      picture: user.picture || "",
      verified: user.verified,
      isAdmin: user.isAdmin,
      tier: dbUser?.tier || (user.isAdmin ? "elit" : "free"),
    },
    wallet: wallet ? { subJeton: wallet.sub_jeton, purchasedJeton: wallet.purchased_jeton, total: wallet.sub_jeton + wallet.purchased_jeton } : null,
    banned: Boolean(ban?.isBanned),
    banReason: ban?.reason || "",
  });
  } catch (error) {
    console.error("[Auth Me Error]", error);
    return res.status(500).json({ ok: false, error: "Oturum kontrolü başarısız" });
  }
}
