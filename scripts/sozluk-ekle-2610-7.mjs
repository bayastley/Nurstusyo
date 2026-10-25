// ════════════════════════════════════════════════════════
// 26.10 — SÖZLÜK EKLE-7: KesfetModal gömülü TR metinleri (Vakit
//   notu, Hoca, Cami, Rehber, Tecvid, Kitaplık) — 5 dil.
//   Çalıştırma: node scripts/sozluk-ekle-2610-7.mjs
// ════════════════════════════════════════════════════════
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const KO = path.dirname(fileURLToPath(import.meta.url));
const I18N = path.join(KO, "..", "src", "i18n");

const KOMUT = {
  ktNamazRekat: {
    tr: "Vakit namazlarında rekat sayıları: Sabah 2 farz · Öğle 4 · İkindi 4 · Akşam 3 · Yatsı 4",
    en: "Rak'ah counts for the daily prayers: Fajr 2 fard · Dhuhr 4 · Asr 4 · Maghrib 3 · Isha 4",
    ar: "عدد الركعات في الصلوات الخمس: الفجر ركعتان فريضة · الظهر 4 · العصر 4 · المغرب 3 · العشاء 4",
    id: "Jumlah rakaat salat wajib: Subuh 2 fardhu · Zuhur 4 · Asar 4 · Maghrib 3 · Isya 4",
    ur: "پانچ نمازوں کی رکعات: فجر 2 فرض · ظہر 4 · عصر 4 · مغرب 3 · عشاء 4",
  },
  ktHocaOn: {
    tr: "Aynı ayeti farklı hocalardan dinle — \"bu kelimeyi kim nasıl okuyor\" 🎧 · üstteki aramaya",
    en: "Listen to the same verse from different reciters — \"who recites this word how\" 🎧 · type e.g. bakara 250 in the search above",
    ar: "استمع لنفس الآية من قرّاء مختلفين — \"من يقرأ هذه الكلمة وكيف\" 🎧 · اكتب في البحث أعلاه مثل سورة البقرة 250",
    id: "Dengarkan ayat yang sama dari berbagai qari — \"siapa membaca kata ini bagaimana\" 🎧 · tulis di pencarian atas misal baqarah 250",
    ur: "ایسی آیت مختلف قاریوں سے سنیں — \"یہ لفظ کون کیسے پڑھتا ہے\" 🎧 · اوپر تلاش میں لکھیں مثلاً بقرہ 250",
  },
  ktHocaBold: {
    tr: "bakara 250",
    en: "bakara 250",
    ar: "البقرة 250",
    id: "baqarah 250",
    ur: "بقرہ 250",
  },
  ktHocaSon: {
    tr: "gibi yaz, istediğin ayeti dinle",
    en: "and listen to the verse you want",
    ar: "واسمع الآية التي تريد",
    id: "dan dengarkan ayat yang kamu mau",
    ur: "لکھیں اور مطلوبہ آیت سنیں",
  },
  ktHocaSectin: {
    tr: "Aramadan seçtin",
    en: "You searched and chose",
    ar: "اخترتَ من البحث",
    id: "Kamu pilih dari pencarian",
    ur: "آپ نے تلاش سے منتخب کیا",
  },
  ktSureSonek: {
    tr: "Suresi · {a}. Ayet",
    en: "Surah · Verse {a}",
    ar: "السورة · الآية {a}",
    id: "Surah · Ayat {a}",
    ur: "سورہ · آیت {a}",
  },
  ktAyetSonek: {
    tr: "{a}. ayet",
    en: "verse {a}",
    ar: "آية {a}",
    id: "ayat {a}",
    ur: "آیت {a}",
  },
  ktSesKaynak: {
    tr: "Ses kaynağı: everyayah.com · ayet bazlı kayıtlar",
    en: "Audio source: everyayah.com · verse-based recordings",
    ar: "مصدر الصوت: everyayah.com · تسجيلات حسب الآية",
    id: "Sumber audio: everyayah.com · rekaman per ayat",
    ur: "آڈیو ماخذ: everyayah.com · آیت وار ریکارڈنگز",
  },
  ktCamiMetin: {
    tr: "Bulunduğun yerin veya aradığın şehrin camilerini haritada gör 📍",
    en: "See the mosques of your location or the city you search on the map 📍",
    ar: "شاهد مساجد موقعك أو المدينة التي تبحث عنها على الخريطة 📍",
    id: "Lihat masjid-masjid di lokasimu atau kota yang kamu cari di peta 📍",
    ur: "اپنی جگہ یا متلاشی شہر کی مساجد نقشے پر دیکھیں 📍",
  },
  ktCamiBul: {
    tr: "📍 Konumumdan Bul",
    en: "📍 Find From My Location",
    ar: "📍 ابحث من موقعي",
    id: "📍 Cari Dari Lokasiku",
    ur: "📍 اپنی جگہ سے ڈھونڈیں",
  },
  ktCamiAliniyor: {
    tr: "⏳ Konum alınıyor…",
    en: "⏳ Getting location…",
    ar: "⏳ جارٍ تحديد الموقع…",
    id: "⏳ Mengambil lokasi…",
    ur: "⏳ لوکیشن حاصل کی جا رہی ہے…",
  },
  ktCamiPlaceholder: {
    tr: "Şehir/ilçe yaz — örn. İstanbul Fatih...",
    en: "Type a city/district — e.g. Istanbul Fatih...",
    ar: "اكتب مدينة/حيًا — مثل إستنبول الفاتح...",
    id: "Tulis kota/kecamatan — mis. Istanbul Fatih...",
    ur: "شہر/علاقہ لکھیں — مثلاً استنبول فاتح…",
  },
  ktAra: { tr: "Ara", en: "Search", ar: "ابحث", id: "Cari", ur: "تلاش" },
  ktCamiHarita: { tr: "Cami haritası", en: "Mosque map", ar: "خريطة المساجد", id: "Peta masjid", ur: "مساجد کا نقشہ" },
  ktCamiListe: {
    tr: "📋 Liste görünümünde aç (Google Maps)",
    en: "📋 Open as list (Google Maps)",
    ar: "📋 افتح كقائمة (خرائط جوجل)",
    id: "📋 Buka sebagai daftar (Google Maps)",
    ur: "📋 فہرست میں کھولیں (گوگل میپس)",
  },
  ktCamiBos: {
    tr: "📍 Önce 'Konumumdan Bul'a bas ya da şehir yazıp Enter'a bas — yakınınızdaki camiler haritada listelenir.",
    en: "📍 First tap 'Find From My Location' or type a city and press Enter — nearby mosques are listed on the map.",
    ar: "📍 اضغط أولًا 'ابحث من موقعي' أو اكتب مدينة واضغط Enter — ستُدرج المساجد القريبة على الخريطة.",
    id: "📍 Ketuk dulu 'Cari Dari Lokasiku' atau tulis kota lalu tekan Enter — masjid terdekat tampil di peta.",
    ur: "📍 پہلے 'اپنی جگہ سے ڈھونڈیں' دبائیں یا شہر لکھ کر Enter دبائیں — قریبی مساجد نقشے پر نیچے آئیں گی۔",
  },
  ktRehberMetin: {
    tr: "Ürettiğin videolarla büyümen için kanal ipuçları 🚀",
    en: "Channel tips to grow with the videos you produce 🚀",
    ar: "نصائح القناة للنمو بالفيديوهات التي تنتجها 🚀",
    id: "Tips kanal untuk tumbuh dengan video yang kamu buat 🚀",
    ur: "بنائی گئی ویڈیوز سے添 نمی کے لیے چینل تجاویز 🚀",
  },
  ktTecvidMetin: {
    tr: "Tilavetin kuralları — her kural tanım + örnekle 🎓",
    en: "Rules of recitation — each rule with definition + example 🎓",
    ar: "قواعد التلاوة — كل قاعدة بتعريف ومثال 🎓",
    id: "Aturan tilawah — setiap aturan dengan definisi + contoh 🎓",
    ur: "تلاوت کے قواعد — ہر قاعدہ تعریف + مثال کے ساتھ 🎓",
  },
  tecvidTemel: { tr: "Temel", en: "Basic", ar: "أساسي", id: "Dasar", ur: "بنیادی" },
  tecvidOrta: { tr: "Orta", en: "Intermediate", ar: "متوسط", id: "Menengah", ur: "درمیانی" },
  tecvidIleri: { tr: "İleri", en: "Advanced", ar: "متقدم", id: "Lanjut", ur: "اعلیٰ" },
  ktKitaplikIsaret: { tr: "🔖 İşaretli Ayetler", en: "🔖 Bookmarked Verses", ar: "🔖 الآيات المعلَّمة", id: "🔖 Ayat yang Ditandai", ur: "🔖 نشان زدہ آیات" },
  ktKitaplikIsaretBos: {
    tr: "Henüz işaret yok — Kur'an ekranında sureyi açıp ayetlerin yanındaki 🔖 simgesiyle işaretleyince burada birikir.",
    en: "No bookmarks yet — open a surah in the Qur'an screen and tap the 🔖 icon next to a verse; they gather here.",
    ar: "لا تعليِم بعد — افتح سورة في شاشة القرآن واضغط أيقونة 🔖 بجوار الآية، تتجمع هنا.",
    id: "Belum ada tanda — buka surah di layar Al-Qur'an lalu ketuk ikon 🔖 di samping ayat; terkumpul di sini.",
    ur: "ابھی کوئی نشان نہیں — قرآن اسکرین سے سورہ کھولیں اور آیت کے پاس 🔖 دبائیں، سب یہاں جمع ہوگا۔",
  },
  ktKitaplikNotlar: { tr: "📝 Notlarım", en: "📝 My Notes", ar: "📝 ملاحظاتي", id: "📝 Catatanku", ur: "📝 میری نوٹس" },
  ktKitaplikNotBos: {
    tr: "Not yok — menüden \"Ayet Notlarım\"a girip ilk notunu yaz.",
    en: "No notes yet — open \"Ayat Notlarım\" from the menu and write your first one.",
    ar: "لا ملاحظات — افتح \"ملاحظات الآيات\" من القائمة واكتب أول ملاحظة.",
    id: "Belum ada catatan — buka \"Catatan Ayat\" dari menu dan tulis yang pertama.",
    ur: "کوئی نوٹ نہیں — مینو سے \"آیت نوٹس\" کھول کر پہلا نوٹ لکھیں۔",
  },
  ktKitaplikVideolar: { tr: "🎬 İndirdiğin Videolar", en: "🎬 Downloaded Videos", ar: "🎬 الفيديوهات المحمَّلة", id: "🎬 Video yang Diunduh", ur: "🎬 ڈاؤن لوڈ کی گئی ویڈیوز" },
  ktKitaplikVideoBilgi: {
    tr: "İndirdiğin videolar cihazında (IndexedDB) saklanır — video üretim ekranının sonuç listesinden istediğin zaman tekrar indirebilirsin.",
    en: "Downloaded videos are stored on your device (IndexedDB) — you can re-download them any time from the result list of the video creation screen.",
    ar: "الفيديوهات المحمَّلة تُخزَّن على جهازك (IndexedDB) — يمكنك إعادة تحميلها في أي وقت من قائمة النتائج في شاشة إنشاء الفيديو.",
    id: "Video yang diunduh disimpan di perangkatmu (IndexedDB) — kamu dapat mengunduhnya kembali kapan saja dari daftar hasil layar pembuatan video.",
    ur: "ڈاؤن لوڈ ویڈیوز آپ کے ڈیوائس میں محفوظ ہیں (IndexedDB) — ویڈیو بنانے کی اسکرین کی نتائج فہرست سے کسی بھی وقت دوبارہ ڈاؤن لوڈ کریں۔",
  },
};

for (const dil of ["tr", "en", "ar", "id", "ur"]) {
  const dosya = path.join(I18N, `dicts.${dil}.json`);
  const dict = JSON.parse(fs.readFileSync(dosya, "utf8"));
  let ekle = 0, zaten = 0;
  for (const [k, v] of Object.entries(KOMUT)) {
    if (dict[k] !== undefined && dict[k] !== "") { zaten++; continue; }
    dict[k] = v[dil];
    ekle++;
  }
  fs.writeFileSync(dosya, JSON.stringify(dict, null, 2) + "\n", "utf8");
  console.log(`✓ ${dil}: +${ekle} yeni, ${zaten} zaten vardı`);
}
console.log("Bitti.");
