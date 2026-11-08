import type { VercelRequest, VercelResponse } from "@vercel/node";
import { adminFromCookie } from "../admin/actionYardimcilar.js";
import { logAdminAction } from "../_shared/supabase.js";
import { assertOrigin } from "../_shared/origin.js";
import { logServerError } from "../_shared/serverErrorLog.js";

// ═══════════════════════════════════════════════════════════════
// ★ 02.11 KISSA KASASI — EKLE / ÇIKAR (ADMIN)
//   POST /api/kissalar/ekle
//   body {
//     action: "ekle" | "sil",
//     id?: string,            // ekle: opsiyonel ("ak-..." otomatik)
//     kategori, baslik, hikaye, hikmet, kaynak?: string,
//     ceviri?: { en?, ar?, id?, ur?: { baslik?, hikaye?, hikmet? } }
//   }
//   → Admin panel Menkıbeler sekmesinden çağrılır; Supabase
//     nur_kissalar tablosuna upsert / delete yapar. Kimlik doğrulaması
//     adminFromCookie ile (üçlü katman: JWT + env whitelist + DB).
// ═══════════════════════════════════════════════════════════════

declare const process: { env: Record<string, string | undefined> };

const SUPA_URL = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

type CeviriDil = { baslik?: string; hikaye?: string; hikmet?: string };
type Karma = { action: "ekle" | "sil"; id?: string; kategori?: string; baslik?: string; hikaye?: string; hikmet?: string; kaynak?: string; ceviri?: Record<string, CeviriDil> };

/** Basit sanitize: kontrol karakterlerini temizle, uzunluk sınırla */
function güvenli(v: unknown, max: number): string {
  const s = String(v ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
  return s.slice(0, max);
}



export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") { res.status(405).json({ ok: false, error: "POST only" }); return; }
  if (!assertOrigin(req, res)) return;
  if (!SUPA_URL || !SUPA_KEY) { res.status(500).json({ ok: false, error: "Supabase sunucu ayarları eksik" }); return; }

  const admin = await adminFromCookie(req);
  if (!admin) { res.status(403).json({ ok: false, error: "Admin yetkisi gerekli" }); return; }

  const body = (req.body || {}) as Karma;
  const action = body.action === "sil" ? "sil" : "ekle";

  try {
    if (action === "sil") {
      const id = güvenli(body.id, 60);
      if (!id) { res.status(400).json({ ok: false, error: "id gerekli" }); return; }
      await fetch(`${SUPA_URL}/rest/v1/nur_kissalar?id=eq.${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, "Content-Type": "application/json" },
      });
      await logAdminAction({ adminId: admin.id, adminEmail: admin.email, action: "kissa_sil", target: id }).catch(() => undefined);
      res.status(200).json({ ok: true });
      return;
    }

    const kategori = güvenli(body.kategori, 60);
    const baslik = güvenli(body.baslik, 200);
    const hikaye = güvenli(body.hikaye, 8000);
    const hikmet = güvenli(body.hikmet, 1200);
    const kaynak = güvenli(body.kaynak, 300);
    if (!kategori || !baslik || !hikaye || !hikmet) {
      res.status(400).json({ ok: false, error: "kategori, baslik, hikaye ve hikmet gerekli" });
      return;
    }
    const id = güvenli(body.id, 60) || `ak-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

    const cev = body.ceviri || {};
    const d = (dil: string): Record<string, string> => {
      const o = (cev[dil] || {}) as CeviriDil;
      return {
        [`baslik_${dil}`]: güvenli(o.baslik, 200),
        [`hikaye_${dil}`]: güvenli(o.hikaye, 8000),
        [`hikmet_${dil}`]: güvenli(o.hikmet, 1200),
      };
    };

    const row = {
      id,
      kategori,
      baslik,
      hikaye,
      hikmet,
      kaynak,
      ...d("en"), ...d("ar"), ...d("id"), ...d("ur"),
      aktif: true,
      created_by: admin.email,
      updated_at: new Date().toISOString(),
    };

    const response = await fetch(`${SUPA_URL}/rest/v1/nur_kissalar?on_conflict=id`, {
      method: "POST",
      headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify(row),
    });
    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      res.status(502).json({ ok: false, error: `Supabase ${response.status}`, detay: errText.slice(0, 200) });
      return;
    }
    await logAdminAction({ adminId: admin.id, adminEmail: admin.email, action: "kissa_ekle", target: id, metadata: { baslik } }).catch(() => undefined);
    res.status(200).json({ ok: true, id });
  } catch (e) {
    await logServerError(req, e, "api/kissalar/ekle");
    res.status(500).json({ ok: false, error: (e as Error)?.message || "kissa ekleme hatası" });
  }
}
