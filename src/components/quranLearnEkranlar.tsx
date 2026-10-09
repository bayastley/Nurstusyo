// ════════════════════════════════════════════════════════
// QURANLEARNEKRANLAR.TSX — QuranLearnModal'dan taşındı (SRP adım 10, 09.10 2. tur)
// ÖĞREN + DİNLE ekran JSX'leri. DAVRANIŞ BİREBİR AYNIDIR — tüm state/handler
//   modal'da kalır; burada saf görünümdür (props = ekranın kullandığı her şey).
//   tsc, eksik/yanlış prop'u derleme aşamasında yakalar (optional yok, hepsi şart).
// ════════════════════════════════════════════════════════

import React from "react";
import { Search, Loader2, RotateCcw, Play, Pause } from "lucide-react";
import { SURAHS_DATA, MEALS, RECITERS, TafsirBox } from "./quranLearnVeri";
import { getSurahHadith } from "../data/surahHadith";
import { getFeatureLock } from "../services/adminSyncService";

const tt = (k: string) => k;

interface AyahE { n: number; ar: string; tr: string; juz: number; page: number; }
interface WordE { i: number; ar: string; tr: string; translit: string; audio: string; }
interface AyahSonuc { s: number; sn: string; a: number; text: string; }
interface ListenAyahData { ar: string; tr: string; n: number; }

// ── ÖĞREN MODU EKRANI ────────────────────────────────────────
export interface OgrenProps {
  ttQL: (k: string) => string;
  query: string; setQuery: React.Dispatch<React.SetStateAction<string>>;
  searchOpen: boolean; setSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
  filteredSurahs: Array<{ n: number; name: string; ayahs: number; type: string; en: string }>;
  ayahResults: AyahSonuc[];
  searching: boolean;
  setAyahResults: React.Dispatch<React.SetStateAction<AyahSonuc[]>>;
  surahNo: number; setSurahNo: React.Dispatch<React.SetStateAction<number>>;
  surah: { n: number; name: string; ayahs: number; type: string };
  ayahNo: number; setAyahNo: React.Dispatch<React.SetStateAction<number>>;
  setActiveWord: React.Dispatch<React.SetStateAction<number | null>>;
  mealId: string; setMealId: React.Dispatch<React.SetStateAction<string>>;
  mealYenileniyor: boolean;
  reciter: string; setReciter: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean; error: string | null;
  ayah: AyahE | undefined;
  ayahs: AyahE[];
  words: WordE[];
  wordLoading: boolean;
  activeWord: number | null;
  clickWord: (i: number) => void;
  karsilastirmaAcik: boolean; setKarsilastirmaAcik: React.Dispatch<React.SetStateAction<boolean>>;
  karsiMealId: string; setKarsiMealId: React.Dispatch<React.SetStateAction<string>>;
  karsiMetin: string;
  prevAyahLearn: () => void;
  nextAyahLearn: () => void;
  isPlaying: boolean; paused: boolean;
  setPaused: React.Dispatch<React.SetStateAction<boolean>>;
  setFlowPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  playAyahAudio: (onEnded?: () => void) => void;
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  pauseAyah: () => void; resumeAyah: () => void;
  seekAyah: (delta: number) => void;
  replayAyah: () => void;
  stopAyahPlayback: () => void;
  playWordAudio: (i: number) => void;
  playAyahRef: React.MutableRefObject<(onEnded?: () => void) => void>;
  speed: number; setSpeed: React.Dispatch<React.SetStateAction<number>>;
  latinAcik: boolean; setLatinAcik: React.Dispatch<React.SetStateAction<boolean>>;
  mushafModu: boolean; setMushafModu: React.Dispatch<React.SetStateAction<boolean>>;
  translit: Record<number, string>;
  centerListRef: React.RefObject<HTMLDivElement | null>;
}

export function OgrenModu(p: OgrenProps) {
  const surah = p.surah;
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
          {/* Arama + seçim barı */}
          <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[#D7AA41]/20 bg-[#0d1a2c] px-4 py-2">
            <div className="relative min-w-48 flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#655f4c]" />
              <input
                value={p.query}
                onChange={(e) => { p.setQuery(e.target.value); p.setSearchOpen(true); }}
                onFocus={() => p.setSearchOpen(true)}
                onBlur={() => setTimeout(() => p.setSearchOpen(false), 150)}
                placeholder={p.ttQL("qrSureAra")}
                className="h-8 w-full rounded-xl border border-white/10 bg-[#1E293B] pl-8 pr-3 text-[11px] outline-none placeholder:text-[#5a5443] focus:border-gold/50"
              />
              {p.searchOpen && (p.filteredSurahs.length > 0 || p.ayahResults.length > 0 || p.searching) && (
                <div className="absolute left-0 right-0 top-full z-20 mt-1.5 max-h-80 overflow-y-auto rounded-xl border border-gold/30 bg-slate-900 p-1 shadow-2xl scrollbar-thin">
                  {p.filteredSurahs.length > 0 && (
                    <p className="px-2.5 pt-1.5 pb-1 text-[8px] font-black uppercase tracking-widest text-[#655f4c]">Sureler</p>
                  )}
                  {p.filteredSurahs.map(s => (
                    <button key={s.n} onClick={() => { p.setSurahNo(s.n); p.setQuery(""); p.setSearchOpen(false); p.setAyahResults([]); }} className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[11px] transition hover:bg-gold/10">
                      <span className="font-bold text-[#d8cfae]">{s.n}. {s.name} <span className="font-normal text-[#6e6853]">· {s.ayahs} ayet · {s.type}</span></span>
                      <span className="font-arabic text-sm text-gold-light">سورة {s.name}</span>
                    </button>
                  ))}
                  {(p.ayahResults.length > 0 || p.searching) && (
                    <p className="px-2.5 pt-2 pb-1 text-[8px] font-black uppercase tracking-widest text-[#655f4c]">{p.searching ? p.ttQL("qrAranuyor") : p.ttQL("qrKelimeler")}</p>
                  )}
                  {p.ayahResults.map((r, idx) => (
                    <button key={`${r.s}:${r.a}:${idx}`} onClick={() => { p.setSurahNo(r.s); p.setAyahNo(r.a); p.setActiveWord(null); p.setQuery(""); p.setSearchOpen(false); p.setAyahResults([]); }} className="flex w-full flex-col gap-0.5 rounded-lg px-2.5 py-1.5 text-left transition hover:bg-gold/10">
                      <span className="text-[10px] font-bold text-gold">{r.s}. {r.sn} — {r.a}. ayet</span>
                      <span className="line-clamp-2 text-[10px] text-white/55" dir="auto">{r.text}…</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <select value={p.surahNo} onChange={(e) => p.setSurahNo(Number(e.target.value))} className="h-8 max-w-44 rounded-xl border border-white/10 bg-[#1E293B] px-2 text-[11px] font-semibold outline-none focus:border-gold/50">
              {SURAHS_DATA.map(s => <option key={s.n} value={s.n}>{s.n}. {s.name}</option>)}
            </select>
            <select value={p.ayahNo} onChange={(e) => { p.setAyahNo(Number(e.target.value)); p.setActiveWord(null); }} className="h-8 max-w-36 rounded-xl border border-white/10 bg-[#1E293B] px-2 text-[11px] font-semibold outline-none focus:border-gold/50">
              {Array.from({ length: surah.ayahs }, (_, i) => <option key={i + 1} value={i + 1}>Ayet {i + 1}</option>)}
            </select>
            <select value={p.mealId} onChange={(e) => p.setMealId(e.target.value)} className="h-8 max-w-48 rounded-xl border border-white/10 bg-[#1E293B] px-2 text-[11px] font-semibold outline-none focus:border-gold/50">
              {MEALS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            {/* ★ MEAL GÜNCELLENİYOR çipi — meal/dil değişiminde eski metin ekranda kalırken göster */}
            {p.mealYenileniyor && (
              <span className="flex items-center gap-1 rounded-full border border-gold/30 bg-gold/10 px-2.5 py-1 text-[9px] font-bold text-gold" role="status">
                <Loader2 size={10} className="animate-spin" /> mealler güncelleniyor…
              </span>
            )}
            <select value={p.reciter} onChange={(e) => p.setReciter(e.target.value)} className="h-8 max-w-56 rounded-xl border border-white/10 bg-[#1E293B] px-2 text-[11px] font-semibold text-gold-light outline-none focus:border-gold/50">
              {RECITERS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>

          {/* 3 kolon */}
          <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
            {p.loading ? (
              <div className="flex flex-1 items-center justify-center gap-2 text-[12px] text-[#8f8870]"><Loader2 size={16} className="animate-spin" /> Ayetler yükleniyor…</div>
            ) : p.error ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
                <p className="text-[12px] text-red-400">{p.error}</p>
                <button onClick={() => p.setSurahNo(p.surahNo)} className="rounded-lg border border-gold/30 bg-gold/10 px-3 py-1.5 text-[10px] font-bold text-gold">Tekrar Dene</button>
              </div>
            ) : (
              <>
                {/* SOL: Ayetin Bütünü + Kelime Kartı + Meal — prototip düzeni */}
                <div className="flex w-full flex-col gap-4 overflow-y-auto border-white/10 p-4 lg:w-[28%] lg:border-r scrollbar-thin">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gold">{p.ttQL("qoMahrec")}</h3>
                  <div className="rounded-2xl border border-white/10 bg-[#161622] p-4 text-center">
                    <p className="mb-1 text-[8px] font-black uppercase tracking-widest text-[#6e6853]">{p.ttQL("qoButun")}</p>
                    <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1" dir="rtl">
                      {(p.words.length > 0 ? p.words.map(w => w.ar) : (p.ayah?.ar ?? "").split(/\s+/)).map((ar, i) => (
                        <button key={i} onClick={() => { if (p.words.length > 0) p.clickWord(Math.min(i, p.words.length - 1)); }} className={`rounded-md px-1 font-arabic text-base leading-loose transition-all active:scale-95 ${p.activeWord === i ? "scale-110 bg-[#D7AA41] font-black text-[#151020] shadow-[0_0_16px_rgba(245,221,166,.7)]" : "text-[#d8cfae] hover:bg-gold/15 hover:text-[#f5dda6]"}`}>{ar}</button>
                      ))}
                    </div>
                    <p className="mt-2 text-[8px] italic text-[#655f4c]">{p.ttQL("qoButunNot")}</p>
                  </div>

                  {/* Kelime Kartı — ★ KALDIRILDI: kelime anlamları 3 ayrı yerde gösteriliyordu,
                      artık SADECE sağdaki "Kelime Kelime Çözüm" listesinde (bire düşürüldü).
                      Tekrar oku → sağ listedeki 🔊 butonuyla aynı işi görüyor. */}

                  {/* Meal — ★ Karşılaştırmalı okuma (madde 55): iki meal yan yana */}
                  <div className="rounded-2xl border border-white/10 bg-[#1E293B] p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[#6e6853]">{p.ttQL("qoMeal")}</span>
                      <button onClick={() => p.setKarsilastirmaAcik(!p.karsilastirmaAcik)} className={`rounded-lg px-2 py-1 text-[8.5px] font-black transition ${p.karsilastirmaAcik ? "bg-[#D7AA41] text-[#151020]" : "bg-white/5 text-[#8f8870] hover:text-[#f5dda6]"}`} title={p.ttQL("qoKarsilastirTitle")}>
                        {p.ttQL("qoKarsilastir")}
                      </button>
                    </div>
                    {p.karsilastirmaAcik ? (
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        <div className="rounded-xl bg-white/[.04] p-2.5">
                          <p className="mb-1 text-[8px] font-black uppercase tracking-wider text-gold/70">{MEALS.find(m => m.id === p.mealId)?.name}</p>
                          <p className="text-[11px] leading-relaxed text-[#c5bc9a]">{p.ayah?.tr}</p>
                        </div>
                        <div className="rounded-xl bg-white/[.04] p-2.5">
                          <select value={p.karsiMealId} onChange={(e) => p.setKarsiMealId(e.target.value)} className="mb-1 w-full rounded-lg bg-[#0d1626] px-1.5 py-1 text-[8.5px] font-bold text-[#d8cfae] outline-none">
                            {MEALS.filter(m => m.id !== p.mealId).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                          </select>
                          <p className="text-[11px] leading-relaxed text-[#c5bc9a]" dir={p.karsiMealId.startsWith("tr") ? "ltr" : "auto"}>{p.karsiMetin || "…"}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2 text-[12px] leading-relaxed text-[#c5bc9a]">{p.ayah?.tr}</p>
                    )}
                    <span className="mt-2 block text-right text-[8px] font-bold text-[#5a5443]">{p.ttQL("qoKaynak").replace("{kaynak}", MEALS.find(m => m.id === p.mealId)?.name ?? "")}</span>
                  </div>

                  {/* ★ TEFSİR: İbn Kesîr (Türkçe çeviri; yüklenince görünür) */}
                  <TafsirBox surahNo={p.surahNo} ayahNo={p.ayahNo} />

                  {/* ★ SURE AYETLERİ LİSTESİ (soldaki) — ★ KALDIRILDI: ortadaki
                      "Suredeki Ayetler" listesiyle mükerrerdi. Ortadaki kalsın. */}
                </div>

                {/* ORTA: prototip düzeni — ayet kartı (içinde kontroller) + kelime analizi */}
                <div data-ayah-scroll className="flex w-full flex-col items-center gap-4 overflow-y-auto border-white/10 p-4 lg:w-[47%] lg:border-r scrollbar-thin">
                  <p className="self-start text-[8px] font-black uppercase tracking-widest text-[#655f4c]">{p.ttQL("qoKelimeSecim")}</p>
                  <div className="w-full rounded-3xl border border-white/10 bg-[#131322] p-4">
                    <div className="flex items-start justify-between gap-2">
                      <span className="w-20 shrink-0" />
                      <div className="text-center">
                        <h4 className="font-arabic text-sm text-[#f5dda6]">سُورَةُ {surah.name}</h4>
                        <p className="mt-0.5 font-mono text-[10px] text-[#7a745f]">{p.ttQL("qoAyetBilgi").replace("{n}", String(surah.n)).replace("{ad}", surah.name).replace("{a}", String(p.ayahNo)).replace("{tip}", surah.type).replace("{juz}", String(p.ayah?.juz ?? "")).replace("{sayfa}", String(p.ayah?.page ?? ""))}</p>
                      </div>
                      <div className="w-20 shrink-0 text-right">
                        <p className="text-[9px] font-black tracking-widest text-gold">NURSTUDYO</p>
                        <p className="text-[8px] text-[#7a745f]">{surah.name} suresi</p>
                      </div>
                    </div>
                    {/* Kelimeler */}
                    <div className="mt-3 w-full rounded-xl border border-white/10 bg-black/20 p-3">
                      {p.wordLoading ? (
                        <div className="flex items-center justify-center gap-2 py-4"><Loader2 size={18} className="animate-spin text-[#D7AA41]" /> <span className="text-[11px] text-[#7a745f]">{p.ttQL("qoKelimelerYukleniyor")}</span></div>
                      ) : p.words.length > 0 ? (
                        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2" dir="rtl">
                          {p.words.map((w) => (
                            <button
                              key={w.i}
                              onClick={() => p.clickWord(w.i)}
                              className={`rounded-lg px-2 py-1 font-arabic text-xl leading-relaxed transition-all active:scale-95 ${p.activeWord === w.i ? "scale-110 rounded-lg bg-[#D7AA41] font-black text-[#151020] shadow-[0_0_34px_rgba(245,221,166,.8)] ring-2 ring-[#f5dda6]" : "text-[#e8dfc0] hover:bg-gold/20 hover:text-[#f5dda6] hover:shadow-[0_0_14px_rgba(215,170,82,.35)]"}`}
                            >
                              {w.ar}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="py-4 text-center font-arabic text-xl leading-relaxed text-[#e8dfc0]" dir="rtl">{p.ayah?.ar}</p>
                      )}
                    </div>

                    {/* ★ KONTROLLER — sol ok · DONDUR/BAŞLAT · sağ ok (prototip düzeni) */}
                    <div className="mt-3 flex w-full flex-wrap items-center justify-center gap-2">
                      {/* ★ SOL OK — önceki ayete gider, tıklayınca hemen okur */}
                      <button onClick={p.prevAyahLearn} disabled={p.ayahNo <= 1} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1E293B] text-[15px] font-black text-[#f5dda6] ring-1 ring-white/10 transition hover:bg-[#243449] active:scale-90 disabled:opacity-30" title={p.ttQL("qoOncekiAyet")}>
                        ◀
                      </button>
                      {/* ★ ORTADA BÜYÜK DONDUR/BAŞLAT düğmesi */}
                      {(() => {
                        const audio = p.audioRef.current;
                        const showPause = p.isPlaying && !p.paused;
                        return (
                          <button
                            onClick={() => { if (showPause) p.pauseAyah(); else if (p.paused) p.resumeAyah(); else { p.setPaused(false); p.setFlowPlaying(true); p.playAyahAudio(); } }}
                            className={`flex h-14 w-14 items-center justify-center rounded-full text-[20px] font-black transition active:scale-90 ${showPause ? "bg-[#D7AA41] text-[#151020] shadow-[0_0_18px_rgba(215,170,82,.45)] hover:brightness-110" : "bg-[#D7AA41] text-[#151020] shadow-[0_0_18px_rgba(215,170,82,.45)] ring-2 ring-[#f5dda6]/70 hover:brightness-110"}`}
                            title={showPause ? p.ttQL("qoDondur") : p.paused ? p.ttQL("qoDevam") : p.ttQL("qoBaslat")}
                          >
                            {showPause ? "⏸" : "▶"}
                          </button>
                        );
                      })()}
                      {/* ★ SAĞ OK — sonraki ayete gider, tıklayınca hemen okur */}
                      <button onClick={p.nextAyahLearn} disabled={p.ayahNo >= surah.ayahs} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1E293B] text-[15px] font-black text-[#f5dda6] ring-1 ring-white/10 transition hover:bg-[#243449] active:scale-90 disabled:opacity-30" title={p.ttQL("qoSonrakiAyet")}>
                        ▶
                      </button>
                      {/* ★ 5 SN SARMA */}
                      <button onClick={() => p.seekAyah(-5)} disabled={!p.isPlaying} className="rounded-lg bg-[#1E293B] px-2 py-1.5 text-[9px] font-bold text-[#cfc6a4] ring-1 ring-white/10 transition hover:bg-[#243449] active:scale-95 disabled:opacity-40" title={p.ttQL("qoGeriSar")}>
                        ⏪5sn
                      </button>
                      <button onClick={() => p.seekAyah(5)} disabled={!p.isPlaying} className="rounded-lg bg-[#1E293B] px-2 py-1.5 text-[9px] font-bold text-[#cfc6a4] ring-1 ring-white/10 transition hover:bg-[#243449] active:scale-95 disabled:opacity-40" title={p.ttQL("qoIleriSar")}>
                        5sn⏩
                      </button>
                      <button onClick={p.replayAyah} className="flex items-center gap-1.5 rounded-lg bg-[#1E293B] px-2.5 py-1.5 text-[9px] font-bold text-[#cfc6a4] ring-1 ring-white/10 transition hover:bg-[#243449] active:scale-95">
                        <RotateCcw size={10} /> {p.ttQL("qoTekrar")}
                      </button>
                      <button onClick={p.stopAyahPlayback} className="rounded-lg bg-[#1E293B] px-2.5 py-1.5 text-[9px] font-bold text-[#cfc6a4] ring-1 ring-white/10 transition hover:bg-[#243449] active:scale-95">
                        {p.ttQL("qoSifirla")}
                      </button>
                      <div className="ml-1 flex items-center gap-0.5 rounded-lg bg-black/30 p-0.5 text-[9px] font-bold">
                        {[0.8, 1, 1.2].map(v => (
                          <button key={v} onClick={() => p.setSpeed(v)} className={`rounded px-2 py-0.5 transition ${p.speed === v ? "bg-[#D7AA41] text-[#151020]" : "text-[#8f8870] hover:text-[#f5dda6]"}`}>{v}x</button>
                        ))}
                      </div>
                      {/* ★ LATİN OKUNUŞ düğmesi (madde 43) — Arapça bilmeyenler için */}
                      <button onClick={() => p.setLatinAcik(!p.latinAcik)} className={`ml-1 rounded-lg px-2 py-1.5 text-[9px] font-black transition ${p.latinAcik ? "bg-[#D7AA41] text-[#151020]" : "bg-[#1E293B] text-[#cfc6a4] ring-1 ring-white/10 hover:bg-[#243449]"}`} title={p.ttQL("qoLatinTitle")}>
                        {p.ttQL("qoLatin")}
                      </button>
                      {/* ★ MUSHAF GÖRÜNÜMÜ (madde 29) — satırlı liste ↔ gerçek mushaf sayfası akışı */}
                      <button onClick={() => p.setMushafModu(!p.mushafModu)} className={`ml-1 rounded-lg px-2 py-1.5 text-[9px] font-black transition ${p.mushafModu ? "bg-[#D7AA41] text-[#151020]" : "bg-[#1E293B] text-[#cfc6a4] ring-1 ring-white/10 hover:bg-[#243449]"}`} title={p.ttQL("qoMushafTitle")}>
                        {p.ttQL("qoMushaf")}
                      </button>
                    </div>
                    {/* Hoca seçici — kontrollerin altında, prototipteki gibi */}
                    <div className="mt-3 flex w-full justify-center">
                      <select value={p.reciter} onChange={(e) => p.setReciter(e.target.value)} className="h-7 max-w-44 rounded-lg border border-white/10 bg-[#1E293B] px-2 text-[10px] font-bold text-[#d8cfae] outline-none focus:border-[#D7AA41]/60">
                        {RECITERS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* ★ KELİME ANALİZ PANELİ — ★ KALDIRILDI: kelime anlamı artık SADECE
                      sağdaki "Kelime Kelime Çözüm" listesinde (3 panel → 1 panel) */}

                  {/* ★ SURENİN TAMAMI — ~7 ayet görünür, okunan yanar, akışla kayar, tıklayınca o ayet okunur */}
                  <div className={`w-full rounded-2xl border border-white/10 p-3 ${p.mushafModu ? "bg-[#F5EDD8]" : "bg-[#161622]"}`}>
                    <p className={`mb-2 text-center text-[9px] font-bold uppercase tracking-widest ${p.mushafModu ? "text-[#8a7440]" : "text-[#6e6853]"}`}>
                      {p.mushafModu ? p.ttQL("qoMushafMod") : p.ttQL("qoSuredekiAyetler")}
                    </p>
                    {p.mushafModu ? (
                      /* ★ MUSHAF SAYFASI — ayetler tek blok, sonraki ayete doğal akış; tıklanan ayet yanar */
                      <div ref={p.centerListRef} className="max-h-[340px] overflow-y-auto rounded-xl bg-[#F5EDD8] px-4 py-3 scrollbar-thin shadow-inner" style={{ backgroundImage: "linear-gradient(rgba(138,116,64,.06) 1px, transparent 1px)", backgroundSize: "100% 2.4rem" }}>
                        {/* ★ 04.10: U+FDFD ligatürü Google Translate'te "Bismillahirrahmanirrahim" oluyordu — sabit Arapça yazım + notranslate */}
                        <p className="notranslate mb-2 text-center font-arabic text-base font-bold text-[#8a7440]" translate="no" dir="rtl">﴿بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ﴾</p>
                        <p className="text-right font-arabic text-[17px] leading-[2.4] text-[#2c2416]" dir="rtl">
                          {p.ayahs.map(a => (
                            <span
                              key={a.n}
                              data-current={a.n === p.ayahNo || undefined}
                              onClick={() => { p.setFlowPlaying(false); p.setAyahNo(a.n); p.setActiveWord(null); setTimeout(() => p.playAyahRef.current(), 350); }}
                              className={`cursor-pointer transition ${a.n === p.ayahNo ? "rounded bg-[#D7AA41]/25 text-[#8a5a10] shadow-[0_0_10px_rgba(215,170,65,.4)]" : "hover:bg-[#D7AA41]/10"}`}
                            >
                              {a.ar}
                              <span className="mx-1.5 inline-flex h-5 w-5 translate-y-0.5 items-center justify-center rounded-full border border-[#b08d3e] align-middle text-[9px] font-black text-[#8a5a10]" dir="ltr">{a.n}</span>
                              {" "}
                            </span>
                          ))}
                        </p>
                        {p.latinAcik && (
                          <p className="mt-2 border-t border-[#d8c69a] pt-2 text-center text-[9px] italic text-[#8a7440]" dir="ltr">
                            {p.ttQL("qoMushafLatinGizli")}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div ref={p.centerListRef} className="flex max-h-[300px] flex-col gap-1.5 overflow-y-auto scrollbar-thin">
                        {p.ayahs.map(a => (
                          <React.Fragment key={a.n}>
                          <button data-current={a.n === p.ayahNo || undefined} onClick={() => { p.setFlowPlaying(false); p.setAyahNo(a.n); p.setActiveWord(null); setTimeout(() => p.playAyahRef.current(), 350); }} className={`flex items-center gap-3 rounded-xl px-3 py-2 text-right transition ${a.n === p.ayahNo ? "bg-[#3D342B] ring-1 ring-[#D7AA41]/60 shadow-[0_0_14px_rgba(215,170,82,.25)]" : "hover:bg-white/[.04]"}`}>
                            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${a.n === p.ayahNo ? "bg-[#D7AA41] text-[#151020]" : "bg-white/10 text-[#8f8870]"}`} dir="ltr">{a.n}</span>
                            <span className={`flex-1 truncate font-arabic text-sm leading-relaxed ${a.n === p.ayahNo ? "text-[#f5dda6]" : "text-[#b8b093]"}`} dir="rtl">{a.ar}</span>
                          </button>
                          {p.latinAcik && p.translit[a.n] && (
                            <p className="-mt-1 px-3 pb-1.5 pl-12 text-left text-[9px] italic leading-relaxed text-[#9a927a]" dir="ltr">{p.translit[a.n]}</p>
                          )}
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* SAĞ: kelime tablosu */}
                <div className="flex w-full flex-col overflow-y-auto p-4 lg:w-[25%] scrollbar-thin">
                  <h3 className="mb-2 text-[10px] font-black uppercase tracking-widest text-gold">{p.ttQL("qoKelimeKelime")}</h3>
                  <div className="overflow-hidden rounded-xl border border-white/10 bg-[#161622]">
                    {p.wordLoading ? (
                      <div className="flex items-center justify-center gap-2 p-4 text-[11px] text-[#7a745f]"><Loader2 size={13} className="animate-spin" /> kelimeler…</div>
                    ) : p.words.map((w, i) => (
                      <div key={w.i} className={`flex w-full items-center justify-between gap-2 border-b border-white/5 px-3 py-2 transition last:border-0 ${p.activeWord === i ? "bg-[#3D342B] ring-1 ring-inset ring-[#D7AA41]/60" : "hover:bg-white/[.04]"}`}>
                        <button onClick={() => p.clickWord(i)} className="flex flex-1 items-center gap-2 text-left min-w-0">
                          <span className={`w-5 text-[9px] font-black ${p.activeWord === i ? "text-[#f5dda6]" : "text-[#655f4c]"}`}>{i + 1}</span>
                          <span className={`flex-1 truncate text-[10px] font-bold ${p.activeWord === i ? "text-[#f5dda6]" : "text-[#c5bc9a]"}`}>{w.tr}</span>
                          <span className="font-arabic text-lg text-[#f5dda6]">{w.ar}</span>
                        </button>
                        {/* ★ TEKRAR OKU (🔊): kelimeyi TEKRAR TEKRAR okumak için ayrı buton —
                            tıklayınca sadece o kelime çalar (kelime anlamlarının yanına küçük buton) */}
                        <button
                          onClick={(e) => { e.stopPropagation(); p.setActiveWord(i); p.playWordAudio(i); }}
                          className="shrink-0 rounded-md bg-gold/15 px-1.5 py-1 text-[10px] text-[#f5dda6] transition hover:bg-gold/30 active:scale-90"
                          title={p.ttQL("qoKelimeOku")}
                        >🔊</button>
                      </div>
                    ))}
                  </div>
                  {/* Kaynak referansı */}
                  <div className="mt-3 rounded-2xl border border-white/10 bg-[#161622] p-3 text-center">
                    <p className="text-[8px] font-black uppercase tracking-widest text-gold">{p.ttQL("qoResmiKaynak")}</p>
                    <p className="mt-1 text-[9px] font-bold text-[#b8b093]">{p.ttQL("qoResmiAd")}</p>
                    <p className="mt-0.5 text-[8px] text-[#6e6853]">{p.ttQL("qoResmiDetay")}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
  );
}

// ── DİNLE MODU EKRANI ────────────────────────────────────────
export interface DinleProps {
  ttQL: (k: string) => string;
  listenSurah: number; setListenSurah: React.Dispatch<React.SetStateAction<number>>;
  listenSurahInfo: { n: number; name: string; ayahs: number };
  listenAyahIdx: number; setListenAyahIdx: React.Dispatch<React.SetStateAction<number>>;
  isPlaying: boolean;
  listenAyahData: ListenAyahData | null;
  besmelePlaying: boolean;
  fullSurahMode: boolean;
  wholeQuran: boolean; setWholeQuran: React.Dispatch<React.SetStateAction<boolean>>;
  nextSurahAuto: boolean;
  karisikHoca: boolean; setKarisikHoca: React.Dispatch<React.SetStateAction<boolean>>;
  setFullSurahMode: React.Dispatch<React.SetStateAction<boolean>>;
  setKabeLive: (v: boolean) => void;
  stopListening: () => void;
  startListening: (fromIdx?: number) => void;
  ekransizMod: boolean; setEkransizMod: React.Dispatch<React.SetStateAction<boolean>>;
  uykuTimer: number | null; uykuKalan: number | null;
  uykuMenu: boolean; setUykuMenu: React.Dispatch<React.SetStateAction<boolean>>;
  kurUykuZamanlayici: (dakika: number | null) => void;
  reciterSearch: string; setReciterSearch: React.Dispatch<React.SetStateAction<string>>;
  filteredReciters: Array<{ id: string; name: string; full?: string[] }>;
  reciter: string;
  setListenReciter: React.Dispatch<React.SetStateAction<string>>;
  besmeleCalindiRef: React.MutableRefObject<number>;
  listenWordProgress: number;
  listenScrollRef: React.RefObject<HTMLDivElement | null>;
  speed: number; setSpeed: React.Dispatch<React.SetStateAction<number>>;
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  loopAyahListen: boolean; setLoopAyahListen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function DinleModu(p: DinleProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 overflow-y-auto p-4 scrollbar-thin">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#161622] p-4 sm:p-7 shadow-2xl mx-2">
            <span className="text-[9px] font-bold uppercase tracking-widest text-gold">{p.ttQL("qoKesintisiz")}</span>
            {/* ★ SAHİH HADİS: seçili sureyle ilgili Buhârî/Müslim kaynaklı hadis */}
            {(() => {
              const h = getSurahHadith(p.listenSurah);
              if (!h) return null;
              return (
                <div className="mt-3 rounded-xl border border-gold/25 bg-[#14110a] p-3">
                  <p className="text-[10px] font-black text-[#f5dda6]">📖 {h.title}</p>
                  <p className="mt-1 text-[10px] leading-relaxed text-[#b8b093]" dir="auto">{h.desc}</p>
                  <p className="mt-1.5 text-[8px] font-bold uppercase tracking-widest text-gold/60">{p.ttQL("qoHadisKaynak").replace("{kaynak}", h.source)}</p>
                </div>
              );
            })()}
            {/* ★ DİNLEME KAPSAMI */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button onClick={() => { p.setWholeQuran(false); p.stopListening(); p.setFullSurahMode(false); }} className={`rounded-xl border px-3 py-1.5 text-[10px] font-black transition ${!p.wholeQuran && !p.nextSurahAuto ? "border-gold/40 bg-gold/15 text-gold" : "border-white/10 bg-white/[.04] text-[#8f8870]"}`} title="">{p.ttQL("qoTekSure")}</button>
              <button onClick={() => { p.setWholeQuran(false); p.stopListening(); p.setFullSurahMode(false); }} className={`rounded-xl border px-3 py-1.5 text-[10px] font-black transition ${!p.wholeQuran && p.nextSurahAuto ? "border-emerald-900/30 bg-emerald-950/40 text-emerald-400" : "border-white/10 bg-white/[.04] text-[#8f8870]"}`} title={p.ttQL("qoSiradakiTitle")}>{p.ttQL("qoSiradakiSure")}</button>
              <button onClick={() => { p.setWholeQuran(true); p.stopListening(); p.setFullSurahMode(false); }} className={`rounded-xl border px-3 py-1.5 text-[10px] font-black transition ${p.wholeQuran ? "border-emerald-900/30 bg-emerald-950/40 text-emerald-400" : "border-white/10 bg-white/[.04] text-[#8f8870]"}`} title={p.ttQL("qoKompleTitle")}>{p.ttQL("qoKompleKuran")}</button>
              {/* ★ ÇOKLU HOCA KARIŞIK (madde 65) — komple Kur'an modunda her sure farklı hoca */}
              <button onClick={() => { p.setKarisikHoca(v => !v); p.stopListening(); }} className={`rounded-xl border px-3 py-1.5 text-[10px] font-black transition ${p.karisikHoca ? "border-sky-500/40 bg-sky-950/40 text-sky-300" : "border-white/10 bg-white/[.04] text-[#8f8870]"}`} title={p.ttQL("qoKarısıkTitle")}>{p.ttQL("qoKarısıkHoca")}</button>
              {/* ★ TAM SURE: tek dosya gapless sure kaydı (mp3quran.net) — kesintisiz sure dinleme */}
              <button onClick={() => { p.setFullSurahMode(v => !v); p.setWholeQuran(false); p.stopListening(); }} className={`rounded-xl border px-3 py-1.5 text-[10px] font-black transition ${p.fullSurahMode ? "border-gold/40 bg-gold/15 text-gold" : "border-white/10 bg-white/[.04] text-[#8f8870]"}`} title={p.ttQL("qoTamSureTitle")}>{p.ttQL("qoTamSure")}</button>
              {/* ★ KÂBE CANLI: Mescid-i Haram 7/24 canlı yayın (YouTube embed) */}
              <button onClick={() => p.setKabeLive(true)} className="rounded-xl border border-emerald-900/30 bg-emerald-950/40 px-3 py-1.5 text-[10px] font-black text-emerald-300 transition hover:brightness-125" title={p.ttQL("qoKabeTitle")}>{p.ttQL("qoKabeCanli")}</button>
              {/* ★ EKRANSIZ MEAL DİNLEME: ekran kararır, sadece ses; kilit ekranı kontrolleri aktif */}
              <button onClick={() => { p.setEkransizMod(v => !v); }} className={`rounded-xl border px-3 py-1.5 text-[10px] font-black transition ${p.ekransizMod ? "border-indigo-400/40 bg-indigo-500/15 text-indigo-300" : "border-white/10 bg-white/[.04] text-[#8f8870]"}`} title={p.ttQL("qoEkransizTitle")}>{p.ttQL("qoEkransiz")}</button>
              {/* ★ UYKU TİLAVETİ: seçilen süre sonunda ses kendiliğinden durur */}
              <button onClick={() => p.setUykuMenu(v => !v)} className={`rounded-xl border px-3 py-1.5 text-[10px] font-black transition ${p.uykuTimer ? "border-indigo-400/40 bg-indigo-500/15 text-indigo-300" : "border-white/10 bg-white/[.04] text-[#8f8870]"}`} title={p.ttQL("qoUykuTitle")}>{p.ttQL("qoUyku")}{p.uykuKalan !== null ? ` · ${Math.floor(p.uykuKalan / 60)}:${String(p.uykuKalan % 60).padStart(2, "0")}` : ""}</button>
              {p.uykuMenu && (
                <div className="mt-1 flex flex-wrap items-center gap-1.5 rounded-xl border border-indigo-400/20 bg-indigo-950/30 p-2">
                  <span className="text-[9px] font-bold text-white/50">{p.ttQL("qoSureDolunca")}</span>
                  {[15, 30, 45, 60, 90, 120].map((dk) => (
                    <button key={dk} onClick={() => p.kurUykuZamanlayici(dk)} className="rounded-lg bg-white/10 px-2.5 py-1 text-[9px] font-black text-indigo-200 transition hover:bg-indigo-500/30">{dk} dk</button>
                  ))}
                  {p.uykuTimer !== null && (
                    <button onClick={() => p.kurUykuZamanlayici(null)} className="rounded-lg bg-red-500/20 px-2.5 py-1 text-[9px] font-black text-red-300 transition hover:bg-red-500/30">{p.ttQL("qoIptal")}</button>
                  )}
                </div>
              )}
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-[9px] font-bold uppercase text-[#7a745f]">{p.ttQL("qoSureEtiket")}</span>
                {/* ★ Sure değişimi: ayet konumu ve besmele hakkı SIFIRLANIR — eskiden
                    listenAyahIdx eski sureden kalıyordu, play'e basınca besmelesiz
                    2-3. ayetten başlıyordu (canlı testte kanıtlandı) */}
                <span className="flex gap-1.5">
                  <select value={p.listenSurah} onChange={(e) => { p.setListenSurah(Number(e.target.value)); p.setListenAyahIdx(0); p.besmeleCalindiRef.current = 0; p.stopListening(); }} className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#1E293B] px-3 py-2.5 text-[12px] font-semibold outline-none focus:border-gold/50">
                    {SURAHS_DATA.map(s => <option key={s.n} value={s.n}>{s.n}. {s.name} ({s.ayahs} ayet)</option>)}
                  </select>
                  {/* ★ BAŞINDAN BAŞLA (29.09, kullanıcı isteği): besmele hakkını sıfırla →
                      kullanıcı isterse TEKRAR besmeleyle başlasın. */}
                  <button
                    type="button"
                    onClick={() => { p.setListenAyahIdx(0); p.besmeleCalindiRef.current = 0; p.stopListening(); }}
                    className="shrink-0 rounded-xl border border-gold/40 bg-gold/10 px-2.5 py-2.5 text-[10px] font-black text-gold transition hover:bg-gold/20 active:scale-95"
                    title={p.ttQL("qoBasindanTitle").replace("{ad}", SURAHS_DATA.find(s => s.n === p.listenSurah)?.name ?? "")}
                  >
                    {p.ttQL("qoBasindan")}
                  </button>
                </span>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[9px] font-bold uppercase text-[#7a745f]">{p.ttQL("qoOkuyanHoca").replace("{sayi}", p.reciterSearch.trim() ? `${p.filteredReciters.length} ✓` : String(RECITERS.length))}</span>
                <input
                  value={p.reciterSearch}
                  onChange={(e) => p.setReciterSearch(e.target.value)}
                  placeholder={p.ttQL("qoHocaAra")}
                  className="h-8 w-full rounded-xl border border-white/10 bg-[#1E293B] px-3 text-[11px] outline-none placeholder:text-[#5a5443] focus:border-gold/50"
                />
                <div className="h-44 overflow-y-auto rounded-xl border border-white/10 bg-[#1E293B] scrollbar-thin">
                  {p.filteredReciters.length === 0 ? (
                    <p className="p-3 text-center text-[10px] text-[#6e6853]">{p.ttQL("qoHocaBulunamadi")}</p>
                  ) : p.filteredReciters.map(r => {
                    // ★ KİLİT: admin panelinden konan hoca kilidi — full[0] alanı kısa id'yi taşır.
                    const kisaId = r.full?.[0] ?? r.id;
                    const lock = getFeatureLock(kisaId, "free") || getFeatureLock(r.id, "free");
                    const locked = lock === "maintenance" || lock === "off" || lock === "v2" || lock === "v3";
                    const lockLabel = lock === "maintenance" || lock === "off" ? "🔧 BAKIMDA" : locked ? "🔒 GÜNCELLEME" : "";
                    return (
                    <button key={r.id} disabled={locked} onClick={() => { if (locked) return; p.setListenReciter(r.id); p.besmeleCalindiRef.current = 0; p.stopListening(); }} className={`flex w-full items-center justify-between gap-2 border-b border-white/5 px-3 py-2 text-left text-[11px] transition last:border-0 ${locked ? "cursor-not-allowed opacity-45" : p.reciter === r.id ? "bg-gold/15 text-gold hover:bg-white/[.05]" : "text-[#b8b093] hover:bg-white/[.05]"}`} title={locked ? "Bu kâri şu anda bakımda / güncellemede — kısa süre içinde dönecek" : undefined}>
                      <span className="truncate font-semibold">{r.name}{locked && <span className="ml-1.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[8px] font-black text-white/70">{lockLabel}</span>}</span>
                      {p.reciter === r.id && !locked && <span className="text-[9px] font-black">✓ SEÇİLİ</span>}
                    </button>
                    );
                  })}
                </div>
              </label>
            </div>

            {/* ★ OKUNAN AYET EKRANI — arkasında yıldız takımyıldızı şablonu (R2) */}
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
                {p.isPlaying && p.listenAyahData ? (
                  <>
                    <span className="text-[9px] font-black uppercase tracking-widest text-gold/70">♪ {p.ttQL("qrCaluyor")} — {p.besmelePlaying ? p.ttQL("qrBesmele") : p.fullSurahMode ? p.ttQL("qoTamSure") : p.wholeQuran ? p.ttQL("qoKompleKuran") : p.nextSurahAuto ? p.ttQL("qoSiradakiSure") : p.ttQL("qoTekSure")} · {p.besmelePlaying ? p.ttQL("qrSureBaslangici") : `${p.listenAyahData.n}. ${p.ttQL("qrAyet")}`}</span>
                    {/* ★ MOBİL KAYDIRMA: hayalet oklar ARAPÇA + MEAL birlikte kaydırılır */}
                    <div className="group relative w-full">
                      <div ref={p.listenScrollRef} className="listen-ayah-scroll max-h-[46vh] overflow-y-auto scroll-smooth px-1 scrollbar-thin">
                        <div className="flex w-full flex-wrap items-center justify-center gap-x-2 gap-y-1" dir="rtl">
                          {p.listenAyahData.ar.split(/\s+/).filter(Boolean).map((wd, i) => (
                            <span key={i} className={`rounded px-1 font-arabic text-xl leading-loose transition-all duration-200 ${i === p.listenWordProgress ? "scale-110 bg-[#D7AA41] font-black text-[#151020] shadow-[0_0_16px_rgba(245,221,166,.8)] ring-2 ring-[#f5dda6]" : i < p.listenWordProgress ? "text-[#f5dda6]/60" : "text-[#e8dfc0]"}`}>{wd}</span>
                          ))}
                        </div>
                        <p className="mt-1 max-w-xl text-[11px] italic leading-relaxed text-[#c9c0a0]" dir="auto">“{p.listenAyahData.tr}”</p>
                      </div>
                      {/* Hayalet oklar: yukarı — besmelede gerek yok ama zararsız */}
                      {!p.besmelePlaying && (
                      <button
                        type="button"
                        onClick={() => p.listenScrollRef.current?.scrollBy({ top: -120, behavior: "smooth" })}
                        className="pointer-events-auto absolute left-1/2 top-0 -translate-x-1/2 rounded-full bg-[#0d0b16]/60 p-1.5 text-gold/80 opacity-0 shadow transition group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 max-md:opacity-70"
                        title="Metni yukarı kaydır"
                      >▲</button>
                      )}
                      {/* Hayalet oklar: aşağı */}
                      {!p.besmelePlaying && (
                      <button
                        type="button"
                        onClick={() => p.listenScrollRef.current?.scrollBy({ top: 120, behavior: "smooth" })}
                        className="pointer-events-auto absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-[#0d0b16]/60 p-1.5 text-gold/80 opacity-0 shadow transition group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 max-md:opacity-70"
                        title="Metni aşağı kaydır"
                      >▼</button>
                      )}
                    </div>
                  </>
                ) : p.isPlaying ? (
                  <div className="flex items-center gap-2 py-4"><Loader2 size={14} className="animate-spin text-gold" /> <span className="text-[11px] text-[#b8b093]">{p.ttQL("qoKelimelerYukleniyor")}</span></div>
                ) : (
                  <p className="text-[11px] text-[#8f8870]">{p.ttQL("qrBaslatIpucu")}</p>
                )}
              </div>
            </div>

            {/* Kontroller */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-[#1E293B] p-0.5 text-[9px] font-bold">
                {[0.75, 1, 1.25, 1.5].map(v => (
                  <button key={v} onClick={() => { p.setSpeed(v); if (p.audioRef.current) p.audioRef.current.playbackRate = v; }} className={`rounded px-2 py-0.5 transition ${p.speed === v ? "bg-gold text-slate-950" : "text-[#8f8870] hover:text-[#f5dda6]"}`}>{v}x</button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => p.startListening(Math.max(0, p.listenAyahIdx - 1))} className="rounded-full bg-white/[.06] p-2.5 text-[#b8b093] transition hover:bg-white/10 active:scale-95" title={p.ttQL("qoOncekiAyet")}>⏮</button>
                {p.isPlaying ? (
                  <button onClick={p.stopListening} className="rounded-full bg-gold p-4 text-slate-950 shadow-lg shadow-gold/20 transition hover:brightness-110 active:scale-90"><Pause size={22} /></button>
                ) : (
                  <button onClick={() => p.startListening(p.listenAyahIdx)} className="rounded-full bg-gold p-4 text-slate-950 shadow-lg shadow-gold/20 transition hover:brightness-110 active:scale-90"><Play size={22} /></button>
                )}
                <button onClick={() => p.startListening(Math.min(p.listenSurahInfo.ayahs - 1, p.listenAyahIdx + 1))} className="rounded-full bg-white/[.06] p-2.5 text-[#b8b093] transition hover:bg-white/10 active:scale-95" title={p.ttQL("qoSonrakiAyet")}>⏭</button>
              </div>
              <button onClick={() => p.setLoopAyahListen(v => !v)} className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[9px] font-black transition ${p.loopAyahListen ? "border-emerald-900/30 bg-emerald-950/40 text-emerald-400" : "border-white/10 bg-white/[.04] text-[#7a745f]"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${p.loopAyahListen ? "animate-pulse bg-emerald-400" : "bg-white/30"}`} />
                {p.ttQL("qrAyetDongusu")} {p.loopAyahListen ? p.ttQL("qrAcik") : p.ttQL("qrKapali")}
              </button>
            </div>
            <p className="mt-3 text-center text-[8px] font-bold uppercase tracking-widest text-[#5a5443]">{p.ttQL("qrKariBilgi").replace("{n}", String(RECITERS.length))}</p>
          </div>
        </div>
  );
}
