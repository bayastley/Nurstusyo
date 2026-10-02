// ════════════════════════════════════════════════════════
// AI RUH HALİ (01.10) — Ayet Kütüphanesi'nin duygusal pusulası
//
// NE YAPAR: Kullanıcı ruh halini serbest yazar ("sınav stresi",
//   "kalbi kırık", "huzur arıyorum"...) ya da 30 çipten birini
//   seçer → anahtar-kelime motoru en yakın RUH_HALİ'ni bulur →
//   mood bazlı ayet + arka plan (akilliBgSec) + kart ayarları
//   (karartma/konum/hizalama/ölçek + mood renkli RENK ÇUBUĞU)
//   tek tuşla hazırlanır.
// TASARIM: Akıllı AI (akilliBgSec) ile aynı yerel desen — API yok,
//   keyword scoring; 12 AyetKarti mood'una 30 ruh haritalı (içerik bol).
// ════════════════════════════════════════════════════════

import { type AyetKarti } from "./ayetKartlariData";

export interface RuhHali {
  id: string;
  emoji: string;
  ad: string;
  /** ★ 5 DİL ADI (02.10): çip çubuğu i18n — eksik dil TR'ye düşer (ruhHaliAd) */
  adI18n: { tr: string; en: string; ar: string; id: string; ur: string };
  /** AyetKarti mood'u — ayet havuzu + akilliBgSec + kart ayarı önerisi bunun üzerinden */
  mood: AyetKarti["mood"];
  /** Serbest metin eşleştirme anahtarları (TR, normalize edilmiş) */
  anahtarlar: string[];
}

// ── 30 RUH HALİ — çip çubuğunun sırası burası ───────────
export const RUH_HALLERI: readonly RuhHali[] = [
  { id: "huzur", emoji: "🕊️", ad: "Huzur", adI18n: { tr: "Huzur", en: "Peace", ar: "سكينة", id: "Kedamaian", ur: "سکون" }, mood: "huzur", anahtarlar: ["huzur", "dingin", "sakin", "rahat", "ferah", "keyif", "icim rahat", "içim rahat", "ses"] },
  { id: "sabir", emoji: "🧗", ad: "Sabır", adI18n: { tr: "Sabır", en: "Patience", ar: "صبر", id: "Kesabaran", ur: "صبر" }, mood: "sabir", anahtarlar: ["sabir", "sabretmek", "dayanamiyorum", "sikildim", "yorgun", "yorgunum", "biktım", "bitkin", "tasıyamıyorum", "taşıyamıyorum"] },
  { id: "sukur", emoji: "🤲", ad: "Şükür", adI18n: { tr: "Şükür", en: "Gratitude", ar: "شكر", id: "Syukur", ur: "شکرگزاری" }, mood: "sukur", anahtarlar: ["sukur", "sükrediyorum", "minnettarım", "elhamdulillah", "hamd", "nimet"] },
  { id: "tevekkul", emoji: "🌌", ad: "Tevekkül", adI18n: { tr: "Tevekkül", en: "Trust in God", ar: "توكل", id: "Tawakal", ur: "توکل" }, mood: "tevekkul", anahtarlar: ["tevekkul", "emanet", "bırakıyorum", "olur", "reddedilmedi", "inşallah"] },
  { id: "rahmet", emoji: "🌧️", ad: "Rahmet", adI18n: { tr: "Rahmet", en: "Mercy", ar: "رحمة", id: "Rahmat", ur: "رحمت" }, mood: "rahmet", anahtarlar: ["rahmet", "merhamet", "magfiret", "mağfiret", "bagıslanma", "bağışlanma"] },
  { id: "sevgi", emoji: "💗", ad: "Sevgi", adI18n: { tr: "Sevgi", en: "Love", ar: "محبة", id: "Cinta", ur: "محبت" }, mood: "sevgi", anahtarlar: ["sevgi", "aşk", "ask", "seviyorum", "kalp", "düşkün", "sevdalı"] },
  { id: "zafer", emoji: "🏆", ad: "Zafer", adI18n: { tr: "Zafer", en: "Victory", ar: "نصر", id: "Kemenangan", ur: "فتح" }, mood: "zafer", anahtarlar: ["zafer", "başarı", "basaracagim", "başaracağım", "motivasyon", "kazanmak", "galibiyet", "mücadele", "mucadele"] },
  { id: "af", emoji: "🕯️", ad: "Af & Tövbe", adI18n: { tr: "Af & Tövbe", en: "Forgiveness", ar: "مغفرة", id: "Pengampunan", ur: "معافی و توبہ" }, mood: "af", anahtarlar: ["af", "affet", "tovbe", "tövbe", "pişmanım", "pişmanlık", "günah", "bagisla", "bağışla", "kusurum", "hatam"] },
  { id: "imtihan", emoji: "⛰️", ad: "İmtihan", adI18n: { tr: "İmtihan", en: "Trial", ar: "ابتلاء", id: "Ujian", ur: "امتحان" }, mood: "imtihan", anahtarlar: ["imtihan", "sınav", "sinav", "stres", "kaygi", "kaygı", "panik", "zorlanıyorum", "zor", "ödev", "giriş"] },
  { id: "cennet", emoji: "🌳", ad: "Cennet Özlemi", adI18n: { tr: "Cennet Özlemi", en: "Longing for Paradise", ar: "شوق الجنة", id: "Rindu Surga", ur: "جنت کی یاد" }, mood: "cennet", anahtarlar: ["cennet", "özlem", "ozluyorum", "özlüyorum", "ahiret", "kabir", "vefat", "merhum", "rahmetli"] },
  { id: "ilim", emoji: "📚", ad: "İlim", adI18n: { tr: "İlim", en: "Knowledge", ar: "علم", id: "Ilmu", ur: "علم" }, mood: "ilim", anahtarlar: ["ilim", "öğrenmek", "öğreniyorum", "okul", "kurs", "bilgi", "araştırıyorum", "okumak", "ders", "çalışıyorum", "calisiyorum"] },
  { id: "aile", emoji: "👨‍👩‍👧", ad: "Aile", adI18n: { tr: "Aile", en: "Family", ar: "عائلة", id: "Keluarga", ur: "خاندان" }, mood: "aile", anahtarlar: ["aile", "anne", "baba", "çocuk", "çocuğum", "evladım", "kardeş", "ebeveyn"] },
  { id: "gece", emoji: "🌙", ad: "Gece & Yalnızlık", adI18n: { tr: "Gece & Yalnızlık", en: "Night & Solitude", ar: "الليل والوحدة", id: "Malam & Kesepian", ur: "رات و تنہائی" }, mood: "huzur", anahtarlar: ["yalnızım", "yalnızlık", "gece", "uyuyamıyorum", "sessizlik", "tek başına", "tek basina"] },
  { id: "kalp-kirik", emoji: "💔", ad: "Kalp Kırıklığı", adI18n: { tr: "Kalp Kırıklığı", en: "Heartbreak", ar: "كسر القلب", id: "Patah Hati", ur: "دل کا ٹوٹنا" }, mood: "rahmet", anahtarlar: ["kalbi kırık", "kalp kırıklığı", "kırıldım", "kırgınım", "incittiler", "ihanet", "aldattılar", "terk ettiler", "kirik kalp"] },
  { id: "uzuntu", emoji: "😢", ad: "Üzüntü", adI18n: { tr: "Üzüntü", en: "Sadness", ar: "حزن", id: "Kesedihan", ur: "غم" }, mood: "sabir", anahtarlar: ["üzgünüm", "üzüntü", "ağlıyorum", "hüzün", "mutsuz", "keder", "yas", "yas tutuyorum"] },
  { id: "umut", emoji: "🌅", ad: "Umut", adI18n: { tr: "Umut", en: "Hope", ar: "أمل", id: "Harapan", ur: "امید" }, mood: "rahmet", anahtarlar: ["umut", "umudum", "iyileşeceğim", "geçecek", "umuyorum", "bekliyorum"] },
  { id: "dua", emoji: "🙏", ad: "Dua & Yakarış", adI18n: { tr: "Dua & Yakarış", en: "Prayer & Supplication", ar: "دعاء و ابتهال", id: "Doa & Permohonan", ur: "دعا و زاری" }, mood: "tevekkul", anahtarlar: ["dua", "yakarıyorum", "rica", "ilahi", "rabbi", "yalvarıyorum", "yalvariyorum"] },
  { id: "rizik", emoji: "💰", ad: "Rızık Endişesi", adI18n: { tr: "Rızık Endişesi", en: "Provision Worry", ar: "قلق الرزق", id: "Kekhawatiran Rezeki", ur: "رزق کی فکر" }, mood: "tevekkul", anahtarlar: ["rızık", "para", "borç", "maaş", "geçim", "işsiz", "iş arıyorum", "is arıyorum", "borçlarım"] },
  { id: "teselli", emoji: "😌", ad: "Teselli", adI18n: { tr: "Teselli", en: "Comfort", ar: "مواساة", id: "Penghiburan", ur: "تسلی" }, mood: "rahmet", anahtarlar: ["teselli", "derdim", "dert", "iyileşiyorum", "geçsin", "sarsılmadım", "sarsildim"] },
  { id: "cesaret", emoji: "💪", ad: "Cesaret", adI18n: { tr: "Cesaret", en: "Courage", ar: "شجاعة", id: "Keberanian", ur: "ہمت" }, mood: "zafer", anahtarlar: ["cesaret", "korkuyorum", "üstesinden", "yapamam", "deneyeceğim", "kararlıyım", "kararliyim"] },
  { id: "sifa", emoji: "🌿", ad: "Şifa", adI18n: { tr: "Şifa", en: "Healing", ar: "شفاء", id: "Kesembuhan", ur: "شفا" }, mood: "rahmet", anahtarlar: ["şifa", "şifam", "hastayım", "iyileşme", "tedavi", "ameliyat", "sifa"] },
  { id: "adalet", emoji: "⚖️", ad: "Adalet", adI18n: { tr: "Adalet", en: "Justice", ar: "عدل", id: "Keadilan", ur: "انصاف" }, mood: "ilim", anahtarlar: ["adalet", "haksızlık", "haksizlik", "zulüm", "mahkeme", "dava", "hakkımı"] },
  { id: "yeni-baslangic", emoji: "👶", ad: "Yeni Başlangıç", adI18n: { tr: "Yeni Başlangıç", en: "New Beginning", ar: "بداية جديدة", id: "Awal Baru", ur: "نیا آغاز" }, mood: "af", anahtarlar: ["yeni başlangıç", "yeni baslangic", "sıfırdan", "sifirdan", "başlıyorum", "yeni sayfa", "temiz"] },
  { id: "kararsizlik", emoji: "🧭", ad: "Kararsızlık", adI18n: { tr: "Kararsızlık", en: "Indecision", ar: "تردد", id: "Keraguan", ur: "بے یقینی" }, mood: "ilim", anahtarlar: ["kararsızım", "kararsızlık", "kararsizim", "hangi", "seçemiyorum", "tereddüt", "yol göster"] },
  { id: "korku", emoji: "🌊", ad: "Korku", adI18n: { tr: "Korku", en: "Fear", ar: "خوف", id: "Ketakutan", ur: "خوف" }, mood: "tevekkul", anahtarlar: ["korku", "korkuyorum", "fırtına", "deprem", "dehşet", "endişeliyim", "endiseliyim"] },
  { id: "sevinc", emoji: "🎉", ad: "Sevinç", adI18n: { tr: "Sevinç", en: "Joy", ar: "فرح", id: "Kegembiraan", ur: "خوشی" }, mood: "sukur", anahtarlar: ["sevinç", "sevinc", "mutluyum", "harika", "kutlama", "müjde", "mujde", "güzel haber"] },
  { id: "bereket", emoji: "🌾", ad: "Bereket", adI18n: { tr: "Bereket", en: "Abundance", ar: "بركة", id: "Berkah", ur: "برکت" }, mood: "sukur", anahtarlar: ["bereket", "bolluk", "artıyor", "artıyor", "çok şükür", "çok sukur"] },
  { id: "acele", emoji: "🕐", ad: "Acele", adI18n: { tr: "Acele", en: "Impatience", ar: "استعجال", id: "Tergesa-gesa", ur: "جلدی" }, mood: "sabir", anahtarlar: ["acele", "aceleciyim", "bekleyemiyorum", "sabredemiyorum", "geç kaldım", "gec kaldim"] },
  { id: "yolculuk", emoji: "🧳", ad: "Yolculuk", adI18n: { tr: "Yolculuk", en: "Journey", ar: "رحلة", id: "Perjalanan", ur: "سفر" }, mood: "tevekkul", anahtarlar: ["yolculuk", "taşınıyorum", "tasiniyorum", "göç", "goc", "hicret", "uzak", "ayrılık", "ayrilik"] },
  { id: "es", emoji: "💍", ad: "Evlilik & Eş", adI18n: { tr: "Evlilik & Eş", en: "Marriage & Spouse", ar: "الزواج والزوج", id: "Pernikahan & Pasangan", ur: "شادی و ہمسر" }, mood: "sevgi", anahtarlar: ["evlilik", "eş", "nişan", "nis", "düğün", "dugun", "evlenmek", "eşim", "cift", "çift"] },
] as const;

/**
 * ★ ÇİP ADI SEÇİLİ DİLDE (02.10 i18n): eksik/yanlış dil → TR ad. UI (çip, title,
 *   notify) bunu kullanır; eşleştirici (ruhHaliEsle) hep TR `ad` ile puanlar —
 *   anahtarlar dil-bağımsız kalır.
 */
export function ruhHaliAd(r: RuhHali, lang?: string): string {
  if (!lang) return r.ad;
  return (r.adI18n as Record<string, string>)[lang] ?? r.ad;
}

// ── MOOD → KART AYARI ÖNERİSİ (AI bu ayarları kurar) ─────
export interface RuhHaliKartOnerisi {
  karartma: number;
  konum: "ust" | "orta" | "alt";
  hizalama: "sol" | "orta" | "sag";
  yaziOlcek: number;
  /** Renk çubuğu dönmesi — mood rengi (cubukRengi tonu) */
  cubukDonme: number;
}

export const MOOD_KART_AYARLARI: Record<AyetKarti["mood"], RuhHaliKartOnerisi> = {
  huzur: { karartma: 30, konum: "orta", hizalama: "orta", yaziOlcek: 105, cubukDonme: 0 },
  sabir: { karartma: 44, konum: "orta", hizalama: "orta", yaziOlcek: 100, cubukDonme: 120 },
  sukur: { karartma: 32, konum: "orta", hizalama: "orta", yaziOlcek: 105, cubukDonme: 60 },
  tevekkul: { karartma: 40, konum: "orta", hizalama: "orta", yaziOlcek: 100, cubukDonme: 240 },
  rahmet: { karartma: 36, konum: "orta", hizalama: "orta", yaziOlcek: 105, cubukDonme: 180 },
  sevgi: { karartma: 30, konum: "orta", hizalama: "orta", yaziOlcek: 110, cubukDonme: 300 },
  zafer: { karartma: 46, konum: "alt", hizalama: "orta", yaziOlcek: 110, cubukDonme: 30 },
  af: { karartma: 38, konum: "orta", hizalama: "orta", yaziOlcek: 100, cubukDonme: 210 },
  imtihan: { karartma: 50, konum: "orta", hizalama: "orta", yaziOlcek: 100, cubukDonme: 90 },
  cennet: { karartma: 26, konum: "orta", hizalama: "orta", yaziOlcek: 105, cubukDonme: 150 },
  ilim: { karartma: 42, konum: "ust", hizalama: "sol", yaziOlcek: 100, cubukDonme: 270 },
  aile: { karartma: 32, konum: "orta", hizalama: "orta", yaziOlcek: 105, cubukDonme: 330 },
};

// ── NORMALİZASYON + EŞLEŞTİRİCİ ──────────────────────────
const TR_MAP: Record<string, string> = { "ı": "i", "İ": "i", "ğ": "g", "Ğ": "g", "ü": "u", "Ü": "u", "ş": "s", "Ş": "s", "ö": "o", "Ö": "o", "ç": "c", "Ç": "c" };

/** TR→ASCII + küçük harf — "sınav stresi" → "sinav stresi" */
export function trKucult(metin: string): string {
  return metin.toLocaleLowerCase("tr").replace(/[ıİğĞüÜşŞöÖçÇ]/g, (h) => TR_MAP[h] ?? h);
}

export interface RuhHaliEslesme {
  ruh: RuhHali;
  /** 0 = hiç anahtar tutmadı (fallback) */
  skor: number;
}

/**
 * Serbest metni 30 ruh haliyle puanlar. Uzun (özel) anahtarlar 2 puan,
 * kısa genel anahtarlar 1 puan; ruh adı doğrudan geçiyorsa +3.
 * Beraberlikte listedeki ilk ruh kazanır (sıralama = önemi).
 */
export function ruhHaliEsle(metin: string): RuhHaliEslesme {
  const metinN = ` ${trKucult(metin).replace(/\s+/g, " ").trim()} `;
  let enIyi: RuhHali = RUH_HALLERI[0];
  let enIyiSkor = 0;
  for (const ruh of RUH_HALLERI) {
    let skor = 0;
    if (metinN.includes(` ${trKucult(ruh.ad)} `)) skor += 3;
    for (const anahtar of ruh.anahtarlar) {
      if (metinN.includes(trKucult(anahtar))) skor += anahtar.length >= 6 ? 2 : 1;
    }
    if (skor > enIyiSkor) { enIyi = ruh; enIyiSkor = skor; }
  }
  return { ruh: enIyi, skor: enIyiSkor };
}

// ─── 3. ÇİP SAYACI (02.10) — "en çok seçilen 5" öne sabitleme ──────────
// Her ruh hali çipine basış sayısı localStorage'da tutulur (cihaza özel,
// KVKK dostu — sunucuya hiçbir şey gitmez). Çip şeridi popüler 5'i ÖNE
// sabitler (küçük 🏅 rozetle), gerisi sabit RUH_HALLERI sırasında gelir.

const RUH_SAYAC_KEY = "nur_ruh_sayac_v1";

export type RuhSayac = Record<string, number>;

export function ruhSayacOku(): RuhSayac {
  try {
    const raw = localStorage.getItem(RUH_SAYAC_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as RuhSayac;
    if (!parsed || typeof parsed !== "object") return {};
    // Sadece geçerli ruh id'leri kalsın (eski/kırık anahtar temizliği)
    const gecerli: RuhSayac = {};
    for (const ruh of RUH_HALLERI) {
      const n = Number(parsed[ruh.id]);
      if (Number.isFinite(n) && n > 0) gecerli[ruh.id] = Math.min(9999, Math.floor(n));
    }
    return gecerli;
  } catch { return {}; }
}

export function ruhSayacArttir(ruhId: string): RuhSayac {
  const sayac = ruhSayacOku();
  if (RUH_HALLERI.some((r) => r.id === ruhId)) sayac[ruhId] = (sayac[ruhId] || 0) + 1;
  try { localStorage.setItem(RUH_SAYAC_KEY, JSON.stringify(sayac)); } catch { /* ignore */ }
  return sayac;
}

/** Popüler N (varsayılan 5) — oyu sıfırdan büyük olanlar arasında; beraberlikte RUH_HALLERI sırası */
export function populerRuhlar(sayac: RuhSayac, adet = 5): string[] {
  return Object.entries(sayac)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1] || RUH_HALLERI.findIndex((r) => r.id === a[0]) - RUH_HALLERI.findIndex((r) => r.id === b[0]))
    .slice(0, adet)
    .map(([id]) => id);
}

/** Çip şeridinin sıralı id listesi: popüler 5 öne + gerisi sabit sıra (popülerler tekrar etmez) */
export function cipSirasi(sayac: RuhSayac, adet = 5): Array<{ id: string; sayi: number; populer: boolean }> {
  const populer = populerRuhlar(sayac, adet);
  const populerSet = new Set(populer);
  const gerisi = RUH_HALLERI.filter((r) => !populerSet.has(r.id)).map((r) => r.id);
  return [...populer, ...gerisi].map((id) => ({ id, sayi: sayac[id] || 0, populer: populerSet.has(id) }));
}
