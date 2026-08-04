import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

interface AdminSession { id: string; email: string; verified: boolean; isAdmin: boolean; exp: number }

function base64Url(input: Buffer): string { return input.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, ""); }

function adminFromCookie(req: VercelRequest): AdminSession | null {
  const cookie = String(req.headers.cookie || "").split(";").map((part) => part.trim()).find((part) => part.startsWith("nur_session="));
  if (!cookie) return null;
  const [payload, signature] = decodeURIComponent(cookie.slice("nur_session=".length)).split(".");
  const secret = process.env.NUR_SESSION_SECRET || process.env.GOOGLE_CLIENT_SECRET || "";
  if (!payload || !signature || secret.length < 20) return null;
  const expected = base64Url(crypto.createHmac("sha256", secret).update(payload).digest());
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const pad = normalized.length % 4 ? "=".repeat(4 - normalized.length % 4) : "";
    const admin = JSON.parse(Buffer.from(normalized + pad, "base64").toString("utf8")) as AdminSession;
    return admin.isAdmin && admin.verified && admin.exp >= Math.floor(Date.now() / 1000) ? admin : null;
  } catch { return null; }
}

function config() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) throw new Error("Supabase sunucu ayarları eksik");
  return { url, key };
}

async function db<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { url, key } = config();
  const response = await fetch(`${url}/rest/v1/${path}`, { ...init, headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...(init.headers || {}) } });
  const text = await response.text();
  if (!response.ok) throw new Error(text || `Supabase ${response.status}`);
  return (text ? JSON.parse(text) : null) as T;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  const admin = adminFromCookie(req);
  if (!admin) return res.status(403).json({ ok: false, error: "Admin yetkisi gerekli" });
  const body = req.body || {};
  const action = String(body.action || "");
  try {
    if (action === "list_users") {
      const users = await db<any[]>("nur_users?select=id,email,name,tier,is_admin,updated_at&order=updated_at.desc");
      const wallets = await db<any[]>("nur_wallets?select=user_id,sub_jeton,purchased_jeton");
      const walletMap = new Map(wallets.map((wallet) => [wallet.user_id, wallet]));
      return res.status(200).json({ ok: true, users: users.map((user) => ({ ...user, wallet: walletMap.get(user.id) ?? null })) });
    }
    if (action === "publish_announcement") {
      const item = body.announcement || {};
      if (!item.title || !item.message) return res.status(400).json({ ok: false, error: "Başlık ve mesaj gerekli" });
      await db("nur_announcements", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ title: String(item.title).slice(0, 160), message: String(item.message).slice(0, 500), detail: String(item.detail || "").slice(0, 5000), kind: item.kind || "update", active: true, blinking: item.blinking !== false, force_open: Boolean(item.forceOpen), require_ack: Boolean(item.requireAck), starts_at: item.startsAt, ends_at: item.endsAt, created_by: admin.email }) });
    } else if (action === "set_feature_lock") {
      await db("nur_feature_locks?on_conflict=feature_id", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify({ feature_id: body.featureId, lock_level: body.lockLevel, active: true, updated_by: admin.email, updated_at: new Date().toISOString() }) });
    } else if (action === "change_tier") {
      await db(`nur_users?email=eq.${encodeURIComponent(body.target)}`, { method: "PATCH", body: JSON.stringify({ tier: body.tier, updated_at: new Date().toISOString() }) });
    } else if (action === "change_jeton") {
      const users = await db<any[]>(`nur_users?email=eq.${encodeURIComponent(body.target)}&select=id`);
      if (!users[0]) return res.status(404).json({ ok: false, error: "Kullanıcı bulunamadı" });
      await db(`nur_wallets?user_id=eq.${encodeURIComponent(users[0].id)}`, { method: "PATCH", body: JSON.stringify({ sub_jeton: Math.max(0, Number(body.total || 0)), purchased_jeton: 0, updated_at: new Date().toISOString() }) });
    } else if (action === "ban_user") {
      await db("nur_ban_logs", { method: "POST", body: JSON.stringify({ user_email: body.target, reason: body.reason || "Admin kararı", banned_by: admin.email }) });
    } else if (action === "unban_user") {
      await db(`nur_ban_logs?user_email=eq.${encodeURIComponent(body.target)}&unbanned=eq.false`, { method: "PATCH", body: JSON.stringify({ unbanned: true }) });
    } else return res.status(400).json({ ok: false, error: "Geçersiz admin işlemi" });
    await db("nur_admin_audit_logs", { method: "POST", body: JSON.stringify({ admin_id: admin.id, admin_email: admin.email, action, target: String(body.target || body.featureId || "") }) }).catch(() => null);
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("[Admin Action Error]", error);
    return res.status(500).json({ ok: false, error: "İşlem tamamlanamadı" });
  }
}
