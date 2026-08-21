import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropicConfig } from "./config";
import { renderBriefForPrompt } from "./brief";
import { VideoScriptSchema } from "./types";
import type { Brief, JobParams, VideoScript } from "./types";

export class ScriptError extends Error {}

const LOCALE_NAMES: Record<string, string> = {
  en: "English",
  es: "Spanish (neutral Latin American)",
  pt: "Portuguese (Brazilian)",
  fr: "French",
  de: "German",
  ar: "Arabic (Modern Standard)",
  hi: "Hindi",
  zh: "Chinese (Simplified)",
  ja: "Japanese",
  he: "Hebrew",
};

export function localeName(locale: string): string {
  return LOCALE_NAMES[locale] ?? locale;
}

export function targetShotCount(params: JobParams): number {
  return Math.max(3, Math.round(params.durationSec / params.shotSeconds));
}

function systemPrompt(brief: Brief, params: JobParams): string {
  const shots = targetShotCount(params);
  const language = localeName(brief.locale);

  return `You are the head writer of Infinarad, a museum-quality documentary series about humanity's oldest questions. You turn a research brief drawn from a curated knowledge graph into a complete, shot-by-shot production script.

# The film you are writing
- Question: "${brief.question.title}"
- Angle: ${brief.tradition ? brief.tradition.name : "all traditions, comparative"}
- Runtime: about ${params.durationSec} seconds, told in ${shots} shots of roughly ${params.shotSeconds} seconds each.
- Narration language: ${language}. Every writer-facing field (narration, titles, on-screen text, description, tags) is written in ${language}. Image and motion prompts are written in English, because the image and video models only read English.

# Editorial law — this is not negotiable
1. The brief below is the ONLY knowledge you may use. You may compress, order and dramatise it; you may not add facts, dates, numbers, names or quotations that are absent from it.
2. Any shot whose narration asserts a specific fact must set claim_text to that assertion and list the citation ids that support it. Use only ids that appear verbatim in the CITATIONS block.
3. A shot that carries no factual assertion (an atmosphere or transition shot) sets claim_text to null and citation_ids to an empty array. Prefer these over inventing evidence.
4. Never quote a source unless the citation is marked quotable, and then only the exact quoted words given.
5. Treat every tradition with the seriousness a scholar would. No proselytising, no mockery, no "many people believe" hedging, no false balance between a tradition's own account and a modern verdict on it.

# Structure
- The first shot is the hook: it lands the question in the viewer's own life in one sentence. No throat-clearing, no channel intro.
- Group the shots into ${Math.max(2, Math.min(6, Math.ceil(shots / 6)))} to 6 chapters. Every shot names its chapter's slug.
- The last shot resolves the question honestly — including saying that a tradition leaves it open, when it does.
- Narration flows as one continuous voice-over across shots: read end to end it must be a single essay, not ${shots} captions.

# Writing the narration
- Roughly ${Math.round(params.shotSeconds * 2.4)} words per shot: at ${params.shotSeconds} seconds a shot, that is what a narrator can say without rushing.
- Spoken register: short sentences, concrete nouns, no bullet-point syntax, no stage directions, no "in this video".
- Write numerals as words when a narrator would say them.

# Writing the image prompts (text-to-image, English)
- ${params.visualStyle}
- Each image_prompt is a self-contained description of one still frame: subject, materials, light, colour, composition, lens feel. 40-70 words. Assume the model has no memory of the other shots, so restate the house style cues in every prompt.
- No text or lettering in frame — the model renders it as gibberish. No identifiable faces, no modern objects, no logos, no violence, no religious figures depicted as people.

# Writing the motion prompts (image-to-video, English)
- Describe what moves in that still and how the camera behaves: drifting dust, a hand turning a page, water settling, light crawling across stone.
- One movement idea per shot. Slow, deliberate, documentary — never a whip pan, never a crash zoom.
- The camera field carries the lens and move ("85mm macro, slow push-in"); transition says how the shot exits into the next one ("cut on the closing hand", "dissolve through candle smoke").

# Packaging
- description: a YouTube description in ${language} — two paragraphs, then a "Fuentes"-style source list, then a line pointing to infinarad.com.
- tags: 3 to 20 lowercase search terms in ${language}.
- thumbnail_prompt: English, one striking frame, no faces, no text.
- sources_used lists every citation id you actually cited, once each, with one line on what it supports.`;
}

function userPrompt(brief: Brief, params: JobParams, repairErrors?: string[]): string {
  const parts = [
    "# RESEARCH BRIEF",
    renderBriefForPrompt(brief),
    "",
    `# TASK`,
    `Write the complete production script: ${targetShotCount(params)} shots, ${params.durationSec} seconds total, narration in ${localeName(brief.locale)}.`,
  ];

  if (repairErrors && repairErrors.length > 0) {
    parts.push(
      "",
      "# YOUR PREVIOUS ATTEMPT WAS REJECTED",
      "Fix every point below and return the whole script again:",
      ...repairErrors.map((e) => `- ${e}`),
    );
  }

  return parts.join("\n");
}

/**
 * Generates one script. `repairErrors` feeds validation failures from a prior
 * attempt back to the model, which is how the pipeline self-corrects instead of
 * failing the job on the first rejected draft.
 */
export async function generateScript(
  brief: Brief,
  params: JobParams,
  repairErrors?: string[],
): Promise<VideoScript> {
  const config = anthropicConfig();
  const client = new Anthropic({ apiKey: config.apiKey });

  const response = await client.messages.parse({
    model: config.model,
    max_tokens: config.maxTokens,
    thinking: { type: "adaptive" },
    output_config: {
      effort: config.effort,
      format: zodOutputFormat(VideoScriptSchema),
    },
    system: [
      {
        type: "text",
        text: systemPrompt(brief, params),
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userPrompt(brief, params, repairErrors) }],
  });

  if (response.stop_reason === "refusal") {
    throw new ScriptError(
      `The model declined to write this script (${response.stop_details?.category ?? "unknown"}).`,
    );
  }

  if (!response.parsed_output) {
    throw new ScriptError(
      `The model returned no parseable script (stop_reason: ${response.stop_reason}).`,
    );
  }

  return response.parsed_output;
}
