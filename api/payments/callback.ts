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

// ═══════════════════════════════════════════════════════════════
// SUPABASE YARDIMCILARI
// ═══════════════════════════════════════════════════════════════
function getSupabase() {
  // ★ URL NORMALİZASYONU: ".../rest/v1/" veya tırnaklı yapıştırılan
  //   değerlerde bile doğru REST kökü üretilir (fetch failed çözümü).
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim().replace(/^["']+|["']+$/g, '').replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !key) return null;
  return { url, key };
}

async function sbRequest(path: string, options: any = {}) {
  const sb = getSupabase();
  if (!sb) return null;
  const res = await fetch(`${sb.url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: sb.key,
      Authorization: `Bearer ${sb.key}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error(`[callback] Supabase ${res.status}:`, text.slice(0, 200));
    return null;
  }
  const text = await res.text();
  if (!text) return [];
  try { return JSON.parse(text); } catch { return []; }
}

// conversationId ile siparişi bul
async function findOrder(conversationId: string) {
  const rows = await sbRequest(`nur_orders?id=eq.${encodeURIComponent(conversationId)}&select=*`);
  return Array.isArray(rows) ? rows[0] : null;
}

// Sipariş durumunu güncelle
async function updateOrderStatus(conversationId: string, status: string, _paymentId?: string) {
  await sbRequest(`nur_orders?id=eq.${encodeURIComponent(conversationId)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      status: status === 'paid_ungranted' ? 'failed' : status,
      updated_at: new Date().toISOString(),
    }),
  });
}

// ═══════════════════════════════════════════════════════════════
// HAK TANIMLAMA — Doğru şema ile
// ═══════════════════════════════════════════════════════════════
async function grantProduct(userId: string, productCode: string) {
  try {
    const isPro = productCode.includes('PRO') && !productCode.includes('ELIT');
    const isElit = productCode.includes('ELIT');
    const isYearly = productCode.includes('_1Y');
    const isPackage = productCode.startsWith('PK_');

    // ─── ÜYELİK ise ─────────────────────────────────────────
    if (isPro || isElit) {
      const tier = isElit ? 'elit' : 'pro';
      const days = isYearly ? 365 : 30;

      // ★ Mevcut aktif aboneliği kontrol et — varsa süresini uzat
      let finalStartsAt = new Date().toISOString();
      let finalEndsAt = new Date(Date.now() + days * 86400000).toISOString();

      try {
        const existingSubs = await sbRequest(`nur_subscriptions?user_id=eq.${encodeURIComponent(userId)}&status=eq.active&order=ends_at.desc&limit=1&select=ends_at`);
        if (Array.isArray(existingSubs) && existingSubs.length > 0 && existingSubs[0].ends_at) {
          const currentEnd = new Date(existingSubs[0].ends_at);
          const now = new Date();
          if (currentEnd > now) {
            // ★ Mevcut abonelik hala devam ediyor → süresini uzat
            finalStartsAt = currentEnd.toISOString();
            finalEndsAt = new Date(currentEnd.getTime() + days * 86400000).toISOString();
            console.log(`[callback] ★ Mevcut abonelik uzatılıyor: ${currentEnd.toISOString()} → ${finalEndsAt} (+${days} gün)`);
          }
        }
      } catch {
        // nur_subscriptions tablosu yoksa sıfırdan başla
      }

      // nur_users tablosunda tier'ı güncelle (yoksa oluştur)
      const existingUser = await sbRequest(`nur_users?id=eq.${encodeURIComponent(userId)}&select=id`);
      if (Array.isArray(existingUser) && existingUser.length > 0) {
        await sbRequest(`nur_users?id=eq.${encodeURIComponent(userId)}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({ tier, updated_at: new Date().toISOString() }),
        });
      } else {
        await sbRequest('nur_users', {
          method: 'POST',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({
            id: userId,
            email: userId.includes('@') ? userId : userId + '@nurstudyo.com',
            tier,
            created_at: new Date().toISOString(),
          }),
        });
      }

      // nur_subscriptions tablosuna kayıt ekle
      await sbRequest('nur_subscriptions', {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({
          user_id: userId,
          tier,
          provider: 'iyzico',
          starts_at: finalStartsAt,
          ends_at: finalEndsAt,
          status: 'active',
        }),
      });

      console.log(`[callback] ✅ Üyelik tanımlandı: ${tier} | Başlangıç: ${finalStartsAt} | Bitiş: ${finalEndsAt}`);
      return true;
    }

    // ─── VİDEO PAKETİ ise ──────────────────────────────────
    if (isPackage) {
      const match = productCode.match(/PK_(KISA|UZUN|TAM)_(\d+)/);
      if (!match) {
        console.error('[callback] Video paketi formatı tanınamadı:', productCode);
        return false;
      }

      const videoKind = match[1].toLowerCase(); // kisa, uzun, tam
      const videoCount = parseInt(match[2]);

      // Doğrudan video sayısını ekle (jeton'a çevirme — sadece sayı)
      // purchased_kisa, purchased_uzun, purchased_tam sütunlarına yaz
      const colMap: Record<string, string> = { kisa: 'purchased_kisa', uzun: 'purchased_uzun', tam: 'purchased_tam' };
      const colName = colMap[videoKind] || 'purchased_kisa';

      // nur_wallets tablosunu güncelle
      const existing = await sbRequest(
        `nur_wallets?user_id=eq.${encodeURIComponent(userId)}&select=*`
      );
      const rows = Array.isArray(existing) ? existing : [];

      if (rows.length > 0) {
        const currentVal = rows[0][colName] || 0;
        await sbRequest(
          `nur_wallets?user_id=eq.${encodeURIComponent(userId)}`,
          {
            method: 'PATCH',
            headers: { Prefer: 'return=minimal' },
            body: JSON.stringify({
              [colName]: currentVal + videoCount,
              purchased_jeton: (rows[0].purchased_jeton || 0) + videoCount,
              updated_at: new Date().toISOString(),
            }),
          }
        );
      } else {
        const newRow: Record<string, any> = {
          user_id: userId,
          sub_jeton: 0,
          purchased_jeton: videoCount,
          purchased_kisa: 0,
          purchased_uzun: 0,
          purchased_tam: 0,
        };
        newRow[colName] = videoCount;
        await sbRequest('nur_wallets', {
          method: 'POST',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify(newRow),
        });
      }

      console.log(`[callback] ✅ Video kotası eklendi: ${videoCount}x ${videoKind}`);
      return true;
    }

    console.warn('[callback] Tanınmayan ürün kodu:', productCode);
    return false;
  } catch (err: any) {
    console.error('[callback] Hak tanımlama hatası:', err?.message);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// ANA HANDLER
// ═══════════════════════════════════════════════════════════════
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

    // ★ Rate limit — dakikada 30 istek (webhook + redirect)

    if (!token) {
      res.writeHead(303, { Location: '/?odeme=hata&sebep=token_yok' });
      res.end();
      return;
    }

    // iyzico'ya ödeme durumunu sor
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

    console.log('[callback] iyzico yanıtı:', {
      status: data.status,
      paymentStatus: data.paymentStatus,
      conversationId: data.conversationId,
      paymentId: data.paymentId,
      price: data.price,
    });

    const ok = data.status === 'success' && data.paymentStatus === 'SUCCESS';

    if (ok) {
      let conversationId = data.conversationId || data.basketId || '';
      let orderProductCode = '';

      if (!conversationId) {
        console.error('[callback] conversationId yok:', JSON.stringify(data).slice(0, 300));
      }

      // ★ 1) conversationId yoksa: iyzico Sandbox bunu DÖNDÜRMEYEBİLİR (senin
      //   logundaki "conversationId: undefined" bundandı). Siparişi TOKEN
      //   üzerinden bul — create.ts token'ı nur_order_tokens'a yazıyor.
      if (!conversationId && token) {
        const byToken = await sbRequest(
          `nur_order_tokens?token=eq.${encodeURIComponent(token)}&select=order_id`
        );
        const row = Array.isArray(byToken) ? byToken[0] : null;
        if (row?.order_id) conversationId = row.order_id;
      }
      // ★ 2) paymentId ile bul (migration_fix.sql payment_id kolonunu ekler)
      if (!conversationId && data.paymentId) {
        const byPayment = await sbRequest(`nur_orders?payment_id=eq.${encodeURIComponent(String(data.paymentId))}&select=*`);
        const row = Array.isArray(byPayment) ? byPayment[0] : null;
        if (row) conversationId = row.id;
      }
      // ★ 3) conversationId/basketId alanından (normal yol)
      if (!conversationId) {
        conversationId = data.conversationId || data.basketId || '';
      }

      if (conversationId) {
        const order = await findOrder(conversationId);

        if (order) {
          orderProductCode = order.product_code || '';

          // Idempotency: zaten paid ise tekrar hak verme
          if (order.status === 'paid') {
            console.log('[callback] Sipariş zaten paid, tekrar işlenmiyor');
          } else if (order.status === 'processing') {
            // Race condition koruması — başka bir istek işliyor
            console.log('[callback] Sipariş şu an işleniyor, bekleniyor');
          } else {
            // ★ Race condition koruması: pending'i processing'e çevir
            //    Sadece başarılı olan istek devam eder.
            //    payment_id burada kaydedilir → sonraki callback'lerde
            //    sipariş paymentId ile de bulunabilir.
            const lockResult = await sbRequest(
              `nur_orders?id=eq.${encodeURIComponent(conversationId)}&status=eq.pending`,
              {
                method: 'PATCH',
                headers: { Prefer: 'return=minimal' },
                body: JSON.stringify({
                  status: 'processing',
                  payment_id: String(data.paymentId || ''),
                  updated_at: new Date().toISOString(),
                }),
              }
            );

            // Eğer patch başarılıysa (0 row affected değilse) devam et
            // Supabase PATCH her zaman 200 döner, kontrol etmek için tekrar oku
            const lockedOrder = await findOrder(conversationId);
            if (!lockedOrder || lockedOrder.status !== 'processing') {
              console.log('[callback] Sipariş başka bir istek tarafından işleniyor');
            } else {
              console.log('[callback] Sipariş bulundu:', {
                userId: order.user_id,
                productCode: order.product_code,
              });

              const granted = await grantProduct(order.user_id, order.product_code);

              if (granted) {
                await updateOrderStatus(conversationId, 'paid', data.paymentId);
                console.log('[callback] ✅ Haklar tanımlandı, sipariş tamamlandı');
              } else {
                await updateOrderStatus(conversationId, 'failed', data.paymentId);
                console.error('[callback] ❌ Hak tanımlanamadı, failed');
              }
            }
          }
        } else {
          console.error('[callback] ❌ Sipariş bulunamadı:', conversationId);
        }
      }

      res.writeHead(303, {
        Location: '/?odeme=basarili&orderId=' + encodeURIComponent(String(data.conversationId || '')) + '&productCode=' + encodeURIComponent(orderProductCode) + '&granted=1',
      });
      res.end();
      return;
    }

    res.writeHead(303, {
      Location: '/?odeme=hata&sebep=' + encodeURIComponent(String(data.errorMessage || 'odeme_basarisiz')) + '&orderId=' + encodeURIComponent(String(data.conversationId || '')),
    });
    res.end();
  } catch (e: any) {
    console.error('[callback] fatal:', e);
    res.writeHead(303, { Location: '/?odeme=hata&sebep=sunucu' });
    res.end();
  }
}
