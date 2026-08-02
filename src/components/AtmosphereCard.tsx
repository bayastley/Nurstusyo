import React, { useRef, useState, useEffect, useMemo } from "react";
import { Film, Image as ImageIcon, Check } from "lucide-react";
import type { Clip } from "../clips";
import { CATEGORY_PALETTE } from "../clips";
import { proceduralDataUrl, parseProc } from "../procedural";
// ★ R2 imzalı URL katmanı — LIVE modda 10 dk geçerli presigned URL, DEMO'da mevcut public URL
import { getVideoUrl, getPosterUrl } from "../videoUrl";

interface AtmosphereCardProps {
  clip: Clip;
  active: boolean;
  onHover: (id: string | null) => void;
  onPick: () => void;
}

const categoryGradient = (cat: string): string => {
  const p = CATEGORY_PALETTE[cat as keyof typeof CATEGORY_PALETTE];
  if (!p) return "#1a1d2e, #0c0d12";
  return `${p.bg2}, ${p.bg}`;
};
const categoryAccent = (cat: string): string => {
  const p = CATEGORY_PALETTE[cat as keyof typeof CATEGORY_PALETTE];
  return p?.primary ?? "#d7aa52";
};

/** Kategoriye özel sembol — fallback'te film ikonu yerine, "bozuk" değil "tasarımsal" hissi */
const CATEGORY_SYMBOL: Record<string, string> = {
  namaz: "🕌", musaf: "📖", cicekler: "🌸", yildizlar: "✨", cennet: "🌿",
  deniz: "🌊", daglar: "🏔️", gunbatimi: "🌅", gece: "🌙", selale: "💧",
  orman: "🌲", col: "🏜️", kar: "❄️", sehir: "🏙️", cami: "",
  desen: "❋", gol: "🏞️", bulut: "☁️", yuklenenler: "📁",
  ates: "🔥", cehennem: "⚡", hurma: "🌴", ari: "🐝", karinca: "🐜",
};

/** Stabil sayısal seed — pexelsId yoksa id string'inden üret */
function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) % 100000;
}

/** Pexels poster için alternatif URL üret — mevcut format 404 ise ikinci şansı dene */
function posterCandidates(poster: string | undefined): string[] {
  if (!poster) return [];
  const out = [poster];
  const m = poster.match(/\/videos\/(\d+)\//);
  if (m) {
    const id = m[1];
    out.push(`https://images.pexels.com/videos/${id}/free-video-${id}.jpg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200`);
    out.push(`https://images.pexels.com/videos/${id}/picture-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200`);
  }
  return out;
}

export const AtmosphereCard: React.FC<AtmosphereCardProps> = ({
  clip,
  active,
  onHover,
  onPick,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  // ★ LAZY: kart ekranda görünene kadar HİÇBİR medya indirilmez → galeri anında açılır
  const [visible, setVisible] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [posterIdx, setPosterIdx] = useState(0);
  const [posterLoaded, setPosterLoaded] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  // ★ ÖNCE kendi CDN'in (R2), 404 dönerse otomatik Pexels'e düş
  const [useR2Video, setUseR2Video] = useState(Boolean(clip.r2));
  // ★ Video SADECE hover'da yüklenir — aynı anda onlarca R2 isteği gidip bağlantı resetlenmesin
  const [videoArmed, setVideoArmed] = useState(false);
  // ★ Resolved URL: LIVE modda backend'den gelen imzalı URL (10 dk geçerli),
  //   DEMO modda mevcut public URL. Cache dolu değilse Pexels public'e düşer.
  const [resolvedVideoUrl, setResolvedVideoUrl] = useState<string>(clip.r2 ?? clip.src);
  const [resolvedR2Poster, setResolvedR2Poster] = useState<string | undefined>(clip.r2Poster);
  const videoSrc = useR2Video && resolvedVideoUrl ? resolvedVideoUrl : clip.src;

  // ★ Video hover'da yüklenmeye başladığında imzalı URL'i çek (LIVE mode)
  useEffect(() => {
    if (!videoArmed || clip.kind !== "vid") return;
    let alive = true;
    getVideoUrl(clip).then((u) => { if (alive) setResolvedVideoUrl(u); }).catch(() => undefined);
    getPosterUrl(clip).then((p) => { if (alive && p) setResolvedR2Poster(p); }).catch(() => undefined);
    return () => { alive = false; };
  }, [videoArmed, clip]);

  const posters = useMemo(() => {
    // ★ Önce R2 poster (imzalı olabilir), açılmazsa Pexels poster ve türevlerini dene
    const list = [...posterCandidates(resolvedR2Poster), ...posterCandidates(clip.poster)];
    return Array.from(new Set(list.filter(Boolean)));
  }, [resolvedR2Poster, clip.poster]);
  // proc:// token'ı varsa ağsız sahne; yoksa gerçek fotoğraf URL'i
  const resolvedSrc = useMemo(() => {
    const pr = parseProc(clip.src);
    return pr ? proceduralDataUrl(pr.cat, pr.seed) : clip.src;
  }, [clip.src]);

  // ★ Şablon görseller için yedek URL zinciri — Pexels'in bazı poster
  //   kalıpları 404 dönüyor; alternatif kalıpları sırayla dene.
  const imgSources = useMemo(() => {
    if (clip.kind !== "img") return [resolvedSrc];
    const list = [resolvedSrc, ...posterCandidates(clip.src), ...posterCandidates(clip.poster)];
    return Array.from(new Set(list.filter(Boolean)));
  }, [clip.kind, clip.src, clip.poster, resolvedSrc]);

  useEffect(() => {
    if (clip.kind !== "vid") return;
    setVideoReady(false);
    setVideoFailed(false);
    setVideoArmed(false);
    setPosterLoaded(false);
    setPosterIdx(0);
  }, [clip.kind, clip.src]);

  useEffect(() => {
    if (clip.kind !== "img") return;
    setImgLoaded(false);
    setImgFailed(false);
    setImgIdx(0);
  }, [clip.kind, clip.src]);

  // ★ Kart görünüm alanına girince medyayı yüklemeye izin ver (200px önceden hazırla)
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") { setVisible(true); return; }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  const handleMouseEnter = () => {
    onHover(clip.id);
    // ★ Video'yu ilk hover'da yükle (poster zaten görünüyor)
    if (clip.kind === "vid" && !videoFailed) {
      setVideoArmed(true);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => undefined);
      }
    }
  };

  const handleMouseLeave = () => {
    onHover(null);
    if (clip.kind === "vid" && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const accent = categoryAccent(clip.cat);
  const symbol = CATEGORY_SYMBOL[clip.cat] ?? "✦";
  const showFallbackArt = (clip.kind === "vid" && !videoReady && !posterLoaded) || (clip.kind === "img" && (!imgLoaded || imgFailed));
  // ★ Ağsız procedural sahne — R2/Pexels erişilemezse kart yine dolu ve güzel görünür.
  // pexelsId'yi seed olarak kullanıp her karta farklı kategori sahnesi üretir.
  const procScene = useMemo(
    () => proceduralDataUrl(clip.cat, clip.pexelsId ?? hashSeed(clip.id)),
    [clip.cat, clip.pexelsId, clip.id]
  );

  return (
    <div
      ref={rootRef}
      onClick={onPick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`atmo-card group relative aspect-video cursor-pointer overflow-hidden rounded-xl border transition-all duration-300 ${
        active
          ? "border-[color:var(--accent)] ring-2 ring-[color:var(--accent)] scale-[1.02] shadow-xl"
          : "border-white/10 hover:border-white/30 hover:scale-[1.01]"
      }`}
    >
      {/* ★ KATMAN 1 — gradient + animasyonlu parıltı. HER ZAMAN. Asla siyah değil. */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${categoryGradient(clip.cat)})` }}>
        <span className="absolute inset-0 opacity-60" style={{ backgroundImage: `radial-gradient(circle at 72% 18%, ${accent}40, transparent 55%)` }} />
        <span className="absolute inset-0 opacity-40" style={{ backgroundImage: `radial-gradient(circle at 18% 82%, ${accent}28, transparent 60%)` }} />
        {/* Yavaş dönen geometrik halka — ambient hareket */}
        <span
          className="absolute left-1/2 top-1/2 h-[140%] w-[140%] -translate-x-1/2 -translate-y-1/2 opacity-[.07]"
          style={{
            backgroundImage: `repeating-conic-gradient(from 0deg, ${accent} 0deg 2deg, transparent 2deg 30deg)`,
            animation: "nur-spin 60s linear infinite",
          }}
        />
      </div>

      {/* ★ KATMAN 2 — poster (sadece görünürken indirilir) */}
      {clip.kind === "vid" && visible && posters[posterIdx] && (
        <img
          key={posters[posterIdx]}
          src={posters[posterIdx]}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setPosterLoaded(true)}
          onError={(e) => {
            if (posterIdx < posters.length - 1) {
              setPosterIdx((i) => i + 1);
            } else {
              setPosterLoaded(false);
              // Kırık resim ikonunu (404) engellemek için anında şık vektör sahnesine düş
              e.currentTarget.src = procScene;
            }
          }}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 group-hover:scale-105 ${
            posterLoaded && !videoReady ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      {/* ★ KATMAN 2b — yalnızca GERÇEK fotoğraf (yedek URL zincirli) */}
      {clip.kind === "img" && visible && !imgFailed && imgSources[imgIdx] && (
        <img
          key={imgSources[imgIdx]}
          src={imgSources[imgIdx]}
          alt={clip.label}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setImgLoaded(true)}
          onError={(e) => {
            if (imgIdx < imgSources.length - 1) {
              setImgLoaded(false);
              setImgIdx((i) => i + 1);
            } else {
              setImgFailed(true);
              // Tüm kalıplar 404 dönerse kırık ikon yerine şık vektör sahnesi
              e.currentTarget.src = procScene;
            }
          }}
          className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
        />
      )}

      {/* ★ KATMAN 3 — video: SADECE hover'da (videoArmed) yüklenir → R2 boğulmaz */}
      {clip.kind === "vid" && !videoFailed && videoArmed && (
        <video
          ref={videoRef}
          src={videoSrc}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          onLoadedMetadata={() => setVideoReady(true)}
          onLoadedData={() => setVideoReady(true)}
          onCanPlay={() => setVideoReady(true)}
          onError={() => {
            if (useR2Video) { setUseR2Video(false); setVideoReady(false); }
            else setVideoFailed(true);
          }}
          onStalled={() => { if (videoRef.current && videoRef.current.readyState < 1 && !useR2Video) setVideoFailed(true); }}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 group-hover:scale-105 ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      {/* ★ KATMAN 4 — AĞSIZ procedural 4K sahne. R2/Pexels erişilemezse kart yine dolu ve güzel. */}
      {showFallbackArt && (
        <>
          <img
            src={procScene}
            alt={clip.label}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1">
            <span
              className="select-none text-[38px] leading-none opacity-40 drop-shadow-lg transition-transform duration-700 group-hover:scale-110"
              style={{ filter: `drop-shadow(0 0 18px ${accent}88)` }}
            >
              {symbol}
            </span>
          </div>
        </>
      )}

      {/* Overlay Shader */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

      {/* Top badges */}
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
        <span className="flex items-center gap-1 rounded-md bg-black/60 px-2 py-0.5 text-[8px] font-bold text-white/90 backdrop-blur-md">
          {clip.kind === "vid" ? (
            <>
              <Film size={10} style={{ color: accent }} />
              <span>HAREKETLİ</span>
            </>
          ) : (
            <>
              <ImageIcon size={10} style={{ color: accent }} />
              <span>GÖRSEL</span>
            </>
          )}
        </span>

        {active && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--accent)] text-black shadow-lg">
            <Check size={11} strokeWidth={3} />
          </span>
        )}
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-2 left-2 right-2">
        <p className="truncate text-[10px] font-bold text-white group-hover:text-[color:var(--accent-2)] transition-colors drop-shadow">
          {clip.label}
        </p>
      </div>
    </div>
  );
};
