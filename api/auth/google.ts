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
    const __fingerprint = crypto.createHash("sha256").update(__msg + "|" + __path).digest("hex").slice(0, 16);
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

const ALLOWED_REDIRECT_URIS = new Set([
  "http://localhost:5173/",
  "http://localhost:5174/",
  "https://nurstudyo.com/",
  "https://www.nurstudyo.com/",
]);
const ALLOWED_ORIGINS = new Set([...ALLOWED_REDIRECT_URIS].map((uri) => new URL(uri).origin));
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
const REGISTER_BONUS = 5;

function base64Url(value: Buffer | string): string {
  const buffer = Buffer.isBuffer(value) ? value : Buffer.from(value, "utf8");
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function createSessionToken(user: Record<string, unknown>): string {
  const secret = process.env.NUR_SESSION_SECRET || "";
  if (secret.length < 20) throw new Error("NUR_SESSION_SECRET veya GOOGLE_CLIENT_SECRET tanımlı değil");
  // ★ Açık 10 notu: GOOGLE_CLIENT_SECRET fallback'i geçici uyumluluktur.
  //   Vercel'de NUR_SESSION_SECRET tanımlanınca bu uyarı kaybolur; o zaman
  //   fallback zinciri tüm dosyalardan kaldırılabilir (tek adımda, planlı).
  if (!process.env.NUR_SESSION_SECRET) {
    console.warn("[guvenlik] NUR_SESSION_SECRET tanımlı değil — oturum imzası GOOGLE_CLIENT_SECRET fallback'iyle yapılıyor. Vercel env'ine NUR_SESSION_SECRET ekle.");
  }
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

// ★ PAYLAŞIMLI RATE LIMIT (Açık 2) — Upstash Redis varsa instance'lar arası
//   ortak sayaç (UPSTASH_REDIS_REST_URL/TOKEN env), yoksa in-memory fallback.
const __RL_MAP = new Map<string, number[]>();
const __RL_URL = (process.env.UPSTASH_REDIS_REST_URL || "").replace(/\/+$/, "");
const __RL_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || "";
const __RL_SHARED = __RL_URL.length > 0 && __RL_TOKEN.length > 0;
function __rlIp(req: { headers: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string | null } }): string {
  const forwarded = String(req.headers["cf-connecting-ip"] || req.headers["x-real-ip"] || String(req.headers["x-forwarded-for"] || "").split(",")[0] || "").trim();
  return forwarded || req.socket?.remoteAddress || "unknown";
}
function __rlMem(bucketKey: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const active = (__RL_MAP.get(bucketKey) || []).filter((h) => h >= now - windowMs);
  if (active.length >= max) { __RL_MAP.set(bucketKey, active); return false; }
  active.push(now);
  __RL_MAP.set(bucketKey, active);
  if (__RL_MAP.size > 5000) { for (const k of __RL_MAP.keys()) { __RL_MAP.delete(k); if (__RL_MAP.size <= 2500) break; } }
  return true;
}
async function __rlShared(bucketKey: string, windowMs: number): Promise<number | null> {
  if (!__RL_SHARED) return null;
  try {
    const res = await fetch(`${__RL_URL}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${__RL_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify([["INCR", `rl:${bucketKey}`], ["EXPIRE", `rl:${bucketKey}`, String(Math.ceil(windowMs / 1000)), "NX"]]),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as Array<{ result: unknown }>;
    return Number(json[0]?.result ?? 1);
  } catch { return null; }
}
async function rateLimit(req: { headers: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string | null } }, res: { setHeader: (k: string, v: string) => void; status: (n: number) => { json: (o: unknown) => void } }, key: string, maxRequests: number, windowMs: number): Promise<boolean> {
  const bucketKey = `${key}:${__rlIp(req)}`;
  const hits = await __rlShared(bucketKey, windowMs);
  if (hits !== null) {
    if (hits > maxRequests) { res.setHeader("Retry-After", "60"); res.setHeader("Cache-Control", "no-store"); res.status(429).json({ ok: false, error: "İstek işlenemedi" }); return false; }
    return true;
  }
  const ok = __rlMem(bucketKey, maxRequests, windowMs);
  if (!ok) { res.setHeader("Retry-After", "60"); res.setHeader("Cache-Control", "no-store"); res.status(429).json({ ok: false, error: "İstek işlenemedi" }); }
  return ok;
}

async function allowRequest(req: VercelRequest, res: VercelResponse): Promise<boolean> {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    res.status(403).json({ ok: false, error: "İzin verilmeyen istek kaynağı" });
    return false;
  }

  return rateLimit(req, res, "auth:google", 10, 60_000);
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

  if (isNew && !user.isAdmin) {
    // ★ KAYIT BONUSU FIX (07.10, "hediye gelmedi"): eski kod ölü rpc/nur_claim_reward
    //   yolunu çağırıyordu; bonus sub_jeton kolonuna yazılıyordu ama /api/payments/wallet
    //   YALNIZ purchased_kisa/uzun/tam döner — yani bonus cihaza ASLA ulaşmıyor, bildirim
    //   sahteydi. Artık bonus doğrudan purchased_kisa'ya yazılır: wallet paket hakkı
    //   olarak döner, istemci 30 sn'lik sync'te gerçekten alır.
    await supabaseRequest("nur_wallets?on_conflict=user_id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ user_id: user.id, purchased_kisa: REGISTER_BONUS, updated_at: new Date().toISOString() }),
    });
    // ★ DENEME OTOMASYONU FIX (07.10, "hakkım yok"): 02.10'dan beri 7 gün PRO denemesi
    //   Google kayıtlı kullanıcıda HİÇ başlamıyordu — startTrial() yalnız /kayit formunda
    //   çağrılıyordu, Google yolu hiç çağırmıyordu (nur_trials canlıda 0 kayıttı).
    //   Sunucu denemesini burada başlatır; istemci trialStarted ile eşitler.
    //   loadServerAccess (render/authorize) nur_trials'taki aktif kaydı PRO sayar —
    //   yani deneme artık üretim kapısında da gerçekten geçerli.
    try {
      const simdi = new Date().toISOString();
      await supabaseRequest("nur_trials?on_conflict=user_id", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({ user_id: user.id, started_at: simdi, updated_at: simdi }),
      });
    } catch { /* deneme yazımı başarısız olsa da giriş akışı bozulmaz */ }
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
  if (!(await allowRequest(req, res))) return;

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
      // ★ 07.10: yeni Google kaydında sunucu 7 gün PRO denemesi başlattı —
      //   istemci yerel önbelleğini buna eşitler (useAuthSession).
      trialStarted: synced.isNew && !user.isAdmin,
      // StudioApp ilk kayıt bonusunu ekranda bir kez ekliyor. Yeni kullanıcıda
      // burada sıfır dönerek aynı 20 jetonun iki kez gösterilmesini önlüyoruz.
      wallet: synced.isNew ? { subJeton: 0, purchasedJeton: 0, total: 0 } : {
        subJeton: synced.wallet.sub_jeton,
        purchasedJeton: synced.wallet.purchased_jeton,
        total: synced.wallet.sub_jeton + synced.wallet.purchased_jeton,
      },
    });
  } catch (error) {
    await logServerError(req, error, "api/auth/google");
    const msg = error instanceof Error ? error.message : "Google girişi doğrulanamadı";
    console.error("[Google Auth Error]", msg);
    return res.status(500).json({ ok: false, error: msg });
  }
}
