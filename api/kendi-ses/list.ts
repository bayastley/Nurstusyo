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
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Method Not Allowed" });

  const user = getSessionUser(req);
  if (!user) return res.status(401).json({ ok: false, error: "Oturum açmış olmalısınız" });

  const rows = await supabaseRequest<any[]>(
    `kendi_ses_kayitlari?user_id=eq.${encodeURIComponent(user.id)}&select=id,sure_no,ayet_baslangic,ayet_bitis,dosya_adi,mime_turu,boyut_bayt,audio_url,durum,olusturma,segmentler&order=olusturma.desc`
  );
  return res.status(200).json({ ok: true, kayitlar: Array.isArray(rows) ? rows : [] });
}
