// ════════════════════════════════════════════════════════
// i18n — Ana dosya: tüm dilleri birleştirip export eder
// ════════════════════════════════════════════════════════

export type { Lang, LangOption, Dict } from "./base";
export { LANGS, MEAL_EDITIONS } from "./base";

import type { Lang, Dict } from "./base";
import {
  trDict, enDict, arDict, idDict, urDict,
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
  id: idDict,
  ur: urDict,
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

// ─── 04.10 TUR 2: yerelleştirme yardımcıları (üst bar, vakitler, sure eki) ───

/** Dil adı — LANGS etiketinin yerine, seçili dilin sözlüğünden */
export function dilAdi(lang: Lang | string | null | undefined, kod: string): string {
  return translate(lang, `dil${kod.toUpperCase()}`);
}

/** Namaz vakti adı — PRAYERS'taki Türkçe adı seçili dile çevirir */
export function vakitAdi(lang: Lang | string | null | undefined, trAd: string): string {
  return translate(lang, `vakit${trAd}`);
}

/** "3 sa 15 dk" → seçili dilin birimleriyle aynı süre */
export function sureceCevir(lang: Lang | string | null | undefined, metin: string): string {
  return metin
    .replace(/\bsa\b/g, translate(lang, "birimSaat"))
    .replace(/\bdk\b/g, translate(lang, "birimDakika"))
    .replace(/\bsn\b/g, translate(lang, "birimSaniye"))
    .replace(/\bdk'ya\b/g, translate(lang, "birimDakika"));
}

/** Sure adı + ek: tr → "Bakara Suresi", diğerleri → "Bakara" / "Surah Bakara" gerekmiyorsa çıplak ad */
export function sureBirlestir(lang: Lang | string | null | undefined, ad: string): string {
  if (lang === "tr") return `${ad} Suresi`;
  return ad;
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
          "6698 SAYILI KVKK AYDINLATMA METNİ (m.10)\n\n" +
          "VERİ SORUMLUSU\n" +
          "nurstudyo.com hizmetini sunan şahıs firması (Nûr Stüdyo).\nİletişim: destek@nurstudyo.com\n\n" +
          "İŞLENEN VERİLER VE AMACI\n" +
          "Google ile giriş (OAuth) ile alınan ad-soyad, e-posta ve profil fotoğrafı; üyelik ve üretim hakkı durumu; dil ve tema tercihleriniz. Bu veriler yalnızca kimlik doğrulama, hizmetin sunulması (video üretimi, üretim hakları), destek taleplerine yanıt verilmesi ve yasal yükümlülüklerin yerine getirilmesi amacıyla işlenir.\n\n" +
          "HUKUKİ SEBEPLER (KVKK m.5)\n" +
          "Sözleşmenin kurulması/ifası (m.5/2-c), hukuki yükümlülük (m.5/2-ç), meşru menfaat (m.5/2-f) ve hakkınızı korumak (m.5/2-e). Özel nitelikli (hassas) veri işlenmez.\n\n" +
          "AKTARIM\n" +
          "Verileriniz; altyapı ve ödeme hizmeti aldığımız Google (OAuth oturumu), Supabase (veritabanı) ve iyzico (ödeme) ile yalnızca hizmet için gerekli ölçüde paylaşılır. Yurt dışına aktarım yalnızca bu sağlayıcıların sunucularına yapılır.\n\n" +
          "TOPLAMA YÖNTEMİ\n" +
          "Tamamen elektronik ortamda; site kullanımınız ve kayıt akışı aracılığıyla.\n\n" +
          "SAKLAMA SÜRESİ\n" +
          "Üyelik süresince; üyelik sonunda yasal saklama süreleri dolunca silinir.\n\n" +
          "HAKLARINIZ (KVKK m.11)\n" +
          "Verilerinizin işlenip işlenmediğini öğrenme, bilgi isteme, düzeltme, silme/yok etme, aktarıldığı 3. kişileri bilme, otomatik analiz sonucu aleyhinize çıkan sonuçlara itiraz ve zarara uğramanız halinde tazminat isteme haklarınız vardır. Taleplerinizi destek@nurstudyo.com'a iletin; en geç 30 gün içinde yanıtlanır. KVKK Kurulu'na kvkk.gov.tr üzerinden şikâyet hakkınız da saklıdır.\n\n" +
          "ÇEREZLER\n" +
          "Zorunlu çerezler dışındaki çerezler yalnızca onayınızla çalışır; onayınızı sayfa altındaki 🍪 düğmesinden her an geri alabilirsiniz.\n\n" +
          "VERBİS NOTU\n" +
          "Şahıs firması olarak 50'den az çalışan ve 100 milyon TL altı bilanço eşiği nedeniyle VERBİS kaydından istisnayız (Kurul kararı 2025/1572); bu durum aydınlatma ve rıza yükümlülüklerini ortadan kaldırmaz.\n\n" +
          "Son güncelleme: Eylül 2026",
        privacy:
          "GİZLİLİK & ÇEREZ POLİTİKASI\n\n" +
          "TOPLANAN VERİLER\n" +
          "• Google hesap bilgileri (ad, e-posta, profil fotoğrafı) — yalnızca oturum doğrulama\n" +
          "• Tema ve dil tercihleri\n" +
          "• Üyelik durumu ve üretim hakları (cihazda şifreli LocalStorage)\n" +
          "• Davet ve oylama hareketleri — topluluk özellikleri için\n\n" +
          "ÇEREZ POLİTİKASI\n" +
          "Zorunlu çerezler (oturum, güvenlik, tercihler) rıza gerektirmeksizin kullanılır. Analitik ve pazarlama çerezleri YALNIZCA onayınızla devreye girer; şu anda sitede 3. taraf analitik/reklam çerezi kullanılmamaktadır. Onayınızı sayfa altındaki 🍪 düğmesinden her an değiştirebilirsiniz.\n\n" +
          "3. TARAFLAR\n" +
          "Google (oturum), Supabase (veri depolama), iyzico (ödeme — kart bilgisi bize ulaşmaz, PCI DSS uyumlu). Sunucu taraflı reklam/izleme çerezi yoktur.\n\n" +
          "Son güncelleme: Eylül 2026 · destek@nurstudyo.com",
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
          "KVKK (TURKISH DATA PROTECTION LAW) NOTICE\n\n" +
          "DATA CONTROLLER\n" +
          "Nûr Studio, sole proprietorship operating nurstudyo.com.\nContact: support@nurstudyo.com\n\n" +
          "PERSONAL DATA & PURPOSE\n" +
          "Name, email and profile photo via Google OAuth (account verification); membership and production-credit status; language and theme preferences. Processed solely to authenticate you, deliver the service (video production, credits), respond to support requests and fulfil legal obligations.\n\n" +
          "LEGAL GROUNDS (Art. 5)\n" +
          "Contract performance (2-c), legal obligation (2-ç), legitimate interest (2-f) and protection of rights (2-e). No sensitive data is processed.\n\n" +
          "TRANSFERS\n" +
          "Shared only with service providers to the extent necessary: Google (OAuth session), Supabase (database) and iyzico (payments). Transfers abroad occur only through these providers' servers.\n\n" +
          "COLLECTION METHOD: fully electronic, through your use of the site and the registration flow.\n\n" +
          "RETENTION: during membership; deleted once statutory retention periods expire.\n\n" +
          "YOUR RIGHTS (Art. 11)\n" +
          "To learn whether your data is processed, request information, request correction and deletion, learn third-party recipients, object to automated analysis, and claim compensation for damage. Email support@nurstudyo.com — answered within 30 days. You may also complain to the Data Protection Board via kvkk.gov.tr.\n\n" +
          "COOKIES: beyond strictly necessary cookies, analytics/marketing cookies run only with your consent; change it anytime via the 🍪 button at the bottom-left.\n\n" +
          "VERBIS NOTE: as a small-scale sole proprietorship (under 50 employees and balance sheet below TRY 100M), the registry exemption applies (Board decision 2025/1572); notification and consent duties remain in force.\n\n" +
          "Last updated: September 2026",
        privacy:
          "PRIVACY & COOKIE POLICY\n\n" +
          "DATA COLLECTED\n" +
          "• Google account info (name, email, photo) — session verification only\n" +
          "• Theme and language preferences\n" +
          "• Membership status and production credits (encrypted LocalStorage on your device)\n" +
          "• Invite and voting activity — for community features\n\n" +
          "COOKIE POLICY\n" +
          "Strictly necessary cookies (session, security, preferences) run without consent. Analytics and marketing cookies run ONLY with your consent; no third-party analytics/ad cookies are currently used. Change your choice anytime via the 🍪 button at the bottom-left.\n\n" +
          "THIRD PARTIES\n" +
          "Google (auth), Supabase (data storage), iyzico (payments — card data never reaches us, PCI DSS compliant). No server-side advertising or tracking cookies.\n\n" +
          "Last updated: September 2026 · support@nurstudyo.com",
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
