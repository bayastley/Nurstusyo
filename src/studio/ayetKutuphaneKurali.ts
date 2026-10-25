// ════════════════════════════════════════════════════════
// AYET KUTUPHANE KURALI — 25.10 (sahibin emri)
//   • Ayet Kütüphanesi Sınırsız değil: normal kullanıcı jetonla açar
//       3 kısa üretim hakkı → 24 saat   ·  15 kısa üretim hakkı → 1 hafta
//     Açıkken günde 3 kart indirme. Elit üyelik boyunca açık, günde 5.
//   • Hazır Ayet Paketleri: günde 10 ekleme limiti (elit dahil).
//   • Ayet Notlarım: kilit YOK (herkese ücretsiz) — v2KilitliMi muafiyeti.
//   • Admin/master muaf (her kilit admin'de açık kuralı).
// Jeton harcama consumeVideo("kisa") üzerinden — kota önce, sonra paket.
// ════════════════════════════════════════════════════════

import { consumeVideo, getAvailable, tierAtLeast, type Tier } from "../tier";
import { translate } from "../i18n";

/** i18n: mesajlar seçili dile döner (LS nur_lang) */
const TT = (k: string): string => translate(localStorage.getItem("nur_lang"), k);

export const AK_JETON_24SAAT = 3;
export const AK_JETON_HAFTALIK = 15;
export const AK_GUNLUK_LIMIT = 3;
export const AK_GUNLUK_LIMIT_ELIT = 5;
export const AK_HATIRLATMA_GUNLUK_LIMIT = 10;

const AK_UNLOCK_KEY = "nur_ak_kutuphane_v1";
const AK_INDME_KEY = "nur_ak_indirme_v1";
const AK_PAKET_KEY = "nur_ak_paket_ekle_v1";

// ── yerel gün anahtarı (gün değişince sayaçlar sıfır) ──
const bugunAnahtari = (): string => {
  const n = new Date();
  return `${n.getFullYear()}-${n.getMonth() + 1}-${n.getDate()}`;
};

// ── performance: erişim satın alma zaman damgası ──
export function akUnlockBitis(): number {
  if (typeof window === "undefined") return 0;
  return Math.max(0, Math.floor(Number(localStorage.getItem(AK_UNLOCK_KEY) || 0)));
}

export interface AkErisim {
  /** Admin/master (her kapı açık) */
  master: boolean;
  /** Elit üye — üyelik boyunca açık */
  elit: boolean;
  /** Jeton erişimi aktif mi (elit/admin dahil) */
  acik: boolean;
  /** Açıkken bugün kalan kart indirme hakkı (elit 5 · ötekiler 3) */
  gunlukLimit: number;
  kalanBugun: number;
  /** 3 jeton / 15 jeton bedelleri (UI gösterimi) */
  jeton24: number;
  jetonHafta: number;
  /** Kalan kısa üretim hakkı */
  hakSayisi: number;
}

export function akErisim(tier: Tier, master = false): AkErisim {
  const elit = master || tierAtLeast(tier, "elit");
  const jetonluAcik = Date.now() < akUnlockBitis();
  const acik = elit || jetonluAcik;
  const gunlukLimit = elit ? AK_GUNLUK_LIMIT_ELIT : AK_GUNLUK_LIMIT;
  const kalanBugun = acik ? Math.max(0, gunlukLimit - akIndirmeBugunku()) : 0;
  return {
    master, elit, acik, gunlukLimit, kalanBugun,
    jeton24: AK_JETON_24SAAT,
    jetonHafta: AK_JETON_HAFTALIK,
    hakSayisi: getAvailable("kisa", tier),
  };
}

/** Ücretli erişim satın alır: jetonu harcar ("kisa" üretim hakkı), süre uzatır.
 *  Tekrar alım kalınan süreyi UZATIR (kullanıcı zarar etmez). */
export function akKutuphaneAc(sure: "24" | "7", tier: Tier): { ok: boolean; mesaj: string } {
  const maliyet = sure === "24" ? AK_JETON_24SAAT : AK_JETON_HAFTALIK;
  if (maliyet > 0 && getAvailable("kisa", tier) < maliyet) {
    return { ok: false, mesaj: TT("akJetonYetersiz").replace("{m}", String(maliyet)).replace("{k}", String(getAvailable("kisa", tier))) };
  }
  for (let i = 0; i < maliyet; i++) {
    const sonuc = consumeVideo("kisa", tier);
    if (!sonuc.ok) {
      return { ok: false, mesaj: TT("akJetonBitti") };
    }
  }
  const ekMs = sure === "24" ? 24 * 3600000 : 7 * 24 * 3600000;
  try { localStorage.setItem(AK_UNLOCK_KEY, String(Math.max(akUnlockBitis(), Date.now()) + ekMs)); } catch { /* yoksay */ }
  return { ok: true, mesaj: TT(sure === "24" ? "akJetonAcildi24" : "akJetonAcildiHafta") };
}

// ── günlük kart indirme sayacı ──
function akIndirmeOku(): { gun: string; sayi: number } {
  if (typeof window === "undefined") return { gun: "", sayi: 0 };
  try {
    const v = JSON.parse(localStorage.getItem(AK_INDME_KEY) || "{}");
    if (v?.gun === bugunAnahtari()) return { gun: v.gun, sayi: Math.max(0, Math.floor(Number(v.sayi) || 0)) };
  } catch { /* bozuk kayıt → sıfırla */ }
  return { gun: bugunAnahtari(), sayi: 0 };
}

export function akIndirmeBugunku(): number { return akIndirmeOku().sayi; }

/** Bir indirme hakkı harcar; kalan yoksa false döner. */
export function akIndirmeKullan(): boolean {
  const d = akIndirmeOku();
  try { localStorage.setItem(AK_INDME_KEY, JSON.stringify({ gun: bugunAnahtari(), sayi: d.sayi + 1 })); } catch { /* yoksay */ }
  return true;
}

export function akIndirmeKalan(gunlukLimit: number): number {
  return Math.max(0, gunlukLimit - akIndirmeBugunku());
}

// ── hazır ayet paketleri — günlük ekleme limiti (elit dahil) ──
function akPaketOku(): { gun: string; sayi: number } {
  if (typeof window === "undefined") return { gun: "", sayi: 0 };
  try {
    const v = JSON.parse(localStorage.getItem(AK_PAKET_KEY) || "{}");
    if (v?.gun === bugunAnahtari()) return { gun: v.gun, sayi: Math.max(0, Math.floor(Number(v.sayi) || 0)) };
  } catch { /* bozuk kayıt → sıfırla */ }
  return { gun: bugunAnahtari(), sayi: 0 };
}

export function akPaketKalanBugun(): number {
  return Math.max(0, AK_HATIRLATMA_GUNLUK_LIMIT - akPaketOku().sayi);
}

/** n adet paket içeriği eklemek istiyorsun → gerçekten eklenebilecek kadarı.
 *  Uyarı mesajı limit dolduysa döner. */
export function akPaketEklePlan(n: number): { eklenecek: number; kalan: number; tikanma: boolean } {
  const kalan = akPaketKalanBugun();
  const eklenecek = Math.max(0, Math.min(n, kalan));
  return { eklenecek, kalan, tikanma: eklenecek === 0 };
}

/** Planlanan eklemeyi sayaca YAZAR — asıl tüketme adımı budur. */
export function akPaketKullan(n: number): void {
  if (n <= 0) return;
  const d = akPaketOku();
  try { localStorage.setItem(AK_PAKET_KEY, JSON.stringify({ gun: bugunAnahtari(), sayi: d.sayi + n })); } catch { /* yoksay */ }
}
