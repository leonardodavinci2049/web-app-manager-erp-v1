import { Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UICarrier } from "@/services/api-main/carrier";
import { CarrierDetailField } from "../carrier-detail-field";
import { formatCarrierDetailDate } from "../carrier-detail-utils";

interface CarrierBusinessSectionProps {
  carrier: UICarrier;
}

export function CarrierBusinessSection({
  carrier,
}: CarrierBusinessSectionProps) {
  return (
    <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base">
          <Building2 className="size-4" aria-hidden="true" />
          Pessoa Jurídica
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <CarrierDetailField
            label="Razão social"
            value={carrier.companyName}
          />
          <CarrierDetailField label="CNPJ" value={carrier.cnpj} />
          <CarrierDetailField
            label="Inscrição estadual"
            value={carrier.stateRegistration}
          />
          <CarrierDetailField
            label="Inscrição municipal"
            value={carrier.municipalRegistration}
          />
          <CarrierDetailField label="Nome fantasia" value={carrier.tradeName} />
          <CarrierDetailField
            label="Data do CNPJ"
            value={formatCarrierDetailDate(carrier.cnpjDate)}
          />
        </dl>
      </CardContent>
    </Card>
  );
}
