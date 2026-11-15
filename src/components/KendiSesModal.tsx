import React from "react";
import { X } from "lucide-react";
import type { Lang } from "../i18n";
import type { KendiSesAktif } from "../studio/useKendiSes";
import type { StoredSes } from "../studio/sesDeposu";
import type { SesSegmenti } from "../studio/sesZamanlama";
import { translate } from "../i18n";
import { KendiSesStudiosu } from "./KendiSesStudiosu";
import type { Clip } from "../clips";

const ttX2610 = (k: string): string => translate(typeof localStorage !== "undefined" ? (localStorage.getItem("nur_lang") || "tr") : "tr", k);

interface Props {
  open: boolean;
  onClose: () => void;
  sure: number;
  seciliAyetler: Array<{ s: number; a: number; sName?: string }>;
  aktifSes: KendiSesAktif | null;
  kayitlar: StoredSes[];
  yukleniyor: boolean;
  isElit: boolean;
  nefes: number;
  yukle: (dosya: File, sure: number, ayetSayisi: number, konum: "tum" | number, maksSn?: number) => Promise<unknown>;
  yukleAyetAyri: (dosya: File, sure: number, ayet: number) => Promise<boolean>;
  sec: (id: string) => Promise<boolean>;
  sil: (id: string) => Promise<void>;
  zamanlamaKaydet: (id: string, segments: SesSegmenti[], nefes?: number) => Promise<void>;
  kaldirAktif: () => void;
  yenidenTara: (id: string, ayetSayisi: number, maksSn?: number) => Promise<boolean>;
  sureEkle: (s: number) => Promise<void>;
  maksSn: number;
  maksAyarla: (sn: number) => void;
  setPickingFor: (id: string) => void;
  setModal: (m: "atmos" | null) => void;
  ayahBackgrounds: Record<string, Clip>;
  openPremium: (tab?: "uyelik" | "jeton") => void;
  notify: (msg: string) => void;
}

export const KendiSesModal: React.FC<Props> = ({
  open, onClose, sure, seciliAyetler, aktifSes, kayitlar, yukleniyor, isElit, nefes,
  yukle, yukleAyetAyri, sec, sil, zamanlamaKaydet, kaldirAktif, yenidenTara,
  sureEkle, maksSn, maksAyarla,
  setPickingFor, setModal, ayahBackgrounds, openPremium, notify,
}) => {
  const lang = (typeof localStorage !== "undefined" ? (localStorage.getItem("nur_lang") || "tr") : "tr") as Lang;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Kendi Sesinle Kur'an</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <KendiSesStudiosu
            lang={lang}
            onCheckout={(code) => { openPremium("uyelik"); }}
            onProduce={(id) => { void sec(id); setModal(null); }}
          />
        </div>
      </div>
    </div>
  );
};
