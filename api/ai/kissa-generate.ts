import crypto from "crypto";

// ═══════════════════════════════════════════════════════════════
// ★ /api/ai/kissa-generate — AI Kıssa Üretimi + TTS Seslendirme
//
// 1. Kullanıcı kelime/fikir/girer
// 2. OpenAI GPT ile İslami kıssa üretir
// 3. ElevenLabs TTS ile seslendirir (MP3)
// 4. Ses dosyasını Cloudflare R2'ya yükler
// 5. Kıssa metni + ses URL'ini döndürür
//
// ★ ENV GEREKSİNİMLERİ:
//   OPENAI_API_KEY        — OpenAI API anahtarı
//   ELEVENLABS_API_KEY    — ElevenLabs API anahtarı
//   R2_ACCOUNT_ID         — Cloudflare R2 hesap ID
//   R2_ACCESS_KEY_ID      — R2 erişim anahtarı
//   R2_SECRET_ACCESS_KEY  — R2 gizli anahtar
//   R2_BUCKET_NAME        — R2 kova adı
// ═══════════════════════════════════════════════════════════════

// ─── TTS SES MODELLERİ ────────────────────────────────────
const TTS_MODELS: Record<string, { voiceId: string; label: string }> = {
  "tr-kadin-1": { voiceId: "21m00Tcm4TlvDq8ikWAM", label: "Türk Kadın Sesi 1" },
  "tr-kadin-2": { voiceId: "AZnzlk1XvdvUeBnXmlld", label: "Türk Kadın Sesi 2" },
  "tr-erkek-1": { voiceId: "pNInz6obpgDQGcFmaJgB", label: "Türk Erkek Sesi 1" },
  "ar-erkek-1": { voiceId: "21m00Tcm4TlvDq8ikWAM", label: "Arapça Erkek Sesi" },
  "ar-kadin-1": { voiceId: "EXAVITQu4vr4xnSDxMaL", label: "Arapça Kadın Sesi" },
};

// ─── AÇIKLAMA KALIPLARI ───────────────────────────────────
const SYSTEM_PROMPT = `Sen "Nûr Stüdyo" için İslami içerik üreten bir yapay zeka asistanısın. 

GÖREVİN: Verilen kelime/fikir/concept üzerine kısa, etkileyici, ilham verici bir İslami kıssa/hikaye yaz.

KURALLAR:
1. Her kıssa 150-300 kelime arasında olmalı
2. Kur'an ayetleri ve sahih hadislerden alıntı yap (kaynak belirt)
3. Kıssanın sonunda bir ders/ibret çıkar
4. Dil akıcı, duygusal ve etkileyici olmalı
5. Uydurma hadis kullanma — sahih kaynaklara dayan
6. Hz. Muhammed (s.a.v.), sahabe veya peygamberlerle ilgili yazabilirsin
7. Her kıssanın başına "Bismillâhirrahmânirrahîm" koy
8. Format: Başlık → Metin → Kaynakça

ÖRNEK BAŞLIKLAR:
- "Sabrın Mucizesi: Hz. Eyüp'ün Hikayesi"
- "İffetin Simgesi: Hz. Yusuf'un İmtihanı"
- "Merhametin Gücü: Bir Sahabe Kıssası"`;

// ─── RATE LIMIT ────────────────────────────────────────────
const RATE_LIMIT_KEY = "kissa_gen";
const RATE_LIMIT_MAX = 10; // saatte 10 üretim
const RATE_LIMIT_WINDOW = 3600000; // 1 saat
const rateLimitMap = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);
  rateLimitMap.set(ip, recent);
  return recent.length >= RATE_LIMIT_MAX;
}

function addRateLimit(ip: string): void {
  const timestamps = rateLimitMap.get(ip) || [];
  timestamps.push(Date.now());
  rateLimitMap.set(ip, timestamps);
}

// ─── OPENAI KISSA ÜRETİMİ ──────────────────────────────────
async function generateKissa(
  prompt: string,
  style: "klasik" | "modern" | "cocuk" = "klasik"
): Promise<{ title: string; text: string; sources: string[] }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY tanımlı değil");

  const styleInstruction =
    style === "modern"
      ? "Günlük hayattan örneklerle, güncel dille yaz."
      : style === "cocuk"
        ? "Çocukların anlayabileceği basit, sevimli bir dille yaz. 100 kelimeyi geçme."
        : "Klasik, edebi bir dille, mecazlar kullanarak yaz.";

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT + "\n\nÖZEL TALİMAT: " + styleInstruction },
        { role: "user", content: `Şu konuda kısa bir İslami kıssa yaz: "${prompt}"` },
      ],
      max_tokens: 1000,
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`OpenAI hatası ${response.status}: ${errText.slice(0, 200)}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";

  // Başlık ve metni ayır
  const lines = content.split("\n").filter((l: string) => l.trim());
  const titleMatch = content.match(/^#\s*(.+)/m) || content.match(/^(.+)\n/);
  const title = titleMatch ? titleMatch[1].replace(/^#+\s*/, "").trim() : prompt.slice(0, 60);
  const text = content.replace(/^#\s*.+\n?/, "").trim();

  // Kaynakları çıkar
  const sourcePattern = /\([^)]*(?:Bakara|İmrân|Nisâ|Mâide|En âm|A'raf|Enfâl|Tevbe|Yûnus|Hûd|Yûsuf|Râd|İbrâhîm|Nahl|İsrâ|Kehf|Meryem|Tâhâ|Enbiyâ|Hac|Mü'minûn|Nûr|Furkân|Şu arâ|Neml|Kasas|Ankebût|Rûm|Lokman|Secde|Ahzâb|Saba|Fâtır|Yâsîn|Saffât|Sâd|Zümer|Gâfir)[^)]*\)/gi;
  const sourceMatches: string[] = (content.match(sourcePattern) || []) as string[];
  const sources = [...new Set(sourceMatches.map((s: string) => s.replace(/[()]/g, "").trim()))].slice(0, 5);

  return { title, text, sources };
}

// ─── ELEVENLABS TTS ────────────────────────────────────────
async function generateTTS(
  text: string,
  voiceModel: string = "tr-kadin-1"
): Promise<Buffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY tanımlı değil");

  const model = TTS_MODELS[voiceModel] || TTS_MODELS["tr-kadin-1"];

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${model.voiceId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.6,
          similarity_boost: 0.75,
          style: 0.4,
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`ElevenLabs hatası ${response.status}: ${errText.slice(0, 200)}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// ─── R2 YÜKLEME ────────────────────────────────────────────
async function uploadToR2(
  buffer: Buffer,
  key: string,
  contentType: string = "audio/mpeg"
): Promise<string> {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error("R2 env değişkenleri tanımlı değil");
  }

  const url = `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${key}`;
  const date = new Date().toUTCString();
  const payloadHash = crypto.createHash("sha256").update(buffer).digest("hex");

  // AWS Signature V4
  const canonicalRequest = [
    "PUT",
    `/${bucket}/${key}`,
    "",
    `content-type:${contentType}\ndate:${date}\nhost:${accountId}.r2.cloudflarestorage.com\n`,
    "content-type;date;host",
    payloadHash,
  ].join("\n");

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    date,
    `${date.slice(0, 8)}/auto/s3/aws4_request`,
    crypto.createHash("sha256").update(canonicalRequest).digest("hex"),
  ].join("\n");

  const hmac = (key: string | Buffer, data: string) =>
    crypto.createHmac("sha256", key).update(data).digest();

  const signingKey = hmac(
    hmac(hmac(hmac(`AWS4${secretAccessKey}`, date.slice(0, 8)), "auto"), "s3"),
    "aws4_request"
  );
  const signature = crypto.createHmac("sha256", signingKey).update(stringToSign).digest("hex");

  const authHeader = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${date.slice(0, 8)}/auto/s3/aws4_request, SignedHeaders=content-type;date;host, Signature=${signature}`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
      Date: date,
      Host: `${accountId}.r2.cloudflarestorage.com`,
      Authorization: authHeader,
    },
    body: new Uint8Array(buffer),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`R2 yükleme hatası ${res.status}: ${errText.slice(0, 200)}`);
  }

  return `https://cdn.nurstudyo.com/${key}`;
}

// ═══════════════════════════════════════════════════════════════
// ★ ANA HANDLER
// ═══════════════════════════════════════════════════════════════
export default async function handler(req: any, res: any) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", process.env.SITE_URL || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Sadece POST istekleri kabul edilir" });
    return;
  }

  // Rate limit
  const clientIp =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(clientIp)) {
    res.status(429).json({ error: "Çok fazla istek. Lütfen biraz bekleyin." });
    return;
  }

  try {
    const { prompt, style = "klasik", voiceModel = "tr-kadin-1", withAudio = true } = req.body || {};

    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 3) {
      res.status(400).json({ error: "En az 3 karakterlik bir konu girin" });
      return;
    }

    if (prompt.length > 500) {
      res.status(400).json({ error: "Konu en fazla 500 karakter olabilir" });
      return;
    }

    addRateLimit(clientIp);

    // 1. Kıssa üret
    console.log("[kissa-generate] Kıssa üretiliyor:", prompt.slice(0, 50));
    const kissa = await generateKissa(prompt, style);

    let audioUrl: string | null = null;

    // 2. TTS seslendirme (opsiyonel)
    if (withAudio) {
      console.log("[kissa-generate] TTS üretiliyor, model:", voiceModel);
      const ttsBuffer = await generateTTS(kissa.text, voiceModel);

      // 3. R2'ya yükle
      const fileKey = `kissa-audio/${Date.now()}-${crypto.randomBytes(6).toString("hex")}.mp3`;
      console.log("[kissa-generate] R2'ya yükleniyor:", fileKey);
      audioUrl = await uploadToR2(ttsBuffer, fileKey);
    }

    res.status(200).json({
      success: true,
      kissa: {
        title: kissa.title,
        text: kissa.text,
        sources: kissa.sources,
        audioUrl,
        style,
        voiceModel,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error("[kissa-generate] Hata:", err?.message);
    res.status(500).json({
      error: "Kıssa üretilirken bir hata oluştu",
      detail: process.env.NODE_ENV === "development" ? err?.message : undefined,
    });
  }
}
