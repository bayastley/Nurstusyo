import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

// Input validation & security
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SAFE_ID_REGEX = /^[a-zA-Z0-9\-_]+$/;

function sanitize(input: unknown, max = 500): string {
  if (!input || typeof input !== "string") return "";
  const trimmed = input.trim();
  return trimmed.slice(0, max).replace(/[<>"';]/g, "");
}

function validateEmail(email: unknown): string | null {
  if (!email || typeof email !== "string") return null;
  const cleaned = email.trim().toLowerCase().slice(0, 254);
  if (!EMAIL_REGEX.test(cleaned)) return null;
  return cleaned;
}

function validateTier(tier: unknown): "free" | "pro" | "elit" | null {
  if (tier === "free" || tier === "pro" || tier === "elit") return tier;
  return null;
}

function validateId(id: unknown): string | null {
  if (!id || typeof id !== "string") return null;
  if (!SAFE_ID_REGEX.test(id) || id.length > 64) return null;
  return id;
}

// In-memory rate limit (per admin session)
const rateLimitMap = new Map<string, { hits: number[] }>();

function adminRateLimit(adminId: string, max = 100, windowMs = 60000): boolean {
  const now = Date.now();
  const key = `admin:${adminId}`;
  const entry = rateLimitMap.get(key) ?? { hits: [] };
  entry.hits = entry.hits.filter((h) => h >= now - windowMs);
  if (entry.hits.length >= max) return false;
  entry.hits.push(now);
  rateLimitMap.set(key, entry);
  return true;
}

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
  // ★ URL NORMALİZASYONU (fetch failed çözümü)
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim().replace(/^["']+|["']+$/g, "").replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
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
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  const admin = adminFromCookie(req);
  if (!admin) return res.status(403).json({ ok: false, error: "Admin yetkisi gerekli" });
  
  // ★ Admin rate limit (dakikada 100 işlem)
  if (!adminRateLimit(admin.id, 100, 60000)) {
    return res.status(429).json({ ok: false, error: "Çok fazla istek, lütfen bekleyin" });
  }

  const body = req.body || {};
  const action = String(body.action || "").slice(0, 32);
  try {
    if (action === "list_users") {
      const users = await db<any[]>("nur_users?select=id,email,name,tier,is_admin,updated_at&order=updated_at.desc");
      const wallets = await db<any[]>("nur_wallets?select=user_id,sub_jeton,purchased_jeton");
      const walletMap = new Map(wallets.map((wallet) => [wallet.user_id, wallet]));
      return res.status(200).json({ ok: true, users: users.map((user) => ({ ...user, wallet: walletMap.get(user.id) ?? null })) });
    }
    if (action === "publish_announcement") {
      const item = body.announcement || {};
      const title = sanitize(item.title, 160);
      const message = sanitize(item.message, 500);
      if (!title || !message) return res.status(400).json({ ok: false, error: "Başlık ve mesaj gerekli" });
      const kind = ["info", "update", "warning"].includes(item.kind) ? item.kind : "update";
      await db("nur_announcements", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ title, message, detail: sanitize(item.detail, 5000), kind, active: true, blinking: item.blinking !== false, force_open: Boolean(item.forceOpen), require_ack: Boolean(item.requireAck), starts_at: item.startsAt, ends_at: item.endsAt, created_by: admin.email }) });
    } else if (action === "set_feature_lock") {
      const featureId = validateId(body.featureId);
      if (!featureId) return res.status(400).json({ ok: false, error: "Geçersiz feature ID" });
      const lockLevel = ["free", "pro", "elit", "v2", "v3", "off"].includes(body.lockLevel) ? body.lockLevel : "free";
      await db("nur_feature_locks?on_conflict=feature_id", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify({ feature_id: featureId, lock_level: lockLevel, active: true, updated_by: admin.email, updated_at: new Date().toISOString() }) });
    } else if (action === "change_tier") {
      const email = validateEmail(body.target);
      if (!email) return res.status(400).json({ ok: false, error: "Geçersiz e-posta" });
      const tier = validateTier(body.tier);
      if (!tier) return res.status(400).json({ ok: false, error: "Geçersiz tier" });
      // ★ Tier değiştir + cüzdanı sıfırla (eğer free'ye düşürülüyorsa)
      await db(`nur_users?email=eq.${encodeURIComponent(email)}`, { method: "PATCH", body: JSON.stringify({ tier, updated_at: new Date().toISOString() }) });
      if (tier === "free") {
        // Free'ye düşürürken satın alınan hakları ve aboneliği sıfırla
        const users = await db<any[]>(`nur_users?email=eq.${encodeURIComponent(email)}&select=id`);
        if (users[0]?.id) {
          await db(`nur_wallets?user_id=eq.${encodeURIComponent(users[0].id)}`, { method: "PATCH", body: JSON.stringify({ purchased_kisa: 0, purchased_uzun: 0, purchased_tam: 0, sub_jeton: 0, purchased_jeton: 0, updated_at: new Date().toISOString() }) }).catch(() => null);
          await db(`nur_subscriptions?user_id=eq.${encodeURIComponent(users[0].id)}&status=eq.active`, { method: "PATCH", body: JSON.stringify({ status: "cancelled", cancelled_at: new Date().toISOString() }) }).catch(() => null);
        }
      }
    } else if (action === "change_jeton") {
      const email = validateEmail(body.target);
      if (!email) return res.status(400).json({ ok: false, error: "Geçersiz e-posta" });
      const total = Math.max(0, Math.min(1000000, Number(body.total) || 0));
      const users = await db<any[]>(`nur_users?email=eq.${encodeURIComponent(email)}&select=id`);
      if (!users[0]) return res.status(404).json({ ok: false, error: "Kullanıcı bulunamadı" });
      await db(`nur_wallets?user_id=eq.${encodeURIComponent(users[0].id)}`, { method: "PATCH", body: JSON.stringify({ sub_jeton: total, purchased_jeton: 0, updated_at: new Date().toISOString() }) });
    } else if (action === "ban_user") {
      const email = validateEmail(body.target);
      if (!email) return res.status(400).json({ ok: false, error: "Geçersiz e-posta" });
      const reason = sanitize(body.reason, 500) || "Admin kararı";
      await db("nur_ban_logs", { method: "POST", body: JSON.stringify({ user_email: email, reason, banned_by: admin.email }) });
    } else if (action === "unban_user") {
      const email = validateEmail(body.target);
      if (!email) return res.status(400).json({ ok: false, error: "Geçersiz e-posta" });
      await db(`nur_ban_logs?user_email=eq.${encodeURIComponent(email)}&unbanned=eq.false`, { method: "PATCH", body: JSON.stringify({ unbanned: true }) });
    } else if (action === "delete_announcement") {
      const announcementId = body.announcementId ? validateId(body.announcementId) : null;
      if (body.announcementId && !announcementId) return res.status(400).json({ ok: false, error: "Geçersiz ID" });
      if (announcementId) {
        await db(`nur_announcements?id=eq.${encodeURIComponent(announcementId)}`, { method: "PATCH", body: JSON.stringify({ active: false }) });
      } else {
        await db("nur_announcements?active=eq.true", { method: "PATCH", body: JSON.stringify({ active: false }) });
      }
    } else if (action === "clear_all_announcements") {
      await db("nur_announcements?active=eq.true", { method: "PATCH", body: JSON.stringify({ active: false }) });
    } else if (action === "reset_rights") {
      // ★ TÜM HAKLARI SIFIRLA — tier, cüzdan, abonelik hepsini temizle
      const email = validateEmail(body.target);
      if (!email) return res.status(400).json({ ok: false, error: "Geçersiz e-posta" });
      // 1) Tier'ı free yap
      await db(`nur_users?email=eq.${encodeURIComponent(email)}`, { method: "PATCH", body: JSON.stringify({ tier: "free", updated_at: new Date().toISOString() }) });
      // 2) Kullanıcıyı bul
      const users = await db<any[]>(`nur_users?email=eq.${encodeURIComponent(email)}&select=id`);
      if (users[0]?.id) {
        const uid = users[0].id;
        // 3) Cüzdanı tamamen sıfırla
        await db(`nur_wallets?user_id=eq.${encodeURIComponent(uid)}`, { method: "PATCH", body: JSON.stringify({ purchased_kisa: 0, purchased_uzun: 0, purchased_tam: 0, sub_jeton: 0, purchased_jeton: 0, updated_at: new Date().toISOString() }) }).catch(() => null);
        // 4) Aktif aboneliği iptal et
        await db(`nur_subscriptions?user_id=eq.${encodeURIComponent(uid)}&status=eq.active`, { method: "PATCH", body: JSON.stringify({ status: "cancelled", cancelled_at: new Date().toISOString() }) }).catch(() => null);
      }
    } else if (action === "user_history") {
      // ★ KULLANICI GEÇMİŞİ — Email ile gir, son 10 siparişi + cüzdan durumunu gör
      const email = validateEmail(body.target);
      if (!email) return res.status(400).json({ ok: false, error: "Geçersiz e-posta" });
      const users = await db<any[]>(`nur_users?email=eq.${encodeURIComponent(email)}&select=id,email,name,tier,created_at,updated_at`);
      if (!users[0]) return res.status(200).json({ ok: true, user: null, orders: [], wallet: null });
      const uid = users[0].id;
      const orders = await db<any[]>(`nur_orders?user_id=eq.${encodeURIComponent(uid)}&select=id,product_code,conversation_id,status,payment_id,created_at&order=created_at.desc&limit=10`);
      const wallets = await db<any[]>(`nur_wallets?user_id=eq.${encodeURIComponent(uid)}&select=purchased_kisa,purchased_uzun,purchased_tam,sub_jeton,purchased_jeton,updated_at`);
      const subs = await db<any[]>(`nur_subscriptions?user_id=eq.${encodeURIComponent(uid)}&select=product_code,status,expires_at,created_at&order=created_at.desc&limit=5`);
      return res.status(200).json({ ok: true, user: users[0], orders, wallet: wallets[0] || null, subscriptions: subs });
    } else return res.status(400).json({ ok: false, error: "Geçersiz admin işlemi" });
    await db("nur_admin_audit_logs", { method: "POST", body: JSON.stringify({ admin_id: admin.id, admin_email: admin.email, action, target: String(body.target || body.featureId || "") }) }).catch(() => null);
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("[Admin Action Error]", error);
    return res.status(500).json({ ok: false, error: "İşlem tamamlanamadı" });
  }
}
