// ════════════════════════════════════════════════════════
// SAHABELERDETAYDATA.TS — Sahabeler bölümü (20 biyografi)
//
// 20 önemli sahabenin hayatı, her biri en az 500 kelime olacak şekilde
// dört dosyaya bölünmüştür (sahabelerDetay1..4). Burada birleştirilir,
// kelime sayısı hesaplanır ve kaynak notu verilir.
//
// ★ SAHİHLİK: Vefat yılları TDV İslâm Ansiklopedisi ve İbn Sa'd esas
//   alınarak verildi; ihtilaflı yerlerde "~" kullanıldı. Hadis numarası
//   yazılmaz, kitap/bölüm adı verilir. Menkıbe/uydurma anlatı yoktur.
// ════════════════════════════════════════════════════════

import { SAHABELER_1 } from "./sahabelerDetay1";
import { SAHABELER_2 } from "./sahabelerDetay2";
import { SAHABELER_3 } from "./sahabelerDetay3";
import { SAHABELER_4 } from "./sahabelerDetay4";

export interface SahabeDetay {
  id: string;
  ad: string;
  unvan: string;
  /** "vefatı 634 (13)" gibi */
  tarih: string;
  emoji: string;
  /** Paragraflar hâlinde hayatı (toplam en az 500 kelime) */
  hayat: string[];
  kaynak: string[];
}

export interface SahabeDetayKayitli extends SahabeDetay {
  /** hayat paragraflarının toplam kelime sayısı */
  kelime: number;
}

const kelimeSay = (s: string): number => s.trim().split(/\s+/).filter(Boolean).length;

export const SAHABELER: SahabeDetayKayitli[] = [
  ...SAHABELER_1,
  ...SAHABELER_2,
  ...SAHABELER_3,
  ...SAHABELER_4,
].map((s) => ({ ...s, kelime: s.hayat.reduce((t, p) => t + kelimeSay(p), 0) }));

export const SAHABELER_TOPLAM = SAHABELER.length;

export const SAHABELER_KELIME_TOPLAM = SAHABELER.reduce((t, s) => t + s.kelime, 0);

export const SAHABELER_KAYNAK_NOTU =
  "Kaynaklar: İbn Hişâm, es-Sîre · İbn Sa'd, et-Tabakâtü'l-kübrâ · Buhârî ve Müslim (kitap/bölüm) · Taberî, Târîh · Belâzürî, Fütûhu'l-büldân · TDV İslâm Ansiklopedisi. Vefat yılları ağırlıklı olarak TDV İslâm Ansiklopedisi'ne göre verilmiş, ihtilaflı tarihler “~” ile gösterilmiştir. Hadis numarası kullanılmaz; zayıf/uydurma rivayet aktarılmaz.";
