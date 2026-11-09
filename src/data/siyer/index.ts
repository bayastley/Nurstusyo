import type { SiyerKategori } from "../siyer.types";
import { SIYER_DOGUM } from "./p01-dogum";
import { SIYER_GENCLIK } from "./p02-genclik";
import { SIYER_HIRA } from "./p03-hira";
import { SIYER_DAVET } from "./p04-davet";
import { SIYER_EZIYET } from "./p05-eziyet";
import { SIYER_BOYKOT } from "./p06-boykot";
import { SIYER_AKABE } from "./p07-akabe";
import { SIYER_HICRET } from "./p08-hicret";
import { SIYER_MEDINE } from "./p09-medine";
import { SIYER_BEDIR } from "./p10-bedir";
import { SIYER_UHUD } from "./p11-uhud";
import { SIYER_HANDAK } from "./p12-handak";
import { SIYER_HUDAYBIYE } from "./p13-hudaybiye";
import { SIYER_HUNEYN } from "./p14-huneyn";
import { SIYER_VEDA } from "./p15-veda";

export type { SiyerDonem, SiyerOlay, SiyerKategori } from "../siyer.types";
export const SIYER_KATEGORILER: SiyerKategori[] = [SIYER_DOGUM,SIYER_GENCLIK,SIYER_HIRA,SIYER_DAVET,SIYER_EZIYET,SIYER_BOYKOT,SIYER_AKABE,SIYER_HICRET,SIYER_MEDINE,SIYER_BEDIR,SIYER_UHUD,SIYER_HANDAK,SIYER_HUDAYBIYE,SIYER_HUNEYN,SIYER_VEDA];
