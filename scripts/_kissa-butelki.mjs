import fs from "fs";
const s = fs.readFileSync("src/data/kissaCokDil.ts", "utf8");
const tr = fs.readFileSync("src/data/kissaData.ts", "utf8");
console.log("TR referans (kissaData):", (tr.match(/\{ ad: "/g) || []).length);
for (const dil of ["en", "ar", "id", "ur"]) {
  const re = new RegExp("  " + dil + ": \\[");
  const blokVar = re.test(s);
  // dil bloğu içindeki kayıt sayısı: blok başından sonraki dil-başı/sona kadar
  const bas = s.search(re);
  let son = s.length;
  for (const d2 of ["en", "ar", "id", "ur"]) {
    if (d2 === dil) continue;
    const b2 = s.slice(bas + 10).search(new RegExp("\\n  " + d2 + ": \\["));
    if (b2 !== -1) son = Math.min(son, bas + 10 + b2);
  }
  const kesit = s.slice(bas, son);
  const kayit = (kesit.match(/\{ ad: /g) || []).length;
  const alanEksik = (kesit.match(/\{ ad: "(?:(?!\},\n).)*?\},\n/gs) || []).filter((m) => !/ozet: /.test(m) || !/ders: /.test(m) || !/dua: /.test(m) || !/sure: /.test(m)).length;
  console.log(dil + ": blok=" + blokVar + " kayıt=" + kayit + (kayit !== 19 ? " !! 19 OLMALI" : "") + " alan-eksik=" + alanEksik);
}
console.log("cokdil toplam kayıt:", (s.match(/\{ ad: "/g) || []).length, "(beklenen 76)");
console.log("kalan işaret:", (s.match(/@KISSA_EKLE|@ID_DEVAM|@UR_DEVAM/g) || []).length);
