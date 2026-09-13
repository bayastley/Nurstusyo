// ════════════════════════════════════════════════════════
// gece.ts — R2 CDN gerçek video/poster kütüphanesi
// Kategori: Gece — 50 video (Cloudflare R2'de birebir doğrulanmış)
// ════════════════════════════════════════════════════════

import type { Row } from "../clips-data";

/** R2 özel domain — tüm URL'ler bu kökten üretilir ve buraya YAZILIR */
const R2 = "https://cdn.nurstudyo.com";

const ROMAN = ["","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI","XXII","XXIII","XXIV","XXV","XXVI","XXVII","XXVIII","XXIX","XXX","XXXI","XXXII","XXXIII","XXXIV","XXXV","XXXVI","XXXVII","XXXVIII","XXXIX","XL","XLI","XLII","XLIII","XLIV","XLV","XLVI","XLVII","XLVIII","XLIX","L","LI","LII","LIII","LIV","LV","LVI","LVII","LVIII","LIX","LX","LXI","LXII","LXIII","LXIV","LXV","LXVI","LXVII","LXVIII","LXIX","LXX","LXXI","LXXII","LXXIII","LXXIV","LXXV","LXXVI","LXXVII","LXXVIII","LXXIX","LXXX","LXXXI","LXXXII","LXXXIII","LXXXIV","LXXXV","LXXXVI","LXXXVII","LXXXVIII","LXXXIX","XC"];

/** gece kategorisinin R2'deki gerçek Pexels dosya kimlikleri */
const GECE_IDS = [
  30583218,15615248,16111978,29983163,36492194,4342868,19549054,30124245,
  5251546,6960054,2895754,3878209,11319504,10895330,7615707,3765589,
  9997825,30785084,854739,13684588,11376802,36492190,12987909,4221509,
  3847942,31042748,4084070,12987907,18681279,12635749,37171416,5746484,
  30784872,11669489,13573278,12496956,14019782,30295405,7615706,1326148,
  12495590,29454195,12831115,12987908,6960047,11884322,4126488,8909881,
  12578298,11374206,
];

// ── TAM R2 URL LİSTESİ (her kayıt = 1 video + 1 poster) ──
export const GECE_URLS: string[] = GECE_IDS.map((id) => `${R2}/videos/gece/${id}.mp4`);
export const GECE_POSTER_URLS: string[] = GECE_IDS.map((id) => `${R2}/posters/gece/${id}.jpg`);

/** Uygulamanın kullandığı satır biçimi: [pexelsId, fps, uhd, etiket] */
export const GECE_DATA: Row[] = GECE_IDS.map((id, i) => [
  id,
  30,
  true,
  "Gece " + (ROMAN[i + 1] ?? "R" + (i + 1)),
]);

/** AI arama anahtar kelimeleri */
export const GECE_AI_KEYWORDS = "gece ay karanlık yıldız";
