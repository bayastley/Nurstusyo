import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, Film, Image as ImageIcon } from "lucide-react";
import type { Clip } from "../clips";
import { CATEGORY_PALETTE } from "../clips";
import { parseProc, proceduralDataUrl } from "../procedural";
import { getPosterUrl, getVideoUrl } from "../videoUrl";

interface AtmosphereCardProps {
  clip: Clip;
  active: boolean;
  onHover: (id: string | null) => void;
  onPick: () => void;
}

const CATEGORY_SYMBOL: Record<string, string> = {
  namaz: "🕌", musaf: "📖", cicekler: "🌸", yildizlar: "✨", cennet: "🌿",
  deniz: "🌊", daglar: "🏔️", gunbatimi: "🌅", gece: "🌙", selale: "💧",
  orman: "🌲", col: "🏜️", kar: "❄️", sehir: "🏙️", cami: "",
  desen: "❋", gol: "🏞️", bulut: "☁️", yuklenenler: "📁",
  ates: "🔥", cehennem: "⚡", hurma: "🌴", ari: "🐝", karinca: "🐜",
};

function hashSeed(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % 100000;
}

function isLowPowerDevice(): boolean {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  return Boolean(
    mobile ||
    nav.connection?.saveData ||
    (nav.deviceMemory !== undefined && nav.deviceMemory <= 4) ||
    (navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 4) ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export const AtmosphereCard: React.FC<AtmosphereCardProps> = ({ clip, active, onHover, onPick }) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [nearViewport, setNearViewport] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [posterLoaded, setPosterLoaded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [lowPower] = useState(isLowPowerDevice);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [posterUrl, setPosterUrl] = useState<string | undefined>(undefined);

  const palette = CATEGORY_PALETTE[clip.cat as keyof typeof CATEGORY_PALETTE];
  const accent = palette?.primary ?? "#d7aa52";
  const gradient = `${palette?.bg2 ?? "#1a1d2e"}, ${palette?.bg ?? "#0c0d12"}`;
  const procScene = useMemo(
    () => proceduralDataUrl(clip.cat, clip.pexelsId ?? hashSeed(clip.id)),
    [clip.cat, clip.id, clip.pexelsId],
  );
  const imageSource = useMemo(() => {
    const procedural = parseProc(clip.src);
    return procedural ? proceduralDataUrl(procedural.cat, procedural.seed) : clip.src;
  }, [clip.src]);

  // Cards outside the viewport release their media instead of retaining dozens of videos.
  useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setNearViewport(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setNearViewport(true);
      },
      { rootMargin: lowPower ? "40px" : "160px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [lowPower]);

  useEffect(() => {
    if (!nearViewport || clip.kind !== "vid") return;
    let alive = true;
    getPosterUrl(clip).then((url) => { if (alive) setPosterUrl(url); }).catch(() => undefined);
    return () => { alive = false; };
  }, [clip, nearViewport]);

  // ★ Performans: Galeride onlarca video aynı anda yüklenirse Chrome bellek/CPU şişer.
  //   Bu yüzden video dosyasını sadece kullanıcı kartın üstüne geldiğinde alıyoruz.
  //   Normal durumda sadece küçük poster/procedural görsel gösterilir.
  useEffect(() => {
    if (!nearViewport || clip.kind !== "vid" || !hovered) return;
    let alive = true;
    getVideoUrl(clip).then((url) => { if (alive) setVideoUrl(url); }).catch(() => setVideoFailed(true));
    return () => { alive = false; };
  }, [clip, nearViewport, hovered]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (hovered && nearViewport) {
      video.play().catch(() => undefined);
    } else if (!nearViewport) {
      video.pause();
      video.removeAttribute("src");
      video.load();
      setVideoUrl("");
      setVideoReady(false);
    } else {
      video.pause();
    }
  }, [hovered, nearViewport]);

  const enter = () => {
    setHovered(true);
    onHover(clip.id);
  };
  const leave = () => {
    setHovered(false);
    onHover(null);
  };

  return (
    <div
      ref={rootRef}
      onClick={onPick}
      onMouseEnter={enter}
      onMouseLeave={leave}
      className={`atmo-card group relative aspect-video cursor-pointer overflow-hidden rounded-xl border transition-transform duration-200 ${active ? "scale-[1.01] border-[color:var(--accent)] ring-2 ring-[color:var(--accent)]" : "border-white/10 hover:border-white/30"}`}
    >
      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${gradient})` }}>
        {!lowPower && <span className="absolute inset-0 opacity-50" style={{ backgroundImage: `radial-gradient(circle at 72% 18%, ${accent}40, transparent 55%)` }} />}
      </div>

      {nearViewport && clip.kind === "vid" && posterUrl && !videoReady && (
        <img
          src={posterUrl}
          alt=""
          loading="lazy"
          decoding="async"
          onLoad={() => setPosterLoaded(true)}
          onError={(event) => { event.currentTarget.src = procScene; setPosterLoaded(true); }}
          className={`absolute inset-0 h-full w-full object-cover ${posterLoaded ? "opacity-100" : "opacity-0"}`}
        />
      )}

      {nearViewport && clip.kind === "img" && !imageFailed && (
        <img
          src={imageSource}
          alt={clip.label}
          loading="lazy"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageFailed(true)}
          className={`absolute inset-0 h-full w-full object-cover ${imageLoaded ? "opacity-100" : "opacity-0"}`}
        />
      )}

      {nearViewport && clip.kind === "vid" && videoUrl && !videoFailed && (
        <video
          ref={videoRef}
          src={videoUrl}
          muted
          loop
          playsInline
          preload="metadata"
          onLoadedData={() => setVideoReady(true)}
          onCanPlay={() => setVideoReady(true)}
          onError={() => setVideoFailed(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${videoReady ? "opacity-100" : "opacity-0"}`}
        />
      )}

      {((clip.kind === "vid" && !posterLoaded && !videoReady) || (clip.kind === "img" && (!imageLoaded || imageFailed))) && (
        <img src={procScene} alt={clip.label} className="absolute inset-0 h-full w-full object-cover" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
      <div className="absolute left-2 right-2 top-2 flex items-center justify-between">
        <span className="flex items-center gap-1 rounded-md bg-black/60 px-2 py-0.5 text-[8px] font-bold text-white/90">
          {clip.kind === "vid" ? <Film size={10} style={{ color: accent }} /> : <ImageIcon size={10} style={{ color: accent }} />}
          {clip.kind === "vid" ? "HAREKETLI" : "GORSEL"}
        </span>
        {active && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--accent)] text-black"><Check size={11} strokeWidth={3} /></span>}
      </div>
      <p className="absolute bottom-2 left-2 right-2 truncate text-[10px] font-bold text-white">{clip.label}</p>
      {lowPower && clip.kind === "vid" && <span className="absolute bottom-2 right-2 text-[8px] text-white/45">{CATEGORY_SYMBOL[clip.cat] ?? ""}</span>}
    </div>
  );
};
