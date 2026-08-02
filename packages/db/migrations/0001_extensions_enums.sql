-- 0001_extensions_enums.sql
-- Extensions and enum types

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TYPE entity_type AS ENUM (
  'question','tradition','concept','author','work','practice','symbol',
  'period','region','collection','documentary','living_page','source'
);

CREATE TYPE publication_status AS ENUM ('draft','in_review','published','archived','retracted');

CREATE TYPE relation_type AS ENUM (
  'addresses','contrasts_with','derives_from','influenced_by',
  'practiced_by','authored_by','contained_in','located_in',
  'occurred_during','related_to','translates'
);

CREATE TYPE source_kind AS ENUM ('primary_text','academic','book','article','dataset','archive','interview');
CREATE TYPE license_kind AS ENUM ('public_domain','cc0','cc_by','cc_by_sa','permission_granted','proprietary','unknown');
CREATE TYPE verification_status AS ENUM ('unverified','supported','partial','unsupported','misattributed');
CREATE TYPE translation_status AS ENUM ('machine','reviewed','human');
CREATE TYPE changelog_kind AS ENUM ('creation','correction','expansion','style','retraction','translation');
CREATE TYPE actor_type AS ENUM ('editor','agent','community');
CREATE TYPE user_role AS ENUM ('admin','editor','reviewer','translator','viewer');
CREATE TYPE text_direction AS ENUM ('ltr','rtl');

-- Prefixed ULID generator
CREATE OR REPLACE FUNCTION gen_prefixed_id(prefix text)
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
