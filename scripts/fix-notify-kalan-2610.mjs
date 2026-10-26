// ════════════════════════════════════════════════════════
// 26.10 E TURU — kalan 47 ham Türkçe notify (admin + kullanıcı yüzü)
// 1) SOZLUK → dicts.{tr,en,ar,id,ur}.json
// 2) ISLEMLER → dosya bazlı literal → ttX2610 bağlama
// ════════════════════════════════════════════════════════
import fs from "node:fs";

const SOZLUK = [
  ["adAdminSunucu","Admin yetkisi için sunucuya ulaşılamadı","Couldn't reach the server for admin authorization","تعذر الوصول إلى الخادم لتخويل المشرف","Tidak bisa menjangkau server untuk izin admin","ایڈمن اجازت کے لیے سرور تک رسائی میسر نہیں"],
  ["abBakimSaat","Bakım bitiş saati başlangıçtan sonra olmalı","Maintenance end time must be after the start","يجب أن يكون وقت انتهاء الصيانة بعد البداية","Waktu selesai pemeliharaan harus setelah mulai","میںٹیننس کا اختتامی وقت شروعات کے بعد ہو"],
  ["abBaslikMesaj","Başlık ve kısa mesaj zorunlu","Title and short message are required","العنوان والرسالة القصيرة مطلوبان","Judul dan pesan singkat wajib","عنوان اور مختصر پیغام ضروری ہے"],
  ["abTekKlikGeriAl","Bu işlem tek tuşla geri alınamaz — kilitleri tek tek ayarla","This action can't be undone in one click — set the locks one by one","لا يمكن التراجع عن هذا بإجراء واحد — اضبط الأقفال واحدًا واحدًا","Tindakan ini tak bisa dibatalkan sekali klik — atur kunci satu per satu","یہ عمل ایک کلک سے واپس نہیں ہو سکتا — کلاسیکن ایک ایک کر کے طے کریں"],
  ["abEskiKayitlar","Eski kayıtlar temizlendi","Old records cleared","سُحّبت السجلات القديمة","Catatan lama dibersihkan","پرانے ریکارڈ صاف کر دیے گئے"],
  ["abGoogleAdmin","Google ile admin hesabınızdan giriş yapın","Please sign in with Google using your admin account","رجاءً سجّل الدخول عبر جوجل بحساب المشرف","Silahkan masuk dengan Google menggunakan akun admin Anda","براہِ کرم گوگل سے اپنے ایڈمن اکاؤنٹ سے لاگ اِن کریں"],
  ["abKonuIcerik","Konu ve içerik gerekli","Subject and content are required","الموضوع والمحتوى مطلوبان","Subjek dan konten wajib","موضوع اور مواد ضروری ہے"],
  ["abGithubToken","Lütfen GitHub Personal Access Token giriniz.","Please enter your GitHub Personal Access Token.","رجاءً أدخل رمز GitHub Personal Access Token.","Silahkan masukkan GitHub Personal Access Token.","براہِ کرم GitHub Personal Access Token درج کریں۔"],
  ["abHedefSec","Lütfen bir hedef seçin","Please pick a target","رجاءً اختر هدفًا","Silahkan pilih target","براہِ کرم ایک ہدف منتخب کریں"],
  ["abModulBaslik","Lütfen modül başlığı giriniz.","Please enter a module title.","رجاءً أدخل عنوان الوحدة.","Silahkan masukkan judul modul.","براہِ کرم ماڈیول کا عنوان درج کریں۔"],
  ["asSunucu","Sunucuya ulaşılamadı","Couldn't reach the server","تعذر الوصول إلى الخادم","Tidak bisa menjangkau server","سرور تک رسائی میسر نہیں"],
  ["abSifirlamaHata","Sıfırlama başarısız","Reset failed","فشل إعادة الضبط","Setel ulang gagal","ری سیٹ ناکام"],
  ["abHataKayitlari","Tüm hata kayıtları silindi","All error logs deleted","سُحّبت كل سجلات الأخطاء","Semua log galat terhapus","تمام ایرر لاگ مٹا دیے گئے"],
  ["udSayfaAcilmadi","Ödeme sayfası açılamadı","Payment page couldn't open","تعذر فتح صفحة الدفع","Halaman pembayaran tak bisa dibuka","پیمنٹ پیج کھلا نہیں"],
  ["udServis","Ödeme servisine ulaşılamadı","Couldn't reach the payment service","تعذر الوصول إلى خدمة الدفع","Tidak bisa menjangkau layanan pembayaran","پیمنٹ سروس تک رسائی میسر نہیں"],
  ["ksOnceAyetSenkron","Önce en az bir ayet seçin — senkron seçtiğin ayetlere kurulur","Select at least one verse first — sync installs on the verses you picked","اختر آية واحدة على الأقل أولًا — يُثبَّت التزامن على الآيات التي اخترت","Pilih minimal satu ayat dulu — sinkron dipasang pada ayat pilihanmu","پہلے کم از کم ایک آیت منتخب کریں — سنک آپ کی منتخب آیات پر لگتا ہے"],
  ["udKullaniciIptal","Üretim kullanıcı tarafından iptal edildi","Rendering was cancelled by the user","أُلغي الإنتاج بواسطة المستخدم","Produksi dibatalkan oleh pengguna","پروڈکشن صارف نے منسوخ کی"],
  ["udSifreSifirlandi","Şifreniz sıfırlandı!","Your password has been reset!","أُعيد تعيين كلمة مرورك!","Kata sandi Anda telah diatur ulang!","آپ کا پاس ورڈ ری سیٹ ہو گیا!"],
  ["udOdemeHazirlaniyor","⏳ Ödeme sayfası hazırlanıyor...","⏳ Preparing the payment page...","⏳ جارٍ تجهيز صفحة الدفع...","⏳ Menyiapkan halaman pembayaran...","⏳ پیمنٹ پیج تیار ہو رہا ہے..."],
  ["abGoogleClientId","⚙️ Google girişi için Client ID tanımlanmalı (.env → VITE_GOOGLE_CLIENT_ID)","⚙️ A Client ID must be defined for Google sign-in (.env → VITE_GOOGLE_CLIENT_ID)","⚙️ يجب تعريف Client ID لتسجيل الدخول عبر جوجل (.env → VITE_GOOGLE_CLIENT_ID)","⚙️ Client ID harus ditentukan untuk masuk Google (.env → VITE_GOOGLE_CLIENT_ID)","⚙️ گوگل لاگ اِن کے لیے Client ID درکار ہے (.env → VITE_GOOGLE_CLIENT_ID)"],
  ["adEmailGir","⚠️ Aramak için bir e-posta adresi gir","⚠️ Enter an email address to search","⚠️ أدخل عنوان بريد للبحث","⚠️ Masukkan alamat email untuk mencari","⚠️ تلاش کے لیے ای میل ایڈریس درج کریں"],
  ["abBitisGecmis","⚠️ Bitiş zamanı geçmiş — site bakıma girmez, ileri bir saat seç","⚠️ End time is in the past — the site won't enter maintenance, pick a later time","⚠️ وقت الانتهاء مضى — لن تدخل الصفحة صيانة، اختر وقتًا لاحقًا","⚠️ Waktu selesai sudah lewat — situs tak masuk pemeliharaan, pilih waktu lebih lanjut","⚠️ اختتامی وقت گزر چکا — سائٹ میںٹیننس میں نہیں جائے گی، آگے کا وقت چنیں"],
  ["ksEskiZamanlama","⚠️ Bu kaydın zamanlamaları eski taramadan kalma ve sesin süresini aşıyor — '🔬 Yeniden analiz et' ile düzelt","⚠️ This record's timings are from an old scan and exceed the audio duration — fix with '🔬 Re-analyze'","⚠️ توقيتات هذا السجل من فحص قديم وتتجاوز مدة الصوت — صحح بخيار '🔬 إعادة التحليل'","⚠️ Waktu rekaman ini dari pemindaian lama dan melebihi durasi audio — perbaiki dengan '🔬 Analisis ulang'","⚠️ اس ریکارڈ کی ٹائمنگ پرانے اسکین سے ہے اور آڈیو کی دوری سے زائد ہے — '🔬 اب بارہ تجزیہ' سے درست کریں"],
  ["adGecerliEmail","⚠️ Geçerli bir e-posta adresi gir","⚠️ Enter a valid email address","⚠️ أدخل عنوان بريد صالحًا","⚠️ Masukkan alamat email yang valid","⚠️ درست ای میل ایڈریس درج کریں"],
  ["abHediye0","⚠️ Hediye miktarı 0'dan büyük olmalı","⚠️ Gift amount must be greater than 0","⚠️ يجب أن تكون قيمة الهدية أكبر من 0","⚠️ Jumlah hadiah harus lebih dari 0","⚠️ تحفیہ کی مقدار 0 سے زیادہ ہونی چاہیے"],
  ["udSunucu","⚠️ Sunucuya ulaşılamadı","⚠️ Couldn't reach the server","⚠️ تعذر الوصول إلى الخادم","⚠️ Tidak bisa menjangkau server","⚠️ سرور تک رسائی میسر نہیں"],
  ["uaPkce","⚠️ Tarayıcınız güvenli Google girişi için gerekli PKCE desteğini sağlamıyor","⚠️ Your browser doesn't support the PKCE required for secure Google sign-in","⚠️ متصفحك لا يدعم PKCE المطلوب للدخول الآمن عبر جوجل","⚠️ Perambanmu tak mendukung PKCE yang diperlukan untuk masuk Google yang aman","⚠️ آپ کا براؤزر محفوظ گوگل لاگ اِن کے لیے PKCE کی حمایت نہیں کرتا"],
  ["adOturumBan","⛔ Kendi oturum hesabınızı banlayamazsınız.","⛔ You can't ban your own session account.","⛔ لا يمكنك حجب حساب جلستك الخاص.","⛔ Anda tak boleh memban akun sesi Anda sendiri.","⛔ آپ اپنا اپنا سیشن اکاؤنٹ بین نہیں کر سکتے۔"],
  ["adKurucuBan","⛔ Kurucu Admin hesabı banlanamaz!","⛔ The Founder Admin account cannot be banned!","⛔ لا يمكن حجب حساب المشرف المؤسس!","⛔ Akun Admin Pendiri tak bisa di-ban!","⛔ بانی ایڈمن اکاؤنٹ بین نہیں کیا جا سکتا!"],
  ["adBanKaldirma","⛔ Sadece Kurucu Admin ban kaldırma yetkisine sahiptir.","⛔ Only the Founder Admin has the authority to lift bans.","⛔ المشرف المؤسس وحده يملك صلاحية رفع الحجب.","⛔ Hanya Admin Pendiri yang punya izin mencabut ban.","⛔ صرف بانی ایڈمن کے پاس بین ہٹانے کا اختیار ہے۔"],
  ["abDuyuruCihaz","✅ Duyuru bu cihazda yayınlandı (Supabase erişimi yok — admin girişi gerekli)","✅ Announcement published on this device (no Supabase access — admin sign-in required)","✅ نُشر الإعلان على هذا الجهاز (لا وصول إلى Supabase — يلزم دخول المشرف)","✅ Pengumuman dipublikasikan di perangkat ini (tak ada akses Supabase — perlu masuk admin)","✅ اعلان اِسی ڈیوائس پر شائع ہوا (Supabase تک رسائی نہیں — ایڈمن لاگ اِن ضروری)"],
  ["abDuyuruYayin","✅ Duyuru tüm kullanıcılara yayınlandı","✅ Announcement published to all users","✅ نُشر الإعلان لجميع المستخدمين","✅ Pengumuman dipublikasikan ke semua pengguna","✅ اعلان تمام صارفین کو شائع کر دیا گیا"],
  ["vpOzelYaziPro","✏️ Özel Yazı PRO üyelere açık — premium sayfası açıldı","✏️ Custom Text is for PRO members — premium page opened","✏️ النص المخصص لمشتركي PRO — فُتحت صفحة المميزات","✏️ Tulisan Khusus untuk member PRO — halaman premium dibuka","✏️ خاص لکھائی PRO ممبرز کے لیے — پیجم صفحہ کھلا"],
  ["akElitOzellik","✨ Akıllı AI ELİT özelliğidir — üyelik sayfasından Elite yüksel","✨ Smart AI is an ELITE feature — upgrade to Elite from the membership page","✨ الذكاء الذكي ميزة للنخبة — انقلم إلى النخبة من صفحة العضوية","✨ AI Pintar fitur ELITE — naik ke Elite dari halaman keanggotaan","✨ اسمارٹ AI ایلیٹ فیچر ہے — ممبرشپ صفحے سے ایلیٹ تک اوپر جائیں"],
  ["abModulDurum","✨ Modül durumu güncellendi!","✨ Module status updated!","✨ حُدّثت حالة الوحدة!","✨ Status modul diperbarui!","✨ ماڈیول کی حالت اپڈیٹ ہو گئی!"],
  ["udHakVerilemedi","❌ Sunucuya ulaşılamadı — hak verilemedi","❌ Couldn't reach the server — credit not granted","❌ تعذر الوصول إلى الخادم — لم تُمنح وحدة","❌ Tidak bisa menjangkau server — kuota tak diberikan","❌ سرور تک رسائی میسر نہیں — کریڈٹ نہیں ملا"],
  ["udHediyeTamamlanamadi","❌ Sunucuya ulaşılamadı — hediye tamamlanamadı","❌ Couldn't reach the server — gift couldn't complete","❌ تعذر الوصول إلى الخادم — تعذر إتمام الهدية","❌ Tidak bisa menjangkau server — hadiah tak selesai","❌ سرور تک رسائی میسر نہیں — تحفیہ مکمل نہیں ہو سکا"],
  ["vpRenkPro","🎨 Renk Çubuğu PRO üyelere açık — premium sayfası açıldı","🎨 Color Bar is for PRO members — premium page opened","🎨 شريط الألوان لمشتركي PRO — فُتحت صفحة المميزات","🎨 Bilah Warna untuk member PRO — halaman premium dibuka","🎨 رنگ بار PRO ممبرز کے لیے — پیجم صفحہ کھلا"],
  ["vpKendiSesElit","👑 Kendi sesinle üretim ELİT üyelere özel — premium sayfasına yönlendiriliyorsun","👑 Rendering with your voice is reserved for ELITE members — taking you to the premium page","👑 الإنتاج بصوتك مخصص لأعضاء النخبة — تُنقل إلى صفحة المميزات","👑 Produksi dengan suaramu khusus member ELITE — membawamu ke halaman premium","👑 اپنی آواز میں پروڈکشن ایلیٹ ممبرز کے لیے — پیجم صفحے پر لے جا رہے ہیں"],
  ["vpKendiSesElitPanel","👑 Kendi sesinle üretim NÛR ELİT'te — premium panel açıldı","👑 Rendering with your voice is in NÛR ELITE — premium panel opened","👑 الإنتاج بصوتك في نُور النخبة — فُتحت لوحة المميزات","👑 Produksi dengan suaramu di NÛR ELITE — panel premium dibuka","👑 اپنی آواز میں پروڈکشن نور ایلیٹ میں — پیجم پینل کھلا"],
  ["ksEdgeSes","🔊 Ses seçildi · Daha doğal ses için Microsoft Edge kullan (Emel/Ahmet sesleri)","🔊 Voice selected · For a more natural voice use Microsoft Edge (Emel/Ahmet voices)","🔊 اُختير الصوت · لصوت أكثر طبيعية استخدم Microsoft Edge (صوتا Emel/Ahmet)","🔊 Suara dipilih · Untuk suara lebih alami pakai Microsoft Edge (suara Emel/Ahmet)","🔊 آواز منتخب · زیادہ فطری آواز کے لیے Microsoft Edge استعمال کریں (عامل/احمد آوازیں)"],
  ["adSupabaseAra","🔍 Supabase'de aranıyor...","🔍 Searching in Supabase...","🔍 جارٍ البحث في Supabase...","🔍 Mencari di Supabase...","🔍 Supabase میں تلاش جاری ہے..."],
  ["vpLoginGerekli","🔐 Bu özellik üyelere özel — önce giriş yap / üye ol!","🔐 This feature is members-only — sign in or sign up first!","🔐 هذه الميزة للأعضاء — سجّل الدخول أو سجّل أولًا!","🔐 Fitur ini khusus member — masuk atau daftar dulu!","🔐 یہ فیچر ممبرز کے لیے ہے — پہلے لاگ اِن / ممبر شپ لیں!"],
  ["udLoginOdeme","🔐 Ödeme için giriş yapmalısınız","🔐 You must sign in to pay","🔐 يجب تسجيل الدخول للدفع","🔐 Anda harus masuk untuk membayar","🔐 پیمنٹ کے لیے آپ کو لاگ اِن ہونا ضروری ہے"],
  ["vpYakinda","🔒 Kendi Sesinle Üret yakında geliyor — hazır olduğunda duyurulacak!","🔒 Produce with Your Voice is coming soon — it will be announced when ready!","🔒 الإنتاج بصوتك قادم قريبًا — سيُعلَن عند جاهزية!","🔒 Produksi dengan Suaramu segera — akan diumumkan saat siap!","🔒 اپنی آواز میں پروڈکشن جلد آ رہی ہے — تیار ہو تو اعلان ہوگا!"],
  ["abDuyuruSil","🗑️ Tüm duyurular kaldırıldı · Sayfa yenilenince tümünde gider","🗑️ All announcements removed · Disappears everywhere after a page refresh","🗑️ سُحّبت جميع الإعلانات · تختفي في كل شيء بعد تحديث الصفحة","🗑️ Semua pengumuman dihapus · Hilang di semua setelah halaman dimuat ulang","🗑️ تمام اعلانات ہٹا دیے گئے · صفحہ ریفریش کیے بعد سب سے غائب"],
  ["abV3Bosaltildi","🧹 V3 (uzun vadeli) listesi boşaltıldı — V2 oylaması ve oylar korundu","🧹 V3 (long-term) list emptied — V2 vote and votes are kept","🧹 فُرغت قائمة V3 (بعيدة المدى) — حُفظ تصويت V2 والأصوات","🧹 Daftar V3 (jangka panjang) dikosongkan — pemungutan suara V2 dan suara dipertahankan","🧹 V3 (لمبہ عرصہ) فہرست صاف کی گئی — V2 ووٹنگ اور ووٹ محفوظ رہے"],
];

const DILLER = ["tr", "en", "ar", "id", "ur"];
const mevcut = DILLER.map((d) => JSON.parse(fs.readFileSync(`src/i18n/dicts.${d}.json`, "utf8")));
const yeni = [];
for (const kayit of SOZLUK) {
  const [k] = kayit;
  if (k in mevcut[0]) { console.log("~~ VAR:", k); continue; }
  yeni.push(k);
  for (let i = 0; i < 5; i++) mevcut[i][k] = kayit[i + 1];
}
DILLER.forEach((d, i) => fs.writeFileSync(`src/i18n/dicts.${d}.json`, JSON.stringify(mevcut[i], null, 2) + "\n"));
console.log(`SÖZLÜK: +${yeni.length} anahtar`);

// ── kod bağlama ──
const KO = `// ★ 26.10 I18N KÖPRÜSÜ: oturumun dilini her çağrıda okur\nconst ttX2610 = (k: string): string => translate(typeof localStorage !== "undefined" ? (localStorage.getItem("nur_lang") || "tr") : "tr", k);`;

function kospruEkle(metin) {
  if (metin.includes("const ttX2610 =")) return metin;
  if (!metin.includes('from "../i18n"')) metin = `import { translate } from "../i18n";\n` + metin;
  const m = metin.match(/^import[\s\S]*?;\n/m);
  metin = m ? metin.replace(m[0], m[0] + KO + "\n") : KO + "\n" + metin;
  return metin;
}

const ISLEMLER = [
  ["src/components/AdminBroadcastPanel.tsx", "notify(\"Admin yetkisi için sunucuya ulaşılamadı\")", "notify(ttX2610(\"adAdminSunucu\"))"],
  ["src/components/AdminBroadcastPanel.tsx", "notify(\"Bakım bitiş saati başlangıçtan sonra olmalı\")", "notify(ttX2610(\"abBakimSaat\"))"],
  ["src/components/AdminBroadcastPanel.tsx", "notify(\"Başlık ve kısa mesaj zorunlu\")", "notify(ttX2610(\"abBaslikMesaj\"))"],
  ["src/components/AdminBroadcastPanel.tsx", "notify(\"Bu işlem tek tuşla geri alınamaz — kilitleri tek tek ayarla\")", "notify(ttX2610(\"abTekKlikGeriAl\"))"],
  ["src/components/AdminBroadcastPanel.tsx", "notify(\"Eski kayıtlar temizlendi\")", "notify(ttX2610(\"abEskiKayitlar\"))"],
  ["src/components/AdminBroadcastPanel.tsx", "notify(\"Google ile admin hesabınızdan giriş yapın\")", "notify(ttX2610(\"abGoogleAdmin\"))"],
  ["src/components/AdminBroadcastPanel.tsx", "notify(\"Konu ve içerik gerekli\")", "notify(ttX2610(\"abKonuIcerik\"))"],
  ["src/components/AdminBroadcastPanel.tsx", "notify(\"Lütfen GitHub Personal Access Token giriniz.\")", "notify(ttX2610(\"abGithubToken\"))"],
  ["src/components/AdminBroadcastPanel.tsx", "notify(\"Lütfen bir hedef seçin\")", "notify(ttX2610(\"abHedefSec\"))"],
  ["src/components/AdminBroadcastPanel.tsx", "notify(\"Lütfen modül başlığı giriniz.\")", "notify(ttX2610(\"abModulBaslik\"))"],
  ["src/components/AdminBroadcastPanel.tsx", "notify(\"Sunucuya ulaşılamadı\")", "notify(ttX2610(\"asSunucu\"))"],
  ["src/components/AdminBroadcastPanel.tsx", "notify(\"Sıfırlama başarısız\")", "notify(ttX2610(\"abSifirlamaHata\"))"],
  ["src/components/AdminBroadcastPanel.tsx", "notify(\"Tüm hata kayıtları silindi\")", "notify(ttX2610(\"abHataKayitlari\"))"],
  ["src/components/AdminBroadcastPanel.tsx", "notify(\"⚠️ Bitiş zamanı geçmiş — site bakıma girmez, ileri bir saat seç\")", "notify(ttX2610(\"abBitisGecmis\"))"],
  ["src/components/AdminBroadcastPanel.tsx", "notify(\"⚠️ Hediye miktarı 0'dan büyük olmalı\")", "notify(ttX2610(\"abHediye0\"))"],
  ["src/components/AdminBroadcastPanel.tsx", "notify(\"✅ Duyuru bu cihazda yayınlandı (Supabase erişimi yok — admin girişi gerekli)\")", "notify(ttX2610(\"abDuyuruCihaz\"))"],
  ["src/components/AdminBroadcastPanel.tsx", "notify(\"✅ Duyuru tüm kullanıcılara yayınlandı\")", "notify(ttX2610(\"abDuyuruYayin\"))"],
  ["src/components/AdminBroadcastPanel.tsx", "notify(\"✨ Modül durumu güncellendi!\")", "notify(ttX2610(\"abModulDurum\"))"],
  ["src/components/AdminBroadcastPanel.tsx", "notify(\"🗑️ Tüm duyurular kaldırıldı · Sayfa yenilenince tümünde gider\")", "notify(ttX2610(\"abDuyuruSil\"))"],
  ["src/components/AdminBroadcastPanel.tsx", "notify(\"🧹 V3 (uzun vadeli) listesi boşaltıldı — V2 oylaması ve oylar korundu\")", "notify(ttX2610(\"abV3Bosaltildi\"))"],
  ["src/components/adminDashboardRpc.ts", "notify(\"⚠️ Geçerli bir e-posta adresi gir\")", "notify(ttX2610(\"adGecerliEmail\"))"],
  ["src/components/adminDashboardRpc.ts", "notify(\"⛔ Kendi oturum hesabınızı banlayamazsınız.\")", "notify(ttX2610(\"adOturumBan\"))"],
  ["src/components/adminDashboardRpc.ts", "notify(\"⛔ Kurucu Admin hesabı banlanamaz!\")", "notify(ttX2610(\"adKurucuBan\"))"],
  ["src/components/adminDashboardRpc.ts", "notify(\"⛔ Sadece Kurucu Admin ban kaldırma yetkisine sahiptir.\")", "notify(ttX2610(\"adBanKaldirma\"))"],
  ["src/components/adminDashboardRpc.ts", "notify(\"⚠️ Aramak için bir e-posta adresi gir\")", "notify(ttX2610(\"adEmailGir\"))"],
  ["src/components/adminDashboardRpc.ts", "notify(\"🔍 Supabase'de aranıyor...\")", "notify(ttX2610(\"adSupabaseAra\"))"],
  ["src/components/adminDashboardRpc.ts", "notify(\"Admin yetkisi için sunucuya ulaşılamadı\")", "notify(ttX2610(\"adAdminSunucu\"))"],
  ["src/components/kesfetTemel.tsx", "notify(\"🔒 Kendi Sesinle Üret yakında geliyor — hazır olduğunda duyurulacak!\")", "notify(ttX2610(\"vpYakinda\"))"],
  ["src/components/KendiSesModal.tsx", "notify(\"🔑 Bu özellik üyelere özel — önce giriş yap / üye ol!\")", "notify(ttX2610(\"vpLoginGerekli\"))"],
  ["src/components/modalHelpers.tsx", "notify(\"Önce en az bir ayet seçin — senkron seçtiğin ayetlere kurulur\")", "notify(ttX2610(\"ksOnceAyetSenkron\"))"],
  ["src/components/modalHelpers.tsx", "notify(\"⚠️ Bu kaydın zamanlamaları eski taramadan kalma ve sesin süresini aşıyor — '🔬 Yeniden analiz et' ile düzelt\")", "notify(ttX2610(\"ksEskiZamanlama\"))"],
  ["src/components/modalHelpers.tsx", "notify(\"🔊 Ses seçildi · Daha doğal ses için Microsoft Edge kullan (Emel/Ahmet sesleri)\")", "notify(ttX2610(\"ksEdgeSes\"))"],
  ["src/components/ModalsContainer.tsx", "notify(\"⏳ Ödeme sayfası hazırlanıyor...\")", "notify(ttX2610(\"udOdemeHazirlaniyor\"))"],
  ["src/components/ModalsContainer.tsx", "notify(\"🔐 Ödeme için giriş yapmalısınız\")", "notify(ttX2610(\"udLoginOdeme\"))"],
  ["src/components/modalsContainerBolumler.tsx", "notify(\"Ödeme sayfası açılamadı\")", "notify(ttX2610(\"udSayfaAcilmadi\"))"],
  ["src/components/modalsContainerBolumler.tsx", "notify(\"Ödeme servisine ulaşılamadı\")", "notify(ttX2610(\"udServis\"))"],
  ["src/components/modalsContainerBolumler.tsx", "notify(\"⚙️ Google girişi için Client ID tanımlanmalı (.env → VITE_GOOGLE_CLIENT_ID)\")", "notify(ttX2610(\"abGoogleClientId\"))"],
  ["src/components/VideoPreviewSection.tsx", "notify(\"✨ Akıllı AI ELİT özelliğidir — üyelik sayfasından Elite yüksel\")", "notify(ttX2610(\"akElitOzellik\"))"],
  ["src/components/VideoPreviewSection.tsx", "notify(\"🎨 Renk Çubuğu PRO üyelere açık — premium sayfası açıldı\")", "notify(ttX2610(\"vpRenkPro\"))"],
  ["src/components/VideoPreviewSection.tsx", "notify(\"✏️ Özel Yazı PRO üyelere açık — premium sayfası açıldı\")", "notify(ttX2610(\"vpOzelYaziPro\"))"],
  ["src/components/VideoPreviewSection.tsx", "notify(\"👑 Kendi sesinle üretim ELİT üyelere özel — premium sayfasına yönlendiriliyorsun\")", "notify(ttX2610(\"vpKendiSesElit\"))"],
  ["src/components/VideoPreviewSection.tsx", "notify(\"👑 Kendi sesinle üretim NÛR ELİT'te — premium panel açıldı\")", "notify(ttX2610(\"vpKendiSesElitPanel\"))"],
  ["src/hooks/useAdminYonetim.ts", "notify(\"Google ile admin hesabınızdan giriş yapın\")", "notify(ttX2610(\"abGoogleAdmin\"))"],
  ["src/hooks/useAdminYonetim.ts", "notify(\"Lütfen GitHub Personal Access Token giriniz.\")", "notify(ttX2610(\"abGithubToken\"))"],
  ["src/StudioApp.tsx", "notify(\"Üretim kullanıcı tarafından iptal edildi\")", "notify(ttX2610(\"udKullaniciIptal\"))"],
  ["src/components/AdminGizliFeatures.tsx", "notify(\"Sunucuya ulaşılamadı\")", "notify(ttX2610(\"asSunucu\"))"],
];

let ok = 0, hata = 0;
const dosyalar = new Set();
for (const [p, bul, yeniStr] of ISLEMLER) {
  let metin = fs.readFileSync(p, "utf8");
  if (!metin.includes(bul)) { console.log("!! BULUNAMADI", p, "→", bul.slice(0, 55)); hata++; continue; }
  metin = metin.split(bul).join(yeniStr);
  metin = kospruEkle(metin);
  fs.writeFileSync(p, metin);
  dosyalar.add(p);
  ok++;
}
console.log(`BAĞLAMA: ${ok} değişim · ${hata} bulunamadı · ${dosyalar.size} dosya`);
