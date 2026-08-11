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
  title: "ÜYELİK & ⚡ ENERJİ", balance: "⚡ Enerji", membership: "Üyelik", energy: "⚡ Enerji",
  energyTab: "⚡ Enerji Paketi", intro: "Abone olmadan, tek seferlik ⚡ Enerji satın al - kendi hızında üret.",
  popular: "POPÜLER", buy: "Satın Al", perMonth: "/ ay", processing: "İşleniyor...", currentPlan: "Mevcut planın",
  proAction: "Pro'ya Geç", elitAction: "Elit Ol", accept: "Satın alma koşullarını okudum ve kabul ediyorum.",
  termsTitle: "Satın Alma Koşulları", termsButton: "Okudum, kabul ediyorum",
  packageLabels: ["Başlangıç", "Standart", "Orta", "Büyük", "Dev"],
  proFeatures: ["15 hoca", "250 içerik", "20 tema", "1080p filigransız üretim", "Sinematik filtreler", "AI yazı yenileme", "Günlük 40 ⚡ Enerji"],
  elitFeatures: ["Tüm hocalar", "500 içerik", "20 tema", "Sınırsız AI arama", "Sosyal paylaşım", "Tasarım stüdyosu", "Günlük 150 ⚡ Enerji", "Öncelikli destek"],
  legalTabs: { tos: "Kullanım Şartları", kvkk: "KVKK Aydınlatma", privacy: "Gizlilik & Çerez", refund: "Satın Alma & İade" },
  legalTitle: "Yasal Bilgilendirme ve Sözleşmeler", legalSubtitle: "nurstudyo.com Kurumsal Sözleşme Portalı",
  legalBody: {
    tos: "Nûr Stüdyo, İslami içerik üreticilerine yönelik dijital video üretim platformudur. Üretilen içeriklerin yayın ve telif sorumluluğu kullanıcıya aittir.",
    kvkk: "Google OAuth ile alınan ad, e-posta ve profil fotoğrafı hesap doğrulama ve hizmet sunumu için işlenir. Talepler destek@nurstudyo.com adresinden iletilebilir.",
    privacy: "Teknik oturum ve tercih bilgileri cihazdaki yerel depolamada tutulur. Reklam amaçlı üçüncü taraf takip çerezleri kullanılmaz.",
    refund: "Satın alınan ⚡ Enerji ve üyelik dijital hizmettir. Kullanılmamış bakiye için satın alma tarihinden itibaren 7 gün içinde destek@nurstudyo.com adresine başvurulabilir.",
  },
};

const translations: Partial<Record<Lang, PaymentCopy>> = {
  en: { ...tr, title: "MEMBERSHIP & ⚡ ENERGY", balance: "⚡ Energy", membership: "Membership", energyTab: "⚡ Energy Packages", intro: "Buy one-time ⚡ Energy without a subscription and create at your own pace.", popular: "POPULAR", buy: "Buy", perMonth: "/ month", processing: "Processing...", currentPlan: "Current plan", proAction: "Switch to Pro", elitAction: "Go Elite", accept: "I have read and accept the purchase terms.", termsTitle: "Purchase Terms", termsButton: "I have read and accept", legalTabs: { tos: "Terms of Use", kvkk: "Data Notice", privacy: "Privacy & Cookies", refund: "Purchase & Refund" }, legalTitle: "Legal Information", legalSubtitle: "nurstudyo.com Corporate Portal", legalBody: { tos: "Nûr Studio is a digital video production platform for Islamic creators. Users are responsible for publishing and copyright compliance.", kvkk: "Name, email and profile photo received through Google OAuth are processed for account verification and service delivery.", privacy: "Technical session and preference data are stored locally on the device. No advertising trackers are used.", refund: "Purchased ⚡ Energy and memberships are digital services. Unused balances may be reviewed within 7 days by contacting support@nurstudyo.com." } },
  de: { ...tr, title: "MITGLIEDSCHAFT & ⚡ ENERGIE", membership: "Mitgliedschaft", energyTab: "⚡ Energiepakete", intro: "Kaufe ⚡ Energie ohne Abo und produziere in deinem Tempo.", buy: "Kaufen", processing: "Wird verarbeitet...", perMonth: "/ Monat", termsTitle: "Kaufbedingungen", legalTabs: { tos: "Nutzungsbedingungen", kvkk: "Datenschutz", privacy: "Privatsphäre", refund: "Kauf & Erstattung" } },
  fr: { ...tr, title: "ABONNEMENT & ⚡ ÉNERGIE", membership: "Abonnement", energyTab: "Packs ⚡ Énergie", intro: "Achetez de l'⚡ Énergie sans abonnement et créez à votre rythme.", buy: "Acheter", processing: "Traitement...", perMonth: "/ mois", termsTitle: "Conditions d'achat", legalTabs: { tos: "Conditions", kvkk: "Données", privacy: "Confidentialité", refund: "Achat & Remboursement" } },
  es: { ...tr, title: "MEMBRESÍA Y ⚡ ENERGÍA", membership: "Membresía", energyTab: "Paquetes de ⚡ Energía", intro: "Compra ⚡ Energía sin suscripción y crea a tu ritmo.", buy: "Comprar", processing: "Procesando...", perMonth: "/ mes", termsTitle: "Condiciones de compra", legalTabs: { tos: "Términos", kvkk: "Datos", privacy: "Privacidad", refund: "Compra y reembolso" } },
  ar: { ...tr, title: "العضوية و⚡ الطاقة", membership: "العضوية", energyTab: "حزم ⚡ الطاقة", intro: "اشترِ ⚡ الطاقة دون اشتراك وأنشئ بإيقاعك.", buy: "شراء", processing: "جارٍ المعالجة...", perMonth: "/ شهر", termsTitle: "شروط الشراء", legalTabs: { tos: "شروط الاستخدام", kvkk: "البيانات", privacy: "الخصوصية", refund: "الشراء والاسترداد" } },
};

export function getPaymentCopy(lang: Lang): PaymentCopy {
  return translations[lang] ?? tr;
}
