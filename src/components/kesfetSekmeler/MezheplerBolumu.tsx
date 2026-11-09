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

export function MezheplerBolumu({ tt }: { tt: (k: string) => string }) {
  const [secili, setSecili] = React.useState<string | null>(null);
  const m: MezhepKaydi | undefined = MEZHEPLER.find((x) => x.id === secili);
  return (
    <div className="space-y-2.5">
      <p className="text-center text-[9px] leading-relaxed text-white/40">{tt("ksMezhepAlt")}</p>
      <div className="grid grid-cols-2 gap-2">
        {MEZHEPLER.map((x) => (
          <button key={x.id} type="button" data-minitur={`mezhep-${x.id}`}
            onClick={() => setSecili(secili === x.id ? null : x.id)}
            className={`rounded-xl border p-3 text-left transition ${secili === x.id ? "border-white/25 bg-white/[.07]" : "border-white/10 bg-white/[.03] hover:bg-white/[.05]"}`}>
            <p className="text-[11.5px] font-black text-white/90">{x.ad}</p>
            <p className="mt-0.5 text-[8.5px] text-white/45">{x.imam}</p>
          </button>
        ))}
      </div>
      {m && (
        <div data-minitur="mezhep-detay" className="rounded-2xl border border-white/15 bg-white/[.05] p-4">
          <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "var(--accent)" }}>{m.ad}</span>
          <h3 className="mt-1 text-[14px] font-black text-white">{m.imam}</h3>
          <p className="mt-2 text-[10.5px] leading-relaxed text-white/70">{m.imamKisa}</p>
          <div className="mt-3">
            <p className="text-[9px] font-black uppercase tracking-wider text-white/40">Usûlu'l-fıkh</p>
            <ul className="mt-1 space-y-1.5">
              {m.usul.map((u, i) => <li key={i} className="text-[10px] leading-relaxed text-white/75">{i + 1}. {u}</li>)}
            </ul>
          </div>
          <div className="mt-3">
            <p className="text-[9px] font-black uppercase tracking-wider text-white/40">Fıkhihtâ özellikleri</p>
            <ul className="mt-1 space-y-1.5">
              {m.ozellikler.map((o, i) => <li key={i} className="text-[10px] leading-relaxed text-white/75">{o}</li>)}
            </ul>
          </div>
          <p className="mt-3 text-[9.5px] font-bold" style={{ color: "var(--accent-2)" }}>📕 Temel kitaplar: {m.temelKitaplar}</p>
          <p className="mt-1.5 text-[9px] font-bold" style={{ color: "var(--accent-2)" }}>📚 Kaynaklar: {m.kaynaklar}</p>
        </div>
      )}
    </div>
  );
}

// ── 19: KISSA KÖŞESİ — akordeon ──────────────────────────────
