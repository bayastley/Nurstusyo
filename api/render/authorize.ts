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
    await logServerError(req, error, "render/authorize"); /* log yazımı siteyi ASLA bozmaz */ }
}

declare const process: { env: Record<string, string | undefined> };

// ════════════════════════════════════════════════════════
// RENDER AUTHORIZE — SELF-CONTAINED
// (Vercel'de _shared importları çalışmıyor; bu yüzden
//  auth / rateLimit / security / supabase buraya inline edildi.)
//
// ★ İYZİCO UYUMU: Bakiye düşümü YOKTUR. Üretim izni iki kaynaktan gelir:
//   1) Üyelik seviyesinin günlük kotası  2) Satın alınmış paket hakkı
// ════════════════════════════════════════════════════════

type Tier = "free" | "pro" | "elit";
type VideoKind = "kisa" | "uzun" | "tam";

const MODE_TO_KIND: Record<string, VideoKind> = { short: "kisa", long: "uzun", full: "tam" };

const DAILY_QUOTA: Record<Tier, Record<VideoKind, number>> = {
  free: { kisa: 3, uzun: 0, tam: 0 },
  pro: { kisa: 8, uzun: 3, tam: 0 },
  elit: { kisa: 15, uzun: 5, tam: 1 },
};

// ★ HAFTALIK KOTA (07.10 — sahibin emri): istemci (tier.ts, HAFTALIK_KAT_SAYI=7)
//   haftalık toplam gösteriyor; sunucu artık aynı dönem sayar — RPC'ye KOTA × 7
//   gönderilir ve nur_daily_usage'taki hafta (Pazartesi NVIC) satırları toplanır.
//   NOT: parametre adı p_daily_quota RPC'de kalır (imza değişmez, deploy sıfır risk);
//   değer HAFTALIK TOPLAMDIR. admin/action.ts'taki kota sıfırlama davranışı korunur.
const HAFTALIK_KAT = 7;
const QUOTA_HAFTALIK: Record<Tier, Record<VideoKind, number>> = {
  free: { kisa: DAILY_QUOTA.free.kisa * HAFTALIK_KAT, uzun: 0, tam: 0 },
  pro: { kisa: DAILY_QUOTA.pro.kisa * HAFTALIK_KAT, uzun: DAILY_QUOTA.pro.uzun * HAFTALIK_KAT, tam: 0 },
  elit: { kisa: DAILY_QUOTA.elit.kisa * HAFTALIK_KAT, uzun: DAILY_QUOTA.elit.uzun * HAFTALIK_KAT, tam: DAILY_QUOTA.elit.tam * HAFTALIK_KAT },
};

const ALLOWED_FORMATS = new Set(["9:16", "1:1", "16:9", "4:5"]);

// ─── Inline session doğrulama ────────────────────────────
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

// ─── Inline rate limit ───────────────────────────────────
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
async function rateLimitSilent(req: { headers: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string | null } }, key: string, maxRequests: number, windowMs: number): Promise<boolean> {
  const bucketKey = `${key}:${__rlIp(req)}`;
  const hits = await __rlShared(bucketKey, windowMs);
  if (hits !== null) return hits <= maxRequests;
  return __rlMem(bucketKey, maxRequests, windowMs);
}
async function rateLimitBucket(bucketKey: string, maxRequests: number, windowMs: number): Promise<boolean> {
  const hits = await __rlShared(bucketKey, windowMs);
  if (hits !== null) return hits <= maxRequests;
  return __rlMem(bucketKey, maxRequests, windowMs);
}

function clientIp(req: VercelRequest): string {
  const forwarded = String(req.headers["cf-connecting-ip"] || req.headers["x-real-ip"] || String(req.headers["x-forwarded-for"] || "").split(",")[0] || "").trim();
  return forwarded || req.socket.remoteAddress || "unknown";
}

// ─── Inline origin kontrolü ──────────────────────────────
function requireAllowedOrigin(req: VercelRequest, res: VercelResponse): boolean {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";
  const referer = typeof req.headers.referer === "string" ? req.headers.referer : "";
  const allowed = new Set(["https://nurstudyo.com", "https://www.nurstudyo.com", "http://localhost:5173", "http://localhost:5174"]);
  if (!origin && !referer) return true;
  if (origin && allowed.has(origin)) return true;
  if (referer) {
    try { if (allowed.has(new URL(referer).origin)) return true; } catch { /* ignore */ }
  }
  res.status(403).json({ ok: false, error: "İzin verilmeyen istek kaynağı" });
  return false;
}

// ─── Inline Supabase (URL normalizasyonlu) ───────────────
function supabaseConfig() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim().replace(/^["']+|["']+$/g, "").replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) return null;
  return { url, key };
}

async function loadServerAccess(userId: string, userEmail?: string): Promise<{ tier: Tier; isAdmin: boolean; banned: boolean } | null> {
  const sb = supabaseConfig();
  if (!sb) return null;
  try {
    const userResponse = await fetch(
      `${sb.url}/rest/v1/nur_users?id=eq.${encodeURIComponent(userId)}&select=tier,is_admin`,
      { headers: { apikey: sb.key, Authorization: `Bearer ${sb.key}` }, cache: "no-store" }
    );
    if (!userResponse.ok) return null;
    const users = await userResponse.json() as Array<{ tier?: Tier; is_admin?: boolean }>;
    if (!users[0]) return null;

    // ★ KUL HAKKI KAPISI (05.10): tier "pro"/"elit" görünüyor olsa bile abonelik
    //   gerçekten aktif mi? Tek doğru kaynak nur_subscriptions.ends_at. Süresi
    //   dolmuşsa tier FREE'ye düşer — süresi biten kullanıcı üretim hakkını
    //   KAYBETMELİ, aksi halde ödemediği günlerin kotasını tüketmiş olur.
    //   (Self-healing: DB'de tier düşürülmez, burada türevsel uygulanır.)
    let tier: Tier = users[0].tier === "pro" || users[0].tier === "elit" ? users[0].tier : "free";
    if (tier !== "free") {
      try {
        const subRes = await fetch(
          `${sb.url}/rest/v1/nur_subscriptions?user_id=eq.${encodeURIComponent(userId)}&status=eq.active&order=ends_at.desc&limit=1&select=ends_at,tier`,
          { headers: { apikey: sb.key, Authorization: `Bearer ${sb.key}` }, cache: "no-store" }
        );
        if (subRes.ok) {
          const subs = await subRes.json() as Array<{ ends_at?: string }>;
          const endsAt = subs[0]?.ends_at ? Date.parse(subs[0].ends_at) : NaN;
          if (!Number.isFinite(endsAt) || endsAt <= Date.now()) {
            // Abonelik kaydı YOK veya süresi DOLMUŞ → free
            tier = "free";
          }
        }
        // subRes hatalıysa (5xx) tier olduğu gibi kalır — DB kesintisinde
        // mevcut ödemli kullanıcıyı cezalandırmamak için fail-open.
      } catch { /* sorgu patlarsa fail-open */ }
    }

    // ★ BAN KONTROLÜ DÜZELTMESİ (04.10, "banlama çalışmıyor"): eski sorgu yalnız
    //   user_id ile arıyordu — nur_users'ta kaydı olmayan (veya user_id'si null
    //   yazılmış) ban satırları üretimde HİÇ etki etmiyordu. Artık user_id VEYA
    //   email ile bakılır (api/auth/me.ts ile aynı or= kalıbı).
    const emailFiltre = userEmail ? `,user_email.eq.${encodeURIComponent(userEmail)}` : "";
    const banResponse = await fetch(
      `${sb.url}/rest/v1/nur_ban_logs?or=(user_id.eq.${encodeURIComponent(userId)}${emailFiltre})&unbanned=eq.false&select=id&limit=1`,
      { headers: { apikey: sb.key, Authorization: `Bearer ${sb.key}` }, cache: "no-store" }
    );
    if (!banResponse.ok) return null;
    const bans = await banResponse.json() as Array<{ id: string }>;

    // ★ SUNUCU TARAFI DENEME (02.10): nur_users.tier "free" ama nur_trials'ta
    //   aktif (7 gün içinde) deneme kaydı varsa kota hesabı PRO üzerinden yapılır.
    //   Böylece istemcideki localStorage denemesi bypass edilse bile sunucu
    //   gerçek deneme süresini DB'den bilir (tek otorite).
    if (tier === "free") {
      try {
        const trialRes = await fetch(
          `${sb.url}/rest/v1/nur_trials?user_id=eq.${encodeURIComponent(userId)}&select=started_at&limit=1`,
          { headers: { apikey: sb.key, Authorization: `Bearer ${sb.key}` }, cache: "no-store" }
        );
        if (trialRes.ok) {
          const trialRows = await trialRes.json() as Array<{ started_at?: string }>;
          const startedAt = trialRows[0]?.started_at ? Date.parse(trialRows[0].started_at) : NaN;
          if (Number.isFinite(startedAt) && Date.now() - startedAt < 7 * 24 * 60 * 60 * 1000) tier = "pro";
        }
      } catch { /* deneme tablosu yoksa/eski şemadaysa free davranışı */ }
    }

    return {
      tier,
      isAdmin: users[0].is_admin === true,
      banned: bans.length > 0,
    };
  } catch {
    return null;
  }
}

async function consumeVideo(userId: string, videoKind: string, dailyQuota: number) {
  const sb = supabaseConfig();
  if (!sb) return { ok: false, source: "none", quota_left: 0, pack_left: 0, error: "QUOTA_BACKEND_UNAVAILABLE" };
  try {
    const res = await fetch(`${sb.url}/rest/v1/rpc/nur_consume_video`, {
      method: "POST",
      headers: {
        apikey: sb.key,
        Authorization: `Bearer ${sb.key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_user_id: userId, p_video_kind: videoKind, p_daily_quota: dailyQuota }),
    });
    if (!res.ok) return { ok: false, source: "none", quota_left: 0, pack_left: 0, error: "QUOTA_BACKEND_UNAVAILABLE" };
    const rows = await res.json() as Array<{ ok: boolean; source: string; quota_left: number; pack_left: number; error: string | null }>;
    return rows[0] ?? { ok: false, source: "none", quota_left: 0, pack_left: 0, error: "QUOTA_ERROR" };
  } catch {
    return { ok: false, source: "none", quota_left: 0, pack_left: 0, error: "QUOTA_BACKEND_UNAVAILABLE" };
  }
}

// ─── Ana handler ─────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  if (!requireAllowedOrigin(req, res)) return;
  if (!(await rateLimit(req, res, "render:authorize", 10, 60_000))) return;

  const user = getSessionUser(req);
  if (!user) return res.status(401).json({ ok: false, error: "Oturum gerekli" });

  const access = await loadServerAccess(user.id, user.email);
  if (!access) return res.status(503).json({ ok: false, error: "Yetki servisi kullanılamıyor" });
  if (access.banned) return res.status(403).json({ ok: false, error: "Bu hesap kullanıma kapatılmış" });

  const { mode, formats } = req.body || {};

  if (typeof mode !== "string" || !MODE_TO_KIND[mode]) {
    return res.status(400).json({ ok: false, error: "Geçersiz süre modu" });
  }

  if (!Array.isArray(formats) || formats.length < 1 || formats.length > 4) {
    return res.status(400).json({ ok: false, error: "Geçersiz format listesi" });
  }

  const uniqueFormats = Array.from(new Set(formats));
  if (uniqueFormats.some((format) => typeof format !== "string" || !ALLOWED_FORMATS.has(format))) {
    return res.status(400).json({ ok: false, error: "Bilinmeyen video formatı" });
  }

  const kind = MODE_TO_KIND[mode];
  const tier: Tier = access.isAdmin ? "elit" : access.tier;
  const quota = QUOTA_HAFTALIK[tier][kind];

  // Admin üretimleri sınırsızdır; kota/hak tablolarına dokunulmaz.
  if (access.isAdmin) {
    return res.status(200).json({
      ok: true, unlimited: true, userId: user.id, kind, mode,
      formats: uniqueFormats, source: "admin", quotaLeft: null, packLeft: null,
    });
  }

  const backendEnabled = process.env.NUR_QUOTA_BACKEND_ENABLED === "true";

  if (!backendEnabled && (process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production")) {
    return res.status(503).json({ ok: false, error: "Üretim kota servisi yapılandırılmamış" });
  }

  if (backendEnabled) {
    const results: Awaited<ReturnType<typeof consumeVideo>>[] = [];
    for (let i = 0; i < uniqueFormats.length; i += 1) {
      const spent = await consumeVideo(user.id, kind, quota);
      if (!spent.ok) {
        const status = spent.error === "QUOTA_BACKEND_UNAVAILABLE" ? 503 : 402;
        return res.status(status).json({
          ok: false,
          error: spent.error === "NO_RIGHTS_LEFT"
            ? "Bu haftalık üretim hakkınız doldu. Paket alarak devam edebilirsiniz."
            : "Üretim izni alınamadı",
          kind,
        });
      }
      results.push(spent);
    }

    const last = results[results.length - 1];
    return res.status(200).json({
      ok: true,
      userId: user.id,
      kind,
      mode,
      formats: uniqueFormats,
      source: last.source,
      quotaLeft: last.quota_left,
      packLeft: last.pack_left,
    });
  }

  return res.status(503).json({ ok: false, error: "Üretim kota servisi yapılandırılmamış" });
}
