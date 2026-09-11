import { getJobReport } from "@infinarad/video";
import { authorize } from "../../../../../lib/pipeline-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/video/jobs/{id} — full state of one run: stage, shots, assets, log. */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const auth = authorize(request);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const report = await getJobReport(id);

  if (!report) {
    return Response.json({ error: `No job ${id}` }, { status: 404 });
  }

  return Response.json(report);
}
