import fs from "node:fs";
import path from "node:path";
const tum = fs.readFileSync("turkce-string-2610.txt", "utf8");
// dosyalara ayır — dosya adı '## src\blogu' biçimli
const parcalar = [];
let cur = null;
for (const l of tum.split("\n")) {
  if (l.startsWith("## ")) { const f = l.slice(3); cur = { f, b: [] }; parcalar.push(cur); }
  else if (cur && l.startsWith("  L")) cur.b.push(l);
}
const gizli = [];
for (const p of parcalar) {
  const f = p.f.split(path.sep).join("/");
  if (f.startsWith("src/data")) continue;
  if (f.startsWith("ai-mockup")) continue; // çalışma klasörleri
  if (f.startsWith("src/asistan")) continue; // asistan veri akışı (dolgu metni) — sonradan
  if (f.startsWith("src/admin") && f.endsWith(".ts")) continue;
  if (f.endsWith(".ts") && !f.includes("/components/") && !f.includes("/studio/") && !f.startsWith("src/i18n")) continue;
  gizli.push(p);
}
fs.writeFileSync("turkce-string-ui-2610.txt", gizli.map(p => `## ${p.f} (${p.b.length})\n` + p.b.join("\n")).join("\n"));
console.log("kalan dosya", gizli.length, "satır", gizli.reduce((t, p) => t + p.b.length, 0));
