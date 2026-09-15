interface VideoClip {
  id: string;
  cat: string;
  src: string;
  poster?: string;
  pexelsId?: number;
  r2?: string;
  r2Poster?: string;
  /** Sayısal kimliği olmayan R2 dosyalarının gerçek dosya adı (örn. blind_deaf_mute_r3) */
  clipFile?: string;
}

type SignedMedia = { url: string; expiresAt: number };
const signedCache = new Map<string, SignedMedia>();

// ★ İMZA SIRA KUYRUĞU + 429 GERİ ÇEKİLMESİ: galeri açılınca 15+ video aynı anda
//   imza isteyince sunucu limitine çarpıyordu. İstekler sıraya girer, 429 gelirse
//   bekleyip tekrar dener — kullanıcıya hata göstermeden herkes sırayla imzalanır.
// ★ ÖNCELİKLİ İSTEK: kullanıcı bir atmosfer seçince o klibin imzası kuyruğun
//   ÖNÜNE atlanır — galerinin geri kalanının arkasında beklemez, anında açılır.
let signChain: Promise<unknown> = Promise.resolve();
const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

function enqueueSign<T>(job: () => Promise<T>, priority = false): Promise<T> {
  if (!priority) {
    const run = signChain.then(job, job);
    signChain = run.catch(() => undefined);
    return run as Promise<T>;
  }
  // öncelikli: yeni işi mevcut zincirin önüne koy (çalışanı bölmez)
  const before = signChain;
  let release!: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  signChain = before.then(() => gate).catch(() => undefined);
  release(); // hemen aç → işimiz sıradaki çalışacak olan olur
  const run = gate.then(job, job);
  // normal zincir, bizim işimizin bitmesini de beklesin (sıra bozulmasın)
  signChain = run.catch(() => undefined);
  return run as Promise<T>;
}

function mediaKey(clip: VideoClip): string | null {
  if (!clip.cat) return null;
  if (clip.clipFile) return `${clip.cat}:${clip.clipFile}`;
  if (clip.pexelsId) return `${clip.cat}:${clip.pexelsId}`;
  const match = clip.id.match(/^[a-zA-Z0-9_-]+-r\d+$/);
  return match ? `${clip.cat}:${clip.id}` : null;
}

export function isR2Media(clip: VideoClip): boolean {
  return Boolean(clip.r2 || clip.r2Poster || clip.pexelsId);
}

async function sign(clip: VideoClip, media: "video" | "poster", priority = false): Promise<string> {
  if (!isR2Media(clip)) return media === "video" ? clip.src : clip.poster;
  const key = mediaKey(clip);
  if (!key) throw new Error("R2 medya kimliği eksik");
  const cacheKey = `${media}:${key}`;
  const cached = signedCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now() + 30_000) return cached.url;
  return enqueueSign(async () => {
    // Çift kontrol: kuyrukta beklerken başka istek aynı anahtarı imzalamış olabilir
    const again = signedCache.get(cacheKey);
    if (again && again.expiresAt > Date.now() + 30_000) return again.url;
    for (let attempt = 0; attempt < 3; attempt++) {
      const response = await fetch("/api/video/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ cat: clip.cat, clipId: clip.id, pexelsId: clip.pexelsId, clipFile: clip.clipFile }),
      });
      const data = await response.json().catch(() => null) as { ok?: boolean; url?: string; posterUrl?: string; expiresAt?: number } | null;
      const url = media === "video" ? data?.url : data?.posterUrl;
      if (response.status === 429) { await sleep(4000 * (attempt + 1)); continue; }
      if (!response.ok || !data?.ok || !url) throw new Error("İmzalı R2 bağlantısı alınamadı");
      signedCache.set(cacheKey, { url, expiresAt: data.expiresAt || Date.now() + 540_000 });
      return url;
    }
    throw new Error("İmzalı R2 bağlantısı alınamadı (limit)");
  });
}

export async function getVideoUrl(clip: VideoClip, priority = false): Promise<string> {
  return sign(clip, "video", priority);
}

// ★ Performans: galeride onlarca kart görünür olunca her biri için imza isteği
// atmak API limitini (15/dk) dolduruyor ve sekmeyi kilitliyordu. Poster herkese açık
// olduğu için önce doğrudan public CDN adresi denenir; olmazsa imzaya düşer.
export async function getPosterUrl(clip: VideoClip): Promise<string | undefined> {
  // ★ Bilinen R2 yolu varsa (örn. admin kategoriler templates/ altında) direkt onu kullan
  if (clip.r2Poster) return clip.r2Poster;
  if (isR2Media(clip) && clip.cat) {
    const idPart = clip.clipFile ?? (clip.pexelsId !== undefined ? String(clip.pexelsId) : null);
    if (idPart) {
      // ★ CDN posteri sync önbelleğe de yaz — canvas senkron okuduğu için seçim ANINDA
      //   poster ekranda olsun, imza sonrası değil (önizlemede boş/kaleydoskop kalmaması için)
      const key = mediaKey(clip);
      const cdnUrl = `https://cdn.nurstudyo.com/posters/${clip.cat}/${idPart}.jpg`;
      if (key && !signedCache.has(`poster:${key}`)) {
        signedCache.set(`poster:${key}`, { url: cdnUrl, expiresAt: Date.now() + 3_600_000 });
      }
      return cdnUrl;
    }
  }
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
