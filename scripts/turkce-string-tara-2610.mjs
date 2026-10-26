// String literal içinde kalan Türkçe metin taraması (JSX klasör taramayı atlar)
import fs from "node:fs";
import path from "node:path";

function gez(d, sonuc) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) gez(p, sonuc);
    else if (/\.(tsx|ts)$/.test(f.name)) sonuc[p] = fs.readFileSync(p, "utf8");
  }
  return sonuc;
}
const dosyalar = gez("src", {});
const sonuc = {};
let toplam = 0;
for (const [p, metin] of Object.entries(dosyalar)) {
  const bul = [];
  metin.split("\n").forEach((l, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(l.trim())) return;
    for (const m of l.matchAll(/[`"']([^`"\n]*[çğıöşüÇĞİÖŞÜ][^`"\n]*)[`"']/g)) {
      const s = m[1];
      if (/^(tt|tk|k_|aria)/.test(s)) continue;
      // çeviri anahtar değiller — kod parçası değil, metin
      if (s.length < 3) continue;
      bul.push({ s: i + 1, t: s.slice(0, 100) });
    }
  });
  if (bul.length) { sonuc[p] = bul; toplam += bul.length; }
}
fs.writeFileSync(
  "turkce-string-2610.txt",
  Object.entries(sonuc).map(([f, b]) => `## ${f} (${b.length})\n` + b.map(x => `  L${x.s} ${x.t}`).join("\n")).join("\n") + `\nTOPLAM ${toplam}`,
);
console.log("TOPLAM", toplam, "DOSYA", Object.keys(sonuc).length);
