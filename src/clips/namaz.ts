// ════════════════════════════════════════════════════════
// namaz.ts — R2 CDN gerçek video/poster kütüphanesi
// Kategori: Kâbe & Namaz — 50 video (Cloudflare R2'de birebir doğrulanmış)
// ════════════════════════════════════════════════════════

import type { Row } from "../clips-data";

/** R2 özel domain — tüm URL'ler bu kökten üretilir ve buraya YAZILIR */
const R2 = "https://cdn.nurstudyo.com";

const ROMAN = ["","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI","XXII","XXIII","XXIV","XXV","XXVI","XXVII","XXVIII","XXIX","XXX","XXXI","XXXII","XXXIII","XXXIV","XXXV","XXXVI","XXXVII","XXXVIII","XXXIX","XL","XLI","XLII","XLIII","XLIV","XLV","XLVI","XLVII","XLVIII","XLIX","L","LI","LII","LIII","LIV","LV","LVI","LVII","LVIII","LIX","LX","LXI","LXII","LXIII","LXIV","LXV","LXVI","LXVII","LXVIII","LXIX","LXX","LXXI","LXXII","LXXIII","LXXIV","LXXV","LXXVI","LXXVII","LXXVIII","LXXIX","LXXX","LXXXI","LXXXII","LXXXIII","LXXXIV","LXXXV","LXXXVI","LXXXVII","LXXXVIII","LXXXIX","XC"];

/** namaz kategorisinin R2'deki gerçek Pexels dosya kimlikleri */
const NAMAZ_IDS = [
  29107904,35098658,35110834,35216059,35110822,36592381,36592378,35098661,
  35098689,38255871,27132027,35110835,35098680,35110839,38255868,35110882,
  36592377,35098691,35098688,35110837,35110842,38255864,35110846,27411334,
  35098687,31673508,35110830,35098708,35098667,35098702,35098674,35110840,
  36592373,31208756,35110833,35110831,5798349,35110887,35098672,9250953,
  35110879,35743721,35098709,36129822,31427887,35110829,35098698,35098703,
  35110881,35098700,
];

// ── TAM R2 URL LİSTESİ (her kayıt = 1 video + 1 poster) ──
export const NAMAZ_URLS: string[] = NAMAZ_IDS.map((id) => `${R2}/videos/namaz/${id}.mp4`);
export const NAMAZ_POSTER_URLS: string[] = NAMAZ_IDS.map((id) => `${R2}/posters/namaz/${id}.jpg`);

/** Uygulamanın kullandığı satır biçimi: [pexelsId, fps, uhd, etiket] */
export const NAMAZ_DATA: Row[] = NAMAZ_IDS.map((id, i) => [
  id,
  30,
  true,
  "Kâbe & Namaz " + (ROMAN[i + 1] ?? "R" + (i + 1)),
]);

/** AI arama anahtar kelimeleri */
export const NAMAZ_AI_KEYWORDS = "namaz kabe mescid hac tavaf cami ibadet secde";
