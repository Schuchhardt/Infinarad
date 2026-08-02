-- 0008_i18n.sql
-- Translation system with fallback resolution

CREATE TABLE translation (
  entity_type       entity_type NOT NULL,
  entity_id         text NOT NULL,
  locale            text NOT NULL REFERENCES locale(code),
  field             text NOT NULL,
  value             text NOT NULL,
  status            translation_status NOT NULL DEFAULT 'machine',
  source_revision_id text REFERENCES revision(id),
  translated_by     uuid,
  updated_at        timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (entity_type, entity_id, locale, field)
);

CREATE INDEX translation_lookup ON translation (entity_type, entity_id, locale);

CREATE OR REPLACE FUNCTION immutable_unaccent(text)
RETURNS text
LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT
AS $$ SELECT unaccent($1) $$;

CREATE INDEX translation_fts ON translation
  USING gin (to_tsvector('simple', immutable_unaccent(value)));

CREATE TABLE slug_redirect (
  locale     text NOT NULL REFERENCES locale(code),
  old_path   text NOT NULL,
  new_path   text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (locale, old_path)
);

-- View: resolved translations with fallback chain and staleness detection
CREATE OR REPLACE VIEW translated AS
WITH master AS (
  SELECT code FROM locale WHERE is_master LIMIT 1
),
active_locales AS (
  SELECT code, fallback_code FROM locale WHERE is_active
),
entity_fields AS (
  SELECT DISTINCT entity_type, entity_id, field FROM translation
)
SELECT
  ef.entity_type,
  ef.entity_id,
  al.code AS locale,
  ef.field,
  COALESCE(
    t_direct.value,
    t_fallback.value,
    t_master.value
  ) AS value,
  CASE
    WHEN t_direct.value IS NOT NULL THEN false
    ELSE true
  END AS is_fallback,
  CASE
    WHEN t_direct.value IS NOT NULL
      AND t_direct.source_revision_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM revision r
        WHERE r.entity_type = ef.entity_type
          AND r.entity_id = ef.entity_id
          AND r.version > (
            SELECT r2.version FROM revision r2
            WHERE r2.id = t_direct.source_revision_id
          )
      )
    THEN true
    ELSE false
  END AS is_stale,
  COALESCE(t_direct.status, t_fallback.status, t_master.status) AS translation_status
FROM entity_fields ef
CROSS JOIN active_locales al
CROSS JOIN master m
LEFT JOIN translation t_direct
  ON t_direct.entity_type = ef.entity_type
  AND t_direct.entity_id = ef.entity_id
  AND t_direct.locale = al.code
  AND t_direct.field = ef.field
LEFT JOIN translation t_fallback
  ON t_fallback.entity_type = ef.entity_type
  AND t_fallback.entity_id = ef.entity_id
  AND t_fallback.locale = al.fallback_code
  AND t_fallback.field = ef.field
  AND t_direct.value IS NULL
LEFT JOIN translation t_master
  ON t_master.entity_type = ef.entity_type
  AND t_master.entity_id = ef.entity_id
  AND t_master.locale = m.code
  AND t_master.field = ef.field
  AND t_direct.value IS NULL
  AND t_fallback.value IS NULL
WHERE COALESCE(t_direct.value, t_fallback.value, t_master.value) IS NOT NULL;
