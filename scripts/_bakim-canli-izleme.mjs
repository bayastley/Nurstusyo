// ════════════════════════════════════════════════════════════════
// BAKIM ZİNCİRİ CANLI İZLEME v3 (geçici, commit'lenmez)
// removeItem kancası + stack — sync anahtarını KİM SİLİYOR bulur.
// Kullanım: node scripts/_bakim-canli-izleme.mjs [site]
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
const TEST_MSG = "BAKIM IZLEME TESTI";
const YUK_SAYISI = 3;

async function dbOku(path) { const r = await fetch(`${SB}/rest/v1/${path}`, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` }, cache: "no-store" }); return r.json(); }
async function dbPatch(path, body) { const r = await fetch(`${SB}/rest/v1/${path}`, { method: "PATCH", headers: { ...H, Prefer: "return=minimal" }, body: JSON.stringify(body) }); if (!r.ok) throw new Error("PATCH " + r.status); }
const yedek = (await dbOku("nur_site_settings?key=eq.maintenance&select=value"))[0]?.value;

let browser;
let gordu = false;
try {
  await dbPatch("nur_site_settings?key=eq.maintenance", { value: { ...yedek, enabled: true, message: TEST_MSG + " — kisa sureli.", endsAt: "", startsAt: "" }, updated_by: "bakim-izleme", updated_at: new Date().toISOString() });
  console.log("T0: enabled=true yazıldı");

  browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();

  await page.addInitScript(() => {
    const K = "nur_system_sync_config";
    const os = localStorage.setItem.bind(localStorage);
    const orm = localStorage.removeItem.bind(localStorage);
    const og = localStorage.getItem.bind(localStorage);
    window.__log = [];
    const kayit = (tip, k, ek) => { if (k === K || (k && k.startsWith("nur_"))) window.__log.push({ tip, k, ek: (ek || "").slice(0, 300) }); };
    localStorage.setItem = (k, v) => { kayit("SET", k, String(v).slice(0, 120)); return os(k, v); };
    localStorage.removeItem = (k) => { kayit("DEL", k, new Error().stack || ""); return orm(k); };
    window.getItemLog = [];
    localStorage.getItem = (k) => { if (k === K) window.getItemLog.push((new Error().stack || "").split("\n").slice(1, 3).join("␊").slice(0, 200)); return og(k); };
  });

  for (let dongu = 1; dongu <= YUK_SAYISI; dongu++) {
    await page.goto(`${SITE}/?izle=${dongu}-${Date.now()}`, { waitUntil: "domcontentloaded", timeout: 45_000 }).catch(() => {});
    await page.waitForTimeout(3_000);
    const erkenci = await page.evaluate(() => ({ sync: localStorage.getItem("nur_system_sync_config") ? "DOLU(" + localStorage.getItem("nur_system_sync_config").length + ")" : "BOŞ" }));
    await page.waitForTimeout(9_000);
    const t = await page.evaluate((msg) => ({
      ekran: document.body.innerText.includes(msg),
      sync: localStorage.getItem("nur_system_sync_config") ? `DOLU(${localStorage.getItem("nur_system_sync_config").length})` : "BOŞ",
      log: (window.__log || []).filter((e) => e.k === "nur_system_sync_config"),
      digerYazim: (window.__log || []).filter((e) => e.tip === "SET").length,
      getSay: (window.getItemLog || []).length,
      sonGetStack: (window.getItemLog || []).slice(-2).join(" ||| ").slice(0, 400),
    }), TEST_MSG);
    console.log(`\n── Yük ${dongu}: 3s'de sync=${erkenci.sync} → 12s'de sync=${t.sync} ekran=${t.ekran}`);
    console.log(`   sync-anahtarı olayları: ${JSON.stringify(t.log.slice(0, 6))}`);
    console.log(`   toplam SET=${t.digerYazim} sync-GET=${t.getSay} sonGET-stack: ${t.sonGetStack.slice(0, 260)}`);
    if (t.ekran) { gordu = true; await page.screenshot({ path: "scripts/_bakim-izleme-ekran.png" }); break; }
  }
  console.log(`\n▶ SONUÇ: ${gordu ? "PASS ✅" : "ekran YOK ❌"}`);
} catch (e) {
  console.error("akış hatası:", String(e.message || e).slice(0, 140));
} finally {
  try { await dbPatch("nur_site_settings?key=eq.maintenance", { value: yedek, updated_by: "bakim-izleme", updated_at: new Date().toISOString() }); } catch { /* */ }
  if (browser) await browser.close().catch(() => {});
  const son = await dbOku("nur_site_settings?key=eq.maintenance&select=value");
  console.log(`final: enabled=${son[0]?.value?.enabled} (orijinal: ${yedek?.enabled})`);
  process.exit(gordu ? 0 : 1);
}
