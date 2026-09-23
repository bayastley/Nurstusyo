-- ════════════════════════════════════════════════════════
-- NUR_ROADMAP v2 — tam katalog seed'i (güncellenmiş sürüm)
-- Supabase SQL Editor'de çalıştır. Tekrar çalıştırmak ZARAR VERMEZ
-- (on conflict do nothing sayesinde mevcut kayıtlar korunur).
-- Amaç: modal artık hook hatası olmadan açılıyor + katalog dolu gelsin.
-- ════════════════════════════════════════════════════════

-- 1) Tablolar (önceki roadmap.sql ile aynı şema)
create table if not exists public.nur_roadmap_features (
  id         text primary key,
  version    text not null default 'V2',
  title      text not null,
  description text not null default '',
  icon       text not null default 'ai_arkaplan',
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.nur_roadmap_votes (
  user_id    text primary key,
  feature_id text not null references public.nur_roadmap_features(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists idx_nur_roadmap_votes_feature
  on public.nur_roadmap_votes (feature_id);

alter table public.nur_roadmap_features enable row level security;
alter table public.nur_roadmap_votes enable row level security;
revoke all on public.nur_roadmap_features from anon, authenticated;
revoke all on public.nur_roadmap_votes from anon, authenticated;

-- 2) TAM KATALOG — RoadmapModal.tsx DEFAULT_V2/DEFAULT_V3 ile birebir aynı
insert into public.nur_roadmap_features (id, version, title, description, icon)
values
  -- ★ V2 öncelikli paket
  ('namaz-bildirim', 'V2', 'Namaz Vakti Hatırlatıcısı', 'Şehrini seç, vakit gelince tarayıcından nazik bir hatırlatma al. Siteye hiç girmeden çalışır.', 'namaz_bildirim'),
  ('zikirmatik',     'V2', 'Zikirmatik ve Topluluk Sayacı', 'Salavatını, tespihini siteden çek. Toplulukla birleşen sayı ekranda canlı büyüsün.', 'zikirmatik'),
  ('hatim-takibi',   'V2', 'Hatim ve Sure Takibi', 'Okuduğun sureleri işaretle, Kur''an ilerlemenı yüzde olarak gör. Hatim yolculuğun kayıt altında.', 'hatim'),
  ('uyku-tilaveti',  'V2', 'Uyku Tilaveti (Zamanlayıcılı Dinleme)', 'Yatarken sure seç, zamanlayıcıyı kur, sessizce dinle. Uyku öncesi huzurlu bir refakatçi.', 'uyku_tilaveti'),
  ('seri-uretim',    'V2', 'Seri Üretim (Çoklu Ayet Videosu)', 'Onlarca ayet seç, hepsine tek tasarımı uygula, videolar sırayla kendiliğinden hazır olsun.', 'seri_uretim'),
  ('kandil-sayfasi', 'V2', 'Kandil ve Özel Geceler Sayfası', 'Kandil gecelerinde site otomatik süslenir: o geceye özel sure, dua ve ibadet önerisi hazır gelir.', 'kandil'),
  ('akilli-radyo',   'V2', '🌍 Bölgeye Akıllı Radyo', 'Radyo seni tanısın: bulunduğun bölgeye göre tilavet, sohbet ve hadis kanalları öne gelir; dilediğin kanalı elle de seçersin.', 'akilli_radyo'),
  -- V2 mevcut liste
  ('ai-meal',         'V2', 'AI Meal Seslendirme', 'Ayetlerin anlamını doğal bir sesle dinle. Bir sure seç, kendi meal videonu dakikalar içinde hazırla.', 'ai_meal'),
  ('kendi-ses',       'V2', 'Kendi Sesinle Seslendirme', 'Kendi anlatım tarzını videolarına taşı. Sesini seçtiğin ayetlerle buluştur.', 'kendi_ses'),
  ('kelime-video',    'V2', 'Kelime Tabanlı Video Üretimi', 'Aklındaki tek kelimeyi yaz. Nûr Stüdyo onun etrafında bir atmosfer ve video fikri oluştursun.', 'kelime_video'),
  ('ai-arkaplan',     'V2', 'AI Arka Plan Üretici', 'Metnin ruhunu anlayan bir arka plan düşün. Yaz, seç ve ortaya çıkan sahneyi keşfet.', 'ai_arkaplan'),
  ('push',            'V2', 'Akıllı Push Bildirimi', 'Cuma, kandil ve özel geceleri kaçırma. Doğru zamanda gelen küçük bir hatırlatma.', 'push'),
  ('ucretsiz-deneme', 'V2', 'Ücretsiz 7 Gün PRO Denemesi', 'Nûr Stüdyo''nun bütün gücünü keşfet. Başlamak için kredi kartı gerekmez.', 'ucretsiz_deneme'),
  ('referans',        'V2', 'Davet Ettikçe Büyüyen Topluluk', 'Bir arkadaşını davet et. Birlikte ürettikçe ikinize de güzel bir sürpriz gelsin.', 'referans'),
  ('e-fatura',        'V2', 'Satın Alımlarda E-Fatura', 'Ödeme sonrası belgelerin otomatik hazırlansın; aradığını tek yerde bul.', 'e_fatura'),
  ('meal-dinle',      'V2', 'Ekransız Meal Dinleme', 'Gözlerini kapat, sadece dinle. Videolarını huzurlu bir ses deneyimine dönüştür.', 'meal_dinle'),
  ('wbw_video',       'V2', 'Video Üzerinde Kelime Kelime (WbW)', 'Video üretirken ayet kelimeleri tek tek vurgulansın.', 'ai_arkaplan'),
  -- V3 uzun vadeli planlar
  ('mobil-uygulama',  'V3', 'Cebindeki Kur''an Stüdyosu', 'İlham nerede gelirse gelsin, üretim orada başlasın. Telefonundan hazırla, indir ve paylaş.', 'mobil'),
  ('koleksiyonlar',   'V3', 'Ayet Koleksiyonları', 'Sana dokunan ayetleri tek bir yerde biriktir. Huzur, sabır veya şükür gibi kendi koleksiyonlarını oluştur.', 'koleksiyon'),
  ('ayet-notlari',    'V3', 'Ayetlere Not Ekleme', 'Bir ayeti neden kaydettiğini unutma. Düşüncelerini ekle, zaman içinde kendi manevi arşivini oluştur.', 'notlar'),
  ('icerik-serileri', 'V3', 'Temalı İçerik Serileri', 'Tek bir ayetten fazlasını anlat. Sabırdan şükre, her tema için izlenebilir ve paylaşılabilir video serileri hazırla.', 'seriler'),
  ('reklam',          'V3', 'Ücretsiz Üretime Destek', 'Daha fazla kişi Nûr Stüdyo''ya ulaşsın, ücretsiz üretim imkânı büyüsün. Pro deneyim ise reklamsız kalsın.', 'reklam'),
  ('coklu-kullanici', 'V3', 'Birlikte Üretim Alanı', 'Ailen, arkadaşların veya ekibinle aynı üretim alanında buluş. Herkes kendi hesabıyla, ortak bir amaçla.', 'coklu_kullanici'),
  ('api',             'V3', 'Toplu İçerik ve API', 'Camiler, yayıncılar ve medya ekipleri için güçlü otomasyon.', 'api')
on conflict (id) do nothing;
