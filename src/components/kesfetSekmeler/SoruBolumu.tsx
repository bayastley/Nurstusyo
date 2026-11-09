import React from "react";
import { translate } from "../../i18n";
import { ChevronDown } from "lucide-react";
import { HADIS_TEMALARI, HADIS_DERECE_ETIKETI, RIVAYETCILER, kaynaktanRivayetci } from "../../data/hadisData";
import { KELIME_KARTLARI, type KelimeKart } from "../../data/kelimeData";
import { SURAHS } from "../../data/surahs";
import { SURE_ARAPCA } from "../../data/sureArapca";
import { sureAdGorunum as sureAdX2910 } from "../../data/surelerCokDil";
import { kelimeOku, bilinenKelimeIsaretle } from "../kesfetTemel";
import { ESMA_HUSNA, ESMA_KAYNAK_NOTU, type Esma } from "../../data/esmaHusna";
import { KISSA_UZUN } from "../../data/kissaUzun";
import { MEZHEPLER, type MezhepKaydi } from "../../data/mezheplerData";
import { ttX2610, KelimeKarti } from "./shared";

export function SoruBolumu({
  tt, filtreliBesSart, filtreliSorular,
  acikSoru, setAcikSoru, acikGenelSoru, setAcikGenelSoru,
}: {
  tt: (k: string) => string;
  filtreliBesSart: Array<{ sart: string; soru: string; kaynak: string; cevaplar: Array<{ mezhep: string; metin: string }> }>;
  filtreliSorular: Array<{ soru: string; cevap: string; kaynak: string }>;
  acikSoru: number | null;
  setAcikSoru: (v: number | null) => void;
  acikGenelSoru: number | null;
  setAcikGenelSoru: (v: number | null) => void;
}) {
  const [secilen, setSecilen] = React.useState<string | null>(null);
  return (
    <div className="space-y-1.5">
      {/* ★ İSLAM'IN 5 ŞARTI — MEZHEPLERE GÖRE FIKHİ SORU-CEVAP (28.09, kullanıcı kararı) */}
      <p className="mt-1 mb-2 text-center text-[9px] font-black uppercase tracking-widest text-white/45">{tt("ks5Sart")}</p>
      {filtreliBesSart.map((b, bi) => {
        const acik = acikSoru === bi;
        return (
          <div key={`bs-${bi}`} className={`overflow-hidden rounded-xl border transition-colors ${acik ? "border-white/20 bg-white/[.05]" : "border-white/10 bg-white/[.03] hover:bg-white/[.05]"}`}>
            <button
              type="button"
              aria-expanded={acik}
              onClick={() => setAcikSoru(acik ? null : bi)}
              className="flex w-full items-center gap-2 p-3 text-left"
            >
              <span className="shrink-0 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[8px] font-black text-emerald-300">{b.sart}</span>
              <h4 className="min-w-0 truncate text-[11.5px] font-black text-white/90">❓ {b.soru}</h4>
              <span className="ml-auto shrink-0 rounded-full bg-white/8 px-2 py-0.5 text-[8px] font-bold text-white/45">{b.cevaplar.length} görüş</span>
              <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-white/40 transition-transform duration-200 ${acik ? "rotate-180" : ""}`} />
            </button>
            {!acik && (
              <button type="button" onClick={() => setAcikSoru(bi)} title={tt("ksGenislet")} className="block w-full cursor-pointer truncate px-3 pb-3 text-left text-[10px] leading-relaxed text-white/50 transition-colors hover:text-white/80">
                {b.cevaplar[0]?.mezhep}: {b.cevaplar[0]?.metin}
              </button>
            )}
            {acik && (
              <div className="border-t border-white/10 px-3.5 pb-3.5 pt-2.5">
                {/* ★ 30.10: cevaplar TEK sütun — sola dayalı, tam genişlik; seçince renk vurgulanır */}
                <div className="flex flex-col items-stretch gap-1.5">
                  {b.cevaplar.map((c) => {
                    const k = `bs-${bi}-${c.mezhep}`;
                    const sec = secilen === k;
                    return (
                      <button
                        key={c.mezhep}
                        type="button"
                        onClick={() => setSecilen(sec ? null : k)}
                        className={`w-full rounded-lg border p-2.5 text-left transition ${sec ? "border-emerald-400/40 bg-emerald-500/[.08]" : "border-white/10 bg-white/[.03] hover:bg-white/[.06]"}`}
                      >
                        <p className="text-[9px] font-black" style={{ color: sec ? "#6ee7b7" : "var(--accent-2)" }}>{sec ? "✓ " : ""}{c.mezhep}</p>
                        <p className="mt-0.5 text-[9.5px] leading-relaxed text-white/65">{c.metin}</p>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-1.5 text-[8.5px] text-white/40">📌 Kaynak: {b.kaynak}</p>
              </div>
            )}
          </div>
        );
      })}
      <p className="mt-3 rounded-xl bg-white/[.04] px-3 py-2 text-center text-[9px] font-black uppercase tracking-widest text-white/45">{tt("ksGenelArsiv")}</p>
      {filtreliSorular.map((s, i) => {
        const acik = acikGenelSoru === i;
        return (
          <div key={i} className={`overflow-hidden rounded-xl border transition-colors ${acik ? "border-white/20 bg-white/[.05]" : "border-white/10 bg-white/[.03] hover:bg-white/[.05]"}`}>
            <button
              type="button"
              aria-expanded={acik}
              onClick={() => setAcikGenelSoru(acik ? null : i)}
              className="flex w-full items-center gap-2 p-3 text-left"
            >
              <h4 className="min-w-0 truncate text-[11.5px] font-black text-white/90">❓ {s.soru}</h4>
              <ChevronDown className={`ml-auto h-3.5 w-3.5 shrink-0 text-white/40 transition-transform duration-200 ${acik ? "rotate-180" : ""}`} />
            </button>
            {!acik && (
              <button type="button" onClick={() => setAcikGenelSoru(i)} title={ttX2610("ksfGenislet")} className="block w-full cursor-pointer truncate px-3 pb-3 text-left text-[10px] leading-relaxed text-white/50 transition-colors hover:text-white/80">
                {s.cevap}
              </button>
            )}
            {acik && (
              <div className="border-t border-white/10 px-3.5 pb-3.5 pt-2.5">
                <p className="text-[10px] leading-relaxed text-white/65">{s.cevap}</p>
                <p className="mt-1.5 text-[8.5px] text-white/40">📌 Kaynak: {s.kaynak} · Kesin hüküm için Diyanet İşleri Başkanlığı'na danışın</p>
              </div>
            )}
          </div>
        );
      })}
      <p className="pt-1 text-center text-[8px] text-white/25">{filtreliBesSart.length} mezhepli soru · {filtreliSorular.length} genel soru · detay için karta dokun</p>
      <p className="rounded-xl bg-amber-500/10 px-3 py-2 text-center text-[9px] text-amber-200/80">{ttX2610("ksfUyari")} yönlendiririz.</p>
    </div>
  );
}

// ── 21: KELİME KARTLARI (flashcard) ──────────────────────────
