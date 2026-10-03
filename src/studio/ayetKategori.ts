// ════════════════════════════════════════════════════════
// AYET → ATMOSFER KATEGORİSİ MOTORU (02.10 — SRP adım 13)
// StudioApp'ten taşındı; SAF fonksiyonlardır (state/ref bağımlılığı
// yok) — davranış birebir korunmuştur, sadece yer değişimi yapıldı.
// ════════════════════════════════════════════════════════

import type { CatId } from "../clips";
import { KEYWORD_CATEGORY_FALLBACK, SURAH_CATEGORY_HINT } from "./studioConstants";
import { ADMIN_AI_KEYWORDS, ADMIN_MOTION_CLIPS } from "../adminMediaManifest";
import { CLIP_AI_KEYWORDS } from "../clips/index";

/** Ayet metni (Arapça + meal + sure adı) → atmosfer kategorisi. */
export function ayetKategorisiBul(ar: string, tr: string, surahName = ""): CatId {
  void ar;
  // ★ SIRA DÜZELTMESİ: ÖNCE ayetin KELİMELERİ, sure ipucu EN SON çare.
  //   Eski hata: SURAH_CATEGORY_HINT baştan devreye girip "Nahl"→"arı"
  //   kilitleyordu — "Gökten su indirdi" ayetinde bile meale bakılmıyordu.
  const norm = (s: string) => s.toLocaleLowerCase("tr");
  const words = norm(`${surahName} ${tr}`).split(/[^a-zçğıöşüâîû]+/i).filter(Boolean);
  let matched: CatId | null = null;
  let bestLen = 0;
  for (const word of words) {
    for (const [kw, catVal] of Object.entries(KEYWORD_CATEGORY_FALLBACK)) {
      const kwNorm = norm(kw);
      const isMatch = kwNorm.length <= 3 ? word === kwNorm : word.startsWith(kwNorm) || word === kwNorm;
      if (isMatch && kwNorm.length > bestLen) {
        matched = catVal;
        bestLen = kwNorm.length;
      }
    }
  }
  if (matched) return matched;

  const adminMediaCategories = new Set(ADMIN_MOTION_CLIPS.map((clip) => clip.cat));
  for (const [category, keywords] of Object.entries(ADMIN_AI_KEYWORDS)) {
    if (!adminMediaCategories.has(category as CatId)) continue;
    const match = keywords
      .split(/\s+/)
      .some((keyword) => words.some((word) => word === keyword || word.startsWith(keyword)));
    if (match) return category as CatId;
  }

  // ★ Ana R2 kategorileri için akıllı eşleşme (23 kategori: namaz, deniz, daglar...)
  for (const [category, keywords] of Object.entries(CLIP_AI_KEYWORDS)) {
    const match = keywords
      .split(/\s+/)
      .some((keyword) => words.some((word) => word === keyword || word.startsWith(keyword)));
    if (match) return category as CatId;
  }

  // ★ ÇEŞİTLİLİK MOTORU — eşleşme yoksa artık HER ZAMAN "musaf" (Kur'an) dönmüyor.
  //   Ayet metninden üretilen stabil hash ile estetik kategoriler arasında dağıtılır.
  //   Böylece her ayet farklı bir atmosfer alır, aynı Kur'an görseli tekrar etmez.
  //   Not: sure ipucu (SURAH_CATEGORY_HINT) kelime eşleşmesi başarısız olursa
  //   hash havuzundan ÖNCE denenir — artık ayet içeriğini EZMEZ.
  const surahKey = surahName.toLocaleLowerCase("tr").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (SURAH_CATEGORY_HINT[surahKey]) return SURAH_CATEGORY_HINT[surahKey];
  const AESTHETIC_POOL: CatId[] = [
    "namaz", "yildizlar", "deniz", "daglar", "gunbatimi",
    "gece", "selale", "orman", "cicekler", "musaf",
  ];
  let h = 2166136261;
  const src = `${surahName}|${tr}`;
  for (let i = 0; i < src.length; i += 1) { h ^= src.charCodeAt(i); h = Math.imul(h, 16777619); }
  return AESTHETIC_POOL[(h >>> 0) % AESTHETIC_POOL.length];
}

// ★ Admin kategori ikinci tarama: kod kategorisinde seçili türde klip yoksa
//   (örn. bulut kategorisinin şablonu yoksa), ayet kelimelerini admin kategori
//   keyword'lerinde tarar. Böylece Şablon V2'de de tematik isabet sağlanır.
//   Not: sadece 1. taramanın (ayetKategorisiBul) admin bölümünden FARKLI
//   çalışır — o zaten ADMIN_MOTION_CLIPS varken admin kategorisi döndürüyordu;
//   bu fonksiyon her durumda keyword→admin kategori eşleşmesini döndürür.
export function adminAyetKategorisiBul(ar: string, tr: string, surahName = ""): CatId | null {
  void ar;
  const norm = (s: string) => s.toLocaleLowerCase("tr");
  const words = norm(`${surahName} ${tr}`).split(/[^a-zçğıöşüâîû]+/i).filter(Boolean);
  const adminMediaCategories = new Set(ADMIN_MOTION_CLIPS.map((clip) => clip.cat));
  for (const [category, keywords] of Object.entries(ADMIN_AI_KEYWORDS)) {
    if (!adminMediaCategories.has(category as CatId)) continue;
    const match = keywords
      .split(/\s+/)
      .some((keyword) => words.some((word) => word === keyword || word.startsWith(keyword)));
    if (match) return category as CatId;
  }
  return null;
}
