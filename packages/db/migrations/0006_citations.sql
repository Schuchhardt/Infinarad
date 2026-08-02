-- 0006_citations.sql
-- Citations with composite FK enforcing quote-requires-quotable

CREATE TABLE citation (
  id              text PRIMARY KEY DEFAULT gen_prefixed_id('cit'),
  source_id       text NOT NULL,
  source_quotable boolean NOT NULL,
  locator         text NOT NULL,
  claim_text      text NOT NULL,
  quote           text,
  quote_word_count int GENERATED ALWAYS AS (
    CASE WHEN quote IS NULL THEN 0
         ELSE array_length(regexp_split_to_array(btrim(quote), '\s+'), 1)
    END
  ) STORED,
  verification_status verification_status NOT NULL DEFAULT 'unverified',
  verified_by     uuid,
  verified_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),

  FOREIGN KEY (source_id, source_quotable)
    REFERENCES source (id, quotable) ON UPDATE CASCADE,

  CONSTRAINT quote_requires_quotable_source
    CHECK (quote IS NULL OR source_quotable = true)
);

-- Trigger: enforce max_quote_words from the source
CREATE OR REPLACE FUNCTION citation_check_max_words()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  max_words int;
  word_count int;
BEGIN
  IF NEW.quote IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT s.max_quote_words INTO max_words
    FROM source s WHERE s.id = NEW.source_id;

  word_count := array_length(regexp_split_to_array(btrim(NEW.quote), '\s+'), 1);

  IF word_count > max_words THEN
    RAISE EXCEPTION 'quote has % words but source allows max %', word_count, max_words;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_citation_check_max_words
  BEFORE INSERT OR UPDATE OF quote ON citation
  FOR EACH ROW EXECUTE FUNCTION citation_check_max_words();
