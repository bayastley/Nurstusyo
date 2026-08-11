import React from "react";
import { LibraryBig, Search, Loader2, Check, Plus, BookOpen, X } from "lucide-react";
import { SectionTitle } from "./UIElements";
import { SURAHS } from "../data";
import { T } from "../i18n";
import type { SelectedAyah, SearchHit, ModalName } from "../types";
import type { Clip } from "../clips";

interface AyahLibraryPanelProps {
  query: string;
  setQuery: (q: string) => void;
  searching: boolean;
  results: SearchHit[];
  surah: string;
  setSurah: (s: string) => void;
  ayah: string;
  setAyah: (a: string) => void;
  selected: SelectedAyah[];
  toggleAyah: (s: number, a: number, tr?: string) => void;
  addWholeSurah: () => void;
  t: (key: keyof (typeof T)["tr"]) => string;
  /** ★ Seçili ayetler paneli (orta bölümden buraya taşındı) */
  verseIndex: number;
  setVerseIndex: React.Dispatch<React.SetStateAction<number>>;
  setSelected: React.Dispatch<React.SetStateAction<SelectedAyah[]>>;
  setAyahBackgrounds: React.Dispatch<React.SetStateAction<Record<string, Clip>>>;
  ayahBackgrounds: Record<string, Clip>;
  setPickingFor: (id: string | null) => void;
  setModal: (m: ModalName) => void;
}

export const AyahLibraryPanel: React.FC<AyahLibraryPanelProps> = ({
  query,
  setQuery,
  searching,
  results,
  surah,
  setSurah,
  ayah,
  setAyah,
  selected,
  toggleAyah,
  addWholeSurah,
  t,
  verseIndex,
  setVerseIndex,
  setSelected,
  setAyahBackgrounds,
  ayahBackgrounds,
  setPickingFor,
  setModal,
}) => {
  return (
    <aside className="space-y-4">
      <section className="glass rounded-2xl p-3.5">
        <SectionTitle icon={LibraryBig} title={t("library")} />
        
        {/* Search input */}
        <div className="relative mb-2">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Sure ara... (ör: Bakara)"
            className="glass-soft w-full rounded-xl py-2.5 pl-8 pr-9 text-[11px] text-white outline-none placeholder:text-white/25 focus:border-[color:var(--accent)]"
          />
          {/* ★ Aramayı ve sonuç listesini temizle */}
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              title="Aramayı temizle"
              className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white/50 transition hover:bg-red-500/25 hover:text-red-300"
            >
              <X size={11} strokeWidth={3} />
            </button>
          ) : null}
        </div>

        {/* Search results dropdown */}
        {searching || results.length ? (
          <div className="glass-soft mb-2 max-h-36 space-y-1 overflow-y-auto rounded-xl p-1.5 pr-1 scrollbar-thin">
            {!searching && results.length ? (
              <div className="mb-1 flex items-center justify-between px-1.5">
                <span className="text-[8.5px] font-bold uppercase tracking-wider text-white/30">
                  {results.length} sonuç
                </span>
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="flex items-center gap-1 rounded-md bg-white/5 px-1.5 py-0.5 text-[8.5px] font-bold text-white/45 transition hover:bg-red-500/20 hover:text-red-300"
                >
                  <X size={8} strokeWidth={3} /> Listeyi Kapat
                </button>
              </div>
            ) : null}
            {searching ? (
              <p className="flex items-center gap-2 px-2 py-2 text-[10px] text-white/35">
                <Loader2 size={11} className="animate-spin" />Aranıyor...
              </p>
            ) : null}
            {results.map((result) => (
              <button
                key={`${result.s}:${result.a}`}
                onClick={() => {
                  setSurah(String(result.s));
                  setAyah(String(result.a));
                }}
                className="w-full rounded-lg px-2.5 py-2 text-left text-[10px] text-white/65 hover:bg-white/5 hover:text-white"
              >
                <span className="font-bold" style={{ color: "var(--accent)" }}>
                  {result.name} {result.s}:{result.a}
                </span>
                <span className="mt-0.5 block truncate text-[9px] text-white/35">{result.tr}</span>
              </button>
            ))}
          </div>
        ) : null}

        {/* Dropdown selectors */}
        <div className="mb-2 grid grid-cols-[1fr_68px] gap-1.5">
          <select
            value={surah}
            onChange={(event) => {
              const newSurah = Number(event.target.value);
              setSurah(event.target.value);
              setAyah("1");
              toggleAyah(newSurah, 1);
            }}
            className="glass-soft rounded-xl px-2 py-2 text-[10px] outline-none"
          >
            {SURAHS.map((item) => (
              <option key={item.n} value={item.n}>{`${item.n}. ${item.name} (${item.count})`}</option>
            ))}
          </select>
          <select
            value={ayah}
            onChange={(event) => setAyah(event.target.value)}
            className="glass-soft rounded-xl px-2 py-2 text-[10px] outline-none"
          >
            {Array.from({ length: SURAHS[Number(surah) - 1]?.count ?? 1 }, (_, index) => (
              <option key={index + 1} value={index + 1}>{index + 1}</option>
            ))}
          </select>
        </div>

        {/* Ayah list */}
        <div className="glass-soft mb-2 max-h-[228px] overflow-y-auto rounded-xl p-1.5 scrollbar-thin">
          {Array.from({ length: SURAHS[Number(surah) - 1].count }, (_, i) => i + 1).map((number) => {
            const isSelected = selected.some(x => x.id === `${surah}:${number}`);
            return (
              <button
                key={number}
                onClick={() => {
                  setAyah(String(number));
                  toggleAyah(Number(surah), number);
                }}
                className={`group flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-[10px] ${
                  isSelected ? "text-red-400" : "text-white/60"
                } hover:bg-white/5 hover:text-white`}
              >
                <span>
                  <b className="font-semibold">{SURAHS[Number(surah) - 1].name} {surah}:{number}</b>
                  <span className="block text-[9px] text-white/30">{isSelected ? "Çıkar ✗" : "Meal ekle"}</span>
                </span>
                {isSelected ? <Check size={11} className="text-red-400" /> : <Plus size={11} className="opacity-40 group-hover:opacity-100" />}
              </button>
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => toggleAyah(Number(surah), Number(ayah))}
            className="flex items-center justify-center gap-1 rounded-xl py-2 text-[10px] font-bold text-black"
            style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
          >
            <Plus size={11} />{t("addAyah")}
          </button>
          <button
            onClick={addWholeSurah}
            className="glass-soft flex items-center justify-center gap-1 rounded-xl py-2 text-[10px] font-semibold text-white/65"
          >
            <BookOpen size={11} />{t("wholeSurah")}
          </button>
        </div>

        {/* ★ SEÇİLİ AYETLER — orta panelden buraya taşındı, önizleme alanı ferahladı */}
        <div className="mt-3 border-t border-white/5 pt-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-[.15em] text-white/40">
              {t("selectedAyahs")} ({selected.length})
            </span>
            {selected.length ? (
              <button
                onClick={() => { setSelected([]); setVerseIndex(0); setAyahBackgrounds({}); }}
                className="text-[8.5px] font-bold text-red-400 transition hover:text-red-300"
              >
                Temizle
              </button>
            ) : null}
          </div>

          {selected.length ? (
            <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto scrollbar-thin pr-0.5">
              {selected.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => { setPickingFor(item.id); setModal("atmos"); }}
                  title="Bu ayete özel atmosfer seç"
                  className={`glass-soft flex items-center gap-1 rounded-full py-1 pl-2 pr-1 text-[9px] transition ${
                    index === verseIndex
                      ? "text-white ring-1 ring-[color:var(--accent)]"
                      : "text-white/55 hover:text-white/80"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${ayahBackgrounds[item.id] ? "bg-emerald-400" : "bg-white/20"}`} />
                  <span className="truncate max-w-[110px]">
                    {item.s > 0 ? `${item.sName} ${item.s}:${item.a}` : item.sName}
                  </span>
                  <span
                    role="button"
                    className="rounded-full p-0.5 text-white/30 transition hover:text-red-400"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelected((current) => current.filter((verse) => verse.id !== item.id));
                      setVerseIndex(0);
                    }}
                  >
                    <X size={9} />
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="py-2 text-center text-[9px] text-white/25">
              Henüz ayet seçilmedi
            </p>
          )}
        </div>
      </section>
    </aside>
  );
};
