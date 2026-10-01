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
  /** AyetKarti mood'u — ayet havuzu + akilliBgSec + kart ayarı önerisi bunun üzerinden */
  mood: AyetKarti["mood"];
  /** Serbest metin eşleştirme anahtarları (TR, normalize edilmiş) */
  anahtarlar: string[];
}

// ── 30 RUH HALİ — çip çubuğunun sırası burası ───────────
export const RUH_HALLERI: readonly RuhHali[] = [
  { id: "huzur", emoji: "🕊️", ad: "Huzur", mood: "huzur", anahtarlar: ["huzur", "dingin", "sakin", "rahat", "ferah", "keyif", "icim rahat", "içim rahat", "ses"] },
  { id: "sabir", emoji: "🧗", ad: "Sabır", mood: "sabir", anahtarlar: ["sabir", "sabretmek", "dayanamiyorum", "sikildim", "yorgun", "yorgunum", "biktım", "bitkin", "tasıyamıyorum", "taşıyamıyorum"] },
  { id: "sukur", emoji: "🤲", ad: "Şükür", mood: "sukur", anahtarlar: ["sukur", "sükrediyorum", "minnettarım", "elhamdulillah", "hamd", "nimet"] },
  { id: "tevekkul", emoji: "🌌", ad: "Tevekkül", mood: "tevekkul", anahtarlar: ["tevekkul", "emanet", "bırakıyorum", "olur", "reddedilmedi", "inşallah"] },
  { id: "rahmet", emoji: "🌧️", ad: "Rahmet", mood: "rahmet", anahtarlar: ["rahmet", "merhamet", "magfiret", "mağfiret", "bagıslanma", "bağışlanma"] },
  { id: "sevgi", emoji: "💗", ad: "Sevgi", mood: "sevgi", anahtarlar: ["sevgi", "aşk", "ask", "seviyorum", "kalp", "düşkün", "sevdalı"] },
  { id: "zafer", emoji: "🏆", ad: "Zafer", mood: "zafer", anahtarlar: ["zafer", "başarı", "basaracagim", "başaracağım", "motivasyon", "kazanmak", "galibiyet", "mücadele", "mucadele"] },
  { id: "af", emoji: "🕯️", ad: "Af & Tövbe", mood: "af", anahtarlar: ["af", "affet", "tovbe", "tövbe", "pişmanım", "pişmanlık", "günah", "bagisla", "bağışla", "kusurum", "hatam"] },
  { id: "imtihan", emoji: "⛰️", ad: "İmtihan", mood: "imtihan", anahtarlar: ["imtihan", "sınav", "sinav", "stres", "kaygi", "kaygı", "panik", "zorlanıyorum", "zor", "ödev", "giriş"] },
  { id: "cennet", emoji: "🌳", ad: "Cennet Özlemi", mood: "cennet", anahtarlar: ["cennet", "özlem", "ozluyorum", "özlüyorum", "ahiret", "kabir", "vefat", "merhum", "rahmetli"] },
  { id: "ilim", emoji: "📚", ad: "İlim", mood: "ilim", anahtarlar: ["ilim", "öğrenmek", "öğreniyorum", "okul", "kurs", "bilgi", "araştırıyorum", "okumak", "ders", "çalışıyorum", "calisiyorum"] },
  { id: "aile", emoji: "👨‍👩‍👧", ad: "Aile", mood: "aile", anahtarlar: ["aile", "anne", "baba", "çocuk", "çocuğum", "evladım", "kardeş", "ebeveyn"] },
  { id: "gece", emoji: "🌙", ad: "Gece & Yalnızlık", mood: "huzur", anahtarlar: ["yalnızım", "yalnızlık", "gece", "uyuyamıyorum", "sessizlik", "tek başına", "tek basina"] },
  { id: "kalp-kirik", emoji: "💔", ad: "Kalp Kırıklığı", mood: "rahmet", anahtarlar: ["kalbi kırık", "kalp kırıklığı", "kırıldım", "kırgınım", "incittiler", "ihanet", "aldattılar", "terk ettiler", "kirik kalp"] },
  { id: "uzuntu", emoji: "😢", ad: "Üzüntü", mood: "sabir", anahtarlar: ["üzgünüm", "üzüntü", "ağlıyorum", "hüzün", "mutsuz", "keder", "yas", "yas tutuyorum"] },
  { id: "umut", emoji: "🌅", ad: "Umut", mood: "rahmet", anahtarlar: ["umut", "umudum", "iyileşeceğim", "geçecek", "umuyorum", "bekliyorum"] },
  { id: "dua", emoji: "🙏", ad: "Dua & Yakarış", mood: "tevekkul", anahtarlar: ["dua", "yakarıyorum", "rica", "ilahi", "rabbi", "yalvarıyorum", "yalvariyorum"] },
  { id: "rizik", emoji: "💰", ad: "Rızık Endişesi", mood: "tevekkul", anahtarlar: ["rızık", "para", "borç", "maaş", "geçim", "işsiz", "iş arıyorum", "is arıyorum", "borçlarım"] },
  { id: "teselli", emoji: "😌", ad: "Teselli", mood: "rahmet", anahtarlar: ["teselli", "derdim", "dert", "iyileşiyorum", "geçsin", "sarsılmadım", "sarsildim"] },
  { id: "cesaret", emoji: "💪", ad: "Cesaret", mood: "zafer", anahtarlar: ["cesaret", "korkuyorum", "üstesinden", "yapamam", "deneyeceğim", "kararlıyım", "kararliyim"] },
  { id: "sifa", emoji: "🌿", ad: "Şifa", mood: "rahmet", anahtarlar: ["şifa", "şifam", "hastayım", "iyileşme", "tedavi", "ameliyat", "sifa"] },
  { id: "adalet", emoji: "⚖️", ad: "Adalet", mood: "ilim", anahtarlar: ["adalet", "haksızlık", "haksizlik", "zulüm", "mahkeme", "dava", "hakkımı"] },
  { id: "yeni-baslangic", emoji: "👶", ad: "Yeni Başlangıç", mood: "af", anahtarlar: ["yeni başlangıç", "yeni baslangic", "sıfırdan", "sifirdan", "başlıyorum", "yeni sayfa", "temiz"] },
  { id: "kararsizlik", emoji: "🧭", ad: "Kararsızlık", mood: "ilim", anahtarlar: ["kararsızım", "kararsızlık", "kararsizim", "hangi", "seçemiyorum", "tereddüt", "yol göster"] },
  { id: "korku", emoji: "🌊", ad: "Korku", mood: "tevekkul", anahtarlar: ["korku", "korkuyorum", "fırtına", "deprem", "dehşet", "endişeliyim", "endiseliyim"] },
  { id: "sevinc", emoji: "🎉", ad: "Sevinç", mood: "sukur", anahtarlar: ["sevinç", "sevinc", "mutluyum", "harika", "kutlama", "müjde", "mujde", "güzel haber"] },
  { id: "bereket", emoji: "🌾", ad: "Bereket", mood: "sukur", anahtarlar: ["bereket", "bolluk", "artıyor", "artıyor", "çok şükür", "çok sukur"] },
  { id: "acele", emoji: "🕐", ad: "Acele", mood: "sabir", anahtarlar: ["acele", "aceleciyim", "bekleyemiyorum", "sabredemiyorum", "geç kaldım", "gec kaldim"] },
  { id: "yolculuk", emoji: "🧳", ad: "Yolculuk", mood: "tevekkul", anahtarlar: ["yolculuk", "taşınıyorum", "tasiniyorum", "göç", "goc", "hicret", "uzak", "ayrılık", "ayrilik"] },
  { id: "es", emoji: "💍", ad: "Evlilik & Eş", mood: "sevgi", anahtarlar: ["evlilik", "eş", "nişan", "nis", "düğün", "dugun", "evlenmek", "eşim", "cift", "çift"] },
] as const;

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
