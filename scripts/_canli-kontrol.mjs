// GEÇİCİ canlı doğrulama v2 (commit'lenmez): esbuild ASCII kaçışlarını çöz,
// beklenen metinleri KAYNAK DOSYALARDAN okuyup canlı HTML'de ara.
import fs from "fs";

const html = await (await fetch("https://www.nurstudyo.com/?t=" + Date.now())).text();
const coz = (s) => s
  .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
  .replace(/\\x([0-9a-fA-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
const decoded = coz(html);
console.log("html:", html.length, "| çözülmüş:", decoded.length, "| çözülmüş Arapça karakter:", (decoded.match(/[\u0600-\u06FF]/g) || []).length);

const TR_K = /[ığşçöüİĞŞÇÖÜ]/;
function blok(metin, dil, baslangic, tur) {
  const bolum = metin.slice(metin.indexOf(baslangic));
  const son = bolum.indexOf("\n};");
  const govde = bolum.slice(0, son > 0 ? son : undefined);
  const re = tur === "obje" ? new RegExp(`\\n  ${dil}: \\{([\\s\\S]*?)\\n  \\},`) : new RegExp(`\\n  ${dil}: \\[([\\s\\S]*?)\\n  \\],`);
  const m = govde.match(re);
  return m ? m[1] : null;
}
function sozlukDeger(dil, anahtar) {
  const m = fs.readFileSync(`src/i18n/dicts.${dil}.ts`, "utf8").match(new RegExp(`^  ${anahtar}: "((?:[^"\\\\]|\\\\.)*)"`, "m"));
  return m ? m[1].replace(/\\"/g, '"') : null;
}

const kut = fs.readFileSync("src/data/kutuphaneCokDil.ts", "utf8");
const kc = fs.readFileSync("src/data/kissaCokDil.ts", "utf8");
const arKut = blok(kut, "ar", "const LIBRARY_COKDIL", "obje");
const idKut = blok(kut, "id", "const LIBRARY_COKDIL", "obje");
const urKut = blok(kut, "ur", "const LIBRARY_COKDIL", "obje");
const arKissa = blok(kc, "ar", "const KISSA_COKDIL", "dizi");
const urKissa = blok(kc, "ur", "const KISSA_COKDIL", "dizi");

const deger = (blokMetin, re) => blokMetin?.match(re)?.[1] || "";
const kontroller = [
  ["en ay-255 başlık", deger(blok(kut, "en", "const LIBRARY_COKDIL", "obje"), /"ay-255": \{ title: "((?:[^"\\]|\\.)*)"/)],
  ["ar ay-255 başlık", deger(arKut, /"ay-255": \{ title: "((?:[^"\\]|\\.)*)"/)],
  ["id zk-subhan anlam", deger(idKut, /"zk-subhan": \{[^}]*?tr: "((?:[^"\\]|\\.)*)"/)],
  ["ur du-sabah anlam", deger(urKut, /"du-sabah": \{[^}]*?tr: "((?:[^"\\]|\\.)*)"/)],
  ["ar kıssa-1 ad", deger(arKissa, /\{ ad: "((?:[^"\\]|\\.)*)"/)],
  ["ur kıssa-1 ad", deger(urKissa, /\{ ad: "((?:[^"\\]|\\.)*)"/)],
  ["en sayaç kalıbı", sozlukDeger("en", "ksKissaSayaci")],
  ["id kıssa sekmesi", sozlukDeger("id", "ksKissaKosesi")],
  ["tr kıssa adı (referans)", "Hz. Yûsuf'un Sabrı"],
];
let bad = 0;
for (const [ad, s] of kontroller) {
  const ok = s && decoded.includes(s);
  if (!ok) bad++;
  console.log((ok ? "✓ " : "✗ ") + ad + (ok ? "" : "  → " + JSON.stringify((s || "").slice(0, 60))));
}
console.log(bad === 0 ? "CANLI-CEVIRI-PASS: 9/9 yayında (kaçış-çözümlü eşleşme)" : "CANLI-BULGU=" + bad);
process.exit(bad === 0 ? 0 : 1);
