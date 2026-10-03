// ════════════════════════════════════════════════════════
// CAMIDATA.TS — Keşfet > Cami Bulucu (madde 47) — Google Maps URL üreticileri
// kesfetData.ts'den ayrıldı (SRP, 03.10) — içerik değişmedi, bayt-duyarlı taşıma
// ════════════════════════════════════════════════════════
// ── 47: CAMİ BULUCU — Google Maps embed (anahtar gerektirmez, sorgu bazlı)
export const camiHaritaUrl = (konum: string) =>
  `https://www.google.com/maps?q=${encodeURIComponent("cami " + konum)}&output=embed`;
export const camiListeUrl = (konum: string) =>
  `https://www.google.com/maps/search/${encodeURIComponent("mosque near " + konum)}`;
