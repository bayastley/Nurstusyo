// ── Bakım yazım zinciri: sayfa içi mikro-teşhis (geçici) ──
import { chromium } from "playwright-core";
import { readFileSync } from "node:fs";

const SITE = "https://www.nurstudyo.com";
const env = {};
for (const s of readFileSync("C:/Users/msı/Documents/env klasörü/env2.txt", "utf8").split(/\r?\n/)) {
  const m = s.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const SB = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || "").replace(/\/+$/, "");
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
const TEST_MSG = "[GÖRÜNÜRLÜK TESTI] Bakım ekranı canlı doğrulama — dakikalar içinde kalkar.";

async function dbPatch(path, body) {
  const r = await fetch(`${SB}/rest/v1/${path}`, { method: "PATCH", headers: { ...H, Prefer: "return=minimal" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`PATCH: ${r.status}`);
}
async function dbOku(path) {
  const r = await fetch(`${SB}/rest/v1/${path}`, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` }, cache: "no-store" });
  return r.json();
}

const yedek = (await dbOku("nur_site_settings?key=eq.maintenance&select=value"))[0]?.value;
let browser;
try {
  await dbPatch("nur_site_settings?key=eq.maintenance", { value: { ...yedek, enabled: true, message: TEST_MSG }, updated_by: "mikrotezhis", updated_at: new Date().toISOString() });

  browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  page.on("pageerror", (e) => console.log("PAGEERROR:", String(e).slice(0, 120)));

  // Cache-bust'lı config'i EDGE İSTEGİYLE al: yeni query key → garanti fresh
  await page.goto(`${SITE}/?t=${Date.now()}`, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await page.waitForTimeout(2000);

  // CDN bayat cevabı ezmek için ANNOUNCEMENTBAR'ın kullandığı yoldan fresh çek:
  // aynı origin'de farklı query = farklı cache anahtarı (Vercel default: URL'de query dahil)
  const teshis = await page.evaluate(async () => {
    const r = await fetch(`/api/config?cb=${Date.now()}`, { cache: "no-store" });
    const data = await r.json();
    const cikti = {
      apiMaintenance: data.maintenance ? { enabled: data.maintenance.enabled, updated_at: data.maintenance.updated_at ?? "(YOK!)" } : "(API cevabında maintenance ALANI YOK)",
      updated_atAlani: data.maintenance?.updated_at ? "VAR" : "YOK",
    };
    // Aynı yazım kodunu elle koş (AnnouncementBar'daki分支 birebir):
    try {
      if (data?.maintenance && typeof data.maintenance === "object") {
        const m = data.maintenance;
        // adminSyncService'e erişemediğimiz için劲儿 secureSet yerine NE yazılacağını tahmin et:
        cikti.maintenance = { enabled: Boolean(m.enabled), message: m.message, updated_at: m.updated_at };
      }
    } catch (e) { cikti.hata = String(e).slice(0, 100); }
    // Login durumu ve localStorage anahtar listesi:
    cikti.tumAnahtarlar = Object.keys(localStorage).filter((k) => k.startsWith("nur_")).slice(0, 30);
    cikti.syncStore = localStorage.getItem("nur_system_sync_config") ? `DOLU (${localStorage.getItem("nur_system_sync_config").length} bayt)` : "BOŞ";
    return cikti;
  });
  console.log("API cevabı maintenance:", JSON.stringify(teshis.apiMaintenance));
  console.log("updated_at alanı:", teshis.updated_atAlani);
  console.log("syncStore:", teshis.syncStore);
  console.log("nur_ anahtarları:", teshis.tumAnahtarlar.join(", ").slice(0, 400));

  // 15 sn bekle → AnnouncementBar'ın 90sn poll'u değil, uygulama natural akışı (ilk load poll'u)
  // hizmetin fresh'e yetmesi için SWR'ı ezmek: SONRAKI sayfa yükleme, edge age artık 15sn sonra yeni anahtar (4. istek)
  await page.waitForTimeout(15_000);
  await page.goto(`${SITE}/?t2=${Date.now()}`, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await page.waitForTimeout(10_000);
  const t2 = await page.evaluate(() => ({
    sync: localStorage.getItem("nur_system_sync_config") ? "DOLU(" + localStorage.getItem("nur_system_sync_config").length + ")" : "BOŞ",
    bakimMetin: document.body.innerText.includes("GÖRÜNÜRLÜK TESTI"),
    bakimKelime: document.body.innerText.includes("bakım") || document.body.innerText.includes("Bakım") || document.body.innerText.includes("güncelleniyor"),
  }));
  console.log("2. yüklem:", JSON.stringify(t2));
} finally {
  await dbPatch("nur_site_settings?key=eq.maintenance", { value: yedek, updated_by: "mikrotezhis", updated_at: new Date().toISOString() });
  if (browser) await browser.close().catch(() => {});
  const son = await dbOku("nur_site_settings?key=eq.maintenance&select=value");
  console.log("\ngeri alındı: enabled=" + son[0]?.value?.enabled);
}
