import React from "react";
import { X, Sparkles, Zap, Brain, Mic, Bell, Users, Globe, Lock, Rocket, Crown, Smartphone, Music, Shield, CreditCard } from "lucide-react";

interface RoadmapModalProps {
  open: boolean;
  onClose: () => void;
}

const V2_FEATURES = [
  { icon: Brain, title: "AI Meal Seslendirme", desc: "Telifsiz yapay zeka ile Kur'an meal seslendirmesi. Trufiyetsiz, anında üretilir.", tag: "Yakında" },
  { icon: Mic, title: "Kullanıcı Ses Kaydı", desc: "Hafızlar kendi seslerini kaydedip videoya entegre edebilir.", tag: "Yakında" },
  { icon: Bell, title: "Push Bildirimi", desc: "Cuma ve kandil günlerinde otomatik bildirim. Firebase ile.", tag: "Yakında" },
  { icon: Sparkles, title: "Ücretsiz 7 Gün Deneme", desc: "Yeni üyelere 7 günlük PRO denemesi. Dönüşüm oranını artırır.", tag: "Yakında" },
  { icon: Users, title: "Referans Sistemi", desc: "Arkadaşını davet et, her ikisi de kazansın. Bonus haklar.", tag: "Yakında" },
  { icon: Globe, title: "Kullanıcı Arşivi", desc: "Üretilen videoları sakla, istediğin zaman indir.", tag: "Yakında" },
  { icon: CreditCard, title: "E-Fatura", desc: "İyzico ile otomatik e-fatura kesimi.", tag: "Yakında" },
];

const V3_FEATURES = [
  { icon: Smartphone, title: "iOS & Android Uygulaması", desc: "Capacitor ile native uygulama. Push notification, offline mod.", tag: "Planlandı" },
  { icon: Music, title: "Kelime Ses Senkronizasyonu", desc: "Tajwid tabanlı gerçek zamanlı kelime vurgulama. Her kelime parlar.", tag: "Planlandı" },
  { icon: Shield, title: "Reklam Entegrasyonu", desc: "Google AdSense ile reklam geliri. Ücretsiz kullanıcılar için.", tag: "Planlandı" },
  { icon: Users, title: "Çoklu Kullanıcı", desc: "Ekip ve aile planları. Ajanslar için kurumsal paket.", tag: "Planlandı" },
  { icon: Zap, title: "API Erişimi", desc: "Dış uygulamaların entegrasyonu. REST API + webhook.", tag: "Planlandı" },
  { icon: Crown, title: "Kurumsal Üyelik", desc: "Ajanslar ve medya kuruluşları için özel paketler.", tag: "Planlandı" },
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
            </div>
            <div className="space-y-3">
              {V2_FEATURES.map((f, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition">
                  <div className="mt-0.5 p-1.5 rounded-lg" style={{ backgroundColor: "var(--accent-2)", opacity: 0.15 }}>
                    <f.icon size={14} style={{ color: "var(--accent-2)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-white">{f.title}</span>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-green-500/15 text-green-400 border border-green-500/20">{f.tag}</span>
                    </div>
                    <p className="text-[10px] text-white/40 mt-0.5 leading-relaxed">{f.desc}</p>
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
            </div>
            <div className="space-y-3">
              {V3_FEATURES.map((f, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.03] opacity-60 hover:opacity-80 transition">
                  <div className="mt-0.5 p-1.5 rounded-lg bg-purple-500/10">
                    <f.icon size={14} className="text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-white">{f.title}</span>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/20">{f.tag}</span>
                    </div>
                    <p className="text-[10px] text-white/35 mt-0.5 leading-relaxed">{f.desc}</p>
                  </div>
                  <Lock size={12} className="text-white/15 mt-1 shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-2 pb-4">
            <p className="text-[10px] text-white/25">
              🕌 Nûr Stüdyo — Dünyada tek "Kur'an Video Üreten AI Stüdyo"
            </p>
            <p className="text-[9px] text-white/15 mt-1">
              Özellikler developmental sırayla eklenecektir
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
