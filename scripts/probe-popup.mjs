// PROBE v3 — "Şimdi Kur" popup'ının gerçek DOM kimliğini bul + gizleme testi (yeniden belirme kontrolü)
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright-core";

const PROFIL = path.join(os.homedir(), ".nur-bot-profil");
const PIC = path.join(os.homedir(), "Desktop", "probe-popup.png");

const ctx = await chromium.launchPersistentContext(PROFIL, {
  channel: "chrome", headless: true, viewport: { width: 1080, height: 1920 },
  args: ["--disable-blink-features=AutomationControlled", "--lang=tr"],
});
const s = await ctx.newPage();
await s.goto("https://www.nurstudyo.com", { waitUntil: "domcontentloaded", timeout: 60000 }).catch(() => {});
await s.waitForTimeout(8000);
await s.evaluate(() => {
  [...document.querySelectorAll("button, [role=button]")].filter((b) => /^(anlad[ıi]m|kabul|tamam|devam et)/i.test((b.innerText || "").trim())).forEach((b) => b.click());
}).catch(() => {});
await s.waitForTimeout(1500);

const r1 = await s.evaluate(() => {
  const buton = [...document.querySelectorAll("button, a")].find((b) => (b.innerText || "").includes("Şimdi Kur"));
  if (!buton) return { bulundu: false, not: "Şimdi Kur butonu DOM'da yok" };
  // butondan yukarı çık, kart kökünü bul (ekranın sağ alt bölgesinde küçük kutu)
  let kart = buton;
  for (let i = 0; i < 10 && kart.parentElement && kart.parentElement !== document.body; i++) {
    const p = kart.parentElement;
    const r = p.getBoundingClientRect();
    if (r.width < 700 && r.height < 500) kart = p; else break;
  }
  const r = kart.getBoundingClientRect();
  const butonlar = [...kart.querySelectorAll("button")].map((b) => ({ t: (b.innerText || "").trim().slice(0, 30), aria: b.getAttribute("aria-label") || "" }));
  return {
    bulundu: true,
    tag: kart.tagName,
    cls: (kart.className || "").toString().slice(0, 160),
    pos: getComputedStyle(kart).position,
    boyut: `${Math.round(r.width)}x${Math.round(r.height)} @${Math.round(r.x)},${Math.round(r.y)}`,
    ebeveynTag: kart.parentElement?.tagName,
    ebeveynCls: (kart.parentElement?.className || "").toString().slice(0, 160),
    ebeveynPos: kart.parentElement ? getComputedStyle(kart.parentElement).position : "",
    metinUzun: (kart.textContent || "").length,
    butonlar,
  };
});
console.log("KART:", JSON.stringify(r1, null, 1));

// div.fixed/div.absolute eşleşiyor mu? (mevcut script seçicisi)
const r2 = await s.evaluate(() => {
  const adaylar = [...document.querySelectorAll("div.fixed, div.absolute")].filter((el) => (el.textContent || "").includes("Şimdi Kur"));
  return adaylar.map((el) => ({ cls: (el.className || "").toString().slice(0, 100), boy: Math.round(el.getBoundingClientRect().width) }));
});
console.log("div.fixed/absolute eşleşen:", JSON.stringify(r2));

// gizle → 4 sn bekle → hâlâ gizli mi? (React yeniden belirme testi)
await s.evaluate(() => {
  const buton = [...document.querySelectorAll("button, a")].find((b) => (b.innerText || "").includes("Şimdi Kur"));
  if (!buton) return;
  let kart = buton;
  for (let i = 0; i < 10 && kart.parentElement && kart.parentElement !== document.body; i++) {
    const p = kart.parentElement;
    const r = p.getBoundingClientRect();
    if (r.width < 700 && r.height < 500) kart = p; else break;
  }
  kart.style.setProperty("display", "none", "important");
  window.__probeKart = kart;
});
await s.waitForTimeout(4000);
const r3 = await s.evaluate(() => {
  const kart = window.__probeKart;
  const gizli = kart ? getComputedStyle(kart).display === "none" : null;
  const hala = [...document.querySelectorAll("button, a")].find((b) => (b.innerText || "").includes("Şimdi Kur") && b.offsetParent !== null);
  return { inlineGizli: gizli, domdaHalaGorunur: !!hala };
});
console.log("GİZLEME TESTİ:", JSON.stringify(r3));
await s.screenshot({ path: PIC }).catch(() => {});
await ctx.close().catch(() => {});
process.exit(0);
