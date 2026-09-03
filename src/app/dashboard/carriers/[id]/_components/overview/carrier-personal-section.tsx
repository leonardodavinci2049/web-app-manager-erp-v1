import { UserRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UICarrier } from "@/services/api-main/carrier";
import { CarrierDetailField } from "../carrier-detail-field";
import { formatCarrierDetailDate } from "../carrier-detail-utils";

interface CarrierPersonalSectionProps {
  carrier: UICarrier;
}

export function CarrierPersonalSection({
  carrier,
}: CarrierPersonalSectionProps) {
  return (
    <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base">
          <UserRound className="size-4" aria-hidden="true" />
          Pessoa Física
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <CarrierDetailField label="CPF" value={carrier.cpf} />
          <CarrierDetailField label="RG" value={carrier.rg} />
          <CarrierDetailField
            label="Data de nascimento"
            value={formatCarrierDetailDate(carrier.birthDate)}
          />
        </dl>
      </CardContent>
    </Card>
  );
}
