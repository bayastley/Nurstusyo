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

export const RECITERS: Reciter[] = [
  { id: "alfaqih", name: "Muhammed el-Fakîh", path: "Muhammad_Al-Faqih_128kbps", makam: "Telif", risk: "low", telifRiski: 18, riskAciklamasi: "Yemenli kâri · Hafs an Âsım · mütevazı ve duygulu okuyuş. Tam sure kaydı mp3quran üzerinden, serbest dinleme kapsamında; düşük telif riski.", color: "#10b981", initial: "MF", country: "Yemen", surahPattern: "https://server16.mp3quran.net/M_Alfaqih/Rewayat-Hafs-A-n-Assem/{S}.mp3" },
  { id: "sudais", name: "Abdurrahman es-Sudays", path: "Abdurrahmaan_As-Sudais_192kbps", makam: "Haram", risk: "low", telifRiski: 20, riskAciklamasi: "Resmi Haremeyn yayınları dışında adil kullanım kapsamında değerlendirilebilir.", color: "#10b981", initial: "AS", country: "Suudi Arabistan" },
  { id: "shuraim", name: "Suud eş-Şureym", path: "Saood_ash-Shuraym_128kbps", makam: "Haram", risk: "low", telifRiski: 15, riskAciklamasi: "Geniş kullanım izni; Haremeyn İdaresi tarafından yaygın yayına açılmıştır.", color: "#10b981", initial: "SŞ", country: "Suudi Arabistan" },
  { id: "mahermuaiqly", name: "Maher el-Muaiqly", path: "MaherAlMuaiqly128kbps", makam: "Haram", risk: "low", telifRiski: 15, riskAciklamasi: "Haremeyn İdaresi yayını; geniş izin kapsamında.", color: "#10b981", initial: "MM", country: "Suudi Arabistan" },
  { id: "hudhaify", name: "Ali el-Hudeyfi", path: "Hudhaify_128kbps", makam: "Haram", risk: "low", telifRiski: 10, riskAciklamasi: "Medine Mescidi İmamı; resmi kanallardan serbest erişim.", color: "#10b981", initial: "AH", country: "Suudi Arabistan" },
  { id: "husary", name: "Mahmud Halil el-Husarî", path: "Husary_128kbps", makam: "Telif", risk: "low", telifRiski: 5, riskAciklamasi: "Mısır radyo ekolünün efsanesi — Kâbe imamı değildir, klasik kayıt.", color: "#84cc16", initial: "MH", country: "Mısır" },
  { id: "abdulbasit_murattal", name: "Abdulbâsıt Abdussamed (Murattal)", path: "Abdul_Basit_Murattal_192kbps", makam: "Telif", risk: "low", telifRiski: 8, riskAciklamasi: "Mısır ekolü — Kâbe imamı değildir, klasik Murattal kayıt.", color: "#84cc16", initial: "AB", country: "Mısır" },
  { id: "minshawi", name: "Muhammed Sıddık el-Minşâvî (Murattal)", path: "Minshawy_Murattal_128kbps", makam: "Telif", risk: "low", telifRiski: 5, riskAciklamasi: "Mısır ekolü — Kâbe imamı değildir, efsanevi Murattal kayıt.", color: "#84cc16", initial: "MS", country: "Mısır" },
  { id: "tablawi", name: "Muhammed el-Tablâvî", path: "Mohammad_al_Tablaway_128kbps", makam: "Telif", risk: "low", telifRiski: 10, riskAciklamasi: "Mısır ekolü — Kâbe imamı değildir, geniş çevrimiçi kullanım.", color: "#84cc16", initial: "MT", country: "Mısır" },
  { id: "ayyoub", name: "Muhammed Eyyüb", path: "Muhammad_Ayyoub_128kbps", makam: "Haram", risk: "low", telifRiski: 10, riskAciklamasi: "Mescid-i Nebevî imamı; resmi Medine kaydı.", color: "#10b981", initial: "ME", country: "Suudi Arabistan" },
  { id: "jibreel", name: "Muhammed Cibrîl", path: "Muhammad_Jibreel_128kbps", makam: "Telif", risk: "low", telifRiski: 12, riskAciklamasi: "Mısır ekolü — Kâbe imamı değildir, yüksek perdeli okuyuş.", color: "#84cc16", initial: "MJ", country: "Mısır" },
  { id: "alafasy", name: "Mişari Reşid el-Afasi", path: "Alafasy_128kbps", makam: "Telif", risk: "low", telifRiski: 30, riskAciklamasi: "Dijital hak takibi yüksektir; kanalınızda itiraz gelebilir, dikkatli kullanın.", color: "#3b82f6", initial: "MA", country: "Kuveyt" },
  { id: "nasser_qatami", name: "Nasser el-Katami", path: "Nasser_Alqatami_128kbps", makam: "Telif", risk: "low", telifRiski: 20, riskAciklamasi: "Yüksek perdeli okuyuş; adil kullanım kapsamında değerlendirilebilir.", color: "#22c55e", initial: "NK", country: "Suudi Arabistan" },
  { id: "yasserdosari", name: "Yasser el-Dosari", path: "Yasser_Ad-Dussary_128kbps", makam: "Telif", risk: "low", telifRiski: 25, riskAciklamasi: "Popüler ve yüksek makamlı okuyuş; Nasser el-Katami'den bağımsız EveryAyah kaydı.", color: "#16a34a", initial: "YD", country: "Suudi Arabistan" },
  { id: "basfar", name: "Abdullah Basfar", path: "Abdullah_Basfar_192kbps", makam: "Telif", risk: "low", telifRiski: 15, riskAciklamasi: "Geniş çevrimiçi yayın izni; 192kbps kaliteli kayıt.", color: "#10b981", initial: "ABF", country: "Suudi Arabistan" },
  { id: "husary_mujawwad", name: "Mahmud Halil el-Husarî (Mücevved)", path: "Husary_128kbps_Mujawwad", makam: "Telif", risk: "low", telifRiski: 8, riskAciklamasi: "Tarihi Mücevved kaydı; yüksek makam, telif hakları pratikte neredeyse sıfır.", color: "#84cc16", initial: "HMJ", country: "Mısır" },
  { id: "aliabbasi", name: "Ali Cabir", path: "Ali_Jaber_64kbps", makam: "Telif", risk: "mid", telifRiski: 40, riskAciklamasi: "Mekke İmamı kayıtları; bazı platformlarda itiraz gelebilir.", color: "#f97316", initial: "AC", country: "Suudi Arabistan" },
  { id: "salahbukhar", name: "Salah Bukhatir", path: "Salaah_AbdulRahman_Bukhatir_128kbps", makam: "Telif", risk: "mid", telifRiski: 35, riskAciklamasi: "BAE telif takibi aktif; kısa klipler için adil kullanım geçerlidir.", color: "#f59e0b", initial: "SB", country: "BAE" },
  { id: "sahl", name: "Sahl Yassin", path: "Sahl_Yassin_128kbps", makam: "Telif", risk: "mid", telifRiski: 30, riskAciklamasi: "EveryAyah üzerinden erişim mevcut; telif durumu karma.", color: "#fb923c", initial: "SY", country: "Suudi Arabistan" },
  { id: "faresmabbad", name: "Fares Abbad", path: "Fares_Abbad_64kbps", makam: "Telif", risk: "high", telifRiski: 75, riskAciklamasi: "Aktif telif takibi; ticari kullanımda kesinlikle lisans gerekir.", color: "#ef4444", initial: "FA", country: "Suudi Arabistan" },
  { id: "ghamadi", name: "Saad el-Gamidi", path: "Ghamadi_40kbps", makam: "Telif", risk: "high", telifRiski: 80, riskAciklamasi: "Dijital hak yönetimi sistemi aktif; YouTube/sosyal medya itirazı yüksek ihtimal.", color: "#dc2626", initial: "SG", country: "Suudi Arabistan" },
  // ── KÂBE / MESCİD-İ NEBEVİ İMAMLARI — yüksek makam, gür ses (Haram) ───
  { id: "juhany", name: "Abdullah Avvâd el-Cüheynî", path: "Abdullaah_3awwaad_Al-Juhaynee_128kbps", makam: "Haram", risk: "low", telifRiski: 12, riskAciklamasi: "Mescid-i Haram imamı; gür, yüksek makam, resmi Haremeyn kaydı.", color: "#10b981", initial: "AC", country: "Suudi Arabistan" },
  { id: "qasim", name: "Muhsin el-Kâsım", path: "Muhsin_Al_Qasim_192kbps", makam: "Haram", risk: "low", telifRiski: 10, riskAciklamasi: "Mescid-i Nebevî imamı; 192kbps, güçlü ve tiz okuyuş.", color: "#10b981", initial: "MK", country: "Suudi Arabistan" },
  { id: "budair", name: "Salâh el-Büdeyr", path: "Salah_Al_Budair_128kbps", makam: "Haram", risk: "low", telifRiski: 10, riskAciklamasi: "Mescid-i Nebevî imamı; yüksek perdeli, gür ses.", color: "#10b981", initial: "SB", country: "Suudi Arabistan" },
  { id: "matroud", name: "Abdullah Matrûd", path: "Abdullah_Matroud_128kbps", makam: "Haram", risk: "low", telifRiski: 12, riskAciklamasi: "Mescid-i Nebevî imamı; duygulu, tiz makam.", color: "#10b981", initial: "AM", country: "Suudi Arabistan" },
  // ── YÜKSEK MAKAM / GÜR SESLİ TELİF KÂRİLERİ — yeni havuz ─────────────
  { id: "minshawy_mujawwad", name: "Muhammed Sıddık el-Minşâvî (Mücevved)", path: "Minshawy_Mujawwad_192kbps", makam: "Telif", risk: "low", telifRiski: 5, riskAciklamasi: "Mücevved tarzının zirvesi; çok gür, çok yüksek makam, 192kbps.", color: "#84cc16", initial: "MSM", country: "Mısır" },
  { id: "basit_mujawwad", name: "Abdulbâsıt Abdussamed (Mücevved)", path: "Abdul_Basit_Mujawwad_128kbps", makam: "Telif", risk: "low", telifRiski: 8, riskAciklamasi: "Efsane gür ses; yüksek perdeli Mücevved, telif pratikte sıfır.", color: "#10b981", initial: "ABM", country: "Mısır" },
  { id: "qahtani", name: "Hâlid b. Abdullah el-Kahtânî", path: "Khaalid_Abdullaah_al-Qahtaanee_192kbps", makam: "Telif", risk: "mid", telifRiski: 30, riskAciklamasi: "Çok gür, çok yüksek makam; 192kbps, sosyal medya telif kontrolü önerilir.", color: "#f59e0b", initial: "KQ", country: "Suudi Arabistan" },
  { id: "shatri", name: "Ebu Bekir eş-Şâtırî", path: "Abu_Bakr_Ash-Shaatree_128kbps", makam: "Telif", risk: "mid", telifRiski: 40, riskAciklamasi: "Yüksek makam, geniş dinleyici; telif takibi aktif.", color: "#f97316", initial: "AS", country: "Yemen" },
  { id: "rifai", name: "Hânî er-Rifâî", path: "Hani_Rifai_64kbps", makam: "Telif", risk: "low", telifRiski: 20, riskAciklamasi: "Tiz ve duygulu okuyuş; tek kayıt olarak düşük riskli 64kbps sürüm kullanılır.", color: "#22c55e", initial: "HR", country: "Suudi Arabistan" },
  { id: "abdulkareem", name: "Muhammed Abdülkerîm", path: "Muhammad_AbdulKareem_128kbps", makam: "Telif", risk: "mid", telifRiski: 30, riskAciklamasi: "Gür, yüksek perdeli; Sudan ekolü.", color: "#fb923c", initial: "MAK", country: "Sudan" },
  { id: "salamah", name: "Yâsir Selâme", path: "Yaser_Salamah_128kbps", makam: "Telif", risk: "mid", telifRiski: 30, riskAciklamasi: "Yüksek makam, güçlü ses.", color: "#f59e0b", initial: "YS", country: "Suudi Arabistan" },
  { id: "neana", name: "Ahmed Neânâ", path: "Ahmed_Neana_128kbps", makam: "Telif", risk: "mid", telifRiski: 30, riskAciklamasi: "Yüksek perdeli, duygulu okuyuş.", color: "#fb923c", initial: "AN", country: "Mısır" },
  { id: "alaqimy", name: "Ekrem el-Alakımî", path: "Akram_AlAlaqimy_128kbps", makam: "Telif", risk: "mid", telifRiski: 30, riskAciklamasi: "Gür, tiz makam.", color: "#f59e0b", initial: "AA", country: "Suudi Arabistan" },
  { id: "suesy", name: "Ali Haccâc es-Süveysî", path: "Ali_Hajjaj_AlSuesy_128kbps", makam: "Telif", risk: "mid", telifRiski: 30, riskAciklamasi: "Yüksek makam, güçlü nefes.", color: "#fb923c", initial: "AHS", country: "Suudi Arabistan" },
  { id: "ajamy", name: "Ahmed b. Ali el-Acemî", path: "ahmed_ibn_ali_al_ajamy_128kbps", makam: "Telif", risk: "low", telifRiski: 15, riskAciklamasi: "Net, gür okuyuş; EveryAyah doğrulanmış klasör adıyla kullanılır.", color: "#16a34a", initial: "AJ", country: "Suudi Arabistan" },
  // ── ★ YENİ: TELİF RİSKİ DÜŞÜK · YÜKSEK MAKAM · GÜR SESLİ KÂRİLER ──────
  { id: "husary_muallim", name: "Mahmud Halil el-Husarî (Muallim)", path: "Husary_Muallim_128kbps", makam: "Telif", risk: "low", telifRiski: 5, riskAciklamasi: "Öğretici tarz, net mahreç; tarihi kayıt, telif riski neredeyse sıfır.", color: "#84cc16", initial: "HMU", country: "Mısır" },
  { id: "akhdar", name: "İbrahim el-Ahdar", path: "Ibrahim_Akhdar_32kbps", makam: "Haram", risk: "low", telifRiski: 8, riskAciklamasi: "Mescid-i Haram kârisi; berrak ve yüksek perdeli okuyuş, resmi kayıt.", color: "#10b981", initial: "İA", country: "Suudi Arabistan" },
  { id: "sowaid", name: "Eymen Suveyd", path: "Ayman_Sowaid_64kbps", makam: "Telif", risk: "low", telifRiski: 6, riskAciklamasi: "Tecvid üstadı; eğitim amaçlı serbest yayın, telif riski çok düşük.", color: "#22c55e", initial: "ES", country: "Suriye" },
  { id: "shatri_alt", name: "Ebu Bekir eş-Şâtırî (Alternatif Kayıt)", path: "Abu_Bakr_Ash-Shaatree_64kbps", makam: "Telif", risk: "low", telifRiski: 22, riskAciklamasi: "Yüksek makam, hızlı tempo; alternatif düşük bit hızlı kayıt, risk daha düşük.", color: "#16a34a", initial: "AŞ", country: "Yemen" },
  { id: "basfar_alt", name: "Abdullah Basfar (32k)", path: "Abdullah_Basfar_32kbps", makam: "Telif", risk: "low", telifRiski: 10, riskAciklamasi: "Gür ve net okuyuş; hafif kayıt, geniş yayın izni.", color: "#10b981", initial: "AB2", country: "Suudi Arabistan" },
  { id: "juhany_alt", name: "Abdullah el-Cüheynî (64k)", path: "Abdullaah_3awwaad_Al-Juhaynee_64kbps", makam: "Haram", risk: "low", telifRiski: 10, riskAciklamasi: "Mescid-i Haram imamı; yüksek makam, hızlı yüklenen hafif kayıt.", color: "#10b981", initial: "AC2", country: "Suudi Arabistan" },

  // ═══════════════════════════════════════════════════════════════════
  // ★ KLASİK KÂBE İMAMLARI & YÜKSEK MAKAM KÂRİLER (Telif riski düşük)
  //   Gür, tiz, hızlı tempolu okuyuşlar — ağır/yavaş olanlar dahil değil
  // ═══════════════════════════════════════════════════════════════════
  { id: "muhaisny", name: "Muhammed el-Muhaysinî", path: "Muhammad_AlMuhaisny_128kbps", makam: "Haram", risk: "low", telifRiski: 12, riskAciklamasi: "Mescid-i Haram kârisi; çok gür, yüksek perdeli ve etkileyici okuyuş.", color: "#10b981", initial: "MM2", country: "Suudi Arabistan" },

  { id: "shuraim_alt", name: "Suud eş-Şüreym (64k)", path: "Saood_ash-Shuraym_64kbps", makam: "Haram", risk: "low", telifRiski: 12, riskAciklamasi: "Kâbe İmamı; gür ve otoriter makam, hafif kayıt hızlı yüklenir.", color: "#10b981", initial: "SŞ2", country: "Suudi Arabistan" },
  { id: "sudais_alt", name: "Abdurrahman es-Sudays (64k)", path: "Abdurrahmaan_As-Sudais_64kbps", makam: "Haram", risk: "low", telifRiski: 15, riskAciklamasi: "Kâbe Başimamı; dünyaca tanınan gür makam, hafif kayıt.", color: "#10b981", initial: "AS2", country: "Suudi Arabistan" },
  { id: "hudhaify_alt", name: "Ali el-Hudeyfî (32k)", path: "Hudhaify_32kbps", makam: "Haram", risk: "low", telifRiski: 8, riskAciklamasi: "Mescid-i Nebevî İmamı; net ve dingin ama diri tempo.", color: "#10b981", initial: "AH2", country: "Suudi Arabistan" },
  { id: "ayyoub_alt", name: "Muhammed Eyyüb (32k)", path: "Muhammad_Ayyoub_32kbps", makam: "Haram", risk: "low", telifRiski: 9, riskAciklamasi: "Merhum Mescid-i Nebevî imamı; içli ve yüksek perdeli okuyuş.", color: "#10b981", initial: "ME2", country: "Suudi Arabistan" },
  { id: "matroud_alt", name: "Abdullah Matrûd (128k)", path: "Abdullah_Matroud_128kbps", makam: "Haram", risk: "low", telifRiski: 12, riskAciklamasi: "Duygulu ve tiz makam; Mescid-i Nebevî kaydı.", color: "#10b981", initial: "AM2", country: "Suudi Arabistan" },

  { id: "jibreel_alt", name: "Muhammed Cibrîl (64k)", path: "Muhammad_Jibreel_64kbps", makam: "Telif", risk: "low", telifRiski: 10, riskAciklamasi: "Mısır ekolü; yüksek perdeli, coşkulu okuyuş.", color: "#84cc16", initial: "MJ2", country: "Mısır" },
  { id: "tablawi_alt", name: "Muhammed el-Tablâvî (64k)", path: "Mohammad_al_Tablaway_64kbps", makam: "Telif", risk: "low", telifRiski: 8, riskAciklamasi: "Mısır ekolü; gür ses, yüksek makam, düşük telif riski.", color: "#84cc16", initial: "MT2", country: "Mısır" },
  { id: "banna", name: "Mahmud Ali el-Bennâ", path: "mahmoud_ali_al_banna_32kbps", makam: "Telif", risk: "low", telifRiski: 6, riskAciklamasi: "Mısır radyo ekolü ustası; berrak, tiz ve güçlü klasik kayıt.", color: "#84cc16", initial: "MB", country: "Mısır" },
  { id: "shaatree_alt", name: "Ebû Bekir eş-Şâtırî (128k)", path: "Abu_Bakr_Ash-Shaatree_128kbps", makam: "Telif", risk: "low", telifRiski: 24, riskAciklamasi: "Hızlı tempo, yüksek makam; geniş dinleyici kitlesi.", color: "#22c55e", initial: "AŞ2", country: "Yemen" },
  { id: "parhizgar", name: "Şehriyar Perhizgâr", path: "Parhizgar_48kbps", makam: "Telif", risk: "low", telifRiski: 5, riskAciklamasi: "Net mahreç, diri tempo; eğitim amaçlı serbest yayın.", color: "#84cc16", initial: "ŞP", country: "İran" },
  { id: "husary_64", name: "Mahmud Halil el-Husarî (64k)", path: "Husary_64kbps", makam: "Telif", risk: "low", telifRiski: 5, riskAciklamasi: "Mısır radyo efsanesi; berrak ve dengeli, telif riski neredeyse sıfır.", color: "#84cc16", initial: "MH2", country: "Mısır" },
  { id: "minshawi_alt", name: "Muhammed Sıddîk el-Minşâvî (16k)", path: "Minshawy_Murattal_128kbps", makam: "Telif", risk: "low", telifRiski: 5, riskAciklamasi: "Efsanevi Mısır ekolü; duygulu ve akıcı, telif riski çok düşük.", color: "#84cc16", initial: "MS2", country: "Mısır" },
  { id: "basit_64", name: "Abdulbâsıt Abdussamed (64k)", path: "Abdul_Basit_Murattal_64kbps", makam: "Telif", risk: "low", telifRiski: 7, riskAciklamasi: "Dünyaca ünlü gür ses; klasik kayıt, hafif ve hızlı yüklenir.", color: "#84cc16", initial: "AB4", country: "Mısır" },
];

export function reciterAudioUrl(path: string, surah: number, ayah: number): string {
  const sStr = String(surah).padStart(3, "0");
  const aStr = String(ayah).padStart(3, "0");
  return `https://everyayah.com/data/${path}/${sStr}${aStr}.mp3`;
}

export const RISK_META: Record<"low" | "mid" | "high", { label: string; percent: number; color: string }> = {
  low: { label: "Telif Riski Düşük", percent: 5, color: "#10b981" },
  mid: { label: "Orta Seviye", percent: 35, color: "#f59e0b" },
  high: { label: "Yüksek Telif Riski", percent: 85, color: "#ef4444" },
};

export const THEMES: Theme[] = [
  { id: "nur", name: "Nûr-ı İlâhî", bg: "#0c0d12", bg2: "#191c29", acc: "#d7aa52", acc2: "#f5dda6", txt: "#f3f4f6" },
  { id: "emerald", name: "Zümrüt Yeşili", bg: "#06130e", bg2: "#0f2e23", acc: "#10b981", acc2: "#6ee7b7", txt: "#f3f4f6" },
  { id: "sapphire", name: "Safir Mavi", bg: "#0a1128", bg2: "#1c2d5a", acc: "#3b82f6", acc2: "#93c5fd", txt: "#f3f4f6" },
  { id: "amethyst", name: "Ametist Mor", bg: "#13091e", bg2: "#2d1348", acc: "#a855f7", acc2: "#e9d5ff", txt: "#f3f4f6" },
  { id: "ruby", name: "Yakut Kırmızı", bg: "#1a080c", bg2: "#3b121b", acc: "#f43f5e", acc2: "#fecdd3", txt: "#f3f4f6" },
  { id: "sand", name: "Altın Çöl", bg: "#17120a", bg2: "#342816", acc: "#f59e0b", acc2: "#fde68a", txt: "#f3f4f6" },
];

export const THEME_EMOJI: Record<string, string> = {
  nur: "✨", emerald: "🌿", sapphire: "🌊", amethyst: "🔮", ruby: "🌺", sand: "🕌",
};

export const DAILY_AYAHS: Array<[number, number]> = [
  [1, 1], [2, 255], [3, 102], [55, 13], [67, 1], [112, 1], [113, 1], [114, 1], [36, 58], [93, 1], [94, 5], [20, 114], [24, 35], [59, 21],
];

/** Kategorize hashtag havuzu — rastgele butonu her seferinde farklı temalardan karışık çeker */
// ★ Kısa & küçük harfli hashtag'ler — TikTok/Instagram algoritma dostu.
// Uzun CamelCase hashtag'ler yerine tek kelime, herkesin aradığı popüler etiketler.
export const HASHTAG_CATEGORIES: Record<string, string[]> = {
  kuran:     ["#kuran", "#ayet", "#mushaf", "#tilavet", "#tefsir", "#sure", "#meal", "#kuraniKerim"],
  cuma:      ["#cuma", "#cumamübarek", "#cumagünü", "#hayırlıcumalar", "#cumadua"],
  ramazan:   ["#ramazan", "#iftar", "#sahur", "#teravih", "#kadirgecesi", "#oruç", "#bayram"],
  dua:       ["#dua", "#istiğfar", "#tevbe", "#secde", "#zikir", "#niyaz"],
  tefekkur:  ["#tefekkür", "#maneviyat", "#huzur", "#içhuzur", "#sekinet", "#sükunet"],
  huzur:     ["#huzur", "#rahmet", "#gönül", "#kalp", "#şifa"],
  peygamber: ["#peygamber", "#efendimiz", "#hadis", "#sünnet", "#nebevi", "#salavat"],
  aile:      ["#müslümanaile", "#anne", "#baba", "#evlilik", "#helal", "#terbiye"],
  sosyal:    ["#islam", "#iman", "#namaz", "#allah", "#ümmet", "#hayır", "#sadaka"],
  keşfet:    ["#keşfet", "#fyp", "#foryou", "#viral", "#reels", "#shorts"],
  marka:     ["#nurstudyo", "#nurstüdyo"],
};

export const HASHTAG_POOL: string[] = Object.values(HASHTAG_CATEGORIES).flat();

/** Rastgele hashtag kombinasyonu üretir — her kategoriden farklı sayıda çekerek çeşitlilik sağlar */
export function randomHashtagCombo(count = 7): string[] {
  const cats = Object.values(HASHTAG_CATEGORIES);
  const picked: string[] = [];
  const shuffledCats = [...cats].sort(() => Math.random() - 0.5);
  for (const cat of shuffledCats) {
    if (picked.length >= count) break;
    const item = cat[Math.floor(Math.random() * cat.length)];
    if (!picked.includes(item)) picked.push(item);
  }
  while (picked.length < count) {
    const pool = HASHTAG_POOL;
    const item = pool[Math.floor(Math.random() * pool.length)];
    if (!picked.includes(item)) picked.push(item);
  }
  return picked.sort(() => Math.random() - 0.5);
}

export const KISSAS: Kissa[] = [
  { title: "Yûsuf (a.s.) ve Kuyu", ref: "Yûsuf 12:15", text: "Kardeşleri onu kuyuya attıklarında Allah O'na vahyetti: 'Günü gelecek, onlar hiç farkında değilken bu yaptıklarını kendilerine haber vereceksin.'", s: 12, a: 15 },
  { title: "Mûsâ (a.s.) ve Kızıldeniz", ref: "Şuarâ 26:63", text: "Bunun üzerine Mûsâ'ya: 'Asan ile denize vur!' diye vahyettik. Deniz derhal yarıldı ve her parçası koca bir dağ gibi oldu.", s: 26, a: 63 },
  { title: "İbrâhîm (a.s.) ve Ateş", ref: "Enbiyâ 21:69", text: "Biz de dedik ki: 'Ey ateş! İbrâhîm üzerine serinlik ve selâmet ol!'", s: 21, a: 69 },
  { title: "Yûnus (a.s.) ve Balık", ref: "Enbiyâ 21:87", text: "Karanlıklar içinde şöyle niyaz etti: 'Senden başka ilâh yoktur. Seni tenzih ederim. Şüphesiz ben haksızlık edenlerden oldum.'", s: 21, a: 87 },
];

export const MEAL_FIXES: Record<number, string[]> = {};

export const TURKISH_CITIES: string[] = [
  "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Konya", "Gaziantep",
  "Şanlıurfa", "Kocaeli", "Mersin", "Diyarbakır", "Hatay", "Manisa", "Kayseri",
  "Samsun", "Balıkesir", "Kahramanmaraş", "Van", "Aydın", "Tekirdağ", "Sakarya",
  "Denizli", "Muğla", "Eskişehir", "Erzurum", "Mardin", "Trabzon", "Malatya",
  "Ordu", "Erzincan", "Rize", "Sivas",
];

// ════════════════════════════════════════════════════════
// ★ BAŞLIK ŞABLONLARI — 36 seçenek · her dilde ayrı havuz
//   {S} = sure adı · {N} = sure no · {A} = ayet no
// ════════════════════════════════════════════════════════

export const TITLE_TEMPLATES: Record<string, string[]> = {
  tr: [
    "✨ Hangi Ayet Kalbinize Dokundu? — {S} {N}:{A}",
    "📖 Her Güne Bir Ayet: {S} Suresi {N}:{A}",
    "🤲 Gönüllere Huzur Veren Tilavet | {S} {N}:{A}",
    "🌿 Ruhunuzu Dinlendirecek Sözler: {S} {N}:{A}",
    "🕌 Kalbi Yumuşatan Ayet · {S} {N}:{A}",
    "🌙 Gecenin Sükûnetinde: {S} {N}:{A}",
    "💫 Bu Ayeti Duyunca Durdum — {S} {N}:{A}",
    "🌸 İçini Ferahlatacak Ayet | {S} {N}:{A}",
    "🔥 Tüylerinizi Diken Diken Edecek Tilavet · {S} {N}:{A}",
    "🕋 Kâbe Huzurunda: {S} {N}:{A}",
    "📿 Zikir Gibi Dinlenen Ayet — {S} {N}:{A}",
    "🌊 Gönül Denizinde Bir Damla | {S} {N}:{A}",
    "⭐ Günün En Etkileyici Ayeti: {S} {N}:{A}",
    "🤍 Kalbinize İyi Gelecek: {S} {N}:{A}",
    "🌅 Sabahın Bereketiyle — {S} {N}:{A}",
    "🎧 Kulaklıkla Dinleyin · {S} {N}:{A}",
    "💚 Şifa Niyetine Bir Ayet | {S} {N}:{A}",
    "🌟 Bir Kez Dinleyin Yeter: {S} {N}:{A}",
    "🕊️ Huzurun Sesi — {S} {N}:{A}",
    "📜 Unutulmaz Bir Ayet-i Kerîme · {S} {N}:{A}",
    "🌹 Ruha Dokunan Tilavet | {S} {N}:{A}",
    "✋ Durup Düşündüren Ayet: {S} {N}:{A}",
    "🌌 Gecenin Nûru — {S} {N}:{A}",
    "🫀 Kalpten Kalbe: {S} {N}:{A}",
    "🔊 Sesi Açın ve Dinleyin · {S} {N}:{A}",
    "🌱 Tefekkür İçin Bir Ayet | {S} {N}:{A}",
    "🏞️ Doğanın Sükûnetiyle: {S} {N}:{A}",
    "💎 Kur'an'dan Bir İnci — {S} {N}:{A}",
    "🌤️ Sıkıntını Alacak Ayet · {S} {N}:{A}",
    "🤍 Sabrı Öğreten Ayet | {S} {N}:{A}",
    "🌺 Gönül Bahçesinden: {S} {N}:{A}",
    "⚡ Bu Ayet Hayatınızı Değiştirebilir — {S} {N}:{A}",
    "🕯️ Karanlıkta Bir Işık · {S} {N}:{A}",
    "📲 Paylaş, Sevap Kazan | {S} {N}:{A}",
    "🌈 Umut Veren Ayet: {S} {N}:{A}",
    "🙏 Dua Niyetine Dinleyin — {S} {N}:{A}",
  ],
  en: [
    "✨ Which Verse Touched Your Heart? — {S} {N}:{A}",
    "📖 A Verse a Day: Surah {S} {N}:{A}",
    "🤲 A Recitation That Brings Peace | {S} {N}:{A}",
    "🌿 Words to Rest Your Soul: {S} {N}:{A}",
    "🕌 A Verse That Softens the Heart · {S} {N}:{A}",
    "🌙 In the Stillness of the Night: {S} {N}:{A}",
    "💫 This Verse Stopped Me — {S} {N}:{A}",
    "🌸 A Verse to Ease Your Mind | {S} {N}:{A}",
    "🔥 A Recitation That Gives You Chills · {S} {N}:{A}",
    "🕋 In the Presence of the Kaaba: {S} {N}:{A}",
    "📿 A Verse Like Dhikr — {S} {N}:{A}",
    "🌊 A Drop in the Ocean of the Heart | {S} {N}:{A}",
    "⭐ Most Powerful Verse of the Day: {S} {N}:{A}",
    "🤍 Good for Your Heart: {S} {N}:{A}",
    "🌅 With the Blessing of Morning — {S} {N}:{A}",
    "🎧 Listen With Headphones · {S} {N}:{A}",
    "💚 A Verse for Healing | {S} {N}:{A}",
    "🌟 Listen Once, It's Enough: {S} {N}:{A}",
    "🕊️ The Sound of Serenity — {S} {N}:{A}",
    "📜 An Unforgettable Verse · {S} {N}:{A}",
    "🌹 A Recitation That Touches the Soul | {S} {N}:{A}",
    "✋ A Verse That Makes You Pause: {S} {N}:{A}",
    "🌌 Light of the Night — {S} {N}:{A}",
    "🫀 From Heart to Heart: {S} {N}:{A}",
    "🔊 Turn Up the Volume · {S} {N}:{A}",
    "🌱 A Verse for Reflection | {S} {N}:{A}",
    "🏞️ With Nature's Calm: {S} {N}:{A}",
    "💎 A Pearl From the Quran — {S} {N}:{A}",
    "🌤️ A Verse to Lift Your Burden · {S} {N}:{A}",
    "🤍 A Verse That Teaches Patience | {S} {N}:{A}",
    "🌺 From the Garden of the Heart: {S} {N}:{A}",
    "⚡ This Verse Can Change Your Life — {S} {N}:{A}",
    "🕯️ A Light in the Darkness · {S} {N}:{A}",
    "📲 Share and Earn Reward | {S} {N}:{A}",
    "🌈 A Verse of Hope: {S} {N}:{A}",
    "🙏 Listen as a Prayer — {S} {N}:{A}",
  ],
  ar: [
    "✨ أي آية لامست قلبك؟ — {S} {N}:{A}",
    "📖 آية كل يوم: سورة {S} {N}:{A}",
    "🤲 تلاوة تبعث السكينة | {S} {N}:{A}",
    "🌿 كلمات تريح الروح: {S} {N}:{A}",
    "🕌 آية تُلين القلوب · {S} {N}:{A}",
    "🌙 في سكون الليل: {S} {N}:{A}",
    "💫 هذه الآية أوقفتني — {S} {N}:{A}",
    "🌸 آية تشرح الصدر | {S} {N}:{A}",
    "🔥 تلاوة تقشعر لها الأبدان · {S} {N}:{A}",
    "🕋 في رحاب الكعبة: {S} {N}:{A}",
    "📿 آية كالذكر — {S} {N}:{A}",
    "🌊 قطرة في بحر القلب | {S} {N}:{A}",
    "⭐ أقوى آية اليوم: {S} {N}:{A}",
    "🤍 خير لقلبك: {S} {N}:{A}",
    "🌅 مع بركة الصباح — {S} {N}:{A}",
    "🎧 استمع بالسماعات · {S} {N}:{A}",
    "💚 آية للشفاء | {S} {N}:{A}",
    "🌟 استمع مرة واحدة تكفي: {S} {N}:{A}",
    "🕊️ صوت الطمأنينة — {S} {N}:{A}",
    "📜 آية لا تُنسى · {S} {N}:{A}",
    "🌹 تلاوة تلامس الروح | {S} {N}:{A}",
    "✋ آية تدعوك للتوقف: {S} {N}:{A}",
    "🌌 نور الليل — {S} {N}:{A}",
    "🫀 من القلب إلى القلب: {S} {N}:{A}",
    "🔊 ارفع الصوت · {S} {N}:{A}",
    "🌱 آية للتفكر | {S} {N}:{A}",
    "🏞️ مع هدوء الطبيعة: {S} {N}:{A}",
    "💎 لؤلؤة من القرآن — {S} {N}:{A}",
    "🌤️ آية ترفع همّك · {S} {N}:{A}",
    "🤍 آية تعلّم الصبر | {S} {N}:{A}",
    "🌺 من حديقة القلب: {S} {N}:{A}",
    "⚡ هذه الآية قد تغيّر حياتك — {S} {N}:{A}",
    "🕯️ نور في الظلام · {S} {N}:{A}",
    "📲 شارك واكسب الأجر | {S} {N}:{A}",
    "🌈 آية الأمل: {S} {N}:{A}",
    "🙏 استمع بنية الدعاء — {S} {N}:{A}",
  ],
};

/** Diğer diller İngilizce havuzu kullanır */
function titlePool(lang: string): string[] {
  return TITLE_TEMPLATES[lang] ?? TITLE_TEMPLATES.en;
}

const EMOTIONAL_TITLE_TEMPLATES: Record<string, string[]> = {
  tr: [
    "İçindeki yalnızlık hissini hafifletecek ayet... 🎧🤍",
    "Bu ayeti duyunca kalbin biraz nefes alacak... 🌙🤲",
    "Rabbim beni unuttu sanan herkes bunu dinlesin... 🕊️",
    "Sessizce ağlayan kalplere inen teselli... 🤍",
    "Kendini yorgun hissediyorsan bu ayet sana iyi gelecek... 🌿",
    "Bu gece içini Allah'a açmadan uyuma... 🌙",
    "Bir ayet bazen bin nasihatten güçlüdür... ✨",
    "Kalbin daraldıysa bu tilaveti sonuna kadar dinle... 🎧",
    "Umudunu kaybettiğin anlar için indirilen teselli... 🕯️",
    "İçinde sakladığın acıya Kur'an'dan cevap... 🤲",
    "Allah'ın rahmeti sana sandığından daha yakın... 🌸",
    "Bu ayeti biri sana göndermiş gibi dinle... 💫",
  ],
  en: [
    "📌 Hook Title: A verse for the loneliness you never say out loud... 🎧🤍",
    "📌 Hook Title: If your heart feels tired, listen to this verse... 🌙",
    "📌 Hook Title: For every soul that thinks it has been forgotten... 🕊️",
    "📌 Hook Title: A Quranic comfort for silent tears... 🤍",
    "📌 Hook Title: This verse may soften something inside you... 🌿",
    "📌 Hook Title: Do not sleep before hearing this reminder... ✨",
  ],
  ar: [
    "📌 عنوان مؤثر: آية لكل قلب يشعر بالوحدة بصمت... 🎧🤍",
    "📌 عنوان مؤثر: إن كان قلبك متعبًا فاستمع لهذه الآية... 🌙",
    "📌 عنوان مؤثر: لكل نفس ظنت أنها تُركت وحدها... 🕊️",
    "📌 عنوان مؤثر: عزاء قرآني للدموع الصامتة... 🤍",
    "📌 عنوان مؤثر: هذه الآية قد تلامس قلبك بعمق... 🌿",
    "📌 عنوان مؤثر: لا تنم قبل أن تسمع هذا التذكير... ✨",
  ],
};

function ayahMoodTitle(surahName: string, s: number, a: number, lang: string): string[] {
  const name = `${surahName}`.toLocaleLowerCase("tr");
  const tr = lang === "tr";
  if (tr && (s === 93 || name.includes("duh"))) {
    return [
      "Rabbin seni terk etmedi... Bu ayet kalbine iyi gelecek 🤍",
      "Yalnız kaldığını sandığın anda Duhâ Suresi sana sesleniyor 🌙",
      "Kırgın kalpler için en büyük teselli: Rabbin seni bırakmadı 🕊️",
      "İçin daraldıysa Duhâ Suresi'ni sonuna kadar dinle 🎧",
    ];
  }
  if (tr && (s === 94 || name.includes("inşirah") || name.includes("insirah"))) {
    return [
      "Her zorluktan sonra bir kolaylık var... Bunu unutma 🌿",
      "Kalbindeki ağırlığı hafifletecek ayetler 🤲",
      "Sıkışmış gibi hissedenlere İnşirâh Suresi'nden teselli ✨",
    ];
  }
  if (tr && (s === 36 || name.includes("yasin"))) {
    return [
      "Yâsîn Suresi'nden kalbe şifa olan ayetler 💚",
      "Bu tilaveti sevdiklerine de gönder... Yâsîn'den huzur 🌹",
      "Kalbin yorulduysa Yâsîn Suresi'ni dinle 🎧",
    ];
  }
  if (tr && (s === 55 || name.includes("rahman"))) {
    return [
      "Rabbinin nimetlerini hatırlatan ayet... Şükretmek için dur 🌿",
      "Rahmân Suresi kalbine nimetleri hatırlatsın 🤍",
      "Hangi nimeti inkâr edebiliriz? Bu ayet düşündürüyor 🌙",
    ];
  }
  if (tr && (s === 67 || name.includes("mülk") || name.includes("mulk"))) {
    return [
      "Gece uyumadan önce Mülk Suresi'nden huzur veren ayetler 🌙",
      "Kabir karanlığını hatırlatan ve kalbi uyandıran tilavet 🕯️",
      "Bu ayeti dinle, sonra bugününü bir daha düşün 🤲",
    ];
  }
  if (tr && s === 2 && a === 255) {
    return [
      "Ayete'l-Kürsî: kalbine güven ve koruma hissi verecek ayet 🛡️",
      "Korkuların arttığında Ayete'l-Kürsî'yi dinle 🤍",
      "Allah her şeyi kuşatmıştır... Bu ayet kalbini toparlasın ✨",
    ];
  }
  return [];
}

/** ★ 36 seçenekli, çok dilli rastgele başlık üretici */
export function genTitle(surahName = "Bakara", s = 2, a = 255, lang = "tr"): string {
  const pool = [
    ...ayahMoodTitle(surahName, s, a, lang),
    ...titlePool(lang),
    ...(EMOTIONAL_TITLE_TEMPLATES[lang] ?? EMOTIONAL_TITLE_TEMPLATES.en),
  ];
  const tpl = pool[Math.floor(Math.random() * pool.length)];
  return tpl.replace("{S}", surahName).replace("{N}", String(s)).replace("{A}", String(a));
}

// ════════════════════════════════════════════════════════
// EK TEMALAR (v1.1 — toplam 20 tema, 5 free + 10 pro + 5 elit)
// Mevcut 6 temaya dokunulmadı, 14 yeni şiirsel Türkçe tema eklendi.
// ════════════════════════════════════════════════════════
export const EXTRA_THEMES: Theme[] = [
  { id: "gece-yildizi",   name: "Gece Yıldızı",    bg: "#0a0e1f", bg2: "#1a2347", acc: "#93c5fd", acc2: "#dbeafe", txt: "#f3f4f6" },
  { id: "zumrut-vaha",    name: "Zümrüt Vaha",     bg: "#04140e", bg2: "#0a3d2a", acc: "#34d399", acc2: "#a7f3d0", txt: "#f3f4f6" },
  { id: "yakut",          name: "Yakut",           bg: "#1a0608", bg2: "#4a0e16", acc: "#f87171", acc2: "#fecaca", txt: "#f3f4f6" },
  { id: "menekse-moru",   name: "Menekşe Moru",    bg: "#120820", bg2: "#2e1052", acc: "#c084fc", acc2: "#e9d5ff", txt: "#f3f4f6" },
  { id: "kum-vahasi",     name: "Kum Vahası",      bg: "#1a1206", bg2: "#3d2a0e", acc: "#fbbf24", acc2: "#fef3c7", txt: "#f3f4f6" },
  { id: "mercan-suyu",    name: "Mercan Suyu",     bg: "#04181a", bg2: "#0a3d42", acc: "#22d3ee", acc2: "#a5f3fc", txt: "#f3f4f6" },
  { id: "gul-bahcesi",    name: "Gül Bahçesi",     bg: "#1a0610", bg2: "#4a0e2e", acc: "#f472b6", acc2: "#fbcfe8", txt: "#f3f4f6" },
  { id: "lacivert-derin", name: "Lacivert Derin",  bg: "#060a1a", bg2: "#0e1a42", acc: "#60a5fa", acc2: "#bfdbfe", txt: "#f3f4f6" },
  { id: "mucellit-siyah", name: "Mücellit Siyah",  bg: "#080808", bg2: "#1a1a1a", acc: "#d4af37", acc2: "#f5e6a8", txt: "#f3f4f6" },
  { id: "turkuaz-isik",   name: "Turkuaz Işık",    bg: "#041a1a", bg2: "#0a4242", acc: "#2dd4bf", acc2: "#99f6e4", txt: "#f3f4f6" },
  { id: "amber-atesi",    name: "Amber Ateşi",     bg: "#1a0e04", bg2: "#42240a", acc: "#fb923c", acc2: "#fed7aa", txt: "#f3f4f6" },
  { id: "toz-pembe",      name: "Toz Pembe",       bg: "#1a0a10", bg2: "#3d1a28", acc: "#fda4af", acc2: "#ffe4e6", txt: "#f3f4f6" },
  { id: "orman-derinligi",name: "Orman Derinliği", bg: "#04140a", bg2: "#0a3d1e", acc: "#4ade80", acc2: "#bbf7d0", txt: "#f3f4f6" },
  { id: "indigo-gecidi",  name: "İndigo Geçidi",   bg: "#0a0820", bg2: "#1e1652", acc: "#818cf8", acc2: "#c7d2fe", txt: "#f3f4f6" },
];

/**
 * ★ Tema tier dağılımı — yarı yarıya FREE / PRO modeli.
 *   Önce 5 free + 10 pro + 5 elit idi; Elit tamamen kaldırıldı,
 *   temalar 10 FREE + 10 PRO olarak eşit paylaştırıldı.
 */
export const THEME_TIER: Record<string, "free" | "pro" | "elit"> = {
  // FREE (10)
  "nur": "free", "emerald": "free", "sapphire": "free",
  "gece-yildizi": "free", "zumrut-vaha": "free",
  "amethyst": "free", "sand": "free", "turkuaz-isik": "free",
  "toz-pembe": "free", "orman-derinligi": "free",
  // PRO (10)
  "ruby": "pro", "yakut": "pro", "menekse-moru": "pro", "kum-vahasi": "pro",
  "mercan-suyu": "pro", "gul-bahcesi": "pro", "lacivert-derin": "pro",
  "mucellit-siyah": "pro", "amber-atesi": "pro", "indigo-gecidi": "pro",
};

/** Yeni temaların emoji'leri (mevcut THEME_EMOJI'ye ek) */
export const THEME_EMOJI_EXTRA: Record<string, string> = {
  "gece-yildizi": "🌙", "zumrut-vaha": "💎", "yakut": "🔴", "menekse-moru": "🍇",
  "kum-vahasi": "🏜️", "mercan-suyu": "🌊", "gul-bahcesi": "🌹", "lacivert-derin": "🌌",
  "mucellit-siyah": "⚫", "turkuaz-isik": "💠", "amber-atesi": "🍊", "toz-pembe": "🌸",
  "orman-derinligi": "🌲", "indigo-gecidi": "🔮",
};

/** Hoca ses tarzı — telif riski birincil sıralama, bu ikincil */
export type SesTarzi = "yuksek" | "icli" | "klasik" | "orta";
export const SES_TARZI_ORDER: Record<SesTarzi, number> = { yuksek: 0, icli: 1, orta: 2, klasik: 3 };
export const RECITER_SES_TARZI: Record<string, SesTarzi> = {
  // Yüksek makam & gür
  alafasy: "yuksek", yasserdosari: "yuksek", mahermuaiqly: "yuksek",
  nasser_qatami: "yuksek", shatri: "yuksek", qahtani: "yuksek",
  jibreel: "yuksek", sahl: "yuksek",
  husary_mujawwad: "yuksek", akhdar: "yuksek", shatri_alt: "yuksek",
  juhany_alt: "yuksek", basfar_alt: "yuksek",
  husary_muallim: "klasik", sowaid: "klasik",
  // ★ Yeni eklenen yüksek makam / gür kâriler
  muhaisny: "yuksek",
  shuraim_alt: "yuksek", sudais_alt: "yuksek",
  matroud_alt: "yuksek",
  jibreel_alt: "yuksek", tablawi_alt: "yuksek", banna: "yuksek",
  shaatree_alt: "yuksek", basit_64: "yuksek",
  hudhaify_alt: "icli", ayyoub_alt: "icli",
  parhizgar: "orta", husary_64: "klasik", minshawi_alt: "klasik",
  // İçli & duygulu
  rifai: "icli", abdulkareem: "icli", salamah: "icli", neana: "icli",
  alaqimy: "icli", suesy: "icli", ayyoub: "icli", hudhaify: "icli",
  // Klasik & ağır
  husary: "klasik", minshawi: "klasik", abdulbasit_murattal: "klasik",
  tablawi: "klasik", mustafaismaiel: "klasik", aliabbasi: "klasik",
  faresmabbad: "klasik", ghamadi: "klasik",
  // Orta / karışık
  shuraim: "orta", sudais: "orta", basfar: "orta",
  minshawi_mujawwad: "orta", basit_mujawwad: "orta", salahbukhar: "orta",
  juhany: "orta", qasim: "orta", budair: "orta", matroud: "orta", ajamy: "orta",
  muaikly_h: "yuksek", dosari_h: "yuksek",
};

// ════════════════════════════════════════════════════════
// ★ AÇIKLAMA ŞABLONLARI — her dilde 30 varyant
// ════════════════════════════════════════════════════════

const DESC_INTRO: Record<string, string[]> = {
  tr: [
    "📌 {S} {N}:{A}. Ayet-i Kerîme",
    "📖 {S} Suresi · {N}:{A}. Ayet",
    "✨ Bugünün ayeti: {S} {N}:{A}",
    "🕌 {S} Suresi {N}:{A} — huzur veren tilavet",
    "🌿 Ruha dokunan ayet: {S} {N}:{A}",
    "💫 Kalbe şifa: {S} Suresi {N}:{A}",
    "🌙 Gece tilaveti · {S} {N}:{A}",
    "📿 Zikir niyetine: {S} {N}:{A}",
    "🤲 Dua ile: {S} Suresi {N}:{A}",
    "🕋 Kâbe huzurunda: {S} {N}:{A}",
  ],
  en: [
    "📌 {S} {N}:{A} — Noble Verse",
    "📖 Surah {S} · Verse {N}:{A}",
    "✨ Today's verse: {S} {N}:{A}",
    "🕌 Surah {S} {N}:{A} — a peaceful recitation",
    "🌿 A verse that touches the soul: {S} {N}:{A}",
    "💫 Healing for the heart: Surah {S} {N}:{A}",
    "🌙 Night recitation · {S} {N}:{A}",
    "📿 As remembrance: {S} {N}:{A}",
    "🤲 With prayer: Surah {S} {N}:{A}",
    "🕋 In the presence of the Kaaba: {S} {N}:{A}",
  ],
  ar: [
    "📌 {S} {N}:{A} — آية كريمة",
    "📖 سورة {S} · الآية {N}:{A}",
    "✨ آية اليوم: {S} {N}:{A}",
    "🕌 سورة {S} {N}:{A} — تلاوة تبعث السكينة",
    "🌿 آية تلامس الروح: {S} {N}:{A}",
    "💫 شفاء للقلب: سورة {S} {N}:{A}",
    "🌙 تلاوة الليل · {S} {N}:{A}",
    "📿 بنية الذكر: {S} {N}:{A}",
    "🤲 مع الدعاء: سورة {S} {N}:{A}",
    "🕋 في رحاب الكعبة: {S} {N}:{A}",
  ],
};

const DESC_LABELS: Record<string, { reciter: string; studio: string; quote: string; cta: string }> = {
  tr: {
    reciter: "🎧 Kâri",
    studio: "🎬 Yapım: Nûr Stüdyo.com · İslamî Labs",
    quote: '"Hakkında bilgi sahibi olmadığın şeyin ardına düşme. Çünkü kulak, göz ve kalp, bunların hepsi ondan sorumludur." (İsrâ 17:36)',
    cta: "Ayeti arkadaşlarınızla paylaşarak iyiliğe vesile olabilirsiniz.",
  },
  en: {
    reciter: "🎧 Reciter",
    studio: "🎬 Produced by: Nûr Studio.com · Islamic Labs",
    quote: '"Do not pursue that of which you have no knowledge. Indeed, the hearing, the sight and the heart — about all those one will be questioned." (Al-Isra 17:36)',
    cta: "Share this verse with your friends and be a means of goodness.",
  },
  ar: {
    reciter: "🎧 القارئ",
    studio: "🎬 إنتاج: Nûr Studio.com · مختبرات إسلامية",
    quote: '"وَلَا تَقْفُ مَا لَيْسَ لَكَ بِهِ عِلْمٌ ۚ إِنَّ السَّمْعَ وَالْبَصَرَ وَالْفُؤَادَ كُلُّ أُولَٰئِكَ كَانَ عَنْهُ مَسْئُولًا" (الإسراء ١٧:٣٦)',
    cta: "شارك الآية مع أصدقائك لتكون سببًا في الخير.",
  },
  de: {
    reciter: "🎧 Rezitator",
    studio: "🎬 Produktion: Nûr Studio.com · Islamic Labs",
    quote: '"Und verfolge nicht das, wovon du kein Wissen hast." (Al-Isra 17:36)',
    cta: "Teile diesen Vers mit deinen Freunden und sei ein Mittel des Guten.",
  },
  fr: {
    reciter: "🎧 Récitateur",
    studio: "🎬 Production : Nûr Studio.com · Islamic Labs",
    quote: '"Et ne poursuis pas ce dont tu n\'as aucune connaissance." (Al-Isra 17:36)',
    cta: "Partagez ce verset avec vos amis et soyez une source de bien.",
  },
  es: {
    reciter: "🎧 Recitador",
    studio: "🎬 Producción: Nûr Studio.com · Islamic Labs",
    quote: '"Y no persigas aquello de lo que no tienes conocimiento." (Al-Isra 17:36)',
    cta: "Comparte este versículo con tus amigos y sé un medio de bondad.",
  },
  ru: {
    reciter: "🎧 Чтец",
    studio: "🎬 Продакшн: Nûr Studio.com · Islamic Labs",
    quote: '"Не следуй тому, чего ты не знаешь." (Аль-Исра 17:36)',
    cta: "Поделитесь этим аятом с друзьями и станьте причиной добра.",
  },
  id: {
    reciter: "🎧 Qari",
    studio: "🎬 Produksi: Nûr Studio.com · Islamic Labs",
    quote: '"Dan janganlah kamu mengikuti sesuatu yang tidak kamu ketahui." (Al-Isra 17:36)',
    cta: "Bagikan ayat ini kepada temanmu dan jadilah perantara kebaikan.",
  },
  ur: {
    reciter: "🎧 قاری",
    studio: "🎬 پروڈکشن: Nûr Studio.com · Islamic Labs",
    quote: '"اور اس چیز کے پیچھے نہ پڑ جس کا تجھے علم نہیں۔" (الاسراء ۱۷:۳۶)',
    cta: "اس آیت کو دوستوں کے ساتھ شیئر کریں اور نیکی کا ذریعہ بنیں۔",
  },
  fa: {
    reciter: "🎧 قاری",
    studio: "🎬 تولید: Nûr Studio.com · Islamic Labs",
    quote: '"و از آنچه به آن علم نداری پیروی مکن." (اسراء ۱۷:۳۶)',
    cta: "این آیه را با دوستان خود به اشتراک بگذارید و سبب خیر شوید.",
  },
};

const DESC_EMOTIONAL_LINES: Record<string, string[]> = {
  tr: [
    "Kendini çaresiz, yalnız ve bitkin hisseden her kalp için bir teselli olsun.",
    "Bu ayet sana bugün sadece bir video olarak değil, kalbine inen bir hatırlatma olarak gelsin.",
    "Belki de bu sözler tam da şu an ihtiyacın olan sükûnettir.",
    "Rabbimiz kulunu terk etmez; bazen cevap bir ayetin içinde saklıdır.",
    "İçin daraldığında hatırla: Allah'ın rahmeti sandığından daha yakındır.",
    "Bu tilaveti sonuna kadar dinle; belki kalbinin yükü biraz hafifler.",
    "Eğer bu ayet sana dokunduysa, yorumlara bir 'Amin' bırakmayı unutma.",
    "Bu mesajı ihtiyacı olan birine gönder; belki onun gecesine ışık olur.",
  ],
  en: [
    "May this be a comfort for every heart that feels tired, lonely, or unseen.",
    "Let this verse reach you not as content, but as a reminder for your heart.",
    "Maybe these words are the calm your soul needed today.",
    "Allah does not abandon His servant; sometimes the answer is hidden in a verse.",
    "If this touched you, leave an 'Ameen' and share it with someone who needs it.",
  ],
  ar: [
    "لتكن هذه الآية عزاءً لكل قلب متعب أو وحيد أو مكسور.",
    "لعل هذه الكلمات هي السكينة التي احتاجتها روحك اليوم.",
    "الله لا يترك عبده، وربما تكون الإجابة مخبأة في آية.",
    "إن لامست هذه الآية قلبك فاكتب آمين وشاركها لمن يحتاجها.",
  ],
};

function ayahMoodParagraph(surahName: string, s: number, a: number, lang: string): string {
  const name = `${surahName}`.toLocaleLowerCase("tr");
  if (lang !== "tr") {
    return "If this reminder touched your heart, like the video, leave an Ameen in the comments and share it with someone who may need this peace today.";
  }
  if (s === 93 || name.includes("duh")) {
    return "Rabbin seni terk etmedi ve sana darılmadı... Bu sure, kendini yalnız, kırgın, çaresiz ve tükenmiş hisseden her kalbe inen büyük bir tesellidir. Eğer bugün içinden kimseye anlatamadığın bir yorgunluk geçiyorsa, bu ayeti sadece dinleme; kalbine indir. Bu video sana huzur verdiyse beğen, yorumlara bir 'Amin' bırak ve bu teselliye ihtiyacı olan bir sevdiğinle paylaş.";
  }
  if (s === 94 || name.includes("inşirah") || name.includes("insirah")) {
    return "Her zorluğun yanında mutlaka bir kolaylık vardır. Belki şu an yolun dar, kalbin yorgun, sabrın azalmış olabilir; ama Allah kulunu çaresiz bırakmaz. Bu ayet sana nefes aldırdıysa beğen, yorumlara 'Kolaylık yakındır' yaz ve bu hatırlatmayı bugün morali bozuk olan birine gönder.";
  }
  if (s === 36 || name.includes("yasin")) {
    return "Yâsîn Suresi kalplere şifa, gönüllere sükûnet, evlere bereket olsun. Eğer bu tilavet içini rahatlattıysa beğenmeyi unutma, yorumlara bir 'Amin' bırak ve sevdiğin birine gönder; belki onun da kalbine tam ihtiyacı olan anda dokunur.";
  }
  if (s === 55 || name.includes("rahman")) {
    return "Rabbinin nimetlerini düşünmek bazen insanın kalbini baştan sona değiştirir. Bugün sahip olduklarını fark etmek, şükretmek ve iç huzurunu yeniden bulmak için bu ayeti yavaşça dinle. Kalbine dokunduysa beğen, yorumlara 'Elhamdülillah' yaz ve bu şükür hatırlatmasını paylaş.";
  }
  if (s === 67 || name.includes("mülk") || name.includes("mulk")) {
    return "Mülk Suresi insana dünyanın geçici olduğunu, asıl dönüşün Rabbimize olduğunu hatırlatır. Bu tilavet sana ölümü, ahireti ve kulluğu düşündürdüyse beğen, yorumlara bir dua bırak ve sevdiklerine gönder; belki bir kalbin uyanmasına vesile olur.";
  }
  if (s === 2 && a === 255) {
    return "Ayete'l-Kürsî, kalbe güven veren, insana Allah'ın kudretini ve korumasını hatırlatan en güçlü ayetlerden biridir. Korkuların arttığında, içini vesvese sardığında ve sığınacak bir kapı aradığında bu ayeti dinle. Sana huzur verdiyse beğen, yorumlara 'Allah bize yeter' yaz ve sevdiklerinle paylaş.";
  }
  return "Bu ayet belki de bugün kalbinin tam ihtiyacı olan hatırlatmadır. Kendini yalnız, yorgun veya kırgın hissediyorsan birkaç saniye dur ve bu sözleri kalbinle dinle. Eğer sana huzur verdiyse beğen, yorumlara bir 'Amin' bırak ve sevdiğin birine gönder; belki onun duasına da vesile olursun.";
}

/** ★ Çok dilli, 30 varyantlı açıklama üretici */
export function genDesc(
  surahName = "Bakara Suresi",
  s = 2,
  a = 255,
  reciterName = "Abdurrahman es-Sudays",
  lang = "tr",
): string {
  const introPool = DESC_INTRO[lang] ?? DESC_INTRO.en;
  const L = DESC_LABELS[lang] ?? DESC_LABELS.en;
  const intro = introPool[Math.floor(Math.random() * introPool.length)]
    .replace("{S}", surahName)
    .replace("{N}", String(s))
    .replace("{A}", String(a));

  const emotionPool = DESC_EMOTIONAL_LINES[lang] ?? DESC_EMOTIONAL_LINES.en;
  const emotion = emotionPool[Math.floor(Math.random() * emotionPool.length)];
  const ayahMood = ayahMoodParagraph(surahName, s, a, lang);

  return `${intro}

${L.reciter}: ${reciterName}
${L.studio}

${L.quote}

${emotion}

${ayahMood}

${L.cta}`;
}
