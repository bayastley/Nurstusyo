import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import webpush from "web-push";


// ─── Server error logger (gömülü — _shared Vercel'de paketlenmiyor) ───
async function logServerError(req: { url?: string; headers: Record<string, string | string[] | undefined> }, error: unknown, endpoint: string): Promise<void> {
  try {
    const __url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim().replace(/\/$/, "");
    const __key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    if (!__url || !__key) return;
    const __msg = error instanceof Error ? error.message : String(error || "Bilinmeyen sunucu hatası");
    if (!__msg) return;
    const __stack = error instanceof Error ? (error.stack || "") : "";
    const __path = String(req.url || endpoint).slice(0, 200);
    const __fingerprint = require("crypto").createHash("sha256").update(__msg + "|" + __path).digest("hex").slice(0, 16);
    await fetch(__url + "/rest/v1/nur_error_logs", {
      method: "POST",
      headers: { apikey: __key, Authorization: "Bearer " + __key, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        message: __msg.slice(0, 500),
        stack: __stack.slice(0, 4000),
        path: __path,
        source: ("server:" + endpoint).slice(0, 40),
        user_agent: String(req.headers["user-agent"] || "server").slice(0, 300),
        fingerprint: __fingerprint,
        kind: "genel",
        user_email: "",
      }),
    });
  } catch { /* log yazımı siteyi ASLA bozmaz */ }
}

// Self-contained rate limit — _shared importları Vercel'de paketlenmediği için gömüldü
const __buckets = new Map<string, { hits: number[] }>();
function rateLimit(req: { headers: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string } }, res: { setHeader: (k: string, v: string) => void; status: (n: number) => { json: (o: unknown) => void } }, key: string, maxRequests: number, windowMs: number): boolean {
  const forwarded = String(req.headers["cf-connecting-ip"] || req.headers["x-real-ip"] || String(req.headers["x-forwarded-for"] || "").split(",")[0] || "").trim();
  const ip = forwarded || req.socket?.remoteAddress || "unknown";
  const bucketKey = `${key}:${ip}`;
  const now = Date.now();
  const bucket = __buckets.get(bucketKey) ?? { hits: [] };
  const cutoff = now - windowMs;
  bucket.hits = bucket.hits.filter((hit) => hit >= cutoff);
  if (bucket.hits.length >= maxRequests) {
    res.setHeader("Retry-After", "60");
    res.setHeader("Cache-Control", "no-store");
    res.status(429).json({ ok: false, error: "İstek işlenemedi" });
    __buckets.set(bucketKey, bucket);
    return false;
  }
  bucket.hits.push(now);
  __buckets.set(bucketKey, bucket);
  return true;
}
function rateLimitSilent(req: { headers: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string } }, key: string, maxRequests: number, windowMs: number): boolean {
  const forwarded = String(req.headers["cf-connecting-ip"] || req.headers["x-real-ip"] || String(req.headers["x-forwarded-for"] || "").split(",")[0] || "").trim();
  const ip = forwarded || req.socket?.remoteAddress || "unknown";
  const bucketKey = `${key}:${ip}`;
  const now = Date.now();
  const bucket = __buckets.get(bucketKey) ?? { hits: [] };
  const cutoff = now - windowMs;
  bucket.hits = bucket.hits.filter((hit) => hit >= cutoff);
  if (bucket.hits.length >= maxRequests) { __buckets.set(bucketKey, bucket); return false; }
  bucket.hits.push(now);
  __buckets.set(bucketKey, bucket);
  return true;
}

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

// ★ Bakım bildirimi bekleyen aboneler (notify_maintenance=true)
async function bakimAboneleriGetir(cfg: { url: string; key: string }) {
  const res = await fetch(`${cfg.url}/rest/v1/nur_push_subscriptions?notify_maintenance=eq.true&select=endpoint,p256dh,auth`, {
    headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}` },
  });
  if (!res.ok) return [] as Array<{ endpoint: string; p256dh: string; auth: string }>;
  return (await res.json()) as Array<{ endpoint: string; p256dh: string; auth: string }>;
}

// ★ Aktif bakım var mı? (nur_site_settings?key=maintenance)
async function aktifBakimVar(cfg: { url: string; key: string }): Promise<boolean> {
  try {
    const res = await fetch(`${cfg.url}/rest/v1/nur_site_settings?key=eq.maintenance&select=value`, {
      headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}` },
    });
    if (!res.ok) return false;
    const rows = (await res.json()) as Array<{ value?: { enabled?: boolean; endsAt?: string } }>;
    const m = rows[0]?.value;
    if (!m?.enabled) return false;
    // Bakım PENCERESİ içinde mi? (başladı + bitmedi)
    if (m.endsAt && new Date(m.endsAt).getTime() > Date.now()) return true;
    if (!m.endsAt) return true; // bitiş yoksa açık olduğu sürece aktif say
    return false;
  } catch { return false; }
}

// ★ Bakım bitti bildirimi gönder + onayları temizle (tek sefer)
async function bakimBitisBildirimiGonder(req: VercelRequest, cfg: { url: string; key: string }, publicKey: string, privateKey: string) {
  const bildirim = {
    title: "🌙 Nûr Stüdyo yeniden açıldı",
    body: "Bakım tamamlandı — yeni özellikler seni bekliyor. Hoş geldin!",
    tag: `maintenance-done-${new Date().toISOString().slice(0, 13)}`, // saatlik tekrar koruması
  };
  webpush.setVapidDetails("mailto:admin@nurstudyo.com", publicKey, privateKey);
  const aboneler = await bakimAboneleriGetir(cfg);
  let gonderildi = 0, silinen = 0;
  await Promise.allSettled(aboneler.map(async (abone) => {
    try {
      await webpush.sendNotification({ endpoint: abone.endpoint, keys: { p256dh: abone.p256dh, auth: abone.auth } }, JSON.stringify(bildirim), { TTL: 3600 });
      gonderildi++;
    } catch (e: any) {
      await logServerError(req, e, "push/send:maintenance");
      const kod = e?.statusCode;
      if (kod === 404 || kod === 410) {
        await fetch(`${cfg.url}/rest/v1/nur_push_subscriptions?endpoint=eq.${encodeURIComponent(abone.endpoint)}`, {
          method: "DELETE", headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}` },
        }).catch(() => null);
        silinen++;
      }
    }
  }));
  // Bildirim gönderilen (ve ölü silinen) abonelerin onayını temizle — bir daha rahatsız edilmesin
  if (aboneler.length) {
    await fetch(`${cfg.url}/rest/v1/nur_push_subscriptions?notify_maintenance=eq.true`, {
      method: "PATCH",
      headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ notify_maintenance: false }),
    }).catch(() => null);
  }
  return { abone: aboneler.length, gonderildi, silinen };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  // Sadece cron ve GET
  if (req.method !== "GET" && req.method !== "POST") return res.status(405).json({ ok: false, error: "Method Not Allowed" });

  // ★ Brute-force yavaşlatıcı: IP başına dakikada 10 deneme — 9 haneli secret'ı
  //   bile pratikte kırılamaz yapar (deneme hızı 1000/sn'den 0,17/sn'ye düşer)
  if (!rateLimitSilent(req, "push:send:auth", 10, 60_000)) {
    res.setHeader("Retry-After", "60");
    return res.status(429).json({ ok: false, error: "İstek işlenemedi" });
  }

  // CRON_SECRET koruması — Vercel cron otomatik Authorization başlığı ekler.
  // ★ GÜVENLİK: secret TANIMLI DEĞİLSE endpoint TAMAMEN KAPANIR (fail-closed).
  //   Eski davranış (if (secret) ile kontrol) env eksikse herkese açık kılıyordu:
  //   saldırgan tüm abonelere istediği bildirimi push edebilirdi.
  const secret = process.env.CRON_SECRET || "";
  if (!secret) {
    console.error("[push/send] CRON_SECRET tanımsız — endpoint kilitli");
    return res.status(503).json({ ok: false, error: "Gönderim servisi yapılandırılmamış" });
  }
  const auth = String(req.headers.authorization || "");
  const a = Buffer.from(auth);
  const b = Buffer.from(`Bearer ${secret}`);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(401).json({ ok: false, error: "Yetkisiz" });
  }

  const cfg = supabaseConfig();
  if (!cfg) return res.status(503).json({ ok: false, error: "Veritabanı yapılandırılmamış" });

  const publicKey = process.env.VAPID_PUBLIC_KEY || "";
  const privateKey = process.env.VAPID_PRIVATE_KEY || "";
  if (!publicKey || !privateKey) return res.status(503).json({ ok: false, error: "VAPID anahtarları eksik" });

  // ★★★ BAKIM BİTTİ BİLDİRİMİ — cron her 5 dakikada gelir.
  //   Bakım PENCERESİ kapalı + onay bekleyen abone var = "bakım bitti, haber verilmedi"
  //   → onaylı abonelere BİR KEZ bildirim, sonra onaylar temizlenir (DB güdümlü —
  //   serverless cold start'ta bile doğru çalışır).
  //   Gece susturmadan bağımsız: kullanıcı açıkça "haber ver" dedi.
  {
    let aktif = false;
    try { aktif = await aktifBakimVar(cfg); } catch { aktif = false; }
    if (!aktif) {
      const bekleyen = await bakimAboneleriGetir(cfg);
      if (bekleyen.length > 0) {
        const sonuc = await bakimBitisBildirimiGonder(req, cfg, publicKey, privateKey).catch(() => ({ abone: 0, gonderildi: 0, silinen: 0 }));
        if (sonuc.abone > 0) console.log("[push/send] Bakım bitti bildirimi:", sonuc);
      }
    }
  }

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
    await logServerError(req, e, "push/send");
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
