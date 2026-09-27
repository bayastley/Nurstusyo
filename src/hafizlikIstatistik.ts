// ════════════════════════════════════════════════════════
// HAFIZLIK İSTATİSTİK + ROZETLER — yol haritası madde 52 & 16
// Yalnızca cihazda (localStorage) — sunucuya HİÇBİR şey gitmez.
//   • madde 52: hangi sure kaç tekrar, doğru/yanlış dağılımı
//   • madde 16: başarım rozetleri (test serileri, zikir, hatim…)
//   • madde 38: kaldığın yerden devam (son test + seviye)
// ════════════════════════════════════════════════════════

const IST_KEY = "nur_hafizlik_ist_v1";
const ROZET_KEY = "nur_rozetler_v1";
const DEVAM_KEY = "nur_hafizlik_devam_v1";

export interface SureIstatistigi { tekrar: number; dogru: number }
export interface HafizlikIstatistik {
  /** sure no → { tekrar, dogru } */
  sureler: Record<number, SureIstatistigi>;
  toplamSoru: number;
  toplamDogru: number;
  /** en son yanlış yapılan sureler (tekrar önerisi) */
  zorlanilan: number[];
  guncelleme: number;
}

export function hafizlikIstOku(): HafizlikIstatistik {
  try {
    const raw = localStorage.getItem(IST_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as HafizlikIstatistik;
      if (parsed && typeof parsed === "object" && parsed.sureler) return parsed;
    }
  } catch { /* yoksay */ }
  return { sureler: {}, toplamSoru: 0, toplamDogru: 0, zorlanilan: [], guncelleme: 0 };
}

export function hafizlikIstKaydet(sure: number, dogruMu: boolean): void {
  try {
    const ist = hafizlikIstOku();
    const k = ist.sureler[sure] ?? { tekrar: 0, dogru: 0 };
    k.tekrar += 1;
    if (dogruMu) k.dogru += 1;
    ist.sureler[sure] = k;
    ist.toplamSoru += 1;
    if (dogruMu) ist.toplamDogru += 1;
    // zorlanilan: son 10 yanlışın sureleri (yinelenen de olur — ağırlık verir)
    if (!dogruMu) {
      ist.zorlanilan = [sure, ...ist.zorlanilan.filter((s) => s !== sure)].slice(0, 10);
    } else {
      ist.zorlanilan = ist.zorlanilan.filter((s) => s !== sure);
    }
    ist.guncelleme = Date.now();
    localStorage.setItem(IST_KEY, JSON.stringify(ist));
    window.dispatchEvent(new Event("nur-hafizlik-guncelle"));
  } catch { /* yoksay */ }
}

/** Kaldığın yerden devam (madde 38): son tur ayarları */
export interface HafizlikDevam { seviye: string; tarih: number; dogru: number; toplam: number }
export function hafizlikDevamOku(): HafizlikDevam | null {
  try {
    const raw = localStorage.getItem(DEVAM_KEY);
    if (raw) return JSON.parse(raw) as HafizlikDevam;
  } catch { /* yoksay */ }
  return null;
}
export function hafizlikDevamKaydet(seviye: string, dogru: number, toplam: number): void {
  try { localStorage.setItem(DEVAM_KEY, JSON.stringify({ seviye, dogru, toplam, tarih: Date.now() })); } catch { /* yoksay */ }
}

// ─── ROZETLER (madde 16) ────────────────────────────────────
export interface RozetDurumu {
  /** kilit açılmışsa tarih, değilse 0 */
  kazanim: Record<string, number>;
  zikirToplam: number;
  hatimCuz: number;
  uretimToplam: number;
  testToplam: number;
}

const ROZET_TANIMLARI: Array<{
  id: string; ad: string; emoji: string; aciklama: string;
  kosul: (d: RozetDurumu) => boolean;
}> = [
  { id: "ilk-test", ad: "İlk Adım", emoji: "🌱", aciklama: "İlk hafızlık testini tamamla", kosul: (d) => d.testToplam >= 5 },
  { id: "test-25", ad: "Çalışkan Öğrenci", emoji: "📚", aciklama: "25 soru çöz", kosul: (d) => d.testToplam >= 25 },
  { id: "test-100", ad: "Hafız Adayı", emoji: "🧠", aciklama: "100 soru çöz", kosul: (d) => d.testToplam >= 100 },
  { id: "zikir-100", ad: "Zikir Dostu", emoji: "📿", aciklama: "Toplam 100 zikir çek", kosul: (d) => d.zikirToplam >= 100 },
  { id: "zikir-1000", ad: "Zikir Hamlesi", emoji: "💯", aciklama: "Toplam 1000 zikir çek", kosul: (d) => d.zikirToplam >= 1000 },
  { id: "zikir-10000", ad: "Denizin Dibi", emoji: "🌊", aciklama: "Toplam 10.000 zikir çek", kosul: (d) => d.zikirToplam >= 10000 },
  { id: "cuz-1", ad: "İlk Cüz", emoji: "📖", aciklama: "İlk cüzünü tamamla", kosul: (d) => d.hatimCuz >= 1 },
  { id: "cuz-10", ad: "Cüz Toplayıcı", emoji: "🔖", aciklama: "10 cüz tamamla", kosul: (d) => d.hatimCuz >= 10 },
  { id: "hatim-1", ad: "Hatim Sahibi", emoji: "🏆", aciklama: "Bir hatim tamamla (30 cüz)", kosul: (d) => d.hatimCuz >= 30 },
  { id: "uret-1", ad: "İlk Video", emoji: "🎬", aciklama: "İlk videonu üret", kosul: (d) => d.uretimToplam >= 1 },
  { id: "uret-10", ad: "Üretici", emoji: "🎥", aciklama: "10 video üret", kosul: (d) => d.uretimToplam >= 10 },
  { id: "uret-50", ad: "İçerik Fabrikası", emoji: "🏭", aciklama: "50 video üret", kosul: (d) => d.uretimToplam >= 50 },
  { id: "streak-7", ad: "7 Gün Serisi", emoji: "🔥", aciklama: "7 gün üst üste üret", kosul: () => false }, // streak modülünden beslenir
];

export function rozetlerOku(): RozetDurumu {
  try {
    const raw = localStorage.getItem(ROZET_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as RozetDurumu;
      if (parsed && typeof parsed.kazanim === "object") return { kazanim: parsed.kazanim ?? {}, zikirToplam: parsed.zikirToplam ?? 0, hatimCuz: parsed.hatimCuz ?? 0, uretimToplam: parsed.uretimToplam ?? 0, testToplam: parsed.testToplam ?? 0 };
    }
  } catch { /* yoksay */ }
  return { kazanim: {}, zikirToplam: 0, hatimCuz: 0, uretimToplam: 0, testToplam: 0 };
}

export const ROZET_LISTESI = ROZET_TANIMLARI;

/** Rozet sayaçlarını güncelle ve yeni kilitlenenleri döndür */
export function rozetSayacGuncelle(degisiklik: Partial<Pick<RozetDurumu, "zikirToplam" | "hatimCuz" | "uretimToplam" | "testToplam">>): string[] {
  try {
    const mevcut = rozetlerOku();
    const yeni: RozetDurumu = {
      kazanim: mevcut.kazanim,
      zikirToplam: degisiklik.zikirToplam ?? mevcut.zikirToplam,
      hatimCuz: degisiklik.hatimCuz ?? mevcut.hatimCuz,
      uretimToplam: degisiklik.uretimToplam ?? mevcut.uretimToplam,
      testToplam: degisiklik.testToplam ?? mevcut.testToplam,
    };
    const yeniKazanilanlar: string[] = [];
    for (const r of ROZET_TANIMLARI) {
      if (!yeni.kazanim[r.id] && r.kosul(yeni)) {
        yeni.kazanim[r.id] = Date.now();
        yeniKazanilanlar.push(`${r.emoji} ${r.ad}`);
      }
    }
    localStorage.setItem(ROZET_KEY, JSON.stringify(yeni));
    if (yeniKazanilanlar.length) window.dispatchEvent(new CustomEvent("nur-rozet-kazanildi", { detail: yeniKazanilanlar }));
    return yeniKazanilanlar;
  } catch { return []; }
}

/** Zikirmatik/Hatim/Üretim sayaçlarından rozetleri besle (çağrı yerleri: ilgili modüller) */
export function rozetleriTazele(): string[] {
  try {
    // üretim istatistiği (IslamicToolsPanel URETIM_IST_KEY ile aynı)
    let uretim = 0;
    try {
      const raw = localStorage.getItem("nur_uretim_istatistik_v1");
      if (raw) uretim = (JSON.parse(raw) as { toplam?: number }).toplam ?? 0;
    } catch { /* yoksay */ }
    // hatim cüz sayısı (TopluHatim TOPLU_HATIM_KEY ile aynı)
    let cuz = 0;
    try {
      const raw = localStorage.getItem("nur_toplu_hatim_v1");
      if (raw) cuz = ((JSON.parse(raw) as { cüzler?: number[] }).cüzler ?? []).length;
    } catch { /* yoksay */ }
    // toplam zikir (Zikirmatik ZIKIR_KEY ile aynı)
    let zikir = 0;
    try { zikir = Number(localStorage.getItem("nur_zikirmatik_v1")) || 0; } catch { /* yoksay */ }
    // test sayısı
    const test = hafizlikIstOku().toplamSoru;
    return rozetSayacGuncelle({ uretimToplam: uretim, hatimCuz: cuz, zikirToplam: zikir, testToplam: test });
  } catch { return []; }
}
