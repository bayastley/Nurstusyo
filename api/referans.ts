// ════════════════════════════════════════════════════════
// DAVET / REFERANS API — İş 5
// GET  → kullanıcının davet kodu + linki + kaç kişi davet ettiği
// POST → davet kodunu kullan (kayıt sonrası; karşılıklı ödül sunucuda verilir)
//
// ★ ÖDÜL: her başarılı davette İKİ TARAF +3 kısa video hakkı
//   (SQL: nur_referans_kullan RPC — atomik, çift ödül imkânsız).
// ★ SELF-CONTAINED: Vercel'de _shared importları paketlenmediği için
//   session/rate-limit/supabase inline (render/authorize.ts deseni).
// ★ Tablolar Supabase'e seed edilinceye kadar API zarif düşer:
//   GET { ok:true, aktif:false } döner, site ASLA bozulmaz.
// ════════════════════════════════════════════════════════

import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

declare const process: { env: Record<string, string | undefined> };

// ─── Inline session (render/authorize.ts ile birebir aynı) ──
interface SessionUser { id: string; email: string; verified: boolean; isAdmin: boolean; exp: number }

function fromBase64Url(input: string): Buffer {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4 ? "=".repeat(4 - (normalized.length % 4)) : "";
  return Buffer.from(normalized + pad, "base64");
}
function base64Url(input: Buffer): string {
  return input.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function getSessionUser(req: VercelRequest): SessionUser | null {
  const cookie = String(req.headers.cookie || "").split(";").map((p) => p.trim()).find((p) => p.startsWith("nur_session="));
  if (!cookie) return null;
  const [payload, signature] = decodeURIComponent(cookie.slice("nur_session=".length)).split(".");
  const secret = process.env.NUR_SESSION_SECRET || process.env.GOOGLE_CLIENT_SECRET || "";
  if (!payload || !signature || secret.length < 20) return null;
  const expected = base64Url(crypto.createHmac("sha256", secret).update(payload).digest());
  const a = Buffer.from(signature), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const user = JSON.parse(fromBase64Url(payload).toString("utf8")) as SessionUser;
    if (!user.id || !user.email || !user.verified || user.exp < Math.floor(Date.now() / 1000)) return null;
    return user;
  } catch { return null; }
}

// ─── Inline rate limit (paylaşımlı Upstash → in-memory fallback) ──
const __RL_MAP = new Map<string, number[]>();
const __RL_URL = (process.env.UPSTASH_REDIS_REST_URL || "").replace(/\/+$/, "");
const __RL_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || "";
const __RL_SHARED = __RL_URL.length > 0 && __RL_TOKEN.length > 0;
function __rlIp(req: VercelRequest): string {
  const h = req.headers;
  const forwarded = String(h["cf-connecting-ip"] || h["x-real-ip"] || String(h["x-forwarded-for"] || "").split(",")[0] || "").trim();
  return forwarded || req.socket?.remoteAddress || "unknown";
}
function __rlMem(bucketKey: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const active = (__RL_MAP.get(bucketKey) || []).filter((t) => t >= now - windowMs);
  if (active.length >= max) { __RL_MAP.set(bucketKey, active); return false; }
  active.push(now); __RL_MAP.set(bucketKey, active);
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
    const json = (await res.json()) as Array<{ result?: number }>;
    return typeof json?.[0]?.result === "number" ? json[0].result : null;
  } catch { return null; }
}
async function rateLimit(req: VercelRequest, res: VercelResponse, bucket: string, max: number, windowMs: number): Promise<boolean> {
  const shared = await __rlShared(`${bucket}:${__rlIp(req)}`, windowMs);
  if (shared !== null) {
    if (shared > max) { res.status(429).json({ ok: false, error: "Çok hızlı — biraz bekle" }); return false; }
    return true;
  }
  if (!__rlMem(`${bucket}:${__rlIp(req)}`, max, windowMs)) {
    res.status(429).json({ ok: false, error: "Çok hızlı — biraz bekle" });
    return false;
  }
  return true;
}

function requireAllowedOrigin(req: VercelRequest, res: VercelResponse): boolean {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";
  const referer = typeof req.headers.referer === "string" ? req.headers.referer : "";
  const allowed = new Set(["https://nurstudyo.com", "https://www.nurstudyo.com", "http://localhost:5173", "http://localhost:5174"]);
  if (!origin && !referer) return true;
  if (origin && allowed.has(origin)) return true;
  if (referer) { try { if (allowed.has(new URL(referer).origin)) return true; } catch { /* ignore */ } }
  res.status(403).json({ ok: false, error: "İzin verilmeyen istek kaynağı" });
  return false;
}

// ─── Supabase ─────────────────────────────────────────────
function supabaseConfig() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) return null;
  return { url, key };
}
async function rpc<T>(cfg: { url: string; key: string }, fn: string, body: Record<string, unknown>): Promise<T | null> {
  const res = await fetch(`${cfg.url}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`RPC ${fn} ${res.status}`);
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T | null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }
  if (!requireAllowedOrigin(req, res)) return;
  if (!(await rateLimit(req, res, "referans", 20, 60_000))) return;

  const user = getSessionUser(req);
  if (!user) return res.status(401).json({ ok: false, error: "Oturum gerekli" });

  const cfg = supabaseConfig();
  if (!cfg) {
    // Env yoksa zarif düş: davet sistemi local modda, site bozulmaz
    return res.status(200).json({ ok: true, aktif: false });
  }

  try {
    // ─── GET: kodum + linkim + istatistik ───────────────────
    if (req.method === "GET") {
      const kodRows = await rpc<Array<{ kod: string | null }>>(cfg, "nur_referans_kod_al", { p_user_id: user.id });
      const kod = Array.isArray(kodRows) && kodRows[0]?.kod ? String(kodRows[0].kod) : null;
      if (!kod) return res.status(200).json({ ok: true, aktif: false });

      // Kaç başarılı davet? (Supabase REST sayım)
      let davetSayisi = 0;
      try {
        const countRes = await fetch(`${cfg.url}/rest/v1/nur_referans_kullanim?davet_eden=eq.${encodeURIComponent(user.id)}&select=id`, {
          headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}`, Prefer: "count=exact", Range: "0-0" },
          cache: "no-store",
        });
        const range = countRes.headers.get("content-range");
        const m = range?.match(/\/(\d+)$/);
        if (m) davetSayisi = Number(m[1]) || 0;
      } catch { /* sayım başarısızsa 0 */ }

      const toplamOdul = davetSayisi * 3;
      return res.status(200).json({
        ok: true,
        aktif: true,
        kod,
        link: `https://www.nurstudyo.com/?davet=${kod}`,
        davetSayisi,
        toplamOdul,
        kademe: davetSayisi >= 50 ? "Orman 🌳" : davetSayisi >= 25 ? "Ağaç 🌲" : davetSayisi >= 10 ? "Fidan 🌱" : davetSayisi >= 3 ? "Tohum 🌰" : null,
      });
    }

    // ─── POST: davet kodunu kullan ──────────────────────────
    if (req.method === "POST") {
      const body = (req.body || {}) as Record<string, unknown>;
      const kod = String(body.kod || "").trim().toUpperCase();
      if (kod.length < 4 || kod.length > 12) {
        return res.status(400).json({ ok: false, error: "Davet kodu geçersiz görünüyor" });
      }
      const sonuc = await rpc<Array<{ ok: boolean; error: string | null; davet_eden_odul: number; davet_edilen_odul: number }>>(
        cfg, "nur_referans_kullan", { p_kod: kod, p_davet_edilen: user.id },
      );
      const row = Array.isArray(sonuc) ? sonuc[0] : null;
      if (!row?.ok) {
        const mesajlar: Record<string, string> = {
          KOD_BULUNAMADI: "Bu davet kodu bulunamadı — kontrol edip tekrar dene",
          KENDINI_DAVET: "Kendi kodunu kullanamazsın 🙂",
          ZATEN_DAVET_EDILMIS: "Bu hesap zaten bir davet kodu kullanmış",
          UNAUTHORIZED: "Yetki hatası — tekrar denemek için sayfayı yenile",
        };
        return res.status(400).json({ ok: false, error: mesajlar[row?.error ?? ""] || "Davet kodu kullanılamadı" });
      }
      return res.status(200).json({
        ok: true,
        odul: row.davet_edilen_odul,
        mesaj: `🎉 Davet tamam! Sen +${row.davet_edilen_odul}, dostun +${row.davet_eden_odul} kısa video hakkı kazandı!`,
      });
    }

    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  } catch (e) {
    console.error("[referans]", e);
    return res.status(200).json({ ok: true, aktif: false }); // hata olsa da site bozulmaz
  }
}
