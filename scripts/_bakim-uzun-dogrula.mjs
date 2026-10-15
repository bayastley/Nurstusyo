// ════════════════════════════════════════════════════════════════
// BAKIM YAYILIMI UZUN DOĞRULAMA (geçici, commit'lenmez)
// Amaç: cache tasarımı (45s s-maxage + SWR 300) içinde bakım ekranının
// anonim kullanıcıya hangi anında ulaştığını DÜRÜST ölçmek.
//   T_api  = ?cb= cache-bust probe'unda enabled=true gördüğümüz an (sunucu fresh)
//   T_user = normal /api/config (no-query) yüklemesinde MaintenanceScreen ekranda (kullanıcı)
// Bütçe: 8 dk. Restore finally'de garanti.
// Kullanım: node scripts/_bakim-uzun-dogrula.mjs [site]
// ════════════════════════════════════════════════════════════════
import { chromium } from "playwright-core";
import { readFileSync } from "node:fs";

const SITE = (process.argv[2] || "https://www.nurstudyo.com").replace(/\/+$/, "");
const env = {};
for (const s of readFileSync("C:/Users/msı/Documents/env klasörü/env2.txt", "utf8").split(/\r?\n/)) {
  const m = s.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const SB = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || "").replace(/\/+$/, "");
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
const TEST_MSG = "BAKIM YAYILIM TESTI";
const BUTCE = 8 * 60_000;

async function dbOku(path) { const r = await fetch(`${SB}/rest/v1/${path}`, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` }, cache: "no-store" }); return r.json(); }
async function dbPatch(path, body) { const r = await fetch(`${SB}/rest/v1/${path}`, { method: "PATCH", headers: { ...H, Prefer: "return=minimal" }, body: JSON.stringify(body) }); if (!r.ok) throw new Error("PATCH " + r.status); }
const yedek = (await dbOku("nur_site_settings?key=eq.maintenance&select=value"))[0]?.value;
let browser;
let hata = 0;
try {
  await dbPatch("nur_site_settings?key=eq.maintenance", { value: { ...yedek, enabled: true, message: TEST_MSG + " — dakikalar içinde kalkar.", endsAt: "", startsAt: "" }, updated_by: "bakim-uzun", updated_at: new Date().toISOString() });
  const T0 = Date.now();
  console.log(`T0: enabled=true yazıldı`);

  browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();

  let tApi = null, tUser = null;
  const baslangic = Date.now();
  let dongu = 0;
  while (Date.now() - baslangic < BUTCE) {
    dongu++;
    await page.goto(`${SITE}/?u=${Date.now()}`, { waitUntil: "domcontentloaded", timeout: 45_000 }).catch(() => {});
    await page.waitForTimeout(7000);

    // API probe (farklı cache anahtarı — sunucu gerçek durumunu zamanla söyler)
    try {
      const api = await (await fetch(`${SITE}/api/config?probe=${Date.now()}`, { cache: "no-store" })).json();
      if (!tApi && api?.maintenance?.enabled === true) {
        tApi = Date.now() - T0;
        console.log(`  [${(tApi / 1000).toFixed(0)}s] T_api: probe fresh cevap enabled=true`);
      }
    } catch { /* probe hatası ölümcül değil */ }

    // Kullanıcı kanıtı: ekran + TEŞHİS: API bu sayfanın fetch'inde ne gördü + sync store durumu
    const tesbit = await page.evaluate(() => ({
      ekran: document.body.innerText.includes("BAKIM YAYILIM TESTI"),
      sync: localStorage.getItem("nur_system_sync_config") ? `DOLU(${localStorage.getItem("nur_system_sync_config").length})` : "BOŞ",
    }));
    if (dongu === 1 || tesbit.ekran || dongu % 5 === 0) console.log(`      [teşhis] sync=${tesbit.sync} ekran=${tesbit.ekran}`);
    const ekran = tesbit.ekran;
    if (ekran) {
      tUser = Date.now() - T0;
      console.log(`  [${(tUser / 1000).toFixed(0)}s] T_user: MaintenanceScreen ANONİM KULLANICIDA göründü`);
      await page.screenshot({ path: "scripts/_kullanici-bakim-ekrani.png" });
      break;
    }
    console.log(`  [${((Date.now() - T0) / 1000).toFixed(0)}s] deneme ${dongu} — ekran henüz yok`);
    await page.waitForTimeout(25_000);
  }

  if (tUser) {
    console.log(`\n▶ SONUÇ: PASS ✅ — bakım ekranı ${(tUser / 1000).toFixed(0)} sn'de kullanıcıya ulaştı (T_api=${tApi ? (tApi / 1000).toFixed(0) + "s" : "?"}; tasarım/grenze: ~45-300sn cache)`);
  } else {
    hata++;
    console.log(`\n▶ SONUÇ: 8 dk içinde kullanıcı ekranına ulaşmadı — bunu BUG olarak işaretle (tasarım grenzi aşıldı)`);
  }

  // GERİ ALMA + restore kanıtı
  await dbPatch("nur_site_settings?key=eq.maintenance", { value: yedek, updated_by: "bakim-uzun", updated_at: new Date().toISOString() });
  console.log("geri alma yapıldı — probe doğrulanıyor…");
  let temiz = false;
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(15_000);
    const api = await (await fetch(`${SITE}/api/config?probe=${Date.now()}`, { cache: "no-store" })).json().catch(() => null);
    if (api?.maintenance?.enabled === false) { temiz = true; break; }
  }
  console.log(`restore probe: enabled=false ${temiz ? "doğrulandı ✓" : "⚠ elle kontrol et"}`);
} catch (e) {
  hata++;
  console.error("akış hatası:", String(e.message || e).slice(0, 120));
} finally {
  try { await dbPatch("nur_site_settings?key=eq.maintenance", { value: yedek, updated_by: "bakim-uzun", updated_at: new Date().toISOString() }); } catch { /* */ }
  if (browser) await browser.close().catch(() => {});
  const son = await dbOku("nur_site_settings?key=eq.maintenance&select=value");
  console.log(`final: enabled=${son[0]?.value?.enabled} (orijinal: ${yedek?.enabled})`);
}
process.exit(hata === 0 ? 0 : 1);
