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

export function pickMime(): string {
  // ★ WEBM ÖNCELİKLİ: 1 saniye sorunu için WebM tercih edilir
  const choices = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4;codecs=avc1.42E01E,mp4a.40.2", "video/mp4"];
  return choices.find((mime) => window.MediaRecorder?.isTypeSupported?.(mime)) ?? "";
}

export function formatRemaining(ms: number): string {
  if (ms <= 0) return "-";
  const total = Math.floor(ms / 1000), hour = Math.floor(total / 3600), minute = Math.floor((total % 3600) / 60), second = total % 60;
  if (hour) return `${hour} sa ${minute} dk`;
  if (minute) return `${minute} dk ${second} sn`;
  return `${second} sn`;
}

export async function fetchJSON(url: string, timeoutMs = 12000): Promise<unknown> {
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
    if (!retryable) throw err;
    await new Promise((resolve) => window.setTimeout(resolve, 900));
    return await attempt();
  }
}

export async function fetchAyah(surah: number, ayah: number, edition = "tr.diyanet"): Promise<{ ar: string; tr: string }> {
  try {
    const json = await fetchJSON(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/editions/quran-uthmani,${edition}`) as { data?: Array<{ text: string }> };
    const ar = (json.data?.[0]?.text ?? "") as string;
    const tr = (json.data?.[1]?.text ?? "") as string;
    if (ar || tr) return { ar, tr };
  } catch { /* yedek endpoint denenir */ }
  const [arabic, translated] = await Promise.all([
    fetchJSON(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/quran-uthmani`),
    fetchJSON(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/${edition}`),
  ]) as [{ data?: { text: string } }, { data?: { text: string } }];
  return { ar: (arabic.data?.text ?? "") as string, tr: (translated.data?.text ?? "") as string };
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
