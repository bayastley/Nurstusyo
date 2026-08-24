// ════════════════════════════════════════════════════════════════
// RATELIMITER.TS — Client-side buton spam & bot koruması.
//
// ★ NEDEN:
// Kullanıcı veya bot "Video Üret" butonuna spam basarsa jetonlar hızla
// tükenir, R2/Pexels bant genişliği sömürülür, backend'e yük biner.
// Bu modül tarayıcıda sliding-window token bucket algoritması çalıştırır.
//
// ★ SINIRLAR (varsayılan):
//   video   → 60 sn'de 3 kez     (Video Üret)
//   refresh → 1 sn'de 1 kez      (Başlığı/Açıklamayı Yenile)
//   auth    → 60 sn'de 5 kez     (Kayıt Ol / Giriş Yap)
//   ai      → 10 sn'de 2 kez     (Akıllı AI arama toggle)
//   general → 500 ms'de 1 kez    (genel debounce)
//
// ★ UYARI:
// Client-side koruma DevTools'tan bypass edilebilir. Gerçek güvenlik
// backend'de (Cloudflare Rate Limiting Rules) uygulanmalı. Bu modül
// caydırıcı ve UX koruyucu görev görür.
// ════════════════════════════════════════════════════════════════

export type RateLimitKey = "video" | "refresh" | "auth" | "ai" | "general";

interface RateLimit {
  /** Pencere süresi (ms) */
  windowMs: number;
  /** Bu pencerede izin verilen max istek */
  maxRequests: number;
  /** Aşımda kullanıcıya gösterilecek mesaj */
  message: string;
}

export const RATE_LIMITS: Record<RateLimitKey, RateLimit> = {
  video:   { windowMs: 60_000, maxRequests: 3, message: "⏱️ Çok hızlı üretim yapıyorsunuz. Lütfen 30 saniye bekleyin." },
  refresh: { windowMs: 1_000,  maxRequests: 1, message: "⏱️ Butonu bu kadar hızlı basmayın." },
  auth:    { windowMs: 60_000, maxRequests: 5, message: "⏱️ Çok fazla deneme. 1 dakika sonra tekrar deneyin." },
  ai:      { windowMs: 10_000, maxRequests: 2, message: "⏱️ AI aramayı çok sık açıp kapatıyorsunuz. 10 sn bekleyin." },
  general: { windowMs: 500,    maxRequests: 1, message: "⏱️ Yavaşlayın!" },
};

// Her key için timestamp geçmişi (sliding window)
const buckets: Record<RateLimitKey, number[]> = {
  video: [],
  refresh: [],
  auth: [],
  ai: [],
  general: [],
};

/**
 * Bir eylem için rate limit kontrolü yapar.
 *
 * @returns { allowed: true } → devam et
 *          { allowed: false, retryAfterMs, message } → engelle, kullanıcıya uyarı ver
 */
export function checkRateLimit(key: RateLimitKey): {
  allowed: boolean;
  retryAfterMs: number;
  message: string;
  remaining: number;
} {
  const limit = RATE_LIMITS[key];
  const now = Date.now();
  const bucket = buckets[key];

  // Pencere dışındaki eski timestamp'leri temizle
  const cutoff = now - limit.windowMs;
  while (bucket.length && bucket[0] < cutoff) bucket.shift();

  if (bucket.length >= limit.maxRequests) {
    // Sınır aşıldı — kaç ms sonra tekrar denenebilir?
    const oldest = bucket[0];
    const retryAfterMs = Math.max(0, limit.windowMs - (now - oldest));
    return {
      allowed: false,
      retryAfterMs,
      message: limit.message,
      remaining: 0,
    };
  }

  // İzin ver, timestamp'i kaydet
  bucket.push(now);
  return {
    allowed: true,
    retryAfterMs: 0,
    message: "",
    remaining: limit.maxRequests - bucket.length,
  };
}

/**
 * Yardımcı: bir fonksiyonu rate-limit ile sarmalar.
 * Eğer izin verilirse fn çalışır, yoksa onDenied(message, retryAfterMs) çağrılır.
 */
export function withRateLimit<T extends (...args: unknown[]) => unknown>(
  key: RateLimitKey,
  fn: T,
  onDenied?: (message: string, retryAfterMs: number) => void
): T {
  return ((...args: Parameters<T>) => {
    const check = checkRateLimit(key);
    if (!check.allowed) {
      onDenied?.(check.message, check.retryAfterMs);
      return undefined;
    }
    return fn(...args);
  }) as T;
}

/** Debug: bir key'in kalan hakkı */
export function getRateLimitStatus(key: RateLimitKey): { used: number; max: number; windowMs: number } {
  const limit = RATE_LIMITS[key];
  const now = Date.now();
  const bucket = buckets[key];
  const cutoff = now - limit.windowMs;
  const active = bucket.filter((t) => t >= cutoff).length;
  return { used: active, max: limit.maxRequests, windowMs: limit.windowMs };
}

/** Testler için — belirli bir key'in bucket'ını sıfırla */
export function resetRateLimit(key: RateLimitKey): void {
  buckets[key] = [];
}

/** Testler için — hepsini sıfırla */
export function resetAllRateLimits(): void {
  (Object.keys(buckets) as RateLimitKey[]).forEach((k) => (buckets[k] = []));
}
