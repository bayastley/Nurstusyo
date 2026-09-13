// ════════════════════════════════════════════════════════
// col.ts — R2 CDN gerçek video/poster kütüphanesi
// Kategori: Çöl — 50 video (Cloudflare R2'de birebir doğrulanmış)
// ════════════════════════════════════════════════════════

import type { Row } from "../clips-data";

/** R2 özel domain — tüm URL'ler bu kökten üretilir ve buraya YAZILIR */
const R2 = "https://cdn.nurstudyo.com";

const ROMAN = ["","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI","XXII","XXIII","XXIV","XXV","XXVI","XXVII","XXVIII","XXIX","XXX","XXXI","XXXII","XXXIII","XXXIV","XXXV","XXXVI","XXXVII","XXXVIII","XXXIX","XL","XLI","XLII","XLIII","XLIV","XLV","XLVI","XLVII","XLVIII","XLIX","L","LI","LII","LIII","LIV","LV","LVI","LVII","LVIII","LIX","LX","LXI","LXII","LXIII","LXIV","LXV","LXVI","LXVII","LXVIII","LXIX","LXX","LXXI","LXXII","LXXIII","LXXIV","LXXV","LXXVI","LXXVII","LXXVIII","LXXIX","LXXX","LXXXI","LXXXII","LXXXIII","LXXXIV","LXXXV","LXXXVI","LXXXVII","LXXXVIII","LXXXIX","XC"];

/** col kategorisinin R2'deki gerçek Pexels dosya kimlikleri */
const COL_IDS = [
  2055056,17833698,33170755,5442713,33665977,8865223,16905150,30791936,
  18762628,6573930,8865773,8865761,16381948,20081119,35296750,8397874,
  26346980,34162348,17833699,5922887,855673,16017101,5442785,33549992,
  35309672,8865227,28427111,8865816,10682457,35296754,17833704,19745264,
  28782169,33418729,33911366,7670919,34162311,28427109,17584730,16381944,
  8865359,11943651,35101190,29660253,30791919,28916862,33284824,34535419,
  5728372,30240507,
];

// ── TAM R2 URL LİSTESİ (her kayıt = 1 video + 1 poster) ──
export const COL_URLS: string[] = COL_IDS.map((id) => `${R2}/videos/col/${id}.mp4`);
export const COL_POSTER_URLS: string[] = COL_IDS.map((id) => `${R2}/posters/col/${id}.jpg`);

/** Uygulamanın kullandığı satır biçimi: [pexelsId, fps, uhd, etiket] */
export const COL_DATA: Row[] = COL_IDS.map((id, i) => [
  id,
  30,
  true,
  "Çöl " + (ROMAN[i + 1] ?? "R" + (i + 1)),
]);

/** AI arama anahtar kelimeleri */
export const COL_AI_KEYWORDS = "çöl kum kurak vaha";
