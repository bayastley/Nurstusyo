// GEÇİCİ denetim (commit'lenmez): yeni kütüphane/kıssa anahtarlarının değer taraması.
// Grep UTF-8 byte-bazlı yanlış-pozitif verdiği için JS ile okunur.
import fs from "fs";

const keys = ["libAraYerTutucu", "libBosSonuc", "libStudKullan", "ksKissaSayaci", "libStudEklendi"];
let bad = 0;
for (const d of ["tr", "en", "ar", "id", "ur"]) {
  const src = fs.readFileSync(`src/i18n/dicts.${d}.ts`, "utf8");
  const harf = d === "ar" || d === "ur" ? "\\u0600-\\u06FF\\u0750-\\u077F" : "A-Za-z\\u00C0-\\u024F";
  for (const k of keys) {
    const m = src.match(new RegExp(`^  ${k}: "((?:[^"\\\\]|\\\\.)*)"`, "m"));
    if (!m) { console.log(d, k, "EKSIK"); bad++; continue; }
    if (!new RegExp(`[${harf}]`).test(m[1])) { console.log(d, k, "HARFSIZ ->", JSON.stringify(m[1])); bad++; }
  }
}
console.log(bad === 0 ? "PARITE-DEGER-PASS (5x5 anahtar dolu)" : "BULGU=" + bad);
process.exit(bad === 0 ? 0 : 1);
