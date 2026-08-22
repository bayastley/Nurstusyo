Repo dosyasını doğrudan açamıyorum (tarayıcı erişimim yok), ama log'lar hatayı net gösteriyor — iyzico'nun **errorCode 23** hatası tek bir anlama gelir:

> **İsteğin gövdesinde `callbackUrl` alanı hiç gitmiyor (ya da boş string gidiyor).**

Log'da gönderdiğin isteği yazdırmışsın: `conversationId`, `basketId`, `price`, `currency` var → **`callbackUrl` yok**. Yani payload'a hiç eklenmemiş veya `undefined` olduğu için `JSON.stringify` onu siliyor.

---

## En olası 4 sebep

| # | Sebep | Kontrol |
|---|---|---|
| 1 | `process.env.NEXT_PUBLIC_SITE_URL` / `SITE_URL` Vercel **Production** ortamında tanımlı değil → `callbackUrl: undefined` → JSON'dan düşüyor | Vercel → Settings → Environment Variables |
| 2 | Alan adını yanlış yazmışsın: `callback_url`, `callBackUrl`, `callbackURL` | iyzico **sadece** `callbackUrl` kabul eder |
| 3 | `callbackUrl`'i request objesine değil, hash/PKI stringine eklemişsin (veya tersi) | Aşağıdaki kod |
| 4 | v1 (IYZWS) PKI string'i kullanıyorsun ve `callbackUrl` sıralaması yanlış | v2'ye geç (aşağıda) |

Ek not: iyzico `localhost`, `http://`, relative URL kabul etmez. **Mutlaka public `https://` olmalı.**

---

## Çalışan `api/payments/create.ts` (IYZWSv2 – PKI derdi yok)

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

const IYZICO_BASE = process.env.IYZICO_SANDBOX === 'true'
  ? 'https://sandbox-api.iyzipay.com'
  : 'https://api.iyzipay.com';

const URI_PATH = '/payment/iyzipos/checkoutform/initialize/auth/ecom';

// --- Auth header (IYZWSv2 / HMAC-SHA256) ---
function buildAuthHeader(bodyString: string) {
  const apiKey = process.env.IYZICO_API_KEY!;
  const secretKey = process.env.IYZICO_SECRET_KEY!;
  const randomKey = Date.now() + crypto.randomBytes(8).toString('hex');

  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(randomKey + URI_PATH + bodyString)   // <-- gönderilen string ile BİREBİR aynı olmalı
    .digest('hex');

  const authString =
    `apiKey:${apiKey}&randomKey:${randomKey}&signature:${signature}`;

  return {
    authorization: 'IYZWSv2 ' + Buffer.from(authString).toString('base64'),
    randomKey,
  };
}

// --- Site origin'i güvenli şekilde çöz ---
function resolveOrigin(req: VercelRequest) {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : '');

  if (fromEnv) return fromEnv.replace(/\/+$/, '');

  const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
  const host = (req.headers['x-forwarded-host'] as string) || req.headers.host;
  return `${proto}://${host}`.replace(/\/+$/, '');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { price = '299.00', buyer, basketItems, address } = req.body ?? {};

    const origin = resolveOrigin(req);
    const callbackUrl = `${origin}/api/payments/callback`;

    // 🔒 Guard: hata 23'ün bir daha olmaması için
    if (!/^https:\/\/[^/]+\/.+/.test(callbackUrl) || callbackUrl.includes('undefined')) {
      console.error('[payments/create] Geçersiz callbackUrl:', callbackUrl);
      return res.status(500).json({ error: 'callbackUrl_invalid', callbackUrl });
    }

    const conversationId = `conv-${Date.now()}`;
    const basketId = `bask-${Date.now()}`;

    const request = {
      locale: 'tr',
      conversationId,
      price: String(price),          // string, 2 hane, nokta ayraç
      paidPrice: String(price),      // ZORUNLU
      currency: 'TRY',
      basketId,
      paymentGroup: 'PRODUCT',
      callbackUrl,                   // ✅ ZORUNLU ALAN — burada
      enabledInstallments: [1, 2, 3, 6, 9],
      buyer: {
        id: buyer?.id ?? 'BY001',
        name: buyer?.name ?? 'Ad',
        surname: buyer?.surname ?? 'Soyad',
        gsmNumber: buyer?.gsmNumber ?? '+905350000000',
        email: buyer?.email ?? 'test@nurstudyo.com',
        identityNumber: buyer?.identityNumber ?? '11111111111',
        registrationAddress: buyer?.address ?? 'Türkiye',
        ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? '85.34.78.112',
        city: buyer?.city ?? 'Istanbul',
        country: 'Turkey',
      },
      shippingAddress: {
        contactName: `${buyer?.name ?? 'Ad'} ${buyer?.surname ?? 'Soyad'}`,
        city: address?.city ?? 'Istanbul',
        country: 'Turkey',
        address: address?.address ?? 'Türkiye',
      },
      billingAddress: {
        contactName: `${buyer?.name ?? 'Ad'} ${buyer?.surname ?? 'Soyad'}`,
        city: address?.city ?? 'Istanbul',
        country: 'Turkey',
        address: address?.address ?? 'Türkiye',
      },
      basketItems: basketItems ?? [
        {
          id: 'ITEM1',
          name: 'Nurstüdyo Paket',
          category1: 'Egitim',
          itemType: 'VIRTUAL',
          price: String(price),      // basketItems toplamı = price olmalı
        },
      ],
    };

    // ⚠️ Aynı string hem imzada hem body'de kullanılmalı
    const bodyString = JSON.stringify(request);
    const { authorization, randomKey } = buildAuthHeader(bodyString);

    console.log('[iyzico] İstek gönderiliyor:', {
      url: IYZICO_BASE + URI_PATH,
      callbackUrl,
      conversationId,
      price: request.price,
    });

    const iyziRes = await fetch(IYZICO_BASE + URI_PATH, {
      method: 'POST',
      headers: {
        Authorization: authorization,
        'x-iyzi-rnd': randomKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: bodyString,
    });

    const data = await iyziRes.json();

    if (data.status !== 'success') {
      console.error('[iyzico] Hata — tam yanıt:', data);
      return res.status(400).json({
        error: data.errorMessage,
        code: data.errorCode,
        sentCallbackUrl: callbackUrl,
      });
    }

    return res.status(200).json({
      token: data.token,
      checkoutFormContent: data.checkoutFormContent,
      paymentPageUrl: data.paymentPageUrl,
      conversationId,
    });
  } catch (e: any) {
    console.error('[payments/create] fatal:', e);
    return res.status(500).json({ error: e?.message ?? 'unknown' });
  }
}
```

---

## Hemen yapman gerekenler

**1) Vercel env değişkenleri** (Production + Preview ikisine de ekle, sonra **Redeploy**):

```
IYZICO_API_KEY      = ...
IYZICO_SECRET_KEY   = ...
IYZICO_SANDBOX      = false
NEXT_PUBLIC_SITE_URL= https://nurstudyo.com
```
> Env değişkeni ekledikten sonra **yeni deploy** almazsan eski build eski env ile çalışmaya devam eder — hatanın klasik sebebi budur.

**2) Callback endpoint'i oluştur:** `api/payments/callback.ts` — iyzico buraya **POST** (form-urlencoded) ile `token` gönderir. Yoksa ödeme sonrası kullanıcı 404 alır:

```ts
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = req.body?.token || req.query?.token;
  // retrieve çağrısı ile ödemeyi doğrula, sonra:
  res.redirect(303, `/odeme-sonuc?token=${token}`);
}
```
> `vercel.json`'da rewrite/redirect varsa `/api/payments/callback` yolunun POST'u bozmadığından emin ol.

**3) Doğrulama:** deploy sonrası log'da şunu görmelisin:
```
[iyzico] İstek gönderiliyor: { callbackUrl: "https://nurstudyo.com/api/payments/callback", ... }
```
`undefined/api/payments/callback` görüyorsan → env hâlâ yok demektir.

---

### Eğer v1 (IYZWS / PKI string) kullanmakta ısrarlıysan
`callbackUrl` PKI string'inde **şu sırada** olmalı, aksi halde imza tutmaz:

```
[locale=tr,conversationId=...,price=...,basketId=...,paymentGroup=PRODUCT,buyer=[...],shippingAddress=[...],billingAddress=[...],basketItems=[...],callbackUrl=https://...,currency=TRY,paidPrice=...]
```

Ama tavsiyem yukarıdaki **v2**; sıralama derdi tamamen ortadan kalkıyor.

İstersen mevcut `create.ts` dosyanın içeriğini buraya yapıştır, satır satır hangi yerde `callbackUrl`'in düştüğünü göstereyim.
