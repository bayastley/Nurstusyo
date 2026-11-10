// ★ 26.10 — kategoriCokDil.ts bozuk satır düzeltmesi
import fs from "node:fs";

const DOSYA = "src/data/kategoriCokDil.ts";
let s = fs.readFileSync(DOSYA, "utf8");

const degistir = [
  // 1) bozuk emoji token → doğru emoji (tüm tablo)
  ["🎞️", "🎞️"],
  // 2) satır bazlı metin düzeltmeleri (ar/id/ur değerleri)
  ["ar: \"🎞️ حافت النخييل\",  id: \"🎞️ Kagas Daun Kurma\",    ur: \"🎞️ کھجور کی شاخیں\"", "ar: \"🎞️ غصون النخيل\",   id: \"🎞️ Cabang Pohon Kurma\", ur: \"🎞️ کھجور کی شاخیں\""],
  ["id: \"🎞ً Lembah Ngawi\",    ur: \"🎞ً گہرے گھاٹی\"", "id: \"🎞️ Jalur Ngarai Dalam\", ur: \"🎞️ گہری گھاٹیاں\""],
  ["id: \"🎞️ Rasi Bintang\",        ur: \"🎞ں ستاروں کے ترب\"", "id: \"🎞️ Rasi Bintang\",        ur: \"🎞️ ستاروں کے جھرمٹ\""],
  ["ar: \"🎞️ الطين المشوي والفخار\", id: \"🎞️ Tanah Bakar & Tembikar\", ur: \"🎞ں پکائی ہوئی مٹی اور فنجم\"", "ar: \"🎞️ الطين المشوي والفخار\", id: \"🎞️ Tanah Bakar & Tembikar\", ur: \"🎞️ پکی مٹی اور مٹی کے برتن\""],
  ["ar: \"🎞️ خل$Iق الإنسان في الجرين\""], // guard (yoksa atlanır)
  ["خلق الإنسان في الجرين", "خلق الإنسان في الجنين"],
  ["ar: \"🎞️ الرجل الشيخوب\"", "ar: \"🎞️ رجل شيخ\""],
  ["ur: \"🎞ں چرتے ہوئے بھیڑ بکریں\"", "ur: \"🎞️ چرتے مالِ مویشی اور بھیڑ بکریاں\""],
  ["ar: \"🎞️ الترس والدرع الحديدية\", id: \"🎞️ Perisai Besi & Zirah\", ur: \"🎞️ لوحے ور زرع\"", "ar: \"🎞️ الترس والدرع الحديدية\", id: \"🎞️ Perisai Besi & Zirah\", ur: \"🎞️ لوہے کی ڈھال اور زرہ\""],
  ["ur: \"🎞️ یوسف اور گہرا کویاں\"", "ur: \"🎞️ یوسف اور گہری کنوئیں\""],
  ["ar: \"🎞️ الغار والنِعة\", id: \"🎞️ Goang & bowl\", ur: \"🎞️ غار ور کیجز\"", "ar: \"🎞️ الكهف والقدح\",   id: \"🎞️ Gua & Mangkuk\",      ur: \"🎞️ غار اور پیالی\""],
  ["ar: \"🎞️ كنوز قارون الزئب\", id: \"🎞️ Harta Karun Zair\", ur: \"🎞️ قارون کے خزانے زر\"", "ar: \"🎞️ كنوز قارون الذهبية\", id: \"🎞️ Harta Karun Qarun\",   ur: \"🎞️ قارون کے خزائنِ زر\""],
  ["ur: \"🎞️ برقی چشمے\"", "ur: \"🎞ں پگھلا ہوا تانبا چشمہ\""],
  ["id: \"🎞️ Mungo di Mata Air\", ur: \"🎞️ صحرا میں چبک\"", "id: \"🎞️ Kadal di Gurun\", ur: \"🎞️ صحرا میں چھپکلی\""],
  ["ur: \"🎞️ پرتے حور جتوا\"", "ur: \"🎞️ پرواز کرتا ٹڈی دل\""],
  ["ar: \"🎞️ مور pháse القمر\", id: \"🎞️ Fase & Orbit Bulan\", ur: \"🎞️ چاندر کی مرقه\"", "ar: \"🎞️ مراحل القمر ومداره\", id: \"🎞️ Fase & Orbit Bulan\", ur: \"🎞️ چاند کی حالتیں اور مدار\""],
  ["ur: \"🎞️ محل شاندار کے اندر و بر\"", "ur: \"🎞️ شاندار محل کا اندرونی حصہ\""],
  ["ur: \"🎞️ محشر ور انساں کے جم\"", "ur: \"🎞️ محشر اور انساں کا ہجوم\""],
  ["ar: \"🎞️ مذرة الشهاب\", id: \"🎞️ Hujan Meteor\", ur: \"🎞️ شہاب بجال\"", "ar: \"🎞️ مطر الشهب\",    id: \"🎞️ Hujan Meteor\",      ur: \"🎞️ شہابِ باراں\""],
  ["ar: \"🎞️ خام الحديد Rivers\", id: \"🎞️ Bijih Besi Cair\", ur: \"🎞️ گرم دھات\"", "ar: \"🎞️ خام الحديد المصهور\", id: \"🎞️ Bijih Besi Cair\", ur: \"🎞️ پگھلی ہوئی دھات\""],
  ["ar: \"🎞️ الحبل EL\", id: \"🎞️ Tanah Subur\", ur: \"🎞️ زرخیز مٹی\"", "ar: \"🎞️ التربة الطينية الخصبة\", id: \"🎞️ Tanah Subur\", ur: \"🎞️ زرخیز مٹی\""],
  ["ar: \"🎞️ الللَّالدّ\", id: \"🎞️ Biji Sawi\", ur: \"🎞️ رائی بزری\"", "ar: \"🎞️ حبة الخردل\",   id: \"🎞️ Biji Αrdi\",      ur: \"🎞️ رائی کا دانا\""],
  ["ar: \"🎞️ الأشجار الراطون\", id: \"🎞️ Pokeaht Zaitun\", ur: \"🎞️ زیتون جنگل\"", "ar: \"🎞️ أشجار الزيتون\",    id: \"🎞️ Kebun Zaitun\",     ur: \"🎞️ زیتون کا جنگل\""],
  ["ar: \"🎞️ الجنّة وpurely\", id: \"🎞️ Taman dan Istana Surga\", ur: \"🎞️ باغستان ور مبارک بحیر\"", "ar: \"🎞️ حدائق وقصور الجنة\", id: \"🎞️ Taman dan Istana Surga\", ur: \"🎞️ بہشت کے باغ اور محل\""],
  ["ar: \"🎞️ أنهار الجنة والحق'\", id: \"🎞️ Sungai Surga\", ur: \"🎞️ بہشت کے ندیاں\"", "ar: \"🎞️ أنهار الجنة والحلیب\", id: \"🎞️ Sungai Surga\",      ur: \"🎞️ بہشت کے ندیاں\""],
  ["ar: \"🎞️ اللؤلؤ والمرزان\"", "ar: \"🎞️ اللؤلؤ والمرجان\""],
  ["ar: \"🎞️ القلم والحير\", id: \"🎞️ Canti dan Warna\", ur: \"🎞️ لاوترلم یکن مصحف\"", "ar: \"🎞️ القلم والحبر\",    id: \"🎞️ Kalam & Tinta\",    ur: \"🎞️ قلم اور سیاہی\""],
  ["en: \"🎞️ Islamic Praying Hands\", ar: \"🎞️ يدان ترفعان بالدعاء\", id: \"🎞️ Tangan Berdoa Islami\", ur: \"🎞️ دعا کے لیے اٹھے ہوئے ہاتھ\", "en: \"🎞️ Islamic Praying Hands\", ar: \"🎞️ يدان ترفعان بالدعاء\", id: \"🎞️ Tangan Berdoa Islami\", ur: \"🎞️ دعا کے لیے اٹھے ہوئے ہاتھ\"],
  ["id: \"🎞️ Wajah Sesali\", ur: \"🎞️ غمگین ور پیچھے ماندہ چہرہ\"", "id: \"🎞️ Wajah Menyesal\", ur: \"🎞️ غمگین چہرہ\""],
  ["en: \"🎞️ inteligentes Hewers\", ar: \"🎞️ الصخر المنهوب_loading\", id: \"🎞️ inhabited Mars Registry\", ur: \"🎞️ پنجرئے وِ کارگین اور پتھر پلising\"", "en: \"🎞️ Houses Carved in Rock\", ar: \"🎞️ بيوت محفورة في الصخر\", id: \"🎞️ Rumah Berukir Batu\", ur: \"🎞️ پتھر میں کندہ گھر\""],
  ["ar: \"🎞️ سبع السماء Blend\", id: \"🎞️ Lapisan Tuju langit\", ur: \"🎞️ آسمان کی سات پرتں\"", "ar: \"🎞️ سبع طبقات الجو\", id: \"🎞️ Tujuh Lapis Atmosfer\", ur: \"🎞️ آسمان کی سات پرتیں\""],
  ["ar: \"🎞️ الوجوه الستّئ والفرح\", id: \"🎞️ Ruby Beaming Dan'T\", ur: \"🎞️ چمکاتے چہرے ور خوشی\"", "ar: \"🎞️ الوجوه المشرقة والفرح\", id: \"🎞️ Wajah Berseri & Gembira\", ur: \"🎞️ چمکتے چہرے اور خوشی\""],
  ["id: \"🎞️ pani Kellweer\", ur: \"🎞️ لوح rumored\"", "id: \"🎞️ Kain Sutra\",       ur: \"🎞️ ریشم کا کپڑا\""],
  ["en: \"🎞️ Silver چا\", ar: \"🎞️ Gall\", id: \"🎞️ Kel\", ur: \"🎞️ گیمسج\"", "en: \"🎞️ Silver Goblets & Crystal\", ar: \"🎞️ كؤوس الفضة والكربستال\", id: \"🎞️ Cawan Perak & Kristal\", ur: \"🎞️ چاندی کے پیالے اور کرسٹل\""],
  ["id: \"🎞️ Langit Ber`) و Lag\", ur: \"🎞️ دہوا ور sabat\"", "id: \"🎞️ Langit Berasap & Berkabut\", ur: \"🎞️ دھوا اور دھند آسمان\""],
  ["id: \"🎞️ Laba-laba & Rumah Retak\", ur: \"🎞️ مکڑی ور گرایڑا\"", "id: \"🎞️ Laba-laba & Sarang Lapuk\", ur: \"🎞️ مکڑی اور گرایا گھر\""],
  ["id: \"🎞️ Tunas Semut\"", "id: \"🎞️ Benih yang Bertunas\""],
  ["ar: \"🎞️ البحر المتعثري\", id: \"🎞️ Laut و Kabe\", ur: \"🎞️ طوي طوفانی ور کشتی\"", "ar: \"🎞️ البحر العاصف\",    id: \"🎞️ Laut Badai & Perahu\", ur: \"🎞️ طوفانی سمندر اور کشتی\""],
  ["ar: \"🎞️ إسواس البعوض\", id: \"🎞️ Kawanan Nyanyuk\", ur: \"🎞️ مچھر کی جشت\"", "ar: \"🎞️ أسراب البعوض\",    id: \"🎞️ Kawanan Nyamuk\",    ur: \"🎞️ مچھروں کا جھنڈ\""],
  ["en: \"🎞️ Tectj He\", ur: \"🎞️ تختی\",\"ar\": \"🎞️ الصفائح التكتوني\"], \"id\": \"🎞️ RetakТ_tls\"}", "en: \"🎞️ Tectonic Plates\", ar: \"🎞️ الصفائح التكتونية\", id: \"🎞️ Pelat Tektonik\", ur: \"🎞️ تکتونی پلیٹیں\""],
  ["ar: \"🎞️ المرjَ البحرين\", id: \"🎞️ Pertemuan Dua Laut\", ur: \"🎞️ی دو سمندر کا ملاق\"", "ar: \"🎞️ لقاء البحرين\", id: \"🎞️ Pertemuan Dua Laut\", ur: \"🎞️ دو سمندروں کا ملنا\""],
  ["id: \"🎞️ Gua زیر\", ur: \"🎞️ی زمینی غار\"", "id: \"🎞️ Gua Bawah Tanah\", ur: \"🎞️ زمینی غار\""],
  ["id: \"🎞️ Arus Laut Gos\", ur: \"🎞️ی اندیں نریں\"", "id: \"🎞️ Arus Laut Gelap\", ur: \"🎞️ گہری تاریک پانی کی روئیں\""],
  ["ur: \"🎞️ی کائنات وسعت\"", "ur: \"🎞️ پھیلتی کائنات\""],
  ["ur: \"🎞️ی حوض ور گہ\"", "ur: \"🎞️ پانی کا کنواں اور گہرائی\""],
  ["ur: \"🎞️ی پانی دا چکر\"", "ur: \"🎞️ پانی کا سائیکل اور بادل\""],
  ["ur: \"🎞️ی سوکت پنچ\"", "ur: \"🎞️ سوکھی گھاس\""],
  ["ar: \"🎞️ عويّ الذئب في الليل\", id: \"🎞️ Serigala Berteriak Malam\", ur: \"🎞️ی بکون دل بلا\"", "ar: \"🎞️ هدير الذئب في الليل\", id: \"🎞️ Serigala Melolong Malam\", ur: \"🎞️ رات میں بھونکنے والا بھیڑیا\""],
  ["ar: \"🎞️ الحشر جهنم\", id: \"🎞️ Pohon Zaqqum\", ur: \"🎞️ی زقوم جہنمی\"", "ar: \"🎞️ شجرة الزقوم\",    id: \"🎞️ Pohon Zaqqum\",      ur: \"🎞️ زقوم جہنم کا درخت\""],
  ["ur: \"🎞️ سليمان کا ہدیہ\"", "ur: \"🎞️ سلیمن کا ہُد ہُد\""],
  ["ar: \"🎞️ الأيادی نحو السماء\"", "ar: \"🎞️ الأيادی إلی السماء\""],
  ["id: \"🎞️ Mata Air Tembaga Cair\", ur: \"🎞️ گرم چشمہ اس\"", "id: \"🎞️ Mata Air Tembaga Cair\", ur: \"🎞️ پگھل تمبا چشمہ\""],
];

let sayac = 0;
for (const [eski, yeni] of degistir) {
  if (!yeni) continue; // guard satırları
  if (!s.includes(eski)) { console.warn("⚠ atlandı:", eski.slice(0, 60)); continue; }
  s = s.replace(eski, yeni);
  sayac++;
}
fs.writeFileSync(DOSYA, s);
console.log(`✔ ${sayac} düzeltme uygulandı.`);
// kalan muhtemel bozuklar
const kalan = (s.match(/🎞️||/g) || []).length;
console.log("kalan bozuk emoji:", kalan > 0 ? s.match(/[^\x00-\x7F\u0400-\u04FF\u0600-\u06FF\u0900-\u097F\u0370-\u03FF\u0590-\u05FF\u1F300-\u1FAFF\u2600-\u27BF\uFE70-\uFEFF\u060C\u061F\u200C-\u200F\u00A0-\u00FF\u2000-\u206F]/g)?.filter(c => !/[ğüşıöçİĞÜŞÖÇەاآأإبپتثجچحخدذرزژسشصضطظعغفقکگلمنوهیھیٰءۀﷲﷺًٌٍَُِّْٰٓۓ Cricket]/u.test(c)).slice(0, 30) : "YOK");
