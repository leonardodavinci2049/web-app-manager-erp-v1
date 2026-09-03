import type { VariantProps } from "class-variance-authority";
import type { badgeVariants } from "@/components/ui/badge";
import { Badge } from "@/components/ui/badge";

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

interface EntryStatusBadgeProps {
  label?: string;
  value: string;
}

function resolveVariant(value: string): BadgeVariant {
  if (value === "NENHUM") return "secondary";
  if (value === "AGUARDANDO") return "outline";
  return "default";
}

/**
 * Badge de status da entrada (estoque/fisico/etiqueta). Exibe o valor com
 * variante coerente ao estado; o rotulo e opcional e usado como prefixo e
 * tooltip quando informado.
 */
export function EntryStatusBadge({ label, value }: EntryStatusBadgeProps) {
  const display = value?.trim() ? value.trim() : "—";
  const text = label ? `${label}: ${display}` : display;
  return (
    <Badge variant={resolveVariant(display)} title={text}>
      {text}
    </Badge>
  );
}
