// GEÇİCİ (commit'lenmez): ur bloğunda TR kümesi dışındaki anahtarı kaldırır.
import fs from "fs";
const yol = "src/data/ayetBaslikCokDil.ts";
let s = fs.readFileSync(yol, "utf8");
const trM = s.match(/AYET_BASLIKLARI_TR: string\[\] = \[([\s\S]*?)\n\];/);
const trKume = new Set([...trM[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]));
const bas = s.indexOf("  ur: {");
const son = s.indexOf("\n  },", bas);
const blok = s.slice(bas, son);
const satirlar = blok.split(/\r?\n/);
const temiz = [];
for (const satir of satirlar) {
  const m = satir.trim().match(/^"((?:[^"\\]|\\.)*)":\s*"/);
  if (m && !trKume.has(m[1])) { console.log("KALDIRILDI:", JSON.stringify(m[1])); continue; }
  temiz.push(satir);
}
s = s.slice(0, bas) + temiz.join("\n") + s.slice(son);
fs.writeFileSync(yol, s);
console.log("ur bloğu temizlendi");
