interface VideoClip {
  id: string;
  cat: string;
  src: string;
  poster?: string;
  pexelsId?: number;
  r2?: string;
  r2Poster?: string;
}

// R2 CUSTOM DOMAIN (cdn.nurstudyo.com) - HIZLI & GİZLİ
const R2_BASE = "https://cdn.nurstudyo.com";

export async function getVideoUrl(clip: VideoClip): Promise<string> {
  // R2 custom domain kullan (hızlı & gizli)
  if (clip.pexelsId && clip.cat) {
    return `${R2_BASE}/videos/${clip.cat}/${clip.pexelsId}.mp4`;
  }
  return clip.r2 || clip.src;
}

export async function getPosterUrl(clip: VideoClip): Promise<string | undefined> {
  // R2 custom domain kullan (hızlı & gizli)
  if (clip.pexelsId && clip.cat) {
    return `${R2_BASE}/posters/${clip.cat}/${clip.pexelsId}.jpg`;
  }
  return clip.r2Poster || clip.poster;
}

export function getVideoUrlSync(clip: VideoClip): string {
  // R2 custom domain kullan (hızlı & gizli)
  if (clip.pexelsId && clip.cat) {
    return `${R2_BASE}/videos/${clip.cat}/${clip.pexelsId}.mp4`;
  }
  return clip.r2 || clip.src;
}

export function getPosterUrlSync(clip: VideoClip): string | undefined {
  // R2 custom domain kullan (hızlı & gizli)
  if (clip.pexelsId && clip.cat) {
    return `${R2_BASE}/posters/${clip.cat}/${clip.pexelsId}.jpg`;
  }
  return clip.r2Poster || clip.poster;
}

export function clearVideoUrlCache(): void {}

export function getVideoUrlStatus(): { live: boolean; cachedCount: number; inFlightCount: number } {
  return { live: false, cachedCount: 0, inFlightCount: 0 };
}
