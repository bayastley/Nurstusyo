// ════════════════════════════════════════════════════════
// ZİKİR GRAFİK PENCERESİ (29.09) — saf fonksiyonlar, UI'sız
// ════════════════════════════════════════════════════════

export interface ZikirGunKova {
  /** "YYYY-MM-DD" (UTC günü — sunucu current_date ile aynı takvim) */
  gun: string;
  /** o gün toplulukça çekilen zikir adedi (sunucu nur_zikir_gunluk.adet) */
  adet: number;
}

/**
 * API'den gelen seyrek seriyi (yalnız veri olan günler) kesintisiz günlük
 * diziye döker: İLK kayıtlı günden bugüne her gün bir eleman; aradaki
 * kayıtsız günler gerçek "veri yoktu" anlamında 0.
 *
 * ★ SAYI DÜRÜSTLÜĞÜ: tablo kurulmadan ÖNCEKİ günler asla üretilmez — serinin
 *   başlangıcı ilk kayıt günüdür. Yani "sahte taban" yoktur; grafik canlı
 *   veri biriktikçe uzar. gunluk boş/null ise dizi boştur (UI grafiği gizler).
 */
export function zikirPencereDizisi(gunluk: ZikirGunKova[] | null | undefined, bugun: string): ZikirGunKova[] {
  if (!Array.isArray(gunluk) || gunluk.length === 0) return [];
  const map = new Map<string, number>();
  for (const k of gunluk) {
    if (typeof k?.gun === "string" && /^\d{4}-\d{2}-\d{2}$/.test(k.gun)) {
      map.set(k.gun, Math.max(0, Number(k.adet) || 0));
    }
  }
  if (map.size === 0) return [];
  // İlk kayıttan bugüne (en fazla 60 gün — pencere makul kalsın)
  const tarihler = [...map.keys()].sort();
  const ilk = tarihler[0] > bugun ? bugun : tarihler[0]; // saat kaymalarına karşı
  const AdimMs = 86_400_000;
  const sonMs = Date.parse(bugun + "T00:00:00Z");
  const ilkMs = Date.parse(ilk + "T00:00:00Z");
  if (!Number.isFinite(sonMs) || !Number.isFinite(ilkMs)) return [];
  const cikti: ZikirGunKova[] = [];
  for (let ms = ilkMs, i = 0; ms <= sonMs && i < 60; ms += AdimMs, i++) {
    const g = new Date(ms).toISOString().slice(0, 10);
    cikti.push({ gun: g, adet: map.get(g) ?? 0 });
  }
  // Bugün kayıtlı değilse son güne ekle (canlı gün)
  if (cikti.length && cikti[cikti.length - 1].gun !== bugun && map.has(bugun)) {
    cikti.push({ gun: bugun, adet: map.get(bugun)! });
  }
  return cikti;
}

/** Grafikten son N günün dilimi (haftalık görünüm = son 7) */
export function sonGunler(dizi: ZikirGunKova[], adet: number): ZikirGunKova[] {
  if (dizi.length <= adet) return dizi;
  return dizi.slice(-adet);
}
