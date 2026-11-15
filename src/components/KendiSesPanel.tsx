import React, { useState, useCallback, useRef, useEffect } from "react";
import { Upload, Play, SquareStop, ChevronDown, Sparkles, X, Video, Clock, CheckCircle, AlertTriangle, Slash, Trash2, FileText, Maximize, Minimize, Volume2, VolumeX, Wand2, Image, Film, Palette, Languages, AudioWaveform } from "lucide-react";
import { SURAHS } from "../data";
import { sureAdGorunum } from "../data/surelerCokDil";
import type { Lang } from "../i18n";
import { translate } from "../i18n";
import type { SesSegmenti } from "../studio/sesZamanlama";
import type { StoredSes } from "../studio/sesDeposu";
import type { KendiSesAktif } from "../studio/useKendiSes";

type PanelStep = "yukle" | "secim" | "duzenle" | "onizle";

interface KendiSesPanelProps {
  lang: Lang;
  onClose: () => void;
  yukle: (dosya: File, sure: number, ayetSayisi: number, konum: "tum" | number, maksSn?: number) => Promise<{ segments: SesSegmenti[]; id: string; total: number } | null>;
  sec: (id: string) => Promise<boolean>;
  zamanlamaKaydet: (id: string, segments: SesSegmenti[], nefes?: number) => Promise<void>;
  kayitlar: StoredSes[];
  aktifSes: KendiSesAktif | null;
  yukleniyor: boolean;
  isElit: boolean;
  nefes: number;
  maksSn: number;
  maksAyarla: (sn: number) => void;
  yenidenTara: (id: string, ayetSayisi: number, maksSn?: number) => Promise<boolean>;
  sureEkle: (s: number) => Promise<void>;
  notify: (msg: string) => void;
  /** Her ayete özel AI arkaplan videosu haritası: ayetNo -> videoUrl veya videoId */
  ayahBackgrounds?: Record<number, string>;
}

const MB = 60 * 1024 * 1024;

const KENDI_SES_TIPS: Record<string, { title: string; desc: string }> = {
  tr: { title: "Kendi Sesinle Kur'an", desc: "Sadece ses dosyası yükleyin, sure seçin, waveform'da ayet ayırın, Arapça+meal ekleyin, atmosfere seçin ve önizleyin." },
  en: { title: "Qur'an with Your Voice", desc: "Upload audio only, select surah, split verses on waveform, add Arabic+translation, choose atmosphere, preview." },
  ar: { title: "القرآن بصوتك", desc: "ارفع ملف صوتي فقط، اختر السورة، قسم الآيات على الموجة، أضف العربية والترجمة، اختر الجو، وشاهد المعاينة." },
  id: { title: "Al-Qur'an dengan Suara Anda", desc: "Unggah audio saja, pilih surat, bagi ayat pada waveform, tambahkan Arab+terjemahan, pilih atmosfer, pratinjau." },
  ur: { title: "اپنی آواز قرآن کریم کے ساتھ", desc: "صرف آڈیو فائل اپ لوڈ کریں، سورہ منتخب کریں، Waveform پر آیات الگ کریں، عربی+مطالعہ شامل کریں، ماحول منتخب کریں اور پیش نظارہ دیکھیں۔" },
};

const ATMOSPRESETLER: Array<{ id: string; ad: string; emoji: string }> = [
  { id: "nature", ad: "Doğa", emoji: "🌿" },
  { id: "mosque", ad: "Camii", emoji: "🕌" },
  { id: "space", ad: "Uzay", emoji: "🌌" },
  { id: "water", ad: "Su", emoji: "💧" },
  { id: "fire", ad: "Ateş/Nur", emoji: "🔥" },
  { id: "none", ad: "Yok", emoji: "⚪" },
];

const AI_VIDEO_PRESETLER: Array<{ id: string; ad: string; emoji: string; url?: string }> = [
  { id: "ai-noor", ad: "Nûr Işığı", emoji: "✨" },
  { id: "ai-masjid", ad: "Camii İçerisi", emoji: "🕌" },
  { id: "ai-desert", ad: "Gece Çölü", emoji: "🏜️" },
  { id: "ai-sea", ad: "Deniz Yıldızı", emoji: "🌊" },
  { id: "ai-candle", ad: "Mum Işığı", emoji: "🕯️" },
  { id: "ai-none", ad: "Video Yok", emoji: "⚪" },
];

const YAZI_STILLERI: Array<{ id: string; ad: string; fontFamily: string }> = [
  { id: "amiri", ad: "Amiri Kur'an", fontFamily: "'Amiri Quran', serif" },
  { id: "katibeh", ad: "Katibeh", fontFamily: "'Katibeh', serif" },
  { id: "lalezar", ad: "Lalezar", fontFamily: "'Lalezar', cursive" },
];

interface AyetSegment {
  id: string;
  ayetNo: number;
  start: number;
  dur: number;
  arabic: string;
  meal: string;
  atmos: string;
  videoBg: string;
  showArabic: boolean;
  showMeal: boolean;
}

const PauseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m4-3v3m4-9v9" />
  </svg>
);

export const KendiSesPanel: React.FC<KendiSesPanelProps> = ({
  lang, onClose, yukle, sec, zamanlamaKaydet, kayitlar, aktifSes, yukleniyor,
  isElit, nefes, maksSn, maksAyarla, yenidenTara, sureEkle, notify, ayahBackgrounds,
}) => {
  const t = (k: string): string => translate(lang, k);
  const tip = KENDI_SES_TIPS[lang] ?? KENDI_SES_TIPS.tr;

  const [step, setStep] = useState<PanelStep>("yukle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedSure, setSelectedSure] = useState<number | null>(null);
  const [ayetSayisi, setAyetSayisi] = useState<number>(1);
  const [tumunuSec, setTumunuSec] = useState<boolean>(true);

  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [waveformData, setWaveformData] = useState<number[] | null>(null);

  const [segments, setSegments] = useState<AyetSegment[]>([]);
  const [nextSegId, setNextSegId] = useState<number>(1);

  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playingSegId, setPlayingSegId] = useState<string | null>(null);

  const [showArabic, setShowArabic] = useState<boolean>(true);
  const [showMeal, setShowMeal] = useState<boolean>(true);
  const [yaziStil, setYaziStil] = useState<string>("amiri");
  const [yaziRenk, setYaziRenk] = useState<string>("#ffffff");
  const [arkaplanRenk, setArkaplanRenk] = useState<string>("#000000");

  const [hata, setHata] = useState<string | null>(null);
  const [yuklemeMesaji, setYuklemeMesaji] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animRef = useRef<number>(0);
  const loopRef = useRef<boolean>(false);
  const waveformRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sureList = SURAHS.map((s) => ({
    n: s.n,
    ad: sureAdGorunum(s.n, s.name, lang),
    count: s.count,
  }));

  const sure = selectedSure ? SURAHS.find((s) => s.n === selectedSure) : null;
  const toplamAyet = sure ? sure.count : 0;

  const fetchAyetMetni = useCallback(async (s: number, a: number): Promise<{ arabic: string; meal: string }> => {
    try {
      const [arRes, trRes] = await Promise.all([
        fetch(`/api/quran/v1/quran-uthmani/${s}:${a}`),
        fetch(`/api/quran/v1/tr.diyanet/${s}:${a}`),
      ]);
      const arJson = arRes.ok ? await arRes.json() : null;
      const trJson = trRes.ok ? await trRes.json() : null;
      const arabic = arJson?.data?.text || arJson?.data?.surah?.ayahs?.[0]?.text || "";
      const meal = trJson?.data?.text || trJson?.data?.surah?.ayahs?.[0]?.text || "";
      return { arabic, meal };
    } catch {
      return { arabic: "", meal: "" };
    }
  }, []);

  const ayetMetinCache = useRef<Map<string, { arabic: string; meal: string }>>(new Map());

  const getAyetMetin = useCallback(async (s: number, a: number) => {
    const key = `${s}:${a}`;
    if (ayetMetinCache.current.has(key)) return ayetMetinCache.current.get(key)!;
    const metin = await fetchAyetMetni(s, a);
    ayetMetinCache.current.set(key, metin);
    return metin;
  }, [fetchAyetMetni]);

  const handleDosyaSec = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/^audio\//.test(f.type || "")) {
      setHata(t("ukSesYukleyin"));
      return;
    }
    if (f.size > MB) {
      setHata(t("ukBoyutSinir"));
      return;
    }
    setHata(null);
    setSelectedFile(f);
    setStep("secim");
  }, [t]);

  const handleSureSec = useCallback((n: number) => {
    setSelectedSure(n);
    const s = SURAHS.find((x) => x.n === n);
    setAyetSayisi(s?.count ?? 1);
    setTumunuSec(true);
  }, []);

  const handleTumunuSec = useCallback(() => {
    setAyetSayisi(toplamAyet);
    setTumunuSec(true);
  }, [toplamAyet]);

  const handleAyetSayisi = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.max(1, Math.min(toplamAyet, Number(e.target.value || 1)));
    setAyetSayisi(v);
    setTumunuSec(false);
  }, [toplamAyet]);

  const handleSahneUret = useCallback(async () => {
    if (!selectedFile || !selectedSure) return;
    if (!isElit) {
      notify(t("kendiSesProGerekiyor"));
      return;
    }
    setHata(null);
    setYuklemeMesaji(t("kendiSesYukleniyor"));
    try {
      const res = await yukle(selectedFile, selectedSure, ayetSayisi, "tum", maksSn > 0 ? maksSn : undefined);
      setYuklemeMesaji(null);
      if (!res) return;

      const arrayBuffer = await selectedFile.arrayBuffer();
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      try {
        const buf = await ctx.decodeAudioData(arrayBuffer);
        setAudioBuffer(buf);
        setDuration(buf.duration);
        setAudioUrl(URL.createObjectURL(selectedFile));

        const kanal = buf.getChannelData(0);
        const ornekHz = buf.sampleRate;
        const pencereBoyu = Math.max(1, Math.round(0.02 * ornekHz));
        const toplam = Math.floor(kanal.length / pencereBoyu);
        const data: number[] = [];
        for (let p = 0; p < toplam; p += 1) {
          let kare = 0;
          const bas = p * pencereBoyu;
          for (let i = 0; i < pencereBoyu; i += 1) { const v = kanal[bas + i]; kare += v * v; }
          data.push(Math.sqrt(kare / pencereBoyu));
        }
        setWaveformData(data);

        const baslangicSegmentler: AyetSegment[] = [];
        const parca = buf.duration / Math.max(ayetSayisi, 1);
        for (let i = 0; i < ayetSayisi; i++) {
          const ayetNo = i + 1;
          const metin = await getAyetMetin(selectedSure, ayetNo);
          baslangicSegmentler.push({
            id: `seg-${Date.now()}-${i}`,
            ayetNo,
            start: parca * i,
            dur: parca,
            arabic: metin.arabic,
            meal: metin.meal,
            atmos: "none",
            videoBg: ayahBackgrounds?.[ayetNo] || "",
            showArabic: true,
            showMeal: true,
          });
        }
        setSegments(baslangicSegmentler);
        setNextSegId(baslangicSegmentler.length);
        setStep("duzenle");
      } finally {
        ctx.close().catch((err) => { console.error("[KendiSes] AudioContext kapatma hatası:", err); });
      }
    } catch {
      setYuklemeMesaji(null);
      setHata(t("kendiSesHata"));
    }
  }, [selectedFile, selectedSure, isElit, notify, t, yukle, ayetSayisi, maksSn, getAyetMetin]);

  useEffect(() => {
    if (!waveformRef.current || !waveformData) return;
    const canvas = waveformRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const w = rect.width;
    const h = rect.height;
    const mid = h / 2;
    const barW = Math.max(1, w / waveformData.length);
    ctx.fillStyle = "#3b82f6";
    for (let i = 0; i < waveformData.length; i += 1) {
      const v = Math.min(1, waveformData[i] * 4);
      const barH = mid * v;
      ctx.fillRect(i * barW, mid - barH, barW * 0.6, barH * 2);
    }
    if (duration > 0) {
      const x = (currentTime / duration) * w;
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
  }, [waveformData, currentTime, duration]);

  useEffect(() => {
    if (!audioUrl) return;
    let audio: HTMLAudioElement;
    if (!audioRef.current) {
      audio = new Audio(audioUrl);
      audioRef.current = audio;
    } else {
      audio = audioRef.current;
      if (audio.src !== audioUrl) audio.src = audioUrl;
    }
  }, [audioUrl]);

  const playPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.currentTime = currentTime;
      audio.play().catch((err) => { console.error("[KendiSes] Oynatma engeli:", err); });
      setIsPlaying(true);
    }
  }, [isPlaying, currentTime]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
    setPlayingSegId(null);
  }, []);

  const seek = useCallback((value: number) => {
    setCurrentTime(value);
    const audio = audioRef.current;
    if (audio) audio.currentTime = value;
  }, []);

  useEffect(() => {
    if (!isPlaying || !audioRef.current) return;
    loopRef.current = true;
    const tick = () => {
      if (!loopRef.current) return;
      const audio = audioRef.current;
      if (!audio) return;
      const t = audio.currentTime;
      setCurrentTime(t);
      const seg = segments.find((s) => t >= s.start && t < s.start + s.dur);
      if (seg) setPlayingSegId(seg.id);
      if (t >= duration) {
        setIsPlaying(false);
        setPlayingSegId(null);
        loopRef.current = false;
        return;
      }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => {
      loopRef.current = false;
      window.cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, duration, segments]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAyetAyir = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const splitAt = audio.currentTime;
    setSegments((prev) => {
      const yeni: AyetSegment[] = [];
      for (const seg of prev) {
        if (splitAt > seg.start && splitAt < seg.start + seg.dur) {
          const solDur = splitAt - seg.start;
          const sagDur = seg.dur - solDur;
          const sagAyetNo = seg.ayetNo + 1;
          const sagMetin = ayetMetinCache.current.get(`${selectedSure ?? 0}:${sagAyetNo}`) || { arabic: "", meal: "" };
          yeni.push({
            ...seg,
            dur: solDur,
            id: `seg-${Date.now()}-${nextSegId}`,
          });
          yeni.push({
            id: `seg-${Date.now()}-${nextSegId + 1}`,
            ayetNo: sagAyetNo,
            start: splitAt,
            dur: sagDur,
            arabic: sagMetin.arabic,
            meal: sagMetin.meal,
            atmos: seg.atmos,
            videoBg: ayahBackgrounds?.[sagAyetNo] || seg.videoBg,
            showArabic: seg.showArabic,
            showMeal: seg.showMeal,
          });
          setNextSegId(nextSegId + 2);
        } else {
          yeni.push({ ...seg });
        }
      }
      return yeni;
    });
  }, [audioRef, selectedSure, nextSegId]); // eslint-disable-line

  const playSegment = useCallback((seg: AyetSegment) => {
    const audio = audioRef.current;
    if (!audio) return;
    stop();
    audio.currentTime = seg.start;
    audio.play().catch((err) => { console.error("[KendiSes] Segment oynatma engeli:", err); });
    setIsPlaying(true);
    setCurrentTime(seg.start);
    setPlayingSegId(seg.id);
    const timer = window.setTimeout(() => {
      const a2 = audioRef.current;
      if (a2) { a2.pause(); }
      setIsPlaying(false);
      setPlayingSegId(null);
    }, seg.dur * 1000);
    return () => window.clearTimeout(timer);
  }, [stop]);

  const setSegmentDurum = useCallback((id: string, field: "start" | "dur", value: number) => {
    setSegments((prev) => prev.map((s) => s.id === id ? { ...s, [field]: Math.max(0, value) } : s));
  }, []);

  const deleteSegment = useCallback((id: string) => {
    setSegments((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const setSegmentAtmos = useCallback((id: string, atmosId: string) => {
    setSegments((prev) => prev.map((s) => s.id === id ? { ...s, atmos: atmosId } : s));
  }, []);

  const setSegmentVideoBg = useCallback((id: string, videoBg: string) => {
    setSegments((prev) => prev.map((s) => s.id === id ? { ...s, videoBg } : s));
  }, []);

  const toggleArabic = useCallback(() => setShowArabic((p) => !p), []);
  const toggleMeal = useCallback(() => setShowMeal((p) => !p), []);

  const toggleSegArabic = useCallback((id: string) => {
    setSegments((prev) => prev.map((s) => s.id === id ? { ...s, showArabic: !s.showArabic } : s));
  }, []);
  const toggleSegMeal = useCallback((id: string) => {
    setSegments((prev) => prev.map((s) => s.id === id ? { ...s, showMeal: !s.showMeal } : s));
  }, []);

  const handleOnizle = useCallback(() => {
    if (segments.length === 0) return;
    setStep("onizle");
    setCurrentTime(0);
    setIsPlaying(false);
    setPlayingSegId(null);
  }, [segments]);

  const handleKapat = useCallback(() => {
    stop();
    setStep("yukle");
    setSelectedFile(null);
    setSelectedSure(null);
    setAyetSayisi(1);
    setTumunuSec(true);
    setSegments([]);
    setAudioBuffer(null);
    setAudioUrl(null);
    setDuration(0);
    setWaveformData(null);
    setCurrentTime(0);
    setIsPlaying(false);
    setPlayingSegId(null);
    ayetMetinCache.current.clear();
    setHata(null);
    onClose();
  }, [onClose, stop]);

  const adSure = (n: number) => {
    const s = SURAHS.find((x) => x.n === n);
    return s ? sureAdGorunum(s.n, s.name, lang) : String(n);
  };

  const formatSure = (sn: number) => {
    const m = Math.floor(sn / 60);
    const s = Math.floor(sn % 60);
    const ms = Math.floor((sn % 1) * 1000);
    return `${m}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(3, "0")}`;
  };

  const atmosSec = (id: string) => ATMOSPRESETLER.find((a) => a.id === id) ?? ATMOSPRESETLER[ATMOSPRESETLER.length - 1];

  const bgStyle = {
    backgroundColor: arkaplanRenk,
    color: yaziRenk,
  };

  const fontFamily = YAZI_STILLERI.find((y) => y.id === yaziStil)?.fontFamily ?? "'Amiri Quran', serif";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-[700px] max-h-[95vh] flex flex-col overflow-hidden border border-slate-700" onClick={(e) => e.stopPropagation()} style={bgStyle}>
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">{tip.title}</h2>
          </div>
          <button onClick={handleKapat} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
            <X className="text-2xl" />
          </button>
        </div>

        <div className="px-4 py-2 border-b border-slate-700 bg-slate-800/20">
          <p className="text-xs text-slate-400">{tip.desc}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {hata && (
            <div className="p-3 rounded-lg bg-red-900/20 border border-red-500/30 text-red-400 text-xs">
              {hata}
            </div>
          )}

          {step === "yukle" && (
            <>
              <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-slate-800/30 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <AudioWaveform className="w-12 h-12 mx-auto mb-3 text-blue-400" />
                <p className="text-sm font-medium text-white mb-1">{t("kendiSesYukle")}</p>
                <p className="text-xs text-slate-500">MP3 · WAV · M4A · OGG · MP4 · 60 MB hasta</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleDosyaSec}
                />
              </div>
              {yuklemeMesaji && (
                <div className="p-3 rounded-lg bg-blue-900/20 border border-blue-500/30 text-blue-400 text-xs text-center">
                  {yuklemeMesaji}
                </div>
              )}
              <p className="text-xs text-slate-500 text-center">
                ELİT üyelik gerektirir — dosya cihazınızda kalır, sunucuya gitmez.
              </p>
            </>
          )}

          {step === "secim" && selectedFile && (
            <>
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700 mb-2">
                <p className="text-xs text-slate-400 mb-2">Yüklenecek dosya</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-slate-700 flex items-center justify-center text-xs text-slate-300">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{selectedFile.name}</p>
                    <p className="text-[10px] text-slate-400">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · {selectedFile.type || "ses"}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-400 mb-2">{t("kendiSesSureSec")}</p>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5 mb-3">
                {sureList.map((s) => (
                  <button
                    key={s.n}
                    onClick={() => handleSureSec(s.n)}
                    className={`flex flex-col items-center justify-center p-1.5 rounded-lg border transition-all ${
                      selectedSure === s.n
                        ? "bg-blue-600/20 text-white border-blue-500"
                        : "bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500 hover:bg-slate-700"
                    }`}
                    title={`${s.ad} (${s.count} ayet)`}
                  >
                    <span className="text-xs font-bold">{s.n}</span>
                    <span className="text-[9px] leading-tight">{s.ad}</span>
                    <span className="text-[8px] text-slate-500 mt-0.5">{s.count}</span>
                  </button>
                ))}
              </div>

              {selectedSure && (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{adSure(selectedSure)}</span>
                      <span className="text-xs text-slate-500">({toplamAyet} ayet)</span>
                    </div>
                    <button
                      onClick={handleTumunuSec}
                      className="text-[10px] text-blue-400 underline hover:text-blue-300"
                    >
                      Tümünü Seç
                    </button>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                    <p className="text-xs text-slate-400 mb-2">Ayet sayısı</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max={toplamAyet}
                        value={ayetSayisi}
                        onChange={handleAyetSayisi}
                        className="w-20 border border-slate-700 rounded p-1.5 text-center text-sm bg-slate-900 text-white focus:border-blue-500"
                      />
                      <span className="text-xs text-slate-500">ayet</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {tumunuSec ? `Tümü ({toplamAyet} ayet)` : `${ayetSayisi} ayet seçildi`}
                    </p>
                  </div>

                  <button
                    onClick={handleSahneUret}
                    disabled={yukleniyor || !isElit}
                    className="w-full py-3 rounded-lg bg-blue-600 text-white border border-blue-500 hover:bg-blue-500 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {yukleniyor ? "Yükleniyor..." : (
                      <>
                        <Play className="w-4 h-4" />
                        Sahne Düzenleyicisine Geç
                      </>
                    )}
                  </button>
                </>
              )}
            </>
          )}

          {step === "duzenle" && (
            <>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ChevronDown className="w-4 h-4 text-blue-400" onClick={() => setStep("secim")} />
                  <span className="text-sm font-medium text-white">{adSure(selectedSure ?? 0)}</span>
                  <span className="text-xs text-slate-500">({segments.length} ayet parça)</span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={toggleArabic}
                    className={`p-2 rounded hover:bg-slate-800 border text-sm ${showArabic ? "bg-blue-600/20 text-blue-400 border-blue-500" : "text-slate-400 border-slate-700"}`}
                  >
                    <Languages className="w-4 h-4" /> Arapça
                  </button>
                  <button
                    onClick={toggleMeal}
                    className={`p-2 rounded hover:bg-slate-800 border text-sm ${showMeal ? "bg-blue-600/20 text-blue-400 border-blue-500" : "text-slate-400 border-slate-700"}`}
                  >
                    <FileText className="w-4 h-4" /> Meal
                  </button>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700 mb-3 relative">
                <canvas ref={waveformRef} className="w-full h-32 cursor-pointer" onClick={(e) => {
                  if (!waveformRef.current || duration <= 0) return;
                  const rect = waveformRef.current!.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const value = (x / rect.width) * duration;
                  seek(value);
                }} />
                <div className="absolute top-0 right-2 text-[10px] text-slate-500">
                  {formatSure(currentTime)} / {formatSure(duration)}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={stop} className="p-2 rounded bg-slate-800 text-slate-400 hover:text-white">
                    <SquareStop className="w-4 h-4" />
                  </button>
                  <button onClick={playPause} className="p-2.5 rounded bg-blue-600 text-white hover:bg-blue-500">
                    {isPlaying ? <PauseIcon className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={handleAyetAyir}
                    disabled={!isPlaying}
                    className="p-2 rounded bg-green-600/20 text-green-400 border border-green-500/50 hover:bg-green-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Oynatma konumundan ayet ayır"
                  >
                    <Slash className="w-4 h-4" /> Ayet Ayır
                  </button>
                  <span className="text-[10px] text-slate-500 ml-2">
                    {isPlaying ? "Durdurup 'Ayet Ayır' basın" : "Oynatın, durduğu yeri bölün"}
                  </span>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden max-h-[400px] overflow-y-auto">
                <div className="bg-slate-800/30 px-3 py-2 border-b border-slate-700 flex text-[10px] text-slate-400">
                  <span className="w-8">Ayet</span>
                  <span className="w-16">Başlangıç</span>
                  <span className="w-16">Süre</span>
                  <span className="w-16">Atmosfer</span>
                  <span className="w-20">AI Video</span>
                  <span className="flex-1">Arapça / Meal</span>
                  <span className="w-10">Oynat</span>
                </div>
                {segments.map((seg) => {
                  const atmos = atmosSec(seg.atmos);
                  const isActive = playingSegId === seg.id;
                  return (
                    <div key={seg.id} className="px-3 py-2 border-b border-slate-700/50 flex items-center gap-2 group hover:bg-slate-800/30">
                      <span className="w-8 text-xs font-mono text-slate-300">{seg.ayetNo}</span>
                      <span className="w-16 text-xs text-slate-400">{formatSure(seg.start)}</span>
                      <span className="w-16 text-xs text-slate-400">{formatSure(seg.dur)}</span>
                      <div className="w-16">
                        <select
                          value={seg.atmos}
                          onChange={(e) => setSegmentAtmos(seg.id, e.target.value)}
                          className="w-full text-[10px] bg-slate-900 border border-slate-700 rounded text-slate-300 focus:border-blue-500"
                        >
                          {ATMOSPRESETLER.map((a) => (
                            <option key={a.id} value={a.id}>{a.emoji} {a.ad}</option>
                          ))}
                        </select>
                      </div>
                      <div className="w-20">
                        <select
                          value={seg.videoBg}
                          onChange={(e) => setSegmentVideoBg(seg.id, e.target.value)}
                          className="w-full text-[10px] bg-slate-900 border border-slate-700 rounded text-slate-300 focus:border-purple-500"
                        >
                          {AI_VIDEO_PRESETLER.map((v) => (
                            <option key={v.id} value={v.id}>{v.emoji} {v.ad}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1 min-w-0">
                        {showArabic && seg.arabic && (
                          <div className="text-right text-sm font-serif text-amber-200 mb-0.5 leading-tight" style={{ fontFamily }}>
                            {seg.arabic}
                          </div>
                        )}
                        {showMeal && seg.meal && (
                          <div className="text-xs text-slate-400 italic">{seg.meal}</div>
                        )}
                        {!seg.arabic && !seg.meal && (
                          <div className="text-xs text-slate-500 italic">Metin yükleniyor...</div>
                        )}
                      </div>
                      <div className="w-10">
                        <button
                          onClick={() => playSegment(seg)}
                          disabled={isPlaying}
                          className={`p-1 rounded text-slate-400 hover:text-white ${isActive ? "text-green-400" : ""} disabled:opacity-50`}
                        >
                          {isActive ? <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse" /> : <Play className="w-3 h-3" />}
                        </button>
                      </div>
                      <div className="w-6">
                        <button onClick={() => toggleSegArabic(seg.id)} className="p-1 text-slate-500 hover:text-white" title="Arapça göster/gizle">
                          {seg.showArabic ? <CheckCircle className="w-3 h-3 fill-green-500" /> : <Slash className="w-3 h-3" />}
                        </button>
                        <button onClick={() => toggleSegMeal(seg.id)} className="p-1 text-slate-500 hover:text-white ml-1" title="Meal göster/gizle">
                          {seg.showMeal ? <CheckCircle className="w-3 h-3 fill-green-500" /> : <Slash className="w-3 h-3" />}
                        </button>
                        <button onClick={() => deleteSegment(seg.id)} className="p-1 text-red-500/60 hover:text-red-400 ml-1" title="Sil">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {segments.length === 0 && (
                  <div className="px-4 py-4 text-center text-slate-500 text-xs">
                    Henüz segment yok. Oynatın ve "Ayet Ayır" ile bölün.
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 cursor-pointer text-xs text-slate-300">
                    <input type="checkbox" checked={showArabic} onChange={toggleArabic} className="rounded text-blue-600" />
                    Arapça
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer text-xs text-slate-300 ml-2">
                    <input type="checkbox" checked={showMeal} onChange={toggleMeal} className="rounded text-blue-600" />
                    Meal
                  </label>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleKapat}
                    className="px-3 py-2 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-white text-sm font-medium"
                  >
                    Geri
                  </button>
                  <button
                    onClick={handleOnizle}
                    disabled={segments.length === 0}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white border border-blue-500 hover:bg-blue-500 text-sm font-bold disabled:opacity-50"
                  >
                    🎬 Önizle
                  </button>
                </div>
              </div>
            </>
          )}

          {step === "onizle" && (
            <>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ChevronDown className="w-4 h-4 text-blue-400" onClick={() => setStep("duzenle")} />
                  <span className="text-sm font-medium text-white">Önizleme — {adSure(selectedSure ?? 0)}</span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={toggleArabic}
                    className={`p-2 rounded hover:bg-slate-800 border text-sm ${showArabic ? "bg-blue-600/20 text-blue-400 border-blue-500" : "text-slate-400 border-slate-700"}`}
                  >
                    <Languages className="w-4 h-4" /> Arapça
                  </button>
                  <button
                    onClick={toggleMeal}
                    className={`p-2 rounded hover:bg-slate-800 border text-sm ${showMeal ? "bg-blue-600/20 text-blue-400 border-blue-500" : "text-slate-400 border-slate-700"}`}
                  >
                    <FileText className="w-4 h-4" /> Meal
                  </button>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 mb-3 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/10 rounded-xl pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-xs font-mono text-slate-400">
                      {playingSegId ? segments.find((s) => s.id === playingSegId)?.ayetNo : "-"}
                    </span>
                    <span className="text-xs text-slate-500">ayet</span>
                  </div>
                  {showArabic && (
                    <div className="text-2xl md:text-3xl font-serif text-amber-200 mb-1 leading-relaxed" style={{ fontFamily }}>
                      {segments.find((s) => s.id === playingSegId)?.arabic || "—"}
                    </div>
                  )}
                  {showMeal && (
                    <div className="text-sm text-slate-300 italic mb-2">
                      {segments.find((s) => s.id === playingSegId)?.meal || "—"}
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                    <span>{formatSure(currentTime)} / {formatSure(duration)}</span>
                    <span className="w-px bg-slate-700 h-4 mx-1" />
                    <span>{playingSegId ? segments.find((s) => s.id === playingSegId)?.atmos : "—"} atmosfere</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button onClick={stop} className="p-2 rounded bg-slate-800 text-slate-400 hover:text-white">
                      <SquareStop className="w-4 h-4" />
                    </button>
                    <button onClick={playPause} className="p-2.5 rounded bg-blue-600 text-white hover:bg-blue-500">
                      {isPlaying ? <PauseIcon className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span>Başlangıçtan</span>
                    <input
                      type="checkbox"
                      checked={playingSegId === null}
                      onChange={() => setPlayingSegId(playingSegId ? null : segments[0]?.id ?? null)}
                      className="rounded text-blue-600"
                    />
                    <span>Seçili ayetten</span>
                  </div>
                </div>
                <div className="mt-2 flex gap-2 flex-wrap">
                  {segments.map((seg) => (
                    <button
                      key={seg.id}
                      onClick={() => playSegment(seg)}
                      className={`px-2 py-1 rounded text-xs border transition-all ${
                        playingSegId === seg.id
                          ? "bg-green-600/20 text-green-400 border-green-500"
                          : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                      }`}
                    >
                      {seg.ayetNo}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700 mb-3">
                <p className="text-xs text-slate-400 mb-2">Yazı Sanatı</p>
                <div className="flex gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Font:</span>
                    <select
                      value={yaziStil}
                      onChange={(e) => setYaziStil(e.target.value)}
                      className="text-[10px] bg-slate-900 border border-slate-700 rounded text-slate-300 focus:border-blue-500"
                    >
                      {YAZI_STILLERI.map((y) => (
                        <option key={y.id} value={y.id}>{y.ad}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Renk:</span>
                    <input
                      type="color"
                      value={yaziRenk}
                      onChange={(e) => setYaziRenk(e.target.value)}
                      className="w-8 h-6 p-0 border-0 bg-transparent cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Zemin:</span>
                    <input
                      type="color"
                      value={arkaplanRenk}
                      onChange={(e) => setArkaplanRenk(e.target.value)}
                      className="w-8 h-6 p-0 border-0 bg-transparent cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-700">
                <button
                  onClick={handleKapat}
                  className="flex-1 py-2 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-white text-sm font-medium"
                >
                  Kapat
                </button>
                <button
                  onClick={() => notify("🎬 Sahne üretimi başlatılıyor — her ayete atmosphere eklenecek.")}
                  className="flex-1 py-2 rounded-lg bg-blue-600 text-white border border-blue-500 hover:bg-blue-500 text-sm font-bold"
                >
                  🎬 Atmosferle Üret
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
