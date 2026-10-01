import { useEffect, useState } from "react";
import type { Output } from "../types";
import { loadStoredVideos } from "./videoStore";

/**
 * ★ ÜRETİM ÇIKTILARI kalıcılığı (StudioApp'ten çıkarıldı, 01.10)
 *
 * - outputs: sayfa yenilense bile son üretimler kaybolmasın (localStorage metadata
 *   + IndexedDB gerçek video verisi; misafir → üye geçişinde video buharlaşmasın).
 * - restoreStoredOutputs: açılışta IndexedDB'deki videoları outputs'a koyar.
 *   Senaryo: misafir video üretti → indirmek için üye oldu → Google girişi sayfayı
 *   yeniledi → eski davranışta video buharlaşıyordu; artık buradan geri gelir ve
 *   üye olarak indirebilir. (localStorage'daki metadata-only geçmişin yerine bu gerçek veri.)
 */
export function useOutputKalici() {
  const [outputs, setOutputs] = useState<Output[]>(() => {
    try {
      const saved = localStorage.getItem("nur_gen_history");
      return saved ? JSON.parse(saved).slice(0, 20) : [];
    } catch { return []; }
  });

  // ★ Geçmiş üretimi localStorage'a kaydet (yalnız metadata — blob URL kaydedilmez)
  useEffect(() => {
    if (outputs.length > 0) {
      try {
        const lite = outputs.map(o => ({ id: o.id, label: o.label, size: o.size, ext: o.ext, mime: o.mime, duration: o.duration }));
        localStorage.setItem("nur_gen_history", JSON.stringify(lite.slice(0, 20)));
      } catch {}
    }
  }, [outputs]);

  const restoreStoredOutputs = () => {
    let cancelled = false;
    void loadStoredVideos().then((stored) => {
      if (cancelled || !stored.length) return;
      const restored: Output[] = stored.map((item) => ({
        id: item.id,
        url: URL.createObjectURL(item.blob),
        mime: item.mime,
        size: item.size,
        duration: item.duration,
        label: item.label,
        ext: item.ext,
      }));
      setOutputs((current) => {
        const have = new Set(current.map((item) => item.id));
        const fresh = restored.filter((item) => !have.has(item.id));
        return fresh.length ? [...current, ...fresh].slice(0, 5) : current;
      });
    });
    return () => { cancelled = true; };
  };

  return { outputs, setOutputs, restoreStoredOutputs };
}
