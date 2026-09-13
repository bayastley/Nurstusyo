// ════════════════════════════════════════════════════════
// desen.ts — R2 CDN gerçek video/poster kütüphanesi
// Kategori: Desen — 50 video (Cloudflare R2'de birebir doğrulanmış)
// ════════════════════════════════════════════════════════

import type { Row } from "../clips-data";

/** R2 özel domain — tüm URL'ler bu kökten üretilir ve buraya YAZILIR */
const R2 = "https://cdn.nurstudyo.com";

const ROMAN = ["","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI","XXII","XXIII","XXIV","XXV","XXVI","XXVII","XXVIII","XXIX","XXX","XXXI","XXXII","XXXIII","XXXIV","XXXV","XXXVI","XXXVII","XXXVIII","XXXIX","XL","XLI","XLII","XLIII","XLIV","XLV","XLVI","XLVII","XLVIII","XLIX","L","LI","LII","LIII","LIV","LV","LVI","LVII","LVIII","LIX","LX","LXI","LXII","LXIII","LXIV","LXV","LXVI","LXVII","LXVIII","LXIX","LXX","LXXI","LXXII","LXXIII","LXXIV","LXXV","LXXVI","LXXVII","LXXVIII","LXXIX","LXXX","LXXXI","LXXXII","LXXXIII","LXXXIV","LXXXV","LXXXVI","LXXXVII","LXXXVIII","LXXXIX","XC"];

/** desen kategorisinin R2'deki gerçek Pexels dosya kimlikleri */
const DESEN_IDS = [
  37646178,35081870,16193216,36287415,36190791,34771125,36190790,13643580,
  3309023,36287417,8165090,37662251,8165089,36309952,36178467,36192725,
  19819594,10779949,8165466,36190548,35098707,34444623,35082008,16192401,
  35081873,36178659,30567547,35619112,35081983,5788504,5973538,34771130,
  8165093,34275279,5973397,38530729,35081861,35081865,36190780,36192726,
  31839575,35489214,3015535,30054503,35081855,35081856,6161428,8166043,
  36190781,10587316,
];

// ── TAM R2 URL LİSTESİ (her kayıt = 1 video + 1 poster) ──
export const DESEN_URLS: string[] = DESEN_IDS.map((id) => `${R2}/videos/desen/${id}.mp4`);
export const DESEN_POSTER_URLS: string[] = DESEN_IDS.map((id) => `${R2}/posters/desen/${id}.jpg`);

/** Uygulamanın kullandığı satır biçimi: [pexelsId, fps, uhd, etiket] */
export const DESEN_DATA: Row[] = DESEN_IDS.map((id, i) => [
  id,
  30,
  true,
  "Desen " + (ROMAN[i + 1] ?? "R" + (i + 1)),
]);

/** AI arama anahtar kelimeleri */
export const DESEN_AI_KEYWORDS = "desen süs tezhip sanat";
