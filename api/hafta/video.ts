import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto"; // ★ 27.09 FIX: require("crypto") ESM'de patlıyordu (type:module) — oturum okunamıyordu

// ─── Server error logger (gömülü — _shared Vercel'de paketlenmiyor) ───
async function logServerError(req: { url?: string; headers?: Record<string, string | string[] | undefined> }, error: unknown, endpoint: string): Promise<void> {
  try {
    const __url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim().replace(/\/$/, "");
    const __key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    if (!__url || !__key) return;
    const __msg = error instanceof Error ? error.message : String(error || "Bilinmeyen sunucu hatası");
    if (!__msg) return;
    const __stack = error instanceof Error ? error.stack || "" : "";
    const __path = String(req.url || endpoint).slice(0, 200);
    const __fingerprint = require("crypto").createHash("sha256").update(__msg + "|" + __path).digest("hex").slice(0, 16);
    await fetch(__url + "/rest/v1/nur_error_logs", {
      method: "POST",
      headers: { apikey: __key, Authorization: "Bearer " + __key, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        message: __msg.slice(0, 500),
        stack: __stack.slice(0, 4000),
        path: __path,
        source: ("server:" + endpoint).slice(0, 40),
        user_agent: String(req.headers?.["user-agent"] || "server").slice(0, 300),
        fingerprint: __fingerprint,
        kind: "genel",
        user_email: "",
      }),
    });
  } catch { /* log yazımı siteyi ASLA bozmaz */ }
}

// Self-contained rate limit (Upstash varsa paylaşımlı, yoksa in-memory)
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

declare const process: { env: Record<string, string | undefined> };

// ★ CSRF KORUMASI — yalnızca sitemizden gelen istekler kabul edilir (referans.ts ile aynı desen)
function requireAllowedOrigin(req: VercelRequest, res: VercelResponse): boolean {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";
  const referer = typeof req.headers.referer === "string" ? req.headers.referer : "";
  const allowed = new Set(["https://nurstudyo.com", "https://www.nurstudyo.com", "http://localhost:5173", "http://localhost:5174"]);
  if (!origin && !referer) return true; // same-origin fetch bazı tarayıcılarda boş gönderebilir
  if (origin && allowed.has(origin)) return true;
  if (referer) { try { if (allowed.has(new URL(referer).origin)) return true; } catch { /* ignore */ } }
  res.status(403).json({ ok: false, error: "İzin verilmeyen istek kaynağı" });
  return false;
}

// ════════════════════════════════════════════════════════
// HAFTANIN VİDEOSU — yol haritası madde 17
// GET  → onaylı vitrin (herkes) + benim önerilerim (oturumluysa)
// POST → öneri ekle (oturum şart, haftada 1) | begeni (oturum şart)
// Admin onay/ret → api/admin/action.ts içinde ayrı action ile
// SUNUCUDA VİDEO SAKLANMAZ — sadece metadata + paylaşım linki.
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

interface SessionInfo { id: string; email: string; name?: string }

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
    const user = JSON.parse(base64UrlDecode(payload).toString("utf8")) as { id: string; email: string; name?: string; exp?: number };
    if (!user.exp || user.exp < Math.floor(Date.now() / 1000)) return null;
    return { id: user.id, email: user.email, name: user.name };
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
    // ─── GET: onaylı vitrin + (oturumluysa) benim önerilerim ───
    if (req.method === "GET") {
      const hafta = typeof req.query.hafta === "string" ? req.query.hafta : null;
      const haftaFiltre = hafta && /^\d{4}-\d{2}-\d{2}$/.test(hafta) ? `&hafta=eq.${hafta}` : "";
      const [vitrin, benim] = await Promise.all([
        db<any[]>(`nur_haftanin_videolari?durum=eq.onayli&select=id,user_ad,baslik,aciklama,video_link,sure_bilgi,hafta,begeni,begenenler,onay_at&order=begeni.desc&limit=24${haftaFiltre}`).catch(() => [] as any[]),
        (() => {
          const session = getSession(req);
          if (!session) return Promise.resolve([] as any[]);
          return db<any[]>(`nur_haftanin_videolari?user_id=eq.${encodeURIComponent(session.id)}&select=id,baslik,aciklama,video_link,sure_bilgi,durum,onay_yok_sebep,hafta,created_at&order=created_at.desc&limit=8`).catch(() => [] as any[]);
        })(),
      ]);
      const session = getSession(req);
      return res.status(200).json({
        ok: true,
        vitrin: vitrin.map((v) => ({ ...v, begendim: session ? (v.begenenler || []).includes(session.id) : false, begenenler: undefined })),
        benim,
        oturumlu: !!session,
      });
    }

    // ─── POST: öneri ekle | begeni ───
    if (req.method === "POST") {
      if (!requireAllowedOrigin(req, res)) return;
      if (!(await rateLimit(req, res, "hafta-video", 12, 60_000))) return;
      const session = getSession(req);
      if (!session) return res.status(401).json({ ok: false, error: "Bu özellik için giriş yapmalısın" });
      const body = (req.body || {}) as Record<string, unknown>;
      const islem = sanitize(body.islem, 12) || "ekle";

      // ★ BEGENİ — oturumlu kullanıcı, toggle
      if (islem === "begeni") {
        const videoId = sanitize(body.videoId, 60);
        if (!videoId || !/^[0-9a-f-]{36}$/i.test(videoId)) return res.status(400).json({ ok: false, error: "Geçersiz video" });
        const rpc = await fetch(`${cfg.url}/rest/v1/rpc/nur_hafta_video_begen`, {
          method: "POST",
          headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}`, "Content-Type": "application/json" },
          body: JSON.stringify({ p_video_id: videoId, p_user_id: session.id }),
        });
        if (!rpc.ok) {
          const t = await rpc.text().catch(() => "");
          return res.status(500).json({ ok: false, error: `Begeni kaydedilemedi (${rpc.status}) ${t.slice(0, 100)}` });
        }
        const sonuc = await rpc.json() as Array<{ ok: boolean; begeni: number }>;
        return res.status(200).json({ ok: true, begeni: sonuc?.[0]?.begeni ?? 0 });
      }

      // ★ ÖNERİ EKLE — haftada 1
      const baslik = sanitize(body.baslik, 100);
      const aciklama = sanitize(body.aciklama, 500);
      const link = sanitize(body.video_link, 500);
      const sureBilgi = sanitize(body.sure_bilgi, 120);
      if (baslik.length < 4) return res.status(400).json({ ok: false, error: "Başlık en az 4 karakter olmalı" });
      // ★ LINK GÜVENLİĞİ: yalnız http(s) kabul — javascript:/data:/vbscript: gibi
      //   zararlı şemalar hem burada hem tarayıcıda (href injection) engellenir.
      if (!/^https?:\/\//i.test(link)) return res.status(400).json({ ok: false, error: "Video linki http(s) ile başlamalı" });
      try {
        const u = new URL(link);
        if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error("protokol");
      } catch {
        return res.status(400).json({ ok: false, error: "Geçersiz video linki" });
      }
      const rpc = await fetch(`${cfg.url}/rest/v1/rpc/nur_hafta_video_ekle`, {
        method: "POST",
        headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          p_user_id: session.id,
          p_user_ad: sanitize(session.name || session.email.split("@")[0], 40),
          p_baslik: baslik, p_aciklama: aciklama, p_link: link, p_sure: sureBilgi,
        }),
      });
      if (!rpc.ok) {
        const t = await rpc.text().catch(() => "");
        await logServerError(req, new Error(`hafta_video_ekle ${rpc.status}: ${t}`), "hafta/video");
        return res.status(500).json({ ok: false, error: `Öneri kaydedilemedi (${rpc.status})` });
      }
      const sonuc = await rpc.json() as Array<{ ok: boolean; error: string | null; id: string | null }>;
      const row = sonuc?.[0];
      if (!row?.ok) return res.status(400).json({ ok: false, error: row?.error || "Öneri kaydedilemedi" });
      return res.status(200).json({ ok: true, id: row.id, mesaj: "Önerin alındı — admin onayından sonra vitrinde yayınlanacak 🌟" });
    }

    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  } catch (e) {
    await logServerError(req, e, "hafta/video");
    console.error("[hafta/video]", e);
    return res.status(500).json({ ok: false, error: "İşlem tamamlanamadı" });
  }
}
