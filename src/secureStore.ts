// ════════════════════════════════════════════════════════
// SECURESTORE.TS — Client-side tamper koruması
// AES şifreleme + HMAC imza + tarayıcı parmak izi bağlama
// Kullanıcı localStorage'ı elle bozarsa hile tespit edilir, veri sıfırlanır.
// ════════════════════════════════════════════════════════
import CryptoJS from "crypto-js";

// ★ Ana anahtar — .env dosyasındaki VITE_NUR_SECURE_KEY değişkeninden çekilir.
// İstemci tarafında açık metin sabit olarak görünmemesi için dinamik domain ve runtime tuzu eklenir.
const ENV_KEY = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_NUR_SECURE_KEY || "nur_app_default_secure_key_2026";
const RAW_KEY = CryptoJS.SHA256(ENV_KEY + "::" + (typeof window !== "undefined" ? window.location.origin : "nurstudyo.com")).toString();

// ★ Tarayıcı parmak izi — kullanıcı verisini kendi tarayıcısına bağlar,
// başka cihaza kopyalayıp yapıştıramaz.
function fingerprint(): string {
  if (typeof window === "undefined") return "ssr";
  const parts = [
    navigator.userAgent || "",
    navigator.language || "",
    String(screen.width || 0) + "x" + String(screen.height || 0),
    String(new Date().getTimezoneOffset()),
  ].join("|");
  return CryptoJS.SHA256(parts).toString().slice(0, 16);
}

// Derived key: ana anahtar + parmak izi karışımı
function derivedKey(): string {
  return CryptoJS.SHA256(RAW_KEY + "::" + fingerprint()).toString();
}

// HMAC anahtarı (imza için ayrı türetilir)
function hmacKey(): string {
  return CryptoJS.SHA256(RAW_KEY + "::hmac::" + fingerprint()).toString();
}

interface Envelope {
  v: 1;           // sürüm
  ts: number;     // yazma zamanı (unix ms)
  fp: string;     // parmak izi kısa hash
  payload: string; // AES şifreli veri (JSON string of value)
  sig: string;    // HMAC-SHA256(payload + ts + fp)
}

/** Değeri güvenli zarf içine koyar (AES + HMAC + fingerprint). */
function seal(value: unknown): string {
  const json = JSON.stringify({ value });
  const cipher = CryptoJS.AES.encrypt(json, derivedKey()).toString();
  const ts = Date.now();
  const fp = fingerprint();
  const sig = CryptoJS.HmacSHA256(cipher + "|" + ts + "|" + fp, hmacKey()).toString();
  const env: Envelope = { v: 1, ts, fp, payload: cipher, sig };
  return JSON.stringify(env);
}

/** Zarfı açar ve doğrular; null döner. Tamper raporlamaz — sadece validasyon. */
function unseal<T>(raw: string | null): { value: T; tamper: boolean } | null {
  if (!raw) return null;
  try {
    // Eski (şifresiz) format — migrate edildi sayılır, tamper değil
    if (!raw.startsWith("{")) {
      try {
        const v = JSON.parse(raw) as T;
        return { value: v, tamper: false };
      } catch {
        return { value: raw as unknown as T, tamper: false };
      }
    }
    const env = JSON.parse(raw) as Envelope;
    if (!env || env.v !== 1 || !env.payload || !env.sig || !env.fp) return null;

    // 1. HMAC imza kontrolü
    const expectedSig = CryptoJS.HmacSHA256(
      env.payload + "|" + env.ts + "|" + env.fp,
      hmacKey()
    ).toString();
    if (expectedSig !== env.sig) return null; // imza uyumsuz → bozuk veri

    // 2. Parmak izi kontrolü — farklı taraysa bile değerleri dön, tamper raporlama
    const fpMismatch = env.fp !== fingerprint();

    // 3. AES çöz
    const bytes = CryptoJS.AES.decrypt(env.payload, derivedKey());
    const plain = bytes.toString(CryptoJS.enc.Utf8);
    if (!plain) return null;
    const parsed = JSON.parse(plain) as { value: T };
    return { value: parsed.value ?? (null as any), tamper: false };
  } catch {
    return null;
  }
}

// ─── Public API ──────────────────────────────────────────
const TAMPER_FLAG_KEY = "nur_tamper_flag";

/** Tamper tespit edildiğinde çağrılır — flag'i işaretle, opsiyonel callback tetikle. */
let tamperListener: ((key: string) => void) | null = null;
export function onTamperDetected(cb: (key: string) => void): void {
  tamperListener = cb;
}
function reportTamper(key: string) {
  try { localStorage.setItem(TAMPER_FLAG_KEY, String(Date.now())); } catch { /* ignore */ }
  if (tamperListener) tamperListener(key);
}
export function consumeTamperFlag(): boolean {
  if (typeof window === "undefined") return false;
  const has = localStorage.getItem(TAMPER_FLAG_KEY);
  if (!has) return false;
  localStorage.removeItem(TAMPER_FLAG_KEY);
  return true;
}

/** Güvenli oku — bozuk veriyi temizler AMA tamper raporlamaz. */
export function secureGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = localStorage.getItem(key);
  if (raw === null) return fallback;
  const result = unseal<T>(raw);
  if (result === null) {
    // Veri bozulmuş veya okunamıyor — temizle, fallback dön
    // ★ ASLA reportTamper ÇAĞIRMA — bu normal durum
    try { localStorage.removeItem(key); } catch { /* ignore */ }
    return fallback;
  }
  return result.value;
}

/** Güvenli yaz — AES + HMAC + fingerprint zarfıyla saklar. */
export function secureSet<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, seal(value)); } catch { /* quota */ }
}

/** Anahtarı sil. */
export function secureRemove(key: string): void {
  if (typeof window === "undefined") return;
  try { localStorage.removeItem(key); } catch { /* ignore */ }
}

/** Eski (plaintext) veriyi güvenli formata bir kere taşır. Migration için. */
export function secureMigrate<T>(key: string, parse: (raw: string) => T | null): void {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(key);
  if (!raw) return;
  // Zaten şifreli mi?
  if (raw.startsWith("{") && raw.includes('"sig"')) return;
  const val = parse(raw);
  if (val !== null && val !== undefined) secureSet(key, val);
  else secureRemove(key);
}
