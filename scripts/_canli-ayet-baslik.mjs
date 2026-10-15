// GEÇİCİ canlı doğrulama (commit'lenmez): ayet başlık çevirileri yayında mı?
import fs from "fs";

const html = await (await fetch("https://www.nurstudyo.com/?t=" + Date.now())).text();
const coz = (s) => s
  .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
  .replace(/\\x([0-9a-fA-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
const decoded = coz(html);

function blok(metin, dil) {
  const baslangic = metin.indexOf("const HARITA");
  const bolum = metin.slice(baslangic, metin.indexOf("\n};", baslangic));
  const bas = bolum.indexOf(`\n  ${dil}: {`);
  return bolum.slice(bas, bolum.indexOf("\n  },", bas));
}
function deger(blokMetin, anahtar) {
  const k = `"${anahtar}": "`;
  const i = blokMetin.indexOf(k);
  return i >= 0 ? blokMetin.slice(i + k.length, blokMetin.indexOf(`"`, i + k.length)) : "";
}
const ab = fs.readFileSync("src/data/ayetBaslikCokDil.ts", "utf8");
// Örnek başlıklar: ilk orta-son karışımı 3'er (ID_DILIMI belirsizliğini kırmak için çeşitli)
const ornekler = ["Ayete'l-Kürsî", "Sabreden Hamdeden", "Mercan Fideliği", "Rabbin İçin Namaz Kıl"];
const kontroller = [];
for (const dil of ["en", "ar", "id", "ur"]) {
  const b = blok(ab, dil);
  for (const o of ornekler) kontroller.push([`${dil}: ${o}`, deger(b, o)]);
}
let bad = 0;
for (const [ad, v] of kontroller) {
  const ok = v && decoded.includes(v);
  if (!ok) bad++;
  console.log((ok ? "✓ " : "✗ ") + ad + (ok ? "" : " → " + JSON.stringify((v || "").slice(0, 50))));
}
console.log(bad === 0 ? "CANLI-AYET-BASLIK-PASS: 16/16 yayında" : "CANLI-BULGU=" + bad);
process.exit(bad === 0 ? 0 : 1);
