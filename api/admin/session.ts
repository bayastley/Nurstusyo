import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import { adminFromCookie, rateLimit } from "./actionYardimcilar.js";

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

function sessionNameFromCookie(req: VercelRequest): string {
  try {
    const rawCookie = String(req.headers.cookie || "");
    const cookie = rawCookie.split(";").map((part) => part.trim()).find((part) => part.startsWith("nur_session="));
    if (!cookie) return "";
    const token = decodeURIComponent(cookie.slice("nur_session=".length));
    const [payload] = token.split(".");
    if (!payload) return "";
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const pad = normalized.length % 4 ? "=".repeat(4 - (normalized.length % 4)) : "";
    const data = JSON.parse(Buffer.from(normalized + pad, "base64").toString("utf8")) as { name?: string };
    return typeof data.name === "string" ? data.name : "";
  } catch { return ""; }
}

async function allowRequest(req: VercelRequest, res: VercelResponse): Promise<boolean> {
  return rateLimit(req, res, "admin:session", 60, 60_000);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  if (!(await allowRequest(req, res))) return;

  const admin = await adminFromCookie(req);
  if (!admin) {
    // ★ DENETİM: admin paneli giriş kapısına yapılan her yetkisiz deneme kayda geçer
    //   (UI "Yetkisiz denemeler kaydedilir" diyordu ama kayıt yazmıyordu — 30.09 düzeltmesi).
    try {
      const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/+$/, "");
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
      if (url && key) {
        await fetch(`${url}/rest/v1/nur_admin_audit_logs`, {
          method: "POST",
          headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" },
          body: JSON.stringify({
            admin_id: "",
            admin_email: "",
            action: "admin_session_deny",
            target: "admin/session",
            metadata: { ip: String(req.headers["x-forwarded-for"] || "").split(",")[0].trim(), userAgent: String(req.headers["user-agent"] || "").slice(0, 200) },
          }),
        }).catch(() => undefined);
      }
    } catch { /* denetim yazımı kapı kararı ASLA etkilemez */ }
    return res.status(403).json({ ok: false, error: "Admin yetkisi gerekli" });
  }

  // ★ DENETİM: başarılı admin panel girişi de kayda geçer (kim, ne zaman, hangi IP).
  try {
    const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/+$/, "");
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    if (url && key) {
      await fetch(`${url}/rest/v1/nur_admin_audit_logs`, {
        method: "POST",
        headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({
          admin_id: admin.id,
          admin_email: admin.email,
          action: "admin_session_ok",
          target: "admin/session",
          metadata: { ip: String(req.headers["x-forwarded-for"] || "").split(",")[0].trim(), userAgent: String(req.headers["user-agent"] || "").slice(0, 200) },
        }),
      }).catch(() => undefined);
    }
  } catch { /* denetim yazımı akışı ASLA bozmaz */ }

  return res.status(200).json({
    ok: true,
    admin: { id: admin.id, email: admin.email, name: sessionNameFromCookie(req), verified: admin.verified },
  });
}
