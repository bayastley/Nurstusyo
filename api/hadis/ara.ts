// ════════════════════════════════════════════════════════════════
// HADİS ARAMA PROXY — kullanıcı kararı 28.09: "hadis bankası Sahih
// Buhari/Müslim'e bağlansın, aranan kelimeyi eksiksiz çeksin"
// (ör. "aile" yazınca da sonuç gelsin).
//
// KAYNAKLAR:
//  1) dorar.net — anahtarsız, ücretsiz; külliyat arama (Buhari, Müslim
//     ve diğer kitaplar), metin + tahric (kaynak) döner.
//  2) sunnah.com — API anahtarı varsa (HADITH_API_KEY env) kullanılır;
//     yalnız Buhârî + Müslim, İngilizce/拉丁 metin.
//
// GÜVENLİK: yalnızca GET; origin kontrolü (_shared/security) + rate
// limit; girdi temizlenir; dış adresler sabit (SSRF yok). Cache'li.
// ════════════════════════════════════════════════════════════════
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAllowedOrigin } from "../_shared/security";
import { rateLimit } from "../_shared/rateLimit";

// ─── Girdi temizleme — kontrolsüz karakterleri at, 120 karakter yeter ───
function temizle(raw: string): string {
  return raw
    .replace(/[<>;"'`\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

interface HadisSonuc {
  metin: string;
  kaynak: string;
  derece: "sahih" | "hasan" | "zayif" | "bilinmiyor";
  kitap: string;
  dil: "tr" | "ar" | "en";
}

// ─── dorar.net derece metnini standart hale getir ───
function dorarDerece(bilgi: string): HadisSonuc["derece"] {
  if (/صحيح|sahih/i.test(bilgi)) return "sahih";
  if (/حسن|hasan/i.test(bilgi)) return "hasan";
  if (/ضعيف|daif|zaif|zayif/i.test(bilgi)) return "zayif";
  return "bilinmiyor";
}

function dorarKitap(bilgi: string): string {
  if (/بخاري|bukhari/i.test(bilgi)) return "Buhârî";
  if (/مسلم|muslim/i.test(bilgi)) return "Müslim";
  if (/ترمذي|tirmidh?i|tirmizi/i.test(bilgi)) return "Tirmizî";
  if (/أبو داود|ابن داود|abu dawud|ebu davud/i.test(bilgi)) return "Ebû Dâvûd";
  if (/نسائي|nasai/i.test(bilgi)) return "Nesâî";
  if (/ابن ماجه|ibn majah|ibn mace/i.test(bilgi)) return "İbn Mâce";
  if (/أحمد|ahmed/i.test(bilgi)) return "Müsned";
  return "Diğer";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS — yalnız sitemiz
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";
  const izinli = ["https://nurstudyo.com", "https://www.nurstudyo.com", "http://localhost:5173", "http://localhost:5174"];
  if (origin && izinli.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  if (!requireAllowedOrigin(req, res)) return;
  if (!(await rateLimit(req, res, "hadis-ara", 30, 60_000))) return;

  const q = temizle(String(req.query.q ?? ""));
  if (q.length < 2) return res.status(400).json({ ok: false, error: "Arama en az 2 karakter olmalı" });

  const sonuclar: HadisSonuc[] = [];

  // ─── 1) sunnah.com (API anahtarı varsa) — Buhârî + Müslim, İngilizce metin ───
  const apiKey = process.env.HADITH_API_KEY;
  if (apiKey) {
    try {
      const kitaplar = ["bukhari", "muslim"] as const;
      await Promise.all(kitaplar.map(async (kitap) => {
        const r = await fetch(`https://api.sunnah.com/v1/${kitap}/search/${encodeURIComponent(q)}?limit=5`, {
          headers: { "X-API-KEY": apiKey },
          signal: AbortSignal.timeout(8000),
        });
        if (!r.ok) return;
        const data = (await r.json()) as {
          data?: Array<{ hadithEnglish?: string; hadithArabic?: string; chapter?: { chapterName?: string }; hadithNumber?: number }>;
        };
        for (const h of (data.data ?? []).slice(0, 5)) {
          const metin = h.hadithEnglish || h.hadithArabic || "";
          if (!metin) continue;
          sonuclar.push({
            metin,
            kaynak: `Sahih ${kitap === "bukhari" ? "Buhârî" : "Müslim"}${h.chapter?.chapterName ? ` · ${h.chapter.chapterName}` : ""}${h.hadithNumber ? ` · ${h.hadithNumber}` : ""}`,
            derece: "sahih",
            kitap: kitap === "bukhari" ? "Buhârî" : "Müslim",
            dil: h.hadithEnglish ? "en" : "ar",
          });
        }
      }));
    } catch { /* sunnah.com kapalıysa dorar devam eder */ }
  }

  // ─── 2) dorar.net — anahtarsız külliyat arama (Arapça) ───
  if (sonuclar.length < 5) {
    try {
      const url = `https://dorar.net/dorar_api.json?skey=${encodeURIComponent(q)}`;
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (r.ok) {
        const data = (await r.json()) as { ahadith?: { result?: { html?: string } } };
        const html = data?.ahadith?.result?.html ?? "";
        // HTML kalıpları: metin <div class="hadith">, künye <div class="hadith-info">
        const metinler = [...html.matchAll(/class="hadith"[^>]*>([\s\S]*?)<\/div>/g)]
          .map((m) => m[1].replace(/<[^>]+>/g, "").trim()).filter(Boolean);
        const bilgiler = [...html.matchAll(/class="hadith-info"[^>]*>([\s\S]*?)<\/div>/g)]
          .map((m) => m[1].replace(/<[^>]+>/g, "").trim()).filter(Boolean);
        for (let i = 0; i < metinler.length && sonuclar.length < 12; i++) {
          const metin = metinler[i];
          const bilgi = bilgiler[i] ?? "";
          sonuclar.push({
            metin,
            kaynak: bilgi.slice(0, 200) || dorarKitap(bilgi),
            derece: dorarDerece(bilgi),
            kitap: dorarKitap(bilgi),
            dil: "ar",
          });
        }
      }
    } catch { /* dorar kapalıysa sunnah sonuçları kalır */ }
  }

  return res.status(200).json({ ok: true, q, sayi: sonuclar.length, sonuclar: sonuclar.slice(0, 12) });
}
