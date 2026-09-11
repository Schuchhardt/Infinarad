import { timingSafeEqual } from "node:crypto";
import { workerConfig } from "@infinarad/video";

/**
 * Every video-pipeline endpoint is machine-facing: it authenticates with a
 * shared secret, not a user session. With no secret configured the endpoints
 * refuse to run rather than defaulting to open.
 */

export type AuthFailure = { ok: false; response: Response };
export type AuthSuccess = { ok: true };

export function authorize(request: Request): AuthFailure | AuthSuccess {
  const { token } = workerConfig();

  if (!token) {
    return {
      ok: false,
      response: Response.json(
        { error: "VIDEO_PIPELINE_TOKEN is not configured on this deployment." },
        { status: 503 },
      ),
    };
  }

  const header =
    request.headers.get("x-infinarad-token") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    "";

  const expected = Buffer.from(token);
  const provided = Buffer.from(header);

  if (
    provided.length !== expected.length ||
    !timingSafeEqual(provided, expected)
  ) {
    return {
      ok: false,
      response: Response.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { ok: true };
}
