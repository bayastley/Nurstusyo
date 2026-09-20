-- ════════════════════════════════════════════════════════
-- NUR_ERROR_LOGS v2 — hata türü (kind) + kullanıcı e-postası
-- Supabase SQL Editor'de çalıştır. Tekrar çalıştırmak zarar vermez.
-- ★ Yeni kolonlar:
--   kind       → video | payment | auth | upload | audio | network | genel
--   user_email → hatayı yaşayan kullanıcının e-postası (misafirde boş)
-- Böylece admin panelde "video üretim hatası — ahmet@gmail.com" gibi
-- okunur satırlar görünür.
-- ════════════════════════════════════════════════════════

alter table public.nur_error_logs add column if not exists kind text;
alter table public.nur_error_logs add column if not exists user_email text;

-- Mevcut kayıtlara varsayılan tür ver
update public.nur_error_logs set kind = 'genel' where kind is null;

create index if not exists idx_nur_error_logs_kind on public.nur_error_logs (kind);
create index if not exists idx_nur_error_logs_user on public.nur_error_logs (user_email);
