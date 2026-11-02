// ════════════════════════════════════════════════════════
// GÜNLÜK SERİ ROZETİ — 02.11
// "Day {n} 🔥" rozeti: her gün gelince büyür, gün kaçırınca sıfırlanır.
// Açılışta SERİ İLERLETİLİR (nur_gunluk_seri_v1); bugün zaten açıldıysa
// aynı sayıyı gösterir. JETON YOK — yerel motivasyon rozeti.
// Rozet alt-sağ köşede; BugunHediye (alt-sol) ile simetrik konum.
// ════════════════════════════════════════════════════════

import React, { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { translate, type Lang } from "../i18n";
import { seriIlerlet } from "./gunlukSeri";

export interface GunlukSeriRozetiProps { lang?: Lang }

export const GunlukSeriRozeti: React.FC<GunlukSeriRozetiProps> = ({ lang = "tr" }) => {
  const [seri, setSeri] = useState(0);
  const [enIyi, setEnIyi] = useState(0);

  // ★ ACILIŞTA İLERLET (01.11): açılış gün damgası — günde yalnız 1 kez artar.
  //   Yerel depoda; localStorage kapalıysa rozet 0 kalır ve hiç gösterilmez.
  useEffect(() => {
    try {
      const s = seriIlerlet();
      setSeri(s.seri);
      setEnIyi(s.enIyi);
    } catch { /* yut */ }
  }, []);

  // 0 = localStorage kapalı ya da hesaplanamadı → rozet gösterme
  if (seri < 1) return null;
  const tt = (k: string): string =>
    translate(lang, k).replace("{n}", String(seri)).replace("{best}", String(Math.max(1, enIyi)));

  return (
    <button
      type="button"
      data-minitur="gunluk-seri"
      className="fixed bottom-20 right-3 z-[85] flex h-10 max-w-[80vw] items-center gap-1.5 rounded-full px-3 shadow-2xl transition hover:scale-105 active:scale-95 md:bottom-4 md:right-4 md:h-11"
      style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
      title={tt("seriTitle")}
    >
      <Flame size={18} className="shrink-0 text-black" />
      <span className="text-[13px] font-bold whitespace-nowrap text-black">{tt("seriRozet")}</span>
    </button>
  );
};
