import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";


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

// Input validation & security
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SAFE_ID_REGEX = /^[a-zA-Z0-9\-_]+$/;

function sanitize(input: unknown, max = 500): string {
  if (!input || typeof input !== "string") return "";
  const trimmed = input.trim();
  return trimmed.slice(0, max).replace(/[<>"';]/g, "");
}

function validateEmail(email: unknown): string | null {
  if (!email || typeof email !== "string") return null;
  const cleaned = email.trim().toLowerCase().slice(0, 254);
  if (!EMAIL_REGEX.test(cleaned)) return null;
  return cleaned;
}

function validateTier(tier: unknown): "free" | "pro" | "elit" | null {
  if (tier === "free" || tier === "pro" || tier === "elit") return tier;
  return null;
}

function validateId(id: unknown): string | null {
  if (!id || typeof id !== "string") return null;
  if (!SAFE_ID_REGEX.test(id) || id.length > 64) return null;
  return id;
}

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

async function adminRateLimit(adminId: string, max = 100, windowMs = 60000): Promise<boolean> {
  return rateLimitBucket(`admin:action:${adminId}`, max, windowMs);
}

interface AdminSession { id: string; email: string; verified: boolean; isAdmin: boolean; exp: number }

function base64Url(input: Buffer): string { return input.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, ""); }

async function adminFromCookie(req: VercelRequest): Promise<AdminSession | null> {
  const cookie = String(req.headers.cookie || "").split(";").map((part) => part.trim()).find((part) => part.startsWith("nur_session="));
  if (!cookie) return null;
  const [payload, signature] = decodeURIComponent(cookie.slice("nur_session=".length)).split(".");
  const secret = process.env.NUR_SESSION_SECRET || process.env.GOOGLE_CLIENT_SECRET || "";
  if (!payload || !signature || secret.length < 20) return null;
  const expected = base64Url(crypto.createHmac("sha256", secret).update(payload).digest());
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const pad = normalized.length % 4 ? "=".repeat(4 - normalized.length % 4) : "";
    const admin = JSON.parse(Buffer.from(normalized + pad, "base64").toString("utf8")) as AdminSession;
    if (!admin.isAdmin || !admin.verified || admin.exp < Math.floor(Date.now() / 1000)) return null;
    const { url, key } = config();
    const response = await fetch(`${url}/rest/v1/nur_users?id=eq.${encodeURIComponent(admin.id)}&select=is_admin,tier`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const rows = await response.json() as Array<{ is_admin?: boolean }>;
    return rows[0]?.is_admin === true ? admin : null;
  } catch { return null; }
}

function config() {
  // ★ URL NORMALİZASYONU (fetch failed çözümü)
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim().replace(/^["']+|["']+$/g, "").replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) throw new Error("Supabase sunucu ayarları eksik");
  return { url, key };
}

async function db<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { url, key } = config();
  const response = await fetch(`${url}/rest/v1/${path}`, { ...init, headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...(init.headers || {}) } });
  const text = await response.text();
  if (!response.ok) throw new Error(text || `Supabase ${response.status}`);
  return (text ? JSON.parse(text) : null) as T;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  const admin = await adminFromCookie(req);
  if (!admin) return res.status(403).json({ ok: false, error: "Admin yetkisi gerekli" });
  
  // ★ Admin rate limit (dakikada 100 işlem)
  if (!(await adminRateLimit(admin.id, 100, 60000))) {
    return res.status(429).json({ ok: false, error: "Çok fazla istek, lütfen bekleyin" });
  }

  const body = req.body || {};
  const action = String(body.action || "").slice(0, 32);
  try {
    // ★ Ödeme RPC sağlık kontrolü: nur_grant_video_rights fonksiyonu var mı?
    //   Yoksa admin panele uyarı gider — lansmanda ilk ödeme hakkı yazılamaz diye.
    if (action === "check_rpc_health") {
      let rpcOk = false;
      let rpcDetail = "";
      try {
        const probe = await db<any>("rpc/nur_grant_video_rights", {
          method: "POST",
          // ★ Gerçek imzayla test: (p_user_id text, p_video_kind text, p_amount integer)
          //   Eski { p_rights } parametresi fonksiyonda yoktu → PostgREST
          //   "function not found" dönüyor, panel yanlış alarm veriyordu.
          body: JSON.stringify({ p_user_id: "00000000-0000-0000-0000-000000000000", p_video_kind: "kisa", p_amount: 0 }),
        });
        rpcOk = true; // 200 döndüyse fonksiyon mevcut (kullanıcı bulunamadı hatası bile olsa RPC çalışıyor demektir)
        rpcDetail = typeof probe === "object" ? JSON.stringify(probe).slice(0, 200) : "ok";
      } catch (e) {
    await logServerError(req, e, "api/admin/action");
        const msg = e instanceof Error ? e.message : String(e);
        // PostgREST 404 = fonksiyon yok; diğer hatalar RPC var demektir
        if (msg.includes("404") || msg.includes("Could not find the function")) {
          rpcOk = false;
          rpcDetail = "RPC bulunamadı — supabase/video_rights.sql çalıştırılmalı";
        } else {
          rpcOk = true;
          rpcDetail = msg.slice(0, 200);
        }
      }
      return res.status(200).json({ ok: true, rpc: { ok: rpcOk, detail: rpcDetail } });
    }
    if (action === "list_users") {
      const users = await db<any[]>("nur_users?select=id,email,name,tier,is_admin,updated_at&order=updated_at.desc");
      const wallets = await db<any[]>("nur_wallets?select=user_id,sub_jeton,purchased_jeton");
      const walletMap = new Map(wallets.map((wallet) => [wallet.user_id, wallet]));
      return res.status(200).json({ ok: true, users: users.map((user) => ({ ...user, wallet: walletMap.get(user.id) ?? null })) });
    }
    if (action === "publish_announcement") {
      const item = body.announcement || {};
      const title = sanitize(item.title, 160);
      const message = sanitize(item.message, 500);
      if (!title || !message) return res.status(400).json({ ok: false, error: "Başlık ve mesaj gerekli" });
      const kind = ["info", "update", "warning"].includes(item.kind) ? item.kind : "update";
      await db("nur_announcements", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ title, message, detail: sanitize(item.detail, 5000), kind, active: true, blinking: item.blinking !== false, force_open: Boolean(item.forceOpen), require_ack: Boolean(item.requireAck), starts_at: item.startsAt, ends_at: item.endsAt, created_by: admin.email }) });
    } else if (action === "set_feature_lock") {
      const featureId = validateId(body.featureId);
      if (!featureId) return res.status(400).json({ ok: false, error: "Geçersiz feature ID" });
      const lockLevel = ["free", "pro", "elit", "v2", "v3", "maintenance", "off"].includes(body.lockLevel) ? body.lockLevel : "free";
      await db("nur_feature_locks?on_conflict=feature_id", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify({ feature_id: featureId, lock_level: lockLevel, active: true, updated_by: admin.email, updated_at: new Date().toISOString() }) });
    } else if (action === "change_tier") {
      const email = validateEmail(body.target);
      if (!email) return res.status(400).json({ ok: false, error: "Geçersiz e-posta" });
      const tier = validateTier(body.tier);
      if (!tier) return res.status(400).json({ ok: false, error: "Geçersiz tier" });
      // ★ Tier değiştir + cüzdanı sıfırla (eğer free'ye düşürülüyorsa)
      await db(`nur_users?email=eq.${encodeURIComponent(email)}`, { method: "PATCH", body: JSON.stringify({ tier, updated_at: new Date().toISOString() }) });
      if (tier === "free") {
        // Free'ye düşürürken satın alınan hakları ve aboneliği sıfırla
        const users = await db<any[]>(`nur_users?email=eq.${encodeURIComponent(email)}&select=id`);
        if (users[0]?.id) {
          await db(`nur_wallets?user_id=eq.${encodeURIComponent(users[0].id)}`, { method: "PATCH", body: JSON.stringify({ purchased_kisa: 0, purchased_uzun: 0, purchased_tam: 0, sub_jeton: 0, purchased_jeton: 0, updated_at: new Date().toISOString() }) }).catch(() => null);
          await db(`nur_subscriptions?user_id=eq.${encodeURIComponent(users[0].id)}&status=eq.active`, { method: "PATCH", body: JSON.stringify({ status: "cancelled" }) }).catch(() => null);
        }
      }
    } else if (action === "change_jeton") {
      const email = validateEmail(body.target);
      if (!email) return res.status(400).json({ ok: false, error: "Geçersiz e-posta" });
      const total = Math.max(0, Math.min(1000000, Number(body.total) || 0));
      const users = await db<any[]>(`nur_users?email=eq.${encodeURIComponent(email)}&select=id`);
      if (!users[0]) return res.status(404).json({ ok: false, error: "Kullanıcı bulunamadı" });
      const uid = users[0].id as string;
      // ★ Cüzdan yoksa OLUŞTUR (PATCH 0 satır günceller ve sessizce başarısız olurdu)
      await db("nur_wallets?on_conflict=user_id", { method: "POST", headers: { Prefer: "resolution=ignore-duplicates,return=minimal" }, body: JSON.stringify({ user_id: uid }) }).catch(() => null);
      // ★ HEDİYE MODU: mevcut bakiyenin ÜZERİNE ekler, satın alınan jetonlara DOKUNMAZ.
      //   set: total = mutlak değer; gift: delta = eklenecek miktar
      if (body.mode === "gift") {
        const delta = Math.max(0, Math.min(1000000, Number(body.delta) || 0));
        const wallets = await db<any[]>(`nur_wallets?user_id=eq.${encodeURIComponent(uid)}&select=sub_jeton`);
        const current = wallets[0]?.sub_jeton ?? 0;
        await db(`nur_wallets?user_id=eq.${encodeURIComponent(uid)}`, { method: "PATCH", body: JSON.stringify({ sub_jeton: current + delta, updated_at: new Date().toISOString() }) });
      } else {
        await db(`nur_wallets?user_id=eq.${encodeURIComponent(uid)}`, { method: "PATCH", body: JSON.stringify({ sub_jeton: total, updated_at: new Date().toISOString() }) });
      }
    } else if (action === "gift_rights") {
      // ★ TEK İSTEKLE TAM HEDİYE: tier + jeton + (opsiyonel) üretim hakları — atomik
      const email = validateEmail(body.target);
      if (!email) return res.status(400).json({ ok: false, error: "Geçersiz e-posta" });
      const tier = body.tier ? validateTier(body.tier) : null;
      if (body.tier && !tier) return res.status(400).json({ ok: false, error: "Geçersiz tier" });
      const deltaJeton = Math.max(0, Math.min(1000000, Number(body.deltaJeton) || 0));
      const kisa = Math.max(0, Math.min(10000, Number(body.kisa) || 0));
      const uzun = Math.max(0, Math.min(10000, Number(body.uzun) || 0));
      const tam = Math.max(0, Math.min(10000, Number(body.tam) || 0));
      const users = await db<any[]>(`nur_users?email=eq.${encodeURIComponent(email)}&select=id`);
      if (!users[0]) return res.status(404).json({ ok: false, error: "Kullanıcı bulunamadı — önce siteye girsin" });
      const uid = users[0].id as string;
      if (tier) {
        await db(`nur_users?id=eq.${encodeURIComponent(uid)}`, { method: "PATCH", body: JSON.stringify({ tier, updated_at: new Date().toISOString() }) });
      }
      await db("nur_wallets?on_conflict=user_id", { method: "POST", headers: { Prefer: "resolution=ignore-duplicates,return=minimal" }, body: JSON.stringify({ user_id: uid }) }).catch(() => null);
      const wallets = await db<any[]>(`nur_wallets?user_id=eq.${encodeURIComponent(uid)}&select=sub_jeton,purchased_kisa,purchased_uzun,purchased_tam`);
      const w = wallets[0] ?? { sub_jeton: 0, purchased_kisa: 0, purchased_uzun: 0, purchased_tam: 0 };
      await db(`nur_wallets?user_id=eq.${encodeURIComponent(uid)}`, { method: "PATCH", body: JSON.stringify({
        sub_jeton: (w.sub_jeton ?? 0) + deltaJeton,
        purchased_kisa: (w.purchased_kisa ?? 0) + kisa,
        purchased_uzun: (w.purchased_uzun ?? 0) + uzun,
        purchased_tam: (w.purchased_tam ?? 0) + tam,
        updated_at: new Date().toISOString(),
      }) });
      // ★ KRİTİK: Üretim yetkisi nur_video_rights tablosundan okunuyor (wallet + consume RPC).
      //   Hediye oraya da yazılmalı yoksa kullanıcı hakki olduğu halde üretemez.
      //   Jeton = kısa video hakkı olarak işlenir; kisa/uzun/tam doğrudan kendi türüne eklenir.
      // ★ DOĞRULAMalı SÜRÜM: RPC hataları artık sessizce yutulmaz — sonuçlar yanıtta döner.
      const sb = config();
      const warnings: string[] = [];
      if (sb) {
        const grants: Array<[string, number]> = [["kisa", kisa + deltaJeton], ["uzun", uzun], ["tam", tam]];
        for (const [kind, amount] of grants) {
          if (amount <= 0) continue;
          try {
            const rpcRes = await fetch(`${sb.url}/rest/v1/rpc/nur_grant_video_rights`, {
              method: "POST",
              headers: { apikey: sb.key, Authorization: `Bearer ${sb.key}`, "Content-Type": "application/json" },
              body: JSON.stringify({ p_user_id: uid, p_video_kind: kind, p_amount: amount }),
            });
            if (!rpcRes.ok) {
              const errText = await rpcRes.text().catch(() => "");
              warnings.push(`${kind}: RPC ${rpcRes.status} ${errText.slice(0, 120)}`);
            }
          } catch (e) {
            warnings.push(`${kind}: RPC ağ hatası`);
          }
        }
      } else {
        warnings.push("Supabase yapılandırması eksik — üretim hakları yazılamadı");
      }
      await db("nur_admin_audit_logs", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ admin_id: admin.id, admin_email: admin.email, action: "gift_rights", target: email, created_at: new Date().toISOString() }) }).catch(() => null);
      // ★ Sonucu geri oku: cüzdan + video hakları — panel gerçek durumu görsün
      const walletsAfter = await db<any[]>(`nur_wallets?user_id=eq.${encodeURIComponent(uid)}&select=sub_jeton,purchased_jeton`).catch(() => [] as any[]);
      const rightsAfter = await db<any[]>(`nur_video_rights?user_id=eq.${encodeURIComponent(uid)}&select=video_kind,remaining`).catch(() => [] as any[]);
      const rightsMap: Record<string, number> = { kisa: 0, uzun: 0, tam: 0 };
      for (const r of rightsAfter) rightsMap[r.video_kind] = r.remaining;
      return res.status(200).json({
        ok: warnings.length === 0,
        balance: (walletsAfter[0]?.sub_jeton ?? 0) + (walletsAfter[0]?.purchased_jeton ?? 0),
        rights: rightsMap,
        warnings,
      });
    } else if (action === "ban_user") {
      const email = validateEmail(body.target);
      if (!email) return res.status(400).json({ ok: false, error: "Geçersiz e-posta" });
      const reason = sanitize(body.reason, 500) || "Admin kararı";
      // ★ user_id de yaz — video/sign ban kontrolünü user_id ile yapar; sadece
      //   user_email yazılırsa imzalı videolar banlının elinde kalır (kök hata).
      const banUsers = await db<any[]>(`nur_users?email=eq.${encodeURIComponent(email)}&select=id`).catch(() => [] as any[]);
      const banUid = banUsers[0]?.id ?? null;
      await db("nur_ban_logs", { method: "POST", body: JSON.stringify({ user_id: banUid, user_email: email, reason, banned_by: admin.email }) });
    } else if (action === "unban_user") {
      const email = validateEmail(body.target);
      if (!email) return res.status(400).json({ ok: false, error: "Geçersiz e-posta" });
      await db(`nur_ban_logs?user_email=eq.${encodeURIComponent(email)}&unbanned=eq.false`, { method: "PATCH", body: JSON.stringify({ unbanned: true }) });
    } else if (action === "delete_announcement") {
      const announcementId = body.announcementId ? validateId(body.announcementId) : null;
      if (body.announcementId && !announcementId) return res.status(400).json({ ok: false, error: "Geçersiz ID" });
      if (announcementId) {
        await db(`nur_announcements?id=eq.${encodeURIComponent(announcementId)}`, { method: "PATCH", body: JSON.stringify({ active: false }) });
      } else {
        await db("nur_announcements?active=eq.true", { method: "PATCH", body: JSON.stringify({ active: false }) });
      }
    } else if (action === "clear_all_announcements") {
      await db("nur_announcements?active=eq.true", { method: "PATCH", body: JSON.stringify({ active: false }) });
    } else if (action === "set_maintenance") {
      const startsAt = typeof body.startsAt === "string" ? body.startsAt.slice(0, 40) : "";
      const endsAt = typeof body.endsAt === "string" ? body.endsAt.slice(0, 40) : "";
      const message = sanitize(body.message, 300) || "Nûr Stüdyo daha güvenli, hızlı ve yeni özelliklerle güncelleniyor. Bakım tamamlandığında site otomatik olarak yeniden açılacaktır.";
      if (body.enabled !== true && body.enabled !== false) return res.status(400).json({ ok: false, error: "Bakım durumu geçersiz" });
      if (startsAt && Number.isNaN(Date.parse(startsAt))) return res.status(400).json({ ok: false, error: "Başlangıç zamanı geçersiz" });
      if (endsAt && Number.isNaN(Date.parse(endsAt))) return res.status(400).json({ ok: false, error: "Bitiş zamanı geçersiz" });
      if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) return res.status(400).json({ ok: false, error: "Bitiş zamanı başlangıçtan sonra olmalı" });
      await db("nur_site_settings?on_conflict=key", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({ key: "maintenance", value: { enabled: body.enabled, startsAt, endsAt, message }, updated_by: admin.email, updated_at: new Date().toISOString() }),
      });
    } else if (action === "reset_single_right") {
      // ★ TEK HAK SIFIRLA — suçun boyutuna göre kısmi ceza (tümü değil).
      //   kind: kisa | uzun | tam → nur_video_rights'ta o türün kalanını 0'lar.
      //   Ayrıca iptal_reason=true ise aktif aboneliği de iptal eder.
      const email = validateEmail(body.target);
      if (!email) return res.status(400).json({ ok: false, error: "Geçersiz e-posta" });
      const kind = String(body.kind || "");
      if (!("kisa uzun tam".split(" ")).includes(kind)) return res.status(400).json({ ok: false, error: "Geçersiz hak türü" });
      const users = await db<any[]>(`nur_users?email=eq.${encodeURIComponent(email)}&select=id`);
      if (!users[0]?.id) return res.status(404).json({ ok: false, error: "Kullanıcı bulunamadı" });
      const uid = users[0].id;
      // nur_video_rights satırı yoksa oluştur (remaining=0) — upsert
      await db("nur_video_rights?on_conflict=user_id,video_kind", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify({ user_id: uid, video_kind: kind, remaining: 0, updated_at: new Date().toISOString() }) }).catch(() => null);
      let subIptal = false;
      if (body.cancelSubscription === true) {
        await db(`nur_subscriptions?user_id=eq.${encodeURIComponent(uid)}&status=eq.active`, { method: "PATCH", body: JSON.stringify({ status: "cancelled" }) }).catch(() => null);
        subIptal = true;
      }
      return res.status(200).json({ ok: true, kind, subscriptionCancelled: subIptal });
    } else if (action === "reset_rights") {
      // ★ TÜM HAKLARI SIFIRLA — tier, cüzdan, abonelik hepsini temizle
      const email = validateEmail(body.target);
      if (!email) return res.status(400).json({ ok: false, error: "Geçersiz e-posta" });
      // 1) Tier'ı free yap
      await db(`nur_users?email=eq.${encodeURIComponent(email)}`, { method: "PATCH", body: JSON.stringify({ tier: "free", updated_at: new Date().toISOString() }) });
      // 2) Kullanıcıyı bul
      const users = await db<any[]>(`nur_users?email=eq.${encodeURIComponent(email)}&select=id`);
      if (users[0]?.id) {
        const uid = users[0].id;
        // 3) Eski cüzdan tablosunu da temizle (geriye uyumluluk)
        await db(`nur_wallets?user_id=eq.${encodeURIComponent(uid)}`, { method: "PATCH", body: JSON.stringify({ purchased_kisa: 0, purchased_uzun: 0, purchased_tam: 0, sub_jeton: 0, purchased_jeton: 0, updated_at: new Date().toISOString() }) }).catch(() => null);
        // 4) ★ ASIL PAKET HAKLARI: nur_video_rights remaining=0 — wallet API hakları
        //    BU tablodan okur (bkz. api/payments/wallet.ts); nur_wallets sıfırlamak
        //    paket haklarını SIFIRLAMAZ, iki tablo da temizlenmeli.
        await db(`nur_video_rights?user_id=eq.${encodeURIComponent(uid)}`, { method: "PATCH", body: JSON.stringify({ remaining: 0, updated_at: new Date().toISOString() }) }).catch(() => null);
        // 5) Günlük üyelik kullanım kaydını da temizle
        await db(`nur_daily_usage?user_id=eq.${encodeURIComponent(uid)}`, { method: "DELETE" }).catch(() => null);
        // 6) Aktif aboneliği iptal et
        await db(`nur_subscriptions?user_id=eq.${encodeURIComponent(uid)}&status=eq.active`, { method: "PATCH", body: JSON.stringify({ status: "cancelled" }) }).catch(() => null);
      }
    } else if (action === "user_history") {
      // ★ KULLANICI GEÇMİŞİ — Email ile gir, son 10 siparişi + cüzdan durumunu gör
      const email = validateEmail(body.target);
      if (!email) return res.status(400).json({ ok: false, error: "Geçersiz e-posta" });
      const users = await db<any[]>(`nur_users?email=eq.${encodeURIComponent(email)}&select=id,email,name,tier,created_at,updated_at`);
      if (!users[0]) return res.status(200).json({ ok: true, user: null, orders: [], wallet: null });
      const uid = users[0].id;
      // ★ Tablodaki gerçek kolonlar: id, product_code, amount_minor, currency, provider, status, paid_at, created_at
      //   (olmayan kolon istenirse PostgREST 400 döner ve tüm geçmiş çökerdi)
      const [orders, wallets, subs, auditLogs] = await Promise.all([
        db<any[]>(`nur_orders?user_id=eq.${encodeURIComponent(uid)}&select=id,product_code,amount_minor,currency,provider,status,paid_at,created_at&order=created_at.desc&limit=10`).catch(() => [] as any[]),
        db<any[]>(`nur_wallets?user_id=eq.${encodeURIComponent(uid)}&select=purchased_kisa,purchased_uzun,purchased_tam,sub_jeton,purchased_jeton,updated_at`).catch(() => [] as any[]),
        db<any[]>(`nur_subscriptions?user_id=eq.${encodeURIComponent(uid)}&select=product_code,status,expires_at,created_at&order=created_at.desc&limit=5`).catch(() => [] as any[]),
        db<any[]>(`nur_admin_audit_logs?target=eq.${encodeURIComponent(email)}&select=action,admin_email,created_at&order=created_at.desc&limit=10`).catch(() => [] as any[]),
      ]);
      return res.status(200).json({ ok: true, user: users[0], orders, wallet: wallets[0] || null, subscriptions: subs, auditLogs });
    } else if (action === "list_errors") {
      // ★ HATA LOGLARI — son 500 hata (sayfalama client'ta) + 24 saatlik istatistik
      //   kind/user_email kolonları hata türü + kim yaşadı bilgisini taşır
      const [rows, stats] = await Promise.all([
        db<any[]>("nur_error_logs?select=id,message,stack,path,source,user_agent,fingerprint,kind,user_email,created_at&order=created_at.desc&limit=500").catch(() => [] as any[]),
        db<any[]>("nur_error_logs?select=fingerprint,created_at&created_at=gte." + new Date(Date.now() - 24 * 3600_000).toISOString()).catch(() => [] as any[]),
      ]);
      // 24 saatlik özet: toplam + benzersiz hata sayısı + tür dağılımı
      const toplam24 = stats.length;
      const benzersiz = new Set(stats.map((r) => r.fingerprint)).size;
      const turDagilimi: Record<string, number> = {};
      for (const r of rows) { const k = String(r.kind || "genel"); turDagilimi[k] = (turDagilimi[k] || 0) + 1; }
      return res.status(200).json({ ok: true, errors: rows, stats: { total24h: toplam24, unique24h: benzersiz, turDagilimi } });
    } else if (action === "list_feedback") {
      // ★ GERİ BİLDİRİMLER — son 50 mesaj + tür/puan dağılımı (sadece admin)
      const [rows, turRows, puanRows] = await Promise.all([
        db<any[]>("nur_feedback?select=id,user_name,user_email,tur,puan,mesaj,created_at,admin_yanit,yanit_at,yanit_admin,mail_gonderildi,mail_hata&order=created_at.desc&limit=50").catch(() => [] as any[]),
        db<any[]>("nur_feedback?select=tur").catch(() => [] as any[]),
        db<any[]>("nur_feedback?select=puan&puan=not.is.null").catch(() => [] as any[]),
      ]);
      const turDagilimi: Record<string, number> = { oneri: 0, ozellik: 0, sikayet: 0, diger: 0 };
      for (const r of turRows) { const t = String(r.tur || "diger"); turDagilimi[t] = (turDagilimi[t] || 0) + 1; }
      const puanDagilimi: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      for (const r of puanRows) { const p = Number(r.puan); if (p >= 1 && p <= 5) puanDagilimi[p] += 1; }
      const puanlanan = puanRows.length;
      const ortalama = puanlanan ? puanRows.reduce((s, r) => s + Number(r.puan || 0), 0) / puanlanan : 0;
      return res.status(200).json({
        ok: true,
        feedback: rows,
        turDagilimi,
        puanDagilimi,
        puanOrtalama: Math.round(ortalama * 10) / 10,
        toplam: turRows.length,
      });
    } else if (action === "hafta_video_list") {
      // ★ HAFTANIN VİDEOSU — admin vitrin yönetimi: beklemede + onaylı + ret (son 100)
      const rows = await db<any[]>("nur_haftanin_videolari?select=id,user_ad,baslik,aciklama,video_link,sure_bilgi,durum,onay_yok_sebep,hafta,begeni,created_at&order=created_at.desc&limit=100").catch(() => [] as any[]);
      return res.status(200).json({ ok: true, videolar: rows });
    } else if (action === "hafta_video_onay") {
      // Onayla veya reddet (sebep ile)
      const id = validateId(body.id);
      if (!id) return res.status(400).json({ ok: false, error: "Geçersiz video" });
      const durum = body.durum === "onayli" || body.durum === "reddedildi" ? String(body.durum) : "";
      if (!durum) return res.status(400).json({ ok: false, error: "Geçersiz durum" });
      const sebep = sanitize(body.sebep, 200);
      await db(`nur_haftanin_videolari?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({
        durum, onay_yok_sebep: durum === "reddedildi" ? sebep || "Admin kararı" : "", onaylayan: admin.email, onay_at: new Date().toISOString(),
      }) });
      await db("nur_admin_audit_logs", { method: "POST", body: JSON.stringify({ admin_id: admin.id, admin_email: admin.email, action: `hafta_video_${durum}`, target: id, created_at: new Date().toISOString() }) }).catch(() => null);
      return res.status(200).json({ ok: true });
    } else if (action === "hafta_video_sil") {
      const id = validateId(body.id);
      if (!id) return res.status(400).json({ ok: false, error: "Geçersiz video" });
      await db(`nur_haftanin_videolari?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
      return res.status(200).json({ ok: true });
    } else if (action === "haftalik_rapor") {
      // ★ İŞ 25 — HAFTALIK RAPOR: 7 günlük özet (kullanıcı, ödeme, içerik, hata)
      const haftaOnce = new Date(Date.now() - 7 * 86_400_000).toISOString();
      const [yeniKullanicilar, aktifKullanicilar, odemeler, cuzdanlar, pageViews, hatalar, feedbackler, oylar, davetler, zikirler, haftaVideolari] = await Promise.all([
        db<any[]>(`nur_users?select=id&created_at=gte.${haftaOnce}`).catch(() => [] as any[]),
        db<any[]>(`nur_users?select=id,updated_at&updated_at=gte.${haftaOnce}`).catch(() => [] as any[]),
        db<any[]>(`nur_orders?select=id,amount_minor,currency,status&paid_at=gte.${haftaOnce}&status=eq.paid`).catch(() => [] as any[]),
        db<any[]>("nur_wallets?select=user_id,sub_jeton,purchased_jeton").catch(() => [] as any[]),
        db<any[]>(`nur_page_views?select=id&created_at=gte.${haftaOnce}`).catch(() => [] as any[]),
        db<any[]>(`nur_error_logs?select=id&created_at=gte.${haftaOnce}`).catch(() => [] as any[]),
        db<any[]>(`nur_feedback?select=id,tur,puan&created_at=gte.${haftaOnce}`).catch(() => [] as any[]),
        db<any[]>("nur_roadmap_votes?select=feature_id").catch(() => [] as any[]),
        db<any[]>(`nur_referans_kullanim?select=id&created_at=gte.${haftaOnce}`).catch(() => [] as any[]),
        db<any[]>("nur_zikir_topluluk?select=toplam").catch(() => [] as any[]),
        db<any[]>(`nur_haftanin_videolari?select=id,durum&created_at=gte.${haftaOnce}`).catch(() => [] as any[]),
      ]);
      const ciroMinor = odemeler.reduce((s, o) => s + Number(o.amount_minor || 0), 0);
      const ciroPara = odemeler[0]?.currency || "TRY";
      const oylarDagilim: Record<string, number> = {};
      for (const v of oylar) oylarDagilim[v.feature_id] = (oylarDagilim[v.feature_id] || 0) + 1;
      const liderOylar = Object.entries(oylarDagilim).sort((a, b) => b[1] - a[1]).slice(0, 5)
        .map(([fid, adet]) => ({ ozellik: fid, adet }));
      const toplamZikir = zikirler.reduce((s, z) => s + Number(z.toplam || 0), 0);
      const puanOrt = feedbackler.filter((f) => f.puan).length
        ? Math.round((feedbackler.filter((f) => f.puan).reduce((s, f) => s + Number(f.puan), 0) / feedbackler.filter((f) => f.puan).length) * 10) / 10 : 0;
      return res.status(200).json({
        ok: true,
        rapor: {
          tarihAraligi: { baslangic: haftaOnce, bitis: new Date().toISOString() },
          kullanicilar: {
            yeniKayit: yeniKullanicilar.length,
            aktif7gun: aktifKullanicilar.length,
            toplamCuzdan: cuzdanlar.length,
            toplamJeton: cuzdanlar.reduce((s, c) => s + Number(c.sub_jeton || 0) + Number(c.purchased_jeton || 0), 0),
          },
          gelir: { odemeAdedi: odemeler.length, ciroMinor, paraBirimi: ciroPara, ciroOkunur: (ciroMinor / 100).toFixed(2) + " " + ciroPara },
          trafik: { sayfaGoruntuleme: pageViews.length, hataSayisi: hatalar.length },
          topluluk: {
            feedbackAdet: feedbackler.length, feedbackPuanOrtalama: puanOrt,
            oyToplam: oylar.length, oyLiderler: liderOylar,
            davetSayisi: davetler.length, toplamZikir,
            haftaVideoOneri: haftaVideolari.length,
            haftaVideoOnayli: haftaVideolari.filter((v) => v.durum === "onayli").length,
          },
        },
      });
    } else if (action === "clear_errors") {
      // ★ HATA LOGLARINI TEMİZLE — 30 günden eski kayıtları sil
      await db(`nur_error_logs?created_at=lt.${new Date(Date.now() - 30 * 24 * 3600_000).toISOString()}`, { method: "DELETE" }).catch(() => null);
      return res.status(200).json({ ok: true });
    } else if (action === "clear_all_errors") {
      // ★ TÜM hata kayıtlarını sil (admin onaylı) — PostgREST filtresiz DELETE reddettiği için id=neq.0 hilesi
      await db("nur_error_logs?id=neq.0", { method: "DELETE" }).catch(() => null);
      return res.status(200).json({ ok: true });
    } else if (action === "delete_error") {
      // ★ TEK hata kaydını sil (satır bazlı çöp kutusu)
      const logId = String(body.id || "").replace(/[^0-9a-zA-Z_-]/g, "").slice(0, 64);
      if (!logId) return res.status(400).json({ ok: false, error: "Geçersiz kayıt" });
      await db(`nur_error_logs?id=eq.${encodeURIComponent(logId)}`, { method: "DELETE" }).catch(() => null);
      return res.status(200).json({ ok: true });
    } else if (action === "feedback_reply") {
      // ★ GERİ BİLDİRİM YANITI (28.09): admin panelden cevap yaz → DB'ye kaydet →
      //   kullanıcıya Resend ile e-posta gönder. Misafir mesajlarında e-posta
      //   yoksa yanıt kaydedilir ama mail gönderilemez (dürüst yanıt).
      const fbId = String(body.id || "").replace(/[^0-9]/g, "").slice(0, 20);
      const yanit = sanitize(body.yanit, 2000);
      if (!fbId || !yanit) return res.status(400).json({ ok: false, error: "Mesaj kimliği ve yanıt metni gerekli" });
      const rows = await db<any[]>(`nur_feedback?id=eq.${fbId}&select=id,user_email,user_name,mesaj,tur`).catch(() => [] as any[]);
      const fb = rows[0];
      if (!fb) return res.status(404).json({ ok: false, error: "Geri bildirim bulunamadı" });
      // 1) Yanıtı kaydet (mail başarısız olsa da kayıt kalır — durum dürüst tutulur)
      await db(`nur_feedback?id=eq.${fbId}`, { method: "PATCH", body: JSON.stringify({ admin_yanit: yanit, yanit_at: new Date().toISOString(), yanit_admin: admin.email, mail_gonderildi: false }) });
      let mailGitti = false;
      let mailHata = "";
      const resendKey = process.env.RESEND_API_KEY || "";
      const alıcıEmail = String(fb.user_email || "").toLowerCase().trim();
      if (!alıcıEmail || !alıcıEmail.includes("@")) {
        mailHata = "kullanıcı e-postasız (misafir)";
      } else if (!resendKey) {
        mailHata = "RESEND_API_KEY tanımlı değil";
      } else {
        try {
          const isim = String(fb.user_name || "").slice(0, 60) || "Değerli kullanıcı";
          const turEtiket = fb.tur === "sikayet" ? "Şikayetiniz" : fb.tur === "ozellik" ? "Özellik öneriniz" : fb.tur === "oneri" ? "Öneriniz" : "Mesajınız";
          const yanitHtml =
            `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;background:#0d0f16;color:#e8e6f0;border-radius:16px;overflow:hidden;border:1px solid #2a2d3a">` +
            `<div style="background:linear-gradient(135deg,#d7aa52,#f5dda6);padding:18px 24px"><h2 style="margin:0;font-size:17px;color:#141414">Nûr Stüdyo — Yanıtınız 🌙</h2></div>` +
            `<div style="padding:22px 24px">` +
            `<p style="margin:0 0 12px;font-size:13px;color:#c9c6d4">Merhaba <b style="color:#f5dda6">${isim}</b>,</p>` +
            `<p style="margin:0 0 14px;font-size:13px;line-height:1.6;color:#c9c6d4">Nûr Stüdyo'ya ilettiğiniz <b>${turEtiket}</b> için teşekkür ederiz. Ekibimiz mesajınızı inceledi:</p>` +
            `<blockquote style="margin:0 0 16px;padding:10px 14px;border-left:3px solid #d7aa52;background:#161925;font-size:12px;color:#a8a4b8;font-style:italic">${String(fb.mesaj || "").slice(0, 400).replace(/[<>]/g, "")}</blockquote>` +
            `<div style="padding:14px 16px;border-radius:12px;background:#1b1f2e;border:1px solid #d7aa52aa;font-size:13px;line-height:1.7;color:#f0eee8">${yanit.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c] || c)).replace(/\n/g, "<br>")}</div>` +
            `<p style="margin:18px 0 0;font-size:12px;color:#8f8ca0">İyi çalışmalar dileriz,<br><b style="color:#d7aa52">Nûr Stüdyo Ekibi</b></p>` +
            `</div>` +
            `<div style="padding:12px 24px;background:#0a0c12;font-size:10px;color:#5f5c70;text-align:center">Bu e-posta, nurstudyo.com'daki geri bildiriminize yanıt olarak gönderilmiştir.</div></div>`;
          const r = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              from: process.env.MARKETING_FROM_EMAIL || "Nûr Stüdyo <bildirim@nurstudyo.com>",
              to: [alıcıEmail],
              subject: `Nûr Stüdyo — geri bildiriminiz yanıtlandı 🌙`,
              html: yanitHtml,
            }),
          });
          if (r.ok) mailGitti = true; else mailHata = `resend ${r.status}`;
        } catch (e) {
          mailHata = String((e as Error).message || e).slice(0, 120);
        }
      }
      await db(`nur_feedback?id=eq.${fbId}`, { method: "PATCH", body: JSON.stringify({ mail_gonderildi: mailGitti, mail_hata: mailHata }) });
      return res.status(200).json({ ok: true, mailGitti, mailHata });
    } else return res.status(400).json({ ok: false, error: "Geçersiz admin işlemi" });
    await db("nur_admin_audit_logs", { method: "POST", body: JSON.stringify({ admin_id: admin.id, admin_email: admin.email, action, target: String(body.target || body.featureId || ""), metadata: { ip: String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim(), userAgent: String(req.headers["user-agent"] || "").slice(0, 300) } }) }).catch(() => null);
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("[Admin Action Error]", error);
    return res.status(500).json({ ok: false, error: "İşlem tamamlanamadı" });
  }
}
