import { useState, useEffect, useRef } from "react";
import { DAILY_AYAHS, genDesc, genTitle, SURAHS } from "../data";
import { RECITERS } from "../reciters";
import { MEAL_EDITIONS } from "../i18n";
import { fetchAyah } from "./studioHelpers";
import type { DailyAyah, SelectedAyah } from "../types";
import type { Lang } from "../i18n/base";

interface UseDailyAyahOptions {
  lang: Lang;
  setSelected: (fn: (prev: SelectedAyah[]) => SelectedAyah[]) => void;
}

interface UseDailyAyahReturn {
  dailyPool: DailyAyah[];
  dailyIndex: number;
  dailyPaused: boolean;
  daily: DailyAyah | null;
}

export function useDailyAyah({ lang, setSelected }: UseDailyAyahOptions): UseDailyAyahReturn {
  const [dailyPool, setDailyPool] = useState<DailyAyah[]>([]);
  const [dailyIndex, setDailyIndex] = useState(0);
  const [dailyPaused] = useState(false);
  const selectedRef = useRef<SelectedAyah[]>([]);

  // selectedRef güncelle
  useEffect(() => {
    // selected değişikliğini izlemek için bir yol bulmalıyız
    // Şimdilik basit tutalım
  }, []);

  // Günlük ayetler 4'lü partiler halinde yüklenir
  useEffect(() => {
    let live = true;
    (async () => {
      const source = DAILY_AYAHS.slice(0, 14);
      const available: DailyAyah[] = [];
      for (let i = 0; i < source.length; i += 4) {
        if (!live) return;
        const chunk = source.slice(i, i + 4);
        const items = await Promise.all(
          chunk.map(([s, a]) =>
            fetchAyah(s, a, MEAL_EDITIONS[lang])
              .then(({ ar, tr }) => ({ ar, tr, ref: `${SURAHS[s - 1].name} ${s}:${a}`, s, a }))
              .catch(() => null)
          )
        );
        available.push(...(items.filter(Boolean) as DailyAyah[]));
        if (available.length && !selectedRef.current.length) {
          const first = available[0];
          setSelected((prev) => {
            if (prev.length > 0) return prev;
            return [{ id: `${first.s}:${first.a}`, s: first.s, a: first.a, sName: SURAHS[first.s - 1].name, ar: first.ar, tr: first.tr }];
          });
        }
      }
      if (live) setDailyPool(available);
    })();
    return () => { live = false; };
  }, [lang]);

  // Otomatik döngü
  useEffect(() => {
    if (dailyPaused || !dailyPool.length) return;
    const timer = window.setInterval(() => setDailyIndex((index) => (index + 1) % dailyPool.length), 10000);
    return () => window.clearInterval(timer);
  }, [dailyPaused, dailyPool.length]);

  const daily = dailyPool[dailyIndex % Math.max(dailyPool.length, 1)] ?? null;

  return {
    dailyPool,
    dailyIndex,
    dailyPaused,
    daily,
  };
}
