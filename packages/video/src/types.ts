import { z } from "zod";
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
} from "@infinarad/db";

/** House visual language — illuminated manuscript, lapis and gold, no faces. */
export const DEFAULT_VISUAL_STYLE =
  "Illuminated-manuscript documentary: deep lapis-lazuli blues and gold leaf on near-black, " +
  "candle-lit parchment textures, hand-inked marginalia, museum lighting, macro detail on " +
  "materials (ink, vellum, stone, water, dust in light). No recognisable modern objects, " +
  "no legible text in frame, no identifiable human faces — hands, silhouettes and landscapes only.";

export const JobParamsSchema = z.object({
  /** Target runtime of the finished documentary. */
  durationSec: z.number().int().min(30).max(1200).default(180),
  /** Seconds per generated clip — Higgsfield DoP clips are short by design. */
  shotSeconds: z.number().min(3).max(10).default(5),
  aspect: z.enum(["landscape", "portrait", "square"]).default("landscape"),
  quality: z.enum(["720p", "1080p"]).default("1080p"),
  dopModel: z.enum(["dop-lite", "dop-turbo", "dop-standard"]).default("dop-turbo"),
  visualStyle: z.string().min(10).default(DEFAULT_VISUAL_STYLE),
  /** ElevenLabs voice override; falls back to ELEVENLABS_VOICE_ID. */
  voiceId: z.string().optional(),
  /** Deterministic keyframes across re-runs when set. */
  seed: z.number().int().min(0).max(1_000_000).optional(),
  /** Generate the script but call no media provider — for rehearsals and tests. */
  dryRun: z.boolean().default(false),
  skipNarration: z.boolean().default(false),
  skipKeyframes: z.boolean().default(false),
  skipClips: z.boolean().default(false),
});

export type JobParams = z.infer<typeof JobParamsSchema>;

/** Body accepted by POST /api/video/generate. */
export const GenerateRequestSchema = z.object({
  question: z.string().min(1),
  tradition: z.string().min(1).nullish(),
  locale: z.string().min(2).max(8).default("en"),
  /** Defaults to the tradition slug, or "all-traditions". */
  angle: z.string().min(1).optional(),
  /** Queue a fresh run even if this angle already has a job. */
  force: z.boolean().default(false),
  params: JobParamsSchema.partial().optional(),
});

export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;

export const ShotSchema = z.object({
  index: z.number().int().min(1),
  chapter_slug: z.string().min(1),
  duration_sec: z.number().min(2).max(15),
  /** Narration in the job's locale. Spoken word only — no stage directions. */
  narration: z.string().min(1),
  /** Optional burned-in caption (a term, a date, a name). */
  on_screen_text: z.string().nullable(),
  /** Still-frame prompt for text-to-image. Carries the whole composition. */
  image_prompt: z.string().min(30),
  /** What moves, and how, once the still becomes a clip. */
  motion_prompt: z.string().min(20),
  /** Lens, angle and camera move, e.g. "85mm, slow push-in, shallow depth". */
  camera: z.string().min(3),
  /** How this shot exits into the next one. */
  transition: z.string().min(3),
  /** The factual assertion this shot makes, or null for atmosphere shots. */
  claim_text: z.string().nullable(),
  /** infi_citation ids backing claim_text. Empty for atmosphere shots. */
  citation_ids: z.array(z.string()),
});

export type Shot = z.infer<typeof ShotSchema>;

export const ChapterSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
});

export const VideoScriptSchema = z.object({
  title: z.string().min(1),
  /** First 8 seconds — the reason anyone keeps watching. */
  hook: z.string().min(1),
  logline: z.string().min(1),
  chapters: z.array(ChapterSchema).min(2),
  shots: z.array(ShotSchema).min(3),
  outro: z.string().min(1),
  /** YouTube-ready description, in the job's locale. */
  description: z.string().min(1),
  tags: z.array(z.string()).min(3).max(20),
  thumbnail_prompt: z.string().min(20),
  /** Every source the narration leans on, for the on-page bibliography. */
  sources_used: z.array(
    z.object({
      citation_id: z.string(),
      source_title: z.string(),
      why: z.string(),
    }),
  ),
});

export type VideoScript = z.infer<typeof VideoScriptSchema>;

export interface Brief {
  locale: string;
  angleSlug: string;
  question: QuestionRow;
  tradition: TraditionRow | null;
  otherTraditions: TraditionRow[];
  concepts: ConceptRow[];
  relatedConcepts: EdgeRow[];
  authors: AuthorRow[];
  works: WorkRow[];
  practices: PracticeRow[];
  symbols: SymbolRow[];
  citations: CitationRow[];
  derivedTraditions: DerivedTraditionRow[];
}

export type JobStatus =
  | "queued"
  | "running"
  | "waiting"
  | "succeeded"
  | "failed"
  | "canceled";

export type JobStage =
  | "brief"
  | "script"
  | "narration"
  | "keyframes"
  | "clips"
  | "done";

export type AssetKind = "narration" | "keyframe" | "clip" | "thumbnail";

export type AssetStatus = "pending" | "submitted" | "ready" | "failed" | "skipped";

export interface VideoJob {
  id: string;
  question_id: string;
  tradition_id: string | null;
  documentary_id: string | null;
  angle_slug: string;
  locale: string;
  status: JobStatus;
  stage: JobStage;
  params: JobParams;
  brief: Brief | null;
  script_revision_id: string | null;
  idempotency_key: string;
  requested_by: string | null;
  attempt: number;
  repair_notes: string[] | null;
  lease_until: Date | null;
  error: string | null;
  created_at: Date;
  updated_at: Date;
  started_at: Date | null;
  finished_at: Date | null;
}

export interface VideoShot extends Shot {
  id: string;
  job_id: string;
}

export interface VideoAsset {
  id: string;
  job_id: string;
  shot_id: string | null;
  kind: AssetKind;
  status: AssetStatus;
  provider: string;
  provider_endpoint: string | null;
  provider_job_id: string | null;
  url: string | null;
  duration_sec: number | null;
  attempt: number;
  error: string | null;
  meta: Record<string, unknown>;
}
