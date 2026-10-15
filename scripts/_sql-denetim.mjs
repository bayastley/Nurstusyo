// ════════════════════════════════════════════════════════════════
// SQL KOŞULDU MU? — supabase/*.sql dosyalarının oluşturduğu tablo/kolonları
// PostgREST ile tek tek sorgular (geçici araç, commit'lenmez).
// 200=var (koşuldu), 404=tablo yok (koşulmadı), 400=kolon yok (kısmi).
// İndeks/SQL fonksiyonları PostgREST'ten görülemez → "DOĞRULANAMAZ" işaretli.
// Kullanım: node scripts/_sql-denetim.mjs
// ════════════════════════════════════════════════════════════════
import { readFileSync, readdirSync } from "node:fs";

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

async function tabloVar(t) {
  const r = await fetch(`${env.url}/rest/v1/${t}?select=*&limit=0`, { headers: H, cache: "no-store" });
  return r.status;
}
async function kolonVar(t, k) {
  const r = await fetch(`${env.url}/rest/v1/${t}?select=${encodeURIComponent(k)}&limit=0`, { headers: H, cache: "no-store" });
  return r.status;
}

const KLASOR = "supabase";
const dosyalar = readdirSync(KLASOR).filter((f) => f.endsWith(".sql")).sort();
const ozet = [];

for (const f of dosyalar) {
  const icerik = readFileSync(`${KLASOR}/${f}`, "utf8");
  // create table (if not exists optional)
  const tablolar = [...new Set([...icerik.matchAll(/create table (?:if not exists )?(?:only )?public\.(\w+)/gi)].map((m) => m[1]))];
  // alter table public.X ... add column (if not exists) Y
  const kolonlar = [];
  for (const m of icerik.matchAll(/alter table (?:only )?public\.(\w+)([^;]*?)add column (?:if not exists )?(\w+)/gis)) {
    kolonlar.push({ tablo: m[1], kolon: m[3] });
  }
  const indeksSayi = [...icerik.matchAll(/create index (?:if not exists )?/gi)].length;
  const fonksiyonlar = [...new Set([...icerik.matchAll(/create (?:or replace )?function (?:public\.)?(\w+)/gi)].map((m) => m[1]))];
  const sadeceVeri = /\binsert into\b/i.test(icerik) && tablolar.length === 0 && kolonlar.length === 0;
  const sadeceDrop = /^\s*(drop|revoke|grant)/im.test(icerik) && tablolar.length === 0 && kolonlar.length === 0 && indeksSayi === 0 && fonksiyonlar.length === 0;

  const bulgular = [];
  for (const t of tablolar) {
    const s = await tabloVar(t);
    bulgular.push({ tur: "tablo", ad: t, durum: s });
  }
  for (const { tablo, kolon } of kolonlar) {
    const ts = await tabloVar(tablo);
    if (ts !== 200) { bulgular.push({ tur: "kolon", ad: `${tablo}.${kolon}`, durum: ts === 404 ? 404 : ts }); continue; }
    const ks = await kolonVar(tablo, kolon);
    bulgular.push({ tur: "kolon", ad: `${tablo}.${kolon}`, durum: ks === 400 ? 404 : ks });
  }

  let durum;
  if (sadeceVeri || sadeceDrop) durum = "VERİ/YETKİ";
  else if (bulgular.length === 0 && (indeksSayi > 0 || fonksiyonlar.length > 0)) durum = "DOĞRULANAMAZ";
  else if (bulgular.every((b) => b.durum === 200)) durum = bulgular.length ? "KOŞULDU" : "DOĞRULANAMAZ";
  else if (bulgular.every((b) => b.durum === 404)) durum = "KOŞULMADI";
  else durum = "KISMİ";

  ozet.push({ f, durum, bulgular, indeksSayi, fonksiyonlar });
}

console.log("── SUPABASE SQL DOSYALARI — KOŞULDU MU? ──");
for (const o of ozet) {
  const ikon = o.durum === "KOŞULDU" ? "✓" : o.durum === "KOŞULMADI" ? "✗" : o.durum === "KISMİ" ? "⚠" : "ℹ";
  console.log(`  ${ikon} ${o.durum.padEnd(12)} ${o.f}`);
  for (const b of o.bulgular) {
    console.log(`        ${b.tur} ${b.ad} → ${b.durum}`);
  }
  if (o.indeksSayi > 0) console.log(`        (${o.indeksSayi} CREATE INDEX — PostgREST'ten doğrulanamaz)`);
  if (o.fonksiyonlar.length) console.log(`        (fonksiyon: ${o.fonksiyonlar.join(", ")} — doğrulanamaz)`);
}
