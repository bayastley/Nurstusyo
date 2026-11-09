// ════════════════════════════════════════════════════════
// AYET BAŞLIKLARI — AR HARİTASI (SRP 2026-10-07:
//   2929 satırlık ayetBaslikCokDil.ts bu dosyaya bölündü; ana dosyada
//   TR liste + ayetBasligi/ayetKartBasligi arayüzü birebir korunur.
//   575 giriş — kutuphane-kissa-dil-turu.mjs bu sayımı denetler.
// ════════════════════════════════════════════════════════
import { AYET_BASLIK_P1 } from "./ayetBaslikHaritaAr.p1";
import { AYET_BASLIK_P2 } from "./ayetBaslikHaritaAr.p2";

export const AYET_BASLIK_HARITA_AR = {
  ar: { ...AYET_BASLIK_P1.ar, ...AYET_BASLIK_P2.ar },
};
