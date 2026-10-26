// 26.10 — turkce-bagla scriptinin JSX'e düz metin olarak soktuğu ttX2610("k")
// çağrılarını {ttX2610("k")} bracelere sarar; fonksiyon nitelik/satır olmayan
// yerlere dokunmaz. Ayrıca kullanılan anahtarların 5 sözlükte varlığını raporlar.
import fs from "node:fs";
import path from "node:path";

const ROOT = "src";
const out = { changed: [], keys: {} };

function gez(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) gez(p);
    else if (/\.tsx$/.test(f.name)) {
      let metin = fs.readFileSync(p, "utf8");
      const satirlar = metin.split("\n");
      let degisti = false;
      for (let i = 0; i < satirlar.length; i++) {
        let l = satirlar[i];
        const tl = l.trim();
        if (tl.startsWith("//") || tl.startsWith("*")) continue;
        // {ttX2610("k")} / title={ttX2610("k")} — düzgün, dokunma
        // string içinde "ttX2610(" / 'ttX2610(' — değişken, dokunma
        // kalan tüm düz çağrılar → {ttX2610("k")}
        const nx = l.replace(/(?<![{\w"'`])\bttX2610\("([A-Za-z0-9_]+)"\)/g, (m, k) => {
          out.keys[k] = [...(out.keys[k] || []), `${p}:${i + 1}`];
          return `{ttX2610("${k}")}`;
        });
        if (nx !== l) { satirlar[i] = nx; degisti = true; }
        // anahtar toplama (braced'ler dahil)
        for (const m of l.matchAll(/ttX2610\("([A-Za-z0-9_]+)"\)/g)) { out.keys[m[1]] = out.keys[m[1]] || []; }
      }
      if (degisti) { fs.writeFileSync(p, satirlar.join("\n"), "utf8"); out.changed.push(p); }
    }
  }
}
// tüm kullanılan anahtarları topla (tsx + ts)
function uyeler(d, kat) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) uyeler(p, kat);
    else if (/\.tsx?$/.test(f.name)) {
      const metin = fs.readFileSync(p, "utf8");
      if (metin.includes("ttX2610") || metin.includes("tt(") || metin.includes("ttQL(")) {
        for (const m of metin.matchAll(/\b(?:ttX2610|tt|ttQL)\("([A-Za-z0-9_]+)"\)/g)) {
          out.keys[m[1]] = true;
        }
      }
    }
  }
}

gez(ROOT);
fs.writeFileSync("scripts/fix-ttX-braces-2610.log", JSON.stringify(out.changed, null, 2));
console.log("DEĞİŞEN DOSYALAR:", out.changed.length);
console.log(out.changed.join("\n"));
