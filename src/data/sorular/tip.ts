// ════════════════════════════════════════════════════════
// TIP.TS — Soru bankası ortak şeması (31.10, küçük-blok stratejisi)
// Her konu bloğu kendi dosyasında; index.ts birleştirir.
// ════════════════════════════════════════════════════════

export interface SoruKart {
  soru: string;
  cevap: string;
  kaynak: string;
  /** En sık aranan kartlarda İngilizce çift; verilmezse TR fallback gösterilir */
  soruEn?: string;
  cevapEn?: string;
}

/** Dil görünürlüğü: TR asıl; en varsa dil!=tr'de İngilizce gösterilir.
 *  ar/id/ur için yerleşik çeviri yok → İngilizce/TR fallback (dürüst kural). */
export function soruGorunum(s: SoruKart, lang: string): { soru: string; cevap: string; kaynak: string } {
  if (lang !== "tr" && s.soruEn && s.cevapEn) {
    return { soru: s.soruEn, cevap: s.cevapEn, kaynak: s.kaynak };
  }
  return { soru: s.soru, cevap: s.cevap, kaynak: s.kaynak };
}
