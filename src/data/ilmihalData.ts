// ════════════════════════════════════════════════════════
// ILMIHALDATA.TS — İlmihal Akademisi (yol haritası madde 11)
// Hanefî mezhebi esaslı ilmihal: 41 ders · 242 madde · 131 sınav sorusu (modüller birleşik).
// ★ 24.11 DOSYA BÖLME: ana 16 dersin gövdesi ilmihalAnaData.ts'e taşındı.
//
// ★ SAHİHLİK İLKESİ (kullanıcı emri: "her içerik sahih olsun"):
//   • Her maddede Kur'ân ayeti (sure:ayet) veya hadis kitabı/bölümü kaynağı var.
//   • Hadis numarası UYDURULMADI; kaynak "Buhârî, Vudû" gibi kitap/bölüm olarak verilir.
//   • Fıkhî hükümler Hanefî mezhebinin yaygın (Diyanet İlmihali ile uyumlu) görüşleridir.
//   • Şüpheli/zayıf rivayet kullanılmadı.
// ════════════════════════════════════════════════════════

import { ILMIHAL_ANA_DERSLERI } from "./ilmihalAnaData";
import { ILMIHAL_EK1_DERSLERI } from "./ilmihalEk1Data";
import { ILMIHAL_EK2_DERSLERI } from "./ilmihalEk2Data";
import { ILMIHAL_EK3_DERSLERI } from "./ilmihalEk3Data";
import { ILMIHAL_EK4_DERSLERI } from "./ilmihalEk4Data";

export interface IlmihalMadde {
  baslik: string;
  metin: string;
  /** Kur'ân ayeti (sure:ayet) veya hadis kitap/bölüm kaynağı */
  delil: string;
}

export interface IlmihalSoru {
  soru: string;
  secenekler: string[];
  /** Doğru seçeneğin index'i (0 tabanlı) */
  cevap: number;
  aciklama: string;
  kaynak: string;
}

export interface IlmihalDers {
  id: string;
  ad: string;
  emoji: string;
  alt: string;
  maddeler: IlmihalMadde[];
  sorular: IlmihalSoru[];
}

export const ILMIHAL_KAYNAK_NOTU =
  "Kaynaklar: Kur'ân-ı Kerîm, Buhârî, Müslim, Ebû Dâvûd, Tirmizî ve Diyanet İşleri Başkanlığı İlmihali (Hanefî esaslı). Hadisler kitap/bölüm adıyla verilmiştir; numara uydurulmamıştır.";

export const ILMIHAL_DERSLERI: IlmihalDers[] = [
  ...ILMIHAL_ANA_DERSLERI,
  ...ILMIHAL_EK1_DERSLERI,
  ...ILMIHAL_EK2_DERSLERI,
  ...ILMIHAL_EK3_DERSLERI,
  ...ILMIHAL_EK4_DERSLERI,
];

export const ILMIHAL_TOPLAM = {
  ders: ILMIHAL_DERSLERI.length,
  madde: ILMIHAL_DERSLERI.reduce((t, d) => t + d.maddeler.length, 0),
  soru: ILMIHAL_DERSLERI.reduce((t, d) => t + d.sorular.length, 0),
};
