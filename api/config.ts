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

// Self-contained rate limit — _shared importları Vercel'de paketlenmediği için gömüldü
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


function supabaseConfig() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) throw new Error("Supabase sunucu ayarları eksik");
  return { url, key };
}

async function query<T>(path: string): Promise<T> {
  const { url, key } = supabaseConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" });
  if (!response.ok) throw new Error(await response.text());
  return await response.json() as T;
}

// ═════════════════════════════════════════════════════════
// ★ LANSMAN HAZIRLIĞI (28.09) — config = en sıcak endpoint.
//   Her açık sekme 60-90sn'de bir poll ediyor; lansmanda binlerce
//   sekme × 3 sorgu = DB kilitlenme riski. İki katman:
//   1) IN-MEMORY snapshot (45sn): aynı instance'a gelen tekrarlar
//      Supabase'e HİÇ gitmez; DB erişilemezse son sağlıklı snapshot
//      döner (site ayakta kalır — panel çökme sigortası felsefesi).
//   2) CDN s-maxage=45 + stale-while-revalidate=300: Vercel edge,
//      farklı instance'ları bile tek talebe indirger.
// ═════════════════════════════════════════════════════════
const CONFIG_TTL_MS = 45_000;
let cfgSnapshot: { at: number; body: unknown } | null = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ★ Snapshot taze ise DB'siz dön — lansman yükünde DB nefes alır
  if (req.method === "GET" && cfgSnapshot && Date.now() - cfgSnapshot.at < CONFIG_TTL_MS) {
    res.setHeader("Cache-Control", "public, max-age=15, s-maxage=45, stale-while-revalidate=300");
    return res.status(200).json(cfgSnapshot.body as Record<string, unknown>);
  }
  if (req.method !== "GET") { res.setHeader("Cache-Control", "no-store"); return res.status(405).json({ ok: false, error: "Method Not Allowed" }); }
  // ★ Merkezi rate limit — snapshot'a isabet eden istekler DB'ye değmediği
  //   için limit yalnız DB'ye gidecek talepleri yavaşlatır (dakikada 120)
  if (!(await rateLimit(req, res, "config", 120, 60_000))) return;
  try {
    const now = encodeURIComponent(new Date().toISOString());
    const [announcements, featureLocks, siteSettings] = await Promise.all([
      query<any[]>(`nur_announcements?active=eq.true&starts_at=lte.${now}&ends_at=gte.${now}&order=updated_at.desc&limit=1&select=*`),
      query<any[]>("nur_feature_locks?active=eq.true&select=feature_id,lock_level,updated_at"),
      query<any[]>("nur_site_settings?key=eq.maintenance&select=value,updated_at").catch(() => [] as any[]),
    ]);
    const maintenanceRow = Array.isArray(siteSettings) ? siteSettings[0] : null;
    const maintenanceValue = maintenanceRow?.value && typeof maintenanceRow.value === "object" ? { ...maintenanceRow.value, updated_at: maintenanceRow.updated_at } : null;
    const body = {
      ok: true,
      announcement: announcements[0] ?? null,
      featureLocks,
      maintenance: maintenanceValue,
    };
    cfgSnapshot = { at: Date.now(), body };
    res.setHeader("Cache-Control", "public, max-age=15, s-maxage=45, stale-while-revalidate=300");
    return res.status(200).json(body);
  } catch (error) {
    await logServerError(req, error, "api/config");
    console.error("[Public Config Error]", error);
    // ★ DB erişilemezse son sağlıklı snapshot ile cevapla — lansmanda config
    //   kaynağından dolayı TÜM SİTE kapanmasın (panel sigortası felsefesi).
    if (cfgSnapshot) {
      res.setHeader("Cache-Control", "public, max-age=10, s-maxage=30");
      return res.status(200).json(cfgSnapshot.body as Record<string, unknown>);
    }
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ ok: true, announcement: null, featureLocks: [], maintenance: null });
  }
}
