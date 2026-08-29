import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

const ALLOWED_REDIRECT_URIS = new Set([
  "http://localhost:5173/",
  "http://localhost:5174/",
  "https://nurstudyo.com/",
  "https://www.nurstudyo.com/",
]);
const ALLOWED_ORIGINS = new Set([...ALLOWED_REDIRECT_URIS].map((uri) => new URL(uri).origin));
const AUTH_HITS = new Map<string, number[]>();
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
const REGISTER_BONUS = 5;

function base64Url(value: Buffer | string): string {
  const buffer = Buffer.isBuffer(value) ? value : Buffer.from(value, "utf8");
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function createSessionToken(user: Record<string, unknown>): string {
  const secret = process.env.NUR_SESSION_SECRET || process.env.GOOGLE_CLIENT_SECRET || "";
  if (secret.length < 20) throw new Error("NUR_SESSION_SECRET veya GOOGLE_CLIENT_SECRET tanımlı değil");
  const now = Math.floor(Date.now() / 1000);
  const payload = base64Url(JSON.stringify({ ...user, iat: now, exp: now + SESSION_MAX_AGE }));
  const signature = base64Url(crypto.createHmac("sha256", secret).update(payload).digest());
  return `${payload}.${signature}`;
}

function setSessionCookie(req: VercelRequest, res: VercelResponse, token: string): void {
  const proto = String(req.headers["x-forwarded-proto"] || "").split(",")[0]?.trim();
  const secure = proto === "https" || String(req.headers.origin || "").startsWith("https://");
  res.setHeader("Set-Cookie", `nur_session=${encodeURIComponent(token)}; Path=/; HttpOnly; ${secure ? "Secure; " : ""}SameSite=Lax; Max-Age=${SESSION_MAX_AGE}`);
}

function allowRequest(req: VercelRequest, res: VercelResponse): boolean {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    res.status(403).json({ ok: false, error: "İzin verilmeyen istek kaynağı" });
    return false;
  }

  const ip = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown").split(",")[0].trim();
  const now = Date.now();
  const hits = (AUTH_HITS.get(ip) || []).filter((hit) => hit >= now - 60_000);
  if (hits.length >= 10) {
    res.setHeader("Retry-After", "60");
    res.status(429).json({ ok: false, error: "İstek işlenemedi" });
    return false;
  }
  hits.push(now);
  AUTH_HITS.set(ip, hits);
  return true;
}

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

function supabaseConfig() {
  // ★ URL NORMALİZASYONU (fetch failed çözümü)
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim().replace(/^["']+|["']+$/g, "").replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) throw new Error("Supabase sunucu ayarları eksik");
  return { url, key };
}

async function supabaseRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { url, key } = supabaseConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const text = await response.text();
  if (!response.ok) throw new Error(text || `Supabase ${response.status}`);
  return (text ? JSON.parse(text) : null) as T;
}

async function syncGoogleUser(user: { id: string; email: string; name: string; picture: string; tier: "free" | "pro" | "elit"; isAdmin: boolean }) {
  const existing = await supabaseRequest<any[]>(`nur_users?id=eq.${encodeURIComponent(user.id)}&select=id,tier`);
  const isNew = existing.length === 0;
  const existingTier = existing[0]?.tier;
  const tier = user.isAdmin ? "elit" : userTier(existingTier, false);

  await supabaseRequest("nur_users?on_conflict=id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ id: user.id, email: user.email, name: user.name, picture: user.picture, tier, is_admin: user.isAdmin, updated_at: new Date().toISOString() }),
  });

  await supabaseRequest("nur_wallets?on_conflict=user_id", {
    method: "POST",
    headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
    body: JSON.stringify({ user_id: user.id }),
  });

  if (isNew) {
    await supabaseRequest<Array<{ ok: boolean; balance: number; error: string | null }>>("rpc/nur_claim_reward", {
      method: "POST",
      body: JSON.stringify({ p_user_id: user.id, p_reward_key: "google_register_bonus_v1", p_amount: REGISTER_BONUS }),
    });
  }

  const wallets = await supabaseRequest<Array<{ sub_jeton: number; purchased_jeton: number }>>(`nur_wallets?user_id=eq.${encodeURIComponent(user.id)}&select=sub_jeton,purchased_jeton`);
  return { tier, isNew, wallet: wallets[0] ?? { sub_jeton: 0, purchased_jeton: 0 } };
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
  if (!allowRequest(req, res)) return;

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
    if (!verified.ok) return res.status(401).json({ ok: false, error: (verified as any).error });

    const adminEmails = (process.env.NUR_ADMIN_EMAILS || "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
    const email = String(verified.info.email || "").trim().toLowerCase();
    const isAdmin = adminEmails.includes(email);
    const user: {
      id: string;
      sub: string;
      email: string;
      name: string;
      picture: string;
      verified: boolean;
      isAdmin: boolean;
      tier: "free" | "pro" | "elit";
    } = {
      id: `google-${verified.info.sub}`,
      sub: String(verified.info.sub),
      email,
      name: verified.info.name || email.split("@")[0] || "Google Kullanıcısı",
      picture: verified.info.picture || "",
      verified: true,
      isAdmin,
      tier: isAdmin ? "elit" as const : "free" as const,
    };

    const synced = await syncGoogleUser(user);
    user.tier = synced.tier;

    setSessionCookie(req, res, createSessionToken(user));

    return res.status(200).json({
      ok: true,
      user,
      isNewUser: synced.isNew,
      registerBonus: synced.isNew ? REGISTER_BONUS : 0,
      // StudioApp ilk kayıt bonusunu ekranda bir kez ekliyor. Yeni kullanıcıda
      // burada sıfır dönerek aynı 20 jetonun iki kez gösterilmesini önlüyoruz.
      wallet: synced.isNew ? { subJeton: 0, purchasedJeton: 0, total: 0 } : {
        subJeton: synced.wallet.sub_jeton,
        purchasedJeton: synced.wallet.purchased_jeton,
        total: synced.wallet.sub_jeton + synced.wallet.purchased_jeton,
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Google girişi doğrulanamadı";
    console.error("[Google Auth Error]", msg);
    return res.status(500).json({ ok: false, error: msg });
  }
}
