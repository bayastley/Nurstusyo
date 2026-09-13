// ════════════════════════════════════════════════════════
// karinca.ts — R2 CDN gerçek video/poster kütüphanesi
// Kategori: Karınca — 49 video (Cloudflare R2'de birebir doğrulanmış)
// ════════════════════════════════════════════════════════

import type { Row } from "../clips-data";

/** R2 özel domain — tüm URL'ler bu kökten üretilir ve buraya YAZILIR */
const R2 = "https://cdn.nurstudyo.com";

const ROMAN = ["","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI","XXII","XXIII","XXIV","XXV","XXVI","XXVII","XXVIII","XXIX","XXX","XXXI","XXXII","XXXIII","XXXIV","XXXV","XXXVI","XXXVII","XXXVIII","XXXIX","XL","XLI","XLII","XLIII","XLIV","XLV","XLVI","XLVII","XLVIII","XLIX","L","LI","LII","LIII","LIV","LV","LVI","LVII","LVIII","LIX","LX","LXI","LXII","LXIII","LXIV","LXV","LXVI","LXVII","LXVIII","LXIX","LXX","LXXI","LXXII","LXXIII","LXXIV","LXXV","LXXVI","LXXVII","LXXVIII","LXXIX","LXXX","LXXXI","LXXXII","LXXXIII","LXXXIV","LXXXV","LXXXVI","LXXXVII","LXXXVIII","LXXXIX","XC"];

/** karinca kategorisinin R2'deki gerçek Pexels dosya kimlikleri */
const KARINCA_IDS = [
  18275131,18330235,4755702,34311116,12999335,7325963,854966,4168987,
  31103670,4925212,6776143,2462305,12633074,26727295,4756072,27724152,
  10008763,5768645,35579795,3617015,9118980,35579881,5019581,3649579,
  4061910,5371018,13456423,4414922,15233763,7661040,35810246,31002418,
  31168418,34988767,4493324,4967412,12633178,35029175,9118974,3083025,
  4349443,4200220,30999634,12633171,4187770,5042877,34311115,12633177,
  5019583,
];

// ── TAM R2 URL LİSTESİ (her kayıt = 1 video + 1 poster) ──
export const KARINCA_URLS: string[] = KARINCA_IDS.map((id) => `${R2}/videos/karinca/${id}.mp4`);
export const KARINCA_POSTER_URLS: string[] = KARINCA_IDS.map((id) => `${R2}/posters/karinca/${id}.jpg`);

/** Uygulamanın kullandığı satır biçimi: [pexelsId, fps, uhd, etiket] */
export const KARINCA_DATA: Row[] = KARINCA_IDS.map((id, i) => [
  id,
  30,
  true,
  "Karınca " + (ROMAN[i + 1] ?? "R" + (i + 1)),
]);

/** AI arama anahtar kelimeleri */
export const KARINCA_AI_KEYWORDS = "karınca emek sulayman";
