"use client";

import { Loader2, Mic, Search, Square, X } from "lucide-react";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MAX_RECORDING_DURATION_MS = 15_000;

type VoiceState = "idle" | "requesting" | "recording" | "transcribing";

type VoiceTranscriptionResult =
  | {
      success: true;
      transcript: string;
    }
  | {
      success: false;
      message: string;
    };

interface RegistrySearchProps {
  value: string;
  placeholder: string;
  accessibleLabel: string;
  maxLength?: number;
  pending: boolean;
  onSearch: (value: string) => void;
  onTranscribeAudio?: (formData: FormData) => Promise<VoiceTranscriptionResult>;
}

function getSupportedAudioMimeType(): string | undefined {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/ogg;codecs=opus",
    "audio/mp4",
  ];

  return candidates.find((mimeType) => MediaRecorder.isTypeSupported(mimeType));
}

function stopMediaStream(stream: MediaStream | null): void {
  for (const track of stream?.getTracks() ?? []) track.stop();
}

function getMicrophoneErrorMessage(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError") {
      return "Permita o acesso ao microfone para usar a pesquisa por voz.";
    }

    if (error.name === "NotFoundError") {
      return "Nenhum microfone foi encontrado neste dispositivo.";
    }
  }

  return "Não foi possível acessar o microfone. Tente novamente.";
}

export function RegistrySearch({
  value,
  placeholder,
  accessibleLabel,
  maxLength = 300,
  pending,
  onSearch,
  onTranscribeAudio,
}: RegistrySearchProps) {
  const [draft, setDraft] = useState(value);
  const [isVoiceSupported, setIsVoiceSupported] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [voiceFeedback, setVoiceFeedback] = useState<{
    type: "error" | "status";
    message: string;
  } | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimeoutRef = useRef<number | null>(null);
  const discardRecordingRef = useRef(false);
  const mountedRef = useRef(true);

  const clearRecordingTimeout = useCallback(() => {
    if (recordingTimeoutRef.current !== null) {
      window.clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
  }, []);

  const releaseMicrophone = useCallback(() => {
    stopMediaStream(mediaStreamRef.current);
    mediaStreamRef.current = null;
  }, []);

  useEffect(() => setDraft(value), [value]);

  useEffect(() => {
    setIsVoiceSupported(
      Boolean(
        onTranscribeAudio &&
          typeof navigator.mediaDevices?.getUserMedia === "function" &&
          typeof window.MediaRecorder === "function",
      ),
    );
  }, [onTranscribeAudio]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      discardRecordingRef.current = true;
      clearRecordingTimeout();

      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        recorder.stop();
      }

      releaseMicrophone();
    };
  }, [clearRecordingTimeout, releaseMicrophone]);

  const normalizedDraft = draft.trim();
  const isVoiceBusy = voiceState !== "idle";
  const controlsDisabled = pending || isVoiceBusy;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!controlsDisabled && normalizedDraft !== value) {
      onSearch(normalizedDraft);
    }
  };

  const handleClear = () => {
    setDraft("");
    setVoiceFeedback(null);
    if (value !== "") onSearch("");
  };

  const transcribeRecording = useCallback(
    async (audio: Blob) => {
      if (!onTranscribeAudio || !mountedRef.current) return;

      setVoiceState("transcribing");
      setVoiceFeedback({
        type: "status",
        message: "Convertendo voz em texto…",
      });

      try {
        const formData = new FormData();
        formData.append("audio", audio, "catalog-search-audio");
        const result = await onTranscribeAudio(formData);

        if (!mountedRef.current) return;

        if (!result.success) {
          setVoiceFeedback({ type: "error", message: result.message });
          return;
        }

        setDraft(result.transcript.slice(0, maxLength));
        setVoiceFeedback({
          type: "status",
          message: "Texto transcrito. Revise antes de pesquisar.",
        });
      } catch {
        if (!mountedRef.current) return;

        setVoiceFeedback({
          type: "error",
          message:
            "Não foi possível converter a voz em texto. Tente novamente.",
        });
      } finally {
        if (mountedRef.current) setVoiceState("idle");
      }
    },
    [maxLength, onTranscribeAudio],
  );

  const stopRecording = useCallback(() => {
    clearRecordingTimeout();

    const recorder = mediaRecorderRef.current;
    if (recorder?.state === "recording") {
      setVoiceState("transcribing");
      recorder.stop();
    }
  }, [clearRecordingTimeout]);

  const startRecording = useCallback(async () => {
    if (
      !isVoiceSupported ||
      !onTranscribeAudio ||
      pending ||
      voiceState !== "idle"
    ) {
      return;
    }

    setVoiceState("requesting");
    setVoiceFeedback({
      type: "status",
      message: "Solicitando acesso ao microfone…",
    });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      if (!mountedRef.current) {
        stopMediaStream(stream);
        return;
      }

      const mimeType = getSupportedAudioMimeType();
      mediaStreamRef.current = stream;
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );

      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      discardRecordingRef.current = false;

      recorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      });

      recorder.addEventListener("error", () => {
        discardRecordingRef.current = true;
        setVoiceFeedback({
          type: "error",
          message: "A gravação foi interrompida. Tente novamente.",
        });
        stopRecording();
      });

      recorder.addEventListener("stop", () => {
        clearRecordingTimeout();
        releaseMicrophone();
        mediaRecorderRef.current = null;

        if (discardRecordingRef.current) {
          if (mountedRef.current) setVoiceState("idle");
          return;
        }

        const audio = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || mimeType || "audio/webm",
        });
        audioChunksRef.current = [];
        void transcribeRecording(audio);
      });

      recorder.start();
      setVoiceState("recording");
      setVoiceFeedback({
        type: "status",
        message: "Ouvindo… Clique novamente para parar.",
      });
      recordingTimeoutRef.current = window.setTimeout(
        stopRecording,
        MAX_RECORDING_DURATION_MS,
      );
    } catch (error) {
      mediaRecorderRef.current = null;
      releaseMicrophone();

      if (mountedRef.current) {
        setVoiceState("idle");
        setVoiceFeedback({
          type: "error",
          message: getMicrophoneErrorMessage(error),
        });
      }
    }
  }, [
    clearRecordingTimeout,
    isVoiceSupported,
    onTranscribeAudio,
    pending,
    releaseMicrophone,
    stopRecording,
    transcribeRecording,
    voiceState,
  ]);

  const handleVoiceClick = () => {
    if (voiceState === "recording") {
      stopRecording();
      return;
    }

    void startRecording();
  };

  return (
    <search className="w-full min-w-0 md:max-w-[400px]">
      <form onSubmit={handleSubmit} className="flex w-full min-w-0">
        <div className="relative min-w-0 flex-1">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              setVoiceFeedback(null);
            }}
            maxLength={maxLength}
            placeholder={placeholder}
            className={`h-11 rounded-r-none border-r-0 pl-9 shadow-sm ${
              isVoiceSupported ? "pr-20" : "pr-10"
            }`}
            disabled={controlsDisabled}
            aria-label={accessibleLabel}
          />
          <div className="absolute inset-y-0 right-0 flex items-center">
            {draft !== "" && (
              <button
                type="button"
                onClick={handleClear}
                className="text-muted-foreground hover:text-foreground flex h-full w-10 items-center justify-center transition-colors"
                disabled={controlsDisabled}
                aria-label="Limpar pesquisa"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            )}
            {isVoiceSupported && (
              <button
                type="button"
                onClick={handleVoiceClick}
                className={`flex h-full w-10 items-center justify-center transition-colors ${
                  voiceState === "recording"
                    ? "text-destructive"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                disabled={
                  voiceState !== "recording" &&
                  (pending ||
                    voiceState === "requesting" ||
                    voiceState === "transcribing")
                }
                aria-label={
                  voiceState === "recording"
                    ? "Parar gravação de voz"
                    : "Pesquisar usando a voz"
                }
                aria-pressed={voiceState === "recording"}
                title={
                  voiceState === "recording"
                    ? "Parar gravação"
                    : "Pesquisar usando a voz"
                }
              >
                {voiceState === "requesting" ||
                voiceState === "transcribing" ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : voiceState === "recording" ? (
                  <Square
                    className="size-3 animate-pulse fill-current"
                    aria-hidden="true"
                  />
                ) : (
                  <Mic className="size-4" aria-hidden="true" />
                )}
              </button>
            )}
          </div>
        </div>
        <Button
          type="submit"
          className="h-11 shrink-0 rounded-l-none px-3 shadow-sm sm:px-4"
          disabled={controlsDisabled || normalizedDraft === value}
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Search className="size-4" aria-hidden="true" />
          )}
          <span className="sr-only sm:not-sr-only">Pesquisar</span>
        </Button>
      </form>
      {voiceFeedback && (
        <p
          className={`mt-1 text-xs ${
            voiceFeedback.type === "error"
              ? "text-destructive"
              : "text-muted-foreground"
          }`}
          role={voiceFeedback.type === "error" ? "alert" : "status"}
          aria-live="polite"
        >
          {voiceFeedback.message}
        </p>
      )}
    </search>
  );
}
