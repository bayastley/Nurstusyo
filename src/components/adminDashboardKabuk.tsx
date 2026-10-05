// ════════════════════════════════════════════════════════
// ADMINDASHBOARDKABUK.TSX — AdminDashboardModal'dan ayrıldı (SRP, 01.10)
// Panelin ÇERÇEVESİ: header + 7 sekmeli navigasyon + hata alarmı + footer.
// Sekme İÇERİKLERİ modal'da children olarak geçer; state modal'da kalır,
// kabuk saf görünüm + callback alır.
// ════════════════════════════════════════════════════════

import React from "react";
import { Shield, X, UserCheck, Lightbulb } from "lucide-react";
import type { BanLog } from "../services/adminSyncService";
// ★ 06.10 SAĞLIK ROZETİ: açılışta 7 salt-okunur action sessizce ping'lenir
//   (usePanelSaglik.ts) — hangi sekme çalışmıyorsa rozet + sekme noktası gösterir.
import type { PanelSaglik, SaglikTab } from "./usePanelSaglik";

export type AdminTab = "users" | "broadcast" | "banLogs" | "errors" | "feedback" | "modules" | "sync" | "haftaVideo" | "rapor";

/** Sağlık tooltip'i için kısa sekme adları (panel TR hardcoded — i18n kullanmaz, 06.10) */
const SEKME_ETIKETLERI: Record<SaglikTab, string> = {
  users: "Kullanıcı",
  broadcast: "Duyuru & Kilitlar",
  banLogs: "Ban & Denetim",
  errors: "Hata Logları",
  haftaVideo: "Haftanın Videosu",
  rapor: "Haftalık Rapor",
  feedback: "Geri Bildirim",
};

/** Header'daki küçük 🩺 rozet: test→ gri nabız · ok→ yeşil 7/7 · hata→ kırmızı + hatalı sekme adları */
const PanelSaglikRozeti: React.FC<{ saglik: PanelSaglik }> = ({ saglik }) => {
  const title =
    saglik.durum === "test"
      ? "Sağlık kontrolü sürüyor — sekmeler sessizce ping'leniyor…"
      : saglik.durum === "ok"
        ? `Sağlık: tüm ${saglik.toplam} sekmenin arka planı çalışıyor ✔`
        : `Çalışmayan sekmeler: ${saglik.hataliTablar.map((t) => SEKME_ETIKETLERI[t]).join(", ")}`;
  const stil =
    saglik.durum === "test"
      ? "bg-white/10 border-white/25 text-white/50 animate-pulse"
      : saglik.durum === "ok"
        ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-300"
        : "bg-red-500/20 border-red-400/50 text-red-300 animate-pulse";
  return (
    <span
      data-testid="panel-saglik-rozet"
      title={title}
      className={`rounded-full border px-2 py-0.5 text-[8px] font-black ${stil}`}
    >
      {saglik.durum === "test" ? "🩺 …" : `🩺 ${saglik.okSayisi}/${saglik.toplam}`}
    </span>
  );
};

export const AdminPanelKabuk: React.FC<{
  activeTab: AdminTab;
  setActiveTab: (t: AdminTab) => void;
  onClose: () => void;
  banLogs: BanLog[];
  /** ★ 04.10: sunucudaki aktif ban sayısı — sekme rozeti gerçek banlı sayısını gösterir */
  bannedCount?: number;
  errorStats: { total24h: number; unique24h: number; turDagilimi?: Record<string, number> } | null;
  errorAlarm: "ok" | "warn" | "alarm";
  feedbackStats: { toplam: number } | null;
  /** ★ 06.10: sağlık rozeti — hook yoksa (undefined) rozet hiç render edilmez */
  saglik?: PanelSaglik;
  children: React.ReactNode;
}> = ({ activeTab, setActiveTab, onClose, banLogs, bannedCount, errorStats, errorAlarm, feedbackStats, saglik, children }) => {
  /** ★ 06.10: hatalı sekmenin köşesine kırmızı nokta — "hangi sekme çalışmıyor" tek bakışta */
  const saglikNokta = (tab: SaglikTab) =>
    saglik?.durum === "hata" && saglik.hataliTablar.includes(tab) ? (
      <span
        data-testid={`panel-saglik-nokta-${tab}`}
        className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border border-black/70 bg-red-500"
        title={`${SEKME_ETIKETLERI[tab]} sekmesi yanıt vermiyor`}
      />
    ) : null;
  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 p-3 md:p-6 backdrop-blur-md modal-in"
      onMouseDown={onClose}
      onClick={onClose}
    >
      <div
        className="glass modal-in relative flex max-h-[92vh] w-full max-w-3xl mx-2 sm:mx-auto flex-col overflow-hidden rounded-3xl shadow-2xl"
        style={{ border: "1px solid rgba(215,170,82,.4)" }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative flex items-center justify-between border-b border-white/10 bg-black/40 px-5 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-2xl text-black shadow-lg"
              style={{ background: "linear-gradient(135deg,#f5dda6,#d7aa52)" }}
            >
              <Shield size={20} strokeWidth={2.5} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base font-black tracking-wider text-white">
                  ADMIN YÖNETİM PANELİ
                </h3>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2 py-0.5 text-[8px] font-black text-emerald-300">
                  ŞİFRELİ KORUMALI
                </span>
                {saglik && <PanelSaglikRozeti saglik={saglik} />}
              </div>
              <p className="text-[10px] text-white/50 mt-0.5">
                {/* ★ 27.09: e-posta yerine "Admin" — tanıtım videosunda gizlilik */}
                Oturum: <b style={{ color: "var(--accent-2)" }}>Admin ✔</b>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-white/5 p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
            aria-label="Kapat"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-black/20 p-2 gap-2 shrink-0 overflow-x-auto scrollbar-thin">
          <button
            onClick={() => setActiveTab("users")}
            className={`relative flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-[10.5px] font-bold transition whitespace-nowrap ${
              activeTab === "users" ? "text-black font-black" : "text-white/60 hover:text-white"
            }`}
            style={activeTab === "users" ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}
          >
            <UserCheck size={14} /> Kullanıcı & ⚡Üretim hakkı
            {saglikNokta("users")}
          </button>
          <button
            onClick={() => setActiveTab("broadcast")}
            className={`relative flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-[10.5px] font-bold transition whitespace-nowrap ${
              activeTab === "broadcast" ? "text-black font-black" : "text-white/60 hover:text-white"
            }`}
            style={activeTab === "broadcast" ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}
          >
            <Lightbulb size={14} /> Duyuru & Kilitlar
            {saglikNokta("broadcast")}
          </button>
          <button
            onClick={() => setActiveTab("banLogs")}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-[10.5px] font-bold transition whitespace-nowrap relative ${
              activeTab === "banLogs" ? "text-black font-black" : "text-red-300 hover:text-white"
            }`}
            style={activeTab === "banLogs" ? { background: "linear-gradient(135deg,#f87171,#dc2626)" } : { background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}
          >
            <Lightbulb size={13} className={banLogs.length > 0 ? "animate-pulse text-amber-300" : ""} fill={banLogs.length > 0 ? "currentColor" : "none"} />
            <span>Ban & Siber Denetim ({bannedCount ?? banLogs.length})</span>
            {saglikNokta("banLogs")}
          </button>
          <button
            onClick={() => setActiveTab("errors")}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-[10.5px] font-bold transition whitespace-nowrap relative ${
              activeTab === "errors" ? "text-black font-black" : "text-amber-300 hover:text-white"
            }`}
            style={activeTab === "errors" ? { background: "linear-gradient(135deg,#fbbf24,#d97706)" } : { background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.3)" }}
          >
            ⚠️
            <span>Hata Logları{errorStats ? ` (${errorStats.total24h})` : ""}</span>
            {errorAlarm === "alarm" && <span className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-red-500 animate-ping" />}
            {errorAlarm === "alarm" && <span className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-red-500" />}
            {saglikNokta("errors")}
          </button>
          <button
            onClick={() => setActiveTab("haftaVideo")}
            className={`relative flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-[10.5px] font-bold transition whitespace-nowrap ${
              activeTab === "haftaVideo" ? "text-black font-black" : "text-fuchsia-300 hover:text-white"
            }`}
            style={activeTab === "haftaVideo" ? { background: "linear-gradient(135deg,#e879f9,#c026d3)" } : { background: "rgba(232,121,249,0.12)", border: "1px solid rgba(232,121,249,0.3)" }}
          >
            🎬
            <span>Haftanın Videosu</span>
            {saglikNokta("haftaVideo")}
          </button>
          <button
            onClick={() => setActiveTab("rapor")}
            className={`relative flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-[10.5px] font-bold transition whitespace-nowrap ${
              activeTab === "rapor" ? "text-black font-black" : "text-teal-300 hover:text-white"
            }`}
            style={activeTab === "rapor" ? { background: "linear-gradient(135deg,#2dd4bf,#0d9488)" } : { background: "rgba(45,212,191,0.12)", border: "1px solid rgba(45,212,191,0.3)" }}
          >
            📊
            <span>Haftalık Rapor</span>
            {saglikNokta("rapor")}
          </button>
          <button
            onClick={() => setActiveTab("feedback")}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-[10.5px] font-bold transition whitespace-nowrap relative ${
              activeTab === "feedback" ? "text-black font-black" : "text-emerald-300 hover:text-white"
            }`}
            style={activeTab === "feedback" ? { background: "linear-gradient(135deg,#34d399,#059669)" } : { background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.3)" }}
          >
            💬
            <span>Geri Bildirim{feedbackStats ? ` (${feedbackStats.toplam})` : ""}</span>
            {saglikNokta("feedback")}
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">
          {/* ★ HATA ALARMI — eşik aşımında en üstte görünür */}
          {errorAlarm !== "ok" && (
            <div className={`rounded-2xl border px-4 py-3 ${errorAlarm === "alarm" ? "border-red-500/50 bg-red-500/15 animate-pulse" : "border-amber-500/40 bg-amber-500/10"}`}>
              <p className={`text-xs font-black ${errorAlarm === "alarm" ? "text-red-300" : "text-amber-300"}`}>
                {errorAlarm === "alarm" ? "🚨 ACİL HATA ALARMI" : "⚠️ HATA UYARISI"}
                {errorStats ? ` — Son 24 saatte ${errorStats.total24h} hata (${errorStats.unique24h} benzersiz)` : ""}
              </p>
              <p className="mt-1 text-[10px] text-white/60">Siteyi kullanıcılar hatalı kullanıyor olabilir. Ayrıntılar için Hata Logları sekmesine bak.</p>
              <button onClick={() => setActiveTab("errors")} className="mt-2 rounded-lg bg-white/10 px-3 py-1 text-[10px] font-bold text-white/80 transition hover:bg-white/20">
                → Hata Logları'na git
              </button>
            </div>
          )}
          {children}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 bg-black/50 px-5 py-3 flex items-center justify-between text-[10px] text-white/40 shrink-0">
          <span>AES+HMAC Korumalı · Dynamic Serverless Config Engine</span>
          <button
            onClick={onClose}
            className="rounded-xl bg-white/10 px-4 py-1.5 text-[10px] font-bold text-white hover:bg-white/20 transition"
          >
            Tamamlandı
          </button>
        </div>
      </div>
    </div>
  );
};
