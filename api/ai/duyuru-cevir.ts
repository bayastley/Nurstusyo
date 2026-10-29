import type { VercelRequest, VercelResponse } from "@vercel/node";

// ═══════════════════════════════════════════════════════════════
// ★ 29.10 DUYURU OTOMATİK ÇEVİRİ (kullanıcı emri):
//   "ben türkçe duyuru yapmış olabilirim ama onlar hangi dilde alacağını
//    kendisi belirlesin — ben türkçe yazayım ama adam dili hangisine
//    çevirmişse ona çevrilsin"
//   → Admin TR yazar; /api/ai/duyuru-cevir seçili dili döndürür.
//   GPT-4o-mini tek çağrıda 4 dil (en/ar/id/ur) × 3 alan (title/message/detail)
//   üretir. İstemci localStorage'da duyuru id+updated_at anahtarına cache'ler —
//   her cihaz, her duyuru sürümü için EN FAZLA 1 çağrı.
//   TR kullanıcıya ekstra maliyet yok (çeviri istenmez, TR metin düz gösterilir).
// ═══════════════════════════════════════════════════════════════

const __RL = new Map<string, number[]>();
function rateLimitOk(ip: string): boolean {
  const now = Date.now();
  const arr = (__RL.get(ip) || []).filter((t) => now - t < 60_000);
  arr.push(now);
  __RL.set(ip, arr);
  return arr.length <= 8; // 8 çağrı/dk — normal akışta 1 duyunun 1 çevirlisi var
}

type Metin = { title?: string; message?: string; detail?: string };

const HEDEF_DILLER = ["en", "ar", "id", "ur"] as const;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") { res.status(405).json({ error: "POST only" }); return; }
  const xff = req.headers["x-forwarded-for"];
  const ip = (typeof xff === "string" ? xff : Array.isArray(xff) ? xff[0] || "" : "").split(",")[0].trim() || "bilinmiyor";
  if (!rateLimitOk(ip)) { res.status(429).json({ error: "rate limit" }); return; }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) { res.status(500).json({ error: "OPENAI_API_KEY tanımlı değil" }); return; }

  const body = (req.body || {}) as Metin;
  const title = String(body.title || "").slice(0, 300);
  const message = String(body.message || "").slice(0, 1200);
  const detail = String(body.detail || "").slice(0, 4000);
  if (!title && !message) { res.status(400).json({ error: "metin boş" }); return; }

  const detailParca = detail ? `\n\nDETAY:\n${detail}` : "";
  const talimat = `Aşağıdaki İslami uygulama duyurusunu Türkçeden şu dillere çevir: ${HEDEF_DILLER.join(", ")}.
YALNIZCA geçerli JSON döndür, yorum yazma. Şema:
{"en":{"title":"","message":"","detail":""},"ar":{"title":"","message":"","detail":""},"id":{"title":"","message":"","detail":""},"ur":{"title":"","message":"","detail":""}}
- detail alanı metinde yoksa her dilde boş string "" bırak.
- Arapça ve Urduca metinler kendi yazım yönleriyle (RTL) doğal dursun.
- Duygunun dozunu ve kısalığını koru; İslami terimleri (namaz, dua, kısa video vb.) yaygın kullanımlarıyla ver.
- JSON dışında hiçbir şey yazma.
DUYURU BAŞLIK: ${title}
DUYURU MESAJ: ${message}${detailParca}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Sen profesyonel bir çevirmensin; İslami uygulamalara özgü duyuru metinlerini 5 dile birebir, doğal ve kısa çevirirsin. Çıktın saf JSON'dur — kod bloğu veya açıklama ASLA yazmazsın." },
          { role: "user", content: talimat },
        ],
        max_tokens: 2200,
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
    });
    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      res.status(502).json({ error: `OpenAI hatası ${response.status}`, detay: errText.slice(0, 200) });
      return;
    }
    const data = await response.json();
    const content = String(data.choices?.[0]?.message?.content || "{}");
    const ham = content.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    let cikti: Record<string, Metin>;
    try { cikti = JSON.parse(ham); } catch { res.status(502).json({ error: "LLM JSON döndürmedi" }); return; }
    // Yalnız güvenli alanlar — LLM'in aşırı alanlarını eleyerek döndür
    const temiz: Record<string, Metin> = {};
    for (const d of HEDEF_DILLER) {
      const o = (cikti as Record<string, Metin>)[d];
      if (o && typeof o === "object") {
        temiz[d] = {
          title: String(o.title || "").slice(0, 300),
          message: String(o.message || "").slice(0, 1200),
          detail: String(o.detail || "").slice(0, 4000),
        };
      }
    }
    res.status(200).json({ ok: true, ceviri: temiz });
  } catch (e) {
    res.status(500).json({ error: (e as Error)?.message || "çeviri hatası" });
  }
}
