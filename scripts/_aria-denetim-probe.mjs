// UNTRACKED YARDIMCI (_ önekli, repo dışı) — ARIA DENETİMİ çapraz kontrolü.
// Her modalı açar; X zincirinin 1. aşaması (aria-label="kapat") tutuyor mu raporlar.
// Duman çıktısında uyarı görünmemesi = tüm X'ler aria'lı iddiasını bağımsız doğrular.
const { chromium } = await import("playwright-core");
const IDLER = ["atmos", "themes", "prayer", "contact", "login", "library", "quranLearn", "quranListen", "ayetKartlari", "siteHakkinda", "ramazan", "ayetPaketleri", "ozelGunTakvimi", "kesfet", "hafizlikTesti", "ayetNotlari", "kelimeAtolyesi", "arkaPlanUretici", "davet", "haftaninVideosu", "kendiSes"];
const SECICI = '.fixed.inset-0[class*="z-[80]"], .fixed.inset-0[class*="z-[90]"], .fixed.inset-0[class*="z-[95]"], .fixed.inset-0[class*="z-[96]"], .fixed.inset-0[class*="z-[100]"], .fixed.inset-0[class*="z-[300]"]';
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
await page.goto("http://localhost:5173", { waitUntil: "domcontentloaded", timeout: 60000 });
for (let i = 0; i < 60; i++) {
  if (await page.evaluate(() => typeof window.setNurModal === "function").catch(() => false)) break;
  await page.waitForTimeout(400);
}
const arialilar = [], ariasizlar = [];
for (const id of IDLER) {
  const bilgi = await page.evaluate((mid) => {
    window.setNurModal(mid);
    return new Promise((coz) => {
      const t0 = performance.now();
      (function bak() {
        const kok = document.querySelector('.fixed.inset-0[class*="z-[80]"], .fixed.inset-0[class*="z-[90]"], .fixed.inset-0[class*="z-[95]"], .fixed.inset-0[class*="z-[96]"], .fixed.inset-0[class*="z-[100]"], .fixed.inset-0[class*="z-[300]"]');
        if (!kok) { if (performance.now() - t0 > 3000) return coz({ acildi: false }); return requestAnimationFrame(bak); }
        const butonlar = [...kok.querySelectorAll("button")];
        const aria = butonlar.find((b) => (b.getAttribute("aria-label") || "").trim().toLowerCase() === "kapat");
        const yazi = butonlar.find((b) => (b.innerText || "").trim().toLowerCase() === "kapat");
        const title = butonlar.find((b) => !(b.innerText || "").trim() && b.querySelector("svg") && (b.getAttribute("title") || "").toLowerCase().includes("kapat"));
        coz({ acildi: true, ariaEtiketi: aria ? aria.getAttribute("aria-label") : null, yazi: !!yazi, title: !!title });
      })();
    });
  }, id);
  if (!bilgi.acildi) { console.log("  ? " + id.padEnd(18) + " açılmadı"); continue; }
  const satir = bilgi.ariaEtiketi ? "ARIA-LI (" + bilgi.ariaEtiketi + ")" : "ARIA-SIZ (yazi:" + bilgi.yazi + " title:" + bilgi.title + ")";
  console.log("  " + (bilgi.ariaEtiketi ? "✓" : "✗") + " " + id.padEnd(18) + satir);
  (bilgi.ariaEtiketi ? arialilar : ariasizlar).push(id);
  await page.keyboard.press("Escape").catch(() => {});
  await page.waitForTimeout(350);
}
console.log("\n── ÖZET ── " + arialilar.length + " aria'lı · " + ariasizlar.length + " aria'sız" + (ariasizlar.length ? " → " + ariasizlar.join(", ") : ""));
await browser.close().catch(() => {});
process.exit(0);
