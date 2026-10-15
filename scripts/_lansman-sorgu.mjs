// ════════════════════════════════════════════════════════════════
// LANSMAN ÖNCESİ DB TABLO DOĞRULAMASI (geçici, commit'lenmez)
// PostgREST üzerinden tablo varlığını kontrol eder (sadece durum kodları).
// Kullanım: node scripts/_lansman-sorgu.mjs
// ════════════════════════════════════════════════════════════════
import { readFileSync } from "node:fs";

const ENV_YOLLAR = [
  "C:/Users/msı/Documents/env klasörü/env2.txt",
  "C:/Users/msı/Desktop/env klasörü/env2.txt",
];
function envOku() {
  for (const yol of ENV_YOLLAR) {
    try {
      const out = {};
      for (const satir of readFileSync(yol, "utf8").split(/\r?\n/)) {
        const m = satir.match(/^([A-Z0-9_]+)=(.*)$/);
        if (m) out[m[1]] = m[2].trim();
      }
      const url = (out.SUPABASE_URL || out.VITE_SUPABASE_URL || "").replace(/\/+$/, "");
      const key = out.SUPABASE_SERVICE_ROLE_KEY || "";
      if (url && key) return { url, key };
    } catch { /* sıradaki */ }
  }
  return null;
}
const env = envOku();
if (!env) { console.error("✗ env bulunamadı"); process.exit(1); }
const H = { apikey: env.key, Authorization: `Bearer ${env.key}` };

// 1) Tablo varlık kontrolü — 200=var, 404=yok
const tablolar = ["nur_trials", "nur_users", "nur_page_views", "nur_error_logs", "nur_feature_locks", "nur_site_settings", "nur_subscriptions"];
console.log("── TABLO VARLIKLARI (200=var, 404=yok) ──");
for (const t of tablolar) {
  try {
    const r = await fetch(`${env.url}/rest/v1/${t}?select=*&limit=0`, { headers: H, cache: "no-store" });
    console.log(`  ${r.status === 200 ? "✓" : "✗"} ${t} → ${r.status}`);
  } catch (e) { console.log(`  ✗ ${t} → HATA: ${String(e.message || e).slice(0, 60)}`); }
}

// 2) Lansman indeks sinyali: nur_page_views BRIN index — PostgREST indeks göremez,
//    ama açık proxy varsa pg uyumlu bir rpc denemeye değmez; yerine sayım hızı sinyali.
const t0 = Date.now();
const r2 = await fetch(`${env.url}/rest/v1/nur_page_views?select=created_at&order=created_at.desc&limit=1`, { headers: H, cache: "no-store" });
await r2.json().catch(() => null);
console.log(`\nnur_page_views son-satır sorgusu: ${Date.now() - t0} ms (HTTP ${r2.status}) — <300ms beklenir`);
console.log("(bitmedi: indeks listesi PostgREST'ten görülemez — SQL Editor kontrolü gerekli)");
