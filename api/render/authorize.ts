import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "../_shared/auth";
import { rateLimit } from "../_shared/rateLimit";
import { requireAllowedOrigin } from "../_shared/security";
import { consumeVideo } from "../_shared/supabase";

declare const process: { env: Record<string, string | undefined> };

// ════════════════════════════════════════════════════════
// RENDER AUTHORIZE
//
// ★ İYZİCO UYUMU:
//   Bakiye düşümü YOKTUR. Üretim izni iki kaynaktan gelir:
//     1) Üyelik seviyesinin günlük kotası
//     2) Satın alınmış tek seferlik paket hakkı
// ════════════════════════════════════════════════════════

type Tier = "free" | "pro" | "elit";
type VideoKind = "kisa" | "uzun" | "tam";

/** Süre modu → video türü */
const MODE_TO_KIND: Record<string, VideoKind> = {
  short: "kisa",
  long: "uzun",
  full: "tam",
};

/** Üyelik seviyesine göre günlük kota */
const DAILY_QUOTA: Record<Tier, Record<VideoKind, number>> = {
  free: { kisa: 3, uzun: 0, tam: 0 },
  pro: { kisa: 8, uzun: 3, tam: 0 },
  elit: { kisa: 15, uzun: 5, tam: 1 },
};

const ALLOWED_FORMATS = new Set(["9:16", "1:1", "16:9", "4:5"]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  if (!requireAllowedOrigin(req, res)) return;
  if (!rateLimit(req, res, "render:authorize", 10, 60_000)) return;

  const user = requireAuth(req, res);
  if (!user) return;

  const { mode, formats } = req.body || {};

  if (typeof mode !== "string" || !MODE_TO_KIND[mode]) {
    return res.status(400).json({ ok: false, error: "Geçersiz süre modu" });
  }

  if (!Array.isArray(formats) || formats.length < 1 || formats.length > 4) {
    return res.status(400).json({ ok: false, error: "Geçersiz format listesi" });
  }

  const uniqueFormats = Array.from(new Set(formats));
  if (uniqueFormats.some((format) => typeof format !== "string" || !ALLOWED_FORMATS.has(format))) {
    return res.status(400).json({ ok: false, error: "Bilinmeyen video formatı" });
  }

  const kind = MODE_TO_KIND[mode];
  const tier: Tier = (user as { tier?: Tier }).tier ?? "free";
  const quota = DAILY_QUOTA[tier][kind];

  // Bu üyelik bu türü hiç üretemiyorsa (ve paketi de yoksa) erken uyar
  const backendEnabled = process.env.NUR_QUOTA_BACKEND_ENABLED === "true";
  const livePayments = process.env.VITE_PAYMENTS_LIVE === "true";

  if (livePayments && !backendEnabled) {
    return res.status(503).json({
      ok: false,
      error: "Canlı üretim için sunucu tarafı kota servisi henüz etkin değil",
    });
  }

  if (backendEnabled) {
    // Her format ayrı bir üretim sayılır
    const results = [];
    for (let i = 0; i < uniqueFormats.length; i += 1) {
      const spent = await consumeVideo(user.id, kind, quota);
      if (!spent.ok) {
        return res.status(402).json({
          ok: false,
          error:
            spent.error === "NO_RIGHTS_LEFT"
              ? "Bugünkü üretim hakkınız doldu. Paket alarak devam edebilirsiniz."
              : "Üretim izni alınamadı",
          kind,
        });
      }
      results.push(spent);
    }

    const last = results[results.length - 1];
    return res.status(200).json({
      ok: true,
      userId: user.id,
      kind,
      mode,
      formats: uniqueFormats,
      source: last.source,
      quotaLeft: last.quota_left,
      packLeft: last.pack_left,
    });
  }

  // Demo mod: istemci tarafındaki kota takibi geçerli
  return res.status(200).json({
    ok: true,
    demo: true,
    userId: user.id,
    kind,
    mode,
    formats: uniqueFormats,
    dailyQuota: quota,
  });
}
