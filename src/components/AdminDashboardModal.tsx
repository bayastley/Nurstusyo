import { translate } from "../i18n";
// ★ 26.10 I18N KÖPRÜSÜ: oturumun dilini her çağrıda okur
const ttX2610 = (k: string): string => translate(typeof localStorage !== "undefined" ? (localStorage.getItem("nur_lang") || "tr") : "tr", k);
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
// ★ 10.10 (Öncelik-1 GİZLE/BAKIM PLANI): admin-gizli özellikler sekmesi
import { AdminGizliFeaturesTab } from "./AdminGizliFeatures";
import { AdminHaftaVideoTab, AdminHaftalikRaporTab, AdminKullanimTab, type KullanimHafta } from "./adminDashboardTabs";
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
  const [activeTab, setActiveTab] = useState<"users" | "broadcast" | "banLogs" | "errors" | "feedback" | "modules" | "sync" | "haftaVideo" | "rapor" | "gizliFeatures" | "kullanim">("users");
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
    } catch { notify(ttX2610("asSunucu")); }
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
    } catch { notify(ttX2610("asSunucu")); }
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
      notify(ttX2610("adKurucuBan"));
      return;
    }
    // ★ Güvenlik: Oturum açık olan admin kendi hesabını (hangi email ile
    //   girmiş olursa olsun) yanlışlıkla banlayıp kendini kilitleyemesin.
    if (email.trim().toLowerCase() === currentUserEmail.trim().toLowerCase()) {
      notify(ttX2610("adOturumBan"));
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
      notify(ttX2610("adBanDb").replace("{a}", email));
    } else if (banState === "fallback") {
      notify(ttX2610("adBanYerken").replace("{a}", email));
    } else {
      notify(ttX2610("adBanSunucuHata").replace("{a}", email));
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

  // ★ 25.10 BÖLÜM KULLANIM ANALİZİ — /api/admin/usage hazine verisini çeker.
  //   Sekme ilk açılışında + Yenile butonunda tetiklenir; hafta seçimi client-side.
  const [kullanimRows, setKullanimRows] = useState<KullanimHafta[]>([]);
  const [kullanimHafta, setKullanimHafta] = useState<string | null>(null);
  const loadKullanim = async () => {
    try {
      const response = await fetch("/api/admin/usage", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" } });
      const data = await response.json().catch(() => null) as { ok?: boolean; haftalar?: KullanimHafta[]; error?: string } | null;
      if (data?.ok && Array.isArray(data.haftalar)) {
        setKullanimRows(data.haftalar);
        setKullanimHafta((cur) => (cur && data.haftalar!.some((h) => h.pazar === cur) ? cur : data.haftalar![0]?.pazar ?? null));
      } else {
        setKullanimRows([]);
        notify(data?.error || "Kullanım verisi alınamadı");
      }
    } catch { setKullanimRows([]); notify(ttX2610("asSunucu")); }
  };
  useEffect(() => {
    if (activeTab === "kullanim" && kullanimRows.length === 0) void loadKullanim();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ★ LİSTEDEN BAN KALDIR — sunucu + yerel + liste yenileme tek akış
  const handleUnbanFromList = async (email: string) => {
    if (!isAdminEmail(currentUserEmail)) {
      notify(ttX2610("adBanKaldirma"));
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
      notify(ttX2610("adBanKaldirma"));
      return;
    }
    const unbanState = await serverManageLocal("unban_user", { email });
    // Ban her zaman yerel olarak kaldırılır
    unbanUserInDb(email);
    setSysConfig(getSystemConfig());
    setBanLogs(getBanLogs());
    onUpdateUser(email, "free", 20);
    if (unbanState === "done") {
      notify(ttX2610("adBanIade").replace("{a}", email));
    } else {
      notify(ttX2610("adBanYerkenIade").replace("{a}", email));
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
    } catch { notify(ttX2610("asSunucu")); }
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
    notify(ttX2610("abHataKayitlari"));
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
    notify(ttX2610("abModulDurum"));
  };

  const handleCreateModule = async () => {
    if (!newModTitle.trim()) {
      notify(ttX2610("abModulBaslik"));
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
    notify(ttX2610("adModulEkle").replace("{a}", String(newMod.title)));
  };

  const handlePushGist = async () => {
    if (!ghToken.trim()) {
      notify(ttX2610("abGithubToken"));
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

          {/* ★ TAB: GİZLİ ÖZELLİKLER — 6 madde + atmosfer kategorileri (10.10) */}
          {activeTab === "gizliFeatures" && <AdminGizliFeaturesTab notify={notify} />}

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

          {/* ★ 25.10 TAB: BÖLÜM KULLANIM ANALİZİ — hangi bölüm yüzde kaç kullanılıyor,
              haftalık pazar-bitiminde yuvarlanmış +50 kayıt saklanır; tarih seçilince o
              haftanın dağılımı gösterilir. Veriler GATE_KAPISI arkasında okunduğu için
              normal kullanıcı hiçbir yol ile erişemez, mod11 istemcisi yoktur. */}
          {activeTab === "kullanim" && (
            <AdminKullanimTab
              rows={kullanimRows}
              seciliHafta={kullanimHafta}
              setSeciliHafta={setKullanimHafta}
              onYenile={() => void loadKullanim()}
              notify={notify}
            />
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
