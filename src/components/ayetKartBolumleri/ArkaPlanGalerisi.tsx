// ════════════════════════════════════════════════════════
// AYETKARTBOLUMLERI.TSX — AyetKartlariModal'dan ayrıldı (SRP, 01.10)
// Üç self-contained bölüm: SOL ayet seçimi · SAĞ kart önizleme+ayarlar ·
// altta arka plan galerisi. JSX birebir korunur; state modal'da kalır,
// bölümler saf görünüm + callback alır.
// ════════════════════════════════════════════════════════

import React, { useState } from "react";
// ★ 26.10 I18N KÖPRÜSÜ: oturumun dilini her çağrıda okur
const ttX2610 = (k: string): string => translate(typeof localStorage !== "undefined" ? (localStorage.getItem("nur_lang") || "tr") : "tr", k);
import { Brain, Check, Download, Heart, Search, Sparkles, Image as ImageIcon, Moon, Type, Wand2, ArrowUpDown, AlignLeft, AlignCenter, AlignRight, ChevronsDown, Upload, Shuffle, Palette, PenLine, Sparkles as IsiltiIcon } from "lucide-react";
import { AYET_MOODS, SURE_ADLARI, type AyetKarti } from "../../data/ayetKartlariData";
import { ayetBasligi } from "../../data/ayetBaslikCokDil"; // ★ 06.10: 575 başlık × 4 dil — liste + günün ayeti başlığı dilli
import { RUH_HALLERI, ruhSayacOku, ruhSayacArttir, cipSirasi, ruhHaliAd, type RuhSayac } from "../../data/ruhHalleri";
import { translate, type Lang } from "../../i18n";
import { BACKGROUNDS, catLabel, BG_CATS, MOOD_COLORS, type BgItem, type KartAyarlari, VARSAYILAN_AYARLAR } from "../ayetKartMotoru";
import { CubukRenkSecici, CerceveDuzRenkleri } from "../renkCubuguSecici";
import { HatFontuSeridi } from "../hatFontuSeridi";
import { cubukRengi, hexToHue } from "../../studio/mesajKatmani";
// ★ 04.10 TUR 6: title/tooltip kalıntıları LS bazlı tt (translate yukarıda importlu)
const ttLS = (k: string): string => translate(localStorage.getItem("nur_lang"), k);

// ─── SOL: AYET SEÇİMİ ──────────────────────────────────────

export const ArkaPlanGalerisi: React.FC<{
  bgSearch: string;
  setBgSearch: (v: string) => void;
  bgCat: string;
  setBgCat: (v: string) => void;
  filteredBgs: BgItem[];
  visibleCount: number;
  bgId: string;
  setBgId: (id: string) => void;
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
  akilliSec: () => void;
  shuffleBg: () => void;
  lang?: Lang;
}> = ({ bgSearch, setBgSearch, bgCat, setBgCat, filteredBgs, visibleCount, bgId, setBgId, loadMoreRef, akilliSec, shuffleBg, lang = "tr" }) => {
  const tt = (k: string): string => translate(lang, k);
  return (
    <div className="mt-5 border-t border-white/10 pt-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--accent-2)" }}>{tt("akAdim2")}</span>
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[9px] font-bold text-white/45">{BACKGROUNDS.length.toLocaleString("tr-TR")} hazır · {BG_CATS.length} kategori</span>
          <div className="ml-auto flex items-center gap-1.5">
            {/* 🎯 Akıllı Seç — ayet + uyumlu arka plan tek tuşla */}
            <button
              type="button"
              onClick={akilliSec}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[9.5px] font-black text-black transition hover:brightness-110 active:scale-95"
              style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
              title={tt("akAkilliSecim")}
            >
              <Wand2 size={11} /> Akıllı Seç
            </button>
            <button
              type="button"
              onClick={shuffleBg}
              className="flex items-center gap-1.5 rounded-lg glass-soft px-2.5 py-1.5 text-[9.5px] font-bold text-white/70 transition hover:text-white active:scale-95"
              title={tt("akRastgeleBg")}
            >
              <Shuffle size={11} style={{ color: "var(--accent)" }} /> Karıştır
            </button>
          </div>
        </div>

        {/* Arama — pill kalabalığı yerine: yazınca kategoriden süzer */}
        <div className="relative mb-2.5">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={bgSearch}
            onChange={(e) => setBgSearch(e.target.value)}
            placeholder={tt("akBgAra")}
            className="glass-soft w-full rounded-xl py-2.5 pl-9 pr-24 text-[11px] outline-none placeholder:text-white/30"
          />
          {/* Kategori sayısı çok olduğu için dropdown'a taşındı */}
          <select
            value={bgCat}
            onChange={(e) => setBgCat(e.target.value)}
            className="glass-soft absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1.5 text-[9.5px] font-bold text-white/75 outline-none"
            title={ttLS("akSuzTitle")}
          >
            <option value="all">{tt("akTumu")}</option>
            {BG_CATS.map((cat) => (
              <option key={cat} value={cat}>{catLabel(cat)}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {filteredBgs.slice(0, visibleCount).map((item) => {
            const active = item.id === bgId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setBgId(item.id)}
                className={`group relative aspect-square overflow-hidden rounded-xl border transition ${active ? "border-[color:var(--accent)] ring-2 ring-[color:var(--accent)]" : "border-white/10 hover:border-white/35"}`}
                title={`${item.label} · ${catLabel(item.cat)}`}
              >
                <img
                  src={item.src}
                  alt={item.label}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                />
                <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/85 to-transparent px-1.5 pb-1 pt-3 text-left text-[7.5px] font-bold text-white/90">
                  {catLabel(item.cat)}
                </span>
                {active && (
                  <span className="absolute left-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[color:var(--accent)] text-black">
                    <Check size={10} strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {visibleCount < filteredBgs.length && (
          <div ref={loadMoreRef} className="flex h-10 items-center justify-center gap-2 text-[10px] font-bold text-white/35">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
            Daha fazla arka plan yükleniyor…
          </div>
        )}
        {filteredBgs.length === 0 && (
          <p className="py-6 text-center text-[11px] text-white/40">{tt("akBgBulunamadi")}</p>
        )}
      </div>
  );
};
