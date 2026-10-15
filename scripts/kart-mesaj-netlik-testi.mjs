// ════════════════════════════════════════════════════════
// KART MESAJ NETLİK TESTİ (01.10)
// AMAÇ: Ayet Kütüphanesi "FOTOĞRAF OLARAK İNDİR" akışının
//   ürettiği PNG'de (1080×1350) mesaj katmanının — RENK ÇUBUĞU
//   + ÖZEL YAZI — gerçekten çizildiğini ve çözünürlüklü
//   çıktıda NET (antialias bulanıklığı değil, keskin gövde)
//   göründüğünü PİKSEL analiziyle kanıtlar.
// YÖNTEM: HTMLCanvasElement.prototype.toBlob yamalanarak İNDİR
//   düğmesinin ürettiği gerçek PNG yakalanır (kullanıcı akışı
//   bozulmaz) → createImageBitmap ile decode → kenar şeridi,
//   yazı bandı ve keskinlik ölçümleri → katmanlar KAPATILIP
//   ikinci PNG ile A/B karşılaştırması.
// KULLANIM:
//   node scripts/kart-mesaj-netlik-testi.mjs                    → local (localhost:5173)
//   node scripts/kart-mesaj-netlik-testi.mjs https://site.com   → canlı
// GEREKLİ: vite dev ayakta (npm run dev). playwright-core devDependency'de.
// ════════════════════════════════════════════════════════
import { chromium } from "playwright-core";

const HEDEF = process.argv[2] ?? "http://localhost:5173";
const MESAJ_METNI = "Netlik testi 01.10 — نور 🌙";

const cizgi = "═".repeat(51);
console.log(cizgi);
console.log(" KART MESAJ NETLİK TESTİ — PNG çıktıda çubuk + özel yazı");
console.log(` Hedef: ${HEDEF}`);
console.log(cizgi);

// ── yardımcılar ──────────────────────────────────────────
// evaluate'ten DOM elemanı döndürülemez — locator kullan (esm-tarama deseni)
const tikla = async (page, metin, etiket) => {
  const loc = page.locator("button:visible", { hasText: metin }).first();
  try { await loc.waitFor({ state: "visible", timeout: 15000 }); } catch { throw new Error(`düğme bulunamadı: ${etiket ?? metin}`); }
  await loc.click();
};

const ekranKaydet = async (page, ad) => {
  try { await page.screenshot({ path: `scripts/_kart-mesaj-${ad}.png`, fullPage: false }); } catch { /* noop */ }
};

// PNG blob'unu decode edip piksel ölçümlerini döndürür (page içinde koşar)
const pngOlculeri = (sirano) => pageEvaluateOlculer(sirano);
let page = null;
const pageEvaluateOlculer = async (sirano) => await page.evaluate(async (n) => {
  const kayit = window.__nurKartBloblari?.[n];
  if (!kayit) return null;
  const bmp = await createImageBitmap(kayit.blob);
  const c = document.createElement("canvas");
  c.width = bmp.width; c.height = bmp.height;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(bmp, 0, 0);
  const d = ctx.getImageData(0, 0, c.width, c.height).data;
  const px = (x, y) => { const i = (Math.round(y) * c.width + Math.round(x)) * 4; return [d[i], d[i + 1], d[i + 2]]; };
  // 1) Çubuk: iki dikey kenarda 5 örnek — doygun renkli şerit kriteri
  const kenarOrnek = [];
  for (const oran of [0.2, 0.35, 0.5, 0.65, 0.8]) {
    const y = Math.floor(c.height * oran);
    kenarOrnek.push(px(1, y), px(c.width - 2, y));
  }
  const ort = (dizi, k) => Math.round(dizi.reduce((s, p) => s + p[k], 0) / dizi.length);
  const minOrt = ort(kenarOrnek, 0) === undefined ? 0 : Math.round(kenarOrnek.reduce((s, p) => s + Math.min(p[0], p[1], p[2]), 0) / kenarOrnek.length);
  const satOrt = Math.round(kenarOrnek.reduce((s, p) => s + (Math.max(p[0], p[1], p[2]) - Math.min(p[0], p[1], p[2])), 0) / kenarOrnek.length);
  const ortaKenar = px(1, Math.floor(c.height / 2));
  // 2) Özel yazı: alt bantta tam çözünürlüklü tarama — en parlak + beyaz çekirdek sayımı
  let parlak = { v: -1, x: 0, y: 0 };
  let cekirdek = 0;
  const bantUst = Math.floor(c.height * 0.88), bantAlt = Math.floor(c.height * 0.96);
  for (let y = bantUst; y < bantAlt; y += 1) {
    for (let x = Math.floor(c.width * 0.15); x < Math.floor(c.width * 0.85); x += 1) {
      const i = (y * c.width + x) * 4;
      const v = d[i] + d[i + 1] + d[i + 2];
      if (v > parlak.v) parlak = { v, x, y };
      if (v >= 700) cekirdek++;
    }
  }
  let komsuOrt = 0;
  if (parlak.v >= 700) {
    let toplam = 0;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      const p = px(parlak.x + dx, parlak.y + dy);
      toplam += p[0] + p[1] + p[2];
    }
    komsuOrt = Math.round(toplam / 25);
  }
  return { w: c.width, h: c.height, minOrt, satOrt, ortaKenar, bantEnParlak: parlak.v, bantPiksel: parlak, komsuOrt, cekirdek };
}, sirano);

// ── akış ─────────────────────────────────────────────────
const kontroller = [];
const kaydet = (ad, ok, kanit) => { kontroller.push({ ad, ok, kanit }); console.log(`  ${ok ? "✓" : "✗"} ${ad}${kanit ? ` — ${kanit}` : ""}`); };
let hata = null;

try {
  const { chromium: _c } = { chromium };
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  // 🍪 Çerez banner'ı tıklamaları yutmasın: onay depolanmış başlat (CookieConsent.tsx COOKIE_KEY/v)
  await ctx.addInitScript(() => {
    try { localStorage.setItem("nur_cookie_consent", JSON.stringify({ necessary: true, analytics: false, marketing: false, v: "2026-09-27" })); } catch { /* noop */ }
  });
  page = await ctx.newPage();
  await page.goto(HEDEF, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForSelector("body", { timeout: 30000 });
  await page.waitForTimeout(2500);

  // 1) Modalı aç
  const acEti = await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => x.offsetParent && /Ayet Kütüphanesi|مكتبة الآيات/.test(x.textContent));
    if (b) { b.click(); return b.textContent.trim().slice(0, 30); }
    return null;
  });
  if (!acEti) throw new Error("Ayet Kütüphanesi giriş düğmesi bulunamadı (kilitli olabilir)");
  await page.waitForFunction(() => document.body.textContent.includes("Kart Ayarları"), null, { timeout: 20000 });
  await page.waitForTimeout(1200);
  kaydet("modal açıldı", true, `giriş: ${acEti}`);

  // 2) Ayar panelini aç + toBlob yaması
  await tikla(page, "Kart Ayarları", "Kart Ayarları");
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    window.__nurKartBloblari = [];
    const orig = HTMLCanvasElement.prototype.toBlob;
    HTMLCanvasElement.prototype.toBlob = function (cb, tur, kal) {
      return orig.call(this, (b) => { window.__nurKartBloblari.push({ blob: b, w: this.width, h: this.height }); cb && cb(b); }, tur, kal);
    };
  });

  // 3) Renk Çubuğu + Özel Yazı'yı AÇIK yap (iki "KAPALI" düğmesi sırayla)
  const acikDurum = await page.evaluate(() => {
    const panelBtn = [...document.querySelectorAll("button")].find((b) => b.offsetParent && b.textContent.includes("Kart Ayarları"));
    const kutu = panelBtn.closest("div.glass-soft") ?? panelBtn.parentElement?.parentElement;
    const kapatBtn = () => [...kutu.querySelectorAll("button")].filter((b) => b.offsetParent && b.textContent.trim() === "KAPALI");
    kapatBtn()[0]?.click();
    return new Promise((res) => setTimeout(() => {
      kapatBtn()[0]?.click();
      setTimeout(() => res({ acik: [...kutu.querySelectorAll("button")].filter((b) => b.offsetParent && b.textContent.trim() === "AÇIK").length }), 500);
    }, 500));
  });
  kaydet("renk çubuğu + özel yazı AÇIK", acikDurum.acik >= 2, `açık düğme: ${acikDurum.acik}`);

  // 4) Mesaj metni + boyut kaydırıcısını %130'a çek (çözünürlüklü çıktıda ~46px font)
  const metinSonuc = await page.evaluate((metin) => {
    const panelBtn = [...document.querySelectorAll("button")].find((b) => b.offsetParent && b.textContent.includes("Kart Ayarları"));
    const kutu = panelBtn.closest("div.glass-soft") ?? panelBtn.parentElement?.parentElement;
    const ta = [...kutu.querySelectorAll("textarea")].find((e) => e.offsetParent);
    if (!ta) return { ta: false };
    const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
    setter.call(ta, metin);
    ta.dispatchEvent(new Event("input", { bubbles: true }));
    const range = [...kutu.querySelectorAll("input[type=range]")].find((e) => e.min === "70" && e.max === "160");
    let olcek = null;
    if (range) {
      const rsetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
      rsetter.call(range, "130");
      range.dispatchEvent(new Event("input", { bubbles: true }));
      olcek = range.value;
    }
    return new Promise((res) => setTimeout(() => res({ ta: true, metin: ta.value, olcek }), 600));
  }, MESAJ_METNI);
  kaydet("özel yazı metni + boyut %130", metinSonuc.ta && metinSonuc.metin === MESAJ_METNI && metinSonuc.olcek === "130", `metin "${MESAJ_METNI}" · olcek %${metinSonuc.olcek}`);

  // 5) İNDİR → gerçek PNG'yi yakala
  const indirSonuc = await page.evaluate(() => {
    const ind = [...document.querySelectorAll("button")].find((b) => b.offsetParent && /FOTOĞRAF OLARAK İNDİR|PNG/.test(b.textContent));
    if (!ind) return { ind: false };
    const n0 = window.__nurKartBloblari.length;
    ind.click();
    return new Promise((res) => setTimeout(() => {
      const k = window.__nurKartBloblari[n0];
      res({ ind: true, say: window.__nurKartBloblari.length - n0, boyut: k ? [k.w, k.h, k.blob.type] : null, toast: document.body.textContent.includes("Ayet kartı indirildi") });
    }, 3000));
  });
  kaydet("PNG indirildi (gerçek İNDİR akışı)", indirSonuc.ind && indirSonuc.say === 1, `1080×1350 ${indirSonuc.boyut?.join(" · ")} · toast:${indirSonuc.toast}`);

  // 6) AÇIK PNG ölçümleri
  const A = await pngOlculeri(0);
  if (!A) throw new Error("PNG blob decode edilemedi");
  kaydet("çubuk PNG'de: kenarlar renkli şerit", A.minOrt > 55 && A.satOrt > 35, `kenar RGB(${A.ortaKenar.join(",")}) · min ort ${A.minOrt} · doygunluk ${A.satOrt}`);
  kaydet("özel yazı PNG'de: beyaz gövde", A.bantEnParlak > 600, `bant en parlak ${A.bantEnParlak}/765 @(${A.bantPiksel.x},${A.bantPiksel.y})`);
  kaydet("netlik: çözünürlüklü keskin gövde", A.cekirdek >= 300 && A.komsuOrt >= 500, `beyaz çekirdek ${A.cekirdek} piksel · gövde ort ${A.komsuOrt}/765`);

  // 7) Katmanları KAPAT → B turu
  await page.evaluate(() => {
    const panelBtn = [...document.querySelectorAll("button")].find((b) => b.offsetParent && b.textContent.includes("Kart Ayarları"));
    const kutu = panelBtn.closest("div.glass-soft") ?? panelBtn.parentElement?.parentElement;
    const acikBtn = () => [...kutu.querySelectorAll("button")].filter((b) => b.offsetParent && b.textContent.trim() === "AÇIK");
    acikBtn()[0]?.click();
    return new Promise((res) => setTimeout(() => {
      const kalan = acikBtn();
      kalan[kalan.length - 1]?.click();
      setTimeout(() => res(acikBtn().length), 500);
    }, 500));
  });
  await page.waitForTimeout(300);
  const say0 = await page.evaluate(() => { const n = window.__nurKartBloblari.length; [...document.querySelectorAll("button")].find((b) => b.offsetParent && /FOTOĞRAF OLARAK İNDİR|PNG/.test(b.textContent))?.click(); return n; });
  await page.waitForTimeout(3000);
  const B = await pngOlculeri(say0);
  kaydet("A/B: katmanlar kapalı → şerit ve yazı kayboluyor",
    B && B.minOrt < 40 && B.bantEnParlak < 450,
    `kenar RGB(${B.ortaKenar.join(",")}) · bant en parlak ${B.bantEnParlak} (açıkken ${A.bantEnParlak})`);

  // 8) Temizlik: sıfırla + panel kapat + modal Esc
  await page.evaluate(() => {
    const panelBtn = [...document.querySelectorAll("button")].find((b) => b.offsetParent && b.textContent.includes("Kart Ayarları"));
    const kutu = panelBtn.closest("div.glass-soft") ?? panelBtn.parentElement?.parentElement;
    [...kutu.querySelectorAll("button")].find((b) => b.offsetParent && b.textContent.includes("Ayarları sıfırla"))?.click();
    window.__nurKartBloblari = [];
    setTimeout(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    }, 400);
  });

  await browser.close();
} catch (e) {
  hata = e;
  console.log(`  ✗ HATA: ${e.message}`);
  if (page) { await ekranKaydet(page, "hata-goruntusu"); try { await page.context().browser()?.close(); } catch { /* noop */ } }
}

// ── ÖZET ─────────────────────────────────────────────────
const gecti = kontroller.filter((k) => k.ok).length;
console.log("── ÖZET ──");
console.log(`  ${kontroller.length} kontrol · ${gecti} geçti · ${kontroller.length - gecti} kaldı${hata ? " · HATA ile kesildi" : ""}`);
if (gecti === kontroller.length && kontroller.length >= 6 && !hata) {
  console.log("▶ SONUÇ: PASS ✅ — indirilen PNG mesaj katmanını çözünürlüklü ve net taşıyor");
  process.exit(0);
} else {
  console.log("▶ SONUÇ: FAIL ❌ — ekran görüntüsü: scripts/_kart-mesaj-hata-goruntusu.png");
  process.exit(1);
}
