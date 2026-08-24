// ════════════════════════════════════════════════════════
// SECURITY UTILS - Güvenlik ve sanitizasyon yardımcıları
// ★ Harici paket bağımlılığı yok (dış kütüphane gerektirmez).
//   Böylece npm install yapılamayan ortamlarda bile (vscode.dev
//   gibi tarayıcı tabanlı editörler) build asla bozulmaz.
// ════════════════════════════════════════════════════════

// Tehlikeli etiketleri ve olay (event) özniteliklerini temizler
const SCRIPT_TAG_REGEX = /<script[^>]*>[\s\S]*?<\/script>/gi;
const STYLE_TAG_REGEX = /<style[^>]*>[\s\S]*?<\/style>/gi;
const ON_EVENT_ATTR_REGEX = /\son\w+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi;
const JAVASCRIPT_URI_REGEX = /javascript\s*:/gi;
const DATA_URI_HTML_REGEX = /data\s*:\s*text\/html/gi;
const ALL_TAGS_REGEX = /<\/?[a-zA-Z][^>]*>/g;

const ALLOWED_TAGS = new Set([
  "b", "i", "em", "strong", "a", "p", "br", "span",
  "ul", "ol", "li", "h1", "h2", "h3", "h4",
  "blockquote", "pre", "code",
]);

// HTML sanitizasyon: sadece izinli etiketlere izin verir, script/style/olay
// özniteliklerini ve javascript: URI'lerini tamamen temizler (XSS koruması).
export function sanitizeHTML(input: string): string {
  if (!input || typeof input !== "string") return "";
  let out = input
    .replace(SCRIPT_TAG_REGEX, "")
    .replace(STYLE_TAG_REGEX, "")
    .replace(ON_EVENT_ATTR_REGEX, "")
    .replace(JAVASCRIPT_URI_REGEX, "")
    .replace(DATA_URI_HTML_REGEX, "");

  out = out.replace(ALL_TAGS_REGEX, (tag) => {
    const match = /^<\/?\s*([a-zA-Z0-9]+)/.exec(tag);
    const name = match?.[1]?.toLowerCase() ?? "";
    if (!ALLOWED_TAGS.has(name)) return "";
    // İzinli etiketlerde de sadece güvenli öznitelikler kalsın
    const isClosing = tag.startsWith("</");
    if (isClosing) return `</${name}>`;
    const hrefMatch = /href\s*=\s*("([^"]*)"|'([^']*)')/i.exec(tag);
    const href = hrefMatch?.[2] ?? hrefMatch?.[3] ?? "";
    if (name === "a" && href && /^https?:\/\//i.test(href)) {
      return `<a href="${href.replace(/"/g, "&quot;")}" target="_blank" rel="noopener noreferrer">`;
    }
    return `<${name}>`;
  });

  return out;
}

// Metin sanitizasyon (HTML etiketlerini tamamen kaldır)
export function sanitizeText(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input
    .replace(SCRIPT_TAG_REGEX, "")
    .replace(STYLE_TAG_REGEX, "")
    .replace(ALL_TAGS_REGEX, "")
    .replace(JAVASCRIPT_URI_REGEX, "")
    .trim();
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
  const safe = sanitizeText(cleaned);
  return safe.length > 80 ? safe.slice(0, 80) : safe;
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
  let diff = 0;
  for (let i = 0; i < token.length; i++) {
    diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

// Güvenli header adı kontrolü (HTTP header injection koruması)
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
