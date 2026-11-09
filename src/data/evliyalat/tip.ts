// TIP.TS — Evliyalat künyesi
export interface Evliya {
  id: string;
  ad: string;
  unvan: string;
  donem: string;
  sayfalar: string[];
  onemliAnlar: string[];
  kaynak: string;
  ad_en?: string; ad_ar?: string; ad_id?: string; ad_ur?: string;
  unvan_en?: string; unvan_ar?: string; unvan_id?: string; unvan_ur?: string;
  donem_en?: string; donem_ar?: string; donem_id?: string; donem_ur?: string;
  sayfalar_en?: string[]; sayfalar_ar?: string[]; sayfalar_id?: string[]; sayfalar_ur?: string[];
  onemliAnlar_en?: string[]; onemliAnlar_ar?: string[]; onemliAnlar_id?: string[]; onemliAnlar_ur?: string[];
  kaynak_en?: string; kaynak_ar?: string; kaynak_id?: string; kaynak_ur?: string;
}
