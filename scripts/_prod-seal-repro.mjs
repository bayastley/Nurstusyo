// ════════════════════════════════════════════════════════════════
// PROD BUILD REPRO — seal() local prod'da da patlıyor mu?
// vite preview (dist) + route-mock /api/config + JSON.stringify kancası
// Kullanım: node scripts/_prod-seal-repro.mjs
// ════════════════════════════════════════════════════════════════
import { chromium } from "playwright-core";

const SITE = "http://localhost:4174";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await (await browser.newContext()).newPage();

await page.addInitScript(() => {
  const oj = JSON.stringify.bind(JSON);
  window.__jsonErr = [];
  JSON.stringify = (v, r, s) => { try { return oj(v, r, s); } catch (e) { window.__jsonErr.push(String(e).slice(0, 140)); throw e; } };
  const os = localStorage.setItem.bind(localStorage);
  window.__setLog = [];
  localStorage.setItem = (k, v) => { window.__setLog.push(k + ":" + String(v).length); return os(k, v); };
});
page.on("pageerror", (e) => console.log("pageerror:", String(e).slice(0, 160)));

await page.route("**/api/config*", async (route) => {
  await route.fulfill({
    status: 200,
    contentType: "application/json",
    headers: { "cache-control": "no-store" },
    body: JSON.stringify({
      ok: true,
      announcement: null,
      featureLocks: [{ feature_id: "namaz", lock_level: "maintenance" }],
      maintenance: { enabled: true, startsAt: "", endsAt: "", message: "PROD REPRO TESTI", updated_at: "2026-10-07T05:00:00.000+00:00" },
      sadikUye: { toplamKayitli: 17, kontenjan: 100 },
    }),
  });
});

await page.goto(`${SITE}/?repro=1`, { waitUntil: "domcontentloaded", timeout: 30_000 }).catch(() => {});
await page.waitForTimeout(9_000);

const t = await page.evaluate((msg) => ({
  ekran: document.body.innerText.includes(msg),
  sync: localStorage.getItem("nur_system_sync_config") ? `DOLU(${localStorage.getItem("nur_system_sync_config").length})` : "BOŞ",
  jsonErr: window.__jsonErr || [],
  setLog: (window.__setLog || []).slice(0, 10),
}), "PROD REPRO TESTI");
console.log("SONUÇ:", JSON.stringify(t, null, 1));
await browser.close();
process.exit(t.ekran && t.sync !== "BOŞ" ? 0 : 1);
