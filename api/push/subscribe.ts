import crypto from "crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { assertOrigin } from "../_shared/origin.js";
import { logServerError } from "../_shared/serverErrorLog.js";


declare const process: { env: Record<string, string | undefined> };

// ════════════════════════════════════════════════════════
// PUSH SUBSCRIBE — Öğüt Vakti abonelik yönetimi
// POST { endpoint, keys: { p256dh, auth } } → kaydet
// DELETE { endpoint } → sil
// GET → VAPID public key (istemci aboneliği bununla kurulur)
// ════════════════════════════════════════════════════════

// Self-contained rate limit — _shared importları Vercel'de paketlenmiyor
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
  if (!url || !key) return null;
  return { url, key };
}

function sanitize(input: unknown, max: number): string {
  if (!input || typeof input !== "string") return "";
  return input.trim().slice(0, max).replace(/[<>"';]/g, "");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  // GET → VAPID public key dağıt
  if (req.method === "GET") {
    const publicKey = process.env.VAPID_PUBLIC_KEY || "";
    if (!publicKey) return res.status(503).json({ ok: false, error: "Push sunucuda yapılandırılmamış" });
    return res.status(200).json({ ok: true, publicKey });
  }

  if (req.method === "POST" || req.method === "DELETE") {
    if (!assertOrigin(req, res, { allowMissing: true })) return;
  } else {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  if (!(await rateLimit(req, res, "push:subscribe", 20, 60_000))) return;

  const cfg = supabaseConfig();
  if (!cfg) return res.status(503).json({ ok: false, error: "Veritabanı yapılandırılmamış" });

  const body = (req.body || {}) as Record<string, any>;
  const endpoint = sanitize(body.endpoint, 500);

  // DELETE → abonelik sil
  if (req.method === "DELETE") {
    if (!endpoint) return res.status(400).json({ ok: false, error: "endpoint gerekli" });
    await fetch(`${cfg.url}/rest/v1/nur_push_subscriptions?endpoint=eq.${encodeURIComponent(endpoint)}`, {
      method: "DELETE",
      headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}` },
    }).catch(() => null);
    return res.status(200).json({ ok: true });
  }

  // POST → abonelik kaydet
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method Not Allowed" });

  if (!endpoint || !endpoint.startsWith("https://")) return res.status(400).json({ ok: false, error: "Geçersiz endpoint" });
  const p256dh = sanitize(body?.keys?.p256dh, 200);
  const auth = sanitize(body?.keys?.auth, 200);
  if (!p256dh || !auth) return res.status(400).json({ ok: false, error: "Abonelik anahtarları eksik" });

  const saatDilimi = sanitize(body.tz, 40) || "Europe/Istanbul";
  // ★ Bakım bildirimi onayı: kullanıcı "Bakım bitince haber ver" dediğinde true gelir
  const notifyMaintenance = body.notify_maintenance === true;

  // Upsert: aynı endpoint tekrar gelirse güncelle
  const upsert = await fetch(`${cfg.url}/rest/v1/nur_push_subscriptions?on_conflict=endpoint`, {
    method: "POST",
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({ endpoint, p256dh, auth, tz: saatDilimi, notify_maintenance: notifyMaintenance, created_at: new Date().toISOString() }),
  }).catch(() => null);

  if (!upsert || !upsert.ok) {
    const text = upsert ? await upsert.text().catch(() => "") : "bağlantı yok";
    console.error("[push-subscribe] upsert hatası:", upsert?.status, text.slice(0, 200));
    return res.status(500).json({ ok: false, error: "Abonelik kaydedilemedi" });
  }

  return res.status(200).json({ ok: true });
}
