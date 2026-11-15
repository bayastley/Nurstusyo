import crypto from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';

interface SessionUser { id: string; sub: string; email: string; name: string; verified: boolean; exp: number }

function supabaseConfig() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) throw new Error("Supabase sunucu ayarları eksik");
  return { url, key };
}

function getSessionUser(req: VercelRequest): SessionUser | null {
  const cookie = String(req.headers.cookie || '').split(';').map((p) => p.trim()).find((p) => p.startsWith('nur_session='));
  if (!cookie) return null;
  const token = decodeURIComponent(cookie.slice('nur_session='.length));
  const [payload, signature] = token.split('.');
  const secret = process.env.NUR_SESSION_SECRET || '';
  if (!payload || !signature || secret.length < 20) return null;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest().toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return null;
  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const user = JSON.parse(Buffer.from(normalized + (normalized.length % 4 ? '='.repeat(4 - (normalized.length % 4)) : ''), 'base64').toString('utf8')) as SessionUser;
    if (!user.id || !user.email || !user.sub || user.verified !== true || !user.exp || user.exp < Math.floor(Date.now() / 1000)) return null;
    return user;
  } catch { return null; }
}

async function supabaseRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { url, key } = supabaseConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}`, ...(init.headers || {}) },
    ...init,
    cache: "no-store",
  });
  if (!response.ok) throw new Error(await response.text());
  const ct = response.headers.get("content-type") || "";
  if (ct.includes("application/json")) return await response.json() as T;
  return await response.text() as unknown as T;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "DELETE") return res.status(405).json({ ok: false, error: "Method Not Allowed" });

  const user = getSessionUser(req);
  if (!user) return res.status(401).json({ ok: false, error: "Oturum açmış olmalısınız" });

  let rawDel: Buffer;
  try {
    const chunks: Buffer[] = [];
    for await (const chunk of req as any) chunks.push(Buffer.from(chunk));
    rawDel = Buffer.concat(chunks);
  } catch { return res.status(400).json({ ok: false, error: "Gövde okunamadı" }); }

  let body: { record_id: string };
  try { body = JSON.parse(rawDel.toString("utf8")); } catch { return res.status(400).json({ ok: false, error: "Geçersiz JSON" }); }
  if (!body.record_id) return res.status(400).json({ ok: false, error: "record_id gerekli" });

  const me = await supabaseRequest<{ id: string; user_id: string; object_path: string }[]>(
    `kendi_ses_kayitlari?id=eq.${encodeURIComponent(body.record_id)}&select=id,user_id,object_path`
  );
  const rec = Array.isArray(me) && me[0] ? me[0] : null;
  if (!rec) return res.status(404).json({ ok: false, error: "Kayıt bulunamadı" });
  if (rec.user_id !== user.id) return res.status(403).json({ ok: false, error: "Bu kaydı silme izniniz yok" });

  // ★ Depolamadan dosyayı sil (best effort — hata olursa kayıt yine silinir)
  if (rec.object_path) {
    try {
      const { url, key } = supabaseConfig();
      await fetch(`${url}/storage/v1/object/${'kendi-sesler'}/${encodeURIComponent(rec.object_path)}`, {
        method: "DELETE",
        headers: { apikey: key, Authorization: `Bearer ${key}` },
      });
    } catch { /* silme hatası kritik değil */ }
  }

  await supabaseRequest(`kendi_ses_kayitlari?id=eq.${encodeURIComponent(body.record_id)}`, { method: "DELETE" });
  return res.status(200).json({ ok: true });
}
