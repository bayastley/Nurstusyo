-- ════════════════════════════════════════════════════════
-- NUR_FEEDBACK — kullanıcı öneri/kalifikasyon kutusu
-- Supabase SQL Editor'de BİR KEZ çalıştır.
-- Yazma yalnızca backend service role ile yapılır (RLS kapalı).
-- ════════════════════════════════════════════════════════

create table if not exists public.nur_feedback (
  id          bigserial primary key,
  user_id     text,                 -- null olabilir (misafir de yazabilir)
  user_email  text,                 -- null olabilir
  user_name   text,
  tur         text not null default 'oneri',  -- oneri | sikayet | ozellik | diger
  puan        int,                  -- 1-5 site memnuniyeti (opsiyonel)
  mesaj       text not null,
  user_agent  text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_nur_feedback_created
  on public.nur_feedback (created_at desc);

create index if not exists idx_nur_feedback_tur
  on public.nur_feedback (tur);

-- Dışarıya tamamen kapalı; yazma yalnızca service role, okuma yalnızca admin.
alter table public.nur_feedback enable row level security;
revoke all on public.nur_feedback from anon, authenticated;

-- 90 günden eski geri bildirimleri temizle (ücretsiz plan kotası için)
create or replace function public.nur_prune_feedback()
returns void
language plpgsql
security definer
as $$
begin
  delete from public.nur_feedback
  where created_at < now() - interval '90 days';
end;
$$;
