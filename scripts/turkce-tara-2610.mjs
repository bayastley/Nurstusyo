// Türkçe-kalatı tarayıcı: JSX metni (>…<) ve title/placeholder/alt attr'ları
import fs from "node:fs";
import path from "node:path";

const sonuc = {};
function gez(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) gez(p);
    else if (/\.(tsx|ts)$/.test(f.name)) {
      const satirlar = fs.readFileSync(p, "utf8").split("\n");
      const bul = [];
      satirlar.forEach((l, i) => {
        if (/^\s*(\/\/|\*|\/\*)/.test(l)) return; // comment lines skip
        let m = l.match(/>([^<>{}"`]*[çğıöşüÇĞİÖŞÜ][^<>{}"`]*)</g);
        if (m) for (const x of m) bul.push({ s: i + 1, t: x.slice(1, -1).trim(), tip: "jsx" });
        m = l.match(/(?:title|placeholder|alt|aria-label)="([^"{}]*[çğıöşüÇĞİÖŞÜ][^"{}]*)"/g);
        if (m) for (const x of m) bul.push({ s: i + 1, t: x, tip: "attr" });
        m = l.match(/(?:title|placeholder|alt|aria-label)=\{?`([^`{}]*[çğıöşüÇĞİÖŞÜ][^`]*)`/g);
        if (m) for (const x of m) bul.push({ s: i + 1, t: x, tip: "attr" });
      });
      if (bul.length) sonuc[p.split(path.sep).join("/")]=bul;
    }
  }
}
gez("src");
let top = 0;
const satir = [];
for (const [f, b] of Object.entries(sonuc)) {
  top += b.length;
  satir.push(`## ${f} (${b.length})`);
  b.slice(0, 10).forEach((x) => satir.push(`  L${x.s} [${x.tip}] ${x.t.slice(0, 80)}`));
  if (b.length > 10) satir.push(`  …+${b.length - 10}`);
}
console.log(satir.join("\n"));
console.log("TOPLAM", top);
