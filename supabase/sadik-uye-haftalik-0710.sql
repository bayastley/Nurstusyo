-- ════════════════════════════════════════════════════════════════
-- SADIK ÜYE +1 (07.10 — sahibin emrinin sunucu yarısı)
--
-- AMAÇ: İstemci (tier.ts) "22/22" gösteriyor: 21 haftalık + sadık üye +1.
--       Sunucu RPC'si ise 21 sayıyordu → 22. talepte 402 (tutarsızlık).
--       Artık RPC de sadık üyeye +1 kısa tanır (22. talep OK, 23. kapansın).
--
-- NASIL: Kullanıcının kayıt sırası (created_at ASC) ilk 100 içindeyse
--       sadık üyedir — RPC bunu KENDİ içinde hesaplar (manipülasyon
--       imkânsız; istemciden/sunucudan bayrak taşımak gerekmez).
--       Performans: sayaç sorgusu sadece KIND=kisa çağrılarında çalışır,
--       tek index'li count sorgusudur (nur_users PK'dan ucuz).
--
-- UYUM: Haftalık kota migration (haftalik-kota-0710.sql) üstüne yazılır.
--       Bedava sorgu: önceki SQL'i tekrar yapıştırmana gerek yok; bu dosya
--       TAM fonksiyon (haftalik + sadık) içerir, eskiyi ezere.
--
-- NOT: Sadık üye tespiti SADECE p_video_kind='kisa' için çalışır —
--       uzun/tam hakları sadık üye bonusu ALMAZ (istemciyle birebir uyum).
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
  v_sadik boolean;
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

  -- ── Sadık üye tespiti (yalnız kısa için): created_at sıralamasıyla ilk 100 ──
  v_sadik := false;
  if p_video_kind = 'kisa' then
    select exists(
      select 1
      from (
        select id
        from public.nur_users
        order by created_at asc, id asc
        limit 100
      ) ilk100
      where ilk100.id = p_user_id
    ) into v_sadik;
  end if;

  -- ── Haftalık kullanım: bu haftanın Pazartesi'sinden bugüne tüm satırlar ──
  v_pazartesi := (current_date - ((extract(isodow from current_date))::int - 1))::date;

  insert into public.nur_daily_usage (user_id, usage_date, video_kind, used_count)
  values (p_user_id, v_pazartesi, p_video_kind, 0)
  on conflict (user_id, usage_date, video_kind) do nothing;

  select coalesce(sum(used_count), 0) into v_haftalik_used
  from public.nur_daily_usage
  where user_id = p_user_id
    and video_kind = p_video_kind
    and usage_date >= v_pazartesi
    and usage_date <  v_pazartesi + 7;

  -- ── Sadık üye bonusu: kısa için haftalık kotaya +1 ──
  if v_sadik then
    p_daily_quota := p_daily_quota + 1;
  end if;

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

  -- ── Haftalık kota (sadık dahil) doldu → paket hakkından harca ──
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

-- ─── İzinler (öncekiyle birebir) ──
revoke execute on function public.nur_consume_video(text, text, integer) from public, anon, authenticated;
grant execute on function public.nur_consume_video(text, text, integer) to service_role;
