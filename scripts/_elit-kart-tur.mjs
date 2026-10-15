// GEÇİCİ doğrulama (commit'lenmez): premium modal aç → ELİT kartında "Öncelikli destek" yok (5 dil)
// Açılış: ModalsContainer premiumOpen'i kendi state'i — dev kancası yok. Bunun yerine
// sayfada PremiumModal metnini arıyoruz; açılamazsa DOM'a doğrudan React tetiği:
// HeaderTopBar'daki trialHemenUye butonu (trial bandı varsa) VEYA üyelik menü öğesi.
// En sağlam yol: PremiumModal 'open' prop'suz mount edilemez → premium kancasını
// ModalsContainer'a eklemek yerine window üzerinden tier modülünü kullanamayız.
// PRAGMATİK ÇÖZÜM: React DevTools yok — ama PremiumModal meetodunu DOM'a bakmadan
// test etmenin en hızlı yolu: PremiumModal'ı doğrudan import eden minik bir test
// sayfası yerine, mevcut duman testi premium zaten mount ediyor mu bakar.
// → Bu tur, premiumOpen'i true yapan **sidebar "Üyelik" öğesi** ile açar (menuMetin).
import fs from "fs";

function sozlukDeger(dil, anahtar) {
  const m = fs.readFileSync(`src/i18n/dicts.${dil}.ts`, "utf8").match(new RegExp(`^  ${anahtar}: "((?:[^"\\\\]|\\\\.)*)"`, "m"));
  return m ? m[1].replace(/\\"/g, '"') : null;
}

const { chromium } = await import("playwright-core");
const b = await chromium.launch({ channel: "chrome", headless: true });
const DILLER = ["tr", "en", "ar", "id", "ur"];
let bad = 0;

for (const dil of DILLER) {
  const ctx = await b.newContext({ viewport: { width: 375, height: 800 } });
  await ctx.addInitScript((d) => {
    localStorage.setItem("nur_lang", d);
    localStorage.setItem("nur_minitur_gordu", "1");
    localStorage.setItem("nur_pwa_banner_kapat", String(Date.now()));
    localStorage.setItem("nur_pwa_kuruldu", "1");
  }, dil);
  const p = await ctx.newPage();
  try {
    await p.goto("http://localhost:5173", { waitUntil: "domcontentloaded" });
    for (let i = 0; i < 15; i++) {
      const ok = await p.evaluate(() => { const x = [...document.querySelectorAll("button")].find((b) => /^(tümünü kabul et|kabul et|accept|قبول|سب قبول|terima)/i.test((b.innerText || "").trim())); if (x) { x.click(); return true; } return false; }).catch(() => false);
      if (ok) break;
      await p.waitForTimeout(300);
    }
    await p.waitForTimeout(2500);
    // 1) deneme bandı butonu (trialHemenUye) — varsa tek tık
    const trialEtiket = sozlukDeger(dil, "trialHemenUye") || "";
    let acildi = false;
    if (trialEtiket) {
      acildi = await p.evaluate((txt) => {
        const b = [...document.querySelectorAll("button")].find((x) => (x.innerText || "").trim().includes(txt));
        if (b) { b.click(); return true; }
        return false;
      }, trialEtiket);
    }
    // 2) yoksa: mini-tür menüsünde premium öğesi (t("premium") — menü alt bölümü)
    if (!acildi) {
      const menuEtiket = sozlukDeger(dil, "premium") || sozlukDeger(dil, "membership") || "Premium Pro";
      const menuBtn = p.locator('button[data-minitur="menu"]').first();
      await menuBtn.click({ timeout: 5000 }).catch(() => {});
      await p.waitForTimeout(600);
      acildi = await p.evaluate((txt) => {
        const norm = (s) => s.replace(/İ/g, "i").toLowerCase();
        const b = [...document.querySelectorAll("button")].find((x) => norm(x.innerText || "").includes(norm(txt)));
        if (b) { b.click(); return true; }
        return false;
      }, menuEtiket);
    }
    if (!acildi) throw new Error("premium açılış yolu bulunamadı");
    await p.waitForTimeout(1800);
    const metin = await p.evaluate(() => [...document.querySelectorAll(".modal-in")].map((m) => m.innerText).join("\n"));
    if (!metin.trim()) throw new Error("modal açılmadı");
    const eski = /Öncelikli destek|Priority support|دعم ذو أولوية|Dukungan prioritas|ترجیحی سپورٹ/.test(metin);
    const elitKart = /NÛR ELİT|NÛR ELITE|ELİT OL|ELITE/i.test(metin);
    console.log(`[${dil}] elit-kart:${elitKart ? "✓" : "?"} öncelikli-destek:${eski ? "VAR ✗" : "YOK ✓"}`);
    if (eski) bad++;
    await p.screenshot({ path: `scripts/_elit-oncelikli-${dil}.png` });
    await ctx.close();
  } catch (e) {
    console.log(`[${dil}] HATA: ${String(e?.message || e).slice(0, 140)}`);
    bad++;
    await ctx.close().catch(() => {});
  }
}
await b.close();
console.log(bad === 0 ? "ELIT-KART-PASS: 5 dilde Öncelikli destek yok" : "BULGU=" + bad);
process.exit(bad === 0 ? 0 : 1);
