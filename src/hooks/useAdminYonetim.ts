// ════════════════════════════════════════════════════════
// USEADMINYONETIM.TS — AdminDashboardModal'dan taşındı (SRP parçalama, 09.10)
// Kullanıcı yönetimi iş mantığı: tier/jeton değişimi, video hakları, hediye,
//   e-posta arama, kullanıcı geçmişi. DAVRANIŞ BİREBİR AYNIDIR — jsx'e giden
//   handler imzaları AdminUsersTab'taki props adlarıyla aynı kaldı.
// ════════════════════════════════════════════════════════

import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import {
  getSystemConfig, saveSystemConfig,
  banUserInDb, getBanLogs,
  findUserByEmail, giftRightsToUser, setUserTier,
  type ManagedUser, type SystemConfig, type BanLog,
} from "../services/adminSyncService";
import { syncUserInDb } from "../components/adminHelpers";
import { sanitizeText, isValidEmail, clampNumber } from "../security/sanitize";
import { serverManage } from "../components/adminDashboardRpc";
import type { Tier } from "../types";

export interface UseAdminYonetimParams {
  notify: (msg: string) => void;
  sysConfig: SystemConfig;
  setSysConfig: Dispatch<SetStateAction<SystemConfig>>;
  users: ManagedUser[];
  /** Seçili kullanıcının e-postası (modal'da selectedUser?.email — ban ilk kaydına downcase edilebilir) */
  selectedUserEmail: string;
  setSelectedEmail: (email: string) => void;
  onUpdateUser: (email: string, tier: Tier, jeton: number) => void;
  setBanLogs: Dispatch<SetStateAction<BanLog[]>>;
}

export function useAdminYonetim({
  notify, sysConfig, setSysConfig, users,
  selectedUserEmail, setSelectedEmail, onUpdateUser, setBanLogs,
}: UseAdminYonetimParams) {
  const [videoRights, setVideoRights] = useState<{ kisa: number; uzun: number; tam: number } | null>(null);
  const [rightsLoading, setRightsLoading] = useState(false);
  const [userHistory, setUserHistory] = useState<any>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyEmail, setHistoryEmail] = useState("");
  const [emailSearchQuery, setEmailSearchQuery] = useState<string>("");
  const [giftAmount, setGiftAmount] = useState<number>(100);
  const [giftTier, setGiftTier] = useState<Tier>("free");
  const [emailSearchResult, setEmailSearchResult] = useState<ManagedUser | null>(null);

  const serverManageLocal = useCallback(
    (action: string, payload: Record<string, unknown>) => serverManage(action, payload, notify),
    [notify]
  );

  const handleTierChange = useCallback(async (email: string, newTier: Tier) => {
    const tierState = await serverManageLocal("change_tier", { email, tier: newTier });
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
  }, [users, sysConfig, setSysConfig, serverManageLocal, onUpdateUser, notify]);

  const handleJetonChange = useCallback(async (email: string, delta: number) => {
    const targetUserNow = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    const newTotal = Math.max(0, (targetUserNow?.jeton ?? 0) + delta);
    const jetonState = await serverManageLocal("change_jeton", { email, total: newTotal });
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
  }, [users, sysConfig, setSysConfig, serverManageLocal, onUpdateUser, notify]);

  const handleDirectJetonSet = useCallback(async (email: string, exactAmount: number) => {
    const safeAmount = Math.max(0, Math.floor(exactAmount));
    const setState = await serverManageLocal("change_jeton", { email, total: safeAmount });
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
  }, [users, sysConfig, setSysConfig, serverManageLocal, onUpdateUser, notify]);

  // ★ TÜR BAZLI ÜRETİM HAKKI (04.10) — seçili kullanıcının kalan haklarını çek
  const refreshVideoRights = useCallback(async (email: string) => {
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
  }, []);

  // ★ TÜR BAZLI ÜRETİM HAKKI VER — mode "set" = mutlak, "gift" = üzerine ekle
  const handleSetVideoRights = useCallback(async (email: string, kind: "kisa" | "uzun" | "tam", amount: number, mode: "set" | "gift") => {
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
  }, [notify, refreshVideoRights]);

  // Seçili kullanıcı değişince hak durumunu tazele
  useEffect(() => {
    if (selectedUserEmail) refreshVideoRights(selectedUserEmail);
    else setVideoRights(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserEmail]);

  // ★ HAKLARI SIFIRLA — satın alınan tüm hakları, jetonu ve aboneliği sıfırla
  const handleResetRights = useCallback(async (email: string) => {
    const resetState = await serverManageLocal("reset_rights", { email });
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
  }, [users, sysConfig, setSysConfig, serverManageLocal, onUpdateUser, notify]);

  // ★ TEK HAK SIFIRLA — kısa/uzun/tam ayrı ayrı; suçun boyutuna göre kısmi ceza
  const handleResetSingleRight = useCallback(async (email: string, kind: "kisa" | "uzun" | "tam", cancelSubscription: boolean) => {
    const ad = kind === "kisa" ? "Kısa Video" : kind === "uzun" ? "Uzun Video" : "Tam Sürüm";
    const state = await serverManageLocal("reset_single_right", { email, kind, cancelSubscription });
    if (state === "error") return;
    notify(cancelSubscription
      ? `🗑️ ${email} — ${ad} hakları sıfırlandı + üyelik iptal edildi`
      : `🗑️ ${email} — ${ad} paket hakları sıfırlandı (üyelik korundu)`);
  }, [serverManageLocal, notify]);

  // ★ KULLANICI GEÇMİŞİ — Email ile son 10 siparişi göster
  const handleUserHistory = useCallback(async (email: string) => {
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
  }, [notify]);

  // ★ EMAIL ARAMA — önce yerel, sonra Supabase (sonuç localStorage'a senkron)
  const handleEmailSearch = useCallback(async () => {
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
    const found = findUserByEmail(q);
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
  }, [emailSearchQuery, notify, setSysConfig, setBanLogs, setSelectedEmail]);

  // Sunucudan kullanıcı güncel bakiyesini çeker (hediye sonrası doğrulama)
  const refreshUserFromServer = useCallback(async (email: string): Promise<ManagedUser | null> => {
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
  }, [setSysConfig, onUpdateUser]);

  // ★ HAK HEDİYE — sunucudan gerçek bakiye + hak durumu + uyarılar döner
  const handleGiftRights = useCallback(async (email: string, amount: number, newTier?: Tier) => {
    const target = email.trim().toLowerCase();
    if (!isValidEmail(target)) { notify("⚠️ Geçerli bir e-posta adresi gir"); return; }
    const safeAmount = clampNumber(amount, 0, 100000);
    if (safeAmount <= 0) { notify("⚠️ Hediye miktarı 0'dan büyük olmalı"); return; }
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
  }, [notify, setSysConfig, onUpdateUser, refreshUserFromServer]);

  const handleSetTierViaEmail = useCallback(async (email: string, newTier: Tier) => {
    const target = email.trim().toLowerCase();
    const tierState = await serverManageLocal("change_tier", { email: target, tier: newTier });
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
  }, [notify, serverManageLocal, setSysConfig, onUpdateUser]);

  return {
    // state (AdminUsersTab props'larına aynen bağlanır)
    videoRights, rightsLoading,
    userHistory, setUserHistory, loadingHistory, historyEmail, setHistoryEmail,
    emailSearchQuery, setEmailSearchQuery, giftAmount, setGiftAmount,
    giftTier, setGiftTier, emailSearchResult, setEmailSearchResult,
    // handlers
    handleTierChange, handleJetonChange, handleDirectJetonSet,
    refreshVideoRights, handleSetVideoRights,
    handleResetRights, handleResetSingleRight,
    handleUserHistory, handleEmailSearch, handleGiftRights, handleSetTierViaEmail,
  };
}
