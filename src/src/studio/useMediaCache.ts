import { useCallback, useRef } from "react";

export function useMediaCache() {
  const imageCache = useRef(new Map<string, HTMLImageElement>());
  const videoCache = useRef(new Map<string, HTMLVideoElement>());
  const videoWatchdog = useRef(new Map<HTMLVideoElement, { t: number; at: number }>());

  const ensureImage = useCallback((url: string) => {
    let image = imageCache.current.get(url);
    if (!image) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.decoding = "async";
      img.src = url;
      image = img;
      imageCache.current.set(url, image);
    }
    return image;
  }, []);

  const ensureVideo = useCallback((url: string, fallbackUrl?: string) => {
    let video = videoCache.current.get(url);
    if (!video) {
      const el = document.createElement("video");
      el.crossOrigin = "anonymous";
      el.src = url;
      el.muted = true;
      el.loop = true;
      el.playsInline = true;
      el.preload = "auto";
      el.autoplay = true;
      el.defaultMuted = true;

      const revive = () => {
        try {
          if (el.ended) el.currentTime = 0;
          el.play().catch(() => undefined);
        } catch {
          // ignore media resume errors
        }
      };

      el.addEventListener("ended", revive);
      el.addEventListener("stalled", revive);
      el.addEventListener("suspend", revive);
      el.addEventListener("pause", revive);
      el.play().catch(() => undefined);

      if (fallbackUrl && fallbackUrl !== url) {
        el.addEventListener(
          "error",
          () => {
            if (el.src !== fallbackUrl) {
              el.src = fallbackUrl;
              el.load();
              el.play().catch(() => undefined);
            }
          },
          { once: true },
        );
      }

      video = el;
      videoCache.current.set(url, video);
    }
    return video;
  }, []);

  return { imageCache, videoCache, videoWatchdog, ensureImage, ensureVideo };
}