import React, { useEffect, useState } from "react";
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
  currentUserEmail = "",
  onUpdateUser,
  notify,
}) => {
  const [activeTab, setActiveTab] = useState<"users" | "broadcast" | "banLogs" | "errors" | "feedback" | "modules" | "sync">("users");
  const [sysConfig, setSysConfig] = useState<SystemConfig>(() => getSystemConfig());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<string>(currentUserEmail);
  const [jetonDelta, setJetonDelta] = useState<number>(50);

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
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 p-3 md:p-6 backdrop-blur-md modal-in"
      onMouseDown={onClose}
      onClick={onClose}
    >
      <div
        className="glass modal-in relative flex max-h-[92vh] w-full max-w-3xl mx-2 sm:mx-auto flex-col overflow-hidden rounded-3xl shadow-2xl"
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
                Oturum: <b style={{ color: "var(--accent-2)" }}>{currentUserEmail || "Admin"}</b>
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
          <button
            onClick={() => setActiveTab("errors")}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-[10.5px] font-bold transition whitespace-nowrap relative ${
              activeTab === "errors" ? "text-black font-black" : "text-amber-300 hover:text-white"
            }`}
            style={activeTab === "errors" ? { background: "linear-gradient(135deg,#fbbf24,#d97706)" } : { background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.3)" }}
          >
            ⚠️
            <span>Hata Logları{errorStats ? ` (${errorStats.total24h})` : ""}</span>
            {errorAlarm === "alarm" && <span className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-red-500 animate-ping" />}
            {errorAlarm === "alarm" && <span className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-red-500" />}
          </button>
          <button
            onClick={() => setActiveTab("feedback")}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-[10.5px] font-bold transition whitespace-nowrap relative ${
              activeTab === "feedback" ? "text-black font-black" : "text-emerald-300 hover:text-white"
            }`}
            style={activeTab === "feedback" ? { background: "linear-gradient(135deg,#34d399,#059669)" } : { background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.3)" }}
          >
            💬
            <span>Geri Bildirim{feedbackStats ? ` (${feedbackStats.toplam})` : ""}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">
          {/* ★ HATA ALARMI — eşik aşımında en üstte görünür */}
          {errorAlarm !== "ok" && (
            <div className={`rounded-2xl border px-4 py-3 ${errorAlarm === "alarm" ? "border-red-500/50 bg-red-500/15 animate-pulse" : "border-amber-500/40 bg-amber-500/10"}`}>
              <p className={`text-xs font-black ${errorAlarm === "alarm" ? "text-red-300" : "text-amber-300"}`}>
                {errorAlarm === "alarm" ? "🚨 ACİL HATA ALARMI" : "⚠️ HATA UYARISI"}
                {errorStats ? ` — Son 24 saatte ${errorStats.total24h} hata (${errorStats.unique24h} benzersiz)` : ""}
              </p>
              <p className="mt-1 text-[10px] text-white/60">Siteyi kullanıcılar hatalı kullanıyor olabilir. Ayrıntılar için Hata Logları sekmesine bak.</p>
              <button onClick={() => setActiveTab("errors")} className="mt-2 rounded-lg bg-white/10 px-3 py-1 text-[10px] font-bold text-white/80 transition hover:bg-white/20">
                → Hata Logları'na git
              </button>
            </div>
          )}
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

          {/* TAB 5: HATA LOGLARI */}
          {activeTab === "feedback" && (
            <div className="space-y-4">
              {/* Özet: toplam + ortalama puan */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                  <p className="text-2xl font-black text-emerald-300">{feedbackStats?.toplam ?? "—"}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/45">Toplam görüş</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                  <p className="text-2xl font-black text-amber-300">{feedbackStats?.puanOrtalama ? `${feedbackStats.puanOrtalama} ⭐` : "—"}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/45">Ortalama puan</p>
                </div>
              </div>

              {/* Tür dağılımı */}
              {feedbackStats && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-white/45">Tür dağılımı</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-lg bg-amber-500/15 px-2.5 py-1 text-[10px] font-bold text-amber-300">💡 Öneri: {feedbackStats.turDagilimi.oneri ?? 0}</span>
                    <span className="rounded-lg bg-sky-500/15 px-2.5 py-1 text-[10px] font-bold text-sky-300">✨ Özellik: {feedbackStats.turDagilimi.ozellik ?? 0}</span>
                    <span className="rounded-lg bg-red-500/15 px-2.5 py-1 text-[10px] font-bold text-red-300">😔 Şikayet: {feedbackStats.turDagilimi.sikayet ?? 0}</span>
                    <span className="rounded-lg bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white/60">✉️ Diğer: {feedbackStats.turDagilimi.diger ?? 0}</span>
                  </div>
                  <p className="mb-2 mt-3 text-[9px] font-bold uppercase tracking-widest text-white/45">Puan dağılımı</p>
                  {[5, 4, 3, 2, 1].map((n) => {
                    const adet = feedbackStats.puanDagilimi[n] ?? 0;
                    const yuzde = feedbackStats.toplam ? Math.round((adet / feedbackStats.toplam) * 100) : 0;
                    return (
                      <div key={n} className="mb-1 flex items-center gap-2">
                        <span className="w-8 text-[10px] text-white/50">{n} ⭐</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full rounded-full" style={{ width: `${yuzde}%`, background: "linear-gradient(90deg,#fbbf24,#d97706)" }} />
                        </div>
                        <span className="w-8 text-right text-[10px] text-white/50">{adet}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Yenile */}
              <button onClick={loadFeedback} disabled={feedbackLoading}
                className="w-full rounded-xl bg-white/10 px-3 py-2 text-[10px] font-bold text-white/80 transition hover:bg-white/20 disabled:opacity-50">
                {feedbackLoading ? "Yükleniyor…" : "↻ Yenile"}
              </button>

              {/* Mesaj listesi */}
              <div className="space-y-2">
                {feedbackList.length > 0 ? feedbackList.map((fb) => {
                  const turRenk = fb.tur === "sikayet" ? "text-red-300" : fb.tur === "ozellik" ? "text-sky-300" : fb.tur === "oneri" ? "text-amber-300" : "text-white/60";
                  const turEtiket = fb.tur === "sikayet" ? "😔 Şikayet" : fb.tur === "ozellik" ? "✨ Özellik" : fb.tur === "oneri" ? "💡 Öneri" : "✉️ Diğer";
                  return (
                    <div key={fb.id} className="rounded-xl border border-white/10 bg-black/40 p-3 text-[10.5px] space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`font-bold ${turRenk}`}>{turEtiket}{fb.puan ? ` · ${"⭐".repeat(fb.puan)}` : ""}</span>
                        <span className="shrink-0 text-[8.5px] text-white/40">{new Date(fb.created_at).toLocaleString("tr-TR")}</span>
                      </div>
                      <p className="whitespace-pre-wrap text-white/80">{fb.mesaj}</p>
                      <div className="border-t border-white/5 pt-1 text-[8.5px] text-white/40">
                        {fb.user_name || fb.user_email ? `${fb.user_name ? fb.user_name + " · " : ""}${fb.user_email || ""}` : "👻 Misafir kullanıcı"}
                      </div>
                    </div>
                  );
                }) : (
                  <p className="p-6 text-center text-[10px] text-white/40 italic">
                    {feedbackLoading ? "Yükleniyor…" : "Henüz geri bildirim yok — kutu footer'da 💬"}
                  </p>
                )}
              </div>
            </div>
          )}
          {activeTab === "errors" && (() => {
            // ★ SAYFALAMA + FİLTRE: her sayfada 10 kayıt, sayfa sayfa gezilir
            const PAGE_SIZE = 10;
            const turEtiketleri: Record<string, string> = {
              video: "🎬 Video", payment: "💳 Ödeme", auth: "🔐 Giriş", upload: "☁️ Yükleme", audio: "🎧 Ses", network: "🌐 Bağlantı", genel: "⚠️ Genel",
            };
            const turRenkleri: Record<string, string> = {
              video: "bg-purple-500/15 text-purple-300 border-purple-500/30",
              payment: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
              auth: "bg-sky-500/15 text-sky-300 border-sky-500/30",
              upload: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
              audio: "bg-pink-500/15 text-pink-300 border-pink-500/30",
              network: "bg-orange-500/15 text-orange-300 border-orange-500/30",
              genel: "bg-white/10 text-white/60 border-white/20",
            };
            const okunurMesaj = (msg: string): string => {
              const m = String(msg || "");
              if (/failed to fetch|networkerror|network error/i.test(m)) return "İnternet bağlantısı kesildi — istek sunucuya ulaşamadı";
              if (/401|unauthorized|yetkisiz/i.test(m)) return "Oturum süresi doldu — kullanıcı yeniden giriş yapmalı";
              if (/403|forbidden/i.test(m)) return "Yetkisiz işlem denemesi";
              if (/404/i.test(m)) return "Aranan kaynak bulunamadı";
              if (/429|too many/i.test(m)) return "Çok fazla istek — hız limiti devreye girdi";
              if (/500|internal server/i.test(m)) return "Sunucu hatası — Vercel fonksiyonu patladı";
              if (/mediarecorder|canvas|capturestream|render/i.test(m)) return "Video oluşturma (render) sırasında tarayıcı kısıtı";
              if (/iyzico|payment|checkout/i.test(m)) return "Ödeme akışında sorun";
              if (/supabase/i.test(m)) return "Veritabanı bağlantı sorunu";
              if (/storage|quota|bellek|memory/i.test(m)) return "Bellek/disk sınırı aşıldı";
              return m.length > 90 ? m.slice(0, 90) + "…" : m;
            };
            // ★ GRUPLAMA: aynı fingerprint'ten EN YENİSİ + ×N sayacı + İLK GÖRÜLME zamanı
            const grupla = (list: any[]) => {
              const map = new Map<string, { log: any; adet: number; ilkZaman: string }>();
              // liste created_at.desc sıralı — döngü biterken ilkZaman en eski kayıt olur
              let sonSonuc: { log: any; adet: number; ilkZaman: string }[] = [];
              const temp = new Map<string, { log: any; adet: number; ilkZaman: string }>();
              for (const l of list) {
                const key = String(l.fingerprint || l.id);
                const cur = temp.get(key);
                if (cur) { cur.adet++; cur.ilkZaman = l.created_at; } // desc sıralı → son gelen en eski
                else temp.set(key, { log: l, adet: 1, ilkZaman: l.created_at });
              }
              sonSonuc = [...temp.values()];
              return sonSonuc;
            };
            const ham = errorFilter === "all"
              ? errorLogs
              : errorFilter === "unique"
                ? errorLogs.filter((l, i, arr) => arr.findIndex((x) => x.fingerprint === l.fingerprint) === i)
                : errorFilter === "server"
                  ? errorLogs.filter((l) => String(l.source || "").startsWith("server:"))
                  : errorFilter === "browser"
                    ? errorLogs.filter((l) => !String(l.source || "").startsWith("server:"))
                    : errorLogs.filter((l) => String(l.kind || "genel") === errorFilter);
            const gorunen: any[] = errorGrouped && errorFilter !== "unique"
              ? grupla(ham).map((g) => ({ ...g.log, __adet: g.adet, __ilk: g.ilkZaman }))
              : ham;
            const sayfaSayisi = Math.max(1, Math.ceil(gorunen.length / PAGE_SIZE));
            const guvenliSayfa = Math.min(errorPage, sayfaSayisi - 1);
            const sayfadaki = gorunen.slice(guvenliSayfa * PAGE_SIZE, guvenliSayfa * PAGE_SIZE + PAGE_SIZE);
            const turlar = Array.from(new Set(errorLogs.map((l) => String(l.kind || "genel"))));
            return (
            <div className="space-y-4">
              {/* İstatistik özeti — BUTONLAR: tıklayınca filtre uygular */}
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => { setErrorFilter("all"); setErrorPage(0); }}
                  className={`rounded-2xl border p-4 text-center transition ${errorFilter === "all" ? "border-amber-400/60 bg-amber-500/20 ring-1 ring-amber-400/40" : "border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20"}`}>
                  <p className="text-2xl font-black text-amber-300">{errorStats?.total24h ?? "—"}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/45">Son 24 saat · toplam</p>
                </button>
                <button onClick={() => { setErrorFilter("unique"); setErrorPage(0); }}
                  className={`rounded-2xl border p-4 text-center transition ${errorFilter === "unique" ? "border-white/40 bg-white/15 ring-1 ring-white/30" : "border-white/10 bg-white/5 hover:bg-white/10"}`}>
                  <p className="text-2xl font-black text-white">{errorStats?.unique24h ?? "—"}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/45">Benzersiz hata</p>
                </button>
              </div>

              {/* ★ SUNUCU / TARAYICI ayrım filtresi — 🖥️ server hataları tek tıkla */}
              {(() => {
                const serverAdet = errorLogs.filter((l) => String(l.source || "").startsWith("server:")).length;
                if (serverAdet === 0 && errorFilter !== "server") return null;
                const butonlar = [
                  { key: "server", etiket: `🖥️ Sunucu · ${serverAdet}`, stil: "border-red-500/40 bg-red-500/15 text-red-300" },
                  { key: "browser", etiket: `🌐 Tarayıcı · ${errorLogs.length - serverAdet}`, stil: "border-sky-500/40 bg-sky-500/15 text-sky-300" },
                ];
                return (
                  <div className="flex flex-wrap gap-2">
                    {butonlar.map((b) => (
                      <button key={b.key} onClick={() => { setErrorFilter(b.key); setErrorPage(0); }}
                        className={`rounded-lg border px-2.5 py-1 text-[10px] font-bold transition ${errorFilter === b.key ? b.stil + " ring-1 ring-white/40" : b.stil + " opacity-60 hover:opacity-100"}`}>
                        {b.etiket}
                      </button>
                    ))}
                  </div>
                );
              })()}

              {/* ★ ENDPOINT KIRILIMI — 🖥️ Sunucu filtresi seçiliyken hangi API kaç hata vermiş, çoktan aza sıralı */}
              {errorFilter === "server" && (() => {
                const endpointMap = new Map<string, { adet: number; sonZaman: string }>();
                for (const l of errorLogs) {
                  const src = String(l.source || "");
                  if (!src.startsWith("server:")) continue;
                  const ep = src.slice(7) || "bilinmeyen";
                  const cur = endpointMap.get(ep);
                  if (cur) { cur.adet++; if (l.created_at > cur.sonZaman) cur.sonZaman = l.created_at; }
                  else endpointMap.set(ep, { adet: 1, sonZaman: l.created_at });
                }
                const sirali = [...endpointMap.entries()].sort((a, b) => b[1].adet - a[1].adet);
                if (sirali.length === 0) return null;
                const enCok = sirali[0][1].adet;
                return (
                  <div className="rounded-xl border border-red-500/25 bg-red-500/[.06] p-3">
                    <p className="mb-2 flex items-center gap-1.5 text-[9.5px] font-black uppercase tracking-wider text-red-300">
                      <span>🖥️</span> Endpoint Kırılımı — hangi API kaç hata verdi
                      <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[8px] font-black text-red-300">{sirali.length} endpoint</span>
                    </p>
                    <div className="space-y-1.5">
                      {sirali.map(([ep, bilgi]) => (
                        <button
                          key={ep}
                          onClick={() => notify(`🔍 ${ep} — son hata: ${new Date(bilgi.sonZaman).toLocaleString("tr-TR")}`)}
                          className="group block w-full text-left"
                          title={`${ep} · ${bilgi.adet} hata · son: ${new Date(bilgi.sonZaman).toLocaleString("tr-TR")}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-20 shrink-0 truncate font-mono text-[9px] font-bold text-white/75 group-hover:text-white">/{ep}{bilgi.adet === enCok && <span title="En çok hata veren endpoint"> 👑</span>}</span>
                            <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/[.06]">
                              <span
                                className="block h-full rounded-full transition-all"
                                style={{
                                  width: `${Math.max(6, Math.round((bilgi.adet / enCok) * 100))}%`,
                                  background: "linear-gradient(90deg,#ef4444,#f87171)",
                                }}
                              />
                            </span>
                            <span className={`w-8 shrink-0 text-right text-[9.5px] font-black ${bilgi.adet === enCok ? "text-red-300" : "text-white/55"}`}>{bilgi.adet}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-[8px] text-white/35">Çubuk uzunluğu = hata sayısı oranı · en üstte en çok hata veren endpoint · tıkla → son hata zamanını gör</p>
                  </div>
                );
              })()}

              {/* ★ ALARM BANDI — 24 saatte sunucu hatası 10'u aşarsa kırmızı uyarı + en çok hata veren endpoint */}
              {(() => {
                const serverAdet = errorLogs.filter((l) => String(l.source || "").startsWith("server:")).length;
                if (serverAdet <= 10) return null;
                const endpointMap = new Map<string, number>();
                for (const l of errorLogs) {
                  const src = String(l.source || "");
                  if (src.startsWith("server:")) endpointMap.set(src.slice(7) || "bilinmeyen", (endpointMap.get(src.slice(7) || "bilinmeyen") || 0) + 1);
                }
                const enKotu = [...endpointMap.entries()].sort((a, b) => b[1] - a[1])[0];
                return (
                  <div
                    className="flex items-center gap-2 rounded-xl border border-red-500/50 bg-gradient-to-r from-red-500/20 to-red-500/[.08] px-3 py-2.5"
                    role="alert"
                    style={{ boxShadow: "0 0 18px rgba(239,68,68,.25)" }}
                  >
                    <span className="animate-pulse text-base" aria-hidden>🚨</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10.5px] font-black text-red-200">
                        SON 24 SAATTE {serverAdet} SUNUCU HATASI — KRİTİK EŞİK (10) AŞILDI
                      </p>
                      <p className="text-[9px] text-red-200/70">
                        Sorunlu endpoint: <b className="font-mono text-red-100">/{enKotu[0]}</b> ({enKotu[1]} hata) — 🖥️ Sunucu filtresinden kırılımı incele
                      </p>
                    </div>
                    <button
                      onClick={() => { setErrorFilter("server"); setErrorPage(0); }}
                      className="shrink-0 rounded-lg bg-red-500/30 px-2.5 py-1.5 text-[9px] font-black text-red-100 transition hover:bg-red-500/50"
                    >
                      Kırılımı Gör
                    </button>
                  </div>
                );
              })()}

              {/* Tür filtresi — varsa tür butonları */}
              {turlar.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {turlar.map((t) => {
                    const adet = errorLogs.filter((l) => String(l.kind || "genel") === t).length;
                    const aktif = errorFilter === t;
                    return (
                      <button key={t} onClick={() => { setErrorFilter(t); setErrorPage(0); }}
                        className={`rounded-lg border px-2.5 py-1 text-[10px] font-bold transition ${aktif ? turRenkleri[t] + " ring-1 ring-white/40" : turRenkleri[t] + " opacity-60 hover:opacity-100"}`}>
                        {turEtiketleri[t] || t} · {adet}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Yenile / temizle */}
              <div className="flex gap-2">
                <button onClick={loadErrorLogs} disabled={errorLoading}
                  className="flex-1 rounded-xl bg-white/10 px-3 py-2 text-[10px] font-bold text-white/80 transition hover:bg-white/20 disabled:opacity-50">
                  {errorLoading ? "Yükleniyor…" : "↻ Yenile"}
                </button>
                <button onClick={() => { setErrorGrouped(!errorGrouped); setErrorPage(0); }}
                  title={errorGrouped ? "Aynı hatalar tek satırda ×N sayacıyla birleştiriliyor — tıkla, her kaydı tek tek gör" : "Kayıtlar tek tek listeleniyor — tıkla, aynı hatalar tek satırda birleşsin"}
                  className={`rounded-xl border px-3 py-2 text-[10px] font-bold transition ${errorGrouped ? "border-sky-400/40 bg-sky-500/15 text-sky-300" : "border-white/15 bg-white/5 text-white/50 hover:bg-white/10"}`}>
                  📚 {errorGrouped ? "Gruplu" : "Tek tek"}
                </button>
                <button
                  onClick={async () => {
                    if (!confirm("30 günden eski hata kayıtları silinsin mi?")) return;
                    await fetch("/api/admin/action", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "clear_errors" }) });
                    notify("Eski kayıtlar temizlendi");
                    loadErrorLogs();
                  }}
                  className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-[10px] font-bold text-red-300 transition hover:bg-red-500/20">
                  🗑 Eskileri temizle
                </button>
                <button onClick={clearAllErrorLogs}
                  className="rounded-xl border border-red-500/40 bg-red-500/20 px-3 py-2 text-[10px] font-black text-red-200 transition hover:bg-red-500/30">
                  🔥 Tümünü temizle
                </button>
              </div>

              {/* Liste */}
              <div className="space-y-2">
                {sayfadaki.length > 0 ? sayfadaki.map((log) => {
                  const cihaz = String(log.user_agent || "");
                  const cihazKisa = cihaz.includes("Mobile") ? "📱 Mobil" : cihaz.includes("Tablet") ? "📟 Tablet" : "💻 Masaüstü";
                  const tarayici = cihaz.includes("Edg/") ? "Edge" : cihaz.includes("Chrome/") ? "Chrome" : cihaz.includes("Firefox/") ? "Firefox" : cihaz.includes("Safari/") ? "Safari" : "Diğer";
                  const kind = String(log.kind || "genel");
                  return (
                    <div key={log.id} className="rounded-xl border border-white/10 bg-black/40 p-3 text-[10.5px] space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`shrink-0 rounded border px-1.5 py-0.5 text-[8px] font-black ${turRenkleri[kind] || turRenkleri.genel}`}>{turEtiketleri[kind] || kind}</span>
                        <span className="flex-1 truncate px-1 font-bold text-amber-300" title={log.message}>{okunurMesaj(log.message)}</span>
                        {/* ★ GRUP SAYACI — aynı hata N kez tekrarladıysa ×N rozeti */}
                        {log.__adet > 1 && (
                          <span className="shrink-0 rounded-full bg-sky-500/20 px-2 py-0.5 text-[8.5px] font-black text-sky-300" title={`Aynı hata son 500 kayıtta ${log.__adet} kez tekrarladı`}>
                            ×{log.__adet}
                          </span>
                        )}
                        <span className="flex shrink-0 items-center gap-1">
                          <span className={`rounded px-1.5 py-0.5 text-[8px] font-black ${String(log.source || "").startsWith("server:") ? "bg-red-500/20 text-red-300" : "bg-white/10 text-white/60"}`} title={String(log.source || "").startsWith("server:") ? "Sunucu (Vercel API) hatası" : "Tarayıcı hatası"}>{String(log.source || "").startsWith("server:") ? `🖥️ ${String(log.source).slice(7)}` : log.source}</span>
                          <button onClick={() => deleteErrorLog(log.id)} title="Bu kaydı sil"
                            className="rounded px-1 py-0.5 text-[8px] font-black text-white/30 transition hover:bg-red-500/20 hover:text-red-300">✕</button>
                        </span>
                      </div>
                      {/* ★ KİM YAŞADI — kullanıcı e-postası (misafirde ghost) */}
                      <div className={`flex items-center gap-1 text-[9.5px] font-bold ${log.user_email ? "text-sky-300" : "text-white/35"}`}>
                        {log.user_email ? <><UserCheck size={11} /> {log.user_email}</> : "👻 Misafir kullanıcı (giriş yapmamış)"}
                      </div>
                      {log.stack && (
                        <details className="text-white/40">
                          <summary className="cursor-pointer text-[9px] hover:text-white/70">Yığın izi (stack)</summary>
                          <pre className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap rounded bg-black/60 p-2 text-[8.5px] text-white/50">{log.stack}</pre>
                        </details>
                      )}
                      <div className="flex items-center justify-between text-[8.5px] text-white/40 pt-1 border-t border-white/5">
                        <span>{cihazKisa} · {tarayici} · {log.path || "/"}</span>
                        <span title={log.__ilk && log.__ilk !== log.created_at ? `İlk görülme: ${new Date(log.__ilk).toLocaleString("tr-TR")}` : undefined}>
                          {log.__ilk && log.__ilk !== log.created_at ? (
                            <>ilk: {new Date(log.__ilk).toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })} · son: {new Date(log.created_at).toLocaleString("tr-TR")}</>
                          ) : (
                            new Date(log.created_at).toLocaleString("tr-TR")
                          )}
                        </span>
                      </div>
                    </div>
                  );
                }) : (
                  <p className="p-6 text-center text-[10px] text-white/40 italic">
                    {errorLoading ? "Yükleniyor…" : errorFilter === "all" ? "Henüz hata kaydı yok — sistem temiz çalışıyor ✨" : "Bu filtrede kayıt yok"}
                  </p>
                )}
              </div>

              {/* Sayfalama: her sayfada 10, aşağıda sayfa butonları */}
              {sayfaSayisi > 1 && (
                <div className="flex items-center justify-center gap-1.5 pt-1">
                  <button onClick={() => setErrorPage(Math.max(0, guvenliSayfa - 1))} disabled={guvenliSayfa === 0}
                    className="rounded-lg bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white/70 disabled:opacity-30 hover:bg-white/20">‹</button>
                  {Array.from({ length: sayfaSayisi }, (_, i) => i).slice(Math.max(0, guvenliSayfa - 2), Math.max(0, guvenliSayfa - 2) + 5).map((i) => (
                    <button key={i} onClick={() => setErrorPage(i)}
                      className={`h-7 w-7 rounded-lg text-[10px] font-black transition ${i === guvenliSayfa ? "bg-amber-400 text-black" : "bg-white/10 text-white/60 hover:bg-white/20"}`}>{i + 1}</button>
                  ))}
                  <button onClick={() => setErrorPage(Math.min(sayfaSayisi - 1, guvenliSayfa + 1))} disabled={guvenliSayfa === sayfaSayisi - 1}
                    className="rounded-lg bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white/70 disabled:opacity-30 hover:bg-white/20">›</button>
                  <span className="ml-1 text-[9px] text-white/35">{gorunen.length} kayıt · sayfa {guvenliSayfa + 1}/{sayfaSayisi}</span>
                </div>
              )}
            </div>
            );
          })()}
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
