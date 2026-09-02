import { CalendarDays, CheckCircle2, CircleOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PtypeMiscellaneousTabProps {
  inactive?: boolean;
  createdAt?: string;
  actionsDisabled: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
}

function formatDate(value?: string): string {
  if (!value) return "Não informada";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(date);
}

export function PtypeMiscellaneousTab({
  inactive,
  createdAt,
  actionsDisabled,
  onActivate,
  onDeactivate,
}: PtypeMiscellaneousTabProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Status do cadastro</CardTitle>
          <Badge variant={inactive ? "destructive" : "secondary"}>
            {inactive ? "Inativo" : "Ativo"}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground text-xs">
            Confirme a operação para definir explicitamente o status deste tipo
            de produto.
          </p>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onActivate}
            disabled={actionsDisabled}
          >
            <CheckCircle2 className="size-4" />
            Marcar como ativo
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onDeactivate}
            disabled={actionsDisabled}
          >
            <CircleOff className="size-4" />
            Marcar como inativo
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="size-4" aria-hidden="true" />
            Cadastro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-xs">Data de cadastro</p>
          <p className="mt-1 text-sm font-medium">{formatDate(createdAt)}</p>
        </CardContent>
      </Card>
    </div>
  );
}
