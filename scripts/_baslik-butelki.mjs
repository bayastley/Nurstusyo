// GEÇİCİ bütünlük denetimi (commit'lenmez): ayetBaslikCokDil.ts
import fs from "fs";

const s = fs.readFileSync("src/data/ayetBaslikCokDil.ts", "utf8");

// TR referans liste
const trM = s.match(/AYET_BASLIKLARI_TR: string\] = \[([\s\S]*?)\n\];/);
const trListe = trM ? [...trM[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]) : [];
const trTekrar = trListe.length - new Set(trListe).size;

console.log("TR liste:", trListe.length, "başlık | tekrar:", trTekrar);
const trKume = new Set(trListe);

let hepsiTamam = true;
for (const dil of ["en", "ar", "id", "ur"]) {
  const baslangic = s.indexOf(`  ${dil}: {`);
  const kapanis = s.indexOf("\n  },", baslangic);
  const blok = s.slice(baslangic, kapanis);
  const anahtarlar = [...blok.matchAll(/"((?:[^"\\]|\\.)*)": "/g)].map((m) => m[1]);
  const tekrar = anahtarlar.length - new Set(anahtarlar).size;
  // TR'de olmayan anahtar (yanlış kopya) + TR kümesinde eksikler
  const yabanci = anahtarlar.filter((k) => !trKume.has(k));
  const eksik = [...trKume].filter((k) => !anahtarlar.includes(k));
  // bozuk satır kalıntıları
  const bozuk = blok.split(/\r?\n/).filter((l) => /\\r|S\.React|15 O Yeter|بوغو|Kantlanıp|@AR_DEVAM|@EN_DEVAM|@ID_DEVAM|@UR_DEVAM/.test(l));
  const degerBozuk = blok.split(/\r?\n/).filter((l) => /: ".*",\\n/.test(l));
  console.log(`${dil}: anahtar=${anahtarlar.length} tekrar=${tekrar} yabancı=${yabanci.length} eksik=${eksik.length} bozuk-satır=${bozuk.length + degerBozuk.length}`);
  if (yabanci.length) { hepsiTamam = false; console.log("  yabancı:", yabanci.slice(0, 6).join(" | ")); }
  if (bozuk.length) { hepsiTamam = false; console.log("  bozuk:", bozuk.slice(0, 6).map((l) => l.trim().slice(0, 90)).join(" || ")); }
  if (degerBozuk.length) { hepsiTamam = false; console.log("  degerBozuk:", degerBozuk.slice(0, 4).map((l) => l.trim().slice(0, 90)).join(" || ")); }
  if (eksik.length && eksik.length <= 12) console.log("  eksik:", eksik.join(" | "));
  if (eksik.length > 12) console.log("  eksik (ilk 12):", eksik.slice(0, 12).join(" | "));
}
console.log(hepsiTamam ? "YAPI-TAMAM (değerler henüz dolmamış olabilir)" : "YAPI-BOZUK — temizlik gerekli");
