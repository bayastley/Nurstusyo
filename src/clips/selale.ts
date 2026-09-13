// ════════════════════════════════════════════════════════
// selale.ts — R2 CDN gerçek video/poster kütüphanesi
// Kategori: Şelale — 49 video (Cloudflare R2'de birebir doğrulanmış)
// ════════════════════════════════════════════════════════

import type { Row } from "../clips-data";

/** R2 özel domain — tüm URL'ler bu kökten üretilir ve buraya YAZILIR */
const R2 = "https://cdn.nurstudyo.com";

const ROMAN = ["","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI","XXII","XXIII","XXIV","XXV","XXVI","XXVII","XXVIII","XXIX","XXX","XXXI","XXXII","XXXIII","XXXIV","XXXV","XXXVI","XXXVII","XXXVIII","XXXIX","XL","XLI","XLII","XLIII","XLIV","XLV","XLVI","XLVII","XLVIII","XLIX","L","LI","LII","LIII","LIV","LV","LVI","LVII","LVIII","LIX","LX","LXI","LXII","LXIII","LXIV","LXV","LXVI","LXVII","LXVIII","LXIX","LXX","LXXI","LXXII","LXXIII","LXXIV","LXXV","LXXVI","LXXVII","LXXVIII","LXXIX","LXXX","LXXXI","LXXXII","LXXXIII","LXXXIV","LXXXV","LXXXVI","LXXXVII","LXXXVIII","LXXXIX","XC"];

/** selale kategorisinin R2'deki gerçek Pexels dosya kimlikleri */
const SELALE_IDS = [
  854334,6405064,4140553,5451130,3209859,2920545,37669693,3629264,
  6042250,11264043,4231749,5527622,8050136,9666921,8050132,6901758,
  3992452,2253183,4208231,5095256,1191881,6042251,5580679,855668,
  6617440,2881327,5580678,9212195,6617658,4796898,5580681,10761087,
  4820498,855755,5744453,5499806,16123352,20370503,33053871,5632725,
  5884289,855143,855136,6405060,5544766,6266443,30767622,7784386,
  7610644,
];

// ── TAM R2 URL LİSTESİ (her kayıt = 1 video + 1 poster) ──
export const SELALE_URLS: string[] = SELALE_IDS.map((id) => `${R2}/videos/selale/${id}.mp4`);
export const SELALE_POSTER_URLS: string[] = SELALE_IDS.map((id) => `${R2}/posters/selale/${id}.jpg`);

/** Uygulamanın kullandığı satır biçimi: [pexelsId, fps, uhd, etiket] */
export const SELALE_DATA: Row[] = SELALE_IDS.map((id, i) => [
  id,
  30,
  true,
  "Şelale " + (ROMAN[i + 1] ?? "R" + (i + 1)),
]);

/** AI arama anahtar kelimeleri */
export const SELALE_AI_KEYWORDS = "şelale çağlayan su akar nehir";
