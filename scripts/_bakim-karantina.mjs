// ════════════════════════════════════════════════════════════════
// BAKIM ZİNCİRİ KARANTİNA TESTİ (geçici, commit'lenmez)
// Local dev (5173) + route-fulfilled /api/config → client mantığı izole edilir.
// Adımlar:
//   A) Fresh cevap (enabled=true, updated_at farklı) → AnnouncementBar yazmalı → ekran
//   B) Ekran yoksa: sayfa içi import ile adminSyncService.length saveSystemConfig elle
//      çağır → StudioApp render ediyor mu? (AnnouncementBar safhasını atla)
//   C)secureStore tarafını da elle test et (seal/unseal çalışıyor mu)
// ════════════════════════════════════════════════════════════════
import { chromium } from "playwright-core";

const DEV = process.argv[2] || "http://localhost:5173";

const FRESH = {
  ok: true,
  announcement: null,
  featureLocks: [
    { feature_id: "maher", lock_level: "free", active: true },
    { feature_id: "namaz", lock_level: "maintenance", active: true },
    { feature_id: "ayetKartlari", lock_level: "v2", active: true },
  ],
  maintenance: { enabled: true, startsAt: "", endsAt: "", message: "KARANTINA BAKIM MESAJI", updated_at: "2026-10-06T22:55:00.000Z" },
  sadikUye: { toplamKayitli: 17, kontenjan: 100 },
};

let browser;
try {
  browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  const hatalar = [];
  page.on("pageerror", (e) => hatalar.push(String(e).slice(0, 160)));
  page.on("console", (m) => { if (m.type() === "error" && !m.text().includes("GET") && !m.text().includes("404")) hatalar.push("console: " + m.text().slice(0, 140)); });

  await page.route("**/api/config*", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(FRESH) }));
  await page.goto(DEV + "/", { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForTimeout(12_000);

  const tesbit = await page.evaluate(() => ({
    ekran: document.body.innerText.includes("KARANTINA BAKIM MESAJI"),
    sync: localStorage.getItem("nur_system_sync_config") ? `DOLU(${localStorage.getItem("nur_system_sync_config").length})` : "BOŞ",
    barMetin: document.body.innerText.slice(0, 180).replace(/\n/g, " | "),
  }));
  console.log("A) AnnouncementBar yolu:", JSON.stringify(tesbit));
  if (hatalar.length) console.log("   sayfa hataları:", hatalar.slice(0, 3));

  if (!tesbit.ekran) {
    console.log("\nB) AnnouncementBar aşamasını atla — elle saveSystemConfig:");
    const b = await page.evaluate(async () => {
      try {
        const svc = await import("/src/services/adminSyncService.ts");
        const cfg = svc.getSystemConfig();
        cfg.maintenance = { enabled: true, startsAt: "", endsAt: "", message: "KARANTINA BAKIM MESAJI", updatedAt: new Date().toISOString() };
        svc.saveSystemConfig(cfg);
        await new Promise((r) => setTimeout(r, 1500));
        const syncAnahtar = Object.keys(localStorage).find((k) => k.includes("system_sync") || k === "nur_system_sync_config");
        return {
          yazildi: syncAnahtar ? `${syncAnahtar} dolu(${localStorage.getItem(syncAnahtar)?.length})` : "anahtar yok",
          ekran: document.body.innerText.includes("KARANTINA BAKIM MESAJI"),
          cfgEkranda: svc.getSystemConfig().maintenance?.enabled,
        };
      } catch (e) { return { hata: String(e).slice(0, 200) }; }
    });
    console.log("  ", JSON.stringify(b));
  }
} finally {
  if (browser) await browser.close().catch(() => {});
}
