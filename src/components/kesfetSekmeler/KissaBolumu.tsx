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

export function KissaBolumu({
  tt, filtreliKissalar, acikKissa, setAcikKissa,
}: {
  tt: (k: string) => string;
  filtreliKissalar: Array<{ ad: string; sure: string; ozet: string; ders: string; dua: string; kaynak?: string }>;
  acikKissa: string | null;
  setAcikKissa: (v: string | null) => void;
}) {
  return (
    <div className="space-y-1.5">
      {filtreliKissalar.map((k) => {
        const acik = acikKissa === k.ad;
        return (
          <div key={k.ad} className={`overflow-hidden rounded-xl border transition-colors ${acik ? "border-white/20 bg-white/[.05]" : "border-white/10 bg-white/[.03] hover:bg-white/[.05]"}`}>
            <button
              type="button"
              data-kissa="1"
              aria-expanded={acik}
              onClick={() => setAcikKissa(acik ? null : k.ad)}
              className="flex w-full items-center gap-2 p-3 text-left"
            >
              <span className="shrink-0 rounded-full bg-white/8 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider" style={{ color: "var(--accent)" }}>{k.sure}</span>
              <h4 className="min-w-0 truncate text-[12px] font-black text-white/90">{k.ad}</h4>
              <ChevronDown className={`ml-auto h-3.5 w-3.5 shrink-0 text-white/40 transition-transform duration-200 ${acik ? "rotate-180" : ""}`} />
            </button>
            {!acik && (
              <button type="button" onClick={() => setAcikKissa(k.ad)} title={tt("ksGenislet")} className="block w-full cursor-pointer truncate px-3 pb-3 text-left text-[10px] leading-relaxed text-white/50 transition-colors hover:text-white/80">
                {(KISSA_UZUN[k.ad] ?? k.ozet).replace(/\n+/g, " ")}
              </button>
            )}
            {acik && (
              <div className="border-t border-white/10 px-3.5 pb-3.5 pt-2.5">
                <p className="whitespace-pre-line text-[10.5px] leading-relaxed text-white/70">{KISSA_UZUN[k.ad] ?? k.ozet}</p>
                <p className="mt-2 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-[9.5px] leading-relaxed text-emerald-200">💡 {k.ders}</p>
                {/* ★ KISSANIN DUASI (28.09) — kıssanın sonunda, kıssanın ruhuyla ilgili okunacak dua */}
                <p className="mt-2 rounded-lg px-2.5 py-1.5 text-[9.5px] leading-relaxed" style={{ background: "rgba(215,170,82,.08)", color: "var(--accent-2)" }}>
                  <span className="font-black">{tt("ksKissaDuasi")}</span> {k.dua}
                </p>
                {/* ★ 25.10 (kullanıcı emri): sahih kaynak satırı — kıssanın altında */}
                {k.kaynak && <p className="mt-2 text-[8.5px] font-bold" style={{ color: "var(--accent-2)" }}>📚 {k.kaynak}</p>}
              </div>
            )}
          </div>
        );
      })}
      {filtreliKissalar.length === 0 && <p className="py-6 text-center text-[10px] text-white/40">{tt("ksKissaYok")}</p>}
      <p className="pt-1 text-center text-[8px] text-white/25">{tt("ksKissaSayaci").replace("{n}", String(filtreliKissalar.length))}</p>
    </div>
  );
}

// ── 20: SORU-CEVAP — akordeon (28.09 mezhepli + genel arşiv) ──
// ★ 30.10 (kullanıcı emri "şıkları sola koy alt alta tıklayınca renk değişsin geniş olsun"):
//   Görüşler 1 sütun, sola dayalı, tam genişlik; seçince renk vurgulanır.
