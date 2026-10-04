// ════════════════════════════════════════════════════════
// STUDIO HELPERS — StudioApp.tsx'den ayrıldı
// Yardımcı fonksiyonlar: fetch, format, mime
// ════════════════════════════════════════════════════════

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
  // ★ 04.10: TÜM mobil tarayıcılar MP4 öncelikli. Modern Android Chrome WebM kaydını
  //   desteklese de; galeri/TikTok/Instagram gibi hedef uygulamaların çoğu WebM'i
  //   oynatamıyor ya da sadece İLK frame'i gösterip sesi kesiyordu (kullanıcı
  //   bildirimi: "galeriye düşünce ilk ayet sesi çıkıyor, video donuyor").
  //   MP4/H.264 her cihazda garantili oynar — mobilde hep MP4, masaüstünde WebM.
  const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);
  // Eski/düşük donanımlı Android tarayıcılar da MP4/H.264'ü WebM'e göre çok daha güvenilir oynatır.
  const isOldAndroidWebView = /Android\s([0-6])\./.test(ua) || /; wv\)/.test(ua);
  return isIOS || isMobile || isOldAndroidWebView;
}

export function pickMime(): string {
  // ★ ESKİ CİHAZ / iOS UYUMLULUĞU: iOS Safari WebM'i hiçbir sürümde
  //   video/img elementinde oynatamaz (kayıt sırasında MediaRecorder WebM
  //   üretse bile, kullanıcı "önizle/indir" dediğinde video açılmaz).
  //   Bu yüzden iOS ve eski Android'de MP4/H.264 önceliklendirilir.
  //   ★ 04.10: Mobil Chrome dahil TÜM mobil tarayıcılar artık MP4 öncelikli
  //   (isOldOrIosDevice'a bak) — galeride donan video düzeltmesi.
  //   Modern masaüstü tarayıcılarda ise VP8 (daha hafif encode,
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

// ★ QURAN API ADRESİ (30.09): canlıda same-origin proxy (/api/quran/v1/... —
//   Vercel fonksiyonu + ortak edge cache, rate limit biter). Yerel ön izleme /
//   dosya / localhost'ta Vite-statik sunucu API barındıramadığı için doğrudan
//   upstream'e gidilir — eski davranışa otomatik düşer.
const QURAN_UPSTREAM = "https://api.alquran.cloud";
export function quranUrl(path: string): string {
  const canliMi = typeof window !== "undefined"
    && window.location.protocol === "https:"
    && window.location.hostname !== "localhost"
    && window.location.hostname !== "127.0.0.1";
  return canliMi ? `/api/quran/${path}` : `${QURAN_UPSTREAM}/${path}`;
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
// ★ BELLEK SINIRI (tam tarama 29.09): 1500 ayet ≈ birkaç MB — geçince en eskiler atılır
const AYAH_CACHE_SINIR = 1500;
function ayahCacheKoy(key: string, deger: { ar: string; tr: string }) {
  ayahCache.set(key, deger);
  if (ayahCache.size > AYAH_CACHE_SINIR) {
    const silinecek = [...ayahCache.keys()].slice(0, ayahCache.size - AYAH_CACHE_SINIR);
    for (const k of silinecek) ayahCache.delete(k);
  }
}
let pendingFetches = 0;
let frameCount = 0;
const MAX_PARALLEL = 4; // en fazla 4 paralel istek (daha hızlı yükleme)
const THROTTLE_MS = 250; // her istek arasında minimum 250ms (eskisi 600ms çok yavaştı)
let lastFetchTime = 0;

export function normalizeTurkishMeal(text: string, edition: string): string {
  if (!edition.startsWith("tr.")) return text;
  return text
    .replace(/\bTanrınız\b/gi, "Allah'ınız")
    .replace(/\bTanrıdır\b/gi, "Allah'tır")
    .replace(/\bTanrıya\b/gi, "Allah'a")
    .replace(/\bTanrının\b/gi, "Allah'ın")
    .replace(/\bTanrıyı\b/gi, "Allah'ı")
    .replace(/\bTanrıdan\b/gi, "Allah'tan")
    .replace(/\bTanr[ıi]\b/gi, "Allah");
}

function throttle(): Promise<void> {
  const now = Date.now();
  const wait = Math.max(0, THROTTLE_MS - (now - lastFetchTime));
  lastFetchTime = now + wait;
  return wait > 0 ? new Promise((r) => setTimeout(r, wait)) : Promise.resolve();
}

// ════════════════════════════════════════════════════════
// ★ TÜRKÇE MEAL FALLBACK (28.09) — tr.diyanet kayması koruması
//   Kanıt (28.09 canlı tarama): tek-ayet + sure-array endpoint'leri hizalı;
//   ama API bir edition'da kayma/eksik dönerse (geçmişte yaşandı) kullanıcı
//   YANLIŞ ayet çevirisi görebilir. Kural: birincil edition şüpheliyse
//   sırayla tr.yazir → tr.vakfi denenir; şüpheli yanıt KABUL EDİLMEZ.
// ════════════════════════════════════════════════════════

import { mealDuzelt } from "../meal_fixes"; // ★ Diyanet meal yaması (02.10): 19/103/105/108 için API bozuksa gerçek meal

const TURKCE_MEAL_YEDEKLERI: Record<string, string[]> = {
  "tr.diyanet": ["tr.yazir", "tr.vakfi"],
  "tr.yazir": ["tr.vakfi", "tr.diyanet"],
  "tr.vakfi": ["tr.yazir", "tr.diyanet"],
};

/** Birincil meal başarısız/şüpheli ise denenecek yedek edition'lar (Türkçe değilse boş) */
export function turkceMealYedekleri(edition: string): string[] {
  return edition.startsWith("tr.") ? (TURKCE_MEAL_YEDEKLERI[edition] ?? ["tr.yazir", "tr.vakfi"]) : [];
}

/**
 * Meal metni sağlıklı mı? (kayma/eksiklik belirtileri)
 *  - boş ya da 10 karakterden kısa çeviri → şüpheli
 *  - diyanet çevirisi ":" ile biterse cümle kesik demektir → şüpheli
 */
export function mealSaglikliMi(text: string, edition: string): boolean {
  const t = (text ?? "").trim();
  if (!t || t.length < 10) return false;
  if (edition === "tr.diyanet" && t.endsWith(":")) return false;
  return true;
}

export async function fetchAyah(surah: number, ayah: number, edition = "tr.yazir"): Promise<{ ar: string; tr: string }> {
  const key = `${surah}:${ayah}:${edition}`;
  const cached = ayahCache.get(key);
  if (cached) { if (frameCount++ % 20 === 0) console.log("[fetchAyah] Cache hit:", key); return cached; }

  // ★ Throttling — çok fazla paralel isteği engelle
  while (pendingFetches >= MAX_PARALLEL) {
    await new Promise((r) => setTimeout(r, 300));
  }
  await throttle();
  pendingFetches++;

  // ★ FALLBACK ZİNCİRİ: birincil edition şüpheli/başarısızsa yedekler sırayla denenir
  const denenecekler = [edition, ...turkceMealYedekleri(edition)];
  try {
    let sonAr = "";
    let sonTr = "";
    for (const ed of denenecekler) {
      try {
        await throttle();
        const json = await fetchJSON(quranUrl(`v1/ayah/${surah}:${ayah}/editions/quran-uthmani,${ed}`)) as { data?: Array<{ text: string }> };
        const ar = metniTemizle((json.data?.[0]?.text ?? "") as string);
        const tr = normalizeTurkishMeal(metniTemizle((json.data?.[1]?.text ?? "") as string), ed);
        if (ar) sonAr = ar;
        if (tr) sonTr = tr;
        // ★ Kabul koşulu: Arapça VAR ve çeviri SAĞLIKLI (kayma şüphesi yok)
        if (ar && mealSaglikliMi(tr, ed)) {
          // ★ MEAL YAMASI (02.10): API Diyanet edition'da bozuk/aynı-meal dönerse tablodaki
          //   gerçek Diyanet metni kullan (yalnız tr.diyanet, yalnız tabloda kayıtlı sureler)
          const trYamali = ed === "tr.diyanet" ? mealDuzelt(surah, ayah, tr) : tr;
          const result = { ar, tr: trYamali };
          ayahCacheKoy(key, result);
          if (ed !== edition) console.warn(`[fetchAyah] FALLBACK: ${key} → ${ed} kullanıldı (birincil ${edition} sağlıksız)`);
          console.log("[fetchAyah] Başarılı:", key, "ar:", ar.length, "tr:", tr.length);
          return result;
        }
        console.warn(`[fetchAyah] Meal şüpheli/eksik (${ed}) — yedek edition denenir:`, key, tr ? tr.slice(0, 60) : "(çeviri boş)");
      } catch (e) {
        console.warn(`[fetchAyah] Edition başarısız (${ed}):`, key, (e as Error).message);
      }
    }
    // Tüm editionlar denendi: Arapça geldiyse onunla dön (eskiden de ar||tr kabul ediliyordu)
    if (sonAr) {
      const result = { ar: metniTemizle(sonAr), tr: sonTr };
      ayahCacheKoy(key, result);
      return result;
    }
    // ★ 2. SAĞLAYICI YEDEĞİ (01.10): alquran.cloud tamamen düşükse/CORS verirse api.quran.com
    //   dene — "günün ayeti yükleniyor" sonsuz döngüsü ve hafızlık boş soru vakalarını kapatır.
    const yedek = await quranComAyah(surah, ayah, edition);
    if (yedek) {
      console.warn(`[fetchAyah] 2. SAĞLAYICI: ${key} api.quran.com'dan geldi (alquran.cloud sağlıksız)`);
      ayahCacheKoy(key, yedek);
      return yedek;
    }
    console.error("[fetchAyah] Tüm editionlar başarısız:", key);
    return { ar: "", tr: "" };
  } finally {
    pendingFetches--;
  }
}

/** ★ 2. SAĞLAYICI (01.10): api.quran.com — meşhur, ACAO:* açık API. Edition → quran.com
 *  translation id haritası (curl ile doğrulandı): 77=Diyanet TR, 52=Elmalılı, 124=Shahin,
 *  20=Saheeh EN, 33=Endonezce, 234=Jalandhry UR. Arapça metin text_uthmani'den gelir.
 *  Birincil sağlayıcı ölürse tüm ayet çekimleri (günün ayeti, hafızlık, mealler) buraya düşer. */
const QURAN_COM_TRANSLATION: Record<string, number | null> = {
  "tr.diyanet": 77,
  "tr.yazir": 52,
  "tr.vakfi": 124,
  "en.sahih": 20,
  "id.indonesian": 33,
  "ur.jalandhry": 234,
};

export async function quranComAyah(surah: number, ayah: number, edition = "tr.yazir"): Promise<{ ar: string; tr: string } | null> {
  try {
    const tid = QURAN_COM_TRANSLATION[edition];
    // Arapça: by_key + fields=text_uthmani → { verse: { text_uthmani } } (canlıda doğrulandı)
    const arJson = await fetchJSON(`https://api.quran.com/api/v4/verses/by_key/${surah}:${ayah}?fields=text_uthmani`) as { verse?: { text_uthmani?: string } };
    const ar = metniTemizle(arJson.verse?.text_uthmani ?? "");
    if (!ar) return null;
    // Çeviri: by_key çeviriyi döndürmüyor (canlı test) → bölüm bazlı uc: /quran/translations/{id}?chapter_number={s}
    // yanıt: { translations: [{ resource_id, text }, …] } — ayet sırasına göre hizalı
    let tr = "";
    if (tid) {
      const trJson = await fetchJSON(`https://api.quran.com/api/v4/quran/translations/${tid}?chapter_number=${surah}`) as { translations?: Array<{ text?: string }> };
      const liste = trJson.translations ?? [];
      // quran.com çeviri metni <sup foot_note> vb. HTML kalıntıları içerebilir — temizle
      tr = normalizeTurkishMeal(metniTemizle((liste[ayah - 1]?.text ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ")), edition);
    } else {
      tr = ar; // arapça edition: çeviri yerine metnin kendisi
    }
    if (!tr) return null;
    return { ar, tr };
  } catch {
    return null;
  }
}

/** Tek edition için sure verisi — editions endpoint + tek-tek yedek endpoint.
 *  ★ 429 KORUMASI (28.09): throttle'suz istek alquran.cloud Limit'ine takılıyordu
 *  (canlı tarama: Kolay havuzunun 15/38 suresi HTTP 429 → "soru hazırlanamadı").
 *  Artık her istek öncesi throttle + 429 gelirse yedek istekle dövmez, yukarı fırlatır. */
async function surahHamCek(surah: number, edition: string): Promise<{ name: string; arabic: Array<{ text: string; numberInSurah?: number; juz?: number; page?: number }>; translated: Array<{ text: string }> } | null> {
  try {
    await throttle();
    const json = await fetchJSON(quranUrl(`v1/surah/${surah}/editions/quran-uthmani,${edition}`)) as { data?: Array<{ name?: string; ayahs?: Array<{ text: string; numberInSurah?: number; juz?: number; page?: number }> }> };
    const arabic = json.data?.[0]?.ayahs ?? [];
    const translated = json.data?.[1]?.ayahs ?? [];
    if (arabic.length && translated.length) return { name: String(json.data?.[0]?.name ?? ""), arabic, translated };
  } catch (e) {
    if ((e as Error & { status?: number })?.status === 429) throw e; // limite takıldık — yedek istekle dövme
    /* yedek endpoint denenir */
  }
  try {
    await throttle();
    const [arabicJson, translatedJson] = await Promise.all([
      fetchJSON(quranUrl(`v1/surah/${surah}/quran-uthmani`)),
      fetchJSON(quranUrl(`v1/surah/${surah}/${edition}`)),
    ]) as [{ data?: { name?: string; ayahs?: Array<{ text: string; numberInSurah?: number; juz?: number; page?: number }> } }, { data?: { ayahs?: Array<{ text: string }> } }];
    const arabic = arabicJson.data?.ayahs ?? [];
    const translated = translatedJson.data?.ayahs ?? [];
    if (arabic.length && translated.length) return { name: String(arabicJson.data?.name ?? ""), arabic, translated };
  } catch { /* sıradaki edition */ }
  return null;
}

export interface SureEditionData {
  name: string;
  arabic: Array<{ n: number; text: string; juz: number; page: number }>;
  tr: string[]; // arabic ile birebir aynı uzunlukta (hizalama doğrulanır)
  edition: string; // fiilen kullanılan edition (fallback sonrası farklı olabilir)
  fallbackUsed: boolean;
}

/**
 * Sure + meal verisi — KAYMA KORUMALI.
 * Birincil edition'da (1) ayet sayısı uyuşmazsa veya (2) Türkçe çevirilerin
 * >%20'si boşsa yedek edition (tr.yazir → tr.vakfi) denenir; uyan ilk edition dönülür.
 */
// ★ SURE CACHE (28.09): aynı sure tekrar istenirse API'ye gitmeden dön — 429 fırtınasını
// keser (hafızlık testi + Kur'an öğren/dinle ortak kullanır). İçerik değişmez veri.
const sureCache = new Map<string, SureEditionData>();
// ★ BELLEK SINIRI (tam tarama 29.09): sınırsız Map uzun oturumda şişer (114 sure ×
//   4 meal × Bakara 286 ayet ≈ yüzlerce KB). FIFO: 320 kaydı geçince en eskiler atılır —
//   içerik değişmez veri olduğu için bayatlık riski yok, yalnız bellek korunur.
const SURE_CACHE_SINIR = 320;

// ★ BOM TEMİZLİĞİ (01.10): alquran.cloud bazı metinlerin başına görünmez U+FEFF (BOM)
//   basıyor — canvas ölçümünü bozup Arapça satırların çizilmemesine yol açıyordu
//   ("Tüm Sureyi Ekle"de Fâtiha ayetleri boş görünüyordu). Her ayet/sure metninden sıyrılır.
export const metniTemizle = (t: string): string => String(t ?? "").replace(/\uFEFF/g, "").trim();

export async function fetchSurahEditions(surah: number, edition: string): Promise<SureEditionData> {
  const cacheKey = `${surah}:${edition}`;
  const cacheHit = sureCache.get(cacheKey);
  if (cacheHit) return cacheHit;
  const denenecekler = [edition, ...turkceMealYedekleri(edition)];
  for (const ed of denenecekler) {
    let ham: Awaited<ReturnType<typeof surahHamCek>>;
    try {
      ham = await surahHamCek(surah, ed);
    } catch (e) {
      if ((e as Error & { status?: number })?.status === 429) throw e; // limite takıldık — diğer editionu da deneme
      continue;
    }
    if (!ham) continue;
    if (ham.arabic.length !== ham.translated.length) {
      console.warn(`[fetchSurahEditions] Ayet sayısı uyuşmuyor (${ed}): ar=${ham.arabic.length} tr=${ham.translated.length} — yedek edition denenir`);
      continue;
    }
    // Boş çeviri oranı — tüm editionlarda kayma işareti
    const bosSayi = ham.translated.filter((t) => !(t.text ?? "").trim()).length;
    if (ham.translated.length && bosSayi / ham.translated.length > 0.2) {
      console.warn(`[fetchSurahEditions] Çevirilerin ${Math.round((bosSayi / ham.translated.length) * 100)}%'i boş (${ed}) — yedek edition denenir`);
      continue;
    }
    if (ed !== edition) console.warn(`[fetchSurahEditions] FALLBACK: sure ${surah} → ${ed} kullanıldı (birincil ${edition} sağlıksız)`);
    const sonuc: SureEditionData = {
      name: ham.name,
      arabic: ham.arabic.map((a) => ({ n: Number(a.numberInSurah) || 0, text: metniTemizle(a.text), juz: Number(a.juz) || 0, page: Number(a.page) || 0 })),
      // ★ MEAL YAMASI (02.10): tr.diyanet'te tablo kaydı varsa API metni gerçek Diyanet mealıyla değişir
      tr: ham.translated.map((t, i) => {
        const metin = normalizeTurkishMeal(metniTemizle(t.text), ed);
        return ed === "tr.diyanet" ? mealDuzelt(surah, i + 1, metin) : metin;
      }),
      edition: ed,
      fallbackUsed: ed !== edition,
    };
    sureCache.set(cacheKey, sonuc);
    if (sureCache.size > SURE_CACHE_SINIR) {
      const silinecek = [...sureCache.keys()].slice(0, sureCache.size - SURE_CACHE_SINIR);
      for (const k of silinecek) sureCache.delete(k);
    }
    return sonuc;
  }
  throw new Error("SURAH_EMPTY");
}

export async function fetchSurah(surah: number, edition: string): Promise<Array<{ ar: string; tr: string }>> {
  const d = await fetchSurahEditions(surah, edition);
  return d.arabic.map((a, i) => ({ ar: a.text, tr: d.tr[i] ?? "" }));
}
