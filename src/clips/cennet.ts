// ════════════════════════════════════════════════════════
// cennet.ts — R2 CDN gerçek video/poster kütüphanesi
// Kategori: Cennet — 50 video (Cloudflare R2'de birebir doğrulanmış)
// ════════════════════════════════════════════════════════

import type { Row } from "../clips-data";

/** R2 özel domain — tüm URL'ler bu kökten üretilir ve buraya YAZILIR */
const R2 = "https://cdn.nurstudyo.com";

const ROMAN = ["","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI","XXII","XXIII","XXIV","XXV","XXVI","XXVII","XXVIII","XXIX","XXX","XXXI","XXXII","XXXIII","XXXIV","XXXV","XXXVI","XXXVII","XXXVIII","XXXIX","XL","XLI","XLII","XLIII","XLIV","XLV","XLVI","XLVII","XLVIII","XLIX","L","LI","LII","LIII","LIV","LV","LVI","LVII","LVIII","LIX","LX","LXI","LXII","LXIII","LXIV","LXV","LXVI","LXVII","LXVIII","LXIX","LXX","LXXI","LXXII","LXXIII","LXXIV","LXXV","LXXVI","LXXVII","LXXVIII","LXXIX","LXXX","LXXXI","LXXXII","LXXXIII","LXXXIV","LXXXV","LXXXVI","LXXXVII","LXXXVIII","LXXXIX","XC"];

/** cennet kategorisinin R2'deki gerçek Pexels dosya kimlikleri */
const CENNET_IDS = [
  17367728,3916038,36271612,34081971,25541489,3690677,3251840,19018175,
  34523926,35186941,38270380,36263387,30093035,32826988,4929837,8514980,
  5663227,7013838,5011461,10357936,29187349,30348065,7013545,6923705,
  6508747,10980577,855572,7035316,12955151,3037984,30347295,15773408,
  856030,3892287,4618449,1307894,6473351,13068256,7456744,3139023,
  12815789,38270293,6520310,3009535,32791475,38638190,17211831,35082941,
  35968101,37499724,
];

// ── TAM R2 URL LİSTESİ (her kayıt = 1 video + 1 poster) ──
export const CENNET_URLS: string[] = CENNET_IDS.map((id) => `${R2}/videos/cennet/${id}.mp4`);
export const CENNET_POSTER_URLS: string[] = CENNET_IDS.map((id) => `${R2}/posters/cennet/${id}.jpg`);

/** Uygulamanın kullandığı satır biçimi: [pexelsId, fps, uhd, etiket] */
export const CENNET_DATA: Row[] = CENNET_IDS.map((id, i) => [
  id,
  30,
  true,
  "Cennet " + (ROMAN[i + 1] ?? "R" + (i + 1)),
]);

/** AI arama anahtar kelimeleri */
export const CENNET_AI_KEYWORDS = "cennet bahçe cemal nur";
