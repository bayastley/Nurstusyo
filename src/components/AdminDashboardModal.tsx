import React, { useEffect, useState } from "react";
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
import { AdminHaftaVideoTab, AdminHaftalikRaporTab } from "./adminDashboardTabs";
import { AdminBanLogsTab, AdminFeedbackTab, AdminErrorsTab } from "./adminDashboardBolumler";
// ★ SRP (01.10): panel ÇERÇEVESİ adminDashboardKabuk.tsx'e taşındı — header + 7 sekmeli
//   nav + hata alarmı + footer. Bu dosya yalnız STATE + İŞ MANTIĞI + sekme içerikleri.
import { AdminPanelKabuk } from "./adminDashboardKabuk";
// ★ 06.10 SAĞLIK ROZETİ: panel açılışında 7 salt-okunur action sessizce ping'lenir
//   (usePanelSaglik.ts — YAZMA action'ları asla çağrılmaz); hatalı sekme rozette görünür.
import { usePanelSaglik } from "./usePanelSaglik";
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
  const [videoRights, setVideoRights] = useState<{ kisa: number; uzun: number; tam: number } | null>(null);
  const [rightsLoading, setRightsLoading] = useState(false);

  // Ban reason input state
  const [banReasonInput, setBanReasonInput] = useState<string>("");
  // ★ Kullanıcı geçmişi state
  const [userHistory, setUserHistory] = useState<any>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyEmail, setHistoryEmail] = useState("");
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
    try {
      const response = await fetch("/api/admin/action", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list_errors" }),
      });
      const data = await response.json().catch(() => null) as any;
      if (data?.ok && data.stats) {
        const total = Number(data.stats.total24h) || 0;
        setErrorStats(data.stats);
        setErrorAlarm(total >= 30 ? "alarm" : total >= 10 ? "warn" : "ok");
      }
    } catch { /* sessiz — alarm kontrolü siteyi bozmaz */ }
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

  // ★ TÜR BAZLI ÜRETİM HAKKI (04.10) — seçili kullanıcının kalan haklarını çek
  const refreshVideoRights = async (email: string) => {
    if (!email) { setVideoRights(null); return; }
    setRightsLoading(true);
    try {
      const response = await fetch("/api/admin/action", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_video_rights", target: email.trim().toLowerCase() }),
      });
      const data = await response.json().catch(() => null) as { ok?: boolean; rights?: { kisa: number; uzun: number; tam: number } } | null;
      setVideoRights(data?.ok && data.rights ? data.rights : { kisa: 0, uzun: 0, tam: 0 });
    } catch { setVideoRights({ kisa: 0, uzun: 0, tam: 0 }); }
    finally { setRightsLoading(false); }
  };

  // ★ TÜR BAZLI ÜRETİM HAKKI VER — mode "set" = mutlak, "gift" = üzerine ekle
  const handleSetVideoRights = async (email: string, kind: "kisa" | "uzun" | "tam", amount: number, mode: "set" | "gift") => {
    const target = email.trim().toLowerCase();
    const safeAmount = Math.max(0, Math.floor(amount));
    if (mode === "set" && safeAmount === 0 && !window.confirm(`${target} kullanıcısının ${kind === "kisa" ? "KISA" : kind === "uzun" ? "ORTA (600 sn)" : "UZUN (90 dk)"} hakları 0'a çekilecek. Emin misiniz?`)) return;
    try {
      const response = await fetch("/api/admin/action", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_video_rights", target, kind, amount: safeAmount, mode }),
      });
      const data = await response.json().catch(() => null) as { ok?: boolean; error?: string; remaining?: number } | null;
      if (!response.ok || !data?.ok) { notify(`❌ Hak verilmedi: ${data?.error || "bilinmeyen hata"}`); return; }
      const ad = kind === "kisa" ? "Kısa (59 sn)" : kind === "uzun" ? "Orta (600 sn)" : "Uzun (90 dk)";
      notify(mode === "gift"
        ? `⚡ ${target} · ${ad} +${safeAmount} hak eklendi · kalan: ${data.remaining}`
        : `⚡ ${target} · ${ad} ${safeAmount} hak olarak tanımlandı · kalan: ${data.remaining}`);
      await refreshVideoRights(target);
    } catch { notify("❌ Sunucuya ulaşılamadı — hak verilemedi"); }
  };

  // Seçili kullanıcı değişince hak durumunu tazele
  useEffect(() => {
    if (selectedUser?.email) refreshVideoRights(selectedUser.email);
    else setVideoRights(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser?.email]);

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

  // ★ TEK HAK SIFIRLA — kısa/uzun/tam ayrı ayrı; suçun boyutuna göre kısmi ceza
  const handleResetSingleRight = async (email: string, kind: "kisa" | "uzun" | "tam", cancelSubscription: boolean) => {
    const ad = kind === "kisa" ? "Kısa Video" : kind === "uzun" ? "Uzun Video" : "Tam Sürüm";
    const state = await serverManage("reset_single_right", { email, kind, cancelSubscription });
    if (state === "error") return;
    notify(cancelSubscription
      ? `🗑️ ${email} — ${ad} hakları sıfırlandı + üyelik iptal edildi`
      : `🗑️ ${email} — ${ad} paket hakları sıfırlandı (üyelik korundu)`);
  };

  // ★ KULLANICI GEÇMİŞİ — Email ile son 10 siparişi göster
  const handleUserHistory = async (email: string) => {
    const q = sanitizeText(email).trim().toLowerCase().slice(0, 254);
    if (!q || !isValidEmail(q)) {
      notify("⚠️ Geçerli bir e-posta adresi gir");
      return;
    }
    setLoadingHistory(true);
    setHistoryEmail(q);
    setUserHistory(null);
    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "user_history", target: q }),
      });
      const data = await res.json().catch(() => null);
      if (data?.ok) {
        setUserHistory(data);
        if (!data.user) {
          notify(`ℹ️ "${q}" adresinde kayıtlı kullanıcı bulunamadı`);
        }
      } else {
        notify(data?.error || "Geçmiş alınamadı");
      }
    } catch {
      notify("⚠️ Sunucuya ulaşılamadı");
    } finally {
      setLoadingHistory(false);
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
    if (safeAmount <= 0) { notify("⚠️ Hediye miktarı 0'dan büyük olmalı"); return; }
    // ★ DOĞRULAMalı İSTEK: sunucudan gerçek bakiye + hak durumu + uyarılar döner
    let giftResult: { ok?: boolean; balance?: number; rights?: Record<string, number>; warnings?: string[] } | null = null;
    try {
      const response = await fetch("/api/admin/action", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "gift_rights", target, tier: newTier, deltaJeton: safeAmount }),
      });
      const data = await response.json().catch(() => null);
      if (response.status === 503) {
        // sunucu erişilemez → yerel kayıt (offline dev)
        const result = giftRightsToUser(target, safeAmount, newTier);
        if (!result.ok) { notify(`❌ ${target} bulunamadı`); return; }
        setSysConfig(getSystemConfig());
        onUpdateUser(result.user.email, result.user.tier, result.user.jeton);
        setEmailSearchResult(result.user);
        notify(`🎁 ${target} · +${safeAmount} ⚡ hediye edildi (yerel)`);
        return;
      }
      if (!response.ok || !data?.ok) {
        notify(`❌ Hediye tamamlanamadı: ${data?.error || "bilinmeyen hata"}`);
        return;
      }
      giftResult = data;
    } catch {
      notify("❌ Sunucuya ulaşılamadı — hediye tamamlanamadı");
      return;
    }
    const refreshed = await refreshUserFromServer(target);
    const shownTier = (refreshed?.tier ?? newTier ?? "free").toUpperCase();
    const shownBalance = giftResult?.balance ?? refreshed?.jeton ?? 0;
    const warnMsg = giftResult?.warnings?.length ? ` · ⚠️ ${giftResult.warnings.join(" | ")}` : "";
    notify(`🎁 ${target} · +${safeAmount} ⚡ hediye edildi · tier: ${shownTier} · bakiye: ${shownBalance} ⚡${warnMsg}`);
    if (refreshed) setEmailSearchResult(refreshed);
    if (giftResult?.warnings?.length) console.warn("[gift_rights uyarıları]", giftResult.warnings);
  };

  // Sunucudan kullanıcı güncel bakiyesini çeker (hediye sonrası doğrulama)
  const refreshUserFromServer = async (email: string): Promise<ManagedUser | null> => {
    try {
      const response = await fetch("/api/admin/action", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list_users" }),
      });
      const data = await response.json().catch(() => null) as { ok?: boolean; users?: Array<{ id: string; email: string; name: string; tier: string; is_admin: boolean; wallet?: { sub_jeton?: number; purchased_jeton?: number } | null }> } | null;
      if (!data?.ok || !data.users) return null;
      const u = data.users.find((x) => x.email.toLowerCase() === email.toLowerCase());
      if (!u) return null;
      const jeton = (u.wallet?.sub_jeton ?? 0) + (u.wallet?.purchased_jeton ?? 0);
      const synced = syncUserInDb(u.email, u.name, (u.tier || "free") as Tier, jeton);
      setSysConfig(getSystemConfig());
      onUpdateUser(u.email, (u.tier || "free") as Tier, jeton);
      return synced;
    } catch { return null; }
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
