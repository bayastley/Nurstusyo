// ════════════════════════════════════════════════════════
// LEGAL MODAL — KVKK, Kullanım Şartları, Gizlilik, İade
// ModalsContainer.tsx'den ayrıldı (boyut için)
// ════════════════════════════════════════════════════════

import React from "react";
import { X, Shield } from "lucide-react";
import { getPaymentCopy, type Lang } from "../i18n";

interface LegalModalProps {
  tosOpen: boolean;
  setTosOpen: (v: boolean) => void;
  legalTab: "tos" | "kvkk" | "gizlilik" | "iade";
  setLegalTab: (t: "tos" | "kvkk" | "gizlilik" | "iade") => void;
  lang: Lang;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  tosOpen,
  setTosOpen,
  legalTab,
  setLegalTab,
  lang,
}) => {
  if (!tosOpen) return null;

  const copy = getPaymentCopy(lang);

  const tabs = [
    { id: "tos", label: copy.legalTabs.tos },
    { id: "kvkk", label: copy.legalTabs.kvkk },
    { id: "gizlilik", label: copy.legalTabs.privacy },
    { id: "iade", label: copy.legalTabs.refund },
  ] as const;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md modal-in"
      onMouseDown={() => setTosOpen(false)}
      onClick={() => setTosOpen(false)}
    >
      <div
        className="glass modal-in relative flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl p-6 shadow-2xl"
        style={{ border: "1px solid rgba(215,170,82,.35)" }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setTosOpen(false)}
          className="absolute right-3 top-3 rounded-full bg-white/5 p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white"
          aria-label="Kapat"
        >
          <X size={16} />
        </button>

        <div className="mb-3 flex items-center gap-2">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-black"
            style={{
              background: "linear-gradient(135deg,var(--accent-2),var(--accent))",
            }}
          >
            <Shield size={18} />
          </span>
          <div>
            <h3
              className="font-display text-sm font-black tracking-wider"
              style={{ color: "var(--accent-2)" }}
            >
              {copy.legalTitle}
            </h3>
            <p className="text-[9.5px] text-white/40">{copy.legalSubtitle}</p>
          </div>
        </div>

        {/* Legal Tabs */}
        <div className="mb-3 flex flex-wrap gap-1 border-b border-white/10 pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setLegalTab(tab.id)}
              className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition ${
                legalTab === tab.id
                  ? "text-black shadow-md"
                  : "glass-soft text-white/50 hover:text-white"
              }`}
              style={
                legalTab === tab.id
                  ? {
                      background:
                        "linear-gradient(135deg,var(--accent-2),var(--accent))",
                    }
                  : undefined
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto pr-1 text-[11px] leading-relaxed text-white/80">
          {legalTab === "tos" && <LegalPanel text={copy.legalBody.tos} />}
          {legalTab === "kvkk" && <LegalPanel text={copy.legalBody.kvkk} />}
          {legalTab === "gizlilik" && (
            <LegalPanel text={copy.legalBody.privacy} />
          )}
          {legalTab === "iade" && <LegalPanel text={copy.legalBody.refund} />}
        </div>
      </div>
    </div>
  );
};

const LegalPanel: React.FC<{ text: string }> = ({ text }) => (
  <div className="rounded-xl border border-[color:var(--accent)]/30 bg-black/40 p-4">
    <p className="leading-relaxed text-white/90">{text}</p>
    <p className="mt-4 text-[10px] text-white/40">support@nurstudyo.com</p>
  </div>
);
