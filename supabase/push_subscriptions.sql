-- ════════════════════════════════════════════════════════
-- NUR_PUSH_SUBSCRIPTIONS — Öğüt Vakti push abonelikleri
-- Supabase SQL Editor'de BİR KEZ çalıştır.
-- Yazma yalnızca backend service role ile yapılır (RLS kapalı).
-- ════════════════════════════════════════════════════════

create table if not exists public.nur_push_subscriptions (
  id          bigserial primary key,
  endpoint    text not null unique,        -- tarayıcı push servisi adresi
  p256dh      text not null,               -- şifreleme anahtarı
  auth        text not null,               -- şifreleme sırrı
  tz          text default 'Europe/Istanbul',
  created_at  timestamptz not null default now()
);

create index if not exists idx_nur_push_subs_created
  on public.nur_push_subscriptions (created_at desc);

-- Dışarıya tamamen kapalı; yazma/okuma yalnızca service role.
alter table public.nur_push_subscriptions enable row level security;
revoke all on public.nur_push_subscriptions from anon, authenticated;

-- Not: ölü abonelikler (404/410 dönenler) api/push/send.ts tarafından
-- gönderim sırasında otomatik silinir — ek temizlik gerekmez.
