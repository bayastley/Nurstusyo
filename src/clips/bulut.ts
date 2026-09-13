// ════════════════════════════════════════════════════════
// bulut.ts — R2 CDN gerçek video/poster kütüphanesi
// Kategori: Bulut — 50 video (Cloudflare R2'de birebir doğrulanmış)
// ════════════════════════════════════════════════════════

import type { Row } from "../clips-data";

/** R2 özel domain — tüm URL'ler bu kökten üretilir ve buraya YAZILIR */
const R2 = "https://cdn.nurstudyo.com";

const ROMAN = ["","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI","XXII","XXIII","XXIV","XXV","XXVI","XXVII","XXVIII","XXIX","XXX","XXXI","XXXII","XXXIII","XXXIV","XXXV","XXXVI","XXXVII","XXXVIII","XXXIX","XL","XLI","XLII","XLIII","XLIV","XLV","XLVI","XLVII","XLVIII","XLIX","L","LI","LII","LIII","LIV","LV","LVI","LVII","LVIII","LIX","LX","LXI","LXII","LXIII","LXIV","LXV","LXVI","LXVII","LXVIII","LXIX","LXX","LXXI","LXXII","LXXIII","LXXIV","LXXV","LXXVI","LXXVII","LXXVIII","LXXIX","LXXX","LXXXI","LXXXII","LXXXIII","LXXXIV","LXXXV","LXXXVI","LXXXVII","LXXXVIII","LXXXIX","XC"];

/** bulut kategorisinin R2'deki gerçek Pexels dosya kimlikleri */
const BULUT_IDS = [
  2865145,9540152,11519743,6772577,4123185,33227529,27896296,12854830,
  11115722,4364654,33723664,17302276,13236825,4525344,5019813,12634422,
  14940844,13141635,14309781,27877603,4858774,4570131,17824025,33409722,
  5304548,6459951,4703568,4364658,5326623,4027276,9010840,30872234,
  8025546,19985528,6580066,3027189,4060762,9010839,5304547,4355463,
  4103458,4377446,30094989,5148195,12047275,7680846,13293952,10348810,
  33957426,34724497,
];

// ── TAM R2 URL LİSTESİ (her kayıt = 1 video + 1 poster) ──
export const BULUT_URLS: string[] = BULUT_IDS.map((id) => `${R2}/videos/bulut/${id}.mp4`);
export const BULUT_POSTER_URLS: string[] = BULUT_IDS.map((id) => `${R2}/posters/bulut/${id}.jpg`);

/** Uygulamanın kullandığı satır biçimi: [pexelsId, fps, uhd, etiket] */
export const BULUT_DATA: Row[] = BULUT_IDS.map((id, i) => [
  id,
  30,
  true,
  "Bulut " + (ROMAN[i + 1] ?? "R" + (i + 1)),
]);

/** AI arama anahtar kelimeleri */
export const BULUT_AI_KEYWORDS = "bulut gökyüzü hava yağmur";
