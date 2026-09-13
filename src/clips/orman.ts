// ════════════════════════════════════════════════════════
// orman.ts — R2 CDN gerçek video/poster kütüphanesi
// Kategori: Orman — 48 video (Cloudflare R2'de birebir doğrulanmış)
// ════════════════════════════════════════════════════════

import type { Row } from "../clips-data";

/** R2 özel domain — tüm URL'ler bu kökten üretilir ve buraya YAZILIR */
const R2 = "https://cdn.nurstudyo.com";

const ROMAN = ["","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI","XXII","XXIII","XXIV","XXV","XXVI","XXVII","XXVIII","XXIX","XXX","XXXI","XXXII","XXXIII","XXXIV","XXXV","XXXVI","XXXVII","XXXVIII","XXXIX","XL","XLI","XLII","XLIII","XLIV","XLV","XLVI","XLVII","XLVIII","XLIX","L","LI","LII","LIII","LIV","LV","LVI","LVII","LVIII","LIX","LX","LXI","LXII","LXIII","LXIV","LXV","LXVI","LXVII","LXVIII","LXIX","LXX","LXXI","LXXII","LXXIII","LXXIV","LXXV","LXXVI","LXXVII","LXXVIII","LXXIX","LXXX","LXXXI","LXXXII","LXXXIII","LXXXIV","LXXXV","LXXXVI","LXXXVII","LXXXVIII","LXXXIX","XC"];

/** orman kategorisinin R2'deki gerçek Pexels dosya kimlikleri */
const ORMAN_IDS = [
  5535406,6718353,5543396,857042,11265968,7645660,15720111,18209572,
  9827205,852335,5623817,16922430,27065367,2988361,29030993,854008,
  18059659,18830745,17342975,8534971,27921683,6249996,6206933,18209580,
  10245541,18338310,3881835,7853842,11901912,30123241,4333439,1268973,
  12366845,3150369,12877024,37218119,7645657,38518979,16356514,17992784,
  6093235,2882624,12335802,1343230,10821750,5909376,2711092,3151482,
];

// ── TAM R2 URL LİSTESİ (her kayıt = 1 video + 1 poster) ──
export const ORMAN_URLS: string[] = ORMAN_IDS.map((id) => `${R2}/videos/orman/${id}.mp4`);
export const ORMAN_POSTER_URLS: string[] = ORMAN_IDS.map((id) => `${R2}/posters/orman/${id}.jpg`);

/** Uygulamanın kullandığı satır biçimi: [pexelsId, fps, uhd, etiket] */
export const ORMAN_DATA: Row[] = ORMAN_IDS.map((id, i) => [
  id,
  30,
  true,
  "Orman " + (ROMAN[i + 1] ?? "R" + (i + 1)),
]);

/** AI arama anahtar kelimeleri */
export const ORMAN_AI_KEYWORDS = "orman ağaç yeşil yaprak tabiat";
