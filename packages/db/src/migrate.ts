import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import postgres from "postgres";
import { createSql } from "./connection.js";

async function migrate() {
  const sql = createSql();

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS infi_migrations (
        name text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `;

    const migrationsDir = join(import.meta.dirname, "..", "migrations");
    const files = (await readdir(migrationsDir))
      .filter((f) => f.endsWith(".sql"))
      .sort();

    const applied = await sql<{ name: string }[]>`
      SELECT name FROM infi_migrations ORDER BY name
    `;
    const appliedSet = new Set(applied.map((r) => r.name));

    for (const file of files) {
      if (appliedSet.has(file)) {
        console.log(`  skip ${file} (already applied)`);
        continue;
      }

      const content = await readFile(join(migrationsDir, file), "utf-8");
      console.log(`  apply ${file}...`);

      await sql.begin(async (tx) => {
        await tx.unsafe(content);
        await tx`INSERT INTO infi_migrations (name) VALUES (${file})`;
      });

      console.log(`  done  ${file}`);
    }

    console.log("All migrations applied.");
  } finally {
    await sql.end();
  }
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
