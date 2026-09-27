import crypto from "crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";


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


type Kind = "kisa" | "uzun" | "tam";

function userFromSession(req: VercelRequest): { id: string } | null {
  try {
    const token = String(req.headers.cookie || "").split(";").map((x) => x.trim())
      .find((x) => x.startsWith("nur_session="))?.slice("nur_session=".length);
    const [payload, signature] = decodeURIComponent(token || "").split(".");
    const secret = process.env.NUR_SESSION_SECRET || process.env.GOOGLE_CLIENT_SECRET || "";
    if (!payload || !signature || secret.length < 20) return null;
    const expected = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
    if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
    const user = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { id?: string; exp?: number };
    return user.id && (user.exp || 0) >= Math.floor(Date.now() / 1000) ? { id: user.id } : null;
  } catch { return null; }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  // ★ Merkezi rate limit — hediye claim flood'u Supabase RPC'yi yormasın (dakikada 20)
  if (!(await rateLimit(req, res, "rewards:claim", 20, 60_000))) return;
  const user = userFromSession(req);
  if (!user) return res.status(401).json({ ok: false, error: "Oturum gerekli" });
  const body = (req.body || {}) as { eventKey?: string; kind?: Kind };
  const eventKey = String(body.eventKey || "");
  const kind = body.kind;
  // ★ GÜVENLİK: miktar İSTEMCİDEN ALINMAZ. Sunucu, olay türüne göre miktarı
  //   kendisi belirler — aksi halde kullanıcı amount göndererek hediye kotasını
  //   50 katına çıkarabilir. (Cuma=1 kısa; diğer manevi günler=1 kısa.)
  if (!/^(cuma|kandil|kadir|bayram|ramazan)-\d{4}-\d{2}-\d{2}$/.test(eventKey) ||
      !["kisa", "uzun", "tam"].includes(String(kind))) {
    return res.status(400).json({ ok: false, error: "Geçersiz hediye" });
  }
  const amount = 1; // ★ sabit: miktar İSTEMCİDEN GEÇMEZ (önceki sürümde body'den alınıyordu)
  const match = eventKey.match(/^([a-z]+)-(\d{4}-\d{2}-\d{2})$/);
  const eventType = match?.[1] || "";
  const dateText = match?.[2] || "";
  const eventDate = new Date(`${dateText}T12:00:00Z`);
  if (!Number.isFinite(eventDate.getTime())) return res.status(400).json({ ok: false, error: "Geçersiz tarih" });
  // ★ GÜVENLİK (Açık 1): Tüm olay türleri için tarih PENCERESİ sunucuda zorlanır.
  //   Önceden yalnızca cuma için gün kontrolü vardı; saldırgan kandil-2020-01-01 gibi
  //   geçmiş her tarih için tek istekte paket hakkı toplayabiliyordu.
  //   Kural: olay tarihi bugünden eski olamaz; geleceğe de en fazla 1 gün pay tanınır.
  const nowUtc = Date.now();
  if (eventDate.getTime() < nowUtc - 24 * 3600_000) {
    return res.status(400).json({ ok: false, error: "Geçmiş tarihli hediye alınamaz" });
  }
  if (eventDate.getTime() > nowUtc + 36 * 3600_000) {
    return res.status(400).json({ ok: false, error: "Gelecek tarihli hediye alınamaz" });
  }
  if (eventType === "cuma" && eventDate.getUTCDay() !== 5) {
    return res.status(400).json({ ok: false, error: "Cuma hediyesi yalnızca Cuma günü alınabilir" });
  }
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) return res.status(503).json({ ok: false, error: "Hediye servisi kullanılamıyor" });

  // ★ Kullanıcının nur_users tablosunda olduğundan emin ol (foreign key hatasını önlemek için)
  try {
    const userCheckRes = await fetch(`${url}/rest/v1/nur_users?id=eq.${encodeURIComponent(user.id)}&select=id`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    const existingUser = userCheckRes.ok ? await userCheckRes.json().catch(() => []) : [];
    if (!Array.isArray(existingUser) || existingUser.length === 0) {
      await fetch(`${url}/rest/v1/nur_users`, {
        method: "POST",
        headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({
          id: user.id,
          email: user.id.includes("@") ? user.id : user.id + "@nurstudyo.com",
          tier: "free",
          created_at: new Date().toISOString(),
        }),
      });
      console.log(`[claim] 🆕 Yeni kullanıcı nur_users tablosuna 'free' olarak eklendi: ${user.id}`);
    }
  } catch (err: any) {
    await logServerError(req, err, "rewards/claim");
    console.error("[claim] User existence check error:", err?.message);
  }

  const response = await fetch(`${url}/rest/v1/rpc/nur_claim_video_reward`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_user_id: user.id, p_reward_key: eventKey, p_video_kind: kind, p_amount: amount }),
  });
  if (!response.ok) return res.status(503).json({ ok: false, error: "Hediye servisi kullanılamıyor" });
  const row = ((await response.json()) as Array<{ ok: boolean; remaining: number; error: string | null }>)[0];
  if (!row?.ok) return res.status(409).json({ ok: false, error: row?.error || "ALREADY_CLAIMED" });
  return res.status(200).json({ ok: true, remaining: row.remaining });
}
