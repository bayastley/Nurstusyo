import type { VercelRequest, VercelResponse } from "@vercel/node";
import { adminFromCookie } from "../admin/actionYardimcilar.js";

// ═══════════════════════════════════════════════════════════════
// ★ 02.11 KISSA ÇEVİRİ (ADMIN) — 5 DİL ÇÖZÜMÜ
//   POST /api/ai/kissa-cevir
//   body { baslik?, hikaye, hikmet }
//   → GPT-4o-mini tek çağrıda 4 dil (en/ar/id/ur) çevirisi döndürür.
//     TR metin düz gösterilir (çeviri gerekmez). Admin "5 dile Çevir"
//     butonuna bastığında çağrılır; sonuç Admin panelde önizlenir ve
//     kıssa ile birlikte /api/kissalar/ekle'ye kaydedilir.
//   Admin yetkisi üçlü katman: JWT + env whitelist + DB is_admin.
// ═══════════════════════════════════════════════════════════════

type Metin = { baslik?: string; hikaye?: string; hikmet?: string };

const HEDEF_DILLER = ["en", "ar", "id", "ur"] as const;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") { res.status(405).json({ ok: false, error: "POST only" }); return; }
  const admin = await adminFromCookie(req);
  if (!admin) { res.status(403).json({ ok: false, error: "Admin yetkisi gerekli" }); return; }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) { res.status(500).json({ ok: false, error: "OPENAI_API_KEY tanımlı değil" }); return; }

  const body = (req.body || {}) as Metin;
  const baslik = String(body.baslik || "").slice(0, 300);
  const hikaye = String(body.hikaye || "").slice(0, 8000);
  const hikmet = String(body.hikmet || "").slice(0, 1200);
  if (!hikaye && !hikmet) { res.status(400).json({ ok: false, error: "metin boş" }); return; }

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

  try {
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
    });
    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      res.status(502).json({ ok: false, error: `OpenAI hatası ${response.status}`, detay: errText.slice(0, 200) });
      return;
    }
    const data = await response.json();
    const content = String(data.choices?.[0]?.message?.content || "{}");
    const ham = content.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    let cikti: Record<string, Metin>;
    try { cikti = JSON.parse(ham); } catch { res.status(502).json({ ok: false, error: "AI JSON döndürmedi" }); return; }
    const temiz: Record<string, Metin> = {};
    for (const d of HEDEF_DILLER) {
      const o = (cikti as Record<string, Metin>)[d];
      if (o && typeof o === "object") {
        temiz[d] = {
          baslik: String(o.baslik || "").slice(0, 300),
          hikaye: String(o.hikaye || "").slice(0, 8000),
          hikmet: String(o.hikmet || "").slice(0, 1200),
        };
      }
    }
    res.status(200).json({ ok: true, ceviri: temiz });
  } catch (e) {
    res.status(500).json({ ok: false, error: (e as Error)?.message || "çeviri hatası" });
  }
}
