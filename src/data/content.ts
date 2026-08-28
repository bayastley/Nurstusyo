// ════════════════════════════════════════════════════════
// content.ts — Veriler artık ayrı dosyalarda, burası sadece re-export yapıyor
// ════════════════════════════════════════════════════════

// Yeni dosyalardan import et
export { KISSAS } from "./kissas";
export type { Kissa } from "./kissas";

export { TURKISH_CITIES } from "./cities";

export { HASHTAG_CATEGORIES, HASHTAG_POOL, randomHashtagCombo } from "./hashtags";

export { TITLE_TEMPLATES, genTitle, genDesc } from "./titleTemplates";

// Eski yerlerden de export et (bazı dosyalar direkt content'ten import ediyor)
export const MEAL_FIXES: Record<number, string[]> = {};
