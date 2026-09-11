import { sql } from "../connection";

/**
 * Research queries: everything the video pipeline (and the `pnpm research` CLI)
 * needs to assemble a brief for one question seen through one tradition.
 *
 * Translations are always read from the `infi_translated` view, which already
 * resolves the locale -> fallback -> master chain, so callers only ever need a
 * single join per field.
 */

export interface QuestionRow {
  id: string;
  slug: string;
  title: string;
  summary: string;
}

export interface TraditionRow {
  id: string;
  slug: string;
  name: string;
  summary: string;
  collection_name: string | null;
  era_start: number | null;
  era_end: number | null;
}

export interface ConceptRow {
  id: string;
  slug: string;
  name: string;
  summary: string;
  original_term: string | null;
  original_script: string | null;
  transliteration: string | null;
  tradition_name: string | null;
}

export interface AuthorRow {
  id: string;
  slug: string;
  name: string;
  summary: string;
  birth_year: number | null;
  death_year: number | null;
}

export interface WorkRow {
  id: string;
  slug: string;
  name: string;
  summary: string;
  author_name: string | null;
  original_language: string | null;
  composed_start: number | null;
  composed_end: number | null;
}

export interface PracticeRow {
  id: string;
  slug: string;
  name: string;
  summary: string;
}

export interface SymbolRow {
  id: string;
  slug: string;
  name: string;
  summary: string;
  unicode_char: string | null;
}

export interface CitationRow {
  id: string;
  source_title: string;
  source_kind: string;
  source_author: string | null;
  source_year: number | null;
  source_publisher: string | null;
  source_url: string | null;
  source_doi: string | null;
  source_isbn: string | null;
  source_license: string;
  source_quotable: boolean;
  locator: string;
  claim_text: string;
  quote: string | null;
}

export interface EdgeRow {
  from_type: string;
  from_id: string;
  to_type: string;
  to_id: string;
  to_name: string;
  relation: string;
  weight: number;
}

export interface DerivedTraditionRow {
  id: string;
  slug: string;
  name: string;
  relation: string;
}

export async function findQuestion(
  term: string,
  locale: string,
): Promise<QuestionRow | null> {
  // Exact slug first — the pipeline always addresses questions by slug.
  const exact = await sql<QuestionRow[]>`
    SELECT q.id, q.slug,
      COALESCE(t.value, q.slug) AS title,
      COALESCE(ts.value, '') AS summary
    FROM infi_question q
    LEFT JOIN infi_translated t ON t.entity_type='question' AND t.entity_id=q.id
      AND t.locale=${locale} AND t.field='title'
    LEFT JOIN infi_translated ts ON ts.entity_type='question' AND ts.entity_id=q.id
      AND ts.locale=${locale} AND ts.field='summary'
    WHERE q.slug = ${term} AND q.status = 'published'
  `;
  if (exact[0]) return exact[0];

  const fuzzy = await sql<QuestionRow[]>`
    SELECT q.id, q.slug,
      COALESCE(t.value, q.slug) AS title,
      COALESCE(ts.value, '') AS summary
    FROM infi_question q
    LEFT JOIN infi_translated t ON t.entity_type='question' AND t.entity_id=q.id
      AND t.locale=${locale} AND t.field='title'
    LEFT JOIN infi_translated ts ON ts.entity_type='question' AND ts.entity_id=q.id
      AND ts.locale=${locale} AND ts.field='summary'
    WHERE q.status = 'published'
      AND (
        q.slug ILIKE '%' || ${term} || '%'
        OR infi_immutable_unaccent(COALESCE(t.value, '')) ILIKE '%' || infi_immutable_unaccent(${term}) || '%'
      )
    ORDER BY q.sort_order LIMIT 1
  `;
  return fuzzy[0] ?? null;
}

export async function findTradition(
  term: string,
  locale: string,
): Promise<TraditionRow | null> {
  const exact = await sql<TraditionRow[]>`
    SELECT t.id, t.slug, t.era_start, t.era_end,
      COALESCE(tn.value, t.slug) AS name,
      COALESCE(ts.value, '') AS summary,
      tc.value AS collection_name
    FROM infi_tradition t
    LEFT JOIN infi_translated tn ON tn.entity_type='tradition' AND tn.entity_id=t.id
      AND tn.locale=${locale} AND tn.field='name'
    LEFT JOIN infi_translated ts ON ts.entity_type='tradition' AND ts.entity_id=t.id
      AND ts.locale=${locale} AND ts.field='summary'
    LEFT JOIN infi_translated tc ON tc.entity_type='collection' AND tc.entity_id=t.collection_id
      AND tc.locale=${locale} AND tc.field='name'
    WHERE t.slug = ${term} AND t.status = 'published'
  `;
  if (exact[0]) return exact[0];

  const fuzzy = await sql<TraditionRow[]>`
    SELECT t.id, t.slug, t.era_start, t.era_end,
      COALESCE(tn.value, t.slug) AS name,
      COALESCE(ts.value, '') AS summary,
      tc.value AS collection_name
    FROM infi_tradition t
    LEFT JOIN infi_translated tn ON tn.entity_type='tradition' AND tn.entity_id=t.id
      AND tn.locale=${locale} AND tn.field='name'
    LEFT JOIN infi_translated ts ON ts.entity_type='tradition' AND ts.entity_id=t.id
      AND ts.locale=${locale} AND ts.field='summary'
    LEFT JOIN infi_translated tc ON tc.entity_type='collection' AND tc.entity_id=t.collection_id
      AND tc.locale=${locale} AND tc.field='name'
    WHERE t.status = 'published'
      AND (
        t.slug ILIKE '%' || ${term} || '%'
        OR infi_immutable_unaccent(COALESCE(tn.value, '')) ILIKE '%' || infi_immutable_unaccent(${term}) || '%'
      )
    LIMIT 1
  `;
  return fuzzy[0] ?? null;
}

export async function getConceptsForQuestionAndTradition(
  questionId: string,
  traditionId: string | null,
  locale: string,
): Promise<ConceptRow[]> {
  if (traditionId) {
    return sql<ConceptRow[]>`
      SELECT c.id, c.slug, c.original_term, c.original_script, c.transliteration,
        COALESCE(tn.value, c.slug) AS name,
        COALESCE(ts.value, '') AS summary,
        tt.value AS tradition_name
      FROM infi_edge eq
      JOIN infi_concept c ON c.id = eq.to_id AND c.status = 'published'
      LEFT JOIN infi_edge et ON et.from_type='concept' AND et.from_id=c.id
        AND et.to_type='tradition' AND et.to_id=${traditionId}
        AND et.approved_at IS NOT NULL
      LEFT JOIN infi_translated tn ON tn.entity_type='concept' AND tn.entity_id=c.id
        AND tn.locale=${locale} AND tn.field='name'
      LEFT JOIN infi_translated ts ON ts.entity_type='concept' AND ts.entity_id=c.id
        AND ts.locale=${locale} AND ts.field='summary'
      LEFT JOIN infi_translated tt ON tt.entity_type='tradition' AND tt.entity_id=c.tradition_id
        AND tt.locale=${locale} AND tt.field='name'
      WHERE eq.from_type='question' AND eq.from_id=${questionId}
        AND eq.to_type='concept' AND eq.approved_at IS NOT NULL
        AND (c.tradition_id = ${traditionId} OR et.id IS NOT NULL)
      ORDER BY eq.weight DESC
    `;
  }

  return sql<ConceptRow[]>`
    SELECT c.id, c.slug, c.original_term, c.original_script, c.transliteration,
      COALESCE(tn.value, c.slug) AS name,
      COALESCE(ts.value, '') AS summary,
      tt.value AS tradition_name
    FROM infi_edge eq
    JOIN infi_concept c ON c.id = eq.to_id AND c.status = 'published'
    LEFT JOIN infi_translated tn ON tn.entity_type='concept' AND tn.entity_id=c.id
      AND tn.locale=${locale} AND tn.field='name'
    LEFT JOIN infi_translated ts ON ts.entity_type='concept' AND ts.entity_id=c.id
      AND ts.locale=${locale} AND ts.field='summary'
    LEFT JOIN infi_translated tt ON tt.entity_type='tradition' AND tt.entity_id=c.tradition_id
      AND tt.locale=${locale} AND tt.field='name'
    WHERE eq.from_type='question' AND eq.from_id=${questionId}
      AND eq.to_type='concept' AND eq.approved_at IS NOT NULL
    ORDER BY eq.weight DESC
  `;
}

export async function getRelatedConcepts(
  conceptIds: string[],
  locale: string,
): Promise<EdgeRow[]> {
  if (conceptIds.length === 0) return [];
  return sql<EdgeRow[]>`
    SELECT e.from_type, e.from_id, e.to_type, e.to_id, e.relation,
      e.weight::float AS weight,
      COALESCE(tn.value, e.to_id) AS to_name
    FROM infi_edge e
    LEFT JOIN infi_translated tn ON tn.entity_type=e.to_type AND tn.entity_id=e.to_id
      AND tn.locale=${locale} AND tn.field='name'
    WHERE e.from_type='concept' AND e.from_id = ANY(${conceptIds})
      AND e.to_type='concept' AND e.approved_at IS NOT NULL
    ORDER BY e.weight DESC
  `;
}

export async function getAuthors(
  traditionId: string,
  locale: string,
): Promise<AuthorRow[]> {
  return sql<AuthorRow[]>`
    SELECT a.id, a.slug, a.birth_year, a.death_year,
      COALESCE(tn.value, a.slug) AS name,
      COALESCE(ts.value, '') AS summary
    FROM infi_author a
    LEFT JOIN infi_translated tn ON tn.entity_type='author' AND tn.entity_id=a.id
      AND tn.locale=${locale} AND tn.field='name'
    LEFT JOIN infi_translated ts ON ts.entity_type='author' AND ts.entity_id=a.id
      AND ts.locale=${locale} AND ts.field='summary'
    WHERE a.tradition_id = ${traditionId} AND a.status = 'published'
    ORDER BY a.birth_year NULLS LAST
  `;
}

export async function getWorks(
  traditionId: string,
  locale: string,
): Promise<WorkRow[]> {
  return sql<WorkRow[]>`
    SELECT w.id, w.slug, w.original_language, w.composed_start, w.composed_end,
      COALESCE(tn.value, w.slug) AS name,
      COALESCE(ts.value, '') AS summary,
      ta.value AS author_name
    FROM infi_work w
    LEFT JOIN infi_translated tn ON tn.entity_type='work' AND tn.entity_id=w.id
      AND tn.locale=${locale} AND tn.field='name'
    LEFT JOIN infi_translated ts ON ts.entity_type='work' AND ts.entity_id=w.id
      AND ts.locale=${locale} AND ts.field='summary'
    LEFT JOIN infi_translated ta ON ta.entity_type='author' AND ta.entity_id=w.author_id
      AND ta.locale=${locale} AND ta.field='name'
    WHERE w.tradition_id = ${traditionId} AND w.status = 'published'
    ORDER BY w.composed_start NULLS LAST
  `;
}

export async function getPractices(
  traditionId: string,
  locale: string,
): Promise<PracticeRow[]> {
  return sql<PracticeRow[]>`
    SELECT p.id, p.slug,
      COALESCE(tn.value, p.slug) AS name,
      COALESCE(ts.value, '') AS summary
    FROM infi_practice p
    LEFT JOIN infi_translated tn ON tn.entity_type='practice' AND tn.entity_id=p.id
      AND tn.locale=${locale} AND tn.field='name'
    LEFT JOIN infi_translated ts ON ts.entity_type='practice' AND ts.entity_id=p.id
      AND ts.locale=${locale} AND ts.field='summary'
    WHERE p.tradition_id = ${traditionId} AND p.status = 'published'
  `;
}

export async function getSymbols(
  traditionId: string,
  locale: string,
): Promise<SymbolRow[]> {
  return sql<SymbolRow[]>`
    SELECT s.id, s.slug, s.unicode_char,
      COALESCE(tn.value, s.slug) AS name,
      COALESCE(ts.value, '') AS summary
    FROM infi_symbol s
    LEFT JOIN infi_translated tn ON tn.entity_type='symbol' AND tn.entity_id=s.id
      AND tn.locale=${locale} AND tn.field='name'
    LEFT JOIN infi_translated ts ON ts.entity_type='symbol' AND ts.entity_id=s.id
      AND ts.locale=${locale} AND ts.field='summary'
    WHERE s.tradition_id = ${traditionId} AND s.status = 'published'
  `;
}

export async function getCitations(
  questionId: string,
  traditionId: string | null,
): Promise<CitationRow[]> {
  if (traditionId) {
    return sql<CitationRow[]>`
      SELECT ct.id, s.title AS source_title, s.kind AS source_kind,
        s.author_name AS source_author, s.year AS source_year,
        s.publisher AS source_publisher, s.url_canonical AS source_url,
        s.doi AS source_doi, s.isbn AS source_isbn, s.license AS source_license,
        s.quotable AS source_quotable,
        ct.locator, ct.claim_text, ct.quote
      FROM infi_living_page lp
      JOIN infi_documentary d ON d.id = lp.documentary_id
      JOIN infi_living_page_citation lpc ON lpc.living_page_id = lp.id
      JOIN infi_citation ct ON ct.id = lpc.citation_id
      JOIN infi_source s ON s.id = ct.source_id
      WHERE lp.question_id = ${questionId}
        AND d.tradition_id = ${traditionId}
        AND lp.status = 'published'
      ORDER BY s.reliability_tier, s.year NULLS LAST
    `;
  }

  return sql<CitationRow[]>`
    SELECT ct.id, s.title AS source_title, s.kind AS source_kind,
      s.author_name AS source_author, s.year AS source_year,
      s.publisher AS source_publisher, s.url_canonical AS source_url,
      s.doi AS source_doi, s.isbn AS source_isbn, s.license AS source_license,
      s.quotable AS source_quotable,
      ct.locator, ct.claim_text, ct.quote
    FROM infi_living_page lp
    JOIN infi_living_page_citation lpc ON lpc.living_page_id = lp.id
    JOIN infi_citation ct ON ct.id = lpc.citation_id
    JOIN infi_source s ON s.id = ct.source_id
    WHERE lp.question_id = ${questionId}
      AND lp.status = 'published'
    ORDER BY s.reliability_tier, s.year NULLS LAST
  `;
}

export async function getDerivedTraditions(
  traditionId: string,
  locale: string,
): Promise<DerivedTraditionRow[]> {
  return sql<DerivedTraditionRow[]>`
    SELECT t.id, t.slug, e.relation,
      COALESCE(tn.value, t.slug) AS name
    FROM infi_edge e
    JOIN infi_tradition t ON (
      (e.from_type='tradition' AND e.from_id=${traditionId} AND t.id=e.to_id)
      OR (e.to_type='tradition' AND e.to_id=${traditionId} AND t.id=e.from_id)
    )
    LEFT JOIN infi_translated tn ON tn.entity_type='tradition' AND tn.entity_id=t.id
      AND tn.locale=${locale} AND tn.field='name'
    WHERE (
        (e.from_type='tradition' AND e.from_id=${traditionId} AND e.to_type='tradition')
        OR (e.to_type='tradition' AND e.to_id=${traditionId} AND e.from_type='tradition')
      )
      AND e.approved_at IS NOT NULL
      AND t.status = 'published'
  `;
}

export async function getAllTraditionsForQuestion(
  questionId: string,
  locale: string,
): Promise<TraditionRow[]> {
  return sql<TraditionRow[]>`
    SELECT DISTINCT ON (t.id)
      t.id, t.slug, t.era_start, t.era_end,
      COALESCE(tn.value, t.slug) AS name,
      COALESCE(ts.value, '') AS summary,
      tc.value AS collection_name
    FROM infi_edge e1
    JOIN infi_concept c ON c.id = e1.to_id AND c.status = 'published'
    JOIN infi_edge e2 ON e2.from_type='concept' AND e2.from_id=c.id
      AND e2.to_type='tradition' AND e2.approved_at IS NOT NULL
    JOIN infi_tradition t ON t.id = e2.to_id AND t.status = 'published'
    LEFT JOIN infi_translated tn ON tn.entity_type='tradition' AND tn.entity_id=t.id
      AND tn.locale=${locale} AND tn.field='name'
    LEFT JOIN infi_translated ts ON ts.entity_type='tradition' AND ts.entity_id=t.id
      AND ts.locale=${locale} AND ts.field='summary'
    LEFT JOIN infi_translated tc ON tc.entity_type='collection' AND tc.entity_id=t.collection_id
      AND tc.locale=${locale} AND tc.field='name'
    WHERE e1.from_type='question' AND e1.from_id=${questionId}
      AND e1.to_type='concept' AND e1.approved_at IS NOT NULL
    ORDER BY t.id
  `;
}
