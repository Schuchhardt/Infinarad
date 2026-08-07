-- 0010_auth_rls.sql
-- User profiles and Row Level Security

CREATE TABLE infi_profile (
  id         uuid PRIMARY KEY,
  role       infi_user_role NOT NULL DEFAULT 'viewer',
  locales    text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on all content tables
ALTER TABLE infi_locale ENABLE ROW LEVEL SECURITY;
ALTER TABLE infi_collection ENABLE ROW LEVEL SECURITY;
ALTER TABLE infi_region ENABLE ROW LEVEL SECURITY;
ALTER TABLE infi_period ENABLE ROW LEVEL SECURITY;
ALTER TABLE infi_question ENABLE ROW LEVEL SECURITY;
ALTER TABLE infi_tradition ENABLE ROW LEVEL SECURITY;
ALTER TABLE infi_concept ENABLE ROW LEVEL SECURITY;
ALTER TABLE infi_author ENABLE ROW LEVEL SECURITY;
ALTER TABLE infi_work ENABLE ROW LEVEL SECURITY;
ALTER TABLE infi_practice ENABLE ROW LEVEL SECURITY;
ALTER TABLE infi_symbol ENABLE ROW LEVEL SECURITY;
ALTER TABLE infi_edge ENABLE ROW LEVEL SECURITY;
ALTER TABLE infi_source ENABLE ROW LEVEL SECURITY;
ALTER TABLE infi_citation ENABLE ROW LEVEL SECURITY;
ALTER TABLE infi_documentary ENABLE ROW LEVEL SECURITY;
ALTER TABLE infi_revision ENABLE ROW LEVEL SECURITY;
ALTER TABLE infi_living_page ENABLE ROW LEVEL SECURITY;
ALTER TABLE infi_living_page_citation ENABLE ROW LEVEL SECURITY;
ALTER TABLE infi_changelog_entry ENABLE ROW LEVEL SECURITY;
ALTER TABLE infi_suggestion ENABLE ROW LEVEL SECURITY;
ALTER TABLE infi_translation ENABLE ROW LEVEL SECURITY;
ALTER TABLE infi_slug_redirect ENABLE ROW LEVEL SECURITY;
ALTER TABLE infi_embedding ENABLE ROW LEVEL SECURITY;
ALTER TABLE infi_profile ENABLE ROW LEVEL SECURITY;

-- ===== PUBLIC READ POLICIES (anonymous) =====
-- Locales: anyone can read active locales
CREATE POLICY public_read_locale ON infi_locale
  FOR SELECT USING (is_active = true);

-- Taxonomy: always public
CREATE POLICY public_read_collection ON infi_collection
  FOR SELECT USING (status = 'published');

CREATE POLICY public_read_region ON infi_region
  FOR SELECT USING (true);

CREATE POLICY public_read_period ON infi_period
  FOR SELECT USING (true);

-- Graph nodes: only published
CREATE POLICY public_read_question ON infi_question
  FOR SELECT USING (status = 'published');

CREATE POLICY public_read_tradition ON infi_tradition
  FOR SELECT USING (status = 'published');

CREATE POLICY public_read_concept ON infi_concept
  FOR SELECT USING (status = 'published');

CREATE POLICY public_read_author ON infi_author
  FOR SELECT USING (status = 'published');

CREATE POLICY public_read_work ON infi_work
  FOR SELECT USING (status = 'published');

CREATE POLICY public_read_practice ON infi_practice
  FOR SELECT USING (status = 'published');

CREATE POLICY public_read_symbol ON infi_symbol
  FOR SELECT USING (status = 'published');

-- Edges: only approved
CREATE POLICY public_read_edge ON infi_edge
  FOR SELECT USING (approved_at IS NOT NULL);

-- Sources and citations: always public (they're references)
CREATE POLICY public_read_source ON infi_source
  FOR SELECT USING (true);

CREATE POLICY public_read_citation ON infi_citation
  FOR SELECT USING (true);

-- Content: only published
CREATE POLICY public_read_documentary ON infi_documentary
  FOR SELECT USING (status = 'published');

-- Revisions: public can read (immutable anyway)
CREATE POLICY public_read_revision ON infi_revision
  FOR SELECT USING (true);

CREATE POLICY public_read_living_page ON infi_living_page
  FOR SELECT USING (status = 'published');

CREATE POLICY public_read_living_page_citation ON infi_living_page_citation
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM infi_living_page lp
      WHERE lp.id = living_page_id AND lp.status = 'published'
    )
  );

-- Changelog: only public entries
CREATE POLICY public_read_changelog ON infi_changelog_entry
  FOR SELECT USING (is_public = true);

-- Suggestions: no public read
CREATE POLICY public_read_suggestion ON infi_suggestion
  FOR SELECT USING (false);

-- Translations: public for published entity translations
CREATE POLICY public_read_translation ON infi_translation
  FOR SELECT USING (true);

-- Slug redirects: public
CREATE POLICY public_read_slug_redirect ON infi_slug_redirect
  FOR SELECT USING (true);

-- Embeddings: public
CREATE POLICY public_read_embedding ON infi_embedding
  FOR SELECT USING (true);

-- Profile: only own
CREATE POLICY public_read_profile ON infi_profile
  FOR SELECT USING (false);

-- ===== STAFF POLICIES (authenticated with non-viewer role) =====
-- Staff can read everything
CREATE POLICY staff_read_all_locale ON infi_locale
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY staff_read_all_collection ON infi_collection
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM infi_profile p WHERE p.id = auth.uid() AND p.role <> 'viewer'));

CREATE POLICY staff_read_all_question ON infi_question
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM infi_profile p WHERE p.id = auth.uid() AND p.role <> 'viewer'));

CREATE POLICY staff_read_all_tradition ON infi_tradition
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM infi_profile p WHERE p.id = auth.uid() AND p.role <> 'viewer'));

CREATE POLICY staff_read_all_concept ON infi_concept
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM infi_profile p WHERE p.id = auth.uid() AND p.role <> 'viewer'));

CREATE POLICY staff_read_all_author ON infi_author
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM infi_profile p WHERE p.id = auth.uid() AND p.role <> 'viewer'));

CREATE POLICY staff_read_all_work ON infi_work
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM infi_profile p WHERE p.id = auth.uid() AND p.role <> 'viewer'));

CREATE POLICY staff_read_all_practice ON infi_practice
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM infi_profile p WHERE p.id = auth.uid() AND p.role <> 'viewer'));

CREATE POLICY staff_read_all_symbol ON infi_symbol
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM infi_profile p WHERE p.id = auth.uid() AND p.role <> 'viewer'));

CREATE POLICY staff_read_all_edge ON infi_edge
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM infi_profile p WHERE p.id = auth.uid() AND p.role <> 'viewer'));

CREATE POLICY staff_read_all_documentary ON infi_documentary
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM infi_profile p WHERE p.id = auth.uid() AND p.role <> 'viewer'));

CREATE POLICY staff_read_all_living_page ON infi_living_page
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM infi_profile p WHERE p.id = auth.uid() AND p.role <> 'viewer'));

CREATE POLICY staff_read_all_suggestion ON infi_suggestion
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM infi_profile p WHERE p.id = auth.uid() AND p.role <> 'viewer'));

CREATE POLICY staff_read_all_changelog ON infi_changelog_entry
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM infi_profile p WHERE p.id = auth.uid() AND p.role <> 'viewer'));

CREATE POLICY staff_read_own_profile ON infi_profile
  FOR SELECT TO authenticated
  USING (id = auth.uid());

-- Staff write policies (admin and editor)
CREATE POLICY staff_write_collection ON infi_collection
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM infi_profile p WHERE p.id = auth.uid() AND p.role IN ('admin', 'editor')));

CREATE POLICY staff_write_question ON infi_question
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM infi_profile p WHERE p.id = auth.uid() AND p.role IN ('admin', 'editor')));

CREATE POLICY staff_write_tradition ON infi_tradition
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM infi_profile p WHERE p.id = auth.uid() AND p.role IN ('admin', 'editor')));

CREATE POLICY staff_write_concept ON infi_concept
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM infi_profile p WHERE p.id = auth.uid() AND p.role IN ('admin', 'editor')));

CREATE POLICY staff_write_author ON infi_author
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM infi_profile p WHERE p.id = auth.uid() AND p.role IN ('admin', 'editor')));

CREATE POLICY staff_write_work ON infi_work
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM infi_profile p WHERE p.id = auth.uid() AND p.role IN ('admin', 'editor')));

CREATE POLICY staff_write_practice ON infi_practice
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM infi_profile p WHERE p.id = auth.uid() AND p.role IN ('admin', 'editor')));

CREATE POLICY staff_write_symbol ON infi_symbol
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM infi_profile p WHERE p.id = auth.uid() AND p.role IN ('admin', 'editor')));

CREATE POLICY staff_write_edge ON infi_edge
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM infi_profile p WHERE p.id = auth.uid() AND p.role IN ('admin', 'editor')));

CREATE POLICY staff_write_source ON infi_source
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM infi_profile p WHERE p.id = auth.uid() AND p.role IN ('admin', 'editor')));

CREATE POLICY staff_write_citation ON infi_citation
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM infi_profile p WHERE p.id = auth.uid() AND p.role IN ('admin', 'editor')));

CREATE POLICY staff_write_documentary ON infi_documentary
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM infi_profile p WHERE p.id = auth.uid() AND p.role IN ('admin', 'editor')));

CREATE POLICY staff_write_revision ON infi_revision
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM infi_profile p WHERE p.id = auth.uid() AND p.role IN ('admin', 'editor')));

CREATE POLICY staff_write_living_page ON infi_living_page
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM infi_profile p WHERE p.id = auth.uid() AND p.role IN ('admin', 'editor')));

CREATE POLICY staff_write_changelog ON infi_changelog_entry
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM infi_profile p WHERE p.id = auth.uid() AND p.role IN ('admin', 'editor')));

-- Translators can write translations for their assigned locales
CREATE POLICY translator_write_translation ON infi_translation
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM infi_profile p
      WHERE p.id = auth.uid()
      AND (p.role IN ('admin', 'editor') OR (p.role = 'translator' AND locale = ANY(p.locales)))
    )
  );

-- Anyone can insert suggestions
CREATE POLICY public_insert_suggestion ON infi_suggestion
  FOR INSERT WITH CHECK (true);

-- Table-level grants for RLS to take effect.
-- Scoped to Infinarad tables only: this schema is shared with other projects.
GRANT SELECT ON
  infi_locale, infi_collection, infi_region, infi_period, infi_question,
  infi_tradition, infi_concept, infi_author, infi_work, infi_practice,
  infi_symbol, infi_edge, infi_source, infi_citation, infi_documentary,
  infi_revision, infi_living_page, infi_living_page_citation,
  infi_changelog_entry, infi_suggestion, infi_translation, infi_slug_redirect,
  infi_embedding, infi_profile
TO anon;
GRANT SELECT ON
  infi_locale, infi_collection, infi_region, infi_period, infi_question,
  infi_tradition, infi_concept, infi_author, infi_work, infi_practice,
  infi_symbol, infi_edge, infi_source, infi_citation, infi_documentary,
  infi_revision, infi_living_page, infi_living_page_citation,
  infi_changelog_entry, infi_suggestion, infi_translation, infi_slug_redirect,
  infi_embedding, infi_profile
TO authenticated;
GRANT INSERT ON infi_suggestion TO anon;
GRANT ALL ON
  infi_locale, infi_collection, infi_region, infi_period, infi_question,
  infi_tradition, infi_concept, infi_author, infi_work, infi_practice,
  infi_symbol, infi_edge, infi_source, infi_citation, infi_documentary,
  infi_revision, infi_living_page, infi_living_page_citation,
  infi_changelog_entry, infi_suggestion, infi_translation, infi_slug_redirect,
  infi_embedding, infi_profile
TO authenticated;
