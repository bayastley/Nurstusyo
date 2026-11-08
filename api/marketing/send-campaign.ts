import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import { assertOrigin } from "../_shared/origin.js";
import { logServerError } from "../_shared/serverErrorLog.js";


// ─── Server error logger (gömülü — _shared Vercel'de paketlenmiyor) ───
function base64Url(input: Buffer): string {
  return input.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function adminFromCookie(req: VercelRequest): { id?: string; email: string; isAdmin: boolean } | null {
  const cookie = String(req.headers.cookie || "").split(";").map((p) => p.trim()).find((p) => p.startsWith("nur_session="));
  if (!cookie) return null;
  const [payload, signature] = decodeURIComponent(cookie.slice("nur_session=".length)).split(".");
  const secret = process.env.NUR_SESSION_SECRET || "";
  if (!payload || !signature || secret.length < 20) return null;
  const expected = base64Url(crypto.createHmac("sha256", secret).update(payload).digest());
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const pad = normalized.length % 4 ? "=".repeat(4 - (normalized.length % 4)) : "";
    const admin = JSON.parse(Buffer.from(normalized + pad, "base64").toString("utf8"));
    if (!(admin.isAdmin && admin.verified && admin.exp >= Math.floor(Date.now() / 1000) && admin.email)) return null;
    // ★ 3 KATMAN: ENV whitelist (fail-closed) + token + DB (aşağıda)
    const adminEmails = (process.env.NUR_ADMIN_EMAILS || process.env.NUR_ADMIN_EMAIL || process.env.VITE_NUR_ADMIN_EMAIL || "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
    if (adminEmails.length === 0 || !adminEmails.includes(String(admin.email).toLowerCase())) return null;
    return { id: admin.id, email: admin.email, isAdmin: true };
  } catch {
    return null;
  }
}

// ★ Admin DB TEYİDİ: JWT iddiası yetmez — yetkisi alınan adminin eski
//   token'ı 7 gün geçerli kalmasın. id varsa id ile, yoksa email ile kontrol.
async function verifyAdminInDb(admin: { id?: string; email: string }): Promise<boolean> {
  try {
    const { url, key } = supabaseConfig();
    const filter = admin.id
      ? `id=eq.${encodeURIComponent(admin.id)}`
      : `email=eq.${encodeURIComponent(admin.email)}`;
    const response = await fetch(`${url}/rest/v1/nur_users?${filter}&select=is_admin`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: "no-store",
    });
    if (!response.ok) return false;
    const rows = (await response.json()) as Array<{ is_admin?: boolean }>;
    return rows[0]?.is_admin === true;
  } catch {
    return false;
  }
}

function supabaseConfig() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) throw new Error("Supabase sunucu ayarları eksik");
  return { url, key };
}

async function db<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { url, key } = supabaseConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...(init.headers || {}) },
  });
  const text = await response.text();
  if (!response.ok) throw new Error(text || `Supabase ${response.status}`);
  return (text ? JSON.parse(text) : null) as T;
}

function sanitize(input: unknown, max: number): string {
  if (!input || typeof input !== "string") return "";
  return input.trim().slice(0, max);
}

// ★ PAYLAŞIMLI RATE LIMIT (Upstash varsa ortak sayaç, yoksa in-memory)
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
    const res = await fetch(`${__RL_URL}/pipeline`, { method: "POST", headers: { Authorization: `Bearer ${__RL_TOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify([["INCR", `rl:${bucketKey}`], ["EXPIRE", `rl:${bucketKey}`, String(Math.ceil(windowMs / 1000)), "NX"]]), cache: "no-store" });
    if (!res.ok) return null;
    const json = (await res.json()) as Array<{ result: unknown }>;
    return Number(json[0]?.result ?? 1);
  } catch { return null; }
}
async function rateLimit(req: { headers: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string | null } }, res: { setHeader: (k: string, v: string) => void; status: (n: number) => { json: (o: unknown) => void } }, key: string, maxRequests: number, windowMs: number): Promise<boolean> {
  const bucketKey = `${key}:${__rlIp(req)}`;
  const hits = await __rlShared(bucketKey, windowMs);
  if (hits !== null) { if (hits > maxRequests) { res.setHeader("Retry-After", "60"); res.setHeader("Cache-Control", "no-store"); res.status(429).json({ ok: false, error: "İstek işlenemedi" }); return false; } return true; }
  const ok = __rlMem(bucketKey, maxRequests, windowMs);
  if (!ok) { res.setHeader("Retry-After", "60"); res.setHeader("Cache-Control", "no-store"); res.status(429).json({ ok: false, error: "İstek işlenemedi" }); }
  return ok;
}
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  if (!assertOrigin(req, res)) return;
  // ★ Merkezi rate limit — admin ucu ama Resend kota tüketimini de sınırlar (dakikada 5)
  if (!(await rateLimit(req, res, "campaign", 5, 60_000))) return;

  const admin = adminFromCookie(req);
  if (!admin || !(await verifyAdminInDb(admin))) return res.status(403).json({ ok: false, error: "Admin yetkisi gerekli" });

  const resendKey = process.env.RESEND_API_KEY || "";
  if (!resendKey) {
    return res.status(503).json({
      ok: false,
      error: "Email gönderimi henüz aktif değil. Vercel > Environment Variables kısmına ücretsiz Resend.com hesabından alacağınız RESEND_API_KEY değerini ekleyin.",
    });
  }

  const subject = sanitize((req.body || {}).subject, 150);
  const html = sanitize((req.body || {}).html, 20000);
  const fromEmail = process.env.MARKETING_FROM_EMAIL || "Nûr Stüdyo <bildirim@nurstudyo.com>";

  if (!subject || !html) {
    return res.status(400).json({ ok: false, error: "Konu ve içerik gerekli" });
  }

  try {
    // Sadece açıkça izin vermiş (consented=true) kullanıcıları çek.
    const consented = await db<any[]>("nur_marketing_consent?consented=eq.true&select=email");
    const emails = Array.from(new Set(consented.map((row) => String(row.email).toLowerCase()).filter(Boolean)));

    if (emails.length === 0) {
      return res.status(200).json({ ok: true, sent: 0, message: "İzin veren kullanıcı yok, gönderim yapılmadı" });
    }

    // Resend toplu gönderim: BCC yerine her alıcıya ayrı "to" ile tek tek istek
    // (gizlilik için alıcılar birbirini görmemeli). Küçük listelerde (<100) sorun değil.
    let sentCount = 0;
    for (const email of emails.slice(0, 500)) {
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ from: fromEmail, to: [email], subject, html }),
        });
        if (response.ok) sentCount += 1;
      } catch {
        // tek bir alıcıda hata olursa diğerlerini engellemez
      }
    }

    await db("nur_email_campaigns", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ subject, sent_count: sentCount, sent_by: admin.email }),
    }).catch(() => undefined);

    return res.status(200).json({ ok: true, sent: sentCount, total: emails.length });
  } catch (error) {
    await logServerError(req, error, "api/marketing/send-campaign");
    console.error("[Marketing Campaign Error]", error);
    return res.status(500).json({ ok: false, error: "Kampanya gönderilemedi" });
  }
}
