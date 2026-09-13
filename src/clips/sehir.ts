// ════════════════════════════════════════════════════════
// sehir.ts — R2 CDN gerçek video/poster kütüphanesi
// Kategori: Şehir — 50 video (Cloudflare R2'de birebir doğrulanmış)
// ════════════════════════════════════════════════════════

import type { Row } from "../clips-data";

/** R2 özel domain — tüm URL'ler bu kökten üretilir ve buraya YAZILIR */
const R2 = "https://cdn.nurstudyo.com";

const ROMAN = ["","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI","XXII","XXIII","XXIV","XXV","XXVI","XXVII","XXVIII","XXIX","XXX","XXXI","XXXII","XXXIII","XXXIV","XXXV","XXXVI","XXXVII","XXXVIII","XXXIX","XL","XLI","XLII","XLIII","XLIV","XLV","XLVI","XLVII","XLVIII","XLIX","L","LI","LII","LIII","LIV","LV","LVI","LVII","LVIII","LIX","LX","LXI","LXII","LXIII","LXIV","LXV","LXVI","LXVII","LXVIII","LXIX","LXX","LXXI","LXXII","LXXIII","LXXIV","LXXV","LXXVI","LXXVII","LXXVIII","LXXIX","LXXX","LXXXI","LXXXII","LXXXIII","LXXXIV","LXXXV","LXXXVI","LXXXVII","LXXXVIII","LXXXIX","XC"];

/** sehir kategorisinin R2'deki gerçek Pexels dosya kimlikleri */
const SEHIR_IDS = [
  34962045,30692203,35345603,31822001,35345598,37716487,38234014,8940772,
  38031807,37802625,36892796,35345666,38593622,37204184,29401379,25551992,
  15331024,19671347,37717589,19389777,35486685,38464829,13701719,37717586,
  33703980,7056651,35813233,17980079,37920018,16224290,37800288,34432938,
  20684428,28941863,35424780,38118221,19009052,34433049,35460568,17995284,
  36330770,18943732,37002151,37420111,30209847,12302396,38551285,34962046,
  37419492,37716478,
];

// ── TAM R2 URL LİSTESİ (her kayıt = 1 video + 1 poster) ──
export const SEHIR_URLS: string[] = SEHIR_IDS.map((id) => `${R2}/videos/sehir/${id}.mp4`);
export const SEHIR_POSTER_URLS: string[] = SEHIR_IDS.map((id) => `${R2}/posters/sehir/${id}.jpg`);

/** Uygulamanın kullandığı satır biçimi: [pexelsId, fps, uhd, etiket] */
export const SEHIR_DATA: Row[] = SEHIR_IDS.map((id, i) => [
  id,
  30,
  true,
  "Şehir " + (ROMAN[i + 1] ?? "R" + (i + 1)),
]);

/** AI arama anahtar kelimeleri */
export const SEHIR_AI_KEYWORDS = "şehir bina gece ışıklar";
