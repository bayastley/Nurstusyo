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

function getSupabase() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/+$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !key) return null;
  return { url, key };
}

async function sbGet(path: string) {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const res = await fetch(`${sb.url}/rest/v1/${path}`, {
      headers: { apikey: sb.key, Authorization: `Bearer ${sb.key}` },
    });
    if (!res.ok) return null;
    const text = await res.text();
    if (!text) return [];
    return JSON.parse(text);
  } catch { return null; }
}

async function sbPatch(path: string, body: any) {
  const sb = getSupabase();
  if (!sb) return;
  try {
    await fetch(`${sb.url}/rest/v1/${path}`, {
      method: 'PATCH',
      headers: {
        apikey: sb.key,
        Authorization: `Bearer ${sb.key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(body),
    });
  } catch {}
}

async function sbPost(table: string, body: any) {
  const sb = getSupabase();
  if (!sb) return;
  try {
    await fetch(`${sb.url}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        apikey: sb.key,
        Authorization: `Bearer ${sb.key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(body),
    });
  } catch {}
}

// ═══════════════════════════════════════════════════════════════
// HAK TANIMLAMA
// ═══════════════════════════════════════════════════════════════
async function grantProduct(userId: string, productCode: string) {
  try {
    const isPro = productCode.includes('PRO') && !productCode.includes('ELIT');
    const isElit = productCode.includes('ELIT');
    const isYearly = productCode.includes('_1Y');
    const isPackage = productCode.startsWith('PK_');

    if (isPro || isElit) {
      const tier = isElit ? 'elit' : 'pro';
      const days = isYearly ? 365 : 30;
      const endsAt = new Date(Date.now() + days * 86400000).toISOString();

      await sbPatch(`nur_users?id=eq.${encodeURIComponent(userId)}`, {
        tier, updated_at: new Date().toISOString(),
      });
      await sbPost('nur_subscriptions', {
        user_id: userId, tier, provider: 'iyzico',
        starts_at: new Date().toISOString(), ends_at: endsAt, status: 'active',
      });
      console.log('[verify] ✅ Üyelik:', tier, days, 'gün');
      return true;
    }

    if (isPackage) {
      const match = productCode.match(/PK_(KISA|UZUN|TAM)_(\d+)/);
      if (!match) return false;
      const videoKind = match[1].toLowerCase();
      const videoCount = parseInt(match[2]);
      const jetonPerVideo: Record<string, number> = { kisa: 1, uzun: 3, tam: 5 };
      const totalJeton = videoCount * (jetonPerVideo[videoKind] || 1);

      const rows = await sbGet(`nur_wallets?user_id=eq.${encodeURIComponent(userId)}&select=*`);
      const existing = Array.isArray(rows) ? rows[0] : null;

      if (existing) {
        await sbPatch(`nur_wallets?user_id=eq.${encodeURIComponent(userId)}`, {
          purchased_jeton: (existing.purchased_jeton || 0) + totalJeton,
          updated_at: new Date().toISOString(),
        });
      } else {
        await sbPost('nur_wallets', {
          user_id: userId, sub_jeton: 0, purchased_jeton: totalJeton,
        });
      }
      console.log('[verify] ✅ Jeton:', totalJeton, '(' + videoCount + 'x ' + videoKind + ')');
      return true;
    }
    return false;
  } catch (err: any) {
    console.error('[verify] Hata:', err?.message);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// ANA HANDLER — Kullanıcı sayfaya döndüğünde çağrılır
// ═══════════════════════════════════════════════════════════════
export default async function handler(req: any, res: any) {
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

    const { orderId } = body;

    if (!orderId) {
      return res.status(400).json({ ok: false, error: 'orderId gerekli' });
    }

    // Supabase'den siparişi bul
    const order = await sbGet(`nur_orders?id=eq.${encodeURIComponent(orderId)}&select=*`);
    const orderRow = Array.isArray(order) ? order[0] : null;

    if (!orderRow) {
      return res.status(404).json({ ok: false, error: 'Sipariş bulunamadı' });
    }

    // user_id eşleşme kontrolü
    if (orderRow.user_id !== user.id) {
      return res.status(403).json({ ok: false, error: 'Bu sipariş size ait değil' });
    }

    // Zaten paid ise tekrar verme (idempotency)
    if (orderRow.status === 'paid' || orderRow.status === 'completed') {
      return res.status(200).json({ ok: true, alreadyCompleted: true });
    }

    // Pending ise hâlâ ödenmemiş — verify'de hak verme
    if (orderRow.status === 'pending') {
      return res.status(202).json({ ok: false, error: 'Ödeme henüz tamamlanmadı' });
    }

    // productCode'u siparişten oku (istemciden alma!)
    const productCode = orderRow.product_code;
    console.log('[verify] İstek:', { userId: user.id, orderId, productCode });

    // Hak tanımla
    const granted = await grantProduct(user.id, productCode);

    if (granted) {
      await sbPatch(`nur_orders?id=eq.${encodeURIComponent(orderId)}`, {
        status: 'paid',
        payment_id: 'manual_verify',
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      return res.status(200).json({ ok: true, granted: true });
    }

    return res.status(200).json({ ok: false, error: 'Ürün tanınamadı' });
  } catch (err: any) {
    console.error('[verify] fatal:', err);
    return res.status(500).json({ ok: false, error: err?.message });
  }
}
