// ════════════════════════════════════════════════════════
// deniz.ts — R2 CDN gerçek video/poster kütüphanesi
// Kategori: Deniz — 47 video (Cloudflare R2'de birebir doğrulanmış)
// ════════════════════════════════════════════════════════

import type { Row } from "../clips-data";

/** R2 özel domain — tüm URL'ler bu kökten üretilir ve buraya YAZILIR */
const R2 = "https://cdn.nurstudyo.com";

const ROMAN = ["","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI","XXII","XXIII","XXIV","XXV","XXVI","XXVII","XXVIII","XXIX","XXX","XXXI","XXXII","XXXIII","XXXIV","XXXV","XXXVI","XXXVII","XXXVIII","XXXIX","XL","XLI","XLII","XLIII","XLIV","XLV","XLVI","XLVII","XLVIII","XLIX","L","LI","LII","LIII","LIV","LV","LVI","LVII","LVIII","LIX","LX","LXI","LXII","LXIII","LXIV","LXV","LXVI","LXVII","LXVIII","LXIX","LXX","LXXI","LXXII","LXXIII","LXXIV","LXXV","LXXVI","LXXVII","LXXVIII","LXXIX","LXXX","LXXXI","LXXXII","LXXXIII","LXXXIV","LXXXV","LXXXVI","LXXXVII","LXXXVIII","LXXXIX","XC"];

/** deniz kategorisinin R2'deki gerçek Pexels dosya kimlikleri */
const DENIZ_IDS = [
  6748729,28570000,3116760,5668625,38242932,35371501,9806390,31013707,
  29493224,38328535,854747,5668613,15226109,6815625,9758695,15814631,
  34620659,38329050,35371500,10779129,19912847,37259189,34964457,30119080,
  31817094,30623330,4072583,6599481,2776523,31957404,35515578,38045813,
  31038079,9970849,32842997,27203860,6981297,30884246,19316040,35371141,
  35257455,20082249,36842093,27700628,35212141,37604236,1918465,
];

// ── TAM R2 URL LİSTESİ (her kayıt = 1 video + 1 poster) ──
export const DENIZ_URLS: string[] = DENIZ_IDS.map((id) => `${R2}/videos/deniz/${id}.mp4`);
export const DENIZ_POSTER_URLS: string[] = DENIZ_IDS.map((id) => `${R2}/posters/deniz/${id}.jpg`);

/** Uygulamanın kullandığı satır biçimi: [pexelsId, fps, uhd, etiket] */
export const DENIZ_DATA: Row[] = DENIZ_IDS.map((id, i) => [
  id,
  30,
  true,
  "Deniz " + (ROMAN[i + 1] ?? "R" + (i + 1)),
]);

/** AI arama anahtar kelimeleri */
export const DENIZ_AI_KEYWORDS = "deniz okyanus dalga su sahil";
