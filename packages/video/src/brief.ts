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
} from "@infinarad/db";
import type { Brief } from "./types";

export class BriefError extends Error {}

export interface BriefRequest {
  questionSlug: string;
  traditionSlug?: string | null;
  locale: string;
  angleSlug?: string;
}

/**
 * Pulls everything the graph knows about one question seen from one tradition.
 * This is the only knowledge the script generator is allowed to draw on.
 */
export async function buildBrief(req: BriefRequest): Promise<Brief> {
  const question = await findQuestion(req.questionSlug, req.locale);
  if (!question) {
    throw new BriefError(
      `No published question matches "${req.questionSlug}".`,
    );
  }

  let tradition = null;
  if (req.traditionSlug) {
    tradition = await findTradition(req.traditionSlug, req.locale);
    if (!tradition) {
      throw new BriefError(
        `No published tradition matches "${req.traditionSlug}".`,
      );
    }
  }

  const [concepts, otherTraditions, citations] = await Promise.all([
    getConceptsForQuestionAndTradition(
      question.id,
      tradition?.id ?? null,
      req.locale,
    ),
    getAllTraditionsForQuestion(question.id, req.locale),
    getCitations(question.id, tradition?.id ?? null),
  ]);

  const relatedConcepts = await getRelatedConcepts(
    concepts.map((c) => c.id),
    req.locale,
  );

  const [authors, works, practices, symbols, derivedTraditions] = tradition
    ? await Promise.all([
        getAuthors(tradition.id, req.locale),
        getWorks(tradition.id, req.locale),
        getPractices(tradition.id, req.locale),
        getSymbols(tradition.id, req.locale),
        getDerivedTraditions(tradition.id, req.locale),
      ])
    : [[], [], [], [], []];

  if (concepts.length === 0 && !tradition) {
    throw new BriefError(
      `Question "${question.slug}" has no approved concept edges — there is nothing to build a script from yet.`,
    );
  }

  return {
    locale: req.locale,
    angleSlug: req.angleSlug ?? tradition?.slug ?? "all-traditions",
    question,
    tradition,
    otherTraditions: otherTraditions.filter((t) => t.id !== tradition?.id),
    concepts,
    relatedConcepts,
    authors,
    works,
    practices,
    symbols,
    citations,
    derivedTraditions,
  };
}

/** Compact, token-frugal rendering of the brief for the script prompt. */
export function renderBriefForPrompt(brief: Brief): string {
  const years = (start: number | null, end: number | null): string => {
    const fmt = (y: number | null) =>
      y === null ? "?" : y < 0 ? `${Math.abs(y)} BCE` : `${y} CE`;
    if (start === null && end === null) return "";
    return ` (${fmt(start)}–${fmt(end)})`;
  };

  const lines: string[] = [];

  lines.push(`QUESTION: ${brief.question.title}`);
  if (brief.question.summary) lines.push(brief.question.summary);
  lines.push("");

  if (brief.tradition) {
    lines.push(
      `TRADITION (the angle of this documentary): ${brief.tradition.name}` +
        years(brief.tradition.era_start, brief.tradition.era_end),
    );
    if (brief.tradition.collection_name) {
      lines.push(`Collection: ${brief.tradition.collection_name}`);
    }
    if (brief.tradition.summary) lines.push(brief.tradition.summary);
    lines.push("");
  }

  if (brief.concepts.length > 0) {
    lines.push("CONCEPTS");
    for (const c of brief.concepts) {
      const original = c.original_term
        ? ` [${c.original_term}${c.transliteration ? ` / ${c.transliteration}` : ""}]`
        : "";
      lines.push(`- ${c.name}${original}: ${c.summary}`);
    }
    lines.push("");
  }

  if (brief.authors.length > 0) {
    lines.push("AUTHORS");
    for (const a of brief.authors) {
      lines.push(`- ${a.name}${years(a.birth_year, a.death_year)}: ${a.summary}`);
    }
    lines.push("");
  }

  if (brief.works.length > 0) {
    lines.push("WORKS");
    for (const w of brief.works) {
      const author = w.author_name ? ` — ${w.author_name}` : "";
      lines.push(
        `- ${w.name}${author}${years(w.composed_start, w.composed_end)}: ${w.summary}`,
      );
    }
    lines.push("");
  }

  if (brief.practices.length > 0) {
    lines.push("PRACTICES");
    for (const p of brief.practices) lines.push(`- ${p.name}: ${p.summary}`);
    lines.push("");
  }

  if (brief.symbols.length > 0) {
    lines.push("SYMBOLS (visual anchors)");
    for (const s of brief.symbols) {
      lines.push(`- ${s.name}${s.unicode_char ? ` ${s.unicode_char}` : ""}: ${s.summary}`);
    }
    lines.push("");
  }

  if (brief.derivedTraditions.length > 0) {
    lines.push("RELATED TRADITIONS");
    for (const t of brief.derivedTraditions) {
      lines.push(`- ${t.name} (${t.relation})`);
    }
    lines.push("");
  }

  if (brief.otherTraditions.length > 0) {
    lines.push(
      `OTHER TRADITIONS ANSWERING THE SAME QUESTION (mention only as contrast): ${brief.otherTraditions
        .map((t) => t.name)
        .join(", ")}`,
    );
    lines.push("");
  }

  lines.push("CITATIONS (the only citable evidence you have)");
  if (brief.citations.length === 0) {
    lines.push(
      "- none. Every claim must stay at the level of the summaries above; assert no dates, numbers or quotations that are not written there.",
    );
  } else {
    for (const c of brief.citations) {
      const author = c.source_author ? `${c.source_author}, ` : "";
      const year = c.source_year ? ` (${c.source_year})` : "";
      lines.push(
        `- ${c.id} | ${author}${c.source_title}${year}, ${c.locator} | claim: ${c.claim_text}` +
          (c.quote ? ` | quotable: "${c.quote}"` : " | not quotable"),
      );
    }
  }

  return lines.join("\n");
}
