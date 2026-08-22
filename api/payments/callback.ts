import crypto from 'crypto';

const URI_PATH = '/payment/iyzipos/checkoutform/auth/ecom/detail';

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

export default async function handler(req: any, res: any) {
  try {
    let token = '';

    if (req.body && typeof req.body === 'object' && req.body.token) {
      token = String(req.body.token);
    } else if (typeof req.body === 'string' && req.body.length > 0) {
      const params = new URLSearchParams(req.body);
      token = String(params.get('token') || '');
    }
    if (!token && req.query && req.query.token) {
      token = String(req.query.token);
    }

    if (!token) {
      res.writeHead(303, { Location: '/odeme-sonuc?durum=hata&sebep=token_yok' });
      res.end();
      return;
    }

    const bodyString = JSON.stringify({ locale: 'tr', token: token });
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

    const data: any = await iyziRes.json();
    console.log('[payments/callback] sonuc:', {
      status: data.status,
      paymentStatus: data.paymentStatus,
      conversationId: data.conversationId,
    });

    const ok = data.status === 'success' && data.paymentStatus === 'SUCCESS';

    if (ok) {
      res.writeHead(303, {
        Location:
          '/odeme-sonuc?durum=basarili&id=' +
          encodeURIComponent(String(data.paymentId || '')),
      });
      res.end();
      return;
    }

    res.writeHead(303, {
      Location:
        '/odeme-sonuc?durum=hata&sebep=' +
        encodeURIComponent(String(data.errorMessage || 'odeme_basarisiz')),
    });
    res.end();
  } catch (e: any) {
    console.error('[payments/callback] fatal:', e);
    res.writeHead(303, { Location: '/odeme-sonuc?durum=hata&sebep=sunucu' });
    res.end();
  }
}