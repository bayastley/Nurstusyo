import React, { useState } from "react";
import {
  Shield, Search, X, Plus, Minus, UserCheck, Crown, FolderPlus,
  RefreshCw, CloudUpload, Ban, CheckCircle, Lightbulb,
} from "lucide-react";
import { isAdminEmail } from "../tier";
import {
  getSystemConfig, saveSystemConfig, pushConfigToGithubGist,
  banUserInDb, unbanUserInDb, getBanLogs,
  syncUserInDb as syncUserInService,
  findUserByEmail, giftRightsToUser, setUserTier,
  type ManagedUser, type DynamicModule, type SystemConfig, type BanLog,
} from "../services/adminSyncService";
import type { Tier } from "../types";
import { AdminBroadcastPanel } from "./AdminBroadcastPanel";
import { sanitizeText, isValidEmail, clampNumber } from "../security/sanitize";

export type { ManagedUser };

export function getManagedUsers(): ManagedUser[] {
  return getSystemConfig().users;
}

export function saveManagedUsers(users: ManagedUser[]): void {
  const cfg = getSystemConfig();
  cfg.users = users;
  saveSystemConfig(cfg);
}

export function syncUserInDb(email: string, name?: string, tier?: Tier, jeton?: number): ManagedUser {
  return syncUserInService(email, name, tier, jeton);
}

interface AdminDashboardModalProps {
  onClose: () => void;
  currentUserEmail?: string;
  onUpdateUser: (email: string, newTier: Tier, newJeton: number) => void;
  notify: (msg: string) => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  onClose,
  currentUserEmail = "kayaom1233@gmail.com",
  onUpdateUser,
  notify,
}) => {
  const [activeTab, setActiveTab] = useState<"users" | "broadcast" | "banLogs" | "modules" | "sync">("users");
  const [sysConfig, setSysConfig] = useState<SystemConfig>(() => getSystemConfig());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<string>(currentUserEmail);
  const [jetonDelta, setJetonDelta] = useState<number>(50);

  // Ban reason input state
  const [banReasonInput, setBanReasonInput] = useState<string>("");

  const banLogs: BanLog[] = getBanLogs();

  const handleBan = async (email: string, reason: string) => {
    if (!await assertAdminAction("ban_user", email, reason)) return;
    if (!isAdminEmail(currentUserEmail)) {
      notify("⛔ Sadece Kurucu Admin ban yetkisine sahiptir.");
      return;
    }
    if (isAdminEmail(email)) {
      notify("⛔ Kurucu Admin hesabı banlanamaz!");
      return;
    }
    // ★ Güvenlik: Oturum açık olan admin kendi hesabını (hangi email ile
    //   girmiş olursa olsun) yanlışlıkla banlayıp kendini kilitleyemesin.
    if (email.trim().toLowerCase() === currentUserEmail.trim().toLowerCase()) {
      notify("⛔ Kendi oturum hesabınızı banlayamazsınız.");
      return;
    }
    const finalReason = sanitizeText(reason).trim().slice(0, 300) || "Yasal ihlal / Sistem güvenlik uyarısı";
    const banState = await serverManage("ban_user", { email, reason: finalReason });
    if (banState === "error") return;
    banUserInDb(email, finalReason, currentUserEmail, false);
    setSysConfig(getSystemConfig());
    onUpdateUser(email, "free", 0);
    setBanReasonInput("");
    notify(banState === "done" ? `⛔ ${email} DB'ye işlendi ve süresiz banlandı!` : `⛔ ${email} süresiz banlandı! (yerel kayıt)`);
  };

  const handleUnban = async (email: string) => {
    if (!await assertAdminAction("unban_user", email)) return;
    if (!isAdminEmail(currentUserEmail)) {
      notify("⛔ Sadece Kurucu Admin ban kaldırma yetkisine sahiptir.");
      return;
    }
    const unbanState = await serverManage("unban_user", { email });
    if (unbanState === "error") return;
    unbanUserInDb(email);
    setSysConfig(getSystemConfig());
    onUpdateUser(email, "free", 20);
    notify(`✅ ${email} banı kaldırıldı${unbanState === "done" ? " ve DB'ye işlendi" : " (yerel kayıt)"}.`);
  };

  // New module creation form state
  const [newModTitle, setNewModTitle] = useState("");
  const [newModDesc, setNewModDesc] = useState("");
  const [newModLock, setNewModLock] = useState<"free" | "pro" | "elit" | "v2" | "v3">("v2");
  const [newModIcon] = useState("Sparkles");

  // GitHub Sync State
  const [ghToken, setGhToken] = useState<string>("");
  const [ghGistId, setGhGistId] = useState<string>(sysConfig.gistId || "");
  const [syncing, setSyncing] = useState(false);

  const users = sysConfig.users;
  const selectedUser = users.find((u) => u.email.toLowerCase() === selectedEmail.toLowerCase()) || users[0];

  const assertAdminAction = async (action: string, target?: string, reason?: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, target, reason }),
      });
      const data = await response.json().catch(() => null) as { ok?: boolean; error?: string } | null;
      if (!response.ok || !data?.ok) {
        notify(data?.error || "Admin yetkisi doğrulanamadı");
        return false;
      }
      return true;
    } catch {
      notify("Admin yetkisi için sunucuya ulaşılamadı");
      return false;
    }
  };

  // ★ Gerçek işlemi server üzerinden Supabase'e yazar.
  //   /api/admin/action tüm yönetimsel işlemleri (tier, jeton, ban, lock) işler.
  //   503 = Supabase henüz bağlı değil → local fallback devam eder.
  const serverManage = async (action: string, payload: Record<string, unknown>): Promise<"done" | "fallback" | "error"> => {
    try {
      const response = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, target: payload.email || payload.featureId || "", ...payload }),
      });
      if (response.status === 503) return "fallback";
      const data = await response.json().catch(() => null) as { ok?: boolean; error?: string } | null;
      if (!response.ok || !data?.ok) {
        notify(data?.error || "Yönetim işlemi tamamlanamadı");
        return "error";
      }
      return "done";
    } catch {
      return "fallback";
    }
  };

  const handleTierChange = async (email: string, newTier: Tier) => {
    if (!await assertAdminAction("change_tier", email)) return;
    const tierState = await serverManage("change_tier", { email, tier: newTier });
    if (tierState === "error") return;
    const updatedUsers = users.map((u) => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return { ...u, tier: newTier, updatedAt: new Date().toISOString() };
      }
      return u;
    });
    const newCfg = { ...sysConfig, users: updatedUsers };
    setSysConfig(newCfg);
    saveSystemConfig(newCfg);

    const targetUser = updatedUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (targetUser) {
      onUpdateUser(targetUser.email, targetUser.tier, targetUser.jeton);
      notify(`👑 ${targetUser.email} paketi "${newTier.toUpperCase()}" olarak güncellendi!`);
    }
  };

  const handleJetonChange = async (email: string, delta: number) => {
    if (!await assertAdminAction("change_jeton", email)) return;
    const targetUserNow = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    const jetonState = await serverManage("change_jeton", {
      email,
      total: Math.max(0, (targetUserNow?.jeton ?? 0) + delta),
    });
    if (jetonState === "error") return;
    const updatedUsers = users.map((u) => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        const nextJeton = Math.max(0, u.jeton + delta);
        return { ...u, jeton: nextJeton, updatedAt: new Date().toISOString() };
      }
      return u;
    });
    const newCfg = { ...sysConfig, users: updatedUsers };
    setSysConfig(newCfg);
    saveSystemConfig(newCfg);

    const targetUser = updatedUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (targetUser) {
      onUpdateUser(targetUser.email, targetUser.tier, targetUser.jeton);
      notify(`🪙 ${targetUser.email} bakiyesi güncellendi: ${targetUser.jeton} ⚡ Üretim hakkı (${delta > 0 ? "+" + delta : delta})`);
    }
  };

  const handleDirectJetonSet = async (email: string, exactAmount: number) => {
    if (!await assertAdminAction("change_jeton", email)) return;
    const safeAmount = Math.max(0, Math.floor(exactAmount));
    const setState = await serverManage("change_jeton", { email, total: safeAmount });
    if (setState === "error") return;
    const updatedUsers = users.map((u) => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return { ...u, jeton: safeAmount, updatedAt: new Date().toISOString() };
      }
      return u;
    });
    const newCfg = { ...sysConfig, users: updatedUsers };
    setSysConfig(newCfg);
    saveSystemConfig(newCfg);

    const targetUser = updatedUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (targetUser) {
      onUpdateUser(targetUser.email, targetUser.tier, targetUser.jeton);
      notify(` ${targetUser.email} bakiyesi ${safeAmount} ⚡ Üretim hakkı yapıldı!`);
    }
  };

  // ★ EMAIL ARAMA ve HAK HEDİYE
  const [emailSearchQuery, setEmailSearchQuery] = useState<string>("");
  const [giftAmount, setGiftAmount] = useState<number>(100);
  const [giftTier, setGiftTier] = useState<Tier>("free");
  const [emailSearchResult, setEmailSearchResult] = useState<ManagedUser | null>(null);

  const handleEmailSearch = async () => {
    const q = sanitizeText(emailSearchQuery).trim().toLowerCase().slice(0, 254);
    if (!q) {
      setEmailSearchResult(null);
      notify("⚠️ Aramak için bir e-posta adresi gir");
      return;
    }
    if (!isValidEmail(q)) {
      setEmailSearchResult(null);
      notify("⚠️ Geçerli bir e-posta adresi gir");
      return;
    }
    // 1) Önce localStorage'da ara (hızlı)
    let found = findUserByEmail(q);
    if (found) {
      setEmailSearchResult(found);
      setSelectedEmail(found.email);
      notify(`✅ ${found.email} bulundu — ${found.tier.toUpperCase()} · ${found.jeton} ⚡`);
      return;
    }
    // 2) localStorage'da yoksa Supabase'de ara
    notify("🔍 Supabase'de aranıyor...");
    try {
      const response = await fetch(`/api/admin/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list_users" }),
      });
      const data = await response.json().catch(() => null) as { ok?: boolean; users?: Array<{ id: string; email: string; name: string; tier: string; wallet?: { sub_jeton?: number; purchased_jeton?: number } }> } | null;
      if (data?.ok && data.users) {
        const remoteUser = data.users.find((u) => u.email.toLowerCase() === q);
        if (remoteUser) {
          // Supabase'den bulunan kullanıcıyı localStorage'a senkronize et
          const synced = syncUserInDb(remoteUser.email, remoteUser.name, (remoteUser.tier || "free") as Tier, (remoteUser.wallet?.sub_jeton ?? 0) + (remoteUser.wallet?.purchased_jeton ?? 0));
          setSysConfig(getSystemConfig());
          setEmailSearchResult(synced);
          setSelectedEmail(synced.email);
          notify(`✅ ${synced.email} Supabase'de bulundu — ${synced.tier.toUpperCase()} · ${synced.jeton} ⚡`);
          return;
        }
      }
    } catch { /* fallback */ }
    setEmailSearchResult(null);
    notify(`❌ "${q}" adresiyle kayıtlı kullanıcı yok (Supabase'de de bulunamadı)`);
  };

  const handleGiftRights = async (email: string, amount: number, newTier?: Tier) => {
    const target = email.trim().toLowerCase();
    if (!isValidEmail(target)) { notify("⚠️ Geçerli bir e-posta adresi gir"); return; }
    const safeAmount = clampNumber(amount, 0, 100000);
    if (!await assertAdminAction("gift_rights", target)) return;
    const result = giftRightsToUser(target, safeAmount, newTier);
    if (!result.ok) {
      notify(`❌ ${target} bulunamadı`);
      return;
    }
    setSysConfig(getSystemConfig());
    onUpdateUser(result.user.email, result.user.tier, result.user.jeton);
    notify(`🎁 ${result.user.email} · +${result.deltaJeton} ⚡ Üretim hakkı hediye edildi · tier: ${result.user.tier.toUpperCase()}`);
    setEmailSearchResult(result.user);
  };

  const handleSetTierViaEmail = async (email: string, newTier: Tier) => {
    const target = email.trim().toLowerCase();
    if (!await assertAdminAction("change_tier", target)) return;
    const updated = setUserTier(target, newTier);
    if (!updated) {
      notify(`❌ ${target} sistemde kayıtlı değil`);
      return;
    }
    setSysConfig(getSystemConfig());
    onUpdateUser(updated.email, updated.tier, updated.jeton);
    notify(` ${updated.email} → ${newTier.toUpperCase()} olarak ayarlandı`);
    setEmailSearchResult(updated);
  };

  const handleToggleModule = async (modId: string) => {
    if (!await assertAdminAction("toggle_module", modId)) return;
    const updatedMods = sysConfig.modules.map((m) => {
      if (m.id === modId) return { ...m, active: !m.active };
      return m;
    });
    const newCfg = { ...sysConfig, modules: updatedMods };
    setSysConfig(newCfg);
    saveSystemConfig(newCfg);
    notify("✨ Modül durumu güncellendi!");
  };

  const handleCreateModule = async () => {
    if (!await assertAdminAction("create_module", newModTitle.trim())) return;
    if (!newModTitle.trim()) {
      notify("Lütfen modül başlığı giriniz.");
      return;
    }
    const newMod: DynamicModule = {
      id: "mod-" + Math.random().toString(36).slice(2, 8),
      title: newModTitle.trim(),
      description: newModDesc.trim() || "Özel eklenen modül",
      iconName: newModIcon,
      lock: newModLock,
      active: true,
      category: "custom",
    };
    const newCfg = { ...sysConfig, modules: [...sysConfig.modules, newMod] };
    setSysConfig(newCfg);
    saveSystemConfig(newCfg);
    setNewModTitle("");
    setNewModDesc("");
    notify(`🎉 Yeni Modül Ekledi: "${newMod.title}"`);
  };

  const handlePushGist = async () => {
    if (!await assertAdminAction("push_config", ghGistId.trim() || "new-gist")) return;
    if (!ghToken.trim()) {
      notify("Lütfen GitHub Personal Access Token giriniz.");
      return;
    }
    setSyncing(true);
    const result = await pushConfigToGithubGist(ghToken.trim(), ghGistId.trim(), sysConfig);
    setSyncing(false);
    notify(result.message);
    setSysConfig(getSystemConfig());
  };

  const filteredUsers = searchQuery.trim()
    ? users.filter(
        (u) =>
          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 p-3 md:p-6 backdrop-blur-md modal-in"
      onMouseDown={onClose}
      onClick={onClose}
    >
      <div
        className="glass modal-in relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl shadow-2xl"
        style={{ border: "1px solid rgba(215,170,82,.4)" }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative flex items-center justify-between border-b border-white/10 bg-black/40 px-5 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-2xl text-black shadow-lg"
              style={{ background: "linear-gradient(135deg,#f5dda6,#d7aa52)" }}
            >
              <Shield size={20} strokeWidth={2.5} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base font-black tracking-wider text-white">
                  ADMIN YÖNETİM PANELİ
                </h3>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2 py-0.5 text-[8px] font-black text-emerald-300">
                  ŞİFRELİ KORUMALI
                </span>
              </div>
              <p className="text-[10px] text-white/50 mt-0.5">
                Kurucu Hesabı: <b style={{ color: "var(--accent-2)" }}>kayaom1233@gmail.com</b>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-white/5 p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
            aria-label="Kapat"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-black/20 p-2 gap-2 shrink-0 overflow-x-auto scrollbar-thin">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-[10.5px] font-bold transition whitespace-nowrap ${
              activeTab === "users" ? "text-black font-black" : "text-white/60 hover:text-white"
            }`}
            style={activeTab === "users" ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}
          >
            <UserCheck size={14} /> Kullanıcı & ⚡Üretim hakkı
          </button>
          <button
            onClick={() => setActiveTab("broadcast")}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-[10.5px] font-bold transition whitespace-nowrap ${
              activeTab === "broadcast" ? "text-black font-black" : "text-white/60 hover:text-white"
            }`}
            style={activeTab === "broadcast" ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}
          >
            <Lightbulb size={14} /> Duyuru & Kilitlar
          </button>
          <button
            onClick={() => setActiveTab("banLogs")}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-[10.5px] font-bold transition whitespace-nowrap relative ${
              activeTab === "banLogs" ? "text-black font-black" : "text-red-300 hover:text-white"
            }`}
            style={activeTab === "banLogs" ? { background: "linear-gradient(135deg,#f87171,#dc2626)" } : { background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}
          >
            <Lightbulb size={13} className={banLogs.length > 0 ? "animate-pulse text-amber-300" : ""} fill={banLogs.length > 0 ? "currentColor" : "none"} />
            <span>Ban & Siber Denetim ({banLogs.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">
          {/* TAB 1: USERS & JETONS */}
          {activeTab === "users" && (
            <>
              {/* 0. EMAIL ile Kullanıcı Bul & Yönet */}
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <label className="mb-2 block text-[11px] font-black uppercase tracking-wider" style={{ color: "var(--accent-2)" }}>
                   Email ile Kullanıcı Bul ve Yönet
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    value={emailSearchQuery}
                    onChange={(e) => setEmailSearchQuery(e.target.value)}
                    placeholder="ornek@gmail.com"
                    className="glass-soft flex-1 min-w-[200px] rounded-xl py-2.5 px-3 text-[12px] font-medium text-white outline-none placeholder:text-white/30 focus:border-[color:var(--accent)]"
                  />
                  <button
                    onClick={handleEmailSearch}
                    className="rounded-xl px-3 py-2 text-[10px] font-black text-black"
                    style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
                  >
                    ARA
                  </button>
                </div>

                {emailSearchResult && (
                  <div className="mt-3 rounded-xl bg-black/40 p-3 text-[11px]">
                    <div className="mb-1 font-bold text-white">
                      {emailSearchResult.email}
                    </div>
                    <div className="mb-2 text-white/70">
                      Tier: {emailSearchResult.tier.toUpperCase()} · Hak: {emailSearchResult.jeton} ⚡
                      {emailSearchResult.isBanned ? " · BANLI" : ""}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleSetTierViaEmail(emailSearchResult.email, "free")}
                        className="rounded-lg bg-white/10 px-2 py-1 text-[9px] font-bold text-white hover:bg-white/20"
                      >
                        FREE
                      </button>
                      <button
                        onClick={() => handleSetTierViaEmail(emailSearchResult.email, "pro")}
                        className="rounded-lg bg-amber-500/20 px-2 py-1 text-[9px] font-bold text-amber-200 hover:bg-amber-500/30"
                      >
                        PRO YAP
                      </button>
                      <button
                        onClick={() => handleSetTierViaEmail(emailSearchResult.email, "elit")}
                        className="rounded-lg bg-amber-400/30 px-2 py-1 text-[9px] font-bold text-amber-100 hover:bg-amber-400/40"
                      >
                        ELİT YAP
                      </button>
                      <input
                        type="number"
                        value={giftAmount}
                        onChange={(e) => setGiftAmount(Number(e.target.value) || 0)}
                        className="w-20 rounded-lg bg-white/10 px-2 py-1 text-[10px] text-white outline-none"
                        placeholder="100"
                      />
                      <button
                        onClick={() => handleGiftRights(emailSearchResult.email, giftAmount, giftTier)}
                        className="rounded-lg bg-emerald-500/25 px-2 py-1 text-[9px] font-bold text-emerald-200 hover:bg-emerald-500/35"
                      >
                        HAK HEDİYE ET
                      </button>
                      {emailSearchResult.isBanned ? (
                        <button
                          onClick={() => handleUnban(emailSearchResult.email)}
                          className="rounded-lg bg-white/10 px-2 py-1 text-[9px] font-bold text-white hover:bg-white/20"
                        >
                          BAN KALDIR
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBan(emailSearchResult.email, banReasonInput || "Admin kararı")}
                          className="rounded-lg bg-red-500/25 px-2 py-1 text-[9px] font-bold text-red-200 hover:bg-red-500/35"
                        >
                          BANLA
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 1. Kullanıcı Arama Çubuğu */}
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-white/60">
                  🔍 1. Kullanıcı Arama Çubuğu (E-posta veya Ad)
                </label>
                <div className="relative">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Örn: kayaom1233@gmail.com veya user@..."
                    className="glass-soft w-full rounded-2xl py-3 pl-10 pr-4 text-[12px] font-medium text-white outline-none placeholder:text-white/30 focus:border-[color:var(--accent)]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Arama Sonuç Listesi / Seçim Etiketleri */}
                <div className="mt-2.5 flex flex-wrap gap-1.5 max-h-28 overflow-y-auto scrollbar-thin p-1 rounded-xl bg-black/20">
                  {filteredUsers.map((u) => {
                    const isSelected = u.email.toLowerCase() === selectedEmail.toLowerCase();
                    const isKurucu = isAdminEmail(u.email);
                    return (
                      <button
                        key={u.id}
                        onClick={() => setSelectedEmail(u.email)}
                        className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[10.5px] font-semibold transition ${
                          isSelected
                            ? "text-black shadow-md font-bold"
                            : "glass-soft text-white/70 hover:text-white"
                        }`}
                        style={
                          isSelected
                            ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }
                            : undefined
                        }
                      >
                        {isKurucu ? <Crown size={11} className={isSelected ? "text-black" : "text-amber-400"} /> : <UserCheck size={11} />}
                        <span>{u.email}</span>
                        <span className={`text-[8.5px] px-1.5 py-0.2 rounded-full font-black ${
                          isSelected ? "bg-black/20 text-black" : "bg-white/10 text-white/60"
                        }`}>
                          {u.tier.toUpperCase()} · {u.jeton}J
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Seçili kullanıcı profili ve Üretim hakkı yönetimi */}
              {selectedUser && (
                <div
                  className="relative overflow-hidden rounded-3xl border p-5 transition-all"
                  style={{
                    background: "linear-gradient(160deg, rgba(215,170,82,.12) 0%, rgba(12,13,18,.95) 100%)",
                    border: "1px solid rgba(215,170,82,.35)",
                    boxShadow: "0 10px 30px rgba(0,0,0,.5)",
                  }}
                >
                  {isAdminEmail(selectedUser.email) && (
                    <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-400/40 px-2.5 py-0.5 text-[8.5px] font-black text-amber-300">
                      <Crown size={10} /> KURUCU HESABI
                    </span>
                  )}

                  <div className="mb-4">
                    <div className="text-[10px] font-black uppercase tracking-wider text-white/40">Seçili Kullanıcı Kartı</div>
                    <h4 className="font-display text-lg font-black text-white mt-0.5">{selectedUser.name}</h4>
                    <p className="text-[11px] font-mono text-[color:var(--accent-2)]">{selectedUser.email}</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Paket Tanımlama Dropdown */}
                    <div className="rounded-2xl border border-white/10 bg-black/40 p-3.5 space-y-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60">
                        📦 Paket Tanımlama Menüsü
                      </label>
                      <select
                        value={selectedUser.tier}
                        onChange={(e) => handleTierChange(selectedUser.email, e.target.value as Tier)}
                        className="glass-soft w-full rounded-xl px-3 py-2.5 text-[12px] font-bold outline-none cursor-pointer"
                        style={{ color: "var(--accent-2)" }}
                      >
                        <option value="free">🌱 Ücretsiz (Free)</option>
                        <option value="pro">💎 Nûr Pro (Tüm videolar & 1080p)</option>
                        <option value="elit">👑 Nûr Elit (%100 Logosuz & Tüm Kâriler)</option>
                      </select>
                      <p className="text-[9px] text-white/45 leading-relaxed">
                        Değiştirdiğiniz anda tüm kilitler bu kullanıcı için canlı güncellenir.
                      </p>
                    </div>

                    {/* Üretim hakkı bakiyesi ekleme / çıkarma */}
                    <div className="rounded-2xl border border-white/10 bg-black/40 p-3.5 space-y-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60">
                        🪙 ⚡ Üretim hakkı Bakiye Yönetimi
                      </label>
                      <div className="flex items-center justify-between bg-white/5 rounded-xl p-2">
                        <span className="text-[10px] text-white/50 font-medium">Mevcut Bakiye:</span>
                        {selectedUser.jeton >= 999999 ? (
                          <span className="font-display text-lg font-black tracking-wide" style={{ color: "var(--accent-2)" }}>
                            ♾️ SINIRSIZ
                          </span>
                        ) : (
                          <span className="font-display text-xl font-black tabular-nums" style={{ color: "var(--accent-2)" }}>
                            {selectedUser.jeton} <span className="text-[10px] text-white/40 font-bold">⚡ ENERJİ</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          onClick={() => handleJetonChange(selectedUser.email, -jetonDelta)}
                          className="flex h-9 items-center justify-center gap-1 rounded-xl bg-red-500/20 border border-red-500/30 px-3 text-[11px] font-black text-red-300 transition hover:bg-red-500/30 active:scale-95"
                          title={`${jetonDelta} ⚡ Üretim hakkı çıkar`}
                        >
                          <Minus size={12} strokeWidth={3} /> {jetonDelta}
                        </button>
                        <input
                          type="number"
                          value={jetonDelta}
                          onChange={(e) => setJetonDelta(Math.max(1, parseInt(e.target.value) || 1))}
                          className="glass-soft h-9 w-16 rounded-xl text-center font-mono text-[12px] font-bold text-white outline-none"
                        />
                        <button
                          onClick={() => handleJetonChange(selectedUser.email, jetonDelta)}
                          className="flex-1 flex h-9 items-center justify-center gap-1 rounded-xl text-[11px] font-black text-black transition hover:brightness-110 active:scale-95"
                          style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
                        >
                          <Plus size={12} strokeWidth={3} /> {jetonDelta} Ekle
                        </button>
                      </div>

                      <div className="flex items-center gap-1 pt-1">
                        {[100, 500, 1000].map((amt) => (
                          <button
                            key={amt}
                            onClick={() => handleDirectJetonSet(selectedUser.email, amt)}
                            className="flex-1 rounded-lg bg-white/5 py-1 text-[9px] font-bold text-white/60 hover:bg-white/10 hover:text-white transition"
                          >
                            ={amt} ⚡ Üretim hakkı
                          </button>
                        ))}
                      </div>

                      {/* ★ SINIRSIZ JETON — admin/test hesapları için */}
                      <button
                        onClick={() => handleDirectJetonSet(selectedUser.email, 999999)}
                        className="mt-1 w-full rounded-lg py-1.5 text-[9.5px] font-black text-black transition hover:brightness-110 active:scale-95"
                        style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
                      >
                        ♾️ SINIRSIZ JETON TANIMLA
                      </button>
                    </div>
                  </div>

                  {/* 2.3 SÜRESİZ BANLA / BANINI KALDIR SİBER DENETİM BÖLÜMÜ */}
                  <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-950/20 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase tracking-wider text-red-300 flex items-center gap-1.5">
                        <Ban size={13} className="text-red-400" /> Siber Denetim & Yasal Ban Modülü
                      </label>
                      {selectedUser.isBanned && (
                        <span className="rounded-full bg-red-500/20 border border-red-500/40 px-2.5 py-0.5 text-[8.5px] font-black text-red-300 animate-pulse">
                          ⛔ SÜRESİZ BANLI
                        </span>
                      )}
                    </div>

                    {selectedUser.isBanned ? (
                      <div className="space-y-2">
                        <div className="rounded-xl bg-black/40 p-2.5 text-[10px] leading-relaxed text-red-200 border border-red-500/20">
                          <b className="text-red-400">Mevcut Ban Gerekçesi:</b> {selectedUser.banReason || "Belirtilmedi"}
                          <span className="block text-[8.5px] text-white/40 mt-1">
                            Tarih: {selectedUser.bannedAt ? new Date(selectedUser.bannedAt).toLocaleString("tr-TR") : "-"} · Banned By: {selectedUser.bannedBy || "Admin"}
                          </span>
                        </div>

                        <button
                          onClick={() => handleUnban(selectedUser.email)}
                          className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-[11px] font-black text-black shadow-lg transition hover:brightness-110 active:scale-95 cursor-pointer"
                          style={{ background: "linear-gradient(135deg, #4ade80, #16a34a)" }}
                        >
                          <CheckCircle size={14} /> BANINI KALDIR (Sisteme Erişimi Geri Aç)
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div>
                          <label className="block text-[9px] font-bold text-white/50 mb-1">
                            Ban Gerekçesi / Yasal Suç Nedeni:
                          </label>
                          <input
                            value={banReasonInput}
                            onChange={(e) => setBanReasonInput(e.target.value)}
                            placeholder="Örn: Telif ihlali, sahte jeton müdahalesi veya yasal suç..."
                            className="glass-soft w-full rounded-xl px-3 py-2 text-[11px] text-white outline-none focus:border-red-500"
                          />
                        </div>

                        <button
                          onClick={() => handleBan(selectedUser.email, banReasonInput)}
                          className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-[11px] font-black text-white shadow-lg transition hover:brightness-110 active:scale-95 bg-red-600 border border-red-500 cursor-pointer"
                        >
                          <Ban size={14} /> SÜRESİZ BANLA
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB 2: DYNAMIC MODULES */}
          {activeTab === "modules" && (
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
          )}

          {/* TAB 3: FREE GITHUB GIST / RAW SYNC */}
          {activeTab === "sync" && (
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
          )}

          {activeTab === "broadcast" && <AdminBroadcastPanel notify={notify} />}

          {/* TAB 4: BAN & SİBER DENETİM LOGLARI */}
          {activeTab === "banLogs" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-4 space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/20 text-red-300">
                    <Lightbulb size={18} className="animate-pulse" fill="currentColor" />
                  </span>
                  <div>
                    <h4 className="text-[12px] font-black text-white">Siber Denetim ve Ban Geçmişi Kayıtları</h4>
                    <p className="text-[9.5px] text-white/50 leading-relaxed">
                      Sistem tarafından otomatik tespit edilen güvenlik ihlalleri ve Admin tarafından uygulanan yasal ban işlemleri.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  {banLogs.length > 0 ? (
                    banLogs.map((log) => (
                      <div
                        key={log.id}
                        className="rounded-xl border border-white/10 bg-black/40 p-3 text-[10.5px] space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-red-300 flex items-center gap-1">
                            <Ban size={12} /> {log.userEmail} ({log.userName})
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black ${
                            log.unbanned ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"
                          }`}>
                            {log.unbanned ? "BAN KALKTI" : log.isAuto ? "SİSTEM OTOMATİK" : "ADMİN BAN"}
                          </span>
                        </div>
                        <p className="text-white/80 leading-relaxed">
                          <b>Gerekçe / Yasal Suç:</b> {log.reason}
                        </p>
                        <div className="flex items-center justify-between text-[8.5px] text-white/40 pt-1 border-t border-white/5">
                          <span>Yetkili: {log.bannedBy}</span>
                          <span>{new Date(log.timestamp).toLocaleString("tr-TR")}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="p-4 text-center text-[10px] text-white/40 italic">
                      Henüz kayıtlı bir ban olayı bulunmamaktadır.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 bg-black/50 px-5 py-3 flex items-center justify-between text-[10px] text-white/40 shrink-0">
          <span>AES+HMAC Korumalı · Dynamic Serverless Config Engine</span>
          <button
            onClick={onClose}
            className="rounded-xl bg-white/10 px-4 py-1.5 text-[10px] font-bold text-white hover:bg-white/20 transition"
          >
            Tamamlandı
          </button>
        </div>
      </div>
    </div>
  );
};
