// ════════════════════════════════════════════════════════
// TIERCOMPAT.TS — ESKİ AD GEÇİŞ KATMANI
// tier.ts'den ayrıldı (SRP parçalama adım 1d, 30.09)
//   StudioApp eski isimleri çağırıyor; bu katman onları yeni
//   kota sistemine yönlendirir. Hiçbiri bakiye tutmaz.
//   Tüketen dosyalar tier.ts'ten import etmeye DEVAM eder —
//   tier.ts bu sembolleri yeniden export ediyor.
// ════════════════════════════════════════════════════════

import { DAILY_QUOTA, getAvailable, getPackRights, getQuotaLeft, getCurrentTier, grantPack, TIER_PRICE_TRY, VIDEO_KIND_SECONDS, HEDIYE, type Tier, type VideoKind } from "./tier";
import { MICRO_UNLOCK_HOURS } from "./microUnlock";

/** Süre modu → video türü eşlemesi */
export const MODE_TO_KIND: Record<"short" | "long" | "full", VideoKind> = {
  short: "kisa",
  long: "uzun",
  full: "tam",
};

/** Her video türü kaç üretim hakkı harcar: Kısa=1, Uzun=5, Tam=15 */
const VIDEO_COST: Record<"short" | "long" | "full", number> = {
  short: 1,
  long: 5,
  full: 15,
};

export function videoMaliyeti(mode: "short" | "long" | "full", _tier?: Tier): number {
  return VIDEO_COST[mode] ?? 1;
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

/**
 * ESKİ AD — sabitler yeni kota değerlerine bağlandı.
 * ★ GETTER SEBEBİ (30.09): tier ↔ tierCompat döngüsel import var (tier bu sembolleri
 *   re-export ediyor; bu dosya tier'dan kota okuyor). Eski yazımda JETON modül yüklenirken
 *   DAILY_QUOTA'ya dokunuyordu — dev'de (native ESM) tierCompat gövdesi tier gövdesinden
 *   önce koşunca TDZ patlıyordu ("Cannot access 'DAILY_QUOTA' before initialization").
 *   Getter okumayı ilk erişime erteler — o zamana her iki modül de init olmuş olur.
 * ★ SAYI DÜRÜSTLÜĞÜ (29.09 denetimi): eski COST_KISA/UZUN/TAM sabitleri (1/1/1)
 *   gerçek maliyetle (videoMaliyeti: 1/5/15) çeliştiği için SİLİNDİ — hiçbir yerde
 *   kullanılmıyorlardı; maliyetin tek kaynağı videoMaliyeti() + VIDEO_COST.
 */
export const JETON = {
  get DAILY_FREE() { return DAILY_QUOTA.free.kisa; },
  get DAILY_PRO() { return DAILY_QUOTA.pro.kisa; },
  get DAILY_ELIT() { return DAILY_QUOTA.elit.kisa; },
  get DAILY_FREE_RAMADAN() { return DAILY_QUOTA.free.kisa; },
  get DAILY_PRO_RAMADAN() { return DAILY_QUOTA.pro.kisa; },
  get DAILY_ELIT_RAMADAN() { return DAILY_QUOTA.elit.kisa; },
  get TAVAN_FREE() { return DAILY_QUOTA.free.kisa; },
  get TAVAN_PRO() { return DAILY_QUOTA.pro.kisa + DAILY_QUOTA.pro.uzun; },
  get TAVAN_ELIT() { return DAILY_QUOTA.elit.kisa + DAILY_QUOTA.elit.uzun + DAILY_QUOTA.elit.tam; },
  get TAVAN_ELIT_RAMAZAN() { return DAILY_QUOTA.elit.kisa + DAILY_QUOTA.elit.uzun + DAILY_QUOTA.elit.tam; },
  get KAYIT_BONUSU_FREE() { return HEDIYE.KAYIT.amount; },
  get CUMA_BONUS() { return HEDIYE.CUMA.amount; },
  get KANDIL_BONUS() { return HEDIYE.KANDIL.amount; },
  get BAYRAM_BONUS() { return HEDIYE.BAYRAM.amount; },
  get KADIR_GECESI() { return HEDIYE.KADIR.amount; },
  DOGUM_GUNU: 2,
  ILK_GIRIS_BUGUN: 2,
  ILK_GIRIS_YARIN: 1,
  get TAM_SURUM_CAP_SANIYE() { return VIDEO_KIND_SECONDS.tam; },
  MIKRO_KILIT_SURESI_SAAT: MICRO_UNLOCK_HOURS,
  MIKRO_KILIT_ACMA_UCRETI: 1,
  PAKET_RAMAZAN_FREE: 5,
  PAKET_RAMAZAN_PRO: 10,
};

/** ESKİ AD — fiyat listesi yeni değerlere bağlandı (getter sebebi için JETON'daki nota bak) */
export const PRICING = {
  get PRO() { return { tl: TIER_PRICE_TRY.pro, usd: 4.2, period: "aylık" as const }; },
  get ELIT() { return { tl: TIER_PRICE_TRY.elit, usd: 6.0, period: "aylık" as const }; },
  DENEME: { tl: 35, usd: 1.0, period: "tek seferlik" },
  get UYE() { return { tl: TIER_PRICE_TRY.pro, usd: 4.2, period: "aylık" as const }; },
};

/** ESKİ AD — eski paket kartları kaldırıldı, yeni paketler pricing.ts içinde */
export const JETON_PAKETLERI = [] as const;
