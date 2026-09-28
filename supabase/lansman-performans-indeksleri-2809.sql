-- ═══════════════════════════════════════════════════════════
-- LANSMAN PERFORMANS ENDEKSLERİ (28.09) — 1 Ekim lansmanı öncesi
-- SIRALAMA ÖNEMLİ DEĞİL; HEPSİ IF NOT EXISTS → güvenle tekrar koşulabilir.
-- Supabase Dashboard → SQL Editor → yapıştır → Run.
-- ═══════════════════════════════════════════════════════════

-- 1) ROADMAP: GET'te oy toplamları tablo taramasıydı → indeksli aggregate
--    (kullanıcı arttıkça satır artar; lansmanda en ağır okuma)
CREATE INDEX IF NOT EXISTS idx_roadmap_votes_feature ON nur_roadmap_votes (feature_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_votes_user ON nur_roadmap_votes (user_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_features_active ON nur_roadmap_features (active, version);

-- 2) CONFIG (en sıcak endpoint — her sekme 60-90sn'de poll eder):
--    duyuru pencere sorgusu + aktif kilitler
CREATE INDEX IF NOT EXISTS idx_announcements_window
  ON nur_announcements (active, starts_at, ends_at, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_feature_locks_active ON nur_feature_locks (active);

-- 3) AUTH/OTURUM: her oturumlu istek kullanıcı + üyelik okur
CREATE INDEX IF NOT EXISTS idx_users_email ON nur_users (lower(email));
CREATE INDEX IF NOT EXISTS idx_subs_user_ends ON nur_subscriptions (user_id, ends_at DESC);

-- 4) ANALİTİK/OLAY YAZILARI: lansmanda nur_page_views patlar
--    (BRIN zaman indeksi — boyut küçük, yazımı yavaşlatmaz)
CREATE INDEX IF NOT EXISTS idx_page_views_created_brin ON nur_page_views USING brin (created_at);
CREATE INDEX IF NOT EXISTS idx_error_logs_created ON nur_error_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_fp ON nur_error_logs (fingerprint);

-- 5) ZİKİR TOPLULUK SAYACI: tek satır, PK yeterli — ek indeks gerekmez.

-- 6) BAN KONTROLÜ: her oturumlu istek ban sorgusu yapar
CREATE INDEX IF NOT EXISTS idx_ban_logs_user ON nur_ban_logs (user_id, unbanned);
CREATE INDEX IF NOT EXISTS idx_ban_logs_email ON nur_ban_logs (lower(user_email), unbanned);

-- 7) PUSH: abonelik uçları upsert/lookup'ta endpoint'e bakar
CREATE INDEX IF NOT EXISTS idx_push_subs_endpoint ON nur_push_subscriptions (endpoint);

-- 8) ÖDEME/CÜZDAN: sipariş ve harcama sorguları
CREATE INDEX IF NOT EXISTS idx_orders_user ON nur_orders (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_user ON nur_wallets (user_id);
CREATE INDEX IF NOT EXISTS idx_video_rights_user ON nur_video_rights (user_id, video_kind);

-- ═══════════════════════════════════════════════════════════
-- DOĞRULAMA (koşttuktan sonra çalıştır, çıktıyı kaydet):
--   SELECT tablename, indexname FROM pg_indexes
--   WHERE tablename LIKE 'nur_%' ORDER BY tablename, indexname;
-- Not: Supabase Free katmanı pause riski taşır — lansman haftasında
-- Pro'ya geçiş + Settings → General → "Pause Protection" kontrolü
-- lansman-runbook.md'de anlatılır.
-- ═══════════════════════════════════════════════════════════
