import { useMemo } from "react";

export function useRenderQuality() {
  return useMemo(() => {
    const nav = navigator as Navigator & { deviceMemory?: number };
    const memory = nav.deviceMemory ?? 8;
    const cores = navigator.hardwareConcurrency ?? 8;
    const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const low = mobile || memory <= 4 || cores <= 4;
    const mid = !low && (memory <= 6 || cores <= 6);

    return {
      low,
      previewFps: mobile ? 20 : low ? 24 : mid ? 30 : 30,
      renderFps: mobile ? 20 : low ? 24 : mid ? 30 : 30,
      bitrateScale: mobile ? 0.28 : low ? 0.38 : mid ? 0.55 : 0.62,
      audioBitrate: mobile ? 96_000 : low ? 128_000 : 160_000,
    };
  }, []);
}