import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import fixWebmDuration from "fix-webm-duration";
import { X, AlertTriangle, Ban, Sparkles, BookOpen } from "lucide-react";
import {
  CATEGORY_ICONS, DEFAULT_MASTER_SURUM, RENDER_AUTH_LIVE, SERVER_BAN_LIVE,
  MODES, ASPECTS, PRAYERS, KEYWORD_CATEGORY_FALLBACK, SURAH_CATEGORY_HINT,
  ARABIC_FONTS as _ARABIC_FONTS, SHIMMER_STYLES as _SHIMMER_STYLES, CINE_FILTERS as _CINE_FILTERS,
} from "./studio/studioConstants";
import { useCanvasDraw } from "./studio/useCanvasDraw";
void _ARABIC_FONTS; void _SHIMMER_STYLES; void _CINE_FILTERS;
import {
  fmtDuration, fmtSize, dimensions, uid, isWholeSurahSelected,
  pickMime, formatRemaining, fetchJSON, fetchAyah, fetchSurah,
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
  toHiRes,
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
  TURKISH_CITIES,
  EXTRA_THEMES,
  THEME_TIER,
  THEME_EMOJI_EXTRA,
} from "./data";
import { LANGS, MEAL_EDITIONS, T, type Lang } from "./i18n";
import { RECITERS, reciterAudioUrl, RECITER_SES_TARZI, SES_TARZI_ORDER } from "./reciters";
import { LIBRARY_ITEMS, type LibraryItem, type LibraryType, type Emotion } from "./dualar";
import { HeaderTopBar } from "./components/HeaderTopBar";
import { AyahLibraryPanel } from "./components/AyahLibraryPanel";
import { VideoPreviewSection } from "./components/VideoPreviewSection";
import { DesignSettingsPanel } from "./components/DesignSettingsPanel";
import { SocialSharePanel } from "./components/SocialSharePanel";
import { ModalsContainer } from "./components/ModalsContainer";
import { AnnouncementBar } from "./components/AnnouncementBar";
import { SimpleModePanel } from "./components/SimpleModePanel";
import {
  getCurrentTier, setCurrentTier, tierAtLeast, isFeatureUnlocked, featureLockLabel,
  isAdminEmail, ADMIN_SECRET_PATH, ALLOWED_ADMIN_EMAILS,
  JETON, isFriday, isRamadan, reciterRequiredTier, jetonTavani, videoMaliyeti,
  hasMicroUnlock, grantMicroUnlock, getJeton, setJeton as persistJetonSecure,
  addPurchasedJeton, addDailySubJeton,
  type Tier,
} from "./tier";
import { consumeTamperFlag, onTamperDetected, secureGet, secureSet } from "./secureStore";
import { serverDateISO, serverIsFriday, isDeviceClockTampered, syncServerTime } from "./serverTime";
import { getVideoUrlSync, getPosterUrlSync, getVideoUrl, getPosterUrl } from "./videoUrl";
import { checkRateLimit } from "./rateLimiter";
import { onErrorCaptured, reportRenderError, type DebugGuideMessage } from "./debugGuide";
import { syncUserInDb } from "./components/AdminDashboardModal";
import { fetchRemoteConfig, getSystemConfig, banUserInDb, getBanLogs } from "./services/adminSyncService";
import type { SelectedAyah, SearchHit, Output, DailyAyah, User, Mode, Aspect, ModalName, LoginTab } from "./types";

void SES_TARZI_ORDER; void isFeatureUnlocked; void featureLockLabel; void ALLOWED_ADMIN_EMAILS; void isAdminEmail; void setCurrentTier; void tierAtLeast; void isRamadan; void isFriday; void JETON; void ADMIN_SECRET_PATH;
void KATEGORI_TIER; void FREE_VIDEOS_PER_CATEGORY;
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
  const [results, setResults] = useState<SearchHit[]>([]);
  const [searching, setSearching] = useState(false);
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
  const [simpleMode, setSimpleMode] = useState(() => {
    try { return localStorage.getItem("nur_simple_mode") !== "0"; } catch { return true; }
  });
  useEffect(() => {
    try { localStorage.setItem("nur_simple_mode", simpleMode ? "1" : "0"); } catch { /* ignore */ }
  }, [simpleMode]);
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
  const [prayerTimings, setPrayerTimings] = useState<Record<string, string> | null>(null);
  const [now, setNow] = useState(new Date());
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
  const imageCache = useRef(new Map<string, HTMLImageElement>()), videoCache = useRef(new Map<string, HTMLVideoElement>());
  // ★ Render sırasında videonun donmasını engelleyen canlılık izleyicisi (watchdog)
  const videoWatchdog = useRef(new Map<HTMLVideoElement, { t: number; at: number }>());

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

  // ★ Google OAuth PKCE dönüşü — code backend'de doğrulanır, sahte mail kabul edilmez
  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    if (!code || !state) return;

    const storedState = sessionStorage.getItem("nur_google_state") || "";
    const verifier = sessionStorage.getItem("nur_google_pkce_verifier") || "";
    sessionStorage.removeItem("nur_google_state");
    sessionStorage.removeItem("nur_google_pkce_verifier");
    window.history.replaceState({}, "", window.location.pathname || "/");

    if (!storedState || storedState !== state || !verifier) {
      notify("⚠️ Google giriş oturumu doğrulanamadı. Lütfen tekrar deneyin.");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            codeVerifier: verifier,
            redirectUri: `${window.location.origin}/`,
          }),
        });
        const data = await response.json().catch(() => null) as {
          ok?: boolean;
          error?: string;
          user?: { id: string; email: string; name: string; verified: boolean; tier?: Tier; isAdmin?: boolean };
          wallet?: { subJeton: number; purchasedJeton: number; total: number } | null;
        } | null;
        if (cancelled) return;
        if (!response.ok || !data?.ok || !data.user?.email) {
          notify(data?.error || "Google girişi doğrulanamadı");
          return;
        }

        const email = data.user.email.trim().toLowerCase();
        // ★ Admin yetkisi: sunucu (NUR_ADMIN_EMAILS) VEYA istemci listesi — ikisinden biri yeter
        const isKurucuAdmin = Boolean(data.user.isAdmin) || isAdminEmail(email);
        const newUser: User = {
          id: data.user.id,
          name: isKurucuAdmin ? "Ömer Kaya (Kurucu Admin)" : data.user.name || email.split("@")[0],
          email,
          phone: "",
          verified: true,
        };

        setUser(newUser);
        localStorage.setItem("nur_user", JSON.stringify(newUser));

        if (isKurucuAdmin) {
          const adminJeton = Math.max(1000, data.wallet?.total ?? getJeton());
          setAdminGodMode(true);
          setTier("elit");
          setCurrentTier("elit");
          setJetonCount(adminJeton);
          persistJetonSecure(adminJeton);
          syncUserInDb(email, newUser.name, "elit", adminJeton);
          notify("🛡️ Google doğrulandı · Kurucu Admin modu aktif");
          return;
        }

        const dbTier = data.user.tier === "pro" || data.user.tier === "elit" ? data.user.tier : "free";
        setTier(dbTier);
        setCurrentTier(dbTier);
        let nextJeton = data.wallet?.total ?? getJeton();
        const bonusKey = `nur_google_register_bonus_${data.user.id}`;
        if (!localStorage.getItem(bonusKey)) {
          nextJeton += JETON.KAYIT_BONUSU_FREE;
          persistJetonSecure(nextJeton);
          setJetonCount(nextJeton);
          localStorage.setItem(bonusKey, "1");
          notify(`🎉 Google ile giriş başarılı · +${JETON.KAYIT_BONUSU_FREE} jeton hediye edildi`);
        } else {
          notify("Google ile giriş başarılı · hoş geldiniz");
        }
        syncUserInDb(email, newUser.name, dbTier, nextJeton);
      } catch {
        if (!cancelled) notify("Google girişi sırasında bağlantı hatası oluştu");
      }
    })();

    return () => { cancelled = true; };
  }, [notify, tier]);

  // ★ Server-side oturum kontrolü: localStorage tek başına yetki sayılmaz.
  useEffect(() => {
    const stored = localStorage.getItem("nur_user");
    if (!stored) return;
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        if (cancelled) return;
        if (!response.ok) {
          setUser(null);
          localStorage.removeItem("nur_user");
          setAdminGodMode(false);
          return;
        }
        const data = await response.json().catch(() => null) as {
          ok?: boolean;
          user?: { id: string; email: string; name: string; verified: boolean; isAdmin?: boolean; tier?: Tier };
          wallet?: { subJeton: number; purchasedJeton: number; total: number } | null;
          banned?: boolean;
          banReason?: string;
        } | null;
        if (!data?.ok || !data.user?.email) return;
        // ★ Sunucu "banlı" dediyse: tarayıcı geçmişi silinmiş olsa bile engel ekranı açılır
        if (data.banned) {
          const serverReason = data.banReason || "Sistem Verilerini Kurcalama / Jeton Hilesi Girişimi";
          setUser(null);
          localStorage.removeItem("nur_user");
          setAdminGodMode(false);
          setLocalBanned(true);
          setLocalBanReason(serverReason);
          secureSet("nur_local_user_banned", true);
          secureSet("nur_local_user_ban_reason", serverReason);
          return;
        }
        const verifiedUser: User = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          phone: "",
          verified: data.user.verified,
        };
        setUser(verifiedUser);
        localStorage.setItem("nur_user", JSON.stringify(verifiedUser));
        const dbTier = data.user.tier === "pro" || data.user.tier === "elit" ? data.user.tier : "free";
        setTier(data.user.isAdmin ? "elit" : dbTier);
        setCurrentTier(data.user.isAdmin ? "elit" : dbTier);
        if (data.wallet) {
          setJetonCount(data.wallet.total);
          persistJetonSecure(data.wallet.total);
        }
        if (data.user.isAdmin) setAdminGodMode(true);
      } catch { /* offline/dev durumda sessiz geç */ }
    })();
    return () => { cancelled = true; };
  }, []);

  const [, setMicroUnlockTick] = useState(0);
  const tryUnlockElitFeature = useCallback((key: "batch" | "ai_search", featureLabel: string): boolean => {
    if (isMasterSürüm) return true;
    if (tierAtLeast(tier, "elit")) return true;
    if (hasMicroUnlock(key)) return true;
    if (jetonCount >= JETON.MIKRO_KILIT_ACMA_UCRETI) {
      const remaining = Math.max(0, getJeton() - JETON.MIKRO_KILIT_ACMA_UCRETI);
      persistJetonSecure(remaining);
      setJetonCount(remaining);
      grantMicroUnlock(key);
      setMicroUnlockTick((n) => n + 1);
      notify(`🔓 ${featureLabel} 24 saatliğine açıldı · −${JETON.MIKRO_KILIT_ACMA_UCRETI} jeton`);
      return true;
    }
    notify(`${featureLabel} için ${JETON.MIKRO_KILIT_ACMA_UCRETI} jeton gerekiyor (24 saatlik açma) · mevcut: ${jetonCount}`);
    openPremium("jeton");
    return false;
  }, [tier, jetonCount, notify, openPremium, isMasterSürüm]);

  const tryUnlockFullMode = useCallback((): boolean => {
    if (isMasterSürüm) return true;
    if (tierAtLeast(tier, "pro")) return true;
    if (hasMicroUnlock("full_mode")) return true;
    if (jetonCount >= JETON.MIKRO_KILIT_ACMA_UCRETI) {
      const remaining = Math.max(0, getJeton() - JETON.MIKRO_KILIT_ACMA_UCRETI);
      persistJetonSecure(remaining);
      setJetonCount(remaining);
      grantMicroUnlock("full_mode");
      setMicroUnlockTick((n) => n + 1);
      notify(`✅ Tam Sürüm modu 24 saatliğine açıldı · −${JETON.MIKRO_KILIT_ACMA_UCRETI} jeton düşürüldü`);
      return true;
    }
    notify(`⚠️ Tam Sürüm modunu 24 saatliğine açmak için ${JETON.MIKRO_KILIT_ACMA_UCRETI} jeton gerekiyor · mevcut: ${jetonCount}`);
    openPremium("jeton");
    return false;
  }, [tier, jetonCount, notify, openPremium, isMasterSürüm]);

  const silenceAudioOnly = useCallback(() => {
    try {
      const all = document.querySelectorAll("audio");
      all.forEach((a) => {
        try { a.pause(); a.currentTime = 0; a.removeAttribute("src"); a.load(); } catch { /* ignore */ }
      });
    } catch { /* ignore */ }
    const v = verseAudioRef.current;
    if (v) { try { v.pause(); v.src = ""; v.load(); } catch {} verseAudioRef.current = null; }
    const r = reciterPreviewRef.current;
    if (r) { try { r.pause(); r.src = ""; r.load(); } catch {} reciterPreviewRef.current = null; }
    if (previewTimerRef.current) { window.clearTimeout(previewTimerRef.current); previewTimerRef.current = 0; }
  }, []);

  const silenceAllAudio = useCallback(() => {
    silenceAudioOnly();
    setPreviewPlaying(false); setPreviewReciterId(null); setPreviewTime(0);
  }, [silenceAudioOnly]);

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

  // ★ ÜCRETSİZ BULUT SENKRONİZASYONU (Gist / Raw Sync)
  useEffect(() => {
    fetchRemoteConfig().then((remoteCfg) => {
      if (remoteCfg) {
        const savedUser = localStorage.getItem("nur_user");
        if (savedUser) {
          try {
            const u = JSON.parse(savedUser) as User;
            const remoteUser = remoteCfg.users.find(x => x.email.toLowerCase() === u.email.toLowerCase());
            if (remoteUser) {
              setTier(remoteUser.tier);
              setCurrentTier(remoteUser.tier);
              setJetonCount(remoteUser.jeton);
              persistJetonSecure(remoteUser.jeton);
            }
          } catch { /* ignore */ }
        }
      }
    });
  }, []);

  // ★ GOD MODE — ban durumunu otomatik temizler + tamper sinyalini BANLAMADAN bildirir
  useEffect(() => {
    if (!isMasterSürüm) return;
    if (consumeTamperFlag()) {
      notify("🛡️ ADMIN: Önceki güvenlik kaydı temizlendi · ban uygulanmadı");
    }
    setLocalBanned(false);
    secureSet("nur_local_user_banned", false);
    secureSet("nur_local_user_ban_reason", "");
    onTamperDetected((key) => {
      notify(`🛡️ ADMIN UYARI: Güvenlik sinyali yakalandı (${key}) — ban uygulanmadı, sadece bildirildi.`);
    });
  }, [isMasterSürüm, notify]);

  // ★ CANLI BAN BİLDİRİM İZLEYİCİSİ — yeni her ban kaydında admin'e anında toast düşer
  const seenBanIds = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!isMasterSürüm) return;
    const scan = (announce: boolean) => {
      const logs = getBanLogs();
      const fresh = logs.filter((l) => !seenBanIds.current.has(l.id));
      fresh.forEach((l) => seenBanIds.current.add(l.id));
      if (!announce || !fresh.length) return;
      fresh.slice(0, 3).forEach((l, i) => {
        window.setTimeout(() => {
          notify(
            `⛔ BAN: ${l.userEmail} · ${l.isAuto ? "SİSTEM OTOMATİK" : "ADMİN"} · Sebep: ${l.reason} — Yanlışsa Admin Panel > Ban & Siber Denetim'den kaldır`
          );
        }, i * 2600);
      });
    };
    scan(false); // İlk taramada mevcut kayıtları sessizce işaretle
    const iv = window.setInterval(() => scan(true), 2500);
    return () => window.clearInterval(iv);
  }, [isMasterSürüm, notify]);

  // ★ SİBER KORUMA VE OTOMATİK BAN DİNLEYİCİSİ
  useEffect(() => {
    if (isMasterSürüm) return; // God Mode'da tamper guard devre dışı
    // ★ GÜVENLİK GARANTİSİ: Bu fonksiyon YALNIZCA gerçek veri kurcalama
    //   (tamper) olaylarında çalışır. Yavaş internet, çöken API, 429 hız limiti
    //   gibi ağ hataları bu yola ASLA girmez — masum kullanıcı ban yemez.
    const applyAutoBan = (reasonText: string) => {
      persistJetonSecure(0);
      setJetonCount(0);
      setTier("free");
      setCurrentTier("free");
      setLocalBanned(true);
      setLocalBanReason(reasonText);
      secureSet("nur_local_user_banned", true);
      secureSet("nur_local_user_ban_reason", reasonText);
      const userMail = user?.email || "bilinmeyen-cihaz";
      banUserInDb(userMail, reasonText, "Sistem Otomatik Guard", true);
      // ★ SUNUCU MÜHRÜ: Hileci tarayıcı verisini silse bile HttpOnly cookie
      //   kaldığı için Supabase'teki BANNED kaydına takılır ve kaçamaz.
      fetch("/api/ban/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reasonText }),
      }).catch(() => undefined);
      notify("⚠️ Güvenlik: Hesap verilerinde hile/tamper tespit edildi. Erişim donduruldu.");
    };

    if (consumeTamperFlag()) {
      applyAutoBan("Sistem Verilerini Kurcalama / Jeton Hilesi Girişimi");
    }
    onTamperDetected(() => {
      applyAutoBan("Sistem Verilerini Kurcalama / Jeton Hilesi Girişimi");
    });
  }, [notify, user, isMasterSürüm]);

  // ★ BAN DURUMU CANLI DENETLEYİCİ
  useEffect(() => {
    if (isMasterSürüm) return; // God Mode'da ban denetimi devre dışı

    if (SERVER_BAN_LIVE && user) {
      fetch("/api/ban/status", { cache: "no-store" })
        .then(async (response) => ({ response, data: await response.json().catch(() => null) as { ok?: boolean; error?: string; isBanned?: boolean; reason?: string } | null }))
        .then(({ response, data }) => {
          if (!response.ok || !data?.ok) {
            setLocalBanned(true);
            setLocalBanReason(data?.error || "Canlı ban doğrulaması yapılamadı");
            return;
          }
          if (data.isBanned) {
            setLocalBanned(true);
            setLocalBanReason(data.reason || "Yasal İhlal / Siber Güvenlik Uyarısı");
          } else {
            setLocalBanned(false);
          }
        })
        .catch(() => {
          setLocalBanned(true);
          setLocalBanReason("Canlı ban doğrulama servisine ulaşılamadı");
        });
      return;
    }

    const savedUser = localStorage.getItem("nur_user");
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser) as User;
        const cfg = getSystemConfig();
        const dbUser = cfg.users.find((x) => x.email.toLowerCase() === u.email.toLowerCase());
        if (dbUser && dbUser.isBanned) {
          setLocalBanned(true);
          setLocalBanReason(dbUser.banReason || "Yasal İhlal / Siber Güvenlik Uyarısı");
          secureSet("nur_local_user_banned", true);
          secureSet("nur_local_user_ban_reason", dbUser.banReason || "Yasal İhlal / Siber Güvenlik Uyarısı");
        } else if (dbUser && !dbUser.isBanned) {
          setLocalBanned(false);
          secureSet("nur_local_user_banned", false);
        }
      } catch { /* ignore */ }
    }
  }, [user, modal, isMasterSürüm]);

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
  useEffect(() => { themeRef.current = theme; const style = document.documentElement.style; style.setProperty("--accent", theme.acc); style.setProperty("--accent-2", theme.acc2); style.setProperty("--page", theme.bg); style.setProperty("--page-2", theme.bg2); style.setProperty("--text", theme.txt); localStorage.setItem("nur_theme", theme.id); }, [theme]);
  useEffect(() => { localStorage.setItem("nur_lang", lang); const current = LANGS.find((item) => item.code === lang); document.documentElement.lang = lang; document.documentElement.dir = current?.dir ?? "ltr"; }, [lang]);
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(null), 2400); return () => window.clearTimeout(timer); }, [toast]);
  useEffect(() => { const interval = window.setInterval(() => setNow(new Date()), 1000); return () => window.clearInterval(interval); }, []);

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
    localStorage.setItem("nur_city", prayerCity);
    const fetchByCoords = (lat: number, lng: number) => {
      fetchJSON(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=13`).then((json) => {
        if (live) setPrayerTimings(json.data?.timings ?? null);
      }).catch(() => { if (live) setPrayerTimings(null); });
    };
    const fetchByCity = () => {
      fetchJSON(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(prayerCity)}&country=Turkey&method=13`).then((json) => {
        if (live) setPrayerTimings(json.data?.timings ?? null);
      }).catch(() => { if (live) setPrayerTimings(null); });
    };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchByCoords(pos.coords.latitude, pos.coords.longitude),
        () => fetchByCity(),
        { timeout: 5000 }
      );
    } else {
      fetchByCity();
    }
    return () => { live = false; };
  }, [prayerCity]);

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
    const cap = mode === "short" ? 59 : mode === "long" ? 150 : JETON.TAM_SURUM_CAP_SANIYE;
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
    const modeLabel = mode === "short" ? "Kısa (59 sn)" : mode === "long" ? "Uzun (150 sn)" : "Tam Sürüm (40:00)";
    const key = `${mode}-${selected.length}-${fitCount}-${Math.round(total)}`;
    const nowMs = Date.now();
    if (durationWarnRef.current.key === key || nowMs - durationWarnRef.current.at < 6500) return;
    durationWarnRef.current = { key, at: nowMs };
    notify(`⚠️ ${modeLabel} süresi seçili ayetlere yetmiyor · ayet yarım kalmasın diye yaklaşık ilk ${fitCount} ayet alınır, sonrası bırakılır`);
  }, [selected, mode, notify]);

  useEffect(() => {
    const trimmed = query.trim(); if (trimmed.length < 2) { setResults([]); setSearching(false); return; }
    // ★ Türkçe uzatma işaretlerini sadeleştir: "nur" → "Nûr", "yunus" → "Yûnus" eşleşir
    const normTr = (s: string) => s.toLocaleLowerCase("tr").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const matchedSurahs = SURAHS.filter(s => normTr(s.name).includes(normTr(trimmed))).slice(0, 10);
    if (matchedSurahs.length > 0) { setResults(matchedSurahs.map(s => ({ s: s.n, a: 1, name: s.name, tr: `${s.count} ayet • Sure #${s.n}` }))); setSearching(false); return; }
    let live = true; setSearching(true);
    const timer = window.setTimeout(() => { fetchJSON(`https://api.alquran.cloud/v1/search/${encodeURIComponent(trimmed)}/all/${MEAL_EDITIONS[lang]}`).then((json) => { if (!live) return; setResults((json.data?.matches ?? []).slice(0, 30).map((match: { surah: { number: number; englishName: string }; numberInSurah: number; text: string }) => ({ s: match.surah.number, a: match.numberInSurah, name: SURAHS[match.surah.number - 1]?.name ?? match.surah.englishName, tr: match.text }))); }).catch(() => { if (live) setResults([]); }).finally(() => { if (live) setSearching(false); }); }, 420);
    return () => { live = false; window.clearTimeout(timer); };
  }, [query, lang]);

  useEffect(() => {
    silenceAudioOnly();
    if (!previewPlaying || !selected.length) return;
    const current = selected[verseIndex]; if (!current) return;
    if (current.s === 0) { setPreviewDuration(0); setPreviewTime(0); return; }
    const isSurahOnly = Boolean(reciter.surahPattern);
    const audioSrc = isSurahOnly
      ? reciter.surahPattern!.replace("{S}", String(current.s).padStart(3, "0"))
      : reciterAudioUrl(reciter.path, current.s, current.a);
    const audio = new Audio(audioSrc);
    try { (audio as HTMLMediaElement & { referrerPolicy?: string }).referrerPolicy = "no-referrer"; } catch { /* ignore */ }
    audio.preload = "auto"; audio.volume = 0.9;
    let destroyed = false;
    let ayetTimer = 0;
    const cleanup = () => { window.clearTimeout(safetyTimer); window.clearInterval(ayetTimer); audio.pause(); audio.src = ""; };

    if (isSurahOnly) {
      audio.onloadedmetadata = () => {
        if (destroyed) return;
        const sureSüresi = Number.isFinite(audio.duration) ? audio.duration : 0;
        setPreviewDuration(sureSüresi);
        if (sureSüresi <= 0) return;
        const herAyet = sureSüresi / Math.max(selected.length, 1);
        let baslangic = performance.now();
        ayetTimer = window.setInterval(() => {
          if (destroyed) return;
          const elapsed = (performance.now() - baslangic) / 1000;
          setPreviewTime(elapsed);
          const yeniIdx = Math.min(Math.floor(elapsed / herAyet), selected.length - 1);
          if (yeniIdx !== verseIndexRef.current) {
            setVerseIndex(yeniIdx);
          }
        }, 200);
      };
      audio.ontimeupdate = () => { if (!destroyed) setPreviewTime(audio.currentTime); };
      audio.onended = () => { if (!destroyed) { cleanup(); setVerseIndex(selected.length - 1); setPreviewPlaying(false); setPreviewTime(0); } };
      // ★ Hata durumunda ayet konumunu SIFIRLAMA — kullanıcı neredeyse orada kalsın
      audio.onerror = () => {
        if (!destroyed) {
          cleanup();
          setPreviewPlaying(false);
          notify("⚠️ Bu kârinin tam sure kaydı yüklenemedi · ayet konumu korundu");
        }
      };
    } else {
      let advanced = false;
      const advance = () => {
        if (advanced) return; advanced = true;
        window.clearTimeout(safetyTimer);
        window.clearInterval(ayetTimer);
        setPreviewTime(0);
        if (verseIndex < selected.length - 1) setVerseIndex((i) => i + 1);
        else { setVerseIndex(selected.length - 1); setPreviewPlaying(false); }
      };
      audio.ontimeupdate = () => { setPreviewTime(audio.currentTime); setPreviewDuration(Number.isFinite(audio.duration) ? audio.duration : 0); };
      audio.onloadedmetadata = () => setPreviewDuration(audio.duration || 0);
      // ★ Sadece ses gerçekten bittiğinde sonraki ayete geç
      audio.onended = advance;
      // ★ Hata/kesinti durumunda İLERLEME — aksi halde hoca değişince
      //   art arda 404 alıp önizleme son ayete fırlıyordu.
      audio.onerror = () => {
        if (destroyed) return;
        cleanup();
        setPreviewPlaying(false);
        notify("⚠️ Bu kârinin ses kaydı yüklenemedi · ayet konumu korundu");
      };
      audio.onstalled = () => { if (!destroyed) audio.play().catch(() => undefined); };
      audio.onabort = () => { if (!destroyed) setPreviewPlaying(false); };
    }
    const safetyTimer = window.setTimeout(() => { if (!destroyed && audio.readyState < 2) { cleanup(); setPreviewPlaying(false); } }, 9000);
    verseAudioRef.current = audio;
    audio.play().catch(() => { if (!destroyed) { cleanup(); setPreviewPlaying(false); } });
    return () => { destroyed = true; cleanup(); };
  }, [previewPlaying, verseIndex, selected, reciter.path, reciter.surahPattern, notify, silenceAudioOnly]);

  const ensureImage = useCallback((url: string) => {
    let image = imageCache.current.get(url);
    if (!image) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.decoding = "async";
      img.src = url;
      image = img;
      imageCache.current.set(url, image);
    }
    return image;
  }, []);
  const ensureVideo = useCallback((url: string, fallbackUrl?: string) => {
    let video = videoCache.current.get(url);
    if (!video) {
      const el = document.createElement("video");
      el.crossOrigin = "anonymous"; el.src = url; el.muted = true; el.loop = true; el.playsInline = true; el.preload = "auto";
      el.autoplay = true;
      el.defaultMuted = true;
      // ★ Donma koruması: bitiş/takılma anında kendini toparla
      const revive = () => { try { if (el.ended) el.currentTime = 0; el.play().catch(() => undefined); } catch { /* ignore */ } };
      el.addEventListener("ended", revive);
      el.addEventListener("stalled", revive);
      el.addEventListener("suspend", revive);
      el.addEventListener("pause", revive);
      el.play().catch(() => undefined);
      
      if (fallbackUrl && fallbackUrl !== url) {
        el.addEventListener("error", () => {
          if (el.src !== fallbackUrl) {
            el.src = fallbackUrl;
            el.load();
            el.play().catch(() => undefined);
          }
        }, { once: true });
      }
      video = el;
      videoCache.current.set(url, video);
    }
    return video;
  }, []);

  useCanvasDraw({
    canvasRef, selectedRef, verseIndexRef, backgroundRef, ayahBackgroundsRef, aspectRef, themeRef,
    videoWatchdog, imageCache, videoCache, ensureImage, ensureVideo,
    showArapca, showSubMeal, accessTier, arabicFontCss, textSizeMul, shimmerCfg, cardBg, textOffset,
    cineFilter, isMasterSürüm, brandSignature, brandPos, previewFps: renderQuality.previewFps, user,
  });

  const _CANVAS_DRAW_MOVED_TO_HOOK = true; void _CANVAS_DRAW_MOVED_TO_HOOK;
  if (false) useEffect(() => {
    let frame = 0, tick = 0, lastPreviewDraw = 0;
    // ★ Kelime bazlı sarma + aşırı uzun tek kelimeyi karakter bazında zorla kırma.
    //   Böylece Arapça metin hiçbir koşulda sağdan/soldan taşmaz.
    const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
      const lines: string[] = [];
      let line = "";
      const pushHard = (word: string) => {
        let chunk = "";
        for (const ch of word) {
          const cand = chunk + ch;
          if (chunk && ctx.measureText(cand).width > maxWidth) { lines.push(chunk); chunk = ch; }
          else chunk = cand;
        }
        return chunk;
      };
      text.split(/\s+/).filter(Boolean).forEach((word) => {
        if (ctx.measureText(word).width > maxWidth) {
          if (line) { lines.push(line); line = ""; }
          line = pushHard(word);
          return;
        }
        const candidate = line ? `${line} ${word}` : word;
        if (line && ctx.measureText(candidate).width > maxWidth) { lines.push(line); line = word; }
        else line = candidate;
      });
      if (line) lines.push(line);
      return lines;
    };
    const cover = (ctx: CanvasRenderingContext2D, source: CanvasImageSource & { videoWidth?: number; videoHeight?: number; naturalWidth?: number; naturalHeight?: number }, width: number, height: number, zoom = 1) => {
      const sourceWidth = source.videoWidth || source.naturalWidth || 0, sourceHeight = source.videoHeight || source.naturalHeight || 0;
      if (!sourceWidth || !sourceHeight) return false;
      const scale = Math.max(width / sourceWidth, height / sourceHeight) * zoom, drawWidth = sourceWidth * scale, drawHeight = sourceHeight * scale;
      ctx.drawImage(source, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight); return true;
    };
    const drawKaleidoscope = (ctx: CanvasRenderingContext2D, width: number, height: number, tick: number, theme: { bg: string; bg2: string; acc: string; acc2: string }, palette: { primary: string; secondary: string; glow: string; bg: string; bg2: string } | null) => {
      const bg = palette?.bg ?? theme.bg;
      const bg2 = palette?.bg2 ?? theme.bg2;
      const acc = palette?.primary ?? theme.acc;
      const acc2 = palette?.secondary ?? theme.acc2;
      const glow = palette?.glow ?? theme.acc2;
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) * 0.75);
      bgGrad.addColorStop(0, bg2);
      bgGrad.addColorStop(0.55, bg);
      bgGrad.addColorStop(1, "#000000");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2, cy = height / 2;
      const t = tick * 0.008;
      const breathe = 0.85 + Math.sin(t * 0.7) * 0.12;
      const baseR = Math.min(width, height) * 0.32 * breathe;
      const petals = 8;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.15);
      ctx.strokeStyle = glow + "55";
      ctx.lineWidth = 1;
      for (let r = 0; r < 3; r++) {
        const rr = baseR * (1.2 + r * 0.22);
        ctx.beginPath();
        ctx.arc(0, 0, rr, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // Mobilde "lighter" efekti aşırı parlaklık yapıyor, normal kullan
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      ctx.save();
      ctx.translate(cx, cy);
      if (!isMobile) ctx.globalCompositeOperation = "lighter"; // Mobilde flash yok
      for (let i = 0; i < petals; i++) {
        ctx.save();
        ctx.rotate((i / petals) * Math.PI * 2 + t * 0.08);
        const petalLen = baseR * (1 + Math.sin(t + i * 0.4) * 0.15);
        const petalWid = baseR * 0.38;
        const grad = ctx.createLinearGradient(0, 0, 0, -petalLen);
        grad.addColorStop(0, acc + "99"); // Mobilde daha az alpha
        grad.addColorStop(0.5, acc2 + (isMobile ? "33" : "55"));
        grad.addColorStop(1, acc + "00");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(petalWid, -petalLen * 0.35, petalWid * 0.7, -petalLen * 0.85, 0, -petalLen);
        ctx.bezierCurveTo(-petalWid * 0.7, -petalLen * 0.85, -petalWid, -petalLen * 0.35, 0, 0);
        ctx.fill();
        ctx.restore();
      }

      for (let i = 0; i < petals; i++) {
        ctx.save();
        ctx.rotate((i / petals) * Math.PI * 2 - t * 0.12 + Math.PI / petals);
        const petalLen = baseR * 0.55 * (1 + Math.sin(t * 1.3 + i) * 0.1);
        const petalWid = baseR * 0.18;
        const grad = ctx.createLinearGradient(0, 0, 0, -petalLen);
        grad.addColorStop(0, acc2 + (isMobile ? "66" : "aa")); // Mobilde daha az alpha
        grad.addColorStop(1, acc2 + "00");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(petalWid, -petalLen * 0.4, petalWid * 0.5, -petalLen * 0.9, 0, -petalLen);
        ctx.bezierCurveTo(-petalWid * 0.5, -petalLen * 0.9, -petalWid, -petalLen * 0.4, 0, 0);
        ctx.fill();
        ctx.restore();
      }

      const coreR = baseR * 0.12 * (1 + Math.sin(t * 2) * 0.2);
      const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, coreR * 3);
      coreGrad.addColorStop(0, acc2 + "ff");
      coreGrad.addColorStop(0.4, acc + "88");
      coreGrad.addColorStop(1, acc + "00");
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(0, 0, coreR * 3, 0, Math.PI * 2);
      ctx.fill();

      for (let i = 0; i < 24; i++) {
        const angle = (i / 24) * Math.PI * 2 + t * 0.3;
        const dist = baseR * (0.7 + Math.sin(t * 0.5 + i * 1.7) * 0.5);
        const px = Math.cos(angle) * dist;
        const py = Math.sin(angle) * dist;
        const sz = 1 + Math.sin(t * 2 + i) * 0.8;
        const alpha = 0.3 + Math.sin(t * 3 + i * 0.9) * 0.3;
        ctx.fillStyle = acc2 + Math.round(alpha * 255).toString(16).padStart(2, "0");
        ctx.beginPath();
        ctx.arc(px, py, sz, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      ctx.globalCompositeOperation = "source-over";
    };
    const draw = () => {
      const nowFrame = performance.now();
      const minFrameGap = 1000 / renderQuality.previewFps;
      if (lastPreviewDraw && nowFrame - lastPreviewDraw < minFrameGap) {
        frame = requestAnimationFrame(draw);
        return;
      }
      lastPreviewDraw = nowFrame;
      const canvas = canvasRef.current;
      if (canvas) {
        const [width, height] = dimensions(aspectRef.current);
        if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
        const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
        if (ctx) {
          tick += 1;
          // ★ Yüksek kaliteli ölçekleme — video büyütülürken pikselleşme/bulanıklık olmaz
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          const currentItems = selectedRef.current, currentIndex = Math.min(verseIndexRef.current, Math.max(currentItems.length - 1, 0)), currentAyah = currentItems[currentIndex];
          const clip = (currentAyah && ayahBackgroundsRef.current[currentAyah.id]) || backgroundRef.current, currentTheme = themeRef.current;
          ctx.fillStyle = currentTheme.bg; ctx.fillRect(0, 0, width, height); let painted = false;
          const zoom = 1.03 + Math.sin(tick / 500) * 0.012;
          if (cineFilter.css !== "none") { try { ctx.filter = cineFilter.css; } catch { /* ignore */ } }
          if (clip.kind === "vid") {
            const primaryUrl = getVideoUrlSync(clip); const posterUrl = getPosterUrlSync(clip); const video = ensureVideo(primaryUrl, clip.src);
            if (video.paused && !video.ended && video.readyState >= 1) { video.play().catch(() => undefined); }

            // ★ CANLILIK İZLEYİCİSİ — MediaRecorder kaydı sırasında tarayıcı videoyu
            //   kısabiliyor veya buffer'da takılabiliyor. currentTime 300 ms boyunca
            //   ilerlemezse videoyu zorla yeniden başlatıp akışı canlı tutuyoruz.
            {
              const nowMs = performance.now();
              const wd = videoWatchdog.current.get(video) ?? { t: -1, at: nowMs };
              if (video.currentTime !== wd.t) {
                wd.t = video.currentTime;
                wd.at = nowMs;
              } else if (nowMs - wd.at > 300) {
                try {
                  const dur = Number.isFinite(video.duration) ? video.duration : 0;
                  if (video.ended || (dur > 0 && video.currentTime >= dur - 0.05)) video.currentTime = 0;
                  video.play().catch(() => undefined);
                } catch { /* ignore */ }
                wd.at = nowMs;
              }
              videoWatchdog.current.set(video, wd);
            }

            if (video.readyState >= 1 && video.videoWidth > 0) painted = cover(ctx, video, width, height, 1.015);
            if (!painted && clip.poster) {
              const poster = ensureImage(posterUrl ?? clip.poster);
              if (poster.complete && poster.naturalWidth > 0) painted = cover(ctx, poster, width, height, zoom);
              if (!painted) { const p2 = ensureImage(clip.poster); if (p2.complete && p2.naturalWidth > 0) painted = cover(ctx, p2, width, height, zoom); }
            }
          }
          else {
            // ★ Şablon görselde render/önizleme için 1080p sürüm kullanılır (galeri thumbnail hızlı kalsın)
            const hi = ensureImage(toHiRes(clip.src));
            if (hi.complete && hi.naturalWidth > 0) painted = cover(ctx, hi, width, height, zoom);
            if (!painted) { const image = ensureImage(clip.src); if (image.complete) painted = cover(ctx, image, width, height, zoom); }
          }
          try { ctx.filter = "none"; } catch { /* ignore */ }
          if (painted && cineFilter.tint) { ctx.globalAlpha = cineFilter.tintAlpha ?? 0.1; ctx.fillStyle = cineFilter.tint; ctx.fillRect(0, 0, width, height); ctx.globalAlpha = 1; }
          if (!painted) { const palette = CATEGORY_PALETTE[clip.cat] ?? null; drawKaleidoscope(ctx, width, height, tick, currentTheme, palette); }
          const shade = ctx.createLinearGradient(0, 0, 0, height); shade.addColorStop(0, "rgba(0,0,0,.42)"); shade.addColorStop(.42, "rgba(0,0,0,.22)"); shade.addColorStop(1, "rgba(0,0,0,.92)"); ctx.fillStyle = shade; ctx.fillRect(0, 0, width, height);

          if (showArapca) {
            ctx.textAlign = "center"; ctx.shadowColor = "rgba(0,0,0,.65)"; ctx.shadowBlur = 14; ctx.fillStyle = currentTheme.acc2; ctx.font = `700 ${Math.round(height * .025)}px Amiri,serif`; ctx.fillText("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", width / 2, height * .11);
          }

          if (currentAyah) {
            ctx.shadowBlur = 0; ctx.fillStyle = "rgba(255,255,255,.72)"; ctx.font = `600 ${Math.round(height * .0105)}px Inter,sans-serif`;
            ctx.fillText(currentAyah.s > 0 ? `${currentAyah.sName} Suresi  •  ${currentAyah.s}:${currentAyah.a}` : currentAyah.sName, width / 2, height * .148);
            ctx.strokeStyle = currentTheme.acc; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(width * .34, height * .17); ctx.lineTo(width * .47, height * .17); ctx.moveTo(width * .53, height * .17); ctx.lineTo(width * .66, height * .17); ctx.stroke();
            ctx.fillStyle = currentTheme.acc; ctx.save(); ctx.translate(width / 2, height * .17); ctx.rotate(Math.PI / 4); ctx.fillRect(-4, -4, 8, 8); ctx.restore(); ctx.shadowBlur = 16;
            {
              // ★ OTOMATİK SIĞDIRMA MOTORU
              // Uzun ayetlerde metin bloğu; üstteki sure referansı ile alttaki filigran
              // arasındaki GÜVENLİ ALANA sığana kadar punto kademeli küçültülür.
              // Böylece hiçbir ayet sağdan/soldan taşmaz, alttan/üstten kesilmez.
              const arLen = currentAyah.ar.length;
              const trLen = currentAyah.tr.length;

              let arBase = height * 0.028;
              if (arLen > 300) arBase *= 0.52;
              else if (arLen > 200) arBase *= 0.62;
              else if (arLen > 120) arBase *= 0.74;
              else if (arLen > 70) arBase *= 0.85;

              let trBase = width * 0.022;
              if (trLen > 300) trBase *= 0.65;
              else if (trLen > 180) trBase *= 0.78;

              const onlyMeal = !showArapca && showSubMeal;
              const currentAspect = aspectRef.current;
              // Güvenli dikey bant: yalnız meal varsa tam merkeze alınır,
              // Arapça+meal birlikteyse üst referans ve alt filigran arası kullanılır.
              const safeTop = height * (onlyMeal ? 0.34 : 0.163);
              const safeBottom = height * (onlyMeal ? 0.74 : 0.905);
              const safeH = safeBottom - safeTop;
              const arMaxW = width * 0.80;
              // 16:9'da YouTube oynatıcıda taşma görünmemesi için daha dar satır genişliği
              const trMaxW = width * (currentAspect === "16:9" ? 0.56 : currentAspect === "1:1" ? 0.70 : 0.78);

              let arabicSize = 0;
              let arabicHeight = 0;
              let translationSize = 0;
              let arabicLines: string[] = [];
              let translationLines: string[] = [];
              let sepH = 0;
              let totalH = 0;

              // 22 kademede %4 küçülterek sığdır (min punto sınırlarına kadar)
              for (let step = 0; step < 22; step += 1) {
                const shrink = Math.pow(0.96, step);
                arabicSize = Math.round(Math.min(48, Math.max(13, arBase * shrink)) * textSizeMul);
                const trMaxSize = currentAspect === "16:9" ? 21 : onlyMeal ? 26 : 24;
                translationSize = Math.round(Math.min(trMaxSize, Math.max(10, trBase * shrink)) * textSizeMul);
                arabicHeight = arabicSize * 1.72; // hareke/uzatma payı

                ctx.font = `700 ${arabicSize}px ${arabicFontCss}`;
                arabicLines = showArapca ? wrapText(ctx, currentAyah.ar, arMaxW) : [];

                ctx.font = `400 ${translationSize}px Inter,sans-serif`;
                translationLines = showSubMeal ? wrapText(ctx, currentAyah.tr, trMaxW) : [];

                sepH = (arabicLines.length > 0 && translationLines.length > 0) ? translationSize * 1.35 : 0;
                totalH =
                  (arabicLines.length > 0 ? arabicLines.length * arabicHeight : 0) +
                  sepH +
                  (translationLines.length > 0 ? translationLines.length * translationSize * 1.55 : 0);

                if (totalH <= safeH) break;
              }

              // Sadece meal gösteriliyorsa kullanıcı offset'i sıfırlanır, metin tam ortalanır.
              const ox = onlyMeal ? 0 : textOffset.x * width * 0.004;
              const oyRaw = onlyMeal ? 0 : textOffset.y * height * 0.004;
              // Kullanıcı kaydırması dahil, blok her zaman güvenli bandın içinde kalır
              const centeredTop = safeTop + (safeH - totalH) / 2;
              const oy = Math.max(
                safeTop - centeredTop,
                Math.min(oyRaw, safeBottom - totalH - centeredTop)
              );
              let y = centeredTop + oy;

              if (cardBg === "koyu" && totalH > 0) {
                ctx.shadowBlur = 0;
                ctx.fillStyle = "rgba(6,7,12,.62)";
                const pad = arabicSize * 0.7;
                const rw = width * .9, rh = totalH + pad * 2, rx = width / 2 - rw / 2, ry = y - pad;
                ctx.beginPath();
                ctx.roundRect(rx, ry, rw, rh, 18);
                ctx.fill();
                ctx.strokeStyle = `${currentTheme.acc}55`; ctx.lineWidth = 1.5; ctx.stroke();
              }

              const goldFill = () => {
                if (shimmerCfg.still) { ctx.fillStyle = shimmerCfg.c1; return; }
                const g = ctx.createLinearGradient(0, 0, width, 0);
                const shift = (tick * 0.004) % 1;
                g.addColorStop(Math.max(0, shift - 0.25), shimmerCfg.c1);
                g.addColorStop(shift, "#ffffff");
                g.addColorStop(Math.min(1, shift + 0.25), shimmerCfg.c2);
                ctx.fillStyle = g;
              };
              if (showArapca && arabicLines.length > 0) {
                ctx.font = `700 ${arabicSize}px ${arabicFontCss}`; goldFill(); ctx.shadowColor = shimmerCfg.glow; ctx.shadowBlur = shimmerCfg.still ? 14 : 22;
                const prevDir = (ctx as CanvasRenderingContext2D & { direction?: string }).direction;
                try { (ctx as CanvasRenderingContext2D & { direction?: string }).direction = "rtl"; } catch { /* ignore */ }
                arabicLines.forEach((line) => { ctx.fillText(line, width / 2 + ox, y + arabicSize * 0.8); y += arabicHeight; });
                try { (ctx as CanvasRenderingContext2D & { direction?: string }).direction = prevDir || "ltr"; } catch { /* ignore */ }
                ctx.shadowBlur = 0; ctx.strokeStyle = "rgba(255,255,255,.22)"; ctx.beginPath(); ctx.moveTo(width * .28, y + 8); ctx.lineTo(width * .72, y + 8); ctx.stroke();
                y += sepH;
              }
              if (showSubMeal && translationLines.length > 0) {
                ctx.font = `400 ${translationSize}px Inter,sans-serif`;
                ctx.fillStyle = "rgba(255,255,255,.95)";
                ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
                ctx.shadowBlur = 10;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 2;
                translationLines.forEach((line) => { ctx.fillText(line, width / 2 + ox, y + translationSize); y += translationSize * 1.6; });
                ctx.shadowBlur = 0;
              }

            }
          } else { ctx.shadowBlur = 0; ctx.fillStyle = "rgba(255,255,255,.5)"; ctx.font = `500 ${Math.round(height * .018)}px Inter,sans-serif`; ctx.fillText("Kütüphaneden ayet seçin", width / 2, height / 2); }

          // ★ Free ve Pro paketlerde sağ alt köşeye mecburi nurstudyo.com filigranı gömülür.
          //   Elit üye için (veya God Mode) hiçbir reklam / filigran basılmaz (%100 temiz, white-label).
          //   Misafir kullanıcı (giriş yapmamış): accessTier görsel olarak "elit" ama filigran yine de basılır.
          const realTierForWatermark = !user && !isMasterSürüm ? "free" : accessTier;
          if (realTierForWatermark === "free" || realTierForWatermark === "pro") {
            ctx.save();
            ctx.font = `700 ${Math.round(height * 0.018)}px Inter,sans-serif`;
            ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
            ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
            ctx.shadowBlur = 4;
            ctx.textAlign = "right";
            ctx.fillText("nurstudyo.com", width * 0.95, height * 0.965);
            ctx.restore();
          }

          // ★ MARKA / KANAL İMZASI — Elit üyeler + God Mode. Konum seçilebilir.
          if ((isMasterSürüm || accessTier === "elit") && brandSignature.trim()) {
            ctx.save();
            const sigSize = Math.round(height * 0.019);
            ctx.font = `800 ${sigSize}px Inter,sans-serif`;
            const isLeft = brandPos === "sol-ust" || brandPos === "sol-alt";
            const isTop = brandPos === "sol-ust" || brandPos === "sag-ust";
            const sigX = isLeft ? width * 0.05 : width * 0.95;
            const sigY = isTop ? height * 0.052 : height * 0.965;
            ctx.textAlign = isLeft ? "left" : "right";
            const gx = isLeft ? sigX : sigX - sigSize * 9;
            const sigGrad = ctx.createLinearGradient(gx, 0, gx + sigSize * 9, 0);
            sigGrad.addColorStop(0, "#f5dda6");
            sigGrad.addColorStop(0.5, "#ffffff");
            sigGrad.addColorStop(1, "#d7aa52");
            ctx.fillStyle = sigGrad;
            ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
            ctx.shadowBlur = 8;
            ctx.shadowOffsetY = 1;
            ctx.fillText(brandSignature.trim(), sigX, sigY);
            ctx.restore();
          }
        }
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw); return () => cancelAnimationFrame(frame);
  }, [ensureImage, ensureVideo, showArapca, showSubMeal, accessTier, arabicFontCss, textSizeMul, shimmerCfg, cardBg, textOffset, cineFilter, isMasterSürüm, brandSignature, brandPos, renderQuality.previewFps]);

  const detectCategoryFromAyah = useCallback((ar: string, tr: string, surahName = ""): CatId => {
    void ar;
    const surahKey = surahName.toLocaleLowerCase("tr").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (SURAH_CATEGORY_HINT[surahKey]) return SURAH_CATEGORY_HINT[surahKey];
    const norm = (s: string) => s.toLocaleLowerCase("tr");
    const words = norm(`${surahName} ${tr}`).split(/[^a-zçğıöşüâîû]+/i).filter(Boolean);
    let matched: CatId | null = null;
    let bestLen = 0;
    for (const word of words) {
      for (const [kw, catVal] of Object.entries(KEYWORD_CATEGORY_FALLBACK)) {
        const kwNorm = norm(kw);
        const isMatch = kwNorm.length <= 3 ? word === kwNorm : word.startsWith(kwNorm) || word === kwNorm;
        if (isMatch && kwNorm.length > bestLen) {
          matched = catVal;
          bestLen = kwNorm.length;
        }
      }
    }
    if (matched) return matched;

    // ★ ÇEŞİTLİLİK MOTORU — eşleşme yoksa artık HER ZAMAN "musaf" (Kur'an) dönmüyor.
    //   Ayet metninden üretilen stabil hash ile estetik kategoriler arasında dağıtılır.
    //   Böylece her ayet farklı bir atmosfer alır, aynı Kur'an görseli tekrar etmez.
    const AESTHETIC_POOL: CatId[] = [
      "namaz", "yildizlar", "deniz", "daglar", "gunbatimi",
      "gece", "selale", "orman", "cicekler", "musaf",
    ];
    let h = 2166136261;
    const src = `${surahName}|${tr}`;
    for (let i = 0; i < src.length; i += 1) { h ^= src.charCodeAt(i); h = Math.imul(h, 16777619); }
    return AESTHETIC_POOL[(h >>> 0) % AESTHETIC_POOL.length];
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
      setVerseIndex(selectedRef.current.length); setShareTitle(genTitle(meta.name, s, a)); setShareDescription(genDesc(`${meta.name} Suresi`, s, a, reciter.name)); notify(`${meta.name} ${s}:${a} eklendi`);
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

  const isClipAccessible = useCallback((clip: Clip): boolean => {
    if (isMasterSürüm) return true;
    const catTier = KATEGORI_TIER[clip.cat as CatId] ?? "free";
    if (!tierAtLeast(accessTier, catTier)) return false;
    const sameCat = combinedAllClips.filter((c) => c.cat === clip.cat && c.kind === clipKind);
    const idx = sameCat.findIndex((c) => c.id === clip.id);
    const nextTier: Tier = catTier === "free" ? "pro" : catTier === "pro" ? "elit" : "elit";
    if (idx >= FREE_VIDEOS_PER_CATEGORY && !tierAtLeast(accessTier, nextTier)) return false;
    return true;
  }, [accessTier, clipKind, combinedAllClips, isMasterSürüm]);

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

  const playReciterPreview = useCallback((id: string) => {
    silenceAllAudio();
    const prev = reciterPreviewRef.current;
    if (prev) { prev.pause(); prev.oncanplaythrough = null; prev.onloadeddata = null; prev.onended = null; prev.onerror = null; try { prev.src = ""; } catch { /* ignore */ } reciterPreviewRef.current = null; }
    if (previewReciterId === id) { setPreviewReciterId(null); return; }
    const target = RECITERS.find((item) => item.id === id);
    const sample = selectedRef.current[0] ?? { s: 1, a: 1 };
    if (!target) return;
    const startPreview = (src: string) => {
      const prevInStart = reciterPreviewRef.current;
      if (prevInStart) {
        prevInStart.pause();
        prevInStart.onended = null;
        prevInStart.onerror = null;
        try { prevInStart.src = ""; } catch { /* ignore */ }
      }
      const audio = new Audio(src); audio.preload = "auto"; audio.volume = 0.88;
      try { (audio as HTMLMediaElement & { referrerPolicy?: string }).referrerPolicy = "no-referrer"; } catch { /* ignore */ }
      reciterPreviewRef.current = audio; setPreviewReciterId(id);
      const cleanup = () => { if (reciterPreviewRef.current !== audio) return; setPreviewReciterId(null); reciterPreviewRef.current = null; };
      audio.onended = cleanup;
      // ★ ARTIK BAŞKA HOCAYA DÜŞMÜYOR — yanlış ses çalmaz, dürüstçe uyarır
      audio.onerror = () => {
        if (reciterPreviewRef.current !== audio) return;
        cleanup();
        notify(`⚠️ ${target?.name ?? "Kâri"} · ses kaydı şu an yüklenemedi. Lütfen başka bir kâri deneyin.`);
      };
      audio.play().catch(() => { const onReady = () => { audio.removeEventListener("loadeddata", onReady); if (reciterPreviewRef.current === audio) { audio.play().catch(cleanup); } }; audio.addEventListener("loadeddata", onReady); });
      previewTimerRef.current = window.setTimeout(() => { if (reciterPreviewRef.current === audio) { audio.pause(); cleanup(); } }, 10_000);
    };
    startPreview(
      target.surahPattern
        ? target.surahPattern.replace("{S}", String(sample.s).padStart(3, "0"))
        : reciterAudioUrl(target.path, sample.s, sample.a)
    );
  }, [previewReciterId, notify, silenceAllAudio]);

  const handleGenerate = useCallback(async () => {
    if (generating) { stopGenerationRef.current(); return; }
    // ★ MİSAFİR MODU — üye olmadan 2 deneme videosu üretilebilir, indirme üyelik ister
    if (!user && !isMasterSürüm) {
      const used = getGuestUsed();
      if (used >= GUEST_FREE_VIDEOS) {
        notify("🎁 Misafir deneme hakkın doldu · Google ile 3 saniyede ücretsiz üye ol, +20 jeton kazan");
        setLoginTab("register");
        setModal("login");
        return;
      }
      notify(`👋 Misafir denemesi ${used + 1}/${GUEST_FREE_VIDEOS} · indirmek için üyelik gerekir`);
    }
    const rl = checkRateLimit("video");
    if (!rl.allowed) {
      notify(`${rl.message} (${Math.ceil(rl.retryAfterMs / 1000)} sn kaldı)`);
      return;
    }
    if (!selected.length) { notify("Önce en az bir ayet seçin"); return; }
    if (!window.MediaRecorder) { notify("Tarayıcınız video üretimini desteklemiyor"); return; }
    // ★ Safari / eski tarayıcı: canvas yakalama yoksa net uyarı (iOS Safari 15 altı)
    const canvasEl = canvasRef.current;
    if (!canvasEl || typeof canvasEl.captureStream !== "function") {
      notify("⚠️ Bu tarayıcı canvas kaydını desteklemiyor · Chrome, Edge veya güncel Safari kullanın");
      return;
    }
    const surahOnlyReciter = Boolean(reciter.surahPattern);
    if (surahOnlyReciter && !isWholeSurahSelected(selected, SURAHS)) {
      notify(`⚠️ ${reciter.name} hocanın sesi yalnızca tüm surede uygulanabilir · lütfen "Tüm Sure" butonuyla ekleyin`);
      return;
    }
    const formatCount = Math.max(batchFormats.length, 1);
    const costPerVideo = videoMaliyeti(mode, accessTier);
    const isGuest = !user && !isMasterSürüm;
    // God Mode ve misafir deneme videolarında jeton harcanmaz
    const totalCost = isMasterSürüm || isGuest ? 0 : costPerVideo * formatCount;
    if (RENDER_AUTH_LIVE && !isMasterSürüm && !isGuest) {
      try {
        const response = await fetch("/api/render/authorize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode, formats: batchFormats.length ? batchFormats : [aspect] }),
        });
        const data = await response.json().catch(() => null) as { ok?: boolean; error?: string; cost?: number } | null;
        if (!response.ok || !data?.ok) {
          notify(data?.error || "Üretim yetkisi doğrulanamadı");
          return;
        }
        if (typeof data.cost === "number" && data.cost !== totalCost) {
          notify("Üretim maliyeti sunucu doğrulamasıyla uyuşmadı");
          return;
        }
      } catch {
        notify("Üretim yetkisi için sunucuya ulaşılamadı");
        return;
      }
    }
    if (jetonCount < totalCost) {
      notify(`Bu üretim için ${totalCost} jeton gerekiyor · mevcut: ${jetonCount}`);
      openPremium("jeton");
      return;
    }
    let jetonCharged = false;
    let userStopped = false;
    silenceAllAudio();
    setGenerating(true); setProgress(2);
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext, audioContext = new AudioContextClass();
      const buffers: AudioBuffer[] = [], usedItems: SelectedAyah[] = [], audioOffsets: number[] = [];
      const ayetSüreleri: Array<{ start: number; dur: number }> = [];
      const cap = mode === "short" ? 59 : mode === "long" ? 150 : JETON.TAM_SURUM_CAP_SANIYE; let cursor = 0;
      if (surahOnlyReciter) {
        setProgress(10);
        const sNum = selected[0].s;
        const url = reciter.surahPattern!.replace("{S}", String(sNum).padStart(3, "0"));
        // ★ Muhammed el-Fakîh hocada atmosferlerin hızlı hızlı geçmesini engelle
        selected.forEach((item) => {
          ayahBackgroundsRef.current[item.id] = backgroundRef.current;
        });
        try {
          const response = await fetch(url);
          if (response.ok) {
            const buffer = await audioContext.decodeAudioData(await response.arrayBuffer());
            audioOffsets.push(0); buffers.push(buffer); usedItems.push(...selected);
            cursor = Math.min(buffer.duration, cap) + 0.03;
            const sureSüresi = cursor - 0.03;
            const herAyetSüresi = sureSüresi / Math.max(selected.length, 1);
            selected.forEach((_, i) => { ayetSüreleri.push({ start: herAyetSüresi * i, dur: herAyetSüresi }); });
          }
        } catch { /* ignore */ }
      } else {
        for (let index = 0; index < selected.length; index += 1) {
          const item = selected[index]; setProgress(4 + Math.round((index / selected.length) * 22));
          try {
            const response = await fetch(reciterAudioUrl(reciter.path, item.s, item.a));
            if (!response.ok) continue;
            const buffer = await audioContext.decodeAudioData(await response.arrayBuffer());
            if (cursor > 0 && cursor + buffer.duration > cap) break;
            audioOffsets.push(cursor); buffers.push(buffer); usedItems.push(item);
            ayetSüreleri.push({ start: cursor, dur: buffer.duration });
            cursor += buffer.duration + .03;
          } catch { }
        }
      }
      if (!surahOnlyReciter && usedItems.length < selected.length) {
        const dropped = selected.length - usedItems.length;
        const modeLabel = mode === "short" ? "Kısa (59 sn)" : mode === "long" ? "Uzun (150 sn)" : "Tam Sürüm (24:35)";
        notify(`⚠️ ${modeLabel} süresi aşıldı · son ${dropped} ayet eklenmedi · ${usedItems.length} ayet ile üretiliyor`);
      }
      if (!buffers.length) throw new Error("Ses dosyaları alınamadı");
      const total = cursor - .03, offline = new OfflineAudioContext(2, Math.ceil((total + .1) * 48000), 48000);
      buffers.forEach((buffer, index) => { const source = offline.createBufferSource(), gain = offline.createGain(); source.buffer = buffer; const start = audioOffsets[index], end = start + buffer.duration; const fadeIn = Math.min(.06, buffer.duration * .1), fadeOut = Math.min(.15, buffer.duration * .1); gain.gain.setValueAtTime(0, start); gain.gain.linearRampToValueAtTime(.92, start + fadeIn); gain.gain.setValueAtTime(.92, Math.max(start + fadeIn, end - fadeOut)); gain.gain.linearRampToValueAtTime(0.001, end); source.connect(gain).connect(offline.destination); source.start(start); });
      setProgress(28); const rendered = await offline.startRendering(), canvas = canvasRef.current; if (!canvas) throw new Error("Önizleme bulunamadı");

      const renderClips = usedItems.map((item) => ayahBackgroundsRef.current[item.id] || backgroundRef.current);
      const uniqueRenderClips = Array.from(new Map(renderClips.map((clip) => [clip.id, clip])).values());
      await Promise.all(uniqueRenderClips.map((clip) => new Promise<void>((resolve) => {
        if (clip.kind === "img") {
          // ★ Render için 1080p sürümü önceden yükle (keskin çıktı)
          const image = ensureImage(toHiRes(clip.src));
          ensureImage(clip.src); // yedek thumbnail
          if (image.complete && image.naturalWidth > 0) { resolve(); return; }
          const done = () => resolve();
          image.addEventListener("load", done, { once: true });
          image.addEventListener("error", done, { once: true });
          window.setTimeout(done, 6000);
          return;
        }
        getVideoUrl(clip).then((primaryUrl) => {
          const video = ensureVideo(primaryUrl, clip.src);
          if (video.readyState >= 2 && video.videoWidth > 0) { video.play().catch(() => undefined); resolve(); return; }
          const done = () => { video.play().catch(() => undefined); resolve(); };
          video.addEventListener("loadeddata", done, { once: true });
          video.addEventListener("canplay", done, { once: true });
          video.addEventListener("error", done, { once: true });
          video.load();
          window.setTimeout(done, 7000);
          void getPosterUrl(clip).catch(() => undefined);
        }).catch(() => { resolve(); });
      })));
      const formats = batchFormats.length ? batchFormats : [aspect];
      for (let formatIndex = 0; formatIndex < formats.length; formatIndex += 1) {
        const outputAspect = formats[formatIndex]; aspectRef.current = outputAspect; const [width, height] = dimensions(outputAspect); canvas.width = width; canvas.height = height;
        verseIndexRef.current = 0;
        setVerseIndex(0);
        await new Promise((resolve) => window.setTimeout(resolve, 240));
        // ★ Cihaza göre adaptif FPS/bitrate: kötü cihazlarda donma/kasma azaltılır
        const stream = canvas.captureStream(renderQuality.renderFps), destination = audioContext.createMediaStreamDestination(), player = audioContext.createBufferSource(); player.buffer = rendered; player.connect(destination);
        const combined = new MediaStream([...stream.getVideoTracks(), ...destination.stream.getAudioTracks()]), mime = pickMime();
        const pxCount = width * height;
        const baseBitrate = pxCount >= 1920 * 1080 ? 24_000_000 : pxCount >= 1080 * 1350 ? 20_000_000 : 16_000_000;
        const targetBitrate = Math.round(baseBitrate * renderQuality.bitrateScale);
        const recorder = mime ? new MediaRecorder(combined, { mimeType: mime, videoBitsPerSecond: targetBitrate, audioBitsPerSecond: renderQuality.audioBitrate }) : new MediaRecorder(combined);
        const chunks: Blob[] = []; recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
        const stopped = new Promise<void>((resolve) => { recorder.onstop = () => resolve(); }); const startedAt = performance.now(); let finished = false; let safetyTimer = 0;
        let lastVisualIndex = 0;
        let lastProgress = -1;
        // ★ syncTimer 50ms → 200ms: çok sık setProgress/setVerseIndex çağrısı
        //   canvas draw'u bloke edip video donmasına yol açıyordu.
        const syncTimer = window.setInterval(() => {
          const elapsed = (performance.now() - startedAt) / 1000;
          const currentProgress = (formatIndex + Math.min(elapsed / total, 1)) / formats.length;
          const nextProgress = 30 + Math.round(currentProgress * 67);
          if (nextProgress !== lastProgress) {
            lastProgress = nextProgress;
            setProgress(nextProgress);
          }
          let idx = 0;
          for (let i = 0; i < ayetSüreleri.length; i += 1) {
            if (elapsed >= ayetSüreleri[i].start) idx = i;
          }
          if (idx !== lastVisualIndex) {
            lastVisualIndex = idx;
            // ★ Render sırasında React state güncellemesi canvas'ı dondurabiliyor.
            //   Kayıtta sadece ref yeterli; UI state'i en sona bırakıyoruz.
            verseIndexRef.current = idx;
          }
        }, 200);
        const finishRecording = () => { if (finished) return; finished = true; window.clearInterval(syncTimer); window.clearTimeout(safetyTimer); try { player.stop(); } catch { } if (recorder.state !== "inactive") recorder.stop(); };
        const userStop = () => { userStopped = true; finishRecording(); };
        stopGenerationRef.current = userStop;
        safetyTimer = window.setTimeout(finishRecording, total * 1000 + 750);
        player.onended = finishRecording;
        // ★ 1 saniyelik parçalar halinde data al: uzun WebM buffer'ı donuk video üretebiliyor.
        recorder.start(1000);
        player.start();
        await stopped;
        stream.getTracks().forEach((track) => track.stop());
        destination.stream.getTracks().forEach((track) => track.stop());
        if (userStopped) { chunks.length = 0; notify("Üretim iptal edildi · jeton düşmedi"); continue; }
        let blob = new Blob(chunks, { type: (mime || "video/webm").split(";")[0] });
        // ★ Gerçek kayıt süresi (ms) — hedef süre değil, fiilen kaydedilen süre.
        //   Android galeri / TikTok bu değeri okuduğu için birebir doğru olmalı.
        const recordedMs = Math.max(1000, Math.round(performance.now() - startedAt));
        if (blob.type.includes("webm")) {
          blob = await new Promise<Blob>((resolve) => {
            let settled = false;
            const finish = (fixed: Blob) => { if (!settled) { settled = true; resolve(fixed); } };
            try {
              // TikTok/WhatsApp/Galeri için duration metadata düzelt
              fixWebmDuration(blob, recordedMs, (fixedBlob) => {
                // MP4 olarak da dene (daha iyi uyumluluk)
                if (fixedBlob && fixedBlob.size > 0) {
                  finish(fixedBlob);
                } else {
                  finish(blob);
                }
              });
              // Fallback: 5 saniye içinde düzelmezse orijinali kullan
              window.setTimeout(() => finish(blob), 5000);
            } catch (err) {
              console.error('fixWebmDuration hatası:', err);
              finish(blob);
            }
          });
        }
        const output: Output = { id: uid(), url: URL.createObjectURL(blob), mime: blob.type, size: blob.size, duration: total, label: `${usedItems[0].sName} ${usedItems[0].s}:${usedItems[0].a}${usedItems.length > 1 ? ` +${usedItems.length - 1}` : ""} • ${reciter.name} • ${outputAspect}`, ext: blob.type.includes("mp4") ? "mp4" : "webm" };
        setOutputs((current) => [output, ...current].slice(0, 8)); setActiveOutputId(output.id);
      }
      if (!isMasterSürüm && !userStopped && !jetonCharged) {
        setProgress(98);
        if (isGuest) {
          // ★ Misafir: jeton düşmez, sadece deneme hakkı azalır
          bumpGuestUsed();
        } else {
          const remainingJeton = Math.max(0, getJeton() - totalCost);
          persistJetonSecure(remainingJeton);
          setJetonCount(remainingJeton);
        }
        jetonCharged = true;
      }
      if (userStopped) { audioContext.close().catch(() => undefined); return; }
      audioContext.close().catch(() => undefined); setProgress(100);
      notify(t("successVideoReady"));
    } catch (error) {
      console.error(error);
      reportRenderError(error);
      if (!userStopped) notify("Video üretimi sırasında teknik bir takılma oluştu");
    }
    finally { aspectRef.current = aspect; setGenerating(false); window.setTimeout(() => setProgress(0), 500); }
  }, [aspect, batchFormats, generating, jetonCount, mode, notify, openPremium, reciter, selected, silenceAllAudio, t, accessTier, isMasterSürüm, ensureImage, ensureVideo, renderQuality.renderFps, renderQuality.bitrateScale, renderQuality.audioBitrate]);

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

  const nextPrayer = useMemo(() => {
    if (!prayerTimings) return null;
    let next: { name: string; key: string; diff: number } | null = null;
    for (const [name, key] of PRAYERS) {
      const value = prayerTimings[key]; if (!value) continue;
      const [hour, minute] = value.slice(0, 5).split(":").map(Number), target = new Date(now);
      target.setHours(hour, minute, 0, 0);
      let diff = target.getTime() - now.getTime();
      if (diff <= 0) diff += 86400000;
      if (!next || diff < next.diff) next = { name, key, diff };
    }
    return next;
  }, [now, prayerTimings]);

  const filteredClips = useMemo(() => {
    let pool = combinedAllClips;
    pool = pool.filter((clip) => clip.kind === clipKind);
    if (atmosCategory !== "all") { pool = pool.filter((clip) => clip.cat === atmosCategory); }
    const value = atmosQuery.trim().toLocaleLowerCase("tr");
    if (value) { pool = pool.filter((clip) => clip.label.toLocaleLowerCase("tr").includes(value)); }
    return [...pool].sort((a, b) => {
      const sameCatA = combinedAllClips.filter(c => c.cat === a.cat && c.kind === clipKind);
      const sameCatB = combinedAllClips.filter(c => c.cat === b.cat && c.kind === clipKind);
      const idxA = sameCatA.findIndex(c => c.id === a.id);
      const idxB = sameCatB.findIndex(c => c.id === b.id);
      const catTierA = KATEGORI_TIER[a.cat as CatId] ?? "free";
      const catTierB = KATEGORI_TIER[b.cat as CatId] ?? "free";
      const nextTierA: Tier = catTierA === "free" ? "pro" : catTierA === "pro" ? "elit" : "elit";
      const nextTierB: Tier = catTierB === "free" ? "pro" : catTierB === "pro" ? "elit" : "elit";
      const lockedA = (!tierAtLeast(accessTier, catTierA)) || (tierAtLeast(accessTier, catTierA) && idxA >= FREE_VIDEOS_PER_CATEGORY && !tierAtLeast(accessTier, nextTierA));
      const lockedB = (!tierAtLeast(accessTier, catTierB)) || (tierAtLeast(accessTier, catTierB) && idxB >= FREE_VIDEOS_PER_CATEGORY && !tierAtLeast(accessTier, nextTierB));
      return Number(lockedA) - Number(lockedB);
    });
  }, [atmosCategory, atmosQuery, clipKind, combinedAllClips, accessTier]);

  const filteredCities = useMemo(() => { const value = prayerSearch.trim().toLocaleLowerCase("tr"); return value ? TURKISH_CITIES.filter((city) => city.toLocaleLowerCase("tr").includes(value)) : TURKISH_CITIES; }, [prayerSearch]);

  const pickClip = (clip: Clip) => { if (pickingFor) setAyahBackgrounds((current) => ({ ...current, [pickingFor]: clip })); else setBackground(clip); notify(`Atmosfer seçildi: ${clip.label}`); setModal(null); setPickingFor(null); };

  const handleLoginSubmit = () => {
    const rl = checkRateLimit("auth");
    if (!rl.allowed) { notify(`${rl.message} (${Math.ceil(rl.retryAfterMs / 1000)} sn kaldı)`); return; }
    const email = phone.includes("@") ? phone.trim().toLowerCase() : "demo@nurstudio.app";
    const isKurucuAdmin = isAdminEmail(email);
    const userTier: Tier = isKurucuAdmin ? "elit" : tier;
    const userJeton = isKurucuAdmin ? Math.max(1000, getJeton()) : getJeton();

    const newUser: User = {
      id: uid(),
      name: isKurucuAdmin ? "Ömer Kaya (Kurucu Admin)" : "Demo Kullanıcı",
      email,
      phone,
      verified: true,
    };
    setUser(newUser);
    localStorage.setItem("nur_user", JSON.stringify(newUser));

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
  };

  const handleRegisterSubmit = () => {
    const rl = checkRateLimit("auth");
    if (!rl.allowed) { notify(`${rl.message} (${Math.ceil(rl.retryAfterMs / 1000)} sn kaldı)`); return; }
    const email = phone.includes("@") ? phone.trim().toLowerCase() : "user@nurstudio.app";
    const isKurucuAdmin = isAdminEmail(email);

    const newUser: User = {
      id: uid(),
      name: isKurucuAdmin ? "Ömer Kaya (Kurucu Admin)" : "Yeni Kullanıcı",
      email,
      phone,
      verified: true,
    };
    setUser(newUser);
    localStorage.setItem("nur_user", JSON.stringify(newUser));

    if (isKurucuAdmin) {
      setAdminGodMode(true);
      setTier("elit");
      setCurrentTier("elit");
      setJetonCount(1000);
      persistJetonSecure(1000);
      syncUserInDb(email, newUser.name, "elit", 1000);
      notify("🛡️ Kurucu Admin Hesabı Oluşturuldu! 1000 Jeton + Nûr Elit tanımlandı.");
    } else {
      let nextJeton = getJeton();
      if (!localStorage.getItem("nur_register_bonus_granted")) {
        nextJeton = nextJeton + JETON.KAYIT_BONUSU_FREE;
        persistJetonSecure(nextJeton);
        localStorage.setItem("nur_register_bonus_granted", "1");
        setJetonCount(nextJeton);
        notify(`🎉 Kayıt başarılı! Hoş geldiniz — +${JETON.KAYIT_BONUSU_FREE} jeton hediye edildi.`);
      } else {
        notify("Kayıt başarılı! Hoş geldiniz.");
      }
      syncUserInDb(email, newUser.name, "free", nextJeton);
    }
    setModal(null);
  };

  // ★ MİSAFİR MODU — üye olmadan deneme hakkı
  const GUEST_FREE_VIDEOS = 2;
  const getGuestUsed = () => {
    try { return Number(localStorage.getItem("nur_guest_videos") || 0); } catch { return 0; }
  };
  const bumpGuestUsed = () => {
    try { localStorage.setItem("nur_guest_videos", String(getGuestUsed() + 1)); } catch { /* ignore */ }
  };
  const handleGuestContinue = useCallback(() => {
    const used = getGuestUsed();
    const left = Math.max(0, GUEST_FREE_VIDEOS - used);
    if (left <= 0) {
      notify("🎁 Misafir deneme hakkın doldu · Google ile 3 saniyede ücretsiz üye ol, +20 jeton kazan");
      return;
    }
    setModal(null);
    notify(`👋 Misafir modundasın · ${left} deneme videosu hakkın var · indirmek için üyelik gerekir`);
  }, [notify]);

  const handleForgotPassword = () => { const code = String(Math.floor(100000 + Math.random() * 900000)); setSentCode(code); setLoginTab("verify"); notify(`Doğrulama kodu: ${code}`); };
  const handleVerifyCode = () => { if (verifyCode === sentCode) { notify("Kod doğrulandı! Şifrenizi sıfırlayabilirsiniz."); setLoginTab("forgot"); } else { notify("Kod hatalı!"); } };
  const handleLogout = () => {
    fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    setUser(null);
    setAdminGodMode(false);
    localStorage.removeItem("nur_user");
    notify("Çıkış yapıldı.");
  };

  void _showGiftModalUnused; void _setShowGiftModalUnused; void user; void lockTip; void adminError; void adminEmailInput;

  return (
    <div className="relative min-h-screen overflow-x-hidden text-[13px]" style={{ color: "var(--text)" }}>
      <div className="pointer-events-none fixed inset-0 -z-10" style={{ background: `radial-gradient(900px 560px at 88% -8%,color-mix(in srgb,var(--accent) 12%,transparent),transparent 60%),radial-gradient(800px 600px at -10% 100%,color-mix(in srgb,var(--accent) 7%,transparent),transparent 58%),var(--page)` }} />

      {/* ANNOUNCEMENT BAR (DİNAMİK MANEVİ TAKVİM & TIKLA-AL ÖDÜL ŞERİDİ) */}
      <AnnouncementBar
        notify={notify}
        onRewardClaimed={(newJeton) => {
          setJetonCount(newJeton);
        }}
        onTamperAttempt={(reason) => {
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
      />

      {/* HERO SECTION */}
      <section className="relative mx-auto max-w-[1500px] px-4 pb-3 pt-10 text-center sm:pt-14">
        <div className="ornament font-arabic text-[42px] leading-none" style={{ color: "var(--accent)" }}>﷽</div>
        <h1 className="shimmer-text mt-4 font-display text-[clamp(28px,4.8vw,56px)] font-black tracking-[.12em]">İSLAMÎ VİDEO ÜRETİCİ</h1>
        <div className="tagline-viewport mx-auto mt-3 w-full max-w-3xl overflow-hidden">
          <div className="tagline-track">
            {[0, 1].map((loop) => (
              <span key={loop} className="tagline-seq" aria-hidden={loop === 1}>
                {[
                  "⚡ 1080p ve 4K Ultra HD çözünürlükte, sıfır kayıpsız sinematik render gücü.",
                  "🤖 Yeni nesil AI asistanı ile otomatik SEO başlığı, açıklama ve viral hashtag üretimi.",
                  "🎯 Küresel dil paketleri (i18n) ile tüm dünyaya hitap eden çok dilli içerik fabrikası.",
                  "🎵 Mücevved ve Murattal kâri tilavetleriyle milisaniyelik karaoke tarzı altyazı senkronizasyonu.",
                ].map((line) => (
                  <span key={line} className="tagline-item">
                    <Sparkles size={12} className="tagline-star" strokeWidth={2.6} />
                    <span className="tagline-text">{line}</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
        <div className="mx-auto mt-5 h-px w-52 animate-glow" style={{ background: "linear-gradient(90deg,transparent,var(--accent),transparent)" }} />
      </section>

      <SimpleModePanel
        daily={daily}
        selectedCount={selected.length}
        generating={generating}
        progress={progress}
        simpleMode={simpleMode}
        onAddDaily={() => {
          if (!daily) { notify("Günün ayeti yükleniyor, birazdan tekrar deneyin"); return; }
          toggleAyah(daily.s, daily.a, daily.tr);
        }}
        onRandomAtmosphere={() => randomizeBackgrounds()}
        onGenerate={handleGenerate}
        onToggleAdvanced={() => setSimpleMode((value) => !value)}
      />

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
          setLoginTab={setLoginTab}
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
        openLegalTab={(tab) => { setLegalTab(tab); setTosOpen(true); }}
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

declare global { interface Window { webkitAudioContext: typeof AudioContext } }
