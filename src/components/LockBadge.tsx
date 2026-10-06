import React, { useState } from "react";
import { Lock, Gem, Sparkles, Crown } from "lucide-react";
// ★ 06.10 i18n: rozet etiketleri + tooltip'ler seçili dilde (paylaş akışı dil turunda
//   "ELİT"/"Elit Üyelik Gerekir" TR kalmıştı — dict anahtarları lock*).
import { translate } from "../i18n";

export type LockKind = "pro" | "elit" | "v2" | "v3" | "maintenance";

interface LockBadgeProps {
  kind: LockKind;
  /** Tıklanınca çağrılır. v2/v3 için verilmezse tıklama no-op olur */
  onUpgrade?: () => void;
  /** Rozetin köşedeki konumu */
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  /** Tooltip metni override */
  tooltipText?: string;
  /** Parent relative mi? default true */
  size?: "sm" | "md";
}

const KIND_META: Record<LockKind, {
  icon: React.ElementType;
  gradient: string;
  glow: string;
  clickable: boolean;
}> = {
  pro:  { icon: Gem,      gradient: "linear-gradient(135deg,#f5dda6 0%,#d7aa52 100%)", glow: "rgba(215,170,82,.55)",  clickable: true },
  elit: { icon: Crown,    gradient: "linear-gradient(135deg,#e8d48a 0%,#8b6914 50%,#d7aa52 100%)", glow: "rgba(232,212,138,.7)", clickable: true },
  v2:   { icon: Sparkles, gradient: "linear-gradient(135deg,#9ca3af 0%,#4b5563 100%)", glow: "rgba(156,163,175,.4)", clickable: false },
  v3:   { icon: Lock,     gradient: "linear-gradient(135deg,#9ca3af 0%,#4b5563 100%)", glow: "rgba(156,163,175,.4)", clickable: false },
  maintenance: { icon: Lock, gradient: "linear-gradient(135deg,#ffe58a 0%,#f5b400 100%)", glow: "rgba(255,196,44,.65)", clickable: false },
};

const LOCK_LABEL_KEY: Record<LockKind, string> = {
  pro: "lockProLabel", elit: "lockElitLabel", v2: "lockV2Label", v3: "lockV3Label", maintenance: "lockMaintenanceLabel",
};
const LOCK_TOOLTIP_KEY: Record<LockKind, string> = {
  pro: "lockProTooltip", elit: "lockElitTooltip", v2: "lockV2Tooltip", v3: "lockV3Tooltip", maintenance: "lockMaintenanceTooltip",
};
/** Seçili dilde çeviri — nur_lang localStorage (AnnouncementBar deseni) */
const lockT = (key: string): string => translate(localStorage.getItem("nur_lang"), key);

const POSITION_CLASS: Record<NonNullable<LockBadgeProps["position"]>, string> = {
  "top-right":    "top-1.5 right-1.5",
  "top-left":     "top-1.5 left-1.5",
  "bottom-right": "bottom-1.5 right-1.5",
  "bottom-left":  "bottom-1.5 left-1.5",
};

/**
 * LockBadge — her kilitli butonun köşesindeki rozet + hover tooltip.
 * Tıklanınca (pro/elit ise) onUpgrade çağrılır; v2/v3 tıklanamaz.
 */
export const LockBadge: React.FC<LockBadgeProps> = ({
  kind,
  onUpgrade,
  position = "top-right",
  tooltipText,
  size = "sm",
}) => {
  const [hover, setHover] = useState(false);
  const meta = KIND_META[kind];
  const Icon = meta.icon;
  const label = lockT(LOCK_LABEL_KEY[kind]);
  const tooltip = tooltipText ?? lockT(LOCK_TOOLTIP_KEY[kind]);
  const yakinda = lockT("lockYakinda");
  const dim = size === "sm" ? "h-4 min-w-[20px] px-1" : "h-5 min-w-[26px] px-1.5";
  const iconSize = size === "sm" ? 8 : 10;
  const textSize = size === "sm" ? "text-[7px]" : "text-[8.5px]";

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (meta.clickable && onUpgrade) onUpgrade();
  };

  return (
    <span
      className={`pointer-events-auto absolute ${POSITION_CLASS[position]} z-20`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={handleClick}
      style={{ cursor: meta.clickable ? "pointer" : "default" }}
    >
      {/* Rozet */}
      <span
        className={`relative flex ${dim} items-center justify-center gap-0.5 rounded-md font-black tracking-wider text-black shadow-md transition-transform duration-200 ${textSize} ${hover && meta.clickable ? "scale-110" : ""}`}
        style={{
          background: meta.glow,
          boxShadow: `0 2px 8px ${meta.glow}, inset 0 1px 0 rgba(255,255,255,.35)`,
        }}
      >
        {/* İç gradient katman */}
        <span
          className="absolute inset-0 rounded-md"
          style={{ background: meta.gradient, opacity: 0.95 }}
        />
        <span className="relative flex items-center gap-0.5">
          <Icon size={iconSize} strokeWidth={3} />
          {label}
        </span>
      </span>

      {/* Hover tooltip */}
      {hover && (
        <span
          className={`pointer-events-none absolute ${
            position.includes("right") ? "right-0" : "left-0"
          } ${
            position.includes("top") ? "top-full mt-1.5" : "bottom-full mb-1.5"
          } z-30 whitespace-nowrap rounded-md px-2.5 py-1 text-[9.5px] font-black tracking-wide text-black shadow-xl animate-rise`}
          style={{
            background: meta.gradient,
            boxShadow: `0 4px 14px ${meta.glow}`,
          }}
        >
          {tooltip}
          {!meta.clickable && <span className="ml-1 opacity-70">· {yakinda}</span>}
        </span>
      )}
    </span>
  );
};

/**
 * LockedOverlay — bir butonun/bölgenin üstüne konan yarı saydam katman.
 * Tıklanınca onUpgrade çağrılır; kilitli görünüm verir ama hover'da rozet hala okunur.
 */
export const LockedOverlay: React.FC<{ kind: LockKind; onUpgrade?: () => void; rounded?: string }> = ({
  kind,
  onUpgrade,
  rounded = "rounded-xl",
}) => {
  const meta = KIND_META[kind];
  const label = lockT(LOCK_LABEL_KEY[kind]);
  const tooltip = lockT(LOCK_TOOLTIP_KEY[kind]);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (meta.clickable && onUpgrade) onUpgrade();
      }}
      className={`absolute inset-0 z-10 flex items-center justify-center ${kind === "maintenance" ? "bg-black/25" : "bg-black/35 backdrop-blur-[1px]"} transition-colors hover:bg-black/50 ${rounded} ${meta.clickable ? "cursor-pointer" : "cursor-not-allowed"}`}
      style={{ cursor: meta.clickable ? "pointer" : "not-allowed" }}
    >
      <span
        className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-black tracking-wider text-black shadow-lg"
        style={{ background: meta.gradient }}
      >
        <meta.icon size={10} strokeWidth={3} />
        {kind === "maintenance" ? label : tooltip}
      </span>
    </button>
  );
};
