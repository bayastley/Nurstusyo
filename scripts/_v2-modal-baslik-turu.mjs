// ════════════════════════════════════════════════════════
// _v2-modal-baslik-turu.mjs — V2 modal başlık i18n turu (5 dil)
// Kullanım: node scripts/_v2-modal-baslik-turu.mjs [url]
//   varsayılan url: http://localhost:5173  (DUMAN_URL gibi)
//
// NE YAPAR:
//   1. dicts.{tr,en,ar,id,ur}.ts dosyalarından v2*Title/v2*Sub değerlerini parse eder
//   2. Her dilde sayfayı açar (localStorage nur_lang + reload)
//   3. window.setNurModal(id) ile V2 modalını açar, overlay'deki h3/sub okur
//   4. DOM'daki metinle dict değerini birebir karşılaştırır (trim'li)
//   5. Modalı Esc ile kapatır, sıradakine geçer
//
// NOT: Dev kancası (setNurModal) yalnız dev bundle'da vardır — canlıya karşı
//   koşulursa kancasız ortamda Türkçe detaylı hata verir (bilinçli).
// ════════════════════════════════════════════════════════
import { readFileSync } from "node:fs";

const HEDEF = (process.argv[2] || process.env.DUMAN_URL || "http://localhost:5173").replace(/\/+$/, "");

// ── V2 modal id → dict anahtar çiftleri ──
const V2_MODALLAR = [
  { id: "ayetKartlari", title: "v2AyetKartlariTitle", sub: "v2AyetKartlariSub" },
  { id: "ayetNotlari", title: "v2AyetNotlariTitle", sub: "v2AyetNotlariSub" },
  { id: "ayetPaketleri", title: "v2AyetPaketleriTitle", sub: "v2AyetPaketleriSub" },
  { id: "arkaPlanUretici", title: "v2ArkaPlanUreticiTitle", sub: "v2ArkaPlanUreticiSub" },
  { id: "davet", title: "v2DavetTitle", sub: "v2DavetSub" },
  { id: "hafizlikTesti", title: "v2HafizlikTitle", sub: "v2HafizlikSub" },
  { id: "kelimeAtolyesi", title: "v2KelimeAtolyesiTitle", sub: "v2KelimeAtolyesiSub" },
  { id: "kesfet", title: "v2KesfetTitle", sub: "v2KesfetSub" },
  { id: "ozelGunTakvimi", title: "v2OzelGunTitle", sub: "v2OzelGunSub" },
  { id: "siteHakkinda", title: "v2SiteHakkindaTitle", sub: "v2SiteHakkindaSub" },
  { id: "library", title: "v2AyetKutuphaneTitle", sub: "v2AyetKutuphaneSub" },
  { id: "contact", title: "v2DestekTitle", sub: "v2DestekSub" },
];

// ── 1) Dict parse (key: "value", çift tırnaklı tek satırlar) ──
function dictParse(dosya) {
  const src = readFileSync(new URL(`../src/i18n/${dosya}`, import.meta.url), "utf8");
  const map = new Map();
  const re = /^\s{2}([A-Za-z_][A-Za-z0-9_]*)\s*:\s*"((?:[^"\\]|\\.)*)"\s*,\s*$/gm;
  let x;
  while ((x = re.exec(src))) {
    let deger = x[2].replace(/\\"/g, '"').replace(/\\\\/g, "\\");
    map.set(x[1], deger);
  }
  return map;
}

const DICTS = {
  tr: dictParse("dicts.tr.ts"),
  en: dictParse("dicts.en.ts"),
  ar: dictParse("dicts.ar.ts"),
  id: dictParse("dicts.id.ts"),
  ur: dictParse("dicts.ur.ts"),
};

// ── 2) Chrome sürüşü ──
const { chromium } = await import("playwright-core");
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();

try {
  await fetch(HEDEF, { signal: AbortSignal.timeout(8000) });
} catch {
  console.error(`✗ Hedefe ulaşılamadı: ${HEDEF}${HEDEF.includes("localhost") ? " → önce 'npm run dev'" : ""}`);
  process.exit(1);
}

await page.goto(HEDEF, { waitUntil: "domcontentloaded", timeout: 60000 });

// Çerez banner'ı overlay'i kirletmesin
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((x) => ["Hepsini Kabul Et", "Tümünü Kabul Et"].includes((x.innerText || "").trim()));
  if (b) b.click();
}).catch(() => {});

const kancalarGelsin = await (async () => {
  const t0 = Date.now();
  while (Date.now() - t0 < 25000) {
    if (await page.evaluate(() => typeof window.setNurModal === "function").catch(() => false)) return true;
    await page.waitForTimeout(400);
  }
  return false;
})();
if (!kancalarGelsin) {
  console.error("✗ window.setNurModal kancası 25 sn içinde gelmedi — hedef dev bundle mı?");
  await browser.close().catch(() => {});
  process.exit(1);
}

// ── 3) 5 dil × 12 modal turu ──
// ★ {n} placeholder'ı (ör. v2AyetKartlariSub) bileşen gerçek sayıyla değiştirir
//   (AyetKartlariModal .replace("{n}", …)) → birebir yerine \d+ regex karşılaştırması
function eslesir(beklenen, dom) {
  if (!beklenen.includes("{n}")) return dom === beklenen.trim();
  const rx = new RegExp("^" + beklenen.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\\{n\\\}/g, "\\d+") + "$");
  return rx.test(dom);
}

const bulgular = [];
let toplam = 0, gecen = 0;

for (const [dil, dict] of Object.entries(DICTS)) {
  await page.evaluate((l) => { localStorage.setItem("nur_lang", l); location.reload(); }, dil);
  await page.waitForLoadState("domcontentloaded");
  await page.waitForSelector("#root > *", { timeout: 30000 });
  await page.waitForFunction(() => typeof window.setNurModal === "function", null, { timeout: 25000 });

  for (const m of V2_MODALLAR) {
    const beklenenT = dict.get(m.title);
    const beklenenS = dict.get(m.sub);
    if (!beklenenT) { bulgular.push({ dil, modal: m.id, yol: "dict", ok: false, not: `${m.title} dict'te yok` }); toplam += 1; continue; }

    await page.evaluate((id) => window.setNurModal(id), m.id);
    await page.waitForSelector('.fixed.inset-0[class*="z-[90]"], .fixed.inset-0[class*="z-[95]"], .fixed.inset-0[class*="z-[96]"]', { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(120);

    const dom = await page.evaluate(() => {
      const kok = document.querySelector('.fixed.inset-0[class*="z-[90]"], .fixed.inset-0[class*="z-[95]"], .fixed.inset-0[class*="z-[96]"]');
      if (!kok) return null;
      const h3 = kok.querySelector("h3");
      const p = kok.querySelector("p.text-\\[10px\\]");
      return { title: (h3?.textContent || "").trim(), sub: (p?.textContent || "").trim() };
    });

    toplam += 2; // title + sub
    if (!dom) {
      bulgular.push({ dil, modal: m.id, yol: "acilis", ok: false, not: "overlay gelmedi" });
    } else {
      const tOk = eslesir(beklenenT, dom.title);
      const sOk = beklenenS ? eslesir(beklenenS, dom.sub) : true;
      if (tOk) gecen += 1; else bulgular.push({ dil, modal: m.id, yol: "title", ok: false, not: `DOM="${dom.title.slice(0, 60)}" ≠ dict="${beklenenT.slice(0, 60)}"` });
      if (sOk) gecen += 1; else bulgular.push({ dil, modal: m.id, yol: "sub", ok: false, not: `DOM="${dom.sub.slice(0, 50)}" ≠ dict="${beklenenS.slice(0, 50)}"` });
    }

    await page.keyboard.press("Escape");
    await page.waitForTimeout(90);
  }
}

// Temizlik: TR'ye dön
await page.evaluate(() => { localStorage.setItem("nur_lang", "tr"); location.reload(); }).catch(() => {});
await browser.close().catch(() => {});

// ── 4) Rapor ──
console.log("═══════════════════════════════════════════════════");
console.log(" V2 MODAL BAŞLIK İ18N TURU — 5 dil × 12 modal");
console.log(` Hedef: ${HEDEF}`);
console.log("═══════════════════════════════════════════════════");
for (const b of bulgular) console.log(`  ✗ [${b.dil}] ${b.modal} (${b.yol}) — ${b.not}`);
console.log("── ÖZET ──");
console.log(`  ${V2_MODALLAR.length} modal × 5 dil · ${toplam} kontrol · ${gecen} geçti · ${toplam - gecen} kaldı`);
console.log(bulgular.length === 0 ? "▶ SONUÇ: PASS ✅ — tüm başlık/sub'lar dict ile birebir" : "▶ SONUÇ: FAIL ❌");
process.exit(bulgular.length === 0 ? 0 : 1);
