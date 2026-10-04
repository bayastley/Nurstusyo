// ════════════════════════════════════════════════════════
// HAT FONTU ŞERİDİ (01.10) — Ayet Kütüphanesi kartı + stüdyo Özel Yazı
// ORTAK bileşen. Plan kararı: temel stil (Aa Türkçe) HERKESE, hat paleti
// (20 font) PRO+ kilidi arkasında. Kilitliyken tek "PRO+" düğmesi görünür;
// tıklanınca kilitTiklandi çağrılır (notify + premium yönlendirmesi çağıran
// tarafın işi — bu bileşen saf kalır).
// ════════════════════════════════════════════════════════

import React from "react";
import { Lock } from "lucide-react";
import { ARABIC_FONTS, arabicFontWeight } from "../studio/studioConstants";

import { translate } from "../i18n"; // ★ TUR 6: title kalıntıları LS bazlı çeviri

export const HatFontuSeridi: React.FC<{
  seciliHatCss: string;
  onSec: (hatCss: string, hatAgirlik: number) => void;
  proAcik: boolean;
  kilitTiklandi?: () => void;
  boy?: "kucuk" | "normal";
}> = ({ seciliHatCss, onSec, proAcik, kilitTiklandi, boy = "normal" }) => {
  const kucuk = boy === "kucuk";
  const tt = (k: string): string => translate(localStorage.getItem("nur_lang"), k);
  return (
    <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-thin">
      <button
        type="button"
        onClick={() => onSec("Inter, sans-serif", 600)}
        className={`shrink-0 rounded-md px-2 py-1 text-[9px] font-bold transition ${seciliHatCss === "Inter, sans-serif" ? "text-black" : "glass-soft text-white/60 hover:text-white"}`}
        style={seciliHatCss === "Inter, sans-serif" ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}
        title={tt("hfTurkce")}
      >
        {tt("hfAa")}
      </button>
      {proAcik ? (
        ARABIC_FONTS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onSec(f.css, arabicFontWeight(f.id))}
            className={`shrink-0 rounded-md px-2 py-1 transition ${seciliHatCss === f.css ? "text-black" : "glass-soft text-white/80 hover:text-white"}`}
            style={{
              fontFamily: f.css,
              fontSize: kucuk ? 12 : 13,
              direction: "rtl",
              ...(seciliHatCss === f.css ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : {}),
            }}
            title={tt("hfHatTitle").replace("{ad}", f.label)}
          >
            نموذج
          </button>
        ))
      ) : (
        <button
          type="button"
          onClick={kilitTiklandi}
          className="shrink-0 rounded-md bg-white/[.04] px-2.5 py-1 text-[9px] font-black text-amber-300/90 ring-1 ring-amber-400/25 transition hover:bg-amber-400/10"
          title={tt("akNotifHatPro")}
        >
          <Lock size={8} className="mr-1 inline" /> {tt("hfPaleti")}
        </button>
      )}
    </div>
  );
};
