-- ════════════════════════════════════════════════════════
-- LANSMAN DENEMESI (25.10 — SAHİBİN EMRİ)
--   "herşeyi 5 üretim hakkı yap — lansman deneme sürümü gibi düşün;
--    5 hak yaptıkça düşer, bitince eski PRO/ELİT kilitler geri gelir"
--
--   • Yeni tablo: nur_deneme_hakki (user_id PK, remaining int)
--   • Her kullanıcı İLK OKUMA/İLK ÜRETİMDE otomatik 5 hak alır (auto-grant).
--   • Tek ORTAK sayaç: kisa/uzun/tam türü ne olursa olsun aynı 5'ten düşer.
--   • nur_consume_video güncellendi: 1) deneme → 2) günlük kota → 3) paket
--   • Admin bu tabloya DOKUNMAZ (admin üretimleri zaten authorize'da bypass).
--   • RLS: istemciler tabloyu okuyamaz/yazamaz — sadece service_role RPC'leri.
-- ════════════════════════════════════════════════════════

create table if not exists public.nur_deneme_hakki (
  user_id     text        primary key,
  remaining   integer     not null default 5,
  granted_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.nur_deneme_hakki enable row level security;
-- Politikalar koymuyoruz: RLS açık + policy YOK = istemci erişimi tamamen kapalı.
-- service_role, security definer RPC'ler üzerinden yazar (istemci akışını bypass edemez).

-- ─── Kalan deneme hakkını oku (ilk okumada 5 ver) ────────
create or replace function public.nur_deneme_kalan(p_user_id text)
returns table(remaining integer)
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    return query select 0;
    return;
  end if;
  insert into public.nur_deneme_hakki (user_id, remaining)
  values (p_user_id, 5)
  on conflict (user_id) do nothing;
  return query select n.remaining from public.nur_deneme_hakki n where n.user_id = p_user_id;
end;
$$;
revoke execute on function public.nur_deneme_kalan(text) from public, anon, authenticated;
grant execute on function public.nur_deneme_kalan(text) to service_role;

-- ─── Video harca: ÖNCE deneme, sonra kota, sonra paket ───
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
  v_deneme integer;
  v_used integer;
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

  -- 0) LANSMAN DENEMESİ — toplam 5 ortak hak, tür fark etmez.
  --    Kayıt yoksa ilk üretimde 5 ver; bitince (<1) diğer kaynaklar devreye girer.
  insert into public.nur_deneme_hakki (user_id, remaining)
  values (p_user_id, 5)
  on conflict (user_id) do nothing;

  select remaining into v_deneme
  from public.nur_deneme_hakki
  where user_id = p_user_id
  for update;

  if v_deneme > 0 then
    update public.nur_deneme_hakki
    set remaining = remaining - 1, updated_at = now()
    where user_id = p_user_id;

    -- pack_left = kalan deneme hakkı (istemci rozeti bunu okur)
    return query select true, 'deneme'::text, 0, v_deneme - 1, null::text;
    return;
  end if;

  -- 1) Günlük üyelik kotasından düş
  insert into public.nur_daily_usage (user_id, usage_date, video_kind, used_count)
  values (p_user_id, current_date, p_video_kind, 0)
  on conflict (user_id, usage_date, video_kind) do nothing;

  select used_count into v_used
  from public.nur_daily_usage
  where user_id = p_user_id and usage_date = current_date and video_kind = p_video_kind
  for update;

  if v_used < p_daily_quota then
    update public.nur_daily_usage
    set used_count = used_count + 1, updated_at = now()
    where user_id = p_user_id and usage_date = current_date and video_kind = p_video_kind;

    select coalesce(remaining, 0) into v_pack
    from public.nur_video_rights
    where user_id = p_user_id and video_kind = p_video_kind;

    return query select true, 'kota'::text, p_daily_quota - v_used - 1, coalesce(v_pack, 0), null::text;
    return;
  end if;

  -- 2) Paket hakkından düş
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
revoke execute on function public.nur_consume_video(text, text, integer) from public, anon, authenticated;
grant execute on function public.nur_consume_video(text, text, integer) to service_role;
