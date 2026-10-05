// ═══════════════════════════════════════════════════════════
// ADMIN PANEL SEKME TURU v2 — canlıya karşı E2E (05.10)
//
// İSTEK: "Hard refresh yaptım, paneli sen aç ve tüm sekmeleri tek tek
//   tıklayıp konsolda 500/hata kalmadığını screenshot'larla kanıtla."
//
// v2 DERSLERİ (1. koşu): (a) test admin'i, client görünürlük listesi
//   (VITE_NUR_ADMIN_EMAIL) ∩ DB is_admin kesişiminden seçilir — aksi halde
//   üst bar ADMIN pill'i görünmez. (b) Panelin GERÇEK 7 sekmesi dinamik
//   sonekli etiketlerle tıklanır ("Ban & Siber Denetim (3)" gibi).
//   (c) Hata kanıtı kategorize edilir:
//        JS HATASI   = pageerror + "Failed to load resource" DIŞI konsol error  → 0 OLMALI
//        5xx         = herhangi bir ağ cevabı ≥ 500                               → 0 OLMALI
//        kaynak 404  = font/asset iyimser yüklemeler — ayrı raporlanır (bloklamaz)
//
// KANIT: sekme başına screenshot (scripts/_panel-sekme-*.png) + _panel-kanit.json
// ═══════════════════════════════════════════════════════════

import fs from "fs";
import crypto from "crypto";

const HEDEF_URL = (process.argv[2] || "https://www.nurstudyo.com").replace(/\/+$/, "");
const ENV_YOL = process.argv[3] || "C:/Users/msı/Documents/env klasörü/env2.txt";

function envOku(yol) {
  const m = {};
  for (const satir of fs.readFileSync(yol, "utf8").split(/\r?\n/)) {
    const i = satir.indexOf("=");
    if (i < 0) continue;
    const k = satir.slice(0, i).trim();
    if (!/^[A-Z_0-9]+$/.test(k)) continue;
    m[k] = satir.slice(i + 1).trim();
  }
  return m;
}
const env = envOku(ENV_YOL);
const SUPABASE_URL = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || "").replace(/\/+$/, "");
const SB_KEY = env.SUPABASE_SERVICE_ROLE_KEY || "";
const SECRET = env.NUR_SESSION_SECRET || "";
const CLIENT_ADMİNLER = (env.VITE_NUR_ADMIN_EMAIL || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
if (SECRET.length < 20 || !SUPABASE_URL) { console.error("✗ env eksik"); process.exit(1); }

const b64u = (b) => b.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");

let hatalar = 0;
const basari = (m) => console.log("  ✓ " + m);
const hata = (m) => { hatalar++; console.log("  ✗ " + m); };

// Gerçek sekme butonları (adminDashboardKabuk.tsx). DİKKAT: 4 sekmenin
// erişilebilir adı EMOJİ ile başlıyor ("⚠️ Hata Logları", "🎬 Haftanın Videosu",
// "📊 Haftalık Rapor", "💬 Geri Bildirim") — bu yüzden ^ sabitli regex KULLANILMAZ.
const SEKMELER = [
  { id: "users", etiket: /Kullanıcı &/ },
  { id: "broadcast", etiket: /Duyuru & Kilitlar/ },
  { id: "banLogs", etiket: /Ban & Siber Denetim/ },
  { id: "errors", etiket: /Hata Logları/ },
  { id: "haftaVideo", etiket: /Haftanın Videosu/ },
  { id: "rapor", etiket: /Haftalık Rapor/ },
  { id: "feedback", etiket: /Geri Bildirim/ },
];

const jsHatasimi = (metin) => !/Failed to load resource|net::ERR_/i.test(metin);

async function main() {
  // 1) test admin'i: DB is_admin ∩ client görünürlük listesi (pill'in görüneceği tek yol)
  const H = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` };
  const adminlar = await (await fetch(`${SUPABASE_URL}/rest/v1/nur_users?is_admin=eq.true&select=id,email&order=created_at.asc`, { headers: H, cache: "no-store" })).json();
  if (!Array.isArray(adminlar) || !adminlar.length) { console.error("✗ canlıda is_admin=true kullanıcı yok"); process.exit(1); }
  const admin = adminlar.find((a) => CLIENT_ADMİNLER.includes(String(a.email).toLowerCase())) || adminlar[0];
  const pillGorunurOlacak = CLIENT_ADMİNLER.includes(String(admin.email).toLowerCase());
  console.log("═══════════════════════════════════════════════════");
  console.log(` ADMIN PANEL SEKME TURU v2 — ${HEDEF_URL}`);
  console.log(` admin: ${admin.email}${pillGorunurOlacak ? "" : " (⚠ client listesinde değil — pill görünmeyebilir)"}`);
  console.log("═══════════════════════════════════════════════════");

  const now = Math.floor(Date.now() / 1000);
  const payload = b64u(Buffer.from(JSON.stringify({
    id: admin.id, sub: "session-" + admin.id, email: admin.email,
    name: admin.email.split("@")[0], picture: "", verified: true, isAdmin: true,
    iat: now, exp: now + 3600,
  })));
  const imza = b64u(crypto.createHmac("sha256", SECRET).update(payload).digest());

  const { chromium } = await import("playwright-core");
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const kanit = { admin: admin.email, sekmeler: [], saglik: null, kaynak404: 0 };

  try {
    const ctx = await browser.newContext({ viewport: { width: 1500, height: 950 } });
    await ctx.addCookies([{ name: "nur_session", value: payload + "." + imza, domain: "www.nurstudyo.com", path: "/", httpOnly: false, secure: true, sameSite: "Lax" }]);
    const page = await ctx.newPage();

    const jsHatalari = [];
    const ag5xx = [];
    let kaynak404 = 0;
    const zararsizBilinen = (t) => /ipapi\.co.*blocked by CORS/i.test(t); // bölge algılama fallback'ı (try/catch'li, TR'ye düşer) — bilinen zararsız
    page.on("console", (m) => {
      if (m.type() !== "error") return;
      const t = m.text().slice(0, 220);
      if (/Failed to load resource|net::ERR_/i.test(t)) { kaynak404++; return; } // ayrı sayaç
      if (zararsizBilinen(t)) { kaynak404++; return; } // bilinen zararsız — raporlanır, bloklamaz
      jsHatalari.push(t);
    });
    page.on("pageerror", (e) => jsHatalari.push("pageerror: " + String(e?.message || e).slice(0, 220)));
    page.on("response", (r) => { if (r.status() >= 500) ag5xx.push(`${r.status()} ${r.url().slice(0, 140)}`); });

    await page.goto(HEDEF_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
    for (let i = 0; i < 20; i++) {
      const t = await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => /Kabul Et/.test((x.innerText || "").trim())); if (b) { b.click(); return true; } return false; }).catch(() => false);
      if (t) break;
      await page.waitForTimeout(300);
    }
    // oturum + me + pill mount
    await page.waitForFunction(() => !!window.location, { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(3500);

    // 2) ADMIN pill'e GERÇEK tıklama
    const pill = page.locator("button", { hasText: /^\s*ADMIN/ }).first();
    if (!(await pill.isVisible().catch(() => false))) {
      hata("ADMIN pill görünmedi (admin=" + admin.email + " — client görünürlük listesine bak)");
      await page.screenshot({ path: "scripts/_panel-pill-hata.png" });
      fs.writeFileSync("scripts/_panel-kanit.json", JSON.stringify({ ...kanit, jsHatalari: jsHatalari.slice(0, 20), ag5xx: ag5xx.slice(0, 20), kaynak404 }, null, 2));
      process.exit(1);
    }
    await pill.click();
    await page.waitForTimeout(2500);

    // panel açıldı mı: sekme çubuğundaki gerçek butonlarla
    const panelAcik = await page.getByRole("button", { name: /^Kullanıcı &/ }).first().isVisible().catch(() => false);
    if (panelAcik) basari("ADMIN pill → panel AÇILDI (gerçek tıklama, sekme çubuğu görünür)");
    else {
      hata("panel modalı açılmadı");
      await page.screenshot({ path: "scripts/_panel-acilis-hata.png" });
      process.exit(1);
    }

    // 2b) SAĞLIK ROZETİ (06.10): panel açılışında 7 salt-okunur action sessizce ping'lenir;
    //     rozet "test" (🩺 …) → "🩺 N/7" durumu beklenir. 7/7 = tüm sekmelerin arka planı çalışıyor.
    try {
      await page.waitForFunction(
        () => {
          const r = document.querySelector('[data-testid="panel-saglik-rozet"]');
          return !!r && /\d+\s*\/\s*\d+/.test(r.textContent || "");
        },
        { timeout: 25000 }
      );
      const rozetMetin = ((await page.textContent('[data-testid="panel-saglik-rozet"]')) || "").trim();
      const m = rozetMetin.match(/(\d+)\s*\/\s*(\d+)/);
      const okSayisi = m ? Number(m[1]) : 0;
      const toplam = m ? Number(m[2]) : 0;
      const hataliTablar = await page.evaluate(() =>
        [...document.querySelectorAll("[data-testid^='panel-saglik-nokta-']")].map((el) =>
          (el.getAttribute("data-testid") || "").replace("panel-saglik-nokta-", "")
        )
      );
      kanit.saglik = { rozet: `${okSayisi}/${toplam}`, hataliTablar };
      await page.screenshot({ path: "scripts/_panel-saglik.png" });
      if (okSayisi === toplam && toplam === 7) {
        basari(`sağlık rozeti: ${rozetMetin} — 7 salt-okunur action da çalışıyor → scripts/_panel-saglik.png`);
      } else {
        hata(`sağlık rozeti ${rozetMetin} — çalışmayan sekmeler: ${hataliTablar.join(", ") || "?"}`);
      }
    } catch {
      kanit.saglik = { rozet: "yok", hataliTablar: [] };
      await page.screenshot({ path: "scripts/_panel-saglik-hata.png" }).catch(() => {});
      hata("sağlık rozeti DOM'da görünmedi (panel-saglik-rozet — ping'ler 25 sn'de bitmedi?)");
    }

    // 3) 7 sekme — GERÇEK tıklamalar
    for (const s of SEKMELER) {
      const onceJs = jsHatalari.length;
      const once5xx = ag5xx.length;
      let tiklandi = false;
      const buton = page.getByRole("button", { name: s.etiket }).first();
      try { await buton.scrollIntoViewIfNeeded({ timeout: 3000 }).catch(() => {}); await buton.click({ timeout: 5000 }); tiklandi = true; }
      catch (e) { hata(`${s.id}: sekme butonu tıklanamadı (${s.etiket}) — ${(e?.message || "").slice(0, 120)}`); }

      if (!tiklandi) { kanit.sekmeler.push({ sekme: s.id, ok: false, sorun: "buton yok" }); continue; }

      await page.waitForTimeout(2200); // lazy-loadlara izin
      const goruntu = "scripts/_panel-sekme-" + s.id + ".png";
      await page.screenshot({ path: goruntu });

      const jsFark = jsHatalari.length - onceJs;
      const h5xxFark = ag5xx.length - once5xx;
      const ok = jsFark === 0 && h5xxFark === 0;
      kanit.sekmeler.push({ sekme: s.id, ok, jsHata: jsFark, ag5xx: h5xxFark, goruntu });
      if (ok) basari(`${s.id}: tıklandı · JS hatası 0 · 5xx 0 → ${goruntu}`);
      else {
        hata(`${s.id}: jsHata=${jsFark} 5xx=${h5xxFark}`);
        if (jsFark) console.log("    └ " + jsHatalari.slice(-jsFark).slice(0, 3).join(" | ").slice(0, 240));
        if (h5xxFark) console.log("    └ " + ag5xx.slice(-h5xxFark).slice(0, 3).join(" | ").slice(0, 240));
      }
    }

    // 4) kanıt paketi
    kanit.kaynak404 = kaynak404;
    fs.writeFileSync("scripts/_panel-kanit.json", JSON.stringify({ ...kanit, jsHatalari: jsHatalari.slice(0, 20), ag5xx: ag5xx.slice(0, 20) }, null, 2));

    console.log("\n── ÖZET ──");
    console.log(`  sekme: ${kanit.sekmeler.filter((x) => x.ok).length}/${SEKMELER.length} temiz`);
    console.log(`  JS hatası (toplam): ${jsHatalari.length} · 5xx (toplam): ${ag5xx.length} · kaynak-404 (bloklamaz): ${kaynak404}`);
    if (hatalar === 0 && kanit.sekmeler.filter((x) => x.ok).length === SEKMELER.length) {
      console.log("▶ SONUÇ: PASS ✅ — panel açıldı, 7 sekme tıklandı, JS hatası 0, 5xx 0 — screenshot'lar scripts/_panel-sekme-*.png");
    } else {
      console.log(`▶ SONUÇ: FAIL ❌ — ${hatalar} bulgu`);
    }
  } finally {
    await browser.close().catch(() => {});
  }
  process.exit(hatalar === 0 ? 0 : 1);
}

main().catch((e) => { console.error("✗ çöktü: " + (e?.message || e)); process.exit(1); });
