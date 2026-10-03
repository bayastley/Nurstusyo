// ════════════════════════════════════════════════════════
// PREMIUMBOLUMLER.TSX — PremiumModal alt bileşenleri
// PremiumModal.tsx'den ayrıldı (SRP adım 3b, 30.09)
// Kota göstergesi + Satın alınan paketler + Satın alma sözleşmesi
// ════════════════════════════════════════════════════════

import React from "react";
import {
  PACKAGE_GROUP_META,
  type VideoKind,
} from "../payments/pricing";
import { getQuotaLeft, type Tier } from "../tier";
import { translate } from "../i18n";
import { TIER_LABEL, TIER_LABEL_TR } from "./premiumModalHelpers";

type Rights = { kisa: number; uzun: number; tam: number };

// ── 1) GÜNLÜK KOTA GÖSTERGESİ ────────────────────────────
export function PremiumKotaGostergesi({
  activeTier,
  remainingDays,
  packRightsProp,
  dil = "tr",
}: {
  activeTier: Tier;
  remainingDays: number | null;
  packRightsProp?: Rights;
  dil?: string;
}) {
  const t = (k: string): string => translate(dil, k);
  return (
    <div className="mx-7 mt-5 rounded-2xl border border-white/10 bg-black/40 p-4">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-wider text-white/50">
          {t("kalanHaklarin")}
        </span>
        <span
          className="rounded-full px-2.5 py-0.5 text-[9px] font-black text-black"
          style={{ background: "linear-gradient(135deg,#f5dda6,#d7aa52)" }}
        >
          {TIER_LABEL_TR[dil]?.[activeTier] ?? TIER_LABEL[activeTier]}{remainingDays != null ? t("kalanGun").replace("{n}", String(remainingDays)) : ""}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {(["kisa", "uzun", "tam"] as VideoKind[]).map((kind) => {
          const meta = PACKAGE_GROUP_META[kind];
          const quotaLeft = getQuotaLeft(kind, activeTier);
          const packRight = (packRightsProp ?? {})[kind] || 0;
          const total = quotaLeft + packRight;
          return (
            <div key={kind} className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-center">
              <p className="text-[15px]">{meta.emoji}</p>
              <p className="mt-0.5 text-[9px] font-bold text-white/45">{t(`pk${kind.charAt(0).toUpperCase()}${kind.slice(1)}Label`)}</p>
              <p className="mt-1 font-mono text-[14px] font-black" style={{ color: meta.accent }}>
                {total}
              </p>
              <p className="mt-0.5 text-[8px] font-bold text-white/25">
                {quotaLeft > 0 && packRight > 0
                  ? t("kotaUyelikPaket").replace("{u}", String(quotaLeft)).replace("{p}", String(packRight))
                  : quotaLeft > 0
                    ? t("kotaUyelik").replace("{n}", String(quotaLeft))
                    : packRight > 0
                      ? t("kotaPaket").replace("{n}", String(packRight))
                      : t("kotaYok")
                }
              </p>
            </div>
          );
        })}
      </div>
      <p className="mt-2.5 text-center text-[9px] text-white/30">
        {t("kotaYenilenmeNot")}
      </p>
    </div>
  );
}

// ── 2) SATIN ALINAN PAKETLER ─────────────────────────────
export function PremiumAlinanPaketler({ packRightsProp, dil = "tr" }: { packRightsProp?: Rights; dil?: string }) {
  const t = (k: string): string => translate(dil, k);
  const pr = packRightsProp ?? { kisa: 0, uzun: 0, tam: 0 };
  const hasAny = (pr.kisa || 0) > 0 || (pr.uzun || 0) > 0 || (pr.tam || 0) > 0;
  if (!hasAny) return null;
  return (
    <div className="mx-7 mt-4 rounded-2xl border border-[color:var(--accent)]/20 bg-[color:var(--accent)]/5 p-4">
      <p className="mb-3 text-[10px] font-black uppercase tracking-wider text-[color:var(--accent)]">
        {t("satinAlinanPaketler")}
      </p>
      <div className="space-y-2">
        {pr.kisa > 0 && (
          <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
            <span className="text-[10px] font-bold text-white/70">{t("paketKisaVideo")}</span>
            <span className="font-mono text-[12px] font-black text-green-400">{t("paketHakKaldi").replace("{n}", String(pr.kisa))}</span>
          </div>
        )}
        {pr.uzun > 0 && (
          <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
            <span className="text-[10px] font-bold text-white/70">{t("paketUzunVideo")}</span>
            <span className="font-mono text-[12px] font-black text-blue-400">{t("paketHakKaldi").replace("{n}", String(pr.uzun))}</span>
          </div>
        )}
        {pr.tam > 0 && (
          <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
            <span className="text-[10px] font-bold text-white/70">{t("paketTamSurum")}</span>
            <span className="font-mono text-[12px] font-black text-purple-400">{t("paketHakKaldi").replace("{n}", String(pr.tam))}</span>
          </div>
        )}
      </div>
      <p className="mt-2 text-center text-[8px] text-white/25">{t("paketHaklarNot")}</p>
    </div>
  );
}

// ── 3) SATIN ALMA ONAYI + SÖZLEŞME ───────────────────────
export function PremiumSozlesme({
  accepted,
  setAccepted,
  termsOpen,
  setTermsOpen,
  termsHighlight,
  termsRef,
  dil = "tr",
}: {
  accepted: boolean;
  setAccepted: (v: boolean) => void;
  termsOpen: boolean;
  setTermsOpen: (v: boolean) => void;
  termsHighlight: boolean;
  termsRef: React.RefObject<HTMLDivElement | null>;
  dil?: string;
}) {
  const t = (k: string): string => translate(dil, k);
  return (
    <>
      <div
        ref={termsRef}
        className={`mt-5 rounded-2xl border p-4 transition-all duration-500 ${
          termsHighlight
            ? "border-[color:var(--accent)] bg-[color:var(--accent)]/15 shadow-[0_0_20px_rgba(215,170,82,0.3)]"
            : "border-white/10 bg-white/[0.03]"
        }`}
      >
        <label className="flex cursor-pointer items-start gap-2 text-[10px] leading-relaxed text-white/50">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 accent-[#d7aa52]"
          />
          <span>
            {t("sozlesmeOnay")}
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                setTermsOpen(!termsOpen);
              }}
              className="ml-1 font-black underline decoration-[color:var(--accent)]/60 underline-offset-2 transition hover:text-white"
            >
              {t("sozlesmeOku")}
            </button>
          </span>
        </label>
      </div>

      {termsOpen && (
        <div className="mt-3 max-h-44 overflow-y-auto rounded-2xl border border-[color:var(--accent)]/25 bg-black/45 p-4 text-[10px] leading-relaxed text-white/70 scrollbar-thin">
          <p className="font-black text-white">{t("sozlesmeBaslik")}</p>
          <p className="mt-2">{t("sozlesmeP1")}</p>
          <p className="mt-2">{t("sozlesmeP2")}</p>
          <p className="mt-2">{t("sozlesmeP3")}</p>
          <p className="mt-2">{t("sozlesmeP4")}</p>
          <p className="mt-2 text-white/45">{t("sozlesmeP5")}</p>

          <div className="mt-3 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-center">
            <p className="text-[10px] font-bold text-white/70 tracking-wide">{t("sozlesmeIyzico")}</p>
            <p className="mt-1 text-[9px] text-white/40">Mastercard · Visa · American Express · Troy</p>
            <p className="mt-1 text-[9px] text-white/30">{t("sozlesmePci")}</p>
          </div>

          <p className="mt-3 text-[10px] text-white/55">
            {t("sozlesmeDestek")} <a href="mailto:destek@nurstudyo.com" className="underline decoration-white/20 underline-offset-2 hover:text-white">destek@nurstudyo.com</a>
          </p>
        </div>
      )}

      <p className="mt-3 text-center text-[9px] text-white/25">
        {t("sozlesmeAltNot")}
      </p>
    </>
  );
}
