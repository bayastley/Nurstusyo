import { secureGet, secureMigrate, secureSet } from "./secureStore";
import { serverDateISO, serverIsFriday } from "./serverTime";

export type Tier = "free" | "pro" | "elit";

export const CURRENT_TIER_KEY = "nur_tier";
if (typeof window !== "undefined") {
  secureMigrate<Tier>(CURRENT_TIER_KEY, (raw) => raw === "pro" || raw === "elit" ? raw : "free");
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
  // ★ 1:1 (Instagram kare) artık FREE — kullanıcı ücretsiz denemede iki format kullanabilsin.
  //   16:9 (YouTube yatay) Pro'da kalır.
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

// ★ Hoca kilit yeniden düzenlendi:
//   - Elit'tekiler free'ye taşındı (telif riski yüksek olması kilit gerekçesi değil)
//   - Free'den 4 tanesine Elit kilidi verildi (premium his için)
//   - Akıllı Al (AI arama) adı ve işlevi aynı, sadece erişim yeniden dengelendi

export const FREE_RECITER_IDS = [
  // Önceden free olanlar (9) aynen korundu
  "sudais", "shuraim", "hudhaify", "akhdar", "husary", "husary_teacher", "minshawi", "sowaid", "parhizgar",
  // Önceden elit olan 6 hoca free'ye alındı
  "muhaisny", "abdulbasit_mujawwad", "minshawi_mujawwad", "alafasy", "shatri", "qahtani",
] as const;

export const PRO_RECITER_IDS = [
  "maher", "juhany", "qasim", "budair", "ayyoub", "matroud", "basfar", "qatami", "dosari", "ajamy",
  "husary_mujawwad", "abdulbasit", "tablawi", "banna", "jibreel",
] as const;

// ★ Elit kilidi: Free listesinden 4 popüler hocaya taşındı (blur + Elit rozeti)
//   alafasy, shatri, qahtani, muhaisny — bunlar zaten çok bilinen isimler,
//   Elit'e koymak "özel" hissi verir.
export const ELIT_RECITER_IDS = [
  "alafasy", "shatri", "qahtani", "muhaisny",
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
  return VERSION_ORDER.reduce<AppVersion>((current, version) => today >= VERSION_SCHEDULE[version] ? version : current, "v1.0");
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

export const ADMIN_SECRET_PATH = "/admin";
export const ALLOWED_ADMIN_EMAILS = ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_NUR_ADMIN_EMAIL ?? "")
  .split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);

export function isAdminEmail(email: string): boolean {
  return ALLOWED_ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

const ADMIN_SESSION_KEY = "nur_admin_session";
export function getAdminSession(): boolean { return typeof window !== "undefined" && localStorage.getItem(ADMIN_SESSION_KEY) === "1"; }
export function setAdminSession(on: boolean): void {
  if (typeof window === "undefined") return;
  if (on) localStorage.setItem(ADMIN_SESSION_KEY, "1");
  else localStorage.removeItem(ADMIN_SESSION_KEY);
}

export const JETON = {
  KAYIT_BONUSU_FREE: 20, DAILY_FREE: 20, DAILY_PRO: 40, DAILY_ELIT: 150,
  DAILY_FREE_RAMADAN: 15, DAILY_PRO_RAMADAN: 55, DAILY_ELIT_RAMADAN: 200,
  CUMA_BONUS: 15, KADIR_GECESI: 50, KANDIL_BONUS: 20, BAYRAM_BONUS: 30,
  DOGUM_GUNU: 25, ILK_GIRIS_BUGUN: 15, ILK_GIRIS_YARIN: 10,
  TAVAN_FREE: 60, TAVAN_PRO: 100, TAVAN_ELIT: 150, TAVAN_ELIT_RAMAZAN: 200,
  COST_KISA: 8, COST_UZUN: 15, COST_TAM: 45, TAM_SURUM_CAP_SANIYE: 40 * 60,
  MIKRO_KILIT_ACMA_UCRETI: 5, MIKRO_KILIT_SURESI_SAAT: 24,
  PAKET_RAMAZAN_FREE: 50, PAKET_RAMAZAN_PRO: 100, ELIT_RAMAZAN_HEDIYE_ABonelik: 3,
} as const;

export function jetonTavani(tier: Tier, ramadan: boolean): number {
  if (tier === "free") return JETON.TAVAN_FREE;
  if (tier === "pro") return JETON.TAVAN_PRO;
  return ramadan ? JETON.TAVAN_ELIT_RAMAZAN : JETON.TAVAN_ELIT;
}

export function videoMaliyeti(mode: "short" | "long" | "full", _tier: Tier): number {
  return mode === "short" ? JETON.COST_KISA : mode === "long" ? JETON.COST_UZUN : JETON.COST_TAM;
}

export type MicroUnlockKey = "batch" | "ai_search" | "full_mode";
const MICRO_UNLOCK_PREFIX = "nur_micro_unlock_";
export function hasMicroUnlock(key: MicroUnlockKey): boolean { return typeof window !== "undefined" && Date.now() < Number(localStorage.getItem(MICRO_UNLOCK_PREFIX + key) || 0); }
export function grantMicroUnlock(key: MicroUnlockKey): void { if (typeof window !== "undefined") localStorage.setItem(MICRO_UNLOCK_PREFIX + key, String(Date.now() + JETON.MIKRO_KILIT_SURESI_SAAT * 3600000)); }
export function microUnlockRemainingMs(key: MicroUnlockKey): number { return typeof window === "undefined" ? 0 : Math.max(0, Number(localStorage.getItem(MICRO_UNLOCK_PREFIX + key) || 0) - Date.now()); }
export function isRamadan(): boolean { return typeof window !== "undefined" && localStorage.getItem("nur_ramadan_mode") === "1"; }
export function setRamadanMode(on: boolean): void { if (typeof window !== "undefined") on ? localStorage.setItem("nur_ramadan_mode", "1") : localStorage.removeItem("nur_ramadan_mode"); }
export function isFriday(): boolean { return serverIsFriday(); }
export function todayServerISO(): string { return serverDateISO(); }

export const PRICING = {
  DENEME: { usd: 0.75, jeton: 50, period: "tek seferlik" }, UYE: { usd: 4.19, period: "aylık" },
  PRO: { usd: 5.6, tl: 263, period: "aylık" }, ELIT: { usd: 9.6, tl: 400, period: "aylık" },
} as const;

export const JETON_PAKETLERI = [
  { jeton: 50, tl: 29, usd: 0.60, label: "Başlangıç", unitPrice: "Jeton başına ₺0.58" },
  { jeton: 100, tl: 54, usd: 1.12, label: "Standart", unitPrice: "Jeton başına ₺0.54" },
  { jeton: 300, tl: 158, usd: 3.36, label: "Orta", unitPrice: "Jeton başına ₺0.53" },
  { jeton: 800, tl: 416, usd: 8.80, label: "Büyük", unitPrice: "Jeton başına ₺0.52" },
  { jeton: 2000, tl: 944, usd: 20, label: "Dev", unitPrice: "Jeton başına ₺0.47" },
] as const;

export const DAVET_KADEMELERI = [
  { esik: 3, rozet: "Tohum", jeton: 10 }, { esik: 10, rozet: "Fidan", jeton: 20 },
  { esik: 25, rozet: "Ağaç", jeton: 50 }, { esik: 50, rozet: "Orman", jeton: 0, ozel: "Ömür boyu Pro" },
] as const;
export const DAVET_EDILEN_GIRIS = 20;
export const DAVET_REFERANS_KOD_BONUS = 5;

export const NUR_JETON_KEY = "nur_jeton";
export const NUR_JETON_VAULT_KEY = "nur_jeton_vault_v2";
export interface JetonVault { subJeton: number; purchasedJeton: number }

export function getJetonVault(): JetonVault {
  if (typeof window === "undefined") return { subJeton: 0, purchasedJeton: 0 };
  const vault = secureGet<JetonVault | null>(NUR_JETON_VAULT_KEY, null);
  if (vault) return { subJeton: Math.max(0, Math.floor(vault.subJeton)), purchasedJeton: Math.max(0, Math.floor(vault.purchasedJeton)) };
  const initial = { subJeton: Math.max(0, secureGet<number>(NUR_JETON_KEY, 0)), purchasedJeton: 0 };
  saveJetonVault(initial);
  return initial;
}

export function saveJetonVault(vault: JetonVault): void {
  if (typeof window === "undefined") return;
  const safe = { subJeton: Math.max(0, Math.floor(vault.subJeton)), purchasedJeton: Math.max(0, Math.floor(vault.purchasedJeton)) };
  secureSet(NUR_JETON_VAULT_KEY, safe);
  secureSet(NUR_JETON_KEY, safe.subJeton + safe.purchasedJeton);
}

export function getJeton(): number { const vault = getJetonVault(); return vault.subJeton + vault.purchasedJeton; }
export function setJeton(amount: number): void {
  const vault = getJetonVault();
  const diff = Math.floor(amount) - (vault.subJeton + vault.purchasedJeton);
  if (diff > 0) vault.purchasedJeton += diff;
  else if (diff < 0) {
    let deduct = Math.abs(diff);
    const fromSub = Math.min(vault.subJeton, deduct);
    vault.subJeton -= fromSub;
    deduct -= fromSub;
    vault.purchasedJeton = Math.max(0, vault.purchasedJeton - deduct);
  }
  saveJetonVault(vault);
}
export function addPurchasedJeton(amount: number): void { const vault = getJetonVault(); vault.purchasedJeton += Math.max(0, Math.floor(amount)); saveJetonVault(vault); }
export function addDailySubJeton(amount: number, cap: number): void { const vault = getJetonVault(); vault.subJeton = Math.min(cap, vault.subJeton + Math.max(0, Math.floor(amount))); saveJetonVault(vault); }
