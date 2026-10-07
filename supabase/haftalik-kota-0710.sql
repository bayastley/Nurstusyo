-- ════════════════════════════════════════════════════════════════
-- HAFTALIK KOTA (07.10 — sahibin emrinin sunucu yarısı)
--
-- AMAÇ: İstemci/sunucu kota tutarsızlığını kapat: istemci "haftalık 21 hak"
--       (tier.ts: HAFTALIK_KAT_SAYI=7 × DAILY_QUOTA, Pazartesi yerel 00:00)
--       gösteriyor; sunucu ise GÜNLÜK kota tutuyordu — günde 3'te kapanan
--       kullanıcı haftalık hakkının gerisini üretemiyordu.
--
-- ÇÖZÜM: nur_consume_video RPC'si HAFTALIK hesap yapar:
--   • Hafta anahtarı = bu haftanın (ISO) PAZARTESİ'si (date)
--   • Hafta içindeki TÜM satırlar toplanır:
--       nur_daily_usage(usage_date >= bu_pazartesi AND < +7 gün)
--   • Geçmiş (eski "bugün" satırları) SILİNMEZ — önceki günçleri otomatik
--     kapsıyar; Pazartesi geçişi doğal olarak yeni haftanın 0'dan başlar.
--   • p_daily_quota parametresi artık HAFTALIK TOPLAM ALIR:
--       authorize.ts / wallet-consume.ts artık (günlük × 7) gönderir.
--   • Table şeması DEĞİŞMEZ; RLS yoktur (service_role-only RPC).
--   • Simetrik davranış: iade/silme işlemleri admin action'ında hayat dahil.
--
-- NOT: admin/action.ts'taki kota sıfırlama (DELETE nur_daily_usage)
--      davranışı korunur — silinen satırlar haftalık toplamdan düşer.
-- ════════════════════════════════════════════════════════════════

create or replace function public.nur_consume_video(
  p_user_id text,
  p_video_kind text,
  p_daily_quota integer
)
returns table(ok boolean, source text, quota_left integer, pack_left integer, error text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pazartesi date;
  v_haftalik_used integer;
  v_pack integer;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    return query select false, 'none'::text, 0, 0, 'UNAUTHORIZED';
    return;
  end if;

  if p_video_kind not in ('kisa', 'uzun', 'tam') then
    return query select false, 'none'::text, 0, 0, 'INVALID_KIND';
    return;
  end if;

  if p_daily_quota is null or p_daily_quota < 0 then
    return query select false, 'none'::text, 0, 0, 'INVALID_QUOTA';
    return;
  end if;

  -- ── Bu haftanın Pazartesi'si (ISO hafta-günü: 1=Pazartesi ... 7=Pazar) ──
  v_pazartesi := (current_date - ((extract(isodow from current_date))::int - 1))::date;

  -- ── Hafta satırını garanti et (Pazartesi satırı, sayacın yazılacağı yer) ──
  insert into public.nur_daily_usage (user_id, usage_date, video_kind, used_count)
  values (p_user_id, v_pazartesi, p_video_kind, 0)
  on conflict (user_id, usage_date, video_kind) do nothing;

  -- ── Pazartesi'den bu hafta sonuna kadar TÜM satırları topla (geçmiş korunur) ──
  select coalesce(sum(used_count), 0) into v_haftalik_used
  from public.nur_daily_usage
  where user_id = p_user_id
    and video_kind = p_video_kind
    and usage_date >= v_pazartesi
    and usage_date <  v_pazartesi + 7;

  -- ── Haftalık kota hâlâ boş ise harca: sayaç PAZARTESİ satırına yazılır ──
  if v_haftalik_used < p_daily_quota then
    update public.nur_daily_usage
    set used_count = used_count + 1, updated_at = now()
    where user_id = p_user_id
      and usage_date = v_pazartesi
      and video_kind = p_video_kind;

    select coalesce(remaining, 0) into v_pack
    from public.nur_video_rights
    where user_id = p_user_id and video_kind = p_video_kind;

    return query select true, 'kota'::text,
      p_daily_quota - v_haftalik_used - 1, coalesce(v_pack, 0), null::text;
    return;
  end if;

  -- ── Haftalık kota doldu → paket hakkından harca ──
  select remaining into v_pack
  from public.nur_video_rights
  where user_id = p_user_id and video_kind = p_video_kind
  for update;

  if coalesce(v_pack, 0) > 0 then
    update public.nur_video_rights
    set remaining = remaining - 1, updated_at = now()
    where user_id = p_user_id and video_kind = p_video_kind;

    return query select true, 'paket'::text, 0, v_pack - 1, null::text;
    return;
  end if;

  return query select false, 'none'::text, 0, 0, 'NO_RIGHTS_LEFT';
end;
$$;

-- ─── İzinler (önceki şema birebir korunur) ──
revoke execute on function public.nur_consume_video(text, text, integer) from public, anon, authenticated;
grant execute on function public.nur_consume_video(text, text, integer) to service_role;
