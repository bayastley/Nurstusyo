// ════════════════════════════════════════════════════════
// KART ALBÜMÜ (KARTLARIM) — 02.11 (kullanıcı: "kartlarım albümü sırayla")
// Kullanıcının favori ayet kartları: kart satırındaki kalp ile alınır,
// "Kartlarım" çipi ile albüm görünümüne süzgeçlenir. Tamamen cihazda =
// localStorage, sunucuya gitmez.
// anahtar: nur_kart_favori_v1 — id listesi
// ════════════════════════════════════════════════════════

const FAV_KEY = "nur_kart_favori_v1";

export const kartAlbumuOku = (): string[] => {
  try {
    const ham = JSON.parse(localStorage.getItem(FAV_KEY) || "[]") as unknown;
    return Array.isArray(ham) ? (ham.filter((x) => typeof x === "string") as string[]) : [];
  } catch { return []; }
};

const kartAlbumuYaz = (ids: string[]): void => {
  try { localStorage.setItem(FAV_KEY, JSON.stringify(ids)); } catch { /* localStorage kapal±ysa yut */ }
};

export const kartFavoriMi = (id: string): boolean => kartAlbumuOku().includes(id);

/** Togglémler: id varsa çikar±r, yoksa en sona ekler. Yeni listeyi döndürür. */
export const kartFavoriTak = (id: string): string[] => {
  const eski = kartAlbumuOku();
  const yeni = eski.includes(id) ? eski.filter((x) => x !== id) : [...eski, id];
  kartAlbumuYaz(yeni);
  return yeni;
};

/** Tüm favori kartları temizler (cihazda). */
export const kartAlbumuTemizle = (): void => {
  kartAlbumuYaz([]);
};

/** Favori kart id listesini JSON olarak dışa aktarır (cihaz içi kopyalama için). */
export const kartAlbumuDisaAktar = (): string => JSON.stringify(kartAlbumuOku());

/** JSON'dan favori kart id listesini içe aktarır; geçerli string id'leri benzersiz tutar. */
export const kartAlbumuIceAktar = (raw: string): string[] | null => {
  try {
    const ham = JSON.parse(raw) as unknown;
    const liste = Array.isArray(ham)
      ? ham
      : ham && typeof ham === "object" && Array.isArray((ham as { favoriler?: unknown }).favoriler)
        ? (ham as { favoriler: unknown[] }).favoriler
        : null;
    if (!liste) return null;
    const seen = new Set<string>();
    const ids = liste.filter((x): x is string => {
      if (typeof x !== "string" || !x || seen.has(x)) return false;
      seen.add(x);
      return true;
    });
    kartAlbumuYaz(ids);
    return ids;
  } catch { return null; }
};
