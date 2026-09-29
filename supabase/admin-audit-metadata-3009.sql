-- ═══════════════════════════════════════════════════════════════
-- ADMIN ÇİFT KATMAN GÜVENLİK — DENETİM GÜÇLENDİRME (30.09)
-- Supabase SQL Editor'de koştur (yapıştır → Run, ~10 sn).
-- Idempotent: tekrar koşturmak zararsız.
--
-- 1) nur_admin_audit_logs tablosuna metadata jsonb kolonu ekler.
--    api/admin/action.ts zaten metadata gönderiyordu ama kolon olmadığı için
--    PostgREST o kayıtları SESSİZCE REDDEDİYORDU — denetim izi kayboluyordu.
-- 2) Denetim tablosuna okuma indeksi.
-- ═══════════════════════════════════════════════════════════════

-- 1) metadata kolonu (yoksa ekle)
alter table public.nur_admin_audit_logs
  add column if not exists metadata jsonb default '{}'::jsonb;

-- 2) admin_email boş olabilen deny kayıtları için: not null bozmadan
--    esneklik — mevcut şema admin_email not null olduğundan deny kaydında
--    '' gönderiyoruz (kod tarafında garanti); burada sadece kolon düzeni:
comment on column public.nur_admin_audit_logs.metadata is 'IP + User-Agent + ek bağlam (admin_session_ok/deny kayıtları dahil)';

-- 3) sorgu indeksi (son kayıtları hızlı listele)
create index if not exists nur_admin_audit_logs_created_idx
  on public.nur_admin_audit_logs (created_at desc);

-- 4) RLS durumu korunsun (zaten schema.sql'de enable + anon/authenticated'e kapalı)
alter table public.nur_admin_audit_logs enable row level security;
revoke all on public.nur_admin_audit_logs from anon, authenticated;
