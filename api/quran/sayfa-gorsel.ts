// ══════════════════════════════════════════════════════════════
// MUSHAF SAYFA GÖRSELİ PROXYSİ — GET /api/quran/sayfa-gorsel?sayfa=1..604
//
// NEDEN VAR (27.11):
//   Diyanet'in beyaz/renkli çerçeveli Medine mushafı görselleri (1280×2185)
//   TARAYICIDAN yüklenmiyordu (curl 200, Chromium "hata") → istemci şeffaf
//   yedek PNG'ye düşüyor, sayfa süslemesiz/okunaksız görünüyordu.
//   Artık görsel kendi sunucumuzdan (same-origin) servis edilir: CSP, hotlink
//   ve tarayıcı TLS sorunları devre dışı kalır; CDN'de 1 yıl cache'lenir.
//
// Güvenlik: yalnız GET, origin kontrolü, IP başına dakikalık tavan, sabit dış
// adres (SSRF yok), yalnız image/* kabul edilir, boyut sınırlı.
// Metin değişmez → bellek + CDN cache.
// ══════════════════════════════════════════════════════════════
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { assertOrigin } from "../_shared/origin.js";
import { rateLimit } from "../_shared/rateLimit.js";

const SAYFA_SAYISI = 604;
const AZAMI_BAYT = 4 * 1024 * 1024;      // tek sayfa ~0,5 MB
const BELLEK_SAYFA = 60;                 // instance içi: ~30 MB tavan
const KAYNAK = (n: number): string =>
  `https://kuran.diyanet.gov.tr/mushaf/data/pages/2X/${String(n - 1).padStart(3, "0")}.png`;

const __CACHE = new Map<number, Buffer>();

function gonder(res: VercelResponse, buf: Buffer): void {
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "public, max-age=604800, s-maxage=31536000, immutable");
  res.statusCode = 200;
  res.end(buf);
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "GET") {
    res.status(405).json({ ok: false, error: "Yalnız GET" });
    return;
  }
  if (!assertOrigin(req, res)) return;
  if (!(await rateLimit(req, res, "quran-sayfa-gorsel", 120, 60_000))) return;

  const sayfa = parseInt(String(req.query.sayfa ?? ""), 10);
  if (!(sayfa >= 1 && sayfa <= SAYFA_SAYISI)) {
    res.status(400).json({ ok: false, error: "sayfa 1-604 aralığında olmalı" });
    return;
  }

  const bellek = __CACHE.get(sayfa);
  if (bellek) {
    gonder(res, bellek);
    return;
  }

  try {
    const cevap = await fetch(KAYNAK(sayfa), {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
        Accept: "image/png,image/*;q=0.8",
        Referer: "https://kuran.diyanet.gov.tr/",
      },
      cache: "no-store",
    });
    if (!cevap.ok) throw new Error(`diyanet ${cevap.status}`);
    const tip = String(cevap.headers.get("content-type") || "");
    if (!tip.startsWith("image/")) throw new Error("beklenmeyen içerik");
    const buf = Buffer.from(await cevap.arrayBuffer());
    if (buf.length === 0 || buf.length > AZAMI_BAYT) throw new Error("boyut");
    if (__CACHE.size < BELLEK_SAYFA) __CACHE.set(sayfa, buf);
    gonder(res, buf);
  } catch {
    // Zarif düşüş: istemci bir sonraki kaynağa geçer
    res.setHeader("Cache-Control", "no-store");
    res.status(404).json({ ok: false, error: "Mushaf sayfası alınamadı" });
  }
}
