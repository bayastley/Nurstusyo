import { useEffect, useMemo, useState } from "react";

export type DataSaverMode = "auto" | "on" | "off";
const DATA_SAVER_KEY = "nur_data_saver";

export function getDataSaverMode(): DataSaverMode {
  try {
    const v = localStorage.getItem(DATA_SAVER_KEY);
    if (v === "on" || v === "off" || v === "auto") return v;
  } catch { /* ignore */ }
  return "auto";
}

export function setDataSaverMode(mode: DataSaverMode): void {
  try { localStorage.setItem(DATA_SAVER_KEY, mode); } catch { /* ignore */ }
  try { window.dispatchEvent(new Event("nur-data-saver")); } catch { /* ignore */ }
}

export function useRenderQuality() {
  const [saver, setSaver] = useState<DataSaverMode>(() => getDataSaverMode());
  useEffect(() => {
    const upd = () => setSaver(getDataSaverMode());
    window.addEventListener("nur-data-saver", upd);
    window.addEventListener("storage", upd);
    return () => {
      window.removeEventListener("nur-data-saver", upd);
      window.removeEventListener("storage", upd);
    };
  }, []);

  return useMemo(() => {
    const nav = navigator as Navigator & { deviceMemory?: number };
    const memory = nav.deviceMemory ?? 8;
    const cores = navigator.hardwareConcurrency ?? 8;
    const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const low = mobile || memory <= 4 || cores <= 4;
    const mid = !low && (memory <= 6 || cores <= 6);
    const forceLow = saver === "on";
    const effectiveLow = forceLow || low;
    const effectiveMid = !effectiveLow && (saver === "off" ? mid : mid);

    return {
      low: effectiveLow,
      dataSaver: saver,
      previewFps: forceLow ? 15 : mobile ? 20 : effectiveLow ? 24 : effectiveMid ? 30 : 30,
      renderFps: forceLow ? 15 : mobile ? 20 : effectiveLow ? 24 : effectiveMid ? 30 : 30,
      bitrateScale: forceLow ? 0.2 : mobile ? 0.28 : effectiveLow ? 0.38 : effectiveMid ? 0.55 : 0.62,
      audioBitrate: forceLow ? 64_000 : mobile ? 96_000 : effectiveLow ? 128_000 : 160_000,
    };
  }, [saver]);
}