// ════════════════════════════════════════════════════════
// ACTIONYARDIMCILAR.TS — api/admin/action.ts yardımcıları
// action.ts'den ayrıldı (SRP adım 6, 30.09)
// ★ Vercel ncc paketleme kuralı: api fonksiyonları YALNIZ relative import
//   kullanır (api/_shared/* paketlenmediği için takım deseni budur).
// ════════════════════════════════════════════════════════

import crypto from "crypto";
import type { VercelRequest } from "@vercel/node";

// Input validation & security
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const SAFE_ID_REGEX = /^[a-zA-Z0-9\-_]+$/;

export function sanitize(input: unknown, max = 500): string {
  if (!input || typeof input !== "string") return "";
  const trimmed = input.trim();
  return trimmed.slice(0, max).replace(/[<>"';]/g, "");
}

export function validateEmail(email: unknown): string | null {
  if (!email || typeof email !== "string") return null;
  const cleaned = email.trim().toLowerCase().slice(0, 254);
  if (!EMAIL_REGEX.test(cleaned)) return null;
  return cleaned;
}

export function validateTier(tier: unknown): "free" | "pro" | "elit" | null {
  if (tier === "free" || tier === "pro" || tier === "elit") return tier;
  return null;
}

export function validateId(id: unknown): string | null {
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
export function __rlIp(req: { headers: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string | null } }): string {
  const forwarded = String(req.headers["cf-connecting-ip"] || req.headers["x-real-ip"] || String(req.headers["x-forwarded-for"] || "").split(",")[0] || "").trim();
  return forwarded || req.socket?.remoteAddress || "unknown";
}
export function __rlMem(bucketKey: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const active = (__RL_MAP.get(bucketKey) || []).filter((h) => h >= now - windowMs);
  if (active.length >= max) { __RL_MAP.set(bucketKey, active); return false; }
  active.push(now);
  __RL_MAP.set(bucketKey, active);
  if (__RL_MAP.size > 5000) { for (const k of __RL_MAP.keys()) { __RL_MAP.delete(k); if (__RL_MAP.size <= 2500) break; } }
  return true;
}
export async function __rlShared(bucketKey: string, windowMs: number): Promise<number | null> {
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
export async function rateLimit(req: { headers: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string | null } }, res: { setHeader: (k: string, v: string) => void; status: (n: number) => { json: (o: unknown) => void } }, key: string, maxRequests: number, windowMs: number): Promise<boolean> {
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
export async function rateLimitSilent(req: { headers: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string | null } }, key: string, maxRequests: number, windowMs: number): Promise<boolean> {
  const bucketKey = `${key}:${__rlIp(req)}`;
  const hits = await __rlShared(bucketKey, windowMs);
  if (hits !== null) return hits <= maxRequests;
  return __rlMem(bucketKey, maxRequests, windowMs);
}
export async function rateLimitBucket(bucketKey: string, maxRequests: number, windowMs: number): Promise<boolean> {
  const hits = await __rlShared(bucketKey, windowMs);
  if (hits !== null) return hits <= maxRequests;
  return __rlMem(bucketKey, maxRequests, windowMs);
}

export async function adminRateLimit(adminId: string, max = 100, windowMs = 60000): Promise<boolean> {
  return rateLimitBucket(`admin:action:${adminId}`, max, windowMs);
}

export interface AdminSession { id: string; email: string; verified: boolean; isAdmin: boolean; exp: number }

export function base64Url(input: Buffer): string { return input.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, ""); }

export function config() {
  // ★ URL NORMALİZASYONU (fetch failed çözümü)
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim().replace(/^["']+|["']+$/g, "").replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) throw new Error("Supabase sunucu ayarları eksik");
  return { url, key };
}

export async function db<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { url, key } = config();
  const response = await fetch(`${url}/rest/v1/${path}`, { ...init, headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...(init.headers || {}) } });
  const text = await response.text();
  if (!response.ok) throw new Error(text || `Supabase ${response.status}`);
  return (text ? JSON.parse(text) : null) as T;
}

export async function adminFromCookie(req: VercelRequest): Promise<AdminSession | null> {
  const cookie = String(req.headers.cookie || "").split(";").map((part) => part.trim()).find((part) => part.startsWith("nur_session="));
  if (!cookie) return null;
  const [payload, signature] = decodeURIComponent(cookie.slice("nur_session=".length)).split(".");
  const secret = process.env.NUR_SESSION_SECRET || "";
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
