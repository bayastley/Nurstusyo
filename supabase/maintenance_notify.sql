-- ════════════════════════════════════════════════════════
-- NUR_PUSH_SUBSCRIPTIONS — Bakım bitiş bildirimi kolonu
-- Supabase SQL Editor'de BİR KEZ çalıştır.
-- notify_maintenance = true olan aboneler, bakım bitince
-- "Site yeniden açıldı" push bildirimi alır.
-- ════════════════════════════════════════════════════════

alter table public.nur_push_subscriptions
  add column if not exists notify_maintenance boolean not null default false;

create index if not exists idx_nur_push_subs_maintenance
  on public.nur_push_subscriptions (notify_maintenance)
  where notify_maintenance = true;
