// ═══════════════════════════════════════════════════════════
// ESM UYUMLULUK TARAYICISI — api/**/*.ts dosyalarını tarar
//
// NEDEN: package.json "type": "module" → Vercel tüm API fonksiyonlarını
// ESM derler. CommonJS kalıntısı (require, module.exports, __dirname…)
// kalan dosya DEPLOY'DA FUNCTION_INVOCATION_FAILED ile çöker (27.09'da
// 30 API'de yaşandı). Bu script o kalıntıları deploy ÖNCESİ yakalar.
//
// KULLANIM:
//   npm run test:esm            → api/ taranır; ihlal varsa hata koduyla çıkar
//   node scripts/esm-tarama.mjs → aynı şey
//
// KONTROLLER:
//   1. require(...) çağrısı            → yasak (statik import yaz)
//   2. createRequire                   → yasak
//   3. module.exports / exports.x      → yasak (export yaz)
//   4. __dirname / __filename          → yasak (import.meta.url kullan)
//   5. module.paths / require.main     → yasak
//   6. export default yoksa            → uyarı (Vercel fonksiyonu çalışmaz)
//   7. dinamik await import("...")     → İZİNLİ (ESM'de meşru)
//
// YANLIŞ-POZİTİF KORUMASI: yorum satırları ve bloklar maskeleme dışıdır —
// "★ 27.09 FIX: require() ESM'de patlıyor" gibi tarihî yorumlar ihlal sayılmaz.
// Dizgiler korunur; yalnız gerçek kod ihlalleri yakalanır.
// ═══════════════════════════════════════════════════════════

import fs from "fs";
import path from "path";

const API_DIR = path.resolve(process.argv[2] ?? "api");
const EXIT_HATA = 1;

const KURALLAR = [
  {
    id: "require-cagrisi",
    aciklama: 'require() yasak — statik import yaz (örn: import crypto from "crypto")',
    test: /(?<![\w.$])require\s*\(/g,
  },
  {
    id: "create-require",
    aciklama: "createRequire yasak — ESM'de require köprüsü kurma, import yaz",
    test: /createRequire/g,
  },
  {
    id: "module-exports",
    aciklama: "module.exports / exports.x yasak — `export` veya `export default` yaz",
    test: /(?<![\w.$])(?:module\.exports|exports\s*\.\s*\w+\s*=|exports\[)/g,
  },
  {
    id: "dunder-yolu",
    aciklama: "__dirname/__filename yasak — path.dirname(fileURLToPath(import.meta.url)) kullan",
    test: /__(?:dirname|filename)\b/g,
  },
  {
    id: "module-diger",
    aciklama: "module.paths / require.main / module.id / module nesnesi yasak — ESM'de yok",
    test: /(?<![\w.$])(?:require\.main|module\.paths|module\.id|module)\s*(?:\.|=|===|!==|\)|,|$)/g,
  },
];

function satirNo(icerik, indeks) {
  return icerik.slice(0, indeks).split("\n").length;
}

/** Yorumları boşlukla köörleştirir (dizgiler korunur). Kod-only tarama için. */
function yorumlariMaskele(icerik) {
  const chars = icerik.split("");
  let i = 0;
  while (i < chars.length) {
    const ch = chars[i];
    const next = chars[i + 1];
    if (ch === "/" && next === "/") {
      let bitir = i;
      while (bitir < chars.length && chars[bitir] !== "\n") bitir++;
      for (let k = i; k < bitir; k++) if (chars[k] !== "\n") chars[k] = " ";
      i = bitir;
    } else if (ch === "/" && next === "*") {
      let bitir = icerik.indexOf("*/", i + 2);
      bitir = bitir === -1 ? chars.length : bitir + 2;
      for (let k = i; k < bitir; k++) if (chars[k] !== "\n") chars[k] = " ";
      i = bitir;
    } else if (ch === '"' || ch === "'" || ch === "`") {
      let bitir = i + 1;
      while (bitir < chars.length) {
        if (chars[bitir] === "\\") { bitir += 2; continue; }
        if (chars[bitir] === ch) { bitir++; break; }
        bitir++;
      }
      i = bitir;
    } else {
      i++;
    }
  }
  return chars.join("");
}

function main() {
  if (!fs.existsSync(API_DIR)) {
    console.error("✗ Klasör bulunamadı: " + API_DIR);
    process.exit(EXIT_HATA);
  }

  const dosyalar = [];
  const gez = (klasor) => {
    for (const ad of fs.readdirSync(klasor, { withFileTypes: true })) {
      const tam = path.join(klasor, ad.name);
      if (ad.isDirectory()) gez(tam);
      else if (ad.name.endsWith(".ts")) dosyalar.push(tam);
    }
  };
  gez(API_DIR);

  if (!dosyalar.length) {
    console.error("✗ " + API_DIR + " altında .ts dosyası yok");
    process.exit(EXIT_HATA);
  }

  const ihlaller = [];
  const uyarilar = [];

  for (const dosya of dosyalar.sort()) {
    const icerik = fs.readFileSync(dosya, "utf8");
    const maske = yorumlariMaskele(icerik);
    const gosterim = path.relative(process.cwd(), dosya);

    for (const kural of KURALLAR) {
      kural.test.lastIndex = 0;
      let m;
      let guvenlikSayaci = 0;
      while ((m = kural.test.exec(maske)) !== null) {
        // ★ Sonsuz döngü koruması: sıfır-uzunluk eşleşme lastIndex'i ilerletmez
        if (m[0].length === 0) { kural.test.lastIndex++; if (++guvenlikSayaci > 1000) break; continue; }
        ihlaller.push({
          dosya: gosterim,
          satir: satirNo(icerik, m.index),
          kural: kural.id,
          mesaj: kural.aciklama,
          ornek: icerik.slice(m.index, m.index + 60).split("\n")[0].trim(),
        });
        if (++guvenlikSayaci > 1000) break;
      }
    }

    // Vercel fonksiyonu export default ister — yoksa uyarı (ortak yardımcı dosyalar meşru)
    if (!/export\s+default/.test(maske)) {
      uyarilar.push(gosterim + " — export default yok (Vercel fonksiyonu değilse yoksay)");
    }
  }

  console.log("═══════════════════════════════════════════════════");
  console.log(" ESM UYUMLULUK TARAYICISI — " + dosyalar.length + " API dosyası");
  console.log("═══════════════════════════════════════════════════");

  for (const u of uyarilar) console.log("  ⚠ " + u);

  if (!ihlaller.length) {
    console.log("  ✓ Tüm " + dosyalar.length + " dosya ESM uyumlu — require/exports/__dirname kalıntısı YOK");
    console.log("▶ SONUÇ: PASS ✅");
    process.exit(0);
  }

  console.log("  ✗ " + ihlaller.length + " ihlal bulundu:");
  for (const i of ihlaller) {
    console.log("");
    console.log("  ✗ " + i.dosya + ":" + i.satir + "  [" + i.kural + "]");
    console.log("    " + i.mesaj);
    console.log("    → " + i.ornek);
  }
  console.log("");
  console.log("▶ SONUÇ: FAIL ❌ — deploy ÖNCESİ düzelt");
  process.exit(EXIT_HATA);
}

main();
