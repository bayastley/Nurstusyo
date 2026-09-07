import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

// ════════════════════════════════════════════════════════
// EMAIL PAZARLAMA RIZASI — KVKK'ya uygun AYRI açık rıza uctu.
// Self-contained — _shared importları Vercel'de çalışmıyor
// ════════════════════════════════════════════════════════

const COOKIE_NAME = "nur_session";

function parseCookies(req: VercelRequest): Record<string, string> {
  const header = req.headers.cookie || "";
  return header.split(";").reduce<Record<string, string>>((acc, part) => {
    const [key, ...rest] = part.trim().split("=");
    if (!key) return acc;
    acc[key] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
}

function sessionSecret(): string {
  return process.env.NUR_SESSION_SECRET || process.env.GOOGLE_CLIENT_SECRET || "";
}

function base64Url(input: Buffer | string): string {
  const raw = Buffer.isBuffer(input) ? input : Buffer.from(input, "utf8");
  return raw.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(input: string): Buffer {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4 ? "=".repeat(4 - (normalized.length % 4)) : "";
  return Buffer.from(normalized + pad, "base64");
}

function signPayload(payload: string): string {
  return base64Url(crypto.createHmac("sha256", sessionSecret()).update(payload).digest());
}

function getSessionUser(req: VercelRequest): { id: string; email: string; name: string } | null {
  const token = parseCookies(req)[COOKIE_NAME];
  if (!token || !token.includes(".")) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = signPayload(payload);
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;
  try {
    const user = JSON.parse(fromBase64Url(payload).toString("utf8"));
    if (!user.exp || user.exp < Math.floor(Date.now() / 1000)) return null;
    if (!user.email || !user.id) return null;
    return user;
  } catch {
    return null;
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  // Basit origin kontrolü
  const origin = req.headers.origin || req.headers.referer || "";
  const allowed = ["nurstudyo.com", "www.nurstudyo.com"];
  if (origin && !allowed.some((a) => origin.includes(a))) {
    return res.status(403).json({ ok: false, error: "Origin not allowed" });
  }

  const user = getSessionUser(req);
  if (!user) {
    return res.status(200).json({ ok: true, consented: false });
  }

  try {
    if (req.method === "GET") {
      const rows = await db<any[]>(`nur_marketing_consent?user_id=eq.${encodeURIComponent(user.id)}&select=consented`);
      return res.status(200).json({ ok: true, consented: Boolean(rows[0]?.consented) });
    }

    if (req.method === "POST") {
      const consented = Boolean((req.body || {}).consented);
      const now = new Date().toISOString();
      await db("nur_marketing_consent?on_conflict=user_id", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({
          user_id: user.id,
          email: user.email,
          consented,
          consented_at: consented ? now : null,
          revoked_at: consented ? null : now,
          source: "app",
          updated_at: now,
        }),
      });
      return res.status(200).json({ ok: true, consented });
    }

    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  } catch (error) {
    console.error("[Marketing Consent Error]", error);
    return res.status(500).json({ ok: false, error: "İşlem tamamlanamadı" });
  }
}
