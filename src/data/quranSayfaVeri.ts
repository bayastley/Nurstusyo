// ══════════════════════════════════════════════════════════════
// QURANSAYFAVERI.TS — Kur'an Sayfaları (mushaf) saf veri modülü
// Kaynak: KFGQPC (Kral Fahd) Hafs mushafı — 604 sayfa, SVG (vektör → zoomda net kalır)
// Lisans: CC BY 4.0 (quran-ws/quran-svg projesi; ürün içinde kullanımda atıf muafiyeti)
// Sure başlangıç sayfaları quran.com v4 API'den tek tek doğrulandı (02.10.2026).
// ══════════════════════════════════════════════════════════════

export const SAYFA_SAYISI = 604;

// ★ GÖRÜNTÜ KAYNAKLARI — sırayla denenir (1. patlarsa 2.'ye düşer)
//   ★ 03.10 (kullanıcı emri: "gerçek kuran sayfaları istiyorum"): 1. kaynak artık
//   KFGQPC Medine mushafının GERÇEK raster PNG'si (2600×4206, kitap gibi) —
//   GovarJabbar/Quran-PNG (quran/quran.com-images üretimi, 000-604.png, test edildi:
//   jsDelivr ~450ms/400KB). 2-3) eski SVG zinciri yedek olarak kalır (vektör, zoomda net).
const PNG_SURUM = "master";
const SVG_SURUM = "v1.1.1";
const SVG_KAYNAKLARI: Array<(s: string) => string> = [
  (s) => `https://cdn.jsdelivr.net/gh/GovarJabbar/Quran-PNG@${PNG_SURUM}/${s}.png`,
  (s) => `https://cdn.quran.ws/svg/pages/${SVG_SURUM}/hafs-kfqc/${s}.svg`,
  (s) => `https://cdn.jsdelivr.net/gh/quran-ws/quran-svg@main/mushafs/hafs/kfqc/svg/${s}.svg`,
];

/** Sayfa numarası (1-604) için kaynak URL'lerini sırayla döndürür */
export const sayfaSvgKaynaklari = (sayfa: number): string[] => {
  const s = String(Math.min(Math.max(1, sayfa), SAYFA_SAYISI)).padStart(3, "0");
  return SVG_KAYNAKLARI.map((yap) => yap(s));
};

/** Gerçek raster PNG mi (SVG değil)? — <img> boyutlandırma ve render ipuçları için */
export const sayfaRasterMi = (kaynak: string): boolean => kaynak.endsWith(".png");

// ★ CÜZ BAŞLANGIÇ SAYFALARI — standart Medine mushafı cüz sınırları (cüz 1 → sayfa 1 …)
export const CUZ_BASLANGIC_SAYFA = [
  1, 22, 42, 62, 82, 102, 121, 142, 162, 182, 201, 222, 242, 262, 282, 302, 322,
  342, 362, 382, 402, 422, 442, 462, 482, 502, 522, 542, 562, 582,
];

/** Sayfanın içinde bulunduğu cüz (1-30) */
export const cuzBul = (sayfa: number): number => {
  let cuz = 1;
  for (let i = 0; i < CUZ_BASLANGIC_SAYFA.length; i++) {
    if (sayfa >= CUZ_BASLANGIC_SAYFA[i]) cuz = i + 1;
  }
  return cuz;
};

// ★ SURE BAŞLANGIÇ SAYFALARI — index 0 = 1. sure (Fâtiha), değer = mushaf sayfası
//   (quran.com v4 /chapters pages alanıyla birebir doğrulandı)
const SURE_BAS_SAYFA = [
  1, 2, 50, 77, 106, 128, 151, 177, 187, 208, 221, 235, 249, 255, 262, 267, 282,
  293, 305, 312, 322, 332, 342, 350, 359, 367, 377, 385, 396, 404, 411, 415,
  418, 428, 434, 440, 446, 453, 458, 467, 477, 483, 489, 496, 499, 502, 507,
  511, 515, 518, 520, 523, 526, 528, 531, 534, 537, 542, 545, 549, 551, 553,
  554, 556, 558, 560, 562, 564, 566, 568, 570, 572, 574, 575, 577, 578, 580,
  582, 583, 585, 586, 587, 587, 589, 590, 591, 591, 592, 593, 594, 595, 595,
  596, 596, 597, 597, 598, 598, 599, 599, 600, 600, 601, 601, 601, 602, 602,
  602, 603, 603, 603, 604, 604, 604,
];

/** Sayfada BAŞLAYAN sureler (1-tabanlı numaralar) — bir sayfada birden çok sure başlayabilir */
export const sayfadaBaslayanSureler = (sayfa: number): number[] => {
  const bas: number[] = [];
  for (let i = 0; i < SURE_BAS_SAYFA.length; i++) {
    if (SURE_BAS_SAYFA[i] === sayfa) bas.push(i + 1);
  }
  return bas;
};

/** Sayfanın başında aktif olan sure numarası (son başlangıç ≤ sayfa) */
export const aktifSureNo = (sayfa: number): number => {
  let no = 1;
  for (let i = 0; i < SURE_BAS_SAYFA.length; i++) {
    if (sayfa >= SURE_BAS_SAYFA[i]) no = i + 1;
  }
  return no;
};

// ── localStorage anahtarları (tutarlı "nur_" öneki) ──
export const LS_SON_SAYFA = "nur_kuran_sayfa";       // son okunan sayfa (sayı)
export const LS_HATIM = "nur_kuran_hatim";           // { okunan: number[], tamamlanan: number }

export interface HatimKaydi { okunan: number[]; tamamlanan: number; }

export const hatimYukle = (): HatimKaydi => {
  try {
    const ham = localStorage.getItem(LS_HATIM);
    if (ham) {
      const d = JSON.parse(ham) as HatimKaydi;
      if (Array.isArray(d.okunan) && typeof d.tamamlanan === "number") {
        return { okunan: d.okunan.filter((n) => n >= 1 && n <= SAYFA_SAYISI), tamamlanan: d.tamamlanan };
      }
    }
  } catch { /* localStorage kapalıysa sessizce sıfırdan başla */ }
  return { okunan: [], tamamlanan: 0 };
};

export const hatimKaydet = (k: HatimKaydi): void => {
  try { localStorage.setItem(LS_HATIM, JSON.stringify(k)); } catch { /* yut */ }
};

export const sonSayfaYukle = (): number => {
  try {
    const n = parseInt(localStorage.getItem(LS_SON_SAYFA) || "", 10);
    if (n >= 1 && n <= SAYFA_SAYISI) return n;
  } catch { /* yut */ }
  return 1;
};

export const sonSayfaKaydet = (sayfa: number): void => {
  try { localStorage.setItem(LS_SON_SAYFA, String(sayfa)); } catch { /* yut */ }
};
