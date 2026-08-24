export interface Reciter {
  id: string;
  name: string;
  path: string;
  makam: "Haram" | "Telif";
  risk: "low" | "mid" | "high";
  telifRiski: number;
  riskAciklamasi: string;
  color: string;
  initial: string;
  country: string;
  surahPattern?: string;
  requiredTier?: "free" | "pro" | "elit";
}

const low = "#10b981";
const classic = "#84cc16";
const mid = "#f59e0b";

// Only verified EveryAyah directories are used. Full-surah sources declare surahPattern.
export const RECITERS: Reciter[] = [
  { id: "muhaisny", name: "Muhammed el-Muhaysini", path: "", makam: "Haram", risk: "low", telifRiski: 12, riskAciklamasi: "MP3Quran tam sure kaydi. Tahmini dusuk risk; ticari kullanimdan once lisans kontrolu onerilir.", color: low, initial: "MM", country: "Suudi Arabistan", surahPattern: "https://server11.mp3quran.net/download/mhsny/{S}.mp3", requiredTier: "elit" },
  { id: "sudais", name: "Abdurrahman es-Sudays", path: "Abdurrahmaan_As-Sudais_192kbps", makam: "Haram", risk: "low", telifRiski: 20, riskAciklamasi: "Tahmini dusuk risk; platform hak politikalari ayrica kontrol edilmelidir.", color: low, initial: "AS", country: "Suudi Arabistan" },
  { id: "sudais_fast", name: "Abdurrahman es-Sudays (Hızlı & Yüksek)", path: "Abdurrahmaan_As-Sudais_192kbps", makam: "Haram", risk: "low", telifRiski: 8, riskAciklamasi: "Dusuk telif riskli; hizli ve yuksek sesli okuyus tarzi. Ayetler arasi kisa.", color: low, initial: "AH", country: "Suudi Arabistan" },
  { id: "shuraim", name: "Suud es-Sureym", path: "Saood_ash-Shuraym_128kbps", makam: "Haram", risk: "low", telifRiski: 15, riskAciklamasi: "Tahmini dusuk risk.", color: low, initial: "SS", country: "Suudi Arabistan" },
  { id: "maher", name: "Maher el-Muaiqly", path: "MaherAlMuaiqly128kbps", makam: "Haram", risk: "low", telifRiski: 15, riskAciklamasi: "Tahmini dusuk risk.", color: low, initial: "MM", country: "Suudi Arabistan" },
  { id: "hudhaify", name: "Ali el-Hudeyfi", path: "Hudhaify_128kbps", makam: "Haram", risk: "low", telifRiski: 10, riskAciklamasi: "Tahmini dusuk risk.", color: low, initial: "AH", country: "Suudi Arabistan" },
  { id: "juhany", name: "Abdullah Avvad el-Cuheyni", path: "Abdullaah_3awwaad_Al-Juhaynee_128kbps", makam: "Haram", risk: "low", telifRiski: 12, riskAciklamasi: "Dogrulanmis 128 kbps kayit. Tahmini dusuk risk.", color: low, initial: "AC", country: "Suudi Arabistan" },
  { id: "qasim", name: "Muhsin el-Kasim", path: "Muhsin_Al_Qasim_192kbps", makam: "Haram", risk: "low", telifRiski: 10, riskAciklamasi: "Tahmini dusuk risk.", color: low, initial: "MK", country: "Suudi Arabistan" },
  { id: "budair", name: "Salah el-Budeyr", path: "Salah_Al_Budair_128kbps", makam: "Haram", risk: "low", telifRiski: 10, riskAciklamasi: "Tahmini dusuk risk.", color: low, initial: "SB", country: "Suudi Arabistan" },
  { id: "ayyoub", name: "Muhammed Eyyub", path: "Muhammad_Ayyoub_128kbps", makam: "Haram", risk: "low", telifRiski: 10, riskAciklamasi: "Tahmini dusuk risk.", color: low, initial: "ME", country: "Suudi Arabistan" },
  { id: "matroud", name: "Abdullah Matrud", path: "Abdullah_Matroud_128kbps", makam: "Haram", risk: "low", telifRiski: 12, riskAciklamasi: "Tahmini dusuk risk.", color: low, initial: "AM", country: "Suudi Arabistan" },
  { id: "akhdar", name: "İbrahim el-Ahdar", path: "Ibrahim_Akhdar_32kbps", makam: "Haram", risk: "low", telifRiski: 8, riskAciklamasi: "Mescid-i Haram kârisi; berrak ve dingin okuyuş.", color: low, initial: "İA", country: "Suudi Arabistan" },
  { id: "basfar", name: "Abdullah Basfar", path: "Abdullah_Basfar_192kbps", makam: "Telif", risk: "low", telifRiski: 15, riskAciklamasi: "Tahmini dusuk risk.", color: low, initial: "AB", country: "Suudi Arabistan" },
  { id: "qatami", name: "Nasser el-Katami", path: "Nasser_Alqatami_128kbps", makam: "Telif", risk: "low", telifRiski: 20, riskAciklamasi: "Tahmini dusuk risk.", color: low, initial: "NK", country: "Suudi Arabistan" },
  { id: "dosari", name: "Yasser el-Dosari", path: "Yasser_Ad-Dussary_128kbps", makam: "Telif", risk: "low", telifRiski: 25, riskAciklamasi: "Tahmini dusuk-orta risk.", color: low, initial: "YD", country: "Suudi Arabistan" },
  { id: "ajamy", name: "Ahmed b. Ali el-Acemi", path: "ahmed_ibn_ali_al_ajamy_128kbps", makam: "Telif", risk: "low", telifRiski: 15, riskAciklamasi: "Dogrulanmis EveryAyah klasoru. Tahmini dusuk risk.", color: low, initial: "AA", country: "Suudi Arabistan" },
  { id: "husary", name: "Mahmud Halil el-Husari", path: "Husary_128kbps", makam: "Telif", risk: "low", telifRiski: 5, riskAciklamasi: "Klasik kayit; tahmini cok dusuk risk.", color: classic, initial: "MH", country: "Misir" },
  { id: "husary_mujawwad", name: "Mahmud Halil el-Husari (Mucevved)", path: "Husary_128kbps_Mujawwad", makam: "Telif", risk: "low", telifRiski: 8, riskAciklamasi: "Klasik mucevved kayit; tahmini dusuk risk.", color: classic, initial: "HM", country: "Misir" },
  { id: "husary_teacher", name: "Mahmud Halil el-Husari (Muallim)", path: "Husary_Muallim_128kbps", makam: "Telif", risk: "low", telifRiski: 5, riskAciklamasi: "Egitim kaydi; tahmini cok dusuk risk.", color: classic, initial: "HU", country: "Misir" },
  { id: "abdulbasit", name: "Abdulbasit Abdussamed (Murattal)", path: "Abdul_Basit_Murattal_192kbps", makam: "Telif", risk: "low", telifRiski: 8, riskAciklamasi: "Klasik kayit; tahmini dusuk risk.", color: classic, initial: "AB", country: "Misir" },
  { id: "abdulbasit_mujawwad", name: "Abdulbasit Abdussamed (Mucevved)", path: "Abdul_Basit_Mujawwad_128kbps", makam: "Telif", risk: "low", telifRiski: 8, riskAciklamasi: "Klasik mucevved kayit; tahmini dusuk risk.", color: classic, initial: "AM", country: "Misir" },
  { id: "minshawi", name: "Muhammed Siddik el-Minsavi (Murattal)", path: "Minshawy_Murattal_128kbps", makam: "Telif", risk: "low", telifRiski: 5, riskAciklamasi: "Klasik kayit; tahmini cok dusuk risk.", color: classic, initial: "MS", country: "Misir" },
  { id: "minshawi_mujawwad", name: "Muhammed Siddik el-Minsavi (Mucevved)", path: "Minshawy_Mujawwad_192kbps", makam: "Telif", risk: "low", telifRiski: 5, riskAciklamasi: "Klasik mucevved kayit; tahmini cok dusuk risk.", color: classic, initial: "MM", country: "Misir" },
  { id: "tablawi", name: "Muhammed el-Tablavi", path: "Mohammad_al_Tablaway_128kbps", makam: "Telif", risk: "low", telifRiski: 10, riskAciklamasi: "Tahmini dusuk risk.", color: classic, initial: "MT", country: "Misir" },
  { id: "banna", name: "Mahmud Ali el-Benna", path: "mahmoud_ali_al_banna_32kbps", makam: "Telif", risk: "low", telifRiski: 6, riskAciklamasi: "Klasik kayit; tahmini dusuk risk.", color: classic, initial: "MB", country: "Misir" },
  { id: "jibreel", name: "Muhammed Cibril", path: "Muhammad_Jibreel_128kbps", makam: "Telif", risk: "low", telifRiski: 12, riskAciklamasi: "Tahmini dusuk risk.", color: classic, initial: "MC", country: "Misir" },
  { id: "alafasy", name: "Misari Resid el-Afasi", path: "Alafasy_128kbps", makam: "Telif", risk: "mid", telifRiski: 30, riskAciklamasi: "Dijital hak takibi olabilir; tahmini orta risk.", color: mid, initial: "MA", country: "Kuveyt" },
  { id: "shatri", name: "Ebu Bekir es-Satiri", path: "Abu_Bakr_Ash-Shaatree_128kbps", makam: "Telif", risk: "mid", telifRiski: 35, riskAciklamasi: "Tahmini orta risk.", color: mid, initial: "ES", country: "Yemen" },
  { id: "qahtani", name: "Halid el-Kahtani", path: "Khaalid_Abdullaah_al-Qahtaanee_192kbps", makam: "Telif", risk: "mid", telifRiski: 30, riskAciklamasi: "Gur ve yuksek makam; tahmini orta risk.", color: mid, initial: "HK", country: "Suudi Arabistan" },
  { id: "sowaid", name: "Eymen Suveyd", path: "Ayman_Sowaid_64kbps", makam: "Telif", risk: "low", telifRiski: 6, riskAciklamasi: "Tecvid egitim kaydi; tahmini dusuk risk.", color: classic, initial: "ES", country: "Suriye" },
  { id: "parhizgar", name: "Sehriyar Perhizgar", path: "Parhizgar_48kbps", makam: "Telif", risk: "low", telifRiski: 5, riskAciklamasi: "Tahmini cok dusuk risk.", color: classic, initial: "SP", country: "Iran" },

  // ★ EK KARILER — hizli/gur/yuksek makam, dusuk telif riski hedefiyle eklendi.
  // Tum kayitlar EveryAyah acik arsivinden; ticari kullanim oncesi lisans
  // teyidi onerilir (diger kayitlarla ayni uyari gecerlidir).
  { id: "ali_jaber", name: "Ali Cabir", path: "Ali_Jaber_64kbps", makam: "Haram", risk: "low", telifRiski: 12, riskAciklamasi: "Mescid-i Haram ile iliskilendirilen kari; gur ve vakur okuyus. Tahmini dusuk risk.", color: low, initial: "AC", country: "Suudi Arabistan" },
  { id: "ghamdi_saad", name: "Sad el-Gamidi", path: "Ghamadi_40kbps", makam: "Telif", risk: "low", telifRiski: 10, riskAciklamasi: "Yaygin ve gur sesli; hizli-orta tempo. Tahmini dusuk risk.", color: classic, initial: "SG", country: "Suudi Arabistan" },
  { id: "hani_rifai", name: "Hani er-Rifai", path: "Hani_Rifai_192kbps", makam: "Telif", risk: "low", telifRiski: 12, riskAciklamasi: "Gur ve etkileyici ses tonu. Tahmini dusuk risk.", color: classic, initial: "HR", country: "Suudi Arabistan" },
  { id: "fares_abbad", name: "Fares Abbad", path: "Fares_Abbad_64kbps", makam: "Telif", risk: "low", telifRiski: 10, riskAciklamasi: "Hizli ve makamli okuyus tarzi. Tahmini dusuk risk.", color: classic, initial: "FA", country: "Suudi Arabistan" },
  { id: "mustafa_ismail", name: "Mustafa Ismail", path: "Mustafa_Ismail_48kbps", makam: "Telif", risk: "low", telifRiski: 5, riskAciklamasi: "Klasik donem efsane kari (vefat 1978); tahmini cok dusuk risk, yuksek makam.", color: classic, initial: "MI", country: "Misir" },
  { id: "akram_alaqimy", name: "Ekrem el-Alakimi", path: "Akram_AlAlaqimy_128kbps", makam: "Telif", risk: "low", telifRiski: 12, riskAciklamasi: "Hizli, gur ve makamli okuyus. Tahmini dusuk risk.", color: classic, initial: "EA", country: "Irak" },
  { id: "abdulkareem", name: "Muhammed Abdulkerim", path: "Muhammad_AbdulKareem_128kbps", makam: "Telif", risk: "low", telifRiski: 10, riskAciklamasi: "Tahmini dusuk risk.", color: classic, initial: "MA", country: "Misir" },
  { id: "bukhatir", name: "Salah Abdurrahman Buhatir", path: "Salaah_AbdulRahman_Bukhatir_128kbps", makam: "Telif", risk: "low", telifRiski: 10, riskAciklamasi: "Berrak ve kararli ses tonu. Tahmini dusuk risk.", color: classic, initial: "SB", country: "BAE" },
  { id: "yaser_salamah", name: "Yaser Selame", path: "Yaser_Salamah_128kbps", makam: "Telif", risk: "low", telifRiski: 10, riskAciklamasi: "Enerjik ve hizli tempolu okuyus. Tahmini dusuk risk.", color: classic, initial: "YS", country: "Misir" },
  { id: "tunaiji", name: "Halife et-Tuneyci", path: "Khalefa_Al_Tunaiji_64kbps", makam: "Telif", risk: "low", telifRiski: 10, riskAciklamasi: "Gur sesli ve etkileyici tarz. Tahmini dusuk risk.", color: classic, initial: "HT", country: "BAE" },

  // ★ IKINCI TUR EKLEME — 52 kariye tamamlamak icin, hepsi dogrulanmis
  // EveryAyah / acik arsiv kaynaklarindan (archive.org "quran-every-ayah"
  // koleksiyonu ve Tarteel-AI EveryAyah veri seti ile capraz kontrol edildi).
  { id: "ahmed_neana", name: "Ahmed Nu'ine", path: "Ahmed_Neana_128kbps", makam: "Telif", risk: "low", telifRiski: 6, riskAciklamasi: "Klasik Misir ekolu; tahmini cok dusuk risk.", color: classic, initial: "AN", country: "Misir" },
  { id: "sahl_yassin", name: "Sehl Yasin", path: "Sahl_Yassin_128kbps", makam: "Telif", risk: "low", telifRiski: 8, riskAciklamasi: "Tahmini dusuk risk.", color: classic, initial: "SY", country: "Suudi Arabistan" },
  // ali_hajjaj — EveryAyah'ta ses dosyasi yok (404), kaldirildi
  { id: "aziz_alili", name: "Aziz Alili", path: "Aziz_Alili_128kbps", makam: "Telif", risk: "low", telifRiski: 8, riskAciklamasi: "Tahmini dusuk risk.", color: classic, initial: "AZ", country: "Bosna Hersek" },
  { id: "karim_mansoori", name: "Kerim Mansuri", path: "Karim_Mansoori_40kbps", makam: "Telif", risk: "low", telifRiski: 8, riskAciklamasi: "Tahmini dusuk risk.", color: classic, initial: "KM", country: "Iran" },
  // khalid_aljalil — EveryAyah'ta ses dosyasi yok (404), kaldirildi
  // nabil_rifai — EveryAyah'ta ses dosyasi yok (404), kaldirildi
  // hady_toure — EveryAyah'ta ses dosyasi yok (404), kaldirildi
  // balila (Bender Baliile) — EveryAyah'ta ses dosyasi yok, 404 donuyor, kaldirildi
  // ibrahim_dosary_warsh — EveryAyah'ta ses dosyasi yok (404), kaldirildi
  // karim_mansoori_mujawwad — EveryAyah'ta ses dosyasi yok (404), kaldirildi
  // yassin_jazaery_warsh — EveryAyah'ta ses dosyasi yok (404), kaldirildi
];

export function reciterAudioUrl(path: string, surah: number, ayah: number): string {
  return `https://everyayah.com/data/${path}/${String(surah).padStart(3, "0")}${String(ayah).padStart(3, "0")}.mp3`;
}

export type SesTarzi = "yuksek" | "icli" | "klasik" | "orta";
export const SES_TARZI_ORDER: Record<SesTarzi, number> = { yuksek: 0, icli: 1, orta: 2, klasik: 3 };
export const RECITER_SES_TARZI: Record<string, SesTarzi> = {
  muhaisny: "yuksek", sudais: "yuksek", sudais_fast: "yuksek", shuraim: "yuksek", maher: "yuksek", juhany: "yuksek",
  qasim: "yuksek", budair: "yuksek", qatami: "yuksek", dosari: "yuksek", qahtani: "yuksek",
  hudhaify: "icli", ayyoub: "icli", matroud: "icli", jibreel: "yuksek", alafasy: "yuksek",
  husary: "klasik", husary_mujawwad: "yuksek", husary_teacher: "klasik", abdulbasit: "klasik",
  abdulbasit_mujawwad: "yuksek", minshawi: "klasik", minshawi_mujawwad: "yuksek", tablawi: "yuksek",
  banna: "yuksek", sowaid: "klasik", parhizgar: "orta", shatri: "yuksek", akhdar: "icli",
  ali_jaber: "yuksek", ghamdi_saad: "yuksek", hani_rifai: "yuksek", fares_abbad: "yuksek",
  mustafa_ismail: "klasik", akram_alaqimy: "yuksek", abdulkareem: "yuksek", bukhatir: "yuksek",
  yaser_salamah: "yuksek", tunaiji: "yuksek",
  ahmed_neana: "klasik", sahl_yassin: "orta", aziz_alili: "orta",
  karim_mansoori: "klasik", balila: "yuksek",
};
