import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

// ════════════════════════════════════════════════════════
// İÇERİK BÜTÜNLÜĞÜ KONTROLÜ (yol haritası madde 89)
// src/data altındaki Arapça metinleri tarar:
//   • bozuk karakter (U+FFFD, mojibake) → HATA
//   • boş Arapça alan (ar: "") → HATA
//   • baseline'a göre değişen dosya → ONAY GEREKLİ
// Kullanım:
//   node scripts/icerik-butunlugu.mjs           → denetle
//   node scripts/icerik-butunlugu.mjs --yaz     → baseline'ı yenile
// ════════════════════════════════════════════════════════

const KOK = path.resolve("src/data");
const BASELINE = path.resolve("scripts/icerik-butunlugu.json");
const ARAPCA = /[\u0600-\u06FF]/;
const BOZUK = /[\uFFFD]|Ã[\u0080-\u00BF]|â€|Åž|Ä±/;

function dosyalar(dir) {
  const out = [];
  for (const ad of fs.readdirSync(dir, { withFileTypes: true })) {
    const tam = path.join(dir, ad.name);
    if (ad.isDirectory()) out.push(...dosyalar(tam));
    else if (/\.(ts|tsx)$/.test(ad.name)) out.push(tam);
  }
  return out;
}

const hatalar = [];
const rapor = {};

for (const yol of dosyalar(KOK)) {
  const metin = fs.readFileSync(yol, "utf8");
  const rel = path.relative(process.cwd(), yol).replace(/\\/g, "/");
  const arapca = [];
  for (const satir of metin.split(/\r?\n/)) {
    if (ARAPCA.test(satir)) {
      if (BOZUK.test(satir)) hatalar.push(`${rel}: bozuk karakter → ${satir.trim().slice(0, 90)}`);
      arapca.push(satir.trim());
    }
    if (/(["']?)(ar|arapca|arabic)\1\s*:\s*["']\s*["']/.test(satir)) hatalar.push(`${rel}: boş Arapça alan → ${satir.trim().slice(0, 90)}`);
  }
  if (!arapca.length) continue;
  const liste = arapca.sort();
  rapor[rel] = {
    adet: liste.length,
    ozet: crypto.createHash("sha256").update(liste.join("\n")).digest("hex").slice(0, 16),
  };
}

const onceki = fs.existsSync(BASELINE) ? JSON.parse(fs.readFileSync(BASELINE, "utf8")) : null;
const degisen = [];
if (onceki) {
  for (const [dosya, bilgi] of Object.entries(rapor)) {
    if (!onceki[dosya]) degisen.push(`+ yeni: ${dosya} (${bilgi.adet})`);
    else if (onceki[dosya].ozet !== bilgi.ozet) degisen.push(`~ değişti: ${dosya} (${onceki[dosya].adet} → ${bilgi.adet})`);
  }
  for (const dosya of Object.keys(onceki)) if (!rapor[dosya]) degisen.push(`- kaldırıldı: ${dosya}`);
}

const dosyaSayisi = Object.keys(rapor).length;
const dizeSayisi = Object.values(rapor).reduce((n, b) => n + b.adet, 0);

if (process.argv.includes("--yaz")) {
  fs.writeFileSync(BASELINE, JSON.stringify(rapor, null, 2) + "\n", "utf8");
  console.log(`Baseline yazıldı: ${dosyaSayisi} dosya · ${dizeSayisi} Arapça satır`);
  process.exit(0);
}

console.log(`İçerik taraması: ${dosyaSayisi} dosya · ${dizeSayisi} Arapça satır`);
if (hatalar.length) {
  console.log(`\nHATA (${hatalar.length}):`);
  hatalar.slice(0, 40).forEach((h) => console.log("  " + h));
} else {
  console.log("Bozuk karakter / boş Arapça alan: yok");
}
if (degisen.length) {
  console.log(`\nBaseline farkı (${degisen.length}) — içerik gözden geçirildiyse: node scripts/icerik-butunlugu.mjs --yaz`);
  degisen.slice(0, 40).forEach((d) => console.log("  " + d));
}

process.exit(hatalar.length || degisen.length ? 1 : 0);
