// ═══════════════════════════════════════════════════════════
// PAYLAŞIM E2E — 5 hedef × masaüstü/mobil (WhatsApp, YouTube,
// TikTok, Instagram, X)
//
// NE TEST EDİLİR:
//   1. Çıktı geri yükleme: IndexedDB'deki (nur_video_store) video
//      açılışta outputs'a gelir → "Hızlı paylaş" çip şeridi belirir.
//   2. Cihaza göre çip seti: masaüstünde YouTube + WhatsApp Web VAR,
//      TikTok/Instagram YOK; mobilde tersi (useShareActions kuralı).
//   3. Tıklama akışı: her çip doğru URL'i açar (window.open loglanır —
//      GERÇEK SEKME AÇILMAZ, stub) + metin kopyalamalı çipler panoya
//      yazar (clipboard stub logu).
//   4. Gerçek hedef erişimi: 6 hedef URL node fetch ile sınanır —
//      200/3xx = OK; 401/403 veya login yönlendirmesi = DUVAR (normal,
//      platform hesap şartı); 404/5xx/DNS = KIRIK.
//      ★ 05.10: node fetch bot-duvarına takılabilir (WhatsApp Web fetch'te 400,
//      gerçek Chrome'da 200) — şüpheli sonuçlar gerçek Chrome navigasyonuyla
//      teyit edilmeli; X için twitter.com→x.com değişikliği bu testin bulgusudur.
//
// KULLANIM:
//   node scripts/paylasim-e2e.mjs
//   PAYLASIM_URL=https://www.nurstudyo.com node scripts/paylasim-e2e.mjs
//
// GEREKLİ: vite dev ayakta (varsayılan http://localhost:5173).
//   playwright-core devDependency; tarayıcı = sistem Chrome (channel:"chrome").
//   Not: navigator.share (native paylaş menüsü) headless'ta test edilemez —
//   kapsam dışı, "Paylaş" ana düğmesi ayrıca elle sınanmalı.
// ═══════════════════════════════════════════════════════════

import { chromium } from "playwright-core";

const HEDEF = (process.env.PAYLASIM_URL || "http://localhost:5173").replace(/\/+$/, "");
const EXIT_HATA = 1;

// ─── Beklenen davranış matrisi (useShareActions.ts ile eşleşir) ───
const BEKLENEN = {
  masaustu: {
    gorunur: ["WhatsApp", "X", "YouTube", "WhatsApp Web"],
    gizli: ["TikTok", "Instagram"],
    tiklama: {
      WhatsApp: { url: "https://web.whatsapp.com/send", pano: false },
      X: { url: "https://x.com/intent/tweet", pano: false },
      YouTube: { url: "https://studio.youtube.com/channel/upload", pano: true },
      "WhatsApp Web": { url: "https://web.whatsapp.com/send", pano: false },
    },
  },
  mobil: {
    gorunur: ["WhatsApp", "Instagram", "TikTok", "X"],
    gizli: ["YouTube", "WhatsApp Web"],
    tiklama: {
      WhatsApp: { url: "https://wa.me/", pano: false },
      X: { url: "https://x.com/intent/tweet", pano: false },
      TikTok: { url: "https://www.tiktok.com/creator-center/upload", pano: true },
      Instagram: { url: "https://www.instagram.com/reels/", pano: true },
    },
  },
};

// ─── Gerçek hedef erişim listesi ───
const HEDEF_URLLER = [
  { ad: "WhatsApp Web (masaüstü)", url: "https://web.whatsapp.com/send?text=nur-e2e" },
  { ad: "WhatsApp wa.me (mobil)", url: "https://wa.me/?text=nur-e2e" },
  { ad: "X intent/tweet (x.com)", url: "https://x.com/intent/tweet?text=nur-e2e" },
  { ad: "YouTube Studio yükleme", url: "https://studio.youtube.com/channel/upload" },
  { ad: "TikTok Creator Center", url: "https://www.tiktok.com/creator-center/upload" },
  { ad: "Instagram Reels", url: "https://www.instagram.com/reels/" },
];

const CHROME_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
const IPHONE_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

const kiriklar = [];

function ok(mesaj) { console.log("  ✓ " + mesaj); }
function hata(mesaj) { console.log("  ✗ " + mesaj); kiriklar.push(mesaj); }
function not(mesaj) { console.log("  ⚠ " + mesaj); }

/** Çerez banner'ını kapat (overlay tıklamaları kirletmesin) */
async function cerezBanneriniKapat(page) {
  for (let i = 0; i < 20; i++) {
    const tiklandi = await page.evaluate(() => {
      const b = [...document.querySelectorAll("button")].find((x) => /Kabul Et/.test((x.innerText || "").trim()));
      if (b) { b.click(); return true; }
      return false;
    }).catch(() => false);
    if (tiklandi) {
      const kalkti = await page.waitForFunction(
        () => ![...document.querySelectorAll("button")].some((x) => /Kabul Et/.test((x.innerText || "").trim())),
        { timeout: 4000 }
      ).then(() => true).catch(() => false);
      if (kalkti) return;
    }
    await page.waitForTimeout(200);
  }
}

/** nur_video_store'a sahte e2e videosu yazar (gerçek üretim akışı olmadan) */
async function sahteVideoSeedle(page) {
  await page.evaluate(async () => {
    const blob = new Blob([new Uint8Array(2048)], { type: "video/mp4" });
    const kayit = {
      id: "e2e-paylasim-test-videosu",
      label: "E2E test videosu",
      mime: "video/mp4",
      ext: "mp4",
      size: blob.size,
      duration: 12,
      createdAt: Date.now(),
      blob,
    };
    await new Promise((coz, red) => {
      const req = indexedDB.open("nur_video_store", 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains("videos")) {
          const st = db.createObjectStore("videos", { keyPath: "id" });
          st.createIndex("createdAt", "createdAt");
        }
      };
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction("videos", "readwrite");
        tx.objectStore("videos").put(kayit);
        tx.oncomplete = () => { db.close(); coz(); };
        tx.onerror = () => red(tx.error);
      };
      req.onerror = () => red(req.error);
    });
  });
  await page.reload({ waitUntil: "domcontentloaded" });
  await cerezBanneriniKapat(page);
}

/** Tek cihaz türü için tüm paylaşımları sınar */
async function cihaziSina(browser, { ad, ua, viewport, isMobile, hasTouch, kurulum }) {
  console.log("\n── " + ad + " ──");
  const beklenen = BEKLENEN[kurulum];
  const ctx = await browser.newContext({ userAgent: ua, viewport, isMobile, hasTouch, locale: "tr" });
  const page = await ctx.newPage();
  page.setDefaultTimeout(15000);

  await page.addInitScript(() => {
    try {
      localStorage.setItem("nur_minitur_gordu", "1");
      localStorage.setItem("nur_pwa_banner_kapat", String(Date.now()));
      localStorage.setItem("nur_pwa_kuruldu", "1");
    } catch { /* yut */ }
    // window.open STUB — gerçek sekme açılmaz, hedef URL loglanır
    window.__nurPopupLog = [];
    window.open = function (u) { window.__nurPopupLog.push(String(u || "")); return null; };
    // clipboard STUB — panoya yazılan metin loglanır
    window.__nurClipboard = [];
    try {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        get() {
          return {
            writeText: (t) => { window.__nurClipboard.push(String(t ?? "")); return Promise.resolve(); },
            readText: () => Promise.resolve(""),
          };
        },
      });
    } catch { /* yut */ }
  });

  try {
    await page.goto(HEDEF, { waitUntil: "domcontentloaded", timeout: 60000 });
    await cerezBanneriniKapat(page);
    await sahteVideoSeedle(page);

    // 1) Çıktı geri yükleme + çip şeridi belirme
    const ciplerHazir = await page.waitForFunction(() => {
      const kutu = document.querySelector("#video-hazir-kutusu");
      return Boolean(kutu && kutu.querySelectorAll("button").length >= 3);
    }, { timeout: 15000 }).then(() => true).catch(() => false);
    if (!ciplerHazir) {
      hata(ad + ": çıktı geri yüklenemedi / hızlı-paylaş çipleri görünmedi (IndexedDB seed → restore akışı kırık?)");
      return;
    }
    ok("Çıktı geri yüklendi, çip şeridi görünür");

    // 2) Çip seti doğru mu (cihaz kuralı)
    const chipler = await page.evaluate(() =>
      [...document.querySelectorAll("#video-hazir-kutusu button")].map((b) => (b.innerText || "").trim())
    );
    const eksik = beklenen.gorunur.filter((c) => !chipler.some((x) => x.includes(c)));
    const fazladan = beklenen.gizli.filter((c) => chipler.some((x) => x.includes(c)));
    if (eksik.length) hata(ad + ": beklenen çipler YOK → " + eksik.join(", ") + " (görünen: " + chipler.join(" | ") + ")");
    else if (fazladan.length) hata(ad + ": gizli olması gereken çipler VAR → " + fazladan.join(", "));
    else ok("Çip seti cihaza doğru: " + beklenen.gorunur.join(", ") + "  (gizli: " + beklenen.gizli.join(", ") + ")");

    // 3) Her çipe tıkla → popup URL + pano doğrula
    for (const [chipAd, bekle] of Object.entries(beklenen.tiklama)) {
      const tiklandi = await page.evaluate((ad2) => {
        const b = [...document.querySelectorAll("#video-hazir-kutusu button")].find((x) => (x.innerText || "").includes(ad2));
        if (!b) return false;
        b.click();
        return true;
      }, chipAd).catch(() => false);
      if (!tiklandi) { hata(ad + " · " + chipAd + ": çip bulunamadı/tıklanamadı"); continue; }
      await page.waitForTimeout(350);
      const sonuc = await page.evaluate(() => ({ pop: window.__nurPopupLog, pano: window.__nurClipboard.length }));
      const sonUrl = (sonuc.pop || [])[(sonuc.pop || []).length - 1] || "";
      const urlOk = sonUrl.startsWith(bekle.url);
      const panoOk = bekle.pano ? sonuc.pano > 0 : true;
      if (urlOk && panoOk) {
        ok(chipAd + " → " + bekle.url + (bekle.pano ? "  (popup ✓, metin panoya ✓)" : "  (popup ✓)"));
      } else {
        const neden = !urlOk ? "yanlış/hedef yok: " + (sonUrl || "popup YOK") : "panoya kopyalama YOK";
        hata(ad + " · " + chipAd + ": " + neden);
      }
    }
  } catch (e) {
    hata(ad + ": akış hatası — " + (e?.message || e));
  } finally {
    await ctx.close().catch(() => undefined);
  }
}

/** Hedef URL'lerin gerçek erişimi — login/bot duvarı normal sayılır */
async function hedeflereUlas(browser) {
  console.log("\n── GERÇEK HEDEF ERİŞİMİ ──");
  for (const h of HEDEF_URLLER) {
    try {
      const r = await fetch(h.url, {
        headers: { "user-agent": CHROME_UA, "accept-language": "tr,en;q=0.8" },
        redirect: "follow",
        signal: AbortSignal.timeout(15000),
      });
      const son = r.url || h.url;
      const loginDuvari = r.status === 401 || r.status === 403 || /accounts\.google|login|signin|auth/i.test(son);
      if (r.ok) ok(h.ad + " → " + r.status + (son !== h.url ? "  (yönlendi: " + son.slice(0, 70) + ")" : ""));
      else if (loginDuvari) not(h.ad + " → " + r.status + " giriş/bot duvarı — hesap şartı, akış normal");
      else if (r.status === 400 || r.status === 403) {
        // ★ node fetch fingerprint'i bot-duvarına takılabilir (05.10 kanıtı:
        //   WhatsApp Web fetch'te 400, gerçek Chrome'da 200) → gerçek Chrome ile teyit
        const teyit = await chromeTeyit(browser, h.url);
        if (teyit.ok) not(h.ad + " → fetch " + r.status + " (bot duvarı) ama gerçek Chrome " + teyit.detay + " — akış SAĞLAM");
        else hata(h.ad + " → fetch " + r.status + " + Chrome teyidi de başarısız: " + teyit.detay);
      }
      else hata(h.ad + " → HTTP " + r.status + "  " + son.slice(0, 70));
    } catch (e) {
      // Ağ hatası (ERR_CONNECTION_RESET vb.) — Twitter ISP engeli gibi GERÇEK kırık olabilir
      hata(h.ad + " → ERİŞİLEMEDİ: " + (e?.message || e));
    }
  }
}

/** Şüpheli fetch sonucunu gerçek Chrome navigasyonuyla teyit eder */
async function chromeTeyit(browser, url) {
  const ctx = await browser.newContext({ userAgent: CHROME_UA, locale: "tr", viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  try {
    const r = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 25000 });
    await page.waitForTimeout(2000);
    const baslik = (await page.title().catch(() => "")) || "";
    const durum = r ? r.status() : 0;
    const saglikli = durum >= 200 && durum < 400 && baslik.length > 0 && !/error|hata/i.test(baslik);
    return { ok: saglikli, detay: "navigasyon " + durum + " (başlık: " + baslik.slice(0, 30) + ")" };
  } catch (e) {
    return { ok: false, detay: String(e?.message || e).split("\n")[0] };
  } finally {
    await ctx.close().catch(() => undefined);
  }
}

// ═══ ANA AKIŞ ═══
console.log("═══════════════════════════════════════════════════");
console.log(" PAYLAŞIM E2E — 5 hedef × masaüstü/mobil");
console.log(" Hedef: " + HEDEF);
console.log("═══════════════════════════════════════════════════");

try {
  const on = await fetch(HEDEF, { signal: AbortSignal.timeout(8000) });
  if (!on.ok) throw new Error("HTTP " + on.status);
} catch {
  console.error("✗ Hedefe ulaşılamadı: " + HEDEF + " → önce 'npm run dev' çalıştır.");
  process.exit(EXIT_HATA);
}

const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  await cihaziSina(browser, {
    ad: "MASAÜSTÜ (Chrome/Windows)", ua: CHROME_UA,
    viewport: { width: 1366, height: 850 }, isMobile: false, hasTouch: false, kurulum: "masaustu",
  });
  await cihaziSina(browser, {
    ad: "MOBİL (iPhone 14 benzeri)", ua: IPHONE_UA,
    viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, kurulum: "mobil",
  });
  await hedeflereUlas(browser);
} finally {
  await browser.close().catch(() => undefined);
}

console.log("\n── ÖZET ──");
if (kiriklar.length) {
  console.log("  KIRIK AKIŞ (" + kiriklar.length + "):");
  for (const k of kiriklar) console.log("    ✗ " + k);
  console.log("▶ SONUÇ: FAIL ❌");
  process.exit(EXIT_HATA);
}
console.log("  Tüm çip akışları ve hedef erişimleri geçti ✓");
console.log("▶ SONUÇ: PASS ✅");
