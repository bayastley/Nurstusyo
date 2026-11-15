import React, { useState, useCallback, useRef } from "react";
import { Upload, ChevronDown, ChevronRight, Play, SquareStop, Sparkles, X, Video, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { SURAHS } from "../data";
import { sureAdGorunum } from "../data/surelerCokDil";
import type { Lang } from "../i18n";
import { translate } from "../i18n";
import type { SesSegmenti } from "../studio/sesZamanlama";
import type { StoredSes } from "../studio/sesDeposu";
import type { KendiSesAktif } from "../studio/useKendiSes";

type PanelStep = "yukle" | "secim" | "sonuc";

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
}

const MB = 60 * 1024 * 1024;

const KENDI_SES_TIPS: Record<string, { title: string; desc: string }> = {
  tr: { title: "Kendi Sesinle Kur'an", desc: "MP4/ses dosyanızı yükleyin, sure ve ayet seçin, sesi ayetlere bölün ve atmosfere ekleyin." },
  en: { title: "Qur'an with Your Voice", desc: "Upload MP4/audio, select surah and verses, split audio proportionally, add atmosphere." },
  ar: { title: "القرآن بصوتك", desc: "قم برفع ملف MP4/صوتي، اختر السورة والآيات، قسم الصوت بشكل متناسب، أضف أجواء." },
  id: { title: "Al-Qur'an dengan Suara Anda", desc: "Unggah MP4/audio, pilih surat dan ayat, bagi audio secara proporsional, tambahkan atmosfer." },
  ur: { title: "اپنی آواز قرآن کریم کے ساتھ", desc: "MP4/آڈیو فائل اپ لوڈ کریں، سورہ اور آیات منتخب کریں، آواز کو متناسب طور پر تقسیم کریں، ماحول شامل کریں۔" },
};

export const KendiSesPanel: React.FC<KendiSesPanelProps> = ({
  lang, onClose, yukle, sec, zamanlamaKaydet, kayitlar, aktifSes, yukleniyor,
  isElit, nefes, maksSn, maksAyarla, yenidenTara, sureEkle, notify,
}) => {
  const t = (k: string): string => translate(lang, k);
  const tip = KENDI_SES_TIPS[lang] ?? KENDI_SES_TIPS.tr;

  const [step, setStep] = useState<PanelStep>("yukle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedSure, setSelectedSure] = useState<number | null>(null);
  const [ayetBas, setAyetBas] = useState<number>(1);
  const [ayetSon, setAyetSon] = useState<number>(1);
  const [tumunuSec, setTumunuSec] = useState<boolean>(false);
  const [sonuc, setSonuc] = useState<{ segments: SesSegmenti[]; id: string; total: number } | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sureList = SURAHS.map((s) => ({
    n: s.n,
    ad: sureAdGorunum(s.n, s.name, lang),
    count: s.count,
  }));

  const sure = selectedSure ? SURAHS.find((s) => s.n === selectedSure) : null;
  const toplamAyet = sure ? sure.count : 0;

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
    setAyetBas(1);
    setAyetSon(s?.count ?? 1);
    setTumunuSec(true);
  }, []);

  const handleTumunuSec = useCallback(() => {
    if (!sure) return;
    setAyetBas(1);
    setAyetSon(toplamAyet);
    setTumunuSec(true);
  }, [sure, toplamAyet]);

  const handleAyetBas = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.max(1, Math.min(toplamAyet, Number(e.target.value || 1)));
    setAyetBas(v);
    setTumunuSec(false);
    if (v > ayetSon) setAyetSon(v);
  }, [toplamAyet, ayetSon]);

  const handleAyetSon = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.max(ayetBas, Math.min(toplamAyet, Number(e.target.value || 1)));
    setAyetSon(v);
    setTumunuSec(false);
  }, [ayetBas, toplamAyet]);

  const handleSahneUret = useCallback(async () => {
    if (!selectedFile || !selectedSure) return;
    if (!isElit) {
      notify(t("kendiSesProGerekiyor"));
      return;
    }
    setHata(null);
    const ayetSayisi = tumunuSec ? toplamAyet : (ayetSon - ayetBas + 1);
    try {
      const res = await yukle(selectedFile, selectedSure, ayetSayisi, "tum", maksSn > 0 ? maksSn : undefined);
      if (!res) return;
      setSonuc(res);
      setStep("sonuc");
    } catch {
      setHata(t("kendiSesHata"));
    }
  }, [selectedFile, selectedSure, isElit, notify, t, yukle, toplamAyet, ayetBas, ayetSon, tumunuSec, maksSn]);

  const handleYenidenTara = useCallback(async () => {
    if (!sonuc) return;
    const ok = await yenidenTara(sonuc.id, sonuc.segments.length, maksSn > 0 ? maksSn : undefined);
    if (ok) {
      const row = kayitlar.find((k) => k.id === sonuc.id);
      if (row) {
        setSonuc({ segments: [], id: row.id, total: row.sure_sn });
      }
    }
  }, [sonuc, yenidenTara, kayitlar, maksSn]);

  const handleAtmosferEkle = useCallback(() => {
    if (!sonuc || !aktifSes) return;
    notify("🎬 Sahne üretimi başlatılıyor — her ayete akıllı atmosfer eklenecek.");
  }, [sonuc, aktifSes, notify]);

  const handleKapat = useCallback(() => {
    setStep("yukle");
    setSelectedFile(null);
    setSelectedSure(null);
    setAyetBas(1);
    setAyetSon(1);
    setTumunuSec(false);
    setSonuc(null);
    setHata(null);
    onClose();
  }, [onClose]);

  const adSure = (n: number) => {
    const s = SURAHS.find((x) => x.n === n);
    return s ? sureAdGorunum(s.n, s.name, lang) : String(n);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden border border-slate-700" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            {tip.title}
          </h2>
          <button onClick={handleKapat} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
            <X className="text-2xl" />
          </button>
        </div>

        {/* Subtitle */}
        <div className="px-4 py-2 border-b border-slate-700 bg-slate-800/30">
          <p className="text-xs text-slate-400">{tip.desc}</p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {step === "yukle" && (
            <>
              <div className="border-2 border-dashed border-slate-600 rounded-xl p-6 text-center hover:border-blue-500 hover:bg-slate-800/30 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Video className="w-10 h-10 mx-auto mb-2 text-blue-400" />
                <p className="text-sm font-medium text-white mb-1">{t("kendiSesYukle")}</p>
                <p className="text-xs text-slate-500">MP4 · WAV · M4A · OGG · 60 MB hasta</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleDosyaSec}
                />
              </div>
              {hata && (
                <div className="p-3 rounded-lg bg-red-900/20 border border-red-500/30 text-red-400 text-xs">
                  {hata}
                </div>
              )}
              <p className="text-xs text-slate-500 text-center">
                ELİT üyelik gerektirir — MP4/ses dosyanız cihazınızda kalır, IndexedDB'de saklanır.
              </p>
            </>
          )}

          {step === "secim" && selectedFile && (
            <>
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700 mb-2">
                <p className="text-xs text-slate-400 mb-2">Yüklenecek dosya</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-slate-700 flex items-center justify-center text-xs text-slate-300">
                    <Video className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{selectedFile.name}</p>
                    <p className="text-[10px] text-slate-400">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · {selectedFile.type || "ses/video"}
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
                    <p className="text-xs text-slate-400 mb-2">{t("kendiSesAyetSec")}</p>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        max={toplamAyet}
                        value={ayetBas}
                        onChange={handleAyetBas}
                        className="w-16 border border-slate-700 rounded p-1.5 text-center text-sm bg-slate-900 text-white focus:border-blue-500"
                      />
                      <span className="px-1 text-slate-500 text-xs">—</span>
                      <input
                        type="number"
                        min="1"
                        max={toplamAyet}
                        value={ayetSon}
                        onChange={handleAyetSon}
                        className="w-16 border border-slate-700 rounded p-1.5 text-center text-sm bg-slate-900 text-white focus:border-blue-500"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {tumunuSec ? `Tümü ({toplamAyet} ayet)` : `${ayetSon - ayetBas + 1} ayet seçildi`}
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
                        Sahne Üret
                      </>
                    )}
                  </button>
                </>
              )}
            </>
          )}

          {step === "sonuc" && sonuc && (
            <>
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700 mb-3">
                <p className="text-xs text-slate-400 mb-2">Analiz Sonucu</p>
                <div className="space-y-1 text-sm">
                  <p className="text-white"><span className="text-slate-400">Sure:</span> {adSure(selectedSure ?? 0)}</p>
                  <p className="text-white"><span className="text-slate-400">Bölüm:</span> {sonuc.segments.length} ayet segmenti</p>
                  <p className="text-white"><span className="text-slate-400">Toplam süre:</span> {sonuc.total.toFixed(2)} sn</p>
                  <p className="text-white"><span className="text-slate-400">Ortalama:</span> {(sonuc.total / Math.max(sonuc.segments.length, 1)).toFixed(2)} sn/ayet</p>
                </div>
              </div>

              <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700 mb-3">
                <p className="text-xs text-slate-400 mb-2">Akıllı Atmosfer</p>
                <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-800/50 rounded">
                  <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                  <span className="text-sm text-slate-300">Her ayete atmosphere ekle (AI önerisi)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-800/50 rounded block mt-1">
                  <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                  <span className="text-sm text-slate-300">Arapça meal göster/gizle toggle</span>
                </label>
              </div>

              {hata && (
                <div className="p-3 rounded-lg bg-red-900/20 border border-red-500/30 text-red-400 text-xs">
                  {hata}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleKapat}
                  className="flex-1 py-2 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-white text-sm font-medium"
                >
                  Kapat
                </button>
                <button
                  onClick={handleAtmosferEkle}
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
