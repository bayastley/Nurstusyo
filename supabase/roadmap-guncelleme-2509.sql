-- ════════════════════════════════════════════════════════
-- ROADMAP GÜNCELLEME — 25 Eylül 2026 (menü sadeleştirme)
-- Güncellemeler menüsündeki V2/V3 rozetli maddeler menüden kaldırıldı;
-- oylama tek çatada (Yol Haritası) toplandı. Bu 6 madde DB'ye eklenir.
-- Supabase SQL Editor'de çalıştır. Tekrar çalıştırmak ZARAR VERMEZ
-- (on conflict do nothing sayesinde mevcut kayıtlar + oylar korunur).
-- ★ 27.09: İÇİNDEKİ 2 RPC (nur_zikir_ekle, nur_hafta_video_begen) DÜZELTİLDİ
--   (42702 ambiguous column) — bu dosya artık tek başına yeterli; ek olarak
--   supabase/fix-rpc-ambiguous-2709.sql da aynı düzeltmeyi içerir.
-- ════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════
-- ★★ 27 EYLÜL GÜNCELLEMESİ — OYLAMA LİSTESİ YENİDEN KURULDU
--   KURAL: Sitede AKTİF ÇALIŞAN tüm özellikler V2 oylamasında.
--   Kodu olmayan / büyük işler (AI meal, kendi sesinle, e-fatura,
--   kurumsal, mushaf, tajvid...) V3 uzun vadeli plana taşındı — OY ALAMAZ.
--   Eski maddeler silinmez; versiyonları değiştirilir.
-- ════════════════════════════════════════════════════════

-- ★ OYDAN ÇIKARILANLAR → V3 (uzun vadeli plan)
update public.nur_roadmap_features set version = 'V3',
  description = 'Ayetlerin anlamını doğal bir sesle dinle. Bir sure seç, kendi meal videonu dakikalar içinde hazırla.'
  where id = 'ai-meal' and version <> 'V3';
update public.nur_roadmap_features set version = 'V3',
  description = 'Kendi anlatım tarzını videolarına taşı. Sesini seçtiğin ayetlerle buluştur.'
  where id = 'kendi-ses' and version <> 'V3';
update public.nur_roadmap_features set version = 'V3',
  description = 'Ödeme sonrası faturaların otomatik hazırlanması; aradığını tek yerde bul.'
  where id = 'e-fatura' and version <> 'V3';
update public.nur_roadmap_features set version = 'V3',
  description = 'Camiler, yayıncılar ve medya ekipleri için toplu üretim paketleri.'
  where id = 'kurumsal' and version <> 'V3';

-- ★ ÇALIŞAN YENİ ÖZELLİKLER → V2 OYLAMASINA (on conflict: tekrar çalıştırılabilir)
insert into public.nur_roadmap_features (id, version, title, description, icon)
values
  ('hafizlik-testi',    'V2', 'Hafızlık Testi', 'Ayeti tamamla testiyle hafızanı sına; seviye atladıkça sorular zorlaşır.', 'hafizlik_testi'),
  ('ayet-notlari',      'V2', 'Ayet Notlarım', 'Seçtiğin ayetlere kendi notunu ekle; manevi arşivin cihazında şifreli durur.', 'notlar'),
  ('ayet-paketleri',    'V2', 'Hazır Ayet Paketleri', 'Kandil, cuma, sabır ve daha fazlası — tek tıkla paketlenmiş ayet setleri.', 'paket'),
  ('ozel-gun-takvimi',  'V2', 'Özel Gün Takvimi', 'Cuma, kandil ve mübarek geceler günü gününe; temaya hazır video önerisi gelir.', 'takvim'),
  ('tefsir',            'V2', 'Elmalılı Tefsiri', 'Ayetin altında Elmalılı Hamdi Yazır tefsiri — oku, anla, videoya taşı.', 'tefsir'),
  ('latin-okunus',      'V2', 'Latin Okunuş', 'Arapça bilmeyen için harf harf okunuş — tilavete kolay başlangıç.', 'latin'),
  ('kanal-rehberi',     'V2', 'Kanal Rehberi', 'Huzur, tilavet, sohbet kanalları tek listede — keşfet ekranından erişilir.', 'kanal'),
  ('cami-bulucu',       'V2', 'Cami Bulucu', 'Yakınındaki camileri haritada bul; adres ve mesafe bilgisiyle.', 'cami'),
  ('kible',             'V2', 'Kıble Pusulası', 'Bulunduğun yere göre kıble yönü ve açısı — pusula ekranı.', 'kible'),
  ('bugun-hediye',      'V2', 'Günlük Sürpriz Hediye', 'Her gün girişte üretim hakkı ya da jeton sürprizi — sadaka-i cariye motoru.', 'hediye'),
  ('whatsapp-kart',     'V2', 'WhatsApp Ayet Kartı', '9:16 dikey ayet kartı üret; durum ve hikaye boyutunda tek tuşla paylaş.', 'whatsapp'),
  ('kelime-kartlari',   'V2', 'Kur''an Kelime Kartları', 'En sık geçen 40 kelime, anlamı ve örneğiyle — Kur''an''ı anlamaya giriş.', 'kelime_kartlari'),
  ('soru-cevap',        'V2', 'Soru-Cevap Arşivi', 'Abdest, oruç, zekât... Diyanet kaynaklı kısa ve güvenilir cevaplar.', 'soru'),
  ('hoca-karsilastir',  'V2', 'Hoca Ses Karşılaştırma', 'İki kâriyi yan yana dinle; videona en uygun sesi seç.', 'hoca'),
  ('devam-serisi',      'V2', 'Günlük Devam Serisi', 'Üst üste üretim günlerin seriyi büyütür — alev kaybolmasın!', 'seri'),
  ('gece-mushafi',      'V2', 'Gece Mushafı', 'Gözü yormayan kehribar temasıyla gece okuması.', 'gece'),
  ('oruc-takibi',       'V2', 'Oruç Takibi', 'Ramazan günlerini işaretle; tuttuğun oruçları takip et.', 'oruc'),
  ('toplu-indirme',     'V2', 'Üç Format Tek İndirme', 'ELİT üyelikle 9:16, 1:1 ve 16:9 formatlarını tek seferde indir.', 'toplu')
on conflict (id) do update set
  version = excluded.version,
  title = excluded.title,
  description = excluded.description,
  icon = excluded.icon,
  active = true;

-- ★ V3'E YENİ TAŞINAN BÜYÜK PLANLAR (oy alamaz, unutulmaz)
insert into public.nur_roadmap_features (id, version, title, description, icon)
values
  ('mushaf-gorunumu',    'V3', 'Mushaf Görünümü', 'Gerçek mushaf sayfası gibi ayet sayfaları — sayfa çevirme hissiyle okuma.', 'mushaf'),
  ('tajvid',             'V3', 'Tajvid Eğitimi', 'Harf harf tecvid kuralları: uzatma, gunne, gırla — renkli işaretlerle öğrenme.', 'tajvid'),
  ('haftanin-videosu',   'V3', 'Haftanın Videosu', 'En beğenilen üretimler her hafta vitrinde; topluluğa ilham versin.', 'hafta_video'),
  ('offline-mod',        'V3', 'Çevrimdışı Kullanım', 'İnternet yokken bile okunan sayılar, seçilen ayetler ve kartlar cebinde kalsın.', 'offline'),
  ('uretici-istatistik', 'V3', 'Üretici İstatistikleri', 'Kaç video, hangi sure, hangi atmosfer — kendi üretim grafiğini gör.', 'uretici_ist'),
  ('cocuk-yarismasi',    'V3', 'Çocuklar İçin Yarışma', 'Çocuklara özel sure ve dua yarışmaları — rozetler ve sürpriz hediyelerle.', 'cocuk'),
  ('telaffuz',           'V3', 'Telaffuz Eğitimi', 'Harfleri doğru çıkarmak için sesli örneklerle telaffuz pratiği.', 'telaffuz'),
  ('masaustu-widget',    'V3', 'Masaüstü Widget', 'Günün ayeti ve namaz vakti ekranında dursun — widget desteği.', 'widget'),
  ('cok-dilli-meal',     'V3', 'Çok Dilli Meal Paketi', 'İngilizce, Endonezce ve daha fazlası — ayet kartlarına çok dilli meal.', 'cok_dilli'),
  ('foto-hat-karti',     'V3', 'Fotoğraf ve Hat Sanatı Kartı', 'Kendi fotoğrafının üzerine hat sanatı ayet — bireysel, sanatsal kartlar.', 'foto_hat')
on conflict (id) do update set
  version = excluded.version,
  title = excluded.title,
  description = excluded.description,
  icon = excluded.icon,
  active = true;

-- ★ HADİS BANKASI ARTIK ÇALIŞIYOR → V2'ye (27.09: derece etiketli arama eklendi)
update public.nur_roadmap_features set version = 'V2',
  description = 'Sahih, hasan ve zayıf etiketli hadis bankası — derecesi ve kaynağıyla ara, videoya taşı.'
where id = 'hadisler';

-- ★ GÜNCELLEME: eski 'geliştirme gerekir' notları temizlenir (artık V3'teler, oy alamazlar)
update public.nur_roadmap_features set description = replace(description, ' (geliştirme gerekir)', '')
where description like '%(geliştirme gerekir)%';

insert into public.nur_roadmap_features (id, version, title, description, icon)
values
  ('ayet-kutuphanesi', 'V2', 'Ayet & Dua Kütüphanesi', '616 ayet, 13 mood filtresi, Günün Ayeti ve kart tasarımı — kütüphane komple burada oylanıyor.', 'arsiv'),
  ('kuran-hikayeleri', 'V2', 'Kur''an Hikayeleri', 'Peygamber kıssaları ve Kur''an hikayeleri video serileri olarak.', 'seriler'),
  ('kissalar',         'V2', 'Kıssalar', 'Kıssa bankası: peygamberler, sahabeler ve ibretli hikayeler.', 'seriler'),
  ('dualar-zikirler',  'V2', 'Dualar & Zikirler', 'Kadim dualar ve günlük zikir listeleri — tek tıkla videoya ekle.', 'notlar'),
  ('hadisler',         'V3', 'Hadisler', 'Sahih hadis bankası — ara, bul, videoya taşı.', 'push'),
  ('kurumsal',         'V3', 'Kurumsal Üyelik & Ajans', 'Camiler, yayıncılar ve medya ekipleri için toplu üretim paketleri.', 'kurumsal')
on conflict (id) do nothing;

-- ★ KODSUZ MADDELERE DÜRÜSTLÜK NOTU (2509 gecesi): kodu hiç olmayan
--   maddelerde kullanıcının beklentisi yönetilir; oy verdiklerinde "geliştirme
--   gerekir" olduğunu baştan bilirler.
update public.nur_roadmap_features set description = description || ' (geliştirme gerekir)'
where id in ('ai-meal', 'e-fatura') and description not like '%(geliştirme gerekir)%';

-- ★ SERİ ÜRETİM V3'E TAŞINDI — oylamadan çıkarıldı, uzun vadeli plana kondu (unutulmasın)
update public.nur_roadmap_features set version = 'V3',
  description = 'Onlarca ayet seç, hepsine tek tasarımı uygula, videolar sırayla kendiliğinden hazır olsun. (V3 — uzun vadeli plan)'
where id = 'seri-uretim';

-- Kontrol (opsiyonel): katalog kaç madde?
-- select version, count(*) from public.nur_roadmap_features group by version;

-- ════════════════════════════════════════════════════════
-- ★ ZİKİR TOPLULUK SAYACI (V2) — api/zikir/topluluk.ts bunu kullanır
--   Bu blok 25 Eylül gecesi eklendi (İş 1 ile API hazır, tablo eksikti).
-- ════════════════════════════════════════════════════════

create table if not exists public.nur_zikir_topluluk (
  id text primary key default 'genel',
  toplam bigint not null default 0,
  updated_at timestamptz not null default now()
);
insert into public.nur_zikir_topluluk (id, toplam) values ('genel', 0)
on conflict (id) do nothing;

-- Atomik artırım — yalnızca sunucu (service_role) çağırabilir
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
  -- ★ 27.09 FIX: kolonlar 'z.' takma adıyla nitelendi — "column toplam is ambiguous"
  --   (42702) hatası giderildi. RETURNS TABLE(toplam) OUT değişkeni kolonla çakışıyordu.
  if p_adet < 1 or p_adet > 500 then
    return query select z.toplam from public.nur_zikir_topluluk z where z.id = 'genel';
    return;
  end if;
  update public.nur_zikir_topluluk as z
  set toplam = z.toplam + p_adet, updated_at = now()
  where z.id = 'genel';
  return query select z.toplam from public.nur_zikir_topluluk z where z.id = 'genel';
end;
$$;
revoke execute on function public.nur_zikir_ekle(integer) from public, anon, authenticated;
grant execute on function public.nur_zikir_ekle(integer) to service_role;

-- ════════════════════════════════════════════════════════
-- ★ DAVET / REFERANS SİSTEMİ (İş 5)
--   Her başarılı davette İKİ TARAF +3 kısa video hakkı kazanır.
--   Kod üretimi: 6 karakter (0/O ve 1/I hariç — karışıklık olmasın).
--   Bir hesap yalnızca 1 kez davet edilebilir (unique).
-- ════════════════════════════════════════════════════════

-- Davet kodları: her kullanıcı 1 kod sahiptir
create table if not exists public.nur_referans_kodlari (
  kod text primary key,
  user_id text not null,
  created_at timestamptz not null default now()
);
create unique index if not exists nur_referans_kodlari_user_idx
  on public.nur_referans_kodlari(user_id);

-- Kullanım kayıtları: davet_edilen unique → çift ödül imkânsız
create table if not exists public.nur_referans_kullanim (
  id uuid primary key default gen_random_uuid(),
  davet_eden text not null,
  davet_edilen text not null unique,
  kod text not null,
  odul_davet_eden integer not null default 3,
  odul_davet_edilen integer not null default 3,
  created_at timestamptz not null default now()
);

-- Kullanıcının kodunu ver (yoksa üret) — yalnızca sunucu çağırır
create or replace function public.nur_referans_kod_al(p_user_id text)
returns table(kod text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_kod text;
  v_deneme integer := 0;
  v_chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_i integer;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    return query select null::text;
    return;
  end if;
  select k.kod into v_kod from public.nur_referans_kodlari k
  where k.user_id = p_user_id limit 1;
  if v_kod is not null then
    return query select v_kod;
    return;
  end if;
  loop
    v_deneme := v_deneme + 1;
    if v_deneme > 5 then
      return query select null::text;
      return;
    end if;
    v_kod := '';
    for v_i in 1..6 loop
      v_kod := v_kod || substr(v_chars, floor(random() * length(v_chars) + 1)::int, 1);
    end loop;
    begin
      insert into public.nur_referans_kodlari (kod, user_id) values (v_kod, p_user_id);
      exit;
    exception when unique_violation then
      v_kod := null; -- çakıştı, tekrar dene
    end;
  end loop;
  return query select v_kod;
end;
$$;
revoke execute on function public.nur_referans_kod_al(text) from public, anon, authenticated;
grant execute on function public.nur_referans_kod_al(text) to service_role;

-- Kodu kullan: ödülleri atomik ver (her iki tarafa +3 kısa video)
create or replace function public.nur_referans_kullan(p_kod text, p_davet_edilen text)
returns table(ok boolean, error text, davet_eden_odul integer, davet_edilen_odul integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_eden text;
  v_odul integer := 3;
  v_temiz_kod text := upper(trim(p_kod));
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    return query select false, 'UNAUTHORIZED', 0, 0;
    return;
  end if;
  if length(v_temiz_kod) < 4 then
    return query select false, 'KOD_GEÇERSİZ', 0, 0;
    return;
  end if;
  select k.user_id into v_eden
  from public.nur_referans_kodlari k
  where k.kod = v_temiz_kod;
  if v_eden is null then
    return query select false, 'KOD_BULUNAMADI', 0, 0;
    return;
  end if;
  if v_eden = p_davet_edilen then
    return query select false, 'KENDINI_DAVET', 0, 0;
    return;
  end if;
  begin
    insert into public.nur_referans_kullanim (davet_eden, davet_edilen, kod)
    values (v_eden, p_davet_edilen, v_temiz_kod);
  exception when unique_violation then
    return query select false, 'ZATEN_DAVET_EDILMIS', 0, 0;
    return;
  end;
  -- Ödül 1: davet eden
  insert into public.nur_video_rights (user_id, video_kind, remaining)
  values (v_eden, 'kisa', v_odul)
  on conflict (user_id, video_kind) do update
    set remaining = public.nur_video_rights.remaining + excluded.remaining,
        updated_at = now();
  -- Ödül 2: davet edilen
  insert into public.nur_video_rights (user_id, video_kind, remaining)
  values (p_davet_edilen, 'kisa', v_odul)
  on conflict (user_id, video_kind) do update
    set remaining = public.nur_video_rights.remaining + excluded.remaining,
        updated_at = now();
  return query select true, null::text, v_odul, v_odul;
end;
$$;
revoke execute on function public.nur_referans_kullan(text, text) from public, anon, authenticated;
grant execute on function public.nur_referans_kullan(text, text) to service_role;

-- Kontrol (opsiyonel):
-- select * from public.nur_referans_kullanim order by created_at desc limit 10;

-- ════════════════════════════════════════════════════════
-- ★ HAFTANIN VİDEOSU (yol haritası madde 17) — 27 Eylül 2026
--   Üyeler ürettikleri videonun linkini (YouTube/Instagram vb.)
--   önerir → admin onaylar → vitrinde yayınlanır.
--   ★ SUNUCUDA VİDEO SAKLANMAZ — yalnızca metadata + paylaşım linki.
-- ════════════════════════════════════════════════════════

create table if not exists public.nur_haftanin_videolari (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  user_ad text not null default '',
  baslik text not null,
  aciklama text not null default '',
  video_link text not null,
  sure_bilgi text not null default '',
  hafta date not null default date_trunc('week', now())::date,
  durum text not null default 'beklemede',
  onay_yok_sebep text not null default '',
  onaylayan text not null default '',
  onay_at timestamptz,
  begeni integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists nur_haftanin_videolari_durum_idx on public.nur_haftanin_videolari(durum, hafta);

-- Öneri ekle: yalnızca oturumlu kullanıcı, haftada 1 öneri
create or replace function public.nur_hafta_video_ekle(
  p_user_id text, p_user_ad text, p_baslik text, p_aciklama text, p_link text, p_sure text
)
returns table(ok boolean, error text, id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hafta date := date_trunc('week', now())::date;
  v_id uuid;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    return query select false, 'UNAUTHORIZED', null::uuid;
    return;
  end if;
  if length(trim(p_baslik)) < 4 then
    return query select false, 'BAŞLIK KISA', null::uuid;
    return;
  end if;
  if p_link !~ '^https?://' then
    return query select false, 'LİNK GEÇERSİZ', null::uuid;
    return;
  end if;
  -- Haftada 1 öneri hakkı (beklemede veya onaylı fark etmez)
  if exists (select 1 from public.nur_haftanin_videolari v
             where v.user_id = p_user_id and v.hafta = v_hafta) then
    return query select false, 'HAFTA_DOLDU', null::uuid;
    return;
  end if;
  insert into public.nur_haftanin_videolari (user_id, user_ad, baslik, aciklama, video_link, sure_bilgi, hafta)
  values (p_user_id, left(trim(p_user_ad), 40), left(trim(p_baslik), 100), left(trim(p_aciklama), 500),
          left(trim(p_link), 500), left(trim(p_sure), 120), v_hafta)
  returning nur_haftanin_videolari.id into v_id;
  return query select true, null::text, v_id;
end;
$$;
revoke execute on function public.nur_hafta_video_ekle(text, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.nur_hafta_video_ekle(text, text, text, text, text, text) to service_role;

-- Begeni: herkes bir videoya 1 kez begeni verebilir (begenenler array)
alter table public.nur_haftanin_videolari add column if not exists begenenler text[] not null default '{}';

create or replace function public.nur_hafta_video_begen(p_video_id uuid, p_user_id text)
returns table(ok boolean, begeni integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_var boolean;
  v_begeni integer;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    return query select false, 0;
    return;
  end if;
  select (p_user_id = any(v.begenenler)) into v_var from public.nur_haftanin_videolari v where v.id = p_video_id;
  -- ★ 27.09 FIX: kolonlar 'v.'/'h.' takma adıyla nitelendi — "column begeni is ambiguous"
  --   (42702) hatası giderildi; beğeni butonu artık gerçekten kaydedilir.
  if v_var then
    -- toggle: begeniyi kaldır
    update public.nur_haftanin_videolari as v
    set begenenler = array_remove(v.begenenler, p_user_id),
        begeni = greatest(0, v.begeni - 1)
    where v.id = p_video_id;
  else
    update public.nur_haftanin_videolari as v
    set begenenler = v.begenenler || p_user_id,
        begeni = v.begeni + 1
    where v.id = p_video_id;
  end if;
  select h.begeni into v_begeni from public.nur_haftanin_videolari h where h.id = p_video_id;
  return query select true, coalesce(v_begeni, 0);
end;
$$;
revoke execute on function public.nur_hafta_video_begen(uuid, text) from public, anon, authenticated;
grant execute on function public.nur_hafta_video_begen(uuid, text) to service_role;
