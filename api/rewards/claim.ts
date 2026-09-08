import crypto from "crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";

type Kind = "kisa" | "uzun" | "tam";

function userFromSession(req: VercelRequest): { id: string } | null {
  try {
    const token = String(req.headers.cookie || "").split(";").map((x) => x.trim())
      .find((x) => x.startsWith("nur_session="))?.slice("nur_session=".length);
    const [payload, signature] = decodeURIComponent(token || "").split(".");
    const secret = process.env.NUR_SESSION_SECRET || process.env.GOOGLE_CLIENT_SECRET || "";
    if (!payload || !signature || secret.length < 20) return null;
    const expected = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
    if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
    const user = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { id?: string; exp?: number };
    return user.id && (user.exp || 0) >= Math.floor(Date.now() / 1000) ? { id: user.id } : null;
  } catch { return null; }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  const user = userFromSession(req);
  if (!user) return res.status(401).json({ ok: false, error: "Oturum gerekli" });
  const body = (req.body || {}) as { eventKey?: string; kind?: Kind; amount?: number };
  const eventKey = String(body.eventKey || "");
  const kind = body.kind;
  const amount = Math.floor(Number(body.amount));
  if (!/^(cuma|kandil|kadir|bayram|ramazan)-\d{4}-\d{2}-\d{2}$/.test(eventKey) ||
      !["kisa", "uzun", "tam"].includes(String(kind)) || amount < 1 || amount > 50) {
    return res.status(400).json({ ok: false, error: "Geçersiz hediye" });
  }
  const match = eventKey.match(/^([a-z]+)-(\d{4}-\d{2}-\d{2})$/);
  const eventType = match?.[1] || "";
  const dateText = match?.[2] || "";
  const eventDate = new Date(`${dateText}T12:00:00Z`);
  if (!Number.isFinite(eventDate.getTime())) return res.status(400).json({ ok: false, error: "Geçersiz tarih" });
  if (eventType === "cuma" && eventDate.getUTCDay() !== 5) {
    return res.status(400).json({ ok: false, error: "Cuma hediyesi yalnızca Cuma günü alınabilir" });
  }
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) return res.status(503).json({ ok: false, error: "Hediye servisi kullanılamıyor" });
  const response = await fetch(`${url}/rest/v1/rpc/nur_claim_video_reward`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_user_id: user.id, p_reward_key: eventKey, p_video_kind: kind, p_amount: amount }),
  });
  if (!response.ok) return res.status(503).json({ ok: false, error: "Hediye servisi kullanılamıyor" });
  const row = ((await response.json()) as Array<{ ok: boolean; remaining: number; error: string | null }>)[0];
  if (!row?.ok) return res.status(409).json({ ok: false, error: row?.error || "ALREADY_CLAIMED" });
  return res.status(200).json({ ok: true, remaining: row.remaining });
}
