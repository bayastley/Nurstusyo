import React, { useState } from "react";
import { Bell, LockKeyhole, Save, Send } from "lucide-react";
import { type Announcement, type FeatureLock } from "../services/adminSyncService";

interface AdminBroadcastPanelProps {
  notify: (message: string) => void;
}

const LOCK_OPTIONS: Array<{ value: FeatureLock; label: string }> = [
  { value: "free", label: "Herkese Acik" },
  { value: "pro", label: "Pro" },
  { value: "elit", label: "Elit" },
  { value: "v2", label: "V2 Yakinda" },
  { value: "v3", label: "V3 Yakinda" },
  { value: "maintenance", label: "Bakimda" },
  { value: "off", label: "Tamamen Kapali" },
];

const FEATURE_OPTIONS = [
  ["atmosphere", "Atmosfer Galerisi"],
  ["reciters", "Hoca ve Tilavet"],
  ["themes", "Tema Galerisi"],
  ["smart-ai", "Akilli AI"],
  ["batch", "Toplu Format"],
  ["full-mode", "Tam Surum"],
  ["zip-upload", "ZIP ve Gorsel Yukleme"],
] as const;

const CATEGORY_OPTIONS = [
  ["namaz", "Namaz & Kabe"],
  ["musaf", "Kur'an & Mushaf"],
  ["cicekler", "Cicekler & Guller"],
  ["yildizlar", "Yildizlar & Uzay"],
  ["deniz", "Deniz & Dalgalar"],
  ["daglar", "Daglar & Zirve"],
  ["gunbatimi", "Gun Batimi"],
  ["gece", "Gece & Ay"],
  ["selale", "Selaleler"],
  ["orman", "Orman & Yesil"],
] as const;

const RECITER_OPTIONS = [
  ["sudais", "Abdurrahman es-Sudays"],
  ["shuraim", "Suud es-Sureym"],
  ["maher", "Maher el-Muaiqly"],
  ["hudhaify", "Ali el-Hudeyfi"],
  ["husary", "Mahmud Halil el-Husari"],
  ["abdulbasit", "Abdulbasit Abdussamed"],
  ["minshawi", "Muhammed Siddik el-Minsavi"],
  ["alafasy", "Misari Resid el-Afasi"],
  ["shatri", "Ebu Bekir es-Satiri"],
  ["muhaisny", "Muhammed el-Muhaysini"],
] as const;

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
  const [saving, setSaving] = useState(false);
  // Kategori ve Hoca secimi icin
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedReciter, setSelectedReciter] = useState<string>("");
  const [lockType, setLockType] = useState<"all" | "category" | "reciter">("all");

  const publish = async () => {
    if (!title.trim() || !message.trim()) {
      notify("Duyuru basligi ve kisa mesaj gerekli");
      return;
    }
    setSaving(true);
    const response = await fetch("/api/admin/action", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "publish_announcement", announcement: {
      title: title.trim(),
      message: message.trim(),
      detail: detail.trim(),
      kind,
      active: true,
      blinking,
      startsAt: new Date(startsAt).toISOString(),
      endsAt: new Date(endsAt).toISOString(),
      forceOpen,
      requireAck,
    } }) });
    setSaving(false);
    notify(response.ok ? "Duyuru tüm kullanıcılara yayınlandı" : "Duyuru yayınlanamadı");
  };

  const saveLock = async () => {
    let targetId = featureId;
    if (lockType === "category" && selectedCategory) { targetId = selectedCategory; }
    else if (lockType === "reciter" && selectedReciter) { targetId = selectedReciter; }
    
    const response = await fetch("/api/admin/action", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "set_feature_lock", featureId: targetId, lockLevel: featureLock, lockType: lockType === "all" ? "feature" : lockType }) });
    
    let msg = "Kilit kaydedilemedi";
    if (response.ok) {
      if (lockType === "category") { msg = "Kategori kilidi: " + selectedCategory; }
      else if (lockType === "reciter") { msg = "Hoca kilidi: " + selectedReciter; }
      else { msg = "Kilit uygulandi"; }
    }
    notify(msg);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-2xl border border-amber-400/25 bg-black/35 p-4">
        <h4 className="mb-3 flex items-center gap-2 text-xs font-black text-white"><Bell size={15} /> Canli Duyuru</h4>
        <div className="space-y-2">
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Duyuru basligi" className="glass-soft w-full rounded-xl px-3 py-2 text-xs text-white outline-none" />
          <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ana sayfada gorunecek kisa mesaj" className="glass-soft w-full rounded-xl px-3 py-2 text-xs text-white outline-none" />
          <textarea value={detail} onChange={(event) => setDetail(event.target.value)} placeholder="Tiklandiginda acilacak detay" rows={4} className="glass-soft w-full resize-none rounded-xl px-3 py-2 text-xs text-white outline-none" />
          <div className="grid grid-cols-2 gap-2">
            <select value={kind} onChange={(event) => setKind(event.target.value as Announcement["kind"])} className="glass-soft rounded-xl px-3 py-2 text-xs text-white"><option value="update">Guncelleme</option><option value="info">Bilgi</option><option value="warning">Uyari</option></select>
            <label className="glass-soft flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-white"><input type="checkbox" checked={blinking} onChange={(event) => setBlinking(event.target.checked)} /> Yanip sonsun</label>
            <label className="glass-soft flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-white"><input type="checkbox" checked={forceOpen} onChange={(event) => setForceOpen(event.target.checked)} /> Giriste ac</label>
            <label className="glass-soft flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-white"><input type="checkbox" checked={requireAck} onChange={(event) => setRequireAck(event.target.checked)} /> Okudum zorunlu</label>
            <input type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} className="glass-soft rounded-xl px-3 py-2 text-xs text-white" />
            <input type="datetime-local" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} className="glass-soft rounded-xl px-3 py-2 text-xs text-white" />
          </div>
          <button disabled={saving} onClick={() => void publish()} className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-black text-black disabled:opacity-50" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}><Send size={13} /> Duyuruyu Yayinla</button>
        </div>
      </section>

      <section className="rounded-2xl border border-emerald-400/20 bg-black/35 p-4">
        <h4 className="mb-3 flex items-center gap-2 text-xs font-black text-white"><LockKeyhole size={15} /> Ozellik Kilitlari</h4>
        <div className="space-y-2">
          {/* Kilit tipi secimi */}
          <div className="grid grid-cols-3 gap-1">
            <button onClick={() => setLockType("all")} className={`rounded-lg px-2 py-2 text-[10px] font-bold ${lockType === "all" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40" : "bg-white/5 text-white/60"}`}>Tum</button>
            <button onClick={() => setLockType("category")} className={`rounded-lg px-2 py-2 text-[10px] font-bold ${lockType === "category" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40" : "bg-white/5 text-white/60"}`}>Kategori</button>
            <button onClick={() => setLockType("reciter")} className={`rounded-lg px-2 py-2 text-[10px] font-bold ${lockType === "reciter" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40" : "bg-white/5 text-white/60"}`}>Hoca</button>
          </div>
          {/* Kategori secimi */}
          {lockType === "category" && (
            <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)} className="glass-soft w-full rounded-xl px-3 py-3 text-xs text-white">
              <option value="">Kategori sec...</option>
              {CATEGORY_OPTIONS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select>
          )}
          {/* Hoca secimi */}
          {lockType === "reciter" && (
            <select value={selectedReciter} onChange={(event) => setSelectedReciter(event.target.value)} className="glass-soft w-full rounded-xl px-3 py-3 text-xs text-white">
              <option value="">Hoca sec...</option>
              {RECITER_OPTIONS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select>
          )}
          {/* Ozellik secimi (tum seciliyken) */}
          {lockType === "all" && (
            <select value={featureId} onChange={(event) => setFeatureId(event.target.value)} className="glass-soft w-full rounded-xl px-3 py-3 text-xs text-white">
              {FEATURE_OPTIONS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select>
          )}
          {/* Kilit seviyesi */}
          <select value={featureLock} onChange={(event) => setFeatureLockState(event.target.value as FeatureLock)} className="glass-soft w-full rounded-xl px-3 py-3 text-xs text-white">
            {LOCK_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <p className="rounded-xl bg-white/[.04] p-3 text-[10px] leading-relaxed text-white/45">Bu ayar Supabase üzerinden tüm kullanıcılara uygulanır.</p>
          <button onClick={() => void saveLock()} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-black text-black"><Save size={13} /> Kilidi Uygula</button>
        </div>
      </section>
    </div>
  );
};
