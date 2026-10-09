import React, { useEffect, useState } from "react";
import { isAdminEmail } from "../tier";
import {
  getSystemConfig, saveSystemConfig, pushConfigToGithubGist,
  banUserInDb, unbanUserInDb, getBanLogs,
  type DynamicModule, type SystemConfig, type BanLog,
} from "../services/adminSyncService";
import type { Tier } from "../types";
import { AdminBroadcastPanel } from "./AdminBroadcastPanel";
import { sanitizeText } from "../security/sanitize";
import { AdminUsersTab } from "./AdminUsersTab";
import { AdminModulesSyncTab } from "./AdminModulesSyncTab";
import { AdminHaftaVideoTab, AdminHaftalikRaporTab } from "./adminDashboardTabs";
import { AdminBanLogsTab, AdminFeedbackTab, AdminErrorsTab } from "./adminDashboardBolumler";
// ★ SRP (01.10): panel ÇERÇEVESİ adminDashboardKabuk.tsx'e taşındı — header + 7 sekmeli
//   nav + hata alarmı + footer. Bu dosya yalnız STATE + İŞ MANTIĞI + sekme içerikleri.
import { AdminPanelKabuk } from "./adminDashboardKabuk";
// ★ SRP adım 8 (09.10 2. tur): kullanıcı yönetimi handler'ları useAdminYonetim.ts'e taşındı
import { useAdminYonetim } from "../hooks/useAdminYonetim";
// ★ 06.10 SAĞLIK ROZETİ: panel açılışında 7 salt-okunur action sessizce ping'lenir
//   (usePanelSaglik.ts — YAZMA action'ları asla çağrılmaz); hatalı sekme rozette görünür.
import { usePanelSaglik } from "./usePanelSaglik";
import { assertAdminAction, serverManage, hataAlarmiOku } from "./adminDashboardRpc";
// ★ SRP adım 10 (30.09): banLogs + feedback + errors sekmeleri adminDashboardBolumler.tsx'e taşındı

interface AdminDashboardModalProps {
  onClose: () => void;
  currentUserEmail?: string;
  onUpdateUser: (email: string, newTier: Tier, newJeton: number) => void;
  notify: (msg: string) => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  onClose,
  currentUserEmail = "",
  onUpdateUser,
  notify,
}) => {
  const [activeTab, setActiveTab] = useState<"users" | "broadcast" | "banLogs" | "errors" | "feedback" | "modules" | "sync" | "haftaVideo" | "rapor">("users");
  // ★ 06.10 SAĞLIK ROZETİ: mount'ta salt-okunur action ping'leri → kabukta 🩺 rozet + sekme noktaları
  const panelSaglik = usePanelSaglik();
  const [sysConfig, setSysConfig] = useState<SystemConfig>(() => getSystemConfig());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<string>(currentUserEmail);
  const [jetonDelta, setJetonDelta] = useState<number>(50);
  // ★ 04.10 TÜR BAZLI ÜRETİM HAKKI: admin kisa/uzun/tam seçip verir — nur_video_rights
  //   tablosuna yazılır (tüketim BU tablodan harcar; eski sub_jeton ölü veriydi).
  const [rightsKind, setRightsKind] = useState<"kisa" | "uzun" | "tam">("kisa");

  // Ban reason input state
  const [banReasonInput, setBanReasonInput] = useState<string>("");
  // ★ Hata logları — Hata Logları sekmesi için
  const [errorLogs, setErrorLogs] = useState<any[]>([]);
  const [errorStats, setErrorStats] = useState<{ total24h: number; unique24h: number; turDagilimi?: Record<string, number> } | null>(null);
  const [errorLoading, setErrorLoading] = useState(false);
  // ★ Hata filtresi + sayfalama: her sayfada 10 kayıt, kalabalık olmasın
  const [errorFilter, setErrorFilter] = useState<"all" | "unique" | string>("all"); // all | unique | video | payment | auth | ...
  const [errorPage, setErrorPage] = useState(0);
  // ★ GRUPLAMA: aynı hata (fingerprint) tek satırda ×N sayacıyla birleştirilir
  const [errorGrouped, setErrorGrouped] = useState(true);
  // ★ HATA ALARMI: son 24 saatte hata sayısı eşik aşarsa panelde uyarı
  //   eşikler: 10+ → sarı (dikkat), 30+ → kırmızı (acil)
  const [errorAlarm, setErrorAlarm] = useState<"ok" | "warn" | "alarm">("ok");
  const refreshErrorAlarm = async () => {
    // ★ RPC KATMANI adminDashboardRpc.ts'e taşındı (09.10 parçalama)
    const stats = await hataAlarmiOku();
    if (stats) {
      const total = Number(stats.total24h) || 0;
      setErrorStats(stats);
      setErrorAlarm(total >= 30 ? "alarm" : total >= 10 ? "warn" : "ok");
    }
  };
  // Panel açıkken 90 saniyede bir hata sayısı kontrolü
  useEffect(() => {
    refreshErrorAlarm();
    const id = setInterval(refreshErrorAlarm, 90_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // ★ Geri bildirimler — Geri Bildirimler sekmesi için
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [feedbackStats, setFeedbackStats] = useState<{ turDagilimi: Record<string, number>; puanDagilimi: Record<number, number>; puanOrtalama: number; toplam: number } | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  // ★ GERİ BİLDİRİM YANITI (28.09): mesaj başına yanıt kutusu + e-posta gönderimi
  const [feedbackYanitAcik, setFeedbackYanitAcik] = useState<number | null>(null);
  const [feedbackYanitMetni, setFeedbackYanitMetni] = useState("");
  const [feedbackYanitYukleniyor, setFeedbackYanitYukleniyor] = useState<number | null>(null);

  const loadFeedback = async () => {
    setFeedbackLoading(true);
    try {
      const response = await fetch("/api/admin/action", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list_feedback" }),
      });
      const data = await response.json().catch(() => null) as any;
      if (data?.ok) {
        setFeedbackList(data.feedback || []);
        setFeedbackStats({ turDagilimi: data.turDagilimi || {}, puanDagilimi: data.puanDagilimi || {}, puanOrtalama: data.puanOrtalama || 0, toplam: data.toplam || 0 });
      } else notify(data?.error || "Geri bildirimler alınamadı");
    } catch { notify("Sunucuya ulaşılamadı"); }
    finally { setFeedbackLoading(false); }
  };

  // ★ YANIT GÖNDER (28.09): admin cevabını kaydeder + kullanıcıya e-posta atar
  const feedbackYanitGonder = async (fbId: number) => {
    if (!feedbackYanitMetni.trim()) return;
    setFeedbackYanitYukleniyor(fbId);
    try {
      const response = await fetch("/api/admin/action", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "feedback_reply", id: fbId, yanit: feedbackYanitMetni.trim() }),
      });
      const data = await response.json().catch(() => null) as { ok?: boolean; mailGitti?: boolean; mailHata?: string; error?: string } | null;
      if (data?.ok) {
        notify(data.mailGitti ? "📧 Yanıt kaydedildi + e-posta gönderildi" : `⚠️ Yanıt kaydedildi ama e-posta gitmedi: ${data.mailHata || "bilinmeyen"}`);
        setFeedbackYanitAcik(null);
        setFeedbackYanitMetni("");
        await loadFeedback();
      } else notify(data?.error || "Yanıt gönderilemedi");
    } catch { notify("Sunucuya ulaşılamadı"); }
    finally { setFeedbackYanitYukleniyor(null); }
  };

  // Geri Bildirimler sekmesine ilk geçişte yükle
  useEffect(() => {
    if (activeTab === "feedback" && feedbackList.length === 0 && !feedbackLoading) loadFeedback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

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
    const banState = await serverManageLocal("ban_user", { email, reason: finalReason });
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

  // ★ AKTİF BANLI KULLANICI LİSTESİ (04.10, admin isteği): sunucu nur_ban_logs'tan
  //   unbanned=false kayıtlar — panelde 10'ar sayfalı gösterilir, Ban Kaldır butonu çalışır.
  const [bannedUsers, setBannedUsers] = useState<Array<{ id?: string; user_email: string; reason: string; banned_by?: string; created_at?: string }>>([]);
  const [bannedLoading, setBannedLoading] = useState(false);
  const [banPage, setBanPage] = useState(0);
  const [unbanBusy, setUnbanBusy] = useState<string | null>(null);

  const loadBannedUsers = async () => {
    setBannedLoading(true);
    try {
      const response = await fetch("/api/admin/action", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list_banned_users" }),
      });
      const data = await response.json().catch(() => null) as { ok?: boolean; users?: Array<{ id?: string; user_email: string; reason: string; banned_by?: string; created_at?: string }> } | null;
      setBannedUsers(data?.ok && data.users ? data.users : []);
    } catch { setBannedUsers([]); }
    finally { setBannedLoading(false); }
  };

  // Ban & Siber Denetim sekmesi açılınca sunucudan taze çek
  useEffect(() => {
    if (activeTab === "banLogs") void loadBannedUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ★ LİSTEDEN BAN KALDIR — sunucu + yerel + liste yenileme tek akış
  const handleUnbanFromList = async (email: string) => {
    if (!isAdminEmail(currentUserEmail)) {
      notify("⛔ Sadece Kurucu Admin ban kaldırma yetkisine sahiptir.");
      return;
    }
    if (!window.confirm(`${email} kullanıcısının banı kaldırılsın mı?\n\nKullanıcı anında siteye girebilir ve video üretebilir.`)) return;
    setUnbanBusy(email);
    try {
      await handleUnban(email);
      await loadBannedUsers();
    } finally { setUnbanBusy(null); }
  };

  const handleUnban = async (email: string) => {
    if (!isAdminEmail(currentUserEmail)) {
      notify("⛔ Sadece Kurucu Admin ban kaldırma yetkisine sahiptir.");
      return;
    }
    const unbanState = await serverManageLocal("unban_user", { email });
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

  // ★ Hata loglarını sunucudan getir
  const loadErrorLogs = async () => {
    setErrorLoading(true);
    try {
      const response = await fetch("/api/admin/action", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list_errors" }),
      });
      const data = await response.json().catch(() => null) as any;
      if (data?.ok) {
        setErrorLogs(data.errors || []);
        setErrorStats(data.stats || null);
        setErrorPage(0);
      } else notify(data?.error || "Hata logları alınamadı");
    } catch { notify("Sunucuya ulaşılamadı"); }
    finally { setErrorLoading(false); }
  };

  // ★ TEK hata kaydını sil (satır bazlı)
  const deleteErrorLog = async (id: unknown) => {
    try {
      await fetch("/api/admin/action", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete_error", id: String(id) }) });
    } catch { /* sessiz */ }
    setErrorLogs((cur) => cur.filter((l) => String(l.id) !== String(id)));
  };

  // ★ TÜM hata kayıtlarını sil (admin onaylı)
  const clearAllErrorLogs = async () => {
    if (!confirm("TÜM hata kayıtları kalıcı olarak silinsin mi? Bu işlem geri alınamaz!")) return;
    try {
      await fetch("/api/admin/action", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "clear_all_errors" }) });
    } catch { /* sessiz */ }
    setErrorLogs([]);
    setErrorStats(null);
    notify("Tüm hata kayıtları silindi");
  };

  // Hata Logları sekmesine ilk geçişte yükle
  useEffect(() => {
    if (activeTab === "errors" && errorLogs.length === 0 && !errorLoading) loadErrorLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ★ RPC KATMANI — adminDashboardRpc.ts'e taşındı (09.10 parçalama)
  const assertAdminActionLocal = (action: string, target?: string, reason?: string) =>
    assertAdminAction(action, notify, target, reason);

  // ★ Gerçek işlemi server üzerinden Supabase'e yazar.
  //   /api/admin/action tüm yönetimsel işlemleri (tier, jeton, ban, lock) işler.
  //   503 = Supabase henüz bağlı değil → local fallback devam eder.
  const serverManageLocal = (action: string, payload: Record<string, unknown>) =>
    serverManage(action, payload, notify);

  // ★ SRP adım 8 (09.10): kullanıcı yönetimi (tier/jeton/video hakları/hediye/
  //   e-posta arama/kullanıcı geçmişi) state + handler'ları useAdminYonetim.ts'e
  //   taşındı — handler imzaları birebir aynı, JSX bağlantıları değişmedi.

  const {
    videoRights, rightsLoading,
    userHistory, setUserHistory, loadingHistory, historyEmail, setHistoryEmail,
    emailSearchQuery, setEmailSearchQuery, giftAmount, setGiftAmount,
    giftTier, setGiftTier, emailSearchResult, setEmailSearchResult,
    handleTierChange, handleJetonChange, handleDirectJetonSet,
    refreshVideoRights, handleSetVideoRights,
    handleResetRights, handleResetSingleRight,
    handleUserHistory, handleEmailSearch, handleGiftRights, handleSetTierViaEmail,
  } = useAdminYonetim({
    notify, sysConfig, setSysConfig, users,
    selectedUserEmail: selectedUser?.email ?? "",
    setSelectedEmail, onUpdateUser, setBanLogs,
  });

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
    <AdminPanelKabuk
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onClose={onClose}        banLogs={banLogs}
        bannedCount={bannedUsers.length || undefined}
        errorStats={errorStats}
      errorAlarm={errorAlarm}
      feedbackStats={feedbackStats}
      saglik={panelSaglik}
    >
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
              handleResetSingleRight={handleResetSingleRight}
              jetonDelta={jetonDelta}
              setJetonDelta={setJetonDelta}
              handleDirectJetonSet={handleDirectJetonSet}
              rightsKind={rightsKind}
              setRightsKind={setRightsKind}
              videoRights={videoRights}
              rightsLoading={rightsLoading}
              handleSetVideoRights={handleSetVideoRights}
              refreshVideoRights={refreshVideoRights}
              selectedEmail={selectedEmail}
              setSelectedEmail={setSelectedEmail}
              filteredUsers={filteredUsers}
              currentUserEmail={currentUserEmail}
              handleUserHistory={handleUserHistory}
              userHistory={userHistory}
              loadingHistory={loadingHistory}
              historyEmail={historyEmail}
              setHistoryEmail={setHistoryEmail}
              setUserHistory={setUserHistory}
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

          {/* TAB 4: BAN & SİBER DENETİM LOGLARI — SRP adım 10: adminDashboardBolumler */}
          {activeTab === "banLogs" && (
            <AdminBanLogsTab
              banLogs={banLogs}
              bannedUsers={bannedUsers}
              bannedLoading={bannedLoading}
              banPage={banPage}
              setBanPage={setBanPage}
              onUnban={handleUnbanFromList}
              unbanBusy={unbanBusy}
              onReload={loadBannedUsers}
            />
          )}

          {/* TAB: HAFTANIN VİDEOSU — admin onay kuyruğu */}
          {activeTab === "haftaVideo" && (
            <AdminHaftaVideoTab notify={notify} />
          )}

          {/* TAB: HAFTALIK RAPOR — 7 günlük özet */}
          {activeTab === "rapor" && (
            <AdminHaftalikRaporTab notify={notify} />
          )}

          {/* TAB 5: GERİ BİLDİRİM — SRP adım 10: adminDashboardBolumler */}
          {activeTab === "feedback" && (
            <AdminFeedbackTab
              feedbackStats={feedbackStats} feedbackList={feedbackList}
              feedbackLoading={feedbackLoading} loadFeedback={loadFeedback}
              feedbackYanitAcik={feedbackYanitAcik} setFeedbackYanitAcik={setFeedbackYanitAcik}
              feedbackYanitMetni={feedbackYanitMetni} setFeedbackYanitMetni={setFeedbackYanitMetni}
              feedbackYanitYukleniyor={feedbackYanitYukleniyor} feedbackYanitGonder={feedbackYanitGonder}
            />
          )}
          {/* HATA LOGLARI SEKMESİ — SRP adım 10: adminDashboardBolumler */}
          {activeTab === "errors" && (
            <AdminErrorsTab
              errorLogs={errorLogs} errorStats={errorStats} errorLoading={errorLoading}
              loadErrorLogs={loadErrorLogs} errorFilter={errorFilter} setErrorFilter={setErrorFilter}
              errorPage={errorPage} setErrorPage={setErrorPage}
              errorGrouped={errorGrouped} setErrorGrouped={setErrorGrouped}
              deleteErrorLog={deleteErrorLog} clearAllErrorLogs={clearAllErrorLogs} notify={notify}
            />
          )}
    </AdminPanelKabuk>
  );
};
