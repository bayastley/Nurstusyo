// ════════════════════════════════════════════════════════
// ZİKİR GÜNLÜK ARŞİV CRON — 00:05 UTC (vercel.json: /api/zikir/arsivle)
//   Dünün kovasını kapatır: kova(dün) += koşu toplamı − son arşiv anlık görüntüsü.
//   Böylece kimse zikir çekmeyen günlerde de kova satırı OLUR; "7 GÜN" penceresi
//   gerçekten son 7 günü kapsar ve haftalık toplam eksiksiz hesaplanır.
//   Cron bir gece atlanırsa fark sonraki arşive devredilir — toplam hep doğru.
//
//   KORUMA: CRON_SECRET fail-closed (push/send ile aynı desen) — secret tanımsızsa
//   endpoint tamamen kilitli; canli-tarama girişsiz 401 bekler.
//   RPC yoksa (SQL henüz çalıştırılmadıysa) dürüst 503: SAHTE BAŞARI YOK.
// ═════════════════════════════════ topluluk.ts deseninden kopya başlangıç
declare const process: { env: Record<string, string | undefined> };
function supabaseConfig() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) return null;
  return { url, key };
}
async function db<T>(path: string, init?: RequestInit): Promise<T> {
  const cfg = supabaseConfig()!;
  const response = await fetch(`${cfg.url}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}`, "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  const text = await response.text();
  if (!response.ok) throw new Error(text || `Supabase ${response.status}`);
  return (text ? JSON.parse(text) : null) as T;
}
// ═════════════════════════════════ desen sonu

import crypto from "crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Method Not Allowed" });

  const secret = process.env.CRON_SECRET || "";
  if (!secret) {
    console.error("[zikir/arsivle] CRON_SECRET tanımsız — endpoint kilitli");
    return res.status(503).json({ ok: false, error: "Arşiv servisi yapılandırılmamış" });
  }
  const auth = String(req.headers.authorization || "");
  const a = Buffer.from(auth);
  const b = Buffer.from(`Bearer ${secret}`);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(401).json({ ok: false, error: "Yetkisiz" });
  }

  const cfg = supabaseConfig();
  if (!cfg) return res.status(503).json({ ok: false, error: "Veritabanı yapılandırılmamış" });

  try {
    const rpc = await db<unknown>("rpc/nur_zikir_gun_arsivle", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ p_tarih: null }),
    });
    const row = (Array.isArray(rpc) ? rpc[0] : rpc) as { sonuc: boolean; gun_t: string; kova_adet: number; mesaj: string | null } | null;
    if (!row) return res.status(503).json({ ok: false, error: "Arşiv RPC boş döndü" });
    if (!row.sonuc) return res.status(503).json({ ok: false, error: row.mesaj || "ARSIV_BASARISIZ" });
    return res.status(200).json({ ok: true, gun: row.gun_t, kova: Number(row.kova_adet) || 0, mesaj: row.mesaj });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    // 404/42P01 → RPC henüz yok (SQL çalıştırılmamış). Dürüst söyle — 200 SAHTE OLMAZ.
    const sqlYok = /\b404\b|42P01|does not exist|Could not find the function/i.test(msg);
    console.error("[zikir/arsivle]", msg.slice(0, 400));
    if (sqlYok) return res.status(503).json({ ok: false, error: "SQL_CALISTIRILMAMIS" });
    return res.status(503).json({ ok: false, error: "ARSIV_HATASI" });
  }
}
