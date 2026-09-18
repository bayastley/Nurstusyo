-- ════════════════════════════════════════════════════════
-- NUR_MARKETING — e-posta pazarlama rızası + kampanya kayıtları
-- Supabase SQL Editor'de BİR KEZ çalıştır.
-- KVKK: yalnızca açıkça onay verenlere (consented=true) mail gider.
-- ════════════════════════════════════════════════════════

create table if not exists public.nur_marketing_consent (
  user_id      text primary key,
  email        text not null,
  consented    boolean not null default false,
  consented_at timestamptz,
  revoked_at   timestamptz,
  source       text not null default 'app',
  updated_at   timestamptz not null default now()
);

create index if not exists idx_nur_marketing_consent_consented
  on public.nur_marketing_consent (consented) where consented = true;

create table if not exists public.nur_email_campaigns (
  id         bigserial primary key,
  subject    text not null,
  sent_count int not null default 0,
  sent_by    text not null,
  created_at timestamptz not null default now()
);

-- Dışarıya tamamen kapalı; yazma/okuma yalnızca service role.
alter table public.nur_marketing_consent enable row level security;
alter table public.nur_email_campaigns enable row level security;
revoke all on public.nur_marketing_consent from anon, authenticated;
revoke all on public.nur_email_campaigns from anon, authenticated;
