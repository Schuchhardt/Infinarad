import { drainJobs, workerConfig } from "@infinarad/video";
import { authorize } from "../../../../lib/pipeline-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** Honoured by runtimes that support it; the drain respects its own budget anyway. */
export const maxDuration = 300;

/**
 * POST /api/video/worker — advances queued jobs for one bounded tick.
 *
 * Call it from a scheduler (Netlify scheduled function, GitHub Actions, cron).
 * Every tick is resumable, so a tick cut short by a platform timeout costs
 * nothing: the next one continues from the last persisted step.
 *
 * Query: ?budgetMs=20000&maxJobs=3
 */
export async function POST(request: Request): Promise<Response> {
  const auth = authorize(request);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const budgetMs = Number(url.searchParams.get("budgetMs"));
  const maxJobs = Number(url.searchParams.get("maxJobs"));

  const report = await drainJobs({
    budgetMs: Number.isFinite(budgetMs) && budgetMs > 0 ? budgetMs : workerConfig().budgetMs,
    maxJobs: Number.isFinite(maxJobs) && maxJobs > 0 ? maxJobs : 3,
  });

  return Response.json(report);
}
