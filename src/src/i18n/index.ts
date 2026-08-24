// ════════════════════════════════════════════════════════
// i18n — Ana dosya: tüm dilleri birleştirip export eder
// ════════════════════════════════════════════════════════

export type { Lang, LangOption, Dict } from "./base";
export { LANGS, MEAL_EDITIONS } from "./base";

import type { Lang, Dict } from "./base";
import {
  trDict, enDict, arDict, deDict, ruDict, frDict, esDict,
  idDict, urDict, faDict, bnDict, msDict, hiDict, swDict,
} from "./dicts";

/**
 * ★ ESKİ SORUN: de/ru/fr/es/id/ur/fa = {} boştu
 * t(key) çağrılınca undefined → ekranda Türkçe hardcoded kalıyordu
 * Şimdi her dil DOLU.
 */
export const T: Record<Lang, Dict> = {
  tr: trDict,
  en: enDict,
  ar: arDict,
  de: deDict,
  ru: ruDict,
  fr: frDict,
  es: esDict,
  id: idDict,
  ur: urDict,
  fa: faDict,
  bn: bnDict,
  ms: msDict,
  hi: hiDict,
  sw: swDict,
};

/**
 * Güvenli çeviri yardımcısı — StudioApp'te kullan:
 *   const t = (key) => translate(lang, key)
 * Boş dil / eksik anahtar → TR, sonra EN
 */
export function translate(lang: Lang | string | null | undefined, key: string): string {
  const code = String(lang || "tr").trim().toLowerCase() as Lang;
  const dict = T[code] || T.tr;
  return dict[key] || T.tr[key] || T.en[key] || key;
}

// ─── Yasal metinler (TR-first · bakiye/jeton/kredi kavramı YOKTUR) ───
type LegalBundle = {
  legalTitle: string;
  legalSubtitle: string;
  legalTabs: { tos: string; kvkk: string; privacy: string; refund: string };
  legalBody: { tos: string; kvkk: string; privacy: string; refund: string };
};

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
          "Platformda üretilen tüm ses, görüntü, metin ve video içeriklerin üçüncü taraflara yayınlanmasından doğan her türlü telif, lisans ve yayın sorumluluğu münhasıran kullanıcıya aittir. Nûr Stüdyo bu kapsamda hiçbir hukuki ya da cezai sorumluluk kabul etmez.\n\n" +
          "HESAP VE ERİŞİM\n\n" +
          "Platform hizmetlerinden yararlanmak için Google hesabı ile kimlik doğrulama zorunludur. Hesabın güvenliği kullanıcının sorumluluğundadır.\n\n" +
          "UYGULANACAK HUKUK\n\n" +
          "İşbu koşullar Türk Hukuku'na tabidir. Uyuşmazlıklarda Türkiye Cumhuriyeti mahkemeleri yetkilidir.\n\n" +
          "Son güncelleme: Ağustos 2026 · destek@nurstudyo.com",
        kvkk:
          "VERİ SORUMLUSU\n\n" +
          "Veri sorumlusu nurstudyo.com üzerinden hizmet veren şahıs firmasıdır.\nİletişim: destek@nurstudyo.com\n\n" +
          "İŞLENEN KİŞİSEL VERİLER\n\n" +
          "Google OAuth ile alınan ad-soyad, e-posta ve profil fotoğrafı. Tercihler cihazdaki şifreli LocalStorage'da tutulur.\n\n" +
          "HAKLARINIZ (KVKK m.11)\n\n" +
          "Erişim, düzeltme, silme ve itiraz haklarınız için destek@nurstudyo.com\n\n" +
          "Son güncelleme: Ağustos 2026",
        privacy:
          "TOPLANAN VERİLER\n\n" +
          "Oturum ve tercihler yalnızca cihazdaki şifreli LocalStorage'da saklanır. Sunucu taraflı davranış kaydı yoktur.\n\n" +
          "• Google hesap bilgileri — oturum doğrulama\n" +
          "• Tema, dil tercihleri\n" +
          "• Üyelik durumu ve günlük hizmet kullanım sayısı\n\n" +
          "ÇEREZ: Yalnızca zorunlu teknik çerezler. Reklam çerezi yok.\n\n" +
          "Son güncelleme: Ağustos 2026 · destek@nurstudyo.com",
        refund:
          "DİJİTAL HİZMET KAPSAMI\n\n" +
          "Satın alınan aylık üyelikler ve tek seferlik video üretim paketleri anında ifa edilen dijital hizmetlerdir. Ödenen tutar doğrudan hizmet bedelidir. Platformda bakiye yükleme, cüzdan veya para benzeri bir sistem bulunmaz.\n\n" +
          "MESAFELİ SATIŞ SÖZLEŞMESİ\n\n" +
          "Kullanıcı, satın alma işlemini tamamlamadan önce hizmetin dijital içerik / dijital hizmet niteliğinde olduğunu, ödeme sonrası hizmetin elektronik ortamda derhal sunulacağını ve video üretim sürecinin başlatılmasıyla hizmetin ifasına başlanacağını kabul eder.\n\n" +
          "HİZMETİN İFASI\n\n" +
          "Video üretimi başlatıldığında sistem kullanıcının seçtiği ayet, ses, atmosfer, format ve tasarım ayarlarına göre kişiye özel dijital video üretir. Bu işlem kullanıcı talebiyle başlatılan kişiselleştirilmiş dijital hizmettir.\n\n" +
          "CAYMA HAKKI\n\n" +
          "6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca; kullanıcının açık onayıyla anında ifasına başlanan dijital hizmetlerde cayma hakkı kullanılamaz. Kullanıcı video üretimini başlattıktan, video oluşturulduktan veya hizmetten kısmen yararlandıktan sonra iade talep edemez.\n\n" +
          "HİÇ KULLANILMAMIŞ PAKET\n\n" +
          "Satın alınan tek seferlik paketten hiç video üretilmemişse ve hizmet ifasına hiç başlanmamışsa, satın alma tarihinden itibaren 7 gün içinde destek@nurstudyo.com adresine başvurularak iade talep edilebilir. Bir kez video üretildiyse, paket kısmen kullanıldıysa veya üretim süreci başlatıldıysa iade yapılmaz.\n\n" +
          "TEKNİK HATA\n\n" +
          "Hizmet bedeli ödenmesine rağmen üyelik veya video üretim paketi tanımlanmamışsa ödeme dekontu ile destek@nurstudyo.com adresine başvurulabilir. Talep en geç 2 iş günü içinde incelenir.\n\n" +
          "ÖDEME GÜVENLİĞİ\n\n" +
          "Ödemeler PCI DSS uyumlu iyzico güvenli ödeme altyapısı üzerinden 256-bit SSL ile alınır. Kart bilgisi platformumuzda saklanmaz.\n\n" +
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
          "Nûr Studio (nurstudyo.com) is an AI-powered digital video production platform for Islamic content creators.\n\n" +
          "CONTENT RESPONSIBILITY\n\n" +
          "Publishing liability belongs exclusively to the user.\n\n" +
          "GOVERNING LAW\n\n" +
          "Laws of the Republic of Turkey. Turkish courts have jurisdiction.\n\n" +
          "Last updated: August 2026 · support@nurstudyo.com",
        kvkk:
          "DATA CONTROLLER\n\n" +
          "Contact: support@nurstudyo.com\n\n" +
          "PERSONAL DATA: Name, email, profile photo via Google OAuth. Processed for account verification and service delivery (service fee / payment). Preferences stored encrypted on device only.\n\n" +
          "YOUR RIGHTS: Access, correction, deletion — support@nurstudyo.com within 30 days.\n\n" +
          "Last updated: August 2026",
        privacy:
          "DATA COLLECTED\n\n" +
          "Session and preferences in encrypted LocalStorage only. No server-side tracking.\n\n" +
          "• Google account info — auth only\n" +
          "• Theme/language preferences\n" +
          "• Membership status and daily service usage count\n\n" +
          "COOKIES: Essential technical cookies only.\n\n" +
          "Last updated: August 2026 · support@nurstudyo.com",
        refund:
          "DIGITAL SERVICE SCOPE\n\n" +
          "Purchased memberships and one-time video production packages are instantly delivered digital services. The amount paid is a service fee. There is no wallet, balance top-up or money-like unit on the platform.\n\n" +
          "RIGHT OF WITHDRAWAL\n\n" +
          "Not available for instantly performed digital services with explicit consent under Turkish consumer law.\n\n" +
          "COMPLETELY UNUSED PACKAGE\n\n" +
          "If no video has been produced from a one-time package, contact support@nurstudyo.com within 7 days. Partial use is non-refundable.\n\n" +
          "PAYMENT SECURITY\n\n" +
          "Payments are processed through iyzico secure payment infrastructure with PCI DSS and 256-bit SSL. No card data is stored on our platform.\n\n" +
          "Last updated: August 2026 · support@nurstudyo.com",
      },
    },
  };

  const code = String(lang ?? "tr").trim().toLowerCase();
  return legalTranslations[code] || legalTranslations.tr;
};
