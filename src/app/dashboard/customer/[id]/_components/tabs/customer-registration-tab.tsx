import { CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UICustomerDetail } from "@/services/api-main/customer-general";

interface CustomerRegistrationTabProps {
  customer: UICustomerDetail;
}

export function CustomerRegistrationTab({
  customer,
}: CustomerRegistrationTabProps) {
  return (
    <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="size-4" />
          Cadastro
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4 sm:px-6">
        <DetailField
          label="Data da última compra"
          value={formatDate(customer.lastPurchase)}
        />
        <DetailField
          label="Data de cadastro"
          value={formatDate(customer.createdAt)}
        />
      </CardContent>
    </Card>
  );
}

function formatDate(value?: string): string {
  if (!value) return "Não informada";
  const timestamp = Date.parse(value.replace(" ", "T"));
  if (Number.isNaN(timestamp)) return value;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
  }).format(timestamp);
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
      <dd className="mt-1 wrap-break-word text-sm font-medium">
        {value === undefined || value === "" ? "Não informado" : value}
      </dd>
    </div>
  );
}
