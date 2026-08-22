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
      try {
        body = JSON.parse(body);
      } catch (err) {
        body = {};
      }
    }

    const buyer = body.buyer || body.user || {};
    const price = money(body.price != null ? body.price : body.amount, '300.00');
    const planName = String(body.planName || body.plan || 'Nur Elit Paket');

    const origin = resolveOrigin(req);
    const callbackUrl = origin + '/api/payments/callback';

    if (!process.env.IYZICO_API_KEY || !process.env.IYZICO_SECRET_KEY) {
      res.status(500).json({ error: 'iyzico anahtarlari eksik (env)' });
      return;
    }

    const conversationId = 'conv-' + Date.now();
    const basketId = 'bask-' + Date.now();
    const ipHeader = String(req.headers['x-forwarded-for'] || '85.34.78.112');
    const ip = ipHeader.split(',')[0].trim() || '85.34.78.112';

    const name = String(buyer.name || 'Musteri');
    const surname = String(buyer.surname || 'Uye');
    const fullName = name + ' ' + surname;
    const city = String(buyer.city || 'Istanbul');
    const address = String(buyer.address || 'Turkiye');

    const request = {
      locale: 'tr',
      conversationId: conversationId,
      price: price,
      paidPrice: price,
      currency: 'TRY',
      basketId: basketId,
      paymentGroup: 'PRODUCT',
      callbackUrl: callbackUrl,
      enabledInstallments: [1, 2, 3, 6, 9],
      buyer: {
        id: String(buyer.id || 'BY001'),
        name: name,
        surname: surname,
        gsmNumber: String(buyer.gsmNumber || '+905350000000'),
        email: String(buyer.email || 'musteri@nurstudyo.com'),
        identityNumber: String(buyer.identityNumber || '11111111111'),
        registrationAddress: address,
        ip: ip,
        city: city,
        country: 'Turkey',
      },
      shippingAddress: {
        contactName: fullName,
        city: city,
        country: 'Turkey',
        address: address,
      },
      billingAddress: {
        contactName: fullName,
        city: city,
        country: 'Turkey',
        address: address,
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
    try {
      data = JSON.parse(raw);
    } catch (err) {
      res.status(502).json({ error: 'iyzico gecersiz yanit' });
      return;
    }

    if (data.status !== 'success') {
      console.error('[iyzico] Hata - tam yanit:', data);
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

    console.log('[iyzico] BASARILI', {
      token: token,
      paymentPageUrl: pageUrl,
      htmlVarMi: html.length > 0,
    });

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