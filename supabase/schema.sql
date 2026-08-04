create extension if not exists pgcrypto;

create table if not exists public.nur_users (
  id text primary key,
  email text not null unique,
  name text not null,
  picture text default '',
  tier text not null default 'free' check (tier in ('free', 'pro', 'elit')),
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.nur_wallets (
  user_id text primary key references public.nur_users(id) on delete cascade,
  sub_jeton integer not null default 0 check (sub_jeton >= 0),
  purchased_jeton integer not null default 0 check (purchased_jeton >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.nur_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.nur_users(id) on delete cascade,
  tier text not null check (tier in ('pro', 'elit')),
  provider text not null default 'manual',
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  status text not null default 'active' check (status in ('active', 'cancelled', 'expired')),
  created_at timestamptz not null default now()
);

create table if not exists public.nur_orders (
  id text primary key,
  user_id text not null references public.nur_users(id) on delete cascade,
  product_code text not null,
  amount_minor integer not null check (amount_minor > 0),
  currency text not null default 'TRY',
  provider text not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'cancelled')),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.nur_ban_logs (
  id uuid primary key default gen_random_uuid(),
  user_id text references public.nur_users(id) on delete set null,
  user_email text not null,
  reason text not null,
  banned_by text not null,
  is_auto boolean not null default false,
  unbanned boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.nur_admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id text not null,
  admin_email text not null,
  action text not null,
  target text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.nur_reward_claims (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.nur_users(id) on delete cascade,
  reward_key text not null,
  amount integer not null check (amount > 0),
  claimed_at timestamptz not null default now(),
  unique (user_id, reward_key)
);

create table if not exists public.nur_announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  detail text not null default '',
  kind text not null default 'update' check (kind in ('info', 'update', 'warning')),
  active boolean not null default true,
  blinking boolean not null default true,
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null default (now() + interval '7 days'),
  created_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table if not exists public.nur_feature_locks (
  feature_id text primary key,
  lock_level text not null default 'free' check (lock_level in ('free', 'pro', 'elit', 'v2', 'v3', 'maintenance', 'off')),
  active boolean not null default true,
  updated_by text not null,
  updated_at timestamptz not null default now()
);

create or replace function public.nur_spend_wallet_tokens(p_user_id text, p_amount integer)
returns table(ok boolean, balance integer, error text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sub integer;
  v_purchased integer;
  v_need integer;
begin
  if p_amount <= 0 then
    return query select false, 0, 'INVALID_AMOUNT';
    return;
  end if;

  select sub_jeton, purchased_jeton into v_sub, v_purchased
  from public.nur_wallets where user_id = p_user_id for update;

  if not found then
    return query select false, 0, 'WALLET_NOT_FOUND';
    return;
  end if;

  if v_sub + v_purchased < p_amount then
    return query select false, v_sub + v_purchased, 'INSUFFICIENT_BALANCE';
    return;
  end if;

  v_need := p_amount;
  if v_sub >= v_need then
    v_sub := v_sub - v_need;
    v_need := 0;
  else
    v_need := v_need - v_sub;
    v_sub := 0;
  end if;

  if v_need > 0 then v_purchased := v_purchased - v_need; end if;

  update public.nur_wallets
  set sub_jeton = v_sub, purchased_jeton = v_purchased, updated_at = now()
  where user_id = p_user_id;

  return query select true, v_sub + v_purchased, null::text;
end;
$$;

create or replace function public.nur_claim_reward(p_user_id text, p_reward_key text, p_amount integer)
returns table(ok boolean, balance integer, error text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer;
begin
  if p_amount <= 0 or length(trim(p_reward_key)) < 3 then
    return query select false, 0, 'INVALID_REWARD';
    return;
  end if;

  insert into public.nur_reward_claims(user_id, reward_key, amount)
  values (p_user_id, p_reward_key, p_amount)
  on conflict (user_id, reward_key) do nothing;

  if not found then
    select sub_jeton + purchased_jeton into v_balance from public.nur_wallets where user_id = p_user_id;
    return query select false, coalesce(v_balance, 0), 'ALREADY_CLAIMED';
    return;
  end if;

  insert into public.nur_wallets(user_id, sub_jeton, purchased_jeton)
  values (p_user_id, p_amount, 0)
  on conflict (user_id) do update
  set sub_jeton = public.nur_wallets.sub_jeton + excluded.sub_jeton, updated_at = now();

  select sub_jeton + purchased_jeton into v_balance from public.nur_wallets where user_id = p_user_id;
  return query select true, v_balance, null::text;
end;
$$;

alter table public.nur_users enable row level security;
alter table public.nur_wallets enable row level security;
alter table public.nur_subscriptions enable row level security;
alter table public.nur_orders enable row level security;
alter table public.nur_ban_logs enable row level security;
alter table public.nur_admin_audit_logs enable row level security;
alter table public.nur_reward_claims enable row level security;
alter table public.nur_announcements enable row level security;
alter table public.nur_feature_locks enable row level security;

revoke all on public.nur_users from anon, authenticated;
revoke all on public.nur_wallets from anon, authenticated;
revoke all on public.nur_subscriptions from anon, authenticated;
revoke all on public.nur_orders from anon, authenticated;
revoke all on public.nur_ban_logs from anon, authenticated;
revoke all on public.nur_admin_audit_logs from anon, authenticated;
revoke all on public.nur_reward_claims from anon, authenticated;

grant select on public.nur_announcements to anon, authenticated;
grant select on public.nur_feature_locks to anon, authenticated;

drop policy if exists nur_public_read_announcements on public.nur_announcements;
create policy nur_public_read_announcements on public.nur_announcements for select
using (active = true and starts_at <= now() and ends_at >= now());

drop policy if exists nur_public_read_feature_locks on public.nur_feature_locks;
create policy nur_public_read_feature_locks on public.nur_feature_locks for select using (true);
