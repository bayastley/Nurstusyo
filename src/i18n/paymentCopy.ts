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
  intro:
    "Abone olmadan, tek seferlik ⚡ Enerji satın al - kendi hızında üret.",
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
    tos: `PLATFORM TANIMI VE SORUMLULUK SINIRI

Nûr Stüdyo (nurstudyo.com), İslami içerik üreticilerine yönelik yapay zeka destekli dijital video üretim platformudur. Platform; şahıs firması olarak kurulmuş olup yalnızca yazılım aracılık hizmeti sunmakta, herhangi bir medya içeriği telif hakkı iddiasında bulunmamaktadır.

İÇERİK SORUMLULUĞU

Platformda üretilen tüm ses, görüntü, metin ve video içeriklerin üçüncü taraflara (YouTube, TikTok, Instagram vb.) yayınlanmasından doğan her türlü telif, lisans ve yayın sorumluluğu münhasıran kullanıcıya aittir. Nûr Stüdyo bu kapsamda hiçbir hukuki ya da cezai sorumluluk kabul etmez.

HESAP VE ERİŞİM

Platform hizmetlerinden yararlanmak için Google hesabı ile kimlik doğrulama zorunludur. Hesabın güvenliği kullanıcının sorumluluğundadır. Platform, herhangi bir zamanda hizmet koşullarına aykırı davranan hesapları askıya alma ya da kalıcı kapatma hakkını saklı tutar.

HİZMET SÜREKLİLİĞİ

Nûr Stüdyo hizmet sürekliliğini garanti etmez. Teknik bakım, güncelleme veya beklenmedik kesintiler nedeniyle hizmet geçici olarak kullanılamaz duruma gelebilir. Bu tür durumlarda kullanıcı tazminat talebinde bulunamaz.

UYGULANACAK HUKUK

İşbu koşullar Türk Hukuku'na tabidir. Uyuşmazlıklarda Türkiye Cumhuriyeti mahkemeleri yetkilidir.

Son güncelleme: Ağustos 2026 · destek@nurstudyo.com`,
    kvkk: `VERİ SORUMLUSU

Veri sorumlusu, nurstudyo.com alan adı üzerinden hizmet veren şahıs firmasıdır.
İletişim: destek@nurstudyo.com

İŞLENEN KİŞİSEL VERİLER

Google OAuth 2.0 aracılığıyla alınan; ad-soyad, e-posta adresi ve profil fotoğrafı. Kullanım tercihleri yalnızca kullanıcının kendi cihazındaki şifreli yerel depolama alanında (LocalStorage) tutulmaktadır. Üretilen video ve ses içerikleri sunucularımızda saklanmamaktadır.

İŞLEME AMAÇLARI VE HUKUKİ DAYANAĞI

Kişisel veriler; hesap doğrulama, hizmet sunumu ve ödeme süreçleri amacıyla, KVKK m.5/2-c (sözleşmenin ifası) ve m.5/2-f (meşru menfaat) kapsamında işlenmektedir. Pazarlama amacıyla herhangi bir veri işlenmemektedir.

ÜÇÜNCÜ TARAF AKTARIMLARI

Verileriniz; ödeme için PayTR/İyzico, kimlik doğrulama için Google LLC ve altyapı için Cloudflare/Vercel ile paylaşılabilir.

HAKLARINIZ (KVKK M.11)

Kişisel verilerinize erişim, düzeltme, silme ve itiraz haklarınız bulunmaktadır. destek@nurstudyo.com adresine başvurunuz. Talepler 30 gün içinde yanıtlanır.

Son güncelleme: Ağustos 2026 · kvkk.gov.tr`,
    privacy: `TOPLANAN VERİLER

Nûr Stüdyo, kullanıcı tercihlerini ve oturum bilgilerini yalnızca kullanıcının kendi cihazındaki şifreli LocalStorage alanında saklar. Sunucu taraflı kullanıcı davranış kaydı yapılmamaktadır.

ÇEREZ KULLANIMI

Platform yalnızca zorunlu teknik çerezler kullanır. Reklamcılık veya kullanıcı takibine yönelik üçüncü taraf çerezleri kullanılmamaktadır.

VERİ SAKLAMA SÜRESİ

Hesap verileriniz aktif üyelik süresince saklanır. Hesabınızı silmeniz durumunda verileriniz 30 gün içinde sistemden kalıcı olarak temizlenir.

Son güncelleme: Ağustos 2026 · destek@nurstudyo.com`,
    refund: `DİJİTAL HİZMET KAPSAMI

Satın alınan jeton paketleri ve üyelik planları anında teslim edilen dijital hizmet kapsamındadır.

CAYMA HAKKI

6502 sayılı TKHK m.49 ve Mesafeli Sözleşmeler Yönetmeliği m.15/1-ğ uyarınca; kullanıcının açık onayıyla anında ifa edilen dijital hizmetlerde cayma hakkı kullanılamaz.

KULLANILMAMIŞ JETON BAKİYESİ

Hiç kullanılmamış bakiyeler için satın alma tarihinden itibaren 7 gün içinde destek@nurstudyo.com adresine başvurulabilir. Kısmen kullanılmış paketler için iade yapılmamaktadır.

TEKNİK HATA

Ödeme tamamlanmasına rağmen jeton tanımlanmamışsa ödeme dekontunuzla destek@nurstudyo.com adresine başvurunuz. 2 iş günü içinde incelenir.

ÖDEME GÜVENLİĞİ

Ödemeler PCI DSS uyumlu PayTR/İyzico altyapısı üzerinden 256-bit SSL şifrelemesiyle gerçekleştirilmektedir. Kart bilgileri platformumuzda saklanmamaktadır.

Son güncelleme: Ağustos 2026 · destek@nurstudyo.com`,
  },
};

const translations: Partial<Record<Lang, PaymentCopy>> = {
  en: {
    ...tr,
    title: "MEMBERSHIP & ⚡ ENERGY",
    balance: "⚡ Energy",
    membership: "Membership",
    energyTab: "⚡ Energy Packages",
    intro:
      "Buy one-time ⚡ Energy without a subscription and create at your own pace.",
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
    legalTabs: {
      tos: "Terms of Use",
      kvkk: "Data Notice",
      privacy: "Privacy & Cookies",
      refund: "Purchase & Refund",
    },
    legalTitle: "Legal Information",
    legalSubtitle: "nurstudyo.com Corporate Portal",
    legalBody: {
      tos: `PLATFORM DEFINITION AND LIABILITY LIMIT

Nûr Studio (nurstudyo.com) is an AI-assisted digital video production platform for Islamic content creators. The platform operates as a sole proprietorship and provides software intermediary services only; it does not claim copyright over any media content.

CONTENT LIABILITY

All liability arising from publishing audio, visual, text and video content produced on the platform to third parties (YouTube, TikTok, Instagram, etc.), including copyright, licensing and distribution, belongs exclusively to the user. Nûr Studio accepts no legal or criminal liability in this regard.

ACCOUNT AND ACCESS

Identity verification via Google account is required to use platform services. Account security is the user's responsibility. The platform reserves the right to suspend or permanently close accounts that violate the terms of service at any time.

SERVICE CONTINUITY

Nûr Studio does not guarantee uninterrupted service. The service may temporarily become unavailable due to maintenance, updates or unexpected outages. Users may not claim compensation in such cases.

APPLICABLE LAW

These terms are governed by the laws of the Republic of Türkiye. Turkish courts have jurisdiction over disputes.

Last update: August 2026 · destek@nurstudyo.com`,
      kvkk: `DATA CONTROLLER

The data controller is the sole proprietorship operating under nurstudyo.com.
Contact: destek@nurstudyo.com

PERSONAL DATA PROCESSED

Name, email address and profile photo obtained via Google OAuth 2.0. Usage preferences are stored only in encrypted local storage (LocalStorage) on the user's device. Produced video and audio content is not stored on our servers.

PURPOSES AND LEGAL BASIS

Personal data is processed for account verification, service delivery and payment processes under KVKK Art. 5/2-c (performance of contract) and Art. 5/2-f (legitimate interest). No data is processed for marketing purposes.

THIRD-PARTY TRANSFERS

Your data may be shared with PayTR/iyzico for payments, Google LLC for identity verification, and Cloudflare/Vercel for infrastructure.

YOUR RIGHTS (KVKK ART. 11)

You have the right to access, correct, delete and object regarding your personal data. Contact destek@nurstudyo.com. Requests are answered within 30 days.

Last update: August 2026 · kvkk.gov.tr`,
      privacy: `DATA COLLECTED

Nûr Studio stores user preferences and session data only in encrypted LocalStorage on the user's own device. No server-side user behaviour logging is performed.

COOKIE USE

The platform uses only essential technical cookies. No third-party cookies for advertising or user tracking are used.

RETENTION PERIOD

Account data is retained while membership is active. If you delete your account, data is permanently removed from the system within 30 days.

Last update: August 2026 · destek@nurstudyo.com`,
      refund: `DIGITAL SERVICE SCOPE

Purchased token packages and membership plans are digital services delivered immediately.

RIGHT OF WITHDRAWAL

Pursuant to Turkish Consumer Law No. 6502 Art. 49 and Distance Contracts Regulation Art. 15/1-ğ; the right of withdrawal cannot be exercised for digital services performed immediately with the user's explicit consent.

UNUSED TOKEN BALANCE

For completely unused balances, requests may be submitted to destek@nurstudyo.com within 7 days of purchase. Partially used packages are non-refundable.

TECHNICAL ERROR

If tokens are not credited after successful payment, contact destek@nurstudyo.com with your payment receipt. Cases are reviewed within 2 business days.

PAYMENT SECURITY

Payments are processed via PCI DSS compliant PayTR/iyzico infrastructure with 256-bit SSL encryption. Card details are not stored on our platform.

Last update: August 2026 · destek@nurstudyo.com`,
    },
  },
  de: {
    ...tr,
    title: "MITGLIEDSCHAFT & ⚡ ENERGIE",
    membership: "Mitgliedschaft",
    energyTab: "⚡ Energiepakete",
    intro: "Kaufe ⚡ Energie ohne Abo und produziere in deinem Tempo.",
    buy: "Kaufen",
    processing: "Wird verarbeitet...",
    perMonth: "/ Monat",
    termsTitle: "Kaufbedingungen",
    legalTabs: {
      tos: "Nutzungsbedingungen",
      kvkk: "Datenschutz",
      privacy: "Privatsphäre",
      refund: "Kauf & Erstattung",
    },
  },
  fr: {
    ...tr,
    title: "ABONNEMENT & ⚡ ÉNERGIE",
    membership: "Abonnement",
    energyTab: "Packs ⚡ Énergie",
    intro: "Achetez de l'⚡ Énergie sans abonnement et créez à votre rythme.",
    buy: "Acheter",
    processing: "Traitement...",
    perMonth: "/ mois",
    termsTitle: "Conditions d'achat",
    legalTabs: {
      tos: "Conditions",
      kvkk: "Données",
      privacy: "Confidentialité",
      refund: "Achat & Remboursement",
    },
  },
  es: {
    ...tr,
    title: "MEMBRESÍA Y ⚡ ENERGÍA",
    membership: "Membresía",
    energyTab: "Paquetes de ⚡ Energía",
    intro: "Compra ⚡ Energía sin suscripción y crea a tu ritmo.",
    buy: "Comprar",
    processing: "Procesando...",
    perMonth: "/ mes",
    termsTitle: "Condiciones de compra",
    legalTabs: {
      tos: "Términos",
      kvkk: "Datos",
      privacy: "Privacidad",
      refund: "Compra y reembolso",
    },
  },
  ar: {
    ...tr,
    title: "العضوية و⚡ الطاقة",
    membership: "العضوية",
    energyTab: "حزم ⚡ الطاقة",
    intro: "اشترِ ⚡ الطاقة دون اشتراك وأنشئ بإيقاعك.",
    buy: "شراء",
    processing: "جارٍ المعالجة...",
    perMonth: "/ شهر",
    termsTitle: "شروط الشراء",
    legalTabs: {
      tos: "شروط الاستخدام",
      kvkk: "البيانات",
      privacy: "الخصوصية",
      refund: "الشراء والاسترداد",
    },
  },
};

export function getPaymentCopy(lang: Lang): PaymentCopy {
  return translations[lang] ?? tr;
}
