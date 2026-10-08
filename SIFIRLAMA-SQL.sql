-- ════════════════════════════════════════════════════════════
-- NÛR STÜDYO — TÜM ÜYELİK VE HAK SIFIRLAMA (08.10)
-- Supabase Dashboard → SQL Editor'e yapıştır ve Run'a bas.
-- Amaç: temiz test — herkes FREE olur, abonelikler kapanır,
--       denemeler silinir. Sonra PRO satın alıp kapıyı test edersin.
-- ════════════════════════════════════════════════════════════

-- 1) TÜM KULLANICILARI FREE'YE ÇEK
--    (is_admin bayrakları KORUNUR — admin hesapları etkilenmez)
UPDATE nur_users
SET tier = 'free',
    updated_at = now();

-- 2) TÜM ABONELİKLERİ KAPAT
--    (satırlar silinmez, status='cancelled' — geçmiş sorgulanabilir kalır;
--     me/google kapıları yalnız status='active' olanlara bakar)
UPDATE nur_subscriptions
SET status = 'cancelled';

-- 3) DENEMELERİ SIFIRLA
--    (nur_trials silinir → herkes tekrar 7 günlük PRO denemesi başlatabilir;
--     Google'a yeniden girdiğinde sunucu yeni deneme açar)
DELETE FROM nur_trials;

-- 4) SATIN ALINAN VİDEO HAKLARI (PAKETLER) — İSTERSEN
--    ⚠️ DİKKAT: gerçek ödenmiş paket hakları da sıfırlanır!
--    Test amaçlı tam temizlik istiyorsan aşağıdaki satırın başındaki '--' kaldır:
--
-- UPDATE nur_wallets
-- SET purchased_kisa = 0,
--     purchased_uzun = 0,
--     purchased_tam = 0,
--     updated_at = now();

-- ════════════════════════════════════════════════════════════
-- KONTROL SORGUSU — çalıştırdıktan sonra bunu da koştur,
-- herkes 'free' ve aktif abonelik 0 satır görünmeli:
--
-- SELECT email, tier, is_admin FROM nur_users ORDER BY email;
-- SELECT count(*) AS aktif_abonelik FROM nur_subscriptions WHERE status = 'active';
-- ════════════════════════════════════════════════════════════
