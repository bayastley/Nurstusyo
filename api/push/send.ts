import type { VercelRequest, VercelResponse } from "@vercel/node";
import webpush from "web-push";

declare const process: { env: Record<string, string | undefined> };

// ════════════════════════════════════════════════════════
// PUSH SEND — Öğüt Vakti günlük gönderim (Vercel Cron)
// Günlük 4 kez çağrılır: 08:00, 12:00, 16:00, 20:00 (TR saati)
// Kural: gece 23:00 - 05:00 arası HİÇ gönderim yapılmaz.
// Koruma: CRON_SECRET header'ı (Authorization: Bearer ...)
// ════════════════════════════════════════════════════════

function supabaseConfig() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) return null;
  return { url, key };
}

async function aboneleriGetir(cfg: { url: string; key: string }, limit: number, offset: number) {
  const res = await fetch(`${cfg.url}/rest/v1/nur_push_subscriptions?select=endpoint,p256dh,auth&order=created_at.desc&limit=${limit}&offset=${offset}`, {
    headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}` },
  });
  if (!res.ok) throw new Error(`abone sorgusu ${res.status}`);
  return (await res.json()) as Array<{ endpoint: string; p256dh: string; auth: string }>;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  // Sadece cron ve GET
  if (req.method !== "GET" && req.method !== "POST") return res.status(405).json({ ok: false, error: "Method Not Allowed" });

  // CRON_SECRET koruması — Vercel cron otomatik Authorization başlığı ekler
  const secret = process.env.CRON_SECRET || "";
  if (secret) {
    const auth = String(req.headers.authorization || "");
    if (auth !== `Bearer ${secret}`) return res.status(401).json({ ok: false, error: "Yetkisiz" });
  }

  const cfg = supabaseConfig();
  if (!cfg) return res.status(503).json({ ok: false, error: "Veritabanı yapılandırılmamış" });

  const publicKey = process.env.VAPID_PUBLIC_KEY || "";
  const privateKey = process.env.VAPID_PRIVATE_KEY || "";
  if (!publicKey || !privateKey) return res.status(503).json({ ok: false, error: "VAPID anahtarları eksik" });

  // ★ GECE SUSTURMA: Türkiye saatiyle 23:00-05:00 arası asla gönderme
  const trSaat = Number(new Intl.DateTimeFormat("tr-TR", { hour: "numeric", hour12: false, timeZone: "Europe/Istanbul" }).format(new Date()));
  if (trSaat >= 23 || trSaat < 5) {
    return res.status(200).json({ ok: true, skipped: true, reason: "gece susturma", trSaat });
  }

  // Günün saate uygun hadisi (sunucu TR saatine göre tema seçer)
  const { gununHadisi, saateGoreHadis } = await import("./hadisler");
  const hadis = trSaat >= 5 && trSaat < 23 ? saateGoreHadis(trSaat) : gununHadisi();
  const bildirim = {
    title: `🌙 Öğüt Vakti · ${hadis.kaynak.split(",")[0]}`,
    body: `"${hadis.metin}" — ${hadis.kaynak}`,
    tag: `ogut-${hadis.id}-${new Date().toISOString().slice(0, 10)}`,
  };

  webpush.setVapidDetails("mailto:admin@nurstudyo.com", publicKey, privateKey);

  // Sayfa sayfa gönder (serverless zaman aşımına takılmadan)
  const SAYFA = 500;
  let gonderildi = 0, silinen = 0, hatali = 0;
  for (let offset = 0; offset < 20_000; offset += SAYFA) {
    let aboneler: Array<{ endpoint: string; p256dh: string; auth: string }> = [];
    try { aboneler = await aboneleriGetir(cfg, SAYFA, offset); } catch { break; }
    if (!aboneler.length) break;

    await Promise.allSettled(aboneler.map(async (abone) => {
      try {
        await webpush.sendNotification({ endpoint: abone.endpoint, keys: { p256dh: abone.p256dh, auth: abone.auth } },
          JSON.stringify(bildirim), { TTL: 3600 });
        gonderildi++;
      } catch (e: any) {
        const kod = e?.statusCode;
        // 404/410 = abonelik ölmüş → veritabanından sil
        if (kod === 404 || kod === 410) {
          await fetch(`${cfg.url}/rest/v1/nur_push_subscriptions?endpoint=eq.${encodeURIComponent(abone.endpoint)}`, {
            method: "DELETE", headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}` },
          }).catch(() => null);
          silinen++;
        } else hatali++;
      }
    }));

    if (aboneler.length < SAYFA) break;
  }

  return res.status(200).json({ ok: true, trSaat, gonderildi, silinen, hatali, hadis: hadis.id });
}
