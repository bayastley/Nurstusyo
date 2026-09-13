// ════════════════════════════════════════════════════════
// hurma.ts — R2 CDN gerçek video/poster kütüphanesi
// Kategori: Hurma — 45 video (Cloudflare R2'de birebir doğrulanmış)
// ════════════════════════════════════════════════════════

import type { Row } from "../clips-data";

/** R2 özel domain — tüm URL'ler bu kökten üretilir ve buraya YAZILIR */
const R2 = "https://cdn.nurstudyo.com";

const ROMAN = ["","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI","XXII","XXIII","XXIV","XXV","XXVI","XXVII","XXVIII","XXIX","XXX","XXXI","XXXII","XXXIII","XXXIV","XXXV","XXXVI","XXXVII","XXXVIII","XXXIX","XL","XLI","XLII","XLIII","XLIV","XLV","XLVI","XLVII","XLVIII","XLIX","L","LI","LII","LIII","LIV","LV","LVI","LVII","LVIII","LIX","LX","LXI","LXII","LXIII","LXIV","LXV","LXVI","LXVII","LXVIII","LXIX","LXX","LXXI","LXXII","LXXIII","LXXIV","LXXV","LXXVI","LXXVII","LXXVIII","LXXIX","LXXX","LXXXI","LXXXII","LXXXIII","LXXXIV","LXXXV","LXXXVI","LXXXVII","LXXXVIII","LXXXIX","XC"];

/** hurma kategorisinin R2'deki gerçek Pexels dosya kimlikleri */
const HURMA_IDS = [
  855683,14158721,28949922,14159701,18038040,14160251,17629832,20497501,
  8296086,15773408,6962516,30687462,11908610,35255664,9079160,10915833,
  36399554,37268732,38692401,9466830,5716700,36600030,4845169,33335064,
  35972905,35972497,34352895,30687839,4091553,28052048,7892734,19432720,
  16254652,35254689,36326071,3780089,35259090,35972910,6010303,6010307,
  30687837,6756532,32537462,37652207,32537469,
];

// ── TAM R2 URL LİSTESİ (her kayıt = 1 video + 1 poster) ──
export const HURMA_URLS: string[] = HURMA_IDS.map((id) => `${R2}/videos/hurma/${id}.mp4`);
export const HURMA_POSTER_URLS: string[] = HURMA_IDS.map((id) => `${R2}/posters/hurma/${id}.jpg`);

/** Uygulamanın kullandığı satır biçimi: [pexelsId, fps, uhd, etiket] */
export const HURMA_DATA: Row[] = HURMA_IDS.map((id, i) => [
  id,
  30,
  true,
  "Hurma " + (ROMAN[i + 1] ?? "R" + (i + 1)),
]);

/** AI arama anahtar kelimeleri */
export const HURMA_AI_KEYWORDS = "hurma palmiye kuru tarih rızık";
