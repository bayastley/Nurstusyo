import { secureRemove } from "../secureStore";

export type SafeFetchResult<T> =
  | { ok: true; data: T; status: number }
  | { ok: false; error: string; offline: boolean; status: number };

const DEFAULT_TIMEOUT = 10_000; // 10 sn
const DEFAULT_RETRIES = 2; // GET/HEAD için: 1. deneme + 2 tekrar = toplam 3
const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Tarayıcı şu an çevrimdışı mı? */
export function isOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

/**
 * Güvenli fetch — asla throw etmez.
 * - Zaman aşımı (AbortController)
 * - Yeniden deneme YALNIZ GET/HEAD için varsayılan (429/5xx + ağ hatası, üstel bekleme 1sn→2sn).
 *   POST/PUT/PATCH/DELETE çift işlem riski taşır: varsayılan retries=0. Çağıran açıkça `retries: n` verirse denenir.
 * - Çevrimdışıysa deneme bile yapmaz, offline:true döner
 */
export async function safeFetch<T = unknown>(
  url: string,
  init?: RequestInit & { timeoutMs?: number; retries?: number }
): Promise<SafeFetchResult<T>> {
  const timeoutMs = init?.timeoutMs ?? DEFAULT_TIMEOUT;
  const method = String(init?.method || "GET").toUpperCase();
  const canRetry = init?.retries !== undefined ? init.retries > 0 : (method === "GET" || method === "HEAD");
  const retries = canRetry ? (init?.retries ?? DEFAULT_RETRIES) : 0;

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

      // 429 (hız limiti) ve 5xx → tekrar denemeye değer (yalnız retries>0 iken)
      if ((res.status === 429 || res.status >= 500) && deneme < retries) {
        await bekle(1000 * Math.pow(2, deneme)); // 1sn, 2sn
        continue;
      }

      let data: unknown = null;
      try { data = await res.json(); } catch { /* gövde JSON olmayabilir */ }

      // ★ RELOGIN (05.11): sub'suz eski oturum 401 + code:"RELOGIN" → oturumu temizle, girişe yönlendir (tek nokta).
      if (res.status === 401 && data && typeof data === "object" && (data as { code?: string }).code === "RELOGIN" && typeof window !== "undefined") {
        try { void fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }); } catch { /* beklenen */ }
        try { localStorage.removeItem("nur_admin_session"); localStorage.removeItem("nur_user"); localStorage.removeItem("nur_token"); sessionStorage.clear(); } catch { /* beklenen */ }
        try { secureRemove("nur_user_v1"); secureRemove("nur_pack_rights_v1"); secureRemove("nur_jeton"); } catch { /* beklenen */ }
        if (!window.location.pathname.startsWith("/admin")) window.location.assign("/?giris=1");
      }

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
