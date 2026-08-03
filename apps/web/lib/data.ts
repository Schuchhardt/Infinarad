import { sql } from "@infinarad/db";

export interface QuestionData {
  id: string;
  slug: string;
  title: string;
  summary: string;
  is_fallback: boolean;
}

export interface CollectionData {
  id: string;
  slug: string;
  name: string;
  tradition_count: number;
}

export interface ConceptData {
  id: string;
  original_term: string;
  original_script: string;
  transliteration: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function safeQuery<T>(fn: () => Promise<T>, fallback: any): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback as T;
  }
}

export interface LocaleData {
  code: string;
  name: string;
  direction: string;
}

export async function getActiveLocales(): Promise<LocaleData[]> {
  return safeQuery(
    () =>
      sql<LocaleData[]>`
        SELECT code, name_native AS name, direction
        FROM locale
        WHERE is_active = true
        ORDER BY sort_order
      `,
    [
      { code: "en", name: "English", direction: "ltr" },
      { code: "es", name: "Español", direction: "ltr" },
    ],
  );
}

export async function getQuestions(locale: string): Promise<QuestionData[]> {
  return safeQuery(
    () =>
      sql<QuestionData[]>`
        SELECT
          q.id,
          q.slug,
          COALESCE(t_title.value, t_title_en.value, '') AS title,
          COALESCE(t_summary.value, t_summary_en.value, '') AS summary,
          (t_title.value IS NULL) AS is_fallback
        FROM question q
        LEFT JOIN translation t_title
          ON t_title.entity_type = 'question'
          AND t_title.entity_id = q.id
          AND t_title.locale = ${locale}
          AND t_title.field = 'title'
        LEFT JOIN translation t_title_en
          ON t_title_en.entity_type = 'question'
          AND t_title_en.entity_id = q.id
          AND t_title_en.locale = 'en'
          AND t_title_en.field = 'title'
        LEFT JOIN translation t_summary
          ON t_summary.entity_type = 'question'
          AND t_summary.entity_id = q.id
          AND t_summary.locale = ${locale}
          AND t_summary.field = 'summary'
        LEFT JOIN translation t_summary_en
          ON t_summary_en.entity_type = 'question'
          AND t_summary_en.entity_id = q.id
          AND t_summary_en.locale = 'en'
          AND t_summary_en.field = 'summary'
        WHERE q.status = 'published'
        ORDER BY q.sort_order
      `,
    [],
  );
}

export async function getCollections(
  locale: string,
): Promise<CollectionData[]> {
  return safeQuery(
    () =>
      sql<CollectionData[]>`
        SELECT
          c.id,
          c.slug,
          COALESCE(t_name.value, t_name_en.value, c.slug) AS name,
          COALESCE(tc.cnt, 0)::int AS tradition_count
        FROM collection c
        LEFT JOIN translation t_name
          ON t_name.entity_type = 'collection'
          AND t_name.entity_id = c.id
          AND t_name.locale = ${locale}
          AND t_name.field = 'name'
        LEFT JOIN translation t_name_en
          ON t_name_en.entity_type = 'collection'
          AND t_name_en.entity_id = c.id
          AND t_name_en.locale = 'en'
          AND t_name_en.field = 'name'
        LEFT JOIN LATERAL (
          SELECT count(*)::int AS cnt
          FROM tradition t
          WHERE t.collection_id = c.id AND t.status = 'published'
        ) tc ON true
        WHERE c.status = 'published'
        ORDER BY c.sort_order
      `,
    [],
  );
}

export async function getHeroSubtitle(locale: string): Promise<string> {
  return safeQuery(async () => {
    const rows = await sql<{ value: string }[]>`
      SELECT value FROM translation
      WHERE entity_type = 'question'
        AND entity_id = 'q_DEATH'
        AND locale = ${locale}
        AND field = 'hero_subtitle'
    `;
    if (rows[0]) return rows[0].value;
    const fallback = await sql<{ value: string }[]>`
      SELECT value FROM translation
      WHERE entity_type = 'question'
        AND entity_id = 'q_DEATH'
        AND locale = 'en'
        AND field = 'hero_subtitle'
    `;
    return fallback[0]?.value ?? "One question. Ten answers. No conclusion.";
  }, "One question. Ten answers. No conclusion.");
}

export async function getTheRule(
  locale: string,
): Promise<{ title: string; body: string }> {
  return safeQuery(async () => {
    const rows = await sql<{ field: string; value: string }[]>`
      SELECT t.field, COALESCE(t.value, t_en.value) AS value
      FROM (VALUES ('the_rule'), ('the_rule_body')) AS fields(field)
      LEFT JOIN translation t
        ON t.entity_type = 'collection'
        AND t.entity_id = 'col_DHARMIC'
        AND t.locale = ${locale}
        AND t.field = fields.field
      LEFT JOIN translation t_en
        ON t_en.entity_type = 'collection'
        AND t_en.entity_id = 'col_DHARMIC'
        AND t_en.locale = 'en'
        AND t_en.field = fields.field
    `;
    const map = Object.fromEntries(rows.map((r) => [r.field, r.value]));
    return {
      title: map["the_rule"] ?? "We document. We cite. We do not conclude.",
      body:
        map["the_rule_body"] ??
        "Every claim traces to a source. Every source is verifiable.",
    };
  }, {
    title: "We document. We cite. We do not conclude.",
    body: "Every claim traces to a source. Every source is verifiable.",
  });
}

export async function getHowItWorksTitle(locale: string): Promise<string> {
  return safeQuery(async () => {
    const rows = await sql<{ value: string }[]>`
      SELECT value FROM translation
      WHERE entity_type = 'collection'
        AND entity_id = 'col_DHARMIC'
        AND locale = ${locale}
        AND field = 'how_it_works_title'
    `;
    if (rows[0]) return rows[0].value;
    const fallback = await sql<{ value: string }[]>`
      SELECT value FROM translation
      WHERE entity_type = 'collection'
        AND entity_id = 'col_DHARMIC'
        AND locale = 'en'
        AND field = 'how_it_works_title'
    `;
    return fallback[0]?.value ?? "How It Works";
  }, locale === "es" ? "Cómo Funciona" : "How It Works");
}

export interface PlatformStats {
  traditions: number;
  concepts: number;
  sources: number;
  authors: number;
}

export async function getPlatformStats(): Promise<PlatformStats> {
  return safeQuery(async () => {
    const rows = await sql<{ entity: string; count: number }[]>`
      SELECT 'traditions' AS entity, count(*)::int AS count FROM tradition WHERE status = 'published'
      UNION ALL SELECT 'concepts', count(*)::int FROM concept WHERE status = 'published'
      UNION ALL SELECT 'sources', count(*)::int FROM source
      UNION ALL SELECT 'authors', count(*)::int FROM author WHERE status = 'published'
    `;
    const map = Object.fromEntries(rows.map((r) => [r.entity, r.count]));
    return {
      traditions: map["traditions"] ?? 0,
      concepts: map["concepts"] ?? 0,
      sources: map["sources"] ?? 0,
      authors: map["authors"] ?? 0,
    };
  }, { traditions: 0, concepts: 0, sources: 0, authors: 0 });
}

export interface FeaturedQuestionStats {
  id: string;
  slug: string;
  title: string;
  tradition_count: number;
  concept_count: number;
  source_count: number;
  author_count: number;
  work_count: number;
}

export async function getFeaturedQuestionStats(questionId: string, locale: string): Promise<FeaturedQuestionStats | null> {
  return safeQuery(async () => {
    const qRows = await sql<{ id: string; slug: string; title: string }[]>`
      SELECT q.id, q.slug,
        COALESCE(t.value, t_en.value, q.slug) AS title
      FROM question q
      LEFT JOIN translation t ON t.entity_type = 'question' AND t.entity_id = q.id
        AND t.locale = ${locale} AND t.field = 'title'
      LEFT JOIN translation t_en ON t_en.entity_type = 'question' AND t_en.entity_id = q.id
        AND t_en.locale = 'en' AND t_en.field = 'title'
      WHERE q.id = ${questionId} AND q.status = 'published'
    `;
    if (!qRows[0]) return null;

    const countRows = await sql<{ entity: string; count: number }[]>`
      SELECT 'traditions' AS entity, count(DISTINCT t.id)::int AS count
      FROM edge e1
      JOIN concept c ON c.id = e1.to_id AND c.status = 'published'
      JOIN edge e2 ON e2.from_type = 'concept' AND e2.from_id = c.id
        AND e2.to_type = 'tradition' AND e2.approved_at IS NOT NULL
      JOIN tradition t ON t.id = e2.to_id AND t.status = 'published'
      WHERE e1.from_type = 'question' AND e1.from_id = ${questionId}
        AND e1.to_type = 'concept' AND e1.approved_at IS NOT NULL
      UNION ALL
      SELECT 'concepts', count(DISTINCT c.id)::int
      FROM edge e JOIN concept c ON c.id = e.to_id AND c.status = 'published'
      WHERE e.from_type = 'question' AND e.from_id = ${questionId}
        AND e.to_type = 'concept' AND e.approved_at IS NOT NULL
      UNION ALL
      SELECT 'sources', count(DISTINCT s.id)::int
      FROM living_page lp
      JOIN living_page_citation lpc ON lpc.living_page_id = lp.id
      JOIN citation ct ON ct.id = lpc.citation_id
      JOIN source s ON s.id = ct.source_id
      WHERE lp.question_id = ${questionId} AND lp.status = 'published'
      UNION ALL
      SELECT 'authors', count(DISTINCT a.id)::int
      FROM edge e1
      JOIN concept c ON c.id = e1.to_id AND c.status = 'published'
      JOIN edge e2 ON e2.from_type = 'concept' AND e2.from_id = c.id
        AND e2.to_type = 'tradition' AND e2.approved_at IS NOT NULL
      JOIN author a ON a.tradition_id = e2.to_id AND a.status = 'published'
      WHERE e1.from_type = 'question' AND e1.from_id = ${questionId}
        AND e1.to_type = 'concept' AND e1.approved_at IS NOT NULL
      UNION ALL
      SELECT 'works', count(DISTINCT w.id)::int
      FROM edge e1
      JOIN concept c ON c.id = e1.to_id AND c.status = 'published'
      JOIN edge e2 ON e2.from_type = 'concept' AND e2.from_id = c.id
        AND e2.to_type = 'tradition' AND e2.approved_at IS NOT NULL
      JOIN work w ON w.tradition_id = e2.to_id AND w.status = 'published'
      WHERE e1.from_type = 'question' AND e1.from_id = ${questionId}
        AND e1.to_type = 'concept' AND e1.approved_at IS NOT NULL
    `;
    const cmap = Object.fromEntries(countRows.map((r) => [r.entity, r.count]));
    return {
      ...qRows[0],
      tradition_count: cmap["traditions"] ?? 0,
      concept_count: cmap["concepts"] ?? 0,
      source_count: cmap["sources"] ?? 0,
      author_count: cmap["authors"] ?? 0,
      work_count: cmap["works"] ?? 0,
    };
  }, null);
}
