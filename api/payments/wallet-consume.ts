import crypto from "crypto";

function userFromSession(req: any): { id: string } | null {
  try {
    const token = String(req.headers.cookie || "").split(";").map((x) => x.trim()).find((x) => x.startsWith("nur_session="))?.slice(12);
    const [payload, signature] = decodeURIComponent(token || "").split(".");
    const secret = process.env.NUR_SESSION_SECRET || process.env.GOOGLE_CLIENT_SECRET || "";
    const expected = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
    if (!payload || signature !== expected) return null;
    const user = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return user.id && user.exp >= Math.floor(Date.now() / 1000) ? { id: user.id } : null;
  } catch { return null; }
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "POST only" });
  const user = userFromSession(req);
  if (!user) return res.status(401).json({ ok: false, error: "Giriş yapın" });
  const kind = String(req.body?.kind || "");
  if (!["kisa", "uzun", "tam"].includes(kind)) return res.status(400).json({ ok: false, error: "Geçersiz video türü" });
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) return res.status(503).json({ ok: false, error: "Kota servisi kullanılamıyor" });
  const response = await fetch(`${url}/rest/v1/rpc/nur_consume_video`, {
    method: "POST", headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_user_id: user.id, p_video_kind: kind, p_daily_quota: kind === "kisa" ? 3 : 0 }),
  });
  const row = ((await response.json()) as Array<{ ok: boolean; quota_left: number; pack_left: number; error?: string }>)[0];
  if (!response.ok || !row?.ok) return res.status(402).json({ ok: false, error: row?.error || "NO_RIGHTS_LEFT" });
  return res.status(200).json({ ok: true, kind, remaining: row.quota_left + row.pack_left });
}
