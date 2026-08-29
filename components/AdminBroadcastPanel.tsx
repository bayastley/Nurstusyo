// ════════════════════════════════════════════════════════
// AdminBroadcastPanel.tsx — YER TUTUCU (BOZULMUŞ İNDİRME)
//
// ⚠️ Orijinal içerik indirme kanalında bozuldu (HTML ayrıştırıcı JSX'i
//    bozdu) ve birebir kurtarılamadı. Derlemenin bozulmaması için yer
//    tutucu kondu. Orijinal dosya:
//    https://raw.githubusercontent.com/bayastley/Nurstusyo/main/src/components/AdminBroadcastPanel.tsx
// ════════════════════════════════════════════════════════

import React from "react";

export const AdminBroadcastPanel: React.FC<{ notify?: (msg: string) => void }> = ({ notify }) => {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-[10px] text-white/50">
        AdminBroadcastPanel — orijinal içerik indirme kanalında bozuldu, yer tutucu kullanılıyor.
      </div>
    </section>
  );
};

export default AdminBroadcastPanel;
