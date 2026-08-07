import "server-only";

import { z } from "zod";

const DEEPGRAM_LISTEN_URL = "https://api.deepgram.com/v1/listen";
const MAX_AUDIO_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_KEYTERMS = 50;

const deepgramResponseSchema = z.object({
  metadata: z
    .object({
      request_id: z.string().optional(),
    })
    .optional(),
  results: z.object({
    channels: z.array(
      z.object({
        alternatives: z.array(
          z.object({
            transcript: z.string(),
            confidence: z.number().min(0).max(1).optional(),
          }),
        ),
      }),
    ),
  }),
});

export interface TranscribeCatalogSearchAudioInput {
  audio: Blob;
  /** Brand names, product models, or other relevant catalog terminology. */
  keyterms?: readonly string[];
}

export interface CatalogVoiceTranscription {
  transcript: string;
  confidence: number | null;
  requestId: string | null;
}

function getDeepgramApiKey(): string {
  const apiKey = process.env.DEEPGRAM_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("DEEPGRAM_API_KEY is not configured on the server.");
  }

  return apiKey;
}

function getAudioContentType(audio: Blob): string {
  const contentType = audio.type.split(";", 1)[0]?.trim().toLowerCase();

  if (!contentType || !/^audio\/[a-z0-9.+-]+$/.test(contentType)) {
    throw new Error("The provided file does not have a valid audio MIME type.");
  }

  return contentType;
}

function appendKeyterms(
  searchParams: URLSearchParams,
  keyterms: readonly string[],
): void {
  const normalizedKeyterms = keyterms
    .map((keyterm) => keyterm.trim())
    .filter((keyterm) => keyterm.length > 0);

  if (normalizedKeyterms.length > MAX_KEYTERMS) {
    throw new Error(`A maximum of ${MAX_KEYTERMS} keyterms is allowed.`);
  }

  for (const keyterm of normalizedKeyterms) {
    if (keyterm.length > 100) {
      throw new Error(
        "Each Deepgram keyterm must have at most 100 characters.",
      );
    }

    searchParams.append("keyterm", keyterm);
  }
}

/**
 * Example server-only integration for short catalog search recordings.
 *
 * The browser should record the microphone with MediaRecorder and send the
 * resulting File/Blob to an authenticated Server Action or Route Handler.
 * Never expose DEEPGRAM_API_KEY in a Client Component.
 */
export async function transcribeCatalogSearchAudio({
  audio,
  keyterms = [],
}: TranscribeCatalogSearchAudioInput): Promise<CatalogVoiceTranscription> {
  if (audio.size === 0) {
    throw new Error("The audio file is empty.");
  }

  if (audio.size > MAX_AUDIO_SIZE_BYTES) {
    throw new Error("The audio file exceeds the 5 MB limit.");
  }

  const searchParams = new URLSearchParams({
    model: "nova-3",
    language: "pt-BR",
    smart_format: "true",
  });

  appendKeyterms(searchParams, keyterms);

  const response = await fetch(`${DEEPGRAM_LISTEN_URL}?${searchParams}`, {
    method: "POST",
    headers: {
      Authorization: `Token ${getDeepgramApiKey()}`,
      "Content-Type": getAudioContentType(audio),
    },
    body: audio,
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error(
      `Deepgram transcription failed with HTTP status ${response.status}.`,
    );
  }

  const result = deepgramResponseSchema.parse(await response.json());
  const bestAlternative = result.results.channels[0]?.alternatives[0];

  return {
    transcript: bestAlternative?.transcript.trim() ?? "",
    confidence: bestAlternative?.confidence ?? null,
    requestId: result.metadata?.request_id ?? null,
  };
}
