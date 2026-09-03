import { useState, useEffect } from "react";
import { AlertTriangle, X, Shield } from "lucide-react";

interface TelifDisclaimerProps {
  onAccept?: () => void;
  reciterName?: string;
  telifRiski?: number;
}

/**
 * ★ Telif Uyarısı — Kullanıcıya telif riskini açıkça gösterir
 * Kâri seçildiğinde veya video oluşturulurken gösterilir.
 * KVKK/AB uyumlu: Kullanıcı bilgilendirilmeden video oluşturulamaz.
 */
export function TelifDisclaimer({ onAccept, reciterName, telifRiski }: TelifDisclaimerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Her oturumda bir kez göster
    const shown = sessionStorage.getItem("telif_disclaimer_shown");
    if (!shown) {
      setVisible(true);
      sessionStorage.setItem("telif_disclaimer_shown", "1");
    }
  }, []);

  if (!visible) return null;

  const riskColor = (telifRiski ?? 0) > 25 ? "#ef4444" : (telifRiski ?? 0) > 10 ? "#f59e0b" : "#10b981";
  const riskLabel = (telifRiski ?? 0) > 25 ? "Yüksek" : (telifRiski ?? 0) > 10 ? "Orta" : "Düşük";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative max-w-md w-full rounded-2xl border border-amber-500/30 bg-gradient-to-b from-gray-900 to-gray-950 p-6 shadow-2xl">
        <button
          onClick={() => { setVisible(false); onAccept?.(); }}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10 transition"
        >
          <X size={16} className="text-white/50" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-amber-500/20">
            <AlertTriangle size={24} className="text-amber-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">Telif Hakkı Uyarısı</h3>
            <p className="text-white/50 text-xs">Dikkatlice okuyun</p>
          </div>
        </div>

        <div className="space-y-3 text-sm text-white/70">
          <p>
            Bu uygulama <span className="text-white font-semibold">everyayah.com</span> kütüphanesinden alınan
            Kur'an ses kayıtlarını kullanmaktadır.
          </p>
          <p>
            <span className="font-semibold text-white">Önemli:</span> Ses kayıtları telif hakkı koruması altındadır.
            YouTube veya diğer platformlara yüklediğinizde{" "}
            <span className="text-amber-400 font-semibold">Content ID telif uyarısı</span> alabilirsiniz.
          </p>
          {reciterName && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
              <Shield size={14} className="text-white/40" />
              <span className="text-xs">
                Seçili kâri: <span className="text-white font-semibold">{reciterName}</span>
                {telifRiski !== undefined && (
                  <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: riskColor + "20", color: riskColor }}>
                    Telif Riski: %{telifRiski} ({riskLabel})
                  </span>
                )}
              </span>
            </div>
          )}
          <p className="text-xs text-white/40">
            Telif yüzdeleri tahminidir, garanti değildir. YouTube Content ID ses parmak izi tarar
            ve yüzdelerden bağımsız olarak telif yiyebilirsiniz.
          </p>
        </div>

        <button
          onClick={() => { setVisible(false); onAccept?.(); }}
          className="mt-5 w-full py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold text-sm hover:bg-amber-500/30 transition"
        >
          Anladım, Devam Et
        </button>
      </div>
    </div>
  );
}
