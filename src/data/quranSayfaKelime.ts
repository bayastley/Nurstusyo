// ══════════════════════════════════════════════════════════════
// QURANSAYFAKELIME.TS — Mushaf sayfası harf ortalaması (sevap sayacı)
//   Kur'an Sayfaları'nda görüntüler SVG olduğu için sayfa metni elimizde
//   yok; harf sayısı dürüst bir TAHMİN sabitinden gelir:
//     • KFGQPC Hafs mushafı: 15 satır/sayfa × ~17-20 kelime/satır ≈ 290 kelime
//     • Arapça kelime ortalaması ~4,3 harf (harekesiz sayım)
//     → 290 × 4,3 ≈ 1.250 harf/sayfa
//   Kur'an öğren ekranındaki ayetler için GERÇEK harf sayısı kullanılır
//   (arapcaHarfSayisi); bu sabit yalnız görüntü sayfalar içindir.
// ══════════════════════════════════════════════════════════════

/** Sayfa başına ortalama harf (KFGQPC Hafs, harekesiz sayım) */
export const SAYFA_HARF_ORT = 1250;
