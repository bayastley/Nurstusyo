export type { Row } from "../clips-data";

export { NAMAZ_DATA } from "./namaz";
export { MUSAF_DATA } from "./musaf";
export { CICEKLER_DATA } from "./cicekler";
export { YILDIZLAR_DATA } from "./yildizlar";
export { DENIZ_DATA } from "./deniz";
export { DAGLAR_DATA } from "./daglar";
export { GUNBATIMI_DATA } from "./gunbatimi";
export { GECE_DATA } from "./gece";
export { SELALE_DATA } from "./selale";
export { ORMAN_DATA } from "./orman";
export { COL_DATA } from "./col";
export { KAR_DATA } from "./kar";
export { SEHIR_DATA } from "./sehir";
export { CAMI_DATA } from "./cami";
export { DESEN_DATA } from "./desen";
export { GOL_DATA } from "./gol";
export { BULUT_DATA } from "./bulut";
export { CENNET_DATA } from "./cennet";
export { ATES_DATA } from "./ates";
export { CEHENNEM_DATA } from "./cehennem";
export { HURMA_DATA } from "./hurma";
export { ARI_DATA } from "./ari";
export { KARINCA_DATA } from "./karinca";

/** AI arama: kategori → anahtar kelimeler (StudioApp kullanır) */
export const CLIP_AI_KEYWORDS: Record<string, string> = {
  namaz: "namaz kabe mescid hac tavaf cami ibadet secde",
  musaf: "kuran mushaf ayet sure tilavet kitap",
  cicekler: "çiçek bahar gül lale tabiat",
  yildizlar: "yıldız gökyüzü gece evren",
  deniz: "deniz okyanus dalga su sahil",
  daglar: "dağ zirve tepe manzara",
  gunbatimi: "gün batımı akşam günbatımı",
  gece: "gece ay karanlık",
  selale: "şelale çağlayan su nehir",
  orman: "orman ağaç yeşil yaprak",
  col: "çöl kum kurak vaha",
  kar: "kar kış buz soğuk",
  sehir: "şehir bina ışıklar",
  cami: "cami mescid minare kubbe",
  desen: "desen süs tezhip sanat",
  gol: "göl su yansıma",
  bulut: "bulut gökyüzü yağmur",
  cennet: "cennet bahçe nur",
  ates: "ateş alev kor yan",
  cehennem: "cehennem nar azap",
  hurma: "hurma palmiye rızık",
  ari: "arı bal petek şifa",
  karinca: "karınca emek",
};
