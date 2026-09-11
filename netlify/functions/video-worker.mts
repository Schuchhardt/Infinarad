/**
 * Scheduled trigger for the video pipeline.
 *
 * It holds no pipeline logic on purpose — it only pokes the worker endpoint, so
 * this function stays inside Netlify's short synchronous budget while the work
 * itself happens behind /api/video/worker with its own time budget. Each tick is
 * resumable, so a truncated tick simply continues on the next one.
 */
export default async (): Promise<Response> => {
  const token = process.env["VIDEO_PIPELINE_TOKEN"];
  const base = process.env["URL"] ?? process.env["DEPLOY_URL"];

  if (!token || !base) {
    console.warn("[video-worker] VIDEO_PIPELINE_TOKEN or URL missing — skipping tick");
    return new Response("not configured", { status: 200 });
  }

  const response = await fetch(`${base}/api/video/worker?budgetMs=18000`, {
    method: "POST",
    headers: { "x-infinarad-token": token },
  });

  const body = await response.text();
  console.log(`[video-worker] ${response.status} ${body.slice(0, 500)}`);
  return new Response(body, { status: response.status });
};

export const config = {
  schedule: "*/5 * * * *",
};
