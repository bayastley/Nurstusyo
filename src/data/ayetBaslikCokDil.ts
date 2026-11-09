import { AYET_BASLIKLARI_TR } from "./ayetBaslikTrListe";
export { AYET_BASLIKLARI_TR } from "./ayetBaslikTrListe";
// ════════════════════════════════════════════════════════
// AYETBASLIKCOKDIL.TS — Ayet Kütüphanesi kart başlıkları çok dil (06.10)
// İSTEK: "575 benzersiz ayet kartı başlığını 5 dile çeviren toplu
//   veri dosyası hazırla ve Ayet Kütüphanesine bağla."
//  • Havuzlarda 611 kart var; 34 başlık birden çok kartta tekrar
//    ediyor → BENZERSİZ 575 başlık. Harita TR başlığı ANAHTAR olarak
//    kullanır (id-hizalı değil): havuza kart ekleme/çıkarma çeviriyi
//    kırmaZ; mükerrer başlıklar aynı çeviriyi paylaşır.
//  • Meal + kaynak dillendirmesi ayetMealCokDil.ts'tedir (API tabanlı);
//    bu dosya yalnız TITLE katmanını kapsar.
//  • TR referans liste ilk-görülme sırasıyla AYET_BASLIKLARI_TR'dedir.
// Tüketiciler: AyetKartlariModal.tsx (arama + akıllı seçim bildirimi),
//   ayetKartBolumleri.tsx (günün ayeti satırı + seçim listesi)
// ════════════════════════════════════════════════════════

import type { Lang } from "../i18n";

/** TR referans: benzersiz 575 başlık, havuzlarda ilk görülme sırasıyla. */

// ════════════════════════════════════════════════════════
// ÇEVİRİ HARİTASI — anahtar = TR başlık (AYET_BASLIKLARI_TR ile aynı küme)
// ════════════════════════════════════════════════════════
import { AYET_BASLIK_HARITA_EN } from "./ayetBaslikHaritaEn";
import { AYET_BASLIK_HARITA_AR } from "./ayetBaslikHaritaAr";
import { AYET_BASLIK_HARITA_ID } from "./ayetBaslikHaritaId";
import { AYET_BASLIK_HARITA_UR } from "./ayetBaslikHaritaUr";

const HARITA: Partial<Record<Lang, Record<string, string>>> = {
  ...AYET_BASLIK_HARITA_EN,
  ...AYET_BASLIK_HARITA_AR,
  ...AYET_BASLIK_HARITA_ID,
  ...AYET_BASLIK_HARITA_UR,
};


/** Beklenen benzersiz başlık sayısı (bütünlük denetimi için). */
export const AYET_BASLIK_TOPLAM = 575;

/** TR başlığın çevrilmiş hâli — çeviri yoksa / dil tr ise aynen döner. */
export function ayetBasligi(lang: Lang | string | null | undefined, baslik: string): string {
  const code = String(lang || "tr").trim().toLowerCase() as Lang;
  if (code === "tr") return baslik;
  return HARITA[code]?.[baslik] ?? baslik;
}

/** Kartın başlığını seçili dile çevirir (AyetKarti shape'inden bağımsız). */
export function ayetKartBasligi(
  lang: Lang | string | null | undefined,
  kart: { title: string },
): string {
  return ayetBasligi(lang, kart.title);
}
