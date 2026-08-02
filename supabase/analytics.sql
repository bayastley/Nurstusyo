-- NÛR STÜDYO — Hafif, ücretsiz ziyaretçi analitiği
-- Supabase SQL Editor'de çalıştırın (schema.sql'den sonra).

create table if not exists public.nur_page_views (
  id uuid primary key default gen_random_uuid(),
  path text not null default '/',
  referrer text default '',
  user_agent text default '',
  screen text default '',
  lang text default '',
  visitor_hash text default '',
  created_at timestamptz not null default now()
);

create index if not exists idx_nur_page_views_created_at
  on public.nur_page_views (created_at desc);

create index if not exists idx_nur_page_views_path
  on public.nur_page_views (path);

-- Ziyaretçi verisi hassas değildir; yine de dışarıya kapalı tutuyoruz.
-- Yazma yalnızca backend service role ile yapılır.
alter table public.nur_page_views enable row level security;
revoke all on public.nur_page_views from anon, authenticated;

-- 90 günden eski kayıtları otomatik temizle (ücretsiz plan kotası için)
create or replace function public.nur_prune_page_views()
returns void
language plpgsql
security definer
as $$
begin
  delete from public.nur_page_views
  where created_at < now() - interval '90 days';
end;
$$;
