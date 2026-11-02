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