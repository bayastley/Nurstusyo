// ════════════════════════════════════════════════════════
// PRICING.TS — Ürün / hizmet kataloğu
//
// ★ İYZİCO UYUMU:
//   Bakiye yükleme YOKTUR. Kullanıcı bakiye satın almaz.
//   Satılan şey: belirli sayıda video üretim HİZMETİdir.
//   "jeton / kredi / kontör / token / coin / bakiye / cüzdan"
//   kelimeleri bu dosyada ve arayüzde KULLANILMAZ.
// ════════════════════════════════════════════════════════

export type Currency = "TRY";
export type ProductKind = "subscription" | "package";
export type VideoKind = "kisa" | "uzun" | "tam";

export interface Product {
  /** İstemcinin göndereceği TEK bilgi — tutar değil, sadece bu kod */
  code: string;
  kind: ProductKind;
  title: string;
  /** Ürün açıklaması — fatura ve ödeme sayfasında görünür */
  description: string;
  /** Kuruş cinsinden — 14900 = 149,00 TL */
  amountMinor: number;
  currency: Currency;
  /** Abonelik ise */
  grantTier?: "pro" | "elit";
  grantDays?: number;
  /** Paket ise: hangi türden kaç adet video üretim hizmeti */
  videoKind?: VideoKind;
  videoCount?: number;
  active: boolean;
}

/**
 * ★ RESMİ FİYAT LİSTESİ — sadece burada değişir.
 * Sunucu tutarı daima buradan okur; istemci tutar gönderemez.
 */
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
    amountMinor: 30000,
    currency: "TRY",
    grantTier: "elit",
    grantDays: 30,
    active: true,
  },

  // ─── Abonelikler (yıllık — indirimli) ───
  // ★ HESAP: PRO yıllık = 149×12=1788 TL taban, %10 indirim → 1609,20 TL
  //          ELİT yıllık = 300×12=3600 TL taban, %20 indirim → 2880,00 TL
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
    description: "12 aylık peşin üyelik. Aylık 300₺ yerine ortalama 240₺. Her gün 15 kısa, 5 uzun ve 1 tam sürüm video üretim hizmeti.",
    amountMinor: 288000,
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

export function getProduct(code: string): Product | null {
  const p = PRODUCTS[code];
  if (!p || !p.active) return null;
  return p;
}

/** Görüntüleme için biçimlendirilmiş fiyat (₺149) */
export function formatPrice(p: Product): string {
  const major = p.amountMinor / 100;
  return `₺${major.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}`;
}

/** Video başına düşen birim ücret — paket karşılaştırması için */
export function unitPrice(p: Product): string {
  if (!p.videoCount) return "";
  const per = p.amountMinor / 100 / p.videoCount;
  return `video başına ₺${per.toFixed(2)}`;
}

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

export interface CheckoutRequest {
  productCode: string;
  userId?: string;
  email?: string;
  returnUrl?: string;
}

export interface CheckoutResponse {
  ok: boolean;
  token?: string;
  paymentUrl?: string;
  error?: string;
}

export function validateCheckout(req: CheckoutRequest): { ok: true; product: Product } | { ok: false; error: string } {
  if (!req || typeof req.productCode !== "string") return { ok: false, error: "Geçersiz istek" };
  const product = getProduct(req.productCode);
  if (!product) return { ok: false, error: "Bilinmeyen veya satışa kapalı ürün" };
  if (req.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(req.email)) return { ok: false, error: "Geçersiz e-posta" };
  return { ok: true, product };
}

export async function startCheckout(req: CheckoutRequest): Promise<CheckoutResponse> {
  const check = validateCheckout(req);
  if (!check.ok) return { ok: false, error: (check as any).error };

  try {
    const res = await fetch("/api/payments/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productCode: req.productCode,
        returnUrl: req.returnUrl ?? window.location.origin + "/odeme-sonuc",
      }),
    });
    if (!res.ok) return { ok: false, error: `Ödeme servisi hatası (${res.status})` };
    return (await res.json()) as CheckoutResponse;
  } catch {
    return { ok: false, error: "Ödeme servisine ulaşılamadı" };
  }
}
