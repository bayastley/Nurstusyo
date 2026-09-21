-- ════════════════════════════════════════════════════════
-- NUR_FEATURE_LOCKS — Test kalıntısı kilit temizliği
-- Supabase SQL Editor'de çalıştır.
--
-- Denetim sonucu: 11 aktif kilit kaydının HEPSİ kod tarafındaki
-- gerçek tier'larla tutarsız ya da test kalıntısı. Temizlendiğinde:
--   • cicekler → free'e döner (ömer'in geri alma isteği)
--   • namaz / themes / sudais bakımdan çıkar
--   • reciters / full-mode (off) tekrar açılır
--   • shuraim (v2) / qasim (v3) / muhaisny (pro) kod'daki gerçek
--     tier'larına döner (shuraim=free, qasim=free, muhaisny=elit)
-- KOD tarafındaki kalıcı kilit sistemi (KATEGORI_TIER + adminCategoryAccess)
-- etkilenmez — sadece admin panel GEÇİCİ kilitleri temizlenir.
-- ════════════════════════════════════════════════════════

-- Tüm aktif geçici kilitleri kapat (kayıt geçmişi korunur, active=false)
update public.nur_feature_locks
set active = false
where active = true;

-- Kontrol: bu sorgu 0 satır döndürmeli
-- select * from nur_feature_locks where active = true;
