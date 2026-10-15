// GEÇİCİ rapor (commit'lenmez): en bloğu eksikleri.
import fs from "fs";
const s = fs.readFileSync("src/data/ayetBaslikCokDil.ts", "utf8");
const trM = s.match(/AYET_BASLIKLARI_TR: string\[\] = \[([\s\S]*?)\n\];/);
const trListe = [...trM[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);
for (const dil of ["en", "ar"]) {
  const bas = s.indexOf(`  ${dil}: {`);
  const blok = s.slice(bas, s.indexOf("\n  },", bas));
  const varlar = new Set([...blok.matchAll(/"((?:[^"\\]|\\.)*)": "/g)].map((m) => m[1]));
  const eksik = trListe.filter((k) => !varlar.has(k));
  console.log(`${dil}: var=${varlar.size} eksik=${eksik.length}`);
  console.log(eksik.map((k) => `  "${k}": "",`).join("\n"));
}
