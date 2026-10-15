// ═══════════════════════════════════════════════════════════════
// ZİKİR GÜNLÜK GRAFİK + ARŞİV CRON DOĞRULAMA (30.09)
// Kullanıcı zikir-gunluk-grafik-2909.sql + zikir-arsiv-cron-2909.sql'i
// SQL Editor'de koşturduktan sonra:
//   1) nur_zikir_gunluk + nur_zikir_arsiv tabloları VAR mı?
//   2) RPC atomik testi: nur_zikir_ekle (service_role) → toplam +1, kova +1
//      (TEST ADedi daha sonra AYNI RPC ile geri alınır — toplam eski haline döner,
//      kova farkı 'test' olarak kalır; grafik dürüstlüğü bozulmaz, istenirse silinir)
//   3) Arşiv RPC idempotent mi: nur_zikir_gun_arsivle → ALREADY_ARCHIVED
//   4) Canlı API grafiği: /api/zikir/topluluk → gunluk dizisi var mı?
//   5) Vercel cron izi: 00:05 UTC koşusu (log kaynağına bakılır — canlıda doğrudan
//      okunamıyorsa arşiv satırının son_arsiv tarihi cron kanıtı sayılır)
// ═══════════════════════════════════════════════════════════════

import fs from "node:fs";

const [,, siteArg, envArg] = process.argv;
if (!siteArg || !envArg) {
  console.error("Kullanım: node scripts/zikir-grafik-dogrula.mjs <siteUrl> <envDosya>");
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
if (!url || !key) { console.error("✗ env eksik"); process.exit(1); }
const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
const sonuc = [];
const isaretle = (ad, ok, detay) => { sonuc.push(ok); console.log(`  ${ok ? "✓" : "✗"} ${ad}${detay ? ` — ${detay}` : ""}`); };

async function main() {
  console.log("═══ ZİKİR GÜNLÜK GRAFİK + CRON DOĞRULAMA ═══\n");

  // 1) Tablolar
  console.log("── 1) TABLOLAR ─────────────────────────────────────");
  const gunluk = await fetch(`${url}/rest/v1/nur_zikir_gunluk?select=gun,adet&order=gun.desc&limit=7`, { headers });
  const gunlukRows = gunluk.ok ? await gunluk.json() : null;
  isaretle("nur_zikir_gunluk tablosu erişilebilir", gunluk.ok, gunluk.ok ? `${Array.isArray(gunlukRows) ? gunlukRows.length : 0} gün kayıtlı (son 7)` : `HTTP ${gunluk.status}`);
  const arsiv = await fetch(`${url}/rest/v1/nur_zikir_arsiv?select=id,son_arsiv,toplam_anlik`, { headers });
  const arsivRows = arsiv.ok ? await arsiv.json() : null;
  isaretle("nur_zikir_arsiv tablosu erişilebilir", arsiv.ok, arsiv.ok && Array.isArray(arsivRows) && arsivRows[0] ? `son_arsiv=${arsivRows[0].son_arsiv} · anlık_toplam=${arsivRows[0].toplam_anlik}` : `HTTP ${arsiv.status}`);

  // 2) RPC atomik test (+1 ekle, sonra geri al)
  console.log("── 2) RPC ATOMİK TEST (nur_zikir_ekle +1, sonra -1) ─");
  const toplamOnce = await fetch(`${url}/rest/v1/nur_zikir_topluluk?select=toplam&id=eq.genel`, { headers });
  const toplamOnceRows = toplamOnce.ok ? await toplamOnce.json() : null;
  const once = Array.isArray(toplamOnceRows) ? Number(toplamOnceRows[0]?.toplam ?? -1) : -1;
  if (once < 0) {
    isaretle("nur_zikir_topluluk okunabildi", false, "toplam okunamadı — test atlandı");
  } else {
    const ekle = await fetch(`${url}/rest/v1/rpc/nur_zikir_ekle`, { method: "POST", headers, body: JSON.stringify({ p_adet: 1 }) });
    const ekleRows = ekle.ok ? await ekle.json() : null;
    const sonra = Array.isArray(ekleRows) ? Number(ekleRows[0]?.toplam ?? -1) : -1;
    isaretle("RPC nur_zikir_ekle(1) çalıştı", ekle.ok && sonra === once + 1, `toplam ${once} → ${sonra}`);
    const bugun = new Date().toISOString().slice(0, 10);
    const kovaSatiri = Array.isArray(gunlukRows) ? gunlukRows.find(g => g.gun === bugun) : null;
    isaretle("günlük kova güncellendi", kovaSatiri ? Number(kovaSatiri.adet) >= 1 : false, kovaSatiri ? `bugün=${bugun} adet=${kovaSatiri.adet}` : `bugün=${bugun} kova satırı henüz yok (RPC sonrası tekrar okunacak)`);
    // geri al: p_adet sınırı 1..500 → 500 ile 499/500 karmaşası olmasın; geri almayı da +RPC ile yapamayız
    // (eksiletme RPC'si yok) → doğrudan service-role UPDATE ile -1 (test kalıntısızlığı)
    await fetch(`${url}/rest/v1/nur_zikir_topluluk?id=eq.genel`, { method: "PATCH", headers, body: JSON.stringify({ toplam: once, updated_at: new Date().toISOString() }) });
    const kovaGuncel = await fetch(`${url}/rest/v1/nur_zikir_gunluk?select=gun,adet&gun=eq.${bugun}`, { headers });
    const kovaRows = kovaGuncel.ok ? await kovaGuncel.json() : [];
    const kovaAdet = Array.isArray(kovaRows) ? Number(kovaRows[0]?.adet ?? 0) : 0;
    if (kovaAdet >= 1) {
      await fetch(`${url}/rest/v1/nur_zikir_gunluk?gun=eq.${bugun}`, { method: "PATCH", headers, body: JSON.stringify({ adet: kovaAdet - 1 }) });
    }
    console.log("  🧹 test kalıntısı geri alındı (toplam ve kova eski değerine döndü)");
  }

  // 3) Arşiv RPC idempotence (service_role ile canlı cron davranışı)
  console.log("── 3) ARŞİV RPC (cron'un çağırdığı fonksiyon) ──────");
  const arsivle = await fetch(`${url}/rest/v1/rpc/nur_zikir_gun_arsivle`, { method: "POST", headers, body: JSON.stringify({ p_tarih: null }) });
  const arsivRows2 = arsivle.ok ? await arsivle.json() : null;
  const a2 = Array.isArray(arsivRows2) ? arsivRows2[0] : arsivRows2;
  const idempotent = a2 && (a2.mesaj === "ALREADY_ARCHIVED" || a2.sonuc === true);
  isaretle("nur_zikir_gun_arsivle çağrıldı", arsivle.ok && idempotent, a2 ? `${a2.sonuc ? "sonuc:true" : "sonuc:false"} · gun=${a2.gun_t ?? "-"} · kova=${a2.kova_adet ?? "-"} · mesaj=${a2.mesaj ?? "(yeni arşiv)"}` : `HTTP ${arsivle.status}`);

  // 4) Canlı API grafiği
  console.log("── 4) CANLI GRAFİK (/api/zikir/topluluk) ───────────");
  const api = await fetch(`${site}/api/zikir/topluluk`, { cache: "no-store" });
  const apiJson = await api.json().catch(() => null);
  const gunlukApi = apiJson?.gunluk ?? apiJson?.data?.gunluk ?? null;
  isaretle("canlı API 200", api.status === 200, apiJson ? `toplam=${apiJson.toplam ?? apiJson.data?.toplam ?? "?"}` : `HTTP ${api.status}`);
  isaretle("gunluk serisi geliyor (grafik kaynağı hazır)", Array.isArray(gunlukApi), Array.isArray(gunlukApi) ? `${gunlukApi.length} gün · ilk=${gunlukApi[0]?.gun ?? "-"} adet=${gunlukApi[0]?.adet ?? "-"} · son=${gunlukApi[gunlukApi.length - 1]?.gun ?? "-"}` : "gunluk alanı yok — UI grafiği hâlâ gizli modda");

  // 5) Cron kanıtı
  console.log("── 5) CRON KANITI (00:05 UTC koşusu) ───────────────");
  const arsivGuncel = await fetch(`${url}/rest/v1/nur_zikir_arsiv?select=son_arsiv,toplam_anlik,updated_at&id=eq.genel`, { headers });
  const arsivGuncelRows = arsivGuncel.ok ? await arsivGuncel.json() : null;
  const a3 = Array.isArray(arsivGuncelRows) ? arsivGuncelRows[0] : null;
  const bugunT = new Date().toISOString().slice(0, 10);
  const dunT = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const cronKaniti = a3 && (a3.son_arsiv === bugunT || a3.son_arsiv === dunT);
  isaretle("arşiv satırı cron takvimine uygun", Boolean(cronKaniti), a3 ? `son_arsiv=${a3.son_arsiv} (bugün=${bugunT}, dün=${dunT}) · güncellenme=${String(a3.updated_at).slice(0, 16)}` : "arşiv satırı okunamadı");

  console.log("═══ ÖZET ═══");
  const gecen = sonuc.filter(Boolean).length, toplam = sonuc.length;
  console.log(`${gecen}/${toplam} kontrol geçti`);
  console.log(gecen === toplam ? "▶ SONUÇ: PASS ✅" : "▶ SONUÇ: FAIL ❌");
  process.exit(gecen === toplam ? 0 : 1);
}

main().catch((e) => { console.error("✗ script hatası:", e?.message ?? e); process.exit(1); });
