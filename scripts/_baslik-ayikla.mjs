// GEÇİCİ ayıklama (commit'lenmez): 8 havuz dosyasından benzersiz TR başlıkları sırayla çıkarır.
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

const sirali = [];
const gorulen = new Set();
let kart = 0;
for (const d of dosyalar) {
  const s = fs.readFileSync(d, "utf8");
  for (const m of s.matchAll(/title: "((?:[^"\\]|\\.)*)"/g)) {
    kart++;
    const t = m[1];
    if (!gorulen.has(t)) { gorulen.add(t); sirali.push(t); }
  }
}
fs.writeFileSync("scripts/_baslik-liste.txt", sirali.map((t, i) => `${i + 1}\t${t}`).join("\n") + "\n");
console.log("kart:", kart, "| benzersiz başlık:", sirali.length);
console.log("liste: scripts/_baslik-liste.txt");
