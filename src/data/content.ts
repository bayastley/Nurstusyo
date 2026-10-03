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
// ★ MEAL_FIXES (02.10): boş tablo yerine gerçek Diyanet yaması — ../meal_fixes.ts
//   (Meryem 19'ün çöp satırları api.alquran.cloud tr.diyanet'ten temiz veriyle yenilendi).
export { MEAL_FIXES, mealDuzelt } from "../meal_fixes";
