export interface Surah {
  n: number;
  name: string;
  count: number;
}

export interface Reciter {
  id: string;
  name: string;
  path: string;
  makam: "Haram" | "Telif";
  risk: "low" | "mid" | "high";
  /** Telif riski yüzdesi (0-100) */
  telifRiski: number;
  /** Telif risk açıklaması */
  riskAciklamasi: string;
  color: string;
  initial: string;
  country: string;
  /** Ayet-bazlı kaynak yerine tam sure kaydı kullanılan hocalar için URL şablonu ({S} = sure no) */
  surahPattern?: string;
}

export interface Theme {
  id: string;
  name: string;
  bg: string;
  bg2: string;
  acc: string;
  acc2: string;
  txt: string;
}

export interface Kissa {
  title: string;
  ref: string;
  text: string;
  s: number;
  a: number;
}

export const FREE_THEME_COUNT = 3;

export const SURAHS: Surah[] = [
  { n: 1, name: "Fâtiha", count: 7 },
  { n: 2, name: "Bakara", count: 286 },
  { n: 3, name: "Âl-i İmrân", count: 200 },
  { n: 4, name: "Nisâ", count: 176 },
  { n: 5, name: "Mâide", count: 120 },
  { n: 6, name: "En'âm", count: 165 },
  { n: 7, name: "A'râf", count: 206 },
  { n: 8, name: "Enfâl", count: 75 },
  { n: 9, name: "Tevbe", count: 129 },
  { n: 10, name: "Yûnus", count: 109 },
  { n: 11, name: "Hûd", count: 123 },
  { n: 12, name: "Yûsuf", count: 111 },
  { n: 13, name: "Ra'd", count: 43 },
  { n: 14, name: "İbrâhîm", count: 52 },
  { n: 15, name: "Hicr", count: 99 },
  { n: 16, name: "Nahl", count: 128 },
  { n: 17, name: "İsrâ", count: 111 },
  { n: 18, name: "Kehf", count: 110 },
  { n: 19, name: "Meryem", count: 98 },
  { n: 20, name: "Tâhâ", count: 135 },
  { n: 21, name: "Enbiyâ", count: 112 },
  { n: 22, name: "Hac", count: 78 },
  { n: 23, name: "Mü'minûn", count: 118 },
  { n: 24, name: "Nûr", count: 64 },
  { n: 25, name: "Furkân", count: 77 },
  { n: 26, name: "Şuarâ", count: 227 },
  { n: 27, name: "Neml", count: 93 },
  { n: 28, name: "Kasas", count: 88 },
  { n: 29, name: "Ankebût", count: 69 },
  { n: 30, name: "Rûm", count: 60 },
  { n: 31, name: "Lokmân", count: 34 },
  { n: 32, name: "Secde", count: 30 },
  { n: 33, name: "Ahzâb", count: 73 },
  { n: 34, name: "Sebe'", count: 54 },
  { n: 35, name: "Fâtır", count: 45 },
  { n: 36, name: "Yâsîn", count: 83 },
  { n: 37, name: "Sâffât", count: 182 },
  { n: 38, name: "Sâd", count: 88 },
  { n: 39, name: "Zümer", count: 75 },
  { n: 40, name: "Mü'min (Gâfir)", count: 85 },
  { n: 41, name: "Fussilet", count: 54 },
  { n: 42, name: "Şûrâ", count: 53 },
  { n: 43, name: "Zuhruf", count: 89 },
  { n: 44, name: "Duhân", count: 59 },
  { n: 45, name: "Câsiye", count: 37 },
  { n: 46, name: "Ahkâf", count: 35 },
  { n: 47, name: "Muhammed", count: 38 },
  { n: 48, name: "Fetih", count: 29 },
  { n: 49, name: "Hucurât", count: 18 },
  { n: 50, name: "Kâf", count: 45 },
  { n: 51, name: "Zâriyât", count: 60 },
  { n: 52, name: "Tûr", count: 49 },
  { n: 53, name: "Necm", count: 62 },
  { n: 54, name: "Kamer", count: 55 },
  { n: 55, name: "Rahmân", count: 78 },
  { n: 56, name: "Vâkıa", count: 96 },
  { n: 57, name: "Hadîd", count: 29 },
  { n: 58, name: "Mücâdele", count: 22 },
  { n: 59, name: "Haşr", count: 24 },
  { n: 60, name: "Mümtehine", count: 13 },
  { n: 61, name: "Saf", count: 14 },
  { n: 62, name: "Cuma", count: 11 },
  { n: 63, name: "Münâfikûn", count: 11 },
  { n: 64, name: "Teğâbün", count: 18 },
  { n: 65, name: "Talâk", count: 12 },
  { n: 66, name: "Tahrîm", count: 12 },
  { n: 67, name: "Mülk", count: 30 },
  { n: 68, name: "Kalem", count: 52 },
  { n: 69, name: "Hâkka", count: 52 },
  { n: 70, name: "Meâric", count: 44 },
  { n: 71, name: "Nûh", count: 28 },
  { n: 72, name: "Cin", count: 28 },
  { n: 73, name: "Müzzemmil", count: 20 },
  { n: 74, name: "Müddessir", count: 56 },
  { n: 75, name: "Kıyâmet", count: 40 },
  { n: 76, name: "İnsân", count: 31 },
  { n: 77, name: "Mürselât", count: 50 },
  { n: 78, name: "Nebe'", count: 40 },
  { n: 79, name: "Nâziât", count: 46 },
  { n: 80, name: "Abese", count: 42 },
  { n: 81, name: "Tekvîr", count: 29 },
  { n: 82, name: "İnfitâr", count: 19 },
  { n: 83, name: "Mutaffifîn", count: 36 },
  { n: 84, name: "İnşikâk", count: 25 },
  { n: 85, name: "Bürûc", count: 22 },
  { n: 86, name: "Târık", count: 17 },
  { n: 87, name: "A'lâ", count: 19 },
  { n: 88, name: "Ğâşiye", count: 26 },
  { n: 89, name: "Fecr", count: 30 },
  { n: 90, name: "Beled", count: 20 },
  { n: 91, name: "Şems", count: 15 },
  { n: 92, name: "Leyl", count: 21 },
  { n: 93, name: "Duhâ", count: 11 },
  { n: 94, name: "İnşirâh", count: 8 },
  { n: 95, name: "Tîn", count: 8 },
  { n: 96, name: "Alak", count: 19 },
  { n: 97, name: "Kadr", count: 5 },
  { n: 98, name: "Beyyine", count: 8 },
  { n: 99, name: "Zilzâl", count: 8 },
  { n: 100, name: "Âdiyât", count: 11 },
  { n: 101, name: "Kâria", count: 11 },
  { n: 102, name: "Tekâsür", count: 8 },
  { n: 103, name: "Asr", count: 3 },
  { n: 104, name: "Hümeze", count: 9 },
  { n: 105, name: "Fîl", count: 5 },
  { n: 106, name: "Kureyş", count: 4 },
  { n: 107, name: "Mâûn", count: 7 },
  { n: 108, name: "Kevser", count: 3 },
  { n: 109, name: "Kâfirûn", count: 6 },
  { n: 110, name: "Nasr", count: 3 },
  { n: 111, name: "Tebbet (Mesed)", count: 5 },
  { n: 112, name: "İhlâs", count: 4 },
  { n: 113, name: "Felak", count: 5 },
  { n: 114, name: "Nâs", count: 6 },
];

