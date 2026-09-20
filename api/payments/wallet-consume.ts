import crypto from "crypto";


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
    await logServerError(req, error, "payments/wallet-consume"); /* log yazımı siteyi ASLA bozmaz */ }
}

// ═══════════════════════════════════════════════════════════════
// ★ /api/payments/wallet-consume — Video üretim hakkı harcama
//
// GÜVENLİK NOTLARI:
//  - Oturum doğrulaması katıdır: secret uzunluk kontrolü + timingSafeEqual
//    (boş secret ile HMAC atılamaz — imza sahteciliği engellendi).
//  - Kota düşümü atomic Supabase RPC (nur_consume_video) ile yapılır;
//    oku-sonra-yaz race condition'ı yoktur.
// ═══════════════════════════════════════════════════════════════

const COOKIE_NAME = "nur_session";
const ALLOWED_ORIGINS = new Set([
  "https://nurstudyo.com",
  "https://www.nurstudyo.com",
  "http://localhost:5173",
  "http://localhost:5174",
]);

interface SessionUser {
  id: string;
  sub?: string;
  email?: string;
  verified?: boolean;
  isAdmin?: boolean;
  exp?: number;
}

const RATE_HITS = new Map<string, number[]>();

function allowRequest(req: { headers: Record<string, string | string[] | undefined> }, res: { setHeader: (k: string, v: string) => void; status: (n: number) => { json: (b: unknown) => void } }): boolean {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    res.status(403).json({ ok: false, error: "İzin verilmeyen istek kaynağı" });
    return false;
  }
  const ip = String(req.headers["x-forwarded-for"] || "unknown").split(",")[0].trim();
  const now = Date.now();
  const hits = (RATE_HITS.get(ip) || []).filter((hit) => hit >= now - 60_000);
  if (hits.length >= 15) {
    res.setHeader("Retry-After", "60");
    res.status(429).json({ ok: false, error: "İstek işlenemedi" });
    return false;
  }
  hits.push(now);
  RATE_HITS.set(ip, hits);
  return true;
}

function parseCookies(header: string): Record<string, string> {
  return header.split(";").reduce<Record<string, string>>((acc, part) => {
    const [key, ...rest] = part.trim().split("=");
    if (!key) return acc;
    try {
      acc[key] = decodeURIComponent(rest.join("="));
    } catch {
      acc[key] = rest.join("=");
    }
    return acc;
  }, {});
}

function userFromSession(req: { headers: Record<string, string | string[] | undefined> }): { id: string; isAdmin: boolean } | null {
  try {
    const token = parseCookies(String(req.headers.cookie || ""))[COOKIE_NAME] || "";
    if (!token.includes(".")) return null;
    const [payload, signature] = token.split(".");
    const secret = process.env.NUR_SESSION_SECRET || process.env.GOOGLE_CLIENT_SECRET || "";
    // ★ Boş/kısa secret ile doğrulama YAPMA — aksi halde HMAC("") tahmin
    //   edilebilir olur ve herkes geçerli oturum üretebilir.
    if (!payload || !signature || secret.length < 20) return null;
    const expected = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expected);
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;
  const user = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionUser;
  if (!user.id || !user.email || user.verified !== true) return null;
  if (!user.exp || user.exp < Math.floor(Date.now() / 1000)) return null;
  return { id: user.id, isAdmin: user.isAdmin === true };
  } catch {
    return null;
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "POST only" });
  if (!allowRequest(req, res)) return;

  const user = userFromSession(req);
  if (!user) return res.status(401).json({ ok: false, error: "Giriş yapın" });

  const kind = String(req.body?.kind || "");
  if (!["kisa", "uzun", "tam"].includes(kind)) return res.status(400).json({ ok: false, error: "Geçersiz video türü" });
  // ★ ADMIN: tüm üretim hakları sınırsız — kota RPC'sine hiç gitmeden onay
  if (user.isAdmin) {
    return res.status(200).json({ ok: true, quota_left: 9999, pack_left: 9999, admin: true });
  }

  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) return res.status(503).json({ ok: false, error: "Kota servisi kullanılamıyor" });

  // ★ Atomic RPC — paralel isteklerde çift harcama imkânsız.
  const response = await fetch(`${url}/rest/v1/rpc/nur_consume_video`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_user_id: user.id, p_video_kind: kind, p_daily_quota: kind === "kisa" ? 3 : 0 }),
  });
  let rows: Array<{ ok: boolean; quota_left: number; pack_left: number; error?: string }> = [];
  try {
    const parsed = await response.json();
    rows = Array.isArray(parsed) ? parsed : [];
  } catch {
    rows = [];
  }
  const row = rows[0];
  if (!response.ok || !row?.ok) return res.status(402).json({ ok: false, error: row?.error || "NO_RIGHTS_LEFT" });
  return res.status(200).json({ ok: true, kind, remaining: (row.quota_left || 0) + (row.pack_left || 0) });
}
