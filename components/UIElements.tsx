// ════════════════════════════════════════════════════════
// UIElements.tsx — YER TUTUCU (BOZULMUŞ İNDİRME)
//
// ⚠️ Bu dosyanın orijinal içeriği indirme kanalından bozulmuş olarak
//    geldi (HTML ayrıştırıcı JSX'i bozdu) ve birebir kurtarılamadı.
//    Diğer bileşenlerin (DesignSettingsPanel vb.) import edebilmesi
//    için burada ortak isimler yer tutucu olarak tanımlandı.
//    Orijinal dosyayı şu adresten alabilirsin:
//    https://raw.githubusercontent.com/bayastley/Nurstusyo/main/src/components/UIElements.tsx
// ════════════════════════════════════════════════════════

import React from "react";

export const SectionTitle: React.FC<any> = ({ icon: Icon, title, sub }: any) => (
  <div className="mb-2.5 flex items-center gap-2">
    {Icon && <Icon size={13} style={{ color: "var(--accent)" }} />}
    <h3 className="font-display text-[11px] font-black uppercase tracking-wider text-white/90">{title}</h3>
    {sub ? <span className="text-[9px] text-white/40">{sub}</span> : null}
  </div>
);

export const Segmented: React.FC<any> = ({ value, onChange, items, className }: any) => (
  <div className={`flex rounded-xl bg-black/30 p-1 ${className ?? ""}`}>
    {(items ?? []).map((item: any) => (
      <button
        key={item.id}
        type="button"
        onClick={() => onChange?.(item.id)}
        className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[9.5px] font-bold transition ${
          value === item.id
            ? "bg-gradient-to-br from-[var(--accent-2)] to-[var(--accent)] text-black shadow"
            : "text-white/50 hover:text-white"
        }`}
      >
        {item.icon ? <item.icon size={11} /> : null}
        {item.label}
      </button>
    ))}
  </div>
);

export const Modal: React.FC<any> = ({ title, sub, onClose, children, wide }: any) => (
  <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md" onClick={onClose}>
    <div
      className={`glass modal-in relative flex max-h-[85vh] w-full flex-col rounded-2xl shadow-2xl ${wide ? "max-w-4xl" : "max-w-lg"}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <h3 className="font-display text-sm font-black text-white">{title}</h3>
          {sub ? <p className="text-[9.5px] text-white/40">{sub}</p> : null}
        </div>
        <button type="button" onClick={onClose} className="rounded-full bg-white/5 p-1.5 text-white/50 hover:text-white">
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-5">{children}</div>
    </div>
  </div>
);

export default UIElements;
function UIElements() {
  return null;
}
