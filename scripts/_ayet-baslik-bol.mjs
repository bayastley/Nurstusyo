// ════════════════════════════════════════════════════════════════
// AYET BAŞLIK HARİTASI BÖLME (SRP — geçici script, commit'lenmez)
// ayetBaslikCokDil.ts (2929 satır) → 4 dil dosyası + ana dosya küçülür.
// Dışa açılan arayüz (AYET_BASLIKLARI_TR, ayetBasligi, ayetKartBasligi,
// AYET_BASLIK_TOPLAM) BİREBİR korunur — import edenler etkilenmez.
// ════════════════════════════════════════════════════════════════
import { readFileSync, writeFileSync } from "node:fs";

const DOSYA = "src/data/ayetBaslikCokDil.ts";
const satirlar = readFileSync(DOSYA, "utf8").split("\n");

// 1) Sınırları İÇERİKTEN bul (satır numarasına sabitleme yok — sağlam)
const idxEn = satirlar.indexOf("  en: {");
const idxAr = satirlar.indexOf("  ar: {");
const idxId = satirlar.indexOf("  id: {");
const idxUr = satirlar.indexOf("  ur: {");
const idxKapanis = satirlar.indexOf("};", idxUr);
const idxHarita = satirlar.findIndex((l) => l.startsWith("const HARITA"));
if (idxEn < 0 || idxAr < 0 || idxId < 0 || idxUr < 0 || idxKapanis < 0 || idxHarita < 0) {
  console.error("sınırlar bulunamadı", { idxEn, idxAr, idxId, idxUr, idxKapanis, idxHarita });
  process.exit(1);
}
console.log(`sınırlar: en=${idxEn + 1} ar=${idxAr + 1} id=${idxId + 1} ur=${idxUr + 1} kapanış=${idxKapanis + 1} (1-based)`);

// 2) Dil bloklarını çıkar (başlık satırı hariç; kapanış "  }," hariç)
function dilDosyasi(ad, kod, bas, son) {
  let icerik = satirlar.slice(bas + 1, son);
  while (icerik.length && /^\s*\},?\s*$/.test(icerik[icerik.length - 1])) icerik.pop();
  const girisler = icerik.filter((l) => l.includes('": "')).length;
  const metin = [
    "// ════════════════════════════════════════════════════════",
    `// AYET BAŞLIKLARI — ${ad.toUpperCase()} HARİTASI (SRP ${new Date().toISOString().slice(0, 10)}:`,
    "//   2929 satırlık ayetBaslikCokDil.ts bu dosyaya bölündü; ana dosyada",
    "//   TR liste + ayetBasligi/ayetKartBasligi arayüzü birebir korunur.",
    `//   ${girisler} giriş — kutuphane-kissa-dil-turu.mjs bu sayımı denetler.`,
    "// ════════════════════════════════════════════════════════",
    `export const AYET_BASLIK_HARITA_${kod} = {`,
    `  ${ad}: {`,
    ...icerik,
    "  },",
    "};",
    "",
  ].join("\n");
  writeFileSync(`src/data/ayetBaslikHarita${ad.charAt(0).toUpperCase() + ad.slice(1)}.ts`, metin);
  console.log(`  ${ad}: ${girisler} giriş yazıldı`);
  return girisler;
}

const nEn = dilDosyasi("en", "EN", idxEn, idxAr);
const nAr = dilDosyasi("ar", "AR", idxAr, idxId);
const nId = dilDosyasi("id", "ID", idxId, idxUr);
const nUr = dilDosyasi("ur", "UR", idxUr, idxKapanis);

// 3) Ana dosyayı yeniden yaz: başlık+TR liste + HARITA referansı + fonksiyonlar
const ust = satirlar.slice(0, idxHarita);
const alt = satirlar.slice(idxKapanis + 1);
const yeni = [
  ...ust,
  "import { AYET_BASLIK_HARITA_EN } from \"./ayetBaslikHaritaEn\";",
  "import { AYET_BASLIK_HARITA_AR } from \"./ayetBaslikHaritaAr\";",
  "import { AYET_BASLIK_HARITA_ID } from \"./ayetBaslikHaritaId\";",
  "import { AYET_BASLIK_HARITA_UR } from \"./ayetBaslikHaritaUr\";",
  "",
  "const HARITA: Partial<Record<Lang, Record<string, string>>> = {",
  "  ...AYET_BASLIK_HARITA_EN,",
  "  ...AYET_BASLIK_HARITA_AR,",
  "  ...AYET_BASLIK_HARITA_ID,",
  "  ...AYET_BASLIK_HARITA_UR,",
  "};",
  "",
  ...alt,
].join("\n");
writeFileSync(DOSYA, yeni);
const yeniSatir = yeni.split("\n").length;
console.log(`ana dosya: ${satirlar.length} → ${yeniSatir} satır`);

// 4) Beklenti denetimi
const hedef = 575;
const ok = [nEn, nAr, nId, nUr].every((n) => n === hedef);
console.log(ok ? `✓ 4 dil × ${hedef} giriş — beklenti tuttu` : `✗ sayım sapması: en=${nEn} ar=${nAr} id=${nId} ur=${nUr} (beklenen ${hedef})`);
process.exit(ok ? 0 : 1);
