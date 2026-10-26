// Kullanılan anahtarları (her türlü t("k") çağrısi) toplar, 5 sözlükte eksikleri listeler.
import fs from "node:fs";
import path from "node:path";

function gez(d, sonuc) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) gez(p, sonuc);
    else if (/\.tsx?$/.test(f.name) && !p.includes("dev\\")) {
      sonuc[p] = fs.readFileSync(p, "utf8");
    }
  }
  return sonuc;
}
const dosyalar = gez("src", {});
const kullanilan = new Set();
for (const metin of Object.values(dosyalar)) {
  for (const m of metin.matchAll(/\b(?:ttX2610|tt|ttQL|transleted|translate)\(\s*(?:typeof.*?\?\s*)?["'`]([A-Za-z0-9_]+)["'`]/g)) kullanilan.add(m[1]);
  // translate(lang, "key")
  for (const m of metin.matchAll(/translate\([^,]+,\s*["'`]([A-Za-z0-9_]+)["'`]\)/g)) kullanilan.add(m[1]);
}
const dicts = {};
for (const d of ["tr", "en", "ar", "id", "ur"]) {
  const f = JSON.parse(fs.readFileSync(`src/i18n/dicts.${d}.json`, "utf8"));
  dicts[d] = f;
}
const eksik = {};
for (const d of ["tr", "en", "ar", "id", "ur"]) {
  for (const k of kullanilan) if (!(k in dicts[d])) (eksik[d] = eksik[d] || []).push(k);
}
fs.writeFileSync("eksikler-2610.json", JSON.stringify(eksik, null, 2));
console.log("kullanilan:", kullanilan.size);
for (const d of ["tr", "en", "ar", "id", "ur"]) console.log(d, "eksik:", (eksik[d] || []).length, (eksik[d] || []).slice(0, 60).join(", "));
