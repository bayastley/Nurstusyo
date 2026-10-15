// ── Tablo yapıları + mevcut durum (READ-ONLY, geçici) ──
import { readFileSync } from "node:fs";
const yol = "C:/Users/msı/Documents/env klasörü/env2.txt";
const env = {};
for (const s of readFileSync(yol, "utf8").split(/\r?\n/)) {
  const m = s.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const url = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || "").replace(/\/+$/, "");
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const H = { apikey: key, Authorization: `Bearer ${key}` };

async function oku(path) {
  const r = await fetch(`${url}/rest/v1/${path}`, { headers: H, cache: "no-store" });
  const j = await r.json().catch(() => null);
  return { status: r.status, j };
}

console.log("── nur_site_settings (bakım bayrağı burada mı) ──");
const ss = await oku("nur_site_settings?select=*&limit=20");
console.log(`HTTP ${ss.status}:`, JSON.stringify(ss.j, null, 1).slice(0, 900));

console.log("\n── nur_announcements (şema + aktif satırlar) ──");
const an = await oku("nur_announcements?select=*&order=updated_at.desc&limit=5");
console.log(`HTTP ${an.status}:`, JSON.stringify(an.j, null, 1).slice(0, 900));

console.log("\n── nur_feature_locks (mevcut kilitler) ──");
const fl = await oku("nur_feature_locks?select=feature_id,lock_level,active&limit=20");
console.log(`HTTP ${fl.status}:`, JSON.stringify(fl.j));

console.log("\n── nur_trials (dün kurulan tablo boş mu) ──");
const tr = await oku("nur_trials?select=user_id&limit=5");
console.log(`HTTP ${tr.status}: satır sayısı=${Array.isArray(tr.j) ? tr.j.length : "?"}`);
