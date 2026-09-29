-- ════════════════════════════════════════════════════════
-- ZİKİR GÜNLÜK ARŞİV + CRON (29.09) — haftalık toplam gerçekten haftalık olsun
-- Supabase SQL Editor'de BİR KEZ çalıştır. Tekrar çalıştırmak zarar vermez.
--
-- SORUN: zikir-gunluk-grafik-2909.sql kovaları yalnız RPC çağrısıyla (yani
--   aktif zikir çekimiyle) açar. Kimse zikir çekmeyen günlerde kova satırı
--   OLMAZ → grafik penceresinde o gün hiç görünmez → "7 GÜN" seçimi 7 gerçek
--   gün DEĞİL, sadece veri olan günlerin toplamı olurdu.
-- ÇÖZÜM: Vercel cron her gece dünün kovasını KAPANIR:
--   kova(dün) += (bugünkü koşu toplamı − son arşiv anlık görüntüsü).
--   Böylece penceredeki her gün GERÇEK bir gündür; toplamlar eksiksizdir.
--   Cron bir gece gelmezse: o günün kovası boş kalmaz, sonraki arşivde
--   anlık görüntü farkı bir sonraki güne devredilir — TOPLAM hep doğru,
--   hiçbir zikir kaybolmaz (günler arası dağıtım bir gün kayabilir,
--   uydurma sayı üretilmez).
-- ════════════════════════════════════════════════════════

-- ─── Arşiv durumu: son kapanan gün + o gün bitimindeki koşu toplamı ──
create table if not exists public.nur_zikir_arsiv (
  id text primary key default 'genel',
  son_arsiv date,                 -- arşivi son kapanan gün (dün bitiminde)
  toplam_anlik bigint not null default 0,  -- o an koşu toplamı (nur_zikir_topluluk.toplam)
  updated_at timestamptz not null default now()
);

-- Başlangıç: arşiv serisi ŞİMDİ başlar. "Dün bitiminde toplam 0'dı" yazmak
-- dürüsttür: arşiv tablosu kurulana dek günlük ölçüm YOKTU; bugünün zikirleri
-- bugünün kovasına düşer, öncesi uydurulmaz.
insert into public.nur_zikir_arsiv (id, son_arsiv, toplam_anlik)
values ('genel', current_date - 1, 0)
on conflict (id) do nothing;

-- ─── RPC: dünü (veya verilen günü) kapat — yalnız service_role ──
--   OUT adları kolon adlarıyla çakışmasın diye sonuc/gun_t/kova_adet/mesaj
--   (27.09'daki 42702 ambiguous-column dersinin aynısı).
create or replace function public.nur_zikir_gun_arsivle(p_tarih date default null)
returns table(sonuc boolean, gun_t date, kova_adet bigint, mesaj text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hedef date := coalesce(p_tarih, current_date - 1);
  v_toplam bigint;
  v_son_arsiv date;
  v_anlik bigint;
  v_delta bigint;
  v_kova bigint;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    return query select false, null::date, bigint '0', 'UNAUTHORIZED'::text;
    return;
  end if;

  -- Durum satırını kilitle (paralel cron çağrılarına karşı)
  select a.son_arsiv, a.toplam_anlik into v_son_arsiv, v_anlik
    from public.nur_zikir_arsiv a where a.id = 'genel' for update;
  if not found then
    return query select false, v_hedef, bigint '0', 'STATE_YOK_SQL_CALISTIRILMAMIS'::text;
    return;
  end if;

  -- Aynı gün iki kez kapanmaz (idempotent)
  if v_son_arsiv is not null and v_son_arsiv >= v_hedef then
    select coalesce(g.adet, 0) into v_kova from public.nur_zikir_gunluk g where g.gun = v_hedef;
    return query select true, v_hedef, v_kova, 'ALREADY_ARCHIVED'::text;
    return;
  end if;

  select z.toplam into v_toplam from public.nur_zikir_topluluk z where z.id = 'genel';
  if v_toplam is null then
    return query select false, v_hedef, bigint '0', 'TOPLAM_SATIRI_YOK'::text;
    return;
  end if;

  -- Kova satırı garanti (aktif gün olmayan günler için burada açılır)
  insert into public.nur_zikir_gunluk (gun, adet) values (v_hedef, 0)
    on conflict (gun) do nothing;

  -- Son arşivden bu yana biriken fark → hedef günün kovasına
  v_delta := v_toplam - v_anlik;
  if v_delta < 0 then
    v_delta := 0; -- sayaç elle sıfırlandıysa negatif sayı KAYDIRMA — dürüst kural
  end if;

  update public.nur_zikir_gunluk as g
    set adet = g.adet + v_delta, updated_at = now()
    where g.gun = v_hedef;

  update public.nur_zikir_arsiv as a
    set son_arsiv = v_hedef, toplam_anlik = v_toplam, updated_at = now()
    where a.id = 'genel';

  select g.adet into v_kova from public.nur_zikir_gunluk g where g.gun = v_hedef;
  return query select true, v_hedef, v_kova, null::text;
end;
$$;

-- ★ Eksik gün telafisi (elle, nadiren): bir gün arşivlenemediyese arşiv satırı
--   geri sarılıp cron/RPC o günden itibaren yeniden koşturulur. Örn. 2 gün
--   atlandıysa: update nur_zikir_arsiv set son_arsiv = current_date - 3;
--   (toplam_anlik'a dokunma — fark hesabı devralır; arşiv RPC'si gün gün çağrılır.)
