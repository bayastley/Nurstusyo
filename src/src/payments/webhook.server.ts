// ════════════════════════════════════════════════════════════════════════════════
// WEBHOOK.SERVER.TS — SUNUCU TARAFI (Node.js) hash/signature doğrulayıcıları
//
// ★ Bu dosya ASLA istemci bundle'ına girmez.
//   crypto (node built-in) ve process.env kullanır.
//   Sadece Express/Next.js API route'undan import edilir:
//     import { handleWebhook } from "@/payments/webhook.server";
//
// ★ GÜVENLİK KURALI:
// Ödeme şirketi (PayTR/iyzico) her başarılı ödeme sinyaliyle birlikte
// şifreli bir imza (Hash) gönderir. Bu imza, bizim SALT_KEY'imizle
// üretilmiş olmalıdır. Eşleşmiyorsa sinyal SAHTE kabul edilir,
// jeton/abonelik yüklenmez ve olay loglanır.
// ════════════════════════════════════════════════════════════════════════════════

import crypto from "crypto";
import { getProduct, PRODUCTS, type Product } from "./pricing";

// ─── Webhook Log Kaydı Arayüzü ───────────────────────────────────────────────
export interface WebhookLog {
  timestamp: string;
  provider: "paytr" | "iyzico";
  transactionId: string;
  verified: boolean;
  reason?: string;
  productCode?: string;
  userId?: string;
  amountMinor?: number;
}

// ─── PayTR Webhook Yükü Arayüzü ──────────────────────────────────────────────
export interface PayTRWebhookPayload {
  merchant_oid: string;
  status: string;
  total_amount: string;
  hash: string;
  [key: string]: string;
}

// ─── iyzico Webhook Yükü Arayüzü ─────────────────────────────────────────────
export interface IyzicoWebhookPayload {
  paymentId: string;
  status: string;
  price: string;
  iyziEventType: string;
  signature: string;
  [key: string]: string;
}

// ─── Webhook Doğrulama Sonucu Arayüzü ────────────────────────────────────────
export interface WebhookVerifyResult {
  ok: boolean;
  product?: Product;
  log: WebhookLog;
  error?: string;
}

const processedWebhookIds = new Map<string, number>();
const WEBHOOK_REPLAY_TTL_MS = 24 * 60 * 60 * 1000;

function cleanupProcessedWebhooks() {
  const cutoff = Date.now() - WEBHOOK_REPLAY_TTL_MS;
  for (const [key, at] of processedWebhookIds.entries()) {
    if (at < cutoff) processedWebhookIds.delete(key);
  }
}

function markOrDetectReplay(provider: "paytr" | "iyzico", transactionId: string): boolean {
  cleanupProcessedWebhooks();
  const key = `${provider}:${transactionId}`;
  if (processedWebhookIds.has(key)) return true;
  processedWebhookIds.set(key, Date.now());
  return false;
}

function safeTimingEqual(received: string, expected: string, encoding: BufferEncoding): boolean {
  try {
    const receivedBuf = Buffer.from(received ?? "", encoding);
    const expectedBuf = Buffer.from(expected, encoding);
    return receivedBuf.length === expectedBuf.length && crypto.timingSafeEqual(receivedBuf, expectedBuf);
  } catch {
    return false;
  }
}

function parseOrderRef(raw: string): { ok: true; productCode: string; userId: string; timestamp: string } | { ok: false; error: string } {
  if (typeof raw !== "string" || raw.length < 10 || raw.length > 128) {
    return { ok: false, error: "Sipariş numarası boş veya geçersiz uzunlukta" };
  }
  if (!raw.startsWith("NUR-")) return { ok: false, error: "Sipariş numarası NUR- öneki taşımıyor" };

  const productCodes = Object.keys(PRODUCTS).sort((a, b) => b.length - a.length);
  for (const code of productCodes) {
    const prefix = `NUR-${code}-`;
    if (!raw.startsWith(prefix)) continue;
    const rest = raw.slice(prefix.length);
    const parts = rest.split("-");
    if (parts.length < 2) return { ok: false, error: "Sipariş numarası kullanıcı/tarih bilgisi eksik" };
    const timestamp = parts[parts.length - 1];
    const userId = parts.slice(0, -1).join("-");
    if (!/^\d{10,13}$/.test(timestamp)) return { ok: false, error: "Sipariş zamanı geçersiz" };
    if (!/^[a-zA-Z0-9._:@-]{3,80}$/.test(userId)) return { ok: false, error: "Kullanıcı kimliği geçersiz formatta" };
    return { ok: true, productCode: code, userId, timestamp };
  }
  return { ok: false, error: "Sipariş numarasında bilinen ürün kodu yok" };
}

function invalidLog(provider: "paytr" | "iyzico", transactionId: string, reason: string, amountMinor?: number): WebhookVerifyResult {
  const log: WebhookLog = {
    timestamp: new Date().toISOString(),
    provider,
    transactionId,
    verified: false,
    reason,
    amountMinor,
  };
  logWebhookEvent(log);
  return { ok: false, log, error: reason };
}

// ════════════════════════════════════════════════════════════════════════════════
// ★ PAYTR WEBHOOK DOĞRULAYICI
//
// PayTR'nin resmi hash algoritması:
//   HASH = BASE64( HMAC-SHA256( merchant_oid + salt + status + total_amount,
//                               MERCHANT_SALT ) )
//
// Ortam değişkenleri (.env):
//   PAYTR_MERCHANT_KEY  — PayTR panelinden alınan Merchant Key
//   PAYTR_MERCHANT_SALT — PayTR panelinden alınan Merchant Salt
// ════════════════════════════════════════════════════════════════════════════════
export function verifyPayTRWebhook(payload: PayTRWebhookPayload): WebhookVerifyResult {
  if (!payload || typeof payload !== "object") {
    return invalidLog("paytr", "UNKNOWN", "PayTR payload nesnesi geçersiz");
  }

  if (typeof payload.merchant_oid !== "string" || typeof payload.status !== "string" || typeof payload.total_amount !== "string" || typeof payload.hash !== "string") {
    return invalidLog("paytr", payload.merchant_oid ?? "UNKNOWN", "PayTR payload alanları eksik veya geçersiz");
  }

  if (!/^\d+$/.test(payload.total_amount)) {
    return invalidLog("paytr", payload.merchant_oid, "PayTR total_amount sayısal değil");
  }

  if (!/^[A-Za-z0-9+/=]+$/.test(payload.hash)) {
    return invalidLog("paytr", payload.merchant_oid, "PayTR hash base64 formatında değil", Number(payload.total_amount) || undefined);
  }

  if (!["success", "failed"].includes(payload.status)) {
    return invalidLog("paytr", payload.merchant_oid, `PayTR status beklenmeyen değer: ${payload.status}`, Number(payload.total_amount) || undefined);
  }

  const parsedOrder = parseOrderRef(payload.merchant_oid);
  if (!parsedOrder.ok) {
    return invalidLog("paytr", payload.merchant_oid, (parsedOrder as any).error, Number(payload.total_amount) || undefined);
  }

  const merchantSalt = process.env.PAYTR_MERCHANT_SALT ?? "";
  const merchantKey = process.env.PAYTR_MERCHANT_KEY ?? "";

  if (!merchantSalt || !merchantKey) {
    const log: WebhookLog = {
      timestamp: new Date().toISOString(),
      provider: "paytr",
      transactionId: payload.merchant_oid ?? "UNKNOWN",
      verified: false,
      reason: "PAYTR_MERCHANT_KEY veya PAYTR_MERCHANT_SALT ortam değişkeni tanımlı değil — sistem yapılandırma hatası",
    };
    logWebhookEvent(log);
    return { ok: false, log, error: log.reason };
  }

  // PayTR callback formülü: merchant_oid + merchant_salt + status + total_amount, HMAC key = merchant_key
  const hashStr = payload.merchant_oid + merchantSalt + payload.status + payload.total_amount;
  const expectedHash = crypto.createHmac("sha256", merchantKey).update(hashStr).digest("base64");
  const hashesMatch = safeTimingEqual(payload.hash, expectedHash, "base64");

  if (!hashesMatch) {
    const log: WebhookLog = {
      timestamp: new Date().toISOString(),
      provider: "paytr",
      transactionId: payload.merchant_oid,
      verified: false,
      reason: "Hash uyuşmazlığı — sahte veya manipüle edilmiş webhook sinyali",
      amountMinor: Number(payload.total_amount) || undefined,
    };
    logWebhookEvent(log);
    return { ok: false, log, error: log.reason };
  }

  if (payload.status !== "success") {
    const log: WebhookLog = {
      timestamp: new Date().toISOString(),
      provider: "paytr",
      transactionId: payload.merchant_oid,
      verified: true,
      reason: `Ödeme başarısız — status: ${payload.status}`,
      amountMinor: Number(payload.total_amount) || undefined,
    };
    logWebhookEvent(log);
    return { ok: false, log, error: log.reason };
  }

  const productCode = parsedOrder.productCode;
  const userId = parsedOrder.userId;
  const product = getProduct(productCode);

  if (!product) {
    const log: WebhookLog = {
      timestamp: new Date().toISOString(),
      provider: "paytr",
      transactionId: payload.merchant_oid,
      verified: false,
      reason: `Bilinmeyen ürün kodu: "${productCode}" — jeton yüklenmedi`,
      userId,
      amountMinor: Number(payload.total_amount) || undefined,
    };
    logWebhookEvent(log);
    return { ok: false, log, error: log.reason };
  }

  const reportedAmount = Number(payload.total_amount);
  if (!Number.isSafeInteger(reportedAmount) || reportedAmount <= 0) {
    return invalidLog("paytr", payload.merchant_oid, "PayTR tutarı geçersiz", reportedAmount || undefined);
  }
  if (reportedAmount !== product.amountMinor) {
    const log: WebhookLog = {
      timestamp: new Date().toISOString(),
      provider: "paytr",
      transactionId: payload.merchant_oid,
      verified: false,
      reason: `Tutar uyuşmazlığı — beklenen: ${product.amountMinor} kuruş, gelen: ${reportedAmount} kuruş`,
      productCode,
      userId,
      amountMinor: reportedAmount,
    };
    logWebhookEvent(log);
    return { ok: false, log, error: log.reason };
  }

  if (markOrDetectReplay("paytr", payload.merchant_oid)) {
    const log: WebhookLog = {
      timestamp: new Date().toISOString(),
      provider: "paytr",
      transactionId: payload.merchant_oid,
      verified: true,
      reason: "Tekrarlanan webhook — idempotent olarak OK döndürüldü, ikinci kez yükleme yapılmaz",
      productCode,
      userId,
      amountMinor: reportedAmount,
    };
    logWebhookEvent(log);
    return { ok: true, product, log };
  }

  const log: WebhookLog = {
    timestamp: new Date().toISOString(),
    provider: "paytr",
    transactionId: payload.merchant_oid,
    verified: true,
    productCode,
    userId,
    amountMinor: reportedAmount,
  };
  logWebhookEvent(log);
  return { ok: true, product, log };
}

// ════════════════════════════════════════════════════════════════════════════════
// ★ İYZİCO WEBHOOK DOĞRULAYICI
//
// iyzico'nun resmi signature algoritması:
//   SIGNATURE = HEX( HMAC-SHA1( secretKey + iyziEventType + paymentId, secretKey ) )
//
// Ortam değişkenleri (.env):
//   IYZICO_API_KEY    — iyzico API anahtarı
//   IYZICO_SECRET_KEY — iyzico gizli anahtar
// ════════════════════════════════════════════════════════════════════════════════
export function verifyIyzicoWebhook(payload: IyzicoWebhookPayload): WebhookVerifyResult {
  if (!payload || typeof payload !== "object") {
    return invalidLog("iyzico", "UNKNOWN", "iyzico payload nesnesi geçersiz");
  }

  if (typeof payload.paymentId !== "string" || typeof payload.status !== "string" || typeof payload.price !== "string" || typeof payload.iyziEventType !== "string" || typeof payload.signature !== "string") {
    return invalidLog("iyzico", payload.paymentId ?? "UNKNOWN", "iyzico payload alanları eksik veya geçersiz");
  }

  if (!/^[0-9]+(\.[0-9]{1,2})?$/.test(payload.price)) {
    return invalidLog("iyzico", payload.paymentId, "iyzico price formatı geçersiz");
  }

  if (!/^[a-fA-F0-9]+$/.test(payload.signature) || payload.signature.length < 20) {
    return invalidLog("iyzico", payload.paymentId, "iyzico signature hex formatında değil");
  }

  const secretKey = process.env.IYZICO_SECRET_KEY ?? "";

  if (!secretKey) {
    const log: WebhookLog = {
      timestamp: new Date().toISOString(),
      provider: "iyzico",
      transactionId: payload.paymentId ?? "UNKNOWN",
      verified: false,
      reason: "IYZICO_SECRET_KEY ortam değişkeni tanımlı değil — sistem yapılandırma hatası",
    };
    logWebhookEvent(log);
    return { ok: false, log, error: log.reason };
  }

  const signatureStr = secretKey + payload.iyziEventType + payload.paymentId;
  const expectedSignature = crypto.createHmac("sha1", secretKey).update(signatureStr).digest("hex");
  const signaturesMatch = safeTimingEqual(payload.signature, expectedSignature, "hex");

  if (!signaturesMatch) {
    const log: WebhookLog = {
      timestamp: new Date().toISOString(),
      provider: "iyzico",
      transactionId: payload.paymentId,
      verified: false,
      reason: "Signature uyuşmazlığı — sahte veya manipüle edilmiş webhook sinyali",
    };
    logWebhookEvent(log);
    return { ok: false, log, error: log.reason };
  }

  if (payload.status !== "SUCCESS") {
    const log: WebhookLog = {
      timestamp: new Date().toISOString(),
      provider: "iyzico",
      transactionId: payload.paymentId,
      verified: true,
      reason: `Ödeme başarısız — status: ${payload.status}`,
    };
    logWebhookEvent(log);
    return { ok: false, log, error: log.reason };
  }

  const conversationId = payload.conversationId ?? "";
  const parsedOrder = parseOrderRef(conversationId);
  if (!parsedOrder.ok) {
    return invalidLog("iyzico", payload.paymentId, (parsedOrder as any).error);
  }
  const productCode = parsedOrder.productCode;
  const userId = parsedOrder.userId;
  const product = getProduct(productCode);

  if (!product) {
    const log: WebhookLog = {
      timestamp: new Date().toISOString(),
      provider: "iyzico",
      transactionId: payload.paymentId,
      verified: false,
      reason: `Bilinmeyen ürün kodu: "${productCode}" — jeton yüklenmedi`,
      userId,
    };
    logWebhookEvent(log);
    return { ok: false, log, error: log.reason };
  }

  const reportedAmountMinor = Math.round(parseFloat(payload.price) * 100);
  if (!Number.isSafeInteger(reportedAmountMinor) || reportedAmountMinor <= 0) {
    return invalidLog("iyzico", payload.paymentId, "iyzico tutarı geçersiz", reportedAmountMinor || undefined);
  }
  if (reportedAmountMinor !== product.amountMinor) {
    const log: WebhookLog = {
      timestamp: new Date().toISOString(),
      provider: "iyzico",
      transactionId: payload.paymentId,
      verified: false,
      reason: `Tutar uyuşmazlığı — beklenen: ${product.amountMinor} kuruş, gelen: ${reportedAmountMinor} kuruş`,
      productCode,
      userId,
      amountMinor: reportedAmountMinor,
    };
    logWebhookEvent(log);
    return { ok: false, log, error: log.reason };
  }

  if (markOrDetectReplay("iyzico", payload.paymentId)) {
    const log: WebhookLog = {
      timestamp: new Date().toISOString(),
      provider: "iyzico",
      transactionId: payload.paymentId,
      verified: true,
      reason: "Tekrarlanan webhook — idempotent olarak başarılı kabul edildi, ikinci kez yükleme yapılmaz",
      productCode,
      userId,
      amountMinor: reportedAmountMinor,
    };
    logWebhookEvent(log);
    return { ok: true, product, log };
  }

  const log: WebhookLog = {
    timestamp: new Date().toISOString(),
    provider: "iyzico",
    transactionId: payload.paymentId,
    verified: true,
    productCode,
    userId,
    amountMinor: reportedAmountMinor,
  };
  logWebhookEvent(log);
  return { ok: true, product, log };
}

// ════════════════════════════════════════════════════════════════════════════════
// ★ WEBHOOK OLAY LOGLAYICI
// Üretimde bu fonksiyon bir veritabanına veya log servisine yazmalıdır.
// ════════════════════════════════════════════════════════════════════════════════
export function logWebhookEvent(log: WebhookLog): void {
  const prefix = log.verified
    ? "[WEBHOOK ✓ ONAYLANDI]"
    : "[WEBHOOK ✗ REDDEDİLDİ — SAHTE/HATALI SİNYAL]";

  console.log(
    JSON.stringify(
      {
        event: prefix,
        timestamp: log.timestamp,
        provider: log.provider,
        transactionId: log.transactionId,
        verified: log.verified,
        productCode: log.productCode ?? null,
        userId: log.userId ?? null,
        amountMinor: log.amountMinor ?? null,
        reason: log.reason ?? null,
      },
      null,
      2
    )
  );

  // TODO (Üretim): DB'ye yaz, Slack'e alert gönder
  // await db.collection("webhook_logs").add(log);
}

// ════════════════════════════════════════════════════════════════════════════════
// ★ ANA WEBHOOK İŞLEYİCİSİ
// API route'undan (ör. /api/payments/webhook) bu fonksiyon çağrılır.
// ════════════════════════════════════════════════════════════════════════════════
export function handleWebhook(
  provider: "paytr" | "iyzico",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawPayload: any
): WebhookVerifyResult {
  if (!rawPayload || typeof rawPayload !== "object") {
    const log: WebhookLog = {
      timestamp: new Date().toISOString(),
      provider,
      transactionId: "UNKNOWN",
      verified: false,
      reason: "Boş veya geçersiz webhook payload'ı — istek reddedildi",
    };
    logWebhookEvent(log);
    return { ok: false, log, error: log.reason };
  }

  if (provider === "paytr") return verifyPayTRWebhook(rawPayload as PayTRWebhookPayload);
  if (provider === "iyzico") return verifyIyzicoWebhook(rawPayload as IyzicoWebhookPayload);

  const log: WebhookLog = {
    timestamp: new Date().toISOString(),
    provider,
    transactionId: "UNKNOWN",
    verified: false,
    reason: `Bilinmeyen ödeme sağlayıcısı: "${provider}"`,
  };
  logWebhookEvent(log);
  return { ok: false, log, error: log.reason };
}
