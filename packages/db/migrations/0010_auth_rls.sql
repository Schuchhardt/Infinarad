-- 0010_auth_rls.sql
-- User profiles and Row Level Security

CREATE TABLE profile (
  id         uuid PRIMARY KEY,
  role       user_role NOT NULL DEFAULT 'viewer',
  locales    text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on all content tables
ALTER TABLE locale ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection ENABLE ROW LEVEL SECURITY;
ALTER TABLE region ENABLE ROW LEVEL SECURITY;
ALTER TABLE period ENABLE ROW LEVEL SECURITY;
ALTER TABLE question ENABLE ROW LEVEL SECURITY;
ALTER TABLE tradition ENABLE ROW LEVEL SECURITY;
ALTER TABLE concept ENABLE ROW LEVEL SECURITY;
ALTER TABLE author ENABLE ROW LEVEL SECURITY;
ALTER TABLE work ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice ENABLE ROW LEVEL SECURITY;
ALTER TABLE symbol ENABLE ROW LEVEL SECURITY;
ALTER TABLE edge ENABLE ROW LEVEL SECURITY;
ALTER TABLE source ENABLE ROW LEVEL SECURITY;
ALTER TABLE citation ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentary ENABLE ROW LEVEL SECURITY;
ALTER TABLE revision ENABLE ROW LEVEL SECURITY;
ALTER TABLE living_page ENABLE ROW LEVEL SECURITY;
ALTER TABLE living_page_citation ENABLE ROW LEVEL SECURITY;
ALTER TABLE changelog_entry ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestion ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation ENABLE ROW LEVEL SECURITY;
ALTER TABLE slug_redirect ENABLE ROW LEVEL SECURITY;
ALTER TABLE embedding ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;

-- ===== PUBLIC READ POLICIES (anonymous) =====
-- Locales: anyone can read active locales
CREATE POLICY public_read_locale ON locale
  FOR SELECT USING (is_active = true);

-- Taxonomy: always public
CREATE POLICY public_read_collection ON collection
  FOR SELECT USING (status = 'published');

CREATE POLICY public_read_region ON region
  FOR SELECT USING (true);

CREATE POLICY public_read_period ON period
  FOR SELECT USING (true);

-- Graph nodes: only published
CREATE POLICY public_read_question ON question
  FOR SELECT USING (status = 'published');

CREATE POLICY public_read_tradition ON tradition
  FOR SELECT USING (status = 'published');

CREATE POLICY public_read_concept ON concept
  FOR SELECT USING (status = 'published');

CREATE POLICY public_read_author ON author
  FOR SELECT USING (status = 'published');

CREATE POLICY public_read_work ON work
  FOR SELECT USING (status = 'published');

CREATE POLICY public_read_practice ON practice
  FOR SELECT USING (status = 'published');

CREATE POLICY public_read_symbol ON symbol
  FOR SELECT USING (status = 'published');

-- Edges: only approved
CREATE POLICY public_read_edge ON edge
  FOR SELECT USING (approved_at IS NOT NULL);

-- Sources and citations: always public (they're references)
CREATE POLICY public_read_source ON source
  FOR SELECT USING (true);

CREATE POLICY public_read_citation ON citation
  FOR SELECT USING (true);

-- Content: only published
CREATE POLICY public_read_documentary ON documentary
  FOR SELECT USING (status = 'published');

-- Revisions: public can read (immutable anyway)
CREATE POLICY public_read_revision ON revision
  FOR SELECT USING (true);

CREATE POLICY public_read_living_page ON living_page
  FOR SELECT USING (status = 'published');

CREATE POLICY public_read_living_page_citation ON living_page_citation
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM living_page lp
      WHERE lp.id = living_page_id AND lp.status = 'published'
    )
  );

-- Changelog: only public entries
CREATE POLICY public_read_changelog ON changelog_entry
  FOR SELECT USING (is_public = true);

-- Suggestions: no public read
CREATE POLICY public_read_suggestion ON suggestion
  FOR SELECT USING (false);

-- Translations: public for published entity translations
CREATE POLICY public_read_translation ON translation
  FOR SELECT USING (true);

-- Slug redirects: public
CREATE POLICY public_read_slug_redirect ON slug_redirect
  FOR SELECT USING (true);

-- Embeddings: public
CREATE POLICY public_read_embedding ON embedding
  FOR SELECT USING (true);

-- Profile: only own
CREATE POLICY public_read_profile ON profile
  FOR SELECT USING (false);

-- ===== STAFF POLICIES (authenticated with non-viewer role) =====
-- Staff can read everything
CREATE POLICY staff_read_all_locale ON locale
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY staff_read_all_collection ON collection
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profile p WHERE p.id = auth.uid() AND p.role <> 'viewer'));

CREATE POLICY staff_read_all_question ON question
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profile p WHERE p.id = auth.uid() AND p.role <> 'viewer'));

CREATE POLICY staff_read_all_tradition ON tradition
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profile p WHERE p.id = auth.uid() AND p.role <> 'viewer'));

CREATE POLICY staff_read_all_concept ON concept
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profile p WHERE p.id = auth.uid() AND p.role <> 'viewer'));

CREATE POLICY staff_read_all_author ON author
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profile p WHERE p.id = auth.uid() AND p.role <> 'viewer'));

CREATE POLICY staff_read_all_work ON work
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profile p WHERE p.id = auth.uid() AND p.role <> 'viewer'));

CREATE POLICY staff_read_all_practice ON practice
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profile p WHERE p.id = auth.uid() AND p.role <> 'viewer'));

CREATE POLICY staff_read_all_symbol ON symbol
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profile p WHERE p.id = auth.uid() AND p.role <> 'viewer'));

CREATE POLICY staff_read_all_edge ON edge
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profile p WHERE p.id = auth.uid() AND p.role <> 'viewer'));

CREATE POLICY staff_read_all_documentary ON documentary
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profile p WHERE p.id = auth.uid() AND p.role <> 'viewer'));

CREATE POLICY staff_read_all_living_page ON living_page
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profile p WHERE p.id = auth.uid() AND p.role <> 'viewer'));

CREATE POLICY staff_read_all_suggestion ON suggestion
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profile p WHERE p.id = auth.uid() AND p.role <> 'viewer'));

CREATE POLICY staff_read_all_changelog ON changelog_entry
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profile p WHERE p.id = auth.uid() AND p.role <> 'viewer'));

CREATE POLICY staff_read_own_profile ON profile
  FOR SELECT TO authenticated
  USING (id = auth.uid());

-- Staff write policies (admin and editor)
CREATE POLICY staff_write_collection ON collection
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profile p WHERE p.id = auth.uid() AND p.role IN ('admin', 'editor')));

CREATE POLICY staff_write_question ON question
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profile p WHERE p.id = auth.uid() AND p.role IN ('admin', 'editor')));

CREATE POLICY staff_write_tradition ON tradition
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profile p WHERE p.id = auth.uid() AND p.role IN ('admin', 'editor')));

CREATE POLICY staff_write_concept ON concept
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profile p WHERE p.id = auth.uid() AND p.role IN ('admin', 'editor')));

CREATE POLICY staff_write_author ON author
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profile p WHERE p.id = auth.uid() AND p.role IN ('admin', 'editor')));

CREATE POLICY staff_write_work ON work
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profile p WHERE p.id = auth.uid() AND p.role IN ('admin', 'editor')));

CREATE POLICY staff_write_practice ON practice
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profile p WHERE p.id = auth.uid() AND p.role IN ('admin', 'editor')));

CREATE POLICY staff_write_symbol ON symbol
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profile p WHERE p.id = auth.uid() AND p.role IN ('admin', 'editor')));

CREATE POLICY staff_write_edge ON edge
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profile p WHERE p.id = auth.uid() AND p.role IN ('admin', 'editor')));

CREATE POLICY staff_write_source ON source
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profile p WHERE p.id = auth.uid() AND p.role IN ('admin', 'editor')));

CREATE POLICY staff_write_citation ON citation
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profile p WHERE p.id = auth.uid() AND p.role IN ('admin', 'editor')));

CREATE POLICY staff_write_documentary ON documentary
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profile p WHERE p.id = auth.uid() AND p.role IN ('admin', 'editor')));

CREATE POLICY staff_write_revision ON revision
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profile p WHERE p.id = auth.uid() AND p.role IN ('admin', 'editor')));

CREATE POLICY staff_write_living_page ON living_page
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profile p WHERE p.id = auth.uid() AND p.role IN ('admin', 'editor')));

CREATE POLICY staff_write_changelog ON changelog_entry
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profile p WHERE p.id = auth.uid() AND p.role IN ('admin', 'editor')));

-- Translators can write translations for their assigned locales
CREATE POLICY translator_write_translation ON translation
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profile p
      WHERE p.id = auth.uid()
      AND (p.role IN ('admin', 'editor') OR (p.role = 'translator' AND locale = ANY(p.locales)))
    )
  );

-- Anyone can insert suggestions
CREATE POLICY public_insert_suggestion ON suggestion
  FOR INSERT WITH CHECK (true);

-- Table-level grants for RLS to take effect
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT ON suggestion TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
