import React, { useState } from "react";
import {
  NAMAZ_REHBERİ,
  NAMAZ_CESITLERİ,
  NAMAZ_FAZILETLERİ,
  NAMAZ_DUALARI,
} from "../data/namazData";
import type { Lang } from "../i18n/base";
import { namazTakipBugun, namazTakipIsaretle, kazaPlanOku, kazaPlanYaz, type KazaPlan } from "../hafizlikIstatistik";

export type NamazPanelKey = "cesitler" | "fazilet" | "kilinis" | "dualar" | "takip";

interface NamazOgreticiBolumuProps {
  tt: (k: string) => string;
  lang?: Lang | string | null;
  namazPanel: NamazPanelKey;
  setNamazPanel: React.Dispatch<React.SetStateAction<NamazPanelKey>>;
}

export const NamazOgreticiBolumu = ({ tt, lang, namazPanel, setNamazPanel }: NamazOgreticiBolumuProps) => {
  const dilIdx: number = ({ tr: 0, en: 1, ar: 2, id: 3, ur: 4 } as Record<string, number>)[String(lang ?? "tr")] ?? 0;
  const [takip, setTakip] = useState(() => namazTakipBugun());
  const vakitAdlari: Record<string, string> = { sabah: tt("ksVakitSabah"), ogle: tt("ksVakitOgle"), ikindi: tt("ksVakitIkindi"), aksam: tt("ksVakitAksam"), yatsi: tt("ksVakitYatsi") };
  const [kaza, setKaza] = useState<KazaPlan | null>(() => kazaPlanOku());
  const [kazaToplam, setKazaToplam] = useState("");
  const [kazaGunluk, setKazaGunluk] = useState("5");

  return (
    <div className="space-y-2.5">
      <p className="text-center text-[9px] leading-relaxed text-white/40">{tt("ksNamazAlt")}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {(["cesitler", "fazilet", "kilinis", "dualar", "takip"] as const).map((h) => (
          <button key={h} type="button" data-minitur={`namaz-${h}`}
            onClick={() => setNamazPanel(h)}
            className={`rounded-xl border p-2.5 text-center transition ${namazPanel === h ? "border-white/25 bg-white/[.07] text-white" : "border-white/10 bg-white/[.03] text-white/60 hover:bg-white/[.05]"}`}>
            <p className="text-[10px] font-black leading-tight">
              {h === "cesitler" ? tt("ksNamazCesitleri") : h === "fazilet" ? tt("ksNamazFaziletleri") : h === "kilinis" ? tt("ksNasilKilinur") : h === "dualar" ? tt("ksNamazDualari") : tt("ksNamazTakip")}
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

      {namazPanel === "takip" && (
        <div className="space-y-2 rounded-xl border border-white/10 bg-white/[.03] p-3" data-minitur="namaz-takip">
          <p className="text-[10px] font-black text-white/85">{tt("ksNamazTakipBaslik")}</p>
          <p className="text-[9px] text-white/45">{tt("ksNamazTakipNot")}</p>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-5">
            {(["sabah", "ogle", "ikindi", "aksam", "yatsi"] as const).map((v) => {
              const done = !!takip.vakitler[v];
              return (
                <button key={v} type="button"
                  onClick={() => { namazTakipIsaretle(v, !done); setTakip(namazTakipBugun()); }}
                  className={`rounded-lg px-2 py-2 text-[10px] font-bold transition ${done ? "bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/30" : "bg-white/5 text-white/55 hover:bg-white/10"}`}>
                  {done ? "✓ " : "○ "}{vakitAdlari[v]}
                </button>
              );
            })}
          </div>
          <p className="text-[8px] text-white/30">{tt("ksNamazTakipTarih")}: {takip.tarih}</p>

          <div className="mt-2 rounded-xl border border-white/10 bg-white/[.03] p-2.5">
            <p className="text-[10px] font-black text-white/85">{tt("ksKazaPlanBaslik")}</p>
            <p className="mt-0.5 text-[8.5px] text-white/40">{tt("ksKazaPlanNot")}</p>
            {!kaza ? (
              <div className="mt-2 space-y-1.5">
                <div className="grid grid-cols-2 gap-1.5">
                  <label className="text-[8.5px] text-white/50">{tt("ksKazaToplam")}
                    <input value={kazaToplam} onChange={(e)=>setKazaToplam(e.target.value.replace(/[^0-9]/g,""))} inputMode="numeric" className="mt-0.5 w-full rounded-lg bg-white/5 px-2 py-1.5 text-[10px] text-white outline-none" />
                  </label>
                  <label className="text-[8.5px] text-white/50">{tt("ksKazaGunlukHedef")}
                    <input value={kazaGunluk} onChange={(e)=>setKazaGunluk(e.target.value.replace(/[^0-9]/g,""))} inputMode="numeric" className="mt-0.5 w-full rounded-lg bg-white/5 px-2 py-1.5 text-[10px] text-white outline-none" />
                  </label>
                </div>
                <button type="button" className="w-full rounded-lg bg-emerald-500/20 px-2 py-1.5 text-[9.5px] font-bold text-emerald-100 hover:bg-emerald-500/30"
                  onClick={()=>{
                    const toplam = Math.max(1, parseInt(kazaToplam||"0",10)||0);
                    const gunlukHedef = Math.max(1, parseInt(kazaGunluk||"1",10)||1);
                    if (!toplam) return;
                    const p: KazaPlan = { toplam, tamamlanan: 0, baslangic: new Date().toISOString().slice(0,10), gunlukHedef };
                    kazaPlanYaz(p); setKaza(p);
                  }}>{tt("ksKazaOlustur")}</button>
              </div>
            ) : (
              <div className="mt-2 space-y-1.5">
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <div className="rounded-lg bg-white/5 py-1.5"><p className="text-[11px] font-black text-white">{kaza.tamamlanan}</p><p className="text-[7.5px] text-white/45">{tt("ksKazaTamamlanan")}</p></div>
                  <div className="rounded-lg bg-white/5 py-1.5"><p className="text-[11px] font-black text-amber-200">{Math.max(0,kaza.toplam-kaza.tamamlanan)}</p><p className="text-[7.5px] text-white/45">{tt("ksKazaKalan")}</p></div>
                  <div className="rounded-lg bg-white/5 py-1.5"><p className="text-[11px] font-black text-emerald-200">{kaza.gunlukHedef}</p><p className="text-[7.5px] text-white/45">{tt("ksKazaGunlukHedef")}</p></div>
                </div>
                <p className="text-[8px] text-white/40">{tt("ksKazaTahmini")}: {Math.ceil(Math.max(0,kaza.toplam-kaza.tamamlanan)/Math.max(1,kaza.gunlukHedef))} {tt("ksKazaGun")} · {tt("ksKazaAylik")}: ~{kaza.gunlukHedef*30}</p>
                <div className="flex gap-1.5">
                  <button type="button" className="flex-1 rounded-lg bg-emerald-500/20 px-2 py-1.5 text-[9.5px] font-bold text-emerald-100 hover:bg-emerald-500/30"
                    onClick={()=>{ const np = { ...kaza, tamamlanan: Math.min(kaza.toplam, kaza.tamamlanan + 1) }; kazaPlanYaz(np); setKaza(np); }}>{tt("ksKazaBirKildim")}</button>
                  <button type="button" className="rounded-lg bg-white/5 px-2 py-1.5 text-[9px] font-bold text-white/50 hover:bg-white/10"
                    onClick={()=>{ kazaPlanYaz(null); setKaza(null); setKazaToplam(""); }}>{tt("ksKazaSifirla")}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
