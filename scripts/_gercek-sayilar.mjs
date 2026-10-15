// ════════════════════════════════════════════════════════════════
// GERÇEK SAYILAR — tahmin yok, DB'den oku (geçici araç, commit'lenmez)
// Kullanım: node scripts/_gercek-sayilar.mjs [envYolu]
//   envYolu: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY satırlı dosya
// Çıktı: kayıtlı üye sayısı, sayfa görüntüleme, benzersiz ziyaretçi-günü,
//        dil dağılımı (görüntüleme + benzersiz), son 7/30 gün kesiti.
//        ANAHTARLAR ASLA YAZDIRILMAZ.
// ════════════════════════════════════════════════════════════════
import { readFileSync } from "node:fs";

const ENV_YOLLAR = [
  process.argv[2] || "",
  "C:/Users/msı/Documents/env klasörü/env2.txt",
  "C:/Users/msı/Desktop/env klasörü/env2.txt",
].filter(Boolean);

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
      if (url && key) { console.log(`✓ env okundu: ${yol}`); return { url, key }; }
    } catch { /* sıradaki yolu dene */ }
  }
  return null;
}

const env = envOku();
if (!env) { console.error("✗ env dosyası/anahtarları bulunamadı"); process.exit(1); }
const HEADERS = { apikey: env.key, Authorization: `Bearer ${env.key}` };

async function sayToplam(tablo) {
  const r = await fetch(`${env.url}/rest/v1/${tablo}?select=id`, {
    headers: { ...HEADERS, Prefer: "count=exact", Range: "0-0" }, cache: "no-store",
  });
  const cr = r.headers.get("content-range") || "";
  const toplam = Number(cr.split("/")[1] || 0);
  if (!r.ok && !toplam) throw new Error(`${tablo}: HTTP ${r.status}`);
  return toplam;
}

async function tumSatirlar(tablo, kolonlar) {
  const out = [];
  const PAGE = 1000;
  for (let offset = 0; offset <= 500_000; offset += PAGE) {
    const r = await fetch(`${env.url}/rest/v1/${tablo}?select=${kolonlar}&limit=${PAGE}&offset=${offset}`, { headers: HEADERS, cache: "no-store" });
    if (!r.ok) throw new Error(`${tablo}: HTTP ${r.status}`);
    const arr = await r.json();
    out.push(...arr);
    if (arr.length < PAGE) break;
  }
  return out;
}

function dilNormalle(l) {
  const s = String(l || "").trim().toLowerCase().slice(0, 2);
  return ["tr", "en", "ar", "id", "ur"].includes(s) ? s : (s ? "diğer" : "(boş)");
}

function yazilEmi(ms) { return new Date(ms).toISOString().slice(0, 10); }

// ── 1) Kayıtlı üye ──────────────────────────────────────────────
const uyeler = await sayToplam("nur_users");
console.log(`\n── KAYITLI ÜYE (nur_users) ──`);
console.log(`  Toplam kayıt: ${uyeler}  (Sadık Üye kontenjanı: ${Math.max(0, 100 - uyeler)}/100 kalan → ${Math.min(uyeler, 100)} dolmuş)`);

// ── 2) Sayfa görüntüleme + dil dağılımı ─────────────────────────
let satirlar = [];
try { satirlar = await tumSatirlar("nur_page_views", "lang,visitor_hash,created_at"); }
catch (e) { console.error(`✗ nur_page_views okunamadı: ${String(e.message || e)}`); }

console.log(`\n── ZİYARETÇİ (nur_page_views) ──`);
if (!satirlar.length) {
  console.log("  Kayıt yok veya tablo boş.");
} else {
  const zamanlar = satirlar.map((s) => Date.parse(s.created_at)).filter((n) => Number.isFinite(n));
  const ilkGun = zamanlar.length ? yazilEmi(Math.min(...zamanlar)) : "?";
  const sonGun = zamanlar.length ? yazilEmi(Math.max(...zamanlar)) : "?";
  const simdi = Date.now();
  const son7 = new Set(), son30 = new Set();
  const dilGoruntuleme = {}, dilBenzersiz = {};
  for (const s of satirlar) {
    const dil = dilNormalle(s.lang);
    dilGoruntuleme[dil] = (dilGoruntuleme[dil] || 0) + 1;
    (dilBenzersiz[dil] ||= new Set()).add(s.visitor_hash);
    const t = Date.parse(s.created_at);
    if (Number.isFinite(t)) {
      if (t >= simdi - 7 * 86400_000) son7.add(s.visitor_hash);
      if (t >= simdi - 30 * 86400_000) son30.add(s.visitor_hash);
    }
  }
  const sirali = Object.entries(dilGoruntuleme).sort((a, b) => b[1] - a[1]);
  const toplamGoruntuleme = satirlar.length;
  const toplamBenzersiz = new Set(satirlar.map((s) => s.visitor_hash)).size;

  console.log(`  Toplam sayfa görüntüleme: ${toplamGoruntuleme}`);
  console.log(`  Benzersiz ziyaretçi-gün (hash): ${toplamBenzersiz}`);
  console.log(`  Son 7 gün benzersiz: ${son7.size} | Son 30 gün benzersiz: ${son30.size}`);
  console.log(`  Veri aralığı: ${ilkGun} → ${sonGun}`);
  console.log(`\n  DİL DAĞILIMI (görüntüleme | benzersiz ziyaretçi-gün | % görüntüleme):`);
  for (const [dil, adet] of sirali) {
    const ben = dilBenzersiz[dil].size;
    const yuzde = ((adet / toplamGoruntuleme) * 100).toFixed(1);
    console.log(`    ${dil.padEnd(6)} ${String(adet).padStart(6)} | ${String(ben).padStart(5)} | %${yuzde}`);
  }
}
console.log("\n(bitti — anahtarlar yazdırılmadı)");
