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
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method Not Allowed" });

  const user = getSessionUser(req);
  if (!user) return res.status(401).json({ ok: false, error: "Oturum açmış olmalısınız" });

  let rawSeg: Buffer;
  try {
    const chunks: Buffer[] = [];
    for await (const chunk of req as any) chunks.push(Buffer.from(chunk));
    rawSeg = Buffer.concat(chunks);
  } catch { return res.status(400).json({ ok: false, error: "Gövde okunamadı" }); }

  let body: { record_id: string; sure_no?: number; ayet_baslangic?: number; ayet_bitis?: number; sure_saniye?: number };
  try { body = JSON.parse(rawSeg.toString("utf8")); } catch { return res.status(400).json({ ok: false, error: "Geçersiz JSON" }); }

  if (!body.record_id) return res.status(400).json({ ok: false, error: "record_id gerekli" });

  const me = await supabaseRequest<{ id: string; user_id: string; sure_no: number; ayet_baslangic: number; ayet_bitis: number; audio_url: string; segmentler: any }[]>(
    `kendi_ses_kayitlari?id=eq.${encodeURIComponent(body.record_id)}&select=id,user_id,sure_no,ayet_baslangic,ayet_bitis,audio_url,segmentler`
  );
  const rec = Array.isArray(me) && me[0] ? me[0] : null;
  if (!rec) return res.status(404).json({ ok: false, error: "Kayıt bulunamadı" });
  if (rec.user_id !== user.id) return res.status(403).json({ ok: false, error: "Bu kayda erişim izniniz yok" });

  const sureNo = body.sure_no ?? rec.sure_no;
  const ayetBas = body.ayet_baslangic ?? rec.ayet_baslangic;
  const ayetSon = body.ayet_bitis ?? rec.ayet_bitis;
  const sureSaniye = Number(body.sure_saniye || 0);

  // ★ SEGMENTASYON — GEÇICİ ISKELET
  //   Gerçek ms-presiz bölme için sunucuda WhisperX (forced alignment) çalıştırılmalı.
  //   Şu an: toplam süreyi ayet sayısına eşit böl (yaklaşık). Üretimde bu bölüm
  //   whisperx align çıktısıyla değiştirilir; ayet sınırları kesin yerde olur.
  const adet = Math.max(1, ayetSon - ayetBas + 1);
  const sure = sureSaniye > 0 ? sureSaniye : 60;
  const parca = sure / adet;
  const segmentler: Array<{ ayet_no: number; baslangic_ms: number; bitis_ms: number; sure_ms: number; metin_tr?: string }> = [];
  let t = 0;
  for (let i = 0; i < adet; i++) {
    const ayetNo = ayetBas + i;
    const bas = Math.round(t * 1000);
    const bit = i === adet - 1 ? Math.round(sure * 1000) : Math.round((t + parca) * 1000);
    segmentler.push({ ayet_no: ayetNo, baslangic_ms: bas, bitis_ms: bit, sure_ms: bit - bas });
    t += parca;
  }

  const guncel = await supabaseRequest<any[]>(
    `kendi_ses_kayitlari?id=eq.${encodeURIComponent(body.record_id)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify({ segmentler, durum: "tamamlandi", guncellenme: new Date().toISOString() }),
    }
  );

  return res.status(200).json({ ok: true, segmentler, record: Array.isArray(guncel) ? guncel[0] : guncel, not: "segmentler şu an eşit-bölme iskeletidir; WhisperX forced-alignment ile ms-presiz hale getirilecek" });
}
