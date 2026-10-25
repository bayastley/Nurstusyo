import type { VercelRequest, VercelResponse } from "@vercel/node";
import { adminFromCookie, db } from "./actionYardimcilar.js";

// ════════════════════════════════════════════════════════
// ADMIN USAGE — BÖLÜM KULLANIM RAPORU (25.10, sahibin emri)
//   GET /api/admin/usage → son 50 haftanın bölüm kullanım dağılımı.
//   Yalnızca admin oturumu okur. İstemci (AdminKullanimTab) hafta seçip
//   yüzde dağılımını çizer — sunucu ham satırları verir (week_start, section, hits).
// ════════════════════════════════════════════════════════

declare const process: { env: Record<string, string | undefined> };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "GET" && req.method !== "POST") return res.status(405).json({ ok: false, error: "Method Not Allowed" });

  const admin = await adminFromCookie(req);
  if (!admin) return res.status(403).json({ ok: false, error: "Admin yetkisi gerekli" });

  try {
    const rows = await db<Array<{ week_start: string; section: string; hits: number }>>(
      "nur_usage_stats?order=week_start.desc&limit=3000"
    );
    // ★ İSTEMCİ SÖZLEŞMESİ (AdminDashboardModal.loadKullanim + AdminKullanimTab):
    //   { ok: true, haftalar: [{ pazar: "YYYY-MM-DD", bolumler: [{ bolum, adet, yuzde }] }] }
    //   — en yeni hafta dizide ilk. "pazar" adı tarih-sonu-günü anlattığında okumayı
    //   tekilleştirir (SQL ISO haftayı pazartesi başlaır, alan adı sabit kalır).
    const haftalarMap = new Map<string, Map<string, number>>();
    for (const row of rows || []) {
      const week = String(row.week_start || "").slice(0, 10);
      const section = String(row.section || "").slice(0, 40);
      if (!week || !section) continue;
      let h = haftalarMap.get(week);
      if (!h) { h = new Map(); haftalarMap.set(week, h); }
      h.set(section, (h.get(section) || 0) + Number(row.hits || 0));
    }
    const sonlar = [...haftalarMap.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1)).slice(0, 50);
    const haftalar = sonlar.map(([pazar, h]) => {
      const toplam = [...h.values()].reduce((s, n) => s + n, 0);
      return {
        pazar,
        toplam,
        bolumler: [...h.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([bolum, hits]) => ({
            bolum,
            adet: hits,
            yuzde: toplam > 0 ? Math.round((hits / toplam) * 1000) / 10 : 0,
          })),
      };
    });
    return res.status(200).json({ ok: true, haftalar });
  } catch (error) {
    void error;
    return res.status(200).json({ ok: false, error: "Rapor okunamadı" });
  }
}
