import crypto from "crypto"; // ★ 27.09 FIX: require() ESM'de patlıyor — statik import
import type { VercelRequest, VercelResponse } from "@vercel/node";


// ─── Server error logger (gömülü — _shared Vercel'de paketlenmiyor) ───
async function logServerError(req: { url?: string; headers: Record<string, string | string[] | undefined> }, error: unknown, endpoint: string): Promise<void> {
  try {
    const __url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim().replace(/\/$/, "");
    const __key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    if (!__url || !__key) return;
    const __msg = error instanceof Error ? error.message : String(error || "Bilinmeyen sunucu hatası");
    if (!__msg) return;
    const __stack = error instanceof Error ? (error.stack || "") : "";
    const __path = String(req.url || endpoint).slice(0, 200);
    const __fingerprint = crypto.createHash("sha256").update(__msg + "|" + __path).digest("hex").slice(0, 16);
    await fetch(__url + "/rest/v1/nur_error_logs", {
      method: "POST",
      headers: { apikey: __key, Authorization: "Bearer " + __key, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        message: __msg.slice(0, 500),
        stack: __stack.slice(0, 4000),
        path: __path,
        source: ("server:" + endpoint).slice(0, 40),
        user_agent: String(req.headers["user-agent"] || "server").slice(0, 300),
        fingerprint: __fingerprint,
        kind: "genel",
        user_email: "",
      }),
    });
  } catch { /* log yazımı siteyi ASLA bozmaz */ }
}

// Self-contained rate limit
// ★ PAYLAŞIMLI RATE LIMIT (Açık 2) — Upstash Redis varsa instance'lar arası
//   ortak sayaç (UPSTASH_REDIS_REST_URL/TOKEN env), yoksa in-memory fallback.
const __RL_MAP = new Map<string, number[]>();
const __RL_URL = (process.env.UPSTASH_REDIS_REST_URL || "").replace(/\/+$/, "");
const __RL_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || "";
const __RL_SHARED = __RL_URL.length > 0 && __RL_TOKEN.length > 0;
function __rlIp(req: { headers: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string | null } }): string {
  const forwarded = String(req.headers["cf-connecting-ip"] || req.headers["x-real-ip"] || String(req.headers["x-forwarded-for"] || "").split(",")[0] || "").trim();
  return forwarded || req.socket?.remoteAddress || "unknown";
}
function __rlMem(bucketKey: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const active = (__RL_MAP.get(bucketKey) || []).filter((h) => h >= now - windowMs);
  if (active.length >= max) { __RL_MAP.set(bucketKey, active); return false; }
  active.push(now);
  __RL_MAP.set(bucketKey, active);
  if (__RL_MAP.size > 5000) { for (const k of __RL_MAP.keys()) { __RL_MAP.delete(k); if (__RL_MAP.size <= 2500) break; } }
  return true;
}
async function __rlShared(bucketKey: string, windowMs: number): Promise<number | null> {
  if (!__RL_SHARED) return null;
  try {
    const res = await fetch(`${__RL_URL}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${__RL_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify([["INCR", `rl:${bucketKey}`], ["EXPIRE", `rl:${bucketKey}`, String(Math.ceil(windowMs / 1000)), "NX"]]),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as Array<{ result: unknown }>;
    return Number(json[0]?.result ?? 1);
  } catch { return null; }
}
async function rateLimit(req: { headers: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string | null } }, res: { setHeader: (k: string, v: string) => void; status: (n: number) => { json: (o: unknown) => void } }, key: string, maxRequests: number, windowMs: number): Promise<boolean> {
  const bucketKey = `${key}:${__rlIp(req)}`;
  const hits = await __rlShared(bucketKey, windowMs);
  if (hits !== null) {
    if (hits > maxRequests) { res.setHeader("Retry-After", "60"); res.setHeader("Cache-Control", "no-store"); res.status(429).json({ ok: false, error: "İstek işlenemedi" }); return false; }
    return true;
  }
  const ok = __rlMem(bucketKey, maxRequests, windowMs);
  if (!ok) { res.setHeader("Retry-After", "60"); res.setHeader("Cache-Control", "no-store"); res.status(429).json({ ok: false, error: "İstek işlenemedi" }); }
  return ok;
}
async function rateLimitSilent(req: { headers: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string | null } }, key: string, maxRequests: number, windowMs: number): Promise<boolean> {
  const bucketKey = `${key}:${__rlIp(req)}`;
  const hits = await __rlShared(bucketKey, windowMs);
  if (hits !== null) return hits <= maxRequests;
  return __rlMem(bucketKey, maxRequests, windowMs);
}
async function rateLimitBucket(bucketKey: string, maxRequests: number, windowMs: number): Promise<boolean> {
  const hits = await __rlShared(bucketKey, windowMs);
  if (hits !== null) return hits <= maxRequests;
  return __rlMem(bucketKey, maxRequests, windowMs);
}


declare const process: { env: Record<string, string | undefined> };

// ════════════════════════════════════════════════════════
// ROADMAP — güncelleme yol haritası GERÇEK oylama sistemi
// GET  → özellikler + gerçek oy toplamları (herkes okuyabilir)
// POST → oy ver / değiştir (oturum şart; kullanıcı başına 1 özellik)
// Eski localStorage sistemi: herkes kendi oylarını kendi görüyordu,
// admin gerçek toplamı göremiyordu. Artık tek gerçek sayaç DB'de.
// ════════════════════════════════════════════════════════

const COOKIE_NAME = "nur_session";

function parseCookies(req: VercelRequest): Record<string, string> {
  const header = req.headers.cookie || "";
  return header.split(";").reduce<Record<string, string>>((acc, part) => {
    const [key, ...rest] = part.trim().split("=");
    if (!key) return acc;
    try { acc[key] = decodeURIComponent(rest.join("=")); } catch { acc[key] = rest.join("="); }
    return acc;
  }, {});
}

function base64UrlDecode(input: string): Buffer {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4 ? "=".repeat(4 - (normalized.length % 4)) : "";
  return Buffer.from(normalized + pad, "base64");
}

interface SessionInfo { id: string; email: string }

function getSession(req: VercelRequest): SessionInfo | null {
  const token = parseCookies(req)[COOKIE_NAME];
  if (!token || !token.includes(".")) return null;
  const secret = process.env.NUR_SESSION_SECRET || "";
  if (secret.length < 20) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest().toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;
  try {
    const user = JSON.parse(base64UrlDecode(payload).toString("utf8")) as { id: string; email: string; exp?: number };
    if (!user.exp || user.exp < Math.floor(Date.now() / 1000)) return null;
    return { id: user.id, email: user.email };
  } catch { return null; }
}

function supabaseConfig() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) return null;
  return { url, key };
}

async function db<T>(path: string, init?: RequestInit): Promise<T> {
  const cfg = supabaseConfig()!;
  const response = await fetch(`${cfg.url}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}`, "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  const text = await response.text();
  if (!response.ok) throw new Error(text || `Supabase ${response.status}`);
  return (text ? JSON.parse(text) : null) as T;
}

const sanitize = (s: unknown, max: number) => (typeof s === "string" ? s.trim().slice(0, max).replace(/[<>"';]/g, "") : "");

// ═════════════════════════════════════════════════════════
// ★ LANSMAN HAZIRLIĞI (28.09) — GET'te her istek tüm oylar tablosunu
//   çekiyordu; kullanıcı arttıkça satır da artıyor (lansmanda en ağır
//   okuma). Aggregate 20sn in-memory cache'te; oy verme/dağıtma anında
//   bust edilir (kimse bayat sayaç görmez). myVote kullanıcıya özel
//   olduğu için CDN cache KULLANILMAZ — yalnız instance-içi cache.
// ═════════════════════════════════════════════════════════
const RM_TTL_MS = 20_000;
let rmCache: { at: number; features: any[]; counts: Record<string, number>; totalVotes: number } | null = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  const cfg = supabaseConfig();
  if (!cfg) return res.status(503).json({ ok: false, error: "Veritabanı yapılandırması eksik" });

  try {
    if (req.method === "GET") {
      // Özellikler + GERÇEK oy toplamları (tek sayaç DB'de)
      // ★ 28.09 FIX: buradaki .catch(() => []) maskesi GET'i bozuyordu — DB'ye
      //   ara sıra ulaşılamayınca ok:true + BOŞ liste dönüyor, frontend default
      //   planda kalıyor ("34 özellik" + DB id drifti) ve POST 400'e çakılıyordu.
      //   Artık DB hatası dış try/catch'e düşer → 500 + nur_error_logs kaydı.
      let features: any[];
      let counts: Record<string, number>;
      let totalVotes: number;
      if (rmCache && Date.now() - rmCache.at < RM_TTL_MS) {
        ({ features, counts, totalVotes } = rmCache);
      } else {
        const [f, votes] = await Promise.all([
          db<any[]>("nur_roadmap_features?select=id,version,title,description,icon,active&order=created_at.asc"),
          db<any[]>("nur_roadmap_votes?select=feature_id"),
        ]);
        features = f;
        counts = {};
        for (const v of votes) counts[v.feature_id] = (counts[v.feature_id] || 0) + 1;
        totalVotes = votes.length;
        rmCache = { at: Date.now(), features, counts, totalVotes };
      }
      const session = getSession(req);
      let myVote: string | null = null;
      if (session) {
        const mine = await db<any[]>(`nur_roadmap_votes?user_id=eq.${encodeURIComponent(session.id)}&select=feature_id`).catch(() => [] as any[]);
        myVote = mine[0]?.feature_id ?? null;
      }
      // ★ 17.10 GİZLE PLANININ SUNUCU AYAĞI: admin-gizli maddelerin (adm-*)
      //   açıklaması admin harici cevapta YOK SAYILIR — oylamada isim + oy
      //   kalır, detay devtools'tan bile okunamaz. Cache'ten gelen satırlar
      //   MUTASYON DEĞİL kopyayla maskelemir (instance ortak cache korunur).
      const adminEmailsRead = (process.env.NUR_ADMIN_EMAILS || process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "").toLowerCase().split(",").map((e) => e.trim()).filter(Boolean);
      const adminSess = Boolean(session && adminEmailsRead.length && adminEmailsRead.includes(session.email.toLowerCase()));
      const maskeAdminMaddeleri = (f: any) =>
        String(f.id || "").startsWith("adm-") ? (adminSess ? f : { ...f, description: "", desc: "" }) : f;
      return res.status(200).json({
        ok: true,
        v2: features.filter((f) => f.version === "V2" && f.active).map((f) => ({ ...f, desc: f.description, votes: counts[f.id] || 0 })).map(maskeAdminMaddeleri),
        v3: features.filter((f) => f.version === "V3" && f.active).map((f) => ({ ...f, desc: f.description, votes: counts[f.id] || 0 })).map(maskeAdminMaddeleri),
        myVote,
        totalVotes,
      });
    }

    if (req.method === "POST") {
      if (!(await rateLimit(req, res, "roadmap:vote", 20, 60_000))) return;
      const session = getSession(req);
      if (!session) return res.status(401).json({ ok: false, error: "Oy vermek için giriş yapmalısın" });
      const body = (req.body || {}) as Record<string, unknown>;
      const featureId = sanitize(body.featureId, 60);
      if (!featureId) return res.status(400).json({ ok: false, error: "Geçersiz özellik" });

      // Özellik var mı (aktif mi)?
      // ★ 28.09 FIX: bu sorgudaki .catch(() => []) EN TEHLİKELİ maskaydı —
      //   DB'ye geçici ulaşılamazsa feat=[] → "Bu özellik oylamaya kapalı" 400
      //   dönüyordu; frontend mesajda "giriş" aradığından genel "Oyun şu an
      //   alınamadı" uyarısı düşüyordu. Artık: DB hatası → 503 (log'lu),
      //   kayıt gerçekten yoksa → 400 + log (id drifti görünür olsun).
      let feat: any[] = [];
      try {
        feat = await db<any[]>(`nur_roadmap_features?id=eq.${encodeURIComponent(featureId)}&select=id,active`);
      } catch (dbErr) {
        await logServerError(req, dbErr, "api/roadmap:feature-lookup");
        return res.status(503).json({ ok: false, error: "Oy kaydedilemedi — birkaç saniye sonra tekrar dener misin?" });
      }
      if (feat.length === 0) {
        await logServerError(req, new Error(`Roadmap özelliği DB'de yok: ${featureId} (frontend/DB id drifti?)`), "api/roadmap:feature-missing");
        return res.status(400).json({ ok: false, error: "Oy listesi güncelleniyor — sayfayı yenileyip tekrar dener misin?" });
      }
      if (!feat[0].active) return res.status(400).json({ ok: false, error: "Bu özellik oylamaya kapalı" });

      // Aynı özelliğe tekrar tıklandı → oyu kaldır (toggle)
      const mine = await db<any[]>(`nur_roadmap_votes?user_id=eq.${encodeURIComponent(session.id)}&select=feature_id`).catch(() => [] as any[]);
      if (mine[0]?.feature_id === featureId) {
        await db(`nur_roadmap_votes?user_id=eq.${encodeURIComponent(session.id)}`, { method: "DELETE" });
        rmCache = null; // ★ sayaç anında tazelensin
        return res.status(200).json({ ok: true, removed: true });
      }
      // Kullanıcı başına tek oy: mevcut kaydı GÜNCELLE (upsert)
      await db("nur_roadmap_votes?on_conflict=user_id", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify({ user_id: session.id, feature_id: featureId }),
      });
      rmCache = null; // ★ sayaç anında tazelensin
      return res.status(200).json({ ok: true });
    }

    if (req.method === "DELETE") {
      // Admin: özellik ekle/sil (sadece admin oturumu)
      const session = getSession(req);
      if (!session) return res.status(401).json({ ok: false, error: "Oturum gerekli" });
      // ★ FAIL-CLOSED (27.09 güvenlik taraması): adminEmails BOŞSA herkes admin
      //   olabiliyordu! Artık env tanımsızsa işlem MUTLAKA reddedilir.
      // ★ 28.09 FIX (canlıda kanıtlandı): env'de yalnız NUR_ADMIN_EMAILS varken
      //   burada ADMIN_EMAILS okunduğu için gerçek admin bile 403 alıyordu —
      //   roadmap Ekle/Sil/Düzenle/Sıfırla canlıda hiç çalışmıyordu.
      //   auth/google.ts + kill-session.ts ile aynı anahtar okunur.
      const adminEmails = (process.env.NUR_ADMIN_EMAILS || process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "").toLowerCase().split(",").map((e) => e.trim()).filter(Boolean);
      if (!adminEmails.length || !adminEmails.includes(session.email.toLowerCase())) {
        return res.status(403).json({ ok: false, error: "Admin yetkisi gerekli" });
      }
      const body = (req.body || {}) as Record<string, unknown>;
      const action = sanitize(body.action, 20);
      if (action === "delete") {
        const id = sanitize(body.id, 60);
        await db(`nur_roadmap_features?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
        rmCache = null;
        return res.status(200).json({ ok: true });
      }
      if (action === "add") {
        const id = `custom-${Date.now()}`;
        await db("nur_roadmap_features", {
          method: "POST",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({ id, version: body.version === "V3" ? "V3" : "V2", title: sanitize(body.title, 80), description: sanitize(body.desc, 200), icon: "ai_arkaplan" }),
        });
        rmCache = null;
        return res.status(200).json({ ok: true, id });
      }
      if (action === "edit") {
        // ★ Admin düzenlemesi herkese yansır (başlık + açıklama)
        const id = sanitize(body.id, 60);
        if (!id) return res.status(400).json({ ok: false, error: "Geçersiz özellik" });
        await db(`nur_roadmap_features?id=eq.${encodeURIComponent(id)}`, {
          method: "PATCH",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({ title: sanitize(body.title, 80), description: sanitize(body.desc, 200) }),
        });
        return res.status(200).json({ ok: true });
      }
      if (action === "resetVotes") {
        // ★ Yeni oylama turu: tüm oylar silinir (özellikler kalır)
        await db("nur_roadmap_votes", { method: "DELETE" });
        rmCache = null;
        return res.status(200).json({ ok: true });
      }
      // ★ 10.10 (Öncelik-1 GİZLE/BAKIM PLANI): Tüm listeyi sıfırla
      //   (oylama V2 + uzun vadeli V3) — eski maddeler SİLİNİR, oylar silinir.
      if (action === "resetAllFeatures") {
        await db("nur_roadmap_votes", { method: "DELETE" });
        await db("nur_roadmap_features", { method: "DELETE" });
        rmCache = null;
        return res.status(200).json({ ok: true });
      }
      // ★ 23.10 BOŞALTI (sahibin emri): yalnızca V3 (uzun vadeli) satırları DB'den sil.
      //   Kod tarafında DEFAULT_V3 artık BOŞ (roadmapVeri.ts); DB'deki eski maddeler
      //   Get'te canlı yaşamaya devam etmesin diye bu tek tıkla temizlenir. V2
      //   oylama satırları ve oylar DOKUNULMAZ — kullanıcı bir seansta yönetir, oy kaybı yok.
      if (action === "clearV3") {
        await db("nur_roadmap_features?version=eq.V3", { method: "DELETE" });
        rmCache = null;
        return res.status(200).json({ ok: true });
      }
      // ★ 10.10: Admin-gizli maddeyi V2 oylama listesine EKLER.
      //   Kullanıcılar göremez (getFeatureLock "hidden" → ... admin?) — sadece admin.
      //   Admin istediğini "free"/"pro"/"elit"e çekince "yeni güncelleme" gibi
      //   kullanıcı ekranlarına düşer (duyuru adminSyncService üzerinden).
      // ★ 17.10 YENİ DON (kullanıcı kararı 2. tur): 22 madde — hidden gizli + 2 V.
      //   Önceki 21-madde listesi güncellendi; sıra kullanıcının verdiği sırada:
      //   1·Ayet & Dua Kütüphanesi (18.10 eklendi) 2·Ayet Notlarım 3·Keşfet Hadis/Kıssa/Rehber 3·Haftanın Videosu
      //   4·Kelime Atölyesi 5·AI Arka Plan Üretici 6·Hazır Ayet Paketleri
      //   7–21·Atmosfer (15 adet) 22·ZIP Resim/Ses Yükleme (V3) 23·Kendi Sesinle Üret (V3).
      if (action === "addAdminFeatures") {
        const admin = session;
        const ATMOSFERLER: Array<[string, string]> = [
          ["aurora_borealis_sky", "Kuzey Işıkları"],
          ["black_hole_space", "Kara Delik ve Uzay"],
          ["hellfire_volcano_lava", "Cehennem Ateşi ve Lav"],
          ["paradise_garden_palace", "Cennet Bahçesi ve Saray"],
          ["stormy_sea_boat", "Fırtınalı Deniz ve Gemi"],
          ["lunar_phases_orbit", "Ayın Evreleri ve Yörüngesi"],
          ["meteor_shower_stars", "Meteor Yağmuru"],
          ["gushing_spring_river", "Çağlayan Pınar ve Nehir"],
          ["date_palm_branches", "Hurma Dalları"],
          ["olive_grove_trees", "Zeytinlik Ağaçları"],
          ["honeybee_hive_comb", "Bal Arısı ve Petek"],
          ["pearl_coral_diving", "İnci ve Mercan Dalışı"],
          ["justice_scales_balance", "Adalet Terazisi"],
          ["deep_canyon_passages", "Derin Kanyon Geçitleri"],
          ["wolf_howling_night", "Gece Uluyan Kurt"],
        ];
        const ADMIN_FEATURES: Array<{ id: string; title: string; desc: string; icon: string; tier: string }> = [
          // ★ 18.10 (kullanıcı emri): Ayet Kütüphanesi gizli maddelere geri eklendi —
          //   kilit HELİVALIDE ADMIN_HARD_KILITLI'da (kod tarafı); bu satır panelin
          //   kilit yönetiminde görünür olması içindir.
          { id: "adm-ayet-kutuphanesi", title: "Ayet & Dua Kütüphanesi", desc: "616 ayet, 13 mood filtresi, Günün Ayeti ve kart tasarımı.", icon: "arsiv", tier: "free" },
          { id: "adm-ayet-notlari", title: "Ayet Notlarım", desc: "Seçili ayetlere kendi notunu ekle; manevi arşiv cihazında şifreli durur.", icon: "notlar", tier: "pro" },
          { id: "adm-kesfet-rehber", title: "Keşfet: Hadis · Kıssa · Rehber", desc: "Hadis bankası, peygamber kıssaları ve dua rehberi tek Keşfet ekranında.", icon: "soru", tier: "free" },
          { id: "adm-haftanin-videosu", title: "Haftanın Videosu", desc: "En beğenilen üretimler her hafta vitrinde; topluluğa ilham versin.", icon: "hafta_video", tier: "free" },
          { id: "adm-kelime-atolyesi", title: "Kelime Atölyesi", desc: "Tek kelime yaz: ayet önerileri, atmosfer ve video taslağı tek tıkla gelir.", icon: "kelime_video", tier: "pro" },
          { id: "adm-ai-arkaplan", title: "AI Arka Plan Üretici", desc: "Yazdığın metnin ruhuna uygun arka plan sahnesi üretir, stüdyoya aktarırsın.", icon: "ai_arkaplan", tier: "pro" },
          { id: "adm-ayet-paketleri", title: "Hazır Ayet Paketleri", desc: "Kandil, cuma, sabır ve daha fazlası — tek tıkla paketlenmiş ayet setleri.", icon: "paket", tier: "free" },
          // ★ 18.10 UZUN VADELİ GÜN (Kur'an ekranı): hepsi KODDA ZATEN ÇALIŞAN özellikler —
          //   admin-gizli başlar; admin tek tıkla free/pro/elit'e açar → "yeni geldi" gibi düşer.
          { id: "adm-kabe-canli", title: "Kâbe Canlı Yayın", desc: "Mescid-i Haram'dan 7/24 canlı yayın — Kur'an modalının üstünde canlı noktayla.", icon: "video", tier: "free" },
          { id: "adm-kuran-sayfalar", title: "Kur'an Sayfaları · Mushaf", desc: "604 mushaf sayfası, zoom, tam ekran, kaldığın yerden devam + hatim takibi.", icon: "sayfa", tier: "free" },
          { id: "adm-ekransiz-dinleme", title: "Ekransız Meal Dinleme", desc: "Ekran karartılır, ses sürer — kilit ekranından oynat/duraklat (MediaSession).", icon: "toplu", tier: "pro" },
          { id: "adm-karsilastirmali-okuma", title: "Karşılaştırmalı Okuma", desc: "İkinci meal yan yana — iki meali aynı anda karşılaştırarak oku.", icon: "kitaplar", tier: "pro" },
          { id: "adm-latin-okunus", title: "Latin Okunuş", desc: "Ayetin altında latin harfleriyle okunuş — Arapça bilmiyorsa köprü.", icon: "abc", tier: "free" },
          { id: "adm-uyku-tilavet", title: "Uyku Tilaveti · Zamanlayıcı", desc: "Zaman dolunca ses kendiliğinden durur — yatarken Kur'an dinleme.", icon: "moon", tier: "free" },
          // ★ 18.10 V3 (kullanıcı emri): Sesli Meal (Seslendirme) V3 admin-gizli —
          //   admin tek tıkla free/pro/elit'e açar; kod tarafı admin-godmode haricinde
          //   modalı hiç mount etmez (ModalsContainer render kapısı).
          { id: "adm-seslendirme", title: "Sesli Meal · Seslendirme", desc: "V3 · Ayetim metnini TTS'le okut — 5 dil, 15 atmosfer, sıralı okuma.", icon: "seslendirme", tier: "v3" },
          // ★ 18.10 UZUN VADELI PLAN (kullanıcı emri — SAŞMA OLMAYAN gerçek özellikler):
          //   "yapılabilir ama henüz yapılmamış" — ilgi çeksin, merak uyandırsın.
          { id: "adm-tajvid-egitimi", title: "Tajvid Eğitimi", desc: "Harflerin makharij'i, sifatları ve Kur'an okuma kuralları adım adım — ders + alıştırma + sınav. Öğrenme içeriği ÜCRETSİZ.", icon: "abc", tier: "free" },
          { id: "adm-telaffuz-egitimi", title: "Telaffuz Eğitimi", desc: "Kâriden örnek ayet dinle/karşılaştır; harf-harf telaffuz kalibrasyon testi. ÜCRETSİZ.", icon: "seslendirme", tier: "free" },
          { id: "adm-haftanin-videosu-v2", title: "Haftanın Videosu V2", desc: "Oylamalı vitrin + topluluk yorumu + haftanın teması; otomatik sosyal medya kartı üretimi.", icon: "hafta_video", tier: "free" },
          { id: "adm-hatim-takip-v2", title: "Hatim Takip V2 · Grup", desc: "Aynı hatimi ailenle/arkadaşlarla birlikte yap; grup sayacı + hatim meydanı.", icon: "toplu", tier: "free" },
          { id: "adm-gece-rehberi", title: "Gece İbadet Rehberi", desc: "Teheccüd/tesbih seansları, uyku öncesi tilavet planlayıcı; hafif gece teması.", icon: "moon", tier: "free" },
          ...ATMOSFERLER.map(([klasor, ad]) => ({
            id: `adm-atmos-${klasor}`,
            title: `Atmosfer: ${ad}`,
            desc: `Atmosfer arka plan kategorisi: ${ad} — üretim ekranında arka plan olarak çıkar.`,
            icon: "ai_arkaplan",
            tier: "elit",
          })),
          // ★ 17.10 (2. tur): V3'e kilitlenen 2 modül de oylama listesinde, sıra onlarınki
          { id: "adm-zip-resim-ses", title: "ZIP Resim / Ses Yükleme", desc: "Kendi resim ve ses dosyalarını zip olarak yükle, videoda kullan.", icon: "toplu", tier: "v3" },
          { id: "adm-kendi-ses", title: "Kendi Sesinle Üretim", desc: "Kendi anlatım tarzını videolarına taşı — sesini seçtiğin ayetlerle buluştur.", icon: "kendi_ses", tier: "v3" },
        ];
        for (const f of ADMIN_FEATURES) {
          await db("nur_roadmap_features?on_conflict=id", {
            method: "POST",
            headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
            body: JSON.stringify({ id: f.id, version: "V2", title: f.title, description: f.desc, icon: f.icon, active: true, hidden_feature: true, target_tier: f.tier }),
          });
          // ★ feature-locks'a hedef tier yazılır —(hidden= Admin-gizli hâl) true = sadece admin
          await db("nur_feature_locks?on_conflict=feature_id", {
            method: "POST",
            headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
            body: JSON.stringify({ feature_id: f.id, lock_level: "hidden", active: true, updated_by: admin.email, updated_at: new Date().toISOString() }),
          });
        }
        rmCache = null;
        return res.status(200).json({ ok: true, added: ADMIN_FEATURES.length });
      }
      // ★ 10.10: Admin-gizli özelliği aç → hedef tier'a aktifleştir ("yeni gelmiş gibi")
      // ★ 17.10: tier tipine "v3" eklendi — ZIP/KendiSes maddeleri admin V3'e kilitler.
      if (action === "revealFeature") {
        const admin = session;
        const id = sanitize(body.id, 60);
        const tier = sanitize(body.tier, 10) as "free" | "pro" | "elit" | "v3" | "";
        // ★ 25.10 KİLİT BAĞI: AdminGizliFeatures artık modül bağına eşlenen camelCase
        //   kapı kimliğini (ayetKartlari vb.) da gönderiyor. Bu ikinci satır yoksa
        //   admin panelindeki "free/pro/elit'e aç" gerçek kapıya HİÇ dokunmuyor ve
        //   buton davranış üretmiyordu (modalsContainer(ModalsContainer) v2KilitliMi
        //   getFeatureLock(camelKimlik) okuyordu).
        const featureId = sanitize(body.featureId, 40);
        if (!id || !tier) return res.status(400).json({ ok: false, error: "Geçersiz özellik/seviye" });
        await db("nur_feature_locks?on_conflict=feature_id", {
          method: "POST",
          headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
          body: JSON.stringify({ feature_id: id, lock_level: tier, active: true, updated_by: admin.email, updated_at: new Date().toISOString() }),
        });
        // ★ Gerçek kapı satırı — camelCase modül kimliği (admine aynen davranış)
        if (featureId) {
          await db("nur_feature_locks?on_conflict=feature_id", {
            method: "POST",
            headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
            body: JSON.stringify({ feature_id: featureId, lock_level: tier, active: true, updated_by: admin.email, updated_at: new Date().toISOString() }),
          });
        }
        await db(`nur_roadmap_features?id=eq.${encodeURIComponent(id)}`, {
          method: "PATCH",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({ active: true, hidden_feature: false, target_tier: tier }),
        });
        rmCache = null;
        return res.status(200).json({ ok: true, id, tier });
      }
      // ★ 10.10: Açmkış özelliği tekrar gizle (geri alma) — nominee-izli.
      if (action === "hideFeature") {
        const admin = session;
        const id = sanitize(body.id, 60);
        // ★ 25.10 KİLİT BAĞI: gerçek kapı satırını da 'hidden' seviyesine çek.
        const featureId = sanitize(body.featureId, 40);
        if (!id) return res.status(400).json({ ok: false, error: "Geçersiz özellik" });
        await db("nur_feature_locks?on_conflict=feature_id", {
          method: "POST",
          headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
          body: JSON.stringify({ feature_id: id, lock_level: "hidden", active: true, updated_by: admin.email, updated_at: new Date().toISOString() }),
        });
        if (featureId) {
          await db("nur_feature_locks?on_conflict=feature_id", {
            method: "POST",
            headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
            body: JSON.stringify({ feature_id: featureId, lock_level: "hidden", active: true, updated_by: admin.email, updated_at: new Date().toISOString() }),
          });
        }
        await db(`nur_roadmap_features?id=eq.${encodeURIComponent(id)}`, {
          method: "PATCH",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({ hidden_feature: true }),
        });
        rmCache = null;
        return res.status(200).json({ ok: true, id });
      }
      return res.status(400).json({ ok: false, error: "Geçersiz işlem" });
    }

    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  } catch (e) {
    await logServerError(req, e, "api/roadmap");
    console.error("[roadmap]", e);
    return res.status(500).json({ ok: false, error: "İşlem tamamlanamadı" });
  }
}
