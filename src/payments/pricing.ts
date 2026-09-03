// ════════════════════════════════════════════════════════
// PRICING.TS — Ürün / hizmet kataloğu FONKSİYONLARI
// Veriler pricingData.ts'ten import ediliyor (parçalama)
// ════════════════════════════════════════════════════════

import {
  REGION_MULTIPLIERS,
  PRODUCTS,
  SUBSCRIPTION_CODES,
  ANNUAL_SUBSCRIPTION_CODES,
  SUBSCRIPTION_CODES_BY_PERIOD,
  PACKAGE_CODES,
  PACKAGE_GROUP_META,
} from "./pricingData";

// Re-export data for backward compatibility
export {
  REGION_MULTIPLIERS,
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
  return REGION_MULTIPLIERS[countryCode] ?? REGION_MULTIPLIERS["DEFAULT"];
}

export function getProduct(code: string): Product | null {
  const p = PRODUCTS[code];
  return p && p.active !== false ? p : null;
}

export function formatPrice(p: Product): string {
  const sym = REGION_MULTIPLIERS["TR"]?.symbol ?? "₺";
  return `${sym}${(p.amountMinor / 100).toLocaleString("tr-TR")}`;
}

export function getDisplayPrice(p: Product, countryCode: string): { price: number; currency: Currency; symbol: string; formatted: string } {
  const region = getRegionPricing(countryCode);
  const converted = Math.round(p.amountMinor * region.mult);
  return {
    price: converted,
    currency: region.currency,
    symbol: region.symbol,
    formatted: `${region.symbol}${(converted / 100).toLocaleString("tr-TR")}`,
  };
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
