// ════════════════════════════════════════════════════════
// 26.10 — SÖZLÜK EKLE-5: Güncellemeler flyout lavta kartları +
//   menü kilit rozetlerine yeni 5-dil anahtarlar.
//   Ayrıca foto-5 üyelik kapısı metinleri.
//   Çalıştırma: node scripts/sozluk-ekle-2610-5.mjs
// ════════════════════════════════════════════════════════
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const KO = path.dirname(fileURLToPath(import.meta.url));
const I18N = path.join(KO, "..", "src", "i18n");

// "ihtişamlı yaz" — sahibin emri: lansman tarzı parlak davet dili.
const KOMUT = {
  hbrKendiSesiBaslik: {
    tr: "Kendi Sesinle Üret",
    en: "Create With Your Own Voice",
    ar: "اصنع بصوتك الخاص",
    id: "Buat Dengan Suaramu Sendiri",
    ur: "اپنی آواز سے بنائیں",
  },
  hbrKendiSesMetin: {
    tr: "Ayetleri kendi sesinle oku, eşsiz videon oradan çıksın; nefes nefesine bir teletsim dönemi başlıyor — sesinle imzalamak ELİT üyelere özel.",
    en: "Recite the verses in your own voice and let your unique video rise from it — a one-of-a-kind experience, reserved for ELİT membership.",
    ar: "اقرأ الآيات بصوتك الخاص ولتنتج فيديوهتك الفريدة منه — تجربة لا نظير لها، حصريًا لأعضاء النخبة.",
    id: "Bacakan ayat dengan suaramu dan biarkan video unikmu lahir darinya — pengalaman yang tak tertandingi, khusus anggota ELİT.",
    ur: "آیات کو اپنی آواز میں تلاوت کریں اور اپنی منفرد ویڈیو بنائیں — واحد تجربہ، صرف ایلیٹ ممبران کے لیے۔",
  },
  hbrKendiSesBtn: {
    tr: "🎙️ Kürsüye davetlisin →",
    en: "🎙️ You are invited to the recital →",
    ar: "🎙️ أنت مدعو للتلاوة →",
    id: "🎙️ Kamu diundang ke mimbar →",
    ur: "🎙️ آپ تلاوت کی دعوت نامے پر ہیں →",
  },
  hbrMobilDonBaslik: {
    tr: "Mobil Dönüş Telefonuna Kur",
    en: "Install on Your Phone",
    ar: "ثبّته على هاتفك",
    id: "Pasang di Ponselmu",
    ur: "اپنے فون پر انسٹال کریں",
  },
  hbrMobilDonMetin: {
    tr: "Nûr Stüdyo artık kesin uygulama gibi açılıyor — tek tıkla kuran, reklam çıkarmayan, bildirim ve çevrimdışı destekli PWA ile cebinde taşı.",
    en: "Nûr Studio now opens like a real app — one tap to install, no ads, with notifications and offline support as a PWA in your pocket.",
    ar: "يفتح استوديو النور الآن كتطبيق حقيقي — بنقرة واحدة للتثبيت، بلا إعلانات، مع إشعارات وبلا اتصال عبر PWA.",
    id: "Nûr Studio sekarang terbuka seperti aplikasi nyata — satu ketuk untuk pasang, tanpa iklan, dengan notifikasi dan dukungan offline lewat PWA.",
    ur: "نور اسٹوڈیو اب اصل ایپ کی طرح کھلتا ہے — ایک کلک سے انسٹال، بغیر اشتہار، نوٹیفکیشن اور آف لائن سپورٹ کے ساتھ PWA۔",
  },
  hbrMobilDonBtn: {
    tr: "📲 Şimdi Kur'ın →",
    en: "📲 Install Now →",
    ar: "📲 ثبّت الآن →",
    id: "📲 Pasang Sekarang →",
    ur: "📲 ابھی انسٹال کریں →",
  },
  v2YakindaBildirim: {
    tr: "yakında geliyor — hazır olduğunda duyurulacak",
    en: "is coming soon — will be announced once ready",
    ar: "قادم قريبًا — سيُعلن عند الجهوزية",
    id: "segera hadir — akan diumumkan saat siap",
    ur: "جلد آ رہا ہے — تیار ہونے پر اعلان ہو گا",
  },
  kilitElitUyelik: {
    tr: "ELİT üyelikle açılır",
    en: "Available with ELİT membership",
    ar: "متوفر باشتراك النخبة",
    id: "Tersedia dengan keanggotaan ELİT",
    ur: "ایلیٹ رکنیت کے ساتھ دستیاب",
  },
  kilitProUyelik: {
    tr: "PRO üyelikle açılır",
    en: "Available with PRO membership",
    ar: "متوفر باشتراك برو",
    id: "Tersedia dengan keanggotaan PRO",
    ur: "پرو رکنیت کے ساتھ دستیاب",
  },
  v2KilitTitle: {
    tr: "Yakında — admin panelden açılır",
    en: "Coming soon — opens from the admin panel",
    ar: "قريبًا — يُفتح من لوحة الإدارة",
    id: "Segera — dibuka dari panel admin",
    ur: "جلد — ایڈمن پینل سے کھلتا ہے",
  },
  menuPwaAnaEkran: {
    tr: "Ana Ekrana Ekle · Uygulama Olarak",
    en: "Add to Home Screen · As an App",
    ar: "أضفه إلى الشاشة الرئيسية · كتطبيق",
    id: "Tambahkan ke Layar Utama · Sebagai Aplikasi",
    ur: "ہوم اسکرین پر شامل کریں · بطور ایپ",
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
