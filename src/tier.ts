// ════════════════════════════════════════════════════════
// TIER.TS — Nûr Stüdyo Katman & Kilit & Jeton Omurgası
// ════════════════════════════════════════════════════════
import { secureGet, secureSet, secureMigrate } from "./secureStore";
import { serverIsFriday, serverDateISO } from "./serverTime";

export type Tier = "free" | "pro" | "elit";

/** Kullanıcının şu anki tier'ı — AES şifreli + HMAC imzalı olarak saklanır.
 *  Kullanıcı localStorage'ı elle bozarsa otomatik "free"a düşer ve tamper flag işaretlenir. */
export const CURRENT_TIER_KEY = "nur_tier";
// Eski plaintext veriyi güvenli formata bir kere taşı
if (typeof window !== "undefined") {
  secureMigrate<Tier>(CURRENT_TIER_KEY, (raw) => (raw === "pro" || raw === "elit" ? raw : "free"));
}
export function getCurrentTier(): Tier {
  if (typeof window === "undefined") return "free";
  const v = secureGet<Tier>(CURRENT_TIER_KEY, "free");
  return v === "pro" || v === "elit" ? v : "free";
}
export function setCurrentTier(t: Tier) {
  if (typeof window !== "undefined") secureSet<Tier>(CURRENT_TIER_KEY, t);
}

/** Bir tier'ın diğerine göre seviyesi — karşılaştırma için */
const TIER_RANK: Record<Tier, number> = { free: 0, pro: 1, elit: 2 };
export function tierAtLeast(have: Tier, need: Tier): boolean {
  return TIER_RANK[have] >= TIER_RANK[need];
}

/** Feature flag'leri — her özelliğin minimum tier'ı */
export type FeatureKey =
  | "reciter_telif"        // telif kârileri (Pro'da 5 popüler, Elit'te hepsi)
  | "reciter_klasik_pro"   // Pro'ya ekstra 2-3 klasik
  | "atmos_kategori_pro"   // Pro'ya açılan 5 kategori
  | "atmos_kategori_elit"  // Elit'e açılan geri kalan kategoriler
  | "atmos_video_pro"      // Free kategorilerinde 5'ten sonraki videolar
  | "atmos_video_elit"     // Pro kategorilerinde 5'ten sonraki videolar
  | "tema_pro"             // Pro temaları
  | "tema_elit"            // Elit temaları
  | "mode_long"            // uzun video (150 sn)
  | "mode_full"            // tam sürüm (20 dk)
  | "aspect_1_1"           // 1:1 format
  | "aspect_16_9"          // 16:9 format
  | "batch"                // üçlü indirme
  | "ai_search"            // akıllı AI arama
  | "refresh_text"         // yazıyı yenile
  | "refresh_title"        // başlığı yenile
  | "hashtag_add"          // hashtag ekleme
  | "watermark_remove"     // watermark kaldırma
  | "social_share"         // tek tık sosyal paylaşım
  | "zip_upload"           // ZIP/Image yükleme (V3)
  | "story_kuran"          // Kur'an hikayeleri (V2)
  | "story_kissa"          // Kıssalar (V2)
  | "story_hadis"          // Hadisler (V3)
  | "gift_code";           // hediye kodu (V3)

export type FeatureGate =
  | { kind: "tier"; tier: Tier }

  | { kind: "version"; version: "v2" | "v3" };

export const FEATURE_GATES: Record<FeatureKey, FeatureGate> = {
  reciter_telif:       { kind: "tier", tier: "pro" },
  reciter_klasik_pro:  { kind: "tier", tier: "pro" },
  atmos_kategori_pro:  { kind: "tier", tier: "pro" },
  atmos_kategori_elit: { kind: "tier", tier: "elit" },
  atmos_video_pro:     { kind: "tier", tier: "pro" },
  atmos_video_elit:    { kind: "tier", tier: "elit" },
  tema_pro:            { kind: "tier", tier: "pro" },
  tema_elit:           { kind: "tier", tier: "elit" },
  mode_long:           { kind: "tier", tier: "pro" },
  mode_full:           { kind: "tier", tier: "elit" },
  aspect_1_1:          { kind: "tier", tier: "pro" },
  aspect_16_9:         { kind: "tier", tier: "pro" },
  batch:               { kind: "tier", tier: "elit" },
  ai_search:           { kind: "tier", tier: "elit" },
  refresh_text:        { kind: "tier", tier: "pro" },
  refresh_title:       { kind: "tier", tier: "pro" },
  hashtag_add:         { kind: "tier", tier: "elit" },
  watermark_remove:    { kind: "tier", tier: "pro" },
  social_share:        { kind: "tier", tier: "elit" },
  zip_upload:          { kind: "version", version: "v3" },
  story_kuran:         { kind: "version", version: "v2" },
  story_kissa:         { kind: "version", version: "v2" },
  story_hadis:         { kind: "version", version: "v3" },
  gift_code:           { kind: "version", version: "v3" },
};

/** Bir feature kullanıcının tier'ında açık mı? */
export function isFeatureUnlocked(key: FeatureKey, tier: Tier): boolean {
  const gate = FEATURE_GATES[key];
  if (gate.kind === "tier") return tierAtLeast(tier, gate.tier);
  return false;
}

/** Bir feature'ın kilit etiketi — rozet ve tooltip için */
export function featureLockLabel(key: FeatureKey): string {
  const gate = FEATURE_GATES[key];
  if (gate.kind === "tier") return gate.tier === "pro" ? "PRO" : "ELİT";
  return gate.version.toUpperCase();
}
// ★ FREE (aktif — herkes ücretsiz erişebilir) kâriler.
// Lansmanda: 2 Kâbe İmamı (Sudays/Şüreym) + Ali Cabir + Ebu Bekir eş-Şâtırî öne çıkarıldı.
export const FREE_RECITER_IDS = [
  "sudais", "shuraim", "mahermuaiqly", "faresmabbad", "ghamadi", "sahl",
  "salamah", "aliabbasi", "shatri", "husary_muallim", "akhdar",
  // ★ Ücretsiz kullanıcılara açılan yüksek makam / düşük telifli kâriler
  "banna", "husary_64", "shuraim_alt",
] as const;
export const PRO_TELIF_RECITER_IDS = ["alafasy", "yasserdosari", "nasser_qatami", "shatri"] as const;

/**
 * ★ ADİL ERİŞİM MODELİ
 * Telif riski ORTA (%26-50) ve YÜKSEK (%51-100) olan kâriler ÜCRETSİZ açıktır.
 * Sebep: Bu kayıtlarda platform itirazı riski kullanıcıya aittir; ücret alınması
 * haksızlık olur. Kullanıcı riski görerek bilinçli seçim yapar.
 *
 * Ücretli (Pro) olanlar sadece telif riski DÜŞÜK (%0-25) olan "güvenli" kârilerdir —
 * asıl değerli olan, sorunsuz yayınlanabilen kayıtlardır.
 */
export function reciterRequiredTier(reciter: { id: string; makam: "Haram" | "Telif"; risk?: "low" | "mid" | "high" }): Tier {
  if ((FREE_RECITER_IDS as readonly string[]).includes(reciter.id)) return "free";
  // Orta ve yüksek telif riskli tüm kâriler ücretsiz
  if (reciter.risk === "mid" || reciter.risk === "high") return "free";
  if (reciter.makam === "Haram" || (PRO_TELIF_RECITER_IDS as readonly string[]).includes(reciter.id)) return "pro";
  return "pro";
}

// ─── Sürüm Kilidi (time-based + manual override) ────────────────────
export type AppVersion = "v1.0" | "v1.1" | "v1.2" | "v1.3" | "v1.4" | "v1.5" | "v1.6" | "v1.7";

/** Takvim — her sürümün otomatik açılacağı tarih (admin override ile ezilebilir) */
export const VERSION_SCHEDULE: Record<AppVersion, string> = {
  "v1.0": "2026-08-28",
  "v1.1": "2026-09-25",
  "v1.2": "2026-10-23",
  "v1.3": "2026-11-20",
  "v1.4": "2026-12-18",
  "v1.5": "2027-01-15",
  "v1.6": "2027-02-05",
  "v1.7": "2027-03-12",
};

const VERSION_ORDER: AppVersion[] = ["v1.0", "v1.1", "v1.2", "v1.3", "v1.4", "v1.5", "v1.6", "v1.7"];

export function getCurrentVersion(): AppVersion {
  if (typeof window === "undefined") return "v1.0";
  const override = localStorage.getItem("nur_version_override") as AppVersion | null;
  if (override && VERSION_ORDER.includes(override)) return override;
  const today = new Date().toISOString().slice(0, 10);
  let current: AppVersion = "v1.0";
  for (const v of VERSION_ORDER) {
    if (today >= VERSION_SCHEDULE[v]) current = v;
  }
  return current;
}

export function setVersionOverride(v: AppVersion | null) {
  if (typeof window === "undefined") return;
  if (v === null) localStorage.removeItem("nur_version_override");
  else localStorage.setItem("nur_version_override", v);
}

export function isVersionUnlocked(target: "v2" | "v3"): boolean {
  const cur = getCurrentVersion();
  if (target === "v2") return VERSION_ORDER.indexOf(cur) >= VERSION_ORDER.indexOf("v1.6");
  return VERSION_ORDER.indexOf(cur) >= VERSION_ORDER.indexOf("v1.7");
}
// ─── Admin Auth ─────────────────────────────────────────────────────
export const ADMIN_SECRET_PATH = "/admin";

// ★ Kurucu e-postaları artık kodda değil, .env içinde:
//   VITE_NUR_ADMIN_EMAIL=mail1@x.com,mail2@x.com  (virgülle ayır)
//   Frontend yalnızca UI ipucu için okur; gerçek yetki backend'de NUR_ADMIN_EMAILS ile doğrulanır.
export const ALLOWED_ADMIN_EMAILS: string[] = (
  (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_NUR_ADMIN_EMAIL ?? ""
)
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email: string): boolean {
  return ALLOWED_ADMIN_EMAILS.map(e => e.toLowerCase()).includes(email.toLowerCase().trim());
}

const ADMIN_SESSION_KEY = "nur_admin_session";
export function getAdminSession(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ADMIN_SESSION_KEY) === "1";
}
export function setAdminSession(on: boolean) {
  if (typeof window === "undefined") return;
  if (on) localStorage.setItem(ADMIN_SESSION_KEY, "1");
  else localStorage.removeItem(ADMIN_SESSION_KEY);
}

// ─── Jeton Ekonomisi Sabitleri (RESMİ MODEL — v2) ───────────────────
export const JETON = {
  KAYIT_BONUSU_FREE: 20,
  DAILY_FREE: 20,
  DAILY_PRO: 40,
  DAILY_ELIT: 150,
  DAILY_FREE_RAMADAN: 15,
  DAILY_PRO_RAMADAN: 55,
  DAILY_ELIT_RAMADAN: 200,
  CUMA_BONUS: 15,
  KADIR_GECESI: 50,
  KANDIL_BONUS: 20,
  BAYRAM_BONUS: 30,
  DOGUM_GUNU: 25,
  ILK_GIRIS_BUGUN: 15,
  ILK_GIRIS_YARIN: 10,
  TAVAN_FREE: 60,
  TAVAN_PRO: 100,
  TAVAN_ELIT: 150,
  TAVAN_ELIT_RAMAZAN: 200,
  COST_KISA: 8,
  COST_UZUN: 15,
  COST_TAM: 45,
  // ★ Tam Sürüm: 40 dakika (2400 sn) — son ayet yarım kalmasın diye güvenlik paylı.
  TAM_SURUM_CAP_SANIYE: 40 * 60,
  MIKRO_KILIT_ACMA_UCRETI: 5,
  MIKRO_KILIT_SURESI_SAAT: 24,
  PAKET_RAMAZAN_FREE: 50,
  PAKET_RAMAZAN_PRO: 100,
  ELIT_RAMAZAN_HEDIYE_ABonelik: 3,
} as const;

export function jetonTavani(tier: Tier, ramadanActive: boolean): number {
  if (tier === "free") return JETON.TAVAN_FREE;
  if (tier === "pro") return JETON.TAVAN_PRO;
  return ramadanActive ? JETON.TAVAN_ELIT_RAMAZAN : JETON.TAVAN_ELIT;
}

export function videoMaliyeti(mode: "short" | "long" | "full", tier: Tier): number {
  void tier;
  if (mode === "short") return JETON.COST_KISA;
  if (mode === "long") return JETON.COST_UZUN;
  return JETON.COST_TAM;
}
// ─── Mikro-Kilit Açma ────────────────────────────────────────
export type MicroUnlockKey = "batch" | "ai_search" | "full_mode";
const MICRO_UNLOCK_PREFIX = "nur_micro_unlock_";

export function hasMicroUnlock(key: MicroUnlockKey): boolean {
  if (typeof window === "undefined") return false;
  const until = Number(localStorage.getItem(MICRO_UNLOCK_PREFIX + key) || 0);
  return Date.now() < until;
}
export function grantMicroUnlock(key: MicroUnlockKey): void {
  if (typeof window === "undefined") return;
  const until = Date.now() + JETON.MIKRO_KILIT_SURESI_SAAT * 60 * 60 * 1000;
  localStorage.setItem(MICRO_UNLOCK_PREFIX + key, String(until));
}
export function microUnlockRemainingMs(key: MicroUnlockKey): number {
  if (typeof window === "undefined") return 0;
  const until = Number(localStorage.getItem(MICRO_UNLOCK_PREFIX + key) || 0);
  return Math.max(0, until - Date.now());
}
export function isRamadan(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("nur_ramadan_mode") === "1";
}
export function setRamadanMode(on: boolean) {
  if (typeof window === "undefined") return;
  if (on) localStorage.setItem("nur_ramadan_mode", "1");
  else localStorage.removeItem("nur_ramadan_mode");
}
/**
 * ★ SUNUCU-DOĞRULAMALI CUMA KONTROLÜ
 * Kullanıcı Windows saatini "Cuma" yapıp CUMA_BONUS'u sömüremesin diye
 * WorldTimeAPI/Cloudflare sunucu saatinden okur. Fallback için serverTime.ts
 * modülü kendi içinde monotonic clock ve tamper detection çalıştırır.
 */
export function isFriday(): boolean {
  return serverIsFriday();
}

/** Sunucu-doğrulamalı bugünün tarihi (YYYY-MM-DD). Günlük bonus için Date.now() yerine kullan. */
export function todayServerISO(): string {
  return serverDateISO();
}

// ─── Fiyat Tablosu — Üyelikler TL bazlı sabit fiyat ────
export const PRICING = {
  DENEME: { usd: 0.75, jeton: 50, period: "tek seferlik" },
  UYE:    { usd: 4.19, period: "aylık" },
  PRO:    { usd: 5.6, tl: 263, period: "aylık" },
  ELIT:   { usd: 9.6, tl: 400, period: "aylık" },
} as const;

// ★ TL ANA FİYATTIR (sabit). USD karşılığı güncel kurdan anlık hesaplanıp altında gösterilir.
export const JETON_PAKETLERI = [
  { jeton: 50,   tl: 29,  usd: 0.60, label: "Başlangıç", unitPrice: "Jeton başına ₺0.58" },
  { jeton: 100,  tl: 54,  usd: 1.12, label: "Standart",  unitPrice: "Jeton başına ₺0.54" },
  { jeton: 300,  tl: 158, usd: 3.36, label: "Orta",      unitPrice: "Jeton başına ₺0.53" },
  { jeton: 800,  tl: 416, usd: 8.80, label: "Büyük",     unitPrice: "Jeton başına ₺0.52" },
  { jeton: 2000, tl: 944, usd: 20.00, label: "Dev",      unitPrice: "Jeton başına ₺0.47" },
] as const;

// ─── Referans / Davet Kademeleri ────────────────────────────────────
export const DAVET_KADEMELERI = [
  { esik: 3,  rozet: "Tohum",  jeton: 10 },
  { esik: 10, rozet: "Fidan",  jeton: 20 },
  { esik: 25, rozet: "Ağaç",   jeton: 50 },
  { esik: 50, rozet: "Orman",  jeton: 0, ozel: "Ömür boyu Pro" },
] as const;

export const DAVET_EDILEN_GIRIS = 20;
export const DAVET_REFERANS_KOD_BONUS = 5;

// ─── Dual Jeton Kasası (GÜNLÜK ABONELİK KASASI + SATIN ALINAN TAVANDAN MUAF KASA) ───
// ★ Jeton bakiyesi AES + HMAC ile şifrelenip tarayıcı parmak iziyle imzalanır.
export const NUR_JETON_KEY = "nur_jeton";
export const NUR_JETON_VAULT_KEY = "nur_jeton_vault_v2";

export interface JetonVault {
  subJeton: number;       // Günlük / Abonelik gelen (Cap'e takılır)
  purchasedJeton: number; // Parayla alınan (Süresiz, Cap'ten %100 MUAF!)
}

export function getJetonVault(): JetonVault {
  if (typeof window === "undefined") return { subJeton: 0, purchasedJeton: 0 };
  const vault = secureGet<JetonVault | null>(NUR_JETON_VAULT_KEY, null);
  if (vault && typeof vault.subJeton === "number" && typeof vault.purchasedJeton === "number") {
    return {
      subJeton: Math.max(0, Math.floor(vault.subJeton)),
      purchasedJeton: Math.max(0, Math.floor(vault.purchasedJeton)),
    };
  }
  const legacy = secureGet<number>(NUR_JETON_KEY, 0);
  const initial: JetonVault = { subJeton: Math.max(0, legacy), purchasedJeton: 0 };
  secureSet(NUR_JETON_VAULT_KEY, initial);
  return initial;
}

export function saveJetonVault(v: JetonVault): void {
  if (typeof window === "undefined") return;
  const safe: JetonVault = {
    subJeton: Math.max(0, Math.floor(v.subJeton)),
    purchasedJeton: Math.max(0, Math.floor(v.purchasedJeton)),
  };
  secureSet(NUR_JETON_VAULT_KEY, safe);
  secureSet<number>(NUR_JETON_KEY, safe.subJeton + safe.purchasedJeton);
}

export function getJeton(): number {
  const v = getJetonVault();
  return v.subJeton + v.purchasedJeton;
}

export function setJeton(miktar: number): void {
  const v = getJetonVault();
  const currentTotal = v.subJeton + v.purchasedJeton;
  const diff = miktar - currentTotal;
  if (diff > 0) {
    v.purchasedJeton += diff;
  } else if (diff < 0) {
    let toDeduct = Math.abs(diff);
    if (v.subJeton >= toDeduct) {
      v.subJeton -= toDeduct;
    } else {
      toDeduct -= v.subJeton;
      v.subJeton = 0;
      v.purchasedJeton = Math.max(0, v.purchasedJeton - toDeduct);
    }
  }
  saveJetonVault(v);
}

/** Parayla satın alınan jetonu ekler — TAVANDAN (CAP) %100 MUAF VE SÜRESİZDİR! */
export function addPurchasedJeton(amount: number): void {
  const v = getJetonVault();
  v.purchasedJeton += Math.max(0, Math.floor(amount));
  saveJetonVault(v);
}

/** Günlük/Abonelik jetonunu ekler — TAVANA (CAP) TAKILIR */
export function addDailySubJeton(amount: number, capLimit: number): void {
  const v = getJetonVault();
  v.subJeton = Math.min(capLimit, v.subJeton + Math.max(0, Math.floor(amount)));
  saveJetonVault(v);
}
