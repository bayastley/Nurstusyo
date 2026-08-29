import crypto from 'crypto';

const COOKIE_NAME = 'nur_session';

function parseCookies(req: any): Record<string, string> {
  const header = req.headers.cookie || '';
  return header.split(';').reduce((acc: Record<string, string>, part: string) => {
    const [key, ...rest] = part.trim().split('=');
    if (!key) return acc;
    acc[key] = decodeURIComponent(rest.join('='));
    return acc;
  }, {});
}

function base64Url(input: Buffer | string): string {
  const raw = Buffer.isBuffer(input) ? input : Buffer.from(input, 'utf8');
  return raw.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(input: string): Buffer {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = normalized.length % 4 ? '='.repeat(4 - (normalized.length % 4)) : '';
  return Buffer.from(normalized + pad, 'base64');
}

function sessionSecret(): string {
  return process.env.NUR_SESSION_SECRET || process.env.GOOGLE_CLIENT_SECRET || '';
}

function signPayload(payload: string): string {
  return base64Url(crypto.createHmac('sha256', sessionSecret()).update(payload).digest());
}

function getUser(req: any): any | null {
  try {
    const token = parseCookies(req)[COOKIE_NAME];
    if (!token || !token.includes('.')) return null;
    const [payload, sig] = token.split('.');
    if (!payload || !sig) return null;
    const expected = signPayload(payload);
    const sigBuf = Buffer.from(sig);
    const expectedBuf = Buffer.from(expected);
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;
    const user = JSON.parse(fromBase64Url(payload).toString('utf8'));
    if (!user.exp || user.exp < Math.floor(Date.now() / 1000)) return null;
    return user;
  } catch { return null; }
}

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'POST only' });
  }

  try {
    const user = getUser(req);
    if (!user) {
      return res.status(401).json({ ok: false, error: 'Giriş yapın' });
    }

    let body: any = {};
    try { body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {}); } catch { body = {}; }

    const { kind } = body;
    if (!kind || !['kisa', 'uzun', 'tam'].includes(kind)) {
      return res.status(400).json({ ok: false, error: 'Geçersiz video türü: kisa/uzun/tam' });
    }

    const colMap: Record<string, string> = { kisa: 'purchased_kisa', uzun: 'purchased_uzun', tam: 'purchased_tam' };
    const colName = colMap[kind];

    // ★ URL NORMALİZASYONU (fetch failed çözümü)
    const sbUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim().replace(/^["']+|["']+$/g, '').replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
    const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!sbUrl || !sbKey) {
      return res.status(200).json({ ok: true, skipped: true });
    }

    // Mevcut hakları oku
    const walletRes = await fetch(
      `${sbUrl}/rest/v1/nur_wallets?user_id=eq.${encodeURIComponent(user.id)}&select=*`,
      { headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` } }
    );
    const rows = await walletRes.json() as any[];
    const wallet = rows?.[0];

    if (!wallet) {
      return res.status(200).json({ ok: true, skipped: true, reason: 'cüzdan bulunamadı' });
    }

    const currentVal = wallet[colName] || 0;
    if (currentVal <= 0) {
      return res.status(400).json({ ok: false, error: `${kind} hakkı kalmadı` });
    }

    // Hak düşür
    await fetch(
      `${sbUrl}/rest/v1/nur_wallets?user_id=eq.${encodeURIComponent(user.id)}`,
      {
        method: 'PATCH',
        headers: {
          apikey: sbKey,
          Authorization: `Bearer ${sbKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          [colName]: currentVal - 1,
          updated_at: new Date().toISOString(),
        }),
      }
    );

    console.log('[wallet-consume] ✅', kind, 'düşürüldü:', currentVal, '→', currentVal - 1);
    return res.status(200).json({ ok: true, kind, remaining: currentVal - 1 });
  } catch (err: any) {
    console.error('[wallet-consume] fatal:', err);
    return res.status(500).json({ ok: false, error: err?.message });
  }
}
