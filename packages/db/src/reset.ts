import { createSql } from "./connection.js";

async function reset() {
  const sql = createSql();

  try {
    console.log("Dropping Infinarad objects (infi_*)...");

    await sql`DROP VIEW IF EXISTS translated, infi_translated`;

    await sql`
      DROP TABLE IF EXISTS
        infi_living_page_citation, infi_living_page, infi_documentary,
        infi_citation, infi_source, infi_changelog_entry, infi_suggestion,
        infi_revision, infi_translation, infi_slug_redirect, infi_embedding,
        infi_edge, infi_work, infi_author, infi_practice, infi_symbol,
        infi_concept, infi_tradition, infi_question, infi_collection,
        infi_region, infi_period, infi_locale, infi_profile, infi_migrations
      CASCADE
    `;

    await sql`
      DROP TYPE IF EXISTS
        infi_entity_type, infi_publication_status, infi_relation_type,
        infi_source_kind, infi_license_kind, infi_verification_status,
        infi_translation_status, infi_changelog_kind, infi_actor_type,
        infi_user_role, infi_text_direction
    `;

    await sql`
      DROP FUNCTION IF EXISTS
        infi_gen_prefixed_id(text), infi_immutable_unaccent(text),
        infi_edge_check_endpoints(), infi_source_set_quotable(),
        infi_citation_check_max_words()
    `;

    console.log("Reset complete.");
  } finally {
    await sql.end();
  }
}

reset().catch((err) => {
  console.error("Reset failed:", err);
  process.exit(1);
});
