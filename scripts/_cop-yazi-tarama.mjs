// ════════════════════════════════════════════════════════
// _cop-yazi-tarama.mjs — bozuk/çöp yazı tarayıcı (CJK, Vietnamca,
// Kiril-karışık, kontrol karakterleri) — düzeltme öncesi envanter.
// Kullanım: node scripts/_cop-yazi-tarama.mjs
// ════════════════════════════════════════════════════════
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const KOK = join(dirname(fileURLToPath(import.meta.url)), "..", "src");

function* dosyalar(dir) {
  for (const ad of readdirSync(dir)) {
    const yol = join(dir, ad);
    if (statSync(yol).isDirectory()) yield* dosyalar(yol);
    else if (/\.(ts|tsx)$/.test(ad)) yield yol;
  }
}

// Bozuk yazı imzaları: CJK ideografik/başka bloklar, Vietnamca genişletilmiş,
// Yunan karışığı, kontrol karakterleri, uzun latin-uzantı yığını (mojibake)
const IMZALAR = [
  { ad: "CJK (Çince/Japonca)", rx: /[\u3400-\u4DBF\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/g },
  { ad: "Vietnamca genişletilmiş", rx: /[\u1EA0-\u1EFF]/g },
  { ad: "Mojibake şüphesi", rx: /(?:[A-Za-zçğıöşüÇĞİÖŞÜ]{2,}[àâäéèêëîïôöùûü]{2,}){2,}/g },
  { ad: "Kontrol karakteri", rx: /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g },
  { ad: "Tay dili", rx: /[\u0E00-\u0E7F]/g },
  { ad: "Tibet/Myanmar/Khmer", rx: /[\u0F00-\u0FFF\u1000-\u109F\u1780-\u17FF]/g },
];

const bulgular = [];
for (const yol of dosyalar(KOK)) {
  const satirlar = readFileSync(yol, "utf8").split("\n");
  satirlar.forEach((satir, i) => {
    for (const { ad, rx } of IMZALAR) {
      const m = satir.match(rx);
      if (m) bulgular.push({ dosya: yol.replace(KOK, "src"), satir: i + 1, imza: ad, ornek: satir.trim().slice(0, 110) });
    }
  });
}

if (bulgular.length === 0) {
  console.log("▶ TEMİZ ✅ — bozuk yazı imzası bulunamadı");
} else {
  for (const b of bulgular) console.log(`✗ [${b.imza}] ${b.dosya}:${b.satir}\n    ${b.ornek}`);
  console.log(`▶ TOPLAM: ${bulgular.length} bulgu`);
}
process.exit(bulgular.length === 0 ? 0 : 1);
