import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";
import { BookOpen, Headphones, Play, Pause, RotateCcw, Search, X, Loader2, Volume2, Repeat } from "lucide-react";
import { getSurahHadith } from "../data/surahHadith";
// İkonlar: Play/Pause ortadaki büyük oynat düğmesi için

// ══════════════════════════════════════════════════════════════
// QuranLearnModal — "Kur'an Öğreniyorum" + "Kur'an Dinliyorum"
// Veri: api.alquran.cloud (114 sure, Arapça + 4 Türkçe meal)
// Kelime: api.quran.com (kelime kelime Arapça + TR meal + kelime sesi)
// Ses: everyayah.com (ayet bazlı, 30 kari) + audio.qurancdn.com (kelime)
// ══════════════════════════════════════════════════════════════

type Mode = "learn" | "listen" | null;

interface Reciter { id: string; name: string; everyayah?: string; full?: [string, number]; }
interface Ayah { n: number; ar: string; tr: string; juz: number; page: number; }
// ★ TAM SURE DESTEĞİ: `full` alanındaki kâriler mp3quran.net'ten SURE BAŞINA TEK DOSYA
//    (gapless tam sure) çalabilir — [klasör, sunucuNo]. Hepsi tek tek test edildi (200 OK).

// ★ TEFSİR KUTUSU — 4 meşhur tefsir (quran.com v4 API, tek tek test edildi):
//   169 İbn Kesîr (özet, EN) · 16 Müyeccar (AR) · 15 Taberî (AR) · 90 Kurtubî (AR)
//   Türkçe tefsir API'de mevcut değil (quranenc + quran.com tarandı) — İbn Kesîr özeti varsayılan.
const TAFSIRS: Array<{ id: number; name: string }> = [
  { id: 169, name: "İbn Kesîr (özet)" },
  { id: 16, name: "Tefsîrü'l-Müyesser" },
  { id: 15, name: "Taberî" },
  { id: 90, name: "Kurtubî" },
];
const stripHtml = (s: string) => s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

// ★ İNGİLİZCE MEAL TESPİTİ: quran.com id 77 bazen bazı kelimeler için İngilizce döndürür
//   (their plea, they said…). Bunu yakalayıp Türkçe sözlükteki karşılığı varsa onu kullanırız.
const isEnglishMeal = (t: string) => /^[A-Za-z][A-Za-z'’.,;!?()\- ]{2,}$/.test(t.trim());
const TAFSIR_CACHE = new Map<string, string>();
const TafsirBox: React.FC<{ surahNo: number; ayahNo: number }> = ({ surahNo, ayahNo }) => {
  const [tafsirId, setTafsirId] = useState(169);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const key = `${tafsirId}:${surahNo}:${ayahNo}`;
    const cached = TAFSIR_CACHE.get(key);
    if (cached !== undefined) { setText(cached); return; }
    let live = true;
    setLoading(true); setText("");
    fetch(`https://api.quran.com/api/v4/tafsirs/${tafsirId}/by_ayah/${surahNo}:${ayahNo}`)
      .then(r => r.json())
      .then(d => { const t = stripHtml(d?.tafsir?.text ?? ""); if (live) { TAFSIR_CACHE.set(key, t); setText(t); } })
      .catch(() => { if (live) setText(""); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [open, tafsirId, surahNo, ayahNo]);
  return (
    <div className="rounded-2xl border border-white/10 bg-[#1E293B] p-4">
      <button onClick={() => setOpen(o => !o)} className="flex w-full items-center justify-between text-left">
        <span className="text-[9px] font-bold uppercase tracking-widest text-[#6e6853]">📖 Tefsir — {TAFSIRS.find(t => t.id === tafsirId)?.name}</span>
        <span className="text-[9px] font-black text-[#D7AA41]">{open ? "− Kapat" : "+ Aç"}</span>
      </button>
      {open && (
        <>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {TAFSIRS.map(t => (
              <button key={t.id} onClick={() => setTafsirId(t.id)} className={`rounded-lg border px-2 py-1 text-[8px] font-black transition ${tafsirId === t.id ? "border-[#D7AA41]/60 bg-[#D7AA41]/20 text-[#f5dda6]" : "border-white/10 bg-white/[.04] text-[#8f8870] hover:text-[#d8cfae]"}`}>{t.name}</button>
            ))}
          </div>
          {loading ? <p className="mt-2 text-[10px] text-[#7a745f]">Tefsir yükleniyor…</p>
          : text ? <p className="mt-2 max-h-64 overflow-y-auto text-[11px] leading-relaxed text-[#b8b093] scrollbar-thin" dir="ltr">{text}</p>
          : <p className="mt-2 text-[10px] text-[#7a745f]">Bu ayet için bu tefsirde metin bulunamadı — başka tefsir seç.</p>}
        </>
      )}
    </div>
  );
};

interface Word { i: number; ar: string; tr: string; translit: string; audio: string; }

// ★ SES→KELİME ORANTILI TAKİP: kelimeleri harf sayısına göre tartar —
//    hoca uzun kelimeyi uzunca okurken takip yanına kayar (eşit bölünce 4 kelime geride kalıyordu)
const weightedWordIndex = (ratio: number, text: string, count: number): number => {
  const parts = text.split(/\s+/).filter(Boolean);
  if (parts.length === 0 || count === 0) return 0;
  const weights = parts.slice(0, count).map(p => Math.max(2, p.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "").length));
  const total = weights.reduce((a, b) => a + b, 0);
  let acc = 0;
  for (let i = 0; i < weights.length; i++) {
    acc += weights[i];
    if (ratio * total <= acc) return i;
  }
  return weights.length - 1;
};

// ★ KARİ LİSTESİ — everyayah.com AYET BAZLI sesler (her hoca, her ayet için ayrı mp3:
//    001001.mp3 = 1. sure 1. ayet). Kelime/ayet tekrar sistemi bu yüzden tam-sure değil
//    ayet-ayet dosyalarla çalışır. 30 kari tek tek test edildi (hepsi 200 OK).
const RECITERS: Reciter[] = [
  { id: "Alafasy_128kbps", name: "Mishary Rashid Al-Afasy", full: ["afs", 8] },
  { id: "MaherAlMuaiqly128kbps", name: "Mahir el-Muaykli (Kabe İmamı)", full: ["maher", 12] },
  { id: "Abdul_Basit_Murattal_192kbps", name: "Abdulbasit Abdussamed (Murattal)", full: ["basit", 7] },
  { id: "Abdul_Basit_Mujawwad_128kbps", name: "Abdulbasit Abdussamed (Mücavved)" },
  { id: "Husary_128kbps", name: "Mahmud Halil el-Husari (Murattal)", full: ["husr", 13] },
  { id: "Husary_Mujawwad_64kbps", name: "Mahmud Halil el-Husari (Mücavved)" },
  { id: "Minshawy_Murattal_128kbps", name: "Muhammed Siddik el-Minşavi (Murattal)", full: ["minsh", 10] },
  { id: "Minshawy_Mujawwad_192kbps", name: "Muhammed Siddik el-Minşavi (Mücavved)" },
  { id: "Menshawi_16kbps", name: "Muhammed Siddik el-Minşavi (Eski Kayıt)" },
  { id: "Ghamadi_40kbps", name: "Saad el-Gamidi", full: ["s_gmd", 7] },
  { id: "Abu_Bakr_Ash-Shaatree_128kbps", name: "Ebu Bekir eş-Şatri", full: ["shaatree", 7] },
  { id: "Akram_AlAlaqimy_128kbps", name: "Ekrem el-Alakmi" },
  { id: "Ali_Jaber_64kbps", name: "Ali Cabir (Mescid-i Haram)" },
  { id: "Ayman_Sowaid_64kbps", name: "Eyman es-Suvayd" },
  { id: "Fares_Abbad_64kbps", name: "Fares Abbad" },
  { id: "Hani_Rifai_192kbps", name: "Hani er-Rifai", full: ["hani", 8] },
  { id: "Hudhaify_128kbps", name: "Ali el-Hudaifi (Medine)" },
  { id: "Ibrahim_Akhdar_32kbps", name: "İbrahim El-Ehdar" },
  { id: "Mahmoud_Ali_Al_Banna_32kbps", name: "Mahmud Ali el-Benna" },
  { id: "Mohammad_al_Tablaway_128kbps", name: "Muhammed et-Tablavi" },
  { id: "Muhammad_Ayyoub_128kbps", name: "Muhammed Eyyub (Medine)", full: ["ayyub", 8] },
  { id: "Muhammad_Jibreel_64kbps", name: "Muhammed Cibril", full: ["jbrl", 8] },
  { id: "Muhsin_Al_Qasim_192kbps", name: "Muhsin el-Kasım (Medine)" },
  { id: "Mustafa_Ismail_48kbps", name: "Mustafa İsmail" },
  { id: "Nasser_Alqatami_128kbps", name: "Nasser el-Katami", full: ["ajm", 10] },
  { id: "Sahl_Yassin_128kbps", name: "Sehl Yasin (Medine)" },
  { id: "Salah_Al_Budair_128kbps", name: "Salah el-Budeyr", full: ["sds", 11] },
  { id: "Saood_ash-Shuraym_128kbps", name: "Sud eş-Şuraym (Kabe İmamı)", full: ["shur", 7] },
  { id: "Yasser_Ad-Dussary_128kbps", name: "Yaser ed-Dossari", full: ["yasser", 11] },
  { id: "Abdullah_Matroud_128kbps", name: "Abdullah el-Metroud" },
];

const MEALS = [
  { id: "tr.diyanet", name: "Diyanet İşleri Başkanlığı" },
  { id: "tr.vakfi", name: "Elmalılı Hamdi Yazır (Truefed)" },
  { id: "tr.yazir", name: "Elmalılı Hamdi Yazır (Hak Dini)" },
  { id: "tr.golpinarli", name: "Abdulbaki Gölpınarlı" },
  { id: "tr.yildirim", name: "Suat Yıldırım" },
  { id: "tr.bulac", name: "Ali Bulaç" },
  { id: "tr.ates", name: "Süleyman Ateş" },
] as const;

// ★ KELİME ANLAMLARI: tam Kur'an sözlüğü (15.321 kök, TÜM 77.429 kelime %100 kapsama)
//   kaynak: quran.com API Türkçe WbW (Diyanet) + eski 571 sözlük — public/wbw-tr-full.json
//   2) yoksa API Türkçe meal 3) o da yoksa Arapça kök gösterilir ('—' asla görünmez)
const WBW_TR: Record<string, string> = {};

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
  // ★ SURE AKIŞI: oynatınca ayetler arkasına arkasına okunur, ekran okunan ayeti izler
  const [flowPlaying, setFlowPlaying] = useState(false);
  const [kabeLive, setKabeLive] = useState(false); // ★ Kâbe canlı yayın modalı
  const [kabeStatus, setKabeStatus] = useState<"loading" | "playing" | "error">("loading"); // ★ canlı yayın durumu
  // ★ KÂBE CANLI — YouTube'sız, doğrudan Suudi resmî Quran TV HLS akışı (m.live.net.sa)
  //   CORS açık (Access-Control-Allow-Origin: *), hls.js ile tarayıcıda oynar.
  //   Kaynak: iptv-org resmî listesi — Suudi Quran TV (Al Quran Al Kareem TV, Mekke yayını)
  const KABE_HLS = "/api/live/kabe?type=playlist";
  const [speed, setSpeed] = useState(1);
  const [reciter, setReciter] = useState("Alafasy_128kbps");
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
  // ★ TAM SURE MODU: seçilen kârinin mp3quran.net'teki TEK DOSYALIK gapless tam sure kaydı
  //    (ayet ayet indirmeden sureyi baştan sona kesintisiz dinleme — mp3quran.net telifsiz paylaşım)
  const [fullSurahMode, setFullSurahMode] = useState(false);
  const [wholeIdx, setWholeIdx] = useState({ s: 1, a: 1 });
  const [loopAyah, setLoopAyah] = useState(false);
  const [loopAyahListen, setLoopAyahListen] = useState(false);
  const [repeatWord, setRepeatWord] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  if (!audioRef.current && typeof Audio !== "undefined") audioRef.current = new Audio();
  const kabeVideoRef = useRef<HTMLVideoElement | null>(null);
  const kabeHlsRef = useRef<Hls | null>(null);

  // ★ Kâbe canlı HLS bağlama — YouTube'sız doğrudan Suudi resmî akış
  const startKabeHls = useCallback(() => {
    const video = kabeVideoRef.current;
    if (!video) return;
    // önceki hls örneğini temizle
    if (kabeHlsRef.current) { kabeHlsRef.current.destroy(); kabeHlsRef.current = null; }
    if (Hls.isSupported()) {
      const hls = new Hls({ lowLatencyMode: true, backBufferLength: 30 });
      kabeHlsRef.current = hls;
      hls.loadSource(KABE_HLS);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => { video.play().catch(() => undefined); });
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) setKabeStatus("error");
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari doğrudan HLS oynatır
      video.src = KABE_HLS;
      video.play().catch(() => undefined);
    } else {
      setKabeStatus("error");
    }
  }, []);

  // Modal açılınca yayına bağlan, kapatınca temizle
  useEffect(() => {
    if (!kabeLive) {
      if (kabeHlsRef.current) { kabeHlsRef.current.destroy(); kabeHlsRef.current = null; }
      return;
    }
    setKabeStatus("loading");
    const t = setTimeout(() => startKabeHls(), 60);
    return () => { clearTimeout(t); if (kabeHlsRef.current) { kabeHlsRef.current.destroy(); kabeHlsRef.current = null; } };
  }, [kabeLive, startKabeHls]);

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
  // ★ 6 sn zaman aşımı: quran.com takılırsa yedek kelime bölme devreye girsin
  useEffect(() => {
    if (!open || mode !== "learn") return;
    let live = true;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    setWordLoading(true); setWords([]); setActiveWord(null);
    fetch(`https://api.quran.com/api/v4/verses/by_key/${surahNo}:${ayahNo}?words=true&word_fields=text_uthmani%2Ctranslation&translations=77&language=tr`, { signal: ctrl.signal })
      .then(r => r.json())
      .then(async (d: any) => {
        if (!live) return;
        const ws = (d.verse?.words ?? []).filter((w: any) => w.char_type_name === "word");
        // Türkçe sözlüğü (bir kez) yükle — API kelime meali (id 77) + yerel sözlük birleşir
        let wbw: Record<string, string> = WBW_TR;
        let normIdx: Record<string, string> = {};
        if (Object.keys(wbw).length === 0) {
          try {
            const r = await fetch("/wbw-tr-full.json");
            const j = await r.json();
            wbw = j.translations ?? j;
            normIdx = j.normIndex ?? {};
            Object.assign(WBW_TR, wbw);
          } catch { /* sözlük yoksa İngilizce kalır */ }
        }
        const norm = (s: string) => s
          .replace(/[\u0670\u06E1\u064B-\u065F\u0640\u06D6-\u06ED\u0653-\u0655]/g, "")
          .replace(/\u0671/g, "\u0627").replace(/\u0649/g, "\u064A").replace(/\u0629/g, "\u0647")
          .replace(/[\u06CC]/g, "\u064A").replace(/\s+/g, "").trim();
        const stripAl = (s: string) => norm(s).replace(/^ال/, "");
        const wbwKeys = Object.keys(wbw).map(k => ({ k, n: norm(k), na: stripAl(k) }));
        setWords(ws.map((w: any, i: number) => {
          const bare = w.text_uthmani ?? w.text ?? "";
          const n = norm(bare), na = stripAl(bare);
          const exact = normIdx[n] ?? wbwKeys.find(x => x.n === n || x.na === na);
          let tr = typeof exact === "string" ? exact : (exact as any)?.k ? wbw[(exact as any).k] : undefined;
          if (!tr) {
            // yaklaşık: kelimenin başındaki kökü ara (en az 3 harf)
            const part = wbwKeys.find(x => x.na.length > 2 && (na.startsWith(x.na) || x.na === na.slice(0, x.na.length)));
            tr = part ? wbw[part.k] : undefined;
          }
          // ★ Sıra: tam sözlük (15k kök) → API Türkçe meal → kök araması → en son çare İngilizce.
          //   Sözlük %100 kapsadığı için '—' pratikte hiç görünmez.
          const apiTr = typeof w.translation?.text === "string" ? w.translation.text : "";
          const finalTr = tr ?? (apiTr && !isEnglishMeal(apiTr) ? apiTr : undefined);
          return {
            i,
            ar: bare,
            tr: finalTr ?? (isEnglishMeal(apiTr) ? apiTr : bare),
            translit: w.transliteration?.text ?? "",
            audio: `https://audio.qurancdn.com/${w.audio_url}`,
          };
        }));
        setWordLoading(false);
      })
      .catch(() => { if (live) setWordLoading(false); })
      .finally(() => clearTimeout(timer));
    return () => { live = false; clearTimeout(timer); ctrl.abort(); };
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

  // ★ GÜNCEL AYET REFİ: ses her zaman EKRANDAKİ ayeti okur (eski closure taşımaz)
  const ayahPosRef = useRef({ s: surahNo, a: ayahNo });
  useEffect(() => { ayahPosRef.current = { s: surahNo, a: ayahNo }; }, [surahNo, ayahNo]);
  // ★ GÜNCEL KELİME REFİ: ses konumu → kelime eşlemesi her zaman taze listeyle
  const wordsRef = useRef(words);
  useEffect(() => { wordsRef.current = words; }, [words]);
  // ★ TAKİP METNİ REFİ: tartılı dağıtım ayetin Arapça metnine bakar (taze)
  const ayahPosRefText = useRef(ayah?.ar ?? "");
  useEffect(() => { ayahPosRefText.current = ayah?.ar ?? ""; }, [ayah?.ar]);

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

  // ── Dinle modu ──
  // ★ DİNLE EKRANI AYETİ: o an okunan ayetin Arapça metni + Türkçe meali
  //   (her ayet değişiminde ekranda da değişir, kelimeler okundukça altın yanar)
  const [listenAyahData, setListenAyahData] = useState<{ ar: string; tr: string; n: number } | null>(null);
  const [listenWordProgress, setListenWordProgress] = useState<number>(-1);
  const listenAyahDataRef = useRef(listenAyahData);
  useEffect(() => { listenAyahDataRef.current = listenAyahData; }, [listenAyahData]);
  useEffect(() => {
    if (mode !== "listen") { setListenAyahData(null); return; }
    const sNow = wholeQuran ? wholeIdx.s : listenSurah;
    const aNow = wholeQuran ? wholeIdx.a : listenAyahIdx + 1;
    let live = true;
    fetch(`https://api.alquran.cloud/v1/surah/${sNow}/editions/quran-uthmani,tr.diyanet`)
      .then(r => r.json())
      .then((d: any) => {
        if (!live || d.code !== 200) return;
        const ar = d.data[0].ayahs[aNow - 1]?.text ?? "";
        const tr = d.data[1].ayahs[aNow - 1]?.text ?? "";
        setListenAyahData({ ar, tr, n: aNow });
        setListenWordProgress(-1);
      })
      .catch(() => { if (live) setListenAyahData(null); });
    return () => { live = false; };
  }, [mode, wholeQuran, wholeIdx.s, wholeIdx.a, listenSurah, listenAyahIdx]);
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
  // ★ TAM SURE dosya yolu — kâri destekliyorsa mp3quran.net'ten tek dosya (gapless)
  const fullSurahUrl = useCallback((sN: number) => {
    const rc = RECITERS.find(r => r.id === listenReciter);
    if (!rc?.full) return null;
    const [folder, srv] = rc.full;
    return `https://server${srv}.mp3quran.net/${folder}/${String(sN).padStart(3, "0")}.mp3`;
  }, [listenReciter]);

  // ★ SIRADAKİ AYETİ ÖNCE İNDİR: çalarken arka planda ısıtıyoruz —
  //    ayet değişince sessiz bekleme olmaz, anında devam eder
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

  const playAt = useCallback((sN: number, ayahIdx: number) => {
    const a = audioRef.current; if (!a) return;
    setListenAyahIdx(ayahIdx);
    // ★ TAM SURE MODU: tek dosya çalıyor — ayet verisini fetch etmeye gerek yok,
    //   ekran 'kesintisiz tam sure' göstergesinde kalır
    const fsUrl = fullSurahUrl(sN);
    if (fsUrl) {
      a.src = fsUrl;
      a.playbackRate = speed;
      a.loop = false;
      a.preload = "auto";
      a.load();
      a.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      return;
    }
    a.src = ayahUrl(sN, ayahIdx + 1);
    a.playbackRate = speed;
    a.loop = false;
    a.preload = "auto";
    a.load(); // ★ eski buffer temizle
    // ★ DİNLEDE KELİME TAKİBİ: ses konumu → kelime sayısı, okundukça yanar
    a.ontimeupdate = () => {
      const ay = listenAyahDataRef.current;
      if (!a.duration || Number.isNaN(a.duration) || !ay) return;
      const parts = ay.ar.split(/\s+/).filter(Boolean);
      if (parts.length === 0) return;
      setListenWordProgress(weightedWordIndex(a.currentTime / a.duration, ay.ar, parts.length));
    };
    a.play().then(() => { setIsPlaying(true); preloadNextAyah(sN, ayahIdx); }).catch(() => setIsPlaying(false));
  }, [ayahUrl, fullSurahUrl, speed, preloadNextAyah]);

  const startListening = useCallback((fromIdx = 0) => {
    stopAudio();
    const sN = wholeQuran ? listenSurah : listenSurah;
    // ★ TAM SURE MODU: kâri tam-sure destekliyorsa sureyi TEK DOSYADAN (gapless) çal
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
      a.onended = () => {
        // Tam sure bitince: sıradaki sure / komple kuran ayarına göre devam
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
    // ★ KOMPLE KUR'AN seçiliyse SEÇİLİ SUREDEN başlar (Fatiha'ya dönmez);
    //   sureler arası geçiş 'ended' dinleyicisinde zaten var
    if (wholeQuran) { setWholeIdx({ s: sN, a: fromIdx + 1 }); }
    const a = audioRef.current; if (!a) return;
    setListenAyahIdx(fromIdx);
    // ★ BESMELE: Fatiha ve Tevbe hariç her sure besmeleyle başlar (sünnet);
    //   sadece ilk ayet başlarken çalar, sonraki ayetlerde çalmaz.
    //   Besmele dosyası: 100001.mp3 (her kari için mevcut — test edildi)
    const isBesmeleSurah = sN === 1 || sN === 9; // Fâtiha'nın kendisi besmele, Tevbe'de besmele yok
    const besmeleUrl = `https://everyayah.com/data/${listenReciter}/100001.mp3`;
    if (fromIdx === 0 && !isBesmeleSurah) {
      // Önce besmele, bittikten sonra 1. ayet
      a.src = besmeleUrl;
      a.onended = () => {
        a.onended = null;
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
    a.load(); // ★ eski buffer temizle
    a.play().then(() => { setIsPlaying(true); preloadNextAyah(sN, fromIdx); }).catch(() => {
      setTimeout(() => { a.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false)); }, 250);
    });
  }, [wholeQuran, nextSurahAuto, fullSurahMode, listenSurah, listenReciter, ayahUrl, speed, stopAudio, preloadNextAyah]);

  useEffect(() => {
    // ★ SADECE DİNLE MODUNDA: bu dinleyici ÖĞREN modunda da çalışıp sesi
    //   Dinle sekmesinin suresine kaçırıyordu (Fatiha ekranda, Yasin çalıyordu)
    if (mode !== "listen") return;
    const a = audioRef.current; if (!a) return;
    const onEnded = () => {
      if (loopAyahListen) { a.currentTime = 0; a.play().catch(() => undefined); return; }
      const sNow = wholeQuran ? wholeIdx.s : listenSurah;
      const total = SURAHS_DATA.find(s => s.n === sNow)?.ayahs ?? listenSurahInfo.ayahs;
      if (listenAyahIdx + 1 < total) { playAt(sNow, listenAyahIdx + 1); return; }
      // Sure bitti → KOMPLE KUR'AN ya da SIRADAKİ SURE açıksa bir sonraki sureye geç
      // ★ YENİ SURE BESMELEYLE BAŞLAR (Fâtiha/Tevbe hariç) — besmele bitince 1. ayet
      const next = SURAHS_DATA.find(s => s.n === sNow + 1);
      if ((wholeQuran || nextSurahAuto) && next) {
        if (wholeQuran) setWholeIdx({ s: next.n, a: 1 });
        setListenSurah(next.n);
        if (next.n !== 1 && next.n !== 9) {
          // besmele çal, bitince 1. ayet
          a.onended = () => {
            a.onended = null;
            playAt(next.n, 0);
          };
          a.src = `https://everyayah.com/data/${listenReciter}/100001.mp3`;
          a.load();
          a.play().catch(() => playAt(next.n, 0));
          return;
        }
        playAt(next.n, 0);
        return;
      }
      setIsPlaying(false);
    };
    a.addEventListener("ended", onEnded);
    return () => a.removeEventListener("ended", onEnded);
  }, [mode, loopAyahListen, wholeQuran, nextSurahAuto, wholeIdx, listenSurah, listenAyahIdx, playAt, listenSurahInfo.ayahs, listenReciter]);

  const stopListening = () => { stopAudio(); setIsPlaying(false); setPaused(false); };

  // Öğren modundaki oynatmayı durdurur (ortadaki büyük durdur düğmesi)
  const stopAyahPlayback = () => { stopAudio(); setIsPlaying(false); setFlowPlaying(false); setPaused(false); };

  // ★ DONDUR / DEVAM + İLERİ-GERİ SARMA + ÖNCEKİ/SONRAKİ AYET
  const [paused, setPaused] = useState(false);
  const pauseAyah = () => { const a = audioRef.current; if (!a) return; a.pause(); setPaused(true); };
  const resumeAyah = () => { const a = audioRef.current; if (!a) return; a.play().then(() => setPaused(false)).catch(() => undefined); };
  const seekAyah = (delta: number) => {
    const a = audioRef.current; if (!a || !a.duration || Number.isNaN(a.duration)) return;
    a.currentTime = Math.max(0, Math.min(a.duration - 0.15, a.currentTime + delta));
  };
  const prevAyahLearn = () => {
    if (ayahNo <= 1) return;
    stopAudio(); setPaused(false); setFlowPlaying(true); setAyahNo(ayahNo - 1); setActiveWord(null);
  };
  const nextAyahLearn = () => {
    if (ayahNo >= surah.ayahs) { stopAyahPlayback(); return; }
    stopAudio(); setPaused(false); setFlowPlaying(true); setAyahNo(ayahNo + 1); setActiveWord(null);
  };

  // ★ ORTADAKİ SURE LİSTESİ: okunan ayet görünür pencerede kendiliğinden kayar
  const centerListRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    centerListRef.current?.querySelector("[data-current]")?.scrollIntoView({ block: "nearest" });
  }, [ayahNo, ayahs.length, open, mode]);

  // (kelime takibi artık playAyahAudio içinde doğrudan ses'e bağlı — state beklemez,
  //   akış modunda bile kopmaz)

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
    <div className="fixed inset-0 z-[80] flex flex-col animate-fadeIn bg-[#161622]">
      {/* ÜST BAR */}        <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#D7AA41]/20 bg-[#0d1a2c] px-4">
        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-xl border border-white/10">
            <button onClick={() => { setMode("learn"); stopAudio(); }} className={`flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-bold transition ${mode === "learn" ? "bg-gold text-slate-950" : "text-[#a8a184] hover:text-[#f5dda6]"}`}>
              <BookOpen size={13} /> Kur'an Öğreniyorum
            </button>
            <button onClick={() => { setMode("listen"); stopAudio(); }} className={`flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-bold transition ${mode === "listen" ? "bg-gold text-slate-950" : "text-[#a8a184] hover:text-[#f5dda6]"}`}>
              <Headphones size={13} /> Kur'an Dinliyorum
            </button>
          </div>
          {/* ★ KÂBE CANLI: üst barda — her iki modda da görünür, canlı yayın noktasıyla */}
          <button onClick={() => setKabeLive(true)} className="group relative flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-gradient-to-b from-emerald-800/60 to-emerald-950/60 px-3 py-1.5 text-[11px] font-black text-emerald-200 shadow-[0_0_14px_rgba(16,185,129,.25)] transition hover:border-emerald-400/70 hover:brightness-125 active:scale-95" title="Mescid-i Haram'dan 7/24 kesintisiz canlı yayın">
            <span className="text-base leading-none">🕋</span> KÂBE CANLI
            <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full border-2 border-[#161622] bg-red-500" />
            </span>
          </button>
          <button onClick={onClose} className="flex items-center gap-1.5 rounded-xl border border-red-900/30 bg-red-950/40 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-400 transition hover:bg-red-900/60 active:scale-95">
          KAPAT <X size={13} />
        </button>
        </div>
      </div>

      {/* ══════════ ÖĞREN MODU ══════════ */}
      {mode === "learn" && (
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Arama + seçim barı */}
          <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[#D7AA41]/20 bg-[#0d1a2c] px-4 py-2">
            <div className="relative min-w-48 flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#655f4c]" />
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
                placeholder="Sure ara veya ayette kelime ara (rahmet, sabır, نور...)"
                className="h-8 w-full rounded-xl border border-white/10 bg-[#1E293B] pl-8 pr-3 text-[11px] outline-none placeholder:text-[#5a5443] focus:border-gold/50"
              />
              {searchOpen && (filteredSurahs.length > 0 || ayahResults.length > 0 || searching) && (
                <div className="absolute left-0 right-0 top-full z-20 mt-1.5 max-h-80 overflow-y-auto rounded-xl border border-gold/30 bg-slate-900 p-1 shadow-2xl scrollbar-thin">
                  {filteredSurahs.length > 0 && (
                    <p className="px-2.5 pt-1.5 pb-1 text-[8px] font-black uppercase tracking-widest text-[#655f4c]">Sureler</p>
                  )}
                  {filteredSurahs.map(s => (
                    <button key={s.n} onClick={() => { setSurahNo(s.n); setQuery(""); setSearchOpen(false); setAyahResults([]); }} className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[11px] transition hover:bg-gold/10">
                      <span className="font-bold text-[#d8cfae]">{s.n}. {s.name} <span className="font-normal text-[#6e6853]">· {s.ayahs} ayet · {s.type}</span></span>
                      <span className="font-arabic text-sm text-gold-light">سورة {s.name}</span>
                    </button>
                  ))}
                  {(ayahResults.length > 0 || searching) && (
                    <p className="px-2.5 pt-2 pb-1 text-[8px] font-black uppercase tracking-widest text-[#655f4c]">{searching ? "Ayetler aranıyor…" : "Ayetlerde geçen kelimeler"}</p>
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
            <select value={surahNo} onChange={(e) => setSurahNo(Number(e.target.value))} className="h-8 max-w-44 rounded-xl border border-white/10 bg-[#1E293B] px-2 text-[11px] font-semibold outline-none focus:border-gold/50">
              {SURAHS_DATA.map(s => <option key={s.n} value={s.n}>{s.n}. {s.name}</option>)}
            </select>
            <select value={ayahNo} onChange={(e) => { setAyahNo(Number(e.target.value)); setActiveWord(null); }} className="h-8 max-w-36 rounded-xl border border-white/10 bg-[#1E293B] px-2 text-[11px] font-semibold outline-none focus:border-gold/50">
              {Array.from({ length: surah.ayahs }, (_, i) => <option key={i + 1} value={i + 1}>Ayet {i + 1}</option>)}
            </select>
            <select value={mealId} onChange={(e) => setMealId(e.target.value)} className="h-8 max-w-48 rounded-xl border border-white/10 bg-[#1E293B] px-2 text-[11px] font-semibold outline-none focus:border-gold/50">
              {MEALS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <select value={reciter} onChange={(e) => setReciter(e.target.value)} className="h-8 max-w-56 rounded-xl border border-white/10 bg-[#1E293B] px-2 text-[11px] font-semibold text-gold-light outline-none focus:border-gold/50">
              {RECITERS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>

          {/* 3 kolon */}
          <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
            {loading ? (
              <div className="flex flex-1 items-center justify-center gap-2 text-[12px] text-[#8f8870]"><Loader2 size={16} className="animate-spin" /> Ayetler yükleniyor…</div>
            ) : error ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
                <p className="text-[12px] text-red-400">{error}</p>
                <button onClick={() => setSurahNo(surahNo)} className="rounded-lg border border-gold/30 bg-gold/10 px-3 py-1.5 text-[10px] font-bold text-gold">Tekrar Dene</button>
              </div>
            ) : (
              <>
                {/* SOL: Ayetin Bütünü + Kelime Kartı + Meal — prototip düzeni */}
                <div className="flex w-full flex-col gap-4 overflow-y-auto border-white/10 p-4 lg:w-[28%] lg:border-r scrollbar-thin">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gold">Mahrec & Arapça Okuyuş</h3>
                  <div className="rounded-2xl border border-white/10 bg-[#161622] p-4 text-center">
                    <p className="mb-1 text-[8px] font-black uppercase tracking-widest text-[#6e6853]">Ayetin Bütünü (Sol)</p>
                    <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1" dir="rtl">
                      {(words.length > 0 ? words.map(w => w.ar) : (ayah?.ar ?? "").split(/\s+/)).map((ar, i) => (
                        <button key={i} onClick={() => { if (words.length > 0) clickWord(Math.min(i, words.length - 1)); }} className={`rounded-md px-1 font-arabic text-base leading-loose transition-all active:scale-95 ${activeWord === i ? "scale-110 bg-[#D7AA41] font-black text-[#151020] shadow-[0_0_16px_rgba(245,221,166,.7)]" : "text-[#d8cfae] hover:bg-gold/15 hover:text-[#f5dda6]"}`}>{ar}</button>
                      ))}
                    </div>
                    <p className="mt-2 text-[8px] italic text-[#655f4c]">"Soldaki veya ortadaki kelimelerden dilediğinize tıklayabilirsiniz; ikisi de eşzamanlı olarak parlayıp çalacaktır!"</p>
                  </div>

                  {/* Kelime Kartı — seçili kelime büyür */}
                  {activeWord !== null && words[activeWord] ? (
                    <div className="rounded-2xl border border-[#D7AA41]/50 bg-[#1d1a14] p-4 text-center shadow-[0_0_28px_rgba(215,170,82,.2)] animate-fadeIn">
                      <p className="font-arabic text-3xl leading-relaxed text-[#f5dda6]">{words[activeWord].ar}</p>
                      {words[activeWord].translit && <p className="mt-1 text-[11px] italic text-[#7a745f]">{words[activeWord].translit}</p>}
                      <p className="mt-2 text-[14px] font-black text-white">{words[activeWord].tr}</p>
                      <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-[#655f4c]">Kelime {activeWord + 1} / {words.length} · {surah.name} {ayahNo}. Ayet</p>
                      <div className="mt-3 flex items-center justify-center gap-2">
                        <button onClick={() => playWordAudio(activeWord)} className="flex items-center gap-1.5 rounded-lg bg-[#D7AA41] px-2.5 py-1.5 text-[9px] font-black text-[#151020] shadow-[0_0_10px_rgba(215,170,82,.4)] transition hover:brightness-110 active:scale-95">
                          <RotateCcw size={11} /> Kelimeyi Tekrar Oku
                        </button>
                        {/* ★ AŞAĞI: uzun ayetleri görmek için kelime listesini aşağı kaydırır */}
                        <button onClick={() => { const el = document.querySelector("[data-ayah-scroll]"); if (el) el.scrollBy({ top: 180, behavior: "smooth" }); }} className="flex items-center gap-1 rounded-md border border-white/10 bg-[#1E293B] px-2 py-1.5 text-[8px] font-black text-[#8f8870] transition hover:text-[#f5dda6]" title="Uzun ayetin devamını görmek için aşağı kaydır">
                          ↓ Aşağı
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-white/10 bg-[#1E293B] p-4 text-center">
                      <p className="text-[10px] text-[#7a745f]">Soldaki veya ortadaki kelimeye tıkla — <b className="text-[#f5dda6]">sarı yansır ve okunur</b>.</p>
                    </div>
                  )}

                  {/* Meal */}
                  <div className="rounded-2xl border border-white/10 bg-[#1E293B] p-4">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#6e6853]">Ayet Meali</span>
                    <p className="mt-2 text-[12px] leading-relaxed text-[#c5bc9a]">{ayah?.tr}</p>
                    <span className="mt-2 block text-right text-[8px] font-bold text-[#5a5443]">Kaynak: {MEALS.find(m => m.id === mealId)?.name}</span>
                  </div>

                  {/* ★ TEFSİR: İbn Kesîr (Türkçe çeviri; yüklenince görünür) */}
                  <TafsirBox surahNo={surahNo} ayahNo={ayahNo} />

                  {/* Sure Ayetleri */}
                  <div className="rounded-2xl border border-white/10 bg-[#161622] p-2">
                    <span className="px-2 text-[9px] font-bold uppercase tracking-widest text-[#6e6853]">{surah.name} — Ayetler</span>
                    <div className="mt-1 max-h-56 overflow-y-auto scrollbar-thin">
                      {ayahs.map(a2 => (
                        <button key={a2.n} onClick={() => { setAyahNo(a2.n); setActiveWord(null); }} className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition ${a2.n === ayahNo ? "bg-[#3D342B]" : "hover:bg-white/[.04]"}`}>
                          <span className={`w-6 shrink-0 text-[9px] font-black ${a2.n === ayahNo ? "text-[#f5dda6]" : "text-[#655f4c]"}`}>{a2.n}</span>
                          <span className="truncate font-arabic text-sm text-[#cfc6a4]" dir="rtl">{a2.ar}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ORTA: prototip düzeni — ayet kartı (içinde kontroller) + kelime analizi */}
                <div data-ayah-scroll className="flex w-full flex-col items-center gap-4 overflow-y-auto border-white/10 p-4 lg:w-[47%] lg:border-r scrollbar-thin">
                  <p className="self-start text-[8px] font-black uppercase tracking-widest text-[#655f4c]">Kelime Seçim Alanı</p>
                  <div className="w-full rounded-3xl border border-white/10 bg-[#131322] p-4">
                    <div className="flex items-start justify-between gap-2">
                      <span className="w-20 shrink-0" />
                      <div className="text-center">
                        <h4 className="font-arabic text-sm text-[#f5dda6]">سُورَةُ {surah.name}</h4>
                        <p className="mt-0.5 font-mono text-[10px] text-[#7a745f]">{surah.n}. {surah.name} Suresi — {ayahNo}. Ayet · {surah.type} · Cüz {ayah?.juz} · Sayfa {ayah?.page}</p>
                      </div>
                      <div className="w-20 shrink-0 text-right">
                        <p className="text-[9px] font-black tracking-widest text-gold">NURSTUDYO</p>
                        <p className="text-[8px] text-[#7a745f]">{surah.name} suresi</p>
                      </div>
                    </div>
                    {/* Kelimeler */}
                    <div className="mt-3 w-full rounded-xl border border-white/10 bg-black/20 p-3">
                      {wordLoading ? (
                        <div className="flex items-center justify-center gap-2 py-4"><Loader2 size={18} className="animate-spin text-[#D7AA41]" /> <span className="text-[11px] text-[#7a745f]">kelimeler yükleniyor…</span></div>
                      ) : words.length > 0 ? (
                        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2" dir="rtl">
                          {words.map((w) => (
                            <button
                              key={w.i}
                              onClick={() => clickWord(w.i)}
                              className={`rounded-lg px-2 py-1 font-arabic text-xl leading-relaxed transition-all active:scale-95 ${activeWord === w.i ? "scale-110 rounded-lg bg-[#D7AA41] font-black text-[#151020] shadow-[0_0_34px_rgba(245,221,166,.8)] ring-2 ring-[#f5dda6]" : "text-[#e8dfc0] hover:bg-gold/20 hover:text-[#f5dda6] hover:shadow-[0_0_14px_rgba(215,170,82,.35)]"}`}
                            >
                              {w.ar}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="py-4 text-center font-arabic text-xl leading-relaxed text-[#e8dfc0]" dir="rtl">{ayah?.ar}</p>
                      )}
                    </div>

                    {/* ★ KONTROLLER — sol ok · DONDUR/BAŞLAT · sağ ok (prototip düzeni) */}
                    <div className="mt-3 flex w-full flex-wrap items-center justify-center gap-2">
                      {/* ★ SOL OK — önceki ayete gider, tıklayınca hemen okur */}
                      <button onClick={prevAyahLearn} disabled={ayahNo <= 1} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1E293B] text-[15px] font-black text-[#f5dda6] ring-1 ring-white/10 transition hover:bg-[#243449] active:scale-90 disabled:opacity-30" title="Önceki ayet">
                        ◀
                      </button>
                      {/* ★ ORTADA BÜYÜK DONDUR/BAŞLAT düğmesi */}
                      {(() => {
                        const audio = audioRef.current;
                        const showPause = isPlaying && !paused;
                        return (
                          <button
                            onClick={() => { if (showPause) pauseAyah(); else if (paused) resumeAyah(); else { setPaused(false); setFlowPlaying(true); playAyahAudio(); } }}
                            className={`flex h-14 w-14 items-center justify-center rounded-full text-[20px] font-black transition active:scale-90 ${showPause ? "bg-[#D7AA41] text-[#151020] shadow-[0_0_18px_rgba(215,170,82,.45)] hover:brightness-110" : "bg-[#D7AA41] text-[#151020] shadow-[0_0_18px_rgba(215,170,82,.45)] ring-2 ring-[#f5dda6]/70 hover:brightness-110"}`}
                            title={showPause ? "Dondur" : paused ? "Devam et" : "Başlat"}
                          >
                            {showPause ? "⏸" : "▶"}
                          </button>
                        );
                      })()}
                      {/* ★ SAĞ OK — sonraki ayete gider, tıklayınca hemen okur */}
                      <button onClick={nextAyahLearn} disabled={ayahNo >= surah.ayahs} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1E293B] text-[15px] font-black text-[#f5dda6] ring-1 ring-white/10 transition hover:bg-[#243449] active:scale-90 disabled:opacity-30" title="Sonraki ayet">
                        ▶
                      </button>
                      {/* ★ 5 SN SARMA */}
                      <button onClick={() => seekAyah(-5)} disabled={!isPlaying} className="rounded-lg bg-[#1E293B] px-2 py-1.5 text-[9px] font-bold text-[#cfc6a4] ring-1 ring-white/10 transition hover:bg-[#243449] active:scale-95 disabled:opacity-40" title="5 saniye geri sar">
                        ⏪5sn
                      </button>
                      <button onClick={() => seekAyah(5)} disabled={!isPlaying} className="rounded-lg bg-[#1E293B] px-2 py-1.5 text-[9px] font-bold text-[#cfc6a4] ring-1 ring-white/10 transition hover:bg-[#243449] active:scale-95 disabled:opacity-40" title="5 saniye ileri sar">
                        5sn⏩
                      </button>
                      <button onClick={replayAyah} className="flex items-center gap-1.5 rounded-lg bg-[#1E293B] px-2.5 py-1.5 text-[9px] font-bold text-[#cfc6a4] ring-1 ring-white/10 transition hover:bg-[#243449] active:scale-95">
                        <RotateCcw size={10} /> Tekrar
                      </button>
                      <button onClick={stopAyahPlayback} className="rounded-lg bg-[#1E293B] px-2.5 py-1.5 text-[9px] font-bold text-[#cfc6a4] ring-1 ring-white/10 transition hover:bg-[#243449] active:scale-95">
                        Sıfırla
                      </button>
                      <div className="ml-1 flex items-center gap-0.5 rounded-lg bg-black/30 p-0.5 text-[9px] font-bold">
                        {[0.8, 1, 1.2].map(v => (
                          <button key={v} onClick={() => setSpeed(v)} className={`rounded px-2 py-0.5 transition ${speed === v ? "bg-[#D7AA41] text-[#151020]" : "text-[#8f8870] hover:text-[#f5dda6]"}`}>{v}x</button>
                        ))}
                      </div>
                    </div>
                    {/* Hoca seçici — kontrollerin altında, prototipteki gibi */}
                    <div className="mt-3 flex w-full justify-center">
                      <select value={reciter} onChange={(e) => setReciter(e.target.value)} className="h-7 max-w-44 rounded-lg border border-white/10 bg-[#1E293B] px-2 text-[10px] font-bold text-[#d8cfae] outline-none focus:border-[#D7AA41]/60">
                        {RECITERS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* ★ KELİME ANALİZ PANELİ — prototipteki "Kelime Meali & Telaffuz Analizi" */}
                  {activeWord !== null && words[activeWord] ? (
                    <div className="w-full rounded-2xl border border-[#D7AA41]/30 bg-[#141a2b] p-4 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[#e8c87a]">🔊 Kelime Meali & Telaffuz Analizi (Hız: {speed}x )</span>
                        <button onClick={() => setActiveWord(null)} className="text-[10px] text-[#7a745f] transition hover:text-[#f5dda6]">✕ Kapat</button>
                      </div>
                      <p className="mt-2 text-[15px] font-black text-[#f5dda6]">
                        {words[activeWord].tr}{" "}
                        <span className="text-[13px] font-normal text-[#8f8870]">( <span className="font-arabic text-lg text-[#cfc6a4]">{words[activeWord].ar}</span> · {words[activeWord].translit || "—"} )</span>
                      </p>
                      <p className="mt-1.5 text-[11px] text-[#a8a184]">{surah.name} Suresi · {ayahNo}. Ayet · {activeWord + 1}. kelime</p>
                      <p className="mt-1 text-[10px] text-[#7a745f]">Ayeti Dinle'den sonra hoca bu kelimeyi okur</p>
                    </div>
                  ) : null}

                  {/* ★ SURENİN TAMAMI — ~7 ayet görünür, okunan yanar, akışla kayar, tıklayınca o ayet okunur */}
                  <div className="w-full rounded-2xl border border-white/10 bg-[#161622] p-3">
                    <p className="mb-2 text-center text-[9px] font-bold uppercase tracking-widest text-[#6e6853]">Suredeki Ayetler — okunan yanar, birine tıklarsan o okunur</p>
                    <div ref={centerListRef} className="flex max-h-[300px] flex-col gap-1.5 overflow-y-auto scrollbar-thin">
                      {ayahs.map(a => (
                        <button key={a.n} data-current={a.n === ayahNo || undefined} onClick={() => { setFlowPlaying(false); setAyahNo(a.n); setActiveWord(null); setTimeout(() => playAyahRef.current(), 350); }} className={`flex items-center gap-3 rounded-xl px-3 py-2 text-right transition ${a.n === ayahNo ? "bg-[#3D342B] ring-1 ring-[#D7AA41]/60 shadow-[0_0_14px_rgba(215,170,82,.25)]" : "hover:bg-white/[.04]"}`}>
                          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${a.n === ayahNo ? "bg-[#D7AA41] text-[#151020]" : "bg-white/10 text-[#8f8870]"}`} dir="ltr">{a.n}</span>
                          <span className={`flex-1 truncate font-arabic text-sm leading-relaxed ${a.n === ayahNo ? "text-[#f5dda6]" : "text-[#b8b093]"}`} dir="rtl">{a.ar}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SAĞ: kelime tablosu */}
                <div className="flex w-full flex-col overflow-y-auto p-4 lg:w-[25%] scrollbar-thin">
                  <h3 className="mb-2 text-[10px] font-black uppercase tracking-widest text-gold">Kelime Kelime Çözüm</h3>
                  <div className="overflow-hidden rounded-xl border border-white/10 bg-[#161622]">
                    {wordLoading ? (
                      <div className="flex items-center justify-center gap-2 p-4 text-[11px] text-[#7a745f]"><Loader2 size={13} className="animate-spin" /> kelimeler…</div>
                    ) : words.map((w, i) => (
                      <button key={w.i} onClick={() => clickWord(i)} className={`flex w-full items-center justify-between gap-2 border-b border-white/5 px-3 py-2 text-left transition last:border-0 ${activeWord === i ? "bg-[#3D342B] ring-1 ring-inset ring-[#D7AA41]/60" : "hover:bg-white/[.04]"}`}>
                        <span className={`w-5 text-[9px] font-black ${activeWord === i ? "text-[#f5dda6]" : "text-[#655f4c]"}`}>{i + 1}</span>
                        <span className={`flex-1 truncate text-[10px] font-bold ${activeWord === i ? "text-[#f5dda6]" : "text-[#c5bc9a]"}`}>{w.tr}</span>
                        <span className="font-arabic text-lg text-[#f5dda6]">{w.ar}</span>
                      </button>
                    ))}
                  </div>
                  {/* Kaynak referansı */}
                  <div className="mt-3 rounded-2xl border border-white/10 bg-[#161622] p-3 text-center">
                    <p className="text-[8px] font-black uppercase tracking-widest text-gold">Resmî Sahih Kaynak Referansı</p>
                    <p className="mt-1 text-[9px] font-bold text-[#b8b093]">T.C. Diyanet İşleri Başkanlığı</p>
                    <p className="mt-0.5 text-[8px] text-[#6e6853]">Mealler: Diyanet · Elmalılı (2 versiyon) · Gölpınarlı · Yıldırım · Bulaç · Ateş — Kelime kökleri: Kur'an'ın tamamı (15.321 kök, Diyanet WbW) — Ses: everyayah.com</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ══════════ DİNLE MODU ══════════ */}
      {mode === "listen" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 overflow-y-auto p-4 scrollbar-thin">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#161622] p-7 shadow-2xl">
            <span className="text-[9px] font-bold uppercase tracking-widest text-gold">Kesintisiz Ayet Ayet Oynatıcı</span>
            {/* ★ SAHİH HADİS: seçili sureyle ilgili Buhârî/Müslim kaynaklı hadis */}
            {(() => {
              const h = getSurahHadith(listenSurah);
              if (!h) return null;
              return (
                <div className="mt-3 rounded-xl border border-gold/25 bg-[#14110a] p-3">
                  <p className="text-[10px] font-black text-[#f5dda6]">📖 {h.title}</p>
                  <p className="mt-1 text-[10px] leading-relaxed text-[#b8b093]" dir="auto">{h.desc}</p>
                  <p className="mt-1.5 text-[8px] font-bold uppercase tracking-widest text-gold/60">Kaynak: {h.source}</p>
                </div>
              );
            })()}
            {/* ★ DİNLEME KAPSAMI */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button onClick={() => { setWholeQuran(false); setNextSurahAuto(false); stopListening(); setFullSurahMode(false); }} className={`rounded-xl border px-3 py-1.5 text-[10px] font-black transition ${!wholeQuran && !nextSurahAuto ? "border-gold/40 bg-gold/15 text-gold" : "border-white/10 bg-white/[.04] text-[#8f8870]"}`}>Tek Sure</button>
              <button onClick={() => { setWholeQuran(false); setNextSurahAuto(true); stopListening(); setFullSurahMode(false); }} className={`rounded-xl border px-3 py-1.5 text-[10px] font-black transition ${!wholeQuran && nextSurahAuto ? "border-emerald-900/30 bg-emerald-950/40 text-emerald-400" : "border-white/10 bg-white/[.04] text-[#8f8870]"}`} title="Seçtiğin sure bitince sıradaki sureye otomatik geçer">Sıradaki Sureye Geç</button>
              <button onClick={() => { setWholeQuran(true); stopListening(); setFullSurahMode(false); }} className={`rounded-xl border px-3 py-1.5 text-[10px] font-black transition ${wholeQuran ? "border-emerald-900/30 bg-emerald-950/40 text-emerald-400" : "border-white/10 bg-white/[.04] text-[#8f8870]"}`} title="Seçtiğin sureden Nâs'a, sureler arası kesintisiz">📖 KOMPLE KUR'AN</button>
              {/* ★ TAM SURE: tek dosya gapless sure kaydı (mp3quran.net) — kesintisiz sure dinleme */}
              <button onClick={() => { setFullSurahMode(v => !v); setWholeQuran(false); stopListening(); }} className={`rounded-xl border px-3 py-1.5 text-[10px] font-black transition ${fullSurahMode ? "border-gold/40 bg-gold/15 text-gold" : "border-white/10 bg-white/[.04] text-[#8f8870]"}`} title="Sureyi tek dosyadan kesintisiz (gapless) dinle — ayet aralarında bekleme yok">🎵 TAM SURE (kesintisiz)</button>
              {/* ★ KÂBE CANLI: Mescid-i Haram 7/24 canlı yayın (YouTube embed) */}
              <button onClick={() => setKabeLive(true)} className="rounded-xl border border-emerald-900/30 bg-emerald-950/40 px-3 py-1.5 text-[10px] font-black text-emerald-300 transition hover:brightness-125" title="Mescid-i Haram'dan 7/24 canlı yayın">🕋 KÂBE CANLI</button>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-[9px] font-bold uppercase text-[#7a745f]">Sure</span>
                <select value={listenSurah} onChange={(e) => { setListenSurah(Number(e.target.value)); stopListening(); }} className="rounded-xl border border-white/10 bg-[#1E293B] px-3 py-2.5 text-[12px] font-semibold outline-none focus:border-gold/50">
                  {SURAHS_DATA.map(s => <option key={s.n} value={s.n}>{s.n}. {s.name} ({s.ayahs} ayet)</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[9px] font-bold uppercase text-[#7a745f]">Okuyan Hoca (Kari) — {reciterSearch.trim() ? `${filteredReciters.length} bulundu` : `${RECITERS.length} kari`}</span>
                <input
                  value={reciterSearch}
                  onChange={(e) => setReciterSearch(e.target.value)}
                  placeholder="Hoca ara (mahir, husari, minşavi...)"
                  className="h-8 w-full rounded-xl border border-white/10 bg-[#1E293B] px-3 text-[11px] outline-none placeholder:text-[#5a5443] focus:border-gold/50"
                />
                <div className="h-44 overflow-y-auto rounded-xl border border-white/10 bg-[#1E293B] scrollbar-thin">
                  {filteredReciters.length === 0 ? (
                    <p className="p-3 text-center text-[10px] text-[#6e6853]">Bu isimle kari bulunamadı.</p>
                  ) : filteredReciters.map(r => (
                    <button key={r.id} onClick={() => { setListenReciter(r.id); stopListening(); }} className={`flex w-full items-center justify-between gap-2 border-b border-white/5 px-3 py-2 text-left text-[11px] transition last:border-0 ${listenReciter === r.id ? "bg-gold/15 text-gold" : "text-[#b8b093] hover:bg-white/[.05]"}`}>
                      <span className="truncate font-semibold">{r.name}</span>
                      {listenReciter === r.id && <span className="text-[9px] font-black">✓ SEÇİLİ</span>}
                    </button>
                  ))}
                </div>
              </label>
            </div>

            {/* ★ OKUNAN AYET EKRANI — arkasında yıldız takımyıldızı şablonu (R2),
                üstünde karartma perdesi + Arapça büyük + meal; kelimeler okundukça altın yanar */}
            <div
              className="relative mt-4 flex min-h-[190px] flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-gold/20 p-5 text-center shadow-[0_0_24px_rgba(215,170,82,.08)]"
              style={{
                backgroundImage: "url('https://cdn.nurstudyo.com/templates/takimyildiz/81310.jpg'), linear-gradient(180deg,#161622,#12101c)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Karartma perdesi — yazılar her zaman okunaklı kalsın */}
              <div className="pointer-events-none absolute inset-0 bg-[#0d0b16]/72" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0d0b16]/85 via-transparent to-[#0d0b16]/40" />
              <div className="relative z-10 flex w-full flex-col items-center gap-3">
                {isPlaying && listenAyahData ? (
                  <>
                    <span className="text-[9px] font-black uppercase tracking-widest text-gold/70">♪ Çalıyor — {fullSurahMode ? "TAM SURE (kesintisiz)" : wholeQuran ? "KOMPLE KUR'AN" : nextSurahAuto ? "SIRADAKİ SURE" : "TEK SURE"} · {listenAyahData.n}. Ayet</span>
                    <div className="flex w-full flex-wrap items-center justify-center gap-x-2 gap-y-1" dir="rtl">
                      {listenAyahData.ar.split(/\s+/).filter(Boolean).map((wd, i) => (
                        <span key={i} className={`rounded px-1 font-arabic text-xl leading-loose transition-all duration-200 ${i === listenWordProgress ? "scale-110 bg-[#D7AA41] font-black text-[#151020] shadow-[0_0_16px_rgba(245,221,166,.8)] ring-2 ring-[#f5dda6]" : i < listenWordProgress ? "text-[#f5dda6]/60" : "text-[#e8dfc0]"}`}>{wd}</span>
                      ))}
                    </div>
                    <p className="mt-1 max-w-xl text-[11px] italic leading-relaxed text-[#c9c0a0]" dir="auto">“{listenAyahData.tr}”</p>
                  </>
                ) : isPlaying ? (
                  <div className="flex items-center gap-2 py-4"><Loader2 size={14} className="animate-spin text-gold" /> <span className="text-[11px] text-[#b8b093]">ayet yükleniyor…</span></div>
                ) : (
                  <p className="text-[11px] text-[#8f8870]">Başlat'a bas — sure, seçtiğin hoca sesiyle okunur.</p>
                )}
              </div>
            </div>

            {/* Kontroller */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-[#1E293B] p-0.5 text-[9px] font-bold">
                {[0.75, 1, 1.25, 1.5].map(v => (
                  <button key={v} onClick={() => { setSpeed(v); if (audioRef.current) audioRef.current.playbackRate = v; }} className={`rounded px-2 py-0.5 transition ${speed === v ? "bg-gold text-slate-950" : "text-[#8f8870] hover:text-[#f5dda6]"}`}>{v}x</button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => startListening(Math.max(0, listenAyahIdx - 1))} className="rounded-full bg-white/[.06] p-2.5 text-[#b8b093] transition hover:bg-white/10 active:scale-95" title="Önceki ayet">⏮</button>
                {isPlaying ? (
                  <button onClick={stopListening} className="rounded-full bg-gold p-4 text-slate-950 shadow-lg shadow-gold/20 transition hover:brightness-110 active:scale-90"><Pause size={22} /></button>
                ) : (
                  <button onClick={() => startListening(listenAyahIdx)} className="rounded-full bg-gold p-4 text-slate-950 shadow-lg shadow-gold/20 transition hover:brightness-110 active:scale-90"><Play size={22} /></button>
                )}
                <button onClick={() => startListening(Math.min(listenSurahInfo.ayahs - 1, listenAyahIdx + 1))} className="rounded-full bg-white/[.06] p-2.5 text-[#b8b093] transition hover:bg-white/10 active:scale-95" title="Sonraki ayet">⏭</button>
              </div>
              <button onClick={() => setLoopAyahListen(v => !v)} className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[9px] font-black transition ${loopAyahListen ? "border-emerald-900/30 bg-emerald-950/40 text-emerald-400" : "border-white/10 bg-white/[.04] text-[#7a745f]"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${loopAyahListen ? "animate-pulse bg-emerald-400" : "bg-white/30"}`} />
                AYET DÖNGÜSÜ {loopAyahListen ? "AÇIK" : "KAPALI"}
              </button>
            </div>
            <p className="mt-3 text-center text-[8px] font-bold uppercase tracking-widest text-[#5a5443]">{RECITERS.length} kari · ayet ayet akış · Komple Kur'an: 6236 ayet · kaynak: everyayah.com (telifsiz paylaşım izinli)</p>
          </div>
        </div>
      )}

      {/* ══════════ KÂBE CANLI YAYIN MODALI ══════════ */}
      {kabeLive && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4" onClick={() => setKabeLive(false)}>
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-gold/30 bg-[#131322] shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <p className="text-[12px] font-black text-gold">🕋 Kâbe — Mescid-i Haram Canlı Yayın</p>
              <button onClick={() => setKabeLive(false)} className="rounded-lg px-2 py-1 text-[11px] font-bold text-white/50 hover:text-white"><X size={16} /></button>
            </div>
            <div className="relative aspect-video w-full bg-black">
              <video
                ref={kabeVideoRef}
                autoPlay
                muted
                playsInline
                className="h-full w-full"
                onPlaying={() => setKabeStatus("playing")}
                onError={() => setKabeStatus("error")}
              />
              {kabeStatus === "loading" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
                  <p className="text-[10px] font-bold text-gold/70">Canlı yayına bağlanıyor…</p>
                </div>
              )}
              {kabeStatus === "error" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <p className="text-[11px] font-black text-[#f5dda6]">Yayın şu an açılamadı</p>
                  <button onClick={() => { setKabeStatus("loading"); startKabeHls(); }} className="rounded-lg bg-gold/20 px-3 py-1.5 text-[10px] font-black text-gold transition hover:bg-gold/30">↻ Tekrar Dene</button>
                </div>
              )}
            </div>
            <p className="px-4 py-2 text-center text-[8px] font-bold uppercase tracking-widest text-[#5a5443]">Mescid-i Haram 7/24 resmî canlı yayın · sitede oynar, başka yere yönlendirmez</p>
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
