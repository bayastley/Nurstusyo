import crypto from "crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Self-contained oturum doğrulama — _shared importları Vercel'de paketlenmediği için gömüldü
function requireAuth(req: VercelRequest, res: VercelResponse): { id: string; email: string; name: string } | null {
  const cookie = String(req.headers.cookie || "").split(";").map((p) => p.trim()).find((p) => p.startsWith("nur_session="));
  if (!cookie) { res.status(401).json({ ok: false, error: "Oturum gerekli" }); return null; }
  const token = decodeURIComponent(cookie.slice("nur_session=".length));
  const [payload, signature] = token.split(".");
  const secret = process.env.NUR_SESSION_SECRET || process.env.GOOGLE_CLIENT_SECRET || "";
  if (!payload || !signature || secret.length < 20) { res.status(401).json({ ok: false, error: "Oturum gerekli" }); return null; }
  const expected = crypto.createHmac("sha256", secret).update(payload).digest().toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) { res.status(401).json({ ok: false, error: "Oturum gerekli" }); return null; }
  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const user = JSON.parse(Buffer.from(normalized + (normalized.length % 4 ? "=".repeat(4 - (normalized.length % 4)) : ""), "base64").toString("utf8")) as { id: string; email: string; name: string; exp?: number; verified?: boolean };
    if (!user.id || !user.email || user.verified !== true || !user.exp || user.exp < Math.floor(Date.now() / 1000)) { res.status(401).json({ ok: false, error: "Oturum gerekli" }); return null; }
    return { id: user.id, email: user.email, name: user.name };
  } catch { res.status(401).json({ ok: false, error: "Oturum gerekli" }); return null; }
}

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

  // ★ Basit rate limit — dakikada 10 istek (OpenAI maliyet koruması)
  const rlBuckets = (globalThis as unknown as { __titleRl?: Map<string, number[]> }).__titleRl ?? new Map<string, number[]>();
  (globalThis as unknown as { __titleRl?: Map<string, number[]> }).__titleRl = rlBuckets;
  const rlKey = user.id;
  const now = Date.now();
  const recent = (rlBuckets.get(rlKey) ?? []).filter((t: number) => t >= now - 60_000);
  if (recent.length >= 10) {
    res.status(429).json({ error: "Çok fazla istek. Lütfen biraz bekleyin." });
    return;
  }
  recent.push(now);
  rlBuckets.set(rlKey, recent);

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

DİNİ GÜVENLİK KURALLARI (EN KRİTİK):
1. UYDURMA HADİS YASAK: Başlıkta "Peygamber Efendimiz şöyle buyurdu", hadis cite eden veya hadismiş gibi sunulan hiçbir ifade OLMAYACAK. Sen hadis kaynaklarına erişemiyorsun; hadis uydurmak büyük hatadır.
2. "Şu hastalığa şifa olan ayet", "bereket ayeti", "kaygı gideren ayet" gibi ayetin konusu OLMAYAN rastgele nitelendirmeler YASAK — bunlar uydurma dini hükümdür.
3. Nitelendirmeler SADECE bilinen, meşhur ve sahih kaynaklı tefsir/hadis bilgi birikimine dayanabilir. Emin olmadığın hiçbir dini özelliği ekleme; o zaman sadece ayetin kendi konusundan (sabır, rızık, tevhid, ahiret, infak vs.) duygu üret.
4. Ayetin mealine sadık kal. Uydurma, asılsız veya alakasız clickbait başlık yasaktır.
5. İstisna — MEŞHUR VE SAHİH olanlar bilinebilir: Ayetü'l-Kürsî (Bakara 255, koruma ayeti), Bakara sonu (Buhârî, Müslim), Felak-Nâs (sığınma sureleri), Yâsîn'in "Kur'an'ın kalbi" olması (Tirmizî, Fezâil), Kehf'in Cuma/hafıza fazileti (Müslim, Hâkim), Mülk'ün kabir azabından sığınma (Tirmizî, Ahmed), İhlâs'ın üçte bir meselâsı (Buhârî, Müslim), Muavvizeteyn'in sığınma mahiyeti, Rahmân-Vâkıa'nın cennet/azap tasvirleri (meşhur tefsir bilgisi). Bunların DIŞINDA ayete özel "şifa/fazilet" yakıştırma YAPMA.
6. Çıktı sadece tek bir başlık cümlesi olmalıdır. Yanında emoji bulunabilir. Sonuna " — {S} {N}:{A}" formatını eklemeyi unutma.

ÖRNEK:
- Girdi: "Bakara 153", Meal: "Ey iman edenler! Sabır ve namazla yardım dileyin. Şüphesiz Allah sabredenlerin yanındadır."
- Çıktı: "🤍 Zor zamanlarda sabretmeyi fısıldayan o ayet — Bakara 2:153"
- Girdi: "Bakara 255", Meal: "Allah, kendisinden başka ilah olmayandır..."
- Çıktı: "🛡️ Ayetü'l-Kürsî: Korunmak için okunan o büyük ayet — Bakara 2:255"

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
