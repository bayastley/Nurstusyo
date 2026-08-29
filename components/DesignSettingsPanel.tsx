import React, { useEffect, useState } from "react";
import type { DesignSettingsPanelProps } from "./designSettingsTypes";
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
                      </span>
                      {/* ⚠️ Bu dosyanın orijinalinin geri kalanı (kâri satırı
                          detayları, kilit rozetleri, ses önizleme, mod/aspect
                          seçimi, tema ve metin ayarları) indirme kanalında
                          kesildi. Orijinal dosya:
                          https://raw.githubusercontent.com/bayastley/Nurstusyo/main/src/components/DesignSettingsPanel.tsx */}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
