// ════════════════════════════════════════════════════════
// cicekler.ts — R2 CDN gerçek video/poster kütüphanesi
// Kategori: Çiçek — 48 video (Cloudflare R2'de birebir doğrulanmış)
// ════════════════════════════════════════════════════════

import type { Row } from "../clips-data";

/** R2 özel domain — tüm URL'ler bu kökten üretilir ve buraya YAZILIR */
const R2 = "https://cdn.nurstudyo.com";

const ROMAN = ["","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI","XXII","XXIII","XXIV","XXV","XXVI","XXVII","XXVIII","XXIX","XXX","XXXI","XXXII","XXXIII","XXXIV","XXXV","XXXVI","XXXVII","XXXVIII","XXXIX","XL","XLI","XLII","XLIII","XLIV","XLV","XLVI","XLVII","XLVIII","XLIX","L","LI","LII","LIII","LIV","LV","LVI","LVII","LVIII","LIX","LX","LXI","LXII","LXIII","LXIV","LXV","LXVI","LXVII","LXVIII","LXIX","LXX","LXXI","LXXII","LXXIII","LXXIV","LXXV","LXXVI","LXXVII","LXXVIII","LXXIX","LXXX","LXXXI","LXXXII","LXXXIII","LXXXIV","LXXXV","LXXXVI","LXXXVII","LXXXVIII","LXXXIX","XC"];

/** cicekler kategorisinin R2'deki gerçek Pexels dosya kimlikleri */
const CICEKLER_IDS = [
  11598545,13968701,37239549,4284994,5056537,35895692,6929139,5056531,
  13963629,37570648,16681525,16508157,11556241,12657354,37239462,5271930,
  12657353,25559415,38307931,16681526,16681528,6319631,17540697,12767090,
  31590042,5372326,10470716,10616117,856152,31936102,27742254,4428855,
  25559414,12417948,9034600,38407032,35665352,12417999,6441720,38647895,
  11637843,37642461,12657349,31936085,13961911,31289523,32317926,12608122,
];

// ── TAM R2 URL LİSTESİ (her kayıt = 1 video + 1 poster) ──
export const CICEKLER_URLS: string[] = CICEKLER_IDS.map((id) => `${R2}/videos/cicekler/${id}.mp4`);
export const CICEKLER_POSTER_URLS: string[] = CICEKLER_IDS.map((id) => `${R2}/posters/cicekler/${id}.jpg`);

/** Uygulamanın kullandığı satır biçimi: [pexelsId, fps, uhd, etiket] */
export const CICEKLER_DATA: Row[] = CICEKLER_IDS.map((id, i) => [
  id,
  30,
  true,
  "Çiçek " + (ROMAN[i + 1] ?? "R" + (i + 1)),
]);

/** AI arama anahtar kelimeleri */
export const CICEKLER_AI_KEYWORDS = "çiçek bahar gül lale tabiat";
