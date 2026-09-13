// src/clips/index.ts — tüm kategoriler tek yerden
export type { Row } from "../clips-data";

export { NAMAZ_DATA, NAMAZ_URLS, NAMAZ_AI_KEYWORDS } from "./namaz";
export { MUSAF_DATA, MUSAF_URLS, MUSAF_AI_KEYWORDS } from "./musaf";
export { CICEKLER_DATA, CICEKLER_URLS, CICEKLER_AI_KEYWORDS } from "./cicekler";
export { YILDIZLAR_DATA, YILDIZLAR_URLS, YILDIZLAR_AI_KEYWORDS } from "./yildizlar";
export { DENIZ_DATA, DENIZ_URLS, DENIZ_AI_KEYWORDS } from "./deniz";
export { DAGLAR_DATA, DAGLAR_URLS, DAGLAR_AI_KEYWORDS } from "./daglar";
export { GUNBATIMI_DATA, GUNBATIMI_URLS, GUNBATIMI_AI_KEYWORDS } from "./gunbatimi";
export { GECE_DATA, GECE_URLS, GECE_AI_KEYWORDS } from "./gece";
export { SELALE_DATA, SELALE_URLS, SELALE_AI_KEYWORDS } from "./selale";
export { ORMAN_DATA, ORMAN_URLS, ORMAN_AI_KEYWORDS } from "./orman";
export { COL_DATA, COL_URLS, COL_AI_KEYWORDS } from "./col";
export { KAR_DATA, KAR_URLS, KAR_AI_KEYWORDS } from "./kar";
export { SEHIR_DATA, SEHIR_URLS, SEHIR_AI_KEYWORDS } from "./sehir";
export { CAMI_DATA, CAMI_URLS, CAMI_AI_KEYWORDS } from "./cami";
export { DESEN_DATA, DESEN_URLS, DESEN_AI_KEYWORDS } from "./desen";
export { GOL_DATA, GOL_URLS, GOL_AI_KEYWORDS } from "./gol";
export { BULUT_DATA, BULUT_URLS, BULUT_AI_KEYWORDS } from "./bulut";
export { CENNET_DATA, CENNET_URLS, CENNET_AI_KEYWORDS } from "./cennet";
export { ATES_DATA, ATES_URLS, ATES_AI_KEYWORDS } from "./ates";
export { CEHENNEM_DATA, CEHENNEM_URLS, CEHENNEM_AI_KEYWORDS } from "./cehennem";
export { HURMA_DATA, HURMA_URLS, HURMA_AI_KEYWORDS } from "./hurma";
export { ARI_DATA, ARI_URLS, ARI_AI_KEYWORDS } from "./ari";
export { KARINCA_DATA, KARINCA_URLS, KARINCA_AI_KEYWORDS } from "./karinca";

/** AI arama için kategori → anahtar kelime haritası (StudioApp kullanır) */
export const CLIP_AI_KEYWORDS: Record<string, string> = {
  namaz: NAMAZ_AI_KEYWORDS,
  musaf: MUSAF_AI_KEYWORDS,
  cicekler: CICEKLER_AI_KEYWORDS,
  yildizlar: YILDIZLAR_AI_KEYWORDS,
  deniz: DENIZ_AI_KEYWORDS,
  daglar: DAGLAR_AI_KEYWORDS,
  gunbatimi: GUNBATIMI_AI_KEYWORDS,
  gece: GECE_AI_KEYWORDS,
  selale: SELALE_AI_KEYWORDS,
  orman: ORMAN_AI_KEYWORDS,
  col: COL_AI_KEYWORDS,
  kar: KAR_AI_KEYWORDS,
  sehir: SEHIR_AI_KEYWORDS,
  cami: CAMI_AI_KEYWORDS,
  desen: DESEN_AI_KEYWORDS,
  gol: GOL_AI_KEYWORDS,
  bulut: BULUT_AI_KEYWORDS,
  cennet: CENNET_AI_KEYWORDS,
  ates: ATES_AI_KEYWORDS,
  cehennem: CEHENNEM_AI_KEYWORDS,
  hurma: HURMA_AI_KEYWORDS,
  ari: ARI_AI_KEYWORDS,
  karinca: KARINCA_AI_KEYWORDS,
};
