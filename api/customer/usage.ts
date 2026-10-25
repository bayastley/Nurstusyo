import type { VercelRequest, VercelResponse } from "@vercel/node";

// ════════════════════════════════════════════════════════
// CUSTOMER USAGE — BÖLÜM KULLANIM KAYDI (25.10, sahibin emri)
//   POST { section } → RPC nur_usage_hit → haftalık toplama.
//   • Oturum LUIMSUZ: misafir dahil herkes sayılır (kullanıcı kimliği YOK —
//     yalnız bölüm adı + hafta; toplama istatistik, GDPR-dostu).
//   • Sessiz rate limit: IP/60sn aşırı istek yutulur (analitik spam koruması).
// ════════════════════════════════════════════════════════

declare const process: { env: Record<string, string | undefined> };

// Basit bellek-içi rate limit (Vercel instance başına — analitik için yeterli)
const __RL = new Map<string, number[]>();
function rlOk(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (__RL.get(key) || []).filter((h) => h >= now - windowMs);
  if (hits.length >= max) { __RL.set(key, hits); return false; }
  hits.push(now);
  __RL.set(key, hits);
  if (__RL.size > 10000) { for (const k of __RL.keys()) { __RL.delete(k); if (__RL.size <= 5000) break; } }
  return true;
}

function requireAllowedOrigin(req: VercelRequest, res: VercelResponse): boolean {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";
  const referer = typeof req.headers.referer === "string" ? req.headers.referer : "";
  const allowed = new Set(["https://nurstudyo.com", "https://www.nurstudyo.com", "http://localhost:5173", "http://localhost:5174", "http://localhost:5199"]);
  if (!origin && !referer) return true;
  if (origin && allowed.has(origin)) return true;
  if (referer) { try { if (allowed.has(new URL(referer).origin)) return true; } catch { /* ignore */ } }
  res.status(403).json({ ok: false, error: "İzin verilmeyen istek kaynağı" });
  return false;
}

function ipKey(req: VercelRequest): string {
  const forwarded = String(req.headers["cf-connecting-ip"] || req.headers["x-real-ip"] || String(req.headers["x-forwarded-for"] || "").split(",")[0] || "").trim();
  return forwarded || "unknown";
}

function supabaseConfig() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim().replace(/^["']+|["']+$/g, "").replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) return null;
  return { url, key };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  if (!requireAllowedOrigin(req, res)) return;

  const body = req.body as { section?: string } | undefined;
  const section = String(body?.section || "").toLowerCase().trim();
  if (section.length < 2 || section.length > 40 || !/^[a-z0-9_-]+$/.test(section)) {
    return res.status(200).json({ ok: false, error: "Geçersiz bölüm" });
  }
  if (!rlOk(`usage:${ipKey(req)}`, 60, 60_000)) return res.status(200).json({ ok: true, throttled: true });

  const sb = supabaseConfig();
  if (!sb) return res.status(200).json({ ok: false, error: "Analitik servisi yapılandırılmamış" });

  try {
    const rpcRes = await fetch(`${sb.url}/rest/v1/rpc/nur_usage_hit`, {
      method: "POST",
      headers: { apikey: sb.key, Authorization: `Bearer ${sb.key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ p_section: section }),
      cache: "no-store",
    });
    return res.status(200).json({ ok: rpcRes.ok });
  } catch {
    return res.status(200).json({ ok: false });
  }
}
