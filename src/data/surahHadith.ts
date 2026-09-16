// ══════════════════════════════════════════════════════════════
// surahHadith.ts — BÜTÜN 114 SURE için sahih hadis / tarihî bilgi
// Kaynaklar: Buhârî, Müslim, Tirmizî, Nesâî, İbn Mâce, Ahmed,
// İbn Hibbân, Hâkim (Müstedrek), Beyhakî, Dârimî
// Kurallar: Sadece sahih/hasen kaynaklı rivâyetler; hadis yoksa
// surenin nüzûl/özellik bilgisi (tefsir kaynaklarından) kullanılır,
// uydurma yok.
// ══════════════════════════════════════════════════════════════

// 114 girdilik veri 3 parçaya bölündü (içerik bayt-bayt aynı):
//   part1 → 1-38 · part2 → 39-76 · part3 → 77-114
import { SURAH_HADITH_P1 } from "./surahHadith.part1";
import { SURAH_HADITH_P2 } from "./surahHadith.part2";
import { SURAH_HADITH_P3 } from "./surahHadith.part3";

import type { SurahHadith } from "./surahHadith.types";

export type { SurahHadith } from "./surahHadith.types";

export const SURAH_HADITH: Record<number, SurahHadith> = {
  ...SURAH_HADITH_P1,
  ...SURAH_HADITH_P2,
  ...SURAH_HADITH_P3,
};

/** Sureye özel sahih hadis — yoksa null döner (çağıran genel metne düşer) */
export function getSurahHadith(surahNo: number): SurahHadith | null {
  return SURAH_HADITH[surahNo] ?? null;
}
