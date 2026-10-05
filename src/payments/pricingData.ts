// pricingData.ts — Ürün ve fiyat verileri (parçalama)
// pricing.ts dosyasından ayrıldı

import type { Currency, Product } from "./pricing";

export type VideoKind = "kisa" | "uzun" | "tam";

// ════════════════════════════════════════════════════════
// ULUSLARARASI FİYATLANDIRMA (05.10 yeniden yazım)
//
// ★ ESKİ SİSTEMİN BOZUKLUĞU: TRY tutarı ülkeye göre ÇARPıp farklı para
//   birimiymiş gibi gösteriyordu (149₺ × 4 = "$596"!) — hem matematik
//   hatalıydı hem hiçbir ekrana/sunucuya bağlı değildi.
//
// ★ YENİ SİSTEM — TEK KAYNAK: her bölgenin abonelik fiyatları MAJör
//   birimle (TL/dolar/euro) REGIONAL_PLANS'ta yazılır; gösterim
//   (PremiumModal) ve sunucu ücretlendirmesi (api/payments/create.ts)
//   AYNI tabloyu okur. Yurt dışı fiyatları TR satın alma gücünün ~1,6
//   katı — "biraz daha pahalı" (kullanıcı kararı 05.10).
//
//   ANAHTAR: NUR_MULTI_CURRENCY=true olana kadar sunucu HERKESİ TRY
//   ücretlendirir ve arayüz de TRY gösterir (tutarlılık); anahtar açılınca
//   bölgesel gösterim + bölgesel ücretlendirme birlikte devreye girer.
// ════════════════════════════════════════════════════════
export type RegionCode = "TR" | "USD" | "EUR" | "GBP";

interface RegionPlan {
  region: RegionCode;
  currency: Currency;
  symbol: string;
  /** Aboneliklerin MAJör birim fiyatı (dolar/euro/TL — kuruş DEĞİL) */
  prices: Record<string, number>;
}

export const REGIONAL_PLANS: Record<RegionCode, RegionPlan> = {
  TR: {
    region: "TR", currency: "TRY", symbol: "₺",
    prices: { SUB_PRO_1M: 250, SUB_ELIT_1M: 499, SUB_PRO_1Y: 2700, SUB_ELIT_1Y: 5090 },
  },
  USD: {
    region: "USD", currency: "USD", symbol: "$",
    // ★ KÜSÜRATSIZ (05.10): aylık 10/20 · yıllık = aylık×12×indirim (PRO %10 → 108, ELİT %15 → 204)
    prices: { SUB_PRO_1M: 10, SUB_ELIT_1M: 20, SUB_PRO_1Y: 108, SUB_ELIT_1Y: 204 },
  },
  EUR: {
    region: "EUR", currency: "EUR", symbol: "€",
    prices: { SUB_PRO_1M: 9, SUB_ELIT_1M: 18, SUB_PRO_1Y: 97, SUB_ELIT_1Y: 184 },
  },
  GBP: {
    region: "GBP", currency: "GBP", symbol: "£",
    prices: { SUB_PRO_1M: 8, SUB_ELIT_1M: 16, SUB_PRO_1Y: 86, SUB_ELIT_1Y: 163 },
  },
};

/** Ülke kodu → bölge. TR hariç Avrupa euro kuşağı; GB sterlin; gerisi dolar. */
const EUR_ULKELER = new Set(["DE", "FR", "NL", "BE", "AT", "IT", "ES", "PT", "SE", "DK", "FI", "IE", "GR", "PL", "CZ", "SK", "HU", "RO", "BG", "HR", "SI", "EE", "LV", "LT", "LU", "MT", "CY"]);
export function regionFromCountry(countryCode: string | null | undefined): RegionCode {
  const c = String(countryCode || "").toUpperCase();
  if (c === "TR") return "TR";
  if (c === "GB" || c === "UK") return "GBP";
  if (EUR_ULKELER.has(c)) return "EUR";
  return "USD"; // tanımsız ülke → dolar bölgesi (TR dışı = "yurt dışı")
}

/**
 * Ürünün bölgedeki MAJör birim fiyatı. Abonelikler tablodan; paketler
 * TRY fiyatından formülle türetilir (yurt dışı ~%50 prim, ~45₺ kur kabulü:
 * 35₺ paket ≈ $2). Tabloda/formülde yoksa null → çağıran TRY'ye döner.
 */
export function regionalPriceMajor(code: string, region: RegionCode, tryMajorFallback: number): number | null {
  const plan = REGIONAL_PLANS[region];
  if (!plan) return null;
  const dogrudan = plan.prices[code];
  if (typeof dogrudan === "number") return dogrudan;
  if (region === "TR" || !(tryMajorFallback > 0)) return null;
  const usd = Math.ceil((tryMajorFallback / 45) * 1.5);
  if (plan.region === "USD") return usd;
  if (plan.region === "EUR") return Math.ceil(usd * 0.92);
  return Math.ceil(usd * 0.85); // GBP
}

let _cachedCountry: string | null = null;
let _countryFetchTime = 0;

// ════════════════════════════════════════════════════════
// ÜRÜN KATALOĞU
// ════════════════════════════════════════════════════════
export const PRODUCTS: Readonly<Record<string, Product>> = Object.freeze({
  // ─── Abonelikler (aylık) ───
  SUB_PRO_1M: {
    code: "SUB_PRO_1M",
    kind: "subscription",
    title: "NÛR PRO — Aylık Üyelik",
    description: "Aylık üyelik. Her gün 8 kısa ve 3 uzun video üretim hizmeti.",
    amountMinor: 25000,
    currency: "TRY",
    grantTier: "pro",
    grantDays: 30,
    active: true,
  },
  SUB_ELIT_1M: {
    code: "SUB_ELIT_1M",
    kind: "subscription",
    title: "NÛR ELİT — Aylık Üyelik",
    description: "Aylık üyelik. Her gün 15 kısa, 5 uzun ve 1 tam sürüm video üretim hizmeti.",
    amountMinor: 49900,
    currency: "TRY",
    grantTier: "elit",
    grantDays: 30,
    active: true,
  },

  // ─── Abonelikler (yıllık — indirimli) ───
  // ★ HESAP (05.10, 2. güncelleme — kullanıcı emri: yıllıkta PRO %10, ELİT %15, KÜSÜRATSIZ):
  //          PRO  yıllık = 250×12=3000 → %10 → 2.700₺ (tam)
  //          ELİT yıllık = 499×12=5988 → %15 → 5.089,8 → 5.090₺ (tam; %14,997≈%15)
  SUB_PRO_1Y: {
    code: "SUB_PRO_1Y",
    kind: "subscription",
    title: "NÛR PRO — Yıllık Üyelik (%10 indirim)",
    description: "12 aylık peşin üyelik. Aylık 250₺ yerine ortalama 225₺. Her gün 8 kısa ve 3 uzun video üretim hizmeti.",
    amountMinor: 270000,
    currency: "TRY",
    grantTier: "pro",
    grantDays: 365,
    active: true,
  },
  SUB_ELIT_1Y: {
    code: "SUB_ELIT_1Y",
    kind: "subscription",
    title: "NÛR ELİT — Yıllık Üyelik (%15 indirim)",
    description: "12 aylık peşin üyelik. Aylık 499₺ yerine ortalama 424₺. Her gün 15 kısa, 5 uzun ve 1 tam sürüm video üretim hizmeti.",
    amountMinor: 509000,
    currency: "TRY",
    grantTier: "elit",
    grantDays: 365,
    active: true,
  },



  // ─── Kısa video paketleri (59 sn) ───
  PK_KISA_15: {
    code: "PK_KISA_15",
    kind: "package",
    title: "15 Kısa Video Üretim Hizmeti",
    description: "59 saniyelik 15 adet video üretim hizmeti.",
    amountMinor: 3500,
    currency: "TRY",
    videoKind: "kisa",
    videoCount: 15,
    active: true,
  },
  PK_KISA_35: {
    code: "PK_KISA_35",
    kind: "package",
    title: "35 Kısa Video Üretim Hizmeti",
    description: "59 saniyelik 35 adet video üretim hizmeti.",
    amountMinor: 6900,
    currency: "TRY",
    videoKind: "kisa",
    videoCount: 35,
    active: true,
  },
  PK_KISA_70: {
    code: "PK_KISA_70",
    kind: "package",
    title: "70 Kısa Video Üretim Hizmeti",
    description: "59 saniyelik 70 adet video üretim hizmeti.",
    amountMinor: 11900,
    currency: "TRY",
    videoKind: "kisa",
    videoCount: 70,
    active: true,
  },

  // ─── Uzun video paketleri (600 sn) ───
  PK_UZUN_8: {
    code: "PK_UZUN_8",
    kind: "package",
    title: "8 Uzun Video Üretim Hizmeti",
    description: "600 saniyelik 8 adet video üretim hizmeti.",
    amountMinor: 4500,
    currency: "TRY",
    videoKind: "uzun",
    videoCount: 8,
    active: true,
  },
  PK_UZUN_20: {
    code: "PK_UZUN_20",
    kind: "package",
    title: "20 Uzun Video Üretim Hizmeti",
    description: "600 saniyelik 20 adet video üretim hizmeti.",
    amountMinor: 8900,
    currency: "TRY",
    videoKind: "uzun",
    videoCount: 20,
    active: true,
  },
  PK_UZUN_40: {
    code: "PK_UZUN_40",
    kind: "package",
    title: "40 Uzun Video Üretim Hizmeti",
    description: "600 saniyelik 40 adet video üretim hizmeti.",
    amountMinor: 14900,
    currency: "TRY",
    videoKind: "uzun",
    videoCount: 40,
    active: true,
  },

  // ─── Tam sürüm paketleri (90 dk) ───
  PK_TAM_2: {
    code: "PK_TAM_2",
    kind: "package",
    title: "2 Tam Sürüm Video Üretim Hizmeti",
    description: "90 dakikaya kadar 2 adet video üretim hizmeti.",
    amountMinor: 3900,
    currency: "TRY",
    videoKind: "tam",
    videoCount: 2,
    active: true,
  },
  PK_TAM_5: {
    code: "PK_TAM_5",
    kind: "package",
    title: "5 Tam Sürüm Video Üretim Hizmeti",
    description: "90 dakikaya kadar 5 adet video üretim hizmeti.",
    amountMinor: 8900,
    currency: "TRY",
    videoKind: "tam",
    videoCount: 5,
    active: true,
  },
  PK_TAM_10: {
    code: "PK_TAM_10",
    kind: "package",
    title: "10 Tam Sürüm Video Üretim Hizmeti",
    description: "90 dakikaya kadar 10 adet video üretim hizmeti.",
    amountMinor: 15900,
    currency: "TRY",
    videoKind: "tam",
    videoCount: 10,
    active: true,
  },
});

// ════════════════════════════════════════════════════════
// ÜRÜN KODLARI
// ════════════════════════════════════════════════════════
export const SUBSCRIPTION_CODES = ["SUB_PRO_1M", "SUB_ELIT_1M"] as const;
export const ANNUAL_SUBSCRIPTION_CODES = ["SUB_PRO_1Y", "SUB_ELIT_1Y"] as const;
// ★ NOT: "Ömür boyu / lifetime" paket bilinçli olarak KALDIRILDI.
//   10 yıllık erişimi ~2500 TL gibi tek seferlik bir bedelle vermek,
//   uzun vadede sunucu/depolama/bant genişliği maliyetini karşılamaz
//   ve şirket için zarara yol açar. Sadece Aylık ve Yıllık (indirimli)
//   seçenekler sürdürülebilir kabul edildi.
export type BillingPeriod = "monthly" | "annual";
export const SUBSCRIPTION_CODES_BY_PERIOD: Record<BillingPeriod, readonly string[]> = {
  monthly: SUBSCRIPTION_CODES,
  annual: ANNUAL_SUBSCRIPTION_CODES,
};

export const PACKAGE_CODES: Record<VideoKind, readonly string[]> = {
  kisa: ["PK_KISA_15", "PK_KISA_35", "PK_KISA_70"],
  uzun: ["PK_UZUN_8", "PK_UZUN_20", "PK_UZUN_40"],
  tam: ["PK_TAM_2", "PK_TAM_5", "PK_TAM_10"],
};

export const PACKAGE_GROUP_META: Record<VideoKind, { label: string; sub: string; emoji: string; accent: string }> = {
  kisa: { label: "Kısa Video", sub: "59 saniye · Reels & Shorts", emoji: "🎬", accent: "#34d399" },
  uzun: { label: "Uzun Video", sub: "600 saniye · Derin anlatım", emoji: "🎞️", accent: "#60a5fa" },
  tam: { label: "Tam Sürüm", sub: "90 dakikaya kadar · Tam sure", emoji: "🎥", accent: "#f5dda6" },
};

// ════════════════════════════════════════════════════════
// İSTEMCİ → SUNUCU SÖZLEŞMESİ
// ════════════════════════════════════════════════════════
