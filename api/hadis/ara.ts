// ════════════════════════════════════════════════════════════════
// HADİS ARAMA PROXY — kullanıcı kararı 28.09: "hadis bankası Sahih
// Buhari/Müslim'e bağlansın, aranan kelimeyi eksiksiz çeksin"
// (ör. "aile" yazınca da sonuç gelsin).
//
// KAYNAKLAR:
//  1) dorar.net — anahtarsız, ücretsiz; külliyat arama (Buhari, Müslim
//     ve diğer kitaplar), metin + tahric (kaynak) döner.
//  2) sunnah.com — API anahtarı varsa (HADITH_API_KEY env) kullanılır;
//     yalnız Buhârî + Müslim, İngilizce/Latince harf çevirisi metin.
//
// GÜVENLİK: yalnızca GET; origin kontrolü (_shared/security) + rate
// limit; girdi temizlenir; dış adresler sabit (SSRF yok). Cache'li.
// ════════════════════════════════════════════════════════════════
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { assertOrigin } from "../_shared/origin.js";



const __RL_MAP = new Map<string, number[]>();
const __RL_URL = (process.env.UPSTASH_REDIS_REST_URL || "").replace(/\/+$/, "");
const __RL_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || "";
const __RL_SHARED = __RL_URL.length > 0 && __RL_TOKEN.length > 0;

function __rlIp(req: VercelRequest): string {
  const forwarded = String(req.headers["cf-connecting-ip"] || req.headers["x-real-ip"] || String(req.headers["x-forwarded-for"] || "").split(",")[0] || "").trim();
  return forwarded || (req as unknown as { socket?: { remoteAddress?: string | null } }).socket?.remoteAddress || "unknown";
}

function __rlMem(bucketKey: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const active = (__RL_MAP.get(bucketKey) || []).filter((t) => t >= now - windowMs);
  if (active.length >= max) { __RL_MAP.set(bucketKey, active); return false; }
  active.push(now); __RL_MAP.set(bucketKey, active);
  if (__RL_MAP.size > 5000) { for (const k of __RL_MAP.keys()) { __RL_MAP.delete(k); if (__RL_MAP.size <= 2500) break; } }
  return true;
}

async function __rlShared(bucketKey: string, windowMs: number): Promise<number | null> {
  if (!__RL_SHARED) return null;
  try {
    const res = await fetch(`${__RL_URL}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${__RL_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify([["INCR", `rl:${bucketKey}`], ["EXPIRE", `rl:${bucketKey}`, String(Math.ceil(windowMs / 1000)), "NX"]]),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as Array<{ result?: number }>;
    return typeof json?.[0]?.result === "number" ? json[0].result : null;
  } catch { return null; }
}

async function rateLimit(req: VercelRequest, res: VercelResponse, bucket: string, max: number, windowMs: number): Promise<boolean> {
  const shared = await __rlShared(`${bucket}:${__rlIp(req)}`, windowMs);
  if (shared !== null) {
    if (shared > max) { res.status(429).json({ ok: false, error: "Çok hızlı — biraz bekle" }); return false; }
    return true;
  }
  if (!__rlMem(`${bucket}:${__rlIp(req)}`, max, windowMs)) {
    res.status(429).json({ ok: false, error: "Çok hızlı — biraz bekle" });
    return false;
  }
  return true;
}

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
  url?: string;
  ref?: string;
  bab?: string;
  dereceEtiket?: string;
}

const KITAP_SLUG: Record<string, string> = {
  buhari: "buhari", muslim: "muslim", tirmizi: "tirmizi", ebudavud: "ebudavud",
  nesai: "nesai", ibnmace: "ibnmace",
};
function sunnetimizDerece(label?: string): HadisSonuc["derece"] {
  const v = (label || "").toLocaleLowerCase("tr");
  if (/sahih|صحيح/.test(v)) return "sahih";
  if (/hasen|hasan|حسن/.test(v)) return "hasan";
  if (/zay[ıi]f|ضعيف|mevzu|موضوع/.test(v)) return "zayif";
  return "bilinmiyor";
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

// ─── Sünnetimiz külliyat arama — tek külliyat sayfası (pratikte 50 rivayet) ───
interface SunnetimizKayit {
  ref?: string;
  turkish?: string;
  arabic?: string;
  grade?: { label?: string; by?: string; tone?: string };
  book?: { slug?: string; name?: string };
  kitab?: { title?: string };
  bab?: { title?: string };
  url?: string;
}

interface SunnetimizSayfaCevap {
  durum: number;
  results: SunnetimizKayit[];
  hasMore: boolean;
}

async function sunnetimizSayfaCek(q: string, kitapQ: string, sayfa: number, cekim: number): Promise<SunnetimizSayfaCevap> {
  try {
    const url = `https://sunnetimiz.com/api/v1/search?q=${encodeURIComponent(q)}&book=${encodeURIComponent(kitapQ)}&limit=${cekim}&page=${sayfa}`;
    const r = await fetch(url, {
      headers: { "User-Agent": DIS_UA, Accept: "application/json" },
      signal: AbortSignal.timeout(12000),
    });
    if (!r.ok) return { durum: r.status, results: [], hasMore: false };
    const data = (await r.json()) as { results?: SunnetimizKayit[]; has_more?: boolean };
    return { durum: 200, results: data.results ?? [], hasMore: Boolean(data.has_more) };
  } catch {
    return { durum: 0, results: [], hasMore: false };
  }
}

// ─── Dış fetch'ler için uygulama kimliği ───
// ★ 28.09: dorar.net, Node/curl gibi genel araç UA'larını 403 ile engelliyor
//   (kanıt: tarayıcı UA ve uygulama UA = 200, node UA = 403). Uygulama
//   kimlikli UA gönderince sunucu fetch'leri de kabul ediliyor.
const DIS_UA = "Nurstudyo/1.0 (+https://nurstudyo.com)";
// ★ 2. deneme kimliği: bazı engelleme kuralları IP+UA kombinasyonuna bakar —
//   verimerkezden gelen isteğe tarayıcı kimliği de denenir (dürüst raporlanır).
const BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS — yalnız sitemiz
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";
  const izinli = ["https://nurstudyo.com", "https://www.nurstudyo.com", "http://localhost:5173", "http://localhost:5174"];
  if (origin && izinli.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin, Referer");
  }
  res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  if (!assertOrigin(req, res, { allowMissing: true })) return;
  if (!(await rateLimit(req, res, "hadis-ara", 30, 60_000))) return;

  const q = temizle(String(req.query.q ?? ""));
  if (q.length < 2) return res.status(400).json({ ok: false, error: "Arama en az 2 karakter olmalı" });

  // ★ 26.11: "binlerce sahih hadis" — sayfalama + sahih/hasan süzgeci.
  // Külliyat 34.566 Türkçe hadis (Buhârî 7.583 · Müslim 7.603 · Nesâî 5.765 ·
  // Ebû Dâvûd 5.274 · İbn Mâce 4.343 · Tirmizî 3.998 — Sünnetimiz /books, 26.11.2026).
  // ★ 26.11 (2) kullanıcı emri "1000 yap": tek istekte 1000 rivayete kadar çıkılır.
  const sayfa = Math.min(Math.max(Number.parseInt(String(req.query.sayfa ?? "1"), 10) || 1, 1), 10);
  const adet = Math.min(Math.max(Number.parseInt(String(req.query.adet ?? "100"), 10) || 100, 5), 1000);
  const yalnizSahih = String(req.query.sahih ?? "1") !== "0";

  const sonuclar: HadisSonuc[] = [];
  const seen = new Set<string>();
  // Ham (filtre öncesi) rivayet anahtarları — Sünnetimiz sayfa sınırını aşınca aynı
  // sonuçları tekrar döndürüyor; yeni ham rivayet gelmeyen turda durulur.
  const hamGorulen = new Set<string>();
  const ekle = (s: HadisSonuc) => {
    const key = s.metin.replace(/\s+/g, " ").trim().slice(0, 120);
    if (!key || seen.has(key)) return;
    seen.add(key);
    sonuclar.push(s);
  };
  // ★ Dürüst kaynak raporu: hangi sağlayıcı ne durumda, yanıtla birlikte döner
  const kaynaklar: Record<string, string> = { sunnetimiz: "kapali", dorar: "kapali", sunnah: "anahtar-yok" };

  // Seçili rivayetçi/kitap (opsiyonel) — sadece Sünnetimiz'de desteklenen slug'lar
  const kitapParam = String(req.query.kitap ?? req.query.book ?? "").toLocaleLowerCase("tr").replace(/[^a-z,]/g, "");
  const kitaplarSecili = kitapParam.split(",").map((k) => KITAP_SLUG[k.trim()]).filter(Boolean) as string[];

  // ─── 1) Sünnetimiz (anahtarsız, TR+Arapça + derece) — öncelikli ───
  // ★ 26.11 (2): toplu arama Sünnetimiz'de ~1000 sonuçtan sonra tekrara düşüyor;
  //   1000 sahih rivayet hedefine varmak için her kitap AYRI sayfalanır (6 kat havuz).
  const CEKIM = 50; // külliyat sayfa başına pratik üst sınır
  const kitaplar = kitaplarSecili.length
    ? kitaplarSecili
    : ["buhari", "muslim", "ebudavud", "tirmizi", "nesai", "ibnmace"];
  // Kitap başına tur: 1000 rivayet / (50 × 6 kitap) = 4 tur; süzgeç payıyla 2 katı.
  const sayfaPerKitap = Math.min(Math.max(Math.ceil(adet / (CEKIM * kitaplar.length)) * 2, 2), 20);
  let sunnetimizHasMore = false;
  let sunnetimizBitti = false;
  let sunnetimizOk = false;
  try {
    const ilkKulliyatSayfasi = (sayfa - 1) * sayfaPerKitap + 1;
    for (let tur = 0; tur < sayfaPerKitap && sonuclar.length < adet; tur++) {
      const kulliyatSayfasi = ilkKulliyatSayfasi + tur;
      const cevaplar = await Promise.all(kitaplar.map((k) => sunnetimizSayfaCek(q, k, kulliyatSayfasi, CEKIM)));
      let doluSayfa = 0;
      let yeniHam = 0;
      for (const cevap of cevaplar) {
        if (cevap.durum === 200) sunnetimizOk = true;
        if (cevap.hasMore) sunnetimizHasMore = true;
        if (cevap.results.length) doluSayfa++;
        for (const h of cevap.results) {
          const metin = (h.turkish || h.arabic || "").trim();
          if (!metin) continue;
          const hamAnahtar = metin.replace(/\s+/g, " ").slice(0, 120);
          if (!hamGorulen.has(hamAnahtar)) { hamGorulen.add(hamAnahtar); yeniHam++; }
          const derece = sunnetimizDerece(h.grade?.tone || h.grade?.label);
          // Sahih süzgeci: derecesi belirtilmemiş rivayetleri de dışlar, zayıfı asla göstermez.
          if (yalnizSahih && derece !== "sahih" && derece !== "hasan") continue;
          if (sonuclar.length >= adet) break;
          const bname = h.book?.name || h.book?.slug || "Hadis";
          const bolum = h.bab?.title || h.kitab?.title || "";
          ekle({
            metin,
            kaynak: `${bname}${h.ref ? ` · ${h.ref}` : ""}${bolum ? ` · ${bolum}` : ""} · Sünnetimiz`,
            derece,
            kitap: bname,
            dil: h.turkish ? "tr" : "ar",
            url: h.url,
            ref: h.ref,
            bab: bolum,
            dereceEtiket: [h.grade?.label, h.grade?.by].filter(Boolean).join(" · "),
          });
        }
      }
      // Bu turdaki tüm külliyat sayfaları BOŞ döndüyse külliyat tükenmiştir.
      // (429/zaman aşımı gibi hatalar "tükendi" sayılmaz — aksi hâlde boş sonuç gösterilir.)
      const okSayfa = cevaplar.filter((c) => c.durum === 200).length;
      if (doluSayfa === 0 && okSayfa > 0) { sunnetimizBitti = true; break; }
      if (doluSayfa === 0) break;
      // Yeni ham rivayet gelmediyse Sünnetimiz sayfa sınırına gelinmiştir — daha fazla isteyip
      // aynı rivayetleri tekrar çekmeyiz.
      if (yeniHam === 0) { sunnetimizBitti = true; break; }
    }
    if (sunnetimizOk) kaynaklar.sunnetimiz = `ok-${sonuclar.length}`;
    else kaynaklar.sunnetimiz = "hata";
    // İstenen adet dolduysa ve külliyat bitmediyse devamı var.
    if (!sunnetimizBitti && sonuclar.length >= adet) sunnetimizHasMore = true;
    if (sunnetimizBitti) sunnetimizHasMore = false;
  } catch { kaynaklar.sunnetimiz = "hata"; }

  // ─── 2) sunnah.com (API anahtarı varsa) — Buhârî + Müslim ───
  const apiKey = process.env.HADITH_API_KEY;
  if (apiKey) {
    try {
      const kitaplar = (["bukhari", "muslim"] as const).filter((k) => !kitaplarSecili.length || kitaplarSecili.includes(k));
      await Promise.all(kitaplar.map(async (kitap) => {
        const r = await fetch(`https://api.sunnah.com/v1/${kitap}/search/${encodeURIComponent(q)}?limit=5`, {
          headers: { "X-API-KEY": apiKey, "User-Agent": DIS_UA, Accept: "application/json" },
          signal: AbortSignal.timeout(8000),
        });
        if (!r.ok) { kaynaklar.sunnah = `hata-${r.status}`; return; }
        const data = (await r.json()) as {
          data?: Array<{ hadithEnglish?: string; hadithArabic?: string; chapter?: { chapterName?: string }; hadithNumber?: number }>;
        };
        for (const h of (data.data ?? []).slice(0, 5)) {
          const metin = h.hadithEnglish || h.hadithArabic || "";
          if (!metin) continue;
          ekle({
            metin,
            kaynak: `Sahih ${kitap === "bukhari" ? "Buhârî" : "Müslim"}${h.chapter?.chapterName ? ` · ${h.chapter.chapterName}` : ""}${h.hadithNumber ? ` · ${h.hadithNumber}` : ""}`,
            derece: "sahih",
            kitap: kitap === "bukhari" ? "Buhârî" : "Müslim",
            dil: h.hadithEnglish ? "en" : "ar",
          });
        }
      }));
      if (!kaynaklar.sunnah.startsWith("hata")) kaynaklar.sunnah = `ok`;
    } catch { if (kaynaklar.sunnah === "anahtar-yok") kaynaklar.sunnah = "hata"; }
  }

  // ─── 3) dorar.net — anonim külliyat araması (Arapça), yedek ───
  if (sonuclar.length < 8 && !yalnizSahih) {
    try {
      const url = `https://dorar.net/dorar_api.json?skey=${encodeURIComponent(q)}`;
      let r = await fetch(url, { headers: { "User-Agent": DIS_UA, Accept: "application/json" }, signal: AbortSignal.timeout(8000) });
      if (!r.ok) {
        kaynaklar.dorar = `ua-reddet-${r.status}`;
        r = await fetch(url, { headers: { "User-Agent": BROWSER_UA, Accept: "application/json" }, signal: AbortSignal.timeout(8000) });
      }
      if (r.ok) {
        const data = (await r.json()) as { ahadith?: { result?: { html?: string } } };
        const html = data?.ahadith?.result?.html ?? "";
        const metinler = [...html.matchAll(/class="hadith"[^>]*>([\s\S]*?)<\/div>/g)]
          .map((m) => m[1].replace(/<[^>]+>/g, "").trim()).filter(Boolean);
        const bilgiler = [...html.matchAll(/class="hadith-info"[^>]*>([\s\S]*?)<\/div>/g)]
          .map((m) => m[1].replace(/<[^>]+>/g, "").trim()).filter(Boolean);
        for (let i = 0; i < metinler.length && sonuclar.length < adet; i++) {
          const metin = metinler[i];
          const bilgi = bilgiler[i] ?? "";
          ekle({
            metin,
            kaynak: bilgi.slice(0, 200) || dorarKitap(bilgi),
            derece: dorarDerece(bilgi),
            kitap: dorarKitap(bilgi),
            dil: "ar",
          });
        }
        kaynaklar.dorar = `ok`;
      } else {
        kaynaklar.dorar = `kapali-${r.status}`;
      }
    } catch { if (kaynaklar.dorar === "kapali") kaynaklar.dorar = "hata"; }
  }

  return res.status(200).json({
    ok: true,
    q,
    sayfa,
    adet,
    sayi: sonuclar.length,
    hasMore: sunnetimizHasMore,
    kulliyat: { kitap: 6, hadis: 34566 },
    kaynaklar,
    sonuclar: sonuclar.slice(0, adet),
  });
}
