import type { CatId, Clip } from "../clips";
import type { LibraryItem, LibraryType, Emotion } from "../dualar";
import type { Lang } from "../i18n/base";
import { T } from "../i18n";
import type { ModalName, LoginTab, Tier } from "../types";
import type { KendiSesAktif } from "../studio/useKendiSes";
import type { StoredSes } from "../studio/sesDeposu";
import type { SesSegmenti } from "../studio/sesZamanlama";

export interface ModalsContainerProps {
  modal: ModalName;
  setModal: (m: ModalName) => void;
  loginTab: LoginTab;
  setLoginTab: (t: LoginTab) => void;
  phone: string;
  setPhone: (p: string) => void;
  verifyCode: string;
  setVerifyCode: (c: string) => void;
  sentCode: string;
  handleLoginSubmit: () => void;
  handleRegisterSubmit: () => void;
  handleForgotPassword: () => void;
  handleVerifyCode: () => void;
  handleGuestContinue: () => void;
  /** Misafirin kalan deneme video hakkı (0-2). Verilmezse 2 varsayılır. */
  guestTrialLeft?: number;
  fullUnlockConfirmOpen: boolean;
  setFullUnlockConfirmOpen: (v: boolean) => void;
  jetonCount: number;
  tryUnlockFullMode: () => boolean;
  setMode: (m: any) => void;
  premiumOpen: boolean;
  setPremiumOpen: (v: boolean) => void;
  premiumTab: "uyelik" | "jeton";
  serverAdminVerified: boolean;
  tier: Tier;
  setTier: (t: Tier) => void;
  setCurrentTier: (t: Tier) => void;
  setJetonCount: (j: number) => void;
  notify: (msg: string) => void;
  adminAuthOpen: boolean;
  setAdminAuthOpen: (v: boolean) => void;
  adminEmailInput: string;
  setAdminEmailInput: (v: string) => void;
  adminCodeInput: string;
  setAdminCodeInput: (v: string) => void;
  adminError: string | null;
  setAdminError: (e: string | null) => void;
  setAdminGodMode: (v: boolean) => void;
  /** ★ "ADMIN OLARAK GERİ DÖN" (30.09): son doğrulanmış admin e-postası ya da null */
  adminSonEmail?: string | null;
  pickingFor: string | null;
  setPickingFor: (id: string | null) => void;
  /** ★ Sekme değişince mevcut ayet arka planlarını yeni türe (img/vid) yeniden atar */
  onClipKindChange?: (kind: "img" | "vid") => void;
  clipKind: "img" | "vid";
  setClipKind: (k: "img" | "vid") => void;
  atmosQuery: string;
  setAtmosQuery: (q: string) => void;
  isMasterSürüm: boolean;
  /** ★ V2 kilidi yönlendirmesi — kilitli modal tıklanınca yol haritasına götürür */
  setRoadmapOpen?: (v: boolean) => void;
  randomizeBackgrounds: (cat?: any) => void;
  /** ★ İş 4: Arka Plan Üretici — sinematik filtre state'ini değiştirir */
  setCinematic: (id: string) => void;
  /** ★ İş 4: Seçili ayet sayısı (Arka Plan Üretici uyarısı için) */
  seciliAyetSayisi?: number;
  /** ★ İş 5: Linkten gelen davet kodu (?davet=KOD) — kayıt sonrası otomatik kullanılır */
  bekleyenDavetKodu?: string | null;
  /** ★ İş 5: Davet ödülü alınınca cüzdanı tazele */
  syncWallet?: () => Promise<void> | void;
  atmosCategory: CatId | "all";
  setAtmosCategory: (c: CatId | "all") => void;
  combinedAllClips: Clip[];
  /** ★ Kullanıcı medyası (IndexedDB) — "Arka Plan Yap" ile gelen Clip'i stüdyoya atar */
  onMedyaArkaPlan: (medyaId: string) => void;
  /** ★ Galeri senkronu (30.09): yükle/sil sonrası Yüklediklerim klasörünü IndexedDB'den tazele */
  onMedyaSenkron?: () => void;
  CATEGORY_ICONS: Record<CatId, React.ElementType>;
  lockTip: string | null;
  setLockTip: React.Dispatch<React.SetStateAction<string | null>>;
  accessTier: Tier;
  tierAtLeast: (have: Tier, need: Tier) => boolean;
  filteredClips: Clip[];
  hoveredClip: string | null;
  setHoveredClip: (id: string | null) => void;
  openPremium: (tab?: "uyelik" | "jeton") => void;
  packRights: { kisa: number; uzun: number; tam: number };
  subscriptionEndsAt?: string | null;
  pickClip: (clip: Clip) => void;
  libSearch: string;
  setLibSearch: (s: string) => void;
  libType: LibraryType | "tumu";
  setLibType: (t: LibraryType | "tumu") => void;
  libEmotion: Emotion | "tum";
  setLibEmotion: (e: Emotion | "tum") => void;
  libraryFiltered: LibraryItem[];
  useFromLibrary: (item: LibraryItem) => void;
  addAyah: (s: number, a: number) => void;
  ALL_THEMES: any[];
  themeTier: (id: string) => Tier;
  themeEmoji: (id: string) => string;
  themeId: string;
  setThemeId: (id: string) => void;
  prayerSearch: string;
  setPrayerSearch: (s: string) => void;
  prayerCity: string;
  setPrayerCity: (c: string) => void;
  filteredCities: string[];
  prayerTimings: Record<string, string> | null;
  nextPrayer: { name: string; key: string; diff: number } | null;
  formatRemaining: (ms: number) => string;
  contactType: "oneri" | "sikayet";
  setContactType: (t: "oneri" | "sikayet") => void;
  contactMessage: string;
  setContactMessage: (m: string) => void;
  tosOpen: boolean;
  setTosOpen: (v: boolean) => void;
  tosAccepted: boolean;
  setTosAccepted: (v: boolean) => void;
  legalTab: "tos" | "kvkk" | "gizlilik" | "iade";
  setLegalTab: (t: "tos" | "kvkk" | "gizlilik" | "iade") => void;
  t: (key: keyof (typeof T)["tr"]) => string;
  lang: Lang;
  user?: { email?: string; googleId?: string } | null;
  /** ★ KENDİ SESİNİ YÜKLE (30.09) — ELİT özelliği */
  kendiSesAktif: KendiSesAktif | null;
  kendiSesKayitlari: StoredSes[];
  kendiSesYukleniyor: boolean;
  kendiSesNefes: number;
  kendiSesYukle: (dosya: File, sure: number, ayetSayisi: number, konum: "tum" | number) => Promise<unknown>;
  kendiSesYukleAyetAyri: (dosya: File, sure: number, ayet: number) => Promise<boolean>;
  kendiSesSec: (id: string) => Promise<boolean>;
  kendiSesSil: (id: string) => Promise<void>;
  kendiSesZamanlamaKaydet: (id: string, segments: SesSegmenti[], nefes?: number) => Promise<void>;
  kendiSesKaldir: () => void;
  /** Modaldan açılırken ayet-başına arka plan ataması için hedef ayet */
  setPickingForAtmos: (id: string) => void;
  /** Modalın senkron sırası: seçili ayetler (s, a, sName) */
  kendiSesSeciliAyetler: Array<{ s: number; a: number; sName?: string }>;
  /** Ayet başına atanmış arka planlar ("s:a" → Clip) */
  kendiSesAyahBackgrounds: Record<string, Clip>;
}
