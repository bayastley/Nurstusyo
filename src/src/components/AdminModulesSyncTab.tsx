import React from "react";
import { Plus, FolderPlus, CloudUpload, RefreshCw } from "lucide-react";
import type { DynamicModule, SystemConfig } from "../services/adminSyncService";

interface AdminModulesSyncTabProps {
  activeTab: "users" | "broadcast" | "banLogs" | "modules" | "sync";
  sysConfig: SystemConfig;
  newModTitle: string;
  setNewModTitle: (v: string) => void;
  newModDesc: string;
  setNewModDesc: (v: string) => void;
  newModLock: "free" | "pro" | "elit" | "v2" | "v3";
  setNewModLock: (v: "free" | "pro" | "elit" | "v2" | "v3") => void;
  handleCreateModule: () => void;
  handleToggleModule: (id: string) => void;
  ghToken: string;
  setGhToken: (v: string) => void;
  ghGistId: string;
  setGhGistId: (v: string) => void;
  syncing: boolean;
  handlePushGist: () => void;
}

export const AdminModulesSyncTab: React.FC<AdminModulesSyncTabProps> = ({
  activeTab, sysConfig,
  newModTitle, setNewModTitle, newModDesc, setNewModDesc,
  newModLock, setNewModLock, handleCreateModule, handleToggleModule,
  ghToken, setGhToken, ghGistId, setGhGistId, syncing, handlePushGist,
}) => {
  if (activeTab === "modules") {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-3">
          <h4 className="font-display text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
            <FolderPlus size={14} style={{ color: "var(--accent)" }} /> Dinamik Modül & Fikir Ekle
          </h4>
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              value={newModTitle}
              onChange={(e) => setNewModTitle(e.target.value)}
              placeholder="Modül Başlığı (ör: Günlük Zikirler)"
              className="glass-soft rounded-xl px-3 py-2 text-[11px] text-white outline-none"
            />
            <select
              value={newModLock}
              onChange={(e) => setNewModLock(e.target.value as any)}
              className="glass-soft rounded-xl px-3 py-2 text-[11px] text-white outline-none cursor-pointer"
            >
              <option value="free">Ücretsiz (Free)</option>
              <option value="v2">V2 Güncellemesi Kilidi</option>
              <option value="v3">V3 Güncellemesi Kilidi</option>
              <option value="pro">Pro Üyelik Kilidi</option>
              <option value="elit">Elit Üyelik Kilidi</option>
            </select>
          </div>
          <input
            value={newModDesc}
            onChange={(e) => setNewModDesc(e.target.value)}
            placeholder="Kısa Açıklama"
            className="glass-soft w-full rounded-xl px-3 py-2 text-[11px] text-white outline-none"
          />
          <button
            onClick={handleCreateModule}
            className="flex items-center justify-center gap-2 w-full rounded-xl py-2.5 text-[11px] font-black text-black"
            style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
          >
            <Plus size={14} /> Yeni Modülü Sisteme Ekle
          </button>
        </div>

        {/* Mevcut Modüller Listesi */}
        <div className="space-y-2">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60">
            📋 Aktif Dinamik Modüller
          </label>
          <div className="grid gap-2 sm:grid-cols-2">
            {sysConfig.modules.map((m) => (
              <div
                key={m.id}
                className="glass-soft flex items-center justify-between rounded-2xl p-3 border border-white/10"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <div className="flex items-center gap-2">
                    <b className="text-[11px] font-bold text-white truncate">{m.title}</b>
                    <span className="rounded bg-white/10 px-1.5 py-0.5 text-[7.5px] font-black uppercase text-amber-300">
                      {m.lock}
                    </span>
                  </div>
                  <p className="text-[9px] text-white/40 truncate mt-0.5">{m.description}</p>
                </div>
                <button
                  onClick={() => handleToggleModule(m.id)}
                  className={`px-3 py-1.5 rounded-xl text-[9.5px] font-black transition ${
                    m.active
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                      : "bg-white/5 text-white/40"
                  }`}
                >
                  {m.active ? "AÇIK ✓" : "KAPALI ✗"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "sync") {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">
              <CloudUpload size={18} />
            </span>
            <div>
              <h4 className="text-[12px] font-black text-white">100% Ücretsiz Sunucusuz Canlı Senkronizasyon</h4>
              <p className="text-[9.5px] text-white/50 leading-relaxed">
                GitHub Gist API kullanarak Admin panelinden yaptığınız her değişimi tüm dünya kullanıcılarına anlık canlı yayınlayabilirsiniz.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <label className="block text-[9.5px] font-bold text-white/60">
              GitHub Personal Access Token (Gist İzinli):
            </label>
            <input
              type="password"
              value={ghToken}
              onChange={(e) => setGhToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className="glass-soft w-full rounded-xl px-3 py-2 text-[11px] font-mono text-white outline-none"
            />

            <label className="block text-[9.5px] font-bold text-white/60">
              Gist ID (İsteğe bağlı — boş bırakırsanız otomatik yeni Gist oluşturur):
            </label>
            <input
              value={ghGistId}
              onChange={(e) => setGhGistId(e.target.value)}
              placeholder="Örn: 8f7d6a5e4b3c210..."
              className="glass-soft w-full rounded-xl px-3 py-2 text-[11px] font-mono text-white outline-none"
            />
          </div>

          <button
            onClick={handlePushGist}
            disabled={syncing}
            className="flex items-center justify-center gap-2 w-full rounded-xl py-3 text-[11px] font-black text-black shadow-lg transition hover:brightness-110 active:scale-95 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#f5dda6,#d7aa52)" }}
          >
            {syncing ? <RefreshCw size={14} className="animate-spin" /> : <CloudUpload size={14} />}
            {syncing ? "GitHub Bulutuna Yükleniyor..." : "Tüm Verileri GitHub Bulutuna Push Et (Canlı Yayınla)"}
          </button>
        </div>
      </div>
    );
  }

  return null;
};
