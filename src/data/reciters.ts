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

