// ═══════════════════════════════════════════════════════════════
// ADMIN AUDIT DOĞRULAMA (30.09)
// admin-audit-metadata-3009.sql koştuktan sonra:
//   1) metadata kolonu var mı? (select=metadata → 200 mü?)
//   2) /api/admin/session'a yetkisiz GET → 403 + DB'ye admin_session_deny düştü mü?
// Kullanım: node scripts/admin-audit-dogrula.mjs <siteUrl> <envDosya>
// Denetim tablosu RLS kapalı → service role ile okuma (canli-tarama.mjs deseni).
// ═══════════════════════════════════════════════════════════════

import fs from "node:fs";

const [,, siteArg, envArg] = process.argv;
if (!siteArg || !envArg) {
  console.error("Kullanım: node scripts/admin-audit-dogrula.mjs <siteUrl> <envDosya>");
  process.exit(1);
}
const site = siteArg.replace(/\/+$/, "");

const envText = fs.readFileSync(envArg, "utf8");
const env = {};
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+?)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const url = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || "").replace(/\/+$/, "");
const key = env.SUPABASE_SERVICE_ROLE_KEY || "";
if (!url || !key) {
  console.error("✗ env dosyasında SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY yok");
  process.exit(1);
}
const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
const uyut = (ms) => new Promise((r) => setTimeout(r, ms));

async function denyKayitlari() {
  const r = await fetch(
    `${url}/rest/v1/nur_admin_audit_logs?select=id,action,created_at,metadata&action=eq.admin_session_deny&order=created_at.desc&limit=5`,
    { headers: { ...headers, Prefer: "count=exact" } },
  );
  const rows = await r.json().catch(() => []);
  const range = r.headers.get("content-range") || "";
  const toplam = range.includes("/") && !range.endsWith("/*") ? Number(range.split("/")[1]) : (Array.isArray(rows) ? rows.length : 0);
  return { toplam, rows: Array.isArray(rows) ? rows : [] };
}

async function main() {
  console.log("── 1) METADATA KOLONU KONTROLÜ ────────────────────────");
  const colRes = await fetch(`${url}/rest/v1/nur_admin_audit_logs?select=metadata&limit=1`, { headers });
  if (colRes.ok) {
    console.log("  ✓ metadata kolonu VAR (select=metadata → 200)");
  } else {
    const err = await colRes.json().catch(() => null);
    console.log(`  ✗ metadata kolonu YOK → ${JSON.stringify(err?.message ?? err)}`);
    console.log("▶ SONUÇ: FAIL ❌ — önce koştur: supabase/admin-audit-metadata-3009.sql");
    process.exit(1);
  }

  console.log("── 2) ÖNCEKİ admin_session_deny SAYISI ────────────────");
  const once = await denyKayitlari();
  console.log(`  ℹ mevcut deny kaydı: ${once.toplam}`);

  console.log("── 3) YETKİSİZ DENEME TETİKLENİYOR ────────────────────");
  const r403 = await fetch(`${site}/api/admin/session`, { headers: { "user-agent": "nur-audit-dogrula/1.0" } });
  console.log(`  ${r403.status === 403 ? "✓" : "✗"} GET /api/admin/session → ${r403.status} (beklenen 403)`);
  if (r403.status !== 403) {
    console.log("▶ SONUÇ: FAIL ❌ — kapı 403 döndü, deny kaydı yazılmaz");
    process.exit(1);
  }

  console.log("── 4) DB'YE DÜŞTÜ MÜ? (3 sn bekleme) ──────────────────");
  await uyut(3000);
  const sonra = await denyKayitlari();
  const artti = sonra.toplam > once.toplam;
  console.log(`  ${artti ? "✓" : "✗"} admin_session_deny: ${once.toplam} → ${sonra.toplam}`);
  const son = sonra.rows[0];
  if (son) {
    const meta = (son.metadata && typeof son.metadata === "object") ? son.metadata : {};
    const metaDolu = meta.ip !== undefined || meta.userAgent !== undefined;
    console.log(`  ${metaDolu ? "✓" : "⚠"} son kayıt metadata → ip: ${JSON.stringify(meta.ip ?? null)} · ua: ${String(meta.userAgent ?? "").slice(0, 40) || "yok"}`);
    console.log(`  ℹ son kayıt zamanı: ${son.created_at}`);
  }
  console.log("▶ SONUÇ: " + (artti && (son ? (son.metadata?.ip !== undefined || son.metadata?.userAgent !== undefined) : true) ? "PASS ✅ — deny kaydı metadata ile DB'ye düştü" : "FAIL ❌ — kayıt düşmedi"));
  process.exit(artti ? 0 : 1);
}

main().catch((e) => { console.error("✗ script hatası:", e?.message ?? e); process.exit(1); });
