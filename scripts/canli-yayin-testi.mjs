// ═══════════════════════════════════════════════════════════
// CANLI YAYIN TESTİ — Admin "Gizli Özellik Yayını" uçtan uca (v3)
//
// AKIŞ: DB baseline → admin action (kilit free + duyuru) → gerçek tarayıcıda
//   baloncuk + /api/config doğrulaması → GERİ ALMA (kilit baseline + duyuru
//   deaktive) → DB/origin/CDN/DOM temizlik doğrulaması.
//
// v3 NOTLARI (2 koşunun dersleri):
//   - Baloncuk yayılımı: CDN s-maxage=45 (SWR 300) + istemci poll'u 90 sn.
//     Bekleme penceresi 180 sn, her 8 sn visibilitychange nudge'ı.
//   - ADIM 4 zengin teşhis: bar konteyner metni, buton dump'ı, konsol/pageerror
//     yakalama, sayfa içi gerçek-URL fetch gövdesi, ekran görüntüsü.
//   - ADIM 6 temizlik kontrolleri RETRY'li: config fonksiyonu DB geçici hata-
//     sında son sağlıklı gövdeyi fail-open olarak serve edebilir (tasarım
//     davranışı) — temiz sonucu 4 denemeye kadar bekler, kaç denemede temiz-
//     lendiğini raporlar.
//   - Ayrıca duyuru yayınlandıktan hemen sonra edge yayılım gecikmesi ölçülür.
//
// GÜVENLİK: kalem ayetKartlari; baseline satır yoksa service-key ile satır
//   SİLİNİR (birebir başlangıç). Duyuru yalnız kendi id'siyle kapatılır.
//
// KULLANIM: node scripts/canli-yayin-testi.mjs [URL] [ENV_DOSYASI]
// ═══════════════════════════════════════════════════════════

import fs from "fs";
import crypto from "crypto";

const HEDEF_URL = (process.argv[2] || "https://www.nurstudyo.com").replace(/\/+$/, "");
const ENV_YOL = process.argv[3] || "C:/Users/msı/Documents/env klasörü/env2.txt";
const KALEM_MODUL = "ayetKartlari";
const DUYURU_IZI = "Yeni Güncelleme Geldi!";
const CDN_TTL_SN = 50;
const BALONCUK_PENCERE_SN = 180;

let hatalar = 0;
const basari = (m) => console.log("  ✓ " + m);
const hata = (m) => { hatalar++; console.log("  ✗ " + m); };
const bilgi = (m) => console.log("  ℹ " + m);
const adim = (n, m) => console.log(`\n── ADIM ${n} ── ${m}`);
const bekle = (sn) => new Promise((r) => setTimeout(r, sn * 1000));

function envOku(yol) {
  const harita = {};
  for (const satir of fs.readFileSync(yol, "utf8").split(/\r?\n/)) {
    const i = satir.indexOf("=");
    if (i < 0) continue;
    const k = satir.slice(0, i).trim();
    if (!/^[A-Z_0-9]+$/.test(k)) continue;
    harita[k] = satir.slice(i + 1).trim();
  }
  return harita;
}
const env = envOku(ENV_YOL);
const SUPABASE_URL = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || "").replace(/\/+$/, "");
const SB_KEY = env.SUPABASE_SERVICE_ROLE_KEY || "";
const SESSION_SECRET = env.NUR_SESSION_SECRET || "";
const ADMIN_EMAILS = (env.NUR_ADMIN_EMAILS || env.VITE_NUR_ADMIN_EMAIL || "")
  .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
if (!SUPABASE_URL || !SB_KEY) { console.error("✗ SUPABASE_URL / SERVICE_ROLE_KEY yok"); process.exit(1); }
if (SESSION_SECRET.length < 20) { console.error("✗ NUR_SESSION_SECRET yok/kısa"); process.exit(1); }
if (!ADMIN_EMAILS.length) { console.error("✗ admin e-postası yok"); process.exit(1); }

async function sb(yol, opts = {}) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${yol}`, {
    method: opts.method || "GET",
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json", ...(opts.headers || {}) },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`Supabase ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return r.status === 204 ? [] : r.json();
}

function base64Url(buf) { return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, ""); }
function adminCereziUret(admin) {
  const payload = base64Url(Buffer.from(JSON.stringify(admin)));
  const imza = base64Url(crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest());
  return "nur_session=" + encodeURIComponent(payload + "." + imza);
}

async function adminAction(body, cookie) {
  const r = await fetch(`${HEDEF_URL}/api/admin/action`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const d = await r.json().catch(() => ({}));
  return { status: r.status, ok: d.ok === true, error: d.error || "" };
}

async function canliConfigTaze() {
  const r = await fetch(`${HEDEF_URL}/api/config?nurtest=${Date.now()}x${Math.floor(Math.random() * 1e9)}`, { cache: "no-store" });
  return { j: await r.json(), cache: r.headers.get("x-vercel-cache") || "?" };
}

async function canliConfigGercekUrl() {
  const r = await fetch(`${HEDEF_URL}/api/config`, { cache: "no-store" });
  return { j: await r.json(), cache: r.headers.get("x-vercel-cache") || "?", age: r.headers.get("age") || "-" };
}

async function cookieBannerKapat(page) {
  for (let i = 0; i < 20; i++) {
    const tiklandi = await page.evaluate(() => {
      const b = [...document.querySelectorAll("button")].find((x) => /Kabul Et/.test((x.innerText || "").trim()));
      if (b) { b.click(); return true; }
      return false;
    }).catch(() => false);
    if (tiklandi) return true;
    await page.waitForTimeout(250);
  }
  return false;
}

async function main() {
  console.log("═══════════════════════════════════════════════════");
  console.log(" CANLI YAYIN TESTİ v3 — Gizli Özellik Yayını (uçtan uca)");
  console.log(" Hedef: " + HEDEF_URL + " · Kalem: " + KALEM_MODUL);
  console.log("═══════════════════════════════════════════════════");

  let cookie = "";
  let duyuruId = "";

  // ADIM 1 — baseline
  adim(1, "DB baseline");
  const baselineSatir = (await sb(`nur_feature_locks?feature_id=eq.${KALEM_MODUL}&select=lock_level,active`))[0] || null;
  const baselineVardi = !!baselineSatir && baselineSatir.active !== false;
  const aktifDuyurular = await sb("nur_announcements?active=eq.true&select=id,title");
  basari(`baseline kilit: ${baselineVardi ? baselineSatir.lock_level : "(satır yok → v2 varsayılan)"} · aktif duyuru: ${aktifDuyurular.length}`);

  // ADIM 2 — admin kimliği
  adim(2, "admin kimliği (DB is_admin + ENV whitelist)");
  let admin = null;
  for (const email of ADMIN_EMAILS) {
    const satir = ((await sb(`nur_users?email=eq.${encodeURIComponent(email)}&select=id,email,is_admin`).catch(() => [])) || [])[0];
    if (satir?.is_admin === true) { admin = { id: satir.id, email: satir.email }; break; }
  }
  if (!admin) { hata("DB'de is_admin=true admin yok"); process.exit(1); }
  basari(`admin: ${admin.email}`);
  cookie = adminCereziUret({ id: admin.id, email: admin.email, name: admin.email.split("@")[0], verified: true, isAdmin: true, exp: Math.floor(Date.now() / 1000) + 900 });

  // ADIM 3 — YAYIN
  adim(3, "YAYIN: set_feature_lock(free) + publish_announcement");
  const kilitSonuc = await adminAction({ action: "set_feature_lock", featureId: KALEM_MODUL, lockLevel: "free" }, cookie);
  if (!kilitSonuc.ok) { hata(`set_feature_lock: HTTP ${kilitSonuc.status} ${kilitSonuc.error}`); process.exit(1); }
  basari("set_feature_lock ok → free (HTTP " + kilitSonuc.status + ")");
  const kilitDb = (await sb(`nur_feature_locks?feature_id=eq.${KALEM_MODUL}&select=lock_level`))[0];
  if (kilitDb?.lock_level !== "free") { hata("DB teyit başarısız"); process.exit(1); }
  basari("DB teyit: lock_level=free");

  const duyuru = {
    title: "🎉 " + DUYURU_IZI,
    message: "Ayet & Dua Kütüphanesi artık herkese açık! Güncellemeyi al ve hemen keşfet.",
    detail: "Canlı yayın testi duyurusu — test bitince otomatik kalkar.",
    kind: "update", active: true, blinking: true, forceOpen: false, requireAck: false,
    startsAt: new Date().toISOString(),
    endsAt: new Date(Date.now() + 3600000).toISOString(),
  };
  const duyuruSonuc = await adminAction({ action: "publish_announcement", announcement: duyuru }, cookie);
  if (!duyuruSonuc.ok) { hata(`publish_announcement: HTTP ${duyuruSonuc.status} ${duyuruSonuc.error}`); process.exit(1); }
  basari("publish_announcement ok (HTTP " + duyuruSonuc.status + ")");
  const bizimDuyuru = ((await sb(`nur_announcements?active=eq.true&created_by=eq.${encodeURIComponent(admin.email)}&order=created_at.desc&limit=5&select=id,title`)) || [])
    .find((d) => String(d.title).includes(DUYURU_IZI));
  if (!bizimDuyuru) { hata("DB'de duyuru yok"); process.exit(1); }
  duyuruId = bizimDuyuru.id;
  basari(`DB'de duyuru: ${duyuruId.slice(0, 8)}…`);

  // ADIM 3b — edge yayılım ölçümü (bilgi amaçlı): gerçek URL ne zaman duyuruyu verir?
  adim("3b", "edge yayılım ölçümü (gerçek URL, 12 deneme × 10 sn)");
  const t3b = Date.now();
  let edgeGecikmeSn = -1;
  for (let i = 0; i < 12; i++) {
    await bekle(10);
    const { j, cache, age } = await canliConfigGercekUrl();
    const geldi = !!(j?.announcement && String(j.announcement.title || "").includes(DUYURU_IZI));
    bilgi(`t+${Math.round((Date.now() - t3b) / 1000)} sn · cache=${cache} · age=${age} · duyuru=${geldi ? "VAR" : "yok"}`);
    if (geldi) { edgeGecikmeSn = Math.round((Date.now() - t3b) / 1000); basari(`duyuru gerçek URL'de ${edgeGecikmeSn} sn'de göründü`); break; }
  }
  if (edgeGecikmeSn < 0) bilgi("duyuru 120 sn'de gerçek URL'ye düşmedi (SWR penceresi uzayabilir) — tarayıcı yine de deneyecek");

  // ADIM 4 — gerçek tarayıcı (ziyaretçi)
  adim(4, `GERÇEK TARAYICI: baloncuk (≤${BALONCUK_PENCERE_SN} sn, nudge'lı) + teşhis`);
  const { chromium } = await import("playwright-core");
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  let baloncukMetni = "";
  const konsolHatalari = [];
  try {
    const page = await browser.newPage();
    page.on("pageerror", (h) => konsolHatalari.push("pageerror: " + (h?.message || h)));
    page.on("console", (m) => { if (m.type() === "error") konsolHatalari.push("console: " + m.text()); });

    await page.goto(HEDEF_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
    if (await cookieBannerKapat(page)) basari("çerez banner'ı kapatıldı");
    await page.waitForTimeout(2500);

    // Teşhis dökümü 1
    const tani = await page.evaluate(async (izi) => {
      const bar = document.querySelector("div.relative.z-50");
      const butonlar = [...document.querySelectorAll("button")].slice(0, 15).map((b) => (b.innerText || "").replace(/\n/g, " ").slice(0, 40)).filter(Boolean);
      let fetchGovde = null;
      try { const r = await fetch("/api/config", { cache: "default" }); fetchGovde = await r.json(); } catch (e) { fetchGovde = { hata: String(e) }; }
      return {
        barVarmi: !!bar,
        barText: bar ? (bar.innerText || "").slice(0, 120) : null,
        butonSayisi: document.querySelectorAll("button").length,
        butonlar,
        iziVar: [...document.querySelectorAll("button")].some((b) => (b.innerText || "").includes(izi)),
        configDuyuru: fetchGovde?.announcement ? String(fetchGovde.announcement.title).slice(0, 60) : null,
        configKilit: (fetchGovde?.featureLocks || []).find((l) => l.feature_id === "ayetKartlari") || null,
      };
    }, DUYURU_IZI).catch((e) => ({ taniHata: String(e) }));
    console.log("  [teşhis] bar=" + tani.barVarmi + " · buton=" + tani.butonSayisi + " · configDuyuru=" + JSON.stringify(tani.configDuyuru) + " · configKilit=" + JSON.stringify(tani.configKilit));
    if (tani.butonlar?.length) console.log("  [teşhis] butonlar: " + tani.butonlar.join(" | ").slice(0, 300));
    if (tani.barText) console.log("  [teşhis] bar metni: " + JSON.stringify(tani.barText.slice(0, 100)));

    const taze = await canliConfigTaze();
    bilgi(`node-tarafı taze origin: cache=${taze.cache} · duyuru=${taze.j?.announcement ? "VAR" : "yok"} · kilit=${JSON.stringify((taze.j?.featureLocks || []).find((l) => l.feature_id === KALEM_MODUL) || null)}`);

    // Baloncuk bekleme döngüsü
    if (tani.iziVar) { baloncukMetni = "ilk yüklemede geldi"; basari("baloncuk ilk yüklemede DOM'da ✓"); }
    else {
      const t0 = Date.now();
      while (Date.now() - t0 < BALONCUK_PENCERE_SN * 1000) {
        await bekle(8);
        await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange"))).catch(() => {});
        const geldi = await page.evaluate((izi) => {
          const b = [...document.querySelectorAll("button")].find((x) => (x.innerText || "").includes(izi));
          return b ? b.innerText.slice(0, 90) : null;
        }, DUYURU_IZI).catch(() => null);
        if (geldi) { baloncukMetni = String(geldi); basari('baloncuk DOM\'da: "' + baloncukMetni.replace(/\n/g, " ") + '"'); break; }
        const gecen = Math.floor((Date.now() - t0) / 1000);
        if (gecen % 45 < 8) console.log(`  … bekliyor (${gecen} sn)`);
      }
      if (!baloncukMetni) {
        hata(`baloncuk ${BALONCUK_PENCERE_SN} sn içinde gelmedi`);
        await page.screenshot({ path: "scripts/_yayin-testi-goruntusu.png" }).catch(() => {});
        const tani2 = await page.evaluate(async () => {
          let g = null; try { const r = await fetch("/api/config", { cache: "no-store" }); g = await r.json(); } catch (e) { g = { hata: String(e) }; }
          return { duyuru: g?.announcement ? String(g.announcement.title).slice(0, 60) : null, butonlar: [...document.querySelectorAll("button")].slice(0, 12).map((b) => (b.innerText || "").slice(0, 36)) };
        }).catch(() => ({}));
        console.log("  [teşhis2] sayfa içi no-store fetch duyuru=" + JSON.stringify(tani2.duyuru) + " · butonlar=" + (tani2.butonlar || []).join(" | ").slice(0, 240));
      }
    }
    if (konsolHatalari.length) console.log("  [teşhis] sayfa konsol hataları (" + konsolHatalari.length + "): " + konsolHatalari.slice(0, 4).join(" · ").slice(0, 300));
  } finally {
    await browser.close().catch(() => {});
  }

  // ADIM 5 — GERİ ALMA
  adim(5, "GERİ ALMA: kilit → baseline · delete_announcement");
  if (baselineVardi) {
    const geriKilit = await adminAction({ action: "set_feature_lock", featureId: KALEM_MODUL, lockLevel: baselineSatir.lock_level }, cookie);
    if (!geriKilit.ok) hata(`geri alma kilit: HTTP ${geriKilit.status}`); else basari(`kilit baseline (${baselineSatir.lock_level})`);
  } else {
    try { await sb(`nur_feature_locks?feature_id=eq.${KALEM_MODUL}`, { method: "DELETE" }); basari("kilit satırı SİLİNDİ (baseline: satır yok)"); }
    catch (e) { hata("satır silinemedi: " + (e?.message || e)); }
  }
  const geriDuyuru = await adminAction({ action: "delete_announcement", announcementId: duyuruId }, cookie);
  if (!geriDuyuru.ok) hata(`geri alma duyuru: HTTP ${geriDuyuru.status}`); else basari("duyuru deaktive (active=false)");

  // ADIM 6 — temizlik doğrulaması (retry'li)
  adim(6, "temizlik doğrulaması (DB + origin/CDN retry'li + DOM)");
  const temizKilitDb = (await sb(`nur_feature_locks?feature_id=eq.${KALEM_MODUL}&select=lock_level,active`))[0] || null;
  const temizDuyuruDb = (await sb(`nur_announcements?id=eq.${duyuruId}&select=active`))[0];
  if (baselineVardi) {
    if (temizKilitDb?.lock_level === baselineSatir.lock_level && temizKilitDb?.active !== false) basari(`DB: kilit baseline (${baselineSatir.lock_level})`);
    else hata("DB kilidi baseline'da değil: " + JSON.stringify(temizKilitDb));
  } else {
    if (!temizKilitDb) basari("DB: kilit satırı yok (birebir baseline)"); else hata("kilit satırı duruyor: " + JSON.stringify(temizKilitDb));
  }
  if (temizDuyuruDb?.active === false) basari("DB: test duyurusu inactive"); else hata("test duyurusu DB'de hâlâ aktif");

  let temizlendimi = false, deneme = 0;
  while (deneme < 4 && !temizlendimi) {
    deneme++;
    if (deneme > 1) { console.log(`  … temizlik beklemesi (${deneme - 1}/3): ${CDN_TTL_SN} sn (CDN TTL + snapshot yenilenmesi)`); await bekle(CDN_TTL_SN); }
    const { j, cache } = await canliConfigTaze();
    const kirliDuyuru = !!(j?.announcement && String(j.announcement.title || "").includes(DUYURU_IZI));
    const kil = (j?.featureLocks || []).find((l) => l.feature_id === KALEM_MODUL);
    const kirliKilit = !baselineVardi ? !!kil : (!kil || kil.lock_level !== baselineSatir.lock_level);
    bilgi(`deneme ${deneme}: cache=${cache} · duyuru=${kirliDuyuru ? "HÂLÂ VAR" : "temiz"} · kilit=${JSON.stringify(kil || null)}`);
    if (!kirliDuyuru && !kirliKilit) temizlendimi = true;
  }
  if (temizlendimi) basari(`origin (taze) temizlendi (${deneme}. denemede)`);
  else hata("origin 4 denemede de temizlenemedi");

  const { j: cdnJ, cache: cdnCache, age: cdnAge } = await canliConfigGercekUrl();
  const cdnDuyuru = !!(cdnJ?.announcement && String(cdnJ.announcement.title || "").includes(DUYURU_IZI));
  if (!cdnDuyuru) basari(`gerçek URL temiz (cache=${cdnCache}, age=${cdnAge})`);
  else hata(`gerçek URL hâlâ duyuru dağıtıyor (cache=${cdnCache}, age=${cdnAge}) — SWR penceresi; birkaç dk içinde düşer`);

  {
    const browser2 = await chromium.launch({ channel: "chrome", headless: true });
    try {
      const page2 = await browser2.newPage();
      await page2.goto(HEDEF_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
      await cookieBannerKapat(page2);
      await page2.waitForTimeout(2500);
      const kaldi = await page2.evaluate((izi) => [...document.querySelectorAll("button")].some((b) => (b.innerText || "").includes(izi)), DUYURU_IZI);
      if (!kaldi) basari("DOM: baloncuk temiz yüklemede yok ✓"); else hata("DOM: baloncuk hâlâ görünüyor");
    } finally { await browser2.close().catch(() => {}); }
  }

  console.log("\n── ÖZET ──");
  console.log(`  YAYIN    : kilit free ✓/✗ · duyuru DB+origin ✓/✗ · edge gecikmesi: ${edgeGecikmeSn >= 0 ? edgeGecikmeSn + " sn" : ">120 sn (SWR)"} · baloncuk ${baloncukMetni ? "GÖRÜLDÜ" : "GÖRÜLMEDİ"}`);
  console.log(`  GERİ ALMA: DB baseline ✓/✗ · duyuru kapandı ✓/✗ · origin temiz ✓/✗ · DOM temiz ✓/✗`);
  if (hatalar === 0) { console.log("▶ SONUÇ: PASS ✅ — yayın canlıda çalışıyor, geri alma temiz"); process.exit(0); }
  console.log(`▶ SONUÇ: FAIL ❌ — ${hatalar} bulgu`);
  process.exit(1);
}

main().catch((e) => { console.error("✗ çöktü: " + (e?.message || e)); process.exit(1); });
