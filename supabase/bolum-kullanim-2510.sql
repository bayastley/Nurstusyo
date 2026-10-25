-- ════════════════════════════════════════════════════════
-- BÖLÜM KULLANIM İSTATİSTİĞİ (25.10 — SAHİBİN EMRİ)
--   "bütün kullanıcıları test eden — en çok hangi bölüm kullanılıyor,
--    yüzde, haftalık güncellensin; HER HAFta tarih sırasına KAYIT olarak
--    saklansın (en az 50 hafta), admin listede tarihi seçtikçe bakabilsin"
--
--   • Tablo: nur_usage_stats (week_start, section) → otomatik haftalik kayıt.
--   • Hafta senırı = PAZARTESİ (ISO week).
--   • İstemci /api/customer/usage → nur_usage_hit RPC (service_role).
--   • Admin /api/admin/usage → son 50 haftanın satırlarını okur.
--   • Misafir dahil herkese sayılır (kullanıcı kimliği tutulMAZ — yalnız
--     section + hafta + sayaç; GDPR-dostu toplama istatistik).
-- ════════════════════════════════════════════════════════

create table if not exists public.nur_usage_stats (
  week_start date         not null,
  section    text         not null,
  hits       bigint       not null default 0,
  updated_at timestamptz  not null default now(),
  primary key (week_start, section)
);

alter table public.nur_usage_stats enable row level security;
-- RLS açık + policy YOK: istemciler tabloyu okuyamaz/yazamaz; sadece RPC.

-- ─── Kayıt: bölüm kullanımına 1 ekle ───────────────────
create or replace function public.nur_usage_hit(p_section text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_week date := current_date - ((extract(dow from current_date)::int + 6) % 7); -- Pazartesi
begin
  if coalesce(auth.role(), '') <> 'service_role' then return; end if;
  if p_section is null then return; end if;
  if length(trim(p_section)) < 2 or length(trim(p_section)) > 40 then return; end if;
  insert into public.nur_usage_stats (week_start, section, hits)
  values (v_week, lower(trim(p_section)), 1)
  on conflict (week_start, section)
  do update set hits = public.nur_usage_stats.hits + 1, updated_at = now();
end;
$$;
revoke execute on function public.nur_usage_hit(text) from public, anon, authenticated;
grant execute on function public.nur_usage_hit(text) to service_role;
