// ════════════════════════════════════════════════════════
// ISLAMICTOOLSVUCUT.TSX — RE-EXPORT KÖPRÜSÜ (SRP parçalama, 09.10)
//
// ★ 3 PARÇAYA BÖLÜNDÜ (bağlam KORUNARAK — dışa açık imza değişmedi):
//   • islamicToolsZikir.tsx     → zikirmatik + topluluk vitrin + grafik
//   • islamicToolsTakip.tsx     → dua/salah/hatim takipleri
//   • islamicToolsBildirim.tsx  → gece modu + ögüt vakti + namaz bildirimi
//   • islamicToolsIstatistik.tsx → (03.10'dan beri) istatistik/rozet/çevrimdışı
//
// IslamicToolsPanel + StudioApp + useVideoGenerator buradan import etmeye
// devam eder — hiçbir import satırı DEĞİŞMEDİ. Yeni geliştirmede doğrudan
// parça dosyadan import edilebilir (bu dosya geriye-dönük uyumluluk köprüsü).
// ════════════════════════════════════════════════════════

export {
  ZIKIR_KEY,
  ZIKIR_TOPLULUK_KEY,
  ZIKIR_STREAK_KEY,
  loadZikirCount,
  ZIKIR_METINLERI,
  ToplulukVitrinSayaci,
  Zikirmatik,
} from "./islamicToolsZikir";

export {
  SALAH_KEY,
  SALAH_5,
  SalahTracker,
  TOPLU_HATIM_KEY,
  TopluHatim,
  DuaTakip,
  HatimTakibi,
} from "./islamicToolsTakip";

export {
  GECE_MOD_KEY,
  GeceModuDugmesi,
  OgutVakti,
  NamazBildirim,
} from "./islamicToolsBildirim";

// ★ İSTATİSTİK / ROZET / ÇEVRİMDIŞI bloğu islamicToolsIstatistik.tsx'te (03.10).
export { AUDIO_CACHE_ADI, CevrimdisiKart, URETIM_IST_KEY, uretimIstOku, uretimIstYaz, RozetlerKarti, UreticiIstatistikKarti } from "./islamicToolsIstatistik";
export type { UretimIst } from "./islamicToolsIstatistik";
