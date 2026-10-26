// ════════════════════════════════════════════════════════
// 26.10 D TURU — src/studio notify() kalıntıları + eksik anahtarlar
// 1) EKSIK → sözlüklere (varsa atlanır)
// 2) ISLEMLER → [dosya, bul, yeni] kod bağlama; köprü otomatik
// ════════════════════════════════════════════════════════
import fs from "node:fs";

// [anahtar, tr, en, ar, id, ur]
const EKSIK = [
  // ── useAudioPreview / useVerseAudioPlayback ──
  ["apTamsureHata", "⚠️ Bu kârinin tam sure kaydı yüklenemedi · ayet konumu korundu", "⚠️ This reciter's full-surah recording couldn't load · verse position kept", "⚠️ تعذر تحميل تسجيل السورة كاملة لهذا القارئ · حُفظ موضع الآية", "⚠️ Rekaman satu surah qari ini gagal dimuat · posisi ayat dipertahankan", "⚠️ اس قاری کی مکمل سورہ ریکارڈنگ لوڈ نہیں ہوئی · آیت کا مقام محفوظ"],
  ["apAyetSesHata", "⚠️ Bu ayetin sesi yüklenemedi · sıradaki ayete geçiliyor", "⚠️ This verse's audio couldn't load · moving to the next verse", "⚠️ تعذر تحميل صوت هذه الآية · الانتقال إلى الآية التالية", "⚠️ Audio ayat ini gagal dimuat · melanjut ke ayat berikutnya", "⚠️ اس آیت کی آواز لوڈ نہیں ہوئی · اگلی آیت پر جا رہے ہیں"],
  ["apSonAyetHata", "⚠️ Son ayetin sesi yüklenemedi · önizleme durduruldu", "⚠️ Last verse audio couldn't load · preview stopped", "⚠️ تعذر تحميل صوت الآية الأخيرة · توقف المعاينة", "⚠️ Audio ayat terakhir gagal dimuat · pratinjau dihentikan", "⚠️ آخری آیت کی آواز لوڈ نہیں ہوئی · پری ویو بند"],
  ["apBaglantiYavas", "⏳ Bağlantı yavaş · sıradaki ayete geçiliyor", "⏳ Slow connection · moving to the next verse", "⏳ الاتصال بطيء · الانتقال إلى الآية التالية", "⏳ Koneksi lambat · melanjut ke ayat berikutnya", "⏳ کنکشن سست · اگلی آیت پر جا رہے ہیں"],
  ["uvKariSesHata", "⚠️ Bu kârinin ses kaydı yüklenemedi · ayet konumu korundu", "⚠️ This reciter's recording couldn't load · verse position kept", "⚠️ تعذر تحميل تسجيل هذا القارئ · حُفظ موضع الآية", "⚠️ Rekaman qari ini gagal dimuat · posisi ayat dipertahankan", "⚠️ اس قاری کی ریکارڈنگ لوڈ نہیں ہوئی · آیت کا مقام محفوظ"],
  // ── useAuth ──
  ["uaOturumDogrulanamadi", "⚠️ Google giriş oturumu doğrulanamadı. Lütfen tekrar deneyin.", "⚠️ Google sign-in session could not be verified. Please try again.", "⚠️ تعذر التحقق من جلسة الدخول عبر جوجل. حاول مجددًا.", "⚠️ Sesi masuk Google gagal diverifikasi. Coba lagi.", "⚠️ گوگل لاگ اِن سیشن تصدیق نہیں ہو سکی۔ براہِ کرم دوبارہ کوشش کریں۔"],
  ["uaKurucu", "🛡️ Google doğrulandı · Kurucu Admin · {x} modu", "🛡️ Google verified · Founder Admin · {x} mode", "🛡️ تم التحقق عبر جوجل · مشرف مؤسس · وضع {x}", "🛡️ Google terverifikasi · Admin Pendiri · mode {x}", "🛡️ گوگل تصدیق شدہ · بانی ایڈمن · {x} موڈ"],
  ["uaGirisBasarili", "Google ile giriş başarılı · hoş geldiniz", "Signed in with Google · welcome", "تم الدخول عبر جوجل · أهلًا بك", "Masuk dengan Google berhasil · selamat datang", "گوگل سے لاگ اِن کامیاب · خوش آمدید"],
  ["uaBaglantiHatasi", "Google girişi sırasında bağlantı hatası oluştu", "A connection error occurred during Google sign-in", "حدث خطأ اتصال أثناء الدخول عبر جوجل", "Terjadi galat koneksi saat masuk Google", "گوگل لاگ اِن کے دوران کنکشن ایرر آیا"],
  ["uaAdminOturumGerekli", "Admin paneli için doğrulanmış Google admin oturumu gerekli", "The admin panel requires a verified Google admin session", "تطلب لوحة المشرف جلسة مشرف موثَّقة عبر جوجل", "Panel admin memerlukan sesi admin Google terverifikasi", "ایڈمن پینل کے لیے تصدیق شدہ گوگل ایڈمن سیشن ضروری ہے"],
  // ── useAyetSecim ──
  ["usOnceSureAyet", "⚠️ Önce sure ve ayet seç", "⚠️ Pick a surah and verse first", "⚠️ اختر سورة وآية أولًا", "⚠️ Pilih surah dan ayat dulu", "⚠️ پہلے سورہ اور آیت منتخب کریں"],
  ["usOnceSure", "Önce bir sure seç", "Pick a surah first", "اختر سورة أولًا", "Pilih surah dulu", "پہلے ایک سورہ منتخب کریں"],
  ["usSureEklendi", "{x} Suresi tamamı eklendi ({n} ayet)", "Added the whole Surah {x} ({n} verses)", "أُضافت سورة {x} كاملة ({n} آية)", "Seluruh surah {x} ditambahkan ({n} ayat)", "سورہ {x} مکمل شامل ہو گئی ({n} آیات)"],
  // ── güvenlik (useBan + useSecurityGuards ortak) ──
  ["secAdminTemiz", "🛡️ ADMIN: Önceki güvenlik kaydı temizlendi · ban uygulanmadı", "🛡️ ADMIN: Previous security record cleared · no ban applied", "🛡️ مشرف: سُجّل غيّر السجل الأمني السابق · لم يُطبق حجب", "🛡️ ADMIN: Catatan keamanan sebelumnya dibersihkan · ban tidak diberlakukan", "🛡️ ایڈمن: پچھلا سیکیورٹی ریکارڈ صاف · حجب لاگو نہیں"],
  ["secSinyal", "🛡️ ADMIN UYARI: Güvenlik sinyali yakalandı ({x}) — ban uygulanmadı, sadece bildirildi.", "🛡️ ADMIN WARNING: Security signal caught ({x}) — no ban applied, reported only.", "🛡️ تحذير المشرف: اُلتقط إشارة أمنية ({x}) — لم يُطبق حجب، للتبليغ فقط.", "🛡️ PERINGATAN ADMIN: Sinyal keamanan tertangkap ({x}) — tanpa ban, hanya dilaporkan.", "🛡️ ایڈمن انتباہ: سیکیورٹی سگنل پکڑا گیا ({x}) — حجب لاگو نہیں، صرف اطلاع دی گئی۔"],
  ["secEskiFormat", "🛡️ Güvenlik: Eski veri formatı tespit edildi · veriler otomatik güncellendi", "🛡️ Security: legacy data format detected · data auto-updated", "🛡️ الأمان: اكتُشف تنسيق بيانات قديم · حُدّثت البيانات تلقائيًا", "🛡️ Keamanan: format data lama terdeteksi · data diperbarui otomatis", "🛡️ سلامتی: پرانا ڈیٹا فارمیٹ ملے · ڈیٹا خودکار اپڈیٹ"],
  ["secGenelUyari", "🛡️ Güvenlik uyarısı: {x} — otomatik ban uygulanmadı", "🛡️ Security warning: {x} — no auto-ban applied", "🛡️ تحذير أمني: {x} — لم يُطبق حجب تلقائي", "🛡️ Peringatan keamanan: {x} — tanpa ban otomatis", "🛡️ سیکیورٹی انتباہ: {x} — خودکار حجب لاگو نہیں"],
  // ── useKendiSes ──
  ["ukBoyutSinir", "⚠️ Ses dosyası 60 MB'den büyük olamaz", "⚠️ Audio file cannot exceed 60 MB", "⚠️ لا يتجاوز الملف الصوتي 60 ميغابايت", "⚠️ File audio maks. 60 MB", "⚠️ آڈیو فائل 60 MB سے بڑی نہیں ہو سکتی"],
  ["ukSesYukleyin", "⚠️ Lütfen ses dosyası yükleyin (mp3, m4a, wav, ogg)", "⚠️ Please upload an audio file (mp3, m4a, wav, ogg)", "⚠️ رجاءً ارفع ملفًا صوتيًا (mp3، m4a، wav، ogg)", "⚠️ Harap unggah file audio (mp3, m4a, wav, ogg)", "⚠️ براہِ کرم آڈیو فائل اپلوڈ کریں (mp3, m4a, wav, ogg)"],
  ["ukSinirSn", "⏱ Senin sn sınırın {x} — kayıttan fazlası kullanılmaz", "⏱ Your second limit is {x} — anything beyond the recording is not used", "⏱ حدك الزمني {x} ثانية — ما زاد عن التسجيل لا يُستخدم", "⏱ Batas detikmu {x} — melebihi rekaman tak dipakai", "⏱ آپ کی سیکنڈ حد {x} ہے — ریکارڈنگ سے زائد استعمال نہیں ہوگی"],
  ["ukBolumAlgilanamadi", "⚠️ Seste okunan bölüm algılanamadı — dosya sessiz veya bozuk olabilir", "⚠️ Recited section could not be detected — the file may be silent or corrupt", "⚠️ تعذر اكتشاف المقطع المُتلوّ — قد يكون الملف صامتًا أو تالفًا", "⚠️ Bagian tilawah tak terdeteksi — file bisa sunyi atau rusak", "⚠️ پڑھا گیا حصہ نہیں ملا — فائل خاموش یا خراب ہو سکتی ہے"],
  ["ukCozumlenemedi", "⚠️ Ses dosyası çözümlenemedi — mp3/m4a/wav deneyin", "⚠️ Audio file couldn't be processed — try mp3/m4a/wav", "⚠️ تعذر تحليل الملف الصوتي — جرّب mp3/m4a/wav", "⚠️ File audio tak bisa diproses — coba mp3/m4a/wav", "⚠️ آڈیو فائل پارسی نہیں ہو سکی — mp3/m4a/wav آزمائیں"],
  ["ukKayitYok", "⚠️ Kayıt bulunamadı", "⚠️ Recording not found", "⚠️ لم يُعثر على التسجيل", "⚠️ Rekaman tidak ditemukan", "⚠️ ریکارڈنگ نہیں ملی"],
  ["ukBolumYok", "⚠️ Seste okunan bölüm algılanamadı", "⚠️ Recited section not detected", "⚠️ تعذر اكتشاف المقطع المتلوّ", "⚠️ Bagian tilawah tak terdeteksi", "⚠️ پڑھا گیا حصہ نہیں ملا"],
  ["ukYenidenAnaliz", "⚠️ Ses çözümlenemedi — yeniden analiz başarısız", "⚠️ Audio couldn't be processed — re-analysis failed", "⚠️ تعذر تحليل الصوت — فشل إعادة التحليل", "⚠️ Audio tak bisa diproses — analisis ulang gagal", "⚠️ آڈیو پارسی نہیں — دوبارہ تجزیہ ناکام"],
  ["ukZamanlamaKayit", "✅ Ayet zamanlamaları kaydedildi", "✅ Verse timings saved", "✅ حُفظت توقيتات الآيات", "✅ Waktu-waktu ayat tersimpan", "✅ آیت کی ٹائمنگ محفوظ"],
  // ── useManualAuthActions ──
  ["umSnKaldi", "({n} sn kaldı)", "({n} s left)", "(بقي {n} ث)", "({n} dtk tersisa)", "({n} سیکنڈ باقی)"],
  ["umKurucuGiris", "🛡️ Kurucu Admin girişi başarılı! Tüm kilitler açıldı.", "🛡️ Founder Admin sign-in successful! All locks opened.", "🛡️ نجح دخول المشرف المؤسس! فُتحت جميع الأقفال.", "🛡️ Masuk Admin Pendiri berhasil! Semua kunci terbuka.", "🛡️ بانی ایڈمن لاگ اِن کامیاب! تمام لاکز کھل گئیں۔"],
  ["umGirisOk", "Giriş başarılı! Hoş geldiniz.", "Sign-in successful! Welcome.", "نجح الدخول! أهلًا بك.", "Masuk berhasil! Selamat datang.", "لاگ اِن کامیاب! خوش آمدید۔"],
  ["umKurucuHesap", "🛡️ Kurucu Admin Hesabı Oluşturuldu! 1000 jeton + Nûr Elit tanımlandı.", "🛡️ Founder Admin account created! 1000 tokens + Nûr Elite assigned.", "🛡️ أُنشئ حساب المشرف المؤسس! 1000 عملة + نُور نخبة.", "🛡️ Akun Admin Pendiri dibuat! 1000 jeton + Nûr Elite ditetapkan.", "🛡️ بانی ایڈمن اکاؤنٹ بنا لیا گیا! 1000 ٹوکن + نور ایلیٹ طے شدہ۔"],
  ["umKayitBonus", "🎉 Kayıt başarılı! Hoş geldiniz — +{x} üretim hakkı hediye edildi.", "🎉 Sign-up successful! Welcome — +{x} production credits gifted.", "🎉 نجح التسجيل! أهلًا بك — أُهديت +{x} رصيد إنتاج.", "🎉 Pendaftaran berhasil! Selamat datang — +{x} kuota produksi dianugerahkan.", "🎉 رجسٹریشن کامیاب! خوش آمدید — +{x} پروڈکشن کریڈٹ تحفہ دیا گیا۔"],
  ["umKayitOk", "Kayıt başarılı! Hoş geldiniz.", "Sign-up successful! Welcome.", "نجح التسجيل! أهلًا بك.", "Pendaftaran berhasil! Selamat datang.", "رجسٹریشن کامیاب! خوش آمدید۔"],
  ["umKod", "Doğrulama kodu: {x}", "Verification code: {x}", "رمز التحقق: {x}", "Kode verifikasi: {x}", "تصدیقی کوڈ: {x}"],
  ["umKodOk", "Kod doğrulandı! Şifrenizi sıfırlayabilirsiniz.", "Code verified! You can reset your password.", "تم التحقق من الرمز! يمكنك إعادة تعيين كلمة المرور.", "Kode terverifikasi! Anda bisa mengatur ulang kata sandi.", "کوڈ تصدیق ہو گیا! آپ پاس ورڈ ری سیٹ کر سکتے ہیں۔"],
  ["umKodHata", "Kod hatalı!", "Invalid code!", "الرمز غير صحيح!", "Kode salah!", "کوڈ غلط!"],
  // ── useMedyaYukleme ──
  ["uyDepoYok", "⚠️ Dosya kalıcı depoda bulunamadı — yeniden yüklemeyi dene", "⚠️ File not found in permanent storage — try re-uploading", "⚠️ لم يُعثر على الملف في المخزن الدائم — جرّب إعادة الرفع", "⚠️ File tak ditemukan di penyimpanan permanen — coba unggah ulang", "⚠️ فائل مستقل اسٹور میں نہیں ملی — دوبارہ اپلوڈ آزمائیں"],
  ["uySesArkaPlanOlmaz", "🎵 Ses dosyası arka plan olamaz — arka plan için video/resim seç", "🎵 An audio file can't be a background — pick video/image for backgrounds", "🎵 لا يمكن أن يكون الملف الصوتي خلفية — اختر فيديو/صورة للخلفية", "🎵 File audio tak bisa jadi latar belakang — pilih video/gambar", "🎵 آڈیو فائل بیک گراؤنڈ نہیں ہو سکتی — ویڈیو/تصویر منتخب کریں"],
  ["uyKaydedildi", "📁 \"{x}\" Yüklediklerim klasörüne kaydedildi", "📁 \"{x}\" saved to My Uploads folder", "📁 حُفظ \"{x}\" في مجلد \"تحميلاتي\"", "📁 \"{x}\" tersimpan ke folder Unggahan Saya", "📁 \"{x}\" میرے اپلوڈز فولڈر میں محفوظ"],
  ["uyArkaPlanSecildi", "💾 \"{x}\" arka plan olarak seçildi — kalıcı depodan", "💾 \"{x}\" set as background — from permanent storage", "💾 عُيّن \"{x}\" خلفية — من المخزن الدائم", "💾 \"{x}\" dijadikan latar belakang — dari penyimpanan permanen", "💾 \"{x}\" بیک گراؤنڈ بنا دیا گیا — مستقل اسٹور سے"],
  ["uyDosyaAcilamadi", "⚠️ Dosya açılamadı — depolama erişimi engellenmiş olabilir", "⚠️ File couldn't be opened — storage access may be blocked", "⚠️ تعذر فتح الملف — ربما حُجب الوصول إلى التخزين", "⚠️ File tak bisa dibuka — akses penyimpanan mungkin diblokir", "⚠️ فائل کھلی نہیں — اسٹوریج کا رسائی بلاک ہو سکتا ہے"],
  // ── useMicroUnlocks ──
  ["uxAcildi", "🔓 {x} 24 saatliğine açıldı", "🔓 {x} unlocked for 24 hours", "🔓 فُتح {x} لمدة 24 ساعة", "🔓 {x} terbuka 24 jam", "🔓 {x} 24 گھنٹے کے لیے کھل گیا"],
  ["uxHakki", "{x} için geçici açma hakkı gerekiyor · mevcut: {n}", "{x} requires a temporary unlock credit · current: {n}", "تطلب {x} رصيد فتح مؤقت · المتوفر: {n}", "{x} butuh kredit buka sementara · saat ini: {n}", "{x} کے لیے عارضی کھولنے کا کریڈٹ چاہیے · موجودہ: {n}"],
  ["uxTamAcildi", "✅ Tam Sürüm modu 24 saatliğine açıldı", "✅ Full Version unlocked for 24 hours", "✅ فُتح وضع النسخة الكاملة لمدة 24 ساعة", "✅ Mode Versi Penuh terbuka 24 jam", "✅ مکمل ورژن موڈ 24 گھنٹے کے لیے کھل گیا"],
  ["uxTamGerekli", "⚠️ Tam Sürüm modunu 24 saatliğine açmak için geçici açma hakkı gerekiyor · mevcut: {n}", "⚠️ Unlocking Full Version for 24 h requires a temporary unlock credit · current: {n}", "⚠️ فتح النسخة الكاملة 24 ساعة يتطلب رصيدًا مؤقتًا · المتوفر: {n}", "⚠️ Membuka Versi Penuh 24 jam butuh kredit buka sementara · saat ini: {n}", "⚠️ مکمل ورژن 24 گھنٹے کھولنے کے لیے عارضی کریڈٹ چاہیے · موجودہ: {n}"],
  // ── useReciterPreview ──
  ["urSesHata", "⚠️ {x} · ses kaydı şu an yüklenemedi. Lütfen başka bir kâri deneyin.", "⚠️ {x} · audio recording couldn't load right now. Try another reciter.", "⚠️ {x} · تعذر تحميل تسجيل الصوت الآن. جرّب قارئًا آخر.", "⚠️ {x} · rekaman audio gagal dimuat. Coba qari lain.", "⚠️ {x} · آڈیو ریکارڈنگ اِس وقت لوڈ نہیں۔ دوسرے قاری کی آزمائیں۔"],
  ["qariIsim", "Kâri", "Reciter", "قارئ", "Qari", "قاری"],
  // ── useStudioArkaPlanBag ──
  ["sbYuklenenKorundu", "📁 Yüklediklerin korundu — sekme değişimi onlara dokunmadı", "📁 Your uploads were kept — tab switching didn't touch them", "📁 حُفظت تحميلاتك — تبديل التبويب لم يمسها", "📁 Unggahanmu dipertahankan — pergantian tab tak menyentuhnya", "📁 آپ کے اپلوڈز محفوظ رہے — ٹیب بدلنے نے انہیں نہیں چھیڑا"],
  ["sbDosyanKorundu", "📁 Kendi dosyan korundu — zar onu değiştirmez", "📁 Your own file was kept — the dice won't replace it", "📁 حُفظ ملفك الخاص — النرد لا يستبدله", "📁 Filemu sendiri dipertahankan — dadu tak menggantinya", "📁 آپ کی اپنی فائل محفوظ — پانسہ اسے بدلے گا نہیں"],
  ["sbRastgele", "Rastgele seçildi: {x}", "Randomly picked: {x}", "اُختِير عشوائيًا: {x}", "Dipilih acak: {x}", "بُلاٹی منتخب ہوا: {x}"],
  ["sbDosyalarAtanmis", "📁 Kendi dosyaların atanmış durumda — zar onlara dokunmadı", "📁 Your own files are still assigned — the dice didn't touch them", "📁 ملفاتك الخاصة ما تزال مُعيَّنة — النرد لم يمسها", "📁 Filemu sendiri masih terpasang — dadu tak menyentuhnya", "📁 آپ کی فائلیں اب بھی مختص ہیں — پانسہ نہیں چھیڑا"],
  ["sbRastgeleAta", "✨ {n} ayete \"{x}\" içinden rastgele atmosfer atandı", "✨ Random atmosphere from \"{x}\" assigned to {n} verses", "✨ عُيّنت أجواء عشوائية من \"{x}\" لـ {n} آية", "✨ Atmosfer acak dari \"{x}\" ditetapkan untuk {n} ayat", "✨ {n} آیات کو \"{x}\" سے بُلاٹی اٹموسفر ملا"],
  ["sbOnceAyetSec", "Önce en az bir ayet seçin", "Select at least one verse first", "اختر آية واحدة على الأقل أولًا", "Pilih minimal satu ayat dulu", "پہلے کم از کم ایک آیت منتخب کریں"],
  // ── useStudioCekirdek ──
  ["scSureYetmiyor", "⚠️ {m} süresi seçili ayetlere yetmiyor · ayet yarım kalmasın diye yaklaşık ilk {n} ayet alınır, sonrası bırakılır", "⚠️ The {m} duration isn't enough for the selected verses · about the first {n} verses are kept so none is cut off, the rest are dropped", "⚠️ مدة {m} لا تكفي الآيات المختارة · تُؤخذ أول {n} آية تقريبًا كي لا تُقطع آية، ويُهجر الباقي", "⚠️ Durasi {m} tak cukup untuk ayat terpilih · sekitar {n} ayat pertama dipakai agar tak ada ayat terpotong, sisanya dilepas", "⚠️ {m} کی مدت منتخب آیات کے لیے کم ہے · آیت ادھوری na reh jaye اس لیے تقریباً پہلی {n} آیات لی جاتی ہیں، باقی چھوڑ دی جاتی ہیں"],
  // ── useStudioPicker ──
  ["spTaslak", "✨ Taslak yükleniyor: {x}", "✨ Loading draft: {x}", "✨ جارٍ تحميل المسودة: {x}", "✨ Memuat draf: {x}", "✨ ڈرافٹ لوڈ ہو رہا ہے: {x}"],
  ["spSecildi", "Atmosfer seçildi: {x}", "Atmosphere picked: {x}", "اُختيرت الأجواء: {x}", "Atmosfer dipilih: {x}", "اٹموسفر منتخب: {x}"],
  ["spMisafirDoldu", "🎁 Misafir deneme hakkın doldu · Google ile 3 saniyede ücretsiz üye ol, +5 üretim hakkı kazan", "🎁 Your guest trial is used up · become a free member in 3 s via Google, earn +5 production credits", "🎁 انتهت تجربتك كزائر · سجّل مجانًا عبر جوجل خلال 3 ثوانٍ، اربح +5 رصيد إنتاج", "🎁 Kuota uji tamu habis · daftar gratis via Google dalam 3 dtk, dapat +5 kuota produksi", "🎁 آپ کا مہمان ٹرائل ختم · گوگل سے 3 سیکنڈ میں مفت ممبر شپ، +5 پروڈکشن کریڈٹ حاصل کریں"],
  ["spMisafirModu", "👋 Misafir modundasın · {x} deneme videosu hakkın var · indirmek için üyelik gerekir", "👋 You're in guest mode · {x} trial videos remain · membership needed to download", "👋 أنت في وضع الزائر · لديك {x} فيديو تجريبي · يلزم عضوية للتنزيل", "👋 Kamu di mode tamu · tersisa {x} video uji · perlu keanggotaan untuk mengunduh", "👋 آپ مہمان موڈ میں ہیں · {x} ٹرائل ویڈیو باقی · ڈاؤن لوڈ کے لیے ممبر شپ ضروری"],
  // ── useTier ──
  ["utAcildiSorun", "⚠️ {x} açıldı ama hakkın düşülemedi — sayfayı yenile", "⚠️ {x} unlocked but your credit couldn't be charged — refresh the page", "⚠️ فُتح {x} لكن تعذر خصم رصيدك — حدّث الصفحة", "⚠️ {x} terbuka tapi kredit tak terpotong — segarkan halaman", "⚠️ {x} کھلا لیکن کریڈٹ کاٹا نہیں جا سکا — صفحہ ریفریش کریں"],
  ["utAcildiJeton", "🔓 {x} 24 saatliğine açıldı · −{c} jeton", "🔓 {x} unlocked for 24 h · −{c} tokens", "🔓 فُتح {x} لـ24 ساعة · −{c} عملة", "🔓 {x} terbuka 24 jam · −{c} jeton", "🔓 {x} 24 گھنٹے کے لیے کھلا · −{c} ٹوکن"],
  ["utJetonGerekli", "{x} için {c} jeton gerekiyor · mevcut: {n}", "{x} requires {c} tokens · current: {n}", "تطلب {x} من {c} عملة · المتوفر: {n}", "{x} butuh {c} jeton · saat ini: {n}", "{x} کے لیے {c} ٹوکن چاہیے · موجودہ: {n}"],
  ["utTamAcildiSorun", "⚠️ Tam Sürüm açıldı ama hakkın düşülemedi — sayfayı yenile", "⚠️ Full Version unlocked but credit couldn't be charged — refresh", "⚠️ فُتحت النسخة الكاملة لكن تعذر الخصم — حدّث الصفحة", "⚠️ Versi Penuh terbuka tapi kredit tak terpotong — segarkan", "⚠️ مکمل ورژن کھلا لیکن کریڈٹ کاٹا نہیں جا سکا — ریفریش کریں"],
  ["utTamAcildiJeton", "✅ Tam Sürüm modu 24 saatliğine açıldı · −{c} jeton", "✅ Full Version unlocked for 24 h · −{c} tokens", "✅ فُتح وضع النسخة الكاملة لـ24 ساعة · −{c} عملة", "✅ Mode Versi Penuh terbuka 24 jam · −{c} jeton", "✅ مکمل ورژن موڈ 24 گھنٹے · −{c} ٹوکن"],
  ["utTamGerekli", "⚠️ Tam Sürüm modunu açmak için {c} jeton gerekiyor · mevcut: {n}", "⚠️ Unlocking Full Version needs {c} tokens · current: {n}", "⚠️ فتح النسخة الكاملة يحتاج {c} عملة · المتوفر: {n}", "⚠️ Membuka Versi Penuh butuh {c} jeton · saat ini: {n}", "⚠️ مکمل ورژن کھولنے کے لیے {c} ٹوکن چاہیے · موجودہ: {n}"],
  // ── useVideoGenerator ──
  ["vgMola", "⏳ Deneme videoları arasında kısa bir mola var · {x} sn sonra tekrar dene", "⏳ A short break between trial videos · try again in {x} s", "⏳ فاصل قصير بين فيديوهات التجربة · حاول بعد {x} ث", "⏳ Jeda singkat antar video uji · coba lagi {x} dtk", "⏳ ٹرائل ویڈیوز میں چھوٹا وقفہ · {x} سیکنڈ بعد دوبارہ کوشش کریں"],
  ["vgBugunDoldu", "🌙 Bugünkü deneme hakkın doldu · yarın tekrar gelirsin ya da hemen ücretsiz üye olabilirsin", "🌙 Today's trial is used up · come back tomorrow or become a free member now", "🌙 انتهت تجربة اليوم · عُد غدًا أو سجّل مجانًا الآن", "🌙 Kuota uji hari ini habis · kembali besok atau jadi member gratis sekarang", "🌙 آج کا ٹرائل ختم · کل پھر آئیں یا ابھی مفت ممبر شپ لیں"],
  ["vgTrialBirleştirVardi", "🎁 Ücretsiz deneme hakkın bitti · Google ile 3 saniyede üye ol, +5 üretim hakkı kazan", "🎁 Free trial exhausted · sign up via Google in 3 s, earn +5 production credits", "🎁 انتهت تجربتك المجانية · سجّل عبر جوجل خلال 3 ثوانٍ، اربح +5 رصيد", "🎁 Uji gratis habis · daftar via Google dalam 3 dtk, dapat +5 kuota", "🎁 مفت ٹرائل ختم · گوگل سے 3 سیکنڈ میں ممبر شپ، +5 کریڈٹ"],
  ["vgTarayiciDestekmiyor", "Tarayıcınız video üretimini desteklemiyor", "Your browser doesn't support video rendering", "متصفحك لا يدعم إنتاج الفيديو", "Perambanmu tidak mendukung produksi video", "آپ کا براؤزر ویڈیو پروڈکشن کی حمایت نہیں کرتا"],
  ["vgCanvasDestekmiyor", "⚠️ Bu tarayıcı canvas kaydını desteklemiyor · Chrome, Edge veya güncel Safari kullanın", "⚠️ This browser doesn't support canvas recording · use Chrome, Edge, or current Safari", "⚠️ لا يدعم هذا المتصفح تسجيل canvas · استخدم Chrome أو Edge أو Safari محدّثًا", "⚠️ Peramban ini tidak mendukung perekaman canvas · pakai Chrome, Edge, atau Safari terkini", "⚠️ یہ براؤزر canvas ریکارڈنگ کی حمایت نہیں کرتا · Chrome، Edge یا تازہ Safari استعمال کریں"],
  ["vgSesSure", "⚠️ {x} hocanın sesi yalnızca tüm surede uygulanabilir · lütfen \"Tüm Sure\" butonuyla ekleyin", "⚠️ {x}'s voice applies only to a whole surah · please add via the \"Whole Surah\" button", "⚠️ صوت {x} يُطبق على السورة كاملة فقط · أضفه عبر زر \"السورة كاملة\"", "⚠️ Suara {x} hanya berlaku untuk satu surah penuh · tambahkan lewat tombol \"Seluruh Surah\"", "⚠️ {x} کی آواز صرف پوری سورہ پر لاگو ہوتی ہے · براہِ کرم \"مکمل سورہ\" بٹن سے شامل کریں"],
  ["vgIptal", "Üretim iptal edildi · jeton düşmedi", "Rendering cancelled · no tokens charged", "أُلغي الإنتاج · لم تُخصم عملات", "Produksi dibatalkan · jeton tidak terpotong", "پروڈکشن منسوخ · ٹوکن کاٹا نہیں گیا"],
  ["vgLansman", "🎁 Lansman denemesi: {n}/{t} üretim hakkı kaldı", "🎁 Launch trial: {n}/{t} production credits left", "🎁 تجربة الإطلاق: {n}/{t} رصيد إنتاج متبقٍ", "🎁 Uji peluncuran: {n}/{t} kuota produksi tersisa", "🎁 لانچ ٹرائل: {n}/{t} پروڈکشن کریڈٹ باقی"],
  ["vgYetkiSunucu", "Üretim yetkisi için sunucuya ulaşılamadı", "Couldn't reach the server for render authorization", "تعذر الوصول إلى الخادم لتخويل الإنتاج", "Tidak bisa menjangkau server untuk izin produksi", "پروڈکشن اجازت کے لیے سرور تک رسائی میسر نہیں"],
  ["vgSesSurahUyusmazlik", "⚠️ Kendi sesin {x}. suresine ait — seçili ayetlerle uyuşmuyor, hocanın sesiyle üretiliyor", "⚠️ Your own voice belongs to surah {x} — it doesn't match the selected verses, rendering with the reciter's voice", "⚠️ صوتك يخص سورة {x} — لا يطابق الآيات المختارة، الإنتاج بصوت القارئ", "⚠️ Suaramu milik surah {x} — tidak cocok dengan ayat terpilih, diproduksi dengan suara qari", "⚠️ آپ کی اپنی آواز سورہ {x} کی ہے — منتخب آیات سے مطابقت نہیں رکھتی، قاری کی آواز سے پروڈکشن ہو رہی ہے"],
  ["vgKendiSesUretim", "🎙️ Video kendi sesinle üretiliyor · {n} ayet", "🎙️ Rendering video with your own voice · {n} verses", "🎙️ يُنتَج الفيديو بصوتك · {n} آية", "🎙️ Video diproduksi dengan suaramu · {n} ayat", "🎙️ ویڈیو آپ کی اپنی آواز سے پروڈکشن · {n} آیات"],
  ["vgSesEslesmedi", "⚠️ {x} ayet kendi sesinle eşleşmedi — o ayetler eklenmedi", "⚠️ {x} verses didn't match your own voice — those verses weren't added", "⚠️ {x} آية لم تطابق صوتك — لم تُضف هذه الآيات", "⚠️ {x} ayat tidak cocok dengan suaramu — ayat itu tidak ditambahkan", "⚠️ {x} آیات آپ کی اپنی آواز سے مطابقت نہیں رکھتیں — وہ آیات شامل نہیں ہوئیں"],
  ["vgSesCozumHatasi", "⚠️ Kendi sesin çözümlenemedi — hocanın sesiyle devam ediliyor", "⚠️ Your own voice couldn't be processed — continuing with the reciter's voice", "⚠️ تعذر تحليل صوتك — نتابع بصوت القارئ", "⚠️ Suaramu tidak bisa diproses — lanjut dengan suara qari", "⚠️ آپ کی اپنی آواز کو تجزیہ نہیں کیا جا سکا — قاری کی آواز سے جاری ہے"],
  ["vgSureAsildi", "⚠️ {m} süresi aşıldı · son {d} ayet eklenmedi · {n} ayet ile üretiliyor", "⚠️ {m} duration exceeded · last {d} verses not added · rendering with {n} verses", "⚠️ تجاوزت مدة {m} · آخر {d} آية لم تُضف · الإنتاج بـ {n} آية", "⚠️ Durasi {m} terlampaui · {d} ayat terakhir tidak ditambahkan · diproduksi dengan {n} ayat", "⚠️ {m} کی مدت گزر گئی · آخری {d} آیات شامل نہیں ہوئیں · {n} آیات سے پروڈکشن"],
  ["vgIade", "↩️ Teknik hata nedeniyle üretim hakkınız iade edildi", "↩️ Your production credit was refunded due to a technical error", "↩️ أُعيد رصيد الإنتاج بسبب خطأ تقني", "↩️ Kuota produksi Anda dikembalikan karena galat teknis", "↩️ ٹیکنیکل خرابی کی وجہ سے آپ کا پروڈکشن کریڈٹ واپس کر دیا گیا"],
  ["vgIadeHatasi", "⚠️ Teknik hata sonrası hak iadesi tamamlanamadı — destek ile iletişime geçin", "⚠️ Credit refund after the technical error failed — contact support", "⚠️ تعذر استرداد الرصيد بعد الخطأ التقني — تواصل مع الدعم", "⚠️ Pengembalian kuota pasca galat teknis gagal — hubungi dukungan", "⚠️ ٹیکنیکل خرابی کے بعد کریڈٹ واپسی مکمل نہیں ہو سکی — سپورٹ سے رابطہ کریں"],
  // ── useVideoTasarimAyarlar ──
  ["vtInternetYok", "📶 İnternet bağlantısı yok — \"{x}\" fontu yüklenemedi, Amiri kullanılacak", "📶 No internet — \"{x}\" font couldn't load, Amiri will be used", "📶 لا يوجد إنترنت — تعذر تحميل خط \"{x}\"، سيُستخدم Amiri", "📶 Tidak ada internet — font \"{x}\" gagal dimuat, Amiri akan dipakai", "📶 انٹرنیٹ کنکشن نہیں — \"{x}\" فونٹ لوڈ نہیں ہو سکا، Amiri استعمال ہوگا"],
  ["vtFontKontrol", "⚠️ \"{x}\" fontu yüklenemedi — Amiri kullanılacak (internet bağlantını kontrol et)", "⚠️ \"{x}\" font couldn't load — Amiri will be used (check your connection)", "⚠️ تعذر تحميل خط \"{x}\" — سيُستخدم Amiri (تحقق من اتصالك)", "⚠️ Font \"{x}\" gagal dimuat — Amiri akan dipakai (periksa koneksi internetmu)", "⚠️ \"{x}\" فونٹ لوڈ نہیں ہو سکا — Amiri استعمال ہوگا (اپنا انٹرنیٹ کنکشن چیک کریں)"],
  ["vtFontHata", "⚠️ \"{x}\" fontu yüklenemedi — Amiri kullanılacak", "⚠️ \"{x}\" font couldn't load — Amiri will be used", "⚠️ تعذر تحميل خط \"{x}\" — سيُستخدم Amiri", "⚠️ Font \"{x}\" gagal dimuat — Amiri akan dipakai", "⚠️ \"{x}\" فونٹ لوڈ نہیں ہو سکا — Amiri استعمال ہوگا"],
  // ── useWallet ──
  ["uwSaatUyusmuyor", "⚠️ Sistem saatiniz gerçek zamanla uyuşmuyor. Özel gün bonusu askıya alındı.", "⚠️ Your system clock doesn't match real time. The special-day bonus is suspended.", "⚠️ ساعة جهازك لا تطابق الوقت الحقيقي. أُوقف مكافأة الأيام الخاصة مؤقتًا.", "⚠️ Jam sistemmu tidak cocok dengan waktu nyata. Bonus hari spesial ditangguhkan.", "⚠️ آپ کی سسٹم گھڑی حقیقی وقت سے مطابقت نہیں رکھتی۔ خصوصی دن کا بونس معطل کر دیا گیا۔"],
  ["uwCuma", "🕌 Cuma bonusu: +{x} jeton (tavan dışı)", "🕌 Friday bonus: +{x} tokens (above the cap)", "🕌 مكافأة الجمعة: +{x} عملة (فوق الحد)", "🕌 Bonus Jumat: +{x} jeton (di luar batas)", "🕌 جمعہ کا بونس: +{x} ٹوکن (حد سے باہر)"],
  ["uwKadir", "✨ Kadir Gecesi bonusu: +{x} jeton (tavan dışı)", "✨ Laylat al-Qadr bonus: +{x} tokens (above the cap)", "✨ مكافأة ليلة القدر: +{x} عملة (فوق الحد)", "✨ Bonus Lailatul Qadar: +{x} jeton (di luar batas)", "✨ لیلۃ القدر کا بونس: +{x} ٹوکن (حد سے باہر)"],
  // ── render overlay (studioAppBolumler) ──
  ["rsSistemModu", "SİSTEM AKTİF RENDER MODUNDA", "SYSTEM ACTIVE · RENDER MODE", "النظام في وضع الإنتاج النشط", "SISTEM AKTIF MODE RENDER", "سسٹم فعال رینڈر موڈ میں"],
  ["rsSekmeKapatma", "Lütfen sekmeyi kapatma — video üretiliyor!", "Please keep this tab open — a video is rendering!", "رجاءً لا تُغلق التبويب — يجري إنتاج فيديو!", "Jangan tutup tab — video sedang diproduksi!", "براہِ کرم ٹیب بند نہ کریں — ویڈیو پروڈکشن ہو رہی ہے!"],
  ["rsBirlestirmeUyari", "Video tek klipte birleştirilirken lütfen bu sekmeyi açık tutun —", "While the video is merged into one clip please keep this tab open —", "أثناء دمج الفيديو في مقطع واحد أبقِ هذا التبويب مفتوحًا —", "Saat video digabung menjadi satu klip jaga tab tetap terbuka —", "ویڈیو ایک کلپ میں ملتے وقت یہ ٹیب کھلا رکھیں —"],
  ["rsVideoDonma", "video birkaç saniye donabilir", "the video may freeze for a few seconds", "قد يتجمد الفيديو لبضع ثوانٍ", "video bisa macet beberapa detik", "ویڈیو چند سیکنڈ جم سکتی ہے"],
  ["rsBirlestirmeSon", " — normaldir, pencereyi yönetmeyin.", " — that's normal, don't manage the window.", " — هذا طبيعي، لا تتعامل مع النافذة.", " — normal, jangan utak-atik jendela.", " — عام بات ہے، ونڈو نہ چھیڑیں۔"],
  ["rsVideoIsleniyor", "Video işleniyor", "Processing video", "جارٍ معالجة الفيديو", "Memproses video", "ویڈیو پروسیس ہو رہی ہے"],
  ["rsIptalBtn", "Üretimi İptal Et", "Cancel Rendering", "إلغاء الإنتاج", "Batalkan Produksi", "پروڈکشن منسوخ کریں"],
  ["rsIptalNot", "İptal ettiğinizde üretim hakkı (jeton) hesabınızdan düşmez.", "On cancel, your production credit (token) is not charged.", "عند الإلغاء لا يُخصم رصيد الإنتاج (العملة) من حسابك.", "Saat dibatalkan, kuota produksi (jeton) tidak terpotong.", "منسوخ کرنے پر پروڈکشن کریڈٹ (ٹوکن) آپ کے اکاؤنٹ سے کاٹا نہیں جائے گا۔"],
  // ── zaten kodda çağrılıp sözlükte olmayanlar ──
  ["shDahaFazla", "Daha fazla", "More", "المزيد", "Lainnya", "مزید"],
  ["vpDenemeKalan", "{k}/{t} ücretsiz deneme hakkı kaldı", "{k}/{t} free trial credits left", "متبقٍ {k}/{t} رصيد تجربة مجاني", "{k}/{t} kuota uji gratis tersisa", "{k}/{t} مفت ٹرائل کریڈٹ باقی"],
  ["vpDenemeBitti", "Deneme hakkın tamamlandı", "Trial credits used up", "انتهت رصيد التجربة", "Kuota uji habis", "ٹرائل کریڈٹ ختم"],
  ["vpUyeligeGec", "Üyeliğe geç", "Go premium", "انتقل إلى العضوية", "Jadi member", "ممبرشپ حاصل کریں"],
  ["ovBaslik", "Önerilen klipler", "Suggested clips", "المقاطع المقترحة", "Klip saran", "تجویز شدہ کلپس"],
  ["ovOzelIntro", "Her öneri tek dokunuşla stüdyoya yüklenir —", "Each suggestion loads into the studio in one tap —", "كل اقتراح يُحمَّل في الاستوديو بنقرة واحدة —", "Tiap saran dimuat ke studio dengan sekali tap —", "ہر تجویز ایک ٹیپ میں اسٹوڈیو میں لوڈ ہوتی ہے —"],
  ["hbrKendiSesBaslik", "Kendi sesinle üret", "Produce with your voice", "أنتِج بصوتك", "Produksi dengan suaramu", "اپنی آواز میں پروڈکشن کریں"],
  ["renderAuthError", "Üretim için giriş gerekli — önce üye ol", "Sign in required to render — become a member first", "يلزم الدخول للإنتاج — سجّل أولًا", "Perlu masuk untuk produksi — daftar dulu", "پروڈکشن کے لیے لاگ اِن ضروری — پہلے ممبر شپ لیں"],
  ["renderServerError", "Sunucu hatası — sure yüklenemedi, tekrar dener misin?", "Server error — surah couldn't load, try again?", "خطأ في الخادم — تعذر تحميل السورة، تحاول مجددًا؟", "Galat server — surah gagal dimuat, coba lagi?", "سرور ایرر — سورہ لوڈ نہیں ہو سکی، دوبارہ کوشش کریں؟"],
  ["guestLimit", "🎁 Bu özellik misafirlere kapalı — ücretsiz üye ol", "🎁 This feature is closed to guests — become a free member", "🎁 هذه الميزة مغلقة للزوار — سجّل مجانًا", "🎁 Fitur ini tertutup untuk tamu — jadi member gratis", "🎁 یہ فیچر مہمانوں کے لیے بند ہے — مفت ممبر شپ لیں"],
  ["loadingVerse", "Yükleniyor…", "Loading…", "جارٍ التحميل…", "Memuat…", "لوڈ ہو رہا ہے…"],
];

const DILLER = ["tr", "en", "ar", "id", "ur"];
const mevcut = DILLER.map((d) => JSON.parse(fs.readFileSync(`src/i18n/dicts.${d}.json`, "utf8")));
const yeni = [];
for (const kayit of EKSIK) {
  const [k] = kayit;
  if (k in mevcut[0]) { console.log("~~ VAR:", k); continue; }
  yeni.push(k);
  for (let i = 0; i < 5; i++) mevcut[i][k] = kayit[i + 1];
}
DILLER.forEach((d, i) => fs.writeFileSync(`src/i18n/dicts.${d}.json`, JSON.stringify(mevcut[i], null, 2) + "\n"));
console.log(`SÖZLÜK: +${yeni.length} anahtar`);

// ── kod bağlama ──
const KO = `// ★ 26.10 I18N KÖPRÜSÜ: oturumun dilini her çağrıda okur\nconst ttX2610 = (k: string): string => translate(typeof localStorage !== "undefined" ? (localStorage.getItem("nur_lang") || "tr") : "tr", k);`;

function kospruEkle(p, metin) {
  if (metin.includes("const ttX2610 =")) return metin;
  if (!metin.includes('from "../i18n"')) metin = `import { translate } from "../i18n";\n` + metin;
  const ilkImport = metin.match(/^import[\s\S]*?;\n/m);
  if (ilkImport) metin = metin.replace(ilkImport[0], ilkImport[0] + KO + "\n");
  else metin = KO + "\n" + metin;
  return metin;
}

const ISLEMLER = [
  ["src/studio/useAudioPreview.ts", "notify(\"⚠️ Bu kârinin tam sure kaydı yüklenemedi · ayet konumu korundu\")", "notify(ttX2610(\"apTamsureHata\"))"],
  ["src/studio/useAudioPreview.ts", "notify(\"⚠️ Bu ayetin sesi yüklenemedi · sıradaki ayete geçiliyor\")", "notify(ttX2610(\"apAyetSesHata\"))"],
  ["src/studio/useAudioPreview.ts", "notify(\"⚠️ Son ayetin sesi yüklenemedi · önizleme durduruldu\")", "notify(ttX2610(\"apSonAyetHata\"))"],
  ["src/studio/useAudioPreview.ts", "notify(\"⏳ Bağlantı yavaş · sıradaki ayete geçiliyor\")", "notify(ttX2610(\"apBaglantiYavas\"))"],
  ["src/studio/useVerseAudioPlayback.ts", "notify(\"⚠️ Bu kârinin tam sure kaydı yüklenemedi · ayet konumu korundu\")", "notify(ttX2610(\"apTamsureHata\"))"],
  ["src/studio/useVerseAudioPlayback.ts", "notify(\"⚠️ Bu kârinin ses kaydı yüklenemedi · ayet konumu korundu\")", "notify(ttX2610(\"uvKariSesHata\"))"],
  ["src/studio/useAuth.ts", "notify(\"⚠️ Google giriş oturumu doğrulanamadı. Lütfen tekrar deneyin.\")", "notify(ttX2610(\"uaOturumDogrulanamadi\"))"],
  ["src/studio/useAuth.ts", "notify(`🛡️ Google doğrulandı · Kurucu Admin · ${adminTier.toUpperCase()} modu`)", "notify(ttX2610(\"uaKurucu\").replace(\"{x}\", String(adminTier.toUpperCase())))"],
  ["src/studio/useAuth.ts", "notify(\"Google ile giriş başarılı · hoş geldiniz\")", "notify(ttX2610(\"uaGirisBasarili\"))"],
  ["src/studio/useAuth.ts", "notify(\"Google girişi sırasında bağlantı hatası oluştu\")", "notify(ttX2610(\"uaBaglantiHatasi\"))"],
  ["src/studio/useAuth.ts", "notify(\"Admin paneli için doğrulanmış Google admin oturumu gerekli\")", "notify(ttX2610(\"uaAdminOturumGerekli\"))"],
  ["src/studio/useAyetSecim.ts", "notify(\"⚠️ Önce sure ve ayet seç\")", "notify(ttX2610(\"usOnceSureAyet\"))"],
  ["src/studio/useAyetSecim.ts", "notify(\"Önce bir sure seç\")", "notify(ttX2610(\"usOnceSure\"))"],
  ["src/studio/useAyetSecim.ts", "notify(`${meta.name} Suresi tamamı eklendi (${rows.length} ayet)`)", "notify(ttX2610(\"usSureEklendi\").replace(\"{x}\", String(meta.name)).replace(\"{n}\", String(rows.length)))"],
  ["src/studio/useBan.ts", "notify(\"🛡️ ADMIN: Önceki güvenlik kaydı temizlendi · ban uygulanmadı\")", "notify(ttX2610(\"secAdminTemiz\"))"],
  ["src/studio/useBan.ts", "notify(`🛡️ ADMIN UYARI: Güvenlik sinyali yakalandı (${key}) — ban uygulanmadı, sadece bildirildi.`)", "notify(ttX2610(\"secSinyal\").replace(\"{x}\", String(key)))"],
  ["src/studio/useBan.ts", "notify(\"🛡️ Güvenlik: Eski veri formatı tespit edildi · veriler otomatik güncellendi\")", "notify(ttX2610(\"secEskiFormat\"))"],
  ["src/studio/useBan.ts", "notify(`🛡️ Güvenlik uyarısı: ${key} — otomatik ban uygulanmadı`)", "notify(ttX2610(\"secGenelUyari\").replace(\"{x}\", String(key)))"],
  ["src/studio/useSecurityGuards.ts", "notify(\"🛡️ ADMIN: Önceki güvenlik kaydı temizlendi · ban uygulanmadı\")", "notify(ttX2610(\"secAdminTemiz\"))"],
  ["src/studio/useSecurityGuards.ts", "notify(`🛡️ ADMIN UYARI: Güvenlik sinyali yakalandı (${key}) — ban uygulanmadı, sadece bildirildi.`)", "notify(ttX2610(\"secSinyal\").replace(\"{x}\", String(key)))"],
  ["src/studio/useSecurityGuards.ts", "notify(\"🛡️ Güvenlik: Eski veri formatı tespit edildi · veriler otomatik güncellendi\")", "notify(ttX2610(\"secEskiFormat\"))"],
  ["src/studio/useSecurityGuards.ts", "notify(`🛡️ Güvenlik uyarısı: ${key} — otomatik ban uygulanmadı`)", "notify(ttX2610(\"secGenelUyari\").replace(\"{x}\", String(key)))"],
  ["src/studio/useKendiSes.ts", "notify(\"⚠️ Ses dosyası 60 MB'den büyük olamaz\")", "notify(ttX2610(\"ukBoyutSinir\"))"],
  ["src/studio/useKendiSes.ts", "notify(\"⚠️ Lütfen ses dosyası yükleyin (mp3, m4a, wav, ogg)\")", "notify(ttX2610(\"ukSesYukleyin\"))"],
  ["src/studio/useKendiSes.ts", "notify(`⏱ Senin sn sınırın ${maksSn} — kayıttan fazlası kullanılmaz`)", "notify(ttX2610(\"ukSinirSn\").replace(\"{x}\", String(maksSn)))"],
  ["src/studio/useKendiSes.ts", "notify(\"⚠️ Seste okunan bölüm algılanamadı — dosya sessiz veya bozuk olabilir\")", "notify(ttX2610(\"ukBolumAlgilanamadi\"))"],
  ["src/studio/useKendiSes.ts", "notify(\"⚠️ Ses dosyası çözümlenemedi — mp3/m4a/wav deneyin\")", "notify(ttX2610(\"ukCozumlenemedi\"))"],
  ["src/studio/useKendiSes.ts", "notify(\"⚠️ Kayıt bulunamadı\")", "notify(ttX2610(\"ukKayitYok\"))"],
  ["src/studio/useKendiSes.ts", "notify(\"⚠️ Seste okunan bölüm algılanamadı\")", "notify(ttX2610(\"ukBolumYok\"))"],
  ["src/studio/useKendiSes.ts", "notify(\"⚠️ Ses çözümlenemedi — yeniden analiz başarısız\")", "notify(ttX2610(\"ukYenidenAnaliz\"))"],
  ["src/studio/useKendiSes.ts", "notify(\"✅ Ayet zamanlamaları kaydedildi\")", "notify(ttX2610(\"ukZamanlamaKayit\"))"],
  ["src/studio/useManualAuthActions.ts", "(${Math.ceil(rl.retryAfterMs / 1000)} sn kaldı)", " ${ttX2610(\"umSnKaldi\").replace(\"{n}\", String(Math.ceil(rl.retryAfterMs / 1000)))}"],
  ["src/studio/useManualAuthActions.ts", "notify(\"🛡️ Kurucu Admin girişi başarılı! Tüm kilitler açıldı.\")", "notify(ttX2610(\"umKurucuGiris\"))"],
  ["src/studio/useManualAuthActions.ts", "notify(\"Giriş başarılı! Hoş geldiniz.\")", "notify(ttX2610(\"umGirisOk\"))"],
  ["src/studio/useManualAuthActions.ts", "notify(\"🛡️ Kurucu Admin Hesabı Oluşturuldu! 1000 jeton + Nûr Elit tanımlandı.\")", "notify(ttX2610(\"umKurucuHesap\"))"],
  ["src/studio/useManualAuthActions.ts", "notify(`🎉 Kayıt başarılı! Hoş geldiniz — +${JETON.KAYIT_BONUSU_FREE} üretim hakkı hediye edildi.`)", "notify(ttX2610(\"umKayitBonus\").replace(\"{x}\", String(JETON.KAYIT_BONUSU_FREE)))"],
  ["src/studio/useManualAuthActions.ts", "notify(\"Kayıt başarılı! Hoş geldiniz.\")", "notify(ttX2610(\"umKayitOk\"))"],
  ["src/studio/useManualAuthActions.ts", "notify(`Doğrulama kodu: ${code}`)", "notify(ttX2610(\"umKod\").replace(\"{x}\", String(code)))"],
  ["src/studio/useManualAuthActions.ts", "notify(\"Kod doğrulandı! Şifrenizi sıfırlayabilirsiniz.\")", "notify(ttX2610(\"umKodOk\"))"],
  ["src/studio/useManualAuthActions.ts", "notify(\"Kod hatalı!\")", "notify(ttX2610(\"umKodHata\"))"],
  ["src/studio/useMedyaYukleme.ts", "notify(\"⚠️ Dosya kalıcı depoda bulunamadı — yeniden yüklemeyi dene\")", "notify(ttX2610(\"uyDepoYok\"))"],
  ["src/studio/useMedyaYukleme.ts", "notify(\"🎵 Ses dosyası arka plan olamaz — arka plan için video/resim seç\")", "notify(ttX2610(\"uySesArkaPlanOlmaz\"))"],
  ["src/studio/useMedyaYukleme.ts", "notify(`📁 \"${row.name}\" Yüklediklerim klasörüne kaydedildi`)", "notify(ttX2610(\"uyKaydedildi\").replace(\"{x}\", String(row.name)))"],
  ["src/studio/useMedyaYukleme.ts", "notify(`💾 \"${row.name}\" arka plan olarak seçildi — kalıcı depodan`)", "notify(ttX2610(\"uyArkaPlanSecildi\").replace(\"{x}\", String(row.name)))"],
  ["src/studio/useMedyaYukleme.ts", "notify(\"⚠️ Dosya açılamadı — depolama erişimi engellenmiş olabilir\")", "notify(ttX2610(\"uyDosyaAcilamadi\"))"],
  ["src/studio/useMicroUnlocks.ts", "notify(`🔓 ${featureLabel} 24 saatliğine açıldı`)", "notify(ttX2610(\"uxAcildi\").replace(\"{x}\", String(featureLabel)))"],
  ["src/studio/useMicroUnlocks.ts", "notify(`${featureLabel} için geçici açma hakkı gerekiyor · mevcut: ${jetonCount}`)", "notify(ttX2610(\"uxHakki\").replace(\"{x}\", String(featureLabel)).replace(\"{n}\", String(jetonCount)))"],
  ["src/studio/useMicroUnlocks.ts", "notify(\"✅ Tam Sürüm modu 24 saatliğine açıldı\")", "notify(ttX2610(\"uxTamAcildi\"))"],
  ["src/studio/useMicroUnlocks.ts", "notify(`⚠️ Tam Sürüm modunu 24 saatliğine açmak için geçici açma hakkı gerekiyor · mevcut: ${jetonCount}`)", "notify(ttX2610(\"uxTamGerekli\").replace(\"{n}\", String(jetonCount)))"],
  ["src/studio/useReciterPreview.ts", "notify(`⚠️ ${target?.name ?? \"Kâri\"} · ses kaydı şu an yüklenemedi. Lütfen başka bir kâri deneyin.`)", "notify(ttX2610(\"urSesHata\").replace(\"{x}\", String(target?.name ?? ttX2610(\"qariIsim\"))))"],
  ["src/studio/useStudioArkaPlanBag.ts", "notify(\"📁 Yüklediklerin korundu — sekme değişimi onlara dokunmadı\")", "notify(ttX2610(\"sbYuklenenKorundu\"))"],
  ["src/studio/useStudioArkaPlanBag.ts", "notify(\"📁 Kendi dosyan korundu — zar onu değiştirmez\")", "notify(ttX2610(\"sbDosyanKorundu\"))"],
  ["src/studio/useStudioArkaPlanBag.ts", "notify(`Rastgele seçildi: ${c.label}`)", "notify(ttX2610(\"sbRastgele\").replace(\"{x}\", String(c.label)))"],
  ["src/studio/useStudioArkaPlanBag.ts", "notify(\"📁 Kendi dosyaların atanmış durumda — zar onlara dokunmadı\")", "notify(ttX2610(\"sbDosyalarAtanmis\"))"],
  ["src/studio/useStudioArkaPlanBag.ts", "notify(`✨ ${atananlar.length} ayete \"${catLabel}\" içinden rastgele atmosfer atandı`)", "notify(ttX2610(\"sbRastgeleAta\").replace(\"{n}\", String(atananlar.length)).replace(\"{x}\", String(catLabel)))"],
  ["src/studio/useStudioArkaPlanBag.ts", "notify(\"Önce en az bir ayet seçin\")", "notify(ttX2610(\"sbOnceAyetSec\"))"],
  ["src/studio/useStudioCekirdek.ts", "notify(`⚠️ ${modeLabel} süresi seçili ayetlere yetmiyor · ayet yarım kalmasın diye yaklaşık ilk ${fitCount} ayet alınır, sonrası bırakılır`)", "notify(ttX2610(\"scSureYetmiyor\").replace(\"{m}\", String(modeLabel)).replace(\"{n}\", String(fitCount)))"],
  ["src/studio/useStudioPicker.ts", "notify(`✨ Taslak yükleniyor: ${oneri.baslik}`)", "notify(ttX2610(\"spTaslak\").replace(\"{x}\", String(oneri.baslik)))"],
  ["src/studio/useStudioPicker.ts", "notify(`Atmosfer seçildi: ${clip.label}`)", "notify(ttX2610(\"spSecildi\").replace(\"{x}\", String(clip.label)))"],
  ["src/studio/useStudioPicker.ts", "notify(\"🎁 Misafir deneme hakkın doldu · Google ile 3 saniyede ücretsiz üye ol, +5 üretim hakkı kazan\")", "notify(ttX2610(\"spMisafirDoldu\"))"],
  ["src/studio/useStudioPicker.ts", "notify(`👋 Misafir modundasın · ${left} deneme videosu hakkın var · indirmek için üyelik gerekir`)", "notify(ttX2610(\"spMisafirModu\").replace(\"{x}\", String(left)))"],
  ["src/studio/useTier.ts", "notify(`⚠️ ${featureLabel} açıldı ama hakkın düşülemedi — sayfayı yenile`)", "notify(ttX2610(\"utAcildiSorun\").replace(\"{x}\", String(featureLabel)))"],
  ["src/studio/useTier.ts", "notify(`🔓 ${featureLabel} 24 saatliğine açıldı · −${JETON.MIKRO_KILIT_ACMA_UCRETI} jeton`)", "notify(ttX2610(\"utAcildiJeton\").replace(\"{x}\", String(featureLabel)).replace(\"{c}\", String(JETON.MIKRO_KILIT_ACMA_UCRETI)))"],
  ["src/studio/useTier.ts", "notify(`${featureLabel} için ${JETON.MIKRO_KILIT_ACMA_UCRETI} jeton gerekiyor · mevcut: ${jetonCount}`)", "notify(ttX2610(\"utJetonGerekli\").replace(\"{x}\", String(featureLabel)).replace(\"{c}\", String(JETON.MIKRO_KILIT_ACMA_UCRETI)).replace(\"{n}\", String(jetonCount)))"],
  ["src/studio/useTier.ts", "notify(\"⚠️ Tam Sürüm açıldı ama hakkın düşülemedi — sayfayı yenile\")", "notify(ttX2610(\"utTamAcildiSorun\"))"],
  ["src/studio/useTier.ts", "notify(`✅ Tam Sürüm modu 24 saatliğine açıldı · −${JETON.MIKRO_KILIT_ACMA_UCRETI} jeton`)", "notify(ttX2610(\"utTamAcildiJeton\").replace(\"{c}\", String(JETON.MIKRO_KILIT_ACMA_UCRETI)))"],
  ["src/studio/useTier.ts", "notify(`⚠️ Tam Sürüm modunu açmak için ${JETON.MIKRO_KILIT_ACMA_UCRETI} jeton gerekiyor · mevcut: ${jetonCount}`)", "notify(ttX2610(\"utTamGerekli\").replace(\"{c}\", String(JETON.MIKRO_KILIT_ACMA_UCRETI)).replace(\"{n}\", String(jetonCount)))"],
  ["src/studio/useVideoGenerator.ts", "notify(`⏳ Deneme videoları arasında kısa bir mola var · ${misafirGate.retryAfterSec} sn sonra tekrar dene`)", "notify(ttX2610(\"vgMola\").replace(\"{x}\", String(misafirGate.retryAfterSec)))"],
  ["src/studio/useVideoGenerator.ts", "notify(\"🌙 Bugünkü deneme hakkın doldu · yarın tekrar gelirsin ya da hemen ücretsiz üye olabilirsin\")", "notify(ttX2610(\"vgBugunDoldu\"))"],
  ["src/studio/useVideoGenerator.ts", "notify(\"🎁 Ücretsiz deneme hakkın bitti · Google ile 3 saniyede üye ol, +5 üretim hakkı kazan\")", "notify(ttX2610(\"vgTrialBirlestirme\"))"],
  ["src/studio/useVideoGenerator.ts", "(${Math.ceil(rl.retryAfterMs / 1000)} sn kaldı)", " ${ttX2610(\"umSnKaldi\").replace(\"{n}\", String(Math.ceil(rl.retryAfterMs / 1000)))}"],
  ["src/studio/useVideoGenerator.ts", "notify(\"Önce en az bir ayet seçin\")", "notify(ttX2610(\"sbOnceAyetSec\"))"],
  ["src/studio/useVideoGenerator.ts", "notify(\"Tarayıcınız video üretimini desteklemiyor\")", "notify(ttX2610(\"vgTarayiciDestekmiyor\"))"],
  ["src/studio/useVideoGenerator.ts", "notify(\"⚠️ Bu tarayıcı canvas kaydını desteklemiyor · Chrome, Edge veya güncel Safari kullanın\")", "notify(ttX2610(\"vgCanvasDestekmiyor\"))"],
  ["src/studio/useVideoGenerator.ts", "notify(`⚠️ ${reciter.name} hocanın sesi yalnızca tüm surede uygulanabilir · lütfen \"Tüm Sure\" butonuyla ekleyin`)", "notify(ttX2610(\"vgSesSure\").replace(\"{x}\", String(reciter.name)))"],
  ["src/studio/useVideoGenerator.ts", "notify(\"Üretim iptal edildi · jeton düşmedi\")", "notify(ttX2610(\"vgIptal\"))"],
  ["src/studio/useVideoGenerator.ts", "notify(`🎁 Lansman denemesi: ${data.packLeft}/${DENEME_TOPLAM} üretim hakkı kaldı`)", "notify(ttX2610(\"vgLansman\").replace(\"{n}\", String(data.packLeft)).replace(\"{t}\", String(DENEME_TOPLAM)))"],
  ["src/studio/useVideoGenerator.ts", "notify(\"Üretim yetkisi için sunucuya ulaşılamadı\")", "notify(ttX2610(\"vgYetkiSunucu\"))"],
  ["src/studio/useVideoGenerator.ts", "notify(`⚠️ Kendi sesin ${kendi.sure}. suresine ait — seçili ayetlerle uyuşmuyor, hocanın sesiyle üretiliyor`)", "notify(ttX2610(\"vgSesSurahUyusmazlik\").replace(\"{x}\", String(kendi.sure)))"],
  ["src/studio/useVideoGenerator.ts", "notify(`🎙️ Video kendi sesinle üretiliyor · ${usedItems.length} ayet`)", "notify(ttX2610(\"vgKendiSesUretim\").replace(\"{n}\", String(usedItems.length)))"],
  ["src/studio/useVideoGenerator.ts", "notify(`⚠️ ${dustu} ayet kendi sesinle eşleşmedi — o ayetler eklenmedi`)", "notify(ttX2610(\"vgSesEslesmedi\").replace(\"{x}\", String(dustu)))"],
  ["src/studio/useVideoGenerator.ts", "notify(\"⚠️ Kendi sesin çözümlenemedi — hocanın sesiyle devam ediliyor\")", "notify(ttX2610(\"vgSesCozumHatasi\"))"],
  ["src/studio/useVideoGenerator.ts", "notify(`⚠️ ${modeLabel} süresi aşıldı · son ${dropped} ayet eklenmedi · ${usedItems.length} ayet ile üretiliyor`)", "notify(ttX2610(\"vgSureAsildi\").replace(\"{m}\", String(modeLabel)).replace(\"{d}\", String(dropped)).replace(\"{n}\", String(usedItems.length)))"],
  ["src/studio/useVideoGenerator.ts", "notify(\"↩️ Teknik hata nedeniyle üretim hakkınız iade edildi\")", "notify(ttX2610(\"vgIade\"))"],
  ["src/studio/useVideoGenerator.ts", "notify(\"⚠️ Teknik hata sonrası hak iadesi tamamlanamadı — destek ile iletişime geçin\")", "notify(ttX2610(\"vgIadeHatasi\"))"],
  ["src/studio/useVideoTasarimAyarlar.ts", "notify(`📶 İnternet bağlantısı yok — \"${font.label}\" fontu yüklenemedi, Amiri kullanılacak`)", "notify(ttX2610(\"vtInternetYok\").replace(\"{x}\", String(font.label)))"],
  ["src/studio/useVideoTasarimAyarlar.ts", "notify(`⚠️ \"${font.label}\" fontu yüklenemedi — Amiri kullanılacak (internet bağlantını kontrol et)`)", "notify(ttX2610(\"vtFontKontrol\").replace(\"{x}\", String(font.label)))"],
  ["src/studio/useVideoTasarimAyarlar.ts", "notify(`⚠️ \"${font.label}\" fontu yüklenemedi — Amiri kullanılacak`)", "notify(ttX2610(\"vtFontHata\").replace(\"{x}\", String(font.label)))"],
  ["src/studio/useWallet.ts", "notify(\"⚠️ Sistem saatiniz gerçek zamanla uyuşmuyor. Özel gün bonusu askıya alındı.\")", "notify(ttX2610(\"uwSaatUyusmuyor\"))"],
  ["src/studio/useWallet.ts", "notify(`🕌 Cuma bonusu: +${friday} jeton (tavan dışı)`)", "notify(ttX2610(\"uwCuma\").replace(\"{x}\", String(friday)))"],
  ["src/studio/useWallet.ts", "notify(`✨ Kadir Gecesi bonusu: +${kadirBonus} jeton (tavan dışı)`)", "notify(ttX2610(\"uwKadir\").replace(\"{x}\", String(kadirBonus)))"],
  ["src/components/studioAppBolumler.tsx", "SİSTEM AKTİF RENDER MODUNDA\n", "{ttX2610(\"rsSistemModu\")}\n"],
  ["src/components/studioAppBolumler.tsx", "Üretimi İptal Et\n", "{ttX2610(\"rsIptalBtn\")}\n"],
  ["src/components/studioAppBolumler.tsx", "İptal ettiğinizde üretim hakkı (jeton) hesabınızdan düşmez.\n", "{ttX2610(\"rsIptalNot\")}\n"],
];

let ok = 0, hata = 0;
const dosyalar = new Set();
for (const [p, bul, yeniStr] of ISLEMLER) {
  let metin = fs.readFileSync(p, "utf8");
  if (!metin.includes(bul)) { console.log("!! BULUNAMADI", p, "→", bul.slice(0, 60)); hata++; continue; }
  metin = metin.split(bul).join(yeniStr);
  metin = kospruEkle(p, metin);
  fs.writeFileSync(p, metin);
  dosyalar.add(p);
  ok++;
}
console.log(`BAĞLAMA: ${ok} değişim · ${hata} bulunamadı · ${dosyalar.size} dosya`);
