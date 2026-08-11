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


export type PaymentCopy = {
  title: string;
  intro: string;
  proAction: string;
  elitAction: string;
  processing: string;
  perMonth: string;
  currentPlan: string;
  accept: string;
  termsTitle: string;
  membershipTab: string;
  energyTab: string;
  buy: string;
  // PremiumModal bu alanları kullanıyor — eksikse siyah ekran (crash)
  proFeatures: string[];
  elitFeatures: string[];
  // Legal modal
  legalTitle: string;
  legalSubtitle: string;
  legalTabs: {
    tos: string;
    kvkk: string;
    privacy: string;
    refund: string;
  };
  legalBody: {
    tos: string;
    kvkk: string;
    privacy: string;
    refund: string;
  };
};

const COPY: Partial<Record<Lang, PaymentCopy>> & {
  tr: PaymentCopy;
  en: PaymentCopy;
} = {
  tr: {
    title: "Premium & Enerji",
    intro:
      "Üyelik planı seçin veya ⚡ Enerji paketi yükleyin. Üretim için enerji gerekir.",
    proAction: "Pro'ya Geç",
    elitAction: "Elit'e Geç",
    processing: "İşleniyor...",
    perMonth: "/ ay",
    currentPlan: "Mevcut Planın",
    accept: "Satın alma koşullarını okudum ve kabul ediyorum.",
    termsTitle: "Satın Alma Koşulları",
    membershipTab: "Üyelik",
    energyTab: "⚡ Enerji",
    buy: "Satın Al",
    proFeatures: [
      "Daha fazla kâri ve atmosfer",
      "Uzun video modu",
      "Filigransız indirme",
      "Metin / başlık yenileme",
      "Günlük 40 ⚡ Enerji",
    ],
    elitFeatures: [
      "Tüm kâri ve premium atmosferler",
      "Tam sürüm + toplu üretim",
      "AI arama ve sosyal paylaşım",
      "Öncelikli render sırası",
      "Günlük 150 ⚡ Enerji",
    ],
    legalTitle: "Yasal Bilgilendirmeler",
    legalSubtitle: "Lütfen aşağıdaki sözleşmeleri dikkatlice okuyunuz.",
    legalTabs: {
      tos: "Kullanım Şartları",
      kvkk: "KVKK",
      privacy: "Gizlilik",
      refund: "İade Politikası",
    },
    legalBody: {
      tos: "Bu web sitesini kullanarak, belirtilen tüm kullanım şartlarını ve koşullarını kabul etmiş sayılursınız. Sunulan hizmetlerin kötüye kullanımı yasaktır.",
      kvkk: "6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca, kişisel verileriniz güvenli bir şekilde işlenmekte ve korunmaktadır.",
      privacy:
        "Gizliliğiniz bizim için önemlidir. Sitemizde toplanan veriler, yalnızca size daha iyi bir hizmet sunabilmek amacıyla kullanılır.",
      refund:
        "Satın alınan dijital hizmetlerin doğası gereği, tamamlanan ve teslim edilen video üretim işlemlerinde ücret iadesi yapılmamaktadır.",
    },
  },
  en: {
    title: "Premium & Energy",
    intro:
      "Choose a membership plan or top up ⚡ Energy. Energy is required for rendering.",
    proAction: "Go Pro",
    elitAction: "Go Elit",
    processing: "Processing...",
    perMonth: "/ mo",
    currentPlan: "Current Plan",
    accept: "I have read and accept the purchase terms.",
    termsTitle: "Purchase Terms",
    membershipTab: "Membership",
    energyTab: "⚡ Energy",
    buy: "Buy",
    proFeatures: [
      "More reciters and atmospheres",
      "Long video mode",
      "No watermark downloads",
      "Text / title refresh",
      "Daily 40 ⚡ Energy",
    ],
    elitFeatures: [
      "All reciters and premium atmospheres",
      "Full duration + batch render",
      "AI search and social share",
      "Priority render queue",
      "Daily 150 ⚡ Energy",
    ],
    legalTitle: "Legal Information",
    legalSubtitle: "Please read the following agreements carefully.",
    legalTabs: {
      tos: "Terms of Service",
      kvkk: "GDPR / KVKK",
      privacy: "Privacy Policy",
      refund: "Refund Policy",
    },
    legalBody: {
      tos: "By using this website, you agree to comply with and be bound by all terms and conditions specified. Misuse of services is strictly prohibited.",
      kvkk: "In accordance with data protection regulations, your personal data is securely processed and protected from unauthorized access.",
      privacy:
        "Your privacy is important to us. Data collected on our site is used solely to optimize and improve your user experience.",
      refund:
        "Due to the digital nature of our services, no refunds are provided for successfully completed and rendered video transactions.",
    },
  },
  ar: {
    title: "بريميوم والطاقة",
    intro: "اختر خطة عضوية أو اشحن ⚡ الطاقة. الطاقة مطلوبة للإنتاج.",
    proAction: "الترقية إلى Pro",
    elitAction: "الترقية إلى Elit",
    processing: "جاري المعالجة...",
    perMonth: "/ شهر",
    currentPlan: "خطتك الحالية",
    accept: "لقد قرأت شروط الشراء وأوافق عليها.",
    termsTitle: "شروط الشراء",
    membershipTab: "العضوية",
    energyTab: "⚡ الطاقة",
    buy: "شراء",
    proFeatures: [
      "المزيد من القراء والخلفيات",
      "وضع الفيديو الطويل",
      "تحميل بدون علامة مائية",
      "تحديث النص / العنوان",
      "40 ⚡ طاقة يومياً",
    ],
    elitFeatures: [
      "جميع القراء والخلفيات المميزة",
      "المدة الكاملة + الإنتاج الجماعي",
      "بحث ذكي ومشاركة اجتماعية",
      "أولوية في قائمة الإنتاج",
      "150 ⚡ طاقة يومياً",
    ],
    legalTitle: "معلومات قانونية",
    legalSubtitle: "يرجى قراءة الاتفاقيات التالية بعناية.",
    legalTabs: {
      tos: "شروط الخدمة",
      kvkk: "حماية البيانات",
      privacy: "سياسة الخصوصية",
      refund: "سياسة الاسترداد",
    },
    legalBody: {
      tos: "باستخدام هذا الموقع، فإنك توافق على الالتزام بجميع الشروط والأحكام المحددة. يمنع إساءة استخدام الخدمات.",
      kvkk: "وفقًا للوائح حماية البيانات الشخصية، يتم معالجة بياناتك وحمايتها بشكل آمن تماماً.",
      privacy:
        "خصوصيتك تهمنا. تُستخدم البيانات التي نجمعها فقط لتحسين تجربة المستخدم الخاصة بك.",
      refund:
        "نظراً لطبيعة الخدمات الرقمية، لا يمكن إعادة الأموال بعد إتمام عملية إنتاج الفيديو وتوصيله بنجاح.",
    },
  },
};

export function getPaymentCopy(lang: Lang = "tr"): PaymentCopy {
  return COPY[lang] || COPY.en || COPY.tr;
}
