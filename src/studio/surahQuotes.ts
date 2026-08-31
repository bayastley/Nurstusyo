/** Sure numarasına göre dinamik quote — seçili sure ile alakalı */

const SURAH_QUOTES: Record<number, string[]> = {
  1: [
    "\u201CHamd, alemlerin Rabbi Allah\u2019a mahsustur.\u201D (F\u00e2tiha 1:2)",
    "\u201CRahman ve Rahim olan Allah\u2019a hamdolsun.\u201D (F\u00e2tiha 1:3)",
  ],
  2: [
    "\u201CEy iman edenler! Allah\u2019a kar\u015f\u0131 gelmekten sak\u0131n\u0131n.\u201D (Bakara 2:21)",
    "\u201CBu, a\u00e7\u0131\u00e7 kitapt\u0131r.\u201D (Bakara 2:2)",
    "\u201CAllah\u2019a ve Resul\u00fcne iman edin.\u201D (Bakara 2:285)",
  ],
  3: [
    "\u201CRahman ve Rahim olan Allah\u2019a iman edin.\u201D (\u00c2l-i \u0130mr\u00e2n 3:2)",
    "\u201C\u015e\u00fcphesiz Allah\u2019\u0131n kat\u0131nda d\u00fcn \u0130sl\u00e2m\u2019d\u0131r.\u201D (\u00c2l-i \u0130mr\u00e2n 3:19)",
  ],
  4: [
    "\u201CEy insanlar! Sizi bir canl\u0131dan yaratt\u0131k.\u201D (Nis\u00e2 4:1)",
  ],
  5: [
    "\u201CBug\u00fcn sizin i\u00e7in dininizi kemale erdirdim.\u201D (M\u00e2ide 5:3)",
  ],
  6: [
    "\u201CG\u00f6kleri ve yeri yaratan Allah\u2019t\u0131r.\u201D (En\u2019\u00e2m 6:1)",
    "\u201CYery\u00fcz\u00fcnde gezip de kendi kavimlerinden \u00f6ncekilerin akibetlerine baks\u0131nlar.\u201D (En\u2019\u00e2m 6:11)",
  ],
  8: [
    "\u201CAllah\u2019a ve Resul\u00fcne itaat edin.\u201D (Enf\u00e2l 8:1)",
  ],
  9: [
    "\u201CAllah\u2019a ve Resul\u00fcne sadakat g\u00f6sterin.\u201D (Tevbe 9:111)",
  ],
  11: [
    "\u201CSabret! \u00c7\u00fcnk\u00fc Allah, g\u00fczel davrananlar\u0131n m\u00fckafat\u0131n\u0131 zayi etmez.\u201D (H\u00fayd 11:115)",
    "\u201CKim Allah\u2019tan korkarsa, Allah ona bir \u00e7\u0131k\u0131\u015f yolu a\u00e7ar.\u201D (H\u00fayd 11:56)",
  ],
  13: [
    "\u201CAllah, her \u015feyi bir \u00f6l\u00e7\u00fcye g\u00f6re yaratm\u0131\u015ft\u0131r.\u201D (Ra\u2019d 13:8)",
  ],
  16: [
    "\u201C\u015e\u00fcphesiz Allah, adaleti, iyilik ve akrabaya bakmay\u0131 emreder.\u201D (Nahl 16:90)",
  ],
  17: [
    "\u201CHakk\u0131nda bilgi sahibi olmad\u0131\u011f\u0131n \u015feyin ard\u0131na d\u00fc\u015fme. \u00c7\u00fcnk\u00fc kulak, g\u00f6z ve kalp, bunlar\u0131n hepisi ondan sorumludur.\u201D (Isr\u00e2 17:36)",
    "\u201CKur\u2019an, m\u00fc\u2019minler i\u00e7in \u015fifa ve rahmettir.\u201D (Isr\u00e2 17:82)",
  ],
  18: [
    "\u201CDe ki: G\u00f6r\u00fc\u015f, Allah\u2019and\u0131r. O halde diledi\u011finize uyun.\u201D (Kehf 18:29)",
  ],
  19: [
    "\u201CKur\u2019an okuyan kimseye cennetteki Ref\u00eek derler.\u201D (Meryem 19:2)",
  ],
  20: [
    "\u201CRabbim, ilmimi art\u0131r.\u201D (T\u00e2h\u00e2 20:114)",
  ],
  24: [
    "\u201CAllah\u2019\u0131n n\u00faru her \u015feyi ayd\u0131nlat\u0131r.\u201D (N\u00fbr 24:35)",
    "\u201CM\u00fc\u2019min erkeklerle m\u00fc\u2019min kad\u0131nlar birbirlerinin dostudur.\u201D (N\u00fbr 24:22)",
  ],
  25: [
    "\u201CKur\u2019an, sana vaholunand\u0131r; onu okumak sana farz k\u0131l\u0131nm\u0131\u015ft\u0131r.\u201D (Furk\u00e2n 25:73)",
  ],
  26: [
    "\u201C\u015e\u00fcur sahibi bir topluluk i\u00e7in nice deliller vard\u0131r.\u201D (\u015euar\u00e2 26:8)",
  ],
  29: [
    "\u201C\u0130nsanlar, imtihan edilmeksizin b\u0131rak\u0131laca\u011f\u0131n\u0131 m\u0131 san\u0131yor?\u201D (Ankebut 29:2)",
  ],
  31: [
    "\u201CKur\u2019an, bir hidayet ve rahmettir.\u201D (Lokm\u00e2n 31:2)",
  ],
  33: [
    "\u201CPeygamber, m\u00fc\u2019minlere kendi canlar\u0131ndan daha yak\u0131nd\u0131r.\u201D (Ahz\u00e2b 33:6)",
  ],
  36: [
    "\u201CY\u00e2s\u00een Suresi kalplere \u015fifa olan ayetlerdir.\u201D (Y\u00e2s\u00een 36:1)",
    "\u201CKur\u2019an\u2019\u0131n kalbi Y\u00e2s\u00een Suresi\u2019dir.\u201D (Y\u00e2s\u00een 36:58)",
  ],
  39: [
    "\u201CKim sabrederse, Allah ona limitsiz bir m\u00fckafat verir.\u201D (Z\u00fcm\u00ebr 39:10)",
  ],
  48: [
    "\u201CM\u00fc\u2019minler, birbirlerine merhamet ve \u015fefkat g\u00f6sterirler.\u201D (Fetih 48:29)",
  ],
  51: [
    "\u201C\u0130nsan, Rabbi i\u00e7in yarat\u0131lm\u0131\u015ft\u0131r.\u201D (Z\u00e2riy\u00e2t 51:56)",
  ],
  55: [
    "\u201CRahm\u00e2n\u2019\u0131 oku! \u0130nsan\u0131 yaratt\u0131.\u201D (Rahm\u00e2n 55:1-3)",
    "\u201CHangi nimetinizi yalanlars\u0131n\u0131z?\u201D (Rahm\u00e2n 55:13)",
  ],
  56: [
    "\u201CKorku ve \u00fcmit, onun parmaklar\u0131 alt\u0131ndad\u0131r.\u201D (V\u00e2k\u0131a 56:10)",
  ],
  62: [
    "\u201CCuma namaz\u0131na \u00e7a\u011f\u0131r\u0131ld\u0131\u011f\u0131n\u0131zda gidin, zikri b\u0131rak\u0131n.\u201D (Cuma 62:9)",
  ],
  65: [
    "\u201CKim Allah\u2019tan korkarsa, Allah ona bir \u00e7\u0131k\u0131\u015f yolu a\u00e7ar.\u201D (Tal\u00e2k 65:2)",
  ],
  67: [
    "\u201CM\u00fcl\u00fck, Allah\u2019\u0131nd\u0131r.\u201D (M\u00fcl\u00fck 67:1)",
    "\u201CGece uyumadan \u00f6nce M\u00fcl\u00fck Suresi\u2019nden huzur veren ayetler.\u201D (M\u00fcl\u00fck 67:30)",
  ],
  73: [
    "\u201CEy \u00f6rt\u00fcs\u00fcne b\u00fcr\u00fcnen! Gece namaz\u0131n\u0131 kalk k\u0131l.\u201D (M\u00fcddebbir 73:1-2)",
  ],
  78: [
    "\u201CNe hakkinda tart\u0131\u015f\u0131yorlar?\u201D (Neba 78:1)",
  ],
  87: [
    "\u201CEn y\u00fcce Rabbin ad\u0131n\u0131 an.\u201D (A\u2019lâ 87:1)",
  ],
  93: [
    "\u201CRabbin seni terk etmedi, sana dar\u0131lmad\u0131.\u201D (Duha 93:3)",
  ],
  94: [
    "\u201CBiz sana kolayl\u0131k vermedik mi?\u201D (\u0130n\u015f\u00e2r\u00e2h 94:5-6)",
  ],
  95: [
    "\u201C\u0130ncir ve zeytine yemin ederim.\u201D (T\u00een 95:1-2)",
  ],
  97: [
    "\u201CKadir gecesi bin aydan hay\u0131rl\u0131d\u0131r.\u201D (Kadir 97:3)",
  ],
  103: [
    "\u201CAsr\u2019a yemin ederim ki insan h\u00fcsrandad\u0131r.\u201D (Asr 103:1-2)",
  ],
  108: [
    "\u201CBiz sana en g\u00fczelini veriyoruz.\u201D (Kevser 108:1)",
  ],
  109: [
    "\u201CK\u00e2firler Allah\u2019\u0131 b\u0131rak\u0131p putlara tap\u0131yorlar.\u201D (K\u00e2fir\u00fbn 109:3)",
  ],
  110: [
    "\u201CAllah\u2019\u0131n dini tamamland\u0131.\u201D (Nasr 110:1-2)",
  ],
  112: [
    "\u201CDe ki: O, Allah birdir. Allah Samed\u2019dir. O, do\u011furmu\u015fm\u0131\u015f ve do\u011fmu\u015fm\u0131\u015ft\u0131r.\u201D (Ikhlas 112:1-4)",
  ],
  113: [
    "\u201CSabah\u0131n Rabbi\u2019ne s\u0131\u011f\u0131n\u0131r\u0131m.\u201D (Felak 113:1)",
  ],
  114: [
    "\u201C\u0130nsanlar\u0131n Rabb\u2019ine s\u0131\u011f\u0131n\u0131r\u0131m.\u201D (Nas 114:1)",
  ],
};

/** Seçili sureye göre quote döndür — havuzda yoksa genel format */
export function getQuoteForSurah(surahName: string, s: number, a: number): string {
  const pool = SURAH_QUOTES[s];
  if (pool && pool.length > 0) {
    return pool[Math.floor(Math.random() * pool.length)];
  }
  return `${surahName} Suresi ${s}:${a} ayet-i kerîme — Allah'ın kelamı kalplere şifa, ruhlara rahmettir. (${surahName} ${s}:${a})`;
}
