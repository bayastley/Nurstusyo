import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createSessionToken, setSessionCookie, isSecureRequest } from "../_shared/auth.ts";
import { rateLimit } from "../_shared/rateLimit.ts";
import { requireAllowedOrigin } from "../_shared/security.ts";
import { ensureWallet, getUser, upsertUser } from "../_shared/supabase.ts";

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    const msg = error instanceof Error ? error.message : "Google girişi doğrulanamadı";
    console.error("[Google Auth Error]", msg);
    return res.status(500).json({ ok: false, error: msg });
  }
}