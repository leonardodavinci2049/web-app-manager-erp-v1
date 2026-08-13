"use server";

import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { transcribeCatalogSearchAudio } from "@/services/api-voice/api-boice";

const logger = createLogger("CatalogVoiceActions");

export type CatalogVoiceTranscriptionActionResult =
  | {
      success: true;
      transcript: string;
    }
  | {
      success: false;
      message: string;
    };

/** Transcribes one short recording after validating the current session. */
export async function transcribeCatalogVoiceAction(
  formData: FormData,
): Promise<CatalogVoiceTranscriptionActionResult> {
  await getAuthContext();

  const audio = formData.get("audio");

  if (!(audio instanceof Blob)) {
    return {
      success: false,
      message: "Não foi possível processar a gravação.",
    };
  }

  try {
    const result = await transcribeCatalogSearchAudio({ audio });

    if (!result.transcript) {
      return {
        success: false,
        message: "Não foi possível identificar uma fala na gravação.",
      };
    }

    return {
      success: true,
      transcript: result.transcript,
    };
  } catch (error) {
    logger.error("Failed to transcribe catalog search audio", error);

    return {
      success: false,
      message: "Não foi possível converter a voz em texto. Tente novamente.",
    };
  }
}
