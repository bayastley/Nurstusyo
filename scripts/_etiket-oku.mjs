// GEÇİCİ (commit'lenmez): tur scripti için etiket + id listesi çıkarır.
import fs from "fs";

// 1) Sözlük etiketleri
for (const d of ["tr", "en", "ar", "id", "ur"]) {
  const s = fs.readFileSync(`src/i18n/dicts.${d}.ts`, "utf8");
  for (const k of ["menuKesfet", "ksKissaKosesi", "ksKissaSayaci"]) {
    const m = s.match(new RegExp(`^  ${k}: "((?:[^"\\\\]|\\\\.)*)"`, "m"));
    console.log(d, k, "=", m ? m[1] : "(yok)");
  }
}

// 2) dualar.ts LIBRARY_ITEMS id listesi (sırayla)
const dualar = fs.readFileSync("src/dualar.ts", "utf8");
const idler = [...dualar.matchAll(/\bid: "(ay-[^"]+|hd-[^"]+|du-[^"]+|zk-[^"]+)"/g)].map((m) => m[1]);
console.log("LIBRARY_IDS(" + idler.length + "):", JSON.stringify(idler));

// 3) kissaData.ts TR ad + sure listesi (indeks-hizalı)
const ks = fs.readFileSync("src/data/kissaData.ts", "utf8");
const adlar = [...ks.matchAll(/\{ ad: "((?:[^"\\]|\\.)*)", sure: "((?:[^"\\]|\\.)*)"/g)];
console.log("KISSA_AD(" + adlar.length + "):");
adlar.forEach((m, i) => console.log(" ", i, JSON.stringify(m[1]), "|", JSON.stringify(m[2])));
