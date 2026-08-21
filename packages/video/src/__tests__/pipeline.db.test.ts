import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { sql } from "@infinarad/db";
import { advanceJob, drainJobs, enqueueJob, getJobReport } from "../pipeline";
import * as repo from "../repo";
import type { Shot } from "../types";

/**
 * Exercises every statement the pipeline runs against a real database, without
 * calling Claude or any media provider: the script stage is stood in for by
 * writing the revision and shots directly, then the job is drained in dry-run
 * mode so the media stages walk their skip paths.
 *
 * Skipped unless DATABASE_URL points at a migrated database.
 */

const HAS_DB = Boolean(process.env["DATABASE_URL"]);

const FIXTURE = {
  locale: "en",
  questionId: "q_VIDEO_TEST",
  questionSlug: "video-pipeline-test-question",
  conceptId: "cpt_VIDEO_TEST",
  edgeId: "edg_VIDEO_TEST",
};

function shot(index: number): Shot {
  return {
    index,
    chapter_slug: "opening",
    duration_sec: 5,
    narration: `Shot ${index} narration for the pipeline integration test.`,
    on_screen_text: null,
    image_prompt: "A gold-leaf manuscript page lit by a single candle, lapis blue shadows, macro",
    motion_prompt: "Dust drifts through the candle light as the page settles",
    camera: "85mm macro, slow push-in",
    transition: "dissolve",
    claim_text: null,
    citation_ids: [],
  };
}

async function cleanup(): Promise<void> {
  await sql`DELETE FROM infi_video_job WHERE question_id = ${FIXTURE.questionId}`;
  await sql`DELETE FROM infi_changelog_entry WHERE entity_id IN (
    SELECT id FROM infi_documentary WHERE question_id = ${FIXTURE.questionId}
  )`;
  await sql`UPDATE infi_documentary SET current_revision_id = NULL WHERE question_id = ${FIXTURE.questionId}`;
  await sql`DELETE FROM infi_revision WHERE entity_id IN (
    SELECT id FROM infi_documentary WHERE question_id = ${FIXTURE.questionId}
  )`;
  await sql`DELETE FROM infi_documentary WHERE question_id = ${FIXTURE.questionId}`;
  await sql`DELETE FROM infi_edge WHERE id = ${FIXTURE.edgeId}`;
  await sql`DELETE FROM infi_translation WHERE entity_id IN (${FIXTURE.questionId}, ${FIXTURE.conceptId})`;
  await sql`DELETE FROM infi_concept WHERE id = ${FIXTURE.conceptId}`;
  await sql`DELETE FROM infi_question WHERE id = ${FIXTURE.questionId}`;
}

beforeAll(async () => {
  if (!HAS_DB) return;
  await cleanup();

  await sql`
    INSERT INTO infi_locale (code, name_native, name_en, is_master, is_active)
    VALUES ('en', 'English', 'English', true, true)
    ON CONFLICT (code) DO UPDATE SET is_active = true
  `;
  await sql`
    INSERT INTO infi_question (id, slug, status, sort_order)
    VALUES (${FIXTURE.questionId}, ${FIXTURE.questionSlug}, 'published', 999)
  `;
  await sql`
    INSERT INTO infi_concept (id, slug, status)
    VALUES (${FIXTURE.conceptId}, 'video-pipeline-test-concept', 'published')
  `;
  await sql`
    INSERT INTO infi_edge (id, from_type, from_id, to_type, to_id, relation, approved_at)
    VALUES (${FIXTURE.edgeId}, 'question', ${FIXTURE.questionId}, 'concept', ${FIXTURE.conceptId}, 'addresses', now())
  `;
  await sql`
    INSERT INTO infi_translation (entity_type, entity_id, locale, field, value)
    VALUES
      ('question', ${FIXTURE.questionId}, 'en', 'title', 'Does the pipeline run?'),
      ('question', ${FIXTURE.questionId}, 'en', 'summary', 'A fixture question.'),
      ('concept', ${FIXTURE.conceptId}, 'en', 'name', 'Test concept'),
      ('concept', ${FIXTURE.conceptId}, 'en', 'summary', 'A fixture concept.')
  `;
});

afterAll(async () => {
  if (!HAS_DB) return;
  await cleanup();
  await sql.end();
});

describe.skipIf(!HAS_DB)("video pipeline against the database", () => {
  it("queues a job, records the brief and is idempotent per angle", async () => {
    const first = await enqueueJob({
      questionSlug: FIXTURE.questionSlug,
      locale: FIXTURE.locale,
      params: { dryRun: true, durationSec: 30, shotSeconds: 5 },
      requestedBy: "test",
    });

    expect(first.created).toBe(true);
    expect(first.job.stage).toBe("script");
    expect(first.job.brief?.concepts).toHaveLength(1);
    expect(first.job.documentary_id).toBeTruthy();

    const second = await enqueueJob({
      questionSlug: FIXTURE.questionSlug,
      locale: FIXTURE.locale,
      params: { dryRun: true },
    });
    expect(second.created).toBe(false);
    expect(second.job.id).toBe(first.job.id);
  });

  it("walks narration, keyframes and clips to a finished job in dry-run mode", async () => {
    const job = await repo.findJobByIdempotencyKey(
      `${FIXTURE.questionSlug}:all-traditions:${FIXTURE.locale}`,
    );
    expect(job).not.toBeNull();
    if (!job) return;

    // Stand in for the script stage: a revision plus its shots.
    const revisionId = await repo.insertRevision({
      entityType: "documentary",
      entityId: job.documentary_id as string,
      body: { kind: "video_script", script: { title: "Fixture", shots: [] } },
      diffSummary: "fixture",
    });
    await repo.attachRevisionToDocumentary(job.documentary_id as string, revisionId);
    await repo.insertChangelogEntry({
      entityId: job.documentary_id as string,
      revisionId,
      kind: "creation",
    });
    const shots = await repo.replaceShots(job.id, [shot(1), shot(2), shot(3)]);
    expect(shots).toHaveLength(3);

    await repo.updateJob(job.id, {
      stage: "narration",
      scriptRevisionId: revisionId,
      leaseSeconds: null,
    });

    const report = await drainJobs({ budgetMs: 15_000, maxJobs: 2 });
    expect(report.claimed).toBeGreaterThan(0);

    const finished = await repo.getJob(job.id);
    expect(finished?.stage).toBe("done");
    expect(finished?.status).toBe("succeeded");

    const assets = await repo.getAssets(job.id);
    expect(assets).toHaveLength(9); // 3 shots x narration + keyframe + clip
    expect(assets.every((a) => a.status === "skipped")).toBe(true);
  });

  it("reports shots, assets and the event log", async () => {
    const job = await repo.findJobByIdempotencyKey(
      `${FIXTURE.questionSlug}:all-traditions:${FIXTURE.locale}`,
    );
    if (!job) throw new Error("fixture job missing");

    const report = await getJobReport(job.id);
    expect(report).not.toBeNull();
    expect(report?.shots).toHaveLength(3);
    expect(report?.shots[0]?.assets["keyframe"]?.status).toBe("skipped");
    expect(report?.events.length).toBeGreaterThan(0);
  });

  it("re-runs the same angle under force with a fresh job", async () => {
    const forced = await enqueueJob({
      questionSlug: FIXTURE.questionSlug,
      locale: FIXTURE.locale,
      params: { dryRun: true },
      force: true,
    });
    expect(forced.created).toBe(true);
  });
});


describe.skipIf(!HAS_DB)("media stages against a stubbed provider", () => {
  const realFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  /** Answers the two Higgsfield calls the media stages make. */
  function stubHiggsfield(): ReturnType<typeof vi.fn> {
    const calls = vi.fn();
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      calls(url, init?.method ?? "GET");

      if (url.includes("/v1/job-sets/")) {
        const id = url.split("/v1/job-sets/")[1];
        return new Response(
          JSON.stringify({
            id,
            jobs: [
              {
                id: `${id}-job`,
                status: "completed",
                results: { raw: { url: `https://cdn.test/${id}.bin` } },
              },
            ],
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      const jobSetId = url.includes("text2image") ? "js_img" : "js_vid";
      return new Response(
        JSON.stringify({ id: jobSetId, jobs: [{ id: "j1", status: "queued" }] }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }) as typeof fetch;

    return calls;
  }

  /** Walks one job forward, refetching it so each step sees persisted state. */
  async function step(jobId: string): Promise<void> {
    const current = await repo.getJob(jobId);
    if (!current) throw new Error(`job ${jobId} vanished`);
    await advanceJob(current);
  }

  it("submits keyframes on one step and collects them on the next", async () => {
    process.env["HF_CREDENTIALS"] = "test-key:test-secret";

    const { job } = await enqueueJob({
      questionSlug: FIXTURE.questionSlug,
      locale: FIXTURE.locale,
      angleSlug: "stubbed-provider",
      params: { skipNarration: true, durationSec: 30, shotSeconds: 5 },
      force: true,
    });

    await repo.replaceShots(job.id, [shot(1), shot(2)]);
    await repo.updateJob(job.id, { stage: "narration" });

    const calls = stubHiggsfield();

    await step(job.id); // narration skipped
    expect((await repo.getJob(job.id))?.stage).toBe("keyframes");

    await step(job.id); // keyframes submitted, nothing ready yet
    const submitted = await repo.getAssets(job.id, "keyframe");
    expect(submitted).toHaveLength(2);
    expect(submitted.every((a) => a.status === "submitted")).toBe(true);
    expect(submitted.every((a) => a.provider_job_id === "js_img")).toBe(true);

    await step(job.id); // keyframes collected
    const keyframes = await repo.getAssets(job.id, "keyframe");
    expect(keyframes.every((a) => a.status === "ready")).toBe(true);
    expect(keyframes[0]?.url).toBe("https://cdn.test/js_img.bin");
    expect((await repo.getJob(job.id))?.stage).toBe("clips");

    await step(job.id); // clips submitted
    await step(job.id); // clips collected
    const clips = await repo.getAssets(job.id, "clip");
    expect(clips.every((a) => a.status === "ready")).toBe(true);
    expect(clips[0]?.url).toBe("https://cdn.test/js_vid.bin");

    await step(job.id); // finish
    const finished = await repo.getJob(job.id);
    expect(finished?.status).toBe("succeeded");
    expect(finished?.stage).toBe("done");
    expect(calls).toHaveBeenCalled();
  });

  it("gives up on a provider verdict that retrying cannot change", async () => {
    process.env["HF_CREDENTIALS"] = "test-key:test-secret";

    const { job } = await enqueueJob({
      questionSlug: FIXTURE.questionSlug,
      locale: FIXTURE.locale,
      angleSlug: "failing-provider",
      params: { skipNarration: true, skipClips: true, durationSec: 30, shotSeconds: 5 },
      force: true,
    });

    await repo.replaceShots(job.id, [shot(1)]);
    await repo.updateJob(job.id, { stage: "keyframes" });

    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ detail: "prompt rejected" }), {
        status: 400,
      })) as typeof fetch;

    await step(job.id); // submit → 400
    const assets = await repo.getAssets(job.id, "keyframe");
    // A 400 is the provider's verdict on the prompt: retrying it would only
    // burn credits, so the asset fails on the first attempt.
    expect(assets[0]?.status).toBe("failed");
    expect(assets[0]?.error).toContain("400");

    await step(job.id); // nothing outstanding → clips (skipped)
    await step(job.id); // clips skipped → done
    await step(job.id); // finish

    const finished = await repo.getJob(job.id);
    expect(finished?.status).toBe("failed");
    expect(finished?.error).toContain("assets failed");
  });
});
