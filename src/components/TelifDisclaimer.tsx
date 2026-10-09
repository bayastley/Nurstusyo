import { useState, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { telifUyarisiGerekli, telifUyarisiKabulEt } from "../telifUyari";
import { translate, type Lang } from "../i18n";

interface TelifDisclaimerProps {
  /** StudioApp üretim akışı "uyarı göster" işareti koyduğunda açılır (Video Üret anı) */
  tetik: number;
  /** ★ 5 DİL (09.10): seçili dilin sözlüğünden metin üretir — hardcoded TR kalktı */
  lang?: Lang | string | null;
  onAccept?: () => void;
}

/**
 * ★ Telif Uyarısı — Telif riskini açıkça gösterir (i18n: 5 dil)
 * SADECE İLK "Video Üret" basışında BİR KERE gösterilir (kalıcı kayıt);
 * site girişinde / sayfa açılışında ASLA çıkmaz. KVKK/AB uyumlu:
 * kullanıcı bilgilendirilmeden video oluşturulamaz.
 * ★ SORUMLULUK MADDESİ: "yayın sorumluluğu üreticidedir" cümlesi eklendi —
 *   legalBodyTos ile aynı hukuki duruş (platform sorumluluk kabul etmez).
 */
export function TelifDisclaimer({ tetik, lang, onAccept }: TelifDisclaimerProps) {
  const [visible, setVisible] = useState(false);
  const t = (key: string) => translate(lang, key);

  // Üretim akışından gelen tetik: uyarı daha önce kabul edilmemişse göster
  useEffect(() => {
    if (tetik > 0 && telifUyarisiGerekli()) {
      setVisible(true);
    }
  }, [tetik]);

  const kapat = () => {
    telifUyarisiKabulEt();
    setVisible(false);
    onAccept?.();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative max-w-md w-full rounded-2xl border border-amber-500/30 bg-gradient-to-b from-gray-900 to-gray-950 p-6 shadow-2xl" dir={lang === "ar" || lang === "ur" ? "rtl" : "ltr"}>
        <button
          onClick={kapat}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10 transition"
          aria-label="close"
        >
          <X size={16} className="text-white/50" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-amber-500/20">
            <AlertTriangle size={24} className="text-amber-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">{t("telifTitle")}</h3>
            <p className="text-white/50 text-xs">{t("telifReadCarefully")}</p>
          </div>
        </div>

        <div className="space-y-3 text-sm text-white/70">
          <p>{t("telifIntro")}</p>
          <p>
            <span className="font-semibold text-white">{t("telifImportantLabel")}:</span>{" "}
            {t("telifWarning")}
          </p>
          <p className="text-xs text-white/40">{t("telifFingerprint")}</p>
          <p className="text-xs text-white/40 border-t border-white/10 pt-3">
            {t("telifResponsibility")}
          </p>
        </div>

        <button
          onClick={kapat}
          className="mt-5 w-full py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold text-sm hover:bg-amber-500/30 transition"
        >
          {t("telifContinueBtn")}
        </button>
      </div>
    </div>
  );
}
