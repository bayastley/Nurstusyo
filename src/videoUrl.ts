interface VideoClip {
  id: string;
  cat: string;
  src: string;
  poster?: string;
  pexelsId?: number;
  r2?: string;
  r2Poster?: string;
}

const R2_PUBLIC_URL = "https://cdn.nurstudyo.com";

function mediaId(clip: VideoClip): string | null {
  if (typeof clip.pexelsId === "number" && Number.isSafeInteger(clip.pexelsId)) {
    return String(clip.pexelsId);
  }
  return null;
}

function publicVideoUrl(clip: VideoClip): string {
  const id = mediaId(clip);
  if (id) return `${R2_PUBLIC_URL}/videos/${clip.cat}/${id}.mp4`;
  return clip.r2 || clip.src;
}

function publicPosterUrl(clip: VideoClip): string | undefined {
  const id = mediaId(clip);
  if (id) return `${R2_PUBLIC_URL}/posters/${clip.cat}/${id}.jpg`;
  return clip.r2Poster || clip.poster;
}

export async function getVideoUrl(clip: VideoClip): Promise<string> {
  return publicVideoUrl(clip);
}

export async function getPosterUrl(clip: VideoClip): Promise<string | undefined> {
  return publicPosterUrl(clip);
}

export function getVideoUrlSync(clip: VideoClip): string {
  return publicVideoUrl(clip);
}

export function getPosterUrlSync(clip: VideoClip): string | undefined {
  return publicPosterUrl(clip);
}

export function clearVideoUrlCache(): void {
  // Public CDN URLs do not require a signed URL cache.
}

export function getVideoUrlStatus(): { live: boolean; cachedCount: number; inFlightCount: number } {
  return { live: false, cachedCount: 0, inFlightCount: 0 };
}
