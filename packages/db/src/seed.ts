import { readFile } from "node:fs/promises";
import { join } from "node:path";
import postgres from "postgres";

const connectionString =
  process.env["DATABASE_URL"] ??
  "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

async function seed() {
  const sql = postgres(connectionString);

  try {
    const seedFile = join(import.meta.dirname, "..", "seeds", "seed.sql");
    const content = await readFile(seedFile, "utf-8");

    console.log("Seeding database...");
    await sql.unsafe(content);
    console.log("Seed complete.");
  } finally {
    await sql.end();
  }
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
