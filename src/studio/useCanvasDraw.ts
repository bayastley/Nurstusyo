// ════════════════════════════════════════════════════════
// USE CANVAS DRAW — StudioApp.tsx'den ayrıldı
// Canvas önizleme motoru: Arapça metin, meal, shimmer,
// filigran, video/poster render, kaleidoscope
// ════════════════════════════════════════════════════════

import { useEffect, type RefObject, type MutableRefObject } from "react";
import { CATEGORY_PALETTE } from "../clips";
import { getVideoUrlSync, getPosterUrlSync } from "../videoUrl";
import { toHiRes } from "../clips";
import { dimensions } from "./studioHelpers";
import type { Clip, CatId } from "../clips";
import type { SelectedAyah, Aspect, Tier } from "../types";

interface CanvasDrawParams {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  selectedRef: MutableRefObject<SelectedAyah[]>;
  verseIndexRef: MutableRefObject<number>;
  backgroundRef: MutableRefObject<Clip>;
  ayahBackgroundsRef: MutableRefObject<Record<string, Clip>>;
  aspectRef: MutableRefObject<Aspect>;
  themeRef: MutableRefObject<{ bg: string; bg2: string; acc: string; acc2: string }>;
  videoWatchdog: MutableRefObject<Map<HTMLVideoElement, { t: number; at: number }>>;
  imageCache: MutableRefObject<Map<string, HTMLImageElement>>;
  videoCache: MutableRefObject<Map<string, HTMLVideoElement>>;
  ensureImage: (url: string) => HTMLImageElement;
  ensureVideo: (url: string, fallback?: string) => HTMLVideoElement;
  showArapca: boolean;
  showSubMeal: boolean;
  accessTier: Tier;
  arabicFontCss: string;
  textSizeMul: number;
  shimmerCfg: { c1: string; c2: string; glow: string; still?: boolean };
  cardBg: "seffaf" | "koyu";
  textOffset: { x: number; y: number };
  cineFilter: { css: string; tint?: string; tintAlpha?: number };
  isMasterSürüm: boolean;
  brandSignature: string;
  brandPos: "sol-ust" | "sag-ust" | "sol-alt" | "sag-alt";
  previewFps: number;
  user: unknown;
}

export function useCanvasDraw(p: CanvasDrawParams) {
  useEffect(() => {
    let frame = 0, tick = 0, lastPreviewDraw = 0;

    const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
      const lines: string[] = [];
      let line = "";
      const pushHard = (word: string) => {
        let chunk = "";
        for (const ch of word) {
          const cand = chunk + ch;
          if (chunk && ctx.measureText(cand).width > maxWidth) { lines.push(chunk); chunk = ch; }
          else chunk = cand;
        }
        return chunk;
      };
      text.split(/\s+/).filter(Boolean).forEach((word) => {
        if (ctx.measureText(word).width > maxWidth) {
          if (line) { lines.push(line); line = ""; }
          line = pushHard(word);
          return;
        }
        const candidate = line ? `${line} ${word}` : word;
        if (line && ctx.measureText(candidate).width > maxWidth) { lines.push(line); line = word; }
        else line = candidate;
      });
      if (line) lines.push(line);
      return lines;
    };

    const cover = (ctx: CanvasRenderingContext2D, source: CanvasImageSource & { videoWidth?: number; videoHeight?: number; naturalWidth?: number; naturalHeight?: number }, width: number, height: number, zoom = 1) => {
      const sw = source.videoWidth || source.naturalWidth || 0, sh = source.videoHeight || source.naturalHeight || 0;
      if (!sw || !sh) return false;
      const scale = Math.max(width / sw, height / sh) * zoom, dw = sw * scale, dh = sh * scale;
      ctx.drawImage(source, (width - dw) / 2, (height - dh) / 2, dw, dh);
      return true;
    };

    const drawKaleidoscope = (ctx: CanvasRenderingContext2D, width: number, height: number, t2: number, theme: { bg: string; bg2: string; acc: string; acc2: string }, palette: { primary: string; secondary: string; glow: string; bg: string; bg2: string } | null) => {
      const bg = palette?.bg ?? theme.bg, bg2 = palette?.bg2 ?? theme.bg2;
      const acc = palette?.primary ?? theme.acc, acc2 = palette?.secondary ?? theme.acc2, glow = palette?.glow ?? theme.acc2;
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) * 0.75);
      bgGrad.addColorStop(0, bg2); bgGrad.addColorStop(0.55, bg); bgGrad.addColorStop(1, "#000000");
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, width, height);
      const cx = width / 2, cy = height / 2, t = t2 * 0.008;
      const breathe = 0.85 + Math.sin(t * 0.7) * 0.12, baseR = Math.min(width, height) * 0.32 * breathe, petals = 8;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * 0.15); ctx.strokeStyle = glow + "55"; ctx.lineWidth = 1;
      for (let r = 0; r < 3; r++) { const rr = baseR * (1.2 + r * 0.22); ctx.beginPath(); ctx.arc(0, 0, rr, 0, Math.PI * 2); ctx.stroke(); }
      ctx.restore();
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      ctx.save(); ctx.translate(cx, cy);
      if (!isMobile) ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < petals; i++) {
        ctx.save(); ctx.rotate((i / petals) * Math.PI * 2 + t * 0.08);
        const pLen = baseR * (1 + Math.sin(t + i * 0.4) * 0.15), pWid = baseR * 0.38;
        const grad = ctx.createLinearGradient(0, 0, 0, -pLen);
        grad.addColorStop(0, acc + "99"); grad.addColorStop(0.5, acc2 + (isMobile ? "33" : "55")); grad.addColorStop(1, acc + "00");
        ctx.fillStyle = grad; ctx.beginPath(); ctx.moveTo(0, 0);
        ctx.bezierCurveTo(pWid, -pLen * 0.35, pWid * 0.7, -pLen * 0.85, 0, -pLen);
        ctx.bezierCurveTo(-pWid * 0.7, -pLen * 0.85, -pWid, -pLen * 0.35, 0, 0); ctx.fill(); ctx.restore();
      }
      for (let i = 0; i < petals; i++) {
        ctx.save(); ctx.rotate((i / petals) * Math.PI * 2 - t * 0.12 + Math.PI / petals);
        const pLen = baseR * 0.55 * (1 + Math.sin(t * 1.3 + i) * 0.1), pWid = baseR * 0.18;
        const grad = ctx.createLinearGradient(0, 0, 0, -pLen);
        grad.addColorStop(0, acc2 + (isMobile ? "66" : "aa")); grad.addColorStop(1, acc2 + "00");
        ctx.fillStyle = grad; ctx.beginPath(); ctx.moveTo(0, 0);
        ctx.bezierCurveTo(pWid, -pLen * 0.4, pWid * 0.5, -pLen * 0.9, 0, -pLen);
        ctx.bezierCurveTo(-pWid * 0.5, -pLen * 0.9, -pWid, -pLen * 0.4, 0, 0); ctx.fill(); ctx.restore();
      }
      const coreR = baseR * 0.12 * (1 + Math.sin(t * 2) * 0.2);
      const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, coreR * 3);
      coreGrad.addColorStop(0, acc2 + "ff"); coreGrad.addColorStop(0.4, acc + "88"); coreGrad.addColorStop(1, acc + "00");
      ctx.fillStyle = coreGrad; ctx.beginPath(); ctx.arc(0, 0, coreR * 3, 0, Math.PI * 2); ctx.fill();
      for (let i = 0; i < 24; i++) {
        const angle = (i / 24) * Math.PI * 2 + t * 0.3, dist = baseR * (0.7 + Math.sin(t * 0.5 + i * 1.7) * 0.5);
        const px = Math.cos(angle) * dist, py = Math.sin(angle) * dist, sz = 1 + Math.sin(t * 2 + i) * 0.8;
        const alpha = 0.3 + Math.sin(t * 3 + i * 0.9) * 0.3;
        ctx.fillStyle = acc2 + Math.round(alpha * 255).toString(16).padStart(2, "0");
        ctx.beginPath(); ctx.arc(px, py, sz, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore(); ctx.globalCompositeOperation = "source-over";
  };

    const draw = () => {
      const nowFrame = performance.now();
      if (lastPreviewDraw && nowFrame - lastPreviewDraw < 1000 / p.previewFps) { frame = requestAnimationFrame(draw); return; }
      lastPreviewDraw = nowFrame;
      const canvas = p.canvasRef.current;
      if (canvas) {
        const [width, height] = dimensions(p.aspectRef.current);
        if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
        const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
        if (ctx) {
          tick += 1;
          ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
          const currentItems = p.selectedRef.current, currentIndex = Math.min(p.verseIndexRef.current, Math.max(currentItems.length - 1, 0)), currentAyah = currentItems[currentIndex];
          const clip = (currentAyah && p.ayahBackgroundsRef.current[currentAyah.id]) || p.backgroundRef.current, currentTheme = p.themeRef.current;
          ctx.fillStyle = currentTheme.bg; ctx.fillRect(0, 0, width, height); let painted = false;
          const zoom = 1.03 + Math.sin(tick / 500) * 0.012;
          if (p.cineFilter.css !== "none") { try { ctx.filter = p.cineFilter.css; } catch { /* ignore */ } }
          if (clip.kind === "vid") {
            const primaryUrl = getVideoUrlSync(clip), posterUrl = getPosterUrlSync(clip), video = p.ensureVideo(primaryUrl, clip.src);
            if (video.paused && !video.ended && video.readyState >= 1) { video.play().catch(() => undefined); }
            {
              const nowMs = performance.now(), wd = p.videoWatchdog.current.get(video) ?? { t: -1, at: nowMs };
              if (video.currentTime !== wd.t) { wd.t = video.currentTime; wd.at = nowMs; }
              else if (nowMs - wd.at > 300) {
                try { const dur = Number.isFinite(video.duration) ? video.duration : 0; if (video.ended || (dur > 0 && video.currentTime >= dur - 0.05)) video.currentTime = 0; video.play().catch(() => undefined); } catch { /* ignore */ }
                wd.at = nowMs;
              }
              p.videoWatchdog.current.set(video, wd);
            }
            if (video.readyState >= 1 && video.videoWidth > 0) painted = cover(ctx, video, width, height, 1.015);
            if (!painted && clip.poster) {
              const poster = p.ensureImage(posterUrl ?? clip.poster);
              if (poster.complete && poster.naturalWidth > 0) painted = cover(ctx, poster, width, height, zoom);
              if (!painted) { const p2 = p.ensureImage(clip.poster); if (p2.complete && p2.naturalWidth > 0) painted = cover(ctx, p2, width, height, zoom); }
            }
          } else {
            const hi = p.ensureImage(toHiRes(clip.src));
            if (hi.complete && hi.naturalWidth > 0) painted = cover(ctx, hi, width, height, zoom);
            if (!painted) { const img = p.ensureImage(clip.src); if (img.complete) painted = cover(ctx, img, width, height, zoom); }
          }
          try { ctx.filter = "none"; } catch { /* ignore */ }
          if (painted && p.cineFilter.tint) { ctx.globalAlpha = p.cineFilter.tintAlpha ?? 0.1; ctx.fillStyle = p.cineFilter.tint; ctx.fillRect(0, 0, width, height); ctx.globalAlpha = 1; }
          if (!painted) { const palette = CATEGORY_PALETTE[clip.cat as CatId] ?? null; drawKaleidoscope(ctx, width, height, tick, currentTheme, palette); }
          const shade = ctx.createLinearGradient(0, 0, 0, height); shade.addColorStop(0, "rgba(0,0,0,.42)"); shade.addColorStop(.42, "rgba(0,0,0,.22)"); shade.addColorStop(1, "rgba(0,0,0,.92)"); ctx.fillStyle = shade; ctx.fillRect(0, 0, width, height);
          if (p.showArapca) { ctx.textAlign = "center"; ctx.shadowColor = "rgba(0,0,0,.65)"; ctx.shadowBlur = 14; ctx.fillStyle = currentTheme.acc2; ctx.font = `700 ${Math.round(height * .025)}px Amiri,serif`; ctx.fillText("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", width / 2, height * .11); }
          if (currentAyah) {
            if (frame % 120 === 0) console.log("[canvas] currentAyah.tr length:", currentAyah.tr?.length, "showSubMeal:", p.showSubMeal, "ar length:", currentAyah.ar?.length);
            ctx.shadowBlur = 0; ctx.fillStyle = "rgba(255,255,255,.72)"; ctx.font = `600 ${Math.round(height * .0105)}px Inter,sans-serif`;
            ctx.fillText(currentAyah.s > 0 ? `${currentAyah.sName} Suresi  •  ${currentAyah.s}:${currentAyah.a}` : currentAyah.sName, width / 2, height * .148);
            ctx.strokeStyle = currentTheme.acc; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(width * .34, height * .17); ctx.lineTo(width * .47, height * .17); ctx.moveTo(width * .53, height * .17); ctx.lineTo(width * .66, height * .17); ctx.stroke();
            ctx.fillStyle = currentTheme.acc; ctx.save(); ctx.translate(width / 2, height * .17); ctx.rotate(Math.PI / 4); ctx.fillRect(-4, -4, 8, 8); ctx.restore(); ctx.shadowBlur = 16;
            {
              const arLen = currentAyah.ar.length, trLen = currentAyah.tr.length;
              let arBase = height * 0.028;
              if (arLen > 300) arBase *= 0.52; else if (arLen > 200) arBase *= 0.62; else if (arLen > 120) arBase *= 0.74; else if (arLen > 70) arBase *= 0.85;
              let trBase = width * 0.022;
              if (trLen > 300) trBase *= 0.65; else if (trLen > 180) trBase *= 0.78;
              const onlyMeal = !p.showArapca && p.showSubMeal, currentAspect = p.aspectRef.current;
              const safeTop = height * (onlyMeal ? 0.34 : 0.163), safeBottom = height * (onlyMeal ? 0.74 : 0.905), safeH = safeBottom - safeTop;
              const arMaxW = width * 0.80, trMaxW = width * (currentAspect === "16:9" ? 0.56 : currentAspect === "1:1" ? 0.70 : 0.78);
              let arabicSize = 0, arabicHeight = 0, translationSize = 0, arabicLines: string[] = [], translationLines: string[] = [], sepH = 0, totalH = 0;
              for (let step = 0; step < 22; step += 1) {
                const shrink = Math.pow(0.96, step);
                arabicSize = Math.round(Math.min(48, Math.max(13, arBase * shrink)) * p.textSizeMul);
                const trMaxSize = currentAspect === "16:9" ? 21 : onlyMeal ? 26 : 24;
                translationSize = Math.round(Math.min(trMaxSize, Math.max(10, trBase * shrink)) * p.textSizeMul);
                arabicHeight = arabicSize * 1.72;
                ctx.font = `700 ${arabicSize}px ${p.arabicFontCss}`;
                arabicLines = p.showArapca ? wrapText(ctx, currentAyah.ar, arMaxW) : [];
                ctx.font = `400 ${translationSize}px Inter,sans-serif`;
                translationLines = p.showSubMeal ? wrapText(ctx, currentAyah.tr, trMaxW) : [];
                sepH = (arabicLines.length > 0 && translationLines.length > 0) ? translationSize * 1.35 : 0;
                totalH = (arabicLines.length > 0 ? arabicLines.length * arabicHeight : 0) + sepH + (translationLines.length > 0 ? translationLines.length * translationSize * 1.55 : 0);
                if (totalH <= safeH) break;
              }
              const ox = onlyMeal ? 0 : p.textOffset.x * width * 0.004, oyRaw = onlyMeal ? 0 : p.textOffset.y * height * 0.004;
              const centeredTop = safeTop + (safeH - totalH) / 2;
              const oy = Math.max(safeTop - centeredTop, Math.min(oyRaw, safeBottom - totalH - centeredTop));
              let y = centeredTop + oy;

              const goldFill = () => {
                if (p.shimmerCfg.still) { ctx.fillStyle = p.shimmerCfg.c1; return; }
                const g = ctx.createLinearGradient(0, 0, width, 0), shift = (tick * 0.004) % 1;
                g.addColorStop(Math.max(0, shift - 0.25), p.shimmerCfg.c1); g.addColorStop(shift, "#ffffff"); g.addColorStop(Math.min(1, shift + 0.25), p.shimmerCfg.c2);
                ctx.fillStyle = g;
              };
              if (p.showArapca && arabicLines.length > 0) {
                ctx.font = `700 ${arabicSize}px ${p.arabicFontCss}`; goldFill(); ctx.shadowColor = p.shimmerCfg.glow; ctx.shadowBlur = p.shimmerCfg.still ? 14 : 22;
                const prevDir = (ctx as CanvasRenderingContext2D & { direction?: string }).direction;
                try { (ctx as CanvasRenderingContext2D & { direction?: string }).direction = "rtl"; } catch { /* ignore */ }
                arabicLines.forEach((line) => { ctx.fillText(line, width / 2 + ox, y + arabicSize * 0.8); y += arabicHeight; });
                try { (ctx as CanvasRenderingContext2D & { direction?: string }).direction = prevDir || "ltr"; } catch { /* ignore */ }
                ctx.shadowBlur = 0; ctx.strokeStyle = "rgba(255,255,255,.22)"; ctx.beginPath(); ctx.moveTo(width * .28, y + 8); ctx.lineTo(width * .72, y + 8); ctx.stroke(); y += sepH;
              }
              if (p.showSubMeal && translationLines.length > 0) {
                ctx.font = `400 ${translationSize}px Inter,sans-serif`; ctx.fillStyle = "rgba(255,255,255,.95)";
                
                // Meal metnine eklenen kontur ve güçlü gölge ayarları
                ctx.shadowColor = "rgba(0, 0, 0, 0.9)"; 
                ctx.shadowBlur = 12; 
                ctx.shadowOffsetX = 0; 
                ctx.shadowOffsetY = 2;
                ctx.lineWidth = 3; 
                ctx.strokeStyle = "#000000";

                translationLines.forEach((line) => { 
                  ctx.strokeText(line, width / 2 + ox, y + translationSize); 
                  ctx.fillText(line, width / 2 + ox, y + translationSize); 
                  y += translationSize * 1.6; 
                });
                ctx.shadowBlur = 0;
              }
            }
          } else { ctx.shadowBlur = 0; ctx.fillStyle = "rgba(255,255,255,.5)"; ctx.font = `500 ${Math.round(height * .018)}px Inter,sans-serif`; ctx.fillText("Kütüphaneden ayet seçin", width / 2, height / 2); }
          const realTierForWatermark = !p.user && !p.isMasterSürüm ? "free" : p.accessTier;
          if (realTierForWatermark === "free" || realTierForWatermark === "pro") {
            ctx.save(); ctx.font = `700 ${Math.round(height * 0.018)}px Inter,sans-serif`; ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
            ctx.shadowColor = "rgba(0, 0, 0, 0.7)"; ctx.shadowBlur = 4; ctx.textAlign = "right"; ctx.fillText("nurstudyo.com", width * 0.95, height * 0.965); ctx.restore();
          }
          if ((p.isMasterSürüm || p.accessTier === "elit") && p.brandSignature.trim()) {
            ctx.save(); const sigSize = Math.round(height * 0.019); ctx.font = `800 ${sigSize}px Inter,sans-serif`;
            const isLeft = p.brandPos === "sol-ust" || p.brandPos === "sol-alt", isTop = p.brandPos === "sol-ust" || p.brandPos === "sag-ust";
            const sigX = isLeft ? width * 0.05 : width * 0.95, sigY = isTop ? height * 0.052 : height * 0.965;
            ctx.textAlign = isLeft ? "left" : "right";
            const gx = isLeft ? sigX : sigX - sigSize * 9;
            const sigGrad = ctx.createLinearGradient(gx, 0, gx + sigSize * 9, 0);
            sigGrad.addColorStop(0, "#f5dda6"); sigGrad.addColorStop(0.5, "#ffffff"); sigGrad.addColorStop(1, "#d7aa52");
            ctx.fillStyle = sigGrad; ctx.shadowColor = "rgba(0, 0, 0, 0.9)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 1;
            ctx.fillText(p.brandSignature.trim(), sigX, sigY); ctx.restore();
          }
        }
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [p.ensureImage, p.ensureVideo, p.showArapca, p.showSubMeal, p.accessTier, p.arabicFontCss, p.textSizeMul, p.shimmerCfg, p.cardBg, p.textOffset, p.cineFilter, p.isMasterSürüm, p.brandSignature, p.brandPos, p.previewFps]);
}
