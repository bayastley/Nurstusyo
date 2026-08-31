// ════════════════════════════════════════════════════════
// STUDIO HELPERS — StudioApp.tsx'den ayrıldı
// Yardımcı fonksiyonlar: fetch, format, mime
// ════════════════════════════════════════════════════════

import { MEAL_FIXES } from "../meal_fixes";
import type { SelectedAyah, Aspect } from "../types";

export const fmtDuration = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

export const fmtSize = (bytes: number) =>
  bytes > 1 << 20 ? `${(bytes / (1 << 20)).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;

export const dimensions = (aspect: Aspect): [number, number] =>
  aspect === "9:16" ? [1080, 1920] :
  aspect === "1:1"  ? [1080, 1080] :
  aspect === "4:5"  ? [1080, 1350] :
                      [1920, 1080];

export const uid = () => crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

export const isWholeSurahSelected = (items: SelectedAyah[], SURAHS: Array<{ count: number }>): boolean => {
  if (!items.length) return false;
  const surahNo = items[0].s;
  if (surahNo === 0) return false;
  if (!items.every((it) => it.s === surahNo)) return false;
  const total = SURAHS[surahNo - 1]?.count ?? 0;
  if (!total || items.length !== total) return false;
  const ayahSet = new Set(items.map((it) => it.a));
  for (let i = 1; i <= total; i += 1) { if (!ayahSet.has(i)) return false; }
  return true;
};

function isOldOrIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  // iOS/iPadOS (Safari) tarihsel olarak WebM'i hiç oynatamaz — sadece MP4/H.264 destekler.
  const isIOS = /iP(hone|ad|od)/.test(ua) || (navigator.platform === "MacIntel" && (navigator as any).maxTouchPoints > 1);
  // Eski/düşük donanımlı Android tarayıcılar da MP4/H.264'ü WebM'e göre çok daha güvenilir oynatır.
  const isOldAndroidWebView = /Android\s([0-6])\./.test(ua) || /; wv\)/.test(ua);
  return isIOS || isOldAndroidWebView;
}

export function pickMime(): string {
  // ★ ESKİ CİHAZ / iOS UYUMLULUĞU: iOS Safari WebM'i hiçbir sürümde
  //   video/img elementinde oynatamaz (kayıt sırasında MediaRecorder WebM
  //   üretse bile, kullanıcı "önizle/indir" dediğinde video açılmaz).
  //   Bu yüzden iOS ve eski Android'de MP4/H.264 önceliklendirilir.
  //   Modern masaüstü/Android tarayıcılarda ise VP8 (daha hafif encode,
  //   daha az donma riski) öncelikli kalır.
  const mp4First = ["video/mp4;codecs=avc1.42E01E,mp4a.40.2", "video/mp4", "video/webm;codecs=vp8,opus", "video/webm"];
  const webmFirst = ["video/webm;codecs=vp8,opus", "video/webm", "video/mp4;codecs=avc1.42E01E,mp4a.40.2", "video/webm;codecs=vp9,opus", "video/mp4"];
  const choices = isOldOrIosDevice() ? mp4First : webmFirst;
  for (const mime of choices) {
    try {
      if (window.MediaRecorder?.isTypeSupported?.(mime)) return mime;
    } catch {
      // ★ iOS bazı sürümlerde isTypeSupported true dönüp start() sırasında
      //   NotSupportedError fırlatabilir — bu yüzden çağrı try/catch içinde.
      continue;
    }
  }
  return "";
}

export function formatRemaining(ms: number): string {
  if (ms <= 0) return "-";
  const total = Math.floor(ms / 1000), hour = Math.floor(total / 3600), minute = Math.floor((total % 3600) / 60), second = total % 60;
  if (hour) return `${hour} sa ${minute} dk`;
  if (minute) return `${minute} dk ${second} sn`;
  return `${second} sn`;
}

export async function fetchJSON(url: string, timeoutMs = 12000): Promise<any> {
  const attempt = async () => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { cache: "no-store", signal: controller.signal });
      if (!response.ok) {
        const err: Error & { status?: number } = new Error(String(response.status));
        err.status = response.status;
        throw err;
      }
      return await response.json();
    } finally {
      window.clearTimeout(timeout);
    }
  };
  try {
    return await attempt();
  } catch (err) {
    const status = (err as Error & { status?: number })?.status;
    const retryable = status === 429 || status === 503 || (status !== undefined && status >= 500) || status === undefined;
    if (!retryable) { console.error("[fetchJSON] Kalıcı hata:", url, status, (err as Error).message); throw err; }
    // ★ 429 için daha uzun bekle (2sn), diğerleri için 1sn
    const waitMs = status === 429 ? 2000 : 1000;
    await new Promise((resolve) => window.setTimeout(resolve, waitMs));
    return await attempt();
  }
}

// ★ AYET CACHE — aynı ayeti tekrar çekmeyi engeller, rate-limit sorunu çözer
const ayahCache = new Map<string, { ar: string; tr: string }>();
let pendingFetches = 0;
let frameCount = 0;
const MAX_PARALLEL = 4; // en fazla 4 paralel istek (daha hızlı yükleme)
const THROTTLE_MS = 250; // her istek arasında minimum 250ms (eskisi 600ms çok yavaştı)
let lastFetchTime = 0;

function throttle(): Promise<void> {
  const now = Date.now();
  const wait = Math.max(0, THROTTLE_MS - (now - lastFetchTime));
  lastFetchTime = now + wait;
  return wait > 0 ? new Promise((r) => setTimeout(r, wait)) : Promise.resolve();
}

export async function fetchAyah(surah: number, ayah: number, edition = "tr.diyanet"): Promise<{ ar: string; tr: string }> {
  const key = `${surah}:${ayah}:${edition}`;
  const cached = ayahCache.get(key);
  if (cached) { if (frameCount++ % 20 === 0) console.log("[fetchAyah] Cache hit:", key); return cached; }

  // ★ Throttling — çok fazla paralel isteği engelle
  while (pendingFetches >= MAX_PARALLEL) {
    await new Promise((r) => setTimeout(r, 300));
  }
  await throttle();
  pendingFetches++;

  try {
    const json = await fetchJSON(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/editions/quran-uthmani,${edition}`) as { data?: Array<{ text: string }> };
    const ar = (json.data?.[0]?.text ?? "") as string;
    const tr = (json.data?.[1]?.text ?? "") as string;
    console.log("[fetchAyah] Başarılı:", key, "ar:", ar.length, "tr:", tr.length);
    if (ar || tr) {
      const result = { ar, tr };
      ayahCache.set(key, result);
      pendingFetches--;
      return result;
    }
  } catch (e) { console.warn("[fetchAyah] Birincil istek başarısız, yedek denenir:", `${surah}:${ayah}`, (e as Error).message); }

  // ★ Yedek: tek tek çek (ama throttlı)
  await throttle();
  try {
    const [arabic, translated] = await Promise.all([
      fetchJSON(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/quran-uthmani`),
      fetchJSON(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/${edition}`),
    ]) as [{ data?: { text: string } }, { data?: { text: string } }];
    const result = { ar: (arabic.data?.text ?? "") as string, tr: (translated.data?.text ?? "") as string };
    console.log("[fetchAyah] Yedek başarılı:", key, "ar:", result.ar.length, "tr:", result.tr.length);
    ayahCache.set(key, result);
    pendingFetches--;
    return result;
  } catch (e2) {
    console.error("[fetchAyah] Yedek de başarısız:", key, (e2 as Error).message);
    pendingFetches--;
    return { ar: "", tr: "" };
  }
}

export async function fetchSurah(surah: number, edition: string): Promise<Array<{ ar: string; tr: string }>> {
  let arabic: Array<{ text: string }> = [];
  let translated: Array<{ text: string }> = [];
  try {
    const json = await fetchJSON(`https://api.alquran.cloud/v1/surah/${surah}/editions/quran-uthmani,${edition}`) as { data?: Array<{ ayahs?: Array<{ text: string }> }> };
    arabic = json.data?.[0]?.ayahs ?? [];
    translated = json.data?.[1]?.ayahs ?? [];
  } catch { /* yedek endpoint denenir */ }
  if (!arabic.length || !translated.length) {
    const [arabicJson, translatedJson] = await Promise.all([
      fetchJSON(`https://api.alquran.cloud/v1/surah/${surah}/quran-uthmani`),
      fetchJSON(`https://api.alquran.cloud/v1/surah/${surah}/${edition}`),
    ]) as [{ data?: { ayahs?: Array<{ text: string }> } }, { data?: { ayahs?: Array<{ text: string }> } }];
    arabic = arabicJson.data?.ayahs ?? [];
    translated = translatedJson.data?.ayahs ?? [];
  }
  let rows = arabic.map((item, index) => ({ ar: item.text, tr: (translated[index]?.text ?? "") as string }));
  const unique = new Set(rows.map((row) => row.tr));
  if (rows.length > 1 && unique.size === 1 && MEAL_FIXES[surah]?.length === rows.length && edition.startsWith("tr.")) {
    rows = rows.map((row, index) => ({ ...row, tr: MEAL_FIXES[surah][index] }));
  }
  if (!rows.length) throw new Error("SURAH_EMPTY");
  return rows;
}
