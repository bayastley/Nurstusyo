-- ════════════════════════════════════════════════════════════
-- NÛR STÜDYO — MENKİBELER (KISSA KASASI) TABLOSU (02.11)
-- Supabase Dashboard → SQL Editor'e yapıştır ve Run'ı çalıştır (1 kez).
-- Admin panelde "Menkıbeler" sekmesi eklediğiniz kıssalar bu tabloya
-- yazılır; uygulama Canlı'da herkese otomatik listeler.
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS nur_kissalar (
  id            text PRIMARY KEY,
  kategori      text NOT NULL,
  baslik        text NOT NULL,
  hikaye        text NOT NULL,
  hikmet        text NOT NULL,
  kaynak        text NOT NULL DEFAULT '',
  baslik_en     text NOT NULL DEFAULT '',
  baslik_ar     text NOT NULL DEFAULT '',
  baslik_id     text NOT NULL DEFAULT '',
  baslik_ur     text NOT NULL DEFAULT '',
  hikaye_en     text NOT NULL DEFAULT '',
  hikaye_ar     text NOT NULL DEFAULT '',
  hikaye_id     text NOT NULL DEFAULT '',
  hikaye_ur     text NOT NULL DEFAULT '',
  hikmet_en     text NOT NULL DEFAULT '',
  hikmet_ar     text NOT NULL DEFAULT '',
  hikmet_id     text NOT NULL DEFAULT '',
  hikmet_ur     text NOT NULL DEFAULT '',
  aktif         boolean NOT NULL DEFAULT true,
  created_by    text NOT NULL DEFAULT '',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE nur_kissalar IS 'İslâmi Menkıbeler — admin eklediği kıssalar (5 dil çevirili)';

-- Row-Level Security: herkes OKUR (aktif kıssalar), yazma yalnız service role (admin API)
ALTER TABLE nur_kissalar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nur_kissalar_public_read" ON nur_kissalar
  FOR SELECT TO anon, authenticated
  USING (aktif = true);
