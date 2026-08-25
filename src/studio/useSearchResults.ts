import { useEffect, useState } from "react";
import { SURAHS } from "../data";
import { MEAL_EDITIONS, type Lang } from "../i18n";
import type { SearchHit } from "../types";
import { fetchJSON } from "./studioHelpers";

function normTr(value: string): string {
  return value.toLocaleLowerCase("tr").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function useSearchResults(query: string, lang: Lang) {
  const [results, setResults] = useState<SearchHit[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    const matchedSurahs = SURAHS.filter((surah) => normTr(surah.name).includes(normTr(trimmed))).slice(0, 10);
    if (matchedSurahs.length > 0) {
      setResults(matchedSurahs.map((surah) => ({ s: surah.n, a: 1, name: surah.name, tr: `${surah.count} ayet • Sure #${surah.n}` })));
      setSearching(false);
      return;
    }

    let live = true;
    setSearching(true);
    const timer = window.setTimeout(() => {
      fetchJSON(`https://api.alquran.cloud/v1/search/${encodeURIComponent(trimmed)}/all/${MEAL_EDITIONS[lang]}`)
        .then((json) => {
          if (!live) return;
          setResults((json.data?.matches ?? []).slice(0, 30).map((match: { surah: { number: number; englishName: string }; numberInSurah: number; text: string }) => ({
            s: match.surah.number,
            a: match.numberInSurah,
            name: SURAHS[match.surah.number - 1]?.name ?? match.surah.englishName,
            tr: match.text,
          })));
        })
        .catch(() => { if (live) setResults([]); })
        .finally(() => { if (live) setSearching(false); });
    }, 420);

    return () => {
      live = false;
      window.clearTimeout(timer);
    };
  }, [query, lang]);

  return { results, searching };
}