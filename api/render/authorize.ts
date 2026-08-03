import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "../_shared/auth.ts";
import { rateLimit } from "../_shared/rateLimit.ts";
import { requireAllowedOrigin } from "../_shared/security.ts";
import { spendWallet } from "../_shared/supabase.ts";

const MODE_COST: Record<string, number> = { short: 8, long: 15, full: 45 };
const ALLOWED_MODES = new Set(Object.keys(MODE_COST));
const ALLOWED_FORMATS = new Set(["9:16", "1:1", "16:9", "4:5"]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  if (!requireAllowedOrigin(req, res)) return;
  if (!rateLimit(req, res, "render:authorize", 10, 60_000)) return;

  const user = requireAuth(req, res);
  if (!user) return;

  const livePayments = process.env.VITE_PAYMENTS_LIVE === "true";
  const walletBackendEnabled = process.env.NUR_WALLET_BACKEND_ENABLED === "true";

  if (livePayments && !walletBackendEnabled) {
    return res.status(503).json({
      ok: false,
      error: "Canlı üretim için server-side wallet/DB henüz etkin değil",
    });
  }

  const { mode, formats } = req.body || {};

  if (typeof mode !== "string" || !ALLOWED_MODES.has(mode)) {
    return res.status(400).json({ ok: false, error: "Geçersiz süre modu" });
  }

  if (!Array.isArray(formats) || formats.length < 1 || formats.length > 4) {
    return res.status(400).json({ ok: false, error: "Geçersiz format listesi" });
  }

  const uniqueFormats = Array.from(new Set(formats));
  if (uniqueFormats.some((format) => typeof format !== "string" || !ALLOWED_FORMATS.has(format))) {
    return res.status(400).json({ ok: false, error: "Bilinmeyen video formatı" });
  }

  const cost = MODE_COST[mode] * uniqueFormats.length;

  if (livePayments && walletBackendEnabled) {
    const spent = await spendWallet(user.id, cost);
    if (!spent.ok) {
      return res.status(402).json({ ok: false, error: spent.error || "Yetersiz bakiye" });
    }
    return res.status(200).json({ ok: true, userId: user.id, cost, balance: spent.balance, mode, formats: uniqueFormats });
  }

  return res.status(200).json({
    ok: true,
    userId: user.id,
    cost,
    mode,
    formats: uniqueFormats,
  });
}
