// ════════════════════════════════════════════════════════
// KESFETARAMA.TS — KesfetModal'dan taşındı (SRP parçalama, 09.10)
// ★ AKILLI SURE ARAMASI (03.10, kullanıcı kararı) — saf yardımcılar:
//   Türkçe şapka/ağız + Arapça harakat normalizasyonu + harf hatası toleransı:
//   "fatiah"→Fâtiha · "bakra"→Bakara · "yasin"→Yâsîn · "الملك"→Mülk · "36"→Yâsîn
// Dışa açık imzalar birebir korunur — KesfetModal aynen kullanmaya devam eder.
// ════════════════════════════════════════════════════════

export function metniHazirla(s: string): string {
  return s
    .toLocaleLowerCase("tr")
    .replace(/[âàáä]/g, "a").replace(/[îìíï]/g, "i").replace(/[ûùúü]/g, "u")
    .replace(/[êèéë]/g, "e").replace(/[ôòóö]/g, "o").replace(/ñ/g, "n")
    .replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ç/g, "c").replace(/ı/g, "i")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
// Arapça: harakat/tatveel/işaretleri at; elif-hamza çeşitlerini birleştir,
// te-mervuta→he, elif-maksura→ya — "الفاتحه" ile "الفاتحة" aynı bulunsun
export function arapcaHazirla(s: string): string {
  return s
    .replace(/[\u0640\u064B-\u065F\u0670\u06D6-\u06ED\u08F0-\u08F3]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[ؤئ]/g, "ي")
    .replace(/\s+/g, "");
}
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let onceki = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const simdiki = [i];
    for (let j = 1; j <= b.length; j++) {
      simdiki[j] = Math.min(onceki[j] + 1, simdiki[j - 1] + 1, onceki[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    onceki = simdiki;
  }
  return onceki[b.length];
}
// kelime ↔ metin eşleşmesi: düz alt dize + harf hatası toleransı + "el/al" takısı
export function kelimeUyar(metin: string, kelime: string): boolean {
  if (!kelime) return true;
  if (metin.includes(kelime)) return true;
  const tolerans = kelime.length <= 3 ? 0 : kelime.length <= 5 ? 1 : 2;
  if (tolerans === 0) return false;
  const parcalar = metin.split(" ");
  if (parcalar.some((p) => levenshtein(p, kelime) <= tolerans)) return true;
  const kisa = kelime.length >= 5 ? kelime.replace(/^(al|el)/, "") : kelime; // "alfatiha" → "fatiha"
  return kisa !== kelime && (metin.includes(kisa) || parcalar.some((p) => levenshtein(p, kisa) <= tolerans));
}
