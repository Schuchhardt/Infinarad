import { describe, it, expect, beforeAll, afterAll } from "vitest";
import postgres from "postgres";

const DATABASE_URL =
  process.env["DATABASE_URL"] ??
  "postgresql://postgres:postgres@127.0.0.1:5432/infinarad_test";

let adminSql: ReturnType<typeof postgres>;

beforeAll(() => {
  adminSql = postgres(DATABASE_URL);
});

afterAll(async () => {
  await adminSql.end();
});

async function asAnon<T>(
  fn: (tx: postgres.TransactionSql) => Promise<T>,
): Promise<T> {
  return adminSql.begin(async (tx) => {
    await tx.unsafe("SET LOCAL ROLE anon");
    const result = await fn(tx);
    await tx.unsafe("RESET ROLE");
    return result;
  });
}

describe("RLS policies", () => {
  it("anonymous client cannot read draft questions", async () => {
    await adminSql`
      INSERT INTO question (id, slug, status, sort_order)
      VALUES ('q_TEST_DRAFT', 'test-draft-question', 'draft', 999)
      ON CONFLICT (id) DO NOTHING
    `;

    try {
      const result = await asAnon((tx) =>
        tx`SELECT id FROM question WHERE id = 'q_TEST_DRAFT'`,
      );
      expect(result.length).toBe(0);
    } finally {
      await adminSql`DELETE FROM question WHERE id = 'q_TEST_DRAFT'`;
    }
  });

  it("anonymous client can read published questions", async () => {
    const result = await asAnon((tx) =>
      tx`SELECT count(*)::int AS cnt FROM question WHERE status = 'published'`,
    );
    expect(result[0]?.cnt).toBeGreaterThan(0);
  });

  it("anonymous client cannot read unapproved edges", async () => {
    await adminSql`
      INSERT INTO edge (id, from_type, from_id, to_type, to_id, relation)
      VALUES ('edg_TEST_UNAPP', 'question', 'q_DEATH', 'concept', 'cpt_DUKKHA', 'related_to')
      ON CONFLICT (id) DO NOTHING
    `;

    try {
      const result = await asAnon((tx) =>
        tx`SELECT id FROM edge WHERE id = 'edg_TEST_UNAPP'`,
      );
      expect(result.length).toBe(0);
    } finally {
      await adminSql`DELETE FROM edge WHERE id = 'edg_TEST_UNAPP'`;
    }
  });

  it("anonymous client can read approved edges", async () => {
    const result = await asAnon((tx) =>
      tx`SELECT count(*)::int AS cnt FROM edge WHERE approved_at IS NOT NULL`,
    );
    expect(result[0]?.cnt).toBeGreaterThan(0);
  });

  it("anonymous client cannot read draft traditions", async () => {
    await adminSql`
      INSERT INTO tradition (id, slug, status)
      VALUES ('trd_TEST_DRAFT', 'test-draft-tradition', 'draft')
      ON CONFLICT (id) DO NOTHING
    `;

    try {
      const result = await asAnon((tx) =>
        tx`SELECT id FROM tradition WHERE id = 'trd_TEST_DRAFT'`,
      );
      expect(result.length).toBe(0);
    } finally {
      await adminSql`DELETE FROM tradition WHERE id = 'trd_TEST_DRAFT'`;
    }
  });

  it("anonymous client cannot read draft collections", async () => {
    await adminSql`
      INSERT INTO collection (id, slug, status)
      VALUES ('col_TEST_DRAFT', 'test-draft-collection', 'draft')
      ON CONFLICT (id) DO NOTHING
    `;

    try {
      const result = await asAnon((tx) =>
        tx`SELECT id FROM collection WHERE id = 'col_TEST_DRAFT'`,
      );
      expect(result.length).toBe(0);
    } finally {
      await adminSql`DELETE FROM collection WHERE id = 'col_TEST_DRAFT'`;
    }
  });

  it("anonymous client cannot read suggestions", async () => {
    await adminSql`
      INSERT INTO suggestion (id, entity_type, entity_id, body)
      VALUES ('sug_TEST', 'question', 'q_DEATH', 'test suggestion')
      ON CONFLICT (id) DO NOTHING
    `;

    try {
      const result = await asAnon((tx) => tx`SELECT id FROM suggestion`);
      expect(result.length).toBe(0);
    } finally {
      await adminSql`DELETE FROM suggestion WHERE id = 'sug_TEST'`;
    }
  });

  it("anonymous client only sees active locales", async () => {
    const anonCount = await asAnon((tx) =>
      tx`SELECT count(*)::int AS cnt FROM locale`,
    );
    const allCount =
      await adminSql`SELECT count(*)::int AS cnt FROM locale`;

    expect(anonCount[0]?.cnt).toBe(2);
    expect(allCount[0]?.cnt).toBe(10);
  });
});
