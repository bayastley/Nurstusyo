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

export function SureBolumu({
  filtreliSureler, acikSure, setAcikSure, q, lang = "tr",
}: {
  filtreliSureler: SureItem[];
  acikSure: number | null;
  setAcikSure: (v: number | null) => void;
  q: string;
  lang?: string;
}) {
  const L = (k: keyof typeof LBL) => (LBL[k] && (LBL[k][lang] || LBL[k].tr)) || "";
  return (
    <div className="space-y-1.5">
      {filtreliSureler.map((s) => {
        const acik = acikSure === s.n;
        const ayetSayisi = SURAHS.find((x) => x.n === s.n)?.count;
        const konu = pick(s, "konu", lang);
        const aciklama = pick(s, "aciklama", lang);
        const nuzul = pick(s, "nuzul", lang);
        const fazilet = pick(s, "fazilet", lang);
        const inis = s.inis === "Mekke" ? L("inisMekke") : L("inisMedine");
        return (
          <div key={s.n} className={`overflow-hidden rounded-xl border transition-colors ${acik ? "border-white/20 bg-white/[.05]" : "border-white/10 bg-white/[.03] hover:bg-white/[.05]"}`}>
            <button
              type="button"
              aria-expanded={acik}
              onClick={() => setAcikSure(acik ? (q ? s.n : null) : s.n)}
              className="flex w-full items-center gap-2 p-3 text-left"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-black text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>{s.n}</span>
              <h4 className="text-[12px] font-black text-white/90">{sureAdX2910(s.n, s.ad, (lang || "tr") as Parameters<typeof sureAdX2910>[2])}</h4>
              {SURE_ARAPCA[s.n] && <span dir="rtl" className="font-arabic text-[11px] text-white/40">{SURE_ARAPCA[s.n]}</span>}
              {ayetSayisi != null && <span className="text-[8.5px] font-bold text-white/35">{ayetSayisi} {L("ayet")}</span>}
              <span className="ml-auto rounded-full bg-white/8 px-2 py-0.5 text-[8.5px] font-bold text-white/50">{lang === "tr" ? `${inis}'de inmiştir` : inis}</span>
              <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-white/40 transition-transform duration-200 ${acik ? "rotate-180" : ""}`} />
            </button>
            {!acik && (
              <button type="button" onClick={() => setAcikSure(s.n)} title={ttX2610("ksfGenislet")} className="block w-full cursor-pointer truncate px-3 pb-3 text-left text-[10px] leading-relaxed text-white/50 transition-colors hover:text-white/80">
                {konu}
              </button>
            )}
            {acik && (
              <div className="border-t border-white/10 px-3.5 pb-3.5 pt-2.5" onClick={(e) => e.stopPropagation()}>
                <p className="text-[10px] leading-relaxed text-white/60"><b className="text-white/80">{L("konu")}:</b> {konu}</p>
                {aciklama && <p className="mt-1.5 text-[10px] leading-relaxed text-white/55">{aciklama}</p>}
                {nuzul && <p className="mt-2 rounded-lg bg-white/[.04] px-2.5 py-2 text-[10px] leading-relaxed text-white/65"><b className="text-amber-200/90">{L("nuzul")}:</b> {nuzul}</p>}
                <p className="mt-2 text-[10px] leading-relaxed text-emerald-200/80"><b>{L("fazilet")}:</b> {fazilet}</p>
              </div>
            )}
          </div>
        );
      })}
      {filtreliSureler.length === 0 && <p className="py-6 text-center text-[10px] text-white/40">{ttX2610("ksfSureBulunamadi")}</p>}
      <p className="pt-1 text-center text-[8px] text-white/25">{filtreliSureler.length} {lang === "tr" ? "sure · detay için karta dokun" : ""}</p>
    </div>
  );
}
