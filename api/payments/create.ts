import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getProduct, validateCheckout } from "../../src/payments/pricing";
import { requireAuth } from "../_shared/auth.ts";
import { rateLimit } from "../_shared/rateLimit.ts";
import { requireAllowedOrigin } from "../_shared/security.ts";
import { createOrder } from "../_shared/supabase.ts";

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
      return res.status(200).json({ ok: true, paymentUrl: `https://iyzi.co/checkout/${orderId}`, orderId, product, returnUrl: safeReturnUrl });
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
