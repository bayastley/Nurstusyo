create table if not exists public.nur_announcement_reads (
  announcement_id uuid not null references public.nur_announcements(id) on delete cascade,
  user_id text not null references public.nur_users(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (announcement_id, user_id)
);

alter table public.nur_announcements
  add column if not exists force_open boolean not null default false,
  add column if not exists require_ack boolean not null default false;

alter table public.nur_announcement_reads enable row level security;
revoke all on public.nur_announcement_reads from anon, authenticated;
