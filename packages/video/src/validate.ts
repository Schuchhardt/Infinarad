import type { Brief, JobParams, VideoScript } from "./types";
import { targetShotCount } from "./script";

export interface ValidationResult {
  errors: string[];
  warnings: string[];
  /** True when the script had to assert things the graph cannot cite yet. */
  needsSources: boolean;
  estimatedDurationSec: number;
}

const CJK_LOCALES = new Set(["zh", "ja"]);

/**
 * Rough spoken length of a narration line. Word-rate for alphabetic scripts,
 * character-rate for Chinese and Japanese, where a "word" split is meaningless.
 */
export function estimateSpeechSeconds(text: string, locale: string): number {
  const trimmed = text.trim();
  if (trimmed === "") return 0;
  if (CJK_LOCALES.has(locale)) {
    const chars = trimmed.replace(/\s+/g, "").length;
    return chars / 4.5;
  }
  const words = trimmed.split(/\s+/).length;
  return words / 2.4;
}

export function validateScript(
  script: VideoScript,
  brief: Brief,
  params: JobParams,
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const knownCitations = new Set(brief.citations.map((c) => c.id));
  const chapterSlugs = new Set(script.chapters.map((c) => c.slug));
  const seenIndexes = new Set<number>();
  const seenNarration = new Set<string>();

  const targetShots = targetShotCount(params);
  if (script.shots.length < Math.floor(targetShots * 0.6)) {
    errors.push(
      `Only ${script.shots.length} shots for a ${params.durationSec}s film; about ${targetShots} were asked for.`,
    );
  }
  if (script.shots.length > Math.ceil(targetShots * 1.5)) {
    errors.push(
      `${script.shots.length} shots is far more than the ~${targetShots} asked for; merge the redundant ones.`,
    );
  }

  let estimatedDurationSec = 0;
  let claimsWithoutCitation = 0;

  for (const shot of script.shots) {
    const label = `shot ${shot.index}`;

    if (seenIndexes.has(shot.index)) {
      errors.push(`Duplicate ${label}: shot indexes must be unique.`);
    }
    seenIndexes.add(shot.index);

    if (!chapterSlugs.has(shot.chapter_slug)) {
      errors.push(
        `${label} names chapter "${shot.chapter_slug}", which is not in the chapter list.`,
      );
    }

    const narrationKey = shot.narration.trim().toLowerCase();
    if (seenNarration.has(narrationKey)) {
      errors.push(`${label} repeats narration used in an earlier shot.`);
    }
    seenNarration.add(narrationKey);

    const spoken = estimateSpeechSeconds(shot.narration, brief.locale);
    estimatedDurationSec += Math.max(shot.duration_sec, spoken);

    if (spoken > shot.duration_sec * 1.6) {
      errors.push(
        `${label} narration needs ~${spoken.toFixed(1)}s but the shot is ${shot.duration_sec}s. Cut it down.`,
      );
    } else if (spoken > 0 && spoken < shot.duration_sec * 0.35) {
      warnings.push(
        `${label} narration only fills ~${spoken.toFixed(1)}s of a ${shot.duration_sec}s shot.`,
      );
    }

    const unknown = shot.citation_ids.filter((id) => !knownCitations.has(id));
    if (unknown.length > 0) {
      errors.push(
        `${label} cites unknown citation ids: ${unknown.join(", ")}. Only ids from the brief are valid.`,
      );
    }

    if (shot.claim_text && shot.citation_ids.length === 0) {
      claimsWithoutCitation += 1;
      if (knownCitations.size > 0) {
        errors.push(
          `${label} asserts "${shot.claim_text}" with no citation, and the brief has citable sources.`,
        );
      }
    }
  }

  const missingIndexes: number[] = [];
  for (let i = 1; i <= script.shots.length; i += 1) {
    if (!seenIndexes.has(i)) missingIndexes.push(i);
  }
  if (missingIndexes.length > 0) {
    errors.push(
      `Shot indexes must run 1..${script.shots.length} with no gaps; missing ${missingIndexes.join(", ")}.`,
    );
  }

  const drift = Math.abs(estimatedDurationSec - params.durationSec) / params.durationSec;
  if (drift > 0.25) {
    errors.push(
      `Script runs ~${Math.round(estimatedDurationSec)}s against a ${params.durationSec}s target (${Math.round(drift * 100)}% off).`,
    );
  }

  for (const used of script.sources_used) {
    if (!knownCitations.has(used.citation_id)) {
      errors.push(`sources_used lists unknown citation id "${used.citation_id}".`);
    }
  }

  const citedAnywhere = new Set(script.shots.flatMap((s) => s.citation_ids));
  for (const id of citedAnywhere) {
    if (!script.sources_used.some((u) => u.citation_id === id)) {
      warnings.push(`Citation ${id} is used in a shot but missing from sources_used.`);
    }
  }

  const needsSources = knownCitations.size === 0 && claimsWithoutCitation > 0;
  if (needsSources) {
    warnings.push(
      `${claimsWithoutCitation} shots make claims the graph cannot cite yet — this question has no published living-page citations. An editor must source them before publishing.`,
    );
  }

  return { errors, warnings, needsSources, estimatedDurationSec };
}
