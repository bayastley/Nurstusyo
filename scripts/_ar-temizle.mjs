// GEÇİCİ temizlik (commit'lenmez): ar bloğunu normalize eder.
import fs from "fs";

const yol = "src/data/ayetBaslikCokDil.ts";
let s = fs.readFileSync(yol, "utf8");

// TR kümesi
const trM = s.match(/AYET_BASLIKLARI_TR: string\[\] = \[([\s\S]*?)\n\];/);
const trListe = [...trM[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);
const trKume = new Set(trListe);
console.log("TR liste:", trListe.length, "| tekrar:", trListe.length - trKume.size);

// ar bloğunu çek
const bas = s.indexOf("  ar: {");
const son = s.indexOf("\n  },", bas);
let blok = s.slice(bas, son);
const ic = blok.slice(blok.indexOf("{") + 1);

// literal \n / \r kalıntılarını gerçek satır kesmesine çevir
const duz = ic.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n").replace(/\\r/g, "\n");
const satirlar = duz.split(/\r?\n/);

const eslesme = /^"((?:[^"\\]|\\.)*)":\s*"((?:[^"\\]|\\.)*)",?$/;
const ciftler = new Map(); // sırayı korur
const cop = [];
for (const ham of satirlar) {
  const l = ham.trim();
  if (!l || l.startsWith("//")) continue;
  const m = l.match(eslesme);
  if (!m) { cop.push(l.slice(0, 100)); continue; }
  if (!ciftler.has(m[1])) ciftler.set(m[1], m[2]);
}
console.log("geçerli çift:", ciftler.size, "| çöp satır:", cop.length);
cop.slice(0, 10).forEach((c) => console.log("  ÇÖP:", c));
const eksik = trListe.filter((k) => !ciftler.has(k));
console.log("eksik AR:", eksik.length);
fs.writeFileSync("scripts/_ar-eksik.txt", eksik.join("\n") + "\n");

// bloğu temiz haliyle geri yaz
const temizIc = [...ciftler.entries()].map(([k, v]) => `    "${k}": "${v}",`).join("\n");
const yeniBlok = `  ar: {\n${temizIc}\n`;
s = s.slice(0, bas) + yeniBlok + s.slice(son);
fs.writeFileSync(yol, s);
console.log("ar bloğu yeniden yazıldı — çift:", ciftler.size, "| eksik liste: scripts/_ar-eksik.txt");
