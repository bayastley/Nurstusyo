// ════════════════════════════════════════════════════════
// TOPLULUK.TS — Sunucusuz topluluk katmanı (madde 46, 47, 56, 57)
// Veri cihazda (localStorage) tutulur; gruplar "davet kodu" ile paylaşılır.
// Kod = base64(JSON). Ağ isteği yok; gizli sunucu yok.
// ════════════════════════════════════════════════════════

const KEY = "nur_topluluk_v1";
const SURUM = 1;

export type ToplulukTuru = "hafizlik" | "kuran" | "ilim" | "hoca";

export type Uye = {
  id: string;
  ad: string;
  /** Tamamlanan hedef indeksleri */
  tamam: number[];
  /** Hoca-öğrenci türünde hoca notu */
  geriBildirim?: string;
};

export type Topluluk = {
  id: string;
  tur: ToplulukTuru;
  ad: string;
  hedefler: string[];
  uyeler: Uye[];
  olusturma: string;
};

export type ToplulukVeri = { surum: number; gruplar: Topluluk[] };

function bosVeri(): ToplulukVeri {
  return { surum: SURUM, gruplar: [] };
}

function uyeMi(d: unknown): d is Uye {
  if (!d || typeof d !== "object") return false;
  const u = d as Record<string, unknown>;
  return typeof u.id === "string" && typeof u.ad === "string" && Array.isArray(u.tamam);
}

function grupMi(d: unknown): d is Topluluk {
  if (!d || typeof d !== "object") return false;
  const g = d as Record<string, unknown>;
  return (
    typeof g.id === "string" &&
    typeof g.ad === "string" &&
    typeof g.tur === "string" &&
    Array.isArray(g.hedefler) &&
    Array.isArray(g.uyeler) &&
    g.uyeler.every(uyeMi)
  );
}

export function toplulukOku(): ToplulukVeri {
  try {
    const ham: unknown = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!ham || typeof ham !== "object") return bosVeri();
    const v = ham as Record<string, unknown>;
    const gruplar = Array.isArray(v.gruplar) ? v.gruplar.filter(grupMi) : [];
    return { surum: SURUM, gruplar };
  } catch (hata) {
    console.warn("Topluluk verisi okunamadı:", hata);
    return bosVeri();
  }
}

export function toplulukYaz(veri: ToplulukVeri): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(veri));
  } catch (hata) {
    console.warn("Topluluk verisi yazılamadı:", hata);
  }
}

export function grupOlustur(tur: ToplulukTuru, ad: string, hedefler: string[]): ToplulukVeri {
  const veri = toplulukOku();
  veri.gruplar.unshift({
    id: `g${Date.now().toString(36)}`,
    tur,
    ad: ad.trim(),
    hedefler: hedefler.map((h) => h.trim()).filter(Boolean),
    uyeler: [],
    olusturma: new Date().toISOString(),
  });
  toplulukYaz(veri);
  return veri;
}

export function grupSil(id: string): ToplulukVeri {
  const veri = toplulukOku();
  veri.gruplar = veri.gruplar.filter((g) => g.id !== id);
  toplulukYaz(veri);
  return veri;
}

export function uyeEkle(grupId: string, ad: string): ToplulukVeri {
  const veri = toplulukOku();
  const grup = veri.gruplar.find((g) => g.id === grupId);
  if (grup && ad.trim()) grup.uyeler.push({ id: `u${Date.now().toString(36)}`, ad: ad.trim(), tamam: [] });
  toplulukYaz(veri);
  return veri;
}

export function uyeSil(grupId: string, uyeId: string): ToplulukVeri {
  const veri = toplulukOku();
  const grup = veri.gruplar.find((g) => g.id === grupId);
  if (grup) grup.uyeler = grup.uyeler.filter((u) => u.id !== uyeId);
  toplulukYaz(veri);
  return veri;
}

export function hedefDegistir(grupId: string, uyeId: string, indeks: number): ToplulukVeri {
  const veri = toplulukOku();
  const uye = veri.gruplar.find((g) => g.id === grupId)?.uyeler.find((u) => u.id === uyeId);
  if (uye) uye.tamam = uye.tamam.includes(indeks) ? uye.tamam.filter((i) => i !== indeks) : [...uye.tamam, indeks];
  toplulukYaz(veri);
  return veri;
}

export function geriBildirimYaz(grupId: string, uyeId: string, metin: string): ToplulukVeri {
  const veri = toplulukOku();
  const uye = veri.gruplar.find((g) => g.id === grupId)?.uyeler.find((u) => u.id === uyeId);
  if (uye) uye.geriBildirim = metin.trim();
  toplulukYaz(veri);
  return veri;
}

/** Grubu (veya tek üyeyi) paylaşılabilir metin koduna çevirir */
export function kodUret(grup: Topluluk, uyeId?: string): string {
  const hedef: Topluluk = uyeId
    ? { ...grup, uyeler: grup.uyeler.filter((u) => u.id === uyeId) }
    : grup;
  return btoa(unescape(encodeURIComponent(JSON.stringify({ surum: SURUM, grup: hedef }))));
}

/** Paylaşım kodunu çözer; geçersizse null */
export function kodCoz(kod: string): { grup: Topluluk | null; hata: string | null } {
  const temiz = kod.replace(/\s+/g, "");
  if (!temiz) return { grup: null, hata: "Kod boş" };
  try {
    const ham: unknown = JSON.parse(decodeURIComponent(escape(atob(temiz))));
    if (!ham || typeof ham !== "object") return { grup: null, hata: "Kod biçimi hatalı" };
    const v = ham as Record<string, unknown>;
    if (!grupMi(v.grup)) return { grup: null, hata: "Kod bu sürümle uyumlu değil" };
    return { grup: v.grup, hata: null };
  } catch (hata) {
    console.warn("Topluluk kodu çözülemedi:", hata);
    return { grup: null, hata: "Kod okunamadı" };
  }
}

/** İçe aktarılan grubu birleştirir (aynı id varsa üyeler güncellenir) */
export function iceAktar(gelen: Topluluk): ToplulukVeri {
  const veri = toplulukOku();
  const mevcut = veri.gruplar.find((g) => g.id === gelen.id);
  if (!mevcut) {
    veri.gruplar.unshift(gelen);
  } else {
    mevcut.ad = gelen.ad;
    mevcut.hedefler = gelen.hedefler;
    gelen.uyeler.forEach((u) => {
      const varOlan = mevcut.uyeler.find((m) => m.id === u.id);
      if (varOlan) {
        varOlan.ad = u.ad;
        varOlan.tamam = u.tamam;
        if (u.geriBildirim !== undefined) varOlan.geriBildirim = u.geriBildirim;
      } else {
        mevcut.uyeler.push(u);
      }
    });
  }
  toplulukYaz(veri);
  return veri;
}

export function ilerleme(grup: Topluluk, uye: Uye): number {
  if (!grup.hedefler.length) return 0;
  return Math.round((uye.tamam.length / grup.hedefler.length) * 100);
}
