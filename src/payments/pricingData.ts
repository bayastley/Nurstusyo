// pricingData.ts — Ürün ve fiyat verileri (parçalama)
// pricing.ts dosyasından ayrıldı

import type { Currency, Product } from "./pricing";

export type VideoKind = "kisa" | "uzun" | "tam";

// ════════════════════════════════════════════════════════
// ULUSLARARASI FİYATLANDIRMA
// ════════════════════════════════════════════════════════
export const REGION_MULTIPLIERS: Record<string, { mult: number; currency: Currency; symbol: string }> = {
  TR: { mult: 1, currency: "TRY", symbol: "₺" },
  // Avrupa + Kuzey Amerika + Avustralya — yüksek gelir
  US: { mult: 4, currency: "USD", symbol: "$" },
  GB: { mult: 4, currency: "GBP", symbol: "£" },
  DE: { mult: 3.5, currency: "EUR", symbol: "€" },
  FR: { mult: 3.5, currency: "EUR", symbol: "€" },
  NL: { mult: 3.5, currency: "EUR", symbol: "€" },
  BE: { mult: 3.5, currency: "EUR", symbol: "€" },
  AT: { mult: 3.5, currency: "EUR", symbol: "€" },
  IT: { mult: 3, currency: "EUR", symbol: "€" },
  ES: { mult: 3, currency: "EUR", symbol: "€" },
  PT: { mult: 3, currency: "EUR", symbol: "€" },
  SE: { mult: 3.5, currency: "EUR", symbol: "€" },
  NO: { mult: 4, currency: "EUR", symbol: "€" },
  DK: { mult: 3.5, currency: "EUR", symbol: "€" },
  FI: { mult: 3.5, currency: "EUR", symbol: "€" },
  CH: { mult: 4, currency: "EUR", symbol: "€" },
  AU: { mult: 3.5, currency: "USD", symbol: "$" },
  CA: { mult: 3.5, currency: "USD", symbol: "$" },
  JP: { mult: 3, currency: "USD", symbol: "$" },
  KR: { mult: 3, currency: "USD", symbol: "$" },
  // Orta Doğu + Kuzey Afrika — orta gelir
  SA: { mult: 2.5, currency: "USD", symbol: "$" },
  AE: { mult: 2.5, currency: "USD", symbol: "$" },
  QA: { mult: 2.5, currency: "USD", symbol: "$" },
  KW: { mult: 2.5, currency: "USD", symbol: "$" },
  BH: { mult: 2.5, currency: "USD", symbol: "$" },
  OM: { mult: 2, currency: "USD", symbol: "$" },
  EG: { mult: 1.5, currency: "USD", symbol: "$" },
  MA: { mult: 1.5, currency: "USD", symbol: "$" },
  TN: { mult: 1.5, currency: "USD", symbol: "$" },
  DZ: { mult: 1.5, currency: "USD", symbol: "$" },
  JO: { mult: 2, currency: "USD", symbol: "$" },
  LB: { mult: 2, currency: "USD", symbol: "$" },
  IQ: { mult: 1.5, currency: "USD", symbol: "$" },
  // Güney Asya — düşük-orta gelir
  PK: { mult: 1.2, currency: "USD", symbol: "$" },
  BD: { mult: 1.2, currency: "USD", symbol: "$" },
  IN: { mult: 1.5, currency: "USD", symbol: "$" },
  ID: { mult: 1.3, currency: "USD", symbol: "$" },
  MY: { mult: 1.5, currency: "USD", symbol: "$" },
  // Afrika — düşük gelir
  NG: { mult: 1.2, currency: "USD", symbol: "$" },
  GH: { mult: 1.2, currency: "USD", symbol: "$" },
  KE: { mult: 1.2, currency: "USD", symbol: "$" },
  ZA: { mult: 1.5, currency: "USD", symbol: "$" },
};

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
    amountMinor: 14900,
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
    amountMinor: 25000,
    currency: "TRY",
    grantTier: "elit",
    grantDays: 30,
    active: true,
  },

  // ─── Abonelikler (yıllık — indirimli) ───
  // ★ HESAP: PRO yıllık = 149×12=1788 TL taban, %10 indirim → 1609,20 TL
  //          ELİT yıllık = 250×12=3000 TL taban, %20 indirim → 2400,00 TL
  SUB_PRO_1Y: {
    code: "SUB_PRO_1Y",
    kind: "subscription",
    title: "NÛR PRO — Yıllık Üyelik (%10 indirim)",
    description: "12 aylık peşin üyelik. Aylık 149₺ yerine ortalama 134₺. Her gün 8 kısa ve 3 uzun video üretim hizmeti.",
    amountMinor: 160920,
    currency: "TRY",
    grantTier: "pro",
    grantDays: 365,
    active: true,
  },
  SUB_ELIT_1Y: {
    code: "SUB_ELIT_1Y",
    kind: "subscription",
    title: "NÛR ELİT — Yıllık Üyelik (%20 indirim)",
    description: "12 aylık peşin üyelik. Aylık 250₺ yerine ortalama 200₺. Her gün 15 kısa, 5 uzun ve 1 tam sürüm video üretim hizmeti.",
    amountMinor: 240000,
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

  // ─── Tam sürüm paketleri (45 dk) ───
  PK_TAM_2: {
    code: "PK_TAM_2",
    kind: "package",
    title: "2 Tam Sürüm Video Üretim Hizmeti",
    description: "45 dakikaya kadar 2 adet video üretim hizmeti.",
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
    description: "45 dakikaya kadar 5 adet video üretim hizmeti.",
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
    description: "45 dakikaya kadar 10 adet video üretim hizmeti.",
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
  tam: { label: "Tam Sürüm", sub: "45 dakikaya kadar · Tam sure", emoji: "🎥", accent: "#f5dda6" },
};

// ════════════════════════════════════════════════════════
// İSTEMCİ → SUNUCU SÖZLEŞMESİ
// ════════════════════════════════════════════════════════
