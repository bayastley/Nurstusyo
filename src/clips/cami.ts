// ════════════════════════════════════════════════════════
// cami.ts — R2 CDN gerçek video/poster kütüphanesi
// Kategori: Cami — 50 video (Cloudflare R2'de birebir doğrulanmış)
// ════════════════════════════════════════════════════════

import type { Row } from "../clips-data";

/** R2 özel domain — tüm URL'ler bu kökten üretilir ve buraya YAZILIR */
const R2 = "https://cdn.nurstudyo.com";

const ROMAN = ["","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI","XXII","XXIII","XXIV","XXV","XXVI","XXVII","XXVIII","XXIX","XXX","XXXI","XXXII","XXXIII","XXXIV","XXXV","XXXVI","XXXVII","XXXVIII","XXXIX","XL","XLI","XLII","XLIII","XLIV","XLV","XLVI","XLVII","XLVIII","XLIX","L","LI","LII","LIII","LIV","LV","LVI","LVII","LVIII","LIX","LX","LXI","LXII","LXIII","LXIV","LXV","LXVI","LXVII","LXVIII","LXIX","LXX","LXXI","LXXII","LXXIII","LXXIV","LXXV","LXXVI","LXXVII","LXXVIII","LXXIX","LXXX","LXXXI","LXXXII","LXXXIII","LXXXIV","LXXXV","LXXXVI","LXXXVII","LXXXVIII","LXXXIX","XC"];

/** cami kategorisinin R2'deki gerçek Pexels dosya kimlikleri */
const CAMI_IDS = [
  37662251,36192723,31717823,34712372,31197788,35081857,35081860,35081873,
  36178659,35081854,35081870,36190791,20357855,36190790,36192728,35489216,
  30567547,10783644,36178460,20347209,34800248,36192725,36178467,10844827,
  35081858,16192401,20671535,35081865,36190780,35098702,34712371,34800576,
  36190786,10724507,34800573,11596886,35081861,20347205,36177743,34632951,
  10779965,10786003,34712374,35098709,19819594,15816542,34883358,8488768,
  36178468,3309014,
];

// ── TAM R2 URL LİSTESİ (her kayıt = 1 video + 1 poster) ──
export const CAMI_URLS: string[] = CAMI_IDS.map((id) => `${R2}/videos/cami/${id}.mp4`);
export const CAMI_POSTER_URLS: string[] = CAMI_IDS.map((id) => `${R2}/posters/cami/${id}.jpg`);

/** Uygulamanın kullandığı satır biçimi: [pexelsId, fps, uhd, etiket] */
export const CAMI_DATA: Row[] = CAMI_IDS.map((id, i) => [
  id,
  30,
  true,
  "Cami " + (ROMAN[i + 1] ?? "R" + (i + 1)),
]);

/** AI arama anahtar kelimeleri */
export const CAMI_AI_KEYWORDS = "cami mescid minare kubbe";
