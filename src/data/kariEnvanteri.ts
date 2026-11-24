/**
 * MP3Quran kâri envanteri — BİZDE OLMAYANLAR
 *
 * Kaynak: https://mp3quran.net/api/v3/reciters?language=eng (+ ?language=ar)
 * Çekim: 24.11.2026 · Katalogda 244 kâri / 299 rivayet var.
 * Bizim src/reciters.ts listesindeki 45 kâriden 41'i MP3Quran'da mevcut;
 * geriye kalan 208 kâri burada kayıt altına alındı.
 *
 * ÖNEMLİ: MP3Quran'da AYET BAZLI dosya YOK — sunucular yalnız tam sure
 * ({sure}.mp3) verir. Ayet bazlı üretim bu kayıtlarla çalışmaz; tam sure
 * modu için kullanılabilir (bkz. Reciter.full / surahPattern deseni).
 *
 * Lisans: mp3quran.net/eng/privacy sayfası "all rights available to everyone"
 * beyanı içeriyor (site geneli beyan, kayıt bazlı yazılı izin değildir).
 * Üretim çıktısında SES_ATIF_ETIKETI kaynak beyanı korunmalıdır.
 *
 * Bizde olup MP3Quran'da OLMAYAN 4 kâri: Ayman Sowaid, Shahriar Parhizgar,
 * Aziz Alili, Karim Mansoori (yalnız everyayah/islamic.network arşivinde).
 */

export interface RivayetKaydi {
  /** Rivayet/mushaf adı (MP3Quran) */
  ad: string;
  /** Tam sure sunucusu — dosya adı {sure}.mp3 */
  sunucu: string;
  /** Sunucudaki klasör adı */
  klasor: string;
  /** Sunucudaki sure sayısı (0-114) */
  sureSayisi: number;
}

export interface EnvanterKari {
  mp3quranId: number;
  ad: string;
  adArapca: string;
  rivayetler: RivayetKaydi[];
}

export const MP3QURAN_ENVANTER = {
  kaynakApi: "https://mp3quran.net/api/v3/reciters",
  cekimTarihi: "2026-11-24",
  katalogKari: 244,
  katalogRivayet: 299,
  bizdeVar: 36,
  eksik: 208,
  ayetBazliDosya: false,
} as const;

export const MP3QURAN_DA_OLMAYAN_KARILER = [
  "Ayman Sowaid",
  "Shahriar Parhizgar",
  "Aziz Alili",
  "Karim Mansoori",
] as const;

/** Bizde (src/reciters.ts) olmayan MP3Quran kârileri — alfabetik değil, API sırası. */
export const MP3QURAN_EKSIK_KARILER: EnvanterKari[] = [
  {
    mp3quranId: 100,
    ad: "Majed Al-Enezi",
    adArapca: "ماجد العنزي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/majed-anazi/r1/", klasor: "majed-anazi", sureSayisi: 113 },
    ],
  },
  {
    mp3quranId: 104,
    ad: "Mohammad Al-Airawy",
    adArapca: "محمد الأيراوي",
    rivayetler: [
      { ad: "Rewayat Warsh A'n Nafi' Men Tariq Alazraq - Murattal", sunucu: "https://cdn.mp3quran.net/audio/muhammad-iraoui/r1/", klasor: "muhammad-iraoui", sureSayisi: 111 },
    ],
  },
  {
    mp3quranId: 105,
    ad: "Mohammed Al-Barrak",
    adArapca: "محمد البراك",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/muhammad-barrak/r1/", klasor: "muhammad-barrak", sureSayisi: 63 },
    ],
  },
  {
    mp3quranId: 107,
    ad: "Mohammed Al-Lohaidan",
    adArapca: "محمد اللحيدان",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/muhammad-luhaidan/r1/", klasor: "muhammad-luhaidan", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 11,
    ad: "Alhusayni Al-Azazi",
    adArapca: "الحسيني العزازي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Almusshaf Al Mo'lim", sunucu: "https://cdn.mp3quran.net/audio/husayni-azazi/r1/", klasor: "husayni-azazi", sureSayisi: 57 },
    ],
  },
  {
    mp3quranId: 110,
    ad: "Mohammad Saleh Alim Shah",
    adArapca: "محمد صالح عالم شاه",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/muhammad-shah/r1/", klasor: "muhammad-shah", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 116,
    ad: "Mohammad Al-Abdullah",
    adArapca: "محمد عبدالحكيم سعيد العبدالله",
    rivayetler: [
      { ad: "Rewayat AlDorai A'n Al-Kisa'ai - Murattal", sunucu: "https://cdn.mp3quran.net/audio/muhammad-abdullah/r2/", klasor: "muhammad-abdullah", sureSayisi: 114 },
      { ad: "Rewayat Albizi and Qunbol A'n Ibn Katheer - Murattal", sunucu: "https://cdn.mp3quran.net/audio/muhammad-abdullah/r1/", klasor: "muhammad-abdullah", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 12,
    ad: "Idrees Abkr",
    adArapca: "إدريس أبكر",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/idrees-abkar/r1/", klasor: "idrees-abkar", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 126,
    ad: "Mustafa Al-Lahoni",
    adArapca: "مصطفى اللاهوني",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/mustafa-lahouni/r1/", klasor: "mustafa-lahouni", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 127,
    ad: "Mustafa raad Alazawy",
    adArapca: "مصطفى رعد العزاوي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/mustafa-azzawi/r1/", klasor: "mustafa-azzawi", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 128,
    ad: "Muamar (From Indonesia)",
    adArapca: "معمر الأندونيسي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/muammar-za/r1/", klasor: "muammar-za", sureSayisi: 8 },
    ],
  },
  {
    mp3quranId: 129,
    ad: "Muftah Alsaltany",
    adArapca: "مفتاح السلطني",
    rivayetler: [
      { ad: "Ibn Thakwan A'n Ibn Amer - Murattal", sunucu: "https://cdn.mp3quran.net/audio/muftah-saltani/r5/", klasor: "muftah-saltani", sureSayisi: 114 },
      { ad: "Sho'bah A'n Asim - Murattal", sunucu: "https://cdn.mp3quran.net/audio/muftah-saltani/r4/", klasor: "muftah-saltani", sureSayisi: 77 },
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/muftah-saltani/r3/", klasor: "muftah-saltani", sureSayisi: 114 },
      { ad: "Rewayat AlDorai A'n Al-Kisa'ai - Murattal", sunucu: "https://cdn.mp3quran.net/audio/muftah-saltani/r2/", klasor: "muftah-saltani", sureSayisi: 114 },
      { ad: "Rewayat Aldori A'n Abi Amr - Murattal", sunucu: "https://cdn.mp3quran.net/audio/muftah-saltani/r1/", klasor: "muftah-saltani", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 13,
    ad: "Alzain Mohammad Ahmad",
    adArapca: "الزين محمد أحمد",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/zain-ahmad/r1/", klasor: "zain-ahmad", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 134,
    ad: "Mohammad Saayed",
    adArapca: "محمد سايد",
    rivayetler: [
      { ad: "Rewayat Warsh A'n Nafi' - Murattal", sunucu: "https://cdn.mp3quran.net/audio/muhammad-saayed/r1/", klasor: "muhammad-saayed", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 135,
    ad: "Abdulrahman Alsuwayid",
    adArapca: "عبدالرحمن السويّد",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/abdulrahman-suwayid/r1/", klasor: "abdulrahman-suwayid", sureSayisi: 113 },
    ],
  },
  {
    mp3quranId: 136,
    ad: "Abdulelah bin Aoun",
    adArapca: "عبدالإله بن عون",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/abdulelah-aoun/r1/", klasor: "abdulelah-aoun", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 137,
    ad: "Ahmad Talib bin Humaid",
    adArapca: "أحمد طالب بن حميد",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/ahmad-humaid/r1/", klasor: "ahmad-humaid", sureSayisi: 107 },
    ],
  },
  {
    mp3quranId: 138,
    ad: "Noreen Mohammad Siddiq",
    adArapca: "نورين محمد صديق",
    rivayetler: [
      { ad: "Rewayat Aldori A'n Abi Amr - Murattal", sunucu: "https://cdn.mp3quran.net/audio/noreen-siddiq/r1/", klasor: "noreen-siddiq", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 139,
    ad: "Majed Al-Zamil",
    adArapca: "ماجد الزامل",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/majed-zamil/r1/", klasor: "majed-zamil", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 14,
    ad: "Al-Qaria Yassen",
    adArapca: "القارئ ياسين",
    rivayetler: [
      { ad: "Rewayat Warsh A'n Nafi' - Murattal", sunucu: "https://cdn.mp3quran.net/audio/yassen-jazairi/r1/", klasor: "yassen-jazairi", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 149,
    ad: "Maher Shakhashero",
    adArapca: "ماهر شخاشيرو",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/maher-shakhashiro/r1/", klasor: "maher-shakhashiro", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 15,
    ad: "Alashri Omran",
    adArapca: "العشري عمران",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/ashri-omran/r1/", klasor: "ashri-omran", sureSayisi: 113 },
    ],
  },
  {
    mp3quranId: 150,
    ad: "Mohammad AlMonshed",
    adArapca: "محمد المنشد",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/muhammad-monshed/r1/", klasor: "muhammad-monshed", sureSayisi: 110 },
    ],
  },
  {
    mp3quranId: 151,
    ad: "Mahmood AlSheimy",
    adArapca: "محمود الشيمي",
    rivayetler: [
      { ad: "Rewayat AlDorai A'n Al-Kisa'ai - Murattal", sunucu: "https://cdn.mp3quran.net/audio/mahmoud-sheimy/r1/", klasor: "mahmoud-sheimy", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 153,
    ad: "Akhil Abdulhayy Rawa",
    adArapca: "أخيل عبدالحي روا",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/akhil-rawa/r1/", klasor: "akhil-rawa", sureSayisi: 4 },
    ],
  },
  {
    mp3quranId: 154,
    ad: "Ustaz Zamri",
    adArapca: "أستاذ زامري",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/zamri-abdullah/r1/", klasor: "zamri-abdullah", sureSayisi: 7 },
    ],
  },
  {
    mp3quranId: 159,
    ad: "Khalid Almohana",
    adArapca: "خالد المهنا",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/khalid-mohanna/r1/", klasor: "khalid-mohanna", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 16,
    ad: "Aloyoon Al-Koshi",
    adArapca: "العيون الكوشي",
    rivayetler: [
      { ad: "Rewayat Warsh A'n Nafi' - Murattal", sunucu: "https://cdn.mp3quran.net/audio/laayoun-kouchi/r1/", klasor: "laayoun-kouchi", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 160,
    ad: "Adel Al-Khalbany",
    adArapca: "عادل الكلباني",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/adel-kalbani/r1/", klasor: "adel-kalbani", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 161,
    ad: "Mousa Bilal",
    adArapca: "موسى بلال",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/musa-bilal/r1/", klasor: "musa-bilal", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 162,
    ad: "Hussain Alshaik",
    adArapca: "حسين آل الشيخ",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/hussain-sheikh/r1/", klasor: "hussain-sheikh", sureSayisi: 59 },
    ],
  },
  {
    mp3quranId: 163,
    ad: "Hatem Fareed Alwaer",
    adArapca: "حاتم فريد الواعر",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/hatem-waer/r1/", klasor: "hatem-waer", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 164,
    ad: "Ibrahim Aljormy",
    adArapca: "إبراهيم الجرمي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/ibrahim-jormy/r1/", klasor: "ibrahim-jormy", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 165,
    ad: "Mahmood Al rifai",
    adArapca: "محمود الرفاعي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/mahmoud-rifai/r1/", klasor: "mahmoud-rifai", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 166,
    ad: "Nasser Al obaid",
    adArapca: "ناصر العبيد",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/nasser-obaid/r1/", klasor: "nasser-obaid", sureSayisi: 67 },
    ],
  },
  {
    mp3quranId: 167,
    ad: "Wasel Almethen",
    adArapca: "واصل المذن",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/wasel-methen/r1/", klasor: "wasel-methen", sureSayisi: 9 },
    ],
  },
  {
    mp3quranId: 17,
    ad: "Tawfeeq As-Sayegh",
    adArapca: "توفيق الصايغ",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/tawfeeq-sayegh/r1/", klasor: "tawfeeq-sayegh", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 178,
    ad: "Ibrahim Aldosari",
    adArapca: "إبراهيم الدوسري",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/ibrahim-dosari/r2/", klasor: "ibrahim-dosari", sureSayisi: 114 },
      { ad: "Rewayat Warsh A'n Nafi' - Murattal", sunucu: "https://cdn.mp3quran.net/audio/ibrahim-dosari/r1/", klasor: "ibrahim-dosari", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 18,
    ad: "Jamal Shaker Abdullah",
    adArapca: "جمال شاكر عبدالله",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/jamal-abdullah/r1/", klasor: "jamal-abdullah", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 181,
    ad: "Jamaan Alosaimi",
    adArapca: "جمعان العصيمي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/jamaan-osaimi/r1/", klasor: "jamaan-osaimi", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 183,
    ad: "Rodziah Abdulrahman",
    adArapca: "رضية عبدالرحمن",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/rodziah-abdulrahman/r1/", klasor: "rodziah-abdulrahman", sureSayisi: 4 },
    ],
  },
  {
    mp3quranId: 184,
    ad: "Rogayah Sulong",
    adArapca: "رقية سولونق",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/rogayah-sulong/r1/", klasor: "rogayah-sulong", sureSayisi: 1 },
    ],
  },
  {
    mp3quranId: 185,
    ad: "Sapinah Mamat",
    adArapca: "سابينة مامات",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/sapinah-mamat/r1/", klasor: "sapinah-mamat", sureSayisi: 4 },
    ],
  },
  {
    mp3quranId: 187,
    ad: "Saidin Abdulrahman",
    adArapca: "سيدين عبدالرحمن",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/saidin-abdulrahman/r1/", klasor: "saidin-abdulrahman", sureSayisi: 4 },
    ],
  },
  {
    mp3quranId: 188,
    ad: "Abdulghani Abdullah",
    adArapca: "عبدالغني عبدالله",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/abdulghani-abdullah/r1/", klasor: "abdulghani-abdullah", sureSayisi: 13 },
    ],
  },
  {
    mp3quranId: 189,
    ad: "Abdullah Fahmi",
    adArapca: "عبدالله فهمي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/abdullah-fahmi/r1/", klasor: "abdullah-fahmi", sureSayisi: 4 },
    ],
  },
  {
    mp3quranId: 19,
    ad: "Hamad Al Daghriri",
    adArapca: "حمد الدغريري",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/hamad-daghriri/r1/", klasor: "hamad-daghriri", sureSayisi: 88 },
    ],
  },
  {
    mp3quranId: 190,
    ad: "Muhammad Al-Hafiz",
    adArapca: "محمد الحافظ",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/muhammad-hafiz/r1/", klasor: "muhammad-hafiz", sureSayisi: 3 },
    ],
  },
  {
    mp3quranId: 191,
    ad: "Mohammed Hafas Ali",
    adArapca: "محمد حفص علي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/muhammad-ali/r1/", klasor: "muhammad-ali", sureSayisi: 5 },
    ],
  },
  {
    mp3quranId: 192,
    ad: "Muhammed Khairul Anuar",
    adArapca: "محمد خير النور",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/muhammad-anuar/r1/", klasor: "muhammad-anuar", sureSayisi: 4 },
    ],
  },
  {
    mp3quranId: 193,
    ad: "Yousef Bin Noah Ahmad",
    adArapca: "يوسف بن نوح أحمد",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/yousef-ahmad/r1/", klasor: "yousef-ahmad", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 194,
    ad: "Jamal Addeen Alzailaie",
    adArapca: "جمال الدين الزيلعي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/jamaluddin-zailai/r1/", klasor: "jamaluddin-zailai", sureSayisi: 8 },
    ],
  },
  {
    mp3quranId: 197,
    ad: "Moeedh Alharthi",
    adArapca: "معيض الحارثي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/moeedh-harthi/r1/", klasor: "moeedh-harthi", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 198,
    ad: "Mohammad Rashad Alshareef",
    adArapca: "محمد رشاد الشريف",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/muhammad-shareef/r1/", klasor: "muhammad-shareef", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 2,
    ad: "Ibrahim Al-Jebreen",
    adArapca: "إبراهيم الجبرين",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/ibrahim-jibreen/r1/", klasor: "ibrahim-jibreen", sureSayisi: 107 },
    ],
  },
  {
    mp3quranId: 20,
    ad: "Khalid Al-Jileel",
    adArapca: "خالد الجليل",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/khalid-jalil/r1/", klasor: "khalid-jalil", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 201,
    ad: "Ahmed Al-trabulsi",
    adArapca: "أحمد الطرابلسي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/ahmad-tarabulsi/r2/", klasor: "ahmad-tarabulsi", sureSayisi: 114 },
      { ad: "Rewayat Qalon A'n Nafi' - Murattal", sunucu: "https://cdn.mp3quran.net/audio/ahmad-tarabulsi/r1/", klasor: "ahmad-tarabulsi", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 202,
    ad: "Abdullah Al-Kandari",
    adArapca: "عبدالله الكندري",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/abdullah-kandari/r1/", klasor: "abdullah-kandari", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 203,
    ad: "Ahmed Amer",
    adArapca: "أحمد عامر",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/ahmad-amer/r1/", klasor: "ahmad-amer", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 204,
    ad: "Ibrahem Assadan",
    adArapca: "إبراهيم السعدان",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/ibrahim-saadan/r1/", klasor: "ibrahim-saadan", sureSayisi: 50 },
    ],
  },
  {
    mp3quranId: 205,
    ad: "Ahmad Alhuthaifi",
    adArapca: "أحمد الحذيفي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/ahmad-hudhaifi/r1/", klasor: "ahmad-hudhaifi", sureSayisi: 110 },
    ],
  },
  {
    mp3quranId: 206,
    ad: "Mohammed Osman Khan",
    adArapca: "محمد عثمان خان",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/muhammad-khan/r1/", klasor: "muhammad-khan", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 207,
    ad: "Youssef Edghouch",
    adArapca: "يوسف الدغوش",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/youssef-edghouch/r1/", klasor: "youssef-edghouch", sureSayisi: 26 },
    ],
  },
  {
    mp3quranId: 208,
    ad: "Addokali Mohammad Alalim",
    adArapca: "الدوكالي محمد العالم",
    rivayetler: [
      { ad: "Rewayat Qalon A'n Nafi' - Murattal", sunucu: "https://cdn.mp3quran.net/audio/dokali-alim/r1/", klasor: "dokali-alim", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 209,
    ad: "Wishear Hayder Arbili",
    adArapca: "وشيار حيدر اربيلي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/wishear-arbili/r1/", klasor: "wishear-arbili", sureSayisi: 2 },
    ],
  },
  {
    mp3quranId: 211,
    ad: "Alfateh Alzubair",
    adArapca: "الفاتح محمد الزبير",
    rivayetler: [
      { ad: "Rewayat Aldori A'n Abi Amr - Murattal", sunucu: "https://cdn.mp3quran.net/audio/fateh-zubair/r1/", klasor: "fateh-zubair", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 21136,
    ad: "Abdullah Alqarafi",
    adArapca: "عبدالله القرافي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/abdullah-qarafi/r1/", klasor: "abdullah-qarafi", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 21148,
    ad: "Abdulbadi Ghailan",
    adArapca: "عبدالبديع غيلان",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/abdulbadi-ghailan/r1/", klasor: "abdulbadi-ghailan", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 21181,
    ad: "Muhammad Burhaji",
    adArapca: "محمد برهجي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/muhammad-burhaji/r1/", klasor: "muhammad-burhaji", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 21182,
    ad: "Yusuf ALaidroos",
    adArapca: "يوسف العيدروس",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Featured Recitation", sunucu: "https://cdn.mp3quran.net/audio/yousef-aidarous/r1/", klasor: "yousef-aidarous", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 21183,
    ad: "Hassan Aldaghriri",
    adArapca: "حسن الدغريري",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/hassan-daghriri/r1/", klasor: "hassan-daghriri", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 21184,
    ad: "Muhammad Al Faqih",
    adArapca: "محمد الفقيه",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/muhammad-faqih/r1/", klasor: "muhammad-faqih", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 21186,
    ad: "Junaid Adam Abdullah",
    adArapca: "جنيد آدم عبدالله",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/junaid-abdullah/r1/", klasor: "junaid-abdullah", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 21187,
    ad: "Khalid Alziyadi",
    adArapca: "خالد الزيادي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/khalid-ziyadi/r1/", klasor: "khalid-ziyadi", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 21188,
    ad: "Alwaleed Alshamsan",
    adArapca: "الوليد الشمسان",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/waleed-shamsan/r1/", klasor: "waleed-shamsan", sureSayisi: 71 },
    ],
  },
  {
    mp3quranId: 21191,
    ad: "Ibrahim Al-Shahri",
    adArapca: "إبراهيم الشهري",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/ibrahim-shahri/r1/", klasor: "ibrahim-shahri", sureSayisi: 113 },
    ],
  },
  {
    mp3quranId: 21193,
    ad: "Abdul Rahman bin Abdul Razzaq Al Badr",
    adArapca: "عبدالرحمن بن عبدالرزاق البدر",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/abdulrahman-badr/r1/", klasor: "abdulrahman-badr", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 21196,
    ad: "Alijon Qori",
    adArapca: "عليجان قوري حمدان",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/alijon-hamdan/r1/", klasor: "alijon-hamdan", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 21197,
    ad: "Mohammed Al-Zubaidi",
    adArapca: "محمد الزبيدي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/muhammad-zubaidi/r1/", klasor: "muhammad-zubaidi", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 21199,
    ad: "Abdelmoujib Benkirane",
    adArapca: "عبد المجيب بنكيران",
    rivayetler: [
      { ad: "Rewayat Warsh A'n Nafi' - Murattal", sunucu: "https://cdn.mp3quran.net/audio/abdelmoujib-benkirane/r1/", klasor: "abdelmoujib-benkirane", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 212,
    ad: "Tareq Abdulgani daawob",
    adArapca: "طارق عبدالغني دعوب",
    rivayetler: [
      { ad: "Rewayat Qalon A'n Nafi' - Murattal", sunucu: "https://cdn.mp3quran.net/audio/tareq-daawob/r1/", klasor: "tareq-daawob", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 21200,
    ad: "Mohammad Dibirov",
    adArapca: "محمد ديبيروف",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/muhammad-dibirov/r1/", klasor: "muhammad-dibirov", sureSayisi: 24 },
    ],
  },
  {
    mp3quranId: 21201,
    ad: "Asim Al-Luhaidan",
    adArapca: "عاصم اللحیدان",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/asim-luhaidan/r1/", klasor: "asim-luhaidan", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 21202,
    ad: "Mahmoud Harfoush",
    adArapca: "محمود حرفوش",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/mahmoud-harfoush/r1/", klasor: "mahmoud-harfoush", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 21203,
    ad: "Ayman Rushdi Swaid",
    adArapca: "أيمن رشدي سويد",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Almusshaf Al Mo'lim", sunucu: "https://server15.mp3quran.net/a-rushdi/Almusshaf-Al-Mo-lim/", klasor: "a-rushdi", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 21204,
    ad: "Mustapha Gharbi",
    adArapca: "مصطفى غربي",
    rivayetler: [
      { ad: "Rewayat Warsh A'n Nafi' - Murattal", sunucu: "https://server15.mp3quran.net/m-gharbi/Rewayat-Warsh-A-n-Nafi/", klasor: "m-gharbi", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 216,
    ad: "Othman Al-Ansary",
    adArapca: "عثمان الأنصاري",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/othman-ansari/r1/", klasor: "othman-ansari", sureSayisi: 76 },
    ],
  },
  {
    mp3quranId: 217,
    ad: "Bandar Balilah",
    adArapca: "بندر بليله",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/bandar-baleela/r1/", klasor: "bandar-baleela", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 218,
    ad: "Khalid Al-Shoraimy",
    adArapca: "خالد الشريمي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/khalid-shuraimi/r1/", klasor: "khalid-shuraimi", sureSayisi: 73 },
    ],
  },
  {
    mp3quranId: 219,
    ad: "Wadeea Al-Yamani",
    adArapca: "وديع اليمني",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/wadee-yamani/r1/", klasor: "wadee-yamani", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 22,
    ad: "Khalid Abdulkafi",
    adArapca: "خالد عبدالكافي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/khalid-abdulkafi/r1/", klasor: "khalid-abdulkafi", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 221,
    ad: "Raad Al Kurdi",
    adArapca: "رعد محمد الكردي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/raad-kurdi/r1/", klasor: "raad-kurdi", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 225,
    ad: "Abdulrahman Aloosi",
    adArapca: "عبدالرحمن العوسي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/abdulrahman-oosi/r1/", klasor: "abdulrahman-oosi", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 226,
    ad: "Khalid Algamdi",
    adArapca: "خالد الغامدي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/khalid-ghamdi/r1/", klasor: "khalid-ghamdi", sureSayisi: 102 },
    ],
  },
  {
    mp3quranId: 227,
    ad: "Ramadan Shakoor",
    adArapca: "رمضان شكور",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/ramadan-shakoor/r1/", klasor: "ramadan-shakoor", sureSayisi: 65 },
    ],
  },
  {
    mp3quranId: 228,
    ad: "Abdulmajeed Al-Arkani",
    adArapca: "عبدالمجيد الأركاني",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/abdulmajeed-arkani/r1/", klasor: "abdulmajeed-arkani", sureSayisi: 49 },
    ],
  },
  {
    mp3quranId: 229,
    ad: "Mohammad Khalil Al-Qari",
    adArapca: "محمد خليل القارئ",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/muhammad-khalil/r1/", klasor: "muhammad-khalil", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 23,
    ad: "Khalid Al-Wehabi",
    adArapca: "خالد الوهيبي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/khalid-wahaibi/r1/", klasor: "khalid-wahaibi", sureSayisi: 25 },
    ],
  },
  {
    mp3quranId: 230,
    ad: "Rami Aldeais",
    adArapca: "رامي الدعيس",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/rami-duais/r1/", klasor: "rami-duais", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 231,
    ad: "Hazza Al-Balushi",
    adArapca: "هزاع البلوشي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/hazza-balushi/r1/", klasor: "hazza-balushi", sureSayisi: 91 },
    ],
  },
  {
    mp3quranId: 236,
    ad: "Abdulrahman Al-Majed",
    adArapca: "عبدالرحمن الماجد",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/abdulrahman-majed/r1/", klasor: "abdulrahman-majed", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 237,
    ad: "Marwan Alakri",
    adArapca: "مروان العكري",
    rivayetler: [
      { ad: "Rewayat Qalon A'n Nafi' - Murattal", sunucu: "https://cdn.mp3quran.net/audio/marwan-akri/r1/", klasor: "marwan-akri", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 240,
    ad: "Salman Alotaibi",
    adArapca: "سلمان العتيبي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/salman-otaibi/r1/", klasor: "salman-otaibi", sureSayisi: 75 },
    ],
  },
  {
    mp3quranId: 241,
    ad: "Mohammad Refat",
    adArapca: "محمد رفعت",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/muhammad-refaat/r1/", klasor: "muhammad-refaat", sureSayisi: 31 },
    ],
  },
  {
    mp3quranId: 243,
    ad: "Abdullah Al-Mousa",
    adArapca: "عبدالله الموسى",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Almusshaf Al Mo'lim", sunucu: "https://cdn.mp3quran.net/audio/abdullah-mousa/r2/", klasor: "abdullah-mousa", sureSayisi: 38 },
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/abdullah-mousa/r1/", klasor: "abdullah-mousa", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 244,
    ad: "Abdullah Al-Khalaf",
    adArapca: "عبدالله الخلف",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/abdullah-khalaf/r1/", klasor: "abdullah-khalaf", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 245,
    ad: "Mansour Al-Salemi",
    adArapca: "منصور السالمي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/mansour-salimi/r1/", klasor: "mansour-salimi", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 246,
    ad: "Salah Musali",
    adArapca: "صلاح مصلي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/salah-musalli/r1/", klasor: "salah-musalli", sureSayisi: 49 },
    ],
  },
  {
    mp3quranId: 247,
    ad: "Khalid Alsharekh",
    adArapca: "خالد الشارخ",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/khalid-sharekh/r1/", klasor: "khalid-sharekh", sureSayisi: 64 },
    ],
  },
  {
    mp3quranId: 248,
    ad: "Nasser Alosfor",
    adArapca: "ناصر العصفور",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/nasser-asfour/r1/", klasor: "nasser-asfour", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 25,
    ad: "Dawood Hamza",
    adArapca: "داود حمزة",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/dawood-hamza/r1/", klasor: "dawood-hamza", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 250,
    ad: "Mohammad Albukheet",
    adArapca: "محمد البخيت",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/muhammad-bukhait/r1/", klasor: "muhammad-bukhait", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 251,
    ad: "Nasser Almajed",
    adArapca: "ناصر الماجد",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/nasser-majed/r1/", klasor: "nasser-majed", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 252,
    ad: "Ahmed Al-Swailem",
    adArapca: "أحمد السويلم",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/ahmad-suwailem/r1/", klasor: "ahmad-suwailem", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 253,
    ad: "Islam Sobhi",
    adArapca: "إسلام صبحي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/islam-sobhi/r1/", klasor: "islam-sobhi", sureSayisi: 109 },
    ],
  },
  {
    mp3quranId: 254,
    ad: "Bader Alturki",
    adArapca: "بدر التركي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/badr-turki/r1/", klasor: "badr-turki", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 255,
    ad: "Hitham Aljadani",
    adArapca: "هيثم الجدعاني",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/haitham-jadani/r1/", klasor: "haitham-jadani", sureSayisi: 101 },
    ],
  },
  {
    mp3quranId: 256,
    ad: "Ahmad Shaheen",
    adArapca: "أحمد خليل شاهين",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/ahmad-shaheen/r1/", klasor: "ahmad-shaheen", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 257,
    ad: "Saad Almqren",
    adArapca: "سعد المقرن",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/saad-muqrin/r1/", klasor: "saad-muqrin", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 259,
    ad: "Ahmad Al Nufais",
    adArapca: "أحمد النفيس",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/ahmad-nufais/r1/", klasor: "ahmad-nufais", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 26,
    ad: "Rasheed Ifrad",
    adArapca: "رشيد إفراد",
    rivayetler: [
      { ad: "Rewayat Warsh A'n Nafi' - Murattal", sunucu: "https://cdn.mp3quran.net/audio/rachid-ifrad/r1/", klasor: "rachid-ifrad", sureSayisi: 50 },
    ],
  },
  {
    mp3quranId: 260,
    ad: "Omar Al Darweez",
    adArapca: "عمر الدريويز",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/omar-duraiwiz/r1/", klasor: "omar-duraiwiz", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 263,
    ad: "Abdulaziz Alasiri",
    adArapca: "عبدالعزيز العسيري",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/abdulaziz-asiri/r1/", klasor: "abdulaziz-asiri", sureSayisi: 72 },
    ],
  },
  {
    mp3quranId: 264,
    ad: "Younes Souilass",
    adArapca: "يونس اسويلص",
    rivayetler: [
      { ad: "Rewayat Warsh A'n Nafi' - Murattal", sunucu: "https://cdn.mp3quran.net/audio/younes-souilass/r1/", klasor: "younes-souilass", sureSayisi: 65 },
    ],
  },
  {
    mp3quranId: 265,
    ad: "Ahmad Deban",
    adArapca: "أحمد ديبان",
    rivayetler: [
      { ad: "Ibn Jammaz A'n Abi Ja'far - Murattal", sunucu: "https://cdn.mp3quran.net/audio/ahmad-deeban/r13/", klasor: "ahmad-deeban", sureSayisi: 11 },
      { ad: "Hesham A'n Abi A'mer - Murattal", sunucu: "https://cdn.mp3quran.net/audio/ahmad-deeban/r12/", klasor: "ahmad-deeban", sureSayisi: 27 },
      { ad: "Rewayat Khalaf A'n Hamzah - Murattal", sunucu: "https://cdn.mp3quran.net/audio/ahmad-deeban/r11/", klasor: "ahmad-deeban", sureSayisi: 6 },
      { ad: "Rewayat AlDorai A'n Al-Kisa'ai - Murattal", sunucu: "https://cdn.mp3quran.net/audio/ahmad-deeban/r10/", klasor: "ahmad-deeban", sureSayisi: 13 },
      { ad: "Rewayat Assosi A'n Abi Amr - Murattal", sunucu: "https://cdn.mp3quran.net/audio/ahmad-deeban/r9/", klasor: "ahmad-deeban", sureSayisi: 19 },
      { ad: "Ibn Thakwan A'n Ibn Amer - Murattal", sunucu: "https://cdn.mp3quran.net/audio/ahmad-deeban/r8/", klasor: "ahmad-deeban", sureSayisi: 33 },
      { ad: "Rewayat Warsh A'n Nafi' Men Tariq Alazraq - Murattal", sunucu: "https://cdn.mp3quran.net/audio/ahmad-deeban/r7/", klasor: "ahmad-deeban", sureSayisi: 114 },
      { ad: "Rewayat Aldori A'n Abi Amr - Murattal", sunucu: "https://cdn.mp3quran.net/audio/ahmad-deeban/r6/", klasor: "ahmad-deeban", sureSayisi: 114 },
      { ad: "Rewayat Qalon A'n Nafi' - Murattal", sunucu: "https://cdn.mp3quran.net/audio/ahmad-deeban/r5/", klasor: "ahmad-deeban", sureSayisi: 114 },
      { ad: "Rewayat Albizi A'n Ibn Katheer - Murattal", sunucu: "https://cdn.mp3quran.net/audio/ahmad-deeban/r4/", klasor: "ahmad-deeban", sureSayisi: 114 },
      { ad: "Rewayat Qunbol A'n Ibn Katheer - Murattal", sunucu: "https://cdn.mp3quran.net/audio/ahmad-deeban/r3/", klasor: "ahmad-deeban", sureSayisi: 114 },
      { ad: "Sho'bah A'n Asim - Murattal", sunucu: "https://cdn.mp3quran.net/audio/ahmad-deeban/r2/", klasor: "ahmad-deeban", sureSayisi: 114 },
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/ahmad-deeban/r1/", klasor: "ahmad-deeban", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 267,
    ad: "Abdullah Kamel",
    adArapca: "عبدالله كامل",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/abdullah-kamel/r1/", klasor: "abdullah-kamel", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 268,
    ad: "Peshawa Qadr Al-Kurdi",
    adArapca: "بيشه وا قادر الكردي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/peshawa-kurdi/r1/", klasor: "peshawa-kurdi", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 27,
    ad: "Rachid Belalya",
    adArapca: "رشيد بلعالية",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/rachid-belalia/r2/", klasor: "rachid-belalia", sureSayisi: 5 },
      { ad: "Rewayat Warsh A'n Nafi' - Murattal", sunucu: "https://cdn.mp3quran.net/audio/rachid-belalia/r1/", klasor: "rachid-belalia", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 271,
    ad: "Nathier Almalki",
    adArapca: "نذير المالكي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/nadhir-maliki/r1/", klasor: "nadhir-maliki", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 272,
    ad: "Okasha Kameny",
    adArapca: "عكاشة كميني",
    rivayetler: [
      { ad: "Rewayat Albizi A'n Ibn Katheer - Murattal", sunucu: "https://cdn.mp3quran.net/audio/okasha-kameny/r2/", klasor: "okasha-kameny", sureSayisi: 114 },
      { ad: "Rewayat AlDorai A'n Al-Kisa'ai - Murattal", sunucu: "https://cdn.mp3quran.net/audio/okasha-kameny/r1/", klasor: "okasha-kameny", sureSayisi: 38 },
    ],
  },
  {
    mp3quranId: 273,
    ad: "Haitham Aldukhain",
    adArapca: "هيثم الدخين",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Featured Recitation", sunucu: "https://cdn.mp3quran.net/audio/haitham-dukhain/r1/", klasor: "haitham-dukhain", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 274,
    ad: "Muhammad Abu Sneina",
    adArapca: "محمد أبو سنينة",
    rivayetler: [
      { ad: "Rewayat Qalon A'n Nafi' - Murattal", sunucu: "https://cdn.mp3quran.net/audio/muhammad-abusnaina/r1/", klasor: "muhammad-abusnaina", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 275,
    ad: "Mohammed Al-Amin Qeniwa",
    adArapca: "محمد الأمين قنيوة",
    rivayetler: [
      { ad: "Rewayat Qalon A'n Nafi' - Murattal", sunucu: "https://cdn.mp3quran.net/audio/muhammad-qeniwa/r1/", klasor: "muhammad-qeniwa", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 277,
    ad: "Mahmoud Abdul Hakam",
    adArapca: "محمود عبدالحكم",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/mahmoud-abdulhakam/r1/", klasor: "mahmoud-abdulhakam", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 278,
    ad: "Ahmad Issa Al Maasaraawi",
    adArapca: "أحمد عيسى المعصراوي",
    rivayetler: [
      { ad: "Rewayat Rowis and Rawh A'n Yakoob Al Hadrami  - Murattal", sunucu: "https://cdn.mp3quran.net/audio/ahmad-masarawi/r2/", klasor: "ahmad-masarawi", sureSayisi: 64 },
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/ahmad-masarawi/r1/", klasor: "ahmad-masarawi", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 279,
    ad: "Ibrahim Kshidan",
    adArapca: "إبراهيم كشيدان",
    rivayetler: [
      { ad: "Rewayat Qalon A'n Nafi' - Murattal", sunucu: "https://cdn.mp3quran.net/audio/ibrahim-kshidan/r1/", klasor: "ibrahim-kshidan", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 28,
    ad: "Zakaria Hamamah",
    adArapca: "زكريا حمامة",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/zakaria-hamama/r1/", klasor: "zakaria-hamama", sureSayisi: 7 },
    ],
  },
  {
    mp3quranId: 280,
    ad: "Hashim Abu Dalal",
    adArapca: "هاشم أبو دلال",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/hashim-abudalal/r1/", klasor: "hashim-abudalal", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 281,
    ad: "Fouad Alkhamery",
    adArapca: "فؤاد الخامري",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/fouad-khamiri/r1/", klasor: "fouad-khamiri", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 282,
    ad: "Sayed Ahmad Hashemi",
    adArapca: "سيد أحمد هاشمي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/sayed-hashemi/r1/", klasor: "sayed-hashemi", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 283,
    ad: "Khalid Mohammadi",
    adArapca: "خالد كريم محمدي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/khalid-mohammadi/r1/", klasor: "khalid-mohammadi", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 284,
    ad: "Mal-Allah Abdulrhman Aljaber",
    adArapca: "مال الله عبدالرحمن الجابر",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/malallah-jaber/r1/", klasor: "malallah-jaber", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 285,
    ad: "Salman Alsadeiq",
    adArapca: "سلمان الصديق",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/salman-siddiq/r1/", klasor: "salman-siddiq", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 286,
    ad: "Hasan Saleh",
    adArapca: "حسن صالح",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/hassan-saleh/r1/", klasor: "hassan-saleh", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 287,
    ad: "Abdulrahman Alshahhat",
    adArapca: "عبدالرحمن الشحات",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/abdulrahman-shahat/r1/", klasor: "abdulrahman-shahat", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 288,
    ad: "Issa Omar Sanankoua",
    adArapca: "عيسى عمر سناكو",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/issa-sanankoua/r1/", klasor: "issa-sanankoua", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 289,
    ad: "Haroon Baqai",
    adArapca: "هارون بقائي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/haroon-baqai/r1/", klasor: "haroon-baqai", sureSayisi: 51 },
    ],
  },
  {
    mp3quranId: 29,
    ad: "Abdullah Bukhari",
    adArapca: "عبدالله بخاري",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/abdullah-bukhari/r1/", klasor: "abdullah-bukhari", sureSayisi: 79 },
    ],
  },
  {
    mp3quranId: 290,
    ad: "Saleh Alquraishi",
    adArapca: "صالح القريشي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/saleh-quraishi/r1/", klasor: "saleh-quraishi", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 3,
    ad: "Ibrahim Al-Asiri",
    adArapca: "إبراهيم العسيري",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/ibrahim-asiri/r1/", klasor: "ibrahim-asiri", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 300,
    ad: "Saleh Alshamrani",
    adArapca: "صالح الشمراني",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/saleh-shamrani/r1/", klasor: "saleh-shamrani", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 301,
    ad: "Faisal Al-Hajry",
    adArapca: "فيصل الهاجري",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/faisal-hajri/r1/", klasor: "faisal-hajri", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 302,
    ad: "Anas Alemadi",
    adArapca: "أنس العمادي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/anas-emadi/r1/", klasor: "anas-emadi", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 303,
    ad: "Abdulmalik Alaskar",
    adArapca: "عبدالملك العسكر",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/abdulmalik-askar/r1/", klasor: "abdulmalik-askar", sureSayisi: 7 },
    ],
  },
  {
    mp3quranId: 304,
    ad: "Abdulkareem Alhazmi",
    adArapca: "عبدالكريم الحازمي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/abdulkareem-hazmi/r1/", klasor: "abdulkareem-hazmi", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 305,
    ad: "Hicham Lharraz",
    adArapca: "هشام الهراز",
    rivayetler: [
      { ad: "Rewayat Warsh A'n Nafi' - Murattal", sunucu: "https://cdn.mp3quran.net/audio/hicham-lharraz/r1/", klasor: "hicham-lharraz", sureSayisi: 113 },
    ],
  },
  {
    mp3quranId: 306,
    ad: "Abdullah Al-Mishal",
    adArapca: "عبدالله المشعل",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/abdullah-mishal/r1/", klasor: "abdullah-mishal", sureSayisi: 11 },
    ],
  },
  {
    mp3quranId: 307,
    ad: "Abdelaziz sheim",
    adArapca: "عبدالعزيز سحيم",
    rivayetler: [
      { ad: "Rewayat Warsh A'n Nafi' - Murattal", sunucu: "https://cdn.mp3quran.net/audio/abdelaziz-sheim/r1/", klasor: "abdelaziz-sheim", sureSayisi: 16 },
    ],
  },
  {
    mp3quranId: 33,
    ad: "Zaki Daghistani",
    adArapca: "زكي داغستاني",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/zaki-daghistani/r1/", klasor: "zaki-daghistani", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 34,
    ad: "Sami Al-Hasn",
    adArapca: "سامي الحسن",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/sami-hassan/r1/", klasor: "sami-hassan", sureSayisi: 28 },
    ],
  },
  {
    mp3quranId: 35,
    ad: "Sami Al-Dosari",
    adArapca: "سامي الدوسري",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/sami-dosari/r1/", klasor: "sami-dosari", sureSayisi: 53 },
    ],
  },
  {
    mp3quranId: 36,
    ad: "Sayeed Ramadan",
    adArapca: "سيد رمضان",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/sayed-ramadan/r1/", klasor: "sayed-ramadan", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 37,
    ad: "Shaban Al-Sayiaad",
    adArapca: "شعبان الصياد",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/shaban-sayyad/r1/", klasor: "shaban-sayyad", sureSayisi: 65 },
    ],
  },
  {
    mp3quranId: 38,
    ad: "Shirazad Taher",
    adArapca: "شيرزاد عبدالرحمن طاهر",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/shirzad-taher/r1/", klasor: "shirzad-taher", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 39,
    ad: "Saber Abdulhakm",
    adArapca: "صابر عبدالحكم",
    rivayetler: [
      { ad: "قالون عن نافع - بقصر المنفصل مع صلة ميم الجمع - Almusshaf Al Mojawwad", sunucu: "https://cdn.mp3quran.net/audio/saber-abdulhakam/r10/", klasor: "saber-abdulhakam", sureSayisi: 114 },
      { ad: "قالون عن نافع - بالجمع - Almusshaf Al Mojawwad", sunucu: "https://cdn.mp3quran.net/audio/saber-abdulhakam/r9/", klasor: "saber-abdulhakam", sureSayisi: 114 },
      { ad: "برواية الدوري عن أبي عمرو - بالجمع- - Almusshaf Al Mojawwad", sunucu: "https://cdn.mp3quran.net/audio/saber-abdulhakam/r8/", klasor: "saber-abdulhakam", sureSayisi: 114 },
      { ad: "شعبة عن عاصم - Almusshaf Al Mojawwad", sunucu: "https://cdn.mp3quran.net/audio/saber-abdulhakam/r7/", klasor: "saber-abdulhakam", sureSayisi: 114 },
      { ad: "حفص عن عاصم - القصر - Almusshaf Al Mo'lim", sunucu: "https://cdn.mp3quran.net/audio/saber-abdulhakam/r6/", klasor: "saber-abdulhakam", sureSayisi: 114 },
      { ad: "حفص عن عاصم - بالتوسط - Almusshaf Al Mojawwad", sunucu: "https://cdn.mp3quran.net/audio/saber-abdulhakam/r5/", klasor: "saber-abdulhakam", sureSayisi: 114 },
      { ad: "الدوري عن أبي عمرو -التوسط- - Murattal", sunucu: "https://cdn.mp3quran.net/audio/saber-abdulhakam/r4/", klasor: "saber-abdulhakam", sureSayisi: 114 },
      { ad: "قالون عن نافع -بالقصر مع السكون- - Murattal", sunucu: "https://cdn.mp3quran.net/audio/saber-abdulhakam/r3/", klasor: "saber-abdulhakam", sureSayisi: 114 },
      { ad: "حفص عن عاصم - Murattal", sunucu: "https://cdn.mp3quran.net/audio/saber-abdulhakam/r2/", klasor: "saber-abdulhakam", sureSayisi: 114 },
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/saber-abdulhakam/r1/", klasor: "saber-abdulhakam", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 40,
    ad: "Saleh Alsahood",
    adArapca: "صالح الصاهود",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/saleh-sahood/r1/", klasor: "saleh-sahood", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 41,
    ad: "Saleh Al-Talib",
    adArapca: "صالح آل طالب",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/saleh-talib/r1/", klasor: "saleh-talib", sureSayisi: 32 },
    ],
  },
  {
    mp3quranId: 42,
    ad: "Saleh Al-Habdan",
    adArapca: "صالح الهبدان",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/saleh-habdan/r1/", klasor: "saleh-habdan", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 44,
    ad: "Salah Alhashim",
    adArapca: "صلاح الهاشم",
    rivayetler: [
      { ad: "Rewayat Qalon A'n Nafi' - Murattal", sunucu: "https://cdn.mp3quran.net/audio/salah-hashim/r2/", klasor: "salah-hashim", sureSayisi: 7 },
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/salah-hashim/r1/", klasor: "salah-hashim", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 47,
    ad: "Mukhtar Al-Haj",
    adArapca: "مختار الحاج",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/mukhtar-haj/r1/", klasor: "mukhtar-haj", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 48,
    ad: "Adel Ryyan",
    adArapca: "عادل ريان",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/adel-rayyan/r1/", klasor: "adel-rayyan", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 49,
    ad: "Abdelbari Al-Toubayti",
    adArapca: "عبدالبارئ الثبيتي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/abdulbari-thubaiti/r1/", klasor: "abdulbari-thubaiti", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 50,
    ad: "Abdulbari Mohammad",
    adArapca: "عبدالبارئ محمد",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Almusshaf Al Mo'lim", sunucu: "https://cdn.mp3quran.net/audio/abdulbari-muhammad/r2/", klasor: "abdulbari-muhammad", sureSayisi: 91 },
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/abdulbari-muhammad/r1/", klasor: "abdulbari-muhammad", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 55,
    ad: "Abdul Aziz Al-Ahmad",
    adArapca: "عبدالعزيز الأحمد",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/abdulaziz-ahmad/r1/", klasor: "abdulaziz-ahmad", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 56,
    ad: "Abdulaziz Az-Zahrani",
    adArapca: "عبدالعزيز الزهراني",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/abdulaziz-zahrani/r1/", klasor: "abdulaziz-zahrani", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 57,
    ad: "Abdullah Al-Burimi",
    adArapca: "عبدالله البريمي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/abdullah-buraimi/r1/", klasor: "abdullah-buraimi", sureSayisi: 69 },
    ],
  },
  {
    mp3quranId: 58,
    ad: "Abdullah Albuajan",
    adArapca: "عبدالله البعيجان",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/abdullah-buaijan/r1/", klasor: "abdullah-buaijan", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 6,
    ad: "Ahmad Al-Hawashi",
    adArapca: "أحمد الحواشي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/ahmad-hawashi/r1/", klasor: "ahmad-hawashi", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 61,
    ad: "Abdullah Khayyat",
    adArapca: "عبدالله خياط",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/abdullah-khayyat/r1/", klasor: "abdullah-khayyat", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 63,
    ad: "Abdullah Qaulan",
    adArapca: "عبدالله غيلان",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/abdullah-ghailan/r1/", klasor: "abdullah-ghailan", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 64,
    ad: "Abdulrasheed Soufi",
    adArapca: "عبدالرشيد صوفي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/abdulrasheed-sufi/r3/", klasor: "abdulrasheed-sufi", sureSayisi: 114 },
      { ad: "Rewayat Assosi A'n Abi Amr - Murattal", sunucu: "https://cdn.mp3quran.net/audio/abdulrasheed-sufi/r2/", klasor: "abdulrasheed-sufi", sureSayisi: 114 },
      { ad: "Rewayat Khalaf A'n Hamzah - Murattal", sunucu: "https://cdn.mp3quran.net/audio/abdulrasheed-sufi/r1/", klasor: "abdulrasheed-sufi", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 66,
    ad: "Abdulmohsin Al-Harthy",
    adArapca: "عبدالمحسن الحارثي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/abdulmohsen-harthi/r1/", klasor: "abdulmohsen-harthi", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 68,
    ad: "Abdulmohsin Al-Askar",
    adArapca: "عبدالمحسن العسكر",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/abdulmohsen-askar/r1/", klasor: "abdulmohsen-askar", sureSayisi: 4 },
    ],
  },
  {
    mp3quranId: 69,
    ad: "Abdulmohsin Al-Obaikan",
    adArapca: "عبدالمحسن العبيكان",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/abdulmohsen-obaikan/r1/", klasor: "abdulmohsen-obaikan", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 7,
    ad: "Ahmad Saud",
    adArapca: "أحمد سعود",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/ahmad-saud/r1/", klasor: "ahmad-saud", sureSayisi: 30 },
    ],
  },
  {
    mp3quranId: 70,
    ad: "Abdulhadi Kanakeri",
    adArapca: "عبدالهادي أحمد كناكري",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/abdulhadi-kanakeri/r1/", klasor: "abdulhadi-kanakeri", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 71,
    ad: "Abdulwadood Haneef",
    adArapca: "عبدالودود حنيف",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/abdulwadood-haneef/r1/", klasor: "abdulwadood-haneef", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 72,
    ad: "Abdulwali Al-Arkani",
    adArapca: "عبدالولي الأركاني",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/abdulwali-arkani/r1/", klasor: "abdulwali-arkani", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 73,
    ad: "Ali Abo-Hashim",
    adArapca: "علي أبو هاشم",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/ali-abuhashim/r1/", klasor: "ali-abuhashim", sureSayisi: 14 },
    ],
  },
  {
    mp3quranId: 77,
    ad: "Ali Hajjaj Alsouasi",
    adArapca: "علي حجاج السويسي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/ali-souissi/r1/", klasor: "ali-souissi", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 78,
    ad: "Emad Hafez",
    adArapca: "عماد زهير حافظ",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/imad-hafez/r1/", klasor: "imad-hafez", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 79,
    ad: "Abdulaziz Alturki",
    adArapca: "عبدالعزيز التركي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/abdulaziz-turki/r1/", klasor: "abdulaziz-turki", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 8,
    ad: "Ahmad Saber",
    adArapca: "أحمد صابر",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/ahmad-saber/r1/", klasor: "ahmad-saber", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 80,
    ad: "Omar Al-Qazabri",
    adArapca: "عمر القزابري",
    rivayetler: [
      { ad: "Rewayat Warsh A'n Nafi' - Murattal", sunucu: "https://cdn.mp3quran.net/audio/omar-kazabri/r1/", klasor: "omar-kazabri", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 82,
    ad: "Fahad Al-Otaibi",
    adArapca: "فهد العتيبي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/fahad-otaibi/r1/", klasor: "fahad-otaibi", sureSayisi: 8 },
    ],
  },
  {
    mp3quranId: 83,
    ad: "Fahad Al-Kandari",
    adArapca: "فهد الكندري",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/fahad-kandari/r1/", klasor: "fahad-kandari", sureSayisi: 77 },
    ],
  },
  {
    mp3quranId: 84,
    ad: "Fawaz Alkabi",
    adArapca: "فواز الكعبي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/fawaz-kaabi/r1/", klasor: "fawaz-kaabi", sureSayisi: 49 },
    ],
  },
  {
    mp3quranId: 85,
    ad: "Lafi Al-Oni",
    adArapca: "لافي العوني",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/lafi-oni/r1/", klasor: "lafi-oni", sureSayisi: 84 },
    ],
  },
  {
    mp3quranId: 87,
    ad: "Nabil Al Rifay",
    adArapca: "نبيل الرفاعي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/nabil-rifai/r1/", klasor: "nabil-rifai", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 88,
    ad: "Neamah Al-Hassan",
    adArapca: "نعمة الحسان",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/neama-hassan/r1/", klasor: "neama-hassan", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 90,
    ad: "Walid Al-Dulaimi",
    adArapca: "وليد الدليمي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/waleed-dulaimi/r1/", klasor: "waleed-dulaimi", sureSayisi: 58 },
    ],
  },
  {
    mp3quranId: 91,
    ad: "Waleed Alnaehi",
    adArapca: "وليد النائحي",
    rivayetler: [
      { ad: "Rewayat Qalon A'n Nafi' Men Tariq Abi Nasheet - Murattal", sunucu: "https://cdn.mp3quran.net/audio/waleed-naehi/r1/", klasor: "waleed-naehi", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 93,
    ad: "Yasser Al-Qurashi",
    adArapca: "ياسر القرشي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/yasser-qurashi/r1/", klasor: "yasser-qurashi", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 94,
    ad: "Yasser Al-Faylakawi",
    adArapca: "ياسر الفيلكاوي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/yasser-faylakawi/r1/", klasor: "yasser-faylakawi", sureSayisi: 87 },
    ],
  },
  {
    mp3quranId: 95,
    ad: "Yasser Al-Mazroyee",
    adArapca: "ياسر المزروعي ",
    rivayetler: [
      { ad: "Rewayat Rowis and Rawh A'n Yakoob Al Hadrami  - Murattal", sunucu: "https://cdn.mp3quran.net/audio/yasser-mazrouei/r1/", klasor: "yasser-mazrouei", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 96,
    ad: "Yahya Hawwa",
    adArapca: "يحيى حوا",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/yahya-hawwa/r1/", klasor: "yahya-hawwa", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 97,
    ad: "Yousef Alshoaey",
    adArapca: "يوسف الشويعي",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/yousef-shoaey/r1/", klasor: "yousef-shoaey", sureSayisi: 114 },
    ],
  },
  {
    mp3quranId: 98,
    ad: "Abdullah Abdal",
    adArapca: "عبدالله عبدل",
    rivayetler: [
      { ad: "Rewayat Hafs A'n Assem - Murattal", sunucu: "https://cdn.mp3quran.net/audio/abdullah-abdal/r1/", klasor: "abdullah-abdal", sureSayisi: 114 },
    ],
  },
];
