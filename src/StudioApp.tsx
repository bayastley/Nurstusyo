import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import fixWebmDuration from "fix-webm-duration";
import { X, AlertTriangle, Ban, BookOpen, Zap } from "lucide-react";
import { StudioHeroSection } from "./studio/StudioHeroSection";
import {
  CATEGORY_ICONS, DEFAULT_MASTER_SURUM, RENDER_AUTH_LIVE, SERVER_BAN_LIVE,
  MODES, ASPECTS, PRAYERS, KEYWORD_CATEGORY_FALLBACK, SURAH_CATEGORY_HINT,
  ARABIC_FONTS as _ARABIC_FONTS, SHIMMER_STYLES as _SHIMMER_STYLES, CINE_FILTERS as _CINE_FILTERS,
} from "./studio/studioConstants";
import { useCanvasDraw } from "./studio/useCanvasDraw";
import { useAnalytics } from "./studio/useAnalytics";
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
import { CookieConsent } from "./components/CookieConsent";import { tierAtLeast, reciterRequiredTier, JETON, isAdminEmail, ADMIN_SECRET_PATH, getJeton, setJeton as persistJetonSecure, getCurrentTier, setCurrentTier, isRamadan, isFriday, videoMaliyeti, isFeatureUnlocked, featureLockLabel, hasMicroUnlock, startTrial, type Tier } from "./tier";
import { secureGet, secureSet, secureRemove } from "./secureStore";

// ★ Yeni Hook'lar
import { useAuth } from "./studio/useAuth";
import { useTier } from "./studio/useTier";
import { useWallet } from "./studio/useWallet";
import { useBan } from "./studio/useBan";
import { usePaymentFlow } from "./studio/usePaymentFlow";
import { useAudioPreview } from "./studio/useAudioPreview";
import { usePrayerTime } from "./studio/usePrayerTime";
import { useDailyAyah } from "./studio/useDailyAyah";
import { getVideoUrlSync, getPosterUrlSync, getVideoUrl, getPosterUrl } from "./videoUrl";
import { checkRateLimit } from "./rateLimiter";
import { onErrorCaptured, reportRenderError, type DebugGuideMessage } from "./debugGuide";
import { syncUserInDb } from "./components/adminHelpers";
import { fetchRemoteConfig, ensureRemoteSync, getSystemConfig, banUserInDb, getBanLogs } from "./services/adminSyncService";
import type { SelectedAyah, SearchHit, Output, DailyAyah, User, Mode, Aspect, ModalName, LoginTab } from "./types";

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

  const [adminGodMode, setAdminGodMode] = useState(() => false);  // ★ Sunucudan gelen isAdmin'e güven, localStorage'a değil
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

  // ★ Cookie Consent
  const [cookieAccepted, setCookieAccepted] = useState(() => {
    try { return localStorage.getItem("nur_cookie_consent") === "1"; } catch { return false; }
  });

  // ★ Üretim Onay Balonu — free/pro kullanıcılar için maliyet uyarısı
  const [genConfirmOpen, setGenConfirmOpen] = useState(false);
  const [genConfirmData, setGenConfirmData] = useState<{ cost: number; remaining: number; formatCount: number; mode: string } | null>(null);
  const genConfirmResolveRef = useRef<((ok: boolean) => void) | null>(null);

  const showGenerateConfirm = useCallback((cost: number, remaining: number, formatCount: number, mode: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setGenConfirmData({ cost, remaining, formatCount, mode });
      setGenConfirmOpen(true);
      genConfirmResolveRef.current = resolve;
    });
  }, []);

  const handleGenConfirm = useCallback((ok: boolean) => {
    setGenConfirmOpen(false);
    genConfirmResolveRef.current?.(ok);
    genConfirmResolveRef.current = null;
  }, []);

  // Hook'lara gereken state'ler (yukarıda tanımlı olmalı)
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

  // ★ Hook'lar (state'lerden sonra çağrılır)
  const { user, setUser, loginTab, setLoginTab, phone, setPhone, verifyCode, setVerifyCode, sentCode, setSentCode, serverAdminVerified, setServerAdminVerified, adminEmailInput, setAdminEmailInput, adminCodeInput, setAdminCodeInput, adminError, setAdminError, adminAuthOpen, setAdminAuthOpen, openAdminDashboard } = useAuth({ isMasterSürüm, isDevMaster, notify });
  const { jetonCount, setJetonCount, syncWallet, consumeRight, packRights, subscriptionEndsAt, resetWallet } = useWallet(notify, user);
  const { tier, setTier, accessTier, premiumOpen, setPremiumOpen, premiumTab, setPremiumTab, openPremium, checkTier, tryUnlockElitFeature, tryUnlockFullMode } = useTier({ isMasterSürüm, notify, jetonCount, setJetonCount });
  const { localBanned, setLocalBanned, localBanReason, setLocalBanReason } = useBan({ user, isMasterSürüm, notify });
  usePaymentFlow({ setUser, setTier, syncWallet });

  // ★ Admin email tanındığında master modu aktifle
  useEffect(() => {
    if (user?.email && isAdminEmail(user.email) && !isMasterSürüm) {
      setAdminGodMode(true);
      setIsMasterSürüm(true);
      localStorage.setItem("nur_admin_session", "1");
      console.log("[admin] Admin email tanındı:", user.email, "→ sınırsız mod aktif");
    }
  }, [user?.email]);

  // ★ PremiumModal her açıldığında cüzdanı yenile
  useEffect(() => {
    if (premiumOpen) {
      syncWallet();
    }
  }, [premiumOpen]);

  // Tier senkronizasyonu — auth/me'den gelen tier React state'e yazilir
  useEffect(() => {
    const dbTier = (user as any)?.tier as Tier | undefined;
    if (dbTier && (dbTier === "pro" || dbTier === "elit" || dbTier === "free")) {
      const cur = getCurrentTier();
      if (dbTier !== cur) {
        setTier(dbTier);
        console.log('[tier] Senkronize:', dbTier, 'onceki:', cur);
      }
    }
  }, [user]);

  const { previewPlaying, setPreviewPlaying, previewTime, setPreviewTime, previewDuration, setPreviewDuration, silenceAllAudio, reciter: audioReciter } = useAudioPreview({ selected, verseIndex, setVerseIndex, reciterId, notify });
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
  const [outputs, setOutputs] = useState<Output[]>(() => {
    try {
      const saved = localStorage.getItem("nur_gen_history");
      return saved ? JSON.parse(saved).slice(0, 20) : [];
    } catch { return []; }
  });
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
  // dailyPool, dailyIndex, dailyPaused → useDailyAyah hook'unda
  // prayerCity, prayerSearch, prayerTimings → usePrayerTime hook'unda
  const [now, setNow] = useState(new Date());
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [modal, setModal] = useState<ModalName>(null);
  const [tosOpen, setTosOpen] = useState(false);
  // localBanned, localBanReason → useBan hook'unda

  // Ban cleanup → useBan hook'unda

  const [legalTab, setLegalTab] = useState<"tos" | "kvkk" | "gizlilik" | "iade">("tos");
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
  const durationWarnRef = useRef<{ key: string; at: number }>({ key: "", at: 0 });
  const stopGenerationRef = useRef<() => void>(() => undefined);
  const lastTitleRef = useRef<string>("");
  const lastDescRef = useRef<string>("");
  const selectedRef = useRef(selected), verseIndexRef = useRef(verseIndex), backgroundRef = useRef(background);
  const ayahBackgroundsRef = useRef(ayahBackgrounds), aspectRef = useRef(aspect), themeRef = useRef(THEMES[0]);
  useEffect(() => { ayahBackgroundsRef.current = ayahBackgrounds; }, [ayahBackgrounds]);
  useEffect(() => { selectedRef.current = selected; }, [selected]);
  useEffect(() => { verseIndexRef.current = verseIndex; }, [verseIndex]);
  useEffect(() => { backgroundRef.current = background; }, [background]);
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
  // ★ Geçmiş üretimi localStorage'a kaydet
  useEffect(() => {
    if (outputs.length > 0) {
      try {
        // Sadece metadata kaydet (blob URL'lerini değil)
        const lite = outputs.map(o => ({ id: o.id, label: o.label, size: o.size, ext: o.ext, mime: o.mime, duration: o.duration }));
        localStorage.setItem("nur_gen_history", JSON.stringify(lite.slice(0, 20)));
      } catch {}
    }
  }, [outputs]);

  const activeOutput = outputs.find((output) => output.id === activeOutputId) ?? outputs[0] ?? null;
  const t = (key: keyof (typeof T)["tr"]) => T[lang][key] ?? T.tr[key];

  // openAdminDashboard → useAuth hook'unda  const [, setMicroUnlockTick] = useState(0);




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

  useEffect(() => {
    const trimmed = query.trim(); if (trimmed.length < 2) { setResults([]); setSearching(false); return; }
    // ★ Türkçe uzatma işaretlerini sadeleştir: "nur" → "Nûr", "yunus" → "Yûnus" eşleşir
    const normTr = (s: string) => s.toLocaleLowerCase("tr").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const matchedSurahs = SURAHS.filter(s => normTr(s.name).includes(normTr(trimmed))).slice(0, 10);
    if (matchedSurahs.length > 0) { setResults(matchedSurahs.map(s => ({ s: s.n, a: 1, name: s.name, tr: `${s.count} ayet • Sure #${s.n}` }))); setSearching(false); return; }
    let live = true; setSearching(true);
    const timer = window.setTimeout(() => { fetchJSON(`https://api.alquran.cloud/v1/search/${encodeURIComponent(trimmed)}/all/${MEAL_EDITIONS[lang]}`).then((json: any) => { if (!live) return; setResults((json?.data?.matches ?? []).slice(0, 30).map((match: { surah: { number: number; englishName: string }; numberInSurah: number; text: string }) => ({ s: match.surah.number, a: match.numberInSurah, name: SURAHS[match.surah.number - 1]?.name ?? match.surah.englishName, tr: match.text }))); }).catch(() => { if (live) setResults([]); }).finally(() => { if (live) setSearching(false); }); }, 420);
    return () => { live = false; window.clearTimeout(timer); };
  }, [query, lang]);


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

  // Canvas draw kodu useCanvasDraw hook'una taşındı

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
    const meta = SURAHS[s - 1];
    // ★ Hemen seçili işaretle (optimistic update) — API beklemeden
    const placeholder = { id, s, a, sName: meta?.name ?? "", ar: "", tr: knownTranslation ?? "Yükleniyor..." };
    setSelected((current) => [...current, placeholder]);
    setVerseIndex(selectedRef.current.length);
    try {
      let ar = "", tr = knownTranslation ?? "";
      if (knownTranslation) { const json: any = await fetchJSON(`https://api.alquran.cloud/v1/ayah/${s}:${a}/quran-uthmani`); ar = json?.data?.text ?? ""; }
      else { const loaded = await fetchAyah(s, a, MEAL_EDITIONS[lang]); ar = loaded.ar; tr = loaded.tr; }
      // ★ Placeholder'ı gerçek veriyle değiştir (boşsa bile güncelle — API çalışmıyorsa boş kalmasın)
      setSelected((current) => current.map((x) => x.id === id ? { ...x, ar: ar || x.ar, tr: tr || x.tr } : x));

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
    } catch (e) {
      console.error("[addAyah] fetch hatası:", e);
      // ★ HATA: Placeholder'ı listeden çıkar
      setSelected((current) => current.filter((x) => x.id !== id));
      notify("Ayet yüklenemedi");
    }
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
    // ★ Üretim Onay Balonu — free/pro kullanıcılar için maliyet uyarısı
    if (!isMasterSürüm && !isGuest && totalCost > 0 && (accessTier === "free" || accessTier === "pro")) {
      const confirmed = await showGenerateConfirm(totalCost, jetonCount, formatCount, mode);
      if (!confirmed) return;
    }
    let jetonCharged = false;
    let userStopped = false;
    silenceAllAudio();
    setGenerating(true); setProgress(2);
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext, audioContext = new AudioContextClass();
      const buffers: AudioBuffer[] = [], usedItems: SelectedAyah[] = [], audioOffsets: number[] = [];
      const ayetSüreleri: Array<{ start: number; dur: number }> = [];
      const cap = mode === "short" ? 59 : mode === "long" ? 600 : JETON.TAM_SURUM_CAP_SANIYE; let cursor = 0;
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
        const modeLabel = mode === "short" ? "Kısa (59 sn)" : mode === "long" ? "Uzun (600 sn)" : "Tam Sürüm (24:35)";
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
          if (video.readyState >= 2 && video.videoWidth > 0) {
            try { video.currentTime = 0.05; } catch { /* ignore */ }
            video.play().catch(() => undefined);
            resolve();
            return;
          }
          const done = () => {
            try { video.currentTime = 0.05; } catch { /* ignore */ }
            video.play().catch(() => undefined);
            resolve();
          };
          video.addEventListener("loadeddata", done, { once: true });
          video.addEventListener("canplay", done, { once: true });
          video.addEventListener("error", done, { once: true });
          video.load();
          window.setTimeout(done, 7000);
          void getPosterUrl(clip).catch(() => undefined);
        }).catch(() => { resolve(); });
      })));
      // ★ Render öncesi tüm seçili videolara ısınma payı ver.
      // R2/CDN ilk frame'i geç getirirse ilk ayetler donuk kaydoluyordu.
      await new Promise((resolve) => window.setTimeout(resolve, 1200));
      const formats = batchFormats.length ? batchFormats : [aspect];
      for (let formatIndex = 0; formatIndex < formats.length; formatIndex += 1) {
        const outputAspect = formats[formatIndex]; aspectRef.current = outputAspect; const [width, height] = dimensions(outputAspect); canvas.width = width; canvas.height = height;
        verseIndexRef.current = 0;
        setVerseIndex(0);
        await new Promise((resolve) => window.setTimeout(resolve, 240));
        // ★ Cihaza göre adaptif FPS/bitrate: kötü cihazlarda donma/kasma azaltılır
        const stream = canvas.captureStream(renderQuality.renderFps), destination = audioContext.createMediaStreamDestination(), player = audioContext.createBufferSource(); player.buffer = rendered; player.connect(destination);
        // ★ Bazı Chrome/VLC/WebM kombinasyonlarında canvas capture sadece ilk frame'i yazıyor.
        //   requestFrame destekleniyorsa kayıt boyunca manuel frame pompalıyoruz.
        const canvasTrack = stream.getVideoTracks()[0] as MediaStreamTrack & { requestFrame?: () => void };
        const framePump = window.setInterval(() => {
          try { canvasTrack?.requestFrame?.(); } catch { /* ignore */ }
        }, Math.max(33, Math.floor(1000 / Math.max(12, renderQuality.renderFps))));
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
            const activeClip = renderClips[idx];
            if (activeClip?.kind === "vid") {
              try {
                const activeVideo = ensureVideo(getVideoUrlSync(activeClip), activeClip.src);
                const localTime = Math.max(0, elapsed - (ayetSüreleri[idx]?.start ?? 0));
                if (Number.isFinite(activeVideo.duration) && activeVideo.duration > 0.4) {
                  const nextTime = (localTime % Math.max(0.5, activeVideo.duration - 0.1));
                  if (Math.abs(activeVideo.currentTime - nextTime) > 0.75) activeVideo.currentTime = nextTime;
                }
                activeVideo.play().catch(() => undefined);
              } catch { /* ignore */ }
            }
          }
        }, 200);
        const finishRecording = () => { if (finished) return; finished = true; window.clearInterval(syncTimer); window.clearInterval(framePump); window.clearTimeout(safetyTimer); try { player.stop(); } catch { } if (recorder.state !== "inactive") recorder.stop(); };
        const userStop = () => { userStopped = true; finishRecording(); };
        stopGenerationRef.current = userStop;
        safetyTimer = window.setTimeout(finishRecording, total * 1000 + 750);
        player.onended = finishRecording;
        // ★ 1 saniyelik parçalar halinde data al: uzun WebM buffer'ı donuk video üretebiliyor.
        recorder.start(1000);
        player.start();
        await stopped;
        window.clearInterval(framePump);
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
        setOutputs((current) => [output, ...current].slice(0, 5)); setActiveOutputId(output.id);
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
        // ★ Hak düşür — ilgili video türünden 1 hak azalt
        const videoKind = mode === "short" ? "kisa" : mode === "long" ? "uzun" : "tam";
        consumeRight(videoKind as "kisa" | "uzun" | "tam");
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

    // ★ ÜCRETSİZ "OTOMATİK PAYLAŞIM": Sunucu/API onayı gerektiren gerçek
    //   Instagram/TikTok/YouTube otomatik yükleme, her platformun ayrı
    //   uygulama onay sürecini (haftalar sürebilir) gerektirir ve maliyet 0
    //   ile yapılamaz. Bunun yerine tarayıcının YERLEŞİK Paylaşım Sayfasını
    //   (Web Share API) açıyoruz — kullanıcı TEK DOKUNUŞLA Instagram, TikTok,
    //   WhatsApp, Telegram gibi telefonda kurulu HERHANGİ bir uygulamaya
    //   videoyu gönderebilir. Sıfır maliyet, sıfır onay süreci, sıfır sunucu.
    try {
      const file = new File([await (await fetch(output.url)).blob()], `nur-studyo.${output.ext}`, { type: output.mime });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: shareTitle, text: `${promoText}\n\n${shareDescription}`, files: [file] });
        return;
      }
    } catch { /* ignore */ }
  }, [notify, shareTitle, shareDescription]);

  // ★ Masaüstü / dosya paylaşımı desteklemeyen tarayıcılar için METİN bazlı
  //   hızlı paylaşım linkleri (WhatsApp, Telegram, X) — bunlar da tamamen
  //   ücretsizdir, sunucu veya API anahtarı gerektirmez, sadece platformların
  //   herkese açık "paylaşım linki" formatını kullanır.
  const shareToWhatsApp = useCallback(() => {
    const text = encodeURIComponent(`${shareTitle}\n\n${shareDescription}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }, [shareTitle, shareDescription]);

  const shareToYouTube = useCallback(() => {
    // YouTube Studio upload sayfasına, açıklama metni clipboard'a kopyalanarak yönlendirir
    const text = `${shareTitle}\n\n${shareDescription}`;
    navigator.clipboard.writeText(text).catch(() => undefined);
    window.open("https://studio.youtube.com/channel/upload", "_blank", "noopener,noreferrer");
  }, [shareTitle, shareDescription]);

  const shareToTikTok = useCallback(() => {
    // TikTok Creator Center'a yönlendirir, metin clipboard'a kopyalanır
    const text = `${shareTitle}\n\n${shareDescription}`;
    navigator.clipboard.writeText(text).catch(() => undefined);
    window.open("https://www.tiktok.com/creator-center/upload", "_blank", "noopener,noreferrer");
  }, [shareTitle, shareDescription]);

  const shareToInstagram = useCallback(() => {
    // Instagram Reels yükleme sayfasına yönlendirir, metin clipboard'a kopyalanır
    const text = `${shareTitle}\n\n${shareDescription}`;
    navigator.clipboard.writeText(text).catch(() => undefined);
    window.open("https://www.instagram.com/reels/", "_blank", "noopener,noreferrer");
  }, [shareTitle, shareDescription]);

  const shareToX = useCallback(() => {
    const text = encodeURIComponent(`${shareTitle}\n\n${shareDescription}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank", "noopener,noreferrer");
  }, [shareTitle, shareDescription]);

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
    // ★ Admin olsa bile mevcut tier'ı koru, sadece free ise elit yap
    const userTier: Tier = isKurucuAdmin ? (tier === "free" ? "elit" : tier) : tier;
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
    secureSet("nur_user_v1", newUser);

    if (isKurucuAdmin) {
      setAdminGodMode(true);
      setIsMasterSürüm(true);
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
      startTrial(); // ★ 7 gün ücretsiz PRO denemesi başlat
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
    setIsMasterSürüm(false);
    setTier("free");
    resetWallet();
    secureRemove("nur_user_v1");
    localStorage.removeItem("nur_admin_session");
    notify("Çıkış yapıldı.");
  };

  void user; void lockTip; void adminError; void adminEmailInput;

  return (
    <div className="relative min-h-screen overflow-x-hidden text-[13px]" style={{ color: "var(--text)" }}>
      <div className="pointer-events-none fixed inset-0 -z-10" style={{ background: `radial-gradient(900px 560px at 88% -8%,color-mix(in srgb,var(--accent) 12%,transparent),transparent 60%),radial-gradient(800px 600px at -10% 100%,color-mix(in srgb,var(--accent) 7%,transparent),transparent 58%),var(--page)` }} />

      {/* ANNOUNCEMENT BAR (DİNAMİK MANEVİ TAKVİM & TIKLA-AL ÖDÜL ŞERİDİ) */}
      <AnnouncementBar
        notify={notify}
        onRewardClaimed={() => {
          syncWallet();
        }}
        onTamperAttempt={(reason) => {
          // Tamper ban uygulamaz — sadece bildirim ver
          notify(`⚠️ Güvenlik: ${reason}`);
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
        subscriptionEndsAt={subscriptionEndsAt}
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
          outputs={outputs}
          setActiveOutputId={setActiveOutputId}
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
        shareToWhatsApp={shareToWhatsApp}
        shareToX={shareToX}
        shareToYouTube={shareToYouTube}
        shareToTikTok={shareToTikTok}
        shareToInstagram={shareToInstagram}
        pickDesc={genDesc}
      />

      {/* ★ COOKIE CONSENT BANNER */}
      {!cookieAccepted && (
        <div className="fixed bottom-0 left-0 right-0 z-[90] border-t border-white/10 bg-black/80 backdrop-blur-xl px-4 py-3">
          <div className="mx-auto max-w-4xl flex flex-wrap items-center justify-between gap-3">
            <p className="text-[10px] text-white/60 leading-relaxed">
              🍪 Bu site çerezler kullanır. Deneyiminizi geliştirmek için çerezleri kabul edin. Detaylı bilgi için{' '}
              <button onClick={() => { setLegalTab("gizlilik"); setTosOpen(true); }} className="underline text-[color:var(--accent-2)] hover:text-white">Gizlilik Politikamızı</button>{' '}
              okuyabilirsiniz.
            </p>
            <button
              onClick={() => { localStorage.setItem("nur_cookie_consent", "1"); setCookieAccepted(true); }}
              className="shrink-0 rounded-xl px-4 py-1.5 text-[10px] font-bold text-black"
              style={{ background: "linear-gradient(135deg, var(--accent-2), var(--accent))" }}
            >
              Kabul Et
            </button>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toast ? (
        <div className="glass modal-in select-none fixed bottom-5 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2 text-[10px] text-white shadow-2xl">
          <BookOpen size={12} style={{ color: "var(--accent)" }} />
          {toast}
        </div>
      ) : null}

      {/* ★ ÜRETİM ONAY BALONU — free/pro maliyet uyarısı */}
      {genConfirmOpen && genConfirmData ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => handleGenConfirm(false)}>
          <div className="glass modal-in max-w-sm w-[90%] rounded-3xl border border-white/10 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg, var(--accent-2), var(--accent))" }}>
                <Zap size={22} className="text-white" />
              </div>
              <div>
                <h3 className="font-display text-base font-black text-white">Üretim Onayı</h3>
                <p className="text-[10px] text-white/50">Maliyet bilgisi</p>
              </div>
            </div>

            <div className="mb-4 space-y-2 rounded-2xl bg-black/30 p-4">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-white/50">Üretim türü</span>
                <span className="font-bold text-white">{genConfirmData.mode === "short" ? "Kısa (59sn)" : genConfirmData.mode === "long" ? "Uzun (600sn)" : "Tam Sürüm"}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-white/50">Format sayısı</span>
                <span className="font-bold text-white">{genConfirmData.formatCount} adet</span>
              </div>
              <div className="my-2 h-px bg-white/10" />
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-bold text-white/70">Harcanacak jeton</span>
                <span className="font-black" style={{ color: "var(--accent)" }}>{genConfirmData.cost} ⚡</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-white/50">Kalan jetonun</span>
                <span className="font-bold text-white">{genConfirmData.remaining} ⚡</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-white/50">Üretim sonrası</span>
                <span className="font-bold" style={{ color: genConfirmData.remaining - genConfirmData.cost <= 0 ? "#ef4444" : "var(--accent-2)" }}>
                  {Math.max(0, genConfirmData.remaining - genConfirmData.cost)} ⚡
                </span>
              </div>
            </div>

            {genConfirmData.remaining - genConfirmData.cost <= 0 && (
              <div className="mb-3 rounded-xl bg-red-500/10 border border-red-500/30 px-3 py-2 text-[10px] font-bold text-red-300 text-center">
                ⚠️ Jetonun yetersiz! Üretim sonrası bakiyen 0 olacak.
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => handleGenConfirm(false)}
                className="flex-1 rounded-xl bg-white/5 px-4 py-2.5 text-[11px] font-bold text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                İptal
              </button>
              <button
                onClick={() => handleGenConfirm(true)}
                className="flex-1 rounded-xl px-4 py-2.5 text-[11px] font-black text-white transition shadow-lg"
                style={{ background: "linear-gradient(135deg, var(--accent-2), var(--accent))" }}
              >
                Üret ⚡ {genConfirmData.cost}
              </button>
            </div>
          </div>
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
        packRights={packRights}
        subscriptionEndsAt={subscriptionEndsAt}
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
        lang={lang}
        user={user}
      />

      {/* COOKIE CONSENT — KVKK/AB Uyumu */}
      <CookieConsent />
    </div>
  );
}

declare global { interface Window { webkitAudioContext: typeof AudioContext } }

