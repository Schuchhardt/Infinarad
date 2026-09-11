-- 0012_fix_prefixed_id.sql
-- Fixes infi_gen_prefixed_id, which could never generate an id.
--
-- In `(ts >> (i * 5)) & 31 + 1` PostgreSQL binds `+` tighter than `&`, so the
-- expression was `(ts >> (i * 5)) & 32` — a bigint — and the call became
-- substr(text, bigint, integer), which does not exist. Every INSERT that relied
-- on the column default failed with "function substr(text, bigint, integer)
-- does not exist"; only rows carrying an explicit id (the seed data) got in.
--
-- The shift is now masked, parenthesised and cast to int before the offset.

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

  -- 50 bits of millisecond timestamp, most significant first: ids sort by age.
  FOR i IN REVERSE 9..0 LOOP
    encoded := encoded || substr(chars, (((ts >> (i * 5)) & 31)::int) + 1, 1);
  END LOOP;

  rand_bytes := gen_random_bytes(10);
  FOR i IN 0..9 LOOP
    encoded := encoded || substr(chars, (get_byte(rand_bytes, i) & 31) + 1, 1);
  END LOOP;

  RETURN prefix || '_' || encoded;
END;
$$;
