// ★ 26.10 — kategoriCokDil.ts bozuk satır düzeltmesi
import fs from "node:fs";

const DOSYA = "src/data/kategoriCokDil.ts";
let s = fs.readFileSync(DOSYA, "utf8");

const degistir = [
  // 1) bozuk emoji token → doğru emoji (tüm tablo)
  ["演讲", "🎞️"],
  // 2) satır bazlı metin düzeltmeleri (ar/id/ur değerleri)
  ["ar: \"🎞️ حافت النخييل\",  id: \"🎞️ Kagas Daun Kurma\",    ur: \"🎞️ کھجور کی شاخیں\"", "ar: \"🎞️ غصون النخيل\",   id: \"🎞️ Cabang Pohon Kurma\", ur: \"🎞️ کھجور کی شاخیں\""],
  ["id: \"🎞ً Lembah Ngawi\",    ur: \"🎞ً گہرے گھاٹی\"", "id: \"🎞️ Jalur Ngarai Dalam\", ur: \"🎞️ گہری گھاٹیاں\""],
  ["id: \"🎞️ Rasi Bintang\",        ur: \"🎞ں ستاروں کے ترب\"", "id: \"🎞️ Rasi Bintang\",        ur: \"🎞️ ستاروں کے جھرمٹ\""],
  ["ar: \"🎞️ الطين المشوي والفخار\", id: \"🎞️ Tanah Bakar & Tembikar\", ur: \"🎞ں پکائی ہوئی مٹی اور فنجم\"", "ar: \"🎞️ الطين المشوي والفخار\", id: \"🎞️ Tanah Bakar & Tembikar\", ur: \"🎞️ پکی مٹی اور مٹی کے برتن\""],
  ["ar: \"🎞️ خل$Iق الإنسان في الجرين\""], // guard (yoksa atlanır)
  ["خلق الإنسان في الجرين", "خلق الإنسان في الجنين"],
  ["ar: \"🎞️ الرجل الشيخوب\"", "ar: \"🎞️ رجل شيخ\""],
  ["ur: \"🎞ں چرتے ہوئے بھیڑ بکریں\"", "ur: \"🎞️ چرتے مالِ مویشی اور بھیڑ بکریاں\""],
  ["ar: \"🎞️ الترس والدرع الحديدية\", id: \"🎞️ Perisai Besi & Zirah\", ur: \"演讲 لوحے ور زرع\"", "ar: \"🎞️ الترس والدرع الحديدية\", id: \"🎞️ Perisai Besi & Zirah\", ur: \"🎞️ لوہے کی ڈھال اور زرہ\""],
  ["ur: \"演讲 یوسف اور گہرا کویاں\"", "ur: \"🎞️ یوسف اور گہری کنوئیں\""],
  ["ar: \"演讲 الغار والنِعة\", id: \"演讲 Goang & bowl\", ur: \"演讲 غار ور کیجز\"", "ar: \"🎞️ الكهف والقدح\",   id: \"🎞️ Gua & Mangkuk\",      ur: \"🎞️ غار اور پیالی\""],
  ["ar: \"演讲 كنوز قارون الزئب\", id: \"演讲 Harta Karun Zair\", ur: \"演讲 قارون کے خزانے زر\"", "ar: \"🎞️ كنوز قارون الذهبية\", id: \"🎞️ Harta Karun Qarun\",   ur: \"🎞️ قارون کے خزائنِ زر\""],
  ["ur: \"演讲 برقی چشمے\"", "ur: \"🎞ں پگھلا ہوا تانبا چشمہ\""],
  ["id: \"演讲 Mungo di Mata Air\", ur: \"演讲 صحرا میں چبک\"", "id: \"演讲 Kadal di Gurun\", ur: \"演讲 صحرا میں چھپکلی\""],
  ["ur: \"演讲 پرتے حور جتوا\"", "ur: \"演讲 پرواز کرتا ٹڈی دل\""],
  ["ar: \"演讲 مور pháse القمر\", id: \"演讲 Fase & Orbit Bulan\", ur: \"演讲 چاندر کی مرقه\"", "ar: \"演讲 مراحل القمر ومداره\", id: \"演讲 Fase & Orbit Bulan\", ur: \"演讲 چاند کی حالتیں اور مدار\""],
  ["ur: \"演讲 محل شاندار کے اندر و بر\"", "ur: \"演讲 شاندار محل کا اندرونی حصہ\""],
  ["ur: \"演讲 محشر ور انساں کے جم\"", "ur: \"演讲 محشر اور انساں کا ہجوم\""],
  ["ar: \"演讲 مذرة الشهاب\", id: \"演讲 Hujan Meteor\", ur: \"演讲 شہاب بجال\"", "ar: \"演讲 مطر الشهب\",    id: \"演讲 Hujan Meteor\",      ur: \"演讲 شہابِ باراں\""],
  ["ar: \"演讲 خام الحديد Rivers\", id: \"演讲 Bijih Besi Cair\", ur: \"演讲 گرم دھات\"", "ar: \"演讲 خام الحديد المصهور\", id: \"演讲 Bijih Besi Cair\", ur: \"演讲 پگھلی ہوئی دھات\""],
  ["ar: \"演讲 الحبل EL\", id: \"演讲 Tanah Subur\", ur: \"演讲 زرخیز مٹی\"", "ar: \"演讲 التربة الطينية الخصبة\", id: \"演讲 Tanah Subur\", ur: \"演讲 زرخیز مٹی\""],
  ["ar: \"演讲 الللَّالدّ\", id: \"演讲 Biji Sawi\", ur: \"演讲 رائی بزری\"", "ar: \"演讲 حبة الخردل\",   id: \"演讲 Biji Αrdi\",      ur: \"演讲 رائی کا دانا\""],
  ["ar: \"演讲 الأشجار الراطون\", id: \"演讲 Pokeaht Zaitun\", ur: \"演讲 زیتون جنگل\"", "ar: \"演讲 أشجار الزيتون\",    id: \"演讲 Kebun Zaitun\",     ur: \"演讲 زیتون کا جنگل\""],
  ["ar: \"演讲 الجنّة وpurely\", id: \"演讲 Taman dan Istana Surga\", ur: \"演讲 باغستان ور مبارک بحیر\"", "ar: \"演讲 حدائق وقصور الجنة\", id: \"演讲 Taman dan Istana Surga\", ur: \"演讲 بہشت کے باغ اور محل\""],
  ["ar: \"演讲 أنهار الجنة والحق'\", id: \"演讲 Sungai Surga\", ur: \"演讲 بہشت کے ندیاں\"", "ar: \"演讲 أنهار الجنة والحلیب\", id: \"演讲 Sungai Surga\",      ur: \"演讲 بہشت کے ندیاں\""],
  ["ar: \"演讲 اللؤلؤ والمرزان\"", "ar: \"演讲 اللؤلؤ والمرجان\""],
  ["ar: \"演讲 القلم والحير\", id: \"演讲 Canti dan Warna\", ur: \"演讲 لاوترلم یکن مصحف\"", "ar: \"演讲 القلم والحبر\",    id: \"演讲 Kalam & Tinta\",    ur: \"演讲 قلم اور سیاہی\""],
  ["en: \"演讲 Islamic Praying Hands\", ar: \"演讲 الدعاء الإسلامي\", id: \"演讲礼拜 Tangan Berdoa Il\"}, ur: \"演讲礼拜 اسلامی مد حار\"", "en: \"演讲 اسلامی تمان\" placeholder"],
  ["id: \"演讲 Wajah Sesali\", ur: \"演讲 غمگین ور پیچھے ماندہ چہرہ\"", "id: \"演讲 Wajah Menyesal\", ur: \"演讲 غمگین چہرہ\""],
  ["en: \"演讲 inteligentes Hewers\", ar: \"演讲 الصخر المنهوب_loading\", id: \"演讲 inhabited Mars Registry\", ur: \"演讲 پنجرئے وِ کارگین اور پتھر پلising\"", "en: \"演讲 Houses Carved in Rock\", ar: \"演讲 بيوت محفورة في الصخر\", id: \"演讲 Rumah Berukir Batu\", ur: \"演讲 پتھر میں کندہ گھر\""],
  ["ar: \"演讲 سبع السماء Blend\", id: \"演讲 Lapisan Tuju langit\", ur: \"演讲 آسمان کی سات پرتں\"", "ar: \"演讲 سبع طبقات الجو\", id: \"演讲 Tujuh Lapis Atmosfer\", ur: \"演讲 آسمان کی سات پرتیں\""],
  ["ar: \"演讲 الوجوه الستّئ والفرح\", id: \"演讲 Ruby Beaming Dan'T\", ur: \"演讲 چمکاتے چہرے ور خوشی\"", "ar: \"演讲 الوجوه المشرقة والفرح\", id: \"演讲 Wajah Berseri & Gembira\", ur: \"演讲 چمکتے چہرے اور خوشی\""],
  ["id: \"演讲 pani Kellweer\", ur: \"演讲 لوح rumored\"", "id: \"演讲 Kain Sutra\",       ur: \"演讲 ریشم کا کپڑا\""],
  ["en: \"演讲 Silver规 چا\", ar: \"演讲篮 Gall\", id: \"演讲篮 Kel\", ur: \"演讲篮 گیمسج\"", "en: \"演讲 Silver Goblets & Crystal\", ar: \"演讲 كؤوس الفضة والكربستال\", id: \"演讲 Cawan Perak & Kristal\", ur: \"演讲 چاندی کے پیالے اور کرسٹل\""],
  ["id: \"演讲 Langit Ber`) و Lag\", ur: \"演讲 دہوا ور sabat\"", "id: \"演讲 Langit Berasap & Berkabut\", ur: \"演讲 دھوا اور دھند آسمان\""],
  ["id: \"演讲 Laba-laba & Rumah Retak\", ur: \"演讲 مکڑی ور گرایڑا\"", "id: \"演讲 Laba-laba & Sarang Lapuk\", ur: \"演讲 مکڑی اور گرایا گھر\""],
  ["id: \"演讲 Tunas Semut\"", "id: \"演讲 Benih yang Bertunas\""],
  ["ar: \"演讲 البحر المتعثري\", id: \"演讲 Laut و Kabe\", ur: \"演讲 طوي طوفانی ور کشتی\"", "ar: \"演讲 البحر العاصف\",    id: \"演讲 Laut Badai & Perahu\", ur: \"演讲 طوفانی سمندر اور کشتی\""],
  ["ar: \"演讲 إسواس البعوض\", id: \"演讲 Kawanan Nyanyuk\", ur: \"演讲 مچھر کی جشت\"", "ar: \"演讲 أسراب البعوض\",    id: \"演讲 Kawanan Nyamuk\",    ur: \"演讲 مچھروں کا جھنڈ\""],
  ["en: \"演讲 Tectj He\", ur: \"演讲 تختی\",\"ar\": \"演讲 الصفائح التكتوني\"], \"id\": \"演讲 RetakТ_tls\"}", "en: \"演讲 Tectonic Plates\", ar: \"演讲 الصفائح التكتونية\", id: \"演讲 Pelat Tektonik\", ur: \"演讲 تکتونی پلیٹیں\""],
  ["ar: \"演讲 المرjَ البحرين\", id: \"演讲 Pertemuan Dua Laut\", ur: \"演讲ی دو سمندر کا ملاق\"", "ar: \"演讲 لقاء البحرين\", id: \"演讲 Pertemuan Dua Laut\", ur: \"演讲 دو سمندروں کا ملنا\""],
  ["id: \"演讲 Gua زیر\", ur: \"演讲ی زمینی غار\"", "id: \"演讲 Gua Bawah Tanah\", ur: \"演讲 زمینی غار\""],
  ["id: \"演讲 Arus Laut Gos\", ur: \"演讲ی اندیں نریں\"", "id: \"演讲 Arus Laut Gelap\", ur: \"演讲 گہری تاریک پانی کی روئیں\""],
  ["ur: \"演讲ی کائنات وسعت\"", "ur: \"演讲 پھیلتی کائنات\""],
  ["ur: \"演讲ی حوض ور گہ\"", "ur: \"演讲 پانی کا کنواں اور گہرائی\""],
  ["ur: \"演讲ی پانی دا چکر\"", "ur: \"演讲 پانی کا سائیکل اور بادل\""],
  ["ur: \"演讲ی سوکت پنچ\"", "ur: \"演讲 سوکھی گھاس\""],
  ["ar: \"演讲 عويّ الذئب في الليل\", id: \"演讲 Serigala Berteriak Malam\", ur: \"演讲ی بکون دل بلا\"", "ar: \"演讲 هدير الذئب في الليل\", id: \"演讲 Serigala Melolong Malam\", ur: \"演讲 رات میں بھونکنے والا بھیڑیا\""],
  ["ar: \"演讲 الحشر جهنم\", id: \"演讲 Pohon Zaqqum\", ur: \"演讲ی زقوم جہنمی\"", "ar: \"演讲 شجرة الزقوم\",    id: \"演讲 Pohon Zaqqum\",      ur: \"演讲 زقوم جہنم کا درخت\""],
  ["ur: \"演讲 سليمان کا ہدیہ\"", "ur: \"演讲 سلیمن کا ہُد ہُد\""],
  ["ar: \"演讲 الأيادی نحو السماء\"", "ar: \"演讲 الأيادی إلی السماء\""],
  ["id: \"演讲 Mata Air Tembaga Cair\", ur: \"演讲 گرم چشمہ اس\"", "id: \"演讲 Mata Air Tembaga Cair\", ur: \"演讲 پگھل تمبا چشمہ\""],
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
const kalan = (s.match(/演讲|规|篮/g) || []).length;
console.log("kalan bozuk emoji:", kalan > 0 ? s.match(/[^\x00-\x7F\u0400-\u04FF\u0600-\u06FF\u0900-\u097F\u0370-\u03FF\u0590-\u05FF\u1F300-\u1FAFF\u2600-\u27BF\uFE70-\uFEFF\u060C\u061F\u200C-\u200F\u00A0-\u00FF\u2000-\u206F]/g)?.filter(c => !/[ğüşıöçİĞÜŞÖÇەاآأإبپتثجچحخدذرزژسشصضطظعغفقکگلمنوهیھیٰءۀﷲﷺًٌٍَُِّْٰٓۓ Cricket]/u.test(c)).slice(0, 30) : "YOK");
