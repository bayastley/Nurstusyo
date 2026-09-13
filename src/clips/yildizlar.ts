// ════════════════════════════════════════════════════════
// yildizlar.ts — R2 CDN gerçek video/poster kütüphanesi
// Kategori: Yıldız — 49 video (Cloudflare R2'de birebir doğrulanmış)
// ════════════════════════════════════════════════════════

import type { Row } from "../clips-data";

/** R2 özel domain — tüm URL'ler bu kökten üretilir ve buraya YAZILIR */
const R2 = "https://cdn.nurstudyo.com";

const ROMAN = ["","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI","XXII","XXIII","XXIV","XXV","XXVI","XXVII","XXVIII","XXIX","XXX","XXXI","XXXII","XXXIII","XXXIV","XXXV","XXXVI","XXXVII","XXXVIII","XXXIX","XL","XLI","XLII","XLIII","XLIV","XLV","XLVI","XLVII","XLVIII","XLIX","L","LI","LII","LIII","LIV","LV","LVI","LVII","LVIII","LIX","LX","LXI","LXII","LXIII","LXIV","LXV","LXVI","LXVII","LXVIII","LXIX","LXX","LXXI","LXXII","LXXIII","LXXIV","LXXV","LXXVI","LXXVII","LXXVIII","LXXIX","LXXX","LXXXI","LXXXII","LXXXIII","LXXXIV","LXXXV","LXXXVI","LXXXVII","LXXXVIII","LXXXIX","XC"];

/** yildizlar kategorisinin R2'deki gerçek Pexels dosya kimlikleri */
const YILDIZLAR_IDS = [
  18358235,28180439,12336972,18997337,10719866,857134,30262970,8644889,
  28112530,27700964,12999252,27303243,25621510,19223486,9341351,16923263,
  13423306,27442169,32920021,9340918,13322952,29434738,11929270,9940664,
  16544208,32901084,26957579,10650636,10039362,14191491,9341428,9341049,
  30928256,12467968,25921138,12043830,10477097,32063954,12182831,33205246,
  27693875,8144359,27254149,9129751,5338469,5651047,11892760,10001215,
  6867012,
];

// ── TAM R2 URL LİSTESİ (her kayıt = 1 video + 1 poster) ──
export const YILDIZLAR_URLS: string[] = YILDIZLAR_IDS.map((id) => `${R2}/videos/yildizlar/${id}.mp4`);
export const YILDIZLAR_POSTER_URLS: string[] = YILDIZLAR_IDS.map((id) => `${R2}/posters/yildizlar/${id}.jpg`);

/** Uygulamanın kullandığı satır biçimi: [pexelsId, fps, uhd, etiket] */
export const YILDIZLAR_DATA: Row[] = YILDIZLAR_IDS.map((id, i) => [
  id,
  30,
  true,
  "Yıldız " + (ROMAN[i + 1] ?? "R" + (i + 1)),
]);

/** AI arama anahtar kelimeleri */
export const YILDIZLAR_AI_KEYWORDS = "yıldız gökyüzü gece yıldızlar evren";
