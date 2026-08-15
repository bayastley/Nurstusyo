import type { CatId } from "../clips";

const AESTHETIC_POOL: CatId[] = [
  "namaz",
  "yildizlar",
  "deniz",
  "daglar",
  "gunbatimi",
  "gece",
  "selale",
  "orman",
  "cicekler",
  "musaf",
];

function normTr(value: string): string {
  return value.toLocaleLowerCase("tr").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function detectCategoryFromAyahText(
  ar: string,
  tr: string,
  surahName: string,
  surahCategoryHint: Record<string, CatId>,
  keywordCategoryFallback: Record<string, CatId>,
): CatId {
  void ar;
  const surahKey = normTr(surahName);
  if (surahCategoryHint[surahKey]) return surahCategoryHint[surahKey];

  const words = normTr(`${surahName} ${tr}`).split(/[^a-zçğıöşüâîû]+/i).filter(Boolean);
  let matched: CatId | null = null;
  let bestLen = 0;

  for (const word of words) {
    for (const [keyword, cat] of Object.entries(keywordCategoryFallback)) {
      const kwNorm = normTr(keyword);
      const isMatch = kwNorm.length <= 3 ? word === kwNorm : word.startsWith(kwNorm) || word === kwNorm;
      if (isMatch && kwNorm.length > bestLen) {
        matched = cat;
        bestLen = kwNorm.length;
      }
    }
  }

  if (matched) return matched;

  // Eşleşme yoksa her zaman aynı kategoriye düşmesin; ayet metnine göre stabil dağıt.
  let h = 2166136261;
  const src = `${surahName}|${tr}`;
  for (let i = 0; i < src.length; i += 1) {
    h ^= src.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return AESTHETIC_POOL[(h >>> 0) % AESTHETIC_POOL.length];
}