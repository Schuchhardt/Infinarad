import { higgsfieldConfig } from "../config";
import type { HiggsfieldConfig } from "../config";
import type { JobParams } from "../types";

/**
 * Higgsfield platform API (v1).
 *
 * Every generation is a POST to an endpoint with a `params` body that returns a
 * job set immediately; the job set is then polled at /v1/job-sets/{id} until its
 * jobs complete. The pipeline never blocks on a poll — it submits on one worker
 * tick and collects on a later one.
 */

export const TEXT_TO_IMAGE_ENDPOINT = "/v1/text2image/soul";
export const IMAGE_TO_VIDEO_ENDPOINT = "/v1/image2video/dop";

export type ProviderStatus = "pending" | "ready" | "failed";

export interface ProviderJobState {
  status: ProviderStatus;
  url: string | null;
  detail: string | null;
  raw: unknown;
}

export interface Submission {
  jobSetId: string;
  endpoint: string;
}

interface HiggsfieldJob {
  id: string;
  status: string;
  results?: { raw?: { url?: string }; min?: { url?: string } } | null;
}

interface HiggsfieldJobSet {
  id: string;
  jobs: HiggsfieldJob[];
}

export class HiggsfieldError extends Error {
  constructor(
    message: string,
    readonly statusCode?: number,
    readonly detail?: unknown,
  ) {
    super(message);
    this.name = "HiggsfieldError";
  }

  /** Transient failures are worth another tick; the rest fail the asset. */
  get retryable(): boolean {
    if (this.statusCode === undefined) return true; // network / abort
    return this.statusCode === 429 || this.statusCode >= 500;
  }
}

const SOUL_SIZE: Record<JobParams["aspect"], string> = {
  landscape: "2048x1152",
  portrait: "1152x2048",
  square: "1536x1536",
};

export class HiggsfieldProvider {
  readonly name = "higgsfield";
  private readonly config: HiggsfieldConfig;

  constructor(config?: HiggsfieldConfig) {
    this.config = config ?? higgsfieldConfig();
  }

  private async request<T>(
    path: string,
    init: { method: "GET" | "POST"; body?: unknown },
  ): Promise<T> {
    let response: Response;
    try {
      response = await fetch(`${this.config.baseUrl}${path}`, {
        method: init.method,
        headers: {
          "hf-api-key": this.config.apiKey,
          "hf-secret": this.config.apiSecret,
          "Content-Type": "application/json",
        },
        body: init.body === undefined ? undefined : JSON.stringify(init.body),
      });
    } catch (cause) {
      throw new HiggsfieldError(
        `Higgsfield request to ${path} failed: ${(cause as Error).message}`,
      );
    }

    const text = await response.text();
    let payload: unknown = null;
    if (text !== "") {
      try {
        payload = JSON.parse(text);
      } catch {
        payload = text;
      }
    }

    if (!response.ok) {
      const detail =
        payload && typeof payload === "object" && "detail" in payload
          ? JSON.stringify((payload as { detail: unknown }).detail)
          : text.slice(0, 500);
      throw new HiggsfieldError(
        `Higgsfield ${init.method} ${path} → ${response.status}: ${detail}`,
        response.status,
        payload,
      );
    }

    return payload as T;
  }

  /** Submits one still frame. Returns as soon as the job set is created. */
  async submitKeyframe(input: {
    prompt: string;
    aspect: JobParams["aspect"];
    quality: JobParams["quality"];
    seed?: number;
  }): Promise<Submission> {
    const jobSet = await this.request<HiggsfieldJobSet>(TEXT_TO_IMAGE_ENDPOINT, {
      method: "POST",
      body: {
        params: {
          prompt: input.prompt,
          width_and_height: SOUL_SIZE[input.aspect],
          quality: input.quality,
          batch_size: 1,
          ...(input.seed === undefined ? {} : { seed: input.seed }),
        },
      },
    });
    return { jobSetId: jobSet.id, endpoint: TEXT_TO_IMAGE_ENDPOINT };
  }

  /** Animates a still into a clip. */
  async submitClip(input: {
    prompt: string;
    imageUrl: string;
    model: JobParams["dopModel"];
    seed?: number;
  }): Promise<Submission> {
    const jobSet = await this.request<HiggsfieldJobSet>(IMAGE_TO_VIDEO_ENDPOINT, {
      method: "POST",
      body: {
        params: {
          model: input.model,
          prompt: input.prompt,
          input_images: [{ type: "image_url", image_url: input.imageUrl }],
          ...(input.seed === undefined ? {} : { seed: input.seed }),
        },
      },
    });
    return { jobSetId: jobSet.id, endpoint: IMAGE_TO_VIDEO_ENDPOINT };
  }

  async pollJobSet(jobSetId: string): Promise<ProviderJobState> {
    const jobSet = await this.request<HiggsfieldJobSet>(`/v1/job-sets/${jobSetId}`, {
      method: "GET",
    });
    return readJobSet(jobSet);
  }

  /**
   * Puts bytes on the Higgsfield CDN and returns a public URL. Used for
   * narration audio when no Supabase bucket is configured.
   */
  async uploadBytes(data: Uint8Array, contentType: string): Promise<string> {
    const link = await this.request<{ upload_url: string; public_url: string }>(
      "/files/generate-upload-url",
      { method: "POST", body: { content_type: contentType } },
    );

    const upload = await fetch(link.upload_url, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: data as unknown as BodyInit,
    });
    if (!upload.ok) {
      throw new HiggsfieldError(
        `Higgsfield CDN upload failed: ${upload.status}`,
        upload.status,
      );
    }
    return link.public_url;
  }
}

/**
 * A job set is ready only when every job in it completed. `nsfw` and `canceled`
 * are terminal failures — retrying the same prompt would just burn credits.
 */
export function readJobSet(jobSet: HiggsfieldJobSet): ProviderJobState {
  const jobs = jobSet.jobs ?? [];
  if (jobs.length === 0) {
    return { status: "pending", url: null, detail: "job set has no jobs yet", raw: jobSet };
  }

  const failed = jobs.find((j) =>
    ["failed", "nsfw", "canceled"].includes(j.status),
  );
  if (failed) {
    return {
      status: "failed",
      url: null,
      detail: `job ${failed.id} ended as ${failed.status}`,
      raw: jobSet,
    };
  }

  if (jobs.every((j) => j.status === "completed")) {
    const url = jobs[0]?.results?.raw?.url ?? jobs[0]?.results?.min?.url ?? null;
    return {
      status: url ? "ready" : "failed",
      url,
      detail: url ? null : "job completed without a result url",
      raw: jobSet,
    };
  }

  return { status: "pending", url: null, detail: null, raw: jobSet };
}
