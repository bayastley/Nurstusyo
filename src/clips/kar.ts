// ════════════════════════════════════════════════════════
// kar.ts — R2 CDN gerçek video/poster kütüphanesi
// Kategori: Kar — 49 video (Cloudflare R2'de birebir doğrulanmış)
// ════════════════════════════════════════════════════════

import type { Row } from "../clips-data";

/** R2 özel domain — tüm URL'ler bu kökten üretilir ve buraya YAZILIR */
const R2 = "https://cdn.nurstudyo.com";

const ROMAN = ["","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI","XXII","XXIII","XXIV","XXV","XXVI","XXVII","XXVIII","XXIX","XXX","XXXI","XXXII","XXXIII","XXXIV","XXXV","XXXVI","XXXVII","XXXVIII","XXXIX","XL","XLI","XLII","XLIII","XLIV","XLV","XLVI","XLVII","XLVIII","XLIX","L","LI","LII","LIII","LIV","LV","LVI","LVII","LVIII","LIX","LX","LXI","LXII","LXIII","LXIV","LXV","LXVI","LXVII","LXVIII","LXIX","LXX","LXXI","LXXII","LXXIII","LXXIV","LXXV","LXXVI","LXXVII","LXXVIII","LXXIX","LXXX","LXXXI","LXXXII","LXXXIII","LXXXIV","LXXXV","LXXXVI","LXXXVII","LXXXVIII","LXXXIX","XC"];

/** kar kategorisinin R2'deki gerçek Pexels dosya kimlikleri */
const KAR_IDS = [
  35548240,36240155,31072013,20274537,7106531,6532471,7141985,6419340,
  10555487,19440438,30164835,38682192,19493781,7154937,15907914,6512893,
  853996,11081181,35548239,11554144,20663726,6085804,36065987,6650190,
  6615692,2312663,35519148,35857102,6824067,10161606,10495242,9870952,
  35518416,35550454,36204159,31381779,6570683,35890114,6613064,35558770,
  35968578,11066247,20241441,10852390,35996641,20256100,6615680,35518769,
  29808872,
];

// ── TAM R2 URL LİSTESİ (her kayıt = 1 video + 1 poster) ──
export const KAR_URLS: string[] = KAR_IDS.map((id) => `${R2}/videos/kar/${id}.mp4`);
export const KAR_POSTER_URLS: string[] = KAR_IDS.map((id) => `${R2}/posters/kar/${id}.jpg`);

/** Uygulamanın kullandığı satır biçimi: [pexelsId, fps, uhd, etiket] */
export const KAR_DATA: Row[] = KAR_IDS.map((id, i) => [
  id,
  30,
  true,
  "Kar " + (ROMAN[i + 1] ?? "R" + (i + 1)),
]);

/** AI arama anahtar kelimeleri */
export const KAR_AI_KEYWORDS = "kar kış buz soğuk";
