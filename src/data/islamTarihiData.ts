// ════════════════════════════════════════════════════════
// ISLAMTARIHIDATA.TS — İslam Tarihi Zaman Tüneli (yol haritası madde 9)
// 6 dönem · 87 olay (Sahabeler dönemi: 40 biyografi). Kronolojik sıra: doğum → nübüvvet → Mekke → Medine →
// Hulefâ-yi Râşidîn → İslâm medeniyeti.
//
// ★ SAHİHLİK İLKESİ (kullanıcı emri: "her içerik sahih olsun"):
//   • Tarihler klasik siyer/tarih kaynaklarına (İbn Hişâm, Taberî, İbnü'l-Esîr,
//     İbn Kesîr, Belâzürî) ve Buhârî-Müslim'in ilgili kitap/bölümlerine dayanır.
//   • Rivayet ihtilaflı ise "yaklaşık / hicrî şu yıl" ifadesiyle verilir; kesin
//     olmayan tarih kesinmiş gibi yazılmaz.
//   • Menkıbe/uydurma anlatı yoktur; her olayın yanında kaynak gösterilir.
// ════════════════════════════════════════════════════════

import { TARIH_DONEMLERI as TARIH_DONEMLER_VERISI } from "./islamTarihiDonemler";
import { TARIH_YERLERI as TARIH_YER_VERISI } from "./islamTarihiYerler";

export interface TarihOlay {
  /** Görünen tarih etiketi: "571", "624 (2/17 Ramazan)" gibi */
  tarih: string;
  baslik: string;
  ozet: string;
  kaynak: string;
}

export interface TarihDonem {
  id: string;
  ad: string;
  aralik: string;
  emoji: string;
  renk: string;
  olaylar: TarihOlay[];
}

export const TARIH_KAYNAK_NOTU =
  "Kaynaklar: İbn Hişâm, es-Sîre · Taberî, Târîhu'l-ümem · İbnü'l-Esîr, el-Kâmil fi't-târîh · İbn Kesîr, el-Bidâye ve'n-nihâye · Belâzürî, Fütûhu'l-büldân · İbn Sa'd, et-Tabakâtü'l-kübrâ · Buhârî, Megâzî · Müslim, Cihâd · TDV İslâm Ansiklopedisi (sahâbe maddeleri). İhtilaflı tarihler \"yaklaşık / ~\" kaydıyla verilmiştir; bir kaynağın tercih ettiği yıl esas alınmış, farklı rivayetler özet içinde belirtilmiştir.";

export const TARIH_DONEMLERI: TarihDonem[] = TARIH_DONEMLER_VERISI;

export const TARIH_TOPLAM = TARIH_DONEMLERI.reduce((t, d) => t + d.olaylar.length, 0);

// ════════════════════════════════════════════════════════
// İSLAM TARİHİ HARİTASI (yol haritası madde 10)
// 14 tarihî mekân: koordinat + ilgili olaylar + kaynak. Harita kütüphanesi
// kullanılmaz; koordinatlı kart + Google Maps bağlantısı ile çalışır
// (site ağırlığı artmaz, mobilde de akıcı).
// ════════════════════════════════════════════════════════

export interface TarihYeri {
  id: string;
  ad: string;
  ulke: string;
  /** enlem, boylam */
  koord: [number, number];
  donemId: string;
  ozet: string;
  olaylar: string[];
  kaynak: string;
}

export const TARIH_YERLERI: TarihYeri[] = TARIH_YER_VERISI;

export const TARIH_YER_TOPLAM = TARIH_YERLERI.length;
