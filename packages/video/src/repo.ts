import { createHash } from "node:crypto";
import { sql } from "@infinarad/db";
import { JobParamsSchema } from "./types";
import type {
  AssetKind,
  AssetStatus,
  Brief,
  JobParams,
  JobStage,
  JobStatus,
  Shot,
  VideoAsset,
  VideoJob,
  VideoShot,
} from "./types";

/** Every read and write the pipeline performs. No SQL lives outside this file. */

/**
 * jsonb parameters must go through sql.json: a plain string parameter is stored
 * as a JSON string scalar, not as the object it encodes.
 */
function json(value: unknown) {
  return sql.json(value as never);
}

interface JobRow extends Omit<VideoJob, "params" | "brief"> {
  params: unknown;
  brief: unknown;
}

function hydrateJob(row: JobRow): VideoJob {
  return {
    ...row,
    params: JobParamsSchema.parse(row.params ?? {}),
    brief: (row.brief ?? null) as Brief | null,
  };
}

export async function findOrCreateDocumentary(input: {
  questionId: string;
  questionSlug: string;
  traditionId: string | null;
  angleSlug: string;
}): Promise<string> {
  const existing = await sql<{ id: string }[]>`
    SELECT id FROM infi_documentary
    WHERE question_id = ${input.questionId} AND angle_slug = ${input.angleSlug}
  `;
  if (existing[0]) return existing[0].id;

  const slug = `${input.questionSlug}--${input.angleSlug}`;
  const inserted = await sql<{ id: string }[]>`
    INSERT INTO infi_documentary (question_id, angle_slug, tradition_id, slug, status)
    VALUES (${input.questionId}, ${input.angleSlug}, ${input.traditionId}, ${slug}, 'draft')
    ON CONFLICT (question_id, angle_slug) DO UPDATE SET angle_slug = EXCLUDED.angle_slug
    RETURNING id
  `;
  const id = inserted[0]?.id;
  if (!id) throw new Error(`Could not create documentary for ${slug}`);
  return id;
}

export async function createJob(input: {
  questionId: string;
  traditionId: string | null;
  documentaryId: string;
  angleSlug: string;
  locale: string;
  params: JobParams;
  idempotencyKey: string;
  requestedBy: string | null;
}): Promise<VideoJob> {
  const rows = await sql<JobRow[]>`
    INSERT INTO infi_video_job (
      question_id, tradition_id, documentary_id, angle_slug, locale,
      params, idempotency_key, requested_by
    ) VALUES (
      ${input.questionId}, ${input.traditionId}, ${input.documentaryId},
      ${input.angleSlug}, ${input.locale},
      ${json(input.params)}, ${input.idempotencyKey}, ${input.requestedBy}
    )
    RETURNING *
  `;
  const row = rows[0];
  if (!row) throw new Error("Job insert returned no row");
  return hydrateJob(row);
}

export async function findJobByIdempotencyKey(
  key: string,
): Promise<VideoJob | null> {
  const rows = await sql<JobRow[]>`
    SELECT * FROM infi_video_job WHERE idempotency_key = ${key}
  `;
  return rows[0] ? hydrateJob(rows[0]) : null;
}

export async function getJob(id: string): Promise<VideoJob | null> {
  const rows = await sql<JobRow[]>`SELECT * FROM infi_video_job WHERE id = ${id}`;
  return rows[0] ? hydrateJob(rows[0]) : null;
}

/**
 * Takes ownership of up to `limit` open jobs by pushing their lease into the
 * future. SKIP LOCKED lets several workers run at once without coordination;
 * an expired lease means the previous worker died mid-tick.
 */
export async function claimJobs(
  limit: number,
  leaseSeconds: number,
): Promise<VideoJob[]> {
  const rows = await sql<JobRow[]>`
    UPDATE infi_video_job SET
      status = 'running',
      lease_until = now() + make_interval(secs => ${leaseSeconds}::double precision),
      started_at = COALESCE(started_at, now())
    WHERE id IN (
      SELECT id FROM infi_video_job
      WHERE status IN ('queued','running','waiting')
        AND (lease_until IS NULL OR lease_until < now())
      ORDER BY created_at
      FOR UPDATE SKIP LOCKED
      LIMIT ${limit}
    )
    RETURNING *
  `;
  return rows.map(hydrateJob);
}

export interface JobPatch {
  status?: JobStatus;
  stage?: JobStage;
  brief?: Brief;
  scriptRevisionId?: string;
  attempt?: number;
  error?: string | null;
  /** Validation findings for the next draft; null clears them. */
  repairNotes?: string[] | null;
  /** Seconds from now before another worker may claim this job. */
  leaseSeconds?: number | null;
  finished?: boolean;
}

export async function updateJob(id: string, patch: JobPatch): Promise<void> {
  const assignments = sql`
    status = COALESCE(${patch.status ?? null}::infi_video_job_status, status),
    stage = COALESCE(${patch.stage ?? null}::infi_video_stage, stage),
    brief = ${patch.brief === undefined ? sql`brief` : sql`${json(patch.brief)}::jsonb`},
    script_revision_id = COALESCE(${patch.scriptRevisionId ?? null}, script_revision_id),
    attempt = COALESCE(${patch.attempt ?? null}::int, attempt),
    error = ${patch.error === undefined ? sql`error` : patch.error},
    repair_notes = ${
      patch.repairNotes === undefined
        ? sql`repair_notes`
        : patch.repairNotes === null
          ? sql`NULL`
          : sql`${patch.repairNotes}::text[]`
    },
    lease_until = ${
      patch.leaseSeconds === undefined
        ? sql`lease_until`
        : patch.leaseSeconds === null
          ? sql`NULL`
          : sql`now() + make_interval(secs => ${patch.leaseSeconds}::double precision)`
    },
    finished_at = ${patch.finished ? sql`now()` : sql`finished_at`}
  `;

  await sql`UPDATE infi_video_job SET ${assignments} WHERE id = ${id}`;
}

export async function logEvent(
  jobId: string,
  stage: JobStage,
  level: "info" | "warn" | "error",
  message: string,
  data: Record<string, unknown> = {},
): Promise<void> {
  await sql`
    INSERT INTO infi_video_job_event (job_id, stage, level, message, data)
    VALUES (${jobId}, ${stage}, ${level}, ${message}, ${json(data)})
  `;
}

export interface JobEvent {
  stage: JobStage;
  level: string;
  message: string;
  data: Record<string, unknown>;
  created_at: Date;
}

export async function getEvents(jobId: string, limit = 100): Promise<JobEvent[]> {
  return sql<JobEvent[]>`
    SELECT stage, level, message, data, created_at
    FROM infi_video_job_event
    WHERE job_id = ${jobId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
}

export async function replaceShots(
  jobId: string,
  shots: Shot[],
): Promise<VideoShot[]> {
  return sql.begin(async (tx) => {
    // Assets cascade from shots, so a re-run drops the previous attempt's media.
    await tx`DELETE FROM infi_video_shot WHERE job_id = ${jobId}`;

    const inserted: VideoShot[] = [];
    for (const shot of shots) {
      const rows = await tx<{ id: string }[]>`
        INSERT INTO infi_video_shot (
          job_id, idx, chapter_slug, duration_sec, narration, on_screen_text,
          image_prompt, motion_prompt, camera, transition, claim_text,
          citation_ids, body
        ) VALUES (
          ${jobId}, ${shot.index}, ${shot.chapter_slug}, ${shot.duration_sec},
          ${shot.narration}, ${shot.on_screen_text}, ${shot.image_prompt},
          ${shot.motion_prompt}, ${shot.camera}, ${shot.transition},
          ${shot.claim_text}, ${shot.citation_ids}::text[],
          ${json(shot)}
        )
        RETURNING id
      `;
      const id = rows[0]?.id;
      if (!id) throw new Error(`Shot ${shot.index} insert returned no row`);
      inserted.push({ ...shot, id, job_id: jobId });
    }
    return inserted;
  });
}

interface ShotRow {
  id: string;
  job_id: string;
  idx: number;
  body: unknown;
}

export async function getShots(jobId: string): Promise<VideoShot[]> {
  const rows = await sql<ShotRow[]>`
    SELECT id, job_id, idx, body FROM infi_video_shot
    WHERE job_id = ${jobId} ORDER BY idx
  `;
  return rows.map((row) => ({
    ...(row.body as Shot),
    id: row.id,
    job_id: row.job_id,
  }));
}

/**
 * Creates the asset placeholders for a stage. Idempotent: a re-run keeps the
 * assets that already reached 'ready' and only refills the gaps.
 */
export async function ensureShotAssets(
  jobId: string,
  shotIds: string[],
  kind: AssetKind,
  provider: string,
): Promise<void> {
  if (shotIds.length === 0) return;
  await sql`
    INSERT INTO infi_video_asset (job_id, shot_id, kind, provider)
    SELECT ${jobId}, shot_id, ${kind}::infi_video_asset_kind, ${provider}
    FROM unnest(${shotIds}::text[]) AS t(shot_id)
    ON CONFLICT (shot_id, kind) WHERE shot_id IS NOT NULL DO NOTHING
  `;
}

export async function getAssets(
  jobId: string,
  kind?: AssetKind,
): Promise<VideoAsset[]> {
  const rows = kind
    ? await sql<VideoAsset[]>`
        SELECT * FROM infi_video_asset WHERE job_id = ${jobId} AND kind = ${kind}
        ORDER BY created_at
      `
    : await sql<VideoAsset[]>`
        SELECT * FROM infi_video_asset WHERE job_id = ${jobId} ORDER BY kind, created_at
      `;
  return rows;
}

export async function getEntitySlugs(input: {
  questionId: string;
  traditionId: string | null;
}): Promise<{ questionSlug: string; traditionSlug: string | null }> {
  const rows = await sql<{ question_slug: string; tradition_slug: string | null }[]>`
    SELECT q.slug AS question_slug, t.slug AS tradition_slug
    FROM infi_question q
    LEFT JOIN infi_tradition t ON t.id = ${input.traditionId}
    WHERE q.id = ${input.questionId}
  `;
  const row = rows[0];
  if (!row) throw new Error(`No question ${input.questionId}`);
  return { questionSlug: row.question_slug, traditionSlug: row.tradition_slug };
}

export interface AssetPatch {
  status?: AssetStatus;
  providerJobId?: string | null;
  providerEndpoint?: string | null;
  url?: string | null;
  durationSec?: number | null;
  error?: string | null;
  attemptIncrement?: boolean;
  meta?: Record<string, unknown>;
}

export async function updateAsset(id: string, patch: AssetPatch): Promise<void> {
  const assignments = sql`
    status = COALESCE(${patch.status ?? null}::infi_video_asset_status, status),
    provider_job_id = ${
      patch.providerJobId === undefined ? sql`provider_job_id` : patch.providerJobId
    },
    provider_endpoint = ${
      patch.providerEndpoint === undefined
        ? sql`provider_endpoint`
        : patch.providerEndpoint
    },
    url = ${patch.url === undefined ? sql`url` : patch.url},
    duration_sec = ${
      patch.durationSec === undefined ? sql`duration_sec` : patch.durationSec
    },
    error = ${patch.error === undefined ? sql`error` : patch.error},
    attempt = ${patch.attemptIncrement ? sql`attempt + 1` : sql`attempt`},
    meta = ${patch.meta === undefined ? sql`meta` : sql`${json(patch.meta)}::jsonb`}
  `;
  await sql`UPDATE infi_video_asset SET ${assignments} WHERE id = ${id}`;
}

/**
 * Appends an immutable revision. Published content is never overwritten: a new
 * script is always a new version of the documentary.
 */
export async function insertRevision(input: {
  entityType: string;
  entityId: string;
  body: unknown;
  diffSummary: string;
}): Promise<string> {
  const serialized = JSON.stringify(input.body);
  const contentHash = createHash("sha256").update(serialized).digest("hex");

  const rows = await sql<{ id: string }[]>`
    INSERT INTO infi_revision (
      entity_type, entity_id, version, body, content_hash, diff_summary, author_type
    )
    SELECT
      ${input.entityType}::infi_entity_type,
      ${input.entityId},
      COALESCE(MAX(version), 0) + 1,
      ${json(input.body)},
      ${contentHash},
      ${input.diffSummary},
      'agent'
    FROM infi_revision
    WHERE entity_type = ${input.entityType}::infi_entity_type
      AND entity_id = ${input.entityId}
    RETURNING id
  `;
  const id = rows[0]?.id;
  if (!id) throw new Error("Revision insert returned no row");
  return id;
}

/**
 * Points a draft documentary at its newest script. A published documentary
 * keeps its current revision — promoting a new one is an editor's decision.
 */
export async function attachRevisionToDocumentary(
  documentaryId: string,
  revisionId: string,
): Promise<boolean> {
  const rows = await sql<{ id: string }[]>`
    UPDATE infi_documentary
    SET current_revision_id = ${revisionId}
    WHERE id = ${documentaryId} AND status <> 'published'
    RETURNING id
  `;
  return rows.length > 0;
}

export async function insertChangelogEntry(input: {
  entityId: string;
  revisionId: string;
  kind: "creation" | "expansion";
}): Promise<void> {
  await sql`
    INSERT INTO infi_changelog_entry (entity_type, entity_id, revision_id, kind, is_public)
    VALUES ('documentary', ${input.entityId}, ${input.revisionId}, ${input.kind}, false)
  `;
}

export async function getRevisionBody<T>(revisionId: string): Promise<T | null> {
  const rows = await sql<{ body: T }[]>`
    SELECT body FROM infi_revision WHERE id = ${revisionId}
  `;
  return rows[0]?.body ?? null;
}
