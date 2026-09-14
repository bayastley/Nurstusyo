// ★ CANLI YAYIN PROXY — tarayıcı dış siteye bağlanmaz, akış same-origin gelir.
// ?src=kabe  → Suudi Quran TV (Mekke)  | ?src=quran → Katar Quran TV (HD, sürekli tilavet)
// ?type=playlist → ana liste | ?type=chunk&u=... → alt liste | ?type=seg&u=... → ts parçası
import type { VercelRequest, VercelResponse } from "@vercel/node";

const UPSTREAMS: Record<string, string> = {
  kabe: "https://media2.streambrothers.com:1936/8122/8122/",
  quran: "https://qatartv.akamaized.net/hls/live/20000612/qtvquran/",
};
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";

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
        const src = new URL(base).pathname.includes("/qtvquran/") ? "quran" : "kabe";
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
  const reader = upstream.body.getReader();
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  const total = chunks.reduce((s, c) => s + c.length, 0);
  const merged = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) { merged.set(c, off); off += c.length; }
  res.send(Buffer.from(merged));
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const src = String(req.query.src ?? "kabe");
  const type = String(req.query.type ?? "playlist");
  const base = UPSTREAMS[src];
  if (!base) { res.status(400).json({ ok: false, error: "gecersiz_kanal" }); return; }
  try {
    if (type === "playlist") { await pipe(res, base + "playlist.m3u8", true); return; }
    const u = safePath(String(req.query.u ?? ""));
    if (!u) { res.status(400).json({ ok: false, error: "gecersiz_yol" }); return; }
    if (type === "chunk") { await pipe(res, base + u, true); return; }
    if (type === "seg") { await pipe(res, base + u, false); return; }
    res.status(400).json({ ok: false, error: "gecersiz_tip" });
  } catch {
    res.status(502).json({ ok: false, error: "yayin_hatasi" });
  }
}
