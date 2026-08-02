import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createSessionToken, setSessionCookie, clearSessionCookie, isSecureRequest, getSessionUser } from "../../server/auth";
import { rateLimit } from "../../server/rateLimit";
import { requireAllowedOrigin } from "../../server/security";
import { ensureWallet, getUser, getWallet, getActiveBan, upsertUser } from "../../server/supabase";

/**
 * ★ BİRLEŞİK AUTH ROUTER — /api/auth/google | /api/auth/me | /api/auth/logout
 *   Vercel Hobby planı function limiti (12) nedeniyle tek dosyada toplandı.
 *   Frontend URL'leri değişmedi.
 */

// ─── GOOGLE ────────────────────────────────────────────────
const ALLOWED_REDIRECT_URIS = new Set([
  "http://localhost:5173/",
  "http://localhost:5174/",
  "https://nurstudyo.com/",
  "https://www.nurstudyo.com/",
]);

interface GoogleTokenInfo {
  aud?: string;
  iss?: string;
  exp?: string;
  sub?: string;
  email?: string;
  email_verified?: string | boolean;
  name?: string;
  picture?: string;
}

function isAllowedRedirectUri(value: unknown): value is string {
  return typeof value === "string" && ALLOWED_REDIRECT_URIS.has(value);
}
function isSafeCode(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9._~/-]{20,4096}$/.test(value);
}
function isSafeVerifier(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9._~-]{43,128}$/.test(value);
}
function userTier(existing: unknown, isAdmin: boolean): "free" | "pro" | "elit" {
  if (isAdmin) return "elit";
  return existing === "pro" || existing === "elit" ? existing : "free";
}

async function verifyIdToken(idToken: string, clientId: string): Promise<{ ok: true; info: GoogleTokenInfo } | { ok: false; error: string }> {
  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`, { cache: "no-store" });
  if (!response.ok) return { ok: false, error: "Google token doğrulaması başarısız" };
  const info = (await response.json()) as GoogleTokenInfo;
  if (info.aud !== clientId) return { ok: false, error: "Google token audience uyuşmuyor" };
  if (info.iss !== "https://accounts.google.com" && info.iss !== "accounts.google.com") return { ok: false, error: "Google token issuer geçersiz" };
  if (!info.exp || Number(info.exp) * 1000 < Date.now()) return { ok: false, error: "Google token süresi dolmuş" };
  if (info.email_verified !== true && info.email_verified !== "true") return { ok: false, error: "Google e-posta doğrulanmamış" };
  if (!info.sub || !info.email) return { ok: false, error: "Google token kullanıcı bilgisi eksik" };
  return { ok: true, info };
}

async function googleHandler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  if (!requireAllowedOrigin(req, res)) return;
  if (!rateLimit(req, res, "auth:google", 10, 60_000)) return;

  try {
    const clientId = process.env.VITE_GOOGLE_CLIENT_ID || "";
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
    if (!clientId) return res.status(500).json({ ok: false, error: "Google Client ID sunucuda tanımlı değil" });

    const { code, codeVerifier, redirectUri, idToken } = req.body || {};
    let finalIdToken = typeof idToken === "string" ? idToken : "";

    if (!finalIdToken) {
      if (!isSafeCode(code)) return res.status(400).json({ ok: false, error: "Google code geçersiz" });
      if (!isSafeVerifier(codeVerifier)) return res.status(400).json({ ok: false, error: "Google PKCE verifier geçersiz" });
      if (!isAllowedRedirectUri(redirectUri)) return res.status(400).json({ ok: false, error: "Google redirect URI izinli değil" });

      const params = new URLSearchParams();
      params.set("client_id", clientId);
      if (clientSecret) params.set("client_secret", clientSecret);
      params.set("code", code);
      params.set("code_verifier", codeVerifier);
      params.set("grant_type", "authorization_code");
      params.set("redirect_uri", redirectUri);

      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });
      const tokenData = (await tokenResponse.json().catch(() => null)) as { id_token?: string; error?: string; error_description?: string } | null;
      if (!tokenResponse.ok || !tokenData?.id_token) {
        return res.status(401).json({ ok: false, error: tokenData?.error_description || tokenData?.error || "Google token değişimi başarısız" });
      }
      finalIdToken = tokenData.id_token;
    }

    const verified = await verifyIdToken(finalIdToken, clientId);
    if (!verified.ok) return res.status(401).json({ ok: false, error: verified.error });

    const adminEmails = (process.env.NUR_ADMIN_EMAILS || "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
    const email = String(verified.info.email || "").trim().toLowerCase();
    const existingUser = await getUser(`google-${verified.info.sub}`).catch(() => null);
    const tier = userTier(existingUser?.tier, adminEmails.includes(email));
    const user = {
      id: `google-${verified.info.sub}`,
      sub: String(verified.info.sub),
      email,
      name: verified.info.name || email.split("@")[0] || "Google Kullanıcısı",
      picture: verified.info.picture || "",
      verified: true,
      isAdmin: adminEmails.includes(email),
      tier,
    };

    await upsertUser({ id: user.id, email: user.email, name: user.name, picture: user.picture, tier, is_admin: user.isAdmin }).catch(() => null);
    const wallet = await ensureWallet(user.id).catch(() => null);

    setSessionCookie(res, createSessionToken(user), isSecureRequest(req));

    return res.status(200).json({
      ok: true,
      user,
      wallet: wallet ? { subJeton: wallet.sub_jeton, purchasedJeton: wallet.purchased_jeton, total: wallet.sub_jeton + wallet.purchased_jeton } : null,
    });
  } catch (error) {
    console.error("[Google Auth Error]", error);
    return res.status(500).json({ ok: false, error: "Google girişi doğrulanamadı" });
  }
}

// ─── ME ────────────────────────────────────────────────────
async function meHandler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  if (!rateLimit(req, res, "auth:me", 120, 60_000)) return;

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
}

// ─── LOGOUT ────────────────────────────────────────────────
function logoutHandler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  if (!requireAllowedOrigin(req, res)) return;
  if (!rateLimit(req, res, "auth:logout", 20, 60_000)) return;
  clearSessionCookie(res, isSecureRequest(req));
  return res.status(200).json({ ok: true });
}

// ─── ROUTER ────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const route = String(req.query.slug ?? "");
  if (route === "google") return googleHandler(req, res);
  if (route === "me") return meHandler(req, res);
  if (route === "logout") return logoutHandler(req, res);
  return res.status(404).json({ ok: false, error: "Not Found" });
}
