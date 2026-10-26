// ════════════════════════════════════════════════════════
// USESTUDIOARKAPLANBAG.TS — StudioApp parçalama turu (25.10):
// ayet→kategori + seçim motoru + atmosfer atama/zar/Akıllı AI + kütüphane
// filtre + kâri önizleme + hoca video indirme. Birebir taşınma (davranış aynı).
// ════════════════════════════════════════════════════════
import { useCallback, useMemo, useRef, useState } from "react";
// ★ 26.10 I18N KÖPRÜSÜ: oturumun dilini her çağrıda okur
const dilX2610 = (): string => typeof localStorage !== "undefined" ? (localStorage.getItem("nur_lang") || "tr") : "tr";
const ttX2610 = (k: string): string => translate(dilX2610(), k);
import { ayetKategorisiBul, adminAyetKategorisiBul } from "./ayetKategori";
import { akilliKlipSec } from "./atmosferBag";
import { adminCatUsable } from "../adminCategoryAccess";
import { CATEGORIES, ATMOSPHERE_PREVIEW_UNLOCKED, KATEGORI_TIER, FREE_VIDEOS_PER_CATEGORY, type CatId, type Clip } from "../clips";
import { atmosKategoriAdGorunum } from "../data/kategoriCokDil"; // ★ 26.10: kategori adı 5 dil
import { LIBRARY_ITEMS, type LibraryItem, type Emotion } from "../dualar";
import { kutuphaneItem } from "../data/kutuphaneCokDil";
import type { SelectedAyah } from "../types";
import type { ModalName } from "../types";
import { translate, type Lang } from "../i18n";
import { tierAtLeast } from "../tier";
import type { Tier } from "../tier";
import { RECITERS, sesKaynakZinciri } from "../reciters";
import { kuyrukIndir } from "../components/seslendirmeIndir";
import { getVideoUrlSync, getPosterUrlSync } from "../videoUrl";
import { useAyetSecim } from "./useAyetSecim";
import { useReciterPreview } from "./useReciterPreview";


interface ArkaPlanBagParam {
  notify: (m: string) => void;
  t: (key: string) => string;
  lang: Lang;
  isMasterSürüm: boolean;
  accessTier: Tier;
  reciter: typeof RECITERS[number];
  clipKind: "img" | "vid";
  smartAiEnabled: boolean;
  selected: SelectedAyah[];
  setSelected: React.Dispatch<React.SetStateAction<SelectedAyah[]>>;
  setVerseIndex: React.Dispatch<React.SetStateAction<number>>;
  setModal: (m: ModalName) => void;
  combinedAllClips: Clip[];
  libType: string;
  libEmotion: Emotion | "tum";
  libSearch: string;
  previewReciterId: string | null;
  setPreviewReciterId: React.Dispatch<React.SetStateAction<string | null>>;
  silenceAllAudio: () => void;
  ensureImage: (url: string) => HTMLImageElement;
  ensureVideo: (url: string, fallbackUrl?: string) => HTMLVideoElement;
  setBackground: React.Dispatch<React.SetStateAction<Clip>>;
  setAyahBackgrounds: React.Dispatch<React.SetStateAction<Record<string, Clip>>>;
  setShareTitle: React.Dispatch<React.SetStateAction<string>>;
  setShareDescription: React.Dispatch<React.SetStateAction<string>>;
  backgroundRef: React.MutableRefObject<Clip>;
  ayahBackgroundsRef: React.MutableRefObject<Record<string, Clip>>;
  selectedRef: React.MutableRefObject<SelectedAyah[]>;
  verseIndexRef: React.MutableRefObject<number>;
  clipKindRef: React.MutableRefObject<"img" | "vid">;
  smartAiEnabledRef: React.MutableRefObject<boolean>;
  isClipAccessibleRef: React.MutableRefObject<(clip: Clip) => boolean>;
  reciterPreviewRef: React.MutableRefObject<HTMLAudioElement | null>;
  previewTimerRef: React.MutableRefObject<number>;
}

/** StudioApp atmosfer/kütüphane/yönlendirme kancası — parçalama turu (25.10). */
export function useStudioArkaPlanBag(p: ArkaPlanBagParam) {
  const {
    notify, t, lang, isMasterSürüm, accessTier, reciter, clipKind, smartAiEnabled,
    selected, setSelected, setVerseIndex, setModal, combinedAllClips,
    libType, libEmotion, libSearch, previewReciterId, setPreviewReciterId, silenceAllAudio,
    setBackground, setAyahBackgrounds, setShareTitle, setShareDescription,
    backgroundRef, ayahBackgroundsRef, selectedRef, verseIndexRef, clipKindRef,
    smartAiEnabledRef, isClipAccessibleRef, reciterPreviewRef, previewTimerRef,
  } = p;
  const detectCategoryFromAyah = ayetKategorisiBul;
  const detectAdminCategoryFromAyah = adminAyetKategorisiBul; // ★ (useAyetSecim dışındaki reassign/applySmart için tekrar tanımlık)
  // ★ AYET SEÇİM MOTORU — studio/useAyetSecim.ts'e taşındı (SRP parçalama, 09.10):
  //   addAyah (akıllı AI + optimistic update + kullanıcı medyası kuralı) +
  //   toggleAyah + addWholeSurah hook içinde; dışa açık imza aynı.
  const { addAyah, toggleAyah, addWholeSurah } = useAyetSecim({
    notify, t, lang, selectedRef, setSelected, setVerseIndex,
    backgroundRef, ayahBackgroundsRef, verseIndexRef, clipKindRef,
    combinedAllClips, reciterName: reciter.name, smartAiEnabled,
    setBackground, setAyahBackgrounds, setShareTitle, setShareDescription,
  });
  // ★ 23.10: modal içi sure seçimi — seçimi seçilen surenin tamamına çevirir (tek sure şart)
  //   (addWholeSurah'tan sonra tanımlı: bağımlılık dizisi anında değerlendirilir — TDZ)
  const kendiSesSureEkle = useCallback(async (s: number) => {
    setSelected((current) => current.filter((x) => x.s === s));
    await addWholeSurah(s);
  }, [setSelected, addWholeSurah]);
  // ★ SEKME DEĞİŞİMİ (Şablon V2 ↔ Hareketli) — zaten atanmış ayet arka planlarını
  //   yeni türe (img/vid) yeniden atar. Eski davranışta sadece ana arka plan
  //   randomClip ile değişiyordu; ayet kayıtları eski türemiş gibi kalıyor, üretim
  //   o yüzden Şablon V2 seçiliyken bile HAREKETLİ video basıyordu.
  const reassignBackgroundsForKind = useCallback((kind: "img" | "vid") => {
    const items = selectedRef.current;
    if (!items.length) return;
    // ★ KULLANICI MEDYASI KUTSAL (30.09): "Yüklediklerim"e atanmış slotlar sekme
    //   değişiminde ASLA ezilmez — yalnız diğerleri yeniden atanır.
    const korunacak = Object.entries(ayahBackgroundsRef.current)
      .filter(([, clip]) => clip.cat === "yuklenenler")
      .map(([id]) => id);
    const duzenlecekler = items.filter((item) => !korunacak.includes(item.id));
    const next: Record<string, Clip> = {};
    items.forEach((item) => {
      if (korunacak.includes(item.id)) next[item.id] = ayahBackgroundsRef.current[item.id];
    });
    if (!duzenlecekler.length) { notify(ttX2610("sbYuklenenKorundu")); return; }
    if (smartAiEnabledRef.current) {
      // Akıllı AI açıksa: her ayete yeni türde tematik sahne (★ 16.10 torba tekrarsız dağıtıyor)
      duzenlecekler.forEach((item) => {
        const detectedCat = detectCategoryFromAyah(item.ar, item.tr, item.sName);
        let poolCat = combinedAllClips.filter((clip) => clip.cat === detectedCat && clip.kind === kind);
        if (poolCat.length === 0) {
          const adminCat = detectAdminCategoryFromAyah(item.ar, item.tr, item.sName);
          if (adminCat) poolCat = combinedAllClips.filter((clip) => clip.cat === adminCat && clip.kind === kind);
        }
        if (poolCat.length === 0) poolCat = combinedAllClips.filter((clip) => clip.cat === "musaf" && clip.kind === kind);
        if (poolCat.length === 0) poolCat = combinedAllClips.filter((clip) => clip.kind === kind);
        if (!poolCat.length) return;
        // ★ 16.10 DÖNEN TORBA: Math.random yerine — aynı klasör tam tur bitmedikçe aynı klip dönmez
        const chosen = akilliKlipSec(poolCat);
        if (chosen) next[item.id] = chosen;
      });
    } else {
      // Akıllı AI kapalıysa: yeni türden mushaf/nötr klip dağıt
      const pool = combinedAllClips.filter((clip) => clip.kind === kind && isClipAccessibleRef.current(clip));
      if (!pool.length) return;
      duzenlecekler.forEach((item) => { next[item.id] = pool[Math.floor(Math.random() * pool.length)]; });
    }
    if (Object.keys(next).length) {
      setAyahBackgrounds(next);
      // ★ KULLANICI SEÇİMİ KUTSAL (30.09): ana arka plan kullanıcının kendi dosyasıysa
      //   sekme değişimi onu rastgele bir kliple DEĞİŞTİREMEZ — yalnız slotlar yeniden atanır.
      if (backgroundRef.current?.cat !== "yuklenenler") {
        const first = next[items[0].id];
        if (first) setBackground(first);
      }
    }
  }, [smartAiEnabledRef, combinedAllClips, detectCategoryFromAyah, detectAdminCategoryFromAyah, isClipAccessibleRef]);

  const useFromLibrary = useCallback((ham: LibraryItem) => {
    // ★ 06.10 (5 dil): karta tıklanınca SEÇİLİ DİLDEKİ başlık/anlam stüdyoya taşınır
    //   (Arapça asıl `ar` alanı hiçbir dile çevrilmez). `t` dep ile yeniden tanımlanır.
    const item = kutuphaneItem(lang, ham);
    const s = item.s ?? 0, a = item.a ?? 0;
    const id = item.type === "ayet" && s > 0 ? `${s}:${a}` : `lib-${item.id}`;
    if (selectedRef.current.some((x) => x.id === id)) { notify(t("guestLimit")); setModal(null); return; }
    setSelected((current) => [...current, { id, s, a, sName: item.title, ar: item.ar || "", tr: item.tr || "" }]);
    setVerseIndex(selectedRef.current.length);
    notify(t("libStudEklendi").replace("{ad}", item.title));
    setModal(null);
  }, [notify, t, lang]);

  const libraryFiltered = useMemo(() => {
    let pool = LIBRARY_ITEMS;
    if (libType !== "tumu") pool = pool.filter((i) => i.type === libType);
    if (libEmotion !== "tum") pool = pool.filter((i) => i.emotions.includes(libEmotion));
    // ★ 06.10 (5 dil): arama seçili dilin çevrilmiş başlık/anlam/kaynağında da koşar
    const q = libSearch.trim().toLocaleLowerCase("tr");
    if (q) pool = pool.filter((i) => { const c = kutuphaneItem(lang, i); return (c.title + c.tr + c.source).toLocaleLowerCase("tr").includes(q); });
    return pool;
  }, [libType, libEmotion, libSearch, lang]);

  const isClipAccessible = useCallback((clip: Clip): boolean => {
    // ★ Yüklediklerim: kullanıcının kendi dosyaları her zaman erişilebilir (kendi cihazı)
    if (clip.cat === "yuklenenler") return true;
    if (isMasterSürüm || ATMOSPHERE_PREVIEW_UNLOCKED) return true;
    // ★ ADMIN KATEGORİ PLANI: onaylı dağıtıma göre (pro/elit tier kilidi,
    //   v2 kilitli, hidden admin-only) — adminCategoryAccess.ts okur
    if (clip.cat.startsWith("admin_")) return adminCatUsable(clip.cat, accessTier);
    const catTier = KATEGORI_TIER[clip.cat as CatId] ?? "free";
    if (!tierAtLeast(accessTier, catTier)) return false;
    const sameCat = combinedAllClips.filter((c) => c.cat === clip.cat && c.kind === clipKind);
    const idx = sameCat.findIndex((c) => c.id === clip.id);
    const nextTier: Tier = catTier === "free" ? "pro" : catTier === "pro" ? "elit" : "elit";
    if (idx >= FREE_VIDEOS_PER_CATEGORY && !tierAtLeast(accessTier, nextTier)) return false;
    return true;
  }, [accessTier, clipKind, combinedAllClips, isMasterSürüm]);
  isClipAccessibleRef.current = isClipAccessible;

  const randomizeBackgrounds = useCallback((scopeCat?: CatId) => {
    let pool = combinedAllClips.filter((clip) => clip.kind === clipKind && isClipAccessible(clip));
    if (scopeCat) pool = pool.filter((clip) => clip.cat === scopeCat);
    if (pool.length === 0) { notify(t("guestLimit")); return; }
    // ★ KULLANICI SEÇİMİ KUTSAL (30.09): "Zar" kullanıcının kendi dosyasını ezemez —
    //   yalnız kullanıcı Yüklediklerim kategorisini bilerek uygularsa (scopeCat) atanır.
    if (!scopeCat && backgroundRef.current?.cat === "yuklenenler") {
      notify(ttX2610("sbDosyanKorundu"));
      return;
    }
    const pick = () => pool[Math.floor(Math.random() * pool.length)];
    if (!selectedRef.current.length) {
      const c = pick();
      setBackground(c);
      notify(ttX2610("sbRastgele").replace("{x}", String(c.label)));
      return;
    }
    // ★ Kullanıcının kendi dosyasına atanmış slotlar zar/çeşitlilik dalgasından muaf
    const korunanSlotlar = scopeCat === "yuklenenler"
      ? new Set<string>()
      : new Set(
          Object.entries(ayahBackgroundsRef.current)
            .filter(([, clip]) => clip.cat === "yuklenenler")
            .map(([id]) => id),
        );
    const atananlar = selectedRef.current.filter((item) => !korunanSlotlar.has(item.id));
    if (!atananlar.length) { notify(ttX2610("sbDosyalarAtanmis")); return; }
    const anaArkaPlanKorunur = backgroundRef.current?.cat === "yuklenenler" && scopeCat !== "yuklenenler";
    const next: Record<string, Clip> = {};
    // ★ setAyahBackgrounds TÜM state'i değiştirir — korunan slotlar next'e geri yazılmalı
    //   (yalnız hâlâ seçili ayetlere ait olanlar taşınır)
    korunanSlotlar.forEach((id) => {
      if (!selectedRef.current.some((item) => item.id === id)) return;
      const korunan = ayahBackgroundsRef.current[id];
      if (korunan) next[id] = korunan;
    });
    if (scopeCat) {
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      atananlar.forEach((item, index) => { next[item.id] = shuffled[index % shuffled.length]; });
      const catLabel = atmosKategoriAdGorunum(String(scopeCat), CATEGORIES.find((c) => c.id === scopeCat)?.label ?? String(scopeCat), dilX2610());
      setAyahBackgrounds(next);
      if (!anaArkaPlanKorunur && next[selectedRef.current[0].id]) setBackground(next[selectedRef.current[0].id]);
      notify(ttX2610("sbRastgeleAta").replace("{n}", String(atananlar.length)).replace("{x}", String(catLabel)));
      return;
    }
    // ★ GERÇEK ÇEŞİTLİLİK — hem kategori hem klip tekrarını engeller
    const categories = Array.from(new Set(pool.map((c) => c.cat)));
    const shuffledCats = [...categories].sort(() => Math.random() - 0.5);
    const usedIds = new Set<string>();
    atananlar.forEach((item, index) => {
      const cat = shuffledCats[index % shuffledCats.length];
      const catPool = pool.filter((c) => c.cat === cat);
      // Önce bu kategoride HİÇ kullanılmamış klipleri dene
      const freshInCat = catPool.filter((c) => !usedIds.has(c.id));
      // O da bittiyse tüm havuzda kullanılmamışlara bak
      const freshAny = pool.filter((c) => !usedIds.has(c.id));
      const source = freshInCat.length ? freshInCat : freshAny.length ? freshAny : catPool.length ? catPool : pool;
      const chosen = source[Math.floor(Math.random() * source.length)] ?? pick();
      usedIds.add(chosen.id);
      next[item.id] = chosen;
    });
    setAyahBackgrounds(next);
    if (!anaArkaPlanKorunur && next[atananlar[0]?.id]) setBackground(next[atananlar[0].id]);
    const korunanSayi = korunanSlotlar.size;
    notify(korunanSayi > 0
      ? `✨ ${atananlar.length} ayete farklı kategorilerden atmosfer atandı · ${korunanSayi} kendi dosyan korundu`
      : `✨ ${atananlar.length} ayete farklı kategorilerden rastgele atmosfer atandı`);
  }, [clipKind, combinedAllClips, notify, isClipAccessible]);

  const applySmartBackgrounds = useCallback(() => {
    if (!selectedRef.current.length) { notify(ttX2610("sbOnceAyetSec")); return; }
    const wantKind = clipKindRef.current;
    // ★ KULLANICI MEDYASI KUTSAL (30.09): AI "Aç + Uygula" kullanıcının kendi dosyalarını
    //   EZEMEZ. Yüklediklerim slotları AI atamasından muaf — diğer slotlara sahne atanır.
    const korunanSlotlar = new Set(
      Object.entries(ayahBackgroundsRef.current)
        .filter(([, clip]) => clip.cat === "yuklenenler")
        .map(([id]) => id),
    );
    const next: Record<string, Clip> = {};
    // ★ setAyahBackgrounds TÜM state'i değiştirir — korunan slotlar next'e geri yazılmalı,
    //   yoksa "korumak" yerine silmiş oluruz (30.09 düzeltmesi). Yalnız hâlâ seçili
    //   ayetlere ait olanlar taşınır — bayat kayıt geri gelmesin.
    korunanSlotlar.forEach((id) => {
      if (!selectedRef.current.some((item) => item.id === id)) return;
      const korunan = ayahBackgroundsRef.current[id];
      if (korunan) next[id] = korunan;
    });
    selectedRef.current.forEach((item) => {
      if (korunanSlotlar.has(item.id)) return;
      const detectedCat = detectCategoryFromAyah(item.ar, item.tr, item.sName);
      let poolCat = combinedAllClips.filter((clip) => clip.cat === detectedCat && clip.kind === wantKind);
      // ★ Kategoride seçili türden klip yoksa: ayet kelimeleriyle admin kategorisi taraması (Şablon V2 uyumu)
      if (poolCat.length === 0) {
        const adminCat = detectAdminCategoryFromAyah(item.ar, item.tr, item.sName);
        if (adminCat) poolCat = combinedAllClips.filter((clip) => clip.cat === adminCat && clip.kind === wantKind);
      }
      if (poolCat.length === 0) poolCat = combinedAllClips.filter((clip) => clip.cat === "musaf" && clip.kind === wantKind);
      if (poolCat.length === 0) poolCat = combinedAllClips.filter((clip) => clip.kind === wantKind);
      if (poolCat.length === 0) return;
      // ★ 16.10 DÖNEN TORBA: Math.random yerine — aynı klasör tam tur bitmedikçe aynı klip dönmez
      const chosen = akilliKlipSec(poolCat);
      if (chosen) next[item.id] = chosen;
    });
    setAyahBackgrounds(next);
    // ★ Ana arka plan da kutsal: kullanıcının kendi dosyasıysa AI onu değiştiremez —
    //   yalnız kullanıcı dosyası olmayan ilk slotla ana önizlemeyi tazeler.
    if (
      selectedRef.current[0] &&
      next[selectedRef.current[0].id] &&
      backgroundRef.current?.cat !== "yuklenenler"
    ) setBackground(next[selectedRef.current[0].id]);
    const ezilen = korunanSlotlar.size;
    notify(ezilen > 0 ? t("dafAiSahneKorundu").replace("{n}", String(ezilen)) : t("dafAiSahne"));
  }, [combinedAllClips, notify, detectCategoryFromAyah, detectAdminCategoryFromAyah]);

  // ★ KÂRİ ÖNİZLEME — useReciterPreview hook'unda (SRP parçalama tur 3, 16.10):
  //   satır-içi kopya silindi; hook aynı imzayla çalışıyor. Birebir aynı davranış.
  const { playReciterPreview } = useReciterPreview({ previewReciterId, selectedRef, reciterPreviewRef, previewTimerRef, setPreviewReciterId, notify, silenceAllAudio });

  // ★ 21.10 HOCA SESİ VİDEO İNDİRME (kullanıcı: "o hoca kuran sesleri video
  //  indirme gibi yapsana, görüntüler nerde"): kâri kartındaki 📥 düğmesi —
  //  seçili ayeti o kârinin kaydıyla (everyayah/mp3quran mp3) CURRENT atmosfer
  //  görseliyle 9:16 video olarak kaydeder. Sesli Meal'in İndir hattını
  //  (seslendirmeIndir.ts) yeniden kullanır: fetch → decode → canvas+ses → MP4.
  const [hocaIndirBusy, setHocaIndirBusy] = useState<string | null>(null);
  const hocaIndir = useCallback(async (id: string) => {
    if (hocaIndirBusy) return;
    const item = RECITERS.find((x) => x.id === id);
    if (!item) return;
    // ★ 23.10: indirmeye arapça ayet + meal de geçirilir — videoya sabit ayet,
    //   okuma başlarken senkron meal düşer (seslendirmeIndir ayet+meal hattı).
    const secili = selectedRef.current[0] ?? { s: 1, a: 1, ar: "", tr: "" };
    const urls = item.surahPattern
      ? [item.surahPattern.replace("{S}", String(secili.s).padStart(3, "0"))]
      : sesKaynakZinciri(item.path, secili.s, secili.a);
    const bgKaynak = backgroundRef.current
      ? {
          url: backgroundRef.current.kind === "vid" ? getVideoUrlSync(backgroundRef.current) : undefined,
          poster: getPosterUrlSync(backgroundRef.current) || undefined,
        }
      : null;
    setHocaIndirBusy(id);
    try {
      await kuyrukIndir(
        [{ metin: `${secili.s}:${secili.a}`, ar: secili.ar || undefined, meal: secili.tr || undefined, etiket: `${item.name} · ${secili.s}:${secili.a}` }],
        async () => {
          // zincir: ilk GET'i görüntümlenen URL'i döndür; hepsi başarsızsa ilki dene
          for (const u of urls) {
            try { const r = await fetch(u); if (r.ok) return u; } catch { /* sıradaki */ }
          }
          return urls[0];
        },
        (m) => notify(m),
        bgKaynak,
      );
    } finally { setHocaIndirBusy(null); }
  }, [hocaIndirBusy, notify]);
  return {
    reassignBackgroundsForKind, useFromLibrary, libraryFiltered, isClipAccessible,
    randomizeBackgrounds, applySmartBackgrounds, playReciterPreview, hocaIndir, hocaIndirBusy,
    kendiSesSureEkle, addAyah, toggleAyah, addWholeSurah,
  };
}
