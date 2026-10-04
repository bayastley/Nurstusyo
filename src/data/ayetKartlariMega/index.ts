// AYET_KARTILARI_MEGA — barrel: 3 parçanın birleşimi (orijinal tek dosyadan bölündü)
import type { AyetKarti } from "../ayetKartlariData";
import { MEGA_PARCA1 } from "./parca1";
import { MEGA_PARCA2 } from "./parca2";
import { MEGA_PARCA3 } from "./parca3";

export const AYET_KARTILARI_MEGA: AyetKarti[] = [...MEGA_PARCA1, ...MEGA_PARCA2, ...MEGA_PARCA3];
