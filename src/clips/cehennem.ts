// ════════════════════════════════════════════════════════
// cehennem.ts — R2 CDN gerçek video/poster kütüphanesi
// Kategori: Cehennem — 50 video (Cloudflare R2'de birebir doğrulanmış)
// ════════════════════════════════════════════════════════

import type { Row } from "../clips-data";

/** R2 özel domain — tüm URL'ler bu kökten üretilir ve buraya YAZILIR */
const R2 = "https://cdn.nurstudyo.com";

const ROMAN = ["","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI","XXII","XXIII","XXIV","XXV","XXVI","XXVII","XXVIII","XXIX","XXX","XXXI","XXXII","XXXIII","XXXIV","XXXV","XXXVI","XXXVII","XXXVIII","XXXIX","XL","XLI","XLII","XLIII","XLIV","XLV","XLVI","XLVII","XLVIII","XLIX","L","LI","LII","LIII","LIV","LV","LVI","LVII","LVIII","LIX","LX","LXI","LXII","LXIII","LXIV","LXV","LXVI","LXVII","LXVIII","LXIX","LXX","LXXI","LXXII","LXXIII","LXXIV","LXXV","LXXVI","LXXVII","LXXVIII","LXXIX","LXXX","LXXXI","LXXXII","LXXXIII","LXXXIV","LXXXV","LXXXVI","LXXXVII","LXXXVIII","LXXXIX","XC"];

/** cehennem kategorisinin R2'deki gerçek Pexels dosya kimlikleri */
const CEHENNEM_IDS = [
  13205825,28010346,9278554,856429,18851812,29839774,855936,31701090,
  2657691,30487402,32943917,11025478,8907604,28054511,8223945,3052162,
  17119104,9711025,6877513,16602048,27938230,3878186,4159523,854411,
  18543035,31981850,28054732,10651140,5116864,3643825,9085370,8334203,
  5898221,8573157,12942141,10599522,36592043,2254964,26665166,36023141,
  3879471,10824285,35775174,854331,1449850,1575720,12161170,12590269,
  854541,10260159,
];

// ── TAM R2 URL LİSTESİ (her kayıt = 1 video + 1 poster) ──
export const CEHENNEM_URLS: string[] = CEHENNEM_IDS.map((id) => `${R2}/videos/cehennem/${id}.mp4`);
export const CEHENNEM_POSTER_URLS: string[] = CEHENNEM_IDS.map((id) => `${R2}/posters/cehennem/${id}.jpg`);

/** Uygulamanın kullandığı satır biçimi: [pexelsId, fps, uhd, etiket] */
export const CEHENNEM_DATA: Row[] = CEHENNEM_IDS.map((id, i) => [
  id,
  30,
  true,
  "Cehennem " + (ROMAN[i + 1] ?? "R" + (i + 1)),
]);

/** AI arama anahtar kelimeleri */
export const CEHENNEM_AI_KEYWORDS = "cehennem nar azap kor";
