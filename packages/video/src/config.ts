/**
 * Pipeline configuration, read from the environment on every call so tests and
 * long-lived workers can change it without reloading the module.
 */

export class ConfigError extends Error {}

function env(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() !== "" ? value.trim() : undefined;
}

function num(name: string, fallback: number): number {
  const raw = env(name);
  if (raw === undefined) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export interface AnthropicConfig {
  apiKey: string;
  model: string;
  effort: "low" | "medium" | "high" | "xhigh" | "max";
  maxTokens: number;
}

export interface HiggsfieldConfig {
  apiKey: string;
  apiSecret: string;
  baseUrl: string;
}

export interface VoiceConfig {
  apiKey: string;
  voiceId: string;
  modelId: string;
  baseUrl: string;
}

export interface StorageConfig {
  supabaseUrl: string;
  serviceRoleKey: string;
  bucket: string;
}

export interface WorkerConfig {
  /** Shared secret every pipeline endpoint requires in `x-infinarad-token`. */
  token: string | undefined;
  /** How long a worker owns a job before another may reclaim it. */
  leaseSeconds: number;
  /** Wall-clock budget for one worker tick. */
  budgetMs: number;
  /** Provider submissions issued per job per tick — keeps a tick bounded. */
  submissionsPerTick: number;
  /** Failures tolerated per stage before the job is marked failed. */
  maxAttempts: number;
}

export function anthropicConfig(): AnthropicConfig {
  const apiKey = env("ANTHROPIC_API_KEY");
  if (!apiKey) {
    throw new ConfigError(
      "ANTHROPIC_API_KEY is not set — the script stage cannot run without it.",
    );
  }
  const effort = (env("VIDEO_SCRIPT_EFFORT") ?? "high") as AnthropicConfig["effort"];
  return {
    apiKey,
    model: env("VIDEO_SCRIPT_MODEL") ?? "claude-opus-5",
    effort,
    maxTokens: num("VIDEO_SCRIPT_MAX_TOKENS", 32000),
  };
}

export function higgsfieldConfig(): HiggsfieldConfig {
  // Accepts both the split form (HF_API_KEY / HF_API_SECRET) and the combined
  // "KEY_ID:KEY_SECRET" form that Higgsfield's own SDK reads from HF_CREDENTIALS.
  const combined = env("HF_CREDENTIALS");
  let apiKey = env("HF_API_KEY");
  let apiSecret = env("HF_API_SECRET");

  if (combined && combined.includes(":")) {
    const [key, ...rest] = combined.split(":");
    apiKey = key;
    apiSecret = rest.join(":");
  }

  if (!apiKey || !apiSecret) {
    throw new ConfigError(
      "Higgsfield credentials missing — set HF_CREDENTIALS=KEY_ID:KEY_SECRET (or HF_API_KEY + HF_API_SECRET).",
    );
  }

  return {
    apiKey,
    apiSecret,
    baseUrl: env("HF_BASE_URL") ?? "https://platform.higgsfield.ai",
  };
}

/** Voice is optional: without a key the narration stage is skipped, not failed. */
export function voiceConfig(voiceIdOverride?: string): VoiceConfig | null {
  const apiKey = env("ELEVENLABS_API_KEY");
  const voiceId = voiceIdOverride ?? env("ELEVENLABS_VOICE_ID");
  if (!apiKey || !voiceId) return null;
  return {
    apiKey,
    voiceId,
    modelId: env("ELEVENLABS_MODEL_ID") ?? "eleven_multilingual_v2",
    baseUrl: env("ELEVENLABS_BASE_URL") ?? "https://api.elevenlabs.io",
  };
}

/** Supabase Storage is optional: without it, audio goes to the Higgsfield CDN. */
export function storageConfig(): StorageConfig | null {
  const supabaseUrl = env("SUPABASE_URL");
  const serviceRoleKey = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return null;
  return {
    supabaseUrl: supabaseUrl.replace(/\/+$/, ""),
    serviceRoleKey,
    bucket: env("SUPABASE_VIDEO_BUCKET") ?? "infi-video",
  };
}

export function workerConfig(): WorkerConfig {
  return {
    token: env("VIDEO_PIPELINE_TOKEN"),
    leaseSeconds: num("VIDEO_LEASE_SECONDS", 600),
    budgetMs: num("VIDEO_WORKER_BUDGET_MS", 20_000),
    submissionsPerTick: num("VIDEO_SUBMISSIONS_PER_TICK", 4),
    maxAttempts: num("VIDEO_MAX_ATTEMPTS", 3),
  };
}
