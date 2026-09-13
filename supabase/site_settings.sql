-- ════════════════════════════════════════════════════════
-- SITE_SETTINGS.SQL — Site genelinde ayarlar (bakım modu vb.)
-- Supabase SQL Editor'de BİR KEZ çalıştır.
-- ════════════════════════════════════════════════════════

create table if not exists public.nur_site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_by text,
  updated_at timestamptz not null default now()
);

alter table public.nur_site_settings enable row level security;

-- Herkes okuyabilir (bakım bilgisı tüm ziyaretçilere dağıtılır)
grant select on public.nur_site_settings to anon, authenticated;

drop policy if exists nur_public_read_site_settings on public.nur_site_settings;
create policy nur_public_read_site_settings on public.nur_site_settings
  for select using (true);

-- Yazı sadece service_role (admin API) üzerinden yapılır — ayrı grant gerekmez
