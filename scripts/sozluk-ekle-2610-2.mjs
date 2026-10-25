// ════════════════════════════════════════════════════════════════════
// SOZLUK-EKLE-2610-2.MJS — İkinci i18n serisi: islamicTools takip/bölüm/
//   bildirim/istatistik parçalarının tüm görünür metinleri (26.10).
//   Kural: TR yalnız eksik eklenir; diğer dillerde eksik VEYA birebir
//   Türkçe kalmışsa (çevrilmemiş kalıntı) çevirisi yazılır.
// ════════════════════════════════════════════════════════════════════
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "i18n");
const DILECE = ["tr", "en", "ar", "id", "ur"];

// [anahtar, tr, en, ar, id, ur]
const KELIME = [
  // ★ Dua/Ezkâr takibi (islamicToolsTakip.tsx)
  ["itEzkarTakipBugun", "Ezkâr Takibi — bugün", "Adhkar Check-in — today", "تحديث الأذكار — اليوم", "Cek Adhkar — hari ini", "اذکار چیک اِن — آج"],
  ["itSabahEzkari", "Sabah Ezkârı", "Morning Adhkar", "أذكار الصباح", "Zikir Pagi", "صبح کے اذکار"],
  ["itAksamEzkari", "Akşam Ezkârı", "Evening Adhkar", "أذكار المساء", "Zikir Petang", "شام کے اذکار"],
  ["itIsaretleKayit", "Okuduktan sonra işaretle — kayıtlar cihazında kalır, seri alışkanlık kazan.", "Mark after reading — records stay on your device; build a streak habit.", "بعد القراءة عليك علامة — تُحفظ السجلات في جهازك، وابنِ عادة متواصلة.", "Tandai setelah membaca — catatan tetap di perangkatmu; bangun kebiasaan beruntun.", "پڑھ لینے کے بعد نشان لگائیں — ریکارڈ آپ کے ڈیوائس پر رہتے ہیں، مسلسل عادت بنائیں۔"],
  ["itBugunVakitleri", "Bugünün Vakitleri", "Today's Prayers", "صلوات اليوم", "Salat Hari Ini", "آج کی نمازیں"],
  ["itGunSeri", "gün seri", "day streak", "يومًا متتاليًا", "hari beruntun", "دن مسلسل"],
  ["itSalahCap", "Bugün {n}/5 vakit işaretli · kayıtlar cihazında kalır", "Today {n}/5 marked · records stay on your device", "اليوم {n}/5 علامة · السجلات في جهازك", "Hari ini {n}/5 ditandai · catatan tetap di perangkat", "آج {n}/5 نشان لگی · ریکارڈ ڈیوائس پر رہتے ہیں"],
  // ★ Toplu hatim (islamicToolsTakip.tsx)
  ["itTopluHatim", "Bu Ay Toplu Hatim", "This Month's Group Khatam", "ختمة جماعية هذا الشهر", "Khatam Grup Bulan Ini", "اس ماہ کی اجتماعی ختم"],
  ["itHatimKatil", "Bu ayın toplu hatim kampanyasına katıl — bir cüz al, toplam hatim hedefine sen de katkı ver.", "Join this month's group Qur'an-completion drive — take one section and add to the shared goal.", "شارك في ختمة هذا الشهر الجماعية — خذ قسمًا وأضِف إلى الهدف المشترك.", "Ikuti kampanye khatam bersama bulan ini — ambil satu juz dan tambahkan kontribusimu.", "اس مہینے کی اجتماعی ختم مہم میں شامل ہوں — ایک پارہ لیں اور مشترکہ ہدف میں اپنی حصہ ڈالیں۔"],
  ["itSeninCuzler", "Senin cüzlerin:", "Your sections:", "أقسامك:", "Juzmu:", "آپ کے پارے:"],
  ["itToplamKatki", "Toplam katkı:", "Total contribution:", "إجمالي المساهمة:", "Total kontribusi:", "کلی حصہ:"],
  ["itCuzWord", "cüz", "section", "قسم", "juz", "پارہ"],
  ["itTamam", "tamam", "complete", "مكتمل", "selesai", "مکمل"],
  ["itCuzAl", "Cüz Al", "Take a Section", "خذ قسمًا", "Ambil Juz", "پارہ لیں"],
  ["itHatimHalka", "Sen de bu ayın hatim halkasındasın — Allah kabul etsin!", "You too are in this month's completion ring — may it be accepted!", "وأنت أيضًا في حلقة الختمة هذا الشهر — تقبّل الله!", "Kau pun berada dalam lingkaran khatam bulan ini — semoga Allah menerimanya!", "آپ بھی اس ماہ کے ختم کے حلقے میں ہیں — اللہ قبول کرے!"],
  // ★ Hatim takibi (islamicToolsTakip.tsx)
  ["itKuranIlerlemen", "Kur'an İlerlemen", "Your Qur'an Progress", "تقدمك في القرآن", "Kemajuan Al-Qur'anmu", "آپ کی قرآنی پیش رفت"],
  ["itSurelerOkundu", "{n} / 114 sure okundu", "{n} / 114 surahs read", "{n} / 114 سورة مقروءة", "{n} / 114 surah dibaca", "{n} / 114 سورے پڑھ لی گئیں"],
  ["itHatimTamam", "Hatim tamam!", "Khatam complete!", "الختمة مكتملة!", "Khatam selesai!", "ختم مکمل!"],
  ["itIsarett", "işaretli", "marked", "مُعلَّم", "ditandai", "نشان زدہ"],
  ["itTamamlandi", "tamamlandı", "completed", "اكتمل", "selesai", "مکمل ہوا"],
  ["itCuzDurumu", "30 cüz · {n} cüz tamamlandı", "30 sections · {n} completed", "٣٠ قسمًا · اكتمل {n}", "30 juz · {n} selesai", "۳۰ پارے · {n} مکمل"],
  ["itHafizlikIst", "Hafızlık İstatistiği", "Memorization Stats", "إحصاءات الحفظ", "Statistik Hafalan", "حفظ کی معلومات"],
  ["itEnBuyukIsler", "En büyük işler (işaretlediklerin): ", "Biggest jobs (marked ones): ", "أكبر المهام (المعلَّمة): ", "Pekerjaan terbesar (yang ditandai): ", "سب سے بڑے کام (نشان زدہ): "],
  ["itHizliKazanim", "Hızlı kazanım (kısa sureler): ", "Quick wins (short surahs): ", "مكاسب سريعة (السور القصيرة): ", "Kemenangan cepat (surah pendek): ", "فوری کامیابی (مختصر سورتیں): "],
  ["itToplamSureler", "Toplam {n} sure işaretli · kalan {k} sure", "{n} marked in total · {k} left", "إجمالي {n} سورة معلَّمة · تبقّى {k}", "Total {n} surah ditandai · sisa {k}", "کل {n} سورے نشان زدہ · باقی {k}"],
  ["itSureAra", "Sure ara...", "Search surah…", "ابحث عن سورة…", "Cari surah…", "سورہ تلاش کریں…"],
  ["itAyetK", "ayet", "verses", "آية", "ayat", "آیات"],
  ["itIsaretlerSaklanir", "İşaretler cihazında saklanır · V2'de hesabıyla senkronize olur", "Marks are kept on your device · synced with your account in V2", "تُحفظ العلامات في جهازك · تتم مزامنتها مع حسابك في الإصدار الثاني", "Tanda disimpan di perangkatmu · disinkronkan dengan akunmu di v2", "نشانے ڈیوائس پر محفوظ رہتے ہیں · وی 2 میں اکاؤنٹ سے همگام ہوں گے"],
  // ★ Kıble pusulası + kaza + takvim (islamicToolsBolumler.tsx)
  ["itPusulaIzin", "Pusula izni verilmedi", "Compass permission not granted", "لم يُستمنح إذن البوصلة", "Izin kompas tidak diberikan", "قطب نما کی اجازت نہیں ملی"],
  ["itPusulaYok", "Cihazınız pusula desteklemiyor", "Your device doesn't support the compass", "جهازك لا يدعم البوصلة", "Perangkatmu tidak mendukung kompas", "آپ کا ڈیوائس قطب نما سپورٹ نہیں کرتا"],
  ["itKabe", "KÂBE", "KAABA", " الكعبة", "KAABAH", "کعبہ"],
  ["pusulaKuzey", "K", "N", "ش", "U", "شمال"],
  ["pusulaGuney", "G", "S", "ج", "S", "جنوب"],
  ["pusulaBati", "B", "W", "غ", "B", "مغرب"],
  ["pusulaDoyu", "D", "E", "ق", "T", "مشرق"],
  ["itCihazDuz", "Cihazınızı düz tutun · Kıble yönü altın ok ile gösterilir", "Hold your device flat · the golden arrow shows the qibla", "امسك جهازك مستويًا · السهم الذهبي يُظهر القبلة", "Pegang perangkat datar · panah emas menunjukkan arah kiblat", "ڈیوائس کو سیدھا رکھیں · سنہری تیر قبلہ دکھاتا ہے"],
  ["itKiblasi", "kıblası:", "qibla:", "قبلة:", "kiblatnya:", "قبلہ:"],
  ["itKazaUst", "Kıldığınız her kaza namazını işaretleyin · Allah kabul etsin", "Mark every prayer you make up · may they be accepted", "أسّ كل صلاة تعويضية تقضيها · تقبّل الله", "Tandai setiap salat qadha yang Anda lakukan · semoga Allah menerimanya", "آپ کی ہر قضا نماز کو نشان لگائیں · اللہ قبول کرے"],
  ["ayOcak", "Ocak", "January", "يناير", "Januari", "جنوری"],
  ["aySubat", "Şubat", "February", "فبراير", "Februari", "فروری"],
  ["ayMart", "Mart", "March", "مارس", "Maret", "مارچ"],
  ["ayNisan", "Nisan", "April", "أبريل", "April", "اپریل"],
  ["ayMayıs", "Mayıs", "May", "مايو", "Mei", "مئی"],
  ["ayHaziran", "Haziran", "June", "يونيو", "Juni", "جون"],
  ["ayTemmuz", "Temmuz", "July", "يوليو", "Juli", "جولائی"],
  ["ayAğustos", "Ağustos", "August", "أغسطس", "Agustus", "اگست"],
  ["ayEylül", "Eylül", "September", "سبتمبر", "September", "ستمبر"],
  ["ayEkim", "Ekim", "October", "أكتوبر", "Oktober", "اکتوبر"],
  ["ayKasım", "Kasım", "November", "نوفمبر", "November", "نومبر"],
  ["ayAralık", "Aralık", "December", "ديسمبر", "Desember", "دسمبر"],
  ["itKazaToplam", "Toplam kaza:", "Total made up:", "إجمالي القضاء:", "Total qadha:", "کلی قضا:"],
  ["itRekat", "rekât", "rakʿahs", "رکعات", "rakaat", "رکعات"],
  ["diniRamazanBayrami", "Ramazan Bayramı", "Eid al-Fitr", "عيد الفطر", "Hari Raya Idulfitri", "عید الفطر"],
  ["diniArefe", "Arefe", "Arafah Day", "يوم عرفة", "Hari Arafah", "یومِ عرفہ"],
  ["diniKurbanBayrami", "Kurban Bayramı", "Eid al-Adha", "عيد الأضحى", "Hari Raya Iduladha", "عید الاضحی"],
  ["diniHicriYilbasi", "Hicri Yılbaşı", "Hijri New Year", "رأس السنة الهجرية", "Tahun Baru Hijriah", "ہجری نئے سال"],
  ["diniAsure", "Aşure Günü", "Day of Ashura", "يوم عاشوراء", "Hari Asyura", "یومِ عاشورہ"],
  ["diniMevlid", "Mevlid Kandili", "Mawlid al-Nabi", "المولد النبوي", "Maulid Nabi", "عید میلاد النبی"],
  ["itYaklasanDini", "Yaklaşan dini günler ve geceler", "Upcoming religious days and nights", "الأيام والليالي المباركة القادمة", "Hari dan malam Islami yang akan datang", "آنے والے مذہبی دن اور راتیں"],
  ["itGun", "gün", "days", "أيام", "hari", "دن"],
  ["itYaklasanYok", "Yaklaşan dini gün yok — takvim güncellenecek", "No upcoming religious days — the calendar will be updated", "لا أيام دينية قادمة — سيُحدَّث التقويم", "Tidak ada hari Islami yang mendekat — kalender akan diperbarui", "کوئی قریبی مذہبی دن نہیں — کیلنڈر اپ ڈیٹ ہوگا"],
  // ★ Okuyucu modu + Öğüt Vakti + Namaz bildirimi (islamicToolsBildirim.tsx)
  ["itOkuyucuModu", "Okuyucu Modu", "Reader Mode", "وضع القراءة", "Mode Pembaca", "قاری موڈ"],
  ["itOkuyucuAcik", "Açık — kehribar ton, göz yormaz", "On — warm amber tone, easy on the eyes", "مفعِّل — نبرة عنبرية دافئة لا تُجهد العين", "Nyala — nada kuning hangat, mata nyaman", "بند آن — روشن سبزہ رنگ، آنکھ خَراش نافذ"],
  ["itOkuyucuKapali", "Uykudan önce okuma için sıcak ton", "Warm tone for reading before sleep", "نبرة دافئة للقراءة قبل النوم", "Nada hangat untuk membaca sebelum tidur", "سونے سے پہلے پڑھنے کے لیے روشن رنگ"],
  ["itAcik", "Açık", "On", "مفعِّل", "Nyala", "آن"],
  ["itKapali", "Kapalı", "Off", "معطَّل", "Mati", "آف"],
  ["itBildirimKapandi", "Bildirimler kapatıldı", "Notifications turned off", "أُيقفت الإشعارات", "Notifikasi dimatikan", "اطلاعات بند کر دی گئیں"],
  ["itOgutAcik", "Açık — günde 4 kısa hadis gelecek 🌙", "On — 4 short hadiths daily 🌙", "مفعِّل — ٤ أحاديث قصيرة يوميًا 🌙", "Nyala — 4 hadits pendek setiap hari 🌙", "آن — روزانہ 4 مختصر احادیث 🌙"],
  ["itOgutHosGeldin", "🌱 Hoş geldin — Öğüt Vakti açıldı", "🌱 Welcome — Warnings Time is on", "🌱 أهلاً بك — موسم النصيحة يعمل", "🌱 Selamat datang — Pengetahuan Dua Kursus sudah diaktifkan", "🌱 خوش آمدید — نصیحت واقت آن ہو گئی"],
  ["itOgutHosBody", "Günde 4 kısa sahih hadis hatırlatması alacaksın.", "You'll get 4 short authentic hadith reminders daily.", "ستتلقى ٤ تذكيرات يومية بأحاديث صحيحة قصيرة.", "Anda akan menerima 4 pengingat hadits shahih pendek setiap hari.", "آپ کو روزانہ 4 مختصر صحیحد ہادی یاد دہانی ملیں گے۔"],
  ["itAbonelikKurulamadi", "Abonelik kurulamadı", "Subscription couldn't be set up", "تعذّر إنشاء الاشتراك", "Langganan gagal dibuat", "سبسکرپشن قائم نہ ہو سکی"],
  ["itOgutVakti", "Öğüt Vakti 🌙", "Daily Guidance 🌙", "موسم النصيحة 🌙", "Waktu Petunjuk 🌙", "نصیحت واقت 🌙"],
  ["itOgutIos", "iPhone: önce \"Ana Ekrana Ekle\" gerekli", "iPhone: add to Home Screen first", "آيفون: أضِف إلى الشاشة الرئيسية أولاً", "iPhone: tambahkan ke Layar Utama dulu", "آئی فون: پہلے ہوم اسکرین پر شامل کریں"],
  ["itOgutAktif", "Günde 4 sahih hadis · sekme kapalıyken de gelir", "4 authentic hadiths daily · even with the tab closed", "٤ أحاديث صحيحة يوميًا · حتى مع إغلاق التبويب", "4 hadits shahih setiap hari · tetap masuk meski tab tertutup", "روزانہ 4 صحیح حدیث · ٹیب بند ہو تو بھی آتی ہیں"],
  ["itOgutKapali", "Günde 4 kısa sahih hadis bildirimi", "4 short authentic hadith notifications daily", "٤ إشعارات يومية بأحاديث صحيحة قصيرة", "4 notifikasi hadits shahih pendek per hari", "روزانہ 4 مختصر صحیح حدیث اطلاعات"],
  ["itAcikEtiket", "✓ Açık", "✓ On", "✓ مفعِّل", "✓ Nyala", "✓ آن"],
  ["itAcEtiket", "Aç", "Turn on", "تشغيل", "Nyalakan", "آن کریں"],
  ["itNamazHatirlaticAcildi", "🕌 Namaz vakti hatırlatıcısı açıldı", "🕌 Prayer time reminder on", "🕌 مُفعِّل تذكير مواعيد الصلاة", "🕌 Pengingat waktu salat aktif", "🕌 نماز وقت یاد دہانی آن ہو گئی"],
  ["itNamazHatirlaticBody", "Vakit girdiğinde nazik bir hatırlatma alacaksın.", "You'll get a gentle reminder when prayer time begins.", "ستتلقى تذكيرًا لطيفًا بدخول المواقيت.", "Anda akan menerima pengingat lembut saat waktu masuk.", "وقت داخل ہو تو آپ کو ایک نرم یاد دہانی ملے گی۔"],
  ["itNamazHatirlatic", "Namaz Vakti Hatırlatıcısı", "Prayer Time Reminder", "تذكير مواعيد الصلاة", "Pengingat Waktu Salat", "نماز وقت یاد دہانی"],
  ["itNamazIzinOk", "Vakit girince tarayıcı bildirimi gelir", "Browser notification when prayer time starts", "إشعار المتصفح عند دخول المواقيت", "Notifikasi peramban saat waktu salat masuk", "وقت شروع ہو تو براؤزر اطلاع آئے گی"],
  ["itIzinGerek", "Bildirim izni gerekiyor", "Notification permission needed", "يلزم إذن الإشعارات", "Izin notifikasi diperlukan", "اطلاعات کی اجازت ضروری"],
  ["itVaktiGirdi", "vakti girdi", "prayer time has begun", "دخل وقت", "waktu salat telah masuk", "وقت شروع ہو گیا"],
  ["itNamazVaktiBody", "Namaz vakti — huzur seni bekliyor.", "It's prayer time — peace awaits you.", "حان وقت الصلاة — الطمأنينة بانتظارك.", "Waktunya salat — ketenangan menanti Anda.", "نماز کا وقت — تسکین آپ کا انتظار کر رہی ہے۔"],
  // ★ İstatistik + rozet + üretici (islamicToolsIstatistik.tsx)
  ["itCevrimdisiTilavet", "Çevrimdışı Tilavet", "Offline Recitation", "التلاوة دون اتصال", "Tilawat Luring", "آف لائن تلاوت"],
  ["itSimdiCevrimdisisun", "📡 Şu an çevrimdışısın — dinlediğin ayetler çalışır", "📡 You're offline now — saved verses still play", "📡 أنت دون اتصال — الآيات المحفوظة تعمل", "📡 Anda sedang luring — ayat tersimpan tetap diputar", "📡 آپ ابھی آف لائن ہیں — محفوظ آیات چلتے ہیں"],
  ["itSesSayiliyor", "Cihazda saklanan ayet sesi sayılıyor…", "Counting verse audio saved on device…", "جارٍ عدّ الأصوات المحفوظة…", "Menghitung audio ayat tersimpan…", "ڈیوائس پر محفوظ آیت آوازیں گنی جا رہی ہیں…"],
  ["itOtomatikKayit", "Dinlediğin ayetler otomatik cihaza kaydedilir", "Verses you listen to are cached automatically", "تُخزَّن الآيات التي تسمعها تلقائيًا", "Ayat yang Anda dengar disimpan otomatis", "آپ جو آیتیں سنتے ہیں وہ خود بخود محفوظ ہوتی ہیں"],
  ["itAyetSesiHazir", "ayet sesi cihazda — internetsiz çalar", "verse audios on device — play without internet", "أصوات آيات في الجهاز — تعمل دون إنترنت", "audio ayat di perangkat — mainkan tanpa internet", "آیت آوازیں ڈیوائس پر — بغیر انٹرنیٹ چلیں گی"],
  ["itCevrimdisiEtiket", "Çevrimdışı", "Offline", "دون اتصال", "Luring", "آف لائن"],
  ["itHazirEtiket", "Hazır", "Ready", "جاهز", "Siap", "تیار"],
  ["itRozetlerIni", "Başarım Rozetlerin", "Your Achievement Badges", "شاراتك المتحقَّقة", "Lencana Pencapaianmu", "آپ کی کامیابی کے بیج"],
  ["itRozetSerisi", "Rozet serisi {n} kez tamamlandı — her turda hediyeler büyüdü, eşikler zorlaştı", "Badge series completed {n} times — each round gifts grew, thresholds hardened", "اكتملت سلسلة الشارات {n} مرة — في كل جولة زادت الهدايا وصعُبت الحدود", "Seri lencana selesai {n} kali — setiap ronde hadiah membesar, ambang makin keras", "بیج سیریز {n} بار مکمل — ہر دور میں تحفے بڑے، حد سختی ہو گئی"],
  ["itYeniRozet", "Yeni rozet:", "New badge:", "شارة جديدة:", "Lencana baru:", "نیا بیج:"],
  ["itBuTurda", "bu turda:", "this round:", "هذه الجولة:", "ronde ini:", "اس دور میں:"],
  ["itKazanildiXS", "{n}× kazanıldı", "won {n}×", "حُصل عليها {n} مرة", "diperoleh {n}×", "{n} بار جیتا"],
  ["itKalanXS", "kalan: {n}", "left: {n}", "تبقّى: {n}", "sisa: {n}", "باقی: {n}"],
  ["itKazanildiYenis", "{n} kez kazanıldı", "won {n} times", "حُصل عليها {n} مرة", "diperoleh {n} kali", "{n} بار جیتا"],
  ["itTurNo", "🔄 {n}. tur — eşikler zorlaştı", "🔄 Round {n} — thresholds hardened", "🔄 الجولة {n} — صعُبت الحدود", "🔄 Ronde {n} — ambang mengeras", "🔄 دور {n} — حد بڑھ گیا"],
  ["itBitinceOdul", "hepsi bitince +{h} hak", "when all done +{h} rights", "وعند اكتمالها +{h} حقوق", "ketika semua selesai +{h} hak", "سب مکمل ہونے پر +{h} حقوق"],
  ["itRozetOdulOnay", "Hepsini kazan →", "Win them all →", "اكسبها كلها →", "Menangkan semuanya →", "سب جیت لیں →"],
  ["itUretimHakki", "üretim hakkı", "production right", "حق الإنتاج", "hak produksi", "پیداواری حق"],
  ["itSonraZorlasir", " sonra eşikler zorlaşır, ödül büyür", " then thresholds harden, reward grows", " ثم صعُبت الحدود وازدة المكافأة", " lalu ambang mengeras, hadiah membesar", " پھر حد سخت ہوئی، انعام بڑھا"],
  ["itSonOdul", "Son ödül: +{n} hak ({d})", "Last reward: +{n} rights ({d})", "آخر مكافأة: +{n} حقوق ({d})", "Hadiah terakhir: +{n} hak ({d})", "آخری انعام: +{n} حقوق ({d})"],
  ["itRozetAltYildiz", "rozet altındaki ★ = kaç kez kazanıldı", "the ★ under a badge = how many times it was won", "النجمة تحت الشارة = كم مرة ربحت", "★ di bawah lencana = berapa kali dimenangkan", "بیج کے نیچے ★ = کتنی بار جیتا"],
  ["itRozetCihazDipnot", "Rozetler cihazında saklanır — zikir, hatim, üretim ve testlerle açılır", "Badges are stored on your device — unlocked by dhikr, khatam, production and tests", "تُحفظ الشارات في جهازك — تُفتح بالذكِر والختمة والإنتاج والاختبارات", "Lencana disimpan di perangkatmu — terbuka lewat zikir, khatam, produksi dan ujian", "بیج ڈیوائس پر محفوظ — ذکر، ختم، پیداوار اور آزمائشوں سے کھلتے ہیں"],
  ["itUreticiIst", "Üretici İstatistiklerin", "Your Maker Stats", "إحصاءات التصنيع", "Statistik Produsenmu", "آپ کی ساخت کی معلومات"],
  ["itUreticiBos", "Henüz video üretmedin — ilk üretiminle grafik başlar! Yalnızca bu cihazda sayılır, sunucuya gönderilmez.", "No videos made yet — the chart starts with your first make! Counted only on this device, never sent to the server.", "لم تُنتج فيديوهات بعد — يبدأ الرسم مع أول إنتاج لك! يُحتسب في جهازك فقط ولا يُرسل إلى الخادم.", "Belum ada video dibuat — grafik mulai dari buatan pertamamu! Dihitung di perangkat ini saja, tidak dikirim ke server.", "ابھی کوئی ویڈیو نہیں بنی — پہلی ساخت کے ساتھ چارٹ شروع ہو! صرف اس ڈیوائس پر گنا جاتا ہے، سرور کو نہیں جاتا۔"],
  ["itToplamK", "Toplam", "Total", "الإجمالي", "Total", "کُل"],
  ["itKisaK", "Kısa", "Short", "قصير", "Pendek", "مختصر"],
  ["itUzunK", "Uzun", "Long", "طويل", "Panjang", "لمبا"],
  ["itTamK", "Tam", "Full", "كامل", "Penuh", "مکمل"],
  ["itUretimGun", "{g} gündür üretiyorsun · ortalama {o} video/gün", "Making for {g} days · avg {o} videos/day", "تصنع منذ {g} يومًا · بمعدل {o} فيديو/يوم", "Membuat selama {g} hari · rata-rata {o} video/hari", "{g} دن سے جسم رچ رہے ہیں · اوسط {o} ویڈیو/دن"],
  ["itYalnizCihaz", "yalnızca bu cihazda sayılır", "counted only on this device", "يُحتسب في هذا الجهاز فقط", "dihitung hanya di perangkat ini", "صرف اس ڈیوائس پر گنا جاتا ہے"],
];

const okuYaz = (kod) => join(DIR, `dicts.${kod}.json`);

const sozlukler = Object.fromEntries(DILECE.map((kod) => [kod, JSON.parse(readFileSync(okuYaz(kod), "utf8"))]));
const tr = sozlukler.tr;

let eklenen = 0, ezilen = 0;

for (const [anahtar, trDeger, enDeger, arDeger, idDeger, urDeger] of KELIME) {
  const degerler = { tr: trDeger, en: enDeger, ar: arDeger, id: idDeger, ur: urDeger };
  for (const kod of DILECE) {
    const dict = sozlukler[kod];
    if (!(anahtar in dict)) { dict[anahtar] = degerler[kod]; eklenen++; continue; }
    if (kod !== "tr" && dict[anahtar] === trDeger) { dict[anahtar] = degerler[kod]; ezilen++; }
  }
}

for (const kod of DILECE) writeFileSync(okuYaz(kod), JSON.stringify(sozlukler[kod], null, 2) + "\n", "utf8");

// ═══ Парите senkron: yeni anahtarların 5 dilde de bulunması zorunlu ═══
const eksik = [];
for (const [anahtar] of KELIME) for (const kod of DILECE) if (!(anahtar in sozlukler[kod])) eksik.push(`${kod}.${anahtar}`);
if (eksik.length) { console.error("❌ PARİTE BOZUL:", eksik); process.exit(1); }

// Çince/CJK kiri tarayıcı
const CJK = /[\u4E00-\u9FFF\u3040-\u30FF]/;
const kir = [];
for (const kod of DILECE) for (const [k, v] of Object.entries(sozlukler[kod])) if (CJK.test(v)) kir.push(`${kod}.${k}=${v}`);
if (kir.length) console.warn("⚠️ CJK kiri hâlâ var:", kir);

console.log(`✓ Seri 2 işlendi: ${KELIME.length} anahtar · eklendi ${eklenen} · ezilen-Türkçe ${ezilen} · parite sağlam`);
