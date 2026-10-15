// GEÇİCİ temizlik 2 (commit'lenmez): en/ar bloklarında yalnız TR kümesindeki anahtarlar kalır.
import fs from "fs";

const yol = "src/data/ayetBaslikCokDil.ts";
let s = fs.readFileSync(yol, "utf8");

const trM = s.match(/AYET_BASLIKLARI_TR: string\[\] = \[([\s\S]*?)\n\];/);
const trListe = [...trM[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);
const trKume = new Set(trListe);
console.log("TR küme:", trKume.size);

for (const dil of ["en", "ar"]) {
  const bas = s.indexOf(`  ${dil}: {`);
  const son = s.indexOf("\n  },", bas);
  const blok = s.slice(bas, son);
  const ic = blok.slice(blok.indexOf("{") + 1);
  const satirlar = ic.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n").replace(/\\r/g, "\n").split(/\r?\n/);
  const eslesme = /^"((?:[^"\\]|\\.)*)":\s*"((?:[^"\\]|\\.)*)",?$/;
  const ciftler = new Map();
  let cop = 0;
  for (const ham of satirlar) {
    const l = ham.trim();
    if (!l || l.startsWith("//")) continue;
    const m = l.match(eslesme);
    if (!m) { cop++; continue; }
    if (trKume.has(m[1]) && !ciftler.has(m[1])) ciftler.set(m[1], m[2]);
  }
  console.log(`${dil}: geçerli TR çifti=${ciftler.size} çöp=${cop} eksik=${trKume.size - ciftler.size}`);
  const temizIc = [...ciftler.entries()].map(([k, v]) => `    "${k}": "${v}",`).join("\n");
  s = s.slice(0, bas) + `  ${dil}: {\n` + temizIc + "\n" + s.slice(son);
}
fs.writeFileSync(yol, s);
console.log("en + ar blokları yeniden yazıldı");
