// ════════════════════════════════════════════════════════════════════
// SOZLUK-EKLE-2610.MJS — 26.10 i18n serisi (kullanıcı emri: her buton 5 dil)
//   • 5 sözlük (tr/en/ar/id/ur) JSON'unu okur, EKSIK anahtarları ekler.
//   • TR: yalnız eksik olanlar eklenir (mevcut değerler ASLA ezilmez).
//   • en/ar/id/ur: anahtar yoksa VEYA değeri Türkçe'yle birebir aynıysa
//     (çevrilmemiş kalmış) çevirisi yazılır — gerçek çevrilere dokunulmaz.
//   • Düzeltme: dicts.ur.json "atmKategorilereDon" içindeki Çince '喻' ayıklanır.
// Âdına güvenli: çalıştır → "npm run node:scripts/sozluk-ekle-2610.mjs" değil;
//   node scripts/sozluk-ekle-2610.mjs
// ════════════════════════════════════════════════════════════════════
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "i18n");
const DILECE = ["tr", "en", "ar", "id", "ur"];

// ─── ANAHTAR KOMPLE — [anahtar, tr, en, ar, id, ur] ───
const KELIME = [
  // ★ Nûr Araçları paneli (foto 1-2: başlık, alt başlık, sekme çipleri)
  ["sevapKosesi", "Nûr Araçları", "Nûr Tools", "أدوات النور", "Alat Nûr", "نور کے اوزار"],
  ["itPanelAlt", "İslami yardımcı araçlar · Namaz, zikir, kıble", "Islamic helper tools · Prayer, dhikr, qibla", "أدوات إسلامية مساعدة · الصلاة والذكر والقبلة", "Alat bantu Islami · Salat, zikir, kiblat", "اسلامی معاون اوزار · نماز، ذکر، قبلہ"],
  ["itTabPrayer", "Namaz Vakti", "Prayer Times", "مواعيد الصلاة", "Waktu Salat", "نماز کے اوقات"],
  ["itTabSalah", "Namaz Takibi", "Prayer Tracker", "متابعة الصلاة", "Pelacak Salat", "نماز کا ریکارڈ"],
  ["itTabHatim", "Hatim Takibi", "Qur'an Completion", "متابعة الختمة", "Pelacak Khatam", "ختمے کا ریکارڈ"],
  ["itTabQibla", "Kıble", "Qibla", "القبلة", "Kiblat", "قبلہ"],
  ["itTabZikir", "Zikirmatik", "Dhikr Counter", "عداد الذكر", "Penghitung Zikir", "ذکر شمارندہ"],
  ["itTabKaza", "Kaza Takibi", "Missed Prayers", "تعويض الصلوات", "Pelacak Qadha", "قضا نماز کا ریکارڈ"],
  ["itTabCalendar", "Dini Günler", "Islamic Calendar", "التقويم الإسلامي", "Kalender Islami", "اسلامی کیلنڈر"],
  ["itTabDua", "Günün Duaları", "Daily Duas", "أدعية اليوم", "Doa Harian", "روزانہ دعائیں"],
  // ★ Namaz vakti sekmesi
  ["itBugunVakitler", "Bugünkü Namaz Vakitleri", "Today's Prayer Times", "مواعيد الصلاة اليوم", "Waktu Salat Hari Ini", "آج کے نماز اوقات"],
  ["itVakitNot", "Şehre göre hesaplanır · TR: Diyanet · Yurtdışı: MWL", "Computed for your city · TR: Diyanet · Abroad: MWL", "تُحسب لمدينتك · تركيا: الديانة · الخارج: MWL", "Dihitung sesuai kota · TR: Diyanet · Luar: MWL", "شہر کے مطابق · ترکی: دیانت · بیرون ملک: MWL"],
  ["itSehirSec", "Şehir seç — yurtdışı dahil", "Choose city — includes abroad", "اختر مدينة — تشمل الخارج", "Pilih kota — termasuk luar negeri", "شہر منتخب کریں — بیرون ملک شامل ہے۔"],
  ["itSiradaki", "Sıradaki vakit", "Next prayer", "الصلاة القادمة", "Salat berikutnya", "اگلی نماز"],
  ["itYarin", " · yarın", " · tomorrow", " · غدًا", " · besok", " · کل"],
  ["itVakitYukleniyor", "Vakitler yükleniyor veya konum izni bekleniyor...", "Times loading or waiting for location permission…", "جارٍ تحميل المواقيت أو انتظار إذن الموقع…", "Waktu sedang dimuat atau menunggu izin lokasi…", "اوقات لوڈ ہو رہے ہیں یا مقام کی اجازت کا انتظار…"],
  ["itVakitKaynak", "Vakitler Aladhan üzerinden Diyanet metodu ile hesaplanır.", "Times are computed via Aladhan using the Diyanet method.", "تُحسب المواقيت عبر Aladhan بطريقة الديانة.", "Waktu dihitung via Aladhan dengan metode Diyanet.", "اوقات Aladhan کے ذریعے دیانت کے طریقے سے شمار کیے جاتے ہیں۔"],
  // ★ Namaz vakit adları (vakitAdi() helper'ı bunları kullanır)
  ["vakitİmsak", "İmsak", "Imsak", "الإمساك", "Imsak", "اِمساک"],
  ["vakitGüneş", "Güneş", "Sunrise", "الشروق", "Terbit", "طلوعِ آفتاب"],
  ["vakitÖğle", "Öğle", "Dhuhr", "الظهر", "Zuhur", "ظہر"],
  ["vakitİkindi", "İkindi", "Asr", "العصر", "Asar", "عصر"],
  ["vakitAkşam", "Akşam", "Maghrib", "المغرب", "Magrib", "مغرب"],
  ["vakitYatsı", "Yatsı", "Isha", "العشاء", "Isya", "عشاء"],
  // ★ Dualar sekmesi
  ["itGununDualariEzkari", "Günün Duaları & Ezkarı", "Daily Duas & Adhkar", "أدعية اليوم وأذكاره", "Doa & Zikir Harian", "دن کی دعائیں اور اذکار"],
  ["itDuaKaynakPrefix", "Kaynak:", "Source:", "المصدر:", "Sumber:", "مصدر:"],
  ["itDualarDerleme", "Dualar sahih kaynaklardan derlenmiştir.", "Prayers are compiled from authentic sources.", "جُمعت الأدعية من مصادر صحيحة.", "Doa disusun dari sumber-sumber shahih.", "دعائیں صحیح مصادر سے جمع کی گئی ہیں۔"],
  // ★ Zikir külliyatı + sayaç metinleri
  ["itSahihKuliyat", "Sahih Zikir & Dua Külliyatı ({n})", "Authentic Dhikr & Dua Collection ({n})", "مجموعة الأذكار والأدعية الصحيحة ({n})", "Kumpulan Zikir & Doa Shahih ({n})", "ذکر اور دعا کی صحیح مجموعہ ({n})"],
  ["itAra", "Ara", "Search", "ابحث", "Cari", "تلاش کریں"],
  ["itKapat", "Kapat", "Close", "إغلاق", "Tutup", "بند کریں"],
  ["itAraTitle", "Zikir veya kaynak ara", "Search dhikr or source", "ابحث عن ذكر أو مصدر", "Cari zikir atau sumber", "ذکر یا مصدر تلاش کریں"],
  ["itAraPlaceholder", "Ne ararsan yaz: istigfar, secde, seyahat, Buhari…", "Type anything: istighfar, sujood, travel, Bukhari…", "اكتب ما تشاؤه: استغفار، سجود، سفر، صحيح البخاري…", "Tulis apa pun: istighfar, sujud, perjalanan, Bukhari…", "کچھ بھی لکھیں: استغفار، سجود، سفر، بخاری…"],
  ["itFiltreHepsi", "Hepsi", "All", "الكل", "Semua", "سب"],
  ["itFiltreHadis", "🤍 Hadis", "🤍 Hadith", "🤍 حديث", "🤍 Hadits", "🤍 حدیث"],
  ["itFiltreKuran", "📖 Kur'an", "📖 Qur'an", "📖 القرآن", "📖 Al-Qur'an", "📖 قرآن"],
  ["itTumunuGoster", "Tümünü Göster (+{n} satır)", "Show all (+{n} rows)", "إظهار الكل (+{n} صف)", "Tampilkan semua (+{n} baris)", "سب دکھائیں (+{n} قطار)"],
  ["itDaralt", "↑ Daralt (ilk {n})", "Collapse (first {n})", "تصغير (أول {n})", "Lipat ({n} pertama)", "چھوٹا کریں (پہلے {n})"],
  ["itBulunamadi", "Aradığın bulunamadı — başka bir kelime dene.", "No results — try another word.", "لا نتائج — جرّب كلمة أخرى.", "Tidak ditemukan — coba kata lain.", "کچھ نہ ملا — کوئی اور لفظ آزمائیں۔"],
  ["itSonucSayisi", "{n} sonuç bulundu", "{n} results found", "وُجدت {n} نتيجة", "{n} hasil ditemukan", "{n} نتائج ملے"],
  ["itSahihKaynakDipnot", "Tüm zikirler ve dualar Buhârî · Müslim · Tirmizî · Ebû Dâvûd · İbn Mâce sahih kaynaklıdır.", "All dhikr and duas are from authentic sources: Bukhari, Muslim, Tirmidhi, Abu Dawud, Ibn Majah.", "جميع الأذكار والأدعية من مصادر صحيحة: البخاري ومسلم والترمذي وأبو داود وابن ماجه.", "Semua zikir dan doa bersumber shahih: Bukhari, Muslim, Tirmidzi, Abu Dawud, Ibn Majah.", "تمام اذکار اور دعائیں صحیح مصادر سے: بخاری، مسلم، ترمذی، ابوداود، ابنِ ماجہ۔"],
  ["itSifirla", "↺ Sıfırla (bu oturum)", "↺ Reset (this session)", "↺ إعادة (هذه الجلسة)", "↺ Atur ulang (sesi ini)", "↺ ری سیٹ (یہ نشست)"],
  ["itToplulukBirlikte", "🌍 Toplulukla birlikte: {n} zikir", "🌍 Together with the community: {n} dhikr", "🌍 مع المجتمع: {n} ذكر", "🌍 Bersama komunitas: {n} zikir", "🌍 برادری کے ساتھ: {n} ذکر"],
  ["itCihazToplam", "🌟 Bu cihazdan toplam: {n}", "🌟 Total from this device: {n}", "🌟 المجموع من هذا الجهاز: {n}", "🌟 Total dari perangkat ini: {n}", "🌟 اس ڈیوائس سے کل: {n}"],
  ["itSayacCihazda", "Sayacın cihazında kalıcı saklanır · topluluk sayacı canlı", "Your counter is kept on your device · community counter is live", "يُحفظ عدادك في جهازك · عداد المجتمع حيٌّ", "Penghitung Anda disimpan di perangkat · penghitung komunitas aktif", "آپ کا شمارندہ آپ کے ڈیوائس میں محفوظ ہے · برادری کا شمارندہ براہِ راست ہے"],
  ["itSonrakiHedef", "Sonraki hedef: {n} · {k} kaldı", "Next target: {n} · {k} to go", "الهدف التالي: {n} · تبقّى {k}", "Target berikutnya: {n} · sisa {k}", "اگلا ہدف: {n} · {k} باقی"],
  // ★ Panel footer
  ["itFooter", "🤲 Nûr Araçları — İslamî yaşamınız için yardımcı araçlar", "🤲 Nûr Tools — helpful tools for your Islamic life", "🤲 أدوات النور — أدوات معينة لحياتك الإسلامية", "🤲 Alat Nûr — alat bantu untuk kehidupan Islami Anda", "🤲 نور کے اوزار — آپ کی اسلامی زندگی کے لیے معاون اوزار"],
  ["itFooterKaynak", "Bilgiler Diyanet İşleri Başkanlığı verilerine dayanır", "Data is based on information from the Turkish Directorate of Religious Affairs", "تستند البيانات إلى بيانات رئاسة الشؤون الدينية التركية", "Data didasarkan pada data Kementerian Agama Turki", "معلومات دولت ترکی کی دینیات ادارہ کے ڈیٹا پر مبنی ہیں"],
  // ★ Sol menü etiketleri (HeaderTopBar'da t() ile bağlanacak)
  ["menuAyetNotlari", "Ayet Notlarım", "My Verse Notes", "ملاحظاتي على الآيات", "Catatan Ayat Saya", "میرے آیت نوٹس"],
  ["menuAiArkaPlan", "AI Arka Plan Üretici", "AI Background Maker", "صانع الخلفيات بالذكاء الاصطناعي", "Pembuat Latar Belakang AI", "اے آئی پس منظر ساز"],
  ["menuHafizlikTesti", "Hafızlık Testi", "Memorization Test", "اختبار الحفظ", "Uji Hafalan", "حفظ کی آزمائش"],
  ["menuRamazanKandil", "Ramazan & Kandil", "Ramadan & Holy Nights", "رمضان والليالي المباركة", "Ramadan & Malam Suci", "رمضان اور مبارک راتیں"],
  ["menuDavetOdu", "Arkadaşını Davet Et · Ödül", "Invite a Friend · Reward", "دعوة صديق · مكافأة", "Undang Sahabat · Hadiah", "دوست کو دعوت دیں · انعام"],
  ["menuKendiSesinleUret", "Kendi Sesinle Üret", "Create With Your Voice", "أنشئ بصوتك", "Buat Dengan Suaramu", "اپنی آواز سے بنائیں"],
  ["menuSesliMeal", "Sesli Meal · Seslendirme", "Audio Translation · TTS", "الترجمة الصوتية · تحويل النص إلى صوت", "Terjemahan Audio · TTS", "آواز والا ترجمہ · صوتی بول چال"],
  ["menuKuranOgrenDinle", "Kur'an Öğreniyorum · Dinliyorum", "Learn the Qur'an · Listen", "أتعلم القرآن · أستمع", "Belajar Al-Qur'an · Mendengarkan", "قرآن سیکھ رہا ہوں · سن رہا ہوں"],
  ["menuAnaEkranaEkle", "Ana Ekrana Ekle · Uygulama Olarak", "Add to Home Screen · As an App", "أضف إلى الشاشة الرئيسية · كتطبيق", "Tambahkan ke Layar Utama · Sebagai Aplikasi", "ہوم اسکرین پر شامل کریں · ایپ طرح"],
  // ★ Güncellemeler vitrini — "Yakında" ihtişamlı kartlar (kullanıcı emri)
  ["hbrYakindaModuller", "Yakında Gelecek Modüller", "Modules Coming Soon", "وحدات قريبًا", "Modul Segera Hadir", "جلد آنے والے ماڈیول"],
  ["ksYakinda", "Yakında", "Soon", "قريبًا", "Segera", "جلد"],
  ["ksKendiSesTitle", "🎤 Kendi Sesinle Üret", "🎤 Create With Your Own Voice", "🎤 أنشئ بصوتك الخاص", "🎤 Buat Dengan Suara Sendiri", "🎤 اپنی ہی آواز سے تخلیق کریں"],
  ["ksKendiSesDesc", "Stüdyoya sesini ver: ayetleri kendi dilinde, kendi üslubunla oku ve pırıl pırıl videona imzânı at.", "Give the studio your own voice: recite the verses in your language and style, and stamp your signature on your luminous videos.", "أعط الاستوديو صوتك: اقرأ الآيات بلغتك وأسلوبك، ووقّع على فيدييك النورانيّ حرفينك.", "Berikan suaramu ke studio: baca ayat dengan bahasa dan gayamu sendiri, lalu tandai videomu yang bercahaya dengan tanda tanganmu.", "اسٹوڈیو کو اپنی آواز دیں: آیات کو اپنی زبان اور اسلوب میں پڑھیں اور روشن ویڈیو پر اپنی مہر ثبت کریں۔"],
  ["ksMobilTitle", "📱 Mobil Dönüşüm", "📱 Mobile Transformation", "📱 التحول المحمول", "📱 Transformasi Seluler", "📱 موبائل تبدیلی"],
  ["itToplulukToplami", "Topluluk toplamı: ", "Community total: ", "المجموع المجتمعي: ", "Total komunitas: ", "برادری کا کل: "],
  ["itZikirCekildi", "zikir çekildi", "dhikr completed", "ذكرٌ أُديت", "zikir diselesaikan", "ذکر ادائی گئی"],
  ["itToplulukCanli", "Topluluk sayacı canlı — ", "Community counter is live — ", "عداد المجتمع حيٌّ — ", "Penghitung komunitas aktif — ", "برادری کا شمارندہ براہِ راست — "],
  ["itIlkZikirSen", "ilk zikiri sen çek", "be the first to count one", "اكن أول من يُدي ذكرًا", "jadilah zikir pertama", "پہلا ذکر آپ دائیں"],
  ["itGunlukToplulukZikirleri", "Günlük topluluk zikirleri", "Daily community dhikr", "أذكار المجتمع اليومية", "Zikir komunitas harian", "روزانہ برادری کے ذکر"],
  ["it7Gun", "7 GÜN", "7 DAYS", "٧ أيام", "7 HARI", "۷ دن"],
  ["itTumu", "TÜMÜ", "ALL", "الكل", "SEMUA", "تمام"],
  ["itZikirKelime", "zikir", "dhikr", "ذكر", "zikir", "ذکر"],
  ["itIlkNGun", "İlk ", "First ", "أول ", "Awal ", "پہلے "],
  ["itBuHafta", "Bu hafta", "This week", "هذا الأسبوع", "Minggu ini", "اس ہفتے"],
  ["itSonNGun", "Son ", "Last ", "آخر ", "Terakhir ", "پچھلے "],
  ["itGunKelime", "gün", "days", "أيام", "hari", "دن"],
  ["itHalkaTamam", "halka tamam", "rings complete", "حلقة مكتملة", "cincin lengkap", "حلقہ مکمل"],
  ["itHalkaDoldu", "halka doldu 🎉", "ring filled 🎉", "امتلأت الحلقة 🎉", "cincin penuh 🎉", "حلقہ بھر گیا 🎉"],
  ["itHalkayaKaldi", "halkaya", "to the ring", "لإتمام الحلقة", "menuju cincin", "حلقے پر"],
  ["itKaldi", "kaldı", "left", "بقيت", "sisa", "باقی"],
  ["itGunSeri", "gün seri", "day streak", "يومًا متتاليًا", "hari beruntun", "دن مسلسل"],
  ["itDokunVeCek", "dokun ve çek", "tap and count", "المس واحسب", "ketuk dan hitung", "چھیڑں اور گنیں"],
  ["itSifirlaKisa", "Sıfırla (bu oturum)", "Reset (this session)", "إعادة (هذه الجلسة)", "Atur ulang (sesi ini)", "ری سیٹ (یہ نشست)"],
  ["itToplulukBirlikte2", "Toplulukla birlikte:", "Together with the community:", "مع المجتمع:", "Bersama komunitas:", "برادری کے ساتھ:"],
  ["itCihazToplam2", "Bu cihazdan toplam:", "Total from this device:", "المجموع من هذا الجهاز:", "Total dari perangkat ini:", "اس ڈیوائس سے کل:"],
  ["itSayacCihazdaKisa", "Sayacın cihazında kalıcı saklanır", "Your counter is kept on your device", "يُحفظ عدادك في جهازك", "Penghitung Anda disimpan di perangkat", "آپ کا شمارندہ آپ کے ڈیوائس میں محفوظ ہے"],
  ["itToplulukCanliKisa", " · topluluk sayacı canlı ☝", " · community counter is live ☝", " · عداد المجتمع حيٌّ ☝", " · penghitung komunitas aktif ☝", " · برادری کا شمارندہ براہِ راست ☝"],
  ["itSahihKuliyatKisa", "Sahih Zikir & Dua Külliyatı", "Authentic Dhikr & Dua Collection", "مجموعة الأذكار والأدعية الصحيحة", "Kumpulan Zikir & Doa Shahih", "ذکر اور دعا کی صحیح مجموعہ"],
  ["itHadisKaynagi", "Hadis kaynağı", "Hadith source", "مصدر حديث", "Sumber hadits", "حدیث کا مصدر"],
  ["itKuranDuasi", "Kur'an duası", "Qur'anic prayer", "دعاء قرآني", "Doa Al-Qur'an", "قرآنی دعا"],
  ["itKaynak", "Kaynak", "Source", "المصدر", "Sumber", "مصدر"],
  ["itSatir", "satır", "rows", "صف", "baris", "قطار"],
  ["itSonucBulundu", "sonuç bulundu", "results found", "نتيجة وجدتها", "hasil ditemukan", "نتائج ملے"],
  ["itDaraltKisa", "↑ Daralt (ilk", "↑ Collapse (first", "↑ تصغير (أول", "↑ Lipat (awal", "↑ چھوٹا کریں (پہلے"],
  ["ksMobilDesc", "Nûr Stüdyo cebinde: kur gibi yüklenir, browser sekmesi olmadan doğrudan açılır; bildirimler ve çevrimdışı kullanım da aktifleşir.", "Nûr Studio in your pocket: installs like a native app and opens directly without a browser tab; notifications and offline use come alive.", "استوديو النور في جيبك: يُثبَّت كتطبيق أصلي ويُفتح مباشرةً دون تبويب متصفح؛ وتنشط الإشعارات والاستخدام دون اتصال.", "Nûr Studio di saku: terpasang seperti aplikasi asli dan terbuka langsung tanpa tab peramban; notifikasi dan pemakaian luring aktif.", "نور اسٹوڈیو آپ کی جیب میں: مقامی ایپکی طرح انسٹال ہوتا ہے اور براہِ راست بغیر براؤزر ٹیب کے کھلتا ہے؛ اطلاعات اور آف لائن استعمال فعال۔"],
];

// ─── ÖNCELİKLİ DÜZELTMELER (yabancı/CJK kiri ve çevrilmemiş kalıntılar) ───
const ZORUNLU_DUILIMLER = {
  ur: {
    atmKategorilereDon: "واپس اقسام کی طرف",
    sevapKosesi: "نور کے اوزار",
  },
  en: { sevapKosesi: "Nûr Tools" },
  ar: { sevapKosesi: "أدوات النور" },
  id: { sevapKosesi: "Alat Nûr" },
};

const okuYaz = (kod) => join(DIR, `dicts.${kod}.json`);

const sozlukler = Object.fromEntries(DILECE.map((kod) => [kod, JSON.parse(readFileSync(okuYaz(kod), "utf8"))]));
const tr = sozlukler.tr;

let eklenen = 0, ezilen = 0, bakti = 0;

for (const [anahtar, trDeger, enDeger, arDeger, idDeger, urDeger] of KELIME) {
  const degerler = { tr: trDeger, en: enDeger, ar: arDeger, id: idDeger, ur: urDeger };
  for (const kod of DILECE) {
    const dict = sozlukler[kod];
    if (!(anahtar in dict)) { dict[anahtar] = degerler[kod]; eklenen++; continue; }
    if (kod !== "tr" && dict[anahtar] === trDeger) { dict[anahtar] = degerler[kod]; ezilen++; } // çevrilmemiş Türkçe kalıntı
  }
}

// zorunlu düzeltmeler — her durumda yazar
for (const [kod, anahtarDeger] of Object.entries(ZORUNLU_DUILIMLER)) {
  for (const [anahtar, deger] of Object.entries(anahtarDeger)) {
    if (sozlukler[kod][anahtar] !== deger) { sozlukler[kod][anahtar] = deger; ezilen++; }
  }
}

for (const kod of DILECE) writeFileSync(okuYaz(kod), JSON.stringify(sozlukler[kod], null, 2) + "\n", "utf8");

// ─── PARİTE KONTROL: yeni eklenen tüm anahtarlar 5 sözlükte aynı anda var mı? ───
const eksik = [];
for (const [anahtar] of KELIME) {
  for (const kod of DILECE) if (!(anahtar in sozlukler[kod])) eksik.push(`${kod}.${anahtar}`);
}
if (eksik.length) { console.error("❌ PARİTE BOZUL:", eksik); process.exit(1); }

console.log(`✓ Sözlük serisi işlendi: ${DILECE.length} dil · eklendi ${eklenen} · deja-Türkçe ezildi ${ezilen} · parite sağlam`);
// donmusken hetar: bu dönende herşey çalışır (her 5 dilde ek aynı anda var)
