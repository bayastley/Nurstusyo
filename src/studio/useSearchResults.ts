import { useEffect, useState } from "react";
import { SURAHS } from "../data";
import { MEAL_EDITIONS, type Lang } from "../i18n";
// ★ 29.10 SURE ADI 5 DİLDE (kullanıcı emri): arama + sonuç adları seçili dile döner
import { sureAdGorunum as sureAdX2910 } from "../data/surelerCokDil";
import { translate } from "../i18n";
import type { SearchHit } from "../types";
import { fetchJSON, quranUrl } from "./studioHelpers";

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

    const sureDili = lang;
    const matchedSurahs = SURAHS.filter((surah) => normTr(surah.name).includes(normTr(trimmed))).slice(0, 10);
    if (matchedSurahs.length > 0) {
      setResults(matchedSurahs.map((surah) => ({ s: surah.n, a: 1, name: sureAdX2910(surah.n, surah.name, sureDili), tr: `${sureAdX2910(surah.n, surah.name, sureDili)} • ${translate(lang, "usSureN").replace("{n}", String(surah.n))}` })));
      setSearching(false);
      return;
    }

    let live = true;
    setSearching(true);
    const timer = window.setTimeout(() => {
      fetchJSON(quranUrl(`v1/search/${encodeURIComponent(trimmed)}/all/${MEAL_EDITIONS[lang]}`))
        .then((json) => {
          if (!live) return;
          setResults((json.data?.matches ?? []).slice(0, 30).map((match: { surah: { number: number; englishName: string }; numberInSurah: number; text: string }) => ({
            s: match.surah.number,
            a: match.numberInSurah,
            name: sureAdX2910(match.surah.number, SURAHS[match.surah.number - 1]?.name ?? match.surah.englishName, sureDili),
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