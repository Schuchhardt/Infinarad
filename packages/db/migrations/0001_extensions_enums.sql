-- 0001_extensions_enums.sql
-- Extensions and enum types

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS vector;

-- Enum types are guarded with DO blocks: this schema is shared with other
-- projects and the objects may already exist. Idempotent creation.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'infi_entity_type') THEN
    CREATE TYPE infi_entity_type AS ENUM (
      'question','tradition','concept','author','work','practice','symbol',
      'period','region','collection','documentary','living_page','source'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'infi_publication_status') THEN
    CREATE TYPE infi_publication_status AS ENUM ('draft','in_review','published','archived','retracted');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'infi_relation_type') THEN
    CREATE TYPE infi_relation_type AS ENUM (
      'addresses','contrasts_with','derives_from','influenced_by',
      'practiced_by','authored_by','contained_in','located_in',
      'occurred_during','related_to','translates'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'infi_source_kind') THEN
    CREATE TYPE infi_source_kind AS ENUM ('primary_text','academic','book','article','dataset','archive','interview');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'infi_license_kind') THEN
    CREATE TYPE infi_license_kind AS ENUM ('public_domain','cc0','cc_by','cc_by_sa','permission_granted','proprietary','unknown');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'infi_verification_status') THEN
    CREATE TYPE infi_verification_status AS ENUM ('unverified','supported','partial','unsupported','misattributed');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'infi_translation_status') THEN
    CREATE TYPE infi_translation_status AS ENUM ('machine','reviewed','human');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'infi_changelog_kind') THEN
    CREATE TYPE infi_changelog_kind AS ENUM ('creation','correction','expansion','style','retraction','translation');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'infi_actor_type') THEN
    CREATE TYPE infi_actor_type AS ENUM ('editor','agent','community');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'infi_user_role') THEN
    CREATE TYPE infi_user_role AS ENUM ('admin','editor','reviewer','translator','viewer');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'infi_text_direction') THEN
    CREATE TYPE infi_text_direction AS ENUM ('ltr','rtl');
  END IF;
END $$;

-- Prefixed ULID generator
CREATE OR REPLACE FUNCTION infi_gen_prefixed_id(prefix text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  ts bigint;
  encoded text := '';
  chars text := '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  i int;
  rand_bytes bytea;
BEGIN
  ts := (EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::bigint;

  FOR i IN REVERSE 9..0 LOOP
    encoded := encoded || substr(chars, (ts >> (i * 5)) & 31 + 1, 1);
  END LOOP;

  rand_bytes := gen_random_bytes(10);
  FOR i IN 0..9 LOOP
    encoded := encoded || substr(chars, (get_byte(rand_bytes, i) & 31) + 1, 1);
  END LOOP;

  RETURN prefix || '_' || encoded;
END;
$$;
