import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleWebhook } from "../../src/payments/webhook.server";
import { rateLimit } from "../_shared/rateLimit";
import { getOrder, grantProductToUser } from "../_shared/supabase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  if (!rateLimit(req, res, "payments:webhook", 120, 60_000)) return;

  try {
    const queryProvider = typeof req.query.provider === "string" ? req.query.provider : "";
    const provider = queryProvider === "paytr" || queryProvider === "iyzico" ? queryProvider : req.body?.paymentId ? "iyzico" : "paytr";

    if (queryProvider && queryProvider !== "paytr" && queryProvider !== "iyzico") {
      return res.status(400).send("FAIL");
    }

    const result = handleWebhook(provider, req.body);

    if (!result.ok) {
      console.warn("[Webhook Fraud/Invalid]", result.error, result.log);
      return res.status(400).send("FAIL");
    }

    console.log("[Webhook Verified]", result.product?.title, result.log);

    const orderId = provider === "paytr" ? String(req.body?.merchant_oid ?? "") : String(req.body?.conversationId ?? "");

    if (orderId.startsWith("NUR-")) {
      try {
        const order = await getOrder(orderId);
        if (order && order.status === "paid") {
          console.log("[Webhook Idempotent] Order zaten paid:", orderId);
        } else if (order && result.product) {
          await grantProductToUser({
            orderId,
            userId: order.user_id,
            grantTier: result.product.grantTier,
            grantDays: result.product.grantDays,
            grantTokens: result.product.grantTokens,
          });
          console.log("[Webhook Granted]", orderId, result.product.code);
        } else if (!order) {
          const fallbackUserId = result.log.userId;
          if (fallbackUserId && result.product) {
            await grantProductToUser({
              orderId,
              userId: fallbackUserId,
              grantTier: result.product.grantTier,
              grantDays: result.product.grantDays,
              grantTokens: result.product.grantTokens,
            }).catch(() => undefined);
          }
        }
      } catch (grantError) {
        console.error("[Webhook Grant Error]", grantError);
      }
    }

    if (provider === "paytr") return res.status(200).send("OK");
    return res.status(200).json({ status: "success", result });
  } catch (error) {
    console.error("[Webhook Error]", error);
    return res.status(500).send("FAIL");
  }
}
