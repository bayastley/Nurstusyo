// Statik sure açıklamalarını tek bir API altında birleştirir.
import { SURAH_DESCRIPTIONS_PART_1 } from "./surahDescriptionsDataPart1";
import { SURAH_DESCRIPTIONS_PART_2 } from "./surahDescriptionsDataPart2";
import { SURAH_DESCRIPTIONS_PART_3 } from "./surahDescriptionsDataPart3";

export const SURAH_DESCRIPTIONS: Record<number, string[]> = {
  ...SURAH_DESCRIPTIONS_PART_1,
  ...SURAH_DESCRIPTIONS_PART_2,
  ...SURAH_DESCRIPTIONS_PART_3,
};
