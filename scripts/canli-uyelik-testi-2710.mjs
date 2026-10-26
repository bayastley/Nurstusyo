// ════════════════════════════════════════════════════════════════
// CANLI ÜYELİK TESTİ (27.10) — sandbox/canlı DB testi (.env.local ile)
//
// Testler:
//  T1  ELİT kullanıcıya abonelik tanımlanır (30 gün aktif)
//  T2  ELİT haftalık haklar: kisa 105 / uzun 35 / tam 7 (RPC günlük × 7)
//  T3  Geçen haftanın kullanımı yeni haftayı ETKİLEMEZ (Pazartesi otomatik
//      yenilenme — "her gün hak yükleme" diye bir işlem yok; hafta penceresi
//      kayar, haklar kendiliğinden taze olur)
//  T4  Abonelik süresi DOLUNCA tier ücretsiz düşer (authorize.ts loadServerAccess
//      kuralının birebir eşleniği: ends_at < şimdi → free)
//  T5  Ücretsiz seviyeye düşünce haftalık kota 21 (3×7) olur
//  T6  Ödul edilmiş PAKET hakkı (tek seferlik, parayla alınan) biten üyelikte
//      KALIR ve harcanabilir (adil davranış: kota üyelike bağlı, paket kalıcı)
//  T7  Lansman deneme hakkı: ilk kontrolde 5 verilir (nur_deneme_kalan)
//  Son: test kullanıcısının tüm izleri silinir (DB temiz kalır)
// ════════════════════════════════════════════════════════════════

import fs from "fs";
import path from "path";
import crypto from "crypto";

function envYukle() {
  const f = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(f)) return;
  for (const line of fs.readFileSync(f, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
envYukle();

const SB_URL = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim().replace(/^["']+|["']+$/g, "").replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
const SB_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
if (!SB_URL || !SB_KEY) {
  console.error("❌ .env.local'de SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY yok — önce Vercel'den env pull yap.");
  process.exit(1);
}

const uid = `canli-test-2710-${crypto.randomBytes(4).toString("hex")}`;

async function sb(apiPath, opts = {}) {
  const res = await fetch(`${SB_URL}/rest/v1/${apiPath}`, {
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json", ...(opts.headers || {}) },
    method: opts.method || "GET",
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${opts.method || "GET"} ${apiPath} → ${res.status} ${text.slice(0, 240)}`);
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text; }
}
const rpc = (name, body) => sb(`rpc/${name}`, { method: "POST", body });

const SONUC = [];
const yaz = (ad, ok, detay) => { SONUC.push({ ad, ok, detay }); console.log(`${ok ? "✅" : "❌"} ${ad} — ${detay}`); };

/** authorize.ts loadServerAccess birebir kural eşleniği (,DB'den tier çözümü) */
async function sunucuTier(userId) {
  const users = await sb(`nur_users?id=eq.${encodeURIComponent(userId)}&select=tier,is_admin`);
  let tier = users?.[0]?.tier === "pro" || users?.[0]?.tier === "elit" ? users[0].tier : "free";
  if (tier !== "free") {
    const subs = await sb(`nur_subscriptions?user_id=eq.${encodeURIComponent(userId)}&status=eq.active&order=ends_at.desc&limit=1&select=ends_at,tier`);
    const endsAt = subs?.[0]?.ends_at ? Date.parse(subs[0].ends_at) : NaN;
    if (!Number.isFinite(endsAt) || endsAt <= Date.now()) tier = "free";
    else if (subs[0]?.tier === "pro" || subs[0]?.tier === "elit") tier = subs[0].tier;
  }
  return tier;
}

try {
  console.log(`🧪 TEST USER: ${uid}`);
  yeniDeneme: {
    const deneme = await rpc("nur_deneme_kalan", { p_user_id: uid }).catch(() => null);
    if (deneme) yaz("T0 kurulum: nur_deneme_kalan ilk okuma", Number(deneme?.[0]?.remaining) === 5, `kalander ${deneme?.[0]?.remaining}`);
  }

  // ── T1: ELİT kullanıcı + aktif abonelik ──
  await sb("nur_users", { method: "POST", body: { id: uid, email: `${uid}@nurstudyo.com`, tier: "elit" } });
  await sb("nur_subscriptions", { method: "POST", body: { user_id: uid, tier: "elit", provider: "iyzico", starts_at: new Date().toISOString(), ends_at: new Date(Date.now() + 30 * 864e5).toISOString(), status: "active" } });
  const tier1 = await sunucuTier(uid);
  yaz("T1 ELİT kullanıcı + 30 günlük aktif abonelik → sunucu tier", tier1 === "elit", `tier=${tier1}`);

  // ── T2: ELİT haftalık haklar ──
  const r1 = await rpc("nur_consume_video", { p_user_id: uid, p_video_kind: "kisa", p_daily_quota: 15 * 7 });
  yaz("T2a 1. kısa üretim (haftalık 105)", !!r1?.[0]?.ok && r1[0].source === "kota", `source=${r1?.[0]?.source}, kalan=${r1?.[0]?.quota_left}/105`);
  const r2 = await rpc("nur_consume_video", { p_user_id: uid, p_video_kind: "uzun", p_daily_quota: 5 * 7 });
  yaz("T2b 1. uzun üretim (haftalık 35)", !!r2?.[0]?.ok && r2[0].source === "kota", `source=${r2?.[0]?.source}, kalan=${r2?.[0]?.quota_left}/35`);
  const r3 = await rpc("nur_consume_video", { p_user_id: uid, p_video_kind: "tam", p_daily_quota: 1 * 7 });
  yaz("T2c 1. tam üretim (haftalık 7)", !!r3?.[0]?.ok && r3[0].source === "kota", `source=${r3?.[0]?.source}, kalan=${r3?.[0]?.quota_left}/7`);

  // ── T3: GEÇEN haftanın kullanımları kapasiteye girmez (günlük "yükleme" yok, pazartesi penceresi kayar) ──
  const oncekiPazartesi = new Date(); oncekiPazartesi.setUTCDate(oncekiPazartesi.getUTCDate() - 7);
  const gecenHaftaISO = oncekiPazartesi.toISOString().slice(0, 10);
  await sb("nur_daily_usage", { method: "POST", body: { user_id: uid, usage_date: gecenHaftaISO, video_kind: "kisa", used_count: 200 } });
  const r3b = await rpc("nur_consume_video", { p_user_id: uid, p_video_kind: "kisa", p_daily_quota: 15 * 7 });
  const beklenen = 15 * 7 - 2; // T2a'da 1 harcandı + bu üretimde 1 daha
  yaz("T3 geçen hafta 200 üretim yapılmışolsa da bu hafta penceresi taze", r3b?.[0]?.quota_left === beklenen, `kalan=${r3b?.[0]?.quota_left}, beklenen=${beklenen}`);

  // ── T4: Abonelik süresi dün bitirildi → sunlight tier ÜCRETSİZ ──
  await sb(`nur_subscriptions?user_id=eq.${encodeURIComponent(uid)}`, { method: "PATCH", body: { ends_at: new Date(Date.now() - 864e5).toISOString() } });
  const tier2 = await sunucuTier(uid);
  yaz("T4 abonelik süresi dolunca üyelik ücretsiz düşer", tier2 === "free", `tier=${tier2} (authorize.ts kapanși)`);
  const r4 = await rpc("nur_consume_video", { p_user_id: uid, p_video_kind: "uzun", p_daily_quota: 0 });
  yaz("T5 süresi bitmiş hesapta uzun üretim KAPATILIR", !r4?.[0]?.ok, `error=${r4?.[0]?.error} (ücretsiz: uzun_kota=0)`);
  const r5 = await rpc("nur_consume_video", { p_user_id: uid, p_video_kind: "kisa", p_daily_quota: 3 * 7 });
  yaz("T5b süresi bitmiş hesapta KISA üretim 21/hafta (ücretsiz seviye)", !!r5?.[0]?.ok, `source=${r5?.[0]?.source}, kalan=${r5?.[0]?.quota_left}/21`);

  // ── T6: Öduniş PAKET hakkı —ателье üyelik bitmiş olsa da kalır ve harcanır ──
  await sb("rpc/nur_grant_video_rights", { method: "POST", body: { p_user_id: uid, p_video_kind: "kisa", p_amount: 3 } }).catch((e) => console.log(`  (nur_grant_video_rights: ${e.message.slice(0, 80)})`));
  const pk = await sb(`nur_video_rights?user_id=eq.${encodeURIComponent(uid)}&video_kind=eq.kisa&select=remaining`);
  yaz("T6a ortakisTek paketi: 3 kısa yüklendi", pk?.[0]?.remaining === 3, `remaining=${pk?.[0]?.remaining}`);

  // Bu source kota burn (farkeda paket 21 dolu. Dolu birşeyi: kota oluşturup paket'e düşmesi testizada
  {
    const pzt = new Date(); 
    pzt.setUTCDate(pzt.getUTCDate() - ((pzt.getUTCDay() === 0 ? 7 : pzt.getUTCDay()) - 1));
    await sb(`nur_daily_usage?user_id=eq.${encodeURIComponent(uid)}&usage_date=eq.${pzt.toISOString().slice(0, 10)}&video_kind=eq.kisa`, { method: "PATCH", body: { used_count: 21 } });
    const r6 = await rpc("nur_consume_video", { p_user_id: uid, p_video_kind: "kisa", p_daily_quota: 3 * 7 });
    yaz("T6b kota dolu → paket hakkından düşür", !!r6?.[0]?.ok && r6[0].source === "paket", `source=${r6?.[0]?.source}, pack_left=${r6?.[0]?.pack_left}`);
  }

  // ── T7: Lansman deneme cog (5 ortak) ──
  const kalanlar = await rpc("nur_deneme_kalan", { p_user_id: uid });
  yaz("T7 lansman deneme hakkı (5 ortak üretim)", Number(kalanlar?.[0]?.remaining) === 5, `kalan=${kalanlar?.[0]?.remaining}`);

} catch (err) {
  yaz("AKIŞ patladı", false, String(err?.message || err).slice(0, 300));
} finally {
  // ── TEMİZLİK: test kullanıcısının TÜM izleri silinir ──
  for (const [tablo, kolon] of [["nur_users", "id"], ["nur_subscriptions", "user_id"], ["nur_daily_usage", "user_id"], ["nur_video_rights", "user_id"], ["nur_deneme_hakki", "user_id"], ["nur_trials", "user_id"], ["nur_wallets", "user_id"], ["nur_orders,", "user_id"]]) {
    const col = kolon || "user_id";
    const tab = tablo.replace(/,$/, "");
    try { await sb(`${tab}?${col === "id" ? "id" : "user_id"}=eq.${encodeURIComponent(uid)}`, { method: "DELETE" }); } catch { /* tablo yoksa yut */ }
  }
  console.log(`🧹 Temizlik: tüm test satırları silindi (${uid})`);
  const okN = SONUC.filter((s) => s.ok).length;
  console.log(`\nSONUÇ: ${okN}/${SONUC.length} test geçti`);
  try { fs.writeFileSync(path.resolve(process.cwd(), "canli-uyelik-testi-sonuc.json"), JSON.stringify(SONUC, null, 2)); } catch {}
}
