// GEÇİCİ teşhis (commit'lenmez): pill neden bulunamıyor?
const { chromium } = await import("playwright-core");
const b = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await b.newContext({ viewport: { width: 375, height: 800 } });
await ctx.addInitScript(() => {
  localStorage.setItem("nur_lang", "tr");
  localStorage.setItem("nur_minitur_gordu", "1");
  localStorage.setItem("nur_pwa_banner_kapat", String(Date.now()));
  localStorage.setItem("nur_pwa_kuruldu", "1");
});
const p = await ctx.newPage();
await p.goto("http://localhost:5173", { waitUntil: "domcontentloaded" });
for (let i = 0; i < 15; i++) {
  const ok = await p.evaluate(() => { const x = [...document.querySelectorAll("button")].find((b) => /^(tümünü kabul et|kabul et)/i.test((b.innerText || "").trim())); if (x) { x.click(); return true; } return false; }).catch(() => false);
  if (ok) break;
  await p.waitForTimeout(300);
}
await p.waitForTimeout(3000);
const bilgi = await p.evaluate(() => {
  const butonlar = [...document.querySelectorAll("button")];
  const aday = butonlar.filter((b) => /Ücretsiz|NÛR PRO|NÛR ELİT|Free|Gratis/.test((b.innerText || "").trim()));
  return {
    butonAdet: butonlar.length,
    adaylar: aday.slice(0, 8).map((b) => ({
      metin: (b.innerText || "").trim().slice(0, 40),
      sinif: (b.className || "").slice(0, 90),
      title: b.getAttribute("title") || "",
      gorunur: !!b.offsetParent,
    })),
    headTopBarVar: !!document.querySelector("header") || butonlar.some((b) => (b.innerText || "").includes("STÜDYO")),
    gununAyeti: (document.body.innerText || "").includes("GÜNÜN AYETİ") || (document.body.innerText || "").includes("Günün Ayeti"),
  };
});
console.log(JSON.stringify(bilgi, null, 2));
await b.close();
