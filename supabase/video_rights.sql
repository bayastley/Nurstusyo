-- ════════════════════════════════════════════════════════
-- VIDEO_RIGHTS.SQL — Yeni iş modeli tabloları
--
-- ★ İYZİCO UYUMU:
--   nur_wallets (bakiye/cüzdan) tablosu ARTIK KULLANILMAZ.
--   Yerine iki tablo gelir:
--     1) nur_daily_usage  → günlük üyelik kotası kullanımı
--     2) nur_video_rights → satın alınan paket hizmet adedi
--   Hiçbir tabloda para birimi veya bakiye tutulmaz.
-- ════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ─── Günlük kullanım (her gün sıfırlanır) ────────────────
create table if not exists public.nur_daily_usage (
  user_id text not null references public.nur_users(id) on delete cascade,
  usage_date date not null default current_date,
  video_kind text not null check (video_kind in ('kisa', 'uzun', 'tam')),
  used_count integer not null default 0 check (used_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, usage_date, video_kind)
);

create index if not exists idx_nur_daily_usage_date
  on public.nur_daily_usage (usage_date desc);

-- ─── Satın alınan paket hakları (süresi dolmaz) ──────────
create table if not exists public.nur_video_rights (
  user_id text not null references public.nur_users(id) on delete cascade,
  video_kind text not null check (video_kind in ('kisa', 'uzun', 'tam')),
  remaining integer not null default 0 check (remaining >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, video_kind)
);

-- ─── Paket tanımlama (ödeme onayından sonra çağrılır) ────
create or replace function public.nur_grant_video_rights(
  p_user_id text,
  p_video_kind text,
  p_amount integer
)
returns table(ok boolean, remaining integer, error text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_remaining integer;
begin
  if p_amount <= 0 then
    return query select false, 0, 'INVALID_AMOUNT';
    return;
  end if;

  if p_video_kind not in ('kisa', 'uzun', 'tam') then
    return query select false, 0, 'INVALID_KIND';
    return;
  end if;

  insert into public.nur_video_rights (user_id, video_kind, remaining)
  values (p_user_id, p_video_kind, p_amount)
  on conflict (user_id, video_kind) do update
  set remaining = public.nur_video_rights.remaining + excluded.remaining,
      updated_at = now();

  select remaining into v_remaining
  from public.nur_video_rights
  where user_id = p_user_id and video_kind = p_video_kind;

  return query select true, v_remaining, null::text;
end;
$$;

-- ─── Video üretimi harca: önce günlük kota, sonra paket ──
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
  v_used integer;
  v_pack integer;
begin
  if p_video_kind not in ('kisa', 'uzun', 'tam') then
    return query select false, 'none'::text, 0, 0, 'INVALID_KIND';
    return;
  end if;

  -- Günlük satırı garanti et
  insert into public.nur_daily_usage (user_id, usage_date, video_kind, used_count)
  values (p_user_id, current_date, p_video_kind, 0)
  on conflict (user_id, usage_date, video_kind) do nothing;

  select used_count into v_used
  from public.nur_daily_usage
  where user_id = p_user_id and usage_date = current_date and video_kind = p_video_kind
  for update;

  -- 1) Günlük üyelik kotasından düş
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

-- ─── Güvenlik ────────────────────────────────────────────
alter table public.nur_daily_usage enable row level security;
alter table public.nur_video_rights enable row level security;

revoke all on public.nur_daily_usage from anon, authenticated;
revoke all on public.nur_video_rights from anon, authenticated;

-- ─── Eski cüzdan yapısını devre dışı bırak ───────────────
-- nur_wallets tablosu artık okunmaz. Veri kaybı olmaması için
-- silinmez, yalnızca erişimi kapatılır.
revoke all on public.nur_wallets from anon, authenticated;
