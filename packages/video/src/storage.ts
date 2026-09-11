import { storageConfig } from "./config";
import { HiggsfieldProvider } from "./providers/higgsfield";

/**
 * Where generated narration lands. Supabase Storage when it is configured,
 * otherwise the Higgsfield CDN — the clip stage needs a public URL either way.
 */

export class StorageError extends Error {}

export interface StoredAsset {
  url: string;
  backend: "supabase" | "higgsfield";
}

export async function storeAudio(
  path: string,
  data: Uint8Array,
  contentType: string,
  higgsfield?: HiggsfieldProvider,
): Promise<StoredAsset> {
  const config = storageConfig();

  if (config) {
    const endpoint = `${config.supabaseUrl}/storage/v1/object/${config.bucket}/${path}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.serviceRoleKey}`,
        "Content-Type": contentType,
        // Re-running a job overwrites its own asset rather than erroring.
        "x-upsert": "true",
      },
      body: data as unknown as BodyInit,
    });

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 500);
      throw new StorageError(
        `Supabase Storage upload to ${config.bucket}/${path} failed (${response.status}): ${detail}`,
      );
    }

    return {
      url: `${config.supabaseUrl}/storage/v1/object/public/${config.bucket}/${path}`,
      backend: "supabase",
    };
  }

  const provider = higgsfield ?? new HiggsfieldProvider();
  return { url: await provider.uploadBytes(data, contentType), backend: "higgsfield" };
}
