import type { VercelRequest, VercelResponse } from "@vercel/node";

// ═══════════════════════════════════════════════════════════════
// ★ 02.11 KISSA KASASI — GENEL OKUMA UCU
//   GET /api/kissalar → Supabase nur_kissalar tablosundaki aktif
//   kıssaları döndürür. Herkes (anon dahil) okuyabilir; admin
//   eklediği kıssalar tüm kullanıcılara bu uçla gelir.
//   Tablo henüz kurulmadıysa boş liste döner — statik kasa çalışır.
// ═══════════════════════════════════════════════════════════════

declare const process: { env: Record<string, string | undefined> };

const SUPA_URL = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") { res.status(405).json({ ok: false, error: "GET only" }); return; }
  if (!SUPA_URL || !SUPA_KEY) { res.status(200).json({ ok: true, kissalar: [] }); return; }
  try {
    const response = await fetch(`${SUPA_URL}/rest/v1/nur_kissalar?aktif=eq.true&order=created_at.asc&select=*`, {
      headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, "Content-Type": "application/json" },
    });
    const text = await response.text();
    if (!response.ok) {
      // Tablo henüz yok / erişim yok → kasa boş; statik kıssalar normal gösterilir
      res.status(200).json({ ok: true, kissalar: [] });
      return;
    }
    const rows = JSON.parse(text || "[]");
    res.status(200).json({ ok: true, kissalar: Array.isArray(rows) ? rows : [] });
  } catch {
    res.status(200).json({ ok: true, kissalar: [] });
  }
}
