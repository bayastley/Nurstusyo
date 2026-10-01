import { useState, useEffect, useRef } from "react";
import { DAILY_AYAHS, genDesc, genTitle, SURAHS } from "../data";
import { RECITERS } from "../reciters";
import { MEAL_EDITIONS } from "../i18n";
import { fetchAyah } from "./studioHelpers";
import type { DailyAyah, SelectedAyah } from "../types";
import type { Lang } from "../i18n/base";

interface UseDailyAyahOptions {
  lang: Lang;
  setSelected?: (fn: (prev: SelectedAyah[]) => SelectedAyah[]) => void;
}

interface UseDailyAyahReturn {
  dailyPool: DailyAyah[];
  dailyIndex: number;
  dailyPaused: boolean;
  daily: DailyAyah | null;
}

export function useDailyAyah({ lang }: UseDailyAyahOptions): UseDailyAyahReturn {
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
  // ★ TEKRAR DÖNGÜSÜ (01.10): API tamamen düşükse havuz boş kalıyor ve şerit "Yükleniyor… 0/-"
  //   donuyordu (kullanıcı vakası). Artık havuz boşsa backoff'lu (6→12→24 sn, tavan 60)
  //   yeniden dener — fetchAyah'ın 2. sağlayıcı yedeğiyle (quran.com) birlikte self-healing.
  useEffect(() => {
    let live = true;
    (async () => {
      const source = DAILY_AYAHS.slice(0, 14);
      let bekleme = 6000;
      while (live) {
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
          // ★ Otomatik ön seçim kaldırıldı: açılışta Fatiha 1 yerine hiçbir ayet seçili olmasın.
          //   Kullanıcı istediğini seçince selected dolacak.
        }
        if (available.length) {
          if (live) setDailyPool(available);
          return;
        }
        // havuz yine boş → API'ler düşük; backoff'la yeniden dene
        if (!live) return;
        await new Promise((r) => setTimeout(r, bekleme));
        bekleme = Math.min(bekleme * 2, 60000);
      }
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
