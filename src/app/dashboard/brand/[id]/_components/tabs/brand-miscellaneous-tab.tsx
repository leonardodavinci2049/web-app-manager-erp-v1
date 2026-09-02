import { CalendarDays, CircleCheck, CircleX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BrandMiscellaneousTabProps {
  inactive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

function formatDate(value?: string): string {
  if (!value) return "Não informada";
  const timestamp = Date.parse(value.replace(" ", "T"));
  if (Number.isNaN(timestamp)) return value;
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(
    timestamp,
  );
}

export function BrandMiscellaneousTab({
  inactive,
  createdAt,
  updatedAt,
}: BrandMiscellaneousTabProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            {inactive ? (
              <CircleX className="text-destructive size-4" aria-hidden="true" />
            ) : (
              <CircleCheck
                className="size-4 text-emerald-600 dark:text-emerald-400"
                aria-hidden="true"
              />
            )}
            Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl>
            <div>
              <dt className="text-muted-foreground text-xs">
                Status do cadastro
              </dt>
              <dd className="mt-1">
                <Badge variant={inactive ? "secondary" : "outline"}>
                  {inactive ? "Inativa" : "Ativa"}
                </Badge>
              </dd>
            </div>
          </dl>
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
          <dl className="space-y-4">
            <div>
              <dt className="text-muted-foreground text-xs">Cadastrada em</dt>
              <dd className="mt-1 text-sm font-medium">
                {formatDate(createdAt)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">Atualizada em</dt>
              <dd className="mt-1 text-sm font-medium">
                {formatDate(updatedAt)}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
