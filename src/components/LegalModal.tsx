// ════════════════════════════════════════════════════════
// LEGAL MODAL — KVKK, Kullanım Şartları, Gizlilik, İade
// ModalsContainer.tsx'den ayrıldı (boyut için)
// ════════════════════════════════════════════════════════

import React from "react";
import { X, Shield } from "lucide-react";

interface LegalModalProps {
  tosOpen: boolean;
  setTosOpen: (v: boolean) => void;
  legalTab: "tos" | "kvkk" | "gizlilik" | "iade";
  setLegalTab: (t: "tos" | "kvkk" | "gizlilik" | "iade") => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  tosOpen, setTosOpen, legalTab, setLegalTab,
}) => {
  if (!tosOpen) return null;

  const tabs = [
    { id: "tos", label: "Kullanım Şartları" },
    { id: "kvkk", label: "KVKK Aydınlatma" },
    { id: "gizlilik", label: "Gizlilik & Çerez" },
    { id: "iade", label: "Satın Alma & İade" },
  ] as const;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md modal-in"
      onMouseDown={() => setTosOpen(false)}
      onClick={() => setTosOpen(false)}
    >
      <div
        className="glass modal-in relative w-full max-w-lg rounded-2xl p-6 shadow-2xl flex flex-col max-h-[85vh]"
        style={{ border: "1px solid rgba(215,170,82,.35)" }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setTosOpen(false)}
          className="absolute right-3 top-3 rounded-full bg-white/5 p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white"
          aria-label="Kapat"
        >
          <X size={16} />
        </button>

        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl text-black shrink-0" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
            <Shield size={18} />
          </span>
          <div>
            <h3 className="font-display text-sm font-black tracking-wider" style={{ color: "var(--accent-2)" }}>
              Yasal Bilgilendirme ve Sözleşmeler
            </h3>
            <p className="text-[9.5px] text-white/40">nurstudyo.com Kurumsal Sözleşme Portalı</p>
          </div>
        </div>

        {/* Legal Tabs */}
        <div className="mb-3 flex flex-wrap gap-1 border-b border-white/10 pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setLegalTab(tab.id)}
              className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition ${
                legalTab === tab.id
                  ? "text-black shadow-md"
                  : "glass-soft text-white/50 hover:text-white"
              }`}
              style={legalTab === tab.id ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto pr-1 text-[11px] leading-relaxed text-white/80 space-y-3 scrollbar-thin">

          {/* ── KULLANIM ŞARTLARI ── */}
          {legalTab === "tos" && (
            <div className="space-y-3">
              <div className="rounded-xl border border-[color:var(--accent)]/30 bg-black/40 p-4 space-y-3">
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Platform Tanımı ve Sorumluluk Sınırı</p>
                <p className="text-white/90 leading-relaxed">
                  Nûr Stüdyo (nurstudyo.com), İslami içerik üreticilerine yönelik yapay zeka destekli dijital video üretim platformudur. Platform; şahıs firması olarak kurulmuş olup yalnızca yazılım aracılık hizmeti sunmakta, herhangi bir medya içeriği telif hakkı iddiasında bulunmamaktadır.
                </p>
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">İçerik Sorumluluğu</p>
                <p className="text-white/90 leading-relaxed">
                  Platformda üretilen tüm ses, görüntü, metin ve video içeriklerin üçüncü taraflara (YouTube, TikTok, Instagram vb.) yayınlanmasından doğan her türlü telif, lisans ve yayın sorumluluğu münhasıran kullanıcıya aittir. Nûr Stüdyo bu kapsamda hiçbir hukuki ya da cezai sorumluluk kabul etmez.
                </p>
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Hesap ve Erişim</p>
                <p className="text-white/90 leading-relaxed">
                  Platform hizmetlerinden yararlanmak için Google hesabı ile kimlik doğrulama zorunludur. Hesabın güvenliği kullanıcının sorumluluğundadır. Platform, herhangi bir zamanda hizmet koşullarına aykırı davranan hesapları askıya alma ya da kalıcı kapatma hakkını saklı tutar.
                </p>
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Hizmet Sürekliliği</p>
                <p className="text-white/90 leading-relaxed">
                  Nûr Stüdyo hizmet sürekliliğini garanti etmez. Teknik bakım, güncelleme veya beklenmedik kesintiler nedeniyle hizmet geçici olarak kullanılamaz duruma gelebilir. Bu tür durumlarda kullanıcı tazminat talebinde bulunamaz.
                </p>
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Uygulanacak Hukuk</p>
                <p className="text-white/90 leading-relaxed">
                  İşbu koşullar Türk Hukuku'na tabidir. Uyuşmazlıklarda Türkiye Cumhuriyeti mahkemeleri yetkilidir.
                </p>
                <p className="text-[10px] text-white/40 pt-1">Son güncelleme: Ağustos 2026 · destek@nurstudyo.com</p>
              </div>
            </div>
          )}

          {/* ── KVKK ── */}
          {legalTab === "kvkk" && (
            <div className="space-y-3">
              <div className="rounded-xl border border-[color:var(--accent)]/30 bg-black/40 p-4 space-y-3">
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Veri Sorumlusu</p>
                <p className="text-white/90 leading-relaxed">
                  6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında veri sorumlusu, nurstudyo.com alan adı üzerinden hizmet veren şahıs firmasıdır. İletişim: destek@nurstudyo.com
                </p>
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">İşlenen Kişisel Veriler</p>
                <p className="text-white/90 leading-relaxed">
                  Google OAuth 2.0 aracılığıyla alınan; ad-soyad, e-posta adresi ve profil fotoğrafı. Kullanım tercihleri yalnızca kullanıcının kendi cihazındaki şifreli yerel depolama alanında (LocalStorage) tutulmaktadır. Üretilen video ve ses içerikleri sunucularımızda saklanmamaktadır.
                </p>
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">İşleme Amaçları ve Hukuki Dayanağı</p>
                <p className="text-white/90 leading-relaxed">
                  Kişisel veriler; hesap doğrulama, hizmet sunumu ve ödeme süreçleri amacıyla, KVKK m.5/2-c (sözleşmenin ifası) ve m.5/2-f (meşru menfaat) kapsamında işlenmektedir. Pazarlama amacıyla herhangi bir veri işlenmemektedir.
                </p>
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Üçüncü Taraf Aktarımları</p>
                <p className="text-white/90 leading-relaxed">
                  Verileriniz; ödeme için PayTR/İyzico, kimlik doğrulama için Google LLC ve altyapı için Cloudflare/Vercel ile paylaşılabilir.
                </p>
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Haklarınız (KVKK m.11)</p>
                <p className="text-white/90 leading-relaxed">
                  Kişisel verilerinize erişim, düzeltme, silme ve itiraz haklarınız bulunmaktadır. destek@nurstudyo.com adresine başvurunuz. Talepler 30 gün içinde yanıtlanır.
                </p>
                <p className="text-[10px] text-white/40 pt-1">Son güncelleme: Ağustos 2026 · kvkk.gov.tr</p>
              </div>
            </div>
          )}

          {/* ── GİZLİLİK ── */}
          {legalTab === "gizlilik" && (
            <div className="space-y-3">
              <div className="rounded-xl border border-[color:var(--accent)]/30 bg-black/40 p-4 space-y-3">
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Toplanan Veriler</p>
                <p className="text-white/90 leading-relaxed">
                  Nûr Stüdyo, kullanıcı tercihlerini ve oturum bilgilerini yalnızca kullanıcının kendi cihazındaki şifreli LocalStorage alanında saklar. Sunucu taraflı kullanıcı davranış kaydı yapılmamaktadır.
                </p>
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Çerez Kullanımı</p>
                <p className="text-white/90 leading-relaxed">
                  Platform yalnızca zorunlu teknik çerezler kullanır. Reklamcılık veya kullanıcı takibine yönelik üçüncü taraf çerezleri kullanılmamaktadır.
                </p>
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Veri Saklama Süresi</p>
                <p className="text-white/90 leading-relaxed">
                  Hesap verileriniz aktif üyelik süresince saklanır. Hesabınızı silmeniz durumunda verileriniz 30 gün içinde sistemden kalıcı olarak temizlenir.
                </p>
                <p className="text-[10px] text-white/40 pt-1">Son güncelleme: Ağustos 2026 · destek@nurstudyo.com</p>
              </div>
            </div>
          )}

          {/* ── İADE ── */}
          {legalTab === "iade" && (
            <div className="space-y-3">
              <div className="rounded-xl border border-[color:var(--accent)]/30 bg-black/40 p-4 space-y-3">
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Dijital Hizmet Kapsamı</p>
                <p className="text-white/90 leading-relaxed">
                  Satın alınan jeton paketleri ve üyelik planları anında teslim edilen dijital hizmet kapsamındadır.
                </p>
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Cayma Hakkı</p>
                <p className="text-white/90 leading-relaxed">
                  6502 sayılı TKHK m.49 ve Mesafeli Sözleşmeler Yönetmeliği m.15/1-ğ uyarınca; kullanıcının açık onayıyla anında ifa edilen dijital hizmetlerde <strong className="text-white">cayma hakkı kullanılamaz.</strong>
                </p>
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Kullanılmamış Jeton Bakiyesi</p>
                <p className="text-white/90 leading-relaxed">
                  Hiç kullanılmamış bakiyeler için satın alma tarihinden itibaren <strong className="text-white">7 gün içinde</strong> destek@nurstudyo.com adresine başvurulabilir. Kısmen kullanılmış paketler için iade yapılmamaktadır.
                </p>
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Teknik Hata</p>
                <p className="text-white/90 leading-relaxed">
                  Ödeme tamamlanmasına rağmen jeton tanımlanmamışsa ödeme dekontunuzla destek@nurstudyo.com adresine başvurunuz. 2 iş günü içinde incelenir.
                </p>
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Ödeme Güvenliği</p>
                <p className="text-white/90 leading-relaxed">
                  Ödemeler PCI DSS uyumlu PayTR/İyzico altyapısı üzerinden 256-bit SSL şifrelemesiyle gerçekleştirilmektedir. Kart bilgileri platformumuzda saklanmamaktadır.
                </p>
                <p className="text-[10px] text-white/40 pt-1">Son güncelleme: Ağustos 2026 · destek@nurstudyo.com · tüketici.gov.tr</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
