// ★ 26.10 final tarama: t()/tt() anahtarları sözlükte var mı?
import fs from "node:fs";
import path from "node:path";

const dict = JSON.parse(fs.readFileSync("src/i18n/dicts.tr.json", "utf8"));
const keys = new Set(Object.keys(dict));
const miss = {};

function gez(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) { gez(p); continue; }
    if (!/\.(tsx|ts)$/.test(f.name)) continue;
    const satirlar = fs.readFileSync(p, "utf8").split("\n");
    satirlar.forEach((l, i) => {
      if (/^\s*(\/\/|\*|\/\*)/.test(l)) return;
      const re = /[^A-Za-z0-9_](?:t|tt|ttX2610|dX2610)\(\s*"([^"]+)"/g;
      let m;
      while ((m = re.exec(l))) {
        const k = m[1];
        if (!keys.has(k)) (miss[k] || (miss[k] = [])).push(p.split(path.sep).join("/") + ":L" + (i + 1));
      }
    });
  }
}
gez("src");
const anahtarlar = Object.keys(miss);
console.log("sözlükte olmayan t()/tt() anahtar:", anahtarlar.length);
for (const k of anahtarlar.slice(0, 30)) console.log(" -", k, "→", miss[k].length, "kullanım");
fs.writeFileSync("son-kontrol-2610b.json", JSON.stringify(miss, null, 1));
