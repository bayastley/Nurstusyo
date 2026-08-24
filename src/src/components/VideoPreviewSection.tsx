import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Film, ImageIcon, Loader2, Maximize2, Minimize2, Pause, Play, Share2, Shuffle, Sparkles, Video, Wand2, X } from "lucide-react";
import { LockBadge } from "./LockBadge";
import { Segmented } from "./UIElements";
import { randomClip, type Clip } from "../clips";
import { T } from "../i18n";
import type { ModalName, Output, SelectedAyah, Tier } from "../types";

interface VideoPreviewSectionProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  previewWidth: number;
  previewMaximized: boolean;
  setPreviewMaximized: React.Dispatch<React.SetStateAction<boolean>>;
  showArapca: boolean;
  setShowArapca: (value: boolean) => void;
  showSubMeal: boolean;
  setShowSubMeal: (value: boolean) => void;
  selected: SelectedAyah[];
  verseIndex: number;
  setVerseIndex: React.Dispatch<React.SetStateAction<number>>;
  verseAudioRef: React.RefObject<HTMLAudioElement | null>;
  previewPlaying: boolean;
  setPreviewPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  setPreviewTime: (time: number) => void;
  randomizeBackgrounds: (cat?: unknown) => void;
  previewDuration: number;
  previewTime: number;
  fmtDuration: (seconds: number) => string;
  clipKind: "img" | "vid";
  setClipKind: (kind: "img" | "vid") => void;
  setBackground: (clip: Clip) => void;
  smartAiEnabled: boolean;
  setSmartAiEnabled: (value: boolean) => void;
  aiTooltipHover: boolean;
  setAiTooltipHover: (value: boolean) => void;
  isMasterSürüm: boolean;
  tierAtLeast: (have: Tier, need: Tier) => boolean;
  tier: Tier;
  hasMicroUnlock: (key: unknown) => boolean;
  tryUnlockElitFeature: (key: unknown, label: string) => boolean;
  applySmartBackgrounds: () => void;
  openPremium: (tab?: "uyelik" | "jeton") => void;
  setSelected: React.Dispatch<React.SetStateAction<SelectedAyah[]>>;
  setAyahBackgrounds: React.Dispatch<React.SetStateAction<Record<string, Clip>>>;
  setPickingFor: (id: string | null) => void;
  setModal: (modal: ModalName) => void;
  ayahBackgrounds: Record<string, Clip>;
  activeOutput: Output | null;
  outputs: Output[];
  setActiveOutputId: (id: string | null) => void;
  fmtSize: (bytes: number) => string;
  shareOutput: (output: Output) => void;
  user: unknown;
  setLoginTab: (tab: unknown) => void;
  notify: (message: string) => void;
  t: (key: keyof (typeof T)["tr"]) => string;
  handleGenerate: () => void;
  generating: boolean;
  progress: number;
  generateCost: number;
  aspect: "9:16" | "1:1" | "16:9" | "4:5";
}

function lowPowerDevice(): boolean {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return Boolean(
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    nav.connection?.saveData ||
    (nav.deviceMemory !== undefined && nav.deviceMemory <= 4) ||
    (navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 4) ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export const VideoPreviewSection: React.FC<VideoPreviewSectionProps> = (props) => {
  const {
    canvasRef, previewWidth, previewMaximized, setPreviewMaximized, showArapca, setShowArapca,
    showSubMeal, setShowSubMeal, selected, verseIndex, setVerseIndex, verseAudioRef,
    previewPlaying, setPreviewPlaying, setPreviewTime, randomizeBackgrounds, previewDuration,
    previewTime, fmtDuration, clipKind, setClipKind, setBackground, smartAiEnabled,
    setSmartAiEnabled, aiTooltipHover, setAiTooltipHover, isMasterSürüm, tierAtLeast, tier,
    hasMicroUnlock, tryUnlockElitFeature, applySmartBackgrounds, openPremium, setModal,
    activeOutput, outputs, setActiveOutputId, fmtSize, shareOutput, user, setLoginTab, t, handleGenerate,
    generating, progress, generateCost, aspect,
  } = props;
  const [lowPower] = useState(lowPowerDevice);

  const aspectCss = useMemo(() => ({ "9:16": "9 / 16", "1:1": "1 / 1", "4:5": "4 / 5", "16:9": "16 / 9" })[aspect], [aspect]);

  // Avoid expensive enlarged previews and continuous audio on constrained devices.
  useEffect(() => {
    if (!lowPower) return;
    if (previewMaximized) setPreviewMaximized(false);
    if (document.hidden && previewPlaying) setPreviewPlaying(false);
  }, [lowPower, previewMaximized, previewPlaying, setPreviewMaximized, setPreviewPlaying]);

  return (
    <section className={`space-y-3 ${previewMaximized && !lowPower ? "relative z-30 overflow-visible" : ""}`}>
      <div
        className={`relative mx-auto ${previewMaximized && !lowPower ? "z-40" : "z-0"}`}
        style={{
          maxWidth: previewWidth,
          transform: previewMaximized && !lowPower ? "scale(1.2)" : "scale(1)",
          transformOrigin: "top center",
          transition: lowPower ? "none" : "transform .35s cubic-bezier(.16,1,.3,1)",
        }}
      >
        {!lowPower && (
          <button onClick={() => setPreviewMaximized((value) => !value)} className="absolute -right-2 -top-2 z-50 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-black/85 text-white/80">
            {previewMaximized ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
        )}
        <span className="absolute -left-1 -top-2 z-50 rounded-full px-2 py-0.5 text-[8px] font-black text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>{aspect}</span>
        <div className="preview-frame glass relative mx-auto overflow-hidden rounded-2xl p-1.5">
          <div className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: aspectCss }}>
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full object-cover" />
          </div>
        </div>
      </div>

      {lowPower && <p className="text-center text-[8px] font-bold text-emerald-300/70">Performans modu aktif</p>}

      <div className="mx-auto flex w-full gap-1.5" style={{ maxWidth: previewWidth }}>
        <button onClick={() => setShowArapca(!showArapca)} className="flex-1 rounded-lg py-1.5 text-[9px] font-bold text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>{showArapca ? "Arapça Çıkar" : "Arapça Ekle"}</button>
        <button onClick={() => setShowSubMeal(!showSubMeal)} className="flex-1 rounded-lg py-1.5 text-[9px] font-bold text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>{showSubMeal ? "Meal Çıkar" : "Meal Ekle"}</button>
      </div>

      <div className="mx-auto flex items-center justify-center gap-2" style={{ maxWidth: previewWidth }}>
        <button disabled={verseIndex <= 0} onClick={() => { verseAudioRef.current?.pause(); setPreviewTime(0); setVerseIndex((index) => Math.max(0, index - 1)); }} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[.04] disabled:opacity-30"><ChevronLeft size={18} /></button>
        <button disabled={!selected.length} onClick={() => setPreviewPlaying((value) => !value)} className="flex h-12 w-12 items-center justify-center rounded-full text-black disabled:opacity-40" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>{previewPlaying ? <Pause size={18} fill="black" /> : <Play size={18} fill="black" />}</button>
        <button disabled={verseIndex >= selected.length - 1} onClick={() => { verseAudioRef.current?.pause(); setPreviewTime(0); setVerseIndex((index) => Math.min(selected.length - 1, index + 1)); }} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[.04] disabled:opacity-30"><ChevronRight size={18} /></button>
        <button onClick={() => randomizeBackgrounds()} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[.04]"><Shuffle size={14} /></button>
      </div>

      {selected.length > 0 && (
        <div className="mx-auto w-full" style={{ maxWidth: previewWidth }}>
          <input type="range" min={0} max={previewDuration || 1} step={0.1} value={previewTime} onChange={(event) => { const time = Number(event.target.value); if (verseAudioRef.current) verseAudioRef.current.currentTime = time; setPreviewTime(time); }} className="timeline w-full" />
          <div className="flex justify-between text-[8px] text-white/30"><span>{fmtDuration(previewTime)}</span><span>{verseIndex + 1} / {selected.length}</span><span>{fmtDuration(previewDuration)}</span></div>
        </div>
      )}

      <div className="mx-auto max-w-[228px]">
        <Segmented value={clipKind} onChange={(kind) => { if (kind === "img" && !isMasterSürüm) { return; } setClipKind(kind); setBackground(randomClip(kind)); }} items={[{ id: "img", label: "Şablon V2", icon: ImageIcon }, { id: "vid", label: t("motion"), icon: Film }]} />
        {clipKind === "img" && <p className="mt-1 text-center text-[9px] font-bold text-amber-300">Şablon görseller V2 güncellemesinde açılacak</p>}
      </div>

      {/* İNDİRME KLASÖRÜ — en fazla 5 output, sırayla iner */}
      {outputs.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[.02] p-3.5">
          <div className="mb-2 flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-[10px] font-black"><Video size={12} />İndirme Klasörü</p>
            <span className="text-[8px] text-white/40">{outputs.length}/5</span>
          </div>
          <div className="grid gap-1.5">
            {outputs.map((output, idx) => (
              <div key={output.id} className={`flex items-center gap-2 rounded-xl px-2.5 py-2 transition ${output.id === activeOutput?.id ? "bg-white/[.06] border border-white/10" : "hover:bg-white/[.03]"}`}>
                <button onClick={() => setActiveOutputId(output.id)} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[9px] font-black" style={{ background: idx === 0 ? "linear-gradient(135deg,var(--accent-2),var(--accent))" : "rgba(255,255,255,.05)", color: idx === 0 ? "black" : "rgba(255,255,255,.5)" }}>
                  {idx + 1}
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[9px] font-bold text-white/80">{output.label}</p>
                  <p className="text-[7.5px] text-white/40">{fmtDuration(output.duration)} · {fmtSize(output.size)}</p>
                </div>
                <a href={user ? output.url : "#"} download={user ? `nur-studyo-${idx + 1}.${output.ext}` : undefined} onClick={(event) => { if (!user) { event.preventDefault(); setLoginTab("register"); setModal("login"); } }} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[.06] text-white/60 hover:text-white transition">
                  <Download size={11} />
                </a>
              </div>
            ))}
          </div>
          {/* Toplu İndir Butonu */}
          {outputs.length > 1 && (
            <button
              onClick={() => {
                if (!user) { setLoginTab("register"); setModal("login"); return; }
                outputs.forEach((output, idx) => {
                  setTimeout(() => {
                    const a = document.createElement("a");
                    a.href = output.url;
                    a.download = `nur-studyo-${idx + 1}.${output.ext}`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }, idx * 800);
                });
                notify(`${outputs.length} video sırayla indiriliyor...`);
              }}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-[10px] font-black text-black"
              style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
            >
              <Download size={11} />{outputs.length} Videoyu İndir
            </button>
          )}
        </div>
      )}

      <div className="grid gap-2.5 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[.02] p-3.5">
          {activeOutput ? (
            <>
              <p className="mb-2 flex items-center gap-2 text-[10px] font-black"><Video size={13} />{t("ready")}</p>
              <p className="truncate text-[9px] text-white/60">{activeOutput.label}</p>
              <p className="mb-3 text-[8px] text-white/40">{fmtDuration(activeOutput.duration)} · {fmtSize(activeOutput.size)}</p>
              <div className="grid grid-cols-2 gap-1.5">
                <a href={user ? activeOutput.url : "#"} download={user ? `nur-studyo.${activeOutput.ext}` : undefined} onClick={(event) => { if (!user) { event.preventDefault(); setLoginTab("register"); setModal("login"); } }} className="flex items-center justify-center gap-1 rounded-xl py-2 text-[10px] font-black text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}><Download size={12} />{t("download")}</a>
                <button onClick={() => user ? shareOutput(activeOutput) : (setLoginTab("register"), setModal("login"))} className="flex items-center justify-center gap-1 rounded-xl bg-white/[.06] py-2 text-[10px]"><Share2 size={12} />{t("share")}</button>
              </div>
            </>
          ) : <p className="py-6 text-center text-[9px] text-white/30">Video çıktınız burada görünür</p>}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[.02] p-3.5">
          <p className="mb-2 flex items-center gap-2 text-[10px] font-black"><Wand2 size={13} />Akıllı AI</p>
          <p className="mb-3 text-[9px] text-white/45">{smartAiEnabled ? "Ayetlere göre sahne eşleştirme aktif." : "Kapalı - atmosferleri kendin seçersin."}</p>
          {!isMasterSürüm && !tierAtLeast(tier, "elit") && !hasMicroUnlock("ai_search") && <LockBadge kind="elit" onUpgrade={() => openPremium("uyelik")} />}
          <button
            onMouseEnter={() => setAiTooltipHover(true)}
            onMouseLeave={() => setAiTooltipHover(false)}
            onClick={() => { if (!tryUnlockElitFeature("ai_search", "Akıllı AI")) return; setSmartAiEnabled(!smartAiEnabled); if (!smartAiEnabled) window.setTimeout(applySmartBackgrounds, lowPower ? 700 : 300); }}
            className="relative w-full rounded-xl py-2 text-[10px] font-black text-black"
            style={{ background: smartAiEnabled ? "#34d399" : "#ef4444" }}
          >
            {aiTooltipHover ? (smartAiEnabled ? "Kapat" : "Aç") : smartAiEnabled ? <><Sparkles size={10} className="mr-1 inline" />AÇIK</> : <><X size={10} className="mr-1 inline" />KAPALI</>}
          </button>
        </div>
      </div>

      <div className="min-h-[74px] space-y-2">
        <button onClick={handleGenerate} className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-display text-[14px] font-black tracking-[.16em]" style={{ background: generating ? "#b91c1c" : "linear-gradient(135deg,var(--accent-2),var(--accent))", color: generating ? "white" : "black" }}>
          {generating ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
          {generating ? `%${progress} · ${t("stop")}` : isMasterSürüm ? `${t("generate")} · ADMIN` : `${t("generate")} · ${generateCost} ⚡ Üretim hakkı`}
        </button>
      </div>
    </section>
  );
};
