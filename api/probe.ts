// GECICI PROBE — push/send 500 kok nedeni (27.09, sonrasinda silinecek)
import type { VercelRequest, VercelResponse } from "@vercel/node";
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const adimlar: string[] = [];
  try {
    adimlar.push("1:basla");
    const wp = await import("web-push");
    adimlar.push("2:web-push-ok:" + typeof (wp.default?.setVapidDetails ?? (wp as any).setVapidDetails));
    const h = await import("./push/hadisler.js");
    adimlar.push("3:hadisler-ok:" + (h as any).HADIS_HAVUZU?.length);
    adimlar.push("4:vapid:" + (process.env.VAPID_PUBLIC_KEY ? "var" : "yok"));
    return res.status(200).json({ ok: true, adimlar });
  } catch (e: any) {
    return res.status(200).json({ ok: false, adimlar, hata: String(e?.message || e).slice(0, 200), stack: String(e?.stack || "").slice(0, 400) });
  }
}
