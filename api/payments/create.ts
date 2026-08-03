import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import { getProduct, validateCheckout } from "../../src/payments/pricing";
import { requireAuth } from "../_shared/auth";
import { rateLimit } from "../_shared/rateLimit";
import { requireAllowedOrigin } from "../_shared/security";
import { createOrder } from "../_shared/supabase";

function normalizeIp(req: VercelRequest): string {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0]?.trim();
  return forwarded || req.socket.remoteAddress || "127.0.0.1";
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
    if (!check.ok) return res.status(400).json({ ok: false, error: check.error });
    const product = getProduct(check.product.code)!;
    const safeUserId = sanitizeOrderUserId(sessionUser.id);
    const safeEmail = sessionUser.email;
    const safeReturnUrl = isAllowedReturnUrl(returnUrl);

    if (safeUserId.length < 3) {
      return res.status(400).json({ ok: false, error: "Kullanıcı kimliği geçersiz" });
    }

    const providerChoice = (process.env.PAYMENTS_PROVIDER || "auto").toLowerCase();
    const paytrMerchantId = process.env.PAYTR_MERCHANT_ID || "";
    const paytrMerchantKey = process.env.PAYTR_MERCHANT_KEY || "";
    const paytrMerchantSalt = process.env.PAYTR_MERCHANT_SALT || "";
    const iyzicoApiKey = process.env.IYZICO_API_KEY || "";
    const iyzicoSecretKey = process.env.IYZICO_SECRET_KEY || "";

    const paytrReady = Boolean(paytrMerchantId && paytrMerchantKey && paytrMerchantSalt);
    const iyzicoReady = Boolean(iyzicoApiKey && iyzicoSecretKey);
    const usePaytr = providerChoice === "paytr" ? paytrReady : providerChoice === "iyzico" ? false : paytrReady;
    const useIyzico = !usePaytr && (providerChoice === "iyzico" ? iyzicoReady : iyzicoReady);

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

    const chosenProvider = usePaytr ? "paytr" : "iyzico";

    await createOrder({
      orderId,
      userId: safeUserId,
      productCode: product.code,
      amountMinor: product.amountMinor,
      currency: product.currency,
      provider: chosenProvider,
    }).catch(() => undefined);

    if (usePaytr) {
      const userIp = normalizeIp(req);
      const basket = Buffer.from(JSON.stringify([[product.title, (product.amountMinor / 100).toFixed(2), 1]])).toString("base64");
      const hashStr = `${paytrMerchantId}${userIp}${orderId}${safeEmail}${product.amountMinor}${basket}000TRYno3d0`;
      const paytrToken = crypto.createHmac("sha256", paytrMerchantKey).update(hashStr + paytrMerchantSalt).digest("base64");

      return res.status(200).json({ ok: true, token: paytrToken, paymentUrl: `https://www.paytr.com/iframe/${paytrToken}`, orderId, product });
    }

    if (useIyzico) {
      return res.status(200).json({ ok: true, paymentUrl: `https://iyzi.co/checkout/${orderId}`, orderId, product, returnUrl: safeReturnUrl });
    }

    if (providerChoice === "paytr" && !paytrReady) {
      return res.status(500).json({ ok: false, error: "PAYMENTS_PROVIDER=paytr seçili ama PayTR anahtarları eksik" });
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
