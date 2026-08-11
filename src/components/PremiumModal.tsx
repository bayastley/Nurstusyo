import React, { useState } from "react";
import {
  X,
  Gem,
  Crown,
  Check,
  Sparkles,
  Coins,
  Star,
  Wallet,
} from "lucide-react";
import {
  PRICING,
  JETON_PAKETLERI,
  setCurrentTier,
  getJeton,
  addPurchasedJeton,
  type Tier,
} from "../tier";
import { getPaymentCopy } from "../i18n/paymentCopy";
import type { Lang } from "../i18n";

interface PremiumModalProps {
  onClose: () => void;
  initialTab?: "uyelik" | "jeton";
  currentTier?: Tier;
  onPurchase?: (tier: Tier) => void;
  onTokenPurchase?: (amount: number) => void;
  lang?: Lang;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({
  onClose,
  initialTab = "uyelik",
  currentTier = "free",
  onPurchase,
  onTokenPurchase,
  lang = "tr",
}) => {
  const copy = getPaymentCopy(lang);
  const proFeatures = Array.isArray(copy.proFeatures) ? copy.proFeatures : [];
  const elitFeatures = Array.isArray(copy.elitFeatures)
    ? copy.elitFeatures
    : [];
  const packageLabels = Array.isArray(copy.packageLabels)
    ? copy.packageLabels
    : [];
  const paketler = Array.isArray(JETON_PAKETLERI) ? [...JETON_PAKETLERI] : [];

  const proLocked = currentTier === "pro" || currentTier === "elit";
  const elitLocked = currentTier === "elit";
  const proLabel =
    currentTier === "pro"
      ? copy.currentPlan
      : currentTier === "elit"
        ? copy.elitAction
        : undefined;
  const elitLabel = currentTier === "elit" ? copy.currentPlan : undefined;

  const [tab, setTab] = useState<"uyelik" | "jeton">(initialTab);
  const [processing, setProcessing] = useState<string | null>(null);
  const [jeton, setJetonState] = useState<number>(() => getJeton());
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const handleSubscribe = async (tier: "pro" | "elit") => {
    if (tier === "pro" && proLocked) return;
    if (tier === "elit" && elitLocked) return;
    if (!termsAccepted) {
      setTermsOpen(true);
      return;
    }
    setProcessing(tier);
    window.setTimeout(() => {
      setCurrentTier(tier);
      onPurchase?.(tier);
      setProcessing(null);
      showToast(
        tier === "pro" ? "NÛR PRO aktif (demo)" : "NÛR ELİT aktif (demo)",
      );
      onClose();
    }, 700);
  };

  const handleBuyJeton = async (
    paket: (typeof JETON_PAKETLERI)[number],
  ) => {
    if (!termsAccepted) {
      setTermsOpen(true);
      return;
    }
    setProcessing(`jeton-${paket.jeton}`);
    window.setTimeout(() => {
      addPurchasedJeton(paket.jeton);
      setJetonState(getJeton());
      onTokenPurchase?.(paket.jeton);
      setProcessing(null);
      showToast(`+${paket.jeton} hizmet hakkı yüklendi (demo)`);
    }, 700);
  };

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center bg-black/85 p-3 backdrop-blur-md modal-in md:p-6"
      onMouseDown={onClose}
      onClick={onClose}
    >
      <div
        className="glass modal-in relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        style={{ border: "1px solid rgba(215,170,82,.25)" }}
      >
        <div
          className="relative h-24 shrink-0 overflow-hidden"
          style={{
            background:
              "radial-gradient(ellipse at 20% 0%, rgba(215,170,82,.28), transparent 55%), radial-gradient(ellipse at 80% 0%, rgba(245,221,166,.22), transparent 55%), linear-gradient(180deg, #1a1408 0%, #0c0d12 100%)",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 z-10 rounded-full bg-black/40 p-1.5 text-white/60 transition hover:bg-black/60 hover:text-white"
            aria-label="Kapat"
          >
            <X size={16} />
          </button>

          <div className="absolute left-4 top-4">
            <span
              className="flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-black tabular-nums text-[color:var(--accent-2)] backdrop-blur-sm"
              style={{ border: "1px solid rgba(215,170,82,.3)" }}
            >
              <Wallet size={11} style={{ color: "var(--accent)" }} />
              {jeton}
              <span className="text-[8px] font-bold uppercase tracking-wider text-white/40">
                {copy.balance}
              </span>
            </span>
          </div>

          <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
            <div className="flex items-center gap-2 text-[9px] font-bold tracking-[0.28em] text-white/50">
              <span
                className="h-px w-8"
                style={{
                  background: "linear-gradient(90deg,transparent,var(--accent))",
                }}
              />
              NÛR STÜDYO
              <span
                className="h-px w-8"
                style={{
                  background: "linear-gradient(90deg,var(--accent),transparent)",
                }}
              />
            </div>
            <h2
              className="mt-1 font-display text-2xl font-black tracking-[.08em] md:text-3xl"
              style={{
                background:
                  "linear-gradient(110deg,#f5dda6 0%,#ffffff 40%,#d7aa52 70%,#f5dda6 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {copy.title}
            </h2>
          </div>
        </div>

        <div className="flex gap-2 border-b border-white/10 px-4 pt-3">
          {(
            [
              { id: "uyelik" as const, label: copy.membership, icon: Crown },
              { id: "jeton" as const, label: copy.energyTab, icon: Coins },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 rounded-t-xl px-4 py-2.5 text-xs font-bold transition ${
                tab === id
                  ? "bg-white/10 text-[color:var(--accent-2)]"
                  : "text-white/45 hover:text-white/80"
              }`}
              style={
                tab === id
                  ? { borderBottom: "2px solid var(--accent)" }
                  : { borderBottom: "2px solid transparent" }
              }
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        <div className="scrollbar-thin flex-1 overflow-y-auto p-4 md:p-6">
          {tab === "uyelik" ? (
            <div className="grid gap-4 md:grid-cols-[1fr_1.15fr]">
              <UyelikKarti
                icon={Gem}
                isim="NÛR PRO"
                altbaslik={proFeatures[0] ?? "Pro"}
                fiyatTL={PRICING.PRO.tl}
                ozellikler={proFeatures}
                vurgu={false}
                processing={processing === "pro"}
                onSec={() => handleSubscribe("pro")}
                actionLabel={copy.proAction}
                processingLabel={copy.processing}
                perMonthLabel={copy.perMonth}
                disabled={proLocked}
                disabledLabel={proLabel}
              />
              <UyelikKarti
                icon={Crown}
                isim="NÛR ELİT"
                altbaslik={elitFeatures[0] ?? "Elit"}
                fiyatTL={PRICING.ELIT.tl}
                ozellikler={elitFeatures}
                vurgu
                processing={processing === "elit"}
                onSec={() => handleSubscribe("elit")}
                actionLabel={copy.elitAction}
                processingLabel={copy.processing}
                perMonthLabel={copy.perMonth}
                disabled={elitLocked}
                disabledLabel={elitLabel}
              />
            </div>
          ) : (
            <div>
              <p className="mb-4 text-center text-[11px] text-white/55">
                {copy.intro}
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {paketler.map((p, i) => {
                  const vurgu = i === 2;
                  const busy = processing === `jeton-${p.jeton}`;
                  const label = packageLabels[i] ?? p.label;
                  return (
                    <button
                      key={p.code}
                      type="button"
                      disabled={busy}
                      onClick={() => handleBuyJeton(p)}
                      className={`group relative flex flex-col rounded-2xl p-4 text-left transition ${
                        vurgu
                          ? "shadow-lg shadow-[rgba(215,170,82,.15)]"
                          : "glass-soft hover:border-[color:var(--accent)]/40"
                      }`}
                      style={
                        vurgu
                          ? {
                              background:
                                "linear-gradient(160deg,rgba(215,170,82,.18),rgba(255,255,255,.04))",
                              border: "1px solid rgba(215,170,82,.45)",
                            }
                          : { border: "1px solid rgba(255,255,255,.08)" }
                      }
                    >
                      {vurgu && (
                        <span
                          className="absolute -top-2 right-3 rounded-full px-2 py-0.5 text-[8px] font-black tracking-wider text-black"
                          style={{
                            background:
                              "linear-gradient(135deg,var(--accent-2),var(--accent))",
                          }}
                        >
                          {copy.popular}
                        </span>
                      )}
                      <div className="mb-2 flex items-center gap-2">
                        <span
                          className="flex h-9 w-9 items-center justify-center rounded-xl"
                          style={{
                            background: vurgu
                              ? "linear-gradient(135deg,var(--accent-2),var(--accent))"
                              : "rgba(255,255,255,.06)",
                            color: vurgu ? "#000" : "var(--accent-2)",
                          }}
                        >
                          <Sparkles size={16} />
                        </span>
                        <div>
                          <div className="text-sm font-black text-white">
                            {p.jeton} ⚡
                          </div>
                          <div className="text-[10px] text-white/45">{label}</div>
                        </div>
                      </div>
                      <div className="mt-auto flex items-end justify-between pt-2">
                        <span className="text-lg font-black text-[color:var(--accent-2)]">
                          ₺{p.tl}
                        </span>
                        <span
                          className={`rounded-lg px-2.5 py-1 text-[10px] font-bold ${
                            busy ? "bg-white/10 text-white/50" : "text-black"
                          }`}
                          style={
                            busy
                              ? undefined
                              : {
                                  background:
                                    "linear-gradient(135deg,var(--accent-2),var(--accent))",
                                }
                          }
                        >
                          {busy ? copy.processing : copy.buy}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-white/10 px-4 py-3">
          <label className="flex cursor-pointer items-center justify-center gap-2 text-[9px] leading-relaxed text-white/55">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(event) => setTermsAccepted(event.target.checked)}
              className="accent-[var(--accent)]"
            />
            <span>
              {copy.accept}{" "}
              <button
                type="button"
                className="underline decoration-[color:var(--accent)]/50 underline-offset-2 hover:text-[color:var(--accent-2)]"
                onClick={(e) => {
                  e.preventDefault();
                  setTermsOpen(true);
                }}
              >
                {copy.termsTitle}
              </button>
            </span>
          </label>
        </div>
      </div>

      {termsOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md modal-in"
          onMouseDown={() => setTermsOpen(false)}
          onClick={() => setTermsOpen(false)}
        >
          <div
            className="glass relative w-full max-w-md rounded-2xl p-5 shadow-2xl"
            style={{ border: "1px solid rgba(215,170,82,.3)" }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <h4
              className="mb-3 font-display text-sm font-black tracking-wider"
              style={{ color: "var(--accent-2)" }}
            >
              {copy.termsTitle}
            </h4>
            <ul className="space-y-2 text-[10px] leading-relaxed text-white/65">
              {[
                "Satın alınan üyelik ve hizmet paketleri dijital ürün/hizmettir; teslim sonrası iade yapılmaz.",
                "Hizmet bakiyesi hesabına otomatik yüklenir ve üretimlerde anlık düşer.",
                "Üyelikler aylık yenilenir; iptal etmediğin sürece aktif kalır.",
                "Üretim iptal edilirse hizmet bakiyesi düşmez — sadece tamamlanan render ücretlenir.",
                "Hizmet/üyelik kötüye kullanımda durdurulabilir.",
                "Telif riski yüksek kârilerde platform itirazları kullanıcı sorumluluğundadır.",
              ].map((text) => (
                <li key={text} className="flex gap-2">
                  <span style={{ color: "var(--accent)" }}>•</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => {
                setTermsAccepted(true);
                setTermsOpen(false);
              }}
              className="mt-4 w-full rounded-xl py-2.5 text-xs font-black text-black"
              style={{
                background:
                  "linear-gradient(135deg,var(--accent-2),var(--accent))",
              }}
            >
              {copy.termsButton}
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-[110] -translate-x-1/2 rounded-full bg-black/80 px-4 py-2 text-xs font-bold text-[color:var(--accent-2)] shadow-lg backdrop-blur-md">
          {toast}
        </div>
      )}
    </div>
  );
};

const UyelikKarti: React.FC<{
  icon: typeof Gem;
  isim: string;
  altbaslik: string;
  fiyatTL: number;
  ozellikler: string[];
  vurgu: boolean;
  processing: boolean;
  onSec: () => void;
  actionLabel: string;
  processingLabel: string;
  perMonthLabel: string;
  disabled?: boolean;
  disabledLabel?: string;
}> = ({
  icon: Icon,
  isim,
  altbaslik,
  fiyatTL,
  ozellikler,
  vurgu,
  processing,
  onSec,
  actionLabel,
  processingLabel,
  perMonthLabel,
  disabled,
  disabledLabel,
}) => (
  <div
    className={`relative flex flex-col rounded-2xl p-5 ${
      vurgu ? "shadow-xl shadow-[rgba(215,170,82,.12)]" : "glass-soft"
    }`}
    style={
      vurgu
        ? {
            background:
              "linear-gradient(165deg,rgba(215,170,82,.2),rgba(12,13,18,.95) 45%)",
            border: "1px solid rgba(215,170,82,.45)",
          }
        : { border: "1px solid rgba(255,255,255,.08)" }
    }
  >
    {vurgu && (
      <span
        className="absolute -top-2.5 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full px-3 py-0.5 text-[9px] font-black tracking-wider text-black"
        style={{
          background: "linear-gradient(135deg,var(--accent-2),var(--accent))",
        }}
      >
        <Star size={10} /> ÖNERİLEN
      </span>
    )}

    <div className="mb-3 flex items-center gap-3">
      <span
        className="flex h-11 w-11 items-center justify-center rounded-xl text-black"
        style={{
          background: "linear-gradient(135deg,var(--accent-2),var(--accent))",
        }}
      >
        <Icon size={20} />
      </span>
      <div>
        <div className="font-display text-base font-black tracking-wide text-white">
          {isim}
        </div>
        <div className="text-[10px] text-white/45">{altbaslik}</div>
      </div>
    </div>

    <div className="mb-4 flex items-end gap-1">
      <span className="text-3xl font-black text-[color:var(--accent-2)]">
        ₺{fiyatTL}
      </span>
      <span className="mb-1 text-[11px] text-white/40">{perMonthLabel}</span>
    </div>

    <ul className="mb-5 flex-1 space-y-2">
      {ozellikler.map((f) => (
        <li key={f} className="flex items-start gap-2 text-[11px] text-white/75">
          <Check
            size={13}
            className="mt-0.5 shrink-0"
            style={{ color: "var(--accent-2)" }}
          />
          <span>{f}</span>
        </li>
      ))}
    </ul>

    <button
      type="button"
      disabled={disabled || processing}
      onClick={onSec}
      className="w-full rounded-xl py-2.5 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-60"
      style={
        disabled
          ? {
              background: "rgba(255,255,255,.08)",
              color: "rgba(255,255,255,.5)",
            }
          : {
              background:
                "linear-gradient(135deg,var(--accent-2),var(--accent))",
              color: "#000",
            }
      }
    >
      {disabled
        ? disabledLabel || actionLabel
        : processing
          ? processingLabel
          : actionLabel}
    </button>
  </div>
);

export default PremiumModal;
