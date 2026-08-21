import { buildBrief } from "./brief";
import { workerConfig } from "./config";
import { generateScript } from "./script";
import { validateScript } from "./validate";
import { HiggsfieldError, HiggsfieldProvider } from "./providers/higgsfield";
import { ElevenLabsProvider, VoiceError } from "./providers/voice";
import { storeAudio } from "./storage";
import * as repo from "./repo";
import { JobParamsSchema } from "./types";
import type {
  Brief,
  JobParams,
  JobStage,
  VideoAsset,
  VideoJob,
  VideoScript,
  VideoShot,
} from "./types";

/**
 * The stage machine.
 *
 * Every call to advanceJob() does one bounded piece of work and persists it, so
 * the worker can be killed at any moment — by a function timeout, a deploy, a
 * crash — and the next tick resumes exactly where this one stopped. Nothing in
 * here publishes: the script lands as a new revision on a draft documentary.
 */

/** How long to wait before polling a provider job again. */
const PROVIDER_POLL_SECONDS = 20;

export class PipelineError extends Error {}

export interface EnqueueInput {
  questionSlug: string;
  traditionSlug?: string | null;
  locale?: string;
  angleSlug?: string;
  params?: Partial<JobParams>;
  requestedBy?: string | null;
  /** Re-runs the same angle instead of returning the existing job. */
  force?: boolean;
}

export interface EnqueueResult {
  job: VideoJob;
  created: boolean;
}

function idempotencyKey(input: {
  questionSlug: string;
  angleSlug: string;
  locale: string;
  force: boolean;
}): string {
  const base = `${input.questionSlug}:${input.angleSlug}:${input.locale}`;
  return input.force ? `${base}:${Date.now().toString(36)}` : base;
}

/**
 * Validates the request against the graph, resolves the documentary it belongs
 * to and queues the job. Returns fast — no model or provider is called here.
 */
export async function enqueueJob(input: EnqueueInput): Promise<EnqueueResult> {
  const locale = input.locale ?? "en";
  const params = JobParamsSchema.parse(input.params ?? {});

  const brief = await buildBrief({
    questionSlug: input.questionSlug,
    traditionSlug: input.traditionSlug ?? null,
    locale,
    angleSlug: input.angleSlug,
  });

  const key = idempotencyKey({
    questionSlug: brief.question.slug,
    angleSlug: brief.angleSlug,
    locale,
    force: input.force ?? false,
  });

  const existing = await repo.findJobByIdempotencyKey(key);
  if (existing) return { job: existing, created: false };

  const documentaryId = await repo.findOrCreateDocumentary({
    questionId: brief.question.id,
    questionSlug: brief.question.slug,
    traditionId: brief.tradition?.id ?? null,
    angleSlug: brief.angleSlug,
  });

  const job = await repo.createJob({
    questionId: brief.question.id,
    traditionId: brief.tradition?.id ?? null,
    documentaryId,
    angleSlug: brief.angleSlug,
    locale,
    params,
    idempotencyKey: key,
    requestedBy: input.requestedBy ?? null,
  });

  await repo.updateJob(job.id, { brief, stage: "script" });
  await repo.logEvent(job.id, "brief", "info", "Brief assembled from the graph", {
    concepts: brief.concepts.length,
    authors: brief.authors.length,
    works: brief.works.length,
    citations: brief.citations.length,
    tradition: brief.tradition?.slug ?? null,
  });

  return { job: { ...job, brief, stage: "script" }, created: true };
}

export interface StepResult {
  jobId: string;
  stage: JobStage;
  /** No further work is possible for this job right now. */
  done: boolean;
  /** Work is in flight at a provider; poll again after the lease expires. */
  waiting: boolean;
  note: string;
}

/** Runs the next step of one job. Assumes the caller holds the job's lease. */
export async function advanceJob(job: VideoJob): Promise<StepResult> {
  switch (job.stage) {
    case "brief":
      return stageBrief(job);
    case "script":
      return stageScript(job);
    case "narration":
      return stageNarration(job);
    case "keyframes":
      return stageMedia(job, "keyframes");
    case "clips":
      return stageMedia(job, "clips");
    case "done":
      return finishJob(job);
  }
}

async function stageBrief(job: VideoJob): Promise<StepResult> {
  // Resolved from the job's own foreign keys, so this works even when the job
  // has no stored brief — which is exactly when this stage runs.
  const slugs = await repo.getEntitySlugs({
    questionId: job.question_id,
    traditionId: job.tradition_id,
  });

  const brief = await buildBrief({
    questionSlug: slugs.questionSlug,
    traditionSlug: slugs.traditionSlug,
    locale: job.locale,
    angleSlug: job.angle_slug,
  });

  await repo.updateJob(job.id, { brief, stage: "script", attempt: 0 });
  return {
    jobId: job.id,
    stage: "script",
    done: false,
    waiting: false,
    note: "brief rebuilt",
  };
}

async function stageScript(job: VideoJob): Promise<StepResult> {
  const { maxAttempts } = workerConfig();
  const brief = job.brief;
  if (!brief) {
    await repo.updateJob(job.id, { stage: "brief" });
    return { jobId: job.id, stage: "brief", done: false, waiting: false, note: "brief missing" };
  }

  // Only validation findings are handed back as rewrite instructions; an
  // infrastructure failure is not something the writer can fix.
  const repairErrors = job.repair_notes?.length ? job.repair_notes : undefined;

  let script: VideoScript;
  try {
    script = await generateScript(brief, job.params, repairErrors);
  } catch (cause) {
    return failStage(job, "script", cause as Error, maxAttempts);
  }

  const validation = validateScript(script, brief, job.params);

  if (validation.errors.length > 0) {
    const attempt = job.attempt + 1;
    await repo.logEvent(job.id, "script", "warn", "Draft rejected by validation", {
      attempt,
      errors: validation.errors,
    });

    if (attempt >= maxAttempts) {
      await repo.updateJob(job.id, {
        status: "failed",
        attempt,
        error: `Script validation failed after ${attempt} attempts:\n${validation.errors.join("\n")}`,
        leaseSeconds: null,
        finished: true,
      });
      return { jobId: job.id, stage: "script", done: true, waiting: false, note: "validation failed" };
    }

    await repo.updateJob(job.id, {
      attempt,
      error: `Draft ${attempt} rejected by validation.`,
      repairNotes: validation.errors,
      leaseSeconds: null,
    });
    return { jobId: job.id, stage: "script", done: false, waiting: false, note: "rewriting draft" };
  }

  const documentaryId = job.documentary_id;
  if (!documentaryId) {
    throw new PipelineError(`Job ${job.id} has no documentary to attach the script to`);
  }

  const revisionId = await repo.insertRevision({
    entityType: "documentary",
    entityId: documentaryId,
    body: {
      kind: "video_script",
      job_id: job.id,
      locale: job.locale,
      angle_slug: job.angle_slug,
      params: job.params,
      script,
      validation: {
        warnings: validation.warnings,
        needs_sources: validation.needsSources,
        estimated_duration_sec: Math.round(validation.estimatedDurationSec),
      },
      brief_snapshot: briefSnapshot(brief),
    },
    diffSummary: `Automated script draft — ${script.shots.length} shots, ~${Math.round(
      validation.estimatedDurationSec,
    )}s`,
  });

  const attached = await repo.attachRevisionToDocumentary(documentaryId, revisionId);
  await repo.insertChangelogEntry({
    entityId: documentaryId,
    revisionId,
    kind: "creation",
  });

  const shots = await repo.replaceShots(job.id, script.shots);

  for (const warning of validation.warnings) {
    await repo.logEvent(job.id, "script", "warn", warning);
  }
  await repo.logEvent(job.id, "script", "info", "Script accepted", {
    revision_id: revisionId,
    shots: shots.length,
    estimated_duration_sec: Math.round(validation.estimatedDurationSec),
    attached_to_documentary: attached,
    needs_sources: validation.needsSources,
  });

  await repo.updateJob(job.id, {
    stage: "narration",
    attempt: 0,
    error: null,
    repairNotes: null,
    scriptRevisionId: revisionId,
  });

  return { jobId: job.id, stage: "narration", done: false, waiting: false, note: "script written" };
}

/** Keeps the revision self-contained without duplicating the whole graph. */
function briefSnapshot(brief: Brief) {
  return {
    question: { id: brief.question.id, slug: brief.question.slug, title: brief.question.title },
    tradition: brief.tradition
      ? { id: brief.tradition.id, slug: brief.tradition.slug, name: brief.tradition.name }
      : null,
    concept_ids: brief.concepts.map((c) => c.id),
    citation_ids: brief.citations.map((c) => c.id),
  };
}

async function stageNarration(job: VideoJob): Promise<StepResult> {
  const shots = await repo.getShots(job.id);
  if (shots.length === 0) {
    throw new PipelineError(`Job ${job.id} reached narration with no shots`);
  }

  await repo.ensureShotAssets(job.id, shots.map((s) => s.id), "narration", "elevenlabs");

  const voice =
    job.params.dryRun || job.params.skipNarration
      ? null
      : ElevenLabsProvider.fromEnv(job.params.voiceId);

  if (!voice) {
    const reason = job.params.dryRun
      ? "dry run"
      : job.params.skipNarration
        ? "skipNarration was requested"
        : "no ELEVENLABS_API_KEY / ELEVENLABS_VOICE_ID configured";
    await skipRemaining(job.id, "narration", reason);
    await repo.updateJob(job.id, { stage: "keyframes", attempt: 0 });
    return { jobId: job.id, stage: "keyframes", done: false, waiting: false, note: `narration skipped (${reason})` };
  }

  const { submissionsPerTick, maxAttempts } = workerConfig();
  const assets = await repo.getAssets(job.id, "narration");
  const shotById = new Map(shots.map((s) => [s.id, s]));
  let processed = 0;

  for (const asset of assets) {
    if (processed >= submissionsPerTick) break;
    if (asset.status !== "pending") continue;

    const shot = asset.shot_id ? shotById.get(asset.shot_id) : undefined;
    if (!shot) continue;

    processed += 1;
    try {
      const result = await voice.synthesize(shot.narration);
      const stored = await storeAudio(
        `${job.id}/narration/${String(shot.index).padStart(3, "0")}.${result.extension}`,
        result.audio,
        result.contentType,
      );
      await repo.updateAsset(asset.id, {
        status: "ready",
        url: stored.url,
        error: null,
        meta: { backend: stored.backend, characters: shot.narration.length },
      });
    } catch (cause) {
      await handleAssetFailure(job, asset, cause as Error, maxAttempts, "narration");
    }
  }

  return afterMediaWork(job, "narration", "keyframes", processed);
}

/**
 * Keyframes and clips share a shape: submit what is pending, poll what is in
 * flight, and move on once nothing is outstanding.
 */
async function stageMedia(
  job: VideoJob,
  stage: "keyframes" | "clips",
): Promise<StepResult> {
  const kind = stage === "keyframes" ? "keyframe" : "clip";
  const nextStage: JobStage = stage === "keyframes" ? "clips" : "done";
  const shots = await repo.getShots(job.id);

  await repo.ensureShotAssets(job.id, shots.map((s) => s.id), kind, "higgsfield");

  const skipRequested =
    job.params.dryRun ||
    (stage === "keyframes" ? job.params.skipKeyframes : job.params.skipClips);

  if (skipRequested) {
    const reason = job.params.dryRun ? "dry run" : `skip${stage} was requested`;
    await skipRemaining(job.id, kind, reason);
    await repo.updateJob(job.id, { stage: nextStage, attempt: 0 });
    return { jobId: job.id, stage: nextStage, done: false, waiting: false, note: `${stage} skipped (${reason})` };
  }

  const { submissionsPerTick, maxAttempts } = workerConfig();
  const provider = new HiggsfieldProvider();
  const assets = await repo.getAssets(job.id, kind);
  const shotById = new Map(shots.map((s) => [s.id, s]));
  const keyframes =
    stage === "clips" ? await repo.getAssets(job.id, "keyframe") : [];
  const keyframeByShot = new Map(
    keyframes.filter((a) => a.shot_id).map((a) => [a.shot_id as string, a]),
  );

  let worked = 0;

  // 1. Collect anything that already finished at the provider.
  for (const asset of assets) {
    if (asset.status !== "submitted" || !asset.provider_job_id) continue;
    try {
      const state = await provider.pollJobSet(asset.provider_job_id);
      if (state.status === "ready" && state.url) {
        await repo.updateAsset(asset.id, { status: "ready", url: state.url, error: null });
        worked += 1;
      } else if (state.status === "failed") {
        await handleAssetFailure(
          job,
          asset,
          new HiggsfieldError(state.detail ?? "provider job failed", 422),
          maxAttempts,
          stage,
        );
        worked += 1;
      }
    } catch (cause) {
      await handleAssetFailure(job, asset, cause as Error, maxAttempts, stage);
      worked += 1;
    }
  }

  // 2. Submit what is still pending, bounded so one tick stays short.
  let submitted = 0;
  for (const asset of await repo.getAssets(job.id, kind)) {
    if (submitted >= submissionsPerTick) break;
    if (asset.status !== "pending") continue;

    const shot = asset.shot_id ? shotById.get(asset.shot_id) : undefined;
    if (!shot) continue;

    if (stage === "clips") {
      const keyframe = asset.shot_id ? keyframeByShot.get(asset.shot_id) : undefined;
      if (!keyframe || keyframe.status === "skipped") {
        await repo.updateAsset(asset.id, {
          status: "skipped",
          error: "no keyframe to animate",
        });
        continue;
      }
      if (keyframe.status !== "ready" || !keyframe.url) continue; // wait for it
    }

    submitted += 1;
    worked += 1;
    try {
      const submission =
        stage === "keyframes"
          ? await provider.submitKeyframe({
              prompt: shot.image_prompt,
              aspect: job.params.aspect,
              quality: job.params.quality,
              ...(job.params.seed === undefined
                ? {}
                : { seed: (job.params.seed + shot.index) % 1_000_001 }),
            })
          : await provider.submitClip({
              prompt: shot.motion_prompt,
              imageUrl: keyframeByShot.get(asset.shot_id as string)?.url as string,
              model: job.params.dopModel,
              ...(job.params.seed === undefined
                ? {}
                : { seed: (job.params.seed + shot.index) % 1_000_001 }),
            });

      await repo.updateAsset(asset.id, {
        status: "submitted",
        providerJobId: submission.jobSetId,
        providerEndpoint: submission.endpoint,
        error: null,
      });
    } catch (cause) {
      await handleAssetFailure(job, asset, cause as Error, maxAttempts, stage);
    }
  }

  return afterMediaWork(job, kind, nextStage, worked);
}

async function afterMediaWork(
  job: VideoJob,
  kind: VideoAsset["kind"],
  nextStage: JobStage,
  worked: number,
): Promise<StepResult> {
  const assets = await repo.getAssets(job.id, kind);
  const outstanding = assets.filter(
    (a) => a.status === "pending" || a.status === "submitted",
  );

  if (outstanding.length === 0) {
    const failed = assets.filter((a) => a.status === "failed").length;
    await repo.logEvent(job.id, job.stage, failed > 0 ? "warn" : "info", `${kind} stage complete`, {
      ready: assets.filter((a) => a.status === "ready").length,
      skipped: assets.filter((a) => a.status === "skipped").length,
      failed,
    });
    await repo.updateJob(job.id, { stage: nextStage, attempt: 0 });
    return { jobId: job.id, stage: nextStage, done: false, waiting: false, note: `${kind} done` };
  }

  const inFlight = outstanding.every((a) => a.status === "submitted");
  return {
    jobId: job.id,
    stage: job.stage,
    done: false,
    // Everything left is at the provider: stop spinning and poll later.
    waiting: inFlight,
    note: `${kind}: ${outstanding.length} outstanding, ${worked} handled this tick`,
  };
}

async function finishJob(job: VideoJob): Promise<StepResult> {
  const assets = await repo.getAssets(job.id);
  const failed = assets.filter((a) => a.status === "failed");
  const ready = assets.filter((a) => a.status === "ready");

  await repo.logEvent(job.id, "done", failed.length > 0 ? "warn" : "info", "Pipeline finished", {
    ready: ready.length,
    skipped: assets.filter((a) => a.status === "skipped").length,
    failed: failed.length,
  });

  await repo.updateJob(job.id, {
    status: failed.length > 0 ? "failed" : "succeeded",
    error:
      failed.length > 0
        ? `${failed.length} of ${assets.length} assets failed; the rest are stored on the job.`
        : null,
    leaseSeconds: null,
    finished: true,
  });

  return {
    jobId: job.id,
    stage: "done",
    done: true,
    waiting: false,
    note: failed.length > 0 ? "finished with failed assets" : "finished",
  };
}

async function skipRemaining(
  jobId: string,
  kind: VideoAsset["kind"],
  reason: string,
): Promise<void> {
  for (const asset of await repo.getAssets(jobId, kind)) {
    if (asset.status === "ready") continue;
    await repo.updateAsset(asset.id, { status: "skipped", error: reason });
  }
}

async function handleAssetFailure(
  job: VideoJob,
  asset: VideoAsset,
  cause: Error,
  maxAttempts: number,
  stage: string,
): Promise<void> {
  const retryable =
    cause instanceof HiggsfieldError || cause instanceof VoiceError
      ? cause.retryable
      : false;
  const attempt = asset.attempt + 1;
  const exhausted = attempt >= maxAttempts || !retryable;

  await repo.updateAsset(asset.id, {
    status: exhausted ? "failed" : "pending",
    providerJobId: null,
    error: cause.message.slice(0, 1000),
    attemptIncrement: true,
  });

  await repo.logEvent(
    job.id,
    job.stage,
    exhausted ? "error" : "warn",
    `${stage} asset ${exhausted ? "failed" : "will retry"}`,
    { asset_id: asset.id, shot_id: asset.shot_id, attempt, error: cause.message.slice(0, 500) },
  );
}

async function failStage(
  job: VideoJob,
  stage: JobStage,
  cause: Error,
  maxAttempts: number,
): Promise<StepResult> {
  const attempt = job.attempt + 1;
  const exhausted = attempt >= maxAttempts;

  await repo.logEvent(job.id, stage, exhausted ? "error" : "warn", cause.message.slice(0, 500), {
    attempt,
  });

  await repo.updateJob(job.id, {
    ...(exhausted ? { status: "failed" as const, finished: true } : {}),
    attempt,
    error: cause.message.slice(0, 2000),
    leaseSeconds: null,
  });

  return {
    jobId: job.id,
    stage,
    done: exhausted,
    waiting: false,
    note: exhausted ? `failed: ${cause.message}` : `retrying after: ${cause.message}`,
  };
}

export interface DrainOptions {
  budgetMs?: number;
  maxJobs?: number;
}

export interface DrainReport {
  claimed: number;
  steps: StepResult[];
  budgetMs: number;
  elapsedMs: number;
}

/**
 * One worker tick: claim open jobs and push each as far as the time budget
 * allows. Safe to run concurrently — jobs are leased, never shared.
 */
export async function drainJobs(options: DrainOptions = {}): Promise<DrainReport> {
  const config = workerConfig();
  const budgetMs = options.budgetMs ?? config.budgetMs;
  const maxJobs = options.maxJobs ?? 3;
  const startedAt = Date.now();
  const deadline = startedAt + budgetMs;

  const jobs = await repo.claimJobs(maxJobs, config.leaseSeconds);
  const steps: StepResult[] = [];

  for (const claimed of jobs) {
    let job: VideoJob | null = claimed;

    while (job && Date.now() < deadline) {
      let step: StepResult;
      try {
        step = await advanceJob(job);
      } catch (cause) {
        step = await failStage(job, job.stage, cause as Error, config.maxAttempts);
      }
      steps.push(step);

      if (step.done) break;

      if (step.waiting) {
        await repo.updateJob(job.id, {
          status: "waiting",
          leaseSeconds: PROVIDER_POLL_SECONDS,
        });
        break;
      }

      job = await repo.getJob(job.id);
      if (job && (job.status === "failed" || job.status === "canceled")) break;
    }

    // Hand the job back so the next tick (or another worker) can continue it.
    const latest = await repo.getJob(claimed.id);
    if (latest && ["queued", "running"].includes(latest.status)) {
      await repo.updateJob(latest.id, { status: "queued", leaseSeconds: null });
    }
  }

  return {
    claimed: jobs.length,
    steps,
    budgetMs,
    elapsedMs: Date.now() - startedAt,
  };
}

export interface JobReport {
  job: Omit<VideoJob, "brief"> & { brief_summary: ReturnType<typeof briefSnapshot> | null };
  script: VideoScript | null;
  shots: (Pick<VideoShot, "id" | "index" | "chapter_slug" | "narration"> & {
    assets: Record<string, { status: string; url: string | null; error: string | null }>;
  })[];
  assets: { kind: string; status: string; count: number }[];
  events: Awaited<ReturnType<typeof repo.getEvents>>;
}

/** Everything the status endpoint reports about one job. */
export async function getJobReport(jobId: string): Promise<JobReport | null> {
  const job = await repo.getJob(jobId);
  if (!job) return null;

  const [shots, assets, events] = await Promise.all([
    repo.getShots(jobId),
    repo.getAssets(jobId),
    repo.getEvents(jobId, 50),
  ]);

  const revisionBody = job.script_revision_id
    ? await repo.getRevisionBody<{ script: VideoScript }>(job.script_revision_id)
    : null;

  const assetsByShot = new Map<string, VideoAsset[]>();
  for (const asset of assets) {
    if (!asset.shot_id) continue;
    const list = assetsByShot.get(asset.shot_id) ?? [];
    list.push(asset);
    assetsByShot.set(asset.shot_id, list);
  }

  const counts = new Map<string, number>();
  for (const asset of assets) {
    const key = `${asset.kind}:${asset.status}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const { brief, ...jobWithoutBrief } = job;

  return {
    job: { ...jobWithoutBrief, brief_summary: brief ? briefSnapshot(brief) : null },
    script: revisionBody?.script ?? null,
    shots: shots.map((shot) => ({
      id: shot.id,
      index: shot.index,
      chapter_slug: shot.chapter_slug,
      narration: shot.narration,
      assets: Object.fromEntries(
        (assetsByShot.get(shot.id) ?? []).map((a) => [
          a.kind,
          { status: a.status, url: a.url, error: a.error },
        ]),
      ),
    })),
    assets: [...counts.entries()].map(([key, count]) => {
      const [kind = "", status = ""] = key.split(":");
      return { kind, status, count };
    }),
    events,
  };
}
