// ════════════════════════════════════════════════════════
// İÇERİK TAKVİMİ — yol haritası madde 20
// 7/30 günlük üretim planı: her güne GERÇEK bir ayet referansı,
// "üretildi" işareti cihazda (localStorage) tutulur.
// Ayet listesi uydurma değil: DAILY_AYAHS havuzu + yaygın bilinen
// referanslar (sure/ayet numaraları mevcut SURAHS tablosundan çözülür).
// ════════════════════════════════════════════════════════

import { DAILY_AYAHS, SURAHS } from "../data";

const TAKVIM_KEY = "nur_icerik_takvim_v1";

/** 30 günlük plan için 30 gerçek ayet referansı (sure, ayet). */
export const TAKVIM_AYETLERI: Array<[number, number]> = [
  ...DAILY_AYAHS,
  [103, 1], [103, 3], [94, 6], [65, 3], [3, 139],
  [2, 286], [39, 53], [40, 60], [7, 55], [17, 80],
  [25, 74], [29, 69], [48, 4], [57, 4], [61, 13], [13, 28],
];

export interface TakvimGunu {
  /** YYYY-MM-DD (yerel) — işaret anahtarı */
  tarih: string;
  /** 1 = bugün, 2 = yarın… */
  sira: number;
  sure: number;
  ayet: number;
  sureAdi: string;
}

const IKI_HANE = (n: number): string => String(n).padStart(2, "0");

export function tarihAnahtari(d: Date): string {
  return `${d.getFullYear()}-${IKI_HANE(d.getMonth() + 1)}-${IKI_HANE(d.getDate())}`;
}

export function sureAdi(sure: number): string {
  return SURAHS.find((s) => s.n === sure)?.name ?? `${sure}. sure`;
}

/** Bugünden başlayan plan; gün sayısı 7 veya 30. */
export function takvimOlustur(gunSayisi: 7 | 30, baslangic: Date = new Date()): TakvimGunu[] {
  const gunler: TakvimGunu[] = [];
  for (let i = 0; i < gunSayisi; i += 1) {
    const d = new Date(baslangic.getFullYear(), baslangic.getMonth(), baslangic.getDate() + i);
    const [sure, ayet] = TAKVIM_AYETLERI[i % TAKVIM_AYETLERI.length];
    gunler.push({ tarih: tarihAnahtari(d), sira: i + 1, sure, ayet, sureAdi: sureAdi(sure) });
  }
  return gunler;
}

function oku(): Record<string, boolean> {
  try {
    const ham = localStorage.getItem(TAKVIM_KEY);
    if (!ham) return {};
    const veri: unknown = JSON.parse(ham);
    if (!veri || typeof veri !== "object") return {};
    const temiz: Record<string, boolean> = {};
    Object.entries(veri as Record<string, unknown>).forEach(([k, v]) => {
      if (v === true) temiz[k] = true;
    });
    return temiz;
  } catch (hata) {
    console.warn("[icerikTakvimi] okuma başarısız", hata);
    return {};
  }
}

function yaz(veri: Record<string, boolean>): void {
  try {
    localStorage.setItem(TAKVIM_KEY, JSON.stringify(veri));
  } catch (hata) {
    console.warn("[icerikTakvimi] yazma başarısız", hata);
  }
}

export function uretilenleriOku(): Record<string, boolean> {
  return oku();
}

export function uretildiIsaretle(tarih: string, deger: boolean): Record<string, boolean> {
  const veri = oku();
  if (deger) veri[tarih] = true;
  else delete veri[tarih];
  yaz(veri);
  return veri;
}
