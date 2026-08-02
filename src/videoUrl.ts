// ════════════════════════════════════════════════════════════════
// VIDEOURL.TS — R2 video URL güvenlik katmanı (Presigned URL resolver).
//
// ★ AMAÇ:
// Cloudflare R2 üzerindeki video linkleri kodda kalıcı ve açık olarak
// (https://nurstudyo.com/videos/...) yer almasın. Kullanıcı bir atmosfer
// seçtiğinde, o videonun linki BACKEND'DEN alınan ve sadece 10 dk geçerli
// bir imzalı URL (presigned URL) ile döner. 10 dk sonra link ölür.
//
// ★ İKİ MOD:
//   LIVE  → import.meta.env.VITE_R2_SIGNED_URLS === "true"
//          → /api/video/sign endpoint'ine POST atar, imzalı URL döner
//          → R2 bucket PRIVATE olmalı, backend AWS SDK ile signer çalıştırır
//   DEMO  → varsayılan (backend yokken)
//          → clip.r2 veya clip.src'yi olduğu gibi döner (mevcut davranış)
//
// ★ CACHE:
// Aynı clip için 10 dk boyunca tek imzalı URL kullanılır (hem R2 çağrısını
// hem backend yükünü azaltır). URL bitince otomatik yenilenir.
//
// ★ HAZIRLIK:
// Backend endpoint sözleşmesi:
//   POST /api/video/sign
//   Body: { clipId: string, pexelsId?: number, cat: string }
//   Response: { ok: true, url: string, expiresAt: number } (unix ms)
//           | { ok: false, error: string }
// ════════════════════════════════════════════════════════════════

import type { Clip } from "./clips";

const R2_SIGNED_URLS_LIVE =
  ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_R2_SIGNED_URLS ?? "false") === "true";

interface CachedUrl {
  url: string;
  posterUrl?: string;
  expiresAt: number; // unix ms
}

// clip.id → cached signed URL
const urlCache = new Map<string, CachedUrl>();
// clip.id → in-flight promise (aynı anda 20 kart aynı URL'i isterse tek fetch)
const inFlight = new Map<string, Promise<CachedUrl | null>>();

const SAFETY_MARGIN_MS = 60_000; // URL bitmeden 1 dk önce yenile

/**
 * Bir video clip'i için oynatılabilir URL döner.
 *
 * DEMO mode: mevcut public URL (clip.r2 ?? clip.src) döner — davranış aynı.
 * LIVE mode: backend'den 10 dk geçerli imzalı URL çeker, cache'ler.
 *
 * Kart yüklenirken await ile bunu çağır. Cache dolu ise anında döner.
 */
export async function getVideoUrl(clip: Clip): Promise<string> {
  // DEMO: eski davranış — tarayıcıda public URL kullan
  if (!R2_SIGNED_URLS_LIVE) return clip.r2 ?? clip.src;

  // LIVE: cache'te geçerli URL var mı?
  const cached = urlCache.get(clip.id);
  if (cached && Date.now() < cached.expiresAt - SAFETY_MARGIN_MS) return cached.url;

  // In-flight: aynı clip için başka istek varsa onu bekle
  const existing = inFlight.get(clip.id);
  if (existing) {
    const r = await existing;
    return r?.url ?? clip.src; // fallback: Pexels public URL
  }

  const promise = fetchSignedUrl(clip);
  inFlight.set(clip.id, promise);
  try {
    const result = await promise;
    if (result) {
      urlCache.set(clip.id, result);
      return result.url;
    }
    // Backend hata verirse Pexels public URL'ye düş (asla bozuk kart çıkmasın)
    return clip.src;
  } finally {
    inFlight.delete(clip.id);
  }
}

/**
 * Video posteri için imzalı URL. Poster'lar da R2'de private ise gerekir.
 * Bu sürümde backend response'unda posterUrl varsa cache'lenir.
 */
export async function getPosterUrl(clip: Clip): Promise<string | undefined> {
  if (!R2_SIGNED_URLS_LIVE) return clip.r2Poster ?? clip.poster;
  const cached = urlCache.get(clip.id);
  if (cached && Date.now() < cached.expiresAt - SAFETY_MARGIN_MS) {
    return cached.posterUrl ?? clip.poster;
  }
  // Video sign çağrısı posteri de döndürüyor; ayrı çağrı gerekmez
  await getVideoUrl(clip);
  return urlCache.get(clip.id)?.posterUrl ?? clip.poster;
}

async function fetchSignedUrl(clip: Clip): Promise<CachedUrl | null> {
  try {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5000);
    const res = await fetch("/api/video/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        clipId: clip.id,
        pexelsId: clip.pexelsId,
        cat: clip.cat,
      }),
    });
    window.clearTimeout(timeout);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      ok: boolean;
      url?: string;
      posterUrl?: string;
      expiresAt?: number;
      error?: string;
    };
    if (!data.ok || !data.url) return null;
    return {
      url: data.url,
      posterUrl: data.posterUrl,
      // Backend expiresAt vermezse 10 dk varsay
      expiresAt: data.expiresAt ?? Date.now() + 10 * 60 * 1000,
    };
  } catch {
    return null;
  }
}

/**
 * Senkron kullanım için — canvas render'da await kullanamayız.
 * DEMO'da public URL, LIVE'da cache dolu ise imzalı URL, aksi halde
 * public URL fallback (arka planda imzalı URL fetch'i tetiklenir).
 */
export function getVideoUrlSync(clip: Clip): string {
  if (!R2_SIGNED_URLS_LIVE) return clip.r2 ?? clip.src;
  const cached = urlCache.get(clip.id);
  if (cached && Date.now() < cached.expiresAt - SAFETY_MARGIN_MS) return cached.url;
  // Arka planda al, bu render için Pexels fallback
  void getVideoUrl(clip).catch(() => undefined);
  return clip.src;
}

export function getPosterUrlSync(clip: Clip): string | undefined {
  if (!R2_SIGNED_URLS_LIVE) return clip.r2Poster ?? clip.poster;
  const cached = urlCache.get(clip.id);
  if (cached?.posterUrl && Date.now() < cached.expiresAt - SAFETY_MARGIN_MS) return cached.posterUrl;
  void getPosterUrl(clip).catch(() => undefined);
  return clip.poster;
}

/** Cache temizle — testler veya oturum bitişi için */
export function clearVideoUrlCache(): void {
  urlCache.clear();
  inFlight.clear();
}

/** Debug/status */
export function getVideoUrlStatus(): { live: boolean; cachedCount: number; inFlightCount: number } {
  return {
    live: R2_SIGNED_URLS_LIVE,
    cachedCount: urlCache.size,
    inFlightCount: inFlight.size,
  };
}
