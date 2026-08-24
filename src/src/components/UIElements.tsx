import React from "react";
import { Lock, X } from "lucide-react";

interface SectionTitleProps {
  icon: React.ElementType;
  title: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ icon: Icon, title }) => {
  return (
    <div className="mb-3 flex items-center gap-2 border-b border-white/5 pb-2">
      <div
        className="flex h-6 w-6 items-center justify-center rounded-lg"
        style={{ background: "rgba(255, 255, 255, 0.05)", color: "var(--accent)" }}
      >
        <Icon size={13} />
      </div>
      <h2 className="font-display text-[12px] font-bold tracking-wider text-white/90">
        {title}
      </h2>
    </div>
  );
};

export const LockTip: React.FC<{ label?: string }> = ({ label = "V2 Güncellemesi Yakında" }) => {
  return (
    <span
      className="pointer-events-none absolute -top-6 left-1/2 z-30 -translate-x-1/2 select-none whitespace-nowrap rounded-md px-2 py-1 text-[9px] font-black text-black shadow-lg"
      style={{ background: "linear-gradient(135deg, var(--accent-2), var(--accent))" }}
    >
      {label}
    </span>
  );
};

interface SegmentedProps<T extends string = string> {
  value: T;
  onChange: (val: T) => void;
  items: Array<{
    id: T;
    label: string;
    icon?: React.ElementType;
    sub?: string;
  }>;
  isLocked?: (id: T) => boolean;
  onLocked?: (id: T) => void;
  lockLabel?: (id: T) => string;
}

export function Segmented<T extends string>({
  value,
  onChange,
  items,
  isLocked,
  onLocked,
  lockLabel,
}: SegmentedProps<T>) {
  const [activeLockTip, setActiveLockTip] = React.useState<string | null>(null);

  return (
    <div className="glass-soft flex w-full rounded-xl p-1 gap-1">
      {items.map((item) => {
        const active = item.id === value;
        const locked = isLocked ? isLocked(item.id) : false;
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            onClick={() => {
              if (locked) {
                setActiveLockTip(item.id);
                onLocked?.(item.id);
                return;
              }
              onChange(item.id);
            }}
            onMouseEnter={() => {
              if (locked) setActiveLockTip(item.id);
            }}
            onMouseLeave={() => {
              if (locked) setActiveLockTip((prev) => (prev === item.id ? null : prev));
            }}
            className={`relative flex-1 flex flex-col items-center justify-center rounded-lg py-2 px-1 text-[10px] font-bold transition-all ${
              active
                ? "text-black shadow-md"
                : locked
                ? "text-white/30 cursor-not-allowed"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
            style={
              active
                ? { background: "linear-gradient(135deg, var(--accent-2), var(--accent))" }
                : undefined
            }
          >
            {locked && activeLockTip === item.id ? <LockTip label={lockLabel?.(item.id)} /> : null}

            <div className="flex items-center gap-1.5">
              {Icon && <Icon size={12} className={active ? "text-black" : undefined} />}
              <span>{item.label}</span>
              {locked && <Lock size={10} className="text-white/40 ml-0.5" />}
            </div>

            {item.sub && (
              <span className={`text-[8px] font-normal mt-0.5 ${active ? "text-black/70" : "text-white/30"}`}>
                {item.sub}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

interface ModalProps {
  title: string;
  sub?: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  title,
  sub,
  onClose,
  children,
  wide = false,
}) => {
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
      onMouseDown={onClose}
    >
      <div
        className={`glass modal-in relative w-full max-h-[85vh] flex flex-col rounded-2xl p-5 shadow-2xl ${
          wide ? "max-w-4xl" : "max-w-lg"
        }`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-3 mb-4">
          <div>
            <h3 className="font-display text-base font-bold text-white" style={{ color: "var(--accent-2)" }}>
              {title}
            </h3>
            {sub && <p className="text-[10px] text-white/50 mt-0.5">{sub}</p>}
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin pr-1">
          {children}
        </div>
      </div>
    </div>
  );
};
