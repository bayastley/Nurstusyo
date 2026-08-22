import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

declare const process: { env: Record<string, string | undefined> };

// ═══════════════════════════════════════════════════════════════
// ÜRÜN KATALOĞU — Sunucu tarafı, bağımsız
// ═══════════════════════════════════════════════════════════════
interface ServerProduct {
  code: string;
  kind: "subscription" | "package";
  title: string;
  amountMinor: number;
  currency: string;
  tier?: string;
  videoKind?: string;
  videoCount?: number;
  grantDays?: number;
  active: boolean;
}

const PRODUCTS: Record<string, ServerProduct> = {
  SUB_PRO_1M: { code: "SUB_PRO_1M", kind: "subscription", title: "Pro Aylık Üyelik", amountMinor: 14900, currency: "TRY", tier: "pro", grantDays: 30, active: true },
  SUB_ELIT_1M: { code: "SUB_ELIT_1M", kind: "subscription", title: "Elit Aylık Üyelik", amountMinor: 29900, currency: "TRY", tier: "elit", grantDays: 30, active: true },
  SUB_PRO_1Y: { code: "SUB_PRO_1Y", kind: "subscription", title: "Pro Yıllık Üyelik", amountMinor: 119900, currency: "TRY", tier: "pro", grantDays: 365, active: true },
  SUB_ELIT_1Y: { code: "SUB_ELIT_1Y", kind: "subscription", title: "Elit Yıllık Üyelik", amountMinor: 239900, currency: "TRY", tier: "elit", grantDays: 365, active: true },
  PK_KISA_15: { code: "PK_KISA_15", kind: "package", title: "15 Kısa Video Üretim Hizmeti", amountMinor: 5900, currency: "TRY", videoKind: "kisa", videoCount: 15, active: true },
  PK_KISA_35: { code: "PK_KISA_35", kind: "package", title: "35 Kısa Video Üretim Hizmeti", amountMinor: 9900, currency: "TRY", videoKind: "kisa", videoCount: 35, active: true },
  PK_KISA_70: { code: "PK_KISA_70", kind: "package", title: "70 Kısa Video Üretim Hizmeti", amountMinor: 15900, currency: "TRY", videoKind: "kisa", videoCount: 70, active: true },
  PK_UZUN_8: { code: "PK_UZUN_8", kind: "package", title: "8 Uzun Video Üretim Hizmeti", amountMinor: 7900, currency: "TRY", videoKind: "uzun", videoCount: 8, active: true },
  PK_UZUN_20: { code: "PK_UZUN_20", kind: "package", title: "20 Uzun Video Üretim Hizmeti", amountMinor: 14900, currency: "TRY", videoKind: "uzun", videoCount: 20, active: true },
  PK_UZUN_40: { code: "PK_UZUN_40", kind: "package", title: "40 Uzun Video Üretim Hizmeti", amountMinor: 24900, currency: "TRY", videoKind: "uzun", videoCount: 40, active: true },
  PK_TAM_2: { code: "PK_TAM_2", kind: "package", title: "2 Tam Sürüm Video Üretim Hizmeti", amountMinor: 3900, currency: "TRY", videoKind: "tam", videoCount: 2, active: true },
  PK_TAM_5: { code: "PK_TAM_5", kind: "package", title: "5 Tam Sürüm Video Üretim Hizmeti", amountMinor: 8900, currency: "TRY", videoKind: "tam", videoCount: 5, active: true },
  PK_TAM_10: { code: "PK_TAM_10", kind: "package", title: "10 Tam Sürüm Video Üretim Hizmeti", amountMinor: 15900, currency: "TRY", videoKind: "tam", videoCount: 10, active: true },
};

function getServerProduct(code: string): ServerProduct | null {
  const p = PRODUCTS[code];
  if (!p || !p.active) return null;
  return p;
}
// ═══════════════════════════════════════════════════════════════
// SESSION COOKIE OKUMA
// ═══════════════════════════════════════════════════════════════
const COOKIE_NAME = "nur_session";

function parseCookies(req: VercelRequest): Record<string, string> {
  const header = req.headers.cookie || "";
  return header.split(";").reduce<Record<string, string>>((acc, part) => {
    const [key, ...rest] = part.trim().split("=");
    if (!key) return acc;
    acc[key] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
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

function sessionSecret(): string {
  const secret = process.env.NUR_SESSION_SECRET || process.env.GOOGLE_CLIENT_SECRET || "";
  if (!secret || secret.length < 20) throw new Error("Session secret tanımlı değil");
  return secret;
}

function signPayload(payload: string): string {
  return base64Url(crypto.createHmac("sha256", sessionSecret()).update(payload).digest());
}

interface AuthUser {
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

function getSessionUser(req: VercelRequest): AuthUser | null {
  try {
    const token = parseCookies(req)[COOKIE_NAME];
    if (!token || !token.includes(".")) return null;
    const [payload, sig] = token.split(".");
    if (!payload || !sig) return null;
    const expected = signPayload(payload);
    const sigBuf = Buffer.from(sig);
    const expectedBuf = Buffer.from(expected);
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;
    const user = JSON.parse(fromBase64Url(payload).toString("utf8")) as AuthUser;
    if (!user.exp || user.exp < Math.floor(Date.now() / 1000)) return null;
    if (!user.email || !user.id || !user.sub || user.verified !== true) return null;
    return user;
  } catch {
    return null;
  }
}
// ═══════════════════════════════════════════════════════════════
// IYZICO HMAC-SHA256 İMZA & FORMU
// ═══════════════════════════════════════════════════════════════
function createIyzicoSignature(secretKey: string, requestBody: string): string {
  return crypto.createHmac("sha256", secretKey).update(requestBody, "utf8").digest("base64");
}

function randomNonce(): string {
  return crypto.randomBytes(16).toString("hex");
}

async function createIyzicoCheckoutForm(params: {
  apiKey: string;
  secretKey: string;
  orderId: string;
  price: number;
  currency: string;
  buyerEmail: string;
  buyerName: string;
  returnUrl: string;
  sandbox: boolean;
  clientIp?: string;
}): Promise<{
  ok: boolean;
  checkoutFormContent?: string;
  paymentPageUrl?: string;
  token?: string;
  error?: string;
}> {
  const baseUrl = params.sandbox ? "https://iyzipay.com" : "https://iyzipay.com";
  const endpoint = "/payment/iyzipos/checkoutform/initialize";
  const priceStr = (params.price / 100).toFixed(2);

  const nameParts = (params.buyerName || "Kullanici").split(/[.@+_-]/);
  const buyerSurname = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "Kullanici";
  const clientIp = params.clientIp || "85.110.0.1";

  const convId = `conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const basketId = `bask-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const buyerCleanId = (params.buyerEmail?.split("@")[0] || "user").slice(0, 36);

  const requestPayload: Record<string, any> = {
    locale: "tr",
    conversationId: convId,
    price: priceStr,
    paidPrice: priceStr,
    currency: params.currency || "TRY",
    basketId: basketId,
    paymentGroup: "PRODUCT",
    callbackUrl: params.returnUrl,
    buyer: {
      id: buyerCleanId,
      name: (params.buyerName || "Kullanici").slice(0, 30),
      surname: buyerSurname.slice(0, 30),
      email: params.buyerEmail || "test@nurstudyo.com",
      identityNumber: "10000000146",
      registrationAddress: "Istanbul",
      city: "Istanbul",
      country: "Turkey",
      ip: clientIp,
    },
    shippingAddress: { contactName: (params.buyerName || "Kullanici").slice(0, 36), city: "Istanbul", country: "Turkey", address: "Istanbul" },
    billingAddress: { contactName: (params.buyerName || "Kullanici").slice(0, 36), city: "Istanbul", country: "Turkey", address: "Istanbul" },
    basketItems: [
      {
        id: params.orderId,
        name: "Nûr Stüdyo Dijital Hizmet",
        category1: "Video Altyapı",
        itemType: "VIRTUAL",
        price: priceStr,
      },
    ],
  };

  const jsonBody = JSON.stringify(requestPayload);
  const signature = createIyzicoSignature(params.secretKey, jsonBody);
  const nonce = randomNonce();

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `PIWS2 v1:${params.apiKey}:${signature}:${nonce}`,
      },
      body: jsonBody,
    });

    const result = await response.json() as any;

    if (result.status === "success") {
      return {
        ok: true,
        checkoutFormContent: result.checkoutFormContent,
        paymentPageUrl: result.paymentPageUrl,
        token: result.token,
      };
    }
    return { ok: false, error: result.errorMessage || `iyzico hatası: ${result.errorCode || "bilinmeyen"}` };
  } catch (err: any) {
    return { ok: false, error: `iyzico'ya bağlanılamadı: ${err?.message || "bilinmeyen hata"}` };
  }
}
// ═══════════════════════════════════════════════════════════════
// URL DOĞRULAMA & SUPABASE KAYIT
// ═══════════════════════════════════════════════════════════════
function isAllowedReturnUrl(raw: unknown): string {
  const fallback = "https://nurstudyo.com";
  if (typeof raw !== "string" || raw.length > 300) return fallback;
  try {
    const u = new URL(raw);
    const allowed = new Set(["https://nurstudyo.com", "https://nurstudyo.com", "http://localhost:5173", "http://localhost:5174"]);
    if (!allowed.has(u.origin)) return fallback;
    return u.toString();
  } catch {
    return fallback;
  }
}

function sanitizeUserId(userId: string): string {
  return userId.trim().replace(/[^a-zA-Z0-9._:@-]/g, "_").slice(0, 80);
}

async function saveOrder(data: { orderId: string; userId: string; productCode: string; amountMinor: number; currency: string }) {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) return;
  try {
    await fetch(`${url}/rest/v1/nur_orders`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        id: data.orderId,
        user_id: data.userId,
        product_code: data.productCode,
        amount_minor: data.amountMinor,
        currency: data.currency,
        provider: "iyzico",
        status: "pending",
        created_at: new Date().toISOString(),
      }),
    });
  } catch (err: any) {
    console.warn("[payments/create] Supabase kayıt hatası:", err?.message);
  }
}
// ═══════════════════════════════════════════════════════════════
// ANA HANDLER
// ═══════════════════════════════════════════════════════════════
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";
  const referer = typeof req.headers.referer === "string" ? req.headers.referer : "";
  const allowedOrigins = ["https://nurstudyo.com", "https://nurstudyo.com", "http://localhost:5173", "http://localhost:5174"];
  
  if (origin && !allowedOrigins.includes(origin) && referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      if (!allowedOrigins.includes(refererOrigin)) {
        return res.status(403).json({ ok: false, error: "İzin verilmeyen kaynak" });
      }
    } catch { /* ignore */ }
  }

  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Sadece POST" });

  try {
    let user: AuthUser | null = null;
    try { user = getSessionUser(req); } catch (authErr: any) { console.error(authErr); }

    if (!user) return res.status(401).json({ ok: false, error: "Ödeme yapmak için lütfen giriş yapın" });

    let body: any = {};
    try {
      body = req.body || {};
      if (typeof body === "string") body = JSON.parse(body);
    } catch { return res.status(400).json({ ok: false, error: "Geçersiz istek gövdesi" }); }

    const { productCode, returnUrl } = body;
    if (!productCode || typeof productCode !== "string") return res.status(400).json({ ok: false, error: "productCode gerekli" });
    
    const product = getServerProduct(productCode);
    if (!product) return res.status(400).json({ ok: false, error: `"${productCode}" geçersiz ürün kodu` });

    const safeUserId = sanitizeUserId(user.id);
    const safeEmail = user.email;
    const safeReturnUrl = isAllowedReturnUrl(returnUrl);
    
    const shortHash = crypto.createHash("md5").update(safeUserId + Date.now()).digest("hex").slice(0, 12);
    const orderId = `NUR-${shortHash}`;

    if (process.env.VITE_PAYMENTS_LIVE !== "true") {
      return res.status(200).json({ ok: true, demo: true, message: "DEMO: Ödeme atlandı", orderId, product });
    }

    const iyzicoApiKey = process.env.IYZICO_API_KEY || "";
    const iyzicoSecretKey = process.env.IYZICO_SECRET_KEY || "";
    const sandbox = process.env.IYZICO_SANDBOX === "true";

    if (!iyzicoApiKey || !iyzicoSecretKey) {
      return res.status(500).json({ ok: false, error: "iyzico anahtarları eksik" });
    }

    await saveOrder({ orderId, userId: safeUserId, productCode: product.code, amountMinor: product.amountMinor, currency: product.currency });

    const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0]?.trim();
    const clientIp = forwarded || "85.110.0.1";

    const checkoutResult = await createIyzicoCheckoutForm({
      apiKey: iyzicoApiKey,
      secretKey: iyzicoSecretKey,
      orderId,
      price: product.amountMinor,
      currency: product.currency || "TRY",
      buyerEmail: safeEmail,
      buyerName: safeEmail.split("@")[0] || "Kullanici",
      returnUrl: safeReturnUrl,
      sandbox,
      clientIp,
    });

    if (!checkoutResult.ok) return res.status(500).json({ ok: false, error: checkoutResult.error });

    return res.status(200).json({
      ok: true,
      checkoutFormContent: checkoutResult.checkoutFormContent,
      paymentPageUrl: checkoutResult.paymentPageUrl,
      token: checkoutResult.token,
      orderId,
      product,
      returnUrl: safeReturnUrl,
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: `Sunucu hatası: ${err?.message || "bilinmeyen"}` });
  }
}
