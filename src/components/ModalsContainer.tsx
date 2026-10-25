import React, { useEffect, useRef, useState } from "react";
import {
  X, Hourglass, Shield, Search, Lock, Plus, Mail, AlertTriangle, Send, Check, MapPin,
} from "lucide-react";
import { LegalModal } from "./LegalModal";
import { Modal, Segmented } from "./UIElements";
import { LockBadge } from "./LockBadge";
import ErrorBoundary from "./ErrorBoundary";
// ★ 07.10 ESKİ CİHAZ PERFORMANSI — LAZY MODALLAR:
//   Ağır modallar artık React.lazy ile KENDİ chunk'larında. Açılışta indirilmez/
//   parse edilmezler; kullanıcı modalı ilk açtığında chunk gelir. "acilanlar"
//   kapısı bir kez açılınca modal mount kalır — bileşen state'i korunur,
//   bugünkü davranışın aynısı (bağlam kopmaz).
const AdminDashboardModal = React.lazy(() => import("./AdminDashboardModal").then((m) => ({ default: m.AdminDashboardModal })));
const PremiumModal = React.lazy(() => import("./PremiumModal").then((m) => ({ default: m.PremiumModal })));
const ZipExplorer = React.lazy(() => import("./ZipExplorer").then((m) => ({ default: m.ZipExplorer })));
const AtmosferSeciciModal = React.lazy(() => import("./AtmosferSeciciModal").then((m) => ({ default: m.AtmosferSeciciModal })));
const QuranLearnModal = React.lazy(() => import("./QuranLearnModal"));
const AyetKartlariModal = React.lazy(() => import("./AyetKartlariModal").then((m) => ({ default: m.AyetKartlariModal })));
const SiteHakkindaModal = React.lazy(() => import("./SiteHakkindaModal").then((m) => ({ default: m.SiteHakkindaModal })));
const RamazanModal = React.lazy(() => import("./RamazanModal").then((m) => ({ default: m.RamazanModal })));
const AyetPaketleriModal = React.lazy(() => import("./AyetPaketleriModal").then((m) => ({ default: m.AyetPaketleriModal })));
const OzelGunTakvimiModal = React.lazy(() => import("./OzelGunTakvimiModal").then((m) => ({ default: m.OzelGunTakvimiModal })));
const KesfetModal = React.lazy(() => import("./KesfetModal").then((m) => ({ default: m.KesfetModal })));
const HafizlikTestiModal = React.lazy(() => import("./HafizlikTestiModal").then((m) => ({ default: m.HafizlikTestiModal })));
const AyetNotlariModal = React.lazy(() => import("./AyetNotlariModal").then((m) => ({ default: m.AyetNotlariModal })));
const KelimeAtolyesiModal = React.lazy(() => import("./KelimeAtolyesiModal").then((m) => ({ default: m.KelimeAtolyesiModal })));
const ArkaPlanUreticiModal = React.lazy(() => import("./ArkaPlanUreticiModal").then((m) => ({ default: m.ArkaPlanUreticiModal })));
const DavetModal = React.lazy(() => import("./DavetModal").then((m) => ({ default: m.DavetModal })));
const HaftaninVideosuModal = React.lazy(() => import("./HaftaninVideosuModal").then((m) => ({ default: m.HaftaninVideosuModal })));
const KendiSesModal = React.lazy(() => import("./KendiSesModal").then((m) => ({ default: m.KendiSesModal })));
import { bilinenKelimeIsaretle } from "./kesfetTemel"; // ★ 03.10: atölye aktarımı kelime kartını "bilinen" işaretler
import type { CatId, Clip } from "../clips";
import { EMOTIONS, TYPE_TABS, TYPE_BADGE, type LibraryItem, type LibraryType, type Emotion } from "../dualar";
import { KISSAS } from "../data";
import { secureGet, secureSet } from "../secureStore";
import { T, type Lang } from "../i18n";
import { JETON, isAdminEmail } from "../tier"; // ★ 17.10: kendiSes/zip V3 kilidi admin tespiti
import { getFeatureLock, v2TestAcikMi, type FeatureLock } from "../services/adminSyncService";
import { startCheckout } from "../payments/pricing";
import type { ModalName, LoginTab, Tier } from "../types";
import type { ModalsContainerProps } from "./modalsContainerTypes";
import { GoogleIcon, handleGoogleAuth } from "./modalHelpers"; // ★ (09.10, 2. tur): Google OAuth köprüsü modalHelpers'a taşındı
import { adminCatVisible } from "../adminCategoryAccess";
import { V2_KILITLI, V2_MODAL_IDLERI, acilanModalEkle, acildiMiFn, v2KilitliMi, v2AcikMi, type V2ModalId } from "./modalsContainerV2";
import { demoOdemeUygula } from "./modalsContainerOdeme";
import { LoginModalBolum, FullUnlockConfirmBolum, AdminAuthBolum, LibraryBolum, StoriesBolum, ThemesBolum, PrayerBolum, ContactBolum } from "./modalsContainerBolumler";
import { SeslendirmeModal } from "./SeslendirmeModal"; // ★ 14.10: Seslendirme (mockup→proje; lokal TTS sunucusu ile)
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
  kendiSesSureEkle, // ★ 23.10
  kendiSesMaksSn,
  kendiSesMaksAyarla,
  setPickingForAtmos,
  kendiSesSeciliAyetler,
  kendiSesAyahBackgrounds,
  premiumHedef,
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

  // ★ LAZY KAPISI (07.10) + V2 KİLİTİ — yardımcılar modalsContainerV2.ts'te (09.10 parçalama)
  const [acilanlar, setAcilanlar] = useState<string[]>([]);
  useEffect(() => {
    if (!modal) return;
    setAcilanlar((onceki) => acilanModalEkle(onceki, modal));
  }, [modal]);
  const acildiMi = (...adlar: string[]) => acildiMiFn(acilanlar, ...adlar);
  // ★ V2 KİLİTİ (25.10 — kullanıcı emri): satır YOK / "free" → AÇIK; admin panel
  //   → Özellik Kilitleri'nden "off"/"v2"/"v3" seçildiğinde modül GRİ kilide düşer
  //   ve yol haritasına devreder (deploy'suz, ~60 sn'de tüm istemcilere yayılır).
  //   getFeatureLock çağrısı SATIR YOKSA "free" döner — hiçbir modül varsayılan kilitli DEĞİL.
  const v2Kapali = (m: V2ModalId): boolean =>
    v2KilitliMi(m, { v2TestAcik: v2TestAcikMi(), incelemeModu: INCELEME_MODU, isMasterSurum: isMasterSürüm, lockDegeri: getFeatureLock(m, "free") });
  const v2Gate = (m: V2ModalId): boolean => {
    if (!v2Kapali(m)) return true;
    setModal(null);
    // ★ 25.10 OYLAMA KAPISI KALDIRILDI (sahibin emri): modül oylamaya devretmez,
    //   kullanıcı net 'yakında' bildirimi alır. Roadmap artık yalnız admin'de.
    notify(`🔒 ${V2_KILITLI[m]} yakında geliyor — hazır olduğunda duyurulacak!`);
    return false;
  };
  // Kilitli modallar hiç mount edilmez (içerik sızmasın)
  const v2Acik = (m: V2ModalId) => v2AcikMi(m, modal, v2Kapali(m));

  // ★ 18.10 ÜYE GATE (kullanıcı emri): admin bir gizli modülü pro/elit'e YAYINLADIĞINDA
  //   HERkes butonu görür ve tıklayabilir — ama tıklayan 1) giriş yapmamışsa LOGIN
  //   PORTALINA, 2) üye ama o seviyede değilse PREMIUM sayfasına yönlendirilir.
  // ★ ÜYE GATE listesindeki modüller için merkezî geçit burada, tüm tetikleyicileri
  //   (menü / stüdyo butonu / yol haritası) tek yerden yakalar. admin-godmode + master geçer.
  // ★ 22.10 KULLANICI EMRİ — PLANA GÖRE KATMAN HARİTASI:
  //   • ayetKartlari (Foto üzerine Ayet & Dua Kütüphanesi) → PRO
  //   • haftaninVideosu (Haftanın Videosu vitrini) → ELİT
  //   • seslendirme (NÛR SES) → ELİT (render kapısı ayrıca aşağıda)
  //   • kendiSes (Kendi sesinle üretim) → ELİT
  //   • zip (Medya yükleme/ZIP) → V3, admin kilidi kalsın
  const UYE_GATE: Record<string, Tier> = { zip: "elit", kendiSes: "elit", seslendirme: "elit", haftaninVideosu: "elit", ayetKartlari: "pro" };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (!modal) return;
    // ★ 25.10 KİLİT-BAGI DAVRANIS DÜZELTMESİ (kullanıcı emri: "elit seçince sadece elit mi
    //   alabiliyor — her şeyi kilitle/aç kontrol et"): admin panel Özellik Kilitleri'nde
    //   modüle "Pro üyelere"/"Elit üyelere" seçildiyse gereken tier O SEVİYEDEN gelir
    //   (menü rozetiyle birebir aynı — HeaderTopBar efektifHedef). "free" seçildiyse kapı
    //   tamamen kalkar, HERKES (misafir dahil) açabilir. Satır yoksa fallback sayesinde
    //   varsayılan UYE_GATE haritası geçerli — mevcut plan davranışı korunur.
    const varsayilanGate = UYE_GATE[modal];
    const kilitDegeri = getFeatureLock(modal, (varsayilanGate ?? "hidden") as FeatureLock);
    if (kilitDegeri === "free") return; // admin herkese açtı (explicit) — kapı yok
    const gereken = (kilitDegeri === "pro" || kilitDegeri === "elit" ? kilitDegeri : varsayilanGate);
    if (!gereken) return;
    if (isMasterSürüm || isAdminEmail(user?.email || "")) return; // admin/masten her şey açık
    if (!user?.email) {
      setModal(null);
      notify("🔐 Bu özellik üyelere özel — önce giriş yap / üye ol!");
      setLoginTab("register");
      setModal("login");
      return;
    }
    if (!tierAtLeast(tier, gereken)) {
      setModal(null);
      // ★ 22.10: hedef seviye geçilir — panelin içindeki GEREKEN plan kartı vurgulanır
      //   (pro kullanıcı elit özellik tıklayınca direkt ELİT kartına kayar)
      notify(`👑 ${gereken === "pro" ? "PRO" : "ELİT"} üyelik gerekli — premium sayfası açıldı`);
      openPremium("uyelik", gereken === "pro" || gereken === "elit" ? gereken : undefined);
    }
  }, [modal]);

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
    for (const m of V2_MODAL_IDLERI) {
      if (modal === m && v2Kapali(m)) {
        v2Gate(m);
        return;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal]);

  // ★ GOOGLE KÖPRÜSÜ — modalHelpers.ts'e taşındı (09.10, 2. tur); bileşen sadece
  //   callback sarmalayıcı ile çağırır. Aynı davranış: Client ID doğrulama + PKCE + yönlendirme.
  const handleGoogleAuthLocal = React.useCallback((loginHint?: string) => {
    void handleGoogleAuth(notify, loginHint);
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
          handleGoogleAuth={handleGoogleAuthLocal}
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
        <React.Suspense fallback={null}>
        <PremiumModal
          lang={lang}
          hedefTier={premiumHedef ?? undefined}
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
                // ★ 25.10 CANLI FIX: oturum yok/şifre bittiğinde create 401 "Giriş yapmalısınız"
                //   dönüyor; PremiumModal açık kalıp boş hata gösteriyordu — artık login kapısı açılır
                //   (Vercel loglarında 19:07-19:08 15x 401 retry fırtınasının düzeltmesi).
                if (/giriş yap/i.test(String(result.error || ""))) {
                  notify("🔐 Ödeme için giriş yapmalısınız");
                  setLoginTab("login");
                  setModal("login");
                  return;
                }
                notify(`❌ Ödeme hatası: ${result.error || "Bilinmeyen hata — lütfen tekrar deneyin"}`);
                return;
              }
              // ★ DEMO KÖPRÜSÜ — modalsContainerOdeme.ts'e taşındı (09.10 parçalama);
              //   demo isteklerinde ödemeyi atla, ürünü doğrudan tanımla.
              if (result.demo) {
                demoOdemeUygula(result, { setTier, setCurrentTier, setJetonCount, setPremiumOpen, notify });
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
        </React.Suspense>
      )}

      {/* ADMIN DASHBOARD MODAL
          ★ 28.09 PANEL İZOLASYONU: panel içi bir hata artık TÜM siteyi düşüremez —
          kök ErrorBoundary (App.tsx) yerine bu sınır patlar, yalnız panel kapanır. */}
      {modal === "adminDashboard" && serverAdminVerified && (
        <ErrorBoundary label="Admin Paneli">
          <React.Suspense fallback={null}>
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
          </React.Suspense>
        </ErrorBoundary>
      )}

      {/* KENDİ SESİNİ YÜKLE MODAL (30.09) — ★ 22.10 KULLANICI EMRİ: ELİT üyelere AÇILDI
          (admin/V3 kilidi kalktı); ELİT olmayan UYE_GATE effect'inde premium'a düşer.
          admin + master her zaman açık. */}
      {modal === "kendiSes" && !v2Kapali("kendiSes") && (isMasterSürüm || isAdminEmail(user?.email || "") || tierAtLeast(accessTier, "elit")) && (
        <React.Suspense fallback={null}>
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
          sureEkle={kendiSesSureEkle}
          maksSn={kendiSesMaksSn}
          maksAyarla={kendiSesMaksAyarla}
          setPickingFor={setPickingForAtmos}
          setModal={setModal}
          ayahBackgrounds={kendiSesAyahBackgrounds}
          openPremium={openPremium}
          notify={notify}
        />
        </React.Suspense>
      )}

      {/* ADMIN AUTH MODAL — SRP adım 8 */}
      {adminAuthOpen && (
        <AdminAuthBolum setAdminAuthOpen={setAdminAuthOpen} setModal={setModal} setLoginTab={setLoginTab} adminError={adminError} notify={notify} />
      )}

      {/* ★ ATMOSFER SEÇİCİ — 30.09 SRP parçalama adım 1: AtmosferSeciciModal.tsx'e taşındı (JSX birebir korunur) */}
      {acildiMi("atmos") && (
      <React.Suspense fallback={null}>
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
      </React.Suspense>
      )}

      {/* QURAN LEARN / LISTEN — TEK MODAL: "Kur'an" pill'i açar, learn/listen sekmeleri içeride.
          ★ 18.10: user/tier/isMaster geçildi — admin-gizli uzun vadeli kilitler (adm-kabe-canlı,
          adm-kuran-sayfalar, adm-ekransiz-dinleme…) bu modalın butonlarını yönetir. */}
      {acildiMi("quranLearn", "quranListen") && (
      <React.Suspense fallback={null}>
      <QuranLearnModal open={modal === "quranLearn" || modal === "quranListen"} onClose={() => setModal(null)} initialMode={modal === "quranListen" ? "listen" : "learn"} lang={lang} user={user} tier={tier} tierAtLeast={tierAtLeast} isMasterSurum={isMasterSürüm} />
      </React.Suspense>
      )}
      {/* ★ AYET KÜTÜPHANESİ — ayet seç, kartın içine yazılsın, fotoğraf olarak indir */}
      {acildiMi("ayetKartlari") && (
      <React.Suspense fallback={null}>
      {/* ★ 25.10: jeton kuralı — normal kullanıcı 3/15 kısa hak ile açar, ELİT hep açık · admin muaf */}
      <AyetKartlariModal open={v2Acik("ayetKartlari")} onClose={() => setModal(null)} notify={notify} lang={lang} accessTier={accessTier} tierAtLeast={tierAtLeast} openPremium={openPremium} kutuphaneMasterAcik={isMasterSürüm || isAdminEmail(user?.email || "")} />
      </React.Suspense>
      )}

      {/* ★ BU SİTEDE NE VAR — kaynaklar, telif bildirimi, iletişim (yol haritası madde 4) */}
      {acildiMi("siteHakkinda") && (
      <React.Suspense fallback={null}>
      <SiteHakkindaModal open={modal === "siteHakkinda"} onClose={() => setModal(null)} onIletisim={() => setModal("contact")} lang={lang} />
      </React.Suspense>
      )}

      {/* ★ RAMAZAN & KANDİL MERKEZİ — hicri takvimle otomatik Ramazan modu (madde 6) */}
      {acildiMi("ramazan") && (
      <React.Suspense fallback={null}>
      <RamazanModal open={modal === "ramazan"} onClose={() => setModal(null)} prayerTimings={prayerTimings} notify={notify} lang={lang} />
      </React.Suspense>
      )}

      {/* ★ HAZIR AYET PAKETLERİ — tek tuşla stüdyoya paket ekle (madde 8) */}
      {acildiMi("ayetPaketleri") && (
      <React.Suspense fallback={null}>
      {/* ★ 25.10: paket günü 10 ek limit (elit dahil) — kural ayetKutuphaneKurali.ts */}
      <AyetPaketleriModal open={v2Acik("ayetPaketleri")} onClose={() => setModal(null)} addAyah={addAyah} notify={notify} lang={lang} />
      </React.Suspense>
      )}

      {/* ★ ÖZEL GÜN TAKVİMİ — Cuma/kandiller + tema önerisi + hatırlatıcı (madde 10) */}
      {acildiMi("ozelGunTakvimi") && (
      <React.Suspense fallback={null}>
      <OzelGunTakvimiModal open={v2Acik("ozelGunTakvimi")} onClose={() => setModal(null)} notify={notify} lang={lang} />
      </React.Suspense>
      )}

      {/* ★ HAFTANIN VİDEOSU — admin onaylı topluluk vitrini (madde 17)
          ★ 22.10 KULLANICI EMRİ: HAFTANIN VİDEOSU ELİT üyelere — olmayan UYE_GATE'te
          premium'a düşer; render kapısı da elit şartlıdır (içerik sızmasın). */}
      {acildiMi("haftaninVideosu") && (isMasterSürüm || isAdminEmail(user?.email || "") || tierAtLeast(accessTier, "elit")) && (
      <React.Suspense fallback={null}>
      <HaftaninVideosuModal open={modal === "haftaninVideosu"} onClose={() => setModal(null)} notify={notify} />
      </React.Suspense>
      )}

      {/* ★ KEŞFET — hadis bankası, kıssa, soru-cevap, kelime kartları, sure bilgileri, namaz rehberi, bebek duası, dua rehberi (maddeler 18-22-28-35-61) */}
      {acildiMi("kesfet") && (
      <React.Suspense fallback={null}>
      <KesfetModal open={v2Acik("kesfet")} onClose={() => setModal(null)} notify={notify} lang={lang} atolyeAc={(kelime, ar) => { setAtolyeBaslangic({ kelime, ar }); setModal("kelimeAtolyesi"); }} />
      </React.Suspense>
      )}

      {/* ★ HAFIZLIK TESTİ — ★ 17.10: V2 oylama kilidinden çıkarıldı (kullanıcı emri),
          herkese ÜCRETSİZ; aç-gizli kontrolü v2Acik/v2Kapali zincirinden bağımsız. */}
      {acildiMi("hafizlikTesti") && (
      <React.Suspense fallback={null}>
      <HafizlikTestiModal open={modal === "hafizlikTesti"} onClose={() => setModal(null)} notify={notify} lang={lang} />
      </React.Suspense>
      )}

      {/* ★ AYET NOTLARI — şifreli kişisel notlar, sunucuya gitmez (madde 57) */}
      {acildiMi("ayetNotlari") && (
      <React.Suspense fallback={null}>
      <AyetNotlariModal open={v2Acik("ayetNotlari")} onClose={() => setModal(null)} notify={notify} lang={lang} />
      </React.Suspense>
      )}

      {/* ★ KELİME ATÖLYESİ — kelime yaz → ayet + atmosfer önerisi → tek tık stüdyoya (İş 3) */}
      {acildiMi("kelimeAtolyesi") && (
      <React.Suspense fallback={null}>
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
      </React.Suspense>
      )}

      {/* ★ ARKA PLAN ÜRETİCİ LİTE — mood yaz → sahne planı + sinematik filtre (İş 4) */}
      {acildiMi("arkaPlanUretici") && (
      <React.Suspense fallback={null}>
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
      </React.Suspense>
      )}

      {/* ★ DAVET / REFERANS — kod + link + karşılıklı +3 kısa video (İş 5) */}
      {acildiMi("davet") && (
      <React.Suspense fallback={null}>
      <DavetModal
        open={modal === "davet"}
        onClose={() => setModal(null)}
        notify={notify}
        lang={lang}
        user={user}
        bekleyenDavetKodu={bekleyenDavetKodu}
        onOdulAlindi={syncWallet}
      />
      </React.Suspense>
      )}

      {/* LIBRARY MODAL — SRP adım 8 */}
      {modal === "library" && (
        <LibraryBolum setModal={setModal} t={t} lang={lang} libSearch={libSearch} setLibSearch={setLibSearch} libType={libType} setLibType={setLibType} libEmotion={libEmotion} setLibEmotion={setLibEmotion} libraryFiltered={libraryFiltered} useFromLibrary={useFromLibrary} />
      )}

      {/* MEDYA YÜKLEME MODALI (28.09): ZIP gezgini kaldırıldı — video/resim/ses kabul, diğerleri red.
          ★ onArkaPlanYap: seçilen dosya IndexedDB'den Clip'e çevrilip stüdyo atmosferine atanır
          ★ 17.10 V3 KİLİDİ: kullanıcı emri — ZIP/Image modülü V3 kilitli, admin + master hariç kapalı */}
      {modal === "zip" && (isMasterSürüm || isAdminEmail(user?.email || "")) && (
        <Modal title="Medya Yükleme" sub="V3 · Admin · video, resim ve ses dosyaları — IndexedDB'de kalıcı saklanır" onClose={() => setModal(null)} wide>
          <div className="h-[65vh] min-h-[420px]"><React.Suspense fallback={null}><ZipExplorer onClose={() => setModal(null)} onArkaPlanYap={onMedyaArkaPlan} onMedyaDegisti={onMedyaSenkron} /></React.Suspense></div>
        </Modal>
      )}

      {/* STORIES MODAL — SRP adım 8 */}
      {modal === "stories" && isMasterSürüm && (
        <StoriesBolum setModal={setModal} addAyah={addAyah} t={t} />
      )}

      {/* THEMES MODAL — SRP adım 8 */}
      {modal === "themes" && (
        <ThemesBolum setModal={setModal} t={t} ALL_THEMES={ALL_THEMES} themeTier={themeTier} themeEmoji={themeEmoji} themeId={themeId} setThemeId={setThemeId} accessTier={accessTier} tierAtLeast={tierAtLeast} openPremium={openPremium} lang={lang} />
      )}

      {/* PRAYER MODAL — SRP adım 8 */}
      {modal === "prayer" && (
        <PrayerBolum setModal={setModal} t={t} lang={lang} prayerCity={prayerCity} prayerSearch={prayerSearch} setPrayerSearch={setPrayerSearch} filteredCities={filteredCities} setPrayerCity={setPrayerCity} prayerTimings={prayerTimings} nextPrayer={nextPrayer} formatRemaining={formatRemaining} />
      )}

      {/* CONTACT & SUPPORT MODAL — SRP adım 8 (yıldız puanı bileşende) */}
      {modal === "contact" && (
        <ContactBolum setModal={setModal} contactType={contactType} setContactType={setContactType} contactMessage={contactMessage} setContactMessage={setContactMessage} notify={notify} t={t} />
      )}

      {/* ★ SESLENDİRME MODALI (14.10) — mockup ai-mockup/ana-ekran-seslendirme.html'den işlendi.
          Kuyruk + atmosfer + prefetch + nefesli geçiş + kırmızı X. Ses: lokal prototip
          sunucusu (vite proxy /nur-tts → 8877) — canlıda kapalı, kibar kapanış notu verir.
          ★ 18.10 V3 ADMİN KİLİDİ (kullanıcı emri): admin haricinde HERKESE kapalı —
          modal bir an bile mount edilmez (içerik sızmasın); admin-gizli adm- maddesi
          AdminGizliFeatures panelinden free/pro/elit'e açılabilir (o zaman UYE_GATE
          tier'ı devreye girer). Kod tarafı fail-closed: isMasterSurum da admin değilse kapı kapalı.
          ★ 20.10 ELİT KAPISI (kullanıcı emri: "seslendirme elit üyelere açılacak, herkese
          kilitli olsun"): admin/master KALICI muaf + elite tier'a da mount izni.
          Free/pro kullanıcının modalı bir an bile mount OLMAZ (içerik sızmasın). */}
      {(isMasterSürüm || isAdminEmail(user?.email || "") || tier === "elit") && (
      <SeslendirmeModal open={modal === "seslendirme"} onClose={() => setModal(null)} notify={notify ?? undefined} />
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
