-- ════════════════════════════════════════════════════════
-- VIDEO-REFUND-0910.SQL — Teknik hata durumunda hak iadesi
--
-- ★ NEDEN: /api/render/authorize kota+hak üretimden ÖNCE düşüyor.
--   Ses indirme / decode / canvas kaydı gibi TEKNİK bir hatada
--   kullanıcı hakkı yanıyor — iade edilmeli.
--   Kullanıcı üretimi KENDİSİ İPTAL ederse istemci iade çağrısı
--   yapmaz (userStopped) — sonuçta o doğru davranış korunur.
--
-- ÇALIŞMA PRENSİBİ:
--   • Teknik hatada istemci /api/payments/wallet-refund çağırır.
--   • Günlük kota (nur_daily_usage.used_count) geri azaltılır
--     (o gün için; haftalık dönem sayacı aynen korunur).
--   • GÜNLÜK DENGE yeterliyse koto geri yükle; yetersizse paket
--     hakkına +1 ekle (paket hakları süresiz kalır).
--   • İade geçmişi nur_refund_log'a yazılır — idempotent DEĞİLDİR
--     çünkü iade kötüye kullanılabilir; GÜNLÜK LİMİT (10/user)
--     kötüye kapanmış.
--   • Yalnızca sunucu (service_role) çağırabilir.
-- ════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ─── İade geçmişi (+ kötüye kullanım limiti) ────────────
create table if not exists public.nur_refund_log (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  video_kind text not null check (video_kind in ('kisa', 'uzun', 'tam')),
  amount integer not null check (amount > 0 and amount <= 10),
  reason text not null default 'teknik_hata',
  refunded_at timestamptz not null default now()
);

create index if not exists idx_nur_refund_log_user
  on public.nur_refund_log (user_id, refunded_at desc);

alter table public.nur_refund_log enable row level security;
revoke all on public.nur_refund_log from anon, authenticated;

-- ─── İade fonksiyonu (yalnızca sunucu çağırabilir) ───────
create or replace function public.nur_refund_video(
  p_user_id text,
  p_video_kind text,
  p_amount integer,
  p_refund_kota boolean default true
)
returns table(ok boolean, pack_left integer, quota_refunded boolean, error text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pack integer;
  v_quota_refunded boolean := false;
  v_rows integer := 0;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    return query select false, 0, false, 'UNAUTHORIZED';
    return;
  end if;

  if p_video_kind not in ('kisa', 'uzun', 'tam') or p_amount <= 0 or p_amount > 10 then
    return query select false, 0, false, 'INVALID_REQUEST';
    return;
  end if;

  -- ★ KÖTÜYE KULLANIM FRENİ: kullanıcı başına 24 saatte en fazla 10 iade
  if (select count(*) from public.nur_refund_log
      where user_id = p_user_id and refunded_at >= now() - interval '24 hours') >= 10 then
    return query select false, coalesce((
      select remaining from public.nur_video_rights
      where user_id = p_user_id and video_kind = p_video_kind), 0), false, 'REFUND_LIMIT';
    return;
  end if;

  insert into public.nur_refund_log (user_id, video_kind, amount, reason)
  values (p_user_id, p_video_kind, p_amount, 'teknik_hata');

  -- ★ KOTA İADESİ: o gün kullanımdan geri al (sayı 0'ın altına inmez)
  if p_refund_kota then
    update public.nur_daily_usage
    set used_count = greatest(used_count - p_amount, 0), updated_at = now()
    where user_id = p_user_id
      and usage_date = current_date
      and video_kind = p_video_kind
      and used_count > 0;
    get diagnostics v_rows = row_count;
    v_quota_refunded := v_rows > 0;
  end if;

  -- ★ PAKET İADESİ: kota iadesi yapılamadıysa (gün değişti/hiç kullanım yok)
  --   hakkı pakete geri ekle — süresiz hak olduğu için kayıp olmaz.
  if not v_quota_refunded then
    insert into public.nur_video_rights (user_id, video_kind, remaining)
    values (p_user_id, p_video_kind, p_amount)
    on conflict (user_id, video_kind) do update
      set remaining = public.nur_video_rights.remaining + excluded.remaining,
          updated_at = now();
  end if;

  select remaining into v_pack from public.nur_video_rights
    where user_id = p_user_id and video_kind = p_video_kind;

  return query select true, coalesce(v_pack, 0), v_quota_refunded, null::text;
end;
$$;

revoke execute on function public.nur_refund_video(text, text, integer, boolean)
  from public, anon, authenticated;
grant execute on function public.nur_refund_video(text, text, integer, boolean) to service_role;
