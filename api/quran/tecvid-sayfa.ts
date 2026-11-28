// ══════════════════════════════════════════════════════════════
// TECVİD RENKLİ MUSHAF SAYFASI — GET /api/quran/tecvid-sayfa?sayfa=1..604
//
// Kullanıcı isteği (27.11): "renkli yazılar, yanda meali" — klasik Türkçe
// renkli tecvid mushafı görünümü.
//
// Kaynak: api.quran.com v4
//   • text_uthmani_tajweed → Uthmânî (Hafs) metin, <tajweed class=...> etiketli
//     (med, gunne, ihfâ, idğâm, iklâb, kalkale, vasıl/sessiz)
//   • translations=77      → Diyanet İşleri Başkanlığı Türkçe meali
//   Aynı meal metni alquran.cloud tr.diyanet ile birebir aynıdır (27.11 testi).
//
// Metin DEĞİŞMEZ → 6 saat bellek + 1 gün CDN cache.
// Güvenlik: yalnız GET, origin kontrolü, IP başına dakikalık tavan, sabit dış
// adres (SSRF yok), istemciye yalnız sadeleştirilmiş alanlar döner.
// ══════════════════════════════════════════════════════════════
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { assertOrigin } from "../_shared/origin.js";
import { rateLimit } from "../_shared/rateLimit.js";

declare const process: { env: Record<string, string | undefined> };

const SAYFA_SAYISI = 604;
const TRANSLATION_ID = 77; // Diyanet İşleri Başkanlığı (Türkçe)
const UPSTREAM = "https://api.quran.com/api/v4/verses/by_page";
const CACHE_TTL = 6 * 60 * 60 * 1000;
const AZAMI_SAYFA_ISTEGI = 5; // tek mushaf sayfası pratikte 1 sayfa veri döner

interface HamAyet {
  verse_key?: string;
  verse_number?: number;
  text_uthmani_tajweed?: string;
  translations?: Array<{ text?: string }>;
}
interface HamCevap {
  verses?: HamAyet[];
  pagination?: { total_pages?: number };
}
export interface TecvidAyet {
  sureId: number;
  ayetId: number;
  numara: string;
  arapca: string;
  meal: string;
}

const __CACHE = new Map<number, { t: number; body: unknown }>();

/** Yaygın HTML varlıkları — quran.com meali &quot; gibi kaçışlar gönderiyor */
const VARLIKLAR: Record<string, string> = {
  quot: '"', amp: "&", apos: "'", lt: "<", gt: ">", nbsp: " ",
  rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", hellip: "…",
  ndash: "–", mdash: "—", copy: "©", laquo: "«", raquo: "»",
};

/** &quot; / &#39; / &#x27; gibi kaçışları gerçek karaktere çevirir */
function varlikCoz(metin: string): string {
  return metin.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (tam: string, kod: string) => {
    if (kod.startsWith("#")) {
      const ondalik = kod[1] === "x" || kod[1] === "X";
      const sayi = parseInt(ondalik ? kod.slice(2) : kod.slice(1), ondalik ? 16 : 10);
      return Number.isFinite(sayi) && sayi > 0 && sayi <= 0x10ffff ? String.fromCodePoint(sayi) : tam;
    }
    return VARLIKLAR[kod.toLowerCase()] ?? tam;
  });
}

/** Meal HTML'ini sadeleştir (dipnot <sup> etiketleri + HTML varlıkları) */
function mealTemizle(ham: string): string {
  return varlikCoz(ham.replace(/<[^>]*>/g, "")).replace(/\s+/g, " ").trim();
}

/** "23:18" → sure 23, ayet 18 */
function anahtarCoz(verseKey: string, yedekNo: number): { sureId: number; ayetId: number } {
  const [s, a] = verseKey.split(":");
  const sureId = parseInt(s ?? "", 10);
  const ayetId = parseInt(a ?? "", 10);
  if (Number.isFinite(sureId) && Number.isFinite(ayetId)) return { sureId, ayetId };
  return { sureId: 0, ayetId: yedekNo };
}

async function sayfaCek(sayfa: number): Promise<TecvidAyet[]> {
  const ayetler: TecvidAyet[] = [];
  let sayfaNo = 1;
  let toplamSayfa = 1;
  do {
    const adres = `${UPSTREAM}/${sayfa}?fields=text_uthmani_tajweed&translations=${TRANSLATION_ID}&per_page=50&page=${sayfaNo}`;
    const cevap = await fetch(adres, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; nurstudyo-mushaf-tecvid/1.0)", Accept: "application/json" },
      cache: "no-store",
    });
    if (!cevap.ok) throw new Error(`quran.com ${cevap.status}`);
    const ham = (await cevap.json()) as HamCevap;
    for (const a of ham.verses ?? []) {
      const arapca = (a.text_uthmani_tajweed ?? "").trim();
      const hamMeal = a.translations?.[0]?.text ?? "";
      if (!arapca) continue;
      const { sureId, ayetId } = anahtarCoz(a.verse_key ?? "", a.verse_number ?? 0);
      ayetler.push({
        sureId,
        ayetId,
        numara: String(ayetId),
        arapca,
        meal: mealTemizle(hamMeal),
      });
    }
    toplamSayfa = Math.max(1, Math.min(AZAMI_SAYFA_ISTEGI, ham.pagination?.total_pages ?? 1));
    sayfaNo += 1;
  } while (sayfaNo <= toplamSayfa);
  return ayetler;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "GET") {
    res.status(405).json({ ok: false, error: "Yalnız GET" });
    return;
  }
  if (!assertOrigin(req, res)) return;
  if (!(await rateLimit(req, res, "quran-tecvid", 90, 60_000))) return;

  const sayfa = parseInt(String(req.query.sayfa ?? ""), 10);
  if (!(sayfa >= 1 && sayfa <= SAYFA_SAYISI)) {
    res.status(400).json({ ok: false, error: "sayfa 1-604 aralığında olmalı" });
    return;
  }

  const vardi = __CACHE.get(sayfa);
  if (vardi && Date.now() - vardi.t < CACHE_TTL) {
    res.setHeader("Cache-Control", "public, max-age=21600, s-maxage=86400, stale-while-revalidate=604800");
    res.status(200).json(vardi.body);
    return;
  }

  try {
    const ayatlar = await sayfaCek(sayfa);
    if (ayatlar.length === 0) throw new Error("boş sayfa");
    const body = {
      ok: true as const,
      sayfa,
      kaynak: {
        metin: "Uthmânî mushaf (Hafs) — KFGQPC",
        meal: "Diyanet İşleri Başkanlığı Kur'an-ı Kerim Meali",
      },
      ayatlar,
    };
    __CACHE.set(sayfa, { t: Date.now(), body });

    if (__CACHE.size > 700) {
      for (const k of __CACHE.keys()) {
        __CACHE.delete(k);
        if (__CACHE.size <= 400) break;
      }
    }
    res.setHeader("Cache-Control", "public, max-age=21600, s-maxage=86400, stale-while-revalidate=604800");
    res.status(200).json(body);
  } catch {
    // Zarif düşüş: istemci "tekrar dene" gösterir, site bozulmaz
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({ ok: false as const, error: "Tecvid sayfası şu an alınamadı" });
  }
}
