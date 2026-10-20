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

  // ★ ÇEŞİTLİLİK MOTORU v2 (kullanıcı 20.10: "akıllı AI her şeye deniz/sahil atmasın"):
  //   eşleşme yoksa stabil hash ile estetik kategorilere dağıtılır AMA
  //   havuzdan 'deniz' ve 'gol' (en sık karışan) %25'e düşürüldü — y重磅
  //   içerik-anlamsız 'deniz' patlaması. Musaf (Kur'an mushaf görsel)
  //   en güvenli geri-dönünş olarak havuza 2x ağırlık verildi: temayı
  //   tahmin edemediğimizde en az-yanlış seçenek o (mushaf sayfa kart).
  const surahKey = surahName.toLocaleLowerCase("tr").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (SURAH_CATEGORY_HINT[surahKey]) return SURAH_CATEGORY_HINT[surahKey];
  // hash → ağırlıklı havuz: musaf 2×, deniz/gol 1× (değişmez: sabit dağıtım için ağırlık)
  const AESTHETIC_POOL: CatId[] = [
    "musaf", "namaz", "yildizlar", "daglar", "gunbatimi",
    "musaf", "gece", "selale", "orman", "cicekler",
    "deniz", "bulut", "kar", "desen", "cami",
  ];
  let h = 2166136261;
  const src = `${surahName}|${tr}`;
  for (let i = 0; i < src.length; i += 1) { h ^= src.charCodeAt(i); h = Math.imul(h, 16777619); }
  const secim = AESTHETIC_POOL[(h >>> 0) % AESTHETIC_POOL.length];
  // ★ 'gol' (durgun göl) cidden metinde 'göl/sakin/durgun' yoksa ASLA dönmерки —
  //   hash katmanında atlanır; 'deniz' de eşleşmeyen metinlere seyrek düşsün.
  if (secim === "gol") return "musaf";
  return secim;
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
