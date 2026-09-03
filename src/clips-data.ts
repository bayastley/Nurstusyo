// ════════════════════════════════════════════════════════
// CLIPS-DATA.TS — Video klip ham verileri (re-export)
// Veriler clipsData1.ts ve clipsData2.ts'e bölündü
// ════════════════════════════════════════════════════════

export type { Row } from "./clipsData1";

// Kategoriler 1: Namaz, Musaf, Çiçekler, Yıldızlar, Deniz, Günbatımı, Gece, Şelale, Orman
export {
  NAMAZ_DATA,
  MUSAF_DATA,
  CICEKLER_DATA,
  YILDIZLAR_DATA,
  DENIZ_DATA,
  GUNBATIMI_DATA,
  GECE_DATA,
  SELALE_DATA,
  ORMAN_DATA,
} from "./clipsData1";

// Kategoriler 2: Çöl, Kar, Şehir, Cami, Desen, Göl, Bulut, Cennet, Dağlar
export {
  COL_DATA,
  KAR_DATA,
  SEHIR_DATA,
  CAMI_DATA,
  DESEN_DATA,
  GOL_DATA,
  BULUT_DATA,
  CENNET_DATA,
  DAGLAR_DATA,
} from "./clipsData2";
