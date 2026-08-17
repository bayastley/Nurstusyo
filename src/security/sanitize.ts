// ════════════════════════════════════════════════════════
// SECURITY UTILS - Güvenlik ve sanitizasyon yardımcıları
// ════════════════════════════════════════════════════════
import DOMPurify from "dompurify";

// HTML sanitizasyon (XSS koruması)
export function sanitizeHTML(input: string): string {
  if (!input || typeof input !== "string") return "";
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [
      "b", "i", "em", "strong", "a", "p", "br", "span",
      "ul", "ol", "li", "h1", "h2", "h3", "h4",
      "blockquote", "pre", "code",
    ],
    ALLOWED_ATTR: ["href", "title", "target", "rel", "class"],
    ALLOW_DATA_ATTR: false,
  });
}

// Metin sanitizasyon (HTML etiketlerini tamamen kaldır)
export function sanitizeText(input: string): string {
  if (!input || typeof input !== "string") return "";
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

// Email doğrulama
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(String(email).trim());
}

// URL doğrulama (sadece http/https)
const URL_REGEX = /^https?:\/\/[^\s]+$/;
export function isValidURL(url: string): boolean {
  return URL_REGEX.test(String(url).trim());
}

// Kullanıcı adı/İsim doğrulama (güvenli karakterler)
export function sanitizeName(input: string): string {
  const cleaned = String(input || "").trim();
  if (cleaned.length > 80) return cleaned.slice(0, 80);
  return DOMPurify.sanitize(cleaned, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

// Uzunluk limitli metin kısaltma
export function truncate(input: string, max: number): string {
  if (!input || typeof input !== "string") return "";
  if (input.length <= max) return input;
  return input.slice(0, max).trim();
}

// ID doğrulama (sadece alfanümerik ve tire)
const SAFE_ID_REGEX = /^[a-zA-Z0-9\-_]+$/;
export function isValidId(id: string): boolean {
  return SAFE_ID_REGEX.test(String(id)) && id.length <= 64;
}

// Sayısal doğrulama (güvenli sayı aralığı)
export function clampNumber(value: unknown, min: number, max: number): number {
  const num = Number(value);
  if (isNaN(num) || !isFinite(num)) return min;
  return Math.max(min, Math.min(max, num));
}

// Enum doğrulama (değer beyaz listede mi?)
export function isAllowedValue<T extends string>(
  value: unknown,
  allowed: readonly T[]
): value is T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}

// CSRF token üreteci
export function generateCSRFToken(): string {
  if (typeof crypto === "undefined" || !crypto.getRandomValues) {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// CSRF doğrulama (timing-safe)
export function validateCSRF(token: string, expected: string): boolean {
  if (!token || !expected) return false;
  if (token.length !== expected.length) return false;
  // Timing-safe compare
  let diff = 0;
  for (let i = 0; i < token.length; i++) {
    diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

// Güvenli header set (HTTP header injection koruması)
const HEADER_NAME_REGEX = /^[a-zA-Z0-9\-]+$/;
export function isValidHeaderName(name: string): boolean {
  return HEADER_NAME_REGEX.test(name) && name.length <= 64;
}

// Güvenli parametre (URL parametrelerinde kontrol)
export function sanitizeQueryParam(value: string, max = 256): string {
  return truncate(sanitizeText(value), max);
}

// JSON parse güvenlikli (hata vermeyen parse)
export function safeParseJSON(input: string | null): unknown | null {
  if (!input) return null;
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}

// Object.freeze wrapper (mutable nesneleri dondur)
export function freezeConfig<T extends object>(config: T): Readonly<T> {
  return Object.freeze(config);
}
