// Masaüstüne tanıtım.txt yazar (geçici, commit'lenmez) — UTF-8 garantili
import { writeFileSync, readFileSync, existsSync, statSync } from "node:fs";

const HEDEF = "C:/Users/msı/Desktop/tanıtım.txt";
const icerik = readFileSync("scripts/_tanitim-icerik.txt", "utf8");
writeFileSync(HEDEF, icerik, "utf8");
if (!existsSync(HEDEF)) { console.error("dosya oluşmadı"); process.exit(1); }
console.log(`OK → ${HEDEF} (${statSync(HEDEF).size.toLocaleString("tr-TR")} bayt, ${icerik.split("\n").length} satır)`);
