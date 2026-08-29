// ════════════════════════════════════════════════════════
// AtmosphereCard.tsx — YER TUTUCU (BOZULMUŞ İNDİRME)
//
// ⚠️ Bu dosyanın orijinal içeriği indirme kanalından bozulmuş olarak
//    geldi (HTML ayrıştırıcı JSX'i bozdu) ve birebir kurtarılamadı.
//    Uygulamanın derlenebilmesi için bu dosya geçici bir yer tutucuyla
//    değiştirildi. Orijinal dosyayı şu adresten alabilirsin:
//    https://raw.githubusercontent.com/bayastley/Nurstusyo/main/src/components/AtmosphereCard.tsx
// ════════════════════════════════════════════════════════

import React from "react";

interface AtmosphereCardProps {
  clip?: any;
  active?: boolean;
  onHover?: (id: string | null) => void;
  onPick?: () => void;
}

export const AtmosphereCard: React.FC<AtmosphereCardProps> = ({ clip, active, onHover, onPick }) => {
  return (
    <div
      className={`atmo-card group relative aspect-video cursor-pointer overflow-hidden rounded-xl transition-transform duration-200 ${active ? "scale-[1.01] border-[color:var(--accent)] ring-2 ring-[color:var(--accent)]" : "border-white hover:border-white/30"}`}
      ref={undefined as any}
      onClick={onPick}
      onMouseEnter={() => onHover?.(clip?.id ?? null)}
      onMouseLeave={() => onHover?.(null)}
    >
      <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-[10px] text-white/50">
        {clip?.label ?? "Atmosfer kartı"}
      </div>
    </div>
  );
};

export default AtmosphereCard;
