// GEÇİCİ (commit'lenmez): ur bloğu tekilleştirme.
import fs from "fs";
const yol = "src/data/ayetBaslikCokDil.ts";
let s = fs.readFileSync(yol, "utf8");
const bas = s.indexOf("  ur: {");
const son = s.indexOf("\n  },", bas);
const blok = s.slice(bas, son);
const satirlar = blok.split(/\r?\n/);
const gorulen = new Set();
const temiz = [];
let atik = 0;
for (const satir of satirlar) {
  const i = satir.indexOf('": "');
  if (i === -1) { temiz.push(satir); continue; }
  const anahtar = satir.slice(4, i); // 4 boşluk girinti sonrası anahtar
  if (gorulen.has(anahtar)) { atik++; continue; }
  gorulen.add(anahtar);
  temiz.push(satir);
}
s = s.slice(0, bas) + temiz.join("\n") + s.slice(son);
fs.writeFileSync(yol, s);
console.log("ur: kopyalı satır atıldı =", atik, "| kalan satır =", temiz.length);
