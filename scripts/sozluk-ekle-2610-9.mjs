// ════════════════════════════════════════════════════════
// 26.10 — SÖZLÜK EKLE-9: kullanıcı-yüzlü kalan TR kalatları
//   (KabeCanli, Bakım, Asistan, SiteHakkinda, Quran Learn/Sayfalar,
//    Seslendirme, KendiSes, Üretim Onayı, Zip...) — 5 dil.
//   Çalıştırma: node scripts/sozluk-ekle-2610-9.mjs
// ════════════════════════════════════════════════════════
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const KO = path.dirname(fileURLToPath(import.meta.url));
const I18N = path.join(KO, "..", "src", "i18n");

// ✦ ck = Kâbe Canlı · mt = Bakım · as = Asistan · sh = Site Hakkında
// ✦ qk = Kur'an modal · qs = Kur'an Sayfalar · tf = Tefsir
// ✦ sk = Seslendirme kontroller · sm = Sesli Meal başlık · ov = Önerilen
// ✦ rs = Üretim onayı/telif · ks2 = Kendi Ses · dy = Şifre/yanıt vs.
const KOMUT = {
  // ── Kâbe Canlı ──
  ckBaslik: { tr: "🕋 Kâbe — Mescid-i Haram Canlı Yayın", en: "🕋 Kaaba — Grand Mosque Live", ar: "🕋 الكعبة — البث المباشر من الحرم", id: "🕋 Ka'bah — Siaran Langsung Masjidil Haram", ur: "🕋 کعبة — مسجد حرام کا براہ راست نش" },
  ckTitleTvl: { tr: "Suudi resmî Quran TV — kesintisiz Kur'an tilaveti ve Mekke/Medine ibadet görüntüleri", en: "Official Saudi Quran TV — uninterrupted Qur'an recitation and Makkah/Madinah worship footage", ar: "قناة القرآن الرسمية السعودية — تلاوة قرآن بلا انقطاع ومشاهد العبادة من مكة والمدينة", id: "Quran TV resmi Saudi — tilawah Al-Qur'an tanpa putus dan suasana ibadah Makkah/Madinah", ur: "سعودی سرکاری قرآن TV — بلا رکاوٹ قرآنی تلاوت اور مکہ/مدینہ کی عبادت کے مناظر" },
  ckTitleNebi: { tr: "Mescid-i Nebi (Medine) resmî Suudi Sunnah TV — kesintisiz yayın, YouTube'suz", en: "Prophet's Mosque (Madinah) official Saudi Sunnah TV — seamless stream, no YouTube", ar: "المسجد النبوي (المدينة) قناة السنة الرسمية السعودية — بث متواصل بدون يوتيوب", id: "Masjid Nabawi (Madinah) Sunnah TV resmi Saudi — siaran berkelanjutan tanpa YouTube", ur: "مسجد نبوی (مدینہ) سعودی سنّہ TV — تسلسل کے ساتھ نش، یوٹیوب کے بغیر" },
  ckSes: { tr: "🔇 Ses için ekrana dokun", en: "🔇 Tap the screen for sound", ar: "🔇 المس الشاشة للصوت", id: "🔇 Ketuk layar untuk suara", ur: "🔇 آواز کے لیے اسکرین دبائیں" },
  ckBaglaniyor: { tr: "Canlı yayına bağlanıyor…", en: "Connecting to the live stream…", ar: "يتصل بالبث المباشر…", id: "Menyambung ke siaran langsung…", ur: "براہ راست نش سے جُوڑا جا رہا ہے…" },
  ckAçilamadı: { tr: "Yayın şu an açılamadı", en: "The stream could not be opened right now", ar: "لم يمكن فتح البث الآن", id: "Siaran belum bisa dibuka", ur: "نش ابھی نہیں کھل سکا" },
  // ── Bakım ekranı ──
  mtBaslik: { tr: "Nûr Stüdyo kısa süreli bakımda", en: "Nûr Stüdyo is briefly under maintenance", ar: "نور ستوديو في صيانة قصيرة", id: "Nûr Stüdyo sedang pemeliharaan singkat", ur: "نور اسٹوڈیو مختصر مرمت میں ہے" },
  mtBitti: { tr: "Bakım tamamlandı — site açılıyor…", en: "Maintenance done — the site is opening…", ar: "انتهت الصيانة — يفتح الموقع…", id: "Pemeliharaan selesai — situs terbuka…", ur: "مرمت مکمل — سائٹ کھل رہی ہے…" },
  mtOk: { tr: "✅ Tamam — bakım bitince bildirim alacaksın", en: "✅ Okay — you'll get a notice when maintenance ends", ar: "✅ حسنًا — ستحصل على إشعار عند انتهاء الصيانة", id: "✅ Oke — kamu akan diberi tahu saat pemeliharaan usai", ur: "✅ ٹھیک — مرمت ختم ہونے پر اطلاع ملے گی" },
  mtNot: { tr: "Güncelleme tamamlandığında site otomatik olarak açılacaktır.", en: "When the update completes, the site will open automatically.", ar: "عند اكتمال التحديث يفتح الموقع تلقائيًا.", id: "Saat pembaruan selesai, situs terbuka otomatis.", ur: "اپ ڈیٹ مکمل ہوں گی تو سائٹ خودبخود کھل جائے گی۔" },
  // ── Asistan baloncuğu ──
  asBalonTitle: { tr: "Nûr Asistan — SSS & Yardım", en: "Nûr Assistant — FAQ & Help", ar: "مساعد نور — الأسئلة والمساعدة", id: "Asisten Nûr — Tanya Jawab & Bantuan", ur: "نور معاون — عمومی سوالات و مدد" },
  asSohtai: { tr: "Nûr Asistan Sohbetini Aç", en: "Open Nûr Assistant Chat", ar: "افتح محادثة مساعد نور", id: "Buka Obrolan Asisten Nûr", ur: "نور معاون گفتگو کھولیں" },
  asUcretsiz: { tr: "💚 Ücretsiz · Anında · SSS", en: "💚 Free · Instant · FAQ", ar: "💚 مجانًا · فورًا · أسئلة شائعة", id: "💚 Gratis · Sesaat · Tanya Jawab", ur: "💚 مفت · فوری · عمومی سوالات" },
  asBaskaKipler: { tr: "Başka soru çipleri getir", en: "Fetch more question chips", ar: "أحضر أسئلة أخرى", id: "Ambil chip pertanyaan lain", ur: "مزید سوال چپس لائیں" },
  asPlaceholder: { tr: "Sorunuzu yazın…", en: "Type your question…", ar: "اكتب سؤالك…", id: "Tulis pertanyaanmu…", ur: "اپنا سوال لکھیں…" },
  asGonder: { tr: "Gönder", en: "Send", ar: "إرسال", id: "Kirim", ur: "بھیجیں" },
  // ── Site Hakkında ──
  shTanitim: { tr: "Siteyi 2 dakikada tanı — girince aç, izleyin", en: "Know the site in 2 minutes — opens on entry, enjoy", ar: "تعرّف على الموقع في دقيقتين — يُفتح عند الدخول، شاهد", id: "Kenali situs dalam 2 menit — terbuka saat masuk, nonton", ur: "سائٹ کو 2 منٹ میں جانیں — آنے پر کھلتا ہے، دیکھیں" },
  shVideoTitle: { tr: "Nûr Stüdyo Tanıtım Videosu", en: "Nûr Stüdyo Promo Video", ar: "فيديو تعريفي لنور ستوديو", id: "Video Promosi Nûr Stüdyo", ur: "نور اسٹوڈیو تعارفی ویڈیو" },
  // ── Kur'an modal başlıkları ──
  qkKilitUyku: { tr: "Gözlerini dinlendir… ses sürüyor · kilit ekranından kontrol edebilirsin", en: "Rest your eyes… audio continues · you can control it from the lock screen", ar: "أرِح عينيك… الصوت مستمر · يمكنك التحكم من شاشة القفل", id: "Istirahatkan mata… audio jalan · bisa dikontrol dari kunci layar", ur: "آنکхиں آرام کرو… آواز جاری · لاک اسکرین سے کنٹرول ہو سکتا ہے" },
  qkKabeTitle: { tr: "Mescid-i Haram'dan 7/24 kesintisiz canlı yayın", en: "24/7 seamless live stream from the Grand Mosque", ar: "بث مباشر متواصل 24/7 من الحرم", id: "Siaran langsung 24/7 tanpa putus dari Masjidil Haram", ur: "مسجد حرام سے 24/7 بلا رکاوٹ براہ راست نش" },
  qkMushafTitle: { tr: "Mushaf sayfaları — büyüt/küçült, tam ekran, kaldığın yerden devam + hatim sayacı", en: "Mushaf pages — zoom, fullscreen, resume where you left + hatim counter", ar: "صفحات المصحف — تكبير وتصغير، شاشة كاملة، متابعة من حيث توقفت + عداد الختمة", id: "Halaman mushaf — zoom, layar penuh, lanjut dari posisi terakhir + penghitung khatam", ur: "مصحف کے صفحات — زوم، فل اسکرین، پچھلی جگہ سے متسلسل + ختمہ کاؤنٹر" },
  qkYeni: { tr: "YENİ", en: "NEW", ar: "جديد", id: "BARU", ur: "نیا" },
  qkDevamTitle: { tr: "Devamını getir: ayetin yarısını gösterir, sen tamamını seç", en: "Continue: shows half the verse, you pick the ending", ar: "أكمل: يعرض نصف الآية وأنت تختار الخاتمة", id: "Lanjutkan: tampilkan separuh ayat, kamu pilih akhirnya", ur: "آگے لائیں: نصف آیت دکھاتا ہے، آپ ختم انتخاب کریں" },
  qkRadyoTitle: { tr: "7/24 kesintisiz Kur'an radyosu — hoca seçenekli canlı tilavet", en: "24/7 seamless Qur'an radio — live recitations with reciter options", ar: "راديو قرآن 24/7 بلا انقطاع — تلاوات حية بخيارات القراء", id: "Radio Al-Qur'an 24/7 tanpa putus — tilawah langsung dengan pilihan qari", ur: "24/7 بلا رکاوٹ قرآنی ریڈیو — قاری اختیارات کے ساتھ براہ راست تلاوت" },
  qkAraclarTitle: { tr: "Nûr Araçları — hatim takibi, sevap sayacı, zikirmatik", en: "Nûr Tools — hatim tracking, sevap counter, tasbih counter", ar: "أدوات نور — متابعة الختمة، عدّاد الصلوات، عدّاد الذکر", id: "Alat Nûr — pelacak khatam, penghitung amal, zikirmatik", ur: "نور ٹولز — ختمہ تال، ثواب کاؤنٹر، زکرماتک" },
  qkRadyoSec: { tr: "Radyo kanalı seç", en: "Choose radio channel", ar: "اختر قناة الراديو", id: "Pilih kanal radio", ur: "ریڈیو چینل منتخب کریں" },
  // ── Tefsir ──
  tfYukle: { tr: "Tefsir yükleniyor…", en: "Loading tafsir…", ar: "جارٍ تحميل التفسير…", id: "Memuat tafsir…", ur: "تفسیر لوڈ ہو رہا ہے…" },
  tfBulunamadi: { tr: "Bu ayet için bu tefsirde metin bulunamadı — başka tefsir seç.", en: "No text for this verse in this tafsir — pick another.", ar: "لا نص لهذه الآية في هذا التفسير — اختر تفسيرًا آخر.", id: "Tidak ada teks untuk ayat ini di tafsir ini — pilih tafsir lain.", ur: "اس آیت کے لیے اس تفسیر میں نہیں — دوسری تفسیر انتخاب کریں۔" },
  // ── Kur'an Sayfalar ──
  qsKapat: { tr: "Sayfaları kapat (Kur'an ekranı açık kalır)", en: "Close pages (Qur'an screen stays open)", ar: "أغلق الصفحات (تبقى شاشة القرآن)", id: "Tutup halaman (layar Al-Qur'an tetap terbuka)", ur: "صفحات بند کریں (قرآن اسکرین کھلی رہے گی)" },
  qsKaynakLabel: { tr: "Görünüm kaynağı", en: "View source", ar: "مصدر العرض", id: "Sumber tampilan", ur: "نظارہ کا ماخذ" },
  qsMushafTitle: { tr: "Diyanet mushafı — beyaz sayfa, gerçek Kral Fahd Hafs hatlı mushaf", en: "Diyanet mushaf — white pages, authentic King Fahd Hafs-script mushaf", ar: "مصحف الديانة — صفحات بيضاء، مصحف الملك فهد بخط حفص أصيل", id: "Mushaf Diyanet — halaman putih, mushaf Ulang Raja Fahd tepat dengan tulisan Hafs", ur: "د طریقہ مصحف — سفید صفحات، اصل ملک فہدہ حفص رسم مصحف" },
  qsMealTitle: { tr: "Diyanet İşleri Başkanlığı meali — sayfa sayfa Türkçe çeviri (beyaz sayfa)", en: "Diyanet translation — page-by-page Turkish rendering (white pages)", ar: "ترجمة الديانة — ترجمة تركية صفحة صفحة (صفحات بيضاء)", id: "Terjemahan Diyanet — per halaman bahasa Turki (halaman putih)", ur: "د طریقہ ترجمہ — صفہ بہ صفہ ترک ترجمہ (سفید صفحات)" },
  qsSonSayfa: { tr: "Son okuduğun sayfa", en: "The page you last read", ar: "الصفحة التي توقفت عندها", id: "Halaman terakhir yang kamu baca", ur: "آخری صفحہ جو پڑھی" },
  qsSureBaslar: { tr: "Bu sayfada sure başlar", en: "A surah starts on this page", ar: "تبدأ سورة في هذه الصفحة", id: "Surah mulai di halaman ini", ur: "اس صفحے پر سورہ شروع ہوتی ہے" },
  qsZoomTitle: { tr: "Çift tıkla büyüt/küçült · Ctrl+tekerlek zoom · kenarlara tıkla: sayfa çevir", en: "Double-tap to zoom · Ctrl+wheel zoom · tap the edges: flip page", ar: "نقرة مزدوجة للتكبير · Ctrl + التمرير · اضغط الحواف لتقليب الصفحة", id: "Ketuk ganda untuk abloom · Ctrl+roda zoom · ketuk tepi: ganti halaman", ur: "دوہری کلیک سے زوم · Ctrl+ویل زوم · کنارے دبائیں: صفحہ پرت" },
  qsMalYukleBasarisiz: { tr: "Diyanet meal sayfası şu an yüklenemedi — bağlantını kontrol edip tekrar dener misin?", en: "The Diyanet page could not load now — check your connection and retry?", ar: "لم تُحمَّل صفحة الديانة الآن — تحقق من اتصالك وأعد المحاولة؟", id: "Halaman Diyanet belum termuat — periksa sambunganmu dan coba lagi?", ur: "د طریقہ صفحہ ابھی لوڈ نہیں ہوئی — رابطہ چیک کر دوبارہ کوشش کرتے ہیں؟" },
  qsYukleBasarisiz: { tr: "Sayfa yüklenemedi — internet bağlantını kontrol et. Tüm görüntü kaynakları denenmiş.", en: "Page failed to load — check your internet. All image sources tried.", ar: "لم تُحمَّل الصفحة — تحقق من اتصالك بإنترنت. جُربت كل مصادر الصور.", id: "Halaman gagal termuat — periksa internetmu. Semua sumber gambar dicoba.", ur: "صفحہ لوڈ نہیں ہوو — انٹرنیٹ چیک کریں۔ تمام تصویری ماخذ آزمائے گئے۔" },
  qsOnceki: { tr: "← Önceki sayfa", en: "← Previous page", ar: "← الصفحة السابقة", id: "← Halaman sebelumnya", ur: "← پچھلا صفحہ" },
  qsSonraki: { tr: "Sonraki sayfa →", en: "Next page →", ar: "الصفحة التالية →", id: "Halaman berikutnya →", ur: "اگلا صفحہ →" },
  qsSayfaN: { tr: "Sayfa {n}", en: "Page {n}", ar: "صفحة {n}", id: "Halaman {n}", ur: "صفحہ {n}" },
  qsYukleniyor: { tr: "Sayfa yükleniyor…", en: "Loading page…", ar: "جارٍ تحميل الصفحة…", id: "Memuat halaman…", ur: "صفحہ لوڈ ہو رہا ہے…" },
  qsGeriDön: { tr: "← Kur'an'a dön", en: "← Back to Qur'an", ar: "← رجوع إلى القرآن", id: "← Kembali ke Al-Qur'an", ur: "← قرآن سے واپس" },
  qsOkunan: { tr: "Okunan: sayfa {n}", en: "Reading page {n}", ar: "القراءة: صفحة {n}", id: "Membaca halaman {n}", ur: "پڑھ rahe hain: صفحہ {n}" },
  qsHatimNot: { tr: "Okunan sayfa hatim sayacına işlenir ✓", en: "Read pages go into your hatim counter ✓", ar: "الصفحات المقروءة تُحسب في عداد الختمة ✓", id: "Halaman yang dibaca masuk penghitung khatam ✓", ur: "پڑھے گئے صفحہ ختمہ کاؤنٹر میں داخل ✓" },
  qsZoomIn: { tr: "Büyüt", en: "Zoom in", ar: "تكبير", id: "Perbesar", ur: "بڑھا" },
  qsZoomOut: { tr: "Küçült", en: "Zoom out", ar: "تصغير", id: "Perkecil", ur: "छوٹا" },
  qsKaynakMushaf: { tr: "Mushaf", en: "Mushaf", ar: "مصحف", id: "Mushaf", ur: "مصحف" },
  qsKaynakMeal: { tr: "Meali", en: "Translation", ar: "الترجمة", id: "Terjemahan", ur: "ترجمہ" },
  // ── Seslendirme kontroller ──
  skKutuphane: { tr: "📖 KÜTÜPHANE & AYET ARAMA", en: "📖 LIBRARY & VERSE SEARCH", ar: "📖 المكتبة والبحث في الآيات", id: "📖 PERPUSTAKAAN & CARI AYAT", ur: "📖 لائibrary & آیت تال" },
  skSureEkle: { tr: "📚 Tüm Sureyi Ekle", en: "📚 Add Whole Surah", ar: "📚 أضف السورة كاملة", id: "📚 Tambahkan Seluruh Surah", ur: "📚 پوری سورہ شامل کریں" },
  skAzalt: { tr: "Bölüm sayısını azalt — fazla parçalar komşu birleşimiyle birleşir", en: "Reduce section count — excess parts merge with neighbors", ar: "قلّص عدد المقاطع — الأجزاء الزائدة تندمج مع جيرانها", id: "Kurangi jumlah bagian — bagian berlebih meratau dengan tetangga", ur: "بعض کی تعداد کم کریں — زائد حصے پڑوسیوں سے مُل دیتے ہیں" },
  skTemizle: { tr: "Tüm bölümleri tek seferde temizle", en: "Clear all sections in one go", ar: "أمسح كل المقاطع مرة واحدة", id: "Bersihkan semua bagian sekaligus", ur: "تمام علاقہ ایک ساتھ صاف کریں" },
  skDinle: { tr: "Bu bölümü dinle — aynı zaman arka plan paneli de açılır", en: "Listen to this section — the backdrop panel also opens at the same time", ar: "استمع لهذا المقطع — تفتح لوحة الخلفية في الوقت نفسه", id: "Dengarkan bagian ini — panel latar juga terbuka bersamaan", ur: "یہ حصہ سنیں — اسی وقت پس منظر پینل بھی کھلتا ہے" },
  skSeslendir: { tr: "🔊 SESLENDİR", en: "🔊 SPEAK", ar: "🔊 نطق", id: "🔊 BICARAKAN", ur: "🔊 بول" },
  skIndir: { tr: "Bölümleri (yoksa seçili ayet/meti) tek ses dosyası olarak indir (WAV — tamamı işlenemezse parçalı uyari verir)", en: "Download sections (or the selected verse/text) as a single audio file (WAV — warns in parts if full export can't run)", ar: "حمّل المقاطع (أو الآية/النص المختار) كملف صوتي واحد (WAV — تنبيه بالجزء إن تعذر التصدير الكامل)", id: "Unduh bagian (atau ayat/teks terpilih) sebagai satu berkas audio (WAV — memberi tahu per bagian bila ekspor penuh tak bisa jalan)", ur: "علاقہ (یا منتخب آیت/نص) ایک آڈیو فائل ke rúeپ میں ڈاؤن لوڈ (WAV — پورا ممکن نہ ہو تو انتباہ)" },
  skAkilliAI: { tr: "Bölümlerin atmosferini zekice yeniden seç — emin olmadığını Musaf yapar", en: "Smartly re-pick atmospheres for sections — decides for you when unsure", ar: "يرجى اختيار أجواء المقاطع ذكيًّا — يحسم لك عند الشك", id: "Pintar memilih ulang atmosfer bagian — memutuskan untukmu saat ragu", ur: "علاقہ کی فضا ذہانت سے دوبارہ چُنیں — شک ہو تو آپ کے لیے فیصلہ" },
  skAI: { tr: "🤖 Akıllı AI", en: "🤖 Smart AI", ar: "🤖 ذكاء ذكي", id: "🤖 AI Cerdas", ur: "🤖 ذہین AI" },
  // ── Sesli Meal modal ──
  smBaslik: { tr: "SESLİ MEAL", en: "AUDIO MEAL", ar: "وصف مسموع", id: "MEAL SUARA", ur: "سُنی ترجمہ" },
  smGelistirme: { tr: "Seslendirme şu an geliştirme özelliği", en: "Voiceover is currently a development feature", ar: "التسجيل الصوتي حاليًا ميزة تطوير", id: "Sulih suara saat ini fitur pengembangan", ur: "آواز ان کی فی الحال ترقیاتی خصوصیت" },
  smAksiyon: { tr: "çalıştır → sayfayı yenile", en: "run → refresh the page", ar: "شغّل → حدّث الصفحة", id: "jalankan → muat ulang halaman", ur: "چلائیں → صفحہ تازہ کریں" },
  // ── Önerilen videolar ──
  ovBugun: { tr: "bugün hazır", en: "ready today", ar: "جاهز اليوم", id: "siap hari ini", ur: "آج تیار" },
  ovOnerTitle: { tr: "Yeni taslaklar öner", en: "Suggest new drafts", ar: "اقترح مسودات جديدة", id: "Usulkan draf baru", ur: "نئے مسودہ پیش کرو" },
  ovTekTik: { tr: "tek tıkla üretim", en: "one-tap creation", ar: "إنشاء بنقرة واحدة", id: "pembuatan sekali ketuk", ur: "ایک کلک سے تیاری" },
  // ── App 😊 loader ──
  appYukle: { tr: "NÛR STÜDYO yükleniyor...", en: "Loading NÛR STÜDYO...", ar: "جارٍ تحميل نور ستوديو...", id: "Memuat NÛR STÜDYO...", ur: "نور اسٹوڈیو لوڈ ہو رہا..." },
  // ── Hata sınırı ──
  ebNot: { tr: "Diğer bölümler çalışmaya devam ediyor.", en: "Other sections keep working.", ar: "تابع العمليات لبقية الأقسام.", id: "Bagian lain tetap bekerja.", ur: "دوسركے متال کار میں باقی ہیں۔" },
  // ── Üretim onayı / telif ──
  rsRiskYuksek: { tr: "Yüksek Telif Riski", en: "High Copyright Risk", ar: "خطر حقوق ملكية عالٍ", id: "Risiko Hak Cipta Tinggi", ur: "زیادہ حقوق الشری خطر" },
  rsOnay: { tr: "Bilgilendirilmiş onay gerekiyor", en: "Informed consent required", ar: "مطلوب موافقة مستنيرة", id: "Diperlukan persetujuan terinformasi", ur: "باهد استوں دائرہ ضروری" },
  rsYuksek: { tr: "YÜKSEK", en: "HIGH", ar: "عالي", id: "TINGGI", ur: "اعلی" },
  rsYoutube: { tr: "• YouTube/Instagram vb. platformlarda Content ID telif uyarısı alabilirsiniz", en: "• On YouTube/Instagram and alike you may get Content ID copyright warnings", ar: "• على يوتيوب/إنستغرام وغيرها قد تتلقى تنبيهات المحتوى", id: "• Di YouTube/Instagram dsb. bisa menerima peringatan Hak Cipta Content ID", ur: "• یوٹیوب/انسٹاگرام وغیرہ پر Content ID انتباہ مل سکتا ہے" },
  rsKalkabilir: { tr: "• Video kaldırılabilir veya kanalınız tehlikeye girebilir", en: "• The video may be removed or your channel put at risk", ar: "• قد يُحذف الفيديو أو تتعرض قناتك للخطر", id: "• Video bisa dihapus atau kanalmu terancam", ur: "• ویڈیو ہٹا دیا جا سکتا یا چینل خطر میں پڑ سکتا" },
  rsSorumluluk: { tr: "• Tüm yayın sorumluluğu size aittir (Nûr Stüdyo hukuki sorumluluk kabul etmez)", en: "• All publication responsibility is yours (Nûr Stüdyo takes no legal responsibility)", ar: "• كل مسؤولية النشر عليك (نور ستوديو لا تقبل مسؤولية قانونية)", id: "• Seluruh tanggung jawab publikasi padamu (Nûr Stüdyo tidak menerima tanggung jawab hukum)", ur: "• تمام اشہا مقام آپ کے ذمے (نور اسٹوڈیو کوئی ذمہ داری قبول نہیں کریگی)" },
  rsOnayBaslik: { tr: "Üretim Onayı", en: "Production Confirmation", ar: "تأكيد الإنتاج", id: "Konfirmasi Produksi", ur: "تیاری کی تصدیق" },
  rsTur: { tr: "Üretim türü", en: "Production type", ar: "نوع الإنتاج", id: "Jenis produksi", ur: "تیاری کی قسم" },
  rsFormat: { tr: "Format sayısı", en: "Number of formats", ar: "عدد الصيغ", id: "Jumlah format", ur: "فارمیٹ کی تعداد" },
  rsSonra: { tr: "Üretim sonrası", en: "After production", ar: "بعد الإنتاج", id: "Setelah produksi", ur: "تیاری کے بعد" },
  rsOnayla: { tr: "Onaylıyorum, üret", en: "I confirm, produce", ar: "أوافق، أنتج", id: "Saya setuju, buat", ur: "میں متفق ہوں، بن田野" },
  rsVazgec: { tr: "Vazgeç", en: "Cancel", ar: "إلغاء", id: "Batal", ur: "چھوڑ دیں" },
  // ── Kendi Ses modal ──
  ks2Hanim: { tr: "🕌 Hanım kardeşlerimiz için hatırlatma", en: "🕌 A reminder for our sisters", ar: "🕌 تذكير لأخواتنا", id: "🕌 Pengingat untuk saudari kita", ur: "مسلم بہنیوں کے لیے یاد دہانی" },
  ks2Baslik: { tr: "KENDİ SESİNLE ÜRET", en: "PRODUCE WITH YOUR OWN VOICE", ar: "أنشئ بصوتك", id: "PRODUKSI DENGAN SUARAMU", ur: "اپنی آواز سے تیاری" },
  ks2TamSure: { tr: "🎙️ Tüm Sure Ses", en: "🎙️ Whole-Surah Audio", ar: "🎙️ صوت السورة كاملة", id: "🎙️ Audio Seluruh Surah", ur: "🎙️ پوری سورہ آواز" },
  ks2AyetBasi: { tr: "🔢 Ayet Başına", en: "🔢 Per Verse", ar: "لكل آية 🔢", id: "🔢 Per Ayat", ur: "بہ ہر آیت 🔢" },
  ks2Elit: { tr: "ELİT ÜYELİK GEREKLİ", en: "ELİT MEMBERSHIP REQUIRED", ar: "يلزم اشتراك النخبة", id: "PERLU KEANGGOTAAN ELİT", ur: "ایلیٹ رکنیت ضروری" },
  ks2ElitM: { tr: "Kendi okuyuşunla video üret, ayet geçişleri sesine birebir senkron olsun. Her ayetin anlamları kayarak hızlanır.", en: "Produce videos with your own reading, with verse transitions synced exactly to your voice. Each verse's meaning glides in faster.", ar: "أنتج فيديو بقراءتك الخاصة حيث يتزامن انتقال الآيتين مع صوتك تمامًا. تتسارع معاني كل آية بانسيابية.", id: "Produksi video dengan bacaanmu, transisi ayat tersinkron sempurna ke suaramu. Makna tiap ayat bergulir lebih cepat.", ur: "اپنی پڑات سے ویڈیو بنائیں، آیت کے تباداه آپ کی آواز سے ہم آول ہو۔ ہر آیت کے معانی تیز گیست" },
  ks2Kapat: { tr: "Şimdilik kapat", en: "Close for now", ar: "أغلق الآن", id: "Tutup dulu", ur: "فی الحال بند کریں" },
  ks2SecSure: { tr: "— Sure seç —", en: "— Choose surah —", ar: "— اختر السورة —", id: "— Pilih surah —", ur: "— سورہ انتخاب —" },
  ks2Maks: { tr: "⏱ Maks süre", en: "⏱ Max duration", ar: "⏱ أقصى مدة", id: "⏱ Durasi maks", ur: "⏱ زیادہ مدت" },
  ks2SureNot: { tr: "0 sn = mod sınırı (kısa 59 · uzun 600 · tam 7200) — sınırın fazlası üretimde kullanılmadı.", en: "0 sec = mode limit (short 59 · long 600 · full 7200) — beyond the limit isn't used in production.", ar: "0 ثانية = حد الوضع (قصير 59 · طويل 600 · كامل 7200) — ما وراء الحد لا يُستخدم في الإنتاج.", id: "0 detik = batas mode (pendek 59 · panjang 600 · penuh 7200) — di luar batas tak dipakai saat produksi.", ur: "0 سیکنڈ = طریقہ کی حد (کوتاہ 59 · طویل 600 · مکمل 7200) — حد سے زیادہ تیاری میں نہیں۔" },
  // ── Kelime + ArkaPlan yaklaşık eşleştirme ──
  yaklasikVurus: { tr: "yaklaşık eňleme", en: "approximate match", ar: "تطابق تقريبي", id: "kecocokan kira-kira", ur: "کیا подход مطابق" },
  // ── Hafızlık ortakları ──
  htGrafikTitle: { tr: "Turun soru soru doğruluk grafiği", en: "Round-by-round accuracy graph", ar: "مخطط دقة الأدوار", id: "Grafik akurasi per babak", ur: "دور بہ دور درستی کی مینڈ" },
  htGrafik20: { tr: "Son 20 sorunun doğruluk çizgisi", en: "Accuracy line for the last 20 questions", ar: "خط دقة العشرين سؤالًا الأخيرة", id: "Garis akurasi 20 pertanyaan terakhir", ur: "آخری 20 سوال کی درستی کی لاصف" },
  htDonLinki: { tr: "Kur'an Öğren/Dinle ekranına dön", en: "Return to the Learn/Listen screen", ar: "العودة إلى شاشة التعلم/الاستماع", id: "Kembali ke layar Belajar/Dengar", ur: "سیکھ/سن لاک اسکرین سے واپس" },
  htDevam: { tr: "Kaldığın yerden devam", en: "Continue where you left", ar: "تابع من حيث توقفت", id: "Lanjut dari posisi terakhir", ur: "پچھلی جگہ سے متسلسل" },
  // ─️ Kesfet ek (289 & 312) ──
  ksfUyari: { tr: "⚠️ Buradaki cevaplar genel bilgi amaçlıdır — kendi fetvamızı vermeyiz, Diyanet'e ve âlimlerine bakın.", en: "⚠️ Answers here are general information — we don't give our own fatwā, consult Diyanet and scholars.", ar: "⚠️ الأجوبة هنا معلومات عامة — لا نُعطي فتوى، فارجع إلى الديانة والعلماء.", id: "⚠️ Jawaban di sini informasi umum — kami tidak memberi fatwa, lihat Diyanet dan ulama.", ur: "⚠️ یہاں کے جواب عمومی معلومات ہیں — ہم فتویٰ نہیں دیتے، د طریقہ اور عالم بخرو" },
  ksfGunun: { tr: "🌟 GÜNÜN KELİMELERİ", en: "🌟 WORD OF THE DAY", ar: "🌟 كلمات اليوم", id: "🌟 KATA HARI INI", ur: "🌟 آج کے الفاظ" },
  ksfGununNot: { tr: "her gün 5 yeni kelime — günlük seçim cihazının tarihine göre", en: "5 new words daily — the daily pick follows your device's date", ar: "5 كلمات الججديدة يوميًا — الاختيار اليومي حسب تاريخ جهازك", id: "5 kata baru tiap hari — pilihan harian mengikuti tanggal perangkatmu", ur: "ہر روز 5 نئے الفاظ — روزانہ انتخاب آپ کے آلے کی تاریخ سے" },
  ksfDuaNot: { tr: "Duruma göre dualar — ✓ ile okundu işaretle (takibin cihazında kalır)", en: "Situational supplications — mark as read with ✓ (tracking stays on your device)", ar: "أدعية حسب الحال — علّمها مقروءة بـ ✓ (المتابعة تبقى على جهازك)", id: "Doa sesuai situasi — tandai telah dibaca dengan ✓ (pelacakan tetap di perangkatmu)", ur: "حال کے مطابق دعائیں — ✓ سے پڑھے نشان لگائیں (تال آپ کے آلے میں رہتا ہے)" },
  ksfGununDua: { tr: "🌟 GÜNÜN DUASI", en: "🌟 SUPPLICATION OF THE DAY", ar: "🌟 دعاء اليوم", id: "🌟 DOA HARI INI", ur: "🌟 آج کی دعا" },
  ksfSureBulunamadi: { tr: "Aradığın sure listede yok — Arapça adıyla da deneyebilirsin (örn. الملك) ya da n.", en: "The surah you searched isn't listed — try its Arabic name too (e.g. الملك) or exact number.", ar: "السورة التي تبحث عنها غير مدرجة — جرّب اسمها العربي أيضًا (مثل الملك) أو رقمها الدقيق.", id: "Surah yang kamu cari tak terdaftar — cobalah nama Arabnya (mis. الملك) atau nomor tepatnya.", ur: "متلاشی سورہ فہرست میں نہیں — عربی نام سے بھی آزمائیں (مثلاً الملك) یا دہرائیں نمبر۔" },
  ksfGenislet: { tr: "Genişlet", en: "Expand", ar: "توسيع", id: "Perluas", ur: "بڑھاڑ" },
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
