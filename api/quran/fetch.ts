// ════════════════════════════════════════════════════════
// KUR'AN METİN PROXYSİ + ORTAK CACHE (29.09)
//   /api/quran/v1/...  →  https://api.alquran.cloud/v1/...
//
// NEDEN: istemciler doğrudan alquran.cloud'a gidiyordu; tüm kullanıcıların
//   istekleri TEK paylaşılan IP kotasına (Cloudflare 429) çarpıyordu.
//   Artık herkes same-origin /api/quran yolunu kullanır ve katmanlı ORTAK
//   cache devrede olur — rate limit sorunu kalıcı biter:
//     1) Vercel EDGE cache   : Cache-Control s-maxage=1gün + stale-while-revalidate
//       → aynı metni isteyen tüm kullanıcılar dünya genelinde tek cevabı paylaşır.
//     2) Upstash (varsa)     : instance'lar arası paylaşımlı ikinci katman
//       (UPSTASH_REDIS_REST_URL/TOKEN — projedeki rate-limit deseniyle aynı).
//     3) Instance memory     : Upstash yoksa son katman; FIFO 60 kayıt.
//     4) BAYAT-ON-ERROR      : upstream 429/timeout verse, 30 güne kadar bayat
//       Kur'an metni servis edilir (x-cache: STALE). Kur'an metni değişmez —
//       bayat metin < hatadır; kullanıcı 429 duvarına asla çarpmaz.
//
// GÜVENLİK: yalnız GET; yalnız v1/ alt yolları (açık proxy DEĞİL); query
//   uzunluğu sınırlı; cookie/jeton upstream'e ASLA iletilmez.
// ════════════════════════════════════════════════════════
import crypto from "crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";

declare const process: { env: Record<string, string | undefined> };

const UPSTREAM = "https://api.alquran.cloud";
const TAZE_SN = 86_400;            // 24 saat: taze sayılır
const BAYAT_SN = 30 * 86_400;      // 30 gün: hata anında servis edilebilir pencere
const MAX_BOY = 4 * 1024 * 1024;   // 4MB üstü cevap cache'lenmez (sure-editions ~1MB)
const HAFIZA_SINIR = 60;           // instance içi kayıt tavanı (FIFO)
// ★ EDGE KATMANI: her 200 cevabı (MISS de HIT/STALE de) aynı cache başlığını
//   taşısın — HIT yollarında set edilmezse Vercel varsayılanı
//   (max-age=0, must-revalidate) devreye girip cache'lenebilirliği bozar.
const EDGE_CC = `public, max-age=600, s-maxage=${TAZE_SN}, stale-while-revalidate=${BAYAT_SN}`;

// ─── Instance içi cache + aynı anahtar için tek uçuş (dedup) ──
const HAFIZA = new Map<string, { s: number; b: string; t: number }>();
const UCUSTA = new Map<string, Promise<{ s: number; b: string } | null>>();

function hafizaKoy(key: string, s: number, b: string): void {
  try {
    HAFIZA.delete(key); // FIFO: sil-ekle → en yeni sonda
    HAFIZA.set(key, { s, b, t: Date.now() });
    while (HAFIZA.size > HAFIZA_SINIR) {
      const ilk = HAFIZA.keys().next().value;
      if (ilk === undefined) break;
      HAFIZA.delete(ilk);
    }
  } catch { /* cache yazımı isteği ASLA bozmaz */ }
}

// ─── Upstash paylaşımlı katman (varsa) — proje deseni ──
const __RL_URL = (process.env.UPSTASH_REDIS_REST_URL || "").replace(/\/+$/, "");
const __RL_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || "";
const UPSTASH_VAR = __RL_URL.length > 0 && __RL_TOKEN.length > 0;

async function upstashGet(key: string): Promise<{ s: number; b: string; t: number } | null> {
  if (!UPSTASH_VAR) return null;
  try {
    const res = await fetch(`${__RL_URL}/get/${key}`, {
      headers: { Authorization: `Bearer ${__RL_TOKEN}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const j = (await res.json()) as { result?: string | null };
    if (!j?.result) return null;
    const p = JSON.parse(j.result) as { s: number; b: string; t: number };
    return p && typeof p.t === "number" ? p : null;
  } catch { return null; }
}

async function upstashSet(key: string, s: number, b: string): Promise<void> {
  if (!UPSTASH_VAR) return;
  try {
    await fetch(`${__RL_URL}/set/${key}?EX=${TAZE_SN}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${__RL_TOKEN}`, "Content-Type": "text/plain" },
      body: JSON.stringify({ s, b, t: Date.now() }),
      cache: "no-store",
    });
  } catch { /* cache yazımı isteği ASLA bozmaz */ }
}

// ─── Upstream çağrısı (timeout'lu, cookie'siz) ──
async function upstreamGet(url: string): Promise<{ s: number; b: string } | null> {
  const kontrol = new AbortController();
  const timer = setTimeout(() => kontrol.abort(), 9_000);
  try {
    const res = await fetch(url, { signal: kontrol.signal, cache: "no-store", redirect: "follow" });
    if (res.status !== 200) return { s: res.status, b: "" };
    const boy = Number(res.headers.get("content-length") || "0");
    if (boy > MAX_BOY) return { s: res.status, b: "" };
    const b = await res.text();
    if (b.length > MAX_BOY) return { s: res.status, b: "" };
    return { s: res.status, b };
  } catch {
    return null; // ağ/timeout → bayat seçeneklerine düşülür
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Method Not Allowed" });

  // Hedef yolu ayıkla.
  // CANLI (Vercel): rewrite "/api/quran/(v1/.*)" → "/api/quran/fetch?_p=$1"
  //   der ki gerçek yol + query `req.query._p` içinde taşınır — direkt oku.
  // YEREL (Node duman testi): handler doğrudan /api/quran/v1/... adresiyle
  //   çağrılır; `req.url` içinden ayıklanır (fallback).
  // ★ HAM yol kullanılır (decode/encode YOK): arama sorguları boşluk/Türkçe
  //   karakter içerir; istemcinin ürettiği percent-escape'ler upstream'e
  //   BİREBİR gider — çift kodlama riski sıfır, whitelist escape'li karakteri
  //   (%XX üçlüsü) kabul eder.
  const qp = (req.query as Record<string, unknown> | undefined)?._p;
  const ham = typeof qp === "string" && qp.length > 0
    ? qp
    : (() => {
        const url = String(req.url || "");
        const i = url.indexOf("/api/quran/");
        if (i < 0) return "";
        return url.slice(i + "/api/quran/".length);
      })();
  if (!ham) return res.status(400).json({ ok: false, error: "Geçersiz yol" });
  const soruIdx = ham.indexOf("?");
  const yol = soruIdx < 0 ? ham : ham.slice(0, soruIdx);
  const qs = soruIdx < 0 ? "" : ham.slice(soruIdx);

  // ★ Açık proxy koruması: yalnız v1/ altı; güvenli karakterler + %XX escape;
  //   //, ../ ve boş path reddedilir; uzunluk sınırlı.
  // (ayet/sure yollarında ':' ve editions listelerinde ',' geçer: 112:1, quran-uthmani,tr.yazir)
  const yolGecerli = /^v1\/(?:[A-Za-z0-9._~\-\/:,\/]|%[0-9A-Fa-f]{2})*$/.test(yol)
    && yol.length > 3 && yol.length <= 512 && !yol.includes("//") && !/\.\./.test(yol);
  const qsGecerli = /^[A-Za-z0-9._~\-=&%+]*$/.test(qs.slice(1)) && qs.length <= 512;
  if (!yolGecerli || !qsGecerli) {
    return res.status(400).json({ ok: false, error: "Geçersiz Kur'an isteği" });
  }

  const anahtar = "zk:" + crypto.createHash("sha1").update(yol + qs).digest("hex");
  const simdi = Date.now();
  const tazeMi = (k: { t: number }) => simdi - k.t < TAZE_SN * 1000;
  const bayatUygunMu = (k: { t: number }) => simdi - k.t < (TAZE_SN + BAYAT_SN) * 1000;

  // ── 1) Instance memory (taze)
  const mem = HAFIZA.get(anahtar);
  if (mem && tazeMi(mem)) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", EDGE_CC);
    res.setHeader("X-Cache", "HIT-MEM");
    res.status(200).send(mem.b);
    return;
  }
  // ── 2) Upstash (taze)
  const us = await upstashGet(anahtar);
  if (us && tazeMi(us)) {
    hafizaKoy(anahtar, us.s, us.b);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", EDGE_CC);
    res.setHeader("X-Cache", "HIT-SHARED");
    res.status(200).send(us.b);
    return;
  }

  // ── 3) Miss → uçuş dedup'lı upstream
  const ucu = UCUSTA.get(anahtar) || upstreamGet(`${UPSTREAM}/${yol}${qs}`);
  UCUSTA.set(anahtar, ucu);
  const cevap = await ucu;
  UCUSTA.delete(anahtar);

  if (cevap && cevap.s === 200 && cevap.b) {
    hafizaKoy(anahtar, cevap.s, cevap.b);
    void upstashSet(anahtar, cevap.s, cevap.b);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    // ★ EDGE KATMANI: tüm kullanıcılar + Vercel bölgeleri bu cevabı paylaşır
    res.setHeader("Cache-Control", EDGE_CC);
    res.setHeader("X-Cache", "MISS");
    res.status(200).send(cevap.b);
    return;
  }

  // ── 4) Upstream 429/hata → BAYAT servis (Kur'an metni değişmez)
  if (mem && bayatUygunMu(mem)) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", EDGE_CC);
    res.setHeader("X-Cache", "STALE-MEM");
    res.status(200).send(mem.b);
    return;
  }
  if (us && bayatUygunMu(us)) {
    hafizaKoy(anahtar, us.s, us.b);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", EDGE_CC);
    res.setHeader("X-Cache", "STALE-SHARED");
    res.status(200).send(us.b);
    return;
  }

  // ── 5) Bayat da yok → gerçek hatayı dürüstçe yansıt
  const durum = cevap?.s && cevap.s >= 400 && cevap.s < 600 ? cevap.s : 502;
  res.setHeader("Cache-Control", "no-store");
  res.status(durum).json({ ok: false, error: durum === 429 ? "Kur'an servisi şu an sınırlı — tekrar dene" : "Kur'an servisine ulaşılamadı" });
}
