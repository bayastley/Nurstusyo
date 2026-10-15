// GEÇİCİ teşhis (commit'lenmez): dist'te Arapça karakterler nereye gitti?
import fs from "fs";
const h = fs.readFileSync("dist/index.html", "utf8");
console.log("dist ham Arapça karakter:", (h.match(/[\u0600-\u06FF]/g) || []).length);
console.log("dist urdu harfleri:", (h.match(/[\u0750-\u077F]/g) || []).length);
const i = h.indexOf("Patience of Yusuf");
console.log("EN kıssa civarı:", JSON.stringify(h.slice(i - 140, i + 60)));
const j = h.indexOf("Sudut Kisah");
console.log("ID sekme civarı:", JSON.stringify(h.slice(j - 120, j + 60)));
