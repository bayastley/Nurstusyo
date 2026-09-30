import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Film, ImageIcon, Loader2, Maximize2, Minimize2, Palette, Pause, PenLine, Play, Share2, Shuffle, Sparkles, Video, Wand2, X } from "lucide-react";
import { LockBadge } from "./LockBadge";
import { Segmented } from "./UIElements";
import { randomClip, type Clip } from "../clips";
import { ADMIN_TEMPLATE_CLIPS } from "../adminMediaManifest";
import { T } from "../i18n";
import { type CubukAyar, type MesajAyar } from "../studio/mesajKatmani";
import { CubukRenkSecici } from "./renkCubuguSecici";
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
  /** ★ RENK ÇUBUĞU (01.10) — çerçeve iç kenarı gökkuşağı şeridi (kartlıkla aynı çekirdek) */
  cubukAyar: CubukAyar;
  setCubukAyar: React.Dispatch<React.SetStateAction<CubukAyar>>;
  /** ★ ÖZEL YAZI (01.10) — videonun içine çizilen kullanıcı mesajı */
  mesajAyar: MesajAyar;
  setMesajAyar: React.Dispatch<React.SetStateAction<MesajAyar>>;
  setTextOffset: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  textOffset: { x: number; y: number };
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
  /** ★ Sekme değişince mevcut ayet arka planlarını yeni türe (img/vid) yeniden atar */
  onClipKindChange?: (kind: "img" | "vid") => void;
  ayahBackgrounds: Record<string, Clip>;
  activeOutput: Output | null;
  outputs: Output[];
  setActiveOutputId: (id: string | null) => void;
  fmtSize: (bytes: number) => string;
  shareOutput: (output: Output) => void;
  downloadVideo: (output: Output) => Promise<void>;
  user: unknown;
  setLoginTab: (tab: unknown) => void;
  notify: (message: string) => void;
  t: (key: keyof (typeof T)["tr"]) => string;
  handleGenerate: () => void;
  generating: boolean;
  progress: number;
  generateCost: number;
  aspect: "9:16" | "1:1" | "16:9" | "4:5";
  /** ★ KENDİ SESİNİ YÜKLE (30.09) — ELİT özelliği butonu */
  kendiSesAktifMi: boolean;
  onKendiSesAc: () => void;
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
    showSubMeal, setShowSubMeal, cubukAyar, setCubukAyar, mesajAyar, setMesajAyar, setTextOffset, textOffset, selected, verseIndex, setVerseIndex, verseAudioRef,
    previewPlaying, setPreviewPlaying, setPreviewTime, randomizeBackgrounds, previewDuration,
    previewTime, fmtDuration, clipKind, setClipKind, setBackground, smartAiEnabled,
    setSmartAiEnabled, aiTooltipHover, setAiTooltipHover, isMasterSürüm, tierAtLeast, tier,
    hasMicroUnlock, tryUnlockElitFeature, applySmartBackgrounds, openPremium, setModal,
    activeOutput, outputs, setActiveOutputId, fmtSize, shareOutput, downloadVideo, user, setLoginTab, t, handleGenerate,
    generating, progress, generateCost, aspect, notify, setSelected, setAyahBackgrounds, setPickingFor,
    kendiSesAktifMi, onKendiSesAc,
  } = props;
  const onClipKindChangeRef = useRef(props.onClipKindChange ?? (() => {}));
  onClipKindChangeRef.current = props.onClipKindChange ?? onClipKindChangeRef.current;
  const [lowPower] = useState(lowPowerDevice);
  // ★ VİDEO HAZIR KUTLAMASI — yeni çıktı düştüğünde altın konfeti + İndir/Paylaş
  //   butonlarının olduğu kutu birkaç kez yumuşakça parlar. Saf DOM animasyonu:
  //   kütüphane yok, React state'i bozmaz, düşük donanımda bile hafif.
  const [kutlama, setKutlama] = useState(false);
  const sonCiktiIdRef = useRef<string | null>(null);
  useEffect(() => {
    const yeni = activeOutput?.id ?? null;
    if (!yeni || yeni === sonCiktiIdRef.current) { sonCiktiIdRef.current = yeni; return; }
    sonCiktiIdRef.current = yeni;
    setKutlama(true);
    const konfetiDizi = Array.from({ length: 24 }, (_, i) => i);
    const kutu = document.getElementById("video-hazir-kutusu");
    konfetiDizi.forEach((i) => {
      const tane = document.createElement("span");
      const renkler = ["#d7aa52", "#fbbf24", "#34d399", "#60a5fa", "#f472b6"];
      tane.style.cssText = `position:fixed;z-index:99990;pointer-events:none;width:${5 + (i % 4) * 2}px;height:${8 + (i % 3) * 3}px;left:${45 + (Math.sin(i * 7.3) * 40)}%;top:-12px;background:${renkler[i % renkler.length]};border-radius:${i % 2 ? "2px" : "50%"};opacity:.95;transition:transform ${1.6 + (i % 5) * 0.3}s cubic-bezier(.25,.46,.45,.94),opacity 2.2s ease-out;`;
      document.body.appendChild(tane);
      requestAnimationFrame(() => {
        tane.style.transform = `translate(${(Math.sin(i * 3.1) * 130)}px, ${window.innerHeight + 60}px) rotate(${180 + i * 24}deg)`;
        tane.style.opacity = "0";
      });
      window.setTimeout(() => tane.remove(), 2400);
    });
    if (kutu) {
      kutu.animate(
        [
          { boxShadow: "0 0 0 0 rgba(215,170,82,0)" },
          { boxShadow: "0 0 34px 5px rgba(215,170,82,.55)" },
          { boxShadow: "0 0 0 0 rgba(215,170,82,0)" },
        ],
        { duration: 1600, iterations: 3 },
      );
    }
    const timer = window.setTimeout(() => setKutlama(false), 2000);
    return () => window.clearTimeout(timer);
  }, [activeOutput?.id]);
  // ★ CANLI RAM ÖLÇÜMÜ: Chrome/Edge'in performance.memory API'si (non-standard)
  //   JS heap kullanımını verir. Üretim sırasında 2 sn'de bir okunur.
  //   Desteklemeyen tarayıcılarda (Safari/Firefox) gösterge hiç çizilmez — zararsız.
  const [ramMb, setRamMb] = useState<number | null>(null);
  useEffect(() => {
    if (!generating) { setRamMb(null); return; }
    const memory = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory;
    if (!memory) return; // Safari/Firefox: API yok, gösterge çizilmez
    const read = () => setRamMb(Math.round(memory.usedJSHeapSize / 1048576));
    read();
    const timer = window.setInterval(read, 2000);
    return () => window.clearInterval(timer);
  }, [generating]);

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
            {/* ★ HAYALET METİN KONUMU OKLARI — önizlemenin İÇİNDE.
                Beyaz ışıltı, 3 saniyede bir yanıp söner (reklam gibi sürekli değil),
                fare/dokunuş yaklaşınca tam görünür ve o yöne tıklayınca Arapça + meal
                önizlemede o yöne kayar. Mobilde soluk görünür (70%), dokununca tam. */}
            <div className="group/arrows pointer-events-none absolute inset-0 z-10">
              {/* Sol */}
              <button
                onClick={() => setTextOffset((o) => ({ ...o, x: Math.max(-30, o.x - 5) }))}
                className="pointer-events-auto absolute left-1.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full text-white drop-shadow-[0_0_6px_rgba(255,255,255,.9)] opacity-0 transition-all duration-300 group-hover/arrows:opacity-100 max-md:opacity-70 active:scale-90"
                title="Yazıları sola kaydır"
              >◀</button>
              {/* Sağ */}
              <button
                onClick={() => setTextOffset((o) => ({ ...o, x: Math.min(30, o.x + 5) }))}
                className="pointer-events-auto absolute right-1.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full text-white drop-shadow-[0_0_6px_rgba(255,255,255,.9)] opacity-0 transition-all duration-300 group-hover/arrows:opacity-100 max-md:opacity-70 active:scale-90"
                title="Yazıları sağa kaydır"
              >▶</button>
              {/* Yukarı */}
              <button
                onClick={() => setTextOffset((o) => ({ ...o, y: Math.max(-30, o.y - 5) }))}
                className="pointer-events-auto absolute left-1/2 top-1.5 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full text-white drop-shadow-[0_0_6px_rgba(255,255,255,.9)] opacity-0 transition-all duration-300 group-hover/arrows:opacity-100 max-md:opacity-70 active:scale-90"
                title="Yazıları yukarı kaydır"
              >▲</button>
              {/* Aşağı */}
              <button
                onClick={() => setTextOffset((o) => ({ ...o, y: Math.min(30, o.y + 5) }))}
                className="pointer-events-auto absolute bottom-1.5 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full text-white drop-shadow-[0_0_6px_rgba(255,255,255,.9)] opacity-0 transition-all duration-300 group-hover/arrows:opacity-100 max-md:opacity-70 active:scale-90"
                title="Yazıları aşağı kaydır"
              >▼</button>
              {/* Ortala — sadece ofset varken görünür */}
              {(textOffset.x !== 0 || textOffset.y !== 0) && (
                <button
                  onClick={() => setTextOffset({ x: 0, y: 0 })}
                  className="pointer-events-auto absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[11px] font-black text-white drop-shadow-[0_0_8px_rgba(255,255,255,.95)] opacity-0 transition-all duration-300 group-hover/arrows:opacity-100 max-md:opacity-80 active:scale-90"
                  title="Ortala (sıfırla)"
                >⟲</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {lowPower && <p className="text-center text-[8px] font-bold text-emerald-300/70">Performans modu aktif</p>}

      <div className="mx-auto flex w-full gap-1.5" style={{ maxWidth: previewWidth }}>
        <button onClick={() => setShowArapca(!showArapca)} className="flex-1 rounded-lg py-1.5 text-[9px] font-bold text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>{showArapca ? "Arapça Çıkar" : "Arapça Ekle"}</button>
        <button onClick={() => setShowSubMeal(!showSubMeal)} className="flex-1 rounded-lg py-1.5 text-[9px] font-bold text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>{showSubMeal ? "Meal Çıkar" : "Meal Ekle"}</button>
      </div>

      {/* ★ RENK ÇUBUĞU + ÖZEL YAZI (01.10) — stüdyo kontrol paneli.
          Çubuk: çerçeve iç kenarında dikey gökkuşağı şeridi; 12 renk düğmesi
          çubuğu 30° adımlarla döndürür, kalınlık slider'ı şeridi inceltir/kalınlaştırır.
          Kartlıkla (Ayet Kütüphanesi) AYNI çekirdek: mesajKatmani.ts. */}
      <div className="mx-auto max-w-[228px] space-y-1.5">
        <button
          type="button"
          onClick={() => setCubukAyar((c) => ({ ...c, acik: !c.acik }))}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg glass-soft py-1.5 text-[9px] font-bold text-white/60 transition hover:text-white"
        >
          <Palette size={11} style={{ color: "var(--accent)" }} /> Renk Çubuğu {cubukAyar.acik ? "açık" : "kapalı"}
        </button>
        {cubukAyar.acik && (
          <div className="space-y-1.5 rounded-lg border border-white/10 bg-black/25 p-2">
            {/* ★ İKİ DİKEY ÇUBUK — Arapça ve meal renkleri AYRI seçilir.
                Çubuk aşağıdan yukarı tüm renkleri taşır; sürükdükçe değişir.
                Kartlıkla (Ayet Kütüphanesi) aynı paletten beslenir. */}
            <div className="flex items-start justify-center gap-4">
              <CubukRenkSecici etiket="Arapça" deger={cubukAyar.donme} onSec={(d) => setCubukAyar((c) => ({ ...c, donme: d }))} />
              <CubukRenkSecici etiket="Meal" deger={cubukAyar.mealDonme} onSec={(d) => setCubukAyar((c) => ({ ...c, mealDonme: d }))} />
              <div className="flex flex-col items-center gap-1">
                <span className="text-[8px] font-bold text-white/50">Çerçeve</span>
                <button
                  type="button"
                  onClick={() => setCubukAyar((c) => ({ ...c, kalinlik: c.kalinlik > 0 ? 0 : 6 }))}
                  className={`h-5 w-10 rounded-full text-[7.5px] font-black transition ${cubukAyar.kalinlik > 0 ? "text-black" : "glass-soft text-white/50"}`}
                  style={cubukAyar.kalinlik > 0 ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}
                  title="Çerçeve boyunca renk şeridi aç/kapa"
                >
                  {cubukAyar.kalinlik > 0 ? "AÇIK" : "YOK"}
                </button>
                {cubukAyar.kalinlik > 0 && (
                  <input
                    type="range"
                    min={2}
                    max={14}
                    value={cubukAyar.kalinlik}
                    onChange={(e) => setCubukAyar((c) => ({ ...c, kalinlik: Number(e.target.value) }))}
                    className="mt-1 h-1 w-10 accent-[color:var(--accent)]"
                    title="Şerit kalınlığı"
                  />
                )}
              </div>
            </div>
            <p className="text-center text-[7.5px] text-white/35">Çubukta sürükle → renk seç · kartlıkla aynı</p>
          </div>
        )}

        {/* ★ ÖZEL YAZI — videonun içine çizilen mesaj; ayrı konum + hizalama + ofset */}
        <button
          type="button"
          onClick={() => setMesajAyar((m) => ({ ...m, acik: !m.acik }))}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg glass-soft py-1.5 text-[9px] font-bold text-white/60 transition hover:text-white"
        >
          <PenLine size={11} style={{ color: "var(--accent)" }} /> Özel Yazı {mesajAyar.acik && mesajAyar.metin.trim() ? "· aktif" : ""}
        </button>
        {mesajAyar.acik && (
          <div className="space-y-1.5 rounded-lg border border-white/10 bg-black/25 p-2">
            <textarea
              value={mesajAyar.metin}
              onChange={(e) => setMesajAyar((m) => ({ ...m, metin: e.target.value.slice(0, 90) }))}
              placeholder="Videonun içine yazılacak mesajın… (örn. Anneme hediye 💐)"
              rows={2}
              className="glass-soft w-full resize-none rounded-md px-2 py-1.5 text-[9.5px] text-white/90 outline-none placeholder:text-white/25"
            />
            <div className="grid grid-cols-2 gap-1">
              {(["ust", "orta", "alt"] as const).map((k) => (
                <button key={k} type="button" onClick={() => setMesajAyar((m) => ({ ...m, konum: k }))}
                  className={`rounded-md py-1 text-[8px] font-black transition ${mesajAyar.konum === k ? "text-black" : "glass-soft text-white/55 hover:text-white"}`}
                  style={mesajAyar.konum === k ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}>
                  {k === "ust" ? "↑ Üst" : k === "orta" ? "↕ Orta" : "↓ Alt"}
                </button>
              ))}
              {(["sol", "orta", "sag"] as const).map((k) => (
                <button key={k} type="button" onClick={() => setMesajAyar((m) => ({ ...m, hizalama: k }))}
                  className={`rounded-md py-1 text-[8px] font-black transition ${mesajAyar.hizalama === k ? "text-black" : "glass-soft text-white/55 hover:text-white"}`}
                  style={mesajAyar.hizalama === k ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}>
                  {k === "sol" ? "◧ Sol" : k === "orta" ? " ◨ Orta" : "◨ Sağ"}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between text-[8.5px] font-bold text-white/50">
              <span>Konum ayarı</span>
              <span className="text-[7.5px] text-white/35">ayet konumundan bağımsız</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              <button type="button" onClick={() => setMesajAyar((m) => ({ ...m, ofset: { ...m.ofset, x: Math.max(-40, m.ofset.x - 5) } }))} className="glass-soft rounded-md py-1 text-[9px] text-white/70 hover:text-white">◀</button>
              <button type="button" onClick={() => setMesajAyar((m) => ({ ...m, ofset: { ...m.ofset, x: Math.min(40, m.ofset.x + 5) } }))} className="glass-soft rounded-md py-1 text-[9px] text-white/70 hover:text-white">▶</button>
              <button type="button" onClick={() => setMesajAyar((m) => ({ ...m, ofset: { ...m.ofset, y: Math.max(-40, m.ofset.y - 5) } }))} className="glass-soft rounded-md py-1 text-[9px] text-white/70 hover:text-white">▲</button>
              <button type="button" onClick={() => setMesajAyar((m) => ({ ...m, ofset: { ...m.ofset, y: Math.min(40, m.ofset.y + 5) } }))} className="glass-soft rounded-md py-1 text-[9px] text-white/70 hover:text-white">▼</button>
            </div>
            <div className="flex items-center justify-between text-[8.5px] font-bold text-white/50">
              <span>Yazı boyutu</span>
              <span className="tabular-nums text-white/40">{mesajAyar.olcek}%</span>
            </div>
            <input type="range" min={70} max={160} step={5} value={mesajAyar.olcek}
              onChange={(e) => setMesajAyar((m) => ({ ...m, olcek: Number(e.target.value) }))}
              className="h-1 w-full accent-[color:var(--accent)]" />
            {(mesajAyar.ofset.x !== 0 || mesajAyar.ofset.y !== 0) && (
              <button type="button" onClick={() => setMesajAyar((m) => ({ ...m, ofset: { x: 0, y: 0 } }))}
                className="w-full rounded-md glass-soft py-1 text-[8.5px] font-bold text-white/60 hover:text-white">⟲ Konumu sıfırla</button>
            )}
          </div>
        )}
      </div>

      <div className="mx-auto flex items-center justify-center gap-2" style={{ maxWidth: previewWidth }}>
        <button disabled={verseIndex <= 0} onClick={() => { verseAudioRef.current?.pause(); setPreviewTime(0); setVerseIndex((index) => Math.max(0, index - 1)); }} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[.04] disabled:opacity-30"><ChevronLeft size={18} /></button>
        <button disabled={!selected.length} onClick={() => setPreviewPlaying((value) => {
          // ★ Önizleme HER ZAMAN ilk seçilen ayetten başlar — son seçilenden değil
          if (!value) { setVerseIndex(0); setPreviewTime(0); }
          return !value;
        })} className="flex h-12 w-12 items-center justify-center rounded-full text-black disabled:opacity-40" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>{previewPlaying ? <Pause size={18} fill="black" /> : <Play size={18} fill="black" />}</button>
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
        <Segmented value={clipKind} onChange={(kind) => { setClipKind(kind); onClipKindChangeRef.current?.(kind); if (background?.cat !== "yuklenenler") setBackground(randomClip(kind)); }} items={[{ id: "img", label: "Şablon V2", icon: ImageIcon }, { id: "vid", label: t("motion"), icon: Film }]} />
        {/* ★ Sayaç yalnızca admin'de görünür — kullanıcıya rakam göstermiyoruz */}
        {clipKind === "img" && isMasterSürüm && <p className="mt-1 text-center text-[9px] font-bold text-amber-300">{ADMIN_TEMPLATE_CLIPS.length.toLocaleString("tr-TR")} şablon hazır · Akıllı AI ayetinize uygun şablonu seçer</p>}
        {/* ★ KENDİ SESİNLE ÜRET (30.09) — ELİT özelliği: kullanıcının kendi okuyuşuyla
            milisanielik senkron. ELİT olmayan tıklarsa premium'a yönlendirilir (StudioApp'te). */}
        <button
          onClick={onKendiSesAc}
          className={`mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-[9.5px] font-black transition ${kendiSesAktifMi ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/40 hover:bg-emerald-500/25" : "bg-amber-500/10 text-amber-300 ring-1 ring-amber-400/30 hover:bg-amber-500/20"}`}
          title={kendiSesAktifMi ? "Kendi sesin aktif — ayetler senkron hazır" : "Kendi okuyuşunu yükle (ELİT)"}
        >
          {kendiSesAktifMi ? "🎙️ Kendi sesin aktif · yönet" : "🎙️ Kendi sesinle üret"}
          {!kendiSesAktifMi && <span className="rounded bg-amber-400/20 px-1 py-px text-[7px] font-black tracking-wide text-amber-200">ELİT</span>}
        </button>
      </div>

      {/* İNDİRME KLASÖRÜ — üç satır görünür, aşağı kaydırınca diğer çıktılar açılır */}
      {outputs.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[.02] p-3">
          <div className="mb-1.5 flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-[10px] font-black"><Video size={12} />İndirme Klasörü <span className="rounded-full bg-white/[.07] px-1.5 py-px text-[8px] font-black text-white/50">{outputs.length}</span></p>
          </div>
          <div className="scrollbar-thin grid max-h-[132px] gap-1 overflow-y-auto pr-0.5">
            {outputs.map((output, idx) => (
              <div key={output.id} className={`flex items-center gap-2 rounded-xl border px-2 py-1.5 transition ${output.id === activeOutput?.id ? "border-white/15 bg-white/[.06]" : "border-transparent hover:bg-white/[.03]"}`}>
                <button onClick={() => setActiveOutputId(output.id)} className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[8px] font-black" style={{ background: idx === 0 ? "linear-gradient(135deg,var(--accent-2),var(--accent))" : "rgba(255,255,255,.05)", color: idx === 0 ? "black" : "rgba(255,255,255,.5)" }}>
                  {idx + 1}
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[8px] font-bold text-white/80">{output.label}</p>
                  <p className="text-[7px] text-white/40">{fmtDuration(output.duration)} · {fmtSize(output.size)}</p>
                </div>
                <a href={user ? output.url : "#"} download={user ? `nur-studyo-${idx + 1}.${output.ext}` : undefined} onClick={(event) => { if (!user) { event.preventDefault(); setLoginTab("register"); setModal("login"); } }} className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/[.06] text-white/60 hover:text-white transition">
                  <Download size={10} />
                </a>
              </div>
            ))}
          </div>
          {/* Toplu İndir: her dosyayı tamamen aldıktan sonra sıradakine geçer */}
          {outputs.length > 1 && (
            <button
              onClick={async () => {
                if (!user) { setLoginTab("register"); setModal("login"); return; }
                try {
                  for (const [idx, output] of outputs.entries()) {
                    const response = await fetch(output.url);
                    if (!response.ok) throw new Error(`İndirme başarısız (${response.status})`);
                    const blob = await response.blob();
                    const a = document.createElement("a");
                    const objectUrl = URL.createObjectURL(blob);
                    a.href = objectUrl;
                    a.download = `nur-studyo-${idx + 1}.${output.ext}`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(objectUrl);
                  }
                  notify(`${outputs.length} video sırayla indirildi.`);
                } catch (error) {
                  console.error("[Toplu indirme]", error);
                  notify("İndirme sırasında bir video alınamadı.");
                }
              }}
              className="mt-2 flex w-full items-center justify-center gap-1 rounded-xl py-2 text-[9.5px] font-black text-black transition active:scale-[.98]"
              style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
            >
              <Download size={10} />{outputs.length} Videoyu İndir
            </button>
          )}
        </div>
      )}

      <div className="grid gap-2.5 sm:grid-cols-2">
        <div
          id="video-hazir-kutusu"
          className={`rounded-2xl border p-3.5 transition ${kutlama ? "border-amber-300/60" : "border-white/10"} bg-white/[.02]`}
        >
          {activeOutput ? (
            <>
              <p className="mb-2 flex items-center gap-2 text-[10px] font-black"><Video size={13} />{t("ready")}{kutlama && <span className="animate-bounce text-[11px]" aria-hidden>🎉</span>}</p>
              <p className="truncate text-[9px] text-white/60">{activeOutput.label}</p>
              <p className="mb-3 text-[8px] text-white/40">{fmtDuration(activeOutput.duration)} · {fmtSize(activeOutput.size)}</p>
              <div className="grid grid-cols-2 gap-1.5">
                <a href={user ? activeOutput.url : "#"} download={user ? `nur-studyo-${Date.now()}.${activeOutput.ext}` : undefined} onClick={(event) => { if (!user) { event.preventDefault(); setLoginTab("register"); setModal("login"); } }} className="flex items-center justify-center gap-1 rounded-xl py-2 text-[10px] font-black text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }} title="Videoyu cihazına kaydet"><Download size={12} />{t("download")}</a>
                <button onClick={() => user ? shareOutput(activeOutput) : (setLoginTab("register"), setModal("login"))} className="flex items-center justify-center gap-1 rounded-xl bg-white/[.06] py-2 text-[10px]" title="Cihazındaki uygulamalarla paylaş (WhatsApp, Instagram…)"><Share2 size={12} />{t("share")}</button>
              </div>
            </>
          ) : <p className="py-6 text-center text-[9px] text-white/30">Video çıktınız burada görünür</p>}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[.02] p-3.5">
          <p className="mb-2 flex items-center gap-2 text-[10px] font-black"><Wand2 size={13} />Akıllı AI <span className="rounded-full px-1.5 py-px text-[7.5px] font-black text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>ÜCRETSİZ</span></p>
          <p className="mb-3 text-[9px] text-white/45">{smartAiEnabled ? "Ayetlere göre sahne eşleştirme aktif — yeni eklenen her ayete uygun atmosfer kendiliğinden atanır." : "Kapalı — aç, ayetinin atmosferini AI kendisi seçsin."}</p>
          <button
            onMouseEnter={() => setAiTooltipHover(true)}
            onMouseLeave={() => setAiTooltipHover(false)}
            onClick={() => { setSmartAiEnabled(!smartAiEnabled); if (!smartAiEnabled) window.setTimeout(applySmartBackgrounds, lowPower ? 700 : 300); }}
            className="relative w-full rounded-xl py-2 text-[10px] font-black text-black"
            style={{ background: smartAiEnabled ? "#34d399" : "#ef4444" }}
          >
            {aiTooltipHover ? (smartAiEnabled ? "Kapat" : "Aç + Uygula") : smartAiEnabled ? <><Sparkles size={10} className="mr-1 inline" />AÇIK</> : <><X size={10} className="mr-1 inline" />KAPALI</>}
          </button>
        </div>
      </div>

      <div className="min-h-[74px] space-y-2">
        <button onClick={handleGenerate} className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-display text-[14px] font-black tracking-[.16em]" style={{ background: generating ? "#b91c1c" : "linear-gradient(135deg,var(--accent-2),var(--accent))", color: generating ? "white" : "black" }}>
          {generating ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
          {generating ? `%${progress} · ${t("stop")}` : isMasterSürüm ? `${t("generate")} · ADMIN` : `${t("generate")} · ${generateCost} ⚡ Üretim hakkı`}
        </button>
        {/* ★ CANLI RAM GÖSTERGESİ: üretim sırasında tarayıcı belleği MB bazlı izlenir.
            90 dk hatim gibi uzun üretimlerde bellek şişerse kullanıcı önceden görür. */}
        {generating && ramMb !== null && (
          <div className="flex items-center justify-between rounded-xl border px-3 py-1.5 text-[9px] font-bold" style={{
            borderColor: ramMb > 3000 ? "#ef4444" : ramMb > 1500 ? "#f59e0b" : "rgba(255,255,255,.12)",
            color: ramMb > 3000 ? "#ef4444" : ramMb > 1500 ? "#fbbf24" : "rgba(255,255,255,.55)",
            background: ramMb > 3000 ? "rgba(239,68,68,.08)" : "rgba(255,255,255,.03)",
          }}>
            <span>💾 Bellek: {ramMb} MB</span>
            <span className="opacity-70">{ramMb > 3000 ? "⚠️ yüksek — bitince indirin" : ramMb > 1500 ? "orta düzey" : "sağlıklı"}</span>
          </div>
        )}
      </div>
    </section>
  );
};
