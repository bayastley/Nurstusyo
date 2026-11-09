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

function EsmaKarti({ e, cevrildi, cevir }: { e: Esma; cevrildi: boolean; cevir: () => void }) {
  return (
    <button type="button" aria-expanded={cevrildi} onClick={cevir}
      className={`flex h-20 w-full flex-col items-center justify-center rounded-xl border p-1.5 text-center transition ${cevrildi ? "border-[color:var(--accent)] bg-amber-500/10" : "border-white/10 bg-white/[.03] hover:border-white/25"}`}>
      {cevrildi ? (
        <>
          <p className="text-[9.5px] font-black leading-tight text-amber-200">{e.tr}</p>
          <p className="mt-0.5 px-1 text-[8.5px] leading-tight text-white/60 line-clamp-2">{e.anlam}</p>
          <p className="mt-0.5 px-1 text-[7.5px] leading-tight text-emerald-300/80 line-clamp-2">📚 {e.kaynak}</p>
        </>
      ) : (
        <>
          <p dir="rtl" className="font-arabic text-base leading-tight text-white/90">{e.ar}</p>
          <p className="mt-1 text-[8px] font-bold text-white/45">{e.tr}</p>
        </>
      )}
    </button>
  );
}

export function EsmaBolumu({ dil = "tr" }: { dil?: string }) {
  const [cevrilmis, setCevrilmis] = React.useState<string | null>(null);
  const ktt = (key: string): string => translate(dil, key);
  return (
    <>
      <div className="mb-2 mt-5 flex flex-wrap items-center justify-center gap-2">
        <span className="rounded-lg px-2 py-0.5 text-[8px] font-black text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>{ktt("ksfEsmaBaslik")}</span>
        <p className="text-[9px] text-white/40">{ktt("ksfEsmaAlt")}</p>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {ESMA_HUSNA.map((e) => (
          <EsmaKarti key={e.tr} e={e} cevrildi={cevrilmis === e.tr} cevir={() => setCevrilmis(cevrilmis === e.tr ? null : e.tr)} />
        ))}
      </div>
      <p className="mt-3 text-center text-[8px] text-white/25">{ktt("ksfEsmaNot")} · {ESMA_KAYNAK_NOTU}</p>
    </>
  );
}

// ── 22: SURE BİLGİLERİ — akordeon ────────────────────────────
type SureItem = { n: number; ad: string; inis: string; konu: string; aciklama?: string; fazilet: string; nuzul?: string; konu_en?: string; konu_ar?: string; konu_id?: string; konu_ur?: string; aciklama_en?: string; aciklama_ar?: string; aciklama_id?: string; aciklama_ur?: string; fazilet_en?: string; fazilet_ar?: string; fazilet_id?: string; fazilet_ur?: string; nuzul_en?: string; nuzul_ar?: string; nuzul_id?: string; nuzul_ur?: string };
const LBL: Record<string, Record<string,string>> = {
  konu: { tr:"Konu", en:"Theme", ar:"الموضوع", id:"Tema", ur:"موضوع" },
  nuzul: { tr:"Nüzul sebebi / iniş bağlamı", en:"Revelation context", ar:"سياق النزول", id:"Konteks turunnya", ur:"نزول کا پس منظر" },
  fazilet: { tr:"Fazilet", en:"Virtue", ar:"الفضل", id:"Keutamaan", ur:"فضیلت" },
  ayet: { tr:"ayet", en:"verses", ar:"آيات", id:"ayat", ur:"آیات" },
  inisTr: { tr:"de inmiştir", en:"", ar:"", id:"", ur:"" },
  inisMekke: { tr:"Mekke", en:"Meccan", ar:"مكية", id:"Makkiyah", ur:"مکی" },
  inisMedine: { tr:"Medine", en:"Medinan", ar:"مدنية", id:"Madaniyah", ur:"مدنی" },
};
function pick(s: SureItem, k: "konu"|"aciklama"|"fazilet"|"nuzul", lang: string): string {
  const r = s as Record<string, unknown>;
  const v = lang === "tr" ? r[k] : r[`${k}_${lang}`];
  return String(v || r[k] || "");
}
