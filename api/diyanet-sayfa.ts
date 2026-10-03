// ══════════════════════════════════════════════════════════════
// DİYANET MUSHAF SAYFA API — Kur'an Sayfaları "Meal" görünümü (03.10)
// GET /api/diyanet-sayfa?sayfa=1..604
//
// kuran.diyanet.gov.tr CORS başlığı göndermiyor (03.10 test: acao=null,
// OPTIONS 404) → tarayıcı doğrudan çekemez. Bu fonksiyon sunucu tarafında
// Diyanet'in pagedata'sını çekip sayfalık meal metnini sadeleştirir.
// Mushaf sayfa verisi DEĞİŞMEZ → istemci + CDN + bellek üç katmanlı cache.
// Diyanet düşerse zarif düşüş: { ok:false } — site asla bozulmaz.
// ══════════════════════════════════════════════════════════════

import type { VercelRequest, VercelResponse } from "@vercel/node";

declare const process: { env: Record<string, string | undefined> };

const SAYFA_SAYISI = 604;
const DIYANET_PAGEDATA = (id: number) =>
  `https://kuran.diyanet.gov.tr/mushaf/qurandm/pagedata?id=${id}&itf=0&iml=1&iqr=1&ml=1&ql=15&iar=0`;

interface MealAyatHam {
  SureId?: number;
  AyetId?: number;
  AyetNumber?: string;
  AyetText?: string;
  Sure?: { SureNameTurkish?: string; MealInfo?: string } | null;
}
interface PagedataHam {
  CuzNo?: number;
  MealAyats?: MealAyatHam[];
  MealSureLabel?: string;
  QuranSureLabel?: string;
}

// ─── Bellek cache'i (fonction warm oldugu sürece Diyanet'e tek istek/sayfa) ──
const __CACHE = new Map<number, { t: number; body: unknown }>();
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 saat
if (__CACHE.size > 700) { for (const k of __CACHE.keys()) { __CACHE.delete(k); if (__CACHE.size <= 400) break; } }

// ─── Hafif rate limit (in-memory — okuma proxy'si, düşük bütçe yeter) ──
const __RL = new Map<string, number[]>();
function limitAsildi(req: VercelRequest): boolean {
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket?.remoteAddress || "x";
  const simdi = Date.now();
  const pencere = (__RL.get(ip) || []).filter((t) => t >= simdi - 60_000);
  if (pencere.length >= 90) { __RL.set(ip, pencere); return true; }
  pencere.push(simdi);
  __RL.set(ip, pencere);
  if (__RL.size > 4000) { for (const k of __RL.keys()) { __RL.delete(k); if (__RL.size <= 2000) break; } }
  return false;
}

const IZINLI = new Set(["https://nurstudyo.com", "https://www.nurstudyo.com", "http://localhost:5173", "http://localhost:5174"]);

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";
  if (origin && !IZINLI.has(origin)) { res.status(403).json({ ok: false, error: "İzin verilmeyen kaynak" }); return; }
  if (limitAsildi(req)) { res.status(429).json({ ok: false, error: "Çok hızlı — biraz bekle" }); return; }

  const sayfa = parseInt(String(req.query.sayfa ?? ""), 10);
  if (!(sayfa >= 1 && sayfa <= SAYFA_SAYISI)) { res.status(400).json({ ok: false, error: "sayfa 1-604 aralığında olmalı" }); return; }

  // 1) Bellek cache
  const vardi = __CACHE.get(sayfa);
  if (vardi && Date.now() - vardi.t < CACHE_TTL) {
    res.setHeader("Cache-Control", "public, max-age=21600, s-maxage=86400");
    res.status(200).json(vardi.body);
    return;
  }

  // 2) Diyanet'ten çek (id = sayfa - 1, Diyanet mushafı 0-tabanlı görsel indeksi kullanır:
  //    "1. Sayfa | Fâtiha" → data/pages/2X/000.png, pagedata?id=0)
  try {
    const cevap = await fetch(DIYANET_PAGEDATA(sayfa - 1), {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; nurstudyo-mushaf-meal/1.0)" },
      cache: "no-store",
    });
    if (!cevap.ok) throw new Error("diyanet " + cevap.status);
    const ham = (await cevap.json()) as PagedataHam;
    const ayatlar = (ham.MealAyats || []).map((a) => ({
      sureId: a.SureId ?? 0,
      ayetId: a.AyetId ?? 0,
      numara: a.AyetNumber || String(a.AyetId ?? ""),
      meal: (a.AyetText || "").trim(),
      sureAdi: a.Sure?.SureNameTurkish || "",
      // MealInfo HTML içerir (<b>/<i>) — beyaz liste dışı etiketleri temizle (XSS hijyeni)
      sureInfo: (a.Sure?.MealInfo || "").replace(/<(?!\/?\s?(?:b|i|em|strong)>)[^>]*>/gi, ""),
    })).filter((a) => a.meal.length > 0);
    const body = {
      ok: true as const,
      sayfa,
      cuz: ham.CuzNo ?? 1,
      mealSure: ham.MealSureLabel || "",
      quranSure: ham.QuranSureLabel || "",
      kaynak: "Diyanet İşleri Başkanlığı Kur'an-ı Kerim Meali",
      ayatlar,
    };
    __CACHE.set(sayfa, { t: Date.now(), body });
    res.setHeader("Cache-Control", "public, max-age=21600, s-maxage=86400");
    res.status(200).json(body);
  } catch {
    // Zarif düşüş — sayfa verisi alınamazsa istemci hata durumuna geçer, site bozulmaz
    res.status(200).json({ ok: false as const, error: "Diyanet sayfa verisi şu an alınamadı" });
  }
}
