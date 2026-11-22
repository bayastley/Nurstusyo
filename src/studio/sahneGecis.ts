// ════════════════════════════════════════════════════════
// SAHNE GEÇİŞLERİ — yol haritası madde 22
// Ayetler arasında yumuşak geçiş: kararma/aydınlanma, ışık efekti,
// sinematik yakınlaşma ve geçiş süresi ayarı.
// Değerler canvas çizim döngüsünde (studio/useCanvasDraw) hem önizlemeye
// hem kayda uygulanır; varsayılan "yok" → mevcut çıktı birebir korunur.
// ════════════════════════════════════════════════════════

const GECIS_KEY = "nur_sahne_gecis_v1";

export type GecisTuru = "yok" | "karartma" | "isik" | "sinematik";

export interface SahneGecisAyar {
  tur: GecisTuru;
  /** Geçiş süresi (sn) — giriş ve çıkışta ayrı ayrı */
  sure: number;
}

export const VARSAYILAN_GECIS: SahneGecisAyar = { tur: "yok", sure: 0.6 };

export interface GecisZarf {
  /** 0-1 siyah perde */
  karartma: number;
  /** 0-1 sıcak ışık vurgusu */
  isik: number;
  /** Arka plan yakınlaşma çarpanı */
  yakinlasma: number;
}

const TURLER: GecisTuru[] = ["yok", "karartma", "isik", "sinematik"];
let onbellek: SahneGecisAyar | null = null;

function oku(): SahneGecisAyar {
  try {
    const ham = localStorage.getItem(GECIS_KEY);
    if (!ham) return VARSAYILAN_GECIS;
    const veri: unknown = JSON.parse(ham);
    if (!veri || typeof veri !== "object") return VARSAYILAN_GECIS;
    const v = veri as Partial<SahneGecisAyar>;
    const tur = TURLER.includes(v.tur as GecisTuru) ? (v.tur as GecisTuru) : VARSAYILAN_GECIS.tur;
    const sure = Math.min(1.5, Math.max(0.2, typeof v.sure === "number" ? v.sure : VARSAYILAN_GECIS.sure));
    return { tur, sure };
  } catch (hata) {
    console.warn("[sahneGecis] ayar okunamadı", hata);
    return VARSAYILAN_GECIS;
  }
}

/** Çizim döngüsü her karede çağırır — localStorage'a dokunmaz, cache'ten döner. */
export function sahneGecis(): SahneGecisAyar {
  if (!onbellek) onbellek = oku();
  return onbellek;
}

export function sahneGecisYaz(ayar: SahneGecisAyar): void {
  onbellek = ayar;
  try {
    localStorage.setItem(GECIS_KEY, JSON.stringify(ayar));
  } catch (hata) {
    console.warn("[sahneGecis] ayar yazılamadı", hata);
  }
}

/**
 * Geçiş zarfı.
 * @param tur geçiş türü
 * @param ilerleme ayetin içindeki ilerleme (0 → 1)
 * @param sure istenen geçiş süresi (sn)
 * @param ayetSure ayetin toplam süresi (sn)
 */
export function gecisZarf(tur: GecisTuru, ilerleme: number, sure: number, ayetSure: number): GecisZarf {
  const bos: GecisZarf = { karartma: 0, isik: 0, yakinlasma: 1 };
  if (tur === "yok" || ayetSure <= 0) return bos;
  const p = Math.min(1, Math.max(0, ilerleme));
  const kenar = Math.min(0.45, Math.max(0.02, sure / ayetSure));
  const giris = Math.min(1, Math.max(0, 1 - p / kenar));
  const cikis = Math.min(1, Math.max(0, (p - (1 - kenar)) / kenar));
  const k = Math.max(giris, cikis);

  if (tur === "karartma") return { karartma: k, isik: 0, yakinlasma: 1 };
  if (tur === "isik") return { karartma: k * 0.35, isik: k, yakinlasma: 1 };
  // sinematik: yumuşak karartma + yavaş yakınlaşma (ayet boyunca %6)
  return { karartma: k * 0.8, isik: k * 0.5, yakinlasma: 1 + 0.06 * (1 - p) };
}

// ★ KAYIT İŞARETİ (22.11): kayıt sırasında React prop'ları gecikmeli gelebildiği için
//   geçiş zarfının zaman kaynağını üretici motor doğrudan işaretler.
let kayitBaslangici = 0;

export function kayitBaslat(): void { kayitBaslangici = performance.now(); }
export function kayitBitir(): void { kayitBaslangici = 0; }
export function kayitAktif(): boolean { return kayitBaslangici > 0; }
