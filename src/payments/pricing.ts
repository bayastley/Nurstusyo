// ════════════════════════════════════════════════════════
// PRICING.TS — Ürün / hizmet kataloğu FONKSİYONLARI
// Veriler pricingData.ts'ten import ediliyor (parçalama)
// ════════════════════════════════════════════════════════

import {
  PRODUCTS,
  SUBSCRIPTION_CODES,
  ANNUAL_SUBSCRIPTION_CODES,
  SUBSCRIPTION_CODES_BY_PERIOD,
  PACKAGE_CODES,
  PACKAGE_GROUP_META,
  REGIONAL_PLANS,
  regionFromCountry,
  regionalPriceMajor,
  type RegionCode,
} from "./pricingData";

// Re-export data for backward compatibility
export {
  REGIONAL_PLANS,
  regionFromCountry,
  regionalPriceMajor,
  type RegionCode,
  PRODUCTS,
  SUBSCRIPTION_CODES,
  ANNUAL_SUBSCRIPTION_CODES,
  SUBSCRIPTION_CODES_BY_PERIOD,
  PACKAGE_CODES,
  PACKAGE_GROUP_META,
} from "./pricingData";

// ════════════════════════════════════════════════════════
// TİPLER
// ════════════════════════════════════════════════════════

export type Currency = "TRY" | "USD" | "EUR" | "GBP";
export type ProductKind = "subscription" | "package";
export type VideoKind = "kisa" | "uzun" | "tam";
export type BillingPeriod = "monthly" | "annual";

export interface Product {
  code: string;
  kind: ProductKind;
  title: string;
  description: string;
  amountMinor: number;
  currency: Currency;
  videoCount?: number;
  grantDays?: number;
  grantTier?: string;
  grantKisa?: number;
  grantUzun?: number;
  grantTam?: number;
  active?: boolean;
}

export interface CheckoutRequest {
  productCode: string;
  userId?: string;
  email?: string;
  returnUrl?: string;
  buyer?: {
    name?: string;
    surname?: string;
    email?: string;
    gsmNumber?: string;
    city?: string;
    address?: string;
    identityNumber?: string;
  };
}

export interface CheckoutResponse {
  ok: boolean;
  token?: string;
  paymentUrl?: string;
  paymentPageUrl?: string;
  checkoutFormContent?: string;
  orderId?: string;
  demo?: boolean;
  message?: string;
  error?: string;
}

// ════════════════════════════════════════════════════════
// FONKSİYONLAR
// ════════════════════════════════════════════════════════

const COUNTRY_CACHE_MS = 60 * 60 * 1000;

export async function detectCountry(): Promise<string> {
  // ★ 05.10: önce Vercel'in geo header'ı (sunucu render'da ücretsiz, ipapi kotasız),
  //   yoksa ipapi.co — o da olmazsa TR (varsayılan bölge).
  try {
    const res = await fetch("/api/config", { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json().catch(() => null) as { country?: string } | null;
      if (data?.country && /^[A-Za-z]{2}$/.test(data.country)) return data.country.toUpperCase();
    }
  } catch { /* ipapi'ye düş */ }
  try {
    const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return "TR";
    const data = await res.json();
    return data.country_code || "TR";
  } catch {
    return "TR";
  }
}

export function getRegionPricing(countryCode: string) {
  // ★ 05.10: REGION_MULTIPLIERS (çarpımlı bozuk tablo) kaldırıldı —
  //   yerine bölge planları (REGIONAL_PLANS). Geriye uyum için aynı şekli
  //   (mult/currency/symbol) döndürür ama mult artık kullanılmaz (hep 1).
  const region = regionFromCountry(countryCode);
  const plan = REGIONAL_PLANS[region];
  return { mult: 1, currency: plan.currency, symbol: plan.symbol };
}

export function getProduct(code: string): Product | null {
  const p = PRODUCTS[code];
  return p && p.active !== false ? p : null;
}

export function formatPrice(p: Product): string {
  const sym = "₺";
  return `${sym}${(p.amountMinor / 100).toLocaleString("tr-TR")}`;
}

/**
 * ★ BÖLGESEL GÖSTERİM (05.10): ürünün ülkeye göre fiyatı.
 *   Abonelikler bölge tablosundan; paketler TRY tabanından formülle.
 *   Ürün bölge tablosunda yoksa TRY fiyatına döner (asla çarpma yok).
 */
export function getDisplayPrice(p: Product, countryCode: string): { price: number; currency: Currency; symbol: string; formatted: string } {
  const region = regionFromCountry(countryCode);
  const major = regionalPriceMajor(p.code, region, p.amountMinor / 100);
  if (major === null) {
    return { price: p.amountMinor, currency: p.currency, symbol: "₺", formatted: `₺${(p.amountMinor / 100).toLocaleString("tr-TR")}` };
  }
  const plan = REGIONAL_PLANS[region];
  const minor = Math.round(major * 100);
  return { price: minor, currency: plan.currency, symbol: plan.symbol, formatted: `${plan.symbol}${major.toLocaleString("tr-TR")}` };
}

/** Bölge planına doğrudan erişim (gösterim katmanı için) */
export function getRegionPlan(countryCode: string | null | undefined): { region: RegionCode; currency: Currency; symbol: string } {
  const region = regionFromCountry(countryCode);
  const plan = REGIONAL_PLANS[region];
  return { region, currency: plan.currency, symbol: plan.symbol };
}

/**
 * ★ BÖLGESEL FİYAT HOOK'I (05.10): ülkeyi bir kez algılar (1 saat cache),
 *   ürünler için bölgesel gösterim değerlerini üretir.
 *   Herhangi bir hata/eksikte TR döner — arayüz asla boş fiyat göstermez.
 */
let _bolgeCache: { ulke: string; region: RegionCode; symbol: string; at: number } | null = null;
export async function bolgeGosterimiGetir(): Promise<{ ulke: string; region: RegionCode; symbol: string }> {
  if (_bolgeCache && Date.now() - _bolgeCache.at < 60 * 60 * 1000) {
    return { ulke: _bolgeCache.ulke, region: _bolgeCache.region, symbol: _bolgeCache.symbol };
  }
  const ulke = await detectCountry().catch(() => "TR");
  const bilgi = getRegionPlan(ulke);
  _bolgeCache = { ulke, region: bilgi.region, symbol: bilgi.symbol, at: Date.now() };
  return { ulke, region: bilgi.region, symbol: bilgi.symbol };
}

export function unitPrice(p: Product): string {
  return `~${(p.amountMinor / 100).toFixed(2)} TRY`;
}

export function validateCheckout(req: CheckoutRequest): { ok: true; product: Product } | { ok: false; error: string } {
  if (!req || typeof req.productCode !== "string") return { ok: false, error: "Geçersiz istek" };
  const product = getProduct(req.productCode);
  if (!product) return { ok: false, error: "Bilinmeyen veya satışa kapalı ürün" };
  if (req.email && !/^[^\s]+@[^\s]+\.[^\s]+$/.test(req.email)) return { ok: false, error: "Geçersiz e-posta" };
  return { ok: true, product };
}

export async function startCheckout(req: CheckoutRequest): Promise<CheckoutResponse> {
  const check = validateCheckout(req);
  if (!check.ok) return { ok: false, error: (check as any).error };

  try {
    const res = await fetch("/api/payments/create", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productCode: req.productCode,
        returnUrl: req.returnUrl ?? window.location.origin + "/odeme-sonuc",
        buyer: req.buyer || {},
      }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = json?.error || json?.message || `Ödeme servisi hatası (${res.status})`;
      console.error("[startCheckout] Sunucu hatası:", res.status, msg, json);
      return { ok: false, error: msg };
    }
    return (json || {}) as CheckoutResponse;
  } catch (err: any) {
    console.error("[startCheckout] Bağlantı hatası:", err?.message);
    return { ok: false, error: `Ödeme servisine ulaşılamadı: ${err?.message || ""}` };
  }
}
