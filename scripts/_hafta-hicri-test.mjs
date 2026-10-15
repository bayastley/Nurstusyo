// ════════════════════════════════════════════════════════════════
// HAFTALIK DÖNEM + HİCRİ ALGILAMA BİRİM TESTİ (geçici, commit'lenmez)
// Kullanım: node scripts/_hafta-hicri-test.mjs
// ════════════════════════════════════════════════════════════════
import { build } from "esbuild";

const banner = `
globalThis.window = globalThis;
globalThis.location = { origin: "http://localhost:5173" };
globalThis.localStorage = { _m: new Map(), getItem(k){return this._m.has(k)?this._m.get(k):null;}, setItem(k,v){this._m.set(k,String(v));}, removeItem(k){this._m.delete(k);}, clear(){this._m.clear();} };
globalThis.sessionStorage = globalThis.localStorage;
`;

let hata = 0;
const esit = (ad, gercek, beklenen) => {
  const ok = gercek === beklenen;
  if (!ok) hata++;
  console.log(`  ${ok ? "✓" : "✗"} ${ad} → ${JSON.stringify(gercek)}${ok ? "" : ` (beklenen ${JSON.stringify(beklenen)})`}`);
};

// ── 1) tier.ts: haftaPazartesiYerel ──
const sonuc = await build({ entryPoints: ["src/tier.ts"], bundle: true, write: false, format: "esm", platform: "node", banner: { js: banner }, logLevel: "silent" });
const tier = await import("data:text/javascript;base64," + Buffer.from(sonuc.outputFiles[0].text).toString("base64"));

console.log("── haftaPazartesiYerel (yerel Pazartesi anahtarı) ──");
esit("Salı 2026-10-06 → Pazartesi", tier.haftaPazartesiYerel(new Date(2026, 9, 6)), "2026-10-05");
esit("Pazar 2026-10-11 → önceki Pazartesi", tier.haftaPazartesiYerel(new Date(2026, 9, 11)), "2026-10-05");
esit("Pazartesi 2026-10-12 → kendisi", tier.haftaPazartesiYerel(new Date(2026, 9, 12)), "2026-10-12");
esit("Cumartesi 2026-10-10 → aynı hafta Pzt", tier.haftaPazartesiYerel(new Date(2026, 9, 10)), "2026-10-05");
esit("Yıl sınırı: Çar 2027-01-06 (Pzt 04.01)", tier.haftaPazartesiYerel(new Date(2027, 0, 6)), "2027-01-04");
console.log(`  (bugün: ${tier.haftaPazartesiYerel()})`);

// ── 2) holidayCalendar: hicri algılama + maneviBayraklar ──
const sonuc2 = await build({ entryPoints: ["src/services/holidayCalendar.ts"], bundle: true, write: false, format: "esm", platform: "node", banner: { js: banner }, logLevel: "silent" });
const hc = await import("data:text/javascript;base64," + Buffer.from(sonuc2.outputFiles[0].text).toString("base64"));

console.log("\n── maneviBayraklar (hicri otomatik + el-yazımı) ──");
const b = hc.maneviBayraklar();
console.log(`  kadir=${b.kadir} kandil=${b.kandil} bayram=${b.bayram} ramazan=${b.ramazan}`);
esit("bayrak yapısı 4 alan", ["kadir", "kandil", "bayram", "ramazan"].every((k) => typeof b[k] === "boolean"), true);

// Hijri formatı okunabiliyor mu — ayrı kontrol
try {
  const s = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", { day: "numeric", month: "numeric", year: "numeric" }).formatToParts(new Date());
  const oku = (t) => s.find((p) => p.type === t)?.value;
  console.log(`  hicri bugün: ${oku("day")}/${oku("month")}/${oku("year")} (g/a/y)`);
  esit("hicri ay 1-12 arası", Number(oku("month")) >= 1 && Number(oku("month")) <= 12, true);
} catch (e) {
  console.log(`  ✗ Intl islamic desteklenmiyor: ${String(e.message || e).slice(0, 80)}`);
  hata++;
}

// ── 3) getHolyDayState bugün çökmeden çalışıyor mu ──
const st = hc.getHolyDayState();
console.log(`\n  bugünün banner durumu: type=${st.type} eventKey=${st.eventKey}`);
esit("banner state type geçerli", ["notice", "claim", "none"].includes(st.type), true);

console.log(`\n▶ SONUÇ: ${hata === 0 ? "PASS ✅" : "FAIL ❌ (" + hata + ")"}`);
process.exit(hata === 0 ? 0 : 1);
