// ════════════════════════════════════════════════════════
// SORULAR/INDEX.TS — Konu bloklarını tek ana bankada birleştirir (31.10).
// TÜM İSLAMİ KONULAR tek listede — akıllı arama bunun üzerinden çalışır.
// ════════════════════════════════════════════════════════
import type { SoruKart } from "./tip";
import { BLOK1_IMAN } from "./blok1-iman";
import { BLOK2_GUNAH } from "./blok2-gunah";
import { BLOK3_ABDEST } from "./blok3-abdest";
import { BLOK4_NAMAZ } from "./blok4-namaz";
import { BLOK5_ORUC_ZEKAT } from "./blok5-oruc-zekat";
import { BLOK6_HAC_UMRE } from "./blok6-hac-umre";
import { BLOK7_AILE_MIRAS } from "./blok7-aile-miras";
import { BLOK8_GUNDLUK_HAYAT } from "./blok8-gunluk-hayat";
import { BLOK9_TESETTUR_EDEP } from "./blok9-tesettur-edep";
import { BLOK10_MELEKLER_KADER } from "./blok10-melekler-kader";
import { BLOK11_SAHABE_SEVGI } from "./blok11-sahabe-sevgi";
import { BLOK12_RAMAZAN_BAYRAM } from "./blok12-ramazan-bayram";
import { BLOK13_AHIRET } from "./blok13-ahiret-cennet";
import { BLOK14_DUA_ZIKIR } from "./blok14-dua-zikir";

export type { SoruKart } from "./tip";
export { soruGorunum } from "./tip";

/** Tüm konu bloklarının birleşimi — sıra: İman → Günah → İbadetler → Gündelik */
export const SORU_BANKASI: SoruKart[] = [
  ...BLOK1_IMAN,
  ...BLOK2_GUNAH,
  ...BLOK3_ABDEST,
  ...BLOK4_NAMAZ,
  ...BLOK5_ORUC_ZEKAT,
  ...BLOK6_HAC_UMRE,
  ...BLOK7_AILE_MIRAS,
  ...BLOK8_GUNDLUK_HAYAT,
  ...BLOK9_TESETTUR_EDEP,
  ...BLOK10_MELEKLER_KADER,
  ...BLOK11_SAHABE_SEVGI,
  ...BLOK12_RAMAZAN_BAYRAM,
  ...BLOK13_AHIRET,
  ...BLOK14_DUA_ZIKIR,
];
