// ═══════════════════════════════════════════════════════════
// YAYIN BALONCUĞU DEV DOĞRULAMASI (05.10 AnnouncementBar fix'i)
//
// HATA (canlı testin bulgusu): her /api/config poll'u saveSystemConfig →
//   genel "nur_config_updated" event'i fırlatıyordu; AnnouncementBar bu event'i
//   dinleyip local (boş) duyuruyu sunucu duyurusunun üzerine yazıyordu →
//   baloncuk sıradan kullanıcıda ASLA görünmüyordu.
// FIX: duyuru anlık bildirimi özel "nur_duyuru_guncel" event'ine taşındı.
//
// BU TEST: /api/config'i sunucu duyurusuyla mock'lar; baloncuğun göründüğünü
//   ve ARDI NDAN gelen genel nur_config_updated event'lerinin (poll taklidi)
//   baloncuğu SİLMEDİĞİNİ kanıtlar. Fix'siz koşuda 4. adım PATLAR.
// ═══════════════════════════════════════════════════════════

const HEDEF = process.env.DUMAN_URL || "http://localhost:5173";
const IZI = "TEST DUYURUSU 0510";

const { chromium } = await import("playwright-core");
const browser = await chromium.launch({ channel: "chrome", headless: true });
let hatalar = 0;
const basari = (m) => console.log("  ✓ " + m);
const hata = (m) => { hatalar++; console.log("  ✗ " + m); };

try {
  const page = await browser.newPage();
  const mockCfg = {
    ok: true,
    announcement: {
      id: "test-duyuru-0510", title: "🎉 " + IZI, message: "dev doğrulama",
      detail: "", kind: "update", active: true, blinking: true,
      starts_at: new Date(Date.now() - 60000).toISOString(),
      ends_at: new Date(Date.now() + 3600000).toISOString(),
      updated_at: new Date().toISOString(), force_open: false, require_ack: false,
    },
    featureLocks: [{ feature_id: "ayetKartlari", lock_level: "v2" }],
    maintenance: null,
  };
  await page.route("**/api/config**", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mockCfg) }));
  await page.goto(HEDEF, { waitUntil: "domcontentloaded", timeout: 60000 });
  for (let i = 0; i < 20; i++) {
    const t = await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => /Kabul Et/.test((x.innerText || "").trim())); if (b) { b.click(); return true; } return false; }).catch(() => false);
    if (t) break;
    await page.waitForTimeout(250);
  }
  const baloncuk = () => page.evaluate((izi) => { const b = [...document.querySelectorAll("button")].find((x) => (x.innerText || "").includes(izi)); return b ? b.innerText.slice(0, 60) : null; }, IZI);

  const ilk = await (async () => { const t0 = Date.now(); while (Date.now() - t0 < 20000) { const v = await baloncuk().catch(() => null); if (v) return v; await page.waitForTimeout(500); } return null; })();
  if (ilk) basari('baloncuk geldi (poll\'dan): "' + ilk.replace(/\n/g, " ") + '"');
  else hata("mock duyuruyla baloncuk gelmedi (poll çalışmıyor mu?)");

  for (let i = 1; i <= 3; i++) {
    await page.evaluate(() => window.dispatchEvent(new Event("nur_config_updated")));
    await page.waitForTimeout(700);
    const v = await baloncuk().catch(() => null);
    if (v) basari(`genel event #${i} sonrası baloncuk DURUYOR (fix işliyor)`);
    else { hata(`genel event #${i} baloncuğu SİLDİ — eski hata geri gelmiş`); break; }
  }
  await page.screenshot({ path: "scripts/_yayin-dev-dogrula.png" }).catch(() => {});
} finally {
  await browser.close().catch(() => {});
}
console.log(hatalar === 0 ? "▶ SONUÇ: PASS ✅" : `▶ SONUÇ: FAIL ❌ (${hatalar} bulgu)`);
process.exit(hatalar === 0 ? 0 : 1);
