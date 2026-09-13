// ════════════════════════════════════════════════════════
// daglar.ts — R2 CDN gerçek video/poster kütüphanesi
// Kategori: Dağ — 49 video (Cloudflare R2'de birebir doğrulanmış)
// ════════════════════════════════════════════════════════

import type { Row } from "../clips-data";

/** R2 özel domain — tüm URL'ler bu kökten üretilir ve buraya YAZILIR */
const R2 = "https://cdn.nurstudyo.com";

const ROMAN = ["","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI","XXII","XXIII","XXIV","XXV","XXVI","XXVII","XXVIII","XXIX","XXX","XXXI","XXXII","XXXIII","XXXIV","XXXV","XXXVI","XXXVII","XXXVIII","XXXIX","XL","XLI","XLII","XLIII","XLIV","XLV","XLVI","XLVII","XLVIII","XLIX","L","LI","LII","LIII","LIV","LV","LVI","LVII","LVIII","LIX","LX","LXI","LXII","LXIII","LXIV","LXV","LXVI","LXVII","LXVIII","LXIX","LXX","LXXI","LXXII","LXXIII","LXXIV","LXXV","LXXVI","LXXVII","LXXVIII","LXXIX","LXXX","LXXXI","LXXXII","LXXXIII","LXXXIV","LXXXV","LXXXVI","LXXXVII","LXXXVIII","LXXXIX","XC"];

/** daglar kategorisinin R2'deki gerçek Pexels dosya kimlikleri */
const DAGLAR_IDS = [
  32045863,29443420,11494523,4763085,35742080,35655933,11449150,6650215,
  5700535,32045933,34532365,35741880,18757923,27872156,6693764,16562834,
  35632406,28891493,13883796,28891490,19146803,37609572,34505196,34798290,
  36690240,37329538,8761038,11273071,30849291,8189761,28638515,3217373,
  1439950,10267216,19859606,16707745,7593620,10178127,35741877,37984254,
  37984247,8761173,12612370,17855449,36633320,37014696,10070444,20583716,
  27658737,
];

// ── TAM R2 URL LİSTESİ (her kayıt = 1 video + 1 poster) ──
export const DAGLAR_URLS: string[] = DAGLAR_IDS.map((id) => `${R2}/videos/daglar/${id}.mp4`);
export const DAGLAR_POSTER_URLS: string[] = DAGLAR_IDS.map((id) => `${R2}/posters/daglar/${id}.jpg`);

/** Uygulamanın kullandığı satır biçimi: [pexelsId, fps, uhd, etiket] */
export const DAGLAR_DATA: Row[] = DAGLAR_IDS.map((id, i) => [
  id,
  30,
  true,
  "Dağ " + (ROMAN[i + 1] ?? "R" + (i + 1)),
]);

/** AI arama anahtar kelimeleri */
export const DAGLAR_AI_KEYWORDS = "dağ zirve tepe manzara kar";
