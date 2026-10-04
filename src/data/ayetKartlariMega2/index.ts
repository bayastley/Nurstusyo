// AYET_KARTILARI_MEGA2 — barrel: 3 parçanın birleşimi (orijinal tek dosyadan bölündü)
import type { AyetKarti } from "../ayetKartlariData";
import { MEGA2_PARCA1 } from "./parca1";
import { MEGA2_PARCA2 } from "./parca2";
import { MEGA2_PARCA3 } from "./parca3";

export const AYET_KARTILARI_MEGA2: AyetKarti[] = [...MEGA2_PARCA1, ...MEGA2_PARCA2, ...MEGA2_PARCA3];
