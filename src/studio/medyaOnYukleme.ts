// ════════════════════════════════════════════════════════
// MEDYA ÖN YÜKLEME FABRİKASI (SRP adım 12, 30.09) — StudioApp'ten taşındı
// Cache'i useRef Map olarak alan saf kurucular; StudioApp içinde
// ensureImage/ensureVideo useCallback ile sarılarak aynı imzayla kullanılır.
// ════════════════════════════════════════════════════════

export function ensureImageYukle(
  imageCache: React.MutableRefObject<Map<string, HTMLImageElement>>,
  url: string,
): HTMLImageElement {
    let image = imageCache.current.get(url);
    if (!image) {
      const img = new Image();
      // ★ BLOB/DATA URL SAME-ORIGIN'dir (30.09): crossOrigin="anonymous" blob:
      //   adreslerde bazı tarayıcılarda yüklemeyi bozabiliyor — kullanıcı dosyaları
      //   IndexedDB→blob ile gelir, onlara crossOrigin uygulanmaz.
      if (!url.startsWith("blob:") && !url.startsWith("data:")) img.crossOrigin = "anonymous";
      img.decoding = "async";
      // ★ ÖLÜ GÖRSEL CACHE'TE KALMASIN: yüklenemeyen görsel cache'ten düşer —
      //   imza adresi sonradan gelirse (videoUrl) sonraki karede taze deneme şansı doğar.
      img.addEventListener("error", () => { if (imageCache.current.get(url) === img) imageCache.current.delete(url); }, { once: true });
      img.src = url;
      image = img;
      imageCache.current.set(url, img);
    }
    return image;
}

export function ensureVideoYukle(
  videoCache: React.MutableRefObject<Map<string, HTMLVideoElement>>,
  url: string,
  fallbackUrl?: string,
): HTMLVideoElement {
    let video = videoCache.current.get(url);
    if (!video) {
      const el = document.createElement("video");
      // ★ Blob/data URL same-origin — crossOrigin yalnız uzak (CDN) medyada (30.09)
      if (!url.startsWith("blob:") && !url.startsWith("data:")) el.crossOrigin = "anonymous";
      el.src = url; el.muted = true; el.loop = true; el.playsInline = true; el.preload = "auto";
      el.autoplay = true;
      el.defaultMuted = true;
      // ★ Donma koruması: bitiş/takılma anında kendini toparla
      const revive = () => { try { if (el.ended) el.currentTime = 0; el.play().catch(() => undefined); } catch { /* ignore */ } };
      el.addEventListener("ended", revive);
      el.addEventListener("stalled", revive);
      el.addEventListener("suspend", revive);
      el.addEventListener("pause", revive);
      el.play().catch(() => undefined);

      if (fallbackUrl && fallbackUrl !== url) {
        el.addEventListener("error", () => {
          if (el.src !== fallbackUrl) {
            el.src = fallbackUrl;
            el.load();
            el.play().catch(() => undefined);
          }
        }, { once: true });
      }
      video = el;
      videoCache.current.set(url, video);
    }
    return video;
}
