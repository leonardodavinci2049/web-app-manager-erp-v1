import type { VariantProps } from "class-variance-authority";
import type { badgeVariants } from "@/components/ui/badge";
import { Badge } from "@/components/ui/badge";

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

interface EntryStatusBadgeProps {
  label: string;
  value: string;
}

function resolveVariant(value: string): BadgeVariant {
  if (value === "NENHUM") return "secondary";
  if (value === "AGUARDANDO") return "outline";
  return "default";
}

/**
 * Badge de status da entrada (estoque/fisico/etiqueta). Exibe o rotulo
 * devolvido pela API com variante coerente ao estado.
 */
export function EntryStatusBadge({ label, value }: EntryStatusBadgeProps) {
  const display = value?.trim() ? value.trim() : "—";
  return (
    <Badge variant={resolveVariant(display)} title={`${label}: ${display}`}>
      {label}: {display}
    </Badge>
  );
}
