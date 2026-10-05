// ════════════════════════════════════════════════════════
// OZEL GUN COK DIL (05.10) — OzelGunTakvimiModal'ın mühim gün
// adları + tema önerileri. KATEGORI ID'LERI (cami, gece, yildizlar...)
// atmosfer motorunun anahtarlarıdır — ASILDIR, çevrilmez.
// ════════════════════════════════════════════════════════

import type { Lang } from "../i18n";

export interface OgGunMetin {
  /** Gün adı (Cuma Günü, Kadir Gecesi...) */
  ad: string;
  /** Üreticilere tema önerisi */
  tema: string;
}

const TR: OgGunMetin[] = [
  { ad: "Cuma Günü", tema: "Cuma: namaz/cami atmosferi + salavat temalı ayet" },
  { ad: "Mevlid Kandili", tema: "Mevlid: rahmet ve sevgi temalı, salavat ağırlıklı video" },
  { ad: "Regaib Kandili", tema: "Regaib: bereket ve dua temalı açılış videosu" },
  { ad: "Miraç Kandili", tema: "Miraç: yükseliş temalı — gökyüzü, yıldız, kubbe atmosferi" },
  { ad: "Berat Kandili", tema: "Berat: temizlenme ve tövbe temalı, gece atmosferi" },
  { ad: "Ramazan Başlangıcı", tema: "Ramazan girişi: imsak/iftar duyuru videosu, iftar daveti" },
  { ad: "Kadir Gecesi", tema: "Kadir Gecesi: 'bin aydan hayırlı' — yıldızlar ve nur atmosferi" },
  { ad: "Arefe (Kurban)", tema: "Arefe: dua ve kıyam temalı, semavi atmosfer" },
];

const EN: OgGunMetin[] = [
  { ad: "Friday", tema: "Friday: prayer/mosque atmosphere + salavat-themed verse" },
  { ad: "Mawlid Night", tema: "Mawlid: mercy and love themed, salawat-focused video" },
  { ad: "Raghaib Night", tema: "Raghaib: abundance and prayer themed opening video" },
  { ad: "Miraj Night", tema: "Miraj: ascension themed — sky, stars, dome atmosphere" },
  { ad: "Baraat Night", tema: "Baraat: purification and repentance themed, night atmosphere" },
  { ad: "Start of Ramadan", tema: "Ramadan opening: imsak/iftar announcement video, iftar invitation" },
  { ad: "Laylat al-Qadr", tema: "Laylat al-Qadr: 'better than a thousand months' — stars and light" },
  { ad: "Arafah (Eid al-Adha)", tema: "Arafah: supplication and standing themed, heavenly atmosphere" },
];

const AR: OgGunMetin[] = [
  { ad: "يوم الجمعة", tema: "الجمعة: أجواء الصلاة/المسجد + آية بطابع الصلاة على النبي" },
  { ad: "ليلة المولد النبوي", tema: "المولد: طابع الرحمة والمحبة، فيديو بكثرة الصلاة على النبي" },
  { ad: "ليلة الرغائب", tema: "الرغائب: فيديو افتتاحي بطابع البركة والدعاء" },
  { ad: "ليلة الإسراء والمعراج", tema: "المعراج: طابع الصعود — سماء ونجوم وقبة" },
  { ad: "ليلة البراءة", tema: "البراءة: طابع التطهر والتوبة، أجواء ليلية" },
  { ad: "بداية رمضان", tema: "دخول رمضان: فيديو إعلان الإمساك/الإفطار، دعوة إفطار" },
  { ad: "ليلة القدر", tema: "ليلة القدر: 'خير من ألف شهر' — نجوم ونور" },
  { ad: "يوم عرفة (الأضحى)", tema: "عرفة: طابع الدعاء والوقوف، أجواء سماوية" },
];

const ID: OgGunMetin[] = [
  { ad: "Hari Jumat", tema: "Jumat: suasana shalat/masjid + ayat bertema salawat" },
  { ad: "Malam Maulid", tema: "Maulid: bertema rahmat dan cinta, video dengan salawat" },
  { ad: "Malam Ragaib", tema: "Ragaib: video pembuka bertema keberkahan dan doa" },
  { ad: "Malam Isra Mi'raj", tema: "Mi'raj: bertema keangkatan — langit, bintang, kubah" },
  { ad: "Malam Nisfu Sya'ban", tema: "Nisfu Sya'ban: bertema penyucian dan taubat, suasana malam" },
  { ad: "Awal Ramadan", tema: "Pembuka Ramadan: video pengumuman imsak/iftar, undangan iftar" },
  { ad: "Lailatul Qadar", tema: "Lailatul Qadar: 'lebih baik dari seribu bulan' — bintang dan cahaya" },
  { ad: "Arafah (Kurban)", tema: "Arafah: bertema doa dan wukuf, suasana langit" },
];

const UR: OgGunMetin[] = [
  { ad: "جمعہ کا دن", tema: "جمعہ: نماز/مسجد کا ماحول + درود تھیم والی آیت" },
  { ad: "عید میلاد کی رات", tema: "میلاد: رحمت اور محبت کی تھیم، درود پر مبنی ویڈیو" },
  { ad: "لائلۃ الرغائب", tema: "رغائب: برکت اور دعا کی تھیم والا افتتاحی ویڈیو" },
  { ad: "شب معراج", tema: "معراج: معراج کی تھیم — آسمان، ستارے، گنبد" },
  { ad: "شب برات", tema: "برات: پاکیزگی اور توبہ کی تھیم، رات کا ماحول" },
  { ad: "رمضان کا آغاز", tema: "رمضان کا آغاز: سحری/افطار اعلان ویڈیو، افطار دعوت" },
  { ad: "شب قدر", tema: "شب قدر: 'ہزار مہینوں سے بہتر' — ستارے اور نور" },
  { ad: "یوم عرفہ (قربان)", tema: "عرفہ: دعا اور وقوف کی تھیم، آسمانی ماحول" },
];

export const OG_GUNLER_COKDIL: Record<Lang, OgGunMetin[]> = { tr: TR, en: EN, ar: AR, id: ID, ur: UR };
