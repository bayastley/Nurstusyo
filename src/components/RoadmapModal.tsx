import React, { useState, useEffect, useCallback } from "react";
import { X, ThumbsUp, Plus, Trash2, RotateCcw, Clock, Settings, Rocket, Edit3 } from "lucide-react";
import { isAdminEmail } from "../tier";

// ★ Icon'lar string olarak tutulur — JSON.parse'ta kaybolmaz
const ICON_EMOJI: Record<string, string> = {
  ai_meal: "🧠", kendi_ses: "🎤", kelime_video: "✍️", ai_arkaplan: "✨",
  push: "🔔", ucretsiz_deneme: "🎁", referans: "👥", arsiv: "🌐",
  e_fatura: "💳", meal_dinle: "🎧", mobil: "📱", ses_senkron: "🎵",
  reklam: "🛡️", coklu_kullanici: "👥", api: "⚡", kurumsal: "👑",
};
function getIcon(id: string): string {
  return ICON_EMOJI[id] || "✨";
}

interface RoadmapModalProps {
  open: boolean;
  onClose: () => void;
  adminEmail?: string;
}

interface Feature {
  iconId: string;
  title: string;
  desc: string;
  tag: string;
  votes: number;
  id: string;
  active: boolean;
}

const DEFAULT_V2: Omit<Feature, "votes">[] = [
  { id: "ai-meal", iconId: "ai_meal", title: "AI Meal Seslendirme", desc: "Kur'an mealini yapay zeka seslendirecek. Telif yok, anında üretim. 22 dilde meal seslendirmesi mümkün olacak.", tag: "V2", active: true },
  { id: "kendi-ses", iconId: "kendi_ses", title: "Kendi Sesinle Seslendirme", desc: "Hafızlar kendi seslerini kaydedip videolarına entegre edebilecek.", tag: "V2", active: true },
  { id: "kelime-video", iconId: "kelime_video", title: "Kelime Tabanlı Video Üretimi", desc: "Bir kelime veya cümle yaz, yapay zeka otomatik arka plan ve atmosfer seçsin.", tag: "V2", active: true },
  { id: "ai-arkaplan", iconId: "ai_arkaplan", title: "AI Arka Plan Üretici", desc: "Yazdığın metne göre yapay zeka kendisi tema ve atmosfer belirleyecek.", tag: "V2", active: true },
  { id: "push", iconId: "push", title: "Akıllı Push Bildirimi", desc: "Cuma sabahı, kandil geceleri, özel gecelerde otomatik bildirim.", tag: "V2", active: true },
  { id: "ucretsiz-deneme", iconId: "ucretsiz_deneme", title: "Ücretsiz 7 Gün PRO Denemesi", desc: "Yeni üyelere 7 günlük ücretsiz PRO denemesi. Kredi kartı gerekmez.", tag: "V2", active: true },
  { id: "referans", iconId: "referans", title: "Referans & Davet Sistemi", desc: "Arkadaşını davet et, her ikisi de kazansın.", tag: "V2", active: true },
  { id: "arsiv", iconId: "arsiv", title: "Kullanıcı Arşivi", desc: "Ürettiğin tüm videoları kaydet, istediğin zaman indir.", tag: "V2", active: true },
  { id: "e-fatura", iconId: "e_fatura", title: "Otomatik E-Fatura", desc: "Satın alımlarda otomatik e-fatura.", tag: "V2", active: true },
  { id: "meal-dinle", iconId: "meal_dinle", title: "Meal Dinleme Modu", desc: "Videoları ses-only modda dinle.", tag: "V2", active: true },
];

const DEFAULT_V3: Omit<Feature, "votes">[] = [
  { id: "mobil-uygulama", iconId: "mobil", title: "Cebindeki Kur'an Stüdyosu", desc: "Telefonundan üret, indir, paylaş. İnternetsiz çalışsın, bildirim gelsin, her an üretime hazır ol. App Store ve Google Play'de olacak.", tag: "V3", active: true },
  { id: "ses-senkron", iconId: "ses_senkron", title: "Harika Kelvinlight", desc: "Okunan her kelime altın ışıkla parlayacak. Gözlerin takip edecek, ruhun dinleyecek. Hızlı okuma moduyla ezber bile yapabilirsin.", tag: "V3", active: true },
  { id: "reklam", iconId: "reklam", title: "Ücretsiz Kullanıcılar İçin Destek", desc: "Reklam geliriyle ücretsiz kullanıcılar da video üretebilecek. Sen seyret, o sana destek olsun. Pro kullanıcılar reklamsız devam edecek.", tag: "V3", active: true },
  { id: "coklu-kullanici", iconId: "coklu_kullanici", title: "Ailesiyle ve Ekibiyle Üretim", desc: "Tek hesapla karınla, çocuklarınla, ekibinle üret. Aile paketi, ekip paketi. Herkes kendi hesabından ama tek fatura.", tag: "V3", active: true },
  { id: "api", iconId: "api", title: "Camiler ve Medya İçin Entegrasyon", desc: "Camiler otomatik Cuma videosu üretebilecek. Medya kuruluşları tek tuşla binlerce video oluşturabilecek. API ile her şey otomatik.", tag: "V3", active: true },
  { id: "kurumsal", iconId: "kurumsal", title: "Ajanslar ve Medya Şirketleri", desc: "Özel logon, özel rengin, sınırsız üretim. Ajanslar ve medya şirketleri için beyaz etiketli çözüm. Senin isminle, senin markanla.", tag: "V3", active: true },
];

// iconId → emoji tablosu zaten yukarıda ICON_EMOJI olarak tanımlı

const STORAGE_KEY = "nur_roadmap_data";
const VOTE_KEY = "nur_roadmap_votes";
const DEADLINE_KEY = "nur_roadmap_deadline";

function loadFeatures(): { v2: Feature[]; v3: Feature[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    v2: DEFAULT_V2.map(f => ({ ...f, votes: 0 })),
    v3: DEFAULT_V3.map(f => ({ ...f, votes: 0 })),
  };
}

function saveFeatures(data: { v2: Feature[]; v3: Feature[] }) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

function getStoredVotes(): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(VOTE_KEY) || "{}"); } catch { return {}; }
}

function getDeadline(): string {
  try { return localStorage.getItem(DEADLINE_KEY) || ""; } catch { return ""; }
}

export const RoadmapModal: React.FC<RoadmapModalProps> = ({ open, onClose, adminEmail }) => {
  const isAdmin = adminEmail ? isAdminEmail(adminEmail) : false;
  const [data, setData] = useState(() => loadFeatures());
  const [localVotes, setLocalVotes] = useState<Record<string, boolean>>(() => getStoredVotes());
  const [deadline, setDeadline] = useState(() => getDeadline());
  const [adminMode, setAdminMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newVersion, setNewVersion] = useState<"V2" | "V3">("V2");
  const [showAddForm, setShowAddForm] = useState(false);

  if (!open) return null;

  const isDeadlinePassed = deadline && new Date(deadline) < new Date();
  const daysLeft = deadline ? Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000)) : null;

  const save = (newData: { v2: Feature[]; v3: Feature[] }) => {
    setData(newData);
    saveFeatures(newData);
  };

  const handleVote = (id: string) => {
    if (isDeadlinePassed) return;
    const prevId = Object.keys(localVotes).find(k => localVotes[k]);
    // Aynı oya tekrar tıklandıysa — oyu kaldır
    if (prevId === id) {
      const newVotes = { ...localVotes };
      delete newVotes[id];
      setLocalVotes(newVotes);
      try { localStorage.setItem(VOTE_KEY, JSON.stringify(newVotes)); } catch {}
      const v2 = data.v2.map(f => f.id === id ? { ...f, votes: Math.max(0, f.votes - 1) } : f);
      const v3 = data.v3.map(f => f.id === id ? { ...f, votes: Math.max(0, f.votes - 1) } : f);
      save({ v2, v3 });
      return;
    }
    // Farklı bir FEATURE'a oy verildi — eskisini sil, yenisini ekle
    const newVotes: Record<string, boolean> = { [id]: true };
    setLocalVotes(newVotes);
    try { localStorage.setItem(VOTE_KEY, JSON.stringify(newVotes)); } catch {}
    const v2 = data.v2.map(f => {
      if (f.id === id) return { ...f, votes: f.votes + 1 };
      if (prevId && f.id === prevId) return { ...f, votes: Math.max(0, f.votes - 1) };
      return f;
    });
    const v3 = data.v3.map(f => {
      if (f.id === id) return { ...f, votes: f.votes + 1 };
      if (prevId && f.id === prevId) return { ...f, votes: Math.max(0, f.votes - 1) };
      return f;
    });
    save({ v2, v3 });
  };

  const handleResetVotes = () => {
    if (!confirm("Tüm oyları sıfırlamak istediğine emin misin?")) return;
    const v2 = data.v2.map(f => ({ ...f, votes: 0 }));
    const v3 = data.v3.map(f => ({ ...f, votes: 0 }));
    save({ v2, v3 });
    setLocalVotes({});
    try { localStorage.removeItem(VOTE_KEY); } catch {}
  };

  const handleDeleteFeature = (id: string, version: "V2" | "V3") => {
    if (!confirm("Bu özelliği silmek istediğine emin misin?")) return;
    if (version === "V2") save({ ...data, v2: data.v2.filter(f => f.id !== id) });
    else save({ ...data, v3: data.v3.filter(f => f.id !== id) });
  };    const handleAddFeature = () => {
    if (!newTitle.trim()) return;
    const newFeature: Feature = {
      id: `custom-${Date.now()}`,
      iconId: "ai_arkaplan",
      title: newTitle.trim(),
      desc: newDesc.trim() || "Yakında eklenecek.",
      tag: newVersion,
      votes: 0,
      active: true,
    };
    if (newVersion === "V2") save({ ...data, v2: [...data.v2, newFeature] });
    else save({ ...data, v3: [...data.v3, newFeature] });
    setNewTitle("");
    setNewDesc("");
    setShowAddForm(false);
  };

  const handleSaveEdit = (id: string, version: "V2" | "V3") => {
    if (!editTitle.trim()) return;
    const updater = (f: Feature) => f.id === id ? { ...f, title: editTitle.trim(), desc: editDesc.trim() } : f;
    if (version === "V2") save({ ...data, v2: data.v2.map(updater) });
    else save({ ...data, v3: data.v3.map(updater) });
    setEditingId(null);
  };

  const handleSaveDeadline = () => {
    try { localStorage.setItem(DEADLINE_KEY, deadline); } catch {}
  };

  const totalVotes = [...data.v2, ...data.v3].reduce((sum, f) => sum + f.votes, 0);

  const renderFeature = (f: Feature, version: "V2" | "V3") => {
    const isEditing = editingId === f.id;
    const emoji = getIcon(f.iconId);

    return (
      <div key={f.id} className={`flex items-start gap-3 p-3 rounded-xl border transition group ${version === "V2" ? "bg-white/[0.03] border-white/5 hover:border-amber-500/20" : "bg-white/[0.02] border-white/[0.03] opacity-60 hover:opacity-80"}`}>
        <div className={`mt-0.5 p-1.5 rounded-lg text-sm group-hover:scale-110 transition ${version === "V2" ? "" : "bg-purple-500/10"}`} style={version === "V2" ? { backgroundColor: "var(--accent-2)", opacity: 0.15 } : undefined}>
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-1.5">
              <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full rounded-lg bg-white/10 px-2 py-1 text-[10px] text-white outline-none" placeholder="Özellik adı" />
              <input value={editDesc} onChange={e => setEditDesc(e.target.value)} className="w-full rounded-lg bg-white/10 px-2 py-1 text-[10px] text-white outline-none" placeholder="Açıklama" />
              <div className="flex gap-1.5">
                <button onClick={() => handleSaveEdit(f.id, version)} className="rounded-lg bg-green-500/20 px-2 py-0.5 text-[9px] font-bold text-green-300">Kaydet</button>
                <button onClick={() => setEditingId(null)} className="rounded-lg bg-white/10 px-2 py-0.5 text-[9px] text-white/50">İptal</button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-white">{f.title}</span>
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${version === "V2" ? "bg-green-500/15 text-green-400 border border-green-500/20" : "bg-purple-500/15 text-purple-300 border border-purple-500/20"}`}>{f.tag}</span>
              </div>
              <p className={`text-[10px] mt-0.5 leading-relaxed ${version === "V2" ? "text-white/50" : "text-white/40"}`}>{f.desc}</p>
            </>
          )}
        </div>

        {/* Oy + Admin Kontrolleri */}
        <div className="flex flex-col items-center gap-0.5 shrink-0">
          {!adminMode && (
            <>
              <button
                onClick={() => handleVote(f.id)}
                disabled={isDeadlinePassed}
                className={`p-1.5 rounded-lg transition ${localVotes[f.id] ? (version === "V2" ? "bg-amber-500/20 text-amber-300" : "bg-purple-500/20 text-purple-300") : (version === "V2" ? "bg-white/5 text-white/30 hover:bg-amber-500/15 hover:text-amber-300" : "bg-white/5 text-white/20 hover:bg-purple-500/15 hover:text-purple-300")}`}
              >
                <ThumbsUp size={12} />
              </button>
              <span className={`text-[9px] font-bold ${localVotes[f.id] ? (version === "V2" ? "text-amber-300" : "text-purple-300") : "text-white/25"}`}>
                {f.votes.toLocaleString("tr-TR")}
              </span>
            </>
          )}
          {isAdmin && adminMode && (
            <>
              <button onClick={() => { setEditingId(f.id); setEditTitle(f.title); setEditDesc(f.desc); }} className="p-1 rounded bg-blue-500/15 text-blue-300 hover:bg-blue-500/25 transition" title="Düzenle">
                <Edit3 size={10} />
              </button>
              <button onClick={() => handleDeleteFeature(f.id, version)} className="p-1 rounded bg-red-500/15 text-red-300 hover:bg-red-500/25 transition" title="Sil">
                <Trash2 size={10} />
              </button>
              <span className="text-[8px] text-white/20">{f.votes}</span>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative max-w-2xl w-full max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10 bg-gradient-to-b from-gray-900 via-gray-950 to-black shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-gray-950/90 backdrop-blur px-6 py-4">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Rocket size={20} style={{ color: "var(--accent-2)" }} />
              Güncelleme Yol Haritası
            </h2>
            <p className="text-[11px] text-white/40 mt-0.5">Nûr Stüdyo — Gelecek planları ve v2-v3 yenilikleri</p>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button onClick={() => setAdminMode(!adminMode)} className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[9px] font-bold transition ${adminMode ? "bg-amber-500/20 text-amber-300" : "bg-white/5 text-white/30 hover:bg-white/10"}`}>
                <Settings size={11} />
                {adminMode ? "Admin Açık" : "Admin"}
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 transition">
              <X size={18} className="text-white/50" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Admin Paneli */}
          {isAdmin && adminMode && (
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Settings size={13} className="text-amber-400" />
                <span className="text-[11px] font-bold text-amber-300">Admin Kontrol Paneli</span>
              </div>

              {/* Oylama Süresi */}
              <div className="flex items-center gap-2">
                <Clock size={12} className="text-white/50" />
                <span className="text-[10px] text-white/60">Oylama Bitiş Tarihi:</span>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="rounded-lg bg-white/10 px-2 py-1 text-[10px] text-white outline-none"
                />
                <button onClick={handleSaveDeadline} className="rounded-lg bg-green-500/20 px-2 py-1 text-[9px] font-bold text-green-300">Kaydet</button>
                {deadline && (
                  <button onClick={() => { setDeadline(""); try { localStorage.removeItem(DEADLINE_KEY); } catch {} }} className="rounded-lg bg-white/10 px-2 py-1 text-[9px] text-white/40">Kaldır</button>
                )}
              </div>
              {daysLeft !== null && (
                <p className="text-[9px] text-white/30">
                  {isDeadlinePassed ? "⏰ Oylama süresi doldu" : `📅 ${daysLeft} gün kaldı`}
                </p>
              )}

              {/* Yeni Özellik Ekleme */}
              {!showAddForm ? (
                <button onClick={() => setShowAddForm(true)} className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-[10px] font-bold text-white/60 hover:bg-white/10 transition">
                  <Plus size={12} /> Yeni Özellik Ekle
                </button>
              ) : (
                <div className="rounded-lg bg-black/30 p-3 space-y-2">
                  <div className="flex gap-2">
                    <select value={newVersion} onChange={e => setNewVersion(e.target.value as "V2" | "V3")} className="rounded-lg bg-white/10 px-2 py-1 text-[10px] text-white outline-none">
                      <option value="V2">V2</option>
                      <option value="V3">V3</option>
                    </select>
                    <input value={newTitle} onChange={e => setNewTitle(e.target.value)} className="flex-1 rounded-lg bg-white/10 px-2 py-1 text-[10px] text-white outline-none" placeholder="Özellik adı (ör: AI Meal Seslendirme)" />
                  </div>
                  <input value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full rounded-lg bg-white/10 px-2 py-1 text-[10px] text-white outline-none" placeholder="Kısa açıklama (opsiyonel)" />
                  <div className="flex gap-2">
                    <button onClick={handleAddFeature} className="rounded-lg bg-green-500/20 px-3 py-1 text-[9px] font-bold text-green-300">Ekle</button>
                    <button onClick={() => { setShowAddForm(false); setNewTitle(""); setNewDesc(""); }} className="rounded-lg bg-white/10 px-3 py-1 text-[9px] text-white/40">İptal</button>
                  </div>
                </div>
              )}

              {/* Toplu İşlemler */}
              <div className="flex gap-2 pt-1">
                <button onClick={handleResetVotes} className="flex items-center gap-1 rounded-lg bg-red-500/15 px-2.5 py-1 text-[9px] font-bold text-red-300 hover:bg-red-500/25 transition">
                  <RotateCcw size={10} /> Oyları Sıfırla
                </button>
                <button onClick={() => { save({ v2: DEFAULT_V2.map(f => ({ ...f, votes: 0 })), v3: DEFAULT_V3.map(f => ({ ...f, votes: 0 })) }); setLocalVotes({}); }} className="flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1 text-[9px] text-white/40 hover:bg-white/10 transition">
                  <RotateCcw size={10} /> Varsayılana Dön
                </button>
              </div>
            </div>
          )}

          {/* Oy Sayacı */}
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-center">
            <p className="text-[10px] text-amber-300/80 font-bold">
              🗳️ Toplam <span className="text-amber-200 font-black">{totalVotes.toLocaleString("tr-TR")}</span> oy kullanıldı
            </p>
            {deadline && !isDeadlinePassed && daysLeft !== null && (
              <p className="text-[9px] text-white/30 mt-0.5">⏰ {daysLeft} gün kaldı — hangisi önce gelsin sen belirle</p>
            )}
            {isDeadlinePassed && (
              <p className="text-[9px] text-red-400/60 mt-0.5">⏰ Oylama süresi doldu</p>
            )}
            {!deadline && (
              <p className="text-[9px] text-white/30 mt-0.5">Hangi özelliği önce istiyorsan oyla — öncelik senin olsun</p>
            )}
          </div>

          {/* V2 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider" style={{ backgroundColor: "var(--accent-2)", color: "#000" }}>V2</div>
              <span className="text-sm font-bold text-white">Yakında Gelen Güncellemeler</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-500/15 text-green-400 border border-green-500/20">{data.v2.filter(f => f.active).length} özellik</span>
            </div>
            <div className="space-y-2">
              {data.v2.filter(f => f.active).sort((a, b) => b.votes - a.votes).map(f => renderFeature(f, "V2"))}
            </div>
          </div>

          {/* V3 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider bg-purple-500 text-white">V3</div>
              <span className="text-sm font-bold text-white">Uzun Vadeli Planlar</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/20">{data.v3.filter(f => f.active).length} özellik</span>
            </div>
            <div className="space-y-2">
              {data.v3.filter(f => f.active).sort((a, b) => b.votes - a.votes).map(f => renderFeature(f, "V3"))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-2 pb-4 space-y-1">
            <p className="text-[10px] text-white/30">🕌 Nûr Stüdyo — Dünyada tek "Kur'an Video Üreten AI Stüdyo"</p>
            <p className="text-[9px] text-white/20">Özellikler developmental sırayla eklenecektir</p>
          </div>
        </div>
      </div>
    </div>
  );
};
