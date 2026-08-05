interface VideoClip {
  id: string;
  cat: string;
  src: string;
  poster?: string;
  pexelsId?: number;
  r2?: string;
  r2Poster?: string;
}

// R2 YAVAŞ! Direkt Pexels URL'lerini kullan, R2 CDN'yi bypass et
export async function getVideoUrl(clip: VideoClip): Promise<string> {
  return clip.src;
}

export async function getPosterUrl(clip: VideoClip): Promise<string | undefined> {
  return clip.poster;
}

export function getVideoUrlSync(clip: VideoClip): string {
  return clip.src;
}

export function getPosterUrlSync(clip: VideoClip): string | undefined {
  return clip.poster;
}

export function clearVideoUrlCache(): void {}

export function getVideoUrlStatus(): { live: boolean; cachedCount: number; inFlightCount: number } {
  return { live: false, cachedCount: 0, inFlightCount: 0 };
}
