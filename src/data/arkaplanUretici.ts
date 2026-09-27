// ════════════════════════════════════════════════════════
// ARKA PLAN ÜRETİCİ DATA — İş 4: AI Arka Plan Üretici LİTE
// API'siz, maliyetsiz: kullanıcının yazdığı ruh hâlini
// (mood) okur → mevcut R2 atmosfer kütüphanesi + sinematik
// filtre sistemiyle bir SAHNE PLANI üretir.
//
// ★ DÜRÜSTLÜK: Bu bir üretici değil, AKILLI KOMPOZİTÖRDÜR —
//   hazır kütüphanedeki klipleri ve filtreleri ruh hâline göre
//   birleştirir. Gerçek AI görsel üretimi (API'li) ayrı karar.
// ★ Kompozitör stüdyonun MEVCUT akışlarını kullanır:
//   randomizeBackgrounds(kategori) + setCinematic(filtre) —
//   böylece üretim davranışı birebir aynı kalır, sahte kasa yok.
// ★ Anahtarlar normalize (ASCII) formda — kelimeAtolyesi ile aynı kural.
// ════════════════════════════════════════════════════════

import type { CatId } from "../clips";

export interface MoodPreset {
  id: string;
  emoji: string;
  /** Kullanıcıya görünen ad */
  ad: string;
  /** Normalize edilmiş tetikleyici kelimeler (kullanıcı metni bunlarla eşlenir) */
  anahtarlar: string[];
  /** Sahnedeki ana atmosfer kategorileri (sıra = öncelik) */
  cats: CatId[];
  /** Sinematik filtre önerisi (CINE_FILTERS id) */
  filtre: string;
  /** Kullanıcının metnine döndürülen dürüst açıklama */
  plan: string;
}

// ── Mood presetleri: yazılan ruh hâli → sahne planı ──────
export const MOOD_PRESETLERI: MoodPreset[] = [
  { id: "huzur", emoji: "🌙", ad: "Huzur",
    anahtarlar: ["huzur", "sakin", "dingin", "rahat", "baris", "sessiz", "sukun"],
    cats: ["gol", "gece", "desen"], filtre: "huzur",
    plan: "Sakin göl + gece göğü + geometrik desen üçlüsü, yumuşak sinematik filtreyle." },
  { id: "nur", emoji: "💡", ad: "Nur & Işık",
    anahtarlar: ["nur", "isik", "aydinlik", "parlak", "kandil", "saf", "temiz"],
    cats: ["yildizlar", "gece", "cami"], filtre: "nur",
    plan: "Yıldızlı gök + cami silüeti, sıcak altın 'Nur' filtresiyle parlar." },
  { id: "gece", emoji: "🌌", ad: "Gece & Derinlik",
    anahtarlar: ["gece", "karanlik", "ay", "derin", "sessizlik", "tefekkur", "yalniz"],
    cats: ["gece", "yildizlar", "bulut"], filtre: "gece",
    plan: "Koyu mavi gece paleti: ay + yıldızlar + bulut, derin 'Gece' filtresiyle." },
  { id: "gunbatimi", emoji: "🌅", ad: "Altın Saat",
    anahtarlar: ["gunbatimi", "aksam", "sicak", "umut", "vaha", "sonus", "safa"],
    cats: ["gunbatimi", "deniz", "bulut"], filtre: "altinsaat",
    plan: "Gün batımı + deniz yansıması, 'Altın Saat' filtresiyle sinema hissi." },
  { id: "kabe", emoji: "🕋", ad: "Kâbe & Hac",
    anahtarlar: ["kabe", "hac", "umre", "mekke", "namaz", "secde", "kible"],
    cats: ["namaz", "cami", "desen"], filtre: "kabe",
    plan: "Kâbe + İslam mimarisi, 'Kâbe Vurgulu' altın kontrastıyla." },
  { id: "yesil", emoji: "🌿", ad: "Cennet Yeşili",
    anahtarlar: ["cennet", "yesil", "bahce", "ormat", "orman", "hayat", "taze", "buyume"],
    cats: ["cennet", "orman", "cicekler"], filtre: "zumrut",
    plan: "Cennet bahçeleri + orman, 'Zümrüt' filtresiyle canlı yeşil." },
  { id: "deniz", emoji: "🌊", ad: "Su & Akış",
    anahtarlar: ["deniz", "su", "dalga", "akis", "nem", "temizlenme", "arinma"],
    cats: ["deniz", "selale", "gol"], filtre: "huzur",
    plan: "Deniz + şelale akışı, yumuşak kontrast; suyun huzuru." },
  { id: "vahset", emoji: "🏔️", ad: "Büyük Doğa",
    anahtarlar: ["dag", "zirve", "buyuk", "guc", "azim", "vahsi", "heybet", "yuce"],
    cats: ["daglar", "kar", "bulut"], filtre: "siyahbeyaz",
    plan: "Dağ + kar zirveleri, siyah-beyaz sinematik: heybet ve azim." },
  { id: "imtihan", emoji: "⚡", ad: "İmtihan & Fırtına",
    anahtarlar: ["imtihan", "firtina", "zorluk", "musibet", "siddet", "rizgar", "siginak"],
    cats: ["bulut", "deniz", "daglar"], filtre: "gece",
    plan: "Fırtınalı bulutlar + coşkulu deniz, dramatik koyu filtreyle." },
  { id: "saf", emoji: "❄️", ad: "Saf & Berrak",
    anahtarlar: ["kar", "beyaz", "saflik", "berrak", "temizlik", "arinmak", "sessizim"],
    cats: ["kar", "bulut", "gol"], filtre: "siyahbeyaz",
    plan: "Kar + bulut beyazlığı, nötr sinema tonu: sadelik." },
  { id: "sanat", emoji: "🔷", ad: "Desen & Sanat",
    anahtarlar: ["desen", "geometri", "sanat", "estetik", "zarif", "musluk", "intizam", "olcu"],
    cats: ["desen", "cami", "musaf"], filtre: "kabe",
    plan: "Geometrik desen + mimari detay, altın vurgu: el işçiliği hissi." },
  { id: "kuranyolu", emoji: "📖", ad: "Mushaf & Okuma",
    anahtarlar: ["kuran", "mushaf", "okuma", "tilavet", "kitap", "vahiy", "meal"],
    cats: ["musaf", "desen", "cami"], filtre: "nur",
    plan: "Mushaf + desen, sıcak okuma ışığı: kelimeye yakın sahne." },
];

// ── Senaryo modları: sahnenin ritmi ──────────────────────
export interface SenaryoModu {
  id: string;
  ad: string;
  emoji: string;
  aciklama: string;
}

export const SENARYO_MODLARI: SenaryoModu[] = [
  { id: "tek", ad: "Tek Sahne", emoji: "🎯", aciklama: "Tüm video tek atmosferde: bütünlük hissi en yüksek." },
  { id: "cift", ad: "İkili Kurgu", emoji: "⚖️", aciklama: "Ana kategori + destek kategorisi dönüşümlü: ritim hissi." },
  { id: "yolculuk", ad: "Yolculuk", emoji: "🧭", aciklama: "Açılış sakin → orta dramatik → final umutlu: hikâye yayı." },
];

// ── Normalize (kelimeAtolyesi ile birebir aynı kural) ────
export function normalizeMood(s: string): string {
  return s
    .toLocaleLowerCase("tr-TR")
    .replace(/i̇/g, "i")
    .replace(/[ıİ]/g, "i")
    .replace(/[şŞ]/g, "s")
    .replace(/[ğĞ]/g, "g")
    .replace(/[üÜ]/g, "u")
    .replace(/[öÖ]/g, "o")
    .replace(/[çÇ]/g, "c")
    .replace(/[âÂ]/g, "a")
    .replace(/[îÎ]/g, "i")
    .replace(/[ûÛ]/g, "u")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export interface MoodSonuc {
  preset: MoodPreset;
  /** true = metin bir mood'la eşleşti; false = varsayılan Huzur planı */
  tam: boolean;
  /** Eşleşen normalize kelime */
  eslesen: string;
}

/** Kullanıcı metninden mood preset bulur (birebir > kelime başlangıcı) */
export function moodBul(metin: string): MoodSonuc {
  const q = normalizeMood(metin);
  const tokenler = q.split(" ").filter(Boolean);
  const adaylar = [q, ...tokenler].filter(Boolean);
  for (const token of adaylar) {
    for (const p of MOOD_PRESETLERI) {
      if (p.anahtarlar.includes(token)) return { preset: p, tam: true, eslesen: token };
    }
  }
  for (const token of adaylar) {
    for (const p of MOOD_PRESETLERI) {
      const hit = p.anahtarlar.find((a) => a.length >= 3 && token.startsWith(a));
      if (hit) return { preset: p, tam: true, eslesen: token };
    }
  }
  return { preset: MOOD_PRESETLERI[0], tam: false, eslesen: "" };
}

/** Tier kuralı: PRO/ELİT kategoriler ücretsiz kullanıcıya önerilmez */
const TIER_SIRA: Record<"free" | "pro" | "elit", number> = { free: 0, pro: 1, elit: 2 };
const KATEGORI_TIER: Partial<Record<CatId, "free" | "pro" | "elit">> = {
  gol: "free", desen: "free", bulut: "free", gece: "free", yildizlar: "free",
  gunbatimi: "free", deniz: "free", cicekler: "free", orman: "free", musaf: "free",
  cami: "free", namaz: "free",
  selale: "pro", daglar: "pro", kar: "pro", sehir: "pro",
  cennet: "elit", col: "elit", ates: "elit",
};

export function catsForTierMood(cats: CatId[], accessTier: "free" | "pro" | "elit", isMasterSurum: boolean): CatId[] {
  if (isMasterSurum) return cats;
  const seviye = TIER_SIRA[accessTier] ?? 0;
  const gorunen = cats.filter((c) => seviye >= (TIER_SIRA[KATEGORI_TIER[c] ?? "free"] ?? 0));
  // Hepsi kilitliyse herkese açık güvenli sıra
  return gorunen.length ? gorunen : ["gol", "desen", "bulut"];
}

// ★ ÇOĞALTILDI (28.09, kullanıcı kararı): 6 → 24 öneri — mood presetlerinin tamamına
//   dokunan, mevsimlere ve üretici senaryolarına yayılan zengin seçki.
export const MOOD_ONERILERI: string[] = [
  "huzurlu bir gece", "sıcak gün batımı", "Kâbe'ye yolculuk",
  "cennet gibi yeşil", "fırtınalı deniz", "kar berraklığı",
  "kandil gecesi nur içinde", "ay ışığında tefekkür",
  "secdede huzur bulmak", "Ramazan iftar vakti",
  "yağmur sonrası toprak kokusu", "sonbahar yaprakları arasında",
  "ilk karın sessizliği", "papatyalı bahar sabahı",
  "dağların ardında gün doğumu", "bulutların üstünde uçmak",
  "camide akşam ezanı", "mescidin avlusunda gölge",
  "ırmak kenarında zikir", "yıldız kayması dileği",
  "anne kucağı sıcaklığı", "çocukluk anıları",
  "tespih sonrası dinginlik", "vahşi okyanus dalgaları",
];
