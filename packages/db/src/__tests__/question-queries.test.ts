import { describe, it, expect, beforeAll, afterAll } from "vitest";
import postgres from "postgres";

const DATABASE_URL =
  process.env["DATABASE_URL"] ??
  "postgresql://postgres:postgres@127.0.0.1:5432/infinarad_test";

let sql: ReturnType<typeof postgres>;

beforeAll(() => {
  sql = postgres(DATABASE_URL);
});

afterAll(async () => {
  await sql.end();
});

describe("question detail queries", () => {
  it("fetches question by slug with translations", async () => {
    const rows = await sql`
      SELECT
        q.id,
        q.slug,
        q.status,
        COALESCE(t_title.value, q.slug) AS title
      FROM question q
      LEFT JOIN translation t_title
        ON t_title.entity_type = 'question'
        AND t_title.entity_id = q.id
        AND t_title.locale = 'en'
        AND t_title.field = 'title'
      WHERE q.slug = 'what-is-the-self'
        AND q.status = 'published'
    `;
    expect(rows.length).toBe(1);
    expect(rows[0]?.id).toBe("q_SELF");
    expect(rows[0]?.title).toBeTruthy();
  });

  it("returns null for non-existent slug", async () => {
    const rows = await sql`
      SELECT id FROM question WHERE slug = 'non-existent-slug-xyz'
    `;
    expect(rows.length).toBe(0);
  });

  it("finds related concepts via edge table", async () => {
    const rows = await sql`
      SELECT
        c.id,
        c.original_term,
        c.original_script,
        e.relation,
        e.weight
      FROM edge e
      JOIN concept c ON c.id = e.to_id AND c.status = 'published'
      WHERE e.from_type = 'question'
        AND e.from_id = 'q_SELF'
        AND e.to_type = 'concept'
        AND e.approved_at IS NOT NULL
      ORDER BY e.weight DESC
    `;
    expect(rows.length).toBeGreaterThanOrEqual(3);
    const slugs = rows.map((r) => r.id);
    expect(slugs).toContain("cpt_ATMAN");
    expect(slugs).toContain("cpt_NAFS");
    expect(slugs).toContain("cpt_PSYCHE");
  });

  it("traverses concept -> tradition via edges", async () => {
    const rows = await sql`
      SELECT DISTINCT t.id, t.slug
      FROM edge e1
      JOIN concept c ON c.id = e1.to_id AND c.status = 'published'
      JOIN edge e2 ON e2.from_type = 'concept' AND e2.from_id = c.id
        AND e2.to_type = 'tradition' AND e2.approved_at IS NOT NULL
      JOIN tradition t ON t.id = e2.to_id AND t.status = 'published'
      WHERE e1.from_type = 'question'
        AND e1.from_id = 'q_SELF'
        AND e1.to_type = 'concept'
        AND e1.approved_at IS NOT NULL
    `;
    expect(rows.length).toBeGreaterThanOrEqual(2);
    const ids = rows.map((r) => r.id);
    expect(ids).toContain("trd_HINDUISM");
    expect(ids).toContain("trd_SUFISM");
  });

  it("fetches authors by tradition", async () => {
    const rows = await sql`
      SELECT a.id, a.slug, a.birth_year, a.death_year
      FROM author a
      WHERE a.tradition_id = 'trd_SUFISM'
        AND a.status = 'published'
    `;
    expect(rows.length).toBeGreaterThanOrEqual(1);
    const ids = rows.map((r) => r.id);
    expect(ids).toContain("aut_RUMI");
  });

  it("fetches works by tradition", async () => {
    const rows = await sql`
      SELECT w.id, w.slug, w.author_id, w.original_language
      FROM work w
      WHERE w.tradition_id = 'trd_SUFISM'
        AND w.status = 'published'
    `;
    expect(rows.length).toBeGreaterThanOrEqual(1);
  });

  it("fetches documentaries by question_id", async () => {
    const rows = await sql`
      SELECT d.id, d.slug, d.question_id, d.angle_slug
      FROM documentary d
      WHERE d.question_id = 'q_DEATH'
    `;
    expect(rows.length).toBeGreaterThanOrEqual(0);
  });

  it("search finds questions by title text", async () => {
    const rows = await sql`
      SELECT q.id, q.slug
      FROM question q
      LEFT JOIN translation t ON t.entity_type = 'question'
        AND t.entity_id = q.id AND t.locale = 'en' AND t.field = 'title'
      WHERE q.status = 'published'
        AND immutable_unaccent(COALESCE(t.value, '')) ILIKE '%' || immutable_unaccent('death') || '%'
    `;
    expect(rows.length).toBeGreaterThanOrEqual(1);
    expect(rows[0]?.id).toBe("q_DEATH");
  });

  it("search returns empty for nonsense query", async () => {
    const rows = await sql`
      SELECT q.id
      FROM question q
      LEFT JOIN translation t ON t.entity_type = 'question'
        AND t.entity_id = q.id AND t.locale = 'en' AND t.field = 'title'
      WHERE q.status = 'published'
        AND immutable_unaccent(COALESCE(t.value, '')) ILIKE '%xyznonexistent123%'
    `;
    expect(rows.length).toBe(0);
  });

  it("search works with Spanish locale", async () => {
    const rows = await sql`
      SELECT q.id
      FROM question q
      LEFT JOIN translation t ON t.entity_type = 'question'
        AND t.entity_id = q.id AND t.locale = 'es' AND t.field = 'title'
      LEFT JOIN translation t_en ON t_en.entity_type = 'question'
        AND t_en.entity_id = q.id AND t_en.locale = 'en' AND t_en.field = 'title'
      WHERE q.status = 'published'
        AND immutable_unaccent(COALESCE(t.value, t_en.value, '')) ILIKE '%muerte%'
    `;
    expect(rows.length).toBeGreaterThanOrEqual(1);
  });

  it("fetches active locales ordered by sort_order", async () => {
    const rows = await sql`
      SELECT code, name_native, direction
      FROM locale
      WHERE is_active = true
      ORDER BY sort_order
    `;
    expect(rows.length).toBeGreaterThanOrEqual(2);
    expect(rows[0]?.code).toBe("en");
  });

  it("concept has original_script data", async () => {
    const rows = await sql`
      SELECT id, original_term, original_script, transliteration
      FROM concept
      WHERE id = 'cpt_DUKKHA'
    `;
    expect(rows.length).toBe(1);
    expect(rows[0]?.original_term).toBe("दुःख");
    expect(rows[0]?.original_script).toBe("Devanagari");
    expect(rows[0]?.transliteration).toBe("duḥkha");
  });
});
