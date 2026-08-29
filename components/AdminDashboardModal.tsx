// ════════════════════════════════════════════════════════
// AdminDashboardModal.tsx — YER TUTUCU (BOZULMUŞ İNDİRME)
//
// ⚠️ Orijinal içerik indirme kanalında bozuldu (HTML ayrıştırıcı JSX'i
//    bozdu) ve birebir kurtarılamadı. Derlemenin bozulmaması için yer
//    tutucu kondu. Orijinal dosya:
//    https://raw.githubusercontent.com/bayastley/Nurstusyo/main/src/components/AdminDashboardModal.tsx
// ════════════════════════════════════════════════════════

import React from "react";

export const AdminDashboardModal: React.FC<any> = (props: any) => {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 p-3 md:p-6 backdrop-blur-md modal-in">
      <div className="glass modal-in relative flex max-h-[85vh] w-full max-w-4xl flex-col rounded-2xl shadow-2xl" style={{ border: "1px solid rgba(215,170,82,.4)" }}>
        <div className="relative flex items-center justify-between border-b border-white/10 bg-black/40 px-5 py-4 shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-base font-black tracking-wider text-white">ADMIN YÖNETİM PANELİ</h3>
            <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2 py-0.5 text-[8px] font-black text-emerald-300">
              ŞİFRELİ KORUMALI
            </span>
          </div>
          <button type="button" onClick={() => props.onClose?.()} className="rounded-full bg-white/5 p-1.5 text-white/50 hover:text-white">
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 text-[10px] text-white/50 scrollbar-thin">
          AdminDashboardModal — orijinal içerik indirme kanalında bozuldu, yer tutucu kullanılıyor.
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardModal;
