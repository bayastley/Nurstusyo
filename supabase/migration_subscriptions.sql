-- ════════════════════════════════════════════════════════
-- NUR_SUBSCRIPTIONS TABLOSU
-- Abonelik bitiş tarihlerini takip eder
-- Supabase → SQL Editor'da çalıştır
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.nur_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('pro', 'elit')),
  provider TEXT NOT NULL DEFAULT 'iyzico',
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Kullanıcı başına en son aktif aboneliği hızlıca bulmak için indeks
CREATE INDEX IF NOT EXISTS idx_nur_subscriptions_user_status
  ON public.nur_subscriptions (user_id, status, ends_at DESC);

-- RLS
ALTER TABLE public.nur_subscriptions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.nur_subscriptions FROM anon, authenticated;

-- ════════════════════════════════════════════════════════
-- MEVCUT KULLANICILAR İÇİN KAYIT OLUŞTUR
-- Zaten elit veya pro olan ama nur_subscriptions'da kaydı olmayanlar
-- ════════════════════════════════════════════════════════

INSERT INTO public.nur_subscriptions (user_id, tier, provider, starts_at, ends_at, status)
SELECT
  id,
  tier,
  'system',
  now() - INTERVAL '15 days',
  now() + INTERVAL '15 days',
  'active'
FROM public.nur_users
WHERE tier IN ('pro', 'elit')
  AND id NOT IN (
    SELECT user_id FROM public.nur_subscriptions WHERE status = 'active'
  );
