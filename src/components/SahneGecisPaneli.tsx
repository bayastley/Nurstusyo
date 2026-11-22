// ════════════════════════════════════════════════════════
// SAHNE GEÇİŞ PANELİ — yol haritası madde 22
// Stüdyo yuvasının "Geçiş" sekmesi: 4 geçiş türü + süre ayarı.
// Seçim hem önizlemeye hem kayda anında uygulanır (canvas zarfı).
// ════════════════════════════════════════════════════════

import React from "react";
import { translate } from "../i18n";
import {
  sahneGecis,
  sahneGecisYaz,
  type GecisTuru,
  type SahneGecisAyar,
} from "../studio/sahneGecis";

const TURLER: Array<{ id: GecisTuru; anahtar: string; emoji: string }> = [
  { id: "yok", anahtar: "sgYok", emoji: "⏹" },
  { id: "karartma", anahtar: "sgKarartma", emoji: "🌑" },
  { id: "isik", anahtar: "sgIsik", emoji: "✨" },
  { id: "sinematik", anahtar: "sgSinematik", emoji: "🎬" },
];

export const SahneGecisPaneli: React.FC = () => {
  const dil = (typeof localStorage !== "undefined" ? localStorage.getItem("nur_lang") : "tr") || "tr";
  const gt = (k: string): string => translate(dil, k);
  const [ayar, setAyar] = React.useState<SahneGecisAyar>(() => sahneGecis());

  const uygula = (yama: Partial<SahneGecisAyar>) => {
    const yeni = { ...ayar, ...yama };
    setAyar(yeni);
    sahneGecisYaz(yeni);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/12 bg-white/[.02] p-3.5">
      <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: "var(--accent-2)" }}>{gt("sgBaslik")}</p>
      <p className="mt-0.5 text-[11.5px] font-black leading-snug text-white/90">{gt("sgSub")}</p>

      <div className="mt-2.5 grid grid-cols-4 gap-1.5">
        {TURLER.map((tur) => {
          const secili = ayar.tur === tur.id;
          return (
            <button
              key={tur.id}
              type="button"
              aria-pressed={secili}
              onClick={() => uygula({ tur: tur.id })}
              className={`rounded-xl border px-1 py-2 text-[8.5px] font-black leading-tight transition ${secili ? "border-transparent text-black" : "border-white/15 text-white/65 hover:text-white"}`}
              style={secili ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}
            >
              <span className="block text-[13px] leading-none" aria-hidden>{tur.emoji}</span>
              <span className="mt-1 block truncate">{gt(tur.anahtar)}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-2.5 flex items-center gap-2">
        <span className="w-[96px] shrink-0 text-[9px] font-black uppercase tracking-wide text-white/55">{gt("sgSure")}</span>
        <input
          type="range"
          min={0.2}
          max={1.5}
          step={0.1}
          value={ayar.sure}
          disabled={ayar.tur === "yok"}
          onChange={(e) => uygula({ sure: Number(e.target.value) })}
          className="h-1 flex-1 accent-amber-400 disabled:opacity-40"
          aria-label={gt("sgSure")}
        />
        <span className="w-[44px] shrink-0 text-right text-[9.5px] font-black text-white/75">{ayar.sure.toFixed(1)}s</span>
      </div>

      <p className="mt-2 text-[9px] font-semibold leading-snug text-white/40">{gt("sgNot")}</p>
    </div>
  );
};
