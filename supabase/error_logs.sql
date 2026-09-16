-- ════════════════════════════════════════════════════════
-- NUR_ERROR_LOGS — frontend hata kayıtları
-- Supabase SQL Editor'de BİR KEZ çalıştır.
-- Yazma yalnızca backend service role ile yapılır (RLS kapalı).
-- ════════════════════════════════════════════════════════

create table if not exists public.nur_error_logs (
  id          bigserial primary key,
  message     text not null,
  stack       text,
  path        text,
  source      text,          -- window | boundary | unhandledrejection
  user_agent  text,
  fingerprint text,          -- aynı hatayı gruplamak için kısa hash
  created_at  timestamptz not null default now()
);

create index if not exists idx_nur_error_logs_created
  on public.nur_error_logs (created_at desc);

create index if not exists idx_nur_error_logs_fingerprint
  on public.nur_error_logs (fingerprint);

-- Dışarıya tamamen kapalı; yazma yalnızca service role.
alter table public.nur_error_logs enable row level security;
revoke all on public.nur_error_logs from anon, authenticated;

-- 30 günden eski hata kayıtlarını temizle (ücretsiz plan kotası için)
create or replace function public.nur_prune_error_logs()
returns void
language plpgsql
security definer
as $$
begin
  delete from public.nur_error_logs
  where created_at < now() - interval '30 days';
end;
$$;
