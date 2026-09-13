// ════════════════════════════════════════════════════════
// ates.ts — R2 CDN gerçek video/poster kütüphanesi
// Kategori: Ateş — 50 video (Cloudflare R2'de birebir doğrulanmış)
// ════════════════════════════════════════════════════════

import type { Row } from "../clips-data";

/** R2 özel domain — tüm URL'ler bu kökten üretilir ve buraya YAZILIR */
const R2 = "https://cdn.nurstudyo.com";

const ROMAN = ["","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI","XXII","XXIII","XXIV","XXV","XXVI","XXVII","XXVIII","XXIX","XXX","XXXI","XXXII","XXXIII","XXXIV","XXXV","XXXVI","XXXVII","XXXVIII","XXXIX","XL","XLI","XLII","XLIII","XLIV","XLV","XLVI","XLVII","XLVIII","XLIX","L","LI","LII","LIII","LIV","LV","LVI","LVII","LVIII","LIX","LX","LXI","LXII","LXIII","LXIV","LXV","LXVI","LXVII","LXVIII","LXIX","LXX","LXXI","LXXII","LXXIII","LXXIV","LXXV","LXXVI","LXXVII","LXXVIII","LXXIX","LXXX","LXXXI","LXXXII","LXXXIII","LXXXIV","LXXXV","LXXXVI","LXXXVII","LXXXVIII","LXXXIX","XC"];

/** ates kategorisinin R2'deki gerçek Pexels dosya kimlikleri */
const ATES_IDS = [
  9667144,25754152,14071614,856295,32632823,18991921,27436235,24826314,
  9667214,7285454,11804373,8828898,5659685,9667286,32549181,5968828,
  11216732,8828892,6250403,5659686,5659678,9508953,20706788,1789834,
  6122140,4109280,32548923,855587,6167493,6103751,8946944,20025239,
  8828894,3877152,5596915,5659688,11025391,12701904,15327193,1856918,
  6122142,6158921,28802354,9508330,5592479,9667210,946600,6282533,
  9667146,9667213,
];

// ── TAM R2 URL LİSTESİ (her kayıt = 1 video + 1 poster) ──
export const ATES_URLS: string[] = ATES_IDS.map((id) => `${R2}/videos/ates/${id}.mp4`);
export const ATES_POSTER_URLS: string[] = ATES_IDS.map((id) => `${R2}/posters/ates/${id}.jpg`);

/** Uygulamanın kullandığı satır biçimi: [pexelsId, fps, uhd, etiket] */
export const ATES_DATA: Row[] = ATES_IDS.map((id, i) => [
  id,
  30,
  true,
  "Ateş " + (ROMAN[i + 1] ?? "R" + (i + 1)),
]);

/** AI arama anahtar kelimeleri */
export const ATES_AI_KEYWORDS = "ateş alev kor yan";
