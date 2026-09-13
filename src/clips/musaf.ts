// ════════════════════════════════════════════════════════
// musaf.ts — R2 CDN gerçek video/poster kütüphanesi
// Kategori: Kur'an & Mushaf — 50 video (Cloudflare R2'de birebir doğrulanmış)
// ════════════════════════════════════════════════════════

import type { Row } from "../clips-data";

/** R2 özel domain — tüm URL'ler bu kökten üretilir ve buraya YAZILIR */
const R2 = "https://cdn.nurstudyo.com";

const ROMAN = ["","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI","XXII","XXIII","XXIV","XXV","XXVI","XXVII","XXVIII","XXIX","XXX","XXXI","XXXII","XXXIII","XXXIV","XXXV","XXXVI","XXXVII","XXXVIII","XXXIX","XL","XLI","XLII","XLIII","XLIV","XLV","XLVI","XLVII","XLVIII","XLIX","L","LI","LII","LIII","LIV","LV","LVI","LVII","LVIII","LIX","LX","LXI","LXII","LXIII","LXIV","LXV","LXVI","LXVII","LXVIII","LXIX","LXX","LXXI","LXXII","LXXIII","LXXIV","LXXV","LXXVI","LXXVII","LXXVIII","LXXIX","LXXX","LXXXI","LXXXII","LXXXIII","LXXXIV","LXXXV","LXXXVI","LXXXVII","LXXXVIII","LXXXIX","XC"];

/** musaf kategorisinin R2'deki gerçek Pexels dosya kimlikleri */
const MUSAF_IDS = [
  13643581,13643573,4715216,8165467,13643583,13643584,32470282,8165469,
  10662285,36072618,5788681,37471903,37471902,8165474,13643582,9015573,
  8488770,13643567,8165172,13643568,36072617,13643578,10816965,8165476,
  7248990,13643571,14513399,10661535,9509138,7249561,4353784,4750055,
  13643580,8165772,7249004,8165780,13643586,13643576,13643585,13643574,
  8969565,20358431,4243571,4750050,7401908,13643570,8488700,8165468,
  9201796,8165470,
];

// ── TAM R2 URL LİSTESİ (her kayıt = 1 video + 1 poster) ──
export const MUSAF_URLS: string[] = MUSAF_IDS.map((id) => `${R2}/videos/musaf/${id}.mp4`);
export const MUSAF_POSTER_URLS: string[] = MUSAF_IDS.map((id) => `${R2}/posters/musaf/${id}.jpg`);

/** Uygulamanın kullandığı satır biçimi: [pexelsId, fps, uhd, etiket] */
export const MUSAF_DATA: Row[] = MUSAF_IDS.map((id, i) => [
  id,
  30,
  true,
  "Kur'an & Mushaf " + (ROMAN[i + 1] ?? "R" + (i + 1)),
]);

/** AI arama anahtar kelimeleri */
export const MUSAF_AI_KEYWORDS = "kuran mushaf ayet sure tilavet kitap vahiy";
