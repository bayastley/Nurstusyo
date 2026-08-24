import type { VercelRequest, VercelResponse } from "@vercel/node";

// Supabase ban sorgusu — fail-safe
function supabaseConfig() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) return null;
  return { url, key };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  try {
    const email = String(req.body?.email || req.query?.email || "").trim().toLowerCase();
    if (!email || !email.includes("@")) {
      return res.status(200).json({ ok: true, isBanned: false, banned: false, email });
    }

    const sb = supabaseConfig();
    if (!sb) {
      return res.status(200).json({ ok: true, isBanned: false, banned: false, email });
    }

    // Supabase'de aktif ban kaydı var mı kontrol et (sadece manuel banlar)
    const response = await fetch(
      `${sb.url}/rest/v1/nur_ban_logs?user_email=eq.${encodeURIComponent(email)}&unbanned=eq.false&is_auto=eq.false&select=id,reason&limit=1`,
      {
        headers: {
          apikey: sb.key,
          Authorization: `Bearer ${sb.key}`,
        },
      }
    );

    if (!response.ok) {
      return res.status(200).json({ ok: true, isBanned: false, banned: false, email });
    }

    const rows = await response.json() as Array<{ id: string; reason: string }>;
    const isBanned = rows.length > 0;

    return res.status(200).json({
      ok: true,
      isBanned,
      banned: isBanned,
      email,
      reason: isBanned ? rows[0].reason : "",
    });
  } catch (error) {
    // Fail-safe: hata olursa ban yok sayılır
    return res.status(200).json({ ok: true, isBanned: false, banned: false, error: "fail-safe" });
  }
}
