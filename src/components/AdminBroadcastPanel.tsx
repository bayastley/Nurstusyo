import React, { useState } from "react";
import { Bell, LockKeyhole, Mail, Save, Send, Trash2, History, Unlock, RotateCcw, CheckCircle2 } from "lucide-react";
import { type Announcement, type FeatureLock, saveAnnouncement, getSystemConfig, saveSystemConfig, setFeatureLock, type MaintenanceConfig } from "../services/adminSyncService";
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

// ★ Kilit işlem geçmişi — geri alma desteğiyle (cihazda saklanır)
interface LockHistoryEntry {
  id: string;
  target: string;       // kilitlenen hedef id
  targetLabel: string;  // okunur ad
  from: FeatureLock | "mixed"; // eski değer (geri alma için; toplu işlemde mixed)
  to: FeatureLock;      // yeni değer
  at: string;           // ISO zaman
  reverted?: boolean;   // geri alındı mı?
}
const LOCK_HISTORY_KEY = "nur_lock_history_v1";
function loadLockHistory(): LockHistoryEntry[] {
  try { return JSON.parse(localStorage.getItem(LOCK_HISTORY_KEY) || "[]"); } catch { return []; }
}
function saveLockHistory(list: LockHistoryEntry[]) {
  try { localStorage.setItem(LOCK_HISTORY_KEY, JSON.stringify(list.slice(0, 30))); } catch { /* ignore */ }
}
const LOCK_LABELS: Record<string, string> = { maintenance: "🔧 Bakımda", off: "🚫 Kapalı", free: "✅ Açık", pro: "👑 Pro", elit: "💎 Elit", v2: "🔒 V2 Yakında", v3: "🔒 V3 Yakında" };
const LOCK_COLORS: Record<string, string> = {
  maintenance: "bg-yellow-400/15 text-yellow-300 border-yellow-400/30",
  off: "bg-red-500/15 text-red-300 border-red-500/30",
  free: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  pro: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  elit: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  v2: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  v3: "bg-slate-500/15 text-slate-300 border-slate-500/30",
};

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
  const [lockStatus, setLockStatus] = useState("");
  const [maintenance, setMaintenance] = useState<MaintenanceConfig>(() => getSystemConfig().maintenance!);
  // ★ Aktif kilitler + işlem geçmişi (geri alma destekli)
  const [lockHistory, setLockHistory] = useState<LockHistoryEntry[]>(() => loadLockHistory());
  const [activeLocks, setActiveLocks] = useState<Record<string, FeatureLock>>(() => getSystemConfig().featureLocks);

  const refreshLocks = () => {
    setActiveLocks({ ...getSystemConfig().featureLocks });
    setLockHistory(loadLockHistory());
  };

  // ★ Tek kilidi kaldır (free'e döndür)
  const removeLock = (targetId: string) => {
    const old = activeLocks[targetId];
    setFeatureLock(targetId, "free");
    const history = [{ id: uid(), target: targetId, targetLabel: targetId, from: old, to: "free" as FeatureLock, at: new Date().toISOString(), reverted: false }, ...loadLockHistory()];
    saveLockHistory(history);
    refreshLocks();
    void adminAction({ action: "set_feature_lock", featureId: targetId, lockLevel: "free" });
    notify(`✅ "${targetId}" kilidi kaldırıldı — herkese açık`);
  };

  // ★ Tüm kilitleri kaldır
  const removeAllLocks = () => {
    if (!confirm("TÜM özellik kilitleri kaldırılıp her şey herkese açılsın mı?")) return;
    const cfg = getSystemConfig();
    const targets = Object.keys(cfg.featureLocks);
    for (const t of targets) cfg.featureLocks[t] = "free";
    saveSystemConfig(cfg);
    for (const t of targets) void adminAction({ action: "set_feature_lock", featureId: t, lockLevel: "free" });
    const history = [{ id: uid(), target: `(tümü: ${targets.length} kilit)`, targetLabel: "Tümü", from: "mixed" as FeatureLock, to: "free" as FeatureLock, at: new Date().toISOString() }, ...loadLockHistory()];
    saveLockHistory(history);
    refreshLocks();
    notify(`✅ ${targets.length} kilidin tamamı kaldırıldı`);
  };

  // ★ Bir işlemi geri al — eski değere döndür
  const revertEntry = (entry: LockHistoryEntry) => {
    if (entry.from === "mixed") { notify("Bu işlem tek tuşla geri alınamaz — kilitleri tek tek ayarla"); return; }
    setFeatureLock(entry.target, entry.from);
    const history = loadLockHistory().map((h) => h.id === entry.id ? { ...h, reverted: true } : h);
    saveLockHistory(history);
    void adminAction({ action: "set_feature_lock", featureId: entry.target, lockLevel: entry.from });
    refreshLocks();
    notify(`↩️ "${entry.target}" → ${LOCK_LABELS[entry.from] || entry.from} geri alındı`);
  };

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

  const applyLock = () => {
    const targetId = lockType === "all" ? featureId : lockType === "category" ? selectedCategory : selectedReciter;
    if (!targetId) { notify("Lütfen bir hedef seçin"); return; }
    // localStorage'a yaz (anında)
    const oldValue = getSystemConfig().featureLocks[targetId] ?? "free";
    setFeatureLock(targetId, featureLock);
    // ★ İşlem geçmişine yaz (geri alma desteği)
    const targetLabel = lockType === "all" ? (FEATURE_OPTIONS.find(([id]) => id === targetId)?.[1] ?? targetId)
      : lockType === "category" ? (CATEGORY_OPTIONS.find(([id]) => id === targetId)?.[1] ?? targetId)
      : (RECITER_OPTIONS.find(([id]) => id === targetId)?.[1] ?? targetId);
    const history: LockHistoryEntry[] = [{ id: uid(), target: targetId, targetLabel, from: oldValue, to: featureLock, at: new Date().toISOString() }, ...loadLockHistory()];
    saveLockHistory(history);
    refreshLocks();
    const labelMap: Record<string, string> = { maintenance: "🔧 Bakımda", off: "Kapalı", free: "Açık", pro: "Pro", elit: "Elit", v2: "V2", v3: "V3" };
    const label = labelMap[featureLock] ?? featureLock;
    setLockStatus(`✅ ${targetLabel} → ${label} uygulandı`);
    notify(`✅ "${targetLabel}" → ${label} uygulandı`);
    void adminAction({ action: "set_feature_lock", featureId: targetId, lockLevel: featureLock });
  };

  // ★ E-POSTA KAMPANYASI — onay veren kullanıcılara mail gönder (Resend)
  const [mailSubject, setMailSubject] = useState("");
  const [mailBody, setMailBody] = useState("");
  const [mailSending, setMailSending] = useState(false);
  const sendCampaign = async () => {
    if (!mailSubject.trim() || !mailBody.trim()) { notify("Konu ve içerik gerekli"); return; }
    setMailSending(true);
    try {
      const res = await fetch("/api/marketing/send-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: mailSubject.trim(),
          html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#141414;color:#fff;border-radius:12px"><div style="text-align:center;padding-bottom:16px;border-bottom:1px solid #333"><h2 style="color:#d7aa52;margin:0">🌙 Nûr Stüdyo</h2></div><div style="padding:16px 0;line-height:1.7;font-size:14px">${mailBody.trim().replace(/\n/g, "<br/>")}</div><div style="padding-top:16px;border-top:1px solid #333;font-size:11px;color:#888;text-align:center">Bu e-postayı aldınız çünkü Nûr Stüdyo'da e-posta bildirimlerine izin verdiniz. <a href="https://nurstudyo.com" style="color:#d7aa52">nurstudyo.com</a></div></div>`,
        }),
      });
      const data = await res.json().catch(() => null) as any;
      if (data?.ok) {
        notify(`✉️ ${data.sent}/${data.total} kullaniciya gönderildi`);
        setMailSubject(""); setMailBody("");
      } else notify(data?.error || "Gönderim başarısız");
    } catch { notify("Sunucuya ulaşılamadı"); }
    finally { setMailSending(false); }
  };

  const saveMaintenance = async () => {
    if (maintenance.startsAt && maintenance.endsAt && new Date(maintenance.endsAt) <= new Date(maintenance.startsAt)) {
      notify("Bakım bitiş saati başlangıçtan sonra olmalı");
      return;
    }
    // ★ Pencere geçmişteyse uyar — kullanıcı "kaydım çalışmadı" sanmasın
    if (maintenance.endsAt && new Date(maintenance.endsAt).getTime() <= Date.now()) {
      notify("⚠️ Bitiş zamanı geçmiş — site bakıma girmez, ileri bir saat seç");
      return;
    }
    const next = { ...maintenance, updatedAt: new Date().toISOString() };
    const cfg = getSystemConfig();
    cfg.maintenance = next;
    saveSystemConfig(cfg);
    const ok = await adminAction({ action: "set_maintenance", enabled: next.enabled, startsAt: next.startsAt, endsAt: next.endsAt, message: next.message });
    // ★ Anında uygula: diğer bileşenler (StudioApp bakım ekranı) reload beklemeden güncellensin
    window.dispatchEvent(new Event("nur_config_updated"));
    notify(ok
      ? (next.enabled ? "✅ Bakım planı kaydedildi — ziyaretçiler 1 dk içinde bakım ekranını görür" : "✅ Bakım planı kaydedildi (bakım KAPALI)")
      : "⚠️ Bakım planı cihazda kaydedildi; sunucuya yazılamadı");
  };

  // ★ BAKIMI ŞİMDİ BİTİR: planı beklemeden bakımı anında kaldırır.
  //   enabled=false + boş pencere yazılır → hem cihazda hem sunucuda temizlenir.
  const endMaintenanceNow = async () => {
    const next = { enabled: false, startsAt: "", endsAt: "", message: maintenance.message, updatedAt: new Date().toISOString() };
    const cfg = getSystemConfig();
    cfg.maintenance = next;
    saveSystemConfig(cfg);
    setMaintenance((v) => ({ ...v, enabled: false, startsAt: "", endsAt: "" }));
    const ok = await adminAction({ action: "set_maintenance", enabled: false, startsAt: "", endsAt: "", message: next.message });
    window.dispatchEvent(new Event("nur_config_updated"));
    notify(ok
      ? "✅ Bakım anında sona erdirildi — site 1 dk içinde herkese açılır"
      : "⚠️ Bakım cihazda kapatıldı; sunucuya yazılamadı");
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
      <section className="rounded-2xl border border-red-400/25 bg-red-950/10 p-4">
        <h4 className="mb-3 flex items-center gap-2 text-xs font-black text-white"><LockKeyhole size={15} /> Site Bakım Modu</h4>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="glass-soft flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-white sm:col-span-2">
            <input type="checkbox" checked={maintenance.enabled} onChange={(e) => setMaintenance((v) => ({ ...v, enabled: e.target.checked }))} />
            Siteyi bakım moduna al
          </label>
          <label className="text-[10px] text-white/60">Başlangıç<input type="datetime-local" value={maintenance.startsAt ? maintenance.startsAt.slice(0, 16) : ""} onChange={(e) => setMaintenance((v) => ({ ...v, startsAt: e.target.value }))} className="glass-soft mt-1 w-full rounded-xl px-3 py-2 text-xs text-white" /></label>
          <label className="text-[10px] text-white/60">Bitiş<input type="datetime-local" value={maintenance.endsAt ? maintenance.endsAt.slice(0, 16) : ""} onChange={(e) => setMaintenance((v) => ({ ...v, endsAt: e.target.value }))} className="glass-soft mt-1 w-full rounded-xl px-3 py-2 text-xs text-white" /></label>
        </div>
        <textarea value={maintenance.message} onChange={(e) => setMaintenance((v) => ({ ...v, message: e.target.value }))} rows={2} maxLength={300} placeholder="Bakım mesajı" className="glass-soft mt-2 w-full resize-none rounded-xl px-3 py-2 text-xs text-white outline-none" />
        <button onClick={saveMaintenance} className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-400 py-2.5 text-xs font-black text-black shadow-[0_0_18px_rgba(248,113,113,.45)] transition hover:bg-red-300 hover:shadow-[0_0_26px_rgba(248,113,113,.65)] active:scale-[.98] active:bg-red-200"><Save size={13} /> Bakım Planını Kaydet</button>
        <button onClick={endMaintenanceNow} disabled={!maintenance.enabled && !maintenance.endsAt} className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/15 py-2.5 text-xs font-black text-emerald-300 transition hover:bg-emerald-500/25 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-40"><CheckCircle2 size={13} /> Bakımı Şimdi Bitir</button>
      </section>

      <section className="rounded-2xl border border-sky-400/25 bg-black/35 p-4 lg:col-span-2">
        <h4 className="mb-1 flex items-center gap-2 text-xs font-black text-white"><Mail size={15} /> E-posta Kampanyası (Yeni Özellik Duyurusu)</h4>
        <p className="mb-3 text-[9px] text-white/40">Yalnızca giriş sayfasında "e-posta almak istiyorum" kutusunu işaretleyen kullanıcılara gider (KVKK uyumlu). Ücretsiz Resend planı: ayda 3.000 mail.</p>
        <div className="space-y-2">
          <input value={mailSubject} onChange={(e) => setMailSubject(e.target.value)} placeholder="Mail konusu (örn: 🌙 V2 Güncellemesi Geldi!)" className="glass-soft w-full rounded-xl px-3 py-2 text-xs text-white outline-none" />
          <textarea value={mailBody} onChange={(e) => setMailBody(e.target.value)} placeholder="Mail içeriği (düz metin, satır sonları korunur)" rows={4} className="glass-soft w-full resize-none rounded-xl px-3 py-2 text-xs text-white outline-none" />
          <button onClick={sendCampaign} disabled={mailSending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 py-3 text-xs font-black text-black disabled:opacity-50">
            <Send size={13} /> {mailSending ? "Gönderiliyor…" : "✉️ Onay Verenlere Gönder"}
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
          <button type="button" onClick={applyLock} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-black text-black">
            <Save size={13} /> Kilidi Uygula
          </button>
          {lockStatus && <p className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-[10px] font-bold text-emerald-300">{lockStatus}</p>}

          {/* ★ AKTİF KİLİTLER — neler kilitli/bakımda/kapalı hepsi burada */}
          {(() => {
            const entries = Object.entries(activeLocks).filter(([, v]) => v !== "free");
            const labelFor = (id: string) =>
              (FEATURE_OPTIONS.find(([x]) => x === id)?.[1] || CATEGORY_OPTIONS.find(([x]) => x === id)?.[1] || RECITER_OPTIONS.find(([x]) => x === id)?.[1] || id);
            return (
              <div className="mt-3 space-y-2 rounded-xl border border-white/10 bg-black/30 p-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[10px] font-black text-white/70"><LockKeyhole size={11} /> Aktif Kilitler ({entries.length})</span>
                  {entries.length > 0 && (
                    <button onClick={removeAllLocks} className="rounded-lg bg-red-500/15 px-2 py-1 text-[9px] font-bold text-red-300 hover:bg-red-500/25">
                      <RotateCcw size={9} className="mr-0.5 inline" /> Tümünü Aç
                    </button>
                  )}
                </div>
                {entries.length === 0 ? (
                  <p className="py-2 text-center text-[9.5px] text-white/35 italic">Kilitli/bakımda bir şey yok — her şey herkese açık ✅</p>
                ) : (
                  <div className="max-h-44 space-y-1.5 overflow-y-auto">
                    {entries.map(([id, lock]) => (
                      <div key={id} className="flex items-center justify-between gap-2 rounded-lg border border-white/5 bg-white/[.03] px-2 py-1.5">
                        <span className="min-w-0 flex-1 truncate text-[10px] font-bold text-white/80" title={id}>{labelFor(id)}</span>
                        <span className={`shrink-0 rounded border px-1.5 py-0.5 text-[8px] font-black ${LOCK_COLORS[lock] || LOCK_COLORS.free}`}>{LOCK_LABELS[lock] || lock}</span>
                        <button onClick={() => removeLock(id)} title="Kilidi kaldır — herkese aç"
                          className="shrink-0 rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-black text-emerald-300 transition hover:bg-emerald-500/20">
                          <Unlock size={9} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ★ KİLİT İŞLEM GEÇMİŞİ — ne yaptıysan burada + geri al */}
          {lockHistory.length > 0 && (
            <div className="mt-2 space-y-2 rounded-xl border border-white/10 bg-black/30 p-3">
              <span className="flex items-center gap-1.5 text-[10px] font-black text-white/70"><History size={11} /> Kilit İşlem Geçmisi</span>
              <div className="max-h-40 space-y-1.5 overflow-y-auto">
                {lockHistory.slice(0, 15).map((h) => (
                  <div key={h.id} className={`flex items-center justify-between gap-2 rounded-lg border px-2 py-1.5 ${h.reverted ? "border-white/5 bg-white/[.02] opacity-50" : "border-white/5 bg-white/[.03]"}`}>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[9.5px] font-bold text-white/75">{h.targetLabel} → {LOCK_LABELS[h.to] || h.to}</p>
                      <p className="text-[8px] text-white/35">{new Date(h.at).toLocaleString("tr-TR")}{h.reverted ? " · geri alındı" : ""}</p>
                    </div>
                    {!h.reverted && h.from !== "mixed" && (
                      <button onClick={() => revertEntry(h)} title="Bu işlemi geri al — eski duruma dönsün"
                        className="shrink-0 rounded bg-amber-500/15 px-2 py-0.5 text-[9px] font-black text-amber-300 transition hover:bg-amber-500/25">
                        ↩︎ Geri Al
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
