// ════════════════════════════════════════════════════════
// ari.ts — R2 CDN gerçek video/poster kütüphanesi
// Kategori: Arı — 38 video (Cloudflare R2'de birebir doğrulanmış)
// ════════════════════════════════════════════════════════

import type { Row } from "../clips-data";

/** R2 özel domain — tüm URL'ler bu kökten üretilir ve buraya YAZILIR */
const R2 = "https://cdn.nurstudyo.com";

const ROMAN = ["","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI","XXII","XXIII","XXIV","XXV","XXVI","XXVII","XXVIII","XXIX","XXX","XXXI","XXXII","XXXIII","XXXIV","XXXV","XXXVI","XXXVII","XXXVIII","XXXIX","XL","XLI","XLII","XLIII","XLIV","XLV","XLVI","XLVII","XLVIII","XLIX","L","LI","LII","LIII","LIV","LV","LVI","LVII","LVIII","LIX","LX","LXI","LXII","LXIII","LXIV","LXV","LXVI","LXVII","LXVIII","LXIX","LXX","LXXI","LXXII","LXXIII","LXXIV","LXXV","LXXVI","LXXVII","LXXVIII","LXXIX","LXXX","LXXXI","LXXXII","LXXXIII","LXXXIV","LXXXV","LXXXVI","LXXXVII","LXXXVIII","LXXXIX","XC"];

/** ari kategorisinin R2'deki gerçek Pexels dosya kimlikleri */
const ARI_IDS = [
  16590273,16564838,18634526,18282843,16590276,16590272,16067848,27197783,
  11525144,11350078,4891796,16590274,15436411,33379625,19801144,33379449,
  20588168,36815322,5493776,19459711,34737779,36644093,32205544,36644089,
  7886207,5940890,4119563,31341637,7469738,11525146,34560675,25951177,
  36644092,2777352,16104970,5940595,28162340,36549372,
];

// ── TAM R2 URL LİSTESİ (her kayıt = 1 video + 1 poster) ──
export const ARI_URLS: string[] = ARI_IDS.map((id) => `${R2}/videos/ari/${id}.mp4`);
export const ARI_POSTER_URLS: string[] = ARI_IDS.map((id) => `${R2}/posters/ari/${id}.jpg`);

/** Uygulamanın kullandığı satır biçimi: [pexelsId, fps, uhd, etiket] */
export const ARI_DATA: Row[] = ARI_IDS.map((id, i) => [
  id,
  30,
  true,
  "Arı " + (ROMAN[i + 1] ?? "R" + (i + 1)),
]);

/** AI arama anahtar kelimeleri */
export const ARI_AI_KEYWORDS = "arı bal petek kovan şifa";
