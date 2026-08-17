// ════════════════════════════════════════════════════════
// TIER.TS — Üyelik, günlük kota ve paket hakları
//
// ★ İYZİCO UYUMU:
//   Bakiye / cüzdan / jeton / kredi / kontör / token / coin
//   kavramları TAMAMEN kaldırıldı.
//   Yerine: günlük üretim kotası + tek seferlik ürün paketi.
//   Kullanıcı "bakiye yüklemez"; hizmet paketi satın alır.
// ════════════════════════════════════════════════════════

import { secureGet, secureMigrate, secureSet } from "./secureStore";
import { serverDateISO, serverIsFriday } from "./serverTime";

export type Tier = "free" | "pro" | "elit";

/** Video süre türleri — kota ve paketler bu üç tür üzerinden işler */
export type VideoKind = "kisa" | "uzun" | "tam";

export const VIDEO_KIND_LABEL: Record<VideoKind, string> = {
  kisa: "Kısa Video (59 sn)",
  uzun: "Uzun Video (600 sn)",
  tam: "Tam Sürüm (45 dk)",
};

export const VIDEO_KIND_SECONDS: Record<VideoKind, number> = {
  kisa: 59,
  uzun: 600,
  tam: 45 * 60,
};

export const CURRENT_TIER_KEY = "nur_tier";
if (typeof window !== "undefined") {
  secureMigrate<Tier>(CURRENT_TIER_KEY, (raw) => (raw === "pro" || raw === "elit" ? raw : "free"));
}

export function getCurrentTier(): Tier {
  if (typeof window === "undefined") return "free";
  const value = secureGet<Tier>(CURRENT_TIER_KEY, "free");
  return value === "pro" || value === "elit" ? value : "free";
}

export function setCurrentTier(tier: Tier): void {
  if (typeof window !== "undefined") secureSet(CURRENT_TIER_KEY, tier);
}

const TIER_RANK: Record<Tier, number> = { free: 0, pro: 1, elit: 2 };
export function tierAtLeast(have: Tier, need: Tier): boolean {
  return TIER_RANK[have] >= TIER_RANK[need];
}

// ════════════════════════════════════════════════════════
// ★ GÜNLÜK ÜRETİM KOTASI
//   Her gün sıfırlanır. Devretmez, biriktirilmez, bakiye değildir.
// ════════════════════════════════════════════════════════

export type Quota = Record<VideoKind, number>;

export const DAILY_QUOTA: Record<Tier, Quota> = {
  free: { kisa: 3, uzun: 0, tam: 0 },
  pro: { kisa: 8, uzun: 3, tam: 0 },
  elit: { kisa: 15, uzun: 5, tam: 1 },
};

export const TIER_LABEL: Record<Tier, string> = {
  free: "Ücretsiz",
  pro: "NÛR PRO",
  elit: "NÛR ELİT",
};

export const TIER_PRICE_TRY: Record<Tier, number> = {
  free: 0,
  pro: 149,
  elit: 300,
};

// ★ Yıllık üyelik — aylık fiyatın üstüne otomatik indirim uygulanır.
//   PRO: %10 indirim · ELİT: %20 indirim (bkz. src/payments/pricing.ts)
export const ANNUAL_DISCOUNT: Record<Tier, number> = { free: 0, pro: 0.10, elit: 0.20 };
export function annualPriceTRY(tier: Tier): number {
  const base = TIER_PRICE_TRY[tier] * 12;
  return Math.round(base * (1 - ANNUAL_DISCOUNT[tier]));
}

/** Bugün kaç adet üretildi — gün değişince otomatik sıfırlanır */
interface DailyUsage {
  date: string;
  used: Quota;
}

const DAILY_USAGE_KEY = "nur_daily_usage_v3";
const EMPTY_QUOTA: Quota = { kisa: 0, uzun: 0, tam: 0 };

function readUsage(): DailyUsage {
  if (typeof window === "undefined") return { date: "", used: { ...EMPTY_QUOTA } };
  const today = serverDateISO();
  const stored = secureGet<DailyUsage | null>(DAILY_USAGE_KEY, null);
  if (!stored || stored.date !== today) {
    const fresh: DailyUsage = { date: today, used: { ...EMPTY_QUOTA } };
    secureSet(DAILY_USAGE_KEY, fresh);
    return fresh;
  }
  return { date: stored.date, used: { ...EMPTY_QUOTA, ...stored.used } };
}

function writeUsage(usage: DailyUsage): void {
  if (typeof window === "undefined") return;
  secureSet(DAILY_USAGE_KEY, usage);
}

/** Bugün bu türden kaç tane kullanıldı */
export function getUsedToday(kind: VideoKind): number {
  return Math.max(0, Math.floor(readUsage().used[kind] || 0));
}

/** Bugün bu türden kaç hak kaldı (sadece abonelik kotası) */
export function getQuotaLeft(kind: VideoKind, tier: Tier = getCurrentTier()): number {
  const total = DAILY_QUOTA[tier][kind];
  return Math.max(0, total - getUsedToday(kind));
}

/** "Bugün: 3/8 kısa" gibi gösterim metni */
export function quotaText(kind: VideoKind, tier: Tier = getCurrentTier()): string {
  const total = DAILY_QUOTA[tier][kind];
  return `${getUsedToday(kind)}/${total}`;
}

// ════════════════════════════════════════════════════════
// ★ TEK SEFERLİK PAKET HAKLARI
//   Satın alınan paket = belirli sayıda video üretim hizmeti.
//   Para birimi değildir, transfer edilmez, geri çevrilmez.
// ════════════════════════════════════════════════════════

const PACK_RIGHTS_KEY = "nur_pack_rights_v1";

export type PackRights = Record<VideoKind, number>;

export function getPackRights(): PackRights {
  if (typeof window === "undefined") return { ...EMPTY_QUOTA };
  const stored = secureGet<PackRights | null>(PACK_RIGHTS_KEY, null);
  if (!stored) return { ...EMPTY_QUOTA };
  return {
    kisa: Math.max(0, Math.floor(stored.kisa || 0)),
    uzun: Math.max(0, Math.floor(stored.uzun || 0)),
    tam: Math.max(0, Math.floor(stored.tam || 0)),
  };
}

function savePackRights(rights: PackRights): void {
  if (typeof window === "undefined") return;
  secureSet(PACK_RIGHTS_KEY, {
    kisa: Math.max(0, Math.floor(rights.kisa)),
    uzun: Math.max(0, Math.floor(rights.uzun)),
    tam: Math.max(0, Math.floor(rights.tam)),
  });
}

/** Satın alınan paketi kullanıcıya tanımlar */
export function grantPack(kind: VideoKind, amount: number): PackRights {
  const rights = getPackRights();
  rights[kind] += Math.max(0, Math.floor(amount));
  savePackRights(rights);
  return rights;
}

/** Bu türden toplam kullanılabilir üretim: günlük kota + paket hakkı */
export function getAvailable(kind: VideoKind, tier: Tier = getCurrentTier()): number {
  return getQuotaLeft(kind, tier) + getPackRights()[kind];
}

export interface ConsumeResult {
  ok: boolean;
  source: "kota" | "paket" | "yok";
  quotaLeft: number;
  packLeft: number;
  message: string;
}

/**
 * Bir video üretimi harcar.
 * Önce günlük kota kullanılır, kota biterse paket hakkı düşer.
 */
export function consumeVideo(kind: VideoKind, tier: Tier = getCurrentTier()): ConsumeResult {
  const quotaLeft = getQuotaLeft(kind, tier);

  if (quotaLeft > 0) {
    const usage = readUsage();
    usage.used[kind] = (usage.used[kind] || 0) + 1;
    writeUsage(usage);
    return {
      ok: true,
      source: "kota",
      quotaLeft: quotaLeft - 1,
      packLeft: getPackRights()[kind],
      message: "Günlük hakkınızdan düşüldü",
    };
  }

  const rights = getPackRights();
  if (rights[kind] > 0) {
    rights[kind] -= 1;
    savePackRights(rights);
    return {
      ok: true,
      source: "paket",
      quotaLeft: 0,
      packLeft: rights[kind],
      message: "Paket hakkınızdan düşüldü",
    };
  }

  return {
    ok: false,
    source: "yok",
    quotaLeft: 0,
    packLeft: 0,
    message: `Bugünlük ${VIDEO_KIND_LABEL[kind]} hakkınız doldu. Paket alarak devam edebilirsiniz.`,
  };
}

/** Bu üyelik bu video türünü hiç üretebiliyor mu (kota 0 ve paket 0 ise hayır) */
export function canProduceKind(kind: VideoKind, tier: Tier = getCurrentTier()): boolean {
  return DAILY_QUOTA[tier][kind] > 0 || getPackRights()[kind] > 0;
}

/** Üst barda gösterilecek kısa özet — bakiye değil, kullanım göstergesi */
export function quotaSummary(tier: Tier = getCurrentTier()): string {
  const parts: string[] = [`${quotaText("kisa", tier)} kısa`];
  if (DAILY_QUOTA[tier].uzun > 0) parts.push(`${quotaText("uzun", tier)} uzun`);
  if (DAILY_QUOTA[tier].tam > 0) parts.push(`${quotaText("tam", tier)} tam`);
  return parts.join(" · ");
}

// ════════════════════════════════════════════════════════
// ★ ÖZELLİK KİLİTLERİ
// ════════════════════════════════════════════════════════

export type FeatureKey =
  | "reciter_telif" | "reciter_klasik_pro" | "atmos_kategori_pro" | "atmos_kategori_elit"
  | "atmos_video_pro" | "atmos_video_elit" | "tema_pro" | "tema_elit" | "mode_long"
  | "mode_full" | "aspect_1_1" | "aspect_16_9" | "batch" | "ai_search" | "refresh_text"
  | "refresh_title" | "hashtag_add" | "watermark_remove" | "social_share" | "zip_upload"
  | "story_kuran" | "story_kissa" | "story_hadis" | "gift_code";

export type FeatureGate = { kind: "tier"; tier: Tier } | { kind: "version"; version: "v2" | "v3" };

export const FEATURE_GATES: Record<FeatureKey, FeatureGate> = {
  reciter_telif: { kind: "tier", tier: "pro" }, reciter_klasik_pro: { kind: "tier", tier: "pro" },
  atmos_kategori_pro: { kind: "tier", tier: "pro" }, atmos_kategori_elit: { kind: "tier", tier: "elit" },
  atmos_video_pro: { kind: "tier", tier: "pro" }, atmos_video_elit: { kind: "tier", tier: "elit" },
  tema_pro: { kind: "tier", tier: "pro" }, tema_elit: { kind: "tier", tier: "elit" },
  mode_long: { kind: "tier", tier: "pro" }, mode_full: { kind: "tier", tier: "elit" },
  aspect_1_1: { kind: "tier", tier: "free" }, aspect_16_9: { kind: "tier", tier: "pro" },
  batch: { kind: "tier", tier: "elit" }, ai_search: { kind: "tier", tier: "elit" },
  refresh_text: { kind: "tier", tier: "pro" }, refresh_title: { kind: "tier", tier: "pro" },
  hashtag_add: { kind: "tier", tier: "elit" }, watermark_remove: { kind: "tier", tier: "pro" },
  social_share: { kind: "tier", tier: "elit" }, zip_upload: { kind: "version", version: "v3" },
  story_kuran: { kind: "version", version: "v2" }, story_kissa: { kind: "version", version: "v2" },
  story_hadis: { kind: "version", version: "v3" }, gift_code: { kind: "version", version: "v3" },
};

export function isFeatureUnlocked(key: FeatureKey, tier: Tier): boolean {
  const gate = FEATURE_GATES[key];
  return gate.kind === "tier" ? tierAtLeast(tier, gate.tier) : false;
}

export function featureLockLabel(key: FeatureKey): string {
  const gate = FEATURE_GATES[key];
  return gate.kind === "tier" ? (gate.tier === "pro" ? "PRO" : "ELİT") : gate.version.toUpperCase();
}

// ★ GÜNCELLEME: Sadece 2 kâri tamamen ücretsiz — geri kalan 50 kâri
//   PRO ve ELİT üyelikler arasında dağıtıldı (satın alım/üyelik zorunlu).
//   Ücretsiz kullanıcı en tanıdık iki sesle (Sudays + Husarî) tanışır,
//   gerisi için üyelik gerekir.
export const FREE_RECITER_IDS = ["sudais", "husary"] as const;

export const PRO_RECITER_IDS = [
  "shuraim", "maher", "hudhaify", "juhany", "qasim", "budair", "ayyoub", "matroud", "akhdar",
  "basfar", "qatami", "ajamy", "husary_mujawwad", "husary_teacher", "abdulbasit", "minshawi",
  "tablawi", "banna", "jibreel", "sowaid", "parhizgar", "ghamdi_saad", "fares_abbad",
  "akram_alaqimy", "abdulkareem", "bukhatir", "yaser_salamah", "ahmed_neana", "sahl_yassin",
  "ali_hajjaj", "aziz_alili", "karim_mansoori", "khalid_aljalil", "nabil_rifai", "hady_toure",
] as const;

// ★ ELİT — satın alma / üyelik ZORUNLU. Bu kâriler hicbir sekilde ücretsiz
//   veya PRO planla açılmaz; sadece NÛR ELİT abonesi veya "elit" ürün
//   satın alan kullanıcı erişebilir (bkz. reciterRequiredTier fonksiyonu).
export const ELIT_RECITER_IDS = [
  "muhaisny", "alafasy", "shatri", "qahtani", "dosari", "abdulbasit_mujawwad",
  "minshawi_mujawwad", "ali_jaber", "hani_rifai", "mustafa_ismail", "tunaiji",
  "balila", "ibrahim_dosary_warsh", "karim_mansoori_mujawwad", "yassin_jazaery_warsh",
] as const;

export function reciterRequiredTier(reciter: {
  id: string;
  requiredTier?: Tier;
  makam: "Haram" | "Telif";
  risk?: "low" | "mid" | "high";
}): Tier {
  if (reciter.requiredTier) return reciter.requiredTier;
  if ((ELIT_RECITER_IDS as readonly string[]).includes(reciter.id)) return "elit";
  if ((PRO_RECITER_IDS as readonly string[]).includes(reciter.id)) return "pro";
  return "free";
}

// ════════════════════════════════════════════════════════
// ★ SÜRÜM TAKVİMİ
// ════════════════════════════════════════════════════════

export type AppVersion = "v1.0" | "v1.1" | "v1.2" | "v1.3" | "v1.4" | "v1.5" | "v1.6" | "v1.7";
export const VERSION_SCHEDULE: Record<AppVersion, string> = {
  "v1.0": "2026-08-28", "v1.1": "2026-09-25", "v1.2": "2026-10-23", "v1.3": "2026-11-20",
  "v1.4": "2026-12-18", "v1.5": "2027-01-15", "v1.6": "2027-02-05", "v1.7": "2027-03-12",
};
const VERSION_ORDER: AppVersion[] = ["v1.0", "v1.1", "v1.2", "v1.3", "v1.4", "v1.5", "v1.6", "v1.7"];

export function getCurrentVersion(): AppVersion {
  if (typeof window === "undefined") return "v1.0";
  const override = localStorage.getItem("nur_version_override") as AppVersion | null;
  if (override && VERSION_ORDER.includes(override)) return override;
  const today = new Date().toISOString().slice(0, 10);
  return VERSION_ORDER.reduce<AppVersion>((current, version) => (today >= VERSION_SCHEDULE[version] ? version : current), "v1.0");
}

export function setVersionOverride(version: AppVersion | null): void {
  if (typeof window === "undefined") return;
  if (version) localStorage.setItem("nur_version_override", version);
  else localStorage.removeItem("nur_version_override");
}

export function isVersionUnlocked(target: "v2" | "v3"): boolean {
  const current = getCurrentVersion();
  return VERSION_ORDER.indexOf(current) >= VERSION_ORDER.indexOf(target === "v2" ? "v1.6" : "v1.7");
}

// ════════════════════════════════════════════════════════
// ★ ADMIN
// ════════════════════════════════════════════════════════

export const ADMIN_SECRET_PATH = "/admin";
export const ALLOWED_ADMIN_EMAILS = ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_NUR_ADMIN_EMAIL ?? "")
  .split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);

export function isAdminEmail(email: string): boolean {
  return ALLOWED_ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

const ADMIN_SESSION_KEY = "nur_admin_session";
export function getAdminSession(): boolean {
  return typeof window !== "undefined" && localStorage.getItem(ADMIN_SESSION_KEY) === "1";
}
export function setAdminSession(on: boolean): void {
  if (typeof window === "undefined") return;
  if (on) localStorage.setItem(ADMIN_SESSION_KEY, "1");
  else localStorage.removeItem(ADMIN_SESSION_KEY);
}

// ════════════════════════════════════════════════════════
// ★ ÖZEL GÜN HEDİYELERİ
//   Bakiye eklemez — o gün için ek üretim hakkı tanımlar.
// ════════════════════════════════════════════════════════

export const HEDIYE = {
  CUMA: { kind: "kisa" as VideoKind, amount: 2 },
  KANDIL: { kind: "kisa" as VideoKind, amount: 3 },
  RAMAZAN: { kind: "kisa" as VideoKind, amount: 5 },
  BAYRAM: { kind: "uzun" as VideoKind, amount: 2 },
  KADIR: { kind: "uzun" as VideoKind, amount: 3 },
  KAYIT: { kind: "kisa" as VideoKind, amount: 5 },
} as const;

export function isRamadan(): boolean {
  return typeof window !== "undefined" && localStorage.getItem("nur_ramadan_mode") === "1";
}
export function setRamadanMode(on: boolean): void {
  if (typeof window === "undefined") return;
  if (on) localStorage.setItem("nur_ramadan_mode", "1");
  else localStorage.removeItem("nur_ramadan_mode");
}
export function isFriday(): boolean { return serverIsFriday(); }
export function todayServerISO(): string { return serverDateISO(); }

// ════════════════════════════════════════════════════════
// ★ MİKRO KİLİT AÇMA (24 saat)
// ════════════════════════════════════════════════════════

export type MicroUnlockKey = "batch" | "ai_search" | "full_mode";
const MICRO_UNLOCK_PREFIX = "nur_micro_unlock_";
const MICRO_UNLOCK_HOURS = 24;

export function hasMicroUnlock(key: MicroUnlockKey): boolean {
  return typeof window !== "undefined" && Date.now() < Number(localStorage.getItem(MICRO_UNLOCK_PREFIX + key) || 0);
}
export function grantMicroUnlock(key: MicroUnlockKey): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(MICRO_UNLOCK_PREFIX + key, String(Date.now() + MICRO_UNLOCK_HOURS * 3600000));
  }
}
export function microUnlockRemainingMs(key: MicroUnlockKey): number {
  return typeof window === "undefined" ? 0 : Math.max(0, Number(localStorage.getItem(MICRO_UNLOCK_PREFIX + key) || 0) - Date.now());
}

// ════════════════════════════════════════════════════════
// ★ DAVET PROGRAMI — ödül olarak ek üretim hakkı verir
// ════════════════════════════════════════════════════════

export const DAVET_KADEMELERI = [
  { esik: 3, rozet: "Tohum", kind: "kisa" as VideoKind, amount: 3 },
  { esik: 10, rozet: "Fidan", kind: "kisa" as VideoKind, amount: 8 },
  { esik: 25, rozet: "Ağaç", kind: "uzun" as VideoKind, amount: 5 },
  { esik: 50, rozet: "Orman", kind: "tam" as VideoKind, amount: 2, ozel: "Ömür boyu Pro" },
] as const;
export const DAVET_EDILEN_GIRIS = 3;
export const DAVET_REFERANS_KOD_BONUS = 1;

// ════════════════════════════════════════════════════════
// ★ GEÇİŞ KATMANI (StudioApp.tsx uyumluluğu)
//
//   StudioApp.tsx henüz eski isimleri çağırıyor.
//   Bu bölüm o çağrıları YENİ kota sistemine yönlendirir.
//   Hiçbiri bakiye tutmaz — sadece kota/paket okur.
//   StudioApp.tsx güncellenince bu bölüm silinebilir.
// ════════════════════════════════════════════════════════

/** Süre modu → video türü eşlemesi */
export const MODE_TO_KIND: Record<"short" | "long" | "full", VideoKind> = {
  short: "kisa",
  long: "uzun",
  full: "tam",
};

/** ESKİ AD — artık maliyet yok, her üretim 1 haktır */
export function videoMaliyeti(_mode: "short" | "long" | "full", _tier?: Tier): number {
  return 1;
}

/** ESKİ AD — o türden bugün toplam kaç üretim yapılabilir */
export function jetonTavani(tier: Tier, _ramadan?: boolean): number {
  return DAILY_QUOTA[tier].kisa + DAILY_QUOTA[tier].uzun + DAILY_QUOTA[tier].tam;
}

/** ESKİ AD — toplam kalan üretim hakkı (kota + paket) */
export function getJeton(): number {
  const tier = getCurrentTier();
  return (["kisa", "uzun", "tam"] as VideoKind[]).reduce((sum, k) => sum + getAvailable(k, tier), 0);
}

/**
 * ESKİ AD — HeaderTopBar eski sürümü bunu import ediyor.
 * Artık bakiye/cüzdan değildir. Sadece geriye uyumluluk için
 * toplam kullanılabilir üretim hakkını eski alan adlarıyla döndürür.
 */
export function getJetonVault(): { subJeton: number; purchasedJeton: number; total: number } {
  const tier = getCurrentTier();
  const dailyLeft = (["kisa", "uzun", "tam"] as VideoKind[]).reduce((sum, k) => sum + getQuotaLeft(k, tier), 0);
  const packs = getPackRights();
  const packageLeft = packs.kisa + packs.uzun + packs.tam;
  return {
    subJeton: dailyLeft,
    purchasedJeton: packageLeft,
    total: dailyLeft + packageLeft,
  };
}

/** ESKİ AD — artık dışarıdan sayı yazılamaz, işlem yapmaz */
export function setJeton(_amount: number): void {
  /* bakiye kavramı kaldırıldı — bilinçli olarak boş */
}

/** ESKİ AD — paket hakkı olarak kısa video ekler */
export function addPurchasedJeton(amount: number): void {
  grantPack("kisa", amount);
}

/** ESKİ AD — günlük kota otomatik yenilenir, işlem yapmaz */
export function addDailySubJeton(_amount: number, _cap?: number): void {
  /* günlük kota her gün otomatik sıfırlanır — bilinçli olarak boş */
}

/** ESKİ AD — sabitler yeni kota değerlerine bağlandı */
export const JETON = {
  COST_KISA: 1,
  COST_UZUN: 1,
  COST_TAM: 1,
  DAILY_FREE: DAILY_QUOTA.free.kisa,
  DAILY_PRO: DAILY_QUOTA.pro.kisa,
  DAILY_ELIT: DAILY_QUOTA.elit.kisa,
  DAILY_FREE_RAMADAN: DAILY_QUOTA.free.kisa,
  DAILY_PRO_RAMADAN: DAILY_QUOTA.pro.kisa,
  DAILY_ELIT_RAMADAN: DAILY_QUOTA.elit.kisa,
  TAVAN_FREE: DAILY_QUOTA.free.kisa,
  TAVAN_PRO: DAILY_QUOTA.pro.kisa + DAILY_QUOTA.pro.uzun,
  TAVAN_ELIT: DAILY_QUOTA.elit.kisa + DAILY_QUOTA.elit.uzun + DAILY_QUOTA.elit.tam,
  TAVAN_ELIT_RAMAZAN: DAILY_QUOTA.elit.kisa + DAILY_QUOTA.elit.uzun + DAILY_QUOTA.elit.tam,
  KAYIT_BONUSU_FREE: HEDIYE.KAYIT.amount,
  CUMA_BONUS: HEDIYE.CUMA.amount,
  KANDIL_BONUS: HEDIYE.KANDIL.amount,
  BAYRAM_BONUS: HEDIYE.BAYRAM.amount,
  KADIR_GECESI: HEDIYE.KADIR.amount,
  DOGUM_GUNU: 2,
  ILK_GIRIS_BUGUN: 2,
  ILK_GIRIS_YARIN: 1,
  TAM_SURUM_CAP_SANIYE: VIDEO_KIND_SECONDS.tam,
  MIKRO_KILIT_SURESI_SAAT: MICRO_UNLOCK_HOURS,
  MIKRO_KILIT_ACMA_UCRETI: 1,
  PAKET_RAMAZAN_FREE: 5,
  PAKET_RAMAZAN_PRO: 10,
} as const;

/** ESKİ AD — fiyat listesi yeni değerlere bağlandı */
export const PRICING = {
  PRO: { tl: TIER_PRICE_TRY.pro, usd: 4.2, period: "aylık" },
  ELIT: { tl: TIER_PRICE_TRY.elit, usd: 7.0, period: "aylık" },
  DENEME: { tl: 35, usd: 1.0, period: "tek seferlik" },
  UYE: { tl: TIER_PRICE_TRY.pro, usd: 4.2, period: "aylık" },
} as const;

/** ESKİ AD — eski paket kartları kaldırıldı, yeni paketler pricing.ts içinde */
export const JETON_PAKETLERI = [] as const;
