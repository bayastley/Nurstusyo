// ════════════════════════════════════════════════════════
// AYET BAŞLIKLARI — ID HARİTASI (SRP 2026-10-07:
//   2929 satırlık ayetBaslikCokDil.ts bu dosyaya bölündü; ana dosyada
//   TR liste + ayetBasligi/ayetKartBasligi arayüzü birebir korunur.
//   575 giriş — kutuphane-kissa-dil-turu.mjs bu sayımı denetler.
// ════════════════════════════════════════════════════════
import { AYET_BASLIK_P1 } from "./ayetBaslikHaritaId.p1";
import { AYET_BASLIK_P2 } from "./ayetBaslikHaritaId.p2";

export const AYET_BASLIK_HARITA_ID = {
  id: { ...AYET_BASLIK_P1.id, ...AYET_BASLIK_P2.id },
};
