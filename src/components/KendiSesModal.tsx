import React from "react";
import { X } from "lucide-react";
import type { Lang } from "../i18n";
import { translate } from "../i18n";
import { KendiSesPanel } from "./KendiSesPanel";
import type { StoredSes } from "../studio/sesDeposu";
import type { SesSegmenti } from "../studio/sesZamanlama";
import type { KendiSesAktif } from "../studio/useKendiSes";

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
  yukle: (dosya: File, sure: number, ayetSayisi: number, konum: "tum" | number, maksSn?: number) => Promise<{ segments: SesSegmenti[]; id: string; total: number } | null>;
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
  ayahBackgrounds: Record<string, any>;
  openPremium: (tab?: "uyelik" | "jeton", hedefTier?: "pro" | "elit") => void;
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
      <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden border border-slate-700" onClick={(e) => e.stopPropagation()}>
        <KendiSesPanel
          lang={lang}
          onClose={onClose}
          yukle={yukle}
          sec={sec}
          zamanlamaKaydet={zamanlamaKaydet}
          kayitlar={kayitlar}
          aktifSes={aktifSes}
          yukleniyor={yukleniyor}
          isElit={isElit}
          nefes={nefes}
          maksSn={maksSn}
          maksAyarla={maksAyarla}
          yenidenTara={yenidenTara}
          sureEkle={sureEkle}
          notify={notify}
          ayahBackgrounds={ayahBackgrounds}
        />
      </div>
    </div>
  );
};
