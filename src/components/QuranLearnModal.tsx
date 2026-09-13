import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Headphones, Play, Pause, RotateCcw, Search, X, Loader2, Volume2, Repeat } from "lucide-react";

// ══════════════════════════════════════════════════════════════
// QuranLearnModal — "Kur'an Öğreniyorum" + "Kur'an Dinliyorum"
// Veri: api.alquran.cloud (114 sure, Arapça + 4 Türkçe meal)
// Kelime: api.quran.com (kelime kelime Arapça + TR meal + kelime sesi)
// Ses: cdn.islamic.network (ayet) + audio.qurancdn.com (kelime) + everyayah.com (tam sure)
// ══════════════════════════════════════════════════════════════

type Mode = "learn" | "listen" | null;

interface Reciter { id: string; name: string; everyayah?: string; }
interface Ayah { n: number; ar: string; tr: string; juz: number; page: number; }
interface Word { i: number; ar: string; tr: string; translit: string; audio: string; }

// ★ YEDEK kari listesi — mp3quran.net API'si (241 kari) erişilemezse bu devreye girer.
// Normalde liste canlı olarak https://mp3quran.net/api/v3/reciters?language=ar'dan gelir.
const FALLBACK_RECITERS: Reciter[] = [
  { id: "ar.alafasy", name: "Mishary Rashid Al-Afasy" },
  { id: "ar.mahermuaiqly", name: "Mahir el-Muaykli (Kabe İmamı)" },
  { id: "ar.abdulbasitmurattal", name: "Abdulbasit Abdussamed (Murattal)" },
  { id: "ar.abdulbasitmujawwad", name: "Abdulbasit Abdussamed (Mücavved)" },
  { id: "ar.husary", name: "Mahmud Halil el-Husari (Murattal)" },
  { id: "ar.husarymujawwad", name: "Mahmud Halil el-Husari (Mücavved)" },
  { id: "ar.minshawi", name: "Muhammed Siddik el-Minşavi (Murattal)" },
  { id: "ar.minshawimujawwad", name: "Muhammed Siddik el-Minşavi (Mücavved)" },
  { id: "ar.abdurrahmaansudais", name: "Abdurrahman es-Sudeys (Kabe İmamı)" },
  { id: "ar.saoodshuraym", name: "Sud bin İbrahim eş-Şuraym (Kabe İmamı)" },
  { id: "ar.shaatree", name: "Ebu Bekir eş-Şatri" },
  { id: "ar.ahmedajamy", name: "Ahmed el-Acemi" },
  { id: "ar.hanirifai", name: "Hani er-Rifai" },
  { id: "ar.hudhaify", name: "Ali el-Hudaifi (Medine)" },
  { id: "ar.abdullahbasfar", name: "Abdullah Basfar" },
  { id: "ar.abdulsamad", name: "Abdussamed (tercihli)" },
  { id: "ar.ibrahimakhbar", name: "İbrahim El-Ehdar" },
  { id: "ar.muhammadayyoub", name: "Muhammed Eyyub" },
  { id: "ar.muhammadjibreel", name: "Muhammed Cibril" },
  { id: "ar.abdulazizazzahrani", name: "Abdulaziz ez-Zehrani" },
  { id: "ar.abdulbariaththubaity", name: "Abdulbari es-Subeysi" },
  { id: "ar.abdullahalmatrood", name: "Abdullah el-Matrood" },
  { id: "ar.abdullahawadaljuhani", name: "Abdullah Avad el-Cuhani" },
  { id: "ar.abdullahkhayat", name: "Abdullah Hayyat" },
  { id: "ar.abdulmohsenalharthy", name: "Abdulmuhsin el-Harsi" },
  { id: "ar.adilkalbani", name: "Adil el-Kalbani" },
  { id: "ar.ahmadalhawashy", name: "Ahmed el-Havaşi" },
  { id: "ar.ahmedalajmi", name: "Ahmed el-Acemi (net)" },
  { id: "ar.ahmedalhammad", name: "Ahmed el-Hammad" },
  { id: "ar.ahmedalmisbahi", name: "Ahmed el-Misbahi" },
  { id: "ar.ahmedamir", name: "Ahmed Emir" },
  { id: "ar.alafasy-2", name: "Mishary Al-Afasy (64kbps)" },
  { id: "ar.aymanswoaid", name: "Eyman Svaid" },
  { id: "ar.faresabbad", name: "Fares Abbad" },
  { id: "ar.mahmoudalialbanna", name: "Mahmud Ali el-Benna" },
  { id: "ar.mustafaismail", name: "Mustafa İsmail" },
  { id: "ar.nasseralqatami", name: "Nasser el-Katami" },
  { id: "ar.sahlyasin", name: "Sahl Yasin" },
  { id: "ar.salahalbudair", name: "Salah el-Budeyr" },
  { id: "ar.saudalshuraim", name: "Saud eş-Şuraym" },
  { id: "ar.yasseraldossari", name: "Yaser ed-Dossari" },
  { id: "ar.muhammadalluhaidan", name: "Muhammed el-Luhaydan" },
];

// ★ everyayah.com klasör adları — tam sure okuması için (kestirme mp3, surah bazlı değil)
// Ayet sesleri zaten islamic.network'ten geliyor; kelime sesleri qurancdn'den.
// Bu yüzden everyayah'a gerek yok — ayet bazlı okuma tüm hocalarda mevcut.

// Öğren modundaki ayet-bazlı sesler bu listeden (cdn.islamic.network — ayet ayet mp3).
const RECITERS = FALLBACK_RECITERS;

const MEALS = [
  { id: "tr.diyanet", name: "Diyanet İşleri Başkanlığı" },
  { id: "tr.ozturk", name: "Yaşar Nuri Öztürk" },
  { id: "tr.golpinarli", name: "Abdulbaki Gölpınarlı" },
  { id: "tr.vakfi", name: "Elmalılı Hamdi Yazır" },
] as const;

// quran.com Türkçe kelime meal id'leri
const QCOM_TR_WORD_TRANS = 77; // Diyanet

interface Props { open: boolean; onClose: () => void; initialMode?: Exclude<Mode, null>; }

const QuranLearnModal: React.FC<Props> = ({ open, onClose, initialMode }) => {
  const [mode, setMode] = useState<Mode>("learn");

  // Header'dan hangi sekmeyle açıldıysa o modda başla
  useEffect(() => { if (open && initialMode) setMode(initialMode); }, [open, initialMode]);

  // ── CANLI KARİ LİSTESİ (mp3quran.net — 241 hoca, Türkçe/Arapça isim) ──
  const [apiReciters, setApiReciters] = useState<Reciter[]>(FALLBACK_RECITERS);
  useEffect(() => {
    if (!open) return;
    let live = true;
    fetch("https://mp3quran.net/api/v3/reciters?language=ar")
      .then(r => r.json())
      .then((d: any) => {
        if (!live || !Array.isArray(d.reciters)) return;
        const list: Reciter[] = [];
        for (const r of d.reciters) {
          // Her hocanın birinci mushafı (murattal) dinleme sürümü olarak alınır
          const m = (r.moshaf ?? []).find((x: any) => /مرتل/.test(x.name || "")) ?? r.moshaf?.[0];
          if (!m?.server) continue;
          list.push({ id: `${m.server.replace(/\/$/, "")}|${r.name}|${m.name || ""}`, name: `${r.name}${m.name ? " · " + m.name : ""}` });
        }
        if (list.length > 0) setApiReciters(list);
      })
      .catch(() => undefined);
    return () => { live = false; };
  }, [open]);

  // ── Öğren state ──
  const [surahNo, setSurahNo] = useState(1);
  const [ayahNo, setAyahNo] = useState(1);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mealId, setMealId] = useState<string>("tr.diyanet");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeWord, setActiveWord] = useState<number | null>(null);
  const [speed, setSpeed] = useState(1);
  const [reciter, setReciter] = useState("ar.alafasy");
  const [wordLoading, setWordLoading] = useState(false);

  // ── Dinle state ──
  const [listenSurah, setListenSurah] = useState(36);
  const [listenReciter, setListenReciter] = useState("ar.alafasy");
  const [isPlaying, setIsPlaying] = useState(false);
  const [listenAyahIdx, setListenAyahIdx] = useState(0);
  const [continuous, setContinuous] = useState(true);
  const [loopAyah, setLoopAyah] = useState(false);
  const [repeatWord, setRepeatWord] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  if (!audioRef.current && typeof Audio !== "undefined") audioRef.current = new Audio();

  const SURAHS = useMemo(() => SURAH_LIST, []);
  const surah = SURAHS.find(s => s.n === surahNo) ?? SURAHS[0];
  const ayah = ayahs.find(a => a.n === ayahNo);

  // Sure listesi (114 sure sabit veri)
  function SURAH_LIST(): SurahInfo[] { return SURAHS_DATA; }

  // Ayetleri çek
  useEffect(() => {
    if (!open || mode !== "learn") return;
    let live = true;
    setLoading(true); setError(null); setAyahs([]); setWords([]); setActiveWord(null);
    fetch(`https://api.alquran.cloud/v1/surah/${surahNo}/editions/quran-uthmani,${mealId}`)
      .then(r => r.json())
      .then((d: any) => {
        if (!live) return;
        if (d.code !== 200) throw new Error("fail");
        const ar = d.data[0], tr = d.data[1];
        setAyahs(ar.ayahs.map((a: any, i: number) => ({
          n: a.numberInSurah,
          ar: (a.text || "").trim(),
          tr: tr.ayahs[i]?.text ?? "",
          juz: a.juz,
          page: a.page,
        })));
        setLoading(false);
      })
      .catch(() => { if (live) { setError("Ayetler yüklenemedi. İnternet bağlantını kontrol et."); setLoading(false); } });
    return () => { live = false; };
  }, [open, mode, surahNo, mealId]);

  // Kelime verisini çek (quran.com — kelime + TR meal + kelime sesi)
  useEffect(() => {
    if (!open || mode !== "learn") return;
    let live = true;
    setWordLoading(true); setWords([]); setActiveWord(null);
    fetch(`https://api.quran.com/api/v4/verses/by_key/${surahNo}:${ayahNo}?words=true&word_fields=text_uthmani&translations=${QCOM_TR_WORD_TRANS}`)
      .then(r => r.json())
      .then((d: any) => {
        if (!live) return;
        const ws = (d.verse?.words ?? []).filter((w: any) => w.char_type_name === "word");
        setWords(ws.map((w: any, i: number) => ({
          i,
          ar: w.text_uthmani,
          tr: w.translation?.text ?? "—",
          translit: w.transliteration?.text ?? "",
          audio: `https://audio.qurancdn.com/${w.audio_url}`,
        })));
        setWordLoading(false);
      })
      .catch(() => { if (live) setWordLoading(false); });
    return () => { live = false; };
  }, [open, mode, surahNo, ayahNo]);

  // Global ayet sırası (audio için)
  const globalAyahNo = useMemo(() => {
    let g = 0;
    for (const s of SURAHS_DATA) { if (s.n < surahNo) g += s.ayahs; }
    return g + ayahNo;
  }, [surahNo, ayahNo]);

  const stopAudio = useCallback(() => {
    const a = audioRef.current; if (!a) return;
    a.pause(); a.onended = null;
  }, []);

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

  const playWordAudio = (i: number) => {
    const a = audioRef.current; if (!a || !words[i]) return;
    stopAudio();
    a.src = words[i].audio;
    a.playbackRate = speed;
    a.play().catch(() => undefined);
    if (repeatWord) {
      a.onended = () => { a.play().catch(() => undefined); };
    } else {
      a.onended = null;
    }
  };

  // Ayeti sesli dinle (hoca seçimiyle, tekrar çal opsiyonu)
  const playAyahAudio = (onEnded?: () => void) => {
    const a = audioRef.current; if (!a) return;
    stopAudio();
    a.src = `https://cdn.islamic.network/quran/audio/128/${reciter}/${globalAyahNo}.mp3`;
    a.playbackRate = speed;
    if (loopAyah) {
      a.loop = true;
    } else {
      a.loop = false;
      if (onEnded) a.onended = onEnded;
    }
    a.play().catch(() => setError("Ses başlatılamadı."));
  };

  const replayAyah = () => playAyahAudio();

  // ── Dinle modu ──
  const listenSurahInfo = SURAHS_DATA.find(s => s.n === listenSurah) ?? SURAHS_DATA[35];
  const listenGlobal = useMemo(() => {
    let g = 0;
    for (const s of SURAHS_DATA) { if (s.n < listenSurah) g += s.ayahs; }
    return g;
  }, [listenSurah]);

  // mp3quran karileri tam-sure mp3 çalar (001.mp3…114.mp3); ar.* kariler ayet-ayet
  const isSurahReciter = listenReciter.includes("|");

  const startListening = useCallback((fromIdx = 0) => {
    const a = audioRef.current; if (!a) return;
    setListenAyahIdx(fromIdx);
    stopAudio();
    if (listenReciter.includes("|")) {
      // mp3quran: tam sure tek dosya
      const [server] = listenReciter.split("|");
      a.src = `${server}${String(listenSurah).padStart(3, "0")}.mp3`;
    } else {
      a.src = `https://cdn.islamic.network/quran/audio/128/${listenReciter}/${listenGlobal + fromIdx + 1}.mp3`;
    }
    a.playbackRate = speed;
    a.loop = false;
    a.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  }, [listenGlobal, listenReciter, listenSurah, speed, stopAudio]);

  useEffect(() => {
    const a = audioRef.current; if (!a) return;
    const onEnded = () => {
      if (listenReciter.includes("|")) { setIsPlaying(false); return; } // tam sure bitti
      if (mode === "listen" && continuous && listenAyahIdx < listenSurahInfo.ayahs - 1) {
        startListening(listenAyahIdx + 1);
      } else {
        setIsPlaying(false);
      }
    };
    a.addEventListener("ended", onEnded);
    return () => a.removeEventListener("ended", onEnded);
  }, [mode, continuous, listenAyahIdx, listenReciter, listenSurahInfo.ayahs, startListening]);

  const stopListening = () => { stopAudio(); setIsPlaying(false); };

  useEffect(() => { if (!open) { stopAudio(); setIsPlaying(false); } }, [open, stopAudio]);

  const filteredSurahs = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr");
    if (!q) return [];
    return SURAHS_DATA.filter(s =>
      s.name.toLocaleLowerCase("tr").includes(q) ||
      s.en.toLocaleLowerCase().includes(q) ||
      String(s.n) === q
    ).slice(0, 8);
  }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-slate-950/98 animate-fadeIn">
      {/* ÜST BAR */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-[#161622] px-4">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-gold px-1.5 py-1 text-xs font-black text-slate-900">N</span>
          <div className="flex overflow-hidden rounded-xl border border-white/10">
            <button onClick={() => { setMode("learn"); stopAudio(); }} className={`flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-bold transition ${mode === "learn" ? "bg-gold text-slate-950" : "text-white/60 hover:text-white"}`}>
              <BookOpen size={13} /> Kur'an Öğreniyorum
            </button>
            <button onClick={() => { setMode("listen"); stopAudio(); }} className={`flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-bold transition ${mode === "listen" ? "bg-gold text-slate-950" : "text-white/60 hover:text-white"}`}>
              <Headphones size={13} /> Kur'an Dinliyorum
            </button>
          </div>
        </div>
        <button onClick={onClose} className="flex items-center gap-1.5 rounded-xl border border-red-900/30 bg-red-950/40 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-400 transition hover:bg-red-900/60 active:scale-95">
          KAPAT <X size={13} />
        </button>
      </div>

      {/* ══════════ ÖĞREN MODU ══════════ */}
      {mode === "learn" && (
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Arama + seçim barı */}
          <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-white/10 bg-[#161622] px-4 py-2">
            <div className="relative min-w-48 flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
                placeholder="Sure ara (fatiha, bakara, mülk...)"
                className="h-8 w-full rounded-xl border border-white/10 bg-black/40 pl-8 pr-3 text-[11px] outline-none placeholder:text-white/25 focus:border-gold/50"
              />
              {searchOpen && filteredSurahs.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-20 mt-1.5 max-h-52 overflow-y-auto rounded-xl border border-gold/30 bg-slate-900 p-1 shadow-2xl scrollbar-thin">
                  {filteredSurahs.map(s => (
                    <button key={s.n} onClick={() => { setSurahNo(s.n); setQuery(""); setSearchOpen(false); }} className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[11px] transition hover:bg-gold/10">
                      <span className="font-bold text-white/85">{s.n}. {s.name} <span className="font-normal text-white/35">· {s.ayahs} ayet · {s.type}</span></span>
                      <span className="font-arabic text-sm text-gold-light">سورة {s.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <select value={surahNo} onChange={(e) => setSurahNo(Number(e.target.value))} className="h-8 max-w-44 rounded-xl border border-white/10 bg-black/40 px-2 text-[11px] font-semibold outline-none focus:border-gold/50">
              {SURAHS_DATA.map(s => <option key={s.n} value={s.n}>{s.n}. {s.name}</option>)}
            </select>
            <select value={ayahNo} onChange={(e) => { setAyahNo(Number(e.target.value)); setActiveWord(null); }} className="h-8 max-w-36 rounded-xl border border-white/10 bg-black/40 px-2 text-[11px] font-semibold outline-none focus:border-gold/50">
              {Array.from({ length: surah.ayahs }, (_, i) => <option key={i + 1} value={i + 1}>Ayet {i + 1}</option>)}
            </select>
            <select value={mealId} onChange={(e) => setMealId(e.target.value)} className="h-8 max-w-48 rounded-xl border border-white/10 bg-black/40 px-2 text-[11px] font-semibold outline-none focus:border-gold/50">
              {MEALS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <select value={reciter} onChange={(e) => setReciter(e.target.value)} className="h-8 max-w-56 rounded-xl border border-white/10 bg-black/40 px-2 text-[11px] font-semibold text-gold-light outline-none focus:border-gold/50">
              {RECITERS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>

          {/* 3 kolon */}
          <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
            {loading ? (
              <div className="flex flex-1 items-center justify-center gap-2 text-[12px] text-white/50"><Loader2 size={16} className="animate-spin" /> Ayetler yükleniyor…</div>
            ) : error ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
                <p className="text-[12px] text-red-400">{error}</p>
                <button onClick={() => setSurahNo(surahNo)} className="rounded-lg border border-gold/30 bg-gold/10 px-3 py-1.5 text-[10px] font-bold text-gold">Tekrar Dene</button>
              </div>
            ) : (
              <>
                {/* SOL: kelime kartı */}
                <div className="flex w-full flex-col gap-4 overflow-y-auto border-white/10 p-4 lg:w-[28%] lg:border-r scrollbar-thin">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gold">Mahreç & Kelime Kartı</h3>
                  {activeWord !== null && words[activeWord] ? (
                    <div className="rounded-2xl border border-gold/25 bg-gold/5 p-5 text-center animate-fadeIn">
                      <p className="font-arabic text-4xl leading-relaxed text-gold-light">{words[activeWord].ar}</p>
                      {words[activeWord].translit && <p className="mt-1 text-[10px] italic text-white/40">{words[activeWord].translit}</p>}
                      <p className="mt-2 text-[13px] font-bold text-white">{words[activeWord].tr}</p>
                      <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-white/30">Kelime {activeWord + 1} / {words.length} · {surah.name} {ayahNo}. Ayet</p>
                      <div className="mt-3 flex items-center justify-center gap-2">
                        <button onClick={() => playWordAudio(activeWord)} className="flex items-center gap-1.5 rounded-lg bg-gold px-3 py-1.5 text-[10px] font-black text-slate-950 transition hover:brightness-110 active:scale-95">
                          <RotateCcw size={11} /> Kelimeyi Tekrar Oku
                        </button>
                        <button
                          onClick={() => setRepeatWord(v => !v)}
                          className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[9px] font-black transition ${repeatWord ? "border-gold/40 bg-gold/15 text-gold" : "border-white/10 bg-white/[.04] text-white/50"}`}
                          title="Kelime sürekli tekrar eder"
                        >
                          <Repeat size={10} /> SÜREKLİ
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-white/10 bg-white/[.02] p-5 text-center">
                      <p className="text-[11px] text-white/40">Ortadaki Arapça kelimelerden birine tıkla — <b className="text-white/60">seçtiğin kelime yanar ve okunur</b>. Tekrar tıklayınca tekrar okur.</p>
                    </div>
                  )}

                  {/* Meal */}
                  <div className="rounded-2xl border border-white/10 bg-white/[.02] p-4">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/35">Ayet Meali</span>
                    <p className="mt-2 text-[12px] leading-relaxed text-white/75">{ayah?.tr}</p>
                    <span className="mt-2 block text-right text-[8px] font-bold text-white/25">{MEALS.find(m => m.id === mealId)?.name}</span>
                  </div>

                  {/* Kontroller */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => playAyahAudio()} className="flex items-center gap-1.5 rounded-lg bg-gold px-3 py-1.5 text-[10px] font-black text-slate-950 transition hover:brightness-110 active:scale-95"><Volume2 size={11} /> Ayeti Dinle</button>
                    <button onClick={replayAyah} className="flex items-center gap-1.5 rounded-lg bg-white/[.06] px-2.5 py-1.5 text-[10px] font-bold text-white/70 transition hover:bg-white/10"><RotateCcw size={11} /> Tekrar Çal</button>
                    <button
                      onClick={() => setLoopAyah(v => !v)}
                      className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[9px] font-black transition ${loopAyah ? "border-gold/40 bg-gold/15 text-gold" : "border-white/10 bg-white/[.04] text-white/50"}`}
                      title="Ayet sürekli döner"
                    >
                      <Repeat size={10} /> DÖNGÜ
                    </button>
                    <button onClick={() => { setAyahNo(n => Math.max(1, n - 1)); setActiveWord(null); }} disabled={ayahNo <= 1} className="rounded-lg bg-white/[.06] px-2.5 py-1.5 text-[10px] font-bold text-white/70 transition hover:bg-white/10 disabled:opacity-30">◀</button>
                    <button onClick={() => { setAyahNo(n => Math.min(surah.ayahs, n + 1)); setActiveWord(null); }} disabled={ayahNo >= surah.ayahs} className="rounded-lg bg-white/[.06] px-2.5 py-1.5 text-[10px] font-bold text-white/70 transition hover:bg-white/10 disabled:opacity-30">▶</button>
                  </div>

                  {/* Hız */}
                  <div className="flex items-center justify-center gap-1 rounded-xl border border-white/10 bg-black/40 p-0.5 text-[9px] font-bold">
                    {[0.75, 1, 1.25].map(v => (
                      <button key={v} onClick={() => setSpeed(v)} className={`rounded px-2.5 py-0.5 transition ${speed === v ? "bg-gold text-slate-950" : "text-white/50 hover:text-white"}`}>{v}x</button>
                    ))}
                  </div>
                </div>

                {/* ORTA: Arapça ayet, kelime kelime */}
                <div className="flex w-full flex-col items-center gap-4 overflow-y-auto border-white/10 p-5 lg:w-[47%] lg:border-r scrollbar-thin">
                  <div className="text-center">
                    <h4 className="font-arabic text-xl text-gold-light">سُورَةُ {surah.name}</h4>
                    <p className="mt-0.5 font-mono text-[10px] text-white/40">{surah.n}. {surah.name} Suresi — {ayahNo}. Ayet · {surah.type} · Cüz {ayah?.juz} · Sayfa {ayah?.page}</p>
                  </div>
                  <div className="flex w-full flex-wrap items-center justify-center gap-x-3 gap-y-3 rounded-2xl border border-white/10 bg-black/30 p-5">
                    {wordLoading ? (
                      <Loader2 size={18} className="animate-spin text-gold" />
                    ) : words.length > 0 ? (
                      words.map((w) => (
                        <button
                          key={w.i}
                          onClick={() => clickWord(w.i)}
                          className={`rounded-xl px-2.5 py-1 font-arabic text-2xl leading-relaxed transition-all active:scale-95 ${activeWord === w.i ? "bg-gold font-black text-slate-950 shadow-[0_0_14px_rgba(215,170,82,.45)]" : "text-white/85 hover:bg-gold/10 hover:text-gold"}`}
                        >
                          {w.ar}
                        </button>
                      ))
                    ) : (
                      <p className="text-[11px] text-white/40">{ayah?.ar}</p>
                    )}
                  </div>
                  {/* Ayet gezinme */}
                  <div className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[.03] px-3 py-2">
                    <button onClick={() => { setAyahNo(n => Math.max(1, n - 1)); setActiveWord(null); }} disabled={ayahNo <= 1} className="rounded-lg px-2.5 py-1 text-[10px] font-bold text-white/60 transition hover:text-white disabled:opacity-30">◀ Önceki Ayet</button>
                    <span className="text-[10px] font-bold text-gold">{ayahNo} / {surah.ayahs}</span>
                    <button onClick={() => { setAyahNo(n => Math.min(surah.ayahs, n + 1)); setActiveWord(null); }} disabled={ayahNo >= surah.ayahs} className="rounded-lg px-2.5 py-1 text-[10px] font-bold text-white/60 transition hover:text-white disabled:opacity-30">Sonraki Ayet ▶</button>
                  </div>
                </div>

                {/* SAĞ: kelime tablosu */}
                <div className="flex w-full flex-col overflow-y-auto p-4 lg:w-[25%] scrollbar-thin">
                  <h3 className="mb-2 text-[10px] font-black uppercase tracking-widest text-gold">Kelime Kelime Çözüm</h3>
                  <div className="overflow-hidden rounded-xl border border-white/10">
                    {wordLoading ? (
                      <div className="flex items-center justify-center gap-2 p-4 text-[11px] text-white/40"><Loader2 size={13} className="animate-spin" /> kelimeler…</div>
                    ) : words.map((w, i) => (
                      <button key={w.i} onClick={() => clickWord(i)} className={`flex w-full items-center justify-between gap-2 border-b border-white/5 px-3 py-2 text-left transition last:border-0 ${activeWord === i ? "bg-gold/15" : "hover:bg-white/[.04]"}`}>
                        <span className="w-5 text-[9px] font-black text-white/30">{i + 1}</span>
                        <span className="flex-1 truncate text-[10px] font-bold text-white/75">{w.tr}</span>
                        <span className="font-arabic text-lg text-gold-light">{w.ar}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ══════════ DİNLE MODU ══════════ */}
      {mode === "listen" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 overflow-y-auto p-6 scrollbar-thin">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#161622] p-7 shadow-2xl">
            <span className="text-[9px] font-bold uppercase tracking-widest text-gold">Kesintisiz Ayet Ayet Oynatıcı</span>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-[9px] font-bold uppercase text-white/40">Sure</span>
                <select value={listenSurah} onChange={(e) => { setListenSurah(Number(e.target.value)); stopListening(); }} className="rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-[12px] font-semibold outline-none focus:border-gold/50">
                  {SURAHS_DATA.map(s => <option key={s.n} value={s.n}>{s.n}. {s.name} ({s.ayahs} ayet)</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[9px] font-bold uppercase text-white/40">Okuyan Hoca (Kari) — {apiReciters.length} kari</span>
                <select value={listenReciter} onChange={(e) => { setListenReciter(e.target.value); stopListening(); }} className="h-11 rounded-xl border border-white/10 bg-black/40 px-3 text-[12px] font-semibold outline-none focus:border-gold/50">
                  {apiReciters.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </label>
            </div>

            {/* Görsel durum */}
            <div className="mt-4 flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/40 p-5 text-center">
              {isPlaying ? (
                <>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">Çalıyor</span>
                  <p className="font-arabic text-2xl text-gold-light">سُورَةُ {listenSurahInfo.name}</p>
                  <p className="text-[10px] text-white/45">{isSurahReciter ? "tam sure · " : `${listenAyahIdx + 1}. ayet · `}{(apiReciters.find(r => r.id === listenReciter)?.name ?? RECITERS.find(r => r.id === listenReciter)?.name ?? "")}</p>
                </>
              ) : (
                <p className="text-[11px] text-white/40">Başlat'a bas — sure, seçtiğin hoca sesiyle okunur.</p>
              )}
            </div>

            {/* Kontroller */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-black/40 p-0.5 text-[9px] font-bold">
                {[0.75, 1, 1.25, 1.5].map(v => (
                  <button key={v} onClick={() => { setSpeed(v); if (audioRef.current) audioRef.current.playbackRate = v; }} className={`rounded px-2 py-0.5 transition ${speed === v ? "bg-gold text-slate-950" : "text-white/50 hover:text-white"}`}>{v}x</button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                {!isSurahReciter && (
                  <button onClick={() => startListening(Math.max(0, listenAyahIdx - 1))} className="rounded-full bg-white/[.06] p-2.5 text-white/70 transition hover:bg-white/10 active:scale-95" title="Önceki ayet">⏮</button>
                )}
                {isPlaying ? (
                  <button onClick={stopListening} className="rounded-full bg-gold p-4 text-slate-950 shadow-lg shadow-gold/20 transition hover:brightness-110 active:scale-90"><Pause size={22} /></button>
                ) : (
                  <button onClick={() => startListening(listenAyahIdx)} className="rounded-full bg-gold p-4 text-slate-950 shadow-lg shadow-gold/20 transition hover:brightness-110 active:scale-90"><Play size={22} /></button>
                )}
                {!isSurahReciter && (
                  <button onClick={() => startListening(Math.min(listenSurahInfo.ayahs - 1, listenAyahIdx + 1))} className="rounded-full bg-white/[.06] p-2.5 text-white/70 transition hover:bg-white/10 active:scale-95" title="Sonraki ayet">⏭</button>
                )}
              </div>
              <button onClick={() => setContinuous(c => !c)} className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[9px] font-black transition ${continuous ? "border-emerald-900/30 bg-emerald-950/40 text-emerald-400" : "border-white/10 bg-white/[.04] text-white/40"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${continuous ? "animate-pulse bg-emerald-400" : "bg-white/30"}`} />
                SÜREKLİ {continuous ? "AÇIK" : "KAPALI"}
              </button>
            </div>
            <p className="mt-3 text-center text-[8px] font-bold uppercase tracking-widest text-white/25">241 kari (mp3quran.net) · ayet ayet akış · kaynak: islamic.network</p>
          </div>
        </div>
      )}
    </div>
  );
};

// ── 114 sure verisi ──
interface SurahInfo { n: number; name: string; en: string; ayahs: number; type: string; }
const SURAHS_DATA: SurahInfo[] = [
  { n: 1, name: "Fâtiha", en: "Al-Faatiha", ayahs: 7, type: "Mekkî" },
  { n: 2, name: "Bakara", en: "Al-Baqara", ayahs: 286, type: "Medenî" },
  { n: 3, name: "Âl-i İmrân", en: "Aal-i-Imraan", ayahs: 200, type: "Medenî" },
  { n: 4, name: "Nisâ", en: "An-Nisaa", ayahs: 176, type: "Medenî" },
  { n: 5, name: "Mâide", en: "Al-Maaida", ayahs: 120, type: "Medenî" },
  { n: 6, name: "En'âm", en: "Al-An'aam", ayahs: 165, type: "Mekkî" },
  { n: 7, name: "A'râf", en: "Al-Araaf", ayahs: 206, type: "Mekkî" },
  { n: 8, name: "Enfâl", en: "Al-Anfaal", ayahs: 75, type: "Medenî" },
  { n: 9, name: "Tevbe", en: "At-Tawba", ayahs: 129, type: "Medenî" },
  { n: 10, name: "Yûnus", en: "Yunus", ayahs: 109, type: "Mekkî" },
  { n: 11, name: "Hûd", en: "Hud", ayahs: 123, type: "Mekkî" },
  { n: 12, name: "Yûsuf", en: "Yusuf", ayahs: 111, type: "Mekkî" },
  { n: 13, name: "Ra'd", en: "Ar-Ra'd", ayahs: 43, type: "Medenî" },
  { n: 14, name: "İbrâhîm", en: "Ibrahim", ayahs: 52, type: "Mekkî" },
  { n: 15, name: "Hicr", en: "Al-Hijr", ayahs: 99, type: "Mekkî" },
  { n: 16, name: "Nahl", en: "An-Nahl", ayahs: 128, type: "Mekkî" },
  { n: 17, name: "İsrâ", en: "Al-Israa", ayahs: 111, type: "Mekkî" },
  { n: 18, name: "Kehf", en: "Al-Kahf", ayahs: 110, type: "Mekkî" },
  { n: 19, name: "Meryem", en: "Maryam", ayahs: 98, type: "Mekkî" },
  { n: 20, name: "Tâhâ", en: "Taa-Haa", ayahs: 135, type: "Mekkî" },
  { n: 21, name: "Enbiyâ", en: "Al-Anbiyaa", ayahs: 112, type: "Mekkî" },
  { n: 22, name: "Hac", en: "Al-Hajj", ayahs: 78, type: "Medenî" },
  { n: 23, name: "Mü'minûn", en: "Al-Muminoon", ayahs: 118, type: "Mekkî" },
  { n: 24, name: "Nûr", en: "An-Noor", ayahs: 64, type: "Medenî" },
  { n: 25, name: "Furkân", en: "Al-Furqaan", ayahs: 77, type: "Mekkî" },
  { n: 26, name: "Şuarâ", en: "Ash-Shuaraa", ayahs: 227, type: "Mekkî" },
  { n: 27, name: "Neml", en: "An-Naml", ayahs: 93, type: "Mekkî" },
  { n: 28, name: "Kasas", en: "Al-Qasas", ayahs: 88, type: "Mekkî" },
  { n: 29, name: "Ankebût", en: "Al-Ankaboot", ayahs: 69, type: "Mekkî" },
  { n: 30, name: "Rûm", en: "Ar-Room", ayahs: 60, type: "Mekkî" },
  { n: 31, name: "Lokmân", en: "Luqman", ayahs: 34, type: "Mekkî" },
  { n: 32, name: "Secde", en: "As-Sajda", ayahs: 30, type: "Mekkî" },
  { n: 33, name: "Ahzâb", en: "Al-Ahzaab", ayahs: 73, type: "Medenî" },
  { n: 34, name: "Sebe'", en: "Saba", ayahs: 54, type: "Mekkî" },
  { n: 35, name: "Fâtır", en: "Faatir", ayahs: 45, type: "Mekkî" },
  { n: 36, name: "Yâsîn", en: "Yaseen", ayahs: 83, type: "Mekkî" },
  { n: 37, name: "Sâffât", en: "As-Saaffaat", ayahs: 182, type: "Mekkî" },
  { n: 38, name: "Sâd", en: "Saad", ayahs: 88, type: "Mekkî" },
  { n: 39, name: "Zümer", en: "Az-Zumar", ayahs: 75, type: "Mekkî" },
  { n: 40, name: "Mü'min", en: "Ghafir", ayahs: 85, type: "Mekkî" },
  { n: 41, name: "Fussilet", en: "Fussilat", ayahs: 54, type: "Mekkî" },
  { n: 42, name: "Şûrâ", en: "Ash-Shura", ayahs: 53, type: "Mekkî" },
  { n: 43, name: "Zuhruf", en: "Az-Zukhruf", ayahs: 89, type: "Mekkî" },
  { n: 44, name: "Duhân", en: "Ad-Dukhan", ayahs: 59, type: "Mekkî" },
  { n: 45, name: "Câsiye", en: "Al-Jaathiya", ayahs: 37, type: "Mekkî" },
  { n: 46, name: "Ahkâf", en: "Al-Ahqaf", ayahs: 35, type: "Mekkî" },
  { n: 47, name: "Muhammed", en: "Muhammad", ayahs: 38, type: "Medenî" },
  { n: 48, name: "Fetih", en: "Al-Fath", ayahs: 29, type: "Medenî" },
  { n: 49, name: "Hucurât", en: "Al-Hujuraat", ayahs: 18, type: "Medenî" },
  { n: 50, name: "Kâf", en: "Qaaf", ayahs: 45, type: "Mekkî" },
  { n: 51, name: "Zâriyât", en: "Adh-Dhaariyat", ayahs: 60, type: "Mekkî" },
  { n: 52, name: "Tûr", en: "At-Tur", ayahs: 49, type: "Mekkî" },
  { n: 53, name: "Necm", en: "An-Najm", ayahs: 62, type: "Mekkî" },
  { n: 54, name: "Kamer", en: "Al-Qamar", ayahs: 55, type: "Mekkî" },
  { n: 55, name: "Rahmân", en: "Ar-Rahmaan", ayahs: 78, type: "Medenî" },
  { n: 56, name: "Vâkıa", en: "Al-Waaqia", ayahs: 96, type: "Mekkî" },
  { n: 57, name: "Hadîd", en: "Al-Hadid", ayahs: 29, type: "Medenî" },
  { n: 58, name: "Mucâdele", en: "Al-Mujaadila", ayahs: 22, type: "Medenî" },
  { n: 59, name: "Haşr", en: "Al-Hashr", ayahs: 24, type: "Medenî" },
  { n: 60, name: "Mümtehine", en: "Al-Mumtahana", ayahs: 13, type: "Medenî" },
  { n: 61, name: "Saf", en: "As-Saff", ayahs: 14, type: "Medenî" },
  { n: 62, name: "Cuma", en: "Al-Jumuaa", ayahs: 11, type: "Medenî" },
  { n: 63, name: "Münâfikûn", en: "Al-Munaafiqoon", ayahs: 11, type: "Medenî" },
  { n: 64, name: "Teğâbun", en: "At-Taghaabun", ayahs: 18, type: "Medenî" },
  { n: 65, name: "Talâk", en: "At-Talaaq", ayahs: 12, type: "Medenî" },
  { n: 66, name: "Tahrîm", en: "At-Tahrim", ayahs: 12, type: "Medenî" },
  { n: 67, name: "Mülk", en: "Al-Mulk", ayahs: 30, type: "Mekkî" },
  { n: 68, name: "Kalem", en: "Al-Qalam", ayahs: 52, type: "Mekkî" },
  { n: 69, name: "Hâkka", en: "Al-Haaqqa", ayahs: 52, type: "Mekkî" },
  { n: 70, name: "Meâric", en: "Al-Maarij", ayahs: 44, type: "Mekkî" },
  { n: 71, name: "Nûh", en: "Nooh", ayahs: 28, type: "Mekkî" },
  { n: 72, name: "Cin", en: "Al-Jinn", ayahs: 28, type: "Mekkî" },
  { n: 73, name: "Müzzemmil", en: "Al-Muzzammil", ayahs: 20, type: "Mekkî" },
  { n: 74, name: "Müddessir", en: "Al-Muddassir", ayahs: 56, type: "Mekkî" },
  { n: 75, name: "Kıyâme", en: "Al-Qiyaama", ayahs: 40, type: "Mekkî" },
  { n: 76, name: "İnsân", en: "Al-Insaan", ayahs: 31, type: "Medenî" },
  { n: 77, name: "Mürselât", en: "Al-Mursalaat", ayahs: 50, type: "Mekkî" },
  { n: 78, name: "Nebe'", en: "An-Naba", ayahs: 40, type: "Mekkî" },
  { n: 79, name: "Nâziât", en: "An-Naaziaat", ayahs: 46, type: "Mekkî" },
  { n: 80, name: "Abese", en: "Abasa", ayahs: 42, type: "Mekkî" },
  { n: 81, name: "Tekvîr", en: "At-Takwir", ayahs: 29, type: "Mekkî" },
  { n: 82, name: "İnfitâr", en: "Al-Infitaar", ayahs: 19, type: "Mekkî" },
  { n: 83, name: "Mutaffifîn", en: "Al-Mutaffifin", ayahs: 36, type: "Mekkî" },
  { n: 84, name: "İnşikâk", en: "Al-Inshiqaar", ayahs: 25, type: "Mekkî" },
  { n: 85, name: "Burûc", en: "Al-Burooj", ayahs: 22, type: "Mekkî" },
  { n: 86, name: "Târik", en: "At-Taariq", ayahs: 17, type: "Mekkî" },
  { n: 87, name: "A'lâ", en: "Al-Aalaa", ayahs: 19, type: "Mekkî" },
  { n: 88, name: "Ğâşiye", en: "Al-Ghaashiya", ayahs: 26, type: "Mekkî" },
  { n: 89, name: "Fecr", en: "Al-Fajr", ayahs: 30, type: "Mekkî" },
  { n: 90, name: "Beled", en: "Al-Balad", ayahs: 20, type: "Mekkî" },
  { n: 91, name: "Şems", en: "Ash-Shams", ayahs: 15, type: "Mekkî" },
  { n: 92, name: "Leyl", en: "Al-Layl", ayahs: 21, type: "Mekkî" },
  { n: 93, name: "Duhâ", en: "Ad-Duhaa", ayahs: 11, type: "Mekkî" },
  { n: 94, name: "İnşirâh", en: "Ash-Sharh", ayahs: 8, type: "Mekkî" },
  { n: 95, name: "Tîn", en: "At-Tiin", ayahs: 8, type: "Mekkî" },
  { n: 96, name: "Alak", en: "Al-Alaq", ayahs: 19, type: "Mekkî" },
  { n: 97, name: "Kadr", en: "Al-Qadr", ayahs: 5, type: "Mekkî" },
  { n: 98, name: "Beyyine", en: "Al-Bayina", ayahs: 8, type: "Medenî" },
  { n: 99, name: "Zilzâl", en: "Az-Zalzala", ayahs: 8, type: "Medenî" },
  { n: 100, name: "Âdiyât", en: "Al-Aadiyaat", ayahs: 11, type: "Mekkî" },
  { n: 101, name: "Kâria", en: "Al-Qaaria", ayahs: 11, type: "Mekkî" },
  { n: 102, name: "Tekâsür", en: "At-Takaathur", ayahs: 8, type: "Mekkî" },
  { n: 103, name: "Asr", en: "Al-Asr", ayahs: 3, type: "Mekkî" },
  { n: 104, name: "Hümeze", en: "Al-Humaza", ayahs: 9, type: "Mekkî" },
  { n: 105, name: "Fîl", en: "Al-Fil", ayahs: 5, type: "Mekkî" },
  { n: 106, name: "Kureyş", en: "Quraish", ayahs: 4, type: "Mekkî" },
  { n: 107, name: "Mâûn", en: "Al-Maun", ayahs: 7, type: "Mekkî" },
  { n: 108, name: "Kevser", en: "Al-Kawthar", ayahs: 3, type: "Mekkî" },
  { n: 109, name: "Kâfirûn", en: "Al-Kaafiroon", ayahs: 6, type: "Mekkî" },
  { n: 110, name: "Nasr", en: "An-Nasr", ayahs: 3, type: "Medenî" },
  { n: 111, name: "Tebbet", en: "Al-Masad", ayahs: 5, type: "Mekkî" },
  { n: 112, name: "İhlâs", en: "Al-Ikhlaas", ayahs: 4, type: "Mekkî" },
  { n: 113, name: "Felak", en: "Al-Falak", ayahs: 5, type: "Mekkî" },
  { n: 114, name: "Nâs", en: "An-Naas", ayahs: 6, type: "Mekkî" },
];

export default QuranLearnModal;
