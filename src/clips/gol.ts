// ════════════════════════════════════════════════════════
// gol.ts — R2 CDN gerçek video/poster kütüphanesi
// Kategori: Göl — 49 video (Cloudflare R2'de birebir doğrulanmış)
// ════════════════════════════════════════════════════════

import type { Row } from "../clips-data";

/** R2 özel domain — tüm URL'ler bu kökten üretilir ve buraya YAZILIR */
const R2 = "https://cdn.nurstudyo.com";

const ROMAN = ["","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI","XXII","XXIII","XXIV","XXV","XXVI","XXVII","XXVIII","XXIX","XXX","XXXI","XXXII","XXXIII","XXXIV","XXXV","XXXVI","XXXVII","XXXVIII","XXXIX","XL","XLI","XLII","XLIII","XLIV","XLV","XLVI","XLVII","XLVIII","XLIX","L","LI","LII","LIII","LIV","LV","LVI","LVII","LVIII","LIX","LX","LXI","LXII","LXIII","LXIV","LXV","LXVI","LXVII","LXVIII","LXIX","LXX","LXXI","LXXII","LXXIII","LXXIV","LXXV","LXXVI","LXXVII","LXXVIII","LXXIX","LXXX","LXXXI","LXXXII","LXXXIII","LXXXIV","LXXXV","LXXXVI","LXXXVII","LXXXVIII","LXXXIX","XC"];

/** gol kategorisinin R2'deki gerçek Pexels dosya kimlikleri */
const GOL_IDS = [
  10506706,28043352,28957350,5481307,15327210,7865078,8745384,6775914,
  855462,28555946,35869091,37499309,3644111,5536567,32057496,34430437,
  5795170,35272300,31851917,34713772,5620215,30988479,2589185,27686386,
  33746446,12491527,28455247,27065369,13075287,28100361,7154839,37895435,
  11494004,27398972,37534524,28646664,38667878,11190497,28077238,31640623,
  5587017,30849166,37392774,38511136,38642985,33746454,5659734,38012689,
  12339903,
];

// ── TAM R2 URL LİSTESİ (her kayıt = 1 video + 1 poster) ──
export const GOL_URLS: string[] = GOL_IDS.map((id) => `${R2}/videos/gol/${id}.mp4`);
export const GOL_POSTER_URLS: string[] = GOL_IDS.map((id) => `${R2}/posters/gol/${id}.jpg`);

/** Uygulamanın kullandığı satır biçimi: [pexelsId, fps, uhd, etiket] */
export const GOL_DATA: Row[] = GOL_IDS.map((id, i) => [
  id,
  30,
  true,
  "Göl " + (ROMAN[i + 1] ?? "R" + (i + 1)),
]);

/** AI arama anahtar kelimeleri */
export const GOL_AI_KEYWORDS = "göl su yansıma durgun";
