import React, { useState } from "react";
import { Bell, LockKeyhole, Save, Send, Trash2 } from "lucide-react";
import { type Announcement, type FeatureLock, saveAnnouncement, getSystemConfig, saveSystemConfig, setFeatureLock } from "../services/adminSyncService";
import { RECITERS } from "../reciters";

interface AdminBroadcastPanelProps {
  notify: (message: string) => void;
}

const LOCK_OPTIONS: Array<{ value: FeatureLock; label: string }> = [
  { value: "free", label: "Herkese Açık" },
  { value: "pro", label: "Pro" },
  { value: "elit", label: "Elit" },
  { value: "v2", label: "V2 Yakında" },
  { value: "v3", label: "V3 Yakında" },
  { value: "maintenance", label: "🔧 Bakımda" },
  { value: "off", label: "Tamamen Kapalı" },
];

const FEATURE_OPTIONS = [
  ["atmosphere", "Atmosfer Galerisi"],
  ["reciters", "Hoca ve Tilavet"],
  ["themes", "Tema Galerisi"],
  ["smart-ai", "Akıllı AI"],
  ["batch", "Toplu Format"],
  ["full-mode", "Tam Sürüm"],
] as const;

const CATEGORY_OPTIONS = [
  ["namaz", "Namaz & Kabe"],
  ["musaf", "Kur'an & Mushaf"],
  ["cicekler", "Çiçekler"],
  ["yildizlar", "Yıldızlar"],
  ["deniz", "Deniz"],
  ["daglar", "Dağlar"],
  ["gunbatimi", "Gün Batımı"],
  ["gece", "Gece"],
  ["selale", "Şelaleler"],
  ["orman", "Orman"],
  ["cami", "İslam Mimarisi"],
  ["gol", "Sakin Göl"],
  ["bulut", "Bulutlar"],
  ["desen", "Geometrik Desen"],
  ["cennet", "Cennet"],
  ["col", "Çöl"],
  ["ates", "Ateş"],
] as const;

const RECITER_OPTIONS = RECITERS.map((reciter) => [reciter.id, reciter.name] as const);

async function adminAction(body: unknown): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch { return false; }
}

function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }

export const AdminBroadcastPanel: React.FC<AdminBroadcastPanelProps> = ({ notify }) => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [detail, setDetail] = useState("");
  const [kind, setKind] = useState<Announcement["kind"]>("update");
  const [blinking, setBlinking] = useState(true);
  const [startsAt, setStartsAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [endsAt, setEndsAt] = useState(() => new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16));
  const [featureId, setFeatureId] = useState<string>(FEATURE_OPTIONS[0][0]);
  const [featureLock, setFeatureLockState] = useState<FeatureLock>("free");
  const [forceOpen, setForceOpen] = useState(false);
  const [requireAck, setRequireAck] = useState(false);
  const [lockType, setLockType] = useState<"all" | "category" | "reciter">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedReciter, setSelectedReciter] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const publish = async () => {
    if (!title.trim() || !message.trim()) { notify("Başlık ve kısa mesaj zorunlu"); return; }
    setSaving(true);
    // localStorage'a yaz (anında)
    const ann: Announcement = {
      id: uid(),
      title: title.trim(),
      message: message.trim(),
      detail: detail.trim(),
      kind,
      active: true,
      blinking,
      startsAt: new Date(startsAt).toISOString(),
      endsAt: new Date(endsAt).toISOString(),
      updatedAt: new Date().toISOString(),
      forceOpen,
      requireAck,
    };
    saveAnnouncement(ann);
    const ok = await adminAction({ action: "publish_announcement", announcement: ann });
    setSaving(false);
    if (ok) {
      notify("✅ Duyuru tüm kullanıcılara yayınlandı");
    } else {
      notify("✅ Duyuru bu cihazda yayınlandı (Supabase erişimi yok — admin girişi gerekli)");
    }
    setTitle(""); setMessage(""); setDetail("");
  };

  const clearAll = async () => {
    // localStorage temizle
    const cfg = getSystemConfig();
    cfg.announcements = [];
    saveSystemConfig(cfg);
    try { localStorage.removeItem("nur_read_announcement"); } catch { /* ignore */ }
    await adminAction({ action: "clear_all_announcements" });
    notify("🗑️ Tüm duyurular kaldırıldı · Sayfa yenilenince tümünde gider");
  };

  const applyLock = async () => {
    let targetId = featureId;
    if (lockType === "category" && selectedCategory) targetId = selectedCategory;
    else if (lockType === "reciter" && selectedReciter) targetId = selectedReciter;
    if (!targetId) { notify("Lütfen bir hedef seçin"); return; }
    // localStorage'a yaz (anında)
    setFeatureLock(targetId, featureLock);
    const ok = await adminAction({ action: "set_feature_lock", featureId: targetId, lockLevel: featureLock });
    const labelMap: Record<string, string> = { maintenance: "🔧 Bakımda", off: "Kapalı", free: "Açık", pro: "Pro", elit: "Elit", v2: "V2", v3: "V3" };
    const label = labelMap[featureLock] ?? featureLock;
    if (ok) {
      notify(`✅ "${targetId}" → ${label} · Tüm kullanıcılara uygulandı`);
    } else {
      notify(`✅ "${targetId}" → ${label} · Bu cihazda aktif (Supabase için admin girişi yapın)`);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-2xl border border-amber-400/25 bg-black/35 p-4">
        <h4 className="mb-3 flex items-center gap-2 text-xs font-black text-white"><Bell size={15} /> Canlı Duyuru</h4>
        <div className="space-y-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Duyuru başlığı" className="glass-soft w-full rounded-xl px-3 py-2 text-xs text-white outline-none" />
          <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Üstte görünecek kısa mesaj" className="glass-soft w-full rounded-xl px-3 py-2 text-xs text-white outline-none" />
          <textarea value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Tıklanınca açılacak detay (opsiyonel)" rows={3} className="glass-soft w-full resize-none rounded-xl px-3 py-2 text-xs text-white outline-none" />
          <div className="grid grid-cols-2 gap-2">
            <select value={kind} onChange={(e) => setKind(e.target.value as Announcement["kind"])} className="glass-soft rounded-xl px-3 py-2 text-xs text-white">
              <option value="update">Güncelleme</option>
              <option value="info">Bilgi</option>
              <option value="warning">Uyarı</option>
            </select>
            <label className="glass-soft flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-xs text-white">
              <input type="checkbox" checked={blinking} onChange={(e) => setBlinking(e.target.checked)} /> Yanıp sönsün
            </label>
            <label className="glass-soft flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-xs text-white">
              <input type="checkbox" checked={forceOpen} onChange={(e) => setForceOpen(e.target.checked)} /> Girişte aç
            </label>
            <label className="glass-soft flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-xs text-white">
              <input type="checkbox" checked={requireAck} onChange={(e) => setRequireAck(e.target.checked)} /> Okudum zorunlu
            </label>
            <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className="glass-soft rounded-xl px-3 py-2 text-xs text-white" />
            <input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className="glass-soft rounded-xl px-3 py-2 text-xs text-white" />
          </div>
          <button onClick={publish} disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-black text-black disabled:opacity-50" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
            <Send size={13} /> {saving ? "Yayınlanıyor..." : "Duyuruyu Yayınla"}
          </button>
          <button onClick={clearAll} className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/20">
            <Trash2 size={13} /> Tüm Duyuruları Kaldır
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-emerald-400/20 bg-black/35 p-4">
        <h4 className="mb-3 flex items-center gap-2 text-xs font-black text-white"><LockKeyhole size={15} /> Özellik Kilitleri</h4>
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-1">
            {(["all", "category", "reciter"] as const).map((t) => (
              <button key={t} onClick={() => setLockType(t)} className={`rounded-lg px-2 py-2 text-[10px] font-bold ${lockType === t ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40" : "bg-white/5 text-white/60"}`}>
                {t === "all" ? "Özellik" : t === "category" ? "Kategori" : "Hoca"}
              </button>
            ))}
          </div>
          {lockType === "all" && (
            <select value={featureId} onChange={(e) => setFeatureId(e.target.value)} className="glass-soft w-full rounded-xl px-3 py-3 text-xs text-white">
              {FEATURE_OPTIONS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select>
          )}
          {lockType === "category" && (
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="glass-soft w-full rounded-xl px-3 py-3 text-xs text-white">
              <option value="">Kategori seç...</option>
              {CATEGORY_OPTIONS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select>
          )}
          {lockType === "reciter" && (
            <select value={selectedReciter} onChange={(e) => setSelectedReciter(e.target.value)} className="glass-soft w-full rounded-xl px-3 py-3 text-xs text-white">
              <option value="">Hoca seç...</option>
              {RECITER_OPTIONS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select>
          )}
          <select value={featureLock} onChange={(e) => setFeatureLockState(e.target.value as FeatureLock)} className="glass-soft w-full rounded-xl px-3 py-3 text-xs text-white">
            {LOCK_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {featureLock === "maintenance" && (
            <div className="rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-3 py-2 text-[10px] text-yellow-300">
              🔧 Bakımda seçildi → Uygulayınca seçilen hedefte sarı rozet çıkar.
            </div>
          )}
          <button onClick={applyLock} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-black text-black">
            <Save size={13} /> Kilidi Uygula
          </button>
        </div>
      </section>
    </div>
  );
};
