// ════════════════════════════════════════════════════════
// RENK ÇUBUĞU SEÇİCİ (01.10) — stüdyo + ayet kartlığı ORTAK UI.
// "Aşağıdan yukarı bütün renkleri taşıyan çubuk": kullanıcı çubuğu
// sürükdükçe renk seçilir (0-360° sürekli konum). Seçilen renk
// mesajKatmani.cubukRengi ile canvas çizimlerinde birebir aynıdır.
// ════════════════════════════════════════════════════════

import React, { useRef } from "react";
import { cubukDuraklari, cubukRengi } from "../studio/mesajKatmani";

export const CubukRenkSecici: React.FC<{
  etiket: string;
  deger: number;
  onSec: (derece: number) => void;
  boy?: "kucuk" | "normal";
}> = ({ etiket, deger, onSec, boy = "normal" }) => {
  const barRef = useRef<HTMLDivElement | null>(null);
  const basiliRef = useRef(false);
  const sec = (clientY: number) => {
    const kutu = barRef.current?.getBoundingClientRect();
    if (!kutu || kutu.height === 0) return;
    const oran = Math.max(0, Math.min(1, (clientY - kutu.top) / kutu.height));
    onSec(Math.round(oran * 360) % 360);
  };
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[8px] font-bold text-white/50">{etiket}</span>
      <div
        ref={barRef}
        role="slider"
        aria-label={`${etiket} rengi`}
        aria-valuenow={deger}
        aria-valuemin={0}
        aria-valuemax={360}
        tabIndex={0}
        onPointerDown={(e) => { basiliRef.current = true; e.currentTarget.setPointerCapture?.(e.pointerId); sec(e.clientY); }}
        onPointerMove={(e) => { if (basiliRef.current) sec(e.clientY); }}
        onPointerUp={() => { basiliRef.current = false; }}
        onPointerCancel={() => { basiliRef.current = false; }}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") onSec((deger + 350) % 360);
          else if (e.key === "ArrowDown") onSec((deger + 10) % 360);
        }}
        className={`relative cursor-pointer touch-none rounded-md border border-white/20 shadow-inner ${boy === "kucuk" ? "h-16 w-5" : "h-24 w-6"}`}
        style={{ background: `linear-gradient(to bottom, ${cubukDuraklari(0).join(", ")})` }}
        title={`${etiket} — çubukta aşağı/yukarı sürükle, renk seç`}
      >
        <span
          className="pointer-events-none absolute left-1/2 h-1.5 w-8 -translate-x-1/2 rounded-full border border-white bg-white/95 shadow"
          style={{ top: `calc(${((deger % 360) / 360) * 100}% - 3px)` }}
        />
      </div>
      <span className="h-3.5 w-3.5 rounded-full border border-white/40" style={{ background: cubukRengi(deger) }} />
    </div>
  );
};
