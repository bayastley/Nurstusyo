// ════════════════════════════════════════════════════════════════
// CANLI SAĞLIK TARAMASI — her push sonrası çalıştır (kural 28.09)
// Kullanım:  node scripts/canli-tarama.mjs [site] [envYolu]
//   site:    https://www.nurstudyo.com (varsayılan) | http://localhost:5173
//   envYolu: env2.txt gibi SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY satırları
//            olan dosya (DB hata loglarını okumak için; opsiyonel)
// Akış: 1) API uçlarının HTTP durumları  2) beklenmedik durumlar varsa uyarı
//       3) DB nur_error_logs son 15 dk kayıtları  4) özet GO/NO-GO
// ════════════════════════════════════════════════════════════════
import { readFileSync } from "node:fs";

const SITE = (process.argv[2] || "https://www.nurstudyo.com").replace(/\/$/, "");
const ENV_FILE = process.argv[3] || "";
const TOLERANS_DK = 15;

// Beklenen durumlar — bunlar "sorun" DEĞİL:
const BEKLENEN = {
  "/api/config": 200,
  "/api/roadmap": 200,
  "/api/zikir/topluluk": 200,
  "/api/hafta/video": 200,
  "/api/hadis/ara?q=sabir": 200,
  "/api/push/subscribe": 200,
  "/api/auth/me": 401,          // girişsiz istek — doğru davranış
  "/api/referans": 401,         // girişsiz istek — doğru davranış
  "/api/push/send": 401,        // CRON koruması fail-closed — doğru davranış
  "/api/zikir/arsivle": 401,    // CRON koruması fail-closed — doğru davranış
  "/api/analytics/track": 405,  // GET yasak (POST'u cron/analytics kullanır)
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

async function apiTara() {
  console.log("── 1) API SAĞLIK ──────────────────────────────────────");
  const sorunlar = [];
  for (const [yol, beklenen] of Object.entries(BEKLENEN)) {
    try {
      const r = await fetch(SITE + yol, { redirect: "manual", signal: AbortSignal.timeout(20000) });
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

async function dbLogTara() {
  console.log("── 2) DB HATA LOGLARI (nur_error_logs, son " + TOLERANS_DK + " dk) ──");
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
    if (!logs.length) { console.log("  ✓ Son " + TOLERANS_DK + " dk'da server/client hata kaydı yok — temiz"); return []; }
    console.log(`  ⚠ ${logs.length} kayıt:`);
    for (const l of logs.slice(0, 10)) {
      console.log(`    · [${l.source}] ${String(l.message).slice(0, 110)} (${l.path || ""})`);
    }
    return logs;
  } catch (e) { console.log(`  ⚠ DB erişilemedi: ${String(e?.message || e).slice(0, 80)}`); return null; }
}

const apiSorunlar = await apiTara();
const dbLoglar = await dbLogTara();

console.log("── 3) ÖZET ────────────────────────────────────────────");
const beklenmeyenApi = apiSorunlar.filter((s) => s.durum >= 500 || s.durum === "ERR");
const kritikLog = (dbLoglar || []).filter((l) => String(l.source || "").startsWith("server:"));
console.log(`  API beklenmeyen: ${beklenmeyenApi.length ? beklenmeyenApi.map((s) => `${s.yol}=${s.durum}`).join(", ") : "YOK ✓"}`);
console.log(`  Server hata logu: ${dbLoglar === null ? "taranamadı" : kritikLog.length ? kritikLog.length + " ADET ⚠" : "YOK ✓"}`);
const temiz = !beklenmeyenApi.length && (!dbLoglar || !kritikLog.length);
console.log(temiz ? "▶ SONUÇ: GO ✅" : "▶ SONUÇ: İNCELE ⚠ (yukarıdakilere bak)");
process.exit(0);
