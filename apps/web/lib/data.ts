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
