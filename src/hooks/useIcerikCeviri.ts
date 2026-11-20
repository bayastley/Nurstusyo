import { useEffect, useState } from "react";
import type { Lang } from "../i18n";
import { ICERIK_DILLERI, metinCevir, onbellekHaritasi, type IcerikDil } from "../utils/icerikCeviri";

// ════════════════════════════════════════════════════════
// USEICERIKCEVIRI — görünen içerik metinlerini seçili dile çevirir.
// İlmihal ve İslam Tarihi gibi TR yazılmış veri kümeleri için ortak katman:
//   • Önce cihaz önbelleği (anında) → sonra MyMemory (sıralı, 3 paralel)
//   • Dil "tr" ise hiç istek yapılmaz
//   • Çeviri gelmezse metin TR kalır (boş ekran yok)
// ════════════════════════════════════════════════════════

const DESTEKLENEN = new Set<string>(ICERIK_DILLERI);

export function useIcerikCeviri(metinler: string[], lang: Lang = "tr") {
  const aktif = DESTEKLENEN.has(lang);
  const dil = (aktif ? lang : "en") as IcerikDil;
  const imza = metinler.filter(Boolean).join("\u00b6");

  const [harita, setHarita] = useState<Record<string, string>>(() =>
    aktif ? onbellekHaritasi(metinler.filter(Boolean), dil) : {}
  );
  const [yukleniyor, setYukleniyor] = useState(false);

  useEffect(() => {
    if (!aktif) { setHarita({}); setYukleniyor(false); return; }
    const liste = imza ? imza.split("\u00b6") : [];
    const onbellek = onbellekHaritasi(liste, dil);
    setHarita(onbellek);
    const eksik = liste.filter((m) => !onbellek[m]);
    if (!eksik.length) { setYukleniyor(false); return; }

    let iptal = false;
    setYukleniyor(true);
    (async () => {
      for (const m of eksik) {
        if (iptal) return;
        const c = await metinCevir(m, dil);
        if (iptal) return;
        if (c && c !== m) setHarita((h) => ({ ...h, [m]: c }));
      }
      if (!iptal) setYukleniyor(false);
    })();
    return () => { iptal = true; };
  }, [imza, dil, aktif]);

  return {
    aktif,
    dil,
    yukleniyor,
    /** Çevirisi varsa çevirisini, yoksa asıl metni döndürür */
    cevir: (m: string) => (aktif ? (harita[m] ?? m) : m),
  };
}
