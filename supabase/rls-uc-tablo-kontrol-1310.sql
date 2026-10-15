-- ═══════════════════════════════════════════════════════════════
-- RLS KONTROL + DÜZELTME — 13.10.2026 (tarama v2, bulgu [4])
-- 3 tablo: nur_order_tokens (ödeme token ↔ sipariş), nur_marketing_consent,
--          nur_email_campaigns
-- Supabase SQL Editor'de sırayla çalıştır.
-- ═══════════════════════════════════════════════════════════════

-- ── ADIM 1: DURUM KONTROLÜ (önce bunu çalıştır, sonucu not et) ──
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('nur_order_tokens','nur_marketing_consent','nur_email_campaigns');

-- Beklenen çıktı: HA artık satırda rowsecurity = true.
-- Herhangi biri false ise ADIM 2'yi (aşağıdaki bloğu) çalıştır.
-- Tablo hiç listede yoksa ADIM 3'e bak (tablo canlıda yok demektir).

-- ═══════════════════════════════════════════════════════════════
-- ADIM 2: DÜZELTME — rowsecurity=false çıkan tablolar için BÜTÜN bloğu çalıştır.
-- (true çıkanlara dokunmaz — idempotent, tekrar tekrar çalıştırılabilir.)
-- ═══════════════════════════════════════════════════════════════

-- 2a) nur_order_tokens — ödeme hilesi kapısı (token → order_id eşlemesi)
alter table public.nur_order_tokens enable row level security;
revoke all on public.nur_order_tokens from anon, authenticated;

-- 2b) nur_marketing_consent — KVKK pazarlama izinleri
alter table public.nur_marketing_consent enable row level security;
revoke all on public.nur_marketing_consent from anon, authenticated;

-- 2c) nur_email_campaigns — e-posta kampanya verileri
alter table public.nur_email_campaigns enable row level security;
revoke all on public.nur_email_campaigns from anon, authenticated;

-- Not: Zaten mevcut politika/DENY politikası varsa yukarıdakiler onu BOZMAZ;
-- sadece anon/authenticated'a kapıyı kapatır. Sunucu (service_role) etkilenmez —
-- Vercel API'ları service anahtarıyla bağlanır ve RLS'yi bypass eder. Site kırılmaz.

-- ═══════════════════════════════════════════════════════════════
-- ADIM 3: DOĞRULAMA — düzeltmenin sonra tekrar ADIM 1'i çalıştır,
-- tüm satırlar rowsecurity = true görünmeli.
-- Ek: tüm nur% tablolarını tarayıp RLS'siz kalan var mı diye de kontrol:
-- ═══════════════════════════════════════════════════════════════

SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'nur%'
  AND rowsecurity = false;

-- Bu son sorgu 0 satır döndürmeli. Satır döndürürse çıktıyı Buffy'ye yaz.
