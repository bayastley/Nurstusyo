import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

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
const buckets = new Map<string, number[]>();
function clientIp(req: VercelRequest): string {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0]?.trim();
  return forwarded || req.socket.remoteAddress || "unknown";
}
function rateLimit(req: VercelRequest, res: VercelResponse, key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const bucketKey = `${key}:${clientIp(req)}`;
  const bucket = buckets.get(bucketKey) ?? [];
  const active = bucket.filter((h) => h >= now - windowMs);
  if (active.length >= max) {
    res.setHeader("Retry-After", "60");
    res.status(429).json({ ok: false, error: "İstek işlenemedi" });
    buckets.set(bucketKey, active);
    return false;
  }
  active.push(now);
  buckets.set(bucketKey, active);
  return true;
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
        const colMap: Record<string, string> = { kisa: "purchased_kisa", uzun: "purchased_uzun", tam: "purchased_tam" };
        const colName = colMap[videoKind] || "purchased_kisa";
        const rows = (await sbRequest(`nur_wallets?user_id=eq.${encodeURIComponent(userId)}&select=*`)) as any[] | null;
        const existing = Array.isArray(rows) ? rows[0] : null;
        if (existing) {
          await sbRequest(`nur_wallets?user_id=eq.${encodeURIComponent(userId)}`, {
            method: "PATCH",
            headers: { Prefer: "return=minimal" },
            body: JSON.stringify({
              [colName]: (existing[colName] || 0) + videoCount,
              purchased_jeton: (existing.purchased_jeton || 0) + videoCount,
              updated_at: new Date().toISOString(),
            }),
          });
        } else {
          const newRow: Record<string, any> = { user_id: userId, sub_jeton: 0, purchased_jeton: videoCount, purchased_kisa: 0, purchased_uzun: 0, purchased_tam: 0 };
          newRow[colName] = videoCount;
          await sbRequest("nur_wallets", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(newRow) });
        }
      }
    }

    await sbRequest(`nur_orders?id=eq.${encodeURIComponent(orderId)}&status=eq.pending`, {
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
  if (!rateLimit(req, res, "payments:webhook", 120, 60_000)) return;

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
        await grantProductByOrder({ orderId, userId: order.user_id, productCode: order.product_code });
        console.log("[webhook] ✅ Ürün tanımlandı:", order.product_code);
      }
    }

    return res.status(200).json({ status: "success" });
  } catch (error) {
    console.error("[Webhook Error]", error);
    res.status(500).end("FAIL");
    return;
  }
}
