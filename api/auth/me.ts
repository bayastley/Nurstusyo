import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

interface SessionUser {
  id: string;
  sub: string;
  email: string;
  name: string;
  picture?: string;
  verified: boolean;
  isAdmin: boolean;
  tier?: "free" | "pro" | "elit";
  exp: number;
}

const HITS = new Map<string, number[]>();

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
  const token = decodeURIComponent(cookie.slice("nur_session=".length));
  const [payload, signature] = token.split(".");
  const secret = process.env.NUR_SESSION_SECRET || process.env.GOOGLE_CLIENT_SECRET || "";
  if (!payload || !signature || secret.length < 20) return null;
  const expected = base64Url(crypto.createHmac("sha256", secret).update(payload).digest());
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) return null;
  try {
    const user = JSON.parse(fromBase64Url(payload).toString("utf8")) as SessionUser;
    if (!user.id || !user.email || !user.sub || !user.verified || user.exp < Math.floor(Date.now() / 1000)) return null;
    return user;
  } catch {
    return null;
  }
}

function allowRequest(req: VercelRequest, res: VercelResponse): boolean {
  const ip = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown").split(",")[0].trim();
  const now = Date.now();
  const hits = (HITS.get(ip) || []).filter((hit) => hit >= now - 60_000);
  if (hits.length >= 120) {
    res.setHeader("Retry-After", "60");
    res.status(429).json({ ok: false, error: "İstek işlenemedi" });
    return false;
  }
  hits.push(now);
  HITS.set(ip, hits);
  return true;
}

function supabaseConfig() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) throw new Error("Supabase sunucu ayarları eksik");
  return { url, key };
}

async function supabaseRows<T>(path: string): Promise<T[]> {
  const { url, key } = supabaseConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(await response.text());
  return await response.json() as T[];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  if (!allowRequest(req, res)) return;

  try {
    const user = getSessionUser(req);
    if (!user) return res.status(401).json({ ok: false, error: "Oturum bulunamadı" });

    const [users, wallets] = await Promise.all([
      supabaseRows<{ tier: "free" | "pro" | "elit"; is_admin: boolean }>(`nur_users?id=eq.${encodeURIComponent(user.id)}&select=tier,is_admin`),
      supabaseRows<{ sub_jeton: number; purchased_jeton: number; purchased_kisa: number; purchased_uzun: number; purchased_tam: number }>(`nur_wallets?user_id=eq.${encodeURIComponent(user.id)}&select=sub_jeton,purchased_jeton,purchased_kisa,purchased_uzun,purchased_tam`),
    ]);
    const dbUser = users[0];
    const wallet = wallets[0] ?? { sub_jeton: 0, purchased_jeton: 0, purchased_kisa: 0, purchased_uzun: 0, purchased_tam: 0 };

    // Ban sorgusu hata verirse fail-open: kullanıcı yalnızca açık bir ban kaydı
    // bulunduğunda engellenir.
    let ban: { reason: string } | null = null;
    try {
      const bans = await supabaseRows<{ reason: string }>(`nur_ban_logs?or=(user_id.eq.${encodeURIComponent(user.id)},user_email.eq.${encodeURIComponent(user.email)})&unbanned=eq.false&is_auto=eq.false&order=created_at.desc&limit=1&select=reason`);
      ban = bans[0] ?? null;
    } catch {
      ban = null;
    }

    return res.status(200).json({
      ok: true,
      user: {
        id: user.id,
        sub: user.sub,
        email: user.email,
        name: user.name,
        picture: user.picture || "",
        verified: user.verified,
        isAdmin: Boolean(user.isAdmin || dbUser?.is_admin),
        tier: dbUser?.tier || user.tier || "free",
      },
      wallet: {
        subJeton: wallet.sub_jeton,
        purchasedJeton: wallet.purchased_jeton,
        kisa: wallet.purchased_kisa ?? wallet.purchased_jeton ?? 0,
        uzun: wallet.purchased_uzun ?? 0,
        tam: wallet.purchased_tam ?? 0,
        total: wallet.sub_jeton + wallet.purchased_jeton,
      },
      banned: Boolean(ban),
      banReason: ban?.reason || "",
    });
  } catch (error) {
    console.error("[Auth Me Error]", error);
    return res.status(500).json({ ok: false, error: "Oturum kontrolü başarısız" });
  }
}
