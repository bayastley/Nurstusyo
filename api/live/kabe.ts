// ★ KÂBE CANLI PROXY — Tarayıcıdan dış stream'e doğrudan bağlanmak CSP connect-src
//   gerektirir ve tarayıcı cache'inde eski CSP kalabilir. Bu proxy akışı same-origin
//   (/api/live/kabe) üzerinden sunar; CSP'de ekstra izne gerek kalmaz.
// ?type=playlist → ana liste | ?type=chunk&u=<göreceli yol> → chunklist | ?type=seg&u=<yol> → ts parçası
import type { VercelRequest, VercelResponse } from "@vercel/node";

const UPSTREAM = "https://media2.streambrothers.com:1936/8122/8122/";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";

export const config = { api: { bodyParser: false } };

async function pipe(res: VercelResponse, target: string, isPlaylist: boolean): Promise<void> {
  const upstream = await fetch(target, { headers: { "User-Agent": UA }, cache: "no-store" as RequestCache });
  if (!upstream.ok || !upstream.body) {
    res.status(502).json({ ok: false, error: "yayin_sunucuya_ulasilamadi", status: upstream.status });
    return;
  }
  if (isPlaylist) {
    // playlist içeriğini oku, içindeki göreceli yolları proxy adresine çevir
    let text = await upstream.text();
    text = text
      .split("\n")
      .map((line) => {
        const t = line.trim();
        if (!t || t.startsWith("#")) return line;
        // media_*.ts / chunklist_*.m3u8 gibi göreceli yollar
        const safe = t.replace(/[^A-Za-z0-9_.\-]/g, "");
        if (safe.endsWith(".m3u8")) return `/api/live/kabe?type=chunk&u=${encodeURIComponent(safe)}`;
        if (safe.endsWith(".ts")) return `/api/live/kabe?type=seg&u=${encodeURIComponent(safe)}`;
        return line;
      })
      .join("\n");
    res.status(200).setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.send(text);
    return;
  }
  // chunklist ve ts: akış olarak aktar
  res.status(200);
  res.setHeader("Cache-Control", "no-store, max-age=0");
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
  const type = String(req.query.type ?? "playlist");
  try {
    if (type === "playlist") {
      await pipe(res, UPSTREAM + "playlist.m3u8", true);
      return;
    }
    const u = String(req.query.u ?? "").replace(/[^A-Za-z0-9_.\-]/g, "");
    if (!u || u.includes("..")) { res.status(400).json({ ok: false, error: "gecersiz_yol" }); return; }
    if (type === "chunk") { await pipe(res, UPSTREAM + u, true); return; }
    if (type === "seg") { await pipe(res, UPSTREAM + u, false); return; }
    res.status(400).json({ ok: false, error: "gecersiz_tip" });
  } catch {
    res.status(502).json({ ok: false, error: "yayin_hatasi" });
  }
}
