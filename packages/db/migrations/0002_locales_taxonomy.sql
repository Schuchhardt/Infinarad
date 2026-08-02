-- 0002_locales_taxonomy.sql
-- Locales and taxonomy tables (collection, region, period)

CREATE TABLE locale (
  code            text PRIMARY KEY,
  name_native     text NOT NULL,
  name_en         text NOT NULL,
  direction       text_direction NOT NULL DEFAULT 'ltr',
  is_master       boolean NOT NULL DEFAULT false,
  is_active       boolean NOT NULL DEFAULT false,
  fallback_code   text REFERENCES locale(code),
  font_stack      text,
  sort_order      int NOT NULL DEFAULT 100
);
CREATE UNIQUE INDEX one_master_locale ON locale (is_master) WHERE is_master;

CREATE TABLE collection (
  id          text PRIMARY KEY DEFAULT gen_prefixed_id('col'),
  slug        text NOT NULL UNIQUE,
  sort_order  int NOT NULL DEFAULT 100,
  status      publication_status NOT NULL DEFAULT 'draft',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE region (
  id          text PRIMARY KEY DEFAULT gen_prefixed_id('reg'),
  slug        text NOT NULL UNIQUE,
  parent_id   text REFERENCES region(id),
  centroid_lat double precision,
  centroid_lng double precision
);

CREATE TABLE period (
  id          text PRIMARY KEY DEFAULT gen_prefixed_id('per'),
  slug        text NOT NULL UNIQUE,
  start_year  int,
  end_year    int,
  CHECK (end_year IS NULL OR start_year IS NULL OR end_year >= start_year)
);
