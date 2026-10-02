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
  } catch (error) {
    await logServerError(req, error, "trial"); /* log yazımı siteyi ASLA bozmaz */
  }
}

declare const process: { env: Record<string, string | undefined> };

// ════════════════════════════════════════════════════════
// TRIAL — 7 GÜN PRO DENEMESİ SUNUCU KAYDI (02.10)
// Self-contained: _shared importları Vercel'de paketlenmediği
// için auth/origin/rate-limit/supabase buraya gömüldü.
//
// SORUN: deneme yalnız localStorage'daydı (nur_trial_start).
//   Anahtarı silip yeniden kurunca deneme sonsuza dek
//   yenileniyordu — sunucu kapısı (render/authorize) DB'deki
//   nur_users.tier'dan okuduğu için asıl kotayı zaten tutuyordu
//   ama UI kısıtları bypass edilebiliyordu.
// ÇÖZÜM: deneme başlangıcı nur_trials tablosunda saklanır.
//   POST → kayıt yoksa oluştur (şimdi ya da taşınan eski başlangıç).
//   GET  → durum oku. İstemci sunucudaki ERKEN başlangıcı kopyalar;
//   uzatma yapılamaz, sunucu otoritesi asla yerelden geri alınmaz.
//   Supabase/tablo yoksa { serverTrial: false } ile zarif düşer —
//   istemci yerel davranışla devam eder (site bozulmaz).
// ════════════════════════════════════════════════════════

type Tier = "free" | "pro" | "elit";
const TRIAL_MS = 7 * 24 * 60 * 60 * 1000;

interface SessionUser { id: string; email: string; verified: boolean; isAdmin: boolean; tier?: Tier; exp: number }

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
  const secret = process.env.NUR_SESSION_SECRET || process.env.GOOGLE_CLIENT_SECRET || "";
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

// ─── Gömülü rate limit (Upstash varsa paylaşımlı, yoksa in-memory) ──
const __RL_MAP = new Map<string, number[]>();
const __RL_URL = (process.env.UPSTASH_REDIS_REST_URL || "").replace(/\/+$/, "");
const __RL_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || "";
const __RL_SHARED = __RL_URL.length > 0 && __RL_TOKEN.length > 0;
function __rlIp(req: VercelRequest): string {
  const forwarded = String(req.headers["cf-connecting-ip"] || req.headers["x-real-ip"] || String(req.headers["x-forwarded-for"] || "").split(",")[0] || "").trim();
  return forwarded || (req as unknown as { socket?: { remoteAddress?: string | null } }).socket?.remoteAddress || "unknown";
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
async function rateLimit(req: VercelRequest, res: VercelResponse, key: string, maxRequests: number, windowMs: number): Promise<boolean> {
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

function requireAllowedOrigin(req: VercelRequest, res: VercelResponse): boolean {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";
  const referer = typeof req.headers.referer === "string" ? req.headers.referer : "";
  const allowed = new Set(["https://nurstudyo.com", "https://www.nurstudyo.com", "http://localhost:5173", "http://localhost:5174"]);
  if (!origin && !referer) return true;
  if (origin && allowed.has(origin)) return true;
  if (referer) { try { if (allowed.has(new URL(referer).origin)) return true; } catch { /* bozuk referer */ } }
  res.status(403).json({ ok: false, error: "İzin verilmeyen istek kaynağı" });
  return false;
}

// ─── Gömülü Supabase ─────────────────────────────────────
function supabaseConfig() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim().replace(/^["']+|["']+$/g, "").replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) return null;
  return { url, key };
}

interface TrialRow { user_id: string; started_at: string; updated_at?: string }

async function trialOku(userId: string): Promise<TrialRow | null> {
  const sb = supabaseConfig();
  if (!sb) return null;
  try {
    const res = await fetch(`${sb.url}/rest/v1/nur_trials?user_id=eq.${encodeURIComponent(userId)}&select=user_id,started_at&limit=1`, {
      headers: { apikey: sb.key, Authorization: `Bearer ${sb.key}` }, cache: "no-store",
    });
    if (!res.ok) return null;
    const rows = await res.json() as TrialRow[];
    return rows[0] ?? null;
  } catch { return null; }
}

/** Kayıt yoksa oluşturur. startedAt taşınabilir: [şimdi-8gün, şimdi] aralığına kelepirlenir
 *  (mevcut kullanıcıların mevcut yerel denemesi kaybedilmesin diye BİR KEZ — sonrasında
 *  sunucu otoriterdir, istemciden başlangıç alınamaz). */
async function trialYaz(userId: string, istemciBaslangici: number | null): Promise<TrialRow | null> {
  const sb = supabaseConfig();
  if (!sb) return null;
  try {
    const simdi = Date.now();
    const altSinir = simdi - (TRIAL_MS + 24 * 60 * 60 * 1000); // 8 güne izin: 7 gün dolu + 1 gün tolerans
    const baslangic = istemciBaslangici && Number.isFinite(istemciBaslangici)
      ? Math.min(Math.max(istemciBaslangici, altSinir), simdi)
      : simdi;
    const res = await fetch(`${sb.url}/rest/v1/nur_trials?on_conflict=user_id`, {
      method: "POST",
      headers: { apikey: sb.key, Authorization: `Bearer ${sb.key}`, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({ user_id: userId, started_at: new Date(baslangic).toISOString(), updated_at: new Date().toISOString() }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const rows = await res.json() as TrialRow[];
    return rows[0] ?? null;
  } catch { return null; }
}

function durumDondur(res: VercelResponse, row: TrialRow | null, serverTrial: boolean): void {
  if (!serverTrial || !row) {
    res.status(200).json({ ok: true, serverTrial: false, fallback: "client" });
    return;
  }
  const start = Date.parse(row.started_at);
  const active = Number.isFinite(start) && Date.now() - start < TRIAL_MS;
  const daysLeft = active ? Math.ceil((start + TRIAL_MS - Date.now()) / 86400000) : 0;
  res.status(200).json({ ok: true, serverTrial: true, start: Number.isFinite(start) ? start : null, active, daysLeft });
}

async function handler(req: VercelRequest, res: VercelResponse): Promise<VercelResponse | undefined> {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }
  if (!requireAllowedOrigin(req, res)) return undefined;
  if (!(await rateLimit(req, res, req.method === "POST" ? "trial:post" : "trial:get", 12, 60_000))) return undefined;

  const user = getSessionUser(req);
  if (!user) return res.status(401).json({ ok: false, error: "Oturum gerekli" });
  if (user.isAdmin) return res.status(200).json({ ok: true, serverTrial: true, start: null, active: false, daysLeft: 0, admin: true });

  try {
    if (req.method === "POST") {
      const mevcut = await trialOku(user.id);
      if (mevcut) { durumDondur(res, mevcut, true); return undefined; }
      // İstemci başlangıcı: yalnız İLK kayıtta kabul edilir (mevcut kullanıcı göçü)
      let istemciBaslangici: number | null = null;
      try {
        const body = req.body as { startedAt?: unknown } | undefined;
        if (body && typeof body.startedAt === "number") istemciBaslangici = body.startedAt;
      } catch { /* gövde yok — şimdi başlar */ }
      const row = (await trialYaz(user.id, istemciBaslangici)) ?? (await trialOku(user.id));
      durumDondur(res, row, Boolean(row));
      return undefined;
    }
    // GET — yalnız oku (kayıt oluşturmaz; UI yerel kayıtla gösterir)
    const row = await trialOku(user.id);
    durumDondur(res, row, Boolean(row));
    return undefined;
  } catch (error) {
    await logServerError(req, error, "trial");
    // Site bozulmasın: istemci yerel davranışla devam eder
    return res.status(200).json({ ok: true, serverTrial: false, fallback: "client" });
  }
}

export default async function (req: VercelRequest, res: VercelResponse) {
  try {
    return await handler(req, res);
  } catch (error) {
    await logServerError(req, error, "trial");
    return res.status(200).json({ ok: true, serverTrial: false, fallback: "client" });
  }
}
