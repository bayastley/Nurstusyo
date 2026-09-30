// ════════════════════════════════════════════════════════
// STUDIOAPPBOLUMLER.TSX — StudioApp tam-ekran blokları
// StudioApp.tsx'den ayrıldı (SRP adım 12, 30.09)
// Üretim Onay Balonu · Ban Engel Ekranı · Akıllı Hata Kılavuzu
// ════════════════════════════════════════════════════════

import React from "react";
import { X, AlertTriangle, Ban, Zap } from "lucide-react";
import type { DebugGuideMessage } from "../debugGuide";

interface GenConfirmData { mode: string; formatCount: number; cost: number; remaining: number }

// ── ★ ÜRETİM ONAY BALONU — free/pro maliyet uyarısı ──
export function UretimOnayBalonu({
  genConfirmData,
  handleGenConfirm,
}: {
  genConfirmData: GenConfirmData;
  handleGenConfirm: (ok: boolean) => void;
}) {
  return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => handleGenConfirm(false)}>
          <div className="glass modal-in max-w-sm w-[90%] rounded-3xl border border-white/10 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg, var(--accent-2), var(--accent))" }}>
                <Zap size={22} className="text-white" />
              </div>
              <div>
                <h3 className="font-display text-base font-black text-white">Üretim Onayı</h3>
                <p className="text-[10px] text-white/50">Maliyet bilgisi</p>
              </div>
            </div>

            <div className="mb-4 space-y-2 rounded-2xl bg-black/30 p-4">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-white/50">Üretim türü</span>
                <span className="font-bold text-white">{genConfirmData.mode === "short" ? "Kısa (59sn)" : genConfirmData.mode === "long" ? "Uzun (600sn)" : "Tam Sürüm"}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-white/50">Format sayısı</span>
                <span className="font-bold text-white">{genConfirmData.formatCount} adet</span>
              </div>
              <div className="my-2 h-px bg-white/10" />
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-bold text-white/70">Harcanacak jeton</span>
                <span className="font-black" style={{ color: "var(--accent)" }}>{genConfirmData.cost} ⚡</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-white/50">Kalan jetonun</span>
                <span className="font-bold text-white">{genConfirmData.remaining} ⚡</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-white/50">Üretim sonrası</span>
                <span className="font-bold" style={{ color: genConfirmData.remaining - genConfirmData.cost <= 0 ? "#ef4444" : "var(--accent-2)" }}>
                  {Math.max(0, genConfirmData.remaining - genConfirmData.cost)} ⚡
                </span>
              </div>
            </div>

            {genConfirmData.remaining - genConfirmData.cost <= 0 && (
              <div className="mb-3 rounded-xl bg-red-500/10 border border-red-500/30 px-3 py-2 text-[10px] font-bold text-red-300 text-center">
                ⚠️ Jetonun yetersiz! Üretim sonrası bakiyen 0 olacak.
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => handleGenConfirm(false)}
                className="flex-1 rounded-xl bg-white/5 px-4 py-2.5 text-[11px] font-bold text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                İptal
              </button>
              <button
                onClick={() => handleGenConfirm(true)}
                className="flex-1 rounded-xl px-4 py-2.5 text-[11px] font-black text-white transition shadow-lg"
                style={{ background: "linear-gradient(135deg, var(--accent-2), var(--accent))" }}
              >
                Üret ⚡ {genConfirmData.cost}
              </button>
            </div>
          </div>
        </div>
  );
}

// ── ⛔ SÜRESİZ BAN ENGEL EKRANI ──
export function BanEngelEkrani({ localBanReason }: { localBanReason: string }) {
  return (
        <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-black/95 p-6 backdrop-blur-2xl text-center modal-in select-none">
          <div
            className="glass relative max-w-md w-full rounded-3xl p-8 border text-center space-y-4 shadow-2xl"
            style={{ borderColor: "rgba(239, 68, 68, 0.5)", background: "linear-gradient(160deg, rgba(127,29,29,0.3) 0%, rgba(12,13,18,0.98) 100%)" }}
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-red-500/20 border border-red-500/40 text-red-400 shadow-xl animate-pulse">
              <Ban size={36} strokeWidth={2.5} />
            </div>

            <div>
              <span className="rounded-full bg-red-500/20 border border-red-500/40 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-red-300">
                ERİŞİM SÜRESİZ DONDURULDU
              </span>
              <h2 className="font-display text-xl font-black text-white mt-3 tracking-wide">
                SİSTEM ERİŞİMİNİZ ENGELLENMİŞTİR
              </h2>
            </div>

            <div className="rounded-2xl border border-red-500/30 bg-black/60 p-4 text-left space-y-1.5">
              <div className="text-[9.5px] font-black uppercase tracking-wider text-red-400">
                Yasal Suç / İhlal Gerekçesi:
              </div>
              <p className="text-[11.5px] font-semibold text-white/90 leading-relaxed">
                "{localBanReason}"
              </p>
            </div>

            <p className="text-[10px] leading-relaxed text-white/45">
              Hesabınız yasal suç veya platform güvenlik şartlarının ihlali nedeniyle süresiz olarak askıya alınmıştır. Ban itirazları ve yasal talepleriniz için <b className="text-white/80">destek@nurstudyo.com</b> adresiyle iletişime geçebilirsiniz.
            </p>

            <div className="pt-2 text-[9px] font-mono text-white/30 border-t border-white/10">
              nurstudyo.com · Siber Güvenlik Denetim Protokolü
            </div>
          </div>
        </div>
  );
}

// ── ★ AKILLI HATA KILAVUZU MODALI ──
export function HataKilavuzModal({
  debugGuideModal,
  setDebugGuideModal,
}: {
  debugGuideModal: DebugGuideMessage;
  setDebugGuideModal: (v: DebugGuideMessage | null) => void;
}) {
  return (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md modal-in"
          onMouseDown={() => setDebugGuideModal(null)}
          onClick={() => setDebugGuideModal(null)}
        >
          <div
            className="glass modal-in relative w-full max-w-md rounded-2xl p-6 shadow-2xl"
            style={{ border: "1px solid rgba(215,170,82,.35)" }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setDebugGuideModal(null)}
              className="absolute right-3 top-3 rounded-full bg-white/5 p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white"
              aria-label="Kapat"
            >
              <X size={16} />
            </button>

            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
                <AlertTriangle size={18} />
              </span>
              <div>
                <h3 className="font-display text-sm font-black tracking-wider" style={{ color: "var(--accent-2)" }}>
                  {debugGuideModal.title}
                </h3>
                <p className="text-[9.5px] text-white/40">{debugGuideModal.subtitle}</p>
              </div>
            </div>

            <div className="space-y-2.5 text-[11px] leading-relaxed text-white/80">
              {debugGuideModal.steps.map((step, idx) => (
                <div key={idx} className="rounded-xl border border-white/10 bg-black/30 p-3 font-semibold text-white/90">
                  {step}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setDebugGuideModal(null);
                window.location.reload();
              }}
              className="mt-5 w-full rounded-xl py-3 text-[11px] font-black uppercase tracking-wider text-black"
              style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
            >
              Sayfayı Yenile (F5)
            </button>
          </div>
        </div>
  );
}
