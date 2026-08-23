import crypto from 'crypto';

const COOKIE_NAME = 'nur_session';

function parseCookies(req: any): Record<string, string> {
  const header = req.headers.cookie || '';
  return header.split(';').reduce<Record<string, string>>((acc, part) => {
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
  res.setHeader('Pragma', 'no-cache');

  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'GET only' });
  }

  try {
    const user = getUser(req);
    if (!user) {
      return res.status(401).json({ ok: false, error: 'Giriş yapın' });
    }

    const sbUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/+$/, '');
    const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!sbUrl || !sbKey) {
      return res.status(200).json({ ok: true, wallet: { sub_jeton: 0, purchased_jeton: 0, kisa: 0, uzun: 0, tam: 0 } });
    }

    // Supabase'den cüzdanı çek
    const walletRes = await fetch(
      `${sbUrl}/rest/v1/nur_wallets?user_id=eq.${encodeURIComponent(user.id)}&select=*`,
      {
        headers: {
          apikey: sbKey,
          Authorization: `Bearer ${sbKey}`,
        },
      }
    );

    const rows = await walletRes.json() as any[];
    const wallet = rows?.[0] || { sub_jeton: 0, purchased_jeton: 0 };

    // purchased_jeton'u video türlerine çevir (basit mantık: hepsi kısa video)
    // Gerçek uygulamada purchased_jeton türüne göre ayrılabilir
    const purchasedJeton = wallet.purchased_jeton || 0;

    console.log('[wallet] Kullanıcı:', user.id, 'Jeton:', purchasedJeton);

    return res.status(200).json({
      ok: true,
      wallet: {
        sub_jeton: wallet.sub_jeton || 0,
        purchased_jeton: purchasedJeton,
        // Frontend'in beklediği format
        kisa: purchasedJeton,
        uzun: 0,
        tam: 0,
      },
    });
  } catch (err: any) {
    console.error('[wallet] fatal:', err);
    return res.status(500).json({ ok: false, error: err?.message });
  }
}
