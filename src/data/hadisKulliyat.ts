// ═══════════════════════════════════════════════════════════════
// HADISKULLIYAT.TS — gerçek külliyat bağlantısı (uydurma veri YOK)
//
// ★ 27.11 (kullanıcı emri: "1000 yap … niye hepsini bağlamıyorsun",
//   sonra "türkçesi olması zorunlu değil arapça kalsın, altta da dil
//   seçimine göre çevirisi olsun"):
//   • ARAPÇA METİN SABİT — her rivayet `ara-*` edition'dan gelir.
//   • Altında seçili dilin çevirisi: tr→tur, en→eng, id→ind, ur→urd.
//     Çevirisi olmayan külliyatta (Nevevî: ind/urd yok) TR'ye düşer.
//   • Kitap adları: Sünnetimiz /api/v1/books/{slug} (Türkçe kitap adı).
//   İkisi de anahtarsız, CORS açık. Veri koda gömülmez; bir kez indirilip
//   IndexedDB'de saklanır, sonraki açılışta internet gerekmez.
// ═══════════════════════════════════════════════════════════════

import { translate, type Lang } from "../i18n";

export type KulliyatTanimi = {
  /** Sünnetimiz + bizim kısa ad (slug) */
  slug: string;
  /** jsDelivr edition adı (Türkçe olan) — Arapça adı bundan türetilir */
  edition: string;
  /** i18n anahtarı — kitap adı 5 dilde buradan gelir (ad = TR yedeği) */
  adAnahtar: string;
  ad: string;
  emoji: string;
  /** Külliyattaki hadis sayısı (Sünnetimiz /api/v1/books raporu, 26.11.2026) */
  adet: number;
  /** Yaklaşık indirme boyutu (MB) — Arapça + çeviri */
  mb: number;
  /** Kitâb adları başka bir Sünnetimiz kaydından alınacaksa (ör. kirkhadis) */
  kitapSlug?: string;
};

export const KULLIYATLAR: KulliyatTanimi[] = [
  { slug: "buhari", edition: "tur-bukhari", adAnahtar: "ksKulliyatAd_buhari", ad: "Sahih-i Buhârî", emoji: "📗", adet: 7583, mb: 20 },
  { slug: "muslim", edition: "tur-muslim", adAnahtar: "ksKulliyatAd_muslim", ad: "Sahih-i Müslim", emoji: "📘", adet: 7603, mb: 15 },
  { slug: "ebudavud", edition: "tur-abudawud", adAnahtar: "ksKulliyatAd_ebudavud", ad: "Sünen-i Ebû Dâvûd", emoji: "📕", adet: 5274, mb: 11 },
  { slug: "tirmizi", edition: "tur-tirmidhi", adAnahtar: "ksKulliyatAd_tirmizi", ad: "Sünen-i Tirmizî", emoji: "📙", adet: 3998, mb: 10 },
  { slug: "nesai", edition: "tur-nasai", adAnahtar: "ksKulliyatAd_nesai", ad: "Sünen-i Nesâî", emoji: "📒", adet: 5765, mb: 8 },
  { slug: "ibnmace", edition: "tur-ibnmajah", adAnahtar: "ksKulliyatAd_ibnmace", ad: "Sünen-i İbn Mâce", emoji: "📓", adet: 4343, mb: 9 },
  // ★ 27.11: Kütüb-i Tis'a + meşhur seçkiler.
  { slug: "malik", edition: "tur-malik", adAnahtar: "ksKulliyatAd_malik", ad: "Muvatta' (İmâm Mâlik)", emoji: "📔", adet: 1838, mb: 3 },
  { slug: "nevevi", edition: "tur-nawawi", adAnahtar: "ksKulliyatAd_nevevi", ad: "Nevevî — Kırk Hadis", emoji: "📜", adet: 42, mb: 1, kitapSlug: "kirkhadis" },
];

/** Bütün külliyatlardaki rivayet sayısı toplamı (ara yüz başlığı için) */
export const KULLIYAT_TOPLAM = KULLIYATLAR.reduce((t, k) => t + k.adet, 0);

export type KulliyatHadis = {
  /** Külliyattaki hadis numarası (buhari:5866 gibi) */
  no: number;
  /** Kitâb (bölüm) numarası — Sünnetimiz'in Türkçe adıyla eşlenir */
  kitap: number;
  /** ARAPÇA metin — her zaman sabit, asıl rivayet */
  ar: string;
  /** Seçili dilde çeviri — yoksa boş string */
  ceviri: string;
};

export type KulliyatVeri = {
  surum: 2;
  slug: string;
  ad: string;
  /** Çevirinin dili (ar = yalnız Arapça) */
  dil: Lang;
  kitaplar: Array<{ no: number; ad: string }>;
  hadisler: KulliyatHadis[];
  indirildi: number;
};

/** Arapça taban veri (tek sefer indirilir, bütün diller için ortak) */
type TabanHadis = { no: number; kitap: number; ar: string };
type KulliyatTaban = {
  surum: 2;
  slug: string;
  kitaplar: Array<{ no: number; ad: string }>;
  /** Arapça baskının bölüm adları (eski önbelleklerde yok) */
  bolumler?: Record<string, string>;
  hadisler: TabanHadis[];
  indirildi: number;
};

const CDN = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions";
const SUNNETIMIZ = "https://sunnetimiz.com/api/v1";

/** Uygulama dili → CDN edition öneki */
const DIL_EDITION: Record<Lang, string> = { tr: "tur", en: "eng", ar: "ara", id: "ind", ur: "urd" };

/** CDN'de o dilde çevirisi olmayan külliyatlar → TR'ye düşer (uydurma yok) */
const CEVIRI_YOK: Partial<Record<string, Lang[]>> = { nevevi: ["id", "ur"] };

// ── IndexedDB (küçük yardımcı; kütüphane yok) ────────────────────
const DB_AD = "nurstudyo-kulliyat";
const DEPO = "veri";
let dbSoz: Promise<IDBDatabase | null> | null = null;

function dbAc(): Promise<IDBDatabase | null> {
  if (dbSoz) return dbSoz;
  dbSoz = new Promise((cozum) => {
    try {
      if (typeof indexedDB === "undefined") return cozum(null);
      const istek = indexedDB.open(DB_AD, 1);
      istek.onupgradeneeded = () => {
        const db = istek.result;
        if (!db.objectStoreNames.contains(DEPO)) db.createObjectStore(DEPO);
      };
      istek.onsuccess = () => cozum(istek.result);
      istek.onerror = () => cozum(null);
    } catch {
      cozum(null);
    }
  });
  return dbSoz;
}

async function onbellekOku<T>(anahtar: string): Promise<T | null> {
  const db = await dbAc();
  if (!db) return null;
  return new Promise((cozum) => {
    try {
      const istek = db.transaction(DEPO, "readonly").objectStore(DEPO).get(anahtar);
      istek.onsuccess = () => cozum((istek.result as T) ?? null);
      istek.onerror = () => cozum(null);
    } catch {
      cozum(null);
    }
  });
}

async function onbellekYaz(anahtar: string, deger: unknown): Promise<void> {
  const db = await dbAc();
  if (!db) return;
  await new Promise<void>((cozum) => {
    try {
      const istek = db.transaction(DEPO, "readwrite").objectStore(DEPO).put(deger, anahtar);
      istek.onsuccess = () => cozum();
      istek.onerror = () => cozum();
    } catch {
      cozum();
    }
  });
}

/** Cihazda hazır mı (düğmede ✓ rozeti için) — Arapça taban + istenen dil */
export async function kulliyatOnbellekte(slug: string, dil: Lang = "tr"): Promise<boolean> {
  const taban = await onbellekOku<KulliyatTaban>(`taban:v2:${slug}`);
  if (!taban?.hadisler?.length) return false;
  const ed = ceviriEdition(slug, dil);
  if (!ed) return true;
  const harita = await onbellekOku<Record<string, string>>(`ceviri:v2:${slug}:${ed}`);
  return !!harita && Object.keys(harita).length > 0;
}

// ── Getirme ─────────────────────────────────────────────────────
/** Birleşik veri (slug:dil) */
const BELLEK = new Map<string, KulliyatVeri>();
/** Arapça taban */
const TABAN = new Map<string, KulliyatTaban>();
/** Çeviri haritaları + o dilin bölüm (konu) adları (slug:edition) */
const CEVIRI = new Map<string, CeviriPaket>();
/** Uçuştaki istekler — aynı dosya iki kez indirilmesin */
const UCUS = new Map<string, Promise<unknown>>();

type CdnHadis = { hadithnumber?: number; text?: string; reference?: { book?: number; hadith?: number } };
/** Bir edition dosyasından çıkanlar: rivayetler + bölüm adları */
type CdnPaket = { hadisler: CdnHadis[]; bolumler: Record<string, string> };
/** Seçili dilin çevirisi + bölüm adları */
type CeviriPaket = { harita: Record<string, string>; bolumler: Record<string, string> };
type SunnetimizKitap = { number: number; title: string };

function tekUcus<T>(anahtar: string, is: () => Promise<T>): Promise<T> {
  const varOlan = UCUS.get(anahtar);
  if (varOlan) return varOlan as Promise<T>;
  const soz = is().finally(() => UCUS.delete(anahtar));
  UCUS.set(anahtar, soz);
  return soz;
}

async function kitapAdlari(slug: string): Promise<SunnetimizKitap[]> {
  try {
    const r = await fetch(`${SUNNETIMIZ}/books/${encodeURIComponent(slug)}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok) return [];
    const j = (await r.json()) as { kitabs?: Array<{ number?: number; title?: string }> };
    return (j.kitabs ?? [])
      .map((k) => ({ number: Number(k.number), title: String(k.title ?? "").trim() }))
      .filter((k) => Number.isFinite(k.number) && k.title.length > 0);
  } catch {
    return [];
  }
}

/** Külliyatın CDN kitap kodu: "tur-bukhari" → "bukhari" */
function kitapKodu(tanim: KulliyatTanimi): string {
  return tanim.edition.split("-")[1] ?? tanim.slug;
}

/** Bu dil için indirilecek çeviri edition'ı; ar → null (Arapça zaten taban) */
function ceviriEdition(slug: string, dil: Lang): string | null {
  if (dil === "ar") return null;
  const yokMu = CEVIRI_YOK[slug]?.includes(dil);
  const ek = yokMu ? "tur" : DIL_EDITION[dil] ?? "tur";
  const tanim = KULLIYATLAR.find((k) => k.slug === slug);
  const kod = tanim ? kitapKodu(tanim) : slug;
  return `${ek}-${kod}`;
}

async function cdnOku(edition: string): Promise<CdnPaket> {
  const cevap = await fetch(`${CDN}/${edition}.min.json`, { signal: AbortSignal.timeout(60000) });
  if (!cevap.ok) throw new Error(`Külliyat indirilemedi (${cevap.status})`);
  const govde = (await cevap.json()) as {
    hadiths?: CdnHadis[];
    metadata?: { sections?: Record<string, string> };
  };
  // ★ Bölüm (konu) adları edition'ın kendi dilinde gelir: "Îmân" / "Belief" / "الإيمان"
  const bolumler: Record<string, string> = {};
  for (const [no, ad] of Object.entries(govde.metadata?.sections ?? {})) {
    const temiz = String(ad ?? "").trim();
    if (temiz) bolumler[no] = temiz;
  }
  return { hadisler: govde.hadiths ?? [], bolumler };
}

function metniTemizle(metin: string | undefined): string {
  return (metin ?? "").replace(/\s+/g, " ").trim();
}

/** Arapça tabanı getir: cihaz belleği → IndexedDB → internet */
function tabanGetir(tanim: KulliyatTanimi, ilerleme?: (y: number | null) => void): Promise<KulliyatTaban> {
  const bellekte = TABAN.get(tanim.slug);
  if (bellekte) return Promise.resolve(bellekte);
  return tekUcus(`taban:${tanim.slug}`, async () => {
    const onbellek = await onbellekOku<KulliyatTaban>(`taban:v2:${tanim.slug}`);
    if (onbellek?.hadisler?.length) {
      TABAN.set(tanim.slug, onbellek);
      return onbellek;
    }

    ilerleme?.(null);
    const [kitaplarHam, arapca] = await Promise.all([
      kitapAdlari(tanim.kitapSlug ?? tanim.slug),
      cdnOku(`ara-${kitapKodu(tanim)}`),
    ]);
    ilerleme?.(90);

    const hadisler: TabanHadis[] = [];
    for (const h of arapca.hadisler) {
      const ar = metniTemizle(h.text);
      if (ar.length < 3) continue;
      const no = Number(h.hadithnumber ?? h.reference?.hadith ?? 0);
      if (!Number.isFinite(no) || no <= 0) continue;
      hadisler.push({ no, kitap: Number(h.reference?.book ?? 0), ar });
    }
    hadisler.sort((a, b) => a.no - b.no);

    const veri: KulliyatTaban = {
      surum: 2,
      slug: tanim.slug,
      kitaplar: kitaplarHam.map((k) => ({ no: k.number, ad: k.title })),
      bolumler: arapca.bolumler,
      hadisler,
      indirildi: Date.now(),
    };
    TABAN.set(tanim.slug, veri);
    ilerleme?.(100);
    await onbellekYaz(`taban:v2:${tanim.slug}`, veri);
    return veri;
  });
}

/** Seçili dilin çevirisini getir (hadis no → metin) */
function ceviriGetir(
  tanim: KulliyatTanimi,
  dil: Lang,
  ilerleme?: (y: number | null) => void,
): Promise<CeviriPaket> {
  const edition = ceviriEdition(tanim.slug, dil);
  if (!edition) return Promise.resolve({ harita: {}, bolumler: {} });
  const anahtar = `${tanim.slug}:${edition}`;
  const bellekte = CEVIRI.get(anahtar);
  if (bellekte) return Promise.resolve(bellekte);
  return tekUcus(`ceviri:${anahtar}`, async () => {
    const onbellek = await onbellekOku<Record<string, string>>(`ceviri:v2:${anahtar}`);
    if (onbellek && Object.keys(onbellek).length > 0) {
      // ★ Bölüm adları ayrı tutulur; eski önbellekte yoksa Türkçe adlara düşülür.
      const bolumler = (await onbellekOku<Record<string, string>>(`bolum:v2:${anahtar}`)) ?? {};
      const paket: CeviriPaket = { harita: onbellek, bolumler };
      CEVIRI.set(anahtar, paket);
      return paket;
    }

    ilerleme?.(10);
    const ham = await cdnOku(edition);
    ilerleme?.(80);
    const harita: Record<string, string> = {};
    for (const h of ham.hadisler) {
      const metin = metniTemizle(h.text);
      if (metin.length < 3) continue;
      const no = Number(h.hadithnumber ?? h.reference?.hadith ?? 0);
      if (!Number.isFinite(no) || no <= 0) continue;
      harita[String(no)] = metin;
    }
    const paket: CeviriPaket = { harita, bolumler: ham.bolumler };
    CEVIRI.set(anahtar, paket);
    ilerleme?.(100);
    await onbellekYaz(`ceviri:v2:${anahtar}`, harita);
    if (Object.keys(ham.bolumler).length > 0) {
      await onbellekYaz(`bolum:v2:${anahtar}`, ham.bolumler);
    }
    return paket;
  });
}

/**
 * Külliyatı getirir: Arapça taban + seçili dilin çevirisi.
 * `ilerleme` 0–100 arası yüzde verir (bilinmiyorsa null).
 * Aynı dosya iki yerden istenirse tek indirme yapılır.
 */
export function kulliyatGetir(
  slug: string,
  dil: Lang = "tr",
  ilerleme?: (yuzde: number | null) => void,
): Promise<KulliyatVeri> {
  const anahtar = `${slug}:${dil}`;
  return tekUcus(anahtar, async () => {
    const bellekte = BELLEK.get(anahtar);
    if (bellekte) return bellekte;

    const tanim = KULLIYATLAR.find((k) => k.slug === slug);
    if (!tanim) throw new Error(`Bilinmeyen külliyat: ${slug}`);

    ilerleme?.(null);
    const taban = await tabanGetir(tanim, (y) => ilerleme?.(y === null ? null : Math.round(y * 0.55)));
    const { harita, bolumler } = await ceviriGetir(tanim, dil, (y) =>
      ilerleme?.(y === null ? null : 55 + Math.round(y * 0.45)),
    );

    const hadisler: KulliyatHadis[] = taban.hadisler.map((h) => ({
      ...h,
      ceviri: harita[String(h.no)] ?? "",
    }));

    // ★ Konu (bölüm) adları seçili dilde: TR'de Sünnetimiz'in kısa Türkçe adı,
    //   diğer dillerde edition'ın kendi bölüm adı; Arapça'da Arapça baskınınki.
    const yerelBolumler = dil === "ar" ? (taban.bolumler ?? {}) : bolumler;
    const kitaplar =
      dil === "tr"
        ? taban.kitaplar
        : taban.kitaplar.map((k) => ({
            no: k.no,
            ad: yerelBolumler[String(k.no)]?.trim() || k.ad,
          }));

    const veri: KulliyatVeri = {
      surum: 2,
      slug,
      // ★ 28.11: külliyat adı da seçili dilde (8 kitap × 5 dil sözlükte)
      ad: translate(dil, tanim.adAnahtar),
      dil,
      kitaplar,
      hadisler,
      indirildi: Date.now(),
    };
    BELLEK.set(anahtar, veri);
    ilerleme?.(100);
    return veri;
  });
}

/** Kitâb numarasından Türkçe ad ("Kitâbü'l-Îmân" → "Îmân") */
export function kitapAdi(veri: KulliyatVeri, no: number): string {
  return veri.kitaplar.find((k) => k.no === no)?.ad ?? "";
}

/** sunnah.com'un kendi kitap kısaltmaları (bizim slug'dan farklı olanlar) */
const SUNNAH_SLUG: Record<string, string> = { nevevi: "nawawi40" };

/** sunnah.com kalıcı bağlantısı (numaralar birebir aynı) */
export function hadisBaglantisi(slug: string, no: number): string {
  return `https://sunnah.com/${SUNNAH_SLUG[slug] ?? slug}:${no}`;
}
