// ═══════════════════════════════════════════════════════════
// AKILLI AI EŞLEŞTİRME TESTİ — KALICI
// Çalıştır: npm test  (veya: node scripts/ai-match-test.mjs)
//
// Ne yapar?
//   StudioApp.tsx'teki detectCategoryFromAyah'ın BİREBİR kaynağını
//   çıkarır (esbuild transform ile), gerçek keyword tablolarını
//   (studioConstants.ts + adminMediaManifest.ts + clips) derleyip
//   bağlar ve gerçek ayet meallerinde doğrular.
//
// Ne zaman çalışır?
//   - Keyword tablolarında değişiklik yapıldığında
//   - detectCategoryFromAyah mantığı değiştiğinde
//   - Yeni kategori eklendiğinde
//   - npm test ile herhangi bir zamanda
//
// Çıkış kodu: 0 = hepsi OK, 1 = en az bir KRİTİK hata
// ═══════════════════════════════════════════════════════════
import fs from "node:fs";
import path from "node:path";
import * as esbuild from "esbuild";

const ROOT = path.resolve(import.meta.dirname, "..");
const src = (p) => path.join(ROOT, "src", p);

// ── React mock'u (esbuild alias — lucide-react'in ihtiyaçları dahil) ──
const REACT_MOCK =
  "data:text/javascript," +
  encodeURIComponent(
    [
      "export default {};",
      "export const useCallback=(f)=>f;",
      "export const useRef=(v)=>({current:v});",
      "export const useState=(v)=>[v,()=>{}];",
      "export const useEffect=()=>{};",
      "export const useMemo=(f)=>f();",
      "export const createElement=()=>({});",
      "export const createContext=()=>({Provider:()=>{},Consumer:()=>{}});",
      "export const useContext=()=>({});",
      "export const forwardRef=(f)=>f;",
      "export const memo=(f)=>f;",
      "export const Fragment='Fragment';",
      "export const cloneElement=()=>({});",
    ].join("")
  );

// ── 1) Gerçek tabloları derle ──
async function derle(entry, extraAlias = {}) {
  const out = await esbuild.build({
    entryPoints: [src(entry)],
    bundle: true,
    format: "esm",
    write: false,
    absWorkingDir: ROOT,
    alias: { react: REACT_MOCK, ...extraAlias },
  });
  const url = "data:text/javascript;base64," + Buffer.from(out.outputFiles[0].text).toString("base64");
  return import(url);
}

const K = await derle("studio/studioConstants.ts");
const M = await derle("adminMediaManifest.ts");
let C;
try {
  C = await derle("clips/index.ts");
} catch {
  // clips paketi ileride değişirse test yine çalışsın — sadece uyar
  console.warn("⚠ clips/index.ts derlenemedi — CLIP_AI_KEYWORDS atlanıyor");
  C = { CLIP_AI_KEYWORDS: {} };
}

const FALLBACK = K.KEYWORD_CATEGORY_FALLBACK;
const SURAH_HINT = K.SURAH_CATEGORY_HINT;
const ADMIN_AI = M.ADMIN_AI_KEYWORDS;
const ADMIN_CLIPS = M.ADMIN_MOTION_CLIPS || [];
const CLIP_AI = C.CLIP_AI_KEYWORDS;

// ── 2) StudioApp.tsx'ten fonksiyonun birebir kaynağını çıkar ──
const appSrc = fs.readFileSync(src("StudioApp.tsx"), "utf8");
const startMark = 'const detectCategoryFromAyah = useCallback((ar: string, tr: string, surahName = ""): CatId => {';
const startIdx = appSrc.indexOf(startMark);
if (startIdx < 0) {
  console.error("❌ detectCategoryFromAyah StudioApp.tsx'te bulunamadı — imza değiştiyse startMark'ı güncelle");
  process.exit(1);
}
// useCallback( ... ) dengeli parantez kapanışı
let depth = 0;
let end = -1;
for (let i = appSrc.indexOf("(", startIdx + "const detectCategoryFromAyah = ".length); i < appSrc.length; i++) {
  if (appSrc[i] === "(") depth++;
  else if (appSrc[i] === ")") { depth--; if (depth === 0) { end = i; break; } }
}
const fnSrc = appSrc.slice(startIdx + "const detectCategoryFromAyah = ".length, end + 1);
const { code } = await esbuild.transform(fnSrc, { loader: "ts" });
const detect = new Function(
  "useCallback", "KEYWORD_CATEGORY_FALLBACK", "SURAH_CATEGORY_HINT", "ADMIN_AI_KEYWORDS", "CLIP_AI_KEYWORDS", "ADMIN_MOTION_CLIPS",
  `return (${code.replace(/;\s*$/, "")});`
)((f) => f, FALLBACK, SURAH_HINT, ADMIN_AI, CLIP_AI, ADMIN_CLIPS);

// ── 3) AYET KORPUSU — gerçek Diyanet-yakını mealler ──
// Türler:
//   KRİTİK → tek başına da yanlışsa test BATIRIR (hata sayılır)
//   SOFT   → kabul aralığı dışındaysa uyarı (değişim izleme; kırıcı değil)
// [sure, ayetNo, meal, kabulHavuzu, tür, not]
const KORPUS = [
  // ── su / gök / yağmur (geçmiş hata: karınca çıkıyordu) ──
  ["Nahl", 10, "Gökten su indirdi. Siz de ondan içeceğiniz var, bitkilerden ve hayvanlarınızı otlatığınızdan rızıklanıyorsunuz.", ["bulut", "deniz", "selale", "gol"], "KRİTİK", "su/yağmur"],
  ["Bakara", 22, "Gökten su indirdi sizi rızıklandırdı", ["bulut", "deniz", "selale", "gol"], "KRİTİK", "su/yağmur — eski karınca hatası"],
  ["Müminûn", 18, "Biz gökten belli bir miktar su indirdik, onu yeryüzünde durdurduk.", ["bulut", "deniz", "gol", "selale"], "KRİTİK", "su"],
  ["Hac", 63, "Gökten su indirdi de yeryüzü yeşile büründü.", ["bulut", "orman", "cicekler", "deniz"], "SOFT", "su/yeşillik"],

  // ── hayvan temaları (geçmiş hata: 'sürü' → karınca) ──
  ["Nahl", 68, "Rabbin bal arısına vahyetti: Dağlardan, ağaçlardan ve onların kurdukları çardaklardan kendine evler edin.", ["ari"], "KRİTİK", "arı"],
  ["Neml", 18, "Karınca yuvasına girdiğinde sürü karıncaya dedi ki: Ey karıncalar! Evinize girin.", ["karinca"], "KRİTİK", "karınca — 'sürü' hâlâ karıncaya çekmemeli"],
  ["Neml", 20, "Kuşları yokladım, der ki: Hüdhüdü neden göremiyorum?", ["admin_hudhud_water_suleyman_hoopoe_bird", "yildizlar", "orman", "daglar"], "SOFT", "hüdhüd"],
  ["Yûsuf", 4, "Yusuf babasına dedi: Babacığım! Rüyamda on bir yıldız, güneş ve ayı gördüm; onlara secde ediyordum.", ["yildizlar"], "SOFT", "yıldız"],

  // ── namaz / kâbe ──
  ["Bakara", 125, "İnsanlara Tavaf edilecek ve namaz kılınacak bir yer olarak Kâbe'yi belirledik.", ["namaz"], "KRİTİK", "kâbe"],
  ["Fâtiha", 1, "Hamd, âlemlerin Rabbi Allah'a mahsustur.", ["namaz", "musaf", "daglar", "yildizlar", "deniz", "gunbatimi", "gece", "selale", "orman", "cicekler"], "SOFT", "soyut — hash havuzu kabul"],
  ["İbrâhîm", 37, "Rabbim! Oğullarımımdan bir kısmını Senin kutsal evinin yanında, ekinsiz bir vadiye yerleştirdim.", ["namaz", "col", "admin_rock_carved_houses"], "SOFT", "kutsal ev/çöl"],

  // ── doğa ──
  ["Rahmân", 19, "İki denizi birbirine kavuşmak üzere salıverdi; aralarında bir engel vardır, birbirine karışmazlar.", ["deniz", "admin_two_sea_merging"], "KRİTİK", "deniz"],
  ["Kehf", 109, "De ki: Rabbimin sözleri için deniz mürekkep olsa, Rabbimin sözleri bitmeden deniz tükenirdi.", ["deniz", "musaf"], "SOFT", "deniz/kalem"],
  ["Vâkıa", 5, "Dağlar yerinden oynatılıp savrulduğunda.", ["daglar", "admin_mountains_wool_dust"], "KRİTİK", "dağ"],
  ["Tîn", 1, "İncire, zeytine, Sina Dağı'na ve bu güvenli şehre yemin olsun.", ["hurma", "daglar", "cicekler", "cennet", "admin_olive_grove_trees"], "SOFT", "zeytin/dağ"],
  ["Nûr", 35, "Allah göklerin ve yerin nurudur. Nur misali, içinde lamba bulunan bir niş gibidir.", ["musaf", "bulut", "gece", "admin_darkness_to_light"], "SOFT", "nur"],
  ["FIL/Fil", 1, "Rabbinin fil sahiplerine ne yaptığını görmedin mi?", ["fil"], "KRİTİK", "fil — 🐘 fil kategorisi eklendi (2026-09 lansman)"],
];

// ── 4) Çalıştır + rapor ──
console.log("\n═══ AKILLI AI EŞLEŞTİRME TESTİ ═══\n");
let kritikHata = 0;
let softSapma = 0;
const satirlar = [];
for (const [sure, no, meal, kabul, tur, not_] of KORPUS) {
  const got = detect("", meal, sure);
  const ok = kabul.includes(got);
  if (!ok && tur === "KRİTİK") kritikHata++;
  if (!ok && tur === "SOFT") softSapma++;
  const durum = ok ? "✅ OK" : tur === "KRİTİK" ? "❌ KRİTİK HATA" : "⚠️ sapma";
  satirlar.push(`${sure} ${no} → ${got.padEnd(42)} beklenen: ${kabul.slice(0, 3).join("/")}  ${durum}  (${not_})`);
}
console.log(satirlar.join("\n"));
console.log("\n─────────────────────────────");
console.log(`Toplam: ${KORPUS.length} | KRİTİK hata: ${kritikHata} | SOFT sapma: ${softSapma}`);

if (kritikHata > 0) {
  console.error(`\n❌ TEST BAŞARISIZ — ${kritikHata} kritik eşleşme yanlış. Keyword tablolarını (studioConstants.ts / adminMediaManifest.ts) kontrol et.`);
  process.exit(1);
}
if (softSapma > 0) console.log(`\n⚠️ ${softSapma} soft sapma var — kırıcı değil, kabul aralığını veya keyword'leri gözden geçirmek isteyebilirsin.`);
else console.log("\n✅ HEPSİ OK — keyword tabloları korpusla tutarlı.");
