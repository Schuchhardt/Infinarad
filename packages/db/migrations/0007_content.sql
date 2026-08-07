-- 0007_content.sql
-- Documentary, revision, living page, changelog, suggestion

CREATE TABLE infi_documentary (
  id                  text PRIMARY KEY DEFAULT infi_gen_prefixed_id('doc'),
  question_id         text NOT NULL REFERENCES infi_question(id),
  angle_slug          text NOT NULL,
  tradition_id        text REFERENCES infi_tradition(id),
  slug                text NOT NULL UNIQUE,
  status              infi_publication_status NOT NULL DEFAULT 'draft',
  youtube_id          text,
  duration_sec        int,
  published_at        timestamptz,
  current_revision_id text,
  UNIQUE (question_id, angle_slug)
);

CREATE TABLE infi_revision (
  id            text PRIMARY KEY DEFAULT infi_gen_prefixed_id('rev'),
  entity_type   infi_entity_type NOT NULL,
  entity_id     text NOT NULL,
  version       int NOT NULL,
  body          jsonb NOT NULL,
  content_hash  text NOT NULL,
  diff_summary  text,
  author_type   infi_actor_type NOT NULL,
  author_id     uuid,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entity_type, entity_id, version)
);

-- Immutability: revoke UPDATE and DELETE from all non-superuser roles
REVOKE UPDATE, DELETE ON infi_revision FROM PUBLIC;

CREATE TABLE infi_living_page (
  id                  text PRIMARY KEY DEFAULT infi_gen_prefixed_id('lp'),
  documentary_id      text UNIQUE REFERENCES infi_documentary(id),
  question_id         text NOT NULL REFERENCES infi_question(id),
  current_revision_id text REFERENCES infi_revision(id),
  status              infi_publication_status NOT NULL DEFAULT 'draft'
);

CREATE TABLE infi_living_page_citation (
  living_page_id text REFERENCES infi_living_page(id) ON DELETE CASCADE,
  citation_id    text REFERENCES infi_citation(id),
  block_ref      text NOT NULL,
  PRIMARY KEY (living_page_id, citation_id, block_ref)
);

CREATE TABLE infi_changelog_entry (
  id          text PRIMARY KEY DEFAULT infi_gen_prefixed_id('cle'),
  entity_type infi_entity_type NOT NULL,
  entity_id   text NOT NULL,
  revision_id text REFERENCES infi_revision(id),
  kind        infi_changelog_kind NOT NULL,
  is_public   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE infi_suggestion (
  id                    text PRIMARY KEY DEFAULT infi_gen_prefixed_id('sug'),
  entity_type           infi_entity_type NOT NULL,
  entity_id             text NOT NULL,
  body                  text NOT NULL,
  contact_email         text,
  status                text NOT NULL DEFAULT 'pending',
  resolved_revision_id  text REFERENCES infi_revision(id),
  created_at            timestamptz NOT NULL DEFAULT now()
);
