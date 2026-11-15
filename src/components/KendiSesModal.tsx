import React from "react";
import { X } from "lucide-react";
import type { Lang } from "../i18n";
import { translate } from "../i18n";
import { KendiSesPanel } from "./KendiSesPanel";

const ttX2610 = (k: string): string => translate(typeof localStorage !== "undefined" ? (localStorage.getItem("nur_lang") || "tr") : "tr", k);

interface Props {
  open: boolean;
  onClose: () => void;
  sure: number;
  seciliAyetler: Array<{ s: number; a: number; sName?: string }>;
  aktifSes: any;
  kayitlar: any[];
  yukleniyor: boolean;
  isElit: boolean;
  nefes: number;
  yukle: any;
  yukleAyetAyri: any;
  sec: any;
  sil: any;
  zamanlamaKaydet: any;
  kaldirAktif: () => void;
  yenidenTara: any;
  sureEkle: any;
  maksSn: number;
  maksAyarla: any;
  setPickingFor: any;
  setModal: any;
  ayahBackgrounds: any;
  openPremium: any;
  notify: any;
  /** Sure/ayet aralığı seçildiğinde stüdyo motoruna aktarır */
  onProduce: (sureNo: number, ayetBas: number, ayetSon: number) => void;
}

export const KendiSesModal: React.FC<Props> = ({
  open, onClose, sure, seciliAyetler, aktifSes, kayitlar, yukleniyor, isElit, nefes,
  yukle, yukleAyetAyri, sec, sil, zamanlamaKaydet, kaldirAktif, yenidenTara,
  sureEkle, maksSn, maksAyarla,
  setPickingFor, setModal, ayahBackgrounds, openPremium, notify,
  onProduce,
}) => {
  const lang = (typeof localStorage !== "undefined" ? (localStorage.getItem("nur_lang") || "tr") : "tr") as Lang;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden border border-slate-700" onClick={(e) => e.stopPropagation()}>
        <KendiSesPanel lang={lang} onProduce={onProduce} onClose={onClose} />
      </div>
    </div>
  );
};
