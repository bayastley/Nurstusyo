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
// ★ 02.10 latent fix: consumeVideo (satır ~217) videoMaliyeti çağırıyordu ama import yoktu.
//   tierCompat zaten tier'den import ediyor (döngü var) — videoMaliyeti hoisted function
//   declaration olduğu için ESM döngüsünde güvenli (çağrı anında modül yüklü).
import { videoMaliyeti } from "./tierCompat";

export type Tier = "free" | "pro" | "elit";

/** Video süre türleri — kota ve paketler bu üç tür üzerinden işler */
export type VideoKind = "kisa" | "uzun" | "tam";

export const VIDEO_KIND_LABEL: Record<VideoKind, string> = {
  kisa: "Kısa Video (59 sn)",
  uzun: "Uzun Video (600 sn)",
  tam: "Tam Sürüm (90 dk)",
};

export const VIDEO_KIND_SECONDS: Record<VideoKind, number> = {
  kisa: 59,
  uzun: 600,
  tam: 90 * 60,
};

export const CURRENT_TIER_KEY = "nur_tier";
if (typeof window !== "undefined") {
  secureMigrate<Tier>(CURRENT_TIER_KEY, (raw) => (raw === "pro" || raw === "elit" ? raw : "free"));
}

const TRIAL_KEY = "nur_trial_start";
const TRIAL_DAYS = 7;

// ════════════════════════════════════════════════════════
// ★ SUNUCU TARAFI DENEME (02.10)
//   Önceden deneme yalnız burada (localStorage) yaşıyordu: anahtarı
//   silip yeniden kurunca 7 gün PRO sonsuza dek yenileniyordu.
//   Artık gerçek başlangıç sunucuda (nur_trials tablosu,
//   api/trial.ts) — yerel anahtar yalnız sunucudaki ERKEN
//   başlangıcın ÖNBELLEĞİDİR; uzatma imkânsız, dolunca silinir.
// ════════════════════════════════════════════════════════
export async function denemeyiSunucuyaSenkronla(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const yerel = localStorage.getItem(TRIAL_KEY);
    const res = await fetch("/api/trial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ startedAt: yerel ? Number(yerel) : undefined }),
    });
    if (!res.ok) return; // sunucu yoksa/oturum yoksa yerel davranış sürer
    const j = (await res.json()) as { serverTrial?: boolean; start?: number | null; active?: boolean };
    if (!j.serverTrial || typeof j.start !== "number") return; // tablo yok → fallback
    if (!j.active) {
      // Sunucuda süresi dolmuş → yerel uzatma olasılığını da kapat
      if (yerel) localStorage.removeItem(TRIAL_KEY);
      return;
    }
    // Sunucu ERKEN başlangıcı otoriterdir — yerel ondan eski olamaz
    if (!yerel || Number(yerel) > j.start) localStorage.setItem(TRIAL_KEY, String(j.start));
  } catch { /* ağ hatası — yerel davranış sürer */ }
}

export function isTrialActive(): boolean {
  if (typeof window === "undefined") return false;
  const start = localStorage.getItem(TRIAL_KEY);
  if (!start) return false;
  const elapsed = Date.now() - Number(start);
  return elapsed < TRIAL_DAYS * 86400000;
}

export function getTrialDaysLeft(): number {
  if (typeof window === "undefined") return 0;
  const start = localStorage.getItem(TRIAL_KEY);
  if (!start) return 0;
  const elapsed = Date.now() - Number(start);
  const remaining = TRIAL_DAYS * 86400000 - elapsed;
  return remaining > 0 ? Math.ceil(remaining / 86400000) : 0;
}

export function startTrial(): void {
  if (typeof window !== "undefined" && !localStorage.getItem(TRIAL_KEY)) {
    localStorage.setItem(TRIAL_KEY, String(Date.now()));
    // ★ Sunucuya kalıcı kayıt (nur_trials) — anlık UI için yerel de yazılır
    void denemeyiSunucuyaSenkronla();
  }
}

export function getCurrentTier(): Tier {
  if (typeof window === "undefined") return "free";
  const value = secureGet<Tier>(CURRENT_TIER_KEY, "free");
  if (value === "elit") return "elit";
  if (value === "pro") return "pro";
  // ★ 7 günlük ücretsiz PRO denemesi — yeni üyeler için
  if (isTrialActive()) return "pro";
  return "free";
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
  elit: 250,
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

/** "Kalan: 8/8 kısa" gibi gösterim metni — KALAN hak gösterir,
 *  kullandıkça azalır (ör. 8/8 → 7/8 → 6/8 ...). */
export function quotaText(kind: VideoKind, tier: Tier = getCurrentTier()): string {
  const total = DAILY_QUOTA[tier][kind];
  const left = Math.max(0, total - getUsedToday(kind));
  return `${left}/${total}`;
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
 * Video üretimi harcar.
 * mode: "short" | "long" | "full" — maliyeti belirler.
 * Kısa=1, Uzun=5, Tam=15 hak harcar.
 * Önce günlük kota kullanılır, kota biterse paket hakkı düşer.
 */
export function consumeVideo(kind: VideoKind, tier: Tier = getCurrentTier(), mode?: "short" | "long" | "full"): ConsumeResult {
  const cost = mode ? videoMaliyeti(mode, tier) : 1;
  const quotaLeft = getQuotaLeft(kind, tier);
  const packRights = getPackRights();

  // Gerekli toplam hak
  const needed = cost;
  const totalAvail = quotaLeft + packRights[kind];

  if (totalAvail < needed) {
    return {
      ok: false,
      source: "yok",
      quotaLeft,
      packLeft: packRights[kind],
      message: `${VIDEO_KIND_LABEL[kind]} için ${needed} hak gerekli. Kalan: ${totalAvail} hak. Paket alarak devam edebilirsiniz.`,
    };
  }

  // Önce kota harca, sonra pakeTHARCA
  let remaining = needed;
  const usage = readUsage();
  const quotaDeduct = Math.min(quotaLeft, remaining);
  if (quotaDeduct > 0) {
    usage.used[kind] = (usage.used[kind] || 0) + quotaDeduct;
    writeUsage(usage);
    remaining -= quotaDeduct;
  }

  if (remaining > 0) {
    const rights = getPackRights();
    rights[kind] -= remaining;
    savePackRights(rights);
  }

  return {
    ok: true,
    source: quotaDeduct > 0 ? "kota" : "paket",
    quotaLeft: getQuotaLeft(kind, tier),
    packLeft: getPackRights()[kind],
    message: `${needed} hak kullanıldı (${quotaDeduct > 0 ? "kota: " + quotaDeduct : "paket"})`,
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

// ★ DÜRÜST KÂRİ LİSTELERİ — her kâri benzersiz ses dosyası kullanır
//   Tier'lar reciters.ts'deki tier alanına göre belirlenir
export const FREE_RECITER_IDS = [
  // ★ Yüksek telif riski — ünlü kâriler, Content ID yakalar
  'sudais', 'husary', 'alafasy', 'basit_mujawwad',
  'minshawi_mujawwad', 'muhaisny', 'husary_mujawwad',
  'basit_192', 'shuraim', 'maher',
] as const;

export const PRO_RECITER_IDS = [
  // ★ Orta telif riski — yarı ünlü kâriler
  'matroud', 'hudhaify', 'jibreel', 'ghamadi', 'basfar_192',
  'bukhatir', 'dussary', 'katami', 'rifai', 'ajamy',
  'ali_jaber', 'shatri', 'sudais_fast', 'husary_fast',
] as const;

// ★ ELİT — düşük telif riski, premium konumlandırma
export const ELIT_RECITER_IDS = [
  // ★ Düşük telif riski — nadir/kalitesiz kayıtlar, Content ID bulamaz
  'basfar_64', 'husary_muallim', 'minshawi_16', 'akhdar_32',
  'sudais_64', 'alafasy_64', 'hudhaify_64', 'jibreel_64',
  'basit_64', 'rifai_64', 'ghamadi_40', 'shatri_64', 'shuraim_64',
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
// ★ SÜRÜM TAKVİMİ → src/version.ts'e taşındı (30.09 SRP adım 1a).
//   Aşağıdaki köprü eski import yollarını KORUR — tüketenler değişmeden çalışır.
// ════════════════════════════════════════════════════════
export { getCurrentVersion, setVersionOverride, isVersionUnlocked } from "./version";
export type { AppVersion } from "./version";

// ════════════════════════════════════════════════════════
// ★ ADMIN → src/adminConfig.ts'e taşındı (30.09 SRP adım 1b).
//   YETKİ SUNUCUDA — buradaki liste yalnız UI görünürlük katmanı.
// ════════════════════════════════════════════════════════
export { ADMIN_SECRET_PATH, ALLOWED_ADMIN_EMAILS, isAdminEmail, getAdminSession, setAdminSession } from "./adminConfig";

// ════════════════════════════════════════════════════════
// ★ MİKRO KİLİT + DAVET → src/microUnlock.ts'e taşındı (30.09 SRP adım 1c)
// ════════════════════════════════════════════════════════
export { hasMicroUnlock, grantMicroUnlock, microUnlockRemainingMs, DAVET_KADEMELERI, DAVET_EDILEN_GIRIS, DAVET_REFERANS_KOD_BONUS } from "./microUnlock";
export type { MicroUnlockKey } from "./microUnlock";
import { MICRO_UNLOCK_HOURS } from "./microUnlock";

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
// ★ MİKRO KİLİT AÇMA (24 saat) → src/microUnlock.ts'e taşındı (30.09)
// ════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════
// ★ DAVET PROGRAMI → src/microUnlock.ts'e taşındı (30.09)
// ════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════
// ★ GEÇİŞ KATMANI → src/tierCompat.ts'e taşındı (30.09 SRP adım 1d).
//   Aşağıdaki köprü eski import yollarını KORUR — tüketenler değişmeden çalışır.
// ════════════════════════════════════════════════════════
export { MODE_TO_KIND, videoMaliyeti, jetonTavani, getJeton, getJetonVault, setJeton, addPurchasedJeton, addDailySubJeton, JETON, PRICING, JETON_PAKETLERI } from "./tierCompat";
