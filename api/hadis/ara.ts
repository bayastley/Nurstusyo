// ════════════════════════════════════════════════════════════════
// HADİS ARAMA PROXY — kullanıcı kararı 28.09: "hadis bankası Sahih
// Buhari/Müslim'e bağlansın, aranan kelimeyi eksiksiz çeksin"
// (ör. "aile" yazınca da sonuç gelsin).
//
// KAYNAKLAR:
//  1) dorar.net — anahtarsız, ücretsiz; külliyat arama (Buhari, Müslim
//     ve diğer kitaplar), metin + tahric (kaynak) döner.
//  2) sunnah.com — API anahtarı varsa (HADITH_API_KEY env) kullanılır;
//     yalnız Buhârî + Müslim, İngilizce/Latince harf çevirisi metin.
//
// GÜVENLİK: yalnızca GET; origin kontrolü (_shared/security) + rate
// limit; girdi temizlenir; dış adresler sabit (SSRF yok). Cache'li.
// ════════════════════════════════════════════════════════════════
import type { VercelRequest, VercelResponse } from "@vercel/node";

// ─── GÖMÜLÜ GÜVENLİK/RATE LIMIT — _shared importları Vercel'de
//     paketlenmediği için (FUNCTION_INVOCATION_FAILED) buraya gömüldü.
//     Diğer API dosyalarıyla aynı desen (feedback.ts, referans.ts). ───
function requireAllowedOrigin(req: VercelRequest, res: VercelResponse): boolean {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";
  const referer = typeof req.headers.referer === "string" ? req.headers.referer : "";
  const envOrigins = (process.env.NUR_ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  const allowed = new Set(["https://nurstudyo.com", "https://www.nurstudyo.com", "http://localhost:5173", "http://localhost:5174", ...envOrigins]);
  if (!origin && !referer) return true;
  if (origin && allowed.has(origin)) return true;
  if (referer) { try { if (allowed.has(new URL(referer).origin)) return true; } catch { /* bozuk referer */ } }
  res.status(403).json({ ok: false, error: "İzin verilmeyen istek kaynağı" });
  return false;
}

const __RL_MAP = new Map<string, number[]>();
const __RL_URL = (process.env.UPSTASH_REDIS_REST_URL || "").replace(/\/+$/, "");
const __RL_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || "";
const __RL_SHARED = __RL_URL.length > 0 && __RL_TOKEN.length > 0;

function __rlIp(req: VercelRequest): string {
  const forwarded = String(req.headers["cf-connecting-ip"] || req.headers["x-real-ip"] || String(req.headers["x-forwarded-for"] || "").split(",")[0] || "").trim();
  return forwarded || (req as unknown as { socket?: { remoteAddress?: string | null } }).socket?.remoteAddress || "unknown";
}

function __rlMem(bucketKey: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const active = (__RL_MAP.get(bucketKey) || []).filter((t) => t >= now - windowMs);
  if (active.length >= max) { __RL_MAP.set(bucketKey, active); return false; }
  active.push(now); __RL_MAP.set(bucketKey, active);
  if (__RL_MAP.size > 5000) { for (const k of __RL_MAP.keys()) { __RL_MAP.delete(k); if (__RL_MAP.size <= 2500) break; } }
  return true;
}

async function __rlShared(bucketKey: string, windowMs: number): Promise<number | null> {
  if (!__RL_SHARED) return null;
  try {
    const res = await fetch(`${__RL_URL}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${__RL_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify([["INCR", `rl:${bucketKey}`], ["EXPIRE", `rl:${bucketKey}`, String(Math.ceil(windowMs / 1000)), "NX"]]),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as Array<{ result?: number }>;
    return typeof json?.[0]?.result === "number" ? json[0].result : null;
  } catch { return null; }
}

async function rateLimit(req: VercelRequest, res: VercelResponse, bucket: string, max: number, windowMs: number): Promise<boolean> {
  const shared = await __rlShared(`${bucket}:${__rlIp(req)}`, windowMs);
  if (shared !== null) {
    if (shared > max) { res.status(429).json({ ok: false, error: "Çok hızlı — biraz bekle" }); return false; }
    return true;
  }
  if (!__rlMem(`${bucket}:${__rlIp(req)}`, max, windowMs)) {
    res.status(429).json({ ok: false, error: "Çok hızlı — biraz bekle" });
    return false;
  }
  return true;
}

// ─── Girdi temizleme — kontrolsüz karakterleri at, 120 karakter yeter ───
function temizle(raw: string): string {
  return raw
    .replace(/[<>;"'`\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

interface HadisSonuc {
  metin: string;
  kaynak: string;
  derece: "sahih" | "hasan" | "zayif" | "bilinmiyor";
  kitap: string;
  dil: "tr" | "ar" | "en";
}

// ─── dorar.net derece metnini standart hale getir ───
function dorarDerece(bilgi: string): HadisSonuc["derece"] {
  if (/صحيح|sahih/i.test(bilgi)) return "sahih";
  if (/حسن|hasan/i.test(bilgi)) return "hasan";
  if (/ضعيف|daif|zaif|zayif/i.test(bilgi)) return "zayif";
  return "bilinmiyor";
}

function dorarKitap(bilgi: string): string {
  if (/بخاري|bukhari/i.test(bilgi)) return "Buhârî";
  if (/مسلم|muslim/i.test(bilgi)) return "Müslim";
  if (/ترمذي|tirmidh?i|tirmizi/i.test(bilgi)) return "Tirmizî";
  if (/أبو داود|ابن داود|abu dawud|ebu davud/i.test(bilgi)) return "Ebû Dâvûd";
  if (/نسائي|nasai/i.test(bilgi)) return "Nesâî";
  if (/ابن ماجه|ibn majah|ibn mace/i.test(bilgi)) return "İbn Mâce";
  if (/أحمد|ahmed/i.test(bilgi)) return "Müsned";
  return "Diğer";
}

// ─── Dış fetch'ler için uygulama kimliği ───
// ★ 28.09: dorar.net, Node/curl gibi genel araç UA'larını 403 ile engelliyor
//   (kanıt: tarayıcı UA ve uygulama UA = 200, node UA = 403). Uygulama
//   kimlikli UA gönderince sunucu fetch'leri de kabul ediliyor.
const DIS_UA = "Nurstudyo/1.0 (+https://nurstudyo.com)";
// ★ 2. deneme kimliği: bazı engelleme kuralları IP+UA kombinasyonuna bakar —
//   verimerkezden gelen isteğe tarayıcı kimliği de denenir (dürüst raporlanır).
const BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS — yalnız sitemiz
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";
  const izinli = ["https://nurstudyo.com", "https://www.nurstudyo.com", "http://localhost:5173", "http://localhost:5174"];
  if (origin && izinli.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  if (!requireAllowedOrigin(req, res)) return;
  if (!(await rateLimit(req, res, "hadis-ara", 30, 60_000))) return;

  const q = temizle(String(req.query.q ?? ""));
  if (q.length < 2) return res.status(400).json({ ok: false, error: "Arama en az 2 karakter olmalı" });

  const sonuclar: HadisSonuc[] = [];
  // ★ Dürüst kaynak raporu: hangi sağlayıcı ne durumda, yanıtla birlikte döner
  const kaynaklar: { dorar: string; sunnah: string } = { dorar: "kapali", sunnah: "anahtar-yok" };

  // ─── 1) sunnah.com (API anahtarı varsa) — Buhârî + Müslim, İngilizce metin ───
  const apiKey = process.env.HADITH_API_KEY;
  if (apiKey) {
    try {
      const kitaplar = ["bukhari", "muslim"] as const;
      await Promise.all(kitaplar.map(async (kitap) => {
        const r = await fetch(`https://api.sunnah.com/v1/${kitap}/search/${encodeURIComponent(q)}?limit=5`, {
          headers: { "X-API-KEY": apiKey, "User-Agent": DIS_UA, Accept: "application/json" },
          signal: AbortSignal.timeout(8000),
        });
        if (!r.ok) { kaynaklar.sunnah = `hata-${r.status}`; return; }
        const data = (await r.json()) as {
          data?: Array<{ hadithEnglish?: string; hadithArabic?: string; chapter?: { chapterName?: string }; hadithNumber?: number }>;
        };
        for (const h of (data.data ?? []).slice(0, 5)) {
          const metin = h.hadithEnglish || h.hadithArabic || "";
          if (!metin) continue;
          sonuclar.push({
            metin,
            kaynak: `Sahih ${kitap === "bukhari" ? "Buhârî" : "Müslim"}${h.chapter?.chapterName ? ` · ${h.chapter.chapterName}` : ""}${h.hadithNumber ? ` · ${h.hadithNumber}` : ""}`,
            derece: "sahih",
            kitap: kitap === "bukhari" ? "Buhârî" : "Müslim",
            dil: h.hadithEnglish ? "en" : "ar",
          });
        }
        kaynaklar.sunnah = `ok-${sonuclar.length}`;
      }));
    } catch { kaynaklar.sunnah = "hata"; /* sunnah.com kapalıysa dorar devam eder */ }
  }

  // ─── 2) dorar.net — anahtarsız külliyat arama (Arapça) ───
  if (sonuclar.length < 5) {
    try {
      const url = `https://dorar.net/dorar_api.json?skey=${encodeURIComponent(q)}`;
      // ★ İki kimlikli deneme: uygulama UA → reddedilirse tarayıcı UA
      let r = await fetch(url, {
        headers: { "User-Agent": DIS_UA, Accept: "application/json" },
        signal: AbortSignal.timeout(8000),
      });
      if (!r.ok) {
        kaynaklar.dorar = `ua-reddet-${r.status}`;
        r = await fetch(url, {
          headers: { "User-Agent": BROWSER_UA, Accept: "application/json" },
          signal: AbortSignal.timeout(8000),
        });
      }
      if (r.ok) {
        kaynaklar.dorar = "ok";
        const data = (await r.json()) as { ahadith?: { result?: { html?: string } } };
        const html = data?.ahadith?.result?.html ?? "";
        // HTML kalıpları: metin <div class="hadith">, künye <div class="hadith-info">
        const metinler = [...html.matchAll(/class="hadith"[^>]*>([\s\S]*?)<\/div>/g)]
          .map((m) => m[1].replace(/<[^>]+>/g, "").trim()).filter(Boolean);
        const bilgiler = [...html.matchAll(/class="hadith-info"[^>]*>([\s\S]*?)<\/div>/g)]
          .map((m) => m[1].replace(/<[^>]+>/g, "").trim()).filter(Boolean);
        for (let i = 0; i < metinler.length && sonuclar.length < 12; i++) {
          const metin = metinler[i];
          const bilgi = bilgiler[i] ?? "";
          sonuclar.push({
            metin,
            kaynak: bilgi.slice(0, 200) || dorarKitap(bilgi),
            derece: dorarDerece(bilgi),
            kitap: dorarKitap(bilgi),
            dil: "ar",
          });
        }
        kaynaklar.dorar = `ok-${sonuclar.length}`;
      } else {
        kaynaklar.dorar = `kapali-${r.status}`;
      }
    } catch { kaynaklar.dorar = "hata"; /* dorar kapalıysa sunnah sonuçları kalır */ }
  }

  return res.status(200).json({ ok: true, q, sayi: sonuclar.length, kaynaklar, sonuclar: sonuclar.slice(0, 12) });
}
