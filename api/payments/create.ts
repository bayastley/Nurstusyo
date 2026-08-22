import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import { getProduct, validateCheckout } from "../../src/payments/pricing";
import { requireAuth } from "../_shared/auth";
import { rateLimit } from "../_shared/rateLimit";
import { requireAllowedOrigin } from "../_shared/security";
import { createOrder } from "../_shared/supabase";

declare const process: { env: Record<string, string | undefined> };

// ─── iyzico HMAC-SHA256 İmza Oluşturucu ────────────────────────────────────
function createIyzicoSignature(secretKey: string, requestBody: string): string {
  const data = requestBody + secretKey;
  return crypto.createHmac("sha256", secretKey).update(data, "utf8").digest("base64");
}

function randomNonce(): string {
  return crypto.randomBytes(16).toString("hex");
}

async function createIyzicoCheckoutForm(params: {
  apiKey: string;
  secretKey: string;
  orderId: string;
  price: number;      // kuruş cinsinden (minor)
  currency: string;
  buyerEmail: string;
  buyerName: string;
  returnUrl: string;
  sandbox?: boolean;
}): Promise<{ ok: boolean; checkoutFormContent?: string; paymentPageUrl?: string; token?: string; error?: string }> {
  const baseUrl = params.sandbox
    ? "https://sandbox-api.iyzipay.com"
    : "https://api.iyzipay.com";
  const priceStr = (params.price / 100).toFixed(2);
  const requestPayload = {
    locale: "tr",
    conversationId: params.orderId,
    price: priceStr,
    paidPrice: priceStr,
    currency: params.currency || "TRY",
    basketId: params.orderId,
    paymentGroup: "PRODUCT",
    paymentCard: { cardUserKafka: "false" },
    buyer: {
      id: params.orderId.slice(0, 36),
      name: params.buyerName || "Kullanıcı",
      surname: ".",
      email: params.buyerEmail,
      identityNumber: "0",
      registrationAddress: "İnternet Kullanıcısı",
      city: "İstanbul",
      country: "Türkiye",
      ip: "0.0.0.0",
    },
    shippingAddress: {
      contactName: params.buyerName || "Kullanıcı",
      city: "İstanbul",
      country: "Türkiye",
      address: "İnternet Kullanıcısı",
    },
    billingAddress: {
      contactName: params.buyerName || "Kullanıcı",
      city: "İstanbul",
      country: "Türkiye",
      address: "İnternet Kullanıcısı",
    },
    callbackUrl: "https://nurstudyo.com/api/payments/webhook?provider=iyzico",
  };
  const jsonBody = JSON.stringify(requestPayload);
  const signature = createIyzicoSignature(params.secretKey, jsonBody);
  const nonce = randomNonce();
  try {
    const response = await fetch(`${baseUrl}/payment/iyzipos/checkoutform/auth/next`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `PIWS2 v1:${params.apiKey}:${signature}:${nonce}`,
      },
      body: jsonBody,
    });
    const result = await response.json() as any;
    if (result.status === "success") {
      return { ok: true, checkoutFormContent: result.checkoutFormContent, paymentPageUrl: result.paymentPageUrl, token: result.token };
    }
    return { ok: false, error: result.errorMessage || "iyzico ödeme formu oluşturulamadı" };
  } catch (err: any) {
    return { ok: false, error: `iyzico API hatası: ${err?.message || err}` };
  }
}

function isAllowedReturnUrl(raw: unknown): string {
  const fallback = "https://nurstudyo.com/odeme-sonuc";
  if (typeof raw !== "string" || raw.length > 300) return fallback;
  try {
    const u = new URL(raw);
    const allowed = new Set(["https://nurstudyo.com", "https://www.nurstudyo.com", "http://localhost:5173"]);
    if (!allowed.has(u.origin)) return fallback;
    return u.toString();
  } catch {
    return fallback;
  }
}

function sanitizeOrderUserId(userId: string): string {
  return userId.trim().replace(/[^a-zA-Z0-9._:@-]/g, "_").slice(0, 80);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  if (!requireAllowedOrigin(req, res)) return;
  if (!rateLimit(req, res, "payments:create", 8, 60_000)) return;

  try {
    const sessionUser = requireAuth(req, res);
    if (!sessionUser) return;

    const { productCode, returnUrl } = req.body || {};
    const check = validateCheckout({
      productCode: typeof productCode === "string" ? productCode : "",
      userId: sessionUser.id,
      email: sessionUser.email,
      returnUrl: typeof returnUrl === "string" ? returnUrl : undefined,
    });
    if (!check.ok) return res.status(400).json({ ok: false, error: (check as any).error });
    const product = getProduct(check.product.code)!;
    const safeUserId = sanitizeOrderUserId(sessionUser.id);
    const safeEmail = sessionUser.email;
    const safeReturnUrl = isAllowedReturnUrl(returnUrl);

    if (safeUserId.length < 3) {
      return res.status(400).json({ ok: false, error: "Kullanıcı kimliği geçersiz" });
    }

    const providerChoice = (process.env.PAYMENTS_PROVIDER || "iyzico").toLowerCase();
    const iyzicoApiKey = process.env.IYZICO_API_KEY || "";
    const iyzicoSecretKey = process.env.IYZICO_SECRET_KEY || "";

    const iyzicoReady = Boolean(iyzicoApiKey && iyzicoSecretKey);
    const useIyzico = providerChoice === "iyzico" && iyzicoReady;

    const orderId = `NUR-${product.code}-${safeUserId}-${Date.now()}`;
    const livePayments = process.env.VITE_PAYMENTS_LIVE === "true";

    if (!livePayments) {
      return res.status(200).json({
        ok: true,
        demo: true,
        message: "Ödeme DEMO modunda. VITE_PAYMENTS_LIVE=true yapılınca canlı POS açılır.",
        orderId,
        product,
      });
    }

    if (providerChoice !== "iyzico") {
      return res.status(400).json({ ok: false, error: "Bu projede yalnızca iyzico ödeme altyapısı aktiftir" });
    }

    const chosenProvider = "iyzico";

    await createOrder({
      orderId,
      userId: safeUserId,
      productCode: product.code,
      amountMinor: product.amountMinor,
      currency: product.currency,
      provider: chosenProvider,
    }).catch(() => undefined);

    if (useIyzico) {
      const userName = safeEmail.split("@")[0] || "Kullanıcı";
      const checkoutResult = await createIyzicoCheckoutForm({
        apiKey: iyzicoApiKey,
        secretKey: iyzicoSecretKey,
        orderId,
        price: product.amountMinor,
        currency: product.currency || "TRY",
        buyerEmail: safeEmail,
        buyerName: userName,
        returnUrl: safeReturnUrl,
        sandbox: process.env.IYZICO_SANDBOX === "true",
      });
      if (!checkoutResult.ok) {
        console.error("[Payments] iyzico checkout hatası:", checkoutResult.error);
        return res.status(500).json({ ok: false, error: checkoutResult.error || "iyzico ödeme formu oluşturulamadı" });
      }
      return res.status(200).json({
        ok: true,
        checkoutFormContent: checkoutResult.checkoutFormContent,
        paymentPageUrl: checkoutResult.paymentPageUrl,
        token: checkoutResult.token,
        orderId,
        product,
        returnUrl: safeReturnUrl,
      });
    }

    if (providerChoice === "iyzico" && !iyzicoReady) {
      return res.status(500).json({ ok: false, error: "PAYMENTS_PROVIDER=iyzico seçili ama iyzico anahtarları eksik" });
    }
    return res.status(500).json({ ok: false, error: "Canlı ödeme açık fakat POS anahtarları tanımlı değil" });
  } catch (error) {
    console.error("[Payments Create Error]", error);
    return res.status(500).json({ ok: false, error: "Ödeme servisi başlatılamadı" });
  }
}
