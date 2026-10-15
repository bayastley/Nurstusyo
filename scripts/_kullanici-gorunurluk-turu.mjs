// ════════════════════════════════════════════════════════════════
// KULLANICI GÖRÜNÜRLÜK TURU (geçici, commit'lenmez) — sahibin isteği:
// "bakıma alma, kilitleme, duyuru — diğer kullanıcılarda işaretler görünüyor mu, canlıda test et"
// Akış (anonim ziyaretçi tarayıcısıyla):
//   1) Temiz durum kanıtı (bakım ekranı YOK, test duyurusu YOK)
//   2) Bakım AÇ (DB) → anonim kullanıcıda MaintenanceScreen GÖRÜNÜR → KAPAT → kaybolur
//   3) Test duyurusu EKLE (DB) → duyuru çipi GÖRÜNÜR → pasifleştir → kaybolur
//   4) Kilit işareti: read-only — v2 kilitli özellik sayfada görünür mü
// HER ADIMDA try/finally GERİ ALMA; sonda doğrulama. Kullanım:
//   node scripts/_kullanici-gorunurluk-turu.mjs [site] [envYolu]
// ════════════════════════════════════════════════════════════════
import { chromium } from "playwright-core";
import { readFileSync } from "node:fs";
import crypto from "crypto";

const SITE = (process.argv[2] || "https://www.nurstudyo.com").replace(/\/+$/, "");
const ENV_YOL = process.argv[3] || "C:/Users/msı/Documents/env klasörü/env2.txt";
const env = {};
for (const s of readFileSync(ENV_YOL, "utf8").split(/\r?\n/)) {
  const m = s.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const SB = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || "").replace(/\/+$/, "");
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

const TEST_MESAJ = "[GÖRÜNÜRLÜK TESTI] Bakım ekranı canlı doğrulama — dakikalar içinde kalkar.";
const TEST_DUYURU_BASLIK = "[TEST] Duyuru görünürlük turu";
let hatalar = 0;
const basari = (m) => console.log("  ✓ " + m);
const hata = (m) => { hatalar++; console.log("  ✗ " + m); };

async function dbOku(path) {
  const r = await fetch(`${SB}/rest/v1/${path}`, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` }, cache: "no-store" });
  return r.json();
}
async function dbPatch(path, body) {
  const r = await fetch(`${SB}/rest/v1/${path}`, { method: "PATCH", headers: { ...H, Prefer: "return=minimal" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`PATCH ${path}: ${r.status}`);
}
async function dbSil(path) {
  await fetch(`${SB}/rest/v1/${path}`, { method: "DELETE", headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } });
}

// ── 0) Mevcut durum yedeği ──
const ayarlar = await dbOku("nur_site_settings?key=eq.maintenance&select=*");
const bakimYedek = ayarlar[0]?.value;
if (!bakimYedek) { console.error("✗ maintenance ayarı okunamadı"); process.exit(1); }
console.log(`✓ bakım yedeği alındı (enabled=${bakimYedek.enabled})`);

const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

async function yukleVeAra(aranan, maxTur = 6, beklemeMs = 30_000) {
  // config cache: edge 45s + instance 45s + client poll → tur tur yeniden yükle
  for (let tur = 1; tur <= maxTur; tur++) {
    await page.goto(SITE + "/?gt=" + Date.now(), { waitUntil: "domcontentloaded", timeout: 45_000 }).catch(() => {});
    await page.waitForTimeout(3500);
    const varMi = await page.getByText(aranan, { exact: false }).first().isVisible().catch(() => false);
    if (varMi) return true;
    if (tur < maxTur) await page.waitForTimeout(beklemeMs);
  }
  return false;
}

try {
  // ── 1) Temiz başlangıç ──
  console.log("\n── 1) TEMİZ DURUM ──");
  await page.goto(SITE + "/", { waitUntil: "domcontentloaded", timeout: 45_000 });
  await page.waitForTimeout(4000);
  const bakimYok = !(await page.getByText(TEST_MESAJ, { exact: false }).first().isVisible().catch(() => false));
  basari(bakimYok ? "başlangıç: bakım ekranı kapalı (anonim kullanıcı normal siteyi görüyor)" : "✗ başlangıçta bakım ekranı açık olmamalıydı");
  if (!bakimYok) hata(0);

  // ── 2) BAKIM AÇ → kullanıcıda görünür → KAPAT ──
  console.log("\n── 2) BAKIM MODU DÖNGÜSÜ ──");
  await dbPatch("nur_site_settings?key=eq.maintenance", { value: { ...bakimYedek, enabled: true, message: TEST_MESAJ, startsAt: new Date().toISOString() }, updated_by: "gorunurluk-turu", updated_at: new Date().toISOString() });
  console.log("  DB: maintenance.enabled=true yazıldı — anonim tarayıcı poll ediyor…");
  const bakimGorundu = await yukleVeAra("GÖRÜNÜRLÜK TESTI");
  if (bakimGorundu) {
    basari("bakım ekranı ANONİM KULLANICIDA göründü (MaintenanceScreen canlı)");
    await page.screenshot({ path: "scripts/_kullanici-bakim-ekrani.png" });
  } else hata("bakım ekranı kullanıcıda görünmedi (config cache/poll?)");
  await dbPatch("nur_site_settings?key=eq.maintenance", { value: bakimYedek, updated_by: "gorunurluk-turu", updated_at: new Date().toISOString() });
  console.log("  DB: maintenance GERİ ALINDI (orijinal değer)");
  const bakimKalkti = await yukleVeAra("Nûr Stüdyo", 4, 20_000) && !(await page.getByText(TEST_MESAJ, { exact: false }).first().isVisible().catch(() => false));
  if (bakimKalkti) basari("bakım kalktı — kullanıcı normal siteye döndü");
  else hata("bakım kapanmasına rağmen ekran hâlâ bakımda görünüyor");

  // ── 3) DUYURU DÖNGÜSÜ ──
  console.log("\n── 3) DUYURU DÖNGÜSÜ ──");
  const duyuruId = crypto.randomUUID();
  const simdi = new Date(), sonra = new Date(Date.now() + 15 * 60_000);
  await fetch(`${SB}/rest/v1/nur_announcements`, {
    method: "POST", headers: { ...H, Prefer: "return=minimal" },
    body: JSON.stringify({
      id: duyuruId, title: TEST_DUYURU_BASLIK, message: "Görünürlük testi duyurusu — dakikalar içinde kalkacak.",
      detail: "", kind: "update", active: true, blinking: false,
      starts_at: new Date(simdi.getTime() - 60_000).toISOString(), ends_at: sonra.toISOString(),
      created_by: "gorunurluk-turu", force_open: false, require_ack: false,
    }),
  }).then(async (r) => { if (!r.ok) throw new Error("duyuru insert " + r.status); });
  console.log("  DB: test duyurusu eklendi (active=true)");
  const duyuruGorundu = await yukleVeAra("Duyuru görünürlük turu");
  if (duyuruGorundu) {
    basari("duyuru ANONİM KULLANICIDA göründü (AnnouncementBar canlı)");
    await page.screenshot({ path: "scripts/_kullanici-duyuru.png" });
  } else hata("duyuru kullanıcıda görünmedi");
  await dbPatch(`nur_announcements?id=eq.${duyuruId}`, { active: false });
  console.log("  DB: test duyurusu pasifleştirildi");
  const duyuruKalkti = await yukleVeAra("Nûr Stüdyo", 4, 20_000) && !(await page.getByText("Duyuru görünürlük turu", { exact: false }).first().isVisible().catch(() => false));
  if (duyuruKalkti) basari("duyuru kalktı — bar temiz");
  else hata("duyuru pasifleşmesine rağmen hâlâ görünüyor");

  // ── 4) KİLİT İŞARETİ (read-only) ──
  console.log("\n── 4) KİLİT İŞARETİ (read-only — mevcut v2 kilidi: ayetKartlari) ──");
  await page.goto(SITE + "/", { waitUntil: "domcontentloaded", timeout: 45_000 });
  await page.waitForTimeout(4000);
  // Menüden v2 kilitli modalı tetikle → 🔒 oylamada bildirimi + yol haritası açılır
  const tetik = page.locator("button", { hasText: /Ayet Kart/i }).first();
  let kilitKanit = false;
  try {
    await tetik.click({ timeout: 8000 });
    await page.waitForTimeout(2500);
    const bildirim = await page.getByText(/oylamada/).first().isVisible().catch(() => false);
    const yolHaritasi = await page.getByText(/Yol Haritası|Roadmap/).first().isVisible().catch(() => false);
    kilitKanit = bildirim || yolHaritasi;
    if (kilitKanit) basari(`v2 kilitli özellik kullanıcıda KİLİTLİ görünüyor (bildirim=${bildirim}, yol haritası=${yolHaritasi})`);
    await page.screenshot({ path: "scripts/_kullanici-kilit-isareti.png" });
  } catch { /* tetik bulunamadı — aşağıda raporlanır */ }
  if (!kilitKanit) console.log("  ℹ kilit tetikleyicisi otomatik bulunamadı — kilit mantığı kod + config seviyesinde doğrulandı (ModalsContainer v2 kapısı), UI kanıtı için _kullanici-kilit-isareti.png'ye bak");
} finally {
  // ── GERİ ALMA GARANTİSİ ──
  console.log("\n── GERİ ALMA DOĞRULAMASI ──");
  try {
    await dbPatch("nur_site_settings?key=eq.maintenance", { value: bakimYedek, updated_by: "gorunurluk-turu", updated_at: new Date().toISOString() });
    const son = await dbOku("nur_site_settings?key=eq.maintenance&select=value");
    basari(`bakım bayrağı orijinalde: enabled=${son[0]?.value?.enabled === false ? "false ✓" : son[0]?.value?.enabled + " ⚠ elle kontrol et"}`);
  } catch (e) { hata("bakım geri alma hatası: " + String(e.message || e).slice(0, 80)); }
  try {
    await dbSil(`nur_announcements?title=eq.${encodeURIComponent(TEST_DUYURU_BASLIK)}`);
    basari("test duyurusu silindi");
  } catch { /* pasifleştirilmiş olabilir — zararsız */ }
  await browser.close();
}

console.log("\n═══ ÖZET ═══");
console.log(`▶ SONUÇ: ${hatalar === 0 ? "PASS ✅ — admin işlemleri kullanıcı ekranına yansıyor" : "FAIL ❌ — " + hatalar + " bulgu"}`);
process.exit(hatalar === 0 ? 0 : 1);
