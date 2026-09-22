-- ════════════════════════════════════════════════════════
-- NUR_BAN_LOGS — user_id BACKFILL
-- Supabase SQL Editor'de BİR KEZ çalıştır. Tekrar çalıştırmak zarar vermez.
--
-- ARKA PLAN:
--   /api/admin/action (ban_user) eskiden ban kaydına yalnızca user_email
--   yazıyordu; user_id kolonu boş (null) kalıyordu. Ancak /api/video/sign
--   ban kontrolünü user_id ile yapar — bu yüzden banlanan kullanıcı
--   imzalı videoları kullanmaya DEVAM EDEBİLİYORDU.
--   (fd080c0 commitinde düzeltildi: artık yeni banlar user_id ile yazılıyor.)
--
--   Bu script ESKİ kayıtları onarır: user_email üzerinden nur_users
--   tablosundan gerçek user_id bulunur, boş olan kayıtlara yazılır.
--
-- GÜVENLİK:
--   • Sadece user_id IS NULL olan kayıtlara dokunur — mevcut dolu kayıtlar
--     asla ezilmez.
--   • E-posta nur_users tablosunda bulunamazsa (hesap silinmiş vb.) o kayıt
--     atlanır ve raporda 'eşleşmeyen' sayılır.
--   • idempotent: iki kez çalıştırmak ikinci seferde 0 satır günceller.
-- ════════════════════════════════════════════════════════

-- 1) user_id'si boş olan ban kayıtlarını e-posta üzerinden users tablosuyla eşleştir
update public.nur_ban_logs b
set user_id = u.id
from public.nur_users u
where b.user_id is null
  and lower(b.user_email) = lower(u.email);

-- 2) Rapor: kaç kayıt onarıldı, kaç kayıt hâlâ user_id'siz (eşleşmeyen e-posta)
select
  (select count(*) from public.nur_ban_logs where user_id is not null) as dolu_kayit,
  (select count(*) from public.nur_ban_logs where user_id is null)  as eslesmeyen_kayit,
  (select coalesce(string_agg(distinct user_email, ', '), '—')
     from public.nur_ban_logs where user_id is null)                as eslesmeyen_emailler;
