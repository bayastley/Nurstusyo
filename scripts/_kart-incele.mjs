// GEÇİCİ inceleme (commit'lenmez): ayet kartı havuz yapısı + benzersiz başlıklar.
import fs from "fs";

const dosyalar = [
  "src/data/ayetKartlariData.ts",
  "src/data/ayetKartlariEk.ts",
  "src/data/ayetKartlariMega/parca1.ts",
  "src/data/ayetKartlariMega/parca2.ts",
  "src/data/ayetKartlariMega/parca3.ts",
  "src/data/ayetKartlariMega2/parca1.ts",
  "src/data/ayetKartlariMega2/parca2.ts",
  "src/data/ayetKartlariMega2/parca3.ts",
];

let toplam = 0;
const basliklar = new Map(); // başlık → sayı
const idAlanli = [];
for (const d of dosyalar) {
  const s = fs.readFileSync(d, "utf8");
  const kayitlar = [...s.matchAll(/\{[\s\n]*id: /g)].length;
  const basliklarDosya = [...s.matchAll(/\ntitle: "((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);
  const basliklarSati = [...s.matchAll(/title: "((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);
  toplam += basliklarSati.length;
  for (const b of basliklarSati) basliklar.set(b, (basliklar.get(b) || 0) + 1);
  console.log(d.split("/").pop(), "| id'li kayıt:", kayitlar, "| title:", basliklarSati.length, "(satır-başı:", basliklarDosya.length + ")");
  if (kayitlar > 0) idAlanli.push(d);
}
console.log("───");
console.log("TOPLAM kart:", toplam, "| BENZERSİZ başlık:", basliklar.size);
const tekrar = [...basliklar.entries()].filter(([, n]) => n > 1);
console.log("aynı başlıkla birden çok kart:", tekrar.length, tekrar.slice(0, 6));
console.log("id alanı olan dosyalar:", idAlanli.length ? idAlanli.join(", ") : "YOK");
const ilk = [...basliklar.keys()].slice(0, 14);
console.log("örnek başlıklar:", JSON.stringify(ilk, null, 0));
