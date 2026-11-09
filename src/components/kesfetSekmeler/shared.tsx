import React from "react";
import { translate } from "../../i18n";
import type { KelimeKart } from "../../data/kelimeData";
import { kelimeOku } from "../kesfetTemel";

const ttX2610 = (k: string): string => translate(typeof localStorage !== "undefined" ? (localStorage.getItem("nur_lang") || "tr") : "tr", k);
export { ttX2610 };

export function KelimeKarti({ k, cevrildi, cevir, altin, bilinen, bilinenToggle, atolyeye, dil = "tr" }: { k: KelimeKart; cevrildi: boolean; cevir: () => void; altin?: boolean; bilinen?: boolean; bilinenToggle?: () => void; atolyeye?: () => void; dil?: string }) {
  const ktt = (key: string): string => translate(dil, key);
  return (
    <div className="relative">
      <button type="button" onClick={cevir}
        className={`flex h-20 w-full flex-col items-center justify-center rounded-xl border p-1.5 text-center transition ${cevrildi ? "border-[color:var(--accent)] bg-amber-500/10" : altin ? "border-white/25 bg-white/[.06] hover:border-white/40" : "border-white/10 bg-white/[.03] hover:border-white/25"}`}
        style={altin && !cevrildi ? { borderColor: "var(--accent-2)", boxShadow: "0 0 10px rgba(215,170,82,.18)" } : undefined}>
        {cevrildi ? (
          <>
            <p className="text-[10.5px] font-black leading-tight text-amber-200">{k.tr}</p>
            {k.meal ? (
              <>
                {/* ★ 03.10: havuzdaki yeni kelimeler ayet ifadesi + meal satırıyla geliyor */}
                <p dir="rtl" className="mt-0.5 font-arabic text-[7.5px] leading-tight text-white/45 line-clamp-2">{k.ornek}</p>
                <p className="mt-0.5 px-1 text-[6.5px] leading-tight text-white/40 line-clamp-2">{k.meal}</p>
              </>
            ) : (
              <p className="mt-0.5 px-1 text-[7px] leading-tight text-white/40">{k.ornek.slice(0, 26)}</p>
            )}
          </>
        ) : (
          <p className="font-arabic text-lg text-white/90">{k.ar}</p>
        )}
      </button>
      {/* ★ OKUNUŞ SESİ (28.09, kullanıcı kararı): tarayıcı TTS ile Arapça okunuş —
          latin okunuş öncelikli okunur; cihaz Arapça sesi yoksa latin metin okunur */}
      <button type="button"
        onClick={(e) => { e.stopPropagation(); kelimeOku(k); }}
        title={`${ktt("ksOkunusDinle")} ${k.okunus}`}
        className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-[9px] shadow-md ring-1 ring-white/20 transition hover:scale-110 hover:bg-black/90"
      >🔊</button>
      {/* ★ ATÖLYEDE ÇALIŞ (03.10): bu kelimeyi Kelime Atölyesi'nde çalış — ayet+atmosfer öner, stüdyoya aktar */}
      {atolyeye && (
        <button type="button"
          onClick={(e) => { e.stopPropagation(); atolyeye(); }}
          title={ktt("ksAtolyedeCalis")}
          className="absolute -left-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-[9px] shadow-md ring-1 ring-white/20 transition hover:scale-110 hover:bg-black/90"
        >✨</button>
      )}
      {/* ★ BİLDİM TİKİ (03.10): atölyeden stüdyoya aktarılan kelime yeşil tik alır; elle de işaretlenir/kaldırılır */}
      {bilinenToggle && (
        <button type="button"
          onClick={(e) => { e.stopPropagation(); bilinenToggle(); }}
          title={bilinen ? ktt("ksBilinenTitle") : ktt("ksOgrenTitle")}
          className={`absolute -bottom-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-black shadow-md transition hover:scale-110 ${bilinen ? "bg-emerald-500 text-black ring-1 ring-emerald-300/60" : "bg-black/70 text-white/40 ring-1 ring-white/20 hover:bg-black/90"}`}
        >{bilinen ? "✓" : "＋"}</button>
      )}
    </div>
  );
}
