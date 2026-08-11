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

// ★ iyzico güvenli dil:
// UI: ⚡ Üretim hakkı
// Ödeme/KVKK: hizmet bedeli / üretim hakkı
// YASAK kelimeler yok: jeton, kredi, token, coin, kontör, enerji (bakiye hissi)
const tr: PaymentCopy = {
  title: "ÜYELİK & ⚡ ÜRETİM HAKKI",
  balance: "⚡ Üretim hakkı",
  membership: "Üyelik",
  energy: "⚡ Üretim hakkı",
  energyTab: "⚡ Üretim hakkı paketi",
  intro:
    "Abone olmadan tek seferlik ⚡ üretim hakkı paketi satın al — kendi hızında üret.",
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
    "Günlük 40 ⚡ üretim hakkı",
  ],
  elitFeatures: [
    "Tüm hocalar",
    "500 içerik",
    "20 tema",
    "Sınırsız AI arama",
    "Sosyal paylaşım",
    "Tasarım stüdyosu",
    "Günlük 150 ⚡ üretim hakkı",
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
      "Nûr Stüdyo (nurstudyo.com), İslami içerik üreticilerine yönelik yapay zeka destekli dijital video üretim platformudur. Platform yalnızca yazılım aracılık hizmeti sunar.\n\n" +
      "İÇERİK SORUMLULUĞU\n\n" +
      "Üretilen içeriklerin yayın ve telif sorumluluğu kullanıcıya aittir.\n\n" +
      "HESAP VE ERİŞİM\n\n" +
      "Google hesabı ile kimlik doğrulama zorunludur.\n\n" +
      "UYGULANACAK HUKUK\n\n" +
      "Türk Hukuku geçerlidir. Yetkili mahkemeler T.C. mahkemeleridir.\n\n" +
      "Son güncelleme: Ağustos 2026 · destek@nurstudyo.com",
    kvkk:
      "VERİ SORUMLUSU\n\n" +
      "Veri sorumlusu nurstudyo.com üzerinden hizmet veren şahıs firmasıdır.\nİletişim: destek@nurstudyo.com\n\n" +
      "İŞLENEN KİŞİSEL VERİLER\n\n" +
      "Google OAuth ile alınan ad-soyad, e-posta ve profil fotoğrafı; hesap doğrulama ve hizmet sunumu (hizmet bedeli / ödeme süreçleri) için işlenir. Tercihler cihazdaki şifreli LocalStorage'da tutulur.\n\n" +
      "HAKLARINIZ (KVKK m.11)\n\n" +
      "Erişim, düzeltme, silme, itiraz: destek@nurstudyo.com — 30 gün içinde yanıtlanır.\n\n" +
      "Son güncelleme: Ağustos 2026 · kvkk.gov.tr",
    privacy:
      "TOPLANAN VERİLER\n\n" +
      "Oturum ve tercihler yalnızca cihazdaki şifreli LocalStorage'da saklanır.\n\n" +
      "• Google hesap bilgileri — oturum doğrulama\n" +
      "• Tema ve dil tercihleri\n" +
      "• Üretim hakkı bakiyesi ve üyelik durumu (hizmet kullanımı)\n" +
      "• Video üretim geçmişi — cihazda, sunucuya gitmez\n\n" +
      "ÇEREZ: Yalnızca zorunlu teknik çerezler. Reklam çerezi yoktur.\n\n" +
      "Son güncelleme: Ağustos 2026 · destek@nurstudyo.com",
    refund:
      "DİJİTAL ÜRÜN / HİZMET KAPSAMI\n\n" +
      "Satın alınan üretim hakkı paketleri ve üyelik planları, anında ifa edilen dijital ürün/hizmettir. Ödenen tutar hizmet bedelidir.\n\n" +
      "CAYMA HAKKI\n\n" +
      "6502 sayılı TKHK ve Mesafeli Sözleşmeler Yönetmeliği uyarınca; kullanıcının açık onayıyla anında ifa edilen dijital hizmetlerde cayma hakkı kullanılamaz.\n\n" +
      "KULLANILMAMIŞ ÜRETİM HAKKI\n\n" +
      "Hiç kullanılmamış üretim hakkı için satın alma tarihinden itibaren 7 gün içinde destek@nurstudyo.com adresine başvurulabilir. Kısmen kullanılmış paketlerde iade yapılmaz.\n\n" +
      "ÜYELİK İPTALİ\n\n" +
      "Aylık üyelik dönem sonuna kadar sürer. İptal sonrası Free plana düşülür; kalan üretim hakkı bakiyesi korunur.\n\n" +
      "TEKNİK HATA\n\n" +
      "Hizmet bedeli ödenmesine rağmen üretim hakkı tanımlanmamışsa ödeme dekontu ile destek@nurstudyo.com — 2 iş günü.\n\n" +
      "ÖDEME GÜVENLİĞİ\n\n" +
      "Ödemeler PCI DSS uyumlu PayTR/iyzico altyapısı ile 256-bit SSL üzerinden yapılır. Kart bilgisi saklanmaz.\n\n" +
      "Son güncelleme: Ağustos 2026 · destek@nurstudyo.com",
  },
};

const translations: Partial<Record<Lang, PaymentCopy>> = {
  en: {
    ...tr,
    title: "MEMBERSHIP & ⚡ PRODUCTION RIGHTS",
    balance: "⚡ Production rights",
    membership: "Membership",
    energy: "⚡ Production rights",
    energyTab: "⚡ Production rights pack",
    intro:
      "Buy a one-time ⚡ production rights pack without a subscription and create at your own pace.",
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
      "Daily 40 ⚡ production rights",
    ],
    elitFeatures: [
      "All reciters",
      "500 assets",
      "20 themes",
      "Unlimited AI search",
      "Social sharing",
      "Design studio",
      "Daily 150 ⚡ production rights",
      "Priority support",
    ],
    legalTabs: {
      tos: "Terms of Use",
      kvkk: "Data Protection",
      privacy: "Privacy & Cookies",
      refund: "Purchase & Refund",
    },
    legalTitle: "Legal Information",
    legalSubtitle: "nurstudyo.com Corporate Portal",
    legalBody: {
      tos:
        "PLATFORM DEFINITION\n\n" +
        "Nûr Studio is a digital video production platform. Publishing liability is the user's responsibility.\n\n" +
        "Last updated: August 2026 · support@nurstudyo.com",
      kvkk:
        "DATA CONTROLLER\n\n" +
        "Contact: support@nurstudyo.com\n\n" +
        "Personal data (name, email, photo via Google OAuth) is processed for account verification and service delivery (service fee / payment).\n\n" +
        "Last updated: August 2026",
      privacy:
        "DATA COLLECTED\n\n" +
        "Preferences and production-rights balance stored encrypted on device. Essential cookies only.\n\n" +
        "Last updated: August 2026 · support@nurstudyo.com",
      refund:
        "DIGITAL PRODUCT / SERVICE SCOPE\n\n" +
        "Purchased production-rights packs and memberships are instantly delivered digital products/services. The amount paid is a service fee.\n\n" +
        "RIGHT OF WITHDRAWAL\n\n" +
        "Not available for instantly performed digital services with explicit consent under Turkish consumer law.\n\n" +
        "UNUSED PRODUCTION RIGHTS\n\n" +
        "Fully unused rights: contact support@nurstudyo.com within 7 days. Partial use is non-refundable.\n\n" +
        "PAYMENT SECURITY\n\n" +
        "PayTR/iyzico PCI DSS, 256-bit SSL. No card storage.\n\n" +
        "Last updated: August 2026 · support@nurstudyo.com",
    },
  },
  de: {
    ...tr,
    title: "MITGLIEDSCHAFT & ⚡ PRODUKTIONSRECHT",
    balance: "⚡ Produktionsrecht",
    membership: "Mitgliedschaft",
    energy: "⚡ Produktionsrecht",
    energyTab: "⚡ Produktionsrecht-Paket",
    intro: "Kaufe einmalig ⚡ Produktionsrechte ohne Abo.",
    popular: "BELIEBT",
    buy: "Kaufen",
    perMonth: "/ Monat",
    processing: "Wird verarbeitet...",
    currentPlan: "Aktueller Plan",
    proAction: "Zu Pro wechseln",
    elitAction: "Elite werden",
    accept: "Ich akzeptiere die Kaufbedingungen.",
    termsTitle: "Kaufbedingungen",
    termsButton: "Gelesen und akzeptiert",
    packageLabels: ["Start", "Standard", "Mittel", "Groß", "Mega"],
    proFeatures: [
      "15 Rezitatoren",
      "250 Inhalte",
      "20 Themes",
      "1080p ohne Wasserzeichen",
      "Täglich 40 ⚡ Produktionsrechte",
    ],
    elitFeatures: [
      "Alle Rezitatoren",
      "500 Inhalte",
      "Unbegrenzte KI",
      "Täglich 150 ⚡ Produktionsrechte",
      "Priority Support",
    ],
    legalTabs: {
      tos: "Nutzungsbedingungen",
      kvkk: "Datenschutz",
      privacy: "Privatsphäre",
      refund: "Kauf & Erstattung",
    },
    legalTitle: "Rechtliche Informationen",
    legalSubtitle: "nurstudyo.com Portal",
  },
  fr: {
    ...tr,
    title: "ABONNEMENT & ⚡ DROIT DE PRODUCTION",
    balance: "⚡ Droit de production",
    membership: "Abonnement",
    energy: "⚡ Droit de production",
    energyTab: "Pack ⚡ droit de production",
    intro: "Achetez un pack ⚡ droit de production sans abonnement.",
    popular: "POPULAIRE",
    buy: "Acheter",
    perMonth: "/ mois",
    processing: "Traitement...",
    currentPlan: "Plan actuel",
    proAction: "Passer à Pro",
    elitAction: "Devenir Elite",
    accept: "J'accepte les conditions d'achat.",
    termsTitle: "Conditions d'achat",
    termsButton: "Lu et accepté",
    packageLabels: ["Début", "Standard", "Moyen", "Grand", "Mega"],
    proFeatures: [
      "15 récitateur",
      "250 contenus",
      "20 thèmes",
      "1080p sans filigrane",
      "40 ⚡ droits de production/jour",
    ],
    elitFeatures: [
      "Tous les récitateur",
      "500 contenus",
      "IA illimitée",
      "150 ⚡ droits de production/jour",
      "Support prioritaire",
    ],
    legalTabs: {
      tos: "Conditions",
      kvkk: "Données",
      privacy: "Confidentialité",
      refund: "Achat & Remboursement",
    },
    legalTitle: "Informations juridiques",
    legalSubtitle: "Portail nurstudyo.com",
  },
  es: {
    ...tr,
    title: "MEMBRESÍA Y ⚡ DERECHO DE PRODUCCIÓN",
    balance: "⚡ Derecho de producción",
    membership: "Membresía",
    energy: "⚡ Derecho de producción",
    energyTab: "Paquete ⚡ derecho de producción",
    intro: "Compra un paquete ⚡ de derecho de producción sin suscripción.",
    popular: "POPULAR",
    buy: "Comprar",
    perMonth: "/ mes",
    processing: "Procesando...",
    currentPlan: "Plan actual",
    proAction: "Cambiar a Pro",
    elitAction: "Ser Elite",
    accept: "Acepto las condiciones de compra.",
    termsTitle: "Condiciones de compra",
    termsButton: "Leído y aceptado",
    packageLabels: ["Inicio", "Estándar", "Medio", "Grande", "Mega"],
    proFeatures: [
      "15 recitadores",
      "250 contenidos",
      "20 temas",
      "1080p sin marca",
      "40 ⚡ derechos de producción/día",
    ],
    elitFeatures: [
      "Todos los recitadores",
      "500 contenidos",
      "IA ilimitada",
      "150 ⚡ derechos de producción/día",
      "Soporte prioritario",
    ],
    legalTabs: {
      tos: "Términos",
      kvkk: "Datos",
      privacy: "Privacidad",
      refund: "Compra y reembolso",
    },
    legalTitle: "Información legal",
    legalSubtitle: "Portal nurstudyo.com",
  },
  ar: {
    ...tr,
    title: "العضوية و⚡ حق الإنتاج",
    balance: "⚡ حق الإنتاج",
    membership: "العضوية",
    energy: "⚡ حق الإنتاج",
    energyTab: "باقة ⚡ حق الإنتاج",
    intro: "اشترِ باقة ⚡ حق الإنتاج دون اشتراك.",
    popular: "الأكثر شعبية",
    buy: "شراء",
    perMonth: "/ شهر",
    processing: "جارٍ المعالجة...",
    currentPlan: "خطتك الحالية",
    proAction: "الترقية إلى Pro",
    elitAction: "الترقية إلى Elit",
    accept: "أوافق على شروط الشراء.",
    termsTitle: "شروط الشراء",
    termsButton: "قرأت وأوافق",
    packageLabels: ["مبتدئ", "قياسي", "متوسط", "كبير", "ضخم"],
    proFeatures: [
      "15 قارئ",
      "250 محتوى",
      "20 سمة",
      "1080p بدون علامة",
      "40 ⚡ حق إنتاج يومياً",
    ],
    elitFeatures: [
      "جميع القراء",
      "500 محتوى",
      "ذكاء غير محدود",
      "150 ⚡ حق إنتاج يومياً",
      "دعم أولوي",
    ],
    legalTabs: {
      tos: "شروط الاستخدام",
      kvkk: "حماية البيانات",
      privacy: "الخصوصية",
      refund: "الشراء والاسترداد",
    },
    legalTitle: "معلومات قانونية",
    legalSubtitle: "بوابة nurstudyo.com",
  },
  ru: {
    ...tr,
    title: "ПОДПИСКА И ⚡ ПРАВО НА ПРОИЗВОДСТВО",
    balance: "⚡ Право на производство",
    membership: "Подписка",
    energy: "⚡ Право на производство",
    energyTab: "Пакет ⚡ права на производство",
    intro: "Купите пакет ⚡ права на производство без подписки.",
    popular: "ПОПУЛЯРНОЕ",
    buy: "Купить",
    perMonth: "/ мес",
    processing: "Обработка...",
    currentPlan: "Текущий план",
    proAction: "Перейти на Pro",
    elitAction: "Стать Elite",
    accept: "Я принимаю условия покупки.",
    termsTitle: "Условия покупки",
    termsButton: "Прочитано и принято",
    packageLabels: ["Старт", "Стандарт", "Средний", "Большой", "Мега"],
    proFeatures: [
      "15 чтецов",
      "250 материалов",
      "20 тем",
      "1080p без водяного знака",
      "40 ⚡ прав на производство/день",
    ],
    elitFeatures: [
      "Все чтецы",
      "500 материалов",
      "Безлимитный ИИ",
      "150 ⚡ прав на производство/день",
      "Приоритетная поддержка",
    ],
    legalTabs: {
      tos: "Условия",
      kvkk: "Данные",
      privacy: "Конфиденциальность",
      refund: "Покупка и возврат",
    },
    legalTitle: "Правовая информация",
    legalSubtitle: "Портал nurstudyo.com",
  },
  id: {
    ...tr,
    title: "KEANGGOTAAN & ⚡ HAK PRODUKSI",
    balance: "⚡ Hak produksi",
    membership: "Keanggotaan",
    energy: "⚡ Hak produksi",
    energyTab: "Paket ⚡ hak produksi",
    intro: "Beli paket ⚡ hak produksi sekali tanpa langganan.",
    popular: "POPULER",
    buy: "Beli",
    perMonth: "/ bulan",
    processing: "Memproses...",
    currentPlan: "Paket saat ini",
    proAction: "Beralih ke Pro",
    elitAction: "Menjadi Elite",
    accept: "Saya menerima syarat pembelian.",
    termsTitle: "Syarat Pembelian",
    termsButton: "Saya setuju",
    packageLabels: ["Awal", "Standar", "Menengah", "Besar", "Mega"],
    proFeatures: [
      "15 qari",
      "250 konten",
      "20 tema",
      "1080p tanpa watermark",
      "40 ⚡ hak produksi/hari",
    ],
    elitFeatures: [
      "Semua qari",
      "500 konten",
      "AI tanpa batas",
      "150 ⚡ hak produksi/hari",
      "Dukungan prioritas",
    ],
    legalTabs: {
      tos: "Ketentuan",
      kvkk: "Data",
      privacy: "Privasi",
      refund: "Beli & Pengembalian",
    },
    legalTitle: "Informasi Hukum",
    legalSubtitle: "Portal nurstudyo.com",
  },
};

export function getPaymentCopy(lang?: Lang | string | null): PaymentCopy {
  const code = String(lang || "tr").trim().toLowerCase() as Lang;
  if (code === "tr") return tr;
  return translations[code] ?? tr;
}
