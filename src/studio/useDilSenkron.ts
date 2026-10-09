// ════════════════════════════════════════════════════════
// USEDILSENKRON.TS — StudioApp'tan taşındı (SRP adım 11, 09.10 2. tur)
// Dil değişimindeki 3 efekti tek hook toplar: (1) meal-dil senkronu (seçili
//   ayet mealleri yeni edition'dan çekilir), (2) paylaşım metni dili (başlık +
//   açıklama + hashtag havuzu), (3) RTL mirror (ar/ur → body nur-rtl).
//   DAVRANIŞ BİREBİR AYNIDIR — (1) ve (2) ilk mount'ta koşmaz (prevLangRef).
// ════════════════════════════════════════════════════════

import { useEffect, useRef } from "react";
import { MEAL_EDITIONS, type Lang } from "../i18n";
import { fetchSurah } from "./studioHelpers";
import { genDesc, genTitle } from "../data";
import type { SelectedAyah } from "../types";

export interface UseDilSenkronParams {
  lang: Lang;
  notify: (msg: string) => void;
  t: (k: string) => string;
  /** Yalnız okunur güncel seçim — tetik anındaki snapshot için ref'ten alınır */
  selectedRef: { current: SelectedAyah[] };
  setSelected: React.Dispatch<React.SetStateAction<SelectedAyah[]>>;
  reciterName: string;
  setShareTitle: React.Dispatch<React.SetStateAction<string>>;
  setShareDescription: React.Dispatch<React.SetStateAction<string>>;
  setVisibleTags: (tags: string[]) => void;
  /** Güncel ayet bilgisini paylaşım metnine yazmak için (modal'da verseIndexRef) */
  verseIndexRef: { current: number };
  pickRandomTags: (count?: number, avoid?: string[]) => string[];
}

export function useDilSenkron(p: UseDilSenkronParams): void {
  const { lang, notify } = p;

  const prevMealLangRef = useRef(lang);
  // ★ MEAL-DİLİ SENKRONU (01.10) — ilk mount'ta koşmaz.
  useEffect(() => {
    const onceki = prevMealLangRef.current;
    prevMealLangRef.current = lang;
    if (onceki === lang) return;
    const sureler = [...new Set(p.selectedRef.current.map((x) => x.s))];
    if (!sureler.length) return;
    const edition = MEAL_EDITIONS[lang];
    let iptal = false;
    void (async () => {
      const sonuclar = await Promise.all(sureler.map(async (sn) => {
        try { return [sn, await fetchSurah(sn, edition)] as const; } catch { return [sn, null] as const; }
      }));
      if (iptal) return;
      p.setSelected((current) => current.map((x) => {
        const satir = sonuclar.find(([sn, rows]) => sn === x.s && rows && rows[x.a - 1]);
        if (!satir || !satir[1]) return x;
        return { ...x, tr: satir[1][x.a - 1].tr };
      }));
      const basarili = sonuclar.filter(([, rows]) => rows).length;
      if (basarili === sonuclar.length) notify(p.t("mlSenkronTamam").replace("{edition}", edition));
      else notify(p.t("mlSenkronKismi").replace("{basarili}", String(basarili)).replace("{toplam}", String(sonuclar.length)));
    })();
    return () => { iptal = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, notify]);

  const prevPaylasLangRef = useRef(lang);
  // ★ PAYLAŞIM METNİ DİL SENKRONU (04.10) — ilk mount'ta koşmaz.
  //   Seçili ayet varsa o ayetin bilgisiyle üretilir; yoksa varsayılan Bakara 2:255.
  useEffect(() => {
    const onceki = prevPaylasLangRef.current;
    prevPaylasLangRef.current = lang;
    if (onceki === lang) return;
    const cur = p.selectedRef.current[p.verseIndexRef.current] ?? p.selectedRef.current[0];
    p.setShareTitle(genTitle(cur?.sName, cur?.s ?? 2, cur?.a ?? 255, lang, cur?.tr ?? ""));
    p.setShareDescription(genDesc(cur?.sName ?? "Bakara", cur?.s ?? 2, cur?.a ?? 255, p.reciterName, lang));
    p.setVisibleTags(p.pickRandomTags(14));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // ★ RTL DİLİ (01.10): ar/ur seçiliyse ana grid de sağdan sola akar — CSS logical
  //   mirror'ı flex/grid üzerinden çalışır; body'ye nur-rtl sınıfı düzeltmeler için.
  const rtlMi = lang === "ar" || lang === "ur";
  useEffect(() => {
    document.body.classList.toggle("nur-rtl", rtlMi);
    return () => document.body.classList.remove("nur-rtl");
  }, [rtlMi]);
}
