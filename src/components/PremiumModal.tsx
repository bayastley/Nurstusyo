import React, { useState, useRef } from "react";
import { Crown, Gem, Check, X, Sparkles, Zap, Flame, Star } from "lucide-react";
import {
  PRODUCTS,
  formatPrice,
  SUBSCRIPTION_CODES,
  ANNUAL_SUBSCRIPTION_CODES,
  PACKAGE_CODES,
  PACKAGE_GROUP_META,
  type VideoKind,
  type BillingPeriod,
} from "../payments/pricing";
import { getPackRights, getQuotaLeft, getCurrentTier } from "../tier";
import type { Tier } from "../tier";
import type { PremiumModalProps, PremiumTab } from "./premiumModalHelpers";
import { DAILY_QUOTA, TIER_LABEL, emptyRights, readPackRights, PRO_FEATURES, ELIT_FEATURES } from "./premiumModalHelpers";


export const PremiumModal: React.FC<PremiumModalProps> = ({
  open = true,
  setOpen,
  tier,
  onCheckout,
  notify,
  initialTab,
  premiumTab,
  currentTier,
  onClose,
  onPurchase,
  onTokenPurchase,
  setTier,
  setCurrentTier,
  user,
  packRights: packRightsProp,
  subscriptionEndsAt,
}) => {
  // ★ Eski "jeton" sekmesi → yeni "paket" sekmesi
  const wanted = premiumTab ?? initialTab ?? "uyelik";
  const normalized: "uyelik" | "paket" = wanted === "uyelik" ? "uyelik" : "paket";
  const hasGmailLogin = Boolean(user?.email || user?.googleId);

  const [tab, setTab] = useState<"uyelik" | "paket">(normalized);
  const [period, setPeriod] = useState<BillingPeriod>("monthly");
  const [packKind, setPackKind] = useState<VideoKind>("kisa");
  const [accepted, setAccepted] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [termsHighlight, setTermsHighlight] = useState(false);
  const termsRef = useRef<HTMLDivElement>(null);
  const activeTier: Tier = tier ?? currentTier ?? "free";

  // ★ Abonelik kalan gün sayısı
  const remainingDays = (() => {
    if (!subscriptionEndsAt || activeTier === "free") return null;
    const end = new Date(subscriptionEndsAt);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  })();

  const closeModal = () => {
    setOpen?.(false);
    onClose?.();
  };
  const toast = (msg: string) => notify?.(msg);

  if (!open) return null;

  const rights = packRightsProp ?? { kisa: 0, uzun: 0, tam: 0 };

  const handleBuy = (code: string) => {
    if (!accepted) {
      setTermsOpen(true);
      // ★ Sözleşme bölümüne scroll et ve vurgula
      setTimeout(() => {
        termsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        setTermsHighlight(true);
        setTimeout(() => setTermsHighlight(false), 2500);
      }, 100);
      toast("⚠️ Satın alma koşullarını kabul etmeniz gerekiyor");
      return;
    }

    const targetProduct = PRODUCTS[code];

    // ★ Gmail girişi zorunlu: Elit/Pro üyelik veren HER ürün için geçerli
    //   (aylık, yıllık ve ömür boyu dahil — sadece SUB_*_1M değil).
    if (!hasGmailLogin && targetProduct?.grantTier) {
      toast("⚠️ NÛR PRO/ELİT satın almak için önce Google ile giriş yapmalısınız");
      return;
    }

    // ★ Mevcut tier kontrolü — aynı tier'da uyarı göster (süre uzatılacak)
    if (targetProduct?.grantTier && activeTier === targetProduct.grantTier) {
      toast("ℹ️ Mevcut üyeliğiniz uzatılacak — kalan sürenizin üzerine eklenecek");
    }

    // Ödeme akışı bağlıysa oraya git
    if (onCheckout) {
      onCheckout(code);
      return;
    }

    // Bağlı değilse (eski akış) üyeliği doğrudan tanımla — tüm periyotlar
    // (aylık/yıllık/ömür boyu) aynı mantıkla grantTier üzerinden işlenir.
    if (targetProduct?.grantTier === "pro") {
      setTier?.("pro");
      setCurrentTier?.("pro");
      onPurchase?.("pro");
      toast("✅ NÛR PRO üyeliğin aktif edildi");
      closeModal();
      return;
    }
    if (targetProduct?.grantTier === "elit") {
      setTier?.("elit");
      setCurrentTier?.("elit");
      onPurchase?.("elit");
      toast("👑 NÛR ELİT üyeliğin aktif edildi · tüm kilitler açıldı");
      closeModal();
      return;
    }
    if (targetProduct?.videoCount) onTokenPurchase?.(targetProduct.videoCount);
    toast("Ödeme sayfasına yönlendiriliyorsun...");
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-xl"
      onMouseDown={closeModal}
    >
      {/* Arka plan ışıltısı */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full opacity-30 blur-[120px]"
          style={{ background: "radial-gradient(circle, #d7aa52, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-40 -right-40 h-[420px] w-[420px] rounded-full opacity-25 blur-[120px]"
          style={{ background: "radial-gradient(circle, #a855f7, transparent 70%)" }}
        />
      </div>

      <div
        className="modal-in relative my-8 w-full max-w-3xl overflow-hidden rounded-3xl shadow-2xl"
        style={{
          background: "linear-gradient(165deg, #14121c 0%, #0c0d12 55%, #100e18 100%)",
          border: "1px solid rgba(215,170,82,.35)",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Üst altın hat */}
        <div
          className="h-[3px] w-full"
          style={{ background: "linear-gradient(90deg, transparent, #f5dda6, #d7aa52, #f5dda6, transparent)" }}
        />

        <button
          type="button"
          onClick={closeModal}
          className="absolute right-4 top-5 z-20 rounded-full bg-white/5 p-2 text-white/40 transition hover:bg-white/10 hover:text-white"
          aria-label="Kapat"
        >
          <X size={16} />
        </button>

        {/* BAŞLIK */}
        <div className="relative px-7 pt-7 text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            <Sparkles size={14} className="animate-glow" style={{ color: "#d7aa52" }} />
            <span className="text-[10px] font-black uppercase tracking-[.32em]" style={{ color: "#d7aa52" }}>
              Nûr Stüdyo
            </span>
            <Sparkles size={14} className="animate-glow" style={{ color: "#d7aa52" }} />
          </div>
          <h2 className="shimmer-text font-display text-[26px] font-black tracking-wide sm:text-[32px]">
            ÜYELİK &amp; PAKETLER
          </h2>
          <p className="mx-auto mt-2 max-w-md text-[11px] leading-relaxed text-white/45">
            Her gün yenilenen üretim hakkıyla üret. Daha fazlası için tek seferlik paket al.
          </p>
        </div>

        {/* GÜNLÜK KOTA GÖSTERGESİ */}
        <div className="mx-7 mt-5 rounded-2xl border border-white/10 bg-black/40 p-4">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-white/50">
              Kalan Hakların
            </span>
            <span
              className="rounded-full px-2.5 py-0.5 text-[9px] font-black text-black"
              style={{ background: "linear-gradient(135deg,#f5dda6,#d7aa52)" }}
            >
              {TIER_LABEL[activeTier]}{remainingDays != null ? ` (${remainingDays} gün)` : ""}
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
                  <p className="mt-0.5 text-[9px] font-bold text-white/45">{meta.label}</p>
                  <p className="mt-1 font-mono text-[14px] font-black" style={{ color: meta.accent }}>
                    {total}
                  </p>
                  <p className="mt-0.5 text-[8px] font-bold text-white/25">
                    {quotaLeft > 0 && packRight > 0
                      ? `üyelik: ${quotaLeft} + paket: ${packRight}`
                      : quotaLeft > 0
                        ? `üyelik: ${quotaLeft}/gün`
                        : packRight > 0
                          ? `paket: ${packRight} hak`
                          : "hak yok"
                    }
                  </p>
                </div>
              );
            })}
          </div>
          <p className="mt-2.5 text-center text-[9px] text-white/30">
            Üyelik hakları her gün yenilenir · paket hakları süresizdir, kullandıkça azalır
          </p>
        </div>

        {/* SATIN ALINAN PAKETLER */}
        {(() => {
          const pr = packRightsProp ?? { kisa: 0, uzun: 0, tam: 0 };
          const hasAny = (pr.kisa || 0) > 0 || (pr.uzun || 0) > 0 || (pr.tam || 0) > 0;
          if (!hasAny) return null;
          return (
            <div className="mx-7 mt-4 rounded-2xl border border-[color:var(--accent)]/20 bg-[color:var(--accent)]/5 p-4">
              <p className="mb-3 text-[10px] font-black uppercase tracking-wider text-[color:var(--accent)]">
                📦 Satın Alınan Paketler
              </p>
              <div className="space-y-2">
                {pr.kisa > 0 && (
                  <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
                    <span className="text-[10px] font-bold text-white/70">🎬 Kısa Video (59sn)</span>
                    <span className="font-mono text-[12px] font-black text-green-400">{pr.kisa} hak kaldı</span>
                  </div>
                )}
                {pr.uzun > 0 && (
                  <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
                    <span className="text-[10px] font-bold text-white/70">🎞️ Uzun Video (600sn)</span>
                    <span className="font-mono text-[12px] font-black text-blue-400">{pr.uzun} hak kaldı</span>
                  </div>
                )}
                {pr.tam > 0 && (
                  <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
                    <span className="text-[10px] font-bold text-white/70">🎥 Tam Sürüm (45dk)</span>
                    <span className="font-mono text-[12px] font-black text-purple-400">{pr.tam} hak kaldı</span>
                  </div>
                )}
              </div>
              <p className="mt-2 text-center text-[8px] text-white/25">Haklar süresizdir, üretildikçe azalır</p>
            </div>
          );
        })()}

        {/* SEKMELER */}
        <div className="mx-7 mt-5 flex gap-1.5 rounded-2xl border border-white/10 bg-black/50 p-1.5">
          <button
            type="button"
            onClick={() => setTab("uyelik")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-[11px] font-black transition active:scale-[0.97] ${
              tab === "uyelik" ? "text-black shadow-lg" : "text-white/45 hover:text-white"
            }`}
            style={tab === "uyelik" ? { background: "linear-gradient(135deg,#f5dda6,#d7aa52)" } : undefined}
          >
            <Crown size={13} /> Aylık Üyelik
          </button>
          <button
            type="button"
            onClick={() => setTab("paket")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-[11px] font-black transition active:scale-[0.97] ${
              tab === "paket" ? "text-black shadow-lg" : "text-white/45 hover:text-white"
            }`}
            style={tab === "paket" ? { background: "linear-gradient(135deg,#f5dda6,#d7aa52)" } : undefined}
          >
            <Zap size={13} /> Tek Seferlik Paket
          </button>
        </div>

        {/* İÇERİK */}
        <div className="px-7 pb-7 pt-5">
          {tab === "uyelik" ? (
            <>
            {/* PERİYOT SEÇİCİ: Aylık / Yıllık (indirimli) */}
            <div className="mb-4 flex flex-wrap justify-center gap-1.5 rounded-2xl border border-white/10 bg-black/40 p-1.5">
              {([
                { id: "monthly" as BillingPeriod, label: "Aylık" },
                { id: "annual" as BillingPeriod, label: "Yıllık · %10-20 İndirim" },
              ]).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPeriod(opt.id)}
                  className={`rounded-xl px-3 py-2 text-[10.5px] font-black transition active:scale-[0.97] ${
                    period === opt.id ? "text-black shadow-lg" : "text-white/45 hover:text-white"
                  }`}
                  style={period === opt.id ? { background: "linear-gradient(135deg,#f5dda6,#d7aa52)" } : undefined}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="grid gap-3 lg:grid-cols-3">
              <div
                className="relative overflow-hidden rounded-2xl p-5 transition-transform hover:scale-[1.015]"
                style={{
                  background: "linear-gradient(160deg, rgba(52,211,153,.09), rgba(255,255,255,.02))",
                  border: "1px solid rgba(52,211,153,.22)",
                }}
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={18} style={{ color: "#34d399" }} />
                  <h3 className="font-display text-[15px] font-black tracking-wide text-white">ÜCRETSİZ</h3>
                </div>

                <div className="mt-3 flex items-end gap-1">
                  <span className="font-display text-[34px] font-black leading-none text-emerald-300">₺0</span>
                  <span className="mb-1 text-[10px] font-bold text-white/35">/ her zaman</span>
                </div>

                <ul className="mt-4 space-y-1.5">
                  {[
                    "Her gün 3 kısa video",
                    "Kısa video: 59 saniye",
                    "2 ücretsiz hoca sesi (Sudays + Husarî)",
                    "120 ücretsiz atmosfer seçeneği",
                    "10 ücretsiz tema",
                    "Temel başlık ve açıklama üretimi",
                    "Filigranlı önizleme ve üretim",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-[10.5px] leading-snug text-white/70">
                      <Check size={11} className="mt-0.5 shrink-0 text-emerald-300" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  disabled
                  className="mt-5 w-full rounded-xl bg-white/10 py-3 text-[12px] font-black text-white/45"
                >
                  Mevcut ücretsiz plan
                </button>
              </div>

              {(period === "annual" ? ANNUAL_SUBSCRIPTION_CODES : SUBSCRIPTION_CODES).map((code) => {
                const p = PRODUCTS[code];
                const isElit = p.grantTier === "elit";
                const features = isElit ? ELIT_FEATURES : PRO_FEATURES;
                const current = tier === p.grantTier;
                const periodLabel = period === "annual" ? "/ yıl" : "/ ay";

                return (
                  <div
                    key={code}
                    className="relative overflow-hidden rounded-2xl p-5 transition-transform hover:scale-[1.015]"
                    style={{
                      background: isElit
                        ? "linear-gradient(160deg, rgba(215,170,82,.16), rgba(139,105,20,.06))"
                        : "linear-gradient(160deg, rgba(255,255,255,.06), rgba(255,255,255,.02))",
                      border: isElit ? "1.5px solid rgba(232,212,138,.55)" : "1px solid rgba(255,255,255,.1)",
                      boxShadow: isElit ? "0 12px 40px rgba(215,170,82,.18)" : undefined,
                    }}
                  >
                    {isElit && (
                      <span
                        className="absolute right-4 top-4 flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-black text-black"
                        style={{ background: "linear-gradient(135deg,#f5dda6,#d7aa52)" }}
                      >
                        <Flame size={9} /> EN POPÜLER
                      </span>
                    )}

                    <div className="flex items-center gap-2">
                      {isElit ? (
                        <Crown size={18} style={{ color: "#f5dda6" }} />
                      ) : (
                        <Gem size={18} style={{ color: "#d7aa52" }} />
                      )}
                      <h3 className="font-display text-[15px] font-black tracking-wide text-white">
                        {isElit ? "NÛR ELİT" : "NÛR PRO"}
                      </h3>
                    </div>

                    <div className="mt-3 flex items-end gap-1">
                      <span
                        className="font-display text-[34px] font-black leading-none"
                        style={{ color: isElit ? "#f5dda6" : "#d7aa52" }}
                      >
                        {formatPrice(p)}
                      </span>
                      <span className="mb-1 text-[10px] font-bold text-white/35">{periodLabel}</span>
                    </div>
                    {period === "annual" && (
                      <p className="mt-1 text-[9.5px] font-bold" style={{ color: isElit ? "#f5dda6" : "#34d399" }}>
                        Aylık {formatPrice(PRODUCTS[isElit ? "SUB_ELIT_1M" : "SUB_PRO_1M"])} yerine ayda ortalama ₺{Math.round(p.amountMinor / 100 / 12)} · %{isElit ? 20 : 10} indirim
                      </p>
                    )}

                    <ul className="mt-4 space-y-1.5">
                      {features.map((f) => (
                        <li key={f} className="flex items-start gap-1.5 text-[10.5px] leading-snug text-white/70">
                          <Check size={11} className="mt-0.5 shrink-0" style={{ color: isElit ? "#f5dda6" : "#34d399" }} />
                          {f}
                        </li>
                      ))}
                    </ul>

                    {/* Günlük Kota Gridi */}
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {(["kisa", "uzun", "tam"] as VideoKind[]).map((kind) => {
                        const q = DAILY_QUOTA[p.grantTier ?? "free"]?.[kind] ?? 0;
                        const emoji = kind === "kisa" ? "🎬" : kind === "uzun" ? "🎞️" : "🎥";
                        const label = kind === "kisa" ? "Kısa" : kind === "uzun" ? "Uzun" : "Tam";
                        return (
                          <div key={kind} className="rounded-lg bg-white/5 p-2 text-center">
                            <p className="text-[10px]">{emoji}</p>
                            <p className="font-mono text-[13px] font-black" style={{ color: q > 0 ? (isElit ? "#f5dda6" : "#d7aa52") : "rgba(255,255,255,0.2)" }}>
                              {q > 0 ? q : "—"}
                            </p>
                            <p className="text-[7px] font-bold text-white/30">{label}/gün</p>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      disabled={current}
                      onClick={() => handleBuy(code)}
                      className={`shimmer-button mt-5 w-full rounded-xl py-3 text-[12px] font-black transition active:scale-[0.97] ${
                        current ? "cursor-default bg-white/10 text-white/40" : "text-black"
                      }`}
                      style={
                        current
                          ? undefined
                          : {
                              background: isElit
                                ? "linear-gradient(135deg,#f5dda6,#d7aa52,#e8d48a)"
                                : "linear-gradient(135deg,#f5dda6,#d7aa52)",
                              boxShadow: "0 8px 24px rgba(215,170,82,.3)",
                            }
                      }
                    >
                      {current ? "Mevcut üyeliğin" : isElit ? "ELİT OL" : "PRO'YA GEÇ"}
                    </button>
                  </div>
                );
              })}
            </div>
            </>
          ) : (
            <>
              {/* Kategori seçici */}
              <div className="mb-4 grid grid-cols-3 gap-2">
                {(["kisa", "uzun", "tam"] as VideoKind[]).map((kind) => {
                  const meta = PACKAGE_GROUP_META[kind];
                  const active = packKind === kind;
                  return (
                    <button
                      key={kind}
                      type="button"
                      onClick={() => setPackKind(kind)}
                      className={`rounded-2xl border p-3 text-center transition active:scale-[0.97] ${
                        active ? "scale-[1.02]" : "opacity-55 hover:opacity-90"
                      }`}
                      style={{
                        borderColor: active ? meta.accent : "rgba(255,255,255,.1)",
                        background: active ? `${meta.accent}18` : "rgba(255,255,255,.02)",
                        boxShadow: active ? `0 8px 24px ${meta.accent}22` : undefined,
                      }}
                    >
                      <p className="text-[19px]">{meta.emoji}</p>
                      <p className="mt-1 text-[11px] font-black text-white">{meta.label}</p>
                      <p className="mt-0.5 text-[8.5px] leading-tight text-white/40">{meta.sub}</p>
                    </button>
                  );
                })}
              </div>

              {/* Paketler */}
              <div className="grid gap-2.5 sm:grid-cols-3">
                {PACKAGE_CODES[packKind].map((code, i) => {
                  const p = PRODUCTS[code];
                  const meta = PACKAGE_GROUP_META[packKind];
                  const best = i === 1;

                  return (
                    <div
                      key={code}
                      className="relative overflow-hidden rounded-2xl p-4 text-center transition-transform hover:scale-[1.03]"
                      style={{
                        background: best
                          ? `linear-gradient(160deg, ${meta.accent}1f, rgba(255,255,255,.02))`
                          : "rgba(255,255,255,.03)",
                        border: best ? `1.5px solid ${meta.accent}88` : "1px solid rgba(255,255,255,.1)",
                        boxShadow: best ? `0 10px 30px ${meta.accent}20` : undefined,
                      }}
                    >
                      {best && (
                        <span
                          className="absolute left-1/2 top-0 flex -translate-x-1/2 items-center gap-0.5 rounded-b-md px-2 py-0.5 text-[7.5px] font-black text-black"
                          style={{ background: meta.accent }}
                        >
                          <Star size={8} /> EN ÇOK TERCİH
                        </span>
                      )}

                      <p className="mt-3 font-display text-[30px] font-black leading-none" style={{ color: meta.accent }}>
                        {p.videoCount}
                      </p>
                      <p className="mt-0.5 text-[9px] font-bold text-white/45">video</p>

                      <div className="my-3 h-px" style={{ background: `linear-gradient(90deg,transparent,${meta.accent}55,transparent)` }} />

                      <p className="font-display text-[19px] font-black text-white">{formatPrice(p)}</p>
                      <p className="mt-0.5 text-[8px] text-white/30">Tek seferlik video üretim paketi</p>

                      <button
                        type="button"
                        onClick={() => handleBuy(code)}
                        className="mt-3 w-full rounded-lg py-2 text-[10.5px] font-black text-black transition hover:brightness-110 active:scale-[0.96] active:brightness-95"
                        style={{ background: `linear-gradient(135deg, ${meta.accent}, ${meta.accent}cc)` }}
                      >
                        Satın Al
                      </button>
                    </div>
                  );
                })}
              </div>

              <p className="mt-4 rounded-xl border border-white/10 bg-black/40 p-3 text-center text-[9.5px] leading-relaxed text-white/40">
                Paketler tek seferliktir ve süresi dolmaz. Günlük üyelik hakkın bittiğinde
                otomatik olarak paketinden kullanılır.
              </p>
            </>
          )}

          {/* Onay + yasal — Satın alma onayı */}
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
              Satın alma koşullarını, mesafeli satış sözleşmesini ve iade politikasını okudum, kabul ediyorum.
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  setTermsOpen((value) => !value);
                }}
                className="ml-1 font-black underline decoration-[color:var(--accent)]/60 underline-offset-2 transition hover:text-white"
              >
                Koşulları oku
              </button>
            </span>
          </label>
          </div>

          {termsOpen && (
            <div className="mt-3 max-h-44 overflow-y-auto rounded-2xl border border-[color:var(--accent)]/25 bg-black/45 p-4 text-[10px] leading-relaxed text-white/70 scrollbar-thin">
              <p className="font-black text-white">Mesafeli Satış Sözleşmesi ve İade Koşulları</p>
              <p className="mt-2">
                Satın alınan aylık üyelikler ve tek seferlik video üretim paketleri, elektronik ortamda sunulan dijital hizmetlerdir. Kullanıcı ödeme sonrası hizmetin derhal sunulacağını ve video üretim sürecinin kendi talebiyle başlatıldığını kabul eder.
              </p>
              <p className="mt-2">
                Kullanıcı bir video üretimini başlattığında, video oluşturulduğunda veya paketten herhangi bir hak kullandığında hizmet ifasına başlanmış sayılır. Bu durumda cayma hakkı kullanılamaz ve iade yapılamaz.
              </p>
              <p className="mt-2">
                Hiç kullanılmamış tek seferlik paketler için satın alma tarihinden itibaren 7 gün içinde destek ekibine başvurulabilir. Kısmen kullanılan paketlerde, üretilen veya üretim süreci başlatılan videolarda iade yapılmaz.
              </p>
              <p className="mt-2">
                Teknik bir hata nedeniyle ödeme alındığı hâlde üyelik veya paket tanımlanmamışsa, ödeme dekontu ile destek@nurstudyo.com adresine başvurulmalıdır. Talepler en geç 2 iş günü içinde incelenir.
              </p>
              <p className="mt-2 text-white/45">
                Ödemeler iyzico güvenli ödeme altyapısı üzerinden alınır. Kart bilgileri platformumuzda saklanmaz.
              </p>

              <div className="mt-3 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-center">
                <p className="text-[10px] font-bold text-white/70 tracking-wide">🔒 iyzico Güvenli Ödeme</p>
                <p className="mt-1 text-[9px] text-white/40">Mastercard · Visa · American Express · Troy</p>
                <p className="mt-1 text-[9px] text-white/30">PCI DSS Uyumlu · 256-bit SSL · Kart bilgisi saklanmaz</p>
              </div>

              <p className="mt-3 text-[10px] text-white/55">
                Destek: <a href="mailto:destek@nurstudyo.com" className="underline decoration-white/20 underline-offset-2 hover:text-white">destek@nurstudyo.com</a>
              </p>
            </div>
          )}

          <p className="mt-3 text-center text-[9px] text-white/25">
            Ödemeler PCI DSS uyumlu altyapı ile 256-bit SSL üzerinden alınır · Kart bilgisi saklanmaz
          </p>
        </div>
      </div>
    </div>
  );
};
