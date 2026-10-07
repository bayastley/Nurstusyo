// ZİKİR TOPLULUK SAYACI — yol haritası "Zikirmatik ve Topluluk Sayacı" (V2)
// GET  → topluluk toplamı (tablolar yoksa 0 döner, site ASLA bozulmaz)
// POST → kullanıcının çektiği zikirleri topluluğa ekler (rate limitli)
// Not: tablolar Supabase'e seed edilince sayaç canlanır (roadmap-guncelleme-2509.sql'e eklenecek).

// ─── Server error logger (gömülü — _shared Vercel'de paketlenmiyor) ───
async function logServerError(req: { url?: string; headers: Record<string, string | string[] | undefined> }, error: unknown, endpoint: string): Promise<void> {
  try {
    const __url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim().replace(/\/$/, "");
    const __key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    if (!__url || !__key) return;
    await fetch(`${__url}/rest/v1/nur_server_errors`, {
      method: "POST",
      headers: { apikey: __key, Authorization: `Bearer ${__key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint, message: error instanceof Error ? error.message.slice(0, 500) : String(error).slice(0, 500), url: req.url || "", created_at: new Date().toISOString() }),
    });
  } catch { /* log yazımı siteyi ASLA bozmaz */ }
}

declare const process: { env: Record<string, string | undefined> };

// ★ PAYLAŞIMLI RATE LIMIT (Açık 2 deseni) — Upstash varsa ortak sayaç, yoksa in-memory
const __RL_MAP = new Map<string, number[]>();
const __RL_URL = (process.env.UPSTASH_REDIS_REST_URL || "").replace(/\/+$/, "");
const __RL_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || "";
const __RL_SHARED = __RL_URL.length > 0 && __RL_TOKEN.length > 0;
function __rlIp(req: { headers: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string | null } }): string {
  const h = req.headers || {};
  const forwarded = String(h["cf-connecting-ip"] || h["x-real-ip"] || String(h["x-forwarded-for"] || "").split(",")[0] || "").trim();
  return forwarded || req.socket?.remoteAddress || "unknown";
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
    const data = (await res.json()) as Array<{ result?: number }>;
    return typeof data?.[0]?.result === "number" ? data[0].result : null;
  } catch { return null; }
}
async function rateLimit(req: any, res: any, bucket: string, max: number, windowMs: number): Promise<boolean> {
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

function supabaseConfig() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) return null;
  return { url, key };
}

async function db<T>(path: string, init?: RequestInit): Promise<T> {
  const cfg = supabaseConfig()!;
  const response = await fetch(`${cfg.url}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}`, "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  const text = await response.text();
  if (!response.ok) throw new Error(text || `Supabase ${response.status}`);
  return (text ? JSON.parse(text) : null) as T;
}

// ═══════════════════════════════════════════════════════════
// ★ LANSMAN ÖLÇEK KORUMASI (07.10 — dağıtım-öncesi denetim bulgusu):
//   GET her açık sekmede 45 sn'de bir geliyor ve "no-store" ile CDN'i
//   bypass ediyordu → 500+ açık sekme = dakikada ~700 Supabase sorgusu.
//   İki katman (api/config.ts deseni):
//   1) IN-MEMORY snapshot (30 sn): aynı instance'a gelen tekrarlar DB'ye
//      hiç gitmez; TEK UÇUŞ (single-flight) ile eşzamanlı miss'ler tek
//      rebuild'ı paylaşır. DB geçici hata verirse sağlıksız yanıt
//      önbelleklenmez (sayacı 0 gösterip "sıfırlanmış" izlenimi vermez).
//   2) CDN cache: GET yanıtı s-maxage=30 + stale-while-revalidate=60 —
//      Vercel edge farklı instance'ları tek talebe indirger.
//   POST no-store kalır; başarılı POST bu instance'ın snapshot toplamını
//   tazeler. CDN katmanı en fazla ~30 sn bayat toplam gösterebilir —
//   topluluk sayacı için kabul edilebilir (istemci zaten iyimser artırıyor).
// ═══════════════════════════════════════════════════════════
const ZIKIR_SNAPSHOT_TTL_MS = 30_000;
type ZikirGetBody = { ok: boolean; toplam: number; aktif: boolean; gunluk: Array<{ gun: string; adet: number }> | null };
let zikirSnapshot: { at: number; body: ZikirGetBody } | null = null;
let zikirRebuildUcusta: Promise<ZikirGetBody> | null = null;

function snapshotToplamTazele(toplam: number): void {
  if (zikirSnapshot) zikirSnapshot = { ...zikirSnapshot, body: { ...zikirSnapshot.body, toplam } };
}

/** GET gövdesi: toplam + günlük seri. saglikli=false → snapshot'a YAZILMAZ. */
async function zikirGetGovdesi(): Promise<{ body: ZikirGetBody; saglikli: boolean }> {
  let saglikli = true;
  let toplam = 0;
  try {
    const rows = await db<any[]>("nur_zikir_topluluk?select=toplam&limit=1");
    toplam = Array.isArray(rows) && rows[0] ? Number(rows[0].toplam) || 0 : 0;
  } catch {
    // ★ Geçici DB hatası: toplamı 0 cache'lemek sayacı "sıfırlandı" gösterir —
    //   saglikli işaretle, UI yerel sayaca düşsün (aktif:false dokümanlı davranış).
    saglikli = false;
  }
  // ★ GÜNLÜK SERİ (29.09): vitrin grafiği için GERÇEK kova verisi (nur_zikir_gunluk).
  //   Tablo henüz kurulmadıysa (42P01) veya sorgu patlarsa gunluk:null — UI grafiği
  //   gizler, asla uydurma sıfırlar çizmez (sayı dürüstlüğü kuralı).
  let gunluk: Array<{ gun: string; adet: number }> | null = null;
  try {
    const gRows = await db<any[]>("nur_zikir_gunluk?select=gun,adet&order=gun.desc&limit=60");
    if (Array.isArray(gRows)) {
      gunluk = gRows.map((r) => ({ gun: String(r.gun).slice(0, 10), adet: Number(r.adet) || 0 }));
    }
  } catch { gunluk = null; }
  return { body: { ok: true, toplam, aktif: saglikli, gunluk }, saglikli };
}

const GET_CACHE = "public, max-age=10, s-maxage=30, stale-while-revalidate=60";

export default async function handler(req: any, res: any) {
  res.setHeader("Cache-Control", "no-store");
  const cfg = supabaseConfig();
  if (!cfg) {
    // Tablo/env yoksa sessiz 0 — zikirmatik local sayaçla yaşamaya devam eder
    return res.status(200).json({ ok: true, toplam: 0, aktif: false });
  }
  try {
    if (req.method === "GET") {
      // ★ Snapshot taze ise DB'siz dön — lansman yükünde Supabase nefes alır
      if (zikirSnapshot && Date.now() - zikirSnapshot.at < ZIKIR_SNAPSHOT_TTL_MS) {
        res.setHeader("Cache-Control", GET_CACHE);
        return res.status(200).json(zikirSnapshot.body);
      }
      // ★ TEK UÇUŞ: eşzamanlı miss'ler tek rebuild'ı paylaşır (500 sekme = 1 sorgu)
      if (!zikirRebuildUcusta) {
        zikirRebuildUcusta = zikirGetGovdesi()
          .then((r) => {
            if (r.saglikli) zikirSnapshot = { at: Date.now(), body: r.body };
            return r.body;
          })
          .finally(() => { zikirRebuildUcusta = null; });
      }
      const body = await zikirRebuildUcusta;
      res.setHeader("Cache-Control", GET_CACHE);
      return res.status(200).json(body);
    }
    if (req.method === "POST") {
      if (!(await rateLimit(req, res, "zikir:ekle", 60, 60_000))) return;
      const body = (req.body || {}) as Record<string, unknown>;
      const adet = Math.max(1, Math.min(500, Math.floor(Number(body.adet) || 1))); // tek istekte en fazla 500
      // Atomik artırım: RPC varsa onu kullan, yoksa oku-artır-yaz
      try {
        const rpc = await db<unknown>("rpc/nur_zikir_ekle", {
          method: "POST",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify({ p_adet: adet }),
        });
        if (rpc !== null) {
          const row = Array.isArray(rpc) ? rpc[0] : rpc;
          const toplam = row && typeof row === "object" ? Number((row as any).toplam) || 0 : 0;
          snapshotToplamTazele(toplam); // ★ bu instance'ın snapshot'ı bayat kalmasın
          return res.status(200).json({ ok: true, toplam, aktif: true });
        }
      } catch { /* RPC yok → fallback */ }
      const rows = await db<any[]>("nur_zikir_topluluk?select=toplam&limit=1").catch(() => [] as any[]);
      const mevcut = Array.isArray(rows) && rows[0] ? Number(rows[0].toplam) || 0 : 0;
      if (Array.isArray(rows) && rows.length > 0) {
        await db(`nur_zikir_topluluk?id=eq.${encodeURIComponent(rows[0].id ?? "genel")}`, {
          method: "PATCH",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({ toplam: mevcut + adet, updated_at: new Date().toISOString() }),
        });
      } else {
        await db("nur_zikir_topluluk", {
          method: "POST",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({ id: "genel", toplam: adet, updated_at: new Date().toISOString() }),
        });
      }
      snapshotToplamTazele(mevcut + adet); // ★ fallback yolu da snapshot'ı tazeler
      return res.status(200).json({ ok: true, toplam: mevcut + adet, aktif: true });
    }
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  } catch (e) {
    await logServerError(req, e, "api/zikir/topluluk");
    console.error("[zikir/topluluk]", e);
    // ★ DB erişilemezse son sağlıklı snapshot ile cevapla — sayaç kaynağından
    //   dolayı topluluk zikirmatiği kapanmasın (panel sigortası felsefesi).
    if (req.method === "GET" && zikirSnapshot) {
      res.setHeader("Cache-Control", "public, max-age=10, s-maxage=15");
      return res.status(200).json(zikirSnapshot.body);
    }
    return res.status(200).json({ ok: true, toplam: 0, aktif: false }); // hata olsa da site bozulmaz
  }
}
