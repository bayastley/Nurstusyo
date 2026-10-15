// GEÇİCİ denetim (commit'lenmez): ayetBaslikCokDil değerlerinde TR sızıntısı/boşluk.
import fs from "fs";
const s = fs.readFileSync("src/data/ayetBaslikCokDil.ts", "utf8");
const TR_K = /[ığşçöüİĞŞÇÖÜ]/;
let bad = 0;
for (const dil of ["en", "ar", "id", "ur"]) {
  const bas = s.indexOf(`  ${dil}: {`);
  const blok = s.slice(bas, s.indexOf("\n  },", bas));
  const ciftler = [...blok.matchAll(/"((?:[^"\\]|\\.)*)":\s*"((?:[^"\\]|\\.)*)"/g)];
  let bos = 0, trSizinti = 0;
  for (const [, k, v] of ciftler) {
    if (!v.trim()) { bos++; console.log(`${dil} BOS: ${k}`); }
    if (dil !== "en" && dil !== "id" && TR_K.test(v)) { trSizinti++; console.log(`${dil} TR-SIZINTI: ${k} = ${v.slice(0, 60)}`); }
  }
  console.log(`${dil}: ${ciftler.length} çift | boş=${bos} TR-sızıntı=${trSizinti}`);
  bad += bos + trSizinti;
}
// TR referans listesi + harita kümesi birebir mi (tur scripti bütünlüğü için)
console.log(bad === 0 ? "DEGER-TARAMA-PASS" : "BULGU=" + bad);
process.exit(bad === 0 ? 0 : 1);
