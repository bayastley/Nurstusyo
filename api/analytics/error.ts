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
    const __fingerprint = require("crypto").createHash("sha256").update(__msg + "|" + __path).digest("hex").slice(0, 16);
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


declare const process: { env: Record<string, string | undefined> };

// ════════════════════════════════════════════════════════
// ERROR TRACK — frontend hatalarını Supabase'e yazar.
// Lansman sonrası "kim nerede patladı" sorusuna cevap verir;
// Sentry gibi harici servise gerek kalmaz, maliyet sıfır.
// Tablo: nur_error_logs (message, stack, path, user_agent, created_at)
// ★ YENİ: hata Türü (video/payment/auth/...) + kullanıcı e-postası
//   kaydedilir → admin panelde "video üretim hatası — ahmet@gmail.com"
//   gibi okunur satırlar görünür.
// ════════════════════════════════════════════════════════

function supabaseConfig() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) return null;
  return { url, key };
}

function sanitize(input: unknown, max: number): string {
  if (!input || typeof input !== "string") return "";
  return input.trim().slice(0, max).replace(/[<>"';]/g, "");
}

// ★ Hata türü: mesaj + stack içeriğinden otomatik tahmin edilir
function detectKind(message: string, stack: string, path: string): string {
  const hay = `${message} ${stack} ${path}`.toLowerCase();
  if (hay.includes("iyzico") || hay.includes("payment") || hay.includes("checkout") || hay.includes("ödeme") || hay.includes("odeme")) return "payment";
  if (hay.includes("render") || hay.includes("video") || hay.includes("canvas") || hay.includes("mediarecorder") || hay.includes("ffmpeg") || hay.includes("capturestream")) return "video";
  if (hay.includes("auth") || hay.includes("google") || hay.includes("login") || hay.includes("session") || hay.includes("giris") || hay.includes("giriş")) return "auth";
  if (hay.includes("r2:") || hay.includes("upload") || hay.includes("s3") || hay.includes("bucket")) return "upload";
  if (hay.includes("audio") || hay.includes("ses") || hay.includes("tts") || hay.includes("elevenlabs")) return "audio";
  if (hay.includes("supabase") || hay.includes("fetch") || hay.includes("network") || hay.includes("failed to fetch")) return "network";
  return "genel";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  // Dakikada 30 — hata fırtınalarında bile log spam'i olmasın
  if (!(await rateLimit(req, res, "error:track", 30, 60_000))) return;

  try {
    const cfg = supabaseConfig();
    // Supabase ayarlı değilse sessizce başarı dön — hata raporlama asla siteyi bozmasın
    if (!cfg) return res.status(200).json({ ok: true, skipped: true });

    const body = (req.body || {}) as Record<string, unknown>;
    const message = sanitize(body.message, 500);
    if (!message) return res.status(200).json({ ok: true, skipped: true });
    const stack = sanitize(body.stack, 4000);
    const path = sanitize(body.path, 200) || "/";
    const source = sanitize(body.source, 40) || "window";
    const kind = sanitize(body.kind, 20) || detectKind(message, stack, path);
    // ★ Kullanıcı kimliği: frontend oturumdan e-postayı gönderir (misafirde boş)
    const userEmail = sanitize(body.userEmail, 120).toLowerCase();
    const userAgent = sanitize(req.headers["user-agent"], 300);

    // Aynı hata 5 dakika içinde tekrar geliyorsa yut (retry döngüsü koruması)
    // ★ 27.09 FIX: eski __buckets ismi artık yok — __RL_MAP (aynı Map, doğru isim)
    const fingerprint = crypto.createHash("sha256").update(`${message}|${path}`).digest("hex").slice(0, 16);
    const fpKey = `errfp:${fingerprint}`;
    const nowMs = Date.now();
    const fpHits = (__RL_MAP.get(fpKey) || []).filter((h) => h >= nowMs - 5 * 60_000);
    if (fpHits.length >= 5) {
      __RL_MAP.set(fpKey, fpHits);
      return res.status(200).json({ ok: true, deduped: true });
    }
    fpHits.push(nowMs);
    __RL_MAP.set(fpKey, fpHits);

    const insertRes = await fetch(`${cfg.url}/rest/v1/nur_error_logs`, {
      method: "POST",
      headers: {
        "apikey": cfg.key,
        "Authorization": `Bearer ${cfg.key}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({ message, stack, path, source, user_agent: userAgent, fingerprint, kind, user_email: userEmail }),
    });

    if (!insertRes.ok) {
      const text = await insertRes.text().catch(() => "");
      console.error("[error-track] insert başarısız:", insertRes.status, text.slice(0, 200));
      // Log yazılamadıysa da istemciye 200 dön — kullanıcı etkilenmesin
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    await logServerError(req, e, "api/analytics/error");
    console.error("[error-track] beklenmeyen:", e);
    return res.status(200).json({ ok: true });
  }
}
