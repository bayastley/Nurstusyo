// ═══════════════════════════════════════════════════════════
// safeFetch — tek noktadan hata yönetimi
// Zaman aşımı + yeniden deneme (üstel bekleme) + tek tip hata.
// Her bileşenin kendi try-catch'ini yazmasına gerek kalmaz.
// Kullanım: safeFetch("/api/xyz") → her koşulda temiz cevap döner.
// ═══════════════════════════════════════════════════════════

export type SafeFetchResult<T> =
  | { ok: true; data: T; status: number }
  | { ok: false; error: string; offline: boolean; status: number };

const DEFAULT_TIMEOUT = 10_000; // 10 sn
const DEFAULT_RETRIES = 2; // 1. deneme + 2 tekrar = toplam 3
const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Tarayıcı şu an çevrimdışı mı? */
export function isOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

/**
 * Güvenli fetch — asla throw etmez.
 * - Zaman aşımı (AbortController)
 * - Ağ hatalarında üstel geri çekilmeyle yeniden dener (1sn → 2sn)
 * - Çevrimdışıysa deneme bile yapmaz, offline:true döner
 */
export async function safeFetch<T = unknown>(
  url: string,
  init?: RequestInit & { timeoutMs?: number; retries?: number }
): Promise<SafeFetchResult<T>> {
  const timeoutMs = init?.timeoutMs ?? DEFAULT_TIMEOUT;
  const retries = init?.retries ?? DEFAULT_RETRIES;

  // Çevrimdışıysa boşuna deneme — anında net cevap
  if (isOffline()) {
    return { ok: false, error: "İnternet bağlantısı yok", offline: true, status: 0 };
  }

  let sonHata = "";
  let sonStatus = 0;

  for (let deneme = 0; deneme <= retries; deneme++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(timer);

      // 429 (hız limiti) ve 5xx → tekrar denemeye değer
      if ((res.status === 429 || res.status >= 500) && deneme < retries) {
        await bekle(1000 * Math.pow(2, deneme)); // 1sn, 2sn
        continue;
      }

      let data: unknown = null;
      try { data = await res.json(); } catch { /* gövde JSON olmayabilir */ }

      if (!res.ok) {
        const msg =
          (data && typeof data === "object" && "error" in data && typeof (data as { error?: unknown }).error === "string")
            ? (data as { error: string }).error
            : `Sunucu hatası (${res.status})`;
        return { ok: false, error: msg, offline: false, status: res.status };
      }

      return { ok: true, data: data as T, status: res.status };
    } catch (e) {
      clearTimeout(timer);
      const aborted = e instanceof DOMException && e.name === "AbortError";
      sonHata = aborted ? "Sunucu yanıt vermedi (zaman aşımı)" : "Bağlantı kurulamadı";
      sonStatus = 0;
      // Son deneme değilse bekle ve yeniden dene
      if (deneme < retries) {
        await bekle(1000 * Math.pow(2, deneme));
        continue;
      }
    }
  }

  return { ok: false, error: isOffline() ? "İnternet bağlantısı yok" : sonHata, offline: isOffline(), status: sonStatus };
}
