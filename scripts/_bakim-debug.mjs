// ── Bakım render zinciri teşhisi (geçici) ──
import { chromium } from "playwright-core";
import { readFileSync } from "node:fs";

const SITE = "https://www.nurstudyo.com";
const ENV_YOL = "C:/Users/msı/Documents/env klasörü/env2.txt";
const env = {};
for (const s of readFileSync(ENV_YOL, "utf8").split(/\r?\n/)) {
  const m = s.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const SB = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || "").replace(/\/+$/, "");
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

const TEST_MESAJ = "[GÖRÜNÜRLÜK TESTI] Bakım ekranı canlı doğrulama — dakikalar içinde kalkar.";

async function dbOku(path) {
  const r = await fetch(`${SB}/rest/v1/${path}`, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` }, cache: "no-store" });
  return r.json();
}
async function dbPatch(path, body) {
  const r = await fetch(`${SB}/rest/v1/${path}`, { method: "PATCH", headers: { ...H, Prefer: "return=minimal" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`PATCH: ${r.status}`);
}

const yedek = (await dbOku("nur_site_settings?key=eq.maintenance&select=value"))[0]?.value;

let browser;
try {
  await dbPatch("nur_site_settings?key=eq.maintenance", { value: { ...yedek, enabled: true, message: TEST_MESAJ }, updated_by: "bakim-debug", updated_at: new Date().toISOString() });

  browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  const configIstekleri = [];
  page.on("request", (r) => { if (r.url().includes("api/config")) configIstekleri.push(`${r.method()} ${r.url().slice(0, 80)}`); });
  page.on("response", (r) => { if (r.url().includes("api/config")) configIstekleri.push(`  ← ${r.status()}`); });

  // Route intercept YOK — gerçek istekler aksın
  await page.goto(SITE + "/?dbg=1", { waitUntil: "domcontentloaded", timeout: 45_000 });
  await page.waitForTimeout(12_000);

  const teshis = await page.evaluate(() => {
    const raw = localStorage.getItem("nur_system_sync_config");
    let cfg = null;
    try { if (raw) cfg = JSON.parse(atob(raw)); } catch { /* şifreli olabilir */ }
    return {
      syncRawUzunluk: raw ? raw.length : 0,
      syncRawIlk60: raw ? raw.slice(0, 60) : "",
      syncParse: cfg ? Object.keys(cfg) : null,
      bodyMetin: document.body.innerText.slice(0, 500),
    };
  });
  console.log("config istekleri:", JSON.stringify(configIstekleri, null, 1));
  console.log("sync store unparsed uzunluk:", teshis.syncRawUzunluk);
  console.log("sync store ilk60:", teshis.syncRawIlk60);
  console.log("body ilk500:", teshis.bodyMetin.slice(0, 200).replace(/\n/g, " | "));
} finally {
  await dbPatch("nur_site_settings?key=eq.maintenance", { value: yedek, updated_by: "bakim-debug", updated_at: new Date().toISOString() });
  if (browser) await browser.close().catch(() => {});
  const son = (await dbOku("nur_site_settings?key=eq.maintenance&select=value"))[0]?.value;
  console.log("\ngeri alındı: enabled=" + son?.enabled);
}
