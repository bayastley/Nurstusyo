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
  const secret = process.env.NUR_SESSION_SECRET || process.env.GOOGLE_CLIENT_SECRET || "";
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  const cfg = supabaseConfig();
  if (!cfg) return res.status(503).json({ ok: false, error: "Veritabanı yapılandırması eksik" });

  try {
    if (req.method === "GET") {
      // Özellikler + GERÇEK oy toplamları (tek sayaç DB'de)
      const [features, votes] = await Promise.all([
        db<any[]>("nur_roadmap_features?select=id,version,title,description,icon,active&order=created_at.asc").catch(() => [] as any[]),
        db<any[]>("nur_roadmap_votes?select=feature_id").catch(() => [] as any[]),
      ]);
      const counts: Record<string, number> = {};
      for (const v of votes) counts[v.feature_id] = (counts[v.feature_id] || 0) + 1;
      const session = getSession(req);
      let myVote: string | null = null;
      if (session) {
        const mine = await db<any[]>(`nur_roadmap_votes?user_id=eq.${encodeURIComponent(session.id)}&select=feature_id`).catch(() => [] as any[]);
        myVote = mine[0]?.feature_id ?? null;
      }
      return res.status(200).json({
        ok: true,
        v2: features.filter((f) => f.version === "V2" && f.active).map((f) => ({ ...f, desc: f.description, votes: counts[f.id] || 0 })),
        v3: features.filter((f) => f.version === "V3" && f.active).map((f) => ({ ...f, desc: f.description, votes: counts[f.id] || 0 })),
        myVote,
        totalVotes: votes.length,
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
      const feat = await db<any[]>(`nur_roadmap_features?id=eq.${encodeURIComponent(featureId)}&select=id,active`).catch(() => [] as any[]);
      if (!feat[0]?.active) return res.status(400).json({ ok: false, error: "Bu özellik oylamaya kapalı" });

      // Aynı özelliğe tekrar tıklandı → oyu kaldır (toggle)
      const mine = await db<any[]>(`nur_roadmap_votes?user_id=eq.${encodeURIComponent(session.id)}&select=feature_id`).catch(() => [] as any[]);
      if (mine[0]?.feature_id === featureId) {
        await db(`nur_roadmap_votes?user_id=eq.${encodeURIComponent(session.id)}`, { method: "DELETE" });
        return res.status(200).json({ ok: true, removed: true });
      }
      // Kullanıcı başına tek oy: mevcut kaydı GÜNCELLE (upsert)
      await db("nur_roadmap_votes?on_conflict=user_id", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify({ user_id: session.id, feature_id: featureId }),
      });
      return res.status(200).json({ ok: true });
    }

    if (req.method === "DELETE") {
      // Admin: özellik ekle/sil (sadece admin oturumu)
      const session = getSession(req);
      if (!session) return res.status(401).json({ ok: false, error: "Oturum gerekli" });
      // ★ FAIL-CLOSED (27.09 güvenlik taraması): adminEmails BOŞSA herkes admin
      //   olabiliyordu! Artık env tanımsızsa işlem MUTLAKA reddedilir.
      const adminEmails = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "").toLowerCase().split(",").map((e) => e.trim()).filter(Boolean);
      if (!adminEmails.length || !adminEmails.includes(session.email.toLowerCase())) {
        return res.status(403).json({ ok: false, error: "Admin yetkisi gerekli" });
      }
      const body = (req.body || {}) as Record<string, unknown>;
      const action = sanitize(body.action, 20);
      if (action === "delete") {
        const id = sanitize(body.id, 60);
        await db(`nur_roadmap_features?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
        return res.status(200).json({ ok: true });
      }
      if (action === "add") {
        const id = `custom-${Date.now()}`;
        await db("nur_roadmap_features", {
          method: "POST",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({ id, version: body.version === "V3" ? "V3" : "V2", title: sanitize(body.title, 80), description: sanitize(body.desc, 200), icon: "ai_arkaplan" }),
        });
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
        return res.status(200).json({ ok: true });
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
