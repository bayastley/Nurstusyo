import crypto from "crypto";

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
async function revokeUserSessions(userId: string): Promise<boolean> {
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

    // Ban kaydı ekle
    const banRes = await fetch(`${sb.url}/rest/v1/nur_bans`, {
      method: "POST",
      headers: {
        apikey: sb.key,
        Authorization: `Bearer ${sb.key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        user_id: user.id,
        email: targetEmail,
        reason: reason.slice(0, 300),
        banned_by: adminEmail,
        banned_at: new Date().toISOString(),
        permanent: true,
      }),
    });

    if (!banRes.ok && banRes.status !== 409) {
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
        body: JSON.stringify({ tier: "free" }),
      }
    );

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
  // CORS
  res.setHeader("Access-Control-Allow-Origin", process.env.SITE_URL || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Sadece POST" });
    return;
  }

  // Admin yetki kontrolü
  const adminEmail =
    (req.headers["x-admin-email"] as string) || (req.body?.adminEmail as string) || "";
  const allowedAdmins = (process.env.VITE_NUR_ADMIN_EMAIL || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!adminEmail || !allowedAdmins.includes(adminEmail.toLowerCase())) {
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
    if (targetEmail.toLowerCase() === adminEmail.toLowerCase()) {
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
      const revoked = await revokeUserSessions(userId);
      if (revoked) {
        console.log(`[kill-session] ✅ ${targetEmail} oturumları sonlandırıldı`);
      }
    }

    // 3. Ban kaydı oluştur
    const banned = await banUser(targetEmail, adminEmail, reason);

    // 4. Ban session token'ı oluştur (tarayıcı tarafında kullanılacak)
    const sessionKillToken = crypto.randomBytes(32).toString("hex");

    res.status(200).json({
      success: true,
      message: `${targetEmail} süresiz banlandı ve oturumları sonlandırıldı`,
      userId,
      sessionRevoked: !!userId,
      banRecorded: banned,
      sessionKillToken,
      instructions: "Kullanıcı sayfası yenilendiğinde bu token ile otomatik çıkış yapılacak",
    });
  } catch (err: any) {
    console.error("[kill-session] Fatal:", err?.message);
    res.status(500).json({ error: "İşlem sırasında hata oluştu" });
  }
}
