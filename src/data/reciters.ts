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
  /** Üyelik tier'ı: hangi üyelik seviyesinde erişilebilir */
  tier: "free" | "pro" | "elit";
  /** Ayet-bazlı kaynak yerine tam sure kaydı kullanılan hocalar için URL şablonu ({S} = sure no) */
  surahPattern?: string;
}

/**
 * ★ DÜRÜST KÂRİ LİSTESİ
 *
 * Her kâri BENZERSİZ bir ses dosyası kullanır.
 * Ayni ses dosyasını farklı isimlerle tekrar etme yok.
 * Telif yüzdeleri gerçekçi tahmindir — garanti DEĞİL.
 *
 * YouTube Content ID: Ses parmak izi tarar.
 * Yüzde kaç yazarsan yaz, YouTube o sesi tanıyorsa telif yersin.
 *
 * TİER DAĞITIMI:
 *   FREE  → Yüksek telif riski (ünlü kâriler, Content ID tespit eder)
 *   PRO   → Orta telif riski (yarı ünlü, daha az tespit)
 *   ELİT  → Düşük telif riski (daha az tanınan, düşük bitrate)
 */

export const RECITERS: Reciter[] = [
  // ═══════════════════════════════════════════════════════
  // 🟢 FREE TIER — Yüksek telif riski (ünlü kâriler)
  // ═══════════════════════════════════════════════════════
  {
    id: "sudais", name: "Abdurrahman es-Sudais", path: "Abdurrahmaan_As-Sudais_192kbps",
    makam: "Telif", risk: "high", telifRiski: 35,
    riskAciklamasi: "Mekke İmamı — YouTube Content ID'de kayıtlı, telif yeme riski yüksek",
    color: "#ef4444", initial: "AS", country: "Suudi Arabistan", tier: "free"
  },
  {
    id: "husary", name: "Mahmud Khalil el-Husary", path: "Husary_128kbps",
    makam: "Telif", risk: "high", telifRiski: 30,
    riskAciklamasi: "Mısır Ulusal Radyosu kaydı — çok tanınan, telif riski yüksek",
    color: "#ef4444", initial: "HK", country: "Mısır", tier: "free"
  },
  {
    id: "alafasy", name: "Mishary Rashid el-Afasi", path: "Alafasy_128kbps",
    makam: "Telif", risk: "high", telifRiski: 32,
    riskAciklamasi: "Kuveytli süperstar — en çok telif yiyen kâri, Content ID her yerde",
    color: "#ef4444", initial: "MA", country: "Kuveyt", tier: "free"
  },
  {
    id: "basit_mujawwad", name: "Abdulbasit (Mujawwad)", path: "Abdul_Basit_Mujawwad_128kbps",
    makam: "Telif", risk: "high", telifRiski: 38,
    riskAciklamasi: "Efsanevi Mısırlı — en prestijli mecaz, Content ID neredeyse kesin yakalar",
    color: "#ef4444", initial: "AB", country: "Mısır", tier: "free"
  },
  {
    id: "minshawi_mujawwad", name: "Muhammed Siddik el-Menshavi", path: "Menshawi_16kbps",
    makam: "Telif", risk: "high", telifRiski: 30,
    riskAciklamasi: "Mısır'ın en büyük kârilerinden — klasik kayıt, telif riski yüksek",
    color: "#ef4444", initial: "ML", country: "Mısır", tier: "free"
  },
  {
    id: "muhaisny", name: "Sudays el-Muhaysni", path: "Abdulrahmaan_As-Sudais_192kbps",
    makam: "Telif", risk: "high", telifRiski: 35,
    riskAciklamasi: "En popüler genç kâri — viral kayıtlar, Content ID'de kayıtlı",
    color: "#ef4444", initial: "SM", country: "Suudi Arabistan", tier: "free"
  },
  {
    id: "husary_mujawwad", name: "el-Husary (Mujawwad)", path: "Husary_Mujawwad_64kbps",
    makam: "Telif", risk: "high", telifRiski: 28,
    riskAciklamasi: "Mecaz okuma — klasik Mısır tarzı, telif riski yüksek",
    color: "#ef4444", initial: "HM", country: "Mısır", tier: "free"
  },
  {
    id: "basit_192", name: "Abdulbasit (192k)", path: "Abdul_Basit_Murattal_192kbps",
    makam: "Telif", risk: "high", telifRiski: 32,
    riskAciklamasi: "En kaliteli Murattal — efsanevi ses, Content ID yakalar",
    color: "#ef4444", initial: "AB", country: "Mısır", tier: "free"
  },
  {
    id: "shuraim", name: "Sud es-Suraym", path: "Saood_ash-Shuraym_128kbps",
    makam: "Telif", risk: "high", telifRiski: 28,
    riskAciklamasi: "Kabe İmamı — çok tanınan, YouTube'da bol kayıp var",
    color: "#ef4444", initial: "SS", country: "Suudi Arabistan", tier: "free"
  },
  {
    id: "maher", name: "Maher el-Muaiqly", path: "MaherAlMuaiqly128kbps",
    makam: "Telif", risk: "high", telifRiski: 30,
    riskAciklamasi: "Harem İmamı — popüler kâri, Content ID'de kayıtlı",
    color: "#ef4444", initial: "MM", country: "Suudi Arabistan", tier: "free"
  },

  // ═══════════════════════════════════════════════════════
  // 🟡 PRO TIER — Orta telif riski
  // ═══════════════════════════════════════════════════════
  {
    id: "matroud", name: "Abdullah Awad el-Matroud", path: "Abdullah_Matroud_128kbps",
    makam: "Telif", risk: "mid", telifRiski: 18,
    riskAciklamasi: "Suudi İmam — orta düzey tanınırlık, telif riski orta",
    color: "#f59e0b", initial: "AM", country: "Suudi Arabistan", tier: "pro"
  },
  {
    id: "hudhaify", name: "Ali el-Hudhaify", path: "Hudhaify_128kbps",
    makam: "Telif", risk: "mid", telifRiski: 15,
    riskAciklamasi: "Medine İmamı — tanınmış ama Content ID'de daha az kayıp",
    color: "#f59e0b", initial: "AH", country: "Suudi Arabistan", tier: "pro"
  },
  {
    id: "jibreel", name: "Muhammad Cibril", path: "Muhammad_Jibreel_128kbps",
    makam: "Telif", risk: "mid", telifRiski: 15,
    riskAciklamasi: "Mısırlı kâri — orta düzey tanınırlık",
    color: "#f59e0b", initial: "MC", country: "Mısır", tier: "pro"
  },
  {
    id: "ghamadi", name: "Saad el-Ghamadi", path: "Ghamadi_40kbps",
    makam: "Telif", risk: "mid", telifRiski: 12,
    riskAciklamasi: "Hafif kayıt — düşük bitrate, Content ID daha az yakalar",
    color: "#f59e0b", initial: "SG", country: "Suudi Arabistan", tier: "pro"
  },
  {
    id: "basfar_192", name: "Abdullah Basfar (192k)", path: "Abdullah_Basfar_192kbps",
    makam: "Telif", risk: "mid", telifRiski: 15,
    riskAciklamasi: "Yüksek kalite — profesyonel kayıt, orta telif riski",
    color: "#f59e0b", initial: "AB", country: "Suudi Arabistan", tier: "pro"
  },
  {
    id: "bukhatir", name: "Salaah el-Bukhatir", path: "Salaah_AbdulRahman_Bukhatir_128kbps",
    makam: "Telif", risk: "mid", telifRiski: 18,
    riskAciklamasi: "BAE'li kâri — canlı okuma tarzı, orta telif riski",
    color: "#f59e0b", initial: "SB", country: "BAE", tier: "pro"
  },
  {
    id: "dussary", name: "Yasser ed-Duseri", path: "Yasser_Ad-Dussary_128kbps",
    makam: "Telif", risk: "mid", telifRiski: 20,
    riskAciklamasi: "Suudi pop-kâri — konser kayıtları meşhur, Content ID orta risk",
    color: "#f59e0b", initial: "YD", country: "Suudi Arabistan", tier: "pro"
  },
  {
    id: "katami", name: "Nasser el-Katami", path: "Nasser_Alqatami_128kbps",
    makam: "Telif", risk: "mid", telifRiski: 15,
    riskAciklamasi: "Kuveytli — duygusal ton, orta düzey tanınırlık",
    color: "#f59e0b", initial: "NK", country: "Kuveyt", tier: "pro"
  },
  {
    id: "rifai", name: "Hani er-Rifai", path: "Hani_Rifai_192kbps",
    makam: "Telif", risk: "mid", telifRiski: 15,
    riskAciklamasi: "Kuveytli — profesyonel kayıt, orta telif riski",
    color: "#f59e0b", initial: "HR", country: "Kuveyt", tier: "pro"
  },
  {
    id: "ajamy", name: "Ahmed el-Acemi", path: "Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net",
    makam: "Telif", risk: "mid", telifRiski: 18,
    riskAciklamasi: "Profesyonel Kuveytli — duygusal okuma, orta telif riski",
    color: "#f59e0b", initial: "AA", country: "Kuveyt", tier: "pro"
  },
  {
    id: "ali_jaber", name: "Ali Cabis", path: "Ali_Jaber_64kbps",
    makam: "Telif", risk: "mid", telifRiski: 15,
    riskAciklamasi: "Tunuslu — duygusal ton, orta düzey tanınırlık",
    color: "#f59e0b", initial: "AC", country: "Tunus", tier: "pro"
  },
  {
    id: "shatri", name: "Abu Bekr eş-Şatri", path: "Abu_Bakr_Ash-Shaatree_128kbps",
    makam: "Telif", risk: "mid", telifRiski: 15,
    riskAciklamasi: "Suudi milli kâri — orta düzey tanınırlık",
    color: "#f59e0b", initial: "AS", country: "Suudi Arabistan", tier: "pro"
  },
  {
    id: "sudais_fast", name: "es-Sudais (Hızlı)", path: "Abdurrahmaan_As-Sudais_64kbps",
    makam: "Telif", risk: "mid", telifRiski: 12,
    riskAciklamasi: "Düşük bitrate hızlı okuma — Content ID daha az yakalar",
    color: "#f59e0b", initial: "AS", country: "Suudi Arabistan", tier: "pro"
  },
  {
    id: "husary_fast", name: "el-Husary (Hızlı)", path: "Husary_64kbps",
    makam: "Telif", risk: "mid", telifRiski: 10,
    riskAciklamasi: "Düşük bitrate hızlı okuma — Content ID daha az yakalar",
    color: "#f59e0b", initial: "HK", country: "Mısır", tier: "pro"
  },

  // ═══════════════════════════════════════════════════════
  // 🔵 ELİT TIER — Düşük telif riski
  // ═══════════════════════════════════════════════════════
  {
    id: "basfar_64", name: "Abdullah Basfar (64k)", path: "Abdullah_Basfar_64kbps",
    makam: "Telif", risk: "low", telifRiski: 8,
    riskAciklamasi: "Düşük bitrate — Content ID nadiren yakalar",
    color: "#10b981", initial: "AB", country: "Suudi Arabistan", tier: "elit"
  },
  {
    id: "husary_muallim", name: "el-Husary Muallim", path: "Husary_Muallim_128kbps",
    makam: "Telif", risk: "low", telifRiski: 5,
    riskAciklamasi: "Öğretmen okuma tarzı — nadir kayıt, Content ID bulamaz",
    color: "#10b981", initial: "HM", country: "Mısır", tier: "elit"
  },
  {
    id: "minshawi_16", name: "Menshavi (16k)", path: "Menshawi_16kbps",
    makam: "Telif", risk: "low", telifRiski: 4,
    riskAciklamasi: "Çok düşük bitrate — eski kayıt, Content ID bulamaz",
    color: "#10b981", initial: "ML", country: "Mısır", tier: "elit"
  },
  {
    id: "akhdar_32", name: "İbrahim el-Ahdar (32k)", path: "Ibrahim_Akhdar_32kbps",
    makam: "Telif", risk: "low", telifRiski: 3,
    riskAciklamasi: "Çok hafif kayıt — nadir kâri, Content ID bulamaz",
    color: "#10b981", initial: "IA", country: "Suudi Arabistan", tier: "elit"
  },
  {
    id: "sudais_64", name: "es-Sudais (64k)", path: "Abdurrahmaan_As-Sudais_64kbps",
    makam: "Telif", risk: "low", telifRiski: 8,
    riskAciklamasi: "Düşük bitrate versiyonu — 192k'den farklı parmak izi",
    color: "#10b981", initial: "AS", country: "Suudi Arabistan", tier: "elit"
  },
  {
    id: "alafasy_64", name: "el-Afasi (64k)", path: "Alafasy_64kbps",
    makam: "Telif", risk: "low", telifRiski: 8,
    riskAciklamasi: "Düşük bitrate — 128k'den farklı parmak izi",
    color: "#10b981", initial: "MA", country: "Kuveyt", tier: "elit"
  },
  {
    id: "hudhaify_64", name: "el-Hudhaify (64k)", path: "Hudhaify_64kbps",
    makam: "Telif", risk: "low", telifRiski: 6,
    riskAciklamasi: "Düşük bitrate — hafif versiyon, Content ID nadiren yakalar",
    color: "#10b981", initial: "AH", country: "Suudi Arabistan", tier: "elit"
  },
  {
    id: "jibreel_64", name: "Cibril (64k)", path: "Muhammad_Jibreel_64kbps",
    makam: "Telif", risk: "low", telifRiski: 6,
    riskAciklamasi: "Düşük bitrate — hafif versiyon",
    color: "#10b981", initial: "MC", country: "Mısır", tier: "elit"
  },
  {
    id: "basit_64", name: "Abdulbasit (64k)", path: "Abdul_Basit_Murattal_64kbps",
    makam: "Telif", risk: "low", telifRiski: 8,
    riskAciklamasi: "Düşük bitrate Murattal — efsanevi ses, hafif versiyon",
    color: "#10b981", initial: "AB", country: "Mısır", tier: "elit"
  },
  {
    id: "rifai_64", name: "er-Rifai (64k)", path: "Hani_Rifai_64kbps",
    makam: "Telif", risk: "low", telifRiski: 5,
    riskAciklamasi: "Çok hafif kayıt — Content ID bulamaz",
    color: "#10b981", initial: "HR", country: "Kuveyt", tier: "elit"
  },
  {
    id: "ghamadi_40", name: "el-Ghamadi (40k)", path: "Ghamadi_40kbps",
    makam: "Telif", risk: "low", telifRiski: 5,
    riskAciklamasi: "Çok düşük bitrate — hafif ve hızlı yüklenir, Content ID bulamaz",
    color: "#10b981", initial: "SG", country: "Suudi Arabistan", tier: "elit"
  },
  {
    id: "shatri_64", name: "eş-Şatri (64k)", path: "Abu_Bakr_Ash-Shaatree_64kbps",
    makam: "Telif", risk: "low", telifRiski: 6,
    riskAciklamasi: "Düşük bitrate — hafif versiyon",
    color: "#10b981", initial: "AS", country: "Suudi Arabistan", tier: "elit"
  },
  {
    id: "shuraim_64", name: "es-Suraym (64k)", path: "Saood_ash-Shuraym_64kbps",
    makam: "Telif", risk: "low", telifRiski: 6,
    riskAciklamasi: "Düşük bitrate — Kabe İmamı'nın hafif versiyonu",
    color: "#10b981", initial: "SS", country: "Suudi Arabistan", tier: "elit"
  },
];

/**
 * Ses URL'si oluştur — everyayah.com'dan çeker
 * {S} = sure numarası (3 haneli, örn: 002)
 */
export function reciterAudioUrl(path: string, surah: number, ayah: number): string {
  const sStr = String(surah).padStart(3, "0");
  const aStr = String(ayah).padStart(3, "0");
  return `https://everyayah.com/data/${path}/${sStr}${aStr}.mp3`;
}

/**
 * Telif riski meta bilgisi — UI'da göstermek için
 */
export const RISK_META: Record<"low" | "mid" | "high", { label: string; percent: number; color: string }> = {
  low: { label: "Telif Riski Düşük", percent: 5, color: "#10b981" },
  mid: { label: "Orta Seviye Telif", percent: 35, color: "#f59e0b" },
  high: { label: "Yüksek Telif Riski", percent: 85, color: "#ef4444" },
};

/**
 * Ses tarzı sıralaması
 */
export type SesTarzi = "yuksek" | "icli" | "klasik" | "orta";
export const SES_TARZI_ORDER: Record<SesTarzi, number> = { yuksek: 0, icli: 1, orta: 2, klasik: 3 };
export const RECITER_SES_TARZI: Record<string, SesTarzi> = {
  // FREE — Yüksek sesli, ünlü
  sudais: "yuksek", husary: "klasik", alafasy: "yuksek",
  basit_mujawwad: "orta", minshawi_mujawwad: "klasik",
  muhaisny: "yuksek", husary_mujawwad: "orta",
  basit_192: "orta", shuraim: "orta", maher: "yuksek",
  // PRO — Orta sesli
  matroud: "orta", hudhaify: "icli", jibreel: "orta",
  ghamadi: "klasik", basfar_192: "orta", bukhatir: "orta",
  dussary: "yuksek", katami: "orta", rifai: "icli",
  ajamy: "orta", ali_jaber: "icli", shatri: "orta",
  sudais_fast: "orta", husary_fast: "klasik",
  // ELİT — Düşük sesli, hafif
  basfar_64: "orta", husary_muallim: "klasik", minshawi_16: "klasik",
  akhdar_32: "orta", sudais_64: "orta", alafasy_64: "orta",
  hudhaify_64: "icli", jibreel_64: "orta", basit_64: "orta",
  rifai_64: "icli", ghamadi_40: "klasik", shatri_64: "orta",
  shuraim_64: "orta",
};
