import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

// ═══════════════════════════════════════════════════════════════
// ★ /api/ban/status — Ban durumu sorgusu
//
// GÜVENLİK: E-posta parametresi kimlik doğrulamasız alınırsa bu endpoint
//   "hangi hesaplar banlı?" diye dışarıdan taranabilen bir oracle olur.
//   Kurallar:
//   - Email verilmezse → oturumdaki kullanıcının KENDİ ban durumu döner.
//   - Email verilirse → yalnızca KENDİ email'i veya ADMIN sorgulayabilir.
// ═══════════════════════════════════════════════════════════════

// ─── Rate limit — dakikada 30 sorgu ──────────────────────────
const RATE_HITS = new Map<string, number[]>();

function allowRequest(req: VercelRequest, res: VercelResponse): boolean {
  const ip = String(req.headers["x-forwarded-for"] || "unknown").split(",")[0].trim();
  const now = Date.now();
  const hits = (RATE_HITS.get(ip) || []).filter((hit) => hit >= now - 60_000);
  if (hits.length >= 30) {
    res.setHeader("Retry-After", "60");
    res.status(429).json({ ok: false, error: "İstek işlenemedi" });
    return false;
  }
  hits.push(now);
  RATE_HITS.set(ip, hits);
  return true;
}

// ─── Oturum doğrulama (self-contained) ───────────────────────
interface SessionUser {
  id?: string;
  email?: string;
  verified?: boolean;
  isAdmin?: boolean;
  exp?: number;
}

function getSessionUser(req: VercelRequest): SessionUser | null {
  try {
    const cookie = String(req.headers.cookie || "")
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("nur_session="));
    if (!cookie) return null;
    const token = decodeURIComponent(cookie.slice("nur_session=".length));
    const [payload, signature] = token.split(".");
    const secret = process.env.NUR_SESSION_SECRET || process.env.GOOGLE_CLIENT_SECRET || "";
    if (!payload || !signature || secret.length < 20) return null;
    const expected = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expected);
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;
    const user = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionUser;
    if (!user.email || user.verified !== true) return null;
    if (!user.exp || user.exp < Math.floor(Date.now() / 1000)) return null;
    return user;
  } catch {
    return null;
  }
}

// ─── Supabase ────────────────────────────────────────────────
function supabaseConfig() {
  // ★ URL NORMALİZASYONU
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "")
    .trim()
    .replace(/^["']+|["']+$/g, "")
    .replace(/\/rest\/v1\/?$/i, "")
    .replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) return null;
  return { url, key };
}

async function verifyAdminInDb(email: string): Promise<boolean> {
  const sb = supabaseConfig();
  if (!sb) return false;
  try {
    const response = await fetch(`${sb.url}/rest/v1/nur_users?email=eq.${encodeURIComponent(email)}&select=is_admin`, {
      headers: { apikey: sb.key, Authorization: `Bearer ${sb.key}` },
      cache: "no-store",
    });
    if (!response.ok) return false;
    const rows = (await response.json()) as Array<{ is_admin?: boolean }>;
    return rows[0]?.is_admin === true;
  } catch {
    return false;
  }
}

async function isBannedInDb(email: string): Promise<{ isBanned: boolean; reason: string }> {
  const sb = supabaseConfig();
  if (!sb) return { isBanned: false, reason: "" };
  const response = await fetch(
    `${sb.url}/rest/v1/nur_ban_logs?user_email=eq.${encodeURIComponent(email)}&unbanned=eq.false&is_auto=eq.false&select=id,reason&limit=1`,
    { headers: { apikey: sb.key, Authorization: `Bearer ${sb.key}` } }
  );
  if (!response.ok) return { isBanned: false, reason: "" };
  const rows = (await response.json()) as Array<{ id: string; reason: string }>;
  return { isBanned: rows.length > 0, reason: rows[0]?.reason || "" };
}

// ─── Handler ─────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }
  if (!allowRequest(req, res)) return;

  try {
    const session = getSessionUser(req);
    const rawEmail = String(req.body?.email || req.query?.email || "").trim().toLowerCase().slice(0, 254);

    let effectiveEmail = "";

    if (rawEmail) {
      if (!session) {
        // ★ Oracle kapatıldı: oturumsuz e-posta sorgusu cevap vermez.
        return res.status(403).json({ ok: false, error: "Oturum gerekli" });
      }
      if (rawEmail !== String(session.email).toLowerCase()) {
        // Başkasının ban durumunu sorgulamak adminlik ister.
        const isAdmin = session.isAdmin === true && (await verifyAdminInDb(String(session.email)));
        if (!isAdmin) {
          return res.status(403).json({ ok: false, error: "Yalnızca kendi ban durumunuzu sorgulayabilirsiniz" });
        }
        effectiveEmail = rawEmail;
      } else {
        effectiveEmail = rawEmail;
      }
    } else if (session) {
      effectiveEmail = String(session.email).toLowerCase();
    } else {
      // Anonim ziyaretçi — banlı bir hesabı olamaz.
      return res.status(200).json({ ok: true, isBanned: false, banned: false, email: "" });
    }

    const { isBanned, reason } = await isBannedInDb(effectiveEmail);

    return res.status(200).json({
      ok: true,
      isBanned,
      banned: isBanned,
      email: effectiveEmail,
      reason: isBanned ? reason : "",
    });
  } catch {
    // Fail-safe: hata olursa ban yok sayılır
    return res.status(200).json({ ok: true, isBanned: false, banned: false, error: "fail-safe" });
  }
}
