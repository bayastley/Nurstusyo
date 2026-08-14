import type { Lang } from "../i18n";

// ════════════════════════════════════════════════════════
// PAYMENTCOPY.TS — Ödeme ve yasal metinler
//
// ★ İYZİCO UYUMU — YASAK KELİMELER:
//   jeton · kredi · kontör · token · coin · bakiye · cüzdan · enerji
//   Bunların hiçbiri bu dosyada geçmez.
//   Kullanılan dil: "üyelik", "video üretim hizmeti", "paket", "günlük hak".
// ════════════════════════════════════════════════════════

export interface PaymentCopy {
  title: string;
  subtitle: string;
  membership: string;
  packageTab: string;
  todayUsage: string;
  intro: string;
  popular: string;
  mostChosen: string;
  buy: string;
  perMonth: string;
  perVideo: string;
  processing: string;
  currentPlan: string;
  proAction: string;
  elitAction: string;
  accept: string;
  packageNote: string;
  securityNote: string;
  quotaNote: string;
  kindShort: string;
  kindLong: string;
  kindFull: string;
  proFeatures: string[];
  elitFeatures: string[];
  legalTabs: { tos: string; kvkk: string; privacy: string; refund: string };
  legalTitle: string;
  legalSubtitle: string;
  legalBody: { tos: string; kvkk: string; privacy: string; refund: string };
}

const tr: PaymentCopy = {
  title: "ÜYELİK & PAKETLER",
  subtitle: "Her gün yenilenen üretim hakkıyla üret",
  membership: "Aylık Üyelik",
  packageTab: "Tek Seferlik Paket",
  todayUsage: "Bugünkü kullanımın",
  intro:
    "Aylık üyelikle her gün belirli sayıda video üretebilirsin. " +
    "Daha fazlasına ihtiyacın olursa tek seferlik paket alabilirsin.",
  popular: "EN POPÜLER",
  mostChosen: "EN ÇOK TERCİH",
  buy: "Satın Al",
  perMonth: "/ ay",
  perVideo: "video başına",
  processing: "İşleniyor...",
  currentPlan: "Mevcut üyeliğin",
  proAction: "PRO'YA GEÇ",
  elitAction: "ELİT OL",
  accept:
    "Satın alma koşullarını, mesafeli satış sözleşmesini ve iade politikasını okudum, kabul ediyorum.",
  packageNote:
    "Paketler tek seferliktir ve süresi dolmaz. Günlük üyelik hakkın bittiğinde otomatik olarak paketinden kullanılır.",
  securityNote:
    "Ödemeler PCI DSS uyumlu altyapı ile 256-bit SSL üzerinden alınır · Kart bilgisi saklanmaz",
  quotaNote: "Günlük haklar her gün yenilenir · devretmez",
  kindShort: "Kısa Video",
  kindLong: "Uzun Video",
  kindFull: "Tam Sürüm",
  proFeatures: [
    "Günde 8 kısa + 3 uzun video (600 sn)",
    "15 kâri sesi",
    "250 atmosfer içeriği",
    "20 tema",
    "1080p filigransız üretim",
    "Sinematik filtreler",
    "AI başlık ve açıklama",
  ],
  elitFeatures: [
    "Günde 15 kısa + 5 uzun video (600 sn) + 1 tam sürüm",
    "Tüm kâri sesleri",
    "500 atmosfer içeriği",
    "Sınırsız AI arama",
    "Sosyal paylaşım paneli",
    "Tasarım stüdyosu",
    "Kendi imzanı ekleme",
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
      "Nûr Stüdyo (nurstudyo.com), İslami içerik üreticilerine yönelik yapay zekâ destekli " +
      "dijital video üretim platformudur. Platform yalnızca yazılım hizmeti sunar.\n\n" +
      "HİZMET MODELİ\n\n" +
      "Platformda ön ödemeli bakiye, cüzdan veya para benzeri bir birim bulunmaz. " +
      "Kullanıcı; aylık üyelik satın alarak her gün belirli sayıda video üretim hizmetinden " +
      "yararlanır veya tek seferlik video üretim paketi satın alır. " +
      "Satın alınan her ürün, doğrudan belirli sayıda video üretim hizmetine karşılık gelir.\n\n" +
      "İÇERİK SORUMLULUĞU\n\n" +
      "Üretilen içeriklerin yayın ve telif sorumluluğu kullanıcıya aittir.\n\n" +
      "HESAP VE ERİŞİM\n\n" +
      "Hizmetten yararlanmak için Google hesabı ile kimlik doğrulama zorunludur.\n\n" +
      "UYGULANACAK HUKUK\n\n" +
      "Türk Hukuku geçerlidir. Yetkili mahkemeler T.C. mahkemeleridir.\n\n" +
      "Son güncelleme: Ağustos 2026 · destek@nurstudyo.com",
    kvkk:
      "VERİ SORUMLUSU\n\n" +
      "Veri sorumlusu nurstudyo.com üzerinden hizmet veren şahıs firmasıdır.\n" +
      "İletişim: destek@nurstudyo.com\n\n" +
      "İŞLENEN KİŞİSEL VERİLER\n\n" +
      "Google OAuth ile alınan ad-soyad, e-posta ve profil fotoğrafı; hesap doğrulama ve " +
      "hizmet sunumu için işlenir. Üyelik durumu ve günlük hizmet kullanım sayısı, " +
      "hizmetin doğru sunulabilmesi amacıyla tutulur.\n\n" +
      "HAKLARINIZ (KVKK m.11)\n\n" +
      "Erişim, düzeltme, silme, itiraz: destek@nurstudyo.com — 30 gün içinde yanıtlanır.\n\n" +
      "Son güncelleme: Ağustos 2026 · kvkk.gov.tr",
    privacy:
      "TOPLANAN VERİLER\n\n" +
      "Oturum ve tercihler cihazdaki şifreli alanda saklanır.\n\n" +
      "• Google hesap bilgileri — oturum doğrulama\n" +
      "• Tema ve dil tercihleri\n" +
      "• Üyelik durumu ve günlük hizmet kullanım sayısı\n" +
      "• Video üretim geçmişi — cihazda tutulur, sunucuya gitmez\n\n" +
      "ÇEREZ: Yalnızca zorunlu teknik çerezler. Reklam çerezi yoktur.\n\n" +
      "Son güncelleme: Ağustos 2026 · destek@nurstudyo.com",
    refund:
      "DİJİTAL HİZMET KAPSAMI\n\n" +
      "Satın alınan aylık üyelik ve tek seferlik video üretim paketleri, anında ifa edilen " +
      "dijital hizmetlerdir. Ödenen tutar doğrudan hizmet bedelidir. " +
      "Platformda bakiye yükleme veya para saklama işlevi bulunmaz.\n\n" +
      "MESAFELİ SATIŞ SÖZLEŞMESİ\n\n" +
      "Kullanıcı, satın alma işlemini tamamlamadan önce hizmetin dijital içerik / dijital hizmet " +
      "niteliğinde olduğunu, ödeme sonrası hizmetin elektronik ortamda derhal sunulacağını ve " +
      "video üretim sürecinin başlatılmasıyla hizmetin ifasına başlanacağını kabul eder.\n\n" +
      "HİZMETİN İFASI\n\n" +
      "Video üretimi başlatıldığında sistem kullanıcının seçtiği ayet, ses, atmosfer, format ve " +
      "tasarım ayarlarına göre kişiye özel dijital video üretir. Bu işlem kullanıcı talebiyle " +
      "başlatılan kişiselleştirilmiş dijital hizmettir.\n\n" +
      "CAYMA HAKKI\n\n" +
      "6502 sayılı TKHK ve Mesafeli Sözleşmeler Yönetmeliği uyarınca; kullanıcının açık " +
      "onayıyla anında ifasına başlanan dijital hizmetlerde cayma hakkı kullanılamaz. " +
      "Kullanıcı video üretimini başlattıktan, video oluşturulduktan veya hizmetten kısmen " +
      "yararlandıktan sonra iade talep edemez.\n\n" +
      "HİÇ KULLANILMAMIŞ PAKET\n\n" +
      "Satın alınan paketten hiç video üretilmemişse ve hizmet ifasına hiç başlanmamışsa, " +
      "satın alma tarihinden itibaren 7 gün içinde destek@nurstudyo.com adresine başvurularak " +
      "iade talep edilebilir. Bir kez video üretildiyse, paket kısmen kullanıldıysa veya " +
      "üretim süreci başlatıldıysa iade yapılmaz.\n\n" +
      "ÜYELİK İPTALİ\n\n" +
      "Aylık üyelik dönem sonuna kadar geçerlidir. İptal sonrası ücretsiz plana geçilir; " +
      "daha önce satın alınmış tek seferlik paket hakları saklı kalır.\n\n" +
      "TEKNİK HATA\n\n" +
      "Ödeme alınmasına rağmen hizmet tanımlanmamışsa ödeme dekontu ile " +
      "destek@nurstudyo.com — 2 iş günü içinde çözülür.\n\n" +
      "ÖDEME GÜVENLİĞİ\n\n" +
      "Ödemeler PCI DSS uyumlu altyapı ile 256-bit SSL üzerinden yapılır. " +
      "Kart bilgisi saklanmaz.\n\n" +
      "Son güncelleme: Ağustos 2026 · destek@nurstudyo.com",
  },
};

const en: PaymentCopy = {
  ...tr,
  title: "MEMBERSHIP & PACKAGES",
  subtitle: "Create with daily renewing production allowance",
  membership: "Monthly Membership",
  packageTab: "One-Time Package",
  todayUsage: "Your usage today",
  intro:
    "With a monthly membership you can produce a set number of videos every day. " +
    "If you need more, buy a one-time package.",
  popular: "MOST POPULAR",
  mostChosen: "BEST VALUE",
  buy: "Buy",
  perMonth: "/ month",
  perVideo: "per video",
  processing: "Processing...",
  currentPlan: "Current membership",
  proAction: "GET PRO",
  elitAction: "GET ELITE",
  accept: "I have read and accept the purchase terms and refund policy.",
  packageNote:
    "Packages are one-time and never expire. When your daily allowance runs out, your package is used automatically.",
  securityNote: "Payments are processed over PCI DSS infrastructure with 256-bit SSL · No card data stored",
  quotaNote: "Daily allowance resets every day · does not carry over",
  kindShort: "Short Video",
  kindLong: "Long Video",
  kindFull: "Full Length",
  proFeatures: [
    "8 short + 3 long videos daily (600s)",
    "15 reciters",
    "250 atmosphere assets",
    "20 themes",
    "1080p watermark-free",
    "Cinematic filters",
    "AI title and description",
  ],
  elitFeatures: [
    "15 short + 5 long videos daily (600s) + 1 full length",
    "All reciters",
    "500 atmosphere assets",
    "Unlimited AI search",
    "Social sharing panel",
    "Design studio",
    "Custom signature",
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
      "Nûr Studio is an AI-assisted digital video production platform.\n\n" +
      "SERVICE MODEL\n\n" +
      "There is no prepaid balance or wallet on the platform. Users purchase a monthly " +
      "membership granting a daily number of video productions, or a one-time video " +
      "production package. Each purchase corresponds directly to a service.\n\n" +
      "Publishing liability belongs to the user.\n\n" +
      "Last updated: August 2026 · support@nurstudyo.com",
    kvkk:
      "DATA CONTROLLER\n\nContact: support@nurstudyo.com\n\n" +
      "Name, email and profile photo via Google OAuth are processed for account " +
      "verification and service delivery.\n\nLast updated: August 2026",
    privacy:
      "DATA COLLECTED\n\n" +
      "Preferences, membership status and daily service usage count are stored encrypted " +
      "on device. Essential cookies only.\n\nLast updated: August 2026 · support@nurstudyo.com",
    refund:
      "DIGITAL SERVICE SCOPE\n\n" +
      "Memberships and one-time video production packages are instantly delivered digital " +
      "services. There is no balance top-up function.\n\n" +
      "RIGHT OF WITHDRAWAL\n\n" +
      "Not available for instantly performed digital services with explicit consent.\n\n" +
      "COMPLETELY UNUSED PACKAGE\n\n" +
      "If no video was produced from the package, contact support@nurstudyo.com within 7 days.\n\n" +
      "PAYMENT SECURITY\n\nPCI DSS, 256-bit SSL. No card storage.\n\n" +
      "Last updated: August 2026 · support@nurstudyo.com",
  },
};

const translations: Partial<Record<Lang, PaymentCopy>> = {
  en,
  de: {
    ...en,
    title: "MITGLIEDSCHAFT & PAKETE",
    membership: "Monatliche Mitgliedschaft",
    packageTab: "Einmaliges Paket",
    todayUsage: "Deine heutige Nutzung",
    buy: "Kaufen",
    perMonth: "/ Monat",
    perVideo: "pro Video",
    currentPlan: "Aktuelle Mitgliedschaft",
    proAction: "PRO HOLEN",
    elitAction: "ELITE HOLEN",
  },
  fr: {
    ...en,
    title: "ABONNEMENT & PACKS",
    membership: "Abonnement mensuel",
    packageTab: "Pack unique",
    todayUsage: "Votre utilisation du jour",
    buy: "Acheter",
    perMonth: "/ mois",
    perVideo: "par vidéo",
    currentPlan: "Abonnement actuel",
    proAction: "PASSER À PRO",
    elitAction: "DEVENIR ELITE",
  },
  es: {
    ...en,
    title: "MEMBRESÍA Y PAQUETES",
    membership: "Membresía mensual",
    packageTab: "Paquete único",
    todayUsage: "Tu uso de hoy",
    buy: "Comprar",
    perMonth: "/ mes",
    perVideo: "por video",
    currentPlan: "Membresía actual",
    proAction: "OBTENER PRO",
    elitAction: "SER ELITE",
  },
  ar: {
    ...en,
    title: "العضوية والباقات",
    membership: "عضوية شهرية",
    packageTab: "باقة لمرة واحدة",
    todayUsage: "استخدامك اليوم",
    buy: "شراء",
    perMonth: "/ شهر",
    perVideo: "لكل فيديو",
    currentPlan: "عضويتك الحالية",
    proAction: "الترقية إلى PRO",
    elitAction: "الترقية إلى ELIT",
  },
  ru: {
    ...en,
    title: "ПОДПИСКА И ПАКЕТЫ",
    membership: "Месячная подписка",
    packageTab: "Разовый пакет",
    todayUsage: "Использовано сегодня",
    buy: "Купить",
    perMonth: "/ мес",
    perVideo: "за видео",
    currentPlan: "Текущая подписка",
    proAction: "ПОЛУЧИТЬ PRO",
    elitAction: "СТАТЬ ELITE",
  },
  id: {
    ...en,
    title: "KEANGGOTAAN & PAKET",
    membership: "Keanggotaan Bulanan",
    packageTab: "Paket Sekali Beli",
    todayUsage: "Pemakaian hari ini",
    buy: "Beli",
    perMonth: "/ bulan",
    perVideo: "per video",
    currentPlan: "Keanggotaan saat ini",
    proAction: "AMBIL PRO",
    elitAction: "JADI ELITE",
  },
};

export function getPaymentCopy(lang?: Lang | string | null): PaymentCopy {
  const code = String(lang || "tr").trim().toLowerCase() as Lang;
  if (code === "tr") return tr;
  return translations[code] ?? tr;
}
