// ════════════════════════════════════════════════════════
// PRICING.TS — Browser-safe fiyat kaynağı ve checkout başlatıcı.
//
// Bu dosya HEM istemcide HEM sunucuda import edilebilir (crypto/node kullanmaz).
// Webhook doğrulama fonksiyonları için ./webhook.server.ts dosyasına bak.
//
// ★ GÜVENLİK KURALI:
// Fiyat bilgisi ASLA kullanıcının tarayıcısından okunup ödeme şirketine
// gönderilmez. İstemci yalnızca bir ÜRÜN KODU (productCode) gönderir.
// Tutar, bu dosyadaki sabit listeden sunucu tarafında okunur ve imzalanır.
// ════════════════════════════════════════════════════════

export type Currency = "TRY" | "USD";
export type ProductKind = "subscription" | "tokens";

export interface Product {
  /** İstemcinin göndereceği TEK bilgi — tutar değil, sadece bu kod */
  code: string;
  kind: ProductKind;
  title: string;
  /** Kuruş cinsinden (PayTR/iyzico kuruş bekler) — 32900 = 329,00 TL */
  amountMinor: number;
  currency: Currency;
  /** Abonelik ise süre (gün), jeton paketi ise verilecek jeton */
  grantTier?: "pro" | "elit";
  grantDays?: number;
  grantTokens?: number;
  /** Satışa kapatmak için */
  active: boolean;
}

/**
 * ★ RESMİ FİYAT LİSTESİ — sadece burada değişir.
 * UI bu listeden okur (gösterim için), ödeme isteği ise
 * sunucuda yine bu listeden doğrulanır.
 */
export const PRODUCTS: Readonly<Record<string, Product>> = Object.freeze({
  // ─── Abonelikler (aylık) ───
  SUB_PRO_1M: {
    code: "SUB_PRO_1M",
    kind: "subscription",
    title: "NÛR PRO — Aylık",
    amountMinor: 26300,          // 263,00 TL (lansman %20 indirimli)
    currency: "TRY",
    grantTier: "pro",
    grantDays: 30,
    active: true,
  },
  SUB_ELIT_1M: {
    code: "SUB_ELIT_1M",
    kind: "subscription",
    title: "NÛR ELİT — Aylık",
    amountMinor: 40000,          // 400,00 TL (lansman %20 indirimli)
    currency: "TRY",
    grantTier: "elit",
    grantDays: 30,
    active: true,
  },
  // ─── Jeton paketleri (tek seferlik) ───
  TOK_50:   { code: "TOK_50",   kind: "tokens", title: "50 Jeton — Başlangıç",  amountMinor: 2900,   currency: "TRY", grantTokens: 50,   active: true },
  TOK_100:  { code: "TOK_100",  kind: "tokens", title: "100 Jeton — Standart",  amountMinor: 5400,   currency: "TRY", grantTokens: 100,  active: true },
  TOK_300:  { code: "TOK_300",  kind: "tokens", title: "300 Jeton — Orta",      amountMinor: 15800,  currency: "TRY", grantTokens: 300,  active: true },
  TOK_800:  { code: "TOK_800",  kind: "tokens", title: "800 Jeton — Büyük",     amountMinor: 41600,  currency: "TRY", grantTokens: 800,  active: true },
  TOK_2000: { code: "TOK_2000", kind: "tokens", title: "2000 Jeton — Dev",      amountMinor: 94400,  currency: "TRY", grantTokens: 2000, active: true },
});

/** Ürünü koda göre getir — bilinmeyen/pasif kod null döner (istek reddedilir) */
export function getProduct(code: string): Product | null {
  const p = PRODUCTS[code];
  if (!p || !p.active) return null;
  return p;
}

/** Görüntüleme için biçimlendirilmiş fiyat (₺329,00) */
export function formatPrice(p: Product): string {
  const major = p.amountMinor / 100;
  return p.currency === "TRY"
    ? `₺${major.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`
    : `$${major.toFixed(2)}`;
}

/** UI'da listelemek için — tutarlar yine buradan gelir, kullanıcı değiştiremez */
export const SUBSCRIPTION_CODES = ["SUB_PRO_1M", "SUB_ELIT_1M"] as const;
export const TOKEN_CODES = ["TOK_50", "TOK_100", "TOK_300", "TOK_800", "TOK_2000"] as const;

// ════════════════════════════════════════════════════════
// İSTEMCİ → SUNUCU SÖZLEŞMESİ
// ════════════════════════════════════════════════════════

/** İstemcinin gönderebileceği TEK yapı — içinde TUTAR YOKTUR */
export interface CheckoutRequest {
  productCode: string;   // ör. "SUB_PRO_1M"
  userId?: string;       // Eski istemci sözleşmesiyle uyum için opsiyonel
  email?: string;
  /** Ödeme sonrası dönülecek sayfa */
  returnUrl?: string;
}

export interface CheckoutResponse {
  ok: boolean;
  /** PayTR iframe token / iyzico checkout formu */
  token?: string;
  paymentUrl?: string;
  error?: string;
}

/**
 * ★ İstemciden gelen isteği doğrula.
 * Tutar istemciden gelmediği için manipülasyon yüzeyi yoktur;
 * burada yalnızca ürün kodunun geçerliliği kontrol edilir.
 */
export function validateCheckout(req: CheckoutRequest): { ok: true; product: Product } | { ok: false; error: string } {
  if (!req || typeof req.productCode !== "string") return { ok: false, error: "Geçersiz istek" };
  const product = getProduct(req.productCode);
  if (!product) return { ok: false, error: "Bilinmeyen veya satışa kapalı ürün" };
  if (req.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(req.email)) return { ok: false, error: "Geçersiz e-posta" };
  return { ok: true, product };
}

/**
 * ★ İstemcinin ödeme başlatmak için çağıracağı fonksiyon.
 * Dikkat: tutar GÖNDERİLMEZ. Sunucu tutarı PRODUCTS'tan okur.
 */
export async function startCheckout(req: CheckoutRequest): Promise<CheckoutResponse> {
  const check = validateCheckout(req);
  if (!check.ok) return { ok: false, error: check.error };

  try {
    const res = await fetch("/api/payments/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // ★ Sadece ürün KODU gider — fiyat asla istemciden taşınmaz
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
