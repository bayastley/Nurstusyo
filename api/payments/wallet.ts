import crypto from 'crypto';


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

// Self-contained rate limit — _shared importları Vercel'de paketlenmediği için gömüldü
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


const COOKIE_NAME = 'nur_session';

function parseCookies(req: any): Record<string, string> {
  const header = req.headers.cookie || '';
  return header.split(';').reduce((acc: Record<string, string>, part) => {
    const [key, ...rest] = part.trim().split('=');
    if (!key) return acc;
    acc[key] = decodeURIComponent(rest.join('='));
    return acc;
  }, {});
}

function base64Url(input: Buffer | string): string {
  const raw = Buffer.isBuffer(input) ? input : Buffer.from(input, 'utf8');
  return raw.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(input: string): Buffer {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = normalized.length % 4 ? '='.repeat(4 - (normalized.length % 4)) : '';
  return Buffer.from(normalized + pad, 'base64');
}

function sessionSecret(): string {
  return process.env.NUR_SESSION_SECRET || '';
}

function signPayload(payload: string): string {
  return base64Url(crypto.createHmac('sha256', sessionSecret()).update(payload).digest());
}

function getUser(req: any): any | null {
  try {
    const token = parseCookies(req)[COOKIE_NAME];
    if (!token || !token.includes('.')) return null;
    const [payload, sig] = token.split('.');
    if (!payload || !sig) return null;
    const expected = signPayload(payload);
    const sigBuf = Buffer.from(sig);
    const expectedBuf = Buffer.from(expected);
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;
    const user = JSON.parse(fromBase64Url(payload).toString('utf8'));
    if (!user.exp || user.exp < Math.floor(Date.now() / 1000)) return null;
    return user;
  } catch { return null; }
}

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');

  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'GET only' });
  }
  // ★ Merkezi rate limit — cüzdan okuma flood'u/DB maliyeti koruması (dakikada 60)
  if (!(await rateLimit(req, res, 'wallet', 60, 60_000))) return;

  try {
    const user = getUser(req);
    if (!user) {
      return res.status(401).json({ ok: false, error: 'Giriş yapın' });
    }

    // ★ URL NORMALİZASYONU (fetch failed çözümü)
    const sbUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim().replace(/^["']+|["']+$/g, '').replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
    const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!sbUrl || !sbKey) {
      return res.status(200).json({ ok: true, wallet: { sub_jeton: 0, purchased_jeton: 0, kisa: 0, uzun: 0, tam: 0 } });
    }

    // Supabase'den cüzdanı çek — bağlantı hatasında bile 500 dönme,
    // sıfırlarla dön ki uygulama asla kilitlenmesin (log ile uyar).
    let wallet: any = { sub_jeton: 0, purchased_jeton: 0, purchased_kisa: 0, purchased_uzun: 0, purchased_tam: 0 };
    try {
      const walletRes = await fetch(
        `${sbUrl}/rest/v1/nur_video_rights?user_id=eq.${encodeURIComponent(user.id)}&select=video_kind,remaining`,
        {
          headers: {
            apikey: sbKey,
            Authorization: `Bearer ${sbKey}`,
          },
        }
      );
      if (walletRes.ok) {
        const rows = await walletRes.json() as Array<{ video_kind: string; remaining: number }>;
        for (const row of rows) {
          if (row.video_kind === "kisa") wallet.purchased_kisa = row.remaining;
          if (row.video_kind === "uzun") wallet.purchased_uzun = row.remaining;
          if (row.video_kind === "tam") wallet.purchased_tam = row.remaining;
        }
      } else {
        console.warn('[wallet] Supabase cevabı:', walletRes.status, await walletRes.text().catch(() => ''));
      }
    } catch (err: any) {
    await logServerError(req, err, "payments/wallet");
      console.warn('[wallet] Supabase bağlantı hatası (env kontrol et):', err?.message);
    }

    // purchased_jeton'u video türlerine çevir (basit mantık: hepsi kısa video)
    // Gerçek uygulamada purchased_jeton türüne göre ayrılabilir
    const purchasedJeton = wallet.purchased_jeton || 0;

    // Ayrı video hakları — DB'de purchased_kisa/uzun/tam varsa onları kullan
    const kisa = wallet.purchased_kisa ?? purchasedJeton;
    const uzun = wallet.purchased_uzun ?? 0;
    const tam = wallet.purchased_tam ?? 0;

    // ★ Abonelik bitiş tarihini çek
    let subscriptionEndsAt: string | null = null;
    try {
      const subRes = await fetch(
        `${sbUrl}/rest/v1/nur_subscriptions?user_id=eq.${encodeURIComponent(user.id)}&status=eq.active&order=ends_at.desc&limit=1&select=ends_at,tier`,
        { headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` } }
      );
      if (subRes.ok) {
        const subs = await subRes.json() as any[];
        if (subs?.[0]?.ends_at) subscriptionEndsAt = subs[0].ends_at;
      }
    } catch { /* ignore */ }

    console.log('[wallet] Kullanıcı:', user.id, 'Kısa:', kisa, 'Uzun:', uzun, 'Tam:', tam, 'Abonelik Bitiş:', subscriptionEndsAt);

    return res.status(200).json({
      ok: true,
      wallet: {
        sub_jeton: wallet.sub_jeton || 0,
        purchased_jeton: purchasedJeton,
        kisa,
        uzun,
        tam,
      },
      subscriptionEndsAt,
    });
  } catch (err: any) {
    await logServerError(req, err, "payments/wallet:5xx");
    console.error('[wallet] fatal:', err);
    // ★ Açık 7: iç hata detayı istemciye sızmaz — detay sunucu log'unda kalır.
    return res.status(500).json({ ok: false, error: "İşlem şimdi gerçekleştirilemiyor" });
  }
}
