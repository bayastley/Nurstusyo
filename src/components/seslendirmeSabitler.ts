// ═══════════════════════════════════════════════════════════════
// SESLENDİRME SABİTLERİ & TİPLERİ — SeslendirmeModal.tsx'ten çıkarıldı (14.10)
// ★ ÇİFT MOD (18.10): /nur-tts/… artık İKİ kaynakla karşılanır —
//     1) DEV:   Vite proxy → http://127.0.0.1:8877 (python meal-sunucu.py)
//     2) CANLI: /api/nur-tts/* serverless (msedge-tts + Upstash mp3 cache)
//   ttsUrl() otomatik seçer: import.meta.env.DEV ? '/nur-tts/…' : '/api/nur-tts/…'
// ═══════════════════════════════════════════════════════════════

/** DEV → Vite proxy; PROD → /api/nur-tts serverless (aynı sözleşme).
 *  ★'nyol'/sesler/okut; rewrite yalnız /api/nur-tts/(.*)'i yakalar —
 *  yolun ilkinin ayrılması index.ts'te yapılır, tarayıcı farkı endeksützçeszdır. */
export const ttsUrl = (yol: string): string => {
  const canli = !(import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV;
  return `${canli ? "/api/nur-tts" : "/nur-tts"}/${yol}`;
};

// ★ 5 DİL (14.10): meallar + TTS sesi seçilen dilde (sunucu /ayetler?dil= + /okut?dil=)
export const DILLER = [
  { kod: "tr", ad: "Türkçe", bayrak: "🇹🇷" },
  { kod: "en", ad: "English", bayrak: "🇬🇧" },
  { kod: "ar", ad: "العربية", bayrak: "🇸🇦" },
  { kod: "id", ad: "Indonesia", bayrak: "🇮🇩" },
  { kod: "ur", ad: "اردو", bayrak: "🇵🇰" },
] as const;
export type DilKodu = (typeof DILLER)[number]["kod"];

export type KuyrukOgesi = {
  tip: "ayet" | "metin";
  metin: string;
  kat: string;
  ar?: string;
  baslik?: string;
  meal?: string;
  kaynak?: string;
  etiket?: string;
};

export type DurumTip = "hazir" | "okuyor" | "bitti" | "hata";

// ★ GALERI SÖKÜLDÜ (16.10): mockup kalıntısı loremflickr placeholder listesi —
//   önizleme arka plandan artık GERÇEK R2 klip havuzu kullanıyor (clips.ts ALL_CLIPS
//   + clips-r2.ts QURAN_CLIPS; gören src/components/seslendirmeOnizleme.tsx).

export type AyetKayit = {
  ar: string; title: string; tr: string; source: string; sureAdi?: string; ayetNo?: number;
};

export type PlanParcasi = { m: string; kat: string };

// ═══════════════════════════════════════════════════════════════
// ★ 14.10 ANA GALERİYE BAĞLANMA (kullanıcı emri: "bizim atmosfer
//   galerisindekileri koy, pro/elit diye ayrı, KİLİTLERİ DEĞİŞTİRME"):
//   Sesli Meal'in ATM listesi yerine ana stüdyo Atmosfer Galerisi'ndeki
//   GERÇEK kategoriler (src/clips.ts CATEGORIES) + kilid seviyeleri
//   (KATEGORI_TIER + HARD_LOCKED) aynen buraya yansıtıldı. Kaynaktan
//   import etmek yerine kopya taşınmadı — 'clips.ts'i değiştirirken döngü
//   yaratmasın diye değerler burada, sıra/kilidyle birlikte liste yağıldı:
//   tier kaynağı DOĞRU (clips.ts KATEGORI_TIER birebir; admin panel
//   değiirse de getFeatureLock burada okunur).
// ═══════════════════════════════════════════════════════════════
export type SesAtmosfer = {
  id: string;          // clips.ts CatId — motor KEY eşleşmesi için MMA(kat)
  ad: string;          // CATEGORIES.label birebir
  tier: "free" | "pro" | "elit" | "v2";
};

// KAYNAK: src/clips.ts CATEGORIES + KATEGORI_TIER + HARD_LOCKED_CATEGORIES
// (V2 listesi ari/cehennem/hurma/karinca — HARD LOCKED, canlıda kilid YOK)
export const SES_ATMOSFERLER: SesAtmosfer[] = [
  { id: "yuklenenler", ad: "📁 Yüklediklerim", tier: "free" },
  { id: "namaz",       ad: "🕌 Namaz & Kâbe", tier: "free" },
  { id: "musaf",       ad: "📖 Kur'an & Mushaf", tier: "free" },
  { id: "cicekler",    ad: "🌸 Çiçekler & Güller", tier: "free" },
  { id: "yildizlar",   ad: "✨ Yıldızlar & Uzay", tier: "free" },
  { id: "deniz",       ad: "🌊 Deniz & Dalgalar", tier: "free" },
  { id: "gunbatimi",   ad: "🌅 Gün Batımı", tier: "free" },
  { id: "gece",        ad: "🌙 Gece & Ay", tier: "free" },
  { id: "orman",       ad: "🌲 Orman & Yeşil", tier: "free" },
  { id: "cami",        ad: "🕌 İslam Mimarisi", tier: "free" },
  { id: "gol",         ad: "🏞️ Sakin Göl", tier: "free" },
  { id: "bulut",       ad: "☁️ Bulutlar", tier: "free" },
  { id: "desen",       ad: "🔷 Geometrik Desen", tier: "free" },
  { id: "selale",      ad: "💧 Şelaleler", tier: "pro" },
  { id: "daglar",      ad: "🏔️ Dağlar & Zirve", tier: "pro" },
  { id: "kar",         ad: "❄️ Kar & Buz", tier: "pro" },
  { id: "sehir",       ad: "🏙️ Medeniyet & Şehir", tier: "pro" },
  { id: "cennet",      ad: "🌿 Cennet Bahçeleri", tier: "elit" },
  { id: "col",         ad: "🏜️ Çöl & Kum", tier: "elit" },
  { id: "ates",        ad: "🔥 Ateş & Alev", tier: "elit" },
  { id: "fil",         ad: "🐘 Filller & Vahşi Doğa", tier: "elit" },
  { id: "cehennem",    ad: "⚡ Cehennem & Karanlık", tier: "v2" },
  { id: "hurma",       ad: "🌴 Hurma & Vaha", tier: "v2" },
  { id: "ari",         ad: "🐝 Arı & Bal", tier: "v2" },
  { id: "karinca",     ad: "🐜 Karınca & Mikro", tier: "v2" },
];

// Ses ATmanda maruz kalabileceği ana id seti — motor (seslendirmeMotor.ts) KEY
// tablosu bu id'lerle eşleşmeli. Motor ATM tablosunda yukarıdaki HEPSİ olmayabilir;
// olmayanlar 'musaf' fallbackineодержin. Kat senkronu için hedef.
export type LockLevel   = "free" | "pro" | "elit" | "v2";
