import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X, AlertTriangle, Ban, BookOpen } from "lucide-react";
import { StudioHeroSection } from "./studio/StudioHeroSection";
import {
  CATEGORY_ICONS, DEFAULT_MASTER_SURUM, RENDER_AUTH_LIVE, SERVER_BAN_LIVE,
  MODES, ASPECTS, KEYWORD_CATEGORY_FALLBACK, SURAH_CATEGORY_HINT,
  ARABIC_FONTS as _ARABIC_FONTS, SHIMMER_STYLES as _SHIMMER_STYLES, CINE_FILTERS as _CINE_FILTERS,
} from "./studio/studioConstants";
import { useCanvasDraw } from "./studio/useCanvasDraw";
import { detectCategoryFromAyahText } from "./studio/detectCategoryFromAyah";
import { useMediaCache } from "./studio/useMediaCache";
import { useAudioSilence } from "./studio/useAudioSilence";
import { useMicroUnlocks } from "./studio/useMicroUnlocks";
import { useGuestTrial } from "./studio/useGuestTrial";
import { useRenderQuality } from "./studio/useRenderQuality";
import { useDocumentLanguage, useDocumentTheme } from "./studio/useDocumentPreferences";
import { useAuthSession } from "./studio/useAuthSession";
import { useSecurityGuards } from "./studio/useSecurityGuards";
import { useVerseAudioPlayback } from "./studio/useVerseAudioPlayback";
import { useReciterPreview } from "./studio/useReciterPreview";
import { useVideoGenerator } from "./studio/useVideoGenerator";
import { useManualAuthActions } from "./studio/useManualAuthActions";
import { usePrayerTimes } from "./studio/usePrayerTimes";
import { useSearchResults } from "./studio/useSearchResults";
void _ARABIC_FONTS; void _SHIMMER_STYLES; void _CINE_FILTERS;
import {
  fmtDuration, fmtSize, dimensions,
  formatRemaining, fetchJSON, fetchAyah, fetchSurah,
} from "./studio/studioHelpers";
import { QURAN_CLIPS } from "./clips-r2";
import {
  ACTIVE_CATEGORIES,
  ALL_CLIPS,
  CATEGORIES,
  MOTION_CLIPS,
  TEMPLATE_CLIPS,
  KATEGORI_TIER,
  FREE_VIDEOS_PER_CATEGORY,
  CATEGORY_PALETTE,
  type CatId,
  type Clip,
  } from "./clips";
import {
  DAILY_AYAHS,
  genDesc,
  genTitle,
  HASHTAG_POOL,
  MEAL_FIXES,
  SURAHS,
  THEMES,
  THEME_EMOJI,
  EXTRA_THEMES,
  THEME_TIER,
  THEME_EMOJI_EXTRA,
} from "./data";
import { LANGS, MEAL_EDITIONS, T, type Lang } from "./i18n";
import { RECITERS, RECITER_SES_TARZI, SES_TARZI_ORDER } from "./reciters";
import { LIBRARY_ITEMS, type LibraryItem, type LibraryType, type Emotion } from "./dualar";
import { HeaderTopBar } from "./components/HeaderTopBar";
import { AyahLibraryPanel } from "./components/AyahLibraryPanel";
import { VideoPreviewSection } from "./components/VideoPreviewSection";
import { DesignSettingsPanel } from "./components/DesignSettingsPanel";
import { SocialSharePanel } from "./components/SocialSharePanel";
import { ModalsContainer } from "./components/ModalsContainer";
import { AnnouncementBar } from "./components/AnnouncementBar";
import {
  getCurrentTier, setCurrentTier, tierAtLeast, isFeatureUnlocked, featureLockLabel,
  isAdminEmail, ADMIN_SECRET_PATH, ALLOWED_ADMIN_EMAILS,
  JETON, isFriday, isRamadan, reciterRequiredTier, jetonTavani, videoMaliyeti,
  hasMicroUnlock, getJeton,
  addPurchasedJeton, addDailySubJeton,
  type Tier,
} from "./tier";
import { secureGet, secureSet } from "./secureStore";
import { serverDateISO, serverIsFriday, isDeviceClockTampered, syncServerTime } from "./serverTime";
import { getPosterUrlSync } from "./videoUrl";
import { onErrorCaptured, type DebugGuideMessage } from "./debugGuide";
import type { SelectedAyah, Output, DailyAyah, User, Mode, Aspect, ModalName, LoginTab } from "./types";

void SES_TARZI_ORDER; void isFeatureUnlocked; void featureLockLabel; void ALLOWED_ADMIN_EMAILS; void isAdminEmail; void setCurrentTier; void tierAtLeast; void isRamadan; void isFriday; void JETON; void ADMIN_SECRET_PATH;
void KATEGORI_TIER; void FREE_VIDEOS_PER_CATEGORY;
const PRO_TOTAL_ATMOS = 350;
// Sabitler studioConstants.ts'e, yardımcılar studioHelpers.ts'e taşındı

// Tüm sabitler + yardımcılar dış dosyalara taşındı (studio/)

export default function StudioApp({ isMasterSürüm: developerMaster = DEFAULT_MASTER_SURUM }: { isMasterSürüm?: boolean }) {
  const [adminGodMode, setAdminGodMode] = useState(false);
  // ★ GOD MODE GÜVENLİĞİ
  // App.tsx'teki geliştirici bayrağı yalnızca localhost/dev modunda geçerlidir.
  // Production build'de God Mode sadece /admin doğrulaması sonrası oturum belleğinde açılır.
  const isDevMaster = Boolean((import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV && developerMaster);
  const isMasterSürüm = isDevMaster || adminGodMode;
  const [loginTab, setLoginTab] = useState<LoginTab>("login");
  const [_showGiftModalUnused, _setShowGiftModalUnused] = useState(false);
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("nur_user");
    return stored ? JSON.parse(stored) : null;
  });

  const [phone, setPhone] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [sentCode, setSentCode] = useState("");
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem("nur_lang") as Lang) || "tr");
  const [themeId, setThemeId] = useState(() => localStorage.getItem("nur_theme") || "nur");
  const [query, setQuery] = useState("");
  const { results, searching } = useSearchResults(query, lang);
  const [surah, setSurah] = useState("1");
  const [ayah, setAyah] = useState("1");
  const [selected, setSelected] = useState<SelectedAyah[]>([]);
  const [verseIndex, setVerseIndex] = useState(0);
  const [background, setBackground] = useState<Clip>(MOTION_CLIPS[0]);
  const [ayahBackgrounds, setAyahBackgrounds] = useState<Record<string, Clip>>({});
  const [clipKind, setClipKind] = useState<"img" | "vid">("vid");
  const [atmosCategory, setAtmosCategory] = useState<CatId | "all">(ACTIVE_CATEGORIES[0]);
  const [atmosQuery, setAtmosQuery] = useState("");
  const [pickingFor, setPickingFor] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("short");
  const [lockTip, setLockTip] = useState<string | null>(null);
  const [aspect, setAspect] = useState<Aspect>("9:16");
  const [batchFormats, setBatchFormats] = useState<Aspect[]>(["9:16"]);
  const [reciterId, setReciterId] = useState("sudais");
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [previewTime, setPreviewTime] = useState(0);
  const [previewDuration, setPreviewDuration] = useState(0);

  const [previewMaximized, setPreviewMaximized] = useState(false);
  const previewWidth = useMemo(() => {
    // Büyütme efekti scale() ile yapılıyor; genişlik sabit kalır
    return aspect === "9:16" ? 300 : aspect === "4:5" ? 340 : aspect === "1:1" ? 380 : 500;
  }, [aspect]);

  const renderQuality = useRenderQuality();

  const ARABIC_FONTS = _ARABIC_FONTS;
  const [arabicFont, setArabicFont] = useState("amiri");
  const [textSize, setTextSize] = useState<"kucuk" | "normal" | "buyuk">("buyuk");

  const SHIMMER_STYLES = _SHIMMER_STYLES;
  const [shimmerStyle, setShimmerStyle] = useState("altin");
  const shimmerCfg = SHIMMER_STYLES.find((s) => s.id === shimmerStyle) ?? SHIMMER_STYLES[0];
  const [cardBg, setCardBg] = useState<"seffaf" | "koyu">("seffaf");
  // ★ ADMİNE ÖZEL: Videoda sol altta görünecek marka / kanal imzası
  const [brandSignature, setBrandSignature] = useState<string>(() => {
    try { return localStorage.getItem("nur_brand_signature") ?? "@nurstudyo"; } catch { return "@nurstudyo"; }
  });
  useEffect(() => {
    try { localStorage.setItem("nur_brand_signature", brandSignature); } catch { /* ignore */ }
  }, [brandSignature]);
  // ★ İmza konumu — varsayılan SOL ÜST (altta meal yazısıyla çakışmasın)
  const [brandPos, setBrandPos] = useState<"sol-ust" | "sag-ust" | "sol-alt" | "sag-alt">(() => {
    try { return (localStorage.getItem("nur_brand_pos") as any) ?? "sol-ust"; } catch { return "sol-ust"; }
  });
  useEffect(() => {
    try { localStorage.setItem("nur_brand_pos", brandPos); } catch { /* ignore */ }
  }, [brandPos]);
  const [textOffset, setTextOffset] = useState({ x: 0, y: 0 });
  const arabicFontCss = ARABIC_FONTS.find((f) => f.id === arabicFont)?.css ?? "Amiri, serif";
  const textSizeMul = textSize === "buyuk" ? 1.15 : textSize === "kucuk" ? 0.85 : 1;

  const CINE_FILTERS = _CINE_FILTERS;
  const [cinematic, setCinematic] = useState("orijinal");
  const cineFilter = CINE_FILTERS.find((f) => f.id === cinematic) ?? CINE_FILTERS[0];

  const [libType, setLibType] = useState<LibraryType | "tumu">("tumu");
  const [libEmotion, setLibEmotion] = useState<Emotion | "tum">("tum");
  const [libSearch, setLibSearch] = useState("");
  const [previewReciterId, setPreviewReciterId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outputs, setOutputs] = useState<Output[]>([]);
  const [activeOutputId, setActiveOutputId] = useState<string | null>(null);

  const [showArapca, setShowArapca] = useState(true);
  const [showSubMeal, setShowSubMeal] = useState(true);

  const [shareTitle, setShareTitle] = useState(() => genTitle());
  const [shareDescription, setShareDescription] = useState(() => genDesc());
  const pickRandomTags = useCallback((count = 14, avoid?: string[]) => {
    const shuffled = [...HASHTAG_POOL].sort(() => Math.random() - 0.5);
    const filtered = avoid?.length ? shuffled.filter((t) => !avoid.includes(t)) : shuffled;
    const pool = filtered.length >= count ? filtered : shuffled;
    return pool.slice(0, count);
  }, []);
  const [visibleTags, setVisibleTags] = useState<string[]>(() => pickRandomTags(14));
  const [copied, setCopied] = useState(false);
  const [dailyPool, setDailyPool] = useState<DailyAyah[]>([]);
  const [dailyIndex, setDailyIndex] = useState(0);
  const [dailyPaused] = useState(false);
  const [prayerCity, setPrayerCity] = useState(() => localStorage.getItem("nur_city") || "İstanbul");
  const [prayerSearch, setPrayerSearch] = useState("");
  const { prayerTimings, nextPrayer, filteredCities } = usePrayerTimes(prayerCity, prayerSearch);
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [modal, setModal] = useState<ModalName>(null);
  const [tosOpen, setTosOpen] = useState(false);
  const [localBanned, setLocalBanned] = useState<boolean>(() => {
    return secureGet<boolean>("nur_local_user_banned", false);
  });
  const [localBanReason, setLocalBanReason] = useState<string>(() => {
    return secureGet<string>("nur_local_user_ban_reason", "Sistem Güvenlik & Yasal Hak İhlali");
  });
  const [legalTab, setLegalTab] = useState<"tos" | "kvkk" | "gizlilik" | "iade">("tos");
  const [debugGuideModal, setDebugGuideModal] = useState<DebugGuideMessage | null>(null);
  const [tosAccepted, setTosAccepted] = useState(false);
  const [contactType, setContactType] = useState<"oneri" | "sikayet">("oneri");
  const [contactMessage, setContactMessage] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [hoveredClip, setHoveredClip] = useState<string | null>(null);

  const [smartAiEnabled, setSmartAiEnabled] = useState(false);
  const [aiTooltipHover, setAiTooltipHover] = useState(false);

  const [tier, setTier] = useState<Tier>(() => getCurrentTier());
  // ★ Misafir (giriş yapmamış) kullanıcı görsel olarak elit gibi görür — V2/V3 sert kilitler hariç.
  //   Gerçek üretim anında handleGenerate içindeki isGuest değişkeni kontrol eder.
  //   Bu sadece görsel kilit rozetleri için; filigran, üretim, jeton ayrıca korunuyor.
  const accessTier: Tier = isMasterSürüm ? "elit" : !user ? "elit" : tier;
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [premiumTab, setPremiumTab] = useState<"uyelik" | "jeton">("uyelik");
  const [fullUnlockConfirmOpen, setFullUnlockConfirmOpen] = useState(false);
  const [serverAdminVerified, setServerAdminVerified] = useState(false);
  const [adminEmailInput, setAdminEmailInput] = useState("");
  const [adminCodeInput, setAdminCodeInput] = useState("");
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminAuthOpen, setAdminAuthOpen] = useState(false);
  const [jetonCount, setJetonCount] = useState<number>(() => Number(localStorage.getItem("nur_jeton") || 0));

  const openPremium = useCallback((tab: "uyelik" | "jeton" = "uyelik") => {
    setPremiumTab(tab);
    setPremiumOpen(true);
  }, []);

  const checkTier = useCallback((need: Tier): boolean => {
    if (isMasterSürüm || tierAtLeast(tier, need)) return true;
    openPremium("uyelik");
    return false;
  }, [tier, openPremium, isMasterSürüm]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const verseAudioRef = useRef<HTMLAudioElement | null>(null);
  const reciterPreviewRef = useRef<HTMLAudioElement | null>(null);
  const previewTimerRef = useRef<number>(0);
  const durationWarnRef = useRef<{ key: string; at: number }>({ key: "", at: 0 });
  const stopGenerationRef = useRef<() => void>(() => undefined);
  const lastTitleRef = useRef<string>("");
  const lastDescRef = useRef<string>("");
  const selectedRef = useRef(selected), verseIndexRef = useRef(verseIndex), backgroundRef = useRef(background);
  const ayahBackgroundsRef = useRef(ayahBackgrounds), aspectRef = useRef(aspect), themeRef = useRef(THEMES[0]);
  const { imageCache, videoCache, videoWatchdog, ensureImage, ensureVideo } = useMediaCache();

  const combinedAllClips = useMemo(
    () => (QURAN_CLIPS.length ? [...QURAN_CLIPS, ...TEMPLATE_CLIPS] : [...ALL_CLIPS, ...QURAN_CLIPS]),
    []
  );

  const ALL_THEMES = useMemo(() => [...THEMES, ...EXTRA_THEMES], []);
  const theme = ALL_THEMES.find((item) => item.id === themeId) ?? ALL_THEMES[0];
  const themeEmoji = (id: string) => THEME_EMOJI[id] ?? THEME_EMOJI_EXTRA[id] ?? "✦";
  const themeTier = (id: string): Tier => THEME_TIER[id] ?? "free";
  void themeEmoji; void themeTier; void jetonCount; void setJetonCount; void checkTier;

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
  const daily = dailyPool[dailyIndex % Math.max(dailyPool.length, 1)] ?? null;
  const activeOutput = outputs.find((output) => output.id === activeOutputId) ?? outputs[0] ?? null;
  const t = (key: keyof (typeof T)["tr"]) => T[lang][key] ?? T.tr[key];
  const notify = useCallback((message: string) => setToast(message), []);

  const openAdminDashboard = useCallback(async () => {
    if (isDevMaster) {
      setModal("adminDashboard");
      return;
    }

    try {
      const response = await fetch("/api/admin/session", { cache: "no-store" });
      if (response.ok) {
        setServerAdminVerified(true);
        setAdminGodMode(true);
        setModal("adminDashboard");
        return;
      }
    } catch { /* ignore */ }

    setAdminAuthOpen(true);
    notify("Admin paneli için doğrulanmış Google admin oturumu gerekli");
  }, [isDevMaster, notify]);

  useAuthSession({
    notify,
    setUser,
    setAdminGodMode,
    setTier,
    setJetonCount,
    setLocalBanned,
    setLocalBanReason,
  });

  const { tryUnlockElitFeature, tryUnlockFullMode } = useMicroUnlocks({
    tier,
    jetonCount,
    isMasterSürüm,
    setJetonCount,
    notify,
    openPremium,
  });
  const { getGuestUsed, bumpGuestUsed, handleGuestContinue } = useGuestTrial(notify, setModal);

  const { silenceAudioOnly, silenceAllAudio } = useAudioSilence({
    verseAudioRef,
    reciterPreviewRef,
    previewTimerRef,
    setPreviewPlaying,
    setPreviewReciterId,
    setPreviewTime,
  });

  useEffect(() => {
    const onVisibility = () => { if (document.hidden) silenceAllAudio(); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [silenceAllAudio]);

  // ★ AKILLI HATA KILAVUZU DİNLEYİCİSİ
  useEffect(() => {
    onErrorCaptured((guideMsg) => {
      setDebugGuideModal(guideMsg);
    });
  }, []);

  useSecurityGuards({
    isMasterSürüm,
    serverBanLive: SERVER_BAN_LIVE,
    user,
    modal,
    notify,
    setTier,
    setJetonCount,
    setLocalBanned,
    setLocalBanReason,
  });

  useEffect(() => { selectedRef.current = selected; }, [selected]);
  useEffect(() => { verseIndexRef.current = verseIndex; }, [verseIndex]);
  useEffect(() => { backgroundRef.current = background; }, [background]);
  useEffect(() => { ayahBackgroundsRef.current = ayahBackgrounds; }, [ayahBackgrounds]);
  // ★ Format değişince canvas anında yeni orana geçer (önizleme şekil değiştirir)
  useEffect(() => {
    aspectRef.current = aspect;
    const cv = canvasRef.current;
    if (cv) {
      const [w, h] = dimensions(aspect);
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    }
  }, [aspect]);
  useDocumentTheme(theme, themeRef);
  useDocumentLanguage(lang);

  // ★ DİL DEĞİŞİNCE HER ŞEY ÇEVRİLİR
  //   Panel etiketleri t() ile zaten çevriliyor.
  //   Burada başlık, açıklama ve etiketler de yeni dilde yeniden üretilir.
  const langFirstRun = useRef(true);
  useEffect(() => {
    if (langFirstRun.current) { langFirstRun.current = false; return; }
    const current = selectedRef.current[verseIndexRef.current] ?? selectedRef.current[0];
    if (current) {
      setShareTitle(genTitle(current.sName, current.s, current.a, lang));
      setShareDescription(genDesc(`${current.sName}`, current.s, current.a, reciter.name, lang));
    } else {
      setShareTitle(genTitle(undefined, undefined, undefined, lang));
      setShareDescription(genDesc(undefined, undefined, undefined, undefined, lang));
    }
    setVisibleTags(pickRandomTags(14));
    notify(`🌐 ${LANGS.find((l) => l.code === lang)?.label ?? lang} · arayüz, başlık ve açıklama çevrildi`);
  }, [lang, reciter.name, pickRandomTags, notify]);
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(null), 2400); return () => window.clearTimeout(timer); }, [toast]);

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
        navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
      } else {
        fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true }).catch(() => undefined);
      }
    } catch { /* analitik asla uygulamayı bozmaz */ }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await syncServerTime().catch(() => undefined);
      if (cancelled) return;

      const today = serverDateISO();
      if (localStorage.getItem("nur_daily_bonus_date") === today) return;

      if (isDeviceClockTampered()) {
        notify("⚠️ Sistem saatiniz gerçek zamanla uyuşmuyor. Günlük bonus askıya alındı.");
        return;
      }

      const ramadan = localStorage.getItem("nur_ramadan_mode") === "1";
      const kadirGecesi = localStorage.getItem("nur_kadir_gecesi_mode") === "1";
      const base = tier === "free" ? (ramadan ? JETON.DAILY_FREE_RAMADAN : JETON.DAILY_FREE) : tier === "pro" ? (ramadan ? JETON.DAILY_PRO_RAMADAN : JETON.DAILY_PRO) : (ramadan ? JETON.DAILY_ELIT_RAMADAN : JETON.DAILY_ELIT);
      const cap = jetonTavani(tier, ramadan);

      // ★ DUAL VAULT: Günlük abonelik jetonu tavan sınırına (Cap) takılır.
      addDailySubJeton(base, cap);

      // Cuma & Kadir Gecesi bonusları tavandan tamamen muaf olarak eklenir
      const friday = serverIsFriday() ? JETON.CUMA_BONUS : 0;
      const kadirBonus = kadirGecesi ? JETON.KADIR_GECESI : 0;
      if (friday > 0 || kadirBonus > 0) {
        addPurchasedJeton(friday + kadirBonus);
        if (friday) notify(`🕌 Cuma bonusu: +${friday} jeton (tavan dışı)`);
        if (kadirBonus) notify(`✨ Kadir Gecesi bonusu: +${kadirBonus} jeton (tavan dışı)`);
      }

      setJetonCount(getJeton());
      localStorage.setItem("nur_daily_bonus_date", today);
    })();
    return () => { cancelled = true; };
  }, [tier, notify]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement;
      const menuPanel = document.querySelector("[data-sidebar-panel='true']");
      const menuTrigger = document.querySelector("[data-sidebar-trigger='true']");
      if (menuPanel && !menuPanel.contains(target) && menuTrigger && !menuTrigger.contains(target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [menuOpen]);

  useEffect(() => {
    let live = true;
    // ★ Günlük ayetler 4'lü küçük partiler halinde yüklenir — API'ye aynı anda
    //   14 istek fırlatmak 429 hız limiti tetikliyordu. Parti parti gidince
    //   hem limit aşımı azalır hem yavaş internette tek tek dolar.
    (async () => {
      const source = DAILY_AYAHS.slice(0, 14);
      const available: DailyAyah[] = [];
      for (let i = 0; i < source.length; i += 4) {
        if (!live) return;
        const chunk = source.slice(i, i + 4);
        const items = await Promise.all(
          chunk.map(([s, a]) =>
            fetchAyah(s, a, MEAL_EDITIONS[lang])
              .then(({ ar, tr }) => ({ ar, tr, ref: `${SURAHS[s - 1].name} ${s}:${a}`, s, a }))
              .catch(() => null)
          )
        );
        available.push(...(items.filter(Boolean) as DailyAyah[]));
        if (available.length && !selectedRef.current.length) {
          const first = available[0];
          setSelected([{ id: `${first.s}:${first.a}`, s: first.s, a: first.a, sName: SURAHS[first.s - 1].name, ar: first.ar, tr: first.tr }]);
          setShareTitle(genTitle(SURAHS[first.s - 1].name, first.s, first.a));
          setShareDescription(genDesc(`${SURAHS[first.s - 1].name} Suresi`, first.s, first.a, RECITERS[0].name));
        }
      }
      if (live) setDailyPool(available);
    })();
    return () => { live = false; };
  }, [lang]);

  useEffect(() => { if (dailyPaused || !dailyPool.length) return; const timer = window.setInterval(() => setDailyIndex((index) => (index + 1) % dailyPool.length), 10000); return () => window.clearInterval(timer); }, [dailyPaused, dailyPool.length]);

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
    const modeLabel = mode === "short" ? "Kısa (59 sn)" : mode === "long" ? "Uzun (600 sn)" : "Tam Sürüm (40:00)";
    const key = `${mode}-${selected.length}-${fitCount}-${Math.round(total)}`;
    const nowMs = Date.now();
    if (durationWarnRef.current.key === key || nowMs - durationWarnRef.current.at < 6500) return;
    durationWarnRef.current = { key, at: nowMs };
    notify(`⚠️ ${modeLabel} süresi seçili ayetlere yetmiyor · ayet yarım kalmasın diye yaklaşık ilk ${fitCount} ayet alınır, sonrası bırakılır`);
  }, [selected, mode, notify]);

  useVerseAudioPlayback({
    previewPlaying,
    selected,
    verseIndex,
    reciter,
    verseAudioRef,
    previewTimerRef,
    verseIndexRef,
    setPreviewPlaying,
    setPreviewDuration,
    setPreviewTime,
    setVerseIndex,
    notify,
    silenceAudioOnly,
  });

  useCanvasDraw({
    canvasRef, selectedRef, verseIndexRef, backgroundRef, ayahBackgroundsRef, aspectRef, themeRef,
    videoWatchdog, imageCache, videoCache, ensureImage, ensureVideo,
    showArapca, showSubMeal, accessTier, arabicFontCss, textSizeMul, shimmerCfg, cardBg, textOffset,
    cineFilter, isMasterSürüm, brandSignature, brandPos, previewFps: renderQuality.previewFps, user,
  });

  const detectCategoryFromAyah = useCallback((ar: string, tr: string, surahName = ""): CatId => {
    return detectCategoryFromAyahText(ar, tr, surahName, SURAH_CATEGORY_HINT, KEYWORD_CATEGORY_FALLBACK);
  }, []);

  const addAyah = useCallback(async (s: number, a: number, knownTranslation?: string) => {
    const id = `${s}:${a}`;
    if (selectedRef.current.some((item) => item.id === id)) return;
    notify("Ayet yükleniyor...");
    try {
      let ar = "", tr = knownTranslation ?? "";
      if (knownTranslation) { const json = await fetchJSON(`https://api.alquran.cloud/v1/ayah/${s}:${a}/quran-uthmani`); ar = json.data?.text ?? ""; }
      else { const loaded = await fetchAyah(s, a, MEAL_EDITIONS[lang]); ar = loaded.ar; tr = loaded.tr; }
      const meta = SURAHS[s - 1], item = { id, s, a, sName: meta.name, ar, tr };
      setSelected((current) => [...current, item]);

      if (smartAiEnabled) {
        const detectedCat = detectCategoryFromAyah(ar, tr, meta.name);
        let poolCat = combinedAllClips.filter((clip) => clip.cat === detectedCat && clip.kind === "vid");
        if (poolCat.length === 0) poolCat = combinedAllClips.filter((clip) => clip.cat === "musaf" && clip.kind === "vid");
        if (poolCat.length === 0) poolCat = combinedAllClips.filter((clip) => clip.kind === "vid");
        if (poolCat.length) {
          const chosen = poolCat[Math.floor(Math.random() * poolCat.length)];
          setAyahBackgrounds((current) => ({ ...current, [id]: chosen }));
          if (verseIndexRef.current === selectedRef.current.length) { setBackground(chosen); }
        }
      }

      const quranClips = MOTION_CLIPS.filter((clip) => clip.cat === "musaf");
      if (quranClips.length && !ayahBackgroundsRef.current[id]) setAyahBackgrounds((current) => ({ ...current, [id]: quranClips[Math.floor(Math.random() * quranClips.length)] }));
      setVerseIndex(selectedRef.current.length);
      setShareTitle(genTitle(meta.name, s, a, lang));
      setShareDescription(genDesc(meta.name, s, a, reciter.name, lang));
      notify(`${meta.name} ${s}:${a} eklendi`);
    } catch { notify("Ayet yüklenemedi"); }
  }, [lang, notify, reciter.name, smartAiEnabled, combinedAllClips, detectCategoryFromAyah]);

  const toggleAyah = useCallback((s: number, a: number, knownTranslation?: string) => {
    const id = `${s}:${a}`;
    if (selectedRef.current.some((item) => item.id === id)) {
      setSelected((current) => current.filter((item) => item.id !== id));
      setVerseIndex((current) => Math.max(0, Math.min(current, Math.max(0, selectedRef.current.length - 2))));
      setAyahBackgrounds((current) => { const next = { ...current }; delete next[id]; return next; });
      return;
    }
    void addAyah(s, a, knownTranslation);
  }, [addAyah]);

  const addWholeSurah = useCallback(async () => {
    const number = Number(surah); notify("Sure yükleniyor...");
    try { const rows = await fetchSurah(number, MEAL_EDITIONS[lang]), meta = SURAHS[number - 1]; const all = rows.map((row, index) => ({ id: `${number}:${index + 1}`, s: number, a: index + 1, sName: meta.name, ar: row.ar, tr: row.tr })); setSelected((current) => { const ids = new Set(current.map((item) => item.id)); return [...current, ...all.filter((item) => !ids.has(item.id))]; }); notify(`${meta.name} Suresi tamamı eklendi (${rows.length} ayet)`); }
    catch { notify("Sure yüklenemedi"); }
  }, [surah, lang, notify]);

  const useFromLibrary = useCallback((item: LibraryItem) => {
    const s = item.s ?? 0, a = item.a ?? 0;
    const id = item.type === "ayet" && s > 0 ? `${s}:${a}` : `lib-${item.id}`;
    if (selectedRef.current.some((x) => x.id === id)) { notify("Bu içerik zaten seçili"); setModal(null); return; }
    setSelected((current) => [...current, { id, s, a, sName: item.title, ar: item.ar, tr: item.tr }]);
    setVerseIndex(selectedRef.current.length);
    notify(`✨ "${item.title}" stüdyoya eklendi`);
    setModal(null);
  }, [notify]);

  const libraryFiltered = useMemo(() => {
    let pool = LIBRARY_ITEMS;
    if (libType !== "tumu") pool = pool.filter((i) => i.type === libType);
    if (libEmotion !== "tum") pool = pool.filter((i) => i.emotions.includes(libEmotion));
    const q = libSearch.trim().toLocaleLowerCase("tr");
    if (q) pool = pool.filter((i) => (i.title + i.tr + i.source).toLocaleLowerCase("tr").includes(q));
    return pool;
  }, [libType, libEmotion, libSearch]);

  // ★ PRO üyenin görebileceği ilk 350 içeriğin kimlik listesi (tek seferlik hesap)
  const proAllowedIds = useMemo(() => {
    const set = new Set<string>();
    const pool = combinedAllClips.filter((c) => {
      const need = KATEGORI_TIER[c.cat as CatId] ?? "free";
      return need === "free" || need === "pro";
    });
    for (let i = 0; i < Math.min(PRO_TOTAL_ATMOS, pool.length); i += 1) set.add(pool[i].id);
    return set;
  }, [combinedAllClips]);

  const isClipAccessible = useCallback((clip: Clip): boolean => {
    if (isMasterSürüm) return true;

    // ★ ELİT: hiçbir kilit yok — tüm kategoriler, tüm içerikler açık
    if (accessTier === "elit") return true;

    const catTier = KATEGORI_TIER[clip.cat as CatId] ?? "free";

    // ★ PRO: free + pro kategorileri açık, toplam 350 içerik hakkı
    if (accessTier === "pro") {
      if (catTier === "elit") return false;
      return proAllowedIds.has(clip.id);
    }

    // ★ FREE: sadece free kategoriler, kategori başına 10 içerik
    if (catTier !== "free") return false;
    const sameCat = combinedAllClips.filter((c) => c.cat === clip.cat && c.kind === clipKind);
    const idx = sameCat.findIndex((c) => c.id === clip.id);
    return idx < FREE_VIDEOS_PER_CATEGORY;
  }, [accessTier, clipKind, combinedAllClips, isMasterSürüm, proAllowedIds]);

  const randomizeBackgrounds = useCallback((scopeCat?: CatId) => {
    let pool = combinedAllClips.filter((clip) => clip.kind === clipKind && isClipAccessible(clip));
    if (scopeCat) pool = pool.filter((clip) => clip.cat === scopeCat);
    if (pool.length === 0) { notify("Bu türde içerik yok"); return; }
    const pick = () => pool[Math.floor(Math.random() * pool.length)];
    if (!selectedRef.current.length) {
      const c = pick();
      setBackground(c);
      notify(`Rastgele seçildi: ${c.label}`);
      return;
    }
    const next: Record<string, Clip> = {};
    if (scopeCat) {
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      selectedRef.current.forEach((item, index) => { next[item.id] = shuffled[index % shuffled.length]; });
      const catLabel = CATEGORIES.find((c) => c.id === scopeCat)?.label ?? scopeCat;
      setAyahBackgrounds(next);
      if (next[selectedRef.current[0].id]) setBackground(next[selectedRef.current[0].id]);
      notify(`✨ ${selectedRef.current.length} ayete "${catLabel}" içinden rastgele atmosfer atandı`);
      return;
    }
    // ★ GERÇEK ÇEŞİTLİLİK — hem kategori hem klip tekrarını engeller
    const categories = Array.from(new Set(pool.map((c) => c.cat)));
    const shuffledCats = [...categories].sort(() => Math.random() - 0.5);
    const usedIds = new Set<string>();
    selectedRef.current.forEach((item, index) => {
      const cat = shuffledCats[index % shuffledCats.length];
      const catPool = pool.filter((c) => c.cat === cat);
      // Önce bu kategoride HİÇ kullanılmamış klipleri dene
      const freshInCat = catPool.filter((c) => !usedIds.has(c.id));
      // O da bittiyse tüm havuzda kullanılmamışlara bak
      const freshAny = pool.filter((c) => !usedIds.has(c.id));
      const source = freshInCat.length ? freshInCat : freshAny.length ? freshAny : catPool.length ? catPool : pool;
      const chosen = source[Math.floor(Math.random() * source.length)] ?? pick();
      usedIds.add(chosen.id);
      next[item.id] = chosen;
    });
    setAyahBackgrounds(next);
    if (next[selectedRef.current[0].id]) setBackground(next[selectedRef.current[0].id]);
    notify(`✨ ${selectedRef.current.length} ayete farklı kategorilerden rastgele atmosfer atandı`);
  }, [clipKind, combinedAllClips, notify, isClipAccessible]);

  const applySmartBackgrounds = useCallback(() => {
    if (!selectedRef.current.length) { notify("Önce en az bir ayet seçin"); return; }
    const next: Record<string, Clip> = {};
    const usedIds = new Set<string>();
    selectedRef.current.forEach((item) => {
      const detectedCat = detectCategoryFromAyah(item.ar, item.tr, item.sName);
      let poolCat = combinedAllClips.filter((clip) => clip.cat === detectedCat && clip.kind === "vid");
      if (poolCat.length === 0) poolCat = combinedAllClips.filter((clip) => clip.cat === "musaf" && clip.kind === "vid");
      if (poolCat.length === 0) poolCat = combinedAllClips.filter((clip) => clip.kind === "vid");
      if (poolCat.length === 0) return;
      const fresh = poolCat.filter((c) => !usedIds.has(c.id));
      const list = fresh.length ? fresh : poolCat;
      const chosen = list[Math.floor(Math.random() * list.length)];
      usedIds.add(chosen.id);
      next[item.id] = chosen;
    });
    setAyahBackgrounds(next);
    if (selectedRef.current[0] && next[selectedRef.current[0].id]) setBackground(next[selectedRef.current[0].id]);
    notify("✨ Akıllı AI: Ayet kelimelerine göre sahne atandı!");
  }, [combinedAllClips, notify, detectCategoryFromAyah]);

  const { playReciterPreview } = useReciterPreview({
    previewReciterId,
    selectedRef,
    reciterPreviewRef,
    previewTimerRef,
    setPreviewReciterId,
    notify,
    silenceAllAudio,
  });

  useVerseAudioPlayback({
    previewPlaying,
    selected,
    verseIndex,
    reciter,
    verseAudioRef,
    previewTimerRef,
    verseIndexRef,
    setPreviewPlaying,
    setPreviewDuration,
    setPreviewTime,
    setVerseIndex,
    notify,
    silenceAudioOnly,
  });

  const handleGenerate = useVideoGenerator({
    generating,
    setGenerating,
    setProgress,
    stopGenerationRef,
    user,
    isMasterSürüm,
    getGuestUsed,
    bumpGuestUsed,
    setLoginTab,
    setModal,
    notify,
    selected,
    canvasRef,
    reciter,
    batchFormats,
    aspect,
    mode,
    accessTier,
    renderAuthLive: RENDER_AUTH_LIVE,
    jetonCount,
    setJetonCount,
    openPremium,
    silenceAllAudio,
    ayahBackgroundsRef,
    backgroundRef,
    ensureImage,
    ensureVideo,
    renderQuality,
    aspectRef,
    verseIndexRef,
    setVerseIndex,
    setOutputs,
    setActiveOutputId,
    t,
  });

  const copyShare = useCallback(async () => {
    const content = `${shareTitle}\n\n${shareDescription}`;
    try { await navigator.clipboard.writeText(content); } catch { const textarea = document.createElement("textarea"); textarea.value = content; document.body.appendChild(textarea); textarea.select(); document.execCommand("copy"); textarea.remove(); }
    setCopied(true); window.setTimeout(() => setCopied(false), 1600); notify("Paylaşım metni kopyalandı");
  }, [notify, shareDescription, shareTitle]);

  const shareOutput = useCallback(async (output: Output) => {
    const promoText = "Bu video nurstudyo.com yapay zeka otomasyonu ile 1 dakikada üretilmiştir. Siz de telifsiz ve sinematik Kur'an videoları üretmek için ziyaret edin!";
    try {
      await navigator.clipboard.writeText(promoText);
      notify("📢 Paylaşım metni panoya kopyalandı!");
    } catch { /* ignore */ }

    try {
      const file = new File([await (await fetch(output.url)).blob()], `nur-studyo.${output.ext}`, { type: output.mime });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: shareTitle, text: `${promoText}\n\n${shareDescription}`, files: [file] });
        return;
      }
    } catch { /* ignore */ }
  }, [notify, shareTitle, shareDescription]);

  const filteredClips = useMemo(() => {
    let pool = combinedAllClips;
    pool = pool.filter((clip) => clip.kind === clipKind);
    if (atmosCategory !== "all") { pool = pool.filter((clip) => clip.cat === atmosCategory); }
    const value = atmosQuery.trim().toLocaleLowerCase("tr");
    if (value) { pool = pool.filter((clip) => clip.label.toLocaleLowerCase("tr").includes(value)); }
    // ★ Kilitli olanlar listenin sonuna itilir (Elit'te hiç kilitli yoktur)
    return [...pool].sort((a, b) => {
      const lockedA = !isClipAccessible(a);
      const lockedB = !isClipAccessible(b);
      return Number(lockedA) - Number(lockedB);
    });
  }, [atmosCategory, atmosQuery, clipKind, combinedAllClips, isClipAccessible]);

  const pickClip = (clip: Clip) => { if (pickingFor) setAyahBackgrounds((current) => ({ ...current, [pickingFor]: clip })); else setBackground(clip); notify(`Atmosfer seçildi: ${clip.label}`); setModal(null); setPickingFor(null); };

  const { handleLoginSubmit, handleRegisterSubmit, handleForgotPassword, handleVerifyCode, handleLogout } = useManualAuthActions({
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
  });

  void _showGiftModalUnused; void _setShowGiftModalUnused; void user; void lockTip; void adminError; void adminEmailInput;
  void MEAL_FIXES; void CATEGORY_PALETTE; void getPosterUrlSync; void fmtSize;

  return (
    <div className="relative min-h-screen overflow-x-hidden text-[13px]" style={{ color: "var(--text)" }}>
      <div className="pointer-events-none fixed inset-0 -z-10" style={{ background: `radial-gradient(900px 560px at 88% -8%,color-mix(in srgb,var(--accent) 12%,transparent),transparent 60%),radial-gradient(800px 600px at -10% 100%,color-mix(in srgb,var(--accent) 7%,transparent),transparent 58%),var(--page)` }} />

      {/* ANNOUNCEMENT BAR (DİNAMİK MANEVİ TAKVİM & TIKLA-AL ÖDÜL ŞERİDİ) */}
      <AnnouncementBar
        notify={notify}
        onRewardClaimed={(newJeton?: number) => {
          setJetonCount(typeof newJeton === "number" ? newJeton : getJeton());
        }}
        onTamperAttempt={(reason: string) => {
          setLocalBanned(true);
          setLocalBanReason(reason);
          secureSet("nur_local_user_banned", true);
          secureSet("nur_local_user_ban_reason", reason);
        }}
      />

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
        formatRemaining={formatRemaining}
        t={t}
        tier={tier}
      />

      <StudioHeroSection />

      {/* MAIN 3 GRID */}
      <main className="mx-auto grid max-w-[1500px] gap-4 px-4 py-6 lg:grid-cols-[300px_280px_1fr]">
        {/* LEFT: AYAH LIBRARY PANEL */}
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

        {/* MIDDLE: VIDEO PREVIEW SECTION */}
        <VideoPreviewSection
          canvasRef={canvasRef}
          previewWidth={previewWidth}
          previewMaximized={previewMaximized}
          setPreviewMaximized={setPreviewMaximized}
          showArapca={showArapca}
          setShowArapca={setShowArapca}
          showSubMeal={showSubMeal}
          setShowSubMeal={setShowSubMeal}
          selected={selected}
          verseIndex={verseIndex}
          setVerseIndex={setVerseIndex}
          verseAudioRef={verseAudioRef}
          previewPlaying={previewPlaying}
          setPreviewPlaying={setPreviewPlaying}
          setPreviewTime={setPreviewTime}
          randomizeBackgrounds={(cat?: unknown) => randomizeBackgrounds(cat as CatId | undefined)}
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
          hasMicroUnlock={(key: unknown) => hasMicroUnlock(key as any)}
          tryUnlockElitFeature={(key: unknown, label: string) => tryUnlockElitFeature(key as "batch" | "ai_search", label)}
          applySmartBackgrounds={applySmartBackgrounds}
          openPremium={openPremium}
          setSelected={setSelected}
          setAyahBackgrounds={setAyahBackgrounds}
          setPickingFor={setPickingFor}
          setModal={setModal}
          ayahBackgrounds={ayahBackgrounds}
          activeOutput={activeOutput}
          fmtSize={fmtSize}
          shareOutput={shareOutput}
          user={user}
          setLoginTab={(tab: unknown) => setLoginTab(tab as LoginTab)}
          notify={notify}
          handleGenerate={handleGenerate}
          generating={generating}
          progress={progress}
          generateCost={videoMaliyeti(mode, tier) * Math.max(batchFormats.length, 1)}
          aspect={aspect}
          t={t}
        />

        {/* RIGHT: DESIGN & SETTINGS PANEL */}
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
          shimmerStyle={shimmerStyle}
          setShimmerStyle={setShimmerStyle}
          SHIMMER_STYLES={SHIMMER_STYLES}
          cardBg={cardBg}
          setCardBg={setCardBg}
          brandSignature={brandSignature}
          setBrandSignature={setBrandSignature}
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
      </main>

      {/* BOTTOM: SOCIAL SHARE PANEL */}
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
        openLegalTab={(tab: "tos" | "kvkk" | "gizlilik" | "iade") => { setLegalTab(tab); setTosOpen(true); }}
        t={t}
      />

      {/* TOAST NOTIFICATION */}
      {toast ? (
        <div className="glass modal-in select-none fixed bottom-5 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2 text-[10px] text-white shadow-2xl">
          <BookOpen size={12} style={{ color: "var(--accent)" }} />
          {toast}
        </div>
      ) : null}

      {/* ⛔ SÜRESİZ BAN ENGEL EKRANI */}
      {localBanned && !isMasterSürüm && !isAdminEmail(user?.email || "") && (
        <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-black/95 p-6 backdrop-blur-2xl text-center modal-in select-none">
          <div
            className="glass relative max-w-md w-full rounded-3xl p-8 border text-center space-y-4 shadow-2xl"
            style={{ borderColor: "rgba(239, 68, 68, 0.5)", background: "linear-gradient(160deg, rgba(127,29,29,0.3) 0%, rgba(12,13,18,0.98) 100%)" }}
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-red-500/20 border border-red-500/40 text-red-400 shadow-xl animate-pulse">
              <Ban size={36} strokeWidth={2.5} />
            </div>

            <div>
              <span className="rounded-full bg-red-500/20 border border-red-500/40 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-red-300">
                ERİŞİM SÜRESİZ DONDURULDU
              </span>
              <h2 className="font-display text-xl font-black text-white mt-3 tracking-wide">
                SİSTEM ERİŞİMİNİZ ENGELLENMİŞTİR
              </h2>
            </div>

            <div className="rounded-2xl border border-red-500/30 bg-black/60 p-4 text-left space-y-1.5">
              <div className="text-[9.5px] font-black uppercase tracking-wider text-red-400">
                Yasal Suç / İhlal Gerekçesi:
              </div>
              <p className="text-[11.5px] font-semibold text-white/90 leading-relaxed">
                "{localBanReason}"
              </p>
            </div>

            <p className="text-[10px] leading-relaxed text-white/45">
              Hesabınız yasal suç veya platform güvenlik şartlarının ihlali nedeniyle süresiz olarak askıya alınmıştır. Ban itirazları ve yasal talepleriniz için <b className="text-white/80">destek@nurstudyo.com</b> adresiyle iletişime geçebilirsiniz.
            </p>

            <div className="pt-2 text-[9px] font-mono text-white/30 border-t border-white/10">
              nurstudyo.com · Siber Güvenlik Denetim Protokolü
            </div>
          </div>
        </div>
      )}

      {/* ALL MODALS CONTAINER */}
      {/* ★ AKILLI HATA KILAVUZU MODALI */}
      {debugGuideModal && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md modal-in"
          onMouseDown={() => setDebugGuideModal(null)}
          onClick={() => setDebugGuideModal(null)}
        >
          <div
            className="glass modal-in relative w-full max-w-md rounded-2xl p-6 shadow-2xl"
            style={{ border: "1px solid rgba(215,170,82,.35)" }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setDebugGuideModal(null)}
              className="absolute right-3 top-3 rounded-full bg-white/5 p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white"
              aria-label="Kapat"
            >
              <X size={16} />
            </button>

            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
                <AlertTriangle size={18} />
              </span>
              <div>
                <h3 className="font-display text-sm font-black tracking-wider" style={{ color: "var(--accent-2)" }}>
                  {debugGuideModal.title}
                </h3>
                <p className="text-[9.5px] text-white/40">{debugGuideModal.subtitle}</p>
              </div>
            </div>

            <div className="space-y-2.5 text-[11px] leading-relaxed text-white/80">
              {debugGuideModal.steps.map((step, idx) => (
                <div key={idx} className="rounded-xl border border-white/10 bg-black/30 p-3 font-semibold text-white/90">
                  {step}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setDebugGuideModal(null);
                window.location.reload();
              }}
              className="mt-5 w-full rounded-xl py-3 text-[11px] font-black uppercase tracking-wider text-black"
              style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
            >
              Sayfayı Yenile (F5)
            </button>
          </div>
        </div>
      )}

      <ModalsContainer
        modal={modal}
        setModal={setModal}
        loginTab={loginTab}
        setLoginTab={setLoginTab}
        phone={phone}
        setPhone={setPhone}
        verifyCode={verifyCode}
        setVerifyCode={setVerifyCode}
        sentCode={sentCode}
        handleLoginSubmit={handleLoginSubmit}
        handleRegisterSubmit={handleRegisterSubmit}
        handleForgotPassword={handleForgotPassword}
        handleVerifyCode={handleVerifyCode}
        handleGuestContinue={handleGuestContinue}
        fullUnlockConfirmOpen={fullUnlockConfirmOpen}
        setFullUnlockConfirmOpen={setFullUnlockConfirmOpen}
        jetonCount={jetonCount}
        tryUnlockFullMode={tryUnlockFullMode}
        setMode={setMode}
        premiumOpen={premiumOpen}
        setPremiumOpen={setPremiumOpen}
        premiumTab={premiumTab}
        serverAdminVerified={serverAdminVerified || isDevMaster}
        tier={tier}
        setTier={setTier}
        setCurrentTier={setCurrentTier}
        setJetonCount={setJetonCount}
        notify={notify}
        adminAuthOpen={adminAuthOpen}
        setAdminAuthOpen={setAdminAuthOpen}
        adminEmailInput={adminEmailInput}
        setAdminEmailInput={setAdminEmailInput}
        adminCodeInput={adminCodeInput}
        setAdminCodeInput={setAdminCodeInput}
        adminError={adminError}
        setAdminError={setAdminError}
        setAdminGodMode={setAdminGodMode}
        pickingFor={pickingFor}
        setPickingFor={setPickingFor}
        clipKind={clipKind}
        setClipKind={setClipKind}
        atmosQuery={atmosQuery}
        setAtmosQuery={setAtmosQuery}
        isMasterSürüm={isMasterSürüm}
        randomizeBackgrounds={randomizeBackgrounds}
        atmosCategory={atmosCategory}
        setAtmosCategory={setAtmosCategory}
        combinedAllClips={combinedAllClips}
        CATEGORY_ICONS={CATEGORY_ICONS}
        lockTip={lockTip}
        setLockTip={setLockTip}
        accessTier={accessTier}
        tierAtLeast={tierAtLeast}
        filteredClips={filteredClips}
        hoveredClip={hoveredClip}
        setHoveredClip={setHoveredClip}
        openPremium={openPremium}
        pickClip={pickClip}
        libSearch={libSearch}
        setLibSearch={setLibSearch}
        libType={libType}
        setLibType={setLibType}
        libEmotion={libEmotion}
        setLibEmotion={setLibEmotion}
        libraryFiltered={libraryFiltered}
        useFromLibrary={useFromLibrary}
        addAyah={addAyah}
        ALL_THEMES={ALL_THEMES}
        themeTier={themeTier}
        themeEmoji={themeEmoji}
        themeId={themeId}
        setThemeId={setThemeId}
        prayerSearch={prayerSearch}
        setPrayerSearch={setPrayerSearch}
        prayerCity={prayerCity}
        setPrayerCity={setPrayerCity}
        filteredCities={filteredCities}
        prayerTimings={prayerTimings}
        nextPrayer={nextPrayer}
        formatRemaining={formatRemaining}
        contactType={contactType}
        setContactType={setContactType}
        contactMessage={contactMessage}
        setContactMessage={setContactMessage}
        tosOpen={tosOpen}
        setTosOpen={setTosOpen}
        tosAccepted={tosAccepted}
        setTosAccepted={setTosAccepted}
        legalTab={legalTab}
        setLegalTab={setLegalTab}
        t={t}
      />
    </div>
  );
}
