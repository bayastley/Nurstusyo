-- ═══════════════════════════════════════════════════════════
-- FEEDBACK ADMIN YANITI (28.09) — admin panelden cevap yazma
-- Supabase SQL Editor'de BİR KEZ çalıştır. Idempotent (IF NOT EXISTS).
-- ═══════════════════════════════════════════════════════════

alter table public.nur_feedback
  add column if not exists admin_yanit text,
  add column if not exists yanit_at timestamptz,
  add column if not exists yanit_admin text,
  add column if not exists mail_gonderildi boolean not null default false,
  add column if not exists mail_hata text;

-- Yanıtlananları hızlı bulmak için
create index if not exists idx_nur_feedback_yanit
  on public.nur_feedback (yanit_at desc nulls last);

-- Doğrulama:
-- select column_name from information_schema.columns
--   where table_name = 'nur_feedback' and column_name like '%yanit%' or column_name = 'mail_gonderildi';
