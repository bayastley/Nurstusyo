import React, { useState } from "react";
import { Play, SquareStop, Sparkles, ChevronDown, ChevronRight } from "lucide-react";
import { SURAHS } from "../data";
import { sureAdGorunum } from "../data/surelerCokDil";
import type { Lang } from "../i18n";
import { translate } from "../i18n";

interface KendiSesPanelProps {
  lang: Lang;
  onProduce: (sureNo: number, ayetBas: number, ayetSon: number) => void;
  onClose: () => void;
}

export const KendiSesPanel: React.FC<KendiSesPanelProps> = ({
  lang, onProduce, onClose,
}) => {
  const t = (k: string) => translate(lang, k);
  const [openSurah, setOpenSurah] = useState<number | null>(null);
  const [ayetBas, setAyetBas] = useState<number>(1);
  const [ayetSon, setAyetSon] = useState<number>(1);

  const sureList = SURAHS.map((s) => ({
    n: s.n,
    ad: sureAdGorunum(s.n, s.name, lang),
    count: s.count,
  }));

  const sure = openSurah ? SURAHS.find((s) => s.n === openSurah) : null;
  const toplamAyet = sure ? sure.count : 0;

  const setRange = (bas: number, son: number) => {
    setAyetBas(bas);
    setAyetSon(son);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden border border-slate-700" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            {t("kendiSesTitle")}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
            <span className="text-2xl">✕</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {!openSurah ? (
            /* --- Sure grid: tüm sureler (küçük kartlar) --- */
            <div>
              <p className="text-sm text-slate-400 mb-3">{t("kendiSesSureSec")}</p>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5">
                {sureList.map((s) => (
                  <button
                    key={s.n}
                    onClick={() => { setOpenSurah(s.n); setAyetBas(1); setAyetSon(s.count); }}
                    className={`flex flex-col items-center justify-center p-1.5 rounded-lg border transition-all ${
                      openSurah === s.n
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
            </div>
          ) : (
            /* --- Sure seçildi: küçülmüş görünüm, ayet aralığı --- */
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ChevronDown className="w-4 h-4 text-blue-400" onClick={() => setOpenSurah(null)} />
                  <span className="text-sm font-medium text-white">{sure?.name}</span>
                  <span className="text-xs text-slate-500">({toplamAyet} ayet)</span>
                </div>
                <button
                  onClick={() => setRange(1, toplamAyet)}
                  className="text-[10px] text-blue-400 underline hover:text-blue-300"
                >
                  Tümünü seç
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
                    onChange={(e) => setAyetBas(Math.max(1, Math.min(toplamAyet, Number(e.target.value || 1))))}
                    className="w-16 border border-slate-700 rounded p-1.5 text-center text-sm bg-slate-900 text-white focus:border-blue-500"
                  />
                  <span className="px-1 text-slate-500 text-xs">—</span>
                  <input
                    type="number"
                    min="1"
                    max={toplamAyet}
                    value={ayetSon}
                    onChange={(e) => setAyetSon(Math.max(ayetBas, Math.min(toplamAyet, Number(e.target.value || 1))))}
                    className="w-16 border border-slate-700 rounded p-1.5 text-center text-sm bg-slate-900 text-white focus:border-blue-500"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">{ayetSon - ayetBas + 1} ayet seçildi</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-white text-sm font-medium"
          >
            Kapat
          </button>
          <button
            onClick={() => onProduce(openSurah || 1, ayetBas, ayetSon)}
            disabled={!openSurah}
            className="flex-1 py-2 rounded-lg bg-blue-600 text-white border border-blue-500 hover:bg-blue-500 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {openSurah ? "🎬 Üret" : "Sure seçin"}
          </button>
        </div>
      </div>
    </div>
  );
};
