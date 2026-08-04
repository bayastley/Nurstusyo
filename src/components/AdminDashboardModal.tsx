import React, { useMemo, useState } from "react";
import { Bell, LockKeyhole, Save, Send } from "lucide-react";
import {
  getSystemConfig,
  saveAnnouncement,
  setFeatureLock,
  type Announcement,
  type FeatureLock,
} from "../services/adminSyncService";

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

export const AdminBroadcastPanel: React.FC<AdminBroadcastPanelProps> = ({ notify }) => {
  const initial = useMemo(() => getSystemConfig(), []);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [detail, setDetail] = useState("");
  const [kind, setKind] = useState<Announcement["kind"]>("update");
  const [blinking, setBlinking] = useState(true);
  const [startsAt, setStartsAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [endsAt, setEndsAt] = useState(() => new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16));
  const [featureId, setFeatureId] = useState<string>(FEATURE_OPTIONS[0][0]);
  const [featureLock, setFeatureLockState] = useState<FeatureLock>(initial.featureLocks[FEATURE_OPTIONS[0][0]] ?? "free");

  const publish = () => {
    if (!title.trim() || !message.trim()) {
      notify("Duyuru basligi ve kisa mesaj gerekli");
      return;
    }
    saveAnnouncement({
      id: `announcement-${Date.now()}`,
      title: title.trim(),
      message: message.trim(),
      detail: detail.trim(),
      kind,
      active: true,
      blinking,
      startsAt: new Date(startsAt).toISOString(),
      endsAt: new Date(endsAt).toISOString(),
      updatedAt: new Date().toISOString(),
    });
    notify("Duyuru kaydedildi. Bulut Sync ile herkese yayinlayin.");
  };

  const saveLock = () => {
    setFeatureLock(featureId, featureLock);
    notify("Ozellik kilidi kaydedildi. Bulut Sync ile herkese yayinlayin.");
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
            <input type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} className="glass-soft rounded-xl px-3 py-2 text-xs text-white" />
            <input type="datetime-local" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} className="glass-soft rounded-xl px-3 py-2 text-xs text-white" />
          </div>
          <button onClick={publish} className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-black text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}><Send size={13} /> Duyuruyu Kaydet</button>
        </div>
      </section>

      <section className="rounded-2xl border border-emerald-400/20 bg-black/35 p-4">
        <h4 className="mb-3 flex items-center gap-2 text-xs font-black text-white"><LockKeyhole size={15} /> Ozellik Kilitlari</h4>
        <div className="space-y-2">
          <select value={featureId} onChange={(event) => { const id = event.target.value; setFeatureId(id); setFeatureLockState(getSystemConfig().featureLocks[id] ?? "free"); }} className="glass-soft w-full rounded-xl px-3 py-3 text-xs text-white">
            {FEATURE_OPTIONS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </select>
          <select value={featureLock} onChange={(event) => setFeatureLockState(event.target.value as FeatureLock)} className="glass-soft w-full rounded-xl px-3 py-3 text-xs text-white">
            {LOCK_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <p className="rounded-xl bg-white/[.04] p-3 text-[10px] leading-relaxed text-white/45">Bu ayar Gist Bulut Sync ile yayinlandiginda tum kullanicilara aktarilir.</p>
          <button onClick={saveLock} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-black text-black"><Save size={13} /> Kilidi Kaydet</button>
        </div>
      </section>
    </div>
  );
};
