import React from "react";
import { X, Sparkles, Zap, Brain, Mic, Bell, Users, Globe, Lock, Rocket, Crown, Smartphone, Music, Shield, CreditCard, PenTool, FileText, History, Headphones } from "lucide-react";

interface RoadmapModalProps {
  open: boolean;
  onClose: () => void;
}

const V2_FEATURES = [
  {
    icon: Brain,
    title: "AI Meal Seslendirme",
    desc: "Yapay zeka ile Kur'an meal seslendirmesi. Telifsiz, anında üretilir. 22 farklı dilde meal seslendirmesi mümkün olacak. Hafızlar kendi sesiyle de entegre edebilecek.",
    detail: "OpenAI TTS / Piper TTS altyapısı ile sıfır maliyet, yüksek kalite",
    tag: "Yakında",
  },
  {
    icon: Mic,
    title: "Kendi Sesinle Seslendirme",
    desc: "Hafızlar kendi seslerini kaydedip videolarına entegre edebilir. Mobilde ve masaüstünde ses kayıt desteği. Otomatik gürültü temizleme ve ses ayarı.",
    detail: "Mikrofon kaydı + otomatik ses seviyesi normalizasyonu",
    tag: "Yakında",
  },
  {
    icon: PenTool,
    title: "Kelime Tabanlı Video Üretimi",
    desc: "Kullanıcılar kelime veya cümle yazacak, yapay zeka otomatik arka plan atmosfer ve tema seçecek. 'Sabır' yaz, çöl atmosferinde sinematik video çıkar.",
    detail: "AI-powered topic analysis → otomatik tema + atmosfer seçimi",
    tag: "Yakında",
  },
  {
    icon: Sparkles,
    title: "AI Arka Plan Üretici",
    desc: "Yazdığın metne göre yapay zeka kendisi arka plan, tema ve atmosfer belirleyecek. Kullanıcı sadece yazsın, gerisini AI halletsin. Her video benzersiz olacak.",
    detail: "GPT-based content analysis → otomatik görsel + müzik eşleştirme",
    tag: "Yakında",
  },
  {
    icon: Bell,
    title: "Akıllı Push Bildirimi",
    desc: "Cuma sabahı, kandil geceleri, özel gecelerde otomatik bildirim. Firebase Cloud Messaging ile. Kullanıcı tercihlerine göre kişiselleştirilmiş bildirimler.",
    detail: "Firebase FCM + astrology-free, sadece dini takvim",
    tag: "Yakında",
  },
  {
    icon: Sparkles,
    title: "Ücretsiz 7 Gün PRO Denemesi",
    desc: "Yeni üyelere 7 günlük ücretsiz PRO denemesi. Kredi kartı gerekmez. Deneme süresinde PRO özelliklerinin tamamına erişim. Deneme sonunda otomatik free'ye dönüş.",
    detail: "Dönüşüm oranını %300 artırması bekleniyor",
    tag: "Yakında",
  },
  {
    icon: Users,
    title: "Referans & Davet Sistemi",
    desc: "Arkadaşını davet et, her ikisi de kazansın. Her başarılı davette bonus üretim hakkı. Sosyal medya paylaşımı ile organik büyüme.",
    detail: "Referans linki + otomatik bonus tanımlama",
    tag: "Yakında",
  },
  {
    icon: Globe,
    title: "Kullanıcı Arşivi",
    desc: "Ürettiğin tüm videoları kaydet, istediğin zaman indir veya yeniden düzenle. Geçmiş üretim kayıtları, favori kâriler ve tercihler.",
    detail: "Supabase Storage +(video metadata + thumbnail cache)",
    tag: "Yakında",
  },
  {
    icon: CreditCard,
    title: "Otomatik E-Fatura",
    desc: "İyzico ile otomatik e-fatura kesimi. Kullanıcılara otomatik fatura e-postası. Resmi muhasebe kayıtları için entegrasyon.",
    detail: "İyzico API + e-fatura entegrasyonu",
    tag: "Yakında",
  },
  {
    icon: Headphones,
    title: "Meal Dinleme Modu",
    desc: "Videoları ses-only modda dinle. Hafızlık ve ezber için mükemmel. Arka planda dinlerken ekran kapalı çalışmaya devam etsin.",
    detail: "Background audio mode + notification controls",
    tag: "Yakında",
  },
];

const V3_FEATURES = [
  {
    icon: Smartphone,
    title: "iOS & Android Uygulaması",
    desc: "Capacitor ile native uygulama. Push notification, offline video izleme, parmak izi ile giriş. App Store ve Google Play'de.",
    detail: "Capacitor + native bridge",
    tag: "Planlandı",
  },
  {
    icon: Music,
    title: "Kelime Ses Senkronizasyonu",
    desc: "Tajwid tabanlı gerçek zamanlı kelime vurgulama. Okunan her kelime altın ışıkla parlar. Hızlı okuma modu da eklenecek.",
    detail: "WebSocket-based real-time sync + Tajwid rules",
    tag: "Planlandı",
  },
  {
    icon: Shield,
    title: "Reklam Entegrasyonu",
    desc: "Google AdSense ile reklam geliri. Ücretsiz kullanıcılar video başında reklam görecek. PRO kullanıcılar reklamsız.",
    detail: "AdSense + reward-based ads for free tier",
    tag: "Planlandı",
  },
  {
    icon: Users,
    title: "Çoklu Kullanıcı & Ekip",
    desc: "Ekip ve aile planları. Tek hesapla birden fazla kullanıcı. Ajanslar için kurumsal paket.",
    detail: "Multi-seat billing + team management dashboard",
    tag: "Planlandı",
  },
  {
    icon: Zap,
    title: "Dış API Entegrasyonu",
    desc: "Dış uygulamaların Nûr Stüdyo'yu kullanması. REST API + webhook ile otomasyon. Camiler ve medya kuruluşları için.",
    detail: "OpenAPI spec + rate limiting + API key management",
    tag: "Planlandı",
  },
  {
    icon: Crown,
    title: "Kurumsal Üyelik",
    desc: "Ajanslar ve medya kuruluşları için özel paketler. Toplu video üretimi, özel marka_embeddings, öncelikli destek.",
    detail: "White-label + bulk pricing + SLA",
    tag: "Planlandı",
  },
];

export const RoadmapModal: React.FC<RoadmapModalProps> = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="relative max-w-2xl w-full max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10 bg-gradient-to-b from-gray-900 via-gray-950 to-black shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-gray-950/90 backdrop-blur px-6 py-4">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Rocket size={20} style={{ color: "var(--accent-2)" }} />
              Güncelleme Yol Haritası
            </h2>
            <p className="text-[11px] text-white/40 mt-0.5">Nûr Stüdyo — Gelecek planları ve v2-v3 yenilikleri</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 transition">
            <X size={18} className="text-white/50" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* V2 Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider" style={{ backgroundColor: "var(--accent-2)", color: "#000" }}>
                V2
              </div>
              <span className="text-sm font-bold text-white">Yakında Gelen Güncellemeler</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-500/15 text-green-400 border border-green-500/20">
                {V2_FEATURES.length} yeni özellik
              </span>
            </div>
            <div className="space-y-3">
              {V2_FEATURES.map((f, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-amber-500/20 transition group">
                  <div className="mt-0.5 p-1.5 rounded-lg group-hover:scale-110 transition" style={{ backgroundColor: "var(--accent-2)", opacity: 0.15 }}>
                    <f.icon size={14} style={{ color: "var(--accent-2)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-white">{f.title}</span>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-green-500/15 text-green-400 border border-green-500/20">{f.tag}</span>
                    </div>
                    <p className="text-[10px] text-white/50 mt-0.5 leading-relaxed">{f.desc}</p>
                    <p className="text-[9px] text-white/25 mt-1 font-mono">{f.detail}</p>
                  </div>
                  <Lock size={12} className="text-white/20 mt-1 shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* V3 Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider bg-purple-500 text-white">
                V3
              </div>
              <span className="text-sm font-bold text-white">Uzun Vadeli Planlar</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/20">
                {V3_FEATURES.length} özellik
              </span>
            </div>
            <div className="space-y-3">
              {V3_FEATURES.map((f, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.03] opacity-60 hover:opacity-80 transition group">
                  <div className="mt-0.5 p-1.5 rounded-lg bg-purple-500/10 group-hover:scale-110 transition">
                    <f.icon size={14} className="text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-white">{f.title}</span>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/20">{f.tag}</span>
                    </div>
                    <p className="text-[10px] text-white/40 mt-0.5 leading-relaxed">{f.desc}</p>
                    <p className="text-[9px] text-white/20 mt-1 font-mono">{f.detail}</p>
                  </div>
                  <Lock size={12} className="text-white/15 mt-1 shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-2 pb-4 space-y-1">
            <p className="text-[10px] text-white/30">
              🕌 Nûr Stüdyo — Dünyada tek "Kur'an Video Üreten AI Stüdyo"
            </p>
            <p className="text-[9px] text-white/20">
              Özellikler developmental sırayla eklenecektir
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
