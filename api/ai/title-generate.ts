import { requireAuth } from "../_shared/auth.js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// ═══════════════════════════════════════════════════════════════
// ★ /api/ai/title-generate — AI Tabanlı Sahih Ayet Başlığı Üretimi
// ═══════════════════════════════════════════════════════════════

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const configuredOrigin = String(process.env.SITE_URL || process.env.VITE_SITE_URL || "").replace(/\/$/, "");
  const requestOrigin = String(req.headers.origin || "").replace(/\/$/, "");
  if (requestOrigin && configuredOrigin && requestOrigin === configuredOrigin) {
    res.setHeader("Access-Control-Allow-Origin", configuredOrigin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    if (requestOrigin && requestOrigin !== configuredOrigin) {
      res.status(403).end();
      return;
    }
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Sadece POST istekleri kabul edilir" });
    return;
  }

  const user = requireAuth(req, res);
  if (!user) return;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "OPENAI_API_KEY sunucuda tanımlı değil" });
    return;
  }

  try {
    const { surahName, s, a, meal, lang = "tr" } = req.body || {};

    if (!meal || typeof meal !== "string" || meal.trim().length < 3) {
      res.status(400).json({ error: "Ayet meali / meali eksik" });
      return;
    }

    const systemPrompt = `Sen "Nûr Stüdyo" İslami video stüdyosu için sosyal medya (TikTok, Reels, Shorts) kancası (hook/başlık) yazan uzman bir asistan ve tefsir araştırmacısısın.

GÖREVİN: Sana verilen surenin, ayetin numarası ve orijinal mealine (anlamına) %100 SADIK KALARAK, o ayetin konusunu yansıtan, duygusal, merak uyandırıcı ve ilgi çekici bir sosyal medya başlığı (kanca) üretmektir.

KRİTİK GÜVENLİK KURALLARI:
1. Kesinlikle ayetin konusunu uydurma (halüsinasyon yapma). Örneğin, kitap ehli ile ilgili bir ayete "kaygı gideren ayet" deme!
2. Ayetin orijinal mealini oku, konusunu çıkar (örn: sabır, rızık, tevhid, ahiret, kitap ehli, infak vs.) ve sadece bu konuyu işleyen bir duygu başlığı yaz.
3. Meal metnine kesinlikle sadık kalacaksın. Uydurma, asılsız veya alakasız clickbait başlık yazmak yasaktır.
4. Çıktı sadece tek bir başlık cümlesi olmalıdır. Yanında emoji bulunabilir. Sonuna " — {S} {N}:{A}" formatını eklemeyi unutma.

ÖRNEK:
- Girdi: "Bakara 153", Meal: "Ey iman edenler! Sabır ve namazla yardım dileyin. Şüphesiz Allah sabredenlerin yanındadır."
- Çıktı: "🤍 Zor zamanlarda sabretmeyi fısıldayan o ayet — Bakara 2:153"

Şimdi aşağıdaki ayet için en uygun, duygusal ve %100 sahih başlığı üret.`;

    const userPrompt = `Sure: ${surahName}, Ayet: ${s}:${a}, Orijinal Meal: "${meal}"`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 150,
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`OpenAI hatası ${response.status}: ${errText}`);
    }

    const data = await response.json();
    let aiTitle = data.choices?.[0]?.message?.content || "";
    aiTitle = aiTitle.replace(/["']/g, "").trim();

    // Formata uygun değilse düzelt
    if (!aiTitle.includes("—") && !aiTitle.includes("|")) {
      aiTitle = `${aiTitle} — ${surahName} ${s}:${a}`;
    } else {
      // {S}, {N}, {A} kısımları varsa değiştir
      aiTitle = aiTitle
        .replace("{S}", surahName)
        .replace("{N}", String(s))
        .replace("{A}", String(a));
    }

    res.status(200).json({ success: true, title: aiTitle });
  } catch (err: any) {
    console.error("[title-generate] Hata:", err?.message);
    res.status(500).json({ error: "AI başlık üretilirken hata oluştu" });
  }
}
