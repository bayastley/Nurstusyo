// ★ CANLI YAYIN PROXY — tarayıcı dış siteye bağlanmaz, akış same-origin gelir.
// ?src=kabe  → Suudi Quran TV (Mekke)  | ?src=quran → Katar Quran TV (HD, sürekli tilavet)
// ?type=playlist → ana liste | ?type=chunk&u=... → alt liste | ?type=seg&u=... → ts parçası
import type { VercelRequest, VercelResponse } from "@vercel/node";


// ─── Server error logger (gömülü — _shared Vercel'de paketlenmiyor) ───
async function logServerError(req: { url?: string; headers: Record<string, string | string[] | undefined> }, error: unknown, endpoint: string): Promise<void> {
  try {
    const __url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim().replace(/\/$/, "");
    const __key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    if (!__url || !__key) return;
    const __msg = error instanceof Error ? error.message : String(error || "Bilinmeyen sunucu hatası");
    if (!__msg) return;
    const __stack = error instanceof Error ? (error.stack || "") : "";
    const __path = String(req.url || endpoint).slice(0, 200);
    const __fingerprint = require("crypto").createHash("sha256").update(__msg + "|" + __path).digest("hex").slice(0, 16);
    await fetch(__url + "/rest/v1/nur_error_logs", {
      method: "POST",
      headers: { apikey: __key, Authorization: "Bearer " + __key, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        message: __msg.slice(0, 500),
        stack: __stack.slice(0, 4000),
        path: __path,
        source: ("server:" + endpoint).slice(0, 40),
        user_agent: String(req.headers["user-agent"] || "server").slice(0, 300),
        fingerprint: __fingerprint,
        kind: "genel",
        user_email: "",
      }),
    });
  } catch (error) {
    await logServerError(req, error, "live/kabe"); /* log yazımı siteyi ASLA bozmaz */ }
}

const UPSTREAMS: Record<string, string> = {
  kabe: "https://media2.streambrothers.com:1936/8122/8122/",
  quran: "https://qatartv.akamaized.net/hls/live/20000612/qtvquran/", // ★ playlist DEĞİL master.m3u8 kökü — 502 fix (2026-09)
  sunnah: "https://cdn-globecast.akamaized.net/live/eds/saudi_sunnah/hls_roku/", // ★ Mescid-i Nebi (Medine) — https, YouTube'suz
};
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";

// ★ DDoS + fatura koruması: canlı yayın proxy'si band genişliği tünelidir.
//   limitsiz kalırsa 1 IP saniyede binlerce segment isteyip Vercel faturasını patlatabilir.
const RATE_HITS = new Map<string, number[]>();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX_REQ = 240; // canlı yayın ~2-4 sn'de bir segment çeker; 240/dk 4-5 paralel izleyiciye yeter

function allowRequest(req: VercelRequest, res: VercelResponse): boolean {
  const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown").split(",")[0].trim();
  const now = Date.now();
  const hits = (RATE_HITS.get(ip) || []).filter((hit) => hit >= now - RATE_WINDOW_MS);
  if (hits.length >= RATE_MAX_REQ) {
    res.setHeader("Retry-After", "30");
    res.setHeader("Cache-Control", "no-store");
    res.status(429).json({ ok: false, error: "istek_limiti" });
    return false;
  }
  hits.push(now);
  RATE_HITS.set(ip, hits);
  // Map şişmesini önle: 5000 IP'yi geçiyorsa eskileri temizle
  if (RATE_HITS.size > 5000) {
    for (const key of RATE_HITS.keys()) { RATE_HITS.delete(key); if (RATE_HITS.size <= 2500) break; }
  }
  return true;
}

export const config = { api: { bodyParser: false } };

function safePath(u: string): string {
  // sadece dosya adı ve tek seviye klasör (stream_02/index.m3u8 gibi) kabul edilir
  const clean = u.replace(/[^A-Za-z0-9_./\-]/g, "");
  if (clean.includes("..")) return "";
  return clean;
}

async function pipe(res: VercelResponse, target: string, isPlaylist: boolean): Promise<void> {
  const upstream = await fetch(target, { headers: { "User-Agent": UA }, cache: "no-store" as RequestCache });
  if (!upstream.ok || !upstream.body) {
    res.status(502).json({ ok: false, error: "yayin_sunucuya_ulasilamadi", status: upstream.status });
    return;
  }
  res.setHeader("Cache-Control", "no-store, max-age=0");
  if (isPlaylist) {
    const base = target.substring(0, target.lastIndexOf("/") + 1);
    let text = await upstream.text();
    text = text
      .split("\n")
      .map((line) => {
        const t = line.trim();
        if (!t || t.startsWith("#")) {
          // URI="..." içeren meta satırları (I-FRAME) — dokunma
          return line;
        }
        const rel = t.replace(/[^A-Za-z0-9_./\-]/g, "");
        if (rel.includes("..") || !rel) return line;
        // göreli yolu mutlak karşılaştırarak hangi klasörde olduğunu koru
        const abs = new URL(rel, base);
        const up = new URL(base);
        const prefix = up.pathname.replace(/[^/]*$/, "");
        let sub = abs.pathname.startsWith(prefix) ? abs.pathname.slice(prefix.length) : abs.pathname.replace(/^\//, "");
        sub = safePath(sub);
        if (!sub) return line;
        const src = new URL(base).pathname.includes("/qtvquran/") ? "quran" : new URL(base).pathname.includes("/saudi_sunnah/") ? "sunnah" : "kabe";
        if (sub.endsWith(".m3u8")) return `/api/live/kabe?src=${src}&type=chunk&u=${encodeURIComponent(sub)}`;
        if (sub.endsWith(".ts")) return `/api/live/kabe?src=${src}&type=seg&u=${encodeURIComponent(sub)}`;
        return line;
      })
      .join("\n");
    res.status(200).setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.send(text);
    return;
  }
  res.status(200);
  const ct = upstream.headers.get("content-type");
  if (ct) res.setHeader("Content-Type", ct);
  const cl = upstream.headers.get("content-length");
  if (cl) res.setHeader("Content-Length", cl);
  // ★ Doğrudan aktarım: segmenti bellekte biriktirmeden akıt — Vercel 502/zaman aşımı fix
  if (upstream.body && typeof (res as unknown as { write?: unknown }).write === "function") {
    const reader = upstream.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value as unknown as Buffer);
    }
    res.end();
    return;
  }
  // yedek: akış desteklenmiyorsa tamponla gönder
  const ab = await upstream.arrayBuffer();
  res.send(Buffer.from(ab));
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // ★ Rate limit — proxy kötüye kullanımı engellenir (DDoS amplifikasyon koruması)
  if (!allowRequest(req, res)) return;

  const src = String(req.query.src ?? "kabe");
  const type = String(req.query.type ?? "playlist");
  const base = UPSTREAMS[src];
  if (!base) { res.status(400).json({ ok: false, error: "gecersiz_kanal" }); return; }
  try {
    if (type === "playlist") {
      // ★ Katar master.m3u8 kullanıyor; Suudi/Medine playlist.m3u8. Doğru giriş dosyasını seç:
      const entry = src === "quran" ? "master.m3u8" : "playlist.m3u8";
      await pipe(res, base + entry, true); return;
    }
    const u = safePath(String(req.query.u ?? ""));
    if (!u) { res.status(400).json({ ok: false, error: "gecersiz_yol" }); return; }
    if (type === "chunk") { await pipe(res, base + u, true); return; }
    if (type === "seg") { await pipe(res, base + u, false); return; }
    res.status(400).json({ ok: false, error: "gecersiz_tip" });
  } catch {
    res.status(502).json({ ok: false, error: "yayin_hatasi" });
  }
}
