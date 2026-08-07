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

import { createSql } from "../packages/db/src/connection.js";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const sql = createSql();

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

// ── Queries ──────────────────────────────────────────────────────────

interface QuestionRow {
  id: string;
  slug: string;
  title: string;
  summary: string;
}

interface TraditionRow {
  id: string;
  slug: string;
  name: string;
  summary: string;
  collection_name: string | null;
  era_start: number | null;
  era_end: number | null;
}

interface ConceptRow {
  id: string;
  slug: string;
  name: string;
  summary: string;
  original_term: string | null;
  original_script: string | null;
  transliteration: string | null;
  tradition_name: string | null;
}

interface AuthorRow {
  id: string;
  slug: string;
  name: string;
  summary: string;
  birth_year: number | null;
  death_year: number | null;
}

interface WorkRow {
  id: string;
  slug: string;
  name: string;
  summary: string;
  author_name: string | null;
  original_language: string | null;
  composed_start: number | null;
  composed_end: number | null;
}

interface PracticeRow {
  id: string;
  slug: string;
  name: string;
  summary: string;
}

interface SymbolRow {
  id: string;
  slug: string;
  name: string;
  summary: string;
  unicode_char: string | null;
}

interface CitationRow {
  source_title: string;
  source_kind: string;
  source_author: string | null;
  source_year: number | null;
  source_publisher: string | null;
  source_url: string | null;
  source_doi: string | null;
  source_isbn: string | null;
  source_license: string;
  locator: string;
  claim_text: string;
  quote: string | null;
}

interface EdgeRow {
  from_type: string;
  from_id: string;
  to_type: string;
  to_id: string;
  to_name: string;
  relation: string;
  weight: number;
}

interface DerivedTraditionRow {
  id: string;
  slug: string;
  name: string;
  relation: string;
}

async function findQuestion(
  term: string,
  locale: string,
): Promise<QuestionRow | null> {
  // Try exact slug first
  let rows = await sql<QuestionRow[]>`
    SELECT q.id, q.slug,
      COALESCE(t.value, t_en.value, q.slug) AS title,
      COALESCE(ts.value, ts_en.value, '') AS summary
    FROM infi_question q
    LEFT JOIN infi_translation t ON t.entity_type='question' AND t.entity_id=q.id
      AND t.locale=${locale} AND t.field='title'
    LEFT JOIN infi_translation t_en ON t_en.entity_type='question' AND t_en.entity_id=q.id
      AND t_en.locale='en' AND t_en.field='title'
    LEFT JOIN infi_translation ts ON ts.entity_type='question' AND ts.entity_id=q.id
      AND ts.locale=${locale} AND ts.field='summary'
    LEFT JOIN infi_translation ts_en ON ts_en.entity_type='question' AND ts_en.entity_id=q.id
      AND ts_en.locale='en' AND ts_en.field='summary'
    WHERE q.slug = ${term} AND q.status = 'published'
  `;
  if (rows[0]) return rows[0];

  // Fuzzy search
  rows = await sql<QuestionRow[]>`
    SELECT q.id, q.slug,
      COALESCE(t.value, t_en.value, q.slug) AS title,
      COALESCE(ts.value, ts_en.value, '') AS summary
    FROM infi_question q
    LEFT JOIN infi_translation t ON t.entity_type='question' AND t.entity_id=q.id
      AND t.locale=${locale} AND t.field='title'
    LEFT JOIN infi_translation t_en ON t_en.entity_type='question' AND t_en.entity_id=q.id
      AND t_en.locale='en' AND t_en.field='title'
    LEFT JOIN infi_translation ts ON ts.entity_type='question' AND ts.entity_id=q.id
      AND ts.locale=${locale} AND ts.field='summary'
    LEFT JOIN infi_translation ts_en ON ts_en.entity_type='question' AND ts_en.entity_id=q.id
      AND ts_en.locale='en' AND ts_en.field='summary'
    WHERE q.status = 'published'
      AND (
        q.slug ILIKE '%' || ${term} || '%'
        OR infi_immutable_unaccent(COALESCE(t.value, t_en.value, '')) ILIKE '%' || infi_immutable_unaccent(${term}) || '%'
      )
    ORDER BY q.sort_order LIMIT 1
  `;
  return rows[0] ?? null;
}

async function findTradition(
  term: string,
  locale: string,
): Promise<TraditionRow | null> {
  let rows = await sql<TraditionRow[]>`
    SELECT t.id, t.slug, t.era_start, t.era_end,
      COALESCE(tn.value, tn_en.value, t.slug) AS name,
      COALESCE(ts.value, ts_en.value, '') AS summary,
      COALESCE(tc.value, tc_en.value) AS collection_name
    FROM infi_tradition t
    LEFT JOIN infi_translation tn ON tn.entity_type='tradition' AND tn.entity_id=t.id
      AND tn.locale=${locale} AND tn.field='name'
    LEFT JOIN infi_translation tn_en ON tn_en.entity_type='tradition' AND tn_en.entity_id=t.id
      AND tn_en.locale='en' AND tn_en.field='name'
    LEFT JOIN infi_translation ts ON ts.entity_type='tradition' AND ts.entity_id=t.id
      AND ts.locale=${locale} AND ts.field='summary'
    LEFT JOIN infi_translation ts_en ON ts_en.entity_type='tradition' AND ts_en.entity_id=t.id
      AND ts_en.locale='en' AND ts_en.field='summary'
    LEFT JOIN infi_translation tc ON tc.entity_type='collection' AND tc.entity_id=t.collection_id
      AND tc.locale=${locale} AND tc.field='name'
    LEFT JOIN infi_translation tc_en ON tc_en.entity_type='collection' AND tc_en.entity_id=t.collection_id
      AND tc_en.locale='en' AND tc_en.field='name'
    WHERE t.slug = ${term} AND t.status = 'published'
  `;
  if (rows[0]) return rows[0];

  rows = await sql<TraditionRow[]>`
    SELECT t.id, t.slug, t.era_start, t.era_end,
      COALESCE(tn.value, tn_en.value, t.slug) AS name,
      COALESCE(ts.value, ts_en.value, '') AS summary,
      COALESCE(tc.value, tc_en.value) AS collection_name
    FROM infi_tradition t
    LEFT JOIN infi_translation tn ON tn.entity_type='tradition' AND tn.entity_id=t.id
      AND tn.locale=${locale} AND tn.field='name'
    LEFT JOIN infi_translation tn_en ON tn_en.entity_type='tradition' AND tn_en.entity_id=t.id
      AND tn_en.locale='en' AND tn_en.field='name'
    LEFT JOIN infi_translation ts ON ts.entity_type='tradition' AND ts.entity_id=t.id
      AND ts.locale=${locale} AND ts.field='summary'
    LEFT JOIN infi_translation ts_en ON ts_en.entity_type='tradition' AND ts_en.entity_id=t.id
      AND ts_en.locale='en' AND ts_en.field='summary'
    LEFT JOIN infi_translation tc ON tc.entity_type='collection' AND tc.entity_id=t.collection_id
      AND tc.locale=${locale} AND tc.field='name'
    LEFT JOIN infi_translation tc_en ON tc_en.entity_type='collection' AND tc_en.entity_id=t.collection_id
      AND tc_en.locale='en' AND tc_en.field='name'
    WHERE t.status = 'published'
      AND (
        t.slug ILIKE '%' || ${term} || '%'
        OR infi_immutable_unaccent(COALESCE(tn.value, tn_en.value, '')) ILIKE '%' || infi_immutable_unaccent(${term}) || '%'
      )
    LIMIT 1
  `;
  return rows[0] ?? null;
}

async function getConceptsForQuestionAndTradition(
  questionId: string,
  traditionId: string | null,
  locale: string,
): Promise<ConceptRow[]> {
  if (traditionId) {
    return sql<ConceptRow[]>`
      SELECT c.id, c.slug, c.original_term, c.original_script, c.transliteration,
        COALESCE(tn.value, tn_en.value, c.slug) AS name,
        COALESCE(ts.value, ts_en.value, '') AS summary,
        COALESCE(tt.value, tt_en.value) AS tradition_name
      FROM infi_edge eq
      JOIN infi_concept c ON c.id = eq.to_id AND c.status = 'published'
      LEFT JOIN infi_edge et ON et.from_type='concept' AND et.from_id=c.id
        AND et.to_type='tradition' AND et.to_id=${traditionId}
        AND et.approved_at IS NOT NULL
      LEFT JOIN infi_translation tn ON tn.entity_type='concept' AND tn.entity_id=c.id
        AND tn.locale=${locale} AND tn.field='name'
      LEFT JOIN infi_translation tn_en ON tn_en.entity_type='concept' AND tn_en.entity_id=c.id
        AND tn_en.locale='en' AND tn_en.field='name'
      LEFT JOIN infi_translation ts ON ts.entity_type='concept' AND ts.entity_id=c.id
        AND ts.locale=${locale} AND ts.field='summary'
      LEFT JOIN infi_translation ts_en ON ts_en.entity_type='concept' AND ts_en.entity_id=c.id
        AND ts_en.locale='en' AND ts_en.field='summary'
      LEFT JOIN infi_translation tt ON tt.entity_type='tradition' AND tt.entity_id=c.tradition_id
        AND tt.locale=${locale} AND tt.field='name'
      LEFT JOIN infi_translation tt_en ON tt_en.entity_type='tradition' AND tt_en.entity_id=c.tradition_id
        AND tt_en.locale='en' AND tt_en.field='name'
      WHERE eq.from_type='question' AND eq.from_id=${questionId}
        AND eq.to_type='concept' AND eq.approved_at IS NOT NULL
        AND (c.tradition_id = ${traditionId} OR et.id IS NOT NULL)
      ORDER BY eq.weight DESC
    `;
  }

  return sql<ConceptRow[]>`
    SELECT c.id, c.slug, c.original_term, c.original_script, c.transliteration,
      COALESCE(tn.value, tn_en.value, c.slug) AS name,
      COALESCE(ts.value, ts_en.value, '') AS summary,
      COALESCE(tt.value, tt_en.value) AS tradition_name
    FROM infi_edge eq
    JOIN infi_concept c ON c.id = eq.to_id AND c.status = 'published'
    LEFT JOIN infi_translation tn ON tn.entity_type='concept' AND tn.entity_id=c.id
      AND tn.locale=${locale} AND tn.field='name'
    LEFT JOIN infi_translation tn_en ON tn_en.entity_type='concept' AND tn_en.entity_id=c.id
      AND tn_en.locale='en' AND tn_en.field='name'
    LEFT JOIN infi_translation ts ON ts.entity_type='concept' AND ts.entity_id=c.id
      AND ts.locale=${locale} AND ts.field='summary'
    LEFT JOIN infi_translation ts_en ON ts_en.entity_type='concept' AND ts_en.entity_id=c.id
      AND ts_en.locale='en' AND ts_en.field='summary'
    LEFT JOIN infi_translation tt ON tt.entity_type='tradition' AND tt.entity_id=c.tradition_id
      AND tt.locale=${locale} AND tt.field='name'
    LEFT JOIN infi_translation tt_en ON tt_en.entity_type='tradition' AND tt_en.entity_id=c.tradition_id
      AND tt_en.locale='en' AND tt_en.field='name'
    WHERE eq.from_type='question' AND eq.from_id=${questionId}
      AND eq.to_type='concept' AND eq.approved_at IS NOT NULL
    ORDER BY eq.weight DESC
  `;
}

async function getRelatedConcepts(
  conceptIds: string[],
  locale: string,
): Promise<EdgeRow[]> {
  if (conceptIds.length === 0) return [];
  return sql<EdgeRow[]>`
    SELECT e.from_type, e.from_id, e.to_type, e.to_id, e.relation,
      e.weight::float AS weight,
      COALESCE(tn.value, tn_en.value, e.to_id) AS to_name
    FROM infi_edge e
    LEFT JOIN infi_translation tn ON tn.entity_type=e.to_type AND tn.entity_id=e.to_id
      AND tn.locale=${locale} AND tn.field='name'
    LEFT JOIN infi_translation tn_en ON tn_en.entity_type=e.to_type AND tn_en.entity_id=e.to_id
      AND tn_en.locale='en' AND tn_en.field='name'
    WHERE e.from_type='concept' AND e.from_id = ANY(${conceptIds})
      AND e.to_type='concept' AND e.approved_at IS NOT NULL
    ORDER BY e.weight DESC
  `;
}

async function getAuthors(
  traditionId: string,
  locale: string,
): Promise<AuthorRow[]> {
  return sql<AuthorRow[]>`
    SELECT a.id, a.slug, a.birth_year, a.death_year,
      COALESCE(tn.value, tn_en.value, a.slug) AS name,
      COALESCE(ts.value, ts_en.value, '') AS summary
    FROM infi_author a
    LEFT JOIN infi_translation tn ON tn.entity_type='author' AND tn.entity_id=a.id
      AND tn.locale=${locale} AND tn.field='name'
    LEFT JOIN infi_translation tn_en ON tn_en.entity_type='author' AND tn_en.entity_id=a.id
      AND tn_en.locale='en' AND tn_en.field='name'
    LEFT JOIN infi_translation ts ON ts.entity_type='author' AND ts.entity_id=a.id
      AND ts.locale=${locale} AND ts.field='summary'
    LEFT JOIN infi_translation ts_en ON ts_en.entity_type='author' AND ts_en.entity_id=a.id
      AND ts_en.locale='en' AND ts_en.field='summary'
    WHERE a.tradition_id = ${traditionId} AND a.status = 'published'
    ORDER BY a.birth_year NULLS LAST
  `;
}

async function getWorks(
  traditionId: string,
  locale: string,
): Promise<WorkRow[]> {
  return sql<WorkRow[]>`
    SELECT w.id, w.slug, w.original_language, w.composed_start, w.composed_end,
      COALESCE(tn.value, tn_en.value, w.slug) AS name,
      COALESCE(ts.value, ts_en.value, '') AS summary,
      COALESCE(ta.value, ta_en.value) AS author_name
    FROM infi_work w
    LEFT JOIN infi_translation tn ON tn.entity_type='work' AND tn.entity_id=w.id
      AND tn.locale=${locale} AND tn.field='name'
    LEFT JOIN infi_translation tn_en ON tn_en.entity_type='work' AND tn_en.entity_id=w.id
      AND tn_en.locale='en' AND tn_en.field='name'
    LEFT JOIN infi_translation ts ON ts.entity_type='work' AND ts.entity_id=w.id
      AND ts.locale=${locale} AND ts.field='summary'
    LEFT JOIN infi_translation ts_en ON ts_en.entity_type='work' AND ts_en.entity_id=w.id
      AND ts_en.locale='en' AND ts_en.field='summary'
    LEFT JOIN infi_translation ta ON ta.entity_type='author' AND ta.entity_id=w.author_id
      AND ta.locale=${locale} AND ta.field='name'
    LEFT JOIN infi_translation ta_en ON ta_en.entity_type='author' AND ta_en.entity_id=w.author_id
      AND ta_en.locale='en' AND ta_en.field='name'
    WHERE w.tradition_id = ${traditionId} AND w.status = 'published'
    ORDER BY w.composed_start NULLS LAST
  `;
}

async function getPractices(
  traditionId: string,
  locale: string,
): Promise<PracticeRow[]> {
  return sql<PracticeRow[]>`
    SELECT p.id, p.slug,
      COALESCE(tn.value, tn_en.value, p.slug) AS name,
      COALESCE(ts.value, ts_en.value, '') AS summary
    FROM infi_practice p
    LEFT JOIN infi_translation tn ON tn.entity_type='practice' AND tn.entity_id=p.id
      AND tn.locale=${locale} AND tn.field='name'
    LEFT JOIN infi_translation tn_en ON tn_en.entity_type='practice' AND tn_en.entity_id=p.id
      AND tn_en.locale='en' AND tn_en.field='name'
    LEFT JOIN infi_translation ts ON ts.entity_type='practice' AND ts.entity_id=p.id
      AND ts.locale=${locale} AND ts.field='summary'
    LEFT JOIN infi_translation ts_en ON ts_en.entity_type='practice' AND ts_en.entity_id=p.id
      AND ts_en.locale='en' AND ts_en.field='summary'
    WHERE p.tradition_id = ${traditionId} AND p.status = 'published'
  `;
}

async function getSymbols(
  traditionId: string,
  locale: string,
): Promise<SymbolRow[]> {
  return sql<SymbolRow[]>`
    SELECT s.id, s.slug, s.unicode_char,
      COALESCE(tn.value, tn_en.value, s.slug) AS name,
      COALESCE(ts.value, ts_en.value, '') AS summary
    FROM infi_symbol s
    LEFT JOIN infi_translation tn ON tn.entity_type='symbol' AND tn.entity_id=s.id
      AND tn.locale=${locale} AND tn.field='name'
    LEFT JOIN infi_translation tn_en ON tn_en.entity_type='symbol' AND tn_en.entity_id=s.id
      AND tn_en.locale='en' AND tn_en.field='name'
    LEFT JOIN infi_translation ts ON ts.entity_type='symbol' AND ts.entity_id=s.id
      AND ts.locale=${locale} AND ts.field='summary'
    LEFT JOIN infi_translation ts_en ON ts_en.entity_type='symbol' AND ts_en.entity_id=s.id
      AND ts_en.locale='en' AND ts_en.field='summary'
    WHERE s.tradition_id = ${traditionId} AND s.status = 'published'
  `;
}

async function getCitations(
  questionId: string,
  traditionId: string | null,
): Promise<CitationRow[]> {
  if (traditionId) {
    return sql<CitationRow[]>`
      SELECT s.title AS source_title, s.kind AS source_kind,
        s.author_name AS source_author, s.year AS source_year,
        s.publisher AS source_publisher, s.url_canonical AS source_url,
        s.doi AS source_doi, s.isbn AS source_isbn, s.license AS source_license,
        ct.locator, ct.claim_text, ct.quote
      FROM infi_living_page lp
      JOIN infi_documentary d ON d.id = lp.documentary_id
      JOIN infi_living_page_citation lpc ON lpc.living_page_id = lp.id
      JOIN infi_citation ct ON ct.id = lpc.citation_id
      JOIN infi_source s ON s.id = ct.source_id
      WHERE lp.question_id = ${questionId}
        AND d.tradition_id = ${traditionId}
        AND lp.status = 'published'
      ORDER BY s.reliability_tier, s.year NULLS LAST
    `;
  }

  return sql<CitationRow[]>`
    SELECT s.title AS source_title, s.kind AS source_kind,
      s.author_name AS source_author, s.year AS source_year,
      s.publisher AS source_publisher, s.url_canonical AS source_url,
      s.doi AS source_doi, s.isbn AS source_isbn, s.license AS source_license,
      ct.locator, ct.claim_text, ct.quote
    FROM infi_living_page lp
    JOIN infi_living_page_citation lpc ON lpc.living_page_id = lp.id
    JOIN infi_citation ct ON ct.id = lpc.citation_id
    JOIN infi_source s ON s.id = ct.source_id
    WHERE lp.question_id = ${questionId}
      AND lp.status = 'published'
    ORDER BY s.reliability_tier, s.year NULLS LAST
  `;
}

async function getDerivedTraditions(
  traditionId: string,
  locale: string,
): Promise<DerivedTraditionRow[]> {
  return sql<DerivedTraditionRow[]>`
    SELECT t.id, t.slug, e.relation,
      COALESCE(tn.value, tn_en.value, t.slug) AS name
    FROM infi_edge e
    JOIN infi_tradition t ON (
      (e.from_type='tradition' AND e.from_id=${traditionId} AND t.id=e.to_id)
      OR (e.to_type='tradition' AND e.to_id=${traditionId} AND t.id=e.from_id)
    )
    LEFT JOIN infi_translation tn ON tn.entity_type='tradition' AND tn.entity_id=t.id
      AND tn.locale=${locale} AND tn.field='name'
    LEFT JOIN infi_translation tn_en ON tn_en.entity_type='tradition' AND tn_en.entity_id=t.id
      AND tn_en.locale='en' AND tn_en.field='name'
    WHERE (e.from_type='tradition' AND e.from_id=${traditionId} AND e.to_type='tradition')
      OR (e.to_type='tradition' AND e.to_id=${traditionId} AND e.from_type='tradition')
    AND e.approved_at IS NOT NULL
    AND t.status = 'published'
  `;
}

async function getAllTraditionsForQuestion(
  questionId: string,
  locale: string,
): Promise<TraditionRow[]> {
  return sql<TraditionRow[]>`
    SELECT DISTINCT ON (t.id)
      t.id, t.slug, t.era_start, t.era_end,
      COALESCE(tn.value, tn_en.value, t.slug) AS name,
      COALESCE(ts.value, ts_en.value, '') AS summary,
      COALESCE(tc.value, tc_en.value) AS collection_name
    FROM infi_edge e1
    JOIN infi_concept c ON c.id = e1.to_id AND c.status = 'published'
    JOIN infi_edge e2 ON e2.from_type='concept' AND e2.from_id=c.id
      AND e2.to_type='tradition' AND e2.approved_at IS NOT NULL
    JOIN infi_tradition t ON t.id = e2.to_id AND t.status = 'published'
    LEFT JOIN infi_translation tn ON tn.entity_type='tradition' AND tn.entity_id=t.id
      AND tn.locale=${locale} AND tn.field='name'
    LEFT JOIN infi_translation tn_en ON tn_en.entity_type='tradition' AND tn_en.entity_id=t.id
      AND tn_en.locale='en' AND tn_en.field='name'
    LEFT JOIN infi_translation ts ON ts.entity_type='tradition' AND ts.entity_id=t.id
      AND ts.locale=${locale} AND ts.field='summary'
    LEFT JOIN infi_translation ts_en ON ts_en.entity_type='tradition' AND ts_en.entity_id=t.id
      AND ts_en.locale='en' AND ts_en.field='summary'
    LEFT JOIN infi_translation tc ON tc.entity_type='collection' AND tc.entity_id=t.collection_id
      AND tc.locale=${locale} AND tc.field='name'
    LEFT JOIN infi_translation tc_en ON tc_en.entity_type='collection' AND tc_en.entity_id=t.collection_id
      AND tc_en.locale='en' AND tc_en.field='name'
    WHERE e1.from_type='question' AND e1.from_id=${questionId}
      AND e1.to_type='concept' AND e1.approved_at IS NOT NULL
    ORDER BY t.id
  `;
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
    LEFT JOIN infi_translation t ON t.entity_type='question' AND t.entity_id=q.id
      AND t.locale=${locale} AND t.field='title'
    WHERE q.status = 'published' ORDER BY q.sort_order
  `;

  const traditions = await sql<{ slug: string; name: string }[]>`
    SELECT t.slug, COALESCE(tn.value, t.slug) AS name
    FROM infi_tradition t
    LEFT JOIN infi_translation tn ON tn.entity_type='tradition' AND tn.entity_id=t.id
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
