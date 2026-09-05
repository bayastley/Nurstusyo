import { useState, useCallback, useRef, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════
// ★ useVideoPreload — Cloudflare R2 Videoları İçin Ön Yükleme
//
// Seçilen atmosfer/arka plan videosunu tarayıcı hafızasına
// (Blob URL) önceden yükler. Video hazır olduğunda Canvas
// motorunu tetikler, ses senkronizasyon kayması engellenir.
//
// ★ KULLANIM:
//   const { preload, readyUrl, loading, error } = useVideoPreload();
//   await preload("https://cdn.nurstudyo.com/namaz/abc.mp4");
//   if (readyUrl) { /* Canvas'a readyUrl ver */ }
// ═══════════════════════════════════════════════════════════════

interface PreloadResult {
  /** Videoyu Blob URL olarak önyükler */
  preload: (url: string) => Promise<string | null>;
  /** Önyüklenen videonun Blob URL'i (hazır olana kadar null) */
  readyUrl: string | null;
  /** Önyükleme devam ediyor mu */
  loading: boolean;
  /** Hata mesajı (varsa) */
  error: string | null;
  /** Önbellek temizle (bellekten serbest bırak) */
  clearCache: () => void;
  /** Önbellekte kaç video var */
  cacheSize: number;
}

const BLOB_CACHE = new Map<string, string>(); // url → blobUrl
const MAX_CACHE_SIZE = 20; // en fazla 20 video önbellekte tutulur

export function useVideoPreload(): PreloadResult {
  const [readyUrl, setReadyUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const currentUrlRef = useRef<string>("");

  // Önbellek boyutunu kontrol et
  const getCacheSize = useCallback(() => BLOB_CACHE.size, []);

  // Önbellek temizle
  const clearCache = useCallback(() => {
    BLOB_CACHE.forEach((blobUrl) => {
      URL.revokeObjectURL(blobUrl);
    });
    BLOB_CACHE.clear();
    setReadyUrl(null);
  }, []);

  // Eski önbellek girişlerini temizle (FIFO)
  const evictCache = useCallback(() => {
    if (BLOB_CACHE.size >= MAX_CACHE_SIZE) {
      const firstKey = BLOB_CACHE.keys().next().value;
      if (firstKey) {
        const oldBlobUrl = BLOB_CACHE.get(firstKey);
        if (oldBlobUrl) URL.revokeObjectURL(oldBlobUrl);
        BLOB_CACHE.delete(firstKey);
      }
    }
  }, []);

  // Video önyükleme fonksiyonu
  const preload = useCallback(
    async (url: string): Promise<string | null> => {
      if (!url) {
        setError("Video URL'i boş");
        return null;
      }

      // Önbellekte mi kontrol et
      const cached = BLOB_CACHE.get(url);
      if (cached) {
        setReadyUrl(cached);
        setError(null);
        return cached;
      }

      // Önceki isteği iptal et
      if (abortRef.current) {
        abortRef.current.abort();
      }

      const controller = new AbortController();
      abortRef.current = controller;
      currentUrlRef.current = url;

      setLoading(true);
      setError(null);
      setReadyUrl(null);

      try {
        const response = await fetch(url, {
          signal: controller.signal,
          // Movies/medya için en iyi cache politikası
          cache: "force-cache",
        });

        if (!response.ok) {
          throw new Error(`Video yüklenemedi: ${response.status} ${response.statusText}`);
        }

        const blob = await response.blob();

        // MIME tipi kontrolü — sadece video izin ver
        if (!blob.type.startsWith("video/")) {
          throw new Error(`Geçersiz dosya tipi: ${blob.type}. Sadece video dosyaları yüklenebilir.`);
        }

        // Bellek boyutu kontrolü — max 100MB
        const sizeMB = blob.size / (1024 * 1024);
        if (sizeMB > 100) {
          throw new Error(`Video çok büyük: ${Math.round(sizeMB)}MB. Maksimum 100MB olmalı.`);
        }

        // Blob URL oluştur
        const blobUrl = URL.createObjectURL(blob);

        // Önbelleğe kaydet
        evictCache();
        BLOB_CACHE.set(url, blobUrl);

        // Eğer hâlâ aynı URL isteniyorsa state'i güncelle
        if (currentUrlRef.current === url) {
          setReadyUrl(blobUrl);
          setLoading(false);
        }

        return blobUrl;
      } catch (err: unknown) {
        // İptal edildiyse hata gösterme
        if (err instanceof DOMException && err.name === "AbortError") {
          return null;
        }

        const message = err instanceof Error ? err.message : "Bilinmeyen hata";
        if (currentUrlRef.current === url) {
          setError(message);
          setLoading(false);
        }
        return null;
      }
    },
    [evictCache]
  );

  // BileşenUnmount edildiğinde devam eden istekleri iptal et
  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, []);

  return {
    preload,
    readyUrl,
    loading,
    error,
    clearCache,
    cacheSize: getCacheSize(),
  };
}

// ═══════════════════════════════════════════════════════════════
// ★ useBatchPreload — Toplu Video Ön Yükleme
//   Birden fazla videoyu sırayla veya paralel olarak yükler.
// ═══════════════════════════════════════════════════════════════

interface BatchPreloadResult {
  /** Toplu önyükleme başlat */
  preloadAll: (urls: string[]) => Promise<Map<string, string>>;
  /** Yüklenen video URL'leri */
  loadedUrls: Map<string, string>;
  /** Toplam yükleme ilerlemesi (0-100) */
  progress: number;
  /** Hata sayfası */
  errors: Array<{ url: string; error: string }>;
  /** Yükleniyor mu */
  loading: boolean;
}

export function useBatchPreload(): BatchPreloadResult {
  const [loadedUrls, setLoadedUrls] = useState<Map<string, string>>(new Map());
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<Array<{ url: string; error: string }>>([]);
  const [loading, setLoading] = useState(false);

  const preloadAll = useCallback(async (urls: string[]): Promise<Map<string, string>> => {
    if (urls.length === 0) return new Map();

    setLoading(true);
    setProgress(0);
    setErrors([]);
    const results = new Map<string, string>();
    const total = urls.length;

    // Her videoyu sırayla yükle (paralel olursa ağ tıkanabilir)
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];

      // Önbellekte mi kontrol et
      const cached = BLOB_CACHE.get(url);
      if (cached) {
        results.set(url, cached);
        setProgress(Math.round(((i + 1) / total) * 100));
        continue;
      }

      try {
        const response = await fetch(url, { cache: "force-cache" });
        if (!response.ok) throw new Error(`${response.status}`);

        const blob = await response.blob();
        if (!blob.type.startsWith("video/")) {
          throw new Error(`Geçersiz: ${blob.type}`);
        }

        const blobUrl = URL.createObjectURL(blob);

        // Önbelleğe kaydet
        if (BLOB_CACHE.size >= MAX_CACHE_SIZE) {
          const firstKey = BLOB_CACHE.keys().next().value;
          if (firstKey) {
            const old = BLOB_CACHE.get(firstKey);
            if (old) URL.revokeObjectURL(old);
            BLOB_CACHE.delete(firstKey);
          }
        }
        BLOB_CACHE.set(url, blobUrl);

        results.set(url, blobUrl);
        setLoadedUrls(new Map(results));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Bilinmeyen hata";
        setErrors((prev) => [...prev, { url, error: message }]);
      }

      setProgress(Math.round(((i + 1) / total) * 100));
    }

    setLoading(false);
    return results;
  }, []);

  return { preloadAll, loadedUrls, progress, errors, loading };
}
