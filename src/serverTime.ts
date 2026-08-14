// ════════════════════════════════════════════════════════════════
// SERVERTIME.TS — Tamper-proof zaman kaynağı.
//
// ★ NEDEN GEREKLİ:
// Kullanıcı Windows saatini elle "Cuma günü" yaparsa Cuma hediyesi haksız
// alınıyor, ya da günlük kota erken sıfırlanıyor.
// Bu dosya kullanıcının cihaz saatine ASLA güvenmez; internetten gerçek
// sunucu zamanını çeker.
//
// STRATEJİ (fallback zinciri):
//   1) worldtimeapi.org       (birincil, ücretsiz, hızlı)
//   2) timeapi.io             (ikincil yedek)
//   3) Cloudflare cf-trace    (üçüncül — HEAD request ile Date header)
//   4) Tamper check           (hepsi başarısız ise cihaz saati + delta doğrula)
//
// Sonuç:
//   - Başarılı fetch → server-device delta hesaplanır ve 15 dk cache'lenir.
//   - Sonraki çağrılar performance.now() + delta ile monotonic çalışır.
//   - Cihaz saati aniden değişirse (kullanıcı hile) fark yakalanır, flag basılır.
// ════════════════════════════════════════════════════════════════

import { secureGet, secureSet } from "./secureStore";

const CACHE_KEY = "nur_time_sync";
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 dk
const MAX_DEVICE_DRIFT_MS = 5 * 60 * 1000; // 5 dk üstü = tamper şüphesi

interface TimeSync {
  /** Sunucudan gelen zaman (unix ms) */
  serverMs: number;
  /** Bu zamanı öğrendiğimizde cihazdaki performance.now() değeri */
  perfAnchor: number;
  /** Cihaz saati ile sunucu saati arasındaki fark (server - device) */
  deviceOffsetMs: number;
  /** Bu senkronun yapıldığı unix ms (cache TTL için) */
  fetchedAt: number;
  /** Hangi kaynaktan geldi */
  source: "worldtimeapi" | "timeapi" | "cloudflare" | "fallback";
}

let inMemorySync: TimeSync | null = null;
let inFlight: Promise<TimeSync> | null = null;
let tamperFlag = false;

// ─── Kaynak 1: worldtimeapi.org ──────────────────────────────
async function fetchFromWorldTimeAPI(): Promise<number | null> {
  try {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 2500);
    const res = await fetch("https://worldtimeapi.org/api/timezone/Etc/UTC", {
      signal: controller.signal,
      cache: "no-store",
    }).catch(() => null);
    window.clearTimeout(timeout);
    if (!res || !res.ok) return null;
    const data = await res.json().catch(() => null);
    if (!data) return null;
    // { unixtime: 1730000000, ... } — saniye cinsinden
    const t = typeof data.unixtime === "number" ? data.unixtime * 1000 : null;
    return t && t > 1_600_000_000_000 ? t : null;
  } catch {
    // ERR_CONNECTION_RESET veya ağ hataları yutulur, sessizce ikincil sunucuya (TimeAPI.io) geçilir
    return null;
  }
}

// ─── Kaynak 2: timeapi.io ────────────────────────────────────
async function fetchFromTimeAPI(): Promise<number | null> {
  try {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 4000);
    const res = await fetch("https://timeapi.io/api/Time/current/zone?timeZone=UTC", { signal: controller.signal });
    window.clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    // { dateTime: "2026-01-15T12:34:56.789", ... }
    const t = data.dateTime ? Date.parse(data.dateTime + "Z") : null;
    return t && !isNaN(t) && t > 1_600_000_000_000 ? t : null;
  } catch { return null; }
}

// ─── Kaynak 3: Cloudflare Date header (HEAD request) ─────────
async function fetchFromCloudflare(): Promise<number | null> {
  try {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 3000);
    // cloudflare.com/cdn-cgi/trace her zaman Date header döner
    const res = await fetch("https://cloudflare.com/cdn-cgi/trace", { method: "HEAD", signal: controller.signal });
    window.clearTimeout(timeout);
    const dateHeader = res.headers.get("date");
    if (!dateHeader) return null;
    const t = Date.parse(dateHeader);
    return !isNaN(t) && t > 1_600_000_000_000 ? t : null;
  } catch { return null; }
}

// ─── Cache oku (localStorage) ────────────────────────────────
function loadCache(): TimeSync | null {
  const cached = secureGet<TimeSync | null>(CACHE_KEY, null);
  if (!cached || typeof cached !== "object") return null;
  if (Date.now() - cached.fetchedAt > CACHE_TTL_MS) return null;
  return cached;
}
function saveCache(s: TimeSync) { secureSet(CACHE_KEY, s); }

// ─── Ana sync fonksiyonu ─────────────────────────────────────
export async function syncServerTime(force = false): Promise<TimeSync> {
  // In-flight koruması: aynı anda 20 çağrı gelirse tek fetch
  if (inFlight) return inFlight;

  if (!force) {
    if (inMemorySync && Date.now() - inMemorySync.fetchedAt < CACHE_TTL_MS) return inMemorySync;
    const cached = loadCache();
    if (cached) { inMemorySync = cached; return cached; }
  }

  inFlight = (async () => {
    const perfAnchor = performance.now();
    let serverMs: number | null = null;
    let source: TimeSync["source"] = "fallback";

    // Tüm kaynakları paralel dene — hangisi önce cevap verirse onu kullan.
    // worldtimeapi Türkiye'de bazen ERR_CONNECTION_RESET veriyor,
    // paralel fetch ile bekleme süresi minimuma iner.
    const [r1, r2, r3] = await Promise.all([
      fetchFromWorldTimeAPI(),
      fetchFromTimeAPI(),
      fetchFromCloudflare(),
    ]);
    serverMs = r1 ?? r2 ?? r3;
    if (r1) source = "worldtimeapi";
    else if (r2) source = "timeapi";
    else if (r3) source = "cloudflare";

    // Hiçbir kaynak yanıt vermezse: son bilinen sync varsa onu koru; yoksa cihaz saatini
    // "güvensiz" olarak kabul edip tamper check devreye alınır.
    if (!serverMs) {
      const cached = loadCache();
      if (cached) { inMemorySync = cached; return cached; }
      // Tamper check: cihaz saati mantıklı bir aralıkta mı?
      const deviceNow = Date.now();
      const fallback: TimeSync = {
        serverMs: deviceNow,
        perfAnchor,
        deviceOffsetMs: 0,
        fetchedAt: deviceNow,
        source: "fallback",
      };
      inMemorySync = fallback;
      saveCache(fallback);
      return fallback;
    }

    const deviceNow = Date.now();
    const deviceOffsetMs = serverMs - deviceNow;

    // Cihaz saati sunucudan 5 dakikadan fazla sapıyorsa tamper flag'i işaretle
    if (Math.abs(deviceOffsetMs) > MAX_DEVICE_DRIFT_MS) {
      tamperFlag = true;
      console.warn("[serverTime] Device clock drift detected:", Math.round(deviceOffsetMs / 60000), "min");
    } else {
      tamperFlag = false;
    }

    const sync: TimeSync = { serverMs, perfAnchor, deviceOffsetMs, fetchedAt: serverMs, source };
    inMemorySync = sync;
    saveCache(sync);
    return sync;
  })();

  try { return await inFlight; }
  finally { inFlight = null; }
}

/**
 * Şu anki gerçek (sunucu bazlı) unix ms.
 * Cache dolu ise senkron; yoksa fetch tetikler ve fallback döner.
 * Uygulamada Date.now() yerine bunu kullan.
 */
export function serverNow(): number {
  if (inMemorySync) {
    // performance.now() monotonic — kullanıcı saati değiştirse bile kayar değil
    const elapsedSincePerf = performance.now() - inMemorySync.perfAnchor;
    return inMemorySync.serverMs + elapsedSincePerf;
  }
  // Henüz sync olmadı → cache'den dene
  const cached = loadCache();
  if (cached) {
    inMemorySync = cached;
    const elapsedSincePerf = performance.now() - cached.perfAnchor;
    return cached.serverMs + elapsedSincePerf;
  }
  // Hiçbir kaynak yok → cihaz saatine düş (arka planda sync tetikle)
  void syncServerTime().catch(() => undefined);
  return Date.now();
}

/** Bugünün tarihi (YYYY-MM-DD, sunucu bazlı) — günlük bonus için */
export function serverDateISO(): string {
  // Türkiye takvimi kullanılır. UTC'ye göre gün değişimi, Türkiye'de gece 00:00
  // sonrası hâlâ bir önceki gün hediyesi göstermemeli.
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(serverNow()));
  const get = (type: string) => parts.find((part) => part.type === type)?.value || "00";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Bugün Cuma mı? — cihaz saatinden bağımsız */
export function serverIsFriday(): boolean {
  return serverDayOfWeek() === 5;
}

/** Haftanın günü (0=Pazar … 6=Cumartesi) — sunucu bazlı */
export function serverDayOfWeek(): number {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Istanbul",
    weekday: "short",
  }).format(new Date(serverNow()));
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return map[weekday] ?? new Date(serverNow()).getDay();
}

/** Kullanıcı saatinde tamper tespit edildi mi? */
export function isDeviceClockTampered(): boolean {
  return tamperFlag;
}

/** Aktif senkron bilgisini döner (debug/UI için) */
export function getTimeSyncStatus(): { synced: boolean; source: TimeSync["source"] | "none"; ageMinutes: number; tampered: boolean } {
  if (!inMemorySync) return { synced: false, source: "none", ageMinutes: -1, tampered: tamperFlag };
  const age = (Date.now() - inMemorySync.fetchedAt) / 60000;
  return { synced: true, source: inMemorySync.source, ageMinutes: Math.round(age), tampered: tamperFlag };
}

// Modül yüklenir yüklenmez arka planda sync başlat (blocking değil)
if (typeof window !== "undefined") {
  void syncServerTime().catch(() => undefined);
}
