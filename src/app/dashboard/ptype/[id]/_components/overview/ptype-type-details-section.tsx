import { Percent, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UIPtype } from "@/services/api-main/ptype";

interface PtypeTypeDetailsSectionProps {
  item: Pick<
    UIPtype,
    | "inactive"
    | "productRegistrationFlag"
    | "createdAt"
    | "retailCommissionRate"
    | "wholesaleCommissionRate"
  >;
}

function formatDate(value?: string): string {
  if (!value) return "Não informada";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(date);
}

function formatPercent(value?: number): string {
  if (value === undefined) return "Não informada";
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  }).format(value);
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value?: string | number;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium">
        {value === undefined || value === "" ? "Não informado" : value}
      </dd>
    </div>
  );
}

function PercentField({ label, value }: { label: string; value?: number }) {
  return (
    <div className="min-w-0">
      <dt className="text-muted-foreground flex items-center gap-1 text-xs">
        <Percent className="size-3" />
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium tabular-nums">
        {value === undefined ? "Não informada" : `${formatPercent(value)}%`}
      </dd>
    </div>
  );
}

export function PtypeTypeDetailsSection({
  item,
}: PtypeTypeDetailsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="size-5" />
          Detalhes do tipo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <DetailField
            label="Status"
            value={item.inactive ? "Inativo" : "Ativo"}
          />
          <DetailField
            label="Cadastro de produto"
            value={
              item.productRegistrationFlag === undefined
                ? undefined
                : item.productRegistrationFlag
                  ? "Habilitado"
                  : "Não habilitado"
            }
          />
          <DetailField
            label="Data de cadastro"
            value={formatDate(item.createdAt)}
          />
          <PercentField
            label="Comissão varejo"
            value={item.retailCommissionRate}
          />
          <PercentField
            label="Comissão atacado"
            value={item.wholesaleCommissionRate}
          />
        </dl>
      </CardContent>
    </Card>
  );
}
