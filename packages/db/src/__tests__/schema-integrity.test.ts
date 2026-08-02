import { describe, it, expect, beforeAll, afterAll } from "vitest";
import postgres from "postgres";

const DATABASE_URL =
  process.env["DATABASE_URL"] ??
  "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

let sql: ReturnType<typeof postgres>;

beforeAll(() => {
  sql = postgres(DATABASE_URL);
});

afterAll(async () => {
  await sql.end();
});

describe("schema integrity", () => {
  describe("citation quotability constraint (§5.5)", () => {
    it("allows quote on a quotable source (public_domain)", async () => {
      const result = await sql`
        SELECT quotable FROM source WHERE id = 'src_DHAMMAPADA_PD'
      `;
      expect(result[0]?.quotable).toBe(true);

      const citations = await sql`
        SELECT id, quote FROM citation
        WHERE source_id = 'src_DHAMMAPADA_PD' AND quote IS NOT NULL
      `;
      expect(citations.length).toBeGreaterThan(0);
    });

    it("rejects quote on a non-quotable source (proprietary)", async () => {
      const result = await sql`
        SELECT quotable FROM source WHERE id = 'src_SMITH_WORLD'
      `;
      expect(result[0]?.quotable).toBe(false);

      await expect(
        sql`
          INSERT INTO citation (id, source_id, source_quotable, locator, claim_text, quote)
          VALUES (
            'cit_TEST_FAIL',
            'src_SMITH_WORLD',
            false,
            'p. 42',
            'Test claim',
            'This quote should be rejected'
          )
        `,
      ).rejects.toThrow();
    });

    it("allows claim without quote on a non-quotable source", async () => {
      const existing = await sql`
        SELECT id FROM citation WHERE source_id = 'src_SMITH_WORLD' AND quote IS NULL
      `;
      expect(existing.length).toBeGreaterThan(0);
    });
  });

  describe("source quotable trigger (§5.4)", () => {
    it("auto-sets quotable based on license", async () => {
      const pd = await sql`SELECT quotable FROM source WHERE license = 'public_domain' LIMIT 1`;
      expect(pd[0]?.quotable).toBe(true);

      const prop = await sql`SELECT quotable FROM source WHERE license = 'proprietary' LIMIT 1`;
      expect(prop[0]?.quotable).toBe(false);
    });
  });

  describe("edge endpoint validation (§5.3)", () => {
    it("rejects edge to nonexistent entity", async () => {
      await expect(
        sql`
          INSERT INTO edge (id, from_type, from_id, to_type, to_id, relation, approved_at)
          VALUES (
            'edg_TEST_FAIL',
            'question',
            'q_DEATH',
            'tradition',
            'trd_NONEXISTENT',
            'addresses',
            now()
          )
        `,
      ).rejects.toThrow(/does not exist/);
    });

    it("rejects self-referencing edge", async () => {
      await expect(
        sql`
          INSERT INTO edge (id, from_type, from_id, to_type, to_id, relation)
          VALUES (
            'edg_TEST_SELF',
            'question',
            'q_DEATH',
            'question',
            'q_DEATH',
            'related_to'
          )
        `,
      ).rejects.toThrow();
    });
  });

  describe("revision immutability (§5.6)", () => {
    it("has REVOKE on revision for UPDATE and DELETE", async () => {
      const result = await sql`
        SELECT has_table_privilege('public', 'revision', 'UPDATE') AS can_update,
               has_table_privilege('public', 'revision', 'DELETE') AS can_delete
      `;
      expect(result[0]?.can_update).toBe(false);
      expect(result[0]?.can_delete).toBe(false);
    });
  });

  describe("translation system (§5.7)", () => {
    it("has translations for both en and es", async () => {
      const counts = await sql`
        SELECT locale, count(*)::int AS cnt
        FROM translation
        WHERE locale IN ('en', 'es')
        GROUP BY locale
      `;
      const en = counts.find((r: { locale: string }) => r.locale === "en");
      const es = counts.find((r: { locale: string }) => r.locale === "es");
      expect(en?.cnt).toBeGreaterThan(0);
      expect(es?.cnt).toBeGreaterThan(0);
    });

    it("q_CONSCIOUSNESS has no ES translation (tests fallback)", async () => {
      const result = await sql`
        SELECT count(*)::int AS cnt FROM translation
        WHERE entity_type = 'question'
          AND entity_id = 'q_CONSCIOUSNESS'
          AND locale = 'es'
      `;
      expect(result[0]?.cnt).toBe(0);
    });

    it("translated view resolves fallback for q_CONSCIOUSNESS in es", async () => {
      const result = await sql`
        SELECT value, is_fallback FROM translated
        WHERE entity_type = 'question'
          AND entity_id = 'q_CONSCIOUSNESS'
          AND locale = 'es'
          AND field = 'title'
      `;
      expect(result.length).toBe(1);
      expect(result[0]?.value).toBe("What is consciousness?");
      expect(result[0]?.is_fallback).toBe(true);
    });
  });

  describe("max_quote_words trigger (§5.5)", () => {
    it("rejects quote exceeding source max_quote_words", async () => {
      const longQuote = Array(20).fill("word").join(" ");
      await expect(
        sql`
          INSERT INTO citation (id, source_id, source_quotable, locator, claim_text, quote)
          VALUES (
            'cit_TEST_LONG',
            'src_DHAMMAPADA_PD',
            true,
            'Verse 999',
            'Test claim',
            ${longQuote}
          )
        `,
      ).resolves.toBeDefined();

      await sql`DELETE FROM citation WHERE id = 'cit_TEST_LONG'`;

      const tooLongQuote = Array(501).fill("word").join(" ");
      await expect(
        sql`
          INSERT INTO citation (id, source_id, source_quotable, locator, claim_text, quote)
          VALUES (
            'cit_TEST_TOOLONG',
            'src_DHAMMAPADA_PD',
            true,
            'Verse 999',
            'Test claim',
            ${tooLongQuote}
          )
        `,
      ).rejects.toThrow(/max/);
    });
  });

  describe("locale system", () => {
    it("enforces single master locale", async () => {
      const masters = await sql`
        SELECT count(*)::int AS cnt FROM locale WHERE is_master = true
      `;
      expect(masters[0]?.cnt).toBe(1);
    });

    it("has en as master and es as active", async () => {
      const en = await sql`SELECT is_master, is_active FROM locale WHERE code = 'en'`;
      expect(en[0]?.is_master).toBe(true);
      expect(en[0]?.is_active).toBe(true);

      const es = await sql`SELECT is_master, is_active FROM locale WHERE code = 'es'`;
      expect(es[0]?.is_master).toBe(false);
      expect(es[0]?.is_active).toBe(true);
    });
  });
});
