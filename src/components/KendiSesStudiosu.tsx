import React, { useState, useCallback } from "react";
import { Play, Pause, SquareStop, Upload, Volume2, Edit3, Video, Sparkles, Languages, Loader2, Lock } from "lucide-react";
import { SURAHS } from "../data";
import { sureAdGorunum } from "../data/surelerCokDil";
import type { Lang } from "../i18n";
import { translate } from "../i18n";
import { useKendiSesiniYukle } from "../studio/useKendiSes";
import { baslangicKaydir, duzelt, SesSegmenti } from "../studio/sesZamanlama";
import { getCurrentTier, tierAtLeast, type Tier } from "../tier";

const ATMO_OPTIONS = [
  { id: "none", label: "Yok", emoji: "⚪" },
  { id: "masjid", label: "Camii", emoji: "🕌" },
  { id: "nature", label: "Doğa", emoji: "🌿" },
  { id: "desert", label: "Çöl", emoji: "🏜️" },
  { id: "night", label: "Gece", emoji: "🌙" },
  { id: "sea", label: "Deniz", emoji: "🌊" },
  { id: "candle", label: "Mum", emoji: "🕯️" },
] as const;

interface KayitOzet {
  id: string;
  sure_no: number;
  ayet_baslangic: number;
  ayet_bitis: number;
  dosya_adi: string;
  durum: string;
  audio_url?: string;
  segmentler: any;
}

interface KendiSesStudiosuProps {
  lang: Lang;
  onCheckout: (code: string) => void;
  /** Üret butonuna tıklandığında aktif kendi-ses kaydını stüdyo motoruna aktarır */
  onProduce?: (id: string) => void;
}

export const KendiSesStudiosu: React.FC<KendiSesStudiosuProps> = ({ lang, onCheckout, onProduce }) => {
  const t = (k: string) => translate(lang, k);
  const tier: Tier = getCurrentTier();
  const canUpload = tier === "pro" || tier === "elit";

  const [step, setStep] = useState<"surah"|"ayah"|"upload"|"edit"|"preview">("surah");
  const [sureNo, setSureNo] = useState<number | null>(null);
  const [ayetBas, setAyetBas] = useState<number>(1);
  const [ayetSon, setAyetSon] = useState<number>(1);
  const [file, setFile] = useState<File | null>(null);
  const [mealVisible, setMealVisible] = useState(false);
  const [playingAyet, setPlayingAyet] = useState<number | null>(null);
  const [atmoPerAyet, setAtmoPerAyet] = useState<Record<number, string>>({});
  const [aiSuggested, setAiSuggested] = useState<Record<number, string>>({});

  const { aktif, yukleniyor, yukle, kaldirAktif, zamanlamaKaydet } = useKendiSesiniYukle({ notify: () => {} });

  const sure = sureNo ? SURAHS.find((s) => s.n === sureNo) : null;
  const toplamAyet = sure ? sure.count : 0;

  const sureList = useCallback(() => {
    return SURAHS.map((s) => ({ n: s.n, ad: sureAdGorunum(s.n, s.name, lang), count: s.count }));
  }, [lang]);

  const handleSureSec = (n: number) => {
    const s = SURAHS.find((x) => x.n === n);
    setSureNo(n);
    setAyetBas(1);
    setAyetSon(s ? s.count : 1);
    setStep("ayah");
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleUpload = async () => {
    if (!file || !sureNo) return;
    setStep("edit");
    const sonuc = await yukle(file, sureNo, toplamAyet, "tum");
    if (!sonuc) { setStep("upload"); return; }
    const atmo: Record<number, string> = {};
    const ai: Record<number, string> = {};
    for (let i = 0; i < toplamAyet; i++) {
      const ayetNo = ayetBas + i;
      ai[ayetNo] = aiAtmoOner(sureNo, ayetNo);
      atmo[ayetNo] = ai[ayetNo];
    }
    setAiSuggested(ai);
    setAtmoPerAyet(atmo);
  };

  const handleAyetBaslangicDegisti = (index: number, yeniMs: number) => {
    if (!aktif) return;
    const toplamSure = aktif.segments[aktif.segments.length - 1].start + aktif.segments[aktif.segments.length - 1].dur;
    const yeni = baslangicKaydir(aktif.segments, index, yeniMs / 1000, toplamSure);
    const guncel = duzelt(yeni, toplamSure);
    zamanlamaKaydet(aktif.id, guncel);
  };

  const handleAtmoSec = (ayetNo: number, atmoId: string) => {
    setAtmoPerAyet((p) => ({ ...p, [ayetNo]: atmoId }));
  };

  const handleAiUygula = (ayetNo: number) => {
    const ai = aiSuggested[ayetNo];
    if (!ai) return;
    setAtmoPerAyet((p) => ({ ...p, [ayetNo]: ai }));
  };

  const playAyet = (index: number) => {
    if (!aktif || !aktif.segments[index]) return;
    const seg = aktif.segments[index];
    setPlayingAyet(ayetBas + index);
    const a = new Audio(aktif.url);
    a.currentTime = seg.start;
    a.play();
    a.onended = () => { setPlayingAyet(null); };
  };

  const stopPlay = () => {
    setPlayingAyet(null);
  };

  const aiAtmoOner = (sureNo: number, ayetNo: number): string => {
    const anahtar: Record<number, string> = {
      2: "masjid", 3: "nature", 4: "desert", 5: "night", 6: "sea",
      18: "candle", 19: "night", 25: "nature", 27: "masjid",
      36: "sea", 55: "nature", 67: "desert", 78: "night",
      99: "candle", 112: "masjid", 113: "night", 114: "night",
    };
    return anahtar[sureNo] || "nature";
  };

  const getSegments = (): SesSegmenti[] => {
    if (!aktif) return [];
    return aktif.segments;
  };

  const renderSureGrid = () => {
    const liste = sureList();
    return (
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 p-4">
        {liste.map((s) => (
          <button
            key={s.n}
            onClick={() => handleSureSec(s.n)}
            className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
              sureNo === s.n ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700 border-slate-200 hover:border-blue-400"
            }`}
            title={`${s.ad} (${s.count} ayet)`}
          >
            <span className="text-xs font-bold">{s.n}</span>
            <span className="text-[10px] truncate w-full text-center">{s.ad}</span>
            <span className="text-[9px] text-slate-500 mt-0.5">{s.count}</span>
          </button>
        ))}
      </div>
    );
  };

  // ---- Tier gate ----
  if (!canUpload) {
    return (
      <div className="p-6 text-center">
        <Lock className="w-16 h-16 mx-auto text-slate-400 mb-4" />
        <h2 className="text-xl font-bold mb-2">{t("kendiSesTitle")}</h2>
        <p className="text-slate-600 mb-4">{t("kendiSesProGerekiyor")}</p>
        <button
          onClick={() => onCheckout(tier === "free" ? "SUB_PRO_1M" : "SUB_ELIT_1M")}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
        >
          {tier === "free" ? "NÛR PRO / ELİT'e Geçin" : "ELİT'e Yükseltin"}
        </button>
      </div>
    );
  }

  // ---- Step: Surah selection ----
  if (step === "surah") {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Upload className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold">{t("kendiSesTitle")}</h1>
        </div>
        <p className="text-slate-600 mb-6">{t("kendiSesSubtitle")}</p>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">{t("kendiSesSureSec")}</label>
          {renderSureGrid()}
        </div>
        <div className="text-xs text-slate-500">Toplam 114 sure — tıklayarak seçin.</div>
      </div>
    );
  }

  const sureAd = sure ? sureAdGorunum(sure.n, sure.name, lang) : "";

  // ---- Step: Ayah range ----
  if (step === "ayah") {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Video className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold">{t("kendiSesTitle")}</h1>
        </div>
        <p className="text-slate-600 mb-6">{sureAd} — {toplamAyet} ayet</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t("kendiSesAyetSec")}</label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max={toplamAyet}
                value={ayetBas}
                onChange={(e) => setAyetBas(Math.max(1, Math.min(toplamAyet, Number(e.target.value || 1))))}
                className="w-20 border border-slate-300 rounded-lg p-2 text-center"
              />
              <span className="px-2 text-slate-500">—</span>
              <input
                type="number"
                min="1"
                max={toplamAyet}
                value={ayetSon}
                onChange={(e) => setAyetSon(Math.max(ayetBas, Math.min(toplamAyet, Number(e.target.value || 1))))}
                className="w-20 border border-slate-300 rounded-lg p-2 text-center"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">{ayetSon - ayetBas + 1} ayet seçildi</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setStep("surah"); }}
              className="border border-slate-300 text-slate-700 px-5 py-2 rounded-lg hover:bg-slate-50"
            >
              ← Geri
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || yukleniyor}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {yukleniyor ? t("kendiSesYukleniyor") : t("kendiSesYukle")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- Step: Upload ----
  if (step === "upload") {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Upload className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold">{t("kendiSesTitle")}</h1>
        </div>
        <p className="text-slate-600 mb-4">{sureAd} — {toplamAyet} ayet</p>

        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center mb-6 hover:border-blue-400 transition-colors">
          <input
            id="ses-yukle-input"
            type="file"
            accept="audio/*"
            onChange={onFileChange}
            className="hidden"
          />
          <label
            htmlFor="ses-yukle-input"
            className="flex flex-col items-center gap-2 px-8 py-6 bg-white border border-slate-200 rounded-lg hover:bg-blue-50 cursor-pointer"
          >
            <Upload className="w-10 h-10 text-blue-600" />
            <span className="font-medium text-slate-700">{t("kendiSesYukle")}</span>
            <span className="text-xs text-slate-500">MP3, WAV, OGG, M4A (maks. 30 MB)</span>
          </label>
        </div>

        {file && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">{file.name}</span>
              <span className="text-xs text-slate-500">({Math.round(file.size / 1024)} KB)</span>
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-between">
          <button
            onClick={() => { setStep("ayah"); }}
            className="border border-slate-300 text-slate-700 px-5 py-2 rounded-lg hover:bg-slate-50"
          >
            ← Geri
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || yukleniyor}
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {yukleniyor ? t("kendiSesYukleniyor") : t("kendiSesBolumle")}
          </button>
        </div>
        {yukleniyor && (
          <div className="mt-4 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span className="text-sm text-slate-600">Ses analiz ediliyor…</span>
          </div>
        )}
      </div>
    );
  }

  // ---- Step: Edit segments ----
  if (step === "edit") {
    const segments = getSegments();
    const adet = segments.length;

    return (
      <div className="p-4 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Edit3 className="w-7 h-7 text-blue-600" />
            <h1 className="text-xl font-bold">{t("kendiSesTitle")}</h1>
          </div>
          <div className="text-xs text-slate-500">{sureAd} · {adet} ayet</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Play className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">{t("kendiSesDuzelt")}</span>
            </div>
            <p className="text-xs text-slate-600">Her ayetin başlangıcını milisaniye ile ayarlayın. Yanlış yerden bölünmez.</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium">{t("kendiSesAtmosferAI")}</span>
            </div>
            <p className="text-xs text-slate-600">Kelime bazlı atmosfer önerisi — her ayete uygulayabilirsiniz.</p>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white mb-4">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="p-3 font-medium">Ayet</th>
                <th className="p-3 font-medium">Başlangıç (ms)</th>
                <th className="p-3 font-medium">Süre (ms)</th>
                <th className="p-3 font-medium">Oynat</th>
                <th className="p-3 font-medium">Atmosfer</th>
                <th className="p-3 font-medium">AI Öner</th>
              </tr>
            </thead>
            <tbody>
              {segments.map((seg, i) => {
                const ayetNo = ayetBas + i;
                const basMs = Math.round(seg.start * 1000);
                const sureMs = Math.round(seg.dur * 1000);
                const atmo = atmoPerAyet[ayetNo] || "none";
                return (
                  <tr key={ayetNo} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-3 font-mono">{ayetNo}</td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={basMs}
                        onChange={(e) => handleAyetBaslangicDegisti(i, Number(e.target.value || 0))}
                        className="w-24 border border-slate-300 rounded p-1 text-center"
                      />
                    </td>
                    <td className="p-3 font-mono text-slate-500">{sureMs}</td>
                    <td className="p-3">
                      <button
                        onClick={() => playAyet(i)}
                        disabled={playingAyet === ayetNo}
                        className={`p-1.5 rounded hover:bg-slate-100 ${playingAyet === ayetNo ? "text-green-600" : "text-slate-500"}`}
                      >
                        {playingAyet === ayetNo ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="p-3">
                      <select
                        value={atmo}
                        onChange={(e) => handleAtmoSec(ayetNo, e.target.value as string)}
                        className="w-full border border-slate-300 rounded p-1 text-[10px]"
                      >
                        {ATMO_OPTIONS.map((o) => (
                          <option key={o.id} value={o.id}>{o.emoji} {o.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3">
                      {aiSuggested[ayetNo] && atmo !== aiSuggested[ayetNo] ? (
                        <button
                          onClick={() => handleAiUygula(ayetNo)}
                          className="text-[10px] text-blue-600 underline hover:text-blue-800"
                        >
                          {ATMO_OPTIONS.find((o) => o.id === aiSuggested[ayetNo])?.emoji} {ATMO_OPTIONS.find((o) => o.id === aiSuggested[ayetNo])?.label}
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex gap-3 justify-between items-end mb-6">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={mealVisible}
              onChange={(e) => setMealVisible(e.target.checked)}
              className="rounded"
            />
            <label className="text-sm">{t("kendiSesMeal")}</label>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setStep("surah"); kaldirAktif(); }}
              className="border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50"
            >
              ← Ana Ekran
            </button>
            {onProduce && aktif && (
              <button
                onClick={() => onProduce(aktif.id)}
                className="bg-green-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-700"
              >
                🎬 Stüdyoda Üret
              </button>
            )}
            <button
              onClick={() => { setStep("preview"); }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
            >
              {t("kendiSesOnizleme")} →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- Step: Preview ----
  if (step === "preview") {
    const segments = getSegments();
    const adet = segments.length;

    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Play className="w-7 h-7 text-green-600" />
            <h1 className="text-xl font-bold">{t("kendiSesOnizleme")}</h1>
          </div>
          <div className="text-xs text-slate-500">{sureAd} · ayet ayet oynat</div>
        </div>

        <div className="bg-slate-900 rounded-xl p-4 mb-6 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-bold text-lg">{sureAd}</div>
                <div className="text-sm text-slate-400">{adet} ayet · kendi sesinizle</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={stopPlay}
                  className="p-2 rounded bg-slate-700 hover:bg-slate-600"
                >
                  <SquareStop className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setMealVisible(!mealVisible)}
                  className="p-2 rounded bg-slate-700 hover:bg-slate-600"
                >
                  <Languages className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {segments.map((seg, i) => {
                const ayetNo = ayetBas + i;
                const atmo = atmoPerAyet[ayetNo];
                const atmoEmoji = ATMO_OPTIONS.find((o) => o.id === atmo)?.emoji || "⚪";
                return (
                  <div
                    key={ayetNo}
                    onClick={() => playAyet(i)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                      playingAyet === ayetNo
                        ? "bg-blue-500/20 border border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                        : "bg-slate-800/50 border border-slate-700 hover:border-slate-600"
                    }`}
                  >
                    <span className="w-8 text-center font-mono text-blue-400">{ayetNo}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{sureAd} · {ayetNo}. ayet</div>
                      <div className="text-xs text-slate-400">
                        {atmoEmoji} {ATMO_OPTIONS.find((o) => o.id === atmo)?.label} ·
                        {Math.round(seg.start * 1000)} ms · {Math.round(seg.dur * 1000)} ms
                      </div>
                    </div>
                    <button className="p-1.5 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600/40">
                      <Play className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {mealVisible && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Languages className="w-5 h-5 text-amber-600" />
              <span className="font-medium text-amber-800">Arapça meal görünür</span>
            </div>
            <p className="text-sm text-amber-700">
              Önizlemede her ayetin yanında Arapça meal gösterilir. (Çok dilli destek: tr/en/ar/id/ur)
            </p>
          </div>
        )}

        <div className="flex gap-3 justify-between">
          <button
            onClick={() => { setStep("edit"); }}
            className="border border-slate-300 text-slate-700 px-5 py-2 rounded-lg hover:bg-slate-50"
          >
            ← Düzenlemeye Dön
          </button>
          {onProduce && aktif && (
            <button
              onClick={() => onProduce(aktif.id)}
              className="bg-green-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-700"
            >
              🎬 Stüdyoda Üret
            </button>
          )}
          <button
            onClick={() => { setStep("surah"); kaldirAktif(); }}
            className="bg-slate-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-slate-800"
          >
            Yeni Kayıt Başlat
          </button>
        </div>
      </div>
    );
  }

  return null;
};
