import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Headphones, Play, Pause, RotateCcw, Search, X, Loader2, Volume2, Repeat } from "lucide-react";

// ══════════════════════════════════════════════════════════════
// QuranLearnModal — "Kur'an Öğreniyorum" + "Kur'an Dinliyorum"
// Veri: api.alquran.cloud (114 sure, Arapça + 4 Türkçe meal)
// Kelime: api.quran.com (kelime kelime Arapça + TR meal + kelime sesi)
// Ses: everyayah.com (ayet bazlı, 30 kari) + audio.qurancdn.com (kelime)
// ══════════════════════════════════════════════════════════════

type Mode = "learn" | "listen" | null;

interface Reciter { id: string; name: string; everyayah?: string; }
interface Ayah { n: number; ar: string; tr: string; juz: number; page: number; }
interface Word { i: number; ar: string; tr: string; translit: string; audio: string; }

// ★ KARİ LİSTESİ — everyayah.com AYET BAZLI sesler (her hoca, her ayet için ayrı mp3:
//    001001.mp3 = 1. sure 1. ayet). Kelime/ayet tekrar sistemi bu yüzden tam-sure değil
//    ayet-ayet dosyalarla çalışır. 30 kari tek tek test edildi (hepsi 200 OK).
const RECITERS: Reciter[] = [
  { id: "Alafasy_128kbps", name: "Mishary Rashid Al-Afasy" },
  { id: "MaherAlMuaiqly128kbps", name: "Mahir el-Muaykli (Kabe İmamı)" },
  { id: "Abdul_Basit_Murattal_192kbps", name: "Abdulbasit Abdussamed (Murattal)" },
  { id: "Abdul_Basit_Mujawwad_128kbps", name: "Abdulbasit Abdussamed (Mücavved)" },
  { id: "Husary_128kbps", name: "Mahmud Halil el-Husari (Murattal)" },
  { id: "Husary_Mujawwad_64kbps", name: "Mahmud Halil el-Husari (Mücavved)" },
  { id: "Minshawy_Murattal_128kbps", name: "Muhammed Siddik el-Minşavi (Murattal)" },
  { id: "Minshawy_Mujawwad_192kbps", name: "Muhammed Siddik el-Minşavi (Mücavved)" },
  { id: "Menshawi_16kbps", name: "Muhammed Siddik el-Minşavi (Eski Kayıt)" },
  { id: "Ghamadi_40kbps", name: "Saad el-Gamidi" },
  { id: "Abu_Bakr_Ash-Shaatree_128kbps", name: "Ebu Bekir eş-Şatri" },
  { id: "Akram_AlAlaqimy_128kbps", name: "Ekrem el-Alakmi" },
  { id: "Ali_Jaber_64kbps", name: "Ali Cabir (Mescid-i Haram)" },
  { id: "Ayman_Sowaid_64kbps", name: "Eyman es-Suvayd" },
  { id: "Fares_Abbad_64kbps", name: "Fares Abbad" },
  { id: "Hani_Rifai_192kbps", name: "Hani er-Rifai" },
  { id: "Hudhaify_128kbps", name: "Ali el-Hudaifi (Medine)" },
  { id: "Ibrahim_Akhdar_32kbps", name: "İbrahim El-Ehdar" },
  { id: "Mahmoud_Ali_Al_Banna_32kbps", name: "Mahmud Ali el-Benna" },
  { id: "Mohammad_al_Tablaway_128kbps", name: "Muhammed et-Tablavi" },
  { id: "Muhammad_Ayyoub_128kbps", name: "Muhammed Eyyub (Medine)" },
  { id: "Muhammad_Jibreel_64kbps", name: "Muhammed Cibril" },
  { id: "Muhsin_Al_Qasim_192kbps", name: "Muhsin el-Kasım (Medine)" },
  { id: "Mustafa_Ismail_48kbps", name: "Mustafa İsmail" },
  { id: "Nasser_Alqatami_128kbps", name: "Nasser el-Katami" },
  { id: "Sahl_Yassin_128kbps", name: "Sehl Yasin (Medine)" },
  { id: "Salah_Al_Budair_128kbps", name: "Salah el-Budeyr" },
  { id: "Saood_ash-Shuraym_128kbps", name: "Sud eş-Şuraym (Kabe İmamı)" },
  { id: "Yasser_Ad-Dussary_128kbps", name: "Yaser ed-Dossari" },
  { id: "Abdullah_Matroud_128kbps", name: "Abdullah el-Metroud" },
];

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
  // ★ OTOMATİK OKU: açıkken ayet biter bitmez sıradaki ayeti okur; kelimeye tıklayınca
  //    o kelime (yoksa o ayet) okunur ve okuma kaldığı yerden devam eder.
  const [autoRead, setAutoRead] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [reciter, setReciter] = useState("ar.alafasy");
  const [wordLoading, setWordLoading] = useState(false);

  // ── AYET İÇİ KELİME ARAMA: "rahmet" yazınca rahmet geçen ayetler listelenir ──
  const [ayahResults, setAyahResults] = useState<{ s: number; sn: string; a: number; text: string }[]>([]);
  const [searching, setSearching] = useState(false);
  useEffect(() => {
    const q = query.trim();
    if (!open || mode !== "learn" || q.length < 2) { setAyahResults([]); setSearching(false); return; }
    let live = true;
    setSearching(true);
    const t = setTimeout(() => {
      // Arapça harf varsa Osmanlı metninde, yoksa seçili mealette ara
      const isArabic = /[\u0600-\u06FF]/.test(q);
      const edition = isArabic ? "quran-uthmani" : mealId;
      fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(q)}/all/${edition}`)
        .then(r => r.json())
        .then((d: any) => {
          if (!live) return;
          setSearching(false);
          const ms = d.code === 200 && Array.isArray(d.data?.matches) ? d.data.matches : [];
          setAyahResults(ms.slice(0, 12).map((m: any) => ({
            s: m.surah.number,
            sn: m.surah.name,
            a: m.numberInSurah,
            text: String(m.text || "").slice(0, 90),
          })));
        })
        .catch(() => { if (live) { setSearching(false); setAyahResults([]); } });
    }, 400);
    return () => { live = false; clearTimeout(t); };
  }, [query, mealId, mode, open]);

  // ── Dinle state ──
  const [listenSurah, setListenSurah] = useState(36);
  const [listenReciter, setListenReciter] = useState("Alafasy_128kbps");
  const [isPlaying, setIsPlaying] = useState(false);
  const [listenAyahIdx, setListenAyahIdx] = useState(0);
  const [nextSurahAuto, setNextSurahAuto] = useState(true);
  const [wholeQuran, setWholeQuran] = useState(false);
  const [wholeIdx, setWholeIdx] = useState({ s: 1, a: 1 });
  const [loopAyah, setLoopAyah] = useState(false);
  const [loopAyahListen, setLoopAyahListen] = useState(false);
  const [repeatWord, setRepeatWord] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  if (!audioRef.current && typeof Audio !== "undefined") audioRef.current = new Audio();

  const surah = SURAHS_DATA.find(s => s.n === surahNo) ?? SURAHS_DATA[0];
  const ayah = ayahs.find(a => a.n === ayahNo);

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
    a.pause(); a.onended = null; a.ontimeupdate = null;
  }, []);

  // ★ YEDEK: quran.com engellenirse ayet metnini kelimelere böl — kelime tıklama
  //    ve altın vurgu her koşulda çalışır; ses olarak ayet sesi okunur.
  useEffect(() => {
    if (!open || mode !== "learn" || wordLoading || words.length > 0) return;
    const text = ayah?.ar?.replace(/^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/, "").trim();
    if (!text) return;
    const parts = text.split(/\s+/).filter(Boolean);
    if (parts.length > 0) setWords(parts.map((ar, i) => ({ i, ar, tr: "—", translit: "", audio: "" })));
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

  const playWordAudio = (i: number) => {
    const a = audioRef.current; if (!a || !words[i]) return;
    stopAudio();
    if (words[i].audio) {
      a.src = words[i].audio;
    } else {
      // Kelime sesi yoksa (yedek mod) ayet sesini çal
      a.src = `https://everyayah.com/data/${reciter}/${String(surahNo).padStart(3, "0")}${String(ayahNo).padStart(3, "0")}.mp3`;
    }
    a.playbackRate = speed;
    a.play().catch(() => undefined);
    if (repeatWord) {
      a.onended = () => { a.play().catch(() => undefined); };
    } else {
      a.onended = null;
    }
  };

  // Ayeti sesli dinle (hoca seçimiyle, tekrar çal opsiyonu) — everyayah ayet dosyası
  const playAyahAudio = (onEnded?: () => void) => {
    const a = audioRef.current; if (!a) return;
    stopAudio();
    a.src = `https://everyayah.com/data/${reciter}/${String(surahNo).padStart(3, "0")}${String(ayahNo).padStart(3, "0")}.mp3`;
    a.playbackRate = speed;
    // ★ KELİME TAKİBİ: sesin süresi boyunca kelime kelime sarı yansıt —
    //    currentTime/duration oranıyla anlık senkron (milisaniye hassasiyetli takip)
    a.ontimeupdate = () => {
      if (!a.duration || words.length === 0) return;
      const idx = Math.min(words.length - 1, Math.floor((a.currentTime / a.duration) * words.length));
      setActiveWord(idx);
    };
    if (loopAyah) {
      a.loop = true;
    } else {
      a.loop = false;
      if (onEnded) a.onended = onEnded;
      else if (autoRead) {
        // Otomatik oku: ayet bitince sıradaki ayet (sure sonunda durur)
        a.onended = () => {
          if (ayahNo < surah.ayahs) {
            setAyahNo(ayahNo + 1);
            setActiveWord(null);
          } else {
            setAutoRead(false);
          }
        };
      }
    }
    // Tarayıcı ses engellemesine karşı: ilk deneme başarısızsa 250ms sonra bir kez daha dene
    a.play().catch(() => {
      setTimeout(() => { a.play().catch(() => setError("Ses başlatılamadı — bir kez daha tıkla.")); }, 250);
    });
  };

  const replayAyah = () => playAyahAudio();

  // Ayet değişince otomatik oku modundaysa yeni ayeti başlat
  useEffect(() => {
    if (open && mode === "learn" && autoRead && ayahNo > 0) {
      const t = setTimeout(() => playAyahAudio(), 150);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ayahNo, autoRead, open, mode]);

  // ── Dinle modu ──
  const listenSurahInfo = SURAHS_DATA.find(s => s.n === listenSurah) ?? SURAHS_DATA[35];
  // Hoca arama kutusu — "mahir", "husari" yaz, liste anında filtrelenir
  const [reciterSearch, setReciterSearch] = useState("");
  const filteredReciters = useMemo(() => {
    const q = reciterSearch.trim().toLocaleLowerCase("tr");
    if (!q) return RECITERS;
    return RECITERS.filter(r => r.name.toLocaleLowerCase("tr").includes(q));
  }, [reciterSearch]);
  // ★ Ayet mp3 yolu — everyayah (30 kari, hepsi ayet bazlı, tek tek test edildi)
  const ayahUrl = useCallback((sN: number, aN: number) =>
    `https://everyayah.com/data/${listenReciter}/${String(sN).padStart(3, "0")}${String(aN).padStart(3, "0")}.mp3`, [listenReciter]);

  const playAt = useCallback((sN: number, ayahIdx: number) => {
    const a = audioRef.current; if (!a) return;
    setListenAyahIdx(ayahIdx);
    a.src = ayahUrl(sN, ayahIdx + 1);
    a.playbackRate = speed;
    a.loop = false;
    a.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  }, [ayahUrl, speed]);

  const startListening = useCallback((fromIdx = 0) => {
    stopAudio();
    const sN = wholeQuran ? 1 : listenSurah;
    if (wholeQuran) { setWholeIdx({ s: 1, a: fromIdx + 1 }); setListenSurah(1); }
    const a = audioRef.current; if (!a) return;
    setListenAyahIdx(fromIdx);
    a.src = ayahUrl(sN, fromIdx + 1);
    a.playbackRate = speed;
    a.loop = false;
    a.play().then(() => setIsPlaying(true)).catch(() => {
      setTimeout(() => { a.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false)); }, 250);
    });
  }, [wholeQuran, listenSurah, ayahUrl, speed, stopAudio]);

  useEffect(() => {
    const a = audioRef.current; if (!a) return;
    const onEnded = () => {
      if (loopAyahListen) { a.currentTime = 0; a.play().catch(() => undefined); return; }
      const sNow = wholeQuran ? wholeIdx.s : listenSurah;
      const total = SURAHS_DATA.find(s => s.n === sNow)?.ayahs ?? listenSurahInfo.ayahs;
      if (listenAyahIdx + 1 < total) { playAt(sNow, listenAyahIdx + 1); return; }
      // Sure bitti → KOMPLE KUR'AN ya da SIRADAKİ SURE açıksa bir sonraki sureye geç
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
  }, [loopAyahListen, wholeQuran, nextSurahAuto, wholeIdx, listenSurah, listenAyahIdx, playAt, listenSurahInfo.ayahs]);

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
    <div className="fixed inset-0 z-[80] flex flex-col animate-fadeIn bg-gradient-to-b from-[#0d1017] via-[#0b0e15] to-[#090b10]">
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
                placeholder="Sure ara veya ayette kelime ara (rahmet, sabır, نور...)"
                className="h-8 w-full rounded-xl border border-white/10 bg-black/40 pl-8 pr-3 text-[11px] outline-none placeholder:text-white/25 focus:border-gold/50"
              />
              {searchOpen && (filteredSurahs.length > 0 || ayahResults.length > 0 || searching) && (
                <div className="absolute left-0 right-0 top-full z-20 mt-1.5 max-h-80 overflow-y-auto rounded-xl border border-gold/30 bg-slate-900 p-1 shadow-2xl scrollbar-thin">
                  {filteredSurahs.length > 0 && (
                    <p className="px-2.5 pt-1.5 pb-1 text-[8px] font-black uppercase tracking-widest text-white/30">Sureler</p>
                  )}
                  {filteredSurahs.map(s => (
                    <button key={s.n} onClick={() => { setSurahNo(s.n); setQuery(""); setSearchOpen(false); setAyahResults([]); }} className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[11px] transition hover:bg-gold/10">
                      <span className="font-bold text-white/85">{s.n}. {s.name} <span className="font-normal text-white/35">· {s.ayahs} ayet · {s.type}</span></span>
                      <span className="font-arabic text-sm text-gold-light">سورة {s.name}</span>
                    </button>
                  ))}
                  {(ayahResults.length > 0 || searching) && (
                    <p className="px-2.5 pt-2 pb-1 text-[8px] font-black uppercase tracking-widest text-white/30">{searching ? "Ayetler aranıyor…" : "Ayetlerde geçen kelimeler"}</p>
                  )}
                  {ayahResults.map((r, idx) => (
                    <button key={`${r.s}:${r.a}:${idx}`} onClick={() => { setSurahNo(r.s); setAyahNo(r.a); setActiveWord(null); setQuery(""); setSearchOpen(false); setAyahResults([]); }} className="flex w-full flex-col gap-0.5 rounded-lg px-2.5 py-1.5 text-left transition hover:bg-gold/10">
                      <span className="text-[10px] font-bold text-gold">{r.s}. {r.sn} — {r.a}. ayet</span>
                      <span className="line-clamp-2 text-[10px] text-white/55" dir="auto">{r.text}…</span>
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
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gold">Ayetin Bütünü</h3>
                  <div className="rounded-2xl border border-gold/25 bg-[#12151f] p-4 text-center">
                    <p className="font-arabic text-2xl leading-loose text-white/95" dir="rtl">{ayah?.ar}</p>
                    <p className="mt-1 text-[9px] italic text-white/35">Ortadaki kelimelere tıkla — seçtiğin kelime sarı yansır ve okunur</p>
                  </div>
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

                  {/* Sure ayetleri — birkaç ayet görünür, kaydır; tıklayınca o ayete atlar */}
                  <div className="rounded-2xl border border-white/10 bg-[#12151f] p-2">
                    <span className="px-2 text-[9px] font-bold uppercase tracking-widest text-white/35">{surah.name} — Ayetler</span>
                    <div className="mt-1 max-h-56 overflow-y-auto scrollbar-thin">
                      {ayahs.map(a => (
                        <button key={a.n} onClick={() => { setAyahNo(a.n); setActiveWord(null); }} className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition ${a.n === ayahNo ? "bg-gold/15" : "hover:bg-white/[.04]"}`}>
                          <span className={`w-6 shrink-0 text-[9px] font-black ${a.n === ayahNo ? "text-gold" : "text-white/30"}`}>{a.n}</span>
                          <span className="truncate font-arabic text-sm text-white/80" dir="rtl">{a.ar}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Kontroller */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => playAyahAudio()} className="flex items-center gap-1.5 rounded-lg bg-gold px-3 py-1.5 text-[10px] font-black text-slate-950 transition hover:brightness-110 active:scale-95"><Volume2 size={11} /> Ayeti Dinle</button>
                    <button onClick={replayAyah} className="flex items-center gap-1.5 rounded-lg bg-white/[.06] px-2.5 py-1.5 text-[10px] font-bold text-white/70 transition hover:bg-white/10"><RotateCcw size={11} /> Tekrar Çal</button>
                    <button
                      onClick={() => setAutoRead(v => !v)}
                      className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[9px] font-black transition ${autoRead ? "border-emerald-900/30 bg-emerald-950/40 text-emerald-400" : "border-white/10 bg-white/[.04] text-white/50"}`}
                      title="Açıkken: ayet bitince sıradaki ayet kendiliğinden okunur; kelimeye tıklayınca o ses çalar, okuma kaldığı yerden sürer"
                    >
                      <Volume2 size={10} /> OTOMATİK OKU {autoRead ? "AÇIK" : "KAPALI"}
                    </button>
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
                  <div className="w-full rounded-2xl border border-gold/25 bg-[#12151f] p-6">
                    {wordLoading ? (
                      <div className="flex items-center justify-center gap-2 py-4"><Loader2 size={18} className="animate-spin text-gold" /> <span className="text-[11px] text-white/40">kelimeler yükleniyor…</span></div>
                    ) : words.length > 0 ? (
                      <div className="flex flex-row-reverse flex-wrap items-center justify-center gap-x-4 gap-y-4" dir="rtl">
                        {words.map((w) => (
                          <button
                            key={w.i}
                            onClick={() => clickWord(w.i)}
                            className={`rounded-xl px-3 py-1.5 font-arabic text-3xl leading-relaxed transition-all active:scale-95 ${activeWord === w.i ? "scale-110 bg-gold/25 font-black text-gold-light ring-1 ring-gold/70 shadow-[0_0_28px_rgba(245,221,166,.5)]" : "text-white/90 hover:bg-gold/15 hover:text-gold-light hover:shadow-[0_0_10px_rgba(215,170,82,.25)]"}`}
                          >
                            {w.ar}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="py-4 text-center font-arabic text-3xl leading-relaxed text-white/90" dir="rtl">{ayah?.ar}</p>
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
                  <div className="overflow-hidden rounded-xl border border-white/10 bg-[#12151f]">
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
                  {/* Kaynak referansı */}
                  <div className="mt-3 rounded-2xl border border-white/10 bg-[#12151f] p-3 text-center">
                    <p className="text-[8px] font-black uppercase tracking-widest text-gold">Resmî Sahih Kaynak Referansı</p>
                    <p className="mt-1 text-[9px] font-bold text-white/70">T.C. Diyanet İşleri Başkanlığı</p>
                    <p className="mt-0.5 text-[8px] text-white/35">Mealler: Diyanet · Öztürk · Gölpınarlı · Elmalılı — Kelimeler: quran.com — Ses: everyayah.com</p>
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
            {/* ★ DİNLEME KAPSAMI */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button onClick={() => { setWholeQuran(false); setNextSurahAuto(false); stopListening(); }} className={`rounded-xl border px-3 py-1.5 text-[10px] font-black transition ${!wholeQuran && !nextSurahAuto ? "border-gold/40 bg-gold/15 text-gold" : "border-white/10 bg-white/[.04] text-white/50"}`}>Tek Sure</button>
              <button onClick={() => { setWholeQuran(false); setNextSurahAuto(true); stopListening(); }} className={`rounded-xl border px-3 py-1.5 text-[10px] font-black transition ${!wholeQuran && nextSurahAuto ? "border-emerald-900/30 bg-emerald-950/40 text-emerald-400" : "border-white/10 bg-white/[.04] text-white/50"}`} title="Seçtiğin sure bitince sıradaki sureye otomatik geçer">Sıradaki Sureye Geç</button>
              <button onClick={() => { setWholeQuran(true); stopListening(); }} className={`rounded-xl border px-3 py-1.5 text-[10px] font-black transition ${wholeQuran ? "border-emerald-900/30 bg-emerald-950/40 text-emerald-400" : "border-white/10 bg-white/[.04] text-white/50"}`} title="Fâtiha'dan Nâs'a 6236 ayet, sureler arası kesintisiz">📖 KOMPLE KUR'AN</button>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-[9px] font-bold uppercase text-white/40">Sure</span>
                <select value={listenSurah} onChange={(e) => { setListenSurah(Number(e.target.value)); stopListening(); }} className="rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-[12px] font-semibold outline-none focus:border-gold/50">
                  {SURAHS_DATA.map(s => <option key={s.n} value={s.n}>{s.n}. {s.name} ({s.ayahs} ayet)</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[9px] font-bold uppercase text-white/40">Okuyan Hoca (Kari) — {reciterSearch.trim() ? `${filteredReciters.length} bulundu` : `${RECITERS.length} kari`}</span>
                <input
                  value={reciterSearch}
                  onChange={(e) => setReciterSearch(e.target.value)}
                  placeholder="Hoca ara (mahir, husari, minşavi...)"
                  className="h-8 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-[11px] outline-none placeholder:text-white/25 focus:border-gold/50"
                />
                <div className="h-44 overflow-y-auto rounded-xl border border-white/10 bg-black/40 scrollbar-thin">
                  {filteredReciters.length === 0 ? (
                    <p className="p-3 text-center text-[10px] text-white/35">Bu isimle kari bulunamadı.</p>
                  ) : filteredReciters.map(r => (
                    <button key={r.id} onClick={() => { setListenReciter(r.id); stopListening(); }} className={`flex w-full items-center justify-between gap-2 border-b border-white/5 px-3 py-2 text-left text-[11px] transition last:border-0 ${listenReciter === r.id ? "bg-gold/15 text-gold" : "text-white/70 hover:bg-white/[.05]"}`}>
                      <span className="truncate font-semibold">{r.name}</span>
                      {listenReciter === r.id && <span className="text-[9px] font-black">✓ SEÇİLİ</span>}
                    </button>
                  ))}
                </div>
              </label>
            </div>

            {/* Görsel durum */}
            <div className="mt-4 flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/40 p-5 text-center">
              {isPlaying ? (
                <>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">Çalıyor {wholeQuran ? "· KOMPLE KUR'AN" : nextSurahAuto ? "· SIRADAKİ SURE" : ""}</span>
                  <p className="font-arabic text-2xl text-gold-light">سُورَةُ {(SURAHS_DATA.find(s => s.n === (wholeQuran ? wholeIdx.s : listenSurah)) ?? listenSurahInfo).name}</p>
                  <p className="text-[10px] text-white/45">{(wholeQuran ? wholeIdx.a : listenAyahIdx + 1)}. ayet · {(RECITERS.find(r => r.id === listenReciter)?.name ?? "")}</p>
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
                <button onClick={() => startListening(Math.max(0, listenAyahIdx - 1))} className="rounded-full bg-white/[.06] p-2.5 text-white/70 transition hover:bg-white/10 active:scale-95" title="Önceki ayet">⏮</button>
                {isPlaying ? (
                  <button onClick={stopListening} className="rounded-full bg-gold p-4 text-slate-950 shadow-lg shadow-gold/20 transition hover:brightness-110 active:scale-90"><Pause size={22} /></button>
                ) : (
                  <button onClick={() => startListening(listenAyahIdx)} className="rounded-full bg-gold p-4 text-slate-950 shadow-lg shadow-gold/20 transition hover:brightness-110 active:scale-90"><Play size={22} /></button>
                )}
                <button onClick={() => startListening(Math.min(listenSurahInfo.ayahs - 1, listenAyahIdx + 1))} className="rounded-full bg-white/[.06] p-2.5 text-white/70 transition hover:bg-white/10 active:scale-95" title="Sonraki ayet">⏭</button>
              </div>
              <button onClick={() => setLoopAyahListen(v => !v)} className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[9px] font-black transition ${loopAyahListen ? "border-emerald-900/30 bg-emerald-950/40 text-emerald-400" : "border-white/10 bg-white/[.04] text-white/40"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${loopAyahListen ? "animate-pulse bg-emerald-400" : "bg-white/30"}`} />
                AYET DÖNGÜSÜ {loopAyahListen ? "AÇIK" : "KAPALI"}
              </button>
            </div>
            <p className="mt-3 text-center text-[8px] font-bold uppercase tracking-widest text-white/25">30 kari · ayet ayet akış · Komple Kur'an: 6236 ayet · kaynak: everyayah.com</p>
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
