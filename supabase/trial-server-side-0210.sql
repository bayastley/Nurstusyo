-- ════════════════════════════════════════════════════════
-- NUR_TRIALS — 7 gün PRO denemesi sunucu tarafı kaydı (02.10)
-- Supabase SQL Editor'de BİR KEZ çalıştır.
-- Sorun: deneme yalnız localStorage'daydı (nur_trial_start) —
--   anahtar silinip yeniden kurulunca deneme SONSUZ yenileniyordu.
-- Çözüm: deneme başlangıcı sunucuda saklanır; istemci yalnız
--   sunucudaki erken başlangıcı kopyalar (uzatma imkânsız).
-- Yazma yalnızca backend service role ile yapılır (RLS kapalı).
-- ════════════════════════════════════════════════════════

create table if not exists public.nur_trials (
  user_id    text primary key,
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Dışarıya tamamen kapalı; okuma/yazma yalnızca service role.
alter table public.nur_trials enable row level security;
revoke all on public.nur_trials from anon, authenticated;
