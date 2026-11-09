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
import { atolyeKelimeOner } from "./atolye";
import { EsmaBolumu } from "./EsmaBolumu";

export function KelimeBolumu({
  tt, lang, gununKelimeleri, kartCevrildi, setKartCevrildi, bilinenSet, atolyeAc,
  kelimeKartlari, kelimeYenile,
}: {
  tt: (k: string) => string;
  lang: string;
  gununKelimeleri: KelimeKart[];
  kartCevrildi: string | null;
  setKartCevrildi: (v: string | null) => void;
  bilinenSet: Set<string>;
  atolyeAc?: (kelime: string, kelimeAr: string) => void;
  kelimeKartlari: KelimeKart[];
  kelimeYenile: () => void;
}) {
  return (
    <>
      <div className="mb-2 flex flex-wrap items-center justify-center gap-2">
        <span className="rounded-lg px-2 py-0.5 text-[8px] font-black text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>{ttX2610("ksfGunun")}</span>
        <p className="text-[9px] text-white/40">{ttX2610("ksfGununNot")}</p>
      </div>
      <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
        {gununKelimeleri.map((k) => (
          <KelimeKarti key={k.ar} k={k} altin cevrildi={kartCevrildi === k.ar} cevir={() => setKartCevrildi(kartCevrildi === k.ar ? null : k.ar)} dil={lang}
            bilinen={bilinenSet.has(k.ar)} bilinenToggle={() => bilinenKelimeIsaretle(k.ar, !bilinenSet.has(k.ar))}
            atolyeye={atolyeAc ? () => atolyeAc(atolyeKelimeOner(k), k.ar) : undefined} />
        ))}
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-center gap-2.5">
        <p className="text-[9px] text-white/40">{tt("ksKesifKartNot")}</p>
        <button type="button" onClick={kelimeYenile}
          className="flex items-center gap-1 rounded-full border border-white/15 bg-white/[.05] px-2.5 py-1 text-[9px] font-black text-white/70 transition hover:border-[color:var(--accent)] hover:text-white"
          title={tt("ksYenileTitle")}>
          {tt("ksYenile")}
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {kelimeKartlari.map((k) => (
          <KelimeKarti key={k.ar} k={k} cevrildi={kartCevrildi === k.ar} cevir={() => setKartCevrildi(kartCevrildi === k.ar ? null : k.ar)} dil={lang}
            bilinen={bilinenSet.has(k.ar)} bilinenToggle={() => bilinenKelimeIsaretle(k.ar, !bilinenSet.has(k.ar))}
            atolyeye={atolyeAc ? () => atolyeAc(atolyeKelimeOner(k), k.ar) : undefined} />
        ))}
      </div>
      <p className="mt-3 text-center text-[8px] text-white/25">{tt("ksHavuzNot").replace("{toplam}", String(KELIME_KARTLARI.length)).replace("{bugun}", String(gununKelimeleri.length)).replace("{kesif}", String(kelimeKartlari.length))}</p>
      {/* ★ 31.10 (kullanıcı emri): Esmaü'l-Hüsnâ bölümü — Kelime Kartları sekmesinin sonunda */}
      <EsmaBolumu dil={lang} />
    </>
  );
}

