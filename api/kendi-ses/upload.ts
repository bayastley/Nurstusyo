import crypto from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const BUCKET = 'kendi-sesler';
const MAX_MB = 30;

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

async function supabaseStoragePut(objectPath: string, body: Buffer | Uint8Array, contentType: string): Promise<{ path: string; fullPath: string }> {
  const { url, key } = supabaseConfig();
  const response = await fetch(`${url}/storage/v1/object/${BUCKET}/${objectPath}`, {
    method: "PUT",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": contentType, "x-upsert": "true" },
    body: body as unknown as BodyInit,
  });
  if (!response.ok) throw new Error(await response.text());
  return (await response.json()) as { path: string; fullPath: string };
}

function parseMultipart(body: Buffer, boundary: string): { fields: Record<string, string>; files: Array<{ fieldname: string; filename: string; mime: string; data: Buffer }> } {
  const fields: Record<string, string> = {};
  const files: Array<{ fieldname: string; filename: string; mime: string; data: Buffer }> = [];
  const delim = `--${boundary}`;
  const parts = body.toString("latin1").split(delim);
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed || trimmed === "--") continue;
    const headerEnd = trimmed.indexOf("\r\n\r\n");
    if (headerEnd === -1) continue;
    const headers = trimmed.slice(0, headerEnd);
    const content = trimmed.slice(headerEnd + 4);
    const contentEnd = content.endsWith("\r\n") ? content.slice(0, -2) : content;
    const nameMatch = headers.match(/name="([^"]+)"/);
    const filenameMatch = headers.match(/filename="([^"]+)"/);
    const mimeMatch = headers.match(/content-type:\s*([^\r;]+)/i);
    if (filenameMatch) {
      files.push({
        fieldname: nameMatch ? nameMatch[1] : "file",
        filename: filenameMatch[1],
        mime: mimeMatch ? mimeMatch[1].trim() : "application/octet-stream",
        data: Buffer.from(contentEnd, "latin1"),
      });
    } else if (nameMatch) {
      fields[nameMatch[1]] = contentEnd.trim();
    }
  }
  return { fields, files };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method Not Allowed" });

  const user = getSessionUser(req);
  if (!user) return res.status(401).json({ ok: false, error: "Oturum açmış olmalısınız" });

  // ★ Tier gate: PRO veya ELİT
  let tier = "free";
  try {
    const me = await supabaseRequest<{ tier: string }[]>(`nur_users?id=eq.${encodeURIComponent(user.id)}&select=tier`);
    tier = Array.isArray(me) && me[0] ? String(me[0].tier) : "free";
    if (tier !== "pro" && tier !== "elit") {
      return res.status(403).json({ ok: false, error: "Kendi ses yükleme özelliği NÛR PRO veya NÛR ELİT üyeligi gerektirir" });
    }
  } catch {
    return res.status(500).json({ ok: false, error: "Üyelik kontrolü başarısız" });
  }

  const ct = String(req.headers["content-type"] || "");
  const boundaryMatch = ct.match(/boundary=([^\s;]+)/);
  if (!boundaryMatch) return res.status(400).json({ ok: false, error: "multipart/form-data bekleniyor" });

  let raw: Buffer;
  try {
    const chunks: Buffer[] = [];
    for await (const chunk of req as any) chunks.push(Buffer.from(chunk));
    raw = Buffer.concat(chunks);
  } catch { return res.status(400).json({ ok: false, error: "Gövde okunamadı" }); }

  if (raw.length > MAX_MB * 1024 * 1024) return res.status(413).json({ ok: false, error: `Maksimum ${MAX_MB} MB` });

  const { fields, files } = parseMultipart(raw, boundaryMatch[1]);
  const file = files[0];
  if (!file) return res.status(400).json({ ok: false, error: "Ses dosyası bulunamadı" });

  const allowed = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4", "audio/aac", "audio/x-m4a"];
  if (!allowed.includes(file.mime)) return res.status(400).json({ ok: false, error: "Desteklenmeyen ses formatı" });

  const sureNo = Number(fields.sure_no || 0);
  const ayetBas = Number(fields.ayet_baslangic || 1);
  const ayetSon = Number(fields.ayet_bitis || ayetBas);
  if (!sureNo || sureNo < 1 || sureNo > 114 || !ayetBas || ayetBas < 1 || ayetSon < ayetBas) {
    return res.status(400).json({ ok: false, error: "Geçersiz sure/ayet aralığı" });
  }

  const objectPath = `${user.id}/${Date.now()}_${crypto.randomBytes(4).toString("hex")}_${file.filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  try {
    await supabaseStoragePut(objectPath, file.data, file.mime);
  } catch (e) {
    return res.status(502).json({ ok: false, error: "Depolamaya yüklenemedi", detail: String((e as Error).message) });
  }

  const audioUrl = `${supabaseConfig().url}/storage/v1/object/public/${BUCKET}/${objectPath}`;

  const record = await supabaseRequest<any[]>(
    `kendi_ses_kayitlari?on_conflict=id`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify({
        user_id: user.id,
        sure_no: sureNo,
        ayet_baslangic: ayetBas,
        ayet_bitis: ayetSon,
        dosya_adi: file.filename,
        mime_turu: file.mime,
        boyut_bayt: file.data.length,
        audio_url: audioUrl,
        object_path: objectPath,
        segmentler: null,
        durum: "hazır", // hazır | segmentleniyor | tamamlandi | hata
      }),
    }
  );

  return res.status(200).json({ ok: true, record: Array.isArray(record) ? record[0] : record, tier: tier });
}
