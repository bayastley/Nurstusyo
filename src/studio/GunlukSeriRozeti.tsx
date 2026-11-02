// =====================================================
// GÜNLÜK SERİ ROZETİ v2 — 02.11 "OKUMA ŞARTLI"
// Açılışta seriAcilisDengele() (artırmez, süresi geçeni düşürür);
// kullanıcı bugün ayet okuyunca "nur_seri_degisti" olayı rozeti
// canlı büyütür. Rozet seri<1 ise gizlidir. JETON YOK.
// Konum: alt-sağ, BugunHediye (alt-sol) ile simetrik.
// =====================================================

import React, { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { translate, type Lang } from "../i18n";
import { seriAcilisDengele } from "./gunlukSeri";

export interface GunlukSeriRozetiProps { lang?: Lang }

export const GunlukSeriRozeti: React.FC<GunlukSeriRozetiProps> = ({ lang = "tr" }) => {
  const [seri, setSeri] = useState(0);
  const [enIyi, setEnIyi] = useState(0);

  // ★ v2 AÇILIŞ: seriyi dengele (artırmaz) + "nur_seri_degisti" olayını dinle —
  //   ayet okununca rozet sayfa yenilemeden canlı büyür.
  useEffect(() => {
    const senkronla = () => {
      try {
        const s = seriAcilisDengele();
        setSeri(s.seri);
        setEnIyi(s.enIyi);
      } catch { /* yut */ }
    };
    senkronla();
    try {
      window.addEventListener("nur_seri_degisti", senkronla);
      return () => window.removeEventListener("nur_seri_degisti", senkronla);
    } catch { /* yut */ }
  }, []);

  // 0 = localStorage kapalı / seri süresi doldu / bugün henüz okunmadı → rozet gizli
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
