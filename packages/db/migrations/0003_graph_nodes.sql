-- 0003_graph_nodes.sql
-- Core entity tables (graph nodes)

CREATE TABLE infi_question (
  id          text PRIMARY KEY DEFAULT infi_gen_prefixed_id('q'),
  slug        text NOT NULL UNIQUE,
  status      infi_publication_status NOT NULL DEFAULT 'draft',
  is_featured boolean NOT NULL DEFAULT false,
  sort_order  int NOT NULL DEFAULT 100,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE infi_tradition (
  id              text PRIMARY KEY DEFAULT infi_gen_prefixed_id('trd'),
  slug            text NOT NULL UNIQUE,
  collection_id   text REFERENCES infi_collection(id),
  era_start       int,
  era_end         int,
  primary_region_id text REFERENCES infi_region(id),
  status          infi_publication_status NOT NULL DEFAULT 'draft'
);

CREATE TABLE infi_concept (
  id              text PRIMARY KEY DEFAULT infi_gen_prefixed_id('cpt'),
  slug            text NOT NULL UNIQUE,
  tradition_id    text REFERENCES infi_tradition(id),
  original_term   text,
  transliteration text,
  original_script text,
  status          infi_publication_status NOT NULL DEFAULT 'draft'
);

CREATE TABLE infi_author (
  id            text PRIMARY KEY DEFAULT infi_gen_prefixed_id('aut'),
  slug          text NOT NULL UNIQUE,
  birth_year    int,
  death_year    int,
  tradition_id  text REFERENCES infi_tradition(id),
  status        infi_publication_status NOT NULL DEFAULT 'draft'
);

CREATE TABLE infi_work (
  id                text PRIMARY KEY DEFAULT infi_gen_prefixed_id('wrk'),
  slug              text NOT NULL UNIQUE,
  author_id         text REFERENCES infi_author(id),
  tradition_id      text REFERENCES infi_tradition(id),
  original_language text,
  composed_start    int,
  composed_end      int,
  status            infi_publication_status NOT NULL DEFAULT 'draft'
);

CREATE TABLE infi_practice (
  id            text PRIMARY KEY DEFAULT infi_gen_prefixed_id('prc'),
  slug          text NOT NULL UNIQUE,
  tradition_id  text REFERENCES infi_tradition(id),
  status        infi_publication_status NOT NULL DEFAULT 'draft'
);

CREATE TABLE infi_symbol (
  id            text PRIMARY KEY DEFAULT infi_gen_prefixed_id('sym'),
  slug          text NOT NULL UNIQUE,
  tradition_id  text REFERENCES infi_tradition(id),
  unicode_char  text,
  status        infi_publication_status NOT NULL DEFAULT 'draft'
);
