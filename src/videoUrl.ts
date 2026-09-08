interface VideoClip {
  id: string;
  cat: string;
  src: string;
  poster?: string;
  pexelsId?: number;
  r2?: string;
  r2Poster?: string;
}

type SignedMedia = { url: string; expiresAt: number };
const signedCache = new Map<string, SignedMedia>();

function mediaKey(clip: VideoClip): string | null {
  if (!clip.cat) return null;
  if (clip.pexelsId) return `${clip.cat}:${clip.pexelsId}`;
  const match = clip.id.match(/^[a-zA-Z0-9_-]+-r\d+$/);
  return match ? `${clip.cat}:${clip.id}` : null;
}

export function isR2Media(clip: VideoClip): boolean {
  return Boolean(clip.r2 || clip.r2Poster || clip.pexelsId);
}

async function sign(clip: VideoClip, media: "video" | "poster"): Promise<string> {
  if (!isR2Media(clip)) return media === "video" ? clip.src : clip.poster;
  const key = mediaKey(clip);
  if (!key) throw new Error("R2 medya kimliği eksik");
  const cacheKey = `${media}:${key}`;
  const cached = signedCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now() + 30_000) return cached.url;
  const response = await fetch("/api/video/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ cat: clip.cat, clipId: clip.id, pexelsId: clip.pexelsId }),
  });
  const data = await response.json().catch(() => null) as { ok?: boolean; url?: string; posterUrl?: string; expiresAt?: number } | null;
  const url = media === "video" ? data?.url : data?.posterUrl;
  if (!response.ok || !data?.ok || !url) throw new Error("İmzalı R2 bağlantısı alınamadı");
  signedCache.set(cacheKey, { url, expiresAt: data.expiresAt || Date.now() + 540_000 });
  return url;
}

export async function getVideoUrl(clip: VideoClip): Promise<string> {
  return sign(clip, "video");
}

export async function getPosterUrl(clip: VideoClip): Promise<string | undefined> {
  return sign(clip, "poster");
}

export function getVideoUrlSync(clip: VideoClip): string {
  if (!isR2Media(clip)) return clip.src;
  const key = mediaKey(clip);
  return key ? signedCache.get(`video:${key}`)?.url || "" : "";
}

export function getPosterUrlSync(clip: VideoClip): string | undefined {
  if (!isR2Media(clip)) return clip.poster;
  const key = mediaKey(clip);
  return key ? signedCache.get(`poster:${key}`)?.url : undefined;
}

export function clearVideoUrlCache(): void { signedCache.clear(); }

export function getVideoUrlStatus(): { live: boolean; cachedCount: number; inFlightCount: number } {
  return { live: signedCache.size > 0, cachedCount: signedCache.size, inFlightCount: 0 };
}
