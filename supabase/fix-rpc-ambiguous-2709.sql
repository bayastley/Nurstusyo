-- ════════════════════════════════════════════════════════
-- ★ RPC DÜZELTMESİ — 27 Eylül 2026 (Buffy E2E testinde yakalandı)
--
-- SORUN: nur_zikir_ekle ve nur_hafta_video_begen fonksiyonları
--   RETURNS TABLE(toplam/begeni ...) kullanıyor. PL/pgSQL'de bu
--   isimler OUT değişkeni olur; fonksiyon içinde aynı isimli
--   tablo kolonuna nitelenmeden erişilince Postgres karar veremez:
--   "column reference is ambiguous" (42702) → RPC 500 döner.
--
-- ETKİ (canlıda tespit edildiği haliyle):
--   • nur_zikir_ekle HATA → zikir API'si yavaş "oku-artır-yaz"
--     fallback'ine düşüyor (çalışıyor ama yarış koşullu; iki eşzamanlı
--     istek birbirinin artırımını silebilir).
--   • nur_hafta_video_begen HATA → beğeni butonu HER ZAMAN
--     "Begeni kaydedilemedi (500)" verir; fallback'i YOK.
--
-- ÇÖZÜM: Tablo kolonları tablo takma adıyla NİTELENDİ (z.toplam,
--   v.begeni ...). Dönüş kolon adları AYNI bırakıldı — API'ler
--   (api/zikir/topluluk.ts, api/hafta/video.ts) hiç değişmeden çalışır.
--
-- ÇALIŞTIRMA: Supabase SQL Editor → yapıştır → Run.
--   create or replace olduğundan TEKRAR çalıştırmak zarar vermez.
--   Yetkiler yeniden tanımlanır (service_role dışına kapalı kalır).
-- ════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- 1) ZİKİR TOPLULUK — atomik artırım (düzeltme)
-- ─────────────────────────────────────────────
create or replace function public.nur_zikir_ekle(p_adet integer)
returns table(toplam bigint)
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    return query select bigint '0';
    return;
  end if;
  if p_adet < 1 or p_adet > 500 then
    return query select z.toplam from public.nur_zikir_topluluk z where z.id = 'genel';
    return;
  end if;
  update public.nur_zikir_topluluk as z
    set toplam = z.toplam + p_adet,
        updated_at = now()
    where z.id = 'genel';
  return query select z.toplam from public.nur_zikir_topluluk z where z.id = 'genel';
end;
$$;
revoke execute on function public.nur_zikir_ekle(integer) from public, anon, authenticated;
grant execute on function public.nur_zikir_ekle(integer) to service_role;

-- ─────────────────────────────────────────────
-- 2) HAFTANIN VİDEOSU — beğeni toggle (düzeltme)
-- ─────────────────────────────────────────────
create or replace function public.nur_hafta_video_begen(p_video_id uuid, p_user_id text)
returns table(ok boolean, begeni integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_var boolean;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    return query select false, 0;
    return;
  end if;
  select (p_user_id = any(v.begenenler)) into v_var
    from public.nur_haftanin_videolari v where v.id = p_video_id;
  if v_var then
    -- toggle: beğeniyi kaldır
    update public.nur_haftanin_videolari as v
      set begenenler = array_remove(v.begenenler, p_user_id),
          begeni = greatest(0, v.begeni - 1)
      where v.id = p_video_id;
  else
    update public.nur_haftanin_videolari as v
      set begenenler = v.begenenler || p_user_id,
          begeni = v.begeni + 1
      where v.id = p_video_id;
  end if;
  return query select true, h.begeni from public.nur_haftanin_videolari h where h.id = p_video_id;
end;
$$;
revoke execute on function public.nur_hafta_video_begen(uuid, text) from public, anon, authenticated;
grant execute on function public.nur_hafta_video_begen(uuid, text) to service_role;

-- ════════════════════════════════════════════════════════
-- DOĞRULAMA (opsiyonel — SQL Editor'de ayrı çalıştır):
--   select public.nur_zikir_ekle(1);          -- hata vermemeli, toplam dönmeli
--   (begeni testi canlıda gerçek video id'siyle API üzerinden yapılır)
-- ════════════════════════════════════════════════════════
