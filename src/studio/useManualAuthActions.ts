import { useCallback } from "react";
import { secureGet, secureSet, secureRemove } from "../secureStore";
import { checkRateLimit } from "../rateLimiter";
import { JETON, getJeton, setCurrentTier, setJeton as persistJetonSecure, type Tier } from "../tier";
import { syncUserInDb } from "../components/adminHelpers";
import { uid } from "./studioHelpers";
import type { LoginTab, ModalName, User } from "../types";

interface UseManualAuthActionsParams {
  phone: string;
  verifyCode: string;
  sentCode: string;
  tier: Tier;
  notify: (message: string) => void;
  setUser: (value: User | null) => void;
  setAdminGodMode: (value: boolean) => void;
  setTier: (value: Tier) => void;
  setJetonCount: (value: number) => void;
  setSentCode: (value: string) => void;
  setLoginTab: (value: LoginTab) => void;
  setModal: (value: ModalName) => void;
}

export function useManualAuthActions({
  phone,
  verifyCode,
  sentCode,
  tier,
  notify,
  setUser,
  setAdminGodMode,
  setTier,
  setJetonCount,
  setSentCode,
  setLoginTab,
  setModal,
}: UseManualAuthActionsParams) {
  const handleLoginSubmit = useCallback(() => {
    const rl = checkRateLimit("auth");
    if (!rl.allowed) { notify(`${rl.message} (${Math.ceil(rl.retryAfterMs / 1000)} sn kaldı)`); return; }
    const email = phone.includes("@") ? phone.trim().toLowerCase() : "demo@nurstudio.app";
    // ★ ÇİFT KATMAN (30.09): demo formu admin e-postasını TANIMAZ — admin
    //   yetkisi yalnızca sunucu doğrulamalı Google oturumu + NUR_ADMIN_EMAILS
    //   + DB is_admin zinciriyle gelir. İstemci kendi kendine god mode
    //   veremez (eskiden form admin e-postası yazana elit + 1000 jeton
    //   + god mode veriyordu — VITE_ değişkeni zaten herkese açık).
    const isKurucuAdmin = false;
    const userTier: Tier = tier;
    const userJeton = isKurucuAdmin ? Math.max(1000, getJeton()) : getJeton();
    const newUser: User = {
      id: uid(),
      name: isKurucuAdmin ? "Ömer Kaya (Kurucu Admin)" : "Demo Kullanıcı",
      email,
      phone,
      verified: true,
    };
    setUser(newUser);
    secureSet("nur_user_v1", newUser);
    if (isKurucuAdmin) {
      setAdminGodMode(true);
      setTier("elit");
      setCurrentTier("elit");
      setJetonCount(userJeton);
      persistJetonSecure(userJeton);
      syncUserInDb(email, newUser.name, "elit", userJeton);
      notify("🛡️ Kurucu Admin girişi başarılı! Tüm kilitler açıldı.");
    } else {
      syncUserInDb(email, newUser.name, userTier, userJeton);
      notify("Giriş başarılı! Hoş geldiniz.");
    }
    setModal(null);
  }, [notify, phone, setAdminGodMode, setJetonCount, setModal, setTier, setUser, tier]);

  const handleRegisterSubmit = useCallback(() => {
    const rl = checkRateLimit("auth");
    if (!rl.allowed) { notify(`${rl.message} (${Math.ceil(rl.retryAfterMs / 1000)} sn kaldı)`); return; }
    const email = phone.includes("@") ? phone.trim().toLowerCase() : "user@nurstudio.app";
    // ★ ÇİFT KATMAN (30.09): kayıt formu da admin e-postasını TANIMAZ (bkz. yukarı).
    const isKurucuAdmin = false;
    const newUser: User = {
      id: uid(),
      name: isKurucuAdmin ? "Ömer Kaya (Kurucu Admin)" : "Yeni Kullanıcı",
      email,
      phone,
      verified: true,
    };
    setUser(newUser);
    secureSet("nur_user_v1", newUser);
    if (isKurucuAdmin) {
      setAdminGodMode(true);
      setTier("elit");
      setCurrentTier("elit");
      setJetonCount(1000);
      persistJetonSecure(1000);
      syncUserInDb(email, newUser.name, "elit", 1000);
      notify("🛡️ Kurucu Admin Hesabı Oluşturuldu! 1000 hak + Nûr Elit tanımlandı.");
    } else {
      let nextJeton = getJeton();
      if (!localStorage.getItem("nur_register_bonus_granted")) {
        nextJeton += JETON.KAYIT_BONUSU_FREE;
        persistJetonSecure(nextJeton);
        localStorage.setItem("nur_register_bonus_granted", "1");
        setJetonCount(nextJeton);
        notify(`🎉 Kayıt başarılı! Hoş geldiniz — +${JETON.KAYIT_BONUSU_FREE} hak tanımlandı.`);
      } else {
        notify("Kayıt başarılı! Hoş geldiniz.");
      }
      syncUserInDb(email, newUser.name, "free", nextJeton);
      // ★ 7 gün ücretsiz PRO denemesi başlat
      if (typeof window !== "undefined" && !localStorage.getItem("nur_trial_start")) {
        localStorage.setItem("nur_trial_start", String(Date.now()));
      }
    }
    setModal(null);
  }, [notify, phone, setAdminGodMode, setJetonCount, setModal, setTier, setUser]);

  const handleForgotPassword = useCallback(() => {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setSentCode(code);
    setLoginTab("verify");
    notify(`Doğrulama kodu: ${code}`);
  }, [notify, setLoginTab, setSentCode]);

  const handleVerifyCode = useCallback(() => {
    if (verifyCode === sentCode) {
      notify("Kod doğrulandı! Şifrenizi sıfırlayabilirsiniz.");
      setLoginTab("forgot");
    } else {
      notify("Kod hatalı!");
    }
  }, [notify, sentCode, setLoginTab, verifyCode]);

  const handleLogout = useCallback(() => {
    fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    setUser(null);
    setAdminGodMode(false);
    secureRemove("nur_user_v1");
    notify("Çıkış yapıldı.");
  }, [notify, setAdminGodMode, setUser]);

  return { handleLoginSubmit, handleRegisterSubmit, handleForgotPassword, handleVerifyCode, handleLogout };
}