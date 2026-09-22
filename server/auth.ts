import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";


// ─── Server error logger (gömülü — _shared Vercel'de paketlenmiyor) ───
async function logServerError(req: { url?: string; headers: Record<string, string | string[] | undefined> }, error: unknown, endpoint: string): Promise<void> {
  try {
    const __url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim().replace(/\/$/, "");
    const __key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    if (!__url || !__key) return;
    const __msg = error instanceof Error ? error.message : String(error || "Bilinmeyen sunucu hatası");
    if (!__msg) return;
    const __stack = error instanceof Error ? (error.stack || "") : "";
    const __path = String(req.url || endpoint).slice(0, 200);
    const __fingerprint = require("crypto").createHash("sha256").update(__msg + "|" + __path).digest("hex").slice(0, 16);
    await fetch(__url + "/rest/v1/nur_error_logs", {
      method: "POST",
      headers: { apikey: __key, Authorization: "Bearer " + __key, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        message: __msg.slice(0, 500),
        stack: __stack.slice(0, 4000),
        path: __path,
        source: ("server:" + endpoint).slice(0, 40),
        user_agent: String(req.headers["user-agent"] || "server").slice(0, 300),
        fingerprint: __fingerprint,
        kind: "genel",
        user_email: "",
      }),
    });
  } catch { /* log yazımı siteyi ASLA bozmaz */ }
}

export interface AuthUser {
  id: string;
  sub: string;
  email: string;
  name: string;
  picture?: string;
  verified: boolean;
  isAdmin: boolean;
  iat: number;
  exp: number;
}

const COOKIE_NAME = "nur_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function sessionSecret(): string {
  const secret = process.env.NUR_SESSION_SECRET || process.env.GOOGLE_CLIENT_SECRET || "";
  if (!secret || secret.length < 20) throw new Error("NUR_SESSION_SECRET veya GOOGLE_CLIENT_SECRET tanımlı değil");
  return secret;
}

function base64Url(input: Buffer | string): string {
  const raw = Buffer.isBuffer(input) ? input : Buffer.from(input, "utf8");
  return raw.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(input: string): Buffer {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4 ? "=".repeat(4 - (normalized.length % 4)) : "";
  return Buffer.from(normalized + pad, "base64");
}

function signPayload(payload: string): string {
  return base64Url(crypto.createHmac("sha256", sessionSecret()).update(payload).digest());
}

function parseCookies(req: VercelRequest): Record<string, string> {
  const header = req.headers.cookie || "";
  return header.split(";").reduce<Record<string, string>>((acc, part) => {
    const [key, ...rest] = part.trim().split("=");
    if (!key) return acc;
    acc[key] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
}

export function createSessionToken(user: Omit<AuthUser, "iat" | "exp">): string {
  const now = Math.floor(Date.now() / 1000);
  const payload = base64Url(JSON.stringify({ ...user, iat: now, exp: now + MAX_AGE_SECONDS }));
  return `${payload}.${signPayload(payload)}`;
}

export function verifySessionToken(token: string | undefined): AuthUser | null {
  if (!token || !token.includes(".")) return null;
  // ★ Eksik NUR_SESSION_SECRET fonksiyonu çökertmesin: oturumu geçersiz say
  const secret = process.env.NUR_SESSION_SECRET || process.env.GOOGLE_CLIENT_SECRET || "";
  if (!secret || secret.length < 20) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = signPayload(payload);
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;
  try {
    const user = JSON.parse(fromBase64Url(payload).toString("utf8")) as AuthUser;
    if (!user.exp || user.exp < Math.floor(Date.now() / 1000)) return null;
    if (!user.email || !user.id || !user.sub || user.verified !== true) return null;
    return user;
  } catch {
    return null;
  }
}

export function getSessionUser(req: VercelRequest): AuthUser | null {
  return verifySessionToken(parseCookies(req)[COOKIE_NAME]);
}

export function requireAuth(req: VercelRequest, res: VercelResponse): AuthUser | null {
  const user = getSessionUser(req);
  if (!user) {
    res.status(401).json({ ok: false, error: "Oturum gerekli" });
    return null;
  }
  return user;
}

export function requireAdmin(req: VercelRequest, res: VercelResponse): AuthUser | null {
  const user = requireAuth(req, res);
  if (!user) return null;
  if (!user.isAdmin) {
    res.status(403).json({ ok: false, error: "Admin yetkisi gerekli" });
    return null;
  }
  return user;
}

/**
 * Session cookie yazar.
 * Secure bayrağı yalnızca HTTPS'te konur; böylece localhost (http) testinde
 * cookie engellenmez, canlıda ise zorunlu kalır.
 */
export function setSessionCookie(res: VercelResponse, token: string, secure: boolean): void {
  const secureFlag = secure ? "Secure; " : "";
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; ${secureFlag}SameSite=Lax; Max-Age=${MAX_AGE_SECONDS}`);
}

export function clearSessionCookie(res: VercelResponse, secure: boolean): void {
  const secureFlag = secure ? "Secure; " : "";
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=; Path=/; HttpOnly; ${secureFlag}SameSite=Lax; Max-Age=0`);
}

/** İsteğin HTTPS üzerinden gelip gelmediğini belirler. */
export function isSecureRequest(req: VercelRequest): boolean {
  const proto = String(req.headers["x-forwarded-proto"] || "").split(",")[0]?.trim();
  if (proto) return proto === "https";
  const origin = String(req.headers.origin || "");
  return origin.startsWith("https://");
}
