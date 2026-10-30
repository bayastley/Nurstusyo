// ════════════════════════════════════════════════════════
// QURANLEARNOYUNCU.TS — QuranLearnModal parçalama (25.10):
// cenaş ses motoru (ayet sesi + kelime seçimi + döngü + önyükleme + useQuranSes
// bağlantısı + radyo motoru bağlantısı). Birebir taşınma (davranış aynı).
// ════════════════════════════════════════════════════════
import { useCallback, useEffect, useRef, useState } from "react";
import { useQuranRadyo } from "../hooks/useQuranRadyo";
import { useQuranSes } from "../hooks/useQuranSes";
import { SURAHS_DATA, weightedWordIndex, type Reciter, type SurahInfo } from "./quranLearnVeri";
import { WBW_TR, wbwNormIdx, ensureWbwLoaded } from "./quranLearnSozluk";

export type QklMode = "learn" | "listen" | "test" | null;
interface QklAyah { n: number; ar: string; tr: string; juz: number; page: number; }
interface QklWord { i: number; ar: string; tr: string; translit: string; audio: string; }

interface QklOyuncuParam {
  open: boolean; mode: QklMode; kabeLive: boolean;
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;  words: QklWord[]; setWords: React.Dispatch<React.SetStateAction<QklWord[]>>; wordLoading: boolean;
  ayah?: QklAyah | null; surahNo: number; ayahNo: number; setAyahNo: React.Dispatch<React.SetStateAction<number>>;
  setActiveWord: React.Dispatch<React.SetStateAction<number | null>>; activeWord: number | null;
  repeatWord: boolean; setRepeatWord: React.Dispatch<React.SetStateAction<boolean>>;
  reciter: string; speed: number;
  loopAyah: boolean; autoRead: boolean; flowPlaying: boolean;
  setFlowPlaying: React.Dispatch<React.SetStateAction<boolean>>; setAutoRead: React.Dispatch<React.SetStateAction<boolean>>;
  surah: SurahInfo;
  listenSurah: number; setListenSurah: React.Dispatch<React.SetStateAction<number>>;
  // useQuranSes yapılandırması:
  fullSurahMode: boolean; wholeQuran: boolean; wholeIdx: { s: number; a: number };
  setWholeIdx: React.Dispatch<React.SetStateAction<{ s: number; a: number }>>;  nextSurahAuto: boolean; karisikHoca: boolean; listenReciter: string;
  listenAyahIdx: number; setListenAyahIdx: React.Dispatch<React.SetStateAction<number>>;
}

export function useQuranOyuncu(p: QklOyuncuParam) {
  const { open, mode: mode, kabeLive, audioRef, setIsPlaying, words, setWords, wordLoading,
    ayah, surahNo, ayahNo, setAyahNo, setActiveWord, activeWord, repeatWord, setRepeatWord,
    reciter, speed, loopAyah, autoRead, flowPlaying, setFlowPlaying, setAutoRead, surah,
    listenSurah, setListenSurah, fullSurahMode, wholeQuran, wholeIdx, setWholeIdx,
    nextSurahAuto, karisikHoca, listenReciter, listenAyahIdx, setListenAyahIdx } = p;
  {
    const stopAudio = useCallback(() => {
    const a = audioRef.current; if (!a) return;
    a.pause(); a.onended = null; a.ontimeupdate = null;
    // ★ KARŞILIKLI DURDURMA (28.09, kullanıcı kararı): "radyo ile kuran dinliyorum aynı anda
    //   çalışıyor, biri çalışınca diğeri dursun" — ayet/kelime sesi dururken radyo da dursun.
    //   (Ters yol zaten vardı: toggleRadio açılırken stopAudio çağırıyordu.)
    //   NOT: radioTimerTemizle/radioHlsTemizle bu noktada TANIMLI DEĞİL (daha aşağıda) —
    //   TDZ hatası olmasın diye doğrudan ref/state üzerinden temizlik yapıyoruz.
    const r = radioRef.current;
    if (r) { r.pause(); }
    radioTimerTemizleRef.current?.();
    radioHlsTemizleRef.current?.();
    setRadioOn(false); setRadioNote("");
  }, []);

  // ★ RADYO MOTORU BAĞLANTISI — stopAudio tanımından SONRA çağrılır (TDZ-fix 09.10):
  //   hook argümanlarında stopAudio/setIsPlaying güncel closure ile sarmalanır.
  const radyo = useQuranRadyo({ open, kabeLive, stopAudio, setIsPlaying });
  const { radioOn, setRadioOn, radioIdx, setRadioIdx, radioVol, setRadioVol, radioMuted, setRadioMuted, radioErr, setRadioErr, radioNote, setRadioNote, radioPaused, setRadioPaused, radioRetryCount, setRadioRetryCount, siraliKanallar, akilliBolge, setAkilliBolge, akilliAcik, setAkilliAcik, radioRef, radioHlsRef, radioTimerTemizleRef, radioHlsTemizleRef, radioTimerTemizle, radioHlsTemizle, toggleRadio, pauseRadio, resumeRadio, radyoKapat } = radyo;

  // ★ GÜNCEL AYET REFİ: ses her zaman EKRANDAKİ ayeti okur (eski closure taşımaz)
  const ayahPosRef = useRef({ s: surahNo, a: ayahNo });
  useEffect(() => { ayahPosRef.current = { s: surahNo, a: ayahNo }; }, [surahNo, ayahNo]);
  // ★ GÜNCEL KELİME REFİ: ses konumu → kelime eşlemesi her zaman taze listeyle
  const wordsRef = useRef(words);
  useEffect(() => { wordsRef.current = words; }, [words]);
  // ★ TAKİP METNİ REFİ: tartılı dağıtım ayetin Arapça metnine bakar (taze)
  const ayahPosRefText = useRef(ayah?.ar ?? "");
  useEffect(() => { ayahPosRefText.current = ayah?.ar ?? ""; }, [ayah?.ar]);

  // ★ 16.10 İKİ SURE SENKRONİ (kullanıcı bildirimi: "dinle modunda sure değiştirdim,
  //    ▶ eski sureyi okudu"): Öğren modunun surahNo'su ile Dinle modunun listenSurah'ı
  //    AYRI state'lerdi — öğrende 55. Rahmân seçtiğinde dinlede hâlâ 1. Fâtiha
  //    kalıyordu. Artık surahNo her değiştiğinde listenSurah'a da yazılıyor —
  //    her ekran aynı sureye bakar, ▶ diledi seçimi okur.
  useEffect(() => { setListenSurah(surahNo); }, [surahNo]);

  // ★ YEDEK: quran.com engellenirse ayet metnini kelimelere böl — kelime tıklama
  //    ve altın vurgu her koşulda çalışır; anlamlar yerel sözlükten dolar (API gerekmez).
  useEffect(() => {
    if (!open || mode !== "learn" || wordLoading || words.length > 0) return;
    const text = ayah?.ar?.replace(/^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/, "").trim();
    if (!text) return;
    const parts = text.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return;
    // Yerel sözlük hazır değilse yükle — sonra kelimeleri sözlükten doldur
    let live = true;
    ensureWbwLoaded().then(() => {
      if (!live) return;
      const norm = (s: string) => s
        .replace(/[\u0670\u06E1\u064B-\u065F\u0640\u06D6-\u06ED\u0653-\u0655]/g, "")
        .replace(/\u0671/g, "\u0627").replace(/\u0649/g, "\u064A").replace(/\u0629/g, "\u0647")
        .replace(/[\u06CC]/g, "\u064A").replace(/\s+/g, "").trim();
      const stripAl = (s: string) => norm(s).replace(/^ال/, "");
      const wbwKeys = Object.keys(WBW_TR).map(k => ({ k, n: norm(k), na: stripAl(k) }));
      setWords(parts.map((ar, i) => {
        const n = norm(ar), na = stripAl(ar);
        const exact = wbwNormIdx()[n] ?? wbwKeys.find(x => x.n === n || x.na === na);
        let tr = typeof exact === "string" ? exact : (exact as any)?.k ? WBW_TR[(exact as any).k] : undefined;
        if (!tr) {
          const part = wbwKeys.find(x => x.na.length > 2 && (na.startsWith(x.na) || x.na === na.slice(0, x.na.length)));
          tr = part ? WBW_TR[part.k] : undefined;
        }
        return { i, ar, tr: tr ?? "—", translit: "", audio: "" };
      }));
    });
    return () => { live = false; };
  }, [open, mode, wordLoading, words.length, ayah?.ar]);

  // ★ KELİMEYE TIKLA: kelimeyi parlat + seçilen hocanın sesiyle O KELİMEYİ oku
  //   (qurancdn kelime sesleri tek okuyuculu; ayet sesi hoca seçiminden gelir.
  //    "Kelimeyi seçilen hoca okusun" için: hoca ayet mp3'ünü kelime konumundan başlatamayız
  //    ama her ayetin ilk kelime sesi mevcut; bu yüzden kelime sesi qurancdn'den (tek okuyucu),
  //    ayet sesi seçilen hocadan çalar — ikisi birlikte doğru davranış)
  const clickWord = (i: number) => {
    if (activeWord === i) { // tekrar tıkla → tekrar oku
      playWordAudio(i);
      return;
    }
    setActiveWord(i);
    playWordAudio(i);
  };

  // ★ SES MODU BAYRAĞI: element üzerinde hangi tür içerik çalıyor (ayah = kelime takibi var,
  //   word = birebir kelime sesi — takip ASLA karışmaz)
  const audioModeRef = useRef<"ayah" | "word">("ayah");

  const playWordAudio = (i: number) => {
    const a = audioRef.current; if (!a || !words[i]) return;
    stopAudio();
    audioModeRef.current = "word";
    // ★ KELİME TIKLAMASINDA takip tamamen KAPANIR — kelime sesi kısa olduğu için
    //   ontimeupdate oranı yanlış kelimeye atlardı (4 kelime geriden ses gelmesi Buydu)
    a.ontimeupdate = null;
    if (words[i].audio) {
      a.src = words[i].audio;
    } else {
      // Kelime sesi yoksa (yedek mod) ayet sesini çal
      a.src = `https://everyayah.com/data/${reciter}/${String(surahNo).padStart(3, "0")}${String(ayahNo).padStart(3, "0")}.mp3`;
    }
    a.playbackRate = speed;
    // ★ SÜREKLİ: kelime sonsuz döngüde çalar (loop=true en güvenilir yöntem)
    a.loop = repeatWord;
    a.onended = null;
    // ★ HATA DÜZELTME: src değişince load() şart — yoksa tarayıcı eski buffer'ı
    //   çalabiliyor (ekranda 'annekum' yazarken önceki 'Allah' sesi duyuluyordu)
    a.load();
    a.play().catch(() => undefined);
  };

  // SÜREKLİ düğmesi: açınca mevcut kelimeyi hemen döngüye al, kapatınca durdur
  const toggleRepeatWord = () => {
    const nv = !repeatWord;
    setRepeatWord(nv);
    const a = audioRef.current;
    if (a) a.loop = nv && activeWord !== null;
    if (nv && activeWord !== null) playWordAudio(activeWord);
  };

  // Ayeti sesli dinle (hoca seçimiyle, tekrar çal opsiyonu) — everyayah ayet dosyası
  // ★ src ve devam mantığı REF'ten okunur: hangi ayet ekrandaysa O çalar,
  //   ayet değişince eski ses zaten stopAudio ile kesiliyor (alttaki efekt).
  // ★ ÖĞREN MODU ÖN YÜKLEME: sıradaki ayeti arka planda ısıtır (geç açılma yok)
  const learnPreloadRef = useRef("");
  const preloadLearnNext = useCallback((sNow: number, aNow: number) => {
    const total = SURAHS_DATA.find(x => x.n === sNow)?.ayahs ?? 0;
    if (aNow + 1 > total) return;
    const url = `https://everyayah.com/data/${reciter}/${String(sNow).padStart(3, "0")}${String(aNow + 1).padStart(3, "0")}.mp3`;
    if (learnPreloadRef.current === url) return;
    learnPreloadRef.current = url;
    const p = new Audio();
    p.preload = "auto";
    p.src = url;
  }, [reciter]);

  const playAyahAudio = (onEnded?: () => void) => {
    const a = audioRef.current; if (!a) return;
    stopAudio();
    const { s: sNow, a: aNow } = ayahPosRef.current;
    a.src = `https://everyayah.com/data/${reciter}/${String(sNow).padStart(3, "0")}${String(aNow).padStart(3, "0")}.mp3`;
    a.playbackRate = speed;
    a.preload = "auto";
    a.load(); // ★ src değişince eski buffer temizlenir — yanlış ses düzeltmesi
    preloadLearnNext(sNow, aNow);
    if (loopAyah) {
      a.loop = true;
    } else {
      a.loop = false;
      if (onEnded) {
        a.onended = onEnded;
      } else if (autoRead || flowPlaying) {
        // Sure akışı: ayet bitince sıradaki ayete geç (sure sonunda durur)
        a.onended = () => {
          const { s: sRef, a: aRef } = ayahPosRef.current;
          const total = SURAHS_DATA.find(x => x.n === sRef)?.ayahs ?? aRef;
          if (aRef < total) {
            setAyahNo(aRef + 1);
            setActiveWord(null);
          } else {
            setFlowPlaying(false); setAutoRead(false); setIsPlaying(false);
          }
        };
      } else {
        a.onended = null;
      }
    }
    a.play().then(() => setIsPlaying(true)).catch(() => undefined);
    audioModeRef.current = "ayah";
    // ★ CANLI KELİME TAKİBİ: ses kendisi konum bildirir, kelime sırayla sarı yanar
    a.ontimeupdate = () => {
      if (audioModeRef.current !== "ayah") return; // kelime sesi çalarken takip kapalı
      if (!a.duration || Number.isNaN(a.duration)) return;
      const ws = wordsRef.current;
      if (ws.length === 0) return;
      const idx = weightedWordIndex(a.currentTime / a.duration, ayahPosRefText.current, ws.length);
      setActiveWord(idx);
    };
  };
  // En güncel playAyahAudio'ya ref — ayet listesinden tıklayınca kullanılır
  const playAyahRef = useRef(playAyahAudio);
  useEffect(() => { playAyahRef.current = playAyahAudio; });

  const replayAyah = () => playAyahAudio();

  // ★ 31.10 HOCA CANLI GEÇİŞ (öğren modu, kullanıcı: "hoca değişince hemen geçsin —
  //   dondurup tekrar başlatmak zorunda kalıyorum"): akış/oto-oku çalarken hoca
  //   değişirse AYNI ayet yeni hocanın sesiyle hemen yeniden başlar.
  //   • Ayet sesi gerçekten çalıyorsa devreye girer; durmuş/kelime sesinde dokunulmaz.
  //   • playAyahAudio hem src'i YENİ hocayla kurar hem akış (flow/autoRead) onended'ini
  //     taze kurar → sure akışı kesintisiz yeni hocayla sürer.
  const hocaOncekiRef = useRef(reciter);
  useEffect(() => {
    if (hocaOncekiRef.current === reciter) return;
    hocaOncekiRef.current = reciter;
    if (!open || mode !== "learn") return;
    const a = audioRef.current;
    if (!a || a.paused || a.ended) return;
    if (audioModeRef.current !== "ayah") return; // kelime kelime seslerine karışmaz
    playAyahAudio();
  }, [reciter]); // eslint-disable-line react-hooks/exhaustive-deps

  // ★ AYET/SURE DEĞİŞİNCE: eski sesi HEMEN kes, ekranla ses aynı ayete gelsin
  //   (otomatik oku modundaysa aşağıdaki efekt yeni ayeti zaten başlatacak)
  useEffect(() => {
    if (!open || mode !== "learn") return;
    stopAudio();
    setActiveWord(null);
  }, [surahNo, ayahNo]);

  // Ayet değişince akış/otomatik oku açıksa yeni ayeti başlat
  useEffect(() => {
    if (open && mode === "learn" && (autoRead || flowPlaying) && ayahNo > 0) {
      const t = setTimeout(() => playAyahAudio(), 200);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ayahNo, autoRead, flowPlaying, open, mode]);

  // ── Dinle modu ses motoru — SRP 3. TUR: useQuranSes hook'u ──
  // ★ startListening/playAt/besmele/kaldığı-yerden-devam/sure önbellegi/tam-sure
  //   senkron/'ended' genel dinleyici/stop·pause·resume·seek, hepsi hook'ta.
  //   bileşende kalan: liste mod bayrakları, audioRef init'i, radyo/kâbe UI'sı.
  const [paused, setPaused] = useState(false); // learn modu kullanıyor; hook listen paused'i aynı state'e bağlar
  const ses = useQuranSes({
    open, mode: mode === "test" ? null : mode, kabeLive, audioRef, stopAudio,
    fullSurahMode, wholeQuran, wholeIdx, setWholeIdx,
    nextSurahAuto, setIsPlaying, listenReciter, karisikHoca, speed,
    paused, setPaused,
    listenSurahOverride: { listenSurah, setListenSurah },
    listenAyahIdxOverride: { listenAyahIdx, setListenAyahIdx },
  });
  const {
    listenAyahData, listenWordProgress, besmelePlaying, besmeleCalindiRef,
    listenSurahInfo, loopAyahListen, setLoopAyahListen,
    reciterSearch, setReciterSearch, filteredReciters,
    startListening, stopListening, pauseAyah, resumeAyah, seekAyah,
  } = ses;

  const stopAyahPlayback = () => { stopAudio(); setIsPlaying(false); setFlowPlaying(false); setPaused(false); };

  // ★ ÖĞREN MODU kontrolleri (dondur/sar/önceki-sonraki) — learn moduna özgü
  const prevAyahLearn = () => {
    if (ayahNo <= 1) return;
    stopAudio(); setPaused(false); setFlowPlaying(true); setAyahNo(ayahNo - 1); setActiveWord(null);
  };
  const nextAyahLearn = () => {
    if (ayahNo >= surah.ayahs) { stopAyahPlayback(); return; }
    stopAudio(); setPaused(false); setFlowPlaying(true); setAyahNo(ayahNo + 1); setActiveWord(null);
  };

  const u = { clickWord, playWordAudio, toggleRepeatWord, preloadLearnNext, playAyahAudio, playAyahRef, replayAyah, stopAyahPlayback, prevAyahLearn, nextAyahLearn };
  return {
    stopAudio, radyo, ayahPosRef, wordsRef, ayahPosRefText, audioModeRef,
    ...u,
    ses: { ...ses, u } as typeof ses & { u: typeof u },
    paused, setPaused,
  };
}
  }
