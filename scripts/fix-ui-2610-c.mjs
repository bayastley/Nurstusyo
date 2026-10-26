// ════════════════════════════════════════════════════════
// 26.10 C TURU — kalan Türkçe metinler: sözlük + bağlama (5 dil)
// 1) SOZLUK → dicts.{tr,en,ar,id,ur}.json'a EKLENİR (varsa atlanır)
// 2) ISLEMLER → bileşenlerdeki ham metinler tt/ttX2610 çağrısına çevrilir
// ════════════════════════════════════════════════════════
import fs from "node:fs";

// [anahtar, tr, en, ar, id, ur]
const SOZLUK = [
  // ── ortak rozet/buton ──
  ["tierElit", "ELİT", "ELITE", "النخبة", "ELITE", "ایلیٹ"],
  ["autElitYap", "ELİT YAP", "MAKE ELITE", "اجعلها نخبة", "JADI ELITE", "ایلیٹ بنائیں"],
  ["kapatBtn", "Kapat", "Close", "إغلاق", "Tutup", "بند کریں"],
  // ── ZipExplorer ──
  ["zxBaslik", "Medya Yükleme", "Media Upload", "تحميل الوسائط", "Unggah Media", "میڈیا اپلوڈ"],
  ["zxSub", "V3 · Admin · video, resim ve ses dosyaları — IndexedDB'de kalıcı saklanır", "V3 · Admin · video, image and audio files — stored permanently in IndexedDB", "V3 · المشرف · ملفات الفيديو والصور والصوت — تُخزَّن دائمًا في IndexedDB", "V3 · Admin · file video, gambar dan audio — tersimpan permanen di IndexedDB", "V3 · ایڈمن · ویڈیو، تصویر اور آڈیو فائلیں — IndexedDB میں مستقل محفوظ"],
  ["zxTurListe", "Video · Resim · Ses — diğer dosyalar reddedilir", "Video · Image · Audio — other files are rejected", "فيديو · صورة · صوت — تُرفض الملفات الأخرى", "Video · Gambar · Audio — file lain ditolak", "ویڈیو · تصویر · آڈیو — دیگر فائلیں مسترد"],
  ["zxSurukle", "Dosyaları sürükle ya da tıkla — video, resim, ses", "Drag files or click — video, image, audio", "اسحب الملفات أو انقر — فيديو، صورة، صوت", "Tarik file atau klik — video, gambar, audio", "فائلیں کھینچیں یا کلک کریں — ویڈیو، تصویر، آڈیو"],
  ["zxRedKurallar", "ZIP, PDF, kod vb. reddedilir · en fazla 200 MB", "ZIP, PDF, code etc. are rejected · max 200 MB", "تُرفض ZIP وPDF وملفات الشيفرة · 200 ميغابايت كحد أقصى", "ZIP, PDF, kode dll. ditolak · maks. 200 MB", "ZIP، PDF، کوڈ وغیرہ مسترد · زیادہ سے زیادہ 200 MB"],
  ["zxRedDesteklenmiyor", "{x} desteklenmiyor — yalnızca video/resim/ses kabul edilir", "{x} is not supported — only video/image/audio are accepted", "{x} غير مدعوم — يُقبل فيديو/صورة/صوت فقط", "{x} tidak didukung — hanya video/gambar/audio yang diterima", "{x} معاون نہیں — صرف ویڈیو/تصویر/آڈیو قبول ہے"],
  ["zxRedDesteklenmeyen", "desteklenmeyen dosya", "unsupported file", "ملف غير مدعوم", "file tidak didukung", "غیر معاون فائل"],
  ["zxRedBuyuk", "çok büyük ({x}) — en fazla 200 MB", "too large ({x}) — max 200 MB", "كبير جدًا ({x}) — 200 ميغابايت كحد أقصى", "terlalu besar ({x}) — maks. 200 MB", "بہت بڑی ({x}) — زیادہ سے زیادہ 200 MB"],
  ["zxBos", "Henüz dosya yok — yukarıdan ekle", "No files yet — add from above", "لا ملفات بعد — أضِف من الأعلى", "Belum ada file — tambahkan dari atas", "ابھی کوئی فائل نہیں — اوپر سے شامل کریں"],
  ["zxKaliciTitle", "Cihazında kalıcı saklandı — sayfayı yenilesen de kaybolmaz", "Stored permanently on your device — survives refresh", "مخزَّن دائمًا على جهازك — لا يضيع عند التحديث", "Tersimpan permanen di perangkatmu — tak hilang saat reload", "آپ کے ڈیوائس پر مستقل محفوظ — ریفریش پر ضائع نہیں ہوتی"],
  ["zxTemizle", "Tümünü temizle", "Clear all", "إزالة الكل", "Hapus semua", "سب صاف کریں"],
  ["zxEklendi", "Eklendi", "Added", "أُضيف", "Ditambahkan", "شامل ہو گئی"],
  ["zxKalici", "Kalıcı", "Permanent", "دائم", "Permanen", "دائمی"],
  // ── ModalsContainer: giriş/kurucu üretim ──
  ["mcbHosGeldinTitle", "Nûr Stüdyo'ya Hoş Geldiniz", "Welcome to Nûr Studio", "مرحبًا بك في استوديو نُور", "Selamat datang di Nûr Studio", "نور اسٹوڈیو میں خوش آمدید"],
  ["mcbGoogleTitle", "Google hesap seçici son admin hesabınla açılır — güvenlik zinciri yine sunucuda doğrulanır", "The Google account picker opens with your last admin account — the security chain is still verified on the server", "منتقي حسابات جوجل يفتح بآخر حساب مشرف لديك — يظل التحقق الأمني على الخادم", "Pemilih akun Google terbuka dengan admin terakhirmu — rantai keamanan tetap diverifikasi di server", "گوگل اکاؤنٹ منتخب کرنے والا آخری ایڈمن اکاؤنٹ سے کھلتا ہے — سلامتی کا چین پھر بھی سرور پر ہی تصدیق ہوتا ہے"],
  ["mcbUretimHakki", "+5 ⚡ Üretim hakkı", "+5 ⚡ Production credits", "+5 ⚡ رصيد إنتاج", "+5 ⚡ Kuota produksi", "+5 ⚡ پروڈکشن کریڈٹ"],
  ["mcbTamSurumAc", "Tam Sürümü Aç", "Unlock Full Version", "افتح النسخة الكاملة", "Buka Versi Penuh", "مکمل ورژن کھولیں"],
  ["mcbTamSurumModu", "Tam Sürüm modu", "Full Version mode", "وضع النسخة الكاملة", "Mode Versi Penuh", "مکمل ورژن موڈ"],
  ["mcbKarsiliginda", "karşılığında", "in exchange for", "مقابل", "sebagai gantinya", "کے بدلے"],
  ["mcbSuDenliAcilir", "boyunca açılacak. Bu işlem onaydan sonra bakiyenden düşer.", "will stay open. After approval this is deducted from your balance.", "سيبقى مفتوحًا. بعد التأكيد يُخصم من رصيدك.", "akan tetap terbuka. Setelah disetujui, saldo kamu terpotong.", "کھلا رہے گا۔ منظوری کے بعد آپ کے بیلنس سے کاٹ لیا جائے گا۔"],
  ["mcbVazgec", "Vazgeç", "Cancel", "إلغاء", "Batal", "منسوخ کریں"],
  ["mcbKurucu", "KURUCU GİRİŞİ", "FOUNDER SIGN-IN", "دخول المؤسس", "MASUK PENDIRI", "بانی لاگ اِن"],
  ["mcbKurucuAciklama", "Admin paneli için Google ile doğrulanmış admin oturumu gerekir", "The admin panel requires a Google-verified admin session", "تطلب لوحة المشرف جلسة مشرف موثَّقة عبر جوجل", "Panel admin memerlukan sesi admin terverifikasi Google", "ایڈمن پینل کے لیے گوگل سے تصدیق شدہ ایڈمن سیشن ضروری ہے"],
  ["mcbAyetStidyoya", "Ayeti Stüdyoya Ekle", "Add Verse to Studio", "أضِف الآية إلى الاستوديو", "Tambahkan Ayat ke Studio", "آیت اسٹوڈیو میں شامل کریں"],
  // ── QuranLearnModal ──
  ["qlmSayfalarTitle", "Mushaf sayfaları — büyüt/küçült, tam ekran, kaldığın yerden devam + hatim takibi", "Mushaf pages — zoom, fullscreen, resume where you left off + hatim tracking", "صفحات المصحف — تكبير/تصغير، ملء الشاشة، استئناف من حيث توقفت + تتبع الختم", "Halaman mushaf — zoom, layar penuh, lanjut dari posisi terakhir + pelacakan khataman", "مصحف صفحات — زوم، فل اسکرین، جہاں چھوڑا وہیں سے + ختمہ ٹریکنگ"],
  ["qlmYeni", "YENİ", "NEW", "جديد", "BARU", "نیا"],
  ["qlmRadyoTitle", "7/24 kesintisiz Kur'an radyosu — hoca seçenekli canlı tilavet", "24/7 uninterrupted Qur'an radio — live tilawat with reciter options", "راديو القرآن ٢٤/٧ دون انقطاع — تلاوة مباشرة مع اختيار القارئ", "Radio Al-Qur'an 24/7 tanpa gangguan — tilawah langsung dengan pilihan qari", "۲۴/۷ ناقابلِ قطع قرآن ریڈیو — قاری کے انتخاب کے ساتھ براہِ راست تلاوت"],
  // ── QuranSayfalar ──
  ["qsSayfalarKapat", "Sayfaları kapat (Kur'an ekranı açık kalır)", "Close pages (Qur'an screen stays open)", "أغلق الصفحات (تظل شاشة القرآن مفتوحة)", "Tutup halaman (layar Al-Qur'an tetap terbuka)", "صفحات بند کریں (قرآن اسکرین کھلی رہے گی)"],
  ["qsKaynakAria", "Görünüm kaynağı", "View source", "مصدر العرض", "Sumber tampilan", "دیکھنے کا ذریعہ"],
  ["qsMushafTitle", "Diyanet mushafı — beyaz sayfa, gerçek Kral Fahd Hafs hatlı mushaf", "Diyanet mushaf — white pages, the authentic King Fahd Hafs mushaf", "مصحف دياني — صفحات بيضاء، مصحف الملك فهد بحفص الأصلي", "Mushaf Diyanet — halaman putih, mushaf Raja Fahd Hafs asli", "دیانی مصحف — سفید صفحات، اصل کنگ فہد حفص مصحف"],
  ["qsMealTitle", "Diyanet İşleri Başkanlığı mealı — sayfa sayfa çeviri (beyaz sayfa)", "Diyanet translation — page-by-page rendering (white pages)", "ترجمة دياني — ترجمة صفحة صفحة (صفحات بيضاء)", "Terjemahan Diyanet — terjemah per halaman (halaman putih)", "دیانی ترجمہ — صفہ بہ صفہ ترجمہ (سفید صفحات)"],
  ["qsDevamTitle", "Son okuduğun sayfa: {x} — oradan devam et", "Last page you read: {x} — resume from there", "آخر صفحة قرأتها: {x} — أكمل منها", "Halaman terakhir yang kamu baca: {x} — lanjut dari sana", "آخری صفحہ جو پڑھا: {x} — وہیں سے جاری رکھیں"],
  ["qsSureBaslarTitle", "Bu sayfada sure başlar", "A surah starts on this page", "تبدأ سورة في هذه الصفحة", "Surah dimulai di halaman ini", "اس صفحے پر سورہ کا آغاز ہوتا ہے"],
  ["qsZoomTitle", "Çift tıkla büyüt/küçült · Ctrl+tekerlek zoom · kenarlara tıkla: sayfa çevir", "Double-click to zoom · Ctrl+wheel zoom · click edges to turn pages", "نقرة مزدوجة للتكبير · عجلة Ctrl للتكبير · انقر الحواف لتقليب الصفحات", "Klik ganda untuk zoom · Ctrl+roda untuk zoom · klik tepi untuk pindah halaman", "ڈبل کلک سے زوم · Ctrl+ہیم سے زوم · کناروں پر کلک سے صفحہ پلٹیں"],
  ["qsMealHata", "Diyanet meal sayfası şu an yüklenemedi — bağlantını kontrol edip tekrar dener misin?", "The Diyanet translation page couldn't load — check your connection and try again?", "تعذر تحميل صفحة ترجمة دياني — تحقق من اتصالك وحاول مجددًا", "Halaman terjemah Diyanet gagal dimuat — cek koneksimu dan coba lagi?", "دیانی ترجمہ صفحہ اِس وقت لوڈ نہیں ہو سکا — اپنا کنکشن چیک کر کے دوبارہ کوشش کریں؟"],
  ["qsYuklemeHatasi", "Sayfa yüklenemedi — internet bağlantını kontrol et. Tüm görüntü kaynakları denendi.", "Page couldn't load — check your internet. All image sources were tried.", "تعذر تحميل الصفحة — تحقق من إنترنتك. جُرِّبت جميع مصادر الصور.", "Halaman gagal dimuat — cek internetmu. Semua sumber gambar dicoba.", "صفحہ لوڈ نہیں ہوا — انٹرنیٹ چیک کریں۔ تمام تصویری ذرائع آزمائے گئے۔"],
  ["qsOncekiTitle", "← Önceki sayfa", "← Previous page", "← الصفحة السابقة", "← Halaman sebelumnya", "← پچھلا صفحہ"],
  ["qsOncekiAria", "Önceki sayfa", "Previous page", "الصفحة السابقة", "Halaman sebelumnya", "پچھلا صفحہ"],
  ["qsOncekiTitle2", "Önceki sayfa (←)", "Previous page (←)", "الصفحة السابقة (←)", "Halaman sebelumnya (←)", "پچھلا صفحہ (←)"],
  ["qsSayfaYazTitle", "Sayfa numarası yaz + Enter", "Type page number + Enter", "اكتب رقم الصفحة + إنتر", "Tulis nomor halaman + Enter", "صفحہ نمبر لکھیں + انٹر"],
  ["qsCuzTitle", "Cüze atla", "Jump to juz", "انتقل إلى الجزء", "Lompat ke juz", "پارے پر جائیں"],
  ["qsKucultTitle", "Küçült (−) · çift tık da çalışır", "Zoom out (−) · double-click also works", "تصغير (−) · النقرة المزدوجة تعمل أيضًا", "Perkecil (−) · klik ganda juga berfungsi", "چھوٹا کریں (−) · ڈبل کلک بھی چلتا ہے"],
  ["qsZoomAria", "Yakınlaşma oranı", "Zoom level", "نسبة التكبير", "Tingkat zoom", "زوم کی شرح"],
  ["qsBuyutTitle", "Büyüt (+) · çift tık da çalışır", "Zoom in (+) · double-click also works", "تكبير (+) · النقرة المزدوجة تعمل أيضًا", "Perbesar (+) · klik ganda juga berfungsi", "بڑا کریں (+) · ڈبل کلک بھی چلتا ہے"],
  // ── RoadmapModal ──
  ["rmOzellikAdiP", "Özellik adı", "Feature name", "اسم الميزة", "Nama fitur", "فیچر کا نام"],
  ["rmAciklamaP", "Açıklama", "Description", "الوصف", "Deskripsi", "تفصیل"],
  ["rmIptal", "İptal", "Cancel", "إلغاء", "Batal", "منسوخ"],
  ["rmDuzenle", "Düzenle", "Edit", "تحرير", "Sunting", "ترمیم"],
  ["rmBaslik", "Nûr Stüdyo — Gelecek planları ve v2-v3 yenilikleri", "Nûr Studio — future plans and v2-v3 updates", "استوديو نُور — الخطط المستقبلية وتحديثات v2-v3", "Nûr Studio — rencana mendatang dan pembaruan v2-v3", "نور اسٹوڈیو — آئندہ منصوبے اور v2-v3 اپڈیٹس"],
  ["rmOyBitisi", "Oylama Bitiş Tarihi:", "Voting deadline:", "موعد انتهاء التصويت:", "Tenggat waktu voting:", "ووٹنگ کی آخری تاریخ:"],
  ["rmKaldir", "Kaldır", "Remove", "إزالة", "Hapus", "ہٹائیں"],
  ["rmOzellikOrnekP", "Özellik adı (ör: AI Meal Seslendirme)", "Feature name (e.g., AI Translation Voice-over)", "اسم الميزة (مثال: تلاوة الترجمة بالذكاء الاصطناعي)", "Nama fitur (mis: Voice-over Terjemah AI)", "فیچر کا نام (مثلاً: AI ترجمہ وائس اوور)"],
  ["rmKisaAciklamaP", "Kısa açıklama (opsiyonel)", "Short description (optional)", "وصف قصير (اختياري)", "Deskripsi singkat (opsional)", "مختصر تفصیل (اختیاری)"],
  ["rmHangiOnde", "Hangi Özellik Önce Gelsin?", "Which feature comes first?", "أي ميزة تأتي أولًا؟", "Fitur mana yang dulu?", "کون سا فیچر پہلے؟"],
  ["rmSureDoldu", "⏰ Oylama süresi doldu", "⏰ Voting time is up", "⏰ انتهى وقت التصويت", "⏰ Waktu voting habis", "⏰ ووٹنگ کا وقت ختم"],
  ["rmIlkOyuSenVer", "✨ İlk oyu sen ver!", "✨ Cast the first vote!", "✨ اطلق التصويت الأول!", "✨ Beri suara pertama!", "✨ پہلا ووٹ آپ ڈالیں!"],
  ["rmAdminOzeti", "👑 Admin Özeti — En Çok Oy Alanlar", "👑 Admin Summary — Top Voted", "👑 ملخص المشرف — الأكثر تصويتًا", "👑 Ringkasan Admin — Paling Banyak Divoto", "👑 ایڈمن خلاصہ — سب سے زیادہ ووٹ"],
  ["rmSiraylaHayata", "🏆 En çok oy alan yenilikler oylama sonunda sırayla hayata geçirilir", "🏆 Top-voted updates are rolled out in order after the vote ends", "🏆 الجوائز الأكثر تصويتًا تُنفَّذ بالترتيب بعد انتهاء التصويت", "🏆 Pembaruan paling banyak divoto dijalankan berurutan setelah voting selesai", "🏆 سب سے زیادہ ووٹ پانے والی نئی چیزیں ووٹنگ کے بعد ترتیب سے نافذ ہوں گی"],
  ["rmYakinda", "Yakında Gelen Güncellemeler", "Updates Coming Soon", "تحديثات قادمة قريبًا", "Pembaruan Segera Hadir", "جلی آنے والی اپڈیٹس"],
  ["rmV2Bos", "Henüz V2 planı eklenmedi. İlk fikri sen belirle.", "No V2 plan added yet. You pick the first idea.", "لم تُضَف خطة V2 بعد. اختر الفكرة الأولى بنفسك.", "Belum ada rencana V2. Pilih ide pertamamu.", "ابھی کوئی V2 منصوبہ شامل نہیں۔ پہلا خیال آپ دیں۔"],
  ["rmV3Bos", "Henüz uzun vadeli plan eklenmedi. Birlikte şekillendireceğiz.", "No long-term plan added yet. We'll shape it together.", "لا خطة بعيدة المدى بعد. سنصممها معًا.", "Belum ada rencana jangka panjang. Kita bentuk bersama.", "ابھی طویل المدت منصوبہ شامل نہیں۔ مل کر تشکیل دیں گے۔"],
  ["rmSiraylaEklenecek", "Özellikler geliştirme sırasına göre eklenecektir", "Features will be added in development order", "تُضاف الميزات بحسب ترتيب التطوير", "Fitur akan ditambah sesuai urutan pengembangan", "فیچرز ترتیبِ ترقی کے مطابق شامل ہوں گے"],
  // ── KendiSesModal ──
  ["ksmAyetAyri", "Her ayeti ayrı yükle, sırayla birleşir", "Upload each verse separately; they merge in order", "ارفع كل آية على حدة؛ تُدمج بالترتيب", "Unggah tiap ayat terpisah; menyatu berurutan", "ہر آیت الگ اپلوڈ کریں، ترتیب سے یکجا ہوں گی"],
  ["ksmKaldir", "Kaldır (kayıtlar saklanır)", "Remove (recordings are kept)", "إزالة (تُحفظ التسجيلات)", "Hapus (rekaman tetap disimpan)", "ہٹائیں (ریکارڈنگ محفوظ رہے گی)"],
  ["ksmGecisler", "Ayet geçişleri (milisaniye)", "Verse transitions (milliseconds)", "انتقالات الآيات (بالمللي ثانية)", "Transisi antar ayat (milidetik)", "آیات کے درمیان وقفہ (ملی سیکنڈ)"],
  ["ksmArkaPlanTitle", "Ayet arka planı atanmış", "Verse background assigned", "خلفية الآية مُسندة", "Latar belakang ayat ditetapkan", "آیت کا بیک گراؤنڈ مختص ہے"],
  ["ksmHizali", "→ okuyuşunla hizalı", "→ aligned to your recitation", "→ متوافق مع تلاوتك", "→ sejalan dengan bacaanmu", "→ آپ کی تلاوت کے مطابق ہم آہنگ"],
  ["ksmNefes", "Ayetler arası nefes", "Breath gap between verses", "استراحة بين الآيات", "Jeda napas antar ayat", "آیات کے درمیان سانس کا وقفہ"],
  // ── DesignSettingsPanel ──
  ["dspMp4Title", "Bu kârinin sesiyle seçili ayeti video (MP4) olarak indir — mevcut atmosfer görseliyle", "Download the selected verse as a video (MP4) voiced by this reciter — using the current atmosphere image", "نزّل الآية المختارة فيديو (MP4) بصوت هذا القارئ — مع صورة الجو الحالية", "Unduh ayat terpilih sebagai video (MP4) bersuara qari ini — dengan gambar atmosfer saat ini", "منتخب آیت کو اس قاری کی آواز میں ویڈیو (MP4) کے طور پر ڈاؤن لوڈ کریں — موجودہ اٹموسفر تصویر کے ساتھ"],
  // ── HeaderTopBar ──
  ["htLogoAlt", "Nûr Stüdyo Logo", "Nûr Studio logo", "شعار استوديو نُور", "Logo Nûr Studio", "نور اسٹوڈیو لوگو"],
  ["htStudio", "STÜDYO", "STUDIO", "الاستوديو", "STUDIO", "اسٹوڈیو"],
  // ── seslendirmeKontroller ──
  ["skWavTitle", "Bölümleri (yoksa seçili ayet/meti) tek ses dosyası olarak indir (WAV — tarayıcı birleşimi)", "Download sections (or the selected verse/text) as one audio file (WAV — browser merge)", "نزّل الأقسام (أو الآية/النص المختار) في ملف صوتي واحد (WAV — دمج المتصفح)", "Unduh bagian (atau ayat/teks terpilih) sebagai satu file audio (WAV — penggabungan peramban)", "حصوں کو (یا منتخب آیت/متن کو) ایک ہی آڈیو فائل کے طور پر ڈاؤن لوڈ کریں (WAV — براؤزر کا ملانا)"],
  // ── AdminUsersTab ──
  ["autHediyeTitle", "Hediye ile birlikte verilecek üyelik seviyesi", "Membership tier granted with the gift", "مستوى العضوية الممنوح مع الهدية", "Tingkat keanggotaan yang diberikan bersama hadiah", "تحفے کے ساتھ دی جانے والی ممبرشپ"],
  ["autKayit", "Kayıt", "Sign-up", "التسجيل", "Pendaftaran", "رجسٹریشن"],
  ["autSonGuncelleme", "Son Güncelleme", "Last Updated", "آخر تحديث", "Pembaruan Terakhir", "آخری اپڈیٹ"],
  ["autCuzdanDurumu", "Cüzdan Durumu", "Wallet Status", "حالة المحفظة", "Status Dompet", "والٹ کی حالت"],
  ["autKisa", "Kısa:", "Short:", "مختصر:", "Singkat:", "مختصر:"],
  ["autAdminIslemleri", "Admin İşlemleri (son 10)", "Admin Actions (last 10)", "إجراءات المشرف (آخر 10)", "Tindakan Admin (10 terakhir)", "ایڈمن ایکشنز (آخری 10)"],
  ["autKart", "Seçili Kullanıcı Kartı", "Selected User Card", "بطاقة المستخدم المختارة", "Kartu Pengguna Terpilih", "منتخب یوزر کارڈ"],
  ["autUcretsiz", "🌱 Ücretsiz (Free)", "🌱 Free", "🌱 مجاني", "🌱 Gratis", "🌱 مفت"],
  ["autPro", "💎 Nûr Pro (Tüm videolar & 1080p)", "💎 Nûr Pro (all videos & 1080p)", "💎 نُور برو (كل الفيديوهات و1080p)", "💎 Nûr Pro (semua video & 1080p)", "💎 نور پرو (تمام ویڈیوز اور 1080p)"],
  ["autSelit", "👑 Nûr Elit (%100 Logosuz & Tüm Kâriler)", "👑 Nûr Elite (100% logo-free & all reciters)", "👑 نُور نخبة (بلا شعار 100% وكل القراء)", "👑 Nûr Elite (100% logo-free & semua qari)", "👑 نور ایلیٹ (100% لوگو فری اور تمام قاری)"],
  ["autHakSifirla", "⚖️ Tek Hak Sıfırla (kısmi ceza — üyeliği korur)", "⚖️ Single-Credit Reset (partial penalty — keeps membership)", "⚖️ تصفير حق واحد (عقوبة جزئية — تحفظ العضوية)", "⚖️ Reset Satu Kredit (hukuman parsial — keanggotaan dipertahankan)", "⚖️ ایک کریڈٹ ری سیٹ (جزوی سزا — ممبرشپ برقرار رہتی ہے)"],
  ["autAyniHakTitle", "Aynı hak + üyelik iptali", "Same credits + membership revoked", "نفس الحق + إلغاء العضوية", "Hak tetap + keanggotaan dicabut", "وہی کریڈٹ + ممبرشپ منسوخ"],
  ["autHakEkleTitle", "Seçili türe +{x} hak ekler", "Adds +{x} credits to the selected kind", "يضيف +{x} حقًا إلى النوع المختار", "Menambah +{x} kredit ke jenis terpilih", "منتخب قسم میں +{x} کریڈٹ کا اضافہ کرتا ہے"],
  ["autBanGerekce", "Mevcut Ban Gerekçesi:", "Current Ban Reason:", "سبب الحجب الحالي:", "Alasan Ban Saat Ini:", "موجودہ حجب کی وجہ:"],
  ["autBanP", "Örn: Telif ihlali, sahte jeton müdahalesi veya yasal suç...", "e.g., copyright violation, fake-token tampering, or a legal offense...", "مثال: انتهاك حقوق النشر، التلاعب بالعملات المزيفة أو جريمة قانونية...", "Mis: pelanggaran hak cipta, manipulasi token palsu, atau pelanggaran hukum...", "جیسے: کاپی رائٹ کی خلاف ورزی، جعلی ٹوکن چھیڑ چھاڑ یا قانونی جرم..."],
  // ── AdminModulesSyncTab ──
  ["amsBaslikP", "Modül Başlığı (ör: Günlük Zikirler)", "Module title (e.g., Daily Dhikr)", "عنوان الوحدة (مثال: أذكار يومية)", "Judul Modul (mis: Dzikir Harian)", "ماڈیول کا عنوان (مثلاً: روزانہ ذکر)"],
  ["amsUcretsiz", "Ücretsiz (Free)", "Free", "مجاني", "Gratis", "مفت"],
  ["amsV2", "V2 Güncellemesi Kilidi", "V2 Update Lock", "قفل تحديث V2", "Kunci Pembaruan V2", "V2 اپڈیٹ لاک"],
  ["amsV3", "V3 Güncellemesi Kilidi", "V3 Update Lock", "قفل تحديث V3", "Kunci Pembaruan V3", "V3 اپڈیٹ لاک"],
  ["amsPro", "Pro Üyelik Kilidi", "Pro Membership Lock", "قفل عضوية Pro", "Kunci Keanggotaan Pro", "پرو ممبرشپ لاک"],
  ["amsElit", "Elit Üyelik Kilidi", "Elite Membership Lock", "قفل عضوية Elite", "Kunci Keanggotaan Elite", "ایلیٹ ممبرشپ لاک"],
  ["amsAciklamaP", "Kısa Açıklama", "Short description", "وصف قصير", "Deskripsi singkat", "مختصر تفصیل"],
  ["amsSync", "100% Ücretsiz Sunucusuz Canlı Senkronizasyon", "100% Free Serverless Live Sync", "مزامنة مباشرة بلا خادم مجانية 100%", "Sinkronisasi Live Tanpa Server 100% Gratis", "100% مفت سرور سے پاک لائیو سینک"],
  // ── AdminGizliFeatures ──
  ["agfYukleniyor", "Gizli özellik listesi yükleniyor…", "Loading hidden feature list…", "تحميل قائمة الميزات المخفية…", "Memuat daftar fitur tersembunyi…", "چھپی فیچرز کی فہرست لوڈ ہو رہی ہے…"],
  ["agfBaslik", "🎭 Gizli Özellik Listesi", "🎭 Hidden Feature List", "🎭 قائمة الميزات المخفية", "🎭 Daftar Fitur Tersembunyi", "🎭 چھپی فیچرز کی فہرست"],
  ["agfV3Title", "Bu özelliği V3 uzun vadeli plana kilitle (admin tekrar açabilir)", "Lock this feature into the V3 long-term plan (admin can reopen)", "اقفل هذه الميزة في خطة V3 بعيدة المدى (يمكن للمشرف إعادة فتحها)", "Kunci fitur ini ke rencana V3 jangka panjang (admin bisa buka lagi)", "اس فیچر کو V3 طویل المدت منصوبے میں لاک کریں (ایڈمن دوبارہ کھول سکتا ہے)"],
  ["agfGeriTitle", "Tekrar admin-gizliye çek", "Pull back to admin-hidden", "أرجعها إلى المخفي الإداري", "Kembalikan ke tersembunyi-admin", "دوبارہ ایڈمن-چھپا میں کھینچیں"],
  // ── adminDashboardTabs ──
  ["adtVideoOnay", "🎬 Haftanın Videosu — Onay Kuyruğu", "🎬 Video of the Week — Approval Queue", "🎬 فيديو الأسبوع — طابور الموافقة", "🎬 Video Mingguan — Antrean Persetujuan", "🎬 ہفتے کا ویڈیو — منظوری کی قطار"],
  ["adtBos", "Henüz öneri yok.", "No suggestions yet.", "لا اقتراحات بعد.", "Belum ada saran.", "ابھی کوئی تجویز نہیں۔"],
  ["adtHizTesti", "⚡ Hız Testi — bu cihazın performansı", "⚡ Speed Test — this device's performance", "⚡ اختبار السرعة — أداء هذا الجهاز", "⚡ Uji Kecepatan — performa perangkat ini", "⚡ اسپیڈ ٹیسٹ — اس ڈیوائس کی کارکردگی"],
  ["adtOlculuyor", "Ölçülüyor… (yenile)", "Measuring… (refresh)", "قيد القياس… (تحديث)", "Mengukur… (segarkan)", "ناپ رہے ہیں… (ریفریش)"],
  ["adtAcilis", "Açılış", "Start-up", "الإقلاع", "Mulai", "آغاز"],
  ["adtHaftaRapor", "📊 Haftalık Rapor — son 7 gün", "📊 Weekly Report — last 7 days", "📊 تقرير أسبوعي — آخر 7 أيام", "📊 Laporan Mingguan — 7 hari terakhir", "📊 ہفتہ وار رپورٹ — آخری 7 دن"],
  ["adtRaporAciklama", "Kullanıcı, gelir, trafik ve topluluk özeti. Lider özellikler = oylama birincileri.", "Users, revenue, traffic and community summary. Top features = vote winners.", "ملخص المستخدمين والإيرادات والزيارات والمجتمع. الميزات الرائدة = الفائزون بالتصويت.", "Ringkasan pengguna, pendapatan, lalu lintas dan komunitas. Fitur unggulan = juara vote.", "یوزرز، آمدنی، ٹریفک اور کمیونٹی کا خلاصہ۔ نمایاں فیچرز = ووٹ کے فاتحین۔"],
  ["adtOyLiderleri", "👑 Oylama liderleri (haftalık oy dağılımı)", "👑 Vote leaders (weekly vote distribution)", "👑 رواد التصويت (توزيع الأصوات الأسبوعي)", "👑 Pemimpin vote (distribusi suara mingguan)", "👑 ووٹ لیڈرز (ہفتہ وار ووٹ تقسیم)"],
  ["adtBolumAnalizi", "📈 Bölüm Kullanım Analizi", "📈 Section Usage Analytics", "📈 تحليل استخدام الأقسام", "📈 Analitik Penggunaan Bagian", "📈 سیکشن استعمال کا تجزیہ"],
  ["adtKayitBos", "Henüz haftalık kayıt oluşmamış. Kullanıcılar bölümleri açtıkça satırlar burada birikir; her hafta ayrı bir tarih etiketi", "No weekly entries yet. Rows accumulate as users open sections; each week gets its own date label", "لا سجلات أسبوعية بعد. تتراكم الصفوف كلما فتح المستخدمون الأقسام؛ لكل أسبوع تسمية تاريخ خاصة", "Belum ada catatan mingguan. Baris bertambah saat pengguna membuka bagian; setiap minggu punya label tanggal sendiri", "ابھی ہفتہ وار ریکارڈ نہیں۔ یوزرز سیکشن کھولیں گے تو قطاریں یہاں جمع ہوں گی؛ ہر ہفتے کا الگ تاریخ لیبل"],
  ["adtHaftaBos", "Seçilen haftada kayıt yok.", "No entries in the selected week.", "لا سجلات في الأسبوع المختار.", "Tidak ada catatan di minggu terpilih.", "منتخب ہفتے میں ریکارڈ نہیں۔"],
  // ── adminDashboardKabuk ──
  ["adkHaftaVideo", "Haftanın Videosu", "Video of the Week", "فيديو الأسبوع", "Video Mingguan", "ہفتے کا ویڈیو"],
  ["adkGizliOzellikler", "Gizli Özellikler", "Hidden Features", "الميزات المخفية", "Fitur Tersembunyi", "چھپی فیچرز"],
  ["adkHaftaRapor", "Haftalık Rapor", "Weekly Report", "تقرير أسبوعي", "Laporan Mingguan", "ہفتہ وار رپورٹ"],
  ["adkBolumKullanimi", "Bölüm Kullanımı", "Section Usage", "استخدام الأقسام", "Penggunaan Bagian", "سیکشن استعمال"],
  ["adkHataUyari", "Siteyi kullanıcılar hatalı kullanıyor olabilir. Ayrıntılar için Hata Logları sekmesine bak.", "Users may be hitting errors on the site. See the Error Logs tab for details.", "قد يرتكب المستخدمون أخطاء في الموقع. راجع علامة سجلات الأخطاء للتفاصيل.", "Pengguna mungkin mengalami galat di situs. Cek tab Log Galat untuk detail.", "ممکن ہے یوزرز سائٹ پر نقائص کا سامنا کر رہے ہوں۔ تفصیل کے لیے ایرر لاگز ٹیب دیکھیں۔"],
  ["adkGuvenlik", "AES+HMAC Korumalı · Dynamic Serverless Config Engine", "AES+HMAC Protected · Dynamic Serverless Config Engine", "محمي بـ AES+HMAC · محرك إعدادات دينامي بلا خادم", "Dilindungi AES+HMAC · Mesin Konfigurasi Dinamis Tanpa Server", "AES+HMAC محفوظ · ڈائنامک سرور لیس کنفیگ انجن"],
  // ── adminDashboardBolumler ──
  ["adbBanKaldirTitle", "Bu kullanıcının aktif banını kaldır — anında siteye girebilir", "Remove this user's active ban — they can access the site immediately", "أزل الحجب النشط لهذا المستخدم — يمكنه دخول الموقع فورًا", "Hilangkan ban aktif pengguna ini — langsung bisa masuk situs", "اس یوزر کا فعال حجب ہٹائیں — فوراً سائٹ میں داخل ہو سکتا ہے"],
  ["adbGerekce", "Gerekçe:", "Reason:", "السبب:", "Alasan:", "وجہ:"],
  ["adbSiberKayitlar", "Siber Denetim ve Ban Geçmişi Kayıtları", "Cyber Audit & Ban History Records", "سجلات التدقيق السيبراني وسجل الحجب", "Rekaman Audit Siber & Riwayat Ban", "سائبر آڈٹ اور حجب کی سابقہ ریکارڈیں"],
  ["adbGerekceSuclama", "Gerekçe / Yasal Suç:", "Reason / Legal Offense:", "السبب / المخالفة القانونية:", "Alasan / Pelanggaran Hukum:", "وجہ / قانونی جرم:"],
  ["adbToplamGorus", "Toplam görüş", "Total feedback", "إجمالي الآراء", "Total umpan balik", "کل فیڈ بیک"],
  ["adbTurDagilimi", "Tür dağılımı", "Type distribution", "توزيع الأنواع", "Distribusi jenis", "اقسام کی تقسیم"],
  ["adbPuanDagilimi", "Puan dağılımı", "Score distribution", "توزيع الدرجات", "Distribusi poin", "پوائنٹس کی تقسیم"],
  ["adbVerilenYanit", "↩️ Verilen yanıt", "↩️ Reply sent", "↩️ الرد المرسل", "↩️ Jawaban terkirim", "↩️ دیا گیا جواب"],
  ["adbMailGitti", "📧 e-posta gönderildi", "📧 e-mail sent", "📧 أُرسل بريد إلكتروني", "📧 email terkirim", "📧 ای میل بھیج دی گئی"],
  ["adbYanitP", "Kullanıcıya yanıtını yaz — gönderince e-posta olarak gider…", "Write your reply to the user — sending delivers it as e-mail…", "اكتب ردك للمستخدم — الإرسال يوصلها بريدًا إلكترونيًا…", "Tulis balasan untuk pengguna — terkirim sebagai email setelah dikirim…", "یوزر کو جواب لکھیں — بھیجنے پر ای میل بن کر جائے گا…"],
  ["adbEnCokEndpoint", "En çok hata veren endpoint", "Most error-prone endpoint", "النقطة الأكثر إصدارًا للأخطاء", "Endpoint dengan galat terbanyak", "سب سے زیادہ ایرر دینے والا اینڈ پوائنٹ"],
  ["adbCubukInfo", "Çubuk uzunluğu = hata sayısı oranı · en üstte en çok hata veren endpoint · tıkla → son hata zamanını gör", "Bar length = error count share · top shows the worst endpoint · click → see last error time", "طول الشريط = نسبة عدد الأخطاء · الأعلى للأكثر أخطاء · انقر → وقت آخر خطأ", "Panjang batang = rasio jumlah galat · puncak untuk galat terbanyak · klik → waktu galat terakhir", "بار کی لمبائی = ایرر کی شرح · اوپر سب سے زیادہ ایرر والا اینڈ پوائنٹ · کلک → آخری ایرر کا وقت"],
  ["adbAdetTitle", "Aynı hata son 500 kayıtta {x} kez tekrarladı", "The same error repeated {x} times in the last 500 records", "تكرر نفس الخطأ {x} مرات في آخر 500 سجل", "Galat yang sama muncul {x} kali dalam 500 catatan terakhir", "یہی ایرر آخری 500 ریکارڈ میں {x} بار دہرا گیا"],
  ["adbSilTitle", "Bu kaydı sil", "Delete this record", "احذف هذا السجل", "Hapus rekaman ini", "اس ریکارڈ کو حذف کریں"],
  ["adbIpTitle", "İstek geldiği IP (Vercel x-forwarded-for)", "Request IP (Vercel x-forwarded-for)", "IP الطلب (Vercel x-forwarded-for)", "IP permintaan (Vercel x-forwarded-for)", "درخواست کا IP (Vercel x-forwarded-for)"],
  ["adbStack", "Yığın izi (stack)", "Stack trace", "أثر المكدس (stack)", "Jejak stack", "اسٹیک ٹریس (stack)"],
  // ── AdminBroadcastPanel ──
  ["abpMailNeden", "Bu e-postayı aldınız çünkü Nûr Stüdyo'da e-posta bildirimlerine izin verdiniz.", "You received this because you opted into e-mail notifications from Nûr Studio.", "وصلتك لأنك وافقت على تنبيهات البريد من استوديو نُور.", "Kamu menerima ini karena mengizinkan notifikasi email dari Nûr Studio.", "آپ کو یہ اس لیے ملا کیونکہ آپ نے نور اسٹوڈیو کی ای میل اطلاعات کی اجازت دی تھی۔"],
  ["abpGizliYayin", "Gizli Özellik Yayını", "Hidden Feature Broadcast", "بث الميزات المخفية", "Siaran Fitur Tersembunyi", "چھپی فیچر کی نشریات"],
  ["abpProUyelere", "Pro üyelere", "For Pro members", "لأعضاء Pro", "Untuk anggota Pro", "پرو ممبرز کے لیے"],
  ["abpElitUyelere", "Elit üyelere", "For Elite members", "لأعضاء النخبة", "Untuk anggota Elite", "ایلیٹ ممبرز کے لیے"],
  ["abpCanliDuyuru", "Canlı Duyuru", "Live Announcement", "إعلان مباشر", "Pengumuman Langsung", "لائیو اعلان"],
  ["abpBaslikP", "Duyuru başlığı", "Announcement title", "عنوان الإعلان", "Judul pengumuman", "اعلان کی سرخی"],
  ["abpKisaP", "Üstte görünecek kısa mesaj", "Short message shown at the top", "رسالة قصيرة تظهر في الأعلى", "Pesan singkat yang muncul di atas", "اوپر دکھنے والا مختصر پیغام"],
  ["abpDetayP", "Tıklanınca açılacak detay (opsiyonel)", "Detail opened on click (optional)", "تفاصيل تُفتح عند النقر (اختياري)", "Detail yang terbuka saat diklik (opsional)", "کلک کرنے سے کھلنے والی تفصیل (اختیاری)"],
  ["abpGuncelleme", "Güncelleme", "Update", "تحديث", "Pembaruan", "اپڈیٹ"],
  ["abpUyari", "Uyarı", "Warning", "تحذير", "Peringatan", "انتباہ"],
  ["abpBakimModu", "Site Bakım Modu", "Site Maintenance Mode", "وضع صيانة الموقع", "Mode Perawatan Situs", "سائٹ مینٹیننس موڈ"],
  ["abpBaslangic", "Başlangıç", "Start", "البداية", "Mulai", "شروع"],
  ["abpBitis", "Bitiş", "End", "النهاية", "Akhir", "اختتام"],
  ["abpBakimMesajP", "Bakım mesajı", "Maintenance message", "رسالة الصيانة", "Pesan perawatan", "مینٹیننس پیغام"],
  ["abpBakimKaydet", "Bakım Planını Kaydet", "Save Maintenance Plan", "حفظ خطة الصيانة", "Simpan Rencana Perawatan", "مینٹیننس پلان محفوظ کریں"],
  ["abpBakimBitir", "Bakımı Şimdi Bitir", "End Maintenance Now", "أنهِ الصيانة الآن", "Akhiri Perawatan Sekarang", "مینٹیننس ابھی ختم کریں"],
  ["abpMailKampanya", "E-posta Kampanyası (Yeni Özellik Duyurusu)", "E-mail Campaign (New Feature Announcement)", "حملة بريدية (إعلان ميزة جديدة)", "Kampanye Email (Pengumuman Fitur Baru)", "ای میل کیمپین (نئے فیچر کا اعلان)"],
  ["abpMailKonuP", "Mail konusu (örn: 🌙 V2 Güncellemesi Geldi!)", "Mail subject (e.g., 🌙 V2 Update is Here!)", "موضوع الرسالة (مثال: 🌙 وصل تحديث V2!)", "Subjek email (mis: 🌙 Pembaruan V2 Hadir!)", "میل کی سرخی (مثلاً: 🌙 V2 اپڈیٹ آ گیا!)"],
  ["abpMailIcerikP", "Mail içeriği (düz metin, satır sonları korunur)", "Mail body (plain text, line breaks kept)", "نص الرسالة (نص عادي، تُحفظ فواصل الأسطر)", "Isi email (teks biasa, line break tetap)", "میل کا مواد (سادہ متن، سطریں برقرار)"],
  ["abpKilitler", "Özellik Kilitleri", "Feature Locks", "أقفال الميزات", "Kunci Fitur", "فیچر لاکز"],
  ["abpKilitAciklama", "Açık: oylamadaki 6 modül herkese açık · Kapalı: kilitler oy sıralamasına devreder (~60 sn'de yayılır, deploy gerekmez)", "On: the 6 voted modules are open to everyone · Off: locks activate by vote order (spreads in ~60 s, no deploy needed)", "مفعّل: الوحدات الست المصوَّتة مفتوحة للجميع · مُعطّل: تُفعَّل الأقفال بحسب ترتيب التصويت (تنتشر خلال ~60 ثانية دون نشر)", "Aktif: 6 modul hasil vote terbuka untuk semua · Nonaktif: kunci aktif sesuai urutan vote (menyebar ~60 dtk, tanpa deploy)", "چالو: ووٹ کے 6 ماڈیول سب کے لیے کھلے · غیر فعال: لاک ووٹ کی ترتیب سے فعال (تقریباً 60 سیکنڈ میں پھیلتا ہے، ڈپلوے کی ضرورت نہیں)"],
  ["abpV2Title", "V2 test kilidini aç/kapa — nur_feature_locks'a yazılır", "Toggle the V2 test lock — writes to nur_feature_locks", "بدّل قفل اختبار V2 — يُكتب في nur_feature_locks", "Nyalakan/matikan kunci uji V2 — menulis ke nur_feature_locks", "V2 ٹیسٹ لاک آن/آف کریں — nur_feature_locks میں لکھا جاتا ہے"],
  ["abpKategoriSec", "Kategori seç...", "Pick category...", "اختر فئة...", "Pilih kategori...", "قسم منتخب کریں..."],
  ["abpHocaSec", "Hoca seç...", "Pick reciter...", "اختر قارئًا...", "Pilih qari...", "قاری منتخب کریں..."],
  ["abpBos", "Kilitli/bakımda bir şey yok — her şey herkese açık ✅", "Nothing locked or under maintenance — everything is open ✅", "لا شيء مقفل أو تحت الصيانة — كل شيء مفتوح للجميع ✅", "Tidak ada yang terkunci/dirawat — semuanya terbuka ✅", "کوئی چیز لاک یا مینٹیننس میں نہیں — سب کھلے ہیں ✅"],
  ["abpKilidiKaldir", "Kilidi kaldır — herkese aç", "Remove lock — open to everyone", "أزل القفل — افتح للجميع", "Hilangkan kunci — buka untuk semua", "لاک ہٹائیں — سب کے لیے کھولیں"],
  ["abpGecmis", "Kilit İşlem Geçmişi", "Lock Action History", "سجل عمليات الأقفال", "Riwayat Aksi Kunci", "لاک ایکشنز کی سابقہ"],
  ["abpGeriAlTitle", "Bu işlemi geri al — eski duruma dönsün", "Undo this action — restore the previous state", "تراجع عن هذا الإجراء — عُد للحالة السابقة", "Batalkan aksi ini — pulihkan keadaan sebelumnya", "اس عمل کو واپس لیں — پہلے والی حالت پر جائیں"],
];

// ── 1) SÖZLÜK EKLE ──
const DILLER = ["tr", "en", "ar", "id", "ur"];
const mevcut = new Map();
for (const dil of DILLER) {
  const yolu = `src/i18n/dicts.${dil}.json`;
  const sozluk = JSON.parse(fs.readFileSync(yolu, "utf8"));
  mevcut.set(dil, { yolu, sozluk });
}
const yeniAnahtarlar = [];
let atladi = 0;
for (const kayit of SOZLUK) {
  const [anahtar] = kayit;
  let varMi = false;
  for (const dil of DILLER) if (anahtar in mevcut.get(dil).sozluk) varMi = true;
  if (varMi) { atladi++; console.log("~~ VAR: " + anahtar); continue; }
  yeniAnahtarlar.push(anahtar);
  for (let i = 1; i < 6; i++) mevcut.get(DILLER[i - 1]).sozluk[anahtar] = kayit[i];
}
for (const dil of DILLER) {
  const m = mevcut.get(dil);
  fs.writeFileSync(m.yolu, JSON.stringify(m.sozluk, null, 2) + "\n", "utf8");
}
console.log(`SÖZLÜK: +${yeniAnahtarlar.length} anahtar · ${atladi} zaten vardı`);

// ── 2) BİLEŞEN BAĞLAMA ──
const KO = `// ★ 26.10 I18N KÖPRÜSÜ: oturumun dilini her çağrıda okur\nconst ttX2610 = (k: string): string => translate(typeof localStorage !== "undefined" ? (localStorage.getItem("nur_lang") || "tr") : "tr", k);`;

function kokpruEkle(p, metin) {
  if (metin.includes("const ttX2610 =")) return metin;
  if (metin.includes("const tt = (") || metin.includes("const t = (")) {
    // dil çevirici zaten var — ttX2610'un onu kullanmasına gerek yok, köprü yine kendi dilini okur
  }
  if (!metin.includes('from "../i18n"') && !metin.includes('from "./i18n"')) {
    const derinlik = p.includes("components") || p.includes("studio") ? "../i18n" : "./i18n";
    metin = `import { translate } from "${derinlik}";\n` + metin;
  }
  const ilkImport = metin.match(/^import[\s\S]*?;\n/m);
  if (ilkImport) metin = metin.replace(ilkImport[0], ilkImport[0] + KO + "\n");
  else metin = KO + "\n" + metin;
  return metin;
}

const ISLEMLER = [
  // ── ZipExplorer (önceki turda bağlanmıştı ama script koşulmadı — tekrar) ──
  ["src/components/ZipExplorer.tsx", '>Medya Yükleme</p>', '>{ttX2610("zxBaslik")}</p>'],
  ["src/components/ZipExplorer.tsx", '>Video · Resim · Ses — diğer dosyalar reddedilir</p>', '>{ttX2610("zxTurListe")}</p>'],
  ["src/components/ZipExplorer.tsx", '>Dosyaları sürükle ya da tıkla — video, resim, ses</p>', '>{ttX2610("zxSurukle")}</p>'],
  ["src/components/ZipExplorer.tsx", '>ZIP, PDF, kod vb. reddedilir · en fazla 200 MB</p>', '>{ttX2610("zxRedKurallar")}</p>'],
  ["src/components/ZipExplorer.tsx", ">Henüz dosya yok — yukarıdan ekle</div>", '>{ttX2610("zxBos")}</div>'],
  ["src/components/ZipExplorer.tsx", '>Tümünü temizle</button>', '>{ttX2610("zxTemizle")}</button>'],
  ["src/components/ZipExplorer.tsx", 'title="Cihazında kalıcı saklandı — sayfayı yenilesen de kaybolmaz"', 'title={ttX2610("zxKaliciTitle")}'],
  ["src/components/ZipExplorer.tsx", '>Eklendi', '>{ttX2610("zxEklendi")}'],
  ["src/components/ZipExplorer.tsx", '>Kalıcı', '>{ttX2610("zxKalici")}'],
  // ── ModalsContainer: medya yükleme başlığı ──
  ["src/components/ModalsContainer.tsx", 'title="Medya Yükleme"', 'title={ttX2610("zxBaslik")}'],
  // ── modalsContainerBolumler ──
  ["src/components/modalsContainerBolumler.tsx", 'title="Nûr Stüdyo\'ya Hoş Geldiniz"', 'title={ttX2610("mcbHosGeldinTitle")}'],
  ["src/components/modalsContainerBolumler.tsx", 'title="Google hesap seçici son admin hesabınla açılır — güvenlik zinciri yine sunucuda doğrulanır"', 'title={ttX2610("mcbGoogleTitle")}'],
  ["src/components/modalsContainerBolumler.tsx", ">+5 ⚡ Üretim hakkı", '>{ttX2610("mcbUretimHakki")}'],
  ["src/components/modalsContainerBolumler.tsx", '>Tam Sürümü Aç', '>{ttX2610("mcbTamSurumAc")}'],
  ["src/components/modalsContainerBolumler.tsx", "Tam Sürüm modu", 'ttX2610("mcbTamSurumModu")'],
  ["src/components/modalsContainerBolumler.tsx", " karşılığında", " {ttX2610(\"mcbKarsiliginda\")} "],
  ["src/components/modalsContainerBolumler.tsx", " boyunca açılacak. Bu işlem onaydan sonra bakiyenden düşer.", " {ttX2610(\"mcbSuDenliAcilir\")}"],
  ["src/components/modalsContainerBolumler.tsx", '>Vazgeç</button>', '>{ttX2610("mcbVazgec")}</button>'],
  ["src/components/modalsContainerBolumler.tsx", ">KURUCU GİRİŞİ<", '>{ttX2610("mcbKurucu")}<'],
  ["src/components/modalsContainerBolumler.tsx", "Admin paneli için Google ile doğrulanmış admin oturumu gerekir", 'ttX2610("mcbKurucuAciklama")'],
  ["src/components/modalsContainerBolumler.tsx", ">Ayeti Stüdyoya Ekle", '>{ttX2610("mcbAyetStidyoya")}'],
  // ── QuranLearnModal ──
  ["src/components/QuranLearnModal.tsx", 'title="Mushaf sayfaları — büyüt/küçült, tam ekran, kaldığın yerden devam + hatim takibi"', 'title={ttX2610("qlmSayfalarTitle")}'],
  ["src/components/QuranLearnModal.tsx", ">YENİ<", '>{ttX2610("qlmYeni")}<'],
  ["src/components/QuranLearnModal.tsx", 'title="7/24 kesintisiz Kur\'an radyosu — hoca seçenekli canlı tilavet"', 'title={ttX2610("qlmRadyoTitle")}'],
  // ── QuranSayfalar ──
  ["src/components/QuranSayfalar.tsx", 'title="Sayfaları kapat (Kur\'an ekranı açık kalır)"', 'title={ttX2610("qsSayfalarKapat")}'],
  ["src/components/QuranSayfalar.tsx", 'aria-label="Görünüm kaynağı"', 'aria-label={ttX2610("qsKaynakAria")}'],
  ["src/components/QuranSayfalar.tsx", 'title="Diyanet mushafı — beyaz sayfa, gerçek Kral Fahd Hafs hatlı mushaf"', 'title={ttX2610("qsMushafTitle")}'],
  ["src/components/QuranSayfalar.tsx", 'title="Diyanet İşleri Başkanlığı mealı — sayfa sayfa Türkçe çeviri (beyaz sayfa)"', 'title={ttX2610("qsMealTitle")}'],
  ["src/components/QuranSayfalar.tsx", "title={`Son okuduğun sayfa: ${kayitliSayfa} — oradan devam et`}", 'title={ttX2610("qsDevamTitle").replace("{x}", String(kayitliSayfa))}'],
  ["src/components/QuranSayfalar.tsx", 'title="Bu sayfada sure başlar"', 'title={ttX2610("qsSureBaslarTitle")}'],
  ["src/components/QuranSayfalar.tsx", 'title="Çift tıkla büyüt/küçült · Ctrl+tekerlek zoom · kenarlara tıkla: sayfa çevir"', 'title={ttX2610("qsZoomTitle")}'],
  ["src/components/QuranSayfalar.tsx", "Diyanet meal sayfası şu an yüklenemedi — bağlantını kontrol edip tekrar dener misin?", 'ttX2610("qsMealHata")'],
  ["src/components/QuranSayfalar.tsx", "Sayfa yüklenemedi — internet bağlantını kontrol et. Tüm görüntü kaynakları denendi.", 'ttX2610("qsYuklemeHatasi")'],
  ["src/components/QuranSayfalar.tsx", 'title="← Önceki sayfa"', 'title={ttX2610("qsOncekiTitle")}'],
  ["src/components/QuranSayfalar.tsx", 'aria-label="Önceki sayfa"', 'aria-label={ttX2610("qsOncekiAria")}'],
  ["src/components/QuranSayfalar.tsx", 'title="Önceki sayfa (←)"', 'title={ttX2610("qsOncekiTitle2")}'],
  ["src/components/QuranSayfalar.tsx", 'title="Önceki sayfa"', 'title={ttX2610("qsOncekiTitle2")}'],
  ["src/components/QuranSayfalar.tsx", 'title="Sayfa numarası yaz + Enter"', 'title={ttX2610("qsSayfaYazTitle")}'],
  ["src/components/QuranSayfalar.tsx", 'title="Cüze atla"', 'title={ttX2610("qsCuzTitle")}'],
  ["src/components/QuranSayfalar.tsx", 'title="Küçült (−) · çift tık da çalışır"', 'title={ttX2610("qsKucultTitle")}'],
  ["src/components/QuranSayfalar.tsx", 'title="Yakınlaşma oranı"', 'title={ttX2610("qsZoomAria")}'],
  ["src/components/QuranSayfalar.tsx", 'title="Büyüt (+) · çift tık da çalışır"', 'title={ttX2610("qsBuyutTitle")}'],
  // ── RoadmapModal ──
  ["src/components/RoadmapModal.tsx", 'placeholder="Özellik adı"', 'placeholder={ttX2610("rmOzellikAdiP")}'],
  ["src/components/RoadmapModal.tsx", 'placeholder="Açıklama"', 'placeholder={ttX2610("rmAciklamaP")}'],
  ["src/components/RoadmapModal.tsx", ">İptal</button>", '>{ttX2610("rmIptal")}</button>'],
  ["src/components/RoadmapModal.tsx", 'title="Düzenle"', 'title={ttX2610("rmDuzenle")}'],
  ["src/components/RoadmapModal.tsx", "Nûr Stüdyo — Gelecek planları ve v2-v3 yenilikleri", 'ttX2610("rmBaslik")'],
  ["src/components/RoadmapModal.tsx", "Oylama Bitiş Tarihi:", 'ttX2610("rmOyBitisi")'],
  ["src/components/RoadmapModal.tsx", ">Kaldır</button>", '>{ttX2610("rmKaldir")}</button>'],
  ["src/components/RoadmapModal.tsx", 'placeholder="Özellik adı (ör: AI Meal Seslendirme)"', 'placeholder={ttX2610("rmOzellikOrnekP")}'],
  ["src/components/RoadmapModal.tsx", 'placeholder="Kısa açıklama (opsiyonel)"', 'placeholder={ttX2610("rmKisaAciklamaP")}'],
  ["src/components/RoadmapModal.tsx", ">Hangi Özellik Önce Gelsin?<", '>{ttX2610("rmHangiOnde")}<'],
  ["src/components/RoadmapModal.tsx", ">⏰ Oylama süresi doldu<", '>{ttX2610("rmSureDoldu")}<'],
  ["src/components/RoadmapModal.tsx", ">✨ İlk oyu sen ver!<", '>{ttX2610("rmIlkOyuSenVer")}<'],
  ["src/components/RoadmapModal.tsx", ">👑 Admin Özeti — En Çok Oy Alanlar<", '>{ttX2610("rmAdminOzeti")}<'],
  ["src/components/RoadmapModal.tsx", ">🏆 En çok oy alan yenilikler oylama sonunda sırayla hayata geçirilir<", '>{ttX2610("rmSiraylaHayata")}<'],
  ["src/components/RoadmapModal.tsx", ">Yakında Gelen Güncellemeler<", '>{ttX2610("rmYakinda")}<'],
  ["src/components/RoadmapModal.tsx", "Henüz V2 planı eklenmedi. İlk fikri sen belirle.", 'ttX2610("rmV2Bos")'],
  ["src/components/RoadmapModal.tsx", "Henüz uzun vadeli plan eklenmedi. Birlikte şekillendireceğiz.", 'ttX2610("rmV3Bos")'],
  ["src/components/RoadmapModal.tsx", "Özellikler developmental sırayla eklenecektir", 'ttX2610("rmSiraylaEklenecek")'],
  // ── KendiSesModal ──
  ["src/components/KendiSesModal.tsx", "Her ayeti ayrı yükle, sırayla birleşir", 'ttX2610("ksmAyetAyri")'],
  ["src/components/KendiSesModal.tsx", "Kaldır (kayıtlar saklanır)", 'ttX2610("ksmKaldir")'],
  ["src/components/KendiSesModal.tsx", "Ayet geçişleri (milisanielik)", 'ttX2610("ksmGecisler")'],
  ["src/components/KendiSesModal.tsx", ">Düzenle<", '>{ttX2610("rmDuzenle")}<'],
  ["src/components/KendiSesModal.tsx", ">Vazgeç</button>", '>{ttX2610("mcbVazgec")}</button>'],
  ["src/components/KendiSesModal.tsx", 'title="Ayet arka planı atanmış"', 'title={ttX2610("ksmArkaPlanTitle")}'],
  ["src/components/KendiSesModal.tsx", "→ okuyuşunla hizalı", 'ttX2610("ksmHizali")'],
  ["src/components/KendiSesModal.tsx", ">Ayetler arası nefes<", '>{ttX2610("ksmNefes")}<'],
  // ── DesignSettingsPanel ──
  ["src/components/DesignSettingsPanel.tsx", 'title="Bu kârinin sesiyle seçili ayeti video (MP4) olarak indir — mevcut atmosfer görseliyle"', 'title={ttX2610("dspMp4Title")}'],
  ["src/components/DesignSettingsPanel.tsx", "&8b6914)\" }}>ELİT</span>", "&8b6914)\\\" }}>{t(\"tierElit\")}</span>"],
  // ── ayetKartBolumleri (tt zaten var) ──
  ["src/components/ayetKartBolumleri.tsx", 'text-[7px] font-black">ELİT</span>', 'text-[7px] font-black">{tt("tierElit")}</span>'],
  // ── HeaderTopBar (t zaten var) ──
  ["src/components/HeaderTopBar.tsx", 'text-[7px] font-black">ELİT</span>', 'text-[7px] font-black">{t("tierElit")}</span>'],
  ["src/components/HeaderTopBar.tsx", '{efektifHedef === "elit" ? "ELİT" : "PRO"}', '{efektifHedef === "elit" ? t("tierElit") : "PRO"}'],
  ["src/components/HeaderTopBar.tsx", 'alt="Nûr Stüdyo Logo"', 'alt={t("htLogoAlt")}'],
  ["src/components/HeaderTopBar.tsx", ">STÜDYO<", '>{t("htStudio")}<'],
  // ── seslendirmeKontroller ──
  ["src/components/seslendirmeKontroller.tsx", 'title="Bölümleri (yoksa seçili ayet/meti) tek ses dosyası olarak indir (WAV — tarayıcı birleşimi)"', 'title={ttX2610("skWavTitle")}'],
  // ── VideoPreviewSection ELİT rozeti ──
  ["src/components/VideoPreviewSection.tsx", ">ELİT</span>", '>{ttX2610("tierElit")}</span>'],
  // ── AdminUsersTab ──
  ["src/components/AdminUsersTab.tsx", 'title="Hediye ile birlikte verilecek üyelik seviyesi"', 'title={ttX2610("autHediyeTitle")}'],
  ["src/components/AdminUsersTab.tsx", "ELİT YAP", '{ttX2610("autElitYap")}'],
  ["src/components/AdminUsersTab.tsx", '<option value="elit">ELİT</option>', '<option value="elit">{ttX2610("tierElit")}</option>'],
  ["src/components/AdminUsersTab.tsx", ">Kayıt<", '>{ttX2610("autKayit")}<'],
  ["src/components/AdminUsersTab.tsx", ">Son Güncelleme<", '>{ttX2610("autSonGuncelleme")}<'],
  ["src/components/AdminUsersTab.tsx", ">Cüzdan Durumu<", '>{ttX2610("autCuzdanDurumu")}<'],
  ["src/components/AdminUsersTab.tsx", ">Kısa:<", '>{ttX2610("autKisa")}<'],
  ["src/components/AdminUsersTab.tsx", "Admin İşlemleri (son 10)", 'ttX2610("autAdminIslemleri")'],
  ["src/components/AdminUsersTab.tsx", ">Seçili Kullanıcı Kartı<", '>{ttX2610("autKart")}<'],
  ["src/components/AdminUsersTab.tsx", ">🌱 Ücretsiz (Free)<", '>{ttX2610("autUcretsiz")}<'],
  ["src/components/AdminUsersTab.tsx", ">💎 Nûr Pro (Tüm videolar & 1080p)<", '>{ttX2610("autPro")}<'],
  ["src/components/AdminUsersTab.tsx", ">👑 Nûr Elit (%100 Logosuz & Tüm Kâriler)<", '>{ttX2610("autSelit")}<'],
  ["src/components/AdminUsersTab.tsx", ">⚖️ Tek Hak Sıfırla (kısmi ceza — üyeliği korur)<", '>{ttX2610("autHakSifirla")}<'],
  ["src/components/AdminUsersTab.tsx", 'title="Aynı hak + üyelik iptali"', 'title={ttX2610("autAyniHakTitle")}'],
  ["src/components/AdminUsersTab.tsx", "title={`Seçili türe +${amt} hak ekler`}", 'title={ttX2610("autHakEkleTitle").replace("{x}", String(amt))}'],
  ["src/components/AdminUsersTab.tsx", "Mevcut Ban Gerekçesi:", 'ttX2610("autBanGerekce")'],
  ["src/components/AdminUsersTab.tsx", 'placeholder="Örn: Telif ihlali, sahte jeton müdahalesi veya yasal suç..."', 'placeholder={ttX2610("autBanP")}'],
  // ── AdminModulesSyncTab ──
  ["src/components/AdminModulesSyncTab.tsx", 'placeholder="Modül Başlığı (ör: Günlük Zikirler)"', 'placeholder={ttX2610("amsBaslikP")}'],
  ["src/components/AdminModulesSyncTab.tsx", ">Ücretsiz (Free)<", '>{ttX2610("amsUcretsiz")}<'],
  ["src/components/AdminModulesSyncTab.tsx", ">V2 Güncellemesi Kilidi<", '>{ttX2610("amsV2")}<'],
  ["src/components/AdminModulesSyncTab.tsx", ">V3 Güncellemesi Kilidi<", '>{ttX2610("amsV3")}<'],
  ["src/components/AdminModulesSyncTab.tsx", ">Pro Üyelik Kilidi<", '>{ttX2610("amsPro")}<'],
  ["src/components/AdminModulesSyncTab.tsx", ">Elit Üyelik Kilidi<", '>{ttX2610("amsElit")}<'],
  ["src/components/AdminModulesSyncTab.tsx", 'placeholder="Kısa Açıklama"', 'placeholder={ttX2610("amsAciklamaP")}'],
  ["src/components/AdminModulesSyncTab.tsx", "100% Ücretsiz Sunucusuz Canlı Senkronizasyon", 'ttX2610("amsSync")'],
  // ── AdminGizliFeatures ──
  ["src/components/AdminGizliFeatures.tsx", "Gizli özellik listesi yükleniyor…", 'ttX2610("agfYukleniyor")'],
  ["src/components/AdminGizliFeatures.tsx", ">🎭 Gizli Özellik Listesi<", '>{ttX2610("agfBaslik")}<'],
  ["src/components/AdminGizliFeatures.tsx", 'title="Bu özelliği V3 uzun vadeli plana kilitle (admin tekrar açabilir)"', 'title={ttX2610("agfV3Title")}'],
  ["src/components/AdminGizliFeatures.tsx", 'title="Tekrar admin-gizliye çek"', 'title={ttX2610("agfGeriTitle")}'],
  ["src/components/AdminGizliFeatures.tsx", 'font-black">ELİT</span>', 'font-black">{ttX2610("tierElit")}</span>'],
  // ── adminDashboardTabs ──
  ["src/components/adminDashboardTabs.tsx", ">🎬 Haftanın Videosu — Onay Kuyruğu<", '>{ttX2610("adtVideoOnay")}<'],
  ["src/components/adminDashboardTabs.tsx", "Henüz öneri yok.", 'ttX2610("adtBos")'],
  ["src/components/adminDashboardTabs.tsx", ">⚡ Hız Testi — bu cihazın performansı<", '>{ttX2610("adtHizTesti")}<'],
  ["src/components/adminDashboardTabs.tsx", "Ölçülüyor… (yenile)", 'ttX2610("adtOlculuyor")'],
  ["src/components/adminDashboardTabs.tsx", ">Açılış<", '>{ttX2610("adtAcilis")}<'],
  ["src/components/adminDashboardTabs.tsx", ">📊 Haftalık Rapor — son 7 gün<", '>{ttX2610("adtHaftaRapor")}<'],
  ["src/components/adminDashboardTabs.tsx", "Kullanıcı, gelir, trafik ve topluluk özeti. Lider özellikler = oylama birincileri.", 'ttX2610("adtRaporAciklama")'],
  ["src/components/adminDashboardTabs.tsx", ">👑 Oylama liderleri (haftalık oy dağılımı)<", '>{ttX2610("adtOyLiderleri")}<'],
  ["src/components/adminDashboardTabs.tsx", ">📈 Bölüm Kullanım Analizi<", '>{ttX2610("adtBolumAnalizi")}<'],
  ["src/components/adminDashboardTabs.tsx", "Henüz haftalık kayıt oluşmamış. Kullanıcılar bölümleri açtıkça satırlar burada birikir; her hafta ayrı bir tarih etiketi", 'ttX2610("adtKayitBos")'],
  ["src/components/adminDashboardTabs.tsx", "Seçilen haftada kayıt yok.", 'ttX2610("adtHaftaBos")'],
  // ── adminDashboardKabuk ──
  ["src/components/adminDashboardKabuk.tsx", ">Haftanın Videosu<", '>{ttX2610("adkHaftaVideo")}<'],
  ["src/components/adminDashboardKabuk.tsx", ">Gizli Özellikler<", '>{ttX2610("adkGizliOzellikler")}<'],
  ["src/components/adminDashboardKabuk.tsx", ">Haftalık Rapor<", '>{ttX2610("adkHaftaRapor")}<'],
  ["src/components/adminDashboardKabuk.tsx", ">Bölüm Kullanımı<", '>{ttX2610("adkBolumKullanimi")}<'],
  ["src/components/adminDashboardKabuk.tsx", "Siteyi kullanıcılar hatalı kullanıyor olabilir. Ayrıntılar için Hata Logları sekmesine bak.", 'ttX2610("adkHataUyari")'],
  ["src/components/adminDashboardKabuk.tsx", "AES+HMAC Korumalı · Dynamic Serverless Config Engine", 'ttX2610("adkGuvenlik")'],
  // ── adminDashboardBolumler ──
  ["src/components/adminDashboardBolumler.tsx", 'title="Bu kullanıcının aktif banını kaldır — anında siteye girebilir"', 'title={ttX2610("adbBanKaldirTitle")}'],
  ["src/components/adminDashboardBolumler.tsx", ">Gerekçe:<", '>{ttX2610("adbGerekce")}<'],
  ["src/components/adminDashboardBolumler.tsx", "Siber Denetim ve Ban Geçmişi Kayıtları", 'ttX2610("adbSiberKayitlar")'],
  ["src/components/adminDashboardBolumler.tsx", "Gerekçe / Yasal Suç:", 'ttX2610("adbGerekceSuclama")'],
  ["src/components/adminDashboardBolumler.tsx", "Toplam görüş", 'ttX2610("adbToplamGorus")'],
  ["src/components/adminDashboardBolumler.tsx", "Tür dağılımı", 'ttX2610("adbTurDagilimi")'],
  ["src/components/adminDashboardBolumler.tsx", "Puan dağılımı", 'ttX2610("adbPuanDagilimi")'],
  ["src/components/adminDashboardBolumler.tsx", "↩️ Verilen yanıt", 'ttX2610("adbVerilenYanit")'],
  ["src/components/adminDashboardBolumler.tsx", "📧 e-posta gönderildi", 'ttX2610("adbMailGitti")'],
  ["src/components/adminDashboardBolumler.tsx", "Kullanıcıya yanıtını yaz — gönderince e-posta olarak gider…", 'ttX2610("adbYanitP")'],
  ["src/components/adminDashboardBolumler.tsx", ">İptal</button>", '>{ttX2610("rmIptal")}</button>'],
  ["src/components/adminDashboardBolumler.tsx", 'title="En çok hata veren endpoint"', 'title={ttX2610("adbEnCokEndpoint")}'],
  ["src/components/adminDashboardBolumler.tsx", "Çubuk uzunluğu = hata sayısı oranı · en üstte en çok hata veren endpoint · tıkla → son hata zamanını gör", 'ttX2610("adbCubukInfo")'],
  ["src/components/adminDashboardBolumler.tsx", "title={`Aynı hata son 500 kayıtta ${log.__adet} kez tekrarladı`}", 'title={ttX2610("adbAdetTitle").replace("{x}", String(log.__adet))}'],
  ["src/components/adminDashboardBolumler.tsx", 'title="Bu kaydı sil"', 'title={ttX2610("adbSilTitle")}'],
  ["src/components/adminDashboardBolumler.tsx", 'title="İstek geldiği IP (Vercel x-forwarded-for)"', 'title={ttX2610("adbIpTitle")}'],
  ["src/components/adminDashboardBolumler.tsx", "Yığın izi (stack)", 'ttX2610("adbStack")'],
  // ── AdminBroadcastPanel ──
  ["src/components/AdminBroadcastPanel.tsx", "Bu e-postayı aldınız çünkü Nûr Stüdyo'da e-posta bildirimlerine izin verdiniz.", 'ttX2610("abpMailNeden")'],
  ["src/components/AdminBroadcastPanel.tsx", ">Gizli Özellik Yayını<", '>{ttX2610("abpGizliYayin")}<'],
  ["src/components/AdminBroadcastPanel.tsx", '"Pro üyelere"', 'ttX2610("abpProUyelere")'],
  ["src/components/AdminBroadcastPanel.tsx", '"Elit üyelere"', 'ttX2610("abpElitUyelere")'],
  ["src/components/AdminBroadcastPanel.tsx", ">Canlı Duyuru<", '>{ttX2610("abpCanliDuyuru")}<'],
  ["src/components/AdminBroadcastPanel.tsx", 'placeholder="Duyuru başlığı"', 'placeholder={ttX2610("abpBaslikP")}'],
  ["src/components/AdminBroadcastPanel.tsx", 'placeholder="Üstte görünecek kısa mesaj"', 'placeholder={ttX2610("abpKisaP")}'],
  ["src/components/AdminBroadcastPanel.tsx", 'placeholder="Tıklanınca açılacak detay (opsiyonel)"', 'placeholder={ttX2610("abpDetayP")}'],
  ["src/components/AdminBroadcastPanel.tsx", ">Güncelleme<", '>{ttX2610("abpGuncelleme")}<'],
  ["src/components/AdminBroadcastPanel.tsx", ">Uyarı<", '>{ttX2610("abpUyari")}<'],
  ["src/components/AdminBroadcastPanel.tsx", ">Site Bakım Modu<", '>{ttX2610("abpBakimModu")}<'],
  ["src/components/AdminBroadcastPanel.tsx", ">Başlangıç<", '>{ttX2610("abpBaslangic")}<'],
  ["src/components/AdminBroadcastPanel.tsx", ">Bitiş<", '>{ttX2610("abpBitis")}<'],
  ["src/components/AdminBroadcastPanel.tsx", 'placeholder="Bakım mesajı"', 'placeholder={ttX2610("abpBakimMesajP")}'],
  ["src/components/AdminBroadcastPanel.tsx", ">Bakım Planını Kaydet<", '>{ttX2610("abpBakimKaydet")}<'],
  ["src/components/AdminBroadcastPanel.tsx", ">Bakımı Şimdi Bitir<", '>{ttX2610("abpBakimBitir")}<'],
  ["src/components/AdminBroadcastPanel.tsx", ">E-posta Kampanyası (Yeni Özellik Duyurusu)<", '>{ttX2610("abpMailKampanya")}<'],
  ["src/components/AdminBroadcastPanel.tsx", 'placeholder="Mail konusu (örn: 🌙 V2 Güncellemesi Geldi!)"', 'placeholder={ttX2610("abpMailKonuP")}'],
  ["src/components/AdminBroadcastPanel.tsx", 'placeholder="Mail içeriği (düz metin, satır sonları korunur)"', 'placeholder={ttX2610("abpMailIcerikP")}'],
  ["src/components/AdminBroadcastPanel.tsx", ">Özellik Kilitleri<", '>{ttX2610("abpKilitler")}<'],
  ["src/components/AdminBroadcastPanel.tsx", "Açık: oylamadaki 6 modül herkese açık · Kapalı: kilitler oy sıralamasına devreder (~60 sn'de yayılır, deploy gerekmez)", 'ttX2610("abpKilitAciklama")'],
  ["src/components/AdminBroadcastPanel.tsx", 'title="V2 test kilidini aç/kapa — nur_feature_locks\'a yazılır"', 'title={ttX2610("abpV2Title")}'],
  ["src/components/AdminBroadcastPanel.tsx", ">Kategori seç...<", '>{ttX2610("abpKategoriSec")}<'],
  ["src/components/AdminBroadcastPanel.tsx", ">Hoca seç...<", '>{ttX2610("abpHocaSec")}<'],
  ["src/components/AdminBroadcastPanel.tsx", "Kilitli/bakımda bir şey yok — her şey herkese açık ✅", 'ttX2610("abpBos")'],
  ["src/components/AdminBroadcastPanel.tsx", 'title="Kilidi kaldır — herkese aç"', 'title={ttX2610("abpKilidiKaldir")}'],
  ["src/components/AdminBroadcastPanel.tsx", ">Kilit İşlem Geçmisi<", '>{ttX2610("abpGecmis")}<'],
  ["src/components/AdminBroadcastPanel.tsx", 'title="Bu işlemi geri al — eski duruma dönsün"', 'title={ttX2610("abpGeriAlTitle")}'],
];

let ok = 0, hata = 0;
const dokunulan = new Set();
for (const [p, bul, yeni] of ISLEMLER) {
  let metin = fs.readFileSync(p, "utf8");
  const ilk = !metin.includes(bul);
  // aynı metin birden第二个 fazla yerdeyse hepsini değiştir (ör: ELİT rozetleri)
  if (ilk) { console.log("!! BULUNAMADI", p, "→", bul.slice(0, 58)); hata++; continue; }
  metin = metin.split(bul).join(yeni);
  metin = kokpruEkle(p, metin);
  fs.writeFileSync(p, metin);
  dokunulan.add(p);
  ok++;
}
console.log(`BAĞLAMA: ${ok} değişim · ${hata} bulunamadı · ${dokunulan.size} dosya`);
