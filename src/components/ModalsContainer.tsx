import React, { useEffect, useRef, useState } from "react";
import {
  X, Hourglass, Shield, Search, Lock, Plus, Mail, AlertTriangle, Send, Check, MapPin,
} from "lucide-react";
import { LegalModal } from "./LegalModal";
import { Modal, Segmented } from "./UIElements";
import { LockBadge } from "./LockBadge";
import { AdminDashboardModal } from "./AdminDashboardModal";
import { PremiumModal } from "./PremiumModal";
import { ZipExplorer } from "./ZipExplorer";
import ErrorBoundary from "./ErrorBoundary";
import { AtmosferSeciciModal } from "./AtmosferSeciciModal";
import QuranLearnModal from "./QuranLearnModal";
import { AyetKartlariModal } from "./AyetKartlariModal";
import { SiteHakkindaModal } from "./SiteHakkindaModal";
import { RamazanModal } from "./RamazanModal";
import { AyetPaketleriModal } from "./AyetPaketleriModal";
import { OzelGunTakvimiModal } from "./OzelGunTakvimiModal";
import { KesfetModal } from "./KesfetModal";
import { HafizlikTestiModal } from "./HafizlikTestiModal";
import { AyetNotlariModal } from "./AyetNotlariModal";
import { KelimeAtolyesiModal } from "./KelimeAtolyesiModal";
import { bilinenKelimeIsaretle } from "./kesfetTemel"; // ★ 03.10: atölye aktarımı kelime kartını "bilinen" işaretler
import { ArkaPlanUreticiModal } from "./ArkaPlanUreticiModal";
import { DavetModal } from "./DavetModal";
import { HaftaninVideosuModal } from "./HaftaninVideosuModal";
import { KendiSesModal } from "./KendiSesModal";
import type { CatId, Clip } from "../clips";
import { EMOTIONS, TYPE_TABS, TYPE_BADGE, type LibraryItem, type LibraryType, type Emotion } from "../dualar";
import { KISSAS } from "../data";
import { secureGet, secureSet } from "../secureStore";
import { T, type Lang } from "../i18n";
import { JETON } from "../tier";
import { getFeatureLock, v2TestAcikMi } from "../services/adminSyncService";
import { startCheckout } from "../payments/pricing";
import type { ModalName, LoginTab, Tier } from "../types";
import type { ModalsContainerProps } from "./modalsContainerTypes";
import { GoogleIcon, randomPkceVerifier, pkceChallenge } from "./modalHelpers";
import { adminCatVisible } from "../adminCategoryAccess";
import { LoginModalBolum, FullUnlockConfirmBolum, AdminAuthBolum, LibraryBolum, StoriesBolum, ThemesBolum, PrayerBolum, ContactBolum } from "./modalsContainerBolumler";
// ★ SRP adım 8 (30.09): 8 self-contained modal modalsContainerBolumler.tsx'e taşındı

const PRAYERS: Array<[string, string]> = [
  ["İmsak", "Fajr"], ["Güneş", "Sunrise"], ["Öğle", "Dhuhr"],
  ["İkindi", "Asr"], ["Akşam", "Maghrib"], ["Yatsı", "Isha"]
];

/** Resmi Google "G" logosu */





export const ModalsContainer: React.FC<ModalsContainerProps> = ({
  modal,
  setModal,
  loginTab,
  setLoginTab,
  phone,
  setPhone,
  verifyCode,
  setVerifyCode,
  sentCode,
  handleLoginSubmit,
  handleRegisterSubmit,
  handleForgotPassword,
  handleVerifyCode,
  handleGuestContinue,
  guestTrialLeft,
  fullUnlockConfirmOpen,
  setFullUnlockConfirmOpen,
  jetonCount,
  tryUnlockFullMode,
  setMode,
  premiumOpen,
  setPremiumOpen,
  premiumTab,
  serverAdminVerified,
  tier,
  setTier,
  setCurrentTier,
  setJetonCount,
  notify,
  adminAuthOpen,
  setAdminAuthOpen,
  adminEmailInput,
  setAdminEmailInput,
  adminCodeInput,
  setAdminCodeInput,
  adminError,
  setAdminError,
  setAdminGodMode,
  adminSonEmail,
  pickingFor,
  setPickingFor,
  onClipKindChange,
  clipKind,
  setClipKind,
  atmosQuery,
  setAtmosQuery,
  isMasterSürüm,
  randomizeBackgrounds,
  setCinematic,
  seciliAyetSayisi = 0,
  bekleyenDavetKodu,
  syncWallet,
  setRoadmapOpen,
  atmosCategory,
  setAtmosCategory,
  combinedAllClips,
  onMedyaArkaPlan,
  onMedyaSenkron,
  CATEGORY_ICONS,
  lockTip,
  setLockTip,
  accessTier,
  tierAtLeast,
  filteredClips,
  hoveredClip,
  setHoveredClip,
  openPremium,
  packRights,
  subscriptionEndsAt,
  pickClip,
  libSearch,
  setLibSearch,
  libType,
  setLibType,
  libEmotion,
  setLibEmotion,
  libraryFiltered,
  useFromLibrary,
  addAyah,
  ALL_THEMES,
  themeTier,
  themeEmoji,
  themeId,
  setThemeId,
  prayerSearch,
  setPrayerSearch,
  prayerCity,
  setPrayerCity,
  filteredCities,
  prayerTimings,
  nextPrayer,
  formatRemaining,
  contactType,
  setContactType,
  contactMessage,
  setContactMessage,
  tosOpen,
  setTosOpen,
  tosAccepted,
  setTosAccepted,
  user,
  legalTab,
  setLegalTab,
  t,
  lang,
  kendiSesAktif,
  kendiSesKayitlari,
  kendiSesYukleniyor,
  kendiSesNefes,
  kendiSesYukle,
  kendiSesYukleAyetAyri,
  kendiSesSec,
  kendiSesSil,
  kendiSesZamanlamaKaydet,
  kendiSesKaldir,
  kendiSesYenidenTara,
  setPickingForAtmos,
  kendiSesSeciliAyetler,
  kendiSesAyahBackgrounds,
}) => {
  const [configVersion, setConfigVersion] = useState(0);
  // ★ Destek Merkezi yıldız puanı (opsiyonel 1-5, veritabanına kaydedilir)
  const [contactPuan, setContactPuan] = useState<number | null>(null);
  // ★ heroSpotlight + sonsuz kaydırma state'i AtmosferSeciciModal ile taşındı (30.09 parçalama)
  useEffect(() => {
    const onUpdate = () => setConfigVersion((v) => v + 1);
    window.addEventListener("nur_config_updated", onUpdate);
    // ★ CROSS-TAB: admin başka sekmede değiştirince storage event ile anında güncelle
    const onStorage = (e: StorageEvent) => { if (e.key && e.key.includes("nur_system_sync_config")) onUpdate(); };
    window.addEventListener("storage", onStorage);
    return () => { window.removeEventListener("nur_config_updated", onUpdate); window.removeEventListener("storage", onStorage); };
  }, []);
  void configVersion;

  // ★ KVKK: Pazarlama e-postası için AYRI, geri alınabilir açık rıza durumu.
  //   Kullanıcı giriş yaptıktan sonra bu tercih /api/marketing/consent'e yazılır.
  const [marketingConsent, setMarketingConsent] = useState(false);

  // ★ KELİME ↔ ATÖLYE BAĞI (03.10): karttan "atölyede çalış" → atölye kutuya dolu açılır;
  //   aktarım başarılı bitince kaynak kart yeşil tik (bilinen) alır.
  const [atolyeBaslangic, setAtolyeBaslangic] = useState<{ kelime: string; ar: string } | null>(null);
  useEffect(() => {
    if (!user?.email) return;
    fetch("/api/marketing/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ consented: marketingConsent }),
    }).catch(() => undefined);
    // Sadece kullanıcı checkbox'ı değiştirdiğinde veya yeni giriş yaptığında tetiklenir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketingConsent, user?.email]);
  // Sahte e-posta/şifre akışı kaldırıldı; prop'lar eski modal sözleşmesi bozulmasın diye korunuyor.
  void phone; void setPhone; void verifyCode; void setVerifyCode; void sentCode;
  void handleLoginSubmit; void handleRegisterSubmit; void handleForgotPassword; void handleVerifyCode;
  void tosAccepted;
  void adminEmailInput; void setAdminEmailInput; void adminCodeInput; void setAdminCodeInput;
  void setAdminError; void setAdminGodMode;

  // ★ TOPLULUK OYU KİLİDİ (V2) — lansman planı: yenilikler kodda kurulu ama admin
  //   onayına dek KİLİTLİ. Admin panelindeki Kilit Yönetimi'nden ('free' yapınca)
  //   o modal HERKESE açılır. Kilitliyken modal açılmaz; yol haritasına yönlendirilir →
  //   kullanıcı oylar, en çok oyu alanı admin kendisi açar. Admin her zaman açar.
  //
  // ★★ İNCELEME MODU (26 Eylül — SAHİBİN EMRİ): VITE_INCELEME_MODU=1 iken
  //   kilitler HERKESE AÇIK (girişsiz dahil) — sahibin yerel incelemesi için.
  //   LANSmanda bu .env değişkeni KALDIRILACAK → kilitler otomatik geri gelir.
  //   Yayın build'inde env yoksa kural eskisi gibi çalışır; canlıyı etkilemez.
  const INCELEME_MODU = (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_INCELEME_MODU === "1";
  type V2ModalId = "ayetKartlari" | "kesfet" | "hafizlikTesti" | "ayetNotlari" | "ayetPaketleri" | "ozelGunTakvimi";
  const V2_KILITLI: Record<V2ModalId, string> = {
    ayetKartlari: "Ayet & Dua Kütüphanesi",
    kesfet: "Keşfet Merkezi",
    hafizlikTesti: "Hafızlık Testi",
    ayetNotlari: "Ayet Notlarım",
    ayetPaketleri: "Hazır Ayet Paketleri",
    ozelGunTakvimi: "Özel Gün Takvimi",
  };
  // ★ V2 TEST KİLİDİ (01.10): kod sabiti değil — sunucu ayarı (nur_feature_locks
  //   tablosunda "v2_test_acik" satırı; admin panel → Kilit Yönetimi'nden aç/kapa,
  //   deploy'suz). Açıkken oylamadaki 6 V2 modalı herkese açık; kapalıyken kilitler
  //   devreder: getFeatureLock "free" (admin kilidi veya /api/config'in gömdüğü
  //   OYLAMA LİDERİ otomatik-free) olan modül açık, diğerleri yol haritasına düşer.
  const v2Kapali = (m: V2ModalId): boolean =>
    !v2TestAcikMi() && !INCELEME_MODU && !isMasterSürüm && getFeatureLock(m, "v2") !== "free";
  const v2Gate = (m: V2ModalId): boolean => {
    if (!v2Kapali(m)) return true;
    setModal(null);
    notify(`🔒 ${V2_KILITLI[m]} oylamada — Yol Haritası'ndan oy ver, en çok oyu alan açılır!`);
    setRoadmapOpen?.(true);
    return false;
  };
  // Kilitli modallar hiç mount edilmez (içerik sızmasın)
  const v2Acik = (m: V2ModalId) => (v2Kapali(m) ? false : modal === m);

  // ★ MERKEZİ ESC KAPANIŞI (01.10): taban Modal backdrop-tıklama + X ile kapanıyordu;
  //   Esc hiçbir modalda dinlenmiyordu. Standart UX üçlüsünü tamamlar (X + dış-tıklama
  //   + Esc) — tek yerde, tüm modallara birden. atmos'ta pickingFor da temizlenir
  //   (onKapat birebir). Açık modal yokken dinleyici takılı kalmasın.
  React.useEffect(() => {
    if (!modal) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setModal(null);
      setPickingFor(null);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [modal, setModal, setPickingFor]);

  // ★ DEV-ONLY DUMAN TESTİ KANCASI: scripts/esm-tarama.mjs --duman bu kancayla
  //   tüm modalları X/dış-tıklama/Esc üçlüsünde gezer (src/dev/modalDumanTesti.ts).
  //   Dinamik import → canlı bundle'ına HİÇ girmez (dev şartı + tree-shake).
  React.useEffect(() => {
    if (!(import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV) return;
    (window as unknown as Record<string, unknown>).setNurModal = setModal;
    void import("../dev/modalDumanTesti").then((mod) => {
      (window as unknown as Record<string, unknown>).nurModalDumanTesti = mod.dumanTestiCalistir;
    }).catch(() => { /* dev test kancası yüklenemedi — sessiz geç */ });
    return () => {
      delete (window as unknown as Record<string, unknown>).setNurModal;
      delete (window as unknown as Record<string, unknown>).nurModalDumanTesti;
    };
  }, [setModal]);
  // ★ MERKEZİ GEÇİT — menüden/yol haritasından/kitaplıktan nereden çağrılırsa çağrılsın,
  //   kilitli modal bir an bile ekrana gelmez: kapanır + uyarı + yol haritası açılır.
  React.useEffect(() => {
    if (!modal) return;
    for (const m of Object.keys(V2_KILITLI) as V2ModalId[]) {
      if (modal === m && v2Kapali(m)) {
        v2Gate(m);
        return;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal]);

  // ★ GOOGLE İLE GİRİŞ/KAYIT — Gmail hesabına bağlanarak kayıt olur.
  //   Google Cloud Console'dan alınan Client ID .env'e eklenir:
  //   VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
  const handleGoogleAuth = React.useCallback(async (loginHint?: string) => {
    const clientId = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GOOGLE_CLIENT_ID?.trim();

    if (!clientId) {
      notify("⚙️ Google girişi için Client ID tanımlanmalı (.env → VITE_GOOGLE_CLIENT_ID)");
      return;
    }

    if (!crypto?.subtle) {
      notify("⚠️ Tarayıcınız güvenli Google girişi için gerekli PKCE desteğini sağlamıyor");
      return;
    }

    // OAuth 2.0 Authorization Code + PKCE — token frontend'de doğrulanmaz, backend'e gider
    const redirectUri = `${window.location.origin}/`;
    const scope = encodeURIComponent("openid email profile");
    const state = Math.random().toString(36).slice(2, 18);
    const verifier = randomPkceVerifier();
    const challenge = await pkceChallenge(verifier);
    try {
      sessionStorage.setItem("nur_google_state", state);
      sessionStorage.setItem("nur_google_pkce_verifier", verifier);
    } catch { /* ignore */ }

    const authUrl =
      "https://accounts.google.com/o/oauth2/v2/auth" +
      `?client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${scope}` +
      `&state=${state}` +
      `&code_challenge=${encodeURIComponent(challenge)}` +
      `&code_challenge_method=S256` +
      `&prompt=select_account` +
      // ★ "ADMIN OLARAK GERİ DÖN" (30.09): Google hesap seçiciye son admin
      //   e-postası ÖNERİ olarak verilir — zorunlu değil, kullanıcı başka
      //   hesap seçebilirdi; güvenlik yine sunucu zincirinde doğrulanır.
      (loginHint ? `&login_hint=${encodeURIComponent(loginHint)}` : "");

    window.location.href = authUrl;
  }, [notify]);

  // ★ ADMIN OLARAK GERİ DÖN (30.09): çıkıştan sonra tek tıkla admin hesabına dönüş.
  //   adminSonEmail yalnız NUR_ADMIN_EMAILS listesindeki e-postayı döner — normal
   //   kullanıcılar bu butonu ASLA görmez (useAuth'ta listeye göre filtrelenir).

  return (
    <>
      {/* LOGIN & REGISTER MODAL — SRP adım 8: LoginModalBolum */}
      {modal === "login" && (
        <LoginModalBolum
          setModal={setModal}
          setLoginTab={setLoginTab}
          handleGoogleAuth={(hint) => void handleGoogleAuth(hint)}
          adminSonEmail={adminSonEmail ?? null}
          handleGuestContinue={handleGuestContinue}
          guestTrialLeft={guestTrialLeft}
          marketingConsent={marketingConsent}
          setMarketingConsent={setMarketingConsent}
          loginTab={loginTab}
          sentCode={sentCode}
          verifyCode={verifyCode}
          setVerifyCode={setVerifyCode}
          handleVerifyCode={handleVerifyCode}
          notify={notify}
          t={t}
        />
      )}

      {/* FULL UNLOCK CONFIRM MODAL — SRP adım 8 */}
      {fullUnlockConfirmOpen && (
        <FullUnlockConfirmBolum setFullUnlockConfirmOpen={setFullUnlockConfirmOpen} jetonCount={jetonCount} tryUnlockFullMode={tryUnlockFullMode} setMode={setMode} MIKRO_UCRET={JETON.MIKRO_KILIT_ACMA_UCRETI} />
      )}

      {/* PREMIUM MODAL */}
      {premiumOpen && (
        <PremiumModal
          lang={lang}
          initialTab={premiumTab}
          currentTier={tier}
          user={user ?? null}
          packRights={packRights}
          subscriptionEndsAt={subscriptionEndsAt}
          onClose={() => setPremiumOpen(false)}
          onCheckout={async (productCode) => {
            try {
              notify("⏳ Ödeme sayfası hazırlanıyor...");
              const result = await startCheckout({ productCode });
              if (!result.ok) {
                notify(`❌ Ödeme hatası: ${result.error || "Bilinmeyen hata — lütfen tekrar deneyin"}`);
                return;
              }
              // Demo modunda — ödemeyi atla, ürünü doğrudan tanımla
              if (result.demo) {
                const product = result as any;
                if (product.product?.grantTier === "pro") {
                  setTier("pro"); setCurrentTier("pro");
                  const bonus = 250;
                  const cur = Number(secureGet<number>("nur_jeton", 0));
                  const next = cur + bonus;
                  secureSet("nur_jeton", next);
                  setJetonCount(next);
                  notify(`✅ [DEMO] NÛR PRO üyeliğin aktif edildi +${bonus} ⚡`);
                } else if (product.product?.grantTier === "elit") {
                  setTier("elit"); setCurrentTier("elit");
                  const bonus = 500;
                  const cur = Number(secureGet<number>("nur_jeton", 0));
                  const next = cur + bonus;
                  secureSet("nur_jeton", next);
                  setJetonCount(next);
                  notify(`👑 [DEMO] NÛR ELİT üyeliğin aktif edildi +${bonus} ⚡`);
                } else if (product.product?.videoCount) {
                  const amount = product.product.videoCount;
                  const cur = Number(secureGet<number>("nur_jeton", 0));
                  const next = cur + amount;
                  secureSet("nur_jeton", next);
                  setJetonCount(next);
                  notify(`🎬 [DEMO] ${amount} video hakkı eklendi`);
                }
                setPremiumOpen(false);
                return;
              }
              // Gerçek ödeme — iyzico checkout form (aynı sekmede)
              if (result.paymentPageUrl) {
                window.location.href = result.paymentPageUrl;
              } else if (result.checkoutFormContent) {
                const blob = new Blob([result.checkoutFormContent], { type: 'text/html' });
                window.location.href = URL.createObjectURL(blob);
              } else {
                notify("Ödeme sayfası açılamadı");
              }
            } catch {
              notify("Ödeme servisine ulaşılamadı");
            }
          }}
          onPurchase={(newTier) => {
            setTier(newTier);
            setCurrentTier(newTier);
            // Demo local bonus kaldırıldı — gerçek haklar sunucudan (callback/verify) gelir
            notify(`Hoş geldin! NÛR ${newTier.toUpperCase()} aktif`);
          }}
          onTokenPurchase={(amount) => {
            const next = Number(secureGet<number>("nur_jeton", 0));
            setJetonCount(next);
            notify(`${amount} ⚡ Üretim hakkı hesabına eklendi`);
          }}
        />
      )}

      {/* ADMIN DASHBOARD MODAL
          ★ 28.09 PANEL İZOLASYONU: panel içi bir hata artık TÜM siteyi düşüremez —
          kök ErrorBoundary (App.tsx) yerine bu sınır patlar, yalnız panel kapanır. */}
      {modal === "adminDashboard" && serverAdminVerified && (
        <ErrorBoundary label="Admin Paneli">
          <AdminDashboardModal
            onClose={() => setModal(null)}
            currentUserEmail={phone.includes("@") ? phone : ""}
            onUpdateUser={(email, newTier, newJeton) => {
              // Eğer güncellenen hesap şu anki oturum sahibi ise, canlı state'leri güncelle
              if (phone.toLowerCase() === email.toLowerCase()) {
                setTier(newTier);
                setCurrentTier(newTier);
                setJetonCount(newJeton);
                secureSet("nur_jeton", newJeton);
              }
            }}
            notify={notify}
          />
        </ErrorBoundary>
      )}

      {/* KENDİ SESİNİ YÜKLE MODAL (30.09) — ELİT özelliği */}
      {modal === "kendiSes" && (
        <KendiSesModal
          open
          onClose={() => setModal(null)}
          sure={kendiSesSeciliAyetler[0]?.s ?? 1}
          seciliAyetler={kendiSesSeciliAyetler}
          aktifSes={kendiSesAktif}
          kayitlar={kendiSesKayitlari}
          yukleniyor={kendiSesYukleniyor}
          isElit={isMasterSürüm || tierAtLeast(accessTier, "elit")}
          nefes={kendiSesNefes}
          yukle={kendiSesYukle}
          yukleAyetAyri={kendiSesYukleAyetAyri}
          sec={kendiSesSec}
          sil={kendiSesSil}
          zamanlamaKaydet={kendiSesZamanlamaKaydet}
          kaldirAktif={kendiSesKaldir}
          yenidenTara={kendiSesYenidenTara}
          setPickingFor={setPickingForAtmos}
          setModal={setModal}
          ayahBackgrounds={kendiSesAyahBackgrounds}
          openPremium={openPremium}
          notify={notify}
        />
      )}

      {/* ADMIN AUTH MODAL — SRP adım 8 */}
      {adminAuthOpen && (
        <AdminAuthBolum setAdminAuthOpen={setAdminAuthOpen} setModal={setModal} setLoginTab={setLoginTab} adminError={adminError} notify={notify} />
      )}

      {/* ★ ATMOSFER SEÇİCİ — 30.09 SRP parçalama adım 1: AtmosferSeciciModal.tsx'e taşındı (JSX birebir korunur) */}
      <AtmosferSeciciModal
        open={modal === "atmos"}
        onKapat={() => { setModal(null); setPickingFor(null); }}
        pickingFor={pickingFor}
        setPickingFor={setPickingFor}
        setModal={setModal}
        clipKind={clipKind}
        setClipKind={setClipKind}
        onClipKindChange={onClipKindChange}
        atmosQuery={atmosQuery}
        setAtmosQuery={setAtmosQuery}
        atmosCategory={atmosCategory}
        setAtmosCategory={setAtmosCategory}
        combinedAllClips={combinedAllClips}
        filteredClips={filteredClips}
        accessTier={accessTier}
        tierAtLeast={tierAtLeast}
        isMasterSürüm={isMasterSürüm}
        randomizeBackgrounds={randomizeBackgrounds}
        pickClip={pickClip}
        openPremium={openPremium}
        hoveredClip={hoveredClip}
        setHoveredClip={setHoveredClip}
        CATEGORY_ICONS={CATEGORY_ICONS}
        lockTip={lockTip}
        setLockTip={setLockTip}
        t={t}
      />

      {/* QURAN LEARN / LISTEN — TEK MODAL: "Kur'an" pill'i açar, learn/listen sekmeleri içeride */}
      <QuranLearnModal open={modal === "quranLearn" || modal === "quranListen"} onClose={() => setModal(null)} initialMode={modal === "quranListen" ? "listen" : "learn"} />
      {/* ★ AYET KÜTÜPHANESİ — ayet seç, kartın içine yazılsın, fotoğraf olarak indir */}
      <AyetKartlariModal open={v2Acik("ayetKartlari")} onClose={() => setModal(null)} notify={notify} lang={lang} accessTier={accessTier} tierAtLeast={tierAtLeast} openPremium={openPremium} />

      {/* ★ BU SİTEDE NE VAR — kaynaklar, telif bildirimi, iletişim (yol haritası madde 4) */}
      <SiteHakkindaModal open={modal === "siteHakkinda"} onClose={() => setModal(null)} onIletisim={() => setModal("contact")} lang={lang} />

      {/* ★ RAMAZAN & KANDİL MERKEZİ — hicri takvimle otomatik Ramazan modu (madde 6) */}
      <RamazanModal open={modal === "ramazan"} onClose={() => setModal(null)} prayerTimings={prayerTimings} notify={notify} lang={lang} />

      {/* ★ HAZIR AYET PAKETLERİ — tek tuşla stüdyoya paket ekle (madde 8) */}
      <AyetPaketleriModal open={v2Acik("ayetPaketleri")} onClose={() => setModal(null)} addAyah={addAyah} notify={notify} lang={lang} />

      {/* ★ ÖZEL GÜN TAKVİMİ — Cuma/kandiller + tema önerisi + hatırlatıcı (madde 10) */}
      <OzelGunTakvimiModal open={v2Acik("ozelGunTakvimi")} onClose={() => setModal(null)} notify={notify} lang={lang} />

      {/* ★ HAFTANIN VİDEOSU — admin onaylı topluluk vitrini (madde 17) */}
      <HaftaninVideosuModal open={modal === "haftaninVideosu"} onClose={() => setModal(null)} notify={notify} />

      {/* ★ KEŞFET — hadis bankası, kıssa, soru-cevap, kelime kartları, sure bilgileri, namaz rehberi, bebek duası, dua rehberi (maddeler 18-22-28-35-61) */}
      <KesfetModal open={v2Acik("kesfet")} onClose={() => setModal(null)} notify={notify} lang={lang} atolyeAc={(kelime, ar) => { setAtolyeBaslangic({ kelime, ar }); setModal("kelimeAtolyesi"); }} />

      {/* ★ HAFIZLIK TESTİ — devamını getir, 4 seçenekli ayet tamamlama (madde 44) */}
      <HafizlikTestiModal open={v2Acik("hafizlikTesti")} onClose={() => setModal(null)} notify={notify} lang={lang} />

      {/* ★ AYET NOTLARI — şifreli kişisel notlar, sunucuya gitmez (madde 57) */}
      <AyetNotlariModal open={v2Acik("ayetNotlari")} onClose={() => setModal(null)} notify={notify} lang={lang} />

      {/* ★ KELİME ATÖLYESİ — kelime yaz → ayet + atmosfer önerisi → tek tık stüdyoya (İş 3) */}
      <KelimeAtolyesiModal
        open={modal === "kelimeAtolyesi"}
        onClose={() => setModal(null)}
        notify={notify}
        lang={lang}
        addAyah={addAyah}
        randomizeBackgrounds={randomizeBackgrounds}
        accessTier={accessTier}
        isMasterSurum={isMasterSürüm}
        kelimeBaslangic={atolyeBaslangic?.kelime}
        onOgrenildi={() => { if (atolyeBaslangic) bilinenKelimeIsaretle(atolyeBaslangic.ar); }}
      />

      {/* ★ ARKA PLAN ÜRETİCİ LİTE — mood yaz → sahne planı + sinematik filtre (İş 4) */}
      <ArkaPlanUreticiModal
        open={modal === "arkaPlanUretici"}
        onClose={() => setModal(null)}
        notify={notify}
        lang={lang}
        randomizeBackgrounds={randomizeBackgrounds}
        setCinematic={setCinematic}
        seciliAyetSayisi={seciliAyetSayisi}
        accessTier={accessTier}
        isMasterSurum={isMasterSürüm}
      />

      {/* ★ DAVET / REFERANS — kod + link + karşılıklı +3 kısa video (İş 5) */}
      <DavetModal
        open={modal === "davet"}
        onClose={() => setModal(null)}
        notify={notify}
        lang={lang}
        user={user}
        bekleyenDavetKodu={bekleyenDavetKodu}
        onOdulAlindi={syncWallet}
      />

      {/* LIBRARY MODAL — SRP adım 8 */}
      {modal === "library" && (
        <LibraryBolum setModal={setModal} t={t} libSearch={libSearch} setLibSearch={setLibSearch} libType={libType} setLibType={setLibType} libEmotion={libEmotion} setLibEmotion={setLibEmotion} libraryFiltered={libraryFiltered} useFromLibrary={useFromLibrary} />
      )}

      {/* MEDYA YÜKLEME MODALI (28.09): ZIP gezgini kaldırıldı — video/resim/ses kabul, diğerleri red.
          ★ onArkaPlanYap: seçilen dosya IndexedDB'den Clip'e çevrilip stüdyo atmosferine atanır */}
      {modal === "zip" && isMasterSürüm && (
        <Modal title="Medya Yükleme" sub="Admin · video, resim ve ses dosyaları — IndexedDB'de kalıcı saklanır" onClose={() => setModal(null)} wide>
          <div className="h-[65vh] min-h-[420px]"><ZipExplorer onClose={() => setModal(null)} onArkaPlanYap={onMedyaArkaPlan} onMedyaDegisti={onMedyaSenkron} /></div>
        </Modal>
      )}

      {/* STORIES MODAL — SRP adım 8 */}
      {modal === "stories" && isMasterSürüm && (
        <StoriesBolum setModal={setModal} addAyah={addAyah} t={t} />
      )}

      {/* THEMES MODAL — SRP adım 8 */}
      {modal === "themes" && (
        <ThemesBolum setModal={setModal} t={t} ALL_THEMES={ALL_THEMES} themeTier={themeTier} themeEmoji={themeEmoji} themeId={themeId} setThemeId={setThemeId} accessTier={accessTier} tierAtLeast={tierAtLeast} openPremium={openPremium} />
      )}

      {/* PRAYER MODAL — SRP adım 8 */}
      {modal === "prayer" && (
        <PrayerBolum setModal={setModal} t={t} lang={lang} prayerCity={prayerCity} prayerSearch={prayerSearch} setPrayerSearch={setPrayerSearch} filteredCities={filteredCities} setPrayerCity={setPrayerCity} prayerTimings={prayerTimings} nextPrayer={nextPrayer} formatRemaining={formatRemaining} />
      )}

      {/* CONTACT & SUPPORT MODAL — SRP adım 8 (yıldız puanı bileşende) */}
      {modal === "contact" && (
        <ContactBolum setModal={setModal} contactType={contactType} setContactType={setContactType} contactMessage={contactMessage} setContactMessage={setContactMessage} notify={notify} t={t} />
      )}

      {/* LEGAL / TOS MODAL — LegalModal.tsx bileşenine taşındı */}
      <LegalModal
        lang={lang}
        tosOpen={tosOpen}
        setTosOpen={setTosOpen}
        legalTab={legalTab}
        setLegalTab={setLegalTab}
      />
      {/* Yasal modal LegalModal.tsx bileşenine taşındı */}
    </>
  );
};
