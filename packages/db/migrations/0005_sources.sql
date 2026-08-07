-- 0005_sources.sql
-- Source registry with license-driven quotability

CREATE TABLE infi_source (
  id              text PRIMARY KEY DEFAULT infi_gen_prefixed_id('src'),
  kind            infi_source_kind NOT NULL,
  title           text NOT NULL,
  author_name     text,
  editor_name     text,
  translator_name text,
  edition         text,
  year            int,
  publisher       text,
  doi             text,
  isbn            text,
  url_canonical   text,
  language        text,
  license         infi_license_kind NOT NULL DEFAULT 'unknown',
  quotable        boolean NOT NULL DEFAULT false,
  max_quote_words int NOT NULL DEFAULT 15,
  reliability_tier smallint NOT NULL DEFAULT 2 CHECK (reliability_tier BETWEEN 1 AND 3),
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, quotable)
);

CREATE UNIQUE INDEX infi_source_doi  ON infi_source (lower(doi))  WHERE doi IS NOT NULL;
CREATE UNIQUE INDEX infi_source_isbn ON infi_source (isbn)        WHERE isbn IS NOT NULL;
CREATE UNIQUE INDEX infi_source_url  ON infi_source (lower(url_canonical)) WHERE url_canonical IS NOT NULL;

-- Trigger: derive quotable from license, never set manually
CREATE OR REPLACE FUNCTION infi_source_set_quotable()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.quotable := NEW.license IN ('public_domain', 'cc0', 'cc_by', 'cc_by_sa', 'permission_granted');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_source_set_quotable
  BEFORE INSERT OR UPDATE OF license ON infi_source
  FOR EACH ROW EXECUTE FUNCTION infi_source_set_quotable();
