// ════════════════════════════════════════════════════════
// surahDescriptions.ts — getSurahDescription fonksiyonu
// Veriler surahDescriptionsData.ts'ten import ediliyor (parçalama)
// ════════════════════════════════════════════════════════

import { SURAH_DESCRIPTIONS } from "./surahDescriptionsData";

/**
 * Sure numarasına göre özel paragraf döndür.
 * 114 surenin tamamı kapsanır.
 * Bulunamazsa null döner (fallback kullanılır).
 */
export function getSurahDescription(surahNo: number): string | null {
  const arr = SURAH_DESCRIPTIONS[surahNo];
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}
