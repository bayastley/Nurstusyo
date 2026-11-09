// ══════════════════════════════════════════════════════════════════
// SIYER.TS (31.10) — Hz. Muhammed (s.a.v.) Hayatı: kronolojik kategoriler
// ★ Talep (31.10): sekmede sağda kategoriler açılır; her olay kısa metin
//   + sahih kaynak. İsrâiliyât yok; olaylar Buhârî, Müslim, Muvatta ve
//   klâsik sîre kaynaklarından (İbn Hişâm, Vâkıdî, İbn Sa'd) seçilir.
//   Metinler TR; kategori adları siyerCokDil.ts ile 5 dilde.
// ══════════════════════════════════════════════════════════════════

export type SiyerDonem = "Mekke" | "Medine";

export interface SiyerOlay {
  metin: string;  // olay özeti (TR)
  metin_en?: string; metin_ar?: string; metin_id?: string; metin_ur?: string;
  kaynak: string; // sahih kaynak
}

export interface SiyerKategori {
  id: string; // çokdil anahtarı — siyerCokDil'de aynı id geçer
  ad: string; // TR kategori adı
  donem: SiyerDonem;
  olaylar: SiyerOlay[];
}

