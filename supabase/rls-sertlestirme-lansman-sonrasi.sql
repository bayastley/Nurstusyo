-- ═══════════════════════════════════════════════════════════════════════
-- RLS SERTLEŞTİRME (LANSMAN SONRASI GÜVENLİK İŞİ) — 05.10
--
-- NEDEN: api/* fonksiyonlarının TAMAMI Supabase SERVICE_ROLE_KEY ile gidiyor
--   (RLS'i by-pass eder). Tarayıcı (anon key) tablolara DOĞRUDAN dokunmuyor —
--   tek istisna Supabase Storage (nur-uploads bucket, tablo RLS'i kapsamaz).
--   Yani public.nur_* tablolarında anon'a açık kapı SADECE savunma derinliği
--   riskidir; ama "anon key sızdı / ileride biri client'tan sorgu yazdı"
--   senaryosunda tablo düzeyinde kapı OLMALI.
--
-- NE YAPAR (idempotent — tekrar koşmak güvenli):
--   BÖLÜM 1: RLS'i henüz açık olmayan TÜM nur_* tablolarında açar
--   BÖLÜM 2: Kamuya gerekli 5 salt-okunur görünümü politikayla yeniden açar
--            (config/kapi/tablon; geri kalan HER ŞEY default-deny kalır)
--   BÖLÜM 3: anon/authenticated tablo ayrıcalıklarını ilkel haline indirir,
--            tüm nur_* fonksiyonlarının PUBLIC execute'unu kapatır
--            (istemici çağrılmayan RPC'ler anon'a kapatılır)
--   BÖLÜM 4: Doğrulama sorguları (beklenen çıktılarla)
--
-- DOKUNULMAYANLAR (değişmez):
--   - public.nur_site_settings politikası mevcut haliyle kalır (site_settings.sql)
--   - service_role'a verilmiş execute grant'leri kalır (api/* bunları kullanır)
--   - Storage (nur-uploads) politikaları bu dosyanın kapsamı DEĞİLDİR
--
-- UYGULAMA: Supabase Dashboard → SQL Editor → dosyanın tamamı → Run.
--   Tek koşuda ~1 sn; çalışırken mevcut api/* etkilenmez (service_key RLS'i atlar).
-- GERİ ALMA: bölüm 4'ün sonundaki yorum bloğuna bakın.
-- ═══════════════════════════════════════════════════════════════════════


-- ═══════════════════════════════════════════════════════════════════════
-- BÖLÜM 1 — RLS AÇMA (mevcut schema.sql + parça migration'ların eksikleri)
--
-- Bilinen RLS AÇIK olanlar (bu blok zaten-açık der, dokunmaz):
--   nur_users, nur_wallets, nur_subscriptions, nur_orders, nur_ban_logs,
--   nur_admin_audit_logs, nur_reward_claims, nur_announcements,
--   nur_feature_locks, nur_page_views, nur_announcement_reads,
--   nur_error_logs, nur_feedback, nur_marketing_consent, nur_email_campaigns,
--   nur_push_subscriptions, nur_roadmap_features, nur_roadmap_votes,
--   nur_site_settings, nur_trials, nur_daily_usage, nur_video_rights
--
-- Bilinen RLS KAPALI / AÇILMAMIŞ olanlar (bu blok açar):
--   nur_zikir_topluluk, nur_zikir_gunluk, nur_referans_kodlari,
--   nur_referans_kullanim, nur_haftanin_videolari
--   (roadmap-guncelleme-2509.sql tabloları RLS'siz bırakmıştı)
--
-- Repoda DDL'i olmayan canlı tablolar (nur_order_tokens, nur_server_errors,
-- nur_bans vb.) BÖLÜM 1b'deki joker blokla yakalanır.
-- ═══════════════════════════════════════════════════════════════════════

do $$
declare
  t text;
  hedefler text[] := array[
    'nur_users','nur_wallets','nur_subscriptions','nur_orders','nur_ban_logs',
    'nur_admin_audit_logs','nur_reward_claims','nur_announcements','nur_feature_locks',
    'nur_page_views','nur_announcement_reads','nur_error_logs','nur_feedback',
    'nur_marketing_consent','nur_email_campaigns','nur_push_subscriptions',
    'nur_zikir_topluluk','nur_zikir_gunluk','nur_zikir_arsiv','nur_referans_kodlari','nur_referans_kullanim',
    'nur_haftanin_videolari','nur_roadmap_features','nur_roadmap_votes','nur_site_settings',
    'nur_trials','nur_daily_usage','nur_video_rights'
  ];
begin
  foreach t in array hedefler loop
    if exists (select 1 from pg_tables where schemaname = 'public' and tablename = t) then
      if not (select rowsecurity from pg_tables where schemaname = 'public' and tablename = t) then
        execute format('alter table public.%I enable row level security', t);
        raise notice 'RLS ACILDI: %', t;
      else
        raise notice 'RLS zaten acik: %', t;
      end if;
    else        raise notice 'atlandi (tablosu yok): %', t;
    end if;
  end loop;
end $$;

-- BÖLÜM 1b — JOKER GÜVENLİK AĞI: public şemasında adı nur_ ile başlayıp
-- hâlâ RLS'siz kalan HER tabloyu kapat (repoda DDL'i olmayan canlı tablolar
-- — örn. nur_order_tokens, nur_server_errors, nur_bans — burada yakalanır).
do $$
declare
  t text;
begin
  for t in
    select tablename from pg_tables
    where schemaname = 'public' and tablename like 'nur%' and rowsecurity = false
  loop
    execute format('alter table public.%I enable row level security', t);
    raise notice 'RLS ACILDI (joker): %', t;
  end loop;
end $$;


-- ═══════════════════════════════════════════════════════════════════════
-- BÖLÜM 2 — KAMUYA GEREKLİ 5 SALT-OKUNUR GÖRÜNÜM (bilinçli açık kapılar)
--
-- /api/config bu 4 tabloyu SERVICE_KEY ile okur; anon grant'ler yalnız
-- "anon key ile doğrudan okuma" senaryosu içindir (ileriye dönük esneklik).
-- Yazı (insert/update/delete) anon'a HER TABLODA kapalı kalır.
-- ═══════════════════════════════════════════════════════════════════════

-- 2a) Duyurular — yalnız aktif + zaman penceresindeki satırlar
drop policy if exists nur_public_read_announcements on public.nur_announcements;
create policy nur_public_read_announcements on public.nur_announcements for select
using (active = true and starts_at <= now() and ends_at >= now());

-- 2b) Özellik kilitleri — tam okuma (kilidin kendisi gizli değil)
drop policy if exists nur_public_read_feature_locks on public.nur_feature_locks;
create policy nur_public_read_feature_locks on public.nur_feature_locks for select using (true);

-- 2c) Roadmap kalem listesi — yalnız AKTİF kalemler (taslaklar gizli)
drop policy if exists nur_public_read_roadmap_features on public.nur_roadmap_features;
create policy nur_public_read_roadmap_features on public.nur_roadmap_features for select
using (active = true);

-- 2d) Roadmap oyları — salt-okunur toplam (kim oyu verdi bilgi sütunu yok;
--     /api/roadmap service key ile sayar, anon okuma yalnız sayaç senaryosu içindir)
drop policy if exists nur_public_read_roadmap_votes on public.nur_roadmap_votes;
create policy nur_public_read_roadmap_votes on public.nur_roadmap_votes for select using (true);

-- NOT: nur_site_settings politikası site_settings.sql'de zaten mevcut
-- (nur_public_read_site_settings) — burada DOKUNULMAZ (değişmez).


-- ═══════════════════════════════════════════════════════════════════════
-- BÖLÜM 3 — AYRICALIK ARITMASI
--
-- 3a) Tüm nur_* tablolarında anon/authenticated ayrıcalıklarını sıfırla
--     (bölüm 2'nin yeniden grant'leri sonradan gelir).
-- 3b) PUBLIC/anon/authenticated'dan tüm nur_* fonksiyon execute'unu al
--     (istemci hiçbir RPC çağırmıyor; hepsi service_role üzerinden).
--     service_role grant'leri korunur.
-- ═══════════════════════════════════════════════════════════════════════

-- 3a) Tablo ayrıcalıkları
do $$
declare
  t text;
begin
  for t in
    select tablename from pg_tables
    where schemaname = 'public' and tablename like 'nur%'
  loop
    execute format('revoke all on public.%I from anon, authenticated', t);
  end loop;
  raise notice 'tablo ayricaliklari arindi (anon/authenticated)';
end $$;

-- 3b) Fonksiyon execute ayrıcalıkları
do $$
declare
  r record;
begin
  for r in
    select p.oid::regprocedure as fonk
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname like 'nur_%'
  loop
    execute format('revoke execute on function %s from public, anon, authenticated', r.fonk);
    raise notice 'execute kapandi: %', r.fonk;
  end loop;
end $$;

-- Beklenen kapananlar (canlıdaki mevcut hal):
--   nur_claim_reward(text,text,integer) · nur_claim_video_reward(text,text,text,integer)
--   nur_consume_video(text,text,integer) · nur_grant_video_rights(text,text,integer)
--   nur_hafta_video_begen(uuid,text) · nur_hafta_video_ekle(text,text,text,text,text,text)
--   nur_referans_kod_al(text) · nur_referans_kullan(text,text)
--   nur_zikir_ekle(integer) · nur_zikir_gun_arsivle(date)
--   nur_spend_wallet_tokens(text,integer) · nur_prune_*(cron yardımcıları)

-- 3c) Kamuya gerekli 5 salt-okunur grant'i geri ver (politika + grant birlikte çalışır)
grant select on public.nur_announcements    to anon, authenticated;
grant select on public.nur_feature_locks    to anon, authenticated;
grant select on public.nur_roadmap_features to anon, authenticated;
grant select on public.nur_roadmap_votes    to anon, authenticated;
grant select on public.nur_site_settings    to anon, authenticated;


-- ═══════════════════════════════════════════════════════════════════════
-- BÖLÜM 4 — DOĞRULAMA (uygulama sonrası SQL Editor'de koştur)
-- ═══════════════════════════════════════════════════════════════════════

-- 4.1) RLS'siz kalan nur_ tablosu OLMAMALI → beklenen: 0 satır
select tablename as rls_siz_kalan
from pg_tables
where schemaname = 'public' and tablename like 'nur%' and rowsecurity = false;

-- 4.2) anon/authenticated'ın görebildiği tek şey 5 salt-okunur tablo OLMALI
--      (privilege_type sütunu yalnız SELECT içermeli)
select table_name, privilege_type
from information_schema.table_privileges
where grantee in ('anon','authenticated')
  and table_schema = 'public' and table_name like 'nur%'
order by table_name, privilege_type;

-- 4.3) anon/authenticated/PUBLIC'in execute edebildiği fonksiyon OLMAMALI
--      → beklenen: 0 satır
select routine_name, grantee
from information_schema.routine_privileges
where routine_schema = 'public'
  and routine_name like 'nur_%'
  and grantee in ('anon','authenticated','PUBLIC');

-- 4.4) Smoke: config kaynakları policy sonrası da akıyor mu?
--      (api/config SERVICE KEY ile okur; buradaki anon kontrolü yalnız politika teyidi)
select count(*) as duyuru_mevcut from public.nur_announcements
where active = true and starts_at <= now() and ends_at >= now();
select count(*) as kilit_sayisi from public.nur_feature_locks where active = true;
select count(*) as aktif_roadmap_kalemi from public.nur_roadmap_features where active = true;

-- ─────────────────────────────────────────────────────────────────────
-- GERİ ALMA (acil durum — gerekirse SQL Editor'de koştur):
--
--   revoke select on public.nur_roadmap_features from anon, authenticated;
--   revoke select on public.nur_roadmap_votes    from anon, authenticated;
--   drop policy if exists nur_public_read_roadmap_features on public.nur_roadmap_features;
--   drop policy if exists nur_public_read_roadmap_votes    on public.nur_roadmap_votes;
--
--   (RLS'i toplu geri açmak istenirse — ÖNERİLMEZ:)
--   do $$ declare t text; begin
--     for t in select tablename from pg_tables where schemaname='public' and tablename like 'nur%'
--     loop execute format('alter table public.%I disable row level security', t); end loop;
--   end $$;
-- ─────────────────────────────────────────────────────────────────────
