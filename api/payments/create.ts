import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import { getProduct, validateCheckout } from "../../src/payments/pricing";
import { getSessionUser } from "../_shared/auth";
import { rateLimit } from "../_shared/rateLimit";
import { requireAllowedOrigin } from "../_shared/security";
import { createOrder } from "../_shared/supabase";

declare const process: { env: Record<string, string | undefined> };

// ═══════════════════════════════════════════════════════════════
// IYZICO HMAC-SHA256 İMZA
// ═══════════════════════════════════════════════════════════════
function createIyzicoSignature(secretKey: string, requestBody: string): string {
  return crypto
    .createHmac("sha256", secretKey)
    .update(requestBody + secretKey, "utf8")
    .digest("base64");
}

function randomNonce(): string {
  return crypto.randomBytes(16).toString("hex");
}

// ═══════════════════════════════════════════════════════════════
// IYZICO CHECKOUT FORM OLUŞTURMA
// ═══════════════════════════════════════════════════════════════
async function createIyzicoCheckoutForm(params: {
  apiKey: string;
  secretKey: string;
  orderId: string;
  price: number; // kuruş cinsinden
  currency: string;
  buyerEmail: string;
  buyerName: string;
  returnUrl: string;
  sandbox: boolean;
}): Promise<{
  ok: boolean;
  checkoutFormContent?: string;
  paymentPageUrl?: string;
  token?: string;
  error?: string;
}> {
  const baseUrl = params.sandbox
    ? "https://sandbox-api.iyzipay.com"
    : "https://api.iyzipay.com";

  const priceStr = (params.price / 100).toFixed(2);

  const requestPayload: Record<string, any> = {
    locale: "tr",
    conversationId: params.orderId,
    price: priceStr,
    paidPrice: priceStr,
    currency: params.currency || "TRY",
    basketId: params.orderId,
    paymentGroup: "PRODUCT",
    buyer: {
      id: params.orderId.slice(0, 36),
      name: params.buyerName || "Kullanıcı",
      surname: ".",
      email: params.buyerEmail,
      identityNumber: "11111111111",
      registrationAddress: "İnternet Kullanıcısı",
      city: "Istanbul",
      country: "Turkey",
      ip: "0.0.0.0",
    },
    shippingAddress: {
      contactName: params.buyerName || "Kullanıcı",
      city: "Istanbul",
      country: "Turkey",
      address: "İnternet Kullanıcısı",
    },
    billingAddress: {
      contactName: params.buyerName || "Kullanıcı",
      city: "Istanbul",
      country: "Turkey",
      address: "İnternet Kullanıcısı",
    },
    callbackUrl: "https://nurstudyo.com/api/payments/webhook?provider=iyzico",
  };

  const jsonBody = JSON.stringify(requestPayload);
  const signature = createIyzicoSignature(params.secretKey, jsonBody);
  const nonce = randomNonce();

  console.log("[iyzico] İstek gönderiliyor:", {
    url: `${baseUrl}/payment/iyzipos/checkoutform/auth/next`,
    sandbox: params.sandbox,
    orderId: params.orderId,
    price: priceStr,
    currency: params.currency,
  });

  try {
    const response = await fetch(
      `${baseUrl}/payment/iyzipos/checkoutform/auth/next`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `PIWS2 v1:${params.apiKey}:${signature}:${nonce}`,
        },
        body: jsonBody,
      }
    );

    const result = await response.json() as any;

    if (result.status === "success") {
      console.log("[iyzico] Checkout form başarılı, token:", result.token?.slice(0, 20) + "...");
      return {
        ok: true,
        checkoutFormContent: result.checkoutFormContent,
        paymentPageUrl: result.paymentPageUrl,
        token: result.token,
      };
    }

    console.error("[iyzico] Hata:", {
      status: result.status,
      errorCode: result.errorCode,
      errorMessage: result.errorMessage,
    });

    return {
      ok: false,
      error: result.errorMessage || `iyzico hatası: ${result.errorCode || "bilinmeyen"}`,
    };
  } catch (err: any) {
    console.error("[iyzico] API çağrısı başarısız:", err?.message);
    return {
      ok: false,
      error: `iyzico'ya bağlanılamadı: ${err?.message || "bilinmeyen hata"}`,
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// RETURN URL DOĞRULAMA
// ═══════════════════════════════════════════════════════════════
function isAllowedReturnUrl(raw: unknown): string {
  const fallback = "https://nurstudyo.com/odeme-sonuc";
  if (typeof raw !== "string" || raw.length > 300) return fallback;
  try {
    const u = new URL(raw);
    const allowed = new Set([
      "https://nurstudyo.com",
      "https://www.nurstudyo.com",
      "http://localhost:5173",
    ]);
    if (!allowed.has(u.origin)) return fallback;
    return u.toString();
  } catch {
    return fallback;
  }
}

function sanitizeUserId(userId: string): string {
  return userId
    .trim()
    .replace(/[^a-zA-Z0-9._:@-]/g, "_")
    .slice(0, 80);
}

// ═══════════════════════════════════════════════════════════════
// ANA HANDLER
// ═══════════════════════════════════════════════════════════════
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader("Cache-Control", "no-store");

  // Method kontrolü
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Sadece POST" });
  }

  // CORS
  if (!requireAllowedOrigin(req, res)) return;

  // Rate limit
  if (!rateLimit(req, res, "payments:create", 8, 60_000)) return;

  // Auth — HER ŞEY try-catch İÇİNDE
  try {
    const user = getSessionUser(req);
    if (!user) {
      console.log("[payments/create] Oturum bulunamadı");
      return res.status(401).json({
        ok: false,
        error: "Ödeme yapmak için lütfen Google ile giriş yapın",
      });
    }

    const { productCode, returnUrl } = (req.body || {}) as any;

    // Product doğrulama
    if (!productCode || typeof productCode !== "string") {
      return res.status(400).json({ ok: false, error: "productCode gerekli" });
    }
    const product = getProduct(productCode);
    if (!product) {
      return res
        .status(400)
        .json({ ok: false, error: `"${productCode}" geçersiz ürün kodu` });
    }

    const safeUserId = sanitizeUserId(user.id);
    const safeEmail = user.email;
    const safeReturnUrl = isAllowedReturnUrl(returnUrl);
    const orderId = `NUR-${product.code}-${safeUserId}-${Date.now()}`;

    console.log("[payments/create] İstek:", {
      user: safeEmail,
      product: product.code,
      orderId,
      livePayments: process.env.VITE_PAYMENTS_LIVE,
      sandbox: process.env.IYZICO_SANDBOX,
    });

    // ─── DEMO MOD ────────────────────────────────────────
    if (process.env.VITE_PAYMENTS_LIVE !== "true") {
      console.log("[payments/create] Demo mod — ödeme atlanıyor");
      return res.status(200).json({
        ok: true,
        demo: true,
        message: "DEMO: Ödeme atlandı",
        orderId,
        product,
      });
    }

    // ─── CANLI ÖDEME ─────────────────────────────────────
    const providerChoice = (
      process.env.PAYMENTS_PROVIDER || "iyzico"
    ).toLowerCase();
    const iyzicoApiKey = process.env.IYZICO_API_KEY || "";
    const iyzicoSecretKey = process.env.IYZICO_SECRET_KEY || "";
    const sandbox = process.env.IYZICO_SANDBOX === "true";

    // Provider kontrolü
    if (providerChoice !== "iyzico") {
      return res.status(400).json({
        ok: false,
        error: "Bu projede yalnızca iyzico ödeme altyapısı aktiftir",
      });
    }

    // Anahtar kontrolü
    if (!iyzicoApiKey || !iyzicoSecretKey) {
      console.error("[payments/create] iyzico anahtarları eksik");
      return res.status(500).json({
        ok: false,
        error: "IYZICO_API_KEY veya IYZICO_SECRET_KEY tanımlı değil",
      });
    }

    // Supabase'e sipariş kaydı (hata olsa bile devam)
    await createOrder({
      orderId,
      userId: safeUserId,
      productCode: product.code,
      amountMinor: product.amountMinor,
      currency: product.currency,
      provider: "iyzico",
    }).catch((err) =>
      console.warn("[payments/create] Supabase kayıt hatası (devam):", err?.message)
    );

    // iyzico checkout form
    const checkoutResult = await createIyzicoCheckoutForm({
      apiKey: iyzicoApiKey,
      secretKey: iyzicoSecretKey,
      orderId,
      price: product.amountMinor,
      currency: product.currency || "TRY",
      buyerEmail: safeEmail,
      buyerName: safeEmail.split("@")[0] || "Kullanıcı",
      returnUrl: safeReturnUrl,
      sandbox,
    });

    if (!checkoutResult.ok) {
      console.error("[payments/create] iyzico başarısız:", checkoutResult.error);
      return res.status(500).json({
        ok: false,
        error: checkoutResult.error,
      });
    }

    console.log("[payments/create] Başarılı, form içeriği gönderiliyor");
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
    console.error("[payments/create] Beklenmeyen hata:", err?.message, err?.stack);
    return res.status(500).json({
      ok: false,
      error: `Sunucu hatası: ${err?.message || "bilinmeyen"}`,
    });
  }
}
