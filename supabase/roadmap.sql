-- ════════════════════════════════════════════════════════
-- NUR_ROADMAP — güncelleme yol haritası oylaması (GERÇEK TOPLAM)
-- Supabase SQL Editor'de BİR KEZ çalıştır.
-- Eski sistem localStorage'daydı: herkes kendi oylarını kendi görüyordu,
-- admin gerçek toplamı ASLA göremiyordu. Artık tek gerçek sayaç DB'de.
-- ════════════════════════════════════════════════════════

-- Özellik kataloğu (admin ekleyip silebilir)
create table if not exists public.nur_roadmap_features (
  id         text primary key,
  version    text not null default 'V2',   -- V2 | V3
  title      text not null,
  desc       text not null default '',
  icon       text not null default 'ai_arkaplan',
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

-- Oylar: bir kullanıcı tek özelliğe oy verebilir (user_id unique)
create table if not exists public.nur_roadmap_votes (
  user_id    text primary key,
  feature_id text not null references public.nur_roadmap_features(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists idx_nur_roadmap_votes_feature
  on public.nur_roadmap_votes (feature_id);

-- Dışarıya kapalı: yazma/okuma yalnızca backend service role ile.
alter table public.nur_roadmap_features enable row level security;
alter table public.nur_roadmap_votes enable row level security;
revoke all on public.nur_roadmap_features from anon, authenticated;
revoke all on public.nur_roadmap_votes from anon, authenticated;

-- Başlangıç kataloğu (eski varsayılanlar) — bir kez eklenir
insert into public.nur_roadmap_features (id, version, title, desc, icon)
values
  ('wbw_video', 'V2', 'Video Üzerinde Kelime Kelime (WbW)', 'Video üretirken ayet kelimeleri tek tek vurgulansın.', 'ai_arkaplan'),
  ('ai_meal', 'V2', 'AI Meal Seslendirme', 'Seçilen meal doğal sesle okunsun.', 'ai_arkaplan'),
  ('api', 'V3', 'Toplu İçerik ve API', 'Camiler, yayıncılar ve medya ekipleri için güçlü otomasyon.', 'ai_arkaplan')
on conflict (id) do nothing;
