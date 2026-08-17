import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "../_shared/auth";
import { rateLimit } from "../_shared/rateLimit";
import { requireAllowedOrigin } from "../_shared/security";

declare const process: { env: Record<string, string | undefined> };

// ════════════════════════════════════════════════════════
// EMAIL PAZARLAMA RIZASI — KVKK'ya uygun AYRI açık rıza uctu.
// Hesap oluşturma (Google girişi) sözleşme gereği yapılır ve
// buna onay kutusu GEREKMEZ; ama pazarlama e-postası göndermek
// BAĞIMSIZ bir işleme amacıdır ve kanunen AYRI, geri alınabilir
// bir rıza gerektirir. Bu endpoint sadece BU rızayı yönetir.
// ════════════════════════════════════════════════════════

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
  if (!requireAllowedOrigin(req, res)) return;
  if (!rateLimit(req, res, "marketing:consent", 20, 60_000)) return;

  const user = requireAuth(req, res);
  if (!user) return;

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
