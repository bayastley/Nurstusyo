// ════════════════════════════════════════════════════════
// USEAYETSECIM.TS — StudioApp'ten taşındı (SRP parçalama, 09.10)
// Ayet seçim motoru: addAyah (tek/akıllı) + toggleAyah + addWholeSurah.
// Dışa açık imzası bileşendeki eski adlarla birebir aynıdır — JS İşlem_WHAT?
// ════════════════════════════════════════════════════════

import { useCallback, type Dispatch, type MutableRefObject, type SetStateAction } from "react";
import { SURAHS } from "../data";
import { fetchJSON, fetchAyah, fetchSurah, quranUrl, normalizeTurkishMeal } from "./studioHelpers";
import { MEAL_EDITIONS } from "../i18n";
import { ayetKategorisiBul, adminAyetKategorisiBul } from "./ayetKategori";
import { genDesc, genTitle } from "../data/titleTemplates";
import type { Clip } from "../clips";
import type { SelectedAyah } from "../types";
import type { Lang } from "../i18n";

export interface UseAyetSecimParams {
  notify: (msg: string) => void;
  t: (key: any) => string;
  lang: Lang;
  selectedRef: MutableRefObject<SelectedAyah[]>;
  setSelected: Dispatch<SetStateAction<SelectedAyah[]>>;
  setVerseIndex: Dispatch<SetStateAction<number>>;
  backgroundRef: MutableRefObject<Clip>;
  ayahBackgroundsRef: MutableRefObject<Record<string, Clip>>;
  verseIndexRef: MutableRefObject<number>;
  clipKindRef: MutableRefObject<"img" | "vid">;
  combinedAllClips: Clip[];
  reciterName: string;
  smartAiEnabled: boolean;
  setBackground: Dispatch<SetStateAction<Clip>>;
  setAyahBackgrounds: Dispatch<SetStateAction<Record<string, Clip>>>;
  setShareTitle: (v: string) => void;
  setShareDescription: (v: string) => void;
}

export function useAyetSecim(params: UseAyetSecimParams) {
  const {
    notify, t, lang, selectedRef, setSelected, setVerseIndex,
    backgroundRef, ayahBackgroundsRef, verseIndexRef, clipKindRef,
    combinedAllClips, reciterName, smartAiEnabled,
    setBackground, setAyahBackgrounds, setShareTitle, setShareDescription,
  } = params;

  // son hoş-geldin dil pozisyonunu bu modül tutar
  const detectCategoryFromAyah = ayetKategorisiBul;
  const detectAdminCategoryFromAyah = adminAyetKategorisiBul;

  const addAyah = useCallback(async (s: number, a: number, knownTranslation?: string) => {
    // ★ TAM TARAMA (29.09): a=0 guard — "Ayet Ekle" butonu ayet seçilmeden basılınca
    // Number("")=0 geliyordu → "Fâtiha 1:0" placeholder → 001000.mp3 404 → render crash.
    if (!Number.isInteger(s) || s < 1 || !Number.isInteger(a) || a < 1) { notify("⚠️ Önce sure ve ayet seç"); return; }
    const id = `${s}:${a}`;
    if (selectedRef.current.some((item) => item.id === id)) return;
    const meta = SURAHS[s - 1];
    // ★ Hemen seçili işaretle (optimistic update) — API beklemeden
    const placeholder = { id, s, a, sName: meta?.name ?? "", ar: "", tr: knownTranslation ?? t("loadingVerse") };
    setSelected((current) => [...current, placeholder]);
    setVerseIndex(selectedRef.current.length);
    try {
      let ar = "", tr = knownTranslation ? normalizeTurkishMeal(knownTranslation, MEAL_EDITIONS[lang]) : "";
      if (knownTranslation) { const json: any = await fetchJSON(quranUrl(`v1/ayah/${s}:${a}/quran-uthmani`)); ar = json?.data?.text ?? ""; }
      else { const loaded = await fetchAyah(s, a, MEAL_EDITIONS[lang]); ar = loaded.ar; tr = loaded.tr; }
      // ★ Placeholder'ı gerçek veriyle değiştir (boşsa bile güncelle — API çalışmıyorsa boş kalmasın)
      setSelected((current) => current.map((x) => x.id === id ? { ...x, ar: ar || x.ar, tr: tr || x.tr } : x));

      if (smartAiEnabled) {
        const wantKind = clipKindRef.current;
        const detectedCat = detectCategoryFromAyah(ar, tr, meta.name);
        let poolCat = combinedAllClips.filter((clip) => clip.cat === detectedCat && clip.kind === wantKind);
        if (poolCat.length === 0) {
          const adminCat = detectAdminCategoryFromAyah(ar, tr, meta.name);
          if (adminCat) poolCat = combinedAllClips.filter((clip) => clip.cat === adminCat && clip.kind === wantKind);
        }
        if (poolCat.length === 0) poolCat = combinedAllClips.filter((clip) => clip.cat === "musaf" && clip.kind === wantKind);
        if (poolCat.length === 0) poolCat = combinedAllClips.filter((clip) => clip.kind === wantKind);
        if (poolCat.length) {
          const chosen = poolCat[Math.floor(Math.random() * poolCat.length)];
          // ★ KULLANICI MEDYASI KUTSAL (30.09)
          if (backgroundRef.current?.cat === "yuklenenler") {
            setAyahBackgrounds((current) => ({ ...current, [id]: backgroundRef.current }));
          } else {
            setAyahBackgrounds((current) => ({ ...current, [id]: chosen }));
            if (verseIndexRef.current === selectedRef.current.length) { setBackground(chosen); }
          }
        }
      }

      if (!ayahBackgroundsRef.current[id]) {
        const anaArkaPlan = backgroundRef.current;
        if (anaArkaPlan?.cat === "yuklenenler") {
          setAyahBackgrounds((current) => ({ ...current, [id]: anaArkaPlan }));
        } else {
          const kullaniciKlipleri = combinedAllClips.filter((clip) => clip.cat === "yuklenenler" && clip.kind === clipKindRef.current);
          const quranClips = kullaniciKlipleri.length
            ? kullaniciKlipleri
            : combinedAllClips.filter((clip) => clip.cat === "musaf" && clip.kind === clipKindRef.current);
          if (quranClips.length) setAyahBackgrounds((current) => ({ ...current, [id]: quranClips[Math.floor(Math.random() * quranClips.length)] }));
        }
      }
      setVerseIndex(selectedRef.current.length); setShareTitle(genTitle(meta.name, s, a, lang, tr)); setShareDescription(genDesc(meta.name, s, a, reciterName, lang)); notify(t("ssAyetEklendi").replace("{name}", meta.name).replace("{s}", String(s)).replace("{a}", String(a)));
    } catch (e) {
      console.error("[addAyah] fetch hatası:", e);
      // ★ HATA: Placeholder'ı listeden çıkar
      setSelected((current) => current.filter((x) => x.id !== id));
      notify(t("renderAuthError"));
    }
  }, [lang, notify, t, reciterName, smartAiEnabled, combinedAllClips, selectedRef, setSelected, setVerseIndex, setShareTitle, setShareDescription, backgroundRef, ayahBackgroundsRef, verseIndexRef, setBackground]);

  const toggleAyah = useCallback((s: number, a: number, knownTranslation?: string) => {
    const id = `${s}:${a}`;
    if (selectedRef.current.some((item) => item.id === id)) {
      setSelected((current) => current.filter((item) => item.id !== id));
      setVerseIndex((current) => Math.max(0, Math.min(current, Math.max(0, selectedRef.current.length - 2))));
      setAyahBackgrounds((current) => { const next = { ...current }; delete next[id]; return next; });
      return;
    }
    void addAyah(s, a, knownTranslation);
  }, [addAyah, selectedRef, setSelected, setVerseIndex]);

  const addWholeSurah = useCallback(async (surahNum?: number | string) => {
    const number = Number(surahNum);
    if (!number || number < 1) { notify("Önce bir sure seç"); return; }
    try { const rows = await fetchSurah(number, MEAL_EDITIONS[lang]), meta = SURAHS[number - 1]; const all = rows.map((row, index) => ({ id: `${number}:${index + 1}`, s: number, a: index + 1, sName: meta.name, ar: row.ar, tr: row.tr })); setSelected((current) => { const ids = new Set(current.map((item) => item.id)); return [...current, ...all.filter((item) => !ids.has(item.id))]; }); notify(`${meta.name} Suresi tamamı eklendi (${rows.length} ayet)`); }
    catch { notify(t("renderServerError")); }
  }, [t, lang, notify, setSelected]);
  // (max 1 parametrenin olması arayüzle uyumlu: addWholeSurah(surah string) — addChilder caller uyumlu)

  return { addAyah, toggleAyah, addWholeSurah };
}
