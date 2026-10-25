import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

// ════════════════════════════════════════════════════════
// CUSTOMER DENEME — LANSMAN DENEMESİ OKUMA UÇ BİLGİSİ (25.10)
//   GET /api/customer/deneme → { ok:true, left: 0..5, total: 5 }
//   • Oturum (nur_session cookie) ZORUNLUYDUR; oturumsuz 401 (istemci sessiz geçer).
//   • nur_deneme_kalan RPC ilk okumada satırı 5 ile açar (auto-grant).
//   • Tarayıcı cache YOK — her istek canlı bakiyeyi döner.
// ════════════════════════════════════════════════════════

declare const process: { env: Record<string, string | undefined> };

interface SessionUser { id: string; email: string; verified: boolean; isAdmin: boolean; tier?: string; exp: number }

function fromBase64Url(input: string): Buffer {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4 ? "=".repeat(4 - (normalized.length % 4)) : "";
  return Buffer.from(normalized + pad, "base64");
}
function base64Url(input: Buffer): string {
  return input.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function getSessionUser(req: VercelRequest): SessionUser | null {
  const cookie = String(req.headers.cookie || "").split(";").map((part) => part.trim()).find((part) => part.startsWith("nur_session="));
  if (!cookie) return null;
  const [payload, signature] = decodeURIComponent(cookie.slice("nur_session=".length)).split(".");
  const secret = process.env.NUR_SESSION_SECRET || "";
  if (!payload || !signature || secret.length < 20) return null;
  const expected = base64Url(crypto.createHmac("sha256", secret).update(payload).digest());
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) return null;
  try {
    const user = JSON.parse(fromBase64Url(payload).toString("utf8")) as SessionUser;
    if (!user.id || !user.email || !user.verified || user.exp < Math.floor(Date.now() / 1000)) return null;
    return user;
  } catch { return null; }
}

function requireAllowedOrigin(req: VercelRequest, res: VercelResponse): boolean {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";
  const referer = typeof req.headers.referer === "string" ? req.headers.referer : "";
  const allowed = new Set(["https://nurstudyo.com", "https://www.nurstudyo.com", "http://localhost:5173", "http://localhost:5174", "http://localhost:5199"]);
  if (!origin && !referer) return true;
  if (origin && allowed.has(origin)) return true;
  if (referer) { try { if (allowed.has(new URL(referer).origin)) return true; } catch { /* ignore */ } }
  res.status(403).json({ ok: false, error: "İzin verilmeyen istek kaynağı" });
  return false;
}

function supabaseConfig() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim().replace(/^["']+|["']+$/g, "").replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) return null;
  return { url, key };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  if (!requireAllowedOrigin(req, res)) return;

  const user = getSessionUser(req);
  if (!user) return res.status(401).json({ ok: false, error: "Oturum gerekli" });

  const sb = supabaseConfig();
  if (!sb) return res.status(200).json({ ok: false, error: "Deneme servisi yapılandırılmamış" });

  try {
    const rpcRes = await fetch(`${sb.url}/rest/v1/rpc/nur_deneme_kalan`, {
      method: "POST",
      headers: { apikey: sb.key, Authorization: `Bearer ${sb.key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ p_user_id: user.id }),
      cache: "no-store",
    });
    if (!rpcRes.ok) return res.status(200).json({ ok: false, error: "Deneme servisi yanıtvermedi" });
    const rows = await rpcRes.json() as Array<{ remaining: number }>;
    return res.status(200).json({ ok: true, left: Math.max(0, Number(rows[0]?.remaining ?? 0)), total: 5 });
  } catch {
    return res.status(200).json({ ok: false, error: "Deneme servisi yanıtvermedi" });
  }
}
