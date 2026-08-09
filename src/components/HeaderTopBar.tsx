import React, { useEffect, useState } from "react";
import {
  Sparkles, Shuffle, FolderUp, Zap, ChevronDown, Clock, Smartphone, Palette, Wand2, Play, Pause,
} from "lucide-react";
import { SectionTitle, Segmented } from "./UIElements";
import { LockBadge, LockedOverlay } from "./LockBadge";
import { getVideoUrlSync, getPosterUrlSync } from "../videoUrl";
import { RISK_META } from "../data";
import { RECITERS } from "../reciters";
import { T } from "../i18n";
import { videoMaliyeti, reciterRequiredTier } from "../tier";
import { getFeatureLock } from "../services/adminSyncService";
import type { Clip } from "../clips";
import type { Mode, Aspect, ModalName, Tier } from "../types";

interface DesignSettingsPanelProps {
  setPickingFor: (id: string | null) => void;
  setModal: (modal: ModalName) => void;
  background: Clip;
  combinedAllClipsLength: number;
  randomizeBackgrounds: () => void;
  isMasterSürüm: boolean;
  sortedReciters: typeof RECITERS;
  reciterId: string;
  setReciterId: (id: string) => void;
  accessTier: Tier;
  openPremium: (tab?: "uyelik" | "jeton") => void;
  previewReciterId: string | null;
  playReciterPreview: (id: string) => void;
  mode: Mode;
  setMode: (m: Mode) => void;
  tierAtLeast: (have: Tier, need: Tier) => boolean;
  tier: Tier;
  MODES: Array<{ id: Mode; label: string; sub: string; icon: React.ElementType }>;
  ASPECTS: Array<{ id: Aspect; label: string; sub?: string; icon: React.ElementType }>;
  aspect: Aspect;
  setAspect: (a: Aspect) => void;
  batchFormats: Aspect[];
  setBatchFormats: React.Dispatch<React.SetStateAction<Aspect[]>>;
  tryUnlockElitFeature: (key: any, label: string) => boolean;
  hasMicroUnlock: (key: any) => boolean;
  arabicFont: string;
  setArabicFont: (f: string) => void;
  ARABIC_FONTS: Array<{ id: string; label: string; css: string }>;
  textSize: "kucuk" | "normal" | "buyuk";
  setTextSize: (s: "kucuk" | "normal" | "buyuk") => void;
  shimmerStyle: string;
  setShimmerStyle: (s: string) => void;
  SHIMMER_STYLES: Array<{ id: string; label: string; c1: string; c2: string; glow: string; still?: boolean }>;
  cardBg: "seffaf" | "koyu";
  setCardBg: (bg: "seffaf" | "koyu") => void;
  /** ★ Marka / kanal imzası (Elit + God Mode) — konum seçilebilir */
  brandSignature: string;
  setBrandSignature: (v: string) => void;
  brandPos: "sol-ust" | "sag-ust" | "sol-alt" | "sag-alt";
  setBrandPos: (v: "sol-ust" | "sag-ust" | "sol-alt" | "sag-alt") => void;
  setTextOffset: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  CINE_FILTERS: Array<{ id: string; label: string; css: string; tint?: string; tintAlpha?: number }>;
  cinematic: string;
  setCinematic: (c: string) => void;
  handleGenerate: () => void;
  generating: boolean;
  progress: number;
  t: (key: keyof (typeof T)["tr"]) => string;
}

export const DesignSettingsPanel: React.FC<DesignSettingsPanelProps> = ({
  setPickingFor,
  setModal,
  background,
  combinedAllClipsLength,
  randomizeBackgrounds,
  isMasterSürüm,
  sortedReciters,
  reciterId,
  setReciterId,
  accessTier,
  openPremium,
  previewReciterId,
  playReciterPreview,
  mode,
  setMode,
  tierAtLeast,
  tier,
  MODES,
  ASPECTS,
  aspect,
  setAspect,
  batchFormats,
  setBatchFormats,
  tryUnlockElitFeature,
  hasMicroUnlock,
  arabicFont,
  setArabicFont,
  ARABIC_FONTS,
  textSize,
  setTextSize,
  shimmerStyle,
  setShimmerStyle,
  SHIMMER_STYLES,
  cardBg,
  setCardBg,
  brandSignature,
  setBrandSignature,
  brandPos,
  setBrandPos,
  setTextOffset,
  CINE_FILTERS,
  cinematic,
  setCinematic,
  handleGenerate,
  generating,
  progress,
  t,
}) => {
  const [configVersion, setConfigVersion] = useState(0);
  useEffect(() => {
    const onUpdate = () => setConfigVersion((v) => v + 1);
    window.addEventListener("nur_config_updated", onUpdate);
    return () => window.removeEventListener("nur_config_updated", onUpdate);
  }, []);
  void configVersion;
  // Video Üret butonu orta panele taşındı — prop uyumu için korunuyor
  void handleGenerate; void generating; void progress;
  return (
    <section className="space-y-4">
      {/* Atmosphere Selection */}
      <div className="glass rounded-2xl p-4">
        <SectionTitle icon={Sparkles} title={t("atmosphere")} />
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setPickingFor(null); setModal("atmos"); }}
            className="group relative h-20 w-32 shrink-0 overflow-hidden rounded-xl border border-white/10"
          >
            {background ? (
              background.kind === "vid" ? (
                <video
                  src={getVideoUrlSync(background)}
                  poster={getPosterUrlSync(background) ?? background.poster}
                  muted
                  loop
                  playsInline
                  onError={(e) => { const v = e.currentTarget; if (v.src !== background.src) v.src = background.src; }}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />
              ) : (
                <img
                  src={background.src}
                  alt={background.label}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />
              )
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-white/5">
                <span className="text-[22px] opacity-60">🌌</span>
              </div>
            )}
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-2 pb-1.5 pt-6 text-left text-[8px] text-white/80">
              {background?.label ?? "Varsayılan"}
            </span>
          </button>
          <div className="grid flex-1 gap-1.5">
            <button onClick={() => setModal("atmos")} className="glass-soft rounded-lg px-3 py-2 text-[10px] font-semibold text-white/70">
              {t("atmoLibrary")} ({combinedAllClipsLength})
            </button>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => randomizeBackgrounds()}
                className="flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[10px] font-bold text-black"
                style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
              >
                <Shuffle size={11} />{t("randomAll")}
              </button>
              {isMasterSürüm ? (
                <button type="button" onClick={() => setModal("zip")} className="glass-soft flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[10px] font-bold text-white/70">
                  <FolderUp size={11} /> ZIP / Image
                </button>
              ) : (
                <span className="relative flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[10px] font-bold glass-soft text-white/30 cursor-not-allowed">
                  <FolderUp size={11} /> ZIP / Image
                  <LockBadge kind="v3" position="top-right" tooltipText="V3 Güncellemesi Yakında" />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reciter Selection */}
      <div className="glass rounded-2xl p-4">
        <SectionTitle icon={Zap} title="⚡ HOCA / TİLAVET" />
        <div className="mb-3 flex items-center justify-center gap-3 text-[8px] font-bold uppercase tracking-wider">
          {(["low", "mid", "high"] as const).map((risk) => {
            const c = risk === "low" ? "#34d399" : risk === "mid" ? "#fbbf24" : "#f87171";
            return (
              <span key={risk} className="flex items-center gap-1" style={{ color: c }}>
                <span className="h-2 w-2 rounded-full" style={{ background: c }} />
                {risk === "low" ? "Düşük" : risk === "mid" ? "Orta" : "Yüksek"}
              </span>
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(["Haram", "Telif"] as const).map((group) => (
            <div key={group} className="max-h-64 overflow-y-auto pr-1 scrollbar-thin">
              <p className="mb-1.5 flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-white/30">
                {group === "Haram" ? "KÂBE İMAMLARI" : "TELİF KÂRİLER"} <ChevronDown size={9} className="-rotate-90" />
              </p>
              <div className="space-y-0.5">
                {sortedReciters.filter((item) => item.makam === group).map((item) => {
                  const risk = RISK_META[item.risk];
                  const active = item.id === reciterId;
                  const dynamicLock = getFeatureLock(item.id, "free");
                  const requiredTier = dynamicLock === "pro" || dynamicLock === "elit" ? dynamicLock : reciterRequiredTier(item);
                  const maintenanceLocked = dynamicLock === "maintenance" || dynamicLock === "off";
                  const reciterLocked = maintenanceLocked || !tierAtLeast(accessTier, requiredTier);
                  const riskPercent = item.telifRiski ?? risk.percent;
                  const riskColor = item.risk === "low" ? "#34d399" : item.risk === "mid" ? "#fbbf24" : "#f87171";
                  return (
                    <button
                      key={item.id}
                      onClick={() => { if (reciterLocked) { openPremium("uyelik"); return; } setReciterId(item.id); }}
                      className={`group relative flex w-full items-center gap-2 rounded-lg px-1.5 py-1 text-left transition ${
                        active ? "bg-white/[.07] ring-1 ring-[color:var(--accent)]" : reciterLocked ? "opacity-45 hover:bg-white/[.04]" : "hover:bg-white/[.04]"
                      }`}
                    >
                      <span className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-black shadow-inner" style={{ background: `linear-gradient(135deg,${item.color},#fff)` }}>
                        {item.initial}
                        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border border-[#0c0d12]" style={{ background: riskColor }} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[9.5px] font-bold text-white/90 leading-tight">
                          {item.name}
                          {item.surahPattern && <span className="ml-1 rounded bg-white/10 px-1 py-0.5 text-[6.5px] font-black uppercase tracking-wide text-white/50" title="Bu hocada sadece tam sure kaydı mevcut, ayet ayet tilavet yok">Tam Sure</span>}
                        </span>
                        <span className="mt-0.5 flex items-center gap-1 truncate text-[7.5px] leading-tight">
                          <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: riskColor }} />
                          <span className="font-bold shrink-0" style={{ color: riskColor }}>{risk.label} %{riskPercent}</span>
                          <span className="text-white/35 truncate">• {item.country}</span>
                        </span>
                      </span>
                      {reciterLocked && <LockBadge kind={maintenanceLocked ? "maintenance" : requiredTier === "pro" ? "pro" : "elit"} onUpgrade={() => openPremium("uyelik")} position="top-right" />}
                      <span
                        role="button"
                        title={reciterLocked ? "Üyelik gerekli" : "Ses örneğini çal"}
                        className={`rounded-full p-1 shrink-0 transition ${previewReciterId === item.id ? "text-black bg-[color:var(--accent)]" : "bg-white/10 text-white/70 opacity-70 group-hover:opacity-100 group-hover:bg-white/20"}`}
                        onClick={(event) => { event.stopPropagation(); if (reciterLocked) openPremium("uyelik"); else playReciterPreview(item.id); }}
                      >
                        {previewReciterId === item.id ? <Pause size={8} /> : <Play size={8} />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Duration & Format */}
      <div className="glass grid gap-4 rounded-2xl p-4 xl:grid-cols-2">
        <div>
          <SectionTitle icon={Clock} title={t("mode")} />
          <Segmented
            value={mode}
            onChange={setMode}
            items={MODES.map((item) => ({
              ...item,
              label: item.id === "short" ? t("modeShort") : item.id === "long" ? t("modeLong") : t("modeFull"),
              sub: `${item.sub} · ${videoMaliyeti(item.id, tier)} jeton`,
            }))}
          />
        </div>
        <div>
          <SectionTitle icon={Smartphone} title={t("format")} />
          <Segmented
            value={aspect}
            onChange={setAspect}
            isLocked={(id) => id !== "9:16" && !tierAtLeast(accessTier, "pro")}
            onLocked={() => openPremium("uyelik")}
            lockLabel={() => "Pro Üyelik Gerekir"}
            items={ASPECTS}
          />
          <div className="mt-2 flex gap-1">
            {(["9:16", "1:1", "16:9", "4:5"] as Aspect[]).map((item) => {
              const active = batchFormats.includes(item);
              const locked = item !== "9:16" && !tierAtLeast(accessTier, "pro");
              return (
                <button
                  key={item}
                  onClick={() => {
                    if (locked) { openPremium("uyelik"); return; }
                    if (!active && batchFormats.length >= 1 && !tierAtLeast(accessTier, "elit")) {
                      if (!tryUnlockElitFeature("batch", "Toplu Üretim")) return;
                    }
                    setBatchFormats((current) => active ? current.filter((entry) => entry !== item) : [...current, item]);
                  }}
                  className={`relative flex-1 rounded-lg py-1 text-[8px] font-bold transition ${active ? "text-black" : "glass-soft text-white/35"}`}
                  style={active ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}
                >
                  {item}
                  {locked && <span className="ml-1 text-[7px] text-amber-300">PRO</span>}
                  {!locked && !tierAtLeast(accessTier, "elit") && !hasMicroUnlock("batch") && <span className="ml-1 text-[7px] text-amber-300">ELİT</span>}
                  {!tierAtLeast(accessTier, "elit") && hasMicroUnlock("batch") && <span className="ml-1 text-[7px] text-emerald-400">24s AÇIK</span>}
                  {isMasterSürüm && <span className="ml-1 text-[7px] text-emerald-400">ADMIN</span>}
                </button>
              );
            })}
          </div>
          <div className="mt-1.5 text-center text-[8px] text-white/30">
            Üç formatı aynı anda indirme: <span className="font-black text-amber-300">ELİT</span> ya da {videoMaliyeti("short", tier)} jetonla 24 saatlik açma
          </div>
        </div>
      </div>

      {/* Typography & Design + Cinematic Filter */}
      <div className="grid gap-3 md:grid-cols-2">
        {/* Typography (Elit) */}
        <div className="glass relative rounded-2xl p-3">
          <div className="flex items-center justify-between mb-2 border-b border-white/5 pb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-md" style={{ background: "rgba(255,255,255,.05)", color: "var(--accent)" }}>
                <Palette size={11} />
              </span>
              <h2 className="font-display text-[10.5px] font-bold tracking-wider text-white/90">Yazı & Tasarım</h2>
            </div>
            {!tierAtLeast(accessTier, "elit") && <span className="rounded px-1.5 py-0.5 text-[7.5px] font-black text-black" style={{ background: "linear-gradient(135deg,#e8d48a,#8b6914)" }}>ELİT</span>}
          </div>
          {/* ★ Kilit sadece içeriği kapsar — başlık her zaman görünür */}
          <div className="relative">
          <div className="grid grid-cols-2 gap-1.5">
            <label className="block">
              <span className="mb-0.5 block text-[8.5px] font-bold uppercase tracking-wider text-white/45">Arapça Font</span>
              <select value={arabicFont} onChange={(e) => setArabicFont(e.target.value)} className="glass-soft w-full rounded-lg px-1.5 py-1 text-[9.5px] outline-none">
                {ARABIC_FONTS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-0.5 block text-[8.5px] font-bold uppercase tracking-wider text-white/45">Yazı Boyutu</span>
              <select value={textSize} onChange={(e) => setTextSize(e.target.value as typeof textSize)} className="glass-soft w-full rounded-lg px-1.5 py-1 text-[9.5px] outline-none">
                <option value="kucuk">Küçük</option>
                <option value="normal">Normal</option>
                <option value="buyuk">Büyük (Önerilen)</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-0.5 block text-[8.5px] font-bold uppercase tracking-wider text-white/45">Yazı Işıltısı</span>
              <select value={shimmerStyle} onChange={(e) => setShimmerStyle(e.target.value)} className="glass-soft w-full rounded-lg px-1.5 py-1 text-[9.5px] outline-none">
                {SHIMMER_STYLES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-0.5 block text-[8.5px] font-bold uppercase tracking-wider text-white/45">Kart Arka Planı</span>
              <select value={cardBg} onChange={(e) => setCardBg(e.target.value as typeof cardBg)} className="glass-soft w-full rounded-lg px-1.5 py-1 text-[9.5px] outline-none">
                <option value="seffaf">Şeffaf</option>
                <option value="koyu">Koyu Kart</option>
              </select>
            </label>
          </div>

          {/* ★ MARKA / KANAL İMZASI — Elit üyeler + God Mode · konum seçilebilir */}
          {(isMasterSürüm || tierAtLeast(accessTier, "elit")) && (
            <div className="mt-2 space-y-1.5">
              <span className="flex items-center gap-1 text-[8.5px] font-bold uppercase tracking-wider text-amber-300">
                🛡️ Marka / Kanal İmzanız
                <span className="rounded bg-amber-500/20 px-1 py-0.5 text-[6.5px] font-black text-amber-300">
                  {isMasterSürüm ? "ADMİN" : "ELİT"}
                </span>
              </span>
              <input
                value={brandSignature}
                onChange={(e) => setBrandSignature(e.target.value)}
                maxLength={28}
                placeholder="@nurstudyo"
                className="glass-soft w-full rounded-lg px-2 py-1.5 text-[10px] font-bold text-white outline-none focus:border-[color:var(--accent)]"
              />

              <span className="block text-[8px] font-bold uppercase tracking-wider text-white/45">
                İmza Konumu
              </span>
              <div className="grid grid-cols-2 gap-1">
                {([
                  { id: "sol-ust", label: "↖ Sol Üst" },
                  { id: "sag-ust", label: "↗ Sağ Üst" },
                  { id: "sol-alt", label: "↙ Sol Alt" },
                  { id: "sag-alt", label: "↘ Sağ Alt" },
                ] as const).map((pos) => (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => setBrandPos(pos.id)}
                    className={`rounded-lg px-2 py-1.5 text-[9px] font-bold transition ${
                      brandPos === pos.id
                        ? "text-black shadow-md"
                        : "glass-soft text-white/50 hover:text-white/80"
                    }`}
                    style={brandPos === pos.id ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
              <span className="block text-[8px] leading-relaxed text-white/35">
                Altın renkte görünür · <b className="text-white/50">Sol Üst</b> önerilir (meal yazısıyla çakışmaz) · boş bırakılırsa gizlenir
              </span>
            </div>
          )}
          {/* Metin konum pedi */}
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[8.5px] font-bold uppercase tracking-wider text-white/45">Metin Konumu</span>
            <div className="grid grid-cols-3 gap-0.5">
              <span />
              <button onClick={() => setTextOffset((o) => ({ ...o, y: Math.max(-30, o.y - 5) }))} aria-label="Yukarı" className="glass-soft flex h-5 w-6 items-center justify-center rounded text-white/60 hover:text-white"><ChevronDown size={10} className="rotate-180" /></button>
              <span />
              <button onClick={() => setTextOffset((o) => ({ ...o, x: Math.max(-40, o.x - 5) }))} aria-label="Sola" className="glass-soft flex h-5 w-6 items-center justify-center rounded text-white/60 hover:text-white"><ChevronDown size={10} className="rotate-90" /></button>
              <button onClick={() => setTextOffset({ x: 0, y: 0 })} aria-label="Sıfırla" className="glass-soft flex h-5 w-6 items-center justify-center rounded text-[8px] font-black text-[color:var(--accent)] hover:brightness-125">⟲</button>
              <button onClick={() => setTextOffset((o) => ({ ...o, x: Math.min(40, o.x + 5) }))} aria-label="Sağa" className="glass-soft flex h-5 w-6 items-center justify-center rounded text-white/60 hover:text-white"><ChevronDown size={10} className="-rotate-90" /></button>
              <span />
              <button onClick={() => setTextOffset((o) => ({ ...o, y: Math.min(30, o.y + 5) }))} aria-label="Aşağı" className="glass-soft flex h-5 w-6 items-center justify-center rounded text-white/60 hover:text-white"><ChevronDown size={10} /></button>
              <span />
            </div>
          </div>
          {!tierAtLeast(accessTier, "elit") && (
            <LockedOverlay kind="elit" onUpgrade={() => openPremium("uyelik")} rounded="rounded-xl" />
          )}
          </div>
        </div>

        {/* Cinematic Filter (Pro) */}
        <div className="glass relative rounded-2xl p-3">
          <div className="flex items-center justify-between mb-2 border-b border-white/5 pb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-md" style={{ background: "rgba(255,255,255,.05)", color: "var(--accent)" }}>
                <Wand2 size={11} />
              </span>
              <h2 className="font-display text-[10.5px] font-bold tracking-wider text-white/90">Sinematik Filtre</h2>
            </div>
            {!tierAtLeast(accessTier, "pro") && <span className="rounded px-1.5 py-0.5 text-[7.5px] font-black text-black" style={{ background: "linear-gradient(135deg,#f5dda6,#d7aa52)" }}>PRO</span>}
          </div>
          {/* ★ Kilit sadece içeriği kapsar — başlık her zaman görünür */}
          <div className="relative">
          <div className="grid grid-cols-2 gap-1">
            {CINE_FILTERS.map((f) => {
              const on = cinematic === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setCinematic(f.id)}
                  className={`relative overflow-hidden rounded-lg border px-2 py-1.5 text-left text-[9px] font-bold transition-all duration-200 ${
                    on ? "border-[color:var(--accent)] text-[color:var(--accent-2)] shadow-md" : "glass-soft text-white/60 hover:text-white hover:border-white/25"
                  }`}
                  style={on ? { background: `linear-gradient(135deg, ${f.tint ?? "#3a2c10"}55, rgba(12,13,18,.6))` } : undefined}
                >
                  <span className="relative z-10 block truncate">{f.label}</span>
                  {on && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full animate-glow" style={{ background: "var(--accent)" }} />}
                </button>
              );
            })}
          </div>
          {!tierAtLeast(accessTier, "pro") && (
            <LockedOverlay kind="pro" onUpgrade={() => openPremium("uyelik")} rounded="rounded-xl" />
          )}
          </div>
        </div>
      </div>

      {/* ★ Video Üret butonu, Akıllı AI'nin altına (orta panele) taşındı */}
    </section>
  );
};
