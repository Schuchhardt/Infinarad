-- 0009_search.sql
-- Embedding storage for semantic search (populated in Fase 2)

CREATE TABLE infi_embedding (
  entity_type infi_entity_type NOT NULL,
  entity_id   text NOT NULL,
  locale      text NOT NULL REFERENCES infi_locale(code),
  chunk_index int NOT NULL,
  content     text NOT NULL,
  vector      vector(1536) NOT NULL,
  model       text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (entity_type, entity_id, locale, chunk_index)
);

CREATE INDEX infi_embedding_hnsw ON infi_embedding USING hnsw (vector vector_cosine_ops);
