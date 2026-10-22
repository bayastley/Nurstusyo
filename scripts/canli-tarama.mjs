// ════════════════════════════════════════════════════════════════
// CANLI SAĞLIK TARAMASI — her push/deploy sonrası çalıştır (kural 28.09)
// Kullanım:  node scripts/canli-tarama.mjs [site] [envYolu]
//   site:    https://www.nurstudyo.com (varsayılan) | http://localhost:5173
//   envYolu: SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY satırları olan dosya
//            (DB hata loglarını okumak için; opsiyonel)
//
// Akış:
//   1) API uçlarının HTTP durumları (beklenmeyen 5xx = alarm)
//   2) ASSET BÜTÜNLÜĞÜ — index.html → entry bundle → lazy chunk zinciri
//      (Cloudflare/Vercel bayat index.html + silinmiş chunk = 404 = kırık deploy)
//   3) DB nur_error_logs son 15 dk kayıtları
//   4) Özet GO / NO-GO   (çıkış kodu: 0 = GO, 1 = sorun var)
//
// ★ 21.10.2026 eklendi: asset bütünlük taraması. Canlıda iki kez oldu:
//   eski index.html edge'de kaldı → eski entry'nin lazy chunk'ı Vercel'de
//   silinmişti → 404 → StudioApp hiç yüklenmiyordu (beyaz ekran).
//   Bu tarama o sınıfı her push'ta yakalar.
// ════════════════════════════════════════════════════════════════
import { readFileSync } from "node:fs";

const SITE = (process.argv[2] || "https://www.nurstudyo.com").replace(/\/$/, "");
const ENV_FILE = process.argv[3] || "";
const TOLERANS_DK = 15;
const ZAMAN_ASIMI_MS = 12_000;

// Beklenen durumlar — bunlar "sorun" DEĞİL:
const BEKLENEN = {
  "/api/config": 200,
  "/api/roadmap": 200,
  "/api/zikir/topluluk": 200,
  "/api/hafta/video": 200,
  "/api/hadis/ara?q=sabir": 200,
  "/api/nur-tts/sesler": 200,
  "/api/live/kabe": 200,
  "/api/auth/me": 401,          // girişsiz istek — doğru davranış
  "/api/referans": 401,         // girişsiz istek — doğru davranış
  "/api/push/send": 401,        // CRON koruması fail-closed — doğru davranış
  "/api/zikir/arsivle": 401,    // CRON koruması fail-closed — doğru davranış
  "/api/analytics/track": 405,  // GET yasak (POST'u analitik kullanır)
  "/api/video/sign": 405,       // POST'u kullanıcı üretimi kullanır
  "/api/render/authorize": 405, // POST'la çalışır
  "/api/rewards/claim": 405,    // POST'la çalışır
};

function envOku() {
  if (!ENV_FILE) return {};
  try {
    const out = {};
    for (const satir of readFileSync(ENV_FILE, "utf8").split(/\r?\n/)) {
      const m = satir.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m) out[m[1]] = m[2].trim();
    }
    return out;
  } catch { return {}; }
}

async function get(url, ms = ZAMAN_ASIMI_MS) {
  const r = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(ms) });
  return r;
}

async function apiTara() {
  console.log("── 1) API SAĞLIK ──────────────────────────────────────");
  const sorunlar = [];
  for (const [yol, beklenen] of Object.entries(BEKLENEN)) {
    try {
      const r = await get(SITE + yol);
      const tamam = r.status === beklenen;
      console.log(`  ${tamam ? "✓" : "⚠"} ${yol} -> ${r.status} (beklenen ${beklenen})`);
      if (!tamam) sorunlar.push({ yol, durum: r.status, beklenen });
    } catch (e) {
      console.log(`  ✗ ${yol} -> BAĞLANTI HATASI: ${String(e?.message || e).slice(0, 80)}`);
      sorunlar.push({ yol, durum: "ERR", beklenen });
    }
  }
  return sorunlar;
}

/** Bundle içinden "./Xyz.js" / "./Xyz.css" referanslarını çıkarır. */
function chunkReferanslari(bundleMetni) {
  const set = new Set();
  for (const m of bundleMetni.matchAll(/["']\.\/([A-Za-z0-9_\-]+)\.(js|css)["']/g)) set.add(m[1] + "." + m[2]);
  for (const m of bundleMetni.matchAll(/["']\/assets\/([A-Za-z0-9_\-\.]+)["']/g)) set.add(m[1]);
  return [...set];
}

async function assetTara() {
  console.log("── 2) ASSET BÜTÜNLÜĞÜ (index.html → entry → lazy chunk) ──");
  const sorunlar = [];
  const bakilan = new Set();

  // 2a) index.html — hem normal hem cache-buster ile (bayat cache'i atla)
  const htmlVaryantlari = new Map();
  for (const etiket of ["normal", "cache-buster"]) {
    const url = etiket === "normal" ? SITE + "/" : `${SITE}/?cb=${Date.now()}`;
    try {
      const r = await get(url);
      const html = await r.text();
      const entryAd = (html.match(/\/assets\/[A-Za-z0-9_\-]+\.js/) || [])[0] || null;
      const cssAd = (html.match(/\/assets\/[A-Za-z0-9_\-]+\.css/) || [])[0] || null;
      const age = r.headers.get("age");
      htmlVaryantlari.set(etiket, { status: r.status, entryAd, cssAd, age });
      console.log(`  ℹ index.html (${etiket}) -> ${r.status}${age ? ` · Age=${age}s` : ""} · entry=${entryAd || "YOK"}`);
      if (r.status !== 200) sorunlar.push({ tur: "index", yol: url, durum: r.status });
    } catch (e) {
      console.log(`  ✗ index.html (${etiket}) -> BAĞLANTI HATASI: ${String(e?.message || e).slice(0, 70)}`);
      sorunlar.push({ tur: "index", yol: url, durum: "ERR" });
    }
  }

  // 2b) index.html'de doğrudan geçen asset'ler (entry + css) — hepsi 200 olmalı
  const dogrudan = new Set();
  for (const v of htmlVaryantlari.values()) {
    if (v.entryAd) dogrudan.add(v.entryAd);
    if (v.cssAd) dogrudan.add(v.cssAd);
  }
  for (const ad of dogrudan) {
    const yol = ad.startsWith("/") ? ad : "/assets/" + ad;
    try {
      const r = await get(SITE + yol);
      const ok = r.status === 200;
      console.log(`  ${ok ? "✓" : "✗"} ${yol} -> ${r.status}`);
      if (!ok) sorunlar.push({ tur: "asset", yol, durum: r.status });
    } catch (e) {
      console.log(`  ✗ ${yol} -> BAĞLANTI HATASI`);
      sorunlar.push({ tur: "asset", yol, durum: "ERR" });
    }
  }

  // 2c) entry bundle → lazy chunk zinciri (1 seviye + chunk içindeki chunk'lar)
  const entryAd = htmlVaryantlari.get("cache-buster")?.entryAd || htmlVaryantlari.get("normal")?.entryAd;
  if (!entryAd) {
    console.log("  ✗ index.html asset referansı yok — entry bulunamadı");
    sorunlar.push({ tur: "asset", yol: "index.html", durum: "NO_ENTRY" });
    return sorunlar;
  }
  const entryYol = entryAd.startsWith("/") ? entryAd : "/assets/" + entryAd;
  let entryMetni = "";
  try {
    const r = await get(SITE + entryYol);
    entryMetni = await r.text();
  } catch { /* aşağıda zaten raporlanacak */ }

  let kuyruk = chunkReferanslari(entryMetni);
  const islenen = new Set();
  let derinlik = 0;
  while (kuyruk.length && derinlik < 3) {
    const sonraki = [];
    for (const ad of kuyruk) {
      if (islenen.has(ad) || bakilan.has(ad)) continue;
      islenen.add(ad);
      bakilan.add(ad);
      const yol = "/assets/" + ad;
      try {
        const r = await get(SITE + yol);
        const ok = r.status === 200;
        console.log(`  ${ok ? "✓" : "✗"} ${yol} -> ${r.status}${ok ? "" : "  ← EKSİK CHUNK (kırık deploy!)"}`);
        if (!ok) {
          sorunlar.push({ tur: "chunk", yol, durum: r.status });
          continue;
        }
        if (ad.endsWith(".js")) {
          const ic = await r.text();
          sonraki.push(...chunkReferanslari(ic));
        }
      } catch {
        console.log(`  ✗ ${yol} -> BAĞLANTI HATASI`);
        sorunlar.push({ tur: "chunk", yol, durum: "ERR" });
      }
    }
    kuyruk = sonraki;
    derinlik++;
  }
  return sorunlar;
}

async function dbLogTara() {
  console.log("── 3) DB HATA LOGLARI (nur_error_logs, son " + TOLERANS_DK + " dk) ──");
  const env = envOku();
  const url = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
  const key = env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) { console.log("  ℹ env verilemedi — DB log taraması atlandı"); return null; }
  try {
    const kesme = new Date(Date.now() - TOLERANS_DK * 60_000).toISOString();
    const r = await fetch(`${url}/rest/v1/nur_error_logs?select=message,source,path,created_at&created_at=gte.${kesme}&order=created_at.desc&limit=20`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(20000),
    });
    if (!r.ok) { console.log(`  ⚠ log okunamadı: HTTP ${r.status}`); return null; }
    const logs = await r.json();
    if (!logs.length) { console.log(`  ✓ Son ${TOLERANS_DK} dk'da server/client hata kaydı yok — temiz`); return []; }
    console.log(`  ⚠ ${logs.length} kayıt:`);
    for (const l of logs.slice(0, 10)) {
      console.log(`    · [${l.source}] ${String(l.message).slice(0, 110)} (${l.path || ""})`);
    }
    return logs;
  } catch (e) { console.log(`  ⚠ DB erişilemedi: ${String(e?.message || e).slice(0, 80)}`); return null; }
}

const apiSorunlar = await apiTara();
const assetSorunlar = await assetTara();
const dbLoglar = await dbLogTara();

console.log("── 4) ÖZET ────────────────────────────────────────────");
const beklenmeyenApi = apiSorunlar.filter((s) => s.durum >= 500 || s.durum === "ERR");
const kritikLog = (dbLoglar || []).filter((l) => String(l.source || "").startsWith("server:"));
console.log(`  API beklenmeyen: ${beklenmeyenApi.length ? beklenmeyenApi.map((s) => `${s.yol}=${s.durum}`).join(", ") : "YOK ✓"}`);
console.log(`  Asset kırık: ${assetSorunlar.length ? assetSorunlar.map((s) => `${s.yol}=${s.durum}`).join(", ") : "YOK ✓"}`);
console.log(`  Server hata logu: ${dbLoglar === null ? "taranamadı" : kritikLog.length ? kritikLog.length + " ADET ⚠" : "YOK ✓"}`);

const temiz = !beklenmeyenApi.length && !assetSorunlar.length && (!dbLoglar || !kritikLog.length);
console.log(temiz ? "▶ SONUÇ: GO ✅" : "▶ SONUÇ: İNCELE ⚠ (yukarıdakilere bak)");
process.exit(temiz ? 0 : 1);
