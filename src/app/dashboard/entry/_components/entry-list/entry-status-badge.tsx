import { CircleCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface EntryStatusBadgeProps {
  label?: string;
  value?: string | null;
}

type EntryStatusTone = "attention" | "complete" | "neutral";

interface EntryStatusPresentation {
  displayValue: string;
  tone: EntryStatusTone;
}

function normalizeStatus(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

function resolveStatusPresentation(
  value: string | null | undefined,
): EntryStatusPresentation {
  const trimmedValue = value?.trim() ?? "";

  switch (normalizeStatus(trimmedValue)) {
    case "CONCLUIDA":
      return { displayValue: "Concluída", tone: "complete" };
    case "AGUARDANDO":
      return { displayValue: "Aguardando", tone: "attention" };
    case "PROCESSADO":
      return { displayValue: "Processado", tone: "complete" };
    case "NENHUM":
      return { displayValue: "Nenhum", tone: "neutral" };
    default:
      return { displayValue: trimmedValue || "—", tone: "neutral" };
  }
}

/**
 * Displays entry flags with a quiet default treatment and a subtle attention
 * accent only for statuses that require operational action.
 */
export function EntryStatusBadge({ label, value }: EntryStatusBadgeProps) {
  const { displayValue, tone } = resolveStatusPresentation(value);
  const text = label ? `${label}: ${displayValue}` : displayValue;
  const isAttention = tone === "attention";

  return (
    <Badge
      variant="outline"
      title={text}
      className={cn(
        "border-border/60 bg-muted/35 font-normal text-foreground/80 shadow-none dark:bg-muted/25",
        isAttention &&
          "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:border-amber-400/35 dark:bg-amber-400/10 dark:text-amber-200",
      )}
    >
      {tone === "complete" ? (
        <CircleCheck
          aria-hidden="true"
          className="text-muted-foreground size-3"
        />
      ) : null}
      <span>
        {label ? (
          <span
            className={cn(
              "text-muted-foreground",
              isAttention && "text-amber-700/80 dark:text-amber-200/80",
            )}
          >
            {label}:{" "}
          </span>
        ) : null}
        {displayValue}
      </span>
    </Badge>
  );
}
