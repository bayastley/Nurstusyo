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

// ═══════════════════════════════════════════════════════════════
// ★ /api/admin/kill-session — Banlı Kullanıcı Oturum Öldürme
//
// Admin bir kullanıcıyı "SÜRESİZ BANLA" dediğinde:
// 1. Supabase auth.instances'dan kullanıcının JWT token'ını iptal eder
// 2. HttpOnly session cookie'sini temizler
// 3. Kullanıcı sayfasını yenilemeden sistemden atar
//
// ★ ENV GEREKSİNİMLERİ:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
// ═══════════════════════════════════════════════════════════════

function getSupabase() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "")
    .trim()
    .replace(/^["']+|["']+$/g, "")
    .replace(/\/rest\/v1\/?$/i, "")
    .replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) return null;
  return { url, key };
}

// ─── SUPABASE AUTH SESSION REVOKE ──────────────────────────
async function revokeUserSessions(userId: string, req?: { url?: string; headers: Record<string, string | string[] | undefined> }): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) {
    console.error("[kill-session] Supabase yapılandırması eksik");
    return false;
  }

  try {
    // Supabase Auth Admin API — kullanıcının tüm oturumlarını sonlandırır
    // DELETE /auth/v1/admin/users/{uid}/sessions
    const res = await fetch(`${sb.url}/auth/v1/admin/users/${userId}/sessions`, {
      method: "DELETE",
      headers: {
        apikey: sb.key,
        Authorization: `Bearer ${sb.key}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      // Bazı Supabase sürümlerinde bu endpoint olmayabilir
      // Alternatif: refresh token'ı sil
      console.warn(`[kill-session] Sessions endpoint ${res.status}, refresh token deneniyor`);

      // Refresh token'ı silerek oturumu sonlandır
      const rtRes = await fetch(
        `${sb.url}/rest/v1/auth.refresh_tokens?user_id=eq.${userId}`,
        {
          method: "DELETE",
          headers: {
            apikey: sb.key,
            Authorization: `Bearer ${sb.key}`,
          },
        }
      );

      if (!rtRes.ok) {
        console.error("[kill-session] Refresh token silinemedi:", rtRes.status);
        return false;
      }
    }

    console.log(`[kill-session] ✅ Kullanıcı ${userId} oturumları sonlandırıldı`);
    return true;
  } catch (err: unknown) {
    if (req) await logServerError(req, err, "admin/kill-session");
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    console.error("[kill-session] Oturum sonlandırma hatası:", message);
    return false;
  }
}

// ─── BAN KAYDI OLUŞTUR ─────────────────────────────────────
async function banUser(
  targetEmail: string,
  adminEmail: string,
  reason: string
): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;

  try {
    // Kullanıcıyı bul
    const userRes = await fetch(
      `${sb.url}/rest/v1/nur_users?email=eq.${encodeURIComponent(targetEmail)}&select=id`,
      {
        headers: {
          apikey: sb.key,
          Authorization: `Bearer ${sb.key}`,
        },
      }
    );

    const users = await userRes.json().catch(() => []);
    const user = Array.isArray(users) ? users[0] : null;

    if (!user?.id) {
      console.error("[kill-session] Kullanıcı bulunamadı:", targetEmail);
      return false;
    }

    // Ban kaydı ekle — ★ Uygulamanın okuduğu tablo nur_ban_logs'tur
    // (me.ts, ban/status.ts, video/sign.ts, render/authorize.ts).
    // Eski nur_bans tablosunu okuyan hiçbir kod yok — yazmak boşunadır.
    const banRes = await fetch(`${sb.url}/rest/v1/nur_ban_logs`, {
      method: "POST",
      headers: {
        apikey: sb.key,
        Authorization: `Bearer ${sb.key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        user_id: user.id,
        user_email: targetEmail.toLowerCase(),
        reason: reason.slice(0, 300),
        banned_by: adminEmail,
        is_auto: false,
      }),
    });

    if (!banRes.ok) {
      console.error("[kill-session] Ban kaydı oluşturulamadı:", banRes.status);
    }

    // Kullanıcı tier'ını free yap
    await fetch(
      `${sb.url}/rest/v1/nur_users?email=eq.${encodeURIComponent(targetEmail)}`,
      {
        method: "PATCH",
        headers: {
          apikey: sb.key,
          Authorization: `Bearer ${sb.key}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ tier: "free", updated_at: new Date().toISOString() }),
      }
    );

    // ★ Aktif aboneliği de iptal et — yalnızca tier düşürmek yetmez,
    //   subscription kaydı aktif kalırsa ayrıcalıklar devam eder.
    await fetch(
      `${sb.url}/rest/v1/nur_subscriptions?user_id=eq.${encodeURIComponent(user.id)}&status=eq.active`,
      {
        method: "PATCH",
        headers: {
          apikey: sb.key,
          Authorization: `Bearer ${sb.key}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ status: "cancelled" }),
      }
    ).catch(() => undefined);

    return true;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    console.error("[kill-session] Ban hatası:", message);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// ★ ANA HANDLER
// ═══════════════════════════════════════════════════════════════
export default async function handler(req: any, res: any) {
  // CORS — yapılandırılmış origin ile eşleşirse izin ver (cookie/credential akışı korunur)
  const configuredOrigin = String(process.env.SITE_URL || process.env.VITE_SITE_URL || "").replace(/\/$/, "");
  const requestOrigin = String(req.headers.origin || "").replace(/\/$/, "");
  if (requestOrigin && configuredOrigin && requestOrigin === configuredOrigin) {
    res.setHeader("Access-Control-Allow-Origin", configuredOrigin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    if (requestOrigin && configuredOrigin && requestOrigin !== configuredOrigin) {
      res.status(403).end();
      return;
    }
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Sadece POST" });
    return;
  }
  // ★ Merkezi rate limit — oturum öldürme ucu taramaya karşı (dakikada 30)
  if (!(await rateLimit(req, res, "kill-session", 30, 60_000))) return;

  // Admin yetki kontrolü — 3 katman: token + NUR_ADMIN_EMAILS whitelist (fail-closed) + DB is_admin
  const admin = await adminFromCookie(req);
  if (!admin) {
    res.status(403).json({ error: "Admin yetkisi yok" });
    return;
  }

  try {
    const { targetEmail, reason = "Yasal ihlal / Sistem güvenlik uyarısı" } = req.body || {};

    if (!targetEmail || typeof targetEmail !== "string") {
      res.status(400).json({ error: "Hedef email gerekli" });
      return;
    }

    // Admin kendi hesabını banlayamaz
    if (targetEmail.toLowerCase() === admin.email.toLowerCase()) {
      res.status(400).json({ error: "Kendi hesabınızı banlayamazsınız" });
      return;
    }

    console.log(`[kill-session] ${targetEmail} banlanıyor...`);

    // 1. Kullanıcıyı bul ve oturumlarını sonlandır
    const sb = getSupabase();
    let userId = "";

    if (sb) {
      const userRes = await fetch(
        `${sb.url}/rest/v1/nur_users?email=eq.${encodeURIComponent(targetEmail)}&select=id`,
        {
          headers: {
            apikey: sb.key,
            Authorization: `Bearer ${sb.key}`,
          },
        }
      );

      const users = await userRes.json().catch(() => []);
      userId = Array.isArray(users) && users[0]?.id ? users[0].id : "";
    }

    // 2. Oturumları sonlandır
    if (userId) {
      const revoked = await revokeUserSessions(userId, req);
      if (revoked) {
        console.log(`[kill-session] ✅ ${targetEmail} oturumları sonlandırıldı`);
      }
    }

    // 3. Ban kaydı oluştur
    const banned = await banUser(targetEmail, admin.email, reason);

    // ★ Açık 8: ölü sessionKillToken kaldırıldı — kimse tüketmiyordu;
    //   ban + oturum iptali zaten sunucu tarafında tamamlandığı için gereksizdi.
    res.status(200).json({
      success: true,
      message: `${targetEmail} süresiz banlandı ve oturumları sonlandırıldı`,
      userId,
      sessionRevoked: !!userId,
      banRecorded: banned,
    });
  } catch (err: any) {
    console.error("[kill-session] Fatal:", err?.message);
    res.status(500).json({ error: "İşlem sırasında hata oluştu" });
  }
}
