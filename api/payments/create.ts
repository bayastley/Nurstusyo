import crypto from 'crypto';

const URI_PATH = '/payment/iyzipos/checkoutform/initialize/auth/ecom';

function getBase() {
  return process.env.IYZICO_SANDBOX === 'true'
    ? 'https://sandbox-api.iyzipay.com'
    : 'https://api.iyzipay.com';
}

function buildAuth(bodyString: string) {
  const apiKey = process.env.IYZICO_API_KEY || '';
  const secretKey = process.env.IYZICO_SECRET_KEY || '';
  const randomKey = String(Date.now()) + crypto.randomBytes(8).toString('hex');
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(randomKey + URI_PATH + bodyString)
    .digest('hex');
  const authString =
    'apiKey:' + apiKey + '&randomKey:' + randomKey + '&signature:' + signature;
  return {
    authorization: 'IYZWSv2 ' + Buffer.from(authString).toString('base64'),
    randomKey: randomKey,
  };
}

function resolveOrigin(req: any) {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.VITE_SITE_URL ||
    '';
  if (fromEnv) {
    let u = String(fromEnv).trim().replace(/\/+$/, '');
    if (u.indexOf('http') !== 0) u = 'https://' + u;
    return u;
  }
  const proto = String(req.headers['x-forwarded-proto'] || 'https');
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '');
  return (proto + '://' + host).replace(/\/+$/, '');
}

function money(v: any, fallback: string) {
  const n = Number(String(v == null ? '' : v).replace(',', '.'));
  if (!isFinite(n) || n <= 0) return fallback;
  return n.toFixed(2);
}

// ─── SUNUCU TARAFI ÜRÜN KATALOGU ─── Fiyatları buradan yönet
const PRODUCT_CATALOG: Record<string, { price: string; name: string; kind: string }> = {
  // Aylık abonelikler
  SUB_PRO_1M:  { price: '149.00', name: 'NÛR PRO Aylık',  kind: 'subscription' },
  SUB_ELIT_1M: { price: '300.00', name: 'NÛR ELİT Aylık', kind: 'subscription' },
  // Yıllık abonelikler
  SUB_PRO_1Y:  { price: '1609.20', name: 'NÛR PRO Yıllık',  kind: 'subscription' },
  SUB_ELIT_1Y: { price: '2880.00', name: 'NÛR ELİT Yıllık', kind: 'subscription' },
  // Kısa video paketleri
  PK_KISA_15:  { price: '35.00',  name: '15 Kısa Video',  kind: 'package' },
  PK_KISA_35:  { price: '69.00',  name: '35 Kısa Video',  kind: 'package' },
  PK_KISA_70:  { price: '119.00', name: '70 Kısa Video',  kind: 'package' },
  // Uzun video paketleri
  PK_UZUN_8:   { price: '45.00',  name: '8 Uzun Video',   kind: 'package' },
  PK_UZUN_20:  { price: '99.00',  name: '20 Uzun Video',  kind: 'package' },
  PK_UZUN_40:  { price: '169.00', name: '40 Uzun Video',  kind: 'package' },
  // Tam sürüm paketleri
  PK_TAM_2:    { price: '79.00',  name: '2 Tam Sürüm',    kind: 'package' },
  PK_TAM_5:    { price: '179.00', name: '5 Tam Sürüm',    kind: 'package' },
  PK_TAM_10:   { price: '299.00', name: '10 Tam Sürüm',   kind: 'package' },
};

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    let body = req.body || {};
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = {}; }
    }

    // ─── Product code'dan fiyatı bul ───
    const productCode = String(body.productCode || 'SUB_ELIT_1M');
    const catalogItem = PRODUCT_CATALOG[productCode];
    if (!catalogItem) {
      console.error('[payments/create] Tanınmayan ürün:', productCode);
      res.status(400).json({ error: 'Tanınmayan ürün kodu: ' + productCode });
      return;
    }

    const price = catalogItem.price;
    const planName = catalogItem.name;
    const buyer = body.buyer || body.user || {};
    const origin = resolveOrigin(req);
    const callbackUrl = origin + '/api/payments/callback';

    if (!process.env.IYZICO_API_KEY || !process.env.IYZICO_SECRET_KEY) {
      res.status(500).json({ error: 'iyzico anahtarlari eksik (env)' });
      return;
    }

    const orderId = 'NUR-' + Date.now() + '-' + crypto.randomBytes(4).toString('hex');
    const conversationId = orderId;
    const basketId = orderId;
    const ipHeader = String(req.headers['x-forwarded-for'] || '85.34.78.112');
    const ip = ipHeader.split(',')[0].trim() || '85.34.78.112';
    const city = String(buyer.city || 'Istanbul');
    const address = String(buyer.address || 'Turkiye');

    // ─── Cookie session'dan kullanıcı bilgisi al ───
    let userId = '';
    let sessionEmail = '';
    let sessionName = '';
    try {
      const cookies = (req.headers.cookie || '').split(';').reduce((acc: any, c: string) => {
        const [k, ...v] = c.trim().split('=');
        if (k) acc[k] = decodeURIComponent(v.join('='));
        return acc;
      }, {});
      const token = cookies['nur_session'] || '';
      if (token.includes('.')) {
        const payload = token.split('.')[0];
        const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
        const pad = normalized.length % 4 ? '='.repeat(4 - (normalized.length % 4)) : '';
        const user = JSON.parse(Buffer.from(normalized + pad, 'base64').toString('utf8'));
        if (user.id) userId = String(user.id);
        if (user.email) sessionEmail = String(user.email);
        if (user.name) sessionName = String(user.name);
      }
    } catch {}

    if (!userId) {
      console.error('[payments/create] Oturum bulunamadı');
      res.status(401).json({ error: 'Giriş yapmalısınız' });
      return;
    }

    // ─── Supabase'den gerçek kullanıcı bilgilerini çek ───
    // ★ URL NORMALİZASYONU: Supabase panelindeki ".../rest/v1/" biçimindeki
    //   kopyalanan URL ve tırnak/boşluk hatalarına dayanıklı.
    let dbUser: { name?: string; email?: string } | null = null;
    try {
      const sbUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim().replace(/^["']+|["']+$/g, '').replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
      const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
      if (sbUrl && sbKey && userId) {
        const sbRes = await fetch(
          `${sbUrl}/rest/v1/nur_users?id=eq.${encodeURIComponent(userId)}&select=name,email`,
          { headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` }, cache: 'no-store' }
        );
        if (sbRes.ok) {
          const rows = await sbRes.json() as any[];
          if (rows[0]) dbUser = rows[0];
        }
      }
    } catch {}

    // ─── Buyer bilgilerini dinamik doldur ───
    // İsim: body.buyer.name > Supabase > session > varsayılan
    const rawName = String(buyer.name || dbUser?.name || sessionName || 'Nurstudyo');
    // Google isimleri genelde tek kelime —split et
    const nameParts = rawName.trim().split(/\s+/);
    const name = nameParts[0] || 'Nurstudyo';
    const surname = nameParts.slice(1).join(' ') || 'Kullanıcı';
    const fullName = name + ' ' + surname;

    const isSandbox = process.env.IYZICO_SANDBOX === 'true';
    // Sandbox'ta test TCKN, production'da gerçek TCKN veya placeholder
    const identityNumber = isSandbox
      ? '11111111110'
      : String(buyer.identityNumber || '11111111110');
    const buyerEmail = String(buyer.email || dbUser?.email || sessionEmail || 'kullanici@nurstudyo.com');
    const buyerId = String(buyer.id || userId || 'BY001');
    // Telefon: body'den gelmiyorsa varsayılan (iyzico zorunlu tutuyor)
    const gsmNumber = String(buyer.gsmNumber || '+905350000000');
    // Şehir ve adres: body'den gelmiyorsa varsayılan
    const buyerCity = String(buyer.city || 'İstanbul');
    const buyerAddress = String(buyer.address || buyer.registrationAddress || 'Türkiye');

    console.log('[payments/create] Buyer:', { name, surname, email: buyerEmail, city: buyerCity, sandbox: isSandbox });

    const request = {
      locale: 'tr',
      conversationId: conversationId,
      price: price,
      paidPrice: price,
      currency: 'TRY',
      basketId: basketId,
      paymentGroup: 'PRODUCT',
      callbackUrl: callbackUrl,
      enabledInstallments: [1],
      buyer: {
        id: buyerId,
        name: name,
        surname: surname,
        gsmNumber: gsmNumber,
        email: buyerEmail,
        identityNumber: identityNumber,
        registrationAddress: buyerAddress,
        ip: ip,
        city: buyerCity,
        country: 'Turkey',
      },
      shippingAddress: {
        contactName: fullName,
        city: buyerCity,
        country: 'Turkey',
        address: buyerAddress,
      },
      billingAddress: {
        contactName: fullName,
        city: buyerCity,
        country: 'Turkey',
        address: buyerAddress,
      },
      basketItems: [
        {
          id: 'ITEM1',
          name: planName,
          category1: 'Abonelik',
          itemType: 'VIRTUAL',
          price: price,
        },
      ],
    };

    const bodyString = JSON.stringify(request);
    const auth = buildAuth(bodyString);

    console.log('[payments/create] İstek:', { price, planName, conversationId, sandbox: process.env.IYZICO_SANDBOX });

    // Supabase'e sipariş kaydı (callback bulacak)
    try {
      const sbUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim().replace(/^["']+|["']+$/g, '').replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
      const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
      if (sbUrl && sbKey) {
        console.log('[payments/create] Supabase URL:', sbUrl.substring(0, 40) + '...');
        const sbRes = await fetch(`${sbUrl}/rest/v1/nur_orders`, {
          method: 'POST',
          headers: {
            apikey: sbKey,
            Authorization: `Bearer ${sbKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({
            id: conversationId,
            user_id: userId,
            product_code: productCode,
            amount_minor: Math.round(parseFloat(price) * 100),
            currency: 'TRY',
            provider: 'iyzico',
            status: 'pending',
            created_at: new Date().toISOString(),
          }),
        });
        if (!sbRes.ok) {
          const errBody = await sbRes.text().catch(() => '');
          console.error('[payments/create] Supabase yanıt:', sbRes.status, errBody.slice(0, 300));
        } else {
          console.log('[payments/create] Supabase sipariş kaydedildi:', conversationId);
        }
      }
    } catch (err: any) {
      console.error('[payments/create] Supabase kayıt hatası:', err?.message, err?.cause?.message || '');
    }

    // ★ Token → orderId mapping: token iyzico yanıtından geldikten sonra
    //   yazılır (aşağıda). Callback bu tabloyu okuyarak siparişi bulur —
    //   Sandbox conversationId döndürmese bile haklar yüklenir.

    const iyziRes = await fetch(getBase() + URI_PATH, {
      method: 'POST',
      headers: {
        Authorization: auth.authorization,
        'x-iyzi-rnd': auth.randomKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: bodyString,
    });

    const raw = await iyziRes.text();
    let data: any = {};
    try { data = JSON.parse(raw); } catch {
      res.status(502).json({ error: 'iyzico gecersiz yanit' });
      return;
    }

    if (data.status !== 'success') {
      console.error('[iyzico] Hata:', data);
      res.status(400).json({
        success: false,
        error: data.errorMessage || 'iyzico hatasi',
        message: data.errorMessage || 'iyzico hatasi',
        code: data.errorCode,
      });
      return;
    }

    const token = String(data.token || '');
    const html = String(data.checkoutFormContent || '');
    const pageUrl = String(data.paymentPageUrl || '');

    // ★ Token → sipariş eşlemesi: iyzico Sandbox bazen conversationId
    //   döndürmez; callback bu kayıt üzerinden siparişi bulur ve haklar
    //   yine de yüklenir. (nur_order_tokens tablosu migration_fix.sql'de)
    try {
      // ★ URL NORMALİZASYONU (fetch failed çözümü)
      const mapUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim().replace(/^["']+|["']+$/g, '').replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
      const mapKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
      if (mapUrl && mapKey && userId && token) {
        await fetch(`${mapUrl}/rest/v1/nur_order_tokens`, {
          method: 'POST',
          headers: {
            apikey: mapKey,
            Authorization: `Bearer ${mapKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({
            token,
            order_id: conversationId,
            user_id: userId,
            product_code: productCode,
          }),
        });
      }
    } catch { /* ignore */ }

    console.log('[iyzico] ✅ Başarılı, token: var');

    res.status(200).json({
      success: true,
      ok: true,
      status: 'success',
      token: token,
      conversationId: conversationId,
      checkoutFormContent: html,
      htmlContent: html,
      content: html,
      html: html,
      paymentPageUrl: pageUrl,
      url: pageUrl,
      redirectUrl: pageUrl,
      checkoutUrl: pageUrl,
      data: {
        token: token,
        checkoutFormContent: html,
        paymentPageUrl: pageUrl,
      },
    });
  } catch (e: any) {
    console.error('[payments/create] fatal:', e);
    res.status(500).json({
      success: false,
      error: (e && e.message) || 'bilinmeyen hata',
      message: (e && e.message) || 'bilinmeyen hata',
    });
  }
}
