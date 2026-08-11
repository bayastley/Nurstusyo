import type { Lang } from "../i18n";

export interface PaymentCopy {
  title: string;
  balance: string;
  membership: string;
  energy: string;
  energyTab: string;
  intro: string;
  popular: string;
  buy: string;
  perMonth: string;
  processing: string;
  currentPlan: string;
  proAction: string;
  elitAction: string;
  accept: string;
  termsTitle: string;
  termsButton: string;
  packageLabels: string[];
  proFeatures: string[];
  elitFeatures: string[];
  legalTabs: { tos: string; kvkk: string; privacy: string; refund: string };
  legalTitle: string;
  legalSubtitle: string;
  legalBody: { tos: string; kvkk: string; privacy: string; refund: string };
}

const tr: PaymentCopy = {
  title: "ÜYELİK & ⚡ ENERJİ",
  balance: "⚡ Enerji",
  membership: "Üyelik",
  energy: "⚡ Enerji",
  energyTab: "⚡ Enerji Paketi",
  intro: "Abone olmadan, tek seferlik ⚡ Enerji satın al - kendi hızında üret.",
  popular: "POPÜLER",
  buy: "Satın Al",
  perMonth: "/ ay",
  processing: "İşleniyor...",
  currentPlan: "Mevcut planın",
  proAction: "Pro'ya Geç",
  elitAction: "Elit Ol",
  accept: "Satın alma koşullarını okudum ve kabul ediyorum.",
  termsTitle: "Satın Alma Koşulları",
  termsButton: "Okudum, kabul ediyorum",
  packageLabels: ["Başlangıç", "Standart", "Orta", "Büyük", "Dev"],
  proFeatures: [
    "15 hoca",
    "250 içerik",
    "20 tema",
    "1080p filigransız üretim",
    "Sinematik filtreler",
    "AI yazı yenileme",
    "Günlük 40 ⚡ Enerji",
  ],
  elitFeatures: [
    "Tüm hocalar",
    "500 içerik",
    "20 tema",
    "Sınırsız AI arama",
    "Sosyal paylaşım",
    "Tasarım stüdyosu",
    "Günlük 150 ⚡ Enerji",
    "Öncelikli destek",
  ],
  legalTabs: {
    tos: "Kullanım Şartları",
    kvkk: "KVKK Aydınlatma",
    privacy: "Gizlilik & Çerez",
    refund: "Satın Alma & İade",
  },
  legalTitle: "Yasal Bilgilendirme ve Sözleşmeler",
  legalSubtitle: "nurstudyo.com Kurumsal Sözleşme Portalı",
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
      "Platformda sunulan kâri (Kur'an okuyucusu) ses kayıtları üçüncü parti kaynaklardan (EveryAyah, MP3Quran vb.) temin edilmektedir. Her kâri kaydının yanında tahmini telif riski yüzdesi belirtilmiştir. Yüksek telif riskli kayıtlarla üretilen videoların sosyal medya platformlarında telif itirazı ile karşılaşma olasılığı bulunmaktadır. Bu durum tamamen kullanıcının sorumluluğundadır.\n\n" +
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
      "Tüm kullanıcı verileri AES-256 şifreleme ve HMAC imza koruması altında saklanmaktadır. Tarayıcı parmak izi bağlama teknolojisi ile veriler yalnızca orijinal cihazda çözülebilir durumdadır. Sunucu tarafında kişisel veri saklanmamaktadır.\n\n" +
      "ÜÇÜNCÜ TARAF AKTARIMLARI\n\n" +
      "Verileriniz; ödeme için PayTR/iyzico, kimlik doğrulama için Google LLC ve altyapı için Cloudflare/Vercel ile paylaşılabilir. Bu aktarımlar yalnızca hizmetin ifası için zorunlu olduğu ölçüde gerçekleştirilmektedir.\n\n" +
      "VERİ SAKLAMA SÜRESİ\n\n" +
      "Kişisel veriler, hesap aktif olduğu süre boyunca saklanır. Hesap silinmesi halinde tüm veriler 30 gün içinde kalıcı olarak imha edilir.\n\n" +
      "HAKLARINIZ (KVKK M.11)\n\n" +
      "Kişisel verilerinize erişim, düzeltme, silme ve itiraz haklarınız bulunmaktadır. destek@nurstudyo.com adresine başvurunuz. Talepler 30 gün içinde yanıtlanır.\n\n" +
      "Son güncelleme: Ağustos 2026 · kvkk.gov.tr",

    privacy:
      "TOPLANAN VERİLER\n\n" +
      "Nûr Stüdyo, kullanıcı tercihlerini ve oturum bilgilerini yalnızca kullanıcının kendi cihazındaki şifreli LocalStorage alanında saklar. Sunucu taraflı kullanıcı davranış kaydı yapılmamaktadır. Toplanan veriler şunlardır:\n\n" +
      "• Google hesap bilgileri (ad, e-posta, profil fotoğrafı) — yalnızca oturum doğrulama için\n" +
      "• Tema, dil ve arayüz tercihleri — cihaz üzerinde şifreli olarak\n" +
      "• Enerji bakiyesi ve üyelik durumu — cihaz üzerinde şifreli olarak\n" +
      "• Video üretim geçmişi — cihaz üzerinde, sunucuya gönderilmez\n\n" +
      "ÇEREZ KULLANIMI\n\n" +
      "Platform yalnızca zorunlu teknik çerezler kullanır. Reklamcılık veya kullanıcı takibine yönelik üçüncü taraf çerezleri kullanılmamaktadır. Google Analytics veya benzeri izleme araçları entegre edilmemiştir.\n\n" +
      "YEREL DEPOLAMA GÜVENLİĞİ\n\n" +
      "Cihazda saklanan tüm veriler AES-256 şifreleme ile korunmaktadır. HMAC imza doğrulaması ve tarayıcı parmak izi bağlama teknolojisi ile verilerin başka bir cihaza kopyalanması veya manipüle edilmesi tespit edilir ve engellenir.\n\n" +
      "VERİ SAKLAMA SÜRESİ\n\n" +
      "Hesap verileriniz aktif üyelik süresince saklanır. Hesabınızı silmeniz durumunda verileriniz 30 gün içinde sistemden kalıcı olarak temizlenir. Tarayıcı verilerini istediğiniz zaman cihazınızdan kendiniz silebilirsiniz.\n\n" +
      "ÜÇÜNCÜ TARAF HİZMETLER\n\n" +
      "Platform aşağıdaki üçüncü taraf hizmetlerini kullanmaktadır:\n" +
      "• Google OAuth 2.0 — kimlik doğrulama\n" +
      "• Cloudflare R2 — video ve görsel CDN altyapısı\n" +
      "• Vercel — uygulama barındırma\n" +
      "• PayTR / iyzico — ödeme işlemleri\n" +
      "• EveryAyah / MP3Quran — Kur'an ses kaynakları\n\n" +
      "Bu hizmetlerin kendi gizlilik politikaları geçerlidir.\n\n" +
      "Son güncelleme: Ağustos 2026 · destek@nurstudyo.com",

    refund:
      "DİJİTAL HİZMET KAPSAMI\n\n" +
      "Satın alınan hizmet paketleri ve üyelik planları anında teslim edilen dijital hizmet kapsamındadır.\n\n" +
      "CAYMA HAKKI\n\n" +
      "6502 sayılı TKHK m.49 ve Mesafeli Sözleşmeler Yönetmeliği m.15/1-ğ uyarınca; kullanıcının açık onayıyla anında ifa edilen dijital hizmetlerde cayma hakkı kullanılamaz.\n\n" +
      "KULLANILMAMIŞ HİZMET BAKİYESİ\n\n" +
      "Hiç kullanılmamış bakiyeler için satın alma tarihinden itibaren 7 gün içinde destek@nurstudyo.com adresine başvurulabilir. Kısmen kullanılmış paketler için iade yapılmamaktadır.\n\n" +
      "ÜYELİK İPTALİ\n\n" +
      "Aylık üyelikler dönem sonuna kadar aktif kalır. İptal talebi bir sonraki dönemin başlangıcından önce yapılmalıdır. Mevcut dönem için kısmi iade yapılmaz. İptal sonrası hesabınız ücretsiz (Free) plana düşer ve mevcut ⚡ Enerji bakiyeniz korunur.\n\n" +
      "TEKNİK HATA\n\n" +
      "Ödeme tamamlanmasına rağmen hizmet tanımlanmamışsa ödeme dekontunuzla destek@nurstudyo.com adresine başvurunuz. 2 iş günü içinde incelenir.\n\n" +
      "ÖDEME GÜVENLİĞİ\n\n" +
      "Ödemeler PCI DSS uyumlu PayTR/iyzico altyapısı üzerinden 256-bit SSL şifrelemesiyle gerçekleştirilmektedir. Kart bilgileri platformumuzda saklanmamaktadır.\n\n" +
      "İADE SÜRECİ\n\n" +
      "Uygun bulunan iade talepleri, başvuru tarihinden itibaren 10 iş günü içinde orijinal ödeme yöntemine iade edilir. Banka işlem süreleri ek süre gerektirebilir.\n\n" +
      "Son güncelleme: Ağustos 2026 · destek@nurstudyo.com",
  },
};

const translations: Partial<Record<Lang, PaymentCopy>> = {
  en: {
    ...tr,
    title: "MEMBERSHIP & ⚡ ENERGY",
    balance: "⚡ Energy",
    membership: "Membership",
    energy: "⚡ Energy",
    energyTab: "⚡ Energy Packages",
    intro: "Buy one-time ⚡ Energy without a subscription and create at your own pace.",
    popular: "POPULAR",
    buy: "Buy",
    perMonth: "/ month",
    processing: "Processing...",
    currentPlan: "Current plan",
    proAction: "Switch to Pro",
    elitAction: "Go Elite",
    accept: "I have read and accept the purchase terms.",
    termsTitle: "Purchase Terms",
    termsButton: "I have read and accept",
    packageLabels: ["Starter", "Standard", "Medium", "Large", "Mega"],
    proFeatures: [
      "15 reciters",
      "250 assets",
      "20 themes",
      "1080p watermark-free",
      "Cinematic filters",
      "AI text refresh",
      "Daily 40 ⚡ Energy",
    ],
    elitFeatures: [
      "All reciters",
      "500 assets",
      "20 themes",
      "Unlimited AI search",
      "Social sharing",
      "Design studio",
      "Daily 150 ⚡ Energy",
      "Priority support",
    ],
    legalTabs: {
      tos: "Terms of Use",
      kvkk: "Data Protection",
      privacy: "Privacy & Cookies",
      refund: "Purchase & Refund",
    },
    legalTitle: "Legal Information & Agreements",
    legalSubtitle: "nurstudyo.com Corporate Agreement Portal",
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
        "Name, email address and profile photo obtained through Google OAuth 2.0. Usage preferences are stored exclusively in encrypted local storage (LocalStorage) on the user's own device. Produced video and audio content is not stored on our servers.\n\n" +
        "PROCESSING PURPOSES & LEGAL BASIS\n\n" +
        "Personal data is processed for account verification, service delivery and payment processing. No data is processed for marketing purposes.\n\n" +
        "DATA SECURITY\n\n" +
        "All user data is protected with AES-256 encryption and HMAC signature verification. Browser fingerprint binding technology ensures data can only be decrypted on the original device. No personal data is stored server-side.\n\n" +
        "THIRD-PARTY TRANSFERS\n\n" +
        "Your data may be shared with PayTR/iyzico for payments, Google LLC for authentication, and Cloudflare/Vercel for infrastructure — only to the extent necessary for service delivery.\n\n" +
        "DATA RETENTION\n\n" +
        "Personal data is retained while the account remains active. Upon account deletion, all data is permanently destroyed within 30 days.\n\n" +
        "YOUR RIGHTS\n\n" +
        "You have the right to access, correct, delete and object to your personal data. Contact support@nurstudyo.com. Requests are answered within 30 days.\n\n" +
        "Last updated: August 2026",

      privacy:
        "DATA COLLECTED\n\n" +
        "Nûr Studio stores user preferences and session information exclusively in encrypted LocalStorage on the user's own device. No server-side user behavior tracking is performed. Collected data includes:\n\n" +
        "• Google account info (name, email, profile photo) — authentication only\n" +
        "• Theme, language and UI preferences — encrypted on device\n" +
        "• Energy balance and membership status — encrypted on device\n" +
        "• Video production history — on device only, never sent to servers\n\n" +
        "COOKIE USAGE\n\n" +
        "The platform uses only essential technical cookies. No third-party advertising or user tracking cookies are used. Google Analytics or similar tracking tools are not integrated.\n\n" +
        "LOCAL STORAGE SECURITY\n\n" +
        "All data stored on the device is protected with AES-256 encryption. HMAC signature verification and browser fingerprint binding technology detect and prevent data copying or manipulation across devices.\n\n" +
        "DATA RETENTION\n\n" +
        "Account data is retained during active membership. Upon account deletion, your data is permanently removed from the system within 30 days. You can delete browser data from your device at any time.\n\n" +
        "THIRD-PARTY SERVICES\n\n" +
        "The platform uses the following third-party services:\n" +
        "• Google OAuth 2.0 — authentication\n" +
        "• Cloudflare R2 — video and image CDN\n" +
        "• Vercel — application hosting\n" +
        "• PayTR / iyzico — payment processing\n" +
        "• EveryAyah / MP3Quran — Quran audio sources\n\n" +
        "Their respective privacy policies apply.\n\n" +
        "Last updated: August 2026 · support@nurstudyo.com",

      refund:
        "DIGITAL SERVICE SCOPE\n\n" +
        "Purchased service packages and membership plans are classified as instantly delivered digital services.\n\n" +
        "RIGHT OF WITHDRAWAL\n\n" +
        "In accordance with Turkish Consumer Protection Law and the Distance Contracts Regulation, the right of withdrawal cannot be exercised for digital services that are immediately performed with the user's explicit consent.\n\n" +
        "UNUSED SERVICE BALANCE\n\n" +
        "For completely unused balances, you may contact support@nurstudyo.com within 7 days of purchase. No refunds are provided for partially used packages.\n\n" +
        "MEMBERSHIP CANCELLATION\n\n" +
        "Monthly memberships remain active until the end of the current period. Cancellation requests must be made before the start of the next billing period. No partial refunds for the current period. After cancellation, your account reverts to the Free plan and your existing ⚡ Energy balance is preserved.\n\n" +
        "TECHNICAL ISSUES\n\n" +
        "If services are not credited despite a completed payment, please contact support@nurstudyo.com with your payment receipt. Issues are reviewed within 2 business days.\n\n" +
        "PAYMENT SECURITY\n\n" +
        "Payments are processed through PCI DSS compliant PayTR/iyzico infrastructure with 256-bit SSL encryption. Card information is never stored on our platform.\n\n" +
        "REFUND PROCESS\n\n" +
        "Approved refund requests are returned to the original payment method within 10 business days. Bank processing times may require additional time.\n\n" +
        "Last updated: August 2026 · support@nurstudyo.com",
    },
  },
  ar: {
    ...tr,
    title: "العضوية و⚡ الطاقة",
    balance: "⚡ الطاقة",
    membership: "العضوية",
    energy: "⚡ الطاقة",
    energyTab: "حزم ⚡ الطاقة",
    intro: "اشترِ ⚡ الطاقة دون اشتراك وأنشئ بإيقاعك.",
    popular: "الأكثر شعبية",
    buy: "شراء",
    perMonth: "/ شهر",
    processing: "جارٍ المعالجة...",
    currentPlan: "خطتك الحالية",
    proAction: "الترقية إلى Pro",
    elitAction: "الترقية إلى Elit",
    accept: "لقد قرأت شروط الشراء وأوافق عليها.",
    termsTitle: "شروط الشراء",
    termsButton: "قرأت وأوافق",
    packageLabels: ["مبتدئ", "قياسي", "متوسط", "كبير", "ضخم"],
    proFeatures: [
      "15 قارئ",
      "250 محتوى",
      "20 سمة",
      "إنتاج 1080p بدون علامة مائية",
      "مرشحات سينمائية",
      "تجديد النص بالذكاء الاصطناعي",
      "40 ⚡ طاقة يومياً",
    ],
    elitFeatures: [
      "جميع القراء",
      "500 محتوى",
      "20 سمة",
      "بحث ذكي غير محدود",
      "مشاركة اجتماعية",
      "استوديو التصميم",
      "150 ⚡ طاقة يومياً",
      "دعم أولوي",
    ],
    legalTabs: {
      tos: "شروط الاستخدام",
      kvkk: "حماية البيانات",
      privacy: "الخصوصية وملفات تعريف الارتباط",
      refund: "الشراء والاسترداد",
    },
    legalTitle: "المعلومات القانونية والاتفاقيات",
    legalSubtitle: "بوابة الاتفاقيات المؤسسية لـ nurstudyo.com",
    legalBody: {
      tos:
        "تعريف المنصة وحدود المسؤولية\n\n" +
        "نُور ستوديو (nurstudyo.com) هي منصة إنتاج فيديو رقمية مدعومة بالذكاء الاصطناعي مصممة لمنشئي المحتوى الإسلامي. تعمل المنصة كمؤسسة فردية تقدم خدمة البرمجيات ولا تدعي حقوق الطبع والنشر على أي محتوى إعلامي.\n\n" +
        "مسؤولية المحتوى\n\n" +
        "جميع مسؤوليات حقوق الطبع والنشر والترخيص والنشر الناشئة عن توزيع المحتوى المنتج على المنصة إلى أطراف ثالثة (يوتيوب، تيك توك، إنستغرام، إلخ) تعود حصرياً للمستخدم.\n\n" +
        "الحساب والوصول\n\n" +
        "مطلوب المصادقة عبر حساب Google لاستخدام خدمات المنصة. أمان الحساب مسؤولية المستخدم. تحتفظ المنصة بالحق في تعليق أو إغلاق الحسابات التي تنتهك شروط الخدمة.\n\n" +
        "القانون المطبق\n\n" +
        "تخضع هذه الشروط لقوانين جمهورية تركيا.\n\n" +
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
        "لديك الحق في الوصول إلى بياناتك الشخصية وتصحيحها وحذفها والاعتراض عليها. تواصل مع support@nurstudyo.com.\n\n" +
        "آخر تحديث: أغسطس 2026",

      privacy:
        "البيانات المجمعة\n\n" +
        "يخزن نُور ستوديو تفضيلات المستخدم ومعلومات الجلسة حصرياً في التخزين المحلي المشفر على جهاز المستخدم. لا يتم إجراء تتبع سلوك المستخدم من جانب الخادم.\n\n" +
        "استخدام ملفات تعريف الارتباط\n\n" +
        "تستخدم المنصة فقط ملفات تعريف الارتباط التقنية الضرورية. لا يتم استخدام ملفات تعريف ارتباط إعلانية أو تتبع من أطراف ثالثة.\n\n" +
        "أمان التخزين المحلي\n\n" +
        "جميع البيانات المخزنة على الجهاز محمية بتشفير AES-256. تكتشف تقنية التحقق من توقيع HMAC وربط بصمة المتصفح أي نسخ أو تلاعب بالبيانات.\n\n" +
        "فترة الاحتفاظ بالبيانات\n\n" +
        "يتم الاحتفاظ ببيانات الحساب أثناء العضوية النشطة. عند حذف الحساب، تتم إزالة بياناتك نهائياً خلال 30 يوماً.\n\n" +
        "آخر تحديث: أغسطس 2026 · support@nurstudyo.com",

      refund:
        "نطاق الخدمة الرقمية\n\n" +
        "تُصنف حزم الخدمات وخطط العضوية المشتراة كخدمات رقمية يتم تسليمها فوراً.\n\n" +
        "حق الانسحاب\n\n" +
        "وفقاً لقانون حماية المستهلك التركي ونظام العقود عن بُعد، لا يمكن ممارسة حق الانسحاب للخدمات الرقمية التي يتم تنفيذها فوراً بموافقة المستخدم الصريحة.\n\n" +
        "الرصيد غير المستخدم\n\n" +
        "للأرصدة غير المستخدمة بالكامل، يمكنك التواصل مع support@nurstudyo.com خلال 7 أيام من الشراء. لا تتم عمليات استرداد للحزم المستخدمة جزئياً.\n\n" +
        "إلغاء العضوية\n\n" +
        "تظل العضويات الشهرية نشطة حتى نهاية الفترة الحالية. بعد الإلغاء، يعود حسابك إلى الخطة المجانية ويتم الحفاظ على رصيد ⚡ الطاقة الحالي.\n\n" +
        "أمان الدفع\n\n" +
        "تتم معالجة المدفوعات من خلال بنية PayTR/iyzico المتوافقة مع PCI DSS بتشفير SSL 256 بت. لا يتم تخزين معلومات البطاقة على منصتنا أبداً.\n\n" +
        "آخر تحديث: أغسطس 2026 · support@nurstudyo.com",
    },
  },
  de: {
    ...tr,
    title: "MITGLIEDSCHAFT & ⚡ ENERGIE",
    balance: "⚡ Energie",
    membership: "Mitgliedschaft",
    energy: "⚡ Energie",
    energyTab: "⚡ Energiepakete",
    intro: "Kaufe ⚡ Energie ohne Abo und produziere in deinem Tempo.",
    popular: "BELIEBT",
    buy: "Kaufen",
    perMonth: "/ Monat",
    processing: "Wird verarbeitet...",
    currentPlan: "Aktueller Plan",
    proAction: "Zu Pro wechseln",
    elitAction: "Elite werden",
    accept: "Ich habe die Kaufbedingungen gelesen und akzeptiere sie.",
    termsTitle: "Kaufbedingungen",
    termsButton: "Gelesen und akzeptiert",
    legalTabs: {
      tos: "Nutzungsbedingungen",
      kvkk: "Datenschutz",
      privacy: "Privatsphäre & Cookies",
      refund: "Kauf & Erstattung",
    },
    legalTitle: "Rechtliche Informationen",
    legalSubtitle: "nurstudyo.com Unternehmensportal",
  },
  fr: {
    ...tr,
    title: "ABONNEMENT & ⚡ ÉNERGIE",
    balance: "⚡ Énergie",
    membership: "Abonnement",
    energy: "⚡ Énergie",
    energyTab: "Packs ⚡ Énergie",
    intro: "Achetez de l'⚡ Énergie sans abonnement et créez à votre rythme.",
    popular: "POPULAIRE",
    buy: "Acheter",
    perMonth: "/ mois",
    processing: "Traitement...",
    currentPlan: "Plan actuel",
    proAction: "Passer à Pro",
    elitAction: "Devenir Elite",
    accept: "J'ai lu et j'accepte les conditions d'achat.",
    termsTitle: "Conditions d'achat",
    termsButton: "Lu et accepté",
    legalTabs: {
      tos: "Conditions d'utilisation",
      kvkk: "Protection des données",
      privacy: "Confidentialité & Cookies",
      refund: "Achat & Remboursement",
    },
    legalTitle: "Informations juridiques",
    legalSubtitle: "Portail d'entreprise nurstudyo.com",
  },
  es: {
    ...tr,
    title: "MEMBRESÍA Y ⚡ ENERGÍA",
    balance: "⚡ Energía",
    membership: "Membresía",
    energy: "⚡ Energía",
    energyTab: "Paquetes de ⚡ Energía",
    intro: "Compra ⚡ Energía sin suscripción y crea a tu ritmo.",
    popular: "POPULAR",
    buy: "Comprar",
    perMonth: "/ mes",
    processing: "Procesando...",
    currentPlan: "Plan actual",
    proAction: "Cambiar a Pro",
    elitAction: "Ser Elite",
    accept: "He leído y acepto las condiciones de compra.",
    termsTitle: "Condiciones de compra",
    termsButton: "Leído y aceptado",
    legalTabs: {
      tos: "Términos de uso",
      kvkk: "Protección de datos",
      privacy: "Privacidad y Cookies",
      refund: "Compra y reembolso",
    },
    legalTitle: "Información legal",
    legalSubtitle: "Portal corporativo nurstudyo.com",
  },
};

export function getPaymentCopy(lang: Lang): PaymentCopy {
  return translations[lang] ?? tr;
}
