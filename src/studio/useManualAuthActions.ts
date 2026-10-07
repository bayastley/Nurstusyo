import { useCallback } from "react";
import { secureGet, secureSet, secureRemove } from "../secureStore";
import { checkRateLimit } from "../rateLimiter";
import { JETON, getJeton, grantPack, setCurrentTier, setJeton as persistJetonSecure, startTrial, type Tier } from "../tier";
import { syncUserInDb } from "../components/adminHelpers";
import { adminSonEmailOku } from "./useAuth";
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
  setIsMasterSürüm: (value: boolean) => void;
  setTier: (value: Tier) => void;
  setJetonCount: (value: number) => void;
  setSentCode: (value: string) => void;
  setLoginTab: (value: LoginTab) => void;
  setModal: (value: ModalName) => void;
  setAdminSonEmail: (value: string | null) => void;
  resetWallet?: () => void;
}

export function useManualAuthActions({
  phone,
  verifyCode,
  sentCode,
  tier,
  notify,
  setUser,
  setAdminGodMode,
  setIsMasterSürüm,
  setTier,
  setJetonCount,
  setSentCode,
  setLoginTab,
  setModal,
  setAdminSonEmail,
  resetWallet,
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
      setIsMasterSürüm(true);
      setTier("elit");
      setCurrentTier("elit");
      setJetonCount(userJeton);
      persistJetonSecure(userJeton);
      syncUserInDb(email, newUser.name, "elit", userJeton);
      notify("🛡️ Kurucu Admin girişi başarılı! Tüm kilitler açıldı.");
    } else {
      syncUserInDb(email, newUser.name, userTier, userJeton);
      // ★ DENEME OTOMASYONU (07.10): giriş formuyla girenlerde de 7 gün PRO denemesi
      //   garantilenir. startTrial() idempotenttir (var olan başlangıcı bozmaz).
      startTrial();
      notify("Giriş başarılı! Hoş geldiniz.");
    }
    setModal(null);
  }, [notify, phone, setAdminGodMode, setIsMasterSürüm, setJetonCount, setModal, setTier, setUser, tier]);

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
      setIsMasterSürüm(true);
      setTier("elit");
      setCurrentTier("elit");
      setJetonCount(1000);
      persistJetonSecure(1000);
      syncUserInDb(email, newUser.name, "elit", 1000);
      notify("🛡️ Kurucu Admin Hesabı Oluşturuldu! 1000 jeton + Nûr Elit tanımlandı.");
    } else {
      let nextJeton = getJeton();
      if (!localStorage.getItem("nur_register_bonus_granted")) {
        // ★ SAHTE BONUS FIX (07.10): eski kod persistJetonSecure() yazıyordu ama setJeton
        //   bilinçli no-op (bakiye kavramı kaldırıldı) — 2 sn sonra wallet sync gerçek paketi
        //   geri yazınca bonus buharlaşıyordu. Artık bonus GERÇEK paket hakkı olarak
        //   grantPack ile verilir; syncWallet MAX-birleştirmesi sayesinde ezilmez.
        grantPack("kisa", JETON.KAYIT_BONUSU_FREE);
        nextJeton = getJeton();
        persistJetonSecure(nextJeton);
        localStorage.setItem("nur_register_bonus_granted", "1");
        setJetonCount(nextJeton);
        notify(`🎉 Kayıt başarılı! Hoş geldiniz — +${JETON.KAYIT_BONUSU_FREE} üretim hakkı hediye edildi.`);
      } else {
        notify("Kayıt başarılı! Hoş geldiniz.");
      }
      syncUserInDb(email, newUser.name, "free", nextJeton);
      startTrial(); // ★ 7 gün ücretsiz PRO denemesi başlat
    }
    setModal(null);
  }, [notify, phone, setAdminGodMode, setIsMasterSürüm, setJetonCount, setModal, setTier, setUser]);

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

  // ★ DÜRÜST ÇIKIŞ (30.09): sunucuOturumuKapat=true → HttpOnly nur_session cookie'si
  //   de sunucuda sıfırlanır (api/auth/logout). Eksik: false → yalnız istemci temizliği,
  //   cookie ayakta kalır (hesap değiştirme karışıklığına yol açıyordu).
  const handleLogout = useCallback((secenek?: { sunucuOturumuKapat?: boolean }) => {
    if (secenek?.sunucuOturumuKapat) fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    setUser(null);
    setAdminGodMode(false);
    setIsMasterSürüm(false);
    setTier("free");
    resetWallet?.();
    secureRemove("nur_user_v1");
    localStorage.removeItem("nur_admin_session");
    // ★ ADMIN OLARAK GERİ DÖN (30.09): hatırlama bilgisini TAZELE — doğrulanmış
    //   admin e-postası localStorage'da kalır (yetenek değil, konfor); liste dışına
    //   düşen admin çıkışta akışı kaybeder. useAuth'taki state ile eşzamanlı.
    setAdminSonEmail(adminSonEmailOku());
    notify(secenek?.sunucuOturumuKapat ? "Çıkış yapıldı." : "Hesaptan çıkıldı — misafir modundasın (oturum penceresi sonuna kadar)");
  }, [notify, resetWallet, setAdminGodMode, setIsMasterSürüm, setAdminSonEmail, setTier, setUser]);

  return { handleLoginSubmit, handleRegisterSubmit, handleForgotPassword, handleVerifyCode, handleLogout };
}
