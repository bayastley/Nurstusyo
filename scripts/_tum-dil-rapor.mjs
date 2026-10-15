// GEÇİCİ rapor (commit'lenmez): tüm dil blokları eksikleri.
import fs from "fs";
const s = fs.readFileSync("src/data/ayetBaslikCokDil.ts", "utf8");
const trM = s.match(/AYET_BASLIKLARI_TR: string\[\] = \[([\s\S]*?)\n\];/);
const trListe = [...trM[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);
console.log("TR:", trListe.length);
for (const dil of ["en", "ar", "id", "ur"]) {
  const bas = s.indexOf(`  ${dil}: {`);
  const blok = s.slice(bas, s.indexOf("\n  },", bas));
  const varlar = new Set([...blok.matchAll(/"((?:[^"\\]|\\.)*)": "/g)].map((m) => m[1]));
  const eksik = trListe.filter((k) => !varlar.has(k));
  console.log(`${dil}: var=${varlar.size} eksik=${eksik.length}`);
  if (eksik.length) console.log("  " + eksik.join(" | "));
}
