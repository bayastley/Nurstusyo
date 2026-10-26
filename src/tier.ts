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
// ★ 26.10: featureLockLabel rozeti oturum dilinde döner (badgePro/badgeElit)
import { translate } from "./i18n";
const dilX2610 = (): string => typeof localStorage !== "undefined" ? (localStorage.getItem("nur_lang") || "tr") : "tr";
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
  tam: "Tam Sürüm (120 dk)",
};

export const VIDEO_KIND_SECONDS: Record<VideoKind, number> = {
  kisa: 59,
  uzun: 600,
  tam: 120 * 60,
};

export const CURRENT_TIER_KEY = "nur_tier";
if (typeof window !== "undefined") {
  secureMigrate<Tier>(CURRENT_TIER_KEY, (raw) => (raw === "pro" || raw === "elit" ? raw : "free"));
}

const TRIAL_KEY = "nur_trial_start";
const TRIAL_DAYS = 7;

// ════════════════════════════════════════════════════════
// ★ 26.10 7-HAFTA LANS KAMPANYASI (sahibin emri — ömür boyu +1 kardesi ile bitti)
//   Lansmandan başlayıp tam 7 hafta (49 gün) boyunca HERKES gerçek PRO'dur:
//   • “Pro etiketler vurulur” → getCurrentTier kampanya boyunca pro döner; üst
//     bardaki üyelik çipi, kilite UI ve PAYLAŞım rozetleri otomatik NÛR PRO görünür.
//   • Özellikler açık → tier tabanli kapılar pro'dan geçer.
//   • Haklar SINIR: üretim hakları/fat kotalar PRO seviyesiyle sınırlı — sınırsız değil.
//   • Bitiş kamasona kapılır; bitişin ilk 7 günü kullanışamlara bitiş bildirimi
//     (AnnouncementBar) gösterilir; admin ayrıca duyuru/push'sun alabilir.
//   Tarihe bağlıdır (kayıt-depolama yok) → süresiz uzatma saldırısı imkânsız.
// ════════════════════════════════════════════════════════
export const LANS_KAMPANYA_BASLANGIC = Date.UTC(2026, 9, 26, 0, 0, 0); // 26.10.2026
export const LANS_KAMPANYA_BITIS = Date.UTC(2026, 11, 14, 0, 0, 0); // 14.12.2026 = pak 7 hafta sonra

export function lansKampanyaAktif(): boolean {
  const n = Date.now();
  return n >= LANS_KAMPANYA_BASLANGIC && n < LANS_KAMPANYA_BITIS;
}

/** Kampanya boyunca kalan tam hafta sayısı (bitiş dâhil değil) */
export function lansKampanyaHaftaKaldi(): number {
  const remain = LANS_KAMPANYA_BITIS - Date.now();
  return remain > 0 ? Math.max(1, Math.ceil(remain / (7 * 86400 * 1000))) : 0;
}

/** BİTİŞ BİLDİRİMİ penceresi: bitişten sonraki ilk 7 gün true döner */
export function lansKampanyaBitti(): boolean {
  const n = Date.now();
  return n >= LANS_KAMPANYA_BITIS && n < LANS_KAMPANYA_BITIS + 7 * 86400 * 1000;
}

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
  // ★ 26.10 7-hafta lans kampanyası: kampanya aktifken herkes GERÇEK PRO'dur
  //   (yukarıdaki LANS_KAMPANYA bloğu). Elit üyeler elit kalır.
  if (lansKampanyaAktif()) return "pro";
  // ★ 7 günlük ücretsiz PRO denemesi — yeni üyeler için
  if (isTrialActive()) return "pro";
  return "free";
}

export function setCurrentTier(tier: Tier): void {
  if (typeof window !== "undefined") secureSet(CURRENT_TIER_KEY, tier);
}

const TIER_RANK: Record<Tier, number> = { free: 0, pro: 1, elit: 2 };
// ★ 25.10 LANSMAN DENEMESİ — SAHİBİN EMRİ: deneme hakkı (5) olan HER kullanıcı,
//   tier'ı ne olursa olsun PRO/ELİT kapılarından geçer; rozet/kilit UI'ı da
//   aynı fonksiyonu okuduğu için PRO/ELİT rozetleri son giren kullanıcının
//   gözüne hiç görünmez. Deneme bakiyesi bitince (kalan=0) eski davranış döner.
//   Sunucuda üretim yine /api/render/authorize ile DOĞRULAR (2. sağlam kapı).
//   Circular import koruması: deneme modülü tier.ts'ten hiçbir şey import etmez.
import { denemeAktifMi } from "./studio/deneme";
export function tierAtLeast(have: Tier, need: Tier): boolean {
  if (need !== "free" && denemeAktifMi()) return true;
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
  elit: 249,
};

// ★ Yıllık üyelik — 16.10 (3. güncelleme — kullanıcı emri: PRO 149₺, ELİT 249₺):
//   annualPriceTRY(): PRO 149×12×0,90 = 1.609,2 → 10'luk yuvarla 1.610₺ · ELİT 249×12×0,85 = 2.539,8 → 2.540₺
//   Katalog (pricingData.ts SUB_*_1Y) ve create.ts PRODUCT_CATALOG aynı değerleri taşır.
export const ANNUAL_DISCOUNT: Record<Tier, number> = { free: 0, pro: 0.10, elit: 0.15 };
export function annualPriceTRY(tier: Tier): number {
  const base = TIER_PRICE_TRY[tier] * 12;
  // ★ 10'LUK YUVARLAMA (16.10): klasik Math.round PRO'da 1.609 → katalog 1.610 ile 1₺
  //   uyumsuzluk veriyordu (UI gösteren ≠ iyzico çeken). 10'luk yuvarlama her iki
  //   yan için de düşük-yuvarlama zarafeti sağlar: 1609,2→1610 · 2539,8→2540.
  return Math.round((base * (1 - ANNUAL_DISCOUNT[tier])) / 10) * 10;
}

/** Bugün kaç adet üretildi — gün değişince otomatik sıfırlanır */
interface DailyUsage {
  week: string;
  used: Quota;
}

const DAILY_USAGE_KEY = "nur_daily_usage_v3";
const EMPTY_QUOTA: Quota = { kisa: 0, uzun: 0, tam: 0 };

// ════════════════════════════════════════════════════════
// ★ HAFTALIK DÖNEM (06.10 — sahibin emri): kota artık GÜNLÜK değil HAFTALIK.
//   • Dönem: kullanıcının YEREL saatinde haftanın Pazartesi'si 00:00'da başlar
//     ("konuma göre gece 00:00'da tanımlansın").
//   • Hafta içinde kullanılmayan hak KAYBOLMAZ — bir sonraki Pazartesi'ye taşınır
//     ("bir kere alsın, ortadan kaybolmasın").
//   • Dönem toplamı = HAFTALIK_KAT_SAYI × eski günlük kota — günlük gelen
//     kullanıcı da toplam hakkını korur, kimse kul hakkı yemez.
//   • Eski günlük kayıtlar (date alanlı) ilk okumada yeni döneme otomatik geçer.
// ════════════════════════════════════════════════════════
export const HAFTALIK_KAT_SAYI = 7;

/** Bu anın hafta anahtarı: YEREL saatte bu haftanın Pazartesi'si (YYYY-MM-DD) */
export function haftaPazartesiYerel(now: Date = new Date()): string {
  const gun = now.getDay(); // 0=Pazar ... 6=Cumartesi
  const pztKaydir = gun === 0 ? -6 : 1 - gun;
  const pzt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + pztKaydir);
  const mm = String(pzt.getMonth() + 1).padStart(2, "0");
  const dd = String(pzt.getDate()).padStart(2, "0");
  return `${pzt.getFullYear()}-${mm}-${dd}`;
}

/** Dönem (hafta) toplamı: HAFTALIK_KAT_SAYI × günlük kota */
function donemToplami(kind: VideoKind, tier: Tier): number {
  return DAILY_QUOTA[tier][kind] * HAFTALIK_KAT_SAYI;
}

function readUsage(): DailyUsage {
  if (typeof window === "undefined") return { week: "", used: { ...EMPTY_QUOTA } };
  const hafta = haftaPazartesiYerel();
  const stored = secureGet<{ date?: string; week?: string; used?: Partial<Quota> } | null>(DAILY_USAGE_KEY, null);
  if (!stored || stored.week !== hafta) {
    const fresh: DailyUsage = { week: hafta, used: { ...EMPTY_QUOTA } };
    secureSet(DAILY_USAGE_KEY, fresh);
    return fresh;
  }
  return { week: stored.week, used: { ...EMPTY_QUOTA, ...(stored.used || {}) } };
}

function writeUsage(usage: DailyUsage): void {
  if (typeof window === "undefined") return;
  secureSet(DAILY_USAGE_KEY, usage);
}

/** Bugün bu türden kaç tane kullanıldı */
export function getUsedToday(kind: VideoKind): number {
  return Math.max(0, Math.floor(readUsage().used[kind] || 0));
}

/** Bu dönemden (hafta) bu türden kaç hak kaldı (haftalık kota + Sadık Üye bonusu) */
export function getQuotaLeft(kind: VideoKind, tier: Tier = getCurrentTier()): number {
  const total = donemToplami(kind, tier) + sadikUyeBonusu(kind);
  return Math.max(0, total - getUsedToday(kind));
}

/** "Kalan: 22/22 kısa" gibi gösterim metni — KALAN hak gösterir,
 *  kullandıkça azalır (ör. 22/22 → 21/22 → 20/22 ...). Sadık Üye bonusu dahil.
 *  Dönem HAFTALIK: Pazartesi yerel 00:00'da yenilenir, hafta içi taşınır. */
export function quotaText(kind: VideoKind, tier: Tier = getCurrentTier()): string {
  const total = donemToplami(kind, tier) + sadikUyeBonusu(kind);
  const left = Math.max(0, total - getUsedToday(kind));
  return `${left}/${total}`;
}

// ════════════════════════════════════════════════════════
// ★ SADIK ÜYE KAMPANYASI (05.10 — SAHİBİN EMRİ)
//   Sistemi ilk keşfeden ve inanan üreticilere: ilk 500 kayıta "Sadık Üye"
//   etiketi. ★ 25.10 GÜNCELLEME (sahibin emri): ömür boyu +1 bonus İPTAL —
//   lansman döneminde herkesin üretim hakkı tek ortak deneme hakkından
//   yönetiliyor; sadık üyelik artık salt şeref rozeti, kota eklemiyor.
//   Otorite sunucuda: /api/auth/me cevabındaki sadikUye bayrağı (created_at
//   sıralamasıyla hesaplanır) local secureStore'a yazılır.
// ════════════════════════════════════════════════════════
const SADIK_UYE_KEY = "nur_sadik_uye_v1";

export function setSadikUye(acik: boolean): void {
  if (typeof window === "undefined") return;
  secureSet(SADIK_UYE_KEY, Boolean(acik));
}

export function isSadikUye(): boolean {
  if (typeof window === "undefined") return false;
  return secureGet<boolean>(SADIK_UYE_KEY, false) === true;
}

/** ★ 25.10: +1 bonus İPTAL — sadık üyelik salt rozet oldu (0 ek hak) */
export function sadikUyeBonusu(kind: VideoKind): number {
  return 0;
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

/** Bu üyelik bu video türünü hiç üretebiliyor mu (dönem kotası 0 ve paket 0 ise hayır) */
export function canProduceKind(kind: VideoKind, tier: Tier = getCurrentTier()): boolean {
  return donemToplami(kind, tier) + sadikUyeBonusu(kind) > 0 || getPackRights()[kind] > 0;
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
  aspect_1_1: { kind: "tier", tier: "free" }, aspect_16_9: { kind: "tier", tier: "free" }, // ★ 22.10: 16:9 da FREE — üye olmayan da yatay video hazırlayabilsin (kullanıcı emri)
  batch: { kind: "tier", tier: "elit" }, ai_search: { kind: "tier", tier: "elit" },
  // ★ 22.10 kullanıcı emri: BAŞLIK HERKESE (free), AÇIKLAMA üretimi ELİT tier'ına taşındı.
  refresh_text: { kind: "tier", tier: "elit" }, refresh_title: { kind: "tier", tier: "free" },
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
  return gate.kind === "tier"
    ? (gate.tier === "pro" ? translate(dilX2610(), "badgePro") : translate(dilX2610(), "badgeElit"))
    : gate.version.toUpperCase();
}

// ★ DÜRÜST KÂRİ LİSTELERİ (08.10, kullanıcı emri) — reciters.ts'deki 45 gerçek id ile birebir
//   FREE  : 10 kâri — foto4'tekiler KESİN free (Juhany, Shuraim, Maher, Sudais) + telifi
//           en yüksek ünlüler (Husary, Abdulbasit, Minşavi, Afasi) herkese açık
//   PRO   : 25 kâri GÖRÜR (10 free + 15 pro) — yani PRO listesinde 15 kâri var
//   ELİT  : HEPSİNİ GÖRÜR (45) — yani ELİT listesinde 20 kâri var
//   (senin emrin: free 10, pro +15 = 25 toplam, elit hepsi)
export const FREE_RECITER_IDS = [
  'sudais', 'shuraim', 'maher', 'juhany',
  'alafasy', 'husary', 'abdulbasit', 'minshawi',
  'abdulbasit_mujawwad', 'minshawi_mujawwad',
] as const;

export const PRO_RECITER_IDS = [
  'sudais_fast', 'hudhaify', 'qasim', 'matroud',
  'akhdar', 'basfar', 'qatami', 'ajamy', 'tablawi',
  'banna', 'jibreel', 'shatri', 'qahtani',
  'ghamdi_saad', 'hani_rifai',
] as const;

// ★ ELİT — yalnız ELİT üyelerin görebildiği özel kâriler (20 adet; elit geri kalan 45'in HEPSİNİ görür)
export const ELIT_RECITER_IDS = [
  'muhaisny',        // (reciters.ts'de de requiredTier: "elit" işaretli)
  'dosari',          // ★ Yaser el-Dosari — kullanıcı emri: KESİN ELİT
  'sahl_yassin',     // ★ Sehl Yasin — kullanıcı emri: KESİN ELİT
  'mustafa_ismail', 'ahmed_neana', 'aziz_alili',
  'karim_mansoori', 'tunaiji', 'akram_alaqimy', 'yaser_salamah',
  'husary_mujawwad', 'husary_teacher', 'budair', 'ayyoub',
  'sowaid', 'parhizgar', 'ali_jaber', 'fares_abbad',
  'abdulkareem', 'bukhatir',
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
