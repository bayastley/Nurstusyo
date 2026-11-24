import type { VercelRequest, VercelResponse } from "@vercel/node";

declare const process: { env: Record<string, string | undefined> };

const DEFAULT_ALLOWED_ORIGINS = [
  "https://nurstudyo.com",
  "https://www.nurstudyo.com",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5199",
];

function allowedOrigins(): Set<string> {
  const envOrigins = (process.env.NUR_ALLOWED_ORIGINS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return new Set([...DEFAULT_ALLOWED_ORIGINS, ...envOrigins]);
}

/**
 * İSTEK KENDİ SUNUCUMUZA MI GELİYOR?
 * ★ 24.11 CANLI FIX: tarayıcı canlıda /api/ban/status ve /api/roadmap için
 *   403 "İzin verilmeyen istek kaynağı" alıyordu. Sebep: beyaz liste yalnız
 *   https://www.nurstudyo.com + https://nurstudyo.com biliyordu; site http ile,
 *   önizleme/alternatif alan adıyla ya da Host başlığı farklıyken açıldığında
 *   aynı-köken isteği bile reddediliyordu. CSRF koruması "kaynak = hedef host"
 *   karşılaştırmasıyla yapılır; bu yüzden Host başlığıyla eşleşen kaynak kabul edilir.
 */
function ayniKoken(adres: string, host: string): boolean {
  try {
    const gelen = new URL(adres).hostname.toLowerCase().replace(/^www\./, "");
    const hedef = host.toLowerCase().split(":")[0].replace(/^www\./, "");
    return Boolean(gelen) && gelen === hedef;
  } catch {
    return false;
  }
}

export function originAllowed(req: VercelRequest, opts?: { allowMissing?: boolean }): boolean {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";
  const referer = typeof req.headers.referer === "string" ? req.headers.referer : "";
  const allowed = allowedOrigins();

  // Varsayılan FAIL-CLOSED. allowMissing:true sadece beacon/analytics/push gibi Origin göndermeyebilen uçlar için.
  if (!origin && !referer) return opts?.allowMissing === true;

  if (origin && allowed.has(origin)) return true;
  if (referer) {
    try {
      if (allowed.has(new URL(referer).origin)) return true;
    } catch {
      /* beklenen: bozuk referer */
    }
  }

  // Aynı köken (Host ile eşleşen kaynak) her zaman geçerli — şema/alt alan farkı engel değil
  const host = String(req.headers.host || "");
  if (host) {
    if (origin && ayniKoken(origin, host)) return true;
    if (referer && ayniKoken(referer, host)) return true;
  }
  return false;
}

export function assertOrigin(req: VercelRequest, res: VercelResponse, opts?: { allowMissing?: boolean }): boolean {
  if (originAllowed(req, opts)) return true;
  res.status(403).json({ ok: false, error: "İzin verilmeyen istek kaynağı" });
  return false;
}
