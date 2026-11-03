// ══════════════════════════════════════════════════════════════════
// KESFETNAMAZBOLUMU.TSX — Keşfet > Namaz Öğretici sekmesi (madde 28)
// KesfetModal.tsx'den ayrıldı (SRP adım, 03.11) — bağlamlar (tt, lang,
// namazPanel state) prop ile korunarak taşındı; davranış birebir aynı.
// Butonlar: Namaz Çeşitleri · Faziletleri · Nasıl Kılınır · Namazda Okunan Dualar
// ══════════════════════════════════════════════════════════════════

import {
  NAMAZ_REHBERİ,
  NAMAZ_CESITLERİ,
  NAMAZ_FAZILETLERİ,
  NAMAZ_DUALARI,
} from "../data/namazData";
import type { Lang } from "../i18n/base";

export type NamazPanelKey = "cesitler" | "fazilet" | "kilinis" | "dualar";

interface NamazOgreticiBolumuProps {
  tt: (k: string) => string;
  lang?: Lang | string | null;
  namazPanel: NamazPanelKey;
  setNamazPanel: React.Dispatch<React.SetStateAction<NamazPanelKey>>;
}

export const NamazOgreticiBolumu = ({ tt, lang, namazPanel, setNamazPanel }: NamazOgreticiBolumuProps) => {
  // ★ 5-dil içerik indeksi (tr,en,ar,id,ur) — Namazda Okunan Dualar anlam dizisi için
  const dilIdx: number = ({ tr: 0, en: 1, ar: 2, id: 3, ur: 4 } as Record<string, number>)[String(lang ?? "tr")] ?? 0;

  return (
    <div className="space-y-2.5">
      <p className="text-center text-[9px] leading-relaxed text-white/40">{tt("ksNamazAlt")}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(["cesitler", "fazilet", "kilinis", "dualar"] as const).map((h) => (
          <button key={h} type="button" data-minitur={`namaz-${h}`}
            onClick={() => setNamazPanel(h)}
            className={`rounded-xl border p-2.5 text-center transition ${namazPanel === h ? "border-white/25 bg-white/[.07] text-white" : "border-white/10 bg-white/[.03] text-white/60 hover:bg-white/[.05]"}`}>
            <p className="text-[10px] font-black leading-tight">
              {h === "cesitler" ? tt("ksNamazCesitleri") : h === "fazilet" ? tt("ksNamazFaziletleri") : h === "kilinis" ? tt("ksNasilKilinur") : tt("ksNamazDualari")}
            </p>
          </button>
        ))}
      </div>

      {namazPanel === "cesitler" && (
        <div className="space-y-1.5" data-minitur="namaz-cesit-liste">
          {NAMAZ_CESITLERİ.map((c) => (
            <div key={c.ad} className="rounded-xl border border-white/10 bg-white/[.03] p-2.5">
              <p className="text-[10.5px] font-black text-white/90">{c.ad} <span className="ml-1 text-[8px] font-bold" style={{ color: "var(--accent)" }}>{c.hukum}</span></p>
              <p className="mt-1 text-[9.5px] text-white/65">Rekat: {c.rekat} · Vakti: {c.vakti}</p>
              <p className="mt-0.5 text-[9px] leading-relaxed text-white/50">{c.fazilet}</p>
              <p className="mt-0.5 text-[8px] font-bold" style={{ color: "var(--accent-2)" }}>📚 {c.kaynak}</p>
            </div>
          ))}
        </div>
      )}

      {namazPanel === "fazilet" && (
        <div className="space-y-1.5" data-minitur="namaz-fazilet-liste">
          {NAMAZ_FAZILETLERİ.map((f) => (
            <div key={f.ad} className="rounded-xl border border-white/10 bg-white/[.03] p-2.5">
              <p className="text-[10.5px] font-black text-white/90">{f.ad}</p>
              <p className="mt-0.5 text-[9.5px] leading-relaxed text-white/65">{f.fazilet}</p>
              <p className="mt-0.5 text-[8px] font-bold" style={{ color: "var(--accent-2)" }}>📚 {f.kaynak}</p>
            </div>
          ))}
        </div>
      )}

      {namazPanel === "kilinis" && (
        <div className="space-y-1.5" data-minitur="namaz-kilinis-liste">
          {NAMAZ_REHBERİ.map((a, i) => (
            <div key={i} className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[.03] p-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-black text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[10.5px] font-black text-white/90">{a.adim}</p>
                <p className="mt-0.5 text-[9.5px] leading-relaxed text-white/60">{a.yazi}</p>
                {a.arapca && <p className="mt-1 text-right font-arabic text-[13px] leading-relaxed" style={{ color: "var(--accent-2)" }}>{a.arapca}</p>}
                {a.kaynak && <p className="mt-1 text-[8px] font-bold" style={{ color: "var(--accent)" }}>📚 {a.kaynak}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 03.11 (kullanıcı emri): NAMAZDA OKUNAN DUALAR — 4. panel ── */}
      {namazPanel === "dualar" && (
        <div className="space-y-1.5" data-minitur="namaz-dualar-liste">
          {NAMAZ_DUALARI.map((d) => (
            <div key={d.ad} className="rounded-xl border border-white/10 bg-white/[.03] p-2.5">
              <p className="text-[10.5px] font-black text-white/90">{d.ad} <span className="ml-1 text-[8px] font-bold text-white/45">{d.hane}</span></p>
              <p className="mt-1.5 text-right font-arabic text-[14px] leading-loose" style={{ color: "var(--accent-2)" }}>{d.arapca}</p>
              <p className="mt-1 text-[9px] italic text-white/55">{d.latin}</p>
              <p className="mt-1 text-[9.5px] leading-relaxed text-white/70">{d.anlam[dilIdx] ?? d.anlam[0]}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
