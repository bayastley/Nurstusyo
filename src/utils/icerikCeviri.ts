// ════════════════════════════════════════════════════════
// ICERIKCEVIRI.TS — İçerik çeviri istemcisi (5 dil)
// Yol haritası: "her içerik 5 dilde" — İlmihal ve İslam Tarihi metinleri
// TR asıl metinden en/ar/id/ur dillerine çevrilir.
//
// • api/ai/kissa-cevir.ts ile aynı sağlayıcı: MyMemory (anahtarsız, ücretsiz)
// • Sonuçlar cihazda localStorage'da kalıcı önbelleğe alınır → aynı metin
//   bir daha istenmez; site yavaşlamaz, kota tükenmez.
// • Çeviri gelmezse TR metin gösterilir (site asla boş kalmaz).
// • Aynı metin için eşzamanlı istek tekilleştirilir (in-flight dedupe).
// ════════════════════════════════════════════════════════

export type IcerikDil = "en" | "ar" | "id" | "ur";
export const ICERIK_DILLERI: IcerikDil[] = ["en", "ar", "id", "ur"];

const ONEK = "nur_icerik_ceviri_v1";
const ES_ZAMANLI = 3; // MyMemory anonim kotasını yakmamak için paralel istek sınırı

let aktifIstek = 0;
const bekleyenler: Array<() => void> = [];
async function sirayaGir(): Promise<void> {
  if (aktifIstek < ES_ZAMANLI) { aktifIstek++; return; }
  await new Promise<void>((coz) => bekleyenler.push(coz));
  aktifIstek++;
}
function siradanCik(): void {
  aktifIstek--;
  const sonraki = bekleyenler.shift();
  if (sonraki) sonraki();
}

function hash(metin: string): string {
  let h = 5381;
  for (let i = 0; i < metin.length; i++) h = ((h << 5) + h + metin.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

function anahtar(dil: IcerikDil, metin: string): string {
  return `${ONEK}:${dil}:${hash(metin)}:${metin.length}`;
}

function bellek(): Storage | null {
  try { return typeof localStorage !== "undefined" ? localStorage : null; } catch { return null; }
}

export function onbellektenCeviri(metin: string, dil: IcerikDil): string | null {
  if (!metin) return null;
  try { return bellek()?.getItem(anahtar(dil, metin)) ?? null; } catch { return null; }
}

function onbellegeYaz(metin: string, dil: IcerikDil, ceviri: string): void {
  try { bellek()?.setItem(anahtar(dil, metin), ceviri); } catch { /* kota dolabilir — yoksay */ }
}

/** MyMemory bazen HTML varlığı döndürür (&quot; &#39; &amp;) — düz metne çevir. */
function varliklariCoz(t: string): string {
  return t
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .trim();
}

const UCAN = new Map<string, Promise<string>>();

async function hamCevir(metin: string, dil: IcerikDil): Promise<string> {
  const u = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(metin.slice(0, 480))}&langpair=tr%7C${dil}`;
  try {
    const r = await fetch(u, { signal: AbortSignal.timeout(12000) });
    if (!r.ok) return metin;
    const j = (await r.json()) as { responseData?: { translatedText?: string }; responseStatus?: number | string };
    const t = varliklariCoz(String(j?.responseData?.translatedText ?? ""));
    // Sağlayıcı hata mesajlarını "çeviri" diye göstermeyelim
    if (!t || /MYMEMORY WARNING|INVALID|QUERY LENGTH LIMIT/i.test(t)) return metin;
    return t;
  } catch {
    return metin;
  }
}

/** Tek metni çevirir: önbellek → uçuştaki istek → MyMemory → TR fallback. */
export async function metinCevir(metin: string, dil: IcerikDil): Promise<string> {
  const temiz = metin.trim();
  if (!temiz) return metin;
  const onbellek = onbellektenCeviri(temiz, dil);
  if (onbellek) return onbellek;

  const k = `${dil}|${temiz}`;
  const ucusta = UCAN.get(k);
  if (ucusta) return ucusta;

  const is = (async () => {
    await sirayaGir();
    try {
      const ceviri = await hamCevir(temiz, dil);
      if (ceviri && ceviri !== temiz) onbellegeYaz(temiz, dil, ceviri);
      return ceviri || temiz;
    } finally {
      siradanCik();
      UCAN.delete(k);
    }
  })();

  UCAN.set(k, is);
  return is;
}

/** Önbellekte olanları hazır döndürür (ilk render'da beklemesiz gösterim için). */
export function onbellekHaritasi(metinler: string[], dil: IcerikDil): Record<string, string> {
  const h: Record<string, string> = {};
  for (const m of metinler) {
    const c = onbellektenCeviri(m, dil);
    if (c) h[m] = c;
  }
  return h;
}
