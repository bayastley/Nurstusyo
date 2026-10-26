// ════════════════════════════════════════════════════════
// 26.10 E TURU (3. geçiş) — şablon-değişkenli notify'lar + 1 çift tırnak
// ════════════════════════════════════════════════════════
import fs from 'node:fs';

const SOZLUK = [
  ['abKalemYayin','🚀 {a} yayınlandı — herkese duyuru gitti!','🚀 {a} published — announcement sent to everyone!','🚀 نُشر {a} — ذهب الإعلان للجميع!','🚀 {a} dipublikasikan — pengumuman dikirim ke semua!','🚀 {a} شائع ہوا — سب کو اعلان بھیج دیا گیا!'],
  ['abKilitKaldi','✅ "{a}" kilidi kaldırıldı — herkese açık','✅ "{a}" lock removed — open to everyone','✅ سُحب قفل "{a}" — مفتوح للجميع','✅ Kunci "{a}" dihapus — terbuka untuk semua','✅ "{a}" کا لاک ہٹا دیا گیا — سب کے لیے کھلا'],
  ['abKilitToplu','✅ {a} kilidin tamamı kaldırıldı','✅ All {a} locks removed','✅ سُحبت جميع الأقفال ({a})','✅ Semua {a} kunci dihapus','✅ تمام {a} لاکس ہٹا دیے گئے'],
  ['abGeriAlindi','↩️ "{a}" → {b} geri alındı','↩️ "{a}" → {b} reverted','↩️ أُعيد "{a}" ← {b}','↩️ "{a}" → {b} dikembalikan','↩️ "{a}" ← {b} واپس کر دیا گیا'],
  ['abUygulandi','✅ "{a}" → {b} uygulandı','✅ "{a}" → {b} applied','✅ طُبق "{a}" ← {b}','✅ "{a}" → {b} diterapkan','✅ "{a}" ← {b} لاگو ہو گیا'],
  ['abMailGonderildi','✉️ {a}/{b} kullanıcıya gönderildi','✉️ Sent to {a}/{b} users','✉️ أُرسل إلى {a}/{b} مستخدمًا','✉️ Terkirim ke {a}/{b} pengguna','✉️ {a}/{b} صارفین کو بھیجا گیا'],
  ['adsEpHata','🔍 {a} — son hata: {b}','🔍 {a} — last error: {b}','🔍 {a} — آخر خطأ: {b}','🔍 {a} — galat terakhir: {b}','🔍 {a} — آخری ایرر: {b}'],
  ['adBanDb','⛔ {a} DB\'ye işlendi ve süresiz banlandı!','⛔ {a} written to DB and banned indefinitely!','⛔ سُجل {a} في قاعدة البيانات وحُجب بلا مدة!','⛔ {a} ditulis ke DB dan di-ban tanpa batas!','⛔ {a} ڈی بی میں درج اور بغیر مدت کے بین ہوا!'],
  ['adBanYerken','⛔ {a} süresiz banlandı! (yerel kayıt — DB henüz bağlı değildi)','⛔ {a} banned indefinitely! (local record — DB wasn\'t connected yet)','⛔ حُجب {a} بلا مدة! (سجل محلي — لم تكن قاعدة البيانات متصلة)','⛔ {a} di-ban tanpa batas! (catatan lokal — DB belum tersambung)','⛔ {a} بغیر مدت بین! (مقامی ریکارڈ — ڈی بی ابھی منسلک نہ تھا)'],
  ['adBanSunucuHata','⛔ {a} yerel olarak banlandı (sunucu hatası, DB\'ye işlenemedi)','⛔ {a} banned locally (server error, not written to DB)','⛔ حُجب {a} محليًا (خطأ خادم، لم يُسجل في قاعدة البيانات)','⛔ {a} di-ban lokal (galat server, tak tertulis di DB)','⛔ {a} مقامی طور پر بین (سرور ایرر، ڈی بی میں درج نہ ہو سکا)'],
  ['adBanIade','✅ {a} banı kaldırıldı ve DB\'ye işlendi','✅ {a}\'s ban lifted and written to DB','✅ رُفع حجب {a} وسُجل في قاعدة البيانات','✅ Ban milik {a} dicabut dan ditulis ke DB','✅ {a} کا بین ہٹا اور ڈی بی میں درج کیا گیا'],
  ['adBanYerkenIade','✅ {a} banı yerel olarak kaldırıldı (DB henüz bağlı değildi)','✅ {a}\'s ban lifted locally (DB wasn\'t connected yet)','✅ رُفع حجب {a} محليًا (لم تكن قاعدة البيانات متصلة)','✅ Ban milik {a} dicabut lokal (DB belum tersambung)','✅ {a} کا بین مقامی طور پر ہٹا (ڈی بی ابھی منسلک نہ تھا)'],
  ['adModulEkle','🎉 Yeni Modül Eklendi: "{a}"','🎉 New module added: "{a}"','🎉 أُضيفت وحدة جديدة: "{a}"','🎉 Modul baru ditambahkan: "{a}"','🎉 نیا ماڈیول شامل: "{a}"'],
  ['agAcildi','🎉 {a} → {b} kullanıcılarına açıldı · duyuru otomatik gider','🎉 {a} opened to {b} users · announcement goes out automatically','🎉 فُتح {a} لمستخدمي {b} · الإعلان تلقائي','🎉 {a} dibuka ke pengguna {b} · pengumuman otomatis','🎉 {a} → {b} صارفین کے لیے کھلا · اعلان خودکار جاتا ہے'],
  ['agGizli','🙈 {a} admin-gizliye çekildi — kullanıcılar artık göremez','🙈 {a} pulled into admin-hidden — users can no longer see it','🙈 سُحب {a} إلى المخفي إداريًا — لن يراه المستخدمون بعد الآن','🙈 {a} ditarik ke admin-sembunyi — pengguna tak melihatnya lagi','🙈 {a} ایڈمن-پوشیدہ میں چلا گیا — صارفین اب اسے نہیں دیکھ سکتے'],
  ['agOylamaSifir','✅ Oylama listesi sıfırlandı + {a} admin-gizli madde eklendi','✅ Vote list reset + {a} admin-hidden items added','✅ عُدت قائمة التصويت + أُضيفت {a} عناصر مخفية إداريًا','✅ Daftar voting direset + {a} butir admin-sembunyi ditambah','✅ ووٹنگ فہرست ری سیٹ + {a} ایڈمن-پوشیدہ مُنیں شامل'],
  ['mcYakindaGeliyor','🔒 {a} yakında geliyor — hazır olduğunda duyurulacak!','🔒 {a} coming soon — will be announced when ready!','🔒 {a} قادم قريبًا — سيُعلَن عند جاهزية!','🔒 {a} segera hadir — diumumkan saat siap!','🔒 {a} جلد آ رہا ہے — تیار ہو تو اعلان ہوگا!'],
  ['udOdemeHata','❌ Ödeme hatası: {a}','❌ Payment error: {a}','❌ خطأ في الدفع: {a}','❌ Galat pembayaran: {a}','❌ پیمنٹ ایرر: {a}'],
  ['udTierAktif','Hoş geldin! NÛR {a} aktif','Welcome! NÛR {a} is active','أهلًا بك! نُور {a} مفعّل','Selamat datang! NÛR {a} aktif','خوش آمدید! نور {a} فعال'],
  ['udHakEklendi','{a} ⚡ Üretim hakkı hesabına eklendi','{a} ⚡ production credit added to your account','أُضيفت {a} ⚡ وحدة إنتاج إلى حسابك','{a} ⚡ kuota produksi ditambahkan ke akunmu','{a} ⚡ پروڈکشن کریڈٹ آپ کے اکاؤنٹ میں شامل'],
  ['odDemoPro','✅ [DEMO] NÛR PRO üyeliğin aktif edildi +{a} ⚡','✅ [DEMO] Your NÛR PRO membership activated +{a} ⚡','✅ [تجريبي] فُعّلت عضويتك نُور PRO +{a} ⚡','✅ [DEMO] Keanggotaan NÛR PRO kamu diaktifkan +{a} ⚡','✅ [ڈیمو] آپ کی نور PRO ممبرشپ فعال +{a} ⚡'],
  ['odDemoElit','👑 [DEMO] NÛR ELİT üyeliğin aktif edildi +{a} ⚡','👑 [DEMO] Your NÛR ELITE membership activated +{a} ⚡','👑 [تجريبي] فُعّلت عضويتك نُور النخبة +{a} ⚡','👑 [DEMO] Keanggotaan NÛR ELITE kamu diaktifkan +{a} ⚡','👑 [ڈیمو] آپ کی نور ایلیٹ ممبرشپ فعال +{a} ⚡'],
  ['odDemoHak','🎬 [DEMO] {a} video hakkı eklendi','🎬 [DEMO] {a} video credit added','🎬 [تجريبي] أُضيفت {a} وحدة فيديو','🎬 [DEMO] Kuota {a} video ditambahkan','🎬 [ڈیمو] {a} ویڈیو کریڈٹ شامل'],
  ['uyPaketGuncel','👑 {a} paketi "{b}" olarak güncellendi!','👑 {a}\'s package updated to "{b}"!','👑 حُدّثت باقة {a} إلى "{b}"!','👑 Paket milik {a} diperbarui ke "{b}"!','👑 {a} کا پیکج "{b}" پر اپڈیٹ ہوا!'],
  ['uyBakiyeGuncel','🪙 {a} bakiyesi güncellendi: {b} ⚡ Üretim hakkı ({c})','🪙 {a}\'s balance updated: {b} ⚡ production credit ({c})','🪙 حُدّث رصيد {a}: {b} ⚡ وحدة إنتاج ({c})','🪙 Saldo milik {a} diperbarui: {b} ⚡ kuota produksi ({c})','🪙 {a} کا بیلیس اپڈیٹ: {b} ⚡ پروڈکشن کریڈٹ ({c})'],
  ['uyBakiyeYapildi',' {a} bakiyesi {b} ⚡ Üretim hakkı yapıldı!',' {a}\'s balance set to {b} ⚡ production credit!',' ضُبط رصيد {a} إلى {b} ⚡ وحدة إنتاج!',' Saldo milik {a} disetel ke {b} ⚡ kuota produksi!',' {a} کا بیلیس {b} ⚡ پروڈکشن کریڈٹ کیا گیا!'],
  ['uyHaklariSifir','🗑️ {a} tüm hakları sıfırlandı — kısa/uzun/tam/jeton/abonelik temizlendi!','🗑️ All of {a}\'s rights reset — short/long/full/credits/subscription cleared!','🗑️ تُسّبطت جميع حقوق {a} — سُحبت القصيرة/الطويلة/الكاملة/الوحدات/الاشتراك!','🗑️ Semua hak milik {a} direset — pendek/panjang/penuh/kredit/langganan dibersihkan!','🗑️ {a} کے تمام حقوق ری سیٹ — مختصر/طویل/مکمل/کریڈٹ/سبسکرپشن صاف!'],
  ['uyAraniyorYok','ℹ️ "{a}" adresinde kayıtlı kullanıcı bulunamadı','ℹ️ No registered user found at "{a}"','ℹ️ لم يُعثر على مستخدم مسجل في "{a}"','ℹ️ Tak ada pengguna terdaftar di "{a}"','ℹ️ "{a}" پر کوئی رجسٹرڈ صارف نہ ملا'],
  ['uyBulundu','✅ {a} bulundu — {b} · {c} ⚡{d}','✅ {a} found — {b} · {c} ⚡{d}','✅ وُجد {a} — {b} · {c} ⚡{d}','✅ {a} ditemukan — {b} · {c} ⚡{d}','✅ {a} ملا — {b} · {c} ⚡{d}'],
  ['uySupabaseBulundu','✅ {a} Supabase\'de bulundu — {b} · {c} ⚡{d}','✅ {a} found in Supabase — {b} · {c} ⚡{d}','✅ وُجد {a} في Supabase — {b} · {c} ⚡{d}','✅ {a} ditemukan di Supabase — {b} · {c} ⚡{d}','✅ {a} Supabase میں ملا — {b} · {c} ⚡{d}'],
  ['uyKayitYok','❌ "{a}" adresiyle kayıtlı kullanıcı yok (Supabase\'de de bulunamadı)','❌ No registered user at "{a}" (not found in Supabase either)','❌ لا مستخدم مسجل في "{a}" (ولم يُوجد في Supabase)','❌ Tak ada pengguna terdaftar di "{a}" (tak ditemukan di Supabase)','❌ "{a}" پر کوئی رجسٹرڈ صارف نہیں (Supabase میں بھی نہیں ملا)'],
  ['uyBulunamadi','❌ {a} bulunamadı','❌ {a} not found','❌ لم يُعثر على {a}','❌ {a} tidak ditemukan','❌ {a} نہیں ملا'],
  ['uyHediyeYerel','🎁 {a} · +{b} ⚡ hediye edildi (yerel)','🎁 {a} · +{b} ⚡ gifted (local)','🎁 عُهدي لِ{a} · +{b} ⚡ (محلي)','🎁 {a} · +{b} ⚡ dihadiahkan (lokal)','🎁 {a} · +{b} ⚡ تحفہ دیا گیا (مقامی)'],
  ['uyHediyeHata','❌ Hediye tamamlanamadı: {a}','❌ Gift couldn\'t complete: {a}','❌ تعذر إتمام الهدية: {a}','❌ Hadiah tak selesai: {a}','❌ تحفہ مکمل نہیں ہو سکا: {a}'],
  ['uyHediyeOk','🎁 {a} · +{b} ⚡ hediye edildi · tier: {c} · bakiye: {d} ⚡{e}','🎁 {a} · +{b} ⚡ gifted · tier: {c} · balance: {d} ⚡{e}','🎁 تُهدي لِ{a} · +{b} ⚡ · المستوى: {c} · الرصيد: {d} ⚡{e}','🎁 {a} · +{b} ⚡ dihadiahkan · tier: {c} · saldo: {d} ⚡{e}','🎁 {a} · +{b} ⚡ تحفہ · ٹائر: {c} · بیلیس: {d} ⚡{e}'],
  ['uySistemdeYok','❌ {a} sistemde kayıtlı değil','❌ {a} is not registered in the system','❌ {a} غير مسجل في النظام','❌ {a} tidak terdaftar di sistem','❌ {a} سسٹم میں رجسٹرڈ نہیں'],
  ['uyTierAyarlandi','👑 {a} → {b} olarak ayarlandı','👑 {a} set to {b}','👑 عُين {a} ← {b}','👑 {a} disetel ke {b}','👑 {a} ← {b} کیا گیا'],
  ['stGuvenlikUyari','⚠️ Güvenlik: {a}','⚠️ Security: {a}','⚠️ الأمان: {a}','⚠️ Keamanan: {a}','⚠️ سلامتی: {a}'],
  ['agKiliteAlindi','🎬 {a} → V3 kilide alındı · yol haritasında oy olarak kalır','🎬 {a} → moved to V3 lock · stays as a vote on the roadmap','🎬 {a} → نُقل إلى قفل V3 · يبقى تصويتًا في خطة الطريق','🎬 {a} → dikunci ke V3 · tetap jadi suara di roadmap','🎬 {a} → V3 لاک میں منتقل · روڈ میپ پر ووٹ کے طور پر بچتا ہے'],
];

const DILLER = ['tr', 'en', 'ar', 'id', 'ur'];
const dicts = DILLER.map((d) => JSON.parse(fs.readFileSync(`src/i18n/dicts.${d}.json`, 'utf8')));
let eklendi = 0;
for (const kayit of SOZLUK) {
  const [k] = kayit;
  if (k in dicts[0]) continue;
  eklendi++;
  for (let i = 0; i < 5; i++) dicts[i][k] = kayit[i + 1];
}
DILLER.forEach((d, i) => fs.writeFileSync(`src/i18n/dicts.${d}.json`, JSON.stringify(dicts[i], null, 2) + '\n'));
console.log(`SÖZLÜK: +${eklendi} anahtar`);

const K = (k) => `ttX2610("${k}")`;

const ISLEMLER = [
  ['src/components/AdminBroadcastPanel.tsx', 'notify(`🚀 ${kalem.ad} yayınlandı — herkese duyuru gitti!`)', `notify(${K('abKalemYayin')}.replace("{a}", kalem.ad))`],
  ['src/components/AdminBroadcastPanel.tsx', 'notify(`✅ "${targetId}" kilidi kaldırıldı — herkese açık`)', `notify(${K('abKilitKaldi')}.replace("{a}", targetId))`],
  ['src/components/AdminBroadcastPanel.tsx', 'notify(`✅ ${targets.length} kilidin tamamı kaldırıldı`)', `notify(${K('abKilitToplu')}.replace("{a}", String(targets.length)))`],
  ['src/components/AdminBroadcastPanel.tsx', 'notify(`↩️ "${entry.target}" → ${LOCK_LABELS[entry.from] || entry.from} geri alındı`)', `notify(${K('abGeriAlindi')}.replace("{a}", entry.target).replace("{b}", String(LOCK_LABELS[entry.from] || entry.from)))`],
  ['src/components/AdminBroadcastPanel.tsx', 'notify(`✅ "${targetLabel}" → ${label} uygulandı`)', `notify(${K('abUygulandi')}.replace("{a}", targetLabel).replace("{b}", String(label)))`],
  ['src/components/AdminBroadcastPanel.tsx', 'notify(`✉️ ${data.sent}/${data.total} kullaniciya gönderildi`)', `notify(${K('abMailGonderildi')}.replace("{a}", String(data.sent)).replace("{b}", String(data.total)))`],
  ['src/components/adminDashboardBolumler.tsx', 'onClick={() => notify(`🔍 ${ep} — son hata: ${new Date(bilgi.sonZaman).toLocaleString("tr-TR")}`)}', `onClick={() => notify(${K('adsEpHata')}.replace("{a}", ep).replace("{b}", new Date(bilgi.sonZaman).toLocaleString("tr-TR")))}`],
  ['src/components/AdminDashboardModal.tsx', 'notify(`⛔ ${email} DB\'ye işlendi ve süresiz banlandı!`)', `notify(${K('adBanDb')}.replace("{a}", email))`],
  ['src/components/AdminDashboardModal.tsx', 'notify(`⛔ ${email} süresiz banlandı! (yerel kayıt — DB henüz bağlı değildi)`)', `notify(${K('adBanYerken')}.replace("{a}", email))`],
  ['src/components/AdminDashboardModal.tsx', 'notify(`⛔ ${email} yerel olarak banlandı (sunucu hatası, DB\'ye işlenemedi)`)', `notify(${K('adBanSunucuHata')}.replace("{a}", email))`],
  ['src/components/AdminDashboardModal.tsx', 'notify(`✅ ${email} banı kaldırıldı ve DB\'ye işlendi`)', `notify(${K('adBanIade')}.replace("{a}", email))`],
  ['src/components/AdminDashboardModal.tsx', 'notify(`✅ ${email} banı yerel olarak kaldırıldı (DB henüz bağlı değildi)`)', `notify(${K('adBanYerkenIade')}.replace("{a}", email))`],
  ['src/components/AdminDashboardModal.tsx', 'notify(`🎉 Yeni Modül Eklendi: "${newMod.title}"`)', `notify(${K('adModulEkle')}.replace("{a}", String(newMod.title)))`],
  ['src/components/AdminGizliFeatures.tsx', 'notify(`🎉 ${id} → ${tier.toUpperCase()} kullanıcılarına açıldı · duyuru otomatik gider`); // 17.10', `notify(${K('agAcildi')}.replace("{a}", String(id)).replace("{b}", String(tier.toUpperCase()))); // 17.10`],
  ['src/components/AdminGizliFeatures.tsx', 'notify(`🙈 ${id} admin-gizliye çekildi — kullanıcılar artık göremez`)', `notify(${K('agGizli')}.replace("{a}", String(id)))`],
  ['src/components/AdminGizliFeatures.tsx', 'notify(`✅ Oylama listesi sıfırlandı + ${addData.added ?? 22} admin-gizli madde eklendi`)', `notify(${K('agOylamaSifir')}.replace("{a}", String(addData.added ?? 22)))`],
  ['src/components/AdminGizliFeatures.tsx', 'notify("🎬 " + f.title + " → V3 kilide alındı · yol haritasında oy olarak kalır")', `notify(${K('agKiliteAlindi')}.replace("{a}", f.title))`],
  ['src/components/ModalsContainer.tsx', 'notify(`🔒 ${V2_KILITLI[m]} yakında geliyor — hazır olduğunda duyurulacak!`)', `notify(${K('mcYakindaGeliyor')}.replace("{a}", String(V2_KILITLI[m])))`],
  ['src/components/ModalsContainer.tsx', 'notify(`❌ Ödeme hatası: ${result.error || "Bilinmeyen hata — lütfen tekrar deneyin"}`)', `notify(${K('udOdemeHata')}.replace("{a}", String(result.error || "Bilinmeyen hata — lütfen tekrar deneyin")))`],
  ['src/components/ModalsContainer.tsx', 'notify(`Hoş geldin! NÛR ${newTier.toUpperCase()} aktif`)', `notify(${K('udTierAktif')}.replace("{a}", String(newTier.toUpperCase())))`],
  ['src/components/ModalsContainer.tsx', 'notify(`${amount} ⚡ Üretim hakkı hesabına eklendi`)', `notify(${K('udHakEklendi')}.replace("{a}", String(amount)))`],
  ['src/components/modalsContainerOdeme.ts', 'ctx.notify(`✅ [DEMO] NÛR PRO üyeliğin aktif edildi +${bonus} ⚡`)', `ctx.notify(${K('odDemoPro')}.replace("{a}", String(bonus)))`],
  ['src/components/modalsContainerOdeme.ts', 'ctx.notify(`👑 [DEMO] NÛR ELİT üyeliğin aktif edildi +${bonus} ⚡`)', `ctx.notify(${K('odDemoElit')}.replace("{a}", String(bonus)))`],
  ['src/components/modalsContainerOdeme.ts', 'ctx.notify(`🎬 [DEMO] ${amount} video hakkı eklendi`)', `ctx.notify(${K('odDemoHak')}.replace("{a}", String(amount)))`],
  ['src/hooks/useAdminYonetim.ts', 'notify(`👑 ${targetUser.email} paketi "${newTier.toUpperCase()}" olarak güncellendi!`)', `notify(${K('uyPaketGuncel')}.replace("{a}", targetUser.email).replace("{b}", String(newTier.toUpperCase())))`],
  ['src/hooks/useAdminYonetim.ts', 'notify(`🪙 ${targetUser.email} bakiyesi güncellendi: ${newTotal} ⚡ Üretim hakkı (${delta > 0 ? "+" + delta : delta})`)', `notify(${K('uyBakiyeGuncel')}.replace("{a}", targetUser.email).replace("{b}", String(newTotal)).replace("{c}", delta > 0 ? "+" + delta : String(delta)))`],
  ['src/hooks/useAdminYonetim.ts', 'notify(` ${targetUser.email} bakiyesi ${safeAmount} ⚡ Üretim hakkı yapıldı!`)', `notify(${K('uyBakiyeYapildi')}.replace("{a}", targetUser.email).replace("{b}", String(safeAmount)))`],
  ['src/hooks/useAdminYonetim.ts', 'notify(`🗑️ ${targetUser.email} tüm hakları sıfırlandı — kısa/uzun/tam/jeton/abonelik temizlendi!`)', `notify(${K('uyHaklariSifir')}.replace("{a}", targetUser.email))`],
  ['src/hooks/useAdminYonetim.ts', 'notify(`ℹ️ "${q}" adresinde kayıtlı kullanıcı bulunamadı`)', `notify(${K('uyAraniyorYok')}.replace("{a}", q))`],
  ['src/hooks/useAdminYonetim.ts', 'notify(`✅ ${found.email} bulundu — ${found.tier.toUpperCase()} · ${found.jeton} ⚡${banInfo}`)', `notify(${K('uyBulundu')}.replace("{a}", found.email).replace("{b}", String(found.tier.toUpperCase())).replace("{c}", String(found.jeton)).replace("{d}", String(banInfo)))`],
  ['src/hooks/useAdminYonetim.ts', 'notify(`✅ ${synced.email} Supabase\'de bulundu — ${synced.tier.toUpperCase()} · ${synced.jeton} ⚡${banLabel}`)', `notify(${K('uySupabaseBulundu')}.replace("{a}", synced.email).replace("{b}", String(synced.tier.toUpperCase())).replace("{c}", String(synced.jeton)).replace("{d}", String(banLabel)))`],
  ['src/hooks/useAdminYonetim.ts', 'notify(`❌ "${q}" adresiyle kayıtlı kullanıcı yok (Supabase\'de de bulunamadı)`)', `notify(${K('uyKayitYok')}.replace("{a}", q))`],
  ['src/hooks/useAdminYonetim.ts', 'notify(`❌ ${target} bulunamadı`)', `notify(${K('uyBulunamadi')}.replace("{a}", String(target)))`],
  ['src/hooks/useAdminYonetim.ts', 'notify(`🎁 ${target} · +${safeAmount} ⚡ hediye edildi (yerel)`)', `notify(${K('uyHediyeYerel')}.replace("{a}", String(target)).replace("{b}", String(safeAmount)))`],
  ['src/hooks/useAdminYonetim.ts', 'notify(`❌ Hediye tamamlanamadı: ${data?.error || "bilinmeyen hata"}`)', `notify(${K('uyHediyeHata')}.replace("{a}", String(data?.error || "bilinmeyen hata")))`],
  ['src/hooks/useAdminYonetim.ts', 'notify(`🎁 ${target} · +${safeAmount} ⚡ hediye edildi · tier: ${shownTier} · bakiye: ${shownBalance} ⚡${warnMsg}`)', `notify(${K('uyHediyeOk')}.replace("{a}", String(target)).replace("{b}", String(safeAmount)).replace("{c}", String(shownTier)).replace("{d}", String(shownBalance)).replace("{e}", String(warnMsg)))`],
  ['src/hooks/useAdminYonetim.ts', 'notify(`❌ ${target} sistemde kayıtlı değil`)', `notify(${K('uySistemdeYok')}.replace("{a}", String(target)))`],
  ['src/hooks/useAdminYonetim.ts', 'notify(`👑 ${updated.email} → ${newTier.toUpperCase()} olarak ayarlandı`)', `notify(${K('uyTierAyarlandi')}.replace("{a}", updated.email).replace("{b}", String(newTier.toUpperCase())))`],
  ['src/StudioApp.tsx', 'notify(`⚠️ Güvenlik: ${reason}`)', `notify(${K('stGuvenlikUyari')}.replace("{a}", String(reason)))`],
];

let ok = 0, hata = 0;
for (const [p, bul, yeni] of ISLEMLER) {
  let metin = fs.readFileSync(p, 'utf8');
  if (!metin.includes(bul)) { console.log('!! BULUNAMADI', p, '→', bul.slice(0, 70)); hata++; continue; }
  metin = metin.split(bul).join(yeni);
  fs.writeFileSync(p, metin);
  ok++;
}
console.log(`BAĞLAMA: ${ok} değişim · ${hata} bulunamadı`);
