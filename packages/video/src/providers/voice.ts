import { voiceConfig } from "../config";
import type { VoiceConfig } from "../config";

/** Narration synthesis. Optional: with no key configured the stage is skipped. */

export class VoiceError extends Error {
  constructor(
    message: string,
    readonly statusCode?: number,
  ) {
    super(message);
    this.name = "VoiceError";
  }

  get retryable(): boolean {
    if (this.statusCode === undefined) return true;
    return this.statusCode === 429 || this.statusCode >= 500;
  }
}

export interface SynthesisResult {
  audio: Uint8Array;
  contentType: string;
  extension: string;
}

export class ElevenLabsProvider {
  readonly name = "elevenlabs";
  private readonly config: VoiceConfig;

  constructor(config: VoiceConfig) {
    this.config = config;
  }

  /** Returns null when no key/voice is configured, so callers can skip cleanly. */
  static fromEnv(voiceIdOverride?: string): ElevenLabsProvider | null {
    const config = voiceConfig(voiceIdOverride);
    return config ? new ElevenLabsProvider(config) : null;
  }

  async synthesize(text: string): Promise<SynthesisResult> {
    const url =
      `${this.config.baseUrl}/v1/text-to-speech/${this.config.voiceId}` +
      `?output_format=mp3_44100_128`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: {
          "xi-api-key": this.config.apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: this.config.modelId,
          voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.15 },
        }),
      });
    } catch (cause) {
      throw new VoiceError(`ElevenLabs request failed: ${(cause as Error).message}`);
    }

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 500);
      throw new VoiceError(
        `ElevenLabs ${response.status}: ${detail}`,
        response.status,
      );
    }

    const audio = new Uint8Array(await response.arrayBuffer());
    if (audio.byteLength === 0) {
      throw new VoiceError("ElevenLabs returned an empty audio body");
    }

    return { audio, contentType: "audio/mpeg", extension: "mp3" };
  }
}
