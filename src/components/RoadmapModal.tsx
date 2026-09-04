import React, { useState, useEffect } from "react";
import { X, Sparkles, Zap, Brain, Mic, Bell, Users, Globe, Lock, Rocket, Crown, Smartphone, Music, Shield, CreditCard, PenTool, FileText, History, Headphones, ThumbsUp, ChevronDown } from "lucide-react";

interface RoadmapModalProps {
  open: boolean;
  onClose: () => void;
}

interface Feature {
  icon: any;
  title: string;
  desc: string;
  tag: string;
  votes?: number;
  id: string;
}

const V2_FEATURES: Feature[] = [
  {
    id: "ai-meal",
    icon: Brain,
    title: "AI Meal Seslendirme",
    desc: "Kur'an mealini yapay zeka seslendirecek. Telif yok, anında üretim. 22 dilde meal seslendirmesi mümkün olacak.",
    tag: "Yakında",
    votes: 847,
  },
  {
    id: "kendi-ses",
    icon: Mic,
    title: "Kendi Sesinle Seslendirme",
    desc: "Hafızlar kendi seslerini kaydedip videolarına entegre edebilecek. Mobilde ve masaüstünde ses kayıt desteği.",
    tag: "Yakında",
    votes: 623,
  },
  {
    id: "kelime-video",
    icon: PenTool,
    title: "Kelime Tabanlı Video Üretimi",
    desc: "Bir kelime veya cümle yaz, yapay zeka otomatik arka plan ve atmosfer seçsin. 'Sabır' yaz, çöl atmosferinde sinematik video çıkaran bir sistem.",
    tag: "Yakında",
    votes: 912,
  },
  {
    id: "ai-arkaplan",
    icon: Sparkles,
    title: "AI Arka Plan Üretici",
    desc: "Yazdığın metne göre yapay zeka kendisi tema ve atmosfer belirleyecek. Kullanıcı sadece yazsın, gerisini AI halletsin.",
    tag: "Yakında",
    votes: 756,
  },
  {
    id: "push",
    icon: Bell,
    title: "Akıllı Push Bildirimi",
    desc: "Cuma sabahı, kandil geceleri, özel gecelerde otomatik bildirim. Kişiselleştirilmiş bildirimler.",
    tag: "Yakında",
    votes: 534,
  },
  {
    id: "ucretsiz-deneme",
    icon: Sparkles,
    title: "Ücretsiz 7 Gün PRO Denemesi",
    desc: "Yeni üyelere 7 günlük ücretsiz PRO denemesi. Kredi kartı gerekmez. Deneme sonunda otomatik free'ye dönüş.",
    tag: "Yakında",
    votes: 891,
  },
  {
    id: "referans",
    icon: Users,
    title: "Referans & Davet Sistemi",
    desc: "Arkadaşını davet et, her ikisi de kazansın. Sosyal medya paylaşımı ile organik büyüme.",
    tag: "Yakında",
    votes: 445,
  },
  {
    id: "arsiv",
    icon: Globe,
    title: "Kullanıcı Arşivi",
    desc: "Ürettiğin tüm videoları kaydet, istediğin zaman indir veya yeniden düzenle.",
    tag: "Yakında",
    votes: 678,
  },
  {
    id: "e-fatura",
    icon: CreditCard,
    title: "Otomatik E-Fatura",
    desc: "Satın alımlarda otomatik e-fatura. Resmi muhasebe kayıtları için entegrasyon.",
    tag: "Yakında",
    votes: 312,
  },
  {
    id: "meal-dinle",
    icon: Headphones,
    title: "Meal Dinleme Modu",
    desc: "Videoları ses-only modda dinle. Hafızlık ve ezber için mükemmel. Arka planda çalışmaya devam etsin.",
    tag: "Yakında",
    votes: 567,
  },
];

const V3_FEATURES: Feature[] = [
  {
    id: "mobil-uygulama",
    icon: Smartphone,
    title: "iOS & Android Uygulaması",
    desc: "Mobil uygulama ile push notification, offline video izleme. App Store ve Google Play'de.",
    tag: "Planlandı",
    votes: 1203,
  },
  {
    id: "ses-senkron",
    icon: Music,
    title: "Kelime Ses Senkronizasyonu",
    desc: "Okunan her kelime altın ışıkla parlar. Hızlı okuma modu da eklenecek.",
    tag: "Planlandı",
    votes: 834,
  },
  {
    id: "reklam",
    icon: Shield,
    title: "Reklam Entegrasyonu",
    desc: "Google AdSense ile reklam geliri. Ücretsiz kullanıcılar video başında reklam görecek.",
    tag: "Planlandı",
    votes: 234,
  },
  {
    id: "coklu-kullanici",
    icon: Users,
    title: "Çoklu Kullanıcı & Ekip",
    desc: "Ekip ve aile planları. Tek hesapla birden fazla kullanıcı.",
    tag: "Planlandı",
    votes: 389,
  },
  {
    id: "api",
    icon: Zap,
    title: "Dış API Entegrasyonu",
    desc: "Dış uygulamaların Nûr Stüdyo'yu kullanması. REST API + webhook ile otomasyon.",
    tag: "Planlandı",
    votes: 156,
  },
  {
    id: "kurumsal",
    icon: Crown,
    title: "Kurumsal Üyelik",
    desc: "Ajanslar ve medya kuruluşları için özel paketler. Toplu video üretimi.",
    tag: "Planlandı",
    votes: 278,
  },
];

const VOTE_STORAGE_KEY = "nur_roadmap_votes";

function getStoredVotes(): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(VOTE_STORAGE_KEY) || "{}"); } catch { return {}; }
}

export const RoadmapModal: React.FC<RoadmapModalProps> = ({ open, onClose }) => {
  const [localVotes, setLocalVotes] = useState<Record<string, boolean>>(() => getStoredVotes());
  const [v2Features, setV2Features] = useState(V2_FEATURES);
  const [v3Features, setV3Features] = useState(V3_FEATURES);

  if (!open) return null;

  const handleVote = (id: string) => {
    if (localVotes[id]) return; // Oy kullanılmış
    const newVotes = { ...localVotes, [id]: true };
    setLocalVotes(newVotes);
    try { localStorage.setItem(VOTE_STORAGE_KEY, JSON.stringify(newVotes)); } catch {}
    setV2Features(prev => prev.map(f => f.id === id ? { ...f, votes: (f.votes || 0) + 1 } : f));
    setV3Features(prev => prev.map(f => f.id === id ? { ...f, votes: (f.votes || 0) + 1 } : f));
  };

  const totalVotes = [...v2Features, ...v3Features].reduce((sum, f) => sum + (f.votes || 0), 0);

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
            <p className="text-[11px] text-white/40 mt-0.5">
              Nûr Stüdyo — Gelecek planları ve v2-v3 yenilikleri
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 transition">
            <X size={18} className="text-white/50" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Oy Sayacı */}
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-center">
            <p className="text-[10px] text-amber-300/80 font-bold">
              🗳️ Toplam <span className="text-amber-200 font-black">{totalVotes.toLocaleString("tr-TR")}</span> oy kullanıldı
            </p>
            <p className="text-[9px] text-white/30 mt-0.5">
              Hangi özelliği önce istiyorsan oyla — öncelik senin olsun
            </p>
          </div>

          {/* V2 Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider" style={{ backgroundColor: "var(--accent-2)", color: "#000" }}>
                V2
              </div>
              <span className="text-sm font-bold text-white">Yakında Gelen Güncellemeler</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-500/15 text-green-400 border border-green-500/20">
                {v2Features.length} özellik
              </span>
            </div>
            <div className="space-y-2">
              {v2Features.sort((a, b) => (b.votes || 0) - (a.votes || 0)).map((f, i) => (
                <div key={f.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-amber-500/20 transition group">
                  <div className="mt-0.5 p-1.5 rounded-lg group-hover:scale-110 transition" style={{ backgroundColor: "var(--accent-2)", opacity: 0.15 }}>
                    <f.icon size={14} style={{ color: "var(--accent-2)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-white">{f.title}</span>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-green-500/15 text-green-400 border border-green-500/20">{f.tag}</span>
                    </div>
                    <p className="text-[10px] text-white/50 mt-0.5 leading-relaxed">{f.desc}</p>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => handleVote(f.id)}
                      disabled={localVotes[f.id]}
                      className={`p-1.5 rounded-lg transition ${localVotes[f.id] ? "bg-amber-500/20 text-amber-300" : "bg-white/5 text-white/30 hover:bg-amber-500/15 hover:text-amber-300"}`}
                    >
                      <ThumbsUp size={12} />
                    </button>
                    <span className={`text-[9px] font-bold ${localVotes[f.id] ? "text-amber-300" : "text-white/25"}`}>
                      {(f.votes || 0).toLocaleString("tr-TR")}
                    </span>
                  </div>
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
                {v3Features.length} özellik
              </span>
            </div>
            <div className="space-y-2">
              {v3Features.sort((a, b) => (b.votes || 0) - (a.votes || 0)).map((f, i) => (
                <div key={f.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.03] opacity-60 hover:opacity-80 transition group">
                  <div className="mt-0.5 p-1.5 rounded-lg bg-purple-500/10 group-hover:scale-110 transition">
                    <f.icon size={14} className="text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-white">{f.title}</span>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/20">{f.tag}</span>
                    </div>
                    <p className="text-[10px] text-white/40 mt-0.5 leading-relaxed">{f.desc}</p>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => handleVote(f.id)}
                      disabled={localVotes[f.id]}
                      className={`p-1.5 rounded-lg transition ${localVotes[f.id] ? "bg-purple-500/20 text-purple-300" : "bg-white/5 text-white/20 hover:bg-purple-500/15 hover:text-purple-300"}`}
                    >
                      <ThumbsUp size={12} />
                    </button>
                    <span className={`text-[9px] font-bold ${localVotes[f.id] ? "text-purple-300" : "text-white/20"}`}>
                      {(f.votes || 0).toLocaleString("tr-TR")}
                    </span>
                  </div>
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
