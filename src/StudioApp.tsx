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
import { ayetKategorisiBul, adminAyetKategorisiBul } from "./studio/ayetKategori"; // ★ SRP adım 13 (02.10): ayet→kategori motoru
import { storeVideo, loadStoredVideos } from "./studio/videoStore";
import { checkGuestGate, bumpGuestUsed, GUEST_FREE_VIDEOS } from "./studio/useGuestTrial";
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
import { LANGS, MEAL_EDITIONS, T, type Lang } from "./i18n";
import { RECITERS, RECITER_SES_TARZI, SES_TARZI_ORDER, sesKaynakZinciri, sesZinciriBagla, sesZinciriSoKup } from "./reciters";
import { LIBRARY_ITEMS, type LibraryItem, type LibraryType, type Emotion } from "./dualar";
import { HeaderTopBar } from "./components/HeaderTopBar";
import { AyahLibraryPanel } from "./components/AyahLibraryPanel";
import { VideoPreviewSection } from "./components/VideoPreviewSection";
import { DesignSettingsPanel } from "./components/DesignSettingsPanel";
import { SocialSharePanel } from "./components/SocialSharePanel";
import { ModalsContainer } from "./components/ModalsContainer";
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
import { PwaKurulumBanneri } from "./components/PwaKurulumBanneri";
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
import { getVideoUrlSync, getPosterUrlSync, getVideoUrl, getPosterUrl, isR2Media } from "./videoUrl";
import { checkRateLimit } from "./rateLimiter";
import { ensureImageYukle, ensureVideoYukle } from "./studio/medyaOnYukleme";
import { UretimOnayBalonu, BanEngelEkrani, HataKilavuzModal } from "./components/studioAppBolumler";
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

  // ★ Telif uyarısı tetiği — handleGenerate ilk üretimde bir kez artırır;
  //   tetik 2'ye ulaştığında (uyarı kabul edildi → otomatik devam) üretim yeniden çağrılır
  const [telifTetik, setTelifTetik] = useState(0);
  const telifDevamRef = useRef(false);
  const telifIlkTetikRef = useRef(true);
  React.useEffect(() => {
    if (telifTetik === 0) return;
    if (telifIlkTetikRef.current) { telifIlkTetikRef.current = false; return; } // ilk artış = uyarıyı göster, üretimi başlatma
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telifTetik]);

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
  const [lang, setLang] = useState<Lang>(() => {
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
  // ★ KENDİ SESİNİ YÜKLE (30.09) — ELİT özelliği: kullanıcının kendi okuyuşuyla
  //   milisanielik ayet senkronu (sessizlik-sınırı algılama; sesZamanlama.ts)
  const { aktif: kendiSesAktif, yukleniyor: kendiSesYukleniyor, kayitlar: kendiSesKayitlari, yukle: kendiSesYukle, yukleAyetAyri: kendiSesYukleAyetAyri, sec: kendiSesSec, sil: kendiSesSil, zamanlamaKaydet: kendiSesZamanlamaKaydet, kaldirAktif: kendiSesKaldir, yenidenTara: kendiSesYenidenTara } = useKendiSesiniYukle({ notify });
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
  const [arabicFont, setArabicFontState] = useState<string>(() => {
    try { return localStorage.getItem("nur_arabic_font") || "amiri"; } catch { return "amiri"; }
  });
  // ★ TEMBEL FONT YÜKLEME: Google Fonts linki açılışta yalnızca temel fontları
  //   yükler (Amiri, Inter, Cinzel). Seçilen diğer font, seçildiği anda tek
  //   istekle yüklenir — açılış hızı korunur. Seçim localStorage'da kalıcı.
  const yukluFontlar = new Set<string>(["amiri"]);
  // ★ Font yükleme hatası takibi: internet yoksa / Google Fonts erişilemezse
  //   kullanıcıyı bilgilendir — sessizce fallback fontta kalmaz.
  const fontHataBildirildi = useRef(new Set<string>());
  useEffect(() => {
    const font = ARABIC_FONTS.find((f) => f.id === arabicFont);
    if (!font || yukluFontlar.has(arabicFont)) return;
    const aile = font.css.split(",")[0].replace(/'/g, "").trim();
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=" + encodeURIComponent(aile).replace(/%20/g, "+") + ":wght@400;700&display=swap";
    let yuklendi = false;
    // ★ ÇEVRİMDIŞI KONTROL: navigator.onLine=false ise istek hiç atılmaz —
    //   hemen bilgilendir, gereksiz ağ beklemesi olmasın
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      if (!fontHataBildirildi.current.has(arabicFont)) {
        fontHataBildirildi.current.add(arabicFont);
        notify(`📶 İnternet bağlantısı yok — "${font.label}" fontu yüklenemedi, Amiri kullanılacak`);
      }
      return;
    }
    // ★ ZAMAN AŞIMLI YÜKLEME: 8 saniyede font gelmezse (ofline proxy, DNS hatası,
    //   Google engeli) kullanıcıyı bilgilendir — Amiri zaten fallback CSS'te var
    const zamanAsimi = window.setTimeout(() => {
      if (yuklendi) return;
      if (!fontHataBildirildi.current.has(arabicFont)) {
        fontHataBildirildi.current.add(arabicFont);
        notify(`⚠️ "${font.label}" fontu yüklenemedi — Amiri kullanılacak (internet bağlantını kontrol et)`);
      }
    }, 8000);
    document.head.appendChild(link);
    yukluFontlar.add(arabicFont);
    // ★ FOUT ÖNLEME: font gerçekten yüklendiğinde önizlemeyi tazele —
    //   canvas fallback fontla çizilip öylece kalmaz (yanıp sönme/yanlış font olmaz)
    Promise.all([
      document.fonts.load("400 20px " + aile),
      document.fonts.load("700 20px " + aile),
    ]).then(() => {
      yuklendi = true;
      window.clearTimeout(zamanAsimi);
      window.dispatchEvent(new Event("nur_font_loaded"));
    }).catch(() => {
      yuklendi = true; // catch'te de zaman aşımını durdur — çift bildirim olmasın
      window.clearTimeout(zamanAsimi);
      if (!fontHataBildirildi.current.has(arabicFont)) {
        fontHataBildirildi.current.add(arabicFont);
        notify(`⚠️ "${font.label}" fontu yüklenemedi — Amiri kullanılacak`);
      }
    });
    return () => window.clearTimeout(zamanAsimi);
  }, [arabicFont, notify]);
  const setArabicFont = (f: string) => {
    setArabicFontState(f);
    try { localStorage.setItem("nur_arabic_font", f); } catch { /* ignore */ }
  };
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
  // ★ WATERMARK AÇ/KAPA — imza metninden bağımsız ayrı anahtar; kalıcı.
  //   Kullanıcı imzayı yazıp istediğinde kapatabilir (kanal logosu yokken vs.)
  const [brandOn, setBrandOn] = useState<boolean>(() => {
    try { return localStorage.getItem("nur_brand_on") !== "0"; } catch { return true; }
  });
  useEffect(() => {
    try { localStorage.setItem("nur_brand_on", brandOn ? "1" : "0"); } catch { /* ignore */ }
  }, [brandOn]);
  const [textOffset, setTextOffset] = useState({ x: 0, y: 0 });
  const arabicFontCss = ARABIC_FONTS.find((f) => f.id === arabicFont)?.css ?? "Amiri, serif";
  const arabicFontW = arabicFontWeight(arabicFont);
  // ★ Yazı boyutu: hazır ayar × ince ayar (kullanıcı +/- ile 0.5x–2.0x arası)
  const [textSizeFine, setTextSizeFine] = useState<number>(() => {
    const raw = localStorage.getItem("nur_text_size_fine");
    const n = raw ? parseFloat(raw) : NaN;
    return Number.isFinite(n) ? Math.min(2, Math.max(0.5, n)) : 1;
  });
  const setTextSizeMul = (m: number) => {
    const clamped = Math.round(Math.min(2, Math.max(0.5, m)) * 100) / 100;
    setTextSizeFine(clamped);
    try { localStorage.setItem("nur_text_size_fine", String(clamped)); } catch { /* ignore */ }
  };
  // ★ MEAL İÇİN BAĞIMSIZ ince ayar — Arapça boyutundan ayrı tutulur
  const [mealSizeFine, setMealSizeFine] = useState<number>(() => {
    const raw = localStorage.getItem("nur_meal_size_fine");
    const n = raw ? parseFloat(raw) : NaN;
    return Number.isFinite(n) ? Math.min(2, Math.max(0.5, n)) : 1;
  });
  const setMealSizeMul = (m: number) => {
    const clamped = Math.round(Math.min(2, Math.max(0.5, m)) * 100) / 100;
    setMealSizeFine(clamped);
    try { localStorage.setItem("nur_meal_size_fine", String(clamped)); } catch { /* ignore */ }
  };
  // ★ IŞILTI YOĞUNLUĞU — parıltı gücü ince ayarı (0.5x–2.0x), kalıcı
  const [shimmerIntensity, setShimmerIntensityState] = useState<number>(() => {
    const raw = localStorage.getItem("nur_shimmer_intensity");
    const n = raw ? parseFloat(raw) : NaN;
    return Number.isFinite(n) ? Math.min(2, Math.max(0.5, n)) : 1;
  });
  const setShimmerIntensity = (v: number) => {
    const clamped = Math.round(Math.min(2, Math.max(0.5, v)) * 100) / 100;
    setShimmerIntensityState(clamped);
    try { localStorage.setItem("nur_shimmer_intensity", String(clamped)); } catch { /* ignore */ }
  };
  // ★ RENK ÇUBUĞU (01.10) — çerçeve iç kenarında dikey gökkuşağı şeridi; Arapça/meal
  //   çizim renginden bağımsız süsleme katmanı. ayetKartMotoru ile aynı çekirdek.
  const [cubukAyar, setCubukAyar] = useState<CubukAyar>(() => {
    try { return { ...VARSAYILAN_CUBUK, ...(JSON.parse(localStorage.getItem("nur_renk_cubugu") || "null") || {}) }; } catch { return VARSAYILAN_CUBUK; }
  });
  useEffect(() => {
    try { localStorage.setItem("nur_renk_cubugu", JSON.stringify(cubukAyar)); } catch { /* ignore */ }
  }, [cubukAyar]);
  // ★ ÖZEL YAZI (01.10) — kullanıcının kendi mesajı, videonun İÇİNE çizilir
  //   (önizleme = çıktı). Ayrı konum: mesajOfset, ayet konumundan bağımsız.
  const [mesajAyar, setMesajAyar] = useState<MesajAyar>(() => {
    try { return { ...VARSAYILAN_MESAJ, ...(JSON.parse(localStorage.getItem("nur_mesaj_ayar") || "null") || {}) }; } catch { return VARSAYILAN_MESAJ; }
  });
  useEffect(() => {
    try { localStorage.setItem("nur_mesaj_ayar", JSON.stringify(mesajAyar)); } catch { /* ignore */ }
  }, [mesajAyar]);

  // ★ FONTA GÖRE OTOMATİK BOYUT: her fontun ideal çarpanı görsel dengeyi
  //   korur (naskh irice, kufi küçüktür). Kullanıcının ince ayarı ekstra çarpılır —
  //   yani elle ayar yaptığı zaman o değer her fontta GEÇERLİ kalır.
  const textSizeMul = (textSize === "buyuk" ? 1.15 : textSize === "kucuk" ? 0.85 : 1) * textSizeFine * arabicIdealScale(arabicFont);

  const CINE_FILTERS = _CINE_FILTERS;
  const [cinematic, setCinematic] = useState("orijinal");
  const cineFilter = CINE_FILTERS.find((f) => f.id === cinematic) ?? CINE_FILTERS[0];

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

  const [showArapca, setShowArapca] = useState(true);
  const [showSubMeal, setShowSubMeal] = useState(true);

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
  const durationWarnRef = useRef<{ key: string; at: number }>({ key: "", at: 0 });
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
  // ★ MEAL-DİLİ SENKRONU (01.10) — dil değişince seçili ayetlerin mealleri yeni
  //   edition'dan (MEAL_EDITIONS[lang]) yeniden çekilir (stüdyo tarafı). İlk
  //   mount'ta koşmaz (prevLangRef) — mealler eklenirken o anki dilden gelmişti.
  //   `selected` bilinçli dep dışı: tetik anındaki snapshot selectedRef'ten alınır;
  //   dil değişimi SONRASI eklenenler addAyah'dan zaten yeni dilde gelir.
  //   notify stabil (useCallback []); uyumsuzluk dep her değişiminde erken çıkış.
  const prevLangRef = useRef(lang);
  useEffect(() => {
    const onceki = prevLangRef.current;
    prevLangRef.current = lang;
    if (onceki === lang) return;
    const sureler = [...new Set(selectedRef.current.map((x) => x.s))];
    if (!sureler.length) return;
    const edition = MEAL_EDITIONS[lang];
    let iptal = false;
    void (async () => {
      const sonuclar = await Promise.all(sureler.map(async (sn) => {
        try { return [sn, await fetchSurah(sn, edition)] as const; } catch { return [sn, null] as const; }
      }));
      if (iptal) return;
      setSelected((current) => current.map((x) => {
        const satir = sonuclar.find(([sn, rows]) => sn === x.s && rows && rows[x.a - 1]);
        if (!satir || !satir[1]) return x;
        return { ...x, tr: satir[1][x.a - 1].tr };
      }));
      const basarili = sonuclar.filter(([, rows]) => rows).length;
      if (basarili === sonuclar.length) notify(t("mlSenkronTamam").replace("{edition}", edition));
      else notify(t("mlSenkronKismi").replace("{basarili}", String(basarili)).replace("{toplam}", String(sonuclar.length)));
    })();
    return () => { iptal = true; };
  }, [lang, notify]);
  // ★ PAYLAŞIM METNİ DİL SENKRONU (04.10): dil değişince başlık/açıklama/hashtag
  //   havuzları da YENİ DİLDE yeniden üretilir — aksi halde panel eski dilde TR metin
  //   göstermeye devam ediyordu ("başlıkları da çevir" — kullanıcı talebi).
  //   İlk mount'ta koşmaz: useState initializer zaten seçili dille üretti.
  //   Seçili ayet varsa o ayetin bilgisiyle üretilir; yoksa varsayılan Bakara 2:255.
  const prevPaylasLangRef = useRef(lang);
  useEffect(() => {
    const onceki = prevPaylasLangRef.current;
    prevPaylasLangRef.current = lang;
    if (onceki === lang) return;
    const cur = selectedRef.current[verseIndexRef.current] ?? selectedRef.current[0];
    setShareTitle(genTitle(cur?.sName, cur?.s ?? 2, cur?.a ?? 255, lang, cur?.tr ?? ""));
    setShareDescription(genDesc(cur?.sName ?? "Bakara", cur?.s ?? 2, cur?.a ?? 255, reciter.name, lang));
    setVisibleTags(pickRandomTags(14));
  }, [lang, notify, reciter.name, pickRandomTags]);
  // ★ RTL DİLİ (01.10): ar/ur seçiliyse ana grid de sağdan sola akar — CSS logical
  //   mirror'ı flex/grid üzerinden çalışır; body'ye nur-rtl sınıfı düzeltmeler için.
  const rtlMi = lang === "ar" || lang === "ur";
  useEffect(() => {
    document.body.classList.toggle("nur-rtl", rtlMi);
    return () => document.body.classList.remove("nur-rtl");
  }, [rtlMi]);
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
    const modeLabel = mode === "short" ? "Kısa (59 sn)" : mode === "long" ? "Uzun (600 sn)" : "Tam Sürüm (90 dk)";
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

  useCanvasDraw({
    canvasRef, selectedRef, verseIndexRef, backgroundRef, ayahBackgroundsRef, aspectRef, themeRef,
    videoWatchdog, imageCache, videoCache, ensureImage, ensureVideo,
    showArapca, showSubMeal, accessTier, arabicFontCss, arabicFontWeight: arabicFontW, textSizeMul, mealSizeMul: mealSizeFine, shimmerCfg, shimmerIntensity, cardBg, textOffset,
    cubuk: cubukAyar, mesaj: mesajAyar,
    cineFilter, isMasterSürüm, brandSignature, brandOn, brandPos, previewFps: renderQuality.previewFps, previewTime, previewDuration, previewIsSurah: Boolean(reciter.surahPattern), user,
  });

  // Canvas draw kodu useCanvasDraw hook'una taşındı

  // ★ SRP adım 13 (02.10): ayet→kategori motoru studio/ayetKategori.ts'e taşındı
  //   (saf fonksiyonlar; davranış birebir aynı). Eski isimler uç noktalar bozulmasın
  //   diye modül düzeyi sabitlere takma ad olarak kalır.
  const detectCategoryFromAyah = ayetKategorisiBul;
  const detectAdminCategoryFromAyah = adminAyetKategorisiBul;

  const addAyah = useCallback(async (s: number, a: number, knownTranslation?: string) => {
    // ★ TAM TARAMA (29.09): a=0 guard — "Ayet Ekle" butonu ayet seçilmeden basılınca
    // Number("")=0 geliyordu → "Fâtiha 1:0" placeholder → 001000.mp3 404 → render crash.
    if (!Number.isInteger(s) || s < 1 || !Number.isInteger(a) || a < 1) { notify("⚠️ Önce sure ve ayet seç"); return; }
    const id = `${s}:${a}`;
    if (selectedRef.current.some((item) => item.id === id)) return;
    const meta = SURAHS[s - 1];
    // ★ Hemen seçili işaretle (optimistic update) — API beklemeden
    const placeholder = { id, s, a, sName: meta?.name ?? "", ar: "", tr: knownTranslation ?? t("loadingVerse") };
    setSelected((current) => [...current, placeholder]);
    setVerseIndex(selectedRef.current.length);
    try {
      let ar = "", tr = knownTranslation ? normalizeTurkishMeal(knownTranslation, MEAL_EDITIONS[lang]) : "";
      if (knownTranslation) { const json: any = await fetchJSON(quranUrl(`v1/ayah/${s}:${a}/quran-uthmani`)); ar = json?.data?.text ?? ""; }
      else { const loaded = await fetchAyah(s, a, MEAL_EDITIONS[lang]); ar = loaded.ar; tr = loaded.tr; }
      // ★ Placeholder'ı gerçek veriyle değiştir (boşsa bile güncelle — API çalışmıyorsa boş kalmasın)
      setSelected((current) => current.map((x) => x.id === id ? { ...x, ar: ar || x.ar, tr: tr || x.tr } : x));

      if (smartAiEnabled) {
        // ★ Akıllı AI, kullanıcının sekmesini (şablon/hareketli) takip eder
        const wantKind = clipKindRef.current;
        const detectedCat = detectCategoryFromAyah(ar, tr, meta.name);
        let poolCat = combinedAllClips.filter((clip) => clip.cat === detectedCat && clip.kind === wantKind);
        // ★ Kategorinin o türde klibi yoksa (örn. kod kategorilerinde şablon yok),
        //   ayet kelimeleriyle ŞABLONU/HAREKEtlisi olan admin kategorilerine ikinci tarama:
        //   böylece "Gökten su" ayetine rastgele savaş atları düşmez, bulut/tema kategorisi bulur.
        if (poolCat.length === 0) {
          const adminCat = detectAdminCategoryFromAyah(ar, tr, meta.name);
          if (adminCat) poolCat = combinedAllClips.filter((clip) => clip.cat === adminCat && clip.kind === wantKind);
        }
        if (poolCat.length === 0) poolCat = combinedAllClips.filter((clip) => clip.cat === "musaf" && clip.kind === wantKind);
        if (poolCat.length === 0) poolCat = combinedAllClips.filter((clip) => clip.kind === wantKind);
        if (poolCat.length) {
          const chosen = poolCat[Math.floor(Math.random() * poolCat.length)];
          // ★ KULLANICI MEDYASI KUTSAL (30.09): ana arka plan kullanıcının kendi dosyasıysa
          //   YENİ ayetler de o dosyayla başlar — AI kullanıcının kendi seçimine sahne dayatamaz.
          //   AI tematik sahneler yalnız kendi dosyası YOKKEN devreye girer.
          if (backgroundRef.current?.cat === "yuklenenler") {
            setAyahBackgrounds((current) => ({ ...current, [id]: backgroundRef.current }));
          } else {
            setAyahBackgrounds((current) => ({ ...current, [id]: chosen }));
            if (verseIndexRef.current === selectedRef.current.length) { setBackground(chosen); }
          }
        }
      }

      // ★ AI kapalıyken fallback: seçili sekme türünden mushaf klibi (şablondaysa şablon)
      // ★ KULLANICI SEÇİMİ KUTSAL (30.09): kullanıcı kendi dosyasını ana arka plan yaptıysa
      //   yeni ayet de ONUNLA başlar — otomatik atmosfer ezmesin. Kendi dosyası yoksa
      //   yüklü klipler → mushaf sırasıyla fallback.
      if (!ayahBackgroundsRef.current[id]) {
        const anaArkaPlan = backgroundRef.current;
        if (anaArkaPlan?.cat === "yuklenenler") {
          setAyahBackgrounds((current) => ({ ...current, [id]: anaArkaPlan }));
        } else {
          const kullaniciKlipleri = combinedAllClips.filter((clip) => clip.cat === "yuklenenler" && clip.kind === clipKindRef.current);
          const quranClips = kullaniciKlipleri.length
            ? kullaniciKlipleri
            : combinedAllClips.filter((clip) => clip.cat === "musaf" && clip.kind === clipKindRef.current);
          if (quranClips.length) setAyahBackgrounds((current) => ({ ...current, [id]: quranClips[Math.floor(Math.random() * quranClips.length)] }));
        }
      }
      setVerseIndex(selectedRef.current.length); setShareTitle(genTitle(meta.name, s, a, lang, tr)); setShareDescription(genDesc(meta.name, s, a, reciter.name, lang)); notify(t("ssAyetEklendi").replace("{name}", meta.name).replace("{s}", String(s)).replace("{a}", String(a)));
    } catch (e) {
      console.error("[addAyah] fetch hatası:", e);
      // ★ HATA: Placeholder'ı listeden çıkar
      setSelected((current) => current.filter((x) => x.id !== id));
      notify(t("renderAuthError"));
    }
  }, [lang, notify, reciter.name, smartAiEnabled, combinedAllClips, detectCategoryFromAyah, detectAdminCategoryFromAyah]);

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
    const number = Number(surah);
    if (!number || number < 1) { notify("Önce bir sure seç"); return; }
    try { const rows = await fetchSurah(number, MEAL_EDITIONS[lang]), meta = SURAHS[number - 1]; const all = rows.map((row, index) => ({ id: `${number}:${index + 1}`, s: number, a: index + 1, sName: meta.name, ar: row.ar, tr: row.tr })); setSelected((current) => { const ids = new Set(current.map((item) => item.id)); return [...current, ...all.filter((item) => !ids.has(item.id))]; }); notify(`${meta.name} Suresi tamamı eklendi (${rows.length} ayet)`); }
    catch { notify(t("renderServerError")); }
  }, [surah, lang, notify]);

  // ★ SEKME DEĞİŞİMİ (Şablon V2 ↔ Hareketli) — zaten atanmış ayet arka planlarını
  //   yeni türe (img/vid) yeniden atar. Eski davranışta sadece ana arka plan
  //   randomClip ile değişiyordu; ayet kayıtları eski türemiş gibi kalıyor, üretim
  //   o yüzden Şablon V2 seçiliyken bile HAREKETLİ video basıyordu.
  const reassignBackgroundsForKind = useCallback((kind: "img" | "vid") => {
    const items = selectedRef.current;
    if (!items.length) return;
    // ★ KULLANICI MEDYASI KUTSAL (30.09): "Yüklediklerim"e atanmış slotlar sekme
    //   değişiminde ASLA ezilmez — yalnız diğerleri yeniden atanır.
    const korunacak = Object.entries(ayahBackgroundsRef.current)
      .filter(([, clip]) => clip.cat === "yuklenenler")
      .map(([id]) => id);
    const duzenlecekler = items.filter((item) => !korunacak.includes(item.id));
    const next: Record<string, Clip> = {};
    items.forEach((item) => {
      if (korunacak.includes(item.id)) next[item.id] = ayahBackgroundsRef.current[item.id];
    });
    if (!duzenlecekler.length) { notify("📁 Yüklediklerin korundu — sekme değişimi onlara dokunmadı"); return; }
    if (smartAiEnabledRef.current) {
      // Akıllı AI açıksa: her ayete yeni türde tematik sahne
      const usedIds = new Set<string>();
      duzenlecekler.forEach((item) => {
        const detectedCat = detectCategoryFromAyah(item.ar, item.tr, item.sName);
        let poolCat = combinedAllClips.filter((clip) => clip.cat === detectedCat && clip.kind === kind);
        if (poolCat.length === 0) {
          const adminCat = detectAdminCategoryFromAyah(item.ar, item.tr, item.sName);
          if (adminCat) poolCat = combinedAllClips.filter((clip) => clip.cat === adminCat && clip.kind === kind);
        }
        if (poolCat.length === 0) poolCat = combinedAllClips.filter((clip) => clip.cat === "musaf" && clip.kind === kind);
        if (poolCat.length === 0) poolCat = combinedAllClips.filter((clip) => clip.kind === kind);
        if (!poolCat.length) return;
        const fresh = poolCat.filter((c) => !usedIds.has(c.id));
        const list = fresh.length ? fresh : poolCat;
        const chosen = list[Math.floor(Math.random() * list.length)];
        usedIds.add(chosen.id);
        next[item.id] = chosen;
      });
    } else {
      // Akıllı AI kapalıysa: yeni türden mushaf/nötr klip dağıt
      const pool = combinedAllClips.filter((clip) => clip.kind === kind && isClipAccessibleRef.current(clip));
      if (!pool.length) return;
      duzenlecekler.forEach((item) => { next[item.id] = pool[Math.floor(Math.random() * pool.length)]; });
    }
    if (Object.keys(next).length) {
      setAyahBackgrounds(next);
      // ★ KULLANICI SEÇİMİ KUTSAL (30.09): ana arka plan kullanıcının kendi dosyasıysa
      //   sekme değişimi onu rastgele bir kliple DEĞİŞTİREMEZ — yalnız slotlar yeniden atanır.
      if (backgroundRef.current?.cat !== "yuklenenler") {
        const first = next[items[0].id];
        if (first) setBackground(first);
      }
    }
  }, [smartAiEnabledRef, combinedAllClips, detectCategoryFromAyah, detectAdminCategoryFromAyah, isClipAccessibleRef]);

  const useFromLibrary = useCallback((item: LibraryItem) => {
    const s = item.s ?? 0, a = item.a ?? 0;
    const id = item.type === "ayet" && s > 0 ? `${s}:${a}` : `lib-${item.id}`;
    if (selectedRef.current.some((x) => x.id === id)) { notify(t("guestLimit")); setModal(null); return; }
    setSelected((current) => [...current, { id, s, a, sName: item.title, ar: item.ar || "", tr: item.tr || "" }]);
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
    // ★ Yüklediklerim: kullanıcının kendi dosyaları her zaman erişilebilir (kendi cihazı)
    if (clip.cat === "yuklenenler") return true;
    if (isMasterSürüm || ATMOSPHERE_PREVIEW_UNLOCKED) return true;
    // ★ ADMIN KATEGORİ PLANI: onaylı dağıtıma göre (pro/elit tier kilidi,
    //   v2 kilitli, hidden admin-only) — adminCategoryAccess.ts okur
    if (clip.cat.startsWith("admin_")) return adminCatUsable(clip.cat, accessTier);
    const catTier = KATEGORI_TIER[clip.cat as CatId] ?? "free";
    if (!tierAtLeast(accessTier, catTier)) return false;
    const sameCat = combinedAllClips.filter((c) => c.cat === clip.cat && c.kind === clipKind);
    const idx = sameCat.findIndex((c) => c.id === clip.id);
    const nextTier: Tier = catTier === "free" ? "pro" : catTier === "pro" ? "elit" : "elit";
    if (idx >= FREE_VIDEOS_PER_CATEGORY && !tierAtLeast(accessTier, nextTier)) return false;
    return true;
  }, [accessTier, clipKind, combinedAllClips, isMasterSürüm]);
  isClipAccessibleRef.current = isClipAccessible;

  const randomizeBackgrounds = useCallback((scopeCat?: CatId) => {
    let pool = combinedAllClips.filter((clip) => clip.kind === clipKind && isClipAccessible(clip));
    if (scopeCat) pool = pool.filter((clip) => clip.cat === scopeCat);
    if (pool.length === 0) { notify(t("guestLimit")); return; }
    // ★ KULLANICI SEÇİMİ KUTSAL (30.09): "Zar" kullanıcının kendi dosyasını ezemez —
    //   yalnız kullanıcı Yüklediklerim kategorisini bilerek uygularsa (scopeCat) atanır.
    if (!scopeCat && backgroundRef.current?.cat === "yuklenenler") {
      notify("📁 Kendi dosyan korundu — zar onu değiştirmez");
      return;
    }
    const pick = () => pool[Math.floor(Math.random() * pool.length)];
    if (!selectedRef.current.length) {
      const c = pick();
      setBackground(c);
      notify(`Rastgele seçildi: ${c.label}`);
      return;
    }
    // ★ Kullanıcının kendi dosyasına atanmış slotlar zar/çeşitlilik dalgasından muaf
    const korunanSlotlar = scopeCat === "yuklenenler"
      ? new Set<string>()
      : new Set(
          Object.entries(ayahBackgroundsRef.current)
            .filter(([, clip]) => clip.cat === "yuklenenler")
            .map(([id]) => id),
        );
    const atananlar = selectedRef.current.filter((item) => !korunanSlotlar.has(item.id));
    if (!atananlar.length) { notify("📁 Kendi dosyaların zatanmış durumda — zar onlara dokunmadı"); return; }
    const anaArkaPlanKorunur = backgroundRef.current?.cat === "yuklenenler" && scopeCat !== "yuklenenler";
    const next: Record<string, Clip> = {};
    // ★ setAyahBackgrounds TÜM state'i değiştirir — korunan slotlar next'e geri yazılmalı
    //   (yalnız hâlâ seçili ayetlere ait olanlar taşınır)
    korunanSlotlar.forEach((id) => {
      if (!selectedRef.current.some((item) => item.id === id)) return;
      const korunan = ayahBackgroundsRef.current[id];
      if (korunan) next[id] = korunan;
    });
    if (scopeCat) {
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      atananlar.forEach((item, index) => { next[item.id] = shuffled[index % shuffled.length]; });
      const catLabel = CATEGORIES.find((c) => c.id === scopeCat)?.label ?? scopeCat;
      setAyahBackgrounds(next);
      if (!anaArkaPlanKorunur && next[selectedRef.current[0].id]) setBackground(next[selectedRef.current[0].id]);
      notify(`✨ ${atananlar.length} ayete "${catLabel}" içinden rastgele atmosfer atandı`);
      return;
    }
    // ★ GERÇEK ÇEŞİTLİLİK — hem kategori hem klip tekrarını engeller
    const categories = Array.from(new Set(pool.map((c) => c.cat)));
    const shuffledCats = [...categories].sort(() => Math.random() - 0.5);
    const usedIds = new Set<string>();
    atananlar.forEach((item, index) => {
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
    if (!anaArkaPlanKorunur && next[atananlar[0]?.id]) setBackground(next[atananlar[0].id]);
    const korunanSayi = korunanSlotlar.size;
    notify(korunanSayi > 0
      ? `✨ ${atananlar.length} ayete farklı kategorilerden atmosfer atandı · ${korunanSayi} kendi dosyan korundu`
      : `✨ ${atananlar.length} ayete farklı kategorilerden rastgele atmosfer atandı`);
  }, [clipKind, combinedAllClips, notify, isClipAccessible]);

  const applySmartBackgrounds = useCallback(() => {
    if (!selectedRef.current.length) { notify("Önce en az bir ayet seçin"); return; }
    const wantKind = clipKindRef.current;
    // ★ KULLANICI MEDYASI KUTSAL (30.09): AI "Aç + Uygula" kullanıcının kendi dosyalarını
    //   EZEMEZ. Yüklediklerim slotları AI atamasından muaf — diğer slotlara sahne atanır.
    const korunanSlotlar = new Set(
      Object.entries(ayahBackgroundsRef.current)
        .filter(([, clip]) => clip.cat === "yuklenenler")
        .map(([id]) => id),
    );
    const next: Record<string, Clip> = {};
    // ★ setAyahBackgrounds TÜM state'i değiştirir — korunan slotlar next'e geri yazılmalı,
    //   yoksa "korumak" yerine silmiş oluruz (30.09 düzeltmesi). Yalnız hâlâ seçili
    //   ayetlere ait olanlar taşınır — bayat kayıt geri gelmesin.
    korunanSlotlar.forEach((id) => {
      if (!selectedRef.current.some((item) => item.id === id)) return;
      const korunan = ayahBackgroundsRef.current[id];
      if (korunan) next[id] = korunan;
    });
    const usedIds = new Set<string>();
    selectedRef.current.forEach((item) => {
      if (korunanSlotlar.has(item.id)) return;
      const detectedCat = detectCategoryFromAyah(item.ar, item.tr, item.sName);
      let poolCat = combinedAllClips.filter((clip) => clip.cat === detectedCat && clip.kind === wantKind);
      // ★ Kategoride seçili türden klip yoksa: ayet kelimeleriyle admin kategorisi taraması (Şablon V2 uyumu)
      if (poolCat.length === 0) {
        const adminCat = detectAdminCategoryFromAyah(item.ar, item.tr, item.sName);
        if (adminCat) poolCat = combinedAllClips.filter((clip) => clip.cat === adminCat && clip.kind === wantKind);
      }
      if (poolCat.length === 0) poolCat = combinedAllClips.filter((clip) => clip.cat === "musaf" && clip.kind === wantKind);
      if (poolCat.length === 0) poolCat = combinedAllClips.filter((clip) => clip.kind === wantKind);
      if (poolCat.length === 0) return;
      const fresh = poolCat.filter((c) => !usedIds.has(c.id));
      const list = fresh.length ? fresh : poolCat;
      const chosen = list[Math.floor(Math.random() * list.length)];
      usedIds.add(chosen.id);
      next[item.id] = chosen;
    });
    setAyahBackgrounds(next);
    // ★ Ana arka plan da kutsal: kullanıcının kendi dosyasıysa AI onu değiştiremez —
    //   yalnız kullanıcı dosyası olmayan ilk slotla ana önizlemeyi tazeler.
    if (
      selectedRef.current[0] &&
      next[selectedRef.current[0].id] &&
      backgroundRef.current?.cat !== "yuklenenler"
    ) setBackground(next[selectedRef.current[0].id]);
    const ezilen = korunanSlotlar.size;
    notify(ezilen > 0 ? `✨ Akıllı AI sahne atandı · ${ezilen} kendi dosyan korundu` : "✨ Akıllı AI: Ayet kelimelerine göre sahne atandı!");
  }, [combinedAllClips, notify, detectCategoryFromAyah, detectAdminCategoryFromAyah]);

  const playReciterPreview = useCallback((id: string) => {
    silenceAllAudio();
    const prev = reciterPreviewRef.current;
    if (prev) { sesZinciriSoKup(prev); prev.pause(); prev.oncanplaythrough = null; prev.onloadeddata = null; prev.onended = null; prev.onerror = null; try { prev.src = ""; } catch { /* ignore */ } reciterPreviewRef.current = null; }
    if (previewReciterId === id) { setPreviewReciterId(null); return; }
    const target = RECITERS.find((item) => item.id === id);
    const sample = selectedRef.current[0] ?? { s: 1, a: 1 };
    if (!target) return;
    const startPreview = (kaynaklar: string[]) => {
      const prevInStart = reciterPreviewRef.current;
      if (prevInStart) {
        sesZinciriSoKup(prevInStart);
        prevInStart.pause();
        prevInStart.onended = null;
        prevInStart.onerror = null;
        try { prevInStart.src = ""; } catch { /* ignore */ }
      }
      const audio = new Audio(); audio.preload = "auto"; audio.volume = 0.88;
      try { (audio as HTMLMediaElement & { referrerPolicy?: string }).referrerPolicy = "no-referrer"; } catch { /* ignore */ }
      reciterPreviewRef.current = audio; setPreviewReciterId(id);
      const cleanup = () => { if (reciterPreviewRef.current !== audio) return; setPreviewReciterId(null); reciterPreviewRef.current = null; };
      audio.onended = cleanup;
      // ★ YEDEK SES ZİNCİRİ (02.10): everyayah → varsa islamic.network yedeği;
      //   hepsi patlarsa eski dürüst uyarı (yanlış hocaya düşmez)
      sesZinciriBagla(audio, kaynaklar, () => {
        if (reciterPreviewRef.current !== audio) return;
        cleanup();
        notify(`⚠️ ${target?.name ?? "Kâri"} · ses kaydı şu an yüklenemedi. Lütfen başka bir kâri deneyin.`);
      });
      audio.play().catch(() => { const onReady = () => { audio.removeEventListener("loadeddata", onReady); if (reciterPreviewRef.current === audio) { audio.play().catch(cleanup); } }; audio.addEventListener("loadeddata", onReady); });
      previewTimerRef.current = window.setTimeout(() => { if (reciterPreviewRef.current === audio) { audio.pause(); cleanup(); } }, 10_000);
    };
    startPreview(
      target.surahPattern
        ? [target.surahPattern.replace("{S}", String(sample.s).padStart(3, "0"))]
        : sesKaynakZinciri(target.path, sample.s, sample.a)
    );
  }, [previewReciterId, notify, silenceAllAudio]);

  // ★ VİDEO ÜRETİM MOTORU — useVideoGenerator hook'unda (parçalama, 01.10)
  const handleGenerate = useVideoGenerator({
    generating, setGenerating, setProgress, stopGenerationRef,
    user, isMasterSürüm, setLoginTab, setModal, notify,
    selected, canvasRef, reciter, kendiSesAktif, batchFormats, aspect, mode, accessTier, jetonCount,
    silenceAllAudio, telifDevamRef, setTelifTetik, showGenerateConfirm,
    videoCache, imageCache, ayahBackgroundsRef, backgroundRef,
    verseIndexRef, aspectRef, setVerseIndex, setOutputs, setActiveOutputId,
    ensureImage, ensureVideo, renderQuality, t,
  });

  // ★ PAYLAŞIM FONKSİYONLARI — useShareActions hook'undan (parçalama)
  const { copied, copyShare, shareOutput, downloadVideo, shareToWhatsApp, shareToYouTube, shareToTikTok, shareToInstagram, shareToX, paylasCihazi } = useShareActions({ shareTitle, shareDescription, notify, t });

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
    else { pool = pool.filter((clip) => isClipAccessible(clip)); } // ★ "Tümü": sadece erişilebilir (kullanıcının açabildiği) klipler — boş grid olmasın
    const value = atmosQuery.trim().toLocaleLowerCase("tr");
    if (value) { pool = pool.filter((clip) => clip.label.toLocaleLowerCase("tr").includes(value)); }
    // ★ Performans: eski karşılaştırıcı her adımda tüm arşivi tarıyordu (O(n²)) ve
    //   mobilde/site genelinde donmaya yol açıyordu. Kilit durumu tek geçişte hesaplanıyor (O(n)).
    const idxMap = new Map<string, number>();
    const seen = new Map<string, number>();
    for (const clip of pool) {
      const key = clip.cat as string;
      const n = seen.get(key) ?? 0;
      idxMap.set(clip.id, n);
      seen.set(key, n + 1);
    }
    const lockMap = new Map<string, number>();
    for (const clip of pool) {
      const catTier = KATEGORI_TIER[clip.cat as CatId] ?? "free";
      const nextTier: Tier = catTier === "free" ? "pro" : catTier === "pro" ? "elit" : "elit";
      const unlocked = tierAtLeast(accessTier, catTier);
      const idx = idxMap.get(clip.id) ?? 0;
      const locked = !unlocked || (idx >= FREE_VIDEOS_PER_CATEGORY && !tierAtLeast(accessTier, nextTier));
      lockMap.set(clip.id, locked ? 1 : 0);
    }
    return [...pool].sort((a, b) => (lockMap.get(a.id) ?? 0) - (lockMap.get(b.id) ?? 0));
  }, [atmosCategory, atmosQuery, clipKind, combinedAllClips, accessTier, isClipAccessible]);

  // ★ ŞEHİR ARAMASI (02.10): TR + DÜNYA şehirleri birlikte aranır; dünya kayıtları
  //   "Mekke · Suudi Arabistan" etiketiyle listelenir, seçilince gerçek ad setPrayerCity'ye gider.
  const filteredCities = useMemo(() => {
    const value = prayerSearch.trim().toLocaleLowerCase("tr");
    const dunyaEtiketleri = DUNYA_SEHIRLERI.map((s) => `${s.ad} · ${s.ulke}`);
    const havuz = [...TURKISH_CITIES, ...dunyaEtiketleri];
    return value ? havuz.filter((city) => city.toLocaleLowerCase("tr").includes(value)) : havuz;
  }, [prayerSearch]);

  const pickClip = (clip: Clip) => {
    // ★ TIKLAMA ANINDA ÖN İMZA: useEffect render'ı bekler, biz beklemeden imzayı
    //   kuyruğun en önüne şimdi atıyoruz — seçim ile imza isteği aynı milisaniyede başlar.
    if (clip.kind === "vid" && isR2Media(clip) && !getVideoUrlSync(clip)) {
      getVideoUrl(clip, true).then((url) => { if (url) ensureVideo(url, clip.src); }).catch(() => undefined);
      void getPosterUrl(clip).catch(() => undefined);
    }
    if (pickingFor) setAyahBackgrounds((current) => ({ ...current, [pickingFor]: clip }));
    else {
      setBackground(clip);
      // ★ KULLANICI MEDYASI KUTSAL (30.09): galeriden kendi dosyası (Yüklediklerim)
      //   seçilirse TÜM ayet slotlarına uygulanır — eski atmosferler üretimi ezemesin.
      if (clip.cat === "yuklenenler") {
        const items = selectedRef.current;
        if (items.length) {
          setAyahBackgrounds((current) => {
            const next = { ...current };
            items.forEach((item) => { next[item.id] = clip; });
            return next;
          });
        }
      }
    }
    notify(`Atmosfer seçildi: ${clip.label}`);
    setModal(null);
    setPickingFor(null);
  };

  // ★ Manuel giriş/kayıt/çıkış akışları useManualAuthActions hook'unda (parçalama, 01.10)
  const { handleLoginSubmit, handleRegisterSubmit, handleForgotPassword, handleVerifyCode, handleLogout } = useManualAuthActions({
    phone, verifyCode, sentCode, tier, notify,
    setUser, setAdminGodMode, setIsMasterSürüm, setTier, setJetonCount, setSentCode, setLoginTab, setModal,
    setAdminSonEmail, resetWallet,
  });

  // ★ MİSAFİR MODU — üye olmadan deneme hakkı
  //   Sayaç + gün çıpası + zaman damgası useGuestTrial'daki bumpGuestUsed ile yönetilir:
  //   günde en fazla GUEST_DAILY_CAP üretim, aralarında GUEST_COOLDOWN_SEC fren (F5 spam engeli).
  //   GUEST_FREE_VIDEOS tek doğruluk kaynağı useGuestTrial export'u (kopya değil).
  const getGuestUsed = () => {
    try { return Number(localStorage.getItem("nur_guest_videos") || 0); } catch { return 0; }
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

  // ★ Misafirin "Video Üret" akışı: hakkı/günü bitince kayıt modalı (yukarıda checkGuestGate kontrolü)

  void user; void lockTip; void adminError; void adminEmailInput;

  return (
    <div className="relative min-h-screen overflow-x-hidden text-[13px]" style={{ color: "var(--text)" }}>
      {maintenance.enabled && (!maintenance.startsAt || Date.now() >= new Date(maintenance.startsAt).getTime()) && (!maintenance.endsAt || Date.now() < new Date(maintenance.endsAt).getTime()) && !isMasterSürüm && (
        <MaintenanceScreen message={maintenance.message} endsAt={maintenance.endsAt ?? null} />
      )}
      <div className="pointer-events-none fixed inset-0 -z-10" style={{ background: `radial-gradient(900px 560px at 88% -8%,color-mix(in srgb,var(--accent) 12%,transparent),transparent 60%),radial-gradient(800px 600px at -10% 100%,color-mix(in srgb,var(--accent) 7%,transparent),transparent 58%),var(--page)` }} />

      {/* ANNOUNCEMENT BAR (DİNAMİK MANEVİ TAKVİM & TIKLA-AL ÖDÜL ŞERİDİ) */}
      <AnnouncementBar
        notify={notify}
        user={user}
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
            // ★ ELİT KAPISI: elit değilse modal açılmaz, premium satın almaya yönlendirilir
            if (!isMasterSürüm && !tierAtLeast(accessTier, "elit")) {
              notify("👑 Kendi sesinle üretim ELİT üyelere özel — premium sayfası açıldı");
              openPremium("uyelik");
              return;
            }
            if (!selected.length) { notify("Önce en az bir ayet seçin — senkron seçtiğin ayetlere kurulur"); return; }
            setModal("kendiSes");
          }}
        />
        </div>

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

      {/* 🎬 TAM SAYFA VİDEO RENDER ENGELLEME VE BİLGİLENDİRME EKRANI */}
      {generating && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/95 p-6 backdrop-blur-md text-center select-none modal-in">
          <div className="max-w-md w-full rounded-3xl border border-gold/30 bg-slate-950/80 p-8 shadow-2xl space-y-5">
            {/* Altın renkli lüks parlayan yükleme efekti */}
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/10 border border-gold/30 text-gold shadow-xl">
              <span className="absolute inset-0 rounded-3xl border-2 border-gold border-t-transparent animate-spin"></span>
              <span className="text-xl font-bold animate-pulse">🎬</span>
            </div>

            <div className="space-y-2">
              <span className="rounded-full bg-red-500/20 border border-red-500/40 px-3.5 py-1 text-[9px] font-black uppercase tracking-widest text-red-300 animate-pulse">
                SİSTEM AKTİF RENDER MODUNDA
              </span>
              <h2 className="font-display text-lg font-black text-white leading-normal">
                LÜTFEN BU SEKMEYİ KAPATMAYIN VEYA ARKA PLANA ALMAYIN
              </h2>
            </div>

            <p className="text-[11.5px] leading-relaxed text-white/70">
              Tarayıcı tabanlı video birleştirme işlemi başladığı için, başka bir sekmeye geçmek veya uygulamayı arka plana almak tarayıcının işlemi askıya almasına ve <b className="text-gold">videonun donmasına/bozulmasına</b> neden olur.
            </p>

            {/* İlerleme çubuğu */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[10px] font-bold text-white/50">
                <span>Video İşleniyor...</span>
                <span className="text-gold font-black font-mono">%{progress}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden border border-white/5">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300 shadow-[0_0_10px_rgba(217,119,6,0.5)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              <button
                onClick={() => {
                  stopGenerationRef.current?.();
                  notify("Üretim kullanıcı tarafından iptal edildi");
                }}
                className="w-full rounded-xl bg-red-500/10 border border-red-500/30 py-3 text-[11px] font-bold text-red-300 transition hover:bg-red-500/20 active:scale-98"
              >
                Üretimi İptal Et
              </button>
              <p className="text-[9.5px] text-white/35 font-medium leading-normal">
                İptal ettiğinizde üretim hakkı (jeton) hesabınızdan düşmez.
              </p>
            </div>
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

      {/* ★ ÜRETİM ONAY BALONU — SRP adım 12: studioAppBolumler */}
      {genConfirmOpen && genConfirmData ? (
        <UretimOnayBalonu genConfirmData={genConfirmData} handleGenConfirm={handleGenConfirm} />
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

      <ModalsContainer
        modal={modal}
        setModal={setModal}
        setRoadmapOpen={setRoadmapOpen}
        onMedyaArkaPlan={medyaArkaPlanYap}
        onMedyaSenkron={onMedyaSenkron}
        onClipKindChange={reassignBackgroundsForKind}
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
        guestTrialLeft={Math.max(0, GUEST_FREE_VIDEOS - getGuestUsed())}
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
        adminSonEmail={adminSonEmail}
        pickingFor={pickingFor}
        setPickingFor={setPickingFor}
        clipKind={clipKind}
        setClipKind={setClipKind}
        atmosQuery={atmosQuery}
        setAtmosQuery={setAtmosQuery}
        isMasterSürüm={isMasterSürüm}
        randomizeBackgrounds={randomizeBackgrounds}
        setCinematic={setCinematic}
        seciliAyetSayisi={selected.length}
        bekleyenDavetKodu={bekleyenDavetKodu}
        syncWallet={syncWallet}
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
        kendiSesAktif={kendiSesAktif}
        kendiSesKayitlari={kendiSesKayitlari}
        kendiSesYukleniyor={kendiSesYukleniyor}
        kendiSesNefes={kendiSesAktif?.nefes ?? 0}
        kendiSesYukle={kendiSesYukle}
        kendiSesYukleAyetAyri={kendiSesYukleAyetAyri}
        kendiSesSec={kendiSesSec}
        kendiSesSil={kendiSesSil}
        kendiSesZamanlamaKaydet={kendiSesZamanlamaKaydet}
        kendiSesKaldir={kendiSesKaldir}
        kendiSesYenidenTara={kendiSesYenidenTara}
        setPickingForAtmos={(id) => setPickingFor(id)}
        kendiSesSeciliAyetler={selected.map((x) => ({ s: x.s, a: x.a, sName: x.sName }))}
        kendiSesAyahBackgrounds={ayahBackgrounds}
      />

      {/* COOKIE CONSENT — KVKK m.10 + Çerez Rehberi uyumlu (opt-in, eşit butonlar, envanter) */}
      <CookieConsent />
      {/* 🍪 Çerez ayarları — geri alma hakkı her sayfadan erişilebilir */}
      <CookieAyarDugmesi />

      {/* TELİF UYARISI — SADECE ilk Video Üret basışında bir kere (girişte çıkmaz) */}
      <TelifDisclaimer
        tetik={telifTetik}
        onAccept={() => {
          // Uyarı kabul edildi → uyarıdan ÖNCE basılan üretim otomatik devam etsin
          if (telifDevamRef.current) {
            telifDevamRef.current = false;
            setTelifTetik((v) => v + 1); // 2. tetik → useEffect handleGenerate'i çağırır
          }
        }}
      />

      {/* ★ BUGÜNÜN HEDİYESİ — günlük giriş sürprizi (yol haritası madde 14) — YALNIZ girişli kullanıcılara */}
      <BugunHediye notify={notify} onHakDegisti={syncWallet} userEmail={user?.email || null} />

      {/* ★ MINI TUR — ilk girişte 5 duraklı gezdirme (madde 3, 02.10) */}
      <MiniTur lang={lang} />

      {/* ★ PWA KURULUM SİHİRBAZI — Ana Ekrana Ekle öğreticisi (madde 23) */}
      <PwaKurulumBanneri />

      {/* V2-V3 YOL HARİTASI */}
      <RoadmapModal open={roadmapOpen} onClose={() => setRoadmapOpen(false)} adminEmail={user?.email} />
    </div>
  );
}

declare global { interface Window { webkitAudioContext: typeof AudioContext } }
