// ════════════════════════════════════════════════════════
// content.ts — Veriler artık ayrı dosyalarda, burası sadece re-export yapıyor
// ════════════════════════════════════════════════════════

// Yeni dosyalardan import et
export { KISSAS } from "./kissas";
export type { Kissa } from "./kissas";

export { TURKISH_CITIES, DUNYA_SEHIRLERI, dunyaSehriBul } from "./cities";
export type { SehirKayit } from "./cities";

export { HASHTAG_CATEGORIES, HASHTAG_POOL, hashtagPool, randomHashtagCombo } from "./hashtags";

export { TITLE_TEMPLATES, genTitle, genDesc } from "./titleTemplates";

// Eski yerlerden de export et (bazı dosyalar direkt content'ten import ediyor)
// ★ MEAL_FIXES KALDIRILDI (05.10): tablo API'nin bozuk tr.diyanet verisini (sure 19 birleşik
//   ayetler) aynen kopyalıyordu; yerini fetchSurahEditions'taki birleşme kapısı + yedek
//   edition zinciri aldı (tr.diyanet → tr.yazir → tr.vakfi).
