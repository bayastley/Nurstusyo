// GECICI PROBE — push/send 500 kok nedeni bulmak icin (27.09)
import type { VercelRequest, VercelResponse } from "@vercel/node";
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const adimlar: string[] = [];
  try {
    adimlar.push("1:basla");
    const wp = await import("web-push");
    adimlar.push("2:web-push-ok:" + typeof (wp.default?.setVapidDetails ?? wp.setVapidDetails));
    const h = await import("../api/push/hadisler");
    adimlar.push("3:hadisler-ok:" + (h as any).HADIS_HAVUZU?.length);
    const k = process.env.VAPID_PUBLIC_KEY ? "var" : "yok";
    adimlar.push("4:vapid:" + k);
    return res.status(200).json({ ok: true, adimlar });
  } catch (e: any) {
    return res.status(200).json({ ok: false, adimlar, hata: String(e?.message || e).slice(0, 200), stack: String(e?.stack || "").slice(0, 400) });
  }
}
