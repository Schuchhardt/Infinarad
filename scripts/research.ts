#!/usr/bin/env tsx
/**
 * Research brief generator for Infinarad video production.
 *
 * Usage:
 *   pnpm research --question what-happens-after-death --tradition buddhism
 *   pnpm research -q suffering -t hinduism --locale es
 *   pnpm research -q self          # all traditions for that question
 *   pnpm research --list           # list available questions and traditions
 */

import { sql } from "../packages/db/src/connection.js";
import {
  findQuestion,
  findTradition,
  getAllTraditionsForQuestion,
  getAuthors,
  getCitations,
  getConceptsForQuestionAndTradition,
  getDerivedTraditions,
  getPractices,
  getRelatedConcepts,
  getSymbols,
  getWorks,
} from "../packages/db/src/queries/research.js";
import type {
  AuthorRow,
  CitationRow,
  ConceptRow,
  DerivedTraditionRow,
  EdgeRow,
  PracticeRow,
  QuestionRow,
  SymbolRow,
  TraditionRow,
  WorkRow,
} from "../packages/db/src/queries/research.js";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

// ── CLI parsing ──────────────────────────────────────────────────────

interface Args {
  question: string;
  tradition: string;
  locale: string;
  list: boolean;
  outDir: string;
}

function parseArgs(): Args {
  const args = process.argv.slice(2);
  const result: Args = {
    question: "",
    tradition: "",
    locale: "en",
    list: false,
    outDir: join(import.meta.dirname, "..", "research-output"),
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    const next = args[i + 1];
    switch (arg) {
      case "--question":
      case "-q":
        result.question = next ?? "";
        i++;
        break;
      case "--tradition":
      case "-t":
        result.tradition = next ?? "";
        i++;
        break;
      case "--locale":
      case "-l":
        result.locale = next ?? "en";
        i++;
        break;
      case "--out":
      case "-o":
        result.outDir = next ?? result.outDir;
        i++;
        break;
      case "--list":
        result.list = true;
        break;
      case "--help":
      case "-h":
        console.log(`
Research brief generator for Infinarad video production.

Usage:
  pnpm research --question <slug-or-search> --tradition <slug-or-search> [options]

Options:
  -q, --question <term>    Question slug or search term (required)
  -t, --tradition <term>   Tradition slug or search term (optional, all if omitted)
  -l, --locale <code>      Locale for translations (default: en)
  -o, --out <dir>          Output directory (default: research-output/)
  --list                   List available questions and traditions
  -h, --help               Show this help

Examples:
  pnpm research -q what-happens-after-death -t buddhism
  pnpm research -q suffering -t hinduism --locale es
  pnpm research -q self
  pnpm research --list
`);
        process.exit(0);
    }
  }

  return result;
}

// ── Markdown generation ──────────────────────────────────────────────

function formatYear(y: number | null): string {
  if (!y) return "?";
  return y < 0 ? `${Math.abs(y)} BCE` : `${y} CE`;
}

function generateBrief(
  question: QuestionRow,
  tradition: TraditionRow | null,
  concepts: ConceptRow[],
  relatedConcepts: EdgeRow[],
  authors: AuthorRow[],
  works: WorkRow[],
  practices: PracticeRow[],
  symbols: SymbolRow[],
  citations: CitationRow[],
  derivedTraditions: DerivedTraditionRow[],
  locale: string,
): string {
  const lines: string[] = [];
  const angle = tradition ? tradition.name : "All Traditions";
  const now = new Date().toISOString().split("T")[0];

  lines.push(`# Research Brief: ${question.title}`);
  lines.push(`## ${angle}`);
  lines.push("");
  lines.push(`> Generated ${now} | Locale: ${locale} | Infinarad Research Tool`);
  lines.push("");
  lines.push("---");
  lines.push("");

  // ── Question overview
  lines.push("## 1. The Question");
  lines.push("");
  lines.push(`**${question.title}**`);
  lines.push("");
  if (question.summary) {
    lines.push(question.summary);
    lines.push("");
  }
  lines.push(`- Slug: \`${question.slug}\``);
  lines.push(`- ID: \`${question.id}\``);
  lines.push("");

  // ── Tradition overview
  if (tradition) {
    lines.push("## 2. The Tradition");
    lines.push("");
    lines.push(`**${tradition.name}**`);
    if (tradition.collection_name)
      lines.push(`- Collection: ${tradition.collection_name}`);
    if (tradition.era_start || tradition.era_end)
      lines.push(
        `- Era: ${formatYear(tradition.era_start)} – ${formatYear(tradition.era_end)}`,
      );
    lines.push(`- Slug: \`${tradition.slug}\``);
    lines.push("");
    if (tradition.summary) {
      lines.push(tradition.summary);
      lines.push("");
    }

    // Derived traditions
    if (derivedTraditions.length > 0) {
      lines.push("### Related Traditions");
      lines.push("");
      for (const dt of derivedTraditions) {
        lines.push(`- ${dt.name} (${dt.relation.replace(/_/g, " ")})`);
      }
      lines.push("");
    }
  }

  // ── Key concepts
  let sectionNum = tradition ? 3 : 2;
  if (concepts.length > 0) {
    lines.push(`## ${sectionNum}. Key Concepts`);
    sectionNum++;
    lines.push("");
    for (const c of concepts) {
      lines.push(`### ${c.name}`);
      if (c.original_term) {
        const parts = [`Original: **${c.original_term}**`];
        if (c.original_script) parts.push(`(${c.original_script})`);
        if (c.transliteration) parts.push(`— _${c.transliteration}_`);
        lines.push(parts.join(" "));
      }
      if (c.tradition_name) lines.push(`- Tradition: ${c.tradition_name}`);
      if (c.summary) {
        lines.push("");
        lines.push(c.summary);
      }
      lines.push("");
    }

    if (relatedConcepts.length > 0) {
      lines.push("### Concept Relationships");
      lines.push("");
      for (const rc of relatedConcepts) {
        lines.push(
          `- ${rc.to_name} (${rc.relation.replace(/_/g, " ")}, weight: ${rc.weight})`,
        );
      }
      lines.push("");
    }
  }

  // ── Authors
  if (authors.length > 0) {
    lines.push(`## ${sectionNum}. Key Authors`);
    sectionNum++;
    lines.push("");
    for (const a of authors) {
      const lifespan =
        a.birth_year || a.death_year
          ? ` (${formatYear(a.birth_year)} – ${formatYear(a.death_year)})`
          : "";
      lines.push(`### ${a.name}${lifespan}`);
      if (a.summary) lines.push(a.summary);
      lines.push("");
    }
  }

  // ── Works
  if (works.length > 0) {
    lines.push(`## ${sectionNum}. Primary Works & Texts`);
    sectionNum++;
    lines.push("");
    for (const w of works) {
      lines.push(`### _${w.name}_`);
      const meta: string[] = [];
      if (w.author_name) meta.push(`Author: ${w.author_name}`);
      if (w.original_language) meta.push(`Language: ${w.original_language}`);
      if (w.composed_start)
        meta.push(
          `Composed: ${formatYear(w.composed_start)}${w.composed_end && w.composed_end !== w.composed_start ? ` – ${formatYear(w.composed_end)}` : ""}`,
        );
      if (meta.length > 0) lines.push(meta.join(" | "));
      if (w.summary) {
        lines.push("");
        lines.push(w.summary);
      }
      lines.push("");
    }
  }

  // ── Practices
  if (practices.length > 0) {
    lines.push(`## ${sectionNum}. Practices`);
    sectionNum++;
    lines.push("");
    for (const p of practices) {
      lines.push(`### ${p.name}`);
      if (p.summary) lines.push(p.summary);
      lines.push("");
    }
  }

  // ── Symbols
  if (symbols.length > 0) {
    lines.push(`## ${sectionNum}. Symbols`);
    sectionNum++;
    lines.push("");
    for (const s of symbols) {
      const char = s.unicode_char ? ` ${s.unicode_char}` : "";
      lines.push(`### ${s.name}${char}`);
      if (s.summary) lines.push(s.summary);
      lines.push("");
    }
  }

  // ── Citations & Sources
  if (citations.length > 0) {
    lines.push(`## ${sectionNum}. Sources & Citations`);
    lines.push("");
    for (let i = 0; i < citations.length; i++) {
      const c = citations[i]!;
      lines.push(`### [${i + 1}] ${c.source_title}`);
      const ref: string[] = [];
      if (c.source_author) ref.push(`Author: ${c.source_author}`);
      if (c.source_year) ref.push(`Year: ${c.source_year}`);
      ref.push(`Type: ${c.source_kind.replace(/_/g, " ")}`);
      ref.push(`License: ${c.source_license.replace(/_/g, " ")}`);
      lines.push(ref.join(" | "));
      if (c.source_publisher)
        lines.push(`Publisher: ${c.source_publisher}`);
      if (c.source_doi) lines.push(`DOI: ${c.source_doi}`);
      if (c.source_isbn) lines.push(`ISBN: ${c.source_isbn}`);
      if (c.source_url) lines.push(`URL: ${c.source_url}`);
      lines.push("");
      lines.push(`**Locator:** ${c.locator}`);
      lines.push("");
      lines.push(`**Claim:** ${c.claim_text}`);
      if (c.quote) {
        lines.push("");
        lines.push(`> "${c.quote}"`);
      }
      lines.push("");
    }
  }

  // ── Video brief summary
  lines.push("---");
  lines.push("");
  lines.push("## Video Production Notes");
  lines.push("");
  lines.push(`- **Topic:** ${question.title} — ${angle}`);
  lines.push(`- **Concepts to cover:** ${concepts.map((c) => c.name).join(", ") || "None in DB"}`);
  lines.push(`- **Key figures:** ${authors.map((a) => a.name).join(", ") || "None in DB"}`);
  lines.push(`- **Primary texts:** ${works.map((w) => w.name).join(", ") || "None in DB"}`);
  lines.push(`- **Practices to show:** ${practices.map((p) => p.name).join(", ") || "None in DB"}`);
  lines.push(`- **Visual symbols:** ${symbols.map((s) => `${s.name}${s.unicode_char ? ` (${s.unicode_char})` : ""}`).join(", ") || "None in DB"}`);
  lines.push(`- **Citable sources:** ${citations.length}`);
  lines.push(`- **Data completeness:** Review sections marked "None in DB" — these need research before scripting.`);
  lines.push("");

  return lines.join("\n");
}

// ── List command ─────────────────────────────────────────────────────

async function listEntities(locale: string) {
  const questions = await sql<{ slug: string; title: string }[]>`
    SELECT q.slug, COALESCE(t.value, q.slug) AS title
    FROM infi_question q
    LEFT JOIN infi_translated t ON t.entity_type='question' AND t.entity_id=q.id
      AND t.locale=${locale} AND t.field='title'
    WHERE q.status = 'published' ORDER BY q.sort_order
  `;

  const traditions = await sql<{ slug: string; name: string }[]>`
    SELECT t.slug, COALESCE(tn.value, t.slug) AS name
    FROM infi_tradition t
    LEFT JOIN infi_translated tn ON tn.entity_type='tradition' AND tn.entity_id=t.id
      AND tn.locale=${locale} AND tn.field='name'
    WHERE t.status = 'published' ORDER BY t.slug
  `;

  console.log("\n  QUESTIONS");
  console.log("  " + "─".repeat(60));
  for (const q of questions) {
    console.log(`  ${q.slug.padEnd(40)} ${q.title}`);
  }

  console.log("\n  TRADITIONS");
  console.log("  " + "─".repeat(60));
  for (const t of traditions) {
    console.log(`  ${t.slug.padEnd(40)} ${t.name}`);
  }
  console.log("");
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs();

  try {
    if (args.list) {
      await listEntities(args.locale);
      return;
    }

    if (!args.question) {
      console.error(
        "Error: --question is required. Use --list to see available options, or --help for usage.",
      );
      process.exit(1);
    }

    // Find question
    const question = await findQuestion(args.question, args.locale);
    if (!question) {
      console.error(`Error: No published question matching "${args.question}".`);
      console.error("Use --list to see available questions.");
      process.exit(1);
    }
    console.log(`  Found question: ${question.title} (${question.slug})`);

    // Find tradition (optional)
    let tradition: TraditionRow | null = null;
    if (args.tradition) {
      tradition = await findTradition(args.tradition, args.locale);
      if (!tradition) {
        console.error(
          `Error: No published tradition matching "${args.tradition}".`,
        );
        console.error("Use --list to see available traditions.");
        process.exit(1);
      }
      console.log(`  Found tradition: ${tradition.name} (${tradition.slug})`);
    } else {
      const allTraditions = await getAllTraditionsForQuestion(
        question.id,
        args.locale,
      );
      if (allTraditions.length > 0) {
        console.log(
          `  No tradition specified. Related traditions: ${allTraditions.map((t) => t.name).join(", ")}`,
        );
      }
    }

    // Gather data
    console.log("  Gathering research data...");

    const concepts = await getConceptsForQuestionAndTradition(
      question.id,
      tradition?.id ?? null,
      args.locale,
    );

    const conceptIds = concepts.map((c) => c.id);
    const relatedConcepts = await getRelatedConcepts(conceptIds, args.locale);

    let authors: AuthorRow[] = [];
    let works: WorkRow[] = [];
    let practices: PracticeRow[] = [];
    let symbols: SymbolRow[] = [];
    let derivedTraditions: DerivedTraditionRow[] = [];

    if (tradition) {
      [authors, works, practices, symbols, derivedTraditions] =
        await Promise.all([
          getAuthors(tradition.id, args.locale),
          getWorks(tradition.id, args.locale),
          getPractices(tradition.id, args.locale),
          getSymbols(tradition.id, args.locale),
          getDerivedTraditions(tradition.id, args.locale),
        ]);
    }

    const citations = await getCitations(
      question.id,
      tradition?.id ?? null,
    );

    // Generate brief
    const brief = generateBrief(
      question,
      tradition,
      concepts,
      relatedConcepts,
      authors,
      works,
      practices,
      symbols,
      citations,
      derivedTraditions,
      args.locale,
    );

    // Write output
    mkdirSync(args.outDir, { recursive: true });
    const filename = tradition
      ? `${question.slug}--${tradition.slug}.md`
      : `${question.slug}--all.md`;
    const outPath = join(args.outDir, filename);
    writeFileSync(outPath, brief, "utf-8");

    console.log("");
    console.log(`  Research brief written to: ${outPath}`);
    console.log("");

    // Print summary
    console.log("  Summary:");
    console.log(`    Concepts:   ${concepts.length}`);
    console.log(`    Authors:    ${authors.length}`);
    console.log(`    Works:      ${works.length}`);
    console.log(`    Practices:  ${practices.length}`);
    console.log(`    Symbols:    ${symbols.length}`);
    console.log(`    Citations:  ${citations.length}`);
    console.log("");
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
