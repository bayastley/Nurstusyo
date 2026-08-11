// ════════════════════════════════════════════════════════
// i18n DİL AYARLARI, ÇEVİRİLER VE YASAL METİNLER
// GitHub main (bayastley/Nurstusyo) — getPaymentCopy TR-first düzeltmeli
// ════════════════════════════════════════════════════════

export type Lang =
  | "tr"
  | "en"
  | "ar"
  | "de"
  | "ru"
  | "fr"
  | "es"
  | "id"
  | "ur"
  | "fa";

export interface LangOption {
  code: Lang;
  label: string;
  flag: string;
  dir?: "ltr" | "rtl";
}

export const LANGS: LangOption[] = [
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ar", label: "العربية", flag: "🇸🇦", dir: "rtl" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "id", label: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "ur", label: "اردو", flag: "🇵🇰", dir: "rtl" },
  { code: "fa", label: "فارسی", flag: "🇮🇷", dir: "rtl" },
];

export const MEAL_EDITIONS: Record<Lang, string> = {
  tr: "tr.diyanet",
  en: "en.sahih",
  ar: "ar.alafasy",
  de: "de.bubenheim",
  ru: "ru.kuliev",
  fr: "fr.hamidullah",
  es: "es.cortes",
  id: "id.indonesian",
  ur: "ur.jalandhry",
  fa: "fa.fooladvand",
};

export const T: Record<Lang, Record<string, string>> = {
  tr: {
    dailyAyah: "Günün Ayeti",
    loading: "Yükleniyor...",
    menuGuide: "Kullanım Kılavuzu",
    menuThemes: "Tema Galerisi",
    menuSuggest: "Öneri Bildir",
    menuComplaint: "Sorun Bildir",
    premium: "Premium Pro",
    tagline: "Ultra Yüksek Kaliteli Kur'an Videosu Tasarlayın & Paylaşın",
    library: "Kütüphane & Ayet Arama",
    addAyah: "Ayet Ekle",
    wholeSurah: "Tüm Sureyi Ekle",
    atmoType: "Atmosfer Türü",
    template: "Şablon Görsel",
    motion: "Hareketli Video",
    selectedAyahs: "Seçili Ayetler",
    ready: "Videolarınız Hazır!",
    download: "İndir",
    share: "Paylaş",
    atmosphere: "Atmosfer Tasarımı",
    atmoLibrary: "Atmosfer Galerisi",
    randomAll: "Rastgele Ata",
    reciter: "Kâri & Ses Sanatçısı",
    kaaba: "Mescid-i Haram / Mescid-i Nebevî",
    copyright: "Telifsiz Stüdyo Kayıtları",
    mode: "Süre Modu",
    modeShort: "Kısa Video (Shorts / Reel)",
    modeLong: "Uzun Video (150 sn)",
    modeFull: "Tam Sürüm",
    format: "Video Ekran Formatı",
    stop: "Durdur",
    generate: "Video Üret",
    shareTitle: "Açıklama & Sosyal Medya Metni",
    refreshText: "Yazıyı Yenile",
    refreshTitle: "Başlığı Yenile",
    copy: "Metni Kopyala",
    copied: "Kopyalandı!",
    hashtagPool: "Etiket Havuzu",
    randomHashtag: "Rastgele Etiket",
    footerTag: "İyiliğe ve hayra vesile olmak dileğiyle...",
    pickForAyah: "Bu ayet için özel atmosfer seçin",
    hoverPreview: "Önizleme için üzerine gelin, seçmek için tıklayın",
    themesTitle: "Stüdyo Renk Temaları",
    themesSub: "Arayüz ve video renk paletini özelleştirin",
    prayerTitle: "Namaz Vakitleri & Ezan",
    prayerSearch: "Şehir ara... (ör: İstanbul, Konya)",
    guideTitle: "Hızlı Başlangıç Kılavuzu",
    guideSub: "4 adımda harika videolar hazırlayın",
    step1T: "1. Kütüphaneden Ayet Seçin",
    step1D:
      "Arama çubuğunu veya sure listesini kullanarak istediğiniz ayetleri ekleyin.",
    step2T: "2. Kâri Sesini ve Makamı Belirleyin",
    step2D:
      "Kâri listenizden gönlünüze hitap eden sesi ve okuyuşu tercih edin.",
    step3T: "3. Atmosfer & Görselliği Özelleştirin",
    step3D:
      "Hareketli videolar veya şablon görseller arasından sahnenize en uygun olanı seçin.",
    step4T: "4. Üretin ve Paylaşın",
    step4D:
      "Video Üret butonuna basarak yüksek kaliteli MP4/WebM videonuzu anında indirin.",
    storiesTitle: "Kur'an Kıssaları",
    storiesSub: "Peygamberlerin ibret dolu yaşam öyküleri",
    addThis: "Bu Ayeti Ekle",
    contactSuggest: "Öneri Formu",
    contactComplaint: "Hata / Sorun Bildirimi",
    contactSub: "Görüşleriniz NûR Stüdyo'yu geliştirmemize yardımcı oluyor.",
    sendEmail: "E-posta İle Gönder",
    loginTitle: "Giriş Yap / Kayıt Ol",
    loginSubtitle: "Nûr Stüdyo'ya hoş geldiniz",
    registerTab: "Kayıt Ol",
    loginTab: "Giriş Yap",
    fullName: "Ad Soyad",
    phoneNumber: "Telefon Numarası",
    email: "E-posta Adresi",
    password: "Şifre",
    confirmPassword: "Şifre Tekrar",
    registerBtn: "Kayıt Ol",
    loginBtn: "Giriş Yap",
    googleAuth: "Google ile devam et",
    forgotPassword: "Şifremi Unuttum",
    verificationCode: "Doğrulama Kodu",
    codeSent: "6 haneli kod gönderildi",
    verifyBtn: "Doğrula",
    resetPassword: "Şifre Sıfırla",
    backToLogin: "Geri dön",
    successVideoReady:
      "Sinematik Videonuz Başarıyla Hazırlandı! Cihazınıza İndiriliyor...",
  },
  en: {
    dailyAyah: "Ayah of the Day",
    loading: "Loading...",
    menuGuide: "User Guide",
    menuThemes: "Theme Gallery",
    menuSuggest: "Suggest Feature",
    menuComplaint: "Report Issue",
    premium: "Premium Pro",
    tagline: "Design & Share Ultra High Quality Quran Videos",
    library: "Library & Ayah Search",
    addAyah: "Add Verse",
    wholeSurah: "Add Full Surah",
    atmoType: "Atmosphere Type",
    template: "Still Template",
    motion: "Motion Video",
    selectedAyahs: "Selected Verses",
    ready: "Your Video is Ready!",
    download: "Download",
    share: "Share",
    atmosphere: "Atmosphere Design",
    atmoLibrary: "Atmosphere Gallery",
    randomAll: "Randomize",
    reciter: "Reciter & Audio",
    kaaba: "Masjid al-Haram / An-Nabawi",
    copyright: "Royalty Free Recitations",
    mode: "Duration Mode",
    modeShort: "Short (Shorts / Reels)",
    modeLong: "Long (150s)",
    modeFull: "Full Duration",
    format: "Video Format",
    stop: "Stop",
    generate: "Render Video",
    shareTitle: "Caption & Social Media Text",
    refreshText: "Regenerate Text",
    refreshTitle: "Regenerate Title",
    copy: "Copy Text",
    copied: "Copied!",
    hashtagPool: "Hashtags",
    randomHashtag: "Random Hashtags",
    footerTag: "May it be a means of goodness and blessing...",
    pickForAyah: "Pick atmosphere for this verse",
    hoverPreview: "Hover to preview, click to select",
    themesTitle: "Studio Themes",
    themesSub: "Customize application color scheme",
    prayerTitle: "Prayer Times",
    prayerSearch: "Search city...",
    guideTitle: "Quick Start Guide",
    guideSub: "Create video in 4 easy steps",
    step1T: "1. Select Ayahs",
    step1D: "Use search bar or surah list to add verses.",
    step2T: "2. Choose Reciter",
    step2D: "Select your preferred qari and style.",
    step3T: "3. Choose Background Atmosphere",
    step3D: "Select motion videos or scenic templates.",
    step4T: "4. Render & Share",
    step4D: "Click Render Video to generate high quality video.",
    storiesTitle: "Quranic Stories",
    storiesSub: "Inspiring stories of the Prophets",
    addThis: "Add Verse",
    contactSuggest: "Feedback",
    contactComplaint: "Report Bug",
    contactSub: "Your feedback helps improve Nûr Studio.",
    sendEmail: "Send Email",
    loginTitle: "Login / Register",
    loginSubtitle: "Welcome to Nûr Studio",
    registerTab: "Register",
    loginTab: "Login",
    fullName: "Full Name",
    phoneNumber: "Phone Number",
    email: "Email Address",
    password: "Password",
    confirmPassword: "Confirm Password",
    registerBtn: "Register",
    loginBtn: "Login",
    googleAuth: "Continue with Google",
    forgotPassword: "Forgot Password",
    verificationCode: "Verification Code",
    codeSent: "6-digit code sent",
    verifyBtn: "Verify",
    resetPassword: "Reset Password",
    backToLogin: "Back to Login",
    successVideoReady: "Your Cinematic Video is Ready! Downloading to Device...",
  },
  ar: {
    dailyAyah: "آية اليوم",
    loading: "جاري التحميل...",
    menuGuide: "دليل الاستخدام",
    menuThemes: "معرض الثيمات",
    menuSuggest: "اقتراح",
    menuComplaint: "الإبلاغ عن مشكلة",
    premium: "بريميوم برو",
    tagline: "تصميم ومشاركة فيديوهات القرآن الكريم بأعلى جودة",
    library: "المكتبة والبحث في الآيات",
    addAyah: "إضافة آية",
    wholeSurah: "إضافة السورة كاملة",
    atmoType: "نوع الخلفية",
    template: "صورة ثابتة",
    motion: "فيديو متحرك",
    selectedAyahs: "الآيات المختارة",
    ready: "الفيديو جاهز!",
    download: "تحميل",
    share: "مشاركة",
    atmosphere: "تصميم الخلفية",
    atmoLibrary: "مكتبة الخلفيات",
    randomAll: "تحديد عشوائي",
    reciter: "القارئ والصوت",
    kaaba: "المسجد الحرام / النبوي",
    copyright: "تسجيلات خالية من حقوق النشر",
    mode: "نمط المدة",
    modeShort: "فيديو قصير (Shorts / Reels)",
    modeLong: "فيديو طويل (150 ثانية)",
    modeFull: "المدة الكاملة",
    format: "أبعاد الفيديو",
    stop: "إيقاف",
    generate: "إنتاج الفيديو",
    shareTitle: "النص والوصف للمشاركة",
    refreshText: "تحديث النص",
    refreshTitle: "تحديث العنوان",
    copy: "نسخ النص",
    copied: "تم النسخ!",
    hashtagPool: "الوسوم",
    randomHashtag: "وسوم عشوائية",
    footerTag: "نسأل الله أن يجعل هذا العمل خالصاً لوجهه الكريم...",
    pickForAyah: "اختر خلفية لهذه الآية",
    hoverPreview: "مرر لمعاينة الخلفية، اضغط للاختيار",
    themesTitle: "ثيمات الاستوديو",
    themesSub: "تخصيص ألوان الواجهة",
    prayerTitle: "مواقيت الصلاة",
    prayerSearch: "ابحث عن المدينة...",
    guideTitle: "دليل البدء السريع",
    guideSub: "أنشئ مقاطع فيديو في 4 خطوات سهلة",
    step1T: "1. اختر الآيات",
    step1D: "استخدم شريط البحث أو قائمة السور لإضافة الآيات.",
    step2T: "2. اختر القارئ",
    step2D: "اختر القارئ المفضل لديك والأسلوب.",
    step3T: "3. اختر خلفية الفيديو",
    step3D: "اختر مقاطع فيديو متحركة أو قوالب ثابتة.",
    step4T: "4. إنتاج ومشاركة",
    step4D: "انقر فوق إنتاج الفيديو لإنشاء فيديو عالي الجودة.",
    storiesTitle: "قصص القرآن",
    storiesSub: "قصص ملهمة من الأنبياء",
    addThis: "إضافة آية",
    contactSuggest: "تعليقات",
    contactComplaint: "الإبلاغ عن خطأ",
    contactSub: "تعليقاتك تساعد في تحسين استوديو نُور.",
    sendEmail: "إرسال بريد إلكتروني",
    loginTitle: "تسجيل الدخول / التسجيل",
    loginSubtitle: "مرحبًا بك في استوديو نُور",
    registerTab: "تسجيل جديد",
    loginTab: "تسجيل الدخول",
    fullName: "الاسم الكامل",
    phoneNumber: "رقم الهاتف",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    registerBtn: "تسجيل",
    loginBtn: "تسجيل الدخول",
    googleAuth: "المتابعة باستخدام Google",
    forgotPassword: "نسيت كلمة المرور",
    verificationCode: "رمز التحقق",
    codeSent: "تم إرسال رمز مكون من 6 أرقام",
    verifyBtn: "تحقق",
    resetPassword: "إعادة تعيين كلمة المرور",
    backToLogin: "العودة لتسجيل الدخول",
    successVideoReady: "فيديو سينمائي جاهز! جاري التحميل على الجهاز...",
  },
  de: {},
  ru: {},
  fr: {},
  es: {},
  id: {},
  ur: {},
  fa: {},
};

type LegalBundle = {
  legalTitle: string;
  legalSubtitle: string;
  legalTabs: { tos: string; kvkk: string; privacy: string; refund: string };
  legalBody: { tos: string; kvkk: string; privacy: string; refund: string };
};

/**
 * ★ ASIL HATA BURADAYDI:
 * Eski kod: return legalTranslations[lang] || legalTranslations["en"] || ...
 * TR seçili olsa bile lang boş/"TR"/tutmazsa İNGİLİZCE dönüyordu.
 *
 * Yeni kural:
 * 1) lang normalize (lowercase, trim)
 * 2) o dil varsa onu ver
 * 3) yoksa TÜRKÇE (asla sessizce EN'ye düşme)
 */
export const getPaymentCopy = (lang?: Lang | string | null): LegalBundle => {
  const legalTranslations: Record<string, LegalBundle> = {
    tr: {
      legalTitle: "Yasal Bilgilendirme ve Sözleşmeler",
      legalSubtitle: "nurstudyo.com Kurumsal Sözleşme Portalı",
      legalTabs: {
        tos: "Kullanım Şartları",
        kvkk: "KVKK Aydınlatma",
        privacy: "Gizlilik & Çerez",
        refund: "Satın Alma & İade",
      },
      legalBody: {
        tos:
          "PLATFORM TANIMI VE SORUMLULUK SINIRI\n\n" +
          "Nûr Stüdyo (nurstudyo.com), İslami içerik üreticilerine yönelik yapay zeka destekli dijital video üretim platformudur. Platform; şahıs firması olarak kurulmuş olup yalnızca yazılım aracılık hizmeti sunmakta, herhangi bir medya içeriği telif hakkı iddiasında bulunmamaktadır.\n\n" +
          "İÇERİK SORUMLULUĞU\n\n" +
          "Platformda üretilen tüm ses, görüntü, metin ve video içeriklerin üçüncü taraflara (YouTube, TikTok, Instagram vb.) yayınlanmasından doğan her türlü telif, lisans ve yayın sorumluluğu münhasıran kullanıcıya aittir. Nûr Stüdyo bu kapsamda hiçbir hukuki ya da cezai sorumluluk kabul etmez.\n\n" +
          "HESAP VE ERİŞİM\n\n" +
          "Platform hizmetlerinden yararlanmak için Google hesabı ile kimlik doğrulama zorunludur. Hesabın güvenliği kullanıcının sorumluluğundadır. Platform, herhangi bir zamanda hizmet koşullarına aykırı davranan hesapları askıya alma ya da kalıcı kapatma hakkını saklı tutar.\n\n" +
          "HİZMET SÜREKLİLİĞİ\n\n" +
          "Nûr Stüdyo hizmet sürekliliğini garanti etmez. Teknik bakım, güncelleme veya beklenmedik kesintiler nedeniyle hizmet geçici olarak kullanılamaz duruma gelebilir. Bu tür durumlarda kullanıcı tazminat talebinde bulunamaz.\n\n" +
          "FİKRİ MÜLKİYET\n\n" +
          "Platform arayüzü, kaynak kodu, tasarım öğeleri, logo ve marka adı Nûr Stüdyo'ya aittir. Kullanıcı, platformu tersine mühendislik yapma, kopyalama, çoğaltma veya başka bir platformda yeniden yayınlama hakkına sahip değildir.\n\n" +
          "KÂRİ SES KAYITLARI VE TELİF\n\n" +
          "Platformda sunulan kâri ses kayıtları üçüncü parti kaynaklardan (EveryAyah, MP3Quran vb.) temin edilmektedir. Her kâri kaydının yanında tahmini telif riski yüzdesi belirtilmiştir. Yüksek telif riskli kayıtlarla üretilen videoların sosyal medya platformlarında telif itirazı ile karşılaşma olasılığı bulunmaktadır. Bu durum tamamen kullanıcının sorumluluğundadır.\n\n" +
          "UYGULANACAK HUKUK\n\n" +
          "İşbu koşullar Türk Hukuku'na tabidir. Uyuşmazlıklarda Türkiye Cumhuriyeti mahkemeleri yetkilidir.\n\n" +
          "Son güncelleme: Ağustos 2026 · destek@nurstudyo.com",
        kvkk:
          "VERİ SORUMLUSU\n\n" +
          "6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında veri sorumlusu, nurstudyo.com alan adı üzerinden hizmet veren şahıs firmasıdır.\nİletişim: destek@nurstudyo.com\n\n" +
          "İŞLENEN KİŞİSEL VERİLER\n\n" +
          "Google OAuth 2.0 aracılığıyla alınan; ad-soyad, e-posta adresi ve profil fotoğrafı. Kullanım tercihleri yalnızca kullanıcının kendi cihazındaki şifreli yerel depolama alanında (LocalStorage) tutulmaktadır. Üretilen video ve ses içerikleri sunucularımızda saklanmamaktadır.\n\n" +
          "İŞLEME AMAÇLARI VE HUKUKİ DAYANAĞI\n\n" +
          "Kişisel veriler; hesap doğrulama, hizmet sunumu ve ödeme süreçleri amacıyla, KVKK m.5/2-c (sözleşmenin ifası) ve m.5/2-f (meşru menfaat) kapsamında işlenmektedir. Pazarlama amacıyla herhangi bir veri işlenmemektedir.\n\n" +
          "VERİ GÜVENLİĞİ\n\n" +
          "Tüm kullanıcı verileri AES-256 şifreleme ve HMAC imza koruması altında saklanmaktadır. Tarayıcı parmak izi bağlama teknolojisi ile veriler yalnızca orijinal cihazda çözülebilir durumdadır.\n\n" +
          "ÜÇÜNCÜ TARAF AKTARIMLARI\n\n" +
          "Verileriniz; ödeme için PayTR/iyzico, kimlik doğrulama için Google LLC ve altyapı için Cloudflare/Vercel ile paylaşılabilir.\n\n" +
          "HAKLARINIZ (KVKK M.11)\n\n" +
          "Kişisel verilerinize erişim, düzeltme, silme ve itiraz haklarınız bulunmaktadır. destek@nurstudyo.com adresine başvurunuz. Talepler 30 gün içinde yanıtlanır.\n\n" +
          "Son güncelleme: Ağustos 2026 · kvkk.gov.tr",
        privacy:
          "TOPLANAN VERİLER\n\n" +
          "Nûr Stüdyo, kullanıcı tercihlerini ve oturum bilgilerini yalnızca kullanıcının kendi cihazındaki şifreli LocalStorage alanında saklar. Sunucu taraflı kullanıcı davranış kaydı yapılmamaktadır.\n\n" +
          "• Google hesap bilgileri (ad, e-posta, profil fotoğrafı) — yalnızca oturum doğrulama için\n" +
          "• Tema, dil ve arayüz tercihleri — cihaz üzerinde şifreli olarak\n" +
          "• Hizmet bakiyesi ve üyelik durumu — cihaz üzerinde şifreli olarak\n" +
          "• Video üretim geçmişi — cihaz üzerinde, sunucuya gönderilmez\n\n" +
          "ÇEREZ KULLANIMI\n\n" +
          "Platform yalnızca zorunlu teknik çerezler kullanır. Reklamcılık veya kullanıcı takibine yönelik üçüncü taraf çerezleri kullanılmamaktadır.\n\n" +
          "VERİ SAKLAMA SÜRESİ\n\n" +
          "Hesap verileriniz aktif üyelik süresince saklanır. Hesabınızı silmeniz durumunda verileriniz 30 gün içinde sistemden kalıcı olarak temizlenir.\n\n" +
          "Son güncelleme: Ağustos 2026 · destek@nurstudyo.com",
        refund:
          "DİJİTAL HİZMET KAPSAMI\n\n" +
          "Satın alınan birim paketleri ve üyelik planları anında teslim edilen dijital hizmet kapsamındadır.\n\n" +
          "CAYMA HAKKI\n\n" +
          "6502 sayılı TKHK m.49 ve Mesafeli Sözleşmeler Yönetmeliği m.15/1-ğ uyarınca; kullanıcının açık onayıyla anında ifa edilen dijital hizmetlerde cayma hakkı kullanılamaz.\n\n" +
          "KULLANILMAMIŞ BİRİM BAKİYESİ\n\n" +
          "Hiç kullanılmamış bakiyeler için satın alma tarihinden itibaren 7 gün içinde destek@nurstudyo.com adresine başvurulabilir. Kısmen kullanılmış paketler için iade yapılmamaktadır.\n\n" +
          "TEKNİK HATA\n\n" +
          "Ödeme tamamlanmasına rağmen birim tanımlanmamışsa ödeme dekontunuzla destek@nurstudyo.com adresine başvurunuz. 2 iş günü içinde incelenir.\n\n" +
          "ÖDEME GÜVENLİĞİ\n\n" +
          "Ödemeler PCI DSS uyumlu PayTR/iyzico altyapısı üzerinden 256-bit SSL şifrelemesiyle gerçekleştirilmektedir. Kart bilgileri platformumuzda saklanmamaktadır.\n\n" +
          "Son güncelleme: Ağustos 2026 · destek@nurstudyo.com",
      },
    },
    en: {
      legalTitle: "Legal Information",
      legalSubtitle: "Please read the following agreements carefully.",
      legalTabs: {
        tos: "Terms of Service",
        kvkk: "GDPR / KVKK",
        privacy: "Privacy Policy",
        refund: "Refund Policy",
      },
      legalBody: {
        tos:
          "PLATFORM DEFINITION & LIABILITY\n\n" +
          "Nûr Studio (nurstudyo.com) is an AI-powered digital video production platform designed for Islamic content creators. The platform operates as a sole proprietorship providing software-as-a-service and does not claim copyright over any media content.\n\n" +
          "CONTENT RESPONSIBILITY\n\n" +
          "All copyright, licensing and publishing responsibilities arising from the distribution of audio, visual, text and video content produced on the platform to third parties (YouTube, TikTok, Instagram, etc.) belong exclusively to the user. Nûr Studio accepts no legal or criminal liability in this regard.\n\n" +
          "ACCOUNT & ACCESS\n\n" +
          "Google account authentication is required to use platform services. Account security is the user's responsibility. The platform reserves the right to suspend or permanently close accounts that violate terms of service at any time.\n\n" +
          "SERVICE CONTINUITY\n\n" +
          "Nûr Studio does not guarantee uninterrupted service. The service may become temporarily unavailable due to maintenance, updates or unexpected outages. Users cannot claim compensation in such cases.\n\n" +
          "INTELLECTUAL PROPERTY\n\n" +
          "The platform interface, source code, design elements, logo and brand name belong to Nûr Studio. Users are not permitted to reverse engineer, copy, reproduce or republish the platform on another service.\n\n" +
          "RECITER AUDIO & COPYRIGHT\n\n" +
          "Quranic recitation audio files are sourced from third-party providers (EveryAyah, MP3Quran, etc.). Each reciter listing includes an estimated copyright risk percentage. Videos produced with high-risk recordings may face copyright claims on social media platforms. This is entirely the user's responsibility.\n\n" +
          "GOVERNING LAW\n\n" +
          "These terms are governed by the laws of the Republic of Turkey. Turkish courts have exclusive jurisdiction over any disputes.\n\n" +
          "Last updated: August 2026 · support@nurstudyo.com",
        kvkk:
          "DATA CONTROLLER\n\n" +
          "The data controller under applicable data protection regulations is the sole proprietorship operating via nurstudyo.com.\nContact: support@nurstudyo.com\n\n" +
          "PERSONAL DATA COLLECTED\n\n" +
          "Name, email address and profile photo obtained through Google OAuth 2.0. Usage preferences are stored exclusively in encrypted local storage on the user's own device. Produced video and audio content is not stored on our servers.\n\n" +
          "PROCESSING PURPOSES & LEGAL BASIS\n\n" +
          "Personal data is processed for account verification, service delivery and payment processing. No data is processed for marketing purposes.\n\n" +
          "DATA SECURITY\n\n" +
          "All user data is protected with AES-256 encryption and HMAC signature verification. Browser fingerprint binding technology ensures data can only be decrypted on the original device.\n\n" +
          "THIRD-PARTY TRANSFERS\n\n" +
          "Your data may be shared with PayTR/iyzico for payments, Google LLC for authentication, and Cloudflare/Vercel for infrastructure — only to the extent necessary for service delivery.\n\n" +
          "YOUR RIGHTS\n\n" +
          "You have the right to access, correct, delete and object to your personal data. Contact support@nurstudyo.com. Requests are answered within 30 days.\n\n" +
          "Last updated: August 2026",
        privacy:
          "DATA COLLECTED\n\n" +
          "Nûr Studio stores user preferences and session information exclusively in encrypted LocalStorage on the user's own device. No server-side user behavior tracking is performed.\n\n" +
          "• Google account info (name, email, profile photo) — authentication only\n" +
          "• Theme, language and UI preferences — encrypted on device\n" +
          "• Service balance and membership status — encrypted on device\n" +
          "• Video production history — on device only, never sent to servers\n\n" +
          "COOKIE USAGE\n\n" +
          "The platform uses only essential technical cookies. No third-party advertising or user tracking cookies are used. Google Analytics or similar tracking tools are not integrated.\n\n" +
          "DATA RETENTION\n\n" +
          "Account data is retained during active membership. Upon account deletion, your data is permanently removed from the system within 30 days.\n\n" +
          "Last updated: August 2026 · support@nurstudyo.com",
        refund:
          "DIGITAL PRODUCT / SERVICE SCOPE\n\n" +
          "Purchased service packs and membership plans are classified as instantly delivered digital products/services.\n\n" +
          "RIGHT OF WITHDRAWAL\n\n" +
          "In accordance with Turkish Consumer Protection Law and the Distance Contracts Regulation, the right of withdrawal cannot be exercised for digital services that are immediately performed with the user's explicit consent.\n\n" +
          "UNUSED SERVICE BALANCE\n\n" +
          "For completely unused service balances, you may contact support@nurstudyo.com within 7 days of purchase. No refunds are provided for partially used packs.\n\n" +
          "TECHNICAL ISSUES\n\n" +
          "If the purchased service is not activated despite a completed payment, please contact support@nurstudyo.com with your payment receipt. Issues are reviewed within 2 business days.\n\n" +
          "PAYMENT SECURITY\n\n" +
          "Payments are processed through PCI DSS compliant PayTR/iyzico infrastructure with 256-bit SSL encryption. Card information is never stored on our platform.\n\n" +
          "Last updated: August 2026 · support@nurstudyo.com",
      },
    },
    ar: {
      legalTitle: "معلومات قانونية",
      legalSubtitle: "يرجى قراءة الاتفاقيات التالية بعناية.",
      legalTabs: {
        tos: "شروط الخدمة",
        kvkk: "حماية البيانات",
        privacy: "سياسة الخصوصية",
        refund: "سياسة الاسترداد",
      },
      legalBody: {
        tos:
          "تعريف المنصة وحدود المسؤولية\n\n" +
          "نُور ستوديو (nurstudyo.com) هي منصة إنتاج فيديو رقمية مدعومة بالذكاء الاصطناعي مصممة لمنشئي المحتوى الإسلامي. تعمل المنصة كمؤسسة فردية تقدم خدمة البرمجيات ولا تدعي حقوق الطبع والنشر على أي محتوى إعلامي.\n\n" +
          "مسؤولية المحتوى\n\n" +
          "جميع مسؤوليات حقوق الطبع والنشر والترخيص والنشر الناشئة عن توزيع المحتوى المنتج على المنصة إلى أطراف ثالثة تعود حصرياً للمستخدم.\n\n" +
          "الحساب والوصول\n\n" +
          "مطلوب المصادقة عبر حساب Google لاستخدام خدمات المنصة. أمان الحساب مسؤولية المستخدم. تحتفظ المنصة بالحق في تعليق أو إغلاق الحسابات المخالفة.\n\n" +
          "استمرارية الخدمة\n\n" +
          "لا يضمن نُور ستوديو خدمة متواصلة. قد تصبح الخدمة غير متاحة مؤقتاً بسبب الصيانة أو التحديثات أو الانقطاعات غير المتوقعة.\n\n" +
          "القانون المطبق\n\n" +
          "تخضع هذه الشروط لقوانين جمهورية تركيا. المحاكم التركية لها الاختصاص الحصري.\n\n" +
          "آخر تحديث: أغسطس 2026 · support@nurstudyo.com",
        kvkk:
          "مراقب البيانات\n\n" +
          "مراقب البيانات بموجب لوائح حماية البيانات المعمول بها هو المؤسسة الفردية العاملة عبر nurstudyo.com.\n\n" +
          "البيانات الشخصية المجمعة\n\n" +
          "الاسم وعنوان البريد الإلكتروني وصورة الملف الشخصي التي تم الحصول عليها من خلال Google OAuth 2.0. يتم تخزين تفضيلات الاستخدام حصرياً في التخزين المحلي المشفر على جهاز المستخدم.\n\n" +
          "أغراض المعالجة\n\n" +
          "تتم معالجة البيانات الشخصية للتحقق من الحساب وتقديم الخدمة ومعالجة الدفع. لا تتم معالجة أي بيانات لأغراض تسويقية.\n\n" +
          "عمليات النقل إلى أطراف ثالثة\n\n" +
          "قد تتم مشاركة بياناتك مع PayTR/iyzico للمدفوعات وGoogle LLC للمصادقة وCloudflare/Vercel للبنية التحتية.\n\n" +
          "حقوقك\n\n" +
          "لديك الحق في الوصول إلى بياناتك الشخصية وتصحيحها وحذفها والاعتراض عليها. تواصل مع support@nurstudyo.com. يتم الرد على الطلبات خلال 30 يوماً.\n\n" +
          "آخر تحديث: أغسطس 2026",
        privacy:
          "البيانات المجمعة\n\n" +
          "يخزن نُور ستوديو تفضيلات المستخدم ومعلومات الجلسة حصرياً في التخزين المحلي المشفر على جهاز المستخدم. لا يتم إجراء تتبع سلوك المستخدم من جانب الخادم.\n\n" +
          "استخدام ملفات تعريف الارتباط\n\n" +
          "تستخدم المنصة فقط ملفات تعريف الارتباط التقنية الضرورية. لا يتم استخدام ملفات تعريف ارتباط إعلانية أو تتبع من أطراف ثالثة.\n\n" +
          "فترة الاحتفاظ بالبيانات\n\n" +
          "يتم الاحتفاظ ببيانات الحساب أثناء العضوية النشطة. عند حذف الحساب، تتم إزالة بياناتك نهائياً خلال 30 يوماً.\n\n" +
          "آخر تحديث: أغسطس 2026 · support@nurstudyo.com",
        refund:
          "نطاق الخدمة الرقمية\n\n" +
          "تُصنف حزم الجيتون وخطط العضوية المشتراة كخدمات رقمية يتم تسليمها فوراً.\n\n" +
          "حق الانسحاب\n\n" +
          "وفقاً لقانون حماية المستهلك التركي ونظام العقود عن بُعد، لا يمكن ممارسة حق الانسحاب للخدمات الرقمية التي يتم تنفيذها فوراً بموافقة المستخدم الصريحة.\n\n" +
          "الرصيد غير المستخدم\n\n" +
          "للأرصدة غير المستخدمة بالكامل، يمكنك التواصل مع support@nurstudyo.com خلال 7 أيام من الشراء.\n\n" +
          "أمان الدفع\n\n" +
          "تتم معالجة المدفوعات من خلال بنية PayTR/iyzico المتوافقة مع PCI DSS بتشفير SSL 256 بت. لا يتم تخزين معلومات البطاقة على منصتنا أبداً.\n\n" +
          "آخر تحديث: أغسطس 2026 · support@nurstudyo.com",
      },
    },
  };

  const code = String(lang ?? "tr").trim().toLowerCase();
  // ★ ESKİ HATALI SATIR (SİLİNDİ):
  // return legalTranslations[lang] || legalTranslations["en"] || legalTranslations["tr"];
  //
  // ★ YENİ: önce seçili dil, yoksa TR
  return legalTranslations[code] || legalTranslations.tr;
};
