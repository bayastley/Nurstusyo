import React, { useState } from "react";
import {
  Shield, Search, X, Plus, Minus, UserCheck, Crown, FolderPlus,
  RefreshCw, CloudUpload, Ban, CheckCircle, Lightbulb,
} from "lucide-react";
import { isAdminEmail } from "../tier";
import {
  getSystemConfig, saveSystemConfig, pushConfigToGithubGist,
  banUserInDb, unbanUserInDb, getBanLogs,
  findUserByEmail, giftRightsToUser, setUserTier,
  type ManagedUser, type DynamicModule, type SystemConfig, type BanLog,
} from "../services/adminSyncService";
import type { Tier } from "../types";
import { AdminBroadcastPanel } from "./AdminBroadcastPanel";
import { sanitizeText, isValidEmail, clampNumber } from "../security/sanitize";
import { syncUserInDb } from "./adminHelpers";
import { AdminUsersTab } from "./AdminUsersTab";
import { AdminModulesSyncTab } from "./AdminModulesSyncTab";

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

  const [banLogs, setBanLogs] = useState<BanLog[]>(() => getBanLogs());

  const handleBan = async (email: string, reason: string) => {
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
    // Ban her zaman yerel olarak kaydedilir (sunucu hata verse bile)
    banUserInDb(email, finalReason, currentUserEmail, false);
    setSysConfig(getSystemConfig());
    setBanLogs(getBanLogs());
    onUpdateUser(email, "free", 0);
    setBanReasonInput("");
    if (banState === "done") {
      notify(`⛔ ${email} DB'ye işlendi ve süresiz banlandı!`);
    } else if (banState === "fallback") {
      notify(`⛔ ${email} süresiz banlandı! (yerel kayıt — DB henüz bağlı değil)`);
    } else {
      notify(`⛔ ${email} yerel olarak banlandı (sunucu hatası, DB'ye işlenemedi)`);
    }
  };

  const handleUnban = async (email: string) => {
    if (!isAdminEmail(currentUserEmail)) {
      notify("⛔ Sadece Kurucu Admin ban kaldırma yetkisine sahiptir.");
      return;
    }
    const unbanState = await serverManage("unban_user", { email });
    // Ban her zaman yerel olarak kaldırılır
    unbanUserInDb(email);
    setSysConfig(getSystemConfig());
    setBanLogs(getBanLogs());
    onUpdateUser(email, "free", 20);
    if (unbanState === "done") {
      notify(`✅ ${email} banı kaldırıldı ve DB'ye işlendi`);
    } else {
      notify(`✅ ${email} banı yerel olarak kaldırıldı (DB henüz bağlı değil)`);
    }
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
        credentials: "include",
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
        credentials: "include",
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
    const tierState = await serverManage("change_tier", { email, tier: newTier });
    if (tierState === "error") return;
    // Sunucu başarılıysa localStorage'ı güncelle
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
    const targetUserNow = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    const newTotal = Math.max(0, (targetUserNow?.jeton ?? 0) + delta);
    const jetonState = await serverManage("change_jeton", { email, total: newTotal });
    if (jetonState === "error") return;
    const updatedUsers = users.map((u) => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return { ...u, jeton: newTotal, updatedAt: new Date().toISOString() };
      }
      return u;
    });
    const newCfg = { ...sysConfig, users: updatedUsers };
    setSysConfig(newCfg);
    saveSystemConfig(newCfg);
    const targetUser = updatedUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (targetUser) {
      onUpdateUser(targetUser.email, targetUser.tier, targetUser.jeton);
      notify(`🪙 ${targetUser.email} bakiyesi güncellendi: ${newTotal} ⚡ Üretim hakkı (${delta > 0 ? "+" + delta : delta})`);
    }
  };

  const handleDirectJetonSet = async (email: string, exactAmount: number) => {
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

  // ★ HAKLARI SIFIRLA — satın alınan tüm hakları, jetonu ve aboneliği sıfırla
  const handleResetRights = async (email: string) => {
    const resetState = await serverManage("reset_rights", { email });
    if (resetState === "error") return;
    // localStorage güncelle
    const updatedUsers = users.map((u) => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return { ...u, jeton: 0, tier: "free" as Tier, updatedAt: new Date().toISOString() };
      }
      return u;
    });
    const newCfg = { ...sysConfig, users: updatedUsers };
    setSysConfig(newCfg);
    saveSystemConfig(newCfg);
    const targetUser = updatedUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (targetUser) {
      onUpdateUser(targetUser.email, "free", 0);
      notify(`🗑️ ${targetUser.email} tüm hakları sıfırlandı — krótka/uzun/tam/jeton/abonelik temizlendi!`);
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
      const banInfo = found.isBanned ? " ⛔ BANLI" : "";
      notify(`✅ ${found.email} bulundu — ${found.tier.toUpperCase()} · ${found.jeton} ⚡${banInfo}`);
      return;
    }
    // 2) localStorage'da yoksa Supabase'de ara
    notify("🔍 Supabase'de aranıyor...");
    try {
      const response = await fetch(`/api/admin/action`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list_users" }),
      });
      const data = await response.json().catch(() => null) as { ok?: boolean; users?: Array<{ id: string; email: string; name: string; tier: string; wallet?: { sub_jeton?: number; purchased_jeton?: number } }> } | null;
      if (data?.ok && data.users) {
        const remoteUser = data.users.find((u) => u.email.toLowerCase() === q);
        if (remoteUser) {
          // Supabase'den bulunan kullanıcıyı localStorage'a senkronize et
          const synced = syncUserInDb(remoteUser.email, remoteUser.name, (remoteUser.tier || "free") as Tier, (remoteUser.wallet?.sub_jeton ?? 0) + (remoteUser.wallet?.purchased_jeton ?? 0));
          // Ban durumunu kontrol et
          const banCheck = await fetch("/api/ban/status", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: remoteUser.email }) }).catch(() => null);
          const banData = banCheck ? await banCheck.json().catch(() => null) : null;
          if (banData?.isBanned) {
            syncUserInDb(remoteUser.email, remoteUser.name, "free" as Tier, 0);
            banUserInDb(remoteUser.email, banData.reason || "Banlı", "System", true);
          }
          setSysConfig(getSystemConfig());
          setBanLogs(getBanLogs());
          setEmailSearchResult(getSystemConfig().users.find((u) => u.email.toLowerCase() === q) ?? synced);
          setSelectedEmail(synced.email);
          const finalUser = getSystemConfig().users.find((u) => u.email.toLowerCase() === q);
          const banLabel = finalUser?.isBanned ? " ⛔ BANLI" : "";
          notify(`✅ ${synced.email} Supabase'de bulundu — ${synced.tier.toUpperCase()} · ${synced.jeton} ⚡${banLabel}`);
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
    // Önce tier değiştir (eğer belirtildiyse)
    if (newTier) {
      const tierState = await serverManage("change_tier", { email: target, tier: newTier });
      if (tierState === "error") return;
    }
    // Sonra jeton ekle
    const currentState = users.find((u) => u.email.toLowerCase() === target);
    const newTotal = Math.max(0, (currentState?.jeton ?? 0) + safeAmount);
    const jetonState = await serverManage("change_jeton", { email: target, total: newTotal });
    if (jetonState === "error") return;
    // Başarılıysa localStorage'ı güncelle
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
    const tierState = await serverManage("change_tier", { email: target, tier: newTier });
    if (tierState === "error") return;
    const updated = setUserTier(target, newTier);
    if (!updated) {
      notify(`❌ ${target} sistemde kayıtlı değil`);
      return;
    }
    setSysConfig(getSystemConfig());
    onUpdateUser(updated.email, updated.tier, updated.jeton);
    notify(`👑 ${updated.email} → ${newTier.toUpperCase()} olarak ayarlandı`);
    setEmailSearchResult(updated);
  };

  const handleToggleModule = async (modId: string) => {
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
            <AdminUsersTab
              emailSearchQuery={emailSearchQuery}
              setEmailSearchQuery={setEmailSearchQuery}
              emailSearchResult={emailSearchResult}
              handleEmailSearch={handleEmailSearch}
              handleSetTierViaEmail={handleSetTierViaEmail}
              giftAmount={giftAmount}
              setGiftAmount={setGiftAmount}
              giftTier={giftTier}
              setGiftTier={setGiftTier}
              handleGiftRights={handleGiftRights}
              selectedUser={selectedUser}
              banReasonInput={banReasonInput}
              setBanReasonInput={setBanReasonInput}
              handleBan={handleBan}
              handleUnban={handleUnban}
              handleTierChange={handleTierChange}
              handleResetRights={handleResetRights}
              jetonDelta={jetonDelta}
              setJetonDelta={setJetonDelta}
              handleDirectJetonSet={handleDirectJetonSet}
              selectedEmail={selectedEmail}
              setSelectedEmail={setSelectedEmail}
              filteredUsers={filteredUsers}
              currentUserEmail={currentUserEmail}
            />
          )}
          <AdminModulesSyncTab
            activeTab={activeTab}
            sysConfig={sysConfig}
            newModTitle={newModTitle}
            setNewModTitle={setNewModTitle}
            newModDesc={newModDesc}
            setNewModDesc={setNewModDesc}
            newModLock={newModLock}
            setNewModLock={setNewModLock}
            handleCreateModule={handleCreateModule}
            handleToggleModule={handleToggleModule}
            ghToken={ghToken}
            setGhToken={setGhToken}
            ghGistId={ghGistId}
            setGhGistId={setGhGistId}
            syncing={syncing}
            handlePushGist={handlePushGist}
          />
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
