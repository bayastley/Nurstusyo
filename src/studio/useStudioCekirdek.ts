// ════════════════════════════════════════════════════════
// USESTUDIOCEKIRDEK.TS — StudioApp parçalama turu (25.10):
// state + referanslar + senkron efektleri + türetilmiş değerler.
// StudioApp'a birebir taşınmadır (satır içi içeriği korunur) — davranış aynı.
// ════════════════════════════════════════════════════════
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MaintenanceConfig } from "../services/adminSyncService";
import { getSystemConfig } from "../services/adminSyncService";
import { ADMIN_SECRET_PATH, getCurrentTier, reciterRequiredTier, tierAtLeast, type Tier } from "../tier";
import { RECITERS, RECITER_SES_TARZI, SES_TARZI_ORDER } from "../reciters";
import { MOTION_CLIPS, type CatId, type Clip } from "../clips";
import { THEMES, EXTRA_THEMES, THEME_TIER, THEME_EMOJI, THEME_EMOJI_EXTRA, genDesc, genTitle, hashtagPool } from "../data";
import { LANGS, T, translate, dilSaukle, type Lang } from "../i18n";
import { setLegalTabAçıcı, type LegalTab } from "../legalTabs";
import type { DebugGuideMessage } from "../debugGuide";
import type { SelectedAyah } from "../types";
import type { LibraryType, Emotion } from "../dualar";
import { uyariAcilisiBagla } from "./telifUyariAkisi";
import { useSearchResults } from "./useSearchResults";
import { useMedyaYukleme } from "./useMedyaYukleme";
import { useAuth } from "./useAuth";
import { useWallet } from "./useWallet";
import { useTier } from "./useTier";
import { useBan } from "./useBan";
import { usePaymentFlow } from "./usePaymentFlow";
import { useAudioPreview } from "./useAudioPreview";
import { useKendiSesiniYukle } from "./useKendiSes";
import { usePrayerTime } from "./usePrayerTime";
import { useDailyAyah } from "./useDailyAyah";
import { useOutputKalici } from "./useOutputKalici";
import { useVideoTasarimAyarlar } from "./useVideoTasarimAyarlar";
import { useOnayPencereleri } from "./useOnayPencereleri";
import { useDilSenkron } from "./useDilSenkron";

/** StudioApp'ın çekirdek durum kancası — parçalama turu (25.10). */
import { ALL_CLIPS } from "../clips";
import { QURAN_CLIPS } from "../clips-r2";
import { dimensions } from "./studioHelpers";
import { JETON } from "../tierCompat";
import { ensureImageYukle, ensureVideoYukle } from "./medyaOnYukleme";
import { isR2Media, getVideoUrlSync, getVideoUrl, getPosterUrl } from "../videoUrl";
import type { Mode, Aspect, ModalName } from "../types";
export function useStudioCekirdek({ developerMaster }: { developerMaster: boolean }) {
  const durationWarnRef = useRef<{ key: string; at: number }>({ key: "", at: 0 });
  const [adminGodMode, setAdminGodMode] = useState(() => false);  // ★ Sunucudan gelen isAdmin'e güven, localStorage'a değil
  const [maintenance, setMaintenance] = useState<MaintenanceConfig>(() => getSystemConfig().maintenance!);
  const isDevMaster = Boolean((import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV && developerMaster);
  const [isMasterSürüm, setIsMasterSürüm] = useState(isDevMaster || adminGodMode);

  // ★ adminGodMode değiştiğinde isMasterSürüm'ü senkronize et
  useEffect(() => {
    if (!isDevMaster) {
      setIsMasterSürüm(adminGodMode);
      if (!adminGodMode) localStorage.removeItem("nur_admin_session");
    }
  }, [adminGodMode, isDevMaster]);

  // Toast (erkenden tanımlı çünkü hook'lar buna ihtiyaç duyuyor)
  const [toast, setToast] = useState<string | null>(null);
  const notify = useCallback((message: string) => setToast(message), []);

  // ★ Cookie Consent — yeni KVKK component'i tarafından yönetiliyor

  // ★ TELİF UYARI DEVAMI (SRP tur 4, 16.10): eski telifTetik/effect çifti
  //   modül-düzeyi telifUyariAkisi ile değiştirildi. Üretim motoru uyarı gerektiğinde
  //   uyariAc() abonesini çağırır; TelifDisclaimer "Anladım" basılınca bekleyenDevamiYurut()
  //   son handleGenerate'i tekrar çağırır.
  const [telifUyariAcik, setTelifUyariAcik] = useState(false);
  useEffect(() => uyariAcilisiBagla(() => setTelifUyariAcik(true)), []);

  // ★ SRP PARÇALAMA TUR 3 (16.10): üretim-onay + telif-risk-onay pencereleri
  //   useOnayPencereleri hook'unda — birebir aynı davranış.
  const { genConfirmOpen, genConfirmData, showGenerateConfirm, handleGenConfirm, riskOnayData, showRiskOnay, handleRiskOnay } = useOnayPencereleri();

  // Hook'lara gereken state'ler (yukarıda tanımlı olmalı)
  // ★ 22.10 CANLI-DİL FIX: bazı bileşenler (StudioHeroSection, AnnouncementBar…)
  //   dil okumayı `nur_lang` localStorage'dan yapar; düz setState ile localStorage
  //   efekttren sonra yazılıyor → dil değişimi ancak sayfa yenilenince uygulanıyordu.
  //   setLang artık localStorage'ı SENKRON yazar (render anında okunabilmesi için)
  //   ve `nur_lang_degisti` olayı bildirir — dinleyen bileşenler anında çevrilir.
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem("nur_lang");
    if (saved && LANGS.some((item) => item.code === saved)) return saved as Lang;
    // ★ ENDONEZYA ODAĞI (madde 5, 02.10): dil tercihi kayıtsızsa tarayıcı diline bak —
    //   Endonezce/Arapça/Urduca/İngilizce gelen kendi dilinde karşılanır (çeviriler hazır).
    //   Tespit edilen dil ilk render'da nur_lang'e yazılır → sonraki girişlerde kalıcı olur;
    //   kullanıcı farklı dil seçerse seçimi ezberin üstüne geçer.
    try {
      const diller = [navigator.language, ...(navigator.languages ?? [])].filter(Boolean);
      for (const ham of diller) {
        const kod = (ham || "").slice(0, 2).toLowerCase();
        if (kod === "id") return "id";
        if (kod === "ar") return "ar";
        if (kod === "ur") return "ur";
        if (kod === "en") return "en";
        if (kod === "tr") return "tr";
      }
    } catch { /* yut */ }
    return "tr";
  });
  // ★ Tema HESABA ÖZEL (aşağıda user tanımlandıktan sonra hesap anahtarına bağlanır)
  const [themeId, setThemeId] = useState(() => localStorage.getItem("nur_theme") || "nur");
  const [query, setQuery] = useState("");
  // ★ Arama sonuçları ortak hook'ta (kendi kendine gecikmeli istek + Türkçe sadeleştirme)
  const { results, searching } = useSearchResults(query, lang);
  // ★ Açılışta hiçbir sure/ayet seçili olmasın — kullanıcı kendisi seçsin
  // ★ Sure seçici "1" (Fâtiha) ile başlar — dropdown'da Fatiha görünüyorsa state de gerçekten Fatiha olsun.
  //   Eskiden "" ile başlıyordu: tarayıcı ilk seçeneği (Fatiha) GÖSTERİR ama state boş kalır,
  //   "Tüm Sure" basınca "Önce bir sure seç" uyarısı çıkıyordu (görünüş ↔ gerçek çelişkisi).
  const [surah, setSurah] = useState("1");
  const [ayah, setAyah] = useState("");
  const [selected, setSelected] = useState<SelectedAyah[]>([]);
  const [verseIndex, setVerseIndex] = useState(0);
  const [background, setBackground] = useState<Clip>(MOTION_CLIPS[0]);
  const [ayahBackgrounds, setAyahBackgrounds] = useState<Record<string, Clip>>({});
  const [pickingFor, setPickingFor] = useState<string | null>(null);
  // ★ KULLANICI MEDYASI (28.09): medya yükleyiciden eklenen video/resim/ses dosyaları
  //   IndexedDB'de KALICI saklanır; hook açılışta buraya Clip olarak yükler → atmosfer
  //   galerisinde "📁 Yüklediklerim" kategorisinde arka plan olarak seçilebilir.
  const { medyaClips, medyaArkaPlanYap, onMedyaSenkron } = useMedyaYukleme({
    notify, setBackground, setAyahBackgrounds, pickingFor, selected,
  });
  const [clipKind, setClipKind] = useState<"img" | "vid">("vid");
  const [atmosCategory, setAtmosCategory] = useState<CatId | "all">("all");
  const [atmosQuery, setAtmosQuery] = useState("");
  const [mode, setMode] = useState<Mode>("short");
  const [lockTip, setLockTip] = useState<string | null>(null);
  const [aspect, setAspect] = useState<Aspect>("9:16");
  const [batchFormats, setBatchFormats] = useState<Aspect[]>(["9:16"]);
  const [reciterId, setReciterId] = useState("maher"); // ★ Varsayılan: Maher el-Muaiqly (ömer tercihi)

  // ★ Hook'lar (state'lerden sonra çağrılır)
  const { user, setUser, loginTab, setLoginTab, phone, setPhone, verifyCode, setVerifyCode, sentCode, setSentCode, serverAdminVerified, setServerAdminVerified, adminEmailInput, setAdminEmailInput, adminCodeInput, setAdminCodeInput, adminError, setAdminError, adminAuthOpen, setAdminAuthOpen, openAdminDashboard, adminSonEmail, setAdminSonEmail } = useAuth({ isMasterSürüm, isDevMaster, notify });
  const { jetonCount, setJetonCount, syncWallet, consumeRight, packRights, subscriptionEndsAt, resetWallet } = useWallet(notify, user);
  const { tier, setTier, accessTier, premiumOpen, setPremiumOpen, premiumTab, setPremiumTab, openPremium, checkTier, tryUnlockElitFeature, tryUnlockFullMode } = useTier({ isMasterSürüm, notify, jetonCount, setJetonCount });
  // ★ TIER ÇİPİ DÜZELTMESİ (08.10): useAuth setCurrentTier ile secureStore'a yazıyordu ama
  //   React state'ini güncellemiyordu — üst bar çipi eski "Ücretsiz"te takılı kalıyordu.
  //   Hook sırası gereği setter parametreyle geçilemediği için event köprüsü kurulur.
  useEffect(() => {
    const handler = (e: Event) => {
      const t = (e as CustomEvent<Tier>).detail;
      if (t === "pro" || t === "elit" || t === "free") setTier(t);
    };
    window.addEventListener("nur_tier_state", handler);
    return () => window.removeEventListener("nur_tier_state", handler);
  }, [setTier]);
  const { localBanned, setLocalBanned, localBanReason, setLocalBanReason } = useBan({ user, isMasterSürüm, notify });
  usePaymentFlow({ setUser, setTier, syncWallet });

  // ★ Tema HESABA ÖZEL: anahtar email içerir — bir hesapta mavi seçince başka hesaba taşınmaz.
  //   Misafir için ortak anahtar; giriş yapınca o hesabın kayıtlı temasına otomatik geçilir.
  const themeKey = user?.email ? `nur_theme:${user.email.toLowerCase()}` : "nur_theme";
  useEffect(() => { setThemeId(localStorage.getItem(themeKey) || "nur"); }, [themeKey]);

  // ★ Admin modu ÇİFT KATMANLA (30.09): e-posta eşleşmesi TEK BAŞINA god mode
  //   vermez — /api/admin/session sunucu teyidi (HMAC + NUR_ADMIN_EMAILS +
  //   DB is_admin) gerekir. Sunucu "ok" derse admin modu açılır; istemci
  //   artık kendi kendine yetki veremez (VITE_ değişkeni herkese açık).
  useEffect(() => {
    if (!user?.email) return;
    if (isMasterSürüm) return; // zaten açık
    let live = true;
    (async () => {
      try {
        const r = await fetch("/api/admin/session", { cache: "no-store" });
        if (r.ok && live) {
          setAdminGodMode(true);
          setIsMasterSürüm(true);
          setServerAdminVerified(true);
          localStorage.setItem("nur_admin_session", "1");
          console.log("[admin] Sunucu teyidi geldi:", user.email, "→ sınırsız mod aktif");
        }
      } catch { /* offline: admin modu kaplı kalır — fail-closed */ }
    })();
    return () => { live = false; };
  }, [user?.email]);

  // ★ PremiumModal her açıldığında cüzdanı yenile
  useEffect(() => {
    if (premiumOpen) {
      syncWallet();
    }
  }, [premiumOpen]);

  // Tier senkronizasyonu — auth/me'den gelen tier React state'e yazilir
  // ★ KUL HAKKI (05.10): auth/me artık abonelik bitişini de hesaba katıyor
  //   (süresi dolmuşsa FREE döner) — buradaki senkron o düşüşü istemciye taşır.
  //   Ek güvence: cüzdandan gelen bitiş tarihi geçmişse istemci de kendini FREE'ye çeker
  //   (syncWallet 30 sn'de bir koşuyor; sunucu erişilemezse bile eski abone yeni gün kotası alamaz).
  useEffect(() => {
    if (!user) return;
    const dbTier = (user as any)?.tier as Tier | undefined;
    // ★ ADMIN DUYARLILIK (08.10): admin god mode'da accessTier=zaten "elit" —
    //   secureStore'daki admin tier'ı "Ücretsiz" dbTier ile EZİLMEsin
    //   (kullanıcı bildirimi: admin hesabında çip Ücretsiz'de takılıydı).
    if (user.isAdmin) {
      const adminTier: Tier = dbTier === "pro" || dbTier === "elit" ? dbTier : "elit";
      setTier(adminTier);
      return;
    }
    // ★ DENEME DUYARLILIK (08.10): auth/me abonelik yoksa "free" döner ama 7 günlük
    //   PRO denemesi aktifken etkin tier "pro"dur (getCurrentTier hesaplar) — çip
    //   "Ücretsiz"de takılıyordu, deneme hakkı görünmez oluyordu. React state'i
    //   her zaman ETKİN tier'a (db + deneme) çek.
    const hedef = getCurrentTier();
    if (hedef !== dbTier) console.log('[tier] Etkin senkron:', hedef, '(db:', dbTier, ')');
    setTier(hedef);
  }, [user]);

  // ★ Abonelik bitiş watch-dog'u: bitiş tarihi geçtiyse tier'ı FREE'ye indir
  useEffect(() => {
    if (!subscriptionEndsAt) return;
    const end = Date.parse(subscriptionEndsAt);
    if (!Number.isFinite(end)) return;
    const kontrol = () => {
      if (Date.now() > end && getCurrentTier() !== "free") {
        setTier("free");
        console.log('[tier] Abonelik süresi doldu → FREE');
        notify(translate(lang, "abonelikBittiFree"));
      }
    };
    kontrol();
    const iv = window.setInterval(kontrol, 60_000);
    return () => window.clearInterval(iv);
  }, [subscriptionEndsAt]);

  const { previewPlaying, setPreviewPlaying, previewTime, setPreviewTime, previewDuration, setPreviewDuration, silenceAllAudio, reciter: audioReciter } = useAudioPreview({ selected, verseIndex, setVerseIndex, reciterId, notify });
  // ★ KENDİ SESİNİ YÜKLE (30.09) — ELİT özelliği: kullanıcının kendi okuyuşuyla
  //   milisanielik ayet senkronu (sessizlik-sınırı algılama; sesZamanlama.ts)
  const { aktif: kendiSesAktif, yukleniyor: kendiSesYukleniyor, kayitlar: kendiSesKayitlari, yukle: kendiSesYukle, yukleAyetAyri: kendiSesYukleAyetAyri, sec: kendiSesSec, sil: kendiSesSil, zamanlamaKaydet: kendiSesZamanlamaKaydet, kaldirAktif: kendiSesKaldir, yenidenTara: kendiSesYenidenTara } = useKendiSesiniYukle({ notify });
  // ★ 23.10: modalın sn sınırı — tarama ve üretim aynı sınırı kullanır (0 = mod sınırı)
  const [kendiSesMaksSn, setKendiSesMaksSn] = useState(0);
  const { prayerCity, setPrayerCity, prayerSearch, setPrayerSearch, prayerTimings } = usePrayerTime();
  const { dailyPool, dailyIndex, dailyPaused, daily } = useDailyAyah({ lang, setSelected });

  const [previewMaximized, setPreviewMaximized] = useState(false);
  const previewWidth = useMemo(() => {
    // Büyütme efekti scale() ile yapılıyor; genişlik sabit kalır
    return aspect === "9:16" ? 300 : aspect === "4:5" ? 340 : aspect === "1:1" ? 380 : 500;
  }, [aspect]);

  const renderQuality = useMemo(() => {
    const nav = navigator as Navigator & { deviceMemory?: number };
    const memory = nav.deviceMemory ?? 8;
    const cores = navigator.hardwareConcurrency ?? 8;
    const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const low = mobile || memory <= 4 || cores <= 4;
    const mid = !low && (memory <= 6 || cores <= 6);
    return {
      low,
      previewFps: mobile ? 20 : low ? 24 : mid ? 30 : 30, // Mobilde daha düşük FPS
      // ★ Daha stabil render: 60fps/24Mbps WebM bazı cihazlarda donuk video üretir.
      renderFps: mobile ? 20 : low ? 24 : mid ? 30 : 30,
      bitrateScale: mobile ? 0.28 : low ? 0.38 : mid ? 0.55 : 0.62,
      audioBitrate: mobile ? 96_000 : low ? 128_000 : 160_000,
    };
  }, []);

  // ★ SRP PARÇALAMA TUR 3 (16.10): video tasarım ayarları useVideoTasarimAyarlar hook'unda —
  //   font/boyut/ışıltı/marka/bant/mesaj/cinematic/göster-gizle — birebir aynı davranış.
  const {
    ARABIC_FONTS, arabicFont, setArabicFont, arabicFontCss, arabicFontW,
    textSize, setTextSize, textSizeMul, textSizeFine, setTextSizeMul,
    mealSizeFine, setMealSizeMul,
    SHIMMER_STYLES, shimmerStyle, setShimmerStyle, shimmerCfg,
    shimmerIntensity, setShimmerIntensity,
    cardBg, setCardBg,
    brandSignature, setBrandSignature, brandPos, setBrandPos, brandOn, setBrandOn,
    cubukAyar, setCubukAyar, mesajAyar, setMesajAyar,
    CINE_FILTERS, cinematic, setCinematic, cineFilter,
    showArapca, setShowArapca, showSubMeal, setShowSubMeal,
  } = useVideoTasarimAyarlar(notify);
  const [textOffset, setTextOffset] = useState({ x: 0, y: 0 });

  const [libType, setLibType] = useState<LibraryType | "tumu">("tumu");
  const [libEmotion, setLibEmotion] = useState<Emotion | "tum">("tum");
  const [libSearch, setLibSearch] = useState("");
  const [previewReciterId, setPreviewReciterId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const { outputs, setOutputs, restoreStoredOutputs } = useOutputKalici();
  // ★ AÇILIŞTA GERİ YÜKLEME: IndexedDB'deki videolar outputs'a geri gelir.
  useEffect(() => restoreStoredOutputs(), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [activeOutputId, setActiveOutputId] = useState<string | null>(null);

  // ★ 03.10 (5 dil): paylaşım başlığı/açıklaması/hashtag başlangıcı seçili dilde üretilir
  const [shareTitle, setShareTitle] = useState(() => genTitle(undefined, 2, 255, lang));
  const [shareDescription, setShareDescription] = useState(() => genDesc(undefined, 2, 255, undefined, lang));
  const pickRandomTags = useCallback((count = 14, avoid?: string[]) => {
    const shuffled = [...hashtagPool(lang)].sort(() => Math.random() - 0.5);
    const filtered = avoid?.length ? shuffled.filter((t) => !avoid.includes(t)) : shuffled;
    const pool = filtered.length >= count ? filtered : shuffled;
    return pool.slice(0, count);
  }, [lang]);
  const [visibleTags, setVisibleTags] = useState<string[]>(() => pickRandomTags(14));
  // copied → useShareActions hook'unda
  // dailyPool, dailyIndex, dailyPaused → useDailyAyah hook'unda
  // prayerCity, prayerSearch, prayerTimings → usePrayerTime hook'unda
  const [now, setNow] = useState(new Date());
  const [menuOpen, setMenuOpen] = useState(false);
  // ★ 20.10 MINI TUR menü açma köprüsü (kullanıcı emri: "sol paneli açsın, ilgili
  //   seçeneği göstersin"): MiniTur menü-ici durağa gelince event basar (araclar,
  //   hafizlik-testi), burada sol panel açılır — tur item'ı madalyonla gösterir.
  useEffect(() => {
    const minorMenuAc = () => setMenuOpen(true);
    window.addEventListener("nur_minitur_menu_ac", minorMenuAc);
    return () => window.removeEventListener("nur_minitur_menu_ac", minorMenuAc);
  }, []);
  const [roadmapOpen, setRoadmapOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [modal, setModal] = useState<ModalName>(null);
  // ★ İş 5: Linkten gelen davet kodu (?davet=KOD) — giriş yapınca DavetModal otomatik kullanır
  const [bekleyenDavetKodu, setBekleyenDavetKodu] = useState<string | null>(() => {
    try {
      const m = new URLSearchParams(window.location.search).get("davet");
      if (m && /^[A-Z0-9]{4,12}$/i.test(m)) return m.toUpperCase();
    } catch { /* SSR/güvenli mod */ }
    return null;
  });
  useEffect(() => {
    if (!bekleyenDavetKodu) return;
    try { window.history.replaceState({}, "", window.location.pathname); } catch { /* ignore */ }
  }, [bekleyenDavetKodu]);
  const [tosOpen, setTosOpen] = useState(false);
  // localBanned, localBanReason → useBan hook'unda

  // Ban cleanup → useBan hook'unda

  const [legalTab, setLegalTab] = useState<LegalTab>("tos");
  // ★ YASAL SEKME KÖPRÜSÜ — çerez banner'ı ve diğer bağımsız bileşenler
  //   LegalModal'ı buradan açar (KVKK m.10: aydınlatmaya kolay erişim şartı)
  useEffect(() => {
    setLegalTabAçıcı((tab) => { setLegalTab(tab); setTosOpen(true); });
  }, []);
  const [debugGuideModal, setDebugGuideModal] = useState<DebugGuideMessage | null>(null);
  const [tosAccepted, setTosAccepted] = useState(false);
  const [contactType, setContactType] = useState<"oneri" | "sikayet">("oneri");
  const [contactMessage, setContactMessage] = useState("");
  const [hoveredClip, setHoveredClip] = useState<string | null>(null);

  const [smartAiEnabled, setSmartAiEnabled] = useState(false);
  const [aiTooltipHover, setAiTooltipHover] = useState(false);

  // tier, accessTier, premiumOpen, premiumTab → useTier hook'unda
  const [fullUnlockConfirmOpen, setFullUnlockConfirmOpen] = useState(false);
  // serverAdminVerified, adminEmailInput, adminCodeInput, adminError, adminAuthOpen → useAuth hook'unda
  // jetonCount, setJetonCount → useWallet hook'unda

  // openPremium, checkTier → useTier hook'unda

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const verseAudioRef = useRef<HTMLAudioElement | null>(null);
  const reciterPreviewRef = useRef<HTMLAudioElement | null>(null);
  const previewTimerRef = useRef<number>(0);
  const stopGenerationRef = useRef<() => void>(() => undefined);
  const lastTitleRef = useRef<string>("");
  const lastDescRef = useRef<string>("");
  const selectedRef = useRef(selected), verseIndexRef = useRef(verseIndex), backgroundRef = useRef(background);
  const ayahBackgroundsRef = useRef(ayahBackgrounds), aspectRef = useRef(aspect), themeRef = useRef(THEMES[0]);
  const clipKindRef = useRef(clipKind); clipKindRef.current = clipKind;
  const smartAiEnabledRef = useRef(smartAiEnabled); smartAiEnabledRef.current = smartAiEnabled;
  const isClipAccessibleRef = useRef<(clip: Clip) => boolean>(() => true);
  useEffect(() => { ayahBackgroundsRef.current = ayahBackgrounds; }, [ayahBackgrounds]);
  useEffect(() => { selectedRef.current = selected; }, [selected]);
  useEffect(() => { verseIndexRef.current = verseIndex; }, [verseIndex]);
  useEffect(() => { backgroundRef.current = background; }, [background]);
  const imageCache = useRef(new Map<string, HTMLImageElement>()), videoCache = useRef(new Map<string, HTMLVideoElement>());
  // ★ Render sırasında videonun donmasını engelleyen canlılık izleyicisi (watchdog)
  const videoWatchdog = useRef(new Map<HTMLVideoElement, { t: number; at: number }>());

  const combinedAllClips = useMemo(
    () => [...medyaClips, ...ALL_CLIPS, ...QURAN_CLIPS],
    [medyaClips]
  );

  const ALL_THEMES = useMemo(() => [...THEMES, ...EXTRA_THEMES], []);
  const theme = ALL_THEMES.find((item) => item.id === themeId) ?? ALL_THEMES[0];
  const themeEmoji = (id: string) => THEME_EMOJI[id] ?? THEME_EMOJI_EXTRA[id] ?? "✦";
  const themeTier = (id: string): Tier => THEME_TIER[id] ?? "free";
  void themeEmoji; void themeTier;

  const sortedReciters = useMemo(() => {
    return [...RECITERS].sort((a, b) => {
      const aLocked = reciterRequiredTier(a) !== "free" && !tierAtLeast(accessTier, reciterRequiredTier(a));
      const bLocked = reciterRequiredTier(b) !== "free" && !tierAtLeast(accessTier, reciterRequiredTier(b));
      if (aLocked !== bLocked) return aLocked ? 1 : -1;
      if (!aLocked && a.id === "alfaqih") return -1;
      if (!bLocked && b.id === "alfaqih") return 1;
      const riskDiff = a.telifRiski - b.telifRiski;
      if (riskDiff !== 0) return riskDiff;
      const ta = RECITER_SES_TARZI[a.id] ?? "orta";
      const tb = RECITER_SES_TARZI[b.id] ?? "orta";
      return SES_TARZI_ORDER[ta] - SES_TARZI_ORDER[tb];
    });
  }, [accessTier]);

  const reciter = RECITERS.find((item) => item.id === reciterId) ?? RECITERS[0];

  const activeOutput = outputs.find((output) => output.id === activeOutputId) ?? outputs[0] ?? null;
  const t = (key: keyof (typeof T)["tr"]) => T[lang][key] ?? T.tr[key];

  // openAdminDashboard → useAuth hook'unda  const [, setMicroUnlockTick] = useState(0);




  useEffect(() => {
    if (generating) return;
    aspectRef.current = aspect;
    const cv = canvasRef.current;
    if (cv) {
      const [w, h] = dimensions(aspect);
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    }
  }, [aspect, generating]);

  // ★ ENGELLEYİCİ: Üretim (render) sırasında sayfanın kapatılmasını/yenilenmesini engelle
  useEffect(() => {
    if (!generating) return;
    const preventClose = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Video üretimi devam ediyor. Sekmeyi kapatırsanız üretim yarıda kesilir ve jetonunuz boşa gidebilir.";
      return e.returnValue;
    };
    window.addEventListener("beforeunload", preventClose);
    return () => window.removeEventListener("beforeunload", preventClose);
  }, [generating]);

  useEffect(() => { themeRef.current = theme; const style = document.documentElement.style; style.setProperty("--accent", theme.acc); style.setProperty("--accent-2", theme.acc2); style.setProperty("--page", theme.bg); style.setProperty("--page-2", theme.bg2); style.setProperty("--text", theme.txt); localStorage.setItem(themeKey, theme.id); }, [theme, themeKey]);
  useEffect(() => { localStorage.setItem("nur_lang", lang); const current = LANGS.find((item) => item.code === lang); document.documentElement.lang = lang; document.documentElement.dir = current?.dir ?? "ltr"; }, [lang]);
  /** ★ 22.10: dil güncelleyici — localStorage senkron + olay bildirimi (yukarıdaki not).
   *  ★ 22.10 LAZY-DICT FIX: sözlükler lazy — dili değiştirirken hedef dil sözlüğü
   *  hâlâ boşsa translate() TR'ye düşüyor (hero AR'da Türkçe kaliyordu).
   *  Önce hedef dil sözlüğünü kur, sonra state+olay tetikle. */
  const setLang = useCallback((value: Lang) => {
    try {
      localStorage.setItem("nur_lang", value);
      const current = LANGS.find((item) => item.code === value);
      document.documentElement.lang = value;
      document.documentElement.dir = current?.dir ?? "ltr";
    } catch { /* localStorage kapalı — state yine güncellenir */ }
    void dilSaukle(value).then(() => {
      setLangState(value);
      window.dispatchEvent(new Event("nur_lang_degisti"));
    });
  }, []);
  // ★ DİL SENKRON EFEKTLERİ — useDilSenkron hook'unda (SRP adım 11, 09.10 2. tur):
  //   meal-dil senkronu + paylaşım metni dili + RTL mirror — birebir aynı davranış.
  useDilSenkron({
    lang, notify, t,
    selectedRef, setSelected,
    reciterName: reciter.name,
    setShareTitle, setShareDescription, setVisibleTags,
    verseIndexRef, pickRandomTags,
  });
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(null), 2400); return () => window.clearTimeout(timer); }, [toast]);
  useEffect(() => { const interval = window.setInterval(() => setNow(new Date()), 1000); return () => window.clearInterval(interval); }, []);
  useEffect(() => {
    const refreshMaintenance = () => setMaintenance(getSystemConfig().maintenance!);
    window.addEventListener("nur_config_updated", refreshMaintenance);
    // ★ CROSS-TAB: admin başka sekmede kilit/bakım değiştirdiğinde secureStore'un
    //   localStorage'ına yazılır → 'storage' event'i bu sekmede de tetiklenir → anında güncellenir
    const onStorage = (e: StorageEvent) => { if (e.key && e.key.includes("nur_system_sync_config")) refreshMaintenance(); };
    window.addEventListener("storage", onStorage);
    return () => { window.removeEventListener("nur_config_updated", refreshMaintenance); window.removeEventListener("storage", onStorage); };
  }, []);

  useEffect(() => {
    if (window.location.pathname === ADMIN_SECRET_PATH) setAdminAuthOpen(true);
  }, []);

  // ★ Ücretsiz ziyaretçi analitiği — tek seferlik, gizlilik dostu (IP hash'lenir)
  useEffect(() => {
    try {
      if (sessionStorage.getItem("nur_pageview_sent")) return;
      sessionStorage.setItem("nur_pageview_sent", "1");
      const payload = JSON.stringify({
        path: window.location.pathname || "/",
        referrer: document.referrer || "",
        screen: `${window.screen.width}x${window.screen.height}`,
        lang: navigator.language || "",
      });
      if (typeof navigator.sendBeacon === "function") {
        navigator.sendBeacon("/api/analytics/track", new Blob([payload], { type: "application/json" }));
      } else {
        fetch("/api/analytics/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true }).catch(() => undefined);
      }
    } catch { /* analitik asla uygulamayı bozmaz */ }
  }, []);

  useEffect(() => {
    if (selected.length === 0) { if (verseIndex !== 0) setVerseIndex(0); return; }
    if (verseIndex >= selected.length) setVerseIndex(selected.length - 1);
  }, [selected.length, verseIndex]);

  // ★ Süre modu aşımı erken uyarısı: Ayet yarım kesilmez; seçilen modun sığdıracağı
  //   son tam ayetten sonrası otomatik bırakılır. Kullanıcı bunu seçim anında görür.
  useEffect(() => {
    if (selected.length < 2) return;
    const cap = mode === "short" ? 59 : mode === "long" ? 600 : JETON.TAM_SURUM_CAP_SANIYE;
    const estimateAyahSeconds = (item: SelectedAyah) => {
      if (!item.tr || !item.ar) return 4;
      if (item.s === 0) return Math.max(4, Math.min(22, item.tr.length * 0.055));
      const arClean = item.ar.replace(/[\u064B-\u065F\u0670]/g, "");
      return Math.max(3.2, Math.min(34, arClean.length * 0.105 + item.tr.length * 0.012 + 0.8));
    };
    const durations = selected.map(estimateAyahSeconds);
    const total = durations.reduce((sum, d) => sum + d + 0.03, 0);
    if (total <= cap) return;
    let fitCount = 0;
    let acc = 0;
    for (const dur of durations) {
      if (fitCount > 0 && acc + dur > cap) break;
      acc += dur + 0.03;
      fitCount += 1;
    }
    const modeLabel = mode === "short" ? "Kısa (59 sn)" : mode === "long" ? "Uzun (600 sn)" : "Tam Sürüm (120 dk)";
    const key = `${mode}-${selected.length}-${fitCount}-${Math.round(total)}`;
    const nowMs = Date.now();
    if (durationWarnRef.current.key === key || nowMs - durationWarnRef.current.at < 6500) return;
    durationWarnRef.current = { key, at: nowMs };
    notify(`⚠️ ${modeLabel} süresi seçili ayetlere yetmiyor · ayet yarım kalmasın diye yaklaşık ilk ${fitCount} ayet alınır, sonrası bırakılır`);
  }, [selected, mode, notify]);

  const ensureImage = useCallback((url: string) => ensureImageYukle(imageCache, url), []);
  const ensureVideo = useCallback((url: string, fallbackUrl?: string) => ensureVideoYukle(videoCache, url, fallbackUrl), []);

  // ★ SEÇİLEN ATMOSFERİ ANINDA HAZIRLA: R2 klipler imza korumalı, canvas imzalı adresi
  //   senkron okuyor. Seçim anında imza yoksa tuvale poster/kaleydoskop düşüyor, video
  //   "geç" yansıyordu. Artık seçilince imza arka planda alınır ve video önceden ısıtılır.
  // ★ ÖNCELİK: seçili arka plan (background) imzası kuyruğun ÖnÜNE alınır — galerinin
  //   diğer 15+ klibinin arkasında beklemez. Ayet atamaları normal sıradan devam eder.
  useEffect(() => {
    const candidates = [background, ...Object.values(ayahBackgrounds)];
    for (const clip of candidates) {
      if (!clip || clip.kind !== "vid" || !isR2Media(clip)) continue;
      const isPrimary = clip === background;
      const cached = getVideoUrlSync(clip);
      if (cached) { ensureVideo(cached, isR2Media(clip) ? undefined : clip.src); continue; }
      getVideoUrl(clip, isPrimary)
        .then((url) => { if (url) ensureVideo(url, clip.src); })
        .catch(() => undefined);
      void getPosterUrl(clip).catch(() => undefined);
    }
  }, [background, ayahBackgrounds, ensureVideo]);
  return {
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
    setLang, toast, setToast,
    now, menuOpen, setMenuOpen, roadmapOpen, setRoadmapOpen, langOpen, setLangOpen, modal, setModal,
    bekleyenDavetKodu, tosOpen, setTosOpen, legalTab, setLegalTab, debugGuideModal, setDebugGuideModal,
    tosAccepted, setTosAccepted, contactType, setContactType, contactMessage, setContactMessage,
    hoveredClip, setHoveredClip, smartAiEnabled, setSmartAiEnabled, aiTooltipHover, setAiTooltipHover,
    fullUnlockConfirmOpen, setFullUnlockConfirmOpen,
    lastTitleRef, lastDescRef, canvasRef, verseAudioRef, reciterPreviewRef, previewTimerRef, stopGenerationRef,
    selectedRef, verseIndexRef, backgroundRef, ayahBackgroundsRef, aspectRef, themeRef, clipKindRef, smartAiEnabledRef,
    isClipAccessibleRef, imageCache, videoCache, videoWatchdog, ensureImage, ensureVideo,
    combinedAllClips, sortedReciters, reciter, activeOutput, t,
    ALL_THEMES, themeTier, themeEmoji,
  };
}
