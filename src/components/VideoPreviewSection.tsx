import React from "react";
import {
  Maximize2, Minimize2, ChevronLeft, ChevronRight, Pause, Play, Shuffle,
  ImageIcon, Film, Wand2, Sparkles, X, Video, Download, Share2, Loader2,
} from "lucide-react";
import { Segmented } from "./UIElements";
import { LockBadge } from "./LockBadge";
import { randomClip, type Clip } from "../clips";
import { T } from "../i18n";
import { JETON } from "../tier";
import type { SelectedAyah, Output, ModalName, Tier } from "../types";

interface VideoPreviewSectionProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  previewWidth: number;
  previewMaximized: boolean;
  setPreviewMaximized: React.Dispatch<React.SetStateAction<boolean>>;
  showArapca: boolean;
  setShowArapca: (v: boolean) => void;
  showSubMeal: boolean;
  setShowSubMeal: (v: boolean) => void;
  selected: SelectedAyah[];
  verseIndex: number;
  setVerseIndex: React.Dispatch<React.SetStateAction<number>>;
  verseAudioRef: React.RefObject<HTMLAudioElement | null>;
  previewPlaying: boolean;
  setPreviewPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  setPreviewTime: (t: number) => void;
  randomizeBackgrounds: (cat?: any) => void;
  previewDuration: number;
  previewTime: number;
  fmtDuration: (seconds: number) => string;
  clipKind: "img" | "vid";
  setClipKind: (kind: "img" | "vid") => void;
  setBackground: (clip: Clip) => void;
  smartAiEnabled: boolean;
  setSmartAiEnabled: (v: boolean) => void;
  aiTooltipHover: boolean;
  setAiTooltipHover: (v: boolean) => void;
  isMasterSürüm: boolean;
  tierAtLeast: (have: Tier, need: Tier) => boolean;
  tier: Tier;
  hasMicroUnlock: (key: any) => boolean;
  tryUnlockElitFeature: (key: any, label: string) => boolean;
  applySmartBackgrounds: () => void;
  openPremium: (tab?: "uyelik" | "jeton") => void;
  setSelected: React.Dispatch<React.SetStateAction<SelectedAyah[]>>;
  setAyahBackgrounds: React.Dispatch<React.SetStateAction<Record<string, Clip>>>;
  setPickingFor: (id: string | null) => void;
  setModal: (modal: ModalName) => void;
  ayahBackgrounds: Record<string, Clip>;
  activeOutput: Output | null;
  fmtSize: (bytes: number) => string;
  shareOutput: (output: Output) => void;
  user: any;
  setLoginTab: (t: any) => void;
  notify: (msg: string) => void;
  t: (key: keyof (typeof T)["tr"]) => string;
  /** ★ Video Üret butonu — Akıllı AI'nin hemen altına taşındı */
  handleGenerate: () => void;
  generating: boolean;
  progress: number;
  generateCost: number;
  /** ★ Seçili ekran formatı — önizleme buna göre şekil değiştirir */
  aspect: "9:16" | "1:1" | "16:9" | "4:5";
}

export const VideoPreviewSection: React.FC<VideoPreviewSectionProps> = ({
  canvasRef,
  previewWidth,
  previewMaximized,
  setPreviewMaximized,
  showArapca,
  setShowArapca,
  showSubMeal,
  setShowSubMeal,
  selected,
  verseIndex,
  setVerseIndex,
  verseAudioRef,
  previewPlaying,
  setPreviewPlaying,
  setPreviewTime,
  randomizeBackgrounds,
  previewDuration,
  previewTime,
  fmtDuration,
  clipKind,
  setClipKind,
  setBackground,
  smartAiEnabled,
  setSmartAiEnabled,
  aiTooltipHover,
  setAiTooltipHover,
  isMasterSürüm,
  tierAtLeast,
  tier,
  hasMicroUnlock,
  tryUnlockElitFeature,
  applySmartBackgrounds,
  openPremium,
  setSelected,
  setAyahBackgrounds,
  setPickingFor,
  setModal,
  ayahBackgrounds,
  activeOutput,
  fmtSize,
  shareOutput,
  user,
  setLoginTab,
  notify,
  t,
  handleGenerate,
  generating,
  progress,
  generateCost,
  aspect,
}) => {
  // ★ Önizleme çerçevesi seçilen formata göre şekil değiştirir
  const aspectCss =
    aspect === "9:16" ? "9 / 16" :
    aspect === "1:1"  ? "1 / 1"  :
    aspect === "4:5"  ? "4 / 5"  :
                        "16 / 9";
  // Seçili ayetler paneli sol panele taşındı — bu prop'lar arayüz uyumu için korunuyor
  void setSelected; void setAyahBackgrounds; void setPickingFor; void ayahBackgrounds;
  return (
    <section className={`space-y-3 ${previewMaximized ? "relative z-30 overflow-visible" : ""}`}>
      {/* Canvas preview frame — büyütünce %20 scale ile diğer panellerin üstüne biner */}
      <div
        className={`relative mx-auto ${previewMaximized ? "z-40" : "z-0"}`}
        style={{
          maxWidth: previewWidth,
          transform: previewMaximized ? "scale(1.2)" : "scale(1)",
          transformOrigin: "top center",
          transition: "transform .35s cubic-bezier(.16,1,.3,1)",
        }}
      >
        <button
          onClick={() => setPreviewMaximized((v) => !v)}
          aria-label={previewMaximized ? "Önizlemeyi küçült" : "Önizlemeyi büyüt"}
          title={previewMaximized ? "Küçült (−%20)" : "Büyüt (+%20)"}
          className="absolute -right-2 -top-2 z-50 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-black/85 text-white/80 backdrop-blur-sm shadow-lg transition hover:scale-110 hover:border-[color:var(--accent)]/50 hover:text-[color:var(--accent-2)] active:scale-95"
        >
          {previewMaximized ? <Minimize2 size={12} strokeWidth={2.5} /> : <Maximize2 size={12} strokeWidth={2.5} />}
        </button>

        {/* Aktif format rozeti */}
        <span
          className="absolute -left-1 -top-2 z-50 rounded-full px-2 py-0.5 text-[8px] font-black tracking-wider text-black shadow-md"
          style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
        >
          {aspect}
        </span>

        <div
          className="preview-frame glass relative mx-auto overflow-hidden rounded-2xl p-1.5"
          style={{ boxShadow: previewMaximized ? "0 28px 70px rgba(0,0,0,.7)" : undefined }}
        >
          <div
            className="relative w-full overflow-hidden rounded-xl transition-[aspect-ratio] duration-500"
            style={{ aspectRatio: aspectCss }}
          >
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full object-cover" />
          </div>
        </div>
      </div>

      {/* Show/Hide Arabic & Meal buttons */}
      <div className="mx-auto flex w-full items-center justify-center gap-1.5" style={{ maxWidth: previewWidth, transition: "max-width .35s cubic-bezier(.16,1,.3,1)" }}>
        <button
          onClick={() => setShowArapca(!showArapca)}
          className={`flex-1 rounded-lg py-1.5 text-[9px] font-bold transition ${showArapca ? "text-black" : "text-white"}`}
          style={showArapca ? { background: "linear-gradient(135deg,#f87171,#dc2626)" } : { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
        >
          {showArapca ? "Arapça Çıkar" : "Arapça Ekle"}
        </button>
        <button
          onClick={() => setShowSubMeal(!showSubMeal)}
          className={`flex-1 rounded-lg py-1.5 text-[9px] font-bold transition ${showSubMeal ? "text-black" : "text-white"}`}
          style={showSubMeal ? { background: "linear-gradient(135deg,#f87171,#dc2626)" } : { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
        >
          {showSubMeal ? "Meal Çıkar" : "Meal Ekle"}
        </button>
      </div>

      {/* Playback Controls */}
      <div className="mx-auto flex w-full items-center justify-center gap-2" style={{ maxWidth: previewWidth, transition: "max-width .35s cubic-bezier(.16,1,.3,1)" }}>
        <button
          aria-label="Önceki ayet"
          className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[.04] text-white/80 transition-all hover:border-[color:var(--accent)]/50 hover:bg-white/[.08] hover:text-white hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100 disabled:hover:border-white/10 disabled:hover:bg-white/[.04] disabled:hover:text-white/80"
          disabled={selected.length < 2 || verseIndex <= 0}
          onClick={() => {
            if (verseAudioRef.current) { verseAudioRef.current.pause(); verseAudioRef.current.currentTime = 0; }
            setPreviewTime(0);
            setVerseIndex((i) => Math.max(0, i - 1));
          }}
        >
          <ChevronLeft size={18} strokeWidth={2.5} />
        </button>
        <button
          aria-label={previewPlaying ? "Duraklat" : "Oynat"}
          className="group flex h-12 w-12 items-center justify-center rounded-full text-black shadow-lg transition-all hover:scale-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
          style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))", boxShadow: "0 6px 20px rgba(215,170,82,.4)" }}
          disabled={!selected.length}
          onClick={() => setPreviewPlaying((v) => !v)}
        >
          {previewPlaying ? <Pause size={18} fill="black" strokeWidth={0} /> : <Play size={18} fill="black" strokeWidth={0} className="ml-0.5" />}
        </button>
        <button
          aria-label="Sonraki ayet"
          className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[.04] text-white/80 transition-all hover:border-[color:var(--accent)]/50 hover:bg-white/[.08] hover:text-white hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100 disabled:hover:border-white/10 disabled:hover:bg-white/[.04] disabled:hover:text-white/80"
          disabled={selected.length < 2 || verseIndex >= selected.length - 1}
          onClick={() => {
            if (verseAudioRef.current) { verseAudioRef.current.pause(); verseAudioRef.current.currentTime = 0; }
            setPreviewTime(0);
            setVerseIndex((i) => Math.min(selected.length - 1, i + 1));
          }}
        >
          <ChevronRight size={18} strokeWidth={2.5} />
        </button>
        <button
          aria-label="Rastgele arka plan"
          className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[.04] text-white/60 transition-all hover:border-[color:var(--accent)]/50 hover:bg-white/[.08] hover:text-[color:var(--accent-2)] hover:scale-105 active:scale-95"
          onClick={() => randomizeBackgrounds()}
          title="Rastgele atmosfer ata"
        >
          <Shuffle size={14} strokeWidth={2.5} className="transition-transform group-hover:rotate-180" style={{ transitionDuration: "500ms" }} />
        </button>
      </div>

      {/* Timeline slider */}
      {selected.length ? (
        <div className="mx-auto w-full" style={{ maxWidth: previewWidth, transition: "max-width .35s cubic-bezier(.16,1,.3,1)" }}>
          <input
            type="range"
            min={0}
            max={previewDuration || 1}
            step={0.1}
            value={previewTime}
            onChange={(event) => {
              const time = Number(event.target.value);
              if (verseAudioRef.current) verseAudioRef.current.currentTime = time;
              setPreviewTime(time);
            }}
            className="timeline w-full"
          />
          <div className="flex justify-between text-[8px] tabular-nums text-white/30">
            <span>{fmtDuration(previewTime)}</span>
            <span>{verseIndex + 1} / {selected.length}</span>
            <span>{fmtDuration(previewDuration)}</span>
          </div>
        </div>
      ) : null}

      {/* Atmosphere kind selector */}
      <div className="mx-auto max-w-[228px]">
        <p className="mb-1.5 text-center text-[9px] font-bold uppercase tracking-[.15em] text-white/35">{t("atmoType")}</p>
        <Segmented
          value={clipKind}
          onChange={(kind) => { setClipKind(kind); setBackground(randomClip(kind)); }}
          items={[{ id: "img", label: t("template"), icon: ImageIcon }, { id: "vid", label: t("motion"), icon: Film }]}
        />
      </div>

      {/* ★ Video Çıktısı (SOL) + Akıllı AI (SAĞ) — tek grid, tekrar yok */}
      <div className="-mt-1 grid w-full gap-2.5 sm:grid-cols-2">

        {/* ── SOL: HAZIR VİDEO ÇIKTISI ── */}
        {activeOutput ? (
          <div className="animate-rise relative overflow-hidden rounded-2xl p-3.5"
            style={{
              background: "linear-gradient(135deg, rgba(215,170,82,.16) 0%, rgba(12,13,18,.94) 100%)",
              border: "1px solid rgba(215,170,82,.4)",
              boxShadow: "0 0 30px rgba(215,170,82,.15)",
            }}
          >
            <span className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-30 blur-2xl" style={{ background: "radial-gradient(circle, var(--accent), transparent 70%)" }} />
            <p className="relative mb-2 flex items-center gap-1.5 text-[10.5px] font-black uppercase tracking-wider" style={{ color: "var(--accent-2)" }}>
              <span className="flex h-6 w-6 items-center justify-center rounded-lg shadow-md" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
                <Video size={12} className="text-black" strokeWidth={2.8} />
              </span>
              {t("ready")}
            </p>
            <p className="truncate text-[9.5px] text-white/60">{activeOutput.label}</p>
            <p className="mb-3 mt-1 flex items-center gap-1.5 text-[9px] tabular-nums text-white/40">
              <span className="rounded bg-white/8 px-1.5 py-0.5">{fmtDuration(activeOutput.duration)}</span>
              <span className="rounded bg-white/8 px-1.5 py-0.5">{fmtSize(activeOutput.size)}</span>
              <span className="rounded bg-white/8 px-1.5 py-0.5">{activeOutput.ext.toUpperCase()}</span>
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              <a
                href={user ? activeOutput.url : "#"}
                download={user ? `nur-studyo.${activeOutput.ext}` : undefined}
                onClick={(e) => {
                  if (!user) {
                    e.preventDefault();
                    notify("🎁 Bu videoyu indirmek ve 20 hediye jetonunuzu almak için lütfen 3 saniyede ücretsiz üye olun");
                    setLoginTab("register");
                    setModal("login");
                  }
                }}
                className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl py-2 text-[10.5px] font-black text-black shadow-md transition hover:brightness-110 active:scale-95"
                style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
              >
                <Download size={12} strokeWidth={2.8} />{t("download")}
              </a>
              <button
                onClick={() => {
                  if (!user) {
                    notify("🎁 Bu videoyu indirmek ve 20 hediye jetonunuzu almak için lütfen 3 saniyede ücretsiz üye olun");
                    setLoginTab("register");
                    setModal("login");
                    return;
                  }
                  shareOutput(activeOutput);
                }}
                className="glass-soft flex cursor-pointer items-center justify-center gap-1.5 rounded-xl py-2 text-[10.5px] font-bold text-white/75 transition hover:bg-white/10 hover:text-white active:scale-95"
              >
                <Share2 size={12} />{t("share")}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[.015] p-4">
            <div className="text-center">
              <Video size={24} className="mx-auto mb-2 opacity-25" style={{ color: "var(--accent)" }} />
              <p className="text-[10.5px] font-bold text-white/30">Video Çıktınız</p>
              <p className="mt-1 text-[9px] leading-relaxed text-white/20">
                Üretim tamamlanınca<br />indirme ve paylaşım kartı burada belirir
              </p>
            </div>
          </div>
        )}

        {/* ── SAĞ: AKILLI AI ── */}
        <div
          className="relative overflow-hidden rounded-2xl p-3.5"
          style={{
            background: smartAiEnabled
              ? "linear-gradient(135deg, rgba(52,211,153,.14) 0%, rgba(16,185,129,.06) 50%, rgba(12,13,18,.9) 100%)"
              : "linear-gradient(135deg, rgba(255,255,255,.04) 0%, rgba(12,13,18,.9) 100%)",
            border: smartAiEnabled ? "1px solid rgba(52,211,153,.35)" : "1px solid rgba(255,255,255,.08)",
            boxShadow: smartAiEnabled ? "0 0 30px rgba(52,211,153,.15), inset 0 1px 0 rgba(255,255,255,.05)" : undefined,
          }}
        >
          {smartAiEnabled && (
            <>
              <span className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-45 blur-2xl" style={{ background: "radial-gradient(circle, #34d399, transparent 70%)" }} />
              <span className="pointer-events-none absolute -bottom-10 -left-8 h-24 w-24 rounded-full opacity-25 blur-2xl" style={{ background: "radial-gradient(circle, #10b981, transparent 70%)" }} />
            </>
          )}

          <div className="relative mb-2 flex items-center justify-between">
            <span className="flex items-center gap-2 text-[10.5px] font-black uppercase tracking-wider text-white/85">
              <span className="relative flex h-6 w-6 items-center justify-center rounded-lg shadow-md" style={{ background: smartAiEnabled ? "linear-gradient(135deg,#34d399,#10b981)" : "rgba(255,255,255,.08)" }}>
                <Wand2 size={12} className={smartAiEnabled ? "text-black" : "text-white/50"} strokeWidth={2.8} />
                {smartAiEnabled && <span className="absolute inset-0 animate-ping rounded-lg opacity-30" style={{ background: "rgba(52,211,153,.5)" }} />}
              </span>
              <span className="flex flex-col leading-none">
                <span>Akıllı AI</span>
                <span className="mt-0.5 text-[7.5px] font-bold tracking-normal text-white/35 normal-case">
                  Otomatik Sahne Eşleştirme
                </span>
              </span>
            </span>
            <span className="flex items-center gap-1">
              {smartAiEnabled && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[7.5px] font-black text-emerald-300">
                  <span className="h-1 w-1 animate-pulse rounded-full bg-emerald-400" />
                  AKTİF
                </span>
              )}
              {!isMasterSürüm && !tierAtLeast(tier, "elit") && !hasMicroUnlock("ai_search") && (
                <LockBadge kind="elit" onUpgrade={() => openPremium("uyelik")} position="top-right" tooltipText={`Elit Üyelik veya ${JETON.MIKRO_KILIT_ACMA_UCRETI} jetonla 24 saatlik açma`} />
              )}
            </span>
          </div>

          {/* Özellik rozetleri */}
          <div className="relative mb-2 flex flex-wrap gap-1">
            {["🔍 Kelime Analizi", "🎨 24 Kategori", "♾️ Tekrarsız"].map((f) => (
              <span
                key={f}
                className={`rounded-md px-1.5 py-0.5 text-[7.5px] font-bold transition ${
                  smartAiEnabled ? "bg-emerald-500/15 text-emerald-300/90" : "bg-white/5 text-white/25"
                }`}
              >
                {f}
              </span>
            ))}
          </div>

          <p className="relative mb-2.5 text-[9px] leading-relaxed text-white/45">
            {smartAiEnabled
              ? "Ayetin mealindeki kelimeler analiz edilir, en uygun atmosfer otomatik atanır."
              : "Kapalı — atmosferleri kendin seçersin."}
            {!isMasterSürüm && !tierAtLeast(tier, "elit") && hasMicroUnlock("ai_search") && <span className="ml-1 font-bold text-emerald-400">· 24 saatlik açık</span>}
            {isMasterSürüm && <span className="ml-1 font-bold text-emerald-400">· GOD MODE</span>}
          </p>
          <button
            onClick={() => {
              if (!tryUnlockElitFeature("ai_search", "Akıllı AI")) return;
              setSmartAiEnabled(!smartAiEnabled);
              if (!smartAiEnabled) setTimeout(() => applySmartBackgrounds(), 300);
            }}
            onMouseEnter={() => setAiTooltipHover(true)}
            onMouseLeave={() => setAiTooltipHover(false)}
            className="relative w-full h-9 rounded-full transition-all duration-300 overflow-hidden"
            style={{ background: smartAiEnabled ? "rgba(52,211,153,.18)" : "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            {aiTooltipHover && (
              <span className="pointer-events-none absolute -top-8 right-0 z-10 whitespace-nowrap rounded-md px-2 py-1 text-[9px] font-black text-black shadow-lg" style={{ background: smartAiEnabled ? "linear-gradient(135deg,#34d399,#10b981)" : "#ef4444" }}>
                {smartAiEnabled ? "Aç" : "Kapa"}
              </span>
            )}
            <div
              className={`absolute top-1 h-7 w-[calc(50%-4px)] rounded-full flex items-center justify-center gap-1 text-[9px] font-black text-black transition-all duration-300 shadow-md ${smartAiEnabled ? "left-[calc(50%+2px)]" : "left-1"}`}
              style={{ background: smartAiEnabled ? "linear-gradient(135deg,#34d399,#10b981)" : "#ef4444" }}
            >
              {smartAiEnabled ? <><Sparkles size={9} strokeWidth={3} /> AÇIK</> : <><X size={9} strokeWidth={3} /> KAPALI</>}
            </div>
          </button>
        </div>

      </div>

      {/* ★ VİDEO ÜRET — parlama yapmasın diye sticky/shimmer kaldırıldı, alan sabit kaldı */}
      <div className="min-h-[74px] w-full space-y-2">
        <button
          onClick={() => handleGenerate()}
          className="relative flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-display text-[14px] font-black tracking-[.16em] transition hover:brightness-105 active:scale-[.99]"
          style={{
            background: generating
              ? "linear-gradient(135deg,#f87171,#b91c1c)"
              : "linear-gradient(135deg,var(--accent-2),var(--accent))",
            color: generating ? "white" : "black",
          }}
        >
          {generating ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
          {generating
            ? `%${progress} • ${t("stop")}`
            : isMasterSürüm
            ? `${t("generate")} · GOD MODE`
            : `${t("generate")} · ${generateCost} Jeton`}
        </button>
        <div className={`glass-soft h-1.5 overflow-hidden rounded-full transition-opacity ${generating ? "opacity-100" : "opacity-0"}`}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${progress}%`, background: "linear-gradient(90deg,var(--accent-2),var(--accent))" }}
          />
        </div>
      </div>

    </section>
  );
};
