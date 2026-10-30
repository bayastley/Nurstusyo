// ══════════ ══════════════════════════════════════════════
// SIYERÇOKDIL.TS — Siyer kategori adları 4 dilde (en/ar/id/ur)
// TR metni doğrudan siyer.ts'ten okunur; bu dosya yalnızca
// kategori başlıkları + dönem etiketlerinin çevirisini içerir.
// ════════════════════════════════════════════════════════════

import type { Lang } from "../i18n/base";

export interface SiyerCeviri {
  ad: string;      // kategori adı
  donem: string;   // dönem etiketi (Mekke/Medine)
}

export type SiyerCokDil = Record<string, Record<Exclude<Lang, "tr">, SiyerCeviri>>;

export const SIYER_COKDIL: SiyerCokDil = {
  dogum: {
    en: { ad: "Birth and Childhood", donem: "Mecca" },
    ar: { ad: "المولد والطفولة", donem: "مكة" },
    id: { ad: "Kelahiran dan Masa Kecil", donem: "Makkah" },
    ur: { ad: "پیدائش اور بچپن", donem: "مکہ" },
  },
  genclik: {
    en: { ad: "Youth Years and Khadija", donem: "Mecca" },
    ar: { ad: "سنوات الشباب وخديجة", donem: "مكة" },
    id: { ad: "Masa Muda dan Khadijah", donem: "Makkah" },
    ur: { ad: "جوانی کے سال اور خدیجہ", donem: "مکہ" },
  },
  hira: {
    en: { ad: "Hira and the First Revelation", donem: "Mecca" },
    ar: { ad: "غار حراء والوحی الأول", donem: "مكة" },
    id: { ad: "Gua Hira dan Wahyu Pertama", donem: "Makkah" },
    ur: { ad: "غارِ حرا اور پہلی وحی", donem: "مکہ" },
  },
  davet: {
    en: { ad: "First Muslims and Open Call", donem: "Mecca" },
    ar: { ad: "أول المسلمين والدعوة الجهرية", donem: "مكة" },
    id: { ad: "Muslim Awal dan Dakwah Terbuka", donem: "Makkah" },
    ur: { ad: "ابتدائی مسلمان اور ظاہری دعوت", donem: "مکہ" },
  },
  eziyet: {
    en: { ad: "Years of Persecution and Migration to Abyssinia", donem: "Mecca" },
    ar: { ad: "سنوات الاضطهاد وهجرة الحبشة", donem: "مكة" },
    id: { ad: "Tahun Penganiayaan dan Hijrah ke Habasyah", donem: "Makkah" },
    ur: { ad: "ظلم و ستم کے سال اور حبشہ کی ہجرت", donem: "مکہ" },
  },
  huzun: {
    en: { ad: "Year of Sorrow, Ta'if and Isra-Mi'raj", donem: "Mecca" },
    ar: { ad: "عام الحزن والطائف والإسراء والمعراج", donem: "مكة" },
    id: { ad: "Tahun Duka, Thaif dan Isra-Mi'raj", donem: "Makkah" },
    ur: { ad: "سالِ حزن، طائف اور معراج", donem: "مکہ" },
  },
  akabe: {
    en: { ad: "Pledges of Aqaba", donem: "Mecca" },
    ar: { ad: "بيعتا العقبة", donem: "مكة" },
    id: { ad: "Baiat Aqabah", donem: "Makkah" },
    ur: { ad: "بیعاتِ عقبہ", donem: "مکہ" },
  },
  hicret: {
    en: { ad: "The Hijra (Migration)", donem: "Medina" },
    ar: { ad: "الهجرة", donem: "المدينة" },
    id: { ad: "Hijrah ke Madinah", donem: "Madinah" },
    ur: { ad: "هجرت", donem: "مدینہ" },
  },
  medine: {
    en: { ad: "Building of Medina", donem: "Medina" },
    ar: { ad: "تشييد المدينة", donem: "المدينة" },
    id: { ad: "Pembangunan Madinah", donem: "Madinah" },
    ur: { ad: "مدینہ کی تعمیر", donem: "مدینہ" },
  },
  bedir: {
    en: { ad: "Battle of Badr", donem: "Medina" },
    ar: { ad: "غزوة بدر", donem: "المدينة" },
    id: { ad: "Perang Badar", donem: "Madinah" },
    ur: { ad: "غزوہ بدر", donem: "مدینہ" },
  },
  uhud: {
    en: { ad: "Battle of Uhud", donem: "Medina" },
    ar: { ad: "غزوة أحد", donem: "المدينة" },
    id: { ad: "Perang Uhud", donem: "Madinah" },
    ur: { ad: "غزوہ احد", donem: "مدینہ" },
  },
  handak: {
    en: { ad: "Battle of the Trench and Qurayza", donem: "Medina" },
    ar: { ad: "غزوة الخندق وبني قريظة", donem: "المدينة" },
    id: { ad: "Perang Khandaq dan Kuraizah", donem: "Madinah" },
    ur: { ad: "غزوہ خندق اور بنو قریظہ", donem: "مدینہ" },
  },
  hudaybiye: {
    en: { ad: "Treaty of Hudaybiyya and the Conquest of Mecca", donem: "Medina" },
    ar: { ad: "صلح الحديبية وفتح مكة", donem: "المدينة" },
    id: { ad: "Perjanjian Hudaibiyah dan Pendudukan Makkah", donem: "Madinah" },
    ur: { ad: "صلح حدیبیہ اور فتحِ مکہ", donem: "مدینہ" },
  },
  veda: {
    en: { ad: "Farewell Pilgrimage and Farewell Sermon", donem: "Medina" },
    ar: { ad: "حجة الوداع وخطبة الوداع", donem: "المدينة" },
    id: { ad: "Haji Wada dan Khutbah Wada", donem: "Madinah" },
    ur: { ad: "حج وداع اور خطبہ وداع", donem: "مدینہ" },
  },
};

/** Bir kategori için dil uyarınca çeviri; TR her zaman siyer.ts'den gelir. */
export function siyerIsim(id: string, lang: Lang): SiyerCeviri | null {
  if (lang === "tr") return null;
  const g = SIYER_COKDIL[id];
  return g ? g[lang] : null;
}
