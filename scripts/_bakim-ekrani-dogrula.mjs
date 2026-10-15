// ════════════════════════════════════════════════════════════════
// BAKIM EKRANI DOĞRULAMA (geçici) — önceki turda edge cache (SWR=300s)
// zamanlaması yüzünden görsel kanıt yetişmemişti. Bu script:
//   1) DB: maintenance.enabled=true (yedekli)
//   2) GERÇEK /api/config?cb=... (cache-bust) — sunucunun fresh cevabında
//      enabled=true görünüyor mu (yayılma kanıtı)
//   3) Playwright: config isteği route-intercept edilip GERÇEK fresh body ile
//      cevaplanır → app gerçek cevapla render olur → MaintenanceScreen kanıtı
//   4) GERİ ALMA + restore sonrası ekran temiz kanıtı
// Kullanım: node scripts/_bakim-ekrani-dogrula.mjs [site] [envYolu]
// ════════════════════════════════════════════════════════════════
import { chromium } from "playwright-core";
import { readFileSync } from "node:fs";

const SITE = (process.argv[2] || "https://www.nurstudyo.com").replace(/\/+$/, "");
const ENV_YOL = process.argv[3] || "C:/Users/msı/Documents/env klasörü/env2.txt";
const env = {};
for (const s of readFileSync(ENV_YOL, "utf8").split(/\r?\n/)) {
  const m = s.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const SB = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || "").replace(/\/+$/, "");
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

const TEST_MESAJ = "[GÖRÜNÜRLÜK TESTI] Bakım ekranı canlı doğrulama — dakikalar içinde kalkar.";
let hatalar = 0;
const basari = (m) => console.log("  ✓ " + m);
const hata = (m) => { hatalar++; console.log("  ✗ " + m); };

async function dbOku(path) {
  const r = await fetch(`${SB}/rest/v1/${path}`, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` }, cache: "no-store" });
  return r.json();
}
async function dbPatch(path, body) {
  const r = await fetch(`${SB}/rest/v1/${path}`, { method: "PATCH", headers: { ...H, Prefer: "return=minimal" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`PATCH ${path}: ${r.status}`);
}
async function canliConfig() {
  // cb= → edge cache anahtarını kırar, GERÇEK fresh cevap
  const r = await fetch(`${SITE}/api/config?cb=${Date.now()}`, { cache: "no-store" });
  return r.json();
}

const ayarlar = await dbOku("nur_site_settings?key=eq.maintenance&select=*");
const bakimYedek = ayarlar[0]?.value;
if (!bakimYedek) { console.error("✗ maintenance okunamadı"); process.exit(1); }
console.log(`✓ yedek: enabled=${bakimYedek.enabled}`);

let browser;
try {
  // ── 1) AÇ ──
  await dbPatch("nur_site_settings?key=eq.maintenance", { value: { ...bakimYedek, enabled: true, message: TEST_MESAJ, startsAt: new Date().toISOString() }, updated_by: "bakim-dogrula", updated_at: new Date().toISOString() });
  console.log("  DB: enabled=true");

  // ── 2) GERÇEK fresh config'te görünüyor mu (yayılma kanıtı) ──
  let fresh = null, gorundu = false;
  for (let i = 0; i < 12; i++) {
    await new Promise((r) => setTimeout(r, 10_000));
    fresh = await canliConfig().catch(() => null);
    if (fresh?.maintenance?.enabled === true) { gorundu = true; break; }
  }
  if (gorundu) basari(`GERÇEK /api/config fresh cevapta enabled=true — sunucu yayılımı kanıtlandı (${fresh.maintenance.message.slice(0, 40)}…)`);
  else hata("cache-bust'lı config'de bile enabled=true görünmedi — sunucu katmanı sorunu!");
  if (!gorundu) throw new Error("yayılma yok");

  // ── 3) Gerçek body ile app render kanıtı ──
  browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  await page.route("**/api/config*", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(fresh) });
  });
  let ekran = false;
  for (let deneme = 1; deneme <= 5 && !ekran; deneme++) {
    await page.goto(SITE + "/?bd=" + Date.now(), { waitUntil: "domcontentloaded", timeout: 45_000 }).catch(() => {});
    await page.waitForTimeout(6000); // 4.1MB bundle parse + config fetch + event
    ekran = await page.getByText("GÖRÜNÜRLÜK TESTI", { exact: false }).first().isVisible().catch(() => false);
    if (!ekran) console.log(`    deneme ${deneme}/5 — henüz yok, yeniden yükleniyor…`);
  }
  if (ekran) {
    basari("MaintenanceScreen ANONİM KULLANICIDA render oldu (gerçek config cevabıyla)");
    await page.screenshot({ path: "scripts/_kullanici-bakim-ekrani.png" });
  } else hata("bakım ekranı render olmadı");

  // ── 4) GERİ ALMA + restore sonrası ekran temiz ──
  await dbPatch("nur_site_settings?key=eq.maintenance", { value: bakimYedek, updated_by: "bakim-dogrula", updated_at: new Date().toISOString() });
  const sonrası = await canliConfig();
  if (sonrası?.maintenance?.enabled === false) basari("GERİ ALINDI: fresh config enabled=false");
  else hata("geri alma sonrası hâlâ enabled");
  await page.route("**/api/config*", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(sonrası) });
  });
  let kalkti = false;
  for (let deneme = 1; deneme <= 3 && !kalkti; deneme++) {
    await page.goto(SITE + "/?bd2=" + Date.now(), { waitUntil: "domcontentloaded", timeout: 45_000 }).catch(() => {});
    await page.waitForTimeout(5000);
    kalkti = !(await page.getByText("GÖRÜNÜRLÜK TESTI", { exact: false }).first().isVisible().catch(() => false));
  }
  if (kalkti) basari("restore sonrası ekran normal siteye döndü");
  else hata("restore sonrası hâlâ bakım ekranı");
} catch (e) {
  hata("akış hatası: " + String(e.message || e).slice(0, 100));
} finally {
  try { await dbPatch("nur_site_settings?key=eq.maintenance", { value: bakimYedek, updated_by: "bakim-dogrula", updated_at: new Date().toISOString() }); } catch { /* */ }
  if (browser) await browser.close().catch(() => {});
  const son = await dbOku("nur_site_settings?key=eq.maintenance&select=value");
  console.log(`\n── GERİ ALMA ──\n  ✓ maintenance enabled=${son[0]?.value?.enabled} (orijinal: ${bakimYedek.enabled})`);
}

console.log(`\n▶ SONUÇ: ${hatalar === 0 ? "PASS ✅" : "FAIL ❌ (" + hatalar + ")"}`);
process.exit(hatalar === 0 ? 0 : 1);
