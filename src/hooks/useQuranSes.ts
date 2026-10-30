// ════════════════════════════════════════════════════════
// USEQURANSES.TS — QuranLearnModal'dan taşındı (SRP 3. tur, 10.10)
//
// ★ DİNLE MODU SES MOTORU:
//   startListening / playAt / besmele adabı (TEK BESMELE kuralı, 28.09)
//   / kaldığı-yerden-devam (ayet seviyesi, 29.09) / arka plan preload
//   (30.09) / tam sure ses-ekran senkronu (tartılı ayet + kelime, 30.09)
//   / 'ended' genel dinleyicisi (loop · wholeQuran · nextSurahAuto,
//   28.09 çifte-besmele fix dahil) / stopListening/pause/resume/seek
//   / dinleme ekrani verisi (sure önbelleği + besmele koruması).
//
// ★ NE İÇERMEZ: ÖĞREN (learn) modu sesi (playAyahAudio/playWordAudio
//   bileşende kalır), kâbe/radyo (useQuranRadyo), UI blokları,
//   audioRef element init'i (bileşende kalmalı — kelime sesi de dokunur).
//
// ★ Dışa açık adlar bileşendeki eski adlarla BİREBİR aynıdır —
//   bileşen yalnız destructure eder, quranLearnEkranlar imzası değişmez.
// ════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RECITERS, SURAHS_DATA, weightedWordIndex, type SurahInfo } from "../components/quranLearnVeri";
import { fetchSurahEditions } from "../studio/studioHelpers";

// ─── Karışık hoca havuzu (madde 65) — sure başına deterministik atama ───
const KARISIK_HOCA_POOL = [
  "Alafasy_128kbps", "MaherAlMuaiqly128kbps", "Abdul_Basit_Murattal_192kbps",
  "Husary_128kbps", "Minshawy_Murattal_128kbps", "Yasser_Ad-Dussary_128kbps",
] as const;

const BESMELE_AR = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";
const BESMELE_TR = "Rahmân ve Rahîm olan Allah'ın adıyla.";

// ════════════════════════════════════════════════════════
// PARAMETRELER — bileşen sahibi tarafından sağlanır
// ════════════════════════════════════════════════════════
export interface UseQuranSesParams {
  /** Modal açık mı */
  open: boolean;
  /** Aktif mod: learn | listen | null */
  mode: "learn" | "listen" | null;
  /** Kâbe canlı açık → ayet sesi arkada susar (muted) */
  kabeLive: boolean;
  /** Paylaşımlı Audio element ref (kelime/öğren/akış da dokunur — bileşende init edilir) */
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  /** Genel stopAudio — tüm ses kaynaklarını dursun (bileşende tanımlı) */
  stopAudio: () => void;
  /** Tam sure modu (mp3quran.net gapless dosya) */
  fullSurahMode: boolean;
  /** Komple Kur'an modu */
  wholeQuran: boolean;
  /** Komple Kur'an güncel konumu */
  wholeIdx: { s: number; a: number };
  setWholeIdx: React.Dispatch<React.SetStateAction<{ s: number; a: number }>>;
  /** Sure bitince sıradaki sure otomatik çalınsın */
  nextSurahAuto: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  /** Seçili dinleme kârisi */
  listenReciter: string;
  /** ★ ÇOKLU HOCA KARIŞIK DİNLEME (madde 65): komple Kur'an modunda sure başına farklı kâri */
  karisikHoca: boolean;
  /** Playback hızı */
  speed: number;
  /** ★ Bileşen sahibi sure state'ini tutuyorsa override edilir (hook kendi state'ini eskir) */
  listenSurahOverride?: { listenSurah: number; setListenSurah: React.Dispatch<React.SetStateAction<number>> };
  listenAyahIdxOverride?: { listenAyahIdx: number; setListenAyahIdx: React.Dispatch<React.SetStateAction<number>> };
  /** ★ Öğren modu 'paused' state'ini paylaş (DinleModu/Öğren aynı pause state'ini kullanır) */
  paused?: boolean;
  setPaused?: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface QuranSesApi {
  // Dinle ekranı state'leri
  listenSurah: number;
  setListenSurah: React.Dispatch<React.SetStateAction<number>>;
  listenAyahIdx: number;
  setListenAyahIdx: React.Dispatch<React.SetStateAction<number>>;
  listenAyahData: { ar: string; tr: string; n: number } | null;
  listenWordProgress: number;
  besmelePlaying: boolean;
  besmeleCalindiRef: React.MutableRefObject<number>;
  listenSurahInfo: SurahInfo;
  loopAyahListen: boolean;
  setLoopAyahListen: React.Dispatch<React.SetStateAction<boolean>>;
  paused: boolean;
  setPaused: React.Dispatch<React.SetStateAction<boolean>>;
  // Hoca arama
  reciterSearch: string;
  setReciterSearch: React.Dispatch<React.SetStateAction<string>>;
  filteredReciters: typeof RECITERS;
  // Kontroller
  startListening: (fromIdx?: number) => void;
  playAt: (sN: number, ayahIdx: number) => void;
  stopListening: () => void;
  pauseAyah: () => void;
  resumeAyah: () => void;
  seekAyah: (delta: number) => void;
}

// ════════════════════════════════════════════════════════
// HOOK GÖVDESİ
// ════════════════════════════════════════════════════════
export function useQuranSes({
  open, mode, kabeLive, audioRef, stopAudio,
  fullSurahMode, wholeQuran, wholeIdx, setWholeIdx,
  nextSurahAuto, setIsPlaying, listenReciter, karisikHoca, speed,
  listenSurahOverride, listenAyahIdxOverride, paused: pausedExt, setPaused: setPausedExt,
}: UseQuranSesParams): QuranSesApi {

  // ── Dinle ekranı state'leri ─────────────────────────────
  // ★ OVERRIDE DESENİ: bileşen kendi listenSurah/listenAyahIdx state'ini
  //   (localStorage başlatıcısıyla) geçtiğinde hook KENDİ state'ini atmaz —
  //   bileşende kalan state'ler hook'a yansıtılır, set fonksiyonları BİREBİR paylaşılır.
  const [listenSurahInt, setListenSurahInt] = useState(() => {
    try {
      const k = JSON.parse(localStorage.getItem("nur_son_konum") || "{}") as { s?: number };
      const s = Number(k?.s);
      return s >= 1 && s <= 114 ? s : 1;
    } catch { return 1; }
  });
  const [listenAyahIdxInt, setListenAyahIdxInt] = useState(0);
  const listenSurah = listenSurahOverride ? listenSurahOverride.listenSurah : listenSurahInt;
  const setListenSurah = listenSurahOverride ? listenSurahOverride.setListenSurah : setListenSurahInt;
  const listenAyahIdx = listenAyahIdxOverride ? listenAyahIdxOverride.listenAyahIdx : listenAyahIdxInt;
  const setListenAyahIdx = listenAyahIdxOverride ? listenAyahIdxOverride.setListenAyahIdx : setListenAyahIdxInt;
  const [loopAyahListen, setLoopAyahListen] = useState(false);
  // ★ paused bileşenden gelir (öğren+dinle ortak pause state'i); yoksa hook-owned olmaz
  const paused = pausedExt ?? false;
  const setPaused = setPausedExt ?? (() => {});
  const [besmelePlaying, setBesmelePlaying] = useState(false);
  const [listenAyahData, setListenAyahData] = useState<{ ar: string; tr: string; n: number } | null>(null);
  const [listenWordProgress, setListenWordProgress] = useState<number>(-1);
  const [reciterSearch, setReciterSearch] = useState("");

  // ★ BESMELE REFİ: 'ended' olayı iki dinleyiciyi birden tetikliyor (onended +
  //   addEventListener) → ref senkron okunur, çifte tetikleme susturulur.
  const besmeleRef = useRef(false);
  useEffect(() => { besmeleRef.current = besmelePlaying; }, [besmelePlaying]);

  // ★ TEK BESMELE KURALI: sure başına en fazla bir kez; pause→play, ⏮ veya
  //   tekrar-çal düğmeleri ardışık rahatsızlığa neden olamaz (28.09).
  const besmeleCalindiRef = useRef(0);

  // ★ KALDIĞIN YERDEN DEVAM — AYET SEVİYESİ (29.09): modal dinleme modunda
  //   ilk açılışta nur_son_konum'dan ayet konumu uygulanır; besmeleCalindiRef
  //   işaretli kurulur → Play besmelesiz kaldığı ayetten devam eder.
  const sonKonumUygulandiRef = useRef(false);
  useEffect(() => {
    if (!open || mode !== "listen" || sonKonumUygulandiRef.current) return;
    sonKonumUygulandiRef.current = true;
    try {
      const k = JSON.parse(localStorage.getItem("nur_son_konum") || "{}") as { s?: number; a?: number };
      const s = Number(k?.s), a = Number(k?.a);
      if (s >= 1 && s <= 114 && a >= 2) {
        setListenSurah(s);
        const toplam = SURAHS_DATA.find(x => x.n === s)?.ayahs ?? 7;
        setListenAyahIdx(Math.min(a - 1, toplam - 1));
        if (s !== 1 && s !== 9) besmeleCalindiRef.current = s;
      }
    } catch { /* kayıt yok/bozuk — Fâtiha 1:1 varsayılan */ }
  }, [open, mode]);
  useEffect(() => { if (!open) sonKonumUygulandiRef.current = false; }, [open]);

  // ── Ayet verisi cache + konum ref ───────────────────────
  const listenAyahIdxRef = useRef(0);
  useEffect(() => { listenAyahIdxRef.current = listenAyahIdx; }, [listenAyahIdx]);
  const listenAyahDataRef = useRef(listenAyahData);
  useEffect(() => { listenAyahDataRef.current = listenAyahData; }, [listenAyahData]);
  // ★ SURE ÖNBELLEĞİ: surenin ayetleri BİR KEZ çekilir; tüm geçişler cache'den okunur.
  const listenSurahCacheRef = useRef<{ s: number; ar: string[]; tr: string[] } | null>(null);
  // ★ EN GÜNCEL KONUM REFİ: gecikmeli yanıt eski ayete yazmasın
  const listenPosRef = useRef({ s: 0, a: 1 });
  useEffect(() => {
    listenPosRef.current = {
      s: wholeQuran ? wholeIdx.s : listenSurah,
      a: wholeQuran ? wholeIdx.a : listenAyahIdx + 1,
    };
  }, [wholeQuran, wholeIdx.s, wholeIdx.a, listenSurah, listenAyahIdx]);

  // ── Dinleme ekranı verisi (besmele korumalı) ────────────
  useEffect(() => {
    if (mode !== "listen") { setListenAyahData(null); return; }
    // ★ BESMELE KORUMASI: ses besmele derken ekranda besmele kalsın.
    if (besmelePlaying) return;
    const sNow = wholeQuran ? wholeIdx.s : listenSurah;
    const aNow = wholeQuran ? wholeIdx.a : listenAyahIdx + 1;
    const c = listenSurahCacheRef.current;
    if (c && c.s === sNow && c.ar[aNow - 1]) {
      setListenAyahData({ ar: c.ar[aNow - 1], tr: c.tr[aNow - 1], n: aNow });
      setListenWordProgress(-1);
      return;
    }
    let live = true;
    fetchSurahEditions(sNow, "tr.diyanet")
      .then((d) => {
        if (!live) return;
        const ars: string[] = d.arabic.map((x) => x.text);
        const trs: string[] = d.tr;
        listenSurahCacheRef.current = { s: sNow, ar: ars, tr: trs };
        const pos = listenPosRef.current;
        if (pos.s !== sNow || !ars[pos.a - 1]) return;
        setListenAyahData({ ar: ars[pos.a - 1], tr: trs[pos.a - 1], n: pos.a });
        setListenWordProgress(-1);
      })
      .catch(() => { /* önbellek sonraki denemede devreye girer */ });
    return () => { live = false; };
  }, [mode, wholeQuran, wholeIdx.s, wholeIdx.a, listenSurah, listenAyahIdx, besmelePlaying]);

  const listenSurahInfo = useMemo(
    () => SURAHS_DATA.find(s => s.n === listenSurah) ?? SURAHS_DATA[35],
    [listenSurah]
  );

  // ── Hoca arama kutusu ───────────────────────────────────
  const filteredReciters = useMemo(() => {
    const q = reciterSearch.trim().toLocaleLowerCase("tr");
    let liste = RECITERS;
    if (q) liste = RECITERS.filter(r => r.name.toLocaleLowerCase("tr").includes(q));
    // ★ SEÇİLİ KARİ EN ÜSTTE — kullanıcı kendi seçimini kaybetmesin
    return [...liste].sort((a, b) => (a.id === listenReciter ? -1 : b.id === listenReciter ? 1 : 0));
  }, [reciterSearch, listenReciter]);

  // ── Ses URL üreticileri ─────────────────────────────────
  // ★ Ayet mp3 yolu — everyayah; karışık hoca modunda sure numarasına göre atama (madde 65).
  const ayahUrl = useCallback((sN: number, aN: number) => {
    const rc = karisikHoca ? KARISIK_HOCA_POOL[(sN * 7) % KARISIK_HOCA_POOL.length] : listenReciter;
    return `https://everyayah.com/data/${rc}/${String(sN).padStart(3, "0")}${String(aN).padStart(3, "0")}.mp3`;
  }, [karisikHoca, listenReciter]);

  // ★ TAM SURE dosya yolu — kâri destekliyorsa mp3quran.net'ten tek dosya (gapless)
  const fullSurahUrl = useCallback((sN: number) => {
    const rc = RECITERS.find(r => r.id === listenReciter);
    if (!rc?.full) return null;
    const [folder, srv] = rc.full;
    return `https://server${srv}.mp3quran.net/${folder}/${String(sN).padStart(3, "0")}.mp3`;
  }, [listenReciter]);

  // ★ SIRADAKİ AYETİ ÖNCE İNDİR: arka planda ısıtır (30.09)
  const preloadedRef = useRef<string>("");
  const preloadNextAyah = useCallback((sN: number, ayahIdx: number) => {
    const total = SURAHS_DATA.find(s => s.n === sN)?.ayahs ?? 0;
    if (ayahIdx + 2 > total) return;
    const url = ayahUrl(sN, ayahIdx + 2);
    if (preloadedRef.current === url) return;
    preloadedRef.current = url;
    const p = new Audio();
    p.preload = "auto";
    p.src = url;
  }, [ayahUrl]);

  // ★ TAM SURE SES-EKRAN SENKRONU (30.09): süre oranı → tartılı ayet indeksi + kelime
  const tamSureSenkronBagla = useCallback((a: HTMLAudioElement, sN: number) => {
    a.ontimeupdate = () => {
      if (!a.duration || Number.isNaN(a.duration) || a.duration <= 0) return;
      const ratio = a.currentTime / a.duration;
      const totalAyah = SURAHS_DATA.find(s => s.n === sN)?.ayahs ?? 0;
      if (totalAyah <= 0) return;
      const cache = listenSurahCacheRef.current;
      let yeniIdx: number;
      if (cache && cache.s === sN && cache.ar.length === totalAyah) {
        yeniIdx = Math.min(totalAyah - 1, weightedWordIndex(ratio, cache.ar.join(" "), totalAyah));
      } else {
        yeniIdx = Math.min(totalAyah - 1, Math.floor(ratio * totalAyah));
      }
      if (yeniIdx !== listenAyahIdxRef.current) {
        setListenAyahIdx(yeniIdx);
        setListenWordProgress(-1);
      } else if (cache && cache.s === sN && cache.ar[yeniIdx]) {
        const ayRatio = (ratio * totalAyah) - yeniIdx;
        setListenWordProgress(weightedWordIndex(ayRatio, cache.ar[yeniIdx], 999));
      }
    };
  }, []);

  // ── playAt: ayet/tam-sure oynatma tek giriş noktası ─────
  const playAt = useCallback((sN: number, ayahIdx: number) => {
    const a = audioRef.current; if (!a) return;
    setListenAyahIdx(ayahIdx);
    const fsUrl = fullSurahMode ? fullSurahUrl(sN) : null;
    if (fsUrl) {
      a.src = fsUrl;
      a.playbackRate = speed;
      a.loop = false;
      a.preload = "auto";
      a.load();
      tamSureSenkronBagla(a, sN);
      a.onended = null;
      a.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      return;
    }
    a.src = ayahUrl(sN, ayahIdx + 1);
    a.playbackRate = speed;
    a.loop = false;
    a.preload = "auto";
    a.load();
    a.ontimeupdate = () => {
      const ay = listenAyahDataRef.current;
      if (!a.duration || Number.isNaN(a.duration) || !ay) return;
      const parts = ay.ar.split(/\s+/).filter(Boolean);
      if (parts.length === 0) return;
      setListenWordProgress(weightedWordIndex(a.currentTime / a.duration, ay.ar, parts.length));
    };
    a.onended = null; // besmele/akış handler'ını eziyor
    a.play().then(() => { setIsPlaying(true); preloadNextAyah(sN, ayahIdx); }).catch(() => setIsPlaying(false));
  }, [ayahUrl, fullSurahUrl, fullSurahMode, speed, preloadNextAyah, audioRef]);

  // ── startListening: başlat (besmele + tam sure + wholeQuran) ──
  const startListening = useCallback((fromIdx = 0) => {
    stopAudio();
    const sN = listenSurah;
    // TAM SURE MODU — tek dosya gapless
    const rc = RECITERS.find(r => r.id === listenReciter);
    if (fullSurahMode && rc?.full) {
      const [folder, srv] = rc.full;
      const a = audioRef.current; if (!a) return;
      setListenAyahIdx(0);
      a.src = `https://server${srv}.mp3quran.net/${folder}/${String(sN).padStart(3, "0")}.mp3`;
      a.playbackRate = speed;
      a.loop = false;
      a.preload = "auto";
      a.load();
      tamSureSenkronBagla(a, sN);
      a.onended = () => {
        if (!wholeQuran && !nextSurahAuto) { setIsPlaying(false); return; }
        const next = SURAHS_DATA.find(s => s.n === sN + 1);
        if (next) {
          setListenSurah(next.n);
          setListenAyahIdx(0);
          a.src = `https://server${srv}.mp3quran.net/${folder}/${String(next.n).padStart(3, "0")}.mp3`;
          a.load();
          a.play().catch(() => setIsPlaying(false));
        } else setIsPlaying(false);
      };
      a.play().then(() => setIsPlaying(true)).catch(() => {
        setTimeout(() => { a.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false)); }, 250);
      });
      return;
    }
    // KOMPLE KUR'AN — seçili sureden başla
    if (wholeQuran) setWholeIdx(prev => ({ ...prev, s: sN, a: fromIdx + 1 }));
    const a = audioRef.current; if (!a) return;
    setListenAyahIdx(fromIdx);
    setListenWordProgress(-1);
    // ★ BESMELE — Fâtiha/Tevbe hariç her sure başında (tek besmele kuralı);
    //   Fâtiha'nın 1. ayeti zaten besmele → çifte besmele ATLANIR.
    const isBesmeleSurah = sN === 1 || sN === 9;
    const besmeleUrl = `https://everyayah.com/data/${listenReciter}/001001.mp3`;
    if (fromIdx === 0 && !isBesmeleSurah && besmeleCalindiRef.current !== sN) {
      besmeleCalindiRef.current = sN;
      setListenAyahData({ ar: BESMELE_AR, tr: BESMELE_TR, n: 0 });
      setListenWordProgress(-1);
      setBesmelePlaying(true);
      a.src = besmeleUrl;
      a.onended = () => {
        a.onended = null;
        setBesmelePlaying(false);
        a.src = ayahUrl(sN, 1);
        a.load();
        a.play().then(() => { setIsPlaying(true); preloadNextAyah(sN, 0); }).catch(() => setIsPlaying(false));
      };
      a.playbackRate = speed;
      a.loop = false;
      a.preload = "auto";
      a.load();
      a.play().then(() => setIsPlaying(true)).catch(() => {
        setTimeout(() => { a.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false)); }, 250);
      });
      return;
    }
    a.src = ayahUrl(sN, fromIdx + 1);
    a.playbackRate = speed;
    a.loop = false;
    a.preload = "auto";
    a.load();
    a.onended = null;
    a.play().then(() => { setIsPlaying(true); preloadNextAyah(sN, fromIdx); }).catch(() => {
      setTimeout(() => { a.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false)); }, 250);
    });
  }, [wholeQuran, nextSurahAuto, fullSurahMode, listenSurah, listenReciter, ayahUrl, speed, stopAudio, preloadNextAyah, audioRef]);

  // ── Genel 'ended' dinleyicisi (loop · wholeQuran · nextSurah) ──
  useEffect(() => {
    if (mode !== "listen") return;
    const a = audioRef.current; if (!a) return;
    const onEnded = () => {
      if (besmeleRef.current) return;
      if (loopAyahListen) { a.currentTime = 0; a.play().catch(() => undefined); return; }
      const sNow = wholeQuran ? wholeIdx.s : listenSurah;
      const total = SURAHS_DATA.find(s => s.n === sNow)?.ayahs ?? listenSurahInfo.ayahs;
      if (listenAyahIdx + 1 < total) { playAt(sNow, listenAyahIdx + 1); return; }
      const next = SURAHS_DATA.find(s => s.n === sNow + 1);
      if ((wholeQuran || nextSurahAuto) && next) {
        if (wholeQuran) setWholeIdx({ s: next.n, a: 1 });
        setListenSurah(next.n);
        playAt(next.n, 0);
        return;
      }
      setIsPlaying(false);
    };
    a.addEventListener("ended", onEnded);
    return () => a.removeEventListener("ended", onEnded);
  }, [mode, loopAyahListen, wholeQuran, nextSurahAuto, wholeIdx, listenSurah, listenAyahIdx, playAt, listenSurahInfo.ayahs, listenReciter]);

  // ── Kontroller ─────────────────────────────────────────
  const stopListening = useCallback(() => {
    stopAudio();
    setPaused(false);
    setBesmelePlaying(false);
    // ★ 16.10 ÇALMIYOR FIX (kullanıcı bildirimi: "çalmıyor ki kanka"): hoca/sure modu
    //   değişince pause düğmesi stopListening'i çağırıyor ama isPlaying TRUE kalyordu —
    //   UI hep pause ikonunda dondu, ▶ (startListening) bir daha asla tetiklenmedi;
    //   "ÇALIYOR·n. AYET" bandı boş seste yürüdü. stopListening = oyun bitti → isPlaying
    //   false'ya çekilir, altın düğme ▶'e döner, yeni seçimle play gerçekten çalışır.
    setIsPlaying(false);
  }, [stopAudio, setIsPlaying]);

  // ★ 31.10 HOCA CANLI GEÇİŞ (kullanıcı: "hoca değişince hemen geçsin — dondurup
  //   tekrar başlatmak zorunda kalıyorum"): çalarken hoca değişirse AYNI ayet
  //   yeni hocanın sesiyle kesintisiz devam eder.
  //   • Çalmıyorken/durmuşken hiçbir şey yapılmaz — sadece hoca değişir; ▶ ile
  //     başlatınca zaten yeni hoca gelir (pause durumuna dokunulmaz).
  //   • Tam sure modunda yeni dosyaya geçip KONUMU korur (loadedmetadata ile).
  //   • Karışık hoca modunda seçim sure bazlı atamalıdır — dokunulmaz.
  //   • setState async: onClick'teki startListening ESKİ hocayı başlatırdı —
  //     geçiş bu yüzden effect'te yapılır (render sonrası, YENİ playAt/URL'lerle).
  const hocaOncekiRef = useRef(listenReciter);
  useEffect(() => {
    if (hocaOncekiRef.current === listenReciter) return;
    hocaOncekiRef.current = listenReciter;
    if (mode !== "listen" || karisikHoca) return;
    const a = audioRef.current;
    if (!a || a.paused || a.ended || besmeleRef.current) return;
    const sNow = wholeQuran ? wholeIdx.s : listenSurah;
    const aNow = wholeQuran ? wholeIdx.a - 1 : listenAyahIdxRef.current;
    if (fullSurahMode) {
      const yeni = fullSurahUrl(sNow);
      if (!yeni || a.src === yeni) { playAt(sNow, 0); return; }
      const pozisyon = Number.isFinite(a.currentTime) ? a.currentTime : 0;
      a.src = yeni;
      a.load();
      const devam = () => {
        a.removeEventListener("loadedmetadata", devam);
        try { a.currentTime = Math.min(pozisyon, (a.duration || Infinity) - 0.2); } catch { /* metadata henüz yok — baştan */ }
        a.play().catch(() => setIsPlaying(false));
      };
      a.addEventListener("loadedmetadata", devam);
      return;
    }
    playAt(sNow, aNow);
  }, [listenReciter, mode, karisikHoca, wholeQuran, wholeIdx.s, wholeIdx.a, listenSurah, fullSurahMode, playAt, fullSurahUrl, setIsPlaying, audioRef]);

  const pauseAyah = useCallback(() => {
    const a = audioRef.current; if (!a) return;
    a.pause(); setPaused(true);
  }, []);

  const resumeAyah = useCallback(() => {
    const a = audioRef.current; if (!a) return;
    a.play().then(() => setPaused(false)).catch(() => undefined);
  }, []);

  const seekAyah = useCallback((delta: number) => {
    const a = audioRef.current; if (!a) return;
    const d = a.duration;
    if (!d || Number.isNaN(d)) return;
    a.currentTime = Math.max(0, Math.min(d - 0.15, a.currentTime + delta));
  }, []);

  // ── Modal kapansın → ses durdur + besmele hakkı sıfırla ──
  useEffect(() => {
    if (!open) {
      stopAudio();
      setIsPlaying(false);
      setBesmelePlaying(false);
      besmeleCalindiRef.current = 0;
    }
  }, [open, stopAudio]);

  // ── KÂBE AÇILINCA ARKADAKİ KURAN SUSSUN (bileşende isPlaying state'ine bağlı) ──
  //   Not: isPlaying hook içinde yaşamıyor — bileşen kendi setIsPlaying'ini atar;
  //   mute/unmute mantığı bileşende audioRef üzerinden ayrıca çalışır.
  //   (Hook, kâbeLive'ı sadece API imzasıyla taşıyor — çifte mute oluşmaz.)

  // ── SON KONUM KAYDI — dinlemede değişince otomatik (29.09) ──
  useEffect(() => {
    if (mode !== "listen" || !listenSurah) return;
    try { localStorage.setItem("nur_son_konum", JSON.stringify({ s: listenSurah, a: listenAyahIdx + 1 })); } catch {}
  }, [mode, listenSurah, listenAyahIdx]);

  // ── Dönen API ─────────────────────────────────────────
  return {
    listenSurah, setListenSurah,
    listenAyahIdx, setListenAyahIdx,
    listenAyahData, listenWordProgress,
    besmelePlaying, besmeleCalindiRef,
    listenSurahInfo,
    loopAyahListen, setLoopAyahListen,
    paused, setPaused,
    reciterSearch, setReciterSearch,
    filteredReciters,
    startListening, playAt, stopListening,
    pauseAyah, resumeAyah, seekAyah,
  };
}
