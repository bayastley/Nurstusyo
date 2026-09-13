// wbw-tr.json'ı genişletilmiş sözlükle birleştirir ve normalize edilmiş arama indeksi ekler
const fs = require("fs");
const base = JSON.parse(fs.readFileSync("public/wbw-tr.json", "utf8"));
const extra = JSON.parse(fs.readFileSync("scripts/wbw-extra.json", "utf8"));
const norm = (s) => s
  .replace(/[\u0670\u06E1\u064B-\u065F\u0640\u06D6-\u06ED\u0653-\u0655]/g, "")
  .replace(/\u0671/g, "\u0627").replace(/\u0649/g, "\u064A").replace(/\u0629/g, "\u0647")
  .replace(/[\u06CC]/g, "\u064A").replace(/\s+/g, "").trim();

const merged = { ...base.translations, ...extra };
// normalize indeks: norm(ar) → tr
const index = {};
for (const [ar, tr] of Object.entries(merged)) {
  const n = norm(ar);
  if (n && !index[n]) index[n] = tr;
}
fs.writeFileSync("public/wbw-tr.json", JSON.stringify({ translations: merged, normIndex: index }, null, 0));
console.log("birleşik sözlük:", Object.keys(merged).length, "kök · normalize indeks:", Object.keys(index).length);
