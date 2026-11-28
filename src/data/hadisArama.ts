// ── 28.11 KATEGORİ / KONU ARAMA ────────────────────────────────────────────
// ★ Kullanıcı emri: aramada yazım hatası affedilsin; "polıs" → "Polis",
//   "komusluk" → "Komşuluk". Kural: harf aksanı/şapka farkı önemsiz (ş=s,
//   ı=i, â=a), Arapça hareke silinir, kısa yazım hatası (1-2 harf) tolere edilir.
//   Hem Hadis Bankası kategorileri hem külliyat konuları bu yardımcıyı kullanır.

export const harfSadelestir = (s: string): string =>
  s
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f\u0610-\u061a\u064b-\u065f\u0670]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

/** İki kelime arasındaki düzenleme (Levenshtein) mesafesi — küçük yazım hatası için. */
export function duzenlemeMesafesi(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let onceki = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const simdiki: number[] = [i];
    for (let j = 1; j <= b.length; j++) {
      simdiki[j] = Math.min(
        onceki[j] + 1,
        simdiki[j - 1] + 1,
        onceki[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    onceki = simdiki;
  }
  return onceki[b.length];
}

/** Etiket, normalize edilmiş sorguyla eşleşiyor mu? (tam, önek veya 1-2 harf hata) */
export function kategoriEslesiyor(etiket: string, sorgu: string): boolean {
  if (!sorgu) return true;
  const hedef = harfSadelestir(etiket);
  if (hedef.includes(sorgu)) return true;
  const kelimeler = hedef.split(" ").filter(Boolean);
  return sorgu
    .split(" ")
    .filter(Boolean)
    .every((q) => {
      const tolerans = q.length <= 3 ? 0 : q.length <= 6 ? 1 : 2;
      return kelimeler.some((k) => {
        if (q.length >= 2 && k.length >= 2 && (k.startsWith(q) || q.startsWith(k))) return true;
        return tolerans > 0 && duzenlemeMesafesi(k, q) <= tolerans;
      });
    });
}
