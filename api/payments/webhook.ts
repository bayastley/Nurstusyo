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

declare const process: { env: Record<string, string | undefined> };

// ════════════════════════════════════════════════════════
// IYZICO WEBHOOK — SELF-CONTAINED
// (Vercel'de _shared importları ve src/ importları çalışmıyor
//  → ERR_MODULE_NOT_FOUND. Bu yüzden hepsi burada inline.)
// ════════════════════════════════════════════════════════

// ─── İyzico imza doğrulama ───────────────────────────────
// SIGNATURE = HEX( HMAC-SHA1( secretKey + iyziEventType + paymentId, secretKey ) )
function verifyIyzicoSignature(payload: { iyziEventType?: string; paymentId?: string; signature?: string }): boolean {
  const secretKey = process.env.IYZICO_SECRET_KEY || "";
  const eventType = String(payload.iyziEventType || "");
  const paymentId = String(payload.paymentId || "");
  const signature = String(payload.signature || "");
  if (!secretKey || !eventType || !paymentId || !signature) return false;
  if (!/^[a-fA-F0-9]+$/.test(signature)) return false;
  const expected = crypto.createHmac("sha1", secretKey).update(secretKey + eventType + paymentId).digest("hex");
  try {
    const a = Buffer.from(signature, "hex");
    const b = Buffer.from(expected, "hex");
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
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

// ─── Inline Supabase (URL normalizasyonlu) ───────────────
function supabaseConfig() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim().replace(/^["']+|["']+$/g, "").replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) return null;
  return { url, key };
}

async function sbRequest(path: string, init: RequestInit = {}): Promise<any> {
  const sb = supabaseConfig();
  if (!sb) return null;
  const res = await fetch(`${sb.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: sb.key,
      Authorization: `Bearer ${sb.key}`,
      "Content-Type": "application/json",
      ...((init.headers as Record<string, string>) || {}),
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text || `Supabase ${res.status}`);
  return text ? JSON.parse(text) : null;
}

/**
 * ★ Ürün tanımlama: paket ise video hakkı (nur_video_rights veya
 *   nur_wallets purchased_*), abonelik ise tier + subscription kaydeder.
 */
async function grantProductByOrder(order: any): Promise<void> {
  const { orderId, userId, productCode } = order;
  try {
    const isPro = productCode.includes("PRO") && !productCode.includes("ELIT");
    const isElit = productCode.includes("ELIT");
    const isYearly = productCode.includes("_1Y");
    const isPackage = productCode.startsWith("PK_");

    if (isPro || isElit) {
      const tier = isElit ? "elit" : "pro";
      const days = isYearly ? 365 : 30;
      const endsAt = new Date(Date.now() + days * 86400000).toISOString();
      // Kullanıcı var mı?
      const existing = await sbRequest(`nur_users?id=eq.${encodeURIComponent(userId)}&select=id`);
      if (!Array.isArray(existing) || existing.length === 0) {
        await sbRequest("nur_users", {
          method: "POST",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({ id: userId, email: userId.includes("@") ? userId : userId + "@nurstudyo.com", tier }),
        });
      } else {
        await sbRequest(`nur_users?id=eq.${encodeURIComponent(userId)}`, {
          method: "PATCH",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({ tier, updated_at: new Date().toISOString() }),
        });
      }
      await sbRequest("nur_subscriptions", {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ user_id: userId, tier, provider: "iyzico", starts_at: new Date().toISOString(), ends_at: endsAt, status: "active" }),
      });
    }

    if (isPackage) {
      const match = productCode.match(/PK_(KISA|UZUN|TAM)_(\d+)/);
      if (match) {
        const videoKind = match[1].toLowerCase();
        const videoCount = parseInt(match[2]);

        // Kullanıcı var mı?
        const existing = await sbRequest(`nur_users?id=eq.${encodeURIComponent(userId)}&select=id`);
        if (!Array.isArray(existing) || existing.length === 0) {
          await sbRequest("nur_users", {
            method: "POST",
            headers: { Prefer: "return=minimal" },
            body: JSON.stringify({
              id: userId,
              email: userId.includes("@") ? userId : userId + "@nurstudyo.com",
              tier: "free",
              created_at: new Date().toISOString(),
            }),
          });
          console.log(`[webhook] 🆕 Paket satın alan yeni kullanıcı nur_users tablosuna 'free' olarak eklendi: ${userId}`);
        }

        await sbRequest("rpc/nur_grant_video_rights", {
          method: "POST",
          body: JSON.stringify({ p_user_id: userId, p_video_kind: videoKind, p_amount: videoCount }),
        });
      }
    }

    await sbRequest(`nur_orders?id=eq.${encodeURIComponent(orderId)}&status=eq.processing`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ status: "paid", paid_at: new Date().toISOString(), updated_at: new Date().toISOString() }),
    });
  } catch (err: any) {
    console.error("[webhook] grantProduct hatası:", err?.message);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  if (!(await rateLimit(req, res, "payments:webhook", 120, 60_000))) return;

  try {
    const provider = String(req.query.provider || "");
    if (provider && provider !== "iyzico") {
      res.status(400).end("FAIL");
      return;
    }

    const body = (req.body || {}) as Record<string, any>;
    const isIyzico = Boolean(body.paymentId);

    if (!isIyzico) {
      res.status(400).end("FAIL");
      return;
    }

    if (body.status !== "SUCCESS") {
      console.warn("[webhook] Ödeme başarısız:", body.status);
      res.status(400).end("FAIL");
      return;
    }

    // İmza doğrula
    if (!verifyIyzicoSignature(body)) {
      console.warn("[webhook] İmza uyuşmazlığı — SAHTE sinyal, reddedildi");
      res.status(400).end("FAIL");
      return;
    }

    const orderId = String(body.conversationId || "");

    if (orderId.startsWith("NUR-")) {
      const orders = (await sbRequest(`nur_orders?id=eq.${encodeURIComponent(orderId)}&select=*`)) as any[] | null;
      const order = Array.isArray(orders) ? orders[0] : null;
      if (!order) {
        console.error("[webhook] Sipariş bulunamadı:", orderId);
        res.status(400).end("FAIL");
        return;
      }
      if (order.status === "paid") {
        console.log("[webhook] Sipariş zaten paid, idempotent OK");
      } else {
        const locked = await sbRequest(`nur_orders?id=eq.${encodeURIComponent(orderId)}&status=eq.pending`, {
          method: "PATCH",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify({ status: "processing", updated_at: new Date().toISOString() }),
        });

        if (!Array.isArray(locked) || locked.length === 0) {
          console.log("[webhook] Sipariş başka bir istek tarafından işleniyor");
        } else {
          await grantProductByOrder({ orderId, userId: order.user_id, productCode: order.product_code });
          console.log("[webhook] ✅ Ürün tanımlandı:", order.product_code);
        }
      }
    }

    return res.status(200).json({ status: "success" });
  } catch (error) {
    await logServerError(req, error, "api/payments/webhook");
    console.error("[Webhook Error]", error);
    res.status(500).end("FAIL");
    return;
  }
}
