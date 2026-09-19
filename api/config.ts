import type { VercelRequest, VercelResponse } from "@vercel/node";
import { rateLimit } from "./_shared/rateLimit";

function supabaseConfig() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) throw new Error("Supabase sunucu ayarları eksik");
  return { url, key };
}

async function query<T>(path: string): Promise<T> {
  const { url, key } = supabaseConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" });
  if (!response.ok) throw new Error(await response.text());
  return await response.json() as T;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  // ★ Merkezi rate limit — config okuma ucudur ama tarayıcıda sürekli çağrıldığı için
  //   tarama/flood koruması şart (dakikada 120 — normal kullanıcıyı asla boğmaz)
  if (!rateLimit(req, res, "config", 120, 60_000)) return;
  try {
    const now = encodeURIComponent(new Date().toISOString());
    const [announcements, featureLocks, siteSettings] = await Promise.all([
      query<any[]>(`nur_announcements?active=eq.true&starts_at=lte.${now}&ends_at=gte.${now}&order=updated_at.desc&limit=1&select=*`),
      query<any[]>("nur_feature_locks?active=eq.true&select=feature_id,lock_level,updated_at"),
      query<any[]>("nur_site_settings?key=eq.maintenance&select=value,updated_at").catch(() => [] as any[]),
    ]);
    const maintenanceRow = Array.isArray(siteSettings) ? siteSettings[0] : null;
    const maintenanceValue = maintenanceRow?.value && typeof maintenanceRow.value === "object" ? { ...maintenanceRow.value, updated_at: maintenanceRow.updated_at } : null;
    return res.status(200).json({
      ok: true,
      announcement: announcements[0] ?? null,
      featureLocks,
      maintenance: maintenanceValue,
    });
  } catch (error) {
    console.error("[Public Config Error]", error);
    return res.status(200).json({ ok: true, announcement: null, featureLocks: [], maintenance: null });
  }
}
