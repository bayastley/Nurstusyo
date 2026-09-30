// ════════════════════════════════════════════════════════
// HAFIZLIKVERI.TS — Hafızlık testi sure havuzları + seviyeler
// HafizlikTestiModal.tsx'den ayrıldı (SRP adım 2, 30.09)
// ════════════════════════════════════════════════════════

// Meşhur sureler — test havuzu (yeterli ayet sayısı + tanınırlık)
// ★ ÇOĞALTILDI (25.09 genişleme): 59 → 114 sure. Sorular canlı API'den
//   (alquran.cloud, Diyanet meal) geldiği için içerik uydurma YOK — havuz
//   ne kadar genişse test o kadar zengin. Kısa sureler Kolay'da; Zor'da
//   uzun ayetli sureler (Bakara, Âl-i İmrân, Nisâ…).
// (101 çıkarıldı — en uzun ayeti 51 kr, soru formatı için kısa; 28.09 canlı tarama kanıtı)
export const TEST_SURELERI = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 29, 31, 33, 36, 39, 40, 41, 43, 45, 46, 49, 55, 62, 67, 87, 93, 94, 95, 96, 97, 98, 99, 100, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114];
// ★ KOLAY — kısa meşhur sureler + son cüz (Cüz 30'un tamamı: 78-114) + Fâtiha: 37 sure
export const KOLAY_SURELER = [1, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114];
// ★ ORTA — orta uzunluk, hafızlarda popüler sureler: 26 sure
export const ORTA_SURELER = [12, 13, 14, 17, 18, 19, 20, 21, 22, 24, 25, 27, 28, 29, 31, 34, 35, 36, 47, 49, 55, 57, 62, 67, 71, 76];
// ★ ZOR — uzun ayetli sureler (devam kısmı garantili): 52 sure
export const ZOR_SURELER = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 15, 16, 23, 26, 30, 32, 33, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 48, 50, 51, 52, 53, 54, 56, 58, 59, 60, 61, 63, 64, 65, 66, 68, 69, 70, 72, 73, 74, 75, 77, 88, 104];
export const SEVIYELER = [
  { id: "kolay", ad: "Kolay", emoji: "🌱", sureler: KOLAY_SURELER, aciklama: "Kısa meşhur sureler — Yâsîn, İhlâs, Felak tarzı" },
  { id: "orta", ad: "Orta", emoji: "🌿", sureler: ORTA_SURELER, aciklama: "Orta sureler — Kehf, Yâsîn, MÜlk, Rahmân" },
  { id: "zor", ad: "Zor", emoji: "🏔️", sureler: ZOR_SURELER, aciklama: "Uzun ayetli sureler — Bakara, Âl-i İmrân, Nisâ" },
] as const;
export type SeviyeId = typeof SEVIYELER[number]["id"];
// ★ TUR BOYUTU SEÇİLEBİLİR (28.09, kullanıcı kararı): "5 soru ne demek, daha çok olsun,
//   yüzlerce gerekirse insanlar vakit harcasın" → 5/15/30/Sınırsız mod. Havuz canlı
//   API'den geldiği için sınırsız modda sorular bitmez.
export const TUR_BOYUTLARI = [
  { id: 5, label: "5 soru", emoji: "⚡" },
  { id: 15, label: "15 soru", emoji: "🔥" },
  { id: 30, label: "30 soru", emoji: "🏆" },
  { id: 0, label: "Sınırsız", emoji: "♾️" },
] as const;
export const TUR_BOYUTU = 5; // varsayılan — kullanıcı seçer

export function karistir<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Soru tipi — modal ile veri dosyası arasında ortak */
export interface Soru {
  s: number;
  sn: string;
  a: number;
  bas: string;      // ayetin ilk ~60 karakteri
  devam: string;    // doğru devam
  secenekler: string[]; // 4 seçenek (doğru dahil)
}
