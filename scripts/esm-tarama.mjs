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
//   node scripts/esm-tarama.mjs --duman → MODAL DUMAN TESTİ: tüm modalları
//     Chrome'da X / dış-tıklama / Esc üçlüsünde gezer (DUMAN_URL env ile hedef,
//     varsayılan http://localhost:5173; DUMAN_TUR=hizli ile tek kapatma yolu)
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
const SRC_DIR = path.resolve("src");
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

// ═══════════════════════════════════════════════════════════
// İMPORT BÜTÜNLÜĞÜ TARAYICISI (30.09) — src/**/*.tsx
//
// NEDEN: SRP taşımalarında ModalsContainer'dan PremiumModal + ZipExplorer
// import'ları düşmüştü; esbuild JSX'teki <PremiumModal/> global değişken sanıp
// build'i GEÇİRDİ, runtime'da ReferenceError → tüm app ErrorBoundary'ye çakıldı.
// Bu bölüm JSX'te kullanılan <Bileşen /> adlarını dosyanın import listesi +
// yerel tanımlarıyla karşılaştırır; eksik import build'de PATLAR.
//
// YANLIŞ-POZİTİF KORUMASI:
//  - `foo<Genel>` generic'leri: < öncesi harf/rakam/) olan durumlar ATLANIR
//    (yalnız JSX konumundaki bare <BüyükHarf bakılır)
//  - aynı dosyada tanımlı function/class/const/interface/type sayılır
//  - React namespace ve whitelist serbest
// ═══════════════════════════════════════════════════════════

const IMPORT_WHITELIST = new Set(["React", "Fragment", "Suspense"]);

function tsxTopla(klasor, liste) {
  for (const ad of fs.readdirSync(klasor, { withFileTypes: true })) {
    const tam = path.join(klasor, ad.name);
    if (ad.isDirectory()) tsxTopla(tam, liste);
    else if (ad.name.endsWith(".tsx")) liste.push(tam);
  }
}

function importlariVeTanimlariTopla(icerik) {
  const adlar = new Set(IMPORT_WHITELIST);
  const maske = yorumlariMaskele(icerik);
  const importRe = /import\s+(?:type\s+)?(?:([A-Za-z]\w*)\s*,?\s*)?(?:\{([^}]*)\})?\s*from/g;
  let m;
  while ((m = importRe.exec(maske)) !== null) {
    if (m[1]) adlar.add(m[1]);
    if (m[2]) {
      for (const parca of m[2].split(",")) {
        const ad = parca.trim().replace(/^type\s+/, "").split(/\s+as\s+/).pop().trim();
        if (ad) adlar.add(ad);
      }
    }
  }
  const tanimRe = /(?:^|\n)\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?(?:function|class)\s+([A-Z]\w*)|(?:^|\n)\s*(?:export\s+)?(?:const|let|var)\s+([A-Z]\w*)|(?:^|\n)\s*(?:export\s+)?(?:interface|type)\s+([A-Z]\w*)/g;
  while ((m = tanimRe.exec(maske)) !== null) {
    for (const g of [m[1], m[2], m[3]]) if (g) adlar.add(g);
  }
  // ★ Destructuring yeniden adlandırma: ({ ikon: Icon }) / (a: B) → B yereldir
  const destrRe = /\{[^{}]*?\b\w+\s*:\s*([A-Z]\w*)[^{}]*?\}/g;
  while ((m = destrRe.exec(maske)) !== null) adlar.add(m[1]);
  return adlar;
}

function importButunluguTara() {
  const dosyalar = [];
  if (!fs.existsSync(SRC_DIR)) return [];
  tsxTopla(SRC_DIR, dosyalar);
  const bulgular = [];
  for (const dosya of dosyalar.sort()) {
    const icerik = fs.readFileSync(dosya, "utf8");
    const maske = yorumlariMaskele(icerik);
    const bilinen = importlariVeTanimlariTopla(icerik);
    // JSX konumu: bare '<' — öncesinde tanımlayıcı yoksa JSX (generic guard'ı m[1] sağlar)
    const jsxRe = /([A-Za-z0-9_\])"])?\s*<([A-Z]\w*)/g;
    let m;
    while ((m = jsxRe.exec(maske)) !== null) {
      if (m[1]) continue; // < öncesi tanımlayıcı var → generic/karşılaştırma (d<Genel>), JSX değil
      const ad = m[2];
      if (!bilinen.has(ad)) {
        bulgular.push({
          dosya: path.relative(process.cwd(), dosya),
          satir: satirNo(icerik, m.index),
          ad,
        });
      }
    }
  }
  return bulgular;
}

// ═══════════════════════════════════════════════════════════
// ÇAKIŞMA TARAYICISI (30.09) — import ↔ yerel tanım çakışması
//
// NEDEN: SRP taşımalarında aynı isim hem import edilmiş hem yerel
// `const/function NAME` olarak kalmıştı (islamicToolsBolumler.getQiblaForCity,
// quranLearnVeri.elmaliliTefsirGetir). esbuild build'i GEÇİRDİ, Vercel prod
// patlayabilirdi; Vite dev Babel'i "Duplicate declaration" ile yakaladı.
// Bu bölüm o deseni build ÖNCESİ yakalar.
//
// KURAL: bir dosyada aynı isim hem VALUE import'u hem TOP-LEVEL
// const/let/var/function/class tanımı olamaz. `import type` ile interface/type
// çakışması runtime'dan geçtiği için denetim dışı (yanlış-pozitif olmasın).
// ═══════════════════════════════════════════════════════════

function cakismaTara() {
  const dosyalar = [];
  if (!fs.existsSync(SRC_DIR)) return [];
  tsxTopla(SRC_DIR, dosyalar);
  const bulgular = [];
  for (const dosya of dosyalar.sort()) {
    const icerik = fs.readFileSync(dosya, "utf8");
    const maske = yorumlariMaskele(icerik);

    // VALUE import adları (import type ve { type X } hariç)
    const importAdlari = new Set();
    const importRe = /import\s+(?:type\s+)?(?:([A-Za-z]\w*)\s*,?\s*)?(?:\{([^}]*)\})?\s*from/g;
    let m;
    while ((m = importRe.exec(maske)) !== null) {
      const tipOnly = /import\s+type\s/.test(m[0].slice(0, 14));
      if (m[1] && !tipOnly) importAdlari.add(m[1]);
      if (m[2] && !tipOnly) {
        for (const parca of m[2].split(",")) {
          const parca2 = parca.trim();
          if (!parca2 || parca2.startsWith("type ")) continue;
          const ad = parca2.split(/\s+as\s+/).pop().trim();
          if (/^[A-Za-z_$][\w$]*$/.test(ad)) importAdlari.add(ad);
        }
      }
    }

    // TOP-LEVEL (satır başı, 0 girinti) yerel tanımlar
    const yerelAdlari = new Set();
    const yerelRe = /(?:^|\n)(?:export\s+)?(?:default\s+)?(?:async\s+)?(?:const|let|var|function\*?|class)\s+([A-Za-z_$][\w$]*)/g;
    while ((m = yerelRe.exec(maske)) !== null) yerelAdlari.add(m[1]);

    for (const ad of importAdlari) {
      if (yerelAdlari.has(ad)) {
        const tanimDeseni = new RegExp("(?:^|\\n)(?:export\\s+)?(?:default\\s+)?(?:async\\s+)?(?:const|let|var|function\\*?|class)\\s+" + ad.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b");
        const eslesme = tanimDeseni.exec(maske);
        const konum = eslesme ? eslesme.index : -1;
        bulgular.push({
          dosya: path.relative(process.cwd(), dosya),
          satir: konum >= 0 ? satirNo(icerik, konum) : "?",
          ad,
        });
      }
    }
  }
  return bulgular;
}

// ═══════════════════════════════════════════════════════════
// MODAL DUMAN TESTİ (01.10) — --duman bayrağıyla koşar
//
// NE YAPAR: Headless Chrome'u vite dev'e bağlar, src/dev/modalDumanTesti.ts
//   sürücüsünü window.nurModalDumanTesti kancası üzerinden koşturur. Sürücü
//   TÜM modalları tek tek açar; her birini (1) Kapat (X) butonu, (2) backdrop
//   dış-tıklama, (3) Escape ile kapatır. Kalansız kapanış = PASS.
//
// NEDEN: SRP taşımalarında modalın hiç açılmaması / kapanmaması vakaları
//   build'i geçip canlıya çıkabilirdi. Bu test gerçek DOM olaylarıyla gezер.
//
// GEREKLİ: vite dev ayakta (npm run dev). playwright-core devDependency'de;
//   tarayıcı olarak sistem Chrome'u (channel: "chrome") kullanılır.
// ═══════════════════════════════════════════════════════════

const DUMAN_URL = (process.env.DUMAN_URL || "http://localhost:5173").replace(/\/+$/, "");
const DUMAN_TUR = process.env.DUMAN_TUR === "hizli" ? "hizli" : "tam";

async function dumanTestiOrkestra() {
  console.log("═══════════════════════════════════════════════════");
  console.log(" MODAL DUMAN TESTİ — X / DIŞ-TIKLAMA / ESC ÜÇLÜSÜ");
  console.log(" Hedef: " + DUMAN_URL + "   (tur: " + DUMAN_TUR + ")");
  console.log("═══════════════════════════════════════════════════");

  // 1) Dev server ayakta mı?
  try {
    const r = await fetch(DUMAN_URL, { signal: AbortSignal.timeout(4000) });
    if (!r.ok) throw new Error("HTTP " + r.status);
  } catch {
    console.error("✗ Dev servera ulaşılamadı: " + DUMAN_URL);
    console.error("  → Önce 'npm run dev' çalıştır, sonra testi tekrarla.");
    process.exit(EXIT_HATA);
  }

  // 2) Headless Chrome'u bağla (dinamik import — --duman'sız koşuşlarda playwright yüklenmez)
  const { chromium } = await import("playwright-core");
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage();
  const sayfaHatalari = [];
  page.on("pageerror", (h) => sayfaHatalari.push("pageerror: " + (h?.message || h)));
  page.on("console", (m) => { if (m.type() === "error") sayfaHatalari.push("console: " + m.text()); });

  try {
    await page.goto(DUMAN_URL, { waitUntil: "domcontentloaded", timeout: 60000 });

    // Çerez banner'ı overlay'i testi kirletmesin (z-[9999])
    await page.evaluate(() => {
      const b = [...document.querySelectorAll("button")].find((x) => (x.innerText || "").trim() === "Hepsini Kabul Et");
      if (b) b.click();
    }).catch(() => {});

    // 3) Kancaları bekle: setNurModal (ModalsContainer) + nurModalDumanTesti (sürücü chunk)
    const kancalarTam = await (async () => {
      const t0 = Date.now();
      while (Date.now() - t0 < 25000) {
        const hazir = await page.evaluate(() =>
          typeof window.setNurModal === "function" && typeof window.nurModalDumanTesti === "function"
        ).catch(() => false);
        if (hazir) return true;
        await page.waitForTimeout(400);
      }
      return false;
    })();
    if (!kancalarTam) {
      console.error("✗ window.setNurModal / nurModalDumanTesti kancası 25 sn içinde gelmedi");
      console.error("  → ModalsContainer dev kancası bağlı mı? Uygulama hata veriyor mu?");
      if (sayfaHatalari.length) console.error("  İlk sayfa hataları:\n   " + sayfaHatalari.slice(0, 5).join("\n   "));
      await browser.close().catch(() => {});
      process.exit(EXIT_HATA);
    }

    // 4) Sürücüyü koştur (sayfa içinde tüm gezme burada olur)
    const sonuc = await page.evaluate((tur) => window.nurModalDumanTesti(tur), DUMAN_TUR);

    // 5) Rapor — modal bazında grupla
    const modallar = [];
    const gorulen = new Map();
    for (const b of sonuc.bulgular) {
      if (!gorulen.has(b.modal)) { gorulen.set(b.modal, []); modallar.push(b.modal); }
      gorulen.get(b.modal).push(b);
    }
    console.log("");
    for (const modalAdi of modallar) {
      const satir = gorulen.get(modalAdi);
      const tamamAtlandi = satir.length === 1 && satir[0].ok && satir[0].yol === "acilis" && (satir[0].not || "").startsWith("atlandı");
      if (tamamAtlandi) {
        console.log("  ⚠ " + modalAdi.padEnd(18) + (satir[0].not || "atlandı"));
        continue;
      }
      const bozuk = satir.some((b) => !b.ok);
      const detay = satir.map((b) => (b.ok ? "✓" : "✗") + b.yol + (b.ok ? "" : " (" + (b.not || "hata") + ")")).join(" · ");
      console.log("  " + (bozuk ? "✗" : "✓") + " " + modalAdi.padEnd(18) + detay);
    }

    console.log("");
    console.log("── ÖZET ──");
    console.log("  " + modallar.length + " modal · " + sonuc.toplam + " kontrol · " + sonuc.gecen + " geçti · " + sonuc.kalan + " kaldı · " + (sonuc.sureMs / 1000).toFixed(1) + " sn");
    if (sayfaHatalari.length) {
      console.log("  ⚠ Sayfa konsol hataları (" + sayfaHatalari.length + ") — ilk 5:");
      for (const h of [...new Set(sayfaHatalari)].slice(0, 5)) console.log("    " + h.slice(0, 160));
    }

    if (sonuc.kalan === 0) {
      console.log("▶ SONUÇ: PASS ✅ — tüm modallar X / dış-tıklama / Esc ile kalansız kapanıyor");
      await browser.close().catch(() => {});
      process.exit(0);
    }
    await page.screenshot({ path: "scripts/_duman-hata-goruntusu.png", fullPage: false }).catch(() => {});
    console.log("▶ SONUÇ: FAIL ❌ — ekran görüntüsü: scripts/_duman-hata-goruntusu.png");
    await browser.close().catch(() => {});
    process.exit(EXIT_HATA);
  } catch (hata) {
    console.error("✗ Duman testi beklenmedik şekilde çöktü: " + (hata?.message || hata));
    if (sayfaHatalari.length) console.error("  İlk sayfa hataları:\n   " + sayfaHatalari.slice(0, 5).join("\n   "));
    await browser.close().catch(() => {});
    process.exit(EXIT_HATA);
  }
}

function main() {
  if (process.argv.includes("--duman")) {
    void dumanTestiOrkestra();
    return;
  }
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

  let importTemiz = true;
  if (API_DIR === path.resolve("api")) {
    const bulgular = importButunluguTara();
    console.log("");
    console.log("── İMPORT BÜTÜNLÜĞÜ (src/**/*.tsx) ──");
    if (bulgular.length) {
      importTemiz = false;
      for (const b of bulgular) {
        console.log(`  ✗ ${b.dosya}:${b.satir} — <${b.ad}/> kullanılıyor ama import edilmemiş (ReferenceError riski!)`);
      }
    } else {
      console.log("  ✓ Tüm JSX bileşenleri import edilmiş — PremiumModal vakası tekrarlamaz");
    }

    const cakismalar = cakismaTara();
    console.log("");
    console.log("── IMPORT ↔ YEREL ÇAKIŞMA (src/**/*.tsx) ──");
    if (cakismalar.length) {
      importTemiz = false;
      for (const b of cakismalar) {
        console.log(`  ✗ ${b.dosya}:${b.satir} — "${b.ad}" hem import hem yerel tanımlı (Duplicate declaration → Vite dev'de patlar, prod'da sessiz bozulma)`);
      }
    } else {
      console.log("  ✓ Import/yerel tanım çakışması yok — islamicToolsBolumler vakası tekrarlamaz");
    }
  }

  if (!ihlaller.length && importTemiz) {
    console.log("  ✓ Tüm " + dosyalar.length + " dosya ESM uyumlu — require/exports/__dirname kalıntısı YOK");
    console.log("▶ SONUÇ: PASS ✅");
    process.exit(0);
  }

  if (ihlaller.length) {
    console.log("  ✗ " + ihlaller.length + " ESM ihlali bulundu:");
    for (const i of ihlaller) {
      console.log("");
      console.log("  ✗ " + i.dosya + ":" + i.satir + "  [" + i.kural + "]");
      console.log("    " + i.mesaj);
      console.log("    → " + i.ornek);
    }
  }
  console.log("");
  console.log("▶ SONUÇ: FAIL ❌ — deploy ÖNCESİ düzelt");
  process.exit(EXIT_HATA);
}

main();
