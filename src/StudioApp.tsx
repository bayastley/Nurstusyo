import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import fixWebmDuration from "fix-webm-duration";
import { BookOpen } from "lucide-react";
import { StudioHeroSection } from "./studio/StudioHeroSection";
import {
  CATEGORY_ICONS, DEFAULT_MASTER_SURUM, RENDER_AUTH_LIVE, SERVER_BAN_LIVE,
  MODES, ASPECTS, PRAYERS,
  ARABIC_FONTS as _ARABIC_FONTS, SHIMMER_STYLES as _SHIMMER_STYLES, CINE_FILTERS as _CINE_FILTERS, arabicFontWeight, arabicIdealScale,
} from "./studio/studioConstants";
import { useCanvasDraw } from "./studio/useCanvasDraw";
import { useStudioCekirdek } from "./studio/useStudioCekirdek";
import { useStudioArkaPlanBag } from "./studio/useStudioArkaPlanBag";
import { useStudioPicker } from "./studio/useStudioPicker";
import { ayetKategorisiBul, adminAyetKategorisiBul } from "./studio/ayetKategori"; // ★ SRP adım 13 (02.10): ayet→kategori motoru
import { akilliKlipSec } from "./studio/atmosferBag"; // ★ 16.10: Akıllı AI seçimi tekrar-düşman DÖNEN TORBA (Math.random tekrarı çözüldü)
import { storeVideo, loadStoredVideos } from "./studio/videoStore";
import { checkGuestGate, bumpGuestUsed, GUEST_FREE_VIDEOS } from "./studio/useGuestTrial";
import { devamiBagla, bekleyenDevamiYurut, uyariAcilisiBagla } from "./studio/telifUyariAkisi";

import { useAnalytics } from "./studio/useAnalytics";
void _ARABIC_FONTS; void _SHIMMER_STYLES; void _CINE_FILTERS;
import {
  fmtDuration, fmtSize, dimensions, uid, isWholeSurahSelected,
  pickMime, formatRemaining, fetchJSON, fetchAyah, fetchSurah, normalizeTurkishMeal, quranUrl,
} from "./studio/studioHelpers";
import { QURAN_CLIPS } from "./clips-r2";
import { adminCatUsable } from "./adminCategoryAccess";
import {
  ACTIVE_CATEGORIES,
  ALL_CLIPS,
  CATEGORIES,
  MOTION_CLIPS,
  TEMPLATE_CLIPS,
  ATMOSPHERE_PREVIEW_UNLOCKED,
  KATEGORI_TIER,
  FREE_VIDEOS_PER_CATEGORY,
  CATEGORY_PALETTE,
  toHiRes,
  randomClip,
  type CatId,
  type Clip,
  } from "./clips";
import {
  DAILY_AYAHS,
  genDesc,
  genTitle,
  HASHTAG_POOL,
  hashtagPool,
  SURAHS,
  THEMES,
  THEME_EMOJI,
  TURKISH_CITIES,
  DUNYA_SEHIRLERI,
  EXTRA_THEMES,
  THEME_TIER,
  THEME_EMOJI_EXTRA,
} from "./data";
import { LANGS, MEAL_EDITIONS, T, translate, dilSaukle, type Lang } from "./i18n";
import { RECITERS, RECITER_SES_TARZI, SES_TARZI_ORDER, sesKaynakZinciri, sesZinciriBagla, sesZinciriSoKup } from "./reciters";
import { kuyrukIndir } from "./components/seslendirmeIndir";
import { AtmosferGirisArkaPlani } from "./components/AtmosferGirisArkaPlani";
import { LIBRARY_ITEMS, type LibraryItem, type LibraryType, type Emotion } from "./dualar";
import { kutuphaneItem } from "./data/kutuphaneCokDil"; // ★ 06.10: kütüphane kartları seçili dilde (başlık/anlam/kaynak)
import { useDilSenkron } from "./studio/useDilSenkron"; // ★ SRP adım 11 (09.10 2. tur): dil senkron efektleri (meal + paylaşım + RTL)
import { HeaderTopBar } from "./components/HeaderTopBar";
import { StudioHeroSectionLazySuspense, PanelSuspense } from "./studio/panelSuspense";
// ★ 16.10 CHUNK BÖLÜMÜ — ağır paneller React.lazy ile KENDİ chunk'larında;
//   ana giriş (hero + header + canvas çekirdeği) küçük kalır. İlk boyama hızlanır,
//   kullanıcı kaydırırken/açarken panel chunk'ları paralel gelir.
const AyahLibraryPanel = React.lazy(() => import("./components/AyahLibraryPanel").then((m) => ({ default: m.AyahLibraryPanel })));
const VideoPreviewSection = React.lazy(() => import("./components/VideoPreviewSection").then((m) => ({ default: m.VideoPreviewSection })));
const DesignSettingsPanel = React.lazy(() => import("./components/DesignSettingsPanel").then((m) => ({ default: m.DesignSettingsPanel })));
const SocialSharePanel = React.lazy(() => import("./components/SocialSharePanel").then((m) => ({ default: m.SocialSharePanel })));
const ModalsContainer = React.lazy(() => import("./components/ModalsContainer").then((m) => ({ default: m.ModalsContainer })));
import { MaintenanceScreen } from "./components/MaintenanceScreen";
import { AnnouncementBar } from "./components/AnnouncementBar";
import { CookieConsent, CookieAyarDugmesi } from "./components/CookieConsent";
import { setLegalTabAçıcı, type LegalTab } from "./legalTabs";
import { TelifDisclaimer } from "./components/TelifDisclaimer";
import { telifUyarisiGerekli } from "./telifUyari";
import { uretimIstYaz } from "./components/islamicToolsVucut";
import { BugunHediye } from "./components/BugunHediye";
import { MiniTur } from "./components/MiniTur"; // ★ madde 3: ilk girişte 5 duraklı tur
import { SevapSayaciKarti } from "./components/SevapSayaciKarti"; // ★ madde 4: dürüst aylık harf sayacı
import { GununHazirVideosu } from "./components/GununHazirVideosu";
import { OnerilenVideolar, type OneriVideo } from "./components/OnerilenVideolar"; // ★ 22.10: güne özel hazır video taslakları
import { PwaKurulumBanneri } from "./components/PwaKurulumBanneri";
import { AsistanBaloncugu } from "./components/AsistanBaloncugu"; // ★ 19.10 ücretsiz SSS asistanı
import { RoadmapModal } from "./components/RoadmapModal";
import { useShareActions } from "./studio/useShareActions";
import { VARSAYILAN_CUBUK, VARSAYILAN_MESAJ, type CubukAyar, type MesajAyar } from "./studio/mesajKatmani";
import { tierAtLeast, reciterRequiredTier, JETON, isAdminEmail, ADMIN_SECRET_PATH, getJeton, setJeton as persistJetonSecure, getCurrentTier, setCurrentTier, isRamadan, isFriday, videoMaliyeti, isFeatureUnlocked, featureLockLabel, hasMicroUnlock, type Tier } from "./tier";
import { useManualAuthActions } from "./studio/useManualAuthActions";

// ★ Yeni Hook'lar
import { useAuth } from "./studio/useAuth";
import { useTier } from "./studio/useTier";
import { useWallet } from "./studio/useWallet";
import { useBan } from "./studio/useBan";
import { usePaymentFlow } from "./studio/usePaymentFlow";
import { useAudioPreview } from "./studio/useAudioPreview";
import { useKendiSesiniYukle } from "./studio/useKendiSes";
import { usePrayerTime } from "./studio/usePrayerTime";
import { useDailyAyah } from "./studio/useDailyAyah";
import { useSearchResults } from "./studio/useSearchResults";
import { useMedyaYukleme } from "./studio/useMedyaYukleme";
import { useOutputKalici } from "./studio/useOutputKalici";
import { useVideoGenerator } from "./studio/useVideoGenerator";
import { useVideoTasarimAyarlar } from "./studio/useVideoTasarimAyarlar";
import { useOnayPencereleri } from "./studio/useOnayPencereleri";
import { useReciterPreview } from "./studio/useReciterPreview";
import { useAyetSecim } from "./studio/useAyetSecim"; // ★ SRP (09.10): ayet seçim motoru hook'a taşındı
import { getVideoUrlSync, getPosterUrlSync, getVideoUrl, getPosterUrl, isR2Media } from "./videoUrl";
import { checkRateLimit } from "./rateLimiter";
import { ensureImageYukle, ensureVideoYukle } from "./studio/medyaOnYukleme";
import { UretimOnayBalonu, BanEngelEkrani, HataKilavuzModal, TelifRiskOnayBalonu, RISK_ONAY_ESIGI, RenderKaplanmaEkran, ModalsKatman } from "./components/studioAppBolumler";
// ★ SRP adım 12 (30.09): medya ön yükleme fabrikası studio/medyaOnYukleme.ts'e taşındı
import { onErrorCaptured, reportRenderError, type DebugGuideMessage } from "./debugGuide";
import { fetchRemoteConfig, ensureRemoteSync, getSystemConfig, banUserInDb, getBanLogs, type MaintenanceConfig } from "./services/adminSyncService";
import type { SelectedAyah, Output, DailyAyah, User, Mode, Aspect, ModalName, LoginTab } from "./types";

void SES_TARZI_ORDER; void KATEGORI_TIER; void FREE_VIDEOS_PER_CATEGORY;
// Sabitler studioConstants.ts'e, yardımcılar studioHelpers.ts'e taşındı

// Tüm sabitler + yardımcılar dış dosyalara taşındı (studio/)

export default function StudioApp({ isMasterSürüm: developerMaster = DEFAULT_MASTER_SURUM }: { isMasterSürüm?: boolean }) {
  // ★ İlk açılışta remote config'i çek (feature locks, announcements vs. global senkronizasyon)
  useEffect(() => { ensureRemoteSync(); }, []);

  // Wallet sync → useWallet hook'unda

  // ★ Ücretsiz, tek satırlık ziyaretçi analitiği (Supabase nur_page_views'e yazar)
  useAnalytics();

  // Payment flow → usePaymentFlow hook'unda

  const stCekirdek = useStudioCekirdek({ developerMaster });
  const {
    adminGodMode, setAdminGodMode, setIsMasterSürüm, maintenance, isDevMaster, isMasterSürüm, setSentCode, setAdminSonEmail, notify,
    telifUyariAcik, setTelifUyariAcik,
    genConfirmOpen, genConfirmData, showGenerateConfirm, handleGenConfirm, riskOnayData, showRiskOnay, handleRiskOnay,
    lang, themeId, setThemeId, query, setQuery, results, searching,
    surah, setSurah, ayah, setAyah, selected, setSelected, verseIndex, setVerseIndex,
    background, setBackground, ayahBackgrounds, setAyahBackgrounds, pickingFor, setPickingFor,
    medyaArkaPlanYap, onMedyaSenkron,
    clipKind, setClipKind, atmosCategory, setAtmosCategory, atmosQuery, setAtmosQuery,
    mode, setMode, lockTip, setLockTip, aspect, setAspect, batchFormats, setBatchFormats, reciterId, setReciterId,
    user, setUser, loginTab, setLoginTab, phone, setPhone, verifyCode, setVerifyCode, sentCode,
    serverAdminVerified, adminEmailInput, setAdminEmailInput, adminCodeInput, setAdminCodeInput,
    adminError, setAdminError, adminAuthOpen, setAdminAuthOpen, openAdminDashboard, adminSonEmail,
    jetonCount, setJetonCount, syncWallet, consumeRight, packRights, subscriptionEndsAt, resetWallet,
    tier, setTier, accessTier, premiumOpen, setPremiumOpen, premiumTab, setPremiumTab, openPremium, checkTier,
    tryUnlockElitFeature, tryUnlockFullMode, localBanned, setLocalBanned, localBanReason, setLocalBanReason,
    themeKey, previewPlaying, setPreviewPlaying, previewTime, setPreviewTime, previewDuration, setPreviewDuration,
    silenceAllAudio, audioReciter,
    kendiSesAktif, kendiSesYukleniyor, kendiSesKayitlari, kendiSesYukle, kendiSesYukleAyetAyri, kendiSesSec,
    kendiSesSil, kendiSesZamanlamaKaydet, kendiSesKaldir, kendiSesYenidenTara, kendiSesMaksSn, setKendiSesMaksSn,
    prayerCity, setPrayerCity, prayerSearch, setPrayerSearch, prayerTimings,
    dailyPool, dailyIndex, dailyPaused, daily,
    previewMaximized, setPreviewMaximized, previewWidth, renderQuality,
    ARABIC_FONTS,
    arabicFont, setArabicFont, arabicFontCss, arabicFontW, textSize, setTextSize, textSizeMul, setTextSizeMul,
    textSizeFine, SHIMMER_STYLES, CINE_FILTERS,
    mealSizeFine, setMealSizeMul, shimmerStyle, setShimmerStyle, shimmerCfg, shimmerIntensity, setShimmerIntensity,
    cardBg, setCardBg, brandSignature, setBrandSignature, brandPos, setBrandPos, brandOn, setBrandOn,
    cubukAyar, setCubukAyar, mesajAyar, setMesajAyar, cinematic, setCinematic, cineFilter,
    showArapca, setShowArapca, showSubMeal, setShowSubMeal, textOffset, setTextOffset,
    libType, setLibType, libEmotion, setLibEmotion, libSearch, setLibSearch,
    previewReciterId, setPreviewReciterId,
    generating, setGenerating, progress, setProgress, outputs, setOutputs, activeOutputId, setActiveOutputId,
    shareTitle, setShareTitle, shareDescription, setShareDescription, pickRandomTags, visibleTags, setVisibleTags,
    now, menuOpen, setMenuOpen, roadmapOpen, setRoadmapOpen, langOpen, setLangOpen, modal, setModal,
    bekleyenDavetKodu, tosOpen, setTosOpen, legalTab, setLegalTab, debugGuideModal, setDebugGuideModal,
    tosAccepted, setTosAccepted, contactType, setContactType, contactMessage, setContactMessage,
    hoveredClip, setHoveredClip, smartAiEnabled, setSmartAiEnabled, aiTooltipHover, setAiTooltipHover,
    fullUnlockConfirmOpen, setFullUnlockConfirmOpen,
    lastTitleRef, lastDescRef, canvasRef, verseAudioRef, reciterPreviewRef, previewTimerRef, stopGenerationRef,
    selectedRef, verseIndexRef, backgroundRef, ayahBackgroundsRef, aspectRef, themeRef, clipKindRef, smartAiEnabledRef,
    isClipAccessibleRef, imageCache, videoCache, videoWatchdog, ensureImage, ensureVideo,
    combinedAllClips, sortedReciters, reciter, activeOutput, t,
    ALL_THEMES, themeTier, themeEmoji, setLang, toast, setToast,
  } = stCekirdek;

  useCanvasDraw({
    canvasRef, selectedRef, verseIndexRef, backgroundRef, ayahBackgroundsRef, aspectRef, themeRef,
    videoWatchdog, imageCache, videoCache, ensureImage, ensureVideo,
    showArapca, showSubMeal, accessTier, arabicFontCss, arabicFontWeight: arabicFontW, textSizeMul, mealSizeMul: mealSizeFine, shimmerCfg, shimmerIntensity, cardBg, textOffset,
    cubuk: cubukAyar, mesaj: mesajAyar,
    cineFilter, isMasterSürüm, brandSignature, brandOn, brandPos, previewFps: renderQuality.previewFps, previewTime, previewDuration, previewIsSurah: Boolean(reciter.surahPattern), user, generating,
  });

  // Canvas draw kodu useCanvasDraw hook'una taşındı
  // ★ 25.10 parçalama: atmosfer atama/zar + seçim motoru + kütüphane + hoca indirme
  //   studio/useStudioArkaPlanBag.ts'e taşındı; dışa açık isimler aynı.
  const stArka = useStudioArkaPlanBag({
    notify, t, lang, isMasterSürüm, accessTier, reciter, clipKind, smartAiEnabled,
    selected, setSelected, setVerseIndex, setModal, combinedAllClips,
    libType, libEmotion, libSearch, previewReciterId, setPreviewReciterId, silenceAllAudio,
    ensureImage, ensureVideo, setBackground, setAyahBackgrounds, setShareTitle, setShareDescription,
    backgroundRef, ayahBackgroundsRef, selectedRef, verseIndexRef, clipKindRef,
    smartAiEnabledRef, isClipAccessibleRef, reciterPreviewRef, previewTimerRef,
  });
  const {
    reassignBackgroundsForKind, useFromLibrary, libraryFiltered, isClipAccessible,
    randomizeBackgrounds, applySmartBackgrounds, playReciterPreview, hocaIndir, hocaIndirBusy,
    kendiSesSureEkle, addAyah, toggleAyah, addWholeSurah,
  } = stArka;

  // ★ VİDEO ÜRETİM MOTORU — useVideoGenerator hook'unda (parçalama, 01.10)
  const handleGenerate = useVideoGenerator({
    generating, setGenerating, setProgress, stopGenerationRef,
    user, isMasterSürüm, setLoginTab, setModal, notify,
    selected, canvasRef, reciter, kendiSesAktif, kendiSesMaksSn, batchFormats, aspect, mode, accessTier, jetonCount,
    silenceAllAudio, showGenerateConfirm, showRiskOnay, riskOnayEsigi: RISK_ONAY_ESIGI,
    videoCache, imageCache, ayahBackgroundsRef, backgroundRef,
    verseIndexRef, aspectRef, setVerseIndex, setOutputs, setActiveOutputId,
    ensureImage, ensureVideo, renderQuality, t,
  });

  // ★ TELİF UYARI ZİNCİRİ — kabul edilince son handleGenerate tekrar koşar (SRP tur 4)
  useEffect(() => devamiBagla(() => { handleGenerate(); }), [handleGenerate]);

  // ★ PAYLAŞIM FONKSİYONLARI — useShareActions hook'undan (parçalama)
  const { copied, copyShare, shareOutput, downloadVideo, shareToWhatsApp, shareToYouTube, shareToTikTok, shareToInstagram, shareToX, paylasCihazi } = useShareActions({ shareTitle, shareDescription, notify, t });

  // ★ 25.10 parçalama: öneri motoru + misafir + pickClip → useStudioPicker
  const stSecici = useStudioPicker({
    combinedAllClips, clipKind, isClipAccessible, sortedReciters, accessTier, generating, notify,
    setSelected, setReciterId, addAyah, setAyahBackgrounds, setBackground, handleGenerate,
    background, ayahBackgrounds, selectedRef, ayahBackgroundsRef, backgroundRef,
    prayerTimings, now, prayerSearch, atmosCategory, atmosQuery, pickingFor, setModal, setPickingFor, ensureVideo,
  });
  const {
    oneriHavuzu, oneriKullanilanlar, oneriKabileleri, oneriUygulaVeUret,
    nextPrayer, filteredClips, filteredCities, pickClip, getGuestUsed, handleGuestContinue,
  } = stSecici;

  // ★ Manuel giriş/kayıt/çıkış akışları useManualAuthActions hook'unda (parçalama, 01.10)
  const { handleLoginSubmit, handleRegisterSubmit, handleForgotPassword, handleVerifyCode, handleLogout } = useManualAuthActions({
    phone, verifyCode, sentCode, tier, notify,
    setUser, setAdminGodMode, setIsMasterSürüm, setTier, setJetonCount, setSentCode, setLoginTab, setModal,
    setAdminSonEmail, resetWallet,
  });;


  // ★ Misafirin "Video Üret" akışı: hakkı/günü bitince kayıt modalı (yukarıda checkGuestGate kontrolü)

  void user; void lockTip; void adminError; void adminEmailInput;

  return (
    <div className="relative min-h-screen overflow-x-hidden text-[13px]" style={{ color: "var(--text)" }}>
      {maintenance.enabled && (!maintenance.startsAt || Date.now() >= new Date(maintenance.startsAt).getTime()) && (!maintenance.endsAt || Date.now() < new Date(maintenance.endsAt).getTime()) && !isMasterSürüm && (
        <MaintenanceScreen message={maintenance.message} endsAt={maintenance.endsAt ?? null} />
      )}
      {/* ★ 22.10 GİRİŞ ARKA PLANI — Kâbe/Namaz + Kur'an/Mushaf atmosfer videoları,
          ana sayfa arkasında hafif görünür şekilde 30 sn'de bir döner (kullanıcı emri:
          "hep aynı gibi — 30 saniyeye çıkar"). Zemin -z-30 (var(--page)),
          dönen video -z-20, üstündeki ışıma/gradyan -z-10 olur — içeriğin HEPSİNİN altında. */}
      <AtmosferGirisArkaPlani tamHavuz={isMasterSürüm || adminGodMode || isAdminEmail(user?.email || "")} />
      <div className="pointer-events-none fixed inset-0 -z-10" style={{ background: `radial-gradient(900px 560px at 88% -8%,color-mix(in srgb,var(--accent) 12%,transparent),transparent 60%),radial-gradient(800px 600px at -10% 100%,color-mix(in srgb,var(--accent) 7%,transparent),transparent 58%)` }} />

      {/* ANNOUNCEMENT BAR (DİNAMİK MANEVİ TAKVİM & TIKLA-AL ÖDÜL ŞERİDİ) */}
      <AnnouncementBar
        notify={notify}
        user={user}
        setModalSafe={setModal}
        onRewardClaimed={() => {
          syncWallet();
        }}
        onTamperAttempt={(reason) => {
          // Tamper ban uygulamaz — sadece bildirim ver
          notify(`⚠️ Güvenlik: ${reason}`);
        }}
      />

      {/* ★ SEVAP SAYACI KARTI — bu ay okunan harf (madde 4, 02.10): en üstte, kapatılabilir */}
      <SevapSayaciKarti lang={lang} />

      {/* HEADER & TOP STRIP */}
      <HeaderTopBar
        daily={daily}
        dailyPoolLength={dailyPool.length}
        dailyIndex={dailyIndex}
        toggleAyah={toggleAyah}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        user={user}
        handleLogout={handleLogout}
        setModal={setModal}
        openAdminDashboard={openAdminDashboard}
        setLibType={setLibType}
        isMasterSürüm={isMasterSürüm}
        setAdminGodMode={setAdminGodMode}
        setSmartAiEnabled={setSmartAiEnabled}
        setBatchFormats={setBatchFormats}
        notify={notify}
        jetonCount={jetonCount}
        openPremium={openPremium}
        lang={lang}
        setLang={setLang}
        langOpen={langOpen}
        setLangOpen={setLangOpen}
        nextPrayer={nextPrayer}
        prayerCity={prayerCity}
        setPrayerCity={setPrayerCity}
        prayerTimings={prayerTimings}
        setRoadmapOpen={setRoadmapOpen}
        formatRemaining={formatRemaining}
        t={t}
        tier={tier}
        subscriptionEndsAt={subscriptionEndsAt}
        misafirKalanHak={user || isMasterSürüm ? undefined : Math.max(0, GUEST_FREE_VIDEOS - getGuestUsed())}
      />

      <StudioHeroSection />

      {/* MAIN 3 GRID */}
      <main className="mx-auto grid max-w-[1500px] gap-4 px-2 sm:px-4 py-6 grid-cols-1 lg:grid-cols-[300px_280px_1fr]">
        {/* LEFT: AYAH LIBRARY PANEL */}
        <PanelSuspense minHeight={640}>
        <AyahLibraryPanel
          query={query}
          setQuery={setQuery}
          searching={searching}
          results={results}
          surah={surah}
          setSurah={setSurah}
          ayah={ayah}
          setAyah={setAyah}
          selected={selected}
          toggleAyah={toggleAyah}
          addWholeSurah={addWholeSurah}
          verseIndex={verseIndex}
          setVerseIndex={setVerseIndex}
          setSelected={setSelected}
          setAyahBackgrounds={setAyahBackgrounds}
          ayahBackgrounds={ayahBackgrounds}
          setPickingFor={setPickingFor}
          setModal={setModal}
          t={t}
        />
        </PanelSuspense>

        {/* MIDDLE: VIDEO PREVIEW SECTION */}
        <div className="min-w-0 space-y-2.5">
        {/* ★ GÜNÜN HAZIR VİDEOSU (01.10): güne/mübarek güne özel kart — tıkla, önizlemeye yüklensin.
            TIER KURALI: free'e PRO/ELİT atmosfer yüklemez; havuz üyelik katmanından seçilir. */}
        <GununHazirVideosu
          accessTier={accessTier}
          ayetEkle={(s, a) => { if (!selectedRef.current.some((item) => item.id === `${s}:${a}`)) void addAyah(s, a); }}
          arkaPlanAta={(clip) => { setBackground(clip); setAyahBackgrounds((current) => { const next = { ...current }; Object.keys(next).forEach((id) => { delete next[id]; }); return next; }); }}
          erisilebilirKlipBul={(cat) => combinedAllClips.find((clip) => clip.cat === cat && clip.kind === clipKind && isClipAccessible(clip)) ?? null}
          clipKind={clipKind}
        />
        <PanelSuspense minHeight={360}>
        <VideoPreviewSection
          canvasRef={canvasRef}
          previewWidth={previewWidth}
          previewMaximized={previewMaximized}
          setPreviewMaximized={setPreviewMaximized}
          showArapca={showArapca}
          setShowArapca={setShowArapca}
          showSubMeal={showSubMeal}
          setShowSubMeal={setShowSubMeal}
          cubukAyar={cubukAyar}
          setCubukAyar={setCubukAyar}
          mesajAyar={mesajAyar}
          setMesajAyar={setMesajAyar}
          setTextOffset={setTextOffset}
          textOffset={textOffset}
          selected={selected}
          verseIndex={verseIndex}
          setVerseIndex={setVerseIndex}
          verseAudioRef={verseAudioRef}
          previewPlaying={previewPlaying}
          setPreviewPlaying={setPreviewPlaying}
          setPreviewTime={setPreviewTime}
          randomizeBackgrounds={randomizeBackgrounds}
          previewDuration={previewDuration}
          previewTime={previewTime}
          fmtDuration={fmtDuration}
          clipKind={clipKind}
          setClipKind={setClipKind}
          setBackground={setBackground}
          smartAiEnabled={smartAiEnabled}
          setSmartAiEnabled={setSmartAiEnabled}
          aiTooltipHover={aiTooltipHover}
          setAiTooltipHover={setAiTooltipHover}
          isMasterSürüm={isMasterSürüm}
          tierAtLeast={tierAtLeast}
          tier={tier}
          hasMicroUnlock={hasMicroUnlock}
          tryUnlockElitFeature={tryUnlockElitFeature}
          applySmartBackgrounds={applySmartBackgrounds}
          onClipKindChange={reassignBackgroundsForKind}
          background={background}
          openPremium={openPremium}
          setSelected={setSelected}
          setAyahBackgrounds={setAyahBackgrounds}
          setPickingFor={setPickingFor}
          setModal={setModal}
          ayahBackgrounds={ayahBackgrounds}
          activeOutput={activeOutput}
          outputs={outputs}
          setActiveOutputId={setActiveOutputId}
          fmtSize={fmtSize}
          shareOutput={shareOutput}
          paylasCihazi={paylasCihazi}
          downloadVideo={downloadVideo}
          user={user}
          setLoginTab={setLoginTab}
          notify={notify}
          handleGenerate={handleGenerate}
          generating={generating}
          progress={progress}
          generateCost={videoMaliyeti(mode, tier) * Math.max(batchFormats.length, 1)}
          aspect={aspect}
          t={t}
          kendiSesAktifMi={Boolean(kendiSesAktif)}
          onKendiSesAc={() => {
            // ★ 22.10 KULLANICI EMRİ — KENDİ SESİNLE ÜRET → ELİT KAPISI:
            //   önceki "V3 uzun vadeli plana çekildi" kararı bu turda geri alındı.
            //   Artık admin/master + ELİT üye direkt modalı açar; free/PRO
            //   premium panelin ELİT kartına yönlendirilir (hedefTier vurgusu).
            const adminMi = isAdminEmail(user?.email || "");
            if (isMasterSürüm || adminMi || tierAtLeast(tier, "elit")) {
              if (!selected.length) { notify("Önce en az bir ayet seçin — senkron seçtiğin ayetlere kurulur"); return; }
              setModal("kendiSes");
              return;
            }
            notify("👑 Kendi sesinle üretim NÛR ELİT'te — premium panel açıldı");
            openPremium("uyelik", "elit");
          }}
        />
        </PanelSuspense>
        {/* ★ ÖNERİLEN VİDEOLAR (22.10): bugüne özel HAZIR TASLAKLAR — ayet+kâri+atmosfer
            atanmış, tek tıkla üretim. Üretim yaptıktan sonra değil HER ZAMAN üstte. */}
        <OnerilenVideolar
          havuz={oneriHavuzu}
          kullanilanKategoriler={oneriKullanilanlar}
          kabileler={oneriKabileleri}
          generating={generating}
          userAnahtar={user?.email || "misafir"}
          onUret={oneriUygulaVeUret}
        />
        </div>

        {/* RIGHT: DESIGN & SETTINGS PANEL */}
        <PanelSuspense minHeight={560}>
        <DesignSettingsPanel
          setPickingFor={setPickingFor}
          setModal={setModal}
          background={background}
          combinedAllClipsLength={combinedAllClips.length}
          randomizeBackgrounds={randomizeBackgrounds}
          isMasterSürüm={isMasterSürüm}
          sortedReciters={sortedReciters}
          reciterId={reciterId}
          setReciterId={setReciterId}
          accessTier={accessTier}
          openPremium={openPremium}
          previewReciterId={previewReciterId}
          playReciterPreview={playReciterPreview}
          hocaIndir={hocaIndir}
          hocaIndirBusy={hocaIndirBusy}
          mode={mode}
          setMode={setMode}
          tierAtLeast={tierAtLeast}
          tier={tier}
          MODES={MODES}
          ASPECTS={ASPECTS}
          aspect={aspect}
          setAspect={setAspect}
          batchFormats={batchFormats}
          setBatchFormats={setBatchFormats}
          tryUnlockElitFeature={tryUnlockElitFeature}
          hasMicroUnlock={hasMicroUnlock}
          arabicFont={arabicFont}
          setArabicFont={setArabicFont}
          ARABIC_FONTS={ARABIC_FONTS}
          textSize={textSize}
          setTextSize={setTextSize}
          textSizeMul={textSizeFine}
          setTextSizeMul={setTextSizeMul}
          mealSizeMul={mealSizeFine}
          setMealSizeMul={setMealSizeMul}
          shimmerIntensity={shimmerIntensity}
          setShimmerIntensity={setShimmerIntensity}
          shimmerStyle={shimmerStyle}
          setShimmerStyle={setShimmerStyle}
          SHIMMER_STYLES={SHIMMER_STYLES}
          cardBg={cardBg}
          setCardBg={setCardBg}
          brandSignature={brandSignature}
          setBrandSignature={setBrandSignature}
          brandOn={brandOn}
          setBrandOn={setBrandOn}
          brandPos={brandPos}
          setBrandPos={setBrandPos}
          setTextOffset={setTextOffset}
          CINE_FILTERS={CINE_FILTERS}
          cinematic={cinematic}
          setCinematic={setCinematic}
          handleGenerate={handleGenerate}
          generating={generating}
          progress={progress}
          t={t}
        />
        </PanelSuspense>
      </main>

      {/* BOTTOM: SOCIAL SHARE PANEL */}
      <PanelSuspense minHeight={180}>
      <SocialSharePanel
        shareTitle={shareTitle}
        setShareTitle={setShareTitle}
        shareDescription={shareDescription}
        setShareDescription={setShareDescription}
        accessTier={accessTier}
        openPremium={openPremium}
        tierAtLeast={tierAtLeast}
        selected={selected}
        verseIndex={verseIndex}
        reciterName={reciter.name}
        genTitle={genTitle}
        lastDescRef={lastDescRef}
        lastTitleRef={lastTitleRef}
        notify={notify}
        copyShare={copyShare}
        copied={copied}
        visibleTags={visibleTags}
        setVisibleTags={setVisibleTags}
        pickRandomTags={pickRandomTags}
        isMasterSürüm={isMasterSürüm}
        setModal={setModal}
        setTosOpen={setTosOpen}
        openLegalTab={(tab) => { setLegalTab(tab); setTosOpen(true); }}
        t={t}
        shareToWhatsApp={shareToWhatsApp}
        shareToX={shareToX}
        shareToYouTube={shareToYouTube}
        shareToTikTok={shareToTikTok}
        shareToInstagram={shareToInstagram}
        pickDesc={genDesc}
      />
      </PanelSuspense>

      {/* 🎬 TAM SAYFA VİDEO RENDER ENGELLEME VE BİLGİLENDİRME EKRANI */}
      {/* 🎬 TAM SAYFA VİDEO RENDER ENGELLEME VE BİLGİLENDİRME EKRANI */}
      {generating && <RenderKaplanmaEkran progress={progress} onIptal={() => {
        stopGenerationRef.current?.();
        notify("Üretim kullanıcı tarafından iptal edildi");
      }} />}
      {/* TOAST NOTIFICATION */}
      {toast ? (
        <div className="glass modal-in select-none fixed bottom-5 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2 text-[10px] text-white shadow-2xl">
          <BookOpen size={12} style={{ color: "var(--accent)" }} />
          {toast}
        </div>
      ) : null}

      {/* ★ ÜRETİM ONAY BALONU — SRP adım 12: studioAppBolumler */}
      {genConfirmOpen && genConfirmData ? (
        <UretimOnayBalonu genConfirmData={genConfirmData} handleGenConfirm={handleGenConfirm} />
      ) : null}

      {/* ★ TELİF RİSK ONAYI — high-risk kâri bilgilendirilmiş onayı (09.10) */}
      {riskOnayData ? (
        <TelifRiskOnayBalonu
          reciterName={riskOnayData.reciterName}
          riskPercent={riskOnayData.riskPercent}
          onConfirm={handleRiskOnay}
        />
      ) : null}

      {/* ⛔ SÜRESİZ BAN ENGEL EKRANI — SRP adım 12 */}
      {localBanned && !isMasterSürüm && !isAdminEmail(user?.email || "") && (
        <BanEngelEkrani localBanReason={localBanReason} />
      )}

      {/* ALL MODALS CONTAINER */}
      {/* ★ AKILLI HATA KILAVUZU MODALI — SRP adım 12 */}
      {debugGuideModal && (
        <HataKilavuzModal debugGuideModal={debugGuideModal} setDebugGuideModal={setDebugGuideModal} />
      )}

      <PanelSuspense minHeight={0}>
      <ModalsKatman
        cekirdek={stCekirdek}
        arka={stArka}
        secici={stSecici}
        ekstra={{
          guestTrialLeft: Math.max(0, GUEST_FREE_VIDEOS - getGuestUsed()),
          serverAdminVerified: serverAdminVerified || isDevMaster,
          setCurrentTier,
          tierAtLeast,
          seciliAyetSayisi: selected.length,
          formatRemaining,
          CATEGORY_ICONS,
          kendiSesNefes: kendiSesAktif?.nefes ?? 0,
          kendiSesMaksAyarla: setKendiSesMaksSn,
          setPickingForAtmos: (id) => setPickingFor(id),
          kendiSesSeciliAyetler: selected.map((x) => ({ s: x.s, a: x.a, sName: x.sName })),
        }}
      />
      </PanelSuspense>

      {/* COOKIE CONSENT — KVKK m.10 + Çerez Rehberi uyumlu (opt-in, eşit butonlar, envanter) */}
      <CookieConsent />
      {/* 🍪 Çerez ayarları — geri alma hakkı her sayfadan erişilebilir */}
      <CookieAyarDugmesi />

      {/* TELİF UYARISI — SADECE ilk Video Üret basışında bir kere (girişte çıkmaz).
          ★ SRP tur 4: otomatik-devam telifUyariAkisi ile — tetik state'i kalktı */}
      <TelifDisclaimer
        lang={lang}
        acik={telifUyariAcik}
        onKapat={() => setTelifUyariAcik(false)}
        onAccept={bekleyenDevamiYurut}
      />

      {/* ★ BUGÜNÜN HEDİYESİ — günlük giriş sürprizi (yol haritası madde 14) — YALNIZ girişli kullanıcılara; içerik seçili dilde */}
      <BugunHediye notify={notify} onHakDegisti={syncWallet} userEmail={user?.email || null} lang={lang} />

      {/* ★ MINI TUR — ilk girişte 5 duraklı gezdirme (madde 3, 02.10) */}
      <MiniTur lang={lang} />

      {/* ★ PWA KURULUM SİHİRBAZI — Ana Ekrana Ekle öğreticisi (madde 23) */}
      <PwaKurulumBanneri />

      {/* ★ NÛR ASİSTAN — sağ alt köşe balon, ücretsiz SSS asistanı (19.10) */}
      <AsistanBaloncugu openPremiumUyelik={() => openPremium("uyelik")} openPremiumCuzdan={() => openPremium("jeton")} seviye={tier} />

      {/* V2-V3 YOL HARİTASI */}
      <RoadmapModal open={roadmapOpen} onClose={() => setRoadmapOpen(false)} adminEmail={user?.email} />
    </div>
  );
}

declare global { interface Window { webkitAudioContext: typeof AudioContext } }
