// ═══════════════════════════════════════════════════════════════
// NUR-TTS SERVERLESS (18.10) — Sesli Meal'in canlıya taşınması.
// ESKİ DURUM: modal yalnız lokal prototip sunucusuna (vite proxy →
// python meal-sunucu.py, 8877) bağlanıyordu; canlıda proxy olmadığı
// için "Seslendirme şu an geliştirme özelliği" ekranı gösteriliyordu.
// YENİ: aynı HTTP sözleşmesi (GET /api/nur-tts/ayetler|sesler|okut)
// serverless fonksiyonla karşılanır:
//   • /ayetler — TR kütüphanesi public/nur-tts/ayet-kutuphane.json'dan
//     (aynı dosya dist'e kopyalanır, Vercel statik olarak servis eder);
//     diğer dillerde alquran.cloud edition'ı canlı çevirir (quran/fetch
//     deseniyle cache'li).
//   • /sesler  — dil başına ilan edilen Edge ses listesi.
//   • /okut    — msedge-tts (Edge Read Aloud WSS) ile mp3 üretir,
//     base64 data-URL döner. Sunucuda dosya cache'i yoktur (FAT coin
//     değil) — Upstash varsa mp3 cache'i oraya yazılır (EX 30 gün).
//
// GÜVENLİK: yalnız GET; metin长度 sınırlı (600 kr); rate limit ayet
// listesi/okut ayrı; admin gerekmez (V3 admin kilidi istemcide var).
// ═══════════════════════════════════════════════════════════════
import type { VercelRequest, VercelResponse } from "@vercel/node";
// ★ 19.10 CANLI FIX: msedge-tts import'u top-level'dan LAZY'a taşındı.
//   Top-level import, Vercel serverless bundle'ında modül yükleme anında
//   crash ediyordu → /ayetler '/sesler' DAHİL tüm yollar attacker yok
//   FUNCTION_INVOCATION_FAILED (500) veriyordu: kullanıcı 5 dil çipi
//   görüp "çeviri yok" şikayeti bırakıyordu. Dynamic import ile
//   /ayetler + /sesler bu bağımlılıktan kopar; /okut yalnız ses üretirken
//   yüklemeyi dener, patlarsa değilse %100 yolu yaşıyor.


declare const process: { env: Record<string, string | undefined> };

/** ★ msedge-tts'i LAZY yükle: /ayetler + /sesler bu modüle bakmasın.
 *   Top-level import Vercel bundle'ında yükleme anında crash ediyordu —
 *   tüm yollar (diller dahil) 500 FUNCTION_INVOCATION_FAILED veriyordu. */
let __MsEdgeMod: { MsEdgeTTS: new () => import("msedge-tts").MsEdgeTTS; OUTPUT_FORMAT: typeof import("msedge-tts").OUTPUT_FORMAT } | null = null;
async function msEdgeLazy(): Promise<typeof __MsEdgeMod> {
  if (__MsEdgeMod) return __MsEdgeMod;
  try {
    __MsEdgeMod = (await import("msedge-tts")) as unknown as typeof __MsEdgeMod;
    return __MsEdgeMod;
  } catch { return null; }
}

// ── DİLLER (meal-sunucu.py ile birebir; edition + önerilen ses) ──
const DIL_SESLER: Record<string, Array<[string, string]>> = {
  tr: [["tr-TR-AhmetNeural", "★ Ahmet — doğal erkek (önerilen)"]],
  en: [["en-US-GuyNeural", "★ Guy — US (önerilen)"], ["en-US-BrianMultilingualNeural", "Brian — US çok-dilli"]],
  ar: [["ar-SA-HamedNeural", "★ Hamed — Suudi (önerilen)"], ["ar-EG-ShakirNeural", "Shakir — Mısır"]],
  id: [["id-ID-ArdiNeural", "★ Ardi — doğal erkek (önerilen)"]],
  ur: [["ur-PK-AsadNeural", "★ Asad — Pakistan (önerilen)"], ["ur-IN-SalmanNeural", "Salman — Hindistan erkek"]],
};
const DIL_EDITION: Record<string, string> = {
  tr: "tr.yazir", en: "en.sahih", ar: "quran-simple", id: "id.indonesian", ur: "ur.jalandhry",
};
const DIL_SURE_SON: Record<string, (ad: string, n: number) => string> = {
  tr: (ad, n) => `${ad} Suresi • ${n}. Ayet`,
  en: (ad, n) => `Surah ${ad} • Ayah ${n}`,
  ar: (ad, n) => `${ad} • آية ${n}`,
  id: (ad, n) => `Surah ${ad} • Ayat ${n}`,
  ur: (ad, n) => `${ad} • آیت ${n}`,
};

// ── Upstash mp3 cache (varsa) — 78KB mp3 → ~104KB base64; EX 30 gün ──
const __RL_URL = (process.env.UPSTASH_REDIS_REST_URL || "").replace(/\/+$/, "");
const __RL_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || "";
const UPSTASH_VAR = __RL_URL.length > 0 && __RL_TOKEN.length > 0;
async function cacheGet(key: string): Promise<string | null> {
  if (!UPSTASH_VAR) return null;
  try {
    const r = await fetch(`${__RL_URL}/get/${key}`, { headers: { Authorization: `Bearer ${__RL_TOKEN}` }, cache: "no-store" });
    if (!r.ok) return null;
    const j = await r.json() as { result?: string | null };
    return typeof j.result === "string" ? j.result : null;
  } catch { return null; }
}
async function cacheSet(key: string, val: string): Promise<void> {
  if (!UPSTASH_VAR) return;
  try {
    await fetch(`${__RL_URL}/set/${key}?EX=${30 * 86400}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${__RL_TOKEN}`, "Content-Type": "text/plain" },
      body: val, cache: "no-store",
    });
  } catch { /* yut */ }
}

// ★ 21.10 EDGE TTS ÇÖKME DÜZELTMESİ (kullanıcı: "Microsoft tarafında hâlâ çökmüş —
//   NE DEMEK SAÇMALAMA ÇÖKMESİN DÜZELT BİNLERCE İNSAN KULLANACAK DÜZGÜN YAP"):
//   CANLI TEŞHİS: prod /okut 503 döndürüyordu, gerçek hata "Edge TTS WebSocket
//   error: Unexpected server response: 429" — Microsoft'un paylaşılan Edge Read
//   Aloud protokolü ekim'de kuralları değiştirdi (v2 Sec-MS-GEC + yeni host;
//   msedge-tts 2.1.0 bu düzeltmeyi içeriyor, local buna çalışan). Prod 429 =
//   kota/aşırı-istek: binlerce kullanıcı tek anonim uç noktayı dövmesin diye
//   1) TEKRAR + BACKOFF: 429 çoğu zaman kısa sureli — ilk girişimde pes etmiyoruz,
//      3 girişim (0/1.5/4 sn aralık) boyunca tekrar deniyoruz.
//   2) İSTEĞE BAĞLI / RESMİ AZURE SPEECH YOLU: AZURE_SPEECH_KEY + AZURE_SPEECH_REGION
//      env'leri verildiği AN yük resmi endpoint'e geçer (binlerce kullanıcı düşünce
//      yük artarken tek anonim yola gidemez) — anahtar yoksa msedge anonim yolu çalışır.

const xmlKac = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

/** ★ RESMİ AZURE SPEECH REST — AZURE_SPEECH_KEY + AZURE_SPEECH_REGION env varsa
 *  ilk kolu devreye girer; yoksa null döner (msedge yoluna düş).
 *  Ücretsiz kademede 500K karakter/ay — binlerce kullanıcının başına taşınır.
 *  sesId aynı Azure ses adlarıyla çalışır (tr-TR-AhmetNeural Azure'da resmî). */
async function azureTts(sesId: string, metin: string): Promise<Buffer | null> {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) return null;
  const dl = /^[a-z]{2}-[A-Za-z]{2}/.exec(sesId)?.[0] || "tr-TR";
  const ssml = `<speak version='1.0' xml:lang='${dl}'><voice name='${sesId}'>${xmlKac(metin)}</voice></speak>`;
  const r = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
      "User-Agent": "nurstudyo",
    },
    body: ssml,
  });
  if (!r.ok) return null;
  const buf = Buffer.from(await r.arrayBuffer());
  return buf.length > 200 ? buf : null;
}

/** ★ EDGE YOLU — TEKRAR + BACKOFF: 429/boş dönen kısa sureli olabileceği için
 *  her girişim TAZE MsEdgeTTS bağlantısı + 10 sn sınıfta; 3 girişim ~38 sn cap
 *  serverless maxDuration(60)'ın altında kalır. Rastgele jitter eş zamanlı
 *  binlerce istemin aynı anda çarpmasını azaltır. */
async function msEdgeOkut(sesId: string, metin: string): Promise<Buffer> {
  const mod = await msEdgeLazy();
  if (!mod) throw new Error("ses motoru yüklenemedi");
  let sonHata: unknown = null;
  // ★ 27.10 CANLI TEŞHİS: "Stream closed before the synthesis completed (no turn.end
  //   received)" — Edge TTS 27.10 akşamında dalgalı hata veriyor (3 canlı denemede
  //   2×503 / 1×200). Microsoft tarafı geçici olduğundan 4 girişim + daha uzun
  //   backoff (0/1.5/4/7.5 sn + jitter); worst-case ~55 sn < maxDuration 60.
  const bekleme = [0, 1_500, 4_000, 7_500];
  for (let i = 0; i < bekleme.length; i++) {
    if (bekleme[i]) { try { await new Promise((r) => setTimeout(r, bekleme[i] + Math.floor(Math.random() * 600))); } catch { /* yoksay */ } }
    try {
      const tts = new mod.MsEdgeTTS();
      await tts.setMetadata(sesId, mod.OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
      const { audioStream } = tts.toStream(metin);
      const chunklar: Buffer[] = [];
      await new Promise<void>((cöz, reddet) => {
        audioStream.on("data", (c: Buffer) => chunklar.push(c));
        audioStream.on("end", () => cöz());
        audioStream.on("error", reddet);
        setTimeout(() => reddet(new Error("tts-zamanasımı")), 10_000);
      });
      const mp3 = Buffer.concat(chunklar);
      if (mp3.length < 800) throw new Error("ses motoru boş döndü");
      return mp3;
    } catch (e) { sonHata = e; }
  }
  throw sonHata instanceof Error ? sonHata : new Error("ses üretilemedi");
}

// ── rate limit (quran/fetch deseninin sadeleştirilmiş hali) ──
const __RL_MAP = new Map<string, number[]>();
function limitAsildi(req: VercelRequest, maks: number): boolean {
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "x";
  const simd = Date.now();
  const penc = (__RL_MAP.get(ip) || []).filter((t) => t >= simd - 60_000);
  if (penc.length >= maks) { __RL_MAP.set(ip, penc); return true; }
  penc.push(simd);
  __RL_MAP.set(ip, penc);
  return false;
}

// ── TR kütüphanesi (★ 20.10 TUR-6: TS VERİ MODÜLÜ) ──
//   TÜM canlı 500/503 zincirinin KÖK ÇÖZÜMÜ: JSON-import attribute sorunu
//   (ERR_IMPORT_ATTRIBUTE_MISSING), fs'ile includeFiles yapılandırma derdi ve
//   esm-tarama dunder yasak hepsi BİRDEN biter — 611 ayet düz TS dizi modülü
//   (ayetVeri.ts) esbuild'le sorunsuz bundle olur. Top-level import geri
//   geldi AMA artık JS değil TS-veri; Vercel @vercel/node bunu sorunsuz taşır.
import { AYET_KUTUPHANE, type AyetKayit } from "./ayetVeri.js";

interface ServerSure { number: number; name: string; englishName: string; ayahs: Array<{ numberInSurah: number; text: string }> }
const DİL_RATE_AYETLER = 30;     // /ayetler için dakika limiti
const DİL_RATE_OKUT = 60;        // /okut için dakika limiti (kullanıcı başına)

async function mealliAyetler(dil: string): Promise<Array<{ title: string; source: string; ar: string; tr: string }> | null> {
  // TR → hazır kütüphane (★ 20.10 tur-6: düz TS veri modülü — JSON/fs devri bitti)
  if (dil === "tr") {
    const kutuphane: AyetKayit[] = AYET_KUTUPHANE;
    if (!kutuphane?.length) return null;
    return kutuphane.map((a) => ({ title: a.title || "", source: a.source || "", ar: a.ar || "", tr: a.tr || "" }));
  }
  // Diğer diller → canlı alquran.cloud (kayma korumasız düz çekim — serverless'ta
  //   studioHelpers tarayıcı-bağımlıdır; burada basit sürüm yeterlidir).
  const edition = DIL_EDITION[dil];
  if (!edition) return null;
  try {
    const r = await fetch(`https://api.alquran.cloud/v1/quran/${edition}`, { cache: "no-store" });
    if (!r.ok) return null;
    const j = await r.json() as { data: { surahs: ServerSure[] } };
    const sureAdlarResp = await fetch("https://api.quran.com/api/v4/chapters?language=" + dil, { cache: "no-store" }).catch(() => null);
    const sureAdlar = sureAdlarResp && sureAdlarResp.ok
      ? ((await sureAdlarResp.json() as { chapters: Array<{ id: number; name_simple: string }> }).chapters.reduce<Record<number, string>>((m, c) => { m[c.id] = c.name_simple; return m; }, {}))
      : {};
    const out: Array<{ title: string; source: string; ar: string; tr: string }> = [];
    for (const s of j.data.surahs) {
      const ad = sureAdlar[s.number] || s.englishName;
      for (const a of s.ayahs) {
        out.push({ title: "", source: DIL_SURE_SON[dil](ad, a.numberInSurah), ar: a.text, tr: a.text });
      }
    }
    return out;
  } catch { return null; }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  const url = new URL(req.url || "/", `http://${req.headers.host || "x"}`);
  const yol = url.pathname.replace(/^\/api\/nur-tts\/?/, "");
  const dil = (url.searchParams.get("dil") || "tr").toLowerCase().slice(0, 2);

  // ── /ayetler ──
  if (yol === "ayetler" || yol === "") {
    if (limitAsildi(req, DİL_RATE_AYETLER)) return res.status(429).json({ ok: false, error: "Çok sık istek — biraz bekle" });
    const liste = await mealliAyetler(dil in DIL_SESLER ? dil : "tr");
    if (!liste) return res.status(503).json({ ok: false, error: "Meal kaynağına ulaşılamadı" });
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400"); // Kur'an metni değişmez
    return res.status(200).json(liste);
  }

  // ── /sesler?dil=xx ──
  if (yol === "sesler") {
    const liste = DIL_SESLER[dil in DIL_SESLER ? dil : "tr"] || DIL_SESLER.tr;
    return res.status(200).json(liste.map(([id, ad]) => ({ id, ad })));
  }

  // ── /okut?metin=…&ses=…&dil=tr ──
  if (yol === "okut") {
    if (limitAsildi(req, DİL_RATE_OKUT)) return res.status(429).json({ ok: false, error: "Ses üretimi çok hızlı — biraz bekle" });
    let metin = (url.searchParams.get("metin") || "").trim();
    const ses = url.searchParams.get("ses") || DIL_SESLER[dil in DIL_SESLER ? dil : "tr"][0][0];
    if (!metin) return res.status(400).json({ ok: false, error: "metin yok" });
    if (metin.length > 1200) metin = metin.slice(0, 1200); // güvenlik: part zaten ≤45 kelime
    const sesId = (DIL_SESLER[dil] || DIL_SESLER.tr).some(([id]) => id === ses) ? ses : (DIL_SESLER[dil] || DIL_SESLER.tr)[0][0];
    const anahtar = "nur-tts:" + Buffer.from(sesId + "|" + metin).toString("base64url").slice(0, 120);
    const cached = await cacheGet(anahtar);
    if (cached) {
      res.setHeader("Cache-Control", "public, max-age=86400");
      return res.status(200).json({ url: cached }); // client'in beklediği: data:audio/mpeg;base64,…
    }
    try {
      // ★ 21.10 YÜK SIRASI: cache → AZURE (anahtar varsa resmi yol) → EDGE tekrar+backoff
      const azure = await azureTts(sesId, metin);
      const mp3 = azure ?? (await msEdgeOkut(sesId, metin));
      if (mp3.length < 800) throw new Error("ses motoru boş döndü");
      const dataUrl = "data:audio/mpeg;base64," + mp3.toString("base64");
      await cacheSet(anahtar, dataUrl);
      res.setHeader("Cache-Control", "public, max-age=86400");
      return res.status(200).json({ url: dataUrl });
    } catch (e: unknown) {
      const ham = e instanceof Error ? e.message : "ses üretilemedi";
      const ipucu = /429/.test(ham) ? " (Microsoft kotası — birkaç sn sonra tekrar dene)" : "";
      return res.status(503).json({ ok: false, error: (ham.slice(0, 120) + ipucu).slice(0, 140) });
    }
  }

  return res.status(404).json({ ok: false, error: "Bilinmeyen nur-tts yolu" });
}
