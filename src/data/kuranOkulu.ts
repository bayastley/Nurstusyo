// ════════════════════════════════════════════════════════
// KURANOKULU.TS — Mahreç Akademisi (madde 1) + Çocuk Elifbâsı (madde 8)
// Mahreç sınıflaması: halk (boğaz), lisân (dil), şefeteyn (dudak), hayşûm (geniz).
// Harf sayısı ve çıkış yerleri klasik tecvid literatürüne (İbnü'l-Cezerî) dayanır.
// ════════════════════════════════════════════════════════

export type MahrecGrup = "halk" | "lisan" | "sefe" | "haysum" | "med";

export type KuranHarfi = {
  harf: string;
  ad: string;
  grup: MahrecGrup;
  nokta: string;
  ornek: string;
  ornekAnlam: string;
  /** Harfin kelime içindeki yazılışları (başta / ortada / sonda) */
  bas: string;
  orta: string;
  son: string;
  /** Sonraki harfe bağlanır mı (elif, dal, zel, ra, ze, vav, hemze bağlanmaz) */
  baglanir: boolean;
};

export const MAHREC_GRUPLARI: Array<{ id: MahrecGrup; ad: string; aciklama: string }> = [
  { id: "halk", ad: "Boğaz (halk)", aciklama: "Boğazın üç bölgesinden çıkar: en alt (ء ه), orta (ع ح), en üst/üst yakın (غ خ)." },
  { id: "lisan", ad: "Dil (lisân)", aciklama: "Dilin kökü, ortası, kenarı ve ucu ile üst/alt dişlere temas ederek çıkan harfler." },
  { id: "sefe", ad: "Dudak (şefeteyn)", aciklama: "İki dudağın birleşmesi veya alt dudağın üst dişlere değmesiyle çıkar (ف و ب م)." },
  { id: "haysum", ad: "Geniz (hayşûm)", aciklama: "Genizden gelen gunne sesi; şeddeli ن ve م harflerinde belirginleşir." },
  { id: "med", ad: "Med harfi", aciklama: "Elif (ا) tek başına mahreç harfi değildir; önündeki harekeye göre uzatma görevi görür." },
];

// 29 harf — elifbâ sırası
export const KURAN_HARFLERI: KuranHarfi[] = [
  { harf: "ا", ad: "Elif", grup: "med", nokta: "Kendi sesi yok; önündeki fetha ile 'â' okunur.", ornek: "قَالَ", ornekAnlam: "dedi" , bas: "ا", orta: "ـا", son: "ـا", baglanir: false },
  { harf: "ب", ad: "Bâ", grup: "sefe", nokta: "İki dudağın birleşmesi.", ornek: "بَاب", ornekAnlam: "kapı" , bas: "بـ", orta: "ـبـ", son: "ـب", baglanir: true },
  { harf: "ت", ad: "Tâ", grup: "lisan", nokta: "Dil ucu, üst ön dişlerin kökü.", ornek: "تَوْبَة", ornekAnlam: "tövbe" , bas: "تـ", orta: "ـتـ", son: "ـت", baglanir: true },
  { harf: "ث", ad: "Sâ", grup: "lisan", nokta: "Dil ucu, üst ön dişlerin ucu.", ornek: "ثَوَاب", ornekAnlam: "sevap" , bas: "ثـ", orta: "ـثـ", son: "ـث", baglanir: true },
  { harf: "ج", ad: "Cîm", grup: "lisan", nokta: "Dil ortası, üst damak.", ornek: "جَنَّة", ornekAnlam: "cennet" , bas: "جـ", orta: "ـجـ", son: "ـج", baglanir: true },
  { harf: "ح", ad: "Hâ", grup: "halk", nokta: "Boğazın orta bölgesi.", ornek: "حَقّ", ornekAnlam: "hak" , bas: "حـ", orta: "ـحـ", son: "ـح", baglanir: true },
  { harf: "خ", ad: "Hı", grup: "halk", nokta: "Boğazın üst bölgesine yakın kısım.", ornek: "خَيْر", ornekAnlam: "hayır" , bas: "خـ", orta: "ـخـ", son: "ـخ", baglanir: true },
  { harf: "د", ad: "Dâl", grup: "lisan", nokta: "Dil ucu, üst ön dişlerin kökü.", ornek: "دِين", ornekAnlam: "din" , bas: "د", orta: "ـد", son: "ـد", baglanir: false },
  { harf: "ذ", ad: "Zâl", grup: "lisan", nokta: "Dil ucu, üst ön dişlerin ucu.", ornek: "ذِكْر", ornekAnlam: "zikir" , bas: "ذ", orta: "ـذ", son: "ـذ", baglanir: false },
  { harf: "ر", ad: "Râ", grup: "lisan", nokta: "Dil ucu, üst diş etine yakın; titretilir.", ornek: "رَحْمَة", ornekAnlam: "rahmet" , bas: "ر", orta: "ـر", son: "ـر", baglanir: false },
  { harf: "ز", ad: "Zey", grup: "lisan", nokta: "Dil ucu, alt ön dişlerin ucu.", ornek: "زَكَاة", ornekAnlam: "zekât" , bas: "ز", orta: "ـز", son: "ـز", baglanir: false },
  { harf: "س", ad: "Sîn", grup: "lisan", nokta: "Dil ucu, alt ön dişlerin ucu.", ornek: "سَلَام", ornekAnlam: "selâm" , bas: "سـ", orta: "ـسـ", son: "ـس", baglanir: true },
  { harf: "ش", ad: "Şîn", grup: "lisan", nokta: "Dil ortası, üst damak.", ornek: "شَمْس", ornekAnlam: "güneş" , bas: "شـ", orta: "ـشـ", son: "ـش", baglanir: true },
  { harf: "ص", ad: "Sâd", grup: "lisan", nokta: "Dil ucu, alt ön dişler; kalın okunur.", ornek: "صَبْر", ornekAnlam: "sabır" , bas: "صـ", orta: "ـصـ", son: "ـص", baglanir: true },
  { harf: "ض", ad: "Dâd", grup: "lisan", nokta: "Dil kenarı, üst azı dişleri.", ornek: "ضَوْء", ornekAnlam: "ışık" , bas: "ضـ", orta: "ـضـ", son: "ـض", baglanir: true },
  { harf: "ط", ad: "Tı", grup: "lisan", nokta: "Dil ucu, üst ön dişlerin kökü; kalın.", ornek: "طَيْر", ornekAnlam: "kuş" , bas: "طـ", orta: "ـطـ", son: "ـط", baglanir: true },
  { harf: "ظ", ad: "Zı", grup: "lisan", nokta: "Dil ucu, üst ön dişlerin ucu; kalın.", ornek: "ظِلّ", ornekAnlam: "gölge" , bas: "ظـ", orta: "ـظـ", son: "ـظ", baglanir: true },
  { harf: "ع", ad: "Ayn", grup: "halk", nokta: "Boğazın orta bölgesi.", ornek: "عِلْم", ornekAnlam: "ilim" , bas: "عـ", orta: "ـعـ", son: "ـع", baglanir: true },
  { harf: "غ", ad: "Gayn", grup: "halk", nokta: "Boğazın üst bölgesine yakın kısım.", ornek: "غَيْب", ornekAnlam: "gayb" , bas: "غـ", orta: "ـغـ", son: "ـغ", baglanir: true },
  { harf: "ف", ad: "Fâ", grup: "sefe", nokta: "Alt dudak, üst ön dişlerin ucu.", ornek: "فَجْر", ornekAnlam: "fecir" , bas: "فـ", orta: "ـفـ", son: "ـف", baglanir: true },
  { harf: "ق", ad: "Kâf", grup: "lisan", nokta: "Dilin kökü, yumuşak damak.", ornek: "قَلَم", ornekAnlam: "kalem" , bas: "قـ", orta: "ـقـ", son: "ـق", baglanir: true },
  { harf: "ك", ad: "Kef", grup: "lisan", nokta: "Dilin köküne yakın kısım, sert damak.", ornek: "كِتَاب", ornekAnlam: "kitap" , bas: "كـ", orta: "ـكـ", son: "ـك", baglanir: true },
  { harf: "ل", ad: "Lâm", grup: "lisan", nokta: "Dil ucu, üst ön damak.", ornek: "لَيْل", ornekAnlam: "gece" , bas: "لـ", orta: "ـلـ", son: "ـل", baglanir: true },
  { harf: "م", ad: "Mîm", grup: "sefe", nokta: "İki dudak; ayrıca gunne ile genizden ses.", ornek: "مَاء", ornekAnlam: "su" , bas: "مـ", orta: "ـمـ", son: "ـم", baglanir: true },
  { harf: "ن", ad: "Nûn", grup: "lisan", nokta: "Dil ucu, üst diş eti; gunne ile genizden ses.", ornek: "نُور", ornekAnlam: "nur" , bas: "نـ", orta: "ـنـ", son: "ـن", baglanir: true },
  { harf: "ه", ad: "Hâ", grup: "halk", nokta: "Boğazın en alt bölgesi.", ornek: "هُدًى", ornekAnlam: "hidayet" , bas: "هـ", orta: "ـهـ", son: "ـه", baglanir: true },
  { harf: "و", ad: "Vâv", grup: "sefe", nokta: "İki dudağın yuvarlanması.", ornek: "وُضُوء", ornekAnlam: "abdest" , bas: "و", orta: "ـو", son: "ـو", baglanir: false },
  { harf: "ي", ad: "Yâ", grup: "lisan", nokta: "Dil ortası, üst damak.", ornek: "يَد", ornekAnlam: "el" , bas: "يـ", orta: "ـيـ", son: "ـي", baglanir: true },
  { harf: "ء", ad: "Hemze", grup: "halk", nokta: "Boğazın en alt bölgesi.", ornek: "أَسَد", ornekAnlam: "aslan" , bas: "ء", orta: "ء", son: "ء", baglanir: false },
];

export type MahrecSorusu = { soru: string; secenekler: string[]; dogru: number; aciklama: string };

export const MAHREC_SORULARI: MahrecSorusu[] = [
  { soru: "Hemze (ء) hangi bölgeden çıkar?", secenekler: ["Boğazın en altı", "Dil ucu", "İki dudak", "Geniz"], dogru: 0,
    aciklama: "Hemze ve ه boğazın en alt bölgesinden çıkar." },
  { soru: "ف harfinin mahreci hangisidir?", secenekler: ["Alt dudak ile üst ön dişler", "Dil ortası", "Boğaz ortası", "Geniz"], dogru: 0,
    aciklama: "Fâ, alt dudağın üst ön dişlerin ucuna değmesiyle çıkar." },
  { soru: "ض harfi hangi organla çıkar?", secenekler: ["Dil kenarı ve azı dişleri", "İki dudak", "Boğazın üstü", "Geniz"], dogru: 0,
    aciklama: "Dâd, dil kenarının üst azı dişlerine temasıyla çıkar; Arapçaya 'dâd dili' denmesi buradandır." },
  { soru: "Gunne sesi hangi bölgeyle ilgilidir?", secenekler: ["Geniz (hayşûm)", "Dil kökü", "Alt dudak", "Boğazın altı"], dogru: 0,
    aciklama: "Şeddeli ن ve م'de ses genizden gelir; buna gunne denir." },
  { soru: "ق harfinin çıkış yeri neresidir?", secenekler: ["Dilin kökü ve yumuşak damak", "Dil ucu", "İki dudak", "Boğaz ortası"], dogru: 0,
    aciklama: "Kâf, dilin en kökü ile yumuşak damağın birleştiği yerden çıkar." },
  { soru: "Aşağıdakilerden hangisi boğaz harfi değildir?", secenekler: ["س", "ء", "ح", "خ"], dogru: 0,
    aciklama: "Sîn dil harfidir; diğer üçü boğazdan çıkar." },
  { soru: "ش harfi hangi bölgeden çıkar?", secenekler: ["Dil ortası ve üst damak", "Boğazın altı", "İki dudak", "Alt dişler"], dogru: 0,
    aciklama: "Şîn, dil ortasının üst damağa yaklaşmasıyla çıkar." },
  { soru: "Elif (ا) için doğru olan hangisidir?", secenekler: ["Med harfidir, tek başına mahreç harfi değildir", "Boğaz harfidir", "Dudak harfidir", "Geniz harfidir"], dogru: 0,
    aciklama: "Elif kendi başına ses vermez; önündeki harekeye göre uzatma yapar." },
  { soru: "ط ve ت arasındaki temel fark nedir?", secenekler: ["Tı kalın, Tâ ince okunur", "Tâ boğazdan çıkar", "Tı dudaktan çıkar", "Fark yoktur"], dogru: 0,
    aciklama: "İkisi de dil ucuyla çıkar; Tı kalın (müfahham), Tâ ince okunur." },
  { soru: "م harfinde gunne hangi durumda belirginleşir?", secenekler: ["Şeddeli veya sakin hâlde", "Her zaman aynıdır", "Sadece fetha ile", "Sadece kelime başında"], dogru: 0,
    aciklama: "Şeddeli م ve ن'de gunne tam, sakin hâlde ihfâ/iklâb durumlarında kısmi uygulanır." },
];

export const MAHREC_KAYNAK_NOTU =
  "Mahreç sınıflaması klasik tecvid literatürüne (İbnü'l-Cezerî, el-Mukaddime) dayanır. Uygulamalı öğrenme için bir hocadan yüz yüze talim tavsiye edilir; bu bölüm tanıtım ve tekrar amaçlıdır.";
