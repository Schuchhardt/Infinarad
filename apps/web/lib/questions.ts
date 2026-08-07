import { sql } from "@infinarad/db";

export interface QuestionDetail {
  id: string;
  slug: string;
  status: string;
  is_featured: boolean;
  title: string;
  summary: string;
  is_fallback: boolean;
}

export interface RelatedConcept {
  id: string;
  slug: string;
  original_term: string | null;
  original_script: string | null;
  transliteration: string | null;
  name: string;
  summary: string;
  is_fallback: boolean;
  tradition_id: string | null;
  tradition_name: string | null;
  relation: string;
  weight: number;
}

export interface RelatedTradition {
  id: string;
  slug: string;
  name: string;
  summary: string;
  is_fallback: boolean;
  collection_name: string | null;
}

export interface RelatedAuthor {
  id: string;
  slug: string;
  name: string;
  summary: string;
  is_fallback: boolean;
  birth_year: number | null;
  death_year: number | null;
}

export interface RelatedWork {
  id: string;
  slug: string;
  name: string;
  summary: string;
  is_fallback: boolean;
  author_name: string | null;
  original_language: string | null;
  composed_start: number | null;
  composed_end: number | null;
}

export interface RelatedPractice {
  id: string;
  slug: string;
  name: string;
  summary: string;
  is_fallback: boolean;
  tradition_name: string | null;
}

export interface RelatedSymbol {
  id: string;
  slug: string;
  name: string;
  summary: string;
  is_fallback: boolean;
  unicode_char: string | null;
  tradition_name: string | null;
}

export interface DocumentaryData {
  id: string;
  slug: string;
  angle_slug: string;
  youtube_id: string | null;
  duration_sec: number | null;
  name: string;
  summary: string;
  is_fallback: boolean;
  tradition_name: string | null;
}

export interface SourceData {
  id: string;
  kind: string;
  title: string;
  author_name: string | null;
  year: number | null;
  publisher: string | null;
  url_canonical: string | null;
  doi: string | null;
  isbn: string | null;
  locator: string;
  claim_text: string;
  quote: string | null;
}

export interface SearchResult {
  id: string;
  slug: string;
  title: string;
  summary: string;
  is_fallback: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function safeQuery<T>(fn: () => Promise<T>, fallback: any): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback as T;
  }
}

export async function getQuestionBySlug(
  slug: string,
  locale: string,
): Promise<QuestionDetail | null> {
  return safeQuery(async () => {
    const rows = await sql<QuestionDetail[]>`
      SELECT
        q.id,
        q.slug,
        q.status,
        q.is_featured,
        COALESCE(t_title.value, t_title_en.value, q.slug) AS title,
        COALESCE(t_summary.value, t_summary_en.value, '') AS summary,
        (t_title.value IS NULL) AS is_fallback
      FROM infi_question q
      LEFT JOIN infi_translation t_title
        ON t_title.entity_type = 'question'
        AND t_title.entity_id = q.id
        AND t_title.locale = ${locale}
        AND t_title.field = 'title'
      LEFT JOIN infi_translation t_title_en
        ON t_title_en.entity_type = 'question'
        AND t_title_en.entity_id = q.id
        AND t_title_en.locale = 'en'
        AND t_title_en.field = 'title'
      LEFT JOIN infi_translation t_summary
        ON t_summary.entity_type = 'question'
        AND t_summary.entity_id = q.id
        AND t_summary.locale = ${locale}
        AND t_summary.field = 'summary'
      LEFT JOIN infi_translation t_summary_en
        ON t_summary_en.entity_type = 'question'
        AND t_summary_en.entity_id = q.id
        AND t_summary_en.locale = 'en'
        AND t_summary_en.field = 'summary'
      WHERE q.slug = ${slug}
        AND q.status = 'published'
    `;
    return rows[0] ?? null;
  }, null);
}

export async function getRelatedConcepts(
  questionId: string,
  locale: string,
): Promise<RelatedConcept[]> {
  return safeQuery(
    () =>
      sql<RelatedConcept[]>`
        SELECT
          c.id,
          c.slug,
          c.original_term,
          c.original_script,
          c.transliteration,
          COALESCE(t_name.value, t_name_en.value, c.slug) AS name,
          COALESCE(t_summ.value, t_summ_en.value, '') AS summary,
          (t_name.value IS NULL) AS is_fallback,
          c.tradition_id,
          COALESCE(t_trd.value, t_trd_en.value) AS tradition_name,
          e.relation,
          e.weight::float AS weight
        FROM infi_edge e
        JOIN infi_concept c ON c.id = e.to_id AND c.status = 'published'
        LEFT JOIN infi_translation t_name
          ON t_name.entity_type = 'concept' AND t_name.entity_id = c.id
          AND t_name.locale = ${locale} AND t_name.field = 'name'
        LEFT JOIN infi_translation t_name_en
          ON t_name_en.entity_type = 'concept' AND t_name_en.entity_id = c.id
          AND t_name_en.locale = 'en' AND t_name_en.field = 'name'
        LEFT JOIN infi_translation t_summ
          ON t_summ.entity_type = 'concept' AND t_summ.entity_id = c.id
          AND t_summ.locale = ${locale} AND t_summ.field = 'summary'
        LEFT JOIN infi_translation t_summ_en
          ON t_summ_en.entity_type = 'concept' AND t_summ_en.entity_id = c.id
          AND t_summ_en.locale = 'en' AND t_summ_en.field = 'summary'
        LEFT JOIN infi_translation t_trd
          ON t_trd.entity_type = 'tradition' AND t_trd.entity_id = c.tradition_id
          AND t_trd.locale = ${locale} AND t_trd.field = 'name'
        LEFT JOIN infi_translation t_trd_en
          ON t_trd_en.entity_type = 'tradition' AND t_trd_en.entity_id = c.tradition_id
          AND t_trd_en.locale = 'en' AND t_trd_en.field = 'name'
        WHERE e.from_type = 'question'
          AND e.from_id = ${questionId}
          AND e.to_type = 'concept'
          AND e.approved_at IS NOT NULL
        ORDER BY e.weight DESC
      `,
    [],
  );
}

export async function getRelatedTraditions(
  questionId: string,
  locale: string,
): Promise<RelatedTradition[]> {
  return safeQuery(
    () =>
      sql<RelatedTradition[]>`
        SELECT DISTINCT ON (t.id)
          t.id,
          t.slug,
          COALESCE(t_name.value, t_name_en.value, t.slug) AS name,
          COALESCE(t_summ.value, t_summ_en.value, '') AS summary,
          (t_name.value IS NULL) AS is_fallback,
          COALESCE(t_col.value, t_col_en.value) AS collection_name
        FROM infi_edge e1
        JOIN infi_concept c ON c.id = e1.to_id AND c.status = 'published'
        JOIN infi_edge e2 ON e2.from_type = 'concept' AND e2.from_id = c.id
          AND e2.to_type = 'tradition' AND e2.approved_at IS NOT NULL
        JOIN infi_tradition t ON t.id = e2.to_id AND t.status = 'published'
        LEFT JOIN infi_translation t_name
          ON t_name.entity_type = 'tradition' AND t_name.entity_id = t.id
          AND t_name.locale = ${locale} AND t_name.field = 'name'
        LEFT JOIN infi_translation t_name_en
          ON t_name_en.entity_type = 'tradition' AND t_name_en.entity_id = t.id
          AND t_name_en.locale = 'en' AND t_name_en.field = 'name'
        LEFT JOIN infi_translation t_summ
          ON t_summ.entity_type = 'tradition' AND t_summ.entity_id = t.id
          AND t_summ.locale = ${locale} AND t_summ.field = 'summary'
        LEFT JOIN infi_translation t_summ_en
          ON t_summ_en.entity_type = 'tradition' AND t_summ_en.entity_id = t.id
          AND t_summ_en.locale = 'en' AND t_summ_en.field = 'summary'
        LEFT JOIN infi_translation t_col
          ON t_col.entity_type = 'collection' AND t_col.entity_id = t.collection_id
          AND t_col.locale = ${locale} AND t_col.field = 'name'
        LEFT JOIN infi_translation t_col_en
          ON t_col_en.entity_type = 'collection' AND t_col_en.entity_id = t.collection_id
          AND t_col_en.locale = 'en' AND t_col_en.field = 'name'
        WHERE e1.from_type = 'question'
          AND e1.from_id = ${questionId}
          AND e1.to_type = 'concept'
          AND e1.approved_at IS NOT NULL
        ORDER BY t.id
      `,
    [],
  );
}

export async function getRelatedAuthors(
  traditionIds: string[],
  locale: string,
): Promise<RelatedAuthor[]> {
  if (traditionIds.length === 0) return [];
  return safeQuery(
    () =>
      sql<RelatedAuthor[]>`
        SELECT
          a.id,
          a.slug,
          COALESCE(t_name.value, t_name_en.value, a.slug) AS name,
          COALESCE(t_summ.value, t_summ_en.value, '') AS summary,
          (t_name.value IS NULL) AS is_fallback,
          a.birth_year,
          a.death_year
        FROM infi_author a
        LEFT JOIN infi_translation t_name
          ON t_name.entity_type = 'author' AND t_name.entity_id = a.id
          AND t_name.locale = ${locale} AND t_name.field = 'name'
        LEFT JOIN infi_translation t_name_en
          ON t_name_en.entity_type = 'author' AND t_name_en.entity_id = a.id
          AND t_name_en.locale = 'en' AND t_name_en.field = 'name'
        LEFT JOIN infi_translation t_summ
          ON t_summ.entity_type = 'author' AND t_summ.entity_id = a.id
          AND t_summ.locale = ${locale} AND t_summ.field = 'summary'
        LEFT JOIN infi_translation t_summ_en
          ON t_summ_en.entity_type = 'author' AND t_summ_en.entity_id = a.id
          AND t_summ_en.locale = 'en' AND t_summ_en.field = 'summary'
        WHERE a.tradition_id = ANY(${traditionIds})
          AND a.status = 'published'
        ORDER BY a.birth_year NULLS LAST
      `,
    [],
  );
}

export async function getRelatedWorks(
  traditionIds: string[],
  locale: string,
): Promise<RelatedWork[]> {
  if (traditionIds.length === 0) return [];
  return safeQuery(
    () =>
      sql<RelatedWork[]>`
        SELECT
          w.id,
          w.slug,
          COALESCE(t_name.value, t_name_en.value, w.slug) AS name,
          COALESCE(t_summ.value, t_summ_en.value, '') AS summary,
          (t_name.value IS NULL) AS is_fallback,
          COALESCE(t_aut.value, t_aut_en.value) AS author_name,
          w.original_language,
          w.composed_start,
          w.composed_end
        FROM infi_work w
        LEFT JOIN infi_translation t_name
          ON t_name.entity_type = 'work' AND t_name.entity_id = w.id
          AND t_name.locale = ${locale} AND t_name.field = 'name'
        LEFT JOIN infi_translation t_name_en
          ON t_name_en.entity_type = 'work' AND t_name_en.entity_id = w.id
          AND t_name_en.locale = 'en' AND t_name_en.field = 'name'
        LEFT JOIN infi_translation t_summ
          ON t_summ.entity_type = 'work' AND t_summ.entity_id = w.id
          AND t_summ.locale = ${locale} AND t_summ.field = 'summary'
        LEFT JOIN infi_translation t_summ_en
          ON t_summ_en.entity_type = 'work' AND t_summ_en.entity_id = w.id
          AND t_summ_en.locale = 'en' AND t_summ_en.field = 'summary'
        LEFT JOIN infi_translation t_aut
          ON t_aut.entity_type = 'author' AND t_aut.entity_id = w.author_id
          AND t_aut.locale = ${locale} AND t_aut.field = 'name'
        LEFT JOIN infi_translation t_aut_en
          ON t_aut_en.entity_type = 'author' AND t_aut_en.entity_id = w.author_id
          AND t_aut_en.locale = 'en' AND t_aut_en.field = 'name'
        WHERE w.tradition_id = ANY(${traditionIds})
          AND w.status = 'published'
        ORDER BY w.composed_start NULLS LAST
      `,
    [],
  );
}

export async function getRelatedPractices(
  traditionIds: string[],
  locale: string,
): Promise<RelatedPractice[]> {
  if (traditionIds.length === 0) return [];
  return safeQuery(
    () =>
      sql<RelatedPractice[]>`
        SELECT
          p.id,
          p.slug,
          COALESCE(t_name.value, t_name_en.value, p.slug) AS name,
          COALESCE(t_summ.value, t_summ_en.value, '') AS summary,
          (t_name.value IS NULL) AS is_fallback,
          COALESCE(t_trd.value, t_trd_en.value) AS tradition_name
        FROM infi_practice p
        LEFT JOIN infi_translation t_name
          ON t_name.entity_type = 'practice' AND t_name.entity_id = p.id
          AND t_name.locale = ${locale} AND t_name.field = 'name'
        LEFT JOIN infi_translation t_name_en
          ON t_name_en.entity_type = 'practice' AND t_name_en.entity_id = p.id
          AND t_name_en.locale = 'en' AND t_name_en.field = 'name'
        LEFT JOIN infi_translation t_summ
          ON t_summ.entity_type = 'practice' AND t_summ.entity_id = p.id
          AND t_summ.locale = ${locale} AND t_summ.field = 'summary'
        LEFT JOIN infi_translation t_summ_en
          ON t_summ_en.entity_type = 'practice' AND t_summ_en.entity_id = p.id
          AND t_summ_en.locale = 'en' AND t_summ_en.field = 'summary'
        LEFT JOIN infi_translation t_trd
          ON t_trd.entity_type = 'tradition' AND t_trd.entity_id = p.tradition_id
          AND t_trd.locale = ${locale} AND t_trd.field = 'name'
        LEFT JOIN infi_translation t_trd_en
          ON t_trd_en.entity_type = 'tradition' AND t_trd_en.entity_id = p.tradition_id
          AND t_trd_en.locale = 'en' AND t_trd_en.field = 'name'
        WHERE p.tradition_id = ANY(${traditionIds})
          AND p.status = 'published'
      `,
    [],
  );
}

export async function getRelatedSymbols(
  traditionIds: string[],
  locale: string,
): Promise<RelatedSymbol[]> {
  if (traditionIds.length === 0) return [];
  return safeQuery(
    () =>
      sql<RelatedSymbol[]>`
        SELECT
          s.id,
          s.slug,
          COALESCE(t_name.value, t_name_en.value, s.slug) AS name,
          COALESCE(t_summ.value, t_summ_en.value, '') AS summary,
          (t_name.value IS NULL) AS is_fallback,
          s.unicode_char,
          COALESCE(t_trd.value, t_trd_en.value) AS tradition_name
        FROM infi_symbol s
        LEFT JOIN infi_translation t_name
          ON t_name.entity_type = 'symbol' AND t_name.entity_id = s.id
          AND t_name.locale = ${locale} AND t_name.field = 'name'
        LEFT JOIN infi_translation t_name_en
          ON t_name_en.entity_type = 'symbol' AND t_name_en.entity_id = s.id
          AND t_name_en.locale = 'en' AND t_name_en.field = 'name'
        LEFT JOIN infi_translation t_summ
          ON t_summ.entity_type = 'symbol' AND t_summ.entity_id = s.id
          AND t_summ.locale = ${locale} AND t_summ.field = 'summary'
        LEFT JOIN infi_translation t_summ_en
          ON t_summ_en.entity_type = 'symbol' AND t_summ_en.entity_id = s.id
          AND t_summ_en.locale = 'en' AND t_summ_en.field = 'summary'
        LEFT JOIN infi_translation t_trd
          ON t_trd.entity_type = 'tradition' AND t_trd.entity_id = s.tradition_id
          AND t_trd.locale = ${locale} AND t_trd.field = 'name'
        LEFT JOIN infi_translation t_trd_en
          ON t_trd_en.entity_type = 'tradition' AND t_trd_en.entity_id = s.tradition_id
          AND t_trd_en.locale = 'en' AND t_trd_en.field = 'name'
        WHERE s.tradition_id = ANY(${traditionIds})
          AND s.status = 'published'
      `,
    [],
  );
}

export async function getDocumentaries(
  questionId: string,
  locale: string,
): Promise<DocumentaryData[]> {
  return safeQuery(
    () =>
      sql<DocumentaryData[]>`
        SELECT
          d.id,
          d.slug,
          d.angle_slug,
          d.youtube_id,
          d.duration_sec,
          COALESCE(t_name.value, t_name_en.value, d.slug) AS name,
          COALESCE(t_summ.value, t_summ_en.value, '') AS summary,
          (t_name.value IS NULL) AS is_fallback,
          COALESCE(t_trd.value, t_trd_en.value) AS tradition_name
        FROM infi_documentary d
        LEFT JOIN infi_translation t_name
          ON t_name.entity_type = 'documentary' AND t_name.entity_id = d.id
          AND t_name.locale = ${locale} AND t_name.field = 'name'
        LEFT JOIN infi_translation t_name_en
          ON t_name_en.entity_type = 'documentary' AND t_name_en.entity_id = d.id
          AND t_name_en.locale = 'en' AND t_name_en.field = 'name'
        LEFT JOIN infi_translation t_summ
          ON t_summ.entity_type = 'documentary' AND t_summ.entity_id = d.id
          AND t_summ.locale = ${locale} AND t_summ.field = 'summary'
        LEFT JOIN infi_translation t_summ_en
          ON t_summ_en.entity_type = 'documentary' AND t_summ_en.entity_id = d.id
          AND t_summ_en.locale = 'en' AND t_summ_en.field = 'summary'
        LEFT JOIN infi_translation t_trd
          ON t_trd.entity_type = 'tradition' AND t_trd.entity_id = d.tradition_id
          AND t_trd.locale = ${locale} AND t_trd.field = 'name'
        LEFT JOIN infi_translation t_trd_en
          ON t_trd_en.entity_type = 'tradition' AND t_trd_en.entity_id = d.tradition_id
          AND t_trd_en.locale = 'en' AND t_trd_en.field = 'name'
        WHERE d.question_id = ${questionId}
          AND d.status = 'published'
        ORDER BY d.published_at DESC NULLS LAST
      `,
    [],
  );
}

export async function getQuestionSources(
  questionId: string,
): Promise<SourceData[]> {
  return safeQuery(
    () =>
      sql<SourceData[]>`
        SELECT
          s.id,
          s.kind,
          s.title,
          s.author_name,
          s.year,
          s.publisher,
          s.url_canonical,
          s.doi,
          s.isbn,
          ct.locator,
          ct.claim_text,
          ct.quote
        FROM infi_living_page lp
        JOIN infi_living_page_citation lpc ON lpc.living_page_id = lp.id
        JOIN infi_citation ct ON ct.id = lpc.citation_id
        JOIN infi_source s ON s.id = ct.source_id
        WHERE lp.question_id = ${questionId}
          AND lp.status = 'published'
        ORDER BY s.reliability_tier, s.year NULLS LAST
      `,
    [],
  );
}

export async function searchQuestions(
  query: string,
  locale: string,
): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  return safeQuery(
    () =>
      sql<SearchResult[]>`
        SELECT
          q.id,
          q.slug,
          COALESCE(t_title.value, t_title_en.value, q.slug) AS title,
          COALESCE(t_summ.value, t_summ_en.value, '') AS summary,
          (t_title.value IS NULL) AS is_fallback
        FROM infi_question q
        LEFT JOIN infi_translation t_title
          ON t_title.entity_type = 'question' AND t_title.entity_id = q.id
          AND t_title.locale = ${locale} AND t_title.field = 'title'
        LEFT JOIN infi_translation t_title_en
          ON t_title_en.entity_type = 'question' AND t_title_en.entity_id = q.id
          AND t_title_en.locale = 'en' AND t_title_en.field = 'title'
        LEFT JOIN infi_translation t_summ
          ON t_summ.entity_type = 'question' AND t_summ.entity_id = q.id
          AND t_summ.locale = ${locale} AND t_summ.field = 'summary'
        LEFT JOIN infi_translation t_summ_en
          ON t_summ_en.entity_type = 'question' AND t_summ_en.entity_id = q.id
          AND t_summ_en.locale = 'en' AND t_summ_en.field = 'summary'
        WHERE q.status = 'published'
          AND (
            infi_immutable_unaccent(COALESCE(t_title.value, t_title_en.value, '')) ILIKE '%' || infi_immutable_unaccent(${query}) || '%'
            OR infi_immutable_unaccent(COALESCE(t_summ.value, t_summ_en.value, '')) ILIKE '%' || infi_immutable_unaccent(${query}) || '%'
          )
        ORDER BY q.sort_order
        LIMIT 10
      `,
    [],
  );
}

export async function getFeaturedQuestions(
  locale: string,
): Promise<SearchResult[]> {
  return safeQuery(
    () =>
      sql<SearchResult[]>`
        SELECT
          q.id,
          q.slug,
          COALESCE(t_title.value, t_title_en.value, q.slug) AS title,
          COALESCE(t_summ.value, t_summ_en.value, '') AS summary,
          (t_title.value IS NULL) AS is_fallback
        FROM infi_question q
        LEFT JOIN infi_translation t_title
          ON t_title.entity_type = 'question' AND t_title.entity_id = q.id
          AND t_title.locale = ${locale} AND t_title.field = 'title'
        LEFT JOIN infi_translation t_title_en
          ON t_title_en.entity_type = 'question' AND t_title_en.entity_id = q.id
          AND t_title_en.locale = 'en' AND t_title_en.field = 'title'
        LEFT JOIN infi_translation t_summ
          ON t_summ.entity_type = 'question' AND t_summ.entity_id = q.id
          AND t_summ.locale = ${locale} AND t_summ.field = 'summary'
        LEFT JOIN infi_translation t_summ_en
          ON t_summ_en.entity_type = 'question' AND t_summ_en.entity_id = q.id
          AND t_summ_en.locale = 'en' AND t_summ_en.field = 'summary'
        WHERE q.status = 'published'
        ORDER BY q.is_featured DESC, q.sort_order
        LIMIT 6
      `,
    [],
  );
}
