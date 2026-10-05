// ═══════════════════════════════════════════════════════════
// RLS MIGRATION DOĞRULAMASI — supabase/rls-sertlestirme-lansman-sonrasi.sql
//
// SQL canlıya dokunmadan, repo tarafında STATİK denetim:
//   A. idempotensi: her CREATE POLICY'nin DROP POLICY IF EXISTS karşılığı var
//   B. parite: grant edilen 5 tablonun politikası dosyada ya da bilinçli dışta (site_settings)
//   C. kapsam: repodaki TÜM nur_* DDL tabloları Bölüm 1 hedef listesinde
//   D. yazım: hedef listesindeki her ad gerçek bir repo DDL tablosu (typo yakala)
//   E. joker ağ: like 'nur%' + rowsecurity=false bloğu mevcut (canlı-dakik güvenlik ağı)
//   F. DO blok dengesi: do $$ sayısı = end $$; sayısı
//   G. disiplin: anon/authenticated'a verilen tek ayrıcalık SELECT (yazma yok)
//   H. geri alma: GERİ ALMA bölümü var; "disable row level security" YALNIZ orada
//   I. doğrulama sorguları: 4.1-4.4 işaretleri mevcut
//
// KULLANIM: node scripts/rls-sql-dogrula.mjs
// ═══════════════════════════════════════════════════════════

import fs from "fs";
import path from "path";

const SQL_DOSYA = "supabase/rls-sertlestirme-lansman-sonrasi.sql";
const SUPA_DIR = "supabase";

let hatalar = 0;
const basari = (m) => console.log("  ✓ " + m);
const hata = (m) => { hatalar++; console.log("  ✗ " + m); };
const bilgi = (m) => console.log("  ℹ " + m);

const sql = fs.readFileSync(SQL_DOSYA, "utf8");

// ── Repodaki tablo envanteri: tüm create table public.nur_* ──
const repoTablolari = new Set();
for (const f of fs.readdirSync(SUPA_DIR)) {
  if (!f.endsWith(".sql")) continue;
  const icerik = fs.readFileSync(path.join(SUPA_DIR, f), "utf8");
  for (const m of icerik.matchAll(/create table if not exists public\.(nur_[a-z_]+)/g)) repoTablolari.add(m[1]);
}

// ── Hedef listesi (Bölüm 1'deki SQL array'i) ──
const hedefEslesme = sql.match(/hedefler text\[\] := array\[([\s\S]*?)\];/);
if (!hedefEslesme) { console.error("✗ hedefler array'i SQL'de bulunamadı"); process.exit(1); }
const hedefler = [...hedefEslesme[1].matchAll(/'([a-z_]+)'/g)].map((m) => m[1]);

console.log("═══════════════════════════════════════════════════");
console.log(` RLS SQL STATİK DENETİM — ${SQL_DOSYA}`);
console.log(` repo DDL tablo: ${repoTablolari.size} · hedef liste: ${hedefler.length}`);
console.log("═══════════════════════════════════════════════════");

// A) idempotensi
for (const m of sql.matchAll(/create policy ([a-z_]+) on public\.([a-z_]+)/g)) {
  const [, politika, tablo] = m;
  const onceDrop = sql.includes(`drop policy if exists ${politika} on public.${tablo}`);
  if (onceDrop) basari(`A. idempotent: ${politika} (drop if exists var)`);
  else hata(`A. ${politika} için drop policy if exists YOK`);
}

// B) grant ↔ politika paritesi
const grantTablolari = [...sql.matchAll(/grant select on public\.(nur_[a-z_]+)\s+to anon/g)].map((m) => m[1]);
const disPolitikali = new Set(["nur_site_settings"]); // site_settings.sql'de zaten var — dosyada bilinçli yok
for (const t of grantTablolari) {
  const politikali = new RegExp(`create policy [a-z_]+ on public\\.${t}\\b`).test(sql) || disPolitikali.has(t);
  if (politikali) basari(`B. ${t}: grant + politika ${disPolitikali.has(t) && !new RegExp(`create policy [a-z_]+ on public\\.${t}\\b`).test(sql) ? "(mevcut dosya dışından — bilinçli)" : "pariteli"}`);
  else hata(`B. ${t}: grant var ama politika yok`);
}
if (grantTablolari.length !== 5) hata(`B. beklenen 5 grant, bulunan ${grantTablolari.length}`);

// C) kapsam: repo DDL tablolarının tamamı hedefte
const hedefKume = new Set(hedefler);
const eksik = [...repoTablolari].filter((t) => !hedefKume.has(t));
if (eksik.length === 0) basari(`C. repo DDL tablolarının tamamı hedef listede (${repoTablolari.size}/${repoTablolari.size})`);
else hata("C. hedef listede eksik tablo: " + eksik.join(", "));

// D) hedef yazım denetimi
const hayali = hedefler.filter((t) => !repoTablolari.has(t));
if (hayali.length === 0) basari("D. hedef listesinde hayali tablo yok");
else hata("D. hedef listede repo DDL'i olmayan ad (typo?): " + hayali.join(", "));

// E) joker güvenlik ağı
if (/tablename like 'nur%' and rowsecurity = false/.test(sql) && /JOKER/.test(sql)) basari("E. joker blok mevcut (repo DDL'i olmayan canlı tablolar da kapanır)");
else hata("E. joker blok bulunamadı");

// F) DO blok dengesi
const doSayi = (sql.match(/do \$\$/g) || []).length;
const endSayi = (sql.match(/end \$\$;/g) || []).length;
if (doSayi === endSayi && doSayi > 0) basari(`F. DO blok dengeli (${doSayi}/${endSayi})`);
else hata(`F. DO blok dengesiz: do $$ = ${doSayi}, end $$; = ${endSayi}`);

// G) ayrıcalık disiplini: anon'a select dışında grant yok
const kotuGrant = [...sql.matchAll(/grant (?!select)[a-z, ]+ on [^;]+ to [^;]*(?:anon|authenticated)[^;]*;/g)];
if (kotuGrant.length === 0) basari("G. anon/authenticated'a yalnız SELECT grant var (yazma kapalı)");
else hata("G. anon/authenticated'a select-dışı grant: " + kotuGrant.map((m) => m[0].slice(0, 60)).join(" | "));

// H) geri alma bölümü + disable yalnız orada
const geriAlmaIdx = sql.indexOf("-- GERİ ALMA");
const disableKonumlari = [...sql.matchAll(/disable row level security/g)].map((m) => m.index);
if (geriAlmaIdx > 0 && disableKonumlari.every((i) => i > geriAlmaIdx)) basari("H. GERİ ALMA bölümü var; disable row level security yalnız yorum/rollback içinde");
else hata("H. geri alma/disiplin sorunu (disable ana gövdede mi?)");

// I) doğrulama sorguları
const dogrulamaIsaretleri = ["rls_siz_kalan", "table_privileges", "routine_privileges", "duyuru_mevcut"];
const eksikIsaret = dogrulamaIsaretleri.filter((i) => !sql.includes(i));
if (eksikIsaret.length === 0) basari("I. doğrulama sorguları (4.1-4.4) mevcut");
else hata("I. doğrulama sorgusu eksik: " + eksikIsaret.join(", "));

// bilgi: api'de kullanılıp repo DDL'i olmayan canlı tablolar (joker kapsar)
const apiTablolari = new Set();
for (const f of fs.readdirSync("api")) {
  const gez = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const tam = path.join(d, e.name);
      if (e.isDirectory()) gez(tam);
      else if (e.name.endsWith(".ts")) for (const m of fs.readFileSync(tam, "utf8").matchAll(/nur_[a-z_]+/g)) apiTablolari.add(m[0]);
    }
  };
  gez("api");
}
const canliBilinmeyen = [...apiTablolari].filter((t) => !repoTablolari.has(t) && t.startsWith("nur_") && !t.includes("reward") && !t.startsWith("nur_session"));
if (canliBilinmeyen.length) bilgi("repo DDL'i olmayan canlı tablo adayları (joker kapsar): " + canliBilinmeyen.join(", "));

console.log("\n── ÖZET ──");
if (hatalar === 0) {
  console.log("▶ SONUÇ: PASS ✅ — SQL idempotent, kapsamlı, ayrıcalık disiplini sağlam");
  process.exit(0);
}
console.log(`▶ SONUÇ: FAIL ❌ — ${hatalar} bulgu`);
process.exit(1);
