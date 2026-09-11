import { BriefError, enqueueJob, GenerateRequestSchema } from "@infinarad/video";
import { authorize } from "../../../../lib/pipeline-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/video/generate
 *
 * Queues one documentary: research brief -> script -> narration -> keyframes ->
 * clips. Returns immediately with a job id; the worker does the rest.
 *
 *   curl -X POST https://infinarad.com/api/video/generate \
 *     -H "x-infinarad-token: $VIDEO_PIPELINE_TOKEN" \
 *     -H "content-type: application/json" \
 *     -d '{"question":"what-happens-after-death","tradition":"buddhism","locale":"es"}'
 */
export async function POST(request: Request): Promise<Response> {
  const auth = authorize(request);
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Body must be JSON." }, { status: 400 });
  }

  const parsed = GenerateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const input = parsed.data;

  try {
    const { job, created } = await enqueueJob({
      questionSlug: input.question,
      traditionSlug: input.tradition ?? null,
      locale: input.locale,
      ...(input.angle === undefined ? {} : { angleSlug: input.angle }),
      ...(input.params === undefined ? {} : { params: input.params }),
      force: input.force,
      requestedBy: "api",
    });

    return Response.json(
      {
        job_id: job.id,
        created,
        status: job.status,
        stage: job.stage,
        documentary_id: job.documentary_id,
        angle_slug: job.angle_slug,
        locale: job.locale,
        params: job.params,
        status_url: `/api/video/jobs/${job.id}`,
        message: created
          ? "Job queued. The worker picks it up on its next tick."
          : "A job already exists for this angle; pass force:true to queue another run.",
      },
      { status: created ? 202 : 200 },
    );
  } catch (cause) {
    if (cause instanceof BriefError) {
      return Response.json({ error: cause.message }, { status: 404 });
    }
    console.error("[video] enqueue failed", cause);
    return Response.json(
      { error: `Could not queue the job: ${(cause as Error).message}` },
      { status: 500 },
    );
  }
}
