#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════
// ROADMAP OY SİMÜLASYONU — KALICI SAĞLIK TESTİ
//
// NE YAPAR: Canlı /api/roadmap uçtan uca doğrular:
//   1) GET  → özellik listesi + oy sayaçları geliyor mu
//   2) POST oturumsuz → 401 (kilit gerçekten var mı)
//   3) POST test-cookie ile oy → ok:true
//   4) GET  → sayaç +1 ve myVote=test özelliği
//   5) POST aynı oy (toggle) → removed:true (kendi oyunu siler)
//   6) GET  → sayaç geri eski değerde (SIFRA İZ)
//
// TEMİZLİK GARANTİSİ: test kullanıcısı "test-saglik-<zaman>" id'li,
// toggle ile oyu silinir; ayrıca başta/sonda eski test kalıntıları
// (user_id like test-saglik-*) servis anahtarıyla temizlenir.
// DB'de sıfır kalıcı etki — gerçek kullanıcılara dokunulmaz.
//
// KULLANIM:
//   npm run test:roadmap
//   node scripts/roadmap-saglik-testi.mjs https://nurstudyo.com
// ÇIKIŞ: adım tablosu + özet; herhangi biri başarısızsa exit 1.
// ═══════════════════════════════════════════════════════════

import fs from "fs";
import crypto from "crypto";

const ENV_YOLLAR = [
  "C:/Users/msı/Desktop/env klasörü/env2.txt",
  "C:/Users/msı/Documents/env klasörü/env2.txt",
  "./env2.txt",
  "./.env.local",
];

function envOku() {
  for (const yol of ENV_YOLLAR) {
    try {
      const icerik = fs.readFileSync(yol, "utf8");
      const al = (k) => {
        const m = icerik.match(new RegExp("^\\s*" + k + "\\s*=\\s*(.+)$", "m"));
        return m ? m[1].trim().replace(/^["']|["']$/g, "") : "";
      };
      const secret = al("NUR_SESSION_SECRET");
      const url = al("VITE_SUPABASE_URL") || al("SUPABASE_URL");
      const key = al("SUPABASE_SERVICE_ROLE_KEY");
      if (secret && url && key) return { secret, url: url.replace(/\/+$/, ""), key, kaynak: yol };
    } catch { /* sıradaki */ }
  }
  return null;
}

// ★ api/roadmap.ts getSession ile BİREBİR aynı imza: HMAC-SHA256(payload) → base64 → base64url
function cookieUret(secret, id, email) {
  const payload = Buffer.from(JSON.stringify({ id, email, exp: Math.floor(Date.now() / 1000) + 120 })).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  return `nur_session=${payload}.${sig}`;
}

const BASE = (process.argv[2] || "https://www.nurstudyo.com").replace(/\/+$/, "");
const env = envOku();
if (!env) {
  console.error("✗ env bulunamadı (NUR_SESSION_SECRET + SUPABASE gerekli):", ENV_YOLLAR.join(" | "));
  process.exit(1);
}

const TEST_ID = `test-saglik-${Date.now()}`;
const COOKIE = cookieUret(env.secret, TEST_ID, "saglik-testi@nurstudyo.test");
const adimlar = [];

async function istek(yol, init = {}, cookie) {
  const res = await fetch(`${BASE}${yol}`, {
    ...init,
    headers: {
      Origin: BASE,
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
      ...(init.headers || {}),
    },
    signal: AbortSignal.timeout(15000),
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* html dönebilir */ }
  return { status: res.status, json };
}

function adim(ad, ok, detay) {
  adimlar.push({ ad, ok, detay });
  console.log(`${ok ? "✓" : "✗"} ${ad}${detay ? ` — ${detay}` : ""}`);
}

console.log(`\n🗳️  ROADMAP SAĞLIK TESTİ → ${BASE}`);
console.log(`   test kullanıcısı: ${TEST_ID} (sonunda silinir)\n`);

try {
  // ── 0) Eski test kalıntılarını temizle (kadim koşulardan kalan varsa)
  const sil0 = await fetch(`${env.url}/rest/v1/nur_roadmap_votes?user_id=like.test-saglik-*`, {
    method: "DELETE",
    headers: { apikey: env.key, Authorization: `Bearer ${env.key}`, Prefer: "return=representation" },
  }).catch(() => null);
  adim("0) Eski test kalıntısı temizliği", sil0 ? sil0.ok : false, sil0 ? `HTTP ${sil0.status}` : "bağlantı yok");

  // ── 1) GET: liste geliyor mu
  const g1 = await istek(`/api/roadmap?t=${Date.now()}`);
  const v2 = Array.isArray(g1.json?.v2) ? g1.json.v2 : [];
  const v3 = Array.isArray(g1.json?.v3) ? g1.json.v3 : [];
  adim("1) GET /api/roadmap", g1.status === 200 && v2.length + v3.length > 0, `HTTP ${g1.status} · V2:${v2.length} V3:${v3.length} · toplam oy ${g1.json?.totalVotes ?? "?"}`);

  const hedef = v2.find((f) => f.active) || v3.find((f) => f.active);
  if (!hedef) {
    adim("1a) Aktif özellik", false, "oy verilebilecek aktif özellik yok — test durduruldu");
    throw new Error("aktif-ozellik-yok");
  }

  // ── 2) Oturumsuz POST → 401
  const anonim = await istek("/api/roadmap", { method: "POST", body: JSON.stringify({ featureId: hedef.id }) });
  adim("2) Oturumsuz oy reddi", anonim.status === 401, `HTTP ${anonim.status} (beklenen 401)`);

  // ── 3) Cookie ile oy ver
  const oncekiSayac = hedef.votes ?? 0;
  const p1 = await istek("/api/roadmap", { method: "POST", body: JSON.stringify({ featureId: hedef.id }) }, COOKIE);
  adim("3) Test oyu verildi", p1.status === 200 && p1.json?.ok === true, `HTTP ${p1.status} · ${hedef.ad || hedef.id} (önceki sayaç ${oncekiSayac})`);

  // ── 4) Sayaç arttı mı + myVote (oturumlu GET — myVote yalnız cookie ile döner)
  const g2 = await istek(`/api/roadmap?t=${Date.now()}`, {}, COOKIE);
  const hedef2 = [...(g2.json?.v2 ?? []), ...(g2.json?.v3 ?? [])].find((f) => f.id === hedef.id);
  adim("4) Sayaç +1 ve myVote", g2.json?.myVote === hedef.id && hedef2?.votes === oncekiSayac + 1, `myVote=${g2.json?.myVote ?? "yok"} · sayaç ${hedef2?.votes ?? "?"} (beklenen ${oncekiSayac + 1})`);

  // ── 5) Toggle: aynı oya tekrar → kendi oyunu kaldır
  const p2 = await istek("/api/roadmap", { method: "POST", body: JSON.stringify({ featureId: hedef.id }) }, COOKIE);
  adim("5) Toggle ile oy kaldırma", p2.status === 200 && p2.json?.removed === true, `HTTP ${p2.status} · removed=${String(p2.json?.removed)}`);

  // ── 6) Sayaç geri döndü mü (oturumlu GET — myVote gerçekten temizlenmiş olmalı)
  const g3 = await istek(`/api/roadmap?t=${Date.now()}`, {}, COOKIE);
  const hedef3 = [...(g3.json?.v2 ?? []), ...(g3.json?.v3 ?? [])].find((f) => f.id === hedef.id);
  adim("6) Sayaç eski haline döndü (sıfır iz)", g3.json?.myVote == null && hedef3?.votes === oncekiSayac, `myVote=${String(g3.json?.myVote)} · sayaç ${hedef3?.votes ?? "?"} (beklenen ${oncekiSayac})`);
} catch (e) {
  adim("Beklenmeyen hata", false, String(e?.message || e));
} finally {
  // ── Garantili temizlik: test kullanıcısının her türlü kalıntısını sil
  try {
    const sil = await fetch(`${env.url}/rest/v1/nur_roadmap_votes?user_id=eq.${encodeURIComponent(TEST_ID)}`, {
      method: "DELETE",
      headers: { apikey: env.key, Authorization: `Bearer ${env.key}` },
    });
    console.log(`\n🧹 Temizlik: test oyu silindi (HTTP ${sil.status})`);
  } catch { console.log("\n🧹 Temizlik: silme başarısız — kalıntı sonraki koşunun 0. adımında silinir"); }
}

console.log("─".repeat(60));
const basarisiz = adimlar.filter((a) => !a.ok);
console.log(`ÖZET: ${adimlar.length - basarisiz.length}/${adimlar.length} adım başarılı`);
if (basarisiz.length) {
  console.log("\n❌ ROADMAP SAĞLIK TESTİ BAŞARISIZ:");
  for (const a of basarisiz) console.log(`   · ${a.ad}${a.detay ? ` (${a.detay})` : ""}`);
  process.exit(1);
}
console.log("✅ ROADMAP SAĞLIK TESTİ GEÇTİ — oy akışı uçtan uca sağlıklı\n");
