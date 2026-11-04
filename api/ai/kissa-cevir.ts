import type { VercelRequest, VercelResponse } from "@vercel/node";
import { adminFromCookie } from "../admin/actionYardimcilar.js";

// ═══════════════════════════════════════════════════════════════
// ★ 04.11 KISSA ÇEVİRİ (ADMIN) — 5 DİL: ÖNCE GPT (anahtar varsa),
//   YOKSA / HATA OLURSA MyMemory API — ANAHTARSIZ VE ÜCRETSİZ.
//   POST /api/ai/kissa-cevir
//   body { baslik?, hikaye, hikmet }
//   → { en, ar, id, ur } çevirisi döndürür; TR metin düz gösterilir.
//   KULLANICI EMRİ (04.11): "5 dil API veremem, sürekli ücretsiz olsun
//   anahtarsız" → MyMemory (api.mymemory.translated.net):
//     · API anahtarı YOK · CORS server-side · anonim ücretsiz
//     · uzun metni ~450 karakterlik cümle-parçalarına bölüp çevirir
//     · paragraf ayrımı (\n\n) korunur
//   Admin yetkisi üçlü katman: JWT + env whitelist + DB is_admin.
// ═══════════════════════════════════════════════════════════════

type Metin = { baslik?: string; hikaye?: string; hikmet?: string };

const HEDEF_DILLER = ["en", "ar", "id", "ur"] as const;
const MYMEM_PARCA = 450;

// — paragraf/­cümle sınırlarında böl: MyMemory q alanı ~500 karakter sınırı
function parcalaraBol(metin: string, limit = MYMEM_PARCA): string[] {
  const paragraflar = metin.split(/\n{2,}/);
  const cikti: string[] = [];
  for (const p of paragraflar) {
    const temiz = p.trim();
    if (!temiz) continue;
    if (temiz.length <= limit) { cikti.push(temiz); continue; }
    const cumleler = temiz.split(/(?<=[.!?।:؛])\s+/);
    let su = "";
    for (const c of cumleler) {
      const aday = su ? su + " " + c : c;
      if (aday.length > limit) {
        if (su) cikti.push(su.trim());
        // tek cümle limit'i aşarsa zorla böl
        if (c.length > limit * 2) {
          for (let k = 0; k < c.length; k += limit) cikti.push(c.slice(k, k + limit).trim());
          su = "";
        } else su = c;
      } else su = aday;
    }
    if (su.trim()) cikti.push(su.trim());
  }
  return cikti.length ? cikti : [metin.slice(0, limit)];
}

// — MyMemory: tr|<hedef> çevirisi; chunk'lar paralel, paragraflarla birleşir
async function myMemoryCevir(metin: string, hedefDil: string): Promise<string> {
  const ps = parcalaraBol(metin);
  const parcalar = await Promise.all(ps.map(async (parca) => {
    try {
      const u = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(parca)}&langpair=tr%7C${hedefDil}`;
      const r = await fetch(u, { signal: AbortSignal.timeout(12000) } as RequestInit);
      if (!r.ok) return parca;
      const j = (await r.json()) as { responseData?: { translatedText?: string }; responseStatus?: number | string };
      const t = String(j?.responseData?.translatedText || "");
      if (!t || /MYMEMORY WARNING/i.test(t) || t.trim() === parca.trim()) return parca;
      return t;
    } catch { return parca; }
  }));
  return parcalar.join("\n\n");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") { res.status(405).json({ ok: false, error: "POST only" }); return; }
  const admin = await adminFromCookie(req);
  if (!admin) { res.status(403).json({ ok: false, error: "Admin yetkisi gerekli" }); return; }

  const body = (req.body || {}) as Metin;
  const baslik = String(body.baslik || "").slice(0, 300);
  const hikaye = String(body.hikaye || "").slice(0, 8000);
  const hikmet = String(body.hikmet || "").slice(0, 1200);
  if (!hikaye && !hikmet) { res.status(400).json({ ok: false, error: "metin boş" }); return; }

  const apiKey = process.env.OPENAI_API_KEY;

  // — Yol 1: anahtar varsa GPT (en kaliteli); hata olursa MyMemory'ye düş.
  let ceviri: Record<string, Metin> | null = null;
  let sonHata = "";
  if (apiKey) {
    try {
      const talimat = `Aşağıdaki İslami kıssa metnini Türkçeden şu dillere çevir: ${HEDEF_DILLER.join(", ")}.
YALNIZCA geçerli JSON döndür, yorum yazma. Şema:
{"en":{"baslik":"","hikaye":"","hikmet":""},"ar":{"baslik":"","hikaye":"","hikmet":""},"id":{"baslik":"","hikaye":"","hikmet":""},"ur":{"baslik":"","hikaye":"","hikmet":""}}
- hikaye alanındaki paragrafları koru; paragraf ayrımı için çift yeni satır (\\n\\n) kullan.
- Arapça ve Urduca metinler kendi yazım yönleriyle (RTL) doğal dursun.
- İslami terimleri (kıssa, sahâbî, halife, sabır vb.) yaygın kullanımlarıyla ver; anlamı bozma.
- JSON dışında hiçbir şey yazma.
BAŞLIK: ${baslik}
HİKÂYE: ${hikaye}
HİKMET: ${hikmet}`;
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "Sen profesyonel bir çevirmensin; İslami kıssa metinlerini 5 dile birebir, doğal ve akıcı çevirirsin. Çıktın saf JSON'dur — kod bloğu veya açıklama ASLA yazmazsın." },
            { role: "user", content: talimat },
          ],
          max_tokens: 9000,
          temperature: 0.2,
          response_format: { type: "json_object" },
        }),
        signal: AbortSignal.timeout(45000),
      });
      if (!response.ok) throw new Error(`OpenAI hatası ${response.status}`);
      const data = await response.json();
      const content = String(data.choices?.[0]?.message?.content || "{}");
      const ham = content.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
      const cikti = JSON.parse(ham) as Record<string, Metin>;
      ceviri = {};
      for (const d of HEDEF_DILLER) {
        const o = cikti?.[d];
        if (o && typeof o === "object") {
          ceviri[d] = {
            baslik: String(o.baslik || "").slice(0, 300),
            hikaye: String(o.hikaye || "").slice(0, 8000),
            hikmet: String(o.hikmet || "").slice(0, 1200),
          };
        }
      }
      if (Object.keys(ceviri).length === 0) ceviri = null;
    } catch (e) { sonHata = (e as Error)?.message || "openai hatası"; }
  }

  // — Yol 2: MyMemory (ANAHTARSIZ / ÜCRETSİZ) — anahtar yoksa veya GPT başarısızsa
  if (!ceviri) {
    try {
      const elemanlar: Array<[string, string]> = [];
      if (baslik) elemanlar.push(["baslik", baslik]);
      if (hikaye) elemanlar.push(["hikaye", hikaye]);
      if (hikmet) elemanlar.push(["hikmet", hikmet]);
      ceviri = {};
      await Promise.all(HEDEF_DILLER.map(async (d) => {
        const o: Metin = {};
        for (const [alan, metin] of elemanlar) o[alan] = await myMemoryCevir(metin, d);
        ceviri![d] = o;
      }));
      const dolu = HEDEF_DILLER.every((d) => !!ceviri?.[d]);
      if (!dolu) ceviri = null;
    } catch (e) { sonHata = sonHata || ((e as Error)?.message || "mymemory hatası"); }
  }

  if (!ceviri) { res.status(502).json({ ok: false, error: "Çeviri üretilemedi (GPT + MyMemory başarısız)", detay: sonHata.slice(0, 200) }); return; }
  res.status(200).json({ ok: true, ceviri });
}
