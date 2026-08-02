-- 0003_graph_nodes.sql
-- Core entity tables (graph nodes)

CREATE TABLE question (
  id          text PRIMARY KEY DEFAULT gen_prefixed_id('q'),
  slug        text NOT NULL UNIQUE,
  status      publication_status NOT NULL DEFAULT 'draft',
  is_featured boolean NOT NULL DEFAULT false,
  sort_order  int NOT NULL DEFAULT 100,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tradition (
  id              text PRIMARY KEY DEFAULT gen_prefixed_id('trd'),
  slug            text NOT NULL UNIQUE,
  collection_id   text REFERENCES collection(id),
  era_start       int,
  era_end         int,
  primary_region_id text REFERENCES region(id),
  status          publication_status NOT NULL DEFAULT 'draft'
);

CREATE TABLE concept (
  id              text PRIMARY KEY DEFAULT gen_prefixed_id('cpt'),
  slug            text NOT NULL UNIQUE,
  tradition_id    text REFERENCES tradition(id),
  original_term   text,
  transliteration text,
  original_script text,
  status          publication_status NOT NULL DEFAULT 'draft'
);

CREATE TABLE author (
  id            text PRIMARY KEY DEFAULT gen_prefixed_id('aut'),
  slug          text NOT NULL UNIQUE,
  birth_year    int,
  death_year    int,
  tradition_id  text REFERENCES tradition(id),
  status        publication_status NOT NULL DEFAULT 'draft'
);

CREATE TABLE work (
  id                text PRIMARY KEY DEFAULT gen_prefixed_id('wrk'),
  slug              text NOT NULL UNIQUE,
  author_id         text REFERENCES author(id),
  tradition_id      text REFERENCES tradition(id),
  original_language text,
  composed_start    int,
  composed_end      int,
  status            publication_status NOT NULL DEFAULT 'draft'
);

CREATE TABLE practice (
  id            text PRIMARY KEY DEFAULT gen_prefixed_id('prc'),
  slug          text NOT NULL UNIQUE,
  tradition_id  text REFERENCES tradition(id),
  status        publication_status NOT NULL DEFAULT 'draft'
);

CREATE TABLE symbol (
  id            text PRIMARY KEY DEFAULT gen_prefixed_id('sym'),
  slug          text NOT NULL UNIQUE,
  tradition_id  text REFERENCES tradition(id),
  unicode_char  text,
  status        publication_status NOT NULL DEFAULT 'draft'
);
