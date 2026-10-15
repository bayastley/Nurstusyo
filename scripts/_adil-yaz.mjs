// Masaüstüne "adil açıklama.txt" yazar (geçici, commit'lenmez)
import { writeFileSync, readFileSync, existsSync, statSync } from "node:fs";

const HEDEF = "C:/Users/msı/Desktop/adil açıklama.txt";
const icerik = readFileSync("scripts/_adil-icerik.txt", "utf8");
writeFileSync(HEDEF, icerik, "utf8");
if (!existsSync(HEDEF)) { console.error("dosya oluşmadı"); process.exit(1); }
console.log(`OK → ${HEDEF} (${statSync(HEDEF).size.toLocaleString("tr-TR")} bayt, ${icerik.split("\n").length} satır)`);
