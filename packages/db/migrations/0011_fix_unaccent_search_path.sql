-- 0011_fix_unaccent_search_path.sql
-- Fix: autovacuum fallaba cada minuto con 42883 "function unaccent(text) does not exist".
--
-- infi_immutable_unaccent respaldaba el índice de expresión infi_translation_fts.
-- Resolvía `unaccent` por search_path en runtime, pero los workers de autovacuum
-- corren con search_path seguro (vacío), y ANALYZE evalúa la expresión del índice
-- para calcular estadísticas. Resultado: el autoanalyze de infi_translation nunca
-- completó y reintentaba en cada autovacuum_naptime (1 min).
--
-- Se fija el search_path en la propia función: queda inmune al del llamador y sigue
-- funcionando con la extensión en `public` (prod) o en `extensions` (config.toml local).
-- Sigue siendo plpgsql a propósito: no se inlinea, así que la expresión del índice
-- permanece estable. El valor devuelto no cambia, por lo que el índice no se reconstruye.
CREATE OR REPLACE FUNCTION infi_immutable_unaccent(text)
RETURNS text
LANGUAGE plpgsql IMMUTABLE PARALLEL SAFE STRICT
SET search_path = public, extensions, pg_catalog
AS $fn$ BEGIN RETURN unaccent($1); END $fn$;

-- Sobras de depuración del mismo bug: creadas fuera de migración, sin dependientes.
DROP FUNCTION IF EXISTS infi_immutable_unaccent_plpgsql(text);
DROP FUNCTION IF EXISTS infi_immutable_unaccent_qualified(text);
