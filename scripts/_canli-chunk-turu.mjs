// ════════════════════════════════════════════════════════════════
// ÇOKLU-CHUNK CANLI DOĞRULAMA (geçici, commit'lenmez)
// Boot'ta indirilen JS × modal açımında ek JS + Keşfet içerik kanıtı
// Kullanım: node scripts/_canli-chunk-turu.mjs [site]
// ════════════════════════════════════════════════════════════════
import { chromium } from "playwright-core";

const SITE = (process.argv[2] || "https://www.nurstudyo.com").replace(/\/+$/, "");
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await (await browser.newContext({ viewport: { width: 1400, height: 950 } })).newPage();

const hatalar = [];
page.on("pageerror", (e) => hatalar.push(String(e).slice(0, 140)));
page.on("console", (m) => { if (m.type() === "error" && !m.text().includes("404")) hatalar.push("console: " + m.text().slice(0, 140)); });

const jsBayt = () => page.evaluate(() => performance.getEntriesByType("resource")
  .filter((r) => r.name.endsWith(".js"))
  .reduce((t, r) => t + r.transferSize, 0));
const jsAdet = () => page.evaluate(() => performance.getEntriesByType("resource").filter((r) => r.name.endsWith(".js")).length);

// 1) BOOT — lazy chunk'lar İNMEMELİ
await page.goto(`${SITE}/?chunk=${Date.now()}`, { waitUntil: "domcontentloaded", timeout: 45_000 });
await page.waitForTimeout(9_000);
const bootBayt = await jsBayt();
const bootAdet = await jsAdet();
const bootKok = await page.evaluate(() => ({
  body: document.body.innerText.length,
  kok: !!document.getElementById("root")?.children.length,
}));
console.log(`BOOT: JS=${(bootBayt / 1024).toFixed(0)}KB (${bootAdet} dosya) | body=${bootKok.body} karakter | root mount=${bootKok.kok}`);

// 2) KEŞFET MODALI — menüden gerçek tıklama (lazy chunk canlıda tetiklenmeli)
const acildi = await page.evaluate(() => {
  const menu = document.querySelector('button[data-minitur="menu"]');
  if (!menu) return "menu-buton-yok";
  menu.click();
  return "tiklandi";
});
await page.waitForTimeout(1_200);
const kesfetTik = await page.evaluate(() => {
  const ogeler = [...document.querySelectorAll("button, [role=button], a")];
  const kes = ogeler.find((b) => (b.textContent || "").includes("Keşfet") || (b.textContent || "").includes("kesfet"));
  if (!kes) return "kesfet-ogesi-yok";
  kes.click();
  return "kesfet-tiklandi";
});
console.log(`menü: ${acildi} | ${kesfetTik}`);
let modalOk = false;
for (let i = 0; i < 10; i++) {
  await page.waitForTimeout(1_500);
  modalOk = await page.evaluate(() => !!document.querySelector(".modal-in"));
  if (modalOk) break;
}const sonBayt = await jsBayt();
const sonAdet = await jsAdet();
const icerik = await page.evaluate(() => {
  const t = document.body.innerText;
  return { kesfet: t.includes("Keşfet"), hadis: t.includes("Hadis") || t.includes("hadis"), uzunluk: t.length };
});
console.log(`MODAL: açıldı=${modalOk} | JS dosya boot=${bootAdet} → son=${sonAdet} (+${sonAdet - bootAdet} lazy) | içerik: keşfet=${icerik.kesfet} hadis=${icerik.hadis} (${icerik.uzunluk} karakter)`);
await page.screenshot({ path: "scripts/_canli-chunk-kesfet.png" });

console.log(`HATALAR: ${hatalar.length ? hatalar.slice(0, 4).join(" ||| ") : "YOK"}`);
await browser.close();
const gecti = modalOk && bootKok.kok && icerik.kesfet && sonAdet > bootAdet;
console.log(gecti ? "▶ SONUÇ: PASS ✅ — lazy chunk canlıda çalışıyor" : "▶ SONUÇ: FAIL ❌");
process.exit(gecti ? 0 : 1);
