-- 0004_edges.sql
-- Graph edges with polymorphic endpoint validation

CREATE TABLE edge (
  id          text PRIMARY KEY DEFAULT gen_prefixed_id('edg'),
  from_type   entity_type NOT NULL,
  from_id     text NOT NULL,
  to_type     entity_type NOT NULL,
  to_id       text NOT NULL,
  relation    relation_type NOT NULL,
  weight      numeric(4,3) NOT NULL DEFAULT 0.5 CHECK (weight BETWEEN 0 AND 1),
  source_id   text,
  created_by  actor_type NOT NULL DEFAULT 'editor',
  approved_by uuid,
  approved_at timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CHECK (NOT (from_type = to_type AND from_id = to_id))
);

CREATE UNIQUE INDEX edge_unique ON edge (from_type, from_id, to_type, to_id, relation);
CREATE INDEX edge_from ON edge (from_type, from_id) WHERE approved_at IS NOT NULL;
CREATE INDEX edge_to   ON edge (to_type, to_id)     WHERE approved_at IS NOT NULL;

-- Trigger: validate that referenced entities actually exist
CREATE OR REPLACE FUNCTION edge_check_endpoints()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  tbl text;
  found boolean;
BEGIN
  -- Check from endpoint
  tbl := NEW.from_type::text;
  EXECUTE format('SELECT EXISTS(SELECT 1 FROM %I WHERE id = $1)', tbl)
    INTO found USING NEW.from_id;
  IF NOT found THEN
    RAISE EXCEPTION 'from endpoint %.% does not exist', NEW.from_type, NEW.from_id;
  END IF;

  -- Check to endpoint
  tbl := NEW.to_type::text;
  EXECUTE format('SELECT EXISTS(SELECT 1 FROM %I WHERE id = $1)', tbl)
    INTO found USING NEW.to_id;
  IF NOT found THEN
    RAISE EXCEPTION 'to endpoint %.% does not exist', NEW.to_type, NEW.to_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_edge_check_endpoints
  BEFORE INSERT OR UPDATE ON edge
  FOR EACH ROW EXECUTE FUNCTION edge_check_endpoints();
