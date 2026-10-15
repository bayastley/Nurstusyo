// ════════════════════════════════════════════════════════════════
// GERÇEK GİRİŞ SAYIMI — tahmin yok, Supabase auth'tan oku (geçici araç,
// commit'lenmez). Kullanım: node scripts/_giris-sayimi.mjs
// Çıktı YALNIZCA sayılar: e-posta/ID ASLA yazdırılmaz.
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
      if (url && key) { console.log(`✓ env okundu`); return { url, key }; }
    } catch { /* sıradaki */ }
  }
  return null;
}

const env = envOku();
if (!env) { console.error("✗ env bulunamadı"); process.exit(1); }

// Supabase Admin API — gerçek auth kullanıcıları (provider + son giriş dahil)
let tumu = [];
for (let sayfa = 1; sayfa <= 20; sayfa++) {
  const r = await fetch(`${env.url}/auth/v1/admin/users?page=${sayfa}&per_page=200`, {
    headers: { apikey: env.key, Authorization: `Bearer ${env.key}` }, cache: "no-store",
  });
  if (!r.ok) { console.error(`✗ auth/v1/admin/users HTTP ${r.status}`); process.exit(1); }
  const j = await r.json();
  const liste = Array.isArray(j.users) ? j.users : (Array.isArray(j) ? j : []);
  tumu.push(...liste);
  if (liste.length < 200) break;
}

const saglayiciSayim = {};
const sonGirisli = tumu.filter((u) => u.last_sign_in_at);
for (const u of tumu) {
  const p = u.app_metadata?.provider || (Array.isArray(u.app_metadata?.providers) ? u.app_metadata.providers[0] : "?") || (u.email ? "email?" : "?");
  saglayiciSayim[p] = (saglayiciSayim[p] || 0) + 1;
}
const gmailUzantili = tumu.filter((u) => typeof u.email === "string" && u.email.toLowerCase().endsWith("@gmail.com")).length;

// nur_users (profil tablosu) — GERÇEK giriş kaynağı (Google OAuth buraya yazar).
// E-postalar YAZDIRILMAZ, yalnızca alan-adı dağılımı sayılır.
let nurUsers = -1;
let alanAdlari = {};
try {
  const PAGE = 1000;
  let kullanicilar = [];
  for (let offset = 0; offset <= 50_000; offset += PAGE) {
    const r2 = await fetch(`${env.url}/rest/v1/nur_users?select=email,created_at&limit=${PAGE}&offset=${offset}`, {
      headers: { apikey: env.key, Authorization: `Bearer ${env.key}` }, cache: "no-store",
    });
    if (!r2.ok) throw new Error(`HTTP ${r2.status}`);
    const arr = await r2.json();
    kullanicilar.push(...arr);
    if (arr.length < PAGE) break;
  }
  nurUsers = kullanicilar.length;
  for (const u of kullanicilar) {
    const ad = String(u.email || "").split("@")[1]?.toLowerCase() || "(yok)";
    alanAdlari[ad] = (alanAdlari[ad] || 0) + 1;
  }
} catch (e) { console.error(`⚠ nur_users okunamadı: ${String(e.message || e).slice(0, 80)}`); }

console.log(`\n── GERÇEK AUTH KULLANICILARI (Supabase auth) ──`);
console.log(`  Toplam hesap: ${tumu.length}`);
console.log(`  Sağlayıcı dağılımı: ${JSON.stringify(saglayiciSayim)}`);
console.log(`  @gmail.com e-postalı: ${gmailUzantili}`);
console.log(`  En az 1 kez giriş yapmış (last_sign_in_at dolu): ${sonGirisli.length}`);
console.log(`  Hiç giriş yapmamış: ${tumu.length - sonGirisli.length}`);
console.log(`  nur_users profil kaydı: ${nurUsers}`);
if (nurUsers > 0) {
  console.log(`  nur_users e-posta alan-adı dağılımı: ${JSON.stringify(alanAdlari)}`);
  const googleToplam = Object.entries(alanAdlari).filter(([d]) => d === "gmail.com" || d.endsWith("googlemail.com")).reduce((s, [, n]) => s + n, 0);
  console.log(`  Gerçek @gmail.com girişi: ${googleToplam}`);
}
console.log("\n(bitti — e-posta/ID yazdırılmadı)");
