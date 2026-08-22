import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import { getProduct, validateCheckout } from "../../src/payments/pricing";
import { getSessionUser } from "../_shared/auth";
import { rateLimit } from "../_shared/rateLimit";
import { requireAllowedOrigin } from "../_shared/security";
import { createOrder } from "../_shared/supabase";

declare const process: { env: Record<string, string | undefined> };

function createIyzicoSignature(secretKey: string, requestBody: string): string {
  return crypto.createHmac("sha256", secretKey).update(requestBody + secretKey, "utf8").digest("base64");
}

function randomNonce(): string {
  return crypto.randomBytes(16).toString("hex");
}

async function createIyzicoCheckoutForm(params: {
  apiKey: string; secretKey: string; orderId: string; price: number;
  currency: string; buyerEmail: string; buyerName: string; returnUrl: string; sandbox?: boolean;
}): Promise<{ ok: boolean; checkoutFormContent?: string; paymentPageUrl?: string; token?: string; error?: string }> {
  const baseUrl = params.sandbox ? "https://sandbox-api.iyzipay.com" : "https://api.iyzipay.com";
  const priceStr = (params.price / 100).toFixed(2);
  const payload = {
    locale: "tr", conversationId: params.orderId, price: priceStr, paidPrice: priceStr,
    currency: params.currency || "TRY", basketId: params.orderId, paymentGroup: "PRODUCT",
    buyer: {
      id: params.orderId.slice(0, 36), name: params.buyerName || "Kullanıcı", surname: ".",
      email: params.buyerEmail, identityNumber: "11111111111",
      registrationAddress: "İnternet Kullanıcısı", city: "Istanbul", country: "Turkey", ip: "0.0.0.0",
    },
    shippingAddress: { contactName: params.buyerName || "Kullanıcı", city: "Istanbul", country: "Turkey", address: "İnternet Kullanıcısı" },
    billingAddress: { contactName: params.buyerName || "Kullanıcı", city: "Istanbul", country: "Turkey", address: "İnternet Kullanıcısı" },
    callbackUrl: "https://nurstudyo.com/api/payments/webhook?provider=iyzico",
  };
  const jsonBody = JSON.stringify(payload);
  const signature = createIyzicoSignature(params.secretKey, jsonBody);
  const response = await fetch(`${baseUrl}/payment/iyzipos/checkoutform/auth/next`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `PIWS2 v1:${params.apiKey}:${signature}:${randomNonce()}` },
    body: jsonBody,
  });
  const result = await response.json() as any;
  if (result.status === "success") {
    return { ok: true, checkoutFormContent: result.checkoutFormContent, paymentPageUrl: result.paymentPageUrl, token: result.token };
  }
  return { ok: false, error: result.errorMessage || `iyzico: ${result.errorCode || "bilinmeyen"}` };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  if (!requireAllowedOrigin(req, res)) return;
  if (!rateLimit(req, res, "payments:create", 8, 60_000)) return;

  try {
    // Auth
    const user = getSessionUser(req);
    if (!user) return res.status(401).json({ ok: false, error: "Giriş yapın" });

    const { productCode, returnUrl } = (req.body || {}) as any;
    if (!productCode || typeof productCode !== "string") return res.status(400).json({ ok: false, error: "productCode gerekli" });
    const product = getProduct(productCode);
    if (!product) return res.status(400).json({ ok: false, error: "Geçersiz ürün" });

    const safeUserId = user.id.trim().replace(/[^a-zA-Z0-9._:@-]/g, "_").slice(0, 80);
    const safeEmail = user.email;
    const orderId = `NUR-${product.code}-${safeUserId}-${Date.now()}`;

    // Demo mod
    if (process.env.VITE_PAYMENTS_LIVE !== "true") {
      return res.status(200).json({ ok: true, demo: true, orderId, product });
    }

    // Canlı ödeme
    const apiKey = process.env.IYZICO_API_KEY || "";
    const secretKey = process.env.IYZICO_SECRET_KEY || "";
    if (!apiKey || !secretKey) {
      return res.status(500).json({ ok: false, error: "IYZICO anahtarları eksik — Vercel env kontrol edin" });
    }

    // Supabase'e sipariş kaydı
    await createOrder({ orderId, userId: safeUserId, productCode: product.code, amountMinor: product.amountMinor, currency: product.currency, provider: "iyzico" }).catch(() => {});

    // iyzico checkout
    const result = await createIyzicoCheckoutForm({
      apiKey, secretKey, orderId, price: product.amountMinor, currency: product.currency || "TRY",
      buyerEmail: safeEmail, buyerName: safeEmail.split("@")[0] || "Kullanıcı",
      returnUrl: returnUrl || "https://nurstudyo.com/odeme-sonuc",
      sandbox: process.env.IYZICO_SANDBOX === "true",
    });

    if (!result.ok) return res.status(500).json({ ok: false, error: result.error });
    return res.status(200).json({ ok: true, checkoutFormContent: result.checkoutFormContent, paymentPageUrl: result.paymentPageUrl, token: result.token, orderId, product });

  } catch (err: any) {
    console.error("[payments/create]", err?.message || err);
    return res.status(500).json({ ok: false, error: err?.message || "Sunucu hatası" });
  }
}
