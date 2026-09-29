-- ════════════════════════════════════════════════════════
-- ZİKİR GÜNLÜK GRAFİK (29.09) — Topluluk vitrinine günlük/haftalık grafik
-- Supabase SQL Editor'de BİR KEZ çalıştır. Tekrar çalıştırmak zarar vermez.
--
-- ★ SAYI DÜRÜSTLÜĞÜ KURALI: grafik yalnız bu tablo yaştıkça biriken GERÇEK
--   veriyi gösterir. Sahte taban / uydurma geçmiş YASAK — tablo kurulmadan
--   önceki günlerin verisi YOKTUR ve hiçbir yerde 0 diye iddia edilmez.
--   UI, serinin ilk kayıtlı gününden itibaren çizer (boş gün = gerçek 0).
-- ════════════════════════════════════════════════════════

-- ─── Günlük kova: her UTC günü tek satır ─────────────────
create table if not exists public.nur_zikir_gunluk (
  gun date primary key,
  adet bigint not null default 0,
  updated_at timestamptz not null default now()
);

-- Bugünün kovasını garanti et (RPC zaten upsert yapıyor; bu satır görsel güvence)
insert into public.nur_zikir_gunluk (gun, adet)
values (current_date, 0)
on conflict (gun) do nothing;

-- ─── RPC: toplamı + bugünün kovasını TEK İşlemde atomik artır ──
--   Eski nur_zikir_ekle davranışı birebir korunur (dönen toplam), ek olarak
--   günlük kova yazılır. Kova tablosu yoksa bile toplam artışı bozulmaz:
--   kova yazımı ayrı try bloğunda, hatada yalnız kova ertelenir (grafik o
--   günü atlar — uydurma sayı üretilmez).
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
  -- toplam sayaç (eski davranış — aynı işlem içinde)
  update public.nur_zikir_topluluk as z
    set toplam = z.toplam + p_adet, updated_at = now()
    where z.id = 'genel';
  -- günlük kova (yeni): insert-or-add, bugünün UTC günü
  begin
    insert into public.nur_zikir_gunluk (gun, adet)
    values (current_date, p_adet)
    on conflict (gun) do update
      set adet = public.nur_zikir_gunluk.adet + excluded.adet,
          updated_at = now();
  exception when others then
    -- kova yazılamadıysa toplamı geri alma — grafik o günü göstermez, sayı uydurulmaz
    null;
  end;
  return query select z.toplam from public.nur_zikir_topluluk z where z.id = 'genel';
end;
$$;

-- Okuma izinleri: service_role yazarda yeter; public okumaya kapalı (API üzerinden gidilir)
revoke all on public.nur_zikir_gunluk from anon, authenticated;
