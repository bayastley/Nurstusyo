// ════════════════════════════════════════════════════════
// AYET MEAL ÇOK DİL (04.10) — Ayet Kütüphanesi kartlarının
// mealini site diline göre çözer (kullanıcı talebi: "alttaki
// Türkçe anlamlar seçili dile çevrilsin; Arapça ayet olduğu
// gibi kalsın").
//
// Nasıl çalışır:
// • tr            → kartın sabit TR mealı (a.tr) — ağ YOK.
// • en/ar/id/ur   → alquran.cloud edition'ı (MEAL_EDITIONS) sure
//   bazında fetch edilir (studioHelpers.fetchSurah — kendi
//   throttle + 429 koruması + surCache'i var) ve sure:lang
//   anahtarıyla burada tutulur. Gelene kadar / gelmezse TR meal
//   fallback olarak kalır (kullanıcı asla boş görmez).
// • Kaynak satırı ("Saff Suresi • 13. Ayet") da dile göre
//   yeniden kurulur: ar/ur → Arapça sure adı, ayet parçası
//   akAyetNo anahtarından.
// ════════════════════════════════════════════════════════

import { fetchSurah } from "../studio/studioHelpers";
import { MEAL_EDITIONS, translate, type Lang } from "../i18n";
import { sureNoFromSource, SURE_ADLARI, type AyetKarti } from "./ayetKartlariData";
import { SURE_ARAPCA } from "./sureArapca";

/** "Saff Suresi • 13. Ayet" → 13 (çözülemezse 0) */
function ayetNoFrom(source: string): number {
  const after = source.split("•")[1] ?? "";
  return parseInt(after.replace(/[^\d]/g, ""), 10) || 0;
}

/** Meal dili mi? (tr = sabit kart mealı, çeviriye gerek yok) */
export function mealCevrimde(lang: Lang | string | undefined | null): boolean {
  return Boolean(lang) && lang !== "tr";
}

// ── Sure-bazlı meal cache (modül ömrü; FIFO sınırıyla bellek korunur) ──
const sureMealCache = new Map<string, string[]>();
const devamEden = new Map<string, Promise<void>>();
const CACHE_SINIR = 180; // 114 sure × 4 dil üst sınır ~; eski kayıt atılır

/** Senkron bak: cache'te çeviri varsa onu, yoksa kartın TR mealını döner. */
export function gorunenMeal(kart: { tr: string; source: string }, lang: Lang | string | undefined | null): string {
  if (!mealCevrimde(lang)) return kart.tr;
  const s = sureNoFromSource(kart.source);
  if (!s) return kart.tr;
  const dizi = sureMealCache.get(`${s}:${lang}`);
  if (!dizi || !dizi.length) return kart.tr; // henüz gelmedi / başarısız → TR
  return dizi[ayetNoFrom(kart.source) - 1] || kart.tr;
}

/**
 * Verilen kartların surelerini seçili dilde arka planda çeker.
 * Aynı sure:lang için çift istek atılmaz (devamEden dedupe).
 * Yeni başlayan istek bittiğinde `bitti` bir kez çağrılır → çağıran
 * bileşen re-render ile kartları tazeler. Hata sessizce TR fallback.
 */
export async function mealleriTasi(
  kartlar: Array<{ source: string }>,
  lang: Lang | string | undefined | null,
  bitti?: () => void,
): Promise<void> {
  if (!mealCevrimde(lang)) return;
  const baslayan: Promise<void>[] = [];
  for (const kart of kartlar) {
    const s = sureNoFromSource(kart.source);
    if (!s) continue;
    const anahtar = `${s}:${lang}`;
    if (sureMealCache.has(anahtar) || devamEden.has(anahtar)) continue;
    const is = (async () => {
      try {
        const satirlar = await fetchSurah(s, MEAL_EDITIONS[lang as Lang] ?? "en.sahih");
        sureMealCache.set(anahtar, satirlar.map((x) => x.tr));
      } catch {
        // 429/ağ hatası → boş dizi = TR fallback; sessiz geç
        sureMealCache.set(anahtar, []);
      } finally {
        devamEden.delete(anahtar);
        if (sureMealCache.size > CACHE_SINIR) {
          const sil = [...sureMealCache.keys()].slice(0, sureMealCache.size - CACHE_SINIR);
          for (const k of sil) sureMealCache.delete(k);
        }
      }
    })();
    devamEden.set(anahtar, is);
    baslayan.push(is);
  }
  if (baslayan.length) {
    await Promise.all(baslayan);
    bitti?.();
  }
}

/** Kaynak satırını dile göre kurar: "Saff Suresi • 13. Ayet" → "الصف • الآية 13" */
export function kartKaynagi(lang: Lang | string | undefined | null, source: string): string {
  if (!mealCevrimde(lang)) return source;
  const s = sureNoFromSource(source);
  const a = ayetNoFrom(source);
  if (!s || !a) return source; // çözülemedi → TR satır aynen
  const ad = (lang === "ar" || lang === "ur")
    ? (SURE_ARAPCA[s] ?? SURE_ADLARI[s - 1] ?? "")
    : (SURE_ADLARI[s - 1] ?? "");
  if (!ad) return source;
  return `${ad} • ${translate(lang as Lang, "akAyetNo").replace("{n}", String(a))}`;
}

/** Tip kolaylığı — modal'daki tam kart için çevrilmiş görünüm */
export function gorunenKart(kart: AyetKarti, lang: Lang | string | undefined | null): AyetKarti {
  if (!mealCevrimde(lang)) return kart;
  return { ...kart, tr: gorunenMeal(kart, lang), source: kartKaynagi(lang, kart.source) };
}
